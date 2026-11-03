import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NomineeVoteClient } from "@/components/voting/NomineeVoteClient";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { seedDatabaseFromLocalJson } from "@/lib/seed/seed-db";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

export default async function CategoryVotePage({ params }: PageProps) {
  const { categorySlug } = await params;
  const supabase = await createClient();

  // 1. Fetch category from database
  let { data: catDb } = (await supabase
    .from("categories")
    .select("id, slug, name, group_name, description, is_active")
    .eq("slug", categorySlug)
    .maybeSingle()) as any;

  // If category not found in DB, auto-seed the database from categories_seed.json
  if (!catDb) {
    await seedDatabaseFromLocalJson();

    const adminClient = await createAdminClient();
    const { data: refreshedCat } = (await adminClient
      .from("categories")
      .select("id, slug, name, group_name, description, is_active")
      .eq("slug", categorySlug)
      .maybeSingle()) as any;

    catDb = refreshedCat;
  }

  if (!catDb || !catDb.is_active) {
    notFound();
  }

  // Fetch real nominees from DB with valid UUIDs
  const { data: nomDb } = (await supabase
    .from("nominees")
    .select("id, name, subtitle, image_url, sort_order, is_active")
    .eq("category_id", catDb.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })) as any;

  const categoryData = {
    ...catDb,
    nominees: nomDb ?? [],
  };

  if (!categoryData.nominees || categoryData.nominees.length === 0) {
    notFound();
  }

  // 2. Fetch initial vote counts for this category
  const initialCounts: Record<string, number> = {};
  const { data: dbCounts } = (await supabase
    .from("vote_counts")
    .select("nominee_id, count")
    .eq("category_id", categoryData.id)) as any;

  if (dbCounts && Array.isArray(dbCounts)) {
    for (const c of dbCounts) {
      initialCounts[c.nominee_id] = Number(c.count);
    }
  }

  // 3. Fetch voter's existing vote if logged in
  let existingVoteNomineeId: string | null = null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: userVote } = (await supabase
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
