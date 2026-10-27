import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { handleDevis, normalizeSite, cleanText, MAX_BODY_BYTES, MIN_FILL_MS } from '../server/devis.js';
import { EMAIL_TIMEOUT_MS } from '../server/email.js';
import { DEFAULT_DAILY_LIMIT, dailyLimit } from '../server/limit.js';
import {
  ORIGIN,
  DEVIS_URL,
  SITEVERIFY,
  BREVO_URL,
  RESEND_URL,
  LOCAL_ORIGIN,
  LOCAL_DEVIS_URL,
  PASS_SECRET,
  FAIL_SECRET,
  BREVO_ENV,
  RESEND_ENV,
  validFields,
  formRequest,
  jsonRequest,
  multipartRequest,
  createFetch,
  hangingResponse,
  createLogger,
  read,
} from './helpers.js';

const NOW = Date.UTC(2026, 9, 26, 14, 42, 0);

/** Appelle la logique avec fetch simulé, horloge et UUID fixes. */
async function call(request, { env = BREVO_ENV, fetch = createFetch(), logger = createLogger(), ...options } = {}) {
  const response = await handleDevis(request, env, { fetch, logger, now: () => NOW, ...options });
  const result = await read(response);
  return { ...result, fetch, logger };
}

function assertJsonNoStore(headers) {
  assert.equal(headers.get('content-type'), 'application/json; charset=utf-8');
  assert.equal(headers.get('cache-control'), 'no-store');
}

/** Aucun journal ne doit contenir de donnée personnelle ni de secret. */
function assertCleanLogs(logger, env = BREVO_ENV) {
  const all = logger.lines.join('\n');
  for (const secret of [env.BREVO_API_KEY, env.RESEND_API_KEY, env.TURNSTILE_SECRET_KEY].filter(Boolean)) {
    assert.ok(!all.includes(secret), 'secret dans le journal');
  }
  for (const pii of ['camille@example.org', 'Camille', '06 12 34 56 78', '203.0.113.7']) {
    assert.ok(!all.includes(pii), `donnée personnelle dans le journal : ${pii}`);
  }
}

// ---------------------------------------------------------------------------

