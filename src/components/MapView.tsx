"use client";

import { useEffect, useRef, useState } from "react";
import { Venue } from "@/types";
import { RouteInfo } from "@/types";

interface Props {
  venue: Venue;
  origin: { lat: number; lng: number; label: string };
  onRouteCalculated?: (route: RouteInfo) => void;
  transportMode?: "driving" | "walking" | "transit";
}

// Fallback static map using a visual representation when MapKit is not configured
function StaticMapFallback({
  venue,
  origin,
}: {
  venue: Venue;
  origin: { lat: number; lng: number; label: string };
}) {
  return (
    <div className="relative w-full h-full bg-[#0d1830] overflow-hidden">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,214,245,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,214,245,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Route visualization */}
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Dashed route line */}
        <path
          d="M 100 240 C 150 200, 250 100, 300 60"
          stroke="rgba(6,214,245,0.6)"
          strokeWidth="2.5"
          strokeDasharray="8 4"
          fill="none"
        />
        {/* Origin pin */}
        <circle cx="100" cy="240" r="8" fill="#06d6f5" opacity="0.8" />
        <circle cx="100" cy="240" r="14" fill="none" stroke="#06d6f5" strokeWidth="1.5" opacity="0.3" />

        {/* Destination pin */}
        <circle cx="300" cy="60" r="10" fill="#ff2d78" opacity="0.9" />
        <circle cx="300" cy="60" r="18" fill="none" stroke="#ff2d78" strokeWidth="1.5" opacity="0.3" />

        {/* Labels */}
        <text x="115" y="245" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="system-ui">
          {origin.label.split(",")[0]}
        </text>
        <text x="255" y="55" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="system-ui">
          {venue.name}
        </text>
      </svg>

      {/* MapKit attribution placeholder */}
      <div className="absolute bottom-2 right-2 text-[9px] text-white/20">
        MapKit JS · Add token to enable
      </div>

      {/* Demo badge */}
      <div className="absolute top-2 left-2 text-[9px] text-amber-400/60 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
        Map preview – set NEXT_PUBLIC_MAPKIT_TOKEN for live maps
      </div>
    </div>
  );
}

export function MapView({ venue, origin, onRouteCalculated, transportMode = "walking" }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapkitLoaded, setMapkitLoaded] = useState(false);
  const [mapkitError, setMapkitError] = useState(false);
  const token = process.env.NEXT_PUBLIC_MAPKIT_TOKEN;

  useEffect(() => {
    if (!token) {
      setMapkitError(true);
      // Simulate route calculation for demo
      if (onRouteCalculated) {
        onRouteCalculated({
          origin,
          destination: { lat: venue.lat, lng: venue.lng, label: venue.name },
          etaMinutes: venue.etaMinutes ?? 18,
          distanceKm: venue.distanceKm ?? 1.4,
          mode: transportMode,
          departureTime: "7:12 PM",
          steps: [
            "Head north on Broadway",
            "Turn right on W 49th St",
            "Arrive at destination on the left",
          ],
        });
      }
      return;
    }

    // Load MapKit JS
    const script = document.createElement("script");
    script.src = "https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js";
    script.async = true;
    script.onload = () => {
      try {
        // @ts-expect-error - mapkit is a global loaded by the script
        const mk = window.mapkit;
        mk.init({
          authorizationCallback: (done: (token: string) => void) => {
            done(token);
          },
        });

        if (!mapRef.current) return;

        const map = new mk.Map(mapRef.current, {
          colorScheme: mk.Map.ColorSchemes.Dark,
          mapType: mk.Map.MapTypes.Standard,
          showsZoomControl: false,
          showsCompass: mk.FeatureVisibility.Hidden,
          showsMapTypeControl: false,
        });

        const center = new mk.Coordinate(
          (origin.lat + venue.lat) / 2,
          (origin.lng + venue.lng) / 2
        );
        map.region = new mk.CoordinateRegion(
          center,
          new mk.CoordinateSpan(0.02, 0.02)
        );

        // Add origin annotation
        const originAnnotation = new mk.MarkerAnnotation(
          new mk.Coordinate(origin.lat, origin.lng),
          { title: origin.label.split(",")[0], glyphText: "📍", color: "#06d6f5" }
        );

        // Add venue annotation
        const venueAnnotation = new mk.MarkerAnnotation(
          new mk.Coordinate(venue.lat, venue.lng),
          { title: venue.name, glyphText: "⚽", color: "#ff2d78" }
        );

        map.addAnnotations([originAnnotation, venueAnnotation]);
        setMapkitLoaded(true);

        // Request directions
        const directions = new mk.Directions();
        const request = {
          origin: new mk.Coordinate(origin.lat, origin.lng),
          destination: new mk.Coordinate(venue.lat, venue.lng),
          transportType:
            transportMode === "driving"
              ? mk.Directions.Transport.Automobile
              : mk.Directions.Transport.Walking,
        };

        directions.route(request, (_err: unknown, data: { routes?: { expectedTravelTime?: number; distance?: number }[] }) => {
          if (data?.routes?.[0] && onRouteCalculated) {
            const route = data.routes[0];
            onRouteCalculated({
              origin,
              destination: { lat: venue.lat, lng: venue.lng, label: venue.name },
              etaMinutes: Math.ceil((route.expectedTravelTime ?? 0) / 60),
              distanceKm: parseFloat(((route.distance ?? 0) / 1000).toFixed(1)),
              mode: transportMode,
              departureTime: "7:12 PM",
            });
          }
        });
      } catch (err) {
        console.error("MapKit init failed:", err);
        setMapkitError(true);
      }
    };
    script.onerror = () => setMapkitError(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, venue.id, transportMode]);

  if (mapkitError || !token) {
    return <StaticMapFallback venue={venue} origin={origin} />;
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {!mapkitLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1e]">
          <div className="text-white/30 text-sm animate-pulse">Loading map…</div>
        </div>
      )}
    </div>
  );
}
