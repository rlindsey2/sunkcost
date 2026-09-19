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
import {
  appleChip, chipStepNames, generationNames, gpuPart, priceWithScopeText, runnersFor, sameSilicon,
  shortHardwareLabel, slug,
} from './pagekit';
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
 * A memory-tier pair names its machine once: "Mac mini M6", "16GB", "32GB". Both sides
 * are the same machine, so writing the name twice spends a search result's 60 characters
 * saying it again instead of saying the two sizes, which is what the reader typed. Null
 * for every other pair, which is every pair the flagship and card grids write.
 */
export function memoryTierNames(a: Hardware, b: Hardware): { machine: string; a: string; b: string } | null {
  if (a.family !== b.family || a.chip !== b.chip || (a.chip_variant ?? '') !== (b.chip_variant ?? '')) return null;
  if (a.unified_memory_gb === b.unified_memory_gb) return null;
  const label = shortHardwareLabel(a);
  const suffix = `, ${a.unified_memory_gb}GB`;
  if (!label.endsWith(suffix)) return null;
  return {
    machine: label.slice(0, -suffix.length),
    a: `${a.unified_memory_gb}GB`,
    b: `${b.unified_memory_gb}GB`,
  };
}

/**
 * The same machine with more memory: every pair of memory tiers on one configuration,
 * the smaller side first. "How much memory should I buy" is the question a buyer asks once they
 * have picked the box, and a tier is the one choice on a spec sheet that changes what a
 * machine can hold. Grouped by chip variant, so the two sides are the same silicon in
 * the same case and the memory is what the money bought; discontinued machines are left
 * out, because the question only arises while you can still choose.
 */
export function memoryTierPairs(data: Dataset): [Hardware, Hardware][] {
  const groups = new Map<string, Hardware[]>();
  for (const h of data.hardware) {
    if (h.price_usd == null || (h.generation ?? 'current') !== 'current') continue;
    const key = `${h.family}|${h.chip}|${h.chip_variant ?? ''}`;
    groups.set(key, [...(groups.get(key) ?? []), h]);
  }
  const out: [Hardware, Hardware][] = [];
  for (const g of [...groups.values()].filter((g) => g.length > 1)) {
    const xs = [...g].sort((a, b) => a.unified_memory_gb - b.unified_memory_gb);
    for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) out.push([xs[i], xs[j]]);
  }
  return out;
}

/**
 * Each box against the cheapest box of the same hardware, cheapest side first. Not a
 * grid: where every machine in the group runs the same models at the same speed, a grid
 * would write the same answer twenty-one times, and the only question a buyer has is what
 * the dearer box asks on top of the cheapest one that does the same work. Discontinued
 * and unpriced machines are left out, because a price is the whole comparison here.
 */
export function sameSiliconPairs(data: Dataset): [Hardware, Hardware][] {
  const groups = new Map<string, Hardware[]>();
  for (const h of data.hardware) {
    if (h.price_usd == null || (h.generation ?? 'current') !== 'current' || gpuPart(h) === '') continue;
    const key = `${h.family}|${gpuPart(h)}|${h.unified_memory_gb}|${h.memory_bandwidth_gbs}|${h.usable_memory_gb}`;
    groups.set(key, [...(groups.get(key) ?? []), h]);
  }
  const out: [Hardware, Hardware][] = [];
  for (const g of [...groups.values()].filter((g) => g.length > 1)) {
    const xs = [...g].sort((a, b) => a.price_usd! - b.price_usd! || a.id.localeCompare(b.id));
    for (const h of xs.slice(1)) if (sameSilicon(xs[0], h)) out.push([xs[0], h]);
  }
  return out;
}

/**
 * The cheapest configuration of a box against the cheapest one with the better chip in
 * it, cheaper side first. Every other rule here holds something equal: a memory tier
 * holds the silicon, a same-silicon pair holds the memory, a generation pair holds
 * both. The entry-level machine falls through all three, because what a maker cuts to
 * reach a headline price is the chip *and* the memory at once — a Framework Desktop at
 * $1,269 is a 385 with 32 GB where the $1,959 one is a 395 with 64 — and that is the
 * one comparison the buyer of a cheap box actually makes.
 *
 * One pair per step, between the cheapest machine on each chip: where a box is sold on
 * three chips this walks the steps in price order rather than writing a grid, because
 * the question is always about the next one up. Discontinued and unpriced machines are
 * left out, because this is a choice at a checkout and the price is the whole of it.
 */
