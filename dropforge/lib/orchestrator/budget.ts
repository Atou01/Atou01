/**
 * Budget Tracker — central spend monitor for all agent runs.
 *
 * Wraps the kill-switch logic Théo enforces : daily cap, monthly cap,
 * manual freeze. Iris (router) and Victor (CEO) MUST consult this before
 * authorizing any new IA call.
 *
 * In-memory in Sprint 2 (resets on serverless cold start). Sprint 2.5 will
 * persist into Supabase.budget_state row so the cap survives restarts.
 */

export interface BudgetCaps {
  dailyUsd: number;
  monthlyUsd: number;
}

export interface BudgetSnapshot {
  caps: BudgetCaps;
  spentTodayUsd: number;
  spentMonthUsd: number;
  spentTotalUsd: number;
  runsToday: number;
  runsMonth: number;
  frozen: boolean;
  freezeReason: string | null;
  dayKey: string; // YYYY-MM-DD
  monthKey: string; // YYYY-MM
  updatedAt: number;
}

const DEFAULT_CAPS: BudgetCaps = {
  dailyUsd: parseFloat(process.env.BUDGET_DAILY_USD ?? "2.00"),
  monthlyUsd: parseFloat(process.env.BUDGET_MONTHLY_USD ?? "50.00"),
};

const STATE: BudgetSnapshot = {
  caps: { ...DEFAULT_CAPS },
  spentTodayUsd: 0,
  spentMonthUsd: 0,
  spentTotalUsd: 0,
  runsToday: 0,
  runsMonth: 0,
  frozen: false,
  freezeReason: null,
  dayKey: dayKey(),
  monthKey: monthKey(),
  updatedAt: Date.now(),
};

function dayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function monthKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 7);
}

function rotateIfNeeded() {
  const now = new Date();
  const dk = dayKey(now);
  const mk = monthKey(now);
  if (dk !== STATE.dayKey) {
    STATE.spentTodayUsd = 0;
    STATE.runsToday = 0;
    STATE.dayKey = dk;
  }
  if (mk !== STATE.monthKey) {
    STATE.spentMonthUsd = 0;
    STATE.runsMonth = 0;
    STATE.monthKey = mk;
    // Manual freeze is preserved across month rollover (admin must unfreeze).
  }
}

export function getBudget(): BudgetSnapshot {
  rotateIfNeeded();
  return { ...STATE, caps: { ...STATE.caps } };
}

export interface CheckResult {
  allowed: boolean;
  reason?: string;
  snapshot: BudgetSnapshot;
}

/**
 * Pre-call check : would consuming `costEstUsd` violate any cap or freeze ?
 * Does NOT mutate state. Use before launching the agent call.
 */
export function checkBudget(costEstUsd: number): CheckResult {
  rotateIfNeeded();
  if (STATE.frozen) {
    return { allowed: false, reason: STATE.freezeReason ?? "Budget frozen.", snapshot: getBudget() };
  }
  if (STATE.spentTodayUsd + costEstUsd > STATE.caps.dailyUsd) {
    return {
      allowed: false,
      reason: `Daily cap $${STATE.caps.dailyUsd} would be exceeded ($${STATE.spentTodayUsd.toFixed(4)} + $${costEstUsd.toFixed(4)}). Théo freeze.`,
      snapshot: getBudget(),
    };
  }
  if (STATE.spentMonthUsd + costEstUsd > STATE.caps.monthlyUsd) {
    return {
      allowed: false,
      reason: `Monthly cap $${STATE.caps.monthlyUsd} would be exceeded ($${STATE.spentMonthUsd.toFixed(2)} + $${costEstUsd.toFixed(2)}). Théo freeze.`,
      snapshot: getBudget(),
    };
  }
  return { allowed: true, snapshot: getBudget() };
}

/**
 * Post-call : record actual spend after a successful agent run.
 * Auto-freezes if a cap is crossed (anomaly = single call > cap).
 */
export function consume(costUsd: number): BudgetSnapshot {
  rotateIfNeeded();
  STATE.spentTodayUsd += Math.max(0, costUsd);
  STATE.spentMonthUsd += Math.max(0, costUsd);
  STATE.spentTotalUsd += Math.max(0, costUsd);
  STATE.runsToday += 1;
  STATE.runsMonth += 1;
  STATE.updatedAt = Date.now();
  if (STATE.spentTodayUsd > STATE.caps.dailyUsd) {
    STATE.frozen = true;
    STATE.freezeReason = `Auto-freeze: daily cap $${STATE.caps.dailyUsd} crossed by single run.`;
  } else if (STATE.spentMonthUsd > STATE.caps.monthlyUsd) {
    STATE.frozen = true;
    STATE.freezeReason = `Auto-freeze: monthly cap $${STATE.caps.monthlyUsd} crossed.`;
  }
  return getBudget();
}

export function freeze(reason: string): BudgetSnapshot {
  STATE.frozen = true;
  STATE.freezeReason = reason;
  STATE.updatedAt = Date.now();
  return getBudget();
}

export function unfreeze(): BudgetSnapshot {
  STATE.frozen = false;
  STATE.freezeReason = null;
  STATE.updatedAt = Date.now();
  return getBudget();
}

export function setCaps(caps: Partial<BudgetCaps>): BudgetSnapshot {
  if (caps.dailyUsd != null && caps.dailyUsd > 0) STATE.caps.dailyUsd = caps.dailyUsd;
  if (caps.monthlyUsd != null && caps.monthlyUsd > 0) STATE.caps.monthlyUsd = caps.monthlyUsd;
  STATE.updatedAt = Date.now();
  return getBudget();
}
