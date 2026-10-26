// Navigation de la démonstration fictive Rivage (paysagiste).
export type RivagePage = 'accueil' | 'approche' | 'savoir-faire' | 'jardins' | 'contact';

export const rivageNav: { key: RivagePage; label: string; href: string }[] = [
  { key: 'approche', label: 'Notre approche', href: '/exemples/rivage/approche/' },
  { key: 'savoir-faire', label: 'Savoir-faire', href: '/exemples/rivage/savoir-faire/' },
  { key: 'jardins', label: 'Votre jardin', href: '/exemples/rivage/jardins/' },
];
