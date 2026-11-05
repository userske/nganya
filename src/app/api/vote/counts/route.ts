import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  const headers = {
    "Cache-Control": "public, max-age=5, s-maxage=15, stale-while-revalidate=30",
  };

  try {
    const supabase = createPublicClient();

    let query = supabase
      .from("vote_counts")
      .select("category_id, nominee_id, count")
      .gt("count", 0);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (!error && data) {
      return NextResponse.json({ counts: data }, { headers });
    }

    return NextResponse.json({ counts: [] }, { headers });
  } catch (err: any) {
    return NextResponse.json({ counts: [] }, { status: 200, headers });
  }
}
