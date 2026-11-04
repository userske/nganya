import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NomineeVoteClient } from "@/components/voting/NomineeVoteClient";
import { createClient } from "@/lib/supabase/server";
import rawData from "@/lib/seed/categories_seed.json";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

function slugToUuid(slug: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < slug.length; i++) {
    const ch = slug.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  const hex =
    (h1 >>> 0).toString(16).padStart(8, "0") +
    (h2 >>> 0).toString(16).padStart(8, "0") +
    (Math.imul(h1, 31) >>> 0).toString(16).padStart(8, "0") +
    (Math.imul(h2, 37) >>> 0).toString(16).padStart(8, "0");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function extractSubtitle(nomineeStr: string): { name: string; subtitle: string | null } {
  const trimmed = nomineeStr.trim();
  const parenMatch = trimmed.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    return { name: parenMatch[1].trim(), subtitle: parenMatch[2].trim() };
  }
  const dashMatch = trimmed.match(/^(.+?)\s*[-–]\s*(.+)$/);
  if (dashMatch) {
    return { name: dashMatch[1].trim(), subtitle: dashMatch[2].trim() };
  }
  return { name: trimmed, subtitle: null };
}

export default async function CategoryVotePage({ params }: PageProps) {
  const { categorySlug } = await params;
  const supabase = await createClient();

  // 1. Fetch category from database using public anon client
  let catDb: any = null;
  let nomDb: any[] = [];
  try {
    const { data: categoryRow } = await supabase
      .from("categories")
      .select("id, slug, name, group_name, description, is_active")
      .eq("slug", categorySlug)
      .maybeSingle();

    if (categoryRow) {
      catDb = categoryRow;
      const { data: nomineesData } = await supabase
        .from("nominees")
        .select("id, name, subtitle, image_url, sort_order, is_active")
        .eq("category_id", categoryRow.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      nomDb = nomineesData ?? [];
    }
  } catch (err) {
    console.error("Category lookup error:", err);
  }

  let categoryData: any = null;

  if (catDb) {
    categoryData = {
      ...catDb,
      nominees: nomDb,
    };
  } else {
    // Fallback: look up in categories_seed.json
    const found = (rawData as any[]).find((c) => c.slug === categorySlug);
    if (!found) {
      notFound();
    }

    const catUuid = slugToUuid(found.slug);
    const fallbackNominees = (found.nominees || []).map((rawNom: string, i: number) => {
      const { name, subtitle } = extractSubtitle(rawNom);
      const nomUuid = slugToUuid(`${found.slug}-${name}-${i}`);
      return {
        id: nomUuid,
        category_id: catUuid,
        name,
        subtitle,
        image_url: null,
        sort_order: i + 1,
        is_active: true,
      };
    });

    categoryData = {
      id: catUuid,
      slug: found.slug,
      name: found.name,
      group_name: "Special Awards",
      nominees: fallbackNominees,
    };
  }

  if (!categoryData) {
    notFound();
  }

  // 2. Fetch initial vote counts for this category
  const initialCounts: Record<string, number> = {};
  try {
    const { data: dbCounts } = await supabase
      .from("vote_counts")
      .select("nominee_id, count")
      .eq("category_id", categoryData.id);

    if (dbCounts && Array.isArray(dbCounts) && dbCounts.length > 0) {
      for (const c of dbCounts) {
        initialCounts[c.nominee_id] = Number(c.count);
      }
    }
  } catch (countsErr) {
    console.error("Counts lookup error in CategoryVotePage:", countsErr);
  }

  // 3. Fetch voter's existing vote if logged in
  let existingVoteNomineeId: string | null = null;
  let user: any = null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    user = userData?.user ?? null;

    if (user) {
      const { data: existingVote } = await supabase
        .from("votes")
        .select("nominee_id")
        .eq("category_id", categoryData.id)
        .eq("voter_id", user.id)
        .eq("voided", false)
        .maybeSingle();

      if (existingVote) {
        existingVoteNomineeId = existingVote.nominee_id;
      }
    }
  } catch (userErr) {
    console.error("User existing vote error:", userErr);
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <NomineeVoteClient
          category={categoryData}
          nominees={categoryData.nominees || []}
          initialCounts={initialCounts}
          existingVoteNomineeId={existingVoteNomineeId}
          isAuthenticated={Boolean(user)}
          userEmail={user?.email}
        />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
