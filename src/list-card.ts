/**
 * The share card for the pages that answer with a list rather than with one
 * pairing (1200×630): the leaderboard, the best buys, the head-to-head index and
 * the memory question. One row per entry, the same rows and the same figures the
 * page itself shows.
 *
 * Every value is passed in by the build from data/*.json. Nothing is computed,
 * rounded or worded differently from the page it belongs to.
 */
import { esc, fmtDuration, fmtGb, fmtTokens, fmtUsd } from './format';
import { bestByTier, bestUsageLevels, type Combo } from './best';
import {
  bandFit, computeView, fitsOf, fmtGb1, graphicsCards, priceWithScopeText, shortHardwareLabel, SIZE_BANDS,
  type BandFit,
} from './pagekit';
import { defaultState } from './state';
import {
  clampText, fitLines, flagshipMachines, hardwarePairs, modelPairs, wrapText,
  DEEP, DIM, EM, EM_BOLD, HAIR, INK, STEEL, VS_HEIGHT, VS_WIDTH, WATER,
} from './versus-card';
import type { Dataset } from './types';

export interface ListRow {
  /** the entry itself: a model name, or an amount of daily use */
  name: string;
  /** a quieter second line under the name */
  sub?: string;
  /** the middle column: what the entry costs you, in memory or in hardware */
  meta: string;
  /** 0 to 1, drawn as a bar in place of nothing where the ranking is a score */
  bar?: number;
  /** the fill for that bar, where one colour would say less than two */
  barFill?: string;
  /** the figure the list is ranked on */
  value: string;
  /** a quieter second line under that figure */
  valueSub?: string;
}

export interface ListCardInput {
  /** what kind of list this is, in small caps in the band */
  eyebrow: string;
  /** the page's own headline, in one line */
  headline: string;
  /** the small headings over the three columns */
  columns: { name: string; meta: string; value: string };
  rows: ListRow[];
  /** left edge of the middle column, so each card can give its longest text the room it needs */
  metaX: number;
  /** width the middle column may use; whatever is left over carries the bars */
  metaW: number;
  /** width reserved for the right-hand figure, which is set from its right edge */
  valueW: number;
  /** the assumptions the figures were computed on, as the page states them */
  note: string;
  dataChecked: string;
  fontFamily?: string;
}

/** A run of lines centred on `centerY`, so a two-line value sits level with a one-line label. */
function lines(xs: string[], x: number, centerY: number, size: number, attrs: string): string {
  const lh = size + 6;
  const first = centerY - ((xs.length - 1) * lh) / 2 + size * 0.34;
  return xs
    .map((line, n) => `<text x="${x}" y="${(first + n * lh).toFixed(1)}" font-size="${size}" ${attrs}>${esc(line)}</text>`)
    .join('\n');
}

