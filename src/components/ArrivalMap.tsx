"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Venue } from "@/types";

const MAPKIT_SCRIPT_SRC = "https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js";

declare global {
  interface Window {
    __mapkitScriptPromise?: Promise<void>;
    __mapkitInitialized?: boolean;
  }
}

type ArrivalMapProps = {
  venue: Venue | null;
  transportMode: "metro" | "rideshare";
};

function loadMapkitScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("MapKit can only load in the browser."));
  }

  if (typeof mapkit !== "undefined") {
    return Promise.resolve();
  }

  if (window.__mapkitScriptPromise) {
    return window.__mapkitScriptPromise;
  }

  window.__mapkitScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${MAPKIT_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Apple MapKit JS.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = MAPKIT_SCRIPT_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Apple MapKit JS."));
    document.head.appendChild(script);
  });

  return window.__mapkitScriptPromise;
}

export function ArrivalMap({ venue, transportMode }: ArrivalMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapkit.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPKIT_TOKEN;

  const origin = useMemo(() => {
    if (!venue) return null;

    // Demo origin offset so users can still see a route-like context.
    const latOffset = transportMode === "rideshare" ? 0.024 : 0.016;
    const lngOffset = transportMode === "rideshare" ? -0.026 : -0.02;

    return {
      lat: venue.lat + latOffset,
      lng: venue.lng + lngOffset,
    };
  }, [transportMode, venue]);

  useEffect(() => {
    let disposed = false;

    const setupMap = async () => {
      if (!containerRef.current || !venue || !origin) {
        setMapReady(false);
        return;
      }

      if (!token) {
        setMapError("NEXT_PUBLIC_MAPKIT_TOKEN is missing. Showing demo fallback map.");
        setMapReady(false);
        return;
      }

      try {
        setMapError(null);
        await loadMapkitScript();
        if (disposed || !containerRef.current) return;

        if (!window.__mapkitInitialized) {
          mapkit.init({
            authorizationCallback: (done) => done(token),
            language: "en",
            libraries: ["map"],
          });
          window.__mapkitInitialized = true;
        }

        mapRef.current?.destroy();

        const map = new mapkit.Map(containerRef.current, {
          showsCompass: mapkit.FeatureVisibility.Hidden,
          showsMapTypeControl: false,
          showsZoomControl: false,
          isRotationEnabled: false,
          isScrollEnabled: true,
          colorScheme: mapkit.Map.ColorSchemes.Dark,
          tintColor: "#ccff00",
        });

        const destinationCoordinate = new mapkit.Coordinate(venue.lat, venue.lng);
        const originCoordinate = new mapkit.Coordinate(origin.lat, origin.lng);
        const centerCoordinate = new mapkit.Coordinate(
          (origin.lat + venue.lat) / 2,
          (origin.lng + venue.lng) / 2,
        );

        const latDelta = Math.max(Math.abs(origin.lat - venue.lat) * 2.6, 0.035);
        const lngDelta = Math.max(Math.abs(origin.lng - venue.lng) * 2.6, 0.035);

        map.region = new mapkit.CoordinateRegion(
          centerCoordinate,
          new mapkit.CoordinateSpan(latDelta, lngDelta),
        );

        const originPin = new mapkit.MarkerAnnotation(originCoordinate, {
          title: "Current area",
          subtitle: "Estimated departure zone",
          color: "#ccff00",
          glyphColor: "#060b03",
          glyphText: "●",
        });

        const destinationPin = new mapkit.MarkerAnnotation(destinationCoordinate, {
          title: venue.name,
          subtitle: venue.address,
          color: "#ff3b30",
          glyphColor: "#ffffff",
          glyphText: "🏁",
        });

        map.addAnnotations([originPin, destinationPin]);
        map.showItems([originPin, destinationPin], { animate: true, padding: new mapkit.Padding(72, 44, 72, 44) });

        mapRef.current = map;
        setMapReady(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to initialize Apple MapKit.";
        setMapError(message);
        setMapReady(false);
      }
    };

    setupMap();

    return () => {
      disposed = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [origin, token, venue]);

  return (
    <div className="absolute inset-0">
      <div
        ref={containerRef}
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: mapReady ? 1 : 0, background: "#070d05" }}
      />

      {!mapReady && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center pitch-grid"
          style={{
            background: "radial-gradient(circle at 20% 10%, rgba(204,255,0,0.08), transparent 38%), #070d05",
          }}
        >
          <MapPin className="w-7 h-7 mb-2" style={{ color: "#ccff00" }} />
          <p className="text-sm font-semibold" style={{ color: "#f5f9f3" }}>
            Apple MapKit JS
          </p>
          <p className="text-[11px] mt-1 max-w-xs" style={{ color: "#7a8a75" }}>
            {mapError ?? "Map is loading..."}
          </p>
          {venue && (
            <p className="text-[10px] mt-3 font-mono" style={{ color: "#9aaa93" }}>
              {venue.name} · {venue.city}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