describe('chemin nominal — Brevo', () => {
  test('urlencoded : vérifie Turnstile puis envoie via Brevo, répond {"ok":true}', async () => {
    const { status, headers, body, fetch, logger } = await call(formRequest(validFields()));
    assert.equal(status, 200);
    assert.deepEqual(body, { ok: true });
    assertJsonNoStore(headers);

    assert.equal(fetch.calls.length, 2);
    const [ts, mail] = fetch.calls;

    assert.equal(ts.url, SITEVERIFY);
    assert.equal(ts.init.method, 'POST');
    // Pas d'idempotency_key : Siteverify n'est jamais rappelé avec le même jeton.
    assert.deepEqual(ts.body, {
      secret: 'ts-secret-prod',
      response: 'token-abc',
      remoteip: '203.0.113.7',
    });

    assert.equal(mail.url, BREVO_URL);
    assert.equal(mail.init.method, 'POST');
    assert.equal(mail.headers.get('api-key'), 'xkeysib-test-key');
    assert.equal(mail.headers.get('content-type'), 'application/json');
    assert.equal(mail.headers.get('authorization'), null);
    assert.deepEqual(mail.body.sender, { email: 'contact@atousy.com', name: 'Atousy' });
    assert.deepEqual(mail.body.to, [{ email: 'contact@atousy.com' }]);
    assert.deepEqual(mail.body.replyTo, { email: 'camille@example.org', name: 'Camille Martin' });
    assert.equal(mail.body.subject, 'Demande de devis — Refonte — Plombier chauffagiste');
    assert.match(mail.body.textContent, /Type de projet : Refonte/);
    assert.match(mail.body.textContent, /Activité : Plombier chauffagiste/);
    assert.match(mail.body.textContent, /Zone d’intervention : Ma commune et 20 km autour/);
    assert.match(mail.body.textContent, /Site actuel : https:\/\/exemple\.fr\/\n/);
    assert.match(mail.body.textContent, /Marché affiché : Europe · EUR/);
    assert.match(mail.body.textContent, /Téléphone : 06 12 34 56 78/);
    assert.match(mail.body.textContent, /Reçue le 2026-10-26 14:42 UTC/);
    assert.match(mail.body.htmlContent, /^<!doctype html>/);
    assert.deepEqual(mail.body.tags, ['devis-site']);
    assert.deepEqual(logger.lines, []);
  });

  test('JSON et multipart/form-data sont acceptés', async () => {
    for (const request of [jsonRequest(validFields()), multipartRequest(validFields())]) {
      const { status, body, fetch } = await call(request);
      assert.equal(status, 200, request.headers.get('content-type'));
      assert.deepEqual(body, { ok: true });
      assert.equal(fetch.providerCalls().length, 1);
      assert.equal(fetch.providerCalls()[0].body.replyTo.email, 'camille@example.org');
    }
  });

  test('type « création » et MAIL_TO multiple', async () => {
    const env = { ...BREVO_ENV, MAIL_TO: 'a@atousy.com, b@atousy.com' };
    const { status, fetch } = await call(formRequest(validFields({ type: 'Création' })), { env });
    assert.equal(status, 200);
    const mail = fetch.providerCalls()[0];
    assert.equal(mail.body.subject, 'Demande de devis — Création — Plombier chauffagiste');
    assert.deepEqual(mail.body.to, [{ email: 'a@atousy.com' }, { email: 'b@atousy.com' }]);
  });

  test('MAIL_FROM sans nom', async () => {
    const env = { ...BREVO_ENV, MAIL_FROM: 'contact@atousy.com' };
    const { status, fetch } = await call(formRequest(validFields()), { env });
    assert.equal(status, 200);
    assert.deepEqual(fetch.providerCalls()[0].body.sender, { email: 'contact@atousy.com' });
  });

  test('toutes les valeurs sont échappées dans le HTML', async () => {
    const fields = validFields({
      activite: `<script>alert("x")</script> & 'co'`,
      zone: '<img src=x onerror=alert(1)>',
      besoin: 'Ligne 1 <b>gras</b>\nLigne 2 & suite',
      nom: 'Jean "Jo" <Dupont>',
    });
    const { status, fetch } = await call(formRequest(fields));
    assert.equal(status, 200);
    const { htmlContent, textContent, subject } = fetch.providerCalls()[0].body;
    assert.ok(!htmlContent.includes('<script>'));
    assert.ok(!htmlContent.includes('<img'));
    assert.ok(!htmlContent.includes('<b>gras'));
    assert.ok(!htmlContent.includes('<Dupont>'));
    assert.ok(htmlContent.includes('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;co&#39;'));
    assert.ok(htmlContent.includes('&lt;img src=x onerror=alert(1)&gt;'));
    assert.ok(htmlContent.includes('Ligne 1 &lt;b&gt;gras&lt;/b&gt;<br>Ligne 2 &amp; suite'));
    assert.ok(htmlContent.includes('Jean &quot;Jo&quot; &lt;Dupont&gt;'));
    // Le texte brut reste lisible (non échappé), le sujet aussi.
    assert.ok(textContent.includes('Ligne 1 <b>gras</b>\nLigne 2 & suite'));
    assert.equal(subject, `Demande de devis — Refonte — <script>alert("x")</script> & 'co'`);
  });

  test('caractères de contrôle retirés, retours à la ligne du besoin conservés', async () => {
    const fields = validFields({
      activite: 'Plom\u0007bier\u202E   chauffagiste\t',
      besoin: 'Bonjour,\r\n\r\n\r\n\r\nRefaire le site\u0000 svp.\u200F',
    });
    const { status, fetch } = await call(formRequest(fields));
    assert.equal(status, 200);
    const mail = fetch.providerCalls()[0].body;
    assert.equal(mail.subject, 'Demande de devis — Refonte — Plombier chauffagiste');
    assert.ok(mail.textContent.includes('Besoin :\nBonjour,\n\nRefaire le site svp.\n'));
  });

  test('caractères invisibles retirés (largeur nulle, trait d’union conditionnel, marques)', async () => {
    const invisible = '\u00AD\u061C\u180E\u200B\u200C\u200D\u2060\u2061\u2062\u2063\u2064';
    const fields = validFields({ activite: `Plom${invisible}bier chauffagiste`, besoin: `Refaire${invisible} le site vitrine.` });
    const { status, fetch } = await call(formRequest(fields));
    assert.equal(status, 200);
    const mail = fetch.providerCalls()[0].body;
    assert.equal(mail.subject, 'Demande de devis — Refonte — Plombier chauffagiste');
    assert.ok(mail.textContent.includes('Besoin :\nRefaire le site vitrine.\n'));
  });

  test('l’e-mail rappelle que le contenu n’est pas vérifié', async () => {
    const { fetch } = await call(formRequest(validFields()));
    const mail = fetch.providerCalls()[0].body;
    assert.match(mail.textContent, /Informations saisies par le visiteur, non vérifiées/);
    assert.match(mail.htmlContent, /Informations saisies par le visiteur, non vérifiées/);
  });

  test('sujet tronqué pour une activité longue', async () => {
    const activite = 'A'.repeat(120);
    const { fetch } = await call(formRequest(validFields({ activite })));
    const { subject } = fetch.providerCalls()[0].body;
    assert.ok(subject.length < 130);
    assert.ok(subject.endsWith('…'));
  });

  test('champs facultatifs absents : site, téléphone, marché', async () => {
    const fields = validFields({ site: undefined, telephone: '', market: undefined });
    const { status, fetch } = await call(formRequest(fields));
    assert.equal(status, 200);
    const text = fetch.providerCalls()[0].body.textContent;
    assert.match(text, /Site actuel : —/);
    assert.match(text, /Téléphone : —/);
    assert.match(text, /Marché affiché : non précisé/);
  });

  test('marché inconnu ignoré (champ caché), « ch » reconnu', async () => {
    let r = await call(formRequest(validFields({ market: 'de' })));
    assert.equal(r.status, 200);
    assert.match(r.fetch.providerCalls()[0].body.textContent, /Marché affiché : non précisé/);
    r = await call(formRequest(validFields({ market: 'CH' })));
    assert.match(r.fetch.providerCalls()[0].body.textContent, /Marché affiché : Suisse · CHF/);
  });

  test('sans CF-Connecting-IP, remoteip est omis', async () => {
    const request = new Request(DEVIS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validFields()),
    });
    const { status, fetch } = await call(request);
    assert.equal(status, 200);
    assert.equal('remoteip' in fetch.turnstileCalls()[0].body, false);
  });
});

describe('chemin nominal — Resend', () => {
  test('envoie via Resend avec Bearer, reply_to et corps texte + HTML', async () => {
    const fetch = createFetch({ provider: { status: 200, body: { id: '49a3999c' } } });
    const { status, body, logger } = await call(formRequest(validFields({ besoin: 'Créer un site <vite> & bien.' })), {
      env: RESEND_ENV,
      fetch,
    });
    assert.equal(status, 200);
    assert.deepEqual(body, { ok: true });
    const mail = fetch.providerCalls()[0];
    assert.equal(mail.url, RESEND_URL);
    assert.equal(mail.init.method, 'POST');
    assert.equal(mail.headers.get('authorization'), 'Bearer re_test_key');
    assert.equal(mail.headers.get('api-key'), null);
    assert.equal(mail.headers.get('content-type'), 'application/json');
    assert.equal(mail.body.from, 'Atousy <contact@atousy.com>');
    assert.deepEqual(mail.body.to, ['contact@atousy.com']);
    assert.equal(mail.body.reply_to, 'camille@example.org');
    assert.equal(mail.body.subject, 'Demande de devis — Refonte — Plombier chauffagiste');
    assert.match(mail.body.text, /Créer un site <vite> & bien\./);
    assert.ok(mail.body.html.includes('Créer un site &lt;vite&gt; &amp; bien.'));
    assert.ok(!mail.body.html.includes('<vite>'));
    assert.deepEqual(mail.body.tags, [{ name: 'source', value: 'devis-site' }]);
    assertCleanLogs(logger, RESEND_ENV);
  });

  test('nom d’expéditeur avec ponctuation : mis entre guillemets', async () => {
    const env = { ...RESEND_ENV, MAIL_FROM: '"Atousy, studio" <contact@atousy.com>' };
    const fetch = createFetch({ provider: { status: 200, body: { id: 'x' } } });
    const { status } = await call(formRequest(validFields()), { env, fetch });
    assert.equal(status, 200);
    assert.equal(fetch.providerCalls()[0].body.from, '"Atousy, studio" <contact@atousy.com>');
  });

  test('EMAIL_PROVIDER insensible à la casse', async () => {
    const fetch = createFetch({ provider: { status: 200, body: { id: 'x' } } });
    const { status } = await call(formRequest(validFields()), { env: { ...RESEND_ENV, EMAIL_PROVIDER: ' Resend ' }, fetch });
    assert.equal(status, 200);
    assert.equal(fetch.providerCalls()[0].url, RESEND_URL);
  });
});

