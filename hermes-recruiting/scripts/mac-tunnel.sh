#!/usr/bin/env bash
# Phase 0 — côté MAC.
# Lance Chrome avec le remote debugging (CDP) sur un profil ISOLÉ, puis ouvre un
# reverse tunnel SSH vers le VPS pour qu'Hermes lise le DOM en live.
# Chrome reste lié à 127.0.0.1 ; tout transite chiffré par SSH.
#
# Conf via ../.env (VPS_HOST requis). DRY_RUN=1 par défaut (n'exécute rien).
#   DRY_RUN=0 ./scripts/mac-tunnel.sh
set -uo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -f "$KIT_DIR/.env" ]; then set -a; . "$KIT_DIR/.env"; set +a; fi

DRY_RUN="${DRY_RUN:-1}"
CDP_PORT="${CDP_PORT:-9222}"
VPS_HOST="${VPS_HOST:-}"                 # ex: hermes@1.2.3.4
SSH_PORT="${SSH_PORT:-22}"
CHROME_PROFILE="${CHROME_PROFILE:-$HOME/.hermes-cdp-profile}"
CHROME_BIN="${CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

run() { if [ "$DRY_RUN" = "1" ]; then echo "[dry-run] $*"; else "$@"; fi; }

if [ -z "$VPS_HOST" ]; then
  echo "VPS_HOST manquant — renseigne-le dans $KIT_DIR/.env (ex: VPS_HOST=hermes@IP)" >&2
  exit 1
fi

echo "== Phase 0 tunnel (Mac → VPS) =="
echo "  Chrome CDP  : 127.0.0.1:$CDP_PORT  (profil isolé: $CHROME_PROFILE)"
echo "  Reverse SSH : VPS:$CDP_PORT → Mac:$CDP_PORT  vers $VPS_HOST (port $SSH_PORT)"
[ "$DRY_RUN" = "1" ] && echo "  (DRY_RUN=1 — rien n'est lancé ; passe DRY_RUN=0 pour exécuter)"

# 1. Chrome avec remote debugging (en arrière-plan si exécution réelle)
CHROME_CMD=("$CHROME_BIN" "--remote-debugging-port=$CDP_PORT" "--user-data-dir=$CHROME_PROFILE"
            "--no-first-run" "--no-default-browser-check")
if [ "$DRY_RUN" = "1" ]; then
  echo "[dry-run] ${CHROME_CMD[*]} &"
else
  "${CHROME_CMD[@]}" &
  echo "  Chrome lancé (pid $!). Laisse cette fenêtre ouverte."
  sleep 2
fi

# 2. Reverse tunnel SSH avec keepalive (autossh si dispo → reconnexion auto)
SSH_OPTS=(-N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes
          -p "$SSH_PORT" -R "$CDP_PORT:localhost:$CDP_PORT" "$VPS_HOST")
if command -v autossh >/dev/null 2>&1; then
  run autossh -M 0 "${SSH_OPTS[@]}"
else
  echo "  (autossh absent — ssh simple ; pour la robustesse: brew install autossh)"
  run ssh "${SSH_OPTS[@]}"
fi
