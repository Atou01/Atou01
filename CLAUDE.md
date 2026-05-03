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

## 🏢 Organigramme — DropForge Inc. (21 agents)

### C-Suite (6)
| Nom | Rôle | LLM principal | Skills/Tools |
|---|---|---|---|
| **Victor Hale** 🎩 | CEO — interlocuteur unique de l'utilisateur | Opus 4.7 | deep-research, market-research, Notion, Slack |
| **Nora Chen** 💻 | CTO — site, infra, sécurité | Sonnet 4.6 | nextjs-developer, frontend-design, security-review, GitHub/Vercel/Supabase MCP |
| **Lina Costa** 📢 | CMO — stratégie marketing & brand | Opus 4.7 (hebdo) | content-engine, market-research, Google Calendar |
| **Marc Devlin** ⚙️ | COO — process, ops, fournisseurs | Sonnet 4.6 | workflow-automator, n8n-workflow-patterns, Gmail, Slack |
| **Théo Roux** 💰 | CFO + **Budget Gatekeeper** — veto sur toutes dépenses, gatekeeper Phase unlock, fraud watchdog. Voir section dédiée. | Sonnet 4.6 | stripe-specialist, stripe-automation, Stripe MCP, Supabase (logs) |
| **Iris Vega** 🧠 | Chief AI Officer = "The Router" — choisit le meilleur LLM par tâche, A/B teste | Haiku 4.5 | service custom `router.ts` + table `ai_models` |

### Managers (3)
| Nom | Rôle | Reporte à | LLM |
|---|---|---|---|
| **Sam Kovacs** 🔍 | Head of Product Research | CEO | Sonnet (data-scraper-agent, deep-research, exa-search, Perplexity) |
| **Elena Park** 🎨 | Head of Content & Brand | CMO | Sonnet (content-engine, crosspost, design-shotgun, article-writing) |
| **Ravi Mehta** 📈 | Head of Growth & Ads | CMO | Sonnet (competitive-ads-extractor, twitter-algorithm-optimizer, x-api) |

### Specialists (13)
**Conseil stratégique (advisor à Lina, output → Sam)**
- **Aria Volkov** 🌍 — **Strategic Niche Analyst** — Sonnet (rapports trimestriels) + Haiku (scraping) + Perplexity Sonar Pro. Choisit LE marché avant que Mia chasse les produits. Voir section dédiée.

**Équipe Sam (Research) — SOURCING**
- **Mia Tanaka** 🕵️ — Trend Scout (TikTok/IG) — Perplexity Sonar Pro + Firecrawl + Exa
- **Diego Silva** 📦 — Supplier Hunter (AliExpress/CJ/1688) — Haiku + scraper. **Découverte uniquement.**
- **Yuki Brand** ✅ — Product Validator — Gemini 2.0 Flash (vision)

**Équipe Elena (Content)**
- **Léa Moreau** ✍️ — SEO Copywriter — Haiku 4.5 (content-research-writer, article-writing)
- **Kai Foster** 📸 — Visual Designer — fal.ai Flux **Schnell** (pas Pro, budget) + Canva
- **Tom Nakamura** 🎬 — Video Producer (UGC ads) — **Capcut + ElevenLabs free tier** + reposts éthiques (PAS Veo 3 au lancement)
- **Zoé Adler** 📱 — Social Media Manager — Haiku (crosspost, x-api, Pinterest API)

**Équipe Ravi (Growth)**
- **Jay Okafor** 🎯 — Paid Ads Specialist (Meta/TikTok) — Sonnet. **Inactif tant que budget < €500/mois ads.**
- **Anna Reis** 📊 — Data Analyst — Sonnet (SQL Supabase, GA4)

**Équipe Marc (Ops) — PROCUREMENT + LOGISTICS**
- **Hugo Bernal** 🛒 — Order Ops — Haiku (workflow-automator, Stripe + Gmail)
- **Sofia Ahmed** 💬 — Customer Support — Sonnet (Gmail + Slack, FAQ vector search)
- **Chen Wu** 🐉 — **Senior Procurement Officer** — Sonnet (négo) + Haiku (suivi). Communique avec fournisseurs en ZH/EN/FR, négocie, commande, gère litiges. Voir seuils autonomie ci-dessous.
- **Ines Larsen** 📦 — **Packaging & Unboxing Designer** — Sonnet + fal.ai Flux Schnell. Système modulaire (voir section Packaging).

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
- Confirmation pour ouvrir le repo `dropforge-office` et démarrer Sprint 1
- Statut juridique en place ? (auto-entrepreneur / SASU / autre)

