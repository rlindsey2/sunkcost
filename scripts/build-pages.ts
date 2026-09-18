/**
 * Generates the static pages: the leaderboard, one page per model, one per
 * machine, and head-to-head comparisons — plus sitemap.xml and robots.txt.
 *
 * These are the pages someone lands on from a search. Everything they need is
 * in the HTML; the calculator is a link away with the configuration pre-filled.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync, readFileSync } from 'node:fs';
import {
  appleChip, bandFit, brandOf, calcLink, CAP_SHORT, cheapestPerFamily, cheapestRunsBoth, cheapestThatHolds,
  computeView, contextCappedBy, contextHeadroom, ctxLabel, DESC_MAX, descOf, discontinuedOn, dotRow, esc,
  familyGroup, familyHeading, familyRange, generationNames,
  fitsOf, fitsShorter, fmtDuration, fmtGb, fmtGb1, fmtNum, fmtTokens, fmtUsd, FONT_PRELOAD, FOOTER_LINKS,
  footerHtml, gbRange,
  gpuPart, hardwareLabel, hardwareProduct, indefiniteArticle, kvWorking, longestContext, lowerFirst,
  machinesConsidered, machinesShorter, machineVerdict, median, meetAtShorterContext, modelLabel,
  modelVerdict, otherQuantisations, pageShell, powerSourceLabel, powerWithSource, priceRivals,
  cardScopeNote, priceWithScope, priceWithScopeText, rowFor,
  runnersFor, runsOnlyOn, runsOnlyThere, sameSilicon, sharedHeadroom, shortHardwareLabel, shownTps, SIZE_BANDS, slug,
  speedWithBasis, stack,
  strongestShared, tierLabel, tierName, tierScale, TITLE_MAX, titleOf, verdictLine, widestHeadroom, type Runner,
  type SharedMachine, type ShorterFit, type ShorterMachine,
} from '../src/pagekit';
import {
  flagshipMachines, generationPairs, hardwareComparePath, hardwarePairs, headToHeadGroups, memoryTierNames,
  modelComparePath, modelPairs, sameSiliconPairs, versusCardPath,
} from '../src/versus-card';
import { BEST_CARD, COMPARE_CARD, HARDWARE_CARD, LEADERBOARD_CARD, MEMORY_CARD } from '../src/list-card';
import { defaultState } from '../src/state';
import { hasShareCard } from '../src/share';
import { bestByTier, bestUsageLevels } from '../src/best';
import { fit, footprintGb, kvCacheGb } from '../src/fit';
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
 * Four pages here are indexes rather than answers, and the foot of the page is
 * the only thing that offers all of them from everywhere. `/compare/` was not
 * among them: it was reachable only from the 187 pages that happen to name a
 * match-up, against 248 for the other three, so the index of every head-to-head
 * on the site was the one hub a reader could finish a page without meeting.
 *
 * Three things hold, and the first is the one that matters when the site grows:
 * a page written at the top level of this site stands above the machines and
 * the models rather than beside them, so it belongs at the foot of every page,
 * and adding one without adding it there stops the build. The other two are
 * that the footer links nothing this build does not write, and that every page
 * carries the same one, so a page type cannot quietly grow a footer of its
 * own.
 */
function checkFooter() {
  const problems: string[] = [];
  const own = new Set(paths);
  const named = new Set(FOOTER_LINKS.map((l) => l.href));
  // '/best/' splits to ['', 'best', ''] and '/models/x/' to one part more
  for (const p of paths.filter((p) => p.split('/').length === 3))
    if (!named.has(p)) problems.push(`${p} sits at the top level of the site and the foot of every page walks past it`);
  for (const { href } of FOOTER_LINKS)
    if (href !== '/' && !own.has(href)) problems.push(`the foot of every page links ${href}, which no page here writes`);
  const want = footerHtml();
  for (const p of meta) {
    const foot = p.html.match(/<footer class="doc-foot">[\s\S]*?<\/footer>/)?.[0];
    if (!foot) problems.push(`${p.path} ends without the footer every page carries`);
    else if (foot !== want) problems.push(`${p.path} has a footer of its own rather than the site's`);
  }
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} problem${problems.length === 1 ? '' : 's'} with the footer that links every index`);
  }
  console.log(`  ${meta.length} pages end with the same way back to the calculator and all ${FOOTER_LINKS.length - 1} pages above the machines and models`);
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
  // The grouped note at the foot of each machine page. The links themselves are held by
  // the loop above, from the other end; what is checked here is that the page names every
  // pair it is in once, adds none, and never spends the line repeating the name of the
  // machine the reader is already on, which is what the ungrouped line did on a memory pair.
  let grouped = 0;
  let widest = 0;
  for (const hw of data.hardware) {
    const pairs = headToHeads.get(hw.id) ?? [];
    if (!pairs.length) continue;
    const page = meta.find((p) => p.path === `/hardware/${hw.id}/`);
    const note = page?.html.match(/<p class="note">Head to head with[\s\S]*?<\/p>/)?.[0];
    if (!note) {
      problems.push(`/hardware/${hw.id}/ is in ${pairs.length} head-to-heads and its page does not list them`);
      continue;
    }
    for (const { href, other } of pairs) {
      // what the link should say, worked out from the data rather than from the grouping:
      // a pair of memory tiers is the same machine twice, so the size is the whole of the
      // difference and the name is already the page's own headline.
      const tier = memoryTierNames(hw, other) ?? memoryTierNames(other, hw);
      const want = tier ? `${other.unified_memory_gb}GB` : shortHardwareLabel(other);
      const said = [...note.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)].filter((m) => m[1] === href);
      if (said.length !== 1) problems.push(`/hardware/${hw.id}/ names ${href} ${said.length} times at the foot of the page, where it should name it once`);
      else if (said[0][2] !== esc(want)) problems.push(`/hardware/${hw.id}/ calls ${href} "${said[0][2]}" at the foot of the page, where it should say "${want}"`);
    }
    const links = note.match(/<a /g)?.length ?? 0;
    if (links !== pairs.length + 1)
      problems.push(`/hardware/${hw.id}/ lists ${links} links where it is in ${pairs.length} head-to-heads and links /compare/ once`);
    if (note.includes(esc(shortHardwareLabel(hw))))
      problems.push(`/hardware/${hw.id}/ repeats its own name in the head-to-heads at the foot of the page`);
    grouped++;
    widest = Math.max(widest, headToHeadGroups(hw, pairs).length);
  }
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} machine page${problems.length === 1 ? '' : 's'} do not list the head-to-heads they are in`);
  }
  const fewest = Math.min(...[...sides.keys()].map((p) => inbound.get(p)!.size));
  console.log(`  ${sides.size} head-to-heads, each linked from both sides and from at least ${fewest} pages in all`);
  console.log(`  ${grouped} machine pages list theirs by the question each one answers, in up to ${widest} groups`);
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
 * One machine, one number. The memory page counts what a machine holds with fitCount,
 * and every machine page counts the rows computeView hands it. Both are meant to be the
 * current models at the default context, and a reader moving between the two pages sees
 * both, so the build stops if they ever drift apart.
 */
function checkCounts() {
  const st = defaultState(data);
  for (const hw of buyable) {
    const onMachinePage = fitsOn(hw).length;
    const onMemoryPage = fitCount(hw, st.ctx);
    if (onMachinePage !== onMemoryPage) {
      throw new Error(
        `${hw.id}: its own page counts ${onMachinePage} models that fit, /how-much-memory/ counts ${onMemoryPage}`,
      );
    }
  }
  console.log(`  ${buyable.length} machines, each counted the same on its own page and on /how-much-memory/`);
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
 * The machine index is a second place the site states what a machine costs, what
 * it holds and what that takes to pay back, and a second statement of a figure is
 * a second chance to be wrong. Every row is recomputed here from the same view the
 * machine's own page is built from, so the two cannot drift apart, and the index
 * has to list every machine the build writes a page for.
 *
 * It also holds the step above: a machine page's breadcrumb has to pass through
 * this index, which is the route a reader who lands deep takes back up.
 */
function checkHardwareIndex() {
  const index = meta.find((p) => p.path === '/hardware/');
  if (!index) throw new Error('no machine index was written');
  const machinePages = paths.filter((p) => p.startsWith('/hardware/') && p !== '/hardware/');
  const problems: string[] = [];

  const body = index.html.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? '';
  const rows = body.split('<tr').slice(1).map((r) => `<tr${r}`);

  for (const hw of data.hardware) {
    const page = `/hardware/${hw.id}/`;
    if (!machinePages.includes(page)) continue;
    const row = rows.find((r) => r.includes(`href="${page}"`));
    if (!row) {
      problems.push(`the machine index has no row for ${esc(hardwareLabel(hw))}`);
      continue;
    }
    const view = hwViews.get(hw.id)!;
    const fits = fitsOf(view).length;
    if (!row.includes(`data-label="Models">${fits}</td>`))
      problems.push(`the machine index does not say the ${shortHardwareLabel(hw)} holds ${fits} of the models`);
    const model = view.model;
    if (model) {
      if (!row.includes(`/models/${model.id}/`))
        problems.push(`the machine index does not name ${model.display_name}, the strongest model the ${shortHardwareLabel(hw)} holds`);
      const speed = speedWithBasis(rowFor(view, model));
      if (!row.includes(speed))
        problems.push(`the machine index gives the ${shortHardwareLabel(hw)} a speed on ${model.display_name} that is not the ${speed.replace(/<[^>]*>/g, '')} its own page prints`);
      const link = esc(calcLink({ hw: hw.id, model: model.id }, data));
      if (!row.includes(link))
        problems.push(`the ${shortHardwareLabel(hw)}'s price on the machine index does not open the calculator on it running ${model.display_name}`);
    }
    const days = view.calc ? view.calc.breakevenDays : undefined;
    const want =
      days === undefined
        ? '<span class="dim">needs a price</span>'
        : days === null
          ? '<span class="dim">never</span>'
          : `<b>${esc(fmtDuration(days))}</b>`;
    if (!row.includes(`<td class="k-fig">${want}</td>`))
      problems.push(`the machine index prices the ${shortHardwareLabel(hw)} at something other than "${want.replace(/<[^>]*>/g, '')}"`);
  }

  for (const p of machinePages)
    if (!index.links.includes(p)) problems.push(`the machine index does not list ${p}`);

  const orphanCrumb = meta.filter(
    (p) => machinePages.includes(p.path) && !p.html.includes('<a href="/hardware/">Hardware</a>'),
  );
  for (const p of orphanCrumb.slice(0, 3))
    problems.push(`${p.path} does not put the machine index above it in its breadcrumbs`);

  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} problem${problems.length === 1 ? '' : 's'} with the machine index`);
  }
  console.log(
    `  the machine index lists all ${machinePages.length} machines, each with the count, the strongest model, the speed and the pay-back its own page prints, and sits above every one of them in its breadcrumbs`,
  );
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
    // the other 53 pages answer with the models one machine holds and the other does not,
    // and checkSharedHeadroom() holds the second half of their answer
    if (runsOnlyOn(va, vb).length || runsOnlyOn(vb, va).length) continue;
    const path = hardwareComparePath(a, b);
    const html = meta.find((m) => m.path === path)?.html ?? '';
    const rows = contextHeadroom(va.rows.map((r) => r.model), a, b, data);
    const section = html.split('<h2>The same models, not to the same length</h2>')[1]?.split('<h2>')[0] ?? '';
    if (!rows.length) {
      flat++;
      if (section) problems.push(`${path} holds both machines to the same length everywhere and still claims a difference`);
      // a same-silicon pair says it under its own heading, where the equal memory is
      // one line of a longer answer rather than the whole of the finding
      const saidIt = sameSilicon(a, b)
        ? html.includes('<h2>The same machine inside</h2>')
        : html.includes('<h2>Memory is not what separates them</h2>');
      if (!saidIt) problems.push(`${path} does not say that memory separates the two machines nowhere`);
      if (!html.includes('there is no model one holds and the other does not')) problems.push(`${path} does not say the two machines hold the same models at every context`);
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
 * The mirror of checkHeadroom(), for the 53 pages it skips. Where one machine holds models
 * the other cannot, the page names those models and then says what the same memory buys on
 * the models the two machines share, which is length. The figures in that sentence are easy
 * to get subtly wrong — the wrong machine named as the roomier one, a count that drifts from
 * the data, a window that is not the longest the calculator offers — so every one of them is
 * worked out again here from the data rather than read back off the page. The rule: a page
 * with an extra-models section says it when at least one shared model reaches different
 * lengths, says nothing when none does, and no other page says it at all.
 */
function checkSharedHeadroom() {
  const problems: string[] = [];
  let said = 0;
  let silent = 0;
  const MARK = '<p>The extra memory buys context as well.';
  for (const [a, b] of hardwarePairs(data)) {
    const st = defaultState(data);
    const va = computeView({ ...st, hw: a.id }, data);
    const vb = computeView({ ...st, hw: b.id }, data);
    const extraA = runsOnlyOn(va, vb);
    const extraB = runsOnlyOn(vb, va);
    const path = hardwareComparePath(a, b);
    const html = meta.find((m) => m.path === path)?.html ?? '';
    const para = html.split(MARK)[1]?.split('</p>')[0] ?? '';
    if (!extraA.length && !extraB.length) {
      // these say it under their own heading, in the words checkHeadroom() holds them to
      if (para) problems.push(`${path} holds the same models on both machines and still claims the extra memory buys context`);
      continue;
    }
    const [roomier, tighter, tighterView] = extraA.length >= extraB.length ? [a, b, vb] : [b, a, va];
    if ((roomier.usable_memory_gb ?? 0) < (tighter.usable_memory_gb ?? 0))
      problems.push(`${path} names the ${shortHardwareLabel(roomier)} as the roomier machine, and it has the less usable memory of the two`);
    const rows = sharedHeadroom(roomier, tighter, tighterView, data);
    const widest = widestHeadroom(rows);
    if (!rows.length || !widest) {
      silent++;
      if (para) problems.push(`${path} takes every shared model to the same length on both machines and still claims the extra memory buys context`);
      continue;
    }
    said++;
    if (!para) {
      problems.push(`${path} takes ${rows.length} shared model${rows.length === 1 ? '' : 's'} further on the ${shortHardwareLabel(roomier)} and does not say so`);
      continue;
    }
    const shared = fitsOf(tighterView).length;
    if (!para.includes(`Of the ${shared} models both machines hold`))
      problems.push(`${path} does not say the two machines share ${shared} models at ${Math.round(st.ctx / 1024)}k`);
    const counted = rows.length === 1 ? 'one runs' : `${rows.length} run`;
    if (!para.includes(`${counted} to a longer window on the ${esc(hardwareLabel(roomier))}`))
      problems.push(`${path} does not say that ${rows.length} of those reach a longer window on the ${shortHardwareLabel(roomier)}`);
    // the model named has to be the one whose two windows are furthest apart, and both of
    // its figures have to be the ones the data gives, not the pair of some other model
    if (!para.includes(`${esc(widest.model.display_name)} reaches ${ctxLabel(widest.a!)}</a> there against ${ctxLabel(widest.b!)} on the ${esc(hardwareLabel(tighter))}`))
      problems.push(`${path} does not name ${widest.model.display_name} at ${ctxLabel(widest.a!)} against ${ctxLabel(widest.b!)}, the widest gap between the two machines`);
    const link = esc(calcLink({ hw: roomier.id, model: widest.model.id, ctx: widest.a! }, data));
    if (!para.includes(`href="${link}"`))
      problems.push(`${path} does not open the calculator on ${widest.model.display_name} on the ${shortHardwareLabel(roomier)} at ${ctxLabel(widest.a!)}`);
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} head-to-head${problems.length === 1 ? '' : 's'} do not say what the extra memory buys on the models both machines hold`);
  }
  console.log(`  ${said + silent} head-to-heads where one machine holds models the other cannot: ${said} also say how much further the shared models go, ${silent} that they go no further`);
}

