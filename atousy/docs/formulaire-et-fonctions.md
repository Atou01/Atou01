# Formulaire de devis et fonctions serveur

Le site est un export statique (Astro, `dist/`). Les seules parties dynamiques sont deux
**Cloudflare Pages Functions**, dans `functions/` :

| Route | Fichier | Rôle |
| --- | --- | --- |
| `GET /api/pays` | `functions/api/pays.js` | Pays du visiteur, pour proposer le bon marché (Europe · EUR / Suisse · CHF) |
| `POST /api/devis` | `functions/api/devis.js` → `server/devis.js` | Reçoit le formulaire de devis et l'envoie par e-mail |

Le code partagé vit dans `server/`, hors de `functions/` : il ne devient jamais une route,
wrangler l'embarque via les imports relatifs. Les deux routes répondent aussi avec une
barre oblique finale (`/api/devis/`).

## `GET /api/pays`

- Réponse : `{"country":"FR"}`, ou `{"country":null}` si le pays est inconnu.
- Source : `request.cf.country`, à défaut l'en-tête `CF-IPCountry`. Code à deux lettres
  majuscules uniquement ; `XX` (inconnu) et `T1` (Tor) donnent `null`.
- En-têtes : JSON utf-8, `Cache-Control: private, no-store`.
- `GET` et `HEAD` seulement ; toute autre méthode → `405` (`Allow: GET, HEAD`).
- Le choix manuel du visiteur prime toujours (voir `src/scripts/market.ts`).

## `POST /api/devis`

### Contrat de réponse (le front-end en dépend, ne pas le changer)

| Statut | Corps | Cas |
| --- | --- | --- |
| 200 | `{"ok":true}` | Le fournisseur d'e-mail a **accepté** le message (réponse 2xx) |
| 400 | `{"ok":false,"error":"validation","fields":{"<champ>":"<message>"}}` | Champs invalides |
| 400 | `{"ok":false,"error":"captcha"}` | Jeton Turnstile absent, refusé, expiré ou déjà utilisé |
| 422 | `{"ok":false,"error":"spam"}` | Pot de miel rempli ou envoi trop rapide (aucun faux succès) |
| 403 | `{"ok":false,"error":"origin"}` | En-tête `Origin` d'un autre site |
| 405 | `{"ok":false,"error":"method"}` + `Allow: POST` | Méthode autre que POST |
| 413 | `{"ok":false,"error":"too_large"}` | Corps de plus de 20 Ko |
| 415 | `{"ok":false,"error":"unsupported_type"}` | Ni urlencoded, ni multipart, ni JSON |
| 502 | `{"ok":false,"error":"delivery_failed"}` | Fournisseur en erreur, injoignable, délai de 8 s dépassé, Siteverify en panne |
| 503 | `{"ok":false,"error":"not_configured"}` | Variable manquante ou invalide (Turnstile ou e-mail) |

Toutes les réponses sont en JSON utf-8 avec `Cache-Control: no-store`.
**Règle absolue : jamais `ok:true` si le message n'a pas été accepté par le fournisseur.**

### Champs attendus

Formats acceptés : `application/x-www-form-urlencoded`, `multipart/form-data`, `application/json`.
Chaque valeur est nettoyée (espaces en trop, caractères de contrôle et de direction retirés).

| Champ | Règle |
| --- | --- |
| `type` | requis : `creation` ou `refonte` |
| `activite` | requis, 2 à 120 caractères |
| `zone` | requis, 2 à 120 caractères : zone d'intervention du client, en texte libre (Atousy ne liste aucune zone) |
| `site` | facultatif, URL http(s) valide, 300 caractères max ; `exemple.fr` devient `https://exemple.fr` |
| `besoin` | requis, 10 à 2000 caractères (sauts de ligne conservés) |
| `nom` | requis, 2 à 100 caractères, sur une seule ligne |
| `email` | requis, format raisonnable, 200 caractères max, sans retour à la ligne |
| `telephone` | facultatif, 6 à 25 caractères parmi chiffres, espaces, `+ . ( ) -` (au moins 6 chiffres) |
| `market` | facultatif, `fr` ou `ch` ; toute autre valeur est ignorée (champ caché) |
| `website` | pot de miel : doit rester vide |
| `started` | facultatif : `Date.now()` côté client au chargement du formulaire |
| `cf-turnstile-response` | jeton Turnstile (nom par défaut du widget) |

