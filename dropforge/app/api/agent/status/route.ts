import { NextRequest, NextResponse } from "next/server";
import { findAgent } from "@/lib/types/agents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATES = ["idle", "walking", "working", "coffee", "sleeping", "meeting"] as const;
type AgentState = (typeof ALLOWED_STATES)[number];

interface StatusBody {
  agentId: string;
  state: AgentState;
  currentTask?: string;
  progress?: number;
  x?: number;
  y?: number;
}

export async function POST(req: NextRequest) {
  let body: StatusBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.agentId || !findAgent(body.agentId)) {
    return NextResponse.json({ error: `Unknown agentId: ${body.agentId}` }, { status: 400 });
  }
  if (!ALLOWED_STATES.includes(body.state)) {
    return NextResponse.json(
      { error: `state must be one of ${ALLOWED_STATES.join(", ")}` },
      { status: 400 }
    );
  }

  // Sprint 1 stub: when Supabase is wired, this will upsert into agent_status
  // and Supabase Realtime will push the change to /office.
  return NextResponse.json({
    ok: true,
    received: body,
    note: "Supabase persistence pending — Sprint 2.",
  });
}
