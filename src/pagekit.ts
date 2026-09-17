/**
 * Shared pieces for the statically generated pages (leaderboard, per model,
 * per machine, comparisons). Pure string builders with no DOM, so the build
 * script and the app can both use them.
 *
 * Every page is real HTML with its content in the markup: these exist to be
 * read by someone arriving from a search, and to be indexable, so nothing here
 * may depend on JavaScript running.
 */
import { computeView, hardwareLabel, modelLabel, type ModelRow, type View } from './compute';
import { footprintGb, kvCacheGb } from './fit';
import { fmtDuration, fmtGb, fmtNum, fmtTokens, fmtUsd, esc } from './format';
import { defaultState, serializeState, type State } from './state';
import type { Dataset, Hardware, Model } from './types';
import { CAPABILITY_KEYS, CAPABILITY_LABELS } from './types';

export const CAP_SHORT: Record<string, string> = {
  summarisation: 'Summarising',
  translation: 'Translation',
  everyday_coding: 'Everyday coding',
  complex_reasoning: 'Reasoning & maths',
  agentic: 'Agentic work',
};

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Search results cut a title at about 60 characters and a description at about
 * 155, so anything past that is written for nobody. Rather than truncate a
 * sentence mid-word, every title and description is written as a few complete
 * variants, richest first, and the first one that fits is used.
 */
export const TITLE_MAX = 60;
export const DESC_MAX = 155;

export function fit(variants: string[], max: number): string {
  return variants.find((v) => v.length <= max) ?? variants[variants.length - 1];
}

const BRAND = ' · Sunk Cost';

/**
 * The fullest title that fits, then the brand on the end if there is still room.
 * Saying more about the page beats saying the name of the site, which is in the
 * result as a domain either way.
 */
export function titleOf(variants: string[]): string {
  const core = fit(variants, TITLE_MAX);
  return core.length + BRAND.length <= TITLE_MAX ? core + BRAND : core;
}

export function descOf(variants: string[]): string {
  return fit(variants, DESC_MAX);
}

/**
 * A compact machine name for titles and descriptions, where a long one gets cut
 * before the reader reaches the point. Vendor and platform prefixes are dropped
 * where the chip already names the product, and kept where the family is the
 * product. The full name stays on the page itself.
 */
const CHIP_NAMES_THE_PRODUCT = new Set(['NVIDIA', 'AMD', 'Strix Halo']);

export function shortHardwareLabel(h: Hardware): string {
  if (h.family === 'DGX Spark') return `${h.family}, ${h.unified_memory_gb}GB`;
  if (CHIP_NAMES_THE_PRODUCT.has(h.family)) return `${h.chip}, ${h.unified_memory_gb}GB`;
  return hardwareLabel(h);
}

/** "Pays back in two years" as a clause inside a sentence. */
export function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * Apple sells the Macs and the graphics cards carry their maker's name in the
 * family. A Strix Halo box is somebody else's machine built around an AMD chip,
 * and that somebody leads the chip field, which is where the box is named.
 */
const BRAND_BY_FAMILY: Record<string, string> = {
  'Mac mini': 'Apple',
  'Mac Studio': 'Apple',
  'MacBook Air': 'Apple',
  'MacBook Pro': 'Apple',
  'DGX Spark': 'NVIDIA',
  NVIDIA: 'NVIDIA',
  AMD: 'AMD',
};

export function brandOf(hw: Hardware): string {
  return BRAND_BY_FAMILY[hw.family] ?? hw.chip.split(' ')[0];
}

/**
 * The two faces that paint first: body text and the figures in the tables. Both
 * live on this origin, declared in page.css, so the browser could find them by
 * parsing that stylesheet. Preloading starts the download alongside the CSS
 * instead of after it. The rest of the faces (the other mono weights, the
 * italic, the latin-ext subsets) are left to the stylesheet, because preloading
 * a file the page may never need only takes bandwidth from the ones it does.
 *
 * A change to either filename has to be made here as well, and the build checks
 * that both files exist.
 */
export const FONT_PRELOAD = {
  sans: '/fonts/instrument-sans-v4-400-700-latin.woff2',
  mono: '/fonts/ibm-plex-mono-v20-400-latin.woff2',
} as const;

export type LdNode = Record<string, unknown>;

/**
 * JSON-LD, escaped so that nothing inside a machine or model name can close the
 * script tag early. This is the same content the page already shows, written so
 * a search engine can read the trail a page sits in and what it is about.
 *
 * Deliberately no Offer: this site does not sell anything. The prices here are
 * list prices read from the maker's own page on a stated date, and marking them
 * up as an offer would claim you can buy them from sunkcost.ai.
 */
export function jsonLd(graph: LdNode[]): string {
  const doc = { '@context': 'https://schema.org', '@graph': graph };
  return `<script type="application/ld+json">${JSON.stringify(doc).replace(/</g, '\\u003c')}</script>`;
}

