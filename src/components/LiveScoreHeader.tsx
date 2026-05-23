"use client";

import { Match } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props { match: Match; }

function LiveBadge({ minute }: { minute?: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full"
         style={{
           background: "rgba(255,23,68,0.15)",
           border: "1px solid rgba(255,23,68,0.4)",
           boxShadow: "0 0 12px rgba(255,23,68,0.25)",
         }}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: "#ff1744", animation: "ringPulse 1.4s ease-out infinite" }} />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff1744]" />
      </span>
      <span className="text-[11px] font-black text-[#ff5566] tracking-widest">LIVE</span>
      {minute && (
        <span className="text-[11px] font-black text-[#ff1744]">{minute}&apos;</span>
      )}
    </div>
  );
}

function StatusBadge({ status, minute }: { status: Match["status"]; minute?: string }) {
  if (status === "live") return <LiveBadge minute={minute} />;
  if (status === "halftime") return (
    <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40"
         style={{ boxShadow: "0 0 10px rgba(255,183,77,0.2)" }}>
      <span className="text-[11px] font-black text-amber-400">HALF TIME</span>
    </div>
  );
  if (status === "finished") return (
    <div className="px-3 py-1 rounded-full bg-white/8 border border-white/12">
      <span className="text-[11px] font-semibold text-white/40">FULL TIME</span>
    </div>
  );
  return (
    <div className="px-3 py-1 rounded-full bg-[#00b4ff]/10 border border-[#00b4ff]/30">
      <span className="text-[11px] font-bold text-[#00b4ff]">PRE-MATCH</span>
    </div>
  );
}

export function LiveScoreHeader({ match }: Props) {
  const isLive = match.status === "live" || match.status === "halftime";
  const hasScore = match.status !== "upcoming";

  return (
    <div className={cn("relative overflow-hidden pitch-bg")}
         style={{
           background: isLive
             ? "linear-gradient(180deg, #0e0918 0%, #070d1a 60%, #040812 100%)"
             : "linear-gradient(180deg, #050c1a 0%, #040812 100%)",
         }}>

      {/* Animated gradient overlay for live */}
      {isLive && (
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: "radial-gradient(ellipse at 50% -20%, rgba(255,23,68,0.12) 0%, transparent 60%)",
               animation: "liveGlow 3s ease-in-out infinite",
             }} />
      )}

      {/* Gradient mesh */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: "radial-gradient(ellipse at 20% 100%, rgba(0,102,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(124,77,255,0.06) 0%, transparent 50%)",
           }} />

      <div className="relative z-10 px-5 pt-4 pb-5">
        {/* Tournament row */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-[10px] font-bold text-white/30 tracking-[0.25em] uppercase px-2">
            {match.tournament}  ·  {match.round}
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        {/* Score row */}
        <div className="flex items-center justify-between gap-2">
          {/* Home */}
          <motion.div
            className="flex flex-col items-center gap-2 flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
          >
            <span className="text-[64px] leading-none" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>
              {match.homeFlag}
            </span>
            <span className="text-[13px] font-black text-white/85 tracking-wide text-center leading-tight">
              {match.homeTeam}
            </span>
          </motion.div>

          {/* Score center */}
          <div className="flex flex-col items-center gap-3 px-2">
            <StatusBadge status={match.status} minute={match.minute} />

            {hasScore ? (
              <div className="flex items-center gap-1">
                <motion.span
                  key={`home-${match.scoreHome}`}
                  className="score-pop text-[56px] font-black leading-none tabular-nums"
                  style={{
                    color: "#ffffff",
                    textShadow: isLive
                      ? "0 0 30px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.5)"
                      : "0 2px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  {match.scoreHome}
                </motion.span>
                <span className="text-[28px] font-black text-white/20 mx-1 mt-1">—</span>
                <motion.span
                  key={`away-${match.scoreAway}`}
                  className="score-pop text-[56px] font-black leading-none tabular-nums"
                  style={{
                    color: "#ffffff",
                    textShadow: isLive
                      ? "0 0 30px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.5)"
                      : "0 2px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  {match.scoreAway}
                </motion.span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[28px] font-black text-white/70">
                  {new Date(match.kickoff).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
                <span className="text-[11px] text-white/30">
                  {new Date(match.kickoff).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
              </div>
            )}
          </div>

          {/* Away */}
          <motion.div
            className="flex flex-col items-center gap-2 flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
          >
            <span className="text-[64px] leading-none" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>
              {match.awayFlag}
            </span>
            <span className="text-[13px] font-black text-white/85 tracking-wide text-center leading-tight">
              {match.awayTeam}
            </span>
          </motion.div>
        </div>

        {/* Venue footer */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-[10px] text-white/25">
            📍 {match.venueName} · {match.venueCity}
          </span>
          <div className="h-px flex-1 max-w-[40px] bg-gradient-to-l from-transparent to-white/10" />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-[#040812]/60 pointer-events-none" />
    </div>
  );
}
