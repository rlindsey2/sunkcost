/**
 * Generates the static pages: the leaderboard, one page per model, one per
 * machine, and head-to-head comparisons — plus sitemap.xml and robots.txt.
 *
 * These are the pages someone lands on from a search. Everything they need is
 * in the HTML; the calculator is a link away with the configuration pre-filled.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync, readFileSync } from 'node:fs';
import {
  calcLink, cheapestPerFamily, computeView, descOf, dotRow, esc, familyHeading, familyRange, fitsOf, fmtDuration,
  fmtGb, fmtNum, fmtTokens, fmtUsd, hardwareLabel, hardwareProduct, lowerFirst, machineVerdict, modelLabel,
  otherQuantisations, pageShell, priceRivals, priceWithScope, runnersFor, runsOnlyOn, shortHardwareLabel, slug,
  speedWithBasis, strongestShared, tierName, tierScale, titleOf, verdictLine, CAP_SHORT, DESC_MAX, FONT_PRELOAD,
  TITLE_MAX,
} from '../src/pagekit';
import {
  flagshipMachines, hardwareComparePath, hardwarePairs, modelComparePath, modelPairs, versusCardPath,
} from '../src/versus-card';
import { BEST_CARD, LEADERBOARD_CARD } from '../src/list-card';
import { defaultState } from '../src/state';
import { hasShareCard } from '../src/share';
import { bestByTier, bestUsageLevels } from '../src/best';
import { kvCacheGb } from '../src/fit';
import { CAPABILITY_KEYS, type Dataset, type Hardware, type Model } from '../src/types';
import type { ModelRow } from '../src/compute';

const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const data: Dataset = {
  hardware: read('hardware.json'), models: read('models.json'), throughput: read('throughput.json'), defaults: read('defaults.json'),
};
const outRoot = new URL('../public/', import.meta.url);
const site = data.defaults.site_url.replace(/\/$/, '');
const paths: string[] = [];

/**
 * The card for a machine and a model, where there is one. `build:og` draws a card
 * only where the arithmetic behind it exists — a machine with no price, or a model
 * too big for it, has nothing honest to put on a card — so a page for one of those
 * falls back to the site's own card rather than naming an image nobody drew.
 */
const cardFor = (hwId: string | undefined, modelId: string | null | undefined) =>
  hwId && modelId && hasShareCard(hwId, modelId, data) ? `/og/${hwId}--${modelId}.png` : '/og/default.png';

const meta: { path: string; title: string; description: string; canonical: string; ogImage: string; links: string[] }[] = [];
/** which pages link to each page, so the build can refuse to ship one nothing links to */
const inbound = new Map<string, Set<string>>();
const unesc = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

