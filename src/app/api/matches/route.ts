import { NextResponse } from "next/server";
import { MOCK_MATCHES } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

// GET /api/matches → Match[] (upcoming + live + finished, mock data)
export async function GET() {
  return NextResponse.json(MOCK_MATCHES, {
    headers: { "Cache-Control": "no-store" },
  });
}
