"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/",        label: "Home",   icon: "🏠" },
  { href: "/venue",   label: "Venues", icon: "🏟️" },
  { href: "/live",    label: "Live",   icon: "⚽" },
  { href: "/route",   label: "Route",  icon: "🗺️" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-gray-900/95 backdrop-blur border-t border-gray-800 safe-bottom"
      style={{ height: "var(--bottom-nav-height)" }}
    >
      <div className="page-container h-full">
        <div className="flex h-full items-stretch justify-around">
          {tabs.map((tab) => {
            const active =
              pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 max-w-[120px] flex flex-col items-center justify-center text-xs transition-colors ${
                  active ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="text-xl leading-none mb-0.5">{tab.icon}</span>
                <span className={active ? "font-semibold" : ""}>{tab.label}</span>
                {active && <span className="w-1 h-1 rounded-full bg-blue-400 mt-1" />}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
