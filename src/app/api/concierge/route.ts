import { NextResponse } from "next/server";
import { MOCK_VENUES } from "@/lib/mock-data";
import type { ConciergeMessage } from "@/lib/types";

type Request_ = { messages?: ConciergeMessage[]; venueId?: string; matchId?: string };

function reply(question: string, venueName: string, amenities: string[]): string {
  const q = question.toLowerCase();
  if (q.includes("park")) {
    return `${venueName} doesn't have a dedicated lot, but there's metered street parking nearby and a public garage about a 4-minute walk away. On matchdays I'd recommend transit instead — Uber/Lyft surge can be rough an hour before kickoff.`;
  }
  if (q.includes("food") || q.includes("eat") || q.includes("menu") || q.includes("order")) {
    return `${venueName} has a full kitchen — the wings and loaded fries are the easy crowd-pleasers. ${amenities.includes("Brazilian Menu") ? "Don't sleep on the picanha." : ""}`;
  }
  if (q.includes("drink") || q.includes("beer") || q.includes("happy hour")) {
    return `Happy hour runs through kickoff with $6 drafts. ${amenities.includes("Craft Beer") ? "They rotate 8 craft taps — ask the bartender what's freshest." : ""}`;
  }
  if (q.includes("seat") || q.includes("table") || q.includes("rsvp")) {
    return `Best seats are front-and-center facing the main screen — that section books fast. If you want to lock it in, use the Call & Book button and the AI agent will reserve a table for you.`;
  }
  if (q.includes("transit") || q.includes("bart") || q.includes("muni") || q.includes("bus") || q.includes("metro")) {
    return `Easiest way: take Muni or BART to the closest downtown station, then it's a ~6-minute walk. The Route Planner has the exact directions and a departure alert.`;
  }
  if (q.includes("kid") || q.includes("famil")) {
    return `${venueName} is welcoming for families before 8pm — they have a quieter section near the patio. After 8 the energy ramps up so it's more adult-oriented.`;
  }
  return `Great question! ${venueName} is a ${amenities.slice(0, 2).join(" + ").toLowerCase()} spot. Anything else you want to dig into — atmosphere, getting there, food?`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Request_;
  const venue = MOCK_VENUES.find((v) => v.id === body.venueId) ?? MOCK_VENUES[0];
  const lastUser = [...(body.messages ?? [])].reverse().find((m) => m.role === "user");
  const question = lastUser?.content ?? "";
  return NextResponse.json({ reply: reply(question, venue.name, venue.amenities) });
}
