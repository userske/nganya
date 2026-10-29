import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { SponsorsSection } from "@/components/sections/SponsorsSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // ISR – refresh every minute

async function getEventSettings() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("event_settings")
      .select("*")
      .eq("id", 1)
      .single();
    return data;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const event = await getEventSettings();

  // Fallback values when DB isn't configured yet
  const eventData = event ?? {
    event_name: "Coastal Nganya Awards",
    tagline: "Mombasa's biggest night for custom builds, sound setups, and route culture",
    event_date: "2026-12-06",
    event_time: "14:00",
    venue_name: "Mamba Village, Mombasa",
    about_html: `<p>The <strong>Coastal Nganya Awards</strong> honors the fabricators, audio engineers, airbrush artists, and crews behind Mombasa's most revered matatus.</p><p>From high-bass battles on the Jomvu line to custom aerodynamic kits rolling through Kisauni, Mikindani, and Likoni, this is street engineering at full volume. 62 categories. Over 500 nominees. One verified vote per category.</p>`,
    social_links: {},
    voting_opens_at: null,
    voting_closes_at: null,
    results_frozen: false,
    ticket_sales_open: true,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main>
        <HeroSection eventData={eventData} />
        <AboutSection aboutHtml={eventData.about_html ?? ""} />
        <GallerySection />
        <SponsorsSection />
        <CTASection />
      </main>
      <Footer eventData={eventData} />
    </div>
  );
}
