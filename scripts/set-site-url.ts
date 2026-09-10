/**
 * Rewrites the absolute URLs in the built index.html to the site the files are
 * actually being served from. Run after `vite build` when deploying anywhere
 * other than the production domain:
 *
 *   SITE_URL=https://example.netlify.app tsx scripts/set-site-url.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';

// SITE_URL wins; otherwise Netlify's own URL variable names the primary domain of the site being built
const target = (process.env.SITE_URL ?? process.env.URL ?? '').replace(/\/$/, '');
if (!target) {
  console.log('neither SITE_URL nor URL is set; leaving the built URLs alone');
  process.exit(0);
}

const defaults = JSON.parse(readFileSync(new URL('../data/defaults.json', import.meta.url), 'utf8'));
const from: string = (defaults.site_url as string).replace(/\/$/, '');
const path = new URL('../dist/index.html', import.meta.url);
const html = readFileSync(path, 'utf8');
const out = html.split(from).join(target);
writeFileSync(path, out);
console.log(`rewrote ${(html.split(from).length - 1)} absolute URLs from ${from} to ${target}`);