// ---------------------------------------------------------------------------

describe('méthode, type de contenu, taille', () => {
  for (const method of ['GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']) {
    test(`${method} → 405 avec Allow: POST`, async () => {
      const { status, headers, body, fetch } = await call(new Request(DEVIS_URL, { method }));
      assert.equal(status, 405);
      assert.equal(headers.get('allow'), 'POST');
      assert.deepEqual(body, { ok: false, error: 'method' });
      assertJsonNoStore(headers);
      assert.equal(fetch.calls.length, 0);
    });
  }

  test('text/plain → 415', async () => {
    const request = new Request(DEVIS_URL, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    const { status, body, headers } = await call(request);
    assert.equal(status, 415);
    assert.deepEqual(body, { ok: false, error: 'unsupported_type' });
    assertJsonNoStore(headers);
  });

  test('Content-Type absent → 415', async () => {
    const request = new Request(DEVIS_URL, { method: 'POST', body: new Uint8Array([1, 2, 3]) });
    assert.equal(request.headers.get('content-type'), null);
    const { status } = await call(request);
    assert.equal(status, 415);
  });

  test('Content-Type avec paramètres et majuscules accepté', async () => {
    const request = jsonRequest(validFields(), { headers: { 'content-type': 'Application/JSON; charset=UTF-8' } });
    const { status } = await call(request);
    assert.equal(status, 200);
  });

  test('Content-Length > 20 Ko → 413 sans lire le corps', async () => {
    const request = jsonRequest(validFields(), { headers: { 'content-length': String(MAX_BODY_BYTES + 1) } });
    const { status, body, fetch } = await call(request);
    assert.equal(status, 413);
    assert.deepEqual(body, { ok: false, error: 'too_large' });
    assert.equal(fetch.calls.length, 0);
  });

  test('corps de plus de 20 Ko envoyé en flux (sans Content-Length) → 413', async () => {
    const chunk = new TextEncoder().encode('besoin=' + 'a'.repeat(4096));
    let sent = 0;
    const stream = new ReadableStream({
      pull(controller) {
        if (sent > MAX_BODY_BYTES * 2) return controller.close();
        sent += chunk.byteLength;
        controller.enqueue(chunk);
      },
    });
    const request = new Request(DEVIS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: stream,
      duplex: 'half',
    });
    assert.equal(request.headers.get('content-length'), null);
    const { status } = await call(request);
    assert.equal(status, 413);
  });

  test('corps juste sous la limite accepté', async () => {
    const fields = validFields({ besoin: 'é'.repeat(2000) });
    const request = formRequest(fields);
    const { status } = await call(request);
    assert.equal(status, 200);
  });

  test('JSON illisible → 400 validation (champs requis signalés), rien n’est envoyé', async () => {
    const request = new Request(DEVIS_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"type":' });
    const { status, body, fetch } = await call(request);
    assert.equal(status, 400);
    assert.equal(body.error, 'validation');
    assert.ok(body.fields.type && body.fields.email && body.fields.besoin);
    assert.equal(fetch.calls.length, 0);
  });

  test('JSON qui n’est pas un objet → 400 validation', async () => {
    const request = new Request(DEVIS_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '["refonte"]' });
    const { status, body } = await call(request);
    assert.equal(status, 400);
    assert.equal(body.error, 'validation');
  });
});

describe('origine', () => {
  test('Origin différente → 403, rien n’est appelé', async () => {
    const { status, body, headers, fetch } = await call(formRequest(validFields(), { headers: { origin: 'https://evil.example' } }));
    assert.equal(status, 403);
    assert.deepEqual(body, { ok: false, error: 'origin' });
    assertJsonNoStore(headers);
    assert.equal(fetch.calls.length, 0);
  });

  test('Origin « null » → 403', async () => {
    const { status } = await call(formRequest(validFields(), { headers: { origin: 'null' } }));
    assert.equal(status, 403);
  });

  test('même hôte mais autre protocole → 403', async () => {
    const { status } = await call(formRequest(validFields(), { headers: { origin: 'http://atousy.com' } }));
    assert.equal(status, 403);
  });

  test('Origin listée dans ALLOWED_ORIGINS (casse et / final tolérés) → acceptée', async () => {
    const env = { ...BREVO_ENV, ALLOWED_ORIGINS: ' https://WWW.atousy.com/ , https://preview.atousy.pages.dev' };
    const fetch = createFetch({ turnstile: { success: true, hostname: 'www.atousy.com', action: 'devis' } });
    const { status } = await call(formRequest(validFields(), { headers: { origin: 'https://www.atousy.com' } }), { env, fetch });
    assert.equal(status, 200);
  });

  test('sans en-tête Origin → accepté', async () => {
    const request = new Request(DEVIS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validFields()),
    });
    const { status } = await call(request);
    assert.equal(status, 200);
  });

  test('sans Origin mais Sec-Fetch-Site « cross-site » ou « same-site » → 403, rien n’est appelé', async () => {
    for (const site of ['cross-site', 'same-site']) {
      const request = new Request(DEVIS_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'sec-fetch-site': site },
        body: JSON.stringify(validFields()),
      });
      const { status, body, fetch } = await call(request);
      assert.equal(status, 403, site);
      assert.deepEqual(body, { ok: false, error: 'origin' });
      assert.equal(fetch.calls.length, 0);
    }
  });

  test('sans Origin, Sec-Fetch-Site « same-origin » ou « none » → accepté', async () => {
    for (const site of ['same-origin', 'none']) {
      const request = new Request(DEVIS_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'sec-fetch-site': site },
        body: JSON.stringify(validFields()),
      });
      const { status } = await call(request);
      assert.equal(status, 200, site);
    }
  });
});

// ---------------------------------------------------------------------------

