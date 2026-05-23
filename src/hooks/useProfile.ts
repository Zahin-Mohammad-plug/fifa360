"use client";

import { useCallback, useEffect, useState } from "react";
import { DEMO_PROFILE } from "@/lib/mock-data";
import type { FanProfile } from "@/lib/types";

const KEY = "fifa360.profile.v1";

export function useProfile() {
  const [profile, setProfileState] = useState<FanProfile>(DEMO_PROFILE);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setProfileState({ ...DEMO_PROFILE, ...JSON.parse(raw) });
        setIsOnboarded(true);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((p: FanProfile) => {
    setProfileState(p);
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
      setIsOnboarded(true);
    } catch {
      /* ignore */
    }
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<FanProfile>) => {
      setProfileState((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setProfileState(DEMO_PROFILE);
    setIsOnboarded(false);
  }, []);

  return { profile, setProfile: persist, updateProfile, isOnboarded, ready, reset };
}
