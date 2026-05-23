// Small shared helpers. Keep dependency-free so both client & server can use them.

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

// Great-circle distance in kilometres.
export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Rough per-mode travel time (minutes) including a little urban overhead.
export function estimateMinutes(
  distanceKm: number,
  mode: "walking" | "transit" | "driving",
): number {
  const speeds = { walking: 4.8, transit: 17, driving: 24 }; // km/h
  const overhead = { walking: 1, transit: 7, driving: 4 }; // min
  const t = (distanceKm / speeds[mode]) * 60 + overhead[mode];
  return Math.max(2, Math.round(t));
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDayTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const day = isToday ? "Today" : isTomorrow ? "Tomorrow" : d.toLocaleDateString([], { weekday: "short" });
  return `${day} · ${formatClock(iso)}`;
}

// "2h 34m" style countdown from now until the ISO time.
export function formatCountdown(iso: string): string {
  const diffMs = +new Date(iso) - Date.now();
  if (diffMs <= 0) return "Kicking off";
  const totalMin = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export const priceLabel = (p: 1 | 2 | 3): string => "$".repeat(p);

// URL-safe base64 that works in both browser and Node.
export function encodeState(obj: unknown): string {
  const json = JSON.stringify(obj);
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(json, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeState<T>(s: string): T | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window === "undefined"
        ? Buffer.from(b64, "base64").toString("utf-8")
        : decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
