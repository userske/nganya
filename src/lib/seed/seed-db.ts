import { createAdminClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

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

  const seedFilePath = path.join(process.cwd(), "supabase/seed/categories_seed.json");
  if (!fs.existsSync(seedFilePath)) {
    console.error("categories_seed.json not found");
    return { success: false, error: "Seed file not found" };
  }

  const rawData: RawCategory[] = JSON.parse(fs.readFileSync(seedFilePath, "utf8"));

  const emptyCategoriesToDeactivate = [
    "mombasa-1-matatu",
    "best-driver-mombasa",
    "best-conductor-mombasa",
  ];

  let seededCategories = 0;
  let seededNominees = 0;

  for (const cat of rawData) {
    const groupName = assignGroup(cat.name);
    const hasNominees = Array.isArray(cat.nominees) && cat.nominees.length > 0;
    const isActive = hasNominees && !emptyCategoriesToDeactivate.includes(cat.slug);

    // Upsert Category
    const { data: catData, error: catError } = await adminClient
      .from("categories")
      .upsert(
        {
          slug: cat.slug,
          name: cat.name,
          group_name: groupName,
          sort_order: cat.sort_order,
          is_active: isActive,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (catError || !catData) {
      console.error(`Error seeding category ${cat.name}:`, catError?.message);
      continue;
    }

    seededCategories++;

    // Upsert Nominees for this Category
    if (hasNominees) {
      for (let i = 0; i < cat.nominees.length; i++) {
        const rawNom = cat.nominees[i];
        const { name, subtitle } = extractSubtitle(rawNom);

        const { data: nomData, error: nomError } = await adminClient
          .from("nominees")
          .upsert(
            {
              category_id: catData.id,
              name,
              subtitle,
              sort_order: i + 1,
              is_active: true,
            },
            { onConflict: "category_id,name" }
          )
          .select("id")
          .single();

        if (!nomError && nomData) {
          seededNominees++;

          // Initialize vote_counts
          await adminClient
            .from("vote_counts")
            .upsert(
              {
                category_id: catData.id,
                nominee_id: nomData.id,
                count: 0,
              },
              { onConflict: "category_id,nominee_id" }
            );
        }
      }
    }
  }

  // Ensure default ticket tiers exist
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
    categoriesCount: seededCategories,
    nomineesCount: seededNominees,
  };
}
