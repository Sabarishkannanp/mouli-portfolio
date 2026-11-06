import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope, Space_Mono, Syne } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import ToolCursor from "@/components/cursor/ToolCursor";
import Navbar from "@/components/nav/Navbar";
import { site } from "@/data/site";

const syne = Syne({ subsets: ["latin"], weight: ["800"], variable: "--font-syne", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["italic"], variable: "--font-instrument", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.role}`, template: `%s · ${site.name}` },
  description: `${site.name} is a ${site.role} from ${site.location}. ${site.tagline}`,
  keywords: ["UI/UX designer", "graphic designer", "Salem", "portfolio", "Figma", "branding", "Mouli Prasanth"],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.tagline, images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#08070D",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  email: `mailto:${site.email}`,
  url: site.url,
  image: `${site.url}/hero.png`,
  address: { "@type": "PostalAddress", addressLocality: "Salem", addressRegion: "Tamil Nadu", addressCountry: "IN" },
  sameAs: Object.values(site.socials),
  alumniOf: "K.S.R. College of Arts and Science",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${syne.variable} ${instrument.variable} ${manrope.variable} ${spaceMono.variable} antialiased`}>
      <head>
        <noscript>
          <style>{`[data-intro-title]{clip-path:none!important}[data-intro-fade]{opacity:1!important;transform:none!important}[data-intro-particles] img{opacity:1!important}#hero-word{clip-path:none!important}#hero-photo,[data-hero-reveal]{opacity:1!important}#hero-photo{left:50%;top:8%;width:min(92vw,520px);height:62%;transform:translateX(-50%)}[data-reveal]{opacity:1!important;visibility:visible!important}`}</style>
        </noscript>
      </head>
      <body className="noise min-h-svh">
        <a href="#main" className="sr-only z-[200] rounded-full bg-violet px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll />
        <Navbar />
        <ToolCursor />
        {children}
      </body>
    </html>
  );
}
