// @ts-check
import { defineConfig } from 'astro/config';

// Export 100 % statique (dist/) pour Cloudflare Pages.
// Les fonctions serveur (/api/*) vivent à part dans functions/.
export default defineConfig({
  site: 'https://atousy.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  image: {
    responsiveStyles: false,
  },
  devToolbar: { enabled: false },
});
