"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizeEmail, isDisposableEmail } from "@/lib/auth/email";

export interface AuthActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Sends a 6-digit email OTP to the voter or admin.
 */
export async function sendOtpAction(
  rawEmail: string,
  turnstileToken?: string
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

  // Optional Cloudflare Turnstile verification if secret key is configured
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
      // In non-blocking network failure, proceed
    }
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      // We use email OTP codes (6 digits), not links
    },
  });

  if (error) {
    console.error("Supabase OTP send error:", error.message);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: `A 6-digit verification code was sent to ${email}`,
  };
}

/**
 * Verifies the 6-digit email OTP and sets up the session.
 */
export async function verifyOtpAction(
  rawEmail: string,
  token: string
): Promise<AuthActionResult> {
  const email = normalizeEmail(rawEmail);
  const cleanToken = token.trim();

  if (!email || !cleanToken) {
    return { success: false, error: "Email and 6-digit code are required." };
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

  // Ensure voter/admin profile exists with normalized email
  if (data.user) {
    const adminEmail = (process.env.ADMIN_EMAIL || "info@coastalnganyaawards.com").toLowerCase().trim();
    const isAdmin = email.toLowerCase().trim() === adminEmail;

    // Check existing profile so we never demote an admin
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const roleToAssign = isAdmin || existingProfile?.role === "admin" ? "admin" : (existingProfile?.role ?? "voter");

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          email_normalized: email,
          role: roleToAssign,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.error("Profile upsert warning:", profileError.message);
    }
  }

  return {
    success: true,
    message: "Verified successfully! You can now cast your votes across all categories.",
  };
}
