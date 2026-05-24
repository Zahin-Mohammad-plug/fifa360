import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { MatchPulseToast } from "@/components/MatchPulseToast";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FIFA 360 – FIFA World Cup 2026",
  description:
    "Find the best supporter venues, plan your route, get live scores and real-time alerts for every FIFA World Cup 2026 match.",
  manifest: "/manifest.json",
  icons: { apple: "/icon-192.png" },
  openGraph: {
    title: "FIFA 360 – FIFA World Cup 2026",
    description: "Find venues, plan routes, live scores, AI concierge for World Cup 2026.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070c04",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <TopNav />
        <div className="main-content">
          {children}
        </div>
        <MatchPulseToast />
        <BottomNav />
      </body>
    </html>
  );
}
