"use client";

import { motion } from "framer-motion";
import { Bell, BellRing, Bus, Car, Clock, Footprints, Share2, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { MapView } from "@/components/MapView";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeading } from "@/components/ui/PageHeading";
import { Skeleton } from "@/components/ui/misc";
import { useToast } from "@/components/ui/Toast";
import { useNotifications } from "@/hooks/useNotifications";
import { DEMO_USER_LOCATION, getMatch, getNextUpcomingMatch, getVenue } from "@/lib/mock-data";
import { formatClock, formatKm } from "@/lib/utils";
import type { RoutePlan } from "@/lib/types";

type Mode = "walking" | "transit" | "driving";
type Plan = RoutePlan & { briefing?: string; briefingLive?: boolean; distanceKm?: number; travelMinutes?: number };

const MODES: { mode: Mode; label: string; icon: typeof Bus }[] = [
  { mode: "walking", label: "Walk", icon: Footprints },
  { mode: "transit", label: "Transit", icon: Bus },
  { mode: "driving", label: "Drive", icon: Car },
];

function RoutePlanner() {
  const params = useSearchParams();
  const { toast } = useToast();
  const { requestPermission, scheduleDeparture } = useNotifications();

  const venueId = params.get("venueId") || "";
  const matchId = params.get("matchId") || getNextUpcomingMatch().id;
  const shared = params.get("shared") === "1";
  const initialMode = (params.get("mode") as Mode) || "transit";

  const venue = getVenue(venueId);
  const match = getMatch(matchId) || getNextUpcomingMatch();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!venue) return;
    let cancelled = false;
    setPlan(null);
    (async () => {
      try {
        const res = await fetch("/api/route-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ venueId, matchId, userLocation: DEMO_USER_LOCATION, mode }),
        });
        const data = await res.json();
        if (!cancelled) setPlan(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [venueId, matchId, mode, venue]);

  if (!venue) {
    return (
      <div className="pt-10">
        <PageHeading title="Plan a route" back />
        <GlassCard className="p-8 text-center text-sm text-white/60">
          Pick a venue first, then tap "Get Directions".
        </GlassCard>
      </div>
    );
  }

  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    const granted = await requestPermission();
    const { notifyAt, fireInMs } = await scheduleDeparture(plan, match, venue, { demoCapMs: 6000 });
    setSaved(true);
    setSaving(false);
    if (granted) {
      toast(`Departure alert set for ${formatClock(notifyAt)}`, {
        description: `We'll ping you in ~${Math.max(1, Math.round(fireInMs / 1000))}s (demo mode)`,
        kind: "success",
      });
    } else {
      toast("Plan saved", {
        description: "Allow notifications to get the leave-now alert.",
        kind: "info",
      });
    }
  };

  const handleShare = async () => {
    const url = (typeof window !== "undefined" ? window.location.origin : "") + (plan?.shareUrl || "");
    const text = `Watching ${match.homeTeam.name} vs ${match.awayTeam.name} at ${venue.name}!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My FIFA 360 matchday plan", text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Link copied to clipboard!", { kind: "success" });
      }
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <div className="space-y-5 pb-4">
      <PageHeading title="Get there" subtitle={venue.name} back />

      {shared && (
        <div className="rounded-2xl bg-electric-400/15 px-3.5 py-2 text-xs text-electric-200">
          📤 You're viewing a shared matchday plan
        </div>
      )}

      {/* Mode tabs */}
      <div className="glass flex rounded-2xl p-1">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.mode;
          return (
            <button
              key={m.mode}
              onClick={() => setMode(m.mode)}
              className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-medium"
            >
              {active && (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-white/15"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className={`relative h-4 w-4 ${active ? "text-pitch-300" : "text-white/50"}`} />
              <span className={`relative ${active ? "text-white" : "text-white/50"}`}>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Map */}
      {plan ? (
        <MapView
          venue={venue}
          mode={mode}
          etaMinutes={plan.travelMinutes ?? 0}
          distanceLabel={formatKm(plan.distanceKm ?? 0)}
        />
      ) : (
        <Skeleton className="h-56 w-full" />
      )}

      {/* Departure / arrival */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-trophy-300">
            <Clock className="h-3.5 w-3.5" /> Leave by
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums">
            {plan ? formatClock(plan.departureTime) : "—"}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-pitch-300">
            <Clock className="h-3.5 w-3.5" /> Arrive
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums">
            {plan ? formatClock(plan.arrivalTime) : "—"}
          </p>
        </GlassCard>
      </div>

      {/* Briefing */}
      {plan?.briefing && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="flex items-start gap-3 p-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-electric-400/20 text-electric-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-electric-300">
                Departure briefing
              </p>
              <p className="mt-0.5 text-sm text-white/85">{plan.briefing}</p>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Steps */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Route</p>
        <div className="relative space-y-2 pl-1">
          {plan
            ? plan.steps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex flex-col items-center">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-pitch-400/20 text-xs font-bold text-pitch-200">
                      {i + 1}
                    </span>
                    {i < plan.steps.length - 1 && <span className="my-0.5 h-6 w-px bg-white/15" />}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm text-white/85">{s.instruction}</p>
                    <p className="text-[11px] text-white/45">
                      {s.durationMinutes} min · {s.mode}
                    </p>
                  </div>
                </motion.div>
              ))
            : Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2.5 pt-1">
        <Button
          onClick={handleSave}
          loading={saving}
          fullWidth
          size="lg"
          variant={saved ? "glass" : "primary"}
          leftIcon={saved ? <BellRing className="h-5 w-5 text-pitch-300" /> : <Bell className="h-5 w-5" />}
        >
          {saved ? "Alert scheduled" : "Save Plan + Notify Me"}
        </Button>
        <Button onClick={handleShare} variant="glass" fullWidth size="lg" leftIcon={<Share2 className="h-5 w-5" />}>
          Share Plan
        </Button>
      </div>
    </div>
  );
}

export default function RoutePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 pt-10">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-56 w-full" />
        </div>
      }
    >
      <RoutePlanner />
    </Suspense>
  );
}