export function chipStepPairs(data: Dataset): [Hardware, Hardware][] {
  const boxes = new Map<string, Hardware[]>();
  for (const h of data.hardware) {
    if (h.price_usd == null || (h.generation ?? 'current') !== 'current' || !h.chip_variant) continue;
    const key = `${h.family}|${h.chip}`;
    boxes.set(key, [...(boxes.get(key) ?? []), h]);
  }
  const out: [Hardware, Hardware][] = [];
  for (const box of boxes.values()) {
    const cheapest = new Map<string, Hardware>();
    for (const h of box) {
      const seen = cheapest.get(h.chip_variant!);
      if (!seen || h.price_usd! < seen.price_usd! || (h.price_usd === seen.price_usd && h.id < seen.id)) cheapest.set(h.chip_variant!, h);
    }
    const steps = [...cheapest.values()].sort((x, y) => x.price_usd! - y.price_usd! || x.id.localeCompare(y.id));
    for (let i = 0; i + 1 < steps.length; i++) if (chipStepNames(steps[i], steps[i + 1])) out.push([steps[i], steps[i + 1]]);
  }
  return out;
}

/**
 * Each discontinued machine against the one that replaced it, older side first. Thirteen
 * Macs on this list are no longer sold and appeared in no head-to-head at all, because
 * every other rule here takes current machines only: a flagship is the middle of a
 * family's current range, and a memory tier is a choice you can still make. But the
 * machine you already own is the one you are deciding whether to replace, and a used
 * one is the cheapest way onto this list, so "what would the newer chip change" is a
 * real question with an answer in the data. The successor is the newest machine still
 * sold with the same chip tier and the same memory in the same case; where its price is
 * not published there is no pay-back to compare, so there is no page.
 */
export function generationPairs(data: Dataset): [Hardware, Hardware][] {
  const out: [Hardware, Hardware][] = [];
  for (const old of data.hardware) {
    const newer = data.hardware
      .filter((h) => generationNames(old, h))
      .sort((x, y) => appleChip(y)!.gen - appleChip(x)!.gen || x.id.localeCompare(y.id));
    if (newer[0]) out.push([old, newer[0]]);
  }
  return out;
}

/**
 * Every machine pair that has a page, in the order the build writes them: the grid of
 * family flagships first, then the card grid, then the memory tiers of one machine, then
 * each box against the cheapest box of the same hardware, then each discontinued machine
 * against the one that replaced it, then each box's entry-level chip against the one
 * above it. Each
 * rule is appended after the ones before it, so a pair keeps the address it has always
 * had, and a pair is only ever written once, whichever way round the rules reach it.
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
  for (const [a, b] of memoryTierPairs(data)) add(a, b);
  for (const [a, b] of sameSiliconPairs(data)) add(a, b);
  for (const [a, b] of generationPairs(data)) add(a, b);
  for (const [a, b] of chipStepPairs(data)) add(a, b);
  return out;
}

/**
 * A machine's head-to-heads, split by the question each one answers. A page that lists
 * twelve of them in one line reads as a wall, and two of the twelve can read as the page
 * arguing with itself: the Mac Studio M5 Max, 128GB was set against "vs Mac Studio M5 Max,
 * 48GB", which spends the line saying the name the reader is already on. Grouped, the
 * memory pairs say only the size, and every other link arrives under the reason it exists.
 * The groups come back in the order a buyer asks them, the reader's own kind of machine
 * first, and a group is left out where the machine has no pair of that sort.
 */
export interface HeadToHeadGroup {
  /** the noun the paragraph puts after "Head to head with", e.g. "another computer" */
  lead: string;
  links: { href: string; label: string }[];
}