/**
 * The machine a hardware page is about. Only figures that are somebody's
 * published specification go in: a stand-in or an estimate needs the sentence
 * next to it that says so, and a machine-readable property has nowhere to put
 * that sentence. Those figures stay on the page, with their caveat.
 */
export function hardwareProduct(hw: Hardware, url: string): LdNode {
  const props: LdNode[] = [{ '@type': 'PropertyValue', name: 'Memory', value: `${hw.unified_memory_gb} GB` }];
  if (hw.memory_bandwidth_gbs)
    props.push({ '@type': 'PropertyValue', name: 'Memory bandwidth', value: `${hw.memory_bandwidth_gbs} GB/s` });
  if (hw.load_watts != null && hw.load_watts_status === 'published')
    props.push({ '@type': 'PropertyValue', name: 'Rated power under load', value: `${hw.load_watts} W` });
  // the maker's name for the machine, not the site's: "Framework Desktop, 128GB"
  // rather than "Strix Halo Framework Desktop, 128GB", with the site's own label
  // kept alongside it so both match.
  const name = shortHardwareLabel(hw);
  const full = hardwareLabel(hw);
  return {
    '@type': 'Product',
    '@id': `${url}#product`,
    name,
    ...(full === name ? {} : { alternateName: full }),
    brand: { '@type': 'Brand', name: brandOf(hw) },
    category: 'Computer hardware',
    url,
    additionalProperty: props,
  };
}

export interface PageChrome {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string | null;
  crumbs: { href: string; label: string }[];
  /** The thing the page is about, as a schema.org node with an `@id`. */
  about?: LdNode;
}

export function pageGraph(c: PageChrome, data: Dataset): LdNode[] {
  const site = data.defaults.site_url.replace(/\/$/, '');
  const url = site + c.canonical;
  const website: LdNode = {
    '@type': 'WebSite',
    '@id': `${site}/#website`,
    url: `${site}/`,
    name: 'Sunk Cost',
    description: 'Works out whether buying a machine to run open models at home pays back against API prices.',
  };
  const breadcrumb: LdNode = {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: c.crumbs.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.label,
      // a step with no page of its own carries a name and nothing else
      ...(b.href === '#' ? {} : { item: b.href.startsWith('/') ? site + b.href : b.href }),
    })),
  };
  const page: LdNode = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: c.title,
    description: c.description,
    isPartOf: { '@id': website['@id'] },
    breadcrumb: { '@id': breadcrumb['@id'] },
    ...(c.ogImage ? { primaryImageOfPage: { '@type': 'ImageObject', url: site + c.ogImage, width: 1200, height: 630 } } : {}),
    ...(c.about ? { about: { '@id': c.about['@id'] } } : {}),
  };
  return [website, page, breadcrumb, ...(c.about ? [c.about] : [])];
}

export function pageShell(c: PageChrome, body: string, data: Dataset): string {
  const site = data.defaults.site_url.replace(/\/$/, '');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.description)}" />
<meta name="theme-color" content="#f1f3f2" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0b1014" media="(prefers-color-scheme: dark)" />
<link rel="canonical" href="${esc(site + c.canonical)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Sunk Cost" />
<meta property="og:title" content="${esc(c.title)}" />
<meta property="og:description" content="${esc(c.description)}" />
${c.ogImage ? `<meta property="og:image" content="${esc(site + c.ogImage)}" />\n<meta property="og:image:width" content="1200" />\n<meta property="og:image:height" content="630" />\n<meta name="twitter:card" content="summary_large_image" />` : '<meta name="twitter:card" content="summary" />'}
<meta name="twitter:title" content="${esc(c.title)}" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="preload" href="${FONT_PRELOAD.sans}" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="${FONT_PRELOAD.mono}" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="/page.css" />
${jsonLd(pageGraph(c, data))}
</head>
<body class="doc">
<header class="topbar">
  <a class="topbar-brand" href="/">
    <span class="mark" aria-hidden="true"></span>
    <span class="wordmark">Sunk Cost</span>
    <span class="domain">sunkcost.ai</span>
  </a>
  <nav class="topbar-line" aria-label="Breadcrumb">
    ${c.crumbs
      .map(
        (b, i) =>
          `${i ? '<span class="sep">/</span>' : ''}${
            b.href === '#' ? `<span class="here">${esc(b.label)}</span>` : `<a href="${esc(b.href)}">${esc(b.label)}</a>`
          }`,
      )
      .join('')}
  </nav>
  <span class="stamp">Data checked ${esc(data.defaults.data_last_checked)}</span>
</header>
<main class="doc-main">
${body}
</main>
<footer class="doc-foot">
  <p><a href="/">Run the numbers on your own configuration</a> · <a href="/leaderboard/">All models against the frontier</a> · <a href="/best/">Best buys by usage</a> · <a href="/how-much-memory/">How much memory you need</a></p>
