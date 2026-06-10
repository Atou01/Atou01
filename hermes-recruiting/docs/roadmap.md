# Roadmap — Pipeline de recrutement automatisé (Hermes × Hunteed)

Vue d'ensemble du projet. **Ce repo construit les Phases de déploiement 0 et 1 uniquement.**
Les phases 2 et 3 sont décrites pour le cadrage, pas implémentées.

> **Deux axes distincts** (ne pas confondre) :
> - **Axe A — Phases de déploiement** (0→3) : *comment on met le système en production*
>   (tunnel/entraînement → bot Telegram → dashboard). Numérotées « Phase ».
> - **Axe B — Piste de maturité capacitaire** (M0→M4) : *à quel point l'agent est bon et
>   autonome* (conformité → jugement+mémoire → apprentissage+evals → autonomie → fine-tuning).
>   Numérotées « M ». Détail : [`architecture-self-improving.md`](architecture-self-improving.md).
>
> ⚠️ **M0 (conformité) est un préalable bloquant** à toute montée en autonomie, indépendamment
> de l'axe A. Voir [`compliance.md`](compliance.md).

## Principe directeur

- **Hermes = Directeur.** Il orchestre, planifie (cron), spawne les subagents, communique via
  Telegram. Il **ne prend aucune décision finale.**
- **On entraîne Hermes AVANT de déployer les subagents** (Phase 0) : il doit maîtriser le
  workflow Hunteed de A à Z avant de guider les subagents.
- **On valide sur Telegram d'abord, le dashboard vient après** (Phases 2/3).
- **UNE mission à la fois pour commencer** : l'agent recommande LA mission (argumentée),
  Atou discute et tranche (CP1 = dialogue), et on ne prend la suivante que quand celle en
  cours est sous contrôle.
- Objectif business **long terme** : monter à 8–10 missions de front une fois la confiance
  établie. Chaque placement = revenu réel.

## Décisions d'infrastructure

