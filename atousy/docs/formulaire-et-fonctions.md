# Formulaire de devis et fonctions serveur

Le site est un export statique (Astro, `dist/`). Les seules parties dynamiques sont des
**Cloudflare Pages Functions**, dans `functions/` : deux routes et un middleware.

| Route | Fichier | Rôle |
| --- | --- | --- |
| `GET /api/pays` | `functions/api/pays.js` | Pays du visiteur, pour proposer le bon marché (Europe · EUR / Suisse · CHF) |
| `POST /api/devis` | `functions/api/devis.js` → `server/devis.js` | Reçoit le formulaire de devis et l'envoie par e-mail |
| Pages HTML du site | `functions/_middleware.js` | Pose le marché détecté sur `<html>` (voir « Prix selon le pays, dès le premier affichage ») |

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
| 422 | `{"ok":false,"error":"spam"}` | Pot de miel rempli, jeton sans `started`, ou envoi trop rapide (aucun faux succès) |
| 403 | `{"ok":false,"error":"origin"}` | En-tête `Origin` d'un autre site, ou absent alors que le navigateur annonce une requête venue d'un autre site (`Sec-Fetch-Site: cross-site` ou `same-site`) |
| 405 | `{"ok":false,"error":"method"}` + `Allow: POST` | Méthode autre que POST |
| 413 | `{"ok":false,"error":"too_large"}` | Corps de plus de 20 Ko |
| 415 | `{"ok":false,"error":"unsupported_type"}` | Ni urlencoded, ni multipart, ni JSON |
| 429 | `{"ok":false,"error":"rate_limited"}` | Plafond quotidien atteint, rien n'est envoyé (seulement s'il est activé : voir « Limiter les abus ») |
| 502 | `{"ok":false,"error":"delivery_failed"}` | Fournisseur en erreur, injoignable, délai de 8 s dépassé, Siteverify en panne |
| 503 | `{"ok":false,"error":"not_configured"}` | Variable manquante ou invalide (Turnstile ou e-mail) |

