"use client";

import { useAppStore } from "@/store/appStore";
import { NotificationSheet } from "@/components/NotificationSheet";
import { useState } from "react";
import { Bell, MapPin, Users, Heart, RotateCcw, ChevronRight, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VIBES = [
  { id: "loud",    label: "Loud",    emoji: "🔊", desc: "High-energy crowd" },
  { id: "relaxed", label: "Relaxed", emoji: "🛋",  desc: "Chill atmosphere" },
  { id: "mixed",   label: "Mixed",   emoji: "⚡",  desc: "Best of both" },
] as const;

const TEAMS = ["Argentina","Brazil","France","England","Germany","Spain","Portugal","USA","Morocco","Japan","Mexico","Netherlands"];

const TEAM_FLAGS: Record<string,string> = {
  Argentina:"🇦🇷", Brazil:"🇧🇷", France:"🇫🇷", England:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Germany:"🇩🇪", Spain:"🇪🇸", Portugal:"🇵🇹", USA:"🇺🇸",
  Morocco:"🇲🇦", Japan:"🇯🇵", Mexico:"🇲🇽", Netherlands:"🇳🇱",
};

const BUDGETS = [
  { level: 1 as const, label: "Budget",    desc: "Under $20", emoji: "💰" },
  { level: 2 as const, label: "Mid-range", desc: "$20–50",    emoji: "💳" },
  { level: 3 as const, label: "Premium",   desc: "$50–100",   emoji: "✨" },
  { level: 4 as const, label: "Luxury",    desc: "$100+",     emoji: "👑" },
];

function Card({ children, accent = "#00b4ff" }: { children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background: "rgba(12,26,46,0.6)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${accent} 0%, transparent 60%)` }} />
      <div className="p-5">{children}</div>
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-4"
         style={{ color: "rgba(255,255,255,0.3)" }}>{children}</div>
  );
}

export default function ProfilePage() {
  const { preferences, setPreferences, reset } = useAppStore();
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [showTeamPicker, setShowTeamPicker] = useState(false);

  return (
    <div className="page-enter min-h-screen">
      {/* Header */}
      <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(4,8,18,0.6)" }}>
        <div className="page-container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Profile</h1>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                Personalise your matchday experience
              </p>
            </div>
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(0,180,255,0.25) 0%, rgba(124,77,255,0.25) 100%)",
                   border: "1px solid rgba(0,180,255,0.25)",
                   boxShadow: "0 0 24px rgba(0,180,255,0.15)",
                 }}>
              {TEAM_FLAGS[preferences.teamPreference ?? ""] ?? "🌍"}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">

          {/* Location */}
          <Card accent="#00b4ff">
            <CardTitle>Your Location</CardTitle>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   style={{ background: "rgba(0,180,255,0.12)", border: "1px solid rgba(0,180,255,0.2)" }}>
                <MapPin className="w-4 h-4" style={{ color: "#00b4ff" }} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Times Square, New York</div>
                <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  40.748°N, 73.997°W · Auto-detected
                </div>
              </div>
            </div>
          </Card>

          {/* Favourite team */}
          <Card accent="#ff1d78">
            <CardTitle>Favourite Team</CardTitle>
            <button
              onClick={() => setShowTeamPicker((v) => !v)}
              className="w-full flex items-center justify-between rounded-xl px-3 py-3 transition-all"
              style={{ background: "rgba(255,29,120,0.07)", border: "1px solid rgba(255,29,120,0.15)" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{TEAM_FLAGS[preferences.teamPreference ?? ""] ?? "❤"}</span>
                <span className="text-sm font-bold text-white">{preferences.teamPreference ?? "No preference"}</span>
              </div>
              <ChevronRight className="w-4 h-4"
                style={{ color: "rgba(255,255,255,0.25)", transform: showTeamPicker ? "rotate(90deg)" : undefined, transition: "transform 0.2s" }} />
            </button>

            <AnimatePresence>
              {showTeamPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22,1,0.36,1] }}
                  className="overflow-hidden mt-2 rounded-xl"
                  style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(12,26,46,0.95)" }}
                >
                  <button
                    onClick={() => { setPreferences({ teamPreference: undefined }); setShowTeamPicker(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs transition-colors"
                    style={{ color: "rgba(255,255,255,0.35)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    No preference
                  </button>
                  <div className="grid grid-cols-2">
                    {TEAMS.map((team) => {
                      const active = preferences.teamPreference === team;
                      return (
                        <button
                          key={team}
                          onClick={() => { setPreferences({ teamPreference: team }); setShowTeamPicker(false); }}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm transition-colors"
                          style={{
                            color: active ? "#00b4ff" : "rgba(255,255,255,0.6)",
                            background: active ? "rgba(0,180,255,0.08)" : undefined,
                            fontWeight: active ? 700 : 500,
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          <span>{TEAM_FLAGS[team]}</span>{team}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Party size */}
          <Card accent="#ffd740">
            <CardTitle>Party Size</CardTitle>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4" style={{ color: "#ffd740" }} />
              <span className="text-sm font-black text-white">{preferences.partySize} people</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1,2,3,4,5,6,8,10,12,15,20].map((n) => {
                const active = preferences.partySize === n;
                return (
                  <motion.button
                    key={n}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setPreferences({ partySize: n })}
                    className="w-9 h-9 rounded-xl text-sm font-bold transition-all"
                    style={active ? {
                      background: "rgba(255,215,64,0.18)", border: "1px solid rgba(255,215,64,0.45)",
                      color: "#ffd740", boxShadow: "0 0 10px rgba(255,215,64,0.18)",
                    } : {
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    {n}
                  </motion.button>
                );
              })}
            </div>
          </Card>

          {/* Vibe preference */}
          <Card accent="#7c4dff">
            <CardTitle>Preferred Vibe</CardTitle>
            <div className="grid grid-cols-3 gap-2.5">
              {VIBES.map(({ id, label, emoji, desc }) => {
                const active = preferences.preferredVibe === id;
                return (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPreferences({ preferredVibe: id })}
                    className="flex flex-col items-center gap-1.5 py-4 rounded-xl transition-all"
                    style={active ? {
                      background: "rgba(124,77,255,0.18)", border: "1px solid rgba(124,77,255,0.45)",
                      boxShadow: "0 0 14px rgba(124,77,255,0.18)",
                    } : {
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs font-black" style={{ color: active ? "#a57aff" : "rgba(255,255,255,0.5)" }}>
                      {label}
                    </span>
                    <span className="text-[9px] text-center px-1" style={{ color: "rgba(255,255,255,0.25)" }}>{desc}</span>
                  </motion.button>
                );
              })}
            </div>
          </Card>

          {/* Budget */}
          <Card accent="#00ff88">
            <CardTitle>Budget Level</CardTitle>
            <div className="space-y-2">
              {BUDGETS.map(({ level, label, desc, emoji }) => {
                const active = preferences.budgetSensitivity === level;
                return (
                  <motion.button
                    key={level}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPreferences({ budgetSensitivity: level })}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all"
                    style={active ? {
                      background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)",
                    } : {
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{emoji}</span>
                      <span className="text-sm font-bold"
                            style={{ color: active ? "#00ff88" : "rgba(255,255,255,0.7)" }}>
                        {label}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</span>
                  </motion.button>
                );
              })}
            </div>
          </Card>

          {/* Notifications + About + Reset */}
          <div className="space-y-4">
            <Card accent="#00b4ff">
              <CardTitle>Notifications</CardTitle>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setNotifOpen(true)}
                className="w-full flex items-center justify-between rounded-xl px-3 py-3"
                style={{ background: "rgba(0,180,255,0.08)", border: "1px solid rgba(0,180,255,0.18)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                       style={{ background: "rgba(0,180,255,0.15)", border: "1px solid rgba(0,180,255,0.25)" }}>
                    <Bell className="w-4 h-4" style={{ color: "#00b4ff" }} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">Match Alerts</div>
                    <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>Goals, cards, kickoff</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
              </motion.button>
            </Card>

            {/* About */}
            <div className="rounded-2xl p-4 relative overflow-hidden pitch-bg"
                 style={{ background: "rgba(12,26,46,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-xs font-black mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>FIFA 360</div>
              <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
                Your World Cup 2026 companion. Find venues, plan routes, get live scores, and verify conditions through AI concierge calls.
              </div>
              <div className="text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.15)" }}>v1.0.0 · 2026</div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs"
              style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset App State
            </motion.button>
          </div>
        </div>
      </div>

      <NotificationSheet open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
