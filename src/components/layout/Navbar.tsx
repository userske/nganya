"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Ticket, Vote, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#about", label: "About" },
  { href: "/#sponsors", label: "Sponsors" },
  { href: "/vote", label: "Vote", icon: Vote },
  { href: "/results", label: "Results", icon: Trophy },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-[#050810]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#e8602c] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(201,162,39,0.4)] transition-shadow duration-300">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-bold text-base leading-tight tracking-tight">
                  Coastal Nganya
                </div>
                <div className="text-[#c9a227] text-xs font-semibold tracking-widest uppercase">
                  Awards 2025
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:text-white hover:bg-white/5",
                    pathname === link.href
                      ? "text-[#c9a227]"
                      : "text-white/70"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/vote">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#c9a227] border border-[#c9a227]/30 hover:bg-[#c9a227]/10 hover:border-[#c9a227]/60"
                >
                  <Vote className="w-4 h-4 mr-2" />
                  Vote Now
                </Button>
              </Link>
              <Link href="/tickets">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#c9a227] to-[#e8602c] hover:opacity-90 text-white font-semibold shadow-lg shadow-[#c9a227]/20"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Buy Tickets
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <div className="relative bg-[#0a0f1e] border-b border-white/10 shadow-2xl pt-16">
              <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-3 rounded-xl text-base font-medium transition-all",
                      "hover:bg-white/5 hover:text-white",
                      pathname === link.href ? "text-[#c9a227]" : "text-white/80"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                  <Link href="/vote">
                    <Button
                      variant="outline"
                      className="w-full border-[#c9a227]/40 text-[#c9a227] hover:bg-[#c9a227]/10"
                    >
                      <Vote className="w-4 h-4 mr-2" />
                      Vote Now
                    </Button>
                  </Link>
                  <Link href="/tickets">
                    <Button className="w-full bg-gradient-to-r from-[#c9a227] to-[#e8602c] text-white font-semibold">
                      <Ticket className="w-4 h-4 mr-2" />
                      Buy Tickets
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
