# DropForge Inc. — Mémoire Projet

> Projet de **dropshipping autonome** orchestré par une équipe d'agents IA, avec dashboard "virtual office" animé en pixel art. L'utilisateur ne dialogue qu'avec le CEO (Victor) qui délègue dans la chaîne hiérarchique.

---

## 🎯 Vision

Construire une **vraie entreprise IA** qui :
- Trouve seule les produits gagnants (TikTok Shop, AliExpress, Amazon BS)
- Crée et gère le site e-commerce
- Produit le contenu (SEO, social, ads vidéo)
- Lance et optimise les campagnes payantes
- Gère commandes, support, finances
- Est référencée naturellement (SEO auto)

L'utilisateur **ne parle qu'au CEO**. La chaîne hiérarchique est respectée comme dans une vraie entreprise.

---

## 🏢 Organigramme — DropForge Inc. (18 agents)

### C-Suite (6)
| Nom | Rôle | LLM principal | Skills/Tools |
|---|---|---|---|
| **Victor Hale** 🎩 | CEO — interlocuteur unique de l'utilisateur | Opus 4.7 | deep-research, market-research, Notion, Slack |
| **Nora Chen** 💻 | CTO — site, infra, sécurité | Sonnet 4.6 | nextjs-developer, frontend-design, security-review, GitHub/Vercel/Supabase MCP |
| **Lina Costa** 📢 | CMO — stratégie marketing & brand | Opus 4.7 (hebdo) | content-engine, market-research, Google Calendar |
| **Marc Devlin** ⚙️ | COO — process, ops, fournisseurs | Sonnet 4.6 | workflow-automator, n8n-workflow-patterns, Gmail, Slack |
| **Théo Roux** 💰 | CFO — cash, marges, fraude | Sonnet 4.6 | stripe-specialist, stripe-automation, Stripe MCP |
| **Iris Vega** 🧠 | Chief AI Officer = "The Router" — choisit le meilleur LLM par tâche, A/B teste | Haiku 4.5 | service custom `router.ts` + table `ai_models` |

### Managers (3)
| Nom | Rôle | Reporte à | LLM |
|---|---|---|---|
| **Sam Kovacs** 🔍 | Head of Product Research | CEO | Sonnet (data-scraper-agent, deep-research, exa-search, Perplexity) |
| **Elena Park** 🎨 | Head of Content & Brand | CMO | Sonnet (content-engine, crosspost, design-shotgun, article-writing) |
| **Ravi Mehta** 📈 | Head of Growth & Ads | CMO | Sonnet (competitive-ads-extractor, twitter-algorithm-optimizer, x-api) |

### Specialists (10)
**Équipe Sam (Research)**
- **Mia Tanaka** 🕵️ — Trend Scout (TikTok/IG) — Perplexity Sonar Pro + Firecrawl + Exa
- **Diego Silva** 📦 — Supplier Hunter (AliExpress/CJ) — Haiku + Gmail
- **Yuki Brand** ✅ — Product Validator — Gemini 2.0 Flash (vision)

**Équipe Elena (Content)**
- **Léa Moreau** ✍️ — SEO Copywriter — Haiku 4.5 (content-research-writer, article-writing)
- **Kai Foster** 📸 — Visual Designer — fal.ai Flux Pro + Canva
- **Tom Nakamura** 🎬 — Video Producer (UGC ads) — Veo 3 + ElevenLabs (remotion, video-editing)
- **Zoé Adler** 📱 — Social Media Manager — Haiku (crosspost, x-api, Slack)

**Équipe Ravi (Growth)**
- **Jay Okafor** 🎯 — Paid Ads Specialist (Meta/TikTok) — Sonnet
- **Anna Reis** 📊 — Data Analyst — Sonnet (SQL Supabase, GA4)

**Équipe Marc (Ops)**
- **Hugo Bernal** 🛒 — Order Ops — Haiku (workflow-automator, Stripe + Gmail)
- **Sofia Ahmed** 💬 — Customer Support — Sonnet (Gmail + Slack, FAQ vector search)

---

## 💬 Règles de communication

1. **L'utilisateur ne parle qu'à Victor.** Aucun agent ne shortcut la hiérarchie pour lui parler.
2. **Chaîne :** User ↔ Victor → Manager → Specialist → Manager → Victor → User
3. Victor classifie chaque demande via Haiku (router rapide) puis délègue.
4. Si demande ambiguë : Victor pose **1 seule question** de clarification, jamais plus.
5. Tout est tracé dans la table `tasks` (parent_task_id) — la chaîne est rejouable dans l'UI.

