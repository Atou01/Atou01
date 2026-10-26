// GET /api/pays : pays du visiteur, déduit par Cloudflare de son adresse IP.
// Sert uniquement à proposer le bon marché (France · EUR / Suisse · CHF) ;
// le choix manuel du visiteur prime toujours côté client.
//   200 {"country":"FR"}  ou  {"country":null} si inconnu.

import { json } from '../../server/http.js';

// XX : pays inconnu ; T1 : réseau Tor. Ni l'un ni l'autre n'est un pays.
const NOT_A_COUNTRY = new Set(['XX', 'T1']);

/** @param {Request & { cf?: { country?: unknown } }} request */
export function countryOf(request) {
  const raw = request.cf?.country ?? request.headers.get('cf-ipcountry');
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || NOT_A_COUNTRY.has(code)) return null;
  return code;
}

/** @param {{ request: Request }} context */
export function onRequest({ request }) {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json(405, { ok: false, error: 'method' }, { ...headers, Allow: 'GET, HEAD' });
  }
  const response = json(200, { country: countryOf(request) }, headers);
  return request.method === 'HEAD' ? new Response(null, { status: 200, headers: response.headers }) : response;
}
