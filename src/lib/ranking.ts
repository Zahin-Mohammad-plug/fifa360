import { Venue, UserPreferences, Match } from "@/types";

interface ScoredVenue extends Venue {
  score: number;
  scoreBreakdown: {
    distance: number;
    teamCrowd: number;
    capacity: number;
    groupFriendly: number;
    atmosphere: number;
    sourceTrust: number;
    amenities: number;
  };
  explanationChips: string[];
}

function normalizeDistance(etaMinutes: number): number {
  // Lower ETA = higher score. Max score at 0 min, 0 at 60+ min
  return Math.max(0, 1 - etaMinutes / 60);
}

function scoreTeamCrowd(venue: Venue, teamPreference?: string): number {
  if (!teamPreference) return 0.5;
  const conciergeSignal = venue.concierge?.teamCrowdSignal?.toLowerCase();
  const affinityMatch = venue.teamAffinityTags
    .map((t) => t.toLowerCase())
    .includes(teamPreference.toLowerCase());
  if (conciergeSignal?.toLowerCase() === teamPreference.toLowerCase()) return 1;
  if (affinityMatch) return 0.8;
  return 0.3;
}

function scoreCapacity(venue: Venue): number {
  const status = venue.concierge?.capacityStatus;
  if (!status) return 0.5;
  const map: Record<string, number> = {
    low: 0.95,
    medium: 0.75,
    high: 0.45,
    "full-soon": 0.1,
  };
  return map[status] ?? 0.5;
}

function scoreGroupFriendly(venue: Venue, partySize: number): number {
  if (!venue.supportsGroups && partySize > 4) return 0.2;
  if (venue.supportsGroups) return 1.0;
  return 0.6;
}

function scoreAtmosphere(venue: Venue, preferredVibe: string): number {
  const vibeMap: Record<string, string[]> = {
    loud: ["Electric", "Loud", "Supporters", "Massive Screens"],
    relaxed: ["Chilled", "Casual", "Premium", "Local"],
    mixed: ["Mixed", "Neighborhood", "Rooftop", "Late Night"],
  };
  const targets = vibeMap[preferredVibe] ?? [];
  const matches = venue.vibeTags.filter((v) =>
    targets.some((t) => v.toLowerCase().includes(t.toLowerCase()))
  ).length;
  return Math.min(1, matches / Math.max(1, targets.length));
}

function scoreTrust(venue: Venue): number {
  const map: Record<string, number> = {
    official: 1.0,
    verified: 0.85,
    community: 0.6,
  };
  return map[venue.trustLevel] ?? 0.5;
}

function scoreAmenities(venue: Venue, preferences: UserPreferences): number {
  let score = 0.5;
  if (venue.audioOn === true) score += 0.2;
  if (venue.priceLevel <= preferences.budgetSensitivity) score += 0.15;
  if (venue.accessibilityNotes) score += 0.1;
  if (venue.concierge?.rsvpAvailable === "yes") score += 0.05;
  return Math.min(1, score);
}

function generateChips(venue: Venue, prefs: UserPreferences, breakdown: ScoredVenue["scoreBreakdown"]): string[] {
  const chips: string[] = [];

  if (breakdown.teamCrowd >= 0.8 && prefs.teamPreference) {
    chips.push(`Best ${prefs.teamPreference} crowd`);
  }
  if (breakdown.distance >= 0.85 && venue.etaMinutes !== undefined) {
    chips.push(`Shortest ETA (${venue.etaMinutes} min)`);
  }
  if (breakdown.capacity >= 0.9) {
    chips.push("Plenty of space");
  }
  if (breakdown.groupFriendly >= 0.9 && prefs.partySize > 4) {
    chips.push("Takes group RSVP");
  }
  if (venue.trustLevel === "official") {
    chips.push("Official Fan Zone");
  }
  if (venue.trustLevel === "verified") {
    chips.push("Venue verified");
  }
  if (venue.audioOn) {
    chips.push("Audio confirmed");
  }
  if (breakdown.atmosphere >= 0.7) {
    chips.push("Matches your vibe");
  }
  if (venue.concierge?.seatingMode === "seated") {
    chips.push("Seated available");
  }
  if (venue.priceLevel === 1) {
    chips.push("Budget-friendly");
  }
  return chips.slice(0, 3);
}

export function rankVenues(
  venues: Venue[],
  preferences: UserPreferences,
  _match?: Match
): ScoredVenue[] {
  const weights = {
    distance: 0.20,
    teamCrowd: 0.20,
    capacity: 0.15,
    groupFriendly: 0.10,
    atmosphere: 0.15,
    sourceTrust: 0.10,
    amenities: 0.10,
  };

  const scored: ScoredVenue[] = venues.map((venue) => {
    const breakdown = {
      distance: normalizeDistance(venue.etaMinutes ?? 30),
      teamCrowd: scoreTeamCrowd(venue, preferences.teamPreference),
      capacity: scoreCapacity(venue),
      groupFriendly: scoreGroupFriendly(venue, preferences.partySize),
      atmosphere: scoreAtmosphere(venue, preferences.preferredVibe),
      sourceTrust: scoreTrust(venue),
      amenities: scoreAmenities(venue, preferences),
    };

    const score = Object.entries(weights).reduce(
      (acc, [key, weight]) =>
        acc + (breakdown[key as keyof typeof breakdown] * weight),
      0
    ) * 100;

    return {
      ...venue,
      score: Math.round(score),
      scoreBreakdown: breakdown,
      explanationChips: generateChips(venue, preferences, breakdown),
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}
