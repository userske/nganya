import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Operations — Coastal Nganya Awards",
  description: "Executive control panel for event settings, categories, ticketing, and voting monitoring.",
};

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin") {
      isAdmin = true;
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28 flex items-center justify-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">
              Admin Access Required
            </h1>
            <p className="text-white/50 text-xs sm:text-sm mb-6 leading-relaxed">
              You must be signed in with an authorized Administrator account to view event operations, settings, and ticketing analytics.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-white hover:bg-white/90 text-black font-semibold focus-visible:ring-2 focus-visible:ring-white">
                <Link href="/login?next=/admin">Log In as Administrator</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/20 hover:bg-white/5 text-white focus-visible:ring-2 focus-visible:ring-white">
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

  // 3. Orders
  const { data: orders } = await adminClient
    .from("orders")
    .select("id, order_number, buyer_name, buyer_email, buyer_phone, quantity, total_amount_kes, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  // 4. Total Votes
  const { data: counts } = await adminClient
    .from("vote_counts")
    .select("count");

  const totalVotes = (counts || []).reduce((acc, c) => acc + Number(c.count), 0);

  // 5. Audit Log
  const { data: auditLogs } = await adminClient
    .from("audit_log")
    .select("id, action, entity_type, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <AdminDashboardClient
          initialSettings={settings}
          categories={categories || []}
          orders={orders || []}
          suspiciousIps={[]}
          auditLogs={auditLogs || []}
          totalVotes={totalVotes}
        />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
