/**
 * Iris Vega — Chief AI Officer / Router
 * Choisit le modèle optimal selon la nature de la tâche.
 * "Le bon modèle au bon prix au bon moment."
 *
 * Iris consulte le budget tracker (Théo) avant chaque décision : si freeze
 * actif ou cap dépassé, elle refuse de router et l'appelant doit annuler.
 */

import { checkBudget, getBudget, type BudgetSnapshot } from "@/lib/orchestrator/budget";

export type ModelChoice =
  | { provider: "anthropic"; model: "claude-opus-4-7" | "claude-sonnet-4-6" | "claude-haiku-4-5-20251001" }
  | { provider: "perplexity"; mode: "search" | "agent" | "embeddings" }
  | { provider: "google"; model: "gemini-2.0-flash" | "imagen-3.0-generate-002" };

export type TaskKind =
  | "classify"
  | "fast-reply"
  | "negotiation"
  | "creative-copy"
  | "deep-strategy"
  | "web-research"
  | "trend-research"
  | "vision"
  | "logo-or-image"
  | "embeddings"
  | "code";

export interface RoutingDecision {
  choice: ModelChoice;
  rationale: string;
  estimatedCostUsd: number;
}

const COST_TABLE: Record<string, number> = {
  "claude-opus-4-7": 0.015,
  "claude-sonnet-4-6": 0.003,
  "claude-haiku-4-5-20251001": 0.0008,
  "perplexity-search": 0.0050,
  "perplexity-agent": 0.0150,
  "perplexity-embeddings": 0.0001,
  "gemini-2.0-flash": 0.0001,
  "imagen-3.0-generate-002": 0.0,
};

export function route(kind: TaskKind, hint?: string): RoutingDecision {
  switch (kind) {
    case "classify":
    case "fast-reply":
      return {
        choice: { provider: "anthropic", model: "claude-haiku-4-5-20251001" },
        rationale: "Tâche routine → Haiku (volume, latence basse, $0.80/1M tokens).",
        estimatedCostUsd: COST_TABLE["claude-haiku-4-5-20251001"],
      };
    case "negotiation":
    case "creative-copy":
    case "code":
      return {
        choice: { provider: "anthropic", model: "claude-sonnet-4-6" },
        rationale: "Qualité requise sans cramer le budget → Sonnet 4.6.",
        estimatedCostUsd: COST_TABLE["claude-sonnet-4-6"],
      };
    case "deep-strategy":
      return {
        choice: { provider: "anthropic", model: "claude-opus-4-7" },
        rationale: "Synthèse stratégique CEO/CMO → Opus 4.7 (5% des appels max).",
        estimatedCostUsd: COST_TABLE["claude-opus-4-7"],
      };
    case "web-research":
    case "trend-research":
      return {
        choice: { provider: "perplexity", mode: hint === "deep" ? "agent" : "search" },
        rationale: "Recherche web temps réel + citations → Perplexity Sonar.",
        estimatedCostUsd: COST_TABLE[hint === "deep" ? "perplexity-agent" : "perplexity-search"],
      };
    case "vision":
      return {
        choice: { provider: "google", model: "gemini-2.0-flash" },
        rationale: "Analyse images concurrents/produits → Gemini Flash (cheap, rapide).",
        estimatedCostUsd: COST_TABLE["gemini-2.0-flash"],
      };
    case "logo-or-image":
      return {
        choice: { provider: "google", model: "imagen-3.0-generate-002" },
        rationale: "Génération visuelle → Google Imagen 3 (free tier).",
        estimatedCostUsd: 0,
      };
    case "embeddings":
      return {
        choice: { provider: "perplexity", mode: "embeddings" },
        rationale: "Vectorisation catalogue/FAQ → Perplexity embed v1-4b.",
        estimatedCostUsd: COST_TABLE["perplexity-embeddings"],
      };
  }
}

/**
 * Variant qui combine routing + check budget. À utiliser depuis tout
 * agent-runner : si `allowed` est faux, ne PAS lancer l'appel IA.
 */
export interface RoutingDecisionGuarded extends RoutingDecision {
  allowed: boolean;
  blockedReason?: string;
  budget: BudgetSnapshot;
}

export function routeGuarded(kind: TaskKind, hint?: string): RoutingDecisionGuarded {
  const decision = route(kind, hint);
  const guard = checkBudget(decision.estimatedCostUsd);
  return {
    ...decision,
    allowed: guard.allowed,
    blockedReason: guard.allowed ? undefined : guard.reason,
    budget: guard.snapshot,
  };
}

/** Ré-export pratique pour Théo / admin. */
export function currentBudget(): BudgetSnapshot {
  return getBudget();
}
