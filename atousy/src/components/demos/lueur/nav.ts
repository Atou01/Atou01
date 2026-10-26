// Navigation de la démonstration fictive Lueur (électricien).
export type LueurPage = 'accueil' | 'prestations' | 'realisations' | 'conseils' | 'contact';

export const lueurNav: { key: LueurPage; label: string; href: string }[] = [
  { key: 'accueil', label: 'Accueil', href: '/exemples/lueur/' },
  { key: 'prestations', label: 'Prestations', href: '/exemples/lueur/prestations/' },
  { key: 'realisations', label: 'Réalisations', href: '/exemples/lueur/realisations/' },
  { key: 'conseils', label: 'Conseils', href: '/exemples/lueur/conseils/' },
  { key: 'contact', label: 'Contact', href: '/exemples/lueur/contact/' },
];

export const lueurServices: { id: string; label: string; href: string }[] = [
  { id: 'renovation', label: 'Rénovation électrique', href: '/exemples/lueur/prestations/#renovation' },
  { id: 'tableau', label: 'Tableau électrique', href: '/exemples/lueur/prestations/#tableau' },
  { id: 'eclairage', label: 'Éclairage intérieur et extérieur', href: '/exemples/lueur/prestations/#eclairage' },
  { id: 'borne', label: 'Borne de recharge', href: '/exemples/lueur/prestations/#borne' },
  { id: 'domotique', label: 'Domotique simple', href: '/exemples/lueur/prestations/#domotique' },
];
