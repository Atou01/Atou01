/**
 * Report store — in-memory pour Sprint 2 (sera remplacé par Supabase).
 *
 * NOTE : "in-memory" en mode dev = perdu à chaque redémarrage du serveur.
 * Acceptable pour valider la chaîne. Sprint 2.5 : persister dans Supabase.
 */

import type { ReportTag } from "@/lib/data/mock";

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
  return stored;
}

export function listReports(): StoredReport[] {
  return [...STORE];
}

export function findReport(id: string): StoredReport | undefined {
  return STORE.find((r) => r.id === id);
}
