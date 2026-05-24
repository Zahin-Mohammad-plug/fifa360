import { NextResponse } from "next/server";
import { suggestLiveQuestions, answerLiveQuestion } from "@/lib/rocketride-server";
import type { MatchEvent } from "@/types";

/**
 * POST /api/rocketride/live-explain
 *
 * mode = "questions" → returns { questions: string[] }  (2 suggested fan questions)
 * mode = "answer"    → returns { answer: string }        (answer to a specific question)
 */

function buildEventContext(event: MatchEvent): string {
  const parts: string[] = [`Type: ${event.type}`];
  if (event.player) parts.push(`Player: ${event.player}`);
  if (event.team) parts.push(`Team: ${event.team}`);
  if (event.minute) parts.push(`Minute: ${event.minute}'`);
  if (event.summary) parts.push(`Summary: ${event.summary}`);
  return parts.join(", ");
}

export async function POST(request: Request) {
  let body: { mode: "questions" | "answer"; event: MatchEvent; question?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { mode, event, question } = body;
  if (!event || !mode) {
    return NextResponse.json({ error: "Missing mode or event" }, { status: 400 });
  }

  const ctx = buildEventContext(event);

  try {
    if (mode === "questions") {
      const questions = await suggestLiveQuestions(ctx);
      return NextResponse.json({ questions });
    }

    if (mode === "answer") {
      if (!question) {
        return NextResponse.json({ error: "Missing question for answer mode" }, { status: 400 });
      }
      const answer = await answerLiveQuestion(ctx, question);
      return NextResponse.json({ answer });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    console.error("[live-explain]", err);
    return NextResponse.json({ error: "Pipeline error" }, { status: 500 });
  }
}
