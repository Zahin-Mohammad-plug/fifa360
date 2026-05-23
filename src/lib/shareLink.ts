import { SharePlan } from "@/types";

export function encodeSharePlan(plan: SharePlan): string {
  const params = new URLSearchParams({
    m: plan.matchId,
    v: plan.venueId,
    k: plan.kickoff,
    rm: plan.routeMode,
    dt: plan.departureTime,
    vn: plan.venueName,
    va: plan.venueAddress,
    lat: String(plan.lat),
    lng: String(plan.lng),
  });
  return params.toString();
}

export function decodeSharePlan(query: string): SharePlan | null {
  try {
    const params = new URLSearchParams(query);
    return {
      matchId: params.get("m") ?? "",
      venueId: params.get("v") ?? "",
      kickoff: params.get("k") ?? "",
      routeMode: params.get("rm") ?? "driving",
      departureTime: params.get("dt") ?? "",
      venueName: params.get("vn") ?? "",
      venueAddress: params.get("va") ?? "",
      lat: parseFloat(params.get("lat") ?? "0"),
      lng: parseFloat(params.get("lng") ?? "0"),
    };
  } catch {
    return null;
  }
}

export function buildShareUrl(plan: SharePlan): string {
  const encoded = encodeSharePlan(plan);
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}/share`
      : "https://fifa360.app/share";
  return `${base}?${encoded}`;
}

export function formatKickoff(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function getDepartureTime(kickoffISO: string, etaMinutes: number, bufferMinutes = 15): string {
  const kickoff = new Date(kickoffISO);
  const departureMs = kickoff.getTime() - (etaMinutes + bufferMinutes) * 60 * 1000;
  const departure = new Date(departureMs);
  return departure.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getMinutesUntilDeparture(departureTimeStr: string): number {
  // Parse "7:30 PM" style string against today
  try {
    const today = new Date();
    const [time, period] = departureTimeStr.split(" ");
    const [h, m] = time.split(":").map(Number);
    let hours = h;
    if (period === "PM" && h !== 12) hours += 12;
    if (period === "AM" && h === 12) hours = 0;
    const departure = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, m);
    const diff = (departure.getTime() - Date.now()) / 60000;
    return Math.max(0, Math.round(diff));
  } catch {
    return 0;
  }
}
