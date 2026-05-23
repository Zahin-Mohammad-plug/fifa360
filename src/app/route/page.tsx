"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import { MATCHES } from "@/data/matches";
import { getVenuesForMatch } from "@/data/venues";
import { TRANSIT_PLANS } from "@/data/transit";
import { Venue } from "@/types";
import {
  Navigation, Train, RefreshCw, ExternalLink, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type RouteMode = "metro" | "rideshare";

export default function RoutePage() {
  const { selectedMatch, selectedVenue, setSelectedVenue } = useAppStore();

  const activeMatch = selectedMatch ?? MATCHES.find((m) => m.status === "live") ?? MATCHES[0];
  const venues = getVenuesForMatch(activeMatch.id);
  const activeVenue: Venue | null = selectedVenue ?? venues[0] ?? null;

  const [mode, setMode]       = useState<RouteMode>("metro");
  const [secs, setSecs]       = useState<number>(0);
  const [updating, setUpdating] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const transitData = activeVenue ? TRANSIT_PLANS[activeVenue.id] ?? null : null;

  // Init countdown from venue
  useEffect(() => {
    if (activeVenue) setSecs((activeVenue.departureCountdown ?? 15) * 60 - 10);
  }, [activeVenue]);

  // Tick down
  useEffect(() => {
    const id = setInterval(() => setSecs((p) => (p <= 1 ? 15 * 60 : p - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}m ${String(r).padStart(2, "0")}s`;
  };

  const handleModeChange = (m: RouteMode) => {
    setUpdating(true);
    setMode(m);
    setTimeout(() => setUpdating(false), 500);
  };

  const handleVenueSwitch = useCallback((v: Venue, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVenue(v);
    setShowPicker(false);
    setUpdating(true);
    setTimeout(() => setUpdating(false), 600);
  }, [setSelectedVenue]);

  const urgencyColor = secs < 300 ? "#ff3b30" : secs < 600 ? "#f59e0b" : "#ccff00";

  return (
    <div className="page-enter pb-4">
      <div className="page-container pt-4 space-y-4">

        {/* ── Transit header card ── */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(13,21,11,0.7)", border: "1px solid rgba(204,255,0,0.1)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="label-mono flex items-center gap-1.5 mb-1">
                <Navigation className="w-3 h-3 animate-live-dot" style={{ color: "#ccff00" }} />
                Transit Departure Map
              </div>
              <h2 className="text-base font-extrabold truncate" style={{ color: "#f9fbf8" }}>
                {activeVenue ? activeVenue.name : "No venue selected"}
              </h2>
              <p className="text-xs mt-0.5 truncate" style={{ color: "#83927d" }}>
                {activeVenue ? activeVenue.address : "Select a venue from Discover"}
              </p>
            </div>

            {/* Departure countdown chip */}
            {activeVenue && (
              <div
                className="flex-shrink-0 rounded-xl text-center px-3 py-2"
                style={{
                  background: "rgba(7,12,4,0.9)",
                  border: `1px solid ${urgencyColor}`,
                  boxShadow: `0 0 12px ${urgencyColor}30`,
                }}
              >
                <span className="block text-[9px] font-mono font-medium uppercase" style={{ color: "#83927d", letterSpacing: "0.1em" }}>
                  Leave In
                </span>
                <span className="block text-xs font-mono font-bold mt-0.5" style={{ color: urgencyColor }}>
                  {formatCountdown(secs)}
                </span>
              </div>
            )}
          </div>

          {/* Venue picker */}
          <div className="mt-3 relative">
            <button
              onClick={() => setShowPicker((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f9fbf8" }}
            >
              <span className="font-medium text-sm">{activeVenue?.name ?? "Pick a venue"}</span>
              <ChevronDown className="w-4 h-4" style={{ color: "#83927d", transform: showPicker ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </button>

            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
                  style={{ background: "rgba(11,18,8,0.97)", border: "1px solid rgba(204,255,0,0.15)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
                >
                  {venues.map((v) => (
                    <button
                      key={v.id}
                      onClick={(e) => handleVenueSwitch(v, e)}
                      className="w-full text-left px-4 py-3 transition-colors"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background: activeVenue?.id === v.id ? "rgba(204,255,0,0.08)" : undefined,
                      }}
                    >
                      <div className="text-sm font-bold" style={{ color: activeVenue?.id === v.id ? "#ccff00" : "#f9fbf8" }}>{v.name}</div>
                      <div className="text-[10px] font-mono mt-0.5" style={{ color: "#83927d" }}>{v.departureCountdown} min · {v.routeTime}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── SVG Map ── */}
        <div
          className="relative w-full rounded-3xl overflow-hidden pitch-grid"
          style={{ height: 280, background: "#090e05", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#ccff00" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Road grid lines */}
            <path d="M0 70 L450 70 M0 140 L450 140 M0 210 L450 210" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            <path d="M60 0 L60 320 M150 0 L150 320 M250 0 L250 320 M350 0 L350 320" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>

            {/* Shadow path */}
            <path d="M 55 230 L 130 170 L 220 170 L 285 105 L 330 105" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Active route — glowing dashed */}
            <path d="M 55 230 L 130 170 L 220 170 L 285 105 L 330 105" fill="none" stroke="url(#routeGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 6" className="animate-dash" filter="url(#glow)" />

            {/* Walking segment to destination */}
            <path d="M 330 105 L 360 105 L 360 65" fill="none" stroke="#ccff00" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round"/>

            {/* Waypoint nodes */}
            {[[130,170],[220,170],[285,105]].map(([cx,cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="4" fill="#182612" stroke="rgba(204,255,0,0.4)" strokeWidth="1.5"/>
              </g>
            ))}

            {/* Origin — user */}
            <circle cx="55" cy="230" r="12" fill="rgba(204,255,0,0.1)"/>
            <circle cx="55" cy="230" r="5" fill="#ccff00"/>
            <text x="55" y="255" fill="#ccff00" fontSize="8" fontFamily="JetBrains Mono,monospace" textAnchor="middle" fontWeight="700">YOU</text>

            {/* Destination */}
            <circle cx="360" cy="65" r="13" fill="rgba(255,59,48,0.18)"/>
            <circle cx="360" cy="65" r="6" fill="#ff3b30"/>
            <polygon points="360,60 364,69 356,69" fill="#fff"/>
            <text x="360" y="48" fill="#f9fbf8" fontSize="8" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="700">
              {activeVenue ? activeVenue.name.split(" ").slice(0,2).join(" ") : "Venue"}
            </text>
          </svg>

          {/* Compass */}
          <div
            className="absolute top-4 left-4 flex items-center justify-center rounded-lg text-[9px] font-mono"
            style={{ width: 30, height: 30, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.06)", color: "#83927d" }}
          >
            N 🧭
          </div>

          {/* Live score overlay */}
          {activeMatch.status === "live" && (
            <div
              className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-mono"
              style={{ background: "rgba(7,12,4,0.9)", border: "1px solid rgba(204,255,0,0.25)", boxShadow: "0 0 12px rgba(204,255,0,0.1)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-live-dot" style={{ background: "#ff3b30" }}/>
              <span className="font-bold" style={{ color: "#f9fbf8" }}>
                {activeMatch.homeShort} {activeMatch.scoreHome}–{activeMatch.scoreAway} {activeMatch.awayShort}
              </span>
              <span style={{ color: "#83927d" }}>{activeMatch.minute}&apos;</span>
            </div>
          )}

          {/* Mode switcher */}
          <div
            className="absolute bottom-4 left-4 flex gap-1 p-1 rounded-xl"
            style={{ background: "rgba(7,12,4,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {(["metro", "rideshare"] as RouteMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className="text-[9px] font-mono font-bold uppercase py-1 px-2 rounded-lg transition-colors cursor-pointer"
                style={mode === m ? { background: "#ccff00", color: "#070c04" } : { color: "#83927d" }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* ── Transit steps ── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <span className="label-mono">Transit Waypoints</span>
            <span className="flex items-center gap-1 text-[11px] font-mono" style={{ color: "#ccff00" }}>
              <Train className="w-3.5 h-3.5" />
              {activeVenue?.routeTime ?? "N/A"}
            </span>
          </div>

          {updating ? (
            <div className="space-y-2">
              {[1,2].map((k) => (
                <div key={k} className="h-14 rounded-xl animate-shimmer" style={{ border: "1px solid rgba(255,255,255,0.05)" }} />
              ))}
            </div>
          ) : activeVenue && transitData ? (
            <div className="space-y-2.5">
              {transitData.steps.map((step, i) => {
                const typeStyle = {
                  walk:   { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  color: "#f59e0b",  emoji: "🏃" },
                  train:  { bg: "rgba(204,255,0,0.08)",  border: "rgba(204,255,0,0.25)",  color: "#ccff00",  emoji: "🚆" },
                  bus:    { bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)", color: "#3b82f6",  emoji: "🚌" },
                  arrive: { bg: "rgba(255,59,48,0.1)",   border: "rgba(255,59,48,0.25)",  color: "#ff3b30",  emoji: "🏁" },
                }[step.type];

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between px-3 py-3 rounded-xl"
                    style={{ background: "rgba(13,21,11,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: typeStyle.bg, border: `1px solid ${typeStyle.border}` }}
                      >
                        {typeStyle.emoji}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-tight" style={{ color: "#f9fbf8" }}>{step.instruction}</h4>
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: "#83927d" }}>
                          {{ walk: "Footpath", train: "Rail Line", bus: "Bus Shuttle", arrive: "Destination" }[step.type]}
                        </p>
                      </div>
                    </div>
                    {step.duration > 0 && (
                      <span
                        className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "#b8c5b4" }}
                      >
                        {step.duration}m
                      </span>
                    )}
                  </motion.div>
                );
              })}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    const idx = venues.findIndex((v) => v.id === activeVenue.id);
                    setSelectedVenue(venues[(idx + 1) % venues.length]);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#b8c5b4" }}
                >
                  <RefreshCw className="w-4 h-4" style={{ color: "#ccff00" }} /> Alternate Venue
                </button>
                <button
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-colors"
                  style={{ background: "#ccff00", color: "#070c04" }}
                >
                  <ExternalLink className="w-4 h-4" /> Sync Plans
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl py-8 px-4 text-center"
              style={{ background: "rgba(13,21,11,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <Navigation className="w-6 h-6 mx-auto mb-2 animate-live-dot" style={{ color: "#ccff00" }} />
              <p className="text-xs" style={{ color: "#83927d" }}>
                Select a fixture and venue on Discover to plot your route.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
