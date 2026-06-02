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

## Vue d'ensemble & ordre de construction

1. **Provisionner un VPS** (France/Suisse, ≈ 2 vCPU / 2–4 Go) + installer Hermes + Telegram.
2. **Monter le tunnel SSH + CDP** (Mac → VPS) et valider qu'Hermes lit le DOM en live.
3. **Phase 0** : sessions d'entraînement jusqu'au critère de sortie.
4. **Phase 1** : ① → CP1 → ②, puis ③/④.
5. **Phases 2/3** : dashboard (Claude Design puis Claude Code).

Détail complet (infra, subagents, HelloWork exclu, etc.) : [`docs/roadmap.md`](docs/roadmap.md).

## Ce que fait la Phase 1

Chaque matin (jours ouvrés), Hermes :

1. lance le **Chasseur** (skill `mission-hunter`) → un **TOP 5 GO/NO-GO** scoré (16 critères) ;
2. **livre le rapport sur Telegram** ;
3. crée une tâche Kanban **bloquée** = **CP1** : Atou choisit les missions ;
4. au déblocage par Atou, lance le **Sourceur** (skills `sourcing-strategy`,
   `linkedin-sourcing`) sur les missions retenues → plan multi-canal + requêtes booléennes
   + shortlist scorée, livrés sur Telegram.

Le détail du flux : [`docs/phase1-flow.md`](docs/phase1-flow.md). Les checkpoints :
[`docs/checkpoints.md`](docs/checkpoints.md). Les garde-fous : [`docs/guardrails.md`](docs/guardrails.md).

## Où héberger Hermes

| Hôte | Verdict | Pourquoi |
|------|---------|----------|
| **VPS Linux** | ✅ **Recommandé** | Le cron matinal et la gateway Telegram doivent tourner 24/7. Un petit VPS reste always-on sans garder le Mac allumé/réveillé. |
| Mac mini M4 | ✅ Possible | Même kit. Nécessite que la machine reste éveillée (caffeinate / Énergie). |
| Supabase | ❌ Pas un hôte | Supabase = **base de données** (CVthèque, option Postgres pour `kanban.db` en Phase 2). **N'exécute pas Hermes.** |

Le kit est **agnostique à l'hôte**. Les commandes ci-dessous sont identiques sur VPS et Mac.

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
# Pré-requis : VPS_HOST renseigné dans .env (ex: VPS_HOST=hermes@IP)

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
# 1. Installer Hermes (sur le VPS ou le Mac)
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
hermes setup            # provider LLM + gateway Telegram

# 2. Récupérer ce kit puis configurer les secrets
cp .env.example .env    # puis éditer .env (jamais commité)

# 3. Préflight (lecture seule : skills présentes, Telegram joignable, pas de secret commité)
./scripts/preflight-dry-run.sh

# 4. Revoir les commandes SANS rien exécuter (dry-run = défaut)
./scripts/setup-phase1.sh

# 5. Appliquer réellement
DRY_RUN=0 ./scripts/setup-phase1.sh

# 6. Test end-to-end : déclencher le job une fois
hermes cron run mission-report
#   → rapport TOP 5 reçu sur Telegram + tâche CP1 "blocked" créée.
#   → débloque-la (Telegram ou `hermes kanban unblock <id>`) → le Sourceur démarre.
```

## VPS : garder la gateway always-on

La gateway Telegram doit rester en vie pour recevoir tes réponses (déblocage CP1). Au choix :

**systemd (recommandé sur VPS)** — crée `/etc/systemd/system/hermes-gateway.service` :

```ini
[Unit]
Description=Hermes Gateway
After=network-online.target

[Service]
Type=simple
User=%i
ExecStart=%h/.local/bin/hermes gateway
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

```bash
systemctl --user enable --now hermes-gateway   # ou en service système selon ton install
```

**tmux (rapide)** : `tmux new -d -s hermes 'hermes gateway'`

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
├── docs/
│   ├── roadmap.md                      ← 2 axes : déploiement (0→3) + maturité (M0→M4)
│   ├── compliance.md                   ← cadre légal (AI Act haut risque, RGPD/CNIL) 🔒
│   ├── architecture-self-improving.md  ← mémoire+rubrics+RAG+evals, FT en dernier
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
