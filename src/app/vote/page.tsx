import { cookies } from "next/headers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VoteClientView } from "@/components/voting/VoteClientView";
import { createClient } from "@/lib/supabase/server";
import rawData from "@/lib/seed/categories_seed.json";

export const dynamic = "force-dynamic";

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

export default async function VotePage() {
  let dbCategories: any[] = [];
  const categoryVotesMap: Record<string, number> = {};
  const userVotesMap: Record<string, string> = {};
  let user: any = null;

  try {
    const supabase = await createClient();

    // Check if voter has session cookies before making auth calls
    const cookieStore = await cookies();
    const hasAuthToken = cookieStore.getAll().some(
      (c) => c.name.includes("auth-token") || c.name.startsWith("sb-")
    );

    // Run public database fetches in parallel
    const promises: [Promise<any>, Promise<any>, Promise<any>?] = [
      supabase
        .from("categories")
        .select("id, slug, name, group_name, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("vote_counts")
        .select("category_id, count")
        .gt("count", 0),
    ];

    if (hasAuthToken) {
      promises.push(supabase.auth.getUser());
    }

    const [categoriesRes, countsRes, authRes] = await Promise.all(promises);

    if (!categoriesRes.error && categoriesRes.data && categoriesRes.data.length > 0) {
      dbCategories = categoriesRes.data;
    }

    if (!countsRes.error && countsRes.data && Array.isArray(countsRes.data)) {
      for (const row of countsRes.data) {
        const val = Number(row.count);
        if (val > 0) {
          categoryVotesMap[row.category_id] =
            (categoryVotesMap[row.category_id] ?? 0) + val;
        }
      }
    }

    if (authRes && authRes.data?.user) {
      user = authRes.data.user;
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
  } catch (err) {
    console.error("Data lookup error in VotePage:", err);
  }

  // Fallback to local categories if DB returned empty
  let categories: any[] = [];
  if (dbCategories.length > 0) {
    categories = dbCategories.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      group_name: c.group_name ?? "General",
      sort_order: c.sort_order,
      is_active: c.is_active,
    }));
  } else {
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
