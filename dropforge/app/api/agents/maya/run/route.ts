import { NextRequest, NextResponse } from "next/server";
import { runBrandArchitect } from "@/lib/agents/maya";
import { addReport } from "@/lib/store/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Body {
  niche?: string;
  icp?: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY missing." }, { status: 500 });
  }

  let body: Body = {};
  try { body = await req.json(); } catch { /* empty body OK */ }

  const niche = body.niche?.trim() || "Organisation & Productivité Bureau";

  try {
    const kit = await runBrandArchitect({ niche, voicehint: body.icp });

    const titleMatch = kit.markdown.match(/^#\s+🎨\s+Brand Kit\s*—\s*(.+)$/m);
    const brandName = titleMatch ? titleMatch[1].trim() : "(nom non parseable)";

    const stored = addReport({
      id: `maya-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type: "Strategic",
      title: `Brand Kit livré : ${brandName}`,
      agents: ["maya", "lina"],
      tldr: `Brand Architect Maya a livré identité complète pour la niche "${niche}" — naming, voice, palette, manifesto, do/don't.`,
      tag: "go",
      contentMd: kit.markdown,
      sources: [],
      costUsd: kit.costUsd,
      durationMs: kit.durationMs,
    });

    return NextResponse.json({
      ok: true,
      reportId: stored.id,
      brandName,
      durationMs: kit.durationMs,
      costUsd: kit.costUsd,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Maya error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
