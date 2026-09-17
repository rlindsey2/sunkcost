/**
 * Generates the static pages: the leaderboard, one page per model, one per
 * machine, and head-to-head comparisons — plus sitemap.xml and robots.txt.
 *
 * These are the pages someone lands on from a search. Everything they need is
 * in the HTML; the calculator is a link away with the configuration pre-filled.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync, readFileSync } from 'node:fs';
import {
  calcLink, cheapestPerFamily, cheapestRunsBoth, computeView, descOf, dotRow, esc, familyHeading, familyRange,
  fitsOf, fmtDuration, fmtGb, fmtNum, fmtTokens, fmtUsd, hardwareLabel, hardwareProduct, indefiniteArticle,
  lowerFirst, machineVerdict, machinesConsidered, modelLabel, modelVerdict, otherQuantisations, pageShell,
  priceRivals, priceWithScope, priceWithScopeText, rowFor, runnersFor, runsOnlyOn, runsOnlyThere,
  CAP_SHORT, contextCappedBy, contextHeadroom, ctxLabel, DESC_MAX, fitsShorter, FONT_PRELOAD, longestContext,
  meetAtShorterContext, shortHardwareLabel, shownTps, slug, speedWithBasis, stack, strongestShared, tierLabel,
  tierName, tierScale, TITLE_MAX, titleOf, verdictLine, type Runner, type SharedMachine, type ShorterFit,
} from '../src/pagekit';
import {
  flagshipMachines, hardwareComparePath, hardwarePairs, modelComparePath, modelPairs, versusCardPath,
} from '../src/versus-card';
import { BEST_CARD, COMPARE_CARD, LEADERBOARD_CARD } from '../src/list-card';
import { defaultState } from '../src/state';
import { hasShareCard } from '../src/share';
import { bestByTier, bestUsageLevels } from '../src/best';
import { kvCacheGb } from '../src/fit';
import { CAPABILITY_KEYS, type Dataset, type Hardware, type Model } from '../src/types';
import type { ModelRow, View } from '../src/compute';

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

const meta: { path: string; title: string; description: string; canonical: string; ogImage: string; links: string[]; html: string }[] = [];
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
    html,
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
 * A head-to-head has to be reachable from both things it compares. Machine
 * pages have always carried theirs; the model match-ups did not, so all 47 of
 * them hung off a single link — the leaderboard's last column — while every
 * machine match-up had two. One inbound link from one cell of one table is a
 * page a crawler finds late and a reader never finds at all, and the reader on
 * a model's own page is the one with the comparison in front of them.
 */
function checkHeadToHeads() {
  const sides = new Map<string, string[]>();
  for (const [a, b] of hardwarePairs(data)) sides.set(hardwareComparePath(a, b), [`/hardware/${a.id}/`, `/hardware/${b.id}/`]);
  for (const [a, b] of modelPairs(data)) sides.set(modelComparePath(a, b), [`/models/${a.id}/`, `/models/${b.id}/`]);
  const problems: string[] = [];
  for (const [path, both] of sides)
    for (const side of both)
      if (!inbound.get(path)?.has(side)) problems.push(`${path} is not linked from ${side}, one of the two it compares`);
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} head-to-head link${problems.length === 1 ? '' : 's'} missing, of the two every comparison needs`);
  }
  const fewest = Math.min(...[...sides.keys()].map((p) => inbound.get(p)!.size));
  console.log(`  ${sides.size} head-to-heads, each linked from both sides and from at least ${fewest} pages in all`);
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

/**
 * A graphics card is priced without the PC around it. Set beside a machine
 * name, that price reads as a whole computer: the $1,299 that buys a Radeon AI
 * PRO R9700 also buys a Mac mini M6 with 32 GB, and the two sit in the same
 * tables here. So wherever a card's price is printed, the row, sentence or
 * description it sits in has to say what it buys.
 */
function checkCardPrices() {
  const cards = data.hardware.filter((h) => h.price_scope === 'card_only' && h.price_usd != null);
  if (!cards.length) return;
  // one row, sentence or answer at a time: the scope has to be where the price
  // is, not further down the page where the reader has already gone
  const chunks = /<tr>[\s\S]*?<\/tr>|<p[^>]*>[\s\S]*?<\/p>|<div class="answer-row">[\s\S]*?<\/div>|<li>[\s\S]*?<\/li>|<h[12][^>]*>[\s\S]*?<\/h[12]>/g;
  const saysScope = (text: string) => /card only|card alone|cards are priced/.test(text);
  const priceOf = (id: string) => data.hardware.find((h) => h.id === id)?.price_usd;
  const problems: string[] = [];
  for (const p of meta) {
    const ownId = p.path.startsWith('/hardware/') ? p.path.slice('/hardware/'.length, -1) : null;
    const places: [string, string][] = [
      ['description', p.description],
      ...[...p.html.matchAll(chunks)].map((m) => ['line', m[0]] as [string, string]),
    ];
    for (const [what, text] of places) {
      if (saysScope(text)) continue;
      const named = new Set([...text.matchAll(/\/hardware\/([a-z0-9.-]+)\//g)].map((m) => m[1]));
      for (const c of cards) {
        const price = fmtUsd(c.price_usd);
        if (!text.includes(price)) continue;
        const isSubject = named.has(c.id) || text.includes(shortHardwareLabel(c)) || (ownId === c.id && !named.size);
        if (!isSubject) continue;
        // a complete computer at the same price on the same line: the figure is that one's
        const sharedWith = data.hardware.filter(
          (h) => h.id !== c.id && h.price_usd === c.price_usd && (named.has(h.id) || text.includes(shortHardwareLabel(h))),
        );
        if (sharedWith.length) continue;
        problems.push(`${p.path} prints ${price} for the ${shortHardwareLabel(c)} in a ${what} that does not say it is the card alone`);
      }
    }
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 10).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} card prices are printed as if they bought a whole computer`);
  }
  console.log(`  ${cards.length} card-priced machines, every price of one says so`);
}

/**
 * A table wider than a phone puts its last column off the right edge, where
 * nobody finds it. Every table on these pages therefore has to say how it reads
 * on a narrow screen: a head-to-head splits its width three ways, and everything
 * else is marked up by stack() to read as a block per row. A new table that says
 * neither stops the build rather than quietly hiding its pay-back column.
 */
function checkTables() {
  const loose = meta.flatMap((p) =>
    [...p.html.matchAll(/<table class="board([^"]*)"/g)]
      .filter((m) => !/\b(compare|stack)\b/.test(m[1]))
      .map(() => p.path),
  );
  if (loose.length) {
    const where = [...new Set(loose)];
    console.error(where.slice(0, 5).map((w) => `  ${w} has a table that says nothing about how it reads on a phone`).join('\n'));
    throw new Error(`${loose.length} tables on ${where.length} pages would swipe sideways on a phone`);
  }
  const stacked = meta.reduce((n, p) => n + (p.html.match(/<table class="board stack"/g)?.length ?? 0), 0);
  console.log(`  ${stacked} tables read as a block on a phone, the rest split their width`);
}

/**
 * The head-to-head index is the only page that lists every comparison, so a
 * comparison it leaves out is one a reader can reach only by already knowing
 * which two things to start from. Adding a machine family or a model adds
 * comparisons, and this is what stops them being added quietly.
 */
function checkCompareIndex() {
  const index = meta.find((p) => p.path === '/compare/');
  if (!index) throw new Error('no head-to-head index was written');
  const comparisons = paths.filter((p) => p.startsWith('/compare/') && p !== '/compare/');
  const missing = comparisons.filter((p) => !index.links.includes(p));
  if (missing.length) {
    console.error(missing.slice(0, 5).map((p) => `  the head-to-head index does not list ${p}`).join('\n'));
    throw new Error(`${missing.length} comparisons are missing from the head-to-head index`);
  }
  console.log(`  the head-to-head index lists all ${comparisons.length} comparisons`);
}

/**
 * Every head-to-head answers pay-back at one usage above the fold, and the section
 * below it answers the same question across the five levels the calculator names.
 * Two things can go quietly wrong there: a page can lose the section, and a figure a
 * machine is too slow to reach can print as though it were a race. Both stop the
 * build, on the machine pairs and on the model ones.
 *
 * A model head-to-head only has the section where one machine runs both models, which
 * is the same condition that gives it the side-by-side table above. Two of the 47 pairs
 * share no machine at the context the site assumes; they run both sections at the
 * shorter context where one machine does hold both, and checkMeetingPoint below is
 * what holds them to saying so.
 */
function checkPayback() {
  const levels = bestUsageLevels(data);
  const problems: string[] = [];
  const check = (path: string, heading: string, exempt = false) => {
    const html = meta.find((m) => m.path === path)?.html ?? '';
    const section = html.split(`<h2>${heading}</h2>`)[1]?.split('<h2>')[0];
    if (!section) {
      if (!exempt) problems.push(`${path} does not say how much use it takes to pay back`);
      return 0;
    }
    const rows = (section.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr>/g) ?? []).length;
    if (rows !== levels.length) problems.push(`${path} prices ${rows} levels of use, not the ${levels.length} the calculator names`);
    const capped = section.match(/its ceiling/g)?.length ?? 0;
    const explained = (section.match(/at most/g)?.length ?? 0) > 0;
    if (capped && !explained) problems.push(`${path} marks ${capped} figure${capped === 1 ? '' : 's'} as a ceiling without saying what the ceiling is`);
    return 1;
  };
  for (const [a, b] of hardwarePairs(data)) check(hardwareComparePath(a, b), 'How much use it takes to pay back');
  let priced = 0;
  for (const [a, b] of modelPairs(data)) {
    const path = modelComparePath(a, b);
    // no machine runs both, so there is no machine for either of them to pay for
    const noShared = !(meta.find((m) => m.path === path)?.html ?? '').includes('<h2>Side by side on the ');
    priced += check(path, 'How much use it takes to pay for the machine', noShared);
  }
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} head-to-head${problems.length === 1 ? '' : 's'} do not answer pay-back across the levels of use`);
  }
  const ceilings = meta.reduce((n, m) => n + (m.html.match(/its ceiling/g)?.length ?? 0), 0);
  console.log(`  ${hardwarePairs(data).length} machine and ${priced} model head-to-heads price pay-back at ${levels.length} levels of use, ${ceilings} figures capped by what a machine can generate`);
}

/**
 * Two model head-to-heads have no machine in common at 32k of context, so they used to
 * skip the like-for-like table and the pay-back-by-usage section that every other
 * comparison carries, and were the thinnest pages on the site at 409 and 504 words.
 * They are not thin because there is nothing to say: what puts the bigger model past
 * every machine is the cache, which shrinks with the context you ask for, and at 16k
 * one machine holds both. So those pages run the same two sections at that context.
 *
 * A page that quietly moved to a shorter context without saying so would be the worst
 * of both: figures that look like the ones above them and are not. The rule is that a
 * page running the race at a shorter context names that context in the heading, in the
 * assumptions, and in every calculator link those sections carry.
 */
function checkMeetingPoint() {
  const problems: string[] = [];
  let met = 0;
  for (const [a, b] of modelPairs(data)) {
    const path = modelComparePath(a, b);
    const html = meta.find((m) => m.path === path)?.html ?? '';
    const ra = runnersFor(a, data);
    const rb = runnersFor(b, data);
    if (cheapestRunsBoth(a, b, ra, rb)) continue;
    const meeting = meetAtShorterContext(a, b, data);
    if (!meeting) {
      // nothing here holds both at any context the calculator offers, so there is no
      // race to run and the page says only what each model needs
      if (html.includes('<h2>Side by side on the ')) problems.push(`${path} runs a side-by-side race on a machine that holds both at no context`);
      continue;
    }
    met++;
    const k = Math.round(meeting.ctx / 1024);
    if (!html.includes(`<h2>Side by side on the ${esc(shortHardwareLabel(meeting.shared.hw))} at ${k}k of context</h2>`))
      problems.push(`${path} meets at ${k}k on the ${shortHardwareLabel(meeting.shared.hw)} and its heading does not say so`);
    if (!html.includes(`are at ${k}k of context instead`))
      problems.push(`${path} runs its race at ${k}k and the assumptions still claim ${Math.round(data.defaults.context.default_tokens / 1024)}k`);
    // a link that opens the calculator at the default context would land the reader on
    // the configuration the page has just said does not fit
    const sections = html.split('<h2>Side by side on the ')[1]?.split('<h2>Machines that run one')[0] ?? '';
    const links = [...sections.matchAll(/href="\/\?([^"]+)"/g)].map((m) => unesc(m[1]));
    if (!links.length) problems.push(`${path} runs its race at ${k}k with no link into the calculator`);
    for (const q of links)
      if (!q.includes(`ctx=${meeting.ctx}`)) problems.push(`${path} links into the calculator at the wrong context: ${q}`);
  }
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} head-to-head${problems.length === 1 ? '' : 's'} run a race at a context they do not name`);
  }
  console.log(`  ${met} model head-to-head${met === 1 ? '' : 's'} with no machine in common at 32k run the race at the context where one holds both`);
}

