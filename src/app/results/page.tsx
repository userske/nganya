import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ResultsClientView } from "@/components/voting/ResultsClientView";
import { createPublicClient } from "@/lib/supabase/server";
import rawData from "@/lib/seed/categories_seed.json";

export const revalidate = 60; // Cache on Cloudflare edge CDN, revalidate every 60s

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

export default async function ResultsPage() {
  let categories: any[] = [];
  const initialCounts: Record<string, number> = {};

  try {
    const supabase = createPublicClient();

    // Fetch active categories and non-zero vote counts in parallel without touching cookies
    const [categoriesRes, countsRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, slug, name, group_name, is_active, nominees!nominees_category_id_fkey(id, name, subtitle, sort_order)")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("vote_counts")
        .select("nominee_id, count")
        .gt("count", 0),
    ]);

    if (!categoriesRes.error && categoriesRes.data && categoriesRes.data.length > 0) {
      categories = categoriesRes.data.map((c: any) => ({
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
    }

    if (!countsRes.error && countsRes.data && Array.isArray(countsRes.data)) {
      for (const row of countsRes.data) {
        const val = Number(row.count);
        if (val > 0) {
          initialCounts[row.nominee_id] = val;
        }
      }
    }
  } catch (err) {
    console.error("[ResultsPage DB error]:", err);
  }

  // Fallback to local categories_seed.json if DB categories empty
  if (categories.length === 0) {
    categories = (rawData as any[]).map((c) => ({
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
      nominees: (c.nominees || []).map((rawNom: string, nIdx: number) => {
        const { name, subtitle } = extractSubtitle(rawNom);
        return {
          id: slugToUuid(`${c.slug}-${name}-${nIdx}`),
          name,
          subtitle,
          categoryId: slugToUuid(c.slug),
        };
      }),
    }));
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