/**
 * Seven Strix Halo boxes carry the same GPU with the same memory at the same bandwidth,
 * and they sit $2,095 apart. A page putting two of them together is the one place on the
 * site where the interesting figure is the price and every other row is a tie, so it is
 * also the one place where the page could quietly say the wrong thing: print a gap that
 * is not the gap, or let the table's two speed cells read as a race between machines
 * that are the same part benchmarked twice.
 *
 * So this holds three claims. The pair really is the same GPU, memory and bandwidth in
 * the data. The money the page names is the money between the two prices. And no such
 * page calls one side faster than the other.
 */
function checkSameSilicon() {
  const problems: string[] = [];
  let pages = 0;
  for (const [a, b] of sameSiliconPairs(data)) {
    pages++;
    const path = hardwareComparePath(a, b);
    const html = meta.find((m) => m.path === path)?.html ?? '';
    if (!html) {
      problems.push(`${path} is a same-silicon pair with no page`);
      continue;
    }
    if (gpuPart(a) !== gpuPart(b) || a.unified_memory_gb !== b.unified_memory_gb || a.memory_bandwidth_gbs !== b.memory_bandwidth_gbs || a.usable_memory_gb !== b.usable_memory_gb)
      problems.push(`${path} pairs two machines that are not the same GPU, memory and bandwidth`);
    const gap = fmtUsd(Math.abs((a.price_usd ?? 0) - (b.price_usd ?? 0)), { cents: false });
    if (!html.includes(`the whole question on this page is the ${gap} between them`))
      problems.push(`${path} does not name ${gap}, the gap between its two prices`);
    if (unesc(html).includes('× faster'))
      problems.push(`${path} calls one of two identical parts faster than the other`);
    if (!html.includes(`${a.usable_memory_gb} GB of that memory to the GPU`))
      problems.push(`${path} does not say how much of the memory either machine leaves to the GPU`);
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} same-silicon head-to-head${problems.length === 1 ? '' : 's'} do not hold to the data`);
  }
  console.log(`  ${pages} head-to-heads between boxes built on the same GPU, memory and bandwidth, each naming the price between them and neither side faster`);
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
 * The mirror of `checkShorterFits`, on the model pages. The same 45 rows say
 * something different from this side: not "the machine runs one more model" but
 * "the model runs on a cheaper machine than this page names", which on 12 of the
 * 16 pages contradicts the headline figure in the answer box unless the page says
 * so. So every row is recomputed from fit() here rather than read back off the
 * page, and the check holds both sides: a page with machines to name must name
 * them all, in order, at the right window and the right footprint; a page with
 * none may claim none; no machine may appear in both tables; and the answer box
 * may only promise a cheaper machine where there is one.
 */
function checkShorterMachines() {
  const problems: string[] = [];
  const ctx = data.defaults.context.default_tokens;
  let pages = 0;
  let rows = 0;
  let links = 0;
  let cheaper = 0;
  for (const m of data.models) {
    const path = `/models/${m.id}/`;
    const html = meta.find((p) => p.path === path)?.html ?? '';
    const runners = runnersFor(m, data);
    const want = runners.length ? machinesShorter(m, data) : [];
    const found = html.match(/<h2>(\w+) more machines?, at a shorter window<\/h2>([\s\S]*?)(?=<h2>|<\/article>)/);
    // the answer box only promises a cheaper machine where the cheapest of these
    // undercuts the cheapest machine the page's own table names
    const undercuts =
      want[0] != null && want[0].hw.price_usd != null && runners[0]?.hw.price_usd != null && want[0].hw.price_usd < runners[0].hw.price_usd;
    const promised = html.includes('Cheaper at a shorter window');
    if (undercuts && !promised) problems.push(`${path} runs on a machine cheaper than the one it calls cheapest and does not say so in its answer box`);
    if (!undercuts && promised) problems.push(`${path} promises a cheaper machine at a shorter window, and there is none`);
    if (undercuts) {
      cheaper++;
      if (!html.includes(`<a href="/hardware/${esc(want[0].hw.id)}/">${esc(hardwareLabel(want[0].hw))}</a> at ${priceWithScope(want[0].hw)}, which holds it at ${ctxLabel(want[0].ctx)}`))
        problems.push(`${path} does not name the ${hardwareLabel(want[0].hw)} at ${ctxLabel(want[0].ctx)} as the cheaper machine in its answer box`);
    }
    if (!want.length) {
      if (found) problems.push(`${path} names machines that hold it at a shorter window, and there are none`);
      continue;
    }
    if (!found) {
      problems.push(`${path} is held by ${want.length} more machine${want.length === 1 ? '' : 's'} at a shorter window and does not say so`);
      continue;
    }
    pages++;
    if (found[1] !== sentenceCase(numberWord(want.length)))
      problems.push(`${path} heads that section "${found[1]} more", where ${want.length} machines hold it at a shorter window`);
    // the paragraph above the table carries two figures of its own: what the model
    // needs at the context everything above is priced at, which is what makes the
    // column beside it mean anything, and the price the page's own table starts at,
    // which is the whole point of the section where a shorter window undercuts it
    if (!found[2].includes(`needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, ctx) ?? 0))}.`))
      problems.push(`${path} does not say it needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, ctx) ?? 0))} at ${ctxLabel(ctx)} above that table`);
    if (!found[2].includes(`starts at ${priceWithScopeText(runners[0].hw)}.`))
      problems.push(`${path} does not say its own table starts at ${priceWithScopeText(runners[0].hw)} above that table`);
    const listed = found[2].match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr>[\s\S]*?<\/tr>/g) ?? [];
    if (listed.length !== want.length) {
      problems.push(`${path} lists ${listed.length} machines that hold it at a shorter window, not the ${want.length} there are`);
      continue;
    }
    const alreadyListed = new Set(runners.map((r) => r.hw.id));
    listed.forEach((row, i) => {
      const r = want[i];
      rows++;
      const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1]);
      const text = (c: string) => (c ?? '').replace(/<span class="c-quant">[\s\S]*?<\/span>/g, '').replace(/<[^>]*>/g, '').trim();
      if (alreadyListed.has(r.hw.id))
        problems.push(`${path} lists ${hardwareLabel(r.hw)} as holding it only at a shorter window, where it holds it at ${ctxLabel(ctx)}`);
      if (!(cells[0] ?? '').includes(`href="/hardware/${esc(r.hw.id)}/"`))
        problems.push(`${path} does not name ${hardwareLabel(r.hw)} in the row that holds it at ${ctxLabel(r.ctx)}`);
      if ((cells[1] ?? '').trim() !== priceWithScope(r.hw))
        problems.push(`${path} prints ${text(cells[1]) || 'nothing'} as the price of ${hardwareLabel(r.hw)}, which is ${priceWithScopeText(r.hw)}`);
      if (text(cells[2]) !== ctxLabel(r.ctx))
        problems.push(`${path} prints ${text(cells[2]) || 'nothing'} as the longest window ${hardwareLabel(r.hw)} holds it at, where it holds it to ${ctxLabel(r.ctx)}`);
      if (text(cells[3]) !== fmtGb(r.needGb))
        problems.push(`${path} prints ${text(cells[3]) || 'nothing'} as what it needs on ${hardwareLabel(r.hw)} at ${ctxLabel(r.ctx)}, where it needs ${fmtGb(r.needGb)}`);
      // the window is the way in as well as the answer, and it may only open one
      // that machine actually holds
      const href = esc(calcLink({ hw: r.hw.id, model: m.id, ctx: r.ctx }, data));
      if (!(cells[2] ?? '').includes(`href="${href}"`))
        problems.push(`${path} prints ${ctxLabel(r.ctx)} for ${hardwareLabel(r.hw)} and does not open the calculator on it at that window`);
      else links++;
    });
  }
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} fault${problems.length === 1 ? '' : 's'} in what model pages say about the machines that hold them at a shorter window`);
  }
  console.log(`  ${pages} model pages name ${rows} machines that hold them below ${ctxLabel(ctx)}, ${cheaper} of them cheaper than the page's own cheapest`);
  console.log(`  ${links} of those windows open the calculator on that machine and model at that window`);
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
  // the index at /hardware/ is a list rather than a machine, so it is not one of these
  const machines = meta.filter((p) => p.path.startsWith('/hardware/') && p.path !== '/hardware/');
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

/**
 * The leaderboard's "Cheapest machine that runs it" column names a machine and its
 * price, and the price is the way into the calculator on that pair — the same rule the
 * machine and model pages use, where the figure a cell prints is the link. A price that
 * opened the wrong machine, the wrong model or a machine that does not hold the model
 * would send a reader to a configuration the row does not describe, so every link is
 * recomputed here from the data rather than read back off the page. The column is
 * measured at the context the calculator starts at, and one model fits nowhere there:
 * that row names the cheapest machine that holds it at a shorter window, marks the
 * window and opens the calculator at it, which is held to the data here the same way.
 */
function checkLeaderboardLinks() {
  const html = meta.find((p) => p.path === '/leaderboard/')?.html ?? '';
  const problems: string[] = [];
  const seen = new Set<string>();
  const ranked = data.models
    .filter((m) => m.frontier_equivalent?.score != null)
    .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!)
    .filter((m) => {
      if (seen.has(m.display_name)) return false;
      seen.add(m.display_name);
      return true;
    });
  const notes = html.split('<p class="note">').slice(1).map((p) => p.split('</p>')[0]);
  let linked = 0;
  let shortened = 0;
  for (const m of ranked) {
    const row = html.split('<tr>').find((r) => r.includes(`href="/models/${esc(m.id)}/"`));
    if (!row) {
      problems.push(`/leaderboard/ has no row for ${m.display_name}`);
      continue;
    }
    const cheapest = cheapestPerFamily(runnersFor(m, data)).slice().sort((a, b) => a.hw.price_usd! - b.hw.price_usd!)[0];
    if (!cheapest) {
      // Nothing holds this model at the context the column is measured at. Where a
      // machine holds it at a shorter window the cell names that machine, its price and
      // that window, and opens the calculator there; where none does, the cell may say
      // so and promise nothing. The model's own page has to name the same machine, or
      // the two pages answer the same question differently.
      const shorter = machinesShorter(m, data)[0];
      if (!shorter) {
        if (row.includes('/?hw=')) problems.push(`/leaderboard/ opens the calculator for ${m.display_name}, which nothing on the list runs`);
        else if (!row.includes('nothing on the list')) problems.push(`/leaderboard/ does not say that nothing on the list runs ${m.display_name}`);
        continue;
      }
      const wantShort = `<a href="/hardware/${esc(shorter.hw.id)}/">${esc(hardwareLabel(shorter.hw))}</a> <a class="dim" href="${esc(calcLink({ hw: shorter.hw.id, model: m.id, ctx: shorter.ctx }, data))}">${fmtUsd(shorter.hw.price_usd)}</a>`;
      if (row.includes(wantShort) && row.includes(`at ${ctxLabel(shorter.ctx)}`)) shortened++;
      else problems.push(`/leaderboard/ does not open ${m.display_name} on the ${shortHardwareLabel(shorter.hw)} at ${fmtUsd(shorter.hw.price_usd)} and ${ctxLabel(shorter.ctx)}, which is the cheapest machine that holds it`);
      if (row.includes('nothing on the list'))
        problems.push(`/leaderboard/ says nothing on the list runs ${m.display_name}, which the ${shortHardwareLabel(shorter.hw)} holds at ${ctxLabel(shorter.ctx)}`);
      if (!notes.some((p) => p.includes(esc(m.display_name)) && p.includes(ctxLabel(shorter.ctx))))
        problems.push(`/leaderboard/ prices ${m.display_name} at ${ctxLabel(shorter.ctx)} and no note under the table says that row is measured at a shorter window`);
      if (!(meta.find((p) => p.path === `/models/${m.id}/`)?.links ?? []).includes(`/hardware/${shorter.hw.id}/`))
        problems.push(`/leaderboard/ says the ${shortHardwareLabel(shorter.hw)} holds ${m.display_name}, and /models/${m.id}/ does not name that machine`);
      continue;
    }
    const want = `<a class="dim" href="${esc(calcLink({ hw: cheapest.hw.id, model: m.id }, data))}">${fmtUsd(cheapest.hw.price_usd)}</a>`;
    if (row.includes(want)) linked++;
    else problems.push(`/leaderboard/ does not open ${m.display_name} on the ${shortHardwareLabel(cheapest.hw)} at ${fmtUsd(cheapest.hw.price_usd)}`);
  }
  // The hosted rows are the table's yardstick, and four claims hold them to the data.
  // The fourth is the one a phone turns into a fault: what marks the block as hosted is
  // said once above it, because a row is a block on a narrow screen and eight rows each
  // saying it is eight blocks of the same sentence before the first real answer.
  const hostedRows = html.split('<tr class="is-hosted">').slice(1).map((r) => r.split('</tr>')[0]);
  const hosted = [...(data.defaults.frontier_reference ?? [])];
  if (hostedRows.length !== hosted.length)
    problems.push(`/leaderboard/ prints ${hostedRows.length} hosted rows against the ${hosted.length} hosted models in the data`);
  for (const r of hostedRows) {
    const name = r.match(/<td class="[^"]*c-model">([^<]+)/)?.[1] ?? 'a hosted model';
    if (r.includes('/?hw=')) problems.push(`/leaderboard/ offers to run ${name} on hardware you can buy`);
    const ref = hosted.find((h) => esc(h.name) === name);
    if (!ref) {
      problems.push(`/leaderboard/ prints a hosted row for ${name}, which is not in the data`);
      continue;
    }
    if (ref.score_alt != null && !r.includes(`or ${ref.score_alt} with reasoning turned down`))
      problems.push(`/leaderboard/ does not give ${name} the ${ref.score_alt} the index scores it at with reasoning turned down`);
    if (/download/i.test(r))
      problems.push(`/leaderboard/ tells the reader inside ${name}'s own row that a hosted model is not a download, which a phone repeats once a row`);
  }
  const marker = 'You cannot download any of these';
  const said = html.split(marker).length - 1;
  if (said !== 1)
    problems.push(`/leaderboard/ says a hosted model is not a download ${said} times, and it belongs once, in the heading above the hosted rows`);
  else if (hostedRows.length && html.indexOf(marker) > html.indexOf('<tr class="is-hosted">'))
    problems.push('/leaderboard/ says what the hosted rows are after the first of them rather than above the block');
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(
      problems.length === 1
        ? '1 claim on /leaderboard/ does not match the data behind it'
        : `${problems.length} claims on /leaderboard/ do not match the data behind them`,
    );
  }
  console.log(`  /leaderboard/ opens the calculator on ${linked + shortened} model-and-machine pairs, one a row${shortened ? `, ${shortened} of them at the shorter window that machine holds the model at` : ''}`);
  const withAlt = hosted.filter((h) => h.score_alt != null).length;
  console.log(
    `  /leaderboard/ ranks ${hostedRows.length} hosted models alongside the open ones, ${withAlt} of them also at the score the index gives them with reasoning turned down, and says once above the block that none of them is a download`,
  );
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

