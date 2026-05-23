"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveMatchState } from "@/lib/types";

export function useLiveMatch(matchId: string | null) {
  const [state, setState] = useState<LiveMatchState | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchState = async () => {
      try {
        const res = await fetch(`/api/live?matchId=${matchId}`);
        if (!res.ok) return;
        const data: LiveMatchState = await res.json();
        if (cancelled) return;
        setState((prev) => {
          if (prev && data.keyEvents && prev.keyEvents.length < data.keyEvents.length) {
            const newEvent = data.keyEvents[data.keyEvents.length - 1];
            if (newEvent.type === "goal") {
              try {
                window.dispatchEvent(new CustomEvent("key-moment", { detail: newEvent }));
              } catch {
                // ignore
              }
            }
          }
          return data;
        });
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchState();
    intervalRef.current = setInterval(fetchState, 10_000);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [matchId]);

  return { state, loading };
}
