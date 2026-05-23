export interface ConciergeResult {
  calledAt: string;
  rsvpAvailable: "yes" | "no" | "unclear";
  maxPartySize?: number;
  capacityStatus: "low" | "medium" | "high" | "full-soon";
  recommendedArrival?: string;
  crowdSummary: string;
  teamCrowdSignal?: string;
  seatingMode?: "seated" | "standing" | "mixed" | "unknown";
  audioConfirmed?: boolean;
  specialConditions?: string;
  confidence: number;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  trustLevel: "official" | "verified" | "community";
  vibeTags: string[];
  teamAffinityTags: string[];
  supportsGroups: boolean;
  audioOn: boolean | null;
  priceLevel: 1 | 2 | 3 | 4;
  accessibilityNotes?: string;
  concierge?: ConciergeResult;
  distanceKm?: number;
  etaMinutes?: number;
  score?: number;
  imageUrl?: string;
  capacity?: number;
  rsvpRequired?: boolean;
}

export interface MatchEvent {
  minute: string;
  type: "goal" | "yellow" | "red" | "sub" | "var" | "halftime" | "fulltime" | "kickoff";
  team?: string;
  player?: string;
  summary: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  kickoff: string;
  venueCity: string;
  venueName: string;
  status: "upcoming" | "live" | "halftime" | "finished";
  scoreHome: number;
  scoreAway: number;
  minute?: string;
  events: MatchEvent[];
  nextMatchId?: string;
  tournament: string;
  round: string;
}

export interface UserPreferences {
  teamPreference?: string;
  partySize: number;
  preferredVibe: "loud" | "relaxed" | "mixed";
  indoorOutdoor: "indoor" | "outdoor" | "any";
  budgetSensitivity: 1 | 2 | 3 | 4;
  transportMode: "driving" | "walking" | "transit";
}

export interface RouteInfo {
  origin: { lat: number; lng: number; label: string };
  destination: { lat: number; lng: number; label: string };
  etaMinutes: number;
  distanceKm: number;
  mode: "driving" | "walking" | "transit";
  departureTime: string;
  steps?: string[];
}

export interface SharePlan {
  matchId: string;
  venueId: string;
  kickoff: string;
  routeMode: string;
  departureTime: string;
  venueName: string;
  venueAddress: string;
  lat: number;
  lng: number;
}
