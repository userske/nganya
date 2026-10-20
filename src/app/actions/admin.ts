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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("FORBIDDEN: Admin role required");
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
      event_date: formData.eventDate,
      event_time: formData.eventTime,
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

  await adminClient.from("audit_log").insert({
    actor_id: adminUser.id,
    action: "UPDATE_EVENT_SETTINGS",
    entity_type: "event_settings",
    entity_id: "1",
    details: formData,
  });

  revalidatePath("/");
  revalidatePath("/vote");
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
    action: isActive ? "ACTIVATE_CATEGORY" : "DEACTIVATE_CATEGORY",
    entity_type: "categories",
    entity_id: categoryId,
  });

  revalidatePath("/vote");
  revalidatePath("/results");
  revalidatePath("/admin");

  return { success: true };
}

export async function voidVoteAction(voteId: string, reason: string) {
  const adminUser = await verifyAdminRole();
  const adminClient = await createAdminClient();

  // 1. Fetch vote
  const { data: vote } = await adminClient
    .from("votes")
    .select("category_id, nominee_id, voided")
    .eq("id", voteId)
    .single();

  if (!vote || vote.voided) {
    return { success: false, error: "Vote already voided or not found" };
  }

  // 2. Mark voided
  await adminClient
    .from("votes")
    .update({ voided: true })
    .eq("id", voteId);

  // 3. Decrement count atomically
  const { error: rpcErr } = await adminClient.rpc("decrement_vote_count", {
    p_category_id: vote.category_id,
    p_nominee_id: vote.nominee_id,
  });

  if (rpcErr) {
    // Direct decrement fallback
    const { data: countRec } = await adminClient
      .from("vote_counts")
      .select("count")
      .eq("category_id", vote.category_id)
      .eq("nominee_id", vote.nominee_id)
      .single();

    if (countRec) {
      await adminClient
        .from("vote_counts")
        .update({ count: Math.max(0, Number(countRec.count) - 1) })
        .eq("category_id", vote.category_id)
        .eq("nominee_id", vote.nominee_id);
    }
  }

  await adminClient.from("audit_log").insert({
    actor_id: adminUser.id,
    action: "VOID_VOTE",
    entity_type: "votes",
    entity_id: voteId,
    details: { reason },
  });

  revalidatePath("/results");
  return { success: true };
}