## 🔒 Décisions verrouillées (rev. budget €300/mois)

### Budget mensuel : **€300 → €600 conditionnel**

Logique : **stop-loss automatique**, on ne débloque l'extra que si signaux positifs.

#### Phase 1 — Mois 1 : €300 (cap dur, setup + organic uniquement)
```
IA APIs (cap Iris $50)            €45
Hosting + tools                   €15
Domaine + email pro               €10
Stock packaging initial           €80
Échantillons fournisseurs         €50
Stickers + insert prints          €40
n8n self-hosted (Railway)         €5
Buffer                            €55
─────────────────────────────────────
TOTAL Mois 1                      €300
```

#### Critères déblocage Phase 2 (Anna check chaque dimanche)

Au moins 1 doit être atteint en fin de mois 1 :
- ≥ 3 ventes mois 1
- ≥ 1 vidéo TikTok > 50k vues
- ≥ 500 visiteurs uniques/semaine site
- ≥ 100 emails capturés via popup pre-sale

**Aucun atteint → reste €300 + pivot niche/produit obligatoire.**

#### Phase 2 — Mois 2+ : €600 (si critères validés)
```
[Tout Phase 1 reconduit]                €300
+ TikTok Ads test (6 créas × €10/3j)    €180
+ Meta Ads retargeting visiteurs site   €60
+ Pinterest Ads boost                   €30
+ Micro-influenceurs (gift + 10% comm)  €30
─────────────────────────────────────────────
TOTAL Mois 2+                           €600
```

#### Phase 3 — Mois 3+ : Scale si ROAS ≥ 2
- Réinvestir **profits uniquement** en ads
- Cap sortant max €600/mois tant que CA < €3k/mois
- Iris cap IA monte à $80/mois (Sonnet plus utilisé par Jay)
- Jay (Ads Manager) **passe actif** uniquement à partir de Phase 3

### Stratégie : ORGANIC-FIRST (pas de paid ads au lancement)

- Trafic gratuit pendant 3-6 mois : TikTok organique + Pinterest + SEO blog
- Réinvestir profits en ads uniquement après premières ventes
- **Jay (Ads Manager) reste inactif** tant que budget ads < €500/mois disponible

### Marché lancement
- **Pays :** FR + BE + CH (FR) + Québec (zone francophone, 1 langue)
- **Langue :** FR uniquement au lancement
- **EN/ES :** phase 2 après €5k/mois CA prouvé
- **Niche default MVP :** "Maison & Lifestyle" (déco, gadgets utiles, bien-être) — overrideable par user

### Caps IA Iris (kill switches)
- **Daily cap :** $2/jour (alerte $1.50)
- **Monthly cap :** $50 ($45 ≈ €45)
- **Auto-freeze** au-delà + ping Victor

### Ratio modèles cible
| Modèle | % appels | Usage |
|---|---|---|
| Haiku 4.5 | 70% | gros volume, routine |
| Sonnet 4.6 | 25% | négo, créa, analyse |
| Opus 4.7 | 5% MAX | synthèses CEO hebdo uniquement |
| Perplexity Sonar Pro | 5 appels/jour max | Mia trend research |
| fal.ai Flux **Schnell** (pas Pro) | visuels | -75% coût |
| Gemini 2.0 Flash | vision | cheap |
| ElevenLabs | free tier 10k chars/mois uniquement |

### Modèles INTERDITS au lancement
- ❌ Veo 3 (trop cher)
- ❌ Runway Gen-3
- ❌ ElevenLabs payant
- ❌ Opus pour autre chose que synthèses Victor hebdo
- ❌ Klaviyo (Brevo free à la place)

### Mode chat user ↔ Victor
- **Mode C (toggle)** par défaut pour l'instant — peut être affiné plus tard

