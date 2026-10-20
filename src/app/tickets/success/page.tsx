import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TicketSuccessClient } from "@/components/tickets/TicketSuccessClient";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ ref?: string; simulated?: string }>;
}

export default async function TicketSuccessPage({ searchParams }: SuccessPageProps) {
  const { ref, simulated } = await searchParams;

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <Suspense fallback={<div className="text-center text-slate-400">Loading order...</div>}>
          <TicketSuccessClient
            orderRef={ref || "DEMO-REF"}
            isSimulated={Boolean(simulated)}
          />
        </Suspense>
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
