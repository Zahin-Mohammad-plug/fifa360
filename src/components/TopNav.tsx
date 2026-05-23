"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { MATCHES } from "@/data/matches";
import { Compass, Map, Radio, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const NAV_ITEMS = [
  { id: "discover", label: "Discover", icon: Compass, href: "/discover", color: "#00b4ff" },
  { id: "route",    label: "Route",    icon: Map,     href: "/route",    color: "#7c4dff" },
  { id: "live",     label: "Live",     icon: Radio,   href: "/live",     color: "#ff1744" },
  { id: "profile",  label: "Profile",  icon: User,    href: "/profile",  color: "#00ff88" },
] as const;

export function TopNav() {
  const pathname   = usePathname();
  const { setActiveTab } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeId = NAV_ITEMS.find((t) => pathname.startsWith(t.href))?.id ?? "discover";
  const liveMatch = MATCHES.find((m) => m.status === "live");

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: "var(--nav-height)",
          background: "rgba(4,8,18,0.92)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 1px 0 rgba(0,180,255,0.06)",
        }}
      >
        <div className="page-container h-full flex items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/discover"
            className="flex items-center gap-2.5 shrink-0 group"
            onClick={() => setActiveTab("discover")}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base font-black"
              style={{
                background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
                boxShadow: "0 0 16px rgba(0,102,255,0.4)",
              }}
            >
              ⚽
            </div>
            <div>
              <div className="text-[15px] font-black text-white tracking-tight leading-none">
                FIFA 360
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em]"
                   style={{ color: "rgba(0,180,255,0.6)" }}>
                World Cup 2026
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_ITEMS.map(({ id, label, icon: Icon, href, color }) => {
              const active = activeId === id;
              return (
                <Link
                  key={id}
                  href={href}
                  onClick={() => setActiveTab(id)}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 group"
                  style={{
                    color: active ? color : "rgba(255,255,255,0.5)",
                    background: active ? `${color}12` : "transparent",
                  }}
                >
                  <Icon className="w-[15px] h-[15px]" />
                  {label}

                  {/* Live dot */}
                  {id === "live" && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inset-0 rounded-full"
                            style={{ background: "#ff1744", animation: "ringPulse 1.6s ease-out infinite" }} />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-[#ff1744]" />
                    </span>
                  )}

                  {/* Active underline */}
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full"
                      style={{ background: color }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side: live score pill + mobile menu */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live match pill */}
            {liveMatch && (
              <Link
                href="/live"
                onClick={() => setActiveTab("live")}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: "rgba(255,23,68,0.12)",
                  border: "1px solid rgba(255,23,68,0.3)",
                  boxShadow: "0 0 12px rgba(255,23,68,0.15)",
                  animation: "gradientBorder 2.5s ease-in-out infinite",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full"
                        style={{ background: "#ff1744", animation: "ringPulse 1.4s ease-out infinite" }} />
                  <span className="relative h-2 w-2 rounded-full bg-[#ff1744]" />
                </span>
                <span className="text-[11px] font-black"
                      style={{ color: "#ff5566" }}>
                  {liveMatch.homeFlag} {liveMatch.scoreHome}–{liveMatch.scoreAway} {liveMatch.awayFlag}
                </span>
                <span className="text-[10px]" style={{ color: "rgba(255,23,68,0.6)" }}>
                  {liveMatch.minute}&apos;
                </span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen
                ? <X className="w-4 h-4 text-white/70" />
                : <Menu className="w-4 h-4 text-white/70" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(4,8,18,0.7)", backdropFilter: "blur(4px)" }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22,1,0.36,1] }}
              className="fixed top-[var(--nav-height)] left-0 right-0 z-50 md:hidden p-3"
              style={{
                background: "rgba(7,16,30,0.98)",
                backdropFilter: "blur(24px)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="space-y-1">
                {NAV_ITEMS.map(({ id, label, icon: Icon, href, color }) => {
                  const active = activeId === id;
                  return (
                    <Link
                      key={id}
                      href={href}
                      onClick={() => { setActiveTab(id); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: active ? `${color}14` : "transparent",
                        color: active ? color : "rgba(255,255,255,0.6)",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-semibold text-sm">{label}</span>
                      {id === "live" && (
                        <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(255,23,68,0.15)", color: "#ff5566", border: "1px solid rgba(255,23,68,0.3)" }}>
                          LIVE
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
