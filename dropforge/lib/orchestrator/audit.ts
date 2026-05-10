/**
 * Audit Log — every agent invocation is recorded.
 *
 * Lets Théo, Marc and Wren reconstruct what happened : who was called,
 * when, by whom, with which inputs, at which cost, with which outcome.
 *
 * Defense in depth :
 *   - Tail capped at MAX_ENTRIES (no unbounded memory growth)
 *   - Inputs are length-clipped (no full prompt dump in audit)
 *   - Errors are recorded too — silent failures are forbidden
 */

const MAX_ENTRIES = 1000;
const INPUT_CLIP = 280;
const ERROR_CLIP = 280;

export type RunOutcome = "success" | "error" | "frozen" | "rate_limited";

export interface AuditEntry {
  id: string;
  agentId: string;
  caller: string; // "user" | "victor" | "sam" | ... | "system"
  taskKind: string; // free-text label (e.g. "niche-selection", "budget-gate")
  inputDigest: string; // first INPUT_CLIP chars of the input
  outcome: RunOutcome;
  costUsd: number;
  durationMs: number;
  reportId?: string;
  errorMessage?: string;
  createdAt: number;
}

const LOG: AuditEntry[] = [];

function clip(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export function logRun(entry: Omit<AuditEntry, "id" | "createdAt">): AuditEntry {
  const stored: AuditEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    inputDigest: clip(entry.inputDigest, INPUT_CLIP),
    errorMessage: entry.errorMessage ? clip(entry.errorMessage, ERROR_CLIP) : undefined,
    createdAt: Date.now(),
  };
  LOG.unshift(stored);
  if (LOG.length > MAX_ENTRIES) LOG.length = MAX_ENTRIES;
  return stored;
}

export function recent(limit = 50): AuditEntry[] {
  return LOG.slice(0, Math.min(limit, MAX_ENTRIES));
}

export function summary(): {
  total: number;
  successes: number;
  errors: number;
  frozen: number;
  byAgent: Record<string, { runs: number; costUsd: number }>;
} {
  const byAgent: Record<string, { runs: number; costUsd: number }> = {};
  let successes = 0;
  let errors = 0;
  let frozen = 0;
  for (const e of LOG) {
    if (e.outcome === "success") successes++;
    else if (e.outcome === "error") errors++;
    else if (e.outcome === "frozen") frozen++;
    if (!byAgent[e.agentId]) byAgent[e.agentId] = { runs: 0, costUsd: 0 };
    byAgent[e.agentId].runs += 1;
    byAgent[e.agentId].costUsd += e.costUsd;
  }
  return { total: LOG.length, successes, errors, frozen, byAgent };
}
