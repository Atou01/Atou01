import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/orchestrator/guards";
import { seedAgents } from "@/lib/store/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.status });

  const result = await seedAgents();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
