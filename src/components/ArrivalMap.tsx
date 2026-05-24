"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { Venue } from "@/types";
import { useAppStore } from "@/store/appStore";

const ArrivalMapInner = dynamic(() => import("./ArrivalMapInner"), {
  ssr: false,
  loading: () => (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center pitch-grid"
      style={{
        background:
          "radial-gradient(circle at 20% 10%, rgba(204,255,0,0.08), transparent 38%), #070d05",
      }}
    >
      <MapPin className="w-7 h-7 mb-2 animate-pulse" style={{ color: "#ccff00" }} />
      <p className="text-sm font-semibold" style={{ color: "#f5f9f3" }}>
        Loading map…
      </p>
    </div>
  ),
});

type ArrivalMapProps = {
  venue: Venue | null;
  transportMode: "metro" | "rideshare";
  onRouteResolved?: (info: {
    durationMinutes: number;
    distanceKm: number;
    source: string;
  }) => void;
};

// City-center fallback origins so the route looks sensible even before the
// browser hands us geolocation. Keyed by venue.city to avoid wiring up a full
// city catalog.
const CITY_FALLBACK_ORIGINS: Record<string, { lat: number; lng: number; label: string }> = {
  "New York": { lat: 40.7484, lng: -73.9967, label: "Times Square, New York" },
  Dallas: { lat: 32.7767, lng: -96.797, label: "Downtown Dallas" },
  "Los Angeles": { lat: 34.0522, lng: -118.2437, label: "Downtown Los Angeles" },
};

export function ArrivalMap({ venue, transportMode, onRouteResolved }: ArrivalMapProps) {
  const storedLocation = useAppStore((s) => s.userLocation);

  // Choose the most contextual origin: stored geolocation in the same city,
  // otherwise the city's downtown anchor, otherwise the stored value.
  const origin = useMemo(() => {
    if (!venue) {
      return (
        storedLocation ?? {
          lat: 40.7484,
          lng: -73.9967,
          label: "Times Square, New York",
        }
      );
    }
    const cityOrigin = CITY_FALLBACK_ORIGINS[venue.city];
    if (cityOrigin) return cityOrigin;
    return storedLocation ?? { lat: venue.lat + 0.02, lng: venue.lng - 0.02, label: venue.city };
  }, [storedLocation, venue]);

  // Always fetch the driving route for the map polyline — OSRM's foot profile
  // routes through alleys/parks that look noisy. The route page derives a
  // mode-appropriate time from the real distance returned by the API.
  void transportMode;

  return (
    <ArrivalMapInner
      venue={venue}
      origin={origin}
      profile="driving"
      onRouteResolved={onRouteResolved}
    />
  );
}