function write(path: string, html: string) {
  const dir = new URL(`.${path}`, outRoot);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('index.html', dir), html);
  paths.push(path);
  // Nothing in the head may make the browser wait on another origin before it
  // can paint. The fonts are served from here; a stylesheet somewhere else puts
  // a DNS lookup, a handshake and a round trip in front of the first word.
  const offsite = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(https?:[^"]+)"/g)].map((m) => m[1]);
  if (offsite.length) throw new Error(`${path} loads a stylesheet from another origin: ${offsite[0]}`);
  // Structured data a search engine cannot parse is worse than none, and a
  // stray character in a machine name is all it takes.
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  if (!ld) throw new Error(`${path} has no JSON-LD`);
  try {
    JSON.parse(ld);
  } catch (e) {
    throw new Error(`${path} has JSON-LD that does not parse: ${(e as Error).message}`);
  }
  for (const m of (html.split('<body')[1] ?? '').matchAll(/href="(\/[^"#?]*\/)"/g))
    if (m[1] !== path) inbound.set(m[1], (inbound.get(m[1]) ?? new Set()).add(path));
  meta.push({
    path,
    title: unesc(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''),
    description: unesc(html.match(/<meta name="description" content="([\s\S]*?)" \/>/)?.[1] ?? ''),
    canonical: unesc(html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? ''),
    ogImage: unesc(html.match(/<meta property="og:image" content="([^"]*)"/)?.[1] ?? '').replace(site, ''),
    links: [...(html.split('<body')[1] ?? '').matchAll(/href="([^"]+)"/g)].map((m) => unesc(m[1])),
  });
}

/**
 * Two pages sharing a title or a description is a real fault: it tells a search
 * engine they are the same page. Over-length is a softer one, so it is reported
 * rather than fatal, since a longer machine or model name can cause it.
 */
function checkMeta() {
  const dupes = (key: 'title' | 'description') =>
    [...meta.reduce((m, p) => m.set(p[key], [...(m.get(p[key]) ?? []), p.path]), new Map<string, string[]>())]
      .filter(([, ps]) => ps.length > 1);
  const problems: string[] = [];
  for (const key of ['title', 'description'] as const) {
    for (const [text, ps] of dupes(key))
      problems.push(`${ps.length} pages share a ${key}: "${text.slice(0, 60)}" (${ps.slice(0, 3).join(', ')}…)`);
    for (const p of meta.filter((p) => !p[key].trim())) problems.push(`${p.path} has no ${key}`);
  }
  if (problems.length) {
    console.error(problems.map((p) => `  ${p}`).join('\n'));
    throw new Error(`${problems.length} duplicate or missing page titles/descriptions`);
  }
  const longT = meta.filter((p) => p.title.length > TITLE_MAX);
  const longD = meta.filter((p) => p.description.length > DESC_MAX);
  for (const [what, list, max] of [['titles', longT, TITLE_MAX], ['descriptions', longD, DESC_MAX]] as const)
    if (list.length)
      console.warn(
        `  note: ${list.length} ${what} over ${max} characters and will be cut in search results, longest ${Math.max(...list.map((p) => p[what === 'titles' ? 'title' : 'description'].length))} (${list[0].path})`,
      );
}

/**
 * A page in the sitemap that no other page links to is one a crawler is told
 * about and given no reason to want. Adding a machine or a model should not be
 * able to quietly produce one, so this is fatal rather than a warning.
 */
function checkLinks() {
  const orphans = paths.filter((p) => !inbound.get(p)?.size);
  if (orphans.length) {
    console.error(orphans.map((p) => `  nothing links to ${p}`).join('\n'));
    throw new Error(`${orphans.length} generated pages have no inbound link`);
  }
  const counts = paths.map((p) => inbound.get(p)!.size);
  console.log(`  every page is linked from at least ${Math.min(...counts)} other page${Math.min(...counts) === 1 ? '' : 's'}`);
}

/**
 * One page, one address. A search engine that reaches the same content at two
 * URLs splits it in two and ranks neither, so four things have to hold across
 * every generated page:
 *
 *   - each page's canonical is its own address, and no two pages claim the same
 *     one, since a canonical pointing anywhere else takes the page out of the
 *     results it was written for;
 *   - a head-to-head exists in one direction only — A vs B and B vs A are the
 *     same table with the columns swapped;
 *   - the sitemap and the pages on disk are the same set, so nothing is
 *     announced that does not exist and nothing exists unannounced;
 *   - every internal link is the address the page's own canonical uses. A
 *     missing trailing slash is a redirect in front of the reader, a link to a
 *     page that is not there is a dead end, and a link to /s/ spends a link on
 *     a page this site asks search engines to ignore.
 */
function checkCanonicals() {
  const problems: string[] = [];
  const own = new Set(paths);
  for (const p of meta) {
    if (p.canonical !== site + p.path) problems.push(`${p.path} says its address is ${p.canonical || '(none)'}`);
    for (const href of p.links) {
      if (!href.startsWith('/')) continue;
      const target = href.split(/[?#]/)[0];
      if (target === '/' || target === '') continue;
      if (!target.endsWith('/')) problems.push(`${p.path} links to ${href}, which redirects before it arrives`);
      else if (target.startsWith('/s/')) problems.push(`${p.path} links to ${href}, a share page search engines are told to ignore`);
      else if (!own.has(target)) problems.push(`${p.path} links to ${href}, which no page here writes`);
    }
  }
  const claimed = new Map<string, string[]>();
  for (const p of meta) claimed.set(p.canonical, [...(claimed.get(p.canonical) ?? []), p.path]);
  for (const [url, ps] of claimed) if (ps.length > 1) problems.push(`${ps.length} pages claim ${url}: ${ps.join(', ')}`);
  for (const p of paths) {
    const pair = p.match(/^\/compare\/(.+)-vs-(.+)\/$/);
    if (pair && own.has(`/compare/${pair[2]}-vs-${pair[1]}/`)) problems.push(`${p} also exists with the two sides swapped`);
  }
  const announced = [...readFileSync(new URL('sitemap.xml', outRoot), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const shouldBe = new Set(['/', ...paths].map((p) => site + p));
  if (announced.length !== new Set(announced).size) problems.push('the sitemap lists a URL twice');
  for (const u of announced) if (!shouldBe.has(u)) problems.push(`the sitemap announces ${u}, which is not a page here`);
  for (const u of shouldBe) if (!announced.includes(u)) problems.push(`${u} is a page here and is missing from the sitemap`);
  if (problems.length) {
    console.error(problems.slice(0, 20).map((p) => `  ${p}`).join('\n'));
    throw new Error(`${problems.length} pages are reachable at more than one address, or link to one`);
  }
  console.log(`  ${meta.length} pages, one address each, ${announced.length} in the sitemap`);
}

/**
 * The fonts are files in the repository now, not a URL somebody else serves, so
 * a renamed or missing one is a page that silently falls back to the system
 * face. Every file page.css names has to be there, and the two the pages
 * preload have to be among them: preloading a file that does not exist wastes a
 * request and logs a warning in every visitor's console.
 */
/**
 * A card a page names that nothing drew shows up as a broken image in every
 * preview of that link, and only ever where nobody is looking: in somebody
 * else's chat window. The cards come from `npm run build:og`, which runs before
 * this script in the full build; when they have not been drawn at all there is
 * nothing to compare against and the check stands aside.
 */
function checkOgCards() {
  const dir = new URL('og/', outRoot);
  const drawn = new Set(existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.png')) : []);
  const named = new Set(meta.map((p) => p.ogImage).filter(Boolean));
  if (!drawn.size) {
    console.log(`  ${named.size} OG cards named, none drawn yet (they come from build:og)`);
    return;
  }
  const missing = meta.filter((p) => p.ogImage && !drawn.has(p.ogImage.replace('/og/', '')));
  if (missing.length) {
    console.error(missing.slice(0, 5).map((p) => `  ${p.path} names ${p.ogImage}, which build:og did not draw`).join('\n'));
    throw new Error(`${missing.length} pages name an OG card that does not exist`);
  }
  console.log(`  ${named.size} OG cards named, all drawn`);
}

function checkFonts() {
  const css = readFileSync(new URL('page.css', outRoot), 'utf8');
  const declared = [...css.matchAll(/url\((\/fonts\/[^)]+\.woff2)\)/g)].map((m) => m[1]);
  const missing = declared.filter((f) => !existsSync(new URL(`.${f}`, outRoot)));
  const undeclared = Object.values(FONT_PRELOAD).filter((f) => !declared.includes(f));
  const problems = [
    ...missing.map((f) => `page.css names ${f}, which is not in public/`),
    ...undeclared.map((f) => `the pages preload ${f}, which no @font-face in page.css uses`),
  ];
  if (problems.length) {
    console.error(problems.map((p) => `  ${p}`).join('\n'));
    throw new Error(`${problems.length} font files are missing or unused`);
  }
  console.log(`  ${declared.length} font files, all present, ${Object.keys(FONT_PRELOAD).length} preloaded`);
}

const ratingWord: Record<string, string> = { green: 'good', amber: 'usable', red: 'don’t', unknown: 'not rated' };

// Where the same model is listed at two quantisations, the quantisation is the
// thing that tells the two pages apart, so it goes in the title.
const sharedNames = new Set(
  data.models.map((m) => m.display_name).filter((n, i, xs) => xs.indexOf(n) !== i),
);

// One view per machine at the default settings, computed once: the machine pages
// and every table that names another machine all want the same two numbers out of
// it, how much fits and whether it pays back.
const hwViews = new Map(data.hardware.map((hw) => [hw.id, computeView({ ...defaultState(data), hw: hw.id }, data)]));
const fitsOn = (hw: Hardware) => hwViews.get(hw.id)!.rows.filter((r) => r.fit.status === 'fits');

// The machine most people cross-shop in each family: the middle of the range by
// price. These are the pairs that get a head-to-head page, and the machine pages
// link to the ones they appear in. The pairing lives in src/versus-card.ts, so
// that the card build and the page build cut the same list and agree on names.
const flagships = flagshipMachines(data);

const headToHeads = new Map<string, { href: string; other: Hardware }[]>();
for (const [a, b] of hardwarePairs(data)) {
  const href = hardwareComparePath(a, b);
  for (const [self, other] of [[a, b], [b, a]] as const)
    headToHeads.set(self.id, [...(headToHeads.get(self.id) ?? []), { href, other }]);
}

/* ------------------------------ leaderboard ------------------------------ */

function leaderboard(): string {
  const refs = [...(data.defaults.frontier_reference ?? [])].sort((a, b) => b.score - a.score);
  const scored = data.models
    .filter((m) => m.frontier_equivalent?.score != null)
    .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!);
  const max = data.defaults.frontier_scale_max ?? 70;
  const seen = new Set<string>();
  const unique = scored.filter((m) => {
    const key = m.display_name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const rows = unique
    .map((m, idx) => {
      const next = unique[idx + 1];
      const score = m.frontier_equivalent!.score!;
      const runners = cheapestPerFamily(runnersFor(m, data));
      const cheapest = runners.slice().sort((a, b) => a.hw.price_usd! - b.hw.price_usd!)[0];
      return `<tr>
  <td class="c-model"><a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a><span class="c-quant">${esc(m.quantisation)}</span></td>
  <td class="c-score"><span class="bar"><span style="width:${((score / max) * 100).toFixed(1)}%"></span></span><b>${score}</b>${m.frontier_equivalent?.estimated ? '<abbr title="Artificial Analysis estimated this score rather than running the full suite">*</abbr>' : ''}</td>
  <td class="c-tier">${tierScale(m, data)} ${esc(tierName(m, data))}</td>
  <td class="c-caps">${dotRow(m)}</td>
  <td class="c-gb">${fmtGb(m.weights_gb)}</td>
  <td class="c-hw">${cheapest ? `<a href="/hardware/${esc(cheapest.hw.id)}/">${esc(hardwareLabel(cheapest.hw))}</a> <span class="dim">${fmtUsd(cheapest.hw.price_usd)}</span>` : '<span class="dim">nothing on the list</span>'}</td>
  <td class="c-vs">${next ? `<a href="/compare/${slug(m.id)}-vs-${slug(next.id)}/">vs ${esc(next.display_name)}</a>` : ''}</td>
</tr>`;
    })
    .join('');

  const frontierRows = refs
    .map(
      (r) => `<tr class="is-frontier">
  <td class="c-model">${esc(r.name)}<span class="c-quant">hosted</span></td>
  <td class="c-score"><span class="bar"><span style="width:${((r.score / max) * 100).toFixed(1)}%"></span></span><b>${r.score}</b></td>
  <td class="c-tier" colspan="3"><span class="dim">Runs in someone else’s data centre. You cannot download it.</span></td>
  <td class="c-hw"><span class="dim">—</span></td>
  <td class="c-vs"></td>
</tr>`,
    )
    .join('');

  // models the index has not scored are not in the table; they still have pages,
  // and this is the only route to them
  const unplaced = data.models
    .filter((m) => m.frontier_equivalent?.score == null)
    .sort((a, b) => (a.weights_gb ?? 0) - (b.weights_gb ?? 0));

  const best = unique[0];
  const gap = best && refs[0] ? refs[0].score - best.frontier_equivalent!.score! : null;
  const body = `<article class="prose">
<h1>Every open model, measured against the frontier</h1>
<p class="lede">${unique.length} open-weight models you can download and run at home, ranked on the ${esc(data.defaults.frontier_basis?.name ?? 'intelligence index')}, with the hosted models from Anthropic and OpenAI dropped into the same table for scale. Each row links to what it takes to run it. For which machine pays back soonest at each level, see <a href="/best/">best buys by usage</a>.</p>
${gap != null ? `<p>The short version: the best open model here scores <b>${best.frontier_equivalent!.score}</b> — that is ${esc(best.display_name)}, and it wants ${fmtGb(best.weights_gb)} of memory. The best hosted model scores <b>${refs[0].score}</b>. That gap of ${gap} points is the thing no amount of hardware closes.</p>` : ''}
<table class="board">
<thead><tr><th>Model</th><th>Score</th><th>Class</th><th>Good at</th><th>Weights</th><th>Cheapest machine that runs it</th><th>Next down</th></tr></thead>
<tbody>${frontierRows}${rows}</tbody>
</table>
${unplaced.length ? `<p class="note">${unplaced.length} more open models on this site have no index score yet, so they are not in the table: ${unplaced.map((m) => `<a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a>`).join(', ')}. Their pages show what each one needs and what runs it.</p>` : ''}
<p class="note">${esc(data.defaults.frontier_basis?.estimated_note ?? '')} Scores are the ${esc(data.defaults.frontier_basis?.name ?? '')}${data.defaults.frontier_basis?.url ? ` (<a href="${esc(data.defaults.frontier_basis.url)}" rel="noopener">source</a>)` : ''}, read on ${esc(data.defaults.frontier_basis?.checked ?? '')}. Hybrid models are shown at their reasoning or highest-effort score, with the alternative noted on each model's page. The dots are, in order: ${CAPABILITY_KEYS.map((k) => CAP_SHORT[k].toLowerCase()).join(', ')}.</p>
</article>`;

  return pageShell(
    {
      title: titleOf(['Open LLM leaderboard: every model you can run at home', 'Open LLM leaderboard']),
      description: descOf([
        `${unique.length} open models you can download and run at home, ranked against Claude and GPT on one intelligence index, each with the cheapest machine that runs it.`,
        `${unique.length} open models you can run at home, ranked against Claude and GPT on one intelligence index, each with the cheapest machine that runs it.`,
      ]),
      canonical: '/leaderboard/',
      ogImage: LEADERBOARD_CARD,
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/leaderboard/', label: 'Leaderboard' }],
    },
    body,
    data,
  );
}

/* ------------------------------ best buys ------------------------------ */

function bestBuys(): string {
  const d = data.defaults;
  const levels = bestUsageLevels(data).map((l) => ({ ...l, tiers: bestByTier(data, l.usage) }));
  const anchor = (usage: number) => `u-${fmtTokens(usage).toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  // the headline: at the default usage, the most capable class with anything that pays back
  const headLevel = levels.find((l) => l.usage >= d.usage.default_tokens_per_day) ?? levels[0];
  const headTier = headLevel.tiers.find((t) => t.picks.length);
  const head = headTier?.picks[0];

  const sections = levels
    .map((l) => {
      const rows = l.tiers
        .map((t) => {
          const header = `<tr class="is-frontier"><th colspan="5">${esc(t.label)}${t.hosted.length ? ` <span class="dim">· alongside ${esc(t.hosted.join(', '))}</span>` : ''}</th></tr>`;
          const counts = `${t.never ? `${t.never} never pay back` : ''}${t.never && t.overCapacity ? '; ' : ''}${t.overCapacity ? `${t.overCapacity} can’t produce this much in a day` : ''}`;
          if (!t.picks.length) {
            return `${header}<tr><td colspan="5" class="dim">Nothing in this class pays back on any current machine at this usage${counts ? ` (${counts}, of ${t.considered} pairs that fit)` : ''}.</td></tr>`;
          }
          return header + t.picks
            .map((c) => {
              const v = c.view;
              const tp = v.throughput;
              const ce = c.model.cloud_equivalent;
              const state = { ...defaultState(data), hw: c.hw.id, model: c.model.id, usage: l.usage };
              return `<tr>
  <td class="c-model"><a href="/models/${esc(c.model.id)}/">${esc(c.model.display_name)}</a><span class="c-quant">score ${c.model.frontier_equivalent!.score}${c.model.frontier_equivalent?.estimated ? '*' : ''}</span>${ce.stand_in ? `<br><span class="dim">nobody rents it; priced as ${esc(ce.name)}</span>` : ''}</td>
  <td class="c-hw"><a href="/hardware/${esc(c.hw.id)}/">${esc(hardwareLabel(c.hw))}</a> <span class="dim">${fmtUsd(c.hw.price_usd)}${c.hw.price_scope === 'card_only' ? ', card only' : ''}</span></td>
  <td>${tp?.tokensPerSec != null ? `${fmtNum(tp.tokensPerSec, 0)} tok/s` : '?'}${tp?.measurement && tp.measurement !== 'measured' ? ` <span class="dim">${esc(tp.measurement)}</span>` : ''}</td>
  <td><b>${esc(fmtDuration(c.days))}</b></td>
  <td><a href="${esc(calcLink(state, data))}">Open in the calculator</a></td>
</tr>`;
            })
            .join('') + (counts ? `<tr><td colspan="5" class="dim">Also in this class: ${counts}, of ${t.considered} pairs that fit.</td></tr>` : '');
        })
        .join('');
      return `<section id="${anchor(l.usage)}">
<h2>${esc(fmtTokens(l.usage))} tokens a day <span class="dim">· ${esc(l.label)}</span></h2>
<table class="board">
<thead><tr><th>Model</th><th>Machine</th><th>Speed</th><th>Pays back in</th><th></th></tr></thead>
<tbody>${rows}</tbody>
</table>
</section>`;
    })
    .join('\n');

  const body = `<article class="prose">
<h1>Best buys: the quickest pay-back at each level of capability</h1>
<p class="lede">For each amount of daily use, the machines and models that pay for themselves soonest, grouped by how capable the model is. Each model appears once, on its quickest machine.</p>
${head ? `<p>The short version: at ${esc(fmtTokens(headLevel.usage))} tokens a day (${esc(headLevel.label)}), the quickest ${esc(headTier!.label)} pay-back is ${esc(head.model.display_name)} on a ${esc(hardwareLabel(head.hw))}, in <b>${esc(fmtDuration(head.days))}</b>.</p>` : ''}
<p class="note">Jump to: ${levels.map((l) => `<a href="#${anchor(l.usage)}">${esc(fmtTokens(l.usage))}/day</a>`).join(' · ')}</p>
${sections}
<p class="note">Current machines at list price and current models only. Graphics cards are priced as the card alone, so add the PC around it before comparing them with a complete computer. Every row uses ${esc(String(d.usage.default_input_to_output_ratio))}:1 input to output, $${esc(String(d.electricity.default_price_per_kwh_usd))} per kWh, ${Math.round(d.context.default_tokens / 1024)}k of context, and today's API prices held flat; switch on falling API prices in the calculator and the years stretch. Speeds marked <i>estimated</i> are worked out from memory bandwidth rather than measured, and pay-back scales with them. Models nobody rents are priced as their closest hosted match and say so. Scores are the ${esc(d.frontier_basis?.name ?? 'intelligence index')}; * marks a score the index estimated. Open any row to change the assumptions.</p>
</article>`;

  return pageShell(
    {
      title: titleOf(['Best hardware for local LLMs, by how much you use it', 'Best hardware for local LLMs']),
      description: descOf([
        'For each amount of daily use, the machine and open model that pay back soonest at each level of capability, with the working one click away.',
      ]),
      canonical: '/best/',
      ogImage: BEST_CARD,
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/best/', label: 'Best buys' }],
    },
    body,
    data,
  );
}

/* ------------------------------ model pages ------------------------------ */

function modelPage(m: Model): string {
  const runners = runnersFor(m, data);
  const perFamily = cheapestPerFamily(runners);
  const cheapest = runners[0];
  // best value: the shortest pay-back among machines that run it
  const withPayback = runners.filter((r) => r.view.calc?.breakevenDays != null);
  const bestValue = withPayback.sort((a, b) => a.view.calc!.breakevenDays! - b.view.calc!.breakevenDays!)[0];
  const fastest = runners
    .filter((r) => r.view.throughput?.tokensPerSec != null)
    .sort((a, b) => b.view.throughput!.tokensPerSec! - a.view.throughput!.tokensPerSec!)[0];

  const caps = CAPABILITY_KEYS.map(
    (k) => `<li><span class="dot dot-${m.capabilities[k]}"></span><b>${esc(CAP_SHORT[k])}</b> — ${esc(ratingWord[m.capabilities[k]])}</li>`,
  ).join('');

  const hwRows = perFamily
    .map((r) => {
      const t = r.view.throughput;
      return `<tr>
  <td><a href="/hardware/${esc(r.hw.id)}/">${esc(hardwareLabel(r.hw))}</a></td>
  <td>${fmtUsd(r.hw.price_usd)}</td>
  <td>${t?.tokensPerSec == null ? '<span class="dim">unknown</span>' : `${fmtNum(t.tokensPerSec, t.tokensPerSec < 10 ? 1 : 0)} tok/s <span class="dim">${esc(t.measurement)}</span>`}</td>
  <td>${esc(verdictLine(r.view))}</td>
  <td><a href="${esc(calcLink({ hw: r.hw.id, model: m.id }, data))}">Run the numbers</a></td>
</tr>`;
    })
    .join('');

  const fe = m.frontier_equivalent;
  const ce = m.cloud_equivalent;
  const ctx = data.defaults.context.default_tokens;
  const alsoAt = otherQuantisations(m, data);
  const body = `<article class="prose">
<h1>What hardware do you need to run ${esc(m.display_name)}?</h1>
<p class="lede">${esc(m.display_name)} at ${esc(m.quantisation)} is ${fmtGb(m.weights_gb)} of weights${m.max_context_tokens ? `, with a context ceiling of ${Math.round(m.max_context_tokens / 1024)}k tokens` : ''}. ${esc(m.capability_note)}</p>

${cheapest
      ? `<div class="answer">
  <div class="answer-row"><span class="answer-k">Cheapest machine that runs it</span><span class="answer-v"><a href="/hardware/${esc(cheapest.hw.id)}/">${esc(hardwareLabel(cheapest.hw))}</a> at ${fmtUsd(cheapest.hw.price_usd)}</span></div>
  ${bestValue && bestValue.hw.id !== cheapest.hw.id ? `<div class="answer-row"><span class="answer-k">Shortest pay-back</span><span class="answer-v"><a href="/hardware/${esc(bestValue.hw.id)}/">${esc(hardwareLabel(bestValue.hw))}</a> — ${esc(verdictLine(bestValue.view))}</span></div>` : ''}
  ${fastest ? `<div class="answer-row"><span class="answer-k">Fastest of the ones listed</span><span class="answer-v"><a href="/hardware/${esc(fastest.hw.id)}/">${esc(hardwareLabel(fastest.hw))}</a> — ${fmtNum(fastest.view.throughput!.tokensPerSec, 0)} tok/s at ${Math.round(ctx / 1024)}k context</span></div>` : ''}
  <div class="answer-row"><span class="answer-k">Honest answer on cost</span><span class="answer-v">${cheapest.view.calc?.breakevenDays == null ? 'Against the API, buying hardware for this model never pays for itself at ordinary usage.' : `${esc(verdictLine(cheapest.view))} at ${fmtTokens(defaultState(data).usage)} tokens a day.`}</span></div>
</div>`
      : `<div class="answer"><div class="answer-row"><span class="answer-k">Nothing on the list runs it</span><span class="answer-v">At ${Math.round(ctx / 1024)}k context it needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, ctx) ?? 0))}, more than any machine here offers.</span></div></div>`}

<h2>How good is it, really?</h2>
<p>${fe?.score != null
      ? `On the ${esc(data.defaults.frontier_basis?.name ?? 'intelligence index')} it scores <b>${fe.score}</b>${fe.score_note ? ` (${esc(fe.score_note)})` : ''}, which puts it in the <b>${esc(tierName(m, data))}</b> band. ${esc(data.defaults.frontier_tiers[fe.tier ?? 0].plain)}`
      : 'It has not been placed on the intelligence index yet.'}
${fe?.url ? ` <a href="${esc(fe.url)}" rel="noopener">Score source</a>.` : ''} <a href="/leaderboard/">See the whole table</a>.</p>
<ul class="caps">${caps}</ul>

<h2>What it costs either way</h2>
<p>${ce.stand_in ? `Nobody rents ${esc(m.display_name)} by the token. The closest hosted match, ${esc(ce.name)},` : `Renting the same model${ce.is_exact_match ? '' : ' (or the nearest hosted equivalent, ' + esc(ce.name) + ')'}`} costs <b>$${ce.input_price_per_mtok}</b> per million input tokens and <b>$${ce.output_price_per_mtok}</b> per million output${ce.source_url ? ` (<a href="${esc(ce.source_url)}" rel="noopener">${esc(ce.source)}</a>, checked ${esc(ce.checked ?? '')})` : ''}. Buying a machine only beats that if you use it hard enough, for long enough, that the hardware price divides down below the rental bill.</p>

${hwRows ? `<h2>Machines that run it</h2>
<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Speed at ${Math.round(ctx / 1024)}k</th><th>Pay-back</th><th></th></tr></thead>
<tbody>${hwRows}</tbody>
</table>
<p class="note">One machine per family, cheapest first. Speeds are measured where a public benchmark exists and estimated from memory bandwidth otherwise; the calculator says which for any configuration.</p>` : ''}

<h2>The specifics</h2>
<dl class="specs">
  <dt>Parameters</dt><dd>${fmtNum(m.params_b, 1)}B${m.active_params_b && m.active_params_b < m.params_b ? `, of which ${fmtNum(m.active_params_b, 1)}B are active per token` : ''}</dd>
  <dt>Quantisation</dt><dd>${esc(m.quantisation)}${alsoAt.map((o) => ` — also listed here at <a href="/models/${esc(o.id)}/">${esc(o.quantisation)}</a>, which is ${fmtGb(o.weights_gb)}`).join('')}</dd>
  <dt>Weights on disk</dt><dd>${fmtGb(m.weights_gb)}</dd>
  <dt>KV cache</dt><dd>${fmtGb(kvCacheGb(m, ctx))} at ${Math.round(ctx / 1024)}k context${m.architecture?.note ? ` — ${esc(m.architecture.note)}` : ''}</dd>
  <dt>Maximum context</dt><dd>${m.max_context_tokens ? `${Math.round(m.max_context_tokens / 1024)}k tokens` : 'unknown'}${m.max_context_note ? ` (${esc(m.max_context_note)})` : ''}</dd>
  <dt>Licence</dt><dd>${esc(m.license)}</dd>
  ${m.sources?.length ? `<dt>Sources</dt><dd>${m.sources.map((u, i) => `<a href="${esc(u)}" rel="noopener">source ${i + 1}</a>`).join(', ')}</dd>` : ''}
</dl>
</article>`;

  const usage = fmtTokens(defaultState(data).usage);
  // The pay-back clause is only written where there is a pay-back to state.
  const lead = cheapest
    ? `${m.display_name} needs ${fmtGb(m.weights_gb)} of weights. The cheapest machine that runs it is ${shortHardwareLabel(cheapest.hw)} at ${fmtUsd(cheapest.hw.price_usd)}`
    : '';
  const verdict = cheapest?.view.calc ? lowerFirst(verdictLine(cheapest.view)) : null;
  const desc = cheapest
    ? descOf([
        ...(verdict ? [`${lead}, where it ${verdict} at ${usage} tokens a day.`, `${lead}, where it ${verdict}.`] : []),
        `${lead}.`,
        `${m.display_name} needs ${fmtGb(m.weights_gb)} of weights. Cheapest machine that runs it: ${shortHardwareLabel(cheapest.hw)}.`,
      ])
    : descOf([
        `${m.display_name} needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, ctx) ?? 0))} at ${Math.round(ctx / 1024)}k context, more than any machine on this list offers. What it would take, and what renting it costs instead.`,
        `${m.display_name} needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, ctx) ?? 0))} at ${Math.round(ctx / 1024)}k context, more than any machine on this list offers.`,
      ]);
  return pageShell(
    {
      title: titleOf(
        sharedNames.has(m.display_name)
          ? [
              `${m.display_name} ${m.quantisation}: hardware to run it locally`,
              `${m.display_name} ${m.quantisation}: hardware and cost`,
              `${m.display_name} ${m.quantisation}`,
            ]
          : [
              `${m.display_name}: the hardware that runs it, and the cost`,
              `${m.display_name}: hardware to run it locally`,
              `${m.display_name}: hardware and cost`,
            ],
      ),
      description: desc,
      canonical: `/models/${m.id}/`,
      ogImage: cardFor(cheapest?.hw.id, m.id),
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/leaderboard/', label: 'Models' }, { href: `/models/${m.id}/`, label: m.display_name }],
    },
    body,
    data,
  );
}

/* ---------------------------- hardware pages ---------------------------- */

/** A machine named on another machine's page: price, memory, what it runs, what it costs you. */
function relatedRow(h: Hardware): string {
  const discontinued = (h.generation ?? 'current') === 'previous';
  return `<tr>
  <td><a href="/hardware/${esc(h.id)}/">${esc(hardwareLabel(h))}</a>${discontinued ? '<span class="c-quant">discontinued</span>' : ''}</td>
  <td>${h.price_usd == null ? '<span class="dim">not published</span>' : fmtUsd(h.price_usd)}${h.price_scope === 'card_only' ? '<span class="c-quant">card only</span>' : ''}</td>
  <td>${h.unified_memory_gb} GB</td>
  <td>${fitsOn(h).length}</td>
  <td>${esc(verdictLine(hwViews.get(h.id)!))}</td>
