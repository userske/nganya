import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Handles Supabase auth redirects (magic link clicks).
 *
 * Supports both:
 * 1. Fast direct token_hash verification via Resend (instant 1-click magic link)
 * 2. Standard PKCE code exchange from Supabase
 *
 * Writes session cookies directly to the redirect response with full attributes.
 * Upserts profile and assigns admin role if email matches.
 * Redirects to destination (Admin -> /admin, Voter -> next or /vote).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") as any) || "magiclink";
  const nextParam = searchParams.get("next");

  if (!code && !tokenHash) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // Captured cookies with full attribute preservation
  const capturedCookies: Array<{ name: string; value: string; options: any }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          capturedCookies.push(...cookiesToSet);
        },
      },
    }
  );

  let user: any = null;

  // 1. Direct token_hash verification (Fast path from Resend instant magic links)
  if (tokenHash) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error || !data.user) {
      console.error("[Auth Callback] token_hash verification failed:", error?.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    user = data.user;
  }
  // 2. PKCE code exchange (Standard Supabase redirect path)
  else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error("[Auth Callback] Code exchange failed:", error?.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    user = data.user;
  }

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const userEmail = (user.email || "").toLowerCase().trim();

  // Recognized admin emails
  const adminEmails = [
    "info@coastalnganyaawards.com",
    "usersessionsio@gmail.com",
    ...(process.env.ADMIN_EMAIL
      ? process.env.ADMIN_EMAIL.split(",").map((e: string) => e.trim().toLowerCase())
      : []),
  ];
  const isAdmin = adminEmails.includes(userEmail);

  // Upsert profile in Supabase
  try {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const roleToAssign =
      isAdmin || existingProfile?.role === "admin"
        ? "admin"
        : (existingProfile?.role ?? "voter");

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email_normalized: userEmail,
        role: roleToAssign,
      },
      { onConflict: "id" }
    );
  } catch (err) {
    console.error("[Auth Callback] Profile upsert warning:", err);
  }

  // Target destination
  let finalDestination = "/vote";
  if (nextParam && nextParam.startsWith("/")) {
    finalDestination = nextParam;
  } else if (isAdmin) {
    finalDestination = "/admin";
  }

  // Create final redirect response and copy all captured cookies with full options
  const finalResponse = NextResponse.redirect(`${origin}${finalDestination}`);
  capturedCookies.forEach(({ name, value, options }) => {
    finalResponse.cookies.set(name, value, {
      ...options,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  });

  return finalResponse;
}
