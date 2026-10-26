// Vérification Cloudflare Turnstile côté serveur (Siteverify).
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

import { fetchWithTimeout } from './http.js';

export const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
export const TURNSTILE_TIMEOUT_MS = 5000;
export const MAX_TOKEN_LENGTH = 2048;

// Clés secrètes de test officielles : Siteverify renvoie alors un hostname
// factice (« example.com »), on ne contrôle donc ni le hostname ni l'action avec elles.
// La première accepte N'IMPORTE QUEL jeton : server/devis.js refuse ces clés hors
// d'un poste local (localhost), pour qu'elles ne désactivent jamais l'anti-robot en ligne.
const TEST_SECRETS = new Set([
  '1x0000000000000000000000000000000AA', // passe toujours
  '2x0000000000000000000000000000000AA', // échoue toujours
  '3x0000000000000000000000000000000AA', // « jeton déjà utilisé »
]);

/** Clé secrète de test officielle de Cloudflare ? */
export const isTestSecret = (secret) => TEST_SECRETS.has(secret);

// Erreurs qui viennent de notre configuration, pas du visiteur.
const CONFIG_ERRORS = new Set(['missing-input-secret', 'invalid-input-secret']);

/**
 * @typedef {{ ok: true } | { ok: false, reason: 'captcha' | 'config' | 'unavailable', codes?: string[] }} TurnstileResult
 */

/**
 * @param {object} p
 * @param {string} p.secret
 * @param {string} p.token
 * @param {string | null} p.remoteip
 * @param {string[]} p.allowedHostnames hostnames acceptés (en minuscules)
 * @param {string} [p.expectedAction] action posée par le widget (`action: 'devis'` côté navigateur)
 * @param {typeof fetch} p.fetch
 * @param {number} [p.timeoutMs]
 * @returns {Promise<TurnstileResult>}
 */
export async function verifyTurnstile({ secret, token, remoteip, allowedHostnames, expectedAction, fetch, timeoutMs = TURNSTILE_TIMEOUT_MS }) {
  if (!token || token.length > MAX_TOKEN_LENGTH) return { ok: false, reason: 'captcha', codes: ['missing-or-oversized-token'] };

  // Pas d'idempotency_key : elle ne sert qu'à revérifier un même jeton, et on ne réessaie jamais.
  const payload = { secret, response: token };
  if (remoteip) payload.remoteip = remoteip;

  let status;
  let data;
  try {
    const { response, result } = await fetchWithTimeout(
      fetch,
      SITEVERIFY_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'manual',
      },
      timeoutMs,
      // Siteverify répond en JSON, y compris pour certaines erreurs (statut 4xx).
      async (res) => res.json().catch(() => null),
    );
    status = response.status;
    data = result;
  } catch {
    return { ok: false, reason: 'unavailable', codes: ['network-or-timeout'] };
  }

  if (!data || typeof data !== 'object' || typeof data.success !== 'boolean') {
    return { ok: false, reason: 'unavailable', codes: [`http-${status}`] };
  }
  // Un succès n'est accepté qu'avec un statut 2xx.
  if (data.success === true && (status < 200 || status > 299)) {
    return { ok: false, reason: 'unavailable', codes: [`http-${status}`] };
  }

  const codes = Array.isArray(data['error-codes']) ? data['error-codes'].map(String).slice(0, 5) : [];

  if (data.success !== true) {
    if (codes.some((c) => CONFIG_ERRORS.has(c))) return { ok: false, reason: 'config', codes };
    if (codes.includes('internal-error')) return { ok: false, reason: 'unavailable', codes };
    return { ok: false, reason: 'captcha', codes };
  }

  // Défense en profondeur recommandée par Cloudflare : le jeton doit avoir
  // été obtenu sur notre propre domaine, par le widget du formulaire de devis.
  if (!TEST_SECRETS.has(secret)) {
    const hostname = typeof data.hostname === 'string' ? data.hostname.toLowerCase() : '';
    if (!hostname || !allowedHostnames.includes(hostname)) {
      return { ok: false, reason: 'captcha', codes: ['hostname-mismatch'] };
    }
    if (expectedAction && data.action !== expectedAction) {
      return { ok: false, reason: 'captcha', codes: ['action-mismatch'] };
    }
  }

  return { ok: true };
}
