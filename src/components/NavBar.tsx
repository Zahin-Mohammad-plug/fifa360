"use client";

import { motion } from "framer-motion";
import { Home, MapPinned, Radio, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/venue", label: "Venues", icon: MapPinned, match: (p: string) => p.startsWith("/venue") },
  { href: "/live", label: "Live", icon: Radio, match: (p: string) => p.startsWith("/live"), live: true },
  { href: "/profile", label: "Profile", icon: User, match: (p: string) => p.startsWith("/profile") },
];

export function NavBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/profile/onboarding")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[440px] px-4">
      <div className="glass-strong mb-3 flex items-center justify-around rounded-2xl p-1.5">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring pressable relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2"
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-white/15"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-pitch-300" : "text-white/55",
                  )}
                />
                {item.live && (
                  <span className="absolute -right-1 -top-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "relative text-[10px] font-medium transition-colors",
                  active ? "text-white" : "text-white/45",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
