"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeading } from "@/components/ui/PageHeading";
import { Spinner } from "@/components/ui/misc";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import {
  FINISHED_MATCH_EVENTS,
  FINISHED_MATCH_NARRATIVE,
  TEAMS,
  getMatch,
  getNextUpcomingMatch,
} from "@/lib/mock-data";
import { cn, formatCountdown, formatDayTime } from "@/lib/utils";
import type { ExplainLevel, MatchEvent } from "@/lib/types";

const EVENT_META: Record<MatchEvent["type"], { emoji: string; tint: string }> = {
  goal: { emoji: "⚽", tint: "bg-pitch-400/20 ring-pitch-400/40" },
  yellow_card: { emoji: "🟨", tint: "bg-yellow-400/15 ring-yellow-400/30" },
  red_card: { emoji: "🟥", tint: "bg-rose-500/20 ring-rose-500/40" },
  substitution: { emoji: "🔄", tint: "bg-electric-400/15 ring-electric-400/30" },
  var: { emoji: "🎬", tint: "bg-fuchsia-400/15 ring-fuchsia-400/30" },
  kickoff: { emoji: "🟢", tint: "bg-white/10 ring-white/20" },
  halftime: { emoji: "⏱️", tint: "bg-white/10 ring-white/20" },
  fulltime: { emoji: "🏁", tint: "bg-white/10 ring-white/20" },
};

const LEVELS: { value: ExplainLevel; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "enthusiast", label: "Enthusiast" },
  { value: "analyst", label: "Analyst" },
];

