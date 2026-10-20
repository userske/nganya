"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Clock, Ticket, Vote, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const eventDateTime = `${eventData.event_date}T${eventData.event_time}:00`;

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
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
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050810]/80 via-[#050810]/60 to-[#050810]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050810]/60 via-transparent to-[#050810]/60" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#c9a227]/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/30 text-[#c9a227] text-sm font-semibold tracking-wider uppercase mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#c9a227] animate-pulse" />
          Mombasa, Kenya · 2025
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
          className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10"
        >
          {eventData.tagline ?? "Celebrating the heartbeat of Mombasa's roads"}
        </motion.p>

        {/* Event info bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-12"
        >
          {[
            {
              icon: Calendar,
              text: formatEventDate(eventData.event_date),
            },
            {
              icon: Clock,
              text: formatEventTime(eventData.event_time),
            },
            {
              icon: MapPin,
              text: eventData.venue_name,
              href: eventData.map_link ?? undefined,
            },
          ].map(({ icon: Icon, text, href }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-white/70 text-sm sm:text-base"
            >
              <Icon className="w-4 h-4 text-[#c9a227] flex-shrink-0" />
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c9a227] transition-colors"
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
            <Link href="/tickets">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#c9a227] to-[#e8602c] hover:opacity-90 text-white font-bold text-base px-8 py-6 shadow-2xl shadow-[#c9a227]/20 hover:shadow-[#c9a227]/40 transition-shadow duration-300"
              >
                <Ticket className="w-5 h-5 mr-2" />
                Buy Tickets
              </Button>
            </Link>
          )}
          <Link href="/vote">
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 hover:border-[#c9a227]/60 text-base px-8 py-6 backdrop-blur-sm"
            >
              <Vote className="w-5 h-5 mr-2" />
              Vote Now
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/30"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        aria-hidden
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  );
}
