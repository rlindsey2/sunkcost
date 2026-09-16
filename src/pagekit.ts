/**
 * Shared pieces for the statically generated pages (leaderboard, per model,
 * per machine, comparisons). Pure string builders with no DOM, so the build
 * script and the app can both use them.
 *
 * Every page is real HTML with its content in the markup: these exist to be
 * read by someone arriving from a search, and to be indexable, so nothing here
 * may depend on JavaScript running.
 */
import { computeView, hardwareLabel, modelLabel, type View } from './compute';
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
  <p><a href="/">Run the numbers on your own configuration</a> · <a href="/leaderboard/">All models against the frontier</a> · <a href="/best/">Best buys by usage</a></p>
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

/** The cheapest machine each family can run this model on, with the verdict at default usage. */
export interface Runner {
  hw: Hardware;
  view: View;
  fits: boolean;
}

export function runnersFor(m: Model, data: Dataset, opts: { ctx?: number } = {}): Runner[] {
  const ctx = opts.ctx ?? data.defaults.context.default_tokens;
  return data.hardware
    .filter((h) => h.price_usd != null && (h.generation ?? 'current') === 'current')
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

export { computeView, hardwareLabel, modelLabel, fmtDuration, fmtGb, fmtNum, fmtTokens, fmtUsd, esc };
