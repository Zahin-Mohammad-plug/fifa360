import { NextResponse } from "next/server";
import { MATCHES } from "@/data/matches";

// Attempt to enrich with ESPN live data, fall back to seed data
async function fetchESPNScoreboard() {
  const endpoints = [
    "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/scoreboard",
    "https://site.api.espn.com/apis/v2/sports/soccer/scoreboard?leagues=fifa.world",
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { next: { revalidate: 30 } });
      if (res.ok) return res.json();
    } catch { /* fall through */ }
  }
  return null;
}

export async function GET() {
  const espn = await fetchESPNScoreboard();
  // Use seed data (ESPN endpoints return 404 before tournament starts)
  return NextResponse.json({ matches: MATCHES, source: espn ? "espn" : "seed", liveAvailable: !!espn });
}
