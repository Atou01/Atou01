# Atousy — site vitrine

Site du studio Atousy (« studio web & design ») : création et refonte de sites vitrines
pour artisans, TPE et PME. Réalisé d'après la maquette validée, avec les visuels Genspark.
Rien n'est publié ni raccordé à ce jour : voir `docs/avant-lancement.md`.

## Pages

| Adresse | Page | Indexée |
|---|---|---|
| `/` | Accueil : hero avec le carrousel des cinq démos, galerie, offre, méthode, appel au devis | oui |
| `/creation/` | Création de site | oui |
| `/refonte/` | Refonte de site | oui |
| `/exemples/` | Les cinq démonstrations fictives | oui |
| `/offre/` | L'offre : tarif, contenu du socle, FAQ | oui |
| `/methode/` | La méthode en trois étapes | oui |
| `/devis/` | Formulaire de demande de devis | oui |
| `/mentions-legales/` | Mentions légales (modèle à compléter) | non |
| `/confidentialite/` | Politique de confidentialité, RGPD et nLPD suisse (modèle à compléter) | non |
| `/cgv/` | Conditions générales de vente, professionnels uniquement (modèle à compléter et à faire relire) | non |

Les pages légales restent en `noindex` tant que des éléments `[À COMPLÉTER]` y figurent.
`dist/sitemap.xml` ne liste que les pages indexées.

## Démonstrations fictives

Cinq sites complets de cinq pages, pour des entreprises **qui n'existent pas** : bandeau
« Démonstration fictive réalisée par Atousy » sur chaque page, `noindex`, photos générées par IA
(dit sur `/exemples/`). Gabarit commun : `src/layouts/DemoLayout.astro` (bandeau, lien
« Aller au contenu », retour à Atousy) ; composants de chaque marque dans `src/components/demos/<id>/`.

| Démo | Métier | Adresse | Pages |
|---|---|---|---|
| Rivage | Paysagiste | `/exemples/rivage/` | Accueil, Notre approche, Savoir-faire, Votre jardin, Nous contacter |
| Faîtage | Charpentier | `/exemples/faitage/` | Accueil, Réalisations, Savoir-faire, L'atelier, Contact |
| Écluse | Plombier-chauffagiste | `/exemples/ecluse/` | Accueil, Services, Réalisations, Entretien, Contact |
| Lueur | Électricien | `/exemples/lueur/` | Accueil, Prestations, Réalisations, Conseils, Contact |
| Moellon | Maçon, rénovation | `/exemples/moellon/` | Accueil, Savoir-faire, Chantiers, Notre approche, Contact |

## Prix et pays

Prix de travail : 1 490 € (Europe · EUR) et 1 990 CHF (Suisse · CHF), avec « Tarif indicatif · Taxes et
montant final à confirmer au devis ». Offre réservée aux professionnels. Valeurs dans `src/data/site.ts`.

Ordre de priorité :
1. **Choix manuel** du visiteur dans le menu (mémorisé sur son appareil) : il l'emporte toujours.
2. **Pays détecté côté serveur** : `functions/_middleware.js` pose `data-market` sur `<html>` avant
   l'envoi de la page, d'après le pays fourni par Cloudflare. Un visiteur en Suisse ne voit que le prix
   en CHF, dès le premier affichage et même sans JavaScript.
3. **Repli** : si la page arrive sans détection, le navigateur interroge `/api/pays` une fois par session.
4. **Europe · EUR par défaut**, avec la mention « par défaut » visible. Sans détection et sans
   JavaScript, les deux prix s'affichent.

Les prix ne s'affichent que par le composant `src/components/Price.astro`.

## Choix technique

- **Astro 7, export 100 % statique** : `npm run build` produit `dist/`, du HTML et du CSS ordinaires.
  Aucun framework n'est envoyé au navigateur ; seuls quelques petits scripts (menus mobiles,
  sélecteur de pays, carrousel du hero, formulaire) sont chargés. Astro partage l'en-tête, le pied de
  page et les blocs entre les 36 pages (11 pour le site, 25 pour les démos) et produit au build des
  images légères (AVIF/WebP) en plusieurs tailles.
