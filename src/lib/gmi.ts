// GMI Cloud client (OpenAI-compatible embeddings). SERVER-ONLY.
// Falls back to a deterministic local embedding when no key/network is present,
// so semantic ranking still produces stable, sensible results for the demo.

const apiKey = process.env.GMI_API_KEY;
const baseUrl = process.env.GMI_BASE_URL || "https://api.gmi-serving.com/v1";
export const EMBED_MODEL = "BAAI/bge-large-en-v1.5";
export const hasGMI = Boolean(apiKey && apiKey.length > 8);

const DIM = 256;

// Deterministic hashed bag-of-words embedding (cosine-comparable).
function localEmbed(text: string): number[] {
  const vec = new Array(DIM).fill(0);
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  for (const tok of tokens) {
    let h = 2166136261;
    for (let i = 0; i < tok.length; i++) {
      h ^= tok.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const idx = Math.abs(h) % DIM;
    vec[idx] += 1;
    // a second bucket adds a little spread / smoothing
    vec[Math.abs(h >> 8) % DIM] += 0.5;
  }
  const norm = Math.hypot(...vec) || 1;
  return vec.map((v) => v / norm);
}

export async function embed(texts: string[]): Promise<{ vectors: number[][]; live: boolean }> {
  if (!hasGMI) return { vectors: texts.map(localEmbed), live: false };
  try {
    const res = await fetch(`${baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
    });
    if (!res.ok) throw new Error(`GMI ${res.status}`);
    const json = await res.json();
    const vectors = (json.data as Array<{ embedding: number[] }>).map((d) => d.embedding);
    return { vectors, live: true };
  } catch (err) {
    console.error("[gmi] falling back to local embeddings:", (err as Error).message);
    return { vectors: texts.map(localEmbed), live: false };
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
