import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NomineeVoteClient } from "@/components/voting/NomineeVoteClient";
import { createPublicClient } from "@/lib/supabase/server";
import rawData from "@/lib/seed/categories_seed.json";

export const revalidate = 60; // Cache on Cloudflare edge CDN, revalidate every 60s

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
  let categoryData: any = null;
  const initialCounts: Record<string, number> = {};

  try {
    const supabase = createPublicClient();

    // Fetch category with nominees in a single join query without touching cookies
    const { data: cat, error } = await supabase
      .from("categories")
      .select("id, slug, name, group_name, description, is_active, nominees!nominees_category_id_fkey(id, name, subtitle, image_url, sort_order, is_active)")
      .eq("slug", categorySlug)
      .maybeSingle();

    if (!error && cat) {
      const validNominees = (cat.nominees || [])
        .filter((n: any) => n.is_active !== false)
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      categoryData = {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        group_name: cat.group_name,
        description: cat.description,
        is_active: cat.is_active,
        nominees: validNominees,
      };

      // Fetch vote counts for this specific category (non-zero only)
      const { data: dbCounts } = await supabase
        .from("vote_counts")
        .select("nominee_id, count")
        .eq("category_id", cat.id)
        .gt("count", 0);

      if (dbCounts && Array.isArray(dbCounts)) {
        for (const c of dbCounts) {
          const val = Number(c.count);
          if (val > 0) initialCounts[c.nominee_id] = val;
        }
      }
    }
  } catch (err) {
    console.error("Error in CategoryVotePage:", err);
  }

  // Fallback: look up in categories_seed.json if not found in DB
  if (!categoryData) {
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <NomineeVoteClient
          category={categoryData}
          nominees={categoryData.nominees || []}
          initialCounts={initialCounts}
          existingVoteNomineeId={null}
          isAuthenticated={false}
        />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
