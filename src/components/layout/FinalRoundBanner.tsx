"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Clock, ChevronRight } from "lucide-react";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

const FINAL_ROUND_DEADLINE = "2026-11-30T23:59:59+03:00";

function calculateTimeRemaining(): TimeRemaining {
  const target = new Date(FINAL_ROUND_DEADLINE).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isExpired: diff <= 0,
  };
}

export function FinalRoundBanner() {
  const [time, setTime] = useState<TimeRemaining>(calculateTimeRemaining());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(calculateTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative z-50 bg-gradient-to-r from-black via-amber-950/40 to-black border-b border-amber-500/30 text-white py-2.5 px-4 sm:px-6 shadow-[0_4px_20px_rgba(245,158,11,0.15)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        {/* Left: Live status and info */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider animate-pulse">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Final Voting Round Live
          </span>
        </div>

        {/* Right: Countdown & Action */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 text-amber-400/80 mr-0.5" />
            <span className="text-neutral-400 text-xs hidden sm:inline">Closes in:</span>
            <div className="flex items-center gap-1">
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                {String(time.days).padStart(2, "0")}d
              </span>
              <span className="text-neutral-500">:</span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                {String(time.hours).padStart(2, "0")}h
              </span>
              <span className="text-neutral-500">:</span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                {String(time.minutes).padStart(2, "0")}m
              </span>
              <span className="text-neutral-500">:</span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                {String(time.seconds).padStart(2, "0")}s
              </span>
            </div>
          </div>

          <Link
            href="/vote"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
          >
            Vote Now
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