/**
 * The 7 head-to-heads where both machines hold the same models used to stop at
 * "memory is not what separates them", which was true at 32k and left the next
 * question open. Memory can still separate two machines further up the context,
 * because the cache grows with every token you keep. The rule this holds them
 * to: a page whose two machines differ nowhere names no models and says so, and
 * a page where they do differ names every model they differ on, with the longest
 * context each machine holds it at, worked out again here from the data rather
 * than read back off the page.
 */
function checkHeadroom() {
  const problems: string[] = [];
  let named = 0;
  let flat = 0;
  for (const [a, b] of hardwarePairs(data)) {
    const st = defaultState(data);
    const va = computeView({ ...st, hw: a.id }, data);
    const vb = computeView({ ...st, hw: b.id }, data);
    // the other 21 pages answer with the models one machine holds and the other does not
    if (runsOnlyOn(va, vb).length || runsOnlyOn(vb, va).length) continue;
    const path = hardwareComparePath(a, b);
    const html = meta.find((m) => m.path === path)?.html ?? '';
    const rows = contextHeadroom(va.rows.map((r) => r.model), a, b, data);
    const section = html.split('<h2>The same models, not to the same length</h2>')[1]?.split('<h2>')[0] ?? '';
    if (!rows.length) {
      flat++;
      if (section) problems.push(`${path} holds both machines to the same length everywhere and still claims a difference`);
      if (!html.includes('<h2>Memory is not what separates them</h2>')) problems.push(`${path} does not say that memory separates the two machines nowhere`);
      continue;
    }
    named++;
    if (!section) {
      problems.push(`${path} takes ${rows.length} model${rows.length === 1 ? '' : 's'} further on one machine than the other and names none of them`);
      continue;
    }
    const printed = (section.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr>/g) ?? []).length;
    if (printed !== rows.length) problems.push(`${path} lists ${printed} models where the two machines reach different lengths, not the ${rows.length} they do`);
    for (const r of rows) {
      if (!section.includes(`>${esc(r.model.display_name)}</a>`)) problems.push(`${path} does not name ${r.model.display_name}, which the two machines take to different lengths`);
      for (const tokens of [r.a, r.b])
        if (tokens !== null && !section.includes(`<td>${ctxLabel(tokens)}</td>`))
          problems.push(`${path} does not print ${ctxLabel(tokens)}, the longest one of the machines holds ${r.model.display_name} at`);
    }
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} head-to-head${problems.length === 1 ? '' : 's'} do not say what the memory they do not share buys`);
  }
  console.log(`  ${named + flat} head-to-heads between machines holding the same models: ${named} name what the spare memory buys in context, ${flat} that it buys nothing`);
}

/**
 * A model page's table says what each machine does with the model at 32k of context.
 * That was the whole of it, and it left the question people actually ask next —
 * how long a window can this machine hold it at — to be guessed from the memory
 * figures on another page. The "Longest context" column answers it, and this is
 * what holds the column and the sentence above it to the data.
 *
 * Two ways it could go quietly wrong. A figure could drift from what fit() says,
 * which is the only thing that makes it worth printing. And the sentence could
 * claim a spread the table does not show, or miss one it does: on 32 of the 54
 * models the machines do reach different lengths, and on the rest they do not,
 * and those are opposite claims.
 *
 * The figure is also the way in, so there is a third: a page may not print one
 * length and send the reader to another, name the wrong machine or the wrong
 * model, or offer a way in to a length it has just said the machine does not
 * hold.
 */
function checkModelContexts() {
  const problems: string[] = [];
  let spread = 0;
  let level = 0;
  let links = 0;
  for (const m of data.models) {
    const perFamily = cheapestPerFamily(runnersFor(m, data));
    const path = `/models/${m.id}/`;
    const html = meta.find((p) => p.path === path)?.html ?? '';
    const section = html.split('<h2>Machines that run it</h2>')[1]?.split('<h2>')[0] ?? '';
    if (!perFamily.length) {
      if (section) problems.push(`${path} has a machines table and no machine on the list runs it`);
      continue;
    }
    if (!section) {
      problems.push(`${path} does not say what machines run it`);
      continue;
    }
    const lengths = perFamily.map((r) => longestContext(m, r.hw, data));
    const rows = section.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr>[\s\S]*?<\/tr>/g) ?? [];
    if (rows.length !== perFamily.length) {
      problems.push(`${path} lists ${rows.length} machines, not the ${perFamily.length} that run it`);
      continue;
    }
    rows.forEach((row, i) => {
      const want = lengths[i];
      const raw = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1]);
      const cells = raw.map((c) => c.replace(/<[^>]*>/g, '').trim());
      const printed = cells[3];
      const should = want == null ? 'unknown' : ctxLabel(want);
      if (printed !== should)
        problems.push(`${path} prints ${printed || 'nothing'} as the longest context on the ${hardwareLabel(perFamily[i].hw)}, where it holds this model to ${should}`);
      // a machine may never be shown taking a model past its own published limit
      if (want != null && m.max_context_tokens != null && want > m.max_context_tokens)
        problems.push(`${path} takes the ${hardwareLabel(perFamily[i].hw)} to ${ctxLabel(want)}, past this model's own ${ctxLabel(m.max_context_tokens)} limit`);
      // The printed length is the way in, so it opens the calculator on this
      // machine, this model and that length, and a length no machine holds
      // offers no way in at all.
      const cell = raw[3] ?? '';
      if (want == null) {
        if (/<a /.test(cell)) problems.push(`${path} links a longest context on the ${hardwareLabel(perFamily[i].hw)}, which holds this model at no length`);
      } else {
        const href = esc(calcLink({ hw: perFamily[i].hw.id, model: m.id, ctx: want }, data));
        if (!cell.includes(`href="${href}"`))
          problems.push(`${path} prints ${should} on the ${hardwareLabel(perFamily[i].hw)} and does not open the calculator on it at that length`);
        else links++;
      }
    });
    const known = lengths.filter((c): c is number => c != null);
    const differ = known.length > 1 && new Set(known).size > 1;
    const claims = section.includes('but not to the same length');
    if (differ !== claims)
      problems.push(
        differ
          ? `${path} reaches ${new Set(known).size} different lengths across its machines and says they are the same`
          : `${path} says its machines reach different lengths, and they all stop at ${ctxLabel(known[0])}`,
      );
    if (differ) {
      spread++;
      for (const tokens of [Math.min(...known), Math.max(...known)])
        if (!section.includes(`>${ctxLabel(tokens)}<`) && !section.includes(` ${ctxLabel(tokens)};`) && !section.includes(` ${ctxLabel(tokens)},`) && !section.includes(` ${ctxLabel(tokens)}.`))
          problems.push(`${path} does not name ${ctxLabel(tokens)}, one end of what its machines reach`);
    } else level++;
  }
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} fault${problems.length === 1 ? '' : 's'} in what model pages say about how far each machine takes the context`);
  }
  console.log(`  ${spread + level} model pages give each machine's longest context: ${spread} where the machines differ, ${level} where they do not`);
  console.log(`  ${links} of those lengths open the calculator on that machine and model at that length`);
}

/**
 * The mirror of checkModelContexts, from the machine's side. A machine page now
 * says how long a window it holds each model at, and which of those figures its
 * own memory is what stopped. Both are recomputed here from fit() rather than read
 * back off the page, because a stale figure would read as a measurement.
 *
 * The tag matters as much as the figure. A model that stops at 32k because the
 * machine is full says something about the machine; one that stops at 32k because
 * its own ceiling is 40k says nothing at all, and printing them alike would sell a
 * machine on a limit it did not set.
 */
function checkMachineContexts() {
  const problems: string[] = [];
  const longestOffered = Math.max(...data.defaults.context.options);
  let capped = 0;
  let free = 0;
  let links = 0;
  for (const hw of data.hardware) {
    const path = `/hardware/${hw.id}/`;
    const html = meta.find((p) => p.path === path)?.html ?? '';
    const section = html.split('<h2>What it runs</h2>')[1]?.split('<h2>')[0] ?? '';
    const view = computeView({ ...defaultState(data), hw: hw.id }, data);
    const shown = view.rows.filter((r) => r.fit.status === 'fits').slice(0, 12);
    if (!shown.length) {
      if (section) problems.push(`${path} has a "What it runs" table and nothing on the list fits it`);
      continue;
    }
    if (!section) {
      problems.push(`${path} does not say what it runs`);
      continue;
    }
    const rows = section.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr>[\s\S]*?<\/tr>/g) ?? [];
    if (rows.length !== shown.length) {
      problems.push(`${path} lists ${rows.length} models, not the ${shown.length} it shows`);
      continue;
    }
    const memory: string[] = [];
    rows.forEach((row, i) => {
      const m = shown[i].model;
      const want = longestContext(m, hw, data);
      const cell = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1])[5] ?? '';
      const printed = cell.replace(/<span class="c-quant">memory<\/span>/, '').replace(/<[^>]*>/g, '').trim();
      const should = want == null ? 'unknown' : ctxLabel(want);
      if (printed !== should)
        problems.push(`${path} prints ${printed || 'nothing'} as the longest context for ${m.display_name}, where this machine holds it to ${should}`);
      // a machine may never be shown taking a model past its own published limit
      if (want != null && m.max_context_tokens != null && want > m.max_context_tokens)
        problems.push(`${path} takes ${m.display_name} to ${ctxLabel(want)}, past that model's own ${ctxLabel(m.max_context_tokens)} limit`);
      const isMemory = want != null && contextCappedBy(m, want, data) === 'memory';
      const tagged = cell.includes('>memory<');
      if (isMemory !== tagged)
        problems.push(
          isMemory
            ? `${path} does not say that this machine's memory is what stops ${m.display_name} at ${should}`
            : `${path} blames this machine's memory for stopping ${m.display_name} at ${should}, which is that model's own limit or the end of the list`,
        );
      if (isMemory) memory.push(m.display_name);
      // The figure is the way in as well as the answer: it opens the calculator
      // on this machine, this model and that length. So a page may not print one
      // length and send the reader to another, and it may not offer a way in to a
      // length it has just said this machine does not hold.
      if (want == null) {
        if (/<a /.test(cell)) problems.push(`${path} links a longest context for ${m.display_name}, which it holds at no length`);
      } else {
        const href = esc(calcLink({ hw: hw.id, model: m.id, ctx: want }, data));
        if (!cell.includes(`href="${href}"`))
          problems.push(`${path} prints ${should} for ${m.display_name} and does not open the calculator on it at that length`);
        else links++;
      }
    });
    const claimsFree = section.includes('Memory never runs out first here');
    if (claimsFree === (memory.length > 0))
      problems.push(
        memory.length
          ? `${path} says memory never runs out first, and it stops ${memory.length} of the models it lists`
          : `${path} does not say that memory never runs out first, and on none of the models it lists does it`,
      );
    if (memory.length) {
      capped++;
      const shortest = shown
        .filter((r) => memory.includes(r.model.display_name))
        .sort((a, b) => longestContext(a.model, hw, data)! - longestContext(b.model, hw, data)!)[0];
      const at = ctxLabel(longestContext(shortest.model, hw, data)!);
      if (!section.includes(`On ${memoryCount(memory.length)} of the ${shown.length} below`))
        problems.push(`${path} does not say how many of the models it lists its own memory stops, which is ${memory.length} of ${shown.length}`);
      if (!section.includes(`${esc(shortest.model.display_name)} stops soonest, at ${at}`))
        problems.push(`${path} does not name ${shortest.model.display_name} at ${at}, the shortest window its memory leaves`);
    } else free++;
    // Only a page that actually takes a model to the end of the list may name it.
    const reaches = shown.some((r) => longestContext(r.model, hw, data) === longestOffered);
    if (reaches !== section.includes(`${ctxLabel(longestOffered)}, where the calculator's list ends`))
      problems.push(
        reaches
          ? `${path} does not name ${ctxLabel(longestOffered)}, which it takes at least one model to`
          : `${path} names ${ctxLabel(longestOffered)} as somewhere its models reach, and it takes none of them there`,
      );
  }
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} fault${problems.length === 1 ? '' : 's'} in what machine pages say about how far they take the context`);
  }
  console.log(`  ${capped + free} machine pages say how far they take each model: ${capped} where their own memory stops one, ${free} where it never does`);
  console.log(`  ${links} of those lengths open the calculator on that machine and model at that length`);
}

/**
 * The site prices everything at one context, and for a long time that context
 * decided what a machine was said to run. It is a setting, not a property of the
 * hardware: 33 machine-and-model pairs miss at that length and fit at a shorter
 * one, and a page that leaves them out tells a reader the machine cannot run a
 * model it can. So every figure in the section that says so is recomputed from
 * fit() here rather than read back off the page, and both sides are held: a page
 * that has models to name must name them all, and a page that has none may not
 * claim any.
 */
function checkShorterFits() {
  const problems: string[] = [];
  const ctx = data.defaults.context.default_tokens;
  let pages = 0;
  let links = 0;
  for (const hw of data.hardware) {
    const path = `/hardware/${hw.id}/`;
    const html = meta.find((p) => p.path === path)?.html ?? '';
    const view = computeView({ ...defaultState(data), hw: hw.id }, data);
    const want = fitsShorter(hw, view.rows.map((r) => r.model), data);
    const found = html.match(/<h2>(\w+) more, at a shorter window<\/h2>([\s\S]*?)(?=<h2>|<\/article>)/);
    const claimed = html.includes(`more if you keep the window shorter than ${ctxLabel(ctx)}`);
    if (!want.length) {
      if (found) problems.push(`${path} names models it holds at a shorter window, and there are none`);
      if (claimed) problems.push(`${path} counts models it holds at a shorter window in its opening line, and there are none`);
      continue;
    }
    if (!claimed) problems.push(`${path} does not say in its opening line that ${want.length} more models fit at a shorter window`);
    else if (!html.includes(`, and ${numberWord(want.length)} more if you keep the window shorter than ${ctxLabel(ctx)}`))
      problems.push(`${path} does not count the ${want.length} models it holds at a shorter window correctly in its opening line`);
    if (!found) {
      problems.push(`${path} holds ${want.length} more models at a shorter window and does not say so`);
      continue;
    }
    pages++;
    if (found[1] !== sentenceCase(numberWord(want.length)))
      problems.push(`${path} heads that section "${found[1]} more", where ${want.length} models fit at a shorter window`);
    const rows = found[2].match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr>[\s\S]*?<\/tr>/g) ?? [];
    if (rows.length !== want.length) {
      problems.push(`${path} lists ${rows.length} models it holds at a shorter window, not the ${want.length} it does`);
      continue;
    }
    rows.forEach((row, i) => {
      const r = want[i];
      const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1]);
      const text = (c: string) => (c ?? '').replace(/<span class="c-quant">[\s\S]*?<\/span>/g, '').replace(/<[^>]*>/g, '').trim();
      if (!(cells[0] ?? '').includes(`href="/models/${esc(r.model.id)}/"`))
        problems.push(`${path} does not name ${r.model.display_name} in the row it holds at ${ctxLabel(r.ctx)}`);
      if (text(cells[1]) !== ctxLabel(r.ctx))
        problems.push(`${path} prints ${text(cells[1]) || 'nothing'} as the longest window it holds ${r.model.display_name} at, where it holds it to ${ctxLabel(r.ctx)}`);
      if (text(cells[2]) !== fmtGb(r.needGb))
        problems.push(`${path} prints ${text(cells[2]) || 'nothing'} as what ${r.model.display_name} needs at ${ctxLabel(r.ctx)}, where it needs ${fmtGb(r.needGb)}`);
      if (text(cells[3]) !== fmtGb(r.needAtDefaultGb))
        problems.push(`${path} prints ${text(cells[3]) || 'nothing'} as what ${r.model.display_name} needs at ${ctxLabel(ctx)}, where it needs ${fmtGb(r.needAtDefaultGb)}`);
      // the window is the way in as well as the answer, and it may only open one
      // this machine actually holds
      const href = esc(calcLink({ hw: hw.id, model: r.model.id, ctx: r.ctx }, data));
      if (!(cells[1] ?? '').includes(`href="${href}"`))
        problems.push(`${path} prints ${ctxLabel(r.ctx)} for ${r.model.display_name} and does not open the calculator on it at that window`);
      else links++;
    });
  }

  // the model side: a model nothing holds at the default context, on the machine
  // that holds it once the window is shorter
  let models = 0;
  for (const m of data.models) {
    const path = `/models/${m.id}/`;
    const html = meta.find((p) => p.path === path)?.html ?? '';
    const runners = runnersFor(m, data);
    const heading = html.match(/<h2>It fits at (\d+k) of context<\/h2>([\s\S]*?)(?=<h2>|<\/article>)/);
    if (runners.length) {
      if (heading) problems.push(`${path} says the window is what stops it, and machines here run it at ${ctxLabel(ctx)}`);
      continue;
    }
    let want: { ctx: number; hw: Hardware } | null = null;
    for (const shorter of [...data.defaults.context.options].filter((c) => c < ctx).sort((a, b) => b - a)) {
      const found = cheapestPerFamily(runnersFor(m, data, { ctx: shorter }));
      if (found.length) { want = { ctx: shorter, hw: found[0].hw }; break; }
    }
    if (!want) {
      if (heading) problems.push(`${path} says a shorter window makes it fit, and no machine here holds it at any length`);
      continue;
    }
    if (!heading) {
      problems.push(`${path} says nothing runs it, and the ${hardwareLabel(want.hw)} holds it at ${ctxLabel(want.ctx)}`);
      continue;
    }
    models++;
    if (heading[1] !== ctxLabel(want.ctx))
      problems.push(`${path} says it fits at ${heading[1]}, where the longest window a machine here holds it at is ${ctxLabel(want.ctx)}`);
    if (!heading[2].includes(esc(hardwareLabel(want.hw))))
      problems.push(`${path} does not name the ${hardwareLabel(want.hw)}, the cheapest machine that holds it at ${ctxLabel(want.ctx)}`);
    const href = esc(calcLink({ hw: want.hw.id, model: m.id, ctx: want.ctx }, data));
    if (!heading[2].includes(`href="${href}"`))
      problems.push(`${path} does not open the calculator on the ${hardwareLabel(want.hw)} at ${ctxLabel(want.ctx)}`);
    else links++;
  }

  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} fault${problems.length === 1 ? '' : 's'} in what the pages say about a shorter window`);
  }
  console.log(`  ${pages} machine pages name the models they hold below ${ctxLabel(ctx)}, ${models} model page${models === 1 ? '' : 's'} the machine that holds them there`);
  console.log(`  ${links} of those windows open the calculator on that machine and model at that window`);
}

