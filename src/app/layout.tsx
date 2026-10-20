import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coastalngayaawards.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Coastal Nganya Awards 2025 | Mombasa Matatu Culture",
    template: "%s | Coastal Nganya Awards",
  },
  description:
    "The Coastal Nganya Awards celebrates the best of Mombasa's matatu and nganya culture. Vote for your favourites, buy tickets and join us for an unforgettable awards night.",
  keywords: [
    "Coastal Nganya Awards",
    "Mombasa matatu",
    "nganya awards",
    "Kenya transport culture",
    "matatu awards 2025",
  ],
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: siteUrl,
    siteName: "Coastal Nganya Awards",
    title: "Coastal Nganya Awards 2025",
    description:
      "The Coastal Nganya Awards celebrates the best of Mombasa's matatu and nganya culture.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Coastal Nganya Awards 2025",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coastal Nganya Awards 2025",
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
        {/* Schema.org Event structured data – server rendered */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              name: "Coastal Nganya Awards 2025",
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
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          {children}
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "#0f1525",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#f8f6f0",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
