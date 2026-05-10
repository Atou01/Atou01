import { NextRequest, NextResponse } from "next/server";
import { runSeoArticle } from "@/lib/agents/lea";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  let body: { keyword: string; intent?: "informational" | "transactional" | "navigational"; brandVoiceHint?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  if (!body?.keyword) return NextResponse.json({ error: "Field `keyword` required." }, { status: 400 });
  try {
    const report = await runSeoArticle(body);
    const titleMatch = report.markdown.match(/^#\s+(.+)$/m);
    const stored = addReport({
      id: `lea-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Content",
      title: titleMatch?.[1].trim() ?? `Article SEO — ${body.keyword}`,
      agents: ["lea"],
      tldr: `Article SEO sur "${body.keyword}"`,
      tag: "note",
      contentMd: report.markdown,
      sources: [],
      costUsd: report.costUsd,
      durationMs: report.durationMs,
    });
    return NextResponse.json({ ok: true, reportId: stored.id, durationMs: report.durationMs, costUsd: report.costUsd });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Léa error" }, { status: 500 });
  }
}
