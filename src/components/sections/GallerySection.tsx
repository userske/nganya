"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, Sparkles } from "lucide-react";

export interface GalleryItem {
  id: number;
  src: string;
  title: string;
  category: "Custom Builds" | "Acoustics" | "Airbrush" | "Route Icons";
  route?: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    src: "/gallery/gallery-01.jpg",
    title: "Coast Heavyweight Custom Build",
    category: "Custom Builds",
    route: "Kisauni · Mombasa 1",
  },
  {
    id: 2,
    src: "/gallery/gallery-02.jpg",
    title: "Signature Aerodynamic Kit & Grille",
    category: "Custom Builds",
    route: "Bamburi Line",
  },
  {
    id: 3,
    src: "/gallery/gallery-03.jpg",
    title: "Acoustic Wall & Mid-Range Array",
    category: "Acoustics",
    route: "Jomvu - Posta Express",
  },
  {
    id: 4,
    src: "/gallery/gallery-04.jpg",
    title: "Street Royalty Metallic Livery",
    category: "Airbrush",
    route: "Likoni Ferry Fleet",
  },
  {
    id: 5,
    src: "/gallery/gallery-05.jpg",
    title: "Underglow & Custom Wheel Fitment",
    category: "Custom Builds",
    route: "Town - Nyali Corridor",
  },
  {
    id: 6,
    src: "/gallery/gallery-06.jpg",
    title: "Precision Cockpit & Ambient Neon",
    category: "Custom Builds",
    route: "Mtwapa Express",
  },
  {
    id: 7,
    src: "/gallery/gallery-07.jpg",
    title: "Subwoofer Bank & High-Output Amps",
    category: "Acoustics",
    route: "Jomvu Sound Clash",
  },
  {
    id: 8,
    src: "/gallery/gallery-08.jpg",
    title: "Coastal Masterpiece Airbrush Mural",
    category: "Airbrush",
    route: "Kisauni Route 2",
  },
  {
    id: 9,
    src: "/gallery/gallery-09.jpg",
    title: "Aggressive Stance & Custom Widebody",
    category: "Custom Builds",
    route: "Bamburi - Mtwapa",
  },
  {
    id: 10,
    src: "/gallery/gallery-10.jpg",
    title: "High-Bass Marine Finish Beast",
    category: "Acoustics",
    route: "Changamwe Corridor",
  },
  {
    id: 11,
    src: "/gallery/gallery-11.jpg",
    title: "Night Glow Showcase Build",
    category: "Custom Builds",
    route: "Town Route",
  },
  {
    id: 12,
    src: "/gallery/gallery-12.jpg",
    title: "Hand-Crafted Interior Headliner",
    category: "Custom Builds",
    route: "Coast Route Elite",
  },
  {
    id: 13,
    src: "/gallery/gallery-13.jpg",
    title: "Trophy-Contender Aerodynamics",
    category: "Route Icons",
    route: "Bamburi 1",
  },
  {
    id: 14,
    src: "/gallery/gallery-14.jpg",
    title: "Custom Dual-Exhaust & Rear Wing",
    category: "Route Icons",
    route: "Kisauni Express",
  },
  {
    id: 15,
    src: "/gallery/gallery-15.jpg",
    title: "Show-Stopping Graphic Decals",
    category: "Airbrush",
    route: "Mikindani Fleet",
  },
  {
    id: 16,
    src: "/gallery/gallery-16.jpg",
    title: "Ground-Pounding Sound Stage Setup",
    category: "Acoustics",
    route: "Mombasa Arena",
  },
  {
    id: 17,
    src: "/gallery/gallery-17.jpg",
    title: "Illuminated VIP Passenger Lounge",
    category: "Custom Builds",
    route: "Nyali Route",
  },
  {
    id: 18,
    src: "/gallery/gallery-18.jpg",
    title: "Coastal Nganya Award Contender",
    category: "Route Icons",
    route: "All Routes Flagship",
  },
];

const CATEGORIES = ["All", "Custom Builds", "Acoustics", "Airbrush", "Route Icons"] as const;

export function GallerySection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const filteredItems = selectedCategory === "All"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);

  const openLightbox = (index: number) => {
    setActiveItemIndex(index);
  };

  const closeLightbox = () => {
    setActiveItemIndex(null);
  };

  const showNext = useCallback(() => {
    if (activeItemIndex === null) return;
    setActiveItemIndex((prev) => ((prev! + 1) % filteredItems.length));
  }, [activeItemIndex, filteredItems.length]);

  const showPrev = useCallback(() => {
    if (activeItemIndex === null) return;
    setActiveItemIndex((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
  }, [activeItemIndex, filteredItems.length]);

  useEffect(() => {
    if (activeItemIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItemIndex, showNext, showPrev]);

  return (
    <section id="gallery" className="py-24 lg:py-32 relative bg-black border-t border-white/5">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Culture In Motion
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-4"
          >
            Official Build & <span className="text-gold-gradient">Sound Gallery</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-sm sm:text-base leading-relaxed"
          >
            Explore Mombasa&apos;s wildest custom fiberglass builds, earth-shaking subwoofer arrays, custom airbrushing, and street icons competing for the 2026 crowns.
          </motion.p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveItemIndex(null);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                  isActive
                    ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/5"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: (index % 6) * 0.05 }}
                onClick={() => openLightbox(index)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 cursor-pointer shadow-lg hover:border-amber-400/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] transition-all duration-300"
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-400 border border-amber-400/30">
                    {item.category}
                  </span>
                </div>

                {/* Expand icon on hover */}
                <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-0 inset-x-0 p-4 z-10 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                  <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  {item.route && (
                    <p className="text-xs font-mono text-white/60">
                      {item.route}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeItemIndex !== null && filteredItems[activeItemIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6"
            onClick={closeLightbox}
          >
            {/* Top Toolbar */}
            <div
              className="flex items-center justify-between max-w-6xl w-full mx-auto z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-white/60 text-xs font-mono">
                {activeItemIndex + 1} / {filteredItems.length}
              </div>
              <button
                type="button"
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label="Close image modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Center Image Container */}
            <div
              className="relative flex-1 max-w-5xl w-full mx-auto my-auto flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev Button */}
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-2 sm:-left-12 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Main Image */}
              <div className="relative w-full h-[65vh] max-h-[700px] flex items-center justify-center">
                <Image
                  src={filteredItems[activeItemIndex].src}
                  alt={filteredItems[activeItemIndex].title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={showNext}
                className="absolute right-2 sm:-right-12 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Caption */}
            <div
              className="max-w-2xl w-full mx-auto text-center z-10 pb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-2">
                {filteredItems[activeItemIndex].category}
              </span>
              <h4 className="text-white font-bold text-base sm:text-lg">
                {filteredItems[activeItemIndex].title}
              </h4>
              {filteredItems[activeItemIndex].route && (
                <p className="text-xs text-white/50 font-mono mt-1">
                  {filteredItems[activeItemIndex].route}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