</footer>
</body>
</html>
`;
}

export function calcLink(state: Partial<State>, data: Dataset): string {
  return `/?${serializeState({ ...defaultState(data), ...state })}`;
}

export function dotRow(m: Model): string {
  return `<span class="dots" role="img" aria-label="${CAPABILITY_KEYS.map((k) => `${CAP_SHORT[k]}: ${m.capabilities[k]}`).join(', ')}">${CAPABILITY_KEYS.map(
    (k) => `<i class="dot dot-${m.capabilities[k]}" title="${esc(CAPABILITY_LABELS[k].long)}: ${m.capabilities[k]}"></i>`,
  ).join('')}</span>`;
}

export function tierScale(m: Model, data: Dataset): string {
  const tier = m.frontier_equivalent?.tier ?? null;
  const bars = data.defaults.frontier_tiers
    .map((t) => `<i class="${tier != null && t.tier <= tier ? 'on' : ''}"></i>`)
    .join('');
  return `<span class="scale${tier == null ? ' unplaced' : ''}" aria-hidden="true">${bars}</span>`;
}

export function tierName(m: Model, data: Dataset): string {
  const tier = m.frontier_equivalent?.tier;
  return tier == null ? 'not yet placed' : data.defaults.frontier_tiers[tier].label;
}

/**
 * The same name for a table cell that sits beside the scale. A tier label is
 * one word — "Haiku-class" — and a column narrow enough breaks it at its own
 * hyphen, which reads as a typo. A one-word label holds its line here; a label
 * that is a phrase still wraps between its words, and the cell wraps between
 * the scale and the label either way.
 */
export function tierLabel(m: Model, data: Dataset): string {
  const name = tierName(m, data);
  return name.includes(' ') ? esc(name) : `<span class="nobreak">${esc(name)}</span>`;
}

/** The cheapest machine each family can run this model on, with the verdict at default usage. */
export interface Runner {
  hw: Hardware;
  view: View;
  fits: boolean;
}

/**
 * The machines every "cheapest machine that runs it" on the site is chosen
 * from: the ones with a published price that are still sold. A discontinued
 * machine is not an answer to what to buy, and one with no price cannot be
 * weighed against an API bill.
 */
export function machinesConsidered(data: Dataset): Hardware[] {
  return data.hardware.filter((h) => h.price_usd != null && (h.generation ?? 'current') === 'current');
}

export function runnersFor(m: Model, data: Dataset, opts: { ctx?: number } = {}): Runner[] {
  const ctx = opts.ctx ?? data.defaults.context.default_tokens;
  return machinesConsidered(data)
    .map((hw) => {
      const view = computeView({ ...defaultState(data), hw: hw.id, model: m.id, ctx }, data);
      return { hw, view, fits: view.model?.id === m.id };
    })
    .filter((r) => r.fits)
    .sort((a, b) => a.hw.price_usd! - b.hw.price_usd!);
}

export function cheapestPerFamily(runners: Runner[]): Runner[] {
  const seen = new Set<string>();
  const out: Runner[] = [];
  for (const r of runners) {
    if (seen.has(r.hw.family)) continue;
    seen.add(r.hw.family);
    out.push(r);
  }
  return out;
}

export function verdictLine(view: View): string {
  if (!view.calc) return 'Not enough data to compute a pay-back.';
  return view.calc.breakevenDays === null ? 'Never pays back' : `Pays back in ${fmtDuration(view.calc.breakevenDays)}`;
}

/**
 * Someone reading about one machine is nearly always choosing between several.
 * The rest of its range is the first comparison they make, and what else that
 * money could go on is the second.
 */

/** Every other configuration sold under the same name, current generation first, then cheapest first. */
export function familyRange(hw: Hardware, data: Dataset): Hardware[] {
  const rank = (h: Hardware) => ((h.generation ?? 'current') === 'current' ? 0 : 1);
  return data.hardware
    .filter((h) => h.family === hw.family && h.id !== hw.id)
    .sort((a, b) => rank(a) - rank(b) || (a.price_usd ?? Infinity) - (b.price_usd ?? Infinity));
}

/**
 * The machine closest in price from each other family. One per family rather
 * than the five nearest overall, because five Mac Studios within $300 of each
 * other answer nobody's question. Nearest in price decides who is in the list;
 * the list itself comes back cheapest first, which is how a column reads.
 */
export function priceRivals(hw: Hardware, data: Dataset, limit = 5): Hardware[] {
  if (hw.price_usd == null) return [];
  const gap = (h: Hardware) => Math.abs(h.price_usd! - hw.price_usd!);
  const best = new Map<string, Hardware>();
  for (const h of data.hardware) {
    if (h.family === hw.family || h.price_usd == null || (h.generation ?? 'current') !== 'current') continue;
    const held = best.get(h.family);
    if (!held || gap(h) < gap(held)) best.set(h.family, h);
  }
  // chosen by how close the price is, then shown cheapest first so the column reads in order
  return [...best.values()]
    .sort((a, b) => gap(a) - gap(b))
    .slice(0, limit)
    .sort((a, b) => a.price_usd! - b.price_usd!);
}

/** How to introduce the rest of a range: a Mac mini is a product line, a Strix Halo box is a chip. */
export function familyHeading(hw: Hardware): string {
  if (hw.family === 'NVIDIA' || hw.family === 'AMD') return `Other ${hw.family} cards`;
  if (hw.family === 'Strix Halo') return 'Other Strix Halo machines';
  return `The rest of the ${hw.family} range`;
}

/** The same model at another quantisation: a different download, a different memory bill. */
export function otherQuantisations(m: Model, data: Dataset): Model[] {
  return data.models.filter((x) => x.display_name === m.display_name && x.id !== m.id);
}

/**
 * The memory question: weights plus cache, and what holds the total.
 */

/**
 * A decimal where there is one. A page that adds 42.5 and 10.7 together cannot
 * round each figure to a whole gigabyte first, or the column stops adding up in
 * front of the reader; a machine with 24 GB does not need the nought either.
 */
export function fmtGb1(gb: number | null | undefined): string {
  if (gb == null || !Number.isFinite(gb)) return '—';
  return `${gb.toFixed(1).replace(/\.0$/, '')} GB`;
}

/**
 * The cheapest machine whose usable memory holds this much, on the same terms as
 * the rest of the site: current generation, price published. Cheapest rather than
 * smallest, because the machine with the least memory that clears the bar is
 * often not the one you would buy.
 */
export function cheapestThatHolds(needGb: number | null | undefined, data: Dataset): Hardware | null {
  if (needGb == null || !Number.isFinite(needGb)) return null;
  return (
    data.hardware
      .filter(
        (h) =>
          h.price_usd != null &&
          (h.generation ?? 'current') === 'current' &&
          h.usable_memory_gb != null &&
          h.usable_memory_gb >= needGb,
      )
      .sort((a, b) => a.price_usd! - b.price_usd!)[0] ?? null
  );
}

/** "42.5 GB", or "4.9 GB to 42.5 GB" when the two ends differ. */
export function gbRange(values: number[]): string {
  const real = values.filter((v) => Number.isFinite(v));
  if (!real.length) return '—';
  const lo = Math.min(...real);
  const hi = Math.max(...real);
  return fmtGb1(lo) === fmtGb1(hi) ? fmtGb1(lo) : `${fmtGb1(lo)} to ${fmtGb1(hi)}`;
}

export function median(values: number[]): number | null {
  const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
}

/**
 * The parameter bands people search by. The boundaries are editorial, the numbers
 * inside each one are not: every figure on the page is computed from the models
 * that land in the band.
 */
export interface SizeBand {
  question: string;
  /** the same band in two or three words, for a column that has no room for the question */
  label: string;
  min: number;
  max: number;
}

export const SIZE_BANDS: SizeBand[] = [
  { question: 'How much memory for a 7B or 8B model?', label: '7B and 8B', min: 0, max: 10 },
  { question: 'How much memory for a 14B to 32B model?', label: '14B to 32B', min: 10, max: 40 },
  { question: 'How much memory for a 70B model?', label: '70B', min: 40, max: 100 },
  { question: 'How much memory for a 100B model or larger?', label: '100B and larger', min: 100, max: Infinity },
];

export function modelsInBand(band: SizeBand, data: Dataset): Model[] {
  return data.models
    .filter((m) => m.params_b >= band.min && m.params_b < band.max)
    .sort((a, b) => (a.weights_gb ?? 0) - (b.weights_gb ?? 0));
}

/** A model in a band and what it asks of a machine: weights plus cache, held at once. */
export interface BandModel {
  m: Model;
  need: number;
}

/**
 * A size band worked out: every model in it ordered by what it needs, the
 * hungriest, and the hungriest the list can actually hold. The page and its
 * share card both read this, so the picture cannot name a model or a machine
 * the page does not.
 */
export interface BandFit {
  band: SizeBand;
  /** every model in the band with a known footprint, hungriest last */
  sized: BandModel[];
  /** the one that asks the most */
  biggest: BandModel;
  /** the cheapest machine that holds the hungriest, where one does */
  holder: Hardware | null;
  /** the hungriest this list can hold, which is the hungriest itself where that fits */
  held: BandModel | null;
  heldBy: Hardware | null;
}

export function bandFit(band: SizeBand, data: Dataset, contextTokens: number): BandFit | null {
  const sized = modelsInBand(band, data)
    .map((m) => ({ m, need: footprintGb(m, contextTokens) }))
    .filter((x): x is BandModel => x.need != null)
    .sort((a, b) => a.need - b.need);
  if (!sized.length) return null;
  const biggest = sized[sized.length - 1];
  const held = [...sized].reverse().find((x) => cheapestThatHolds(x.need, data) != null) ?? null;
  return {
    band,
    sized,
    biggest,
    holder: cheapestThatHolds(biggest.need, data),
    held,
    heldBy: held ? cheapestThatHolds(held.need, data) : null,
  };
}

/**
 * The cache arithmetic written out for one model, so the figure in the table has
 * its working next to it. Only for the plain multi-head case: an architecture
 * that caches a compressed vector, or caches different lengths per layer, does
 * not reduce to one line of multiplication.
 */
export function kvWorking(m: Model, contextTokens: number): string | null {
  const a = m.architecture;
  if (!a || a.n_layers == null || a.n_kv_heads == null || a.head_dim == null) return null;
  const bytes = a.kv_bytes_per_value ?? 2;
  const perLayer = 2 * a.n_kv_heads * a.head_dim * bytes;
  const perToken = perLayer * a.n_layers;
  const total = (perToken * contextTokens) / 1e9;
  // If this line of multiplication does not reproduce the figure the site uses,
  // the model caches something else and the working would be a lie.
  const actual = kvCacheGb(m, contextTokens);
  if (actual == null || Math.abs(actual - total) > 0.01) return null;
  const n = (v: number) => v.toLocaleString('en-US');
  return `2 (a key and a value) × ${a.n_kv_heads} key-value heads × ${a.head_dim} numbers per head × ${bytes} bytes = ${n(perLayer)} bytes per token, per layer. Over ${a.n_layers} layers that is ${n(perToken)} bytes for every token in the window. Fill ${n(contextTokens)} tokens of context and the cache is ${fmtGb1(total)}.`;
}

export { computeView, hardwareLabel, modelLabel, fmtDuration, fmtGb, fmtNum, fmtTokens, fmtUsd, esc };

/* --------------------- machine head-to-heads --------------------- */

/**
 * A head-to-head is read as a buying decision, so every figure on one has to
 * survive being set beside its opposite number. Three of them did not: a card
 * priced without the PC around it sat next to a complete computer's price, an
 * estimated speed sat next to another estimated speed with neither said to be
 * one, and the two speeds were for *different* models, because each column
 * took the strongest model its own machine could hold. These builders exist so
 * that each figure carries what it needs to be compared honestly.
 */

/** The models a machine holds, strongest first, in the site's own order. */
export function fitsOf(view: View): ModelRow[] {
  return view.rows.filter((r) => r.fit.status === 'fits');
}

/** The strongest model both machines hold, and each one's row for it. */
export function strongestShared(va: View, vb: View): { model: Model; a: ModelRow; b: ModelRow } | null {
  const inB = new Map(fitsOf(vb).map((r) => [r.model.id, r]));
  for (const r of fitsOf(va)) {
    const b = inB.get(r.model.id);
    if (b) return { model: r.model, a: r, b };
  }
  return null;
}

/** The models the first machine holds and the second does not, strongest first. */
export function runsOnlyOn(va: View, vb: View): Model[] {
  const inB = new Set(fitsOf(vb).map((r) => r.model.id));
  return fitsOf(va).filter((r) => !inB.has(r.model.id)).map((r) => r.model);
}

/** A price, with the note that a graphics card is priced without the PC around it. */
export function priceWithScope(hw: Hardware): string {
  if (hw.price_usd == null) return '<span class="dim">not published</span>';
  return `${fmtUsd(hw.price_usd)}${hw.price_scope === 'card_only' ? '<span class="c-quant">card only</span>' : ''}`;
}

/**
 * The same price where there is no markup to hang the scope on: a description
 * a search engine prints, or a share card drawn as one picture. A graphics
 * card's price buys the card and nothing to put it in, and $1,299 beside a
 * machine name reads as a whole computer unless the line says otherwise.
 */
export function priceWithScopeText(hw: Hardware): string {
  if (hw.price_usd == null) return 'not published';
  return `${fmtUsd(hw.price_usd)}${hw.price_scope === 'card_only' ? ', card only' : ''}`;
}

/**
 * A speed as the page prints it. Anything said about two speeds is worked out
 * from these rather than from the full precision behind them, so that a reader
 * dividing one figure on the page by another gets the third figure on the page.
 */
export function shownTps(row: ModelRow | null | undefined): number | null {
  const tps = row?.throughput.tokensPerSec;
  if (tps == null) return null;
  return tps < 10 ? Math.round(tps * 10) / 10 : Math.round(tps);
}

/** A speed, always with how it was arrived at, the way every other page shows one. */
export function speedWithBasis(row: ModelRow | null | undefined): string {
  const tps = shownTps(row);
  if (tps == null) return '<span class="dim">unknown</span>';
  return `${fmtNum(tps, tps < 10 ? 1 : 0)} tok/s <span class="dim">${esc(row!.throughput.measurement)}</span>`;
}

/** How a pair of speeds was arrived at, as a clause to hang off a sentence. */
function basisClause(a: ModelRow, b: ModelRow, la: string, lb: string): string {
  const ma = a.throughput.measurement;
  const mb = b.throughput.measurement;
  if (ma === 'estimated' && mb === 'estimated') return ', both estimated from memory bandwidth';
  if (ma === 'measured' && mb === 'measured') return ', both measured';
  const measured = ma === 'measured' ? la : lb;
  return `, ${measured}'s measured and the other estimated from memory bandwidth`;
}

