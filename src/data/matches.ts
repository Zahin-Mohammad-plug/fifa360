import { Match } from "@/types";

export const MATCHES: Match[] = [
  {
    id: "match-001",
    homeTeam: "Argentina",
    awayTeam: "France",
    homeFlag: "🇦🇷",
    awayFlag: "🇫🇷",
    kickoff: "2026-06-21T20:00:00-05:00",
    venueCity: "New York",
    venueName: "MetLife Stadium",
    status: "live",
    scoreHome: 2,
    scoreAway: 1,
    minute: "67",
    tournament: "FIFA World Cup 2026",
    round: "Group Stage – Match Day 2",
    nextMatchId: "match-002",
    events: [
      {
        minute: "0",
        type: "kickoff",
        summary: "Kickoff! Argentina vs France underway at MetLife Stadium.",
      },
      {
        minute: "12",
        type: "goal",
        team: "Argentina",
        player: "L. Messi",
        summary: "GOAL! Messi curls one into the top corner. Argentina lead 1–0.",
      },
      {
        minute: "28",
        type: "yellow",
        team: "France",
        player: "A. Tchouaméni",
        summary: "Yellow card for Tchouaméni – late challenge in midfield.",
      },
      {
        minute: "34",
        type: "goal",
        team: "France",
        player: "K. Mbappé",
        summary: "GOAL! Mbappé equalizes with a stunning solo run. 1–1.",
      },
      {
        minute: "45",
        type: "halftime",
        summary: "Half-time: Argentina 1–1 France. Absorbing encounter so far.",
      },
      {
        minute: "58",
        type: "sub",
        team: "Argentina",
        player: "E. Fernández → J. Dybala",
        summary: "Argentina make a change: Dybala on for Fernández.",
      },
      {
        minute: "67",
        type: "goal",
        team: "Argentina",
        player: "J. Dybala",
        summary: "GOAL! Dybala scores within 9 minutes of coming on. Argentina lead 2–1!",
      },
    ],
  },
  {
    id: "match-002",
    homeTeam: "Brazil",
    awayTeam: "Germany",
    homeFlag: "🇧🇷",
    awayFlag: "🇩🇪",
    kickoff: "2026-06-22T15:00:00-05:00",
    venueCity: "New York",
    venueName: "MetLife Stadium",
    status: "upcoming",
    scoreHome: 0,
    scoreAway: 0,
    tournament: "FIFA World Cup 2026",
    round: "Group Stage – Match Day 2",
    nextMatchId: "match-003",
    events: [],
  },
  {
    id: "match-003",
    homeTeam: "Spain",
    awayTeam: "England",
    homeFlag: "🇪🇸",
    awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    kickoff: "2026-06-23T20:00:00-05:00",
    venueCity: "Los Angeles",
    venueName: "SoFi Stadium",
    status: "upcoming",
    scoreHome: 0,
    scoreAway: 0,
    tournament: "FIFA World Cup 2026",
    round: "Group Stage – Match Day 3",
    events: [],
  },
  {
    id: "match-004",
    homeTeam: "Portugal",
    awayTeam: "Morocco",
    homeFlag: "🇵🇹",
    awayFlag: "🇲🇦",
    kickoff: "2026-06-24T12:00:00-05:00",
    venueCity: "Dallas",
    venueName: "AT&T Stadium",
    status: "upcoming",
    scoreHome: 0,
    scoreAway: 0,
    tournament: "FIFA World Cup 2026",
    round: "Group Stage – Match Day 3",
    events: [],
  },
  {
    id: "match-005",
    homeTeam: "Netherlands",
    awayTeam: "Japan",
    homeFlag: "🇳🇱",
    awayFlag: "🇯🇵",
    kickoff: "2026-06-24T20:00:00-05:00",
    venueCity: "Miami",
    venueName: "Hard Rock Stadium",
    status: "finished",
    scoreHome: 3,
    scoreAway: 2,
    tournament: "FIFA World Cup 2026",
    round: "Group Stage – Match Day 3",
    events: [
      { minute: "7", type: "goal", team: "Japan", player: "Kamada", summary: "Japan shock Netherlands with an early goal." },
      { minute: "23", type: "goal", team: "Netherlands", player: "Depay", summary: "Depay levels with a powerful header." },
      { minute: "41", type: "goal", team: "Netherlands", player: "Gakpo", summary: "Gakpo puts Netherlands ahead before half-time." },
      { minute: "45", type: "halftime", summary: "Half-time: Netherlands 2–1 Japan." },
      { minute: "61", type: "goal", team: "Japan", player: "Ueda", summary: "Japan level again through Ueda's header." },
      { minute: "88", type: "goal", team: "Netherlands", player: "Van Dijk", summary: "Van Dijk wins it late for Netherlands! 3–2." },
      { minute: "90", type: "fulltime", summary: "Full-time: Netherlands 3–2 Japan. Thrilling finish." },
    ],
  },
];

export const getMatch = (id: string): Match | undefined =>
  MATCHES.find((m) => m.id === id);

export const getLiveMatch = (): Match | undefined =>
  MATCHES.find((m) => m.status === "live");

export const getNextMatch = (currentId: string): Match | undefined => {
  const current = getMatch(currentId);
  if (!current?.nextMatchId) return undefined;
  return getMatch(current.nextMatchId);
};
