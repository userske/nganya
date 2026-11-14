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

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20 flex items-center justify-center">
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
    .order("sort_order", { ascending: true })
    .limit(2000);

  // 3. Orders — fetch all relevant fields including ticket_tiers name
  const { data: orders, error: ordersError } = await adminClient
    .from("orders")
    .select("id, order_number, buyer_name, buyer_email, buyer_phone, quantity, total_amount_kes, status, created_at, tier_id, ticket_tiers(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (ordersError) {
    console.error("[Admin] Orders fetch error:", ordersError.message);
  }

  // 4. Ticket Tiers
  const { data: ticketTiers } = await adminClient
    .from("ticket_tiers")
    .select("*")
    .order("sort_order", { ascending: true });

  // 5. Total Votes — calculate maximum between sum of vote_counts and verified votes table
  const { data: counts } = await adminClient
    .from("vote_counts")
    .select("count")
    .limit(5000);

  const sumCounts = (counts || []).reduce((acc, c) => acc + Number(c.count), 0);

  const { count: rawVotesCount } = await adminClient
    .from("votes")
    .select("id", { count: "exact", head: true })
    .eq("voided", false);

  const totalVotes = Math.max(sumCounts, rawVotesCount || 0);

  // 6. Audit Log
  const { data: auditLogs } = await adminClient
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  // 7. Suspicious IP clusters (IPs with 3+ active votes)
  const { data: clusterVotes } = await adminClient
    .from("votes")
    .select("ip_hash")
    .eq("voided", false)
    .limit(10000);

  const ipMap: Record<string, { ip_hash: string; votes_count: number; voters_count: number }> = {};
  if (clusterVotes) {
    for (const v of clusterVotes) {
      if (!v.ip_hash) continue;
      if (!ipMap[v.ip_hash]) {
        ipMap[v.ip_hash] = { ip_hash: v.ip_hash, votes_count: 0, voters_count: 0 };
      }
      ipMap[v.ip_hash].votes_count++;
      ipMap[v.ip_hash].voters_count++;
    }
  }
  const suspiciousIps = Object.values(ipMap)
    .filter((c) => c.votes_count >= 3)
    .sort((a, b) => b.votes_count - a.votes_count)
    .slice(0, 25);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
        <AdminDashboardClient
          initialSettings={settings || {}}
          categories={categories || []}
          orders={orders || []}
          ticketTiers={ticketTiers || []}
          suspiciousIps={suspiciousIps}
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
