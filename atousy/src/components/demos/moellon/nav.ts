// Navigation de la démonstration fictive Moellon (maçon, rénovation).
export type MoellonPage = 'accueil' | 'savoir-faire' | 'chantiers' | 'approche' | 'contact';

export const moellonNav: { key: MoellonPage; label: string; href: string }[] = [
  { key: 'accueil', label: 'Accueil', href: '/exemples/moellon/' },
  { key: 'savoir-faire', label: 'Savoir-faire', href: '/exemples/moellon/savoir-faire/' },
  { key: 'chantiers', label: 'Chantiers', href: '/exemples/moellon/chantiers/' },
  { key: 'approche', label: 'Notre approche', href: '/exemples/moellon/approche/' },
  { key: 'contact', label: 'Contact', href: '/exemples/moellon/contact/' },
];

/** Les cinq savoir-faire, avec leur ancre sur la page Savoir-faire. */
export const moellonCrafts: { id: string; label: string; short: string }[] = [
  {
    id: 'maisons-anciennes',
    label: 'Rénovation de maisons anciennes',
    short: 'Reprendre une maison de caractère sans trahir ce qui fait son charme.',
  },
  {
    id: 'extensions',
    label: 'Extensions',
    short: 'Agrandir en maçonnerie, dans la continuité de la maison existante.',
  },
  {
    id: 'ouvertures',
    label: 'Ouvertures de murs porteurs',
    short: 'Créer ou agrandir une baie, avec étaiement et linteau dimensionnés.',
  },
  {
    id: 'pierre-chaux',
    label: 'Murs en pierre et joints à la chaux',
    short: 'Monter, reprendre et rejointoyer la pierre avec des mortiers qui respirent.',
  },
  {
    id: 'dalles-fondations',
    label: 'Dalles et fondations',
    short: 'Des bases saines : terrassement, semelles, dallages et chapes.',
  },
];
