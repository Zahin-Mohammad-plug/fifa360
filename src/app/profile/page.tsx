"use client";

import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import {
  Bell, Sliders, ShieldCheck, Check, Sparkles, Volume2, RotateCcw,
  Zap, Globe, MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WORLD_CUP_TEAMS = [
  { name: "Argentina",    flag: "🇦🇷", color: "#74ACDF" },
  { name: "Brazil",       flag: "🇧🇷", color: "#009C3B" },
  { name: "France",       flag: "🇫🇷", color: "#003189" },
  { name: "England",      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#003090" },
  { name: "Spain",        flag: "🇪🇸", color: "#AA151B" },
  { name: "Germany",      flag: "🇩🇪", color: "#d4af37" },
  { name: "Portugal",     flag: "🇵🇹", color: "#006600" },
  { name: "Netherlands",  flag: "🇳🇱", color: "#FF6600" },
  { name: "USA",          flag: "🇺🇸", color: "#B22234" },
  { name: "Mexico",       flag: "🇲🇽", color: "#006847" },
  { name: "Canada",       flag: "🇨🇦", color: "#FF0000" },
  { name: "Morocco",      flag: "🇲🇦", color: "#C1272D" },
  { name: "Japan",        flag: "🇯🇵", color: "#BC002D" },
  { name: "South Korea",  flag: "🇰🇷", color: "#003478" },
  { name: "Uruguay",      flag: "🇺🇾", color: "#5EB6E4" },
  { name: "Colombia",     flag: "🇨🇴", color: "#FCD116" },
  { name: "Ecuador",      flag: "🇪🇨", color: "#FFD100" },
  { name: "Senegal",      flag: "🇸🇳", color: "#00853F" },
  { name: "Nigeria",      flag: "🇳🇬", color: "#008751" },
  { name: "Croatia",      flag: "🇭🇷", color: "#FF0000" },
  { name: "Switzerland",  flag: "🇨🇭", color: "#FF0000" },
  { name: "Denmark",      flag: "🇩🇰", color: "#C60C30" },
  { name: "Austria",      flag: "🇦🇹", color: "#EF3340" },
  { name: "Australia",    flag: "🇦🇺", color: "#00843D" },
  { name: "Serbia",       flag: "🇷🇸", color: "#C6363C" },
  { name: "Ukraine",      flag: "🇺🇦", color: "#005BBB" },
  { name: "Saudi Arabia", flag: "🇸🇦", color: "#006C35" },
  { name: "Indonesia",    flag: "🇮🇩", color: "#CE1126" },
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

const TOGGLE_ICONS = {
  kickoffAlerts:  { icon: Zap,    color: "#ccff00" },
  scoreUpdates:   { icon: Globe,  color: "#60a5fa" },
  routeReminders: { icon: MapPin, color: "#f59e0b" },
  crowdWarnings:  { icon: Bell,   color: "#ff5e54" },
};

export default function ProfilePage() {
  const { fanPrefs, setFanPrefs, reset } = useAppStore();
  const [saved,     setSaved]     = useState(false);
  const [toast,     setToast]     = useState<string | null>(null);
  const [localTeam, setLocalTeam] = useState(fanPrefs.favoriteTeam);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleToggle = (key: keyof Omit<typeof fanPrefs, "favoriteTeam">) => {
    const val = !fanPrefs[key];
    setFanPrefs({ [key]: val });
    showToast(`${key.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase())} ${val ? "enabled ✓" : "disabled"}`);
  };

  const handleSave = () => {
    setFanPrefs({ favoriteTeam: localTeam });
    setSaved(true);
    showToast(`Team set to ${localTeam} 🎉`);
    setTimeout(() => setSaved(false), 2200);
  };

  const currentTeam = WORLD_CUP_TEAMS.find((t) => t.name === fanPrefs.favoriteTeam)
    ?? WORLD_CUP_TEAMS[0];

  const teamColor = currentTeam.color;

  const TOGGLES = [
    { key: "kickoffAlerts"  as const, label: "Matchday Kickoff Alarm",    desc: "Reminder 15 minutes before every kick-off." },
    { key: "scoreUpdates"   as const, label: "Live Score Updates",         desc: "Push alerts for goals, red cards, and penalties." },
    { key: "routeReminders" as const, label: "Route & Departure Alerts",   desc: "Alert when countdown drops under 5 minutes." },
    { key: "crowdWarnings"  as const, label: "Venue Crowd Warnings",       desc: "Warning when saved venue hits 95% capacity." },
  ];

  return (
    <div className="page-enter pb-6">
      <div className="page-container pt-5 space-y-4">

        {/* ══ Fan Profile Badge ══ */}
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{
            background: `linear-gradient(155deg, ${teamColor}22 0%, rgba(10,18,8,0.9) 55%, ${teamColor}12 100%), rgba(12,20,9,0.82)`,
            border: `1px solid ${teamColor}38`,
            boxShadow: `0 0 40px ${teamColor}12, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          {/* Top gradient accent */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: `linear-gradient(90deg, transparent, ${teamColor}88, #ccff00 50%, ${teamColor}88, transparent)` }}
          />

          {/* Ambient glow blob */}
          <div
            className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl pointer-events-none"
            style={{ background: `${teamColor}18` }}
          />

          <div className="relative flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: `linear-gradient(135deg, ${teamColor}44, ${teamColor}18)`,
                  border: `2px solid ${teamColor}55`,
                  boxShadow: `0 0 20px ${teamColor}25`,
                }}
              >
                {currentTeam.flag}
              </div>
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{
                  background: "#22c55e",
                  border: "2.5px solid #060b03",
                  color: "#fff",
                }}
              >
                ✓
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-[15px] font-extrabold" style={{ color: "#f5f9f3" }}>
                  {currentTeam.name} Fan
                </h2>
                <span className="chip chip-neon">
                  TICKET HOLDER
                </span>
              </div>
              <p className="text-[10.5px] font-mono" style={{ color: "#7a8a75" }}>
                ID: MC-{Math.abs(fanPrefs.favoriteTeam.charCodeAt(0) * 1234 % 99999)}-2026
              </p>
              <p
                className="text-[10px] font-mono flex items-center gap-1.5 mt-1"
                style={{ color: "#ccff00" }}
              >
                <ShieldCheck className="w-3 h-3" />
                Digital Fan Verified · FIFA WC 2026
              </p>
            </div>
          </div>

          {/* World Cup badge row */}
          <div
            className="relative mt-4 pt-3.5 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="text-center">
              <p className="text-[18px] font-extrabold gradient-text-neon">2026</p>
              <p className="text-[8.5px] font-mono" style={{ color: "#7a8a75" }}>Edition</p>
            </div>
            <div className="text-center">
              <p className="text-[13px] font-bold" style={{ color: "#f5f9f3" }}>⚽ 48</p>
              <p className="text-[8.5px] font-mono" style={{ color: "#7a8a75" }}>Teams</p>
            </div>
            <div className="text-center">
              <p className="text-[13px] font-bold" style={{ color: "#f5f9f3" }}>🏆 64</p>
              <p className="text-[8.5px] font-mono" style={{ color: "#7a8a75" }}>Matches</p>
            </div>
            <div className="text-center">
              <p className="text-[13px] font-bold" style={{ color: "#f5f9f3" }}>🌎 3</p>
              <p className="text-[8.5px] font-mono" style={{ color: "#7a8a75" }}>Countries</p>
            </div>
          </div>
        </div>

        {/* ══ Supporter Matching ══ */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(10,18,8,0.6)", border: "1px solid rgba(255,255,255,0.058)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.25)" }}
            >
              <Sliders className="w-4 h-4" style={{ color: "#ccff00" }} />
            </div>
            <h3 className="text-[13.5px] font-bold" style={{ color: "#f5f9f3" }}>Supporter Matching</h3>
          </div>

          <div className="mb-3">
            <label className="label-mono block mb-2">Favourite National Team</label>
            <select
              value={localTeam}
              onChange={(e) => setLocalTeam(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-xl text-xs outline-none transition-all"
              style={{
                background: "rgba(5,9,3,0.85)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#f5f9f3",
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
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={saved ? {
              background: "rgba(204,255,0,0.12)",
              border: "1px solid rgba(204,255,0,0.38)",
              color: "#ccff00",
            } : {
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#b0bfac",
            }}
          >
            {saved
              ? <><Check className="w-4 h-4" style={{ color: "#ccff00" }} /> Synced!</>
              : <><Sparkles className="w-4 h-4" style={{ color: "#ccff00" }} /> Sync Fan Feed</>
            }
          </button>
        </div>

        {/* ══ Notification Preferences ══ */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(10,18,8,0.6)", border: "1px solid rgba(255,255,255,0.058)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)" }}
              >
                <Bell className="w-4 h-4" style={{ color: "#60a5fa" }} />
              </div>
              <h3 className="text-[13.5px] font-bold" style={{ color: "#f5f9f3" }}>Notifications</h3>
            </div>
            <span className="chip chip-amber">Push Channels</span>
          </div>

          <div className="space-y-4">
            {TOGGLES.map(({ key, label, desc }) => {
              const meta  = TOGGLE_ICONS[key];
              const Icon  = meta.icon;
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 py-1"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${meta.color}14`,
                      border: `1px solid ${meta.color}28`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12.5px] font-semibold leading-snug" style={{ color: "#f5f9f3" }}>
                      {label}
                    </h4>
                    <p className="text-[10.5px] mt-0.5 leading-relaxed" style={{ color: "#7a8a75" }}>
                      {desc}
                    </p>
                  </div>
                  <Toggle active={fanPrefs[key]} onToggle={() => handleToggle(key)} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ Diagnostics ══ */}
        <div
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: "rgba(10,18,8,0.6)", border: "1px solid rgba(255,255,255,0.058)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(204,255,0,0.08)", border: "1px solid rgba(204,255,0,0.2)" }}
          >
            <Volume2 className="w-5 h-5" style={{ color: "#ccff00" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[12.5px] font-bold" style={{ color: "#f5f9f3" }}>Diagnostics</h4>
            <p className="text-[10.5px] mt-0.5" style={{ color: "#7a8a75" }}>
              Test alert sound & matchday toast telemetry.
            </p>
          </div>
          <button
            onClick={() => showToast("🚨 Test Alert: El Gaucho NYC is now at 95% capacity — leave in 12 minutes!")}
            className="flex-shrink-0 chip chip-neon cursor-pointer text-[10px] py-1.5 px-3 rounded-xl"
            style={{ fontSize: "10px" }}
          >
            TEST
          </button>
        </div>

        {/* ══ Reset ══ */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs transition-all"
          style={{ color: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset App State
        </motion.button>

      </div>

      {/* ══ Toast ══ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-[calc(var(--bottom-nav-height)+14px)] left-4 right-4 z-50 rounded-2xl px-4 py-3.5"
            style={{
              background: "rgba(15,24,11,0.97)",
              border: "1px solid rgba(204,255,0,0.22)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.55), 0 0 20px rgba(204,255,0,0.07)",
              backdropFilter: "blur(24px)",
            }}
          >
            <p className="text-[12px] font-semibold text-center" style={{ color: "#f5f9f3" }}>{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