</tr>`;
}

function hardwarePage(hw: Hardware): string {
  const state = { ...defaultState(data), hw: hw.id };
  const view = computeView(state, data);
  const fits = view.rows.filter((r) => r.fit.status === 'fits');
  const label = hardwareLabel(hw);
  const short = shortHardwareLabel(hw);
  const hwVerdict = view.calc ? lowerFirst(verdictLine(view)) : null;
  const range = familyRange(hw, data);
  const rivals = priceRivals(hw, data);

  const rows = fits
    .slice(0, 12)
    .map((r) => `<tr>
  <td><a href="/models/${esc(r.model.id)}/">${esc(r.model.display_name)}</a><span class="c-quant">${esc(r.model.quantisation)}</span></td>
  <td>${r.throughput.tokensPerSec == null ? '<span class="dim">unknown</span>' : `${fmtNum(r.throughput.tokensPerSec, r.throughput.tokensPerSec < 10 ? 1 : 0)} tok/s`}</td>
  <td>${tierScale(r.model, data)} ${esc(tierName(r.model, data))}</td>
  <td>${dotRow(r.model)}</td>
  <td>${fmtGb(r.fit.needGb)}</td>
</tr>`)
    .join('');

  const best = fits[0];
  const body = `<article class="prose">
<h1>Can a ${esc(label)} run local LLMs?</h1>
<p class="lede">Yes — ${fits.length} of the ${view.rows.length} open models on this site fit in its ${hw.usable_memory_gb ?? '?'} GB of usable memory${best ? `, the strongest being ${esc(best.model.display_name)}` : ''}. Whether that saves you money is a different question, and the answer is usually no.</p>

