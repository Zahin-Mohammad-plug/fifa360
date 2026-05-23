"use client";

import { motion } from "framer-motion";
import { MessageSquareText, Navigation, Phone, Sparkles, Star, Users } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeading } from "@/components/ui/PageHeading";
import { Pill } from "@/components/ui/misc";
import { useProfile } from "@/hooks/useProfile";
import { DEMO_USER_LOCATION, getMatch, getNextUpcomingMatch, getVenue } from "@/lib/mock-data";
import { formatKm, haversineKm, priceLabel } from "@/lib/utils";
import type { Venue } from "@/lib/types";

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const { profile, ready } = useProfile();
  const matchId = params.get("matchId") || getNextUpcomingMatch().id;
  const match = getMatch(matchId) || getNextUpcomingMatch();
  const base = getVenue(id);

  const [venue, setVenue] = useState<Venue | undefined>(base);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    if (!ready || !base) return;
    (async () => {
      try {
        const res = await fetch("/api/venue/rank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ venues: [base], profile, matchId }),
        });
        const data = await res.json();
        setVenue(data.venues?.[0] ?? base);
      } catch {
        setVenue(base);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, id, profile.watchStyle, profile.budgetRange]);

  if (!base || !venue) {
    return (
      <div className="pt-10">
        <PageHeading title="Venue not found" back />
        <GlassCard className="p-8 text-center text-sm text-white/60">
          We couldn't find that venue.
        </GlassCard>
      </div>
    );
  }

  const distKm = haversineKm(DEMO_USER_LOCATION.lat, DEMO_USER_LOCATION.lng, venue.lat, venue.lng);
  const rankPct = venue.aiRankScore != null ? Math.round(venue.aiRankScore * 100) : null;

  return (
    <div className="space-y-5 pb-4">
      <PageHeading title={venue.name} subtitle={venue.type.replace("_", " ")} back />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative h-52 overflow-hidden rounded-3xl glass"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pitch-600/30 to-electric-700/30" />
        {venue.imageUrl && imgOk && (
          <img
            src={venue.imageUrl}
            alt={venue.name}
            onError={() => setImgOk(false)}
            className="h-full w-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-x-4 bottom-4">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-trophy-400/20 px-2.5 py-1 text-[11px] font-semibold capitalize text-trophy-200">
              {venue.atmosphere}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] backdrop-blur">
              <Star className="h-3 w-3 fill-trophy-300 text-trophy-300" /> {venue.rating}
            </span>
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-pitch-300 backdrop-blur">
              {priceLabel(venue.priceRange)}
            </span>
          </div>
          <h2 className="text-2xl font-black drop-shadow">{venue.name}</h2>
          <p className="text-xs text-white/70">{venue.address}</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Distance", value: formatKm(distKm) },
          { label: "Capacity", value: venue.capacity, icon: <Users className="h-3.5 w-3.5" /> },
          { label: "AI Match", value: rankPct != null ? `${rankPct}%` : "—" },
        ].map((s) => (
          <GlassCard key={s.label} className="p-3 text-center">
            <p className="text-[10px] uppercase tracking-wide text-white/45">{s.label}</p>
            <p className="mt-0.5 inline-flex items-center justify-center gap-1 text-sm font-bold capitalize">
              {s.icon}
              {s.value}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* AI reason */}
      {venue.aiRankReason && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="flex items-start gap-3 p-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pitch-400/20 text-pitch-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-pitch-300">Why it fits you</p>
              <p className="mt-0.5 text-sm text-white/85">{venue.aiRankReason}</p>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Amenities */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">What's inside</p>
        <div className="flex flex-wrap gap-2">
          {venue.amenities.map((a) => (
            <Pill key={a}>{a}</Pill>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-2.5 pt-1">
        <Button
          href={`/route?venueId=${venue.id}&matchId=${matchId}&mode=transit`}
          size="lg"
          fullWidth
          leftIcon={<Navigation className="h-5 w-5" />}
        >
          Get Directions
        </Button>
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            href={`/venue/${venue.id}/concierge?matchId=${matchId}`}
            variant="glass"
            size="lg"
            leftIcon={<MessageSquareText className="h-5 w-5" />}
          >
            Ask Concierge
          </Button>
          <Button
            href={`tel:${venue.phone ?? ""}`}
            variant="glass"
            size="lg"
            leftIcon={<Phone className="h-5 w-5" />}
          >
            Call
          </Button>
        </div>
        <p className="text-center text-[11px] text-white/40">
          {match.homeTeam.flag} {match.homeTeam.name} vs {match.awayTeam.name} {match.awayTeam.flag}
        </p>
      </div>
    </div>
  );
}
