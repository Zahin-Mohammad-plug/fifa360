"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map, Radio, User } from "lucide-react";

const TABS = [
  { id: "discover", label: "Discover", icon: Compass, href: "/discover" },
  { id: "route",    label: "Arrival",  icon: Map,     href: "/route"    },
  { id: "live",     label: "Live",     icon: Radio,   href: "/live"     },
  { id: "profile",  label: "Profile",  icon: User,    href: "/profile"  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const activeId = TABS.find((t) => pathname.startsWith(t.href))?.id ?? "discover";

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 glass-panel-heavy"
      style={{ height: "var(--bottom-nav-height)", borderTop: "1px solid rgba(255,255,255,0.055)" }}
    >
      <div className="page-container h-full flex items-center justify-around px-1">
        {TABS.map(({ id, label, icon: Icon, href }) => {
          const isActive = activeId === id;
          return (
            <Link
              key={id}
              href={href}
              className="relative flex flex-col items-center justify-center gap-1 rounded-2xl select-none"
              style={{
                minWidth: 62,
                height: 54,
                padding: "6px 10px",
              }}
            >
              {/* Active background pill */}
              {isActive && (
                <span
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "linear-gradient(180deg, rgba(204,255,0,0.1) 0%, rgba(204,255,0,0.06) 100%)",
                    border: "1px solid rgba(204,255,0,0.2)",
                    boxShadow: "0 0 16px rgba(204,255,0,0.07)",
                  }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10">
                <Icon
                  className="transition-all duration-200"
                  style={{
                    width: 20, height: 20,
                    color: isActive ? "#ccff00" : "#7a8a75",
                    filter: isActive ? "drop-shadow(0 0 8px rgba(204,255,0,0.6))" : "none",
                    strokeWidth: isActive ? 2.3 : 1.8,
                  }}
                />
                {id === "live" && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{
                      background: "#ff3b30",
                      boxShadow: "0 0 6px rgba(255,59,48,0.65)",
                      animation: "live-pulse 1.4s infinite",
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className="relative z-10 leading-none"
                style={{
                  fontSize: "9.5px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: isActive ? "#ccff00" : "#7a8a75",
                }}
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
