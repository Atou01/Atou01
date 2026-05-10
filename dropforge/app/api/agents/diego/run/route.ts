import { NextRequest, NextResponse } from "next/server";
import { runSupplierShortlist } from "@/lib/agents/diego";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  let body: { productName: string; niche?: string; costTargetEur?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  if (!body?.productName) return NextResponse.json({ error: "Field `productName` required." }, { status: 400 });
  try {
    const report = await runSupplierShortlist(body);
    const titleMatch = report.markdown.match(/^#\s+(.+)$/m);
    const tldrMatch = report.markdown.match(/## TL;DR[^\n]*\n([\s\S]*?)(?=\n##|$)/);
    const stored = addReport({
      id: `diego-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Research",
      title: titleMatch?.[1].trim() ?? `Supplier Shortlist — ${body.productName}`,
      agents: ["diego"],
      tldr: tldrMatch?.[1].trim().slice(0, 280) ?? "Supplier Shortlist",
      tag: "note",
      contentMd: report.markdown,
      sources: [],
      costUsd: report.costUsd,
      durationMs: report.durationMs,
    });
    return NextResponse.json({ ok: true, reportId: stored.id, durationMs: report.durationMs, costUsd: report.costUsd });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Diego error" }, { status: 500 });
  }
}
