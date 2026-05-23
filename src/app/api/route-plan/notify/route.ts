import { NextResponse } from "next/server";
import type { RoutePlan } from "@/lib/types";

export const dynamic = "force-dynamic";

// POST /api/route-plan/notify  body: { routePlan, pushSubscription }
// For the hackathon the actual local notification is fired by the service
// worker on the client; this endpoint confirms the schedule + computes notifyAt.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const routePlan = body.routePlan as RoutePlan | undefined;
  if (!routePlan?.departureTime) {
    return NextResponse.json({ scheduled: false, error: "routePlan required" }, { status: 400 });
  }

  const notifyAt = routePlan.departureTime; // alert the moment they should leave
  const delayMs = +new Date(notifyAt) - Date.now();

  return NextResponse.json({
    scheduled: true,
    notifyAt,
    delayMs: Math.max(0, delayMs),
  });
}
