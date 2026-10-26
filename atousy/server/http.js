// Petits utilitaires HTTP partagés par les Pages Functions.
// Ce dossier est hors de functions/ : il n'est jamais exposé comme route,
// wrangler l'embarque via les imports relatifs.

/**
 * Réponse JSON utf-8, jamais mise en cache.
 * @param {number} status
 * @param {unknown} body
 * @param {Record<string, string>} [headers]
 */
export function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}

/**
 * Hôte local (poste de développement) : localhost, 127.0.0.1 ou [::1].
 * @param {string} hostname valeur de `URL.hostname`
 */
export function isLoopbackHostname(hostname) {
  return ['localhost', '127.0.0.1', '[::1]'].includes(String(hostname).toLowerCase());
}

export class BodyTooLargeError extends Error {
  constructor() {
    super('body_too_large');
    this.name = 'BodyTooLargeError';
  }
}

/**
 * Lit le corps de la requête sans jamais dépasser `limit` octets,
 * même sans Content-Length (envoi « chunked ») : on arrête la lecture
 * dès que la limite est franchie.
 * @param {Request} request
 * @param {number} limit
 * @returns {Promise<Uint8Array>}
 */
export async function readBodyLimited(request, limit) {
  const declared = request.headers.get('content-length');
  if (declared !== null && /^\d+$/.test(declared.trim()) && Number(declared) > limit) {
    throw new BodyTooLargeError();
  }
  if (!request.body) return new Uint8Array(0);

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel().catch(() => {});
      throw new BodyTooLargeError();
    }
    chunks.push(value);
  }

  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

/**
 * `fetch` avec délai maximal (AbortController). Rejette en cas de délai dépassé.
 * @param {typeof fetch} fetchImpl
 * @param {string} url
 * @param {RequestInit} init
 * @param {number} timeoutMs
 * @param {(res: Response) => Promise<T>} consume lecture du corps, comprise dans le délai
 * @returns {Promise<{ response: Response, result: T }>}
 * @template T
 */
export async function fetchWithTimeout(fetchImpl, url, init, timeoutMs, consume) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { ...init, signal: controller.signal });
    const result = await consume(response);
    return { response, result };
  } finally {
    clearTimeout(timer);
  }
}

/** Lit au plus `max` caractères d'un corps de réponse, sans jamais lever. */
export async function readTextCapped(response, max = 4096) {
  try {
    const text = await response.text();
    return text.slice(0, max);
  } catch {
    return '';
  }
}