/**
 * The answer, in the first paragraph: what each one runs, what it costs, which
 * is quicker on a model they both hold, and whether either ever pays for
 * itself. Every figure is one the table underneath shows.
 */
export function machineVerdict(a: Hardware, b: Hardware, va: View, vb: View, data: Dataset): string {
  const la = shortHardwareLabel(a);
  const lb = shortHardwareLabel(b);
  const fa = fitsOf(va);
  const fb = fitsOf(vb);
  const out: string[] = [];

  if (fa.length === fb.length) {
    out.push(`Both hold ${fa.length} of the ${va.rows.length} open models here.`);
  } else {
    const [more, mc, less, lc] = fa.length > fb.length ? [la, fa.length, lb, fb.length] : [lb, fb.length, la, fa.length];
    out.push(`The ${more} holds ${mc} of the ${va.rows.length} open models here, and the ${less} holds ${lc}.`);
  }

  if (a.price_usd != null && b.price_usd != null) {
    const gap = Math.abs(a.price_usd - b.price_usd);
    const cards = [a, b].filter((h) => h.price_scope === 'card_only');
    // one side a bare card and the other a whole computer is not a like-for-like price
    const caveat = cards.length === 1
      ? `, though the ${shortHardwareLabel(cards[0])} is priced as the card alone, without the PC around it`
      : cards.length === 2
        ? ', both priced as the card alone, without the PC around either'
        : '';
    out.push(gap === 0
      ? `They cost the same${caveat}.`
      : `The ${a.price_usd < b.price_usd ? la : lb} costs ${fmtUsd(gap, { cents: false })} less${caveat}.`);
  }

  const shared = strongestShared(va, vb);
  const ta = shownTps(shared?.a);
  const tb = shownTps(shared?.b);
  if (shared && ta != null && tb != null && ta > 0 && tb > 0) {
    const hi = Math.max(ta, tb);
    const lo = Math.min(ta, tb);
    const num = (t: number) => fmtNum(t, t < 10 ? 1 : 0);
    const basis = basisClause(shared.a, shared.b, la, lb);
    const both = `On ${shared.model.display_name}, the strongest model both hold,`;
    out.push(hi / lo < 1.05
      ? `${both} they run at much the same speed: ${num(ta)} and ${num(tb)} tok/s${basis}.`
      : `${both} the ${ta > tb ? la : lb} is about ${fmtNum(hi / lo, 1)}× faster: ${num(hi)} tok/s against ${num(lo)}${basis}.`);
  } else if (!shared) {
    out.push('No model on this list fits both machines, so there is nothing to time them on side by side.');
  }

  const usage = fmtTokens(defaultState(data).usage);
  const da = va.calc?.breakevenDays ?? null;
  const db = vb.calc?.breakevenDays ?? null;
  // each column's pay-back is for that machine's own strongest model. Where those are
  // two different models the figures are not a race, and the sentence has to say so.
  const sameModel = !!fa[0] && !!fb[0] && fa[0].model.id === fb[0].model.id;
  const onEachOwn = sameModel ? '' : ', though that is each machine on its own strongest model rather than on the same one';
  if (va.calc && vb.calc) {
    if (da === null && db === null) out.push(`Neither pays for itself at ${usage} tokens a day.`);
    else if (da === null || db === null) {
      const [payer, days] = da === null ? [lb, db!] : [la, da!];
      out.push(`At ${usage} tokens a day the ${payer} pays for itself in ${fmtDuration(days)}${sameModel ? '' : ', on its own strongest model'}; the other never does.`);
    } else if (da === db) {
      out.push(`Both pay for themselves in ${fmtDuration(da)} at ${usage} tokens a day${onEachOwn}.`);
    } else {
      out.push(`The ${da < db ? la : lb} pays for itself sooner, in ${fmtDuration(Math.min(da, db))} against ${fmtDuration(Math.max(da, db))} at ${usage} tokens a day${onEachOwn}.`);
    }
  }

  return out.join(' ');
}

