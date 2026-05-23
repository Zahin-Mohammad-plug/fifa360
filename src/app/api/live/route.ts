import { NextResponse } from "next/server";
import { MATCHES } from "@/data/matches";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("id");
  const match = matchId ? MATCHES.find((m) => m.id === matchId) : MATCHES.find((m) => m.status === "live");
  if (!match) return NextResponse.json({ error: "match not found" }, { status: 404 });
  return NextResponse.json({ match });
}
