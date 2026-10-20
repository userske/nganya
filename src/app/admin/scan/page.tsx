import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DoorScannerClient } from "@/components/admin/DoorScannerClient";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
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
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        {isAuthorized ? (
          <DoorScannerClient />
        ) : (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">
              Staff Access Required
            </h1>
            <p className="text-white/50 text-xs sm:text-sm mb-6 leading-relaxed">
              This door scanning terminal is restricted to authorized event security, ushers, and administrators. Please log in with an authorized staff account.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-white hover:bg-white/90 text-black font-semibold focus-visible:ring-2 focus-visible:ring-white">
                <Link href="/login?next=/admin/scan">Log In as Staff</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/20 hover:bg-white/5 text-white focus-visible:ring-2 focus-visible:ring-white">
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
