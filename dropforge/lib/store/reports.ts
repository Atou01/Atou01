/**
 * Report store — in-memory pour Sprint 2 (sera remplacé par Supabase).
 *
 * NOTE : "in-memory" en mode dev = perdu à chaque redémarrage du serveur.
 * Acceptable pour valider la chaîne. Sprint 2.5 : persister dans Supabase.
 *
 * Side effect : every addReport() call also feeds the central budget
 * tracker (Théo) and audit log. This is the single hook that gives all
 * agent routes financial + traceability guarantees without touching
 * each route individually.
 */

import type { ReportTag } from "@/lib/data/mock";
import { consume as budgetConsume } from "@/lib/orchestrator/budget";
import { logRun } from "@/lib/orchestrator/audit";
import { getSupabase } from "@/lib/store/supabase";

export interface StoredReport {
  id: string;
  date: string;
  type: string;
  title: string;
  agents: string[];
  tldr: string;
  tag: ReportTag;
  contentMd: string;
  sources: string[];
  costUsd: number;
  durationMs: number;
  createdAt: number;
}

const STORE: StoredReport[] = [];

export function addReport(r: Omit<StoredReport, "createdAt">): StoredReport {
  const stored = { ...r, createdAt: Date.now() };
  STORE.unshift(stored);
  // Théo records the spend (in-memory always, optionally Supabase).
  budgetConsume(r.costUsd);
  // Audit trail : who ran, what type, how long, how much.
  logRun({
    agentId: r.agents[0] ?? "unknown",
    caller: "system",
    taskKind: r.type,
    inputDigest: r.title,
    outcome: "success",
    costUsd: r.costUsd,
    durationMs: r.durationMs,
    reportId: r.id,
  });
  // Fire-and-forget Supabase persistence : ne bloque pas la réponse,
  // mais log l'erreur dans l'audit si fail.
  void persistReport(stored);
  return stored;
}

async function persistReport(r: StoredReport): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { error } = await sb.from("reports").insert({
      title: r.title,
      content_md: r.contentMd,
      sources: r.sources,
      created_by_agent: r.agents[0] ?? null,
    });
    if (error) {
      logRun({
        agentId: "system", caller: "store", taskKind: "supabase-insert",
        inputDigest: `report ${r.id}`, outcome: "error",
        costUsd: 0, durationMs: 0, errorMessage: error.message,
      });
    }
  } catch (err) {
    logRun({
      agentId: "system", caller: "store", taskKind: "supabase-insert",
      inputDigest: `report ${r.id}`, outcome: "error",
      costUsd: 0, durationMs: 0,
      errorMessage: err instanceof Error ? err.message : "unknown",
    });
  }
}

export function listReports(): StoredReport[] {
  return [...STORE];
}

export function findReport(id: string): StoredReport | undefined {
  return STORE.find((r) => r.id === id);
}
