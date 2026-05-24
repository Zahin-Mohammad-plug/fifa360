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

  /* Design-spec additions */
  confidence: number;          // 0-100 atmosphere match %
  rating: number;              // e.g. 4.8
  density: "Low" | "Medium" | "High" | "Packed";
  affiliation: string;         // e.g. "Argentina Supporters Club"
  routeTime: string;           // e.g. "14 min via Metro"
  departureCountdown: number;  // minutes until you should leave
  conciergeInsight: string;    // one-line AI concierge tip
  insights: string[];          // bullet-point insights
}

export interface TransitStep {
  instruction: string;
  duration: number;
  type: "walk" | "train" | "bus" | "arrive";
}

export interface TransitPlan {
  venueId: string;
  totalTime: number;
  steps: TransitStep[];
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
  homeShort: string;   // 3-letter code e.g. "ARG"
  awayShort: string;
  homeColor: string;   // primary team color hex
  awayColor: string;
  kickoff: string;
  time: string;        // display time e.g. "20:00"
  venueCity: string;
  venueName: string;
  league: string;      // short display label e.g. "Group B"
  status: "upcoming" | "live" | "halftime" | "finished";
  scoreHome: number;
  scoreAway: number;
  minute?: string;
  events: MatchEvent[];
  nextMatchId?: string;
  tournament: string;
  round: string;
  isLive?: boolean;    // convenience flag
}

export interface UserPreferences {
  teamPreference?: string;
  partySize: number;
  preferredVibe: "loud" | "relaxed" | "mixed";
  indoorOutdoor: "indoor" | "outdoor" | "any";
  budgetSensitivity: 1 | 2 | 3 | 4;
  transportMode: "driving" | "walking" | "transit";
}

export interface FanPreferences {
  favoriteTeam: string;
  kickoffAlerts: boolean;
  scoreUpdates: boolean;
  routeReminders: boolean;
  crowdWarnings: boolean;
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

/* ─── RSVP voice-call pipeline ─────────────────────────────────────────── */

export type CallStatus =
  | "idle"
  | "initiating"
  | "ringing"
  | "in-progress"
  | "completed"
  | "failed";

export interface TranscriptLine {
  role: "agent" | "venue";
  text: string;
  timestamp: string;
}

export interface RsvpResult {
  confirmed: boolean;
  partySize: number;
  arrivalTime: string;
  confirmationRef?: string;
  notes?: string;
}
