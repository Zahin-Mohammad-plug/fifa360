"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";
import { Venue } from "@/types";

type LatLng = [number, number];

export type ArrivalMapInnerProps = {
  venue: Venue | null;
  origin: { lat: number; lng: number; label: string };
  profile: "driving" | "foot";
  onRouteResolved?: (info: {
    durationMinutes: number;
    distanceKm: number;
    source: string;
  }) => void;
};

type RouteResponse = {
  ok: boolean;
  source: string;
  profile: string;
  durationMinutes: number;
  distanceKm: number;
  coordinates: LatLng[];
  warning?: string;
};

const NEON = "#ccff00";
const DEST = "#ff3b30";
const DARK_BG = "#070d05";

function makeMarker(color: string, glyph: string) {
  return L.divIcon({
    className: "arrival-marker",
    html: `<div style="
      position: relative;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: ${color};
      border: 2px solid rgba(255,255,255,0.85);
      box-shadow: 0 4px 14px rgba(0,0,0,0.55), 0 0 12px ${color}88;
      color: #060b03;
      font-weight: 900;
      font-size: 13px;
    ">${glyph}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function ArrivalMapInner({
  venue,
  origin,
  profile,
  onRouteResolved,
}: ArrivalMapInnerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    originMarker?: L.Marker;
    destMarker?: L.Marker;
    polyGlow?: L.Polyline;
    polyLine?: L.Polyline;
  }>({});

  const [routeInfo, setRouteInfo] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Stable callback ref
  const onRouteResolvedRef = useRef(onRouteResolved);
  useEffect(() => {
    onRouteResolvedRef.current = onRouteResolved;
  }, [onRouteResolved]);

  // Initialize the map exactly once per mount of this component.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      preferCanvas: true,
      center: [origin.lat, origin.lng],
      zoom: 13,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        subdomains: ["a", "b", "c", "d"],
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      },
    ).addTo(map);

    L.control.attribution({ position: "bottomright", prefix: false }).addTo(map);

    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layersRef.current = {};
    };
    // We deliberately want to initialize once; subsequent prop changes are
    // handled by the effects below that mutate the live map instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch the real route whenever venue / origin / profile changes.
  useEffect(() => {
    if (!venue) {
      setRouteInfo(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const url =
      `/api/route?from=${origin.lat},${origin.lng}` +
      `&to=${venue.lat},${venue.lng}&profile=${profile}`;

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Route API ${res.status}`);
        return (await res.json()) as RouteResponse;
      })
      .then((data) => {
        setRouteInfo(data);
        onRouteResolvedRef.current?.({
          durationMinutes: data.durationMinutes,
          distanceKm: data.distanceKm,
          source: data.source,
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch route");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [origin.lat, origin.lng, profile, venue]);

  // Render markers + polyline + fit bounds whenever venue/route changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !venue) return;

    const layers = layersRef.current;

    // Tear down previous layers
    layers.originMarker?.remove();
    layers.destMarker?.remove();
    layers.polyGlow?.remove();
    layers.polyLine?.remove();

    const positions: LatLng[] = routeInfo?.coordinates?.length
      ? routeInfo.coordinates
      : [
          [origin.lat, origin.lng],
          [venue.lat, venue.lng],
        ];

    layers.polyGlow = L.polyline(positions, {
      color: NEON,
      weight: 9,
      opacity: 0.18,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    layers.polyLine = L.polyline(positions, {
      color: NEON,
      weight: 4,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
      dashArray: profile === "foot" ? "1 8" : undefined,
    }).addTo(map);

    layers.originMarker = L.marker([origin.lat, origin.lng], {
      icon: makeMarker(NEON, "●"),
      title: origin.label,
    }).addTo(map);

    layers.destMarker = L.marker([venue.lat, venue.lng], {
      icon: makeMarker(DEST, "★"),
      title: venue.name,
    }).addTo(map);

    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true });

    // Workaround: Leaflet sometimes initializes before the container has its
    // final size (flex layout). Force a size recalc on the next frame.
    requestAnimationFrame(() => map.invalidateSize());
  }, [origin.lat, origin.lng, origin.label, profile, routeInfo, venue]);

  return (
    <div className="absolute inset-0">
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ background: DARK_BG }}
      />

      {/* Route info pill */}
      <div
        className="absolute top-3.5 right-3.5 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-mono pointer-events-none"
        style={{
          background: "rgba(5,9,3,0.92)",
          border: "1px solid rgba(204,255,0,0.28)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 14px rgba(204,255,0,0.1)",
          color: "#f5f9f3",
          zIndex: 1000,
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" style={{ color: NEON }} />
            <span>Routing…</span>
          </>
        ) : routeInfo ? (
          <>
            <span style={{ color: NEON }}>●</span>
            <span className="font-bold">{routeInfo.durationMinutes} min</span>
            <span style={{ color: "#7a8a75" }}>{routeInfo.distanceKm} km</span>
            {routeInfo.source === "fallback-haversine" && (
              <span style={{ color: "#f59e0b" }}>est.</span>
            )}
          </>
        ) : error ? (
          <span style={{ color: "#f59e0b" }}>route unavailable</span>
        ) : null}
      </div>
    </div>
  );
}
