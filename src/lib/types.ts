// ALL shared types live here. Do NOT define types locally in components.

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffUTC: string; // ISO 8601
  venue: string;
  city: string;
  stage: "group" | "r16" | "qf" | "sf" | "final";
  status: "upcoming" | "live" | "finished";
  score?: { home: number; away: number };
}

export interface Team {
  id: string;
  name: string;
  flag: string; // emoji or URL
  primaryColor: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: "bar" | "restaurant" | "fan_zone" | "stadium_adjacent";
  capacity: "intimate" | "medium" | "large";
  atmosphere: "casual" | "lively" | "electric";
  amenities: string[];
  rating: number;
  priceRange: 1 | 2 | 3;
  phone?: string;
  imageUrl?: string;
  aiRankScore?: number; // set by GMI ranking pipeline
  aiRankReason?: string; // set by Claude
}

export interface FanProfile {
  userId: string;
  favoriteTeams: string[]; // team IDs
  watchStyle: "social" | "focused" | "family";
  budgetRange: 1 | 2 | 3;
  maxTravelMinutes: number;
  notificationsEnabled: boolean;
  departureAlertMinutes: number; // how early to alert before kickoff
}

export interface RoutePlan {
  venueId: string;
  matchId: string;
  departureTime: string; // ISO 8601
  arrivalTime: string;
  mode: "walking" | "transit" | "driving";
  steps: RouteStep[];
  shareUrl?: string;
  notificationScheduled: boolean;
}

export interface RouteStep {
  instruction: string;
  durationMinutes: number;
  mode: string;
}

export interface LiveMatchState {
  matchId: string;
  minute: number;
  score: { home: number; away: number };
  possession: { home: number; away: number };
  keyEvents: MatchEvent[];
  tacticalSummary?: string; // Claude-generated
  narrativeMoment?: string; // Claude-generated
}

export interface MatchEvent {
  id: string;
  minute: number;
  type:
    | "goal"
    | "yellow_card"
    | "red_card"
    | "substitution"
    | "var"
    | "kickoff"
    | "halftime"
    | "fulltime";
  team: string;
  player?: string;
  description: string; // Claude-generated plain English
}

export interface ConciergeMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ---- Request/response helper shapes for API contracts ----

export interface VenueRankRequest {
  venues: Venue[];
  profile: FanProfile;
  matchId: string;
}

export type ExplainLevel = "casual" | "enthusiast" | "analyst";

export interface ConciergeAction {
  reply: string;
  action?: "call_venue" | "update_route" | "show_venue";
  actionVenueId?: string;
}
