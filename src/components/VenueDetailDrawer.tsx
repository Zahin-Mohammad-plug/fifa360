"use client";

import { Venue } from "@/types";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ConciergePanel } from "@/components/ConciergePanel";
import { Shield, CheckCircle, Users, Volume2, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  venue: Venue | null;
  open: boolean;
  onClose: () => void;
  onPlanRoute: (venue: Venue) => void;
}

function StatCell({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl p-3"
         style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
        {label}
      </div>
      <div className="flex items-center gap-1.5">
        <span style={{ color }}>{icon}</span>
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
    </div>
  );
}

export function VenueDetailDrawer({ venue, open, onClose, onPlanRoute }: Props) {
  if (!venue) return null;

  const trustIcon = venue.trustLevel === "official"
    ? <Shield className="w-4 h-4" />
    : venue.trustLevel === "verified"
    ? <CheckCircle className="w-4 h-4" />
    : null;
  const trustLabel = venue.trustLevel.charAt(0).toUpperCase() + venue.trustLevel.slice(1);
  const trustColor = venue.trustLevel === "official" ? "#00ff88" : venue.trustLevel === "verified" ? "#00b4ff" : "rgba(255,255,255,0.4)";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] p-0 overflow-hidden border-0"
        style={{
          background: "#07101e",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        <SheetTitle className="sr-only">{venue.name}</SheetTitle>

        {/* Hero */}
        <div className="relative h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/icon?name=${encodeURIComponent(venue.name)}`}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0"
               style={{
                 background: "linear-gradient(180deg, rgba(7,16,30,0.3) 0%, rgba(7,16,30,0.95) 100%)",
               }} />

          {/* Venue name on hero */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <div className="font-black text-white text-xl leading-tight">{venue.name}</div>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" style={{ color: "rgba(255,255,255,0.4)" }} />
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{venue.address}</span>
            </div>
          </div>

          {/* Drag handle */}
          <div className="absolute top-3 left-0 right-0 flex justify-center">
            <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 pt-4 pb-8 space-y-5"
             style={{ maxHeight: "calc(90vh - 160px)" }}>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCell
              icon={trustIcon ?? <span className="text-sm">👥</span>}
              label="Trust Level"
              value={trustLabel}
              color={trustColor}
            />
            <StatCell
              icon={<Clock className="w-4 h-4" />}
              label="ETA"
              value={`${venue.etaMinutes ?? "?"} min`}
              color="#00b4ff"
            />
            <StatCell
              icon={<Users className="w-4 h-4" />}
              label="Groups"
              value={venue.supportsGroups ? "Welcome" : "Limited"}
              color="#ffd740"
            />
            <StatCell
              icon={<Volume2 className="w-4 h-4" />}
              label="Audio"
              value={venue.audioOn === true ? "On" : venue.audioOn === false ? "Off" : "Unknown"}
              color="#7c4dff"
            />
          </div>

          {/* Vibe tags */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2.5"
                 style={{ color: "rgba(255,255,255,0.3)" }}>
              Vibe
            </div>
            <div className="flex flex-wrap gap-2">
              {venue.vibeTags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full"
                      style={{
                        color: "rgba(0,180,255,0.9)",
                        background: "rgba(0,180,255,0.1)",
                        border: "1px solid rgba(0,180,255,0.25)",
                      }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Team crowd */}
          {venue.teamAffinityTags.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2.5"
                   style={{ color: "rgba(255,255,255,0.3)" }}>
                Expected Crowd
              </div>
              <div className="flex flex-wrap gap-2">
                {venue.teamAffinityTags.map((team) => (
                  <span key={team} className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          color: "rgba(255,255,255,0.65)",
                          background: "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}>
                    ⚽ {team} fans
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Concierge */}
          {venue.concierge && <ConciergePanel concierge={venue.concierge} />}

          {/* Accessibility */}
          {venue.accessibilityNotes && (
            <div className="rounded-xl p-3"
                 style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-[10px] font-medium mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                ♿ Accessibility
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{venue.accessibilityNotes}</p>
            </div>
          )}

          {/* CTAs */}
          <div className="space-y-2.5 pt-1">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { onClose(); onPlanRoute(venue); }}
              className="w-full py-4 rounded-2xl font-black text-sm tracking-wide"
              style={{
                background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 24px rgba(0,102,255,0.45)",
              }}
            >
              Plan Route →
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl font-medium text-sm"
              style={{
                color: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              Back to Rankings
            </motion.button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
