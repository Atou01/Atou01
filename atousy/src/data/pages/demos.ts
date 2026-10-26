// Démonstrations fictives présentées sur /exemples/ (et en aperçu sur d'autres pages).
// Les adresses suivent la navigation des démos (src/components/demos/*/nav.ts).

export type DemoId = 'rivage' | 'faitage' | 'ecluse' | 'lueur' | 'moellon';

/** Une miniature par démo : sa page d'accueil (src/components/pages/DemoWindow.astro). */
export type DemoWindowId = `${DemoId}-accueil`;

export type DemoPage = { page: string; href: string };

export type Demo = {
  id: DemoId;
  name: string;
  trade: string;
  /** « Rivage · Paysagiste » : libellé de la fenêtre dans la bande. */
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
      { page: 'Accueil', href: '/exemples/rivage/' },
      { page: 'Notre approche', href: '/exemples/rivage/approche/' },
      { page: 'Savoir-faire', href: '/exemples/rivage/savoir-faire/' },
      { page: 'Votre jardin', href: '/exemples/rivage/jardins/' },
      { page: 'Nous contacter', href: '/exemples/rivage/contact/' },
    ],
  },
  faitage: {
    id: 'faitage',
    name: 'Faîtage',
    trade: 'charpentier',
    prefix: 'Faîtage · Charpentier',
    href: '/exemples/faitage/',
    pages: [
      { page: 'Accueil', href: '/exemples/faitage/' },
      { page: 'Réalisations', href: '/exemples/faitage/realisations/' },
      { page: 'Savoir-faire', href: '/exemples/faitage/savoir-faire/' },
      { page: 'L’atelier', href: '/exemples/faitage/atelier/' },
      { page: 'Contact', href: '/exemples/faitage/contact/' },
    ],
  },
  ecluse: {
    id: 'ecluse',
    name: 'Écluse',
    trade: 'plombier-chauffagiste',
    prefix: 'Écluse · Plombier-chauffagiste',
    href: '/exemples/ecluse/',
    pages: [
      { page: 'Accueil', href: '/exemples/ecluse/' },
      { page: 'Services', href: '/exemples/ecluse/services/' },
      { page: 'Réalisations', href: '/exemples/ecluse/realisations/' },
      { page: 'Entretien', href: '/exemples/ecluse/entretien/' },
      { page: 'Contact', href: '/exemples/ecluse/contact/' },
    ],
  },
  lueur: {
    id: 'lueur',
    name: 'Lueur',
    trade: 'électricien',
    prefix: 'Lueur · Électricien',
    href: '/exemples/lueur/',
    pages: [
      { page: 'Accueil', href: '/exemples/lueur/' },
      { page: 'Prestations', href: '/exemples/lueur/prestations/' },
      { page: 'Réalisations', href: '/exemples/lueur/realisations/' },
      { page: 'Conseils', href: '/exemples/lueur/conseils/' },
      { page: 'Contact', href: '/exemples/lueur/contact/' },
    ],
  },
  moellon: {
    id: 'moellon',
    name: 'Moellon',
    trade: 'maçon / rénovation',
    prefix: 'Moellon · Maçon / rénovation',
    href: '/exemples/moellon/',
    pages: [
      { page: 'Accueil', href: '/exemples/moellon/' },
      { page: 'Savoir-faire', href: '/exemples/moellon/savoir-faire/' },
      { page: 'Chantiers', href: '/exemples/moellon/chantiers/' },
      { page: 'Notre approche', href: '/exemples/moellon/approche/' },
      { page: 'Contact', href: '/exemples/moellon/contact/' },
    ],
  },
};

/** Ordre d'affichage, dans la bande comme dans les cartes. */
export const demoList: Demo[] = [demos.rivage, demos.faitage, demos.ecluse, demos.lueur, demos.moellon];

export type DemoWindow = { id: DemoWindowId; demo: DemoId; label: string; href: string };

/** Les 5 fenêtres de la bande à faire défiler : l'accueil de chaque démo. */
export const demoWindows: DemoWindow[] = demoList.map((d): DemoWindow => ({
  id: `${d.id}-accueil`,
  demo: d.id,
  label: d.prefix,
  href: d.href,
}));

/** Ce que chaque démo illustre (contenus/exemples.md). La liste des pages est ajoutée en tête. */
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
  ecluse: [
    'des services présentés un par un, avec un accès direct à chacun ;',
    'des réalisations racontées en trois temps : le besoin, l’intervention, le résultat (projets types) ;',
    'une page entretien avec des questions fréquentes ;',
    'un formulaire qui aide à décrire la situation : sujet, appareil, photos (formulaire désactivé).',
  ],
  lueur: [
    'une ambiance du soir, sombre et chaleureuse ;',
    'des prestations détaillées une à une ;',
    'des réalisations présentées comme projets types ;',
    'une page de conseils pratiques pour la maison ;',
    'une page contact qui aide à préparer la demande (formulaire désactivé).',
  ],
  moellon: [
    'une mise en page éditoriale, aux tons de pierre et de terre cuite ;',
    'des chantiers détaillés : travaux, matériaux, point clé (projets types) ;',
    'un schéma qui explique une technique : la coupe d’un mur et d’une dalle ;',
    'une approche en étapes, avec des questions fréquentes ;',
    'une page contact claire (formulaire désactivé).',
  ],
};

export const demoDescriptions: Record<DemoId, string> = {
  rivage: 'Un paysagiste qui dessine des jardins naturels, pour toutes les saisons.',
  faitage: 'Un charpentier qui construit, rénove et agrandit en bois.',
  ecluse: 'Un plombier-chauffagiste qui explique avant d’intervenir, de la petite fuite au chauffage complet.',
  lueur: 'Un électricien qui rénove, sécurise et met en lumière les maisons.',
  moellon: 'Un maçon qui rénove les maisons anciennes en pierre et les agrandit.',
};