function checkArticles() {
  // English picks the article from the sound, so a page opening "Can a NVIDIA…"
  // reads as a typo on its own first line. indefiniteArticle() knows which
  // names are spelt out letter by letter; this is what holds the pages to it.
  const machines = meta.filter((p) => p.path.startsWith('/hardware/'));
  const opened = machines.map((p) => ({
    path: p.path,
    h1: p.html.match(/<h1>Can (an?) ([^<]+?) run local LLMs\?<\/h1>/),
  }));
  const problems = opened.flatMap(({ path, h1 }) => {
    if (!h1) return [`  ${path} does not open by asking whether the machine runs local LLMs`];
    const want = indefiniteArticle(h1[2]);
    return h1[1] === want ? [] : [`  ${path} opens "Can ${h1[1]} ${h1[2]}", which wants "${want}"`];
  });
  if (problems.length) {
    console.error(problems.slice(0, 5).join('\n'));
    throw new Error(`${problems.length} machine pages open with the wrong article`);
  }
  const an = opened.filter(({ h1 }) => h1![1] === 'an').length;
  console.log(`  ${machines.length} machine pages open on their own name, ${an} of them with "an"`);
}

/**
 * A machine page lists the twelve strongest models that fit it, in index-class
 * order, which puts every model the index has not scored yet below the cut. On
 * all but the smallest machines that hid all five of them, and three — Kat
 * Coder v2.5, Laguna XS 2.1 and Ornith 1.5 35B-A3B — were in no machine's first
 * twelve at all, leaving each of their pages with exactly one inbound link on
 * the whole site. The note under the table names them now. The rule this holds
 * is the simple one: if a model fits a machine, that machine's page links it,
 * whether it made the table or not.
 */
function checkHiddenModels() {
  const problems: string[] = [];
  let named = 0;
  for (const hw of data.hardware) {
    const path = `/hardware/${hw.id}/`;
    const page = meta.find((p) => p.path === path);
    if (!page) throw new Error(`no page written for ${path}`);
    for (const r of fitsOn(hw)) {
      if (r.model.frontier_equivalent?.score != null) continue;
      const href = `/models/${r.model.id}/`;
      if (page.links.includes(href)) named++;
      else problems.push(`${path} does not link ${href}, a model with no index score that fits it`);
    }
  }
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} unscored model${problems.length === 1 ? ' fits a machine whose page does' : 's fit a machine whose page does'} not link it`);
  }
  console.log(`  ${named} machine-and-unscored-model pairs, every one of them a link on the machine's page`);
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

