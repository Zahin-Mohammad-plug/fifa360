"use client";

import { Match } from "@/types";
import { cn } from "@/lib/utils";

interface Props { match: Match; compact?: boolean; }

function StatusPill({ status, minute }: { status: Match["status"]; minute?: string }) {
  if (status === "live") return (
    <span className="flex items-center gap-1.5 text-[10px] font-black tracking-wider"
          style={{
            padding: "3px 10px",
            borderRadius: 99,
            background: "rgba(255,23,68,0.18)",
            border: "1px solid rgba(255,23,68,0.45)",
            color: "#ff5566",
            boxShadow: "0 0 10px rgba(255,23,68,0.25)",
          }}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 rounded-full bg-[#ff1744]"
              style={{ animation: "ringPulse 1.4s ease-out infinite" }} />
        <span className="relative rounded-full h-1.5 w-1.5 bg-[#ff1744]" />
      </span>
      LIVE {minute ? `${minute}'` : ""}
    </span>
  );
  if (status === "halftime") return (
    <span className="text-[10px] font-black text-amber-400 tracking-wider"
          style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(255,183,77,0.15)", border: "1px solid rgba(255,183,77,0.35)" }}>
      HT
    </span>
  );
  if (status === "finished") return (
    <span className="text-[10px] font-semibold text-white/35"
          style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
      FT
    </span>
  );
  return (
    <span className="text-[10px] font-bold text-[#00b4ff] tracking-wider"
          style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(0,180,255,0.12)", border: "1px solid rgba(0,180,255,0.3)" }}>
      UPCOMING
    </span>
  );
}

export function MatchHeroChip({ match, compact = false }: Props) {
  const isLive = match.status === "live";
  const kickoffDate = new Date(match.kickoff);
  const timeStr = kickoffDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const dateStr = kickoffDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  if (compact) return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2 border border-white/8"
         style={{ background: "rgba(12,26,46,0.7)" }}>
      <span className="text-lg">{match.homeFlag}</span>
      <span className="text-sm font-bold text-white">{match.homeTeam} vs {match.awayTeam}</span>
      <span className="text-lg">{match.awayFlag}</span>
      <StatusPill status={match.status} minute={match.minute} />
    </div>
  );

  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-4 pitch-bg")}
         style={{
           background: isLive
             ? "linear-gradient(135deg, #0e0918 0%, #0a0c1e 100%)"
             : "linear-gradient(135deg, #08122a 0%, #060c1e 100%)",
           border: isLive
             ? "1px solid rgba(255,23,68,0.25)"
             : "1px solid rgba(255,255,255,0.08)",
           boxShadow: isLive ? "0 0 24px rgba(255,23,68,0.1) inset" : undefined,
         }}>

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: isLive
               ? "radial-gradient(ellipse at 50% 120%, rgba(255,23,68,0.08) 0%, transparent 60%)"
               : "radial-gradient(ellipse at 50% 120%, rgba(0,102,255,0.06) 0%, transparent 60%)",
           }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-white/30 font-medium tracking-wider uppercase">{match.round}</span>
          <StatusPill status={match.status} minute={match.minute} />
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-[44px] leading-none">{match.homeFlag}</span>
            <span className="text-xs font-bold text-white/80 text-center leading-tight">{match.homeTeam}</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 px-3">
            {match.status !== "upcoming" ? (
              <div className="flex items-center gap-2">
                <span className="text-[36px] font-black text-white tabular-nums leading-none"
                      style={{ textShadow: isLive ? "0 0 20px rgba(255,255,255,0.25)" : undefined }}>
                  {match.scoreHome}
                </span>
                <span className="text-[20px] font-black text-white/20">–</span>
                <span className="text-[36px] font-black text-white tabular-nums leading-none"
                      style={{ textShadow: isLive ? "0 0 20px rgba(255,255,255,0.25)" : undefined }}>
                  {match.scoreAway}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-[22px] font-black text-white/70">{timeStr}</div>
              </div>
            )}
            <div className="text-[10px] text-white/30">{dateStr}</div>
          </div>

          <div className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-[44px] leading-none">{match.awayFlag}</span>
            <span className="text-xs font-bold text-white/80 text-center leading-tight">{match.awayTeam}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
          <span className="text-[10px] text-white/20">📍</span>
          <span className="text-[10px] text-white/25">{match.venueName} · {match.venueCity}</span>
        </div>
      </div>
    </div>
  );
}