- **Node ne sert qu'au build** (Node 24, voir `.nvmrc` ; au minimum 22.23.4). Aucun serveur Node permanent.
- **Cloudflare Pages** héberge `dist/`. Le travail côté serveur est fait par des **Pages Functions**
  (`functions/`) : le middleware du pays, `/api/pays` et `/api/devis` (formulaire). Les secrets restent
  dans les variables de Cloudflare, jamais dans le dépôt ni le navigateur.
- **Hero** : perspective CSS, pas une scène 3D interactive. Les fenêtres sont de vrais blocs HTML
  cliquables posés sur la photo d'architecture ; leur inclinaison suit le défilement horizontal
  dans les navigateurs qui le permettent (Chrome, Edge, Safari récents), sinon elle reste fixe.
  Avec « réduire les animations », tout reste fixe.
- **Polices auto-hébergées** (Figtree, Newsreader) : aucun appel à Google Fonts.
- **Après le build** (`astro.config.mjs`) : la Content-Security-Policy est ajoutée à `dist/_headers`
  avec l'empreinte des scripts en ligne, recalculée à chaque build, et `dist/sitemap.xml` liste les
  pages sans `noindex`. Détails : `docs/formulaire-et-fonctions.md`, « En-têtes de sécurité ».

## Commandes

```bash
nvm use            # Node 24 (ou toute version ≥ 22.23.4)
npm install        # installation
npm run dev        # développement : http://localhost:4321
npm run build      # export statique dans dist/
npm run preview    # prévisualiser dist/
npm test           # tests des fonctions (formulaire, pays, middleware) et de l'étape d'après-build
npm run cf:dev     # dist/ + fonctions en local avec wrangler (après npm run build)
```

## Structure

```
src/pages/            pages du site (voir « Pages ») et 404
src/pages/exemples/   démonstrations fictives Rivage, Faîtage, Écluse, Lueur, Moellon (5 pages chacune)
src/components/       en-tête, pied de page, prix, sections de l'accueil, formulaire de devis, démos
src/layouts/          gabarits (site, démos)
src/data/site.ts      navigation, marchés et prix
src/assets/photos/    photos sources (optimisées au build)
public/               logo, favicon, _headers (sécurité/cache), _routes.json (pages qui passent par les fonctions), robots.txt
functions/            Pages Functions (middleware du pays, /api/pays, /api/devis)
server/               logique partagée des fonctions (validation, Turnstile, e-mail, marché)
tests/                tests node:test
contenus/             textes des pages à relire et valider (Markdown), index dans contenus/README.md
docs/                 documentation (voir ci-dessous)
ressources/marque/    fichiers de marque d'origine (non publiés)
tasks/todo.md         plan de réalisation (fait / reste à faire)
```

## Documentation

- `docs/avant-lancement.md` : ce qui reste à fournir, raccorder et valider avant la mise en ligne.
- `docs/formulaire-et-fonctions.md` : formulaire, fonctions, variables et secrets, en-têtes de sécurité.
- `docs/obligations-suisse.md` : synthèse des obligations pour les clients en Suisse.
- `docs/apercus-prospects.md` : principe des aperçus privés pour les prospects.
- `contenus/README.md` : index des textes à valider et questions ouvertes.

## Déploiement sur Cloudflare Pages (à faire après validation — rien n'est publié)

- Projet Pages relié au dépôt, **répertoire racine** : `atousy`
- Commande de build : `npm run build` · Répertoire de sortie : `dist`
- Version de Node : lue dans `.nvmrc` (sinon variable `NODE_VERSION=24`)
- Variables et secrets : voir `docs/formulaire-et-fonctions.md` (ne jamais mettre une clé de test
  Turnstile en ligne : elle y est refusée)
- Réglages à faire dans Cloudflare avant la mise en ligne : *Fail open*, alertes du fournisseur
  d'e-mail, Access sur les aperçus, règle de débit sur `/api/devis` (même document, « Limiter les abus »)
- Domaine : ne modifier aucun DNS sans validation (voir `docs/avant-lancement.md`).
