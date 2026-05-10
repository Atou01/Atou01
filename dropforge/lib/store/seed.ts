/**
 * Seed Supabase avec les 26 agents définis dans lib/types/agents.ts.
 * Idempotent : upsert par id.
 *
 * À appeler manuellement (script) ou via /api/admin/seed après avoir
 * appliqué les migrations.
 */

import { AGENTS } from "@/lib/types/agents";
import { getSupabase } from "@/lib/store/supabase";

export interface SeedResult {
  ok: boolean;
  inserted: number;
  errors: string[];
}

export async function seedAgents(): Promise<SeedResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, inserted: 0, errors: ["Supabase not configured."] };

  const rows = AGENTS.map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role,
    emoji: a.emoji,
    level: a.level,
    manager_id: a.managerId,
    department: a.department,
    default_llm: a.defaultLLM,
    mantra: a.mantra,
    desk_x: a.desk.x,
    desk_y: a.desk.y,
  }));

  // Insert managers d'abord (FK manager_id), puis specialists.
  const cSuite = rows.filter((r) => r.manager_id === null || r.manager_id === "victor");
  const others = rows.filter((r) => !cSuite.includes(r));

  const errors: string[] = [];
  let inserted = 0;

  for (const batch of [cSuite, others]) {
    const { error, count } = await sb.from("agents").upsert(batch, { onConflict: "id", count: "exact" });
    if (error) errors.push(error.message);
    else inserted += count ?? batch.length;
  }

  return { ok: errors.length === 0, inserted, errors };
}
