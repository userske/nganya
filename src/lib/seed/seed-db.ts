import { createAdminClient } from "@/lib/supabase/server";
import rawData from "./categories_seed.json";

interface RawCategory {
  name: string;
  slug: string;
  sort_order: number;
  nominees: string[];
}

function assignGroup(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  if (lower.includes("mombasa 1")) return "Nganya – Mombasa 1";
  if (lower.includes("jomvu")) return "Nganya – Jomvu";
  if (lower.includes("kisauni")) return "Nganya – Kisauni";
  if (lower.includes("mikindani")) return "Nganya – Mikindani";
  if (lower.includes("likoni")) return "Nganya – Likoni";
  if (lower.includes("driver") || lower.includes("conductor")) return "Drivers & Conductors";
  if (
    lower.includes("sacco") ||
    lower.includes("sound") ||
    lower.includes("airbrush") ||
    lower.includes("fabrication") ||
    lower.includes("media") ||
    lower.includes("garage") ||
    lower.includes("body work") ||
    lower.includes("accessories") ||
    lower.includes("crew") ||
    lower.includes("business")
  ) {
    return "Business & Services";
  }
  return "Special Awards";
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

export async function seedDatabaseFromLocalJson() {
  const adminClient = await createAdminClient();

  const categoriesToSeed = (rawData as RawCategory[]).map((cat) => {
    const groupName = assignGroup(cat.name);
    const hasNominees = Array.isArray(cat.nominees) && cat.nominees.length > 0;
    const emptyDeactivate = [
      "mombasa-1-matatu",
      "best-driver-mombasa",
      "best-conductor-mombasa",
    ];
    return {
      slug: cat.slug,
      name: cat.name,
      group_name: groupName,
      sort_order: cat.sort_order,
      is_active: hasNominees && !emptyDeactivate.includes(cat.slug),
    };
  });

  // 1. Batch upsert all categories in one query
  const { data: insertedCategories, error: catError } = await adminClient
    .from("categories")
    .upsert(categoriesToSeed, { onConflict: "slug" })
    .select("id, slug");

  if (catError || !insertedCategories) {
    console.error("Categories batch upsert error:", catError);
    return { success: false, error: catError?.message || "Failed to upsert categories" };
  }

  const categoryIdMap = new Map<string, string>();
  for (const c of insertedCategories) {
    categoryIdMap.set(c.slug, c.id);
  }

  // 2. Prepare all nominees
  const allNominees: {
    category_id: string;
    name: string;
    subtitle: string | null;
    sort_order: number;
    is_active: boolean;
  }[] = [];

  for (const cat of rawData as RawCategory[]) {
    const catId = categoryIdMap.get(cat.slug);
    if (!catId || !Array.isArray(cat.nominees)) continue;

    for (let i = 0; i < cat.nominees.length; i++) {
      const { name, subtitle } = extractSubtitle(cat.nominees[i]);
      allNominees.push({
        category_id: catId,
        name,
        subtitle,
        sort_order: i + 1,
        is_active: true,
      });
    }
  }

  // 3. Batch upsert nominees in chunks of 100 for high performance
  const insertedNominees: { id: string; category_id: string }[] = [];
  const chunkSize = 100;

  for (let i = 0; i < allNominees.length; i += chunkSize) {
    const chunk = allNominees.slice(i, i + chunkSize);
    const { data: nomData, error: nomError } = await adminClient
      .from("nominees")
      .upsert(chunk, { onConflict: "category_id,name" })
      .select("id, category_id");

    if (nomError) {
      console.error("Nominees chunk error:", nomError);
    } else if (nomData) {
      insertedNominees.push(...nomData);
    }
  }

  // 4. Batch initialize vote_counts rows with ignoreDuplicates: true
  // This ensures existing vote counts are NEVER overwritten or zeroed out
  const voteCounts = insertedNominees.map((n) => ({
    category_id: n.category_id,
    nominee_id: n.id,
    count: 0,
  }));

  for (let i = 0; i < voteCounts.length; i += chunkSize) {
    const chunk = voteCounts.slice(i, i + chunkSize);
    await adminClient
      .from("vote_counts")
      .upsert(chunk, { onConflict: "category_id,nominee_id", ignoreDuplicates: true });
  }

  // 4b. Reconcile vote_counts with all verified votes in the votes table
  try {
    const { data: validVotes } = await adminClient
      .from("votes")
      .select("category_id, nominee_id")
      .eq("voided", false)
      .limit(50000);

    if (validVotes && validVotes.length > 0) {
      const tallyMap: Record<string, { category_id: string; nominee_id: string; count: number }> = {};
      for (const v of validVotes) {
        const key = `${v.category_id}|${v.nominee_id}`;
        if (!tallyMap[key]) {
          tallyMap[key] = { category_id: v.category_id, nominee_id: v.nominee_id, count: 0 };
        }
        tallyMap[key].count += 1;
      }

      const updates = Object.values(tallyMap);
      for (let i = 0; i < updates.length; i += chunkSize) {
        const chunk = updates.slice(i, i + chunkSize);
        await adminClient
          .from("vote_counts")
          .upsert(chunk, { onConflict: "category_id,nominee_id" });
      }
    }
  } catch (reconcileErr) {
    console.error("[seedDatabase] Vote counts reconciliation error:", reconcileErr);
  }

  // 5. Ensure ticket tiers exist
  await adminClient.from("ticket_tiers").upsert(
    [
      {
        name: "Early Bird Regular",
        description: "Standard event admission with main acoustic arena access.",
        price_kes: 500,
        capacity: 500,
        perks: ["Event Entry", "Standard Seating", "Live Sound Access"],
        sort_order: 1,
        is_active: true,
      },
      {
        name: "VIP Lounge Pass",
        description: "Priority entrance, VIP lounge seating & complimentary drink.",
        price_kes: 3500,
        capacity: 150,
        perks: ["VIP Red Carpet Entry", "Front Stage Access", "Complimentary Drink Voucher", "Official Event Badge"],
        sort_order: 2,
        is_active: true,
      },
      {
        name: "VVIP Table of 5",
        description: "Reserved high-profile table for 5 with bottle service & parking pass.",
        price_kes: 30000,
        capacity: 30,
        perks: ["Reserved Table of 5", "Dedicated Host Service", "Full Bottle Service & Platter", "Backstage & VIP Parking Passes"],
        sort_order: 3,
        is_active: true,
      },
    ],
    { onConflict: "name" }
  );

  return {
    success: true,
    categoriesCount: insertedCategories.length,
    nomineesCount: insertedNominees.length,
  };
}
