"use client";

import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";

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
    <footer className="relative bg-black border-t border-white/[0.06] text-white/40 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block">
              <span className="font-extrabold tracking-tight uppercase text-white text-lg">
                Coastal Nganya Awards
              </span>
            </Link>
            <p className="text-white/35 text-sm leading-relaxed max-w-sm">
              Mombasa&apos;s official awards recognising custom matatu fabrication, competition acoustics, crew discipline, and coastal route excellence.
            </p>
            <div className="text-xs text-white/25 space-y-1.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                <span>{eventData.event_date ?? "December 2025"} · {eventData.event_time ?? "6:00 PM EAT"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                <span>{eventData.venue_name ?? "Mombasa Cement Grounds, Mombasa, Kenya"}</span>
              </div>
            </div>
          </div>

          {/* Public Nav */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/50 mb-5">
              Event & Voting
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/vote", label: "Vote for Nominees" },
                { href: "/results", label: "Live Public Leaderboard" },
                { href: "/tickets", label: "Buy Tickets" },
                { href: "/my-tickets", label: "Download My Tickets" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white/70 transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/50 mb-5">
              Information
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/about", label: "About the Gala" },
                { href: "/contact", label: "Contact & Support" },
                { href: "/terms", label: "Terms of Voting & Sales" },
                { href: "/privacy", label: "Privacy Policy (KDPA)" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white/70 transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Security & Admin */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/50 mb-5">
              Integrity & Admin
            </h4>
            <ul className="space-y-3 text-xs text-white/30 leading-relaxed">
              <li>Protected by Cloudflare Turnstile & Postgres Unique Locks</li>
              <li>HMAC Signed QR Tickets with Door Scanner Validation</li>
              <li className="pt-1">
                <Link
                  href="/admin"
                  className="text-white/25 hover:text-white/50 transition-colors duration-150"
                >
                  Admin Portal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20">
          <p>
            © {currentYear} Coastal Nganya Awards. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white/40 transition-colors duration-150">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white/40 transition-colors duration-150">
              Terms
            </Link>
            <span>Kenya Data Protection Act Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
