# Atousy — plan de réalisation

Référence visuelle : la maquette fournie (hero « Votre métier. Un site à part. », galerie,
bandeau marine de l'offre, méthode en 3 étapes, appel corail, pied de page).

## Étape 1 — Socle et page d'accueil
- [x] Projet Astro 7 (export statique `dist/`), Node 24, polices auto-hébergées (Figtree, Newsreader)
- [x] Charte : ivoire `#F8F4EE`, marine `#0F2329`, corail `#F07A5F` (logo et visuels Genspark) ; corail plus soutenu `#DE6145` pour les titres (contraste)
- [x] En-tête (sous-menu Services : Création / Refonte), sélecteur Europe · EUR / Suisse · CHF (détection automatique du pays), pied de page
- [x] Hero : photo d'architecture + carrousel de 5 fenêtres en perspective CSS, une par démo (défilement, glisser, flèches, clavier ; clic = démo)
- [x] Galerie (aperçus Rivage et Faîtage, lien vers les cinq démos), bandeau offre avec prix du marché choisi, méthode, appel au devis
- [x] Mobile, tablette, ordinateur vérifiés à l'écran ; réduction des animations respectée
- [x] Zones desservies retirées du site (décision du fondateur)

## Étape 2 — Pages et démos (workflow d'agents)
- [ ] Textes des pages (contenus/*.md) à valider par le fondateur
- [x] Pages Création, Refonte, Exemples, Offre, Méthode, Devis
- [x] Pages légales Mentions légales, Confidentialité (RGPD + nLPD), CGV : modèles en `noindex`, crochets `[À COMPLÉTER]` à remplir
- [x] Cinq démos de 5 pages (Rivage, Faîtage, Écluse, Lueur, Moellon), bandeau « démonstration fictive », noindex, un seul lien « Aller au contenu »

## Étape 3 — Formulaire et fonctions
- [x] Pays : posé côté serveur (`functions/_middleware.js`), repli `/api/pays`, Europe · EUR par défaut visible, choix manuel prioritaire
- [x] /api/devis (validation, anti-spam, Turnstile vérifié côté serveur, envoi par Brevo ou Resend)
- [x] Page Devis : attente, erreur, réussite sans perte de saisie ; jamais de fausse confirmation
- [x] Tests automatisés (`npm test`) + essai de bout en bout avec wrangler

## Étape 4 — Vérification et livraison
- [x] Relecture critique (workflow) : brief, honnêteté, accessibilité, performance, rendu ; 80 corrections vérifiées, puis reliquats
- [x] Build final, guide court (README.md), liste de ce qui reste avant lancement (docs/avant-lancement.md)

## Étape 5 — Avant la mise en ligne (fondateur + Instinct, détail dans docs/avant-lancement.md)
- [ ] Données légales et décisions des CGV et de la politique de confidentialité (crochets visibles sur les pages)
- [ ] Relecture des CGV par un avocat et par l'expert-comptable
- [ ] Validations : maquette, textes, noms des cinq démos, couleurs d'accent, anneau de focus, composition du hero
- [ ] Raccordements : projet Cloudflare Pages, domaine, service d'envoi d'e-mails, Turnstile
- [ ] Tests après raccordement : envoi réel d'un devis, détection réelle du pays, Turnstile, Lighthouse
- [ ] Mise en ligne