/* --------------------- model head-to-heads --------------------- */

/**
 * Two models are compared by people deciding which to run, and running one
 * costs what the machine for it costs. The specification table answers which
 * is cleverer; these builders answer what each one takes to run, where the two
 * meet on the same hardware, and which of them gets more out of it.
 */

/** This model's row in a view built around it. */
export function rowFor(view: View, m: Model): ModelRow | undefined {
  return view.rows.find((r) => r.model.id === m.id);
}

export interface SharedMachine {
  hw: Hardware;
  a: Runner;
  b: Runner;
  rowA: ModelRow;
  rowB: ModelRow;
}

/**
 * The cheapest machine on the list that runs both, with each model's row on it.
 * The main table gives each model the cheapest machine that runs *it*, and
 * those are usually two different machines, so nothing in it is a race. This is.
 */
export function cheapestRunsBoth(a: Model, b: Model, ra: Runner[], rb: Runner[]): SharedMachine | null {
  const inB = new Map(rb.map((r) => [r.hw.id, r]));
  // ra is cheapest first, so the first machine that runs both is the cheapest that does
  for (const r of ra) {
    const other = inB.get(r.hw.id);
    if (!other) continue;
    const rowA = rowFor(r.view, a);
    const rowB = rowFor(other.view, b);
    if (rowA && rowB) return { hw: r.hw, a: r, b: other, rowA, rowB };
  }
  return null;
}

