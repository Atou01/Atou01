# Avant le lancement — ce qui reste à fournir, raccorder et valider

Légende : **Prêt** = l'interface existe et fonctionne en local · **Raccordé** = fonctionne
réellement en ligne avec un compte configuré. Rien n'est publié ni raccordé à ce jour.

## 1. Données légales à fournir (fondateur)
- [ ] Dénomination / nom, statut juridique (micro-entreprise, SAS…)
- [ ] SIREN / SIRET, numéro RCS ou RNE le cas échéant
- [ ] Adresse du siège ou de domiciliation (non affichée ailleurs que dans les mentions légales)
- [ ] Directeur / responsable de la publication
- [ ] Régime de TVA (franchise en base ou numéro de TVA intracommunautaire)
- [ ] E-mail de contact officiel (contact@atousy.com une fois testée) — téléphone facultatif
- [ ] Hébergeur : Cloudflare (coordonnées à reporter dans les mentions légales)
- [ ] Durée de conservation des demandes de devis (politique de confidentialité)
- [ ] Crédits : visuels générés par IA (Genspark) — vérifier les conditions d'usage commercial
- [ ] Décision HT / TTC : le site n'en affiche aucune, à trancher dans le devis

## 2. Raccordements (fondateur + Instinct)
| Élément | État | Ce qui manque |
|---|---|---|
| Hébergement Cloudflare Pages | Prêt (build OK) | Compte Cloudflare, création du projet, validation avant publication |
| Domaine atousy.com (IONOS) | Non raccordé | Choix : DNS chez Cloudflare (recréer les réglages mail IONOS) ou `www` seul + redirection depuis IONOS. Aucun DNS modifié |
| Détection du pays `/api/pays` | Prêt, testé avec pays simulés | Ne fonctionne réellement qu'une fois déployé sur Cloudflare |
| Formulaire `/api/devis` | Prêt, testé (tests + wrangler local) | Choix du service d'envoi (Brevo ou Resend), clé API, enregistrements SPF/DKIM sur atousy.com |
| Anti-spam Turnstile | Prêt (clés de test officielles) | Création du widget Turnstile, clé publique au build, clé secrète en secret Cloudflare |
| Boîte contact@atousy.com | Créée chez IONOS | Test d'envoi/réception de bout en bout |
| Aperçus privés prospects | Guide prêt (`docs/apercus-prospects.md`) | Projet Pages séparé + Cloudflare Access |

## 3. Validations (fondateur)
- [ ] Fidélité de la page d'accueil à la maquette (ordinateur et téléphone)
- [ ] Textes des pages (`contenus/*.md`) et points marqués « À valider »
- [ ] Offre : prix de travail, contenu du socle, livrables SEO, 30 jours de correction des anomalies
- [ ] Noms des démonstrations « Rivage » et « Faîtage » (vérifier qu'aucune entreprise proche ne les utilise)
- [ ] Texte sur fond corail en marine plutôt qu'en blanc (choix d'accessibilité, réversible)
- [ ] Mise en ligne

## 4. Tests encore nécessaires après raccordement
- [ ] Envoi réel d'une demande de devis jusqu'à contact@atousy.com (et réponse au visiteur via Reply-To)
- [ ] Détection réelle du pays depuis la France et la Suisse
- [ ] Turnstile avec les vraies clés (succès, échec, expiration)
- [ ] Lighthouse / PageSpeed sur l'URL publique, en-têtes `_headers` effectivement servis
- [ ] Vérification des aperçus prospects protégés (navigation privée, révocation)
