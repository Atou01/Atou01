# Checkpoints humains — mécanique Kanban

Les 3 points de décision irremplaçables d'Atou s'appuient sur le mécanisme **natif** de
Hermes : une tâche Kanban mise en état **`blocked`** met le flux en pause jusqu'à
intervention humaine. On n'invente aucun système maison.

| CP | Décision | Phase | État |
|----|----------|-------|------|
| 🔴 **CP1** | Validation de **LA** mission à traiter (une à la fois) | **Phase 1** | **Actif** |
| 🔴 **CP2** | Relecture + envoi des approches | Phase 2 | Différé |
| 🔴 **CP3** | Validation du CR Hunteed | Phase 2 | Différé |

## Comment ça marche (CP1 = un dialogue, pas un choix dans une liste)

1. Le Directeur crée la tâche **déjà bloquée** (donc l'ID existe avant l'envoi du rapport) :
   ```
   kanban_create(title="CP1 — valider la mission du jour", assignee="atou",
                 initial_status="blocked")
   ```
2. Le rapport part sur Telegram **avec l'ID de la tâche** : **LA mission recommandée**
   (argumentée) + 2-4 alternatives en contexte court.
3. **Dialogue** : Atou questionne, conteste, demande des précisions ; le Directeur argumente
   (il défend son choix avec des raisons, il ne cède pas sans raison) — mais **Atou tranche**.
4. Accord explicite d'Atou → déblocage :
   - via **Telegram** (réponse à la gateway), ou
   - en CLI : `hermes kanban unblock <id>`.
5. Le déblocage **re-dispatch** : le Directeur assigne le Sourceur sur **la seule mission
   validée**. Jamais plusieurs missions en parallèle au départ.

États Kanban : `triage | todo | ready | running | blocked | done | archived`.
Stockage : `~/.hermes/kanban.db` (SQLite ; migration Postgres/Supabase possible en Phase 2).

## Principe non négociable

- Le LLM **ne décide jamais** d'une embauche, ni du choix de mission, ni de l'envoi d'une
  approche, ni de la validation d'un CR.
- **Aucune action irréversible** côté client (envoi, diffusion, soumission Hunteed) sans
  déblocage humain explicite.
- En cas d'ambiguïté, le Directeur **bloque et demande** plutôt que de supposer.
