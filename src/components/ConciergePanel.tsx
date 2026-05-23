"use client";

import { ConciergeResult } from "@/types";
import { Phone, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  concierge: ConciergeResult;
  isDemo?: boolean;
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 85 ? "bg-emerald-400" : pct >= 65 ? "bg-amber-400" : "bg-orange-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-white/40 tabular-nums">{pct}%</span>
    </div>
  );
}

function FieldRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[11px] text-white/40">{label}</span>
      <span className={cn("text-[11px] font-semibold", highlight ? "text-cyan-300" : "text-white/70")}>
        {value}
      </span>
    </div>
  );
}

function formatCalledAt(iso: string): string {
  try {
    const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff === 1) return "1 min ago";
    if (diff < 60) return `${diff} min ago`;
    return `${Math.round(diff / 60)}h ago`;
  } catch {
    return "recently";
  }
}

const CAPACITY_LABELS: Record<string, string> = {
  low: "Plenty of room",
  medium: "Filling up",
  high: "Getting busy",
  "full-soon": "⚠ Likely full early",
};

const RSVP_LABELS: Record<string, string> = {
  yes: "✓ RSVP available",
  no: "Walk-in only",
  unclear: "Check directly",
};

export function ConciergePanel({ concierge, isDemo = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-violet-500/25 bg-violet-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-violet-500/15">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Phone className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-violet-300">Concierge Call</div>
            <div className="flex items-center gap-1 text-[10px] text-white/30">
              <Clock className="w-2.5 h-2.5" />
              Called {formatCalledAt(concierge.calledAt)}
              {isDemo && <span className="ml-1 text-amber-400/60">· demo</span>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/30 mb-1">Confidence</div>
          <ConfidenceMeter value={concierge.confidence} />
        </div>
      </div>

      {/* Crowd summary — always visible */}
      <div className="px-4 py-3">
        <p className="text-xs text-white/70 leading-relaxed">{concierge.crowdSummary}</p>
        {concierge.teamCrowdSignal && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-cyan-300/80 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
              ⚽ {concierge.teamCrowdSignal} crowd
            </span>
          </div>
        )}
      </div>

      {/* Key quick facts */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/8">
          <div className="text-[9px] text-white/30 mb-0.5">RSVP</div>
          <div className="text-[11px] font-bold text-white/80">
            {RSVP_LABELS[concierge.rsvpAvailable] ?? concierge.rsvpAvailable}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/8">
          <div className="text-[9px] text-white/30 mb-0.5">Capacity</div>
          <div className="text-[11px] font-bold text-white/80">
            {CAPACITY_LABELS[concierge.capacityStatus] ?? concierge.capacityStatus}
          </div>
        </div>
      </div>

      {/* Expand / collapse detailed fields */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-center gap-1 py-2.5 border-t border-white/5 text-[11px] text-white/30 hover:text-white/50 transition-colors"
      >
        {expanded ? (
          <>Less detail <ChevronUp className="w-3 h-3" /></>
        ) : (
          <>More detail <ChevronDown className="w-3 h-3" /></>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-0">
          {concierge.maxPartySize !== undefined && (
            <FieldRow label="Max party size" value={`${concierge.maxPartySize} people`} />
          )}
          {concierge.recommendedArrival && (
            <FieldRow label="Arrive by" value={concierge.recommendedArrival} highlight />
          )}
          {concierge.seatingMode && (
            <FieldRow label="Seating" value={concierge.seatingMode} />
          )}
          {concierge.audioConfirmed !== undefined && (
            <FieldRow
              label="Match audio"
              value={concierge.audioConfirmed ? "Confirmed on" : "Not confirmed"}
              highlight={concierge.audioConfirmed}
            />
          )}
          {concierge.specialConditions && (
            <FieldRow label="Special conditions" value={concierge.specialConditions} />
          )}
        </div>
      )}
    </div>
  );
}
