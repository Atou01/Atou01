import { NextRequest, NextResponse } from "next/server";
import { runCroSprint } from "@/lib/agents/hana";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  let body: { weekNumber?: number; context?: string } = {};
  try { body = await req.json(); } catch { /* OK */ }
  try {
    const report = await runCroSprint(body);
    const titleMatch = report.markdown.match(/^#\s+(.+)$/m);
    const tldrMatch = report.markdown.match(/## TL;DR[^\n]*\n([\s\S]*?)(?=\n##|$)/);
    const stored = addReport({
      id: `hana-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Growth",
      title: titleMatch?.[1].trim() ?? "CRO Sprint",
      agents: ["hana"],
      tldr: tldrMatch?.[1].trim().slice(0, 280) ?? "CRO Sprint",
      tag: "note",
      contentMd: report.markdown,
      sources: [],
      costUsd: report.costUsd,
      durationMs: report.durationMs,
    });
    return NextResponse.json({ ok: true, reportId: stored.id, durationMs: report.durationMs, costUsd: report.costUsd });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Hana error" }, { status: 500 });
  }
}