// Which machines get a head-to-head: the middle of each family's range by price, the
// one most people cross-shop; then every graphics card against every other, since a card
// is bought as a part and a part is what people put against another part; then every
// memory tier of one machine against the others, which is the question left once you
// have picked the box; and last, each box against the cheapest box built on the same
// GPU with the same memory, where the whole question is what the dearer one charges on
// top. The machine pages link to the ones they appear in. The pairing
// lives in src/versus-card.ts, so that the card build and the page build cut the same
// list and agree on names.
const flagships = flagshipMachines(data);

const headToHeads = new Map<string, { href: string; other: Hardware }[]>();
for (const [a, b] of hardwarePairs(data)) {
  const href = hardwareComparePath(a, b);
  for (const [self, other] of [[a, b], [b, a]] as const)
    headToHeads.set(self.id, [...(headToHeads.get(self.id) ?? []), { href, other }]);
}

// The line of links a machine page ends its comparisons on. Grouped by the question each
// pair answers, so the twelve the RTX PRO 6000 is in read as two short answers rather than
// one wall, and a memory pair names only the size instead of repeating the machine the
// reader is already on. The grouping and its wording live in src/versus-card.ts, beside the
// rules that cut the pairs, so the page cannot group a pair the build did not make.
const machineMatchUps = hardwarePairs(data).length;

function headToHeadNote(hw: Hardware): string {
  const groups = headToHeadGroups(hw, headToHeads.get(hw.id) ?? []);
  if (!groups.length) return '';
  const sentences = groups.map(
    (g, i) =>
      `${i === 0 ? 'Head to head with' : 'With'} ${g.lead}: ${g.links
        .map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`)
        .join(' \u00b7 ')}.`,
  );
  return `<p class="note">${sentences.join(' ')} There are <a href="/compare/">${machineMatchUps} machine match-ups on the site</a>.</p>`;
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

  // What runs each model, worked out once: the row's own cell wants the cheapest, and
  // the note under the table wants the models where the cheapest answer needed a
  // shorter window than the rest of the column is measured at. Tencent Hy3 is the one
  // today — nothing holds it at 32k and a Mac Studio holds it at 16k — and answering
  // "nothing on the list" there contradicted its own page, which prices it on that
  // machine.
  const leaderCtx = data.defaults.context.default_tokens;
  const placed = unique.map((m, idx) => {
    const cheapest = cheapestPerFamily(runnersFor(m, data)).slice().sort((a, b) => a.hw.price_usd! - b.hw.price_usd!)[0] ?? null;
    return { m, next: unique[idx + 1], score: m.frontier_equivalent!.score!, cheapest, shorter: cheapest ? null : machinesShorter(m, data)[0] ?? null };
  });

  // A machine, its price as the way into the calculator, and the window where that is
  // not the one the column is measured at. Both cases are drawn here, so the markup
  // and the link cannot drift apart between them.
  const hwCell = (hw: Hardware, m: Model, at: number | null) =>
    `<a href="/hardware/${esc(hw.id)}/">${esc(hardwareLabel(hw))}</a> <a class="dim" href="${esc(calcLink(at == null ? { hw: hw.id, model: m.id } : { hw: hw.id, model: m.id, ctx: at }, data))}">${fmtUsd(hw.price_usd)}</a>${hw.price_scope === 'card_only' ? '<span class="dim">, card only</span>' : ''}${at == null ? '' : ` <span class="dim">at ${ctxLabel(at)}</span>`}`;

  const rows = placed
    .map(({ m, next, score, cheapest, shorter }) => `<tr>
  <td class="c-model"><a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a><span class="c-quant">${esc(m.quantisation)}</span></td>
  <td class="c-score"><span class="bar"><span style="width:${((score / max) * 100).toFixed(1)}%"></span></span><b>${score}</b>${m.frontier_equivalent?.estimated ? '<abbr title="Artificial Analysis estimated this score rather than running the full suite">*</abbr>' : ''}</td>
  <td class="c-tier">${tierScale(m, data)} ${tierLabel(m, data)}</td>
  <td class="c-caps">${dotRow(m)}</td>
  <td class="c-gb">${fmtGb(m.weights_gb)}</td>
  <td class="c-hw">${cheapest ? hwCell(cheapest.hw, m, null) : shorter ? hwCell(shorter.hw, m, shorter.ctx) : '<span class="dim">nothing on the list</span>'}</td>
  <td class="c-vs">${next ? `<a href="/compare/${slug(m.id)}-vs-${slug(next.id)}/">vs ${esc(next.display_name)}</a>` : ''}</td>
</tr>`)
    .join('');

  const shortened = placed.filter((p) => p.shorter);

  // The hosted models sit at the top of the table for scale, and each of them used to
  // carry the sentence that said so. On a wide screen that is one line inside a row;
  // on a phone, where a row is a block, it was the same sentence eight times before
  // the reader reached the first model they can actually download. It is said once
  // now, in a heading above the block, and the row keeps the one thing only it knows:
  // the figure the index gives that model with its reasoning turned down, which is in
  // the data and was printed nowhere on the site.
  const hostedHeading = `<tr class="is-frontier"><th colspan="7">Hosted models, here for scale. You cannot download any of these; they run in someone else’s data centre.</th></tr>`;

  const frontierRows = refs
    .map(
      (r) => `<tr class="is-hosted">
  <td class="c-model">${esc(r.name)}<span class="c-quant">hosted</span></td>
  <td class="c-score"><span class="bar"><span style="width:${((r.score / max) * 100).toFixed(1)}%"></span></span><b>${r.score}</b></td>
  <td class="c-tier" colspan="3">${r.score_alt == null ? '' : `<span class="dim">or ${r.score_alt} with reasoning turned down</span>`}</td>
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
<p class="lede">${unique.length} open-weight models you can download and run at home, ranked on the ${esc(data.defaults.frontier_basis?.name ?? 'intelligence index')}, with the hosted models from Anthropic and OpenAI dropped into the same table for scale. Each row links to what it takes to run it, and each price opens the calculator on that machine running that model. For which machine pays back soonest at each level, see <a href="/best/">best buys by usage</a>; for two of them side by side, <a href="/compare/">every head-to-head</a>.</p>
${gap != null ? `<p>The short version: the best open model here scores <b>${best.frontier_equivalent!.score}</b> — that is ${esc(best.display_name)}, and it wants ${fmtGb(best.weights_gb)} of memory. The best hosted model scores <b>${refs[0].score}</b>. That gap of ${gap} points is the thing no amount of hardware closes.</p>` : ''}
${stack(`<table class="board">
<thead><tr><th>Model</th><th>Score</th><th>Class</th><th>Good at</th><th>Weights</th><th>Cheapest machine that runs it</th><th>Next down</th></tr></thead>
<tbody>${hostedHeading}${frontierRows}${rows}</tbody>
</table>`, { fig: 1, labels: { 5: 'Cheapest', 6: 'Then' } })}
${shortened.length ? `<p class="note">Each machine named is the cheapest that holds that model at the ${ctxLabel(leaderCtx)} context the calculator starts at. ${shortened.map(({ m, shorter }) => `${esc(m.display_name)} fits nowhere at that length: its row names the machine that holds it at ${ctxLabel(shorter!.ctx)}, which is marked beside the price`).join('. ')}.</p>` : ''}
${unplaced.length ? `<p class="note">${unplaced.length} more open models on this site have no index score yet, so they are not in the table: ${unplaced.map((m) => `<a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a>`).join(', ')}. Their pages show what each one needs and what runs it.</p>` : ''}
<p class="note">${esc(data.defaults.frontier_basis?.estimated_note ?? '')} Scores are the ${esc(data.defaults.frontier_basis?.name ?? '')}${data.defaults.frontier_basis?.url ? ` (<a href="${esc(data.defaults.frontier_basis.url)}" rel="noopener">source</a>)` : ''}, read on ${esc(data.defaults.frontier_basis?.checked ?? '')}. Hybrid models are shown at their reasoning or highest-effort score, with the alternative noted on each model's page and, on the hosted rows above, beside the score itself. Weights are the download; a running model also needs a cache the size of your context window, so see <a href="/how-much-memory/">how much memory each size really takes</a>. The dots are, in order: ${CAPABILITY_KEYS.map((k) => CAP_SHORT[k].toLowerCase()).join(', ')}.</p>
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

/**
 * A model page lists the machines that hold it at the context the site prices
 * everything at, and that list decided what the page said the model costs. It is
 * a setting, not a property of the model: on 16 of the 55 models a machine misses
 * at 32k and holds it at 16k, 8k or 4k, and on 12 of those the cheapest machine
 * that runs the model at all is cheaper than anything the page named. Llama 3.3
 * 70B reads "cheapest machine that runs it, $3,449" and runs on a $1,700 box if
 * you keep the window to 16k. These rows cannot go in the table above, where
 * every speed and pay-back is quoted at 32k, so they get their own.
 */