| Sujet | Décision |
|-------|----------|
| Hôte Hermes | ✅ **Infomaniak VPS Lite** (choisi et provisionné) — 2 vCPU / 4 Go / 60 Go, Ubuntu 24.04, user `ubuntu`. L'IP vit dans le `.env` local, jamais dans ce repo public. |
| Localisation | ✅ **Genève (Suisse)** — latence + cohérence RGPD/nLPD. |
| 1ʳᵉ tâche concrète | ✅ **Fait** : VPS provisionné, durci (ufw, fail2ban, SSH clé-only), Hermes v0.15.1 installé. |
| Métier prioritaire | **Choisi ENSEMBLE pendant la Phase 0** (sessions d'entraînement) — pas prédéterminé. |
| Provider LLM | Nous Portal ou OpenRouter (via `hermes setup model`). |
| Interface (Phases 0–1) | **Telegram.** |
| Skills | **Réutiliser** celles d'Atou, ne pas les réécrire. |
| HelloWork | **❌ Exclu de la Phase 1.** France Travail Pro + LinkedIn + base locale suffisent. À réévaluer après ~2 mois seulement si besoin de volume. |

## Le défi clé — Hermes (VPS) doit « voir » l'écran d'Atou (Mac local)

Atou navigue sur Hunteed/LinkedIn depuis son **Mac**, mais Hermes vit sur le **VPS**.
**Solution : reverse tunnel SSH + Chrome DevTools Protocol (CDP).** Hermes lit le DOM en
temps réel (pas une image figée) pendant qu'Atou explique via Telegram.
Détail + le piège du header `Host` : [`phase0-tunnel.md`](phase0-tunnel.md).

## Axe A — Phases de déploiement

### Phase 0 — Entraînement d'Hermes *(construit ici — priorité absolue, ~1–2 sem.)*
Tunnel SSH+CDP, sessions live sur de vraies missions, Hermes génère sa procedural
memory, feedback loop. **Critère de sortie** : « source-moi cette mission » → Hermes
exécute le workflow sans 50 questions. → [`phase0-training.md`](phase0-training.md)

### Phase 1 — Bot complet sur Telegram *(construit ici — ~2–3 sem.)*
Subagents + pipeline missions → sourcing → approche → évaluation, interface Telegram.
Démarrage par le bloc **① Chasseur → CP1 → ② Sourceur** (déjà câblé), puis ③ et ④.
→ [`phase1-flow.md`](phase1-flow.md), [`checkpoints.md`](checkpoints.md)

### Phase 2 — Design du dashboard *(non construit — ~1–2 sem.)*
UX/UI via Claude Design. Validation par Atou avant toute ligne de front.

### Phase 3 — Intégration du dashboard *(non construit — ~1 sem.)*
Front (React/Vue) via Claude Code + branchement API Hermes. Migration des notifications
Telegram → dashboard.

## Axe B — Piste de maturité capacitaire (M0→M4)

*Cadence de l'agent « meilleur chasseur ». Détail + métriques :*
[`architecture-self-improving.md`](architecture-self-improving.md) ; mise en œuvre concrète +
extensions futures : [`evolution.md`](evolution.md). **Ordre non négociable : mémoire/rubrics/RAG
d'abord, fine-tuning en dernier.**

| Étape | Contenu | Déclencheur de passage |
|-------|---------|------------------------|
| **M0 — Conformité** 🔒 | Préalable bloquant : haut risque assumé, journalisation, info candidats, rétention 2 ans, interdits dans les prompts, checklist [`compliance.md`](compliance.md). | Checklist M0 cochée |
| **M1 — Jugement + mémoire** | Convertir + **épingler** les skills cœur ; rubrics **binaires pondérés** + pénalités + *evidence-anchored* (note /10 dérivée) ; **RAG** Supabase + few-shot ; Honcho. Checkpoints **in-the-loop** stricts. | Rubrics & RAG en place |
| **M2 — Apprentissage + evals** | `save_trajectories` + Learner (Reflexion) ; tableau de bord evals (taux réponse, conversions, **précision scoring vs réel**) ; **A/B humain vs agent** ; Curator (skills agent). | Métriques suivies sur ≥1 trimestre |
| **M3 — Autonomie graduée** | Score de confiance ; sous-tâches sûres « agir puis notifier » ; cible ~10-15 % en revue ; **jamais 0 %** sur décision candidat ; rollback de skill sur régression. | Précision scoring ≥ humain sur 2 trimestres |
| **M4 — Fine-tuning ciblé** | Environnement **Atropos** custom + **LoRA GRPO** sur petit modèle (scoring / style CR). | ≥ qqs centaines de trajectoires scorées **et** besoin de style/format stable |

**Benchmarks qui changent la décision** : taux de réponse agent < humain → rester en M1/M2 ;
dérive fairness (ratio < 4/5) → geler l'autonomie + audit ; avertissement LinkedIn → pause 48-72 h.

## Subagents (Phase 1)

| # | Agent | Skills | Sortie | Checkpoint |
|---|-------|--------|--------|------------|
| ① | Chasseur de missions | `mission-hunter` | **LA mission recommandée** (16 critères) + alternatives | 🔴 **CP1** dialogue + validation |
| ② | Sourceur | `sourcing-strategy`, `linkedin-sourcing` | Plan multi-canal + booléennes + shortlist | — |
| ③ | Rédacteur d'approche | `sourcing-strategy`, `personal-branding` | Messages perso par niveau | 🔴 **CP2** relit/envoie |
| ④ | Évaluateur | `recruitment-expert`, `candidate-evaluator` | Questionnaire + rubric pondérée (**/10 dérivé**) + CR | 🔴 **CP3** valide le CR |
| ⑤ | Diffuseur *(option)* | `job-poster-sourcer`, `personal-branding` | Offres anonymisées + contenu inbound | — |
| ⑥ | Post-mortem / Learner | boucle native Hermes | Analyse missions closes, affine skills | — |

État dans ce repo : **①② câblés** (Phase 1 cœur). ③④⑤⑥ = à venir, non construits.

## Ordre de construction recommandé

1. Provisionner le VPS (France/Suisse) + installer Hermes + brancher Telegram.
2. Monter le tunnel SSH + CDP et valider qu'Hermes lit le DOM en live.
3. Phase 0 : entraînement jusqu'au critère de sortie.
4. Phase 1 : ① → CP1 → ②, puis ③ et ④.
5. Phases 2 + 3 : dashboard.

> Démarrer par les Phases 0 et 1 uniquement. Ne pas tout construire d'un coup.