Toutes les réponses sont en JSON utf-8 avec `Cache-Control: no-store`.
**Règle absolue : jamais `ok:true` si le message n'a pas été accepté par le fournisseur.**
Le script de la page traite `429` comme un problème technique (message d'erreur, widget réinitialisé).

### Champs attendus

Formats acceptés : `application/x-www-form-urlencoded`, `multipart/form-data`, `application/json`.
Chaque valeur est nettoyée : espaces en trop, caractères de contrôle et de direction, caractères
invisibles (espaces et liants de largeur nulle, trait d'union conditionnel) retirés.

| Champ | Règle |
| --- | --- |
| `type` | requis : `creation` ou `refonte` |
| `activite` | requis, 2 à 120 caractères |
| `zone` | requis, 2 à 120 caractères : zone d'intervention du client, en texte libre (Atousy ne liste aucune zone) |
| `site` | facultatif, URL http(s) valide, 300 caractères max ; transmise sous la forme que lit un navigateur : `exemple.fr` devient `https://exemple.fr/`, un domaine accentué apparaît en `xn--…` |
| `besoin` | requis, 10 à 2000 caractères (sauts de ligne conservés) ; plus de 4000 caractères bruts : refusé sans traitement |
| `nom` | requis, 2 à 100 caractères, sur une seule ligne |
| `email` | requis, format raisonnable, 200 caractères max, sans retour à la ligne |
| `telephone` | facultatif, 6 à 25 caractères parmi chiffres, espaces, `+ . ( ) -` (au moins 6 chiffres) |
| `market` | facultatif, `fr` ou `ch` ; toute autre valeur est ignorée (champ caché) |
| `website` | pot de miel : doit rester vide |
| `started` | `Date.now()` côté client au chargement du formulaire ; **obligatoire dès qu'un jeton Turnstile est envoyé** (les deux viennent du script de la page) |
| `cf-turnstile-response` | jeton Turnstile (nom par défaut du widget) |

### Ordre des contrôles

1. Méthode → origine (`Origin`, ou à défaut `Sec-Fetch-Site`) → type de contenu → taille.
2. Anti-spam passif → `422` : `website` non vide, jeton Turnstile sans `started` lisible, ou
   envoi moins de 3 s après `started`. Un `started` dans le futur ou antérieur à 2001 (horloge
   du visiteur décalée) n'est pas contrôlé.
3. Validation des champs → `400 validation`. Le jeton Turnstile n'est pas consommé :
   le visiteur corrige et renvoie avec le même jeton (valable 5 min).
4. Configuration (Turnstile puis e-mail) → `503`, avant de consommer le jeton. Une **clé secrète
   de test** de Cloudflare est refusée (`503`, journal `turnstile test secret outside localhost`)
   dès que la requête ne vient pas de `localhost`, `127.0.0.1` ou `[::1]`.
5. Turnstile vérifié côté serveur (Siteverify, avec `remoteip` = `CF-Connecting-IP`, sans nouvel
   essai). Le jeton doit avoir été obtenu sur le hostname de la requête ou d'une origine de
   `ALLOWED_ORIGINS`, par le widget du formulaire (action `devis`). Ces deux contrôles sont
   ignorés avec les clés de test, qui ne servent qu'en local.
6. Plafond quotidien, s'il est activé → `429`.
7. Envoi de l'e-mail (délai max 8 s, pas de redirection suivie, pas de nouvel essai pour
   éviter les doublons).

Après une réponse `captcha`, `502` ou `503`, le front-end doit **réinitialiser le widget**
(`turnstile.reset()`) : le jeton est à usage unique.

### E-mail envoyé

- Sujet : `Demande de devis — Refonte — <activité>` (ou `Création`).
- Corps texte + HTML simple ; toutes les valeurs du visiteur sont échappées dans le HTML.
- `Reply-To` = adresse du visiteur : répondre au message lui écrit directement.
- Le message rappelle que les informations sont saisies par le visiteur et non vérifiées
  (contrôler l'adresse du site avant de l'ouvrir).
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
| `TURNSTILE_SECRET_KEY` | Secret | clé secrète du widget de production | absente (le formulaire répond 503), ou clé secrète du widget des aperçus (voir « Mise en place de Turnstile »). **Jamais une clé de test** : refusée hors poste local |
| `EMAIL_PROVIDER` | Texte | `brevo` ou `resend` | absent tant que les aperçus ne sont pas protégés par Cloudflare Access ; sinon comme en Production |
| `BREVO_API_KEY` / `RESEND_API_KEY` | Secret | clé du fournisseur choisi | clé distincte, sur un quota séparé si possible |
| `MAIL_TO` | Texte | `contact@atousy.com` (plusieurs adresses : séparées par des virgules) | boîte de test |
| `MAIL_FROM` | Texte | `Atousy <contact@atousy.com>` (domaine authentifié chez le fournisseur) | idem |
| `ALLOWED_ORIGINS` | Texte | facultatif, ex. `https://www.atousy.com` si le formulaire y est servi | facultatif |
| `DEVIS_COUNTER` | Liaison KV (*Bindings*) | facultatif : espace de noms KV du plafond quotidien | facultatif, un autre espace que la Production |
| `DEVIS_DAILY_LIMIT` | Texte | facultatif : plafond d'envois par jour (défaut 50), lu seulement si `DEVIS_COUNTER` est lié | idem |
| `EMAIL_API_BASE` | Texte | **jamais** | **jamais** (tests locaux uniquement) |
| `PUBLIC_TURNSTILE_SITE_KEY` | Texte, **variable de build** | clé de site du widget de production | clé de site du widget des aperçus, ou absente |

- `PUBLIC_TURNSTILE_SITE_KEY` est publique : elle est lue **au moment du build** par Astro
  (préfixe `PUBLIC_`) et finit dans le HTML. Avec le build Git de Cloudflare Pages, elle se
  définit au même endroit, par environnement ; si le build se fait ailleurs (CI, `wrangler pages
  deploy`), elle doit être présente dans l'environnement de ce build.
- `EMAIL_API_BASE` remplace l'URL du fournisseur ; il n'est accepté que vers `localhost`,
  `127.0.0.1` ou `[::1]` pour que la clé d'API ne parte jamais ailleurs.
- **Clés de test Turnstile** (`1x…AA`, `2x…AA`, `3x…AA` pour la clé secrète) : acceptées seulement
  sur un poste local (`wrangler pages dev`). En ligne, Production comme Preview, `/api/devis`
  répond 503 et le journal indique `turnstile test secret outside localhost`. Raison : la clé
  « toujours valide » accepte n'importe quel jeton, même envoyé par un script ; les adresses
  d'aperçu sont publiques (statuts de commit du dépôt public) et partagent souvent le quota du
  fournisseur d'e-mail avec la Production. La clé de site de test `1x00000000000000000000AA` ne
  fonctionne donc, elle aussi, qu'en local.
- **Build sans `PUBLIC_TURNSTILE_SITE_KEY`** : la page Devis n'a pas de widget, chaque envoi est
  refusé et, au clic sur « Envoyer ma demande », la page affiche « Le formulaire n'est pas
  encore en service » avec l'adresse de contact. Le build Cloudflare l'écrit en avertissement (`PUBLIC_TURNSTILE_SITE_KEY absente`) :
  relire le journal du build et faire un envoi réel avant la mise en ligne.

## Mise en place de Turnstile

1. Cloudflare > **Turnstile** > *Add widget* ; mode *Managed* ; hostnames : `atousy.com` et
   `www.atousy.com` seulement. Sans `<projet>.pages.dev` dans la liste, la Production servie
   sur cette adresse ne peut pas envoyer de devis : le formulaire n'est utilisable que sur le
   domaine, là où les règles de pare-feu s'appliquent.
2. Copier la **clé de site** → `PUBLIC_TURNSTILE_SITE_KEY` (variable de build, Production).
3. Copier la **clé secrète** → secret `TURNSTILE_SECRET_KEY` du projet Pages (Production).
4. Pour tester un vrai envoi dans un aperçu : un **second widget**, hostname `<projet>.pages.dev`
   (vérifier qu'il couvre les adresses d'aperçu `<id>.<projet>.pages.dev`), avec ses deux clés
   dans l'environnement **Preview** uniquement, et les aperçus protégés par Cloudflare Access.
5. La Content-Security-Policy autorise déjà `https://challenges.cloudflare.com` dans `script-src`
   et `frame-src` (voir « En-têtes de sécurité »).

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

Ajoutés le 26/10/2026 : clé de test refusée hors poste local, action Turnstile, `Sec-Fetch-Site`
sans `Origin`, jeton sans `started`, caractères invisibles, forme normalisée de l'adresse du site,
temps de traitement de 20 Ko d'espaces, plafond quotidien (KV simulé), en-têtes de la page sans
JavaScript, et l'étape d'après-build (CSP, sitemap, `_headers`, `_routes.json` : `tests/build.test.js`).

Test de bout en bout local (`wrangler pages dev` sur un dossier temporaire, vrai Siteverify
avec les clés de test Cloudflare, faux fournisseur local via `EMAIL_API_BASE`) : pays,
validation, captcha refusé, spam, 413, `not_configured`, succès Brevo et Resend, 502 si le
fournisseur est injoignable. Refait le 26/10/2026 après les changements ci-dessus : envoi accepté
depuis `127.0.0.1`, 503 avec la clé de test sur l'hôte `atousy.com`, 403 sans `Origin` en
`cross-site`, 422 pour un jeton sans `started`, en-têtes de `_headers` (CSP comprise) présents sur
les pages qui passent par `functions/_middleware.js`.

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
confirmation uniquement après un envoi accepté par le service d'e-mail (même texte qu'avec
JavaScript, sans délai de réponse promis), sinon l'explication (champs à corriger, anti-spam qui
nécessite JavaScript, service non raccordé, erreur technique) et un lien de retour au formulaire.
Sur la page Devis, sans JavaScript, le bouton d'envoi est masqué et l'adresse de contact est
proposée à la place : cette réponse HTML reste un filet de sécurité pour un envoi direct.
Cette page porte ses propres en-têtes de sécurité (voir plus bas). Le script de la page continue de recevoir du JSON
(`Accept: application/json`). Tests : `tests/html.test.js`.

