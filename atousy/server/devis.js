// Logique de POST /api/devis (formulaire de demande de devis).
// Partagée hors de functions/ pour ne jamais devenir une route ; la route
// functions/api/devis.js ne fait que déléguer ici.
//
// Contrat de réponse (le front-end en dépend, ne pas le modifier sans lui) :
//   200 {"ok":true}
//   400 {"ok":false,"error":"validation","fields":{"<champ>":"<message>"}}
//   400 {"ok":false,"error":"captcha"}
//   422 {"ok":false,"error":"spam"}
//   403 {"ok":false,"error":"origin"}
//   405 {"ok":false,"error":"method"}          (+ Allow: POST)
//   413 {"ok":false,"error":"too_large"}
//   415 {"ok":false,"error":"unsupported_type"}
//   429 {"ok":false,"error":"rate_limited"}    (plafond quotidien atteint, si activé)
//   502 {"ok":false,"error":"delivery_failed"}
//   503 {"ok":false,"error":"not_configured"}
// Règle absolue : {"ok":true} uniquement si le fournisseur d'e-mail a répondu 2xx.

import { json, readBodyLimited, BodyTooLargeError, isLoopbackHostname } from './http.js';
import { verifyTurnstile, isTestSecret } from './turnstile.js';
import { readEmailConfig, buildMessage, sendEmail } from './email.js';
import { wantsHtml, toHtmlResponse } from './html.js';
import { takeDailySlot } from './limit.js';

export const MAX_BODY_BYTES = 20 * 1024;
export const MIN_FILL_MS = 3000;
/** Action posée par le widget Turnstile du formulaire (src/scripts/devis-form.ts). */
export const TURNSTILE_ACTION = 'devis';

const ACCEPTED_TYPES = new Set(['application/x-www-form-urlencoded', 'multipart/form-data', 'application/json']);

const KNOWN_FIELDS = [
  'type',
  'activite',
  'zone',
  'site',
  'besoin',
  'nom',
  'email',
  'telephone',
  'market',
  'website',
  'started',
  'cf-turnstile-response',
];

const fail = (status, error, extra = {}, headers = {}) => json(status, { ok: false, error, ...extra }, headers);

// ---------------------------------------------------------------------------
// Origine
// ---------------------------------------------------------------------------

function toOrigin(value) {
  try {
    const url = new URL(String(value).trim());
    return /^https?:$/.test(url.protocol) ? url.origin.toLowerCase() : null;
  } catch {
    return null;
  }
}

