import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MyTicketsClient } from "@/components/tickets/MyTicketsClient";

export const metadata = {
  title: "Retrieve My Tickets — Coastal Nganya Awards",
  description: "Look up and re-download your digital event tickets and gate QR passes.",
};

export default function MyTicketsPage() {
  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <MyTicketsClient />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