function shorterMachinesSection(m: Model, rows: ShorterMachine[], cheapest: Runner, ctx: number): string {
  if (!rows.length) return '';
  const body = rows
    .map(
      (r) => `<tr>
  <td class="c-hw"><a href="/hardware/${esc(r.hw.id)}/">${esc(hardwareLabel(r.hw))}</a></td>
  <td>${priceWithScope(r.hw)}</td>
  <td><a href="${esc(calcLink({ hw: r.hw.id, model: m.id, ctx: r.ctx }, data))}">${ctxLabel(r.ctx)}</a></td>
  <td>${fmtGb(r.needGb)}</td>
</tr>`,
    )
    .join('');
  const some = rows.length === 1 ? 'One more machine holds' : `${sentenceCase(numberWord(rows.length))} more machines hold`;
  // The money is the point of this section, and it only reads as money where the
  // shorter window actually buys a cheaper machine. Both prices carry their scope,
  // because a graphics card's price is not a whole computer's and the cheapest
  // row in either table is sometimes one and sometimes the other.
  const price =
    rows[0].hw.price_usd != null && cheapest.hw.price_usd != null && rows[0].hw.price_usd < cheapest.hw.price_usd
      ? ` ${rows.length === 1 ? 'It is' : 'The cheapest of those is'} the ${esc(shortHardwareLabel(rows[0].hw))} at ${priceWithScopeText(rows[0].hw)}. The table above starts at ${priceWithScopeText(cheapest.hw)}.`
      : ` ${rows.length === 1 ? 'It is not' : 'None of them is'} cheaper than the table above, which starts at ${priceWithScopeText(cheapest.hw)}.`;
  return `<h2>${sentenceCase(numberWord(rows.length))} more machine${rows.length === 1 ? '' : 's'}, at a shorter window</h2>
<p>The table above lists the machines that run it at ${ctxLabel(ctx)}, the context the calculator starts on, where ${esc(m.display_name)} needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, ctx) ?? 0))}. ${some} it at a shorter window, because the weights are the same size either way and the key-value cache is not.${price}</p>
${stack(`<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Longest window it fits</th><th>Needs there</th></tr></thead>
<tbody>${body}</tbody>
</table>`, { fig: 2 })}
<p class="note">One machine per family, cheapest first, from the same list as the table above. Each window is the longest setting the calculator offers that the machine still holds this model at, and it opens the calculator on that machine at that length. What it needs there is the weights plus the key-value cache at that window, measured against the memory each machine's GPU can address, which that machine's own page gives.</p>

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
  // The mirror of what the machine pages gained: machines that miss this model at
  // the context the table above is priced at and hold it at a shorter window. A
  // page that has no machine at all is the case above, already answered in full,
  // so this is only for the pages that have both.
  const shorterMachines = runners.length ? machinesShorter(m, data) : [];
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
  ${shorterMachines[0] && shorterMachines[0].hw.price_usd != null && cheapest.hw.price_usd != null && shorterMachines[0].hw.price_usd < cheapest.hw.price_usd ? `<div class="answer-row"><span class="answer-k">Cheaper at a shorter window</span><span class="answer-v"><a href="/hardware/${esc(shorterMachines[0].hw.id)}/">${esc(hardwareLabel(shorterMachines[0].hw))}</a> at ${priceWithScope(shorterMachines[0].hw)}, which holds it at ${ctxLabel(shorterMachines[0].ctx)}</span></div>
  ` : ''}${bestValue && bestValue.hw.id !== cheapest.hw.id ? `<div class="answer-row"><span class="answer-k">Shortest pay-back</span><span class="answer-v"><a href="/hardware/${esc(bestValue.hw.id)}/">${esc(hardwareLabel(bestValue.hw))}</a> — ${esc(verdictLine(bestValue.view))}</span></div>` : ''}
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

${cheapest ? shorterMachinesSection(m, shorterMachines, cheapest, ctx) : ''}<h2>The specifics</h2>
<dl class="specs">
  <dt>Parameters</dt><dd>${fmtNum(m.params_b, 1)}B${m.active_params_b && m.active_params_b < m.params_b ? `, of which ${fmtNum(m.active_params_b, 1)}B are active per token` : ''}</dd>
  <dt>Quantisation</dt><dd>${esc(m.quantisation)}${alsoAt.map((o) => ` — also listed here at <a href="/models/${esc(o.id)}/">${esc(o.quantisation)}</a>, which is ${fmtGb(o.weights_gb)}`).join('')}</dd>
  <dt>Weights on disk</dt><dd>${fmtGb(m.weights_gb)}</dd>
  <dt>KV cache</dt><dd>${fmtGb(kvCacheGb(m, ctx))} at ${Math.round(ctx / 1024)}k context${m.architecture?.note ? ` — ${esc(m.architecture.note)}` : ''}. <a href="/how-much-memory/">How weights and cache add up</a>.</dd>
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
<p class="note">Speed and memory are at ${Math.round(state.ctx / 1024)}k context, the setting the calculator starts on; the memory column is the weights plus the cache for that much of it. There is <a href="/how-much-memory/">a page on how that sum works, and what each size needs</a>. The longest context is the longest setting the calculator offers that this machine still holds the model at, cache included, and each one opens the calculator on that model at that length. A figure tagged <i>memory</i> is one this machine ran out of room for, and the rest are stopped by the model's own limit or by the end of the list.</p>
${hidden.length ? `<p class="note">${runsOnNote(hidden.length, unscored, modelLink)}</p>` : ''}` : ''}

${shorterWindowSection(hw, shorter, state.ctx)}${range.length || rivals.length ? `<h2>Other machines to weigh against it</h2>
${stack(`<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Memory</th><th>Models that fit</th><th>Pay-back</th></tr></thead>
<tbody>
${range.length ? `<tr class="is-frontier"><th colspan="5">${esc(familyHeading(hw))}</th></tr>${range.map(relatedRow).join('')}` : ''}
${rivals.length ? `<tr class="is-frontier"><th colspan="5">Nearest in price elsewhere on the list</th></tr>${rivals.map(relatedRow).join('')}` : ''}
</tbody>
</table>`, { fig: 4 })}
<p class="note">Every row uses the same defaults as the figures above: ${fmtTokens(state.usage)} tokens a day at ${state.ratio}:1 input to output, ${Math.round(state.ctx / 1024)}k context, and each machine's strongest model that fits, counted against the same ${view.rows.length} models.${(() => { const n = cardScopeNote([...range, ...rivals]); return n ? ` ${n}` : ''; })()}</p>` : ''}
${headToHeadNote(hw)}

