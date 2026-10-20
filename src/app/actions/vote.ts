"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hashIp } from "@/lib/security/ip-hash";

export interface VoteResult {
  success: boolean;
  category_id?: string;
  nominee_id?: string;
  nominee_name?: string;
  error?: string;
}

export async function submitVoteAction(
  categoryId: string,
  nomineeId: string,
  turnstileToken?: string
): Promise<VoteResult> {
  if (!categoryId || !nomineeId) {
    return { success: false, error: "Category and Nominee IDs are required." };
  }

  // Turnstile verification if secret key configured
  if (process.env.TURNSTILE_SECRET_KEY && turnstileToken) {
    try {
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: "Bot verification failed. Please try again." };
      }
    } catch {
      // Proceed if verification service is unavailable
    }
  }

  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
  const userAgent = headerList.get("user-agent") ?? "unknown";
  const ipHashed = hashIp(realIp);

  const supabase = await createClient();

  // Call the atomic cast_vote Postgres function
  const { data, error } = await supabase.rpc("cast_vote", {
    p_category_id: categoryId,
    p_nominee_id: nomineeId,
    p_ip_hash: ipHashed,
    p_user_agent: userAgent,
  });

  if (error) {
    const msg = error.message;
    if (msg.includes("NOT_AUTHENTICATED")) {
      return { success: false, error: "NOT_AUTHENTICATED" };
    }
    if (msg.includes("ALREADY_VOTED")) {
      return {
        success: false,
        error: "ALREADY_VOTED: You have already cast a vote in this category. Votes cannot be changed.",
      };
    }
    if (msg.includes("VOTING_CLOSED") || msg.includes("VOTING_NOT_OPEN")) {
      return {
        success: false,
        error: "Voting is currently closed for this event.",
      };
    }
    if (msg.includes("ACCOUNT_BLOCKED")) {
      return {
        success: false,
        error: "Your account is temporarily suspended from voting.",
      };
    }
    return { success: false, error: msg };
  }

  // Refresh ISR / client caches
  revalidatePath("/vote");
  revalidatePath("/results");

  return {
    success: true,
    category_id: categoryId,
    nominee_id: nomineeId,
    nominee_name: (data as any)?.nominee_name ?? "Nominee",
  };
}
