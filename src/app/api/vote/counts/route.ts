import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  try {
    const supabase = await createClient();

    let query = supabase
      .from("vote_counts")
      .select("category_id, nominee_id, count");

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return NextResponse.json({ counts: data });
    }

    // Fallback to adminClient if available
    try {
      const adminClient = await createAdminClient();
      let votesQuery = adminClient
        .from("votes")
        .select("category_id, nominee_id")
        .eq("voided", false);

      if (categoryId) {
        votesQuery = votesQuery.eq("category_id", categoryId);
      }

      const { data: rawVotes } = await votesQuery;
      if (rawVotes && rawVotes.length > 0) {
        const tallyMap: Record<string, { category_id: string; nominee_id: string; count: number }> = {};
        for (const v of rawVotes) {
          const key = `${v.category_id}-${v.nominee_id}`;
          if (!tallyMap[key]) {
            tallyMap[key] = { category_id: v.category_id, nominee_id: v.nominee_id, count: 0 };
          }
          tallyMap[key].count += 1;
        }
        return NextResponse.json({ counts: Object.values(tallyMap) });
      }
    } catch {
      // Fallback silently if adminClient query fails
    }

    return NextResponse.json({ counts: [] });
  } catch (err: any) {
    return NextResponse.json(
      { counts: [] },
      { status: 200 }
    );
  }
}
