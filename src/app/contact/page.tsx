import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Phone, MapPin, MessageSquare, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const metadata = {
  title: "Contact & Partnerships — Coastal Nganya Awards",
  description: "Reach the Coastal Nganya Awards committee for sponsorships, media inquiries, or ticketing support.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Get In Touch
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Contact & Support
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Have questions regarding ticket bookings, nominee submissions, brand sponsorships, or press passes? We are here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Info Cards */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs uppercase font-mono font-bold">
                  <Mail className="w-4 h-4" />
                  Email Support
                </div>
                <div className="text-sm font-semibold text-white">
                  tickets@coastalngayaawards.com
                </div>
                <p className="text-xs text-slate-400">
                  For guest ticket lookup, receipt re-issues, and corporate group bookings.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs uppercase font-mono font-bold">
                  <MessageSquare className="w-4 h-4" />
                  Sponsorships & Media
                </div>
                <div className="text-sm font-semibold text-white">
                  partners@coastalngayaawards.com
                </div>
                <p className="text-xs text-slate-400">
                  For brand placements, VIP lounge tables, and red carpet media accreditation.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs uppercase font-mono font-bold">
                  <MapPin className="w-4 h-4" />
                  Event Secretariat
                </div>
                <div className="text-sm font-semibold text-white">
                  Mombasa Cement Grounds, Mombasa, Kenya
                </div>
                <p className="text-xs text-slate-400">
                  Coast Matatu Owners Association Advisory Desk.
                </p>
              </div>
            </div>

            {/* Direct Message Form */}
            <div className="md:col-span-7 p-8 rounded-3xl bg-[#0c1220]/90 border border-amber-500/20 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 pb-3 border-b border-white/10">
                Send Us a Message
              </h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase text-slate-300">Name</Label>
                    <Input placeholder="Your full name" className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase text-slate-300">Phone</Label>
                    <Input placeholder="e.g. 0712345678" className="bg-white/5 border-white/10 text-white" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase text-slate-300">Email Address</Label>
                  <Input type="email" placeholder="yourname@gmail.com" className="bg-white/5 border-white/10 text-white" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase text-slate-300">Message</Label>
                  <Textarea rows={4} placeholder="How can we assist you today?" className="bg-white/5 border-white/10 text-white resize-none" />
                </div>

                <Button type="button" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold h-11 rounded-xl">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
