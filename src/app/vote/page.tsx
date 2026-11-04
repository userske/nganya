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
  const supabase = await createClient();

  // 1. Fetch active categories from database with public anon client
  let dbCategories: any[] = [];
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, group_name, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      dbCategories = data;
    }
  } catch (err) {
    console.error("Categories lookup error in VotePage:", err);
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
    // Generate valid categories from local seed JSON
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
  let user: any = null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    user = userData?.user ?? null;

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
  } catch (userErr) {
    console.error("User lookup error in VotePage:", userErr);
  }

  // 3. Fetch category vote tallies
  const categoryVotesMap: Record<string, number> = {};
  try {
    const { data: dbVoteCounts } = await supabase
      .from("vote_counts")
      .select("category_id, count");

    if (dbVoteCounts && Array.isArray(dbVoteCounts) && dbVoteCounts.length > 0) {
      for (const row of dbVoteCounts) {
        categoryVotesMap[row.category_id] =
          (categoryVotesMap[row.category_id] ?? 0) + Number(row.count);
      }
    }
  } catch (countsErr) {
    console.error("Vote counts error in VotePage:", countsErr);
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