### Routing table (Victor)
| Demande | Délégué à |
|---|---|
| Recherche produit / tendance / marché | Sam |
| SEO, blog, fiches produit, social | Elena |
| Ads, campagnes payantes, ROAS | Ravi |
| Site, bugs, déploiement | Nora |
| Commandes, fournisseurs, support | Marc |
| Marges, cash, fraude | Théo |
| Stratégie / nouvelle niche | Victor garde, consulte tout le monde |

---

## 📄 Format standardisé des rapports

```markdown
# 📊 Rapport — [Sujet]
**Demandé par :** Toi
**Exécuté par :** [chaîne d'agents]
**Durée :** Xmin · **Coût IA :** $X.XX

## TL;DR
[3 bullets max]

## Détails
[corps]

## Sources
[liens]

## Recommandations de Victor
[3 actions concrètes]

## Prochaines étapes
[ ] Action 1 (assignée à X)
```

---

## 🧠 The Router (Iris Vega)

Service `router.ts` qui choisit le LLM optimal par tâche.

### Routing par défaut
| Tâche | Modèle |
|---|---|
| Recherche web temps réel, citations | **Perplexity Sonar Pro** |
| Recherche académique / deep | **Exa + Claude Opus 4.7** |
| Scoring produits gagnants | **Claude Sonnet 4.6** |
| Fiches produit SEO | **Claude Haiku 4.5** |
| Copywriting ads viraux | **GPT-4o** |
| Vision (analyse images concurrents) | **Gemini 2.0 Flash** |
| Visuels produits | **fal.ai Flux Pro** |
| Vidéos UGC | **Veo 3 / Runway via fal** |
| Voix-off | **ElevenLabs v3** |
| Embeddings catalogue | **Voyage-3** |
| Classification rapide | **Haiku 4.5** |
| Raisonnement stratégique | **Opus 4.7** |
| Code | **Sonnet 4.6** |

Iris met à jour `quality_score` dans `ai_models` selon les retours (CTR, conversion, ranking SEO).

---

## 🎨 Virtual Office — Dashboard

### Stack
- **Next.js + PixiJS** (vue isométrique 2D, sprites pixel art 32px style Stardew Valley)
- **Supabase Realtime** sur `agent_status` → animations temps réel
- **Sons** : oui mais mute par défaut + toggle 🔊

### Animations clés
- Agent **idle** : assis à son bureau ou endormi
- Agent **working** : tape sur clavier, bulle "Scraping AliExpress…"
- Agent **walking** : se déplace entre bureaux pour déléguer
- Easter eggs : machine à café, stand-up Victor, Théo qui compte des billets quand commande passe
- 📨 **enveloppe vole** entre bureaux pour visualiser la délégation

### Layout (8 zones)
1. Bureau CEO (Victor) — central
2. Salle serveur (Iris/Router) — LEDs clignotantes
3. Open-space Research (Sam + Mia + Diego + Yuki)
4. Studio Content (Elena + Léa + Kai + Tom + Zoé)
5. Pôle Growth (Ravi + Jay + Anna)
6. Pôle Ops (Marc + Hugo + Sofia)
7. Bureau CFO (Théo)
8. Bureau CTO (Nora) + machine à café + imprimante

---

## 🗄️ Architecture technique

### Stack
- **Frontend :** Next.js (App Router) + PixiJS + Tailwind
- **Backend :** Routes Next.js + Supabase (Postgres + Realtime + Auth)
- **Déploiement :** Vercel
- **Paiement :** Stripe (sur le futur site e-commerce généré)
- **Orchestration agents :** n8n + workflows custom
- **LLMs :** Anthropic, OpenAI, Google, Perplexity, fal.ai, ElevenLabs, Exa, Voyage

### Schéma Supabase (tables clés)
```sql
agents (id, name, role, manager_id, avatar_sprite, desk_x, desk_y, llm_default)

agent_status (agent_id, state, current_x, current_y, current_task, progress, last_activity_at)
-- state: idle|walking|working|coffee|sleeping|meeting

tasks (id, parent_task_id, requested_by, assigned_to, status, prompt, output, cost_usd, duration_ms, created_at, completed_at)
-- status: pending|delegated|working|review|done

ai_models (name, provider, strengths[], cost_per_1k, avg_latency_ms, quality_score, endpoint)

products (id, source, source_url, score, status, created_by_agent)
orders (id, stripe_id, products[], status, supplier_email)
reports (id, task_id, title, content_md, sources[], created_at)
```

