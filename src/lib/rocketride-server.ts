import { RocketRideClient, Question } from "rocketride";

// ── Credentials ───────────────────────────────────────────────────────────────
// Priority: process.env (from .env.local) → fallback to the key already
// hardcoded in fifa360.pipe (committed to repo, safe for demo use).
const GMI_API_KEY =
  process.env.ROCKETRIDE_GMI_API_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJiNThhNTQ5LTFkN2ItNGFhNi1hOWFhLTk3MjY2YjhiZGI3OSIsInNjb3BlIjoiaWVfbW9kZWwiLCJjbGllbnRJZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCJ9.T0gxAfUwsVlJM47gQyTnveGRQADhC9CZgZ79Qx5VUW4";

function makeLlmConfig() {
  return {
    profile: "gemini-3-flash",
    "gemini-3-flash": { apikey: GMI_API_KEY },
    parameters: {},
    name: "GMI Cloud",
  };
}

// ── Inline pipeline configs (no .pipe file needed, no ${VAR} substitution) ───

const LIVE_EXPLAIN_PIPELINE = {
  components: [
    {
      id: "chat_1",
      provider: "chat",
      config: { hideForm: true, mode: "Source", parameters: {}, type: "chat" },
    },
    {
      id: "prompt_1",
      provider: "prompt",
      config: {
        name: "Live Event AI Prompt",
        parameters: {},
        instructions: [
          "You are a FIFA 2026 World Cup live match AI assistant helping casual fans understand what's happening. Given a request about a match event, do exactly what is asked:\n\n- If the request starts with 'SUGGEST_QUESTIONS:' — return ONLY a JSON array of exactly 2 short questions a casual fan might want to ask about that event (each under 10 words). Example format: [\"Who is De Paul?\", \"What happens after a yellow card?\"]. No markdown, no labels, no explanation.\n\n- If the request starts with 'ANSWER:' — answer the specific question clearly and concisely in 1-2 sentences for a casual fan. Return ONLY the answer text.\n\n- Otherwise — write a vivid, exciting 1-2 sentence description of the event for casual fans. Be specific about the player and team. Return ONLY the description text.",
        ],
      },
      input: [{ lane: "questions", from: "chat_1" }],
    },
    {
      id: "llm_1",
      provider: "llm_gmi_cloud",
      config: makeLlmConfig(),
      input: [{ lane: "questions", from: "prompt_1" }],
    },
    {
      id: "response_1",
      provider: "response_answers",
      config: { laneName: "answers" },
      input: [{ lane: "answers", from: "llm_1" }],
    },
  ],
  project_id: "3da96ea7-d6e5-44a2-ba65-2f32a4ff8825",
  version: 1,
};

const VENUE_RANKING_PIPELINE = {
  components: [
    {
      id: "chat_1",
      provider: "chat",
      config: { hideForm: true, mode: "Source", parameters: {}, type: "chat" },
    },
    {
      id: "prompt_1",
      provider: "prompt",
      config: {
        name: "Venue Ranking Prompt",
        parameters: {},
        instructions: [
          "You are a venue ranking AI for FIFA 2026 World Cup matchday fans. Given a fan profile and a list of venues, rank ALL venues by compatibility. Return a JSON array with one object per venue: { \"venueId\": string, \"aiRankScore\": number (0.0-1.0), \"aiRankReason\": string (one vivid sentence, max 15 words) }. Order by aiRankScore descending. Return ONLY valid JSON — no markdown, no explanation.",
        ],
      },
      input: [{ lane: "questions", from: "chat_1" }],
    },
    {
      id: "llm_1",
      provider: "llm_gmi_cloud",
      config: makeLlmConfig(),
      input: [{ lane: "questions", from: "prompt_1" }],
    },
    {
      id: "response_1",
      provider: "response_answers",
      config: { laneName: "answers" },
      input: [{ lane: "answers", from: "llm_1" }],
    },
  ],
  project_id: "0e361182-79c1-44b1-ad67-9e3c75fb47b2",
  version: 1,
};

