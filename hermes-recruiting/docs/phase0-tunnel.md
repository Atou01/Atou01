# Phase 0 — Tunnel SSH + Chrome CDP (Hermes voit l'écran d'Atou)

Hermes vit sur le **VPS**, Atou navigue sur Hunteed/LinkedIn depuis son **Mac**. Pour
qu'Hermes lise le **DOM en temps réel** (structure de page, champs, clics — pas une capture
figée), on relie le Chrome du Mac à Hermes via un **reverse tunnel SSH** + le **Chrome
DevTools Protocol (CDP)**.

```
   Mac (local)                         VPS (Hermes)
 ┌───────────────┐   reverse SSH    ┌──────────────────┐
 │ Chrome        │  -R 9222:…:9222  │ localhost:9222   │
 │ :9222 (CDP)   │ ───────────────► │   → Hermes (CDP) │
 │ 127.0.0.1     │   (chiffré)      │  [proxy :9223]   │
 └───────────────┘                  └──────────────────┘
```

## Pourquoi un reverse tunnel

- Chrome n'expose le CDP que sur `127.0.0.1` (il **refuse** de binder sur une IP publique —
  sécurité). On ne peut donc pas « ouvrir le port » du Mac vers Internet, et c'est tant mieux.
- Le reverse tunnel `ssh -R 9222:localhost:9222 user@vps` fait apparaître, **sur le VPS**, un
  `localhost:9222` qui pointe vers le Chrome du Mac. Tout transite **chiffré** par SSH.

## Le piège du header `Host` (à connaître)

Le CDP applique une protection anti **DNS-rebinding** : les endpoints HTTP (`/json`,
`/json/version`) et l'upgrade WebSocket **rejettent (403)** toute requête dont le header
`Host` est un **nom de domaine**. Sont **acceptés** : `localhost` et une **IP** littérale.

- **Cas nominal (marche directement)** : sur le VPS, vise toujours **`http://localhost:9222`**. Le header
  `Host` vaut alors `localhost:9222` → accepté. C'est le chemin nominal, aucun proxy requis.
- **Cas qui casse** : si le client CDP (selon la lib) vise un **hostname** (pas `localhost`/IP),
  Chrome répond 403. → lance le **proxy de réécriture** ci-dessous et vise `:9223`.

## Mise en route

### Côté Mac
```bash
# Renseigne d'abord VPS_HOST dans ../.env (ex: VPS_HOST=ubuntu@IP_DU_VPS)
DRY_RUN=0 ./scripts/mac-tunnel.sh
```
Le script lance Chrome avec `--remote-debugging-port=9222` sur un **profil isolé**
(`~/.hermes-cdp-profile`, pour ne pas toucher ton Chrome perso) puis ouvre le reverse tunnel
(avec `autossh` si présent, pour la reconnexion auto).

### Côté VPS
```bash
./scripts/vps-cdp-check.sh          # vérifie que le Chrome du Mac est visible
# si 403 Host header → proxy de réécriture, puis vise localhost:9223 :
python3 scripts/vps-cdp-proxy.py --listen 127.0.0.1:9223 --upstream 127.0.0.1:9222
```
Pointe l'endpoint CDP d'Hermes sur `http://localhost:9222` (ou `:9223` si proxy).

## Sécurité

- **Chiffrement de bout en bout** par SSH : les données candidat ne transitent jamais en clair.
- Chrome reste lié à `127.0.0.1` des deux côtés — **jamais** exposé directement sur Internet.
- Profil Chrome **isolé** : pas de mélange avec les sessions perso d'Atou.
- Le tunnel s'ouvre depuis le Mac (sortant) — pas de port entrant ouvert sur le Mac.
- Couper la session = couper le tunnel. Rien ne persiste côté VPS hors `~/.hermes`.
