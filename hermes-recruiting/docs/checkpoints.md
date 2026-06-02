# Checkpoints humains — mécanique Kanban

Les 3 points de décision irremplaçables d'Atou s'appuient sur le mécanisme **natif** de
Hermes : une tâche Kanban mise en état **`blocked`** met le flux en pause jusqu'à
intervention humaine. On n'invente aucun système maison.

| CP | Décision | Phase | État |
|----|----------|-------|------|
| 🔴 **CP1** | Choix des missions à traiter | **Phase 1** | **Actif** |
| 🔴 **CP2** | Relecture + envoi des approches | Phase 2 | Différé |
| 🔴 **CP3** | Validation du CR Hunteed | Phase 2 | Différé |

## Comment ça marche (CP1)

1. Le Directeur crée la tâche et la bloque :
   ```
   kanban_create(title="CP1 — choisir les missions du jour", assignee="atou")
   kanban_block(reason="Atou choisit les missions")
   ```
2. Le rapport TOP 5 part sur Telegram **avec l'ID de la tâche** et la consigne de réponse
   (ex. « GO 1,3,4 »).
3. Atou débloque :
   - via **Telegram** (réponse à la gateway), ou
   - en CLI : `hermes kanban unblock <id>`.
4. Le déblocage **re-dispatch** : le Directeur assigne le Sourceur sur les missions retenues.

États Kanban : `triage | todo | ready | running | blocked | done | archived`.
Stockage : `~/.hermes/kanban.db` (SQLite ; migration Postgres/Supabase possible en Phase 2).

## Principe non négociable

- Le LLM **ne décide jamais** d'une embauche, ni du choix de mission, ni de l'envoi d'une
  approche, ni de la validation d'un CR.
- **Aucune action irréversible** côté client (envoi, diffusion, soumission Hunteed) sans
  déblocage humain explicite.
- En cas d'ambiguïté, le Directeur **bloque et demande** plutôt que de supposer.
