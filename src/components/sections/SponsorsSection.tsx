"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Award, ShieldCheck, Sparkles, Star } from "lucide-react";

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
    logoText: "MOMBASA COUNTY",
  },
  {
    name: "Mombasa Cement",
    tier: "headline",
    tagline: "Official Venue & Logistics Partner",
    logoText: "MOMBASA CEMENT",
  },
  {
    name: "Paystack",
    tier: "gold",
    tagline: "Official Payment Partner (Cards & M-Pesa)",
    logoText: "PAYSTACK",
  },
  {
    name: "Coast Matatu Owners Association",
    tier: "gold",
    tagline: "Apex Matatu Industry Body",
    logoText: "CMOA COAST",
  },
  {
    name: "RedBull Kenya",
    tier: "silver",
    tagline: "Energy & Sound Partner",
    logoText: "RED BULL",
  },
  {
    name: "Pioneer Car Audio & Visuals",
    tier: "silver",
    tagline: "Acoustic Stage & Sound Sponsor",
    logoText: "PIONEER AUDIO",
  },
  {
    name: "Kisauni Express Sacco",
    tier: "partner",
    tagline: "Transport Network Partner",
    logoText: "KISAUNI EXPRESS",
  },
  {
    name: "Likoni Ferry Fleet Logistics",
    tier: "partner",
    tagline: "Route Connectivity Partner",
    logoText: "LIKONI FLEET",
  },
];

export function SponsorsSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-gradient-to-b from-[#050810] via-[#090e1a] to-[#050810] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Partners & Sponsors
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Backed by the Best in the Industry
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Proudly partnering with county leaders, automotive icons, and financial pioneers making the Coast matatu culture legendary.
          </p>
        </div>

        {/* Headline Sponsors */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-amber-400/80 font-bold mb-4 text-center">
            Headline Partners
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sponsors
              .filter((s) => s.tier === "headline")
              .map((sponsor, idx) => (
                <motion.div
                  key={sponsor.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="group relative p-8 rounded-2xl bg-white/[0.03] border border-amber-500/20 hover:border-amber-500/50 transition-[border-color,box-shadow] duration-200 ease-out hover:shadow-[0_0_30px_rgba(245,158,11,0.12)] flex flex-col items-center text-center backdrop-blur-sm"
                >
                  <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform duration-200">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-wide group-hover:text-amber-400 transition-colors duration-150">
                    {sponsor.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                    {sponsor.tagline}
                  </p>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Gold & Silver Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sponsors
            .filter((s) => s.tier !== "headline")
            .map((sponsor, idx) => (
              <motion.div
                key={sponsor.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + idx * 0.05, duration: 0.4 }}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-[border-color,background-color] duration-150 ease-out hover:bg-white/[0.04] text-center flex flex-col justify-center items-center group"
              >
                <div className="text-xs uppercase font-mono font-bold tracking-widest text-slate-300 group-hover:text-white transition-colors duration-150">
                  {sponsor.logoText}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {sponsor.name}
                </div>
              </motion.div>
            ))}
        </div>

        {/* Sponsor CTA */}
        <div className="mt-16 text-center">
          <p className="text-xs text-slate-400">
            Want to sponsor Mombasa’s most celebrated cultural awards?{" "}
            <a
              href="mailto:sponsors@coastalngayaawards.com"
              className="text-amber-400 font-medium hover:underline ml-1"
            >
              Get in touch with the partnerships team &rarr;
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
