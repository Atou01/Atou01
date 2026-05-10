import { NextRequest, NextResponse } from "next/server";
import { runTechPlan } from "@/lib/agents/nora";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  let body: { brief: string; scope?: "feature" | "bug" | "infra" | "security" };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  if (!body?.brief) return NextResponse.json({ error: "Field `brief` required." }, { status: 400 });
  try {
    const report = await runTechPlan(body);
    const titleMatch = report.markdown.match(/^#\s+(.+)$/m);
    const tldrMatch = report.markdown.match(/## TL;DR[^\n]*\n([\s\S]*?)(?=\n##|$)/);
    const stored = addReport({
      id: `nora-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Tech",
      title: titleMatch?.[1].trim() ?? "Tech Plan",
      agents: ["nora"],
      tldr: tldrMatch?.[1].trim().slice(0, 280) ?? "Tech Plan",
      tag: "note",
      contentMd: report.markdown,
      sources: [],
      costUsd: report.costUsd,
      durationMs: report.durationMs,
    });
    return NextResponse.json({ ok: true, reportId: stored.id, durationMs: report.durationMs, costUsd: report.costUsd });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Nora error" }, { status: 500 });
  }
}
