# Cron — `mission-report` (rapport missions matinal + CP1)

Job Hermes qui déclenche le cœur de la Phase 1 chaque matin ouvré.

## Paramètres

| Champ | Valeur |
|-------|--------|
| Nom | `mission-report` |
| Schedule | `0 8 * * 1-5` (08:00, lundi→vendredi) |
| Skill attachée | `mission-hunter` |
| Livraison | `telegram` |
| Prompt | [`morning-mission-report.prompt`](morning-mission-report.prompt) |

## Commande de création (gérée par `setup-phase1.sh`)

```bash
hermes cron create \
  --name mission-report \
  --schedule "0 8 * * 1-5" \
  --deliver telegram \
  --skill mission-hunter \
  --prompt "$(cat cron/morning-mission-report.prompt)"
```

> Le script `setup-phase1.sh` ne (re)crée le job que s'il n'existe pas déjà
> (`hermes cron list`), pour rester idempotent.

## Mécanique CP1

1. 08:00 → le job lance le Chasseur (`mission-hunter`) → TOP 5 GO/NO-GO.
2. Rapport livré sur **Telegram**.
3. Le Directeur crée `CP1 — choisir les missions du jour` puis la **bloque**
   (`kanban_block`). L'ID accompagne le rapport.
4. Atou répond (ex. « GO 1,3,4 ») → déblocage → le Directeur assigne le **Sourceur** sur
   chaque mission retenue.

Voir [`../docs/checkpoints.md`](../docs/checkpoints.md) et
[`../docs/phase1-flow.md`](../docs/phase1-flow.md).

## Tester / piloter le job

```bash
hermes cron run mission-report      # déclenche au prochain tick (test end-to-end)
hermes cron list                    # vérifier l'enregistrement
hermes cron pause mission-report    # suspendre
hermes cron resume mission-report   # reprendre
```

> Ajuste le `--schedule` à ton fuseau / ton rythme. Pense à garder la **gateway** Hermes
> always-on (VPS : service systemd / tmux — voir README) pour que le cron se déclenche et que
> tes réponses Telegram débloquent le CP1.
