#!/usr/bin/env bash
# Préflight Phase 1 — checks STRICTEMENT en lecture seule.
# N'exécute aucune commande mutante. Sortie != 0 si un check bloquant échoue.
set -uo pipefail

# Racine du kit (dossier parent de scripts/)
KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$KIT_DIR"

REQUIRED_SKILLS=(mission-hunter sourcing-strategy linkedin-sourcing)
REQUIRED_ENV=(TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID)

fail=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }
ko()   { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=1; }

echo "== Préflight Phase 1 (lecture seule) =="

# 1. Binaire hermes
echo "[1] Hermes Agent"
if command -v hermes >/dev/null 2>&1; then
  ok "hermes présent ($(command -v hermes))"
else
  ko "hermes introuvable — installe-le (voir README) avant le wiring réel"
fi

# 2. Skills requises
echo "[2] Skills requises"
if command -v hermes >/dev/null 2>&1; then
  installed="$(hermes skills list 2>/dev/null || true)"
  for s in "${REQUIRED_SKILLS[@]}"; do
    if printf '%s\n' "$installed" | grep -qiw "$s"; then
      ok "skill '$s' installée"
    else
      ko "skill '$s' absente — installe-la côté Hermes (hermes skills list)"
    fi
  done
else
  warn "hermes absent : vérification des skills sautée"
fi

# 3. Fichier .env + clés requises (valeurs jamais affichées)
echo "[3] Secrets (.env)"
if [ -f .env ]; then
  ok ".env présent"
  # shellcheck disable=SC1091
  set -a; . ./.env 2>/dev/null || true; set +a
  for k in "${REQUIRED_ENV[@]}"; do
    v="${!k:-}"
    if [ -n "$v" ] && ! printf '%s' "$v" | grep -qi 'changeme\|xxxx\|your-'; then
      ok "$k défini"
    else
      ko "$k manquant ou laissé en placeholder dans .env"
    fi
  done
else
  ko ".env absent — copie .env.example vers .env puis renseigne tes secrets"
fi

# 4. Aucun secret commité dans le kit
echo "[4] Anti-fuite de secrets"
if git -C "$KIT_DIR" rev-parse >/dev/null 2>&1; then
  if git -C "$KIT_DIR" ls-files --error-unmatch .env >/dev/null 2>&1; then
    ko ".env est suivi par git ! retire-le : git rm --cached .env"
  else
    ok ".env non suivi par git"
  fi
fi
if grep -RInE '(BOT_TOKEN|API_KEY|SECRET|PASSWORD)[[:space:]]*=[[:space:]]*[A-Za-z0-9_-]{12,}' \
     --include='*.sh' --include='*.md' --include='*.prompt' . 2>/dev/null \
   | grep -v '\.env.example' | grep -vq 'changeme'; then
  ko "valeur ressemblant à un secret trouvée dans des fichiers suivis — vérifie"
else
  ok "aucun secret en clair détecté dans les fichiers du kit"
fi

# 5. Gateway / Telegram joignable (best effort, non bloquant)
echo "[5] Gateway Telegram (best effort)"
if command -v hermes >/dev/null 2>&1; then
  if hermes gateway status >/dev/null 2>&1; then
    ok "gateway joignable"
  else
    warn "gateway non détectée — démarre-la (hermes gateway / systemd) avant le test end-to-end"
  fi
else
  warn "hermes absent : check gateway sauté"
fi

echo
if [ "$fail" -eq 0 ]; then
  printf '\033[32mPréflight OK.\033[0m Tu peux lancer : DRY_RUN=0 ./scripts/setup-phase1.sh\n'
else
  printf '\033[31mPréflight INCOMPLET.\033[0m Corrige les ✗ ci-dessus avant le wiring réel.\n'
fi
exit "$fail"
