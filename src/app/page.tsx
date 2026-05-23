"use client";

import { motion } from "framer-motion";
import { Compass, MapPinned, Navigation, Radio, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { VenueCard } from "@/components/VenueCard";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader, Skeleton } from "@/components/ui/misc";
import { useProfile } from "@/hooks/useProfile";
import { TEAMS, getLiveMatch, getNextUpcomingMatch } from "@/lib/mock-data";
import type { Venue } from "@/lib/types";

const PHASES = [
  { icon: Compass, label: "Find", desc: "Best venue", href: "/venue", tint: "text-pitch-300" },
  { icon: Navigation, label: "Get There", desc: "On time", href: "/venue", tint: "text-electric-300" },
  { icon: Radio, label: "Follow", desc: "Live", href: "/live", tint: "text-trophy-300" },
];

export default function HomePage() {
  const { profile, isOnboarded, ready } = useProfile();
  const [picks, setPicks] = useState<Venue[] | null>(null);

  const nextMatch = getNextUpcomingMatch();
  const liveMatch = getLiveMatch();
  const favTeam = profile.favoriteTeams[0] ? TEAMS[profile.favoriteTeams[0]] : undefined;

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      try {
        const venues = await (await fetch("/api/venue")).json();
        const res = await fetch("/api/venue/rank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ venues, profile, matchId: nextMatch.id }),
        });
        const data = await res.json();
        if (!cancelled) setPicks((data.venues as Venue[]).slice(0, 3));
      } catch {
        if (!cancelled) setPicks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, profile.watchStyle, profile.budgetRange, profile.favoriteTeams.join(",")]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-7">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            <span className="gradient-text-animated">FIFA 360</span>
          </h1>
          <p className="text-xs text-white/45">{greeting}{favTeam ? `, ${favTeam.name} fan ${favTeam.flag}` : ""}</p>
        </div>
        <Link
          href="/profile"
          className="focus-ring pressable grid h-11 w-11 place-items-center rounded-full glass text-lg"
          aria-label="Profile"
        >
          {favTeam ? favTeam.flag : <UserRound className="h-5 w-5" />}
        </Link>
      </motion.header>

      {/* Onboarding nudge */}
      {ready && !isOnboarded && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <Link href="/profile/onboarding">
            <GlassCard strong interactive className="flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-pitch-400/20 text-pitch-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Personalize your matchday</p>
                <p className="text-xs text-white/55">Pick your teams to unlock AI venue picks</p>
              </div>
              <span className="text-pitch-300">→</span>
            </GlassCard>
          </Link>
        </motion.div>
      )}

      {/* Next match hero */}
      <section>
        <SectionHeader title="Next Match" caption="Your team's upcoming fixture" />
        <MatchCard match={nextMatch} variant="hero" href={`/venue?matchId=${nextMatch.id}`} />
      </section>

      {/* Three-phase strip */}
      <section className="grid grid-cols-3 gap-2.5">
        {PHASES.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <Link href={p.href}>
                <GlassCard interactive className="flex flex-col items-center gap-1 p-3 text-center">
                  <Icon className={`h-5 w-5 ${p.tint}`} />
                  <span className="text-xs font-semibold">{p.label}</span>
                  <span className="text-[10px] text-white/45">{p.desc}</span>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </section>

      {/* Live now */}
      {liveMatch && (
        <section>
          <SectionHeader title="Live Now" caption="A match is in progress" />
          <MatchCard match={liveMatch} href="/live" />
        </section>
      )}

      {/* Your picks */}
      <section>
        <SectionHeader
          title={favTeam ? `Watching ${favTeam.name}? Try these` : "Top picks for you"}
          caption="AI-ranked for your profile"
          action={
            <Link href={`/venue?matchId=${nextMatch.id}`} className="text-xs font-semibold text-pitch-300">
              See all
            </Link>
          }
        />
        <div className="space-y-4">
          {picks === null
            ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
            : picks.map((v, i) => (
                <VenueCard key={v.id} venue={v} index={i} href={`/venue/${v.id}?matchId=${nextMatch.id}`} />
              ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3 pt-1">
        <Button href={`/venue?matchId=${nextMatch.id}`} size="lg" leftIcon={<MapPinned className="h-5 w-5" />}>
          Find Venue
        </Button>
        <Button href="/live" size="lg" variant="glass" leftIcon={<Radio className="h-5 w-5" />}>
          Go Live
        </Button>
      </section>
    </div>
  );
}
