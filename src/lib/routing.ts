// Shared route-plan construction. SERVER-ONLY (pure, no secrets — safe anywhere).
import type { Match, RoutePlan, RouteStep, Venue } from "./types";
import { estimateMinutes, formatKm, haversineKm } from "./utils";

type Mode = "walking" | "transit" | "driving";
type LatLng = { lat: number; lng: number };

const TRANSIT_LINES = ["J-Church", "F-Market", "14-Mission", "N-Judah", "22-Fillmore"];

function splitDurations(total: number, parts: number): number[] {
  const base = Math.max(1, Math.floor(total / parts));
  const arr = new Array(parts).fill(base);
  let used = base * parts;
  let i = 0;
  while (used < total) {
    arr[i % parts] += 1;
    used += 1;
    i += 1;
  }
  return arr;
}

export function buildSteps(mode: Mode, totalMin: number, venue: Venue, km: number): RouteStep[] {
  if (mode === "walking") {
    const d = splitDurations(totalMin, 3);
    return [
      { instruction: `Head out toward Valencia St`, durationMinutes: d[0], mode: "walking" },
      { instruction: `Continue ${formatKm(km * 0.6)} along the main strip`, durationMinutes: d[1], mode: "walking" },
      { instruction: `Arrive at ${venue.name}`, durationMinutes: d[2], mode: "walking" },
    ];
  }
  if (mode === "transit") {
    const line = TRANSIT_LINES[Math.floor(km * 7) % TRANSIT_LINES.length];
    const stops = Math.max(2, Math.round(km * 2));
    const d = splitDurations(totalMin, 3);
    return [
      { instruction: `Walk to the nearest stop on Market St`, durationMinutes: d[0], mode: "walking" },
      { instruction: `Ride the ${line} for ${stops} stops`, durationMinutes: d[1], mode: "transit" },
      { instruction: `Short walk to ${venue.name}`, durationMinutes: d[2], mode: "walking" },
    ];
  }
  const d = splitDurations(totalMin, 3);
  return [
    { instruction: `Merge onto Van Ness Ave heading south`, durationMinutes: d[0], mode: "driving" },
    { instruction: `Continue ${formatKm(km * 0.7)} toward ${venue.address.split(",")[0]}`, durationMinutes: d[1], mode: "driving" },
    { instruction: `Arrive at ${venue.name} — street parking nearby`, durationMinutes: d[2], mode: "driving" },
  ];
}

export function buildRoutePlan(args: {
  venue: Venue;
  match: Match;
  userLocation: LatLng;
  mode: Mode;
}): RoutePlan & { distanceKm: number; travelMinutes: number } {
  const { venue, match, userLocation, mode } = args;
  const km = haversineKm(userLocation.lat, userLocation.lng, venue.lat, venue.lng);
  const travel = estimateMinutes(km, mode);
  const kickoff = +new Date(match.kickoffUTC);
  const BUFFER = 30;
  const departure = new Date(kickoff - (travel + BUFFER) * 60000);
  const arrival = new Date(+departure + travel * 60000);
  const shareUrl = `/route?venueId=${venue.id}&matchId=${match.id}&mode=${mode}&shared=1`;
  return {
    venueId: venue.id,
    matchId: match.id,
    departureTime: departure.toISOString(),
    arrivalTime: arrival.toISOString(),
    mode,
    steps: buildSteps(mode, travel, venue, km),
    shareUrl,
    notificationScheduled: false,
    distanceKm: km,
    travelMinutes: travel,
  };
}