describe('validation des champs', () => {
  /** Vérifie qu'une valeur produit une erreur sur `field` et que rien n'est envoyé. */
  async function expectFieldError(field, value, messagePattern) {
    const { status, body, headers, fetch } = await call(formRequest(validFields({ [field]: value })));
    assert.equal(status, 400, `${field}=${JSON.stringify(value)}`);
    assert.equal(body.ok, false);
    assert.equal(body.error, 'validation');
    assert.deepEqual(Object.keys(body.fields), [field], `${field}=${JSON.stringify(value)}`);
    assert.equal(typeof body.fields[field], 'string');
    if (messagePattern) assert.match(body.fields[field], messagePattern);
    assertJsonNoStore(headers);
    assert.equal(fetch.calls.length, 0, 'ni Turnstile ni e-mail en cas d’erreur de validation');
  }

  async function expectAccepted(field, value) {
    const { status, body } = await call(formRequest(validFields({ [field]: value })));
    assert.equal(status, 200, `${field}=${JSON.stringify(value)} → ${JSON.stringify(body)}`);
  }

  test('type requis : creation | refonte', async () => {
    await expectFieldError('type', undefined, /création ou refonte/);
    await expectFieldError('type', 'autre');
    await expectFieldError('type', 'refonte complète');
    await expectAccepted('type', 'creation');
    await expectAccepted('type', ' REFONTE ');
  });

  test('activite requise, 2 à 120 caractères', async () => {
    await expectFieldError('activite', undefined, /Indiquez votre activité/);
    await expectFieldError('activite', '   ', /Indiquez votre activité/);
    await expectFieldError('activite', 'A', /entre 2 et 120/);
    await expectFieldError('activite', 'A'.repeat(121), /entre 2 et 120/);
    await expectAccepted('activite', 'AB');
    await expectAccepted('activite', 'A'.repeat(120));
  });

  test('zone requise, texte libre de 2 à 120 caractères', async () => {
    await expectFieldError('zone', '', /zone d’intervention/);
    await expectFieldError('zone', 'Z', /entre 2 et 120/);
    await expectFieldError('zone', 'Z'.repeat(121), /entre 2 et 120/);
    await expectAccepted('zone', 'Ma commune');
    await expectAccepted('zone', 'Z'.repeat(120));
  });

  test('site facultatif : URL http(s) valide, « exemple.fr » complété, 300 caractères max', async () => {
    await expectFieldError('site', 'pas un site', /n’est pas valide/);
    await expectFieldError('site', 'javascript:alert(1)');
    await expectFieldError('site', 'mailto:moi@exemple.fr');
    await expectFieldError('site', 'ftp://exemple.fr');
    await expectFieldError('site', 'http://localhost:3000');
    await expectFieldError('site', 'https://192.168.1.10');
    await expectFieldError('site', 'https://moi:secret@exemple.fr');
    await expectFieldError('site', 'exemple');
    await expectFieldError('site', 'https://exemple.fr/' + 'a'.repeat(300), /300 caractères/);
    await expectAccepted('site', '');
    await expectAccepted('site', 'www.exemple.fr');
    await expectAccepted('site', 'http://exemple.fr/page?x=1');
    await expectAccepted('site', 'HTTPS://Exemple.FR');
    await expectAccepted('site', 'exemple.fr:8080/accueil');
    await expectAccepted('site', 'boulangerie-élise.fr');
  });

  test('site : forme lue par un navigateur, sans ambiguïté (URL.href)', () => {
    assert.equal(normalizeSite('exemple.fr'), 'https://exemple.fr/');
    assert.equal(normalizeSite('HTTPS://Exemple.FR'), 'https://exemple.fr/');
    assert.equal(normalizeSite('http://exemple.fr/page?x=1'), 'http://exemple.fr/page?x=1');
    assert.equal(normalizeSite('exemple.fr:8080/accueil'), 'https://exemple.fr:8080/accueil');
    // La barre oblique inverse est lue comme « / » : l'hôte réel est evil.example.
    assert.equal(normalizeSite('https://evil.example\\@exemple.fr'), 'https://evil.example/@exemple.fr');
    // Domaine accentué : forme xn--, qui ne peut pas imiter un autre domaine.
    assert.equal(normalizeSite('boulangerie-élise.fr'), 'https://xn--boulangerie-lise-mqb.fr/');
    assert.equal(normalizeSite('exаmple.fr'), 'https://xn--exmple-4nf.fr/'); // « а » cyrillique
  });

  test('site : « exemple.fr » devient « https://exemple.fr/ » dans l’e-mail', async () => {
    const { fetch } = await call(formRequest(validFields({ site: ' www.exemple.fr ' })));
    assert.match(fetch.providerCalls()[0].body.textContent, /Site actuel : https:\/\/www\.exemple\.fr\/\n/);
  });

  test('besoin requis, 10 à 2000 caractères (après nettoyage)', async () => {
    await expectFieldError('besoin', '', /Décrivez votre besoin/);
    await expectFieldError('besoin', ' \n\t\u0000 ', /Décrivez votre besoin/);
    await expectFieldError('besoin', '123456789', /entre 10 et 2000/);
    await expectFieldError('besoin', '12345678\u0000\u0007', /entre 10 et 2000/);
    await expectFieldError('besoin', 'x'.repeat(2001), /entre 10 et 2000/);
    await expectAccepted('besoin', '1234567890');
    await expectAccepted('besoin', 'x'.repeat(2000));
  });

  test('nom requis, 2 à 100 caractères, sur une seule ligne', async () => {
    await expectFieldError('nom', '', /Indiquez votre nom/);
    await expectFieldError('nom', 'A', /entre 2 et 100/);
    await expectFieldError('nom', 'A'.repeat(101), /entre 2 et 100/);
    await expectFieldError('nom', 'Camille\r\nBcc: victime@example.org', /une seule ligne/);
    await expectFieldError('nom', 'Camille\nMartin', /une seule ligne/);
    await expectAccepted('nom', 'Jo');
    await expectAccepted('nom', 'Camille Martin\n'); // saut de ligne final simplement retiré
  });

  test('email requis, format raisonnable, 200 caractères max, sans CR/LF', async () => {
    await expectFieldError('email', '', /Indiquez votre adresse e-mail/);
    for (const bad of [
      'pas-un-email',
      'a@b',
      'a@b.c',
      '@exemple.fr',
      'camille@',
      'camille@@exemple.fr',
      'cam ille@exemple.fr',
      'camille..martin@exemple.fr',
      '.camille@exemple.fr',
      'camille.@exemple.fr',
      'camille@exemple..fr',
      'camille@-exemple.fr',
      'camille@exemple.fr>',
      '<camille@exemple.fr>',
      'Camille <camille@exemple.fr>',
      'camille@exemple.fr,autre@exemple.fr',
      'camille@192.168.0.1',
    ]) {
      await expectFieldError('email', bad, /n’est pas valide/);
    }
    await expectFieldError('email', 'camille@exemple.fr\r\nBcc: victime@example.org', /n’est pas valide/);
    await expectFieldError('email', 'a'.repeat(64) + '@' + 'b'.repeat(140) + '.fr', /200 caractères/);
    await expectAccepted('email', 'camille.martin+devis@exemple.fr');
    await expectAccepted('email', "o'brien@sous-domaine.exemple.co.uk");
    await expectAccepted('email', 'contact@boulangerie-élise.fr');
    await expectAccepted('email', ' Camille@Exemple.FR ');
  });

  test('telephone facultatif : 6 à 25 caractères parmi chiffres, espaces, + . ( ) -', async () => {
    await expectFieldError('telephone', '12345', /6 à 25/);
    await expectFieldError('telephone', '1'.repeat(26));
    await expectFieldError('telephone', '06 12 34 56 78 poste 2');
    await expectFieldError('telephone', '06/12/34/56/78');
    await expectFieldError('telephone', '+() -. ++');
    await expectAccepted('telephone', '');
    await expectAccepted('telephone', '061234');
    await expectAccepted('telephone', '+41 (0)22 123 45 67');
    await expectAccepted('telephone', '06.12.34.56.78');
    await expectAccepted('telephone', '06\u00A012\u00A034\u00A056\u00A078'); // espaces insécables
  });

  test('plusieurs erreurs renvoyées ensemble, au format exact du contrat', async () => {
    const fields = validFields({ type: '', email: 'x', besoin: 'court', telephone: 'abc' });
    const { status, body } = await call(formRequest(fields));
    assert.equal(status, 400);
    assert.deepEqual(body, {
      ok: false,
      error: 'validation',
      fields: {
        type: 'Choisissez le type de projet : création ou refonte.',
        besoin: 'Votre message doit faire entre 10 et 2000 caractères.',
        email: "L’adresse e-mail n’est pas valide.",
        telephone: 'Le numéro de téléphone doit comporter 6 à 25 caractères : chiffres, espaces et + . ( ) - uniquement.',
      },
    });
  });

  test('20 Ko d’espaces dans le besoin : traité en temps linéaire', async () => {
    let started = performance.now();
    assert.equal(cleanText(' '.repeat(20_000) + 'x'), 'x');
    assert.equal(cleanText('a' + ' '.repeat(20_000) + '\nb'), 'a\nb');
    assert.ok(performance.now() - started < 100, `cleanText : ${performance.now() - started} ms`);

    const body = new URLSearchParams(validFields({ besoin: ' '.repeat(MAX_BODY_BYTES - 600) + 'x' })).toString();
    assert.ok(body.length <= MAX_BODY_BYTES);
    const request = new Request(DEVIS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', origin: ORIGIN },
      body,
    });
    started = performance.now();
    const { status, body: res, fetch } = await call(request);
    assert.ok(performance.now() - started < 100, `requête : ${performance.now() - started} ms`);
    assert.equal(status, 400);
    assert.deepEqual(res.fields, { besoin: 'Votre message doit faire entre 10 et 2000 caractères.' });
    assert.equal(fetch.calls.length, 0);
  });

  test('besoin brut de plus de 4000 caractères refusé, même s’il se réduit après nettoyage', async () => {
    const { status, body } = await call(formRequest(validFields({ besoin: 'Refaire le site.' + ' '.repeat(4000) })));
    assert.equal(status, 400);
    assert.match(body.fields.besoin, /entre 10 et 2000/);
  });

  test('valeurs JSON non textuelles traitées comme vides', async () => {
    const { status, body } = await call(jsonRequest(validFields({ nom: { $gt: '' }, activite: ['a', 'b'], zone: true })));
    assert.equal(status, 400);
    assert.deepEqual(Object.keys(body.fields).sort(), ['activite', 'nom', 'zone']);
  });

  test('champ répété : seule la première valeur compte', async () => {
    const params = new URLSearchParams(validFields());
    params.append('email', 'autre@exemple.fr');
    const request = new Request(DEVIS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', origin: ORIGIN },
      body: params.toString(),
    });
    const { status, fetch } = await call(request);
    assert.equal(status, 200);
    assert.equal(fetch.providerCalls()[0].body.replyTo.email, 'camille@example.org');
  });
});

