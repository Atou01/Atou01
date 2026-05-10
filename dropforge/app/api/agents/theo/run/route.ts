import { NextRequest, NextResponse } from "next/server";
import { runBudgetGate } from "@/lib/agents/theo";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

interface Body {
  request: string;
  amountEur?: number;
  phase?: 1 | 2 | 3;
  spentMonthEur?: number;
  capMonthEur?: number;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  }
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.request) {
    return NextResponse.json({ error: "Field `request` required." }, { status: 400 });
  }

  try {
    const report = await runBudgetGate(body);
    const titleMatch = report.markdown.match(/^#\s+(.+)$/m);
    const tldrMatch = report.markdown.match(/## TL;DR\s*\n([\s\S]*?)(?=\n##|$)/);
    const stored = addReport({
      id: `theo-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Finance",
      title: titleMatch?.[1].trim() ?? `Verdict Théo — ${body.request.slice(0, 40)}`,
      agents: ["theo"],
      tldr: tldrMatch?.[1].trim().slice(0, 280) ?? `Verdict : ${report.verdict}`,
      tag: report.verdict === "APPROVED" ? "win" : report.verdict === "REJECTED" ? "kill" : "note",
      contentMd: report.markdown,
      sources: [],
      costUsd: report.costUsd,
      durationMs: report.durationMs,
    });
    return NextResponse.json({
      ok: true,
      reportId: stored.id,
      verdict: report.verdict,
      durationMs: report.durationMs,
      costUsd: report.costUsd,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Théo error" }, { status: 500 });
  }
}
