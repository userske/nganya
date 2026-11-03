import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VoteClientView } from "@/components/voting/VoteClientView";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { seedDatabaseFromLocalJson } from "@/lib/seed/seed-db";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const supabase = await createClient();

  // 1. Fetch active categories
  let { data: dbCategories, error: catError } = await supabase
    .from("categories")
    .select("id, slug, name, group_name, sort_order, is_active, nominees(count)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // If no categories in DB yet, auto-seed the database
  if (!dbCategories || dbCategories.length === 0) {
    await seedDatabaseFromLocalJson();

    const adminClient = await createAdminClient();
    const { data: refreshedCats } = await adminClient
      .from("categories")
      .select("id, slug, name, group_name, sort_order, is_active, nominees(count)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    dbCategories = refreshedCats || [];
  }

  const categories = (dbCategories || []).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    group_name: c.group_name ?? "General",
    sort_order: c.sort_order,
    is_active: c.is_active,
    nominees_count: c.nominees?.[0]?.count ?? 0,
  }));

  // 2. Fetch logged-in user's cast votes
  let userVotesMap: Record<string, string> = {};
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: userVotes } = await supabase
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <VoteClientView
          categories={categories}
          userVotesMap={userVotesMap}
          isAuthenticated={Boolean(user)}
        />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
