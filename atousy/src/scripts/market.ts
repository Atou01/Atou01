// Marché affiché : Europe · EUR ou Suisse · CHF (identifiants internes 'fr' et 'ch').
// Priorité : choix manuel du visiteur (mémorisé) > pays détecté par Cloudflare, posé sur
// <html data-market> avant l'envoi de la page (functions/_middleware.js) > repli sur
// /api/pays si la page arrive sans détection > Europe · EUR par défaut, signalé comme tel.
// Le CSS masque le prix de l'autre marché.
import { marketForCountry } from '../../server/market.js';

type MarketId = 'fr' | 'ch';
type Source = 'choice' | 'detected' | 'default';

const KEY = 'atousy-market'; // choix manuel (localStorage)
const AUTO_KEY = 'atousy-market-auto'; // dernière détection, pour la session (sessionStorage)

const LABEL: Record<MarketId, string> = { fr: 'Europe · EUR', ch: 'Suisse · CHF' };
const STATUS: Record<Source, string> = {
  choice: 'votre choix',
  detected: 'détecté automatiquement',
  default: 'par défaut',
};

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

function apply(m: MarketId, source: Source) {
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
  document.dispatchEvent(new CustomEvent('atousy:market', { detail: { market: m, source } }));
}

function choose(m: MarketId) {
  write(local, KEY, m);
  apply(m, 'choice');
}

async function detect(): Promise<MarketId | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch('/api/pays', { signal: ctrl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return marketForCountry((data as { country?: unknown })?.country) as MarketId | null;
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

  const saved = read(local, KEY);
  if (saved) {
    apply(saved, 'choice');
    return;
  }
  // Pays déjà détecté par Cloudflare avant l'envoi de la page : rien d'autre à faire.
  const root = document.documentElement;
  if (root.dataset.marketSource === 'detected' && isMarket(root.dataset.market)) {
    apply(root.dataset.market, 'detected');
    return;
  }
  // Repli (page servie sans détection) : détection de la session, puis /api/pays.
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
