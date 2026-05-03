/**
 * Perplexity client — 3 endpoints utilisés par DropForge
 * - /search           : recherche web rapide (Mia trend scout)
 * - /v1/responses     : agent search avec preset (Aria niche analyst)
 * - /v1/embeddings    : vectorisation (Sofia FAQ, Léa SEO)
 */

const BASE = "https://api.perplexity.ai";

function authHeader() {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error("PERPLEXITY_API_KEY missing in environment.");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export interface SearchResult {
  url: string;
  title?: string;
  snippet?: string;
}

export async function search(query: string, opts?: { maxResults?: number; maxTokensPerPage?: number }): Promise<SearchResult[]> {
  const res = await fetch(`${BASE}/search`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({
      query,
      max_results: opts?.maxResults ?? 5,
      max_tokens_per_page: opts?.maxTokensPerPage ?? 256,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Perplexity search failed (${res.status}): ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const items = (data.results ?? data.data ?? []) as Array<Record<string, unknown>>;
  return items.map((r) => ({
    url: String(r.url ?? ""),
    title: r.title ? String(r.title) : undefined,
    snippet: r.snippet ? String(r.snippet) : (r.text ? String(r.text) : undefined),
  }));
}

export interface AgentResponse {
  text: string;
  citations: string[];
}

export async function agentSearch(input: string, opts?: { preset?: string }): Promise<AgentResponse> {
  const res = await fetch(`${BASE}/v1/responses`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({
      preset: opts?.preset ?? "fast-search",
      input,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Perplexity agent failed (${res.status}): ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = String(data.output_text ?? data.output ?? data.text ?? "");
  const citations = Array.isArray(data.citations) ? data.citations.map(String) : [];
  return { text, citations };
}

export async function embed(inputs: string[]): Promise<number[][]> {
  const res = await fetch(`${BASE}/v1/embeddings`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ input: inputs, model: "pplx-embed-v1-4b" }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Perplexity embeddings failed (${res.status}): ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.data ?? []).map((d: { embedding: number[] }) => d.embedding);
}
