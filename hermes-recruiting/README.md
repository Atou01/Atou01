# Hermes × Recrutement Hunteed — Kit Phases 0 & 1

Industrialiser le travail répétitif du headhunting via un orchestrateur **Hermes Agent**
(NousResearch) qui pilote des subagents spécialisés, en gardant l'humain (Atou) sur les
décisions irremplaçables.

> **Périmètre construit ici : Phases 0 & 1.**
> - **Phase 0** — entraînement d'Hermes via tunnel SSH + Chrome CDP, jusqu'à ce qu'il
>   maîtrise le workflow Hunteed. → [`docs/phase0-training.md`](docs/phase0-training.md),
>   [`docs/phase0-tunnel.md`](docs/phase0-tunnel.md)
> - **Phase 1** — ① Chasseur + ② Sourceur + cron matinal + **CP1**.
>
> Les Phases 2/3 (③ Rédacteur/CP2, ④ Évaluateur/CP3, ⑤ Diffuseur, ⑥ Post-mortem,
> connecteurs Gmail/Calendar/Notion/Supabase, **dashboard**) sont **décrites** dans
> [`docs/roadmap.md`](docs/roadmap.md) mais **pas** construites ici.

## 📍 État actuel (juin 2026)

| Étape | Statut |
|-------|--------|
| VPS **Infomaniak VPS Lite** (Genève, Ubuntu 24.04, user `ubuntu`) | ✅ provisionné + durci (ufw, fail2ban, SSH clé-only) |
| **Hermes v0.15.1** installé sur le VPS | ✅ (le §1 du quickstart est donc déjà fait) |
| Clé **OpenRouter** (DeepSeek défaut + Claude filet) | 🔄 en cours |
| Gateway **Telegram** | ⬜ à venir |
| **Tunnel** SSH+CDP + **Phase 0** (entraînement) | ⬜ à venir |
| **Phase 1** (`DRY_RUN=0`) | ⛔ pas avant la fin de la Phase 0 |

> Kit validé contre **Hermes v0.15.1**. Après un `hermes update`, vérifier que les commandes
> (`hermes cron --help`, `hermes gateway --help`) correspondent toujours.

## Vue d'ensemble & ordre de construction

1. ~~Provisionner un VPS~~ ✅ **fait** (Infomaniak Genève) + ~~installer Hermes~~ ✅ → reste Telegram.
2. **Monter le tunnel SSH + CDP** (Mac → VPS) et valider qu'Hermes lit le DOM en live.
3. **Phase 0** : sessions d'entraînement jusqu'au critère de sortie. C'est là qu'on choisit
   **ensemble le corps de métier prioritaire**.
4. **Phase 1** : ① → CP1 → ②, puis ③/④.
5. **Phases 2/3** : dashboard (Claude Design puis Claude Code).

Détail complet (infra, subagents, HelloWork exclu, etc.) : [`docs/roadmap.md`](docs/roadmap.md).

## Ce que fait la Phase 1 — une mission à la fois

Chaque matin (jours ouvrés), Hermes :

1. évalue les missions (skill `mission-hunter`, 16 critères GO/NO-GO) et **recommande LA
   mission du jour**, argumentée, avec 2-4 alternatives en contexte court ;
2. crée la tâche Kanban **CP1 déjà bloquée**, puis **livre le rapport + l'ID sur Telegram** ;
3. **CP1 = dialogue** : Atou questionne/conteste, Hermes argumente, **Atou tranche** ;
4. après l'accord d'Atou, lance le **Sourceur** (skills `sourcing-strategy`,
   `linkedin-sourcing`) sur **la seule mission validée** → plan multi-canal + requêtes
   booléennes + shortlist scorée, livrés sur Telegram.

> **Une mission à la fois** pour commencer ; 8–10 de front = cible long terme, quand la
> confiance sera établie.

Le détail du flux : [`docs/phase1-flow.md`](docs/phase1-flow.md). Les checkpoints :
[`docs/checkpoints.md`](docs/checkpoints.md). Les garde-fous : [`docs/guardrails.md`](docs/guardrails.md).

