"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import { MATCHES, getNextMatch } from "@/data/matches";
import { Match, MatchEvent } from "@/types";
import {
  Radio, Trophy, Calendar, Sparkles, Plus, Play, Pause, RefreshCw,
  AlertTriangle, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SIMULATED_EVENTS: Omit<MatchEvent, "minute">[] = [
  { type: "goal",   team: "Mexico",    player: "H. Lozano",    summary: "GOLAZO! Lozano equalizes with a flying header. It&apos;s level again!" },
  { type: "yellow", team: "Argentina", player: "L. Messi",     summary: "Messi booked for dissent after disputing a throw-in call. Rare card." },
  { type: "red",    team: "Mexico",    player: "J. Corona",    summary: "RED CARD! Corona receives a second yellow for a reckless foul. Mexico down to 10!" },
  { type: "goal",   team: "Argentina", player: "L. Messi",     summary: "MESSI MAGIC! He curls a free-kick into the top corner. Argentina lead!" },
  { type: "sub",    team: "Argentina", player: "Di María → Mac Allister", summary: "Mac Allister on for Di María as Scaloni looks to protect the lead." },
];

export default function LivePage() {
  const { selectedMatch, setSelectedMatch } = useAppStore();

  const [activeMatch, setActiveMatch] = useState<Match>(
    selectedMatch ?? MATCHES.find((m) => m.status === "live") ?? MATCHES[0]
  );
  const [timeline, setTimeline] = useState<MatchEvent[]>([...(activeMatch.events ?? [])].reverse());
  const [simMin,   setSimMin]   = useState<number>(parseInt(activeMatch.minute ?? "74") || 0);
  const [playing,  setPlaying]  = useState(true);
  const simRef = useRef<NodeJS.Timeout | null>(null);

  const isLive = activeMatch.status === "live";
  const nextMatch = getNextMatch(activeMatch.id);

  // Sync with store
  useEffect(() => {
    if (selectedMatch) {
      setActiveMatch(selectedMatch);
      setTimeline([...(selectedMatch.events ?? [])].reverse());
      setSimMin(parseInt(selectedMatch.minute ?? "0") || 0);
    }
  }, [selectedMatch]);

  // Auto-advance minute
  useEffect(() => {
    if (playing && isLive) {
      simRef.current = setInterval(() => {
        setSimMin((p) => {
          if (p >= 90) { setPlaying(false); return 90; }
          return p + 1;
        });
      }, 5000);
    } else if (simRef.current) {
      clearInterval(simRef.current);
    }
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, [playing, isLive]);

  const triggerEvent = useCallback(() => {
    const min = Math.min(simMin + Math.floor(Math.random() * 3) + 1, 90);
    setSimMin(min);
    const random = SIMULATED_EVENTS[Math.floor(Math.random() * SIMULATED_EVENTS.length)];
    const newEvent: MatchEvent = { ...random, minute: String(min) };
    setTimeline((prev) => [newEvent, ...prev]);
  }, [simMin]);

  const reset = useCallback(() => {
    setSimMin(74);
    setTimeline([...(activeMatch.events ?? [])].reverse());
    setPlaying(true);
  }, [activeMatch]);

  const handleMatchSelect = useCallback((m: Match) => {
    setSelectedMatch(m);
    setActiveMatch(m);
    setTimeline([...(m.events ?? [])].reverse());
    setSimMin(parseInt(m.minute ?? "0") || 0);
    setPlaying(m.status === "live");
  }, [setSelectedMatch]);

  const eventStyle = (e: MatchEvent) => {
    if (e.type === "goal")     return { border: "rgba(204,255,0,0.3)",   bg: "rgba(204,255,0,0.06)", dot: "#ccff00",  icon: "⚽" };
    if (e.type === "yellow")   return { border: "rgba(245,158,11,0.3)",  bg: "rgba(245,158,11,0.06)", dot: "#f59e0b", icon: "🟨" };
    if (e.type === "red")      return { border: "rgba(255,59,48,0.3)",   bg: "rgba(255,59,48,0.06)",  dot: "#ff3b30", icon: "🟥" };
    if (e.type === "sub")      return { border: "rgba(59,130,246,0.2)",  bg: "rgba(59,130,246,0.04)", dot: "#3b82f6", icon: "🔄" };
    if (e.type === "halftime") return { border: "rgba(255,255,255,0.1)", bg: "rgba(255,255,255,0.02)", dot: "#83927d", icon: "⏱" };
    if (e.type === "fulltime") return { border: "rgba(255,255,255,0.1)", bg: "rgba(255,255,255,0.02)", dot: "#83927d", icon: "🏁" };
    return { border: "rgba(255,255,255,0.07)", bg: "rgba(255,255,255,0.02)", dot: "#83927d", icon: "▶" };
  };

  return (
    <div className="page-enter pb-4">
      <div className="page-container pt-4 space-y-4">

        {/* ── Live Score Header ── */}
        <div
          className="relative rounded-3xl p-6 overflow-hidden"
          style={{
            background: "rgba(18,28,13,0.7)",
            border: isLive ? "1px solid rgba(255,59,48,0.2)" : "1px solid rgba(204,255,0,0.1)",
            boxShadow: isLive ? "0 0 40px rgba(255,59,48,0.06)" : "none",
          }}
        >
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: isLive ? "rgba(255,59,48,0.07)" : "rgba(204,255,0,0.06)" }} />

          {/* League + status */}
          <div className="relative z-10 flex items-center justify-between mb-5">
            <span
              className="flex items-center gap-1.5 text-[10px] font-mono font-medium px-2.5 py-1 rounded-md uppercase"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", color: "#b8c5b4" }}
            >
              <Trophy className="w-3.5 h-3.5" style={{ color: "#ccff00" }} />
              {activeMatch.league} · {activeMatch.tournament.replace("FIFA ", "")}
            </span>

            {isLive ? (
              <span
                className="neon-pulse-live flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-mono font-bold uppercase"
                style={{ background: "rgba(255,59,48,0.18)", border: "1px solid rgba(255,59,48,0.3)", color: "#ff3b30" }}
              >
                <Radio className="w-3.5 h-3.5 animate-live-dot" /> Live Feed
              </span>
            ) : activeMatch.status === "finished" ? (
              <span className="text-[9px] font-mono px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#83927d" }}>
                Full Time
              </span>
            ) : (
              <span className="text-[9px] font-mono px-2 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
                Upcoming
              </span>
            )}
          </div>

          {/* Scoreboard */}
          <div className="relative z-10 flex items-center justify-between text-center">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-mono font-bold text-2xl border-2"
                style={{ background: activeMatch.homeColor + "33", borderColor: activeMatch.homeColor + "55", color: activeMatch.homeColor }}
              >
                {activeMatch.homeFlag}
              </div>
              <h3 className="text-sm font-bold mt-2.5 tracking-tight" style={{ color: "#f9fbf8" }}>{activeMatch.homeTeam}</h3>
              <span className="text-[10px] font-mono" style={{ color: "#83927d" }}>Home</span>
            </div>

            {/* Score */}
            <div className="px-3 flex flex-col items-center">
              {activeMatch.status !== "upcoming" ? (
                <>
                  <div className="flex items-center gap-3">
                    <motion.span
                      key={activeMatch.scoreHome}
                      animate={{ scale: [1.25, 1] }}
                      className="text-5xl font-mono font-extrabold"
                      style={{ color: "#f9fbf8", textShadow: isLive ? "0 0 20px rgba(204,255,0,0.3)" : "none" }}
                    >
                      {activeMatch.scoreHome}
                    </motion.span>
                    <span className="text-2xl font-mono font-bold" style={{ color: "#ccff00" }}>:</span>
                    <motion.span
                      key={activeMatch.scoreAway}
                      animate={{ scale: [1.25, 1] }}
                      className="text-5xl font-mono font-extrabold"
                      style={{ color: "#f9fbf8", textShadow: isLive ? "0 0 20px rgba(204,255,0,0.3)" : "none" }}
                    >
                      {activeMatch.scoreAway}
                    </motion.span>
                  </div>
                  {isLive && (
                    <div
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold"
                      style={{ background: "rgba(7,12,4,0.9)", border: "1px solid rgba(204,255,0,0.25)", color: "#ccff00", boxShadow: "0 0 8px rgba(204,255,0,0.1)" }}
                    >
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ background: "#ccff00" }} />
                      MINUTE {simMin}&apos;
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <div
                    className="px-4 py-2 rounded-xl text-sm font-mono font-bold"
                    style={{ background: "rgba(7,12,4,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: "#f9fbf8" }}
                  >
                    {activeMatch.time}
                  </div>
                  <span className="block mt-2 text-[10px] font-mono" style={{ color: "#f59e0b" }}>Pre-game Hubs Open</span>
                </div>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-mono font-bold text-2xl border-2"
                style={{ background: activeMatch.awayColor + "33", borderColor: activeMatch.awayColor + "55", color: activeMatch.awayColor }}
              >
                {activeMatch.awayFlag}
              </div>
              <h3 className="text-sm font-bold mt-2.5 tracking-tight" style={{ color: "#f9fbf8" }}>{activeMatch.awayTeam}</h3>
              <span className="text-[10px] font-mono" style={{ color: "#83927d" }}>Away</span>
            </div>
          </div>

          <div className="relative z-10 mt-5 pt-4 text-center text-xs font-mono" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "#83927d" }}>
            🏟️ <span style={{ color: "#f9fbf8", fontWeight: "bold" }}>{activeMatch.venueName}</span>
            <span className="ml-2">{activeMatch.venueCity}</span>
          </div>
        </div>

        {/* ── Simulator ── */}
        {isLive && (
          <div
            className="rounded-2xl p-4"
            style={{ background: "rgba(13,21,11,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="label-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3" style={{ color: "#ccff00" }} />
                Interactive Simulator
              </span>
              <span className="text-[10px] font-mono" style={{ color: "#83927d" }}>5s = 1 match minute</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="flex items-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-bold font-mono transition-colors cursor-pointer"
                style={playing
                  ? { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#b8c5b4" }
                }
              >
                {playing ? <><Pause className="w-3.5 h-3.5 fill-current"/> Pause</> : <><Play className="w-3.5 h-3.5 fill-current"/> Resume</>}
              </button>
              <button
                onClick={triggerEvent}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-extrabold transition-colors cursor-pointer"
                style={{ background: "#ccff00", color: "#070c04", boxShadow: "0 2px 8px rgba(204,255,0,0.2)" }}
              >
                <Plus className="w-4 h-4" /> Trigger Event
              </button>
              <button
                onClick={reset}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#83927d" }}
                title="Reset"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Timeline ── */}
        <div>
          <span className="label-mono flex items-center gap-1.5 mb-3">
            📋 Match Timeline ({timeline.length})
          </span>

          {!isLive && activeMatch.status === "upcoming" ? (
            <div
              className="rounded-2xl py-8 px-6 text-center"
              style={{ background: "rgba(13,21,11,0.5)", border: "1px dashed rgba(255,255,255,0.1)" }}
            >
              <Calendar className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(204,255,0,0.35)" }} />
              <h4 className="text-xs font-bold uppercase" style={{ color: "#f9fbf8" }}>Timeline Not Active</h4>
              <p className="text-[11px] mt-1 max-w-xs mx-auto leading-relaxed" style={{ color: "#83927d" }}>
                This fixture kicks off at {activeMatch.time}. Check back for real-time updates.
              </p>
            </div>
          ) : (
            <div
              className="relative border-l ml-4 pl-6 space-y-3 pt-1"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              {timeline.map((evt, idx) => {
                const s = eventStyle(evt);
                return (
                  <motion.div
                    key={`${evt.minute}-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="relative group"
                  >
                    {/* Minute node */}
                    <div
                      className="absolute -left-[34px] top-0 w-7 h-7 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border-2"
                      style={{ background: "#070c04", borderColor: s.dot, color: s.dot }}
                    >
                      {evt.minute}
                    </div>

                    {/* Event card */}
                    <div
                      className="rounded-2xl p-3.5 transition-all group-hover:translate-x-0.5"
                      style={{ background: s.bg, border: `1px solid ${s.border}` }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span>{s.icon}</span>
                        {evt.type === "yellow" && <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />}
                        {evt.type === "red"    && <AlertCircle   className="w-3.5 h-3.5" style={{ color: "#ff3b30" }} />}
                        <h4 className="text-xs font-bold" style={{ color: "#f9fbf8" }}>
                          {evt.player ? `${evt.player}` : evt.type.charAt(0).toUpperCase() + evt.type.slice(1)}
                          {evt.team && <span className="ml-1 font-normal text-[10px]" style={{ color: "#83927d" }}>({evt.team})</span>}
                        </h4>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "#b8c5b4" }}>{evt.summary}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Next fixtures ── */}
        <div className="pt-2">
          <span className="label-mono flex items-center gap-1.5 mb-3">🗓 Coming Up</span>
          <div className="space-y-2">
            {MATCHES.filter((m) => m.id !== activeMatch.id).map((match) => (
              <motion.button
                key={match.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleMatchSelect(match)}
                className="w-full text-left rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer"
                style={{ background: "rgba(13,21,11,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div>
                  <span className="label-mono">{match.league}</span>
                  <p className="text-xs font-bold mt-0.5" style={{ color: "#f9fbf8" }}>
                    {match.homeFlag} {match.homeTeam} vs {match.awayTeam} {match.awayFlag}
                  </p>
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: "#83927d" }}>
                    {match.venueCity} · {match.time}
                    {match.status === "finished" && " · FT"}
                  </p>
                </div>
                <div
                  className="text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0 transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "#83927d" }}
                >
                  {match.status === "finished" ? `${match.scoreHome}–${match.scoreAway}` : "Match Hub 🏟️"}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
