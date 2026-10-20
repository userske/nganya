import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ResultsClientView } from "@/components/voting/ResultsClientView";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

export const revalidate = 10; // ISR 10 seconds for initial server payload

function getLocalCategoriesWithNominees() {
  try {
    const seedPath = path.join(process.cwd(), "supabase/seed/categories_seed.json");
    if (fs.existsSync(seedPath)) {
      const raw = JSON.parse(fs.readFileSync(seedPath, "utf8"));
      return raw
        .filter((c: any) => Array.isArray(c.nominees) && c.nominees.length > 0)
        .map((c: any) => ({
          id: `local-${c.slug}`,
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
          nominees: c.nominees.map((n: string, i: number) => {
            const parenMatch = n.trim().match(/^(.+?)\s*\(([^)]+)\)$/);
            const dashMatch = n.trim().match(/^(.+?)\s*[-–]\s*(.+)$/);
            let parsedName = n.trim();
            let subtitle = null;
            if (parenMatch) {
              parsedName = parenMatch[1].trim();
              subtitle = parenMatch[2].trim();
            } else if (dashMatch) {
              parsedName = dashMatch[1].trim();
              subtitle = dashMatch[2].trim();
            }
            return {
              id: `nom-${c.slug}-${i + 1}`,
              name: parsedName,
              subtitle,
              categoryId: `local-${c.slug}`,
            };
          }),
        }));
    }
  } catch (e) {
    console.error("Local categories read error:", e);
  }
  return [];
}

export default async function ResultsPage() {
  const supabase = await createClient();

  let categories: any[] = [];
  const initialCounts: Record<string, number> = {};

  // Fetch categories with nominees
  const { data: dbCategories } = await supabase
    .from("categories")
    .select("id, slug, name, group_name, is_active, nominees(id, name, subtitle, sort_order)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (dbCategories && dbCategories.length > 0) {
    categories = dbCategories.map((c: any) => ({
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
  } else {
    categories = getLocalCategoriesWithNominees();
  }

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
