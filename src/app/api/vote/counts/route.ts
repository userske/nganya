import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  try {
    const adminClient = await createAdminClient();

    let query = adminClient
      .from("vote_counts")
      .select("category_id, nominee_id, count")
      .limit(5000);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[API Vote Counts Error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Build a baseline tally map from vote_counts
    const tallyMap = new Map<string, { category_id: string; nominee_id: string; count: number }>();

    if (data && Array.isArray(data)) {
      for (const item of data) {
        const key = `${item.category_id}|${item.nominee_id}`;
        tallyMap.set(key, {
          category_id: item.category_id,
          nominee_id: item.nominee_id,
          count: Number(item.count) || 0,
        });
      }
    }

    // Also reconcile with verified votes table to guarantee live accuracy
    let votesQuery = adminClient
      .from("votes")
      .select("category_id, nominee_id")
      .eq("voided", false)
      .limit(50000);

    if (categoryId) {
      votesQuery = votesQuery.eq("category_id", categoryId);
    }

    const { data: rawVotes } = await votesQuery;
    if (rawVotes && Array.isArray(rawVotes) && rawVotes.length > 0) {
      const rawCountMap: Record<string, number> = {};
      for (const v of rawVotes) {
        const key = `${v.category_id}|${v.nominee_id}`;
        rawCountMap[key] = (rawCountMap[key] || 0) + 1;
      }

      for (const [key, rawCount] of Object.entries(rawCountMap)) {
        const existing = tallyMap.get(key);
        if (existing) {
          existing.count = Math.max(existing.count, rawCount);
        } else {
          const [catId, nomId] = key.split("|");
          tallyMap.set(key, {
            category_id: catId,
            nominee_id: nomId,
            count: rawCount,
          });
        }
      }
    }

    return NextResponse.json({ counts: Array.from(tallyMap.values()) });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
