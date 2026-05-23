"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VenueCard from "@/components/VenueCard";
import MatchCard from "@/components/MatchCard";
import { DEMO_PROFILE, MOCK_MATCHES } from "@/lib/mock-data";
import type { FanProfile, Match, Venue } from "@/lib/types";

type FilterAtmosphere = "all" | "electric" | "lively" | "casual";
type FilterType = "all" | "bar" | "restaurant" | "fan_zone";

export default function VenuePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-400">Loading…</div>
        </div>
      }
    >
      <VenueContent />
    </Suspense>
  );
}

function VenueContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId") ?? MOCK_MATCHES[0]?.id;

  const [venues, setVenues] = useState<Venue[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(false);
  const [atmosphere, setAtmosphere] = useState<FilterAtmosphere>("all");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  const rankVenues = useCallback(async (rawVenues: Venue[]) => {
    setRanking(true);
    try {
      let profile: FanProfile = DEMO_PROFILE;
      try {
        const stored = localStorage.getItem("fanProfile");
        if (stored) profile = JSON.parse(stored);
      } catch {
        // ignore
      }

      const res = await fetch("/api/venue/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, venues: rawVenues.map((v) => v.id) }),
      });
      const data = await res.json();
      if (data.venues) setVenues(data.venues);
    } catch {
      setVenues(rawVenues);
    } finally {
      setRanking(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadVenues = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/venue?matchId=${matchId}`);
        const data = await res.json();
        if (cancelled) return;
        setMatch(data.match ?? MOCK_MATCHES.find((m) => m.id === matchId) ?? null);
        await rankVenues(data.venues ?? []);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadVenues();
    return () => {
      cancelled = true;
    };
  }, [matchId, rankVenues]);

  const filtered = venues.filter((v) => {
    if (atmosphere !== "all" && v.atmosphere !== atmosphere) return false;
    if (typeFilter !== "all" && v.type !== typeFilter) return false;
    return true;
  });

  const handleCallBook = (venueId: string, mId: string) => {
    window.dispatchEvent(
      new CustomEvent("open-voice-modal", { detail: { venueId, matchId: mId } }),
    );
  };

  return (
    <div className="page-enter min-h-screen">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 sticky top-0 z-10 backdrop-blur">
        <div className="page-container pt-10 pb-4">
          <h1 className="text-xl font-black mb-1">🏟️ Venue Finder</h1>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            {ranking ? (
              <>
                <span className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin inline-block" />
                AI ranking for your profile…
              </>
            ) : (
              `${filtered.length} venues · AI-ranked for you`
            )}
          </p>
        </div>
      </div>

      <div className="page-container pt-3">
        {match && (
          <div className="mb-3">
            <MatchCard match={match} compact />
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {(["all", "electric", "lively", "casual"] as FilterAtmosphere[]).map((f) => (
            <button
              key={f}
              onClick={() => setAtmosphere(f)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                atmosphere === f
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400"
              }`}
            >
              {f === "all"
                ? "🌍 All"
                : f === "electric"
                  ? "⚡ Electric"
                  : f === "lively"
                    ? "🔥 Lively"
                    : "😌 Casual"}
            </button>
          ))}
          {(["bar", "restaurant", "fan_zone"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter((t) => (t === f ? "all" : f))}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                typeFilter === f
                  ? "bg-purple-700 border-purple-600 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400"
              }`}
            >
              {f === "bar" ? "🍺 Bar" : f === "restaurant" ? "🍽️ Restaurant" : "🏟️ Fan Zone"}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mt-2 pb-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-gray-800 rounded-2xl animate-pulse" />
              ))
            : filtered.length === 0
              ? (
                  <div className="sm:col-span-2 text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">🏜️</div>
                    <p>No venues match your filters</p>
                  </div>
                )
              : filtered.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    matchId={matchId ?? undefined}
                    onCallBook={handleCallBook}
                  />
                ))}
        </div>
      </div>
    </div>
  );
}
