# Roadmap — Pipeline de recrutement automatisé (Hermes × Hunteed)

Vue d'ensemble du projet. **Ce repo construit les Phases 0 et 1 uniquement.** Les phases 2 et 3
sont décrites pour le cadrage, pas implémentées.

## Principe directeur

- **Hermes = Directeur.** Il orchestre, planifie (cron), spawne les subagents, communique via
  Telegram. Il **ne prend aucune décision finale.**
- **On entraîne Hermes AVANT de déployer les subagents** (Phase 0) : il doit maîtriser le
  workflow Hunteed de A à Z avant de guider les subagents.
- **On valide sur Telegram d'abord, le dashboard vient après** (Phases 2/3).
- Objectif business : passer de ~3 missions de front à 8–10. Chaque placement = revenu réel.

## Décisions d'infrastructure

| Sujet | Décision |
|-------|----------|
| Hôte Hermes | **VPS Linux** (pas de VPN — confusion écartée). ≈ 2 vCPU / 2–4 Go RAM (Hetzner / DigitalOcean / Linode / OVH). |
| Localisation | **France ou Suisse** (latence + cohérence RGPD). |
| 1ʳᵉ tâche concrète | **Provisionner le VPS** (Atou n'en a pas encore). |
| Provider LLM | Nous Portal ou OpenRouter (via `hermes setup model`). |
| Interface (Phases 0–1) | **Telegram.** |
| Skills | **Réutiliser** celles d'Atou, ne pas les réécrire. |
| HelloWork | **❌ Exclu de la Phase 1.** France Travail Pro + LinkedIn + base locale suffisent. À réévaluer après ~2 mois seulement si besoin de volume. |

## Le défi clé — Hermes (VPS) doit « voir » l'écran d'Atou (Mac local)

Atou navigue sur Hunteed/LinkedIn depuis son **Mac**, mais Hermes vit sur le **VPS**.
**Solution : reverse tunnel SSH + Chrome DevTools Protocol (CDP).** Hermes lit le DOM en
temps réel (pas une image figée) pendant qu'Atou explique via Telegram.
Détail + le piège du header `Host` : [`phase0-tunnel.md`](phase0-tunnel.md).

## Phases

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

## Subagents (Phase 1)

| # | Agent | Skills | Sortie | Checkpoint |
|---|-------|--------|--------|------------|
| ① | Chasseur de missions | `mission-hunter` | TOP 5 GO/NO-GO (16 critères) | 🔴 **CP1** choix missions |
| ② | Sourceur | `sourcing-strategy`, `linkedin-sourcing` | Plan multi-canal + booléennes + shortlist | — |
| ③ | Rédacteur d'approche | `sourcing-strategy`, `personal-branding` | Messages perso par niveau | 🔴 **CP2** relit/envoie |
| ④ | Évaluateur | `recruitment-expert`, `candidate-evaluator` | Questionnaire + note /10 + CR | 🔴 **CP3** valide le CR |
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
