import { NextResponse } from "next/server";
import { rankVenues } from "@/lib/rocketride-server";
import type { Venue, UserPreferences } from "@/types";

/**
 * POST /api/rocketride/venue-rank
 *
 * Body: { venues: Venue[], preferences: UserPreferences, matchContext?: string }
 * Returns: { rankings: Array<{ venueId, aiRankScore, aiRankReason }> }
 */

export async function POST(request: Request) {
  let body: { venues: Venue[]; preferences: UserPreferences; matchContext?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { venues, preferences, matchContext } = body;
  if (!venues?.length || !preferences) {
    return NextResponse.json({ error: "Missing venues or preferences" }, { status: 400 });
  }

  const fanProfile = JSON.stringify({
    partySize: preferences.partySize,
    vibe: preferences.preferredVibe,
    indoorOutdoor: preferences.indoorOutdoor,
    budget: preferences.budgetSensitivity,
    transport: preferences.transportMode,
    teamPreference: preferences.teamPreference,
    matchContext: matchContext ?? "",
  });

  const venueList = JSON.stringify(
    venues.map((v) => ({
      venueId: v.id,
      name: v.name,
      affiliation: v.affiliation,
      vibeTags: v.vibeTags,
      teamAffinityTags: v.teamAffinityTags,
      density: v.density,
      priceLevel: v.priceLevel,
      distanceKm: v.distanceKm,
      trustLevel: v.trustLevel,
    }))
  );

  try {
    const rankings = await rankVenues(fanProfile, venueList);
    return NextResponse.json({ rankings });
  } catch (err) {
    console.error("[venue-rank]", err);
    return NextResponse.json({ error: "Pipeline error" }, { status: 500 });
  }
}
