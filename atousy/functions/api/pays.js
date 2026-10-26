// GET /api/pays : pays du visiteur, déduit par Cloudflare de son adresse IP.
// Sert uniquement à proposer le bon marché (Europe · EUR / Suisse · CHF) ;
// le choix manuel du visiteur prime toujours côté client.
//   200 {"country":"FR"}  ou  {"country":null} si inconnu.

import { json } from '../../server/http.js';
import { countryOf } from '../../server/market.js';

export { countryOf };

/** @param {{ request: Request }} context */
export function onRequest({ request }) {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json(405, { ok: false, error: 'method' }, { ...headers, Allow: 'GET, HEAD' });
  }
  const response = json(200, { country: countryOf(request) }, headers);
  return request.method === 'HEAD' ? new Response(null, { status: 200, headers: response.headers }) : response;
}
