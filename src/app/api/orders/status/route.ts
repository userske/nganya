import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ error: "Missing order reference" }, { status: 400 });
  }

  const supabase = await createAdminClient();

  // Find order by order_number
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, status, buyer_name, buyer_email, total_amount_kes, ticket_tiers(name)")
    .eq("order_number", ref)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // If confirmed, fetch tickets
  let tickets: any[] = [];
  if (order.status === "confirmed") {
    const { data: tktData } = await supabase
      .from("tickets")
      .select("id, ticket_code, status, qr_payload, created_at")
      .eq("order_id", order.id);

    tickets = tktData ?? [];
  }

  return NextResponse.json({
    status: order.status,
    orderNumber: order.order_number,
    buyerName: order.buyer_name,
    buyerEmail: order.buyer_email,
    tierName: (order as any).ticket_tiers?.name,
    tickets,
  });
}
