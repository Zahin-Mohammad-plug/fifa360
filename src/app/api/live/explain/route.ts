import { NextResponse } from "next/server";
import { MODELS, claudeText } from "@/lib/anthropic";
import { LIVE_TACTICAL_CONTEXT } from "@/lib/mock-data";
import type { ExplainLevel, LiveMatchState, MatchEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

const FALLBACK: Record<ExplainLevel, string> = {
  casual:
    "Argentina just dropped deeper to protect the middle — they're happy to let France have the ball out wide where it's less dangerous.",
  enthusiast:
    "Argentina have settled into a compact 4-4-2 mid-block, with the midfield band screening the back four and funnelling France into wide areas.",
  analyst:
    "Argentina maintain a narrow mid-block, prioritising central compactness to deny line-breaking passes. France are forced wide, and the second striker now presses the pivot to disrupt the first phase of build-up.",
};

// POST /api/live/explain  body: { event, context, level }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const level = (body.level as ExplainLevel) || "casual";
  const event = body.event as MatchEvent | undefined;
  const context = body.context as LiveMatchState | undefined;

  const last3 = (context?.keyEvents || [])
    .slice(0, 3)
    .map((e) => `${e.minute}' ${e.type} ${e.player ?? ""}`.trim())
    .join("; ");

  const { text: explanation, live } = await claudeText({
    model: MODELS.SONNET,
    maxTokens: 220,
    temperature: 0.6,
    system: "You are a football tactical analyst.",
    messages: [
      {
        role: "user",
        content: `Explain the following match situation for a ${level} audience.
Keep it to 2-3 sentences max. Do not use jargon for 'casual'. Use precise terms for 'analyst'.
Situation: ${context?.tacticalSummary || LIVE_TACTICAL_CONTEXT}
${event ? `Triggering moment: ${event.minute}' ${event.type} ${event.player ?? ""} — ${event.description}` : ""}
Recent events: ${last3 || "early in the half"}`,
      },
    ],
    fallback: FALLBACK[level],
  });

  return NextResponse.json({ explanation, level, live });
}
