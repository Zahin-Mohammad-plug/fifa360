import { NextResponse } from "next/server";
import { MODELS, claudeText, hasAnthropic } from "@/lib/anthropic";
import { cosineSimilarity, embed } from "@/lib/gmi";
import { runPipeline } from "@/lib/rocketride";
import { TEAMS } from "@/lib/mock-data";
import { clamp } from "@/lib/utils";
import type { FanProfile, Venue, VenueRankRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

const ATMOS_FOR_STYLE: Record<FanProfile["watchStyle"], Venue["atmosphere"][]> = {
  social: ["electric", "lively"],
  focused: ["lively", "casual"],
  family: ["casual", "lively"],
};

function profileText(p: FanProfile): string {
  const teams = p.favoriteTeams.map((t) => TEAMS[t]?.name).filter(Boolean).join(", ") || "neutral";
  const styleWords = {
    social: "loud, social, packed crowd, electric atmosphere, fans singing",
    focused: "watch the match closely, good screens, lively but not chaotic",
    family: "family friendly, relaxed, casual, space for kids",
  }[p.watchStyle];
  return `Football fan supporting ${teams}. Wants a ${styleWords} experience. Budget ${"$".repeat(p.budgetRange)}. Prefers travel under ${p.maxTravelMinutes} minutes.`;
}

function venueText(v: Venue): string {
  return `${v.name}: a ${v.atmosphere} ${v.type.replace("_", " ")} with ${v.capacity} capacity, price ${"$".repeat(v.priceRange)}. Features: ${v.amenities.join(", ")}.`;
}

function teamLoyaltyBoost(v: Venue, p: FanProfile): number {
  const text = (v.name + " " + v.amenities.join(" ")).toLowerCase();
  return p.favoriteTeams.some((t) => text.includes((TEAMS[t]?.name || "").toLowerCase())) ? 1 : 0;
}

function templateReason(v: Venue, p: FanProfile, score: number): string {
  const bits: string[] = [];
  if (ATMOS_FOR_STYLE[p.watchStyle].includes(v.atmosphere)) {
    bits.push(`${v.atmosphere} atmosphere that fits your ${p.watchStyle} style`);
  }
  if (v.priceRange <= p.budgetRange) bits.push(`comfortably in your budget`);
  if (teamLoyaltyBoost(v, p)) {
    const team = TEAMS[p.favoriteTeams[0]]?.name;
    bits.push(`a strong ${team} crowd`);
  }
  const headline = v.amenities[0]?.toLowerCase();
  if (bits.length === 0 && headline) bits.push(headline);
  const lead = score > 0.78 ? "Top match" : score > 0.6 ? "Great fit" : "Solid option";
  return `${lead}: ${bits.slice(0, 2).join(" with ")}.`;
}

async function enhanceReasons(top: Venue[], p: FanProfile): Promise<Record<string, string>> {
  if (!hasAnthropic || top.length === 0) return {};
  const list = top
    .map((v, i) => `${i + 1}. ${v.name} — ${v.atmosphere} ${v.type}, ${"$".repeat(v.priceRange)}, ${v.amenities.join(", ")}`)
    .join("\n");
  const { text } = await claudeText({
    model: MODELS.HAIKU,
    maxTokens: 350,
    temperature: 0.6,
    system:
      'You write one-sentence venue recommendations for a football fan. Return ONLY a JSON object mapping the venue number to a single vivid sentence (max 18 words) explaining why it fits this fan. Example: {"1":"...","2":"..."}',
    messages: [
      {
        role: "user",
        content: `Fan profile: ${profileText(p)}\n\nVenues:\n${list}`,
      },
    ],
    fallback: "",
  });
  try {
    const parsed = JSON.parse(text) as Record<string, string>;
    const map: Record<string, string> = {};
    top.forEach((v, i) => {
      const r = parsed[String(i + 1)];
      if (r) map[v.id] = r;
    });
    return map;
  } catch {
    return {};
  }
}

// POST /api/venue/rank  body: { venues, profile, matchId }
export async function POST(req: Request) {
  const { venues, profile } = (await req.json()) as VenueRankRequest;
  if (!Array.isArray(venues) || !profile) {
    return NextResponse.json({ error: "venues and profile required" }, { status: 400 });
  }

  // Try RocketRide orchestration first; fall back to direct embed+rank.
  const rr = await runPipeline<Venue[]>("venue-ranking", { venues, profile });
  if (rr.ran && rr.output) {
    return NextResponse.json({ venues: rr.output, via: "rocketride" });
  }

  // Direct path: GMI embeddings → cosine similarity → blended score.
  const { vectors, live: embedLive } = await embed([profileText(profile), ...venues.map(venueText)]);
  const profileVec = vectors[0];
  const sims = venues.map((_, i) => cosineSimilarity(profileVec, vectors[i + 1]));
  const minS = Math.min(...sims);
  const maxS = Math.max(...sims);
  const span = maxS - minS || 1;

  const ranked: Venue[] = venues.map((v, i) => {
    const semantic = (sims[i] - minS) / span; // 0..1 spread
    const atmosFit = ATMOS_FOR_STYLE[profile.watchStyle].includes(v.atmosphere) ? 1 : 0.4;
    const budgetFit = clamp(1 - Math.abs(v.priceRange - profile.budgetRange) / 2, 0, 1);
    const loyalty = teamLoyaltyBoost(v, profile);
    const ratingFit = (v.rating - 4) / 0.8; // ~0..1 across 4.0–4.8
    const score = clamp(
      0.4 * semantic + 0.22 * atmosFit + 0.16 * budgetFit + 0.14 * loyalty + 0.08 * clamp(ratingFit, 0, 1),
      0.05,
      0.99,
    );
    return { ...v, aiRankScore: Math.round(score * 100) / 100 };
  });

  ranked.sort((a, b) => (b.aiRankScore ?? 0) - (a.aiRankScore ?? 0));

  // Reasons: Claude-enhanced for the top picks, templated for the rest.
  const enhanced = await enhanceReasons(ranked.slice(0, 5), profile);
  for (const v of ranked) {
    v.aiRankReason = enhanced[v.id] || templateReason(v, profile, v.aiRankScore ?? 0);
  }

  return NextResponse.json({
    venues: ranked,
    via: "direct",
    meta: { embeddings: embedLive ? "gmi" : "local", reasons: Object.keys(enhanced).length ? "claude" : "template" },
  });
}
