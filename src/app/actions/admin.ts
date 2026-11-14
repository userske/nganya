"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function verifyAdminRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED: Not logged in");
  }

  const adminEmails = [
    "info@coastalnganyaawards.com",
    "usersessionsio@gmail.com",
    ...(process.env.ADMIN_EMAIL
      ? process.env.ADMIN_EMAIL.split(",").map((e: string) => e.trim().toLowerCase())
      : []),
  ];
  const userEmail = (user.email || "").toLowerCase().trim();
  const isEmailAdmin = adminEmails.includes(userEmail);

  const adminClient = await createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!isEmailAdmin && profile?.role !== "admin") {
    throw new Error("FORBIDDEN: Admin role required");
  }

  // Ensure role is admin in DB so any direct database RPC policies pass
  if (isEmailAdmin && profile?.role !== "admin") {
    await adminClient.from("profiles").upsert(
      { id: user.id, email_normalized: userEmail, role: "admin" },
      { onConflict: "id" }
    );
  }

  return user;
}

export async function updateEventSettingsAction(formData: {
  eventName: string;
  tagline: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  ticketSalesOpen: boolean;
  resultsFrozen: boolean;
  votingOpensAt?: string | null;
  votingClosesAt?: string | null;
}) {
  const adminUser = await verifyAdminRole();
  const adminClient = await createAdminClient();

  const { error } = await adminClient
    .from("event_settings")
    .update({
      event_name: formData.eventName,
      tagline: formData.tagline,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime,
      venue_name: formData.venueName,
      ticket_sales_open: formData.ticketSalesOpen,
      results_frozen: formData.resultsFrozen,
      voting_opens_at: formData.votingOpensAt || null,
      voting_closes_at: formData.votingClosesAt || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { success: false, error: error.message };
  }

  // Log in audit log
  await adminClient.from("audit_log").insert({
    actor_id: adminUser.id,
    action: "UPDATE_EVENT_SETTINGS",
    entity_type: "event_settings",
    entity_id: "1",
    details: formData,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function toggleCategoryStatusAction(categoryId: string, isActive: boolean) {
  const adminUser = await verifyAdminRole();
  const adminClient = await createAdminClient();

  const { error } = await adminClient
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", categoryId);

  if (error) {
    return { success: false, error: error.message };
  }

  await adminClient.from("audit_log").insert({
    actor_id: adminUser.id,
    action: isActive ? "ENABLE_CATEGORY" : "DISABLE_CATEGORY",
    entity_type: "category",
    entity_id: categoryId,
  });

  revalidatePath("/vote");
  revalidatePath("/admin");
  return { success: true };
}

export async function voidVoteAction(voteId: string, reason: string) {
  const adminUser = await verifyAdminRole();
  const adminClient = await createAdminClient();

  // Find vote first to decrement count
  const { data: vote } = await adminClient
    .from("votes")
    .select("category_id, nominee_id, voided")
    .eq("id", voteId)
    .single();

  if (!vote || vote.voided) {
    return { success: false, error: "Vote not found or already voided" };
  }

  // Mark void
  const { error } = await adminClient
    .from("votes")
    .update({ voided: true })
    .eq("id", voteId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Decrement vote_counts
  const { data: currentCount } = await adminClient
    .from("vote_counts")
    .select("count")
    .eq("category_id", vote.category_id)
    .eq("nominee_id", vote.nominee_id)
    .single();

  if (currentCount && currentCount.count > 0) {
    await adminClient
      .from("vote_counts")
      .update({ count: currentCount.count - 1 })
      .eq("category_id", vote.category_id)
      .eq("nominee_id", vote.nominee_id);
  }

  await adminClient.from("audit_log").insert({
    actor_id: adminUser.id,
    action: "VOID_VOTE",
    entity_type: "vote",
    entity_id: voteId,
    details: { reason },
  });

  revalidatePath("/results");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Bulk void scripted / fake votes for a nominee.
 * Identifies spoofed user agents (Chrome 140+, iOS 19+, CriOS 140+, Firefox 140+, SamsungBrowser 30+, Safari 20+)
 * and high-frequency proxy IP clusters (>= 3 votes per IP for the nominee).
 * Decrements the nominee's live vote count in vote_counts back to authentic votes.
 */
export async function voidScriptedVotesAction(
  nomineeId: string,
  categoryId: string,
  reason?: string
): Promise<{
  success: boolean;
  voidedCount: number;
  authenticCount: number;
  nomineeName?: string;
  error?: string;
}> {
  const adminUser = await verifyAdminRole();
  const adminClient = await createAdminClient();

  const { data: nominee } = await adminClient
    .from("nominees")
    .select("name")
    .eq("id", nomineeId)
    .maybeSingle();

  const { data: votes, error: fetchErr } = await adminClient
    .from("votes")
    .select("id, ip_hash, user_agent, created_at")
    .eq("nominee_id", nomineeId)
    .eq("category_id", categoryId)
    .eq("voided", false)
    .limit(5000);

  if (fetchErr) {
    return { success: false, voidedCount: 0, authenticCount: 0, error: fetchErr.message };
  }

  if (!votes || votes.length === 0) {
    return {
      success: true,
      voidedCount: 0,
      authenticCount: 0,
      nomineeName: nominee?.name ?? "Nominee",
    };
  }

  // Count IP occurrences
  const ipCounts: Record<string, number> = {};
  for (const v of votes) {
    if (v.ip_hash) {
      ipCounts[v.ip_hash] = (ipCounts[v.ip_hash] || 0) + 1;
    }
  }

  const toVoidIds: string[] = [];
  let authenticCount = 0;

  for (const v of votes) {
    const ua = v.user_agent || "";
    const ip = v.ip_hash || "";
    let isFake = false;

    if (
      /Chrome\/(1[4-9][0-9]|2[0-9]{2})/.test(ua) ||
      /iPhone OS (19|2[0-9]|3[0-9])/.test(ua) ||
      /CriOS\/(1[4-9][0-9]|2[0-9]{2})/.test(ua) ||
      /Firefox\/(14[0-9]|15[0-9]|16[0-9])/.test(ua) ||
      /SamsungBrowser\/(3[0-9]|4[0-9])/.test(ua) ||
      /Version\/(2[6-9]|[3-9][0-9])/.test(ua) ||
      (ip && ipCounts[ip] >= 3)
    ) {
      isFake = true;
    }

    if (isFake) {
      toVoidIds.push(v.id);
    } else {
      authenticCount++;
    }
  }

  // Batch update voided = true
  const chunkSize = 50;
  for (let i = 0; i < toVoidIds.length; i += chunkSize) {
    const chunk = toVoidIds.slice(i, i + chunkSize);
    await adminClient
      .from("votes")
      .update({ voided: true })
      .in("id", chunk);
  }

  // Update vote_counts to exact authentic count
  await adminClient
    .from("vote_counts")
    .upsert(
      { category_id: categoryId, nominee_id: nomineeId, count: authenticCount },
      { onConflict: "category_id,nominee_id" }
    );

  await adminClient.from("audit_log").insert({
    actor_id: adminUser.id,
    action: "VOID_SCRIPTED_VOTES",
    entity_type: "nominee",
    entity_id: nomineeId,
    details: {
      nominee_name: nominee?.name ?? "Nominee",
      category_id: categoryId,
      voided_count: toVoidIds.length,
      authentic_count: authenticCount,
      reason: reason || "Purged scripted/spoofed votes and high-frequency IP clusters",
    },
  });

  revalidatePath("/results");
  revalidatePath("/vote");
  revalidatePath("/vote/[categorySlug]", "page");
  revalidatePath("/admin");

  return {
    success: true,
    voidedCount: toVoidIds.length,
    authenticCount,
    nomineeName: nominee?.name ?? "Nominee",
  };
}

/**
 * Resend ticket QR email for a single confirmed order.
 * Admin-only. Looks up all tickets for the order and fires sendTicketEmail.
 */
export async function resendOrderTicketsAction(orderNumber: string): Promise<{
  success: boolean;
  recipient?: string;
  ticketCount?: number;
  error?: string;
}> {
  const adminUser = await verifyAdminRole();
  const adminClient = await createAdminClient();

  // Fetch the order
  const { data: order, error: orderErr } = await adminClient
    .from("orders")
    .select("id, order_number, buyer_name, buyer_email, status, ticket_tiers(name)")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (orderErr || !order) {
    return { success: false, error: "Order not found" };
  }

  if (order.status !== "confirmed") {
    return { success: false, error: `Order status is '${order.status}' Ã¢â‚¬â€ only confirmed orders can have tickets resent.` };
  }

  // Fetch the tickets for this order using order UUID (order_id FK)
  const { data: tickets, error: ticketsErr } = await adminClient
    .from("tickets")
    .select("ticket_code, qr_payload, buyer_name, buyer_email")
    .eq("order_id", order.id);

  if (ticketsErr || !tickets || tickets.length === 0) {
    return { success: false, error: "No tickets found for this order" };
  }

  const { generateSignedQrPayload } = await import("@/lib/security/ticket-crypto");
  const { sendTicketEmail } = await import("@/lib/email/tickets");

  const tierName = (order as any).ticket_tiers?.name || "Regular";

  const ticketParams = tickets.map((t) => ({
    ticketCode: t.ticket_code,
    tierName: tierName,
    qrPayload: t.qr_payload || generateSignedQrPayload({
      code: t.ticket_code,
      orderNumber: order.order_number,
      tierName: tierName,
      buyerName: order.buyer_name,
      issuedAt: Date.now(),
    }),
  }));

  const result = await sendTicketEmail({
    buyerName: order.buyer_name,
    buyerEmail: order.buyer_email,
    orderNumber: order.order_number,
    tickets: ticketParams,
  });

  await adminClient.from("audit_log").insert({
    actor_id: adminUser.id,
    action: "ADMIN_RESEND_TICKETS",
    entity_type: "order",
    entity_id: orderNumber,
    details: { recipient: order.buyer_email, ticketCount: tickets.length, emailSuccess: result.success },
  });

  if (!result.success) {
    return { success: false, error: result.error || "Email delivery failed" };
  }

  return { success: true, recipient: order.buyer_email, ticketCount: tickets.length };
}

/**
 * Resend ticket QR emails for ALL confirmed orders.
 * Admin-only. Iterates every confirmed order and fires sendTicketEmail per order.
 */
export async function resendAllConfirmedTicketsAction(): Promise<{
  success: boolean;
  totalOrders: number;
  sentCount: number;
  failedCount: number;
  errors?: string[];
}> {
  const adminUser = await verifyAdminRole();
  const adminClient = await createAdminClient();

  // Fetch all confirmed orders
  const { data: confirmedOrders, error: ordersErr } = await adminClient
    .from("orders")
    .select("id, order_number, buyer_name, buyer_email, status, ticket_tiers(name)")
    .eq("status", "confirmed")
    .order("created_at", { ascending: true });

  if (ordersErr || !confirmedOrders) {
    return { success: false, totalOrders: 0, sentCount: 0, failedCount: 0, errors: [ordersErr?.message || "Failed to fetch orders"] };
  }

  const { generateSignedQrPayload } = await import("@/lib/security/ticket-crypto");
  const { sendTicketEmail } = await import("@/lib/email/tickets");

  let sentCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const order of confirmedOrders) {
    try {
      const { data: tickets } = await adminClient
        .from("tickets")
        .select("ticket_code, qr_payload, buyer_name")
        .eq("order_id", order.id);

      if (!tickets || tickets.length === 0) {
        failedCount++;
        errors.push(`${order.order_number}: no tickets found`);
        continue;
      }

      const tierName = (order as any).ticket_tiers?.name || "Regular";

      const ticketParams = tickets.map((t) => ({
        ticketCode: t.ticket_code,
        tierName: tierName,
        qrPayload: t.qr_payload || generateSignedQrPayload({
          code: t.ticket_code,
          orderNumber: order.order_number,
          tierName: tierName,
          buyerName: order.buyer_name,
          issuedAt: Date.now(),
        }),
      }));

      const result = await sendTicketEmail({
        buyerName: order.buyer_name,
        buyerEmail: order.buyer_email,
        orderNumber: order.order_number,
        tickets: ticketParams,
      });

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
        errors.push(`${order.order_number} (${order.buyer_email}): ${result.error}`);
      }
    } catch (err: any) {
      failedCount++;
      errors.push(`${order.order_number}: ${err?.message || "Unknown error"}`);
    }
  }

  await adminClient.from("audit_log").insert({
    actor_id: adminUser.id,
    action: "ADMIN_RESEND_ALL_TICKETS",
    entity_type: "order",
    entity_id: "all",
    details: { totalOrders: confirmedOrders.length, sentCount, failedCount },
  });

  return {
    success: failedCount === 0,
    totalOrders: confirmedOrders.length,
    sentCount,
    failedCount,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Manually query Paystack for an order and trigger fulfillment if paid
 */
export async function syncPaystackOrderAction(orderNumber: string) {
  const adminUser = await verifyAdminRole();
  const { fulfillOrder } = await import("@/lib/payments/fulfillment");

  const result = await fulfillOrder({
    orderNumber,
    reference: orderNumber,
    verifyWithPaystack: true,
  });

  if (!result.success) {
    return { success: false, error: result.error || "Order not verified as paid on Paystack" };
  }

  const adminClient = await createAdminClient();
  await adminClient.from("audit_log").insert({
    actor_id: adminUser.id,
    action: "SYNC_ORDER_PAYSTACK",
    entity_type: "order",
    entity_id: orderNumber,
    details: { status: result.status },
  });

  revalidatePath("/admin");
  return { success: true, order: result.order };
}

/**
 * Retrieve tickets and details for an order for admin view / PDF download.
 */
export async function getAdminOrderTicketsAction(orderNumber: string): Promise<{
  success: boolean;
  order?: any;
  tickets?: any[];
  error?: string;
}> {
  await verifyAdminRole();
  const adminClient = await createAdminClient();

  const { data: order, error: orderErr } = await adminClient
    .from('orders')
    .select('id, order_number, buyer_name, buyer_email, buyer_phone, quantity, total_amount_kes, status, created_at, ticket_tiers(name, price_kes)')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (orderErr || !order) {
    return { success: false, error: 'Order not found' };
  }

  const { data: tickets, error: ticketsErr } = await adminClient
    .from('tickets')
    .select('id, ticket_code, status, qr_payload, created_at, buyer_name')
    .eq('order_id', order.id);

  if (ticketsErr) {
    return { success: false, error: ticketsErr.message };
  }

  return { success: true, order, tickets: tickets || [] };
}