// The same thing for models. A pair is always [higher, lower] on the index, so
// each model knows whether the one it is set against is the rung above it or
// the rung below, and its page can say which.
const modelHeadToHeads = new Map<string, { href: string; other: Model; side: 'above' | 'below' }[]>();
for (const [a, b] of modelPairs(data)) {
  const href = modelComparePath(a, b);
  for (const [self, other, side] of [[a, b, 'below'], [b, a, 'above']] as const)
    modelHeadToHeads.set(self.id, [...(modelHeadToHeads.get(self.id) ?? []), { href, other, side }]);
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
  <td class="c-tier">${tierScale(m, data)} ${tierLabel(m, data)}</td>
  <td class="c-caps">${dotRow(m)}</td>
  <td class="c-gb">${fmtGb(m.weights_gb)}</td>
  <td class="c-hw">${cheapest ? `<a href="/hardware/${esc(cheapest.hw.id)}/">${esc(hardwareLabel(cheapest.hw))}</a> <span class="dim">${fmtUsd(cheapest.hw.price_usd)}${cheapest.hw.price_scope === 'card_only' ? ', card only' : ''}</span>` : '<span class="dim">nothing on the list</span>'}</td>
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
<p class="lede">${unique.length} open-weight models you can download and run at home, ranked on the ${esc(data.defaults.frontier_basis?.name ?? 'intelligence index')}, with the hosted models from Anthropic and OpenAI dropped into the same table for scale. Each row links to what it takes to run it. For which machine pays back soonest at each level, see <a href="/best/">best buys by usage</a>; for two of them side by side, <a href="/compare/">every head-to-head</a>.</p>
${gap != null ? `<p>The short version: the best open model here scores <b>${best.frontier_equivalent!.score}</b> — that is ${esc(best.display_name)}, and it wants ${fmtGb(best.weights_gb)} of memory. The best hosted model scores <b>${refs[0].score}</b>. That gap of ${gap} points is the thing no amount of hardware closes.</p>` : ''}
${stack(`<table class="board">
<thead><tr><th>Model</th><th>Score</th><th>Class</th><th>Good at</th><th>Weights</th><th>Cheapest machine that runs it</th><th>Next down</th></tr></thead>
<tbody>${frontierRows}${rows}</tbody>
</table>`, { fig: 1, labels: { 5: 'Cheapest', 6: 'Then' } })}
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
${stack(`<table class="board">
<thead><tr><th>Model</th><th>Machine</th><th>Speed</th><th>Pays back in</th><th></th></tr></thead>
<tbody>${rows}</tbody>
</table>`, { fig: 3 })}
</section>`;
    })
    .join('\n');

  const body = `<article class="prose">
<h1>Best buys: the quickest pay-back at each level of capability</h1>
<p class="lede">For each amount of daily use, the machines and models that pay for themselves soonest, grouped by how capable the model is. Each model appears once, on its quickest machine.</p>
${head ? `<p>The short version: at ${esc(fmtTokens(headLevel.usage))} tokens a day (${esc(headLevel.label)}), the quickest ${esc(headTier!.label)} pay-back is ${esc(head.model.display_name)} on a ${esc(hardwareLabel(head.hw))}, in <b>${esc(fmtDuration(head.days))}</b>.</p>` : ''}
<p class="note">Jump to: ${levels.map((l) => `<a href="#${anchor(l.usage)}">${esc(fmtTokens(l.usage))}/day</a>`).join(' · ')}</p>
${sections}
<p class="note">Current machines at list price and current models only. Graphics cards are priced as the card alone, so add the PC around it before comparing them with a complete computer. Every row uses ${esc(String(d.usage.default_input_to_output_ratio))}:1 input to output, $${esc(String(d.electricity.default_price_per_kwh_usd))} per kWh, ${Math.round(d.context.default_tokens / 1024)}k of context, and today's API prices held flat; switch on falling API prices in the calculator and the years stretch. Speeds marked <i>estimated</i> are worked out from memory bandwidth rather than measured, and pay-back scales with them. Models nobody rents are priced as their closest hosted match and say so. Scores are the ${esc(d.frontier_basis?.name ?? 'intelligence index')}; * marks a score the index estimated. Open any row to change the assumptions, or set two machines or two models against each other in <a href="/compare/">the head-to-heads</a>.</p>
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

/**
 * A model that fits nothing at the context this site prices everything at, on the
 * machine that does hold it once the window is shorter. The weights are the whole
 * of the footprint that cannot move; everything the shorter window saves comes out
 * of the cache, so the page shows both figures and lets a reader add them up.
 */
function shorterWindowRun(m: Model, run: { ctx: number; runner: Runner }, ctx: number): string {
  const hw = run.runner.hw;
  const view = run.runner.view;
  const tps = view.throughput?.tokensPerSec ?? null;
  const cacheAt = kvCacheGb(m, ctx);
  const cacheThere = kvCacheGb(m, run.ctx);
  const cost = view.calc?.breakevenDays == null
    ? `it never pays for itself against the API at ordinary usage`
    : `${lowerFirst(verdictLine(view))} at ${fmtTokens(defaultState(data).usage)} tokens a day`;
  return `<h2>It fits at ${ctxLabel(run.ctx)} of context</h2>
<p>Every figure above is taken at ${ctxLabel(ctx)}, where ${esc(m.display_name)} needs ${fmtGb((m.weights_gb ?? 0) + (cacheAt ?? 0))}. The weights are ${fmtGb(m.weights_gb)} of that and they do not move; the rest is the key-value cache, which grows with every token you keep. Ask for ${ctxLabel(run.ctx)} instead and the cache falls from ${fmtGb(cacheAt)} to ${fmtGb(cacheThere)}, so the model needs ${fmtGb((m.weights_gb ?? 0) + (cacheThere ?? 0))}, which the ${esc(hardwareLabel(hw))} holds in its ${hw.usable_memory_gb} GB. At ${priceWithScopeText(hw)}${tps == null ? '' : ` it runs at ${fmtNum(tps, tps < 10 ? 1 : 0)} tok/s`} and ${cost}.</p>
<p><a class="cta" href="${esc(calcLink({ hw: hw.id, model: m.id, ctx: run.ctx }, data))}">Run ${esc(m.display_name)} at ${ctxLabel(run.ctx)} on the ${esc(hardwareLabel(hw))}</a></p>

`;
}

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

  // Every machine in this table holds the model at the context the page assumes,
  // and that is where the page used to stop. The weights are the same on all of
  // them; the KV cache is not, because it grows with every token you keep, so the
  // memory a machine has left over is how far it takes the context. On 32 of the
  // 54 models these machines do not all reach the same length.
  const reach = new Map(perFamily.map((r) => [r.hw.id, longestContext(m, r.hw, data)] as const));
  const lengths = [...reach.values()].filter((c): c is number => c != null);
  const furthest = lengths.length ? Math.max(...lengths) : null;
  const shortest = lengths.length ? Math.min(...lengths) : null;
  const atLength = (tokens: number) => perFamily.find((r) => reach.get(r.hw.id) === tokens)!;
  // A figure only says something about the machine where memory is what stopped it.
  // A model's own limit rarely falls on a setting the calculator offers — Qwen3 32B
  // stops at 40k — so where it does not, the figure is the last setting below that
  // limit and saying "its ceiling" would be a gigabyte of wishful rounding.
  const capNote = (tokens: number) => {
    const limit = m.max_context_tokens;
    const own = limit === tokens ? `this model's own ceiling` : `the longest setting below this model's own ${limit ? ctxLabel(limit) : ''} limit`;
    switch (contextCappedBy(m, tokens, data)) {
      case 'model':
        return `, ${own}`;
      case 'both':
        return `, which is ${own} and the longest the calculator offers`;
      case 'list':
        return `, the longest the calculator offers`;
      default:
        return '';
    }
  };

  // The length is the link, the way it is on the machine pages. Every other figure
  // in this row is priced at the context the page assumes, and the row's own "Run
  // the numbers" link opens there, which is what makes the row reproducible. This
  // one is the other question, so it opens the calculator on that machine at the
  // length printed beside it rather than sending a reader who has just read off
  // 128k to the 32k everything else is quoted at.
  const hwRows = perFamily
    .map((r) => {
      const t = r.view.throughput;
      const holds = reach.get(r.hw.id);
      return `<tr>
  <td class="c-hw"><a href="/hardware/${esc(r.hw.id)}/">${esc(hardwareLabel(r.hw))}</a></td>
  <td>${priceWithScope(r.hw)}</td>
  <td>${t?.tokensPerSec == null ? '<span class="dim">unknown</span>' : `${fmtNum(t.tokensPerSec, t.tokensPerSec < 10 ? 1 : 0)} tok/s <span class="dim">${esc(t.measurement)}</span>`}</td>
  <td>${holds == null ? '<span class="dim">unknown</span>' : `<a href="${esc(calcLink({ hw: r.hw.id, model: m.id, ctx: holds }, data))}">${ctxLabel(holds)}</a>`}</td>
  <td>${esc(verdictLine(r.view))}</td>
  <td><a href="${esc(calcLink({ hw: r.hw.id, model: m.id }, data))}">Run the numbers</a></td>
</tr>`;
    })
    .join('');

  // what the new column adds up to, said before the table rather than left to be read out of it
  const lengthLine = (() => {
    if (furthest == null || shortest == null) return '';
    const cap = capNote(furthest);
    const limit = m.max_context_tokens;
    if (perFamily.length === 1) {
      const only = esc(hardwareLabel(perFamily[0].hw));
      // with nothing to compare it against, the useful part is which of the two ran out
      const stops = cap || (limit ? `, and it is the machine's memory that stops it there, not the model's ${ctxLabel(limit)} limit` : '');
      return `<p>The ${only} holds it to ${ctxLabel(furthest)}${stops}.</p>`;
    }
    if (furthest === shortest)
      return `<p>Every machine here holds it to ${ctxLabel(furthest)}${cap || ' and no further'}, so the choice between them is speed and price rather than how much you can keep in the window.</p>`;
    return `<p>Every machine here runs it, but not to the same length. The ${esc(hardwareLabel(atLength(shortest).hw))} stops at ${ctxLabel(shortest)}; the ${esc(hardwareLabel(atLength(furthest).hw))} takes it to ${ctxLabel(furthest)}${cap}. The weights are the same size on every machine; what differs is the memory left for the key-value cache, which grows with every token you keep.</p>`;
  })();

  const fe = m.frontier_equivalent;
  const ce = m.cloud_equivalent;
  const ctx = data.defaults.context.default_tokens;
  // A model no machine holds at the context this page prices everything at is not
  // the same thing as a model nothing here runs. The weights are a fixed size and
  // the cache is not, so a shorter window can be the whole difference — and saying
  // only "nothing runs it" answers the wrong question for a reader who would have
  // been happy with one.
  const shorterRun = (() => {
    if (runners.length) return null;
    for (const shorter of [...data.defaults.context.options].filter((c) => c < ctx).sort((a, b) => b - a)) {
      const found = cheapestPerFamily(runnersFor(m, data, { ctx: shorter }));
      if (found.length) return { ctx: shorter, runner: found[0] };
    }
    return null;
  })();
  const alsoAt = otherQuantisations(m, data);

  // The two head-to-heads this model is in, named from its own point of view.
  // Machine pages have carried their match-ups from the start; these were
  // reachable only from the leaderboard's last column.
  const versus = modelHeadToHeads.get(m.id) ?? [];
  const above = versus.find((v) => v.side === 'above');
  const below = versus.find((v) => v.side === 'below');
  const versusLink = (v: { href: string; other: Model }) => `<a href="${esc(v.href)}">vs ${esc(v.other.display_name)}</a>`;
  const versusLine =
    above && below
      ? `<p class="note">Head to head with its neighbours on the leaderboard: ${versusLink(above)} above it, ${versusLink(below)} below.</p>`
      : below
        ? `<p class="note">Head to head: ${versusLink(below)}, the next model down the leaderboard.</p>`
        : above
          ? `<p class="note">Head to head: ${versusLink(above)}, the next model up the leaderboard.</p>`
          : '';
  const body = `<article class="prose">
<h1>What hardware do you need to run ${esc(m.display_name)}?</h1>
<p class="lede">${esc(m.display_name)} at ${esc(m.quantisation)} is ${fmtGb(m.weights_gb)} of weights${m.max_context_tokens ? `, with a context ceiling of ${Math.round(m.max_context_tokens / 1024)}k tokens` : ''}. ${esc(m.capability_note)}</p>

${cheapest
      ? `<div class="answer">
  <div class="answer-row"><span class="answer-k">Cheapest machine that runs it</span><span class="answer-v"><a href="/hardware/${esc(cheapest.hw.id)}/">${esc(hardwareLabel(cheapest.hw))}</a> at ${priceWithScope(cheapest.hw)}</span></div>
  ${bestValue && bestValue.hw.id !== cheapest.hw.id ? `<div class="answer-row"><span class="answer-k">Shortest pay-back</span><span class="answer-v"><a href="/hardware/${esc(bestValue.hw.id)}/">${esc(hardwareLabel(bestValue.hw))}</a> — ${esc(verdictLine(bestValue.view))}</span></div>` : ''}
  ${fastest ? `<div class="answer-row"><span class="answer-k">Fastest of the ones listed</span><span class="answer-v"><a href="/hardware/${esc(fastest.hw.id)}/">${esc(hardwareLabel(fastest.hw))}</a> — ${fmtNum(fastest.view.throughput!.tokensPerSec, 0)} tok/s at ${Math.round(ctx / 1024)}k context</span></div>` : ''}
  <div class="answer-row"><span class="answer-k">Honest answer on cost</span><span class="answer-v">${cheapest.view.calc?.breakevenDays == null ? 'Against the API, buying hardware for this model never pays for itself at ordinary usage.' : `${esc(verdictLine(cheapest.view))} at ${fmtTokens(defaultState(data).usage)} tokens a day.`}</span></div>
</div>`
      : `<div class="answer">
  <div class="answer-row"><span class="answer-k">Nothing runs it at ${ctxLabel(ctx)}</span><span class="answer-v">At ${Math.round(ctx / 1024)}k context it needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, ctx) ?? 0))}, more than any machine here offers.</span></div>
  ${shorterRun
        ? `<div class="answer-row"><span class="answer-k">Shorten the window and it fits</span><span class="answer-v"><a href="/hardware/${esc(shorterRun.runner.hw.id)}/">${esc(hardwareLabel(shorterRun.runner.hw))}</a> holds it at ${ctxLabel(shorterRun.ctx)}, where it needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, shorterRun.ctx) ?? 0))}</span></div>
  <div class="answer-row"><span class="answer-k">Honest answer on cost</span><span class="answer-v">${shorterRun.runner.view.calc?.breakevenDays == null ? `Against the API, buying ${priceWithScopeText(shorterRun.runner.hw)} of hardware for this model never pays for itself at ordinary usage.` : `${esc(verdictLine(shorterRun.runner.view))} at ${fmtTokens(defaultState(data).usage)} tokens a day.`}</span></div>`
        : ''}
</div>`}

<h2>How good is it, really?</h2>
<p>${fe?.score != null
      ? `On the ${esc(data.defaults.frontier_basis?.name ?? 'intelligence index')} it scores <b>${fe.score}</b>${fe.score_note ? ` (${esc(fe.score_note)})` : ''}, which puts it in the <b>${esc(tierName(m, data))}</b> band. ${esc(data.defaults.frontier_tiers[fe.tier ?? 0].plain)}`
      : 'It has not been placed on the intelligence index yet.'}
${fe?.url ? ` <a href="${esc(fe.url)}" rel="noopener">Score source</a>.` : ''} <a href="/leaderboard/">See the whole table</a>.</p>
<ul class="caps">${caps}</ul>
${versusLine}
<h2>What it costs either way</h2>
<p>${ce.stand_in ? `Nobody rents ${esc(m.display_name)} by the token. The closest hosted match, ${esc(ce.name)},` : `Renting the same model${ce.is_exact_match ? '' : ' (or the nearest hosted equivalent, ' + esc(ce.name) + ')'}`} costs <b>$${ce.input_price_per_mtok}</b> per million input tokens and <b>$${ce.output_price_per_mtok}</b> per million output${ce.source_url ? ` (<a href="${esc(ce.source_url)}" rel="noopener">${esc(ce.source)}</a>, checked ${esc(ce.checked ?? '')})` : ''}. Buying a machine only beats that if you use it hard enough, for long enough, that the hardware price divides down below the rental bill.</p>

${shorterRun ? shorterWindowRun(m, shorterRun, ctx) : ''}${hwRows ? `<h2>Machines that run it</h2>
${lengthLine}
${stack(`<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Speed at ${Math.round(ctx / 1024)}k</th><th>Longest context</th><th>Pay-back</th><th></th></tr></thead>
<tbody>${hwRows}</tbody>
</table>`, { fig: 4 })}
<p class="note">One machine per family, cheapest first. Speeds are measured where a public benchmark exists and estimated from memory bandwidth otherwise; the calculator says which for any configuration. The longest context is the longest setting the calculator offers that the machine still holds this model at, cache included${m.max_context_tokens ? `, and no machine is shown taking it past its own ${Math.round(m.max_context_tokens / 1024)}k limit` : ''}. Each one opens the calculator on that machine at that length.</p>
${furthest != null && furthest > ctx ? `<p><a class="cta" href="${esc(calcLink({ hw: atLength(furthest).hw.id, model: m.id, ctx: furthest }, data))}">Run ${esc(m.display_name)} at ${ctxLabel(furthest)} on the ${esc(hardwareLabel(atLength(furthest).hw))}</a></p>` : ''}` : ''}

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
    ? `${m.display_name} needs ${fmtGb(m.weights_gb)} of weights. The cheapest machine that runs it is ${shortHardwareLabel(cheapest.hw)} at ${priceWithScopeText(cheapest.hw)}`
    : '';
  const verdict = cheapest?.view.calc ? lowerFirst(verdictLine(cheapest.view)) : null;
  // a terser way of saying the same thing, so a long model name or a price that
  // has to state its scope costs the pay-back clause rather than keeping the wording
  const shortLead = `${m.display_name} needs ${fmtGb(m.weights_gb)} of weights. Cheapest that runs it: ${cheapest ? `${shortHardwareLabel(cheapest.hw)} at ${priceWithScopeText(cheapest.hw)}` : ''}`;
  const desc = cheapest
    ? descOf([
        ...(verdict
          ? [`${lead}, where it ${verdict} at ${usage} tokens a day.`, `${lead}, where it ${verdict}.`, `${shortLead}, where it ${verdict}.`]
          : []),
        `${lead}.`,
        `${m.display_name} needs ${fmtGb(m.weights_gb)} of weights. Cheapest machine that runs it: ${shortHardwareLabel(cheapest.hw)}.`,
      ])
    : descOf([
        ...(shorterRun
          ? (() => {
              const where = `${indefiniteArticle(shortHardwareLabel(shorterRun.runner.hw))} ${shortHardwareLabel(shorterRun.runner.hw)}`;
              const need = fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, ctx) ?? 0));
              return [
                `${m.display_name} needs ${need} at ${ctxLabel(ctx)} context, more than any machine here offers. At ${ctxLabel(shorterRun.ctx)} it fits ${where}.`,
                `${m.display_name} needs ${need} at ${ctxLabel(ctx)}, more than any machine here. At ${ctxLabel(shorterRun.ctx)} it fits ${where}.`,
              ];
            })()
          : []),
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

/**
 * What to say about the models that fit but are below the table. A count on its
 * own is a dead end; the ones worth naming are those the intelligence index has
 * not scored, because a table ordered by class is exactly what buries them.
 */
function runsOnNote(hiddenCount: number, unscored: Model[], link: (m: Model) => string): string {
  const more = hiddenCount === 1 ? 'One more fits; the calculator lists it.' : `${hiddenCount} more fit; the calculator lists them all.`;
  if (!unscored.length) return more;
  if (hiddenCount === 1)
    return `One more fits: ${link(unscored[0])}, which has no intelligence-index score, so it sits below the twelve above. Its page shows what it needs and what runs it.`;
  if (unscored.length === 1)
    return `${more} One of them, ${link(unscored[0])}, has no intelligence-index score, so it sits below the twelve above. Its page shows what it needs and what runs it.`;
  return `${more} ${unscored.length} of them have no intelligence-index score, so they sit below the twelve above: ${unscored.map(link).join(', ')}. Their pages show what each one needs and what runs it.`;
}

/** How many of the models in a machine's table its own memory stops, as the page writes it. */
const memoryCount = (n: number) => (n === 1 ? 'one' : String(n));

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n);
const sentenceCase = (s: string) => s[0].toUpperCase() + s.slice(1);

/**
 * A machine's table counts what fits at the context the site prices everything
 * at, and that count was the whole of the page's answer. On 19 of the 56
 * machines it is not the whole answer: a model can miss at 32k and fit at 16k
 * or 8k, because the weights are the same size either way and the cache is not.
 * Leaving those models out reads as "it cannot run this" to someone who would
 * have been happy with a shorter window, which is the wrong answer to the
 * question they came with.
 */
function shorterWindowSection(hw: Hardware, rows: ShorterFit[], ctx: number): string {
  if (!rows.length) return '';
  const body = rows
    .map(
      (r) => `<tr>
  <td class="c-model"><a href="/models/${esc(r.model.id)}/">${esc(r.model.display_name)}</a><span class="c-quant">${esc(r.model.quantisation)}</span></td>
  <td><a href="${esc(calcLink({ hw: hw.id, model: r.model.id, ctx: r.ctx }, data))}">${ctxLabel(r.ctx)}</a></td>
  <td>${fmtGb(r.needGb)}</td>
  <td>${fmtGb(r.needAtDefaultGb)}</td>