### Ordre des contrôles

1. Méthode → origine → type de contenu → taille.
2. Anti-spam passif : `website` non vide, ou envoi moins de 3 s après `started` → `422`.
   Un `started` dans le futur (horloge du visiteur décalée) est ignoré.
3. Validation des champs → `400 validation`. Le jeton Turnstile n'est pas consommé :
   le visiteur corrige et renvoie avec le même jeton (valable 5 min).
4. Configuration (Turnstile puis e-mail) → `503`, avant de consommer le jeton.
5. Turnstile vérifié côté serveur (Siteverify, avec `remoteip` = `CF-Connecting-IP` et une
   `idempotency_key` aléatoire). Le hostname du jeton doit être celui de la requête ou d'une
   origine de `ALLOWED_ORIGINS` (contrôle ignoré avec les clés de test).
6. Envoi de l'e-mail (délai max 8 s, pas de redirection suivie, pas de nouvel essai pour
   éviter les doublons).

Après une réponse `captcha`, `502` ou `503`, le front-end doit **réinitialiser le widget**
(`turnstile.reset()`) : le jeton est à usage unique.

### E-mail envoyé

- Sujet : `Demande de devis — Refonte — <activité>` (ou `Création`).
- Corps texte + HTML simple ; toutes les valeurs du visiteur sont échappées dans le HTML.
- `Reply-To` = adresse du visiteur : répondre au message lui écrit directement.
- Journal (`console.error` / `console.warn`, préfixe `[devis]`) : cause courte, statut HTTP
  et code d'erreur du fournisseur, **jamais** de donnée personnelle, de secret ni le corps
  de la réponse du fournisseur. Visible dans le journal en temps réel du déploiement
  (Cloudflare > Pages > projet > Deployments > déploiement > Functions).

## Variables d'environnement (Cloudflare Pages)

À définir dans **Pages > projet > Settings > Variables and Secrets** (anciennement
*Environment variables*), séparément pour
**Production** et **Preview**. Les clés sont de type *Secret* (chiffrées). Une modification
ne s'applique qu'au **déploiement suivant**. En local : copier `.dev.vars.example` en `.dev.vars`.

| Variable | Type | Production | Preview |
| --- | --- | --- | --- |
| `TURNSTILE_SECRET_KEY` | Secret | clé secrète du widget | clé de test `1x0000000000000000000000000000000AA` (toujours valide) ou la vraie |
| `EMAIL_PROVIDER` | Texte | `brevo` ou `resend` | idem, ou absent (le formulaire répond alors 503) |
| `BREVO_API_KEY` / `RESEND_API_KEY` | Secret | clé du fournisseur choisi | clé dédiée aux tests si possible |
| `MAIL_TO` | Texte | boîte qui reçoit les devis (plusieurs : séparées par des virgules) | boîte de test |
| `MAIL_FROM` | Texte | `Atousy <devis@atousy.com>` (domaine authentifié) | idem |
| `ALLOWED_ORIGINS` | Texte | facultatif, ex. `https://www.atousy.com` si le formulaire y est servi | facultatif |
| `EMAIL_API_BASE` | Texte | **jamais** | **jamais** (tests locaux uniquement) |
| `PUBLIC_TURNSTILE_SITE_KEY` | Texte, **variable de build** | clé de site du widget | clé de test `1x00000000000000000000AA` |

- `PUBLIC_TURNSTILE_SITE_KEY` est publique : elle est lue **au moment du build** par Astro
  (préfixe `PUBLIC_`) et finit dans le HTML. Avec le build Git de Cloudflare Pages, elle se
  définit au même endroit, par environnement ; si le build se fait ailleurs (CI, `wrangler pages
  deploy`), elle doit être présente dans l'environnement de ce build.
- `EMAIL_API_BASE` remplace l'URL du fournisseur ; il n'est accepté que vers `localhost`,
  `127.0.0.1` ou `[::1]` pour que la clé d'API ne parte jamais ailleurs.
- La clé de test « toujours valide » en Production désactiverait l'anti-robot : à éviter.

## Mise en place de Turnstile

1. Cloudflare > **Turnstile** > *Add widget* ; mode *Managed* ; hostnames : `atousy.com`,
   `www.atousy.com` et, si les previews doivent utiliser la vraie clé, le domaine
   `<projet>.pages.dev`.
