"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import { MATCHES, getNextMatch } from "@/data/matches";
import { LiveScoreHeader } from "@/components/LiveScoreHeader";
import { EventTimeline } from "@/components/EventTimeline";
import { NextGameCard } from "@/components/NextGameCard";
import { NotificationSheet } from "@/components/NotificationSheet";
import { Match } from "@/types";
import { Bell, LayoutList, ListIcon, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { motion, AnimatePresence } from "framer-motion";

export default function LivePage() {
  const { selectedMatch, setSelectedMatch } = useAppStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [compact,   setCompact]   = useState(false);
  const [ticker,    setTicker]    = useState(0);

  useLiveMatch();

  const liveMatch   = MATCHES.find((m) => m.status === "live");
  const activeMatch: Match = selectedMatch ?? liveMatch ?? MATCHES[0];
  const nextMatch   = getNextMatch(activeMatch.id) ?? MATCHES.find((m) => m.status === "upcoming");
  const isLive      = activeMatch.status === "live";

  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => setTicker((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [isLive]);

  const handleSelectMatch = useCallback((m: Match) => setSelectedMatch(m), [setSelectedMatch]);

  const lastGoal     = [...activeMatch.events].reverse().find((e) => e.type === "goal");
  const lastKeyEvent = [...activeMatch.events].reverse().find((e) => ["goal","red","var"].includes(e.type));

  return (
    <div className="page-enter min-h-screen">
      {/* Score header — full width with gradient */}
      <div className="w-full">
        <div className="page-container">
          <div className="max-w-2xl mx-auto">
            <LiveScoreHeader match={activeMatch} />
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="flex gap-8 items-start">
          {/* ── LEFT: Timeline ── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Key moment */}
            <AnimatePresence>
              {lastKeyEvent && activeMatch.status !== "upcoming" && (
                <motion.div
                  key="key-moment"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }}
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: isLive
                      ? "linear-gradient(135deg, rgba(255,23,68,0.1) 0%, rgba(12,26,46,0.7) 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                    border: isLive ? "1px solid rgba(255,23,68,0.25)" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none"
                       style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(255,23,68,0.07) 0%, transparent 60%)" }} />
                  <div className="relative z-10">
                    {isLive && (
                      <div className="flex items-center gap-2 mb-2">
                        <Radio className="w-3.5 h-3.5 animate-pulse" style={{ color: "#ff1744" }} />
                        <span className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ color: "#ff5566" }}>
                          Latest Key Moment
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-white/80 leading-relaxed">{lastKeyEvent.summary}</p>
                    {lastGoal && (
                      <div className="mt-2 text-sm font-bold" style={{ color: "#00ff88" }}>
                        ⚽ {lastGoal.player} · {lastGoal.minute}&apos;
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pre-match */}
            {activeMatch.status === "upcoming" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-6 text-center overflow-hidden relative pitch-bg"
                style={{
                  background: "linear-gradient(135deg, rgba(0,180,255,0.1) 0%, rgba(0,102,255,0.05) 100%)",
                  border: "1px solid rgba(0,180,255,0.2)",
                }}
              >
                <div className="text-5xl mb-4 float">🏟</div>
                <div className="text-lg font-black text-white mb-1">
                  {activeMatch.homeTeam} vs {activeMatch.awayTeam}
                </div>
                <div className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Kickoff at{" "}
                  {new Date(activeMatch.kickoff).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  {" · "}
                  {new Date(activeMatch.kickoff).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
                <button
                  onClick={() => setNotifOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                  style={{
                    background: "rgba(0,180,255,0.15)", border: "1px solid rgba(0,180,255,0.3)", color: "#00b4ff",
                  }}
                >
                  <Bell className="w-3.5 h-3.5" /> Get match alerts
                </button>
              </motion.div>
            )}

            {/* Timeline header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full"
                     style={{ background: "linear-gradient(180deg, #00b4ff 0%, #7c4dff 100%)" }} />
                <span className="text-lg font-black text-white">Match Timeline</span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {activeMatch.events.length} events
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNotifOpen(true)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <Bell className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
                </button>
                <button
                  onClick={() => setCompact((v) => !v)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={compact ? {
                    background: "rgba(0,180,255,0.15)", border: "1px solid rgba(0,180,255,0.3)",
                  } : {
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {compact
                    ? <LayoutList className="w-4 h-4" style={{ color: "#00b4ff" }} />
                    : <ListIcon className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />}
                </button>
              </div>
            </div>

            <EventTimeline events={activeMatch.events} compact={compact} />

            {isLive && ticker > 0 && (
              <div className="text-center py-2 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                Live · Updates every 30s
              </div>
            )}
          </div>

          {/* ── RIGHT: Match list + next game ── */}
          <aside className="w-80 xl:w-96 shrink-0 space-y-5 sticky top-[calc(var(--nav-height)+24px)]">
            {nextMatch && (
              <div>
                <div className="section-label mb-3">Coming Up</div>
                <NextGameCard match={nextMatch} onView={() => handleSelectMatch(nextMatch)} />
              </div>
            )}

            <div>
              <div className="section-label mb-3">All Matches</div>
              <div className="space-y-2">
                {MATCHES.map((match) => {
                  const active = activeMatch.id === match.id;
                  return (
                    <motion.button
                      key={match.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectMatch(match)}
                      className={cn("w-full text-left rounded-xl px-3 py-3 transition-all")}
                      style={{
                        background: active ? "rgba(0,180,255,0.08)" : "rgba(255,255,255,0.03)",
                        border: active ? "1px solid rgba(0,180,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{match.homeFlag}</span>
                          <div className="min-w-0">
                            <div className={cn("text-xs font-bold leading-tight truncate max-w-[140px]", active ? "text-white" : "text-white/65")}>
                              {match.homeTeam} <span className="text-white/30">vs</span> {match.awayTeam}
                            </div>
                            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                              {match.round}
                            </div>
                          </div>
                          <span className="text-base">{match.awayFlag}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {match.status !== "upcoming" && (
                            <span className="text-sm font-black text-white">{match.scoreHome}–{match.scoreAway}</span>
                          )}
                          {match.status === "live" && <Radio className="w-3 h-3 animate-pulse" style={{ color: "#ff1744" }} />}
                          {match.status === "finished" && <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>FT</span>}
                          {match.status === "upcoming" && (
                            <span className="text-[10px] font-bold" style={{ color: "#00b4ff" }}>
                              {new Date(match.kickoff).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <NotificationSheet open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
