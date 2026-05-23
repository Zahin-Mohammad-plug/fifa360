"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/appStore";
import { Match } from "@/types";

/** Polls /api/live every 30s and syncs the live match into the store */
export function useLiveMatch() {
  const { selectedMatch, setSelectedMatch } = useAppStore();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function fetchLive() {
      try {
        const matchId = selectedMatch?.id;
        const url = matchId ? `/api/live?id=${matchId}` : "/api/live";
        const res = await fetch(url);
        if (!res.ok) return;
        const data: { match: Match } = await res.json();
        if (data.match) setSelectedMatch(data.match);
      } catch {
        // silently fall back to seed data
      }
    }

    fetchLive();
    pollRef.current = setInterval(fetchLive, 30_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedMatch?.id, setSelectedMatch]);
}
