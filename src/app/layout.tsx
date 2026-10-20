import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

import { MotionProvider } from "@/components/providers/MotionProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coastalngayaawards.com";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Coastal Nganya Awards 2026 | Mombasa Matatu Culture",
    template: "%s | Coastal Nganya Awards",
  },
  description:
    "The Coastal Nganya Awards celebrates the best of Mombasa's matatu and nganya culture. Vote for your favourites, buy tickets and join us for an unforgettable awards night.",
  keywords: [
    "Coastal Nganya Awards",
    "Mombasa matatu",
    "nganya awards",
    "Kenya transport culture",
    "matatu awards 2026",
  ],
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: siteUrl,
    siteName: "Coastal Nganya Awards",
    title: "Coastal Nganya Awards 2026",
    description:
      "The Coastal Nganya Awards celebrates the best of Mombasa's matatu and nganya culture.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Coastal Nganya Awards 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coastal Nganya Awards 2026",
    description:
      "The Coastal Nganya Awards celebrates the best of Mombasa's matatu and nganya culture.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Apple PWA / web-app meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Coastal Nganya Awards" />
        {/* Schema.org Event structured data – server rendered */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              name: "Coastal Nganya Awards 2026",
              description:
                "Annual awards night celebrating the best of Mombasa's matatu and nganya culture.",
              url: siteUrl,
              location: {
                "@type": "Place",
                name: "Mombasa, Kenya",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        {/* Skip to main content — WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:text-sm focus:font-semibold focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <MotionProvider>
            <div id="main-content" tabIndex={-1} className="outline-none">
              {children}
            </div>
          </MotionProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#ffffff",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
