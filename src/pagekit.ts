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

export interface PageChrome {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string | null;
  crumbs: { href: string; label: string }[];
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
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" />
<link rel="stylesheet" href="/page.css" />
</head>
<body class="doc">
<header class="topbar">
  <a class="topbar-brand" href="/">
    <span class="mark" aria-hidden="true"></span>
    <span class="wordmark">Sunk Cost</span>
    <span class="domain">sunkcost.ai</span>
  </a>
  <nav class="topbar-line" aria-label="Breadcrumb">
    ${c.crumbs.map((b, i) => `${i ? '<span class="sep">/</span>' : ''}<a href="${esc(b.href)}">${esc(b.label)}</a>`).join('')}
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

export { computeView, hardwareLabel, modelLabel, fmtDuration, fmtGb, fmtNum, fmtTokens, fmtUsd, esc };
