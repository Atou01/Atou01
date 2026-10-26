// Envoi de l'e-mail de demande de devis via un fournisseur transactionnel.
// Deux adaptateurs REST (fetch) : Brevo et Resend, choisis par EMAIL_PROVIDER.
//   Brevo  : POST https://api.brevo.com/v3/smtp/email   (en-tête api-key)       → 201
//   Resend : POST https://api.resend.com/emails          (Authorization: Bearer) → 200

import { fetchWithTimeout, readTextCapped, isLoopbackHostname } from './http.js';

export const EMAIL_TIMEOUT_MS = 8000;

const PROVIDERS = {
  brevo: { base: 'https://api.brevo.com', path: '/v3/smtp/email', keyVar: 'BREVO_API_KEY' },
  resend: { base: 'https://api.resend.com', path: '/emails', keyVar: 'RESEND_API_KEY' },
};

// Adresse « simple » utilisée pour MAIL_FROM / MAIL_TO (configuration, pas saisie visiteur).
const ADDRESS_RE = /^[^\s@<>",;:]+@[^\s@<>",;:]+\.[^\s@<>",;:]+$/;

/** Échappe une valeur pour l'insérer dans du HTML (texte ou attribut). */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Lit « Nom <adresse> » ou « adresse ».
 * @returns {{ email: string, name?: string } | null}
 */
export function parseMailbox(raw) {
  const value = String(raw ?? '').trim();
  if (!value || /[\r\n]/.test(value)) return null;
  const m = value.match(/^(?:"?([^"<>]*?)"?\s*)?<([^<>\s]+)>$/);
  const email = m ? m[2] : value;
  const name = m && m[1] ? m[1].trim() : undefined;
  if (!ADDRESS_RE.test(email)) return null;
  return name ? { email, name } : { email };
}

/**
 * Lit et valide la configuration d'envoi. Ne renvoie jamais la valeur des secrets
 * dans un message.
 * @returns {{ ok: true, config: object } | { ok: false, missing: string[] }}
 */
export function readEmailConfig(env) {
  const provider = String(env.EMAIL_PROVIDER ?? '').trim().toLowerCase();
  const def = Object.hasOwn(PROVIDERS, provider) ? PROVIDERS[provider] : null;
  if (!def) return { ok: false, missing: ['EMAIL_PROVIDER'] };

  const problems = [];
  const apiKey = String(env[def.keyVar] ?? '').trim();
  if (!apiKey) problems.push(def.keyVar);

  const from = parseMailbox(env.MAIL_FROM);
  if (!from) problems.push('MAIL_FROM');

  const to = String(env.MAIL_TO ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!to.length || !to.every((a) => ADDRESS_RE.test(a))) problems.push('MAIL_TO');

  // Point d'accroche réservé aux tests : n'est lu que s'il est défini, et
  // seulement vers une adresse locale (pour ne jamais envoyer la clé d'API ailleurs).
  let base = def.base;
  const override = String(env.EMAIL_API_BASE ?? '').trim();
  if (override) {
    let url = null;
    try {
      url = new URL(override);
    } catch {
      url = null;
    }
    if (!url || !/^https?:$/.test(url.protocol) || !isLoopbackHostname(url.hostname)) problems.push('EMAIL_API_BASE');
    else base = override.replace(/\/+$/, '');
  }

  if (problems.length) return { ok: false, missing: problems };
  return {
    ok: true,
    config: { provider, apiKey, from, to, endpoint: base + def.path, overridden: Boolean(override) },
  };
}

const TYPE_LABEL = { creation: 'Création', refonte: 'Refonte' };
const MARKET_LABEL = { fr: 'Europe · EUR', ch: 'Suisse · CHF' };

// Le contenu vient d'un formulaire public : rien n'en est vérifié (identité, adresse du site).
const NOT_VERIFIED = "Informations saisies par le visiteur, non vérifiées : contrôlez l'adresse du site avant de l'ouvrir.";

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}

/**
 * Construit le sujet et les deux corps (texte et HTML) à partir de données validées.
 * Toutes les valeurs du visiteur sont échappées dans le HTML.
 */
