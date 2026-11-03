import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ResultsClientView } from "@/components/voting/ResultsClientView";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { seedDatabaseFromLocalJson } from "@/lib/seed/seed-db";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const supabase = await createClient();

  let categories: any[] = [];
  const initialCounts: Record<string, number> = {};

  // Fetch categories with nominees
  let { data: dbCategories } = await supabase
    .from("categories")
    .select("id, slug, name, group_name, is_active, nominees(id, name, subtitle, sort_order)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // If DB not seeded, auto-seed it
  if (!dbCategories || dbCategories.length === 0) {
    await seedDatabaseFromLocalJson();

    const adminClient = await createAdminClient();
    const { data: refreshed } = await adminClient
      .from("categories")
      .select("id, slug, name, group_name, is_active, nominees(id, name, subtitle, sort_order)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    dbCategories = refreshed || [];
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
  const { data: dbCounts } = await supabase
    .from("vote_counts")
    .select("nominee_id, count");

  if (dbCounts) {
    for (const c of (dbCounts as any[])) {
      initialCounts[c.nominee_id] = Number(c.count);
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
