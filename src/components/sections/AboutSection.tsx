"use client";

import { motion } from "framer-motion";
import { Trophy, Users, Mic, Star } from "lucide-react";

interface AboutSectionProps {
  aboutHtml: string;
}

const stats = [
  { icon: Trophy, value: "61", label: "Award Categories" },
  { icon: Users, value: "500+", label: "Nominees" },
  { icon: Mic, value: "1", label: "Epic Night" },
  { icon: Star, value: "∞", label: "Nganya Culture" },
];

export function AboutSection({ aboutHtml }: AboutSectionProps) {
  return (
    <section id="about" className="py-24 lg:py-32 relative">
      {/* Gradient orb background */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#c9a227]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6 text-center hover:border-[#c9a227]/30 transition-[border-color,background-color] duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#c9a227]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#c9a227]/20 transition-colors duration-150">
                <stat.icon className="w-6 h-6 text-[#c9a227]" />
              </div>
              <div className="text-3xl lg:text-4xl font-black text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-white/50 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* About content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-xs font-bold uppercase tracking-widest mb-4">
              Our Scene
            </span>
            <h2 className="heading-lg text-4xl lg:text-5xl text-white mb-6">
              Mombasa&apos;s Signature{" "}
              <span className="text-gold-gradient">Street Engineering</span>
            </h2>
            <div
              className="prose prose-invert prose-p:text-white/70 prose-p:leading-relaxed prose-strong:text-white max-w-none"
              dangerouslySetInnerHTML={{ __html: aboutHtml || DEFAULT_ABOUT }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Decorative grid */}
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((h, i) => (
                <div
                  key={h.title}
                  className={`glass-card p-6 hover:border-[#c9a227]/20 transition-[border-color,background-color] duration-200 ${
                    i === 1 ? "mt-8" : ""
                  } ${i === 3 ? "-mt-8" : ""}`}
                >
                  <div className="text-3xl mb-3">{h.emoji}</div>
                  <h3 className="font-bold text-white text-sm mb-1">{h.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const DEFAULT_ABOUT = `
  <p>The <strong>Coastal Nganya Awards</strong> honors the fabrication workshops, acoustic engineers, airbrush artists, and crews behind Mombasa's most revered matatus.</p>
  <p>From high-bass runs between Jomvu and Posta, to custom aerodynamic fiberglass body kits cutting through Kisauni, Mikindani, and the Likoni ferry lines, this is coastal street engineering at full volume. 61 categories. Over 500 nominees. Every vote locked to one verified ballot per person.</p>
`;

const highlights = [
  {
    emoji: "🏆",
    title: "61 Categories",
    desc: "Every major corridor—Jomvu, Kisauni, Bamburi, Likoni—plus custom builders, sound technicians, and crew.",
  },
  {
    emoji: "🔊",
    title: "Live Audio & Showcase",
    desc: "A full night of sound clashes, fabrication showcases, and category coronations.",
  },
  {
    emoji: "🗳️",
    title: "Verifiable Voting",
    desc: "One verified vote per person per category. Direct real-time tallying with zero ballot tampering.",
  },
  {
    emoji: "🎟️",
    title: "Instant Gate Passes",
    desc: "Secure HMAC-signed QR tickets delivered instantly to your inbox via M-Pesa or Card.",
  },
];
