"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { VENUES } from "@/data/venues";
import { MapView } from "@/components/MapView";
import { SharePlanModal } from "@/components/SharePlanModal";
import { MATCHES } from "@/data/matches";
import { RouteInfo, Venue } from "@/types";
import { getDepartureTime, getMinutesUntilDeparture } from "@/lib/shareLink";
import { Navigation, Car, Footprints, Train, Clock, Share2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationSheet } from "@/components/NotificationSheet";

type TransportMode = "walking" | "driving" | "transit";

const MODE_CONFIG: Record<TransportMode, { icon: React.ElementType; label: string; color: string }> = {
  walking: { icon: Footprints, label: "Walking", color: "#00ff88" },
  driving: { icon: Car,        label: "Driving",  color: "#ffd740" },
  transit: { icon: Train,      label: "Transit",  color: "#7c4dff" },
};

function DepartureCountdown({ minutes }: { minutes: number }) {
  const color = minutes < 10 ? "#ff1744" : minutes < 20 ? "#ffd740" : "#00ff88";
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
         style={{ background: `${color}18`, border: `1px solid ${color}40`, boxShadow: `0 0 12px ${color}15` }}>
      <Clock className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-sm font-black" style={{ color }}>
        {minutes <= 0 ? "Leave now!" : `Leave in ${minutes}m`}
      </span>
    </div>
  );
}

