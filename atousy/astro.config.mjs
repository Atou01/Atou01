// @ts-check
import { defineConfig } from 'astro/config';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://atousy.com';

// ---------------------------------------------------------------------------
// Après le build (dist/) : Content-Security-Policy et sitemap.xml
// ---------------------------------------------------------------------------
// - CSP : ajoutée sous « /* » dans dist/_headers. Les scripts en ligne d'Astro sont autorisés
//   par leur empreinte SHA-256, recalculée à chaque build : un script modifié reste autorisé,
//   un script injecté par un tiers est bloqué. Les styles en ligne restent permis (attributs
//   style des démos). Turnstile (https://challenges.cloudflare.com) est le seul tiers admis.
// - sitemap.xml : les pages sans « noindex », à leur adresse canonique.
// Les fonctions ci-dessous sont exportées pour tests/build.test.js.

export const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com';
/** Longueur maximale d'une ligne d'en-tête dans _headers (limite de Cloudflare Pages). */
export const MAX_HEADER_LINE = 2000;

const JS_TYPES = new Set(['', 'module', 'text/javascript', 'application/javascript']);

/** Empreintes « 'sha256-…' » des scripts en ligne exécutables d'une page HTML. */
export function inlineScriptHashes(html) {
  const out = new Set();
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const attrs = m[1];
    if (/\ssrc\s*=/i.test(attrs)) continue;
    // Les blocs de données (application/ld+json…) ne sont pas exécutés : la CSP les ignore.
    const type = (attrs.match(/\stype\s*=\s*["']?([^"'\s>]+)/i)?.[1] ?? '').toLowerCase();
    if (!JS_TYPES.has(type)) continue;
    out.add(`'sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}'`);
  }
  return out;
}

/** @param {Iterable<string>} hashes */
export function buildCsp(hashes) {
  return [
    "default-src 'self'",
    ["script-src 'self'", ...[...hashes].sort(), TURNSTILE_ORIGIN].join(' '),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    `frame-src ${TURNSTILE_ORIGIN}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

/** Insère la CSP dans le bloc « /* » d'un fichier _headers (créé s'il manque). */
export function addCspToHeaders(text, csp) {
  if (/^\s*Content-Security-Policy(-Report-Only)?\s*:/im.test(text)) {
    throw new Error('public/_headers contient déjà une Content-Security-Policy : elle est produite au build, retirez-la.');
  }
  const line = `  Content-Security-Policy: ${csp}`;
  if (line.length > MAX_HEADER_LINE) {
    throw new Error(
      `Content-Security-Policy de ${line.length} caractères, au-delà des ${MAX_HEADER_LINE} admis par Cloudflare Pages : ` +
        'trop de scripts en ligne différents, déplacez-en dans des fichiers.',
    );
  }
  const lines = text.split('\n');
  const block = lines.findIndex((l) => l.trim() === '/*');
  if (block === -1) return `/*\n${line}\n\n${text}`;
  lines.splice(block + 1, 0, line);
  return lines.join('\n');
}

/** Balise <meta name="robots"> avec « noindex » ? */
export function isNoindex(html) {
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (/\sname\s*=\s*["']?robots\b/i.test(tag) && /noindex/i.test(tag)) return true;
  }
  return false;
}

/** Adresse de <link rel="canonical">, ou null. */
export function canonicalOf(html) {
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    if (!/\srel\s*=\s*["']?canonical\b/i.test(tag)) continue;
    const href = tag.match(/\shref\s*=\s*["']([^"']+)["']/i)?.[1];
    return href ? href.replace(/&amp;/g, '&') : null;
  }
  return null;
}

/** @param {Iterable<string>} urls */
export function buildSitemap(urls) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const entries = [...new Set(urls)].sort().map((u) => `  <url><loc>${esc(u)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

/** @returns {import('astro').AstroIntegration} */
function cspAndSitemap() {
  let origin = new URL(SITE).origin;
  return {
    name: 'atousy:csp-sitemap',
    hooks: {
      'astro:config:done': ({ config, logger }) => {
        if (config.site) origin = new URL(config.site).origin;
        // Build Cloudflare sans clé de site : le formulaire de devis n'aura pas d'anti-robot
        // et le serveur refusera chaque envoi (voir docs/formulaire-et-fonctions.md).
        if (process.env.CF_PAGES === '1' && !String(process.env.PUBLIC_TURNSTILE_SITE_KEY ?? '').trim()) {
          logger.warn('PUBLIC_TURNSTILE_SITE_KEY absente : le formulaire de devis ne pourra rien envoyer.');
        }
      },
      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const files = (await readdir(out, { recursive: true })).filter((f) => f.endsWith('.html')).sort();
        const hashes = new Set();
        const urls = new Set();
        for (const file of files) {
          const html = await readFile(join(out, file), 'utf8');
          for (const h of inlineScriptHashes(html)) hashes.add(h);
          if (isNoindex(html)) continue;
          const canonical = canonicalOf(html);
          if (canonical && canonical.startsWith(origin + '/')) urls.add(canonical);
          else logger.warn(`${file} : page indexable sans adresse canonique du site, absente du sitemap.`);
        }
        const headersFile = join(out, '_headers');
        const headers = await readFile(headersFile, 'utf8').catch(() => '');
        await writeFile(headersFile, addCspToHeaders(headers, buildCsp(hashes)));
        await writeFile(join(out, 'sitemap.xml'), buildSitemap(urls));
        logger.info(`CSP : ${hashes.size} script(s) en ligne autorisé(s) · sitemap.xml : ${urls.size} page(s).`);
      },
    },
  };
}

// Export 100 % statique (dist/) pour Cloudflare Pages.
// Les fonctions serveur (/api/*) vivent à part dans functions/.
export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  image: {
    responsiveStyles: false,
  },
  devToolbar: { enabled: false },
  integrations: [cspAndSitemap()],
});
