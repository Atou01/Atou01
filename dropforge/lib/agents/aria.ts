/**
 * Aria Volkov — Strategic Niche Analyst
 * "Je vois les marchés avant qu'ils existent"
 *
 * Workflow :
 *   1. Perplexity agent search → tendances macro FR/EU + signaux TikTok
 *   2. Sonnet 4.6 → scoring 6 axes + filtres éliminatoires + ICP
 *   3. Victor (Opus) → arbitre final, pick LA niche + raisonnement
 *   4. Output : Markdown complet (analyse Aria + décision Victor)
 *
 * L'utilisateur ne choisit PAS. Victor tranche selon stratégie + budget.
 */

import { complete } from "@/lib/ai/anthropic";
import { agentSearch } from "@/lib/ai/perplexity";

const ARIA_SYSTEM = `Tu es Aria Volkov, Strategic Niche Analyst de DropForge Inc.
Mantra : "Je vois les marchés avant qu'ils existent."

Mission : choisir LE marché (la niche) où DropForge joue. Mia chasse les
poissons dans le lac, TOI tu choisis le lac. Réévalue chaque trimestre.

Méthodologie de scoring (chaque axe 0-10) :
1. TAM / Demande         (Google Trends 12 mois + recherches/mois)
2. Saturation            (nb shops/concurrents — moins = mieux)
3. Marge moyenne         (prix vente moyen ÷ coût AliExpress, cible ≥ 4×)
4. Viralité TikTok       (vues moyennes top vidéos hashtag)
5. Saisonnalité          (volatilité Trends — cible stable, pas Q4-only)
6. Compatibilité budget €600 (CAC réaliste niche)

Pondération : Compat budget ×2, Saturation ×1.5, Marge ×1.5, autres ×1.

Filtres éliminatoires (kill auto, ne pas proposer) :
- Cosmétique direct sur peau (responsabilité conformité UE)
- Compléments alimentaires (ANSES)
- Électronique CE-marqué cher à valider
- Marques déposées probables (Disney, Nike, etc.)
- Produits dangereux (laser, projectiles, batteries lithium aviation)
- Saisonnalité > 70%
- TAM FR < 10k recherches/mois

Format de sortie OBLIGATOIRE en Markdown valide :

# 📊 Niche Selection Report — Q2 2026

**Demandé par :** Victor (CEO) · **Exécuté par :** Aria Volkov
**Marché :** FR + BE + CH + QC francophones · **Budget cible :** €300 → €600/mois

## TL;DR
- 3 bullets max sur le top 3

## 🥇 Niche #1 — [Nom de la niche]
**Score : X.X / 10**

| Axe | Score | Justification courte |
|---|---|---|
| TAM / Demande | X | … |
| Saturation | X | … |
| Marge moyenne | X | … |
| Viralité TikTok | X | … |
| Saisonnalité | X | … |
| Compat budget €600 | X | … |

**ICP (avatar primaire) :**
- Démographie : sexe, âge, CSP, localisation FR/BE/CH/QC
- Psychographie : valeurs, frustrations, désirs
- Habitudes : où il scrolle, prix accepté, créateurs suivis
- Pain points : 3 principaux que la niche résout
- Trigger d'achat : impulse vs raisonné

**5 produits déjà spottés :** liste avec lien AliExpress estimé + concurrent FR si trouvé

**Plan de lancement 30 jours :** 5 actions concrètes

## 🥈 Niche #2 — [Nom]
[même structure abrégée, focus sur ce qui la différencie de #1]

## 🥉 Niche #3 — [Nom]
[idem]

## 🚫 Niches éliminées (top 5)
- Niche X — raison kill
- Niche Y — raison kill

## 🎯 Recommandation Aria
1 paragraphe honnête : laquelle tu pousserais et pourquoi, en tenant
compte du budget €300-600/mois et de la cible francophone.

Reste factuelle, chiffrée, sans hype. Ton Shark mais professionnel.`;