const RSVP_CONFIRM_PIPELINE = {
  components: [
    {
      id: "chat_1",
      provider: "chat",
      config: { hideForm: true, mode: "Source", parameters: {}, type: "chat" },
    },
    {
      id: "prompt_1",
      provider: "prompt",
      config: {
        name: "RSVP Confirmation Prompt",
        parameters: {},
        instructions: [
          "You are an RSVP confirmation assistant for FIFA 2026 World Cup venue bookings. Given a confirmed reservation (venue name, party size, arrival time, confirmation reference, any notes), write a friendly confirmation message in 1-2 sentences. Include the key details. Return ONLY the confirmation message — no labels, no JSON.",
        ],
      },
      input: [{ lane: "questions", from: "chat_1" }],
    },
    {
      id: "llm_1",
      provider: "llm_gmi_cloud",
      config: makeLlmConfig(),
      input: [{ lane: "questions", from: "prompt_1" }],
    },
    {
      id: "response_1",
      provider: "response_answers",
      config: { laneName: "answers" },
      input: [{ lane: "answers", from: "llm_1" }],
    },
  ],
  project_id: "3070e596-329d-4c75-aec7-c979e13e21e6",
  version: 1,
};

// ── Singleton handles ─────────────────────────────────────────────────────────

interface PipeHandle {
  client: RocketRideClient;
  token: string;
}

const handles: Record<string, PipeHandle | null> = {
  liveExplain: null,
  venueRanking: null,
  rsvpConfirm: null,
};

type HandleKey = keyof typeof handles;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getHandle(key: HandleKey, pipeline: any): Promise<PipeHandle> {
  const existing = handles[key];
  if (existing?.client.isConnected()) return existing;

  const client = new RocketRideClient({
    auth: process.env.ROCKETRIDE_APIKEY,
    uri: process.env.ROCKETRIDE_URI ?? "https://cloud.rocketride.ai",
  });

  await client.connect();
  const result = await client.use({ pipeline, useExisting: true });

  const handle: PipeHandle = { client, token: result.token };
  handles[key] = handle;
  return handle;
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

async function askPipeline(key: HandleKey, pipeline: object, text: string): Promise<string> {
  const { client, token } = await getHandle(key, pipeline);
  const question = new Question();
  question.addQuestion(text);
  const response = await client.chat({ token, question });
  return extractAnswer(response as Record<string, unknown>);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function suggestLiveQuestions(eventContext: string): Promise<string[]> {
  const raw = await askPipeline("liveExplain", LIVE_EXPLAIN_PIPELINE, `SUGGEST_QUESTIONS: ${eventContext}`);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(0, 2).map(String);
  } catch {
    return raw
      .split("\n")
      .map((l) => l.replace(/^[-*\d.]+\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 2);
  }
  return [];
}

export async function answerLiveQuestion(eventContext: string, userQuestion: string): Promise<string> {
  return askPipeline(
    "liveExplain",
    LIVE_EXPLAIN_PIPELINE,
    `ANSWER: ${userQuestion}\n\nEvent context: ${eventContext}`
  );
}

export async function rankVenues(
  fanProfile: string,
  venueList: string
): Promise<Array<{ venueId: string; aiRankScore: number; aiRankReason: string }>> {
  const raw = await askPipeline("venueRanking", VENUE_RANKING_PIPELINE, `Fan profile: ${fanProfile}\n\nVenues: ${venueList}`);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* ignore */
  }
  return [];
}

export async function generateRsvpConfirmation(payload: {
  venueName: string;
  partySize: number;
  arrivalTime: string;
  confirmationRef?: string;
  notes?: string;
  confirmed: boolean;
}): Promise<string> {
  return askPipeline("rsvpConfirm", RSVP_CONFIRM_PIPELINE, JSON.stringify(payload));
}
