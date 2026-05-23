"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Match, Venue, UserPreferences, RouteInfo, FanPreferences } from "@/types";

interface AppState {
  selectedMatch: Match | null;
  selectedVenue: Venue | null;
  userLocation: { lat: number; lng: number; label: string } | null;
  preferences: UserPreferences;
  fanPrefs: FanPreferences;
  routeInfo: RouteInfo | null;
  activeTab: "discover" | "route" | "live" | "profile";
  shareUrl: string | null;

  setSelectedMatch: (match: Match) => void;
  setSelectedVenue: (venue: Venue | null) => void;
  setUserLocation: (loc: { lat: number; lng: number; label: string }) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  setFanPrefs: (prefs: Partial<FanPreferences>) => void;
  setRouteInfo: (route: RouteInfo | null) => void;
  setActiveTab: (tab: AppState["activeTab"]) => void;
  setShareUrl: (url: string | null) => void;
  reset: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  teamPreference: "Argentina",
  partySize: 4,
  preferredVibe: "loud",
  indoorOutdoor: "any",
  budgetSensitivity: 2,
  transportMode: "transit",
};

const DEFAULT_FAN_PREFS: FanPreferences = {
  favoriteTeam: "Argentina",
  kickoffAlerts: true,
  scoreUpdates: true,
  routeReminders: false,
  crowdWarnings: false,
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
      fanPrefs: DEFAULT_FAN_PREFS,
      routeInfo: null,
      activeTab: "discover",
      shareUrl: null,

      setSelectedMatch:  (match)  => set({ selectedMatch: match }),
      setSelectedVenue:  (venue)  => set({ selectedVenue: venue }),
      setUserLocation:   (loc)    => set({ userLocation: loc }),
      setPreferences:    (prefs)  => set((s) => ({ preferences: { ...s.preferences, ...prefs } })),
      setFanPrefs:       (prefs)  => set((s) => ({ fanPrefs: { ...s.fanPrefs, ...prefs } })),
      setRouteInfo:      (route)  => set({ routeInfo: route }),
      setActiveTab:      (tab)    => set({ activeTab: tab }),
      setShareUrl:       (url)    => set({ shareUrl: url }),
      reset: () =>
        set({
          selectedMatch: null,
          selectedVenue: null,
          routeInfo: null,
          activeTab: "discover",
        }),
    }),
    {
      name: "matchday-store-v2",
      partialize: (state) => ({
        preferences: state.preferences,
        fanPrefs:    state.fanPrefs,
        selectedMatch: state.selectedMatch,
      }),
    }
  )
);
