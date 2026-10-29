"use client";

import { motion } from "framer-motion";

interface Sponsor {
  name: string;
  tier: "headline" | "gold" | "silver" | "partner";
  tagline: string;
  logoText: string;
}

const sponsors: Sponsor[] = [
  {
    name: "Mombasa County Government",
    tier: "headline",
    tagline: "Department of Transport & Infrastructure",
    logoText: "Mombasa County",
  },
  {
    name: "Mamba Village Centre",
    tier: "headline",
    tagline: "Official Venue & Host Partner",
    logoText: "Mamba Village",
  },
  {
    name: "Mombasa Cement",
    tier: "headline",
    tagline: "Official Logistics & Build Partner",
    logoText: "Mombasa Cement",
  },
  {
    name: "Paystack",
    tier: "gold",
    tagline: "Official Payment Partner",
    logoText: "Paystack",
  },
  {
    name: "Coast Matatu Owners Association",
    tier: "gold",
    tagline: "Apex Matatu Industry Body",
    logoText: "CMOA Coast",
  },
  {
    name: "RedBull Kenya",
    tier: "silver",
    tagline: "Energy & Sound Partner",
    logoText: "Red Bull",
  },
  {
    name: "Pioneer Car Audio & Visuals",
    tier: "silver",
    tagline: "Acoustic Stage & Sound Sponsor",
    logoText: "Pioneer Audio",
  },
  {
    name: "Kisauni Express Sacco",
    tier: "partner",
    tagline: "Transport Network Partner",
    logoText: "Kisauni Express",
  },
  {
    name: "Likoni Ferry Fleet Logistics",
    tier: "partner",
    tagline: "Route Connectivity Partner",
    logoText: "Likoni Fleet",
  },
];

// Duplicate for seamless loop
const MARQUEE_ITEMS = [...sponsors, ...sponsors];

export function SponsorsSection() {
  return (
    <section
      id="sponsors"
      className="relative py-24 border-t border-white/[0.06] overflow-hidden bg-black"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6"
        >
          <div>
            <span className="text-[10px] px-3 py-1 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-400 font-bold uppercase tracking-widest mb-4 inline-block shadow-[0_0_12px_rgba(245,158,11,0.12)]">
              Partners & Sponsors
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Backed by the Best<br />in the Industry
            </h2>
          </div>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            County leaders, automotive icons, and financial pioneers making the Coast matatu culture legendary.
          </p>
        </motion.div>
      </div>

      {/* Marquee — all sponsors */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-px shrink-0"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {MARQUEE_ITEMS.map((sponsor, i) => (
              <div
                key={`${sponsor.name}-${i}`}
                className="shrink-0 bg-[#0a0a0a] border-y border-white/[0.06] px-10 py-8 flex flex-col justify-center min-w-[220px] hover:bg-white/[0.03] transition-colors duration-200"
              >
                <div className="text-sm font-bold text-white/70 tracking-tight whitespace-nowrap">
                  {sponsor.logoText}
                </div>
                <div className="text-[11px] text-white/25 mt-1 whitespace-nowrap">
                  {sponsor.tagline}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Sponsor CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 flex items-center justify-between border-t border-white/[0.06] pt-8">
        <p className="text-xs text-white/30">
          Interested in partnering with us?
        </p>
        <a
          href="mailto:info@coastalnganyaawards.com"
          className="text-xs text-amber-400 font-semibold hover:text-amber-300 transition-colors duration-150 flex items-center gap-1.5"
        >
          Get in touch
          <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}
