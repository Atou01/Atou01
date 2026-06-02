# Conformité — cadre directeur (à valider avec un juriste)

> ⚠️ **Ce document n'est pas un conseil juridique.** C'est une synthèse opérationnelle pour
> cadrer le design. Les points marqués 🧑‍⚖️ doivent être validés avec un avocat
> spécialisé (IA/données/droit du travail), d'autant que le calendrier réglementaire bouge.

**Principe : la conformité cadre le design, pas l'inverse.** En recrutement, elle est un
**préalable bloquant** à toute montée en autonomie (voir la piste de maturité M0 dans
[`roadmap.md`](roadmap.md)).

## 1. AI Act — le système est **haut risque** par défaut

- Recrutement / sélection / évaluation de candidats = **Annexe III §4(a)** → **haut risque**.
- **Tout scoring ou classement de candidats = profilage** (art. 4(4) RGPD : « performance au
  travail »). Or l'AI Act précise qu'un système Annexe III **« shall always be considered
  high-risk where [it] performs profiling »**.
- L'**exemption art. 6(3)** (tâche procédurale étroite/préparatoire) est lue **restrictivement**
  et **ne s'applique jamais en cas de profilage**. Les guidelines Commission (draft 19 mai 2026)
  confirment : on **ne peut pas** déclasser en « low risk » juste en ajoutant une validation
  humaine. 🧑‍⚖️
- **Conséquence design** : un agent qui score/classe reste haut risque **même avec CP1/CP2/CP3**.
  L'oversight humain (art. 14) est une **obligation séparée**, pas une porte de sortie.

## 2. Obligations haut risque (déployeur)

- **Oversight humain effectif (art. 14)** : comprendre la sortie, pouvoir intervenir/arrêter,
  conscience du **biais d'automatisation**. Les checkpoints doivent être **substantiels**
  (l'humain lit et décide) — **pas de rubber-stamping**.
- **Journalisation (art. 19(1))** : conserver les logs auto-générés **≥ 6 mois** (sauf règle
  données perso différente). → activer les logs Hermes, ne pas les désactiver.
- Surveillance continue, documentation, transparence/information.

## 3. Pratiques **interdites** (depuis février 2025) — à proscrire dans le system prompt

- ❌ **Reconnaissance des émotions** sur le lieu de travail / en entretien (pas d'analyse
  d'émotion en visio).
- ❌ **Catégorisation biométrique** / inférence de traits sensibles.
- ❌ Toute **décision d'embauche par le LLM**.

## 4. RGPD / CNIL (contexte France)

- **Base légale** : intérêt légitime de l'employeur ou obligation du Code du travail
  (consentement surtout pour vivier/rétention longue). Finalité limitée à l'aptitude au poste
  (art. L.1221-6). 🧑‍⚖️
- **Rétention** : CV/données des candidats **non retenus** conservables **jusqu'à 2 ans après
  le dernier contact**, **à condition d'informer et d'avoir l'accord** ; au-delà → consentement
  explicite.
- **Information obligatoire** des candidats de l'existence d'un **tri algorithmique**.
- **Droits** : accès / rectification / effacement. → favorise le **RAG** (donnée effaçable en
  base) plutôt que le fine-tuning (donnée « cuite » dans les poids).
- **AIPD/DPIA** de fait requise pour un outil de scoring.
- **Article 22 RGPD** : pas de décision « fondée exclusivement » sur l'automatisé à effet
  significatif → la revue humaine doit être **réelle** (substantielle), pas un tampon.
- ⚠️ Recrutement + tri IA = **thématique de contrôle prioritaire CNIL 2026**.

## 5. Biais / fairness — à tester en continu

- **Adverse impact** : règle des **4/5** (ratio de sélection d'un groupe ≥ 80 % du groupe
  favori), disparité démographique. Geler l'autonomie si un ratio passe < 4/5.
- Auditer **données ET sorties** régulièrement ; documenter.
- Le risque est réel et documenté (études Stanford 2025, AIES 2024 : biais d'âge/genre/origine
  des LLM sur CV). Ne **jamais** filtrer/scorer sur des attributs protégés (nom, âge, genre,
  origine) ni leurs proxys.

## 6. Suisse (frontalier)

🧑‍⚖️ Vérifier l'articulation avec la **LPD suisse révisée**. L'AI Act s'applique dès que des
**candidats ou déployeurs sont dans l'UE**.

## 7. Calendrier (mouvant)

- Déclenchement initial des obligations Annexe III : **2 août 2026**.
- Proposition **Digital Omnibus** (19 nov. 2025 ; trilogues en cours 2026) reporterait au
  **2 décembre 2027**. ⚠️ **Tant que rien n'est publié au Journal officiel, le 2 août 2026
  reste la date applicable.** 🧑‍⚖️ Suivre l'évolution.

## Checklist M0 (à cocher avant toute autonomie)

- [ ] Note d'analyse art. 6(3) rédigée (conclusion attendue : **non exempté** car profilage). 🧑‍⚖️
- [ ] Registre de traitement + **journalisation Hermes activée (≥ 6 mois)**.
- [ ] Mention d'information candidats (tri algorithmique) rédigée.
- [ ] Rétention fixée à **2 ans** + mécanisme d'effacement (droits RGPD).
- [ ] Base légale documentée (intérêt légitime / Code du travail). 🧑‍⚖️
- [ ] Interdits inscrits dans les system prompts (émotions, biométrie, décision LLM, attributs protégés).
- [ ] Procédure de test fairness (4/5) + cadence d'audit définie.
- [ ] DPIA/AIPD initiée. 🧑‍⚖️
- [ ] Checkpoints confirmés **substantiels** (anti rubber-stamping).
