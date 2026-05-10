import { NextRequest, NextResponse } from "next/server";
import { runMarketingPulse } from "@/lib/agents/lina";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  let body: { weekNumber?: number; niche?: string; context?: string } = {};
  try { body = await req.json(); } catch { /* OK */ }
  try {
    const report = await runMarketingPulse(body);
    const titleMatch = report.markdown.match(/^#\s+(.+)$/m);
    const tldrMatch = report.markdown.match(/## TL;DR[^\n]*\n([\s\S]*?)(?=\n##|$)/);
    const stored = addReport({
      id: `lina-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Marketing",
      title: titleMatch?.[1].trim() ?? `Marketing Pulse — Semaine ${body.weekNumber ?? 1}`,
      agents: ["lina"],
      tldr: tldrMatch?.[1].trim().slice(0, 280) ?? "Marketing Pulse",
      tag: "note",
      contentMd: report.markdown,
      sources: [],
      costUsd: report.costUsd,
      durationMs: report.durationMs,
    });
    return NextResponse.json({ ok: true, reportId: stored.id, durationMs: report.durationMs, costUsd: report.costUsd });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Lina error" }, { status: 500 });
  }
}
