// Pays → marché (server/market.js) et pose du marché côté serveur (functions/_middleware.js).

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { marketForCountry, countryOf } from '../server/market.js';
import { onRequest as middleware } from '../functions/_middleware.js';

describe('marketForCountry', () => {
  test('Suisse et Liechtenstein → CHF', () => {
    assert.equal(marketForCountry('CH'), 'ch');
    assert.equal(marketForCountry('LI'), 'ch');
  });
  test('pays européens → EUR', () => {
    for (const c of ['FR', 'BE', 'DE', 'IT', 'ES', 'LU', 'MC', 'GB', 'NO', 'RE']) assert.equal(marketForCountry(c), 'fr', c);
  });
  test('hors Europe, inconnu ou invalide → null (défaut)', () => {
    for (const c of ['US', 'CA', 'MA', '', null, undefined, 42]) assert.equal(marketForCountry(c), null, String(c));
  });
  test('insensible à la casse', () => {
    assert.equal(marketForCountry('ch'), 'ch');
  });
});

describe('countryOf', () => {
  test('ignore XX et T1', () => {
    assert.equal(countryOf(new Request('https://atousy.com/', { headers: { 'cf-ipcountry': 'XX' } })), null);
    assert.equal(countryOf(new Request('https://atousy.com/', { headers: { 'cf-ipcountry': 'T1' } })), null);
  });
});

// HTMLRewriter n'existe que dans le runtime Cloudflare : version minimale pour les tests.
class FakeRewriter {
  constructor() {
    this.handlers = [];
  }
  on(selector, handler) {
    this.handlers.push({ selector, handler });
    return this;
  }
  transform(response) {
    const attrs = {};
    for (const { selector, handler } of this.handlers) {
      if (selector === 'html') handler.element({ setAttribute: (k, v) => (attrs[k] = v) });
    }
    const body = response.text().then((html) =>
      html.replace('<html lang="fr">', `<html lang="fr"${Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join('')}>`),
    );
    return new Response(new ReadableStream({ async start(c) { c.enqueue(new TextEncoder().encode(await body)); c.close(); } }), {
      status: response.status,
      headers: response.headers,
    });
  }
}

const page = '<!doctype html><html lang="fr"><head></head><body>prix</body></html>';
const htmlNext = () => Promise.resolve(new Response(page, { headers: { 'content-type': 'text/html; charset=utf-8', etag: '"abc"' } }));
const req = (country, method = 'GET') => {
  const r = new Request('https://atousy.com/offre/', { method });
  Object.defineProperty(r, 'cf', { value: country === undefined ? undefined : { country } });
  return r;
};

describe('functions/_middleware.js', () => {
  afterEach(() => {
    delete globalThis.HTMLRewriter;
  });

  test('visiteur en Suisse : <html data-market="ch" data-market-source="detected">, pas de cache partagé', async () => {
    globalThis.HTMLRewriter = FakeRewriter;
    const res = await middleware({ request: req('CH'), next: htmlNext });
    const html = await res.text();
    assert.match(html, /<html lang="fr" data-market="ch" data-market-source="detected">/);
    assert.equal(res.headers.get('cache-control'), 'private, no-cache');
    assert.equal(res.headers.get('etag'), null);
  });

  test('visiteur en France : data-market="fr"', async () => {
    globalThis.HTMLRewriter = FakeRewriter;
    const html = await (await middleware({ request: req('FR'), next: htmlNext })).text();
    assert.match(html, /data-market="fr"/);
  });

  test('hors Europe : page inchangée (le site affiche « par défaut »)', async () => {
    globalThis.HTMLRewriter = FakeRewriter;
    const html = await (await middleware({ request: req('US'), next: htmlNext })).text();
    assert.equal(html, page);
  });

  test('réponse non HTML (API, image) : inchangée', async () => {
    globalThis.HTMLRewriter = FakeRewriter;
    const json = new Response('{"ok":true}', { headers: { 'content-type': 'application/json' } });
    const res = await middleware({ request: req('CH'), next: () => Promise.resolve(json) });
    assert.equal(res, json);
  });

  test('POST (formulaire) : inchangé', async () => {
    globalThis.HTMLRewriter = FakeRewriter;
    const original = await htmlNext();
    const res = await middleware({ request: req('CH', 'POST'), next: () => Promise.resolve(original) });
    assert.equal(res, original);
  });

  test('sans HTMLRewriter (hors Cloudflare) : inchangé, sans erreur', async () => {
    const original = await htmlNext();
    const res = await middleware({ request: req('CH'), next: () => Promise.resolve(original) });
    assert.equal(res, original);
  });
});
