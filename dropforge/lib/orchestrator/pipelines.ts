/**
 * Pipelines — orchestrations multi-agents qui chaînent les specialists
 * sous la supervision d'un manager.
 *
 * Chaque pipeline est explicit (pas auto-déclenché par Victor) parce que
 * le coût IA cumulé d'une chaîne complète peut atteindre $0.20-0.50.
 * Théo (budget tracker) refuse si freeze ou cap dépassé.
 *
 * Pattern :
 *   1. requireBudget(estCostUsd) — pré-flight Théo
 *   2. Run sub-agents en série (chain) ou en parallèle (fan-out)
 *   3. Synthèse markdown unifiée
 *   4. addReport() pour chaque sub-output → audit + budget consumed automatiquement
 *   5. Synthèse finale aussi addReport() avec agents=[manager, ...specialists]
 */

import { runNicheSelection } from "@/lib/agents/aria";
import { runBrandArchitect } from "@/lib/agents/maya";
import { runTrendScout } from "@/lib/agents/mia";
import { runSupplierShortlist } from "@/lib/agents/diego";
import { runProductValidator } from "@/lib/agents/yuki";
import { runProcurement } from "@/lib/agents/chenwu";
import { runResearchPlan } from "@/lib/agents/sam";
import { runContentCalendar } from "@/lib/agents/elena";
import { runSeoArticle } from "@/lib/agents/lea";
import { runVisualBrief } from "@/lib/agents/kai";
import { runVideoBrief } from "@/lib/agents/tom";
import { runSocialCalendar } from "@/lib/agents/zoe";
import { runEmailBrief } from "@/lib/agents/noor";
import { runCommunityPulse } from "@/lib/agents/bea";
import { runGrowthPlan } from "@/lib/agents/ravi";
import { runDataBrief } from "@/lib/agents/anna";
import { runCroSprint } from "@/lib/agents/hana";
import { runAdsPlan } from "@/lib/agents/jay";

import { addReport } from "@/lib/store/reports";
import { checkBudget } from "@/lib/orchestrator/budget";
import { logRun } from "@/lib/orchestrator/audit";
import type { ReportTag } from "@/lib/data/mock";

export class PipelineBlockedError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "PipelineBlockedError";
  }
}

interface PipelineResult {
  markdown: string;
  durationMs: number;
  costUsd: number;
  subReportIds: string[];
  finalReportId: string;
}

