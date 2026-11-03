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
