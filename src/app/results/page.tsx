import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ResultsClientView } from "@/components/voting/ResultsClientView";
import { createAdminClient } from "@/lib/supabase/server";
import { seedDatabaseFromLocalJson } from "@/lib/seed/seed-db";
import rawData from "@/lib/seed/categories_seed.json";
import crypto from "crypto";

export const dynamic = "force-dynamic";

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

export default async function ResultsPage() {
  const adminClient = await createAdminClient();

  // 1. Fetch categories from DB
  let { data: dbCategories } = await adminClient
    .from("categories")
    .select("id, slug, name, group_name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // 2. Fetch nominees from DB in separate flat query (avoids nested schema cache failures)
  let { data: dbNominees } = await adminClient
    .from("nominees")
    .select("id, category_id, name, subtitle, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // If categories or nominees empty, auto-seed and refetch
  if (!dbCategories || dbCategories.length === 0 || !dbNominees || dbNominees.length === 0) {
    try {
      await seedDatabaseFromLocalJson();

      const { data: refCats } = await adminClient
        .from("categories")
        .select("id, slug, name, group_name, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      const { data: refNoms } = await adminClient
        .from("nominees")
        .select("id, category_id, name, subtitle, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      dbCategories = refCats || [];
      dbNominees = refNoms || [];
    } catch (e) {
      console.error("[ResultsPage seed error]:", e);
    }
  }

  // 3. Assemble categories with their nominees
  let categories: any[] = [];

  if (dbCategories && dbCategories.length > 0) {
    const nomineeMap = new Map<string, any[]>();
    for (const n of dbNominees || []) {
      const list = nomineeMap.get(n.category_id) || [];
      list.push({
        id: n.id,
        name: n.name,
        subtitle: n.subtitle,
        categoryId: n.category_id,
        sortOrder: n.sort_order,
      });
      nomineeMap.set(n.category_id, list);
    }

    categories = dbCategories
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        group_name: c.group_name ?? "Special Awards",
        sort_order: c.sort_order,
        nominees: nomineeMap.get(c.id) || [],
      }))
      .filter((c) => c.nominees.length > 0);
  }

  // 4. Robust fallback: if DB returned zero categories/nominees, build directly from categories_seed.json
  if (categories.length === 0) {
    categories = (rawData as any[])
      .filter((c) => Array.isArray(c.nominees) && c.nominees.length > 0)
      .map((c, idx) => {
        const catUuid = slugToUuid(c.slug);
        return {
          id: catUuid,
          slug: c.slug,
          name: c.name,
          group_name: c.group_name || "Special Awards",
          sort_order: c.sort_order ?? idx + 1,
          nominees: (c.nominees || []).map((nomStr: string, i: number) => {
            const { name, subtitle } = extractSubtitle(nomStr);
            return {
              id: slugToUuid(`${c.slug}-${name}-${i}`),
              name,
              subtitle,
              categoryId: catUuid,
              sortOrder: i + 1,
            };
          }),
        };
      });
  }

  // 5. Fetch current vote counts
  const initialCounts: Record<string, number> = {};

  const { data: dbCounts } = await adminClient
    .from("vote_counts")
    .select("nominee_id, count");

  if (dbCounts && Array.isArray(dbCounts) && dbCounts.length > 0) {
    for (const c of dbCounts as any[]) {
      initialCounts[c.nominee_id] = Number(c.count);
    }
  }

  // Also query raw votes table for any uncounted tallies
  const { data: rawVotes } = await adminClient
    .from("votes")
    .select("nominee_id")
    .eq("voided", false);

  if (rawVotes && Array.isArray(rawVotes)) {
    for (const v of rawVotes) {
      if (initialCounts[v.nominee_id] === undefined) {
        initialCounts[v.nominee_id] = (initialCounts[v.nominee_id] ?? 0) + 1;
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
        <ResultsClientView
          categories={categories}
          initialCounts={initialCounts}
        />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