</tr>`,
    )
    .join('');
  return `<h2>${sentenceCase(numberWord(rows.length))} more, at a shorter window</h2>
<p>The table above counts what fits at ${ctxLabel(ctx)}, the context the calculator starts on. ${sentenceCase(numberWord(rows.length))} more ${rows.length === 1 ? 'model fits' : 'models fit'} this machine at a shorter one. Same weights, smaller cache.</p>
${stack(`<table class="board">
<thead><tr><th>Model</th><th>Longest window it fits</th><th>Needs there</th><th>Needs at ${ctxLabel(ctx)}</th></tr></thead>
<tbody>${body}</tbody>
</table>`, { fig: 1 })}
<p class="note">Each window is the longest setting the calculator offers that this machine still holds the model at, and it opens the calculator on that model at that length. The memory figures are the weights plus the key-value cache at that window, against the ${hw.usable_memory_gb} GB this machine's GPU can use.</p>

`;
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

  // The table stops at twelve, ordered by index class, which puts every model
  // the index has not scored beneath it — below the cut on all but the smallest
  // machines. Three of those models were in no machine's first twelve, so the
  // only thing on the site linking them was one line under the leaderboard.
  const hidden = fits.slice(12);
  const unscored = hidden.filter((r) => r.model.frontier_equivalent?.score == null).map((r) => r.model);
  const modelLink = (m: Model) => `<a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a>`;

  // Every figure in this table is taken at the context the page assumes, and that
  // is where it used to stop. The weights are a fixed size; the KV cache is not,
  // because it grows with every token you keep, so the memory left over after the
  // weights is how long a window the machine holds each model at. On 51 of the 56
  // machines at least one model is stopped by this machine's memory rather than by
  // its own limit, which is the half of the answer the table never gave.
  const shown = fits.slice(0, 12);
  const reach = new Map(shown.map((r) => [r.model.id, longestContext(r.model, hw, data)] as const));
  // Only memory running out says anything about the machine. A model's own limit
  // or the end of the calculator's list stops the figure just as dead, and neither
  // is the hardware's doing, so the page may not read them as the same thing.
  const stoppedByMemory = shown.filter((r) => {
    const tokens = reach.get(r.model.id);
    return tokens != null && contextCappedBy(r.model, tokens, data) === 'memory';
  });
  const longestOffered = Math.max(...data.defaults.context.options);

  // Every other figure in this table is read and left; this one is acted on. The
  // machine page's only way into the calculator was the machine on its own, at
  // the default model and the default 32k, so a reader who had just read off the
  // length this machine holds one model at had to set that model and that length
  // again by hand. The length itself is the link, which puts a way in on every
  // row without adding a second call to action under the table.
  const rows = shown
    .map((r) => {
      const holds = reach.get(r.model.id);
      const memory = holds != null && contextCappedBy(r.model, holds, data) === 'memory';
      return `<tr>
  <td class="c-model"><a href="/models/${esc(r.model.id)}/">${esc(r.model.display_name)}</a><span class="c-quant">${esc(r.model.quantisation)}</span></td>
  <td>${r.throughput.tokensPerSec == null ? '<span class="dim">unknown</span>' : `${fmtNum(r.throughput.tokensPerSec, r.throughput.tokensPerSec < 10 ? 1 : 0)} tok/s`}</td>
  <td>${tierScale(r.model, data)} ${tierLabel(r.model, data)}</td>
  <td>${dotRow(r.model)}</td>
  <td>${fmtGb(r.fit.needGb)}</td>
  <td>${holds == null ? '<span class="dim">unknown</span>' : `<a href="${esc(calcLink({ hw: hw.id, model: r.model.id, ctx: holds }, data))}">${ctxLabel(holds)}</a>${memory ? '<span class="c-quant">memory</span>' : ''}`}</td>
</tr>`;
    })
    .join('');

  // What the new column adds up to, said before the table rather than left to be
  // read out of it. The two cases are opposite claims, so each page makes its own.
  const contextLine = (() => {
    if (!shown.length) return '';
    const spare = hw.usable_memory_gb ?? hw.unified_memory_gb;
    // Where the models this machine does not stop end up, which is not the same
    // sentence on every machine: on a 16GB Mac nothing reaches the end of the
    // list, so naming it as somewhere "the rest" get to would sell a length this
    // machine never holds.
    const rest = shown.filter((r) => !stoppedByMemory.includes(r));
    const atEnd = rest.filter((r) => reach.get(r.model.id) === longestOffered).length;
    const end = `${ctxLabel(longestOffered)}, where the calculator's list ends`;
    if (!stoppedByMemory.length)
      return `<p>Memory never runs out first here. Every model below holds ${atEnd === rest.length ? end : atEnd ? `${end}, or the longest setting its own context limit allows` : `the longest setting its own context limit allows`}, so the window you get is the model's choice rather than this machine's.</p>`;
    const worst = [...stoppedByMemory].sort((a, b) => reach.get(a.model.id)! - reach.get(b.model.id)!)[0];
    const others = !rest.length
      ? ''
      : atEnd === rest.length
        ? ` The rest reach ${end}.`
        : atEnd
          ? ` The rest reach ${end}, or the longest setting their own context limit allows.`
          : ` The rest stop at the longest setting their own context limit allows, which is the model's doing and not this machine's.`;
    return `<p>They do not all hold the same window. The weights are a fixed size, but the key-value cache grows with every token you keep, so what is left of ${spare} GB after the weights is how far the context goes. On ${memoryCount(stoppedByMemory.length)} of the ${shown.length} below, this machine's memory is what runs out first: ${esc(worst.model.display_name)} stops soonest, at ${ctxLabel(reach.get(worst.model.id)!)}.${others}</p>`;
  })();

  const best = fits[0];
  // What the table leaves out: the models this machine misses at the context every
  // figure above is taken at, and holds at a shorter window.
  const shorter = fitsShorter(hw, view.rows.map((r) => r.model), data);
  const body = `<article class="prose">
<h1>Can ${indefiniteArticle(label)} ${esc(label)} run local LLMs?</h1>
<p class="lede">Yes — ${fits.length} of the ${view.rows.length} open models on this site fit in its ${hw.usable_memory_gb ?? '?'} GB of usable memory${best ? `, the strongest being ${esc(best.model.display_name)}` : ''}${shorter.length ? `, and ${numberWord(shorter.length)} more if you keep the window shorter than ${ctxLabel(state.ctx)}` : ''}. Whether that saves you money is a different question, and the answer is usually no.${hw.price_scope === 'card_only' ? ` Its price here is the card on its own, so every figure below leaves out the PC you need to put it in.` : ''}</p>

<div class="answer">
  <div class="answer-row"><span class="answer-k">Price</span><span class="answer-v">${hw.price_usd == null ? 'not published yet' : fmtUsd(hw.price_usd)}${hw.generation === 'previous' ? ' at launch — discontinued' : ''}${hw.price_scope === 'card_only' ? '<span class="c-quant">card only</span>' : ''}</span></div>
  <div class="answer-row"><span class="answer-k">Memory</span><span class="answer-v">${hw.unified_memory_gb} GB${hw.usable_memory_gb != null ? `, about ${hw.usable_memory_gb} GB of it addressable by the GPU` : ''}${hw.memory_bandwidth_gbs ? ` at ${hw.memory_bandwidth_gbs} GB/s` : ''}</span></div>
  ${best ? `<div class="answer-row"><span class="answer-k">Best model it runs</span><span class="answer-v"><a href="/models/${esc(best.model.id)}/">${esc(best.model.display_name)}</a> — ${esc(tierName(best.model, data))}${best.throughput.tokensPerSec ? `, ${fmtNum(best.throughput.tokensPerSec, 0)} tok/s` : ''}</span></div>` : ''}
  <div class="answer-row"><span class="answer-k">Pay-back against the API</span><span class="answer-v">${view.calc ? esc(verdictLine(view)) : 'cannot be computed yet'}${view.calc?.breakevenDays != null ? ` at ${fmtTokens(state.usage)} tokens a day` : ''}</span></div>
</div>

<p><a class="cta" href="${esc(calcLink({ hw: hw.id }, data))}">Run the numbers on this machine</a></p>

${rows ? `<h2>What it runs</h2>
${contextLine}
${stack(`<table class="board">
<thead><tr><th>Model</th><th>Speed</th><th>Class</th><th>Good at</th><th>Memory</th><th>Longest context</th></tr></thead>
<tbody>${rows}</tbody>
</table>`, { fig: 1 })}
<p class="note">Speed and memory are at ${Math.round(state.ctx / 1024)}k context, the setting the calculator starts on. The longest context is the longest setting it offers that this machine still holds the model at, cache included, and each one opens the calculator on that model at that length. A figure tagged <i>memory</i> is one this machine ran out of room for, and the rest are stopped by the model's own limit or by the end of the list.</p>
${hidden.length ? `<p class="note">${runsOnNote(hidden.length, unscored, modelLink)}</p>` : ''}` : ''}

${shorterWindowSection(hw, shorter, state.ctx)}${range.length || rivals.length ? `<h2>Other machines to weigh against it</h2>
${stack(`<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Memory</th><th>Models that fit</th><th>Pay-back</th></tr></thead>
<tbody>
${range.length ? `<tr class="is-frontier"><th colspan="5">${esc(familyHeading(hw))}</th></tr>${range.map(relatedRow).join('')}` : ''}
${rivals.length ? `<tr class="is-frontier"><th colspan="5">Nearest in price elsewhere on the list</th></tr>${rivals.map(relatedRow).join('')}` : ''}
</tbody>
</table>`, { fig: 4 })}
<p class="note">Every row uses the same defaults as the figures above: ${fmtTokens(state.usage)} tokens a day at ${state.ratio}:1 input to output, ${Math.round(state.ctx / 1024)}k context, and each machine's strongest model that fits, counted against the same ${view.rows.length} models. Graphics cards are priced as the card alone, so add the PC around one before comparing it with a complete computer.</p>` : ''}
${headToHeads.get(hw.id)?.length ? `<p class="note">Head to head: ${headToHeads.get(hw.id)!.map((h) => `<a href="${esc(h.href)}">vs ${esc(shortHardwareLabel(h.other))}</a>`).join(' · ')} · <a href="/compare/">all of them</a></p>` : ''}

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

