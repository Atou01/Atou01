import { NextRequest, NextResponse } from "next/server";
import { runTrendScout } from "@/lib/agents/mia";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

interface Body {
  niche?: string;
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
    const report = await runTrendScout({ niche: body.niche });
    const tldrMatch = report.markdown.match(/## TL;DR\s*\n([\s\S]*?)(?=\n##|$)/);
    const tldr = tldrMatch ? tldrMatch[1].trim().slice(0, 280) : `Top 10 produits scoutés dans ${report.niche}.`;
    const titleMatch = report.markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : `Trend Scout — ${report.niche}`;

    const stored = addReport({
      id: `mia-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Product",
      title,
      agents: ["mia", "sam"],
      tldr,
      tag: "go",
      contentMd: report.markdown,
      sources: report.sources,
      costUsd: report.costUsd,
      durationMs: report.durationMs,
    });

    return NextResponse.json({
      ok: true,
      reportId: stored.id,
      niche: report.niche,
      durationMs: report.durationMs,
      costUsd: report.costUsd,
      preview: tldr,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Mia error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
