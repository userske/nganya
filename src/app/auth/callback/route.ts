import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Handles Supabase auth redirects (magic link clicks).
 * URL shape: /auth/callback?code=xxx&next=/vote/sound-beast
 *
 * 1. Exchanges the code for a session (sets auth cookies)
 * 2. Upserts the user's profile and assigns admin role if applicable
 * 3. Redirects to `next` param (defaults to /)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("Auth callback error:", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Upsert profile and assign admin role if email matches
  const adminEmail = (
    process.env.ADMIN_EMAIL || "info@coastalnganyaawards.com"
  ).toLowerCase().trim();

  const userEmail = (data.user.email || "").toLowerCase().trim();
  const isAdmin = userEmail === adminEmail;

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

  // Safe redirect — only allow relative paths to prevent open redirect
  const safePath = next.startsWith("/") ? next : "/";
  return NextResponse.redirect(`${origin}${safePath}`);
}
