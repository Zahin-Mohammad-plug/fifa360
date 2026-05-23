// Shared Claude client. SERVER-ONLY — import this only from /api route handlers.
import Anthropic from "@anthropic-ai/sdk";

export const MODELS = {
  SONNET: "claude-sonnet-4-20250514",
  HAIKU: "claude-haiku-4-5-20251001",
} as const;

const apiKey = process.env.ANTHROPIC_API_KEY;
export const hasAnthropic = Boolean(apiKey && apiKey.length > 10);

export const anthropic = hasAnthropic ? new Anthropic({ apiKey }) : null;

type Msg = { role: "user" | "assistant"; content: string };

/**
 * Generate a single text completion. If no API key is configured (or the call
 * fails for any reason) the provided `fallback` is returned, so callers always
 * get usable content for the demo.
 */
export async function claudeText(opts: {
  model: string;
  system?: string;
  messages: Msg[];
  maxTokens?: number;
  temperature?: number;
  fallback: string;
}): Promise<{ text: string; live: boolean }> {
  if (!anthropic) return { text: opts.fallback, live: false };
  try {
    const res = await anthropic.messages.create({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 400,
      temperature: opts.temperature ?? 0.7,
      system: opts.system,
      messages: opts.messages,
    });
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return { text: text || opts.fallback, live: Boolean(text) };
  } catch (err) {
    console.error("[anthropic] falling back:", (err as Error).message);
    return { text: opts.fallback, live: false };
  }
}