/** The machines that run the first model and not the second, cheapest first. */
export function runsOnlyThere(ra: Runner[], rb: Runner[]): Runner[] {
  const inB = new Set(rb.map((r) => r.hw.id));
  return ra.filter((r) => !inB.has(r.hw.id));
}

/** Named prices where one of them is a graphics card without the PC around it. */
function cardPriceNote(hardware: Hardware[]): string {
  const cards = [...new Map(hardware.filter((h) => h.price_scope === 'card_only').map((h) => [h.id, h])).values()];
  if (!cards.length) return '';
  if (cards.length === 1) return ` The ${shortHardwareLabel(cards[0])} is priced as the card alone, without the PC around it.`;
  return ' Both are priced as the card alone, without the PC around either.';
}

/**
 * The answer, in the first paragraph: which model is ahead, what machine each
 * one needs and what that costs, which is quicker where they meet, and whether
 * that machine ever pays for itself. Every figure is one the page itself shows,
 * and anything worked out from two speeds uses the rounded figures the page
 * prints, so a reader dividing one by the other gets the third.
 */
export function modelVerdict(
  a: Model,
  b: Model,
  ra: Runner[],
  rb: Runner[],
  shared: SharedMachine | null,
  data: Dataset,
): string {
  const out: string[] = [];
  const sa = a.frontier_equivalent?.score ?? null;
  const sb = b.frontier_equivalent?.score ?? null;
  const ctxK = Math.round(data.defaults.context.default_tokens / 1024);

  if (sa != null && sb != null) {
    out.push(
      sa === sb
        ? `${a.display_name} and ${b.display_name} both score ${sa} on the intelligence index.`
        : `${sa > sb ? a.display_name : b.display_name} scores higher on the intelligence index, ${Math.max(sa, sb)} against ${Math.min(sa, sb)}.`,
    );
  } else if (sa != null || sb != null) {
    const [placed, score, other] = sa != null ? [a.display_name, sa, b.display_name] : [b.display_name, sb!, a.display_name];
    out.push(`${placed} scores ${score} on the intelligence index, and ${other} has not been placed on it.`);
  } else {
    out.push('Neither model has been placed on the intelligence index.');
  }

  const ca = ra[0];
  const cb = rb[0];
  if (ca && cb) {
    const la = shortHardwareLabel(ca.hw);
    const lb = shortHardwareLabel(cb.hw);
    const pa = ca.hw.price_usd!;
    const pb = cb.hw.price_usd!;
    if (ca.hw.id === cb.hw.id) {
      out.push(`Both take the same machine to start: the cheapest here that runs either is the ${la}, at ${fmtUsd(pa)}.${cardPriceNote([ca.hw])}`);
    } else if (pa === pb) {
      out.push(`Both start at ${fmtUsd(pa)}: the ${la} for ${a.display_name}, the ${lb} for ${b.display_name}.${cardPriceNote([ca.hw, cb.hw])}`);
    } else {
      const dear = pa > pb ? { name: a.display_name, l: la, p: pa } : { name: b.display_name, l: lb, p: pb };
      const cheap = pa > pb ? { name: b.display_name, l: lb, p: pb } : { name: a.display_name, l: la, p: pa };
      out.push(
        `The cheapest machine here that runs ${dear.name} is the ${dear.l}, at ${fmtUsd(dear.p)}. ${cheap.name} runs on the ${cheap.l} at ${fmtUsd(cheap.p)}, ${fmtUsd(dear.p - cheap.p, { cents: false })} less.${cardPriceNote([ca.hw, cb.hw])}`,
      );
    }
  } else if (ca || cb) {
    const runner = (ca ?? cb)!;
    const [runs, missing] = ca ? [a.display_name, b.display_name] : [b.display_name, a.display_name];
    out.push(
      `No machine on this list runs ${missing} at ${ctxK}k of context. ${runs} runs on the ${shortHardwareLabel(runner.hw)}, from ${fmtUsd(runner.hw.price_usd)}.${cardPriceNote([runner.hw])}`,
    );
  } else {
    out.push(`No machine on this list runs either model at ${ctxK}k of context.`);
  }

  const sameStart = !!ca && !!cb && ca.hw.id === cb.hw.id;
  const ta = shownTps(shared?.rowA);
  const tb = shownTps(shared?.rowB);
  const label = shared ? shortHardwareLabel(shared.hw) : '';
  if (shared && ta != null && tb != null && ta > 0 && tb > 0) {
    const hi = Math.max(ta, tb);
    const lo = Math.min(ta, tb);
    const num = (t: number) => fmtNum(t, t < 10 ? 1 : 0);
    const clause = basisClause(shared.rowA, shared.rowB, a.display_name, b.display_name);
    const where = sameStart ? 'On it,' : `On the ${label}, the cheapest machine here that runs both,`;
    out.push(
      hi / lo < 1.05
        ? `${where} they run at much the same speed: ${num(ta)} and ${num(tb)} tok/s${clause}.`
        : `${where} ${ta > tb ? a.display_name : b.display_name} is about ${fmtNum(hi / lo, 1)}× quicker: ${num(hi)} tok/s against ${num(lo)}${clause}.`,
    );
  }

  const usage = fmtTokens(defaultState(data).usage);
  if (shared && shared.a.view.calc && shared.b.view.calc) {
    const da = shared.a.view.calc.breakevenDays;
    const db = shared.b.view.calc.breakevenDays;
    if (da === null && db === null) {
      out.push(`At ${usage} tokens a day the ${label} never pays for itself on either.`);
    } else if (da === null || db === null) {
      const [payer, days, never] = da === null ? [b.display_name, db!, a.display_name] : [a.display_name, da!, b.display_name];
      out.push(`At ${usage} tokens a day the ${label} pays for itself in ${fmtDuration(days)} running ${payer}, and never running ${never}.`);
    } else if (fmtDuration(da) === fmtDuration(db)) {
      out.push(`At ${usage} tokens a day the ${label} pays for itself in ${fmtDuration(da)} running either.`);
    } else {
      const [sooner, later] = da < db ? [a.display_name, b.display_name] : [b.display_name, a.display_name];
      out.push(
        `At ${usage} tokens a day the ${label} pays for itself in ${fmtDuration(Math.min(da, db))} running ${sooner}, against ${fmtDuration(Math.max(da, db))} running ${later}.`,
      );
    }
  } else if (!shared && (ca || cb)) {
    const runner = (ca ?? cb)!;
    const name = ca ? a.display_name : b.display_name;
    const days = runner.view.calc?.breakevenDays;
    if (runner.view.calc) {
      out.push(
        days === null
          ? `At ${usage} tokens a day that machine never pays for itself running ${name}.`
          : `At ${usage} tokens a day that machine pays for itself in ${fmtDuration(days!)} running ${name}.`,
      );
    }
  }

  return out.join(' ');
}

