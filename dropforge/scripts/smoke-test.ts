/**
 * Smoke test — sanity check de tous les agents.
 *
 * Usage :
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/smoke-test.ts
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/smoke-test.ts --only theo,nora
 *
 * Lance chaque agent en dry-run minimum, vérifie qu'il :
 *   - répond sans erreur
 *   - produit un Markdown non-vide avec un H1
 *   - inclut une section TL;DR
 *   - reste sous le coût estimé
 *
 * NE TESTE PAS la qualité du contenu (impossible déterministe).
 * Coût total estimé : ~$0.50 (la plupart sont Sonnet 1×).
 *
 * ⚠️ Consomme du quota Anthropic. À lancer en local, pas en CI.
 */

/* eslint-disable no-console */

import { runBudgetGate } from "../lib/agents/theo";
import { runMarketingPulse } from "../lib/agents/lina";
import { runOpsBrief } from "../lib/agents/marc";
import { runTechPlan } from "../lib/agents/nora";
import { runResearchPlan } from "../lib/agents/sam";
import { runContentCalendar } from "../lib/agents/elena";
import { runGrowthPlan } from "../lib/agents/ravi";
import { runSupplierShortlist } from "../lib/agents/diego";
import { runSeoArticle } from "../lib/agents/lea";
import { runVisualBrief } from "../lib/agents/kai";
import { runVideoBrief } from "../lib/agents/tom";
import { runSocialCalendar } from "../lib/agents/zoe";
import { runEmailBrief } from "../lib/agents/noor";
import { runCommunityPulse } from "../lib/agents/bea";
import { runAdsPlan } from "../lib/agents/jay";
import { runDataBrief } from "../lib/agents/anna";
import { runCroSprint } from "../lib/agents/hana";
import { runOrderOps } from "../lib/agents/hugo";
import { runSupportBrief } from "../lib/agents/sofia";
import { runPackagingBrief } from "../lib/agents/ines";

interface Test {
  agentId: string;
  run: () => Promise<{ markdown: string; costUsd: number; durationMs: number }>;
  expectMaxCostUsd: number;
}

const TESTS: Test[] = [
  { agentId: "theo",   run: () => runBudgetGate({ request: "Test : achat €40 stickers Vistaprint", amountEur: 40 }), expectMaxCostUsd: 0.05 },
  { agentId: "lina",   run: () => runMarketingPulse({}), expectMaxCostUsd: 0.15 },
  { agentId: "marc",   run: () => runOpsBrief({}), expectMaxCostUsd: 0.05 },
  { agentId: "nora",   run: () => runTechPlan({ brief: "Setup Stripe checkout" }), expectMaxCostUsd: 0.06 },
  { agentId: "sam",    run: () => runResearchPlan({}), expectMaxCostUsd: 0.05 },
  { agentId: "elena",  run: () => runContentCalendar({}), expectMaxCostUsd: 0.07 },
  { agentId: "ravi",   run: () => runGrowthPlan({}), expectMaxCostUsd: 0.07 },
  { agentId: "diego",  run: () => runSupplierShortlist({ productName: "Mug thermique réutilisable" }), expectMaxCostUsd: 0.02 },
  { agentId: "lea",    run: () => runSeoArticle({ keyword: "comment organiser son bureau" }), expectMaxCostUsd: 0.03 },
  { agentId: "kai",    run: () => runVisualBrief({ subject: "Mug thermique" }), expectMaxCostUsd: 0.05 },
  { agentId: "tom",    run: () => runVideoBrief({ subject: "Mug thermique" }), expectMaxCostUsd: 0.05 },
  { agentId: "zoe",    run: () => runSocialCalendar({}), expectMaxCostUsd: 0.04 },
  { agentId: "noor",   run: () => runEmailBrief({ flowName: "Welcome" }), expectMaxCostUsd: 0.05 },
  { agentId: "bea",    run: () => runCommunityPulse({}), expectMaxCostUsd: 0.04 },
  { agentId: "jay",    run: () => runAdsPlan({ phase: 1 }), expectMaxCostUsd: 0.05 },
  { agentId: "anna",   run: () => runDataBrief({}), expectMaxCostUsd: 0.06 },
  { agentId: "hana",   run: () => runCroSprint({}), expectMaxCostUsd: 0.05 },
  { agentId: "hugo",   run: () => runOrderOps({}), expectMaxCostUsd: 0.02 },
  { agentId: "sofia",  run: () => runSupportBrief({}), expectMaxCostUsd: 0.04 },
  { agentId: "ines",   run: () => runPackagingBrief({}), expectMaxCostUsd: 0.04 },
];

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY required");
    process.exit(1);
  }
  const filter = process.argv.find((a) => a.startsWith("--only"))?.split("=")[1]?.split(",");
  const tests = filter ? TESTS.filter((t) => filter.includes(t.agentId)) : TESTS;

  console.log(`▶  Running ${tests.length} agent smoke tests…\n`);
  let passed = 0;
  let failed = 0;
  let totalCost = 0;

  for (const t of tests) {
    process.stdout.write(`  ${t.agentId.padEnd(8)} `);
    const t0 = Date.now();
    try {
      const out = await t.run();
      const ms = Date.now() - t0;
      const okHeading = /^#\s+/.test(out.markdown);
      const okTldr = /## TL;DR/i.test(out.markdown);
      const okCost = out.costUsd <= t.expectMaxCostUsd;
      const okMd = out.markdown.length > 200;
      const issues: string[] = [];
      if (!okHeading) issues.push("no H1");
      if (!okTldr) issues.push("no TL;DR");
      if (!okCost) issues.push(`cost > $${t.expectMaxCostUsd}`);
      if (!okMd) issues.push("md too short");
      if (issues.length === 0) {
        console.log(`✅  $${out.costUsd.toFixed(4)} · ${(ms / 1000).toFixed(1)}s`);
        passed++;
      } else {
        console.log(`⚠️   ${issues.join(", ")}`);
        failed++;
      }
      totalCost += out.costUsd;
    } catch (err) {
      console.log(`❌  ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  console.log(`\n────────────────`);
  console.log(`✅ ${passed} passed · ❌ ${failed} failed`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
