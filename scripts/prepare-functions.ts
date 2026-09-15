/**
 * Stages what the Cloudflare card functions bundle (functions/): the font the build-time cards
 * were drawn with, a build version for card URLs, and dist/_routes.json. Runs after the build.
 *
 * On-demand cards need more CPU per request than Cloudflare's free Workers plan allows, so they
 * are switched on with DYNAMIC_CARDS=on (a GitHub repo variable). Off, only /card/* reaches a
 * function (nothing links there); every share page stays fully static with its pair's card.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// same order as scripts/build-og.ts, so a card drawn on demand matches the pre-built ones
const FONTS: [string, string][] = [
  ['/System/Library/Fonts/Supplemental/Arial.ttf', 'Arial'],
  ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 'DejaVu Sans'],
  ['/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 'Liberation Sans'],
];
const font = FONTS.find(([f]) => existsSync(f));
if (!font) throw new Error('prepare-functions: no font file found for the card renderer');

const gen = new URL('../.generated/', import.meta.url);
mkdirSync(new URL('fonts/', gen), { recursive: true });
copyFileSync(font[0], new URL('fonts/sans.bin', gen));

const version = createHash('sha1').update(process.env.GITHUB_SHA ?? String(Date.now())).digest('hex').slice(0, 10);
writeFileSync(new URL('card-build.json', gen), JSON.stringify({ version, fontFamily: font[1] }));

const on = process.env.DYNAMIC_CARDS === 'on';
const routes = { version: 1, include: on ? ['/s/*', '/card/*'] : ['/card/*'], exclude: [] };
writeFileSync(new URL('../dist/_routes.json', import.meta.url), JSON.stringify(routes));
console.log(`functions: font ${font[1]}, version ${version}, on-demand cards ${on ? 'ON' : 'off'}`);
