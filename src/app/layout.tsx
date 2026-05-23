import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TopNav } from "@/components/TopNav";

export const metadata: Metadata = {
  title: "FIFA 360 – Your World Cup 2026 Companion",
  description: "Find the best venues, plan your route, get live scores and key-moment alerts for World Cup 2026.",
  manifest: "/manifest.json",
  icons: { apple: "/icon-192.png" },
  openGraph: {
    title: "FIFA 360 – World Cup 2026",
    description: "Find venues, plan routes, get live scores and AI-verified conditions.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#040812",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <TopNav />
        <div className="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
