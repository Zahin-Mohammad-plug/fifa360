import { NextResponse } from "next/server";
import { MOCK_VENUES } from "@/lib/mock-data";
import { haversineKm } from "@/lib/utils";
import type { Venue } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/venue?matchId=&lat=&lng=&atmosphere=&capacity=&price=&q=
// Returns Venue[] filtered + sorted (rating desc baseline; real AI ranking via POST /api/venue/rank)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const atmosphere = url.searchParams.get("atmosphere");
  const capacity = url.searchParams.get("capacity");
  const price = url.searchParams.get("price");
  const q = url.searchParams.get("q")?.toLowerCase().trim();
  const lat = parseFloat(url.searchParams.get("lat") || "");
  const lng = parseFloat(url.searchParams.get("lng") || "");

  let venues: Venue[] = [...MOCK_VENUES];

  if (atmosphere && atmosphere !== "all") venues = venues.filter((v) => v.atmosphere === atmosphere);
  if (capacity && capacity !== "all") venues = venues.filter((v) => v.capacity === capacity);
  if (price && price !== "all") venues = venues.filter((v) => v.priceRange <= Number(price));
  if (q) {
    venues = venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.amenities.join(" ").toLowerCase().includes(q) ||
        v.type.includes(q),
    );
  }

  const hasLoc = Number.isFinite(lat) && Number.isFinite(lng);
  venues.sort((a, b) => {
    if (hasLoc) {
      const da = haversineKm(lat, lng, a.lat, a.lng);
      const db = haversineKm(lat, lng, b.lat, b.lng);
      return b.rating - a.rating || da - db;
    }
    return b.rating - a.rating;
  });

  return NextResponse.json(venues, { headers: { "Cache-Control": "no-store" } });
}
