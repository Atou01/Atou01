# Contenus des pages intérieures — à relire et valider

Textes en français des pages intérieures du site Atousy, à valider par le fondateur avant intégration.
Ce sont des contenus, pas du code. Chaque fichier commence par un en-tête (adresse de la page,
titre SEO, méta-description, statut), puis le H1, l’introduction, les sections, l’appel à l’action
et des notes pour l’intégration (non affichées sur le site).

Les points incertains sont signalés dans le texte par `> À valider : …`.
Les modèles légaux contiennent des `[À COMPLÉTER : …]` : aucun crochet ne doit être publié.

## Fichiers

| Fichier | Page | Rôle | Statut |
| --- | --- | --- | --- |
| `creation.md` | /creation/ | Création d’un site vitrine : pour qui, contenu, méthode, tarif | Brouillon à valider |
| `refonte.md` | /refonte/ | Signes, examen obligatoire du site actuel, ce qu’on garde / refait, redirections | Brouillon à valider |
| `offre.md` | /offre/ | Tarif des deux marchés, socle détaillé, livrables SEO, non inclus, corrections, 30 jours, FAQ | Brouillon à valider |
| `methode.md` | /methode/ | Les 3 étapes, ce dont nous avons besoin, ce que vous validez, délais au devis | Brouillon à valider |
| `exemples.md` | /exemples/ | Démos fictives Rivage et Faîtage, fenêtres à faire défiler et cliquer | Brouillon à valider |
| `devis.md` | /devis/ | Libellés, aides, exemples de saisie, mentions et tous les messages du formulaire | Brouillon à valider |
| `mentions-legales.md` | /mentions-legales/ | Modèle LCEN à compléter | Modèle à compléter |
| `confidentialite.md` | /confidentialite/ | Modèle RGPD + nLPD à compléter | Modèle à compléter |

Titres SEO : 60 caractères au plus, terminés par « | Atousy ». Méta-descriptions : 140 à 160 caractères.

## Règles suivies dans tous les textes

- Atousy n’a pas encore de client : aucun avis, témoignage, note, logo, chiffre, nombre d’années ou certification.
  Aucune promesse de positionnement dans Google.
- Les démos Rivage et Faîtage sont présentées comme fictives à chaque mention ; leurs photos sont dites générées par IA.
- Aucun nom de ville, de région ou de zone desservie. « France » et « Suisse » n’apparaissent que pour les deux
  tarifs et dans les textes légaux. La zone d’intervention est toujours celle du client.
- Tarif : 1 490 € (France) et 1 990 CHF (Suisse), toujours suivi de « Tarif indicatif · Taxes et montant final à
  confirmer au devis ». Jamais « HT », « TTC » ni « à partir de » (sauf la question de FAQ qui y répond honnêtement).
- Aucune durée promise, sauf les 30 jours de correction des anomalies après livraison.
- Ton : « vous », phrases courtes, concret, sans jargon.

## À valider par le fondateur

**Offre et tarif**
1. Prix de travail 1 490 € et 1 990 CHF.
2. Même tarif de base pour une refonte que pour une création ?
3. Domaine et hébergement : souscrits par le client à son nom, ou fournis et refacturés par Atousy ?
4. Les deux séries de corrections portent-elles sur la maquette, sur le site avant mise en ligne, ou les deux ?
5. Liste exacte de ce qui déclenche un devis complémentaire ; citer ou non des exemples de fonctions hors socle.
6. Où arrivent les demandes du formulaire d’un site client (adresse, service d’envoi, coût éventuel) ?
7. Cession des droits sur le site livré (code, textes, mise en page) : à écrire dans le devis ou des conditions générales.
8. Régime de TVA (le site n’affiche volontairement ni HT ni TTC).

**Refonte et méthode**
9. Examen du site actuel : à quel moment, à quelles conditions ? Ne pas écrire « gratuit » sans décision.
10. Redirections des anciennes adresses : comprises dans le socle ou chiffrées au devis ?
11. Validation de la version finale avant mise en ligne : accord écrit ?
12. Client sans logo ou sans photos : que propose-t-on (hors socle, sur devis, rien) ?

**Exemples**
13. Démo Faîtage (en cours de réalisation) : relire la liste « Ce que la démo illustre » quand elle sera terminée ; vérifier que ses 5 pages existent (Accueil, Réalisations, Savoir-faire, L’atelier, Contact).
14. Vérifier qu’aucune entreprise proche n’utilise les noms « Rivage » ou « Faîtage ».

**Devis**
15. « Gratuit et sans engagement » : à écrire seulement si c’est décidé.
16. contact@atousy.com : à afficher seulement quand la boîte est testée de bout en bout.
17. Pas de case de consentement sur le formulaire (base : mesures précontractuelles) : à confirmer.

**Légal**
18. Toutes les données de l’éditeur (dénomination, statut, SIREN/SIRET, adresse, directeur de la publication, TVA).
19. Coordonnées exactes de l’hébergeur Cloudflare (entité contractante, adresse, téléphone), relevées au moment de la publication.
20. Conditions d’usage commercial des visuels générés par IA (Genspark) et mention éventuellement exigée.
21. Durées de conservation des demandes de devis.
22. Prestataire d’envoi d’e-mails (Brevo ou Resend) et fournisseur de la boîte de réception ; garanties en cas de transfert hors UE / Suisse.
23. Liste réelle des cookies et du stockage après déploiement (Cloudflare, Turnstile).

## Questions ouvertes et écarts relevés

- **Libellé du marché euro** : le brief parle de « France · EUR », mais `src/data/site.ts` affiche
  « Europe · EUR » (et le pays « Europe »). Les textes suivent le brief (« France · EUR »). À trancher, puis aligner le code
  ou les textes. L’e-mail de devis (`server/email.js`) utilise déjà « France · EUR ».
- **Messages d’erreur du formulaire** : ceux de `devis.md` reprennent mot pour mot `server/devis.js`. Toute modification
  doit être faite aux deux endroits.
- **Pré-sélection du type de projet** : les boutons des pages Création et Refonte pointent vers `/devis/?type=creation`
  et `/devis/?type=refonte`. À confirmer côté intégration (sinon lien simple vers /devis/).
- **Fenêtres des exemples** : demande du fondateur — pouvoir faire défiler toutes les fenêtres et cliquer sur une fenêtre
  pour arriver sur la démo. `exemples.md` fournit les textes (aide au défilement, libellé de chaque fenêtre, textes pour
  lecteurs d’écran, boutons précédent / suivant) et la liste des 10 pages visées (5 Rivage, 5 Faîtage, d’après la navigation des démos). L’accueil a déjà ce principe avec 5 fenêtres.
- **Stockage de session** : en plus de `atousy-market` (stockage local), le code utilise `atousy-market-auto`
  (stockage de session). Les deux sont décrits dans `confidentialite.md`.
- **Typographie** : écrire les prix avec une espace insécable fine entre les milliers (1 490) et une espace insécable
  avant la devise (€, CHF).
