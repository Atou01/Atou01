# Atousy — site vitrine

Site du studio Atousy (« studio web & design ») : création et refonte de sites vitrines
pour artisans, TPE et PME. Réalisé d'après la maquette validée, avec les visuels Genspark.

## Choix technique

- **Astro 7, export 100 % statique** : `npm run build` produit `dist/`, du HTML et du CSS ordinaires.
  Aucun framework n'est envoyé au navigateur ; seuls quelques petits scripts (menu mobile,
  sélecteur de pays, carrousel du hero, formulaire) sont chargés.
  Astro sert à partager l'en-tête, le pied de page et les blocs entre une vingtaine de pages,
  et à produire au build des images légères (AVIF/WebP) en plusieurs tailles.
- **Node ne sert qu'au build** (Node 24, voir `.nvmrc`). Aucun serveur Node permanent.
- **Cloudflare Pages** héberge `dist/`. Les deux traitements côté serveur sont des
  **Pages Functions** dans `functions/` : `/api/pays` (pays du visiteur) et `/api/devis` (formulaire).
  Les secrets restent dans les variables de Cloudflare, jamais dans le dépôt ni le navigateur.
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
npm test           # tests des fonctions (formulaire, pays) et de l'étape d'après-build
npm run cf:dev     # dist/ + fonctions en local avec wrangler (après npm run build)
```

## Structure

```
src/pages/            pages du site (Accueil, Création, Refonte, Exemples, Offre, Méthode, Devis, légales)
src/pages/exemples/   démonstrations fictives Rivage, Faîtage, Écluse, Lueur, Moellon (noindex, bandeau « fictif »)
src/components/       en-tête, pied de page, prix, sections de l'accueil, démos
src/layouts/          gabarits (site, démos)
src/assets/photos/    photos sources (optimisées au build)
public/               logo, favicon, _headers (sécurité/cache), _routes.json (pages qui passent par les fonctions), robots.txt
functions/            Pages Functions (/api/pays, /api/devis)
server/               logique partagée des fonctions (validation, Turnstile, e-mail)
tests/                tests node:test
contenus/             textes des pages à valider (Markdown)
docs/                 formulaire et fonctions, aperçus prospects, avant lancement
ressources/marque/    fichiers de marque d'origine (non publiés)
```

## Prix et pays

Prix de travail : 1 490 € (Europe · EUR) et 1 990 CHF (Suisse · CHF), avec « Tarif indicatif · Taxes et
montant final à confirmer au devis ». Offre réservée aux professionnels. Ordre de priorité : choix
manuel du visiteur (mémorisé sur son appareil, modifiable dans le menu) › pays détecté par Cloudflare
et posé sur la page avant son envoi (`functions/_middleware.js`) › Europe · EUR par défaut, avec la
mention « par défaut » visible. Un visiteur détecté en Suisse ne voit que le prix en CHF, même sans
JavaScript ; sans détection et sans JavaScript, les deux prix s'affichent. Les valeurs sont dans
`src/data/site.ts`.

## Déploiement sur Cloudflare Pages (à faire après validation — rien n'est publié)

- Projet Pages relié au dépôt, **répertoire racine** : `atousy`
- Commande de build : `npm run build` · Répertoire de sortie : `dist`
- Version de Node : lue dans `.nvmrc` (sinon variable `NODE_VERSION=24`)
- Variables et secrets : voir `docs/formulaire-et-fonctions.md` (ne jamais mettre une clé de test
  Turnstile en ligne : elle y est refusée)
- Réglages à faire dans Cloudflare avant la mise en ligne : *Fail open*, alertes du fournisseur
  d'e-mail, Access sur les aperçus, règle de débit sur `/api/devis` (même document, « Limiter les abus »)
- Domaine : ne modifier aucun DNS sans validation (voir `docs/avant-lancement.md`).

## État

Voir `docs/avant-lancement.md` : ce qui est prêt, ce qui est raccordé, et ce qui reste à faire.
