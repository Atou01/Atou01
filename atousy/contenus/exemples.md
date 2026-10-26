---
page: /exemples/
title: "Exemples de sites vitrines, démos fictives | Atousy"
description: "Deux sites de démonstration fictifs créés par Atousy : Rivage, paysagiste, et Faîtage, charpentier. Cinq pages, mobile, contact : voyez notre façon de faire."
statut: brouillon à valider
---

# Deux métiers. Deux sites à part.

Rivage et Faîtage n’existent pas. Ce sont deux entreprises fictives, imaginées pour montrer notre façon de travailler.

## Parcourez les pages

Faites défiler les fenêtres. Cliquez sur l’une d’elles pour ouvrir la page de démonstration.

## Rivage — paysagiste

*Démonstration fictive.* Un paysagiste qui dessine des jardins naturels, pour toutes les saisons.

**Ce que la démo illustre :**

- 5 pages : Accueil, Notre approche, Savoir-faire, Votre jardin, Nous contacter ;
- un ton calme, une mise en page aérée ;
- des photos mises en valeur, légères à charger ;
- l’adaptation au mobile ;
- une page contact claire (formulaire désactivé) ;
- des encarts « Dans un vrai site » : coordonnées, vraies réalisations.

**Bouton :** Ouvrir la démo Rivage → /exemples/rivage/

## Faîtage — charpentier

*Démonstration fictive.* Un charpentier qui construit, rénove et agrandit en bois.

**Ce que la démo illustre :**

- 5 pages : Accueil, Réalisations, Savoir-faire, L’atelier, Contact ;
- des réalisations présentées projet par projet (projets inventés) ;
- un savoir-faire expliqué simplement ;
- un affichage pensé pour le téléphone ;
- une page contact qui va droit au but.

**Bouton :** Ouvrir la démo Faîtage → /exemples/faitage/

> À valider : relire cette liste quand la démo Faîtage sera terminée (pages, contenus, page contact).

## Ce que ces démos ne sont pas

Ce ne sont pas des sites de clients. Les noms, les textes et les projets sont inventés. Les photos ont été générées par intelligence artificielle.

Votre site sera construit avec vos informations et, de préférence, vos propres photos.

> À valider : vérifier qu’aucune entreprise proche n’utilise les noms « Rivage » ou « Faîtage ».

## Et le vôtre ?

Parlons de votre métier et de ce que votre site doit montrer.

**Bouton :** Demander un devis → /devis/
**Lien secondaire :** Voir l’offre → /offre/

---

## Textes d’interface des fenêtres (bande à faire défiler)

Demande du fondateur : pouvoir faire défiler toutes les fenêtres et cliquer sur une fenêtre pour arriver sur le site de démo.

**Aide sous la bande :**
- Ordinateur : « Faites défiler ou utilisez les flèches. Cliquez sur une fenêtre pour ouvrir la démo. »
- Mobile : « Glissez pour voir les autres pages. Touchez une fenêtre pour ouvrir la démo. »

**Libellé de chaque fenêtre** (visible sous la fenêtre) → page ouverte au clic :

| Libellé | Page |
| --- | --- |
| Rivage · Paysagiste — Accueil | /exemples/rivage/ |
| Rivage · Paysagiste — Notre approche | /exemples/rivage/approche/ |
| Rivage · Paysagiste — Savoir-faire | /exemples/rivage/savoir-faire/ |
| Rivage · Paysagiste — Votre jardin | /exemples/rivage/jardins/ |
| Rivage · Paysagiste — Nous contacter | /exemples/rivage/contact/ |
| Faîtage · Charpentier — Accueil | /exemples/faitage/ |
| Faîtage · Charpentier — Réalisations | /exemples/faitage/realisations/ |
| Faîtage · Charpentier — Savoir-faire | /exemples/faitage/savoir-faire/ |
| Faîtage · Charpentier — L’atelier | /exemples/faitage/atelier/ |
| Faîtage · Charpentier — Contact | /exemples/faitage/contact/ |

> À valider : les adresses suivent la navigation des démos (`src/components/demos/rivage/nav.ts` et `faitage/nav.ts`). Les 5 pages Faîtage existent ; relire la liste « Ce que la démo illustre ».

**Textes pour lecteurs d’écran :**
- Zone : « Démonstrations fictives : faites défiler les fenêtres, cliquez pour ouvrir un site »
- Lien de chaque fenêtre : « Ouvrir la démonstration fictive [libellé] »
- Boutons : « Fenêtre précédente » · « Fenêtre suivante »
- Position : « Fenêtre [n] sur [total] »

## Notes pour l’intégration (non affichées)

- Chaque fenêtre est un vrai lien : un clic, une touche ou Entrée au clavier ouvre la page de démo dans le même onglet. Le bandeau de la démo propose « Retour à Atousy » → /exemples/.
- Le défilement marche à la souris (molette, glisser), au doigt, au clavier (flèches) et avec les boutons précédent / suivant. Un glisser ne doit pas déclencher de clic.
- Toujours écrire « démonstration fictive » à côté du nom de la démo. Les pages de démo restent en noindex.
- Liens internes : /exemples/rivage/, /exemples/faitage/, /creation/, /refonte/, /offre/, /devis/.