// ---------------------------------------------------------------------------

describe('anti-spam', () => {
  test('pot de miel « website » rempli → 422 spam, rien n’est envoyé', async () => {
    const { status, body, headers, fetch, logger } = await call(formRequest(validFields({ website: 'https://spam.example' })));
    assert.equal(status, 422);
    assert.deepEqual(body, { ok: false, error: 'spam' });
    assertJsonNoStore(headers);
    assert.equal(fetch.calls.length, 0);
    assertCleanLogs(logger);
  });

  test('pot de miel rempli même si les autres champs sont invalides → 422', async () => {
    const { status } = await call(formRequest({ website: 'x' }));
    assert.equal(status, 422);
  });

  test('pot de miel répété : une seule valeur non vide suffit', async () => {
    const params = new URLSearchParams(validFields());
    params.append('website', 'https://spam.example');
    const request = new Request(DEVIS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', origin: ORIGIN },
      body: params.toString(),
    });
    const { status, fetch } = await call(request);
    assert.equal(status, 422);
    assert.equal(fetch.calls.length, 0);
  });

  test('pot de miel avec seulement des espaces → ignoré', async () => {
    const { status } = await call(formRequest(validFields({ website: '   ' })));
    assert.equal(status, 200);
  });

  test(`envoi moins de ${MIN_FILL_MS / 1000} s après « started » → 422 spam`, async () => {
    for (const started of [NOW, NOW - 1000, NOW - (MIN_FILL_MS - 1)]) {
      const { status, body, fetch } = await call(formRequest(validFields({ started })));
      assert.equal(status, 422, `started=${started}`);
      assert.deepEqual(body, { ok: false, error: 'spam' });
      assert.equal(fetch.calls.length, 0);
    }
  });

  test('« started » en JSON numérique aussi contrôlé', async () => {
    const { status } = await call(jsonRequest(validFields({ started: NOW - 500 })));
    assert.equal(status, 422);
  });

  test('envoi après le délai minimal → accepté', async () => {
    for (const started of [NOW - MIN_FILL_MS, NOW - 60_000]) {
      const { status } = await call(formRequest(validFields({ started })));
      assert.equal(status, 200, `started=${started}`);
    }
  });

  test('« started » dans le futur ou très ancien (horloge client décalée) → contrôle ignoré', async () => {
    for (const started of [NOW + 3_600_000, '12', 0]) {
      const { status } = await call(formRequest(validFields({ started })));
      assert.equal(status, 200, `started=${started}`);
    }
  });

  test('jeton Turnstile sans « started » lisible → 422 spam, rien n’est appelé', async () => {
    for (const started of [undefined, '', 'abc', '-5', '1.5e12']) {
      const { status, body, fetch, logger } = await call(formRequest(validFields({ started })));
      assert.equal(status, 422, `started=${started}`);
      assert.deepEqual(body, { ok: false, error: 'spam' });
      assert.equal(fetch.calls.length, 0);
      assert.match(logger.lines.join('\n'), /missing started/);
    }
  });

  test('sans jeton ni « started » (envoi sans JavaScript) → 400 captcha, pas 422', async () => {
    const { status, body } = await call(formRequest(validFields({ started: undefined, 'cf-turnstile-response': undefined })));
    assert.equal(status, 400);
    assert.deepEqual(body, { ok: false, error: 'captcha' });
  });
});

