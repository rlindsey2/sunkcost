/**
 * Renders a share card PNG for every hardware × model pair that can be computed,
 * at the default usage, into public/og/. Also public/og/default.png for the home page.
 * Same renderer as the in-page download button, so the cards match the site.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { computeView } from '../src/compute';
import { defaultState } from '../src/state';
import { renderOgCard, ogFigures, OG_WIDTH, OG_HEIGHT } from '../src/og';
import { fmtDuration } from '../src/format';
import type { Dataset } from '../src/types';

const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const data: Dataset = { hardware: read('hardware.json'), models: read('models.json'), throughput: read('throughput.json'), defaults: read('defaults.json') };

const outDir = new URL('../public/og/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const FONT = 'Helvetica Neue, Helvetica, Arial, sans-serif';

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
  const state = { ...defaultState(data), hw: hwId, model: modelId };
  const view = computeView(state, data);
  if (!view.calc || view.price == null || view.model?.id !== modelId) return null;
  const c = view.calc;
  return renderOgCard({
    configLine: view.configLine,
    usageLine: view.usageLine,
    verdict: view.verdict.headline,
    subLine: view.verdict.sub,
    devicePriceUsd: view.price,
    dailySaving: c.dailySaving,
    breakevenDays: c.breakevenDays,
    maxYears: data.defaults.waterline_max_years,
    dataChecked: data.defaults.data_last_checked,
    fontFamily: FONT,
    figures: ogFigures({
      devicePriceUsd: view.price,
      cloudCostPerMonth: c.cloudCostPerMonth,
      localTokensPerSec: view.throughput?.tokensPerSec ?? null,
      measurement: view.throughput?.measurement ?? 'unknown',
      breakevenLabel: c.breakevenDays === null ? 'never' : fmtDuration(c.breakevenDays),
    }),
  });
}

function toPng(svg: string): Buffer {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH }, font: fontOpts });
  return r.render().asPng();
}

let n = 0;
const manifest: Record<string, string> = {};
for (const hw of data.hardware) {
  for (const m of data.models) {
    const svg = cardFor(hw.id, m.id);
    if (!svg) continue;
    const name = `${hw.id}--${m.id}.png`;
    writeFileSync(new URL(name, outDir), toPng(svg));
    manifest[`${hw.id}|${m.id}`] = `/og/${name}`;
    n++;
  }
}
// default card: the default state
const ds = defaultState(data);
const dv = computeView(ds, data);
const def = dv.model ? cardFor(ds.hw, dv.model.id) : null;
if (def) writeFileSync(new URL('default.png', outDir), toPng(def));
writeFileSync(new URL('manifest.json', outDir), JSON.stringify(manifest, null, 2));
console.log(`wrote ${n} OG cards${def ? ' + default.png' : ''} to public/og/ (${OG_WIDTH}×${OG_HEIGHT})`);