export function headToHeadGroups(
  self: Hardware,
  pairs: { href: string; other: Hardware }[],
): HeadToHeadGroup[] {
  const isCard = (h: Hardware) => h.price_scope === 'card_only';
  const selfIsCard = isCard(self);
  const computers: HeadToHeadGroup['links'] = [];
  const cards: HeadToHeadGroup['links'] = [];
  const tiers: { link: HeadToHeadGroup['links'][number]; gb: number }[] = [];
  const replaced: HeadToHeadGroup['links'] = [];
  const replacedBy: HeadToHeadGroup['links'] = [];
  const stepUp: HeadToHeadGroup['links'] = [];
  const stepDown: HeadToHeadGroup['links'] = [];
  for (const { href, other } of pairs) {
    const tier = memoryTierNames(self, other) ?? memoryTierNames(other, self);
    if (tier) {
      tiers.push({ link: { href, label: `${other.unified_memory_gb}GB` }, gb: other.unified_memory_gb });
      continue;
    }
    // the same box with a different chip in it says only the size too: the name at the
    // top of the page is the other side's name as well, and what a reader picks between
    // on the maker's own page is two sizes with two chips behind them
    if (chipStepNames(self, other)) {
      stepUp.push({ href, label: `${other.unified_memory_gb}GB` });
      continue;
    }
    if (chipStepNames(other, self)) {
      stepDown.push({ href, label: `${other.unified_memory_gb}GB` });
      continue;
    }
    const link = { href, label: shortHardwareLabel(other) };
    if (generationNames(other, self)) replaced.push(link);
    else if (generationNames(self, other)) replacedBy.push(link);
    else if (isCard(other)) cards.push(link);
    else computers.push(link);
  }
  const cardGroup = { lead: selfIsCard ? 'another card' : 'a graphics card', links: cards };
  const computerGroup = { lead: selfIsCard ? 'a complete computer' : 'another computer', links: computers };
  return [
    ...(selfIsCard ? [cardGroup, computerGroup] : [computerGroup, cardGroup]),
    { lead: 'the same machine at another memory size', links: tiers.sort((a, b) => a.gb - b.gb).map((t) => t.link) },
    { lead: 'the same box and the bigger chip', links: stepUp },
    { lead: 'the same box and the smaller chip', links: stepDown },
    { lead: 'the machine it replaced', links: replaced },
    { lead: 'the machine that replaced it', links: replacedBy },
  ].filter((g) => g.links.length > 0);
}

/**
 * How far apart in size two models may be and still be the same decision. Beyond it the
 * nearest current model in a family is not a swap at all: the only current DeepSeek here
 * is four times the size of the distils it followed, and nothing that holds one holds the
 * other.
 */
export const MODEL_GENERATION_SIZE_RATIO = 1.5;

/** Whether a model's parameters are all active, or only a fraction of them per token. */
const isMoe = (m: Model) => m.active_params_b != null && m.active_params_b < m.params_b;

/**
 * Each last-generation model against the current model of its own family nearest it in
 * size, older side first. The ladder below pairs a model with the next one down the
 * index, which is the choice you face once you know what your machine holds. This is the
 * other question people ask and the index never puts the two sides of it together,
 * because a year of work separates them on it: the model you are running now against the
 * one that came after it.
 *
 * Two conditions keep the pair a real swap. Both sides are the same shape, dense against
 * dense or mixture-of-experts against mixture-of-experts, because a 3B-active MoE and a
 * dense 30B are the same size on disk and nothing else alike. And neither may be more
 * than half again the size of the other, which is what stops a family whose current model
 * is in another weight class from making a page nobody's machine could act on.
 */
export function modelGenerationPairs(data: Dataset): [Model, Model][] {
  const ranked = rankedModels(data);
  const out: [Model, Model][] = [];
  for (const old of ranked) {
    if (old.generation !== 'legacy') continue;
    const now = ranked
      .filter((c) => c.family === old.family && (c.generation ?? 'current') === 'current' && isMoe(c) === isMoe(old))
      .sort(
        (x, y) =>
          Math.abs(x.params_b - old.params_b) - Math.abs(y.params_b - old.params_b) ||
          (y.frontier_equivalent?.score ?? 0) - (x.frontier_equivalent?.score ?? 0) ||
          x.id.localeCompare(y.id),
      )[0];
    if (!now) continue;
    if (Math.max(old.params_b, now.params_b) / Math.min(old.params_b, now.params_b) > MODEL_GENERATION_SIZE_RATIO) continue;
    out.push([old, now]);
  }
  return out;
}

/**
 * Every model pair that has a page, in the order the build writes them: each model
 * against the next one down the leaderboard, then each last-generation model against the
 * current one of its family nearest it in size. The ladder is cut first, so a pair both
 * rules reach keeps the address it has always had, and a pair is written once whichever
 * way round the rules reach it.
 */
export function modelPairs(data: Dataset): [Model, Model][] {
  const r = rankedModels(data);
  const out: [Model, Model][] = [];
  const seen = new Set<string>();
  const add = (a: Model, b: Model) => {
    if (seen.has(`${a.id}|${b.id}`) || seen.has(`${b.id}|${a.id}`)) return;
    seen.add(`${a.id}|${b.id}`);
    out.push([a, b]);
  };
  for (let i = 0; i + 1 < r.length; i++) add(r[i], r[i + 1]);
  for (const [a, b] of modelGenerationPairs(data)) add(a, b);
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
