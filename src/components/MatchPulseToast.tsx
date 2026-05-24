"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MATCHES } from "@/data/matches";
import type { MatchEvent } from "@/types";
import {
  Goal,
  Square,
  RefreshCw,
  Flag,
  Activity,
  Target,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const VISIBLE_MS = 6500;
const CYCLE_MS = 10000;
const INITIAL_DELAY_MS = 1800;

type EventStyle = { color: string; icon: LucideIcon; label: string };

const EVENT_STYLE: Record<MatchEvent["type"], EventStyle> = {
  goal:     { color: "#ccff00", icon: Goal,      label: "GOAL"     },
  yellow:   { color: "#f59e0b", icon: Square,    label: "BOOKING"  },
  red:      { color: "#ff3b30", icon: Square,    label: "RED CARD" },
  sub:      { color: "#60a5fa", icon: RefreshCw, label: "SUB"      },
  var:      { color: "#a78bfa", icon: Target,    label: "VAR"      },
  halftime: { color: "#7a8a75", icon: Flag,      label: "HALF"     },
  fulltime: { color: "#7a8a75", icon: Flag,      label: "FULL"     },
  kickoff:  { color: "#86efac", icon: Activity,  label: "KICKOFF"  },
};

export function MatchPulseToast() {
  const liveMatch = useMemo(
    () => MATCHES.find((m) => m.status === "live"),
    [],
  );
  const events = liveMatch?.events ?? [];

  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!liveMatch || events.length === 0 || dismissed) return;

    let hideTimer: ReturnType<typeof setTimeout>;

    const show = () => {
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), VISIBLE_MS);
    };

    const initial = setTimeout(show, INITIAL_DELAY_MS);

    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % events.length);
        show();
      }, 360);
    }, CYCLE_MS);

    return () => {
      clearTimeout(initial);
      clearTimeout(hideTimer);
      clearInterval(cycle);
    };
  }, [liveMatch, events.length, dismissed]);

  if (!liveMatch || events.length === 0 || dismissed) return null;

  const event = events[idx];
  const style = EVENT_STYLE[event.type] ?? EVENT_STYLE.kickoff;
  const Icon = style.icon;

  const teamColor =
    event.team === liveMatch.homeTeam
      ? liveMatch.homeColor
      : event.team === liveMatch.awayTeam
      ? liveMatch.awayColor
      : style.color;

  return (
    <div
      className="fixed z-[60] pointer-events-none"
      style={{
        top: "calc(var(--nav-height) + 8px)",
        right: 12,
        left: 12,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`pulse-${idx}`}
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative w-full max-w-[330px] rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, transparent 50%), rgba(10,18,7,0.86)",
              backdropFilter: "blur(22px) saturate(1.5)",
              WebkitBackdropFilter: "blur(22px) saturate(1.5)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: `0 14px 40px rgba(0,0,0,0.5), 0 0 0 1px ${style.color}22`,
            }}
            role="status"
            aria-live="polite"
          >
            {/* Team-color stripe on the left edge */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{
                background: `linear-gradient(to bottom, ${teamColor}, ${style.color})`,
              }}
            />

            {/* Auto-dismiss timer bar */}
            <motion.div
              key={`bar-${idx}`}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: VISIBLE_MS / 1000, ease: "linear" }}
              className="absolute top-0 left-0 right-0 h-[2px] origin-left"
              style={{
                background: `linear-gradient(90deg, ${style.color}cc, ${style.color}33)`,
                opacity: 0.75,
              }}
            />

            <div className="flex items-start gap-3 px-3.5 py-3 pl-4">
              {/* Icon + minute */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-xl"
                  style={{
                    background: `${style.color}14`,
                    border: `1px solid ${style.color}38`,
                    color: style.color,
                  }}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.2} />
                </div>
                <span
                  className="text-[9px] font-mono font-bold leading-none"
                  style={{ color: style.color, letterSpacing: "0.06em" }}
                >
                  {event.minute}′
                </span>
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span
                    className="text-[9px] font-mono font-bold uppercase"
                    style={{ color: style.color, letterSpacing: "0.14em" }}
                  >
                    {style.label}
                  </span>
                  <span
                    className="text-[9px] font-mono leading-none"
                    style={{ color: "#7a8a75", letterSpacing: "0.06em" }}
                  >
                    · {liveMatch.homeShort} {liveMatch.scoreHome}–{liveMatch.scoreAway} {liveMatch.awayShort}
                  </span>
                </div>
                <p
                  className="text-[11.5px] leading-snug line-clamp-2"
                  style={{ color: "#d8e8d4" }}
                >
                  {event.summary}
                </p>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => setDismissed(true)}
                className="flex-shrink-0 -mr-0.5 -mt-0.5 w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                style={{ color: "#7a8a75" }}
                aria-label="Dismiss key-moment alerts"
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f5f9f3")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#7a8a75")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
