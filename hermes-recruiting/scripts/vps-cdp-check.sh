#!/usr/bin/env bash
# Phase 0 — côté VPS. Vérifie (lecture seule) que le Chrome du Mac est visible via
# le reverse tunnel SSH. N'exécute rien de mutant.
set -uo pipefail

PORT="${CDP_PORT:-9222}"
echo "== Check CDP via tunnel (VPS) =="

if curl -fsS "http://localhost:${PORT}/json/version" >/dev/null 2>&1; then
  printf '  \033[32m✓\033[0m CDP joignable sur localhost:%s\n' "$PORT"
  curl -fsS "http://localhost:${PORT}/json/version" 2>/dev/null
  echo
  exit 0
fi

printf '  \033[31m✗\033[0m CDP injoignable sur localhost:%s\n' "$PORT"
cat <<EOF
  Pistes :
   - le reverse tunnel SSH est-il ouvert depuis le Mac ? (scripts/mac-tunnel.sh)
   - Chrome tourne-t-il avec --remote-debugging-port=${PORT} sur le Mac ?
   - réponse 403 "Host header" ? → lance le proxy puis vise :9223 :
       python3 scripts/vps-cdp-proxy.py --listen 127.0.0.1:9223 --upstream 127.0.0.1:${PORT}
EOF
exit 1
