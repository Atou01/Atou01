# Garde-fous (non négociables)

## 1. Décision finale humaine

Le LLM ne touche jamais à la décision d'embauche. Trois checkpoints obligatoires
(voir [`checkpoints.md`](checkpoints.md)) :

- **CP1** — sélection des missions (actif Phase 1) ;
- **CP2** — envoi des approches (Phase 2) ;
- **CP3** — validation du CR Hunteed (Phase 2).

Aucune action irréversible côté client sans validation d'Atou.

## 2. ToS LinkedIn

- **Pas** de scraping massif ni d'extraction de masse automatisée.
- **Pas** d'outreach automatisé de masse — l'envoi des messages reste **déclenché par Atou**
  (CP2, Phase 2).
- Export éventuel (ex. PhantomBuster) **uniquement** dans les limites du ToS, volumes
  raisonnables.

## 3. RGPD

- Consentement et rétention des données candidat maîtrisés.
- Pas de stockage non justifié. Minimiser les données conservées.
- Les données candidat n'ont pas vocation à transiter par des logs ou des messages en clair.

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
