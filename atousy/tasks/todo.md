# Atousy — plan de réalisation

Référence visuelle : la maquette fournie (hero « Votre métier. Un site à part. », galerie,
bandeau marine de l'offre, méthode en 3 étapes, appel corail, pied de page).

## Étape 1 — Socle et page d'accueil
- [x] Projet Astro 7 (export statique `dist/`), Node 24, polices auto-hébergées (Figtree, Newsreader)
- [x] Charte : ivoire `#F8F4EE`, marine `#0F2329`, corail `#F07A5F` (logo et visuels Genspark)
- [x] En-tête (sous-menu Services : Création / Refonte), sélecteur France · EUR / Suisse · CHF, pied de page
- [x] Hero : photo d'architecture + carrousel de 5 fenêtres en perspective CSS (défilement, glisser, flèches, clavier ; clic = démo)
- [x] Galerie Rivage / Faîtage, bandeau offre avec prix du marché choisi, méthode, appel au devis
- [x] Mobile, tablette, ordinateur vérifiés à l'écran ; réduction des animations respectée
- [x] Zones desservies retirées du site (décision du fondateur)

## Étape 2 — Pages et démos (workflow d'agents)
- [ ] Textes des pages (contenus/*.md) à valider par le fondateur
- [ ] Pages Création, Refonte, Exemples, Offre, Méthode, Mentions légales, Confidentialité
- [ ] Démo Rivage (5 pages) et démo Faîtage (5 pages), bandeau « démonstration fictive », noindex

## Étape 3 — Formulaire et fonctions
- [ ] /api/pays (détection du pays, repli visible, choix manuel prioritaire)
- [ ] /api/devis (validation, anti-spam, Turnstile vérifié côté serveur, envoi par Brevo ou Resend)
- [ ] Page Devis : attente, erreur, réussite sans perte de saisie ; jamais de fausse confirmation
- [ ] Tests automatisés + essai de bout en bout avec wrangler

## Étape 4 — Vérification et livraison
- [ ] Relecture critique (workflow) : brief, honnêteté, accessibilité, performance, rendu
- [ ] Build final, guide court, liste de ce qui reste avant lancement (docs/avant-lancement.md)