<div class="answer">
  <div class="answer-row"><span class="answer-k">Price</span><span class="answer-v">${hw.price_usd == null ? 'not published yet' : fmtUsd(hw.price_usd)}${hw.generation === 'previous' ? ' at launch — discontinued' : ''}</span></div>
  <div class="answer-row"><span class="answer-k">Memory</span><span class="answer-v">${hw.unified_memory_gb} GB${hw.usable_memory_gb != null ? `, about ${hw.usable_memory_gb} GB of it addressable by the GPU` : ''}${hw.memory_bandwidth_gbs ? ` at ${hw.memory_bandwidth_gbs} GB/s` : ''}</span></div>
  ${best ? `<div class="answer-row"><span class="answer-k">Best model it runs</span><span class="answer-v"><a href="/models/${esc(best.model.id)}/">${esc(best.model.display_name)}</a> — ${esc(tierName(best.model, data))}${best.throughput.tokensPerSec ? `, ${fmtNum(best.throughput.tokensPerSec, 0)} tok/s` : ''}</span></div>` : ''}
  <div class="answer-row"><span class="answer-k">Pay-back against the API</span><span class="answer-v">${view.calc ? esc(verdictLine(view)) : 'cannot be computed yet'}${view.calc?.breakevenDays != null ? ` at ${fmtTokens(state.usage)} tokens a day` : ''}</span></div>
