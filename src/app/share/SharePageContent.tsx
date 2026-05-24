"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { decodeSharePlan, formatKickoff } from "@/lib/shareLink";
import { MATCHES } from "@/data/matches";
import { VENUES } from "@/data/venues";
import { MapPin, Clock, Navigation, ExternalLink, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export function SharePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = decodeSharePlan(searchParams.toString());

  if (!plan || !plan.matchId) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center p-6 text-center"
        style={{ background: "#070c04" }}
      >
        <div className="text-5xl mb-5 animate-float">⚽</div>
        <div className="text-xl font-black mb-2" style={{ color: "#f9fbf8" }}>Invalid Share Link</div>
        <div className="text-sm mb-8" style={{ color: "#83927d" }}>
          This link appears to be broken or expired.
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/discover")}
          className="px-6 py-3.5 rounded-2xl font-black text-sm"
          style={{ background: "#ccff00", color: "#070c04" }}
        >
          Open FIFA 360
        </motion.button>
      </div>
    );
  }

  const match = MATCHES.find((m) => m.id === plan.matchId);
  const venue = VENUES.find((v) => v.id === plan.venueId);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "#070c04" }}>
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(18,28,13,0.9) 0%, #070c04 100%)",
          borderBottom: "1px solid rgba(204,255,0,0.08)",
        }}
      >
        <div className="relative z-10 px-5 pt-12 pb-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.25)" }}
          >
            <Trophy className="w-3.5 h-3.5" style={{ color: "#ccff00" }} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "#ccff00" }}>
              Shared Matchday Plan
            </span>
          </div>

          {match && (
            <motion.div
              className="flex items-center justify-center gap-6 mb-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
            >
              {[
                { flag: match.homeFlag, name: match.homeTeam },
                { flag: match.awayFlag, name: match.awayTeam },
              ].map((t, i) => (
                <div key={i} className="text-center">
                  <div className="text-[60px] leading-none mb-2">{t.flag}</div>
                  <div className="text-xs font-bold" style={{ color: "rgba(249,251,248,0.7)" }}>{t.name}</div>
                </div>
              ))}
            </motion.div>
          )}

          <div className="text-sm font-mono" style={{ color: "#83927d" }}>
            {formatKickoff(plan.kickoff)}
          </div>
        </div>
      </div>

      {/* Plan details */}
      <div className="flex-1 px-5 py-6 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-start gap-3 rounded-2xl p-4"
          style={{ background: "rgba(18,28,13,0.6)", border: "1px solid rgba(204,255,0,0.15)" }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
               style={{ background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.25)" }}>
            <MapPin className="w-4 h-4" style={{ color: "#ccff00" }} />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: "#f9fbf8" }}>{plan.venueName}</div>
            <div className="text-[11px] mt-0.5" style={{ color: "#83927d" }}>{plan.venueAddress}</div>
            {venue?.etaMinutes && (
              <div className="text-[11px] mt-1 font-bold font-mono" style={{ color: "#ccff00" }}>
                ~{venue.etaMinutes} min transit
              </div>
            )}
          </div>
        </motion.div>

        {plan.routeMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-2.5"
          >
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-1 text-[10px] mb-1 font-mono" style={{ color: "#83927d" }}>
                <Navigation className="w-3 h-3" /> Mode
              </div>
              <div className="text-sm font-bold capitalize" style={{ color: "#f9fbf8" }}>{plan.routeMode}</div>
            </div>
            {plan.departureTime && (
              <div className="rounded-xl p-3" style={{ background: "rgba(204,255,0,0.07)", border: "1px solid rgba(204,255,0,0.2)" }}>
                <div className="flex items-center gap-1 text-[10px] mb-1 font-mono" style={{ color: "#83927d" }}>
                  <Clock className="w-3 h-3" /> Leave at
                </div>
                <div className="text-sm font-black font-mono" style={{ color: "#ccff00" }}>{plan.departureTime}</div>
              </div>
            )}
          </motion.div>
        )}

        {venue && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="label-mono mb-2">Venue Vibe</div>
            <div className="flex flex-wrap gap-1.5">
              {venue.vibeTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                  style={{ color: "#ccff00", background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.2)" }}
                >
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
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          onClick={() => router.push("/discover")}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm"
          style={{ background: "#ccff00", color: "#070c04" }}
        >
          <ExternalLink className="w-4 h-4" />
          Open in FIFA 360
        </motion.button>
        <p className="text-center text-[10px] font-mono" style={{ color: "rgba(249,251,248,0.18)" }}>
          FIFA 360 · FIFA World Cup 2026
        </p>
      </div>
    </div>
  );
}
