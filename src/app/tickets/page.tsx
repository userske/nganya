import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TicketCheckoutClient } from "@/components/tickets/TicketCheckoutClient";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // Refresh ticket availability every minute

const DEFAULT_TIERS = [
  {
    id: "default-tier-regular",
    name: "Early Bird Regular",
    description: "Standard event admission with full acoustic arena access.",
    price_kes: 1000,
    capacity: 500,
    sold_count: 0,
    perks: ["Gate Entry", "Standard Arena Seating", "Live Sound Access", "Digital QR Ticket"],
    is_active: true,
  },
  {
    id: "default-tier-vip",
    name: "VIP Lounge Pass",
    description: "Priority entrance, VIP lounge seating & complimentary drink.",
    price_kes: 3500,
    capacity: 150,
    sold_count: 0,
    perks: ["VIP Red Carpet Entry", "Front Stage Access", "Complimentary Drink Voucher", "Official Event Badge"],
    is_active: true,
  },
  {
    id: "default-tier-vvip",
    name: "VVIP Table of 5",
    description: "Reserved high-profile table for 5 with bottle service & parking pass.",
    price_kes: 20000,
    capacity: 30,
    sold_count: 0,
    perks: ["Reserved Table of 5", "Dedicated Host Service", "Full Bottle Service & Platter", "Backstage & VIP Parking Passes"],
    is_active: true,
  },
];

export default async function TicketsPage() {
  const supabase = await createClient();

  const { data: tiersDb } = await supabase
    .from("ticket_tiers")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const tiers = tiersDb && tiersDb.length > 0 ? tiersDb : DEFAULT_TIERS;

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Official Gate Tickets
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-4">
            SECURE YOUR PASS
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Instant digital ticket delivery with signed QR code. Pay securely via <strong>M-Pesa</strong> or <strong>Card</strong> through Paystack. No login required.
          </p>
        </div>

        <TicketCheckoutClient tiers={tiers} />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