</div>

<p><a class="cta" href="${esc(calcLink({ hw: hw.id }, data))}">Run the numbers on this machine</a></p>

${rows ? `<h2>What it runs</h2>
<table class="board">
<thead><tr><th>Model</th><th>Speed</th><th>Class</th><th>Good at</th><th>Memory</th></tr></thead>
<tbody>${rows}</tbody>
</table>
${fits.length > 12 ? `<p class="note">${fits.length - 12} more fit; the calculator lists them all.</p>` : ''}` : ''}

${range.length || rivals.length ? `<h2>Other machines to weigh against it</h2>
<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Memory</th><th>Models that fit</th><th>Pay-back</th></tr></thead>
<tbody>
${range.length ? `<tr class="is-frontier"><th colspan="5">${esc(familyHeading(hw))}</th></tr>${range.map(relatedRow).join('')}` : ''}
${rivals.length ? `<tr class="is-frontier"><th colspan="5">Nearest in price elsewhere on the list</th></tr>${rivals.map(relatedRow).join('')}` : ''}
</tbody>
</table>
<p class="note">Every row uses the same defaults as the figures above: ${fmtTokens(state.usage)} tokens a day at ${state.ratio}:1 input to output, ${Math.round(state.ctx / 1024)}k context, and each machine's strongest model that fits, counted against the same ${view.rows.length} models. Graphics cards are priced as the card alone, so add the PC around one before comparing it with a complete computer.</p>` : ''}
${headToHeads.get(hw.id)?.length ? `<p class="note">Head to head: ${headToHeads.get(hw.id)!.map((h) => `<a href="${esc(h.href)}">vs ${esc(shortHardwareLabel(h.other))}</a>`).join(' · ')}</p>` : ''}

