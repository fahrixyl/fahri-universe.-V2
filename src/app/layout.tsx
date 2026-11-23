import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/data/fahri-profile";

const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const site = process.env.NEXT_PUBLIC_SITE_URL || profile.domain;
const title = "Muhammad Fahri — Beyond The Ordinary";
const description = "Jelajahi semesta digital Muhammad Fahri, seorang anak muda Gen Z yang tertarik pada teknologi, programming, networking, cybersecurity, dan dunia digital.";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title, description,
  alternates: { canonical: site },
  manifest: "/manifest.json",
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon-192.png" },
  openGraph: { title, description, url: site, siteName: "FAHRI PERSONAL UNIVERSE", locale: "id_ID", type: "website", images: [{ url: "/icons/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/icons/og.png"] },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#05070D", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ld = {
    "@context": "https://schema.org", "@type": "Person", name: profile.name, url: site,
    description: profile.description, sameAs: [profile.instagram, profile.github, profile.tiktok], email: profile.email,
  };
  return (
    <html lang="id" className={`${grotesk.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </body>
    </html>
  );
}
