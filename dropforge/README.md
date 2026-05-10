# DropForge Inc. — Virtual Office

> Dropshipping autonome orchestré par 25 agents IA. L'utilisateur ne parle qu'au CEO (Victor) qui délègue dans la chaîne hiérarchique.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Anthropic SDK (Claude Opus 4.7 / Sonnet 4.6 / Haiku 4.5)
- Supabase (Postgres + Realtime, Sprint 2)
- PixiJS (animations bureau, Sprint 2)
- Vercel (déploiement)

## Setup local (Sprint 1)

### 1. Installer les dépendances

```bash
cd dropforge
npm install
```

### 2. Vérifier les clés API

Le fichier `.env.local` doit contenir au minimum :

```
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
GOOGLE_AI_API_KEY=AIza...
```

Vérification rapide (sans afficher les valeurs) :

```bash
grep -E "^[A-Z_]+=" .env.local | awk -F= '{ if (length($2) > 0) print $1 " ✅"; else print $1 " ❌" }'
```

### 3. Lancer le dev server

```bash
npm run dev
```

Ouvre http://localhost:3000.

## Pages disponibles

| Route | Rôle |
|---|---|
| `/` | Landing — liste des 25 agents |
| `/chat` | Conversation avec Victor (CEO) — il classifie et délègue |
| `/office` | Vue isométrique du bureau — survole un agent pour son mantra |

## API endpoints

| Endpoint | Méthode | Rôle |
|---|---|---|
| `/api/chat` | POST | Reçoit un message user, retourne la réponse de Victor + le routing |
| `/api/agent/status` | POST | (stub) Update l'état d'un agent — branchera Supabase Realtime en Sprint 2 |

## Architecture

```
app/
  ├─ chat/         page conversation user ↔ Victor
  ├─ office/       vue 25 agents
  └─ api/
     ├─ chat/         orchestration CEO
     └─ agent/status/ presence stub

components/
  ├─ chat/ChatInterface.tsx   client-side React
  └─ office/Office.tsx        SVG grid (PixiJS plus tard)

lib/
  ├─ ai/anthropic.ts          wrapper Claude (complete + classify)
  ├─ orchestrator/
  │   ├─ routing.ts           Haiku classifier → routing label
  │   └─ victor.ts            CEO system prompt + chain-of-command
  └─ types/agents.ts          25 agents (id, role, manager, mantra, desk)

supabase/migrations/
  └─ 0001_initial_schema.sql  agents, tasks, ai_models, products, etc.
```

## Sprint 1 — fait

- [x] Repo Next.js + Tailwind + TS
- [x] 25 agents catalogués avec rôles, mantras, mappings LLM
- [x] Page landing `/`
- [x] Page `/chat` avec Victor qui classifie via Haiku et délègue
- [x] Page `/office` (SVG, sera PixiJS en Sprint 2)
- [x] Schéma Supabase complet (10 tables) prêt à appliquer
- [x] Endpoint `/api/agent/status` stub

## Sprint 2 — à venir

- Supabase project + appliquer la migration
- Wire `/api/agent/status` au vrai upsert + Supabase Realtime
- Page `/office` passe en PixiJS, sprites pixel art animés
- Iris (Router) en service réel + table `ai_models` peuplée
- Premier agent vivant : Aria livre le rapport de niche

## Sécurité

- `.env.local` jamais commit (vérifié dans `.gitignore` racine + sous-dossier)
- Clés en chat = compromises → rotation immédiate après validation locale
- Spend caps obligatoires : Anthropic $20/mo, Perplexity $10/mo

## Conventions

- Toutes les tâches passent par la table `tasks` (parent_task_id pour la chaîne)
- Coûts IA loggés par tâche
- Kill switch dans `/admin` (Sprint 3)
- Branche de dev : `claude/marketing-mcp-skills-MPL6a`