<h2>The specifics</h2>
<dl class="specs">
  <dt>Chip</dt><dd>${esc(hw.chip)}${hw.chip_variant ? ` — ${esc(hw.chip_variant)}` : ''}</dd>
  <dt>Memory bandwidth</dt><dd>${hw.memory_bandwidth_gbs ? `${hw.memory_bandwidth_gbs} GB/s` : 'unknown'}</dd>
  <dt>Usable by the GPU</dt><dd>${hw.usable_memory_gb ?? 'unknown'} GB${hw.notes ? ` — ${esc(hw.notes)}` : ''}</dd>
  <dt>Power under load</dt><dd>${hw.load_watts ?? 'unknown'} W${hw.load_watts_status ? ` (${esc(hw.load_watts_status.replace(/_/g, ' '))})` : ''}${hw.load_watts_note ? ` — ${esc(hw.load_watts_note)}` : ''}</dd>
  ${hw.status ? `<dt>Availability</dt><dd>${esc(hw.status)}</dd>` : ''}
  ${hw.sources?.length ? `<dt>Sources</dt><dd>${hw.sources.map((u, i) => `<a href="${esc(u)}" rel="noopener">source ${i + 1}</a>`).join(', ')}</dd>` : ''}
</dl>
</article>`;

  return pageShell(
    {
      title: titleOf([
        `${short}: can it run local LLMs, and does it pay back?`,
        `${short}: can it run local LLMs?`,
        `${short} for local LLMs`,
      ]),
      description: descOf([
        ...(best && hwVerdict
          ? [
              `${fits.length} of the ${view.rows.length} open models here fit a ${short}. On ${best.model.display_name}, the strongest of them, it ${hwVerdict} at ${fmtTokens(state.usage)} tokens a day.`,
              `${fits.length} of the ${view.rows.length} open models here fit a ${short}. On the strongest of them it ${hwVerdict} at ${fmtTokens(state.usage)} tokens a day.`,
              `${fits.length} of the ${view.rows.length} open models here fit a ${short}, and on the strongest of them it ${hwVerdict}.`,
            ]
          : []),
        `${fits.length} of the ${view.rows.length} open models here fit a ${short}. What it runs, how fast, and whether buying it beats paying an API.`,
        `${fits.length} open models fit a ${short}. What it runs, how fast, and whether it pays back.`,
      ]),
      canonical: `/hardware/${hw.id}/`,
      ogImage: cardFor(hw.id, view.model?.id),
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: `/hardware/${hw.id}/`, label: label }],
      about: hardwareProduct(hw, `${site}/hardware/${hw.id}/`),
    },
    body,
    data,
  );
}

/* ---------------------------- comparison pages ---------------------------- */

function comparePage(a: Hardware, b: Hardware): string {
  const st = defaultState(data);
  const va = computeView({ ...st, hw: a.id }, data);
  const vb = computeView({ ...st, hw: b.id }, data);
  const fa = fitsOf(va);
  const fb = fitsOf(vb);
  const la = hardwareLabel(a);
  const lb = hardwareLabel(b);
  const ctxK = Math.round(st.ctx / 1024);
  const row = (k: string, x: string, y: string) => `<tr><th>${esc(k)}</th><td>${x}</td><td>${y}</td></tr>`;

  // each column takes the strongest model its own machine holds, and on 12 of these
  // pairs that is not the same model, so the speed cell names the model it belongs to
  const differ = !!fa[0] && !!fb[0] && fa[0].model.id !== fb[0].model.id;
  const speedCell = (r: ModelRow | undefined) =>
    !r ? '—' : `${speedWithBasis(r)}${differ ? `<span class="c-quant">${esc(r.model.display_name)}</span>` : ''}`;

  const shared = strongestShared(va, vb);
  // the like-for-like race the table above cannot give when the two columns
  // are running different models
  const likeForLike = shared && differ
    ? (() => {
        const sa = computeView({ ...st, hw: a.id, model: shared.model.id }, data);
        const sb = computeView({ ...st, hw: b.id, model: shared.model.id }, data);
        return `<h2>Side by side on ${esc(shared.model.display_name)}</h2>
