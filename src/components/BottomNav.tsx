"use client";

import { useAppStore } from "@/store/appStore";
import { useRouter, usePathname } from "next/navigation";
import { Compass, Map, Radio, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { id: "discover", label: "Discover", icon: Compass,  href: "/discover", color: "#00b4ff" },
  { id: "route",    label: "Route",    icon: Map,       href: "/route",    color: "#7c4dff" },
  { id: "live",     label: "Live",     icon: Radio,     href: "/live",     color: "#ff1744" },
  { id: "profile",  label: "Profile",  icon: User,      href: "/profile",  color: "#00ff88" },
] as const;

export function BottomNav() {
  const router   = useRouter();
  const pathname = usePathname();
  const { setActiveTab } = useAppStore();

  const activeId = TABS.find((t) => pathname.startsWith(t.href))?.id ?? "discover";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto px-3 pb-3"
         style={{ paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 12px)" }}>
      {/* Frosted glass pill */}
      <div className="relative rounded-[28px] border border-white/10 overflow-hidden"
           style={{
             background: "rgba(7,16,30,0.85)",
             backdropFilter: "blur(32px)",
             WebkitBackdropFilter: "blur(32px)",
             boxShadow: "0 -2px 0 rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset",
           }}>
        <div className="flex items-stretch px-2 py-1.5 gap-1">
          {TABS.map(({ id, label, icon: Icon, href, color }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id as typeof activeId);
                  router.push(href);
                }}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-[20px] transition-colors duration-200"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {/* Active background pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-[20px]"
                      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon wrapper */}
                <div className="relative z-10">
                  <motion.div
                    animate={isActive ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Icon
                      className="w-[18px] h-[18px] transition-all duration-200"
                      style={{ color: isActive ? color : "rgba(255,255,255,0.35)" }}
                    />
                  </motion.div>

                  {/* Live dot with rings */}
                  {id === "live" && (
                    <span className="absolute -top-0.5 -right-1 flex items-center justify-center">
                      <span className="absolute w-2.5 h-2.5 rounded-full opacity-60"
                            style={{ background: "#ff1744", animation: "ringPulse 1.8s ease-out infinite" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff1744] relative z-10" />
                    </span>
                  )}
                </div>

                {/* Label */}
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.35 }}
                  className="text-[10px] font-semibold z-10 relative"
                  style={{ color: isActive ? color : undefined }}
                >
                  {label}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
