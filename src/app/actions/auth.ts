"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizeEmail, isDisposableEmail } from "@/lib/auth/email";

export interface AuthActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Sends a magic link email for passwordless sign-in.
 * After clicking the link, the user is sent to /auth/callback which
 * exchanges the code for a session and redirects to `redirectPath`.
 */
export async function sendOtpAction(
  rawEmail: string,
  turnstileToken?: string,
  redirectPath?: string
): Promise<AuthActionResult> {
  const email = normalizeEmail(rawEmail);

  if (!email || !email.includes("@")) {
    return { success: false, error: "Please provide a valid email address." };
  }

  if (isDisposableEmail(email)) {
    return {
      success: false,
      error: "Temporary or disposable email addresses are not permitted for voting.",
    };
  }

  // Optional Cloudflare Turnstile verification
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
      // Non-blocking
    }
  }

  const supabase = await createClient();

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://coastalnganyaawards.com").replace(/\/$/, "");

  // Build the callback URL — includes ?next= so the user lands back on their vote page
  const callbackUrl = redirectPath
    ? `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectPath)}`
    : `${siteUrl}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: callbackUrl,
    },
  });

  if (error) {
    console.error("Supabase magic link error:", error.message);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: `Sign-in link sent to ${email}`,
  };
}

/**
 * Verifies a 6-digit OTP token (kept for admin login page fallback).
 */
export async function verifyOtpAction(
  rawEmail: string,
  token: string
): Promise<AuthActionResult> {
  const email = normalizeEmail(rawEmail);
  const cleanToken = token.trim();

  if (!email || !cleanToken) {
    return { success: false, error: "Email and verification code are required." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: cleanToken,
    type: "email",
  });

  if (error) {
    return {
      success: false,
      error: "Invalid or expired verification code. Please check and try again.",
    };
  }

  // Ensure profile exists and assign admin role if applicable
  if (data.user) {
    const adminEmail = (process.env.ADMIN_EMAIL || "info@coastalnganyaawards.com").toLowerCase().trim();
    const isAdmin = email.toLowerCase().trim() === adminEmail;

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const roleToAssign =
      isAdmin || existingProfile?.role === "admin"
        ? "admin"
        : (existingProfile?.role ?? "voter");

    await supabase.from("profiles").upsert(
      { id: data.user.id, email_normalized: email, role: roleToAssign },
      { onConflict: "id" }
    );
  }

  return {
    success: true,
    message: "Verified successfully!",
  };
}