## Où héberger Hermes

| Hôte | Verdict | Pourquoi |
|------|---------|----------|
| **VPS Infomaniak Lite** (Genève) | ✅ **EN PLACE** | Ubuntu 24.04, user `ubuntu`, 2 vCPU / 4 Go. Cron + gateway Telegram tournent 24/7. Durci : ufw, fail2ban, SSH clé-only. |
| Mac (MacBook/Mac mini) | 🔌 Client tunnel | Le Mac n'héberge pas Hermes : il sert de **client Phase 0** (Chrome + tunnel SSH pour montrer l'écran), puis peut être éteint. |
| Supabase | ❌ Pas un hôte | Supabase = **base de données** (CVthèque, option Postgres pour `kanban.db` en Phase 2). **N'exécute pas Hermes.** |

Le kit reste **agnostique à l'hôte** (réutilisable ailleurs) ; l'IP réelle du VPS vit dans le
`.env` local, **jamais dans ce repo public**.

## Pré-requis

- Hermes Agent installé (voir étape 1).
- Tes skills déjà installées côté Hermes (le kit ne les réécrit pas) :
  `mission-hunter`, `sourcing-strategy`, `linkedin-sourcing`.
  Vérifie avec `hermes skills list`.
- Un bot Telegram (token) + le chat_id de destination.
- Un provider LLM configuré (`hermes setup model`).

## Phase 0 — entraînement (tunnel SSH + CDP)

Avant les subagents, Hermes apprend le workflow Hunteed en **observant l'écran d'Atou en
live**. Le Chrome du Mac expose le CDP en local ; un **reverse tunnel SSH** le rend visible
au VPS (chiffré de bout en bout). Détail + sécurité : [`docs/phase0-tunnel.md`](docs/phase0-tunnel.md).

```bash
# Pré-requis : VPS_HOST renseigné dans .env (ex: VPS_HOST=ubuntu@IP_DU_VPS)

# Sur le MAC — lance Chrome (CDP, profil isolé) + le reverse tunnel
DRY_RUN=0 ./scripts/mac-tunnel.sh

# Sur le VPS — vérifie qu'Hermes voit bien le DOM du Mac
./scripts/vps-cdp-check.sh
#   → si 403 "Host header", lance le proxy puis vise localhost:9223 :
#   python3 scripts/vps-cdp-proxy.py --listen 127.0.0.1:9223 --upstream 127.0.0.1:9222
```

Ensuite : sessions live jusqu'au **critère de sortie** ([`docs/phase0-training.md`](docs/phase0-training.md))
— « source-moi cette mission » et Hermes exécute sans poser 50 questions. **Alors seulement**
on passe à la Phase 1.

## Phase 1 — mise en route

```bash
# 1. Installer Hermes — ✅ DÉJÀ FAIT sur le VPS (v0.15.1). Pour vérifier :
hermes --version
# (install from scratch si besoin :
#  curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash)
hermes setup            # provider LLM ; Telegram via `hermes gateway install` (voir plus bas)

# 2. Récupérer ce kit puis configurer les secrets
cp .env.example .env    # puis éditer .env (jamais commité)

# 3. Préflight (lecture seule : skills présentes, Telegram joignable, pas de secret commité)
./scripts/preflight-dry-run.sh

# 4. Revoir les commandes SANS rien exécuter (dry-run = défaut)
./scripts/setup-phase1.sh

# 5. Appliquer réellement — ⛔ SEULEMENT après la Phase 0 (entraînement)
DRY_RUN=0 ./scripts/setup-phase1.sh

# 6. Test end-to-end : déclencher le job une fois
hermes cron run mission-report
#   → recommandation de mission reçue sur Telegram + tâche CP1 "blocked" créée.
#   → dialogue, puis déblocage (Telegram ou `hermes kanban unblock <id>`) → le Sourceur démarre.
```

## VPS : garder la gateway always-on

La gateway Telegram doit rester en vie pour recevoir tes réponses (déblocage CP1). Au choix :

**Installeur natif (recommandé, v0.15.1)** — Hermes installe lui-même son service :