describe('Turnstile', () => {
  test('jeton absent → 400 captcha, sans appel à Siteverify', async () => {
    const { status, body, headers, fetch } = await call(formRequest(validFields({ 'cf-turnstile-response': undefined })));
    assert.equal(status, 400);
    assert.deepEqual(body, { ok: false, error: 'captcha' });
    assertJsonNoStore(headers);
    assert.equal(fetch.calls.length, 0);
  });

  test('jeton de plus de 2048 caractères → 400 captcha', async () => {
    const { status, fetch } = await call(formRequest(validFields({ 'cf-turnstile-response': 't'.repeat(2049) })));
    assert.equal(status, 400);
    assert.equal(fetch.calls.length, 0);
  });

  test('Siteverify refuse le jeton → 400 captcha, aucun e-mail', async () => {
    const fetch = createFetch({ turnstile: { success: false, 'error-codes': ['invalid-input-response'] } });
    const { status, body, logger } = await call(formRequest(validFields()), { fetch });
    assert.equal(status, 400);
    assert.deepEqual(body, { ok: false, error: 'captcha' });
    assert.equal(fetch.turnstileCalls().length, 1);
    assert.equal(fetch.providerCalls().length, 0);
    assert.match(logger.lines.join('\n'), /invalid-input-response/);
    assertCleanLogs(logger);
  });

  test('jeton déjà utilisé (timeout-or-duplicate) → 400 captcha', async () => {
    const fetch = createFetch({ turnstile: { success: false, 'error-codes': ['timeout-or-duplicate'] } });
    const { status } = await call(formRequest(validFields()), { fetch });
    assert.equal(status, 400);
  });

  test('jeton obtenu sur un autre domaine (hostname) → 400 captcha', async () => {
    const fetch = createFetch({ turnstile: { success: true, hostname: 'autre-site.example' } });
    const { status, body } = await call(formRequest(validFields()), { fetch });
    assert.equal(status, 400);
    assert.deepEqual(body, { ok: false, error: 'captcha' });
    assert.equal(fetch.providerCalls().length, 0);
  });

  const local = (fields) => formRequest(fields, { url: LOCAL_DEVIS_URL, headers: { origin: LOCAL_ORIGIN } });

  test('en local (localhost), clé secrète de test « toujours valide » : hostname factice accepté', async () => {
    const fetch = createFetch({ turnstile: { success: true, hostname: 'example.com', action: '' } });
    const { status } = await call(local(validFields()), { env: { ...BREVO_ENV, TURNSTILE_SECRET_KEY: PASS_SECRET }, fetch });
    assert.equal(status, 200);
  });

  test('en local, clé secrète de test « toujours en échec » → 400 captcha', async () => {
    const fetch = createFetch({ turnstile: { success: false, 'error-codes': ['invalid-input-response'] } });
    const { status } = await call(local(validFields()), { env: { ...BREVO_ENV, TURNSTILE_SECRET_KEY: FAIL_SECRET }, fetch });
    assert.equal(status, 400);
  });

  test('clé secrète de test en ligne (Production, Preview) → 503, ni Siteverify ni e-mail', async () => {
    const hosts = ['https://atousy.com', 'https://atousy.pages.dev', 'https://1a2b3c4d.atousy.pages.dev', 'https://localhost.example'];
    for (const secret of [PASS_SECRET, FAIL_SECRET, '3x0000000000000000000000000000000AA']) {
      for (const origin of hosts) {
        const request = formRequest(validFields(), { url: `${origin}/api/devis`, headers: { origin } });
        const { status, body, fetch, logger } = await call(request, { env: { ...BREVO_ENV, TURNSTILE_SECRET_KEY: secret } });
        assert.equal(status, 503, `${secret} ${origin}`);
        assert.deepEqual(body, { ok: false, error: 'not_configured' });
        assert.equal(fetch.calls.length, 0);
        assert.match(logger.lines.join('\n'), /turnstile test secret outside localhost/);
        assertCleanLogs(logger, { ...BREVO_ENV, TURNSTILE_SECRET_KEY: secret });
      }
    }
  });

  test('clé de test acceptée sur 127.0.0.1 et [::1]', async () => {
    for (const origin of ['http://127.0.0.1:8788', 'http://[::1]:8788']) {
      const request = formRequest(validFields(), { url: `${origin}/api/devis`, headers: { origin } });
      const fetch = createFetch({ turnstile: { success: true, hostname: 'example.com' } });
      const { status } = await call(request, { env: { ...BREVO_ENV, TURNSTILE_SECRET_KEY: PASS_SECRET }, fetch });
      assert.equal(status, 200, origin);
    }
  });

  test('jeton émis pour une autre action que « devis » → 400 captcha, aucun e-mail', async () => {
    for (const action of ['autre', '', undefined, 'DEVIS']) {
      const fetch = createFetch({ turnstile: { success: true, hostname: 'atousy.com', action } });
      const { status, body, logger } = await call(formRequest(validFields()), { fetch });
      assert.equal(status, 400, `action=${action}`);
      assert.deepEqual(body, { ok: false, error: 'captcha' });
      assert.equal(fetch.providerCalls().length, 0);
      assert.match(logger.lines.join('\n'), /action-mismatch/);
    }
  });

  test('TURNSTILE_SECRET_KEY absente → 503 not_configured (fermé par défaut), aucun appel', async () => {
    const env = { ...BREVO_ENV, TURNSTILE_SECRET_KEY: undefined };
    const { status, body, headers, fetch, logger } = await call(formRequest(validFields()), { env });
    assert.equal(status, 503);
    assert.deepEqual(body, { ok: false, error: 'not_configured' });
    assertJsonNoStore(headers);
    assert.equal(fetch.calls.length, 0);
    assert.match(logger.lines.join('\n'), /TURNSTILE_SECRET_KEY/);
  });

  test('clé secrète refusée par Siteverify (invalid-input-secret) → 503 not_configured', async () => {
    const fetch = createFetch({ turnstile: { success: false, 'error-codes': ['invalid-input-secret'] } });
    const { status, body } = await call(formRequest(validFields()), { fetch });
    assert.equal(status, 503);
    assert.deepEqual(body, { ok: false, error: 'not_configured' });
    assert.equal(fetch.providerCalls().length, 0);
  });

  test('Siteverify en panne (réseau, 5xx, réponse illisible, délai) → 502, jamais ok', async () => {
    const cases = [
      () => Promise.reject(new TypeError('fetch failed')),
      () => new Response('Bad gateway', { status: 502 }),
      () => new Response('<html>', { status: 200 }),
      () => Response.json({ success: true, hostname: 'atousy.com' }, { status: 500 }),
      () => Response.json({ success: false, 'error-codes': ['internal-error'] }),
      hangingResponse,
    ];
    for (const turnstile of cases) {
      const fetch = createFetch({ turnstile });
      const { status, body } = await call(formRequest(validFields()), { fetch, turnstileTimeoutMs: 30 });
      assert.equal(status, 502);
      assert.deepEqual(body, { ok: false, error: 'delivery_failed' });
      assert.equal(fetch.providerCalls().length, 0);
    }
  });
});

