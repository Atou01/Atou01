# Aperçus personnalisés pour prospects — principe

Les démonstrations publiques (Rivage, Faîtage) sont fictives et visibles par tous.
Les futurs aperçus préparés pour un prospect réel sont autre chose : ils doivent rester privés.

## Ce qu'il faut (et pourquoi)
- **Un environnement séparé** : un projet Cloudflare Pages distinct (par exemple `atousy-apercus`),
  alimenté par un dépôt privé distinct. Le site vitrine et ses secrets n'y figurent pas.
- **Un vrai contrôle d'accès** : Cloudflare Access (Zero Trust) placé devant **tout le domaine**
  de ce projet (toutes les pages et toutes les ressources : images, CSS, JS).
  Un lien « non listé » ou une balise `noindex` ne protège rien : n'importe qui ayant le lien y accède.
- **Révocable** : l'accès est accordé par adresse e-mail (code à usage unique) et se retire
  en supprimant l'adresse de la règle ; la durée de session est courte.

## Mise en place (à faire avec le compte Cloudflare, rien n'est fait ici)
1. Créer le projet Pages `atousy-apercus` relié au dépôt privé des aperçus.
2. Dans Zero Trust › Access, créer une application « self-hosted » pour le domaine des aperçus
   (par exemple `apercus.atousy.com`) **et** pour `*.atousy-apercus.pages.dev`
   (déploiements de prévisualisation inclus). Chemin : tout le domaine.
3. Règle : « Allow » pour les e-mails des personnes autorisées (le prospect, Instinct, le fondateur),
   méthode de connexion « One-time PIN ». Durée de session : quelques heures.
4. Un sous-dossier par prospect (`/nom-du-prospect/`) ; pour isoler deux prospects l'un de l'autre,
   créer une application Access par chemin ou par sous-domaine.
5. Tester en navigation privée : sans autorisation, aucune page ni image ne doit être accessible.

## Limites à connaître
- Le code envoyé au navigateur (HTML, CSS, JS, images) reste lisible par les personnes autorisées.
  Ne jamais y mettre de secret.
- Le libellé exact des menus du tableau de bord Cloudflare peut évoluer : vérifier au moment de la mise en place.
- L'offre Zero Trust gratuite couvre un petit nombre d'utilisateurs : vérifier les limites en vigueur
  avant de l'utiliser (aucun abonnement payant sans accord du fondateur).
