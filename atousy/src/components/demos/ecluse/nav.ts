// Navigation de la démonstration fictive Écluse (plombier-chauffagiste).
export type EclusePage = 'accueil' | 'services' | 'realisations' | 'entretien' | 'contact';

export const ecluseNav: { key: EclusePage; label: string; href: string }[] = [
  { key: 'accueil', label: 'Accueil', href: '/exemples/ecluse/' },
  { key: 'services', label: 'Services', href: '/exemples/ecluse/services/' },
  { key: 'realisations', label: 'Réalisations', href: '/exemples/ecluse/realisations/' },
  { key: 'entretien', label: 'Entretien', href: '/exemples/ecluse/entretien/' },
  { key: 'contact', label: 'Contact', href: '/exemples/ecluse/contact/' },
];

// Les cinq métiers, avec leur ancre sur la page Services.
export const ecluseServices: { id: string; label: string; href: string }[] = [
  { id: 'depannage', label: 'Dépannage', href: '/exemples/ecluse/services/#depannage' },
  { id: 'salle-de-bain', label: 'Salle de bain', href: '/exemples/ecluse/services/#salle-de-bain' },
  { id: 'chauffage', label: 'Chauffage & chaudière', href: '/exemples/ecluse/services/#chauffage' },
  { id: 'pompe-a-chaleur', label: 'Pompe à chaleur', href: '/exemples/ecluse/services/#pompe-a-chaleur' },
  { id: 'entretien', label: 'Entretien', href: '/exemples/ecluse/services/#entretien' },
];
