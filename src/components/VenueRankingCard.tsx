"use client";

import { useState } from "react";
import { Venue } from "@/types";
import { cn } from "@/lib/utils";
import { Shield, CheckCircle, Users, Clock, Phone, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  venue: Venue & { score?: number; explanationChips?: string[]; scoreBreakdown?: Record<string, number> };
  rank: number;
  isTop?: boolean;
  onSelect: (venue: Venue) => void;
  conciergeVerified?: boolean;
}

const RANK_COLORS = [
  { bg: "#ffd740", text: "#7a3f00", glow: "rgba(255,215,64,0.4)" },   // 1 — gold
  { bg: "#a0b4d0", text: "#1a2a3a", glow: "rgba(160,180,208,0.3)" },  // 2 — silver
  { bg: "#cd7f32", text: "#3a1a00", glow: "rgba(205,127,50,0.3)" },   // 3 — bronze
  { bg: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.4)", glow: "transparent" },
];

const BREAKDOWN_LABELS: Record<string, string> = {
  distance: "Distance / ETA",
  teamCrowd: "Team Crowd Fit",
  capacity: "Capacity",
  groupFriendly: "Group Friendly",
  atmosphere: "Atmosphere",
  sourceTrust: "Trust Level",
  amenities: "Amenities",
};

const BREAKDOWN_COLORS: Record<string, string> = {
  distance: "#00b4ff",
  teamCrowd: "#00ff88",
  capacity: "#ff9100",
  groupFriendly: "#7c4dff",
  atmosphere: "#ff1d78",
  sourceTrust: "#ffd740",
  amenities: "#00b4ff",
};

function TrustBadge({ level }: { level: Venue["trustLevel"] }) {
  if (level === "official") return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ color: "#00ff88", background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)" }}>
      <Shield className="w-2.5 h-2.5" /> Official
    </span>
  );
  if (level === "verified") return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ color: "#00b4ff", background: "rgba(0,180,255,0.12)", border: "1px solid rgba(0,180,255,0.3)" }}>
      <CheckCircle className="w-2.5 h-2.5" /> Verified
    </span>
  );
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
          style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
      Community
    </span>
  );
}

