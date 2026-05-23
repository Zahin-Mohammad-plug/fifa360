"use client";

import { useEffect, useState } from "react";
import { Bell, Trophy } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { MATCHES } from "@/data/matches";

export function TopNav() {
  const [utcTime, setUtcTime] = useState("");
  const { selectedMatch } = useAppStore();

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const h = String(d.getUTCHours()).padStart(2, "0");
      const m = String(d.getUTCMinutes()).padStart(2, "0");
      const s = String(d.getUTCSeconds()).padStart(2, "0");
      setUtcTime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const liveMatch  = MATCHES.find((m) => m.status === "live");
  const activeMatch = selectedMatch ?? liveMatch ?? MATCHES[0];
  const isLive     = activeMatch.status === "live";

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 glass-panel-heavy"
      style={{ height: "var(--nav-height)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="page-container h-full flex items-center justify-between gap-3">

        {/* ── Logo ── */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="relative flex items-center justify-center rounded-xl"
            style={{
              width: 36, height: 36,
              background: "linear-gradient(135deg, rgba(204,255,0,0.22) 0%, rgba(10,18,7,0.9) 100%)",
              border: "1px solid rgba(204,255,0,0.38)",
              boxShadow: "0 0 16px rgba(204,255,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <Trophy className="w-4 h-4" style={{ color: "#ccff00" }} />
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ background: "#ccff00", boxShadow: "0 0 6px #ccff00", animation: "ping-dot 2s infinite" }}
            />
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-extrabold tracking-tight leading-none" style={{ color: "#f5f9f3" }}>
              MATCHDAY <span className="gradient-text-neon">CONCIERGE</span>
            </p>
            <p className="text-[9px] font-mono mt-0.5" style={{ color: "#7a8a75" }}>
              {utcTime ? `${utcTime} UTC` : "—— : —— : ——"}
            </p>
          </div>
        </div>

        {/* ── Live score ticker ── */}
        {activeMatch && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: isLive ? "rgba(255,59,48,0.08)" : "rgba(0,0,0,0.32)",
              border: isLive ? "1px solid rgba(255,59,48,0.22)" : "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
            }}
          >
            {isLive && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "#ff3b30", animation: "live-pulse 1.4s infinite" }}
              />
            )}
            <span className="text-[11px] font-mono font-semibold leading-none" style={{ color: "#f5f9f3" }}>
              {activeMatch.homeFlag}&nbsp;
              {activeMatch.status !== "upcoming"
                ? `${activeMatch.scoreHome}–${activeMatch.scoreAway}`
                : "vs"}&nbsp;
              {activeMatch.awayFlag}
            </span>
            {isLive && (
              <span className="text-[9px] font-mono" style={{ color: "#7a8a75" }}>{activeMatch.minute}′</span>
            )}
          </div>
        )}

        {/* ── Bell ── */}
        <button
          className="relative flex items-center justify-center rounded-xl flex-shrink-0 transition-colors"
          style={{
            width: 36, height: 36,
            background: "rgba(20,32,15,0.7)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "#7a8a75",
          }}
        >
          <Bell className="w-4 h-4" />
          {liveMatch && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-mono font-bold"
              style={{ background: "#ff3b30", color: "#fff", border: "2px solid #060b03" }}
            >
              1
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
