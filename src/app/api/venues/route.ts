import { NextResponse } from "next/server";
import { VENUES } from "@/data/venues";

export async function GET() {
  return NextResponse.json({ venues: VENUES });
}