function PossessionBar({ home, away }: { home: number; away: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] font-semibold tabular-nums text-white/70">
        <span>{home}%</span>
        <span className="uppercase tracking-wide text-white/40">Possession</span>
        <span>{away}%</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="bg-gradient-to-r from-pitch-300 to-pitch-500"
          initial={{ width: "50%" }}
          animate={{ width: `${home}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
        <motion.div
          className="bg-gradient-to-r from-electric-500 to-electric-300"
          initial={{ width: "50%" }}
          animate={{ width: `${away}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

export default function LivePage() {
  const liveMatch = getMatch("m-arg-fra")!;
  const { state, loading, newEventIds } = useLiveMatch(liveMatch.id, 6000);
  const nextMatch = getNextUpcomingMatch();
  const finishedMatch = getMatch("m-usa-mex")!;

  const [level, setLevel] = useState<ExplainLevel>("casual");
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [explainLive, setExplainLive] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const explainRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  const runExplain = useCallback(
    async (ev: MatchEvent | undefined, lvl: ExplainLevel) => {
      if (!state) return;
      setExplaining(true);
      setActiveEventId(ev?.id ?? null);
      try {
        const res = await fetch("/api/live/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: ev ?? null, context: state, level: lvl }),
        });
        const d = await res.json();
        setExplanation(d.explanation);
        setExplainLive(Boolean(d.live));
      } catch {
        /* keep previous */
      } finally {
        setExplaining(false);
      }
    },
    [state],
  );

  useEffect(() => {
    if (state && !didInit.current) {
      didInit.current = true;
      runExplain(undefined, "casual");
    }
  }, [state, runExplain]);

  const onLevel = (lvl: ExplainLevel) => {
    setLevel(lvl);
    const ev = state?.keyEvents.find((e) => e.id === activeEventId);
    runExplain(ev, lvl);
  };

  const onEventTap = (ev: MatchEvent) => {
    runExplain(ev, level);
    explainRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const home = liveMatch.homeTeam;
  const away = liveMatch.awayTeam;

  return (
    <div className="space-y-6 pb-4">
      <PageHeading title="Live" subtitle="Second screen" />

      {/* Live dashboard */}
      {!state ? (
        <GlassCard className="grid h-48 place-items-center"><Spinner /></GlassCard>
      ) : (
        <GlassCard strong className="overflow-hidden p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-rose-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
              </span>
              Live · {state.minute}&apos;
            </span>
            <span className="text-[11px] text-white/45">{liveMatch.venue}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-4xl">{home.flag}</span>
              <span className="text-xs font-semibold">{home.name}</span>
            </div>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${state.score.home}-${state.score.away}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-3 px-3 text-5xl font-black tabular-nums"
              >
                <span>{state.score.home}</span>
                <span className="text-white/25">:</span>
                <span>{state.score.away}</span>
              </motion.div>
            </AnimatePresence>
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-4xl">{away.flag}</span>
              <span className="text-xs font-semibold">{away.name}</span>
            </div>
          </div>

          <div className="mt-5">
            <PossessionBar home={state.possession.home} away={state.possession.away} />
          </div>
        </GlassCard>
      )}

      {/* Tactical explainer */}
      <section ref={explainRef}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-white/50">
            <Activity className="h-4 w-4 text-electric-300" /> Tactical explainer
          </h2>
          {explainLive ? (
            <span className="rounded-full bg-electric-400/15 px-2 py-0.5 text-[10px] text-electric-200">Claude Sonnet</span>
          ) : (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/45">demo</span>
          )}
        </div>

        <div className="mb-3 flex gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => onLevel(l.value)}
              className={cn(
                "pressable flex-1 rounded-xl border px-2 py-2 text-xs font-medium transition-all",
                level === l.value
                  ? "border-electric-300/50 bg-electric-400/20 text-electric-100"
                  : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        <GlassCard className="min-h-[88px] p-4">
          {explaining ? (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Spinner className="h-4 w-4" /> Reading the game…
            </div>
          ) : (
            <motion.p
              key={explanation}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm leading-relaxed text-white/85"
            >
              {explanation || "Tap any moment below for a plain-English breakdown."}
            </motion.p>
          )}
        </GlassCard>
      </section>

      {/* Key moment timeline */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">Key moments</h2>
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {state?.keyEvents.map((ev) => {
              const meta = EVENT_META[ev.type];
              const isNew = newEventIds.has(ev.id);
              const team = TEAMS[ev.team];
              return (
                <motion.button
                  key={ev.id}
                  layout
                  initial={{ opacity: 0, y: -12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  onClick={() => onEventTap(ev)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-all",
                    "glass card-hover",
                    activeEventId === ev.id && "ring-1 ring-electric-300/50",
                    isNew && "ring-2 ring-pitch-300/60",
                  )}
                >
                  <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg ring-1", meta.tint)}>
                    {meta.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tabular-nums text-white/60">{ev.minute}&apos;</span>
                      {team && <span className="text-sm">{team.flag}</span>}
                      {ev.player && <span className="truncate text-sm font-semibold">{ev.player}</span>}
                    </div>
                    <p className="mt-0.5 text-xs leading-snug text-white/70">{ev.description}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-white/30" />
                </motion.button>
              );
            })}
          </AnimatePresence>
          {loading && !state && <Spinner />}
        </div>
      </section>

      {/* Next match countdown */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">Up next</h2>
        <Link href={`/venue?matchId=${nextMatch.id}`}>
          <GlassCard interactive className="flex items-center gap-3 p-4">
            <span className="text-2xl">{nextMatch.homeTeam.flag}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {nextMatch.homeTeam.name} vs {nextMatch.awayTeam.name}
              </p>
              <p className="text-xs text-white/50">{formatDayTime(nextMatch.kickoffUTC)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black tabular-nums text-trophy-300">
                {formatCountdown(nextMatch.kickoffUTC)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-white/40">to kickoff</p>
            </div>
          </GlassCard>
        </Link>
      </section>

      {/* Finished match summary */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">Last result</h2>
        <GlassCard className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 flex-col items-center gap-1">
              <span className="text-3xl">{finishedMatch.homeTeam.flag}</span>
              <span className="text-[11px] font-semibold">{finishedMatch.homeTeam.name}</span>
            </div>
            <div className="flex items-center gap-2 text-3xl font-black tabular-nums">
              <span>{finishedMatch.score?.home}</span>
              <span className="text-white/25">:</span>
              <span>{finishedMatch.score?.away}</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1">
              <span className="text-3xl">{finishedMatch.awayTeam.flag}</span>
              <span className="text-[11px] font-semibold">{finishedMatch.awayTeam.name}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl bg-trophy-400/10 p-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-trophy-300" />
            <p className="text-xs leading-relaxed text-white/80">{FINISHED_MATCH_NARRATIVE}</p>
          </div>

          <div className="space-y-1.5">
            {FINISHED_MATCH_EVENTS.filter((e) => ["goal", "red_card"].includes(e.type)).map((e) => (
              <div key={e.id} className="flex items-center gap-2 text-xs text-white/65">
                <span className="w-7 tabular-nums text-white/40">{e.minute}&apos;</span>
                <span>{EVENT_META[e.type].emoji}</span>
                <span className="font-medium">{e.player}</span>
                <span className="text-white/40">— {TEAMS[e.team]?.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
