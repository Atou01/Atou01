// Marché affiché : Europe · EUR ou Suisse · CHF (identifiants internes 'fr' et 'ch').
// Priorité : choix manuel du visiteur (mémorisé) > pays détecté par Cloudflare, posé sur
// <html data-market> avant l'envoi de la page (functions/_middleware.js) > repli sur
// /api/pays si la page arrive sans détection > Europe · EUR par défaut, signalé comme tel.
// Le CSS masque le prix de l'autre marché.
import { marketForCountry } from '../../server/market.js';

type MarketId = 'fr' | 'ch';
type Source = 'choice' | 'detected' | 'default';

const KEY = 'atousy-market'; // choix manuel (localStorage)
const AUTO_KEY = 'atousy-market-auto'; // résultat de la détection, pour la session (sessionStorage)
// Valeur de AUTO_KEY quand le pays est inconnu ou hors des deux marchés : /api/pays n'est
// alors pas rappelé à chaque page de la session.
const NONE = 'none';

const LABEL: Record<MarketId, string> = { fr: 'Europe · EUR', ch: 'Suisse · CHF' };
const STATUS: Record<Source, string> = {
  choice: 'votre choix',
  detected: 'détecté automatiquement',
  default: 'par défaut',
};

const isMarket = (v: unknown): v is MarketId => v === 'fr' || v === 'ch';

function readRaw(store: () => Storage, key: string): string | null {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
}

function read(store: () => Storage, key: string): MarketId | null {
  const v = readRaw(store, key);
  return isMarket(v) ? v : null;
}

function write(store: () => Storage, key: string, value: string) {
  try {
    store().setItem(key, value);
  } catch {
    /* stockage indisponible : le choix vaut pour la page en cours */
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;
const root = document.documentElement;
const selects = () => document.querySelectorAll<HTMLSelectElement>('[data-market-select]');

// Pays posé par Cloudflare avant l'envoi de la page. Lu une seule fois : apply() réécrit ces attributs.
const serverMarket: MarketId | null =
  root.dataset.marketSource === 'detected' && isMarket(root.dataset.market) ? root.dataset.market : null;

// Choix fait sur cette page : il prime sur la détection même quand le stockage est bloqué.
let chosen: MarketId | null = null;
let detecting = false;

function syncSelects() {
  const m = root.dataset.market;
  if (!isMarket(m)) return;
  selects().forEach((s) => {
    s.value = m;
  });
}

function apply(m: MarketId, source: Source) {
  root.dataset.market = m;
  root.dataset.marketSource = source;
  syncSelects();
  document.querySelectorAll('[data-market-country]').forEach((el) => {
    el.textContent = LABEL[m];
  });
  document.querySelectorAll('[data-market-status]').forEach((el) => {
    el.textContent = STATUS[source];
  });
  document.dispatchEvent(new CustomEvent('atousy:market', { detail: { market: m, source } }));
}

function choose(m: MarketId) {
  chosen = m;
  write(local, KEY, m);
  apply(m, 'choice');
}

/** Marché du pays renvoyé par /api/pays, NONE s'il n'en a pas, null si la requête a échoué. */
async function detect(): Promise<MarketId | typeof NONE | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch('/api/pays', { signal: ctrl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return (marketForCountry((data as { country?: unknown })?.country) as MarketId | null) ?? NONE;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function resolve() {
  // Le stockage d'abord (il reflète un choix fait sur une autre page), le choix en mémoire sinon.
  const saved = read(local, KEY) ?? chosen;
  if (saved) {
    apply(saved, 'choice');
    return;
  }
  // Pays déjà détecté par Cloudflare avant l'envoi de la page : rien d'autre à faire.
  if (serverMarket) {
    apply(serverMarket, 'detected');
    return;
  }
  // Repli (page servie sans détection) : détection de la session, puis /api/pays.
  const known = readRaw(session, AUTO_KEY);
  if (isMarket(known)) {
    apply(known, 'detected');
    return;
  }
  apply('fr', 'default');
  if (known === NONE || detecting) return;
  detecting = true;
  detect().then((m) => {
    detecting = false;
    if (!m) return; // échec réseau : nouvel essai à la page suivante
    write(session, AUTO_KEY, m);
    // Le visiteur a pu choisir pendant la détection : son choix prime.
    if (isMarket(m) && !chosen && !read(local, KEY)) apply(m, 'detected');
  });
}

function init() {
  selects().forEach((s) => {
    // Pas de restauration du sélecteur par l'historique : elle contredirait le marché appliqué.
    s.autocomplete = 'off';
    s.addEventListener('change', () => {
      if (isMarket(s.value)) choose(s.value);
    });
  });
  resolve();
  // Retour arrière : une page sortie du cache (bfcache) peut afficher un marché périmé
  // (choix fait sur une autre page) ; sinon le navigateur peut avoir restauré un ancien choix
  // dans les sélecteurs après ce script.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) resolve();
    else syncSelects();
  });
}

init();