export function buildMessage(data, receivedAt = new Date()) {
  const type = TYPE_LABEL[data.type];
  const subject = `Demande de devis — ${type} — ${truncate(data.activite, 90)}`;
  const when = receivedAt.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  const rows = [
    ['Type de projet', type],
    ['Activité', data.activite],
    ["Zone d'intervention", data.zone],
    ['Site actuel', data.site || '—'],
    ['Marché affiché', data.market ? MARKET_LABEL[data.market] : 'non précisé'],
    ['Nom', data.nom],
    ['E-mail', data.email],
    ['Téléphone', data.telephone || '—'],
  ];

  const text = [
    'Nouvelle demande de devis reçue depuis le formulaire du site.',
    '',
    ...rows.map(([k, v]) => `${k} : ${v}`),
    '',
    'Besoin :',
    data.besoin,
    '',
    '—',
    `Reçue le ${when}. Répondre à ce message écrit directement au visiteur.`,
    NOT_VERIFIED,
  ].join('\n');

  const cell = 'padding:6px 12px 6px 0;vertical-align:top;';
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1d1d1b;">
<p>Nouvelle demande de devis reçue depuis le formulaire du site.</p>
<table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
${rows.map(([k, v]) => `<tr><th align="left" style="${cell}white-space:nowrap;">${escapeHtml(k)}</th><td style="${cell}">${escapeHtml(v)}</td></tr>`).join('\n')}
</table>
<h2 style="font-size:16px;margin:20px 0 6px;">Besoin</h2>
<p style="margin:0;">${escapeHtml(data.besoin).replace(/\n/g, '<br>')}</p>
<p style="margin-top:24px;color:#6b6b66;font-size:13px;">Reçue le ${escapeHtml(when)}. Répondre à ce message écrit directement au visiteur.<br>${escapeHtml(NOT_VERIFIED)}</p>
</body></html>`;

  return { subject, text, html };
}

/** Corps de requête propre à chaque fournisseur. */
export function buildProviderRequest(config, data, message) {
  if (config.provider === 'brevo') {
    const sender = { email: config.from.email };
    if (config.from.name) sender.name = truncate(config.from.name, 70);
    return {
      headers: { 'api-key': config.apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: {
        sender,
        to: config.to.map((email) => ({ email })),
        replyTo: { email: data.email, name: truncate(data.nom, 70) },
        subject: message.subject,
        textContent: message.text,
        htmlContent: message.html,
        tags: ['devis-site'],
      },
    };
  }
  // resend
  let from = config.from.email;
  if (config.from.name) {
    const name = config.from.name.replace(/["\\]/g, '');
    from = /^[\p{L}\p{N} .'-]+$/u.test(name) ? `${name} <${from}>` : `"${name}" <${from}>`;
  }
  return {
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: {
      from,
      to: config.to,
      reply_to: data.email,
      subject: message.subject,
      text: message.text,
      html: message.html,
      tags: [{ name: 'source', value: 'devis-site' }],
    },
  };
}

// Extrait un code d'erreur court et non personnel de la réponse du fournisseur
// (Brevo : « code », Resend : « name ») pour le journal. Jamais le message complet.
function providerErrorCode(text) {
  try {
    const data = JSON.parse(text);
    const code = data && (data.code ?? data.name);
    return typeof code === 'string' && /^[\w .-]{1,60}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

/**
 * Envoie le message. Ne renvoie `{ ok: true }` que si le fournisseur a répondu 2xx.
 * @returns {Promise<{ ok: true } | { ok: false, diagnostic: string }>}
 */
export async function sendEmail({ config, data, message, fetch, timeoutMs = EMAIL_TIMEOUT_MS }) {
  const { headers, body } = buildProviderRequest(config, data, message);
  try {
    const { response, result } = await fetchWithTimeout(
      fetch,
      config.endpoint,
      { method: 'POST', headers, body: JSON.stringify(body), redirect: 'manual' },
      timeoutMs,
      async (res) => {
        if (res.ok) {
          await res.body?.cancel().catch(() => {});
          return '';
        }
        return readTextCapped(res);
      },
    );
    if (response.ok) return { ok: true };
    const code = providerErrorCode(result);
    return { ok: false, diagnostic: `provider=${config.provider} status=${response.status}${code ? ` code=${code}` : ''}` };
  } catch (err) {
    const kind = err && err.name === 'AbortError' ? 'timeout' : 'network';
    return { ok: false, diagnostic: `provider=${config.provider} ${kind}` };
  }
}
