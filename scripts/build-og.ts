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
import {
  hardwareComparePath, hardwarePairs, hardwareVersusCard, modelComparePath, modelPairs, modelVersusCard, versusCardPath,
} from '../src/versus-card';
import {
  BEST_CARD, bestBuysCard, COMPARE_CARD, compareIndexCard, GPU_CARD, gpuCard, LEADERBOARD_CARD, leaderboardCard,
  MEMORY_CARD, memoryCard,
} from '../src/list-card';
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
/** The bold cut of each candidate above, so a heading comes out at the weight it asks for. */
const BOLD_CANDIDATES: Record<string, string> = {
  '/System/Library/Fonts/Supplemental/Arial.ttf': '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf': '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf': '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
};
const fontOpts = (() => {
  const dir = FONT_CANDIDATES[0];
  if (existsSync(dir)) return { loadSystemFonts: false, fontDirs: [dir], defaultFontFamily: 'sans-serif' };
  const file = FONT_CANDIDATES.slice(1).find((f) => existsSync(f));
  if (file) {
    const bold = BOLD_CANDIDATES[file];
    return {
      loadSystemFonts: false,
      fontFiles: [file, ...(bold && existsSync(bold) ? [bold] : [])],
      defaultFontFamily: file.includes('Arial') ? 'Arial' : file.includes('Helvetica') ? 'Helvetica' : 'sans-serif',
    };
  }
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
// head-to-head cards: one per comparison page, so a link to a comparison previews
// as that comparison instead of as the site's default card. Same file names the
// pages ask for, both sides derived from the page's own address.
let vs = 0;
const versus = (page: string, svg: string) => {
  writeFileSync(new URL(versusCardPath(page).replace('/og/', ''), outDir), toPng(svg));
  vs++;
};
for (const [a, b] of hardwarePairs(data)) versus(hardwareComparePath(a, b), hardwareVersusCard(a, b, data, FONT));
for (const [a, b] of modelPairs(data)) versus(modelComparePath(a, b), modelVersusCard(a, b, data, FONT));

// the pages that answer with a list rather than a single pairing get a card of
// their own rows, for the same reason: a link to the leaderboard should preview
// as the leaderboard.
const list: [string, string][] = [
  [LEADERBOARD_CARD, leaderboardCard(data, FONT)],
  [BEST_CARD, bestBuysCard(data, FONT)],
  [COMPARE_CARD, compareIndexCard(data, FONT)],
  [MEMORY_CARD, memoryCard(data, FONT)],
  [GPU_CARD, gpuCard(data, FONT)],
];
for (const [path, svg] of list) writeFileSync(new URL(path.replace('/og/', ''), outDir), toPng(svg));

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
console.log(`wrote ${n} OG cards + ${vs} head-to-head cards + ${list.length} list cards${def ? ' + default.png' : ''} to public/og/ (${OG_WIDTH}×${OG_HEIGHT})`);
