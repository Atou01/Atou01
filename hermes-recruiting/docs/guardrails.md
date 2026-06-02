# Garde-fous (non négociables)

> Cadre juridique complet (AI Act haut risque, RGPD/CNIL, calendrier) :
> [`compliance.md`](compliance.md). **La conformité prime sur tout.**

## 0. Statut réglementaire — haut risque par défaut

Le recrutement est **haut risque (AI Act, Annexe III §4)** et **tout scoring/classement de
candidats = profilage** → pas d'exemption art. 6(3), **même avec validation humaine**.
L'oversight humain (art. 14) est une obligation **en plus**, pas une porte de sortie.

## 1. Décision finale humaine — substantielle, pas un tampon

Le LLM ne touche jamais à la décision d'embauche. Trois checkpoints obligatoires
(voir [`checkpoints.md`](checkpoints.md)) :

- **CP1** — sélection des missions (actif Phase 1) ;
- **CP2** — envoi des approches (Phase 2) ;
- **CP3** — validation du CR Hunteed (Phase 2).

Aucune action irréversible côté client sans validation d'Atou. La revue doit être **réelle**
(l'humain lit et décide — art. 22 RGPD) : **pas de rubber-stamping**. **Jamais 0 %** de revue
humaine sur une décision touchant un candidat, quel que soit le niveau d'autonomie.

## 1bis. Pratiques interdites (à proscrire dans les system prompts)

- ❌ **Reconnaissance d'émotions** (pas d'analyse d'émotion en visio/entretien).
- ❌ **Catégorisation biométrique** / inférence de **traits sensibles**.
- ❌ Scoring/filtrage sur **attributs protégés** (nom, âge, genre, origine) ou leurs proxys.

## 1ter. Fairness (test continu)

Tester l'**adverse impact** (règle des **4/5**). Geler la montée en autonomie et auditer
données + sorties si un ratio passe sous 4/5.

## 2. ToS LinkedIn (caps opérationnels)

- **Pas** de scraping massif ni d'extraction de masse automatisée.
- **Pas** d'outreach automatisé de masse — l'envoi des messages reste **déclenché par Atou**
  (CP2, Phase 2).
- Export éventuel (ex. PhantomBuster) **uniquement** dans les limites du ToS, volumes
  raisonnables.
- Repères (non officiels — observations PhantomBuster, prudence) : ~**100 invitations/semaine**
  (≈15-25/jour, démarrer bas, augmenter seulement si acceptation 7j > 40 %), **délais aléatoires
  5-30 s**, heures ouvrées, **multicanal**, activité **régulière** (éviter le *slide-then-spike*).
  Toutes les actions (manuelles + auto) comptent dans le **même quota**. Sur avertissement
  LinkedIn → **pause 48-72 h** et baisse des caps.

## 3. RGPD / CNIL

- Consentement et rétention des données candidat maîtrisés. **Rétention : 2 ans** après le
  dernier contact (candidats non retenus), **après information + accord** ; au-delà →
  consentement explicite.
- **Information obligatoire** des candidats de l'existence d'un **tri algorithmique**.
- Droits **accès/rectification/effacement** → privilégier le **RAG** (donnée effaçable) au
  fine-tuning (donnée « cuite » dans les poids).
- Pas de stockage non justifié. Minimiser les données conservées.
- Les données candidat n'ont pas vocation à transiter par des logs ou des messages en clair.
- **Journalisation (AI Act art. 19)** : conserver les logs Hermes **≥ 6 mois** ; ne pas les
  désactiver (la redaction des secrets reste active).

## 4. Règles Hunteed

- Conformité du format des comptes-rendus et de la diffusion d'offres.
- Respect du périmètre et des conditions de la plateforme.

## 5. Secrets

- Clés API et tokens **hors du repo** : dans `~/.hermes/.env` (et le `.env` local du kit,
  gitignoré). Jamais commités, jamais écrits dans un message ou un log.
- Hermes redacte automatiquement les secrets dans ses logs ; ne pas annuler ce comportement.

## 6. Dry-run par défaut

Tout script qui agit tourne en **`DRY_RUN=1` par défaut** (affiche les commandes sans les
exécuter). L'application réelle est un choix explicite : `DRY_RUN=0`.

## 7. Périmètre incrémental

On construit **la Phase 1 d'abord**, on la fait tourner, puis on avance. On ne déploie pas les
6 agents d'un coup.
