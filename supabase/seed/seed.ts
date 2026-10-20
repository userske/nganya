import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

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
  // Match patterns like "Posh (KBP)" or "Rickross- kisauni"
  const parenMatch = trimmed.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    return {
      name: parenMatch[1].trim(),
      subtitle: parenMatch[2].trim(),
    };
  }

  const dashMatch = trimmed.match(/^(.+?)\s*[-–]\s*(.+)$/);
  if (dashMatch) {
    return {
      name: dashMatch[1].trim(),
      subtitle: dashMatch[2].trim(),
    };
  }

  return { name: trimmed, subtitle: null };
}

async function runSeed() {
  const seedFilePath = path.join(process.cwd(), "supabase/seed/categories_seed.json");
  if (!fs.existsSync(seedFilePath)) {
    console.error("Seed file not found at:", seedFilePath);
    process.exit(1);
  }

  const rawData: RawCategory[] = JSON.parse(fs.readFileSync(seedFilePath, "utf8"));
  console.log(`Loaded ${rawData.length} categories from categories_seed.json`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Generate pure SQL seed output as well
  let sqlOutput = `-- Auto-generated SQL seed for Coastal Nganya Awards\n`;
  sqlOutput += `-- Generated from categories_seed.json (${rawData.length} categories)\n\n`;

  // Default Event Settings
  sqlOutput += `INSERT INTO event_settings (id, event_name, venue_name, event_date, event_time, tagline)
VALUES (1, 'Coastal Nganya Awards', 'Mombasa Cement, Mombasa', '2025-12-06', '18:00', 'Celebrating the heartbeat of Mombasa''s roads')
ON CONFLICT (id) DO UPDATE SET
  event_name = EXCLUDED.event_name,
  venue_name = EXCLUDED.venue_name;\n\n`;

  // Ticket Tiers
  sqlOutput += `-- Seed Default Ticket Tiers\n`;
  const defaultTiers = [
    {
      name: "Early Bird Regular",
      description: "Standard event admission with main acoustic arena access.",
      price: 1000,
      capacity: 500,
      perks: ["Event Entry", "Standard Seating", "Live Sound Access"],
      sort: 1,
    },
    {
      name: "VIP Lounge Pass",
      description: "Priority entrance, VIP lounge seating & complimentary drink.",
      price: 3500,
      capacity: 150,
      perks: ["VIP Red Carpet Entry", "Front Stage Access", "Complimentary Drink Voucher", "Official Event Badge"],
      sort: 2,
    },
    {
      name: "VVIP Table of 5",
      description: "Reserved high-profile table for 5 with bottle service & parking pass.",
      price: 20000,
      capacity: 30,
      perks: ["Reserved Table of 5", "Dedicated Host Service", "Full Bottle Service & Platter", "Backstage & VIP Parking Passes"],
      sort: 3,
    },
  ];

  for (const tier of defaultTiers) {
    sqlOutput += `INSERT INTO ticket_tiers (name, description, price_kes, capacity, perks, sort_order, is_active)
VALUES (
  '${tier.name}',
  '${tier.description.replace(/'/g, "''")}',
  ${tier.price},
  ${tier.capacity},
  '${JSON.stringify(tier.perks)}'::jsonb,
  ${tier.sort},
  true
) ON CONFLICT DO NOTHING;\n`;
  }
  sqlOutput += `\n`;

  const emptyCategoriesToDeactivate = [
    "mombasa-1-matatu",
    "best-driver-mombasa",
    "best-conductor-mombasa",
  ];

  let totalNominees = 0;

  for (const cat of rawData) {
    const groupName = assignGroup(cat.name);
    const hasNominees = Array.isArray(cat.nominees) && cat.nominees.length > 0;
    const isActive = hasNominees && !emptyCategoriesToDeactivate.includes(cat.slug);

    sqlOutput += `\n-- Category: ${cat.name}\n`;
    sqlOutput += `DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('${cat.slug}', '${cat.name.replace(/'/g, "''")}', '${groupName}', ${cat.sort_order}, ${isActive})
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;\n`;

    if (hasNominees) {
      for (let i = 0; i < cat.nominees.length; i++) {
        const rawNom = cat.nominees[i];
        const { name, subtitle } = extractSubtitle(rawNom);
        const escapedName = name.replace(/'/g, "''");
        const escapedSub = subtitle ? `'${subtitle.replace(/'/g, "''")}'` : `NULL`;

        sqlOutput += `  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, '${escapedName}', ${escapedSub}, ${i + 1}, true)
  ON CONFLICT (category_id, name) DO NOTHING;\n`;
        totalNominees++;
      }
    }

    sqlOutput += `END $$;\n`;
  }

  // Populate vote_counts table with 0 for all nominees
  sqlOutput += `\n-- Populate vote_counts for all nominees\n`;
  sqlOutput += `INSERT INTO vote_counts (category_id, nominee_id, count)
SELECT category_id, id, 0
FROM nominees
ON CONFLICT (category_id, nominee_id) DO NOTHING;\n`;

  const sqlFilePath = path.join(process.cwd(), "supabase/seed/seed.sql");
  fs.writeFileSync(sqlFilePath, sqlOutput, "utf8");
  console.log(`Generated SQL seed file at: ${sqlFilePath} (${rawData.length} categories, ${totalNominees} nominees)`);

  // If Supabase credentials are provided, run seed against DB directly
  if (supabaseUrl && serviceKey) {
    console.log("Connecting to Supabase to apply seed data...");
    const supabase = createClient(supabaseUrl, serviceKey);

    for (const cat of rawData) {
      const groupName = assignGroup(cat.name);
      const hasNominees = Array.isArray(cat.nominees) && cat.nominees.length > 0;
      const isActive = hasNominees && !emptyCategoriesToDeactivate.includes(cat.slug);

      const { data: catData, error: catError } = await supabase
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

      if (catError) {
        console.error(`Error upserting category ${cat.name}:`, catError.message);
        continue;
      }

      if (hasNominees && catData) {
        for (let i = 0; i < cat.nominees.length; i++) {
          const rawNom = cat.nominees[i];
          const { name, subtitle } = extractSubtitle(rawNom);

          const { data: nomData, error: nomError } = await supabase
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
            await supabase
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
    console.log("Supabase direct seed complete!");
  } else {
    console.log("No NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY found in env; generated seed.sql for migration/reset.");
  }
}

runSeed().catch((err) => {
  console.error("Seed execution failed:", err);
  process.exit(1);
});
