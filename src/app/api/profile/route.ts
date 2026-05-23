import { NextResponse } from "next/server";
import { DEMO_PROFILE } from "@/lib/mock-data";
import type { FanProfile } from "@/lib/types";

// GET /api/profile → server default profile (client persists in localStorage)
export async function GET() {
  return NextResponse.json(DEMO_PROFILE);
}

// POST /api/profile → validate + echo the saved profile
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<FanProfile>;
  const merged: FanProfile = { ...DEMO_PROFILE, ...body, userId: body.userId || DEMO_PROFILE.userId };
  return NextResponse.json({ saved: true, profile: merged });
}
