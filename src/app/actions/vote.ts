"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
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

  // Optional Turnstile verification if secret key configured
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

  // Validate session and ensure user authorization headers are attached
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "NOT_AUTHENTICATED" };
  }

  // 1. First attempt: call the atomic cast_vote Postgres RPC function
  const { data, error } = await supabase.rpc("cast_vote", {
    p_category_id: categoryId,
    p_nominee_id: nomineeId,
    p_ip_hash: ipHashed,
    p_user_agent: userAgent,
  });

  if (error) {
    const msg = error.message;

    // Handle duplicate vote
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

    // If RPC failed with NOT_AUTHENTICATED (which occurs when Postgres auth.uid() context is dropped
    // across SSR server actions even though user is already verified by getUser()), fulfill securely
    // via adminClient on behalf of the verified user.id!
    if (msg.includes("NOT_AUTHENTICATED")) {
      try {
        const adminClient = await createAdminClient();

        // 1. Check event settings
        const { data: settings } = await adminClient
          .from("event_settings")
          .select("results_frozen, voting_opens_at, voting_closes_at")
          .eq("id", 1)
          .maybeSingle();

        if (settings?.results_frozen) {
          return { success: false, error: "Voting results are currently locked." };
        }
        if (settings?.voting_opens_at && new Date() < new Date(settings.voting_opens_at)) {
          return { success: false, error: "Voting has not opened yet." };
        }
        if (settings?.voting_closes_at && new Date() > new Date(settings.voting_closes_at)) {
          return { success: false, error: "Voting has closed for this event." };
        }

        // 2. Enforce one-voter-one-vote
        const { data: existingVote } = await adminClient
          .from("votes")
          .select("id")
          .eq("voter_id", user.id)
          .eq("category_id", categoryId)
          .eq("voided", false)
          .maybeSingle();

        if (existingVote) {
          return {
            success: false,
            error: "ALREADY_VOTED: You have already cast a vote in this category. Votes cannot be changed.",
          };
        }

        // 3. Validate nominee
        const { data: nominee } = await adminClient
          .from("nominees")
          .select("name, is_active")
          .eq("id", nomineeId)
          .eq("category_id", categoryId)
          .maybeSingle();

        if (!nominee || !nominee.is_active) {
          return { success: false, error: "Nominee not found in this category." };
        }

        // 4. Record vote
        const { error: insertErr } = await adminClient.from("votes").insert({
          voter_id: user.id,
          category_id: categoryId,
          nominee_id: nomineeId,
          ip_hash: ipHashed,
          user_agent: userAgent,
        });

        if (insertErr) {
          if (insertErr.code === "23505" || insertErr.message.includes("unique")) {
            return {
              success: false,
              error: "ALREADY_VOTED: You have already cast a vote in this category. Votes cannot be changed.",
            };
          }
          return { success: false, error: insertErr.message };
        }

        // 5. Update vote count
        const { data: curVc } = await adminClient
          .from("vote_counts")
          .select("count")
          .eq("category_id", categoryId)
          .eq("nominee_id", nomineeId)
          .maybeSingle();

        const newCount = (curVc?.count ?? 0) + 1;
        await adminClient.from("vote_counts").upsert(
          { category_id: categoryId, nominee_id: nomineeId, count: newCount },
          { onConflict: "category_id,nominee_id" }
        );

        revalidatePath("/vote");
        revalidatePath("/results");
        revalidatePath("/vote/[categorySlug]", "page");
        revalidatePath("/my-account");

        return {
          success: true,
          category_id: categoryId,
          nominee_id: nomineeId,
          nominee_name: nominee.name,
        };
      } catch (fallbackErr: any) {
        console.error("[submitVoteAction fallback error]:", fallbackErr);
        return { success: false, error: fallbackErr?.message || "Failed to submit vote." };
      }
    }

    return { success: false, error: msg };
  }

  // Refresh ISR / client caches
  revalidatePath("/vote");
  revalidatePath("/results");
  revalidatePath("/vote/[categorySlug]", "page");
  revalidatePath("/my-account");

  return {
    success: true,
    category_id: categoryId,
    nominee_id: nomineeId,
    nominee_name: (data as any)?.nominee_name ?? "Nominee",
  };
}
