# Flux quotidien — Phase 1

Seuls ① Chasseur, ② Sourceur, le cron matinal et **CP1** sont actifs en Phase 1.

```
08:00 (cron mission-report, j. ouvrés)
   │
   ▼
┌─────────────────────────┐
│ ① Chasseur              │  skill: mission-hunter
│  → TOP 5 GO/NO-GO       │  (16 critères)
└───────────┬─────────────┘
            │  livraison Telegram
            ▼
   ╔═══════════════════════════════╗
   ║ 🔴 CP1 — Atou choisit         ║  kanban_create + kanban_block
   ║   (tâche Kanban "blocked")    ║  Atou répond "GO 1,3,4" → unblock
   ╚═══════════════┬═══════════════╝
                   │  pour chaque mission retenue
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

1. **Matin (cron `mission-report`)** — le Directeur lance le profil `chasseur`. Sortie : TOP 5
   missions scoré GO/NO-GO. Livré sur Telegram.
2. **🔴 CP1** — le Directeur crée une tâche Kanban bloquée. Atou choisit les missions (réponse
   Telegram type « GO 1,3,4 »), ce qui débloque la tâche.
3. **Sourcing** — pour chaque mission retenue, le Directeur assigne le profil `sourceur`.
   Sortie : plan multi-canal + booléennes + shortlist scorée, livrée sur Telegram.
4. **Suite** — l'approche (rédaction + envoi) relève de la **Phase 2** (③ Rédacteur + CP2) et
   n'est pas automatisée ici. Atou enchaîne manuellement.

## Différé (Phases 2/3)

③ Rédacteur d'approche + **CP2** · ④ Évaluateur (questionnaire → CR Hunteed) + **CP3** ·
connecteurs Gmail/Calendar · pipeline Notion/monday · ⑤ Diffuseur · ⑥ Post-mortem/Learner ·
CVthèque Supabase.
