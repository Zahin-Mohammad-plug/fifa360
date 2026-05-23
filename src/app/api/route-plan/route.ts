import { NextResponse } from "next/server";
import { MODELS, claudeText } from "@/lib/anthropic";
import { DEMO_USER_LOCATION, getMatch, getVenue } from "@/lib/mock-data";
import { buildRoutePlan } from "@/lib/routing";
import { formatClock } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MODE_WORD = { walking: "walk", transit: "transit ride", driving: "drive" } as const;

// POST /api/route-plan  body: { venueId, matchId, userLocation, mode }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { venueId, matchId, userLocation, mode = "transit" } = body as {
    venueId: string;
    matchId: string;
    userLocation?: { lat: number; lng: number };
    mode?: "walking" | "transit" | "driving";
  };

  const venue = getVenue(venueId);
  const match = getMatch(matchId);
  if (!venue || !match) {
    return NextResponse.json({ error: "Unknown venue or match" }, { status: 404 });
  }

  const loc = userLocation && Number.isFinite(userLocation.lat) ? userLocation : DEMO_USER_LOCATION;
  const plan = buildRoutePlan({ venue, match, userLocation: loc, mode });

  const fallbackBriefing = `Leave by ${formatClock(plan.departureTime)}. It's about a ${plan.travelMinutes}-minute ${MODE_WORD[mode]} to ${venue.name}. ${match.homeTeam.name} vs ${match.awayTeam.name} is a big one — expect crowds, so the 30-minute buffer is built in.`;

  const { text: briefing, live } = await claudeText({
    model: MODELS.HAIKU,
    maxTokens: 180,
    temperature: 0.7,
    system: "You are a helpful matchday assistant.",
    messages: [
      {
        role: "user",
        content: `Generate a friendly 2-3 sentence departure briefing.
Match: ${match.homeTeam.name} vs ${match.awayTeam.name} at ${formatClock(match.kickoffUTC)}
Venue: ${venue.name} (${venue.address})
Route: ${mode}, ${plan.travelMinutes} minutes
Buffer: 30 minutes recommended
Keep it conversational, specific, and action-oriented.`,
      },
    ],
    fallback: fallbackBriefing,
  });

  return NextResponse.json({ ...plan, briefing, briefingLive: live });
}
