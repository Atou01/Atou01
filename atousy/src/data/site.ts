// Données partagées du site Atousy (navigation, marchés, offre).

export const site = {
  name: 'Atousy',
  tagline: 'studio web & design',
  url: 'https://atousy.com',
};

export type NavItem = { label: string; href: string; children?: NavItem[] };

export const mainNav: NavItem[] = [
  {
    label: 'Services',
    href: '/creation/',
    children: [
      { label: 'Création de site', href: '/creation/' },
      { label: 'Refonte de site', href: '/refonte/' },
    ],
  },
  { label: 'Exemples', href: '/exemples/' },
  { label: "L'offre", href: '/offre/' },
  { label: 'Méthode', href: '/methode/' },
];

export const footerNav: NavItem[] = [
  { label: 'Création', href: '/creation/' },
  { label: 'Refonte', href: '/refonte/' },
  { label: 'Exemples', href: '/exemples/' },
  { label: "L'offre", href: '/offre/' },
  { label: 'Méthode', href: '/methode/' },
  { label: 'Devis', href: '/devis/' },
];

export const legalNav: NavItem[] = [
  { label: 'Mentions légales', href: '/mentions-legales/' },
  { label: 'Confidentialité', href: '/confidentialite/' },
];

// Prix de travail validés dans le brief. Le marché choisi à la main prime
// toujours sur la détection (voir src/scripts/market.ts).
export type MarketId = 'fr' | 'ch';

export const markets: Record<MarketId, { id: MarketId; country: string; currency: string; label: string; price: string }> = {
  fr: { id: 'fr', country: 'France', currency: 'EUR', label: 'France · EUR', price: '1 490 €' },
  ch: { id: 'ch', country: 'Suisse', currency: 'CHF', label: 'Suisse · CHF', price: '1 990 CHF' },
};

export const defaultMarket: MarketId = 'fr';

export const priceNote = 'Tarif indicatif · Taxes et montant final à confirmer au devis';

export const offerHighlights = [
  "Jusqu'à 5 pages",
  'Adaptation aux smartphones',
  'Bases du référencement local',
  'Deux séries de corrections',
];

export const offerExclusions = 'Domaine, hébergement et demandes supplémentaires non inclus.';
