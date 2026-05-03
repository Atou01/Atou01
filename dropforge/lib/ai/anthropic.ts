import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL_MAP = {
  opus: "claude-opus-4-7",
  sonnet: "claude-sonnet-4-6",
  haiku: "claude-haiku-4-5-20251001",
} as const;

export type ClaudeModel = keyof typeof MODEL_MAP;

export interface CompleteOptions {
  model: ClaudeModel;
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
  temperature?: number;
}

export async function complete(opts: CompleteOptions): Promise<string> {
  const res = await client.messages.create({
    model: MODEL_MAP[opts.model],
    system: opts.system,
    messages: opts.messages,
    max_tokens: opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0.7,
  });
  const block = res.content[0];
  if (block.type !== "text") return "";
  return block.text;
}

export async function classify<T extends string>(opts: {
  text: string;
  labels: readonly T[];
  context?: string;
}): Promise<T> {
  const labelList = opts.labels.join(", ");
  const sys = `Tu es un classificateur. Réponds UNIQUEMENT par un seul label parmi : ${labelList}. Aucun autre mot.`;
  const user = opts.context ? `Contexte : ${opts.context}\n\nMessage : ${opts.text}` : opts.text;
  const out = await complete({
    model: "haiku",
    system: sys,
    messages: [{ role: "user", content: user }],
    maxTokens: 20,
    temperature: 0,
  });
  const cleaned = out.trim().toLowerCase();
  const match = opts.labels.find((l) => cleaned.includes(l.toLowerCase()));
  return (match ?? opts.labels[0]) as T;
}
