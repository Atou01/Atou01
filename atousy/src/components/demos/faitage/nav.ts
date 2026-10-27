// Navigation de la démonstration fictive Faîtage (charpentier).
export type FaitagePage = 'accueil' | 'realisations' | 'savoir-faire' | 'atelier' | 'contact';

export const faitageNav: { key: FaitagePage; label: string; href: string }[] = [
  { key: 'accueil', label: 'Accueil', href: '/exemples/faitage/' },
  { key: 'realisations', label: 'Réalisations', href: '/exemples/faitage/realisations/' },
  { key: 'savoir-faire', label: 'Savoir-faire', href: '/exemples/faitage/savoir-faire/' },
  { key: 'atelier', label: 'L’atelier', href: '/exemples/faitage/atelier/' },
  { key: 'contact', label: 'Contact', href: '/exemples/faitage/contact/' },
];
