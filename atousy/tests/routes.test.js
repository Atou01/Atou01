// Tests des routes Pages Functions elles-mêmes (functions/api/*.js), avec le
// fetch global simulé, comme dans l'environnement Cloudflare.

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { onRequest as devis } from '../functions/api/devis.js';
import { onRequest as pays, countryOf } from '../functions/api/pays.js';
import { BREVO_ENV, BREVO_URL, SITEVERIFY, DEVIS_URL, validFields, formRequest, createFetch } from './helpers.js';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function paysRequest({ cf, header, method = 'GET' } = {}) {
  const headers = header === undefined ? {} : { 'CF-IPCountry': header };
  const request = new Request('https://atousy.com/api/pays', { method, headers });
  if (cf !== undefined) Object.defineProperty(request, 'cf', { value: cf });
  return request;
}

describe('GET /api/pays', () => {
  test('pays fourni par request.cf.country', async () => {
    const res = pays({ request: paysRequest({ cf: { country: 'FR' } }) });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/json; charset=utf-8');
    assert.equal(res.headers.get('cache-control'), 'private, no-store');
    assert.equal(await res.text(), '{"country":"FR"}');
  });

  test('repli sur l’en-tête CF-IPCountry', async () => {
    const res = pays({ request: paysRequest({ header: 'CH' }) });
    assert.deepEqual(await res.json(), { country: 'CH' });
  });

  test('request.cf prioritaire sur l’en-tête', async () => {
    const res = pays({ request: paysRequest({ cf: { country: 'CH' }, header: 'FR' }) });
    assert.deepEqual(await res.json(), { country: 'CH' });
  });

  test('cf présent sans pays → repli sur l’en-tête', () => {
    assert.equal(countryOf(paysRequest({ cf: {}, header: 'FR' })), 'FR');
  });

  test('valeurs inconnues ou invalides → null', async () => {
    const cases = [
      {},
      { cf: { country: 'XX' } },
      { cf: { country: 'T1' } },
      { header: 'XX' },
      { header: 'T1' },
      { header: '' },
      { header: 'FRA' },
      { header: 'F' },
      { header: '12' },
      { header: 'é1' },
      { cf: { country: 42 } },
      { cf: null },
    ];
    for (const c of cases) {
      const res = pays({ request: paysRequest(c) });
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { country: null }, JSON.stringify(c));
    }
  });

  test('casse et espaces normalisés', () => {
    assert.equal(countryOf(paysRequest({ header: ' fr ' })), 'FR');
  });

  test('HEAD → 200 sans corps', async () => {
    const res = pays({ request: paysRequest({ method: 'HEAD', cf: { country: 'FR' } }) });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'private, no-store');
    assert.equal(await res.text(), '');
  });

  for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS']) {
    test(`${method} → 405`, async () => {
      const res = pays({ request: paysRequest({ method }) });
      assert.equal(res.status, 405);
      assert.equal(res.headers.get('allow'), 'GET, HEAD');
      assert.equal(res.headers.get('cache-control'), 'private, no-store');
      assert.deepEqual(await res.json(), { ok: false, error: 'method' });
    });
  }
});

describe('route /api/devis', () => {
  test('délègue à server/devis.js avec context.env et le fetch global', async () => {
    const fetch = createFetch();
    globalThis.fetch = fetch;
    const res = await devis({ request: formRequest(validFields()), env: BREVO_ENV });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.deepEqual(
      fetch.calls.map((c) => c.url),
      [SITEVERIFY, BREVO_URL],
    );
  });

  test('GET → 405 Allow: POST', async () => {
    const res = await devis({ request: new Request(DEVIS_URL), env: BREVO_ENV });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get('allow'), 'POST');
  });

  test('fournisseur en échec → 502, jamais ok', async () => {
    globalThis.fetch = createFetch({ provider: { status: 503, body: {} } });
    const original = console.error;
    console.error = () => {};
    try {
      const res = await devis({ request: formRequest(validFields()), env: BREVO_ENV });
      assert.equal(res.status, 502);
      assert.deepEqual(await res.json(), { ok: false, error: 'delivery_failed' });
    } finally {
      console.error = original;
    }
  });

  test('aucune configuration → 503 not_configured', async () => {
    globalThis.fetch = createFetch();
    const original = console.error;
    console.error = () => {};
    try {
      const res = await devis({ request: formRequest(validFields()), env: {} });
      assert.equal(res.status, 503);
      assert.deepEqual(await res.json(), { ok: false, error: 'not_configured' });
      assert.equal(globalThis.fetch.calls.length, 0);
    } finally {
      console.error = original;
    }
  });
});
