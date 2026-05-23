"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Venue } from "@/lib/types";

const MODE_COLOR = {
  walking: "#34d399",
  transit: "#38bdf8",
  driving: "#f59e0b",
} as const;

// Stylized, dependency-free map. Always renders a clean animated route so the
// demo never depends on an external tile/token service.
export function MapView({
  venue,
  mode,
  etaMinutes,
  distanceLabel,
}: {
  venue: Venue;
  mode: "walking" | "transit" | "driving";
  etaMinutes: number;
  distanceLabel: string;
}) {
  const color = MODE_COLOR[mode];
  const path = "M62,182 C 120,168 132,96 186,86 S 250,70 262,54";

  return (
    <div className="relative overflow-hidden rounded-3xl glass">
      <svg viewBox="0 0 320 220" className="h-56 w-full">
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <radialGradient id="mapGlow" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#0b1326" />
            <stop offset="100%" stopColor="#05070f" />
          </radialGradient>
        </defs>

        <rect width="320" height="220" fill="url(#mapGlow)" />

        {/* decorative city features */}
        <ellipse cx="240" cy="170" rx="70" ry="42" fill="#10b981" opacity="0.06" />
        <rect x="-10" y="40" width="340" height="20" transform="rotate(-18 160 110)" fill="#0ea5e9" opacity="0.05" />
        {[40, 90, 140, 190, 240, 290].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="220" stroke="white" strokeOpacity="0.04" />
        ))}
        {[40, 90, 140, 190].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="320" y2={y} stroke="white" strokeOpacity="0.04" />
        ))}
        {/* faint building blocks */}
        {[
          [30, 60, 26, 22],
          [110, 30, 30, 18],
          [200, 110, 34, 24],
          [150, 150, 28, 20],
          [250, 130, 24, 30],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="white" opacity="0.05" />
        ))}

        {/* route underlay + animated draw */}
        <path d={path} fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="7" strokeLinecap="round" />
        <motion.path
          id="routepath"
          d={path}
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={mode === "transit" ? "1 0" : mode === "walking" ? "1 7" : "1 0"}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />

        {/* traveling marker */}
        <circle r="4.5" fill="#ffffff">
          <animateMotion dur="3s" repeatCount="indefinite" path={path} />
        </circle>
        <circle r="9" fill={color} opacity="0.35">
          <animateMotion dur="3s" repeatCount="indefinite" path={path} />
        </circle>

        {/* origin pin */}
        <g>
          <circle cx="62" cy="182" r="9" fill="#38bdf8" opacity="0.25">
            <animate attributeName="r" values="9;16;9" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="62" cy="182" r="6" fill="#38bdf8" stroke="white" strokeWidth="2" />
        </g>

        {/* destination pin */}
        <g transform="translate(262,54)">
          <circle r="11" fill={color} opacity="0.25" />
          <circle r="7" fill={color} stroke="white" strokeWidth="2" />
        </g>
      </svg>

      {/* labels */}
      <div className="pointer-events-none absolute left-3 bottom-3 rounded-xl bg-black/50 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
        You are here
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-xl bg-black/50 px-2.5 py-1 text-[11px] font-semibold backdrop-blur"
      >
        <MapPin className="h-3.5 w-3.5" style={{ color }} />
        {venue.name.split(" ").slice(0, 2).join(" ")}
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent pb-2 pt-6 text-xs">
        <span className="font-bold" style={{ color }}>
          {etaMinutes} min
        </span>
        <span className="text-white/50">· {distanceLabel} ·</span>
        <span className="capitalize text-white/70">{mode}</span>
      </div>
    </div>
  );
}
