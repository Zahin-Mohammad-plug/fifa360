"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { MATCHES } from "@/data/matches";
import { getVenuesForMatch } from "@/data/venues";
import { Venue, Match } from "@/types";
import {
  Search, Compass, ShieldCheck, MapPin, Users, Flame,
  ExternalLink, Star, AlertTriangle, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Filter = "All" | "Verified Only" | "Near Me";

export default function DiscoverPage() {
  const router = useRouter();
  const { selectedMatch, setSelectedMatch, setSelectedVenue } = useAppStore();

  const [query,      setQuery]      = useState("");
  const [filter,     setFilter]     = useState<Filter>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [fabGlow,    setFabGlow]    = useState(true);

  const activeMatch = selectedMatch ?? MATCHES.find((m) => m.status === "live") ?? MATCHES[0];

  const venues = getVenuesForMatch(activeMatch.id);

  const filtered = venues.filter((v) => {
    const q = query.toLowerCase();
    const matchSearch =
      v.name.toLowerCase().includes(q) ||
      v.address.toLowerCase().includes(q) ||
      v.affiliation.toLowerCase().includes(q);
    if (filter === "Verified Only") return matchSearch && v.trustLevel !== "community";
    if (filter === "Near Me") return matchSearch && (v.distanceKm ?? 99) <= 1.5;
    return matchSearch;
  });

  // Skeleton on match change
  useEffect(() => {
    setLoading(true);
    setExpandedId(null);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [activeMatch.id]);

  const handleMatchSelect = useCallback((m: Match) => {
    setSelectedMatch(m);
    setSelectedVenue(null);
  }, [setSelectedMatch, setSelectedVenue]);

  const handleVenueRoute = useCallback((v: Venue, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVenue(v);
    router.push("/route");
  }, [setSelectedVenue, router]);

  const densityColor = (d: string) => {
    if (d === "Packed")  return "#ff3b30";
    if (d === "High")    return "#f59e0b";
    if (d === "Medium")  return "#ccff00";
    return "#83927d";
  };

  return (
    <div className="page-enter pb-4">
      <div className="page-container pt-4 space-y-5">

        {/* ── Match Picker ── */}
        <div>
          <div className="label-mono flex items-center gap-1.5 mb-3">
            <Compass className="w-3 h-3" style={{ color: "#ccff00" }} />
            Select Active Fixture
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {MATCHES.map((match, i) => {
              const isSelected = activeMatch.id === match.id;
              return (
                <motion.button
                  key={match.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleMatchSelect(match)}
                  className="relative flex-shrink-0 w-60 p-4 rounded-2xl text-left cursor-pointer select-none"
                  style={{
                    background: isSelected
                      ? "rgba(29,45,22,0.85)"
                      : "rgba(13,21,11,0.6)",
                    border: isSelected
                      ? "1px solid rgba(204,255,0,0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: isSelected
                      ? "0 8px 24px rgba(204,255,0,0.08)"
                      : "none",
                  }}
                >
                  {/* Top neon line on selected */}
                  {isSelected && (
                    <div
                      className="absolute top-0 left-6 right-6 h-px"
                      style={{ background: "linear-gradient(90deg,transparent,#ccff00,transparent)", boxShadow: "0 0 8px #ccff00" }}
                    />
                  )}

                  {/* League + status */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded uppercase"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#83927d", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {match.league}
                    </span>
                    {match.status === "live" ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,59,48,0.12)", border: "1px solid rgba(255,59,48,0.25)" }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-live-dot" style={{ background: "#ff3b30" }} />
                        <span className="text-[8px] font-mono font-bold uppercase" style={{ color: "#ff3b30" }}>
                          Live {match.minute}&apos;
                        </span>
                      </span>
                    ) : match.status === "finished" ? (
                      <span className="text-[8px] font-mono" style={{ color: "#83927d" }}>FT</span>
                    ) : (
                      <span className="text-[8px] font-mono" style={{ color: "#83927d" }}>{match.time}</span>
                    )}
                  </div>

                  {/* Teams */}
                  <div className="space-y-1.5">
                    {[
                      { team: match.homeTeam, flag: match.homeFlag, color: match.homeColor, score: match.scoreHome, side: "H" },
                      { team: match.awayTeam, flag: match.awayFlag, color: match.awayColor, score: match.scoreAway, side: "A" },
                    ].map(({ team, flag, color, score, side }) => (
                      <div key={side} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{flag}</span>
                          <span className="text-[13px] font-bold" style={{ color: isSelected ? "#f9fbf8" : "#a0a89a" }}>{team}</span>
                        </div>
                        {match.status !== "upcoming" && (
                          <span className="text-sm font-mono font-bold" style={{ color: "#f9fbf8", minWidth: "1.5ch", textAlign: "right" }}>
                            {score}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-2.5 pt-2 border-t flex items-center justify-between text-[9px] font-mono" style={{ borderColor: "rgba(255,255,255,0.06)", color: "#83927d" }}>
                    <span>{match.venueCity}</span>
                    <span style={{ color: isSelected ? "#ccff00" : "#83927d" }}>{match.tournament.replace("FIFA ", "")}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Search & Filters ── */}
        <div
          id="venue_list_anchor"
          className="rounded-2xl p-4 space-y-3"
          style={{ background: "rgba(13,21,11,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#83927d" }} />
            <input
              type="text"
              placeholder="Search venues, areas, affiliations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full py-2.5 pl-9 pr-4 rounded-xl text-xs outline-none transition-all"
              style={{
                background: "rgba(7,12,4,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#f9fbf8",
                fontFamily: "var(--font-sans)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(204,255,0,0.4)")}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {(["All", "Verified Only", "Near Me"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer select-none"
                style={filter === f ? {
                  background: "#ccff00", color: "#070c04",
                } : {
                  background: "rgba(24,38,18,0.7)", color: "#83927d",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Venue listing header ── */}
        <div className="flex items-center justify-between">
          <span className="label-mono">Ranked Fan Venues ({filtered.length})</span>
          <span className="text-[10px] font-mono" style={{ color: "#83927d" }}>By Atmosphere</span>
        </div>

        {/* ── Skeleton ── */}
        {loading ? (
          <div className="space-y-3">
            {[0,1].map((i) => (
              <div key={i} className="rounded-2xl p-4 space-y-3 h-32 animate-shimmer" style={{ border: "1px solid rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* ── Empty ── */
          <div
            className="rounded-2xl py-10 px-6 text-center flex flex-col items-center"
            style={{ background: "rgba(13,21,11,0.5)", border: "1px dashed rgba(255,255,255,0.1)" }}
          >
            <AlertTriangle className="w-8 h-8 mb-3" style={{ color: "#f59e0b" }} />
            <h4 className="text-sm font-bold" style={{ color: "#f9fbf8" }}>No venues found</h4>
            <p className="text-xs mt-1 max-w-xs leading-relaxed" style={{ color: "#83927d" }}>
              No supporter lounges match &ldquo;{query}&rdquo; for this fixture.
            </p>
            <button
              onClick={() => { setQuery(""); setFilter("All"); }}
              className="mt-4 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "#ccff00", background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.25)" }}
            >
              Reset Search
            </button>
          </div>
        ) : (
          /* ── Venue cards ── */
          <div className="space-y-3">
            {filtered.map((venue, idx) => {
              const isOpen = expandedId === venue.id;
              const capPct = typeof venue.capacity === "number"
                ? Math.min(100, Math.round((venue.etaMinutes ?? 50) * 1.2))
                : null;

              return (
                <motion.div
                  key={venue.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.22,1,0.36,1] }}
                  onClick={() => setExpandedId(isOpen ? null : venue.id)}
                  className="rounded-2xl p-4 cursor-pointer overflow-hidden relative"
                  style={{
                    background: isOpen ? "rgba(29,45,22,0.8)" : "rgba(13,21,11,0.55)",
                    border: isOpen ? "1px solid rgba(204,255,0,0.28)" : "1px solid rgba(255,255,255,0.05)",
                    boxShadow: isOpen ? "0 12px 32px rgba(0,0,0,0.45)" : "none",
                    transition: "background 0.25s, border-color 0.25s",
                  }}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="flex-shrink-0 text-[10px] font-mono font-bold flex items-center justify-center rounded"
                          style={{ width: 20, height: 20, background: "rgba(204,255,0,0.12)", border: "1px solid rgba(204,255,0,0.25)", color: "#ccff00" }}
                        >
                          #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold truncate" style={{ color: "#f9fbf8" }}>
                          {venue.name}
                        </h4>
                        {venue.trustLevel !== "community" && (
                          <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: "#ccff00" }} aria-label="Verified" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono" style={{ color: "#83927d" }}>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" style={{ color: "#ccff00" }} />
                          {venue.distanceKm} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" style={{ color: "#ccff00" }} />
                          {venue.density}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "#a0a89a" }}
                        >
                          {venue.affiliation}
                        </span>
                      </div>
                    </div>

                    {/* Atmosphere badge */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-mono font-bold"
                        style={{ background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.3)", color: "#ccff00" }}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        {venue.confidence}%
                      </div>
                      <span className="text-[8px] font-mono mt-0.5" style={{ color: "#83927d" }}>Atmosphere</span>
                    </div>
                  </div>

                  {/* Stars + density */}
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-mono" style={{ color: "#83927d" }}>
                    <div className="flex" style={{ color: "#f59e0b" }}>
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span>{venue.rating}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                      style={{ background: `${densityColor(venue.density)}18`, color: densityColor(venue.density) }}
                    >
                      {venue.density} Density
                    </span>
                  </div>

                  {/* Collapsed: short preview */}
                  {!isOpen && (
                    <p className="text-xs mt-2.5 truncate leading-relaxed" style={{ color: "#83927d" }}>
                      💡 {venue.conciergeInsight}
                    </p>
                  )}

                  {/* Expand arrow */}
                  <ChevronRight
                    className="absolute top-4 right-4 w-4 h-4 transition-transform"
                    style={{ color: "rgba(255,255,255,0.2)", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                  />

                  {/* ── Expanded concierge panel ── */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          {/* Concierge box */}
                          <div
                            className="rounded-xl p-3 flex gap-2.5"
                            style={{ background: "rgba(7,12,4,0.8)", border: "1px solid rgba(204,255,0,0.15)" }}
                          >
                            <div
                              className="flex-shrink-0 flex items-center justify-center rounded-lg text-[10px] font-mono font-bold mt-0.5"
                              style={{ width: 28, height: 28, background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.3)", color: "#ccff00" }}
                            >
                              MC
                            </div>
                            <div>
                              <span className="block text-[10px] font-mono font-bold uppercase mb-1" style={{ color: "#ccff00", letterSpacing: "0.15em" }}>
                                Concierge Recommendation
                              </span>
                              <p className="text-xs leading-relaxed" style={{ color: "#e8f0e5" }}>
                                {venue.conciergeInsight}
                              </p>
                            </div>
                          </div>

                          {/* Insights list */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono font-bold uppercase" style={{ color: "#f59e0b", letterSpacing: "0.15em" }}>
                              Atmosphere & Amenities
                            </span>
                            <ul className="space-y-1.5">
                              {venue.insights.map((insight, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "#b8c5b4" }}>
                                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#ccff00" }} />
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Density bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-mono uppercase" style={{ color: "#83927d" }}>
                              <span>Crowd Density Timeline</span>
                              <span style={{ color: densityColor(venue.density) }}>{venue.density} Peak</span>
                            </div>
                            <div className="flex gap-1 h-3">
                              {["Pre", "K-30", "K-15", "KO", "+45"].map((t, i) => {
                                const peak = i === 3;
                                const high = i >= 2;
                                return (
                                  <div
                                    key={t}
                                    className="flex-1 rounded-sm"
                                    style={{
                                      background: peak
                                        ? `linear-gradient(to top, ${densityColor(venue.density)}bb, ${densityColor(venue.density)})`
                                        : high
                                        ? "rgba(204,255,0,0.25)"
                                        : "rgba(255,255,255,0.08)",
                                      boxShadow: peak ? `0 0 8px ${densityColor(venue.density)}55` : "none",
                                    }}
                                    title={t}
                                  />
                                );
                              })}
                            </div>
                            <div className="flex justify-between text-[8px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                              {["Pre", "K-30", "K-15", "K·O", "+45"].map((t) => (
                                <span key={t}>{t}</span>
                              ))}
                            </div>
                          </div>

                          {/* CTAs */}
                          <div className="flex gap-2">
                            <button
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#b8c5b4" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Users className="w-4 h-4" style={{ color: "#ccff00" }} /> Share Plan
                            </button>
                            <button
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                              style={{ background: "#ccff00", color: "#070c04" }}
                              onClick={(e) => handleVenueRoute(venue, e)}
                            >
                              <ExternalLink className="w-4 h-4" /> Transit Route
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <div className="fixed bottom-[calc(var(--bottom-nav-height)+12px)] right-4 z-40">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            setFabGlow(false);
            document.getElementById("venue_list_anchor")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold shadow-2xl cursor-pointer select-none"
          style={{
            background: fabGlow ? "#ccff00" : "rgba(24,38,18,0.9)",
            color: fabGlow ? "#070c04" : "#83927d",
            border: fabGlow ? "none" : "1px solid rgba(255,255,255,0.1)",
            boxShadow: fabGlow ? "0 0 20px rgba(204,255,0,0.45)" : "none",
          }}
        >
          <Compass className="w-4 h-4" />
          Check Venues
        </motion.button>
      </div>
    </div>
  );
}
