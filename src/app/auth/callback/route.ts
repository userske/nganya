import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Handles Supabase auth redirects (magic link clicks).
 *
 * 1. Exchanges the one-time code for session cookies
 * 2. Writes session cookies directly to the redirect response with full options
 * 3. Upserts profile and assigns admin role if email matches
 * 4. Redirects to destination (Admin -> /admin, Voter -> next or /vote)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");

  if (!code) {
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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("Auth callback error exchanging code:", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const userEmail = (data.user.email || "").toLowerCase().trim();

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
      .eq("id", data.user.id)
      .maybeSingle();

    const roleToAssign =
      isAdmin || existingProfile?.role === "admin"
        ? "admin"
        : (existingProfile?.role ?? "voter");

    await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email_normalized: userEmail,
        role: roleToAssign,
      },
      { onConflict: "id" }
    );
  } catch (err) {
    console.error("Profile upsert warning:", err);
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