<h2>The specifics</h2>
<dl class="specs">
  <dt>Chip</dt><dd>${esc(hw.chip)}${hw.chip_variant ? ` — ${esc(hw.chip_variant)}` : ''}</dd>
  <dt>Memory bandwidth</dt><dd>${hw.memory_bandwidth_gbs ? `${hw.memory_bandwidth_gbs} GB/s` : 'unknown'}</dd>
  <dt>Usable by the GPU</dt><dd>${hw.usable_memory_gb ?? 'unknown'} GB${hw.notes ? ` — ${esc(hw.notes)}` : ''}</dd>
  <dt>Power under load</dt><dd>${hw.load_watts ?? 'unknown'} W (${esc(powerSourceLabel(hw))})${hw.load_watts_note ? ` — ${esc(hw.load_watts_note)}` : ''}</dd>
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
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/hardware/', label: 'Hardware' }, { href: `/hardware/${hw.id}/`, label: label }],
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
function sameListSection(a: Hardware, b: Hardware, va: View, la: string, lb: string, ctxK: number, rows: ReturnType<typeof contextHeadroom>): string {
  const counted = va.rows.length;
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

/**
 * The 53 head-to-heads where one machine holds models the other cannot answer the memory
 * gap with that list and stop. It is half an answer: the models the two machines *share*
 * are not held to the same length either, because fit turns on usable memory and the
 * cache grows into whatever the weights leave spare. This is the other half, in one
 * paragraph under the heading that promised it rather than a second table beside it:
 * these pages already run 611 to 795 words and already carry a table about memory. The
 * longest window the roomier machine reaches is the link into the calculator.
 */
function sharedLengthLine(roomier: Hardware, tighter: Hardware, tighterView: View, la: string, lb: string, ctxK: number): string {
  const rows = sharedHeadroom(roomier, tighter, tighterView, data);
  const widest = widestHeadroom(rows);
  if (!rows.length || !widest) return '';
  const shared = fitsOf(tighterView).length;
  const count = shared === 1
    ? `The one model both machines hold at ${ctxK}k runs to a longer window on the ${esc(la)}`
    : `Of the ${shared} models both machines hold at ${ctxK}k, ${rows.length === 1 ? 'one runs' : `${rows.length} run`} to a longer window on the ${esc(la)}`;
  const link = calcLink({ hw: roomier.id, model: widest.model.id, ctx: widest.a! }, data);
  return `<p>The extra memory buys context as well. ${count}: the weights are a fixed size and the KV cache is not, so what the weights leave spare is what a longer context grows into. <a href="${esc(link)}">${esc(widest.model.display_name)} reaches ${ctxLabel(widest.a!)}</a> there against ${ctxLabel(widest.b!)} on the ${esc(lb)}, each the longest window the calculator offers that the machine still holds it at.</p>`;
}

/**
 * Two boxes built on the same hardware. Everything the rest of the page compares is equal
 * by construction, so this says what is the same and why, and hands the reader the one
 * thing that is not: the price. It replaces the memory section rather than joining it,
 * since the same usable memory means there is nothing for that section to find.
 */
function sameSiliconSection(a: Hardware, b: Hardware, va: View, ctxK: number, fa: ModelRow[], fb: ModelRow[]): string {
  const options = [...data.defaults.context.options].sort((x, y) => x - y);
  const span = `${ctxLabel(options[0])} to ${ctxLabel(options[options.length - 1])}`;
  const [cheap, dear] = (a.price_usd ?? 0) <= (b.price_usd ?? 0) ? [a, b] : [b, a];
  const gap = fmtUsd(Math.abs((a.price_usd ?? 0) - (b.price_usd ?? 0)), { cents: false });

  const ta = shownTps(fa[0]);
  const tb = shownTps(fb[0]);
  const speedLine = ta != null && tb != null && ta === tb
    ? ` They run those models at the same speed too: decoding reads the weights out of memory, and both read them at ${a.memory_bandwidth_gbs} GB/s.`
    : ta != null && tb != null
      ? ` The two speeds in the table above are not equal, and the reason is where each figure came from rather than what either machine is: ${esc(fa[0].throughput.source)} for the ${esc(shortHardwareLabel(a))}, ${esc(fb[0].throughput.source)} for the ${esc(shortHardwareLabel(b))}. A runtime, a build or a thermal limit moves a figure on identical hardware.`
      : '';

  // one of these pairs is the PRO variant of the other's chip, which the data records
  // and the page should say rather than quietly smooth over, even though the graphics
  // half of the two names is identical and the graphics half is what runs the model
  const variantLine = (a.chip_variant ?? '') !== (b.chip_variant ?? '')
    ? ` Their chips are not listed identically, ${esc(a.chip_variant ?? '')} against ${esc(b.chip_variant ?? '')}, but the graphics part is the same on both and the graphics part is what runs the model.`
    : '';

  // where the two draw different power the pay-back gap is not the price alone, and
  // a page that says it is would be overstating what its own table shows
  const wattsDiffer = a.load_watts != null && b.load_watts != null && a.load_watts !== b.load_watts;
  const forSame = ta != null && tb != null && ta === tb ? 'for the same models at the same speed' : 'for the same models';
  // and where one of the two figures is a stand-in the page cannot say either machine
  // draws it. On four of these pairs the boxes carry the same watts because the data
  // has a figure for one of them and borrows it for the other, so the equality is the
  // data agreeing with itself rather than two machines measuring the same.
  const standIn = [a, b].filter((h) => h.load_watts_status === 'stand_in');
  const onlyGap = wattsDiffer
    ? standIn.length
      ? `the only other thing between them is the ${Math.abs((a.load_watts ?? 0) - (b.load_watts ?? 0))} W in the power row`
      : `every difference in pay-back on this page comes from that and from the ${Math.abs((a.load_watts ?? 0) - (b.load_watts ?? 0))} W between them`
    : 'every difference in pay-back on this page comes from that and nothing else';
  const watts = a.load_watts == null || b.load_watts == null
    ? ''
    : standIn.length
      ? ` The power row is not two measurements: ${standIn.length === 2 ? 'both figures are stand-ins borrowed from the nearest hardware the data has' : `the ${esc(shortHardwareLabel(standIn[0]))}'s ${standIn[0].load_watts} W is a stand-in borrowed from the nearest hardware the data has a figure for`}, so ${wattsDiffer ? 'the gap between them' : 'the two matching'} is a fact about the data rather than about the machines. This page still prices the electricity into both from those numbers.`
      : wattsDiffer
        ? ` The ${esc(shortHardwareLabel(a.load_watts! > b.load_watts! ? a : b))} draws ${Math.max(a.load_watts, b.load_watts)} W under load against ${Math.min(a.load_watts, b.load_watts)} W, and this page prices the electricity into both.`
        : ` Both draw ${a.load_watts} W under load, and this page prices the electricity into both.`;

  return `<h2>The same machine inside</h2>
<p>Both have the same ${esc(gpuPart(a))}, the same ${a.unified_memory_gb} GB of memory and the same ${a.memory_bandwidth_gbs} GB/s to read it at, and both leave ${a.usable_memory_gb} GB of that memory to the GPU. What a machine holds is decided by that last figure, so they hold the same ${fa.length} models, and not only at ${ctxK}k of context: across all ${va.rows.length} models the calculator counts, at every context from ${span}, there is no model one holds and the other does not.${speedLine}${variantLine}</p>
<p>So the whole question on this page is the ${gap} between them. The ${esc(shortHardwareLabel(dear))} costs that much more than the ${esc(shortHardwareLabel(cheap))} ${forSame}, and ${onlyGap}.${watts} What else separates them is not something this site measures: it prices what a machine holds, how fast it runs it and what it draws, and everything from the case to the ports to the warranty is yours to weigh against the ${gap}.</p>`;
}

/**
 * The same machine a generation apart. The rule that paired them holds the memory equal,
 * so the newer chip sells no extra room and the reader's question is what it does sell;
 * and the older machine's price in this data is the one it launched at, on a machine its
 * maker has stopped selling. Neither is something the rest of the page can say. The table
 * prints two bandwidth figures without saying which of them the money buys, and it prints
 * a price without saying that the price is history.
 */
function generationSection(old: Hardware, now: Hardware): string {
  const lo = shortHardwareLabel(old);
  const ln = shortHardwareLabel(now);
  const bwOld = old.memory_bandwidth_gbs;
  const bwNow = now.memory_bandwidth_gbs;
  // every one of these pairs today reads its memory faster on the newer chip, which is
  // the whole of what the money buys. The other two branches exist because the claim has
  // to follow the data rather than the other way round.
  const bandwidth = bwOld == null || bwNow == null
    ? `The data does not have a bandwidth figure for both of them.`
    : bwNow > bwOld
      ? `What separates them is bandwidth: the ${esc(now.chip)} reads its memory at ${bwNow} GB/s where the ${esc(old.chip)} reads it at ${bwOld}. Decoding reads the whole model out of memory for every token it writes, so that is the figure the speeds in the table follow.`
      : bwNow === bwOld
        ? `It does not buy bandwidth either: both read their memory at ${bwNow} GB/s, and decoding reads the whole model out of memory for every token it writes, so that is the figure the speeds in the table follow.`
        : `The older chip has the wider path to memory, ${bwOld} GB/s against ${bwNow}. Decoding reads the whole model out of memory for every token it writes, so that is the figure the speeds in the table follow.`;

  // the core counts are the other thing a generation changed, and the data lists them
  const variant = (old.chip_variant ?? '') !== (now.chip_variant ?? '') && old.chip_variant && now.chip_variant
    ? ` The ${esc(now.chip)} here is listed as ${esc(now.chip_variant)}, against the ${esc(old.chip)}'s ${esc(old.chip_variant)}.`
    : '';

  // the find that made this section worth writing: on every one of these pairs the newer
  // machine's wattage is a stand-in, and the figure standing in for it is the older
  // machine's own published one. Two equal numbers in the power row therefore read as
  // "the new chip is no more efficient" when what they mean is "nobody has measured it",
  // and the electricity priced into both pay-back figures comes from the older machine.
  const standIn = now.load_watts_status === 'stand_in';
  const borrowed = standIn && now.load_watts != null && now.load_watts === old.load_watts && old.load_watts_status === 'published';
  const power = borrowed
    ? `<p class="note">The two power figures are equal for a reason that is not about either machine: ${esc(brandOf(now))} has not published one for the ${esc(now.chip)}, so the data stands the ${esc(old.chip)}'s published ${old.load_watts} W in for it and this page prices the electricity into both columns from that. Read it as a placeholder, not as a finding that the newer chip draws the same.</p>`
    : standIn
      ? `<p class="note">The ${old.load_watts === now.load_watts ? 'two power figures are equal because the' : 'power figure for the'} ${esc(now.chip)} is a stand-in rather than a published one, and this page prices the electricity in its column from it.</p>`
      : '';

  const when = discontinuedOn(old);
  const stopped = when
    ? `${esc(brandOf(old))} stopped selling the ${esc(lo)} on ${when}`
    : `The ${esc(lo)} is the previous generation`;

  return `<h2>What the newer chip buys</h2>
<p>These are the same machine a generation apart, in the same case and at the same memory size, so this is the upgrade question rather than a choice between two things on sale. ${bandwidth}${variant}</p>
${power}
<p>${stopped}, so the ${fmtUsd(old.price_usd!, { cents: false })} above is the price it launched at, and every figure on this page for it is priced at that. A used or refurbished one costs whatever it costs, and pay-back follows the price rather than the machine. <a href="${esc(calcLink({ hw: old.id }, data))}">Open the calculator on the ${esc(lo)}</a> and put in what you would actually pay; the years move with it. Its <a href="/hardware/${esc(old.id)}/">own page</a> has what the data records about buying one now.</p>`;
}

/**
 * A machine's power draw is the running cost in every pay-back figure it has, and for
 * 30 of the 56 machines here the data has no figure for that machine at all: it borrows
 * one from the nearest hardware it does have. A generation head-to-head already says so
 * at length, because there the borrowed figure is the other column's own, so this covers
 * the comparisons that had nothing. The marker on the row says which number it is; this
 * says what a borrowed number does and does not tell you, and what it is paying for.
 */
function standInPowerNote(a: Hardware, b: Hardware, explainedBelow: boolean): string {
  const sides = [a, b].filter((h) => h.load_watts_status === 'stand_in' && h.load_watts != null);
  if (!sides.length || explainedBelow) return '';
  if (sides.length === 2) {
    // two memory tiers of one machine share a chip, so equal watts is what a reader
    // expects there and calling it a non-finding would be answering nobody's question
    const match = a.load_watts !== b.load_watts
      ? 'the gap between them is not a difference between these two machines'
      : a.family === b.family && a.chip === b.chip
        ? 'what the row shows is one borrowed figure printed twice'
        : 'the two matching says nothing about either machine';
    return `<p class="note">Neither power figure above is measured on the machine beside it. Both are stand-ins borrowed from the nearest hardware the data does have, so ${match}. Each machine's page names the figure it borrows and why. Every pay-back figure on this page prices its electricity from these numbers.</p>`;
  }
  const s = sides[0];
  const other = s.id === a.id ? b : a;
  return `<p class="note">The ${s.load_watts} W beside the ${esc(shortHardwareLabel(s))} is a stand-in, not a figure for that machine: the data borrows it from the nearest hardware it does have, and the machine's own page names which and why. So the two figures above are not like for like${other.load_watts === s.load_watts ? ', and their matching says nothing about either machine' : ''}, and the electricity in its pay-back here is priced from a borrowed number.</p>`;
}

function comparePage(a: Hardware, b: Hardware): string {
  const st = defaultState(data);
  const va = computeView({ ...st, hw: a.id }, data);
  const vb = computeView({ ...st, hw: b.id }, data);
  const fa = fitsOf(va);
  const fb = fitsOf(vb);
  const la = hardwareLabel(a);
  const lb = hardwareLabel(b);
  // two memory tiers of one machine: the name is said once and the sizes carry the page
  const tiers = memoryTierNames(a, b);
  // the same hardware in two boxes: the rest of the page compares rows that are equal on
  // both sides, so the price gap has to be said outright rather than left to be inferred
  const twins = sameSilicon(a, b);
  // the same machine a generation apart: the family and the memory size are equal, so the
  // name is said once at each end and the two chips carry the middle, which is the pair of
  // words the reader typed
  const gens = generationNames(a, b);
  // both sides of a same-silicon pair carry the same memory, so a title that prints the
  // size twice spends a search result's 60 characters saying it again instead of naming
  // the second machine, which is the half of the pair the reader has not typed yet
  const withoutSize = (h: Hardware) => shortHardwareLabel(h).replace(new RegExp(`, ${h.unified_memory_gb}GB$`), '');
  const heading = tiers
    ? `${tiers.machine}: ${tiers.a} vs ${tiers.b}`
    : gens
    ? `${gens.machine} ${gens.a} vs ${gens.b}, ${gens.size}`
    : twins
      ? `${withoutSize(a)} vs ${shortHardwareLabel(b)}`
      : `${shortHardwareLabel(a)} vs ${shortHardwareLabel(b)}`;
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
  // where both hold the same models, what the spare memory buys is context, and that is
  // the answer the section below prints and the description above has to promise
  const headroom = contextHeadroom(va.rows.map((r) => r.model), a, b, data);
  const [roomier, tighter, extra, roomierView] = extraA.length >= extraB.length
    ? [la, lb, extraA, va]
    : [lb, la, extraB, vb];
  const shown = extra.slice(0, 6);
  const [roomierHw, tighterHw, tighterView] = extraA.length >= extraB.length ? [a, b, vb] : [b, a, va];
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
${extra.length > shown.length ? `<p class="note">${extra.length - shown.length} more, on the <a href="/hardware/${esc(extraA.length >= extraB.length ? a.id : b.id)}/">${esc(roomier)} page</a>.</p>` : ''}
${sharedLengthLine(roomierHw, tighterHw, tighterView, roomier, tighter, ctxK)}`
    : twins
      ? ''
      : sameListSection(a, b, va, la, lb, ctxK, headroom);

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
<h1>${esc(tiers || twins || gens ? heading : `${la} vs ${lb}`)} for local AI</h1>
<p class="lede">${machineVerdict(a, b, va, vb, data)}</p>
<table class="board compare">
<thead><tr><th></th><th><a href="/hardware/${esc(a.id)}/">${esc(la)}</a></th><th><a href="/hardware/${esc(b.id)}/">${esc(lb)}</a></th></tr></thead>
<tbody>
${row('Price', priceWithScope(a), priceWithScope(b))}
${row('Memory', `${a.unified_memory_gb} GB`, `${b.unified_memory_gb} GB`)}
${row('Usable by the GPU', `${a.usable_memory_gb ?? '?'} GB`, `${b.usable_memory_gb ?? '?'} GB`)}
${row('Memory bandwidth', a.memory_bandwidth_gbs ? `${a.memory_bandwidth_gbs} GB/s` : 'unknown', b.memory_bandwidth_gbs ? `${b.memory_bandwidth_gbs} GB/s` : 'unknown')}
${row('Power under load', powerWithSource(a), powerWithSource(b))}
${row('Models that fit', String(fa.length), String(fb.length))}
${row('Best model it runs', fa[0] ? `<a href="/models/${esc(fa[0].model.id)}/">${esc(fa[0].model.display_name)}</a>` : '—', fb[0] ? `<a href="/models/${esc(fb[0].model.id)}/">${esc(fb[0].model.display_name)}</a>` : '—')}
${row('Speed on that model', speedCell(fa[0]), speedCell(fb[0]))}
${row('Pay-back on that model', esc(verdictLine(va)), esc(verdictLine(vb)))}
</tbody>
</table>
${standInPowerNote(a, b, (!!gens && b.load_watts_status === 'stand_in') || (!!twins && a.load_watts != null && b.load_watts != null))}
<p><a class="cta" href="${esc(calcLink({ hw: a.id }, data))}">Run the numbers on the ${esc(la)}</a> · <a href="${esc(calcLink({ hw: b.id }, data))}">or the ${esc(lb)}</a></p>
${twins ? sameSiliconSection(a, b, va, ctxK, fa, fb) : ''}
${gens ? generationSection(a, b) : ''}
${likeForLike}
${usageSection}
${extraSection}
<h2>The assumptions behind both columns</h2>
<p class="note">Both columns use the same usage: ${fmtTokens(st.usage)} tokens a day at ${st.ratio}:1 input to output, ${ctxK}k of context, $${st.kwh} per kWh, and today's API prices held flat. Speeds marked <i>estimated</i> are worked out from memory bandwidth rather than measured, and pay-back scales with them.${(() => { const n = cardScopeNote([a, b]); return n ? ` ${n}` : ''; })()} Change any of it in the calculator.</p>
<p class="note">More head to head: <a href="/hardware/${esc(a.id)}/">everything the ${esc(la)} runs</a> · <a href="/hardware/${esc(b.id)}/">everything the ${esc(lb)} runs</a> · <a href="/compare/">every other match-up</a> · <a href="/best/">the quickest pay-back at each level of use</a> · <a href="/leaderboard/">every model against the frontier</a></p>
</article>`;
  return pageShell(
    {
      title: titleOf([
        `${heading} for local LLMs`,
        heading,
      ]),
      description: descOf(
        twins
          ? (() => {
              const [cheap, dear] = (a.price_usd ?? 0) <= (b.price_usd ?? 0) ? [a, b] : [b, a];
              const gap = fmtUsd(Math.abs((a.price_usd ?? 0) - (b.price_usd ?? 0)), { cents: false });
              const c = shortHardwareLabel(cheap);
              const d = shortHardwareLabel(dear);
              return [
                `The ${d} costs ${gap} more than the ${c} for the same GPU, the same ${a.unified_memory_gb} GB and the same ${fa.length} models. What the money buys, and whether either pays back.`,
                `${d} against ${c}: ${gap} apart for the same GPU, the same ${a.unified_memory_gb} GB and the same ${fa.length} models. What the money buys.`,
                `${d} or ${c}: the same machine inside, ${gap} apart. What the money buys, and whether it pays back.`,
                `${d} or ${c}: the same machine inside, ${gap} apart.`,
              ];
            })()
          : gens
          ? (() => {
              // the answer a search result should carry on an upgrade question is what the
              // newer chip actually changes, which is the bandwidth, not the memory
              const bw = a.memory_bandwidth_gbs != null && b.memory_bandwidth_gbs != null
                ? [
                    `The ${gens.b} reads its memory at ${b.memory_bandwidth_gbs} GB/s against the ${gens.a}'s ${a.memory_bandwidth_gbs}, on the same ${a.unified_memory_gb} GB and the same ${fa.length} models. What a generation buys.`,
                    `${gens.b} against ${gens.a} at ${gens.size}: the same ${fa.length} models, ${b.memory_bandwidth_gbs} GB/s against ${a.memory_bandwidth_gbs}. What a generation buys, and whether it pays back.`,
                    `${gens.machine} ${gens.a} or ${gens.b}, ${gens.size}: the same ${fa.length} models, and what the newer chip's bandwidth buys.`,
                  ]
                : [];
              return [
                ...bw,
                `${gens.machine} ${gens.a} or ${gens.b}, ${gens.size}: the same ${fa.length} models either way. What a generation buys, and whether it pays back.`,
                `${gens.machine} ${gens.a} or ${gens.b}, ${gens.size}: what a generation buys, and whether it pays back.`,
              ];
            })()
          : tiers
          ? fa.length !== fb.length
            ? [
                `The ${tiers.machine} with ${tiers.b} holds ${fb.length} of the ${va.rows.length} open models here, with ${tiers.a} ${fa.length}. What the extra memory buys, and whether it pays back.`,
                `${tiers.machine}, ${tiers.b} against ${tiers.a}: ${fb.length} models fit against ${fa.length}. What the extra memory buys, and whether it pays back.`,
                `${tiers.machine}, ${tiers.a} or ${tiers.b}: what the extra memory buys, and whether it pays back.`,
              ]
            : headroom.length
              ? [
                  `The ${tiers.machine} holds the same ${fa.length} models with ${tiers.a} or ${tiers.b}. What the extra memory buys is context: ${headroom.length} of them run to a longer window.`,
                  `${tiers.machine}, ${tiers.a} or ${tiers.b}: the same ${fa.length} models either way, and ${headroom.length} of them run to a longer window with ${tiers.b}.`,
                  `${tiers.machine}, ${tiers.a} or ${tiers.b}: the same models either way, ${headroom.length} of them to a longer window.`,
                ]
              : [
                  `The ${tiers.machine} holds the same ${fa.length} models with ${tiers.a} or ${tiers.b}, to the same length at every context, so the extra memory buys nothing here.`,
                  `${tiers.machine}, ${tiers.a} or ${tiers.b}: the same ${fa.length} models to the same length either way, so the memory buys nothing here.`,
                  `${tiers.machine}, ${tiers.a} or ${tiers.b}: the extra memory buys nothing local AI can use.`,
                ]
          : [
              `${fa.length} of the ${va.rows.length} open models here fit the ${shortHardwareLabel(a)}, ${fb.length} the ${shortHardwareLabel(b)}. Memory, speed, price and which pays back sooner.`,
              `${fa.length} models fit the ${shortHardwareLabel(a)}, ${fb.length} the ${shortHardwareLabel(b)}. Memory, speed, price and which pays back sooner.`,
              `${shortHardwareLabel(a)} against ${shortHardwareLabel(b)}: memory, speed, what each runs and which pays back sooner.`,
            ],
      ),
      canonical: hardwareComparePath(a, b),
      ogImage: versusCardPath(hardwareComparePath(a, b)),
      // the index is the step above a match-up, so the trail a search result
      // prints reads Sunk Cost / Head to head / this pair
      crumbs: [
        { href: '/', label: 'Sunk Cost' },
        { href: '/compare/', label: 'Head to head' },
        { href: '#', label: heading },
      ],
    },
    body,
    data,
  );
}

/* --------------------------- the memory question --------------------------- */

const CTX = defaultState(data).ctx;
const NEARLY = data.defaults.nearly_fits_ratio;
/** the context lengths the calculator offers, up to the longest most models will do */
const CTX_STEPS = data.defaults.context.options.filter((c) => c <= 131072);
/** every machine a memory table should consider: on sale, priced, memory published */
const buyable = data.hardware.filter(
  (h) => h.price_usd != null && (h.generation ?? 'current') === 'current' && h.usable_memory_gb != null,
);
const holds = (hw: Hardware, m: Model, ctx: number) => fit(m, hw, ctx, NEARLY).status === 'fits';

/**
 * What a machine holds is a claim about what to buy it for, so it counts the models
 * you would choose today: the same set the calculator shows before you ask for the
 * older ones, and the same set every machine page counts. What a model *needs* is a
 * different question, and a superseded model needs it just the same, so the tables by
 * size below count everything listed here and mark the superseded ones.
 */
const currentModels = data.models.filter((m) => m.generation !== 'legacy');
const fitCount = (hw: Hardware, ctx: number) => currentModels.filter((m) => holds(hw, m, ctx)).length;
const strongestThatFits = (hw: Hardware, ctx: number) =>
  currentModels
    .filter((m) => holds(hw, m, ctx) && m.frontier_equivalent?.score != null)
    .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!)[0] ?? null;

