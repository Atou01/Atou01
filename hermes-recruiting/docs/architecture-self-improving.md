# Architecture cible — agent de chasse auto-améliorant (sur Hermes)

Synthèse actionnable : comment faire d'Hermes un **meilleur chasseur au fil du temps**, dans
l'ordre qui marche. **Mémoire/skills + rubrics + RAG d'abord ; fine-tuning RL en dernier.**
La conformité ([`compliance.md`](compliance.md)) prime sur tout ce qui suit.

> Les briques d'auto-amélioration d'Hermes (skills = mémoire procédurale, **Curator** autonome,
> export de trajectoires / RL **Atropos**) correspondent à l'état de l'art 2025-2026
> (ReasoningBank, SkillOS, Reflexion).

## 1. Mémoire à 3 étages

| Étage | Support Hermes | Contenu |
|-------|----------------|---------|
| **Procédurale** | **skills** (compat. agentskills.io) | Les 7 skills d'Atou converties. **Épingler (pin)** les skills cœur-métier → le Curator n'y touche pas. Le Curator ne gère que les skills **créés par l'agent** (tactiques apprises ; action max = archivage, jamais suppression). |
| **Épisodique** | **FTS5 + RAG propriétaire** (Supabase) | Anciens CR, messages d'approche **labellisés converti/non**, candidats placés/recalés, missions gagnées/perdues. Servis en **few-shot dynamique** (3–5 cas les plus proches). |
| **Sémantique / utilisateur** | **Honcho** | Modélise le **style et le goût de jugement d'Atou** — le vecteur pour apprendre « son » œil. |

**Règle ReasoningBank** : distiller des **stratégies de raisonnement transférables à partir
des succès ET des échecs auto-évalués** — pas stocker des trajectoires brutes.

## 2. Les 6 subagents → outils/skills

| # | Agent | Encodage | Checkpoint |
|---|-------|----------|------------|
| ① | Chasseur | `mission-hunter` + **rubric GO/NO-GO 16 critères** (binaires pondérés) | 🔴 CP1 |
| ② | Sourceur | PhantomBuster (dans caps ToS) + France Travail Pro + RAG CVthèque. HelloWork exclu | — |
| ③ | Rédacteur | skill par niveau, **optimise les 12 premiers mots**, A/B testé | 🔴 CP2 |
| ④ | Évaluateur | questionnaire structuré + **rubric analytique pondérée → /10 dérivé** + CR 4×150-200 mots | 🔴 CP3 |
| ⑤ | Diffuseur | offres anonymisées + contenu inbound | — |
| ⑥ | Post-mortem / Learner | réflexion type **Reflexion** à chaque clôture → trajectoire scorée + patch skill/rubric | — |

## 3. Encoder le jugement expert — rubrics

- **Analytiques, pas holistiques** : critères **indépendants** scorés séparément (anti effet de
  halo ; permet de voir *quel* critère régresse).
- **Binaires (MET/UNMET)** > échelles fines (plus fiable/reproductible). **Remplacer la note
  /10 brute de l'Évaluateur par une somme pondérée** de critères binaires/ordinaux, dont le /10
  est dérivé.
- **Critères-pénalités** (négatifs) pour contrer le *leniency bias* du juge LLM.
- **Justification *evidence-anchored*** : chaque verdict cite la preuve (extrait CV/échange).
- ⚠️ **Accord LLM-humain faible sur tâches expertes** (~64-68 %) → le juge LLM est **calibré et
  supervisé, jamais autonome** sur la décision. Le checkpoint humain est nécessaire
  *techniquement*, pas seulement légalement.

## 4. Boucle d'apprentissage instrumentée

1. Chaque mission = une **trajectoire** (`save_trajectories`), **reward = signal réel** :
   réponse obtenue ? entretien ? placement ?
2. Le **Learner** distille des *reasoning strategies* (succès **et** échecs) en skills/patchs
   de rubric → **validés au checkpoint**.
3. **Cron hebdo** : rapport de métriques sur Telegram (cf. §5).
4. Le **Curator** consolide/élague les skills tactiques (agent uniquement).
5. **Plus tard** : quand le volume de trajectoires scorées est suffisant → Environnement
   **Atropos** custom (`load_dataset`/`score_answer`) + **LoRA GRPO** sur petit modèle.

## 5. Evals — prouver l'« alpha » de l'agent

| Métrique | Repère cible | Lecture |
|----------|--------------|---------|
| **Taux de réponse à l'approche** | perso 25-40 % (top >10 % vs templaté 3-8 %) | qualité du message ; **les 12 premiers mots** dominent |
| Conversion **sourcé→entretien** | 30-50 % (équipes fortes) | qualité ciblage/shortlist |
| Conversion **→placement** | — | l'argent (payé-à-la-perf) |
| **Précision du scoring vs résultat réel** | corrélation note GO/NO-GO ↔ placé/recalé | **l'eval qui prouve l'alpha** |

Méthode : **A/B humain vs agent** sur missions appariées ; détection de régression par rubric
analytique ; revue **pipeline hebdo**, **outcome trimestriel**.

## 6. RAG d'abord, fine-tuning seulement si justifié

- ~80-90 % des besoins = **prompt + RAG + skills**. Le **fine-tuning LoRA** ne se justifie que
  pour : format/style stable (CR Hunteed, approches par niveau), connaissance implicite issue
  de centaines d'exemples, OU précision de scoring plafonnée par le prompt/RAG.
- **RGPD** : RAG = donnée traçable/effaçable en base ; fine-tuning = donnée « cuite » dans les
  poids → préférer RAG pour les données candidat.
- Coûts indicatifs : RAG (jours, <5 $/1k req) ; LoRA (100-1000 $/run) ; full FT (5k-50k $+).
- Risques RL : *catastrophic forgetting*, *reward hacking* sur les idiosyncrasies du juge.

## 7. Autonomie graduée — jamais 0 % de revue

- **in-the-loop** (approuve chaque action critique) → **on-the-loop** (politiques a priori +
  supervision, intervention sur anomalie).
- Montée pilotée par un **score de confiance** (signal, pas vérité). Cible : ~**10-15 % de cas
  en revue humaine** sur sous-tâches matures ; **jamais 0 %** sur une décision touchant un
  candidat (missions / approches / CR restent en revue substantielle).
- **Réviser la décision, pas tout le run.** Rollback de skill si un critère se dégrade.

## 8. Garde-fou opérationnel — caps LinkedIn / PhantomBuster

~**100 invitations/semaine** (≈15-25/jour ; démarrer bas, n'augmenter que si acceptation 7j
> 40 %), **délais aléatoires 5-30 s**, heures ouvrées, retrait des vieilles invitations,
**multicanal** (LinkedIn + email). Toutes les actions (manuelles + auto) comptent dans le même
quota. Préférer une activité **régulière** (LinkedIn détecte le *slide-then-spike*).
*(Caps non officiels — observations PhantomBuster ; le ToS prime, voir [`guardrails.md`](guardrails.md).)*

---

Cette piste capacitaire (M1→M4) est cadencée dans [`roadmap.md`](roadmap.md) ; **M0 conformité
en est le préalable bloquant**.
