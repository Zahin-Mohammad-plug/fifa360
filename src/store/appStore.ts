"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Match, Venue, UserPreferences, RouteInfo } from "@/types";
import { NotificationPreferences, DEFAULT_PREFS } from "@/lib/notifications";

interface AppState {
  selectedMatch: Match | null;
  selectedVenue: Venue | null;
  userLocation: { lat: number; lng: number; label: string } | null;
  preferences: UserPreferences;
  notificationPrefs: NotificationPreferences;
  routeInfo: RouteInfo | null;
  activeTab: "discover" | "route" | "live" | "profile";
  conciergeCallsRunning: boolean;
  conciergeCallsDone: boolean;
  shareUrl: string | null;

  setSelectedMatch: (match: Match) => void;
  setSelectedVenue: (venue: Venue | null) => void;
  setUserLocation: (loc: { lat: number; lng: number; label: string }) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  setNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;
  setRouteInfo: (route: RouteInfo | null) => void;
  setActiveTab: (tab: AppState["activeTab"]) => void;
  setConciergeRunning: (v: boolean) => void;
  setConciergeDone: (v: boolean) => void;
  setShareUrl: (url: string | null) => void;
  reset: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  teamPreference: "Argentina",
  partySize: 4,
  preferredVibe: "loud",
  indoorOutdoor: "any",
  budgetSensitivity: 2,
  transportMode: "walking",
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedMatch: null,
      selectedVenue: null,
      userLocation: {
        lat: 40.7484,
        lng: -73.9967,
        label: "Times Square, New York",
      },
      preferences: DEFAULT_PREFERENCES,
      notificationPrefs: DEFAULT_PREFS,
      routeInfo: null,
      activeTab: "discover",
      conciergeCallsRunning: false,
      conciergeCallsDone: false,
      shareUrl: null,

      setSelectedMatch: (match) => set({ selectedMatch: match }),
      setSelectedVenue: (venue) => set({ selectedVenue: venue }),
      setUserLocation: (loc) => set({ userLocation: loc }),
      setPreferences: (prefs) =>
        set((s) => ({ preferences: { ...s.preferences, ...prefs } })),
      setNotificationPrefs: (prefs) =>
        set((s) => ({
          notificationPrefs: { ...s.notificationPrefs, ...prefs },
        })),
      setRouteInfo: (route) => set({ routeInfo: route }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setConciergeRunning: (v) => set({ conciergeCallsRunning: v }),
      setConciergeDone: (v) => set({ conciergeCallsDone: v }),
      setShareUrl: (url) => set({ shareUrl: url }),
      reset: () =>
        set({
          selectedMatch: null,
          selectedVenue: null,
          routeInfo: null,
          activeTab: "discover",
        }),
    }),
    {
      name: "fifa360-store",
      partialize: (state) => ({
        preferences: state.preferences,
        notificationPrefs: state.notificationPrefs,
        selectedMatch: state.selectedMatch,
      }),
    }
  )
);
