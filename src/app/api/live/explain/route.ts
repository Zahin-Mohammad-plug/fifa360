import { NextResponse } from "next/server";
import type { LiveMatchState, MatchEvent } from "@/lib/types";

type ExplainRequest = {
  event?: MatchEvent;
  context?: LiveMatchState;
  level?: "casual" | "enthusiast" | "analyst";
};

const casualByEvent: Record<MatchEvent["type"], (e: MatchEvent) => string> = {
  goal: (e) =>
    `${e.player ?? "The striker"} just put one in the back of the net — pure quality finish, the crowd is going wild.`,
  yellow_card: (e) =>
    `${e.player ?? "The player"} got a warning from the ref — one more like that and they're walking off.`,
  red_card: (e) =>
    `${e.player ?? "The player"} is sent off! Their team is down to 10 — this changes everything.`,
  substitution: () => "Fresh legs coming on — the manager wants more energy in this phase.",
  var: () => "VAR check in progress — the ref is taking another look at the monitor.",
  kickoff: () => "We're underway! Both teams looking to set the tempo early.",
  halftime: () => "Halftime whistle. Time for the managers to recalibrate in the dressing room.",
  fulltime: () => "Full time! That's it from this match.",
};

function tacticalSummary(state: LiveMatchState, level: ExplainRequest["level"]): string {
  if (level === "analyst") {
    return `${state.possession.home}/${state.possession.away} possession split with ${state.score.home}-${state.score.away} on the board at ${state.minute}'. The leading side is leveraging their midfield press to force turnovers in the final third while the chasing side is overcommitting numbers forward — expect a counterattack window if they don't sit deeper after the next stoppage.`;
  }
  if (level === "enthusiast") {
    return `It's ${state.score.home}-${state.score.away} on ${state.minute}'. Possession is sitting around ${state.possession.home}% to ${state.possession.away}%. The team in front is comfortable holding shape; the chasing side needs to commit a midfielder forward.`;
  }
  return `${state.score.home}-${state.score.away} on ${state.minute}'. One side is on top of the ball while the other is hunting an equaliser.`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ExplainRequest;

  if (body.event) {
    const fn = casualByEvent[body.event.type];
    const explanation = fn ? fn(body.event) : body.event.description;
    return NextResponse.json({ explanation });
  }

  if (body.context) {
    return NextResponse.json({ explanation: tacticalSummary(body.context, body.level ?? "casual") });
  }

  return NextResponse.json({ explanation: "Nothing to explain yet." });
}
