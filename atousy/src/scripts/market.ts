// Marché affiché : Europe · EUR ou Suisse · CHF (identifiants internes 'fr' et 'ch').
// Priorité : choix manuel du visiteur (mémorisé) > détection automatique du pays
// via /api/pays (Cloudflare) > Europe · EUR par défaut, signalé comme tel.
// Le marché courant est posé sur <html data-market> ; le CSS masque l'autre prix.

type MarketId = 'fr' | 'ch';
type Source = 'choice' | 'detected' | 'default';

const KEY = 'atousy-market'; // choix manuel (localStorage)
const AUTO_KEY = 'atousy-market-auto'; // dernière détection, pour la session (sessionStorage)

const LABEL: Record<MarketId, string> = { fr: 'Europe · EUR', ch: 'Suisse · CHF' };
const OTHER: Record<MarketId, string> = { fr: 'Suisse · CHF', ch: 'Europe · EUR' };
const STATUS: Record<Source, string> = {
  choice: 'votre choix',
  detected: 'détecté automatiquement',
  default: 'par défaut',
};

// Suisse et Liechtenstein (franc suisse) → CHF.
const CHF_COUNTRIES = new Set(['CH', 'LI']);
// Pays européens → EUR, considérés comme détectés.
const EUROPE = new Set([
  'AD', 'AL', 'AT', 'AX', 'BA', 'BE', 'BG', 'BY', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FO',
  'FR', 'GB', 'GG', 'GI', 'GR', 'HR', 'HU', 'IE', 'IM', 'IS', 'IT', 'JE', 'LT', 'LU', 'LV', 'MC',
  'MD', 'ME', 'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'SE', 'SI', 'SK', 'SM', 'UA', 'VA',
  'XK', 'GP', 'MQ', 'GF', 'RE', 'YT', 'PM', 'BL', 'MF',
]);

const isMarket = (v: unknown): v is MarketId => v === 'fr' || v === 'ch';

function read(store: () => Storage, key: string): MarketId | null {
  try {
    const v = store().getItem(key);
    return isMarket(v) ? v : null;
  } catch {
    return null;
  }
}

function write(store: () => Storage, key: string, m: MarketId) {
  try {
    store().setItem(key, m);
  } catch {
    /* stockage indisponible : le choix vaut pour la page en cours */
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

let current: MarketId = 'fr';

function apply(m: MarketId, source: Source) {
  current = m;
  const root = document.documentElement;
  root.dataset.market = m;
  root.dataset.marketSource = source;
  document.querySelectorAll<HTMLSelectElement>('[data-market-select]').forEach((s) => {
    s.value = m;
  });
  document.querySelectorAll('[data-market-country]').forEach((el) => {
    el.textContent = LABEL[m];
  });
  document.querySelectorAll('[data-market-status]').forEach((el) => {
    el.textContent = STATUS[source];
  });
  document.querySelectorAll('[data-market-other]').forEach((el) => {
    el.textContent = OTHER[m];
  });
  document.dispatchEvent(new CustomEvent('atousy:market', { detail: { market: m, source } }));
}

function choose(m: MarketId) {
  write(local, KEY, m);
  apply(m, 'choice');
}

/** Pays → marché. null si le pays est inconnu ou hors Europe (on garde le défaut). */
export function marketForCountry(country: unknown): MarketId | null {
  if (typeof country !== 'string') return null;
  const c = country.toUpperCase();
  if (CHF_COUNTRIES.has(c)) return 'ch';
  if (EUROPE.has(c)) return 'fr';
  return null;
}

async function detect(): Promise<MarketId | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch('/api/pays', { signal: ctrl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return marketForCountry((data as { country?: unknown })?.country);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function init() {
  document.querySelectorAll<HTMLSelectElement>('[data-market-select]').forEach((s) => {
    s.addEventListener('change', () => {
      if (isMarket(s.value)) choose(s.value);
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-market-switch]').forEach((b) => {
    b.addEventListener('click', () => choose(current === 'fr' ? 'ch' : 'fr'));
  });

  const saved = read(local, KEY);
  if (saved) {
    apply(saved, 'choice');
    return;
  }
  // Détection déjà faite pendant la session : affichage immédiat, sans saut de prix.
  const known = read(session, AUTO_KEY);
  apply(known ?? 'fr', known ? 'detected' : 'default');
  detect().then((m) => {
    if (!m) return;
    write(session, AUTO_KEY, m);
    // Le visiteur a pu choisir pendant la détection : son choix prime.
    if (!read(local, KEY)) apply(m, 'detected');
  });
}

init();
