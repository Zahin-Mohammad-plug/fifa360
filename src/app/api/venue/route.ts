import { NextResponse } from "next/server";
import { MOCK_MATCHES, MOCK_VENUES } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");
  const match = MOCK_MATCHES.find((m) => m.id === matchId) ?? null;
  return NextResponse.json({ match, venues: MOCK_VENUES });
}