<p>The table above gives each machine the strongest model it can hold, and those are not the same model, so the two speeds in it are not a race. <a href="/models/${esc(shared.model.id)}/">${esc(shared.model.display_name)}</a> is the strongest model both machines hold, so this is the pair running the same work.</p>
<table class="board compare">
<thead><tr><th></th><th>${esc(la)}</th><th>${esc(lb)}</th></tr></thead>
<tbody>
${row('Speed', speedWithBasis(shared.a), speedWithBasis(shared.b))}
${row('Pay-back', esc(verdictLine(sa)), esc(verdictLine(sb)))}
</tbody>
</table>
<p><a class="cta" href="${esc(calcLink({ hw: a.id, model: shared.model.id }, data))}">Run ${esc(shared.model.display_name)} on the ${esc(la)}</a> · <a href="${esc(calcLink({ hw: b.id, model: shared.model.id }, data))}">or on the ${esc(lb)}</a></p>`;
      })()
    : '';

  // fit turns only on usable memory, so one machine's list is a superset of the
  // other's; whichever way round that falls, this is what the difference buys
  const extraA = runsOnlyOn(va, vb);
  const extraB = runsOnlyOn(vb, va);
  const [roomier, tighter, extra, roomierView] = extraA.length >= extraB.length
    ? [la, lb, extraA, va]
    : [lb, la, extraB, vb];
  const shown = extra.slice(0, 6);
  const extraSection = extra.length
    ? `<h2>What the extra memory buys</h2>
<p>The ${esc(roomier)} holds ${extra.length} model${extra.length === 1 ? '' : 's'} the ${esc(tighter)} cannot at ${ctxK}k of context. ${extra.length === 1 ? 'That is' : 'The strongest of them are'} what the difference in memory actually buys.</p>
<table class="board">
<thead><tr><th>Model</th><th>Weights</th><th>Needs at ${ctxK}k</th><th>On the ${esc(roomier)}</th></tr></thead>
<tbody>
${shown
  .map((m) => {
    const r = roomierView.rows.find((x) => x.model.id === m.id)!;
    return `<tr><td class="c-model"><a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a><span class="c-quant">${esc(tierName(m, data))}</span></td><td>${fmtGb(m.weights_gb)}</td><td>${r.fit.needGb != null ? fmtGb(r.fit.needGb) : '<span class="dim">unknown</span>'}</td><td>${speedWithBasis(r)}</td></tr>`;
  })
  .join('\n')}
</tbody>
</table>
${extra.length > shown.length ? `<p class="note">${extra.length - shown.length} more, on the <a href="/hardware/${esc(extraA.length >= extraB.length ? a.id : b.id)}/">${esc(roomier)} page</a>.</p>` : ''}`
    : `<h2>Memory is not what separates them</h2>
<p>Every model on this list that fits one machine fits the other, at ${ctxK}k of context. So the choice between them is speed, price and power, not what they can hold.</p>`;

  const body = `<article class="prose">
<h1>${esc(la)} vs ${esc(lb)} for local AI</h1>
<p class="lede">${machineVerdict(a, b, va, vb, data)}</p>
<table class="board compare">
<thead><tr><th></th><th><a href="/hardware/${esc(a.id)}/">${esc(la)}</a></th><th><a href="/hardware/${esc(b.id)}/">${esc(lb)}</a></th></tr></thead>
<tbody>
${row('Price', priceWithScope(a), priceWithScope(b))}
${row('Memory', `${a.unified_memory_gb} GB`, `${b.unified_memory_gb} GB`)}
${row('Usable by the GPU', `${a.usable_memory_gb ?? '?'} GB`, `${b.usable_memory_gb ?? '?'} GB`)}
${row('Memory bandwidth', a.memory_bandwidth_gbs ? `${a.memory_bandwidth_gbs} GB/s` : 'unknown', b.memory_bandwidth_gbs ? `${b.memory_bandwidth_gbs} GB/s` : 'unknown')}
${row('Power under load', `${a.load_watts ?? '?'} W`, `${b.load_watts ?? '?'} W`)}
${row('Models that fit', String(fa.length), String(fb.length))}
${row('Best model it runs', fa[0] ? `<a href="/models/${esc(fa[0].model.id)}/">${esc(fa[0].model.display_name)}</a>` : '—', fb[0] ? `<a href="/models/${esc(fb[0].model.id)}/">${esc(fb[0].model.display_name)}</a>` : '—')}
${row('Speed on that model', speedCell(fa[0]), speedCell(fb[0]))}
${row('Pay-back on that model', esc(verdictLine(va)), esc(verdictLine(vb)))}
</tbody>
</table>
<p><a class="cta" href="${esc(calcLink({ hw: a.id }, data))}">Run the numbers on the ${esc(la)}</a> · <a href="${esc(calcLink({ hw: b.id }, data))}">or the ${esc(lb)}</a></p>
${likeForLike}
${extraSection}
<h2>The assumptions behind both columns</h2>
<p class="note">Both columns use the same usage: ${fmtTokens(st.usage)} tokens a day at ${st.ratio}:1 input to output, ${ctxK}k of context, $${st.kwh} per kWh, and today's API prices held flat. Speeds marked <i>estimated</i> are worked out from memory bandwidth rather than measured, and pay-back scales with them. Graphics cards are priced as the card alone, so add the PC around one before comparing it with a complete computer. Change any of it in the calculator.</p>
<p class="note">More head to head: <a href="/hardware/${esc(a.id)}/">everything the ${esc(la)} runs</a> · <a href="/hardware/${esc(b.id)}/">everything the ${esc(lb)} runs</a> · <a href="/best/">the quickest pay-back at each level of use</a> · <a href="/leaderboard/">every model against the frontier</a></p>
</article>`;
  return pageShell(
    {
      title: titleOf([
        `${shortHardwareLabel(a)} vs ${shortHardwareLabel(b)} for local LLMs`,
        `${shortHardwareLabel(a)} vs ${shortHardwareLabel(b)}`,
      ]),
      description: descOf([
        `${fa.length} of the ${va.rows.length} open models here fit the ${shortHardwareLabel(a)}, ${fb.length} the ${shortHardwareLabel(b)}. Memory, speed, price and which pays back sooner.`,
        `${fa.length} models fit the ${shortHardwareLabel(a)}, ${fb.length} the ${shortHardwareLabel(b)}. Memory, speed, price and which pays back sooner.`,
        `${shortHardwareLabel(a)} against ${shortHardwareLabel(b)}: memory, speed, what each runs and which pays back sooner.`,
      ]),
      canonical: hardwareComparePath(a, b),
      ogImage: versusCardPath(hardwareComparePath(a, b)),
      crumbs: [
        { href: '/', label: 'Sunk Cost' },
        { href: '#', label: `${shortHardwareLabel(a)} vs ${shortHardwareLabel(b)}` },
      ],
    },
    body,
    data,
  );
}

/* ------------------------- model head-to-heads ------------------------- */

function modelComparePage(a: Model, b: Model): string {
  const ra = runnersFor(a, data);
  const rb = runnersFor(b, data);
  const ctx = data.defaults.context.default_tokens;
  const sa = a.frontier_equivalent?.score ?? null;
  const sb = b.frontier_equivalent?.score ?? null;
  const row = (k: string, x: string, y: string) => `<tr><th>${esc(k)}</th><td>${x}</td><td>${y}</td></tr>`;
  const capRows = CAPABILITY_KEYS.map(
    (k) => `<tr><th>${esc(CAP_SHORT[k])}</th><td><span class="dot dot-${a.capabilities[k]}"></span> ${esc(ratingWord[a.capabilities[k]])}</td><td><span class="dot dot-${b.capabilities[k]}"></span> ${esc(ratingWord[b.capabilities[k]])}</td></tr>`,
  ).join('');

  const verdict =
    sa != null && sb != null && sa !== sb
      ? `${esc(sa > sb ? a.display_name : b.display_name)} scores higher on the intelligence index — ${Math.max(sa, sb)} against ${Math.min(sa, sb)}.`
      : 'Neither has a clear lead on the index.';
  const sizeNote =
    a.weights_gb != null && b.weights_gb != null && Math.abs(a.weights_gb - b.weights_gb) > 1
      ? ` ${esc(a.weights_gb < b.weights_gb ? a.display_name : b.display_name)} is the smaller download at ${fmtGb(Math.min(a.weights_gb, b.weights_gb))}, so it runs on cheaper hardware.`
      : '';

  const body = `<article class="prose">
