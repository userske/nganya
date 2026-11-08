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
      .limit(1000);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[API Vote Counts Error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Authoritative tallies from vote_counts (all 515 nominees)
    if (data && Array.isArray(data) && data.length > 0) {
      return NextResponse.json({ counts: data });
    }

    // Fallback if vote_counts is empty: aggregate from votes table
    let votesQuery = adminClient
      .from("votes")
      .select("category_id, nominee_id")
      .eq("voided", false);

    if (categoryId) {
      votesQuery = votesQuery.eq("category_id", categoryId);
    }

    const { data: rawVotes } = await votesQuery.limit(5000);
    if (rawVotes && Array.isArray(rawVotes) && rawVotes.length > 0) {
      const tallyMap: Record<string, { category_id: string; nominee_id: string; count: number }> = {};
      for (const v of rawVotes) {
        const key = `${v.category_id}|${v.nominee_id}`;
        if (!tallyMap[key]) {
          tallyMap[key] = { category_id: v.category_id, nominee_id: v.nominee_id, count: 0 };
        }
        tallyMap[key].count += 1;
      }
      return NextResponse.json({ counts: Object.values(tallyMap) });
    }

    return NextResponse.json({ counts: [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
