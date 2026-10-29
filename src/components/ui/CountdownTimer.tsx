"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: string; // ISO date string
  className?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseTargetDate(targetDateStr: string): Date {
  if (!targetDateStr) return new Date("2026-12-06T14:00:00+03:00");
  // If pure YYYY-MM-DD, set to 2:00 PM East Africa Time (UTC+3)
  if (/^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) {
    return new Date(`${targetDateStr}T14:00:00+03:00`);
  }
  // If YYYY-MM-DDTHH:mm(:ss)? without timezone offset, append +03:00
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(targetDateStr)) {
    return new Date(`${targetDateStr}+03:00`);
  }
  return new Date(targetDateStr);
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownUnit({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const prev = useRef(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (prev.current !== value) {
      setFlipping(true);
      const t = setTimeout(() => setFlipping(false), 300);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-b from-white/[0.06] to-amber-950/20 border border-amber-500/25 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.08)]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={{ y: flipping ? -40 : 0, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tabular-nums"
              style={{ fontFamily: "'Outfit', monospace" }}
            >
              {pad(value)}
            </motion.span>
          </AnimatePresence>
        </div>
        {/* Luminous coastal amber bottom bar */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      </div>
      <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-amber-400/80">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const target = parseTargetDate(targetDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) {
    return (
      <div className={`flex gap-4 sm:gap-6 lg:gap-8 ${className ?? ""}`} aria-label="Loading countdown">
        {["Days", "Hours", "Mins", "Secs"].map((label) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl skeleton border border-amber-500/20" />
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-amber-400/80">
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const isOver =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (isOver) {
    return (
      <div className={`text-center ${className ?? ""}`} role="status">
        <p className="text-xl sm:text-2xl font-bold text-white tracking-wide">
          The Event is Underway
        </p>
      </div>
    );
  }

  return (
    <div
      role="timer"
      aria-label={`${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, and ${timeLeft.seconds} seconds until the event`}
      className={`flex gap-4 sm:gap-6 lg:gap-8 ${className ?? ""}`}
    >
      <CountdownUnit value={timeLeft.days} label="Days" />
      <CountdownUnit value={timeLeft.hours} label="Hours" />
      <CountdownUnit value={timeLeft.minutes} label="Mins" />
      <CountdownUnit value={timeLeft.seconds} label="Secs" />
    </div>
  );
}