// ---------------------------------------------------------------------------

describe('plafond quotidien (KV DEVIS_COUNTER, facultatif)', () => {
  /** Espace KV simulé : Map + enregistrement des écritures. */
  function fakeKv(initial = {}) {
    const store = new Map(Object.entries(initial));
    const puts = [];
    return {
      store,
      puts,
      async get(key) {
        return store.has(key) ? store.get(key) : null;
      },
      async put(key, value, options) {
        puts.push({ key, value, options });
        store.set(key, value);
      },
    };
  }
  const KEY = 'devis:2026-10-26';

  test('sans KV lié : aucun plafond (comportement par défaut)', async () => {
    const { status } = await call(formRequest(validFields()), { env: { ...BREVO_ENV, DEVIS_DAILY_LIMIT: '1' } });
    assert.equal(status, 200);
  });

  test('sous le plafond : compteur du jour incrémenté, e-mail envoyé', async () => {
    const kv = fakeKv({ [KEY]: '3' });
    const { status, fetch } = await call(formRequest(validFields()), { env: { ...BREVO_ENV, DEVIS_COUNTER: kv } });
    assert.equal(status, 200);
    assert.equal(fetch.providerCalls().length, 1);
    assert.deepEqual(kv.puts, [{ key: KEY, value: '4', options: { expirationTtl: 172800 } }]);
  });

  test('plafond atteint → 429 rate_limited, aucun e-mail, journal sans donnée personnelle', async () => {
    const kv = fakeKv({ [KEY]: String(DEFAULT_DAILY_LIMIT) });
    const { status, body, headers, fetch, logger } = await call(formRequest(validFields()), { env: { ...BREVO_ENV, DEVIS_COUNTER: kv } });
    assert.equal(status, 429);
    assert.deepEqual(body, { ok: false, error: 'rate_limited' });
    assertJsonNoStore(headers);
    assert.equal(fetch.providerCalls().length, 0);
    assert.equal(kv.puts.length, 0);
    assert.match(logger.lines.join('\n'), /rate_limited: daily cap 50/);
    assertCleanLogs(logger);
  });

  test('DEVIS_DAILY_LIMIT personnalisé', async () => {
    const kv = fakeKv({ [KEY]: '2' });
    const env = { ...BREVO_ENV, DEVIS_COUNTER: kv, DEVIS_DAILY_LIMIT: '2' };
    assert.equal((await call(formRequest(validFields()), { env })).status, 429);
    assert.equal(dailyLimit({ DEVIS_DAILY_LIMIT: ' 10 ' }), 10);
    for (const bad of ['0', '-1', 'abc', '1e3', '', undefined]) assert.equal(dailyLimit({ DEVIS_DAILY_LIMIT: bad }), DEFAULT_DAILY_LIMIT, String(bad));
  });

  test('compteur consulté seulement après un jeton Turnstile valide', async () => {
    const kv = fakeKv();
    const fetch = createFetch({ turnstile: { success: false, 'error-codes': ['invalid-input-response'] } });
    const { status } = await call(formRequest(validFields()), { env: { ...BREVO_ENV, DEVIS_COUNTER: kv }, fetch });
    assert.equal(status, 400);
    assert.equal(kv.puts.length, 0);
  });

  test('KV en erreur : la demande part quand même, incident journalisé', async () => {
    const kv = {
      async get() {
        throw new Error('KV down');
      },
      async put() {},
    };
    const { status, fetch, logger } = await call(formRequest(validFields()), { env: { ...BREVO_ENV, DEVIS_COUNTER: kv } });
    assert.equal(status, 200);
    assert.equal(fetch.providerCalls().length, 1);
    assert.match(logger.lines.join('\n'), /daily cap unavailable/);
  });
});

