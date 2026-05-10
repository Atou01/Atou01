import { NextRequest, NextResponse } from "next/server";
import { recent, summary } from "@/lib/orchestrator/audit";
import { requireAdmin } from "@/lib/orchestrator/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.status });

  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(500, parseInt(limitParam, 10) || 50)) : 50;

  return NextResponse.json({
    summary: summary(),
    entries: recent(limit),
  });
}