<h1>${esc(a.display_name)} vs ${esc(b.display_name)}</h1>
<p class="lede">${verdict}${sizeNote}</p>
<table class="board compare">
<thead><tr><th></th><th><a href="/models/${esc(a.id)}/">${esc(a.display_name)}</a></th><th><a href="/models/${esc(b.id)}/">${esc(b.display_name)}</a></th></tr></thead>
<tbody>
${row('Intelligence index', sa != null ? `<b>${sa}</b>` : 'not placed', sb != null ? `<b>${sb}</b>` : 'not placed')}
${row('Class', esc(tierName(a, data)), esc(tierName(b, data)))}
${row('Weights', fmtGb(a.weights_gb), fmtGb(b.weights_gb))}
${row('Quantisation', esc(a.quantisation), esc(b.quantisation))}
${row('Parameters', `${fmtNum(a.params_b, 1)}B${a.active_params_b && a.active_params_b < a.params_b ? ` (${fmtNum(a.active_params_b, 1)}B active)` : ''}`, `${fmtNum(b.params_b, 1)}B${b.active_params_b && b.active_params_b < b.params_b ? ` (${fmtNum(b.active_params_b, 1)}B active)` : ''}`)}
${row('Max context', a.max_context_tokens ? `${Math.round(a.max_context_tokens / 1024)}k` : 'unknown', b.max_context_tokens ? `${Math.round(b.max_context_tokens / 1024)}k` : 'unknown')}
${row('API price per 1M', `$${a.cloud_equivalent.input_price_per_mtok} in / $${a.cloud_equivalent.output_price_per_mtok} out`, `$${b.cloud_equivalent.input_price_per_mtok} in / $${b.cloud_equivalent.output_price_per_mtok} out`)}
${row('Licence', esc(a.license), esc(b.license))}
${row('Cheapest machine that runs it', ra[0] ? `<a href="/hardware/${esc(ra[0].hw.id)}/">${esc(hardwareLabel(ra[0].hw))}</a> ${fmtUsd(ra[0].hw.price_usd)}` : 'none listed', rb[0] ? `<a href="/hardware/${esc(rb[0].hw.id)}/">${esc(hardwareLabel(rb[0].hw))}</a> ${fmtUsd(rb[0].hw.price_usd)}` : 'none listed')}
${capRows}
</tbody>
</table>
<p class="note">Ratings are coarse on purpose. Speeds and pay-back depend on the machine — open either model's page for the full list, or <a href="/leaderboard/">see both against the frontier</a>. Context is ${Math.round(ctx / 1024)}k throughout.</p>
</article>`;
  return pageShell(
    {
      title: titleOf([
        `${a.display_name} vs ${b.display_name}: which should you run?`,
        `${a.display_name} vs ${b.display_name}`,
      ]),
      description: descOf([
        ...(sa != null && sa === sb
          ? [`${a.display_name} and ${b.display_name} both score ${sa} on the intelligence index. Size, context, licence, API price and the cheapest machine that runs each.`]
          : []),
        `${a.display_name} scores ${sa ?? '?'} on the intelligence index, ${b.display_name} scores ${sb ?? '?'}. Size, context, licence, API price and the cheapest machine that runs each.`,
        `${a.display_name} scores ${sa ?? '?'}, ${b.display_name} scores ${sb ?? '?'}. Size, context, licence, API price and the cheapest machine that runs each.`,
        `${a.display_name} scores ${sa ?? '?'}, ${b.display_name} scores ${sb ?? '?'}. Size, context, licence and the cheapest machine for each.`,
      ]),
      canonical: modelComparePath(a, b),
      ogImage: versusCardPath(modelComparePath(a, b)),
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/leaderboard/', label: 'Models' }, { href: '#', label: `${a.display_name} vs ${b.display_name}` }],
    },
    body,
    data,
  );
}

/* --------------------------------- build --------------------------------- */

write('/leaderboard/', leaderboard());
write('/best/', bestBuys());
for (const m of data.models) write(`/models/${m.id}/`, modelPage(m));
for (const hw of data.hardware) write(`/hardware/${hw.id}/`, hardwarePage(hw));

// comparisons: the flagship current config of each family against every other,
// the pairs `headToHeads` above already worked out and linked from both sides
for (const [a, b] of hardwarePairs(data)) write(hardwareComparePath(a, b), comparePage(a, b));

// model head-to-heads: each model against the next one down the leaderboard,
// which is the comparison someone actually has to make
for (const [a, b] of modelPairs(data)) write(modelComparePath(a, b), modelComparePage(a, b));

const urls = ['/', ...paths]
  .map((p) => `  <url><loc>${site}${p}</loc><lastmod>${data.defaults.data_last_checked}</lastmod></url>`)
  .join('\n');
writeFileSync(new URL('sitemap.xml', outRoot), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(new URL('robots.txt', outRoot), `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
checkMeta();
checkLinks();
checkCanonicals();
checkOgCards();
checkFonts();
console.log(`wrote ${paths.length} static pages + sitemap.xml (${paths.filter((p) => p.startsWith('/models')).length} models, ${paths.filter((p) => p.startsWith('/hardware')).length} machines, ${paths.filter((p) => p.startsWith('/compare')).length} comparisons)`);
