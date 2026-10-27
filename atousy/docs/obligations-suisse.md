# Atousy : ce que le droit suisse ajoute ou change (au 26 octobre 2026)

Ce document reprend uniquement les constats vérifiés pendant la recherche. Il ne contient aucune nouvelle analyse juridique. Le droit suisse **s'ajoute** à ce que vous faites déjà en France (mentions LCEN, politique RGPD, CGV B2B). Il ne le remplace pas.

**Abréviations utilisées**
- **nLPD / LPD** : loi fédérale suisse sur la protection des données. **OPDo** : son ordonnance d'application.
- **PFPDT** : Préposé fédéral à la protection des données et à la transparence, l'autorité suisse de protection des données.
- **LCD** : loi contre la concurrence déloyale. **OIP** : ordonnance sur l'indication des prix. **LTC** : loi sur les télécommunications.
- **LTVA** : loi sur la TVA. **AFC** : Administration fédérale des contributions.
- **CO** : Code des obligations.
- **IDE** : numéro d'entreprise suisse (CHE-…).
- **CSL** : Commission suisse pour la loyauté. C'est l'autorégulation de la publicité ; ses règles ne sont pas contraignantes.

---

## 1. En bref

- **Le droit suisse s'applique déjà à vous, même sans bureau en Suisse.**
  - La protection des données (nLPD) s'applique dès que vous traitez des données de personnes en Suisse : formulaire, prospection.
  - Les règles de concurrence déloyale et d'affichage des prix s'appliquent dès que vous visez le marché suisse : prix en CHF, prospection d'Instinct.
  - **Aucune inscription ni déclaration n'est requise aujourd'hui** : ni auprès du PFPDT, ni au registre du commerce suisse, ni à la TVA suisse.
- **Obligatoire pour le site :**
  - une mention courte sur les données sous le formulaire et une politique de confidentialité complétée (pays de chaque prestataire, droits suisses) ;
  - une information sur la mémorisation du pays dans le navigateur, avec son but et la façon de la refuser ;
  - une identité et une adresse de contact claires : vos mentions légales françaises suffisent si elles sont accessibles depuis la version suisse ;
  - une sécurité adaptée.
