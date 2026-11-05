import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VoteClientView } from "@/components/voting/VoteClientView";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { seedDatabaseFromLocalJson } from "@/lib/seed/seed-db";
import rawData from "@/lib/seed/categories_seed.json";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function slugToUuid(slug: string): string {
  const hash = crypto.createHash("md5").update(slug).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export default async function VotePage() {
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  // 1. Fetch active categories from database (without nested aggregate query)
  let { data: dbCategories, error: catError } = await adminClient
    .from("categories")
    .select("id, slug, name, group_name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // If DB categories empty or query failed, seed the database
  if (!dbCategories || dbCategories.length === 0) {
    try {
      await seedDatabaseFromLocalJson();

      const { data: refreshedCats } = await adminClient
        .from("categories")
        .select("id, slug, name, group_name, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      dbCategories = refreshedCats || [];
    } catch (e) {
      console.error("Auto-seed error in VotePage:", e);
    }
  }

  // Fallback to local categories if DB returned empty
  let categories: any[] = [];
  if (dbCategories && dbCategories.length > 0) {
    categories = dbCategories.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      group_name: c.group_name ?? "General",
      sort_order: c.sort_order,
      is_active: c.is_active,
    }));
  } else {
    // Generate valid UUID categories from JSON
    categories = (rawData as any[]).map((c, idx) => ({
      id: slugToUuid(c.slug),
      slug: c.slug,
      name: c.name,
      group_name: c.name.toLowerCase().includes("mombasa 1")
        ? "Nganya – Mombasa 1"
        : c.name.toLowerCase().includes("jomvu")
        ? "Nganya – Jomvu"
        : c.name.toLowerCase().includes("kisauni")
        ? "Nganya – Kisauni"
        : c.name.toLowerCase().includes("mikindani")
        ? "Nganya – Mikindani"
        : c.name.toLowerCase().includes("likoni")
        ? "Nganya – Likoni"
        : c.name.toLowerCase().includes("driver") || c.name.toLowerCase().includes("conductor")
        ? "Drivers & Conductors"
        : "Special Awards",
      sort_order: c.sort_order ?? idx + 1,
      is_active: Array.isArray(c.nominees) && c.nominees.length > 0,
    }));
  }

  // 2. Fetch logged-in user's cast votes
  let userVotesMap: Record<string, string> = {};
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: userVotes } = await adminClient
      .from("votes")
      .select("category_id, nominee_id")
      .eq("voter_id", user.id)
      .eq("voided", false);

    if (userVotes) {
      for (const uv of userVotes) {
        userVotesMap[uv.category_id] = uv.nominee_id;
      }
    }
  }

  // 3. Fetch category vote tallies
  const categoryVotesMap: Record<string, number> = {};
  const { data: dbVoteCounts } = await adminClient
    .from("vote_counts")
    .select("category_id, count");

  if (dbVoteCounts && Array.isArray(dbVoteCounts) && dbVoteCounts.length > 0) {
    for (const row of dbVoteCounts) {
      categoryVotesMap[row.category_id] =
        (categoryVotesMap[row.category_id] ?? 0) + Number(row.count);
    }
  } else {
    const { data: rawVotes } = await adminClient
      .from("votes")
      .select("category_id")
      .eq("voided", false);

    if (rawVotes && Array.isArray(rawVotes)) {
      for (const row of rawVotes) {
        categoryVotesMap[row.category_id] =
          (categoryVotesMap[row.category_id] ?? 0) + 1;
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <VoteClientView
          categories={categories}
          initialUserVotes={userVotesMap}
          initialCategoryVotes={categoryVotesMap}
          isAuthenticated={Boolean(user)}
          userEmail={user?.email}
        />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
