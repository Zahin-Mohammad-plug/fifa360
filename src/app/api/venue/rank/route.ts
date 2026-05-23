import { NextResponse } from "next/server";
import { MOCK_VENUES } from "@/lib/mock-data";
import type { FanProfile, Venue } from "@/lib/types";

function rankReason(venue: Venue, profile: FanProfile): string {
  const matches: string[] = [];
  if (profile.watchStyle === "social" && venue.atmosphere === "electric") matches.push("electric atmosphere for social fans");
  if (profile.watchStyle === "focused" && venue.atmosphere === "casual") matches.push("quieter spot to focus on the match");
  if (profile.watchStyle === "family" && venue.type === "fan_zone") matches.push("family-friendly fan zone");
  if (venue.priceRange <= profile.budgetRange) matches.push("fits your budget");
  if (venue.rsvpAvailable) matches.push("RSVP available");
  if (matches.length === 0) return "Solid choice for tonight";
  return matches.slice(0, 2).join(" · ");
}

function scoreVenue(venue: Venue, profile: FanProfile): number {
  let score = 0.5 + venue.rating / 10; // baseline from rating
  if (profile.watchStyle === "social" && venue.atmosphere === "electric") score += 0.18;
  if (profile.watchStyle === "focused" && venue.atmosphere === "casual") score += 0.18;
  if (profile.watchStyle === "family" && venue.type === "fan_zone") score += 0.16;
  if (venue.priceRange <= profile.budgetRange) score += 0.1;
  if (venue.rsvpAvailable) score += 0.05;
  return Math.min(0.99, Math.max(0.4, score));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    profile?: FanProfile;
    venues?: string[];
  };

  const profile: FanProfile = body.profile ?? {
    userId: "anon",
    favoriteTeams: [],
    watchStyle: "social",
    budgetRange: 2,
    maxTravelMinutes: 30,
    notificationsEnabled: false,
    departureAlertMinutes: 60,
  };

  const ids = body.venues && body.venues.length > 0 ? body.venues : MOCK_VENUES.map((v) => v.id);
  const ranked = ids
    .map((id) => MOCK_VENUES.find((v) => v.id === id))
    .filter(Boolean)
    .map((venue) => ({
      ...(venue as Venue),
      aiRankScore: scoreVenue(venue as Venue, profile),
      aiRankReason: rankReason(venue as Venue, profile),
    }))
    .sort((a, b) => (b.aiRankScore ?? 0) - (a.aiRankScore ?? 0));

  return NextResponse.json({ venues: ranked });
}
