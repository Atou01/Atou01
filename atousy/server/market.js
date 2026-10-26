// Pays → marché affiché, partagé par le serveur (functions/) et le navigateur (src/scripts/market.ts).
// 'ch' = Suisse · CHF (Suisse, Liechtenstein) ; 'fr' = Europe · EUR (pays européens).
// Hors Europe ou pays inconnu : null, le site affiche alors Europe · EUR « par défaut ».

/** @typedef {'fr' | 'ch'} MarketId */

export const CHF_COUNTRIES = new Set(['CH', 'LI']);

export const EURO_COUNTRIES = new Set([
  'AD', 'AL', 'AT', 'AX', 'BA', 'BE', 'BG', 'BY', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FO',
  'FR', 'GB', 'GG', 'GI', 'GR', 'HR', 'HU', 'IE', 'IM', 'IS', 'IT', 'JE', 'LT', 'LU', 'LV', 'MC',
  'MD', 'ME', 'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'SE', 'SI', 'SK', 'SM', 'UA', 'VA',
  'XK', 'GP', 'MQ', 'GF', 'RE', 'YT', 'PM', 'BL', 'MF',
]);

// XX : pays inconnu ; T1 : réseau Tor. Ni l'un ni l'autre n'est un pays.
const NOT_A_COUNTRY = new Set(['XX', 'T1']);

/**
 * Pays du visiteur déduit par Cloudflare (request.cf.country, sinon en-tête CF-IPCountry).
 * @param {Request & { cf?: { country?: unknown } }} request
 * @returns {string | null}
 */
export function countryOf(request) {
  const raw = request.cf?.country ?? request.headers.get('cf-ipcountry');
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || NOT_A_COUNTRY.has(code)) return null;
  return code;
}

/**
 * @param {unknown} country code pays ISO 3166-1 alpha-2
 * @returns {MarketId | null}
 */
export function marketForCountry(country) {
  if (typeof country !== 'string') return null;
  const code = country.toUpperCase();
  if (CHF_COUNTRIES.has(code)) return 'ch';
  if (EURO_COUNTRIES.has(code)) return 'fr';
  return null;
}
