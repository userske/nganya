import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NomineeVoteClient } from "@/components/voting/NomineeVoteClient";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

export const revalidate = 0; // Dynamic for live voting state

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

function getLocalCategoryBySlug(slug: string) {
  try {
    const seedPath = path.join(process.cwd(), "supabase/seed/categories_seed.json");
    if (fs.existsSync(seedPath)) {
      const raw = JSON.parse(fs.readFileSync(seedPath, "utf8"));
      const found = raw.find((c: any) => c.slug === slug);
      if (found) {
        return {
          id: `local-${found.slug}`,
          slug: found.slug,
          name: found.name,
          group_name: found.name.toLowerCase().includes("mombasa 1")
            ? "Nganya – Mombasa 1"
            : found.name.toLowerCase().includes("jomvu")
            ? "Nganya – Jomvu"
            : found.name.toLowerCase().includes("kisauni")
            ? "Nganya – Kisauni"
            : found.name.toLowerCase().includes("mikindani")
            ? "Nganya – Mikindani"
            : found.name.toLowerCase().includes("likoni")
            ? "Nganya – Likoni"
            : found.name.toLowerCase().includes("driver") || found.name.toLowerCase().includes("conductor")
            ? "Drivers & Conductors"
            : "Special Awards",
          description: null,
          nominees: (found.nominees || []).map((name: string, i: number) => {
            const parenMatch = name.trim().match(/^(.+?)\s*\(([^)]+)\)$/);
            const dashMatch = name.trim().match(/^(.+?)\s*[-–]\s*(.+)$/);
            let parsedName = name.trim();
            let subtitle = null;
            if (parenMatch) {
              parsedName = parenMatch[1].trim();
              subtitle = parenMatch[2].trim();
            } else if (dashMatch) {
              parsedName = dashMatch[1].trim();
              subtitle = dashMatch[2].trim();
            }
            return {
              id: `nom-${found.slug}-${i + 1}`,
              name: parsedName,
              subtitle,
              image_url: null,
              sort_order: i + 1,
            };
          }),
        };
      }
    }
  } catch (e) {
    console.error("Local fallback error:", e);
  }
  return null;
}

export default async function CategoryVotePage({ params }: PageProps) {
  const { categorySlug } = await params;
  const supabase = await createClient();

  // 1. Fetch category from database
  let categoryData: any = null;
  const { data: catDb } = (await supabase
    .from("categories")
    .select("id, slug, name, group_name, description, is_active")
    .eq("slug", categorySlug)
    .single()) as any;

  if (catDb) {
    if (!catDb.is_active) {
      notFound();
    }
    // Fetch nominees
    const { data: nomDb } = (await supabase
      .from("nominees")
      .select("id, name, subtitle, image_url, sort_order, is_active")
      .eq("category_id", catDb.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })) as any;

    categoryData = {
      ...catDb,
      nominees: nomDb ?? [],
    };
  } else {
    // Seed fallback
    categoryData = getLocalCategoryBySlug(categorySlug);
  }

  if (!categoryData || !categoryData.nominees || categoryData.nominees.length === 0) {
    notFound();
  }

  // 2. Fetch initial vote counts for this category
  const initialCounts: Record<string, number> = {};
  const { data: dbCounts } = (await supabase
    .from("vote_counts")
    .select("nominee_id, count")
    .eq("category_id", categoryData.id)) as any;

  if (dbCounts && Array.isArray(dbCounts)) {
    for (const c of dbCounts) {
      initialCounts[c.nominee_id] = Number(c.count);
    }
  }

  // 3. Fetch voter's existing vote if logged in
  let existingVoteNomineeId: string | null = null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: userVote } = (await supabase
      .from("votes")
      .select("nominee_id")
      .eq("voter_id", user.id)
      .eq("category_id", categoryData.id)
      .eq("voided", false)
      .maybeSingle()) as any;

    if (userVote) {
      existingVoteNomineeId = userVote.nominee_id;
    }
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <NomineeVoteClient
          category={categoryData}
          nominees={categoryData.nominees}
          initialCounts={initialCounts}
          existingVoteNomineeId={existingVoteNomineeId}
          isAuthenticated={Boolean(user)}
          userEmail={user?.email}
        />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
