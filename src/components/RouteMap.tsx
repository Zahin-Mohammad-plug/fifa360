"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Venue } from "@/lib/types";

import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then((m) => m.TileLayer),    { ssr: false });
const Marker       = dynamic(() => import("react-leaflet").then((m) => m.Marker),       { ssr: false });
const Polyline     = dynamic(() => import("react-leaflet").then((m) => m.Polyline),     { ssr: false });
const Popup        = dynamic(() => import("react-leaflet").then((m) => m.Popup),        { ssr: false });

const DEFAULT_ORIGIN = { lat: 37.7749, lng: -122.4194, label: "Downtown SF" };

type Mode = "walking" | "transit" | "driving";

interface Props {
  venue: Venue;
  mode: Mode;
  origin?: { lat: number; lng: number; label: string };
}

const OSRM_PROFILE: Record<Mode, "foot" | "driving" | "cycling"> = {
  walking: "foot",
  transit: "foot",
  driving: "driving",
};

type LatLng = [number, number];

export default function RouteMap({ venue, mode, origin = DEFAULT_ORIGIN }: Props) {
  const [polyline, setPolyline] = useState<LatLng[] | null>(null);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [iconsReady, setIconsReady] = useState(false);

  const center = useMemo<LatLng>(
    () => [(origin.lat + venue.lat) / 2, (origin.lng + venue.lng) / 2],
    [origin.lat, origin.lng, venue.lat, venue.lng],
  );

  useEffect(() => {
    setMounted(true);
    (async () => {
      const L = (await import("leaflet")).default;
      const blue = L.divIcon({
        className: "",
        html: '<div style="width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 8px rgba(37,99,235,0.55);"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const red = L.divIcon({
        className: "",
        html: '<div style="width:22px;height:22px;border-radius:9999px;background:#E8112D;border:3px solid #fff;box-shadow:0 2px 10px rgba(232,17,45,0.6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">🏁</div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      window.__fifaMapIcons = { origin: blue, destination: red };
      setIconsReady(true);
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const profile = OSRM_PROFILE[mode];
    const url = `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${venue.lng},${venue.lat}?overview=full&geometries=geojson`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("OSRM error"))))
      .then((data) => {
        if (cancelled) return;
        const coords: [number, number][] = data?.routes?.[0]?.geometry?.coordinates ?? [];
        if (coords.length === 0) {
          setPolyline([
            [origin.lat, origin.lng],
            [venue.lat, venue.lng],
          ]);
          setRouteDistanceKm(null);
          return;
        }
        setPolyline(coords.map(([lng, lat]) => [lat, lng] as LatLng));
        const meters = data?.routes?.[0]?.distance ?? 0;
        setRouteDistanceKm(meters > 0 ? meters / 1000 : null);
      })
      .catch(() => {
        if (cancelled) return;
        setPolyline([
          [origin.lat, origin.lng],
          [venue.lat, venue.lng],
        ]);
        setRouteDistanceKm(null);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, origin.lat, origin.lng, venue.lat, venue.lng]);

  if (!mounted) {
    return (
      <div className="w-full h-full grid place-items-center bg-gray-900 text-gray-500 text-xs">
        Loading map…
      </div>
    );
  }

  const originIcon = iconsReady ? window.__fifaMapIcons?.origin : undefined;
  const destIcon   = iconsReady ? window.__fifaMapIcons?.destination : undefined;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {originIcon && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>{origin.label}</Popup>
          </Marker>
        )}
        {destIcon && (
          <Marker position={[venue.lat, venue.lng]} icon={destIcon}>
            <Popup>{venue.name}</Popup>
          </Marker>
        )}
        {polyline && (
          <Polyline
            positions={polyline}
            pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.9 }}
          />
        )}
      </MapContainer>

      {routeDistanceKm !== null && (
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-gray-900/85 backdrop-blur text-[11px] text-gray-200 border border-gray-700">
          {routeDistanceKm.toFixed(1)} km via {profileLabel(mode)}
        </div>
      )}
    </div>
  );
}

function profileLabel(mode: Mode) {
  if (mode === "driving") return "driving";
  if (mode === "transit") return "transit (walk approx.)";
  return "walking";
}

declare global {
  interface Window {
    __fifaMapIcons?: {
      origin: import("leaflet").DivIcon;
      destination: import("leaflet").DivIcon;
    };
  }
}