- **Non nécessaire :**
  - une bannière cookies (vous n'avez ni statistiques ni publicité) ;
  - un représentant en Suisse ;
  - un registre suisse des traitements ;
  - un conseiller à la protection des données ;
  - des CGV publiées sur le site ;
  - des étapes de commande en ligne, tant que rien ne se commande ni ne se paie sur le site.
- **Prix en CHF (sous condition) :**
  - Si la page s'adresse uniquement à des professionnels, l'OIP ne s'applique pas. Il faut alors l'écrire clairement.
  - Si des particuliers sont visés, « Tarif indicatif · Taxes et montant final à confirmer au devis » **n'est pas conforme**. Il faut un prix final, toutes taxes comprises.
  - Dans tous les cas, laissez le visiteur choisir sa version (pas de redirection forcée). Vous devez aussi pouvoir justifier tout écart entre le prix en CHF et le prix en EUR.
- **TVA suisse :**
  - Pas d'immatriculation tant que vous ne vendez en Suisse que de la création, de la refonte, du design ou du conseil sur mesure, **quel que soit votre chiffre d'affaires**.
  - N'écrivez jamais de TVA suisse sur vos documents. C'est le client suisse qui déclare, le cas échéant, l'impôt sur les acquisitions.
  - La situation change seulement si vous refacturez de l'hébergement ou de la maintenance automatisée à des clients suisses non assujettis **et** que votre chiffre d'affaires mondial atteint 100 000 CHF.
- **Prospection d'Instinct :**
  - Les e-mails envoyés en série exigent un consentement préalable, **même vers des entreprises**.
  - Avant chaque appel, il faut vérifier l'annuaire le jour même.
  - Atousy peut être tenue responsable de ce qu'Instinct fait pour son compte.
- **Devis et CGV :** aucune CGV n'est obligatoire. Pour les clients suisses, mettez dans le **devis signé** :
  - le droit applicable et le tribunal compétent ;
  - l'échéance de paiement et la devise ;
  - la mention sur la TVA.
- **Déplacements :** quelques rendez-vous ne posent pas de problème. Au-delà de **8 jours de travail en Suisse par année civile**, chaque mission doit être annoncée en ligne au moins 8 jours civils avant.

---

## 2. Pour le site

### Ce qui est obligatoire

| Élément | Ce qu'il faut faire |
|---|---|
| Mentions légales (identité et adresse de contact) — *obligatoire selon une lecture prudente* | Vos mentions légales françaises suffisent ; ce qu'il faut vérifier est détaillé sous le tableau. |
| Mention au moment de la collecte (formulaire de devis) | Sous le bouton d'envoi : qui traite les données, pourquoi, quels destinataires et dans quels pays, avec un lien vers la politique (texte proposé en section 3). Gardez aussi le lien dans le pied de page. Le PFPDT juge cette information en deux niveaux « indispensable ». |
| Politique de confidentialité | Une seule politique RGPD + nLPD suffit, à compléter (section 3). Le français suffit pour la Suisse romande. |
| Mémorisation du pays dans le navigateur (`atousy-market`, `atousy-market-auto`) | Expliquer dans la politique le but, la durée et la façon de refuser. Vérifiez d'abord que le site fonctionne quand le stockage est bloqué. |
| Sécurité | Voir la liste sous le tableau. |
| Allégations publicitaires | Rien d'inexact ni de trompeur : voir la liste sous le tableau. |

**Mentions légales : ce qu'il faut vérifier sur la version suisse**
- un lien accessible depuis toutes les pages ;
- la dénomination exacte (ou vos nom et prénom) et la forme juridique, identiques au RCS ou au RNE ;
- une adresse postale complète avec « France » (une boîte postale seule ne suffit pas) ;
- un e-mail affiché en clair.

Ni le téléphone ni le numéro SIREN ne sont exigés par le droit suisse. La portée exacte de cette règle pour un site sans commande en ligne est discutée, mais s'y conformer ne coûte rien.

**Sécurité**
- Activer la double authentification sur Cloudflare, sur Brevo ou Resend et sur la messagerie.
- Limiter l'accès à la boîte des devis.
- Garder HTTPS, les en-têtes de sécurité (`public/_headers`) et les clés API côté serveur.
- Faire des mises à jour régulières.
- Appliquer les durées de conservation, y compris la purge des demandes restées sans suite.
- Garder le téléphone facultatif et le moins de champs possible.

**Allégations publicitaires : à éviter**
- prix barrés, « -30 % » ou « valeur 3 000 CHF » sans base réelle ;
- « 2 fois moins cher que les agences suisses » sans preuve ;
- titres ou labels que vous ne détenez pas.

Conservez les preuves de chaque chiffre que vous affichez.

### Ce qui dépend de votre situation

| Élément | Condition | Ce qu'il faut faire |
|---|---|---|
| Cloudflare Turnstile (anti-spam) | Dès qu'il est en place | Aucun consentement n'est nécessaire, car c'est une mesure de sécurité. Il faut en revanche informer : données traitées, rôle de Cloudflare, pays (section 3). Chargez le script **uniquement sur /devis/**. Gardez le champ piège et le contrôle du temps de saisie. |
| Prestataires hors Suisse et UE (Cloudflare, Resend, messagerie) | Dès qu'ils reçoivent les données ou peuvent y accéder | Vérifier la base de chaque transfert et l'indiquer dans la politique. Accepter ou signer un contrat de sous-traitance (DPA) avec chacun. |
| Prix de 1 990 CHF | Dépend de la clientèle visée | Voir les deux options sous le tableau. |
| Détection du pays et version suisse | Probablement applicable (règle contre la « géodiscrimination ») | La détection reste une simple suggestion : sélecteur visible, ni blocage ni redirection forcée, choix du visiteur respecté. Alignez le prix en CHF sur la contre-valeur du prix en EUR, ou documentez par écrit les surcoûts propres aux clients suisses. Appliquez les mêmes conditions de paiement. Sanction civile uniquement. |
| Démos, exemples, témoignages, logos | Si vous en affichez | Voir la liste sous le tableau. |
| Allégations écologiques (« éco-conçu », « neutre en carbone ») | Si vous en utilisez | Les supprimer, ou les rendre précises et prouvées, avec la source citée. Évitez « neutre » et « zéro impact », et toute neutralité fondée sur la compensation. Le guide de l'Office fédéral de l'environnement (OFEV) date du 2 mars 2026. |

**Prix de 1 990 CHF : deux options**
- **Clientèle professionnelle uniquement.** Ajoutez près du prix :
  > Offre réservée aux professionnels (entreprises et indépendants). Prix en CHF, sans TVA suisse (Atousy, établie en France, n'est pas inscrite au registre suisse de la TVA ; clients assujettis : impôt sur les acquisitions à déclarer par vos soins). Montant définitif au devis.

  La mention « indicatif » reste admise entre professionnels si le prix correspond à une prestation réellement vendue à ce prix.
- **Si des particuliers sont visés.** Remplacez la mention par :
  > Dès CHF 1 990.– (prix final, toutes taxes comprises) pour un site vitrine de X pages comprenant […] ; options sur devis.

  Le prix doit inclure toute taxe réellement facturée. La sanction peut aller jusqu'à 20 000 CHF d'amende, et la négligence est aussi punissable.

**Démos et témoignages : ce qu'il faut faire**
- Placer une mention visible sur chaque démo, par exemple : « Démo fictive réalisée par Atousy à titre d'exemple ; ce n'est pas un client ».
- Séparer les démos des vraies réalisations, et ne jamais compter les démos parmi vos clients.
- Ne pas afficher de faux avis nominatifs.
- Vérifier que les noms d'entreprises inventés n'existent pas dans la région.

### Ce qui n'est pas nécessaire

| Élément | Commentaire |
|---|---|
| Bannière de consentement cookies | Pas tant qu'il n'y a ni outil d'audience ni traceur publicitaire. Si vous en ajoutez un plus tard : refus bien visible pour la Suisse et consentement préalable pour la France. Une seule bannière couvrira les deux. |
| Étapes de commande, correction des erreurs, confirmation par e-mail | Pas aujourd'hui. Ces règles s'appliqueront si vous ajoutez une commande, un paiement ou une acceptation de devis en ligne. Bonne pratique dès maintenant : un accusé de réception automatique du formulaire. |
| CGV publiées sur le site | Facultatif ; joignez-les plutôt au devis (section 4). |
| Représentant en Suisse pour les données | Les conditions ne sont pas remplies : il faudrait un traitement à grande échelle et à risque élevé. Notez en deux lignes pourquoi dans votre dossier. Rien à publier. |
| Registre suisse des traitements, analyse d'impact, conseiller à la protection des données | Il suffit de compléter votre registre RGPD avec les pays et les garanties pour les contacts suisses. |
| Déclaration au PFPDT, inscription au registre du commerce suisse | Aucune formalité. |

### Améliorations recommandées
- Ajouter près du sélecteur de pays la mention « votre choix est mémorisé dans votre navigateur – en savoir plus ».
- Ajouter un bouton « oublier mon choix ».
- Ne pas mémoriser la détection automatique si ce n'est pas nécessaire.

Ces mesures vous couvrent si la mémorisation du pays était jugée « non essentielle ».

**Sanctions possibles :**
- **nLPD :** amende jusqu'à 250 000 CHF, seulement pour des actes intentionnels, le plus souvent sur plainte. Elle vise en principe la personne responsable, donc vous si vous êtes en entreprise individuelle. Les poursuites contre une personne domiciliée en France sont incertaines en pratique ; c'est une interprétation.
- **Stockage dans le navigateur (LTC) :** amende jusqu'à 5 000 CHF, même par négligence.

---

## 3. Pour la politique de confidentialité

Fichier : `/home/user/Atou01/atousy/contenus/confidentialite.md`. Il est déjà intitulé RGPD et nLPD ; gardez une politique unique.

La nLPD protège les **personnes physiques**. C'est le cas des interlocuteurs de vos clients, des artisans en raison individuelle et des gérants : leurs nom, e-mail et téléphone professionnels sont des données personnelles.

### 3.1 Mention courte sous le bouton d'envoi du formulaire (nouveau)

> Les informations de ce formulaire (nom, e-mail, téléphone facultatif, activité, secteur, site actuel, besoins) sont traitées par [raison sociale exacte], [ville], France, pour répondre à votre demande de devis. Destinataires : nos prestataires d'hébergement, d'anti-spam et d'envoi d'e-mails — Cloudflare (États-Unis), [Brevo (France) / Resend (États-Unis)]. Détails, durées de conservation et vos droits : [Politique de confidentialité].

### 3.2 Ajouts à faire dans la politique

**1. Identité exacte du responsable :** nom ou raison sociale, adresse en France et e-mail dédié aux questions sur les données.

**2. Destinataires et pays.** Remplacez la note « À valider » par ce tableau :

| Prestataire | Rôle | Pays | Base du transfert |
|---|---|---|---|
| Cloudflare, Inc. | Hébergement du site, Turnstile | États-Unis | Organisation certifiée Swiss-U.S. Data Privacy Framework (DPF), *à vérifier sur dataprivacyframework.gov* |
| Brevo *(si retenu)* | Envoi des e-mails du formulaire | France | Pays dont le niveau de protection est reconnu adéquat |
| Resend *(si retenu)* | Envoi des e-mails du formulaire | États-Unis | Clauses types UE adaptées au droit suisse (DPA Resend du 31.12.2025, § 6.5) |
| [Fournisseur de contact@atousy.com] | Messagerie | [pays] | [base] |

Précisions sur ce tableau :
- Pour un pays adéquat ou une entreprise certifiée DPF, la loi n'exige que le **nom du pays**. La garantie n'est à citer que si vous utilisez des clauses types ou une dérogation.
- Ne prenez pas la dérogation « exécution du contrat » comme base principale.
- Gardez les clauses types dans vos contrats de sous-traitance (DPA) en solution de repli, au cas où le DPF tomberait.
- Une région d'hébergement « UE » chez une société américaine n'écarte pas forcément le transfert, si cette société peut accéder aux données. C'est une interprétation prudente.

**3. Paragraphe Turnstile** (texte proposé) :
> **Protection anti-spam.** Sur la page de demande de devis, nous utilisons Cloudflare Turnstile pour distinguer les humains des robots. Turnstile traite votre adresse IP, des informations sur votre navigateur (dont l'empreinte TLS), l'identifiant du site et l'origine de la requête. Cloudflare agit pour notre compte pour la détection des robots, et pour son propre compte pour améliorer Turnstile. Destinataire : Cloudflare, Inc., États-Unis (organisation certifiée Swiss-U.S. Data Privacy Framework). En savoir plus : [lien vers le Turnstile Privacy Addendum].

**4. Paragraphe « Cookies et stockage »** (texte proposé) :
> **Stockage dans votre navigateur.** Pour afficher les prix dans la bonne devise, le site enregistre votre pays dans votre navigateur : `atousy-market` (localStorage, conservé jusqu'à ce que vous l'effaciez) lorsque vous choisissez un pays, et `atousy-market-auto` (sessionStorage, effacé à la fermeture de l'onglet) pour la détection automatique. Vous pouvez refuser ou supprimer ce stockage dans les réglages de votre navigateur ; le site affichera alors le tarif par défaut.

Deux points à adapter :
- Si la valeur du pays est envoyée avec le formulaire, elle devient une donnée personnelle : dites-le.
- Après la mise en ligne, ajoutez les cookies réellement posés par Cloudflare et Turnstile.

**5. Durées de conservation :** remplissez les crochets, y compris la purge des demandes restées sans suite. La nLPD ne les exige pas dans la politique, mais vous devez les donner en réponse à une demande d'accès, et le RGPD les exige.

**6. Paragraphe « Personnes en Suisse »** (texte proposé) :
> **Personnes en Suisse.** Si vous vous trouvez en Suisse, la loi fédérale sur la protection des données (nLPD) s'applique également. Vous pouvez : demander gratuitement l'accès à vos données (réponse en règle générale sous 30 jours) ; demander leur remise ou leur transmission dans un format électronique courant lorsque les conditions légales sont remplies ; les faire rectifier ; demander l'arrêt d'un traitement, l'interdiction d'une communication ou l'effacement ; vous opposer à un traitement, notamment à la prospection. Contact : [e-mail dédié]. Autorité de surveillance en Suisse : Préposé fédéral à la protection des données et à la transparence (PFPDT), edoeb.admin.ch.

**7. Délai de réponse :** remplacez « dans un délai d'un mois » par :
> dans les meilleurs délais, au plus tard dans un délai d'un mois et jamais plus de 30 jours.

« 30 jours » seul ne suffit pas toujours pour le RGPD, car un mois commencé en février compte moins de 30 jours.

**8. Prospection** (recommandé si Instinct prospecte) : indiquez les catégories de données, leur source (sites, annuaires), le but, et comment s'y opposer. Cela complète l'information directe, qui reste obligatoire (section 6).

**9. Date de mise à jour.**

À ne pas ajouter : aucun représentant en Suisse à mentionner. La mention du PFPDT, déjà présente, est recommandée mais pas exigée. Les bases légales RGPD peuvent rester telles quelles.

### 3.3 Procédures internes à adapter

- **Demandes d'accès.** Prévoyez un modèle commun RGPD/nLPD qui contient :
  - les données traitées, leur but et leur durée de conservation ;
  - leur origine (formulaire ou prospection par Instinct) ;
  - les destinataires, les pays et les garanties.

  Délai interne : 30 jours au plus. Une participation aux frais (300 CHF au maximum) n'est possible qu'en cas d'effort disproportionné, et doit être annoncée avant de répondre.
- **Incidents.** Ajoutez cette étape à votre procédure RGPD : « Des personnes en Suisse sont-elles touchées, avec un risque élevé ou douteux ? Si oui, annonce au PFPDT sur databreach.edoeb.admin.ch, dans les meilleurs délais. »
  - Une notification à la CNIL ne remplace pas cette annonce.
  - Tenez un journal de tous les incidents (faits, effets, mesures prises), conservé au moins 2 ans.

---

## 4. Pour les devis, factures et CGV avec des clients suisses

### 4.1 Ce qui n'est pas obligatoire

- Le droit suisse n'impose **pas** d'avoir des CGV, ni de les publier. Elles ne lient le client que s'il les a acceptées. Une clause du devis l'emporte sur une clause contraire des CGV.
- Le prix affiché sur le site n'est pas une offre qui vous engage. Votre offre ferme est le **devis**, et le contrat est conclu quand le client l'accepte.

### 4.2 Le devis (à faire signer)

- **Identités :** votre identité complète et celle du client, avec l'adresse de son siège ou de son domicile en Suisse, et son numéro IDE (CHE-…) s'il en a un.
- **Usage professionnel :** une déclaration du type « Le client déclare agir dans le cadre de son activité professionnelle ».
- **Prestation :** description précise des livrables (pages, fonctionnalités, nombre de tours de corrections), durée de validité de l'offre (par exemple 30 jours), délais, garantie et support après la mise en ligne.
- **Paiement :**
  - prix forfaitaire et devise ;
  - lieu de paiement (IBAN/BIC) et répartition des frais bancaires ;
  - échéancier d'acomptes avec dates précises, par exemple 30 % / 40 % / 30 %.
- **TVA :** la mention suisse (section 5) et la mention française, à valider par votre expert-comptable.
- **Renvoi aux CGV datées**, jointes ou téléchargeables avant la signature :
  > Le client déclare avoir reçu, lu et accepté les conditions générales de prestation, version JJ/MM/AAAA.
- **Droit applicable** (recommandé, entre professionnels) :
  > Le présent contrat est régi par le droit français, à l'exclusion de ses règles de conflit de lois.

  Sans clause, le droit français s'appliquerait de toute façon entre professionnels, puisque vous êtes le prestataire. L'écrire évite des règles suisses moins favorables :
  - le client peut révoquer un mandat à tout moment ;
  - il peut abandonner un ouvrage en cours en payant le travail fait et en vous indemnisant ;
  - il n'existe pas d'indemnité forfaitaire légale de recouvrement.
- **Tribunal compétent**, à écrire dans le devis lui-même et pas seulement dans les CGV :
  > Tout litige relatif au présent contrat relève de la compétence exclusive des tribunaux de [ville], France. Atousy peut toutefois agir devant les tribunaux du siège ou du domicile du client en Suisse.

  Évitez « tout autre tribunal compétent ». Une acceptation par e-mail suffit pour que cette clause soit valable.
- **Signature :**
  - Pour conclure le contrat, un e-mail « bon pour accord » suffit.
  - Pour pouvoir recouvrer rapidement en Suisse, il faut une **signature manuscrite**, en conservant l'original papier, ou une **signature électronique qualifiée reconnue en Suisse** (SCSE/ZertES). Une signature qualifiée européenne (eIDAS) seule n'est pas automatiquement reconnue.

### 4.3 Les CGV entre professionnels

Vos CGV B2B françaises peuvent être réutilisées si elles couvrent les points suivants :
- formation du contrat et primauté du devis ;
- obligations du client (contenus, accès, délais de validation) ;
- **recette** : délai de vérification, acceptation tacite, procès-verbal de recette ;
- garantie de durée limitée ;
- **limitation de responsabilité**, mise en évidence (gras ou encadré, près de la signature), sans jamais exclure la faute grave ni le dol ;
- **propriété intellectuelle détaillée** :
  - objet et nature (cession ou licence) ;
  - droits visés, territoire et durée ;
  - transfert à complet paiement seulement ;
  - exclusion des éléments tiers (polices, banques d'images, plugins) ;
  - garantie du client sur ses propres contenus et photos ;
  - mention « Réalisé par Atousy » et usage en portfolio ;
  - remise ou non des sources.
- résiliation ou abandon par le client : paiement du travail fait et indemnité modérée, car un juge suisse réduit une pénalité excessive ;
- intérêts de retard ;
- droit applicable et tribunal.

Si vous faites appel à des freelances, obtenez d'abord leur cession de droits par écrit : vous ne pouvez céder que ce que vous détenez.

### 4.4 Si vous acceptez des particuliers suisses (usage privé)

- Le droit suisse protecteur peut alors s'appliquer. Le client peut agir en France ou en Suisse, mais **vous ne pourrez l'assigner qu'en Suisse**.
- Ne mettez **pas** de tribunal français, ni de choix de loi présenté comme exclusif.
- Prévoyez des conditions équilibrées. Les éléments suivants sont considérés comme déloyaux envers un consommateur :
  - un acompte non remboursable quelle que soit la cause ;
  - une exclusion totale de responsabilité ;
  - une modification unilatérale du prix ;
  - une résiliation réservée au seul prestataire.
- Demandez un acompte.
- **Droit de révocation de 14 jours.** Il s'applique seulement si le particulier a été démarché **par téléphone** ou **chez lui sans l'avoir demandé**, et si le contrat dépasse 100 CHF.
  - Il ne s'applique pas si le client a lui-même demandé un devis via le formulaire.
  - Si le droit s'applique : remettez avec le devis une information écrite et datée sur ce droit (forme libre, délai, votre adresse), et ne commencez pas avant la fin du délai.

### 4.5 Factures

Contenu recommandé (non imposé tant que vous n'êtes pas inscrite à la TVA suisse) :
- votre raison sociale et adresse (France), celles du client (Suisse) et son numéro IDE ;
- la date et la période de la prestation, avec une description (« conception et réalisation d'un site vitrine ») ;
- le montant ;
- la mention de non-inscription à la TVA suisse et d'impôt sur les acquisitions (section 5) ;
- la mention de TVA française validée par votre expert-comptable.

### 4.6 Paiement, retards, recouvrement

- **Devise :**
  - Si vous facturez en CHF et voulez être payée en CHF, écrivez « payable en CHF, valeur effective » et prévoyez un compte multidevise. Sinon, sous droit suisse, le client pourrait payer en EUR au cours du jour.
  - Facturer en EUR sur votre compte français supprime ce risque.
- **Retards :**
  - Indiquez une date d'échéance précise (« payable au plus tard le JJ/MM/AAAA »).
  - Sous droit suisse, l'intérêt de retard est d'au moins 5 % par an, et il n'existe pas d'équivalent légal aux 40 € français. Seule une clause pénale convenue en tient lieu.
  - Sous droit français, ce sont les mentions françaises qui s'appliquent ; à confirmer côté français.
- **Recouvrement en Suisse :**
  - Il passe par l'office des poursuites du domicile du client, avec un montant converti en CHF. Vous avancez les frais, qui restent à la charge du débiteur.
  - Si le client fait opposition, il vous faut le devis **signé** et la **preuve que vous avez exécuté votre travail** : procès-verbal de recette, e-mail d'acceptation, mise en ligne. Une facture non signée ou un e-mail ne suffit pas.
  - Autre voie : un jugement français, puis son exécution en Suisse (Convention de Lugano).

### 4.7 Hébergement ou maintenance de sites clients

Si vous hébergez ou maintenez le site d'un client, ou accédez aux données qu'il collecte, vous êtes son **sous-traitant** au sens de la nLPD.

**Obligatoire dans ce cas :** un accord de sous-traitance (DPA) valable pour la nLPD et le RGPD, annexé au contrat. Il fixe :
- l'objet et la durée du traitement ;
- les instructions du client ;
- les mesures de sécurité ;
- la liste des sous-traitants ultérieurs autorisés (Cloudflare, Brevo ou Resend…) ;
- la restitution ou suppression des données en fin de contrat ;
- les audits.

Prévoyez un contrat séparé de la création, avec une clause de réversibilité (remise des fichiers, accès et sauvegardes). Voir aussi la section 5, car l'hébergement a un impact sur la TVA.

### 4.8 Missions sur place en Suisse

Le travail à distance depuis la France n'est pas concerné. Les règles suivantes s'appliquent seulement en cas de présence physique en Suisse pour travailler.

- **Plus de 8 jours de travail par année civile** (compter chaque jour passé en Suisse pour une mission client) : chaque mission doit être annoncée en ligne au Secrétariat d'État aux migrations (SEM), **au moins 8 jours civils avant**, dimanches et jours fériés compris.
  - Au-delà de 90 jours par an, il faut une autorisation.
  - Pour un indépendant, cette procédure suppose la nationalité d'un pays de l'UE ou de l'AELE et un siège dans l'UE ou l'AELE.
  - En cas d'infraction, la sanction peut aller jusqu'à 5 000 CHF.
- **À emporter lors des déplacements :** le certificat A1 (demandé à l'URSSAF), une copie du devis signé et, le cas échéant, l'annonce.
- **Salariés envoyés en Suisse :** les conditions minimales suisses de travail s'appliquent. Les règles sur le salaire minimum et les vacances ne jouent qu'au-delà de 15 jours ouvrés par an (nombre de salariés × nombre de jours).
- **Changement en discussion :** le délai d'annonce pourrait passer à 4 jours de travail dans le cadre du paquet Suisse-UE. Ce changement n'est pas en vigueur.
- **Ateliers ou formations donnés sur place :** voir la section 5.

---

## 5. TVA suisse

### Le principe

La création d'un site pour un client suisse est considérée comme fournie **en Suisse**, au siège ou au domicile du client, même si vous travaillez depuis la France. Une réunion ponctuelle sur place ne change rien.

### Situation actuelle : pas d'immatriculation

Une entreprise étrangère qui ne fournit en Suisse que ce type de services est **libérée de la TVA suisse, quel que soit son chiffre d'affaires**. L'AFC donne un exemple proche : un conseiller fiscal allemand qui réalise environ 300 000 CHF de chiffre d'affaires et conseille un particulier zurichois n'a pas à s'inscrire.

- **Rien à faire :** ne demandez pas de numéro de TVA suisse.
- L'AFC recommande de remplir son **questionnaire d'assujettissement** en cas de doute. C'est facultatif ; à envisager si vous vendez de l'hébergement ou un forfait de maintenance.

### Ce qui ferait changer la situation (deux conditions cumulatives)

**1. Vous fournissez en Suisse une prestation non couverte par cette libération.** En pratique :
- de l'**hébergement**, une **location ou un abonnement de site** dont vous gardez la maîtrise, de la **télémaintenance** ou une maintenance largement automatisée, vendus à un client suisse **non assujetti** (particulier, petite entreprise non inscrite) ;
- une livraison de biens en Suisse ;
- un **atelier ou une formation donnés sur place en Suisse**. Si c'est de l'enseignement ou de la formation, la libération est maintenue ; sinon, elle est perdue. Vérifiez la qualification avant de vendre ce type de prestation.

La création sur mesure, adaptée au client par une personne, n'est pas un « service informatique ». Pour un client suisse **assujetti**, même l'hébergement reste couvert : c'est lui qui paie l'impôt sur les acquisitions.

**2. Votre chiffre d'affaires mondial (Suisse et étranger) atteint 100 000 CHF sur un an.**
- Il est converti en CHF et calculé hors taxe.
- Lors de votre première prestation de ce type en Suisse, il s'apprécie sur une prévision des 12 mois suivants. Si cette estimation est impossible, réexaminez-la au plus tard après 3 mois.

En dessous de 100 000 CHF, il n'y a aucune obligation, même si vous vendez de l'hébergement.

**Si les deux conditions sont réunies :**
1. Inscription en ligne obligatoire **dans les 30 jours**. L'assujettissement commence à la première prestation ; en cas d'acompte, à la date de la facture.
2. Désignation d'un **représentant fiscal en Suisse** (une fiduciaire). Une dispense est prévue par la loi depuis 2025, mais aucune pratique de l'AFC ne la décrit.
3. Facturation de la TVA suisse (**8,1 %** aujourd'hui) avec le numéro IDE TVA sur toutes les factures suisses, y compris aux professionnels.

### Le plus simple pour rester hors TVA suisse

- Ne refacturez pas l'hébergement, la location de site ni, par prudence, le nom de domaine aux clients suisses non assujettis. Le client les souscrit **à son nom**, et vous ne facturez que la conception et vos interventions humaines.
- Si vous vendez quand même un forfait « hébergement + maintenance » :
  - facturez à part la maintenance humaine faite sur demande ;
  - vérifiez sur uid.admin.ch si le client est inscrit à la TVA ;
  - suivez chaque année votre chiffre d'affaires mondial en CHF.

### L'impôt sur les acquisitions (côté client)

C'est le client suisse qui déclare et paie la TVA suisse sur vos services. **Vous n'avez rien à reverser.**
- **Client assujetti :** il la déclare toujours.
- **Client non assujetti** (particulier, petite entreprise, association) : il ne la doit que s'il achète **plus de 10 000 CHF** de services étrangers de ce type par année civile, tous prestataires confondus. Il s'annonce alors au plus tard 60 jours après la fin de l'année. Pour un site à 1 990 CHF, il reste normalement en dessous.
- L'hébergement ou les services informatiques vendus à un non-assujetti ne sont jamais soumis à cet impôt. C'est le prestataire étranger qui risque alors de devoir s'inscrire (voir plus haut).

### Ce qu'il faut écrire

- **Obligatoire :** tant que vous n'êtes pas inscrite, ne faites **jamais** figurer de TVA suisse (ni taux ni montant) sur un devis, un appel d'acompte, une facture ou un avoir. Sinon, vous devez cet impôt à la Confédération. Un devis qui sert aussi à demander un paiement compte comme une facture. En cas d'erreur, émettez un document qui mentionne et annule l'original, avec accusé de réception du client.
- **Recommandé sur les devis et factures :**
  > Prestataire établi en France, non inscrit au registre suisse des assujettis à la TVA. Prestation de services soumise, le cas échéant, à l'impôt sur les acquisitions à déclarer par le destinataire (art. 45 LTVA).

  Ajoutez le numéro IDE du client s'il en a un. Facturer en CHF évite au client de convertir le montant ; voir 4.6 pour le risque de devise.
- **Sur le site :** la formule proposée en section 2. Si des particuliers sont visés, faites confirmer par votre expert-comptable que 1 990 CHF inclut toute taxe que vous factureriez (TVA française éventuelle).

### À surveiller

- **Votation du 29 novembre 2026 :** hausse du taux normal de 8,1 % à **8,5 %**, au plus tôt début 2028 si elle est acceptée.
- **Second projet de hausse (pour l'armée) :** +0,2 point, voté par le Conseil des États le 21 septembre 2026. Il doit encore passer au Conseil national ; une votation est attendue en 2028.
- **Effet pour vous :** une hausse augmenterait l'impôt sur les acquisitions de vos clients professionnels, et vos prix toutes taxes comprises si des particuliers sont visés.
- **Déclarations en ligne :** dès le 1er janvier 2027, davantage de démarches à l'AFC se feront obligatoirement en ligne.
- **Frais de déplacement :** le remboursement de la TVA suisse payée (hôtel, etc.) n'est possible qu'à partir de 500 CHF de TVA par an. Ce n'est pas pertinent pour quelques nuits ; gardez simplement les factures.

---

## 6. Prospection en Suisse (pour Instinct)

### 6.1 E-mails, SMS, messageries

- **Envois en série** (modèles, publipostage, séquences automatisées) : il faut un **consentement préalable** des destinataires, **même pour des entreprises** et même vers info@entreprise.ch. C'est différent du régime français.
  - Un fichier ciblé (« les artisans de Genève ») ne suffit pas à sortir de cette règle.
  - Une adresse publiée sur un site ne vaut pas consentement (lecture dominante).
  - Ouvrir l'e-mail ou cliquer dedans ne vaut pas consentement.
- L'exception « client existant » ne couvre pas les prospects : elle suppose une vente déjà réalisée.
- **E-mail réellement individuel**, rédigé à la main pour une entreprise précise : c'est une zone grise, probablement hors de cette règle. Il reste soumis à la règle générale de loyauté et à la nLPD.
- **Dans chaque message :**
  - identification de l'expéditeur et de l'annonceur (« [Nom], Instinct, pour le compte d'Atousy – [raison sociale, adresse, e-mail] ») ;
  - adresse de réponse valide ;
  - désinscription gratuite et effective ;
  - respect d'une liste d'exclusion commune.

### 6.2 Appels téléphoniques

- **Le jour de l'appel**, vérifier chaque numéro dans l'annuaire officiel (local.ch, search.ch).
  - S'il porte un **astérisque (\*)** ou **n'y figure pas**, ne pas appeler, sauf relation commerciale **actuelle** ou consentement documenté. Une dernière commande vieille de 7 ans ne suffit pas.
  - La règle vaut aussi pour les numéros d'entreprises.
- **Afficher un numéro inscrit dans l'annuaire** et que l'on a le droit d'utiliser. Le numéro d'Atousy peut être affiché avec votre autorisation ; une autorisation écrite est recommandée comme preuve. Ne jamais masquer le numéro.
- Se présenter d'emblée (« [Prénom], société Instinct, pour Atousy »), sans pression, et noter immédiatement tout refus.
- **Interdits sans consentement :** les messages préenregistrés et les numéroteurs automatiques qui composent plus de numéros qu'il n'y a d'agents. Un appel doit être mené par une personne.
- Tenir un journal des vérifications.
- En cas d'envoi de courriers, les croiser avec la « liste Robinson ».

### 6.3 Données des prospects (nLPD)

- **Obligatoire :** informer chaque prospect dont les coordonnées n'ont pas été obtenues auprès de lui, au plus tard **un mois** après leur obtention, ou dès le premier contact s'il a lieu avant. Mention à insérer dans le premier e-mail ou appel (texte proposé) :
  > [Prénom], Instinct, pour le compte d'Atousy ([raison sociale, adresse, e-mail]). Nous avons trouvé vos coordonnées professionnelles sur [source]. Elles servent uniquement à vous présenter nos services de création de sites. Destinataires : Atousy et Instinct, [pays]. Pour ne plus être contacté : répondez « STOP » ou écrivez à [e-mail]. Plus d'infos : [lien vers la politique].
- Respecter immédiatement toute opposition : un traitement contre la volonté expresse de la personne est illicite.
- Noter la source de chaque contact pour pouvoir répondre aux demandes d'accès.

### 6.4 Contrat Atousy–Instinct

**Votre responsabilité.** Atousy est exposée, car la loi vise aussi celui qui **fait envoyer** les messages. Le mandant qui omet d'empêcher l'infraction de son mandataire peut aussi être poursuivi.

**Ce que le contrat doit prévoir :**
- Le rôle d'Instinct : sous-traitant (il ne peut alors sous-traiter qu'avec votre autorisation préalable) ou responsable distinct.
- Une clause de conformité aux règles anti-spam et téléphone et à la nLPD, avec droit d'audit et garantie.
- Pour la TVA, Instinct doit rester un prestataire indépendant :
  - aucun pouvoir de signer des devis ou contrats en votre nom ;
  - pas de bureau dédié à Atousy en Suisse ;
  - ses messages présentent Atousy comme le prestataire ;
  - Atousy émet elle-même tous les devis et factures.

  Dans ces conditions, le risque de créer un établissement en Suisse est faible.

### 6.5 Particuliers et maquettes

- Prospecter **uniquement des professionnels**. Un particulier démarché par téléphone qui s'engage pour plus de 100 CHF bénéficie d'un droit de révocation de 14 jours (voir 4.4).
- **Maquette réalisée au nom d'un vrai prospect :**
  - lien privé non indexé (noindex) ;
  - mention « maquette non officielle proposée par Atousy » ;
  - retrait sur demande.

### 6.6 Sanctions

- **Spam et appels interdits :** jusqu'à 3 ans de peine privative de liberté ou une peine pécuniaire, pour des actes intentionnels et sur plainte. Donner l'instruction d'envoyer sans consentement est intentionnel.
- **Autres conséquences :** actions civiles, signalements au SECO, et retrait d'un nom de domaine .ch ou blocage d'un numéro suisse utilisés pour l'infraction.

---

## 7. Points à faire confirmer

### Par une fiduciaire suisse (TVA)
- La qualification d'un forfait « hébergement + maintenance » : est-ce un service informatique ou des interventions humaines ? Un hébergement inclus dans un forfait de création peut-il suivre la prestation principale (règle des 70 %) ? Non vérifié dans la pratique de l'AFC.
- Faut-il remplir le questionnaire d'assujettissement de l'AFC ? Une réponse de l'AFC à une entreprise non inscrite n'est pas forcément contraignante.
- Pour vos clients artisans qui utilisent la méthode du taux de la dette fiscale nette (TDFN), l'impôt sur les acquisitions est-il un coût réel de 8,1 % ? Non vérifié.
- La qualification d'éventuels ateliers ou formations sur place.
- Les risques d'établissement stable pour les impôts directs liés à Instinct (convention fiscale franco-suisse), non analysés.

### Par un avocat suisse
- La portée de l'obligation d'impressum pour un site sans commande en ligne (enjeu faible).
- La règle contre la géodiscrimination s'applique-t-elle à un service vendu sur devis ? Protège-t-elle aussi les entreprises ? Comment justifier l'écart entre le prix en CHF et le prix en EUR ?
- Une mention « réservé aux professionnels » suffit-elle à écarter l'OIP sur une page accessible à tous ?
- Des e-mails individuels non automatisés sont-ils hors de la règle anti-spam ?
- Un numéro de téléphone français suffit-il pour les appels ? Par prudence, utilisez un numéro inscrit dans un annuaire suisse.
- Le droit applicable au contrat Atousy–Instinct, selon l'endroit où Instinct est établi et son statut.
- Pour les particuliers : un site web est-il une « prestation de consommation courante » au sens du droit suisse ?
- La jurisprudence citée seulement via des résumés (ATF 145 III 20, ATF 149 IV 1) et la « théorie de la finalité » pour les droits d'auteur.

### Par votre expert-comptable ou conseil français
- La TVA française sur les ventes à des clients suisses : mention « hors champ » entre professionnels, ventes aux particuliers, franchise en base, autoliquidation sur la commission d'Instinct si Instinct est suisse.
- Les pénalités de retard et l'indemnité de 40 € quand le droit français est choisi.
- Le formalisme de cession de droits d'auteur (art. L131-3 du Code de la propriété intellectuelle).
- Le contrat de sous-traitance RGPD (art. 28) pour l'hébergement et la maintenance de sites clients.

### Faits à vérifier vous-même
- **Cloudflare :** est-elle bien active pour le « Swiss-U.S. DPF » sur dataprivacyframework.gov ?
- **E-mails :** Brevo ou Resend ? Pour Brevo, quels sous-traitants hors UE ? Quel fournisseur gère la boîte contact@atousy.com, et dans quel pays ?
- **Site :**
  - Quels cookies Cloudflare et Turnstile posent-ils réellement ?
  - Le site fonctionne-t-il quand le stockage est bloqué ?
  - Le pays est-il envoyé avec le formulaire ?
  - Quel est le prix exact en EUR comparé à 1 990 CHF ?
- **Votre entreprise :**
  - Entreprise individuelle ou société ? Cela détermine qui supporte les éventuelles amendes.
  - Quel est votre chiffre d'affaires mondial en CHF ?
  - Avez-vous des salariés ? Quelle est la nationalité des personnes qui se déplaceraient en Suisse ?
- **Vos choix commerciaux :**
  - Acceptez-vous des particuliers suisses ?
  - Prévoyez-vous une acceptation de devis, une signature ou un paiement en ligne ?
  - Vos démos reprennent-elles des noms, logos ou photos de vraies entreprises ?
- **Instinct :** quel statut et où est-il établi ? Quels outils et quels volumes d'e-mails ? Quel numéro sera affiché lors des appels ?
- **Signature :** votre outil propose-t-il une signature qualifiée reconnue en Suisse (ZertES) ?

### À surveiller (changements récents ou à venir)
- **Transferts vers les États-Unis (DPF) :** un recours est pendant devant la Cour de justice de l'UE (C-703/25 P) ; aucune décision n'a été trouvée au 26 octobre 2026. Aucune réévaluation suisse en 2026 n'a été trouvée. À revérifier avant publication.
- **TVA :** votation du 29 novembre 2026, hausse liée à l'armée, déclarations en ligne obligatoires dès le 1er janvier 2027.
- **Déplacements :** paquet Suisse-UE (annonce des missions) ; votation attendue en 2027 ou 2028 selon la presse.
- **Changements déjà en vigueur :**
  - LPD : annonce des violations, nouveauté du 1er avril 2025 ;
  - OPDo : modifiée au 1er décembre 2025 ;
  - guide cookies du PFPDT : version du 6 octobre 2025 ;
  - LCD : allégations climatiques depuis le 1er janvier 2025 ;
  - OIP : nouvelles règles sur les prix comparatifs au 1er janvier 2025 ;
  - guide de l'OFEV sur les allégations climatiques : 2 mars 2026 ;
  - LTVA : révision au 1er janvier 2025.

---

## 8. Sources

Versions consolidées consultées : LPD au 7.7.2025, OPDo au 1.12.2025, LTC au 1.6.2026, LCD et OIP au 1.1.2025, LDIP au 1.1.2026, CO au 1.10.2026, LTVA au 31.3.2025, OTVA au 1.1.2025 (et 1.1.2027).

### Textes de loi (Fedlex)
- LPD (RS 235.1) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2022/491/20250707/fr/html/fedlex-data-admin-ch-eli-cc-2022-491-20250707-fr-html-1.html — https://www.fedlex.admin.ch/eli/cc/2022/491/fr
- OPDo (RS 235.11) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2022/568/20251201/fr/html/fedlex-data-admin-ch-eli-cc-2022-568-20251201-fr-html-1.html
- LTC (RS 784.10) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/1997/2187_2187_2187/20260601/fr/html/fedlex-data-admin-ch-eli-cc-1997-2187_2187_2187-20260601-fr-html-1.html — https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/1997/2187_2187_2187/20260601/fr/html/fedlex-data-admin-ch-eli-cc-1997-2187_2187_2187-20260601-fr-html-3.html
- OST (RS 784.101.1) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2007/166/20260701/fr/html/fedlex-data-admin-ch-eli-cc-2007-166-20260701-fr-html-1.html
- Message LTC, FF 2017 6185 : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/fga/2017/1933/fr/pdf-a/fedlex-data-admin-ch-eli-fga-2017-1933-fr-pdf-a-1.pdf
- LCD (RS 241) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/1988/223_223_223/20250101/fr/html/fedlex-data-admin-ch-eli-cc-1988-223_223_223-20250101-fr-html-5.html
- OIP (RS 942.211) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/1978/2081_2081_2081/20250101/fr/html/fedlex-data-admin-ch-eli-cc-1978-2081_2081_2081-20250101-fr-html-3.html
- LDIP (RS 291) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/1988/1776_1776_1776/20260101/fr/html/fedlex-data-admin-ch-eli-cc-1988-1776_1776_1776-20260101-fr-html-3.html
- CO (RS 220) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/27/317_321_377/20261001/fr/html/fedlex-data-admin-ch-eli-cc-27-317_321_377-20261001-fr-html-3.html
- CP (RS 311.0) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/54/757_781_799/20261001/fr/html/fedlex-data-admin-ch-eli-cc-54-757_781_799-20261001-fr-html-2.html
- DPA (RS 313.0) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/1974/1857_1857_1857/20230901/fr/html/fedlex-data-admin-ch-eli-cc-1974-1857_1857_1857-20230901-fr-html-5.html
- LTVA (RS 641.20) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/615/20250331/fr/html/fedlex-data-admin-ch-eli-cc-2009-615-20250331-fr-html-4.html
- OTVA (RS 641.201) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/828/20250101/fr/html/fedlex-data-admin-ch-eli-cc-2009-828-20250101-fr-html-11.html — https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2009/828/20270101/fr/html/fedlex-data-admin-ch-eli-cc-2009-828-20270101-fr-html-1.html
- LDét (RS 823.20) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2003/231/20240101/fr/html/fedlex-data-admin-ch-eli-cc-2003-231-20240101-fr-html-2.html
- ODét (RS 823.201) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2003/232/20250101/fr/html/fedlex-data-admin-ch-eli-cc-2003-232-20250101-fr-html-1.html
- OLCP (RS 142.203) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2002/261/20260101/fr/html/fedlex-data-admin-ch-eli-cc-2002-261-20260101-fr-html.html
- OASA (RS 142.201) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2007/759/20261001/fr/html/fedlex-data-admin-ch-eli-cc-2007-759-20261001-fr-html.html
- Convention de Lugano (RS 0.275.12) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2010/801/20160408/fr/html/fedlex-data-admin-ch-eli-cc-2010-801-20160408-fr-html-12.html
- LDA (RS 231.1) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/1993/1798_1798_1798/20250701/fr/html/fedlex-data-admin-ch-eli-cc-1993-1798_1798_1798-20250701-fr-html-7.html
- SCSE (RS 943.03) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2016/752/20200101/fr/html/fedlex-data-admin-ch-eli-cc-2016-752-20200101-fr-html-7.html
- LP (RS 281.1) : https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/11/529_488_529/20260101/fr/html/fedlex-data-admin-ch-eli-cc-11-529_488_529-20260101-fr-html-3.html
- Point d'accès Fedlex (contrôle des versions) : https://fedlex.data.admin.ch/sparqlendpoint
- Règlement Rome I (UE) : https://publications.europa.eu/resource/celex/32008R0593.FRA.xhtml

### PFPDT (protection des données)
- Guide cookies v1.1 (6.10.2025) : https://www.edoeb.admin.ch/dam/fr/sd-web/brLL9rM3ny9d/Leitfaden%20des%20ED%C3%96B%20betreffend%20Datenbearbeitungen%20mittels%20Cookies%20und%20%C3%A4hnlichen%20Technologien%20V.%201.1%20vom%2006.10.2025_FR.pdf
- Guide sur l'annonce des violations v1.2 : https://www.edoeb.admin.ch/dam/fr/sd-web/T64CAUyvAMcF/1_2%20Leitfaden%20des%20ED%C3%96B%20betreffend%20die%20Meldung%20von%20Datensicherheitsverletzungen%20und%20Information%20der%20Betroffenen%20nach%20Art.%2024%20DSG_FR.pdf
- https://www.edoeb.admin.ch/en/15082024-new-swiss-us-data-privacy-framework
- https://www.edoeb.admin.ch/en/27082021-the-transfer-of-personal-data-to-a-country-with-an-inadequate-level-of-data-protection-based-on-recognised-standard-contractual-clauses-and-model-contracts
- https://www.edoeb.admin.ch/fr/publicite-et-marketing

### AFC (TVA)
- Info TVA 22 « Entreprises étrangères » : https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1551451&componentId=1551668 — …componentId=1551507 — …componentId=1551502 — …componentId=1551641 — …componentId=1551657 — …componentId=1551662
- Info TVA secteur 13 : https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/sectorInfos/cipherDisplay.xhtml?publicationId=1000066&componentId=1000102 — …componentId=1590220 — …componentId=1590250 — …componentId=1590294 — …componentId=1000117
- Info TVA 14 « Impôt sur les acquisitions » : https://www.gate.estv.admin.ch/mwst-webpublikationen/public/pages/taxInfos/cipherDisplay.xhtml?publicationId=1001238&componentId=1286229 — …componentId=1001420 — …componentId=1001460
- Formulaire MWST-0620 : https://www.estv2.admin.ch/mwst/formulare/mwst-form-vollmacht-0620-fr.pdf
- https://www.estv.admin.ch/fr/assujettissement-a-la-tva
- https://www.estv.admin.ch/fr/tva-assujettissement-entreprises-etrangeres
- https://www.estv.admin.ch/estv/fr/accueil/taxe-sur-la-valeur-ajoutee/informations-specialisees-tva/questions-procedurales-tva/demandes-renseignements-juridiques.html
- https://www.estv.admin.ch/fr/newnsb/gZ4zhuBYFjyi
- https://www.estv.admin.ch/fr/vat-refund-remboursement-a-des-entreprises-etrangeres

### SECO, PME et autres autorités
- https://www.seco.admin.ch/fr/faq-oip
- https://www.seco.admin.ch/fr/acheter-a-l-etranger
- https://www.seco.admin.ch/fr/commerce-electronique
- https://www.seco.admin.ch/fr/appels-publicitaires-indesirables
- Guide pratique OIP 2025 : https://www.seco.admin.ch/dam/fr/sd-web/37az5I4TCZV7/PBV-Brosch%C3%BCren-Wegleitung-SECO-2025-FR.pdf
- https://www.kmu.admin.ch/fr/nouvelle-loi-sur-la-protection-des-donnees-nlpd
- https://www.kmu.admin.ch/fr/conditions-generales-de-vente
- https://www.bakom.admin.ch/en/when-is-mass-sending-allowed
- https://www.bafu.admin.ch/fr/aide-a-l-execution-lcd
- https://www.preisueberwacher.admin.ch/dam/pue/fr/dokumente/newsletter/newsletter_05_24.pdf.download.pdf/Newsletter_05_24_f.pdf
- https://www.bsv.admin.ch/fr/votation-13e-rente-avs
- https://www.parlament.ch/fr/services/news/Pages/2026/20260921195004220194158159026_bsf123.aspx
- https://www.sem.admin.ch/sem/fr/home/themen/fza_schweiz-eu-efta/meldeverfahren/ref_faq.html
- https://www.sem.admin.ch/dam/sem/fr/data/rechtsgrundlagen/weisungen/fza/weisungen-fza.pdf.download.pdf
- https://www.europa.eda.admin.ch/dam/fr/sd-web/LKVZW4i2ho87/004%20Faktenblatt%20PFZ%20Lohnschutz%20(FR).pdf
- https://www.bj.admin.ch/fr/nsb?id=102325
- https://www.ge.ch/c/salaire-minimum

### Décisions de justice (textes consultés via entscheidsuche.ch)
- TF 4A_503/2020 : https://entscheidsuche.ch/docs/CH_BGer/CH_BGer_004_4A-503-2020_2021-01-19.html
- TF 4A_330/2021 : https://entscheidsuche.ch/docs/CH_BGer/CH_BGer_004_4A-330-2021_2022-01-05.html
- OG ZH UE160194 : https://entscheidsuche.ch/docs/ZH_Obergericht/ZH_OG_002_UE160194_2016-10-18.pdf
- TC VD JP13.040221 : https://entscheidsuche.ch/docs/VD_FindInfo/VD_TC_002_JP13-040221_nodate.pdf
- TC VD KC15.002717 : https://entscheidsuche.ch/docs/VD_FindInfo/VD_TC_009_KC15-002717_nodate.pdf

### Sources non officielles (autorégulation, prestataires, doctrine), utilisées seulement pour interpréter
- Règles CSL : https://www.faire-werbung.ch/wp-content/uploads/2025/01/SLK-Grundsaetze_FR-1.1.2025.pdf — https://www.faire-werbung.ch/wp-content/uploads/2025/01/SLK-Grundsaetze_DE-1.1.2025.pdf — https://www.faire-werbung.ch/fr/plainte/
- Prestataires : https://www.cloudflare.com/trust-hub/gdpr/ — https://www.cloudflare.com/turnstile-privacy-policy/ — https://resend.com/legal/dpa — https://resend.com/legal/privacy-policy — https://resend.com/changelog/data-privacy-framework-certification
- Doctrine et commentaires :
  - https://onlinekommentar.ch/fr/kommentare/dsg14
  - https://www.ius.uzh.ch/dam/jcr:7a679a33-1131-4ce5-9149-e2134f6c5acd/Loesungsschema_Fall_6.pdf
  - https://law.ch/lawinfo/ict-law-informations-und-kommunikationstechnologie/impressumspflicht-e-commerce/
  - https://kellerhals-carrard.ch/fr/actualites/newsletter-4-2021-pouvoir-de-marche-relatif-et-geoblocking-blocage-geographique
  - https://www.swlegal.com/en/insights/newsletter-detail/switzerlands-ban-on-geoblocking-enters-into-force-/
  - https://www.crimen.ch/158/
  - https://lawinside.ch/662/
  - https://homburger.ch/en/insights/the-hague-convention-on-the-choice-of-court-agreements-enters-into-force-for-switzerland
  - https://eapil.org/2025/09/22/french-supreme-court-rules-on-validity-of-asymmetric-jurisdiction-clauses-after-lastre/
  - https://conflictoflaws.net/2022/cjeu-on-lugano-ii-convention-and-choice-of-court-through-a-simple-reference-to-a-website-case-tilman-c-358-21/
  - https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission
  - https://anneepolitique.swiss/prozesse/59580-adapter-le-droit-du-mandat-et-l-art-404-co-au-xxie-siecle.pdf
  - https://www.letemps.ch/articles/bilaterales-iii-le-temps-d-un-sursaut-pour-le-plr

---

*Ces points sont donnés à titre informatif, sur la base des textes consultés au 26 octobre 2026. Ils doivent être validés par un professionnel : fiduciaire ou avocat suisse, et expert-comptable français.*