const machineLink = (hw: Hardware) =>
  `<a href="/hardware/${esc(hw.id)}/">${esc(hardwareLabel(hw))}</a> <span class="dim">${fmtUsd(hw.price_usd)}${hw.price_scope === 'card_only' ? ', card only' : ''}</span>`;

/**
 * Two models of the same size whose caches are furthest apart: the plainest
 * evidence that the cache is an architecture choice rather than a function of
 * parameter count. Grouped on the rounded parameter count so the sentence that
 * says "the same N billion parameters" is true of both.
 */
function widestCacheSpread(ctx: number): [Model, Model] | null {
  const groups = new Map<number, { m: Model; kv: number }[]>();
  for (const m of data.models) {
    const kv = kvCacheGb(m, ctx);
    if (kv == null) continue;
    const key = Math.round(m.params_b);
    groups.set(key, [...(groups.get(key) ?? []), { m, kv }]);
  }
  let widest: [Model, Model] | null = null;
  let gap = 0;
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => b.kv - a.kv);
    const [most, least] = [sorted[0], sorted[sorted.length - 1]];
    if (most.kv - least.kv > gap) {
      gap = most.kv - least.kv;
      widest = [most.m, least.m];
    }
  }
  return widest;
}

/**
 * The model someone means when they type a size. Close enough to the number they
 * typed that calling it a 70B is honest, then the strongest of those, and where
 * that ties the plainer name, which is the base model rather than a distill of it.
 */
function nearestSize(paramsB: number): Model | null {
  const near = data.models
    .filter((m) => m.weights_gb != null && Math.abs(m.params_b - paramsB) <= paramsB * 0.1)
    .sort(
      (a, b) =>
        (b.frontier_equivalent?.score ?? 0) - (a.frontier_equivalent?.score ?? 0) ||
        Math.abs(a.params_b - paramsB) - Math.abs(b.params_b - paramsB) ||
        a.display_name.length - b.display_name.length,
    );
  return near[0] ?? null;
}

/** A model's name, with the quantisation where the site lists the same model twice. */
function namePlusQuant(m: Model): string {
  return sharedNames.has(m.display_name) ? `${m.display_name} at ${m.quantisation}` : m.display_name;
}

/**
 * The stretch of the memory ladder over which the strongest model you can run
 * does not change. Buying more memory buys more models and a longer window; it
 * does not always buy a better one, and the ladder says where that stops being
 * true.
 */
function strongestPlateau(ladder: Hardware[], ctx: number): { model: Model; from: Hardware; to: Hardware; next: Model | null; nextHw: Hardware | null } | null {
  const top = ladder.map((hw) => ({ hw, m: strongestThatFits(hw, ctx) }));
  let best: { model: Model; from: Hardware; to: Hardware } | null = null;
  let i = 0;
  while (i < top.length) {
    const m = top[i].m;
    let j = i;
    while (j + 1 < top.length && top[j + 1].m?.id === m?.id) j++;
    if (m && (!best || j - i > ladder.indexOf(best.to) - ladder.indexOf(best.from)))
      best = { model: m, from: top[i].hw, to: top[j].hw };
    i = j + 1;
  }
  if (!best || best.from.id === best.to.id) return null;
  const after = top.slice(ladder.indexOf(best.to) + 1).find((x) => x.m && x.m.id !== best!.model.id);
  return { ...best, next: after?.m ?? null, nextHw: after?.hw ?? null };
}

function memoryRow(m: Model): string {
  const kv = kvCacheGb(m, CTX);
  const need = footprintGb(m, CTX);
  const hw = cheapestThatHolds(need, data);
  return `<tr>
  <td class="c-model"><a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a><span class="c-quant">${esc(m.quantisation)}</span>${m.generation === 'legacy' ? '<span class="c-quant">older</span>' : ''}</td>
  <td>${fmtNum(m.params_b, 1)}B</td>
  <td>${fmtGb1(m.weights_gb)}</td>
  <td>${fmtGb1(kv)}</td>
  <td><b>${fmtGb1(need)}</b></td>
  <td class="c-hw">${hw ? machineLink(hw) : '<span class="dim">nothing on this list</span>'}</td>
  <td>${hw ? `<a href="${esc(calcLink({ hw: hw.id, model: m.id, ctx: CTX }, data))}">Run the numbers</a>` : ''}</td>
</tr>`;
}

function memoryPage(): string {
  const kctx = `${Math.round(CTX / 1024)}k`;
  const anchor = nearestSize(70);
  const anchorNeed = anchor ? footprintGb(anchor, CTX) : null;
  const anchorHolder = cheapestThatHolds(anchorNeed, data);

  // weights per billion parameters, over the four-bit models, which is nearly all of them
  const fourBit = data.models.filter((m) => /q4|mxfp4/i.test(m.quantisation) && m.weights_gb != null);
  const perB = fourBit.map((m) => m.weights_gb! / m.params_b);
  const midPerB = median(perB);
  const caches = data.models.map((m) => kvCacheGb(m, CTX)).filter((v): v is number => v != null);

  // the three columns of the context table: the cheapest machine at each of the
  // memory sizes these boxes are actually sold in
  const columns = [32, 64, 128]
    .map((installed) =>
      buyable.filter((h) => h.unified_memory_gb === installed).sort((a, b) => a.price_usd! - b.price_usd!)[0],
    )
    .filter(Boolean) as Hardware[];

  const ctxRows = CTX_STEPS.map(
    (c) => `<tr>
  <th>${Math.round(c / 1024)}k${c === CTX ? ' <span class="dim">default</span>' : ''}</th>
  ${columns.map((hw) => `<td>${fitCount(hw, c)}</td>`).join('')}
</tr>`,
  ).join('');

  // one machine per level of usable memory, cheapest at that level
  const ladder = [...new Set(buyable.map((h) => h.usable_memory_gb!))]
    .sort((a, b) => a - b)
    .map((gb) => buyable.filter((h) => h.usable_memory_gb === gb).sort((a, b) => a.price_usd! - b.price_usd!)[0]);

  const plateau = strongestPlateau(ladder, CTX);
  const ladderRows = ladder
    .map((hw) => {
      const top = strongestThatFits(hw, CTX);
      return `<tr>
  <td><b>${fmtGb1(hw.usable_memory_gb)}</b></td>
  <td>${hw.unified_memory_gb} GB</td>
  <td class="c-hw">${machineLink(hw)}</td>
  <td>${fitCount(hw, CTX)}</td>
  <td class="c-model">${top ? `<a href="/models/${esc(top.id)}/">${esc(top.display_name)}</a> <span class="dim">${esc(tierName(top, data))}</span>` : '<span class="dim">none</span>'}</td>
</tr>`;
    })
    .join('');

  const bands = SIZE_BANDS.map((band) => {
    // ordered by what they ask of a machine, which is what the page is about.
    // The same reading the share card draws, so the two cannot disagree.
    const b = bandFit(band, data, CTX);
    if (!b) return '';
    const { sized, biggest, holder, held, heldBy } = b;
    const ms = sized.map((x) => x.m);
    const needs = sized.map((x) => x.need);
    const size =
      band.max === Infinity
        ? `over ${band.min} billion parameters`
        : band.min === 0
          ? `under ${band.max} billion parameters`
          : `between ${band.min} and ${band.max} billion parameters`;
    return `<section>
<h2>${esc(band.question)}</h2>
<p>${ms.length} model${ms.length === 1 ? '' : 's'} on this site ${ms.length === 1 ? 'is' : 'are'} ${esc(size)}. The weights come to ${gbRange(ms.map((m) => m.weights_gb ?? NaN))}, and at ${kctx} context the cache adds ${gbRange(ms.map((m) => kvCacheGb(m, CTX) ?? NaN))} on top. That puts the whole job at ${gbRange(needs)} of memory at once. ${
      holder
        ? `The cheapest machine here that runs the hungriest of them, ${esc(namePlusQuant(biggest.m))}, is the ${esc(hardwareLabel(holder))} at ${fmtUsd(holder.price_usd)}.`
        : `No machine on this list holds the hungriest of them, ${esc(namePlusQuant(biggest.m))}, which wants ${fmtGb1(biggest.need)} at ${kctx} context.${
            held && heldBy
              ? ` The largest that does fit is ${esc(namePlusQuant(held.m))}, on the ${esc(hardwareLabel(heldBy))} at ${fmtUsd(heldBy.price_usd)}.`
              : ''
          }`
    }</p>
${stack(`<table class="board">
<thead><tr><th>Model</th><th>Parameters</th><th>Weights</th><th>Cache at ${kctx}</th><th>Needs</th><th>Cheapest machine that runs it</th><th></th></tr></thead>
<tbody>${ms.map(memoryRow).join('')}</tbody>
</table>`, { fig: 4, labels: { 5: 'Cheapest' } })}
</section>`;
  }).join('\n');

  const working = anchor ? kvWorking(anchor, CTX) : null;
  const spread = widestCacheSpread(131072);
  const short8k = anchor ? footprintGb(anchor, 8192) : null;
  const holder8k = cheapestThatHolds(short8k, data);
  const kv = data.defaults.kv_cache;

  const body = `<article class="prose">
<h1>How much memory do you need to run a local LLM?</h1>
<p class="lede">Two numbers, added together, held at the same time. The weights are a fixed download. The key-value cache grows with the context window you ask for, and on some models it ends up larger than the weights.${
    anchor && anchorNeed
      ? ` ${esc(anchor.display_name)} at ${esc(anchor.quantisation)} is ${fmtGb1(anchor.weights_gb)} of weights plus ${fmtGb1(kvCacheGb(anchor, CTX))} of cache at ${kctx} context: ${fmtGb1(anchorNeed)} in one machine.`
      : ''
  }</p>

<div class="answer">
  <div class="answer-row"><span class="answer-k">What has to fit</span><span class="answer-v">The weights, plus a cache the size of your context window. Both at once, in memory the GPU can reach.</span></div>
  ${midPerB != null ? `<div class="answer-row"><span class="answer-k">Weights at four bits</span><span class="answer-v">About ${midPerB.toFixed(2)} GB per billion parameters. Across the ${fourBit.length} four-bit models here it runs ${Math.min(...perB).toFixed(2)} GB to ${Math.max(...perB).toFixed(2)} GB.</span></div>` : ''}
  ${caches.length ? `<div class="answer-row"><span class="answer-k">Cache at ${kctx} context</span><span class="answer-v">${gbRange(caches)}, depending on the model. Architecture decides this, not parameter count.</span></div>` : ''}
  ${anchor && anchorHolder ? `<div class="answer-row"><span class="answer-k">${esc(anchor.display_name)} at ${kctx}</span><span class="answer-v">${fmtGb1(anchorNeed)}. The cheapest machine here that holds it is the <a href="/hardware/${esc(anchorHolder.id)}/">${esc(hardwareLabel(anchorHolder))}</a> at ${fmtUsd(anchorHolder.price_usd)}.</span></div>` : ''}
</div>

${anchor && anchorHolder ? `<p><a class="cta" href="${esc(calcLink({ hw: anchorHolder.id, model: anchor.id, ctx: CTX }, data))}">Run the numbers on that pairing</a></p>` : ''}

<h2>Where the cache figure comes from</h2>
<p>The weights are whatever the file weighs on disk. The cache is arithmetic. Every token in the context window leaves a key and a value behind in every layer, and all of it stays resident while the model is loaded.</p>
${working && anchor ? `<p>For ${esc(anchor.display_name)}: ${working}</p>` : ''}
<p>Two things follow. The window you ask for is a hardware decision, not a setting: on most models the cache grows in step with it, and only the ones with sliding-window layers stop growing partway. And two models of the same size can want very different amounts, because the number of key-value heads and the width of each one are architecture choices.</p>

${bands}

<h2>Context is the part people miss</h2>
<p>A longer window costs memory before it costs anything else. Here is how many of the ${currentModels.length} current models fit three machines as the window grows, counting a model only where its own context ceiling allows it.</p>
<table class="board compare">
<thead><tr><th>Context</th>${columns.map((hw) => `<th><a href="/hardware/${esc(hw.id)}/">${esc(shortHardwareLabel(hw))}</a><span class="c-quant">${fmtGb1(hw.usable_memory_gb)} usable</span></th>`).join('')}</tr></thead>
<tbody>${ctxRows}</tbody>
</table>
${
    anchor && short8k != null && anchorNeed != null && holder8k && anchorHolder && holder8k.id !== anchorHolder.id
      ? `<p>That is a shopping list, not a setting. ${esc(anchor.display_name)} needs ${fmtGb1(short8k)} at 8k context, which the ${esc(hardwareLabel(holder8k))} at ${fmtUsd(holder8k.price_usd)} holds. At ${kctx} it needs ${fmtGb1(anchorNeed)}, and the cheapest machine that holds it becomes the ${esc(hardwareLabel(anchorHolder))} at ${fmtUsd(anchorHolder.price_usd)}.</p>`
      : ''
  }
${
    spread
      ? `<p>Size is a poor guide to the cache. Two models here have the same ${Math.round(spread[0].params_b)} billion parameters: at 128k context <a href="/models/${esc(spread[0].id)}/">${esc(spread[0].display_name)}</a> wants ${fmtGb1(kvCacheGb(spread[0], 131072))} of cache and <a href="/models/${esc(spread[1].id)}/">${esc(spread[1].display_name)}</a> wants ${fmtGb1(kvCacheGb(spread[1], 131072))}. Each model's page carries its own figure.</p>`
      : ''
  }
