import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { fulfillOrder } from "@/lib/payments/fulfillment";

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

  let finalOrder = order;
  let tickets: any[] = [];

  // If pending, verify with Paystack and fulfill immediately if payment was successful
  if (order.status === "pending") {
    try {
      const fulfillment = await fulfillOrder({
        orderNumber: ref,
        reference: ref,
        verifyWithPaystack: true,
      });

      if (fulfillment.success && fulfillment.order) {
        finalOrder = fulfillment.order;
        tickets = fulfillment.tickets || [];
      }
    } catch (verifyErr) {
      console.warn("[Order Status] Paystack direct verify attempt error:", verifyErr);
    }
  }

  // If confirmed, retrieve tickets if not already populated
  if (finalOrder.status === "confirmed" && tickets.length === 0) {
    const { data: tktData } = await supabase
      .from("tickets")
      .select("id, ticket_code, status, qr_payload, created_at")
      .eq("order_id", finalOrder.id);

    tickets = tktData ?? [];
  }

  return NextResponse.json({
    status: finalOrder.status,
    orderNumber: finalOrder.order_number,
    buyerName: finalOrder.buyer_name,
    buyerEmail: finalOrder.buyer_email,
    tierName: (finalOrder as any).ticket_tiers?.name,
    tickets,
  });
}
