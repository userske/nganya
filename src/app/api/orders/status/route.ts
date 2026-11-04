import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { PaystackClient } from "@/lib/payments/paystack";
import { generateSignedQrPayload } from "@/lib/security/ticket-crypto";
import { sendTicketEmail, sendAdminTicketAlert } from "@/lib/email/tickets";

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
    .select("*, ticket_tiers(name, price_kes, sold_count, reserved_count)")
    .eq("order_number", ref)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // If order is not confirmed yet, verify directly with Paystack as a safety net
  if (order.status !== "confirmed" && process.env.PAYSTACK_SECRET_KEY) {
    try {
      const paystack = new PaystackClient();
      const verification = await paystack.verifyTransaction(ref);
      if (verification?.status && verification?.data?.status === "success") {
        const transactionData = verification.data;

        // Confirm order
        await supabase
          .from("orders")
          .update({
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        order.status = "confirmed";

        // Record payment
        await supabase.from("payments").upsert(
          {
            order_id: order.id,
            provider: "paystack",
            reference: ref,
            paystack_transaction_id: String(transactionData.id),
            amount_kes: order.total_amount_kes,
            currency: "KES",
            status: "confirmed",
            channel: transactionData.channel ?? "mobile_money",
            raw_response: transactionData,
            paid_at: transactionData.paid_at ?? new Date().toISOString(),
          },
          { onConflict: "reference" }
        );

        // Update tier counts
        if (order.tier_id) {
          await supabase
            .from("ticket_tiers")
            .update({
              sold_count: ((order as any).ticket_tiers?.sold_count || 0) + order.quantity,
              reserved_count: Math.max(0, ((order as any).ticket_tiers?.reserved_count || 0) - order.quantity),
            })
            .eq("id", order.tier_id);
        }

        // Issue tickets if not already issued
        const { data: existingTkts } = await supabase
          .from("tickets")
          .select("id")
          .eq("order_id", order.id);

        if (!existingTkts || existingTkts.length === 0) {
          const issuedTickets = [];
          const tierName = (order as any).ticket_tiers?.name ?? "General Admission";

          for (let i = 0; i < order.quantity; i++) {
            const ticketCode = `CNA-TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const qrPayload = generateSignedQrPayload({
              code: ticketCode,
              orderNumber: order.order_number,
              tierName,
              buyerName: order.buyer_name,
              issuedAt: Date.now(),
            });

            const { data: ticketRecord } = await supabase
              .from("tickets")
              .insert({
                ticket_code: ticketCode,
                order_id: order.id,
                tier_id: order.tier_id,
                buyer_name: order.buyer_name,
                buyer_email: order.buyer_email,
                buyer_phone: order.buyer_phone,
                status: "valid",
                qr_payload: qrPayload,
              })
              .select()
              .single();

            if (ticketRecord) {
              issuedTickets.push({ ticketCode, tierName, qrPayload });
            }
          }

          // Send emails asynchronously
          sendTicketEmail({
            buyerName: order.buyer_name,
            buyerEmail: order.buyer_email,
            orderNumber: order.order_number,
            tickets: issuedTickets,
          }).catch((e) => console.error("Ticket email error:", e));

          sendAdminTicketAlert({
            buyerName: order.buyer_name,
            buyerEmail: order.buyer_email,
            buyerPhone: order.buyer_phone,
            orderNumber: order.order_number,
            tierName,
            quantity: order.quantity,
            totalAmountKes: order.total_amount_kes,
            channel: transactionData.channel ?? "mobile_money",
            reference: ref,
            tickets: issuedTickets,
          }).catch((e) => console.error("Admin alert email error:", e));
        }
      }
    } catch (checkErr) {
      console.error("[Orders/Status] Paystack direct verify error:", checkErr);
    }
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
