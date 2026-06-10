# Flux quotidien — Phase 1

Seuls ① Chasseur, ② Sourceur, le cron matinal et **CP1** sont actifs en Phase 1.

> **Règle de départ : UNE mission à la fois.** L'agent recommande, Atou discute et tranche.

```
08:00 (cron mission-report, j. ouvrés — profil director)
   │
   ▼
┌────────────────────────────────┐
│ ① Évaluation des missions      │  skill: mission-hunter (16 critères)
│  → LA mission recommandée      │  + 2-4 alternatives en 1 ligne
│    (le POURQUOI argumenté)     │
└───────────────┬────────────────┘
                │  livraison Telegram (+ ID tâche CP1)
                ▼
   ╔════════════════════════════════════╗
   ║ 🔴 CP1 — DIALOGUE + validation     ║  kanban_create(initial_status=blocked)
   ║   Atou questionne / conteste,      ║  accord explicite d'Atou → unblock
   ║   le Directeur argumente,          ║
   ║   ATOU TRANCHE                     ║
   ╚════════════════╤═══════════════════╝
                    │  LA seule mission validée
                    ▼
┌─────────────────────────┐
│ ② Sourceur              │  skills: sourcing-strategy, linkedin-sourcing
│  → plan multi-canal     │
│  → requêtes booléennes  │
│  → shortlist scorée     │
└───────────┬─────────────┘
            │  livraison Telegram (pas de checkpoint en Phase 1)
            ▼
        Atou prend la main pour la suite (approche = Phase 2 / CP2)
```

## Étapes détaillées

1. **Matin (cron `mission-report`, profil `director`)** — évaluation des missions Hunteed.
   Sortie : **LA mission recommandée** (argumentée) + les alternatives en contexte court.
2. **🔴 CP1 — dialogue** — la tâche Kanban est créée **déjà bloquée** ; le rapport part avec
   son ID. Atou peut questionner ou contester ; le Directeur argumente ; **Atou tranche**.
   Son accord explicite débloque la tâche.
3. **Sourcing** — le Directeur assigne le profil `sourceur` sur **la seule mission validée**.
   Sortie : plan multi-canal + booléennes + shortlist scorée, livrée sur Telegram.
4. **Suite** — l'approche (rédaction + envoi) relève de la **Phase 2** (③ Rédacteur + CP2) et
   n'est pas automatisée ici. Atou enchaîne manuellement.
5. **Mission suivante** — on ne reprend une nouvelle mission que lorsque la mission en cours
   est sous contrôle. (8-10 en parallèle = cible long terme, une fois la confiance établie.)

## Différé (Phases 2/3)

③ Rédacteur d'approche + **CP2** · ④ Évaluateur (questionnaire → CR Hunteed) + **CP3** ·
connecteurs Gmail/Calendar · pipeline Notion/monday · ⑤ Diffuseur · ⑥ Post-mortem/Learner ·
CVthèque Supabase.