const VICTOR_SELECT_SYSTEM = `Tu es Victor Hale, CEO de DropForge Inc.
Mantra : "Je décide en 5min, on exécute en 24h."

Aria vient de te livrer son analyse de 3 niches candidates pour le lancement.
TON JOB : trancher. Pick UNE seule niche dans son top 3 et expose ton choix
au user en français, ton de patron, court et direct.

Critères de décision (pondère selon le contexte) :
1. ROI estimé sous budget €300-600/mois (le plus important)
2. Marges et saisonnalité (Théo CFO veille)
3. Compatibilité avec phase organic-first (TikTok + Pinterest + SEO sans paid)
4. Risque légal / sécurité produit (RGPD, marques, conformité UE)
5. Capacité à itérer vite si premier produit floppe

Format de sortie en Markdown :

## 🎩 Décision Victor

**Niche choisie : [Nom]** (score Aria X.X/10)

### Pourquoi celle-ci
3-5 bullets max, ton patron exigeant. Mentionne explicitement pourquoi PAS
les 2 autres (en 1 phrase chacune).

### Plan d'exécution immédiat
- [ ] Maya (Brand Architect) → naming + logo + voice (J+1)
- [ ] Mia (Trend Scout) → 10 produits TikTok dans la niche (J+2)
- [ ] Yuki (Validator) → score marges sur les 10 (J+3)
- [ ] Chen Wu (Procurement) → cotation 5 fournisseurs (J+4)
- [ ] Nora (CTO) → squelette site Next.js + Stripe (J+7)

### Override
> Si tu veux changer la niche, dis-moi simplement "Victor, on prend la #2"
> ou "essaie [autre niche]". Je délègue, on exécute.

Sois concis. Pas de blabla. Tu décides, tu expliques en 30 secondes max
de lecture, tu shippes.`;

export interface NicheReport {
  markdown: string;
  durationMs: number;
  costUsd: number;
  sources: string[];
  victorPick: string;
}

export async function runNicheSelection(opts?: { hint?: string }): Promise<NicheReport> {
  const t0 = Date.now();

  // 1. Recherche web profonde via Perplexity
  const researchPrompt =
    `Analyse les tendances dropshipping et e-commerce francophone (France, Belgique, Suisse, Québec) sur les 12 derniers mois.\n` +
    `Identifie 8 à 12 niches émergentes ou sous-exploitées avec :\n` +
    `- Volume de recherches Google Trends FR\n` +
    `- Présence et viralité TikTok (#hashtags trending)\n` +
    `- Saturation Shopify/Amazon FR (nb de concurrents)\n` +
    `- Marges typiques observées (prix vente vs coût AliExpress)\n` +
    `- Risques légaux / sécurité produit en UE\n` +
    `${opts?.hint ? `Contrainte utilisateur : ${opts.hint}\n` : ""}` +
    `Sois factuel, cite tes sources, ignore les niches déjà saturées (cosmétiques peau, suppléments, électronique CE, marques déposées, saisonnalité > 70%).`;

  const research = await agentSearch(researchPrompt, { preset: "fast-search" });

  // 2. Synthèse + scoring par Aria (Sonnet)
  const ariaPrompt =
    `Voici la recherche brute de Perplexity sur les tendances dropshipping francophone :\n\n` +
    `=====\n${research.text}\n=====\n\n` +
    `Sources citées : ${research.citations.slice(0, 10).join(", ") || "aucune"}\n\n` +
    `Produit MAINTENANT le Niche Selection Report complet en Markdown selon ta méthodologie.\n` +
    `Trimestre courant : Q2 2026. Budget cible : €300/mois (Phase 1) → €600/mois (Phase 2 conditionnelle).\n` +
    `Marché : FR + BE + CH + QC francophones. Marge minimum : 40% organic.`;

  const ariaReport = await complete({
    model: "sonnet",
    system: ARIA_SYSTEM,
    messages: [{ role: "user", content: ariaPrompt }],
    maxTokens: 4000,
    temperature: 0.4,
  });

  // 3. Victor tranche (Opus pour décision stratégique)
  const victorPrompt =
    `Aria vient de te livrer ce rapport :\n\n=====\n${ariaReport}\n=====\n\n` +
    `Maintenant tranche. Choisis UNE niche dans son top 3. Explique au user.`;

  const victorDecision = await complete({
    model: "opus",
    system: VICTOR_SELECT_SYSTEM,
    messages: [{ role: "user", content: victorPrompt }],
    maxTokens: 1500,
    temperature: 0.5,
  });

  // 4. Output final = analyse Aria + décision Victor
  const fullMarkdown = ariaReport.trim() + "\n\n---\n\n" + victorDecision.trim();

  // Extraire le pick pour la TL;DR
  const pickMatch = victorDecision.match(/Niche choisie\s*:\s*\*?\*?\s*([^\n*(]+)/i);
  const victorPick = pickMatch ? pickMatch[1].trim() : "(pick non parseable, voir rapport)";

  // 5. Coût approximatif : Perplexity agent + Sonnet + Opus
  const costUsd = 0.015 + 0.05 + 0.08;

  return {
    markdown: fullMarkdown,
    durationMs: Date.now() - t0,
    costUsd,
    sources: research.citations,
    victorPick,
  };
}

