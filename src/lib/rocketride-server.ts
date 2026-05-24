import { RocketRideClient, Question } from "rocketride";
import path from "path";

interface PipeHandle {
  client: RocketRideClient;
  token: string;
}

// Module-level singletons — reused across requests in the same server process
const handles: Record<string, PipeHandle | null> = {
  "live-explain": null,
  "venue-ranking": null,
  "rsvp-confirm": null,
};

function makeClient() {
  return new RocketRideClient({
    auth: process.env.ROCKETRIDE_APIKEY,
    uri: process.env.ROCKETRIDE_URI ?? "https://cloud.rocketride.ai",
  });
}

function pipePath(name: string) {
  return path.join(process.cwd(), "pipelines", name);
}

function extractAnswer(response: Record<string, unknown>): string {
  const resultTypes = (response.result_types ?? {}) as Record<string, string>;
  for (const [key, laneType] of Object.entries(resultTypes)) {
    if (laneType === "answers") {
      const arr = response[key] as string[] | undefined;
      if (arr?.length) return arr[0];
    }
  }
  const answers = response.answers as string[] | undefined;
  return answers?.[0] ?? "";
}

async function getHandle(pipe: keyof typeof handles): Promise<PipeHandle> {
  const existing = handles[pipe];
  if (existing?.client.isConnected()) return existing;

  const client = makeClient();
  await client.connect();
  const result = await client.use({
    filepath: pipePath(`${pipe}.pipe`),
    useExisting: true,
  });

  const handle: PipeHandle = { client, token: result.token };
  handles[pipe] = handle;
  return handle;
}

async function askPipe(
  pipe: keyof typeof handles,
  questionText: string
): Promise<string> {
  const { client, token } = await getHandle(pipe);
  const question = new Question();
  question.addQuestion(questionText);
  const response = await client.chat({ token, question });
  return extractAnswer(response as Record<string, unknown>);
}

/* ── Public helpers ──────────────────────────────────────────────────────── */

/**
 * Given a formatted event context string, returns 2 suggested questions
 * as a JSON array string from the live-explain pipeline.
 * Caller should JSON.parse the result.
 */
export async function suggestLiveQuestions(eventContext: string): Promise<string[]> {
  const raw = await askPipe(
    "live-explain",
    `SUGGEST_QUESTIONS: ${eventContext}`
  );
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(0, 2).map(String);
  } catch {
    // fallback: split by newline
    return raw
      .split("\n")
      .map((l) => l.replace(/^[-*\d.]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 2);
  }
  return [];
}

/**
 * Answer a specific fan question about a match event via live-explain pipeline.
 */
export async function answerLiveQuestion(
  eventContext: string,
  userQuestion: string
): Promise<string> {
  return askPipe(
    "live-explain",
    `ANSWER: ${userQuestion}\n\nEvent context: ${eventContext}`
  );
}

/**
 * Rank venues via the venue-ranking pipeline.
 * Returns parsed JSON array or empty array on failure.
 */
export async function rankVenues(
  fanProfile: string,
  venueList: string
): Promise<Array<{ venueId: string; aiRankScore: number; aiRankReason: string }>> {
  const raw = await askPipe(
    "venue-ranking",
    `Fan profile: ${fanProfile}\n\nVenues: ${venueList}`
  );
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* ignore parse errors */
  }
  return [];
}

/**
 * Generate an AI confirmation message for an RSVP via rsvp-confirm pipeline.
 */
export async function generateRsvpConfirmation(payload: {
  venueName: string;
  partySize: number;
  arrivalTime: string;
  confirmationRef?: string;
  notes?: string;
  confirmed: boolean;
}): Promise<string> {
  const ctx = JSON.stringify(payload);
  return askPipe("rsvp-confirm", ctx);
}
