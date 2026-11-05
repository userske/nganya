import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NomineeVoteClient } from "@/components/voting/NomineeVoteClient";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { seedDatabaseFromLocalJson } from "@/lib/seed/seed-db";
import rawData from "@/lib/seed/categories_seed.json";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

function slugToUuid(slug: string): string {
  const hash = crypto.createHash("md5").update(slug).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
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
  const adminClient = await createAdminClient();

  // 1. Fetch category from database using adminClient to bypass RLS issues
  let { data: catDb } = (await adminClient
    .from("categories")
    .select("id, slug, name, group_name, description, is_active")
    .eq("slug", categorySlug)
    .maybeSingle()) as any;

  // If category not found in DB, auto-seed the database
  if (!catDb) {
    try {
      await seedDatabaseFromLocalJson();

      const { data: refreshedCat } = (await adminClient
        .from("categories")
        .select("id, slug, name, group_name, description, is_active")
        .eq("slug", categorySlug)
        .maybeSingle()) as any;

      catDb = refreshedCat;
    } catch (e) {
      console.error("Auto-seed error in CategoryVotePage:", e);
    }
  }

  let categoryData: any = null;

  if (catDb) {
    // Fetch real nominees from DB
    const { data: nomDb } = (await adminClient
      .from("nominees")
      .select("id, name, subtitle, image_url, sort_order, is_active")
      .eq("category_id", catDb.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })) as any;

    categoryData = {
      ...catDb,
      nominees: nomDb ?? [],
    };
  } else {
    // Fallback: look up in categories_seed.json and ensure DB has real rows with valid UUIDs
    const found = (rawData as any[]).find((c) => c.slug === categorySlug);
    if (!found) {
      notFound();
    }

    const catUuid = slugToUuid(found.slug);

    // Upsert fallback category with valid UUID into DB
    await adminClient.from("categories").upsert(
      {
        id: catUuid,
        slug: found.slug,
        name: found.name,
        group_name: "Special Awards",
        sort_order: found.sort_order ?? 1,
        is_active: true,
      },
      { onConflict: "slug" }
    );

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

    // Upsert nominees with valid UUIDs into DB so cast_vote FK constraint passes
    await adminClient
      .from("nominees")
      .upsert(fallbackNominees, { onConflict: "category_id,name" });

    categoryData = {
      id: catUuid,
      slug: found.slug,
      name: found.name,
      group_name: "Special Awards",
      nominees: fallbackNominees,
    };
  }

  if (!categoryData || !categoryData.nominees || categoryData.nominees.length === 0) {
    notFound();
  }

  // 2. Fetch initial vote counts for this category
  const initialCounts: Record<string, number> = {};
  const { data: dbCounts } = (await adminClient
    .from("vote_counts")
    .select("nominee_id, count")
    .eq("category_id", categoryData.id)) as any;

  if (dbCounts && Array.isArray(dbCounts) && dbCounts.length > 0) {
    for (const c of dbCounts) {
      initialCounts[c.nominee_id] = Number(c.count);
    }
  } else {
    // Fallback: calculate from raw votes table
    const { data: rawVotes } = (await adminClient
      .from("votes")
      .select("nominee_id")
      .eq("category_id", categoryData.id)
      .eq("voided", false)) as any;

    if (rawVotes && Array.isArray(rawVotes)) {
      for (const v of rawVotes) {
        initialCounts[v.nominee_id] = (initialCounts[v.nominee_id] ?? 0) + 1;
      }
    }
  }

  // 3. Fetch voter's existing vote if logged in
  let existingVoteNomineeId: string | null = null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: userVote } = (await adminClient
      .from("votes")
      .select("nominee_id")
      .eq("voter_id", user.id)
      .eq("category_id", categoryData.id)
      .eq("voided", false)
      .maybeSingle()) as any;

    if (userVote) {
      existingVoteNomineeId = userVote.nominee_id;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <NomineeVoteClient
          category={categoryData}
          nominees={categoryData.nominees}
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