```bash
hermes gateway install     # crée et active le service systemd de la gateway
```

**systemd manuel (fallback)** — si tu préfères le gérer toi-même, crée
`/etc/systemd/system/hermes-gateway.service` :

```ini
[Unit]
Description=Hermes Gateway
After=network-online.target

[Service]
Type=simple
User=%i
ExecStart=%h/.local/bin/hermes --gateway
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

```bash
systemctl --user enable --now hermes-gateway   # ou en service système selon ton install
```

> ⚠️ La forme exacte (`hermes --gateway` vs `hermes gateway`) peut varier selon la version —
> vérifie avec `hermes gateway --help` sur le VPS.

**tmux (rapide)** : `tmux new -d -s hermes 'hermes --gateway'`

Le cron Hermes est interne au process — tant que la gateway tourne, le job `mission-report`
se déclenche selon son `--schedule`.

## Structure du kit

```
hermes-recruiting/
├── README.md                 ← tu es ici
├── SOUL.director.md          ← identité du profil "director" (orchestre, ne décide jamais)
├── profiles/
│   ├── chasseur/SOUL.md      ← ① Chasseur de missions
│   └── sourceur/SOUL.md      ← ② Sourceur
├── cron/
│   ├── morning-mission-report.prompt   ← prompt du job (lu par setup-phase1.sh)
│   └── morning-mission-report.md       ← spec du job + mécanique CP1
├── scripts/
│   ├── mac-tunnel.sh         ← Phase 0 (Mac) : Chrome CDP + reverse tunnel SSH
│   ├── vps-cdp-check.sh      ← Phase 0 (VPS) : vérifie le DOM visible via tunnel
│   ├── vps-cdp-proxy.py      ← Phase 0 (VPS) : proxy réécriture Host (optionnel)
│   ├── preflight-dry-run.sh  ← checks lecture seule
│   └── setup-phase1.sh       ← wiring idempotent, DRY_RUN=1 par défaut
├── config.example.yaml                 ← config Hermes DURCIE (sécurité+orchestrateur+curator)
├── docs/
│   ├── roadmap.md                      ← 2 axes : déploiement (0→3) + maturité (M0→M4)
│   ├── compliance.md                   ← cadre légal (AI Act haut risque, RGPD/CNIL) 🔒
│   ├── architecture-self-improving.md  ← mémoire+rubrics+RAG+evals, FT en dernier
│   ├── evolution.md                    ← axe évolutif + extensions futures (vérité terrain)
│   ├── phase0-training.md              ← boucle d'entraînement + critère de sortie
│   ├── phase0-tunnel.md                ← tunnel SSH + CDP + piège du header Host
│   ├── phase1-flow.md
│   ├── checkpoints.md
│   └── guardrails.md
├── .env.example
└── .gitignore
```

## Garde-fous (non négociables)

- **Conformité = cadre directeur** : recrutement **haut risque** (AI Act), scoring = **profilage**
  → la validation humaine ne déclasse pas le risque. Cadre complet : [`docs/compliance.md`](docs/compliance.md).
- **Décision humaine substantielle** : CP1 / CP2 (Phase 2) / CP3 (Phase 2) — l'humain lit et
  décide (pas de tampon). Le LLM ne décide jamais d'embaucher. **Jamais 0 %** de revue.
- **Interdits** : analyse d'émotions, catégorisation biométrique, scoring sur attribut protégé.
- **ToS LinkedIn** : pas de scraping massif ni d'outreach de masse (caps dans `guardrails.md`).
- **RGPD** : info du tri algorithmique, rétention **2 ans**, droit d'effacement ; logs **≥ 6 mois**.
- **Secrets** : dans `.env` (gitignoré), jamais dans le repo. **Dry-run** par défaut.

Détail : [`docs/guardrails.md`](docs/guardrails.md) · [`docs/compliance.md`](docs/compliance.md).

---

Sources : [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) ·
[doc officielle](https://hermes-agent.nousresearch.com/docs/) ·
[Kanban multi-agents](https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban)
