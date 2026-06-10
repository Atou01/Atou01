# Axe évolutif — faire qu'Hermes s'améliore (et préparer le futur)

But : qu'Hermes devienne un **meilleur chasseur au fil du temps**, dans le bon ordre, et qu'on
**câble dès maintenant les points d'accroche** pour les capacités futures. Toutes les commandes
/ clés / chemins ci-dessous sont **vérifiés sur le code NousResearch/hermes-agent**.

> Ordre non négociable : **mémoire/skills → apprentissage → fine-tuning RL** (en dernier).
> La conformité ([`compliance.md`](compliance.md), M0) reste un **préalable bloquant**.

---

## 1. Maintenant — capitaliser le savoir (gratuit, natif)

- **Épingler les skills cœur** (le Curator ne les archivera jamais) — fait par
  `scripts/setup-phase1.sh` :
  ```bash
  hermes curator pin mission-hunter
  hermes curator pin sourcing-strategy
  hermes curator pin linkedin-sourcing
  hermes curator status         # vérifier
  ```
- **Mémoire native** (`~/.hermes/memories/`) : `MEMORY.md` (notes agent, ~2200 car.) +
  `USER.md` (profil d'Atou, ~1375 car.). Snapshot figé en début de session (stable pour le
  cache). Outil : `memory(action="add"|"replace"|"remove", target="memory"|"user", …)`.
  → y mettre : SLA, vocabulaire Hunteed, préférences de tri d'Atou, formats de CR.
- **Curator** (`~/.hermes/config.yaml`) : voir `config.example.yaml`. Garanties : **jamais de
  suppression** (archive dans `~/.hermes/skills/.archive/`, restaurable via
  `hermes curator restore <nom>`), **jamais les skills pinned ni bundled**.

## 2. Mémoire propriétaire — l'« œil » d'Atou

⚠️ Hermes Core n'a **pas** de FTS5/RAG natif cross-session. Deux leviers :

- **RAG propriétaire (à construire, Supabase)** — *épisodique* : indexer anciens CR, messages
  d'approche **labellisés converti/non**, candidats placés/recalés, missions gagnées/perdues.
  Servir en **few-shot dynamique** (3-5 cas proches) au Chasseur/Sourceur/Rédacteur.
- **Honcho** (plugin externe optionnel) — *sémantique/utilisateur* : modélise le goût de
  jugement d'Atou. Config `~/.hermes/honcho.json` :
  ```json
  { "api_key": "${HONCHO_API_KEY}", "recall_mode": "hybrid",
    "dialecticCadence": 2, "dialecticReasoningLevel": "medium", "dialecticDepth": 2 }
  ```
  Outils : `honcho_search`, `honcho_reasoning`, `honcho_conclude`. **RGPD** : préférer un Honcho
  **self-hosted** pour garder les données candidat sous contrôle.

## 3. Apprentissage — instrumenter les trajectoires

- Collecte : `save_trajectories=True` (init agent) ou `batch_runner.py` → `trajectory_samples.jsonl`
  (+ `failed_trajectories.jsonl`), format **ShareGPT**. Les tours **sans raisonnement** sont
  écartés ; `<REASONING_SCRATCHPAD>` est converti en `<think>`.
- **Reward = post-traitement** (pas natif). Mapping recommandé depuis le signal réel :

  | Issue réelle | reward |
  |--------------|--------|
  | placement | **+1.0** |
  | entretien obtenu | +0.5 |
  | réponse à l'approche | +0.2 |
  | pas de réponse | 0.0 |
  | refus / opt-out | −0.5 |

  Annoter `trajectories.jsonl` avec `reward` + `outcome`, puis push HuggingFace dataset.
- **Learner** (subagent ⑥) : à chaque clôture de mission, réflexion type Reflexion → propose un
  **patch de skill/rubric** via `skill_manage` → **validé au checkpoint** (jamais auto-appliqué).

## 4. Fine-tuning RL — seulement au bon seuil

**Ne PAS lancer avant** (vérité terrain) :

| Critère | Seuil |
|---------|-------|
| Trajectoires scorées | **≥ 500-1000** |
| Couverture raisonnement | **> 80 %** (`turns_with_reasoning / total`) |
| Taux de succès outils | **> 90 %** (`statistics.json`) |
| Variance de reward | **σ > 0,2** (sinon aucun signal) |

Puis, **en aval** (hors Hermes Core, TRL/Atropos) : GRPO + LoRA `lora_r=16`, `lora_alpha=32`,
`lr=5e-6`. Garder le modèle généraliste pour le raisonnement ; ne fine-tuner que le **scoring**
ou le **style de CR/approche**. Risques : *catastrophic forgetting*, *reward hacking*.

---

## 5. Penser au futur — points d'accroche à câbler dès maintenant

L'idée : concevoir aujourd'hui pour **intégrer directement** demain, sans refonte.

- **Connecteurs MCP** (Phase 2) : Gmail/Calendar (entretiens/relances), Notion/monday (pipeline),
  Supabase (CVthèque/RAG). `hermes mcp add <nom> --command … --args …` ou `--url …`, puis
  `hermes mcp test <nom>`. → garder `.env` prêt (clés commentées déjà présentes).
- **Sandbox d'exécution** : passer `terminal.backend: docker` (image dédiée, user non-root) pour
  l'automation Chrome/shell. Déjà dans `config.example.yaml`.
- **Orchestration plus profonde** : `delegation.max_spawn_depth` 2→3 quand ③④⑤⑥ arrivent ;
  `max_concurrent_children` pour paralléliser le sourcing multi-missions.
- **Eval cron hebdo** : un 2ᵉ job cron qui calcule taux de réponse / conversions / **précision
  scoring vs réel** et livre le tableau de bord sur Telegram (cf. [`architecture-self-improving.md`](architecture-self-improving.md) §5).
- **A/B des approches** : versionner les messages du Rédacteur (③) et router 50/50, mesurer le
  taux de réponse (les **12 premiers mots** dominent).
- **Dashboard** (Phases 2/3) : migrer les notifications Telegram → web (Claude Design puis Code).
  Hermes expose déjà un dashboard + `hermes mcp serve` (exposer ses convos à d'autres agents).
- **Déploiement cloud robuste** : mode **webhook** Telegram (`TELEGRAM_WEBHOOK_URL` +
  `TELEGRAM_WEBHOOK_SECRET`) si le VPS passe derrière un domaine ; sinon long-polling.
- **Durcissement continu** : `unauthorized_dm_behavior: ignore`, allowlist stricte, audits
  **fairness 4/5** réguliers (geler l'autonomie si dérive), `prune_builtins: false`.
- **Multi-profil métier** : profils séparés (ex. `rédacteur`, `évaluateur`) avec leur SOUL/skills,
  isolés sous `~/.hermes/profiles/<nom>/` — montée en charge sans mélange de contexte.

---

## 6. Mapping avec la roadmap (axe maturité M0→M4)

- **M0** conformité (bloquant) → [`compliance.md`](compliance.md)
- **M1** §1-2 (pin skills, mémoire native + RAG + Honcho)
- **M2** §3 + eval cron (apprentissage + métriques)
- **M3** autonomie graduée (cf. [`architecture-self-improving.md`](architecture-self-improving.md) §7)
- **M4** §4 (fine-tuning, au seuil seulement)

Les extensions §5 se greffent au fil des Phases de déploiement sans casser l'existant.
