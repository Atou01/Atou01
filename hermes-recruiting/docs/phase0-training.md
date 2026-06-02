# Phase 0 — Entraînement d'Hermes (avant tout subagent)

**But : Hermes comprend tout le process Hunteed AVANT qu'on crée les subagents.** On ne
déploie ① ② … qu'une fois qu'Hermes maîtrise le workflow, les pièges du site et les nuances
du métier — sinon il propagerait ses erreurs aux subagents.

Pré-requis : le tunnel SSH+CDP fonctionne ([`phase0-tunnel.md`](phase0-tunnel.md)) et Hermes
lit le DOM en live.

## La boucle d'entraînement

1. **Session live** : Atou traite une **vraie mission Hunteed** sur son Mac. Hermes
   **observe l'écran** (DOM via CDP) et **écoute les explications** d'Atou via Telegram.
2. **Hermes verbalise** ce qu'il comprend (intent de l'étape, champ visé, piège anticipé) et
   **pose des questions** quand c'est ambigu.
3. **Hermes capitalise** : il génère/affine de la **procedural memory** (skills `~/.hermes/skills/`,
   mémoires `~/.hermes/memories/`) au fil des sessions et la réutilise ensuite.
4. **Feedback loop** : quand Hermes se trompe, **Atou corrige**, Hermes intègre la correction
   dans sa mémoire/skill. On répète sur plusieurs missions variées.

## Ce qu'Hermes doit assimiler

- Le **workflow Hunteed de bout en bout** : lecture d'une mission, critères GO/NO-GO, parcours
  de l'interface, étapes de sourcing, format du CR.
- Les **pièges du site** (libellés trompeurs, états cachés, champs obligatoires, ordre des actions).
- Les **nuances métier** d'Atou (ce qui fait un bon/mauvais candidat, ses raccourcis de jugement).
- **Quand demander un humain** : tout ce qui touche aux 3 checkpoints reste une décision d'Atou.

## Critère de sortie (go/no-go pour la Phase 1)

> Atou peut dire **« source-moi cette mission »** et Hermes exécute le workflow **sans poser
> 50 questions**, en connaissant les pièges du site, en s'arrêtant proprement aux checkpoints.

Tant que ce critère n'est pas atteint, **on reste en Phase 0**. On ne lance pas les subagents.

## Garde-fous pendant l'entraînement

- Hermes **observe et propose** ; il n'exécute pas d'action irréversible côté Hunteed/LinkedIn
  sans validation (cf. [`guardrails.md`](guardrails.md)).
- Données candidat : chiffrées par le tunnel, non loggées en clair, rétention minimale (RGPD).
- ToS LinkedIn respecté dès l'entraînement (pas d'extraction de masse).
