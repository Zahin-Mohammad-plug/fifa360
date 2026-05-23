"use client";

import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { Bell, Sliders, ShieldCheck, Check, Sparkles, Volume2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WORLD_CUP_TEAMS = [
  { name: "Argentina",    flag: "🇦🇷" },
  { name: "Brazil",       flag: "🇧🇷" },
  { name: "France",       flag: "🇫🇷" },
  { name: "England",      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Spain",        flag: "🇪🇸" },
  { name: "Germany",      flag: "🇩🇪" },
  { name: "Portugal",     flag: "🇵🇹" },
  { name: "Netherlands",  flag: "🇳🇱" },
  { name: "USA",          flag: "🇺🇸" },
  { name: "Mexico",       flag: "🇲🇽" },
  { name: "Canada",       flag: "🇨🇦" },
  { name: "Morocco",      flag: "🇲🇦" },
  { name: "Japan",        flag: "🇯🇵" },
  { name: "South Korea",  flag: "🇰🇷" },
  { name: "Uruguay",      flag: "🇺🇾" },
  { name: "Colombia",     flag: "🇨🇴" },
  { name: "Ecuador",      flag: "🇪🇨" },
  { name: "Senegal",      flag: "🇸🇳" },
  { name: "Nigeria",      flag: "🇳🇬" },
  { name: "Croatia",      flag: "🇭🇷" },
  { name: "Switzerland",  flag: "🇨🇭" },
  { name: "Denmark",      flag: "🇩🇰" },
  { name: "Austria",      flag: "🇦🇹" },
  { name: "Australia",    flag: "🇦🇺" },
  { name: "Serbia",       flag: "🇷🇸" },
  { name: "Ukraine",      flag: "🇺🇦" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Indonesia",    flag: "🇮🇩" },
];

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`toggle-track ${active ? "active" : ""}`}
      role="switch"
      aria-checked={active}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

export default function ProfilePage() {
  const { fanPrefs, setFanPrefs, reset } = useAppStore();
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [localTeam, setLocalTeam] = useState(fanPrefs.favoriteTeam);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleToggle = (key: keyof Omit<typeof fanPrefs, "favoriteTeam">) => {
    const updated = !fanPrefs[key];
    setFanPrefs({ [key]: updated });
    showToast(`${key.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase())} alerts ${updated ? "enabled" : "disabled"}.`);
  };

  const handleSave = () => {
    setFanPrefs({ favoriteTeam: localTeam });
    setSaved(true);
    showToast(`Favourite team updated to ${localTeam} ✓`);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentTeam = WORLD_CUP_TEAMS.find((t) => t.name === fanPrefs.favoriteTeam);

  const TOGGLES = [
    { key: "kickoffAlerts" as const, label: "Matchday Kickoff Alarm",   desc: "Reminder 15 minutes before every kick-off." },
    { key: "scoreUpdates"  as const, label: "Live Score Updates",        desc: "Push alerts for goals, red cards, and penalties." },
    { key: "routeReminders" as const, label: "Route & Departure Alerts", desc: "Alert when your countdown drops under 5 minutes." },
    { key: "crowdWarnings"  as const, label: "Venue Crowd Warnings",     desc: "Warning when your saved venue hits 95% capacity." },
  ];

  return (
    <div className="page-enter pb-4">
      <div className="page-container pt-4 space-y-4">

        {/* ── Fan Profile Badge ── */}
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: "rgba(18,28,13,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl" style={{ background: "rgba(204,255,0,0.05)" }} />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl p-0.5"
                style={{ background: "linear-gradient(135deg, #ccff00, #22c55e)", border: "2px solid rgba(204,255,0,0.5)" }}
              >
                <div className="w-full h-full rounded-full flex items-center justify-center text-2xl" style={{ background: "#070c04" }}>
                  {currentTeam?.flag ?? "⚽"}
                </div>
              </div>
              <span
                className="absolute bottom-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{ background: "#22c55e", border: "2px solid #070c04", color: "#fff" }}
              >
                ✓
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-1.5" style={{ color: "#f9fbf8" }}>
                Football Fan
                <span
                  className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
                  style={{ color: "#ccff00", background: "rgba(204,255,0,0.12)", border: "1px solid rgba(204,255,0,0.3)" }}
                >
                  TICKET HOLDER
                </span>
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#83927d" }}>ID: MC-{Math.abs(fanPrefs.favoriteTeam.charCodeAt(0) * 1234 % 99999)}-2026</p>
              <p className="text-[10px] font-mono flex items-center gap-1 mt-1" style={{ color: "#ccff00" }}>
                <ShieldCheck className="w-3 h-3" /> Digital Fan Verified Pass Active
              </p>
            </div>
          </div>
        </div>

        {/* ── Favourite Team ── */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(13,21,11,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-4 h-4" style={{ color: "#ccff00" }} />
            <h3 className="text-sm font-bold" style={{ color: "#f9fbf8" }}>Supporter Matching</h3>
          </div>

          <div className="mb-3">
            <label className="label-mono block mb-2">Favourite National Team</label>
            <select
              value={localTeam}
              onChange={(e) => setLocalTeam(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl text-xs outline-none transition-all"
              style={{
                background: "rgba(7,12,4,0.85)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#f9fbf8",
                fontFamily: "var(--font-sans)",
              }}
            >
              {WORLD_CUP_TEAMS.map((t) => (
                <option key={t.name} value={t.name}>{t.flag} {t.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: saved ? "rgba(204,255,0,0.15)" : "rgba(255,255,255,0.06)",
              border: saved ? "1px solid rgba(204,255,0,0.4)" : "1px solid rgba(255,255,255,0.08)",
              color: saved ? "#ccff00" : "#b8c5b4",
            }}
          >
            {saved
              ? <><Check className="w-4 h-4" style={{ color: "#ccff00" }} /> Synced!</>
              : <><Sparkles className="w-4 h-4" style={{ color: "#ccff00" }} /> Sync Fan Feed</>
            }
          </button>
        </div>

        {/* ── Notification Toggles ── */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(13,21,11,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: "#ccff00" }} />
              <h3 className="text-sm font-bold" style={{ color: "#f9fbf8" }}>Notification Preferences</h3>
            </div>
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 rounded"
              style={{ color: "#f59e0b", background: "rgba(245,158,11,0.08)" }}
            >
              Push Channels
            </span>
          </div>

          <div className="space-y-5">
            {TOGGLES.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold leading-snug" style={{ color: "#f9fbf8" }}>{label}</h4>
                  <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: "#83927d" }}>{desc}</p>
                </div>
                <Toggle active={fanPrefs[key]} onToggle={() => handleToggle(key)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Diagnostics & Reset ── */}
        <div
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background: "rgba(13,21,11,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <h4 className="text-xs font-bold" style={{ color: "#f9fbf8" }}>Diagnostics Channel</h4>
            <p className="text-[10px] mt-0.5" style={{ color: "#83927d" }}>Test alert sound & matchday toast telemetry.</p>
          </div>
          <button
            onClick={() => showToast("🚨 Test Alert: El Gaucho NYC is now at 95% capacity — leave in 12 minutes!")}
            className="text-[10px] font-mono font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            style={{ color: "#ccff00", background: "rgba(7,12,4,0.9)", border: "1px solid rgba(204,255,0,0.3)" }}
          >
            <Volume2 className="w-3.5 h-3.5" /> TEST
          </button>
        </div>

        {/* ── Reset ── */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs transition-all"
          style={{ color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset App State
        </motion.button>

      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[calc(var(--bottom-nav-height)+12px)] left-4 right-4 z-50 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(18,28,13,0.95)",
              border: "1px solid rgba(204,255,0,0.25)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p className="text-xs font-semibold text-center" style={{ color: "#f9fbf8" }}>{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
