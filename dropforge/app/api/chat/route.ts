import { NextRequest, NextResponse } from "next/server";
import { victorRespond } from "@/lib/orchestrator/victor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatBody {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY missing in environment." },
      { status: 500 }
    );
  }

  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.message || typeof body.message !== "string") {
    return NextResponse.json({ error: "Field `message` required." }, { status: 400 });
  }

  try {
    const turn = await victorRespond(body.message, body.history ?? []);
    return NextResponse.json(turn);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown orchestrator error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
