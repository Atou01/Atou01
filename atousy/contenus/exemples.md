---
page: /exemples/
title: "Exemples de sites vitrines, démos fictives | Atousy"
description: "Cinq sites de démonstration fictifs créés par Atousy : paysagiste, charpentier, plombier-chauffagiste, électricien et maçon. Voyez notre façon de faire."
statut: brouillon à valider
---

# Cinq métiers. Cinq sites à part.

*Étiquette au-dessus du titre :* Démonstrations fictives

Rivage, Faîtage, Écluse, Lueur et Moellon n’existent pas. Ce sont cinq entreprises fictives, imaginées pour montrer notre façon de travailler.

## Parcourez les démos

Faites glisser la bande ou utilisez les flèches. Cliquez sur une fenêtre pour ouvrir la démo.

La bande montre une fenêtre par démo : l’accueil de chaque site, dans l’ordre Rivage, Faîtage, Écluse, Lueur, Moellon. Chaque fenêtre ouvre l’accueil de la démo.

## Rivage — paysagiste

*Démonstration fictive.* Un paysagiste qui dessine des jardins naturels, pour toutes les saisons.

**Bouton :** Ouvrir la démo Rivage → /exemples/rivage/

**Ce que la démo illustre :**

- 5 pages : Accueil, Notre approche, Savoir-faire, Votre jardin, Nous contacter ;
- un ton calme, une mise en page aérée ;
- des photos mises en valeur, légères à charger ;
- l’adaptation au mobile ;
- une page contact claire (formulaire désactivé) ;
- des encarts « Dans un vrai site » : coordonnées, vraies réalisations.

## Faîtage — charpentier

*Démonstration fictive.* Un charpentier qui construit, rénove et agrandit en bois.

**Bouton :** Ouvrir la démo Faîtage → /exemples/faitage/

**Ce que la démo illustre :**

- 5 pages : Accueil, Réalisations, Savoir-faire, L’atelier, Contact ;
- des réalisations présentées projet par projet (projets inventés) ;
- un savoir-faire expliqué simplement ;
- un affichage pensé pour le téléphone ;
- une page contact qui va droit au but.

## Écluse — plombier-chauffagiste

*Démonstration fictive.* Un plombier-chauffagiste qui explique avant d’intervenir, de la petite fuite au chauffage complet.

**Bouton :** Ouvrir la démo Écluse → /exemples/ecluse/

**Ce que la démo illustre :**

- 5 pages : Accueil, Services, Réalisations, Entretien, Contact ;
- des services présentés un par un, avec un accès direct à chacun ;
- des réalisations racontées en trois temps : le besoin, l’intervention, le résultat (projets types) ;
- une page entretien avec des questions fréquentes ;
- un formulaire qui aide à décrire la situation : sujet, appareil, photos (formulaire désactivé).

## Lueur — électricien

*Démonstration fictive.* Un électricien qui rénove, sécurise et met en lumière les maisons.

**Bouton :** Ouvrir la démo Lueur → /exemples/lueur/

**Ce que la démo illustre :**

- 5 pages : Accueil, Prestations, Réalisations, Conseils, Contact ;
- une ambiance du soir, sombre et chaleureuse ;
- des prestations détaillées une à une ;
- des réalisations présentées comme projets types ;
- une page de conseils pratiques pour la maison ;
- une page contact qui aide à préparer la demande (formulaire désactivé).

## Moellon — maçon / rénovation

*Démonstration fictive.* Un maçon qui rénove les maisons anciennes en pierre et les agrandit.

**Bouton :** Ouvrir la démo Moellon → /exemples/moellon/

**Ce que la démo illustre :**

- 5 pages : Accueil, Savoir-faire, Chantiers, Notre approche, Contact ;
- une mise en page éditoriale, aux tons de pierre et de terre cuite ;
- des chantiers détaillés : travaux, matériaux, point clé (projets types) ;
- un schéma qui explique une technique : la coupe d’un mur et d’une dalle ;
- une approche en étapes, avec des questions fréquentes ;
- une page contact claire (formulaire désactivé).

## Ce que ces démos ne sont pas

Ce ne sont pas des sites de clients. Les noms, les textes et les projets sont inventés. Les photos ont été générées par intelligence artificielle.

Votre site sera construit avec vos informations et, de préférence, vos propres photos.

**Liens :** Voir l’offre → /offre/ · Création de site → /creation/ · Refonte de site → /refonte/

> À valider : vérifier qu’aucune entreprise proche n’utilise les noms « Rivage », « Faîtage », « Écluse », « Lueur » ou « Moellon ».

## Et le vôtre ?

Parlons de votre métier et de ce que votre site doit montrer.

**Bouton :** Demander un devis → /devis/

---

## Textes d’interface des fenêtres (bande à faire défiler)

Demande du fondateur : pouvoir faire défiler toutes les fenêtres et cliquer sur une fenêtre pour arriver sur le site de démo. Avec cinq démos, la bande montre l’accueil de chacune ; les cinq pages de chaque démo sont listées dans sa fiche.

**Aide au-dessus de la bande :**
- Ordinateur : « Faites glisser la bande ou utilisez les flèches. Cliquez sur une fenêtre pour ouvrir la démo. »
- Ordinateur, sans JavaScript : « Faites défiler la bande pour voir les autres démos. Cliquez sur une fenêtre pour ouvrir la démo. »
- Mobile : « Glissez pour voir les autres démos. Touchez une fenêtre pour ouvrir la démo. »

**Libellé de chaque fenêtre** (visible sous la fenêtre, avec « Démonstration fictive ») → page ouverte au clic :

| Libellé | Page |
| --- | --- |
| Rivage · Paysagiste | /exemples/rivage/ |
| Faîtage · Charpentier | /exemples/faitage/ |
| Écluse · Plombier-chauffagiste | /exemples/ecluse/ |
| Lueur · Électricien | /exemples/lueur/ |
| Moellon · Maçon / rénovation | /exemples/moellon/ |

Chaque fenêtre reprend l’ouverture réelle de la démo : son titre, son texte, son bouton, son logo et sa photo.

**Sous la bande :** un compteur des fenêtres affichées (« 1–2 / 5 » sur ordinateur, « 1 / 5 » sur mobile), une barre de progression et les boutons précédent / suivant.

> À valider : les adresses suivent la navigation des démos (`src/components/demos/<démo>/nav.ts`).

**Textes pour lecteurs d’écran :**
- Zone : « Démonstrations fictives : faites défiler les fenêtres, cliquez pour ouvrir un site »
- Lien de chaque fenêtre : « Ouvrir la démonstration fictive [libellé] »
- Boutons : « Fenêtre précédente » · « Fenêtre suivante »
- Position, annoncée après un bouton ou une flèche : « Fenêtre [n] sur 5 : [libellé] »
- Fiches : « Les cinq démonstrations »

## Notes pour l’intégration (non affichées)

- Chaque fenêtre est un vrai lien : un clic, une touche ou Entrée au clavier ouvre l’accueil de la démo dans le même onglet. Le bandeau de la démo propose « Retour à Atousy » → /exemples/.
- Le défilement marche à la souris (glisser, Maj + molette), au pavé tactile, au doigt, au clavier (flèches, Début, Fin) et avec les boutons précédent / suivant. Un glisser ne doit pas déclencher de clic.
- Toujours écrire « démonstration fictive » à côté du nom de la démo. Les pages de démo restent en noindex.
- Liens internes : /exemples/rivage/, /exemples/faitage/, /exemples/ecluse/, /exemples/lueur/, /exemples/moellon/ et leurs pages, /creation/, /refonte/, /offre/, /devis/.
