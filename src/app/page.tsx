"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MatchCard from "@/components/MatchCard";
import { MOCK_MATCHES, DEMO_PROFILE } from "@/lib/mock-data";
import type { FanProfile } from "@/lib/types";

export default function HomePage() {
  const [profile, setProfile] = useState<FanProfile>(DEMO_PROFILE);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fanProfile");
      if (stored) setProfile(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const liveMatch = MOCK_MATCHES.find((m) => m.status === "live");
  const upcomingMatches = MOCK_MATCHES.filter((m) => m.status === "upcoming");

  return (
    <div className="page-enter min-h-screen bg-gray-950">
      <div className="bg-gradient-to-b from-blue-950 to-gray-950 pt-10 pb-6">
        <div className="page-container flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">
              FIFA 360 <span className="text-blue-400">⚽</span>
            </h1>
            <p className="text-sm text-gray-400">Hey {profile.name ?? "Fan"} · Matchday OS</p>
          </div>
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-lg"
          >
            {profile.favoriteTeams[0] === "bra" ? "🇧🇷" : profile.favoriteTeams[0] === "usa" ? "🇺🇸" : "⭐"}
          </Link>
        </div>
      </div>

      <div className="page-container space-y-6 pt-2">
        {liveMatch && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 live-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-red-400">Live Now</h2>
            </div>
            <Link href="/live">
              <MatchCard match={liveMatch} />
            </Link>
            <Link
              href={`/venue?matchId=${liveMatch.id}`}
              className="mt-2 block w-full text-center py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-sm font-semibold transition-colors"
            >
              Find a Venue Nearby
            </Link>
          </section>
        )}

        {upcomingMatches.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Coming Up</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {upcomingMatches.map((m) => (
                <Link key={m.id} href={`/venue?matchId=${m.id}`}>
                  <MatchCard match={m} compact />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/venue"
              className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-blue-600 transition-colors"
            >
              <div className="text-2xl mb-1">🏟️</div>
              <div className="font-semibold text-sm">Find Venue</div>
              <div className="text-xs text-gray-400 mt-0.5">AI-ranked for you</div>
            </Link>
            <Link
              href="/live"
              className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-red-600 transition-colors"
            >
              <div className="text-2xl mb-1">📺</div>
              <div className="font-semibold text-sm">Watch Live</div>
              <div className="text-xs text-gray-400 mt-0.5">Real-time updates</div>
            </Link>
            <Link
              href="/route"
              className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-green-600 transition-colors"
            >
              <div className="text-2xl mb-1">🗺️</div>
              <div className="font-semibold text-sm">Plan Route</div>
              <div className="text-xs text-gray-400 mt-0.5">Departure alerts</div>
            </Link>
            <Link
              href="/profile"
              className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-purple-600 transition-colors"
            >
              <div className="text-2xl mb-1">👤</div>
              <div className="font-semibold text-sm">My Profile</div>
              <div className="text-xs text-gray-400 mt-0.5">Teams &amp; preferences</div>
            </Link>
          </div>
        </section>

        <div className="text-center py-4 text-xs text-gray-600">
          FIFA 360 · Matchday Companion · Demo Build
        </div>
      </div>
    </div>
  );
}