## Prix selon le pays, dès le premier affichage

`functions/_middleware.js` pose `data-market="ch"` (Suisse, Liechtenstein) ou `data-market="fr"`
(pays européens) sur la balise `<html>` de chaque page, d'après le pays fourni par Cloudflare
(`server/market.js`, partagé avec le navigateur). Le CSS masque l'autre prix : un visiteur en
Suisse ne voit que 1 990 CHF, même sans JavaScript et sans saut d'affichage. Hors Europe, la
page n'est pas modifiée (Europe · EUR « par défaut »). Le choix fait dans le menu reste prioritaire.

- Pages réécrites : `Cache-Control: private, no-cache`, sans ETag (la page dépend du pays).
- `public/_routes.json` exclut les fichiers statiques, `sitemap.xml` et les pages des démos (elles
  n'affichent aucun prix) : seules les pages du site et `/api/*` passent par les fonctions (offre
  gratuite Cloudflare : 100 000 requêtes de fonctions par jour, partagées avec tous les Workers du
  compte, à vérifier au moment du déploiement). Un visiteur hors Europe déclenche en plus un appel
  à `/api/pays`, une fois par session.
- **Quota dépassé** : régler explicitement le projet sur **« Fail open »** (réglage *Fail open /
  Fail closed* des paramètres du projet, rubrique *Runtime* ou *Functions* selon la version du
  tableau de bord). Les pages restent alors servies, sans détection du pays (prix « par défaut »)
  et sans formulaire, au lieu d'une page d'erreur Cloudflare.
