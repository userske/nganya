"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#about", label: "About" },
  { href: "/#sponsors", label: "Sponsors" },
  { href: "/vote", label: "Vote" },
  { href: "/results", label: "Results" },
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

  // Handle escape key to dismiss mobile menu (WCAG 2.1.2)
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent"
        )}
      >
        <nav aria-label="Main Navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg">
              <div className="hidden sm:block">
                <div className="text-white font-bold text-base leading-tight tracking-tight">
                  Coastal Nganya
                </div>
                <div className="text-white/40 text-xs font-medium tracking-widest uppercase">
                  Awards 2025
                </div>
              </div>
              <div className="sm:hidden text-white font-bold text-base tracking-tight">
                Coastal Nganya
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1" role="menubar">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-[color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                    "hover:text-white hover:bg-white/5",
                    pathname === link.href ? "text-white" : "text-white/50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/vote"
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-[color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Vote Now
              </Link>
              <Link
                href="/tickets"
                className="px-4 py-2 text-sm font-semibold text-black bg-white hover:bg-white/90 rounded-lg transition-[background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Buy Tickets
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-panel"
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
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative bg-[#0a0a0a] border-b border-white/10 shadow-2xl pt-16">
              <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-3 rounded-xl text-base font-medium transition-[color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                      "hover:bg-white/5 hover:text-white",
                      pathname === link.href ? "text-white" : "text-white/60"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                  <Link
                    href="/vote"
                    className="w-full px-4 py-3 text-sm font-medium text-white text-center border border-white/20 rounded-xl hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Vote Now
                  </Link>
                  <Link
                    href="/tickets"
                    className="w-full px-4 py-3 text-sm font-semibold text-black text-center bg-white rounded-xl hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Buy Tickets
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
