"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, Clock, ChevronDown } from "lucide-react";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { format } from "date-fns";

interface EventData {
  event_name: string;
  tagline: string | null;
  event_date: string;
  event_time: string;
  venue_name: string;
  map_link?: string | null;
  ticket_sales_open: boolean;
  voting_opens_at: string | null;
  voting_closes_at: string | null;
}

interface HeroSectionProps {
  eventData: EventData;
}

const PARTICLES = [
  { left: "12%", top: "24%", duration: 4.2, delay: 0.5 },
  { left: "28%", top: "68%", duration: 5.1, delay: 1.2 },
  { left: "45%", top: "15%", duration: 3.8, delay: 2.1 },
  { left: "62%", top: "82%", duration: 6.0, delay: 0.8 },
  { left: "75%", top: "35%", duration: 4.5, delay: 3.0 },
  { left: "88%", top: "54%", duration: 5.5, delay: 1.7 },
  { left: "19%", top: "79%", duration: 4.8, delay: 2.5 },
  { left: "33%", top: "42%", duration: 6.2, delay: 0.2 },
  { left: "53%", top: "88%", duration: 3.9, delay: 3.4 },
  { left: "68%", top: "18%", duration: 5.3, delay: 1.9 },
  { left: "82%", top: "72%", duration: 4.1, delay: 0.7 },
  { left: "94%", top: "29%", duration: 5.8, delay: 2.8 },
  { left: "8%", top: "58%", duration: 4.6, delay: 1.4 },
  { left: "23%", top: "12%", duration: 6.4, delay: 3.1 },
  { left: "41%", top: "64%", duration: 3.7, delay: 0.9 },
  { left: "57%", top: "38%", duration: 5.0, delay: 2.3 },
  { left: "71%", top: "91%", duration: 4.4, delay: 1.1 },
  { left: "85%", top: "16%", duration: 6.1, delay: 3.6 },
  { left: "91%", top: "85%", duration: 4.9, delay: 0.4 },
  { left: "4%", top: "33%", duration: 5.2, delay: 2.0 },
];

function formatEventDate(date: string) {
  try {
    return format(new Date(date), "EEEE, d MMMM yyyy");
  } catch {
    return date;
  }
}

function formatEventTime(time: string) {
  try {
    const [h, m] = time.split(":");
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m));
    return format(d, "h:mm a");
  } catch {
    return time;
  }
}

export function HeroSection({ eventData }: HeroSectionProps) {
  const eventDateTime = `${eventData.event_date}T${eventData.event_time}:00+03:00`;

  return (
    <section
      id="home"
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden"
      aria-label="Hero – Coastal Nganya Awards"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Mombasa matatu at night"
          fill
          className="object-cover object-center"
          priority
          fetchPriority="high"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
      </div>

      {/* Subtle white particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full bg-white/20"
            style={{ left: p.left, top: p.top }}
            animate={{ y: [0, -24, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Mombasa, Kenya · 2026
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="heading-display text-5xl sm:text-7xl lg:text-8xl xl:text-9xl text-white mb-6"
        >
          <span className="block">Coastal</span>
          <span className="block text-gold-gradient">Nganya</span>
          <span className="block">Awards</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-10"
        >
          {eventData.tagline ?? "Mombasa's biggest night for custom builds, sound setups, and route culture"}
        </motion.p>

        {/* Event info bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-12"
        >
          {[
            { icon: Calendar, text: formatEventDate(eventData.event_date) },
            { icon: Clock, text: formatEventTime(eventData.event_time) },
            {
              icon: MapPin,
              text: eventData.venue_name,
              href: eventData.map_link ?? undefined,
            },
          ].map(({ icon: Icon, text, href }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-white/50 text-sm sm:text-base"
            >
              <Icon className="w-4 h-4 text-white/40 flex-shrink-0" />
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/80 transition-colors"
                >
                  {text}
                </a>
              ) : (
                <span>{text}</span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-center mb-12"
        >
          <CountdownTimer targetDate={eventDateTime} />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {eventData.ticket_sales_open && (
            <Link
              href="/tickets"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-base rounded-xl hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.3)] active:scale-[0.97] transition-[filter,transform] duration-150"
            >
              Buy Tickets
            </Link>
          )}
          <Link
            href="/vote"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/25 text-white font-medium text-base rounded-xl hover:bg-white/5 hover:border-white/40 active:scale-[0.97] transition-[background-color,border-color,transform] duration-150 backdrop-blur-sm"
          >
            Vote Now
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/25"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        aria-hidden
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  );
}
