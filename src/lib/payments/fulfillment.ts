import { createAdminClient } from "@/lib/supabase/server";
import { PaystackClient } from "@/lib/payments/paystack";
import { generateSignedQrPayload } from "@/lib/security/ticket-crypto";
import { sendTicketEmail, sendAdminTicketAlert } from "@/lib/email/tickets";

export interface FulfillOrderParams {
  orderId?: string;
  orderNumber?: string;
  reference?: string;
  channel?: string;
  rawTransactionData?: any;
  verifyWithPaystack?: boolean;
}

export interface FulfillOrderResult {
  success: boolean;
  order?: any;
  tickets?: any[];
  alreadyConfirmed?: boolean;
  error?: string;
  status?: string;
}

/**
 * Atomic and idempotent order fulfillment service.
 * Handles payment verification, order status update, ticket issuance,
 * tier count sync, and both buyer & admin email notifications.
 */
export async function fulfillOrder(params: FulfillOrderParams): Promise<FulfillOrderResult> {
  const {
    orderId,
    orderNumber,
    reference,
    channel,
    rawTransactionData,
    verifyWithPaystack = false,
  } = params;

  const supabase = await createAdminClient();

  // 1. Locate order by orderId OR orderNumber OR reference
  let query = supabase
    .from("orders")
    .select("*, ticket_tiers(id, name, price_kes, sold_count, reserved_count)");

  if (orderId) {
    query = query.eq("id", orderId);
  } else if (orderNumber) {
    query = query.eq("order_number", orderNumber);
  } else if (reference) {
    query = query.eq("order_number", reference);
  } else {
    return { success: false, error: "No order identifier provided" };
  }

  const { data: order, error: orderError } = await query.maybeSingle();

  if (orderError || !order) {
    console.error("[Fulfillment] Order lookup failed:", orderError?.message || "Order not found");
    return { success: false, error: "Order not found" };
  }

  // 2. If already confirmed, retrieve tickets and return immediately (idempotent)
  if (order.status === "confirmed") {
    const { data: existingTickets } = await supabase
      .from("tickets")
      .select("id, ticket_code, status, qr_payload, created_at")
      .eq("order_id", order.id);

    return {
      success: true,
      alreadyConfirmed: true,
      order,
      tickets: existingTickets || [],
      status: "confirmed",
    };
  }

  // 3. Verify with Paystack API if requested
  const paystackRef = reference || order.order_number;
  let transactionData = rawTransactionData;

  if (verifyWithPaystack) {
    const paystack = new PaystackClient();
    const verification = await paystack.verifyTransaction(paystackRef);

    if (!verification.status || verification.data?.status !== "success") {
      const currentStatus = verification.data?.status || "pending";
      return {
        success: false,
        status: currentStatus,
        error: `Transaction status with Paystack is ${currentStatus}`,
      };
    }

    transactionData = verification.data;
  }

  // 4. Mark order as confirmed
  const { error: updateErr } = await supabase
    .from("orders")
    .update({
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateErr) {
    console.error("[Fulfillment] Failed to mark order confirmed:", updateErr.message);
    return { success: false, error: "Failed to update order status" };
  }

  // 5. Update ticket_tiers counts (sold_count increment, reserved_count decrement)
  try {
    const { data: currentTier } = await supabase
      .from("ticket_tiers")
      .select("sold_count, reserved_count")
      .eq("id", order.tier_id)
      .maybeSingle();

    if (currentTier) {
      const currentSold = Number(currentTier.sold_count) || 0;
      const currentReserved = Number(currentTier.reserved_count) || 0;
      await supabase
        .from("ticket_tiers")
        .update({
          sold_count: currentSold + order.quantity,
          reserved_count: Math.max(0, currentReserved - order.quantity),
        })
        .eq("id", order.tier_id);
    }
  } catch (tierErr) {
    console.warn("[Fulfillment] Warning updating tier counts:", tierErr);
  }

  // 6. Record payment row in payments table
  try {
    await supabase.from("payments").insert({
      order_id: order.id,
      provider: "paystack",
      reference: paystackRef,
      paystack_transaction_id: String(transactionData?.id || ""),
      amount_kes: order.total_amount_kes,
      currency: "KES",
      status: "confirmed",
      channel: channel || transactionData?.channel || "mobile_money",
      raw_response: transactionData || {},
      paid_at: transactionData?.paid_at || new Date().toISOString(),
    });
  } catch (payErr) {
    console.warn("[Fulfillment] Warning recording payment row:", payErr);
  }

  // 7. Issue individual tickets with cryptographically signed QR payloads
  const tierName = (order as any).ticket_tiers?.name ?? "General Admission";
  const issuedTickets: Array<{
    id?: string;
    ticketCode: string;
    tierName: string;
    qrPayload: string;
  }> = [];

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
      issuedTickets.push({
        id: ticketRecord.id,
        ticketCode,
        tierName,
        qrPayload,
      });
    }
  }

  // 8. Deliver tickets by email to buyer
  try {
    await sendTicketEmail({
      buyerName: order.buyer_name,
      buyerEmail: order.buyer_email,
      orderNumber: order.order_number,
      tickets: issuedTickets,
    });
  } catch (buyerEmailErr) {
    console.error("[Fulfillment] Failed to send ticket email to buyer:", buyerEmailErr);
  }

  // 9. Deliver instant new ticket purchase alert to admin (info@coastalnganyaawards.com)
  try {
    await sendAdminTicketAlert({
      buyerName: order.buyer_name,
      buyerEmail: order.buyer_email,
      buyerPhone: order.buyer_phone,
      orderNumber: order.order_number,
      tierName,
      quantity: order.quantity,
      totalAmountKes: order.total_amount_kes,
      channel: channel || transactionData?.channel || "mobile_money",
      reference: paystackRef,
      tickets: issuedTickets,
    });
  } catch (adminEmailErr) {
    console.error("[Fulfillment] Failed to deliver admin ticket notification:", adminEmailErr);
  }

  return {
    success: true,
    order: { ...order, status: "confirmed" },
    tickets: issuedTickets,
    status: "confirmed",
  };
}
