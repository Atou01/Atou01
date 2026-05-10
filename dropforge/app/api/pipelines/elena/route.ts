import { NextRequest, NextResponse } from "next/server";
import { runElenaPipeline, PipelineBlockedError } from "@/lib/orchestrator/pipelines";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  }
  let body: {
    niche?: string; brandName?: string; weekNumber?: number; brandKit?: string;
    keyword?: string; productSubject?: string; emailFlow?: string;
  } = {};
  try { body = await req.json(); } catch { /* OK */ }

  try {
    const result = await runElenaPipeline(body);
    return NextResponse.json({
      ok: true,
      finalReportId: result.finalReportId,
      subReportIds: result.subReportIds,
      durationMs: result.durationMs,
      costUsd: result.costUsd,
    });
  } catch (err) {
    if (err instanceof PipelineBlockedError) {
      return NextResponse.json({ error: err.message, blocked: true }, { status: err.status });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : "Elena pipeline error" }, { status: 500 });
  }
}