export function listCardSvg(i: ListCardInput): string {
  const font = i.fontFamily ?? '"IBM Plex Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
  const bandH = 104;
  const panel = { x: 40, y: 190, w: VS_WIDTH - 80, h: 378 };
  const xName = 68;
  const right = panel.x + panel.w - 32;
  const valueLeft = right - i.valueW;
  const nameW = i.metaX - xName - 24;
  const metaW = Math.min(i.metaW, valueLeft - i.metaX - 24);
  // the bar, where there is one, takes what the middle column leaves
  const barX = i.metaX + metaW + 24;
  const barW = Math.max(0, valueLeft - barX - 24);
  const headingY = panel.y + 36;
  const rowsTop = panel.y + 60;
  const rowH = (panel.y + panel.h - 14 - rowsTop) / Math.max(i.rows.length, 1);

  // one size per column, the largest at which every row fits, so the list reads
  // as a table rather than as rows set at whatever size each one happened to allow
  const column = (get: (r: ListRow) => string | undefined, sizes: number[], w: number, maxLines: number) =>
    Math.min(...i.rows.map((r) => fitLines(get(r) ?? '', sizes, w, maxLines, EM_BOLD).size));
  // a name gets a second line only where nothing sits under it
  const nameLines = i.rows.some((r) => r.sub) ? 1 : 2;
  const nameSize = column((r) => r.name, [24, 22, 20], nameW, nameLines);
  const metaSize = column((r) => r.meta, [22, 20, 18], metaW, 2);
  const valueSize = column((r) => r.value, [26, 23, 20], i.valueW, 1);

  const headline = fitLines(i.headline, [34, 31, 28], VS_WIDTH - 112, 1, EM_BOLD);

  const heading = (x: number, s: string, anchor = '') =>
    `<text x="${x}" y="${headingY}" font-size="17" fill="${DIM}" letter-spacing="0.6" ${anchor}>${esc(clampText(s, 17, 260))}</text>`;

  const rows = i.rows
    .map((r, n) => {
      const top = rowsTop + n * rowH;
      const mid = top + rowH / 2;
      const rule = n ? `<line x1="${xName}" y1="${top.toFixed(1)}" x2="${right}" y2="${top.toFixed(1)}" stroke="${HAIR}" stroke-width="1"/>` : '';

      const name = wrapText(r.name, nameSize, nameW, nameLines, EM_BOLD);
      const nameAttrs = `font-weight="600" fill="${INK}" letter-spacing="-0.3"`;
      const nameBlock = r.sub
        ? `${lines(name, xName, mid - 11, nameSize, nameAttrs)}
${lines([clampText(r.sub, 17, nameW)], xName, mid + 16, 17, `fill="${DIM}"`)}`
        : lines(name, xName, mid, nameSize, nameAttrs);

      const metaBlock = lines(wrapText(r.meta, metaSize, metaW, 2, EM_BOLD), i.metaX, mid, metaSize, `font-weight="500" fill="${INK}"`);

      const bar =
        r.bar == null || barW <= 0
          ? ''
          : `<rect x="${barX}" y="${(mid - 9).toFixed(1)}" width="${barW}" height="18" rx="9" fill="#eef1f2"/>
<rect x="${barX}" y="${(mid - 9).toFixed(1)}" width="${(Math.min(Math.max(r.bar, 0), 1) * barW).toFixed(1)}" height="18" rx="9" fill="${r.barFill ?? WATER}"/>`;

      const value = wrapText(r.value, valueSize, i.valueW, 1, EM_BOLD);
      const valueAttrs = `font-weight="600" text-anchor="end" fill="${INK}" letter-spacing="-0.4" style="font-variant-numeric: tabular-nums"`;
      const valueBlock = r.valueSub
        ? `${lines(value, right, mid - 11, valueSize, valueAttrs)}
${lines([clampText(r.valueSub, 16, i.valueW + 40)], right, mid + 16, 16, `text-anchor="end" fill="${DIM}"`)}`
        : lines(value, right, mid, valueSize, valueAttrs);

      return `${rule}
${nameBlock}
${metaBlock}
${bar}
${valueBlock}`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${VS_WIDTH}" height="${VS_HEIGHT}" viewBox="0 0 ${VS_WIDTH} ${VS_HEIGHT}" font-family='${font}'>
<rect width="${VS_WIDTH}" height="${VS_HEIGHT}" fill="#f2f4f3"/>
<rect width="${VS_WIDTH}" height="${bandH}" fill="${DEEP}"/>
<text x="56" y="62" font-size="22" font-weight="600" fill="${STEEL}" letter-spacing="3">${esc(i.eyebrow.toUpperCase())}</text>
<text x="${VS_WIDTH - 56}" y="62" font-size="22" text-anchor="end" fill="${STEEL}">sunkcost.ai</text>
<text x="56" y="160" font-size="${headline.size}" font-weight="700" fill="${INK}" letter-spacing="-1">${esc(headline.lines[0])}</text>
<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="20" fill="#ffffff"/>
${heading(xName, i.columns.name)}
${heading(i.metaX, i.columns.meta)}
${heading(right, i.columns.value, 'text-anchor="end"')}
<line x1="${xName}" y1="${panel.y + 50}" x2="${right}" y2="${panel.y + 50}" stroke="${HAIR}" stroke-width="1"/>
${rows}
<text x="56" y="${VS_HEIGHT - 30}" font-size="19" fill="${DIM}">${esc(clampText(i.note, 19, 780, EM))}</text>
<text x="${VS_WIDTH - 56}" y="${VS_HEIGHT - 30}" font-size="19" text-anchor="end" fill="${DIM}">Data checked ${esc(i.dataChecked)}</text>
</svg>`;
}

/* ----------------------- the cards, from the data ----------------------- */

/** Where each card is written, and what the page asks for. One place, so the two agree. */
export const LEADERBOARD_CARD = '/og/leaderboard.png';
export const BEST_CARD = '/og/best.png';
export const COMPARE_CARD = '/og/compare.png';
export const MEMORY_CARD = '/og/how-much-memory.png';
export const GPU_CARD = '/og/best-gpu.png';

/** How many open models the leaderboard card lists under the best hosted one. */
const LEADERBOARD_ROWS = 5;

/**
 * The top of the leaderboard, with the best hosted model above it for scale:
 * the page's own point, which is the size of that gap.
 */
export function leaderboardCard(data: Dataset, fontFamily?: string): string {
  const max = data.defaults.frontier_scale_max ?? 70;
  // the same sort, the same de-duplication by display name, as the page's table
  const refs = [...(data.defaults.frontier_reference ?? [])].sort((a, b) => b.score - a.score);
  const scored = data.models
    .filter((m) => m.frontier_equivalent?.score != null)
    .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!);
  const seen = new Set<string>();
  const unique = scored.filter((m) => (seen.has(m.display_name) ? false : (seen.add(m.display_name), true)));

  const hosted: ListRow[] = refs[0]
    ? [{
        name: refs[0].name,
        meta: 'not downloadable',
        bar: refs[0].score / max,
        barFill: STEEL,
        value: String(refs[0].score),
      }]
    : [];
  const open: ListRow[] = unique.slice(0, LEADERBOARD_ROWS).map((m) => ({
    name: m.display_name,
    meta: fmtGb(m.weights_gb),
    bar: m.frontier_equivalent!.score! / max,
    value: String(m.frontier_equivalent!.score!),
  }));

  return listCardSvg({
    eyebrow: 'Open LLM leaderboard',
    headline: 'Every open model, measured against the frontier',
    columns: { name: 'Model', meta: 'Weights', value: 'Score' },
    rows: [...hosted, ...open],
    metaX: 520,
    metaW: 260,
    valueW: 72,
    note: `${unique.length} open models on the ${data.defaults.frontier_basis?.name ?? 'intelligence index'}`,
    dataChecked: data.defaults.data_last_checked,
    fontFamily,
  });
}

/** The quickest pay-back at a level of use, across every class: the top row of that level's table. */
export function quickestAt(data: Dataset, usage: number): (Combo & { tier: string }) | null {
  const picks = bestByTier(data, usage).flatMap((t) => t.picks.map((p) => ({ ...p, tier: t.label })));
  return picks.sort((a, b) => a.days - b.days || a.hw.price_usd! - b.hw.price_usd!)[0] ?? null;
}

/**
 * One row per level of daily use, each carrying that level's quickest pay-back —
 * which is the page's own answer, and the way it moves from years to months is
 * the whole argument the page makes.
 */
export function bestBuysCard(data: Dataset, fontFamily?: string): string {
  const d = data.defaults;
  const rows: ListRow[] = bestUsageLevels(data).map((l) => {
    const q = quickestAt(data, l.usage);
    return {
      name: `${fmtTokens(l.usage)} tokens a day`,
      sub: l.label,
      meta: q ? `${q.model.display_name} · ${shortHardwareLabel(q.hw)}` : 'nothing pays back at this usage',
      value: q ? fmtDuration(q.days) : 'never',
      valueSub: q ? q.tier : undefined,
    };
  });

  return listCardSvg({
    eyebrow: 'Best buys',
    headline: 'The quickest pay-back at each level of use',
    columns: { name: 'Daily use', meta: 'Model and machine', value: 'Pays back in' },
    rows,
    metaX: 424,
    metaW: 474,
    valueW: 196,
    note: `List price, ${d.usage.default_input_to_output_ratio}:1 input:output, ${Math.round(d.context.default_tokens / 1024)}k context, today’s API prices`,
    dataChecked: d.data_last_checked,
    fontFamily,
  });
}

/** How many machines the head-to-head card lists, most capacious first. */
const COMPARE_ROWS = 6;

/**
 * The machines the head-to-head pages are cut from, each with its price and how
 * many of the open models it holds: the left-hand column of the index's own
 * first table, in the order that table ranks it. A link to the index should
 * preview as the machines it compares, not as one machine's pay-back curve.
 */
export function compareIndexCard(data: Dataset, fontFamily?: string): string {
  const st = defaultState(data);
  const views = flagshipMachines(data).map((hw) => ({ hw, view: computeView({ ...st, hw: hw.id }, data) }));
  const machines = views
    .map(({ hw, view }) => ({ hw, fits: fitsOf(view).length }))
    .sort((a, b) => b.fits - a.fits || a.hw.price_usd! - b.hw.price_usd!);
  // the same denominator every machine page and the index itself count against
  const total = views[0]?.view.rows.length ?? 0;

  const rows: ListRow[] = machines.slice(0, COMPARE_ROWS).map(({ hw, fits }) => ({
    name: shortHardwareLabel(hw),
    meta: priceWithScopeText(hw),
    value: `${fits}`,
    valueSub: `of ${total}`,
  }));

  return listCardSvg({
    eyebrow: 'Head to head',
    headline: 'Every machine and model, compared in pairs',
    columns: { name: 'Machine', meta: 'Price', value: 'Models it runs' },
    rows,
    metaX: 648,
    metaW: 300,
    valueW: 120,
    note: `${machines.length} machines, ${hardwarePairs(data).length} machine pairs and ${modelPairs(data).length} model pairs`,
    dataChecked: data.defaults.data_last_checked,
    fontFamily,
  });
}

/**
 * The memory question, one row per size people search by: the hungriest model in
 * the band that a machine on this list can hold, what it needs with its cache,
 * and the cheapest machine that holds it. Where nothing holds anything in the
 * band, the row says so rather than naming a machine that cannot run it.
 */
export function memoryCard(data: Dataset, fontFamily?: string): string {
  const ctx = data.defaults.context.default_tokens;
  const kctx = `${Math.round(ctx / 1024)}k`;
  const fits = SIZE_BANDS.map((b) => bandFit(b, data, ctx)).filter((b): b is BandFit => b != null);

  const rows: ListRow[] = fits.map((b) => {
    // the hungriest the list can hold, which is the hungriest in the band wherever one holds it
    const pick = b.held ?? b.biggest;
    return {
      name: b.band.label,
      sub: `${pick.m.display_name} at ${pick.m.quantisation}`,
      meta: b.heldBy ? `${shortHardwareLabel(b.heldBy)} · ${fmtUsd(b.heldBy.price_usd)}` : 'nothing on this list holds it',
      value: fmtGb1(pick.need),
    };
  });

  return listCardSvg({
    eyebrow: 'Memory needed',
    headline: 'How much memory do you need to run a local LLM?',
    columns: { name: 'Model size', meta: 'Cheapest that holds it', value: 'Weights + cache' },
    rows,
    metaX: 420,
    metaW: 514,
    valueW: 170,
    note: `The hungriest model in each band, at ${kctx} context, at list price`,
    dataChecked: data.defaults.data_last_checked,
    fontFamily,
  });
}

/**
 * The graphics-card question, one row per card: what it costs on its own, and how
 * many of the current models fit in it. The page's own answer is the two right-hand
 * columns read together — what a dearer card buys is more of the list, and the
 * price climbs a great deal faster than the count does.
 */
export function gpuCard(data: Dataset, fontFamily?: string): string {
  const st = defaultState(data);
  const kctx = `${Math.round(st.ctx / 1024)}k`;
  const cards = graphicsCards(data);
  const current = data.models.filter((m) => m.generation !== 'legacy');

  // seven rows leave no room for a second line under each name, so the strongest
  // model each one runs is left to the page and the card answers the question the
  // page's own table is ordered by: how much of the list each card can hold
  const rows: ListRow[] = cards.map((hw) => ({
    name: shortHardwareLabel(hw),
    meta: priceWithScopeText(hw),
    value: String(fitsOf(computeView({ ...st, hw: hw.id }, data)).length),
  }));

  return listCardSvg({
    eyebrow: 'Graphics cards',
    headline: 'Which graphics card should you buy for local LLMs?',
    columns: { name: 'Card', meta: 'Price', value: `Models of ${current.length}` },
    rows,
    metaX: 560,
    metaW: 300,
    valueW: 90,
    note: `Models held at ${kctx} context, weights and cache together, at list price`,
    dataChecked: data.defaults.data_last_checked,
    fontFamily,
  });
}