/**
 * What to say on the 7 head-to-heads where both machines hold exactly the same
 * models. "Memory is not what separates them" was true and stopped a question
 * short: the weights are fixed, but the KV cache grows with every token you
 * keep, so memory can still separate two machines further up the context. On 4
 * of the 7 it does, and those pages now name the models and how far each machine
 * takes them. On the other 3 it does not, at any length the calculator offers,
 * and saying so is a stronger answer than the one they gave.
 */
function sameListSection(a: Hardware, b: Hardware, va: View, la: string, lb: string, ctxK: number): string {
  const counted = va.rows.length;
  const rows = contextHeadroom(va.rows.map((r) => r.model), a, b, data);
  const options = [...data.defaults.context.options].sort((x, y) => x - y);
  const span = `${ctxLabel(options[0])} to ${ctxLabel(options[options.length - 1])}`;
  const roomierIsA = (a.usable_memory_gb ?? 0) >= (b.usable_memory_gb ?? 0);
  const [roomier, tighter] = roomierIsA ? [a, b] : [b, a];
  const roomierLabel = roomierIsA ? la : lb;

  if (!rows.length) {
    const memory = a.usable_memory_gb === b.usable_memory_gb
      ? `Both leave ${a.usable_memory_gb} GB to the GPU.`
      : `The gap in what the GPU can use, ${roomier.usable_memory_gb} GB against ${tighter.usable_memory_gb} GB, is not big enough to change a single answer.`;
    return `<h2>Memory is not what separates them</h2>
<p>Every model on this list that fits one machine fits the other, and not only at ${ctxK}k of context: across all ${counted} models the calculator counts, at every context from ${span}, there is no model one holds and the other does not. ${memory} So the choice between them is speed, price and power, not what they can hold.</p>`;
  }

  const reach = (tokens: number | null) => (tokens === null ? '<span class="dim">no length it holds</span>' : ctxLabel(tokens));
  const top = rows[0];
  const same = counted - rows.length;
  return `<h2>The same models, not to the same length</h2>
<p>Every model on this list that fits one machine fits the other at ${ctxK}k of context, so memory does not change what they run. What it changes is how far you can take the context on ${rows.length === 1 ? 'one of them' : `${rows.length} of them`}. The ${esc(roomierLabel)} has ${roomier.usable_memory_gb} GB usable against ${tighter.usable_memory_gb} GB, and spare memory is what the KV cache grows into as you keep more tokens.</p>
<table class="board compare">
<thead><tr><th>Model</th><th>${esc(la)}</th><th>${esc(lb)}</th></tr></thead>
<tbody>
${rows
  .map(
    (r) => `<tr><th><a href="/models/${esc(r.model.id)}/">${esc(r.model.display_name)}</a><span class="c-quant">${fmtGb(r.model.weights_gb)} of weights</span></th><td>${reach(r.a)}</td><td>${reach(r.b)}</td></tr>`,
  )
  .join('\n')}
</tbody>
</table>
<p class="note">Each figure is the longest context the calculator offers that the machine still holds that model at, and no model is taken past its own context limit. The other ${same} models the calculator counts reach the same length on both machines, at every setting from ${span}.</p>
${top.a !== null && top.b !== null ? `<p><a class="cta" href="${esc(calcLink({ hw: a.id, model: top.model.id, ctx: top.a }, data))}">Run ${esc(top.model.display_name)} on the ${esc(la)} at ${ctxLabel(top.a)}</a> · <a href="${esc(calcLink({ hw: b.id, model: top.model.id, ctx: top.b }, data))}">or on the ${esc(lb)} at ${ctxLabel(top.b)}</a></p>` : ''}`;
}

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
${stack(`<table class="board">
<thead><tr><th>Model</th><th>Weights</th><th>Needs at ${ctxK}k</th><th>On the ${esc(roomier)}</th></tr></thead>
<tbody>
${shown
  .map((m) => {
    const r = roomierView.rows.find((x) => x.model.id === m.id)!;
    return `<tr><td class="c-model"><a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a><span class="c-quant">${esc(tierName(m, data))}</span></td><td>${fmtGb(m.weights_gb)}</td><td>${r.fit.needGb != null ? fmtGb(r.fit.needGb) : '<span class="dim">unknown</span>'}</td><td>${speedWithBasis(r)}</td></tr>`;
  })
  .join('\n')}
</tbody>
</table>`, { fig: 3, labels: { 2: 'Needs' } })}
${extra.length > shown.length ? `<p class="note">${extra.length - shown.length} more, on the <a href="/hardware/${esc(extraA.length >= extraB.length ? a.id : b.id)}/">${esc(roomier)} page</a>.</p>` : ''}`
    : sameListSection(a, b, va, la, lb, ctxK);

  // the whole page above is one usage level, and pay-back is the figure that moves
  // most with it: a machine too slow to generate the tokens asked for stops gaining
  // at its own ceiling, which is why the order of the two columns can change
  const usageSection = shared
    ? (() => {
        const levels = bestUsageLevels(data);
        const cells = levels.map((l) => ({
          level: l,
          a: computeView({ ...st, hw: a.id, model: shared.model.id, usage: l.usage }, data),
          b: computeView({ ...st, hw: b.id, model: shared.model.id, usage: l.usage }, data),
        }));
        const days = (v: View) => v.calc?.breakevenDays ?? null;
        const payCell = (v: View) => {
          const d = days(v);
          const text = d === null ? 'Never pays back' : fmtDuration(d);
          return `${text}${v.capacity.capped ? '<span class="c-quant">its ceiling</span>' : ''}`;
        };

        // who gets there first at each level, and whether that answer holds all the way up
        const sooner = cells.map((c) => {
          const [da, db] = [days(c.a), days(c.b)];
          if (da === null && db === null) return '';
          if (da === null) return lb;
          if (db === null) return la;
          return da === db ? '' : da < db ? la : lb;
        });
        const runs: { who: string; last: number }[] = [];
        sooner.forEach((who, i) => {
          if (who && runs.length && runs[runs.length - 1].who === who) runs[runs.length - 1].last = i;
          else if (who) runs.push({ who, last: i });
        });
        // the plain sentences only hold where one of them is ahead at every level; a
        // level the two draw on breaks the run and is described the general way
        const clean = sooner.every(Boolean);
        const turns = clean && runs.length === 1
          ? `The ${esc(runs[0].who)} pays back sooner at every level of use, so this is not a choice that turns on how hard you work it.`
          : clean && runs.length === 2
            ? `The ${esc(runs[0].who)} pays back sooner at every level up to ${fmtTokens(levels[runs[0].last].usage)} tokens a day. Above that the ${esc(runs[1].who)} does.`
            : 'Which of them pays back sooner changes with the level of use.';

        // where a machine cannot generate what the row asks for, its figure is for the
        // most it can do, and the page has to say so rather than let it read as a race
        const ceilings = [a, b]
          .map((hw, i) => {
            const over = cells.filter((c) => (i === 0 ? c.a : c.b).capacity.capped);
            const v = over[0] && (i === 0 ? over[0].a : over[0].b);
            return over.length && v ? { label: i === 0 ? la : lb, from: over[0].level.usage, rows: over.length, max: v.capacity.maxTokensPerDay } : null;
          })
          .filter((x): x is { label: string; from: number; rows: number; max: number } => !!x && x.max != null);
        // 3 of these pages cap both machines at the same level, where a sentence each
        // would say the same thing twice
        const together = ceilings.length === 2 && ceilings[0].from === ceilings[1].from && ceilings[0].rows === ceilings[1].rows;
        const ceilingLine = ceilings.length
          ? `<p class="note">${
              together
                ? `On ${esc(shared.model.display_name)} neither machine can generate ${fmtTokens(ceilings[0].from)} tokens a day: the ${esc(ceilings[0].label)} manages at most ${fmtTokens(ceilings[0].max)} and the ${esc(ceilings[1].label)} at most ${fmtTokens(ceilings[1].max)}. ${ceilings[0].rows === 1 ? 'Both figures on that row are' : `Their figures from ${fmtTokens(ceilings[0].from)} tokens a day up are`} for the most each can do.`
                : ceilings
                    .map((c) => `On ${esc(shared.model.display_name)} the ${esc(c.label)} generates at most ${fmtTokens(c.max)} tokens a day, so ${c.rows === 1 ? `its figure at ${fmtTokens(c.from)} tokens a day is` : `its figures from ${fmtTokens(c.from)} tokens a day up are`} for the most it can do, not for the whole of what was asked.`)
                    .join(' ')
            }</p>`
          : '';
        const top = levels[levels.length - 1];

        return `<h2>How much use it takes to pay back</h2>
<p>Everything above is at ${fmtTokens(st.usage)} tokens a day. Pay-back moves with how much you actually run, so here are both machines on ${likeForLike ? `the same model` : `<a href="/models/${esc(shared.model.id)}/">${esc(shared.model.display_name)}</a>, the strongest model both hold`}, at the five levels of use the calculator names. ${turns}</p>
<table class="board compare">
<thead><tr><th>A day's use</th><th>${esc(la)}</th><th>${esc(lb)}</th></tr></thead>
<tbody>
${cells
  .map((c) => `<tr><th>${fmtTokens(c.level.usage)}<span class="c-quant">${esc(c.level.label)}</span></th><td>${payCell(c.a)}</td><td>${payCell(c.b)}</td></tr>`)
  .join('\n')}
