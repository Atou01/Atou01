import { NextRequest, NextResponse } from "next/server";
import { runOrderOps } from "@/lib/agents/hugo";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  let body: { cycle?: "J" | "S"; context?: string } = {};
  try { body = await req.json(); } catch { /* OK */ }
  try {
    const report = await runOrderOps(body);
    const titleMatch = report.markdown.match(/^#\s+(.+)$/m);
    const tldrMatch = report.markdown.match(/## TL;DR[^\n]*\n([\s\S]*?)(?=\n##|$)/);
    const stored = addReport({
      id: `hugo-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Ops",
      title: titleMatch?.[1].trim() ?? "Order Ops",
      agents: ["hugo"],
      tldr: tldrMatch?.[1].trim().slice(0, 280) ?? "Order Ops",
      tag: "note",
      contentMd: report.markdown,
      sources: [],
      costUsd: report.costUsd,
      durationMs: report.durationMs,
    });
    return NextResponse.json({ ok: true, reportId: stored.id, durationMs: report.durationMs, costUsd: report.costUsd });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Hugo error" }, { status: 500 });
  }
}
