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

## Commandes

```bash
nvm use            # Node 24 (ou toute version ≥ 22.23.4)
npm install        # installation
npm run dev        # développement : http://localhost:4321
npm run build      # export statique dans dist/
npm run preview    # prévisualiser dist/
npm test           # tests des fonctions (formulaire, pays)
npm run cf:dev     # dist/ + fonctions en local avec wrangler (après npm run build)
```

## Structure

```
src/pages/            pages du site (Accueil, Création, Refonte, Exemples, Offre, Méthode, Devis, légales)
src/pages/exemples/   démonstrations fictives Rivage et Faîtage (noindex, bandeau « fictif »)
src/components/       en-tête, pied de page, prix, sections de l'accueil, démos
src/layouts/          gabarits (site, démos)
src/assets/photos/    photos sources (optimisées au build)
public/               logo, favicon, _headers (sécurité/cache), robots.txt
functions/            Pages Functions (/api/pays, /api/devis)
server/               logique partagée des fonctions (validation, Turnstile, e-mail)
tests/                tests node:test
contenus/             textes des pages à valider (Markdown)
docs/                 formulaire et fonctions, aperçus prospects, avant lancement
ressources/marque/    fichiers de marque d'origine (non publiés)
```

## Prix et pays

Prix de travail : France 1 490 € · Suisse 1 990 CHF, avec « Tarif indicatif · Taxes et montant
final à confirmer au devis ». Ordre de priorité : choix manuel du visiteur (mémorisé sur son appareil)
› détection du pays par Cloudflare › France par défaut, avec la mention « par défaut » visible.
Sans JavaScript, les deux prix s'affichent. Les valeurs sont dans `src/data/site.ts`.

## Déploiement sur Cloudflare Pages (à faire après validation — rien n'est publié)

- Projet Pages relié au dépôt, **répertoire racine** : `atousy`
- Commande de build : `npm run build` · Répertoire de sortie : `dist`
- Version de Node : lue dans `.nvmrc` (sinon variable `NODE_VERSION=24`)
- Variables et secrets : voir `docs/formulaire-et-fonctions.md`
- Domaine : ne modifier aucun DNS sans validation (voir `docs/avant-lancement.md`).

## État

Voir `docs/avant-lancement.md` : ce qui est prêt, ce qui est raccordé, et ce qui reste à faire.
