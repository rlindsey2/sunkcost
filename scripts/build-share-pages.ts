/**
 * Writes a page for every machine-and-model pair that has a share card: the built app,
 * unchanged, with its share tags set for that pair. A link like
 * /s/mac-mini-m6-32/qwen3.8-27b-q4/?u=1000000 therefore previews correctly on X, Slack
 * or iMessage without anything running at request time. Runs after `vite build`.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const dist = new URL('../dist/', import.meta.url);
const defaults = JSON.parse(readFileSync(new URL('../data/defaults.json', import.meta.url), 'utf8'));
const site = String(defaults.site_url).replace(/\/$/, '');
const manifest = JSON.parse(readFileSync(new URL('../.generated/share-manifest.json', import.meta.url), 'utf8')) as {
  pairs: Record<string, { image: string; headline: string; config: string }>;
};
/** the image URL with a hash of its bytes, so X and others refetch a card that changed instead of showing a cached one */
const versioned = (path: string) => `${site}${path}?v=${createHash('sha1').update(readFileSync(new URL(path.slice(1), dist))).digest('hex').slice(0, 10)}`;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function setMeta(html: string, attr: 'property' | 'name', key: string, value: string): string {
  const re = new RegExp(`<meta ${attr}="${key.replace(/[.:]/g, '\\$&')}" content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `  ${tag}\n</head>`);
}

const home = new URL('index.html', dist);
const shell = ['og:image', 'twitter:image'].reduce(
  (html, key) => setMeta(html, key === 'og:image' ? 'property' : 'name', key, versioned('/og/default.png')),
  readFileSync(home, 'utf8'),
);
writeFileSync(home, shell);

// The home page's JSON-LD describes the home page. A share page is a different
// address with a different verdict on it, and it is noindex besides, so the
// markup would say something untrue about it and buy nothing for saying it.
const shareShell = shell.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
if (shareShell.includes('ld+json')) throw new Error('share pages still carry the home page\u2019s structured data');

let n = 0;
for (const [key, pair] of Object.entries(manifest.pairs)) {
  const [hw, model] = key.split('|');
  const url = `${site}/s/${hw}/${model}/`;
  const title = `${pair.headline} — Sunk Cost`;
  const description = `${pair.config}. Whether buying it beats renting the same model by the token, and how long that takes.`;
  let html = shareShell;
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'name', 'twitter:description', description);
  html = setMeta(html, 'property', 'og:image', versioned(pair.image));
  html = setMeta(html, 'name', 'twitter:image', versioned(pair.image));
  html = setMeta(html, 'property', 'og:image:alt', `${pair.headline} ${pair.config}`);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:card', 'summary_large_image');
  // near-duplicates of the app, one per pair: fine to preview, pointless to index
  html = setMeta(html, 'name', 'robots', 'noindex');
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(url)}" />`);
  const dir = new URL(`s/${hw}/${model}/`, dist);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('index.html', dir), html);
  n++;
}
console.log(`wrote ${n} share pages under dist/s/`);
