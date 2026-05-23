"use client";

import { motion } from "framer-motion";
import { Beer, Building2, Flame, Sparkles, Star, UtensilsCrossed, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GlassCard } from "./ui/GlassCard";
import { cn, priceLabel } from "@/lib/utils";
import type { Venue } from "@/lib/types";

const TYPE_META: Record<Venue["type"], { icon: typeof Beer; label: string; tint: string }> = {
  bar: { icon: Beer, label: "Sports Bar", tint: "from-amber-500/30 to-orange-700/30" },
  restaurant: { icon: UtensilsCrossed, label: "Restaurant", tint: "from-rose-500/30 to-pink-700/30" },
  fan_zone: { icon: Flame, label: "Fan Zone", tint: "from-emerald-500/30 to-teal-700/30" },
  stadium_adjacent: { icon: Building2, label: "Stadium Plaza", tint: "from-sky-500/30 to-indigo-700/30" },
};

const ATMOS_META: Record<Venue["atmosphere"], string> = {
  casual: "bg-slate-400/15 text-slate-200",
  lively: "bg-electric-400/15 text-electric-200",
  electric: "bg-trophy-400/15 text-trophy-200",
};

export function VenueCard({
  venue,
  index = 0,
  href,
}: {
  venue: Venue;
  index?: number;
  href?: string;
}) {
  const [imgOk, setImgOk] = useState(true);
  const meta = TYPE_META[venue.type];
  const Icon = meta.icon;
  const rankPct = venue.aiRankScore != null ? Math.round(venue.aiRankScore * 100) : null;

  const card = (
    <GlassCard
      interactive
      whileHover={{ y: -4 }}
      className="overflow-hidden"
    >
      {/* Image / gradient header */}
      <div className={cn("relative h-32 w-full bg-gradient-to-br", meta.tint)}>
        {venue.imageUrl && imgOk && (
          <img
            src={venue.imageUrl}
            alt={venue.name}
            loading="lazy"
            onError={() => setImgOk(false)}
            className="h-full w-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* type badge */}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </div>

        {/* rank score ring */}
        {rankPct != null && (
          <div className="absolute right-3 top-3 grid h-12 w-12 place-items-center rounded-full bg-black/45 backdrop-blur">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
              <motion.circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="url(#rankgrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 20}
                initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - rankPct / 100) }}
                transition={{ duration: 1, delay: 0.2 + index * 0.05, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="rankgrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xs font-bold tabular-nums">{rankPct}</span>
          </div>
        )}

        {/* name overlaid */}
        <div className="absolute inset-x-3 bottom-2.5">
          <h3 className="truncate text-base font-bold drop-shadow">{venue.name}</h3>
          <p className="truncate text-[11px] text-white/70">{venue.address}</p>
        </div>
      </div>

      {/* body */}
      <div className="space-y-2.5 p-3.5">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className={cn("rounded-full px-2 py-0.5 font-medium capitalize", ATMOS_META[venue.atmosphere])}>
            {venue.atmosphere}
          </span>
          <span className="inline-flex items-center gap-1 text-white/60">
            <Users className="h-3 w-3" /> {venue.capacity}
          </span>
          <span className="text-pitch-300">{priceLabel(venue.priceRange)}</span>
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-trophy-300">
            <Star className="h-3.5 w-3.5 fill-current" /> {venue.rating}
          </span>
        </div>

        {venue.aiRankReason && (
          <div className="flex items-start gap-1.5 rounded-xl bg-pitch-400/10 p-2 text-[11px] leading-snug text-pitch-100">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pitch-300" />
            <span>{venue.aiRankReason}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {venue.amenities.slice(0, 3).map((a) => (
            <span key={a} className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] text-white/55">
              {a}
            </span>
          ))}
        </div>
      </div>
    </GlassCard>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 240, damping: 24 }}
    >
      {href ? <Link href={href}>{card}</Link> : card}
    </motion.div>
  );
}
