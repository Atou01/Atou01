/**
 * Guards — request-level controls applied to every agent route.
 *
 *   - requireBudget()   : Théo's pre-flight check (freeze + caps)
 *   - requireAdmin()    : x-admin-key header for /api/admin/*
 *   - sanitizeInput()   : length cap + basic prompt-injection screen
 *   - rateLimited()     : naive in-memory per-route rate limit
 */

import type { NextRequest } from "next/server";
import { checkBudget, type BudgetSnapshot } from "@/lib/orchestrator/budget";

const MAX_INPUT_CHARS = 8000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_WINDOW = 30;

const RATE_BUCKET = new Map<string, number[]>();

export interface BudgetGuardOk {
  ok: true;
  snapshot: BudgetSnapshot;
}
export interface BudgetGuardBlocked {
  ok: false;
  status: 429;
  reason: string;
  snapshot: BudgetSnapshot;
}

export function requireBudget(estCostUsd = 0.05): BudgetGuardOk | BudgetGuardBlocked {
  const check = checkBudget(estCostUsd);
  if (!check.allowed) {
    return { ok: false, status: 429, reason: check.reason ?? "Budget guard blocked.", snapshot: check.snapshot };
  }
  return { ok: true, snapshot: check.snapshot };
}

/**
 * Admin-only routes. If ADMIN_KEY env var is unset (dev/local), the guard
 * is permissive but logs a warning. In prod, ADMIN_KEY MUST be set.
 */
export function requireAdmin(req: NextRequest): { ok: true } | { ok: false; status: 401 | 403; reason: string } {
  const expected = process.env.ADMIN_KEY?.trim();
  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, status: 403, reason: "ADMIN_KEY not configured in production." };
    }
    return { ok: true };
  }
  const provided = req.headers.get("x-admin-key")?.trim();
  if (!provided) return { ok: false, status: 401, reason: "Missing x-admin-key header." };
  if (provided !== expected) return { ok: false, status: 403, reason: "Invalid x-admin-key." };
  return { ok: true };
}

const SUSPICIOUS_PATTERNS = [
  /ignore (all|previous|above)\s+(instructions?|rules?|prompts?)/i,
  /system prompt/i,
  /you are now/i,
  /jailbreak/i,
  /pretend (you|to be)/i,
  /act as (a|an) /i,
  /reveal (your|the) (system|prompt|instructions)/i,
  /BEGIN SYSTEM/i,
];

export interface SanitizedInput {
  ok: true;
  value: string;
  flagged: string[];
}
export interface SanitizeError {
  ok: false;
  status: 400 | 413;
  reason: string;
}

export function sanitizeInput(raw: string): SanitizedInput | SanitizeError {
  if (typeof raw !== "string") return { ok: false, status: 400, reason: "Input must be a string." };
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: false, status: 400, reason: "Input is empty." };
  if (trimmed.length > MAX_INPUT_CHARS) {
    return { ok: false, status: 413, reason: `Input exceeds ${MAX_INPUT_CHARS} chars.` };
  }
  const flagged: string[] = [];
  for (const re of SUSPICIOUS_PATTERNS) {
    const m = trimmed.match(re);
    if (m) flagged.push(m[0].slice(0, 60));
  }
  return { ok: true, value: trimmed, flagged };
}

export interface RateLimitOk {
  ok: true;
  remaining: number;
}
export interface RateLimitBlocked {
  ok: false;
  status: 429;
  reason: string;
  retryAfterMs: number;
}

export function rateLimited(key: string): RateLimitOk | RateLimitBlocked {
  const now = Date.now();
  const bucket = RATE_BUCKET.get(key) ?? [];
  const fresh = bucket.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (fresh.length >= RATE_LIMIT_MAX_PER_WINDOW) {
    const oldest = Math.min(...fresh);
    return {
      ok: false,
      status: 429,
      reason: `Rate limit: ${RATE_LIMIT_MAX_PER_WINDOW} req/min on ${key}.`,
      retryAfterMs: RATE_LIMIT_WINDOW_MS - (now - oldest),
    };
  }
  fresh.push(now);
  RATE_BUCKET.set(key, fresh);
  return { ok: true, remaining: RATE_LIMIT_MAX_PER_WINDOW - fresh.length };
}

export function clientKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "anonymous";
}