---

## 🌍 Aria Volkov — Strategic Niche Analyst

**Reporte à Lina (CMO)** comme advisor. Output alimente Sam (Research) pour exécution.

### Mission
Choisit LE marché (la niche) où DropForge joue. Mia chasse des poissons dans le lac, **Aria choisit le lac**. Réévalue chaque trimestre ou avant si Théo force pivot.

### Méthodologie : score sur 6 axes (0-10)
```
1. TAM / Demande         (Google Trends 12 mois + recherches /mois)
2. Saturation            (nb shops/concurrents — moins = mieux)
3. Marge moyenne         (prix vente moyen ÷ coût AliExpress, cible ≥ 4×)
4. Viralité TikTok       (vues moyennes top vidéos hashtag)
5. Saisonnalité          (volatilité Trends — cible stable, pas Q4-only)
6. Compatibilité budget €600 (CAC réaliste niche)

Pondération : Compat budget ×2, Saturation ×1.5, Marge ×1.5, autres ×1
```

### Filtres éliminatoires (kill auto)
- ❌ Cosmétique direct sur peau (responsabilité conformité UE)
- ❌ Compléments alimentaires (ANSES)
- ❌ Électronique CE-marqué cher à valider
- ❌ Marques déposées probables (Disney, Nike, etc.)
- ❌ Produits dangereux (laser, projectiles, batteries lithium aviation)
- ❌ Saisonnalité > 70%
- ❌ TAM FR < 10k recherches/mois

### Sources scannées
Google Trends FR/EU, TikTok Creative Center, Pinterest Trends, AliExpress Top Selling, Amazon BS FR, Reddit niches, Etsy trending, Sell The Trend (free tier).

### Output : "Niche Selection Report" (trimestriel)
Top 3 niches scorées + tableau 6 axes + niches éliminées + 5 produits déjà spottés dans niche #1 + plan lancement 30j. Victor partage à user → user choisit dans le top 3.

### Première mission immédiate
**Livrer le rapport de niche de lancement** en 24-48h après Sprint 1 (remplace le défaut "Maison & Lifestyle" arbitraire). User choisit dans son top 3.

### Coût
~$3-5 par rapport trimestriel (Sonnet pour synthèse, Haiku pour scraping volume, Perplexity 5-10 appels).

### Animation bureau
Bureau avec mur de données (graphes Trends animés, mappemonde hotspots). Aria déplace des **post-its** sur un tableau (niches candidates) — barre éliminées en X rouge, encadre top 3 en vert. Marche vers Lina puis Victor avec rapport.

---

## 💰 Théo Roux — Budget Gatekeeper (rôle critique)

Théo n'est pas qu'un CFO classique : il a **droit de veto sur toute dépense** et est le **seul juge** des conditions de déblocage Phase 2 / Phase 3. Override possible **uniquement** par Victor (CEO) et seulement avec justification logguée.

### Pouvoirs

```
✅ MONITORING TEMPS RÉEL
  Toutes dépenses : IA (logs Iris), commandes fournisseurs (Chen Wu),
  packaging (Ines), ads (Jay), abonnements SaaS

✅ VETO POWER
  Bloque toute dépense > seuil
  Force pause campagne ads sous-performante
  Freeze IA budget Iris si burn anormal
  
✅ UNLOCK GATEKEEPER
  Seul juge des 4 critères Phase 2
  Seul juge ROAS ≥ 2 pour Phase 3
  Décide kill produit qui brûle du cash

✅ FRAUD WATCHDOG
  Surveille chargebacks Stripe (alerte si > 1% volume)
  Détecte commandes suspectes
  Coordonne Stripe Radar
```

### Règles de décision (codifiées, appliquées sans état d'âme)

