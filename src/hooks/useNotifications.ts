"use client";

import { useCallback, useEffect, useState } from "react";
import type { Match, RoutePlan, Venue } from "@/lib/types";

type Perm = NotificationPermission | "unsupported";

const SUB_KEY = "fifa360.push.subscribed";

export function useNotifications() {
  const [permission, setPermission] = useState<Perm>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") {
      localStorage.setItem(SUB_KEY, "1");
      return true;
    }
    const res = await Notification.requestPermission();
    setPermission(res);
    if (res === "granted") localStorage.setItem(SUB_KEY, "1");
    return res === "granted";
  }, []);

  const notifyNow = useCallback(async (title: string, body: string, url = "/live") => {
    if (!("Notification" in window) || Notification.permission !== "granted") return false;
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) {
        await reg.showNotification(title, { body, data: { url }, tag: title, badge: "/badge.svg" });
      } else {
        new Notification(title, { body });
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  // Schedules the departure alert. Confirms via the API, then fires a local
  // notification. For the live demo the wait is capped so it actually appears.
  const scheduleDeparture = useCallback(
    async (
      plan: RoutePlan,
      match: Match,
      venue: Venue,
      opts?: { demoCapMs?: number },
    ): Promise<{ scheduled: boolean; notifyAt: string; fireInMs: number }> => {
      let notifyAt = plan.departureTime;
      try {
        const res = await fetch("/api/route-plan/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ routePlan: plan, pushSubscription: null }),
        });
        const json = await res.json();
        if (json.notifyAt) notifyAt = json.notifyAt;
      } catch {
        /* keep computed time */
      }

      const realDelay = Math.max(0, +new Date(notifyAt) - Date.now());
      const cap = opts?.demoCapMs ?? 6000;
      const fireInMs = Math.min(realDelay || cap, cap);

      const title = `Time to leave for ${venue.name}! ⚽`;
      const body = `${match.homeTeam.name} vs ${match.awayTeam.name} — kick off soon. Tap for your route.`;
      window.setTimeout(() => {
        void notifyNow(title, body, `/route?venueId=${venue.id}&matchId=${match.id}`);
      }, fireInMs);

      return { scheduled: true, notifyAt, fireInMs };
    },
    [notifyNow],
  );

  return { permission, requestPermission, notifyNow, scheduleDeparture };
}

// Global listener: fire a push when a goal/key moment is dispatched by the
// live module via window CustomEvent('key-moment').
export function useKeyMomentNotifier() {
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { title?: string; body?: string; url?: string };
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      navigator.serviceWorker?.getRegistration().then((reg) => {
        const title = detail?.title || "Key moment! ⚽";
        const body = detail?.body || "Something just happened in the match.";
        if (reg) reg.showNotification(title, { body, data: { url: detail?.url || "/live" }, tag: title });
        else new Notification(title, { body });
      });
    };
    window.addEventListener("key-moment", handler as EventListener);
    return () => window.removeEventListener("key-moment", handler as EventListener);
  }, []);
}
