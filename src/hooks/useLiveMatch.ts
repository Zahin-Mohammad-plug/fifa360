"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TEAMS } from "@/lib/mock-data";
import type { LiveMatchState, MatchEvent } from "@/lib/types";

export function useLiveMatch(matchId: string, intervalMs = 6000) {
  const [state, setState] = useState<LiveMatchState | null>(null);
  const [loading, setLoading] = useState(true);
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());
  const seen = useRef<Set<string>>(new Set());

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/live?matchId=${matchId}`, { cache: "no-store" });
      const data: LiveMatchState = await res.json();

      // Detect newly arrived events for animation + key-moment dispatch.
      const fresh: MatchEvent[] = data.keyEvents.filter((e) => !seen.current.has(e.id));
      if (seen.current.size > 0 && fresh.length > 0) {
        setNewEventIds(new Set(fresh.map((e) => e.id)));
        for (const ev of fresh) {
          if (ev.type === "goal") {
            const team = TEAMS[ev.team]?.name ?? ev.team;
            window.dispatchEvent(
              new CustomEvent("key-moment", {
                detail: {
                  title: `GOAL! ${ev.player ?? team} ⚽`,
                  body: `${ev.minute}' — ${ev.description}`,
                  url: `/live`,
                  event: ev,
                },
              }),
            );
          }
        }
        setTimeout(() => setNewEventIds(new Set()), 2500);
      }
      data.keyEvents.forEach((e) => seen.current.add(e.id));
      setState(data);
    } catch {
      /* keep last state */
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, intervalMs);
    return () => clearInterval(id);
  }, [poll, intervalMs]);

  return { state, loading, newEventIds, refresh: poll };
}
