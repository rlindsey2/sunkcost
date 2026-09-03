/**
 * Bundles the built site into ONE self-contained HTML file, for hosts that take
 * a single file (a Claude Artifact, an email attachment, a USB stick).
 * Reads dist/, inlines the CSS and JS, and writes dist/sunkcost-standalone.html.
 *
 * The output has no <!doctype>, <html>, <head> or <body> tags, because the
 * Artifact host supplies those. Browsers render it fine either way.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const assets = readdirSync(join(dist, 'assets'));
const css = assets.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(dist, 'assets', f), 'utf8')).join('\n');
const js = assets.filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(dist, 'assets', f), 'utf8')).join('\n');

// the site's <title> is written for search results; a single shared page wants the product name
const title = process.env.ARTIFACT_TITLE ?? 'Sunk Cost';
const body = html
  .slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  .replace(/<script[^>]*><\/script>/g, '')
  // a sandboxed host blocks page-initiated saves, so don't offer a button that cannot work
  .replace(/\s*<button[^>]*id="download-card"[^>]*>.*?<\/button>/s, '');

// the Artifact host supplies a charset, but a bare file opened from disk or a
// plain static server needs its own or the typographic quotes turn to mojibake
const out = `<meta charset="utf-8">
<title>${title}</title>
<style>
${css}
</style>
${body}
<script type="module">
${js}
</script>
`;

const path = join(dist, 'sunkcost-standalone.html');
writeFileSync(path, out);
console.log(`wrote ${path} (${(out.length / 1024).toFixed(0)} KB, self-contained)`);