### Pages
- `/chat` — conversation user ↔ Victor uniquement
- `/office` — vue PixiJS animée
- `/reports` — archive des rapports
- `/admin` — config agents, ai_models, kill switch

### Backend layers
```
ceo-orchestrator (Victor)
  ├─ classifier (Haiku : à qui déléguer ?)
  ├─ task-spawner (crée tâche + parent_task_id)
  └─ synthesizer (Opus : compile réponse finale pour user)

manager-layer (Sam, Elena, Ravi, Marc, Théo, Nora)
  └─ découpent en sous-sous-tâches, valident retours specialists

specialist-layer (10 ICs)
  └─ exécutent concret via skills + MCPs
```

---

## 🔌 MCPs disponibles (à brancher)

**Confirmés en session :**
- GitHub (code, repos)
- Gmail (1c00fa2f-…) — drafts, labels, threads
- Hugging Face (2a6af92e-…) — modèles, datasets, papers
- Slack (6838ac64-…) — messages, canvases, channels
- Google Drive (f60aa9f0-…) — fichiers
- Google Calendar (2346343b-…) — events, scheduling

**À ajouter (mentionnés par utilisateur) :**
- Stripe, Supabase, Vercel
- Canva, Gamma, Notion, Wix, Apollo.io
- n8n-mcp (déjà configuré côté user)
- Yahoo Finance, Exa, Firecrawl
- Perplexity (clé API à fournir)

---

## ✅ Roadmap (sprints)

### Sprint 1 — Fondations
- Repo Next.js + Supabase + Vercel
- Schemas DB (`agents`, `agent_status`, `ai_models`, `tasks`, `products`, `orders`, `reports`)
- Page `/office` PixiJS avec 18 sprites idle à leur poste
- Page `/chat` minimaliste (user ↔ Victor)
- Endpoint `POST /api/agent/status`

### Sprint 2 — The Router (Iris)
- Service `router.ts` + table `ai_models` peuplée
- Clés API : Perplexity, OpenAI, Anthropic, Google, fal, ElevenLabs, Exa
- Logging décisions + feedback loop quality_score

### Sprint 3 — CEO Orchestrator (Victor)
- Classifier Haiku
- Task-spawner avec hiérarchie parent_task_id
- Synthesizer Opus pour rapport final
- Animations délégation (enveloppes volantes)

### Sprint 4 — Premier agent vivant : Mia (Trend Scout)
- Workflow n8n quotidien : Perplexity → Firecrawl → scoring → Notion
- Sprite Mia animée bossant en temps réel

### Sprints suivants
- Activation progressive des autres specialists
- Premier site e-commerce généré par Nora
- Premières campagnes ads pilotées par Ravi/Jay
- Boucles autonomes (autonomous-loops) sous supervision Victor

---

## 🚦 Décisions prises (à ne pas re-questionner)

- ✅ Style visuel : **pixel art rétro 32px** (Stardew Valley vibe)
- ✅ **18 agents** au lancement (pas 12)
- ✅ Sons : oui, mute par défaut + toggle
- ✅ User ne parle **qu'à Victor**
- ✅ Hiérarchie stricte respectée (pas de shortcut)
- ✅ Format rapport standardisé (TL;DR + détails + sources + recos + next steps)
- ✅ Iris (Router) = 9ème C-level, vit dans une salle serveur

## ❓ Décisions en attente

- Mode transparence chat : A (debug live) / B (synthèse) / **C (toggle)** — *à confirmer*
- Niche dropshipping de départ (généraliste / beauté / tech / maison / pets)
- Fournisseurs : AliExpress vs TikTok Shop vs EU rapide
- Branding : un seul magasin "marque" ou plusieurs niches ?
- Confirmation pour ouvrir le repo `dropforge-office` et démarrer Sprint 1

---

## 📌 Conventions de travail

- **Branche de dev :** `claude/marketing-mcp-skills-MPL6a` (cette branche)
- **Repo cible projet :** `dropforge-office` (à créer côté user)
- Toutes les tâches passent par la table `tasks` — traçabilité 100%
- Coûts IA loggés par tâche (`cost_usd`)
- Kill switch dans `/admin` pour stopper tout instantanément
