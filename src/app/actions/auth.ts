"use server";

import { Resend } from "resend";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  normalizeEmail,
  isDisposableEmail,
  isValidEmailFormat,
  checkEmailTypo,
} from "@/lib/auth/email";

export interface AuthActionResult {
  success: boolean;
  message?: string;
  error?: string;
  suggestedEmail?: string;
  rateLimited?: boolean;
  retryAfterSeconds?: number;
}

/**
 * Builds the official Coastal Nganya Awards responsive dark-mode HTML email.
 */
function buildMagicLinkEmailHtml(magicLinkUrl: string, recipientEmail: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Your Magic Sign-In Link</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; background-color: #0d0d0d; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);">
          
          <!-- Gold Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="padding: 36px 32px 24px 32px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <div style="display: inline-block; background-color: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; margin-bottom: 16px;">
                COASTAL NGANYA AWARDS 2026
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em; text-transform: uppercase;">
                Your 1-Click Sign-In Link
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.65); line-height: 1.6;">
                Tap the button below to confirm your identity. Your session will be authenticated and your vote counted instantly.
              </p>
            </td>
          </tr>

          <!-- CTA Button Section -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #f59e0b; border-radius: 14px; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.35);">
                    <a href="${magicLinkUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #f59e0b; color: #000000; font-size: 15px; font-weight: 800; text-decoration: none; padding: 16px 38px; border-radius: 14px; letter-spacing: 0.02em; text-transform: uppercase;">
                      Log In & Confirm Vote &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 28px 0 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.45); line-height: 1.6;">
                This link was requested for <strong style="color: #ffffff;">${recipientEmail}</strong>.<br>
                It is valid for <strong>1 hour</strong> and can only be used once.
              </p>
            </td>
          </tr>

          <!-- Plain Text URL Fallback -->
          <tr>
            <td style="padding: 0 32px 28px 32px; text-align: left;">
              <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 12px 14px; word-break: break-all;">
                <p style="margin: 0 0 6px 0; font-size: 11px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">
                  Button not working? Copy and paste this link:
                </p>
                <a href="${magicLinkUrl}" style="color: #fbbf24; font-size: 11px; text-decoration: underline; font-family: monospace;">
                  ${magicLinkUrl}
                </a>
              </div>
            </td>
          </tr>

          <!-- Security Footer -->
          <tr>
            <td style="padding: 20px 32px; text-align: center; background-color: #080808; border-top: 1px solid rgba(255, 255, 255, 0.06);">
              <p style="margin: 0; font-size: 11px; color: rgba(255, 255, 255, 0.35); line-height: 1.5;">
                If you did not request this email, you can safely ignore it.<br>
                &copy; 2026 Coastal Nganya Awards &middot; Mombasa, Kenya &middot; Public, transparent & direct voting.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a passwordless magic link email.
 *
 * Delivery Strategy:
 * 1. Primary: Uses Supabase's native signInWithOtp, which routes through the Custom SMTP
 *    configured in your Supabase Dashboard.
 * 2. Fallback: If Supabase Custom SMTP hits project rate limits or fails, attempts
 *    direct generation and delivery via Resend (if configured).
 */
export async function sendOtpAction(
  rawEmail: string,
  turnstileToken?: string,
  redirectPath?: string
): Promise<AuthActionResult> {
  const email = normalizeEmail(rawEmail);

  if (!email || !isValidEmailFormat(email)) {
    return { success: false, error: "Please enter a valid, complete email address." };
  }

  const typoFix = checkEmailTypo(rawEmail);
  if (typoFix) {
    return {
      success: false,
      error: `Did you mean ${typoFix}? Please check your email spelling.`,
      suggestedEmail: typoFix,
    };
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

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://coastalnganyaawards.com").replace(/\/$/, "");
  const targetNext = redirectPath && redirectPath.startsWith("/") ? redirectPath : "/vote";
  const callbackUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(targetNext)}`;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. PRIMARY PATH: SUPABASE CUSTOM SMTP
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const supabase = await createClient();

    const { error: supaError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: callbackUrl,
      },
    });

    if (!supaError) {
      console.log(`[sendOtpAction] Magic link dispatched via Supabase Custom SMTP to ${email}`);
      return {
        success: true,
        message: `Sign-in link sent to ${email}`,
      };
    }

    // Inspect error
    console.warn("[sendOtpAction] Supabase Custom SMTP error:", supaError.message, supaError.status);
    const msg = (supaError.message || "").toLowerCase();
    const isRateLimit =
      supaError.status === 429 ||
      (supaError as any).code === "over_email_send_rate_limit" ||
      msg.includes("rate limit") ||
      msg.includes("security purposes") ||
      msg.includes("too many requests") ||
      msg.includes("once every");

    // ─────────────────────────────────────────────────────────────────────────
    // 2. FALLBACK PATH: DIRECT RESEND (if Supabase rate-limited or fails)
    // ─────────────────────────────────────────────────────────────────────────
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const adminClient = await createAdminClient();
        const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: {
            redirectTo: callbackUrl,
          },
        });

        if (!linkError && linkData) {
          const hashedToken = linkData.properties?.hashed_token;
          const verificationType = linkData.properties?.verification_type || "magiclink";

          const magicLinkUrl = hashedToken
            ? `${siteUrl}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=${encodeURIComponent(
                verificationType
              )}&next=${encodeURIComponent(targetNext)}`
            : linkData.properties?.action_link;

          if (magicLinkUrl) {
            const resend = new Resend(resendApiKey);
            const fromAddress = process.env.EMAIL_FROM || "noreply@coastalnganyaawards.com";
            const sender = fromAddress.includes("<")
              ? fromAddress
              : `Coastal Nganya Awards <${fromAddress}>`;

            const emailRes = await resend.emails.send({
              from: sender,
              to: email,
              subject: "Your Magic Sign-In Link — Coastal Nganya Awards 2026",
              html: buildMagicLinkEmailHtml(magicLinkUrl, email),
            });

            if (emailRes.data?.id) {
              console.log(`[sendOtpAction] Magic link sent via fallback Resend: ${emailRes.data.id}`);
              return {
                success: true,
                message: `Sign-in link sent to ${email}`,
              };
            }
          }
        }
      } catch (resendFallbackErr) {
        console.warn("[sendOtpAction] Resend fallback also failed:", resendFallbackErr);
      }
    }

    // If rate limit caused the failure
    if (isRateLimit) {
      const match = supaError.message.match(/(\d+)\s*second/i);
      const retryAfter = match ? parseInt(match[1], 10) : 60;
      return {
        success: false,
        rateLimited: true,
        retryAfterSeconds: retryAfter,
        error: `Supabase email rate limit reached (${retryAfter}s cooldown). Increase "Rate limit for sending emails" in Supabase Dashboard -> Authentication -> Rate Limits.`,
      };
    }

    return { success: false, error: supaError.message };
  } catch (err: any) {
    console.error("[sendOtpAction] Unexpected error:", err);
    return {
      success: false,
      error: err?.message || "Failed to send magic link. Please try again.",
    };
  }
}

/**
 * Verifies a 6-digit OTP token (kept for admin fallback).
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
    const adminEmails = [
      "info@coastalnganyaawards.com",
      "usersessionsio@gmail.com",
      ...(process.env.ADMIN_EMAIL
        ? process.env.ADMIN_EMAIL.split(",").map((e: string) => e.trim().toLowerCase())
        : []),
    ];
    const isAdmin = adminEmails.includes(email.toLowerCase().trim());

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
