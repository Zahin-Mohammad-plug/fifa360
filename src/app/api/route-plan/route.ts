import { NextResponse } from "next/server";
import { MOCK_MATCHES, MOCK_VENUES } from "@/lib/mock-data";
import type { RoutePlan, RouteStep } from "@/lib/types";

type Mode = "walking" | "transit" | "driving";

const baseTime: Record<Mode, number> = {
  walking: 28,
  transit: 18,
  driving: 12,
};

function stepsFor(mode: Mode, venueName: string): RouteStep[] {
  if (mode === "walking") {
    return [
      { instruction: "Walk west on Mission St", durationMinutes: 10, mode: "walking" },
      { instruction: "Cut through Dolores Park", durationMinutes: 8, mode: "walking" },
      { instruction: `Arrive at ${venueName}`, durationMinutes: 10, mode: "walking" },
    ];
  }
  if (mode === "driving") {
    return [
      { instruction: "Head south on Valencia St", durationMinutes: 3, mode: "driving" },
      { instruction: "Merge onto US-101 N", durationMinutes: 7, mode: "driving" },
      { instruction: `Park near ${venueName}`, durationMinutes: 2, mode: "driving" },
    ];
  }
  return [
    { instruction: "Walk to 24th St / Mission BART", durationMinutes: 5, mode: "walking" },
    { instruction: "Take Muni N to Downtown", durationMinutes: 9, mode: "transit" },
    { instruction: `Walk to ${venueName}`, durationMinutes: 4, mode: "walking" },
  ];
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    venueId?: string;
    matchId?: string;
    mode?: Mode;
  };

  const mode: Mode = body.mode ?? "transit";
  const venue = MOCK_VENUES.find((v) => v.id === body.venueId) ?? MOCK_VENUES[0];
  const match = MOCK_MATCHES.find((m) => m.id === body.matchId) ?? MOCK_MATCHES[0];

  const travelMinutes = baseTime[mode];
  const kickoff = new Date(match.kickoffUTC);
  const arrivalTime = new Date(kickoff.getTime() - 15 * 60 * 1000);
  const departureTime = new Date(arrivalTime.getTime() - travelMinutes * 60 * 1000);

  const plan: RoutePlan = {
    venueId: venue.id,
    matchId: match.id,
    departureTime: departureTime.toISOString(),
    arrivalTime: arrivalTime.toISOString(),
    mode,
    steps: stepsFor(mode, venue.name),
    notificationScheduled: false,
  };

  const departureBrief = `Leave by ${departureTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  })} to make kickoff with ~15 minutes to spare. ${mode === "transit"
    ? "Transit is reliable on this corridor and avoids matchday traffic."
    : mode === "driving"
      ? "Driving is the fastest option but parking near the venue fills up early."
      : "Walking is scenic but pack water — it's the longest option."}`;

  return NextResponse.json({ plan, departureBrief, travelMinutes });
}
