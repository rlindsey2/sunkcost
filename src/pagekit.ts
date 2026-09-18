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
import { fit as memoryFit, kvScaleFor } from './fit';
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

/**
 * The part that decides how fast a machine runs a model. `chip_variant` writes the CPU
 * and the GPU either side of a middle dot where a machine has both, so the GPU is the
 * last segment of it; where the field names one thing, that one thing is the answer.
 */
export function gpuPart(h: Hardware): string {
  const v = h.chip_variant ?? '';
  const i = v.lastIndexOf('\u00b7');
  return (i === -1 ? v : v.slice(i + 1)).trim();
}

/**
 * The same hardware in someone else's box: the same GPU, the same memory at the same
 * bandwidth, the same amount of it left to the GPU, sold by a different manufacturer.
 * Seven Strix Halo boxes carry the same 40-CU Radeon 8060S with 128 GB at 256 GB/s, and
 * they sit $2,095 apart. Fit is memory and memory is equal, so the whole question on
 * such a pair is the price.
 */
export function sameSilicon(a: Hardware, b: Hardware): boolean {
  return (
    a.id !== b.id &&
    a.family === b.family &&
    a.chip !== b.chip &&
    gpuPart(a) !== '' &&
    gpuPart(a) === gpuPart(b) &&
    a.unified_memory_gb === b.unified_memory_gb &&
    a.memory_bandwidth_gbs === b.memory_bandwidth_gbs &&
    a.usable_memory_gb === b.usable_memory_gb
  );
}

/**
 * Apple writes a generation and a tier into every chip name — M4, M4 Pro, M5 Max,
 * M3 Ultra — so the machine that replaced a discontinued one can be read out of the
 * data rather than guessed at from prices or dates. No other family on this list names
 * its parts that way: a GeForce RTX 4090 does not say in its name that an RTX 5090
 * followed it, and the two carry different amounts of memory anyway.
 */
