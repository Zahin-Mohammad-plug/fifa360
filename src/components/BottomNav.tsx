"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map, Radio, User } from "lucide-react";

const TABS = [
  { id: "discover", label: "Discover", icon: Compass, href: "/discover" },
  { id: "route",    label: "Route",    icon: Map,     href: "/route"    },
  { id: "live",     label: "Live",     icon: Radio,   href: "/live"     },
  { id: "profile",  label: "Profile",  icon: User,    href: "/profile"  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const activeId = TABS.find((t) => pathname.startsWith(t.href))?.id ?? "discover";

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 glass-panel-heavy"
      style={{ height: "var(--bottom-nav-height)", borderTop: "1px solid rgba(204,255,0,0.08)" }}
    >
      <div className="page-container h-full flex items-center justify-around">
        {TABS.map(({ id, label, icon: Icon, href }) => {
          const isActive = activeId === id;
          return (
            <Link
              key={id}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all select-none"
              style={{
                minWidth: 56,
                color: isActive ? "#ccff00" : "#83927d",
                background: isActive ? "rgba(204,255,0,0.07)" : "transparent",
              }}
            >
              <div className="relative">
                <Icon
                  className="w-5 h-5 transition-all"
                  style={{
                    filter: isActive ? "drop-shadow(0 0 6px rgba(204,255,0,0.5))" : "none",
                  }}
                />
                {id === "live" && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{ background: "#ff3b30", animation: "live-pulse 1.4s infinite" }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-mono font-medium tracking-wide"
                style={{ color: isActive ? "#ccff00" : "#83927d" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
