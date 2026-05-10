import { NextRequest, NextResponse } from "next/server";
import { getBudget, freeze, unfreeze, setCaps } from "@/lib/orchestrator/budget";
import { requireAdmin } from "@/lib/orchestrator/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.status });
  return NextResponse.json(getBudget());
}

interface PostBody {
  action: "freeze" | "unfreeze" | "set-caps";
  reason?: string;
  dailyUsd?: number;
  monthlyUsd?: number;
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.status });

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  switch (body.action) {
    case "freeze":
      return NextResponse.json(freeze(body.reason?.trim() || "Manual freeze (admin)."));
    case "unfreeze":
      return NextResponse.json(unfreeze());
    case "set-caps":
      if ((body.dailyUsd != null && body.dailyUsd <= 0) || (body.monthlyUsd != null && body.monthlyUsd <= 0)) {
        return NextResponse.json({ error: "Caps must be > 0." }, { status: 400 });
      }
      return NextResponse.json(setCaps({ dailyUsd: body.dailyUsd, monthlyUsd: body.monthlyUsd }));
    default:
      return NextResponse.json({ error: "Unknown action. Use freeze | unfreeze | set-caps." }, { status: 400 });
  }
}
