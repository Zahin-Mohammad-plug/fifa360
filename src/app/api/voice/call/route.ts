import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ callId: `demo-${Date.now()}`, demo: true });
}
