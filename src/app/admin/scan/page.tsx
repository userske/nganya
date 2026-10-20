import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DoorScannerClient } from "@/components/admin/DoorScannerClient";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Door Ticket Scanner — Staff Portal",
  description: "Gate check-in and QR ticket validation scanner.",
};

export default async function AdminScanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAuthorized = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && (profile.role === "admin" || profile.role === "staff")) {
      isAuthorized = true;
    }
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        {isAuthorized ? (
          <DoorScannerClient />
        ) : (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#0c1220] border border-amber-500/20 text-center shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
              Staff / Admin Access Required
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
              This door scanning terminal is restricted to authorized event security, ushers, and administrators. Please log in with an authorized staff account.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold">
                <Link href="/login?next=/admin/scan">Log In as Staff</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
