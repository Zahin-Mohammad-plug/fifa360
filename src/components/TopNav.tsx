"use client";

import { useEffect, useState } from "react";
import { Bell, Trophy, Wifi } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { MATCHES } from "@/data/matches";

export function TopNav() {
  const [utcTime, setUtcTime] = useState("");
  const { selectedMatch } = useAppStore();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, "0");
      const m = String(now.getUTCMinutes()).padStart(2, "0");
      const s = String(now.getUTCSeconds()).padStart(2, "0");
      setUtcTime(`${h}:${m}:${s} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const liveMatch = MATCHES.find((m) => m.status === "live");
  const activeMatch = selectedMatch ?? liveMatch ?? MATCHES[0];

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 glass-panel-heavy"
      style={{ height: "var(--nav-height)", borderBottom: "1px solid rgba(204,255,0,0.08)" }}
    >
      <div className="page-container h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="relative flex items-center justify-center rounded-xl flex-shrink-0"
            style={{
              width: 36, height: 36,
              background: "linear-gradient(135deg,rgba(204,255,0,0.15) 0%,rgba(18,28,13,0.9) 100%)",
              border: "1px solid rgba(204,255,0,0.3)",
            }}
          >
            <Trophy className="w-4 h-4" style={{ color: "#ccff00" }} />
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{ background: "#ccff00", animation: "ping-dot 1.8s infinite" }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight" style={{ color: "#f9fbf8" }}>MATCHDAY</span>
              <span
                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ color: "#ccff00", background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.25)", letterSpacing: "0.12em" }}
              >
                CONCIERGE
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "#83927d" }}>
              <Wifi className="w-2.5 h-2.5" style={{ color: "#ccff00" }} />
              {utcTime || "00:00:00 UTC"}
            </div>
          </div>
        </div>

        {/* Live ticker pill */}
        {activeMatch && (
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {activeMatch.status === "live" && (
              <span className="w-2 h-2 rounded-full animate-live-dot" style={{ background: "#ff3b30" }} />
            )}
            <span className="text-xs font-mono font-semibold" style={{ color: "#f9fbf8" }}>
              {activeMatch.homeShort}&nbsp;
              {activeMatch.status !== "upcoming" ? `${activeMatch.scoreHome}–${activeMatch.scoreAway}` : "vs"}&nbsp;
              {activeMatch.awayShort}
            </span>
            {activeMatch.status === "live" && (
              <span className="text-[10px] font-mono" style={{ color: "#83927d" }}>{activeMatch.minute}&apos;</span>
            )}
          </div>
        )}

        {/* Bell */}
        <button
          className="relative flex items-center justify-center rounded-xl transition-colors"
          style={{ width: 36, height: 36, background: "rgba(24,38,18,0.8)", border: "1px solid rgba(255,255,255,0.07)", color: "#83927d" }}
        >
          <Bell className="w-4 h-4" />
          {liveMatch && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-mono font-bold"
              style={{ background: "#ff3b30", color: "#fff", border: "2px solid #070c04" }}
            >
              1
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