function CapacityBar({ status }: { status?: string }) {
  const map: Record<string, { pct: number; color: string; label: string }> = {
    low:         { pct: 22, color: "#00ff88", label: "Plenty of space" },
    medium:      { pct: 55, color: "#ffd740", label: "Filling up" },
    high:        { pct: 80, color: "#ff9100", label: "Getting busy" },
    "full-soon": { pct: 95, color: "#ff1744", label: "⚠ Almost full" },
  };
  const info = map[status ?? "medium"] ?? map.medium;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${info.pct}%` }}
          transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }}
          className="h-full rounded-full"
          style={{ background: info.color, boxShadow: `0 0 6px ${info.color}60` }}
        />
      </div>
      <span className="text-[10px] shrink-0" style={{ color: info.color }}>{info.label}</span>
    </div>
  );
}

export function VenueRankingCard({ venue, rank, isTop = false, onSelect, conciergeVerified }: Props) {
  const [whyOpen, setWhyOpen] = useState(false);
  const rankStyle = RANK_COLORS[Math.min(rank - 1, RANK_COLORS.length - 1)];

  return (
    <motion.div
      layout
      className="w-full rounded-2xl overflow-hidden"
      style={{
        background: isTop
          ? "linear-gradient(135deg, #0e1830 0%, #0a1020 100%)"
          : "linear-gradient(135deg, #09142a 0%, #060e1a 100%)",
        border: isTop
          ? "1px solid rgba(255,215,64,0.25)"
          : "1px solid rgba(255,255,255,0.07)",
        boxShadow: isTop
          ? "0 0 32px rgba(255,215,64,0.06), 0 4px 24px rgba(0,0,0,0.4)"
          : "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Hero image */}
      <div className="relative h-[90px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/icon?name=${encodeURIComponent(venue.name)}`}
          alt={venue.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0"
             style={{
               background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(4,8,18,0.85) 100%)",
             }} />

        {/* Rank badge */}
        <div className="absolute top-2.5 left-3 flex items-center justify-center w-8 h-8 rounded-full font-black text-sm"
             style={{
               background: rankStyle.bg,
               color: rankStyle.text,
               boxShadow: rank <= 3 ? `0 0 16px ${rankStyle.glow}` : undefined,
               fontVariantNumeric: "tabular-nums",
             }}>
          {rank}
        </div>

        {/* Score badge */}
        {venue.score !== undefined && (
          <div className="absolute top-2.5 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full"
               style={{
                 background: "rgba(0,0,0,0.6)",
                 border: "1px solid rgba(255,255,255,0.15)",
                 backdropFilter: "blur(8px)",
               }}>
            <span className="text-[11px] font-black text-white">{venue.score}</span>
            <span className="text-[9px] text-white/40">pts</span>
          </div>
        )}

        {/* Top pick ribbon */}
        {isTop && (
          <div className="absolute bottom-2 left-3">
            <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,215,64,0.2)",
                    border: "1px solid rgba(255,215,64,0.5)",
                    color: "#ffd740",
                    boxShadow: "0 0 10px rgba(255,215,64,0.2)",
                  }}>
              ⭐ TOP PICK
            </span>
          </div>
        )}
      </div>

      {/* Main content */}
      <button
        onClick={() => onSelect(venue)}
        className="w-full text-left p-4 space-y-3 active:bg-white/3 transition-colors"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* Name + address */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-black text-white text-base leading-tight truncate">{venue.name}</div>
            <div className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
              {venue.address}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <TrustBadge level={venue.trustLevel} />
          {conciergeVerified && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ color: "#7c4dff", background: "rgba(124,77,255,0.12)", border: "1px solid rgba(124,77,255,0.3)" }}>
              <Phone className="w-2.5 h-2.5" /> Called
            </span>
          )}
          {venue.supportsGroups && (
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Users className="w-2.5 h-2.5" /> Groups
            </span>
          )}
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            {"$".repeat(venue.priceLevel)}{"·".repeat(4 - venue.priceLevel)}
          </span>
        </div>

        {/* Vibe tags */}
        <div className="flex gap-1.5 flex-wrap">
          {venue.vibeTags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    color: "rgba(0,180,255,0.8)",
                    background: "rgba(0,180,255,0.08)",
                    border: "1px solid rgba(0,180,255,0.18)",
                  }}>
              {tag}
            </span>
          ))}
        </div>

        {/* ETA row */}
        <div className="flex items-center gap-4">
          {venue.etaMinutes !== undefined && (
            <div className="flex items-center gap-1 text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              <Clock className="w-3 h-3" style={{ color: "#00b4ff" }} />
              <span>{venue.etaMinutes} min walk</span>
            </div>
          )}
          {venue.distanceKm !== undefined && (
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              {venue.distanceKm} km away
            </span>
          )}
        </div>

        {/* Capacity bar */}
        {venue.concierge && <CapacityBar status={venue.concierge.capacityStatus} />}

        {/* Explanation chips */}
        {venue.explanationChips && venue.explanationChips.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {venue.explanationChips.map((chip) => (
              <span key={chip} className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      color: "rgba(0,255,136,0.8)",
                      background: "rgba(0,255,136,0.07)",
                      border: "1px solid rgba(0,255,136,0.2)",
                    }}>
                {chip}
              </span>
            ))}
          </div>
        )}
      </button>

      {/* Score breakdown expander */}
      {venue.scoreBreakdown && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            onClick={() => setWhyOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 transition-colors"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
              Why this venue?
            </span>
            {whyOpen
              ? <ChevronUp className="w-3 h-3" style={{ color: "rgba(255,255,255,0.25)" }} />
              : <ChevronDown className="w-3 h-3" style={{ color: "rgba(255,255,255,0.25)" }} />}
          </button>

          <AnimatePresence>
            {whyOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22,1,0.36,1] }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2.5">
                  {Object.entries(venue.scoreBreakdown).map(([key, val]) => {
                    const color = BREAKDOWN_COLORS[key] ?? "#00b4ff";
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-[10px] w-28 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {BREAKDOWN_LABELS[key] ?? key}
                        </span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(val * 100)}%` }}
                            transition={{ duration: 0.6, ease: [0.22,1,0.36,1], delay: 0.05 }}
                            className="h-full rounded-full"
                            style={{ background: color, boxShadow: `0 0 6px ${color}50` }}
                          />
                        </div>
                        <span className="text-[10px] tabular-nums w-7 text-right" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {Math.round(val * 100)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
