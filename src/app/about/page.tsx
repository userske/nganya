import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Trophy, ShieldCheck, Heart, MapPin, Calendar, Clock, Ticket, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About the Gala — Coastal Nganya Awards",
  description: "Learn about the mission, craftsmanship, and community behind Mombasa's matatu and nganya awards.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold uppercase tracking-widest mb-4">
              The Culture & Vision
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Mombasa&apos;s Arena for Fabricators, Crews, and Route Culture
            </h1>
            <p className="text-white/50 text-sm sm:text-base mt-4 leading-relaxed">
              Mombasa’s nganyas are street engineering at full tilt: bespoke fiberglass aero kits, competition-grade audio rigs, custom airbrushing, and the disciplined crews running coastal corridors daily.
            </p>
          </div>

          {/* Narrative Content */}
          <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 text-white/70 leading-relaxed text-sm sm:text-base">
            <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
              Why Coastal Nganya Awards?
            </h2>
            <p>
              Coast matatu culture has spent years driving Kenya&apos;s most distinctive fabrication, audio tuning, and graphics. From high-bass runs between Jomvu and Posta, to custom body kits cutting through Kisauni, Mikindani, and the Likoni ferry queues, these machines are built with serious workshop discipline.
            </p>
            <p>
              The <strong>Coastal Nganya Awards</strong> was established to give concrete recognition to the fabricators shaping custom panels, the audio technicians wiring multi-amp rigs, the drivers and conductors managing grueling shifts, and the sacco leaderships maintaining route order.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 my-6 border-y border-white/10">
              <div className="p-4 rounded-xl bg-white/[0.03]">
                <Trophy className="w-6 h-6 text-white/80 mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">61 Award Headings</h4>
                <p className="text-xs text-white/50">Covering every major route, custom craftsmanship, acoustics, and fleet leadership.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03]">
                <ShieldCheck className="w-6 h-6 text-white/80 mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">Transparent Voting</h4>
                <p className="text-xs text-white/50">Strict one voter = one vote policy backed by realtime cryptographic tallies.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03]">
                <Heart className="w-6 h-6 text-white/80 mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">Community Pride</h4>
                <p className="text-xs text-white/50">Uniting passengers, crews, and artists in a night of shared celebration.</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white uppercase tracking-tight pt-2">
              Event Details & Logistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-white/70">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/10">
                <Calendar className="w-4 h-4 text-white/60" />
                <span>Saturday, Dec 6, 2025</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/10">
                <Clock className="w-4 h-4 text-white/60" />
                <span>6:00 PM EAT Gala Entry</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/10">
                <MapPin className="w-4 h-4 text-white/60" />
                <span>Mombasa Cement Grounds</span>
              </div>
            </div>
          </div>

          {/* Bottom CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="bg-white hover:bg-white/90 text-black font-semibold px-8 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-white">
              <Link href="/tickets">
                <Ticket className="w-4 h-4 mr-2" />
                Get Your Digital Pass
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold px-8 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-white">
              <Link href="/vote">
                <Vote className="w-4 h-4 mr-2" />
                Vote for Nominees
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
