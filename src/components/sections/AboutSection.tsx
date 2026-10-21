"use client";

import { motion } from "framer-motion";
import { Trophy, Users, Mic, Star } from "lucide-react";

interface AboutSectionProps {
  aboutHtml: string;
}

const stats = [
  { icon: Trophy, value: "62", label: "Award Categories" },
  { icon: Users, value: "500+", label: "Nominees" },
  { icon: Mic, value: "1", label: "Epic Night" },
  { icon: Star, value: "∞", label: "Nganya Culture" },
];

const highlights = [
  {
    title: "62 Categories",
    desc: "Every major corridor — Jomvu, Kisauni, Bamburi, Likoni — plus custom builders, sound technicians, and crew.",
  },
  {
    title: "Live Audio & Showcase",
    desc: "A full night of sound clashes, fabrication showcases, and category coronations.",
  },
  {
    title: "Verifiable Voting",
    desc: "One verified vote per person per category. Direct real-time tallying with zero ballot tampering.",
  },
  {
    title: "Instant Gate Passes",
    desc: "HMAC-signed QR tickets delivered instantly to your inbox via M-Pesa or Card.",
  },
];

const DEFAULT_ABOUT = `
  <p>The <strong>Coastal Nganya Awards</strong> honors the fabrication workshops, acoustic engineers, airbrush artists, and crews behind Mombasa's most revered matatus.</p>
  <p>From high-bass runs between Jomvu and Posta, to custom aerodynamic fiberglass body kits cutting through Kisauni, Mikindani, and the Likoni ferry lines, this is coastal street engineering at full volume. 62 categories. Over 500 nominees. Every vote locked to one verified ballot per person.</p>
`;

export function AboutSection({ aboutHtml }: AboutSectionProps) {
  return (
    <section id="about" className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[#0a0a0a] p-8 text-center"
            >
              <stat.icon className="w-5 h-5 text-amber-400/80 mx-auto mb-4" strokeWidth={1.5} />
              <div className="text-3xl lg:text-4xl font-black text-white mb-1 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs text-white/40 font-medium uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* About content */}
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-[10px] px-3 py-1 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-400 font-bold uppercase tracking-widest mb-6 shadow-[0_0_12px_rgba(245,158,11,0.12)]">
              Our Scene
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tight leading-[1.05]">
              Mombasa&apos;s Signature{" "}
              <span className="text-gold-gradient">Street Engineering</span>
            </h2>
            <div
              className="prose prose-invert prose-p:text-white/50 prose-p:leading-relaxed prose-strong:text-white/80 max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: aboutHtml || DEFAULT_ABOUT }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-px bg-white/8 rounded-2xl overflow-hidden"
          >
            {highlights.map((h, i) => (
              <div
                key={h.title}
                className={`bg-[#0a0a0a] p-6 ${i === 1 ? "mt-6" : ""} ${i === 3 ? "-mt-6" : ""}`}
              >
                <h3 className="font-semibold text-white text-sm mb-2 tracking-tight">{h.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
