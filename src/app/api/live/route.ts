import { NextResponse } from "next/server";
import { MOCK_LIVE_STATE } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_LIVE_STATE);
}
