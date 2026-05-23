"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import { MATCHES } from "@/data/matches";
import { getVenuesForMatch } from "@/data/venues";
import { TRANSIT_PLANS } from "@/data/transit";
import { Venue } from "@/types";
import { ArrivalMap } from "@/components/ArrivalMap";
import {
  Navigation, Train, RefreshCw, Zap, ChevronDown, MapPin, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type RouteMode = "metro" | "rideshare";

const STEP_STYLES = {
  walk:   { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.28)", color: "#fbbf24", label: "Footpath",    emoji: "🏃" },
  train:  { bg: "rgba(204,255,0,0.08)",  border: "rgba(204,255,0,0.25)",  color: "#ccff00", label: "Rail Line",   emoji: "🚆" },
  bus:    { bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.25)", color: "#93c5fd", label: "Bus Shuttle", emoji: "🚌" },
  arrive: { bg: "rgba(255,59,48,0.1)",   border: "rgba(255,59,48,0.25)",  color: "#ff5e54", label: "Destination", emoji: "🏁" },
};

export default function RoutePage() {
  const { selectedMatch, selectedVenue, setSelectedVenue } = useAppStore();

  const activeMatch = selectedMatch ?? MATCHES.find((m) => m.status === "live") ?? MATCHES[0];
  const venues      = getVenuesForMatch(activeMatch.id);
  const activeVenue: Venue | null = selectedVenue ?? venues[0] ?? null;
  const getDepartureSeconds = (venue: Venue | null) => ((venue?.departureCountdown ?? 15) * 60) - 10;

  const [mode,        setMode]       = useState<RouteMode>("metro");
  const [secs,        setSecs]       = useState<number>(() => getDepartureSeconds(activeVenue));
  const [updating,    setUpdating]   = useState(false);
  const [showPicker,  setShowPicker] = useState(false);

  const transitData = activeVenue ? TRANSIT_PLANS[activeVenue.id] ?? null : null;

  useEffect(() => {
    const id = setInterval(() => setSecs((p) => (p <= 1 ? 15 * 60 : p - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const handleModeChange = (m: RouteMode) => {
    setUpdating(true); setMode(m);
    setTimeout(() => setUpdating(false), 500);
  };

  const handleVenueSwitch = useCallback((v: Venue, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVenue(v);
    setSecs(getDepartureSeconds(v));
    setShowPicker(false);
    setUpdating(true);
    setTimeout(() => setUpdating(false), 550);
  }, [setSelectedVenue]);

  const urgencyColor   = secs < 300 ? "#ff3b30" : secs < 600 ? "#f59e0b" : "#ccff00";
  const urgencyBg      = secs < 300 ? "rgba(255,59,48,0.1)" : secs < 600 ? "rgba(245,158,11,0.1)" : "rgba(204,255,0,0.08)";
  const urgencyBorder  = secs < 300 ? "rgba(255,59,48,0.3)" : secs < 600 ? "rgba(245,158,11,0.3)" : "rgba(204,255,0,0.3)";

  return (
    <div className="page-enter pb-6">
      <div className="page-container pt-5 space-y-4 xl:space-y-5">

        {/* ══ Transit Header ══ */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(10,18,8,0.72)",
            border: "1px solid rgba(204,255,0,0.12)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="label-mono flex items-center gap-1.5 mb-1.5">
                <Navigation className="w-3 h-3 animate-live-dot" style={{ color: "#ccff00" }} />
                Match Arrival Intelligence
              </div>
              <h2
                className="text-[15px] font-extrabold leading-tight truncate"
                style={{ color: "#f5f9f3" }}
              >
                {activeVenue ? activeVenue.name : "No venue selected"}
              </h2>
              <p className="text-[11px] mt-0.5 flex items-center gap-1 truncate" style={{ color: "#7a8a75" }}>
                <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: "#ccff00" }} />
                {activeVenue ? activeVenue.address : "Select a venue from Discover"}
              </p>
            </div>

            {/* Countdown chip */}
            {activeVenue && (
              <div
                className="flex-shrink-0 rounded-2xl text-center px-3.5 py-2.5"
                style={{
                  background: urgencyBg,
                  border: `1px solid ${urgencyBorder}`,
                  boxShadow: `0 0 14px ${urgencyColor}25`,
                  minWidth: 70,
                }}
              >
                <span
                  className="block text-[8.5px] font-mono font-semibold uppercase mb-0.5"
                  style={{ color: "#7a8a75", letterSpacing: "0.1em" }}
                >
                  Leave In
                </span>
                <span
                  className="block text-[15px] font-mono font-extrabold leading-none"
                  style={{ color: urgencyColor, textShadow: `0 0 8px ${urgencyColor}50` }}
                >
                  {formatCountdown(secs)}
                </span>
              </div>
            )}
          </div>

          {/* Match info strip */}
          <div
            className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl"
            style={{ background: "rgba(5,9,3,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-sm">{activeMatch.homeFlag}</span>
            <span className="text-[11px] font-mono font-bold" style={{ color: "#f5f9f3" }}>
              {activeMatch.homeShort}
              {activeMatch.status !== "upcoming" && ` ${activeMatch.scoreHome}–${activeMatch.scoreAway} `}
              {activeMatch.awayShort}
            </span>
            <span className="text-sm">{activeMatch.awayFlag}</span>
            {activeMatch.status === "live" && (
              <span className="chip chip-live ml-auto">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#ff3b30", animation: "live-pulse 1.4s infinite" }} />
                {activeMatch.minute}′
              </span>
            )}
            {activeMatch.status !== "live" && (
              <span className="chip chip-amber ml-auto">
                <Clock className="w-2.5 h-2.5" /> {activeMatch.time}
              </span>
            )}
          </div>

          {/* Venue picker dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPicker((v) => !v)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#f5f9f3",
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#ccff00" }} />
                <span className="font-semibold text-sm truncate">
                  {activeVenue?.name ?? "Pick a venue"}
                </span>
              </div>
              <ChevronDown
                className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                style={{ color: "#7a8a75", transform: showPicker ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-20"
                  style={{
                    background: "rgba(8,14,6,0.97)",
                    border: "1px solid rgba(204,255,0,0.18)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {venues.map((v, vi) => (
                    <button
                      key={v.id}
                      onClick={(e) => handleVenueSwitch(v, e)}
                      className="w-full text-left px-4 py-3 transition-colors"
                      style={{
                        borderBottom: vi < venues.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                        background: activeVenue?.id === v.id ? "rgba(204,255,0,0.07)" : undefined,
                      }}
                    >
                      <div
                        className="text-[13px] font-bold"
                        style={{ color: activeVenue?.id === v.id ? "#ccff00" : "#f5f9f3" }}
                      >
                        {v.name}
                      </div>
                      <div className="text-[10px] font-mono mt-0.5" style={{ color: "#7a8a75" }}>
                        {v.departureCountdown} min · {v.routeTime}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] xl:items-start">
          {/* ══ Apple MapKit (with demo fallback) ══ */}
          <div
            className="relative w-full rounded-3xl overflow-hidden"
            style={{ height: "min(62vh, 560px)", minHeight: 300, background: "#070d05", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <ArrivalMap venue={activeVenue} transportMode={mode} />

            {/* Compass */}
            <div
              className="absolute top-3.5 left-3.5 flex items-center justify-center rounded-lg text-[9px] font-mono"
              style={{
                width: 30, height: 30,
                background: "rgba(0,0,0,0.65)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#7a8a75",
                backdropFilter: "blur(6px)",
              }}
            >
              N 🧭
            </div>

            {/* Live score pill */}
            {activeMatch.status === "live" && (
              <div
                className="absolute bottom-3.5 right-3.5 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-mono"
                style={{
                  background: "rgba(5,9,3,0.92)",
                  border: "1px solid rgba(204,255,0,0.28)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 0 14px rgba(204,255,0,0.1)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "#ff3b30", animation: "live-pulse 1.4s infinite" }}/>
                <span className="font-bold" style={{ color: "#f5f9f3" }}>
                  {activeMatch.homeShort} {activeMatch.scoreHome}–{activeMatch.scoreAway} {activeMatch.awayShort}
                </span>
                <span style={{ color: "#7a8a75" }}>{activeMatch.minute}′</span>
              </div>
            )}

            {/* Mode switcher */}
            <div
              className="absolute bottom-3.5 left-3.5 flex gap-1 p-1 rounded-xl"
              style={{
                background: "rgba(5,9,3,0.92)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(10px)",
              }}
            >
              {(["metro", "rideshare"] as RouteMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className="text-[9px] font-mono font-bold uppercase py-1.5 px-2.5 rounded-lg transition-all cursor-pointer"
                  style={mode === m
                    ? { background: "#ccff00", color: "#060b03", boxShadow: "0 2px 8px rgba(204,255,0,0.25)" }
                    : { color: "#7a8a75" }
                  }
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* ══ Transit Steps ══ */}
          <div className="xl:max-h-[min(62vh,560px)] xl:overflow-y-auto xl:pr-1">
          <div className="flex items-center justify-between mb-3">
            <span className="label-mono">Arrival Plan</span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: "#ccff00" }}>
              <Train className="w-3.5 h-3.5" />
              <span>{activeVenue?.routeTime ?? "—"}</span>
            </div>
          </div>

          {updating ? (
            <div className="space-y-2">
              {[1,2,3].map((k) => (
                <div key={k} className="h-16 rounded-xl animate-shimmer" style={{ border: "1px solid rgba(255,255,255,0.05)" }} />
              ))}
            </div>
          ) : activeVenue && transitData ? (
            <div className="space-y-0">
              {transitData.steps.map((step, i) => {
                const ts       = STEP_STYLES[step.type];
                const isLast   = i === transitData.steps.length - 1;

                return (
                  <div key={i} className="flex gap-0">
                    {/* Step connector column */}
                    <div className="flex flex-col items-center" style={{ width: 40, flexShrink: 0 }}>
                      {/* Step circle */}
                      <div
                        className="flex items-center justify-center rounded-full text-sm z-10"
                        style={{
                          width: 36, height: 36,
                          background: ts.bg,
                          border: `1.5px solid ${ts.border}`,
                          flexShrink: 0,
                        }}
                      >
                        {ts.emoji}
                      </div>
                      {/* Connector line */}
                      {!isLast && (
                        <div
                          className="flex-1 w-px my-1"
                          style={{
                            minHeight: 16,
                            background: `linear-gradient(to bottom, ${ts.color}44, rgba(255,255,255,0.06))`,
                          }}
                        />
                      )}
                    </div>

                    {/* Step content */}
                    <div
                      className="flex-1 ml-3 pb-4"
                      style={{ minHeight: isLast ? "auto" : 56 }}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <h4
                            className="text-[12.5px] font-bold leading-tight"
                            style={{ color: "#f5f9f3" }}
                          >
                            {step.instruction}
                          </h4>
                          <p
                            className="text-[10px] font-mono mt-0.5"
                            style={{ color: ts.color + "bb" }}
                          >
                            {ts.label}
                          </p>
                        </div>
                        {step.duration > 0 && (
                          <span
                            className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg ml-3 flex-shrink-0"
                            style={{
                              background: `${ts.color}10`,
                              border: `1px solid ${ts.color}28`,
                              color: ts.color,
                            }}
                          >
                            {step.duration}m
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                );
              })}

              {/* CTA row */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    const idx = venues.findIndex((v) => v.id === activeVenue.id);
                    const nextVenue = venues[(idx + 1) % venues.length];
                    setSelectedVenue(nextVenue);
                    setSecs(getDepartureSeconds(nextVenue));
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#b0bfac",
                  }}
                >
                  <RefreshCw className="w-4 h-4" style={{ color: "#ccff00" }} />
                  Alternate Venue
                </button>
                <button
                  className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all"
                  style={{
                    background: "#ccff00",
                    color: "#060b03",
                    boxShadow: "0 4px 14px rgba(204,255,0,0.3)",
                  }}
                >
                  <Zap className="w-4 h-4" />
                  Sync Plans
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl py-10 px-4 text-center"
              style={{ background: "rgba(10,18,8,0.45)", border: "1px dashed rgba(255,255,255,0.07)" }}
            >
              <Navigation className="w-6 h-6 mx-auto mb-3 animate-live-dot" style={{ color: "#ccff00" }} />
              <p className="text-xs" style={{ color: "#7a8a75" }}>
                Select a fixture and venue on Discover to plot your route.
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
