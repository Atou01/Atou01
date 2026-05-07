import { NextRequest, NextResponse } from "next/server";
import { runProcurement } from "@/lib/agents/chenwu";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

interface Body {
  niche?: string;
  validatedMd?: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  }
  let body: Body = {};
  try { body = await req.json(); } catch { /* OK */ }

  try {
    const report = await runProcurement(body);
    const tldrMatch = report.markdown.match(/## TL;DR\s*\n([\s\S]*?)(?=\n##|$)/);
    const tldr = tldrMatch ? tldrMatch[1].trim().slice(0, 280) : `Procurement — ${report.niche}`;
    const titleMatch = report.markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : `Procurement — ${report.niche}`;

    const stored = addReport({
      id: `chen-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Ops",
      title,
      agents: ["chen", "marc"],
      tldr,
      tag: "go",
      contentMd: report.markdown,
      sources: [],
      costUsd: report.costUsd,
      durationMs: report.durationMs,
    });

    return NextResponse.json({
      ok: true,
      reportId: stored.id,
      durationMs: report.durationMs,
      costUsd: report.costUsd,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Chen Wu error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