- `/api/pays` reste le repli côté navigateur si une page arrive sans détection.
- Tests : `tests/market.test.js` ; vérifié aussi dans `wrangler pages dev` (réécriture effective).

## Limiter les abus (volume d'envois)

Turnstile bloque les robots, mais un jeton valide donne un e-mail : il n'y a pas de limite de
débit native (la liaison *Rate Limiting* de Cloudflare n'existe pas pour les Pages Functions).
Ce qui est en place ou à activer :

- **Plafond quotidien, dans la fonction** (`server/limit.js`, désactivé par défaut) : créer un
  espace de noms KV (*Workers & Pages > KV*), le lier au projet Pages sous le nom
  `DEVIS_COUNTER` (*Settings > Bindings*, environnement Production) ; facultatif :
  `DEVIS_DAILY_LIMIT` (défaut 50). Au-delà, `429 rate_limited`, rien n'est envoyé, journal
  `[devis] rate_limited: daily cap 50`. Compteur approximatif (KV se synchronise en quelques
  dizaines de secondes), lu seulement après un jeton Turnstile valide ; si KV est en panne,
  la demande part quand même. Coût : une lecture et une écriture KV par envoi (offre gratuite :
  1 000 écritures par jour).
- **Règle de limitation de débit du pare-feu**, une fois le DNS d'atousy.com chez Cloudflare :
  *Security > WAF > Rate limiting rules*, chemin `/api/devis`, par exemple 5 requêtes en 10 s
  par adresse IP → blocage. Elle ne couvre que le domaine, pas `<projet>.pages.dev` : d'où le
  widget de production limité à `atousy.com` et `www.atousy.com`.
- **Alertes de consommation** chez Brevo ou Resend (quota journalier), pour voir un abus avant
  que les vraies demandes ne soient bloquées.
- **Aperçus protégés** : *Pages > projet > Settings > General > Access policy* (Cloudflare Access)
  sur les déploiements Preview.

## En-têtes de sécurité, cache et sitemap

- **`public/_headers`**, toutes les pages et fichiers statiques : `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy` (caméra, micro, géolocalisation), `X-Frame-Options:
  DENY` et `Strict-Transport-Security: max-age=31536000` (un an, **sans** `includeSubDomains` :
  la messagerie IONOS et d'éventuels sous-domaines restent libres ; sans `preload`). HSTS ne
  protège pas la toute première visite ; si le DNS passe chez Cloudflare, on peut l'activer aussi
  dans *SSL/TLS > Edge Certificates*, qui couvre alors les réponses des fonctions.
- **Content-Security-Policy**, ajoutée au build dans `dist/_headers` par `astro.config.mjs` :
  aucun script tiers sauf Turnstile (`https://challenges.cloudflare.com`, aussi seul cadre
  autorisé) ; les scripts en ligne d'Astro sont autorisés par leur empreinte SHA-256, recalculée
  à chaque build ; styles en ligne permis (attributs `style` des démos) ; images, polices et
  requêtes limitées au site ; le site ne peut pas être affiché dans un cadre (`frame-ancestors
  'none'`). Vérifié le 26/10/2026 dans Chromium sur les 36 pages, à 1440 et 390 px, avec menu,
  carrousel, sélecteur de marché et un envoi complet du formulaire avec le widget Turnstile de
  test : aucune violation.
  - Ajouter un service tiers (carte, vidéo, police externe, statistiques) demande d'adapter
    `buildCsp` dans `astro.config.mjs`. **Cloudflare Web Analytics** en injection automatique :
    ajouter `https://static.cloudflareinsights.com` à `script-src` et
    `https://cloudflareinsights.com` à `connect-src`. **Rocket Loader** et **Zaraz** : à laisser
    désactivés. **Bot Fight Mode** (détections JavaScript) ajoute à chaque page un petit script
    en ligne, différent à chaque requête, que la CSP bloque : s'il est activé, relire la console
    du navigateur sur le site en ligne. L'obfuscation des adresses e-mail de Cloudflare
    fonctionne (script servi par le site lui-même, sous `/cdn-cgi/`).
  - En cas de doute après un changement : remplacer temporairement le nom de l'en-tête par
    `Content-Security-Policy-Report-Only` dans `addCspToHeaders` (les violations s'affichent dans
    la console du navigateur sans rien bloquer).
- **Réponses des fonctions** : les règles de `_headers` ne s'y appliquent pas. Le JSON porte
  `Content-Type`, `Cache-Control: no-store` et `nosniff` ; la page sans JavaScript porte sa propre
  CSP (`default-src 'none'`, aucun script), `X-Frame-Options` et `Referrer-Policy`. Les pages
  HTML qui traversent `functions/_middleware.js` gardent les en-têtes de `_headers` (vérifié avec
  `wrangler pages dev`) ; à recontrôler en ligne avec `curl -I`, y compris depuis la Suisse
  (page réécrite).
- **Cache** : `/_astro/*` un an (noms versionnés) ; `/brand/*` une semaine et `/og-image.jpg` un
  jour (noms fixes : changer le nom du fichier si son contenu change).
- **Sitemap** : `dist/sitemap.xml` est produit au build avec les pages sans `noindex`, à leur
  adresse canonique, et déclaré dans `robots.txt`. Démos, pages légales à compléter, CGV et 404
  en sont exclues tant qu'elles sont en `noindex` ; une page qui passe en index y entre seule.
