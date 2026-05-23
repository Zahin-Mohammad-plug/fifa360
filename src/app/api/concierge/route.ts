import type AnthropicAPI from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { MODELS, anthropic, hasAnthropic } from "@/lib/anthropic";
import {
  DEMO_USER_LOCATION,
  getNextUpcomingMatch,
  getMatch,
  getVenue,
} from "@/lib/mock-data";
import { buildRoutePlan } from "@/lib/routing";
import { formatClock, formatKm, priceLabel } from "@/lib/utils";
import type { ConciergeAction, ConciergeMessage, FanProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

// ---- Tool implementations (shared by Claude path and fallback) ----
function toolGetVenue(venueId: string) {
  return getVenue(venueId) ?? { error: "venue not found" };
}
function toolGetMatch(matchId: string) {
  return getMatch(matchId) ?? getNextUpcomingMatch();
}
type RouteSummary = {
  mode: "walking" | "transit" | "driving";
  distanceKm: number;
  travelMinutes: number;
  departureTime: string;
  arrivalTime: string;
  steps: string[];
};

function toolGetRoute(
  venueId: string,
  mode: "walking" | "transit" | "driving" = "transit",
): RouteSummary | { error: string } {
  const venue = getVenue(venueId);
  const match = getNextUpcomingMatch();
  if (!venue) return { error: "venue not found" };
  const plan = buildRoutePlan({ venue, match, userLocation: DEMO_USER_LOCATION, mode });
  return {
    mode: plan.mode,
    distanceKm: Math.round(plan.distanceKm * 10) / 10,
    travelMinutes: plan.travelMinutes,
    departureTime: plan.departureTime,
    arrivalTime: plan.arrivalTime,
    steps: plan.steps.map((s) => s.instruction),
  };
}

const TOOLS = [
  {
    name: "get_venue_details",
    description: "Get full details for a venue by id (atmosphere, capacity, amenities, rating, price, phone).",
    input_schema: {
      type: "object" as const,
      properties: { venueId: { type: "string" } },
      required: ["venueId"],
    },
  },
  {
    name: "get_route_to_venue",
    description: "Get a route plan (mode, minutes, departure time, steps) from the fan's location to a venue.",
    input_schema: {
      type: "object" as const,
      properties: {
        venueId: { type: "string" },
        mode: { type: "string", enum: ["walking", "transit", "driving"] },
      },
      required: ["venueId"],
    },
  },
  {
    name: "get_match_info",
    description: "Get info about a match by id (teams, kickoff, venue, status, score).",
    input_schema: {
      type: "object" as const,
      properties: { matchId: { type: "string" } },
      required: ["matchId"],
    },
  },
];

function execTool(name: string, input: Record<string, unknown>): unknown {
  if (name === "get_venue_details") return toolGetVenue(String(input.venueId));
  if (name === "get_match_info") return toolGetMatch(String(input.matchId));
  if (name === "get_route_to_venue")
    return toolGetRoute(String(input.venueId), (input.mode as "walking" | "transit" | "driving") || "transit");
  return { error: "unknown tool" };
}

const systemPrompt = (profile: FanProfile, venueId?: string) =>
  `You are FIFA 360's matchday concierge. You help fans plan their World Cup match day.
You have access to venue details, routes, and match information via tools.
Be friendly, specific, and helpful. Keep responses under 3 sentences unless the user asks for more.
Current fan profile: ${JSON.stringify(profile)}
Current venue context: ${venueId ?? "none"}`;

// ---- Heuristic fallback (no API key) — still calls the same tools ----
function heuristicReply(
  messages: ConciergeMessage[],
  venueId?: string,
): ConciergeAction {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content?.toLowerCase() || "";
  const venue = venueId ? getVenue(venueId) : undefined;

  if (venue && /\b(call|phone|reserv|book|table)\b/.test(lastUser)) {
    return {
      reply: `You can reach ${venue.name} at ${venue.phone ?? "the number on their page"}. Want me to set up a route there too?`,
      action: "call_venue",
      actionVenueId: venue.id,
    };
  }
  if (venue && /(train|bart|caltrain|transit|bus|muni|get there|directions|how.*get|drive|walk|far|train)/.test(lastUser)) {
    const r = toolGetRoute(venue.id, /drive|car/.test(lastUser) ? "driving" : /walk/.test(lastUser) ? "walking" : "transit");
    if ("travelMinutes" in r) {
      return {
        reply: `Yes — it's about ${r.travelMinutes} min by ${r.mode} (${formatKm(r.distanceKm)}). ${r.steps[1] ?? r.steps[0]}. I can lock in a departure alert for you.`,
        action: "update_route",
        actionVenueId: venue.id,
      };
    }
  }
  if (venue && /(when|what time|leave|depart)/.test(lastUser)) {
    const r = toolGetRoute(venue.id, "transit");
    if ("departureTime" in r) {
      return {
        reply: `For the next match, leave around ${formatClock(r.departureTime as string)} — that's a ${r.travelMinutes}-min ${r.mode} plus a 30-min buffer. Tap "Get There" and I'll alert you.`,
        action: "update_route",
        actionVenueId: venue.id,
      };
    }
  }
  if (venue && /(price|cost|expensive|cheap|budget|much)/.test(lastUser)) {
    return {
      reply: `${venue.name} sits at ${priceLabel(venue.priceRange)} — ${venue.priceRange <= 2 ? "very wallet-friendly for matchday" : "more of a treat"}. ${venue.amenities[0]}.`,
      action: "show_venue",
      actionVenueId: venue.id,
    };
  }
  if (venue && /(loud|atmos|vibe|busy|packed|crowd|noisy|fun|good)/.test(lastUser)) {
    return {
      reply: `${venue.name} has a ${venue.atmosphere} atmosphere with ${venue.capacity} capacity — ${venue.amenities.slice(0, 2).join(" and ").toLowerCase()}. ${venue.atmosphere === "electric" ? "Expect it packed and loud for big matches." : "A great spot to actually follow the game."}`,
      action: "show_venue",
      actionVenueId: venue.id,
    };
  }
  if (venue) {
    return {
      reply: `${venue.name} is a ${venue.atmosphere} ${venue.type.replace("_", " ")} rated ${venue.rating}★ at ${priceLabel(venue.priceRange)}. Ask me about the vibe, how to get there, or when to leave!`,
      action: "show_venue",
      actionVenueId: venue.id,
    };
  }
  return {
    reply: "I'm your matchday concierge — I can find the right venue, plan your route, and tell you exactly when to leave. Which match are you watching?",
  };
}

// ---- Claude tool-use loop ----
async function claudeReply(
  messages: ConciergeMessage[],
  profile: FanProfile,
  venueId?: string,
): Promise<ConciergeAction> {
  if (!anthropic) return heuristicReply(messages, venueId);
  const convo: { role: "user" | "assistant"; content: unknown }[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  let action: ConciergeAction["action"];

  for (let i = 0; i < 4; i++) {
    const res = await anthropic.messages.create({
      model: MODELS.SONNET,
      max_tokens: 500,
      system: systemPrompt(profile, venueId),
      tools: TOOLS as AnthropicAPI.Tool[],
      messages: convo as AnthropicAPI.MessageParam[],
    });

    if (res.stop_reason === "tool_use") {
      const toolUses = res.content.filter((b) => b.type === "tool_use");
      convo.push({ role: "assistant", content: res.content });
      const results = toolUses.map((tu) => {
        const t = tu as { id: string; name: string; input: Record<string, unknown> };
        if (t.name === "get_route_to_venue") action = "update_route";
        else if (t.name === "get_venue_details" && !action) action = "show_venue";
        return {
          type: "tool_result" as const,
          tool_use_id: t.id,
          content: JSON.stringify(execTool(t.name, t.input)),
        };
      });
      convo.push({ role: "user", content: results });
      continue;
    }

    const text = res.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return { reply: text || heuristicReply(messages, venueId).reply, action, actionVenueId: venueId };
  }
  return heuristicReply(messages, venueId);
}

// POST /api/concierge  body: { messages, profile, venueId? }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const messages = (body.messages as ConciergeMessage[]) || [];
  const profile = body.profile as FanProfile;
  const venueId = body.venueId as string | undefined;

  try {
    const result = hasAnthropic
      ? await claudeReply(messages, profile, venueId)
      : heuristicReply(messages, venueId);
    return NextResponse.json({ ...result, live: hasAnthropic });
  } catch (err) {
    console.error("[concierge] fallback:", (err as Error).message);
    return NextResponse.json({ ...heuristicReply(messages, venueId), live: false });
  }
}
