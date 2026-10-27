// Validation côté navigateur du formulaire de devis.
// Reprend les règles et les messages de server/devis.js : le serveur reste la référence,
// ce contrôle sert seulement à signaler les erreurs avant l'envoi.
import { FIELD_MSG as MSG } from './messages';

export const FIELD_NAMES = ['type', 'activite', 'zone', 'site', 'besoin', 'nom', 'email', 'telephone'] as const;
export type FieldName = (typeof FIELD_NAMES)[number];
export type Values = Record<FieldName, string>;
export type Errors = Partial<Record<FieldName, string>>;

export const isFieldName = (v: string): v is FieldName => (FIELD_NAMES as readonly string[]).includes(v);

const CONTROL = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;
const LINE_BREAKS = /\r\n?|[\u0085\u2028\u2029]/g;

export function cleanLine(value: string): string {
  return value
    .replace(LINE_BREAKS, '\n')
    .replace(/[\n\t\v\f]/g, ' ')
    .replace(CONTROL, '')
    .replace(/ {2,}/g, ' ')
    .trim();
}

export function cleanText(value: string): string {
  return value
    .replace(LINE_BREAKS, '\n')
    .replace(/[\t\v\f]/g, ' ')
    .replace(CONTROL, '')
    .replace(/[ ]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const hasInnerLineBreak = (value: string) => /[\r\n\u0085\u2028\u2029]/.test(value.trim());

// Expressions construites à l'exécution : un navigateur ancien sans lookbehind ni \p{…}
// retombe sur une règle plus simple au lieu de bloquer tout le script.
function buildEmailRe(): RegExp {
  try {
    const label = '[\\p{L}\\p{N}](?:[\\p{L}\\p{N}-]{0,61}[\\p{L}\\p{N}])?';
    return new RegExp(
      `^(?!\\.)(?!.*\\.\\.)[A-Za-z0-9!#$%&'*+/=?^_\`{|}~.-]{1,64}(?<!\\.)@(?=.{4,253}$)(?:${label}\\.)+(?:\\p{L}{2,63}|xn--[a-z0-9-]{1,59})$`,
      'u',
    );
  } catch {
    return /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/;
  }
}

const EMAIL_RE = buildEmailRe();
const HOST_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;
const PHONE_RE = /^[0-9 +.()-]{6,25}$/;

/** « exemple.fr » → « https://exemple.fr » ; null si l'adresse n'est pas une URL http(s) plausible. */
export function normalizeSite(input: string): string | null {
  let candidate = input;
  if (!/^https?:\/\//i.test(candidate)) {
    if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(candidate)) return null;
    candidate = 'https://' + candidate.replace(/^\/\//, '');
  }
  if (/\s/.test(candidate)) return null;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (!HOST_RE.test(url.hostname)) return null;
  return candidate;
}

function lengthRule(value: string, min: number, max: number, missing: string, length: string): string | null {
  if (!value) return missing;
  if (value.length < min || value.length > max) return length;
  return null;
}

/** Message d'erreur d'un champ, ou null s'il est valide. */
export function validateField(name: FieldName, raw: Values): string | null {
  switch (name) {
    case 'type':
      return raw.type === 'creation' || raw.type === 'refonte' ? null : MSG.type;
    case 'activite':
      return lengthRule(cleanLine(raw.activite), 2, 120, MSG.activiteMissing, MSG.activiteLength);
    case 'zone':
      return lengthRule(cleanLine(raw.zone), 2, 120, MSG.zoneMissing, MSG.zoneLength);
    case 'site': {
      const site = cleanLine(raw.site);
      if (!site) return null;
      if (site.length > 300) return MSG.siteLength;
      return normalizeSite(site) ? null : MSG.siteInvalid;
    }
    case 'besoin':
      return lengthRule(cleanText(raw.besoin), 10, 2000, MSG.besoinMissing, MSG.besoinLength);
    case 'nom':
      if (hasInnerLineBreak(raw.nom)) return MSG.nomLine;
      return lengthRule(cleanLine(raw.nom), 2, 100, MSG.nomMissing, MSG.nomLength);
    case 'email': {
      const email = cleanLine(raw.email);
      if (!email) return MSG.emailMissing;
      if (hasInnerLineBreak(raw.email)) return MSG.emailInvalid;
      if (email.length > 200) return MSG.emailLength;
      return EMAIL_RE.test(email) ? null : MSG.emailInvalid;
    }
    case 'telephone': {
      const tel = cleanLine(raw.telephone.replace(/[\u00A0\u2007\u202F]/g, ' '));
      if (!tel) return null;
      return PHONE_RE.test(tel) && (tel.match(/\d/g) ?? []).length >= 6 ? null : MSG.telephone;
    }
  }
}

export function validateAll(raw: Values): Errors {
  const errors: Errors = {};
  for (const name of FIELD_NAMES) {
    const message = validateField(name, raw);
    if (message) errors[name] = message;
  }
  return errors;
}
