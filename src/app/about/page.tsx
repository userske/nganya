import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Trophy, Star, ShieldCheck, Heart, Sparkles, MapPin, Calendar, Clock, Ticket, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About the Gala — Coastal Nganya Awards",
  description: "Learn about the mission, history, and community behind Mombasa's premiere matatu and nganya awards.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              The Culture & Vision
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Honouring the Heartbeat of Coast Roads
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
              Mombasa’s nganyas are more than transport — they are rolling canvases of custom art, acoustic innovation, youth empowerment, and coastal resilience.
            </p>
          </div>

          {/* Narrative Content */}
          <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 text-slate-300 leading-relaxed text-sm sm:text-base">
            <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight text-amber-400">
              Why Coastal Nganya Awards?
            </h2>
            <p>
              For decades, the Coast matatu culture has pioneered some of the country&apos;s most breathtaking graphic art, bespoke fabrication, and state-of-the-art audio installations. From the bustling streets of Jomvu to Kisauni, Mikindani, Likoni, and Mombasa Island, these vehicles define the daily pulse of our city.
            </p>
            <p>
              The <strong>Coastal Nganya Awards</strong> was established to give overdue recognition to the dedicated men and women behind the wheel, the conductors keeping commuters safe and energized, the fabrication workshops sculpting aerodynamic body kits, the audio engineers, and the visionary sacco leaderships elevating our transport sector.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 my-6 border-y border-white/10">
              <div className="p-4 rounded-xl bg-white/[0.03]">
                <Trophy className="w-6 h-6 text-amber-400 mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">61 Award Headings</h4>
                <p className="text-xs text-slate-400">Covering every major route, custom craftsmanship, acoustics, and fleet leadership.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03]">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">Transparent Voting</h4>
                <p className="text-xs text-slate-400">Strict one voter = one vote policy backed by realtime cryptographic tallies.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03]">
                <Heart className="w-6 h-6 text-rose-400 mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">Community Pride</h4>
                <p className="text-xs text-slate-400">Uniting passengers, crews, and artists in a night of shared celebration.</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white uppercase tracking-tight pt-2">
              Event Details & Logistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-white/5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Saturday, Dec 6, 2025</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-white/5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>6:00 PM EAT Gala Entry</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-white/5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Mombasa Cement Grounds</span>
              </div>
            </div>
          </div>

          {/* Bottom CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-8 h-12 rounded-xl">
              <Link href="/tickets">
                <Ticket className="w-4 h-4 mr-2" />
                Get Your Digital Pass
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 text-white font-bold px-8 h-12 rounded-xl">
              <Link href="/vote">
                <Vote className="w-4 h-4 mr-2 text-amber-400" />
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
