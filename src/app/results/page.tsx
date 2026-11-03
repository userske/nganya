import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ResultsClientView } from "@/components/voting/ResultsClientView";
import { createAdminClient } from "@/lib/supabase/server";
import { seedDatabaseFromLocalJson } from "@/lib/seed/seed-db";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const adminClient = await createAdminClient();

  let categories: any[] = [];
  const initialCounts: Record<string, number> = {};

  // Fetch categories with nominees using adminClient
  let { data: dbCategories } = await adminClient
    .from("categories")
    .select("id, slug, name, group_name, is_active, nominees(id, name, subtitle, sort_order)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // If DB not seeded, auto-seed it
  if (!dbCategories || dbCategories.length === 0) {
    try {
      await seedDatabaseFromLocalJson();

      const { data: refreshed } = await adminClient
        .from("categories")
        .select("id, slug, name, group_name, is_active, nominees(id, name, subtitle, sort_order)")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      dbCategories = refreshed || [];
    } catch (e) {
      console.error("[ResultsPage seed error]:", e);
    }
  }

  categories = (dbCategories || []).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    group_name: c.group_name,
    nominees: (c.nominees || []).map((n: any) => ({
      id: n.id,
      name: n.name,
      subtitle: n.subtitle,
      categoryId: c.id,
    })),
  }));

  // Fetch current vote counts
  const { data: dbCounts } = await adminClient
    .from("vote_counts")
    .select("nominee_id, count");

  if (dbCounts && Array.isArray(dbCounts) && dbCounts.length > 0) {
    for (const c of dbCounts as any[]) {
      initialCounts[c.nominee_id] = Number(c.count);
    }
  } else {
    // Fallback: calculate from raw votes table
    const { data: rawVotes } = await adminClient
      .from("votes")
      .select("nominee_id")
      .eq("voided", false);

    if (rawVotes && Array.isArray(rawVotes)) {
      for (const v of rawVotes) {
        initialCounts[v.nominee_id] = (initialCounts[v.nominee_id] ?? 0) + 1;
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <ResultsClientView
          categories={categories}
          initialCounts={initialCounts}
        />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
