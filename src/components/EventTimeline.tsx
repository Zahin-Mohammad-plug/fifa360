"use client";

import { MatchEvent } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props { events: MatchEvent[]; compact?: boolean; }

const EVENT_CONFIG: Record<MatchEvent["type"], {
  icon: string; label: string;
  accent: string; bg: string; border: string; glow?: string;
}> = {
  goal:     { icon: "⚽", label: "GOAL",      accent: "#00ff88", bg: "rgba(0,255,136,0.08)",  border: "rgba(0,255,136,0.25)",  glow: "0 0 20px rgba(0,255,136,0.2)" },
  yellow:   { icon: "🟨", label: "YELLOW",    accent: "#ffd740", bg: "rgba(255,215,64,0.07)", border: "rgba(255,215,64,0.2)",  glow: undefined },
  red:      { icon: "🟥", label: "RED CARD",  accent: "#ff1744", bg: "rgba(255,23,68,0.08)",  border: "rgba(255,23,68,0.25)",  glow: "0 0 16px rgba(255,23,68,0.2)" },
  sub:      { icon: "↕",  label: "SUB",       accent: "#00b4ff", bg: "rgba(0,180,255,0.06)",  border: "rgba(0,180,255,0.18)",  glow: undefined },
  var:      { icon: "📺", label: "VAR",       accent: "#7c4dff", bg: "rgba(124,77,255,0.07)", border: "rgba(124,77,255,0.22)", glow: undefined },
  halftime: { icon: "⏸",  label: "HALF TIME", accent: "#ff9100", bg: "rgba(255,145,0,0.07)",  border: "rgba(255,145,0,0.2)",   glow: undefined },
  fulltime: { icon: "🏁", label: "FULL TIME", accent: "#a0b4d0", bg: "rgba(160,180,208,0.05)",border: "rgba(160,180,208,0.15)",glow: undefined },
  kickoff:  { icon: "🏟", label: "KICK OFF",  accent: "#00b4ff", bg: "rgba(0,180,255,0.07)",  border: "rgba(0,180,255,0.22)",  glow: undefined },
};

function EventItem({ event, isLatest, index }: { event: MatchEvent; isLatest: boolean; index: number }) {
  const cfg = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.kickoff;
  const isGoal = event.type === "goal";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.22,1,0.36,1] }}
      className="relative flex items-start gap-3"
    >
      {/* Timeline line */}
      <div className="absolute left-[27px] top-8 bottom-0 w-px"
           style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)" }} />

      {/* Minute badge */}
      <div className="shrink-0 w-[54px] flex flex-col items-center gap-1 pt-1">
        <span className="text-[11px] font-black tabular-nums"
              style={{ color: isLatest ? cfg.accent : "rgba(255,255,255,0.3)" }}>
          {event.minute === "45" && event.type === "halftime" ? "HT" : `${event.minute}'`}
        </span>
      </div>

      {/* Event card */}
      <div
        className={cn(
          "flex-1 rounded-xl border p-3 transition-all",
          isGoal && "rounded-2xl"
        )}
        style={{
          background: isGoal ? "rgba(0,255,136,0.1)" : cfg.bg,
          border: `1px solid ${cfg.border}`,
          boxShadow: isLatest && cfg.glow ? cfg.glow : undefined,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            {/* Icon */}
            <span className={cn("text-lg leading-none", isGoal && "text-[22px]")}
                  style={{ filter: isGoal ? "drop-shadow(0 0 6px rgba(0,255,136,0.6))" : undefined }}>
              {cfg.icon}
            </span>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {/* Type label */}
              <span className="text-[9px] font-black tracking-[0.15em] uppercase"
                    style={{ color: cfg.accent, opacity: 0.8 }}>
                {cfg.label}
              </span>

              {event.player && (
                <div className={cn("font-bold leading-tight mt-0.5", isGoal ? "text-sm" : "text-xs")}
                     style={{ color: isGoal ? "#00ff88" : "rgba(255,255,255,0.85)" }}>
                  {event.player}
                  {event.team && (
                    <span className="font-normal" style={{ color: "rgba(255,255,255,0.3)" }}> · {event.team}</span>
                  )}
                </div>
              )}

              <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>
                {event.summary}
              </p>
            </div>
          </div>

          {isLatest && (
            <div className="shrink-0 mt-0.5">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(255,23,68,0.2)",
                      border: "1px solid rgba(255,23,68,0.4)",
                      color: "#ff5566",
                    }}>
                NEW
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function EventTimeline({ events, compact = false }: Props) {
  if (events.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-5xl mb-4 float">🏟</div>
      <div className="text-sm font-bold text-white/40">No events yet</div>
      <div className="text-xs text-white/20 mt-1">Events will appear here as the match unfolds</div>
    </div>
  );

  const displayEvents = compact ? events.slice(-3) : events;
  const latestIndex   = displayEvents.length - 1;

  return (
    <div className="space-y-2.5">
      {displayEvents.map((event, i) => (
        <EventItem
          key={`${event.minute}-${event.type}-${i}`}
          event={event}
          isLatest={i === latestIndex && !compact}
          index={i}
        />
      ))}
    </div>
  );
}