/* ------------------------------ phone tables ------------------------------ */

/**
 * Turns a wide table into one a phone reads down instead of across.
 *
 * Five columns do not fit in 358px, so a phone put the last of them past the
 * right edge: on 147 of these tables that was the pay-back, which is the figure
 * the whole site is for, and on 59 it was the link into the calculator. Rather
 * than cut columns, each row is marked up so the narrow layout can set it as a
 * line — the name, the figure that answers the page, and the rest underneath
 * with its column heading in front of it. Nothing is dropped and nothing moves
 * on a wide screen, where the table stays a table.
 *
 * `fig` is the column that earns the right-hand side of the first line. Headings
 * too long to sit inside a row can be shortened per column with `labels`.
 */
export function stack(html: string, opts: { fig: number; labels?: Record<number, string> }): string {
  const marked = html.replace('<table class="board">', '<table class="board stack">');
  if (marked === html) throw new Error('stack() expects a <table class="board">');

  const head = marked.match(/<thead>([\s\S]*?)<\/thead>/);
  const heads = [...(head?.[1] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) =>
    m[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
  );
  const width = heads.length;
  if (!width) throw new Error('stack() expects the table to name its columns');
  if (opts.fig < 1 || opts.fig >= width) throw new Error(`stack(): no column ${opts.fig} to lead with`);

  return marked.replace(/<tbody>([\s\S]*?)<\/tbody>/g, (_all, body: string) =>
    `<tbody>${body.replace(/<tr([^>]*)>([\s\S]*?)<\/tr>/g, (_row, trAttrs: string, cells: string) => {
      let col = 0;
      const out = cells.replace(/<(td|th)([^>]*)>([\s\S]*?)<\/\1>/g, (_cell, tag: string, attrs: string, inner: string) => {
        const span = Number(attrs.match(/colspan="(\d+)"/)?.[1] ?? 1);
        const at = col;
        col += span;
        // a cell reaching across the row is a heading or an aside, not a column
        let role = span >= width ? 'k-wide' : at === 0 ? 'k-name' : at === opts.fig ? 'k-fig' : 'k-sub';
        // a column holding nothing but a dash has nothing to say on a line of its
        // own, so the narrow layout leaves it to the wide one. A cell can be
        // wordless and still carry its answer — the capability dots are drawn on
        // empty spans — so this turns on the dash itself, never on the absence
        // of text.
        if (role === 'k-sub' && /^[—-]$/.test(inner.replace(/<[^>]*>/g, '').trim())) role = 'k-sub k-none';
        const label = role === 'k-sub' && span === 1 ? (opts.labels?.[at] ?? heads[at] ?? '') : '';
        const extra = label ? ` data-label="${label.replace(/"/g, '&quot;')}"` : '';
        const withClass = /class="/.test(attrs)
          ? attrs.replace(/class="/, `class="${role} `)
          : `${attrs} class="${role}"`;
        return `<${tag}${withClass}${extra}>${inner}</${tag}>`;
      });
      return `<tr${trAttrs}>${out}</tr>`;
    })}</tbody>`,
  );
}
