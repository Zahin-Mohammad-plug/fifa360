"use client";

import { motion } from "framer-motion";
import { Eye, Home, Users } from "lucide-react";
import { TEAMS } from "@/lib/mock-data";
import { cn, priceLabel } from "@/lib/utils";
import type { FanProfile } from "@/lib/types";

export function TeamPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {Object.values(TEAMS).map((t) => {
        const active = selected.includes(t.id);
        return (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => onToggle(t.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl border p-2.5 transition-all",
              active
                ? "border-pitch-300/60 bg-pitch-400/20 shadow-glow-pitch"
                : "border-white/10 bg-white/5 hover:bg-white/10",
            )}
          >
            <span className="text-2xl">{t.flag}</span>
            <span className={cn("text-[10px] font-medium", active ? "text-white" : "text-white/55")}>
              {t.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

const STYLES: { value: FanProfile["watchStyle"]; label: string; desc: string; icon: typeof Users }[] = [
  { value: "social", label: "Social", desc: "Loud & lively", icon: Users },
  { value: "focused", label: "Focused", desc: "Eyes on the game", icon: Eye },
  { value: "family", label: "Family", desc: "Relaxed & easy", icon: Home },
];

export function StylePicker({
  value,
  onChange,
}: {
  value: FanProfile["watchStyle"];
  onChange: (v: FanProfile["watchStyle"]) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {STYLES.map((s) => {
        const Icon = s.icon;
        const active = value === s.value;
        return (
          <motion.button
            key={s.value}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(s.value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl border p-3 transition-all",
              active
                ? "border-pitch-300/60 bg-pitch-400/20 shadow-glow-pitch"
                : "border-white/10 bg-white/5 hover:bg-white/10",
            )}
          >
            <Icon className={cn("h-5 w-5", active ? "text-pitch-300" : "text-white/55")} />
            <span className="text-xs font-semibold">{s.label}</span>
            <span className="text-[10px] text-white/45">{s.desc}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

export function BudgetPicker({
  value,
  onChange,
}: {
  value: 1 | 2 | 3;
  onChange: (v: 1 | 2 | 3) => void;
}) {
  return (
    <div className="flex gap-2.5">
      {([1, 2, 3] as const).map((p) => {
        const active = value === p;
        return (
          <motion.button
            key={p}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(p)}
            className={cn(
              "flex-1 rounded-2xl border py-3 text-lg font-bold transition-all",
              active
                ? "border-trophy-300/60 bg-trophy-400/20 text-trophy-200"
                : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10",
            )}
          >
            {priceLabel(p)}
          </motion.button>
        );
      })}
    </div>
  );
}

export function TravelSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-white/70">Max travel time</span>
        <span className="rounded-full bg-pitch-400/20 px-2.5 py-0.5 text-sm font-bold text-pitch-200">
          {value} min
        </span>
      </div>
      <input
        type="range"
        min={10}
        max={60}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-pitch-400"
      />
      <div className="flex justify-between text-[10px] text-white/35">
        <span>10</span>
        <span>60 min</span>
      </div>
    </div>
  );
}

export function AlertStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const dec = () => onChange(Math.max(15, value - 15));
  const inc = () => onChange(Math.min(120, value + 15));
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-white/70">Departure alert</p>
        <p className="text-[11px] text-white/40">Minutes before kickoff</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={dec}
          className="pressable grid h-9 w-9 place-items-center rounded-full glass text-lg font-bold"
        >
          −
        </button>
        <span className="w-10 text-center text-lg font-bold tabular-nums">{value}</span>
        <button
          onClick={inc}
          className="pressable grid h-9 w-9 place-items-center rounded-full glass text-lg font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}
