/**
 * Mia Tanaka — Trend Scout (TikTok/IG)
 * "Je trouve les virals 48h avant tout le monde"
 *
 * Workflow :
 *   1. Perplexity → scrape signaux TikTok/Pinterest/Reddit dans la niche
 *   2. Sonnet 4.6 → score 10 produits candidats sur critères Shark
 *   3. Output : top 10 ranked + 3 red flags par produit
 */

import { complete } from "@/lib/ai/anthropic";
import { agentSearch } from "@/lib/ai/perplexity";

const SYSTEM = `Tu es Mia Tanaka, Trend Scout TikTok/IG de DropForge Inc.
Mantra : "Je trouve les virals 48h avant tout le monde."

Mission : repérer dans une niche donnée 10 produits avec signal viral
fort (TikTok, IG, Pinterest, Reddit) ET potentiel dropshipping concret.

Critères "produit gagnant" Shark Code v2 :

✅ MUST HAVE
- Wow factor visuel en 3 sec sur mute
- Résout douleur OU crée désir viscéral
- Pas trouvable Carrefour/Amazon FR (ou 3× plus cher en magasin)
- Marge potentielle ≥ 4× coût rendu (prix vente / coût AliExpress)
- Engagement TikTok > 8% (likes/views top vidéos)
- Pas de pic Google Trends > 6 mois (= saturation imminente)

🚫 RED FLAGS — ÉLIMINE D'OFFICE
- > 100 ads concurrents actifs sur Meta Ad Library
- Présent sur Temu < 50% du prix marché
- Saisonnalité > 60%
- Marque déposée dans le nom ou design visible
- Délai livraison China > 21j sans alternative EU
- Conformité CE/sécurité requise non triviale

Format de sortie OBLIGATOIRE en Markdown :

# 🕵️ Trend Scout Report — [Niche]

**Demandé par :** Victor / Sam · **Exécuté par :** Mia Tanaka
**Niche :** [niche] · **Date :** [Q2 2026]

## TL;DR
- 3 bullets : top 3 picks + signal le plus chaud

## Top 10 produits candidats (rank par score)

### #1 — [Nom produit court & accrocheur]
**Score viral : X.X/10** · **Marge potentielle : X×**

- **Source virale** : [hashtag TikTok / créateur / vues estimées]
- **Wow factor 3s** : [pourquoi ça scroll-stop]
- **Problème résolu / désir** : [insight client]
- **Coût AliExpress estimé** : €X.XX
- **Prix vente cible FR** : €XX
- **Concurrent FR repéré** : [nom + URL] OU "aucun (gap)"
- **Red flags** : [aucun] OU [liste courte]

### #2 — ...
[idem, format identique pour 10 produits]

## 🚫 Produits éliminés (top 3 + raisons)
- [Nom] — [raison kill en 1 ligne]
- [Nom] — [raison kill]
- [Nom] — [raison kill]

## 🎯 Recommandation Mia
1 paragraphe : par lequel commencer en priorité (le #1 ?
ou un dark horse plus bas dans la liste ?), pourquoi.

Reste factuelle, chiffrée, jamais de hype creuse.`;

export interface ScoutReport {
  markdown: string;
  durationMs: number;
  costUsd: number;
  sources: string[];
  niche: string;
}

export async function runTrendScout(opts: { niche?: string }): Promise<ScoutReport> {
  const t0 = Date.now();
  const niche = opts.niche ?? "Organisation & Productivité Bureau (desk setup)";

  // 1. Recherche signaux viraux via Perplexity
  const researchPrompt =
    `Identifie 12 à 15 produits qui buzzent actuellement sur TikTok, Pinterest, Reddit et Instagram dans la niche : "${niche}" — marché francophone (FR, BE, CH, QC).\n\n` +
    `Pour chaque produit, donne :\n` +
    `- Hashtag TikTok dominant + vues moyennes des top vidéos (en chiffres)\n` +
    `- Créateurs FR/QC qui le présentent\n` +
    `- Lien AliExpress estimé ou nom générique\n` +
    `- Coût d'achat fournisseur typique (€)\n` +
    `- Prix vente moyen observé sur Shopify/Amazon FR (€)\n` +
    `- Présence sur Temu (oui/non, et écart prix)\n` +
    `- Concurrents FR identifiés\n` +
    `- Marque déposée potentielle\n\n` +
    `Période : signaux des 30 derniers jours (Q2 2026). Privilégie les produits en croissance (vues +200% sur 7 jours), pas ceux déjà saturés (>100 ads Meta).\n` +
    `Sois factuel, chiffré, cite tes sources. Mode prédateur : trouve les pépites avant que tout le monde les voit.`;

  const research = await agentSearch(researchPrompt, { preset: "fast-search" });

  // 2. Scoring + ranking par Sonnet (Mia)
  const scoringPrompt =
    `Niche : "${niche}"\n\n` +
    `Voici la recherche Perplexity sur les produits qui buzzent :\n\n` +
    `=====\n${research.text}\n=====\n\n` +
    `Sources : ${research.citations.slice(0, 10).join(", ") || "aucune"}\n\n` +
    `Produit MAINTENANT le Trend Scout Report complet en Markdown.\n` +
    `Applique strictement les Red Flags Shark Code (kill auto si saturation, marque déposée, marge < 4×).\n` +
    `Sors un top 10 ranké par score viral, plus 3 produits éliminés en bas.`;

  const reportMd = await complete({
    model: "sonnet",
    system: SYSTEM,
    messages: [{ role: "user", content: scoringPrompt }],
    maxTokens: 4000,
    temperature: 0.4,
  });

  return {
    markdown: reportMd,
    durationMs: Date.now() - t0,
    costUsd: 0.015 + 0.05,
    sources: research.citations,
    niche,
  };
}
