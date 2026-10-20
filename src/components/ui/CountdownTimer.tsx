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
        <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
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
        {/* Subtle monochrome accent */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
      <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const target = new Date(targetDate);
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
            <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl skeleton" />
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
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
