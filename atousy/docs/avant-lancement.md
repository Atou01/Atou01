# Avant le lancement — ce qui reste à fournir, raccorder et valider

Légende : **Prêt** = l'interface existe et fonctionne en local · **Raccordé** = fonctionne
réellement en ligne avec un compte configuré. Rien n'est publié ni raccordé à ce jour.

## 1. Données légales à fournir (fondateur)
- [ ] Dénomination / nom, statut juridique (micro-entreprise, SAS…)
- [ ] SIREN / SIRET, numéro RCS ou RNE le cas échéant
- [ ] Adresse du siège ou de domiciliation (affichée seulement dans les pages légales : mentions,
      confidentialité, CGV)
- [ ] Directeur / responsable de la publication
- [ ] Régime de TVA (franchise en base ou numéro de TVA intracommunautaire)
- [x] E-mail de contact : contact@atousy.com (affiché sur le site) — reste à tester l'envoi et la réception
- [ ] Hébergeur : Cloudflare (coordonnées à reporter dans les mentions légales)
- [ ] Durée de conservation des demandes de devis (politique de confidentialité)
- [ ] Visuels Genspark : vérifier en interne les conditions d'usage commercial (pas de mention sur le site, décision du fondateur)
- [ ] Décision HT / TTC : le site n'en affiche aucune, à trancher dans le devis
- [ ] Mention suisse affichée près du prix en CHF (« sans TVA suisse… impôt sur les acquisitions »)
      et mention « Offre réservée aux professionnels » : à faire valider par l'expert-comptable
- [ ] Écart 1 990 CHF / 1 490 € : garder par écrit la justification (coûts propres aux clients
      suisses), voir `docs/obligations-suisse.md` (règle contre la géodiscrimination). Ne jamais
      présenter une société suisse qui n'existe pas : si une entité suisse est créée, les mentions
      légales, les devis et la TVA suisse devront être revus
- [ ] Raison sociale, forme juridique, adresse et SIREN à reporter aussi dans les CGV (/cgv/), la
      politique de confidentialité et la mention sous le bouton du formulaire de devis

