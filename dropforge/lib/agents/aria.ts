/**
 * Aria Volkov — Strategic Niche Analyst
 * "Je vois les marchés avant qu'ils existent"
 *
 * Workflow :
 *   1. Perplexity agent search → tendances macro FR/EU + signaux TikTok
 *   2. Sonnet 4.6 → scoring 6 axes + filtres éliminatoires + ICP
 *   3. Output Markdown structuré (Niche Selection Report)
 */

import { complete } from "@/lib/ai/anthropic";
import { agentSearch } from "@/lib/ai/perplexity";

const SYSTEM = `Tu es Aria Volkov, Strategic Niche Analyst de DropForge Inc.
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

# 📊 Niche Selection Report — [période/Q]

**Demandé par :** User · **Exécuté par :** Aria Volkov · **Coût IA :** ~$X.XX

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

**5 produits déjà spottés dans cette niche :** liste avec lien AliExpress estimé + concurrent FR si trouvé

**Plan de lancement 30 jours :** 5 actions concrètes

## 🥈 Niche #2 — [Nom]
[même structure abrégée, focus sur ce qui la différencie de #1]

## 🥉 Niche #3 — [Nom]
[idem]

## 🚫 Niches éliminées (top 5)
- Niche X — raison kill
- Niche Y — raison kill
- ...

## 🎯 Recommandation Aria
1 paragraphe honnête : laquelle tu pousserais et pourquoi, en tenant
compte du budget €300-600/mois et de la cible francophone.

Reste factuelle, chiffrée, sans hype. Ton Shark mais professionnel.`;

export interface NicheReport {
  markdown: string;
  durationMs: number;
  costUsd: number;
  sources: string[];
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

  // 2. Synthèse + scoring par Sonnet
  const synthesisPrompt =
    `Voici la recherche brute de Perplexity sur les tendances dropshipping francophone :\n\n` +
    `=====\n${research.text}\n=====\n\n` +
    `Sources citées : ${research.citations.slice(0, 10).join(", ") || "aucune"}\n\n` +
    `Produit MAINTENANT le Niche Selection Report complet en Markdown selon ta méthodologie.\n` +
    `Trimestre courant : Q2 2026. Budget cible : €300/mois (Phase 1) → €600/mois (Phase 2 conditionnelle).\n` +
    `Marché : FR + BE + CH + QC francophones. Marge minimum : 40% organic.`;

  const reportMd = await complete({
    model: "sonnet",
    system: SYSTEM,
    messages: [{ role: "user", content: synthesisPrompt }],
    maxTokens: 4000,
    temperature: 0.4,
  });

  // 3. Coût approximatif
  const costUsd = 0.015 + 0.05; // Perplexity agent ~$0.015 + Sonnet ~$0.05 typical

  return {
    markdown: reportMd,
    durationMs: Date.now() - t0,
    costUsd,
    sources: research.citations,
  };
}
