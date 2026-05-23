import { NextResponse } from "next/server";
import { buildLiveState, getMatch } from "@/lib/mock-data";
import { clamp } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/live?matchId=  → LiveMatchState (simulated minute progression)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const matchId = url.searchParams.get("matchId") || "m-arg-fra";
  const match = getMatch(matchId);

  if (!match) {
    return NextResponse.json({ error: "Unknown match" }, { status: 404 });
  }

  // Derive the live minute from kickoff so the demo "ticks" on its own.
  const elapsedMin = Math.floor((Date.now() - +new Date(match.kickoffUTC)) / 60000);
  const minute = clamp(elapsedMin, 1, 90);
  const state = buildLiveState(minute);

  return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
}
