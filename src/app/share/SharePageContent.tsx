"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { decodeSharePlan, formatKickoff } from "@/lib/shareLink";
import { MATCHES } from "@/data/matches";
import { VENUES } from "@/data/venues";
import { MapPin, Clock, Navigation, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export function SharePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = decodeSharePlan(searchParams.toString());

  if (!plan || !plan.matchId) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center"
           style={{ background: "#040812" }}>
        <div className="text-5xl mb-5 float">⚽</div>
        <div className="text-white font-black text-xl mb-2">Invalid Share Link</div>
        <div className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>
          This link appears to be broken or expired.
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/discover")}
          className="px-6 py-3.5 rounded-2xl font-black text-sm"
          style={{
            background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
            color: "#ffffff",
            boxShadow: "0 4px 20px rgba(0,102,255,0.4)",
          }}
        >
          Open FIFA 360
        </motion.button>
      </div>
    );
  }

  const match = MATCHES.find((m) => m.id === plan.matchId) ?? {
    homeTeam: "Home", awayTeam: "Away",
    homeFlag: "🏳️",  awayFlag: "🏳️",
    kickoff: plan.kickoff, round: "World Cup 2026",
  };
  const venue = VENUES.find((v) => v.id === plan.venueId);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "#040812" }}>
      {/* Hero */}
      <div className="relative overflow-hidden pitch-bg"
           style={{
             background: "linear-gradient(180deg, #0e0e24 0%, #07101e 60%, #040812 100%)",
             borderBottom: "1px solid rgba(255,255,255,0.06)",
           }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: "radial-gradient(ellipse at 50% 0%, rgba(0,102,255,0.15) 0%, transparent 60%)",
             }} />

        <div className="relative z-10 px-5 pt-12 pb-8 text-center">
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
               style={{
                 background: "rgba(0,180,255,0.1)",
                 border: "1px solid rgba(0,180,255,0.25)",
               }}>
            <span className="text-[10px] font-black tracking-[0.18em] uppercase"
                  style={{ color: "#00b4ff" }}>
              Shared Matchday Plan
            </span>
          </div>

          {/* Teams */}
          <motion.div
            className="flex items-center justify-center gap-6 mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
          >
            <div className="text-center">
              <div className="text-[60px] leading-none mb-2">
                {"homeFlag" in match ? match.homeFlag : "🏳️"}
              </div>
              <div className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                {match.homeTeam}
              </div>
            </div>
            <div className="font-black text-2xl" style={{ color: "rgba(255,255,255,0.15)" }}>vs</div>
            <div className="text-center">
              <div className="text-[60px] leading-none mb-2">
                {"awayFlag" in match ? match.awayFlag : "🏳️"}
              </div>
              <div className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                {match.awayTeam}
              </div>
            </div>
          </motion.div>

          <div className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            {formatKickoff(plan.kickoff)}
          </div>
        </div>
      </div>

      {/* Plan details */}
      <div className="flex-1 px-5 py-6 space-y-3">
        {/* Venue card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35, ease: [0.22,1,0.36,1] }}
          className="flex items-start gap-3 rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, rgba(255,29,120,0.08) 0%, rgba(12,26,46,0.8) 100%)",
            border: "1px solid rgba(255,29,120,0.2)",
          }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
               style={{
                 background: "rgba(255,29,120,0.15)",
                 border: "1px solid rgba(255,29,120,0.3)",
               }}>
            <MapPin className="w-4 h-4" style={{ color: "#ff1d78" }} />
          </div>
          <div>
            <div className="text-sm font-black text-white">{plan.venueName}</div>
            <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {plan.venueAddress}
            </div>
            {venue?.etaMinutes && (
              <div className="text-[11px] mt-1 font-bold" style={{ color: "#00b4ff" }}>
                ~{venue.etaMinutes} min from centre
              </div>
            )}
          </div>
        </motion.div>

        {/* Route info */}
        {plan.routeMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35, ease: [0.22,1,0.36,1] }}
            className="grid grid-cols-2 gap-2.5"
          >
            <div className="rounded-xl p-3"
                 style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-[10px] font-medium mb-1 flex items-center gap-1"
                   style={{ color: "rgba(255,255,255,0.3)" }}>
                <Navigation className="w-3 h-3" /> Mode
              </div>
              <div className="text-sm font-bold text-white capitalize">{plan.routeMode}</div>
            </div>
            {plan.departureTime && (
              <div className="rounded-xl p-3"
                   style={{ background: "rgba(255,215,64,0.07)", border: "1px solid rgba(255,215,64,0.2)" }}>
                <div className="text-[10px] font-medium mb-1 flex items-center gap-1"
                     style={{ color: "rgba(255,255,255,0.3)" }}>
                  <Clock className="w-3 h-3" /> Leave at
                </div>
                <div className="text-sm font-black" style={{ color: "#ffd740" }}>{plan.departureTime}</div>
              </div>
            )}
          </motion.div>
        )}

        {/* Vibe tags */}
        {venue && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35, ease: [0.22,1,0.36,1] }}
            className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2"
                 style={{ color: "rgba(255,255,255,0.3)" }}>
              Venue Vibe
            </div>
            <div className="flex flex-wrap gap-1.5">
              {venue.vibeTags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        color: "rgba(0,180,255,0.8)",
                        background: "rgba(0,180,255,0.1)",
                        border: "1px solid rgba(0,180,255,0.2)",
                      }}>
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-10 space-y-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35, ease: [0.22,1,0.36,1] }}
          onClick={() => router.push("/discover")}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm"
          style={{
            background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
            color: "#ffffff",
            boxShadow: "0 4px 28px rgba(0,102,255,0.45)",
          }}
        >
          <ExternalLink className="w-4 h-4" />
          Open in FIFA 360
        </motion.button>
        <p className="text-center text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>
          FIFA 360 · Your World Cup 2026 Companion
        </p>
      </div>
    </div>
  );
}
