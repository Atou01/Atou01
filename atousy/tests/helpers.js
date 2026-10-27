// Outils communs aux tests (node:test). Aucun appel réseau réel : fetch est simulé.

export const ORIGIN = 'https://atousy.com';
// Poste local (wrangler pages dev) : seul endroit où les clés de test Turnstile sont acceptées.
export const LOCAL_ORIGIN = 'http://localhost:8788';
export const LOCAL_DEVIS_URL = `${LOCAL_ORIGIN}/api/devis`;
export const DEVIS_URL = `${ORIGIN}/api/devis`;
export const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
export const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
export const RESEND_URL = 'https://api.resend.com/emails';

export const PASS_SECRET = '1x0000000000000000000000000000000AA';
export const FAIL_SECRET = '2x0000000000000000000000000000000AA';

export const BREVO_ENV = Object.freeze({
  TURNSTILE_SECRET_KEY: 'ts-secret-prod',
  EMAIL_PROVIDER: 'brevo',
  BREVO_API_KEY: 'xkeysib-test-key',
  MAIL_TO: 'contact@atousy.com',
  MAIL_FROM: 'Atousy <contact@atousy.com>',
});

export const RESEND_ENV = Object.freeze({
  TURNSTILE_SECRET_KEY: 'ts-secret-prod',
  EMAIL_PROVIDER: 'resend',
  RESEND_API_KEY: 're_test_key',
  MAIL_TO: 'contact@atousy.com',
  MAIL_FROM: 'Atousy <contact@atousy.com>',
});

/** Ouverture du formulaire : 42 minutes avant l'horloge fixe des tests (26/10/2026 14:42 UTC). */
export const STARTED = Date.UTC(2026, 9, 26, 14, 0, 0);

/** Champs valides (aucune ville réelle, conformément aux règles du projet). */
export function validFields(overrides = {}) {
  return {
    type: 'refonte',
    activite: 'Plombier chauffagiste',
    zone: 'Ma commune et 20 km autour',
    site: 'exemple.fr',
    besoin: 'Notre site actuel date de plusieurs années, il faut le moderniser.',
    nom: 'Camille Martin',
    email: 'camille@example.org',
    telephone: '06 12 34 56 78',
    market: 'fr',
    website: '',
    started: String(STARTED),
    'cf-turnstile-response': 'token-abc',
    ...overrides,
  };
}

const baseHeaders = (headers) => ({ origin: ORIGIN, 'cf-connecting-ip': '203.0.113.7', ...headers });

export function formRequest(fields, { headers = {}, url = DEVIS_URL } = {}) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) body.append(k, String(v));
  return new Request(url, {
    method: 'POST',
    headers: baseHeaders({ 'content-type': 'application/x-www-form-urlencoded', ...headers }),
    body: body.toString(),
  });
}

export function jsonRequest(fields, { headers = {}, url = DEVIS_URL } = {}) {
  return new Request(url, {
    method: 'POST',
    headers: baseHeaders({ 'content-type': 'application/json', ...headers }),
    body: JSON.stringify(fields),
  });
}

export function multipartRequest(fields, { headers = {}, url = DEVIS_URL } = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) fd.append(k, String(v));
  // Le Content-Type multipart (avec boundary) est posé par Request à partir du FormData.
  return new Request(url, { method: 'POST', headers: baseHeaders(headers), body: fd });
}

/**
 * fetch simulé : répond à Siteverify et au fournisseur d'e-mail, enregistre chaque appel.
 * @param {object} [opts]
 * @param {object | ((call) => Response | Promise<Response>)} [opts.turnstile]
 * @param {object | ((call) => Response | Promise<Response>)} [opts.provider] { status, body }
 */
export function createFetch({ turnstile = { success: true, hostname: 'atousy.com', action: 'devis' }, provider = { status: 201, body: { messageId: '<1@relay>' } } } = {}) {
  const calls = [];
  const fn = async (input, init = {}) => {
    const url = String(input);
    const call = {
      url,
      init,
      headers: new Headers(init.headers),
      body: typeof init.body === 'string' ? JSON.parse(init.body) : init.body,
    };
    calls.push(call);
    const handler = url === SITEVERIFY ? turnstile : provider;
    if (typeof handler === 'function') return handler(call);
    if (url === SITEVERIFY) return Response.json(handler);
    return new Response(JSON.stringify(handler.body ?? {}), {
      status: handler.status,
      headers: { 'content-type': 'application/json' },
    });
  };
  fn.calls = calls;
  fn.providerCalls = () => calls.filter((c) => c.url !== SITEVERIFY);
  fn.turnstileCalls = () => calls.filter((c) => c.url === SITEVERIFY);
  return fn;
}

/** Réponse qui n'arrive jamais : rejette seulement quand le signal est annulé. */
export function hangingResponse(call) {
  return new Promise((_, reject) => {
    call.init.signal.addEventListener('abort', () => reject(new DOMException('The operation was aborted.', 'AbortError')));
  });
}

/** Journal capturé, pour vérifier qu'il ne contient aucune donnée personnelle ni secret. */
export function createLogger() {
  const lines = [];
  const push = (...args) => lines.push(args.map(String).join(' '));
  return { lines, error: push, warn: push, info: push, log: push };
}

export async function read(response) {
  return { status: response.status, headers: response.headers, body: await response.json() };
}
