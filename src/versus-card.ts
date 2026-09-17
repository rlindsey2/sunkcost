/**
 * The share card for a head-to-head page (1200×630): two columns of the same
 * figures the page shows, drawn as one picture so a link to a comparison
 * previews as that comparison rather than as the site's default card.
 *
 * Every value here is passed in by the build from data/*.json. Nothing is
 * computed, rounded or worded differently from the page it belongs to.
 */
import { esc, fmtDuration, fmtGb, fmtNum, fmtUsd } from './format';
import { clampText, EM, EM_BOLD, fitLines, fitsIn, fitOneLine, wrapText } from './text-fit';
import { computeView, hardwareLabel } from './compute';
import { defaultState } from './state';
import { priceWithScopeText, runnersFor, shortHardwareLabel, slug } from './pagekit';
import type { Dataset, Hardware, Model } from './types';

// the text fitting these cards do lives in text-fit.ts, so the share card can use it
// too without pulling this file's data helpers into the calculator's bundle
export { clampText, EM, EM_BOLD, fitLines, fitsIn, fitOneLine, wrapText };

export const VS_WIDTH = 1200;
export const VS_HEIGHT = 630;

export interface VersusRow {
  label: string;
  a: string;
  b: string;
}

export interface VersusCardInput {
  /** what kind of head-to-head this is, in small caps above the names */
  eyebrow: string;
  aTitle: string;
  bTitle: string;
  rows: VersusRow[];
  /** the assumptions the figures were computed on, as the page states them */
  note: string;
  dataChecked: string;
  fontFamily?: string;
}

/** One palette for every card the build draws, so a leaderboard card and a head-to-head match. */
export const INK = '#0e1720';
export const DIM = '#4f5e68';
export const DEEP = '#05121e';
export const HAIR = '#e2e7e9';
/** the band's own text, and the fill for a bar that stands for something you cannot download */
export const STEEL = '#9fb3c2';
/** the water in the site's own chart, and the fill for a bar that stands for an open model */
export const WATER = '#1f5479';

/** A run of lines centred on `centerY`, so a two-line value sits level with a one-line label. */
function lines(xs: string[], x: number, centerY: number, size: number, attrs: string): string {
  const lh = size + 6;
  const first = centerY - ((xs.length - 1) * lh) / 2 + size * 0.34;
  return xs
    .map((line, n) => `<text x="${x}" y="${(first + n * lh).toFixed(1)}" font-size="${size}" ${attrs}>${esc(line)}</text>`)
    .join('\n');
}

