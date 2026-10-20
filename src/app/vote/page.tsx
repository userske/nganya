import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VoteClientView } from "@/components/voting/VoteClientView";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

export const revalidate = 0; // Dynamic for personalized vote state

interface FallbackCategory {
  id: string;
  slug: string;
  name: string;
  group_name: string;
  sort_order: number;
  is_active: boolean;
  nominees: string[];
}

function getLocalSeedCategories(): any[] {
  try {
    const seedPath = path.join(process.cwd(), "supabase/seed/categories_seed.json");
    if (fs.existsSync(seedPath)) {
      const raw = JSON.parse(fs.readFileSync(seedPath, "utf8"));
      return raw.map((c: any, idx: number) => ({
        id: `local-${c.slug}`,
        slug: c.slug,
        name: c.name,
        sort_order: c.sort_order ?? idx + 1,
        is_active: Array.isArray(c.nominees) && c.nominees.length > 0,
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
        nominees_count: Array.isArray(c.nominees) ? c.nominees.length : 0,
      }));
    }
  } catch (e) {
    console.error("Local seed read error:", e);
  }
  return [];
}

export default async function VotePage() {
  const supabase = await createClient();

  // 1. Fetch active categories
  let categories: any[] = [];
  const { data: dbCategories, error: catError } = await supabase
    .from("categories")
    .select("id, slug, name, group_name, sort_order, is_active, nominees(count)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (!catError && dbCategories && dbCategories.length > 0) {
    categories = dbCategories.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      group_name: c.group_name,
      sort_order: c.sort_order,
      nominees_count: c.nominees?.[0]?.count ?? 0,
    }));
  } else {
    // Graceful fallback to seeded categories if DB connection is being provisioned
    categories = getLocalSeedCategories().filter((c) => c.is_active);
  }

  // 2. Fetch current voter's existing votes
  let userVotesMap: Record<string, string> = {}; // category_id -> nominee_name
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: myVotes } = (await supabase.rpc("my_votes")) as { data: any[] | null };
    if (myVotes && Array.isArray(myVotes)) {
      for (const v of myVotes) {
        userVotesMap[v.category_id] = v.nominee_name;
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
          isAuthenticated={Boolean(user)}
          userEmail={user?.email}
        />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