**Conditions générales de vente** (`/cgv/`, `contenus/cgv.md`) : chaque crochet visible sur la page
attend une décision.
- [ ] Date de version et durée de validité des devis (exemple affiché : 30 jours)
- [ ] Mention de TVA française des factures (avec l'expert-comptable)
- [ ] Devis en CHF : payable en CHF « valeur effective » si un compte en CHF existe, sinon facturé en EUR
- [ ] Échéancier (acompte, étape intermédiaire, solde), délai de paiement, IBAN/BIC, répartition des
      frais bancaires ; les travaux commencent-ils seulement après l'acompte ?
- [ ] Taux des pénalités de retard (au moins trois fois le taux d'intérêt légal) et indemnité de 40 €
      (à faire valider par l'expert-comptable) ; délai de relance avant suspension des travaux
- [ ] Délais de validation des étapes et de recette, conséquences d'une absence de réponse prolongée
- [ ] Portée des deux séries de corrections (maquette, site avant mise en ligne, ou les deux)
- [ ] Liste des accès remis à la livraison ; accompagnement pour le domaine et l'hébergement (compris ou facturé)
- [ ] Propriété intellectuelle : éléments cédés, supports visés, formalisme de la cession, remise ou
      non des fichiers sources
- [ ] Résiliation : indemnité éventuelle et délai après mise en demeure
- [ ] Modèle d'accord de sous-traitance des données personnelles, annexé au contrat quand Atousy héberge
      ou maintient le site du client, ou accède aux demandes reçues par son formulaire
- [ ] Ville du tribunal compétent

**Politique de confidentialité et mention du formulaire** (RGPD et nLPD suisse, `/confidentialite/`,
`/devis/`)
- [ ] Date de mise à jour de la politique
- [ ] Fournisseur de la boîte contact@atousy.com, son pays et la base du transfert
- [ ] Service d'envoi des e-mails retenu (Brevo ou Resend) : une seule ligne dans le tableau des
      prestataires, le même nom dans la mention sous le bouton du formulaire
- [ ] Certification Data Privacy Framework de Cloudflare : vérifier qu'elle est active sur dataprivacyframework.gov
- [ ] Paragraphe « Prospection » : à remplir si Atousy, ou Instinct pour son compte, contacte des
      professionnels qui n'ont rien demandé (données, source, but, durée, opposition) ; sinon le supprimer
- [ ] Liste réelle des cookies et du stockage, relevée après la mise en ligne (Cloudflare, Turnstile)

## 2. Raccordements (fondateur + Instinct)
| Élément | État | Ce qui manque |
|---|---|---|
| Hébergement Cloudflare Pages | Prêt (build OK) | Compte Cloudflare, création du projet, validation avant publication |
| Domaine atousy.com (IONOS) | Non raccordé | Choix : DNS chez Cloudflare (recréer les réglages mail IONOS) ou `www` seul + redirection depuis IONOS. Aucun DNS modifié |
| Détection du pays (`functions/_middleware.js`, repli `/api/pays`) | Prêt, testé avec pays simulés | Ne fonctionne réellement qu'une fois déployé sur Cloudflare |
| Formulaire `/api/devis` | Prêt, testé (tests + wrangler local) | Choix du service d'envoi (Brevo ou Resend), clé API, enregistrements SPF/DKIM sur atousy.com |
| Anti-spam Turnstile | Prêt (clés de test officielles) | Création du widget Turnstile, clé publique au build, clé secrète en secret Cloudflare |
| Boîte contact@atousy.com | Créée chez IONOS | Test d'envoi/réception de bout en bout |
| Obligations suisses | Synthèse prête (`docs/obligations-suisse.md`) ; section « Personnes en Suisse », mention sous le formulaire et CGV intégrées au site | Éléments à fournir (§ 1), règles de prospection pour Instinct |
| Aperçus privés prospects | Guide prêt (`docs/apercus-prospects.md`) | Projet Pages séparé + Cloudflare Access |

## 3. Validations (fondateur)
- [ ] Fidélité de la page d'accueil à la maquette (ordinateur et téléphone)
- [ ] Textes des pages (`contenus/*.md`) et points marqués « À valider »
- [ ] Offre : prix de travail, contenu du socle, livrables SEO, 30 jours de correction des anomalies
- [ ] Noms des démonstrations « Rivage », « Faîtage », « Écluse », « Lueur » et « Moellon » (vérifier
      qu'aucune entreprise proche ne les utilise)
- [ ] Texte sur fond corail en marine plutôt qu'en blanc (choix d'accessibilité, réversible)
- [ ] Corail des titres en `#DE6145` (et `#D9593D` sur le hero ordinateur, posé sur la photo) au lieu
      du `#F07A5F` de la maquette : choisi pour le contraste (au moins 3:1 en grand corps). Le `#F07A5F`
      reste pour les boutons, filets et soulignements
- [ ] Anneau de focus (navigation au clavier) marine avec un liseré clair, au lieu du corail
- [ ] Composition du hero : titre, texte et boutons à gauche ; à droite, sur la photo d'architecture,
      le carrousel des cinq fenêtres en perspective (une par démo fictive, légende et flèches)
- [ ] Rameau d'olivier de la galerie, redessiné en vectoriel (`src/assets/deco/olivier.svg`)
- [ ] Modèle de CGV (`/cgv/`) complété (§ 1), puis relu par un avocat et par l'expert-comptable avant
      d'être joint aux devis
- [ ] Mise en ligne

## 4. Tests encore nécessaires après raccordement
- [ ] Envoi réel d'une demande de devis jusqu'à contact@atousy.com (et réponse au visiteur via Reply-To)
- [ ] Détection réelle du pays depuis la France et la Suisse
- [ ] Turnstile avec les vraies clés (succès, échec, expiration)
- [ ] Lighthouse / PageSpeed sur l'URL publique, en-têtes `_headers` effectivement servis
- [ ] Vérification des aperçus prospects protégés (navigation privée, révocation)
