"use server";

import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { PaystackClient } from "@/lib/payments/paystack";
import { normalizeEmail } from "@/lib/auth/email";

const CheckoutSchema = z.object({
  tierId: z.string().uuid("Invalid tier selected"),
  quantity: z.number().int().min(1, "Must select at least 1 ticket").max(10, "Maximum 10 tickets per order"),
  buyerName: z.string().trim().min(2, "Name must be at least 2 characters"),
  buyerEmail: z.string().trim().email("Please provide a valid email address"),
  buyerPhone: z.string().trim().min(9, "Please enter a valid phone number (e.g. 0712345678)"),
});

export interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  orderNumber?: string;
  error?: string;
}

export async function createTicketCheckoutAction(
  formData: {
    tierId: string;
    quantity: number;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
  }
): Promise<CheckoutResult> {
  const parsed = CheckoutSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

  const { tierId, quantity, buyerName, buyerEmail, buyerPhone } = parsed.data;
  const normalizedEmail = normalizeEmail(buyerEmail);

  const supabase = await createClient();

  // 1. Check if ticket sales are open
  const { data: settings } = await supabase
    .from("event_settings")
    .select("ticket_sales_open")
    .eq("id", 1)
    .single();

  if (settings && !settings.ticket_sales_open) {
    return { success: false, error: "Ticket sales are currently paused by the event organizers." };
  }

  // 2. Reserve tickets atomically via Postgres function
  const { data: reservation, error: reserveError } = await supabase.rpc(
    "reserve_tickets",
    {
      p_tier_id: tierId,
      p_quantity: quantity,
      p_buyer_name: buyerName,
      p_buyer_email: normalizedEmail,
      p_buyer_phone: buyerPhone,
    }
  );

  if (reserveError || !reservation) {
    const msg = reserveError?.message || "Failed to reserve tickets.";
    if (msg.includes("CAPACITY_REACHED")) {
      return { success: false, error: "Sorry, this ticket tier has reached maximum capacity." };
    }
    return { success: false, error: msg };
  }

  const orderId = (reservation as any).order_id;
  const orderNumber = (reservation as any).order_number;
  const amountKes = (reservation as any).amount_kes;

  // 3. Initialize Paystack Transaction
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://coastalngayaawards.com";
  const callbackUrl = `${siteUrl}/tickets/success?ref=${orderNumber}`;

  const paystack = new PaystackClient();
  const paystackInit = await paystack.initializeTransaction({
    amountKes,
    email: normalizedEmail,
    reference: orderNumber,
    callbackUrl,
    metadata: {
      order_id: orderId,
      buyer_name: buyerName,
      tier_id: tierId,
    },
  });

  if (!paystackInit.status || !paystackInit.data?.authorization_url) {
    return {
      success: false,
      error: paystackInit.message || "Failed to initialize payment gateway. Please try again.",
    };
  }

  return {
    success: true,
    checkoutUrl: paystackInit.data.authorization_url,
    orderNumber,
  };
}

/**
 * Guest ticket lookup by email for /my-tickets
 */
export interface GuestTicketsResult {
  success: boolean;
  tickets?: any[];
  error?: string;
}

export async function lookupGuestTicketsAction(rawEmail: string): Promise<GuestTicketsResult> {
  const normalizedEmail = normalizeEmail(rawEmail);
  if (!normalizedEmail) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const supabase = await createAdminClient();

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("id, ticket_code, status, qr_payload, created_at, ticket_tiers(name, price_kes), orders(order_number)")
    .eq("buyer_email", normalizedEmail)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    tickets: (tickets as any[]) ?? [],
  };
}