function extraOrigins(env) {
  return String(env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(toOrigin)
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Lecture du corps
// ---------------------------------------------------------------------------

async function parseBody(bytes, mediaType, contentTypeHeader) {
  const out = Object.create(null);
  // Première valeur retenue pour un champ répété, sauf pour le pot de miel :
  // une seule valeur non vide suffit à le déclencher.
  const take = (key, value) => {
    if (!KNOWN_FIELDS.includes(key)) return;
    if (!(key in out) || (key === 'website' && !cleanLine(out[key]))) out[key] = value;
  };

  try {
    if (mediaType === 'application/json') {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      const data = JSON.parse(text);
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        for (const key of KNOWN_FIELDS) if (Object.hasOwn(data, key)) take(key, data[key]);
      }
    } else if (mediaType === 'application/x-www-form-urlencoded') {
      const text = new TextDecoder('utf-8').decode(bytes);
      for (const [key, value] of new URLSearchParams(text)) take(key, value);
    } else {
      const form = await new Response(bytes, { headers: { 'Content-Type': contentTypeHeader } }).formData();
      for (const [key, value] of form) take(key, typeof value === 'string' ? value : '');
    }
  } catch {
    // Corps illisible : traité comme vide, la validation signalera les champs requis.
  }
  return out;
}

// ---------------------------------------------------------------------------
// Nettoyage et validation
// ---------------------------------------------------------------------------

// Caractères de contrôle C0/C1 (sauf \n, traité à part), marques et surcharges
// bidirectionnelles, caractères invisibles (trait d'union conditionnel, espaces et
// liants de largeur nulle, opérateurs invisibles), BOM.
const CONTROL =
  /[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u00AD\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;
const LINE_BREAKS = /\r\n?|[\u0085\u2028\u2029]/g;

function toStr(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

/** Champ sur une ligne : retours à la ligne et tabulations → espace, contrôles retirés. */
function cleanLine(value) {
  return toStr(value)
    .replace(LINE_BREAKS, '\n')
    .replace(/[\n\t\v\f]/g, ' ')
    .replace(CONTROL, '')
    .replace(/ {2,}/g, ' ')
    .trim();
}

/** Texte libre multiligne : on garde les sauts de ligne (au plus une ligne vide). */
export function cleanText(value) {
  return toStr(value)
    .replace(LINE_BREAKS, '\n')
    .replace(/[\t\v\f]/g, ' ')
    .replace(CONTROL, '')
    // Espaces de fin de ligne. Le regard arrière ne fait démarrer la recherche qu'au début
    // d'une suite d'espaces : temps linéaire, même sur 20 Ko d'espaces sans saut de ligne.
    .replace(/(?<! ) +\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Retour à la ligne à l'intérieur de la valeur (risque d'injection d'en-têtes). */
const hasInnerLineBreak = (value) => /[\r\n\u0085\u2028\u2029]/.test(toStr(value).trim());

const LABEL = '[\\p{L}\\p{N}](?:[\\p{L}\\p{N}-]{0,61}[\\p{L}\\p{N}])?';
const EMAIL_RE = new RegExp(
  `^(?!\\.)(?!.*\\.\\.)[A-Za-z0-9!#$%&'*+/=?^_\`{|}~.-]{1,64}(?<!\\.)@(?=.{4,253}$)(?:${LABEL}\\.)+(?:\\p{L}{2,63}|xn--[a-z0-9-]{1,59})$`,
  'u',
);
const HOST_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;
const PHONE_RE = /^[0-9 +.()-]{6,25}$/;

/**
 * « exemple.fr » → « https://exemple.fr/ ». Renvoie null si l'adresse n'est pas
 * une URL http(s) plausible (autre protocole, identifiants, hôte sans domaine…).
 * La forme renvoyée est celle que lit un navigateur (URL.href) : « https://a.fr\\@b.fr »
 * devient « https://a.fr/@b.fr », un nom de domaine accentué apparaît sous sa forme
 * xn--… Le message montre ainsi le site qui s'ouvrirait vraiment.
 */
export function normalizeSite(input) {
  let candidate = input;
  if (!/^https?:\/\//i.test(candidate)) {
    // Un autre protocole (mailto:, javascript:, ftp:…) est refusé ; « hote:8080 » est accepté.
    if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(candidate)) return null;
    candidate = 'https://' + candidate.replace(/^\/\//, '');
  }
  if (/\s/.test(candidate)) return null;
  let url;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (!HOST_RE.test(url.hostname)) return null;
  return url.href;
}

const MSG = {
  type: 'Choisissez le type de projet : création ou refonte.',
  activiteMissing: 'Indiquez votre activité.',
  activiteLength: 'Votre activité doit faire entre 2 et 120 caractères.',
  zoneMissing: "Indiquez votre zone d'intervention (par exemple votre commune).",
  zoneLength: "La zone d'intervention doit faire entre 2 et 120 caractères.",
  siteInvalid: "L'adresse du site n'est pas valide (exemple : www.votre-site.fr).",
  siteLength: "L'adresse du site ne doit pas dépasser 300 caractères.",
  besoinMissing: 'Décrivez votre besoin en quelques mots.',
  besoinLength: 'Votre message doit faire entre 10 et 2000 caractères.',
  nomMissing: 'Indiquez votre nom.',
  nomLength: 'Votre nom doit faire entre 2 et 100 caractères.',
  nomLine: 'Votre nom doit tenir sur une seule ligne.',
  emailMissing: 'Indiquez votre adresse e-mail.',
  emailInvalid: "L'adresse e-mail n'est pas valide.",
  emailLength: "L'adresse e-mail ne doit pas dépasser 200 caractères.",
  telephone: 'Le numéro de téléphone doit comporter 6 à 25 caractères : chiffres, espaces et + . ( ) - uniquement.',
};

const MAX_RAW_BESOIN = 4000;

function lengthRule(value, min, max, missing, length) {
  if (!value) return missing;
  if (value.length < min || value.length > max) return length;
  return null;
}

/**
 * Valide les champs du formulaire.
 * @returns {{ data: object, errors: Record<string, string> }}
 */
export function validateFields(raw) {
  const errors = {};
  const set = (field, message) => {
    if (message) errors[field] = message;
  };

  const type = cleanLine(raw.type)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  if (type !== 'creation' && type !== 'refonte') set('type', MSG.type);

  const activite = cleanLine(raw.activite);
  set('activite', lengthRule(activite, 2, 120, MSG.activiteMissing, MSG.activiteLength));

  const zone = cleanLine(raw.zone);
  set('zone', lengthRule(zone, 2, 120, MSG.zoneMissing, MSG.zoneLength));

  let site = cleanLine(raw.site);
  if (site) {
    if (site.length > 300) set('site', MSG.siteLength);
    else {
      const normalized = normalizeSite(site);
      if (normalized) site = normalized;
      else set('site', MSG.siteInvalid);
    }
  }

  // Valeur brute bien au-delà de la limite : refusée sans être nettoyée.
  const besoinRaw = toStr(raw.besoin);
  const besoin = besoinRaw.length > MAX_RAW_BESOIN ? besoinRaw : cleanText(besoinRaw);
  set('besoin', lengthRule(besoin, 10, 2000, MSG.besoinMissing, MSG.besoinLength));

  const nom = cleanLine(raw.nom);
  if (hasInnerLineBreak(raw.nom)) set('nom', MSG.nomLine);
  else set('nom', lengthRule(nom, 2, 100, MSG.nomMissing, MSG.nomLength));

  const email = cleanLine(raw.email);
  if (!email) set('email', MSG.emailMissing);
  else if (hasInnerLineBreak(raw.email)) set('email', MSG.emailInvalid);
  else if (email.length > 200) set('email', MSG.emailLength);
  else if (!EMAIL_RE.test(email)) set('email', MSG.emailInvalid);

  // Espaces insécables fréquents dans les numéros copiés-collés.
  const telephone = cleanLine(toStr(raw.telephone).replace(/[\u00A0\u2007\u202F]/g, ' '));
  if (telephone && (!PHONE_RE.test(telephone) || (telephone.match(/\d/g) ?? []).length < 6)) {
    set('telephone', MSG.telephone);
  }

  // Champ caché posé par le script : une valeur inattendue est ignorée,
  // le visiteur ne pourrait pas la corriger.
  const marketRaw = cleanLine(raw.market).toLowerCase();
  const market = marketRaw === 'fr' || marketRaw === 'ch' ? marketRaw : null;

  return { data: { type, activite, zone, site, besoin, nom, email, telephone, market }, errors };
}

/**
 * `started` : horodatage client en millisecondes, posé par le script du formulaire.
 * `present` : un nombre lisible a été envoyé. `value` : seulement s'il est plausible
 * (postérieur à 2001) ; une horloge de visiteur très décalée ne bloque pas l'envoi.
 */
function parseStarted(value) {
  let n = null;
  if (typeof value === 'number') n = value;
  else if (typeof value === 'string' && /^\d{1,16}$/.test(value.trim())) n = Number(value.trim());
  const present = n !== null && Number.isFinite(n) && n >= 0;
  return { present, value: present && n > 1e12 ? n : null };
}

// ---------------------------------------------------------------------------
// Point d'entrée
// ---------------------------------------------------------------------------

/**
 * @param {Request & { cf?: object }} request
 * @param {Record<string, string | undefined>} env
 * @param {{ fetch?: typeof fetch, now?: () => number,
 *           logger?: Pick<Console, 'error' | 'warn'>, emailTimeoutMs?: number,
 *           turnstileTimeoutMs?: number }} [options] injections pour les tests
 */
export async function handleDevis(request, env = {}, options = {}) {
  const logger = options.logger ?? console;
  let response;
  try {
    response = await handle(request, env ?? {}, options, logger);
  } catch (err) {
    // Erreur inattendue : rien n'a été envoyé, on ne prétend jamais le contraire.
    logger.error(`[devis] unexpected ${err && err.name ? err.name : 'error'}`);
    response = fail(502, 'delivery_failed');
  }
  // Envoi sans JavaScript : même résultat, présenté comme une page lisible.
  return wantsHtml(request) ? toHtmlResponse(response) : response;
}

async function handle(request, env, options, logger) {
  const fetchImpl = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
  const now = options.now ?? (() => Date.now());

  if (request.method !== 'POST') return fail(405, 'method', {}, { Allow: 'POST' });

  const requestUrl = new URL(request.url);
  const origins = new Set([requestUrl.origin.toLowerCase(), ...extraOrigins(env)]);
  const origin = request.headers.get('origin');
  if (origin !== null && !origins.has(toOrigin(origin))) return fail(403, 'origin');
  // Sans Origin, un navigateur qui annonce lui-même une requête venue d'un autre site est refusé.
  // Une requête sans aucun des deux en-têtes (outil, ancien navigateur) reste acceptée.
  if (origin === null && ['cross-site', 'same-site'].includes(request.headers.get('sec-fetch-site') ?? '')) {
    return fail(403, 'origin');
  }

  const contentType = request.headers.get('content-type') ?? '';
  const mediaType = contentType.split(';')[0].trim().toLowerCase();
  if (!ACCEPTED_TYPES.has(mediaType)) return fail(415, 'unsupported_type');

  let bytes;
  try {
    bytes = await readBodyLimited(request, MAX_BODY_BYTES);
  } catch (err) {
    if (err instanceof BodyTooLargeError) return fail(413, 'too_large');
    throw err;
  }

  const raw = await parseBody(bytes, mediaType, contentType);

  // Anti-spam passif (avant toute autre chose, sans faux succès).
  if (cleanLine(raw.website)) {
    logger.warn('[devis] spam: honeypot');
    return fail(422, 'spam');
  }
  const token = cleanLine(raw['cf-turnstile-response']);
  const started = parseStarted(raw.started);
  // Le jeton Turnstile et `started` viennent tous deux du script de la page : un jeton
  // sans `started` vient d'un envoi automatisé.
  if (token && !started.present) {
    logger.warn('[devis] spam: missing started');
    return fail(422, 'spam');
  }
  if (started.value !== null) {
    const elapsed = now() - started.value;
    // Une date dans le futur vient d'une horloge client décalée : on ne conclut pas.
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) {
      logger.warn('[devis] spam: too fast');
      return fail(422, 'spam');
    }
  }

  const { data, errors } = validateFields(raw);
  if (Object.keys(errors).length) return fail(400, 'validation', { fields: errors });

  // Configuration vérifiée avant de consommer le jeton Turnstile (usage unique).
  const secret = String(env.TURNSTILE_SECRET_KEY ?? '').trim();
  if (!secret) {
    logger.error('[devis] not_configured: TURNSTILE_SECRET_KEY');
    return fail(503, 'not_configured');
  }
  // Les clés de test de Cloudflare acceptent n'importe quel jeton : en ligne (Production
  // comme Preview), elles transformeraient le formulaire en relais d'e-mails sans anti-robot.
  if (isTestSecret(secret) && !isLoopbackHostname(requestUrl.hostname)) {
    logger.error('[devis] not_configured: turnstile test secret outside localhost');
    return fail(503, 'not_configured');
  }
  const email = readEmailConfig(env);
  if (!email.ok) {
    logger.error(`[devis] not_configured: ${email.missing.join(',')}`);
    return fail(503, 'not_configured');
  }

  const allowedHostnames = [...origins].map((o) => new URL(o).hostname);
  const captcha = await verifyTurnstile({
    secret,
    token,
    remoteip: request.headers.get('cf-connecting-ip'),
    allowedHostnames,
    expectedAction: TURNSTILE_ACTION,
    fetch: fetchImpl,
    timeoutMs: options.turnstileTimeoutMs,
  });
  if (!captcha.ok) {
    const codes = (captcha.codes ?? []).join(',');
    if (captcha.reason === 'config') {
      logger.error(`[devis] not_configured: turnstile ${codes}`);
      return fail(503, 'not_configured');
    }
    if (captcha.reason === 'unavailable') {
      logger.error(`[devis] delivery_failed: turnstile ${codes}`);
      return fail(502, 'delivery_failed');
    }
    logger.warn(`[devis] captcha: ${codes}`);
    return fail(400, 'captcha');
  }

  const slot = await takeDailySlot(env.DEVIS_COUNTER, env, now(), logger);
  if (!slot.ok) {
    logger.error(`[devis] rate_limited: daily cap ${slot.limit}`);
    return fail(429, 'rate_limited');
  }

  if (email.config.overridden) logger.warn('[devis] EMAIL_API_BASE actif (test uniquement)');
  const message = buildMessage(data, new Date(now()));
  const sent = await sendEmail({
    config: email.config,
    data,
    message,
    fetch: fetchImpl,
    timeoutMs: options.emailTimeoutMs,
  });
  if (!sent.ok) {
    logger.error(`[devis] delivery_failed: ${sent.diagnostic}`);
    return fail(502, 'delivery_failed');
  }
  return json(200, { ok: true });
}
