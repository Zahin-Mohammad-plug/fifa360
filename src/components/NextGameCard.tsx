"use client";

import { Match } from "@/types";
import { Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface Props { match: Match; onView?: () => void; }

function formatCountdown(kickoffISO: string): string {
  const diffMs = new Date(kickoffISO).getTime() - Date.now();
  if (diffMs <= 0) return "Starting soon";
  const m = Math.floor(diffMs / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

export function NextGameCard({ match, onView }: Props) {
  const kickoffDate = new Date(match.kickoff);
  const timeStr = kickoffDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const dateStr = kickoffDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const countdown = formatCountdown(match.kickoff);

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onView}
      className="w-full text-left rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0c1a30 0%, #060e1c 100%)",
        border: "1px solid rgba(0,180,255,0.15)",
        boxShadow: "0 0 24px rgba(0,180,255,0.06)",
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black tracking-[0.18em] uppercase"
                style={{ color: "rgba(255,255,255,0.3)" }}>
            Up Next
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
               style={{
                 background: "rgba(0,180,255,0.1)",
                 border: "1px solid rgba(0,180,255,0.25)",
               }}>
            <Clock className="w-3 h-3" style={{ color: "#00b4ff" }} />
            <span className="text-[10px] font-black" style={{ color: "#00b4ff" }}>
              In {countdown}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[32px] leading-none">{match.homeFlag}</span>
              <span className="text-sm font-black" style={{ color: "rgba(255,255,255,0.2)" }}>vs</span>
              <span className="text-[32px] leading-none">{match.awayFlag}</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black text-white truncate">
                {match.homeTeam} vs {match.awayTeam}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                {timeStr} · {dateStr}
              </div>
              <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                {match.venueCity}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-0.5"
           style={{
             background: "linear-gradient(90deg, transparent 0%, rgba(0,180,255,0.4) 50%, transparent 100%)",
           }} />
    </motion.button>
  );
}