export default function RoutePage() {
  const router = useRouter();
  const { selectedVenue, selectedMatch, userLocation, setSelectedVenue, routeInfo, setRouteInfo, preferences, setPreferences } = useAppStore();

  const [shareOpen,        setShareOpen]        = useState(false);
  const [notifOpen,        setNotifOpen]        = useState(false);
  const [mode,             setMode]             = useState<TransportMode>((preferences.transportMode as TransportMode) ?? "walking");
  const [departureMinutes, setDepartureMinutes] = useState<number | null>(null);
  const [showVenuePicker,  setShowVenuePicker]  = useState(false);

  const activeVenue = selectedVenue ?? VENUES[0];
  const activeMatch = selectedMatch ?? MATCHES.find((m) => m.status === "live") ?? MATCHES[0];
  const origin      = userLocation ?? { lat: 40.7484, lng: -73.9967, label: "Times Square, New York" };

  const handleRouteCalculated = useCallback((route: RouteInfo) => {
    const dep = getDepartureTime(activeMatch.kickoff, route.etaMinutes, 15);
    setRouteInfo({ ...route, departureTime: dep });
    setDepartureMinutes(getMinutesUntilDeparture(dep));
  }, [activeMatch.kickoff, setRouteInfo]);

  useEffect(() => {
    if (!routeInfo?.departureTime) return;
    const tick = () => setDepartureMinutes(getMinutesUntilDeparture(routeInfo.departureTime));
    const id = setInterval(tick, 60000);
    tick();
    return () => clearInterval(id);
  }, [routeInfo?.departureTime]);

  const handleModeChange = (m: TransportMode) => {
    setMode(m); setPreferences({ transportMode: m }); setRouteInfo(null);
  };

  // Full-height page (no extra scroll)
  const mapHeight = "calc(100dvh - var(--nav-height))";

  return (
    <div className="page-enter flex" style={{ height: mapHeight, overflow: "hidden" }}>
      {/* ── Map area (flex-1) ── */}
      <div className="flex-1 relative overflow-hidden">
        <MapView venue={activeVenue} origin={origin} onRouteCalculated={handleRouteCalculated} transportMode={mode} />

        {/* Floating origin/dest overlay */}
        <div className="absolute top-4 left-4 space-y-2 max-w-[280px] pointer-events-none">
          <div className="rounded-xl px-3 py-2.5 flex items-center gap-2"
               style={{ background: "rgba(4,8,18,0.9)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(16px)" }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#00b4ff", boxShadow: "0 0 6px #00b4ff" }} />
            <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.65)" }}>{origin.label}</span>
          </div>
          <div
            className="rounded-xl px-3 py-2.5 flex items-center gap-2 pointer-events-auto cursor-pointer"
            onClick={() => setShowVenuePicker((v) => !v)}
            style={{ background: "rgba(4,8,18,0.9)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(16px)" }}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#ff1d78", boxShadow: "0 0 6px #ff1d78" }} />
            <span className="text-xs flex-1 truncate text-white font-medium">{activeVenue.name}</span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
          </div>
        </div>

        {/* Venue picker dropdown */}
        <AnimatePresence>
          {showVenuePicker && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute top-[116px] left-4 w-72 rounded-2xl overflow-hidden z-20"
              style={{ background: "rgba(12,26,46,0.97)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(24px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
            >
              {VENUES.map((v) => {
                const active = activeVenue.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVenue(v); setShowVenuePicker(false); setRouteInfo(null); }}
                    className="w-full text-left px-4 py-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: active ? "rgba(0,180,255,0.08)" : undefined }}
                  >
                    <div className="text-sm font-bold" style={{ color: active ? "#00b4ff" : "rgba(255,255,255,0.8)" }}>{v.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{v.etaMinutes} min · {v.address}</div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right panel ── */}
      <div className="w-80 xl:w-96 shrink-0 flex flex-col border-l overflow-y-auto"
           style={{
             borderColor: "rgba(255,255,255,0.08)",
             background: "rgba(7,16,30,0.98)",
             backdropFilter: "blur(24px)",
           }}>
        {/* Panel header */}
        <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase"
                   style={{ color: "rgba(124,77,255,0.7)" }}>FIFA 360</div>
              <div className="text-xl font-black text-white leading-tight">Route Planner</div>
            </div>
            {departureMinutes !== null && (
              <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}>
                <DepartureCountdown minutes={departureMinutes} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Transport mode */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] mb-3"
               style={{ color: "rgba(255,255,255,0.3)" }}>Transport Mode</div>
          <div className="flex flex-col gap-2">
            {(Object.keys(MODE_CONFIG) as TransportMode[]).map((m) => {
              const { icon: Icon, label, color } = MODE_CONFIG[m];
              const active = mode === m;
              return (
                <motion.button
                  key={m}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleModeChange(m)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                  style={active ? {
                    background: `${color}15`, border: `1px solid ${color}35`, color,
                  } : {
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Route info */}
        <div className="px-5 py-5 flex-1">
          <AnimatePresence mode="wait">
            {routeInfo ? (
              <motion.div key="route" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: [0.22,1,0.36,1] }} className="space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "ETA", value: `${routeInfo.etaMinutes}`, unit: "min", color: "#00b4ff" },
                    { label: "Distance", value: `${routeInfo.distanceKm}`, unit: "km", color: "#7c4dff" },
                    { label: "Depart", value: routeInfo.departureTime, unit: "", color: "#ffd740" },
                  ].map(({ label, value, unit, color }) => (
                    <div key={label} className="rounded-xl p-3 text-center"
                         style={{ background: `${color}0a`, border: `1px solid ${color}20` }}>
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-1"
                           style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
                      <div className="font-black leading-none" style={{ color, fontSize: unit ? "22px" : "16px" }}>
                        {value}
                      </div>
                      {unit && <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{unit}</div>}
                    </div>
                  ))}
                </div>

                {/* Steps */}
                {routeInfo.steps && routeInfo.steps.length > 0 && (
                  <div className="space-y-1.5">
                    {routeInfo.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs"
                           style={{ color: "rgba(255,255,255,0.45)" }}>
                        <span className="font-mono mt-0.5 shrink-0" style={{ color: "rgba(0,180,255,0.5)" }}>{i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation icon row */}
                <div className="flex items-center justify-center py-2">
                  <Navigation className="w-5 h-5" style={{ color: "#00b4ff", opacity: 0.5 }} />
                </div>

                {/* CTAs */}
                <div className="space-y-2.5">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShareOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
                  >
                    <Share2 className="w-4 h-4" /> Share Plan
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setNotifOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm"
                    style={{ background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)", color: "#fff", boxShadow: "0 4px 20px rgba(0,102,255,0.4)" }}
                  >
                    Set Alerts
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center h-40 gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ background: "rgba(0,180,255,0.1)", border: "1px solid rgba(0,180,255,0.2)" }}>
                  <Navigation className="w-5 h-5 animate-pulse" style={{ color: "#00b4ff" }} />
                </div>
                <div className="text-sm font-bold text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Calculating route…
                </div>
                <div className="text-xs text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
                  to {activeVenue.name}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {routeInfo && (
        <SharePlanModal open={shareOpen} onClose={() => setShareOpen(false)} match={activeMatch} venue={activeVenue} route={routeInfo} />
      )}
      <NotificationSheet open={notifOpen} onClose={() => { setNotifOpen(false); router.push("/live"); }} />
    </div>
  );
}
