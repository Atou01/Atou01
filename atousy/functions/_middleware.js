// Marché posé côté serveur sur chaque page HTML : un visiteur en Suisse reçoit directement
// <html data-market="ch">, donc ne voit que le prix en CHF, dès le premier affichage et même
// sans JavaScript. Le choix manuel (mémorisé dans le navigateur) reste prioritaire côté client.
// Les fichiers statiques (images, CSS, JS) ne passent pas par ici : voir public/_routes.json.

import { countryOf, marketForCountry } from '../server/market.js';

/** @param {{ request: Request, next: () => Promise<Response> }} context */
export async function onRequest({ request, next }) {
  const response = await next();
  if (request.method !== 'GET' && request.method !== 'HEAD') return response;
  if (!(response.headers.get('content-type') ?? '').includes('text/html')) return response;

  const market = marketForCountry(countryOf(request));
  if (!market || typeof HTMLRewriter === 'undefined') return response;

  const rewritten = new HTMLRewriter()
    .on('html', {
      element(el) {
        el.setAttribute('data-market', market);
        el.setAttribute('data-market-source', 'detected');
      },
    })
    .transform(response);
  // La page dépend du pays : jamais de mise en cache partagée, ni de revalidation par ETag
  // (l'ETag du fichier statique est le même quel que soit le pays).
  const headers = new Headers(rewritten.headers);
  headers.set('Cache-Control', 'private, no-cache');
  headers.delete('ETag');
  return new Response(rewritten.body, { status: rewritten.status, statusText: rewritten.statusText, headers });
}
