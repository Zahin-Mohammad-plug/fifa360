"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppStore } from "@/store/appStore";
import { EVENT_LABELS, NotificationEventType, requestNotificationPermission, simulateMatchNotifications } from "@/lib/notifications";
import { Bell, BellOff, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

function ToggleRow({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/70">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative w-11 h-6 rounded-full border transition-all duration-200 shrink-0",
          enabled
            ? "bg-cyan-500/30 border-cyan-500/50"
            : "bg-white/8 border-white/15"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 shadow-sm",
            enabled ? "left-[22px] bg-cyan-400" : "left-0.5 bg-white/30"
          )}
        />
      </button>
    </div>
  );
}

export function NotificationSheet({ open, onClose }: Props) {
  const { notificationPrefs, setNotificationPrefs, selectedMatch } = useAppStore();
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);

  const handleToggleMain = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);
    }
    setNotificationPrefs({ enabled: val });
  };

  const handleToggleType = (type: NotificationEventType, val: boolean) => {
    setNotificationPrefs({
      types: { ...notificationPrefs.types, [type]: val },
    });
  };

  const handleDemoNotifications = () => {
    if (!selectedMatch) return;
    setDemoRunning(true);
    simulateMatchNotifications(
      `${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}`,
      { ...notificationPrefs, enabled: true }
    );
    setTimeout(() => setDemoRunning(false), 65000);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-[#0a0f1e] border-t border-white/10 rounded-t-3xl max-h-[85vh] overflow-y-auto p-0"
      >
        <div className="px-4 pt-5 pb-8 space-y-5">
          <SheetHeader className="text-left">
            <SheetTitle className="text-white text-xl font-black flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              Match Alerts
            </SheetTitle>
            <p className="text-xs text-white/40 mt-1">
              Get notified for goals, cards, and key match moments.
            </p>
          </SheetHeader>

          {permissionDenied && (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 flex items-start gap-2">
              <BellOff className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300">
                Notifications were blocked. Enable them in your browser settings.
              </p>
            </div>
          )}

          {/* Master toggle */}
          <div
            className={cn(
              "rounded-2xl border p-4 transition-all",
              notificationPrefs.enabled
                ? "border-cyan-500/30 bg-cyan-500/8"
                : "border-white/10 bg-white/3"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Enable Notifications</div>
                <div className="text-[11px] text-white/40 mt-0.5">
                  {notificationPrefs.enabled ? "Alerts are active" : "Tap to turn on alerts"}
                </div>
              </div>
              <button
                onClick={() => handleToggleMain(!notificationPrefs.enabled)}
                className={cn(
                  "relative w-12 h-7 rounded-full border transition-all duration-200",
                  notificationPrefs.enabled
                    ? "bg-cyan-500/40 border-cyan-500/60"
                    : "bg-white/8 border-white/20"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 w-5 h-5 rounded-full transition-all duration-200 shadow",
                    notificationPrefs.enabled ? "left-[26px] bg-cyan-400" : "left-1 bg-white/40"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Per-type toggles */}
          {notificationPrefs.enabled && (
            <div className="bg-white/3 border border-white/8 rounded-2xl px-4">
              <div className="text-[10px] text-white/30 font-medium uppercase tracking-wider pt-3 pb-1">
                Alert Types
              </div>
              {(Object.keys(EVENT_LABELS) as NotificationEventType[]).map((type) => (
                <ToggleRow
                  key={type}
                  label={EVENT_LABELS[type]}
                  enabled={notificationPrefs.types[type]}
                  onChange={(v) => handleToggleType(type, v)}
                />
              ))}
            </div>
          )}

          {/* Demo button */}
          {notificationPrefs.enabled && selectedMatch && (
            <button
              onClick={handleDemoNotifications}
              disabled={demoRunning}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all",
                demoRunning
                  ? "border-white/10 text-white/30 bg-white/3"
                  : "border-violet-500/30 text-violet-300 bg-violet-500/10 active:scale-[0.97]"
              )}
            >
              <Play className={cn("w-4 h-4", demoRunning && "animate-pulse")} />
              {demoRunning ? "Sending demo alerts…" : "Run Demo Alerts"}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#0a0f1e] active:scale-[0.98] transition-all"
          >
            Done
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
