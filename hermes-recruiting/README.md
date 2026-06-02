# Hermes × Recrutement Hunteed — Kit Phase 1

Industrialiser le travail répétitif du headhunting via un orchestrateur **Hermes Agent**
(NousResearch) qui pilote des subagents spécialisés, en gardant l'humain (Atou) sur les
décisions irremplaçables.

> **Phase 1 uniquement** : ① Chasseur de missions + ② Sourceur + cron matinal + **CP1**
> (choix des missions). Les phases 2/3 (③ Rédacteur/CP2, ④ Évaluateur/CP3, ⑤ Diffuseur,
> ⑥ Post-mortem, connecteurs Gmail/Calendar/Notion/Supabase) ne sont **pas** construites ici.

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

## Mise en route

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
│   ├── preflight-dry-run.sh  ← checks lecture seule
│   └── setup-phase1.sh       ← wiring idempotent, DRY_RUN=1 par défaut
├── docs/
│   ├── phase1-flow.md
│   ├── checkpoints.md
│   └── guardrails.md
├── .env.example
└── .gitignore
```

## Garde-fous (non négociables)

- **Décision humaine** : choix mission (CP1), envoi d'approche (CP2, Phase 2), validation CR
  (CP3, Phase 2) passent toujours par un checkpoint. Le LLM ne décide jamais d'embaucher.
- **ToS LinkedIn** : pas de scraping massif, pas d'outreach automatisé de masse.
- **RGPD** : consentement + rétention maîtrisés.
- **Secrets** : dans `.env` (gitignoré), jamais dans le repo.
- **Dry-run** par défaut sur tout script qui agit.

Détail : [`docs/guardrails.md`](docs/guardrails.md).

---

Sources : [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) ·
[doc officielle](https://hermes-agent.nousresearch.com/docs/) ·
[Kanban multi-agents](https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban)
