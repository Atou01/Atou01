// Envoi du formulaire sans JavaScript : la fonction répond par une page HTML lisible,
// avec le même code HTTP, et la confirmation n'apparaît qu'après un envoi accepté.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { handleDevis } from '../server/devis.js';
import { wantsHtml } from '../server/html.js';
import { BREVO_ENV, validFields, formRequest, createFetch, createLogger } from './helpers.js';

const NAVIGATE = { 'sec-fetch-mode': 'navigate', accept: 'text/html,application/xhtml+xml,*/*;q=0.8' };
const opts = (fetch) => ({ fetch, logger: createLogger(), now: () => Date.now() });

describe('wantsHtml', () => {
  test('navigation du navigateur → HTML', () => {
    assert.equal(wantsHtml(new Request('https://atousy.com/api/devis', { headers: NAVIGATE })), true);
  });
  test('fetch du script (Accept: application/json) → JSON', () => {
    assert.equal(wantsHtml(new Request('https://atousy.com/api/devis', { headers: { accept: 'application/json' } })), false);
  });
  test('sans en-tête Accept → JSON', () => {
    assert.equal(wantsHtml(new Request('https://atousy.com/api/devis')), false);
  });
});

describe('POST /api/devis sans JavaScript', () => {
  test('envoi accepté → page « Demande envoyée », 200', async () => {
    const fetch = createFetch();
    const res = await handleDevis(formRequest(validFields(), { headers: NAVIGATE }), BREVO_ENV, opts(fetch));
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const html = await res.text();
    assert.match(html, /Demande envoyée/);
    assert.equal(fetch.providerCalls().length, 1);
  });

  test('fournisseur en erreur → jamais de confirmation, 502', async () => {
    const fetch = createFetch({ provider: { status: 500, body: {} } });
    const res = await handleDevis(formRequest(validFields(), { headers: NAVIGATE }), BREVO_ENV, opts(fetch));
    assert.equal(res.status, 502);
    const html = await res.text();
    assert.doesNotMatch(html, /Demande envoyée/);
    assert.match(html, /n&#39;a pas pu être envoyée/);
  });

  test('service non configuré → page honnête, 503', async () => {
    const res = await handleDevis(formRequest(validFields(), { headers: NAVIGATE }), {}, opts(createFetch()));
    assert.equal(res.status, 503);
    const html = await res.text();
    assert.match(html, /pas encore raccordé/);
    assert.doesNotMatch(html, /Demande envoyée/);
  });

  test('champs invalides → liste des messages échappés, 400', async () => {
    const res = await handleDevis(formRequest(validFields({ email: 'pas-un-email', activite: '' }), { headers: NAVIGATE }), BREVO_ENV, opts(createFetch()));
    assert.equal(res.status, 400);
    const html = await res.text();
    assert.match(html, /Quelques informations sont à compléter/);
    assert.match(html, /<li>L&#39;adresse e-mail n&#39;est pas valide\.<\/li>/);
  });

  test('captcha refusé → explique que JavaScript est nécessaire, 400', async () => {
    const fetch = createFetch({ turnstile: { success: false, 'error-codes': ['invalid-input-response'] } });
    const res = await handleDevis(formRequest(validFields(), { headers: NAVIGATE }), BREVO_ENV, opts(fetch));
    assert.equal(res.status, 400);
    assert.match(await res.text(), /besoin de JavaScript/);
  });

  test('la réponse JSON reste inchangée pour le script de la page', async () => {
    const res = await handleDevis(formRequest(validFields(), { headers: { accept: 'application/json' } }), {}, opts(createFetch()));
    assert.equal(res.headers.get('content-type'), 'application/json; charset=utf-8');
    assert.deepEqual(await res.json(), { ok: false, error: 'not_configured' });
  });
});
