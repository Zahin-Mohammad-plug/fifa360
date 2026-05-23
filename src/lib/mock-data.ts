// ALL mock data lives here. Do not hardcode data in components.
import type {
  FanProfile,
  LiveMatchState,
  Match,
  MatchEvent,
  Team,
  Venue,
} from "./types";

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------
export const TEAMS: Record<string, Team> = {
  bra: { id: "bra", name: "Brazil", flag: "🇧🇷", primaryColor: "#facc15" },
  ger: { id: "ger", name: "Germany", flag: "🇩🇪", primaryColor: "#e5e7eb" },
  arg: { id: "arg", name: "Argentina", flag: "🇦🇷", primaryColor: "#7dd3fc" },
  fra: { id: "fra", name: "France", flag: "🇫🇷", primaryColor: "#60a5fa" },
  usa: { id: "usa", name: "USA", flag: "🇺🇸", primaryColor: "#ef4444" },
  mex: { id: "mex", name: "Mexico", flag: "🇲🇽", primaryColor: "#22c55e" },
  esp: { id: "esp", name: "Spain", flag: "🇪🇸", primaryColor: "#f43f5e" },
  eng: { id: "eng", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", primaryColor: "#cbd5e1" },
};

// Times are computed relative to "now" so the demo always reads sensibly.
const MIN = 60 * 1000;
const nowOffset = (minutes: number) => new Date(Date.now() + minutes * MIN).toISOString();

// ---------------------------------------------------------------------------
// Matches — 1 live, 2 upcoming, 1 finished
// ---------------------------------------------------------------------------
export const MOCK_MATCHES: Match[] = [
  {
    id: "m-bra-ger",
    homeTeam: TEAMS.bra,
    awayTeam: TEAMS.ger,
    kickoffUTC: nowOffset(154), // ~2h34m out — the home "NEXT MATCH"
    venue: "Levi's Stadium",
    city: "Santa Clara",
    stage: "qf",
    status: "upcoming",
  },
  {
    id: "m-arg-fra",
    homeTeam: TEAMS.arg,
    awayTeam: TEAMS.fra,
    kickoffUTC: nowOffset(-67), // kicked off 67' ago → live
    venue: "SoFi Stadium",
    city: "Los Angeles",
    stage: "sf",
    status: "live",
    score: { home: 1, away: 1 },
  },
  {
    id: "m-esp-eng",
    homeTeam: TEAMS.esp,
    awayTeam: TEAMS.eng,
    kickoffUTC: nowOffset(60 * 27), // tomorrow-ish
    venue: "MetLife Stadium",
    city: "New York",
    stage: "qf",
    status: "upcoming",
  },
  {
    id: "m-usa-mex",
    homeTeam: TEAMS.usa,
    awayTeam: TEAMS.mex,
    kickoffUTC: nowOffset(-60 * 22), // yesterday
    venue: "Estadio Azteca",
    city: "Mexico City",
    stage: "group",
    status: "finished",
    score: { home: 2, away: 1 },
  },
];

export const getNextUpcomingMatch = (): Match =>
  MOCK_MATCHES.filter((m) => m.status === "upcoming").sort(
    (a, b) => +new Date(a.kickoffUTC) - +new Date(b.kickoffUTC),
  )[0];

export const getLiveMatch = (): Match | undefined =>
  MOCK_MATCHES.find((m) => m.status === "live");

export const getMatch = (id: string): Match | undefined =>
  MOCK_MATCHES.find((m) => m.id === id);

// ---------------------------------------------------------------------------
// Venues — San Francisco
// ---------------------------------------------------------------------------
export const MOCK_VENUES: Venue[] = [
  {
    id: "v-phoenix",
    name: "The Phoenix Sports Bar",
    address: "811 Valencia St, San Francisco, CA",
    lat: 37.7599,
    lng: -122.4214,
    type: "bar",
    capacity: "large",
    atmosphere: "electric",
    amenities: ["12 big screens", "Sound on for goals", "Standing room", "Craft beer", "Brazilian crowd"],
    rating: 4.7,
    priceRange: 2,
    phone: "+14155550118",
    imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=60",
  },
  {
    id: "v-maddog",
    name: "Mad Dog in the Fog",
    address: "530 Haight St, San Francisco, CA",
    lat: 37.7719,
    lng: -122.4303,
    type: "bar",
    capacity: "medium",
    atmosphere: "lively",
    amenities: ["British pub", "Every match shown", "Darts", "Full English", "Pints"],
    rating: 4.5,
    priceRange: 2,
    phone: "+14155550174",
    imageUrl: "https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=800&q=60",
  },
  {
    id: "v-publicworks",
    name: "Public Works Fan Zone",
    address: "161 Erie St, San Francisco, CA",
    lat: 37.7693,
    lng: -122.4209,
    type: "fan_zone",
    capacity: "large",
    atmosphere: "electric",
    amenities: ["Giant LED wall", "Open-air", "Face paint", "Food trucks", "DJ at half-time"],
    rating: 4.6,
    priceRange: 1,
    phone: "+14155550143",
    imageUrl: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=60",
  },
  {
    id: "v-zeitgeist",
    name: "Zeitgeist Beer Garden",
    address: "199 Valencia St, San Francisco, CA",
    lat: 37.7701,
    lng: -122.4222,
    type: "bar",
    capacity: "large",
    atmosphere: "lively",
    amenities: ["Huge outdoor patio", "Beer garden", "Bloody Marys", "Cash only", "Dog friendly"],
    rating: 4.4,
    priceRange: 1,
    phone: "+14155550199",
    imageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=60",
  },
  {
    id: "v-brixton",
    name: "The Brixton Marina",
    address: "2140 Union St, San Francisco, CA",
    lat: 37.7976,
    lng: -122.4362,
    type: "restaurant",
    capacity: "medium",
    atmosphere: "casual",
    amenities: ["Table service", "Brunch menu", "Cocktails", "Quieter screens", "Reservations"],
    rating: 4.3,
    priceRange: 3,
    phone: "+14155550161",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=60",
  },
  {
    id: "v-kezar",
    name: "Kezar Pub",
    address: "770 Stanyan St, San Francisco, CA",
    lat: 37.7666,
    lng: -122.4528,
    type: "bar",
    capacity: "medium",
    atmosphere: "lively",
    amenities: ["Classic soccer pub", "By Golden Gate Park", "20+ taps", "Wings", "Locals' favorite"],
    rating: 4.6,
    priceRange: 2,
    phone: "+14155550127",
    imageUrl: "https://images.unsplash.com/photo-1467189386127-7d4c3a4c4a4a?w=800&q=60",
  },
  {
    id: "v-finalfinal",
    name: "The Final Final",
    address: "2990 Baker St, San Francisco, CA",
    lat: 37.7989,
    lng: -122.4471,
    type: "bar",
    capacity: "intimate",
    atmosphere: "casual",
    amenities: ["Cozy neighborhood bar", "Free popcorn", "Quiet corner", "Pool table", "Friendly staff"],
    rating: 4.2,
    priceRange: 2,
    phone: "+14155550182",
    imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=60",
  },
  {
    id: "v-chase",
    name: "Chase Center Thrive City",
    address: "1 Warriors Way, San Francisco, CA",
    lat: 37.7680,
    lng: -122.3877,
    type: "stadium_adjacent",
    capacity: "large",
    atmosphere: "electric",
    amenities: ["Outdoor plaza", "Jumbo screen", "Stadium energy", "Many vendors", "Family zone"],
    rating: 4.5,
    priceRange: 2,
    phone: "+14155550155",
    imageUrl: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=60",
  },
];

export const getVenue = (id: string): Venue | undefined =>
  MOCK_VENUES.find((v) => v.id === id);

// ---------------------------------------------------------------------------
// Demo fan profile — Brazil fan, social, mid budget, SF
// ---------------------------------------------------------------------------
export const DEMO_PROFILE: FanProfile = {
  userId: "demo-fan",
  favoriteTeams: ["bra"],
  watchStyle: "social",
  budgetRange: 2,
  maxTravelMinutes: 30,
  notificationsEnabled: true,
  departureAlertMinutes: 60,
};

// Default user location for the demo (Mission District, SF).
export const DEMO_USER_LOCATION = { lat: 37.7625, lng: -122.4226 };

// ---------------------------------------------------------------------------
// Live match seed — Argentina vs France
// ---------------------------------------------------------------------------
// Events are revealed progressively by the /api/live simulator based on minute.
export const MOCK_LIVE_EVENTS: MatchEvent[] = [
  {
    id: "e1",
    minute: 0,
    type: "kickoff",
    team: "arg",
    description: "We're underway at SoFi Stadium — Argentina get the semi-final started against France.",
  },
  {
    id: "e2",
    minute: 23,
    type: "goal",
    team: "arg",
    player: "Julián Álvarez",
    description: "Álvarez pounces on a loose ball at the edge of the box and slots it low into the corner. Argentina lead.",
  },
  {
    id: "e3",
    minute: 31,
    type: "yellow_card",
    team: "fra",
    player: "Aurélien Tchouaméni",
    description: "Tchouaméni is booked for a cynical pull-back as France try to slow Argentina's counter.",
  },
  {
    id: "e4",
    minute: 45,
    type: "halftime",
    team: "arg",
    description: "Half-time at SoFi: Argentina 1, France 0. La Albiceleste have edged a tense first half.",
  },
  {
    id: "e5",
    minute: 58,
    type: "goal",
    team: "fra",
    player: "Kylian Mbappé",
    description: "Mbappé with a moment of magic — he cuts inside, leaves two defenders and curls it home. Level again!",
  },
  {
    id: "e6",
    minute: 64,
    type: "substitution",
    team: "arg",
    player: "Lautaro Martínez",
    description: "Argentina go for it — Lautaro Martínez comes on to add a fresh striker up top.",
  },
];

// Tactical context strings keyed by minute window — feed to the explainer.
export const LIVE_TACTICAL_CONTEXT =
  "Argentina sit in a compact 4-4-2 mid-block protecting central areas, inviting France wide. France build patiently and look for Mbappé isolated on the left. After the equalizer, Argentina pushed a second striker on to regain initiative.";

export const buildLiveState = (minute: number): LiveMatchState => {
  const events = MOCK_LIVE_EVENTS.filter((e) => e.minute <= minute);
  const homeGoals = events.filter((e) => e.type === "goal" && e.team === "arg").length;
  const awayGoals = events.filter((e) => e.type === "goal" && e.team === "fra").length;
  // Possession drifts a little with the clock for a live feel.
  const homePoss = Math.round(54 - Math.sin(minute / 12) * 6);
  return {
    matchId: "m-arg-fra",
    minute,
    score: { home: homeGoals, away: awayGoals },
    possession: { home: homePoss, away: 100 - homePoss },
    keyEvents: [...events].reverse(), // newest first
    tacticalSummary: LIVE_TACTICAL_CONTEXT,
  };
};

// ---------------------------------------------------------------------------
// Finished match summary — USA vs Mexico
// ---------------------------------------------------------------------------
export const FINISHED_MATCH_EVENTS: MatchEvent[] = [
  { id: "f1", minute: 0, type: "kickoff", team: "usa", description: "Kickoff at a roaring Estadio Azteca." },
  { id: "f2", minute: 12, type: "goal", team: "mex", player: "Santiago Giménez", description: "Giménez heads Mexico in front early to send the Azteca wild." },
  { id: "f3", minute: 39, type: "goal", team: "usa", player: "Christian Pulisic", description: "Pulisic answers with a curling strike into the top corner. Level at the break." },
  { id: "f4", minute: 67, type: "red_card", team: "mex", player: "César Montes", description: "Montes is sent off for a last-man challenge — Mexico down to ten." },
  { id: "f5", minute: 84, type: "goal", team: "usa", player: "Folarin Balogun", description: "Balogun pounces late to win it for the USA against ten men." },
  { id: "f6", minute: 90, type: "fulltime", team: "usa", description: "Full time: USA 2, Mexico 1 — a dramatic comeback in the Dos a Cero tradition." },
];

export const FINISHED_MATCH_NARRATIVE =
  "Mexico struck first through Giménez and the Azteca shook, but Pulisic's sublime equalizer steadied the USA before the break. The turning point came on 67' when Montes saw red, and Balogun made the extra man count with a poacher's finish six minutes from time. A gritty 2–1 win that the visitors will savor.";
