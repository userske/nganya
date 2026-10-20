"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Ticket, Vote, Trophy, ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#050810] overflow-hidden">
      {/* Decorative gradient radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-slate-900/90 via-[#0e1627]/90 to-slate-900/90 border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.15)] text-center backdrop-blur-xl"
        >
          {/* Flame Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Flame className="w-4 h-4 animate-pulse text-amber-400" />
            The Coast Awards Gala Night Is Here
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase mb-6 leading-tight">
            BE PART OF MOMBASA’S <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              GREATEST NIGHT OF PRIDE
            </span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Grab your digital ticket via instant guest checkout on M-Pesa or Card, or verify your email in 10 seconds to back your favorite matatu and crew with live verified votes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-base px-8 py-6 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_45px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-0.5"
            >
              <Link href="/tickets">
                <Ticket className="w-5 h-5 mr-2" />
                Buy Tickets Now (Guest Checkout)
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border-white/20 hover:border-amber-400/50 font-bold text-base px-8 py-6 rounded-xl transition-all"
            >
              <Link href="/vote">
                <Vote className="w-5 h-5 mr-2 text-amber-400" />
                Vote in 61 Categories
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Instant M-Pesa & Card Delivery</span>
            </div>
            <div>•</div>
            <div>One Person = One Vote Guarantee</div>
            <div>•</div>
            <div>Live Realtime Leaderboard</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
