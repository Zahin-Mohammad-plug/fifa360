"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { MATCHES } from "@/data/matches";
import { VENUES } from "@/data/venues";
import { rankVenues } from "@/lib/ranking";
import { MatchHeroChip } from "@/components/MatchHeroChip";
import { VenueRankingCard } from "@/components/VenueRankingCard";
import { VenueDetailDrawer } from "@/components/VenueDetailDrawer";
import { ConciergeCallSimulator } from "@/components/ConciergeCallSimulator";
import { Venue, Match } from "@/types";
import { Bell, Phone, Zap, CheckCircle, MapPin } from "lucide-react";
import { NotificationSheet } from "@/components/NotificationSheet";
import { motion, AnimatePresence } from "framer-motion";

type SortMode = "score" | "eta" | "capacity" | "vibe";

const SORT_OPTIONS: { id: SortMode; label: string; emoji: string }[] = [
  { id: "score",    label: "Best Match", emoji: "⭐" },
  { id: "eta",      label: "Closest",    emoji: "🚶" },
  { id: "capacity", label: "Most Space", emoji: "🏠" },
  { id: "vibe",     label: "Best Vibe",  emoji: "🎉" },
];

export default function DiscoverPage() {
  const router = useRouter();
  const { selectedMatch, setSelectedMatch, setSelectedVenue, preferences, conciergeCallsDone, setConciergeRunning, setConciergeDone } = useAppStore();

  const [selectedVenueLocal, setSelectedVenueLocal] = useState<Venue | null>(null);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [showConcierge, setShowConcierge] = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [sortMode,      setSortMode]      = useState<SortMode>("score");

  const activeMatch = selectedMatch ?? MATCHES.find((m) => m.status === "live") ?? MATCHES[0];
  const isLive = activeMatch.status === "live";

  const rankedVenues = useMemo(() => {
    const venues = rankVenues(VENUES, preferences, activeMatch);
    if (sortMode === "eta")      return [...venues].sort((a, b) => (a.etaMinutes ?? 99) - (b.etaMinutes ?? 99));
    if (sortMode === "capacity") {
      const order = ["low","medium","high","full-soon"];
      return [...venues].sort((a, b) => order.indexOf(a.concierge?.capacityStatus ?? "medium") - order.indexOf(b.concierge?.capacityStatus ?? "medium"));
    }
    if (sortMode === "vibe") return [...venues].sort((b, a) => (a.vibeTags.length + (a.concierge ? 1 : 0)) - (b.vibeTags.length + (b.concierge ? 1 : 0)));
    return venues;
  }, [preferences, activeMatch, sortMode]);

  const handleSelectVenue  = useCallback((v: Venue) => { setSelectedVenueLocal(v); setSelectedVenue(v); setDrawerOpen(true); }, [setSelectedVenue]);
  const handlePlanRoute    = useCallback((v: Venue) => { setSelectedVenue(v); router.push("/route"); }, [setSelectedVenue, router]);
  const handleSelectMatch  = useCallback((m: Match) => { setSelectedMatch(m); setConciergeDone(false); setConciergeRunning(false); setShowConcierge(false); }, [setSelectedMatch, setConciergeDone, setConciergeRunning]);

  return (
    <div className="page-enter min-h-screen">
      {/* ── Page header ── */}
      <div className="border-b"
           style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(4,8,18,0.6)" }}>
        <div className="page-container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Discover</h1>
              <p className="text-sm mt-1 flex items-center gap-1.5"
                 style={{ color: "rgba(255,255,255,0.4)" }}>
                <MapPin className="w-3.5 h-3.5" />
                Times Square, New York · {rankedVenues.length} venues ranked
                {isLive && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1"
                        style={{ color: "#ff5566", background: "rgba(255,23,68,0.12)", border: "1px solid rgba(255,23,68,0.3)" }}>
                    LIVE
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setNotifOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Match Alerts</span>
            </button>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {/* ── Match selector ── */}
        <section className="mb-8">
          <div className="section-label mb-4">Select Match</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MATCHES.filter((m) => m.status !== "finished").slice(0, 3).map((match, i) => (
              <motion.button
                key={match.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: [0.22,1,0.36,1] }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectMatch(match)}
                className="w-full rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  outline: activeMatch.id === match.id
                    ? "2px solid rgba(0,180,255,0.5)"
                    : "2px solid transparent",
                  outlineOffset: "2px",
                }}
              >
                <MatchHeroChip match={match} />
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── Two-column layout ── */}
        <div className="flex gap-8 items-start">
          {/* LEFT: Controls */}
          <aside className="w-64 shrink-0 hidden lg:block space-y-5 sticky top-[calc(var(--nav-height)+24px)]">
            {/* Sort */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] mb-3"
                   style={{ color: "rgba(255,255,255,0.3)" }}>
                Sort By
              </div>
              <div className="space-y-1.5">
                {SORT_OPTIONS.map(({ id, label, emoji }) => (
                  <button
                    key={id}
                    onClick={() => setSortMode(id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                    style={sortMode === id ? {
                      background: "rgba(0,180,255,0.15)",
                      border: "1px solid rgba(0,180,255,0.35)",
                      color: "#00b4ff",
                    } : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    <span className="text-base">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Concierge */}
            <AnimatePresence mode="wait">
              {!showConcierge && !conciergeCallsDone && (
                <motion.button
                  key="cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowConcierge(true)}
                  className="w-full flex flex-col gap-3 rounded-2xl px-4 py-4 relative overflow-hidden text-left"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,77,255,0.15) 0%, rgba(12,26,46,0.8) 100%)",
                    border: "1px solid rgba(124,77,255,0.3)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                         style={{ background: "rgba(124,77,255,0.2)", border: "1px solid rgba(124,77,255,0.4)" }}>
                      <Phone className="w-4 h-4" style={{ color: "#7c4dff" }} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">AI Venue Check</div>
                      <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Verify capacity live</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit"
                       style={{ background: "rgba(124,77,255,0.2)", border: "1px solid rgba(124,77,255,0.4)" }}>
                    <Zap className="w-3 h-3" style={{ color: "#7c4dff" }} />
                    <span className="text-[10px] font-black" style={{ color: "#a57aff" }}>Start Calls</span>
                  </div>
                </motion.button>
              )}
              {conciergeCallsDone && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 rounded-xl px-3 py-3"
                  style={{ background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.2)" }}
                >
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#00ff88" }} />
                  <span className="text-xs font-bold" style={{ color: "rgba(0,255,136,0.9)" }}>
                    Venues verified
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {showConcierge && (
              <ConciergeCallSimulator venues={VENUES} onComplete={() => setShowConcierge(false)} />
            )}
          </aside>

          {/* RIGHT: Venue cards */}
          <div className="flex-1 min-w-0">
            {/* Mobile sort chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mb-5 lg:hidden">
              {SORT_OPTIONS.map(({ id, label, emoji }) => (
                <button
                  key={id}
                  onClick={() => setSortMode(id)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={sortMode === id ? {
                    background: "rgba(0,180,255,0.18)", border: "1px solid rgba(0,180,255,0.4)", color: "#00b4ff",
                  } : {
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)",
                  }}
                >
                  <span>{emoji}</span>{label}
                </button>
              ))}
            </div>

            {/* Mobile concierge CTA */}
            <div className="lg:hidden mb-5">
              <AnimatePresence mode="wait">
                {!showConcierge && !conciergeCallsDone && (
                  <motion.button
                    key="cta-m"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowConcierge(true)}
                    className="w-full flex items-center justify-between rounded-2xl px-4 py-4 relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, rgba(124,77,255,0.15) 0%, rgba(12,26,46,0.8) 100%)", border: "1px solid rgba(124,77,255,0.3)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                           style={{ background: "rgba(124,77,255,0.2)", border: "1px solid rgba(124,77,255,0.4)" }}>
                        <Phone className="w-4 h-4" style={{ color: "#7c4dff" }} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-black text-white">Check venues by phone</div>
                        <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Verify RSVP, crowd & capacity</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                         style={{ background: "rgba(124,77,255,0.2)", border: "1px solid rgba(124,77,255,0.4)" }}>
                      <Zap className="w-3 h-3" style={{ color: "#7c4dff" }} /><span className="text-[11px] font-black" style={{ color: "#a57aff" }}>AI</span>
                    </div>
                  </motion.button>
                )}
                {conciergeCallsDone && (
                  <motion.div key="done-m" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2 rounded-xl px-4 py-3"
                    style={{ background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.2)" }}>
                    <CheckCircle className="w-4 h-4" style={{ color: "#00ff88" }} />
                    <span className="text-xs font-bold" style={{ color: "rgba(0,255,136,0.9)" }}>Venues verified · Rankings updated</span>
                  </motion.div>
                )}
              </AnimatePresence>
              {showConcierge && <div className="mt-3"><ConciergeCallSimulator venues={VENUES} onComplete={() => setShowConcierge(false)} /></div>}
            </div>

            {/* Venue grid */}
            {!showConcierge && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {rankedVenues.map((venue, i) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + i * 0.06, duration: 0.32, ease: [0.22,1,0.36,1] }}
                  >
                    <VenueRankingCard
                      venue={venue}
                      rank={i + 1}
                      isTop={i === 0}
                      onSelect={handleSelectVenue}
                      conciergeVerified={conciergeCallsDone && !!venue.concierge}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <VenueDetailDrawer venue={selectedVenueLocal} open={drawerOpen} onClose={() => setDrawerOpen(false)} onPlanRoute={handlePlanRoute} />
      <NotificationSheet open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
