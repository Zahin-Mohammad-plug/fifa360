import { NextResponse } from "next/server";

/**
 * POST /api/voice/rsvp
 *
 * Receives the negotiated RSVP result from the AI voice-call pipeline
 * and returns a confirmation message. Mirrors the production endpoint
 * shape (which uses RocketRide + GMI) so the client pipeline does not
 * need to know whether it's running against the demo stub or the real
 * model-backed service.
 *
 * Request body:
 *   { confirmed, partySize, arrivalTime, confirmationRef?, notes?,
 *     venueId, matchId? }
 *
 * Response:
 *   { success: true, confirmationMessage: string }
 */

interface RsvpPayload {
  confirmed: boolean;
  partySize: number;
  arrivalTime: string;
  confirmationRef?: string;
  notes?: string;
  venueId: string;
  matchId?: string;
}

const MEMORY_STORE = new Map<string, RsvpPayload & { confirmationMessage: string }>();

function buildConfirmationMessage(p: RsvpPayload): string {
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

  if (typeof body.partySize !== "number" || typeof body.arrivalTime !== "string" || typeof body.venueId !== "string") {
    return NextResponse.json(
      { error: "Missing required fields: partySize, arrivalTime, venueId" },
      { status: 400 },
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
  };

  const confirmationMessage = buildConfirmationMessage(payload);

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
