-- ─────────────────────────────────────────────────────────
-- DropForge Inc. — Controls layer persistence (Sprint 2.5)
-- Persiste budget tracker (Théo) + audit log dans Supabase
-- pour survivre aux cold starts serverless.
-- ─────────────────────────────────────────────────────────

-- ── Budget state (singleton row) ────────────────────────
create table if not exists public.budget_state (
  id                 text primary key default 'singleton',
  daily_cap_usd      numeric(10, 4) not null default 2.00,
  monthly_cap_usd    numeric(10, 4) not null default 50.00,
  spent_today_usd    numeric(10, 4) not null default 0,
  spent_month_usd    numeric(10, 4) not null default 0,
  spent_total_usd    numeric(12, 4) not null default 0,
  runs_today         int not null default 0,
  runs_month         int not null default 0,
  frozen             boolean not null default false,
  freeze_reason      text,
  day_key            text not null,        -- YYYY-MM-DD
  month_key          text not null,        -- YYYY-MM
  updated_at         timestamptz not null default now()
);

-- Seed singleton row (idempotent)
insert into public.budget_state (id, day_key, month_key)
values ('singleton', to_char(now(), 'YYYY-MM-DD'), to_char(now(), 'YYYY-MM'))
on conflict (id) do nothing;

-- ── Audit log (append-only, capped) ─────────────────────
create table if not exists public.audit_log (
  id              uuid primary key default gen_random_uuid(),
  agent_id        text not null,
  caller          text not null default 'system',
  task_kind       text not null,
  input_digest    text,
  outcome         text not null check (outcome in ('success', 'error', 'frozen', 'rate_limited')),
  cost_usd        numeric(10, 4) not null default 0,
  duration_ms     int not null default 0,
  report_id       text,
  error_message   text,
  created_at      timestamptz not null default now()
);
create index if not exists audit_log_agent_idx on public.audit_log(agent_id);
create index if not exists audit_log_outcome_idx on public.audit_log(outcome);
create index if not exists audit_log_created_idx on public.audit_log(created_at desc);

-- Garde-fou : trim auto à 10 000 entrées (Théo audit retention)
create or replace function public.trim_audit_log() returns trigger
language plpgsql as $$
begin
  delete from public.audit_log
  where id in (
    select id from public.audit_log order by created_at desc offset 10000
  );
  return null;
end $$;

drop trigger if exists audit_log_trim on public.audit_log;
create trigger audit_log_trim
  after insert on public.audit_log
  execute function public.trim_audit_log();

-- ── RLS policies ────────────────────────────────────────
alter table public.budget_state enable row level security;
alter table public.audit_log    enable row level security;

-- Service role only (no user-side reads).
drop policy if exists "service_role_all_budget" on public.budget_state;
create policy "service_role_all_budget" on public.budget_state
  for all to service_role using (true) with check (true);

drop policy if exists "service_role_all_audit" on public.audit_log;
create policy "service_role_all_audit" on public.audit_log
  for all to service_role using (true) with check (true);
