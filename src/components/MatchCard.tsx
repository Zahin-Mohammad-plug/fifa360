"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GlassCard } from "./ui/GlassCard";
import { TeamCrest } from "./ui/TeamCrest";
import { formatCountdown, formatDayTime } from "@/lib/utils";
import type { Match } from "@/lib/types";

const STAGE_LABEL: Record<Match["stage"], string> = {
  group: "Group Stage",
  r16: "Round of 16",
  qf: "Quarter-final",
  sf: "Semi-final",
  final: "Final",
};

function StatusBadge({ match, tick }: { match: Match; tick: number }) {
  void tick;
  if (match.status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-rose-200">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
        Live
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white/70">
        Full time
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-trophy-400/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-trophy-300">
      Kicks off in {formatCountdown(match.kickoffUTC)}
    </span>
  );
}

export function MatchCard({
  match,
  variant = "compact",
  href,
}: {
  match: Match;
  variant?: "hero" | "compact";
  href?: string;
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const hero = variant === "hero";
  const score = match.score;

  const body = (
    <GlassCard
      strong={hero}
      interactive={!!href}
      className={hero ? "overflow-hidden p-5" : "p-4"}
      whileHover={href ? { y: -3 } : undefined}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
          {STAGE_LABEL[match.stage]}
        </span>
        <StatusBadge match={match} tick={tick} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <TeamCrest team={match.homeTeam} size={hero ? "lg" : "md"} />
        <div className="flex flex-col items-center gap-1">
          {score ? (
            <div className="flex items-center gap-2 text-3xl font-black tabular-nums">
              <span>{score.home}</span>
              <span className="text-white/30">:</span>
              <span>{score.away}</span>
            </div>
          ) : (
            <span className="bg-gradient-to-r from-pitch-300 to-electric-300 bg-clip-text text-2xl font-black text-transparent">
              VS
            </span>
          )}
          <span className="text-[11px] text-white/45">{formatDayTime(match.kickoffUTC)}</span>
        </div>
        <TeamCrest team={match.awayTeam} size={hero ? "lg" : "md"} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/50">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {match.venue}, {match.city}
        </span>
        {href && <ArrowRight className="h-4 w-4 text-pitch-300" />}
      </div>
    </GlassCard>
  );

  if (href) {
    return (
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Link href={href}>{body}</Link>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      {body}
    </motion.div>
  );
}
