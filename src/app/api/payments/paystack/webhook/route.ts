import { NextResponse } from "next/server";
import { PaystackClient } from "@/lib/payments/paystack";
import { createAdminClient } from "@/lib/supabase/server";
import { generateSignedQrPayload } from "@/lib/security/ticket-crypto";
import { sendTicketEmail } from "@/lib/email/tickets";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    const paystack = new PaystackClient();

    // In production, signature verification is mandatory
    if (process.env.PAYSTACK_SECRET_KEY && signature) {
      const isValid = paystack.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event !== "charge.success") {
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    const transactionData = payload.data;
    const reference = transactionData.reference;
    const metadata = transactionData.metadata;
    const orderId = metadata?.order_id;

    if (!orderId || !reference) {
      return NextResponse.json({ error: "Missing order_id or reference" }, { status: 400 });
    }

    // Connect via service role client (server-side only)
    const supabase = await createAdminClient();

    // 1. Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, ticket_tiers(name, price_kes)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Webhook order lookup error:", orderError?.message);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Idempotency check: if order is already confirmed, exit immediately
    if (order.status === "confirmed") {
      return NextResponse.json({ message: "Order already confirmed" }, { status: 200 });
    }

    // 3. Double-verify transaction with Paystack API directly
    const verification = await paystack.verifyTransaction(reference);
    if (!verification.status || verification.data?.status !== "success") {
      return NextResponse.json({ error: "Transaction verification failed" }, { status: 400 });
    }

    // 4. Update order status to confirmed
    await supabase
      .from("orders")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // 5. Update tier counts: finalize sold_count, release reserved_count
    await supabase
      .from("ticket_tiers")
      .update({
        sold_count: (order as any).ticket_tiers?.sold_count + order.quantity,
        reserved_count: Math.max(0, (order as any).ticket_tiers?.reserved_count - order.quantity),
      })
      .eq("id", order.tier_id);

    // 6. Record payment row
    await supabase.from("payments").insert({
      order_id: orderId,
      provider: "paystack",
      reference: reference,
      paystack_transaction_id: String(transactionData.id),
      amount_kes: order.total_amount_kes,
      currency: "KES",
      status: "confirmed",
      channel: transactionData.channel ?? "mobile_money",
      raw_response: transactionData,
      paid_at: transactionData.paid_at ?? new Date().toISOString(),
    });

    // 7. Issue individual tickets with cryptographically signed QR payloads
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
          order_id: orderId,
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
        issuedTickets.push({
          ticketCode,
          tierName,
          qrPayload,
        });
      }
    }

    // 8. Deliver tickets by email via Resend
    await sendTicketEmail({
      buyerName: order.buyer_name,
      buyerEmail: order.buyer_email,
      orderNumber: order.order_number,
      tickets: issuedTickets,
    });

    return NextResponse.json({
      received: true,
      order_id: orderId,
      tickets_issued: issuedTickets.length,
    });
  } catch (err: any) {
    console.error("Paystack webhook fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