describe('configuration du fournisseur d’e-mail', () => {
  const cases = {
    'EMAIL_PROVIDER absent': { EMAIL_PROVIDER: undefined },
    'EMAIL_PROVIDER inconnu': { EMAIL_PROVIDER: 'sendgrid' },
    'EMAIL_PROVIDER = propriété héritée': { EMAIL_PROVIDER: 'constructor' },
    'BREVO_API_KEY absente': { BREVO_API_KEY: '' },
    'MAIL_TO absent': { MAIL_TO: undefined },
    'MAIL_TO invalide': { MAIL_TO: 'contact@atousy.com, pas-une-adresse' },
    'MAIL_FROM absent': { MAIL_FROM: undefined },
    'MAIL_FROM invalide': { MAIL_FROM: 'Atousy' },
    'MAIL_FROM avec retour à la ligne': { MAIL_FROM: 'Atousy <contact@atousy.com>\r\nBcc: x@y.fr' },
    'clé Resend absente avec EMAIL_PROVIDER=resend': { EMAIL_PROVIDER: 'resend' },
    'EMAIL_API_BASE vers un hôte distant (refusé)': { EMAIL_API_BASE: 'https://collecte.example' },
    'EMAIL_API_BASE illisible': { EMAIL_API_BASE: 'pas une url' },
  };
  for (const [name, patch] of Object.entries(cases)) {
    test(`${name} → 503 not_configured, jeton Turnstile non consommé`, async () => {
      const { status, body, fetch, logger } = await call(formRequest(validFields()), { env: { ...BREVO_ENV, ...patch } });
      assert.equal(status, 503);
      assert.deepEqual(body, { ok: false, error: 'not_configured' });
      assert.equal(fetch.calls.length, 0);
      assertCleanLogs(logger);
    });
  }

  test('EMAIL_API_BASE local (tests uniquement) remplace l’URL de base du fournisseur', async () => {
    const env = { ...BREVO_ENV, EMAIL_API_BASE: 'http://127.0.0.1:8799/' };
    const { status, fetch, logger } = await call(formRequest(validFields()), { env });
    assert.equal(status, 200);
    assert.equal(fetch.providerCalls()[0].url, 'http://127.0.0.1:8799/v3/smtp/email');
    assert.match(logger.lines.join('\n'), /EMAIL_API_BASE/);
    const resend = createFetch({ provider: { status: 200, body: { id: 'x' } } });
    await call(formRequest(validFields()), { env: { ...RESEND_ENV, EMAIL_API_BASE: 'http://localhost:8799' }, fetch: resend });
    assert.equal(resend.providerCalls()[0].url, 'http://localhost:8799/emails');
  });

  test('sans EMAIL_API_BASE, l’URL officielle est utilisée', async () => {
    const { fetch } = await call(formRequest(validFields()), { env: { ...BREVO_ENV, EMAIL_API_BASE: '' } });
    assert.equal(fetch.providerCalls()[0].url, BREVO_URL);
  });
});

describe('échec de remise : jamais de faux succès', () => {
  test('délai par défaut de 8 s', () => {
    assert.equal(EMAIL_TIMEOUT_MS, 8000);
  });

  test('fournisseur en erreur 500 → 502 delivery_failed, corps du fournisseur non divulgué', async () => {
    const fetch = createFetch({ provider: { status: 500, body: { message: 'Internal error for camille@example.org', code: 'internal' } } });
    const { status, body, headers, logger } = await call(formRequest(validFields()), { fetch });
    assert.equal(status, 502);
    assert.deepEqual(body, { ok: false, error: 'delivery_failed' });
    assertJsonNoStore(headers);
    const log = logger.lines.join('\n');
    assert.match(log, /provider=brevo status=500 code=internal/);
    assertCleanLogs(logger);
  });

  test('clé refusée (401/400) → 502, seul le code d’erreur court est journalisé', async () => {
    const fetch = createFetch({ provider: { status: 401, body: { code: 'unauthorized', message: 'Key not found: xkeysib-test-key' } } });
    const { status, logger } = await call(formRequest(validFields()), { fetch });
    assert.equal(status, 502);
    assert.match(logger.lines.join('\n'), /status=401 code=unauthorized/);
    assertCleanLogs(logger);
  });

  test('Resend 422 → 502', async () => {
    const fetch = createFetch({ provider: { status: 422, body: { statusCode: 422, name: 'validation_error', message: 'Invalid `to` field.' } } });
    const { status, body, logger } = await call(formRequest(validFields()), { env: RESEND_ENV, fetch });
    assert.equal(status, 502);
    assert.deepEqual(body, { ok: false, error: 'delivery_failed' });
    assert.match(logger.lines.join('\n'), /provider=resend status=422 code=validation_error/);
    assertCleanLogs(logger, RESEND_ENV);
  });

  test('redirection (3xx) non suivie → 502', async () => {
    const fetch = createFetch({ provider: () => new Response(null, { status: 302, headers: { location: 'https://ailleurs.example' } }) });
    const { status } = await call(formRequest(validFields()), { fetch });
    assert.equal(status, 502);
    assert.equal(fetch.providerCalls()[0].init.redirect, 'manual');
  });

  test('erreur réseau → 502', async () => {
    const fetch = createFetch({ provider: () => Promise.reject(new TypeError('fetch failed')) });
    const { status, body, logger } = await call(formRequest(validFields()), { fetch });
    assert.equal(status, 502);
    assert.deepEqual(body, { ok: false, error: 'delivery_failed' });
    assert.match(logger.lines.join('\n'), /provider=brevo network/);
  });

  test('délai dépassé (AbortController) → 502', async () => {
    const fetch = createFetch({ provider: hangingResponse });
    const started = performance.now();
    const { status, body, logger } = await call(formRequest(validFields()), { fetch, emailTimeoutMs: 40 });
    const elapsed = performance.now() - started;
    assert.equal(status, 502);
    assert.deepEqual(body, { ok: false, error: 'delivery_failed' });
    assert.ok(elapsed >= 35 && elapsed < 2000, `durée ${elapsed} ms`);
    assert.ok(fetch.providerCalls()[0].init.signal instanceof AbortSignal);
    assert.match(logger.lines.join('\n'), /provider=brevo timeout/);
  });

  test('erreur inattendue → 502, jamais ok', async () => {
    const env = new Proxy(
      {},
      {
        get() {
          throw new Error('boom');
        },
      },
    );
    const { status, body } = await call(formRequest(validFields()), { env });
    assert.equal(status, 502);
    assert.deepEqual(body, { ok: false, error: 'delivery_failed' });
  });
});
