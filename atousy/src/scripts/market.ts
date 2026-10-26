// Choix du marché (France · EUR / Suisse · CHF).
// Priorité : choix manuel enregistré > détection (/api/pays) > France par défaut.
// Le marché courant est posé sur <html data-market> ; le CSS masque l'autre prix.

type MarketId = 'fr' | 'ch';
type Source = 'choice' | 'detected' | 'default';

const KEY = 'atousy-market';
const COUNTRY: Record<MarketId, string> = { fr: 'France', ch: 'Suisse' };
const STATUS: Record<Source, string> = {
  choice: 'votre choix',
  detected: 'détecté automatiquement',
  default: 'par défaut',
};

const isMarket = (v: unknown): v is MarketId => v === 'fr' || v === 'ch';

function readChoice(): MarketId | null {
  try {
    const v = localStorage.getItem(KEY);
    return isMarket(v) ? v : null;
  } catch {
    return null;
  }
}

function saveChoice(m: MarketId) {
  try {
    localStorage.setItem(KEY, m);
  } catch {
    /* stockage indisponible : le choix vaut pour la page en cours */
  }
}

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
    el.textContent = COUNTRY[m];
  });
  document.querySelectorAll('[data-market-status]').forEach((el) => {
    el.textContent = STATUS[source];
  });
  document.querySelectorAll('[data-market-other]').forEach((el) => {
    el.textContent = COUNTRY[m === 'fr' ? 'ch' : 'fr'];
  });
  document.dispatchEvent(new CustomEvent('atousy:market', { detail: { market: m, source } }));
}

function choose(m: MarketId) {
  saveChoice(m);
  apply(m, 'choice');
}

async function detect(): Promise<MarketId | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch('/api/pays', { signal: ctrl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const country = (data as { country?: unknown })?.country;
    if (country === 'CH' || country === 'LI') return 'ch';
    if (country === 'FR') return 'fr';
    return null;
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

  const saved = readChoice();
  if (saved) {
    apply(saved, 'choice');
    return;
  }
  apply('fr', 'default');
  detect().then((m) => {
    // Le visiteur a pu choisir pendant la détection : son choix prime.
    if (m && !readChoice()) apply(m, 'detected');
  });
}

init();
