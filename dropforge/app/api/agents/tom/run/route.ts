import { NextRequest, NextResponse } from "next/server";
import { runVideoBrief } from "@/lib/agents/tom";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  let body: { subject: string; productName?: string; niche?: string; brandVoiceHint?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  if (!body?.subject) return NextResponse.json({ error: "Field `subject` required." }, { status: 400 });
  try {
    const report = await runVideoBrief(body);
    const titleMatch = report.markdown.match(/^#\s+(.+)$/m);
    const tldrMatch = report.markdown.match(/## TL;DR[^\n]*\n([\s\S]*?)(?=\n##|$)/);
    const stored = addReport({
      id: `tom-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Content",
      title: titleMatch?.[1].trim() ?? `Video Brief — ${body.subject}`,
      agents: ["tom"],
      tldr: tldrMatch?.[1].trim().slice(0, 280) ?? "Video Brief",
      tag: "note",
      contentMd: report.markdown,
      sources: [],
      costUsd: report.costUsd,
      durationMs: report.durationMs,
    });
    return NextResponse.json({ ok: true, reportId: stored.id, durationMs: report.durationMs, costUsd: report.costUsd });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Tom error" }, { status: 500 });
  }
}