<p>You can also make the cache smaller. ${esc(kv?.note ?? '')}${kv?.source_url ? ` (<a href="${esc(kv.source_url)}" rel="noopener">source</a>)` : ''} The calculator has that switch, and every figure on this page is at the 16-bit default.</p>

<h2>Installed memory is not usable memory</h2>
<p>The number on the box is not the number a model gets. The system takes a share, and on a machine with unified memory the GPU is only allowed to address part of the rest. This is what each machine can actually hand a model, cheapest machine shown at each level, counted against the ${currentModels.length} current models.</p>
${stack(`<table class="board">
<thead><tr><th>Usable</th><th>Installed</th><th>Cheapest machine at that level</th><th>Models that fit at ${kctx}</th><th>Strongest of them</th></tr></thead>
<tbody>${ladderRows}</tbody>
</table>`, { fig: 3, labels: { 2: 'Cheapest', 4: 'Strongest' } })}
${
    plateau
      ? `<p>Read the last column before you spend anything. From ${fmtGb1(plateau.from.usable_memory_gb)} of usable memory up to ${fmtGb1(plateau.to.usable_memory_gb)}, the strongest model on this list does not change: it is <a href="/models/${esc(plateau.model.id)}/">${esc(plateau.model.display_name)}</a> the whole way. More memory across that stretch buys more models, more context and more room to work, not a cleverer one.${
          plateau.next && plateau.nextHw
            ? ` The next step up is <a href="/models/${esc(plateau.next.id)}/">${esc(plateau.next.display_name)}</a>, and the cheapest machine that holds it is the <a href="/hardware/${esc(plateau.nextHw.id)}/">${esc(hardwareLabel(plateau.nextHw))}</a> at ${fmtUsd(plateau.nextHw.price_usd)}.`
            : ''
        }</p>`
      : ''
  }

<p class="note">Every figure is at ${kctx} context unless the row says otherwise, with the cache at 16 bits, at the quantisation named against each model. Weights are the published file sizes on each model's page; the cache is worked out from the architecture recorded there. Machines are the current ones at list price, with the memory their maker publishes and the usable share on each machine's page; graphics cards are priced as the card alone, so add the PC around one before comparing one with a complete computer. The tables by size cover all ${data.models.length} models listed here, superseded ones included and marked, because people still run them. The two tables of what a machine holds count the ${currentModels.length} current ones instead, which is what every machine page and the calculator count. To change the context, the quantisation or the cache type, <a href="${esc(calcLink({}, data))}">open the calculator</a>.</p>
</article>`;

  return pageShell(
    {
      title: titleOf(['How much memory do you need to run a local LLM?', 'How much memory to run a local LLM']),
      description: descOf([
        `Weights plus a key-value cache that grows with context. What 8B, 32B, 70B and 100B models need at ${kctx}, and the cheapest machine that holds each.`,
        `Weights plus a cache that grows with context. What 8B, 32B, 70B and 100B models need at ${kctx}, and the cheapest machine that holds each.`,
      ]),
      canonical: '/how-much-memory/',
      ogImage: MEMORY_CARD,
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/how-much-memory/', label: 'How much memory' }],
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

  // the index's own answer, so the page says something before it starts listing.
  // Every machine the table above puts against another one, which is the family
  // flagships plus the graphics cards the card grid brings in, and each of them once
  const compared = [...new Map(pairs.flatMap(({ a, b }) => [[a.id, a], [b.id, b]] as const)).values()];
  const ranked = compared
    .map((hw) => ({ hw, fits: fitsOf(hwViews.get(hw.id)!).length }))
    .sort((x, y) => y.fits - x.fits || x.hw.price_usd! - y.hw.price_usd!);
  // sorted by what each holds and then by price, so the first machine is the
  // cheapest of however many reach the top of the list rather than one of a tie
  const most = ranked[0];
  const atMost = ranked.filter((r) => r.fits === most?.fits);
  const cheapest = [...ranked].sort((x, y) => x.hw.price_usd! - y.hw.price_usd!)[0];

  // the machines compared here are no longer all machines you can buy: the generation
  // rule brings in discontinued ones, whose price in this data is the one they launched
  // at. Naming one as the cheapest that does something, with no more said, would point a
  // reader at a machine nobody sells.
  const launchNote = (xs: (Hardware | undefined)[]) => {
    const older = [...new Map(
      xs.filter((h): h is Hardware => !!h && (h.generation ?? 'current') === 'previous').map((h) => [h.id, h]),
    ).values()];
    if (!older.length) return '';
    return older.length === 1
      ? ` That is the price the ${esc(shortHardwareLabel(older[0]))} launched at, before it was discontinued.`
      : ' Both of those prices are the ones those machines launched at, before they were discontinued.';
  };

  const body = `<article class="prose">
<h1>Every head-to-head: machine against machine, model against model</h1>
<p class="lede">Every comparison on this site in one place: ${machines.length} machine match-ups and ${modelPairs(data).length} model match-ups, each row carrying the prices, the memory and the speeds the comparison itself opens with. For one machine on its own, start at <a href="/best/">best buys by usage</a> or the <a href="/leaderboard/">leaderboard</a>.</p>
${most && cheapest ? `<p>The short version: none of the ${ranked.length} machines compared here holds more than ${most.fits} of the ${modelCount} open models${atMost.length > 1 ? `, and ${atMost.length} of them hold that many` : ''}. The cheapest that does is the ${esc(shortHardwareLabel(most.hw))} at ${priceWithScopeText(most.hw)}. The cheapest machine here at all is the ${esc(shortHardwareLabel(cheapest.hw))} at ${priceWithScopeText(cheapest.hw)}, which holds ${cheapest.fits}.${launchNote([most.hw, cheapest.hw])}</p>` : ''}

<h2>Machine against machine</h2>
<p>Five kinds of match-up: one machine per family, the middle of its range by price, against every other; every graphics card against every other card, since a card is bought as a part and a part is what people put against another part; every memory tier of one machine against the others, which is the question left once you have picked the box; each box against the cheapest box built on the same GPU with the same memory, where the whole question is what the dearer one charges on top; and every discontinued machine against the one that replaced it, which is the upgrade question. The two speeds in a row are on the strongest model both machines in it can hold at ${ctxK}k of context, so they are running the same work.</p>
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

/* --------------------------- the machine index --------------------------- */

/**
 * The index of machines. `/leaderboard/` is the index of models, `/best/` ranks
 * by level of use and `/compare/` lists the match-ups; the 56 machines had no
 * list of their own, and nothing was served at `/hardware/` at all, so a reader
 * who cut a machine's address back to it got nothing.
 *
 * It answers "what hardware runs local models" as a list rather than as an
 * opinion: every configuration, what it costs, what it holds and what that pair
 * takes to pay back. Every figure is the one the machine's own page prints, taken
 * from the same view, so the index and the page behind it cannot disagree.
 */
function hardwareIndex(): string {
  const st = defaultState(data);
  const total = hwViews.values().next().value!.rows.length;

  const entries = data.hardware.map((hw) => {
    const view = hwViews.get(hw.id)!;
    return {
      hw,
      view,
      fits: fitsOf(view).length,
      model: view.model,
      days: view.calc ? view.calc.breakevenDays : undefined,
      previous: (hw.generation ?? 'current') === 'previous',
    };
  });
  const by = new Map(entries.map((e) => [e.hw.id, e] as const));

  // Families in the order of what the cheapest of them costs, and inside a
  // family the machines you can still buy first, cheapest first. That is the
  // order someone shopping reads in, and it is the order `familyRange` already
  // puts a machine's own range in on its page.
  const families = [...new Map(data.hardware.map((hw) => [hw.family, hw.family] as const)).values()]
    .map((family) => {
      const kit = data.hardware
        .filter((hw) => hw.family === family)
        .sort(
          (a, b) =>
            ((a.generation ?? 'current') === 'current' ? 0 : 1) - ((b.generation ?? 'current') === 'current' ? 0 : 1) ||
            (a.price_usd ?? Infinity) - (b.price_usd ?? Infinity),
        );
      const priced = kit.filter((hw) => hw.price_usd != null).sort((a, b) => a.price_usd! - b.price_usd!);
      return { family, kit, from: priced[0] ?? null };
    })
    .sort((a, b) => (a.from?.price_usd ?? Infinity) - (b.from?.price_usd ?? Infinity));

  const priceCell = (e: (typeof entries)[number]) => {
    const link = (label: string, cls: string) =>
      `<a class="${cls}" href="${esc(calcLink(e.model ? { hw: e.hw.id, model: e.model.id } : { hw: e.hw.id }, data))}">${label}</a>`;
    if (e.hw.price_usd == null) return `<span class="dim">not published</span> ${link('price it yourself', 'dim')}`;
    return `${link(fmtUsd(e.hw.price_usd), 'dim')}${e.hw.price_scope === 'card_only' ? '<span class="dim">, card only</span>' : ''}`;
  };

  const paybackCell = (e: (typeof entries)[number]) => {
    if (e.days === undefined) return '<span class="dim">needs a price</span>';
    if (e.days === null) return '<span class="dim">never</span>';
    return `<b>${esc(fmtDuration(e.days))}</b>`;
  };

  const rows = families
    .map(({ family, kit, from }) => {
      const fromText = !from ? '' : from.price_scope === 'card_only' ? `, from ${fmtUsd(from.price_usd)} for the card alone` : `, from ${fmtUsd(from.price_usd)}`;
      const heading = `<tr class="is-frontier"><th colspan="6">${esc(familyGroup(family))} <span class="dim">· ${kit.length === 1 ? 'one configuration' : `${kit.length} configurations`}${fromText}</span></th></tr>`;
      return (
        heading +
        kit
          .map((hw) => {
            const e = by.get(hw.id)!;
            return `<tr>
  <td class="c-hw"><a href="/hardware/${esc(hw.id)}/">${esc(hardwareLabel(hw))}</a>${e.previous ? '<span class="c-quant">discontinued</span>' : ''}</td>
  <td>${priceCell(e)}</td>
  <td>${hw.usable_memory_gb ?? '?'} GB <span class="dim">of ${hw.unified_memory_gb}</span></td>
  <td>${e.fits}</td>
  <td class="c-model">${e.model ? `<a href="/models/${esc(e.model.id)}/">${esc(e.model.display_name)}</a>, ${speedWithBasis(rowFor(e.view, e.model))}` : '<span class="dim">nothing on the list</span>'}</td>
  <td>${paybackCell(e)}</td>
</tr>`;
          })
          .join('')
      );
    })
    .join('');

  // The page's own answer, before it starts listing. The obvious claim — more
  // money, bigger model — is not what the data says: 39 of the 56 machines top
  // out at the same model, from a $999 mini to an $18,000 card. So the answer is
  // the ladder, which is the strongest model each machine holds and the cheapest
  // machine that reaches each step of it.
  const priced = entries.filter((e) => e.hw.price_usd != null).sort((a, b) => a.hw.price_usd! - b.hw.price_usd!);
  const holdAll = entries.filter((e) => e.fits === total);
  const paying = entries.filter((e) => typeof e.days === 'number').sort((a, b) => (a.days as number) - (b.days as number));
  const quickest = paying[0];
  const slowest = paying[paying.length - 1];

  const steps = [...new Map(entries.filter((e) => e.model).map((e) => [e.model!.id, e.model!] as const)).values()]
    .map((model) => {
      const on = entries.filter((e) => e.model?.id === model.id);
      const pricedOn = on.filter((e) => e.hw.price_usd != null).sort((a, b) => a.hw.price_usd! - b.hw.price_usd!);
      return { model, on, cheapest: pricedOn[0] ?? null, dearest: pricedOn[pricedOn.length - 1] ?? null };
    })
    .sort((a, b) => (a.model.frontier_equivalent?.score ?? 0) - (b.model.frontier_equivalent?.score ?? 0));
  // the step most machines are stuck on, which is the sentence's own subject
  const plateau = [...steps].sort((a, b) => b.on.length - a.on.length)[0];
  const above = steps.filter((x) => (x.model.frontier_equivalent?.score ?? 0) > (plateau?.model.frontier_equivalent?.score ?? 0));
  const cheapestAbove = above
    .map((x) => x.cheapest)
    .filter((e): e is (typeof entries)[number] => !!e)
    .sort((a, b) => a.hw.price_usd! - b.hw.price_usd!)[0] ?? null;
  const aboveCount = above.reduce((n, x) => n + x.on.length, 0);

  // A price in this data is the launch price where the machine has been
  // discontinued, and several of the machines these paragraphs name are.
  // Naming one without saying so points a reader at a price nobody sells at.
  const launchSaid = new Set<string>();
  const launchLine = (xs: ((typeof entries)[number] | null)[]) => {
    const older = [...new Map(
      xs.filter((e): e is (typeof entries)[number] => !!e && e.previous && !launchSaid.has(e.hw.id)).map((e) => [e.hw.id, e] as const),
    ).values()];
    if (!older.length) return '';
    for (const e of older) launchSaid.add(e.hw.id);
    const names = older.map((e) => `the ${esc(shortHardwareLabel(e.hw))}`);
    const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
    return older.length === 1
      ? ` ${sentenceCase(list)} is discontinued, so its price is the one it launched at.`
      : ` ${sentenceCase(list)} are discontinued, so their prices are the ones they launched at.`;
  };

  const body = `<article class="prose">
<h1>Every machine that runs local models, priced</h1>
<p class="lede">All ${data.hardware.length} configurations this site prices, in one table: what each costs, how much of its memory the GPU can use, how many of the ${total} open models it holds at ${ctxLabel(st.ctx)} of context, the strongest of those, and how long that pair takes to pay for itself rather than renting the same model. Families are in order of what the cheapest of them costs. For the quickest pay-back at a given amount of use, see <a href="/best/">best buys by usage</a>; for two machines side by side, <a href="/compare/">every head-to-head</a>; for what each model needs before you pick a box, <a href="/how-much-memory/">how much memory you need</a>.</p>
${plateau && quickest && slowest ? `<p>The short version: more money buys memory, and memory buys a stronger model in only ${numberWord(steps.length)} steps. Of the ${entries.length} machines here, ${plateau.on.length} top out at the same model, ${esc(plateau.model.display_name)}${plateau.cheapest && plateau.dearest ? `: everything from the ${esc(shortHardwareLabel(plateau.cheapest.hw))} at ${priceWithScopeText(plateau.cheapest.hw)} to the ${esc(shortHardwareLabel(plateau.dearest.hw))} at ${priceWithScopeText(plateau.dearest.hw)}` : ''}. ${aboveCount ? `${sentenceCase(numberWord(aboveCount))} hold something stronger${cheapestAbove ? `, and the cheapest of those is the ${esc(shortHardwareLabel(cheapestAbove.hw))} at ${priceWithScopeText(cheapestAbove.hw)}` : ''}, while ${holdAll.length === 1 ? 'one machine holds' : `${numberWord(holdAll.length)} hold`} all ${total} models on the list.` : ''} Between those steps the money buys speed, spare memory and a longer window rather than a better model.${launchLine([plateau.cheapest, plateau.dearest, cheapestAbove])}</p>
<p>Pay-back runs the other way, because the strongest model a machine holds is also the slowest thing it can run. At ${esc(fmtTokens(st.usage))} tokens a day on that model, the quickest figure in the table is <b>${esc(fmtDuration(quickest.days as number))}</b>, on the ${esc(shortHardwareLabel(quickest.hw))}, and the slowest is ${esc(fmtDuration(slowest.days as number))}. Nothing here pays for itself inside a decade at that usage. What changes the answer is using the machine much harder, or running a smaller model on it, and <a href="/best/">best buys by usage</a> ranks both.${launchLine([quickest])}</p>` : ''}
${stack(`<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Usable memory</th><th>Models it holds, of ${total}</th><th>Strongest model it holds, and its speed</th><th>Pays back in</th></tr></thead>
<tbody>${rows}</tbody>
</table>`, { fig: 5, labels: { 2: 'Usable', 3: 'Models', 4: 'Strongest model' } })}
<p class="note">Usable memory is what the GPU can address, which is less than the memory fitted: on a Mac it follows the macOS wired limit, and on a graphics card it is the VRAM less the gigabyte llama.cpp leaves free. The count is of the ${total} current open models at ${ctxLabel(st.ctx)}; ask for a longer window and the cache grows, so fewer fit, and each machine's own page gives the length it takes every model to. Pay-back is that machine running the strongest model it holds, at ${esc(fmtTokens(st.usage))} tokens a day, ${st.ratio}:1 input to output, $${st.kwh} per kWh, and today's API prices held flat; a smaller model on the same machine pays back sooner, which is what <a href="/best/">best buys</a> ranks. Graphics cards are priced as the card alone, so add the PC around one before comparing it with a complete computer. A discontinued machine is priced at what it launched at, which is not a price you can pay today. Each price opens the calculator on that machine running the model beside it.</p>
</article>`;

  return pageShell(
    {
      title: titleOf(['Local LLM hardware: every machine, priced and measured', 'Local LLM hardware: every machine, priced']),
      description: descOf([
        `All ${data.hardware.length} machines in one table: price, usable memory, how many open models each one holds, and how long it takes to pay for itself.`,
        `All ${data.hardware.length} machines in one table: price, memory, models each one holds and how long it takes to pay for itself.`,
      ]),
      canonical: '/hardware/',
      ogImage: HARDWARE_CARD,
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/hardware/', label: 'Hardware' }],
    },
    body,
    data,
  );
}