function frDate(): string {
  return new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function pickTitle(md: string, fallback: string): string {
  return md.match(/^#\s+(.+)$/m)?.[1].trim() ?? fallback;
}

function pickTldr(md: string, fallback: string): string {
  const m = md.match(/## TL;DR[^\n]*\n([\s\S]*?)(?=\n##|$)/);
  return (m?.[1].trim() ?? fallback).slice(0, 280);
}

/** Pré-flight Théo. Lève PipelineBlockedError si refusé. */
function preflight(estCostUsd: number, pipelineName: string): void {
  const guard = checkBudget(estCostUsd);
  if (!guard.allowed) {
    logRun({
      agentId: "iris", caller: "pipeline", taskKind: pipelineName,
      inputDigest: `pre-flight estCost=$${estCostUsd}`, outcome: "frozen",
      costUsd: 0, durationMs: 0, errorMessage: guard.reason,
    });
    throw new PipelineBlockedError(guard.reason ?? "Budget frozen.", 429);
  }
}

// ─── Sam Pipeline : Aria → Mia → Diego → Yuki → Chen Wu → synthèse Sam ───

export interface SamPipelineOpts {
  niche?: string;
  cycleNumber?: number;
  productHint?: string; // si fourni, skip Mia et part directement sur ce produit
}

export async function runSamPipeline(opts: SamPipelineOpts = {}): Promise<PipelineResult> {
  const t0 = Date.now();
  const subReportIds: string[] = [];
  let totalCost = 0;

  // Estimation : Mia ~$0.02 + Diego ~$0.005 + Yuki ~$0.02 + Chen Wu ~$0.075 + Sam synthèse ~$0.03 ≈ $0.15
  preflight(0.15, "sam-pipeline");

  // 1. Mia : sourcing 10 candidats (skippable si productHint fourni).
  let miaMd = "";
  let topProducts: string[] = [];
  if (!opts.productHint) {
    const mia = await runTrendScout({ niche: opts.niche });
    miaMd = mia.markdown;
    totalCost += mia.costUsd;
    const miaReport = addReport({
      id: `mia-pipe-${Date.now()}`, date: frDate(), type: "Research",
      title: pickTitle(mia.markdown, "Trend Scout — sourcing"),
      agents: ["mia", "sam"], tldr: pickTldr(mia.markdown, "Sourcing TikTok/IG"),
      tag: "note", contentMd: mia.markdown, sources: [],
      costUsd: mia.costUsd, durationMs: mia.durationMs,
    });
    subReportIds.push(miaReport.id);
    // Extract first product names from a likely table or bullet list.
    topProducts = Array.from(mia.markdown.matchAll(/\|\s*\d+\s*\|\s*([^|]+)\s*\|/g))
      .map((m) => m[1].trim())
      .filter((s) => s && !s.includes("---"))
      .slice(0, 3);
    if (topProducts.length === 0) topProducts = [opts.niche ?? "Top product"];
  } else {
    topProducts = [opts.productHint];
  }

  // 2. Diego : pour chaque top product, sourcer 3 fournisseurs.
  const diegoMds: string[] = [];
  for (const product of topProducts) {
    const diego = await runSupplierShortlist({ productName: product, niche: opts.niche });
    diegoMds.push(diego.markdown);
    totalCost += diego.costUsd;
    const r = addReport({
      id: `diego-pipe-${Date.now()}-${diegoMds.length}`, date: frDate(), type: "Research",
      title: pickTitle(diego.markdown, `Supplier Shortlist — ${product}`),
      agents: ["diego", "sam"], tldr: pickTldr(diego.markdown, "Supplier shortlist"),
      tag: "note", contentMd: diego.markdown, sources: [],
      costUsd: diego.costUsd, durationMs: diego.durationMs,
    });
    subReportIds.push(r.id);
  }

  // 3. Yuki : validation marges sur les outputs Mia + Diego concaténés.
  const yukiInput = (miaMd ? miaMd + "\n\n---\n\n" : "") + diegoMds.join("\n\n---\n\n");
  const yuki = await runProductValidator({ niche: opts.niche, productsMd: yukiInput });
  totalCost += yuki.costUsd;
  const yukiReport = addReport({
    id: `yuki-pipe-${Date.now()}`, date: frDate(), type: "Research",
    title: pickTitle(yuki.markdown, "Product Validation"),
    agents: ["yuki", "sam"], tldr: pickTldr(yuki.markdown, "Validation marges"),
    tag: "note", contentMd: yuki.markdown, sources: [],
    costUsd: yuki.costUsd, durationMs: yuki.durationMs,
  });
  subReportIds.push(yukiReport.id);

  // 4. Chen Wu : brief négo sur les PASS Yuki.
  const chen = await runProcurement({ niche: opts.niche, validatedMd: yuki.markdown });
  totalCost += chen.costUsd;
  const chenReport = addReport({
    id: `chen-pipe-${Date.now()}`, date: frDate(), type: "Research",
    title: pickTitle(chen.markdown, "Procurement Brief"),
    agents: ["chen", "sam"], tldr: pickTldr(chen.markdown, "Brief négo Chen Wu"),
    tag: "note", contentMd: chen.markdown, sources: [],
    costUsd: chen.costUsd, durationMs: chen.durationMs,
  });
  subReportIds.push(chenReport.id);

  // 5. Sam : synthèse finale qui agrège tout.
  const samContext =
    `Sub-reports déjà livrés (extraits) :\n` +
    `--- Mia ---\n${miaMd.slice(0, 1500)}\n\n` +
    diegoMds.map((m, i) => `--- Diego #${i + 1} ---\n${m.slice(0, 1000)}`).join("\n\n") + "\n\n" +
    `--- Yuki ---\n${yuki.markdown.slice(0, 1500)}\n\n` +
    `--- Chen Wu ---\n${chen.markdown.slice(0, 1500)}`;
  const sam = await runResearchPlan({ niche: opts.niche, cycleNumber: opts.cycleNumber, context: samContext });
  totalCost += sam.costUsd;
  const samReport = addReport({
    id: `sam-pipe-${Date.now()}`, date: frDate(), type: "Research",
    title: pickTitle(sam.markdown, "Research Plan (synthèse)"),
    agents: ["sam", "mia", "diego", "yuki", "chen"], tldr: pickTldr(sam.markdown, "Synthèse Sam"),
    tag: "go", contentMd: sam.markdown, sources: subReportIds,
    costUsd: sam.costUsd, durationMs: sam.durationMs,
  });

  return {
    markdown: sam.markdown,
    durationMs: Date.now() - t0,
    costUsd: totalCost,
    subReportIds,
    finalReportId: samReport.id,
  };
}

// ─── Elena Pipeline : fan-out Léa/Kai/Tom/Zoé/Noor/Bea + synthèse ───

export interface ElenaPipelineOpts {
  niche?: string;
  brandName?: string;
  weekNumber?: number;
  brandKit?: string;
  keyword?: string; // pour Léa
  productSubject?: string; // pour Kai/Tom
  emailFlow?: string; // pour Noor
}

export async function runElenaPipeline(opts: ElenaPipelineOpts = {}): Promise<PipelineResult> {
  const t0 = Date.now();
  const subReportIds: string[] = [];

  // Estimation : Léa ~$0.008 + Kai ~$0.03 + Tom ~$0.03 + Zoé ~$0.012 + Noor ~$0.025 + Bea ~$0.025 + Elena ~$0.04 ≈ $0.17
  preflight(0.17, "elena-pipeline");

  const keyword = opts.keyword ?? `${opts.niche ?? "produit phare"} guide`;
  const subject = opts.productSubject ?? opts.niche ?? "Produit hero";
  const flowName = opts.emailFlow ?? "Welcome (3 emails)";
  const palette: string[] | undefined = undefined; // brand kit parsing TODO

  // Fan-out parallèle (les 6 specialists sont indépendants).
  const [lea, kai, tom, zoe, noor, bea] = await Promise.all([
    runSeoArticle({ keyword, brandVoiceHint: opts.brandKit?.slice(0, 800) }),
    runVisualBrief({ subject, niche: opts.niche, brandPaletteHex: palette }),
    runVideoBrief({ subject, productName: subject, niche: opts.niche, brandVoiceHint: opts.brandKit?.slice(0, 800) }),
    runSocialCalendar({ weekNumber: opts.weekNumber, brandName: opts.brandName, niche: opts.niche }),
    runEmailBrief({ flowName, brandName: opts.brandName, niche: opts.niche }),
    runCommunityPulse({ weekNumber: opts.weekNumber, brandName: opts.brandName }),
  ]);

  for (const [agent, out, label] of [
    ["lea", lea, "SEO article"],
    ["kai", kai, "Visual brief"],
    ["tom", tom, "Video brief"],
    ["zoe", zoe, "Social calendar"],
    ["noor", noor, "Email brief"],
    ["bea", bea, "Community pulse"],
  ] as const) {
    const r = addReport({
      id: `${agent}-pipe-${Date.now()}-${subReportIds.length}`, date: frDate(), type: "Content",
      title: pickTitle(out.markdown, label),
      agents: [agent, "elena"], tldr: pickTldr(out.markdown, label),
      tag: "note", contentMd: out.markdown, sources: [],
      costUsd: out.costUsd, durationMs: out.durationMs,
    });
    subReportIds.push(r.id);
  }

  // Synthèse Elena.
  const elenaContext =
    `Sub-reports équipe Content cette semaine (extraits) :\n` +
    `--- Léa SEO ---\n${lea.markdown.slice(0, 800)}\n\n` +
    `--- Kai Visuels ---\n${kai.markdown.slice(0, 800)}\n\n` +
    `--- Tom Vidéo ---\n${tom.markdown.slice(0, 800)}\n\n` +
    `--- Zoé Social ---\n${zoe.markdown.slice(0, 800)}\n\n` +
    `--- Noor Email ---\n${noor.markdown.slice(0, 800)}\n\n` +
    `--- Bea Community ---\n${bea.markdown.slice(0, 800)}`;

  const elena = await runContentCalendar({
    niche: opts.niche, brandName: opts.brandName, weekNumber: opts.weekNumber,
    brandKit: (opts.brandKit ?? "") + "\n\n" + elenaContext,
  });

  const totalCost = lea.costUsd + kai.costUsd + tom.costUsd + zoe.costUsd + noor.costUsd + bea.costUsd + elena.costUsd;

  const finalReport = addReport({
    id: `elena-pipe-${Date.now()}`, date: frDate(), type: "Content",
    title: pickTitle(elena.markdown, `Content Calendar — Semaine ${opts.weekNumber ?? 1}`),
    agents: ["elena", "lea", "kai", "tom", "zoe", "noor", "bea"],
    tldr: pickTldr(elena.markdown, "Calendrier content cross-channel"),
    tag: "go" as ReportTag, contentMd: elena.markdown, sources: subReportIds,
    costUsd: elena.costUsd, durationMs: elena.durationMs,
  });

  return {
    markdown: elena.markdown,
    durationMs: Date.now() - t0,
    costUsd: totalCost,
    subReportIds,
    finalReportId: finalReport.id,
  };
}

// ─── Ravi Pipeline : Anna → Hana → Jay → synthèse Ravi ───

export interface RaviPipelineOpts {
  cycleNumber?: number;
  phase?: 1 | 2 | 3;
  budgetEur?: number;
}

export async function runRaviPipeline(opts: RaviPipelineOpts = {}): Promise<PipelineResult> {
  const t0 = Date.now();
  const subReportIds: string[] = [];

  // Estimation : Anna ~$0.04 + Hana ~$0.03 + Jay ~$0.03 + Ravi ~$0.04 ≈ $0.14
  preflight(0.14, "ravi-pipeline");

  // 1. Anna : data brief — base de toute décision.
  const anna = await runDataBrief({ cycleNumber: opts.cycleNumber });
  const annaReport = addReport({
    id: `anna-pipe-${Date.now()}`, date: frDate(), type: "Growth",
    title: pickTitle(anna.markdown, "Data Brief"),
    agents: ["anna", "ravi"], tldr: pickTldr(anna.markdown, "Data Brief"),
    tag: "note", contentMd: anna.markdown, sources: [],
    costUsd: anna.costUsd, durationMs: anna.durationMs,
  });
  subReportIds.push(annaReport.id);

  // 2. Hana : CRO sprint utilise les insights Anna.
  const hana = await runCroSprint({ weekNumber: opts.cycleNumber, context: anna.markdown.slice(0, 2000) });
  const hanaReport = addReport({
    id: `hana-pipe-${Date.now()}`, date: frDate(), type: "Growth",
    title: pickTitle(hana.markdown, "CRO Sprint"),
    agents: ["hana", "ravi"], tldr: pickTldr(hana.markdown, "CRO Sprint"),
    tag: "note", contentMd: hana.markdown, sources: [annaReport.id],
    costUsd: hana.costUsd, durationMs: hana.durationMs,
  });
  subReportIds.push(hanaReport.id);

  // 3. Jay : ads plan (Phase 2+ uniquement, sinon dry-run).
  const jay = await runAdsPlan({
    cycleNumber: opts.cycleNumber, phase: opts.phase, budgetEur: opts.budgetEur,
    context: anna.markdown.slice(0, 1500),
  });
  const jayReport = addReport({
    id: `jay-pipe-${Date.now()}`, date: frDate(), type: "Growth",
    title: pickTitle(jay.markdown, "Ads Plan"),
    agents: ["jay", "ravi"], tldr: pickTldr(jay.markdown, "Ads Plan"),
    tag: jay.phaseActive ? "go" : "flag",
    contentMd: jay.markdown, sources: [annaReport.id],
    costUsd: jay.costUsd, durationMs: jay.durationMs,
  });
  subReportIds.push(jayReport.id);

  // 4. Ravi : synthèse Growth Plan.
  const raviContext =
    `--- Anna Data Brief ---\n${anna.markdown.slice(0, 1500)}\n\n` +
    `--- Hana CRO Sprint ---\n${hana.markdown.slice(0, 1500)}\n\n` +
    `--- Jay Ads Plan ---\n${jay.markdown.slice(0, 1500)}`;

  const ravi = await runGrowthPlan({ cycleNumber: opts.cycleNumber, phase: opts.phase, context: raviContext });

  const totalCost = anna.costUsd + hana.costUsd + jay.costUsd + ravi.costUsd;

  const finalReport = addReport({
    id: `ravi-pipe-${Date.now()}`, date: frDate(), type: "Growth",
    title: pickTitle(ravi.markdown, "Growth Plan (synthèse)"),
    agents: ["ravi", "anna", "hana", "jay"],
    tldr: pickTldr(ravi.markdown, "Growth Plan synthétique"),
    tag: "go", contentMd: ravi.markdown, sources: subReportIds,
    costUsd: ravi.costUsd, durationMs: ravi.durationMs,
  });

  return {
    markdown: ravi.markdown,
    durationMs: Date.now() - t0,
    costUsd: totalCost,
    subReportIds,
    finalReportId: finalReport.id,
  };
}

// ─── Strategy Pipeline : Aria → Maya (one-shot stratégique) ───

export interface StrategyPipelineOpts {
  hint?: string;
  voicehint?: string;
}

export async function runStrategyPipeline(opts: StrategyPipelineOpts = {}): Promise<PipelineResult> {
  const t0 = Date.now();
  const subReportIds: string[] = [];

  // Estimation : Aria ~$0.17 + Maya ~$0.13 ≈ $0.30 (Opus utilisé 1× chez chacun)
  preflight(0.30, "strategy-pipeline");

  // 1. Aria : niche selection.
  const aria = await runNicheSelection({ hint: opts.hint });
  const ariaReport = addReport({
    id: `aria-pipe-${Date.now()}`, date: frDate(), type: "Strategic",
    title: pickTitle(aria.markdown, "Niche Selection"),
    agents: ["aria", "victor"], tldr: pickTldr(aria.markdown, `Pick Victor: ${aria.victorPick}`),
    tag: "go", contentMd: aria.markdown, sources: aria.sources,
    costUsd: aria.costUsd, durationMs: aria.durationMs,
  });
  subReportIds.push(ariaReport.id);

  // 2. Maya : brand kit sur la niche pickée par Victor.
  const maya = await runBrandArchitect({ niche: aria.victorPick, voicehint: opts.voicehint });
  const mayaReport = addReport({
    id: `maya-pipe-${Date.now()}`, date: frDate(), type: "Strategic",
    title: pickTitle(maya.markdown, `Brand Kit — ${maya.brandName}`),
    agents: ["maya", "lina"], tldr: pickTldr(maya.markdown, `Brand: ${maya.brandName}`),
    tag: "go", contentMd: maya.markdown, sources: [ariaReport.id],
    costUsd: maya.costUsd, durationMs: maya.durationMs,
  });
  subReportIds.push(mayaReport.id);

  const fullMd =
    `# 🎩 Strategy Pipeline Output\n\n` +
    `**Niche pickée par Victor :** ${aria.victorPick}\n` +
    `**Marque créée par Maya :** ${maya.brandName}\n\n` +
    `---\n\n## Niche Selection (Aria)\n\n${aria.markdown}\n\n` +
    `---\n\n## Brand Kit (Maya)\n\n${maya.markdown}`;

  return {
    markdown: fullMd,
    durationMs: Date.now() - t0,
    costUsd: aria.costUsd + maya.costUsd,
    subReportIds,
    finalReportId: mayaReport.id,
  };
}
