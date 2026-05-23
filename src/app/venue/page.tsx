"use client";

import { motion } from "framer-motion";
import { Search, Sparkles, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { VenueCard } from "@/components/VenueCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Chip } from "@/components/ui/Chip";
import { PageHeading } from "@/components/ui/PageHeading";
import { Skeleton } from "@/components/ui/misc";
import { useProfile } from "@/hooks/useProfile";
import { getMatch, getNextUpcomingMatch } from "@/lib/mock-data";
import type { Venue } from "@/lib/types";

const ATMOS = ["all", "casual", "lively", "electric"] as const;
const PRICES = [
  { v: "all", label: "Any price" },
  { v: "1", label: "$" },
  { v: "2", label: "$$" },
  { v: "3", label: "$$$" },
];

function VenueList() {
  const params = useSearchParams();
  const { profile, ready } = useProfile();
  const matchId = params.get("matchId") || getNextUpcomingMatch().id;
  const match = getMatch(matchId) || getNextUpcomingMatch();

  const [atmosphere, setAtmosphere] = useState<string>("all");
  const [price, setPrice] = useState<string>("all");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [meta, setMeta] = useState<{ embeddings?: string; reasons?: string; via?: string }>({});

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setVenues(null);
    (async () => {
      const qs = new URLSearchParams({ matchId });
      if (atmosphere !== "all") qs.set("atmosphere", atmosphere);
      if (price !== "all") qs.set("price", price);
      if (debouncedQ) qs.set("q", debouncedQ);
      try {
        const base = await (await fetch(`/api/venue?${qs.toString()}`)).json();
        const res = await fetch("/api/venue/rank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ venues: base, profile, matchId }),
        });
        const data = await res.json();
        if (!cancelled) {
          setVenues(data.venues as Venue[]);
          setMeta({ via: data.via, ...(data.meta || {}) });
        }
      } catch {
        if (!cancelled) setVenues([]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, atmosphere, price, debouncedQ, matchId, profile.watchStyle, profile.budgetRange]);

  const activeFilters = useMemo(
    () => (atmosphere !== "all" ? 1 : 0) + (price !== "all" ? 1 : 0) + (debouncedQ ? 1 : 0),
    [atmosphere, price, debouncedQ],
  );

  return (
    <div className="space-y-5">
      <PageHeading
        title="Find your venue"
        subtitle={`${match.homeTeam.name} vs ${match.awayTeam.name} · ${match.city}`}
      />

      {/* Search */}
      <div className="glass flex items-center gap-2 rounded-2xl px-3.5 py-2.5">
        <Search className="h-4 w-4 text-white/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search bars, fan zones, amenities…"
          className="w-full bg-transparent text-sm placeholder:text-white/35 focus:outline-none"
        />
      </div>

      {/* Filters */}
      <div className="space-y-2.5">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 hide-scrollbar">
          {ATMOS.map((a) => (
            <Chip key={a} active={atmosphere === a} onClick={() => setAtmosphere(a)}>
              {a === "all" ? "All vibes" : a.charAt(0).toUpperCase() + a.slice(1)}
            </Chip>
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 hide-scrollbar">
          {PRICES.map((p) => (
            <Chip key={p.v} active={price === p.v} onClick={() => setPrice(p.v)}>
              {p.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* AI banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pitch-400/15 to-electric-400/10 px-3.5 py-2.5"
      >
        <Sparkles className="h-4 w-4 shrink-0 text-pitch-300" />
        <p className="text-xs text-white/70">
          Ranked for your <span className="font-semibold text-white">{profile.watchStyle}</span> style
          {activeFilters > 0 && (
            <span className="inline-flex items-center gap-1 text-white/45">
              {" "}
              · <SlidersHorizontal className="inline h-3 w-3" />
              {activeFilters} filter{activeFilters > 1 ? "s" : ""}
            </span>
          )}
        </p>
        {meta.embeddings && (
          <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
            {meta.embeddings === "gmi" ? "GMI Cloud" : "semantic"}
          </span>
        )}
      </motion.div>

      {/* Results */}
      <div className="space-y-4">
        {venues === null ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
        ) : venues.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-sm font-semibold">No venues match those filters</p>
            <p className="mt-1 text-xs text-white/50">Try widening the vibe or price.</p>
          </GlassCard>
        ) : (
          venues.map((v, i) => (
            <VenueCard key={v.id} venue={v} index={i} href={`/venue/${v.id}?matchId=${matchId}`} />
          ))
        )}
      </div>
    </div>
  );
}

export default function VenuePage() {
  return (
    <Suspense fallback={<div className="space-y-4 pt-10"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-64 w-full" /></div>}>
      <VenueList />
    </Suspense>
  );
}
