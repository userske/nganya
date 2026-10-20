"use client";

import Link from "next/link";
import { Trophy, Mail, MapPin, Calendar, Heart, Shield, Ticket, Vote, Lock } from "lucide-react";

interface FooterProps {
  eventData: {
    event_name?: string;
    venue_name?: string;
    event_date?: string;
    event_time?: string;
  };
}

export function Footer({ eventData }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#020408] border-t border-white/10 text-slate-400 text-sm overflow-hidden">
      {/* Decorative top border glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-[#050810] rounded-[10px] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <span className="font-extrabold tracking-wider uppercase text-white text-lg">
                Coastal Nganya Awards
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Mombasa’s official awards recognizing custom matatu fabrication, competition acoustics, crew discipline, and coastal route excellence.
            </p>
            <div className="pt-2 text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500/80" />
                <span>{eventData.event_date ?? "December 2025"} • {eventData.event_time ?? "6:00 PM EAT"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500/80" />
                <span>{eventData.venue_name ?? "Mombasa Cement Grounds, Mombasa, Kenya"}</span>
              </div>
            </div>
          </div>

          {/* Public Nav */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-white mb-4">
              Event & Voting
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/vote" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Vote className="w-3.5 h-3.5 text-amber-400/80" />
                  Vote for Nominees
                </Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-amber-400 transition-colors">
                  Live Public Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/tickets" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-amber-400/80" />
                  Buy Tickets (Guest)
                </Link>
              </li>
              <li>
                <Link href="/my-tickets" className="hover:text-amber-400 transition-colors">
                  Download My Tickets
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-white mb-4">
              Information
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About the Gala
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
                  Terms of Voting & Sales
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy (KDPA)
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Admin */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-white mb-4">
              Integrity & Admin
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Protected by Cloudflare Turnstile & Postgres Unique Locks</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-400">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>HMAC Signed QR Tickets with Door Scanner Validation</span>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition-colors"
                >
                  Admin Portal &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {currentYear} Coastal Nganya Awards. Built with pride for Mombasa Matatu Culture. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms
            </Link>
            <span>•</span>
            <span>Kenya Data Protection Act Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
