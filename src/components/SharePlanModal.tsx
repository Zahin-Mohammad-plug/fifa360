"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Match, Venue, RouteInfo } from "@/types";
import { buildShareUrl, formatKickoff } from "@/lib/shareLink";
import { Check, Copy, Share2, Clock, MapPin, Navigation } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  match: Match;
  venue: Venue;
  route: RouteInfo | null;
}

export function SharePlanModal({ open, onClose, match, venue, route }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = buildShareUrl({
    matchId: match.id,
    venueId: venue.id,
    kickoff: match.kickoff,
    routeMode: route?.mode ?? "walking",
    departureTime: route?.departureTime ?? "",
    venueName: venue.name,
    venueAddress: venue.address,
    lat: venue.lat,
    lng: venue.lng,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for environments without clipboard API
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: `Watching ${match.homeTeam} vs ${match.awayTeam} at ${venue.name}`,
        text: `Join me! Watching ${match.homeTeam} ${match.homeFlag} vs ${match.awayFlag} ${match.awayTeam} at ${venue.name}. ${route ? `Leaving at ${route.departureTime}` : ""}`,
        url: shareUrl,
      });
    } catch {
      // User cancelled or not supported
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#0a0f1e] border border-white/10 rounded-3xl p-0 max-w-sm mx-auto overflow-hidden">
        <div className="p-5 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-black flex items-center gap-2">
              <Share2 className="w-5 h-5 text-cyan-400" />
              Share Plan
            </DialogTitle>
          </DialogHeader>

          {/* Plan summary card */}
          <div className="bg-gradient-to-br from-white/8 to-white/3 rounded-2xl border border-white/10 p-4 space-y-3">
            {/* Match */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{match.homeFlag}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">
                  {match.homeTeam} vs {match.awayTeam}
                </div>
                <div className="text-[11px] text-white/40">{formatKickoff(match.kickoff)}</div>
              </div>
              <span className="text-2xl">{match.awayFlag}</span>
            </div>

            <div className="border-t border-white/8" />

            {/* Venue */}
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-magenta-400 mt-0.5 shrink-0" style={{ color: "#ff2d78" }} />
              <div>
                <div className="text-xs font-semibold text-white">{venue.name}</div>
                <div className="text-[10px] text-white/40">{venue.address}</div>
              </div>
            </div>

            {/* Route info */}
            {route && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                  <Navigation className="w-3 h-3 text-cyan-400" />
                  <span>{route.mode} · {route.etaMinutes} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Leave at {route.departureTime}</span>
                </div>
              </div>
            )}
          </div>

          {/* URL display */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <span className="text-[10px] text-white/30 truncate flex-1 font-mono">
              {shareUrl.length > 60 ? shareUrl.slice(0, 57) + "…" : shareUrl}
            </span>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 active:scale-[0.97] transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>

            {typeof navigator !== "undefined" && "share" in navigator ? (
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#0a0f1e] active:scale-[0.97] transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-white/8 text-white/50 border border-white/10 active:scale-[0.97] transition-all"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