export function appleChip(h: Hardware): { gen: number; tier: string } | null {
  const m = /^M(\d+)(?: (Pro|Max|Ultra))?(?: \(|,|$)/.exec(h.chip);
  return m ? { gen: Number(m[1]), tier: m[2] ?? '' } : null;
}

/**
 * The GPU cores a machine's `chip_variant` states, where it states them. Apple writes
 * "40-core GPU" and AMD writes "40 CU" into the same field, and on two configurations
 * of one box that count is the part of the chip that changed. Null where the data does
 * not say, which is every graphics card on the list: a card's variant names the board,
 * not its cores.
 */
export function gpuCores(h: Hardware): number | null {
  const v = h.chip_variant ?? '';
  const m = /(\d+)-core GPU/.exec(v) ?? /(\d+)\s*CU\b/.exec(v);
  return m ? Number(m[1]) : null;
}

/**
 * Two configurations of one box where the step up changes the chip as well as the
 * memory. A maker who sells a Framework Desktop with a Ryzen AI Max 385 and with a
 * Max+ 395, or a Mac Studio with a 32-core GPU and with a 40-core one, is selling two
 * machines under one name, and the cheaper one is the one in the headline price. The
 * memory-tier rule refuses these on purpose — it holds the silicon equal so the memory
 * is what the money bought — so without this rule the entry-level configuration of a
 * box appears in no head-to-head at all.
 *
 * The names come back split, cheaper side first, so a title can say the box once and
 * spend its characters on the two sizes, which is what the configurator asks. Both
 * sides need a price and both have to be on sale, because pay-back is what the page is
 * for and this is a choice you make at the checkout. Null for every other pair.
 */
export function chipStepNames(
  a: Hardware,
  b: Hardware,
): { machine: string; a: string; b: string } | null {
  if (a.id === b.id || a.family !== b.family || a.chip !== b.chip) return null;
  if ((a.chip_variant ?? '') === (b.chip_variant ?? '') || !a.chip_variant || !b.chip_variant) return null;
  if (a.price_usd == null || b.price_usd == null || a.price_usd >= b.price_usd) return null;
  if ((a.generation ?? 'current') !== 'current' || (b.generation ?? 'current') !== 'current') return null;
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
 * The same machine one generation on: the same case, the same class of chip and the
 * same memory size, with the older one discontinued and the newer one still sold.
 * Somebody with an M4 Mac mini asks what the M6 would change, and somebody looking at
 * a used one asks what they are giving up; both are the same pair of machines. The
 * names come back split so a title can say the family once and spend its characters on
 * the two chips, which is what the reader typed. Both sides need a price, because
 * pay-back is what the page is for. Null for every other pair.
 */
export function generationNames(
  a: Hardware,
  b: Hardware,
): { machine: string; a: string; b: string; size: string } | null {
  if ((a.generation ?? 'current') !== 'previous' || (b.generation ?? 'current') !== 'current') return null;
  if (a.price_usd == null || b.price_usd == null) return null;
  if (a.family !== b.family || a.unified_memory_gb !== b.unified_memory_gb) return null;
  const ca = appleChip(a);
  const cb = appleChip(b);
  if (!ca || !cb || ca.tier !== cb.tier || ca.gen >= cb.gen) return null;
  return { machine: a.family, a: a.chip, b: b.chip, size: `${a.unified_memory_gb}GB` };
}

/**
 * The day a machine stopped being sold, where the data records one. It is written into
 * the availability note the machine's own page prints, as an ISO date at the front, so
 * this reads that rather than holding the same fact in a second place.
 */
export function discontinuedOn(h: Hardware): string | null {
  const m = /^Discontinued (\d{4})-(\d{2})-(\d{2})\b/.exec(h.status ?? '');
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** "Pays back in two years" as a clause inside a sentence. */
export function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * English picks between "a" and "an" from the sound a name opens with, not the
 * letter, and a machine name leads with a maker about as often as with a word.
 * NVIDIA and AMD are read out letter by letter, so both open on a vowel sound
 * and want "an"; Radeon and Mac are read as words and want "a". So a name set
 * in capitals is taken as an initialism and answered on the name of its first
 * letter — eff, aitch, em and the rest start with a vowel sound — and anything
 * else is answered on its first letter. A capitalised name read as a word, the
 * way RAM is, would come out wrong; there is none in the data, and the test
 * over every machine on the site is what keeps it that way.
 */
const SPELT_OUT = /^[A-Z][A-Z0-9]*$/;
const LETTERS_NAMED_WITH_A_VOWEL = 'AEFHILMNORSX';
/** Vowels read as consonants: a unified machine, a one-off, a EULA. */
const SOUNDS_LIKE_A_CONSONANT = /^(?:uni|use|usa|usu|uti|ubi|eu|one|once)/i;

export function indefiniteArticle(name: string): 'a' | 'an' {
  const word = name.trim().split(/[\s,]+/)[0] ?? '';
  if (!word) return 'a';
  if (SPELT_OUT.test(word)) return LETTERS_NAMED_WITH_A_VOWEL.includes(word[0]) ? 'an' : 'a';
  if (SOUNDS_LIKE_A_CONSONANT.test(word)) return 'a';
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
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

/**
 * The way back to the hubs, at the foot of every page.
 *
 * Four pages on this site are indexes rather than answers — the leaderboard,
 * the best buys, the head-to-heads and the memory guide — and a reader who has
 * finished one machine page has no other route to them. The foot of the page is
 * that route, so it names every one of them. `/compare/` was the one it walked
 * past: 133 comparisons hang off it and only the 187 pages that happen to
 * mention a match-up linked it at all.
 *
 * It is one list rather than markup in the shell so the build can hold every
 * page to it, and so adding an index without adding it here fails the build
 * rather than quietly stranding the page.
 */
export const FOOTER_LINKS: { href: string; label: string }[] = [
  { href: '/', label: 'Run the numbers on your own configuration' },
  { href: '/leaderboard/', label: 'All models against the frontier' },
  { href: '/best/', label: 'Best buys by usage' },
  { href: '/compare/', label: 'Every head-to-head' },
  { href: '/how-much-memory/', label: 'How much memory you need' },
  { href: '/best-gpu/', label: 'Which graphics card' },
];

export function footerHtml(): string {
  return `<footer class="doc-foot">
  <p>${FOOTER_LINKS.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join(' · ')}</p>
</footer>`;
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
${footerHtml()}
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

/**
 * The data's capability_note glues two different sentences together, and only
 * one of them is about the model. "Not yet rated: released after our last
 * ratings pass." is about this site's own five capability ratings, and 36 of
 * the 55 models carry it; what follows is the description — what the model is
 * for, what it needs, what it is quick at.
 *
 * A model page printed the whole thing as its opening paragraph, so 36 pages
 * opened by telling the reader the model was unrated, and on 31 of them the
 * next section printed the score: Qwen3.8 27B said "Not yet rated" and then
 * scored 34. Split, each half says something where it lands. The description
 * opens the page. The ratings line goes under the five ratings, which is the
 * one place a reader is looking at a blank and wondering why.
 */
const RATING_SENTENCES = [
  'Not yet rated: released after our last ratings pass.',
  'Sizes and prices are current.',
];

export function splitCapabilityNote(note: string | null | undefined): { ratings: string; about: string } {
  const text = (note ?? '').trim();
  let cut = 0;
  for (;;) {
    const next = RATING_SENTENCES.find((s) => text.startsWith(s, cut));
    if (!next) break;
    cut += next.length;
    while (text[cut] === ' ') cut++;
  }
  return { ratings: text.slice(0, cut).trim(), about: text.slice(cut).trim() };
}

/**
 * A sentence that ends in a note out of the data ends where the note does. The
 * architecture notes all carry their own full stop, so a template adding one
 * printed "on all 80 layers.." on 41 model pages — a typo the data never had
 * and the template could not see.
 */
export function endStop(text: string): string {
  const t = text.trim();
  return !t || /[.!?]$/.test(t) ? t : `${t}.`;
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

/**
 * The same rule for the markers beside a figure that are not tier labels: a
 * quantisation, the model a price stands in for, the label on a level of use.
 * The phrase wraps between its words wherever a column is narrow, but a word
 * carrying its own hyphen holds its line — "UD-Q4_K_M" or "GLM-4.7-Flash"
 * broken at the hyphen reads as a mistake in the data rather than one in the
 * layout, which is the same thing "Haiku-class" would do above.
 */
export function holdHyphens(text: string): string {
  return text
    .split(' ')
    .map((w) => (/[^\s-]-[^\s-]/.test(w) ? `<span class="nobreak">${esc(w)}</span>` : esc(w)))
    .join(' ');
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

/**
 * The graphics cards, ordered the way the question is asked: most usable memory
 * first, because memory is what decides whether a model runs at all, and the
 * cheaper card first where two hold the same amount. A card is one priced
 * without the PC around it, which is the only thing that separates a part from a
 * computer in this data. The page build and the share card both cut the list
 * here, so the two cannot disagree about which cards there are or what order
 * they come in.
 */
export function graphicsCards(data: Dataset): Hardware[] {
  return data.hardware
    .filter((h) => h.price_scope === 'card_only' && h.price_usd != null && h.usable_memory_gb != null)
    .sort((a, b) => b.usable_memory_gb! - a.usable_memory_gb! || a.price_usd! - b.price_usd!);
}

/**
 * The complete computer nearest in price to a card. A card's price buys the card,
 * so the question a buyer actually faces is what the same money already holds with
 * a computer attached — and the honest way to ask it is to let the prices pick the
 * machine rather than choose one that flatters the answer. Both prices print
 * wherever this is used, so a near miss is visible rather than smoothed over.
 */
export function nearestCompleteComputer(card: Hardware, data: Dataset): Hardware | null {
  if (card.price_usd == null) return null;
  return (
    data.hardware
      .filter(
        (h) =>
          h.price_scope !== 'card_only' &&
          h.price_usd != null &&
          (h.generation ?? 'current') === 'current' &&
          h.usable_memory_gb != null,
      )
      .sort(
        (a, b) =>
          Math.abs(a.price_usd! - card.price_usd!) - Math.abs(b.price_usd! - card.price_usd!) ||
          b.usable_memory_gb! - a.usable_memory_gb!,
      )[0] ?? null
  );
}

/** What a machine costs for each gigabyte a model can actually use. */
export function pricePerUsableGb(hw: Hardware): number | null {
  if (hw.price_usd == null || !hw.usable_memory_gb) return null;
  return hw.price_usd / hw.usable_memory_gb;
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

/** A context length as the calculator writes it: 32768 tokens is "32k". */
export function ctxLabel(tokens: number): string {
  return `${Math.round(tokens / 1024)}k`;
}

/**
 * The longest context the calculator offers that this machine still holds this
 * model at. Fit is the site's own: the weights plus the KV cache at that length
 * against usable memory, and never past the model's own context limit. So a
 * figure here is capped by whichever runs out first, the machine or the model.
 */
export function longestContext(m: Model, hw: Hardware, data: Dataset): number | null {
  const kvScale = kvScaleFor(data.defaults.kv_cache?.default, data.defaults);
  let longest: number | null = null;
  for (const ctx of [...data.defaults.context.options].sort((x, y) => x - y)) {
    if (memoryFit(m, hw, ctx, data.defaults.nearly_fits_ratio, kvScale).status === 'fits') longest = ctx;
  }
  return longest;
}

/**
 * What stopped a longest-context figure from going further: the model's own
 * context limit, the end of the calculator's list, or the machine's memory.
 * Only the last of those says anything about the machine, so a page printing
 * one of these figures has to know which it is looking at before it draws a
 * conclusion from it.
 */
export function contextCappedBy(m: Model, tokens: number, data: Dataset): 'model' | 'list' | 'both' | 'memory' {
  const options = [...data.defaults.context.options].sort((x, y) => x - y);
  const next = options.find((o) => o > tokens);
  const limit = m.max_context_tokens;
  if (next == null) return limit != null && limit <= tokens ? 'both' : 'list';
  return limit != null && next > limit ? 'model' : 'memory';
}

export interface Headroom {
  model: Model;
  a: number | null;
  b: number | null;
}

/**
 * Where two machines hold the same models, memory has not stopped mattering — it
 * has moved into the context. The weights are fixed, but the KV cache grows with
 * every token you keep, so the machine with more memory left over takes the same
 * model further. These are the models where that shows, in the order the page
 * already lists them.
 */
export function contextHeadroom(models: Model[], a: Hardware, b: Hardware, data: Dataset): Headroom[] {
  return models
    .map((model) => ({ model, a: longestContext(model, a, data), b: longestContext(model, b, data) }))
    .filter((r) => r.a !== r.b);
}

/**
 * Where one machine holds models the other cannot, a page that stops at that
 * list has answered half the question. The models they both hold are not held
 * to the same length: fit turns on usable memory, so the roomier machine has
 * more left over once the weights are in, and that is what the cache grows into
 * as you keep more tokens. These are the models both hold at the context the
 * page prices, in the order the page already lists them, with `a` the roomier
 * machine's longest window.
 */
export function sharedHeadroom(roomier: Hardware, tighter: Hardware, tighterView: View, data: Dataset): Headroom[] {
  return contextHeadroom(fitsOf(tighterView).map((r) => r.model), roomier, tighter, data);
}

/**
 * The model whose two windows are furthest apart, which is the one worth naming
 * when the page has room for one rather than a table. Measured as a ratio, so a
 * jump from 32k to 256k beats one from 128k to 256k; ties keep the page's own
 * order, which puts the strongest model first.
 */
export function widestHeadroom(rows: Headroom[]): Headroom | null {
  let best: Headroom | null = null;
  for (const r of rows) {
    if (r.a == null || r.b == null) continue;
    if (best === null || r.a / r.b > best.a! / best.b!) best = r;
  }
  return best;
}

export interface ShorterFit {
  model: Model;
  /** the longest window the calculator offers that this machine holds it at */
  ctx: number;
  /** weights plus cache at that window */
  needGb: number;
  /** what the same model would need at the context everything else is priced at */
  needAtDefaultGb: number;
}

/**
 * Models a machine does not hold at the context the site prices everything at,
 * but does hold at a shorter window. The weights are a fixed size and the cache
 * is not, so a model that misses at 32k can fit at 16k or 8k with nothing else
 * changed. A page that only counts what fits at 32k answers "no" to someone who
 * would happily keep a shorter window, which is the wrong answer to their
 * question. Longest window first, then the heavier model, so the nearest miss
 * leads.
 */
export function fitsShorter(hw: Hardware, models: Model[], data: Dataset): ShorterFit[] {
  const ctx = data.defaults.context.default_tokens;
  const kvScale = kvScaleFor(data.defaults.kv_cache?.default, data.defaults);
  const at = (m: Model, tokens: number) => memoryFit(m, hw, tokens, data.defaults.nearly_fits_ratio, kvScale);
  const out: ShorterFit[] = [];
  for (const model of models) {
    if (at(model, ctx).status === 'fits') continue;
    const longest = longestContext(model, hw, data);
    if (longest == null || longest >= ctx) continue;
    const needGb = at(model, longest).needGb;
    const needAtDefaultGb = at(model, ctx).needGb;
    if (needGb == null || needAtDefaultGb == null) continue;
    out.push({ model, ctx: longest, needGb, needAtDefaultGb });
  }
  return out.sort((a, b) => b.ctx - a.ctx || (b.model.weights_gb ?? 0) - (a.model.weights_gb ?? 0));
}

export interface ShorterMachine {
  hw: Hardware;
  /** the longest window the calculator offers that this machine holds the model at */
  ctx: number;
  /** weights plus cache at that window */
  needGb: number;
}

/**
 * The same 45 rows as `fitsShorter`, read from the model's side: the machines
 * that miss this model at the context the site prices everything at and hold it
 * at a shorter one. A model page lists what runs it at 32k and stops, so on
 * twelve of these models the cheapest machine on the page is not the cheapest
 * machine that runs the model — Llama 3.3 70B reads $3,449 and runs on a $1,700
 * box at 16k. One machine per family, cheapest first, the same rule the table
 * above it uses, and a family already in that table may still appear here on a
 * cheaper machine.
 */
export function machinesShorter(m: Model, data: Dataset): ShorterMachine[] {
  const ctx = data.defaults.context.default_tokens;
  const kvScale = kvScaleFor(data.defaults.kv_cache?.default, data.defaults);
  const at = (hw: Hardware, tokens: number) => memoryFit(m, hw, tokens, data.defaults.nearly_fits_ratio, kvScale);
  const out: ShorterMachine[] = [];
  const seen = new Set<string>();
  for (const hw of [...machinesConsidered(data)].sort((a, b) => a.price_usd! - b.price_usd!)) {
    if (at(hw, ctx).status === 'fits') continue;
    const longest = longestContext(m, hw, data);
    if (longest == null || longest >= ctx) continue;
    const needGb = at(hw, longest).needGb;
    if (needGb == null || seen.has(hw.family)) continue;
    seen.add(hw.family);
    out.push({ hw, ctx: longest, needGb });
  }
  return out;
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
 * The card-price caveat, said only on the pages it applies to and about the
 * machines it applies to. A graphics card's price buys the card and nothing to
 * put it in, so a page that sets one against a complete computer has to say so.
 * A page where nothing on it is a card should not raise the question at all,
 * and a page where both sides are cards should not send the reader looking for
 * which one it means.
 */
export function cardScopeNote(machines: Hardware[]): string {
  const all = [...new Map(machines.map((h) => [h.id, h])).values()];
  const cards = all.filter((h) => h.price_scope === 'card_only');
  if (!cards.length) return '';
  if (cards.length === 1)
    return `The ${esc(shortHardwareLabel(cards[0]))} is priced as the card alone, so add the PC around it before comparing it with a complete computer.`;
  if (cards.length === all.length && all.length === 2)
    return 'Both are priced as the card alone, so neither figure includes the PC to put it in.';
  return 'Graphics cards are priced as the card alone, so add the PC around one before comparing it with a complete computer.';
}

/**
 * A power figure, marked where the data has no figure for that machine and
 * borrows one. Electricity is the running cost in every pay-back sum on the
 * site, so a borrowed watt printed bare reads as a measurement of the machine
 * beside it — and where two of them come out equal, as a finding about both.
 */
export function powerWithSource(hw: Hardware): string {
  if (hw.load_watts == null) return '<span class="dim">not published</span>';
  return `${hw.load_watts} W${hw.load_watts_status === 'stand_in' ? `<span class="c-quant">${holdHyphens('stand-in')}</span>` : ''}`;
}

/** Where a power figure came from, in words rather than in the data's own key. */
export function powerSourceLabel(hw: Hardware): string {
  switch (hw.load_watts_status) {
    case 'stand_in':
      return 'stand-in';
    case 'third_party_measured':
      return 'measured by a third party';
    case 'entered':
      return 'entered by you';
    default:
      return 'published';
  }
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

  // the same hardware in two boxes: what they hold and how fast they run it are the
  // same by construction, so the page has to open with that rather than let a reader
  // work through a table of identical rows looking for the difference
  const twins = sameSilicon(a, b);
  if (twins) {
    out.push(
      `The ${la} and the ${lb} are the same machine inside: ${gpuPart(a)}, ${a.unified_memory_gb} GB of memory at ${a.memory_bandwidth_gbs} GB/s. Both hold ${fa.length} of the ${va.rows.length} open models here.`,
    );
  } else if (fa.length === fb.length) {
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
    // on a same-silicon pair the two figures are one GPU benchmarked twice, so a gap
    // between them is a gap between the sources, not between the machines, and calling
    // one of them faster would be the site inventing a difference its own data denies
    out.push(hi / lo < 1.05
      ? `${both} they run at much the same speed: ${num(ta)} and ${num(tb)} tok/s${basis}.`
      : twins
        ? `${both} the two figures are ${num(ta)} and ${num(tb)} tok/s${basis}, and with the same GPU at the same bandwidth on both sides that gap is between the two figures rather than between the two machines.`
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

  // a previous generation's price in this data is the price it launched at, and on these
  // pages it is usually the cheaper of the two, so it is usually the one the sentences
  // above hand the win to. Said last, it qualifies the price and the pay-back together;
  // said next to the price, it would read as being only about the price.
  const older = [a, b].filter((h) => (h.generation ?? 'current') === 'previous' && h.price_usd != null);
  if (older.length === 1)
    out.push(`The ${shortHardwareLabel(older[0])} is the previous generation, so every figure here for it is priced at what it launched at rather than at a price you can pay today.`);
  else if (older.length === 2)
    out.push('Both are previous-generation parts, so every figure here is priced at what they launched at rather than at prices you can pay today.');

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

/**
 * Where no machine holds both at the context the site assumes, the longest
 * context on the calculator's own list where one does.
 *
 * What pushes a big model past a machine's memory is usually the cache, not the
 * weights: the weights are fixed and the cache grows with the context you ask
 * for. So a pair with no machine in common at 32k can still have one at 16k,
 * and that is a real answer rather than a longer page — it is the context to
 * open the calculator at if you want to run both.
 */
export function meetAtShorterContext(a: Model, b: Model, data: Dataset): { ctx: number; shared: SharedMachine } | null {
  const shorter = data.defaults.context.options
    .filter((c) => c < data.defaults.context.default_tokens)
    .sort((x, y) => y - x);
  for (const ctx of shorter) {
    const shared = cheapestRunsBoth(a, b, runnersFor(a, data, { ctx }), runnersFor(b, data, { ctx }));
    if (shared) return { ctx, shared };
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
  meeting?: { ctx: number; shared: SharedMachine } | null,
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

  // Where nothing on the list holds both at the context the site assumes, the lede
  // says where they do meet, because that is the question someone weighing the two
  // has just been told has no answer. It goes last so the sentence before it, which
  // is about the machine one model runs on, keeps its "that machine".
  if (meeting) {
    const k = Math.round(meeting.ctx / 1024);
    const sameOne = (ca ?? cb)?.hw.id === meeting.shared.hw.id;
    out.push(
      sameOne
        ? `Shorten the context to ${k}k and that machine holds both.`
        : `Shorten the context to ${k}k and one machine here holds both: the ${shortHardwareLabel(meeting.shared.hw)}, at ${fmtUsd(meeting.shared.hw.price_usd)}.${cardPriceNote([meeting.shared.hw])}`,
    );
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
 *
 * `pair` names two columns narrow enough to sit on one line together instead of
 * taking one each. It is chosen for the whole table, never per row: a table
 * where some rows pair and some do not reads worse than one where none do. So
 * both columns have to say something in every row, and a table where either
 * comes back blank or as a dash is refused rather than shipped half-paired.
 */
export function stack(html: string, opts: { fig: number; labels?: Record<number, string>; pair?: [number, number] }): string {
  const marked = html.replace('<table class="board">', '<table class="board stack">');
  if (marked === html) throw new Error('stack() expects a <table class="board">');

  const head = marked.match(/<thead>([\s\S]*?)<\/thead>/);
  const heads = [...(head?.[1] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) =>
    m[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
  );
  const width = heads.length;
  if (!width) throw new Error('stack() expects the table to name its columns');
  if (opts.fig < 1 || opts.fig >= width) throw new Error(`stack(): no column ${opts.fig} to lead with`);

  // the two paired columns have to land on the same line of the grid, and the
  // grid fills them in the order the row writes them, so they have to be
  // neighbours once the name and the figure are taken out of the count
  const pair = opts.pair;
  if (pair) {
    const rest = Array.from({ length: width }, (_, i) => i).filter((i) => i !== 0 && i !== opts.fig);
    for (const c of pair) {
      if (!rest.includes(c)) throw new Error(`stack(): column ${c} cannot be paired, it is the name or the figure`);
    }
    if (pair[0] >= pair[1]) throw new Error('stack(): a pair reads left to right, so name the earlier column first');
    if (rest.indexOf(pair[1]) - rest.indexOf(pair[0]) !== 1) {
      throw new Error(`stack(): columns ${pair[0]} and ${pair[1]} are not next to each other, so they cannot share a line`);
    }
  }

  const stacked = marked.replace(/<tbody>([\s\S]*?)<\/tbody>/g, (_all, body: string) =>
    `<tbody>${body.replace(/<tr([^>]*)>([\s\S]*?)<\/tr>/g, (_row, trAttrs: string, cells: string) => {
      let col = 0;
      const out = cells.replace(/<(td|th)([^>]*)>([\s\S]*?)<\/\1>/g, (_cell, tag: string, attrs: string, inner: string) => {
        const span = Number(attrs.match(/colspan="(\d+)"/)?.[1] ?? 1);
        const at = col;
        col += span;
        // a cell reaching across the row is a heading or an aside, not a column
        let role = span >= width ? 'k-wide' : at === 0 ? 'k-name' : at === opts.fig ? 'k-fig' : 'k-sub';
        const sub = role === 'k-sub';
        const said = sub ? inner.replace(/<[^>]*>/g, '').trim() : '';
        // a column holding nothing but a dash has nothing to say on a line of its
        // own, so the narrow layout leaves it to the wide one. A cell can be
        // wordless and still carry its answer — the capability dots are drawn on
        // empty spans — so this turns on the dash itself, never on the absence
        // of text.
        const bare = /^[—-]$/.test(said);
        if (sub && span === 1 && pair?.includes(at)) {
          // a paired column that goes quiet in one row would leave its partner
          // alone on a half-width line, which is the ragged table this is for
          // avoiding, so the build stops instead of shipping it
          if (!inner.trim() || bare) {
            throw new Error(`stack(): column ${at} is paired but says nothing in one row, so the pair would break`);
          }
          role = at === pair[0] ? 'k-sub k-pair' : 'k-sub k-pair k-pair-end';
        } else if (sub && bare) {
          role = 'k-sub k-none';
        }
        const label = sub && !bare && span === 1 ? (opts.labels?.[at] ?? heads[at] ?? '') : '';
        const extra = label ? ` data-label="${label.replace(/"/g, '&quot;')}"` : '';
        const withClass = /class="/.test(attrs)
          ? attrs.replace(/class="/, `class="${role} `)
          : `${attrs} class="${role}"`;
        return `<${tag}${withClass}${extra}>${inner}</${tag}>`;
      });
      return `<tr${trAttrs}>${out}</tr>`;
    })}</tbody>`,
  );
  // a table asked to pair and given nothing to pair is a rule that has quietly
  // stopped applying, which no page would show and no reader would report
  if (pair && !stacked.includes('k-pair')) {
    throw new Error(`stack(): columns ${pair[0]} and ${pair[1]} were asked to share a line and no row gave them one`);
  }
  return stacked;
}
