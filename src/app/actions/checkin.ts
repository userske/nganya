"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { verifySignedQrPayload } from "@/lib/security/ticket-crypto";

export interface CheckinResult {
  success: boolean;
  status: "VALID" | "ALREADY_USED" | "VOID" | "INVALID_SIGNATURE" | "NOT_FOUND";
  buyerName?: string;
  tierName?: string;
  ticketCode?: string;
  scannedAt?: string;
  previousScannedAt?: string;
  message: string;
}

export async function processDoorCheckinAction(qrRaw: string): Promise<CheckinResult> {
  const cleanInput = qrRaw.trim();
  if (!cleanInput) {
    return {
      success: false,
      status: "NOT_FOUND",
      message: "Empty QR code or ticket input.",
    };
  }

  const supabase = await createClient();

  // 1. Verify user is staff or admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      status: "NOT_FOUND",
      message: "Unauthorized: You must log in as staff or admin to scan tickets.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "staff" && profile.role !== "admin")) {
    return {
      success: false,
      status: "NOT_FOUND",
      message: "Unauthorized: Staff or Admin role required.",
    };
  }

  // 2. Determine ticket code from signed QR payload or direct code
  let ticketCode = cleanInput;
  if (cleanInput.includes(".")) {
    const payload = verifySignedQrPayload(cleanInput);
    if (!payload) {
      return {
        success: false,
        status: "INVALID_SIGNATURE",
        message: "Cryptographic QR Signature Failed: Ticket may be forged or tampered with.",
      };
    }
    ticketCode = payload.code;
  }

  // 3. Process check-in atomically using admin client
  const adminClient = await createAdminClient();

  const { data: ticket, error: ticketError } = await adminClient
    .from("tickets")
    .select("id, ticket_code, buyer_name, status, checked_in_at, ticket_tiers(name)")
    .eq("ticket_code", ticketCode)
    .maybeSingle();

  if (ticketError || !ticket) {
    await adminClient.from("checkins").insert({
      ticket_id: null,
      staff_id: user.id,
      is_successful: false,
      failure_reason: "TICKET_NOT_FOUND",
    });

    return {
      success: false,
      status: "NOT_FOUND",
      message: `Ticket "${ticketCode}" was not found in the database.`,
    };
  }

  if (ticket.status === "void") {
    await adminClient.from("checkins").insert({
      ticket_id: ticket.id,
      staff_id: user.id,
      is_successful: false,
      failure_reason: "TICKET_VOIDED",
    });

    return {
      success: false,
      status: "VOID",
      ticketCode: ticket.ticket_code,
      buyerName: ticket.buyer_name,
      message: "This ticket has been cancelled or refunded and is void.",
    };
  }

  if (ticket.status === "used" || ticket.checked_in_at) {
    await adminClient.from("checkins").insert({
      ticket_id: ticket.id,
      staff_id: user.id,
      is_successful: false,
      failure_reason: "ALREADY_USED",
    });

    const timeStr = ticket.checked_in_at
      ? new Date(ticket.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "earlier";

    return {
      success: false,
      status: "ALREADY_USED",
      ticketCode: ticket.ticket_code,
      buyerName: ticket.buyer_name,
      previousScannedAt: ticket.checked_in_at,
      message: `ALREADY USED: This ticket was already checked in at ${timeStr}. Second entry denied.`,
    };
  }

  // Atomically mark as checked in
  const now = new Date().toISOString();
  await adminClient
    .from("tickets")
    .update({
      status: "used",
      checked_in_at: now,
      checked_in_by: user.id,
    })
    .eq("id", ticket.id);

  await adminClient.from("checkins").insert({
    ticket_id: ticket.id,
    staff_id: user.id,
    is_successful: true,
  });

  return {
    success: true,
    status: "VALID",
    ticketCode: ticket.ticket_code,
    buyerName: ticket.buyer_name,
    tierName: (ticket as any).ticket_tiers?.name ?? "General Pass",
    scannedAt: now,
    message: "Valid Ticket! Entry Approved.",
  };
}