</tbody>
</table>
${ceilingLine}
<p><a class="cta" href="${esc(calcLink({ hw: a.id, model: shared.model.id, usage: top.usage }, data))}">Run the ${esc(la)} at ${fmtTokens(top.usage)} tokens a day</a> · <a href="${esc(calcLink({ hw: b.id, model: shared.model.id, usage: top.usage }, data))}">or the ${esc(lb)}</a></p>`;
      })()
    : '';

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
${usageSection}
${extraSection}
<h2>The assumptions behind both columns</h2>
<p class="note">Both columns use the same usage: ${fmtTokens(st.usage)} tokens a day at ${st.ratio}:1 input to output, ${ctxK}k of context, $${st.kwh} per kWh, and today's API prices held flat. Speeds marked <i>estimated</i> are worked out from memory bandwidth rather than measured, and pay-back scales with them. Graphics cards are priced as the card alone, so add the PC around one before comparing it with a complete computer. Change any of it in the calculator.</p>
<p class="note">More head to head: <a href="/hardware/${esc(a.id)}/">everything the ${esc(la)} runs</a> · <a href="/hardware/${esc(b.id)}/">everything the ${esc(lb)} runs</a> · <a href="/compare/">every other match-up</a> · <a href="/best/">the quickest pay-back at each level of use</a> · <a href="/leaderboard/">every model against the frontier</a></p>
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
      // the index is the step above a match-up, so the trail a search result
      // prints reads Sunk Cost / Head to head / this pair
      crumbs: [
        { href: '/', label: 'Sunk Cost' },
        { href: '/compare/', label: 'Head to head' },
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
  const shared = cheapestRunsBoth(a, b, ra, rb);
  const st = defaultState(data);
  const ctx = data.defaults.context.default_tokens;
  const ctxK = Math.round(ctx / 1024);
  // Two of the 47 pairs have no machine in common at 32k, so they skipped the two
  // sections every other comparison carries: the like-for-like table and pay-back
  // across the levels of use. They do meet at a shorter context, and that is the
  // answer someone choosing between them wants, so the race runs there and says so.
  const meeting = shared ? null : meetAtShorterContext(a, b, data);
  const race = shared
    ? { s: shared, ctx, shortened: false }
    : meeting
      ? { s: meeting.shared, ctx: meeting.ctx, shortened: true }
      : null;
  const raceK = Math.round((race?.ctx ?? ctx) / 1024);
  const considered = machinesConsidered(data).length;
  const sa = a.frontier_equivalent?.score ?? null;
  const sb = b.frontier_equivalent?.score ?? null;
  const row = (k: string, x: string, y: string) => `<tr><th>${esc(k)}</th><td>${x}</td><td>${y}</td></tr>`;
  const capRows = CAPABILITY_KEYS.map(
    (k) => `<tr><th>${esc(CAP_SHORT[k])}</th><td><span class="dot dot-${a.capabilities[k]}"></span> ${esc(ratingWord[a.capabilities[k]])}</td><td><span class="dot dot-${b.capabilities[k]}"></span> ${esc(ratingWord[b.capabilities[k]])}</td></tr>`,
  ).join('');

  // what the model asks of any machine: the same figure the machine head-to-heads
  // print under "Needs at 32k", taken from the fit rather than recomputed
  const needGb = (m: Model, runners: Runner[]) =>
    rowFor(runners[0]?.view ?? computeView({ ...st, model: m.id }, data), m)?.fit.needGb ?? null;

  // a call to action that only offers a machine where one exists
  // a model no machine holds at 32k used to open on whatever machine the calculator
  // starts on, which is one that cannot hold it either. Where the pair meets at a
  // shorter context, the link opens there instead: a configuration that runs.
  const openIn = (m: Model, runners: Runner[]) =>
    runners[0]
      ? { href: calcLink({ hw: runners[0].hw.id, model: m.id }, data), text: `${m.display_name} on the ${shortHardwareLabel(runners[0].hw)}` }
      : meeting
        ? {
            href: calcLink({ hw: meeting.shared.hw.id, model: m.id, ctx: meeting.ctx }, data),
            text: `${m.display_name} on the ${shortHardwareLabel(meeting.shared.hw)} at ${raceK}k of context`,
          }
        : { href: calcLink({ model: m.id }, data), text: `${m.display_name} in the calculator` };
  const modelLink = (m: Model, runners: Runner[]) =>
    `<a href="/models/${esc(m.id)}/">${runners.length ? `every machine that runs ${esc(m.display_name)}` : `what ${esc(m.display_name)} needs`}</a>`;
  const ctaA = openIn(a, ra);
  const ctaB = openIn(b, rb);
  // where both models open on the same machine, naming it twice in one line says nothing twice
  const opensOn = (runners: Runner[]) => runners[0]?.hw.id ?? meeting?.shared.hw.id ?? null;
  if (opensOn(ra) && opensOn(ra) === opensOn(rb))
    ctaB.text = rb[0] ? b.display_name : `${b.display_name} at ${raceK}k of context`;

  // the API bill each model's own work would run up, and the model that price is for:
  // where nobody rents the open one, it is the nearest hosted match and has to say so
  // an open model nobody rents by the token is priced at the nearest hosted match,
  // and a price standing in for another model has to say whose it is
  const apiPriceCell = (m: Model) => {
    const ce = m.cloud_equivalent;
    return `$${ce.input_price_per_mtok} in / $${ce.output_price_per_mtok} out${ce.is_exact_match ? '' : `<span class="c-quant">priced as ${esc(ce.name)}</span>`}`;
  };
  const apiCell = (m: Model, view: View | undefined) => {
    const c = view?.calc;
    if (!c) return '<span class="dim">unknown</span>';
    const ce = m.cloud_equivalent;
    return `${fmtUsd(c.cloudCostPerMonth)}${ce.is_exact_match ? '' : `<span class="c-quant">priced as ${esc(ce.name)}</span>`}`;
  };

  const sameStart = !!ra[0] && !!rb[0] && ra[0].hw.id === rb[0].hw.id;

  /**
   * What a shorter context buys, for the pairs that need one. The weights do not
   * move; the cache does, and on these pages the cache is the whole of what put a
   * model out of every machine's reach. Every figure here is printed on its own,
   * so nothing asks the reader to add two rounded numbers and get a third.
   */
  const meetingIntro = (s: SharedMachine, atK: number) => {
    const link = `<a href="/hardware/${esc(s.hw.id)}/">${esc(hardwareLabel(s.hw))}</a>`;
    const have = s.hw.usable_memory_gb;
    const biggest = have != null && machinesConsidered(data).every((h) => (h.usable_memory_gb ?? 0) <= have);
    const sides = [
      { m: a, runners: ra, row: s.rowA },
      { m: b, runners: rb, row: s.rowB },
    ];
    const blocked = sides.filter((x) => !x.runners.length);
    const running = sides.filter((x) => x.runners.length);
    const out: string[] = [];
    for (const x of blocked) {
      const atDefault = needGb(x.m, x.runners);
      const atRace = x.row.fit.needGb;
      if (atDefault == null || atRace == null) continue;
      out.push(
        `${esc(x.m.display_name)} needs ${fmtGb(atDefault)} at ${ctxK}k of context.`,
        biggest
          ? `The biggest machine on this list is the ${link}, and it has ${fmtGb(have)} usable.`
          : `The ${link} has ${fmtGb(have)} usable.`,
        x.m.weights_gb != null
          ? `${esc(x.m.display_name)}'s weights are ${fmtGb(x.m.weights_gb)} of that. The rest is the cache, and the cache is the part that shrinks when you ask for less context: at ${atK}k the model needs ${fmtGb(atRace)}, which that machine holds.`
          : `At ${atK}k of context the model needs ${fmtGb(atRace)} instead, which that machine holds.`,
      );
    }
    out.push(
      running.length === 1
        ? `It already runs ${esc(running[0].m.display_name)}, so at ${atK}k of context one machine here runs both. It costs ${priceWithScope(s.hw)}. The rest of this page is what each model does with it.`
        : `So at ${atK}k of context one machine here runs both: the ${link}, at ${priceWithScope(s.hw)}. The rest of this page is what each model does with it.`,
    );
    return out.join(' ');
  };

  const sideBySide = race
    ? (() => {
        const l = shortHardwareLabel(race.s.hw);
        const intro = race.shortened
          ? meetingIntro(race.s, raceK)
          : sameStart
            ? `The cheapest machine that runs either model is the same one, so this is the pair doing the same work on the same hardware: <a href="/hardware/${esc(race.s.hw.id)}/">${esc(hardwareLabel(race.s.hw))}</a>, at ${priceWithScope(race.s.hw)}.`
            : `The table above gives each model the cheapest machine that runs it, and those are two different machines, so nothing in it is a like-for-like race. The <a href="/hardware/${esc(race.s.hw.id)}/">${esc(hardwareLabel(race.s.hw))}</a> is the cheapest machine here that runs both, so this is the pair doing the same work on the same hardware.`;
        return `<h2>Side by side on the ${esc(l)}${race.shortened ? ` at ${raceK}k of context` : ''}</h2>
<p>${intro}</p>
<table class="board compare">
<thead><tr><th></th><th>${esc(a.display_name)}</th><th>${esc(b.display_name)}</th></tr></thead>
<tbody>
${row(`Speed at ${raceK}k`, speedWithBasis(race.s.rowA), speedWithBasis(race.s.rowB))}
${row('Pay-back on this machine', esc(verdictLine(race.s.a.view)), esc(verdictLine(race.s.b.view)))}
${row('API cost per month', apiCell(a, race.s.a.view), apiCell(b, race.s.b.view))}
</tbody>
</table>
<p><a class="cta" href="${esc(calcLink({ hw: race.s.hw.id, model: a.id, ctx: race.ctx }, data))}">Run ${esc(a.display_name)} on the ${esc(l)}</a> · <a href="${esc(calcLink({ hw: race.s.hw.id, model: b.id, ctx: race.ctx }, data))}">or ${esc(b.display_name)}</a></p>`;
      })()
    : '';

  // the table above prices pay-back at one level of use, and pay-back is the figure
  // that moves most with it: the machine is the same either way, so what changes
  // between the two columns is what the same work costs on an API, and a model the
  // machine is too slow to keep up with stops gaining at its own ceiling
  const usageSection = race
    ? (() => {
        const l = shortHardwareLabel(race.s.hw);
        const levels = bestUsageLevels(data);
        const cells = levels.map((lv) => ({
          level: lv,
          a: computeView({ ...st, hw: race.s.hw.id, model: a.id, usage: lv.usage, ctx: race.ctx }, data),
          b: computeView({ ...st, hw: race.s.hw.id, model: b.id, usage: lv.usage, ctx: race.ctx }, data),
        }));
        const days = (v: View) => v.calc?.breakevenDays ?? null;
        const printed = (v: View) => {
          const d = days(v);
          return d === null ? 'Never pays back' : fmtDuration(d);
        };
        const payCell = (v: View) => `${printed(v)}${v.capacity.capped ? '<span class="c-quant">its ceiling</span>' : ''}`;

        // which model earns the machine back first at each level, and whether that
        // answer holds all the way up. the sentence has to hold against the figures
        // the table prints rather than the days behind them, so two figures that
        // print the same are a draw even where one is a few days ahead
        const never = (side: 'a' | 'b') => cells.every((c) => days(c[side]) === null);
        const sooner = cells.map((c) => {
          const [da, db] = [days(c.a), days(c.b)];
          if (da === null && db === null) return '';
          if (da === null) return b.display_name;
          if (db === null) return a.display_name;
          if (printed(c.a) === printed(c.b)) return '';
          return da < db ? a.display_name : b.display_name;
        });
        const winners = [...new Set(sooner.filter(Boolean))];
        const runs: { who: string; last: number }[] = [];
        sooner.forEach((who, i) => {
          if (who && runs.length && runs[runs.length - 1].who === who) runs[runs.length - 1].last = i;
          else if (who) runs.push({ who, last: i });
        });
        const clean = sooner.every(Boolean);
        // a model that never pays the machine back is not simply the slower of the
        // two to do it, so those pages say what is actually happening
        const turns = never('a') && never('b')
          ? `Neither pays for it at any of those levels, even with agents running most of the day.`
          : never('a') || never('b')
            ? `${esc(never('a') ? b.display_name : a.display_name)} pays for it sooner at every level of use: ${esc(never('a') ? a.display_name : b.display_name)} never pays for it at all.`
            : clean && runs.length === 1
              ? `${esc(runs[0].who)} pays for it sooner at every level of use, so which of them to run does not turn on how hard you work it.`
              : winners.length === 1
                ? `${esc(winners[0])} is never the slower of the two to pay for it, at any level of use.`
                : clean && runs.length === 2
                  ? `${esc(runs[0].who)} pays for it sooner at every level up to ${fmtTokens(levels[runs[0].last].usage)} tokens a day. Above that ${esc(runs[1].who)} does.`
                  : `Which of them pays for it sooner changes with the level of use.`;

        // where the machine cannot generate what the row asks for on a model, that
        // model's figure is for the most it can do, and the page has to say so
        const ceilings = [a, b]
          .map((m, i) => {
            const over = cells.filter((c) => (i === 0 ? c.a : c.b).capacity.capped);
            const v = over[0] && (i === 0 ? over[0].a : over[0].b);
            return over.length && v ? { name: m.display_name, from: over[0].level.usage, rows: over.length, max: v.capacity.maxTokensPerDay } : null;
          })
          .filter((x): x is { name: string; from: number; rows: number; max: number } => !!x && x.max != null);
        // 5 of these pages cap both models at the same level, where a sentence each
        // would say the same thing twice
        const together = ceilings.length === 2 && ceilings[0].from === ceilings[1].from && ceilings[0].rows === ceilings[1].rows;
        const ceilingLine = ceilings.length
          ? `<p class="note">${
              together
                ? `The ${esc(l)} cannot generate ${fmtTokens(ceilings[0].from)} tokens a day on either model: at most ${fmtTokens(ceilings[0].max)} on ${esc(ceilings[0].name)} and ${fmtTokens(ceilings[1].max)} on ${esc(ceilings[1].name)}. ${ceilings[0].rows === 1 ? 'Both figures on that row are' : `Their figures from ${fmtTokens(ceilings[0].from)} tokens a day up are`} for the most it can do.`
                : ceilings
                    .map((c, i) => `${i === 0 ? `The ${esc(l)} generates` : 'It generates'} at most ${fmtTokens(c.max)} tokens a day on ${esc(c.name)}, so ${c.rows === 1 ? `that column's figure at ${fmtTokens(c.from)} tokens a day is` : `that column's figures from ${fmtTokens(c.from)} tokens a day up are`} for the most it can do, not for the whole of what was asked.`)
                    .join(' ')
            }</p>`
          : '';
        const top = levels[levels.length - 1];

        return `<h2>How much use it takes to pay for the machine</h2>
<p>Everything above is at ${fmtTokens(st.usage)} tokens a day. Pay-back moves with how much you actually run, so here are both models at the five levels of use the calculator names, on the ${esc(l)}${race.shortened ? ` at ${raceK}k of context` : ''}. ${turns}</p>
<table class="board compare">
<thead><tr><th>A day's use</th><th>${esc(a.display_name)}</th><th>${esc(b.display_name)}</th></tr></thead>
<tbody>
${cells
  .map((c) => `<tr><th>${fmtTokens(c.level.usage)}<span class="c-quant">${esc(c.level.label)}</span></th><td>${payCell(c.a)}</td><td>${payCell(c.b)}</td></tr>`)
  .join('\n')}
</tbody>
</table>
${ceilingLine}
<p><a class="cta" href="${esc(calcLink({ hw: race.s.hw.id, model: a.id, usage: top.usage, ctx: race.ctx }, data))}">Run ${esc(a.display_name)} at ${fmtTokens(top.usage)} tokens a day</a> · <a href="${esc(calcLink({ hw: race.s.hw.id, model: b.id, usage: top.usage, ctx: race.ctx }, data))}">or ${esc(b.display_name)}</a></p>`;
      })()
    : '';

  // fit turns on memory, so one model's list of machines is nearly always a
  // superset of the other's; whichever way round it falls, this is what the
  // difference in footprint costs you at the till
  const onlyA = runsOnlyThere(ra, rb);
  const onlyB = runsOnlyThere(rb, ra);
  const [wider, narrower, only] = onlyA.length >= onlyB.length ? [a, b, onlyA] : [b, a, onlyB];
  const shownRunners = only.slice(0, 6);
  const needWider = needGb(wider, wider === a ? ra : rb);
  const needNarrower = needGb(narrower, narrower === a ? ra : rb);
  const needLine = needWider != null && needNarrower != null
    ? `${esc(wider.display_name)} needs ${fmtGb(needWider)} of memory at ${ctxK}k of context and ${esc(narrower.display_name)} needs ${fmtGb(needNarrower)}. `
    : '';
  const machinesSection = only.length
    ? `<h2>Machines that run one and not the other</h2>
<p>${needLine}That puts ${esc(wider.display_name)} on ${only.length} of the ${considered} machines priced here that ${esc(narrower.display_name)} does not, starting at ${fmtUsd(only[0].hw.price_usd)}.</p>
${stack(`<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Memory</th><th>Speed on ${esc(wider.display_name)}</th><th>Pay-back</th></tr></thead>
<tbody>
${shownRunners
  .map((r) => {
    const rw = rowFor(r.view, wider);
    return `<tr><td><a href="/hardware/${esc(r.hw.id)}/">${esc(hardwareLabel(r.hw))}</a></td><td>${priceWithScope(r.hw)}</td><td>${r.hw.unified_memory_gb} GB</td><td>${speedWithBasis(rw)}</td><td>${esc(verdictLine(r.view))}</td></tr>`;
  })
  .join('\n')}
