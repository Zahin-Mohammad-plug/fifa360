import { NextResponse } from "next/server";
import { generateRsvpConfirmation } from "@/lib/rocketride-server";

/**
 * POST /api/voice/rsvp
 *
 * Receives the negotiated RSVP result and returns an AI-generated
 * confirmation message via the rsvp-confirm.pipe (RocketRide + GMI Cloud).
 * Falls back to a template message if the pipeline is unavailable.
 *
 * Request body:
 *   { confirmed, partySize, arrivalTime, confirmationRef?, notes?, venueId, matchId? }
 */

interface RsvpPayload {
  confirmed: boolean;
  partySize: number;
  arrivalTime: string;
  confirmationRef?: string;
  notes?: string;
  venueId: string;
  matchId?: string;
  venueName?: string;
}

const MEMORY_STORE = new Map<string, RsvpPayload & { confirmationMessage: string }>();

function fallbackMessage(p: RsvpPayload): string {
  if (!p.confirmed) {
    return `The venue couldn't accommodate a party of ${p.partySize} at ${p.arrivalTime}. We'll line up an alternate match-screening for you in a moment.`;
  }
  const ref = p.confirmationRef ? ` Reference #${p.confirmationRef}.` : "";
  const note = p.notes ? ` ${p.notes}` : "";
  return `Confirmed — table for ${p.partySize} held at ${p.arrivalTime}.${ref}${note} See you on matchday.`;
}

export async function POST(request: Request) {
  let body: Partial<RsvpPayload>;
  try {
    body = (await request.json()) as Partial<RsvpPayload>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof body.partySize !== "number" ||
    typeof body.arrivalTime !== "string" ||
    typeof body.venueId !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing required fields: partySize, arrivalTime, venueId" },
      { status: 400 }
    );
  }

  const payload: RsvpPayload = {
    confirmed: body.confirmed ?? true,
    partySize: body.partySize,
    arrivalTime: body.arrivalTime,
    confirmationRef: body.confirmationRef,
    notes: body.notes,
    venueId: body.venueId,
    matchId: body.matchId,
    venueName: body.venueName,
  };

  // Try RocketRide pipeline first, fall back to template on any error
  let confirmationMessage: string;
  try {
    confirmationMessage = await generateRsvpConfirmation({
      venueName: payload.venueName ?? payload.venueId,
      partySize: payload.partySize,
      arrivalTime: payload.arrivalTime,
      confirmationRef: payload.confirmationRef,
      notes: payload.notes,
      confirmed: payload.confirmed,
    });
    if (!confirmationMessage) confirmationMessage = fallbackMessage(payload);
  } catch {
    confirmationMessage = fallbackMessage(payload);
  }

  const key = `${payload.venueId}:${payload.matchId ?? "_"}`;
  MEMORY_STORE.set(key, { ...payload, confirmationMessage });

  return NextResponse.json({ success: true, confirmationMessage });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const venueId = url.searchParams.get("venueId");
  const matchId = url.searchParams.get("matchId") ?? "_";

  if (!venueId) {
    return NextResponse.json({ error: "Missing venueId" }, { status: 400 });
  }

  const key = `${venueId}:${matchId}`;
  const rsvp = MEMORY_STORE.get(key) ?? null;
  return NextResponse.json({ rsvp });
}
