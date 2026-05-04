import { NextRequest, NextResponse } from "next/server";
import { runNicheSelection } from "@/lib/agents/aria";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Body {
  hint?: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  }
  if (!process.env.PERPLEXITY_API_KEY) {
    return NextResponse.json({ error: "PERPLEXITY_API_KEY missing." }, { status: 500 });
  }

  let body: Body = {};
  try { body = await req.json(); } catch { /* empty body OK */ }

  try {
    const report = await runNicheSelection({ hint: body.hint });
    const tldrMatch = report.markdown.match(/## TL;DR\s*\n([\s\S]*?)(?=\n##|$)/);
    const tldr = tldrMatch ? tldrMatch[1].trim().slice(0, 280) : "Top 3 niches scorées par Aria.";
    const titleMatch = report.markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : "Niche Selection Report";

    const stored = addReport({
      id: `aria-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Strategic",
      title: `Niche choisie par Victor : ${report.victorPick}`,
      agents: ["aria", "victor", "lina"],
      tldr: `Victor pick : ${report.victorPick} · ${tldr}`,
      tag: "go",
      contentMd: report.markdown,
      sources: report.sources,
      costUsd: report.costUsd,
      durationMs: report.durationMs,
    });

    return NextResponse.json({
      ok: true,
      reportId: stored.id,
      victorPick: report.victorPick,
      durationMs: report.durationMs,
      costUsd: report.costUsd,
      preview: tldr,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Aria error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