```yaml
iA_spend:
  daily_cap: $2.00
  monthly_cap: $50 (Phase 1) | $80 (Phase 2-3)
  alert_threshold: 75% du cap
  action_if_exceeded: freeze Iris + ping Victor

supplier_orders:
  per-order: voir seuils Chen Wu
  cumulative_weekly_cap: €500 Phase 1 | €1000 Phase 2+

ads_spend:
  Phase_1: €0/jour HARD (toute dépense ads = veto)
  Phase_2: €15/jour MAX par plateforme, €40/jour total
  Phase_3: variable selon ROAS, cap €30/jour si ROAS < 1.5
  kill_rule: toute campagne avec ROAS < 1 après 72h

saas_subscriptions:
  > €10/mois : approval Théo requis
  > €30/mois : approval Victor requis
  audit trimestriel : tool inutilisé 30j → annulé auto

packaging:
  initial_stock: max €100 one-shot Phase 1
  reorder_trigger: stock < 100 unités, max €150
```

### Outputs réguliers

**Daily Budget Report** (23h chaque soir, Slack #finance) :
```
IA spend / cap | Supplier orders | Ads spend
Month-to-date / total budget | Days remaining
On track ? ✅/⚠️/❌ | Anomalies
```

**Weekly Phase-Check Report** (dimanche 18h, → Victor) :
```
4 critères Phase 2 unlock avec valeurs actuelles
Statut : ELIGIBLE / NOT YET / NEAR
Recommandation Théo (action concrète)
```

**Anomaly Alerts** (temps réel Slack) : burn IA anormal, fournisseur suspect, chargebacks, etc.

### Interactions avec les autres agents

```
Iris (Router)  → Théo voit chaque appel IA, valide Opus en 200ms
Chen Wu        → auto-approve si seuils, escalade sinon
Jay (Ads)      → Phase 1 : tout bloqué. Phase 2+ : audit ROAS 24h, kill si <1
Ines           → valide stock orders selon règles
Anna (Data)    → Anna fournit dashboards, Théo décide
Victor (CEO)   → reçoit rapports hebdo, peut override avec justification
```

### Animation bureau

Théo dans bureau vitré avec **3 écrans de dashboards** : cash flow, burn rate, critères Phase 2.
- Dépense légitime → 👍
- Dépense suspecte → 🚨 se lève, marche vers agent concerné
- Veto → "🛑 STOP" l'agent ciblé s'arrête net
- Ventes qui rentrent → 💸 fait défiler des billets
- Dimanche soir → rédige rapport, enveloppe vole vers Victor

---

## 🐉 Chen Wu — Seuils d'autonomie procurement

```
PAR COMMANDE :
  < €100         → autonome (couvre 99% dropships solo)
  €100-500       → autonome + notif Slack à Marc
  €500-3000      → validation Marc requise
  > €3000        → validation Victor (CEO) requise

ÉCHANTILLONS :
  < €50          → toujours autonome

PREMIER ACHAT chez nouveau fournisseur :
  → toujours validation Marc, peu importe montant
  (anti-arnaque sur fournisseur jamais testé)

CAP JOURNALIER GLOBAL :
  €2000/jour total → freeze automatique + ping Victor
  (kill switch anti-runaway / prompt-injection)
```

### Workflow Chen Wu
1. Reçoit produit validé de Yuki
2. Compare 5+ fournisseurs (Alibaba RFQ + scraping)
3. Négocie MOQ / prix / lead time / packaging custom
4. Commande échantillons (< €50, autonome)
5. Valide qualité visuellement avec Yuki
6. Place commandes clients via API/email selon volume
7. Tracking 17track → notifs Slack
8. Escalade litiges via templates standardisés
9. Update DB `suppliers` avec scoring qualité

### Distinction Diego vs Chen Wu
| | **Diego (Sam's team)** | **Chen Wu (Marc's team)** |
|---|---|---|
| Mission | DÉCOUVERTE | RELATION + COMMANDES |
| Output | Liste candidats scorés | Commandes passées + colis livrés |
| Quand | Avant validation produit | Après validation produit |

---

## 📦 Ines Larsen — Système packaging modulaire (final)

**Choix verrouillé : modulaire neutre + sticker custom.** ~5× moins cher qu'un packaging full custom, scale infini sur N magasins.

### Architecture

```
3 BOÎTES NEUTRES kraft brun (stock permanent)
  • S : 15×10×5cm   ~€0.18/unité bulk 1000
  • M : 25×18×8cm   ~€0.32/unité
  • L : 35×25×12cm  ~€0.55/unité

1 POCHETTE poly mailer recyclé (produits souples)
  • ~€0.08/unité bulk

STICKERS CUSTOM (LA MARQUE VIT ICI)
  • Logo magasin imprimé bulk : €0.03-0.05/unité
  • Changement marque/niche = nouveau sticker uniquement

INSERT UNIVERSEL A6 (recto/verso kraft)
  • Template : "Merci 🙏 + QR review + code -10% next order"
  • QR dynamique selon produit/magasin
  • ~€0.04/unité

EXTRAS conditionnels (déclencheurs auto)
  • Thank-you card manuscrite : commande > €80
  • Échantillon offert : panier > €120
  • Sticker "Tag us @brand on TikTok for free gift" : commande > €100 (boucle UGC gratuite)
```

### Coût packaging moyen
- **Modulaire : ~€0.40/commande**
- vs Custom branded box : €1.80-2.50/commande
- **Économie : ~€1.50 × volume**

### Workflow Ines
1. Nouveau produit validé → Ines décide format (S/M/L/pochette)
2. Génère 5 variantes sticker via fal.ai Flux Schnell + Canva
3. Choisit la meilleure avec Elena (CMO)
4. Délègue commande sticker/insert à Chen Wu
5. Update template "rules" déclencheurs (thank-you card, échantillon)
6. A/B test impact sur reviews + UGC TikTok avec Anna

---

## 📊 Marges minimum imposées (règle Yuki)

```
Phase 1 (organic uniquement) : marge ≥ 40%
Phase 2+ (avec paid ads)     : marge ≥ 55%
  (les ads bouffent ~15-25% en CAC, marge doit absorber)

Calcul marge = (Prix vente - coût produit - shipping - packaging
                - Stripe fees - 10% ads future) / Prix vente

Si marge < seuil → Yuki refuse le produit (vetoé en sortie validation)
```

**Justification :** chaque commande doit financer la suivante. Marge sous le seuil = cale en 2 mois.

---

## 🌱 Stratégie Organic-First (3-6 mois lancement)

### 3 piliers gratuits
1. **TikTok organique** — Tom poste 3 vidéos UGC/jour
   - Réutilisation éthique (repost créateurs avec watermark + tag)
   - Affiliation créateurs : code promo 10% commission (€0 cash sortant)
2. **Pinterest** — Zoé épingle 20 produits/jour (sous-exploité, marche très bien maison/déco)
3. **SEO blog** — Léa publie 3-5 articles/semaine longue traîne

### Targets honnêtes
- **Mois 1-2** : site lancé, 0-5 ventes (test)
- **Mois 3-4** : 20-100 ventes/mois organique
- **Mois 4-6** : €1k-3k CA/mois si la niche prend
- **Plan B mois 4** : si pas de traction → injection ads €500-1000 ponctuelle OU pivot niche

---

## 🎬 Workflow type "produit gagnant → livraison" (11 étapes)

```
1. Mia trouve produit tendance TikTok (Perplexity + scraping)
2. Diego source 5 fournisseurs candidats (AliExpress + Alibaba + CJ + 1688)
3. Yuki valide : pas de marque déposée, ads concurrents OK, marge ≥ 40%
4. Chen Wu négocie : MOQ, prix, échantillons → choisit LE fournisseur
5. Ines conçoit packaging modulaire + insert review
6. Chen Wu commande échantillon + valide qualité
7. Kai shoot photos, Tom monte vidéo TikTok/UGC
8. Site mis à jour par Nora, fiches produit par Léa, social posts par Zoé
9. Première commande client → Hugo passe la commande à Chen Wu
10. Chen Wu commande au fournisseur + tracking 17track → Slack
11. Sofia gère SAV si problème
```

---

## 📌 Conventions de travail

- **Branche de dev :** `claude/marketing-mcp-skills-MPL6a` (cette branche)
- **Repo cible projet :** `dropforge-office` (à créer côté user)
- Toutes les tâches passent par la table `tasks` — traçabilité 100%
- Coûts IA loggés par tâche (`cost_usd`)
- Kill switch dans `/admin` pour stopper tout instantanément
