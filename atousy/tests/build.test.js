// Étape d'après-build d'astro.config.mjs : Content-Security-Policy (empreintes des scripts
// en ligne) ajoutée à dist/_headers, et sitemap.xml des pages indexables.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import {
  inlineScriptHashes,
  buildCsp,
  addCspToHeaders,
  isNoindex,
  canonicalOf,
  buildSitemap,
  MAX_HEADER_LINE,
} from '../astro.config.mjs';

const sha = (s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;

describe('inlineScriptHashes', () => {
  test('scripts en ligne exécutables seulement (classiques et modules)', () => {
    const html = `<head><script>var a = 1;</script><script type="module">import "x";</script>
      <script type="application/ld+json">{"@type":"Organization"}</script>
      <script type="module" src="/_astro/a.js"></script><script src="/b.js" defer></script>
      <script data-src="x">ok()</script></head>`;
    assert.deepEqual([...inlineScriptHashes(html)].sort(), [sha('var a = 1;'), sha('import "x";'), sha('ok()')].sort());
  });

  test('empreinte calculée sur le contenu exact, espaces et accents compris', () => {
    const body = "\n  // Marché : « Europe · EUR »\n  document.documentElement.classList.add('js');\n";
    assert.deepEqual([...inlineScriptHashes(`<script is:inline>${body}</script>`)], [sha(body)]);
  });
});

describe('buildCsp', () => {
  const csp = buildCsp(new Set(["'sha256-b'", "'sha256-a'"]));
  const directives = Object.fromEntries(csp.split('; ').map((d) => [d.split(' ')[0], d.split(' ').slice(1)]));

  test('scripts : le site, les empreintes, Turnstile ; jamais unsafe-inline ni unsafe-eval', () => {
    assert.deepEqual(directives['script-src'], ["'self'", "'sha256-a'", "'sha256-b'", 'https://challenges.cloudflare.com']);
    assert.doesNotMatch(csp, /script-src[^;]*unsafe/);
  });

  test('Turnstile en cadre, rien d’autre ; pas d’intégration du site ailleurs', () => {
    assert.deepEqual(directives['frame-src'], ['https://challenges.cloudflare.com']);
    assert.deepEqual(directives['frame-ancestors'], ["'none'"]);
    assert.deepEqual(directives['object-src'], ["'none'"]);
    assert.deepEqual(directives['form-action'], ["'self'"]);
    assert.deepEqual(directives['connect-src'], ["'self'"]);
    assert.deepEqual(directives['style-src'], ["'self'", "'unsafe-inline'"]);
  });
});

describe('addCspToHeaders', () => {
  const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');

  test('ajoutée au bloc « /* » de public/_headers, une seule fois', () => {
    const out = addCspToHeaders(headers, "default-src 'self'");
    const lines = out.split('\n');
    const i = lines.indexOf('/*');
    assert.equal(lines[i + 1], "  Content-Security-Policy: default-src 'self'");
    assert.equal(out.match(/^ +Content-Security-Policy:/gm).length, 1);
    // Le reste du fichier est inchangé.
    assert.equal(out.replace("  Content-Security-Policy: default-src 'self'\n", ''), headers);
  });

  test('public/_headers : HSTS sans sous-domaines, plus de interest-cohort, démos en noindex', () => {
    assert.match(headers, /^ {2}Strict-Transport-Security: max-age=31536000$/m);
    assert.doesNotMatch(headers, /includeSubDomains|preload|interest-cohort/);
    for (const demo of ['rivage', 'faitage', 'ecluse', 'lueur', 'moellon']) {
      assert.match(headers, new RegExp(`^/exemples/${demo}/\\*\\n {2}X-Robots-Tag: noindex, nofollow$`, 'm'), demo);
    }
  });

  test('refuse une CSP écrite à la main dans public/_headers', () => {
    assert.throws(() => addCspToHeaders("/*\n  Content-Security-Policy: default-src *\n", 'x'), /déjà/);
  });

  test('refuse une ligne trop longue pour Cloudflare Pages', () => {
    assert.throws(() => addCspToHeaders('/*\n', 'x'.repeat(MAX_HEADER_LINE)), /2000/);
  });

  test('crée le bloc « /* » s’il manque', () => {
    assert.equal(addCspToHeaders('', "default-src 'self'"), "/*\n  Content-Security-Policy: default-src 'self'\n\n");
  });
});

describe('sitemap', () => {
  test('noindex détecté quelle que soit la forme de la balise', () => {
    assert.equal(isNoindex('<meta name="robots" content="noindex, follow">'), true);
    assert.equal(isNoindex('<meta content="noindex,nofollow" name="robots" />'), true);
    assert.equal(isNoindex('<meta name="robots" content="index, follow">'), false);
    assert.equal(isNoindex('<meta name="description" content="Pas de noindex ici">'), false);
  });

  test('adresse canonique lue dans <link rel="canonical">', () => {
    assert.equal(canonicalOf('<link rel="canonical" href="https://atousy.com/offre/">'), 'https://atousy.com/offre/');
    assert.equal(canonicalOf('<link href="https://atousy.com/?a=1&amp;b=2" rel="canonical">'), 'https://atousy.com/?a=1&b=2');
    assert.equal(canonicalOf('<link rel="icon" href="/favicon.svg">'), null);
  });

  test('XML trié, sans doublon, caractères échappés', () => {
    const xml = buildSitemap(['https://atousy.com/offre/', 'https://atousy.com/', 'https://atousy.com/offre/', 'https://atousy.com/?a=1&b=2']);
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
    assert.deepEqual([...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]), [
      'https://atousy.com/',
      'https://atousy.com/?a=1&amp;b=2',
      'https://atousy.com/offre/',
    ]);
  });

  test('robots.txt déclare le sitemap', () => {
    const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
    assert.match(robots, /^Sitemap: https:\/\/atousy\.com\/sitemap\.xml$/m);
  });

  test('_routes.json : sitemap et démos (sans prix) hors des fonctions', () => {
    const routes = JSON.parse(readFileSync(new URL('../public/_routes.json', import.meta.url), 'utf8'));
    for (const path of ['/sitemap.xml', '/exemples/rivage/*', '/exemples/faitage/*', '/exemples/ecluse/*', '/exemples/lueur/*', '/exemples/moellon/*']) {
      assert.ok(routes.exclude.includes(path), path);
    }
    assert.ok(routes.include.length + routes.exclude.length <= 100, 'limite de 100 règles');
  });
});
