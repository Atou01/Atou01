#!/usr/bin/env bash
# Wiring Phase 1 — idempotent. DRY_RUN=1 par défaut (affiche les commandes sans les exécuter).
# Pour appliquer réellement : DRY_RUN=0 ./scripts/setup-phase1.sh
set -euo pipefail

DRY_RUN="${DRY_RUN:-1}"

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$KIT_DIR"

PROFILES=(director chasseur sourceur)
CRON_NAME="mission-report"
CRON_SCHEDULE="0 8 * * 1-5"
CRON_SKILL="mission-hunter"
CRON_PROMPT_FILE="cron/morning-mission-report.prompt"

note() { printf '\033[36m• %s\033[0m\n' "$*"; }
run() {
  if [ "$DRY_RUN" = "1" ]; then
    printf '  \033[33m[dry-run]\033[0m %s\n' "$*"
  else
    printf '  \033[32m[run]\033[0m %s\n' "$*"
    "$@"
  fi
}

if [ "$DRY_RUN" = "1" ]; then
  printf '\033[33m== DRY-RUN (aucune action exécutée). Relance avec DRY_RUN=0 pour appliquer. ==\033[0m\n'
else
  printf '\033[32m== APPLICATION RÉELLE ==\033[0m\n'
fi

# 0. Préflight obligatoire (sauf en dry-run où l'on tolère un hermes absent pour relire les cmds)
note "Préflight"
if [ "$DRY_RUN" = "0" ]; then
  ./scripts/preflight-dry-run.sh
else
  ./scripts/preflight-dry-run.sh || printf '  (préflight non bloquant en dry-run)\n'
fi

require_hermes() {
  if ! command -v hermes >/dev/null 2>&1; then
    echo "hermes introuvable — installation requise pour l'application réelle." >&2
    exit 1
  fi
}

# 1. Profils (subagents isolés)
note "Profils Hermes"
[ "$DRY_RUN" = "0" ] && require_hermes
existing_profiles=""
command -v hermes >/dev/null 2>&1 && existing_profiles="$(hermes profile list 2>/dev/null || true)"
for p in "${PROFILES[@]}"; do
  if printf '%s\n' "$existing_profiles" | grep -qiw "$p"; then
    printf '  \033[32m✓\033[0m profil "%s" déjà présent (skip)\n' "$p"
  else
    run hermes profile create "$p"
  fi
done

# 2. Installer les SOUL.md dans chaque profil.
#    Le chemin du dossier profil est RÉSOLU via hermes (pas codé en dur).
note "Identités (SOUL.md)"
profile_dir() {
  # Tente de résoudre le dossier de config d'un profil ; fallback documenté.
  local name="$1" dir=""
  dir="$(hermes -p "$name" config path 2>/dev/null || true)"
  [ -z "$dir" ] && dir="$(hermes -p "$name" config 2>/dev/null | sed -n 's/.*config[_ ]dir[: ]*//p' | head -n1)"
  [ -z "$dir" ] && dir="${HERMES_HOME:-$HOME/.hermes}/profiles/$name"
  printf '%s' "$dir"
}
declare -A SOUL_SRC=(
  [director]="SOUL.director.md"
  [chasseur]="profiles/chasseur/SOUL.md"
  [sourceur]="profiles/sourceur/SOUL.md"
)
for p in "${PROFILES[@]}"; do
  src="${SOUL_SRC[$p]}"
  if [ "$DRY_RUN" = "0" ]; then
    dest_dir="$(profile_dir "$p")"
    run mkdir -p "$dest_dir"
    run cp "$src" "$dest_dir/SOUL.md"
  else
    printf '  \033[33m[dry-run]\033[0m cp %s -> <dossier profil %s>/SOUL.md\n' "$src" "$p"
  fi
done

# 3. Cron matinal (idempotent)
note "Cron \"$CRON_NAME\" ($CRON_SCHEDULE → telegram, skill $CRON_SKILL)"
existing_cron=""
command -v hermes >/dev/null 2>&1 && existing_cron="$(hermes cron list 2>/dev/null || true)"
if printf '%s\n' "$existing_cron" | grep -qiw "$CRON_NAME"; then
  printf '  \033[32m✓\033[0m cron "%s" déjà présent (skip — édite-le avec: hermes cron edit %s)\n' "$CRON_NAME" "$CRON_NAME"
else
  if [ "$DRY_RUN" = "0" ]; then
    prompt_content="$(cat "$CRON_PROMPT_FILE")"
    run hermes cron create \
      --name "$CRON_NAME" \
      --schedule "$CRON_SCHEDULE" \
      --deliver telegram \
      --skill "$CRON_SKILL" \
      --prompt "$prompt_content"
  else
    printf '  \033[33m[dry-run]\033[0m hermes cron create --name %s --schedule "%s" --deliver telegram --skill %s --prompt "$(cat %s)"\n' \
      "$CRON_NAME" "$CRON_SCHEDULE" "$CRON_SKILL" "$CRON_PROMPT_FILE"
  fi
fi

echo
note "Prochaines étapes"
cat <<'EOF'
  1. (VPS) garder la gateway always-on : service systemd ou tmux (voir README).
  2. Test end-to-end :  hermes cron run mission-report
       → rapport TOP 5 sur Telegram + tâche CP1 "blocked".
  3. Débloque le CP1 (réponse Telegram ou: hermes kanban unblock <id>) → le Sourceur démarre.
EOF
