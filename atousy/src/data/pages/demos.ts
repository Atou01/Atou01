// Démonstrations fictives présentées sur /exemples/ (et en aperçu sur d'autres pages).
// Les adresses suivent la navigation des démos (src/components/demos/*/nav.ts).

export type DemoId = 'rivage' | 'faitage';

export type DemoWindowId =
  | 'rivage-accueil'
  | 'rivage-approche'
  | 'rivage-savoir-faire'
  | 'rivage-jardins'
  | 'rivage-contact'
  | 'faitage-accueil'
  | 'faitage-realisations'
  | 'faitage-savoir-faire'
  | 'faitage-atelier'
  | 'faitage-contact';

export type DemoPage = { id: DemoWindowId; page: string; href: string };

export type Demo = {
  id: DemoId;
  name: string;
  trade: string;
  /** « Rivage · Paysagiste » : préfixe des libellés de fenêtres. */
  prefix: string;
  href: string;
  pages: DemoPage[];
};

export const demos: Record<DemoId, Demo> = {
  rivage: {
    id: 'rivage',
    name: 'Rivage',
    trade: 'paysagiste',
    prefix: 'Rivage · Paysagiste',
    href: '/exemples/rivage/',
    pages: [
      { id: 'rivage-accueil', page: 'Accueil', href: '/exemples/rivage/' },
      { id: 'rivage-approche', page: 'Notre approche', href: '/exemples/rivage/approche/' },
      { id: 'rivage-savoir-faire', page: 'Savoir-faire', href: '/exemples/rivage/savoir-faire/' },
      { id: 'rivage-jardins', page: 'Votre jardin', href: '/exemples/rivage/jardins/' },
      { id: 'rivage-contact', page: 'Nous contacter', href: '/exemples/rivage/contact/' },
    ],
  },
  faitage: {
    id: 'faitage',
    name: 'Faîtage',
    trade: 'charpentier',
    prefix: 'Faîtage · Charpentier',
    href: '/exemples/faitage/',
    pages: [
      { id: 'faitage-accueil', page: 'Accueil', href: '/exemples/faitage/' },
      { id: 'faitage-realisations', page: 'Réalisations', href: '/exemples/faitage/realisations/' },
      { id: 'faitage-savoir-faire', page: 'Savoir-faire', href: '/exemples/faitage/savoir-faire/' },
      { id: 'faitage-atelier', page: 'L’atelier', href: '/exemples/faitage/atelier/' },
      { id: 'faitage-contact', page: 'Contact', href: '/exemples/faitage/contact/' },
    ],
  },
};

export type DemoWindow = DemoPage & { demo: DemoId; label: string };

/** Les 10 fenêtres de la bande à faire défiler, dans l'ordre d'affichage. */
export const demoWindows: DemoWindow[] = (['rivage', 'faitage'] as const).flatMap((d) =>
  demos[d].pages.map((p) => ({ ...p, demo: d, label: `${demos[d].prefix} — ${p.page}` })),
);

/** Ce que chaque démo illustre (contenus/exemples.md). La première ligne liste les pages. */
export const demoHighlights: Record<DemoId, string[]> = {
  rivage: [
    'un ton calme, une mise en page aérée ;',
    'des photos mises en valeur, légères à charger ;',
    'l’adaptation au mobile ;',
    'une page contact claire (formulaire désactivé) ;',
    'des encarts « Dans un vrai site » : coordonnées, vraies réalisations.',
  ],
  faitage: [
    'des réalisations présentées projet par projet (projets inventés) ;',
    'un savoir-faire expliqué simplement ;',
    'un affichage pensé pour le téléphone ;',
    'une page contact qui va droit au but.',
  ],
};

export const demoDescriptions: Record<DemoId, string> = {
  rivage: 'Un paysagiste qui dessine des jardins naturels, pour toutes les saisons.',
  faitage: 'Un charpentier qui construit, rénove et agrandit en bois.',
};