export function versusCardSvg(i: VersusCardInput): string {
  const font = i.fontFamily ?? '"IBM Plex Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
  const bandH = 104;
  const panel = { x: 40, y: 120, w: VS_WIDTH - 80, h: 448 };
  const xLabel = 68;
  const xA = 312;
  const colW = Math.floor((panel.x + panel.w - 24 - xA) / 2);
  const xB = xA + colW;
  const headTop = panel.y + 54;
  const rowsTop = panel.y + 128;
  const rowH = Math.floor((panel.y + panel.h - 16 - rowsTop) / Math.max(i.rows.length, 1));

  // narrower than the value columns, so a long name never runs into the "vs" badge,
  // and both names are set at whichever of the two sizes has to be smaller
  const headW = colW - 68;
  const headSize = Math.min(...[i.aTitle, i.bTitle].map((t) => fitLines(t, [28, 25, 22], headW, 2, EM_BOLD).size));
  const head = (x: number, title: string) =>
    wrapText(title, headSize, headW, 2, EM_BOLD)
      .map((line, n) => `<text x="${x}" y="${headTop + n * 34}" font-size="${headSize}" font-weight="700" fill="${INK}" letter-spacing="-0.4">${esc(line)}</text>`)
      .join('\n');

  const rows = i.rows
    .map((r, n) => {
      const top = rowsTop + n * rowH;
      const mid = top + rowH / 2;
      const rule = n ? `<line x1="${xLabel}" y1="${top}" x2="${panel.x + panel.w - 32}" y2="${top}" stroke="${HAIR}" stroke-width="1"/>` : '';
      const valW = colW - 24;
      const size = Math.min(...[r.a, r.b].map((v) => fitLines(v, [26, 23, 20], valW, 2, EM_BOLD).size));
      const value = (x: number, v: string) =>
        lines(wrapText(v, size, valW, 2, EM_BOLD), x, mid, size, `font-weight="500" fill="${INK}" style="font-variant-numeric: tabular-nums"`);
      return `${rule}
${lines(wrapText(r.label, 20, xA - xLabel - 24, 2), xLabel, mid, 20, `fill="${DIM}"`)}
${value(xA, r.a)}
${value(xB, r.b)}`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${VS_WIDTH}" height="${VS_HEIGHT}" viewBox="0 0 ${VS_WIDTH} ${VS_HEIGHT}" font-family='${font}'>
<rect width="${VS_WIDTH}" height="${VS_HEIGHT}" fill="#f2f4f3"/>
<rect width="${VS_WIDTH}" height="${bandH}" fill="${DEEP}"/>
<text x="56" y="62" font-size="22" font-weight="600" fill="${STEEL}" letter-spacing="3">${esc(i.eyebrow.toUpperCase())}</text>
<text x="${VS_WIDTH - 56}" y="62" font-size="22" text-anchor="end" fill="${STEEL}">sunkcost.ai</text>
<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="20" fill="#ffffff"/>
<line x1="${xB - 36}" y1="${panel.y + 24}" x2="${xB - 36}" y2="${panel.y + panel.h - 24}" stroke="${HAIR}" stroke-width="1"/>
${head(xA, i.aTitle)}
${head(xB, i.bTitle)}
<circle cx="${xB - 36}" cy="${headTop - 9}" r="21" fill="#ffffff"/>
<text x="${xB - 36}" y="${headTop}" font-size="23" font-weight="700" text-anchor="middle" fill="${STEEL}">vs</text>
${rows}
<text x="56" y="${VS_HEIGHT - 30}" font-size="19" fill="${DIM}">${esc(clampText(i.note, 19, 800))}</text>
<text x="${VS_WIDTH - 56}" y="${VS_HEIGHT - 30}" font-size="19" text-anchor="end" fill="${DIM}">Data checked ${esc(i.dataChecked)}</text>
</svg>`;
}

/* ------------------------- the two head-to-heads ------------------------- */

/** File name for a pair's card. Ids and labels are already slug-safe, so this is stable. */
export function versusCardPath(comparePath: string): string {
  return `/og/${slug(comparePath)}.png`;
}

export function hardwareComparePath(a: Hardware, b: Hardware): string {
  return `/compare/${slug(hardwareLabel(a))}-vs-${slug(hardwareLabel(b))}/`;
}

export function modelComparePath(a: Model, b: Model): string {
  return `/compare/${slug(a.id)}-vs-${slug(b.id)}/`;
}

/**
 * The machine most people cross-shop in each family: the middle of the range by
 * price. These are the pairs that get a head-to-head page, and the machine pages
 * link to the ones they appear in.
 */
export function flagshipMachines(data: Dataset): Hardware[] {
  return [...new Set(data.hardware.map((h) => h.family))]
    .map((fam) => {
      const inFam = data.hardware.filter(
        (h) => h.family === fam && h.price_usd != null && (h.generation ?? 'current') === 'current',
      );
      return inFam.sort((a, b) => a.price_usd! - b.price_usd!)[Math.floor(inFam.length / 2)];
    })
    .filter(Boolean) as Hardware[];
}

/** Scored models, strongest first, one per display name: the order the head-to-heads are cut from. */
export function rankedModels(data: Dataset): Model[] {
  return data.models
    .filter((m) => m.frontier_equivalent?.score != null)
    .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!)
    .filter((m, i, xs) => xs.findIndex((x) => x.display_name === m.display_name) === i);
}

/**
 * Every graphics card on the list, dearest first. A card is the one class of machine
 * bought as a part rather than as a computer, and the part is what people put against
 * another part, so every card gets a head-to-head with every other card and not only
 * with the middle of its own family.
 */
export function graphicsCards(data: Dataset): Hardware[] {
  return data.hardware
    .filter((h) => h.price_scope === 'card_only' && h.price_usd != null)
    .sort((a, b) => b.price_usd! - a.price_usd!);
}

/**
 * Every machine pair that has a page, in the order the build writes them: the grid of
 * family flagships first, then the card grid. The flagships come first so that a pair
 * both lists keeps the address it has always had, and a pair is only ever written once,
 * whichever way round the two rules reach it.
 */
export function hardwarePairs(data: Dataset): [Hardware, Hardware][] {
  const out: [Hardware, Hardware][] = [];
  const seen = new Set<string>();
  const add = (a: Hardware, b: Hardware) => {
    if (seen.has(`${a.id}|${b.id}`) || seen.has(`${b.id}|${a.id}`)) return;
    seen.add(`${a.id}|${b.id}`);
    out.push([a, b]);
  };
  const grid = (xs: Hardware[]) => {
    for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) add(xs[i], xs[j]);
  };
  grid(flagshipMachines(data));
  grid(graphicsCards(data));
  return out;
}

/** Every model pair that has a page: each model against the next one down the leaderboard. */
export function modelPairs(data: Dataset): [Model, Model][] {
  const r = rankedModels(data);
  const out: [Model, Model][] = [];
  for (let i = 0; i + 1 < r.length; i++) out.push([r[i], r[i + 1]]);
  return out;
}

/* ----------------------- the cards, from the data ----------------------- */

export function hardwareVersusCard(a: Hardware, b: Hardware, data: Dataset, fontFamily?: string): string {
  const s = defaultState(data);
  const view = (hw: Hardware) => computeView({ ...s, hw: hw.id }, data);
  const va = view(a);
  const vb = view(b);
  const fits = (v: ReturnType<typeof view>) => v.rows.filter((r) => r.fit.status === 'fits');
  const fa = fits(va);
  const fb = fits(vb);
  const best = (f: typeof fa) => (f[0] ? f[0].model.display_name : 'none of them');
  // the same figure as the page's Pay-back row, said as the card has room to say it
  const payback = (v: ReturnType<typeof view>) =>
    !v.calc ? '—' : v.calc.breakevenDays === null ? 'never' : fmtDuration(v.calc.breakevenDays);
  return versusCardSvg({
    eyebrow: 'Head to head',
    aTitle: shortHardwareLabel(a),
    bTitle: shortHardwareLabel(b),
    rows: [
      // a graphics card is priced without the PC around it, and a card that does
      // not say so previews $18,000 against $1,499 as if both bought a computer
      { label: 'Price', a: priceWithScopeText(a), b: priceWithScopeText(b) },
      { label: 'Memory', a: `${a.unified_memory_gb} GB`, b: `${b.unified_memory_gb} GB` },
      { label: 'Models that fit', a: `${fa.length} of ${va.rows.length}`, b: `${fb.length} of ${vb.rows.length}` },
      { label: 'Best model it runs', a: best(fa), b: best(fb) },
      { label: 'Pay-back', a: payback(va), b: payback(vb) },
    ],
    note: `${va.usageLine}, ${Math.round(s.ctx / 1024)}k context`,
    dataChecked: data.defaults.data_last_checked,
    fontFamily,
  });
}

export function modelVersusCard(a: Model, b: Model, data: Dataset, fontFamily?: string): string {
  const score = (m: Model) => (m.frontier_equivalent?.score != null ? String(m.frontier_equivalent.score) : 'not placed');
  const ctxOf = (m: Model) => (m.max_context_tokens ? `${Math.round(m.max_context_tokens / 1024)}k` : 'unknown');
  // the same list, in the same order, as the "cheapest machine that runs it" row on the page
  const cheapest = (m: Model) => {
    const r = runnersFor(m, data)[0];
    return r ? `${shortHardwareLabel(r.hw)}, ${priceWithScopeText(r.hw)}` : 'none listed';
  };
  const params = (m: Model) =>
    `${fmtNum(m.params_b, 1)}B${m.active_params_b && m.active_params_b < m.params_b ? ` (${fmtNum(m.active_params_b, 1)}B active)` : ''}`;
  return versusCardSvg({
    eyebrow: 'Model head to head',
    aTitle: a.display_name,
    bTitle: b.display_name,
    rows: [
      { label: 'Intelligence index', a: score(a), b: score(b) },
      { label: 'Parameters', a: params(a), b: params(b) },
      { label: 'Weights', a: fmtGb(a.weights_gb), b: fmtGb(b.weights_gb) },
      { label: 'Max context', a: ctxOf(a), b: ctxOf(b) },
      { label: 'Cheapest machine that runs it', a: cheapest(a), b: cheapest(b) },
    ],
    note: `Index scores from the ${data.defaults.frontier_basis?.name ?? 'intelligence index'}`,
    dataChecked: data.defaults.data_last_checked,
    fontFamily,
  });
}