</tbody>
</table>`, { fig: 4, labels: { 3: 'Speed' } })}
${only.length > shownRunners.length ? `<p class="note">${only.length - shownRunners.length} more, on the <a href="/models/${esc(wider.id)}/">${esc(wider.display_name)} page</a>.</p>` : ''}`
    : `<h2>Memory is not what separates them</h2>
<p>${needLine}Every machine priced here that runs one runs the other, at ${ctxK}k of context. So the choice between them is what each is good at, how fast it runs and what the same work costs on an API, not what you have to buy to hold it.</p>`;

  const body = `<article class="prose">
<h1>${esc(a.display_name)} vs ${esc(b.display_name)}</h1>
<p class="lede">${modelVerdict(a, b, ra, rb, shared, data, meeting)}</p>
<table class="board compare">
<thead><tr><th></th><th><a href="/models/${esc(a.id)}/">${esc(a.display_name)}</a></th><th><a href="/models/${esc(b.id)}/">${esc(b.display_name)}</a></th></tr></thead>
<tbody>
${row('Intelligence index', sa != null ? `<b>${sa}</b>` : 'not placed', sb != null ? `<b>${sb}</b>` : 'not placed')}
${row('Class', esc(tierName(a, data)), esc(tierName(b, data)))}
${row('Weights', fmtGb(a.weights_gb), fmtGb(b.weights_gb))}
${row(`Needs at ${ctxK}k`, needGb(a, ra) != null ? fmtGb(needGb(a, ra)) : '<span class="dim">unknown</span>', needGb(b, rb) != null ? fmtGb(needGb(b, rb)) : '<span class="dim">unknown</span>')}
${row('Quantisation', esc(a.quantisation), esc(b.quantisation))}
${row('Parameters', `${fmtNum(a.params_b, 1)}B${a.active_params_b && a.active_params_b < a.params_b ? ` (${fmtNum(a.active_params_b, 1)}B active)` : ''}`, `${fmtNum(b.params_b, 1)}B${b.active_params_b && b.active_params_b < b.params_b ? ` (${fmtNum(b.active_params_b, 1)}B active)` : ''}`)}
${row('Max context', a.max_context_tokens ? `${Math.round(a.max_context_tokens / 1024)}k` : 'unknown', b.max_context_tokens ? `${Math.round(b.max_context_tokens / 1024)}k` : 'unknown')}
${row('API price per 1M', apiPriceCell(a), apiPriceCell(b))}
${row('Licence', esc(a.license), esc(b.license))}
${row('Machines here that run it', `${ra.length} of ${considered}`, `${rb.length} of ${considered}`)}
${row('Cheapest machine that runs it', ra[0] ? `<a href="/hardware/${esc(ra[0].hw.id)}/">${esc(hardwareLabel(ra[0].hw))}</a> ${priceWithScope(ra[0].hw)}` : 'none listed', rb[0] ? `<a href="/hardware/${esc(rb[0].hw.id)}/">${esc(hardwareLabel(rb[0].hw))}</a> ${priceWithScope(rb[0].hw)}` : 'none listed')}
${capRows}
</tbody>
</table>
<p><a class="cta" href="${esc(ctaA.href)}">Run ${esc(ctaA.text)}</a> · <a href="${esc(ctaB.href)}">or ${esc(ctaB.text)}</a></p>
<p class="note">Ratings are coarse on purpose: they say what a model is usable for, not where it places to the decimal.</p>
${sideBySide}
${usageSection}
${machinesSection}
<h2>The assumptions behind both columns</h2>
<p class="note">Both columns use the same usage: ${fmtTokens(st.usage)} tokens a day at ${st.ratio}:1 input to output, ${ctxK}k of context, $${st.kwh} per kWh, and today's API prices held flat.${race?.shortened ? ` The two sections that need one machine to hold both models are at ${raceK}k of context instead, which is the longest on the calculator's list where one does.` : ''} Speeds marked <i>estimated</i> are worked out from memory bandwidth rather than measured, and pay-back scales with them. Where nobody rents an open model by the token, its API prices are the nearest hosted model's, named beside them. Machines are the ${considered} here with a published price that are still sold. Change any of it in the calculator.</p>
<p class="note">More head to head: ${modelLink(a, ra)} · ${modelLink(b, rb)} · <a href="/compare/">every other match-up</a> · <a href="/leaderboard/">both against the frontier</a> · <a href="/best/">the quickest pay-back at each level of use</a></p>
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
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/compare/', label: 'Head to head' }, { href: '#', label: `${a.display_name} vs ${b.display_name}` }],
    },
    body,
    data,
  );
}

/* ------------------------- the head-to-head index ------------------------- */

/**
 * One page listing every comparison this site writes. Somebody typing
 * "mac studio vs rtx 5090" wants the match-up, not either machine's own page,
 * and until now a comparison could only be found from the two things it
 * compares. Every figure in a row is read from the helpers the comparison page
 * itself uses, so the index cannot promise something the page behind it does
 * not say.
 */
function compareIndex(): string {
  const st = defaultState(data);
  const ctxK = Math.round(st.ctx / 1024);
  const modelCount = hwViews.values().next().value!.rows.length;

  // the like-for-like race the comparison page sets out further down itself:
  // both machines on the strongest model each of them holds
  const race = (s: { model: Model; a: ModelRow; b: ModelRow } | null) => {
    if (!s) return '<span class="dim">nothing on this list fits both</span>';
    const ta = shownTps(s.a);
    const tb = shownTps(s.b);
    if (ta == null || tb == null) return '<span class="dim">unknown</span>';
    const basis = [s.a.throughput.measurement, s.b.throughput.measurement];
    const how = basis.every((m) => m === 'measured')
      ? ''
      : basis.every((m) => m !== 'measured')
        ? ', both estimated'
        : ', one measured, one estimated';
    return `${fmtNum(ta, ta < 10 ? 1 : 0)} vs ${fmtNum(tb, tb < 10 ? 1 : 0)} tok/s <span class="dim">on ${esc(s.model.display_name)}${how}</span>`;
  };

  const pairs = hardwarePairs(data).map(([a, b]) => {
    const va = hwViews.get(a.id)!;
    const vb = hwViews.get(b.id)!;
    return { a, b, va, vb, href: hardwareComparePath(a, b), label: `${shortHardwareLabel(a)} vs ${shortHardwareLabel(b)}` };
  });
  // a reader looking for their own machine reads down the first column, so the
  // list is alphabetical rather than in the order the build happens to cut it
  const machines = [...pairs].sort((x, y) => x.label.localeCompare(y.label));

  const machineRows = machines
    .map(({ a, b, va, vb, href, label }) => `<tr>
  <td class="c-hw"><a href="${esc(href)}">${esc(label)}</a></td>
  <td class="c-pair">${priceWithScope(a)} vs ${priceWithScope(b)}</td>
  <td class="c-pair">${a.unified_memory_gb} GB vs ${b.unified_memory_gb} GB</td>
  <td>${fitsOf(va).length} vs ${fitsOf(vb).length}</td>
  <td class="c-pair">${race(strongestShared(va, vb))}</td>
</tr>`)
    .join('');

  const modelRows = modelPairs(data)
    .map(([a, b]) => {
      const ra = runnersFor(a, data);
      const rb = runnersFor(b, data);
      const shared = cheapestRunsBoth(a, b, ra, rb);
      return `<tr>
  <td class="c-model"><a href="${esc(modelComparePath(a, b))}">${esc(a.display_name)} vs ${esc(b.display_name)}</a></td>
  <td class="c-score">${a.frontier_equivalent!.score} vs ${b.frontier_equivalent!.score}</td>
  <td class="c-pair">${fmtGb(a.weights_gb)} vs ${fmtGb(b.weights_gb)}</td>
  <td class="c-hw">${shared ? `<a href="/hardware/${esc(shared.hw.id)}/">${esc(hardwareLabel(shared.hw))}</a> ${priceWithScope(shared.hw)}` : '<span class="dim">none listed</span>'}</td>
  <td>${shared ? `<a href="${esc(calcLink({ hw: shared.hw.id, model: a.id }, data))}">Open in the calculator</a>` : ''}</td>
</tr>`;
    })
    .join('');

  // the index's own answer, so the page says something before it starts listing
  const ranked = flagships
    .map((hw) => ({ hw, fits: fitsOf(hwViews.get(hw.id)!).length }))
    .sort((x, y) => y.fits - x.fits || x.hw.price_usd! - y.hw.price_usd!);
  // sorted by what each holds and then by price, so the first machine is the
  // cheapest of however many reach the top of the list rather than one of a tie
  const most = ranked[0];
  const atMost = ranked.filter((r) => r.fits === most?.fits);
  const cheapest = [...ranked].sort((x, y) => x.hw.price_usd! - y.hw.price_usd!)[0];

  const body = `<article class="prose">
<h1>Every head-to-head: machine against machine, model against model</h1>
<p class="lede">Every comparison on this site in one place: ${machines.length} machine match-ups and ${modelPairs(data).length} model match-ups, each row carrying the prices, the memory and the speeds the comparison itself opens with. For one machine on its own, start at <a href="/best/">best buys by usage</a> or the <a href="/leaderboard/">leaderboard</a>.</p>
${most && cheapest ? `<p>The short version: none of the ${ranked.length} machines compared here holds more than ${most.fits} of the ${modelCount} open models${atMost.length > 1 ? `, and ${atMost.length} of them hold that many` : ''}. The cheapest that does is the ${esc(shortHardwareLabel(most.hw))} at ${priceWithScopeText(most.hw)}. The cheapest machine here at all is the ${esc(shortHardwareLabel(cheapest.hw))} at ${priceWithScopeText(cheapest.hw)}, which holds ${cheapest.fits}.</p>` : ''}

<h2>Machine against machine</h2>
<p>One machine per family, the middle of its range by price, against every other: the machines people actually cross-shop. The two speeds in a row are on the strongest model both machines in it can hold at ${ctxK}k of context, so they are running the same work.</p>
${stack(`<table class="board">
<thead><tr><th>Match-up</th><th>Price</th><th>Memory</th><th>Models that fit, of ${modelCount}</th><th>Speed on a model both hold</th></tr></thead>
<tbody>${machineRows}</tbody>
</table>`, { fig: 3, labels: { 4: 'Both speeds' } })}

<h2>Model against model</h2>
<p>Each model against the next one down the leaderboard, which is the choice you face once you know what your machine holds. The machine named in a row is the cheapest here that runs both, so the two can be weighed on one computer.</p>
${stack(`<table class="board">
<thead><tr><th>Match-up</th><th>Score</th><th>Weights</th><th>Cheapest machine that runs both</th><th></th></tr></thead>
<tbody>${modelRows}</tbody>
</table>`, { fig: 1, labels: { 3: 'Cheapest' } })}

<p class="note">Every figure here is the one the page behind it prints, at the same defaults: ${fmtTokens(st.usage)} tokens a day at ${st.ratio}:1 input to output, ${ctxK}k of context, $${st.kwh} per kWh, and today's API prices held flat. A speed that says <i>estimated</i> is worked out from memory bandwidth rather than measured. Graphics cards are priced as the card alone, so add the PC around one before comparing it with a complete computer. Scores are the ${esc(data.defaults.frontier_basis?.name ?? 'intelligence index')}. Each calculator link opens the machine in its row running the first model named; change any of it once you are there.</p>
</article>`;

  return pageShell(
    {
      title: titleOf([
        'Compare local LLM hardware and models, head to head',
        'Compare local LLM hardware and models',
      ]),
      description: descOf([
        `${machines.length} machine match-ups and ${modelPairs(data).length} model match-ups in one list: price, memory, speed and the cheapest machine that runs both.`,
        `${machines.length} machine match-ups and ${modelPairs(data).length} model match-ups in one list, with price, memory and speed on each.`,
      ]),
      canonical: '/compare/',
      ogImage: COMPARE_CARD,
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/compare/', label: 'Head to head' }],
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
// the pairs `headToHeads` above already worked out and linked from both sides,
// and one index in front of them so a match-up can be found without knowing
// which two things to start from
write('/compare/', compareIndex());
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
checkHeadToHeads();
checkCanonicals();
checkOgCards();
checkFonts();
checkCardPrices();
checkTables();
checkArticles();
checkCompareIndex();
checkPayback();
checkMeetingPoint();
checkHeadroom();
checkModelContexts();
checkMachineContexts();
checkShorterFits();
checkHiddenModels();
console.log(`wrote ${paths.length} static pages + sitemap.xml (${paths.filter((p) => p.startsWith('/models')).length} models, ${paths.filter((p) => p.startsWith('/hardware')).length} machines, ${paths.filter((p) => p.startsWith('/compare')).length} comparisons)`);
