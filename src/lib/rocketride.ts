// RocketRide client — executes .pipe pipelines via HTTP to the local RR server.
// SERVER-ONLY. Every caller must also have a direct-API fallback (per PRD risk
// register), so a missing RocketRide server never breaks a feature.

const RR_URL = process.env.ROCKETRIDE_SERVER_URL || "http://localhost:5565";

export type PipelineName = "venue-ranking" | "concierge" | "live-match";

export interface PipelineResult<T> {
  ran: boolean; // true if the RR server actually executed the pipeline
  output: T | null;
  via: "rocketride" | "fallback";
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await p;
  } finally {
    clearTimeout(timer);
  }
}

export async function runPipeline<T = unknown>(
  name: PipelineName,
  input: unknown,
  timeoutMs = 1500,
): Promise<PipelineResult<T>> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(`${RR_URL}/pipelines/${name}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`RocketRide ${res.status}`);
    const json = await res.json();
    return { ran: true, output: (json.output ?? json) as T, via: "rocketride" };
  } catch {
    // RocketRide server not available — caller uses its direct-API fallback.
    return { ran: false, output: null, via: "fallback" };
  }
}

export async function pipelineHealthy(): Promise<boolean> {
  try {
    const res = await withTimeout(fetch(`${RR_URL}/health`), 800);
    return res.ok;
  } catch {
    return false;
  }
}
