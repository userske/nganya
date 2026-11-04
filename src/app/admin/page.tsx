import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Command Center — Coastal Nganya Awards",
  description: "Executive control panel for event settings, categories, ticketing, revenue, and voting monitoring.",
};

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmails = [
    "info@coastalnganyaawards.com",
    "usersessionsio@gmail.com",
    ...(process.env.ADMIN_EMAIL
      ? process.env.ADMIN_EMAIL.split(",").map((e: string) => e.trim().toLowerCase())
      : []),
  ];

  let isAdmin = false;

  if (user) {
    const userEmail = (user.email || "").toLowerCase().trim();
    const isEmailAdmin = adminEmails.includes(userEmail);

    const adminClient = await createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (isEmailAdmin || profile?.role === "admin") {
      isAdmin = true;

      // Auto-heal / persist admin role in DB so any Postgres RPC functions recognize the admin
      if (profile?.role !== "admin") {
        await adminClient.from("profiles").upsert(
          { id: user.id, email_normalized: userEmail, role: "admin" },
          { onConflict: "id" }
        );
      }
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28 flex items-center justify-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">
              Admin Access Required
            </h1>
            <p className="text-white/50 text-xs sm:text-sm mb-6 leading-relaxed">
              You must be signed in with an authorized Administrator account to view event operations, settings, and ticketing analytics.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold h-11 focus-visible:ring-2 focus-visible:ring-amber-400">
                <Link href="/login?next=/admin">Log In as Administrator</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/20 hover:bg-white/5 text-white h-11">
                <Link href="/">Back to Website</Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
      </div>
    );
  }

  // Admin is authenticated: load all operational data
  const adminClient = await createAdminClient();

  // 1. Settings
  const { data: settings } = await adminClient
    .from("event_settings")
    .select("*")
    .eq("id", 1)
    .single();

  // 2. Categories
  const { data: categories } = await adminClient
    .from("categories")
    .select("id, name, slug, group_name, sort_order, is_active")
    .order("sort_order", { ascending: true });

  // 3. Orders (Try adminClient, then fallback to authenticated supabase client)
  let orders: any[] = [];
  const { data: ordersWithTier } = await adminClient
    .from("orders")
    .select("id, order_number, buyer_name, buyer_email, buyer_phone, quantity, total_amount_kes, status, created_at, ticket_tiers(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (ordersWithTier && ordersWithTier.length > 0) {
    orders = ordersWithTier;
  } else {
    const { data: rawAdminOrders } = await adminClient
      .from("orders")
      .select("id, order_number, buyer_name, buyer_email, buyer_phone, quantity, total_amount_kes, status, created_at, tier_id")
      .order("created_at", { ascending: false })
      .limit(100);

    if (rawAdminOrders && rawAdminOrders.length > 0) {
      orders = rawAdminOrders;
    } else {
      // Fallback: authenticated client (leverages is_admin() RLS policy for logged-in admin)
      const { data: authOrders } = await supabase
        .from("orders")
        .select("id, order_number, buyer_name, buyer_email, buyer_phone, quantity, total_amount_kes, status, created_at, ticket_tiers(name)")
        .order("created_at", { ascending: false })
        .limit(100);
      orders = authOrders || [];
    }
  }

  // 4. Ticket Tiers
  const { data: ticketTiers } = await adminClient
    .from("ticket_tiers")
    .select("*")
    .order("sort_order", { ascending: true });

  // 5. Total Votes
  const { data: counts } = await adminClient
    .from("vote_counts")
    .select("count");

  const totalVotes = (counts || []).reduce((acc, c) => acc + Number(c.count), 0);

  // 6. Audit Log
  const { data: auditLogs } = await adminClient
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <AdminDashboardClient
          initialSettings={settings || {}}
          categories={categories || []}
          orders={orders || []}
          ticketTiers={ticketTiers || []}
          suspiciousIps={[]}
          auditLogs={auditLogs || []}
          totalVotes={totalVotes}
          adminUser={{
            id: user!.id,
            email: user!.email || "admin",
          }}
        />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
