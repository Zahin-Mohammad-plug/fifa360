import { NextResponse } from "next/server";

/**
 * Proxies the public OSRM routing demo to fetch real-world routes
 * (real road geometry, real distance, real duration) without an API key.
 *
 *   GET /api/route?from=lat,lng&to=lat,lng&profile=driving
 *
 * `profile` is one of `driving` | `foot` | `bike` (OSRM-supported).
 */

const OSRM_BASE = "https://router.project-osrm.org/route/v1";

type LatLng = [number, number];

type OsrmStep = {
  duration: number;
  distance: number;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
};

type OsrmRoute = {
  duration: number;
  distance: number;
  geometry: { coordinates: [number, number][]; type: "LineString" };
  legs: { steps: OsrmStep[] }[];
};

type OsrmResponse = {
  code: string;
  routes?: OsrmRoute[];
  message?: string;
};

function parseLatLng(raw: string | null): LatLng | null {
  if (!raw) return null;
  const [lat, lng] = raw.split(",").map((v) => Number(v.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lat, lng];
}

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = parseLatLng(url.searchParams.get("from"));
  const to = parseLatLng(url.searchParams.get("to"));
  const profileRaw = (url.searchParams.get("profile") ?? "driving").toLowerCase();
  const profile = (["driving", "foot", "bike"].includes(profileRaw) ? profileRaw : "driving") as
    | "driving"
    | "foot"
    | "bike";

  if (!from || !to) {
    return NextResponse.json(
      { error: "Missing or invalid `from` / `to`. Use ?from=lat,lng&to=lat,lng" },
      { status: 400 },
    );
  }

  // OSRM expects lon,lat;lon,lat
  const coords = `${from[1]},${from[0]};${to[1]},${to[0]}`;
  const osrmUrl = `${OSRM_BASE}/${profile}/${coords}?overview=full&geometries=geojson&steps=true`;

  try {
    const res = await fetch(osrmUrl, {
      headers: { "User-Agent": "matchday-concierge/1.0" },
      // OSRM tiles update slowly; cache aggressively at the edge.
      next: { revalidate: 60 * 60 },
    });

    if (!res.ok) {
      throw new Error(`OSRM upstream returned ${res.status}`);
    }

    const data = (await res.json()) as OsrmResponse;

    if (data.code !== "Ok" || !data.routes?.length) {
      throw new Error(data.message ?? `OSRM returned code=${data.code}`);
    }

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng] as LatLng,
    );

    return NextResponse.json({
      ok: true,
      source: "osrm",
      profile,
      durationSeconds: route.duration,
      distanceMeters: route.distance,
      durationMinutes: Math.max(1, Math.round(route.duration / 60)),
      distanceKm: Number((route.distance / 1000).toFixed(2)),
      coordinates,
    });
  } catch (err) {
    // Graceful fallback: straight-line estimate so the UI still has *real*
    // distances + sensible time estimates if OSRM is unreachable.
    const straightKm = haversineKm(from, to);
    const speedKmh = profile === "foot" ? 5 : profile === "bike" ? 18 : 28;
    const durationMinutes = Math.max(1, Math.round((straightKm / speedKmh) * 60));

    return NextResponse.json(
      {
        ok: true,
        source: "fallback-haversine",
        profile,
        durationSeconds: durationMinutes * 60,
        distanceMeters: Math.round(straightKm * 1000),
        durationMinutes,
        distanceKm: Number(straightKm.toFixed(2)),
        coordinates: [from, to] as LatLng[],
        warning: err instanceof Error ? err.message : "OSRM unreachable",
      },
      { status: 200 },
    );
  }
}