2. Copier la **clé de site** → `PUBLIC_TURNSTILE_SITE_KEY` (variable de build).
3. Copier la **clé secrète** → secret `TURNSTILE_SECRET_KEY` du projet Pages.
4. Si une Content-Security-Policy est ajoutée plus tard dans `public/_headers`, autoriser
   `https://challenges.cloudflare.com` dans `script-src` et `frame-src`.

## Choix du fournisseur d'e-mail

Les deux s'utilisent par simple appel REST (`fetch`), sans bibliothèque :

- **Brevo** : entreprise française, données hébergées dans l'Union européenne.
  `POST https://api.brevo.com/v3/smtp/email`, en-tête `api-key`, succès `201`.
- **Resend** : région d'envoi dans l'Union européenne disponible (`eu-west-1`), choisie à l'ajout
  du domaine. `POST https://api.resend.com/emails`, en-tête `Authorization: Bearer`, succès `200`.

Formats vérifiés le 26/10/2026 dans la documentation officielle (référence API Brevo
`sendTransacEmail`, spécification OpenAPI de Resend, guide Siteverify de Cloudflare).

**Authentification du domaine (à faire, rien n'a été modifié)** : quel que soit le choix,
le fournisseur demande d'ajouter sur la zone DNS d'`atousy.com` les enregistrements qu'il
fournit — **SPF** (TXT), **DKIM** (TXT ou CNAME) et, conseillé, **DMARC** (TXT `_dmarc`) ;
Resend ajoute un sous-domaine d'envoi (MX + TXT). Sans eux, les messages risquent d'être
refusés ou classés en indésirables. `MAIL_FROM` doit utiliser ce domaine authentifié.

## Notes pour le front-end

- Pot de miel `website` : hors écran (pas `display:none` seul), `tabindex="-1"`,
  `autocomplete="off"`, `aria-hidden="true"`, sans libellé « site web » visible ; sinon
  l'auto-remplissage du navigateur pourrait le remplir et bloquer un vrai visiteur.
- `started` : poser `Date.now()` au chargement du formulaire.
- Afficher `fields.<champ>` sous chaque champ pour `400 validation` ; pour `502`/`503`,
  proposer une autre voie de contact (le message n'est **pas** parti).

## Ce qui est testé, ce qui demande de vrais comptes

Tests automatiques (`npm test`, node:test, fetch simulé, aucun réseau) :
chemin nominal Brevo et Resend (URL, en-têtes, corps, Reply-To, échappement HTML),
chaque règle de validation, pot de miel, envoi trop rapide, captcha refusé ou absent,
hostname Turnstile, secret Turnstile manquant ou refusé, fournisseur absent ou mal
configuré, fournisseur en 4xx/5xx, redirection, erreur réseau et délai dépassé (toujours
502, jamais `ok`), origine, 405/413/415, et toutes les variantes de `/api/pays`.

Test de bout en bout local (`wrangler pages dev` sur un dossier temporaire, vrai Siteverify
avec les clés de test Cloudflare, faux fournisseur local via `EMAIL_API_BASE`) : pays,
validation, captcha refusé, spam, 413, `not_configured`, succès Brevo et Resend, 502 si le
fournisseur est injoignable.

**Non testé ici, à vérifier avec les vrais comptes avant la mise en ligne** : la vraie clé
Turnstile (widget + hostnames), la remise réelle par Brevo ou Resend (clé d'API, expéditeur
vérifié, SPF/DKIM/DMARC, arrivée en boîte de réception plutôt qu'en indésirables) et les
variables saisies dans Cloudflare Pages. Faire un envoi réel en Preview puis en Production.

## Commandes

```sh
npm test          # tests unitaires et de routes
npm run build     # génère dist/
npm run cf:dev    # sert dist/ + functions/ comme Cloudflare Pages (lit .dev.vars)
```

## Envoi sans JavaScript

Si le navigateur poste le formulaire directement (JavaScript désactivé), `/api/devis` répond par
une **page HTML lisible** au lieu du JSON, avec le même code HTTP (`server/html.js`) :
confirmation uniquement après un envoi accepté par le service d'e-mail, sinon l'explication
(champs à corriger, anti-spam qui nécessite JavaScript, service non raccordé, erreur technique)
et un lien de retour au formulaire. Le script de la page continue de recevoir du JSON
(`Accept: application/json`). Tests : `tests/html.test.js`.
