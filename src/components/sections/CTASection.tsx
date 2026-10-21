"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
          className="relative rounded-3xl border border-white/10 bg-[#0a0a0a] p-10 sm:p-16 text-center overflow-hidden"
        >
          {/* Subtle radial light */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-block text-[10px] px-3 py-1 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-400 font-bold uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              The Coast Awards Gala Night Is Here
            </span>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase mb-6 leading-[1.05]">
              Be Part of Mombasa&apos;s
              <br />
              <span className="text-gold-gradient">Greatest Night of Pride</span>
            </h2>

            <p className="text-white/40 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Grab your digital ticket via instant guest checkout on M-Pesa or Card, or verify your email in 10 seconds to back your favourite matatu and crew with live verified votes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <Link
                href="/tickets"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-base rounded-xl hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.3)] active:scale-[0.97] transition-[filter,transform] duration-150"
              >
                Buy Tickets
              </Link>
              <Link
                href="/vote"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 border border-white/20 text-white font-medium text-base rounded-xl hover:bg-white/5 hover:border-white/35 active:scale-[0.97] transition-[background-color,border-color,transform] duration-150"
              >
                Vote in 62 Categories
                <span aria-hidden className="text-white/40">→</span>
              </Link>
            </div>

            {/* Proof points */}
            <div className="mt-10 pt-8 border-t border-white/8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-white/30 font-mono tracking-wide">
              <span>Instant M-Pesa & Card Delivery</span>
              <span className="hidden sm:block text-white/15">·</span>
              <span>One Person = One Vote Guarantee</span>
              <span className="hidden sm:block text-white/15">·</span>
              <span>Live Realtime Leaderboard</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
