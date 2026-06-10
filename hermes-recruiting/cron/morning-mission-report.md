# Cron — `mission-report` (rapport missions matinal + CP1)

Job Hermes qui déclenche le cœur de la Phase 1 chaque matin ouvré.

## Paramètres

| Champ | Valeur |
|-------|--------|
| Nom | `mission-report` |
| Schedule | `0 8 * * 1-5` (08:00, lundi→vendredi) |
| Profil | `director` (a le toolset `kanban` → peut créer le CP1) |
| Skill attachée | `mission-hunter` |
| Livraison | `telegram:<TELEGRAM_HOME_CHANNEL>` (inséré depuis `.env` par le script) |
| Prompt | [`morning-mission-report.prompt`](morning-mission-report.prompt) |

## Commande de création (gérée par `setup-phase1.sh`)

```bash
hermes cron create \
  --name mission-report \
  --schedule "0 8 * * 1-5" \
  --profile director \
  --deliver "telegram:<TELEGRAM_HOME_CHANNEL>" \
  --skill mission-hunter \
  --prompt "$(cat cron/morning-mission-report.prompt)"
```

> Le script `setup-phase1.sh` ne (re)crée le job que s'il n'existe pas déjà
> (`hermes cron list`), pour rester idempotent.

## Mécanique CP1 (une mission à la fois)

Le job tourne **sous le profil `director`** (toolset `kanban`) — c'est lui qui crée la tâche
CP1, donc l'ID est connu **avant** l'envoi du rapport (pas de course).

1. 08:00 → le job évalue les missions (`mission-hunter`) → **LA recommandation** + 2-4
   alternatives en contexte court.
2. Le Directeur crée `CP1 — valider la mission du jour` avec `initial_status: blocked`.
3. Rapport + ID de tâche livrés sur **Telegram**.
4. **Dialogue** : Atou questionne / conteste, le Directeur argumente, **Atou tranche**.
5. Accord explicite → déblocage → le Directeur assigne le **Sourceur** sur **la seule
   mission validée**.

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