/* --------------------------------- build --------------------------------- */

write('/leaderboard/', leaderboard());
write('/best/', bestBuys());
write('/how-much-memory/', memoryPage());
for (const m of data.models) write(`/models/${m.id}/`, modelPage(m));
write('/hardware/', hardwareIndex());
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
/**
 * A generation head-to-head is the one page on the site that prices a machine nobody
 * sells, so it has more ways to mislead than any other. The launch price is the whole
 * of its pay-back column; the memory is equal on both sides by the rule that paired
 * them, so the page's answer rests on the bandwidth; and the newer machine's wattage is
 * a stand-in borrowed from the older one, which makes two equal numbers in the power row
 * look like a finding.
 *
 * So this holds five claims. The pair really is one family, one chip tier and one memory
 * size a generation apart in the data. The page says the older side's price is a launch
 * price. It names both bandwidth figures, and calls the newer one wider only where the
 * data says it is. It says so where a power figure is standing in for another. And it
 * hands the reader a way to price the older machine at what they would actually pay.
 */
function checkGenerationPairs() {
  const problems: string[] = [];
  let pages = 0;
  let standIns = 0;
  for (const [old, now] of generationPairs(data)) {
    pages++;
    const path = hardwareComparePath(old, now);
    const html = meta.find((m) => m.path === path)?.html ?? '';
    if (!html) {
      problems.push(`${path} is a generation pair with no page`);
      continue;
    }
    const co = appleChip(old);
    const cn = appleChip(now);
    if (!co || !cn || co.tier !== cn.tier || co.gen >= cn.gen || old.family !== now.family
      || old.unified_memory_gb !== now.unified_memory_gb
      || (old.generation ?? 'current') !== 'previous' || (now.generation ?? 'current') !== 'current')
      problems.push(`${path} is not one family, one chip tier and one memory size a generation apart`);
    if (old.price_usd == null || now.price_usd == null)
      problems.push(`${path} prices pay-back on a machine with no published price`);
    if (!unesc(html).includes(`${shortHardwareLabel(old)} is the previous generation, so every figure here for it is priced at what it launched at`))
      problems.push(`${path} does not say the ${shortHardwareLabel(old)}'s price is the one it launched at`);
    const when = discontinuedOn(old);
    if (when && !html.includes(`stopped selling the ${esc(shortHardwareLabel(old))} on ${when}`))
      problems.push(`${path} does not name ${when}, the day the data says the ${shortHardwareLabel(old)} stopped being sold`);
    // the comparison table prints both bandwidths on its own, so this asks for the
    // sentence that says which of them the money buys, in the form the data supports
    const bo = old.memory_bandwidth_gbs;
    const bn = now.memory_bandwidth_gbs;
    const claim = bo == null || bn == null
      ? 'The data does not have a bandwidth figure for both of them.'
      : bn > bo
        ? `the ${now.chip} reads its memory at ${bn} GB/s where the ${old.chip} reads it at ${bo}.`
        : bn === bo
          ? `both read their memory at ${bn} GB/s,`
          : `The older chip has the wider path to memory, ${bo} GB/s against ${bn}.`;
    if (!unesc(html).includes(claim))
      problems.push(`${path} does not say what the ${now.chip} changes about reading memory, in the form the data supports`);
    if (bn != null && bo != null && bn <= bo && unesc(html).includes(`the ${now.chip} reads its memory at ${bn} GB/s where`))
      problems.push(`${path} calls the ${now.chip} the faster read when the data does not say so`);
    if (now.load_watts_status === 'stand_in' || old.load_watts_status === 'stand_in') {
      standIns++;
      if (!unesc(html).includes('stand'))
        problems.push(`${path} prints a stand-in power figure without saying it is one`);
    }
    if (!html.includes(`href="${esc(calcLink({ hw: old.id }, data))}"`))
      problems.push(`${path} gives no way to price the ${shortHardwareLabel(old)} at what a reader would pay`);
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} generation head-to-head${problems.length === 1 ? '' : 's'} do not hold to the data`);
  }
  console.log(`  ${pages} head-to-heads between a discontinued machine and the one that replaced it, each naming both bandwidths, the launch price it prices and a way to enter your own; ${standIns} say a power figure is standing in`);
}

/**
 * Electricity is the running cost in every pay-back figure on this site, and for 30 of
 * the 56 machines the data holds no power figure for the machine at all: it borrows the
 * nearest one it has. Printed bare, a borrowed watt reads as a measurement of the machine
 * beside it — and where a comparison borrows one side's figure for the other, two equal
 * numbers in the power row read as a finding about both.
 *
 * So this holds three claims wherever a power figure prints. The comparison row prints
 * exactly what the data says, marker and all, so a borrowed figure is marked where the
 * reader meets it and a measured one never wears the marker. Every page carrying a
 * borrowed figure says in words that it is one, rather than leaving it to the marker.
 * And every such comparison says what that number is paying for, which is the electricity
 * in its own pay-back column.
 */
function checkStandInPower() {
  const problems: string[] = [];
  const standIn = (h: Hardware) => h.load_watts_status === 'stand_in' && h.load_watts != null;
  const marker = /<span class="c-quant">stand-in<\/span>/g;
  let pages = 0;
  for (const [a, b] of hardwarePairs(data)) {
    const path = hardwareComparePath(a, b);
    const html = meta.find((m) => m.path === path)?.html ?? '';
    if (!html) {
      problems.push(`${path} is a machine head-to-head with no page`);
      continue;
    }
    if (!html.includes(`<tr><th>Power under load</th><td>${powerWithSource(a)}</td><td>${powerWithSource(b)}</td></tr>`))
      problems.push(`${path} does not print the power row the data says, marker and all`);
    const borrowed = [a, b].filter(standIn);
    // the marker only means something while a measured figure never wears one
    if ((html.match(marker) ?? []).length !== borrowed.length)
      problems.push(`${path} marks ${(html.match(marker) ?? []).length} power figures as stand-ins where the data has ${borrowed.length}`);
    if (!borrowed.length) continue;
    pages++;
    const prose = unesc(html).replace(marker, '');
    if (!/stand-in|stands the|standing in/.test(prose))
      problems.push(`${path} prints a borrowed power figure and only the marker says so`);
    if (!/prices (?:the|its) electricity|is priced from/.test(prose))
      problems.push(`${path} does not say what its borrowed power figure is paying for`);
  }
  let machines = 0;
  for (const h of data.hardware) {
    if (!standIn(h)) continue;
    const html = meta.find((m) => m.path === `/hardware/${h.id}/`)?.html;
    if (html == null) continue;
    machines++;
    if (!unesc(html).includes(`${h.load_watts} W (stand-in)`))
      problems.push(`/hardware/${h.id}/ prints ${h.load_watts} W without saying it is a stand-in`);
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} page${problems.length === 1 ? '' : 's'} print a borrowed power figure as if it were measured`);
  }
  console.log(`  ${machines} machines carry a borrowed power figure; the ${pages} head-to-heads that print one mark it and say what it prices`);
}

/**
 * A graphics card's price buys the card and nothing to put it in, so the pages
 * that print one have always said so. What they also said, until now, was that
 * sentence on pages where nothing on them is a card: 53 of the 86 machine
 * head-to-heads set one complete computer against another and still closed by
 * telling the reader to add a PC around a graphics card. It is a true sentence
 * answering a question the page does not raise, and a note that answers
 * questions nobody asked is how a reader learns to skip the notes.
 *
 * So the caveat is now worked out from the machines each page actually prints,
 * and this holds it to them: the sentence appears only where one of them is a
 * card, it names the card where there is one to name, and where the page has
 * none it does not mention cards at all.
 */
function checkCardScope() {
  const problems: string[] = [];
  const raises = /card alone|card only|Graphics cards/;
  const check = (path: string, opener: string, machines: Hardware[]) => {
    const html = meta.find((m) => m.path === path)?.html;
    if (html == null) return 0;
    const note = html.match(new RegExp(`<p class="note">${opener}[\\s\\S]*?</p>`))?.[0];
    if (note == null) {
      problems.push(`${path} does not carry the assumptions note this check reads`);
      return 0;
    }
    const want = cardScopeNote(machines);
    if (want && !note.includes(want)) problems.push(`${path} should say "${want}" in its assumptions and does not`);
    if (!want && raises.test(note)) problems.push(`${path} raises the price of a graphics card where neither machine on it is one`);
    return want ? 1 : 0;
  };
  let said = 0;
  let pairs = 0;
  for (const [a, b] of hardwarePairs(data)) {
    pairs++;
    said += check(hardwareComparePath(a, b), 'Both columns use the same usage:', [a, b]);
  }
  let machines = 0;
  for (const h of data.hardware) {
    const rows = [...familyRange(h, data), ...priceRivals(h, data)];
    if (!rows.length) continue;
    machines++;
    said += check(`/hardware/${h.id}/`, 'Every row uses the same defaults as the figures above:', rows);
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} assumptions note${problems.length === 1 ? '' : 's'} get the card-price caveat wrong`);
  }
  console.log(`  ${said} of the ${pairs + machines} machine head-to-heads and machine pages price a graphics card, and only those say what a card price leaves out`);
}

checkMeta();
checkLinks();
checkFooter();
checkHeadToHeads();
checkCanonicals();
checkOgCards();
checkFonts();
checkCounts();
checkCardPrices();
checkCardScope();
checkTables();
checkArticles();
checkCompareIndex();
checkHardwareIndex();
checkPayback();
checkMeetingPoint();
checkHeadroom();
checkSharedHeadroom();
checkSameSilicon();
checkGenerationPairs();
checkStandInPower();
checkModelContexts();
checkMachineContexts();
checkShorterFits();
checkShorterMachines();
checkHiddenModels();
checkLeaderboardLinks();
console.log(`wrote ${paths.length} static pages + sitemap.xml (${paths.filter((p) => p.startsWith('/models')).length} models, ${paths.filter((p) => p.startsWith('/hardware/') && p !== '/hardware/').length} machines, ${paths.filter((p) => p.startsWith('/compare')).length} comparisons)`);
