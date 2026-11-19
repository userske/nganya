"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isVotePage = pathname?.startsWith("/vote");
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
    <div className="relative z-50 bg-gradient-to-r from-black via-amber-950/60 to-black border-b border-amber-500/30 text-white py-1.5 px-3 sm:px-6 shadow-[0_2px_15px_rgba(245,158,11,0.12)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Status badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-wider animate-pulse">
            <Flame className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            Final Round Live
          </span>
          <span className="hidden md:inline text-xs text-neutral-400">
            Top 4 Finalists &middot; One Verified Vote
          </span>
        </div>

        {/* Right: Countdown & Optional CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono text-[11px] sm:text-xs">
            <Clock className="w-3 h-3 text-amber-400/80 mr-0.5 shrink-0" />
            <span className="text-neutral-400 text-[10px] sm:text-xs hidden sm:inline">Closes:</span>
            <div className="flex items-center gap-1">
              <span className="bg-white/10 px-1 py-0.5 rounded text-amber-400 font-bold">
                {String(time.days).padStart(2, "0")}d
              </span>
              <span className="text-neutral-500">:</span>
              <span className="bg-white/10 px-1 py-0.5 rounded text-amber-400 font-bold">
                {String(time.hours).padStart(2, "0")}h
              </span>
              <span className="text-neutral-500">:</span>
              <span className="bg-white/10 px-1 py-0.5 rounded text-amber-400 font-bold">
                {String(time.minutes).padStart(2, "0")}m
              </span>
              <span className="text-neutral-500">:</span>
              <span className="bg-white/10 px-1 py-0.5 rounded text-amber-400 font-bold">
                {String(time.seconds).padStart(2, "0")}s
              </span>
            </div>
          </div>

          {!isVotePage && (
            <Link
              href="/vote"
              className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.25)] shrink-0"
            >
              Vote
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
