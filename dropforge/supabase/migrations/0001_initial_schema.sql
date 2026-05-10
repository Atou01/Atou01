-- ─────────────────────────────────────────────────────────
-- DropForge Inc. — Initial schema (Sprint 1)
-- ─────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Agents catalog ──────────────────────────────────────
create table if not exists public.agents (
  id           text primary key,
  name         text not null,
  role         text not null,
  emoji        text,
  level        text not null check (level in ('C-suite', 'manager', 'specialist')),
  manager_id   text references public.agents(id) on delete set null,
  department   text not null,
  default_llm  text not null,
  mantra       text,
  desk_x       int not null,
  desk_y       int not null,
  created_at   timestamptz not null default now()
);

-- ── Live presence ───────────────────────────────────────
create table if not exists public.agent_status (
  agent_id        text primary key references public.agents(id) on delete cascade,
  state           text not null default 'idle'
    check (state in ('idle', 'walking', 'working', 'coffee', 'sleeping', 'meeting')),
  current_x       int,
  current_y       int,
  current_task    text,
  progress        int default 0 check (progress between 0 and 100),
  last_activity_at timestamptz not null default now()
);

-- ── Hierarchical task ledger ────────────────────────────
create table if not exists public.tasks (
  id              uuid primary key default gen_random_uuid(),
  parent_task_id  uuid references public.tasks(id) on delete cascade,
  requested_by    text,
  assigned_to     text references public.agents(id) on delete set null,
  status          text not null default 'pending'
    check (status in ('pending', 'delegated', 'working', 'review', 'done', 'failed')),
  prompt          text not null,
  output          text,
  cost_usd        numeric(10, 4) default 0,
  duration_ms     int default 0,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);
create index if not exists tasks_parent_idx on public.tasks(parent_task_id);
create index if not exists tasks_assignee_idx on public.tasks(assigned_to);
create index if not exists tasks_status_idx on public.tasks(status);

-- ── Iris router catalog ─────────────────────────────────
create table if not exists public.ai_models (
  name             text primary key,
  provider         text not null,
  strengths        text[] not null default '{}',
  cost_per_1k_in   numeric(10, 6) default 0,
  cost_per_1k_out  numeric(10, 6) default 0,
  avg_latency_ms   int default 0,
  quality_score    numeric(3, 2) default 0.5,
  endpoint         text,
  active           boolean not null default true
);

-- ── Skill library (Hermes-inspired) ─────────────────────
create table if not exists public.agent_skills (
  id              uuid primary key default gen_random_uuid(),
  agent_id        text not null references public.agents(id) on delete cascade,
  name            text not null,
  version         int not null default 1,
  trigger_pattern text not null,
  description     text,
  method_md       text not null,
  inputs_json     jsonb not null default '{}'::jsonb,
  outputs_json    jsonb not null default '{}'::jsonb,
  success_count   int not null default 0,
  failure_count   int not null default 0,
  source          text not null default 'self_learned'
    check (source in ('self_learned', 'imported_agentskills_io', 'human_authored')),
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  last_used_at    timestamptz,
  last_updated_at timestamptz not null default now(),
  unique (agent_id, name, version)
);

create table if not exists public.skill_executions (
  id          uuid primary key default gen_random_uuid(),
  skill_id    uuid not null references public.agent_skills(id) on delete cascade,
  task_id     uuid references public.tasks(id) on delete set null,
  outcome     text not null check (outcome in ('success', 'failure', 'partial')),
  feedback_md text,
  created_at  timestamptz not null default now()
);

-- ── E-commerce core ─────────────────────────────────────
create table if not exists public.suppliers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  source          text not null,
  contact_email   text,
  trust_score     numeric(3, 2) default 0.5,
  trade_assurance boolean default false,
  notes_md        text,
  created_at      timestamptz not null default now()
);

create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  source           text,
  source_url       text,
  supplier_id      uuid references public.suppliers(id) on delete set null,
  cost_eur         numeric(10, 2),
  price_eur        numeric(10, 2),
  margin_pct       numeric(5, 2),
  score            numeric(3, 2) default 0,
  status           text not null default 'candidate'
    check (status in ('candidate', 'validated', 'live', 'paused', 'killed')),
  created_by_agent text references public.agents(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  stripe_id    text unique,
  customer_id  text,
  total_eur    numeric(10, 2),
  status       text not null default 'pending'
    check (status in ('pending', 'paid', 'shipped', 'delivered', 'refunded', 'cancelled')),
  supplier_email text,
  tracking_num text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  qty         int not null default 1,
  unit_eur    numeric(10, 2),
  created_at  timestamptz not null default now()
);

-- ── Reports archive ─────────────────────────────────────
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid references public.tasks(id) on delete set null,
  title       text not null,
  content_md  text not null,
  sources     text[] not null default '{}',
  created_by_agent text references public.agents(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── Customer memory (Sofia multi-channel) ───────────────
create table if not exists public.customer_memory (
  customer_id          text primary key,
  email                text,
  ig_handle            text,
  tiktok_handle        text,
  whatsapp             text,
  phone                text,
  conversation_history jsonb not null default '[]'::jsonb,
  last_orders          jsonb not null default '[]'::jsonb,
  preferences          jsonb not null default '{}'::jsonb,
  sentiment_score      numeric(3, 2),
  vip_flag             boolean default false,
  notes_md             text,
  updated_at           timestamptz not null default now()
);
