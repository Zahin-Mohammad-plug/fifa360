import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Background } from "@/components/ui/Background";
import { NavBar } from "@/components/NavBar";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "FIFA 360 — Matchday Companion",
  description:
    "Your AI matchday operating system for the 2026 World Cup. Find the venue, get there on time, follow every moment live.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FIFA 360" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05070f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Background />
        <Providers>
          <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col">
            <main className="pb-safe flex-1 px-4 pt-5">{children}</main>
            <NavBar />
          </div>
        </Providers>
      </body>
    </html>
  );
}
