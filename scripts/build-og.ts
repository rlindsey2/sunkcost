/**
 * Renders a share card PNG for every hardware × model pair that can be computed,
 * at the default usage, into public/og/. Also public/og/default.png for the home page.
 * Same renderer as the in-page download button, so the cards match the site.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { computeView } from '../src/compute';
import { cardSvg, CARD_FONT } from '../src/card';
import { hasShareCard } from '../src/share';
import { defaultState } from '../src/state';
import { OG_WIDTH, OG_HEIGHT } from '../src/og';
import type { Dataset } from '../src/types';

const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const data: Dataset = { hardware: read('hardware.json'), models: read('models.json'), throughput: read('throughput.json'), defaults: read('defaults.json') };

const outDir = new URL('../public/og/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const FONT = CARD_FONT;

// Loading every system font per card is slow (seconds each). Use the first font file we can find;
// drop a .ttf/.otf into assets/fonts/ to make the cards identical on every machine.
const FONT_CANDIDATES = [
  new URL('../assets/fonts/', import.meta.url).pathname,
  '/System/Library/Fonts/Supplemental/Arial.ttf',
  '/System/Library/Fonts/Helvetica.ttc',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
];
const fontOpts = (() => {
  const dir = FONT_CANDIDATES[0];
  if (existsSync(dir)) return { loadSystemFonts: false, fontDirs: [dir], defaultFontFamily: 'sans-serif' };
  const file = FONT_CANDIDATES.slice(1).find((f) => existsSync(f));
  if (file) return { loadSystemFonts: false, fontFiles: [file], defaultFontFamily: file.includes('Arial') ? 'Arial' : file.includes('Helvetica') ? 'Helvetica' : 'sans-serif' };
  return { loadSystemFonts: true, defaultFontFamily: 'sans-serif' };
})();

function cardFor(hwId: string, modelId: string): string | null {
  if (!hasShareCard(hwId, modelId, data)) return null;
  return cardSvg({ ...defaultState(data), hw: hwId, model: modelId }, data, FONT);
}

function toPng(svg: string): Buffer {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH }, font: fontOpts });
  return r.render().asPng();
}

let n = 0;
const manifest: Record<string, string> = {};
// per machine-and-model pair: which card to show and what to say about it
const shareManifest: { pairs: Record<string, { image: string; headline: string; config: string }>; defaults: Record<string, string> } = { pairs: {}, defaults: {} };
for (const hw of data.hardware) {
  for (const m of data.models) {
    const svg = cardFor(hw.id, m.id);
    if (!svg) continue;
    const name = `${hw.id}--${m.id}.png`;
    writeFileSync(new URL(name, outDir), toPng(svg));
    manifest[`${hw.id}|${m.id}`] = `/og/${name}`;
    const v = computeView({ ...defaultState(data), hw: hw.id, model: m.id }, data);
    shareManifest.pairs[`${hw.id}|${m.id}`] = { image: `/og/${name}`, headline: v.verdict.headline, config: v.configLine };
    n++;
  }
}
// default card: the default state
const ds = defaultState(data);
const dv = computeView(ds, data);
const def = dv.model ? cardFor(ds.hw, dv.model.id) : null;
if (def) writeFileSync(new URL('default.png', outDir), toPng(def));
writeFileSync(new URL('manifest.json', outDir), JSON.stringify(manifest, null, 2));
// read by scripts/build-share-pages.ts, which writes one share page per pair
const genDir = new URL('../.generated/', import.meta.url);
mkdirSync(genDir, { recursive: true });
writeFileSync(new URL('share-manifest.json', genDir), JSON.stringify(shareManifest));
console.log(`wrote ${n} OG cards${def ? ' + default.png' : ''} to public/og/ (${OG_WIDTH}×${OG_HEIGHT})`);
