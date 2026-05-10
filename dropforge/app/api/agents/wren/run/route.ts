import { NextRequest, NextResponse } from "next/server";
import { runIdentitySetup } from "@/lib/agents/wren";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

interface Body {
  phase?: 1 | 2 | 3;
  brandName?: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  }
  let body: Body = {};
  try { body = await req.json(); } catch { /* OK */ }

  try {
    const report = await runIdentitySetup(body);
    const tldrMatch = report.markdown.match(/## TL;DR\s*\n([\s\S]*?)(?=\n##|$)/);
    const tldr = tldrMatch ? tldrMatch[1].trim().slice(0, 280) : `Identity Stack — Phase ${body.phase ?? 1}`;
    const titleMatch = report.markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : `Identity Stack — Phase ${body.phase ?? 1}`;

    const stored = addReport({
      id: `wren-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Ops",
      title,
      agents: ["wren", "marc"],
      tldr,
      tag: "note",
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
    const message = err instanceof Error ? err.message : "Unknown Wren error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
