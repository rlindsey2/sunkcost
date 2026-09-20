/**
 * Generates the static pages: the leaderboard, one page per model, one per
 * machine, and head-to-head comparisons — plus sitemap.xml and robots.txt.
 *
 * These are the pages someone lands on from a search. Everything they need is
 * in the HTML; the calculator is a link away with the configuration pre-filled.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync, readFileSync } from 'node:fs';
import {
  addJumpLine, anchoredHeading, anchorHeadings, andList, appleChip, bandFit, bestLeftOut, brandOf, calcLink, CAP_SHORT, cheapestPerFamily, cheapestRunsBoth, cheapestThatHolds,
  computeView, contextCappedBy, contextHeadroom, ctxLabel, DESC_MAX, descOf, discontinuedOn, dotRow, endStop, esc,
  chipStepNames, familyGroup, familyHeading, familyRange, generationNames,
  familyNoun, familyReach, familyReachNote, fitsOf, fitsShorter, fmtDuration, fmtGb, fmtGb1, fmtNum, fmtTokens, fmtUsd, FONT_PRELOAD, FOOTER_LINKS,
  footerHtml, gbRange,
  cardRankingLine, cardScopeNote, costMachine, fmtPerMtok, gpuCores, gpuPart, graphicsCards, hardwareLabel, hardwareProduct,
  headingSlug, holdHyphens, indefiniteArticle, JUMP_MIN_SECTIONS, kvWorking, leaderboardBuildsLine, leaderboardRows, longestContext, lowerFirst, machinesConsidered, machinesShorter,
  machineIndexLine, machineMatchUpsLine, machinesThatHold, machineVerdict, median, missedMachines, meetAtShorterContext, modelGenerationSection, modelLabel, modelMatchUpsLine, modelVerdict, MTOK,
  nearestCompleteComputer, numberWord, otherQuantisations, pageShell, powerSourceLabel, powerWithSource, priceRivals,
  pricePerUsableGb, priceWithScope, priceWithScopeText, publishedPriceLine, rowFor, tokenCost, tokenCosts, type ModelCost, type TokenCost,
  runnersFor, runsOnNote, runsOnlyOn, runsOnlyThere, sameSilicon, sharedHeadroom, shortHardwareLabel, shownTps, SIZE_BANDS, slug,
  SECTIONS, sourceLinks, sourceName, speedFrom, speedWithBasis, splitCapabilityNote, splitHardwareNote, noteSentences, stack,
  strongestShared, tierLabel, tierName, tierScale, titleHardwareLabel, TITLE_MAX, titleOf, verdictLine, widestHeadroom, type Runner,
  type MissedMachine, type SharedMachine, type ShorterFit, type ShorterMachine,
} from '../src/pagekit';
import {
  chipStepPairs, flagshipMachines, generationPairs, hardwareComparePath, hardwarePairs, headToHeadGroups, memoryTierNames,
  MODEL_GENERATION_SIZE_RATIO, MODEL_MEMORY_GAP, memoryNeighbourPairs, memoryTierPairs, modelComparePath, modelGenerationPairs, modelPairs, rankedModels, sameSiliconPairs,
  versusCardPath,
  PRICE_NEIGHBOUR_GAP, priceNeighbourPairs, priceNeighbours,
} from '../src/versus-card';
import { BEST_CARD, COMPARE_CARD, GPU_CARD, HARDWARE_CARD, LEADERBOARD_CARD, MEMORY_CARD, TOKEN_COST_CARD } from '../src/list-card';
import { defaultState } from '../src/state';
import { hasShareCard } from '../src/share';
import { bestByTier, bestUsageLevels } from '../src/best';
import { fit, footprintGb, kvCacheGb, kvScaleFor } from '../src/fit';
import { fingerprint, mainOf, nextDates, publishedDate, type PageDates } from '../src/page-dates';
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

/**
 * A section heading whose text begins this way, whatever id it was given. The
 * guards that know a heading whole ask for it through `anchoredHeading`; these
 * are the ones that know only its opening words, because the rest is a machine
 * name or a number the guard is about to read out of the match.
 */
const headingLike = (start: string) => new RegExp(`<h2\\b[^>]*>${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

/**
 * The names this site's own data holds, as a page prints them. A heading
 * repeating one of these where the page's h1 already carries it is the page
 * saying its subject twice, which is what decides whether a jump line reads as a
 * contents page or as keyword stuffing. See addJumpLine in src/pagekit.ts.
 */
const subjectNames = [
  ...data.hardware.map((hw) => esc(shortHardwareLabel(hw))),
  ...data.models.map((m) => esc(m.display_name)),
];

/**
 * The page with its body's headings anchored and its line of jumps into them
 * written, and its header and footer untouched. The jumps go in after the
 * anchors because each one lands on an id the anchoring has just made.
 */
function anchorBody(html: string): string {
  const body = mainOf(html);
  return body === html ? html : html.replace(body, () => addJumpLine(anchorHeadings(body), subjectNames));
}

function write(path: string, html: string) {
  // Every section heading leaves here with the id a link can land on, so the file
  // on disk, the fingerprint the sitemap dates and the markup every guard below
  // reads are one and the same page. See anchorHeadings in src/pagekit.ts.
  html = anchorBody(html);
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
  // A link that lands on a section is still a link to the page the section is
  // on, so the fragment comes off before the page is counted as reached.
  for (const m of (html.split('<body')[1] ?? '').matchAll(/href="(\/[^"#?]*\/)(?:#[^"]*)?"/g))
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
      const step = chipStepNames(hw, other) ?? chipStepNames(other, hw);
      const want = tier || step ? `${other.unified_memory_gb}GB` : shortHardwareLabel(other);
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
 * The other match-ups, on the head-to-head itself. The links are written by
 * machineSiblingNote() and modelSiblingNote(); this reads them back off the shipped
 * page and cuts the same lists again from the data, so a rule that stops reaching a
 * pair takes the note with it rather than leaving a page quietly short of a link.
 *
 * Three things have to hold on every one of the 143 comparisons. Each side names
 * every other match-up it is in, and names it once: a missing one is the dead end
 * this note exists to end, and a doubled one is a reader following the same link
 * twice. Neither side names the page the reader is already on. And every link says
 * what that pair's own page says it should — the third machine's name, or the memory
 * size where the name would be the page's own headline twice over.
 */
function checkMatchUpSiblings() {
  const problems: string[] = [];
  const notesOn = (path: string) =>
    (meta.find((p) => p.path === path)?.html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '')
      .match(/<p class="note">[\s\S]*?<\/p>/g)
      ?.filter((n) => n.includes('is also head to head')) ?? [];

  /** one comparison, and what each of its two sides should name at the foot of it */
  type Side = { subject: string; want: Map<string, string> };
  const check = (path: string, sides: Side[]): number => {
    const notes = notesOn(path);
    const want = new Map(sides.flatMap((s) => [...s.want]));
    if (!want.size) {
      if (notes.length) problems.push(`${path} names other match-ups where neither side is in one`);
      return 0;
    }
    if (!notes.length) {
      problems.push(`${path} is beside ${want.size} other match-up${want.size === 1 ? '' : 's'} and names none of them`);
      return 0;
    }
    for (const side of sides)
      if (side.want.size && !notes.some((n) => n.includes(`${esc(side.subject)} is also head to head with `)))
        problems.push(`${path} does not say which other match-ups ${side.subject} is in`);
    const said = notes.flatMap((n) => [...n.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)].map((m) => [m[1], m[2]] as const));
    for (const [href, label] of said) {
      if (href === path) { problems.push(`${path} links itself in its own other match-ups`); continue; }
      const wanted = want.get(href);
      if (wanted == null) problems.push(`${path} names ${href}, which is not a match-up either side is in`);
      else if (label !== esc(wanted)) problems.push(`${path} calls ${href} "${label}" where that pair is "${wanted}"`);
    }
    for (const href of want.keys()) {
      const times = said.filter(([h]) => h === href).length;
      if (times !== 1) problems.push(`${path} names ${href} ${times} times, where every other match-up is named once`);
    }
    return said.length;
  };

  const hwPairs = hardwarePairs(data);
  let links = 0;
  let widest = 0;
  let noted = 0;
  let alone = 0;
  for (const [a, b] of hwPairs) {
    const path = hardwareComparePath(a, b);
    const sides = [a, b].map((self) => {
      const want = new Map<string, string>();
      for (const [x, y] of hwPairs) {
        if (x.id !== self.id && y.id !== self.id) continue;
        const href = hardwareComparePath(x, y);
        if (href === path) continue;
        const other = x.id === self.id ? y : x;
        // what that link should say: two memory tiers, or two chips in one box, are the
        // same machine twice, so the size is the whole of the difference and the name
        // would be the page's own headline said again
        const same = memoryTierNames(self, other) ?? memoryTierNames(other, self) ?? chipStepNames(self, other) ?? chipStepNames(other, self);
        want.set(href, same ? `${other.unified_memory_gb}GB` : shortHardwareLabel(other));
      }
      return { subject: shortHardwareLabel(self), want };
    });
    const n = check(path, sides);
    links += n;
    widest = Math.max(widest, n);
    if (sides.some((s) => s.want.size)) noted++;
    else alone++;
  }

  const mPairs = modelPairs(data);
  // recut from the rule rather than read off the map the pages were built from: a pair
  // both rules reach keeps the ladder's address, and it is the address that decides
  // which of the two things the page says about it
  const generations = new Set(modelGenerationPairs(data).map(([old, now]) => modelComparePath(old, now)));
  const ladder = new Set<string>();
  const ranked = rankedModels(data);
  for (let i = 0; i + 1 < ranked.length; i++) ladder.add(modelComparePath(ranked[i], ranked[i + 1]));
  const memories = new Set(
    memoryNeighbourPairs(data)
      .map(([x, y]) => modelComparePath(x, y))
      .filter((href) => !ladder.has(href)),
  );
  for (const [a, b] of mPairs) {
    const path = modelComparePath(a, b);
    const reasons: string[] = [];
    let saysMemory = false;
    const sides = [a, b].map((self) => {
      const want = new Map<string, string>();
      for (const [x, y] of mPairs) {
        if (x.id !== self.id && y.id !== self.id) continue;
        const href = modelComparePath(x, y);
        if (href === path) continue;
        const other = x.id === self.id ? y : x;
        want.set(href, other.display_name);
        // and the clause that says why those two are on a page together. The ladder is
        // always written from the higher model to the lower, so the pair's own order
        // says which side of this one the other model sits. A memory neighbour is the
        // one reason that is the same for every model carrying it, so the page says it
        // once for the group rather than after each name.
        if (memories.has(href)) {
          saysMemory = true;
          continue;
        }
        reasons.push(
          generations.has(href)
            ? `${esc(other.display_name)}</a>, the ${x.id === self.id ? 'current' : 'last-generation'} ${esc(self.family ?? '')} nearest it in size`
            : `${esc(other.display_name)}</a>${x.id === self.id ? ' below it' : ' above it on the leaderboard'}`,
        );
      }
      return { subject: self.display_name, want };
    });
    const n = check(path, sides);
    links += n;
    widest = Math.max(widest, n);
    const notes = notesOn(path).join(' ');
    if (saysMemory && !notes.includes('much the same memory'))
      problems.push(`${path} links a match-up cut by the memory rule and does not say the two models need much the same memory`);
    for (const reason of reasons)
      if (!notes.includes(reason)) problems.push(`${path} does not say why one of its other match-ups exists: ${reason.replace(/<[^>]*>/g, '')}`);
    if (sides.some((s) => s.want.size)) noted++;
    else alone++;
  }

  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} head-to-head${problems.length === 1 ? '' : 's'} do not name the other match-ups their two sides are in`);
  }
  console.log(`  ${noted} head-to-heads name the ${links} others their two sides are in, up to ${widest} on a page; ${alone} set${alone === 1 ? 's' : ''} two machines that are in no other`);
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
  const announced = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
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
 * Two narrow columns can share a line on a phone instead of taking one each,
 * which is what `pair` in stack() is for. The rule only works if it holds for
 * the whole table: a block where some rows put two figures on a line and others
 * put one reads as a mistake rather than a layout. So every row of a paired
 * table that is a row at all — a heading reaching across the block is not —
 * has to carry both halves, and neither half may be empty.
 *
 * Which columns can pair is a measurement, not a guess: at 320px a row has
 * 271px to give, the two tracks are split by a 12px gap, and the right-hand
 * track is claimed by whichever is wider, the figure or the second of the pair.
 * So a pair fits when first + 12 + max(figure, second) is 271 or less. Three
 * tables that looked like they fit do not once the figure is counted, and they
 * are left alone.
 */
function checkPairedColumns() {
  const tables = meta.flatMap((p) =>
    [...p.html.matchAll(/<table class="board stack"[\s\S]*?<\/table>/g)].map((m) => ({ path: p.path, html: m[0] })),
  );
  let paired = 0;
  let lines = 0;
  let merged = 0;
  for (const t of tables) {
    const rows = [...t.html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
    const body = rows.filter((r) => /class="k-name/.test(r));
    const withPair = body.filter((r) => /class="[^"]*\bk-pair\b/.test(r));
    if (!withPair.length) continue;
    paired++;
    // a row that merges those columns into one — the leaderboard's hosted rows
    // run three together — has no pair to make. Every other row has to carry it.
    const missing = body.filter((r) => !/class="[^"]*\bk-pair\b/.test(r) && !/colspan="/.test(r));
    if (missing.length) {
      throw new Error(
        `${t.path}: ${missing.length} of ${body.length} rows in a paired table keep both columns on lines of their own, and a table that pairs some rows and not others reads worse than one that pairs none`,
      );
    }
    merged += body.length - withPair.length;
    for (const r of withPair) {
      const halves = [...r.matchAll(/<(td|th)[^>]*class="([^"]*\bk-pair\b[^"]*)"[^>]*>([\s\S]*?)<\/\1>/g)];
      const ends = halves.filter((h) => /\bk-pair-end\b/.test(h[2])).length;
      if (halves.length !== 2 || ends !== 1) {
        throw new Error(`${t.path}: a paired line has ${halves.length} halves and ${ends} of them closing it, where it wants two and one`);
      }
      for (const h of halves) {
        // a half can be wordless and still carry its answer — the capability
        // dots are drawn on empty spans — so this turns on an empty cell and on
        // a lone dash, never on the absence of text
        if (!h[3].trim() || /^[—-]$/.test(h[3].replace(/<[^>]*>/g, '').trim())) {
          throw new Error(`${t.path}: half of a paired line says nothing, which leaves the other half alone on the line`);
        }
      }
      lines++;
    }
  }
  console.log(
    `  ${paired} of the ${tables.length} stacked tables put two columns on one line on a phone, ${lines} lines in all${merged ? `, and ${merged} rows run those columns together instead` : ''}`,
  );
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
 * The index says what cuts its two lists, and a rule added to `versus-card.ts` without
 * a clause on the page leaves rows nothing on it explains. This holds the sentence to
 * the rules in both directions: every match-up the page lists is reached by a kind the
 * page names, every kind the page names reaches at least one match-up on it, and the
 * page really carries each clause and the count of them.
 *
 * It is checked against the recut rules rather than against the table, so a kind whose
 * pairs an earlier rule reached first still has to be named: the reader of a row cannot
 * see which rule got there first, only whether the page explains why the two are on a
 * page together.
 */
function checkMatchUpKinds() {
  const index = meta.find((p) => p.path === '/compare/');
  if (!index) throw new Error('no head-to-head index was written');
  const problems: string[] = [];
  let named = 0;

  // a match-up is the same one whichever way round its address is written, and the
  // address is written by whichever rule reached the pair first: four card pairs are
  // cut by both grids and carry the flagship grid's order. So the two sides are matched
  // on the pair rather than on the path.
  const hold = <T extends { id: string }>(
    what: string,
    kinds: MatchUpKind<T>[],
    all: [T, T][],
    label: (a: T, b: T) => string,
  ) => {
    const key = (a: T, b: T) => [a.id, b.id].sort().join(' vs ');
    const listed = new Map(all.map(([a, b]) => [key(a, b), label(a, b)]));
    const explained = new Set<string>();
    for (const kind of kinds) {
      const onPage = kind.pairs.map(([a, b]) => key(a, b)).filter((k) => listed.has(k));
      if (!onPage.length) problems.push(`the head-to-head index names a kind of ${what} match-up that cuts none of them: ${kind.clause}`);
      for (const k of onPage) explained.add(k);
      if (!index.html.includes(esc(kind.clause)))
        problems.push(`the head-to-head index does not say what puts ${onPage.length} ${what} match-ups on it: ${kind.clause}`);
      named++;
    }
    for (const [k, name] of listed)
      if (!explained.has(k)) problems.push(`the head-to-head index lists ${name} and names no kind of match-up that cuts it`);
    const count = `${sentenceCase(numberWord(kinds.length))} kinds of match-up cut this list.`;
    if (!index.html.includes(count)) problems.push(`the head-to-head index does not say it lists ${kinds.length} kinds of ${what} match-up`);
  };

  hold('machine', machineMatchUpKinds(), hardwarePairs(data), (a, b) => `${shortHardwareLabel(a)} vs ${shortHardwareLabel(b)}`);
  hold('model', modelMatchUpKinds(), modelPairs(data), (a, b) => `${a.display_name} vs ${b.display_name}`);

  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(
      problems.length === 1
        ? '1 thing the head-to-head index says about its own lists does not hold'
        : `${problems.length} things the head-to-head index says about its own lists do not hold`,
    );
  }
  console.log(`  the head-to-head index names the ${named} rules that cut its ${hardwarePairs(data).length} machine and ${modelPairs(data).length} model match-ups, and every one of them is cut by a rule it names`);
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
 * The machine index opens by saying what is in its table, and one clause of that
 * was a count of what the site prices rather than of what it lists. Two of the 56
 * configurations here have no published price, so the sentence was wrong by two
 * and the rows it was wrong about are the two a reader most needs warning of:
 * their price cell says "not published" and their pay-back cell says "needs a
 * price".
 *
 * Four claims, and the first two are the ones that keep the sentence honest when
 * the data moves. The count in the paragraph is the count of rows the table
 * really prints a price on, read back out of the page rather than taken from the
 * same array that wrote it. Every machine without a published price is named up
 * there. No machine that has one is named among them. And each of those rows
 * offers the calculator instead, which is what the sentence promises.
 */
function checkPricedRows() {
  const index = meta.find((p) => p.path === '/hardware/');
  if (!index) throw new Error('no machine index was written');
  const problems: string[] = [];
  const lede = index.html.match(/<p class="lede">([\s\S]*?)<\/p>/)?.[1] ?? '';
  const said = publishedPriceLine(data);

  const unpriced = data.hardware.filter((h) => h.price_usd == null);
  const priced = data.hardware.filter((h) => h.price_usd != null);

  const tbody = index.html.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? '';
  const rows = tbody.split('<tr').slice(1).map((r) => `<tr${r}`).filter((r) => r.includes('c-hw'));
  const withPrice = rows.filter((r) => !r.includes('not published'));
  if (withPrice.length !== priced.length)
    problems.push(
      `the machine index prints a price on ${withPrice.length} of its ${rows.length} rows, where ${priced.length} of the machines here have a published price`,
    );
  if (!lede.includes(said))
    problems.push(
      `the machine index does not open by saying that ${withPrice.length} of its ${rows.length} rows carry a published price`,
    );
  for (const hw of unpriced) {
    if (!said.includes(esc(shortHardwareLabel(hw))))
      problems.push(`the machine index has no price for the ${shortHardwareLabel(hw)} and does not name it in its first paragraph`);
    const row = rows.find((r) => r.includes(`href="/hardware/${esc(hw.id)}/"`));
    if (!row) problems.push(`the machine index has no row for the ${shortHardwareLabel(hw)}`);
    else if (!row.includes('price it yourself'))
      problems.push(`the ${shortHardwareLabel(hw)} is named as a machine you price yourself and its row does not offer the calculator`);
  }
  for (const hw of priced)
    if (said.includes(esc(shortHardwareLabel(hw))))
      problems.push(`the machine index names the ${shortHardwareLabel(hw)} among the machines it has no price for, and it is priced at ${fmtUsd(hw.price_usd!)}`);

  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(
      problems.length === 1
        ? '1 thing the machine index says about its own prices does not hold'
        : `${problems.length} things the machine index says about its own prices do not hold`,
    );
  }
  console.log(
    `  the machine index says ${withPrice.length} of its ${rows.length} rows carry a published price, prints one on exactly those, and names the ${numberWord(unpriced.length)} it prices itself`,
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
    const section = html.split(anchoredHeading(heading))[1]?.split('<h2')[0];
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
    const noShared = !headingLike('Side by side on the ').test(meta.find((m) => m.path === path)?.html ?? '');
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
      if (headingLike('Side by side on the ').test(html)) problems.push(`${path} runs a side-by-side race on a machine that holds both at no context`);
      continue;
    }
    met++;
    const k = Math.round(meeting.ctx / 1024);
    if (!html.includes(anchoredHeading(`Side by side on the ${esc(shortHardwareLabel(meeting.shared.hw))} at ${k}k of context`)))
      problems.push(`${path} meets at ${k}k on the ${shortHardwareLabel(meeting.shared.hw)} and its heading does not say so`);
    if (!html.includes(`are at ${k}k of context instead`))
      problems.push(`${path} runs its race at ${k}k and the assumptions still claim ${Math.round(data.defaults.context.default_tokens / 1024)}k`);
    // a link that opens the calculator at the default context would land the reader on
    // the configuration the page has just said does not fit
    const sections = html.split(headingLike('Side by side on the '))[1]?.split(headingLike('Machines that run one'))[0] ?? '';
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
    const section = html.split(anchoredHeading('The same models, not to the same length'))[1]?.split('<h2')[0] ?? '';
    if (!rows.length) {
      flat++;
      if (section) problems.push(`${path} holds both machines to the same length everywhere and still claims a difference`);
      // a same-silicon pair says it under its own heading, where the equal memory is
      // one line of a longer answer rather than the whole of the finding
      const saidIt = sameSilicon(a, b)
        ? html.includes(anchoredHeading('The same machine inside'))
        : html.includes(anchoredHeading('Memory is not what separates them'));
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
    const section = sectionUnder(html, runnersHeading(m)) ?? '';
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
    const section = sectionUnder(html, runsHeading(hw)) ?? '';
    const view = computeView({ ...defaultState(data), hw: hw.id }, data);
    const shown = view.rows.filter((r) => r.fit.status === 'fits').slice(0, 12);
    if (!shown.length) {
      if (section) problems.push(`${path} has a table of what it runs and nothing on the list fits it`);
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
    const found = html.match(/<h2\b[^>]*>(\w+) more machines?, at a shorter window<\/h2>([\s\S]*?)(?=<h2\b|<\/article>)/);
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
/**
 * The section on the machines that miss a model makes three claims a reader
 * cannot check without the data: that each machine listed holds the model at no
 * window at all, that the weights alone are what stops them where the page says
 * so, and that the last column is the strongest model each one does hold. All
 * three are recomputed here, on the words the page actually shipped, because the
 * section exists on the pages with the least else on them: a wrong figure there
 * is the whole page.
 */
function checkMissedMachines() {
  const problems: string[] = [];
  const ctx = data.defaults.context.default_tokens;
  const shortest = Math.min(...data.defaults.context.options);
  let pages = 0;
  let rows = 0;
  let links = 0;
  for (const m of data.models) {
    const path = `/models/${m.id}/`;
    const html = meta.find((p) => p.path === path)?.html ?? '';
    const want = cheapestPerFamily(runnersFor(m, data)).length <= 1 ? missedMachines(m, data) : [];
    const found = sectionUnder(html, missedHeading(m));
    if (!want.length) {
      if (found != null) problems.push(`${path} lists the machines that miss it, and it is not a model one machine runs`);
      continue;
    }
    if (found == null) {
      problems.push(`${path} is a model one machine runs and says nothing about the ${want.length} families that miss it`);
      continue;
    }
    pages++;
    const section = found;
    // the claim that a shorter window cannot close the gap, which is only true
    // where the weights on their own are bigger than the memory
    const weightsAlone = m.weights_gb != null && want.every((r) => r.hw.usable_memory_gb != null && m.weights_gb! > r.hw.usable_memory_gb!);
    const said = section.includes('of weights are larger than the usable memory in every one of them');
    if (weightsAlone !== said)
      problems.push(
        weightsAlone
          ? `${path} does not say that its weights alone are larger than the memory in every machine that misses it, which they are`
          : `${path} says its weights alone are larger than the memory in every machine that misses it, and on at least one they are not`,
      );
    const listed = section.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr>[\s\S]*?<\/tr>/g) ?? [];
    if (listed.length !== want.length) {
      problems.push(`${path} lists ${listed.length} machines that miss it, not the ${want.length} families there are`);
      continue;
    }
    listed.forEach((row, i) => {
      const r = want[i];
      rows++;
      const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1]);
      const text = (c: string) => (c ?? '').replace(/<span class="c-quant">[\s\S]*?<\/span>/g, '').replace(/<[^>]*>/g, '').trim();
      // the row is only in this table because the machine holds it nowhere
      if (longestContext(m, r.hw, data) != null)
        problems.push(`${path} lists ${hardwareLabel(r.hw)} as holding it at no window, where it holds it at ${ctxLabel(longestContext(m, r.hw, data)!)}`);
      if (!(cells[0] ?? '').includes(`href="/hardware/${esc(r.hw.id)}/"`))
        problems.push(`${path} does not name ${hardwareLabel(r.hw)} in the row that misses it by ${fmtGb1(r.shortGb)}`);
      if ((cells[1] ?? '').trim() !== priceWithScope(r.hw))
        problems.push(`${path} prints ${text(cells[1]) || 'nothing'} as the price of ${hardwareLabel(r.hw)}, which is ${priceWithScopeText(r.hw)}`);
      if (text(cells[2]) !== fmtGb1(r.hw.usable_memory_gb))
        problems.push(`${path} prints ${text(cells[2]) || 'nothing'} as the usable memory of ${hardwareLabel(r.hw)}, which has ${fmtGb1(r.hw.usable_memory_gb)}`);
      if (text(cells[3]) !== fmtGb1(r.shortGb))
        problems.push(`${path} prints ${text(cells[3]) || 'nothing'} as what ${hardwareLabel(r.hw)} is short by at ${ctxLabel(shortest)}, where it is short ${fmtGb1(r.shortGb)}`);
      const alt = strongestThatFits(r.hw, ctx);
      if (alt && !(cells[4] ?? '').includes(`href="/models/${esc(alt.id)}/"`))
        problems.push(`${path} does not name ${alt.display_name} as the strongest model ${hardwareLabel(r.hw)} holds`);
      if (i > 0 && r.shortGb < want[i - 1].shortGb) problems.push(`${path} lists the machines that miss it out of order at ${hardwareLabel(r.hw)}`);
    });
    // the way out of the section: the nearest machine on the model it does run
    const alt = strongestThatFits(want[0].hw, ctx);
    if (alt) {
      const href = esc(calcLink({ hw: want[0].hw.id, model: alt.id }, data));
      if (!section.includes(`href="${href}"`))
        problems.push(`${path} does not open the calculator on the ${hardwareLabel(want[0].hw)} with ${alt.display_name}, the model it does hold`);
      else links++;
    }
  }
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} fault${problems.length === 1 ? '' : 's'} in what model pages say about the machines that miss them`);
  }
  console.log(`  ${pages} model pages one machine runs name ${rows} machines that miss them, one per family, with how far short each falls and what it holds instead`);
  console.log(`  ${links} of those pages open the calculator on the nearest machine with the model it does hold`);
}

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
    const found = html.match(/<h2\b[^>]*>(\w+) more, at a shorter window<\/h2>([\s\S]*?)(?=<h2\b|<\/article>)/);
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
    const heading = [...html.matchAll(/<h2\b[^>]*>[^<]* fits at (\d+k) of context<\/h2>([\s\S]*?)(?=<h2\b|<\/article>)/g)][0] ?? null;
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
 * order, and everything else it runs sat below the cut as a number. On the
 * largest machines that number was twenty-six, so a page answering "what does
 * this run?" named eighteen models and left the reader to open the calculator
 * and find out about the rest. The note under the table names every one of
 * them now. The rule this holds is the one the note was always written to:
 * if a model fits a machine, that machine's page links it, whether it made
 * the table or not.
 */
function checkHiddenModels() {
  const problems: string[] = [];
  let named = 0;
  let unnamed = 0;
  for (const hw of data.hardware) {
    const path = `/hardware/${hw.id}/`;
    const page = meta.find((p) => p.path === path);
    if (!page) throw new Error(`no page written for ${path}`);
    for (const r of fitsOn(hw)) {
      const href = `/models/${r.model.id}/`;
      if (page.links.includes(href)) {
        named++;
        if (r.model.frontier_equivalent?.score == null) unnamed++;
      } else problems.push(`${path} does not link ${href}, a model that fits it`);
    }
  }
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} model${problems.length === 1 ? ' fits a machine whose page does' : 's fit a machine whose page does'} not link it`);
  }
  console.log(`  ${named} machine-and-model pairs, every one of them a link on the machine's page, ${unnamed} of them unscored`);
}

/**
 * The model page's table is one machine per family, and the sentence under it
 * says which of the others hold the model too. That sentence is a claim about
 * every machine on the site — that inside a family memory alone decides, and
 * that the line falls at a named size — so it is read back out of the shipped
 * page here and turned into a set of machines, rather than being recomputed by
 * the function that wrote it. The set it describes has to be exactly the set
 * that holds the model: a family left out, a floor a size too low or a size too
 * high all come back as a difference, named.
 */
function checkFamilyReach() {
  const problems: string[] = [];
  const ctx = data.defaults.context.default_tokens;
  const families = new Map<string, Hardware[]>();
  for (const hw of data.hardware) families.set(hw.family, [...(families.get(hw.family) ?? []), hw]);
  // the reverse of familyNoun(), built from the data so a new family cannot slip past
  const byNoun = new Map([...families.keys()].map((f) => [familyNoun(f), f] as const));
  const nouns = [...byNoun.keys()].sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const list = `(?:${nouns.join('|')})(?:(?:, | and )(?:${nouns.join('|')}))*`;
  let pages = 0;
  let covered = 0;
  for (const m of data.models) {
    const path = `/models/${m.id}/`;
    const html = meta.find((p) => p.path === path)?.html ?? '';
    const held = machinesThatHold(m, data, ctx);
    const rows = cheapestPerFamily(runnersFor(m, data)).length;
    // the paragraph ends with the link to where every machine is priced, which
    // checkMachineIndex() holds; this guard is about the counting in front of it
    const para = html.match(/<p>((?:The table is the cheapest machine in each family|All \d+ machines on this site run it)[\s\S]*?)<\/p>/);
    const found = para && [para[0], para[1].endsWith(machineIndexLine()) ? para[1].slice(0, -machineIndexLine().length).trimEnd() : para[1]];
    if (!rows) {
      if (found) problems.push(`${path} says which machines run it and has no table of machines at all`);
      continue;
    }
    if (!found) {
      problems.push(`${path} lists ${rows} machine${rows === 1 ? '' : 's'} and does not say which of the other ${data.hardware.length - rows} run it`);
      continue;
    }
    pages++;
    const said = found[1];
    if (held.length === data.hardware.length) {
      if (!said.startsWith(`All ${data.hardware.length} machines on this site run it at ${ctxLabel(ctx)}`))
        problems.push(`${path} is held by all ${data.hardware.length} machines at ${ctxLabel(ctx)} and does not say so`);
      else if (!said.includes(`not just the ${rows === 1 ? 'one' : numberWord(rows)} in the table`))
        problems.push(`${path} miscounts its own table, which has ${rows} row${rows === 1 ? '' : 's'}`);
      else covered += held.length;
      continue;
    }
    const counted = said.match(/: (\d+) of the (\d+) machines on this site hold it at (\d+k)\./);
    if (!counted) {
      problems.push(`${path} does not count the machines that hold it`);
      continue;
    }
    if (Number(counted[1]) !== held.length || Number(counted[2]) !== data.hardware.length || counted[3] !== ctxLabel(ctx))
      problems.push(`${path} says ${counted[1]} of ${counted[2]} machines hold it at ${counted[3]}, where ${held.length} of ${data.hardware.length} do at ${ctxLabel(ctx)}`);
    // every clause turned back into the machines it names
    const tail = said.split('so that is ')[1]?.replace(/\.$/, '') ?? '';
    const claimed = new Set<string>();
    let rest = tail;
    let ok = true;
    while (rest.length) {
      const whole = rest.match(new RegExp(`^every (${list}) at any size`));
      const floor = rest.match(new RegExp(`^every (${list}) with (\\d+)GB or more`));
      const one = rest.match(/^the (.+?)(?=, every | and every |, the | and the |$)/);
      if (whole) {
        for (const noun of whole[1].split(/, | and /)) for (const hw of families.get(byNoun.get(noun)!) ?? []) claimed.add(hw.id);
        rest = rest.slice(whole[0].length);
      } else if (floor) {
        const gb = Number(floor[2]);
        for (const noun of floor[1].split(/, | and /))
          for (const hw of families.get(byNoun.get(noun)!) ?? []) if (hw.unified_memory_gb >= gb) claimed.add(hw.id);
        rest = rest.slice(floor[0].length);
      } else if (one) {
        const hw = data.hardware.find((h) => shortHardwareLabel(h) === one[1]);
        if (!hw) {
          problems.push(`${path} names "${one[1]}", which is no machine on this site`);
          ok = false;
          break;
        }
        claimed.add(hw.id);
        rest = rest.slice(one[0].length);
      } else {
        problems.push(`${path} says "${rest}" of the machines that run it, which is not a claim this guard can read`);
        ok = false;
        break;
      }
      rest = rest.replace(/^(, | and )/, '');
    }
    if (!ok) continue;
    const want = new Set(held.map((hw) => hw.id));
    const missing = [...want].filter((id) => !claimed.has(id));
    const extra = [...claimed].filter((id) => !want.has(id));
    if (missing.length)
      problems.push(`${path} leaves out ${missing.length} machine${missing.length === 1 ? '' : 's'} that hold${missing.length === 1 ? 's' : ''} it, ${missing.slice(0, 3).join(', ')}`);
    if (extra.length)
      problems.push(`${path} claims ${extra.length} machine${extra.length === 1 ? '' : 's'} that do${extra.length === 1 ? 'es' : ''} not hold it, ${extra.slice(0, 3).join(', ')}`);
    if (!missing.length && !extra.length) covered += claimed.size;
  }
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} model page${problems.length === 1 ? '' : 's'} describe the machines that run them wrongly`);
  }
  console.log(`  ${pages} model pages say which machines run them, ${covered} machine-and-model pairs covered by a rule the data agrees with`);
}

/**
 * The head-to-heads between a model and the current one of its family nearest it in
 * size. Every other model comparison on this site is two models a reader is choosing
 * between; these are two a reader already owns one of, so the page carries a section
 * the others do not and this holds it to the data.
 *
 * Six claims, and the reason each is here is that the opposite claim is just as easy to
 * write. The pair is really one family, one shape and one generation apart, and no
 * current model of that family and shape is nearer in size than the one the page names,
 * because "nearest" is the whole of why these two are on a page together. The sizes and
 * the score are the data's. The memory sentence says less, more or the same in the
 * direction the figures actually fall — a newer model can be larger on disk and still
 * ask less of the machine, and it may be the other way round. The machine counts are
 * recomputed rather than read from the sentence that printed them. And both models'
 * pages name the match-up in the words that say which side of it they are.
 */
function checkModelGenerations() {
  const problems: string[] = [];
  const heading = anchoredHeading('What the newer model changes');
  const pairs = modelGenerationPairs(data);
  const considered = machinesConsidered(data).length;
  const isMoe = (m: Model) => m.active_params_b != null && m.active_params_b < m.params_b;
  const needAt = (m: Model) => rowFor(computeView({ ...defaultState(data), model: m.id }, data), m)?.fit.needGb ?? null;
  let lighter = 0;
  for (const [old, now] of pairs) {
    const path = modelComparePath(old, now);
    const html = meta.find((m) => m.path === path)?.html ?? '';
    if (!html) {
      problems.push(`${path} is a model generation pair with no page`);
      continue;
    }
    const section = html.split(heading)[1]?.split('<h2')[0] ?? '';
    if (!section) {
      problems.push(`${path} is a generation pair and does not say what the newer model changes`);
      continue;
    }
    const text = unesc(section);

    if (old.generation !== 'legacy' || (now.generation ?? 'current') !== 'current' || old.family !== now.family || isMoe(old) !== isMoe(now))
      problems.push(`${path} is not one family, one shape and one generation apart`);
    const gap = Math.abs(now.params_b - old.params_b);
    const nearer = data.models.filter(
      (c) =>
        c.family === old.family &&
        (c.generation ?? 'current') === 'current' &&
        isMoe(c) === isMoe(old) &&
        c.frontier_equivalent?.score != null &&
        Math.abs(c.params_b - old.params_b) < gap,
    );
    if (nearer.length)
      problems.push(`${path} calls ${now.display_name} the current ${old.family} nearest ${old.display_name} in size, where ${nearer[0].display_name} is nearer`);
    const ratio = Math.max(old.params_b, now.params_b) / Math.min(old.params_b, now.params_b);
    if (ratio > MODEL_GENERATION_SIZE_RATIO)
      problems.push(`${path} sets ${fmtNum(old.params_b, 1)}B against ${fmtNum(now.params_b, 1)}B, which is not a swap anybody makes`);
    const sizes =
      fmtNum(now.params_b, 1) === fmtNum(old.params_b, 1)
        ? `of the same size, ${fmtNum(now.params_b, 1)}B`
        : `nearest it in size, ${fmtNum(now.params_b, 1)}B against ${fmtNum(old.params_b, 1)}B`;
    if (!text.includes(sizes)) problems.push(`${path} does not say the sizes the data gives: ${sizes}`);

    const [so, sn] = [old.frontier_equivalent?.score ?? null, now.frontier_equivalent?.score ?? null];
    if (so != null && sn != null) {
      const claim =
        sn > so
          ? `scores ${sn} where ${old.display_name} scores ${so}`
          : sn === so
            ? `puts both at ${sn}`
            : `scores ${sn}, below ${old.display_name}'s ${so}`;
      if (!text.includes(claim)) problems.push(`${path} does not place the two on the index as the data does: ${claim}`);
      if (sn <= so && text.includes(`scores ${sn} where`))
        problems.push(`${path} reads as if ${now.display_name} scores higher, where the data does not say so`);
    }

    const [needOld, needNow] = [needAt(old), needAt(now)];
    if (needOld != null && needNow != null) {
      const same = fmtGb(needOld) === fmtGb(needNow);
      const asks = same ? 'Both ask the same of the machine' : needNow < needOld ? 'It asks less of the machine' : 'It asks more of the machine';
      if (!text.includes(asks)) problems.push(`${path} does not say what ${now.display_name} asks of the machine: ${asks}`);
      for (const wrong of ['It asks less of the machine', 'It asks more of the machine', 'Both ask the same of the machine'].filter((w) => w !== asks))
        if (text.includes(wrong)) problems.push(`${path} says "${wrong}" where the data has ${fmtGb(needNow)} against ${fmtGb(needOld)}`);
      if (!text.includes(fmtGb(needNow)) || !text.includes(fmtGb(needOld)))
        problems.push(`${path} does not print both memory figures, ${fmtGb(needNow)} and ${fmtGb(needOld)}`);
      if (!same && old.weights_gb != null && now.weights_gb != null) {
        const cache = (m: Model, n: number) => fmtGb(n - m.weights_gb!);
        if (!text.includes(`the cache at that window is ${cache(now, needNow)} against ${cache(old, needOld)}`))
          problems.push(`${path} does not split the difference into weights and cache the way the data does`);
      }
      if (needNow < needOld) lighter++;
    }

    const [ro, rn] = [runnersFor(old, data), runnersFor(now, data)];
    if (ro.length && rn.length) {
      const together =
        rn.length === 1
          ? `One of the ${considered} machines priced here runs either of them`
          : rn.length === considered
            ? `Every one of the ${considered} machines priced here runs both`
            : `The same ${rn.length} of the ${considered} machines priced here run both`;
      const counts =
        ro.length === rn.length && ro[0].hw.id === rn[0].hw.id
          ? together
          : `${rn.length} of the ${considered} machines priced here run it, against ${ro.length} for ${old.display_name}`;
      if (!text.includes(counts)) problems.push(`${path} does not count the machines that run each the way the data does: ${counts}`);
      if (!section.includes(`href="/hardware/${esc(rn[0].hw.id)}/"`))
        problems.push(`${path} names no machine to run ${now.display_name} on`);
    }

    if (old.max_context_tokens && now.max_context_tokens && old.max_context_tokens !== now.max_context_tokens) {
      if (!text.includes(ctxLabel(now.max_context_tokens)) || !text.includes(ctxLabel(old.max_context_tokens)))
        problems.push(`${path} does not say the two context ceilings, ${ctxLabel(now.max_context_tokens)} and ${ctxLabel(old.max_context_tokens)}`);
    }

    // each side's own page, which is where a reader arrives from, says which side it is
    for (const [self, other, word] of [[old, now, 'current'], [now, old, 'last-generation']] as const) {
      const page = meta.find((m) => m.path === `/models/${self.id}/`)?.html ?? '';
      const want = `<a href="${esc(path)}">vs ${esc(other.display_name)}</a>, the ${word} ${esc(self.family)} nearest it in size`;
      if (!page.includes(want)) problems.push(`/models/${self.id}/ does not name ${path} as the ${word} ${self.family} nearest it in size`);
    }
  }

  // and nothing else says it: the section answers a question only these pairs raise
  const wanted = new Set(pairs.map(([old, now]) => modelComparePath(old, now)));
  for (const page of meta)
    if (page.html.includes(heading) && !wanted.has(page.path))
      problems.push(`${page.path} says what a newer model changes and is not a generation pair`);

  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} model generation head-to-head${problems.length === 1 ? '' : 's'} do not hold to the data`);
  }
  console.log(`  ${pairs.length} head-to-heads between a model and the current one of its family nearest it in size; ${lighter} of them ask less memory at ${Math.round(data.defaults.context.default_tokens / 1024)}k than the model they follow`);
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
  // The same cut the page makes, from the same rule, so this guard never goes
  // looking for a row the table was never going to print. What the cut itself
  // is held to is `checkLeaderboardBuilds()`.
  const ranked = leaderboardRows(
    data.models
      .filter((m) => m.frontier_equivalent?.score != null)
      .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!),
    data,
  ).map((r) => r.model);
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

/**
 * Every model this site prices is on the leaderboard somewhere, and the page's
 * first paragraph counts what it shows.
 *
 * Two things sat outside both before this guard existed. The table keeps one
 * row per model, so the second build of a model — the same weights at a heavier
 * quantisation, its own download, its own memory bill, its own page — was
 * dropped without a word: in no row, in no count, and not in the note below
 * that lists the models the index has not scored. The page that ranks Qwen3 32B
 * did not say the site also prices it at eight bits.
 *
 * So four claims, and three of them are read back out of the rendered page
 * rather than taken from the arrays that wrote it. Every model in the data is
 * named on the page exactly once, as a row or beside one or in the unscored
 * note. The build a row keeps is the lightest of the builds that row names,
 * checked against the gigabytes the page itself prints. The lede's count of
 * models is the count of rows really there. And the lede says how many models
 * carry a second build, or says nothing about builds at all where none does.
 */
function checkLeaderboardBuilds() {
  const html = meta.find((p) => p.path === '/leaderboard/')?.html ?? '';
  const problems: string[] = [];
  const lede = html.split('<p class="lede">')[1]?.split('</p>')[0] ?? '';
  // The jump line at the top of the page names this section too, so the note
  // itself is what follows the last mention rather than the first.
  const unscoredNote = html.split('Models the index has not scored yet').pop() ?? '';

  // The open rows, as the page prints them: the head of each is the model whose
  // link opens the model cell, the rest of that cell is what it also names, and
  // the weights column is the gigabytes the reader is shown for the head. The
  // stacking wrapper adds a class to every cell, so the cells are found by the
  // one class the page's own markup gives them rather than by the whole
  // attribute.
  const cellOf = (row: string, name: string) =>
    row.split(new RegExp(`<td class="[^"]*${name}"[^>]*>`))[1]?.split('</td>')[0] ?? '';
  const rows = html
    .split('<tr>')
    .slice(1)
    .map((r) => r.split('</tr>')[0])
    .map((r) => ({ model: cellOf(r, 'c-model'), weights: cellOf(r, 'c-gb') }))
    .filter((r) => r.model.includes('href="/models/'))
    .map(({ model, weights }) => {
      const ids = [...model.matchAll(/href="\/models\/([^"]+)\//g)].map((m) => m[1]);
      return {
        head: ids[0],
        also: ids.slice(1),
        headGb: Number(weights.replace(/<[^>]*>/g, '').match(/([\d.]+) GB/)?.[1] ?? NaN),
        alsoGb: [...model.matchAll(/([\d.]+) GB/g)].map((m) => Number(m[1])),
      };
    });

  const named = new Map<string, string>();
  const claim = (id: string, where: string) => {
    const already = named.get(id);
    if (already) problems.push(`/leaderboard/ names ${id} twice, ${already} and ${where}`);
    else named.set(id, where);
  };
  for (const r of rows) {
    if (r.head) claim(r.head, 'as a row of its own');
    for (const id of r.also) claim(id, `beside ${r.head}`);
  }
  for (const m of data.models) {
    if (named.has(m.id)) continue;
    if (unscoredNote.includes(`href="/models/${esc(m.id)}/"`)) {
      named.set(m.id, 'in the note about unscored models');
      continue;
    }
    problems.push(
      m.frontier_equivalent?.score == null
        ? `/leaderboard/ leaves ${m.display_name} at ${m.quantisation} out of the note about models the index has not scored`
        : `/leaderboard/ gives ${m.display_name} at ${m.quantisation} no row and names it beside none`,
    );
  }

  // The row keeps the lightest build, measured against the weights the cell
  // itself prints rather than against the data that wrote it.
  let doubled = 0;
  for (const r of rows) {
    if (!r.also.length) continue;
    doubled++;
    const head = data.models.find((m) => m.id === r.head);
    const heavier = r.also
      .map((id) => data.models.find((m) => m.id === id))
      .filter((m): m is Model => m != null)
      .filter((m) => (m.weights_gb ?? 0) < (head?.weights_gb ?? 0));
    if (heavier.length)
      problems.push(
        `/leaderboard/ gives the row to ${head?.display_name} at ${head?.quantisation}, ${fmtGb(head?.weights_gb)}, where ${andList(heavier.map((m) => `${m.quantisation} is ${fmtGb(m.weights_gb)}`))}`,
      );
    const lighter = r.alsoGb.filter((gb) => gb < r.headGb);
    if (lighter.length)
      problems.push(
        `/leaderboard/ prints ${fmtGb(r.headGb)} as the weights of ${head?.display_name} and names a build of it beside them at ${andList(lighter.map((gb) => fmtGb(gb)))}`,
      );
  }

  const openRows = rows.length;
  if (!lede.includes(`${openRows} open-weight models`))
    problems.push(`/leaderboard/ prints ${openRows} rows of open models and does not open by saying so`);
  if (doubled) {
    const said = doubled === 1 ? 'one of them is' : `${numberWord(doubled)} of them are`;
    if (!lede.includes(`${said} also priced at a heavier quantisation`))
      problems.push(`/leaderboard/ names a second build on ${doubled} of its rows and does not say so in its first paragraph`);
  } else if (/lightest build/.test(lede)) {
    problems.push('/leaderboard/ explains a cut between builds that its table does not make');
  }

  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(
      problems.length === 1
        ? '1 claim about what /leaderboard/ lists does not match the page'
        : `${problems.length} claims about what /leaderboard/ lists do not match the page`,
    );
  }
  console.log(
    `  /leaderboard/ names all ${named.size} models this site prices: ${openRows} ranked rows, ${doubled} of them naming a heavier build beside the one they rank, and ${named.size - openRows - doubled} in the note about models the index has not scored`,
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
  return `<p class="note">${sentences.join(' ')} There are <a href="${SECTIONS.machineMatchUps}">${machineMatchUps} machine match-ups on the site</a>.</p>`;
}

/**
 * The same list, on the head-to-head itself. A comparison page used to name the two
 * machines it is about and no third one, so the reader who has just decided between
 * two boxes — the likeliest person on the site to be weighing a third — was sent back
 * to the index of all 90 to find it. Each side's other match-ups are named here in the
 * words its own page uses, grouped by the question each one answers, and the pair the
 * reader is already on is left out of both lists.
 */
function machineSiblingNote(a: Hardware, b: Hardware): string {
  const self = hardwareComparePath(a, b);
  const line = (hw: Hardware) =>
    machineMatchUpsLine(
      shortHardwareLabel(hw),
      headToHeadGroups(hw, (headToHeads.get(hw.id) ?? []).filter((p) => p.href !== self)),
    );
  const lines = [line(a), line(b)].filter(Boolean);
  // a paragraph each: two graphics cards have been set against the same five cards,
  // so run together the two lists read as one that says everything twice
  return lines.map((l) => `<p class="note">${l}</p>`).join('\n');
}

// The same thing for models, and here the two rules have to be told apart. A ladder pair
// is always [higher, lower] on the index, so each model knows whether the one it is set
// against is the rung above it or the rung below. A generation pair is always [older,
// current], and neither word describes it: the two are a year apart in the same family,
// not two rungs of one list, and the page says so in its own words.
const modelGenerations = new Map<string, [Model, Model]>();
for (const [old, now] of modelGenerationPairs(data)) modelGenerations.set(modelComparePath(old, now), [old, now]);

// A pair more than one rule reaches keeps the address the first rule gave it, and the
// address is what decides which of the three things the page says about it. Both the
// ladder and the memory rule write the stronger model first, so four pairs are reached
// by both, and on those the leaderboard is what a reader is already looking at.
const ladderPaths = new Set<string>();
const rankedForLadder = rankedModels(data);
for (let i = 0; i + 1 < rankedForLadder.length; i++)
  ladderPaths.add(modelComparePath(rankedForLadder[i], rankedForLadder[i + 1]));
const modelMemoryPairs = new Map<string, [Model, Model]>();
for (const [a, b] of memoryNeighbourPairs(data)) {
  const href = modelComparePath(a, b);
  if (!ladderPaths.has(href)) modelMemoryPairs.set(href, [a, b]);
}

type ModelMatchUp = { href: string; other: Model } & (
  | { kind: 'ladder'; side: 'above' | 'below' }
  // 'above' and 'below' name where the other model sits; 'is-older' and 'is-current'
  // name which side of the pair this model is, since neither is above the other on
  // anything the reader can see. A memory neighbour is symmetrical: what puts the two
  // on a page together is a figure they share, so both sides say the same thing.
  | { kind: 'generation'; side: 'is-older' | 'is-current' }
  | { kind: 'memory'; side: 'same-memory' }
);
const modelHeadToHeads = new Map<string, ModelMatchUp[]>();
for (const [a, b] of modelPairs(data)) {
  const href = modelComparePath(a, b);
  const gen = modelGenerations.get(href);
  const mem = gen ? null : modelMemoryPairs.get(href);
  const sides: ModelMatchUp[] = gen
    ? [
        { href, other: gen[1], kind: 'generation', side: 'is-older' },
        { href, other: gen[0], kind: 'generation', side: 'is-current' },
      ]
    : mem
      ? [
          { href, other: b, kind: 'memory', side: 'same-memory' },
          { href, other: a, kind: 'memory', side: 'same-memory' },
        ]
      : [
          { href, other: b, kind: 'ladder', side: 'below' },
          { href, other: a, kind: 'ladder', side: 'above' },
        ];
  const selves = gen ? [gen[0], gen[1]] : [a, b];
  selves.forEach((self, i) => modelHeadToHeads.set(self.id, [...(modelHeadToHeads.get(self.id) ?? []), sides[i]]));
}

/**
 * The model side of the same thing. A model is in at most three match-ups, so both
 * sides' others fit in one sentence each and nothing is left for an index to carry.
 * Each link arrives with the rule that made it, because two model names either side
 * of "vs" say nothing about why the two are on a page together.
 */
function modelSiblingNote(a: Model, b: Model): string {
  const self = modelComparePath(a, b);
  const line = (m: Model) =>
    modelMatchUpsLine(
      m.display_name,
      (modelHeadToHeads.get(m.id) ?? [])
        .filter((v) => v.href !== self)
        .map((v) => ({ href: v.href, name: v.other.display_name, side: v.side, family: m.family })),
    );
  const lines = [line(a), line(b)].filter(Boolean);
  return lines.length ? `<p class="note">${lines.join(' ')}</p>` : '';
}

/* ------------------------------ leaderboard ------------------------------ */

function leaderboard(): string {
  const refs = [...(data.defaults.frontier_reference ?? [])].sort((a, b) => b.score - a.score);
  const scored = data.models
    .filter((m) => m.frontier_equivalent?.score != null)
    .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!);
  const max = data.defaults.frontier_scale_max ?? 70;
  // One row a model, at the lightest build, with the heavier one named in the
  // row rather than dropped. `leaderboardRows()` carries the rule and the lede
  // prints it; `checkLeaderboardBuilds()` holds the page to both.
  const built = leaderboardRows(scored, data);
  const unique = built.map((r) => r.model);
  const alsoAt = new Map(built.map((r) => [r.model.id, r.alsoAt]));

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
  <td class="c-model"><a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a><span class="c-quant">${holdHyphens(m.quantisation)}</span>${(alsoAt.get(m.id) ?? []).length ? `<br><span class="dim">also at ${andList((alsoAt.get(m.id) ?? []).map((o) => `<a href="/models/${esc(o.id)}/">${esc(o.quantisation)}</a>, ${fmtGb(o.weights_gb)}`))}</span>` : ''}</td>
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

  const buildsLine = leaderboardBuildsLine(built);
  const best = unique[0];
  const gap = best && refs[0] ? refs[0].score - best.frontier_equivalent!.score! : null;
  const body = `<article class="prose">
<h1>Every open model, measured against the frontier</h1>
<p class="lede">${unique.length} open-weight models you can download and run at home, ranked on the ${esc(data.defaults.frontier_basis?.name ?? 'intelligence index')}, with the hosted models from Anthropic and OpenAI dropped into the same table for scale. ${buildsLine ? `${buildsLine} ` : ''}Each row links to what it takes to run it, and each price opens the calculator on that machine running that model. For which machine pays back soonest at each level, see <a href="/best/">best buys by usage</a>; for two of them side by side, <a href="/compare/">every head-to-head</a>; for all of them at once, <a href="/hardware/">every machine on the site in one table</a>.</p>
${gap != null ? `<h2>How far behind the frontier open models are</h2>
<p>The short version: the best open model here scores <b>${best.frontier_equivalent!.score}</b> — that is ${esc(best.display_name)}, and it wants ${fmtGb(best.weights_gb)} of memory. The best hosted model scores <b>${refs[0].score}</b>. That gap of ${gap} points is the thing no amount of hardware closes.</p>` : ''}
<h2>Every model here, ranked</h2>
${stack(`<table class="board">
<thead><tr><th>Model</th><th>Score</th><th>Class</th><th>Good at</th><th>Weights</th><th>Cheapest machine that runs it</th><th>Next down</th></tr></thead>
<tbody>${hostedHeading}${frontierRows}${rows}</tbody>
</table>`, { fig: 1, labels: { 5: 'Cheapest', 6: 'Then' }, pair: [3, 4] })}
${shortened.length ? `<p class="note">Each machine named is the cheapest that holds that model at the ${ctxLabel(leaderCtx)} context the calculator starts at. ${shortened.map(({ m, shorter }) => `${esc(m.display_name)} fits nowhere at that length: its row names the machine that holds it at ${ctxLabel(shorter!.ctx)}, which is marked beside the price`).join('. ')}.</p>` : ''}
${unplaced.length ? `<h2>Models the index has not scored yet</h2>
<p class="note">${unplaced.length} more open models on this site are not in the table above: ${unplaced.map((m) => `<a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a>`).join(', ')}. Their pages show what each one needs and what runs it.</p>` : ''}
<h2>How to read the scores</h2>
<p class="note">${esc(data.defaults.frontier_basis?.estimated_note ?? '')} Scores are the ${data.defaults.frontier_basis?.url ? `<a href="${esc(data.defaults.frontier_basis.url)}" rel="noopener">${esc(data.defaults.frontier_basis?.name ?? '')}</a>` : esc(data.defaults.frontier_basis?.name ?? '')}, read on ${esc(data.defaults.frontier_basis?.checked ?? '')}. Hybrid models are shown at their reasoning or highest-effort score, with the alternative noted on each model's page and, on the hosted rows above, beside the score itself. Weights are the download; a running model also needs a cache the size of your context window, so see <a href="/how-much-memory/">how much memory each size really takes</a>. The dots are, in order: ${CAPABILITY_KEYS.map((k) => CAP_SHORT[k].toLowerCase()).join(', ')}.</p>
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

/**
 * How many models a class on `/best/` lists. The rest of the class is counted rather
 * than listed, which is a fair cut on a page about the quickest pay-back — but the page
 * has to say so, and until now it did not: 23 of the 32 models that pay back somewhere
 * sat in no row and in no count, at every one of the five levels of use.
 *
 * The number lives here, the lede prints it and `checkBestCuts()` holds the page to it,
 * so changing the cut changes the sentence and the guard with it.
 */
const BEST_PER_CLASS = 3;

const bestAnchor = (usage: number) => `u-${fmtTokens(usage).toLowerCase().replace(/[^a-z0-9]/g, '')}`;

function bestBuys(): string {
  const d = data.defaults;
  const levels = bestUsageLevels(data).map((l) => ({ ...l, tiers: bestByTier(data, l.usage, Infinity) }));

  // the headline: at the default usage, the most capable class with anything that pays back
  const headLevel = levels.find((l) => l.usage >= d.usage.default_tokens_per_day) ?? levels[0];
  const headTier = headLevel.tiers.find((t) => t.picks.length);
  const head = headTier?.picks[0];

  const sections = levels
    .map((l) => {
      const rows = l.tiers
        .map((t) => {
          const header = `<tr class="is-frontier"><th colspan="5">${esc(t.label)}${t.hosted.length ? ` <span class="dim">· alongside ${esc(t.hosted.join(', '))}</span>` : ''}</th></tr>`;
          const { moreSaid, pairsSaid } = bestLeftOut(t, BEST_PER_CLASS);
          const counted = pairsSaid ? sentenceCase(pairsSaid) : '';
          if (!t.picks.length) {
            return `${header}<tr><td colspan="5" class="dim">Nothing in this class pays back on any current machine at this usage.${counted ? ` ${counted}` : ''}</td></tr>`;
          }
          return header + t.picks
            .slice(0, BEST_PER_CLASS)
            .map((c) => {
              const v = c.view;
              const tp = v.throughput;
              const ce = c.model.cloud_equivalent;
              const state = { ...defaultState(data), hw: c.hw.id, model: c.model.id, usage: l.usage };
              return `<tr>
  <td class="c-model"><a href="/models/${esc(c.model.id)}/">${esc(c.model.display_name)}</a><span class="c-quant">score ${c.model.frontier_equivalent!.score}${c.model.frontier_equivalent?.estimated ? '*' : ''}</span>${ce.stand_in ? `<br><span class="dim">nobody rents it; priced as ${esc(ce.name)}</span>` : ''}</td>
  <td class="c-hw"><a href="/hardware/${esc(c.hw.id)}/">${esc(hardwareLabel(c.hw))}</a> <span class="dim">${fmtUsd(c.hw.price_usd)}${c.hw.price_scope === 'card_only' ? ', card only' : ''}</span></td>
  <td>${speedFrom(tp)}</td>
  <td><b>${esc(fmtDuration(c.days))}</b></td>
  <td><a href="${esc(calcLink(state, data))}">Open in the calculator</a></td>
</tr>`;
            })
            .join('') + (moreSaid || counted ? `<tr><td colspan="5" class="dim">${[moreSaid, counted].filter(Boolean).join(' ')}</td></tr>` : '');
        })
        .join('');
      return `<section id="${bestAnchor(l.usage)}">
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
<p class="lede">For each amount of daily use, the machines and models that pay for themselves soonest, grouped by how capable the model is. Each class lists the ${numberWord(BEST_PER_CLASS)} that pay back soonest, one row per model, on the machine that pays it back quickest; what a class leaves out is counted under its table. For every model on the site with its class beside it, see <a href="/leaderboard/">the leaderboard</a>.</p>
${head ? `<p>The short version: at ${esc(fmtTokens(headLevel.usage))} tokens a day (${esc(headLevel.label)}), the quickest ${esc(headTier!.label)} pay-back is ${esc(head.model.display_name)} on a ${esc(hardwareLabel(head.hw))}, in <b>${esc(fmtDuration(head.days))}</b>.</p>` : ''}
<p class="note">Jump to: ${levels.map((l) => `<a href="#${bestAnchor(l.usage)}">${esc(fmtTokens(l.usage))}/day</a>`).join(' · ')}</p>
${sections}
<p class="note">Current machines at list price and current models only. Graphics cards are priced as the card alone, so add the PC around it before comparing them with a complete computer; <a href="${SECTIONS.cardsSideBySide}">the cards are ranked against each other here</a>. Every row uses ${esc(String(d.usage.default_input_to_output_ratio))}:1 input to output, $${esc(String(d.electricity.default_price_per_kwh_usd))} per kWh, ${Math.round(d.context.default_tokens / 1024)}k of context, and today's API prices held flat; switch on falling API prices in the calculator and the years stretch. Speeds marked <i>estimated</i> are worked out from memory bandwidth rather than measured, and pay-back scales with them. Models nobody rents are priced as their closest hosted match and say so. Scores are the ${esc(d.frontier_basis?.name ?? 'intelligence index')}; * marks a score the index estimated. Open any row to change the assumptions, set two machines or two models against each other in <a href="/compare/">the head-to-heads</a>, or read <a href="${SECTIONS.millionTokens}">what a million tokens costs to rent against generating it</a>, which is the gap every figure here divides into.</p>
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

/* --------------------- headings that name their subject -------------------- */

/**
 * `/best/` is a page about the quickest pay-back, so it lists the quickest few in each
 * class and counts the rest. That is a fair cut and it was an unstated one: three rows
 * a class, four, eleven and seventeen models paying back behind them, and no sentence
 * on the page saying any of the other 23 existed. A reader counting three rows under
 * *Haiku-class* had no way to tell whether that was the whole class or the top of it.
 *
 * The cut is `BEST_PER_CLASS` and the lede prints it from there. This holds the page to
 * it, class by class and level by level: the rows a class carries, the models it says
 * it leaves out, and the pairs it counts. Raising the cut without changing the sentence,
 * listing a fourth model, or claiming a model is left out when none is, fails the build.
 */
function checkBestCuts() {
  const page = meta.find((p) => p.path === '/best/');
  if (!page) throw new Error('no best-buys page was written');
  const problems: string[] = [];

  const cut = `Each class lists the ${numberWord(BEST_PER_CLASS)} that pay back soonest`;
  if (!page.html.includes(cut)) problems.push(`/best/ does not say that a class lists ${BEST_PER_CLASS} models: "${cut}"`);

  let classes = 0;
  let left = 0;
  const levels = bestUsageLevels(data);
  for (const l of levels) {
    const at = `${fmtTokens(l.usage)} tokens a day`;
    const section = page.html.split(`<section id="${bestAnchor(l.usage)}">`)[1]?.split('</section>')[0];
    if (!section) {
      problems.push(`/best/ has no section for ${at}, which the calculator names as a level of use`);
      continue;
    }
    const blocks = section.split('<tr class="is-frontier">').slice(1);
    const tiers = bestByTier(data, l.usage, Infinity);
    if (blocks.length !== tiers.length) {
      problems.push(`/best/ heads ${blocks.length} classes at ${at}, where ${tiers.length} classes have a machine-and-model pair that fits`);
      continue;
    }
    for (const [i, t] of tiers.entries()) {
      classes++;
      const block = blocks[i];
      // `stack()` rewrites the class list on every cell, so a row is counted by its name cell rather than by the markup this file wrote
      const listed = (block.match(/class="[^"]*\bc-model\b/g) ?? []).length;
      const want = Math.min(t.picks.length, BEST_PER_CLASS);
      if (listed !== want) problems.push(`/best/ lists ${listed} models in ${t.label} at ${at}, where the cut takes ${want} of the ${t.picks.length} that pay back`);
      const { more, moreSaid, pairsSaid } = bestLeftOut(t, BEST_PER_CLASS);
      left += more;
      if (more && !block.includes(moreSaid)) problems.push(`/best/ lists ${listed} of the ${t.picks.length} models that pay back in ${t.label} at ${at} and does not say the other ${more} ${more === 1 ? 'is' : 'are'} left out`);
      if (!more && /more model/.test(block)) problems.push(`/best/ says ${t.label} at ${at} leaves a model out, and every model in it that pays back is listed`);
      if (pairsSaid && !block.includes(sentenceCase(pairsSaid))) problems.push(`/best/ does not count what ${t.label} at ${at} leaves out: ${pairsSaid}`);
    }
  }

  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(
      problems.length === 1
        ? '1 thing /best/ says about its own list does not hold'
        : `${problems.length} things /best/ says about its own lists do not hold`,
    );
  }
  console.log(`  /best/ lists the ${numberWord(BEST_PER_CLASS)} quickest models in each of its ${classes} classes across ${levels.length} levels of use, and counts the ${left} more that pay back behind them`);
}

/**
 * A machine page and a model page are each about one thing, and until now their
 * headings called it "it": *What it runs*, *Machines that run it*, *How good is
 * it, really?*. The h1 above names the subject, so the sentence is grammatical
 * and a reader from the top is never lost. A reader from a search result does
 * not arrive at the top. They arrive at the heading that matched what they
 * typed, which is the name of a machine or a model and a question about it, and
 * a heading with a pronoun in it answers a question about nothing.
 *
 * So a heading that answers a question somebody asks in the subject's own name
 * names it. A heading about the page's own furniture — the spec list, the models
 * a shorter window brings into reach — keeps its wording, because it is not the
 * answer to anything anybody searches for. The rule is one line long and
 * checkSubjectHeadings() holds it: no heading on these 111 pages refers to the
 * page's subject as "it".
 *
 * A machine is named the way the tables and the other pages name it, which is
 * shortHardwareLabel(): the family prefix in hardwareLabel() belongs in the h1
 * and the breadcrumb, not three times down one page.
 */
const runsHeading = (hw: Hardware) => `What the ${esc(shortHardwareLabel(hw))} runs`;
const rivalsHeading = (hw: Hardware) => `Other machines to weigh against the ${esc(shortHardwareLabel(hw))}`;
const qualityHeading = (m: Model) => `How good is ${esc(m.display_name)}, really?`;
const costHeading = (m: Model) => `What ${esc(m.display_name)} costs either way`;
const runnersHeading = (m: Model) => `Machines that run ${esc(m.display_name)}`;
const missedHeading = (m: Model) => `The machines that miss ${esc(m.display_name)}, and what they run`;
const shorterRunHeading = (m: Model, runCtx: number) => `${esc(m.display_name)} fits at ${ctxLabel(runCtx)} of context`;

/** The section a heading opens, up to the next one. */
function sectionUnder(html: string, heading: string): string | null {
  const after = html.split(anchoredHeading(heading))[1];
  return after == null ? null : after.split('<h2')[0];
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
  return `<h2>${shorterRunHeading(m, run.ctx)}</h2>
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
</table>`, { fig: 2, pair: [1, 3] })}
<p class="note">One machine per family, cheapest first, from the same list as the table above. Each window is the longest setting the calculator offers that the machine still holds this model at, and it opens the calculator on that machine at that length. What it needs there is the weights plus the key-value cache at that window, measured against the memory each machine's GPU can address, which that machine's own page gives.</p>

`;
}

/**
 * Seven model pages name one machine and stop. That is the whole answer for a
 * reader who owns that machine and no answer at all for everyone else, who has
 * three questions the page never takes: how close does mine come, would a
 * shorter window close it, and what do I run instead. All three are in the data
 * already. The gap is measured at the shortest window the calculator offers, so
 * no machine is being judged at a context its owner never asked for, and the
 * last column is the same "strongest model that fits" the machine index counts.
 */
function missedMachinesSection(m: Model, rows: MissedMachine[], only: Hardware | null, ctx: number): string {
  if (!rows.length) return '';
  const shortest = Math.min(...data.defaults.context.options);
  const alt = new Map(rows.map((r) => [r.hw.id, strongestThatFits(r.hw, ctx)] as const));
  const nearest = rows[0];
  // The claim the first paragraph makes has to be true of every row, so it is
  // read off the rows rather than assumed: weights larger than usable memory
  // means no window closes the gap, because the cache is the only part a
  // shorter context shrinks.
  const weightsAlone = m.weights_gb != null && rows.every((r) => r.hw.usable_memory_gb != null && m.weights_gb! > r.hw.usable_memory_gb!);
  const body = rows
    .map((r) => {
      const a = alt.get(r.hw.id) ?? null;
      return `<tr>
  <td class="c-hw"><a href="/hardware/${esc(r.hw.id)}/">${esc(hardwareLabel(r.hw))}</a></td>
  <td>${priceWithScope(r.hw)}</td>
  <td>${fmtGb1(r.hw.usable_memory_gb)}</td>
  <td>${fmtGb1(r.shortGb)}</td>
  <td>${a ? `<a href="/models/${esc(a.id)}/">${esc(a.display_name)}</a>` : '<span class="dim">nothing on this list</span>'}</td>
</tr>`;
    })
    .join('');

  // Where the one machine that holds it does not hold it at the context the page
  // prices everything at, the answer box above has already said nothing runs it,
  // so naming the machine without its window would read as a contradiction.
  const onlyAt = only ? longestContext(m, only, data) : null;
  const opening = only
    ? `Every machine here but the ${esc(hardwareLabel(only))}${onlyAt != null && onlyAt < ctx ? `, which holds it at ${ctxLabel(onlyAt)},` : ''} misses ${esc(m.display_name)}`
    : `No machine here holds ${esc(m.display_name)} at any window`;
  const why = weightsAlone
    ? `, and none of them misses by a window: its ${fmtGb(m.weights_gb)} of weights are larger than the usable memory in every one of them, before a single token of key-value cache`
    : `, at every window the calculator offers`;
  const near = `The ${esc(hardwareLabel(nearest.hw))} comes nearest, ${fmtGb1(nearest.shortGb)} short at ${ctxLabel(shortest)}, the shortest window on the list.`;

  // What each one runs instead is the useful half, and on these models it is
  // usually the same model on every row, which is worth saying in words rather
  // than leaving to be noticed down a column.
  const scored = rows.map((r) => alt.get(r.hw.id)).filter((a): a is Model => a != null && a.frontier_equivalent?.score != null);
  const counts = new Map<string, number>();
  for (const a of scored) counts.set(a.id, (counts.get(a.id) ?? 0) + 1);
  const topId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const top = scored.find((a) => a.id === topId) ?? null;
  const mine = m.frontier_equivalent?.score ?? null;
  const allHigher = scored.length === rows.length && mine != null && scored.every((a) => a.frontier_equivalent!.score! > mine);
  const instead = !top || mine == null
    ? ''
    : ` <a href="/models/${esc(top.id)}/">${esc(top.display_name)}</a> is the strongest model ${counts.get(top.id) === rows.length ? 'every one of them holds' : `${numberWord(counts.get(top.id) ?? 0)} of the ${numberWord(rows.length)} hold`}, and it scores ${top.frontier_equivalent!.score} on the intelligence index against this model's ${mine}.${allHigher ? ` So every machine that cannot hold ${esc(m.display_name)} runs one that scores higher than it.` : ''}`;

  const cta = top
    ? `\n<p><a class="cta" href="${esc(calcLink({ hw: nearest.hw.id, model: top.id }, data))}">Price the ${esc(hardwareLabel(nearest.hw))} on ${esc(top.display_name)} instead</a></p>`
    : '';

  return `<h2>${missedHeading(m)}</h2>
<p>${opening}${why}. ${near}${instead}</p>
${stack(`<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Usable memory</th><th>Short by</th><th>Strongest model it holds</th></tr></thead>
<tbody>${body}</tbody>
</table>`, { fig: 4, pair: [1, 2] })}
<p class="note">One machine per family, the largest configuration in each that still misses, nearest first. Short by is the weights plus the key-value cache at ${ctxLabel(shortest)} measured against the memory that machine's GPU can address, which that machine's own page gives. The last column is the highest-scoring current model the machine holds at ${ctxLabel(ctx)}.</p>${cta}

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
  // The description opens the page; the line about the five ratings goes under
  // the five ratings. See splitCapabilityNote().
  const note = splitCapabilityNote(m.capability_note);

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

  // The table is one machine per family, so it answers "what should I buy" and
  // leaves "does mine run it" to a reader who owns the 64GB one of something.
  // Inside a family that is memory and nothing else, so the rule fits in a
  // sentence where fifty names would not. See familyReach().
  const reachLine = (() => {
    if (!perFamily.length) return '';
    const note = familyReachNote(familyReach(m, data, data.defaults.context.default_tokens), data.hardware.length, perFamily.length, data.defaults.context.default_tokens);
    return note ? `<p>${note}</p>` : '';
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
  // Where one family of machine runs a model, the table above is a single row
  // and the page has nothing for anyone who owns something else. That is the
  // seven thinnest pages on the site, and missedMachines() is the other half of
  // the answer. Above one family the same table is a list of machines a reader
  // already has better options than, so it stays off those pages.
  const missed = perFamily.length <= 1 ? missedMachines(m, data) : [];
  const holders = machinesConsidered(data).filter((hw) => longestContext(m, hw, data) != null);
  const alsoAt = otherQuantisations(m, data);

  // The two head-to-heads this model is in, named from its own point of view.
  // Machine pages have carried their match-ups from the start; these were
  // reachable only from the leaderboard's last column.
  const versus = modelHeadToHeads.get(m.id) ?? [];
  const above = versus.find((v) => v.kind === 'ladder' && v.side === 'above');
  const below = versus.find((v) => v.kind === 'ladder' && v.side === 'below');
  const versusLink = (v: { href: string; other: Model }) => `<a href="${esc(v.href)}">vs ${esc(v.other.display_name)}</a>`;
  const ladderLine =
    above && below
      ? `Head to head with its neighbours on the leaderboard: ${versusLink(above)} above it, ${versusLink(below)} below.`
      : below
        ? `Head to head: ${versusLink(below)}, the next model down the leaderboard.`
        : above
          ? `Head to head: ${versusLink(above)}, the next model up the leaderboard.`
          : '';
  // The other match-up a model can be in, and the leaderboard is the reason it needs its
  // own sentence: a model and the one that came after it in the same family are a year
  // apart on the index, so they are never neighbours on it and "above" or "below" would
  // say nothing about why the two are on a page together.
  const gen = versus.find((v) => v.kind === 'generation');
  const genLine = !gen
    ? ''
    : `${ladderLine ? 'Also head to head' : 'Head to head'}: ${versusLink(gen)}, the ${gen.side === 'is-older' ? 'current' : 'last-generation'} ${esc(m.family)} nearest it in size.`;
  // And the third: the models from other families that ask a machine for the same
  // memory. Neither of the lines above reaches them, because two models a year apart in
  // the same family and two rungs of one index are both about what a model is rather
  // than about what it takes to hold one.
  const mem = versus.filter((v) => v.kind === 'memory');
  const memLinks = mem.map((v) => versusLink(v)).join(', ');
  const memLine = !mem.length
    ? ''
    : ladderLine || genLine
      // a third sentence opening "Also head to head" after the second would be the same
      // three words twice, so this one leads with the reason instead
      ? `${mem.length === 1 ? 'One more model needs' : `${sentenceCase(numberWord(mem.length))} more models need`} much the same memory at ${Math.round(ctx / 1024)}k of context: ${memLinks}.`
      : `Head to head with ${mem.length === 1 ? 'a model that needs' : 'the models that need'} much the same memory at ${Math.round(ctx / 1024)}k of context: ${memLinks}.`;
  const versusLine = ladderLine || genLine || memLine ? `<p class="note">${[ladderLine, genLine, memLine].filter(Boolean).join(' ')}</p>` : '';
  const body = `<article class="prose">
<h1>What hardware do you need to run ${esc(m.display_name)}?</h1>
<p class="lede">${esc(m.display_name)} at ${esc(m.quantisation)} is ${fmtGb(m.weights_gb)} of weights${m.max_context_tokens ? `, with a context ceiling of ${Math.round(m.max_context_tokens / 1024)}k tokens` : ''}.${note.about ? ` ${esc(note.about)}` : ''}</p>

${cheapest
      ? `<div class="answer">
  <div class="answer-row"><span class="answer-k">Cheapest machine that runs it</span><span class="answer-v"><a href="/hardware/${esc(cheapest.hw.id)}/">${esc(hardwareLabel(cheapest.hw))}</a> at ${priceWithScope(cheapest.hw)}</span></div>
  ${shorterMachines[0] && shorterMachines[0].hw.price_usd != null && cheapest.hw.price_usd != null && shorterMachines[0].hw.price_usd < cheapest.hw.price_usd ? `<div class="answer-row"><span class="answer-k">Cheaper at a shorter window</span><span class="answer-v"><a href="/hardware/${esc(shorterMachines[0].hw.id)}/">${esc(hardwareLabel(shorterMachines[0].hw))}</a> at ${priceWithScope(shorterMachines[0].hw)}, which holds it at ${ctxLabel(shorterMachines[0].ctx)}</span></div>
  ` : ''}${bestValue && bestValue.hw.id !== cheapest.hw.id ? `<div class="answer-row"><span class="answer-k">Shortest pay-back</span><span class="answer-v"><a href="/hardware/${esc(bestValue.hw.id)}/">${esc(hardwareLabel(bestValue.hw))}</a> — ${esc(verdictLine(bestValue.view))}</span></div>` : ''}
  ${fastest ? `<div class="answer-row"><span class="answer-k">Fastest of the ones listed</span><span class="answer-v"><a href="/hardware/${esc(fastest.hw.id)}/">${esc(hardwareLabel(fastest.hw))}</a> — at ${Math.round(ctx / 1024)}k context, ${speedFrom(fastest.view.throughput)}</span></div>` : ''}
  <div class="answer-row"><span class="answer-k">Honest answer on cost</span><span class="answer-v">${cheapest.view.calc?.breakevenDays == null ? 'Against the API, buying hardware for this model never pays for itself at ordinary usage.' : `${esc(verdictLine(cheapest.view))} at ${fmtTokens(defaultState(data).usage)} tokens a day.`}</span></div>
</div>`
      : `<div class="answer">
  <div class="answer-row"><span class="answer-k">Nothing runs it at ${ctxLabel(ctx)}</span><span class="answer-v">At ${Math.round(ctx / 1024)}k context it needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, ctx) ?? 0))}, more than any machine here offers.</span></div>
  ${shorterRun
        ? `<div class="answer-row"><span class="answer-k">Shorten the window and it fits</span><span class="answer-v"><a href="/hardware/${esc(shorterRun.runner.hw.id)}/">${esc(hardwareLabel(shorterRun.runner.hw))}</a> holds it at ${ctxLabel(shorterRun.ctx)}, where it needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, shorterRun.ctx) ?? 0))}</span></div>
  <div class="answer-row"><span class="answer-k">Honest answer on cost</span><span class="answer-v">${shorterRun.runner.view.calc?.breakevenDays == null ? `Against the API, buying ${priceWithScopeText(shorterRun.runner.hw)} of hardware for this model never pays for itself at ordinary usage.` : `${esc(verdictLine(shorterRun.runner.view))} at ${fmtTokens(defaultState(data).usage)} tokens a day.`}</span></div>`
        : ''}
</div>`}

<h2>${qualityHeading(m)}</h2>
<p>${fe?.score != null
      ? `On the ${fe.url ? `<a href="${esc(fe.url)}" rel="noopener">${esc(data.defaults.frontier_basis?.name ?? 'intelligence index')}</a>` : esc(data.defaults.frontier_basis?.name ?? 'intelligence index')} it scores <b>${fe.score}</b>${fe.score_note ? ` (${esc(fe.score_note)})` : ''}, which puts it in the <b>${esc(tierName(m, data))}</b> band. ${esc(data.defaults.frontier_tiers[fe.tier ?? 0].plain)}`
      : 'It has not been placed on the intelligence index yet.'}
 <a href="/leaderboard/">See the whole table</a>.</p>
<ul class="caps">${caps}</ul>${note.ratings ? `
<p class="note">${esc(note.ratings)}</p>` : ''}
${versusLine}
<h2>${costHeading(m)}</h2>
<p>${ce.stand_in ? `Nobody rents ${esc(m.display_name)} by the token. The closest hosted match, ${esc(ce.name)},` : `Renting the same model${ce.is_exact_match ? '' : ' (or the nearest hosted equivalent, ' + esc(ce.name) + ')'}`} costs <b>$${ce.input_price_per_mtok}</b> per million input tokens and <b>$${ce.output_price_per_mtok}</b> per million output${ce.source_url ? ` (<a href="${esc(ce.source_url)}" rel="noopener">${esc(ce.source)}</a>, checked ${esc(ce.checked ?? '')})` : ''}. Buying a machine only beats that if you use it hard enough, for long enough, that the hardware price divides down below the rental bill. <a href="${SECTIONS.millionTokens}">What a million tokens costs each way</a> puts the two prices side by side.</p>

${shorterRun ? shorterWindowRun(m, shorterRun, ctx) : ''}${hwRows ? `<h2>${runnersHeading(m)}</h2>
${lengthLine}
${stack(`<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Speed at ${Math.round(ctx / 1024)}k</th><th>Longest context</th><th>Pay-back</th><th></th></tr></thead>
<tbody>${hwRows}</tbody>
</table>`, { fig: 4 })}
${reachLine}
<p class="note">One machine per family, cheapest first. Speeds are measured where a public benchmark exists and estimated from memory bandwidth otherwise; the calculator says which for any configuration. The longest context is the longest setting the calculator offers that the machine still holds this model at, cache included${m.max_context_tokens ? `, and no machine is shown taking it past its own ${Math.round(m.max_context_tokens / 1024)}k limit` : ''}. Each one opens the calculator on that machine at that length.</p>
${furthest != null && furthest > ctx ? `<p><a class="cta" href="${esc(calcLink({ hw: atLength(furthest).hw.id, model: m.id, ctx: furthest }, data))}">Run ${esc(m.display_name)} at ${ctxLabel(furthest)} on the ${esc(hardwareLabel(atLength(furthest).hw))}</a></p>` : ''}` : ''}

${cheapest ? shorterMachinesSection(m, shorterMachines, cheapest, ctx) : ''}${missedMachinesSection(m, missed, holders.length === 1 ? holders[0] : null, ctx)}<h2>The specifics</h2>
<dl class="specs">
  <dt>Parameters</dt><dd>${fmtNum(m.params_b, 1)}B${m.active_params_b && m.active_params_b < m.params_b ? `, of which ${fmtNum(m.active_params_b, 1)}B are active per token` : ''}</dd>
  <dt>Quantisation</dt><dd>${esc(m.quantisation)}${alsoAt.map((o) => ` — also listed here at <a href="/models/${esc(o.id)}/">${esc(o.quantisation)}</a>, which is ${fmtGb(o.weights_gb)}`).join('')}</dd>
  <dt>Weights on disk</dt><dd>${fmtGb(m.weights_gb)}</dd>
  <dt>KV cache</dt><dd>${endStop(`${fmtGb(kvCacheGb(m, ctx))} at ${Math.round(ctx / 1024)}k context${m.architecture?.note ? ` — ${esc(m.architecture.note)}` : ''}`)} <a href="${SECTIONS.weightsAndCache}">How weights and cache add up</a>.</dd>
  <dt>Maximum context</dt><dd>${m.max_context_tokens ? `${Math.round(m.max_context_tokens / 1024)}k tokens` : 'unknown'}${m.max_context_note ? ` (${esc(m.max_context_note)})` : ''}</dd>
  <dt>Licence</dt><dd>${esc(m.license)}</dd>
  ${m.sources?.length ? `<dt>Sources</dt><dd>${sourceLinks(m.sources)}</dd>` : ''}
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

/** How many of the models in a machine's table its own memory stops, as the page writes it. */
const memoryCount = (n: number) => (n === 1 ? 'one' : String(n));

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
  <td class="c-model"><a href="/models/${esc(r.model.id)}/">${esc(r.model.display_name)}</a><span class="c-quant">${holdHyphens(r.model.quantisation)}</span></td>
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
</table>`, { fig: 1, pair: [2, 3] })}
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
  // machines. What sat below the cut used to be a count, so on the largest
  // machines the page named eighteen of the thirty-eight models it runs and
  // sent the rest to the calculator. runsOnNote() names all of them.
  const hidden = fits.slice(12).map((r) => r.model);
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
  <td class="c-model"><a href="/models/${esc(r.model.id)}/">${esc(r.model.display_name)}</a><span class="c-quant">${holdHyphens(r.model.quantisation)}</span></td>
  <td>${speedWithBasis(r)}</td>
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

  // What the speed column's marks mean, on the page where a reader actually meets
  // them. Every speed here says measured or estimated, the way /hardware/ and the
  // head-to-heads have always said it, and on most machines every one of them is
  // an estimate — so the sentence names this machine's own split rather than
  // explaining a mark in the abstract.
  const speedBasisLine = (() => {
    const known = shown.filter((r) => r.throughput.tokensPerSec != null);
    if (!known.length) return '';
    const measured = known.filter((r) => r.throughput.measurement === 'measured').length;
    const band = hw.memory_bandwidth_gbs ? `${hw.memory_bandwidth_gbs} GB/s of memory bandwidth` : 'memory bandwidth';
    if (!measured)
      return ` Each speed says how it was arrived at, and every one here is estimated from this machine's ${band} rather than taken from a published benchmark.`;
    if (measured === known.length)
      return ` Each speed says how it was arrived at, and every one here is measured: a published benchmark run on this machine.`;
    return ` Each speed says how it was arrived at: ${memoryCount(measured)} of the ${known.length} here ${measured === 1 ? 'is' : 'are'} measured, from a published benchmark run on this machine, and the rest are estimated from its ${band}.`;
  })();

  const best = fits[0];
  // What the table leaves out: the models this machine misses at the context every
  // figure above is taken at, and holds at a shorter window.
  const shorter = fitsShorter(hw, view.rows.map((r) => r.model), data);
  // Each sentence of the machine's note under the figure it is about, rather than
  // all of them under the memory figure. See splitHardwareNote().
  const note = splitHardwareNote(hw.notes);
  const body = `<article class="prose">
<h1>Can ${indefiniteArticle(label)} ${esc(label)} run local LLMs?</h1>
<p class="lede">Yes — ${fits.length} of the ${view.rows.length} open models on this site fit in its ${hw.usable_memory_gb ?? '?'} GB of usable memory${best ? `, the strongest being ${esc(best.model.display_name)}` : ''}${shorter.length ? `, and ${numberWord(shorter.length)} more if you keep the window shorter than ${ctxLabel(state.ctx)}` : ''}. Whether that saves you money is a different question${hwVerdict && hw.price_usd != null ? `: at ${hw.generation === 'previous' ? `its ${fmtUsd(hw.price_usd)} launch price` : fmtUsd(hw.price_usd)} and ${fmtTokens(state.usage)} tokens a day, it ${hwVerdict}` : ', and the answer is usually no'}.${hw.price_scope === 'card_only' ? ` Its price here is the card alone, so every figure below leaves out the PC you need to put it in. Every card on this site is <a href="${SECTIONS.cardsSideBySide}">set against the others here</a>.` : ''}</p>

<div class="answer">
  <div class="answer-row"><span class="answer-k">Price</span><span class="answer-v">${hw.price_usd == null ? 'not published yet' : fmtUsd(hw.price_usd)}${hw.generation === 'previous' ? ' at launch — discontinued' : ''}${hw.price_scope === 'card_only' ? '<span class="c-quant">card only</span>' : ''}</span></div>
  <div class="answer-row"><span class="answer-k">Memory</span><span class="answer-v">${hw.unified_memory_gb} GB${hw.usable_memory_gb != null ? `, about ${hw.usable_memory_gb} GB of it addressable by the GPU` : ''}${hw.memory_bandwidth_gbs ? ` at ${hw.memory_bandwidth_gbs} GB/s` : ''}</span></div>
  ${best ? `<div class="answer-row"><span class="answer-k">Best model it runs</span><span class="answer-v"><a href="/models/${esc(best.model.id)}/">${esc(best.model.display_name)}</a> — ${esc(tierName(best.model, data))}${best.throughput.tokensPerSec ? `, ${speedFrom(best.throughput)}` : ''}</span></div>` : ''}
  <div class="answer-row"><span class="answer-k">Pay-back against the API</span><span class="answer-v">${view.calc ? esc(verdictLine(view)) : 'cannot be computed yet'}${view.calc?.breakevenDays != null ? ` at ${fmtTokens(state.usage)} tokens a day` : ''}</span></div>
</div>

<p><a class="cta" href="${esc(calcLink({ hw: hw.id }, data))}">Run the numbers on this machine</a></p>

${rows ? `<h2>${runsHeading(hw)}</h2>
${contextLine}
${stack(`<table class="board">
<thead><tr><th>Model</th><th>Speed</th><th>Class</th><th>Good at</th><th>Memory</th><th>Longest context</th></tr></thead>
<tbody>${rows}</tbody>
</table>`, { fig: 1, pair: [3, 4] })}
<p class="note">Speed and memory are at ${Math.round(state.ctx / 1024)}k context, the setting the calculator starts on; the memory column is the weights plus the cache for that much of it.${speedBasisLine} There is <a href="/how-much-memory/">a page on how that sum works, and what each size needs</a>. The longest context is the longest setting the calculator offers that this machine still holds the model at, cache included, and each one opens the calculator on that model at that length. A figure tagged <i>memory</i> is one this machine ran out of room for, and the rest are stopped by the model's own limit or by the end of the list.</p>${note.speed ? `\n<p class="note">${esc(note.speed)}</p>` : ''}
${hidden.length ? `<p class="note">${runsOnNote(hidden, modelLink)}</p>` : ''}` : ''}

${shorterWindowSection(hw, shorter, state.ctx)}${range.length || rivals.length ? `<h2>${rivalsHeading(hw)}</h2>
${stack(`<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Memory</th><th>Models that fit</th><th>Pay-back</th></tr></thead>
<tbody>
${range.length ? `<tr class="is-frontier"><th colspan="5">${esc(familyHeading(hw))}</th></tr>${range.map(relatedRow).join('')}` : ''}
${rivals.length ? `<tr class="is-frontier"><th colspan="5">Nearest in price elsewhere on the list</th></tr>${rivals.map(relatedRow).join('')}` : ''}
</tbody>
</table>`, { fig: 4 })}
<p class="note">Every row uses the same defaults as the figures above: ${fmtTokens(state.usage)} tokens a day at ${state.ratio}:1 input to output, ${Math.round(state.ctx / 1024)}k context, and each machine's strongest model that fits, counted against the same ${view.rows.length} models.${(() => { const n = cardScopeNote([...range, ...rivals], hw.price_scope === 'card_only' ? undefined : data); return n ? ` ${n}` : ''; })()}</p>` : ''}
${headToHeadNote(hw)}

<h2>The specifics</h2>
<dl class="specs">
  <dt>Chip</dt><dd>${esc(hw.chip)}${hw.chip_variant ? ` — ${esc(hw.chip_variant)}` : ''}</dd>
  <dt>Memory bandwidth</dt><dd>${hw.memory_bandwidth_gbs ? `${hw.memory_bandwidth_gbs} GB/s` : 'unknown'}${note.bandwidth ? ` — ${esc(note.bandwidth)}` : ''}</dd>
  <dt>Usable by the GPU</dt><dd>${hw.usable_memory_gb ?? 'unknown'} GB${note.memory ? ` — ${esc(note.memory)}` : ''}</dd>
  <dt>Power under load</dt><dd>${hw.load_watts ?? 'unknown'} W (${esc(powerSourceLabel(hw))})${hw.load_watts_note ? ` — ${esc(hw.load_watts_note)}` : ''}</dd>
  ${hw.status || note.availability ? `<dt>Availability</dt><dd>${[hw.status, note.availability].filter(Boolean).map((t) => esc(t!)).join(' ')}</dd>` : ''}
  ${hw.sources?.length ? `<dt>Sources</dt><dd>${sourceLinks(hw.sources)}</dd>` : ''}
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
 * The entry-level configuration of a box against the one above it. Every other section on
 * this page reads the step as memory, because memory is what the table's own rows measure
 * and what decides which models fit. On these four pairs it is not only memory: the maker
 * reaches the headline price by putting a smaller chip in the same case, so the reader is
 * choosing between two machines, not two sizes of one. Nothing else on the page says that.
 *
 * What the smaller chip costs is the harder half, and the honest answer is mostly "not
 * speed": a token is written by reading the whole model out of memory, so the speeds here
 * follow bandwidth, and on three of the four pairs both chips read memory at the same rate.
 * Where the data does give the dearer chip a wider path, that is what the money buys and
 * the section says so.
 */
function chipStepSection(a: Hardware, b: Hardware, step: { machine: string; a: string; b: string }, va: View, fa: ModelRow[], fb: ModelRow[], ctxK: number): string {
  const la = shortHardwareLabel(a);
  const gap = fmtUsd((b.price_usd ?? 0) - (a.price_usd ?? 0), { cents: false });
  const ca = gpuCores(a);
  const cb = gpuCores(b);
  // Apple counts GPU cores and AMD counts compute units; each page says it the way its
  // own data says it rather than translating one maker's word into the other's
  const unit = /\bCU\b/.test(`${a.chip_variant ?? ''}${b.chip_variant ?? ''}`) ? 'compute units' : 'GPU cores';
  const cores = ca != null && cb != null && cb > ca
    ? ` The step adds ${cb - ca} ${unit} to the graphics part, ${cb} against ${ca}.`
    : '';

  const bwa = a.memory_bandwidth_gbs;
  const bwb = b.memory_bandwidth_gbs;
  const ta = shownTps(fa[0]);
  const tb = shownTps(fb[0]);
  // where the two speeds on the page came from different places, the reason they differ
  // can be the measurement rather than the machine, and a section saying the chip does
  // not set the speed has to answer the table above it
  const mixed = !!fa[0] && !!fb[0] && fa[0].throughput.measurement !== fb[0].throughput.measurement;
  const sameBw = bwa != null && bwb != null && bwa === bwb;
  const speed = bwa == null || bwb == null
    ? 'The data does not have a bandwidth figure for both of them.'
    : sameBw
      ? `The bigger graphics part is not what sets the speeds on this page. Writing a token means reading the whole model out of memory, and both chips read it at ${bwa} GB/s, so the figures follow the memory rather than the chip.${
          mixed
            ? ` The two speeds in the table are not identical all the same, and the reason is where each figure came from: ${esc(fa[0].throughput.source)} for the ${esc(la)}, ${esc(fb[0].throughput.source)} for the ${esc(shortHardwareLabel(b))}.`
            : ta != null && tb != null && ta === tb
              ? ' That is why the table gives them the same speed.'
              : ''
        } What the extra ${unit} do is read a long prompt before the first token comes back, and that is not something this site measures or prices.`
      : bwb > bwa
        ? `The dearer chip has the wider path to memory as well, ${bwb} GB/s against ${bwa}. Writing a token means reading the whole model out of memory, so that is the figure the speeds in the table follow, and it is the part of this step you can see in them.`
        : `The cheaper chip has the wider path to memory, ${bwa} GB/s against ${bwb}. Writing a token means reading the whole model out of memory, so that is the figure the speeds in the table follow.`;

  const holds = fb.length > fa.length
    ? `The ${esc(step.b)} box holds ${fb.length} of the ${va.rows.length} models the calculator counts against ${fa.length} on the ${esc(step.a)}.`
    : `Both hold the same ${fa.length} models at ${ctxK}k of context.`;
  const close = sameBw
    ? `if the models you want fit the cheaper box, the chip above it is not buying you tokens.`
    : `here the step buys room and speed together, and the years move with both.`;

  return `<h2>The step up is a different chip, not just more memory</h2>
<p>${esc(step.machine)} is one name for two machines. The data lists the ${esc(step.a)} as ${esc(a.chip_variant ?? '')} and the ${esc(step.b)} as ${esc(b.chip_variant ?? '')}.${cores} That is why this pair is not one of the site's memory-size comparisons: those hold the silicon equal so the memory is the whole of the difference, and ${esc(brandOf(a))} cut both to reach the ${fmtUsd(a.price_usd!, { cents: false })}.</p>
<p>${speed} ${holds} <a href="${esc(calcLink({ hw: a.id }, data))}">Price the ${esc(la)} on its own</a> before paying for the step: ${close}</p>`;
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

/**
 * Two machines from different families that cost about the same. Every other rule that
 * cuts these pages holds a piece of the hardware equal — the same chip at two memory
 * sizes, the same silicon in two boxes, the same box a generation apart — and spends the
 * page on what the price gap buys. This one holds the price, so the page has the opposite
 * shape and nothing else on it says so: the price row is the thing the two machines have
 * in common rather than the thing that separates them.
 *
 * The rest of the page already prices what each one holds, how fast it runs it and how
 * long it takes to pay back, so this section does not repeat a figure. It names the
 * question, and where one side is a graphics card it says the one thing that stops the
 * two prices being the same money at all.
 */
function sameMoneySection(x: Hardware, y: Hardware): string {
  const [cheap, dear] = (x.price_usd ?? 0) <= (y.price_usd ?? 0) ? [x, y] : [y, x];
  const lc = shortHardwareLabel(cheap);
  const ld = shortHardwareLabel(dear);
  const gap = (dear.price_usd ?? 0) - (cheap.price_usd ?? 0);
  // the scope travels with the figure: on four of these pages one side is a graphics
  // card, and $1,999 beside a machine name reads as a whole computer unless it says so
  const priced = (h: Hardware) => `${fmtUsd(h.price_usd!, { cents: false })} for the ${esc(shortHardwareLabel(h))}${h.price_scope === 'card_only' ? ', card only' : ''}`;
  const prices = gap === 0
    ? `These two cost the same: ${priced(cheap)} and ${priced(dear)}.`
    : `These two cost within ${fmtUsd(gap, { cents: false })} of each other: ${priced(cheap)} and ${priced(dear)}.`;

  // the families differ by the rule that made the pair; the makers need not, and a
  // sentence that says "different makers" of two Apple machines is wrong on eleven of
  // these pages
  const sameBrand = brandOf(cheap) === brandOf(dear);
  const kinds = sameBrand
    ? `Both are ${esc(brandOf(cheap))} machines, but a ${esc(cheap.family)} and a ${esc(dear.family)} are two different machines rather than two sizes of one.`
    : `${esc(brandOf(cheap))} makes one and ${esc(brandOf(dear))} the other.`;

  // the lede and the assumptions note both raise the card caveat already, so this says
  // only the part neither of them does: what the reader should do with that column
  const cards = [cheap, dear].filter((h) => h.price_scope === 'card_only');
  const scope = cards.length === 2
    ? ` Both figures are the card alone, so what they have in common is the money for the part that does the work and nothing to put it in.`
    : cards.length === 1
      ? ` The two are less equal than they look: the ${esc(shortHardwareLabel(cards[0]))}'s price buys the card alone, so read its column as the cost of the part that does the work on top of a machine you already own.`
      : '';

  return `<h2>The same money, two different machines</h2>
<p>${prices} ${kinds} Every other head-to-head on this site holds a piece of the hardware equal and asks what the price gap buys. This one holds the price, so the row that usually carries the answer is the row the two machines agree on, and everything under it is what the same money buys twice.${scope}</p>`;
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
  // the entry-level box against the one above it: the same name on both sides, so the
  // heading says it once and spends the rest on the two sizes the configurator offers
  const step = chipStepNames(a, b) ?? chipStepNames(b, a);
  // two machines from different families at about the same price: the price row is the
  // one the two agree on, which is the opposite of every other pair on this site
  const money = priceNeighbours(a, b, data);
  // both sides of a same-silicon pair carry the same memory, so a title that prints the
  // size twice spends a search result's 60 characters saying it again instead of naming
  // the second machine, which is the half of the pair the reader has not typed yet
  const withoutSize = (h: Hardware, label: string) => label.replace(new RegExp(`, ${h.unified_memory_gb}GB$`), '');
  const headingFrom = (label: (h: Hardware) => string) =>
    tiers
      ? `${tiers.machine}: ${tiers.a} vs ${tiers.b}`
      : step
      ? `${step.machine}, ${step.a} vs ${step.b}`
      : gens
      ? `${gens.machine} ${gens.a} vs ${gens.b}, ${gens.size}`
      : twins
        ? `${withoutSize(a, label(a))} vs ${label(b)}`
        : `${label(a)} vs ${label(b)}`;
  const heading = headingFrom(shortHardwareLabel);
  // the heading above is what the page says of itself and it keeps every machine's full
  // name. A search result is 60 characters wide, and on the longest of these pairs the
  // full names fill them before the second machine's memory size arrives, so the title
  // falls back to names with a screen size that separates nothing dropped out of them
  const shortHeading = headingFrom((h) => titleHardwareLabel(h, data.hardware));
  const ctxK = Math.round(st.ctx / 1024);
  const row = (k: string, x: string, y: string) => `<tr><th>${esc(k)}</th><td>${x}</td><td>${y}</td></tr>`;

  // each column takes the strongest model its own machine holds, and on 12 of these
  // pairs that is not the same model, so the speed cell names the model it belongs to
  const differ = !!fa[0] && !!fb[0] && fa[0].model.id !== fb[0].model.id;
  const speedCell = (r: ModelRow | undefined) =>
    !r ? '—' : `${speedWithBasis(r)}${differ ? `<span class="c-quant">${holdHyphens(r.model.display_name)}</span>` : ''}`;

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
    return `<tr><td class="c-model"><a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a><span class="c-quant">${tierLabel(m, data)}</span></td><td>${fmtGb(m.weights_gb)}</td><td>${r.fit.needGb != null ? fmtGb(r.fit.needGb) : '<span class="dim">unknown</span>'}</td><td>${speedWithBasis(r)}</td></tr>`;
  })
  .join('\n')}
</tbody>
</table>`, { fig: 3, labels: { 2: 'Needs' }, pair: [1, 2] })}
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
  .map((c) => `<tr><th>${fmtTokens(c.level.usage)}<span class="c-quant">${holdHyphens(c.level.label)}</span></th><td>${payCell(c.a)}</td><td>${payCell(c.b)}</td></tr>`)
  .join('\n')}
</tbody>
</table>
${ceilingLine}
<p><a class="cta" href="${esc(calcLink({ hw: a.id, model: shared.model.id, usage: top.usage }, data))}">Run the ${esc(la)} at ${fmtTokens(top.usage)} tokens a day</a> · <a href="${esc(calcLink({ hw: b.id, model: shared.model.id, usage: top.usage }, data))}">or the ${esc(lb)}</a></p>`;
      })()
    : '';

  const body = `<article class="prose">
<h1>${esc(tiers || twins || gens || step ? heading : `${la} vs ${lb}`)} for local AI</h1>
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
${step ? chipStepSection(...(chipStepNames(a, b) ? [a, b, step, va, fa, fb, ctxK] as const : [b, a, step, vb, fb, fa, ctxK] as const)) : ''}
${money ? sameMoneySection(a, b) : ''}
${likeForLike}
${usageSection}
${extraSection}
${machineSiblingNote(a, b)}
<h2>The assumptions behind both columns</h2>
<p class="note">Both columns use the same usage: ${fmtTokens(st.usage)} tokens a day at ${st.ratio}:1 input to output, ${ctxK}k of context, $${st.kwh} per kWh, and today's API prices held flat. Speeds marked <i>estimated</i> are worked out from memory bandwidth rather than measured, and pay-back scales with them.${(() => { const n = cardScopeNote([a, b], data); return n ? ` ${n}` : ''; })()} Change any of it in the calculator.</p>
<p class="note">More head to head: <a href="/hardware/${esc(a.id)}/">everything the ${esc(la)} runs</a> · <a href="/hardware/${esc(b.id)}/">everything the ${esc(lb)} runs</a> · <a href="${SECTIONS.machineMatchUps}">every other match-up</a> · <a href="/best/">the quickest pay-back at each level of use</a> · <a href="/leaderboard/">every model against the frontier</a></p>
</article>`;
  return pageShell(
    {
      title: titleOf([
        ...(step ? [`${heading}: the chip changes too`] : []),
        `${heading} for local LLMs`,
        heading,
        ...(shortHeading === heading ? [] : [`${shortHeading} for local LLMs`, shortHeading]),
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
          : step
          ? (() => {
              const [lo, hi, loFits, hiFits] = chipStepNames(a, b) ? [a, b, fa, fb] : [b, a, fb, fa];
              const gap = fmtUsd((hi.price_usd ?? 0) - (lo.price_usd ?? 0), { cents: false });
              const cl = gpuCores(lo);
              const ch = gpuCores(hi);
              const unit = /\bCU\b/.test(`${lo.chip_variant ?? ''}${hi.chip_variant ?? ''}`) ? 'compute units' : 'GPU cores';
              const chip = cl != null && ch != null ? `, with ${ch} ${unit} to ${cl}` : '';
              // what the step buys leads the description, and which of the two it is
              // depends on the pair: on one of them the dearer chip reads memory faster,
              // on the rest it does not and the memory is the whole of it
              const wider = lo.memory_bandwidth_gbs != null && hi.memory_bandwidth_gbs != null
                && hi.memory_bandwidth_gbs > lo.memory_bandwidth_gbs
                ? [
                    `The ${step.b} ${step.machine} reads its memory at ${hi.memory_bandwidth_gbs} GB/s against the ${step.a}'s ${lo.memory_bandwidth_gbs}${chip}. What ${gap} more buys, and whether it pays back.`,
                    `${step.machine}, ${step.a} or ${step.b}: ${hi.memory_bandwidth_gbs} GB/s against ${lo.memory_bandwidth_gbs}${chip}, ${gap} apart.`,
                  ]
                : [];
              const more = hiFits.length > loFits.length
                ? [
                    `The ${step.b} ${step.machine} holds ${hiFits.length} of the ${va.rows.length} open models here against ${loFits.length}${chip}. What ${gap} more buys, and whether it pays back.`,
                    `The ${step.b} ${step.machine} holds ${hiFits.length} of the ${va.rows.length} open models here against ${loFits.length}${chip}. What ${gap} more buys.`,
                    `${step.machine}, ${step.a} or ${step.b}: ${hiFits.length} models against ${loFits.length}${chip}, ${gap} apart.`,
                  ]
                : [];
              return [
                ...wider,
                ...more,
                `${step.machine}, ${step.a} or ${step.b}: ${gap} apart, and the chip changes with the memory. What it buys, and whether it pays back.`,
                `${step.machine}, ${step.a} or ${step.b}: a bigger chip as well as more memory, ${gap} apart.`,
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
          : money
          ? (() => {
              const [cheap, dear, cf, df] = (a.price_usd ?? 0) <= (b.price_usd ?? 0) ? [a, b, fa, fb] : [b, a, fb, fa];
              const lc = shortHardwareLabel(cheap);
              const ld = shortHardwareLabel(dear);
              const at = (cheap.price_usd === dear.price_usd
                ? `At ${fmtUsd(cheap.price_usd!, { cents: false })} each`
                : `At ${fmtUsd(cheap.price_usd!, { cents: false })} against ${fmtUsd(dear.price_usd!, { cents: false })}`);
              const holds = cf.length === df.length
                ? `both hold ${cf.length} of the ${va.rows.length} open models here`
                : `the ${lc} holds ${cf.length} of the ${va.rows.length} open models here and the ${ld} ${df.length}`;
              return [
                `${at}, ${holds}. What the same money buys, and which pays back sooner.`,
                `${at}, ${holds}. What the same money buys.`,
                `${lc} or ${ld} for the same money: what each holds, how fast it runs it and which pays back sooner.`,
                `${lc} or ${ld} for the same money: what each holds and which pays back sooner.`,
              ];
            })()
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
  <td class="c-model"><a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a><span class="c-quant">${holdHyphens(m.quantisation)}</span>${m.generation === 'legacy' ? '<span class="c-quant">older</span>' : ''}</td>
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

  // The plateau reads the ladder in order of what a model actually gets, which is
  // the figure that decides. The table reads it in order of the number on the box,
  // which is the only figure the reader knows before they look anything up, so the
  // sizes a machine is sold in stay together instead of being split apart by the
  // usable share.
  const byInstalled = [...ladder].sort(
    (a, b) => a.unified_memory_gb - b.unified_memory_gb || a.usable_memory_gb! - b.usable_memory_gb!,
  );

  // The size where reading the wrong row costs most: the one sold in the most
  // shapes here, and among those the one whose two ends are furthest apart.
  const splitSize = [...new Set(byInstalled.map((h) => h.unified_memory_gb))]
    .map((installed) => byInstalled.filter((h) => h.unified_memory_gb === installed))
    .filter((rows) => rows.length > 1)
    .sort(
      (a, b) =>
        b.length - a.length ||
        b[b.length - 1].usable_memory_gb! - b[0].usable_memory_gb! - (a[a.length - 1].usable_memory_gb! - a[0].usable_memory_gb!),
    )[0];

  const ladderRows = byInstalled
    .map((hw) => {
      const top = strongestThatFits(hw, CTX);
      return `<tr>
  <td><b>${hw.unified_memory_gb} GB</b></td>
  <td>${fmtGb1(hw.usable_memory_gb)}</td>
  <td class="c-hw">${machineLink(hw)}</td>
  <td>${fitCount(hw, CTX)}</td>
  <td class="c-model">${top ? `<a href="/models/${esc(top.id)}/">${esc(top.display_name)}</a> <span class="dim">${esc(tierName(top, data))}</span>` : '<span class="dim">none</span>'}</td>
  <td>${top ? `<a href="${esc(calcLink({ hw: hw.id, model: top.id, ctx: CTX }, data))}">Run the numbers</a>` : ''}</td>
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
</table>`, { fig: 4, labels: { 3: 'Cache', 5: 'Cheapest' }, pair: [2, 3] })}
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
<p>You can also make the cache smaller. ${esc(kv?.note ?? '')}${kv?.source_url ? ` (<a href="${esc(kv.source_url)}" rel="noopener">${esc(sourceName(kv.source_url))}</a>)` : ''} The calculator has that switch, and every figure on this page is at the 16-bit default.</p>

<h2>What can you run with the memory you already have?</h2>
<p>Every size a machine on sale here comes in is below, with how much of it a model actually gets, how many of the ${currentModels.length} current models fit in that at ${kctx} context, and the strongest of them.${
    splitSize
      ? ` The number on the box is not the number a model gets: the system takes a share, and on a machine with unified memory the GPU is only allowed to address part of the rest. ${splitSize[0].unified_memory_gb} GB appears ${splitSize.length} times below, handing a model anything from ${fmtGb1(splitSize[0].usable_memory_gb)} on the ${esc(hardwareLabel(splitSize[0]))} to ${fmtGb1(splitSize[splitSize.length - 1].usable_memory_gb)} on the ${esc(hardwareLabel(splitSize[splitSize.length - 1]))}. So find your size in the first column, then read down to the machine nearest yours.`
      : ''
  } The cheapest machine is shown at each level, and each row opens the calculator on that machine and that model.</p>
${stack(`<table class="board">
<thead><tr><th>Memory</th><th>Usable</th><th>Cheapest machine at this size</th><th>Models that fit at ${kctx}</th><th>Strongest of them</th><th></th></tr></thead>
<tbody>${ladderRows}</tbody>
</table>`, { fig: 3, labels: { 2: 'Cheapest', 4: 'Strongest' } })}
${
    plateau
      ? `<p>Read the strongest-model column before you spend anything. From ${fmtGb1(plateau.from.usable_memory_gb)} of usable memory up to ${fmtGb1(plateau.to.usable_memory_gb)}, the strongest model on this list does not change: it is <a href="/models/${esc(plateau.model.id)}/">${esc(plateau.model.display_name)}</a> the whole way. More memory across that stretch buys more models, more context and more room to work, not a cleverer one.${
          plateau.next && plateau.nextHw
            ? ` The next step up is <a href="/models/${esc(plateau.next.id)}/">${esc(plateau.next.display_name)}</a>, and the cheapest machine that holds it is the <a href="/hardware/${esc(plateau.nextHw.id)}/">${esc(hardwareLabel(plateau.nextHw))}</a> at ${fmtUsd(plateau.nextHw.price_usd)}.`
            : ''
        }</p>`
      : ''
  }

<p class="note">Every figure is at ${kctx} context unless the row says otherwise, with the cache at 16 bits, at the quantisation named against each model. Weights are the published file sizes on each model's page; the cache is worked out from the architecture recorded there. Machines are the current ones at list price, with the memory their maker publishes and the usable share on each machine's page; graphics cards are priced as the card alone, so add the PC around one before comparing one with a complete computer. ${cardRankingLine(data)} The tables by size cover all ${data.models.length} models listed here, superseded ones included and marked, because people still run them. The two tables of what a machine holds count the ${currentModels.length} current ones instead, which is what every machine page and the calculator count. To change the context, the quantisation or the cache type, <a href="${esc(calcLink({}, data))}">open the calculator</a>.</p>
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

/* ---------------------------- graphics cards ---------------------------- */

/**
 * One card, with everything the page says about it: what it holds, its strongest
 * model, and the complete computer nearest it in price.
 */
function gpuRow(hw: Hardware) {
  const view = computeView({ ...defaultState(data), hw: hw.id }, data);
  const fits = fitsOf(view);
  const strongest = fits.filter((r) => r.model.frontier_equivalent?.score != null)[0] ?? fits[0] ?? null;
  const rival = nearestCompleteComputer(hw, data);
  return { hw, fits, strongest, rival, rivalFits: rival ? fitCount(rival, CTX) : 0 };
}

/**
 * The model on a card that pays for the card soonest at one level of use, which
 * is not always its strongest: a big model saves more per token, a small one is
 * quick enough to get through the day's work at all. Where the card cannot
 * generate what the level asks for, the figure is for the most it can do, and it
 * carries the same marker the head-to-heads use.
 */
function quickestPayback(hw: Hardware, fits: ModelRow[], usage: number) {
  let best: { model: Model; days: number; capped: boolean; max: number | null } | null = null;
  for (const r of fits) {
    const v = computeView({ ...defaultState(data), hw: hw.id, model: r.model.id, usage }, data);
    if (!v.calc || v.calc.breakevenDays == null) continue;
    if (!best || v.calc.breakevenDays < best.days)
      best = { model: r.model, days: v.calc.breakevenDays, capped: v.capacity.capped, max: v.capacity.maxTokensPerDay ?? null };
  }
  return best;
}

/**
 * "Best GPU for local LLMs" is asked as a ranking question, and this data answers
 * it as a memory question first: a model runs on a card or it does not, and what
 * decides that is whether the weights and the cache fit in the card's memory at
 * once. Speed comes second and follows the bandwidth. So the page is built from
 * what each card holds rather than from a verdict, and the two things a card's
 * price does not include — the computer around it, and whether the money ever
 * comes back — get a section each rather than a footnote.
 */
function gpuPage(): string {
  const st = defaultState(data);
  const kctx = ctxLabel(CTX);
  const cards = graphicsCards(data);
  const rows = cards.map(gpuRow);
  const levels = bestUsageLevels(data);

  // the page's own answer: the strongest open model any card here holds, and the
  // cheapest card that holds it. Both are read out of the data rather than named,
  // so a new card or a new model moves the sentence rather than dating it.
  const heldByACard = new Set(rows.flatMap((r) => r.fits.map((f) => f.model.id)));
  const scored = currentModels
    .filter((m) => m.frontier_equivalent?.score != null)
    .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!);
  const ceiling = scored.find((m) => heldByACard.has(m.id)) ?? null;
  const cheapestForCeiling = ceiling
    ? [...rows].filter((r) => r.fits.some((f) => f.model.id === ceiling.id)).sort((a, b) => a.hw.price_usd! - b.hw.price_usd!)[0]
    : null;
  const dearest = [...rows].sort((a, b) => b.hw.price_usd! - a.hw.price_usd!)[0];
  // what the money above that cheapest card actually buys, which is the page's
  // second answer: more models and more speed, not a better model
  const ceilingRow = (r: typeof rows[number]) => r.fits.find((f) => f.model.id === ceiling?.id) ?? null;

  // the models no card here holds, which is where the memory answer stops
  const missed = scored.filter((m) => !heldByACard.has(m.id));
  const best = scored[0] ?? null;
  const bestRunner = best
    ? cheapestPerFamily(runnersFor(best, data)).slice().sort((a, b) => a.hw.price_usd! - b.hw.price_usd!)[0] ?? null
    : null;

  const perGb = rows.map((r) => ({ r, gb: pricePerUsableGb(r.hw)! })).sort((a, b) => a.gb - b.gb);
  const completePerGb = buyable
    .filter((h) => h.price_scope !== 'card_only')
    .map((h) => ({ h, gb: pricePerUsableGb(h)! }))
    .sort((a, b) => a.gb - b.gb)[0];

  const sideBySide = rows
    .map(({ hw, fits, strongest }) => `<tr>
  <td class="c-hw"><a href="/hardware/${esc(hw.id)}/">${esc(shortHardwareLabel(hw))}</a></td>
  <td>${strongest ? `<a class="dim" href="${esc(calcLink({ hw: hw.id, model: strongest.model.id }, data))}">${fmtUsd(hw.price_usd)}</a>` : fmtUsd(hw.price_usd)}<span class="c-quant">card only${hw.generation === 'previous' ? ', at launch' : ''}</span></td>
  <td>${fmtGb1(hw.usable_memory_gb)}</td>
  <td>${hw.memory_bandwidth_gbs ? `${fmtNum(hw.memory_bandwidth_gbs, 0)} GB/s` : '<span class="dim">unknown</span>'}</td>
  <td><b>${fits.length}</b> <span class="dim">of ${currentModels.length}</span></td>
  <td class="c-model">${strongest ? `<a href="/models/${esc(strongest.model.id)}/">${esc(strongest.model.display_name)}</a> <span class="dim">${esc(tierName(strongest.model, data))}</span>` : '<span class="dim">none of them</span>'}</td>
  <td>${speedWithBasis(strongest)}</td>
</tr>`)
    .join('');

  const moneyRows = rows
    .map(({ hw, fits, rival, rivalFits }) => `<tr>
  <td class="c-hw"><a href="/hardware/${esc(hw.id)}/">${esc(shortHardwareLabel(hw))}</a> <span class="dim">${fmtUsd(hw.price_usd)}, card only</span></td>
  <td>${fmtGb1(hw.usable_memory_gb)}</td>
  <td><b>${fits.length}</b></td>
  <td class="c-hw">${rival ? `<a href="/hardware/${esc(rival.id)}/">${esc(shortHardwareLabel(rival))}</a> <span class="dim">${fmtUsd(rival.price_usd)}</span>` : '<span class="dim">nothing near that price</span>'}</td>
  <td>${rival ? fmtGb1(rival.usable_memory_gb) : '—'}</td>
  <td>${rival ? `<b>${rivalFits}</b>` : '—'}</td>
</tr>`)
    .join('');

  // pay-back, per card, at the levels of use the calculator names. Each cell is the
  // model on that card that gets there soonest, which is the buyer's best case.
  const pay = rows.map(({ hw, fits }) => ({
    hw,
    cells: levels.map((l) => ({ level: l, best: quickestPayback(hw, fits, l.usage) })),
  }));
  const capped = pay.flatMap((p) => p.cells.filter((c) => c.best?.capped).map((c) => ({ hw: p.hw, ...c })));
  const payRows = pay
    .map(({ hw, cells }) => {
      // the model rarely changes down a row; where it does, the cell says which one
      const lead = cells[cells.length - 1]?.best?.model ?? cells.find((c) => c.best)?.best?.model ?? null;
      return `<tr>
  <td class="c-hw"><a href="/hardware/${esc(hw.id)}/">${esc(shortHardwareLabel(hw))}</a></td>
  <td class="c-model">${lead ? `<a href="/models/${esc(lead.id)}/">${esc(lead.display_name)}</a>` : '<span class="dim">nothing it holds</span>'}</td>
  ${cells
    .map(({ level, best: b }) => `<td>${
      b == null
        ? '<span class="dim">never</span>'
        : `${esc(fmtDuration(b.days))}${b.capped ? '<span class="c-quant">its ceiling</span>' : ''}${lead && b.model.id !== lead.id ? `<span class="c-quant">on ${holdHyphens(b.model.display_name)}</span>` : ''}`
    }</td>`)
    .join('')}
</tr>`;
    })
    .join('');

  const soonest = pay
    .map((p) => ({ hw: p.hw, cell: p.cells[p.cells.length - 1] }))
    .filter((x) => x.cell?.best)
    .sort((a, b) => a.cell.best!.days - b.cell.best!.days)[0];
  const top = levels[levels.length - 1];

  const body = `<article class="prose">
<h1>Which graphics card should you buy for local LLMs?</h1>
<p class="lede">Memory decides what you can run; bandwidth decides how fast it runs. ${sentenceCase(numberWord(cards.length))} cards are priced here, from ${fmtUsd(perGb[0].r.hw.price_usd)} to ${fmtUsd(dearest.hw.price_usd)} for the card alone, and they are closer together than that gap suggests.${
    ceiling && cheapestForCeiling
      ? ` The strongest open model any of them holds is ${esc(ceiling.display_name)}, and the cheapest card that holds it is the ${esc(shortHardwareLabel(cheapestForCeiling.hw))} at ${fmtUsd(cheapestForCeiling.hw.price_usd)}, card only. The ${esc(shortHardwareLabel(dearest.hw))} at ${fmtUsd(dearest.hw.price_usd)} runs more models and runs them faster. It does not run a better one.`
      : ''
  }</p>

<div class="answer">
  <div class="answer-row"><span class="answer-k">What decides it</span><span class="answer-v">Memory first: the weights and the cache for your context window have to fit in the card at the same time. Bandwidth second: it sets the speed.</span></div>
  ${ceiling && cheapestForCeiling ? `<div class="answer-row"><span class="answer-k">Best model a card runs</span><span class="answer-v"><a href="/models/${esc(ceiling.id)}/">${esc(ceiling.display_name)}</a>, ${esc(tierName(ceiling, data))}. ${sentenceCase(numberWord(rows.filter((r) => r.fits.some((f) => f.model.id === ceiling.id)).length))} of the ${numberWord(cards.length)} cards hold it at ${kctx} context, the cheapest being the <a href="/hardware/${esc(cheapestForCeiling.hw.id)}/">${esc(shortHardwareLabel(cheapestForCeiling.hw))}</a> at ${fmtUsd(cheapestForCeiling.hw.price_usd)}, card only.</span></div>` : ''}
  ${best && bestRunner ? `<div class="answer-row"><span class="answer-k">Best open model there is</span><span class="answer-v"><a href="/models/${esc(best.id)}/">${esc(best.display_name)}</a>, ${fmtGb(best.weights_gb)} of weights. No card here holds it. The cheapest machine that does is the <a href="/hardware/${esc(bestRunner.hw.id)}/">${esc(hardwareLabel(bestRunner.hw))}</a> at ${fmtUsd(bestRunner.hw.price_usd)}.</span></div>` : ''}
  ${soonest ? `<div class="answer-row"><span class="answer-k">Does one pay for itself</span><span class="answer-v">Not at ordinary use. At ${fmtTokens(top.usage)} tokens a day — ${esc(top.label)} — the quickest here is the ${esc(shortHardwareLabel(soonest.hw))}, in ${esc(fmtDuration(soonest.cell.best!.days))} on ${esc(soonest.cell.best!.model.display_name)}${
    soonest.cell.best!.model.id !== ceiling?.id ? ' — the cheapest card working a small model, not the best card working a good one' : ''
  }.</span></div>` : ''}
</div>

${ceiling && cheapestForCeiling ? `<p><a class="cta" href="${esc(calcLink({ hw: cheapestForCeiling.hw.id, model: ceiling.id }, data))}">Run the numbers on the ${esc(shortHardwareLabel(cheapestForCeiling.hw))} with ${esc(ceiling.display_name)}</a></p>` : ''}

<h2>Every card here, side by side</h2>
<p>What each one holds at ${kctx} context, counted against the ${currentModels.length} current models, with the strongest of them and how fast it runs. Each price opens the calculator on that card and that model.</p>
${stack(`<table class="board">
<thead><tr><th>Card</th><th>Price</th><th>Usable memory</th><th>Bandwidth</th><th>Models it runs</th><th>Strongest of them</th><th>Speed on it</th></tr></thead>
<tbody>${sideBySide}</tbody>
</table>`, { fig: 4, labels: { 2: 'Usable', 5: 'Strongest', 6: 'Speed' } })}
<p class="note">Prices are the card on its own: none of them includes the computer you put it in. ${
    sentenceCase(numberWord(rows.filter((r) => r.hw.generation === 'previous').length))
  } of the ${numberWord(cards.length)} are previous-generation cards priced at what they launched at, which is not what you would pay for one today — each card's own page says what to enter instead. Usable memory is what a model gets after the card's own overhead, and speed is on the strongest model in the row, so the column is not a race between equals.</p>

<h2>Memory is the gate</h2>
<p>A card runs a model or it does not, and nothing about the card changes that except how much memory it has. ${
    ceiling ? `${esc(ceiling.display_name)} is ${fmtGb(ceiling.weights_gb)} of weights before a single token of context, and the cache on top grows with every token you keep.` : ''
  } That sum, and not the price, is what puts a model on a card. <a href="${SECTIONS.weightsAndCache}">How the two add up</a> is a page of its own.</p>
${
    missed.length && best && bestRunner
      ? `<p>It is also where these cards stop. ${sentenceCase(numberWord(missed.length))} of the ${scored.length} current models with an index score fit none of the ${numberWord(cards.length)} cards, and ${(() => {
        let n = 0;
        while (n < scored.length && !heldByACard.has(scored[n].id)) n++;
        const names = scored.slice(0, Math.max(n, 1)).map((m) => `<a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a>`);
        const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
        return n > 1
          ? `the ${numberWord(n)} strongest open models on the site are among them: ${list}`
          : `the strongest open model on the site is one of them: ${list}`;
      })()}. The dearest card on the list, ${fmtGb1(dearest.hw.usable_memory_gb)} of memory for ${fmtUsd(dearest.hw.price_usd)}, holds none of them either. For a model that size you are buying unified memory instead: ${esc(best.display_name)} runs on the <a href="/hardware/${esc(bestRunner.hw.id)}/">${esc(hardwareLabel(bestRunner.hw))}</a> at ${fmtUsd(bestRunner.hw.price_usd)}, and on nothing cheaper.</p>`
      : ''
  }

<h2>Bandwidth is the speed</h2>
<p>Once a model fits, the card reads every active weight for every token it writes, so tokens a second tracks memory bandwidth more closely than anything else on the spec sheet.${
    ceiling && cheapestForCeiling
      ? (() => {
          const fastest = [...rows].filter((r) => ceilingRow(r)).sort((a, b) => (shownTps(ceilingRow(b)) ?? 0) - (shownTps(ceilingRow(a)) ?? 0))[0];
          const cheap = ceilingRow(cheapestForCeiling);
          const fast = ceilingRow(fastest);
          if (!cheap || !fast || fastest.hw.id === cheapestForCeiling.hw.id) return '';
          return ` On ${esc(ceiling.display_name)} the ${esc(shortHardwareLabel(fastest.hw))} does ${speedWithBasis(fast)} at ${fmtNum(fastest.hw.memory_bandwidth_gbs!, 0)} GB/s, against ${speedWithBasis(cheap)} for the ${esc(shortHardwareLabel(cheapestForCeiling.hw))} at ${fmtNum(cheapestForCeiling.hw.memory_bandwidth_gbs!, 0)} GB/s. Same model, same context, ${fmtNum((fastest.hw.memory_bandwidth_gbs! / cheapestForCeiling.hw.memory_bandwidth_gbs!), 1)}× the bandwidth.`;
        })()
      : ''
  }</p>
<p>Every speed on this page is estimated rather than measured, but not out of thin air: each card's estimate is calibrated against that card's own measured llama.cpp runs, which are listed with their sources on its page. Estimates for small models run high, so read them as an upper bound rather than a promise.</p>

<h2>What the same money buys with a computer around it</h2>
<p>A card's price here buys the card. You still need the machine it goes in, and this site does not guess at what you would build, so every figure above leaves that cost out. What it can show is what the same money already holds when the computer comes with it. Each card is set against the complete machine nearest it in price, with both prices printed, so a near miss is visible rather than smoothed over.</p>
${stack(`<table class="board">
<thead><tr><th>Card</th><th>Its memory</th><th>Models</th><th>Nearest complete computer</th><th>Its memory</th><th>Models</th></tr></thead>
<tbody>${moneyRows}</tbody>
</table>`, { fig: 2, labels: { 1: 'Card memory', 3: 'Computer', 4: 'Its memory', 5: 'Its models' } })}
${(() => {
    // where the money already buys more models with a computer attached, which is
    // the only reading of this table that changes a decision
    const beaten = rows.filter((r) => r.rival && r.rivalFits > r.fits.length);
    if (!beaten.length) return '';
    const worst = [...beaten].sort((a, b) => b.rivalFits - b.fits.length - (a.rivalFits - a.fits.length))[0];
    const gap = worst.hw.price_usd! - worst.rival!.price_usd!;
    return `<p>On ${numberWord(beaten.length)} of the ${numberWord(cards.length)} the complete computer holds more models than the card does: the ${beaten
      .map((r) => `${esc(shortHardwareLabel(r.rival!))} holds ${r.rivalFits} where the ${esc(shortHardwareLabel(r.hw))} holds ${r.fits.length}`)
      .join(', and the ')}. The widest gap is the ${esc(shortHardwareLabel(worst.hw))}: ${worst.rivalFits - worst.fits.length} models fewer than the ${esc(shortHardwareLabel(worst.rival!))}, which costs ${
      gap > 0 ? `${fmtUsd(gap, { cents: false })} less` : gap < 0 ? `${fmtUsd(-gap, { cents: false })} more` : 'the same'
    } and is a computer rather than a part for one. What the card has instead is bandwidth: ${fmtNum(worst.hw.memory_bandwidth_gbs!, 0)} GB/s against ${fmtNum(worst.rival!.memory_bandwidth_gbs!, 0)} GB/s.</p>`;
  })()}
<p>Per gigabyte, most of these cards are the expensive way round. ${
    perGb.length && completePerGb
      ? `The ${esc(shortHardwareLabel(perGb[0].r.hw))} is ${fmtUsd(perGb[0].gb, { cents: false })} for each usable gigabyte and the ${esc(shortHardwareLabel(perGb[perGb.length - 1].r.hw))} is ${fmtUsd(perGb[perGb.length - 1].gb, { cents: false })}. The cheapest gigabyte in a complete computer is the <a href="/hardware/${esc(completePerGb.h.id)}/">${esc(hardwareLabel(completePerGb.h))}</a> at ${fmtUsd(completePerGb.gb, { cents: false })}, and it arrives with the computer attached. ${(() => {
          const under = perGb.filter((x) => x.gb < completePerGb.gb);
          return under.length
            ? `${sentenceCase(numberWord(under.length))} card${under.length === 1 ? '' : 's'} beat${under.length === 1 ? 's' : ''} that — ${under.map((x) => `the ${esc(shortHardwareLabel(x.r.hw))} at ${fmtUsd(x.gb, { cents: false })}` ).join(', ')} — and ${under.length === 1 ? 'it is the smallest card here' : 'they are the smallest cards here'}.`
            : 'No card here beats it.';
        })()} Divide the price by the usable memory yourself: the two figures are in the tables above.`
      : ''
  }${(() => {
    const fastest = buyable
      .filter((h) => h.price_scope !== 'card_only' && h.memory_bandwidth_gbs != null)
      .sort((a, b) => b.memory_bandwidth_gbs! - a.memory_bandwidth_gbs! || a.price_usd! - b.price_usd!)[0];
    if (!fastest) return '';
    const over = rows.filter((r) => (r.hw.memory_bandwidth_gbs ?? 0) > fastest.memory_bandwidth_gbs!);
    if (!over.length)
      return ` What the cards give back is speed, but not on this list: every one of them reads memory more slowly than the <a href="/hardware/${esc(fastest.id)}/">${esc(hardwareLabel(fastest))}</a> at ${fmtNum(fastest.memory_bandwidth_gbs!, 0)} GB/s.`;
    return ` What a card gives back is bandwidth, and only at the top of the range: ${numberWord(over.length)} of the ${numberWord(cards.length)} read memory faster than any complete computer here, at ${fmtNum(Math.max(...over.map((r) => r.hw.memory_bandwidth_gbs!)), 0)} GB/s against ${fmtNum(fastest.memory_bandwidth_gbs!, 0)} GB/s for the <a href="/hardware/${esc(fastest.id)}/">${esc(hardwareLabel(fastest))}</a>. The other ${numberWord(cards.length - over.length)} are slower than that machine.`;
  })()}</p>

<h2>How much use it takes for a card to pay for itself</h2>
<p>Everything above is at ${fmtTokens(st.usage)} tokens a day. Pay-back moves with how hard you work a machine, so here is each card at the ${numberWord(levels.length)} levels of use the calculator names, on whichever model it holds that gets there soonest. The levels run from ${esc(levels[0].label)} to ${esc(top.label)}.</p>
${stack(`<table class="board">
<thead><tr><th>Card</th><th>Soonest on</th>${levels.map((l) => `<th>${fmtTokens(l.usage)} a day</th>`).join('')}</tr></thead>
<tbody>${payRows}</tbody>
</table>`, { fig: levels.length + 1, labels: { 1: 'Soonest on' } })}
${
    capped.length
      ? `<p class="note">${capped.length === 1 ? 'One figure is' : `${numberWord(capped.length)} figures are`} marked as a ceiling: the card cannot generate what that level asks for, so the figure is for the most it can do rather than for the whole of what was asked. The ${esc(shortHardwareLabel(capped[0].hw))} manages at most ${capped[0].best!.max != null ? fmtTokens(capped[0].best!.max!) : 'less than the row asks for'} tokens a day on that model.</p>`
      : ''
  }
<p class="note">These are the best case for each card and they still run to years at anything short of constant use, because the pay-back is against renting the same model from an API, and the small models a card holds are the cheap ones to rent. The card price is also the whole of the outlay here, so a real build pays back later than the table says. For the same question asked the other way round — which machine pays back soonest at a level of use — see <a href="/best/">best buys by usage</a>.</p>

<p class="note">Every figure is at ${kctx} context and at the quantisation named on each model's page, with ${st.ratio}:1 input to output, $${esc(String(data.defaults.electricity.default_price_per_kwh_usd))} per kWh and today's API prices held flat. Models counted are the ${currentModels.length} current ones, the same set every machine page counts. Card prices are list or launch prices for the card alone, read on ${esc(data.defaults.data_last_checked)}, with the source on each card's page. Set two cards against each other in <a href="/compare/">the head-to-heads</a>, rank the models themselves on <a href="/leaderboard/">the leaderboard</a>, or <a href="${esc(calcLink({}, data))}">open the calculator</a> and enter what you actually paid.</p>
</article>`;

  return pageShell(
    {
      title: titleOf([`Best GPU for local LLMs: what ${numberWord(cards.length)} cards really run`, 'Best GPU for local LLMs']),
      description: descOf([
        `What each graphics card here holds at ${kctx} context, the strongest open model it runs, how fast, and how much use it takes before it pays for itself.`,
        `What each graphics card holds, the strongest model it runs, how fast, and how much use it takes to pay for itself.`,
      ]),
      canonical: '/best-gpu/',
      ogImage: GPU_CARD,
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/best-gpu/', label: 'Which graphics card' }],
    },
    body,
    data,
  );
}

/* ------------------------- model head-to-heads ------------------------- */

function modelComparePage(a: Model, b: Model): string {
  // The two rules that cut these pairs ask different questions, and only one of them
  // needs answering in words: on a generation pair the reader already runs one of the
  // two, so the page owes them what swapping it changes.
  const generation = modelGenerations.get(modelComparePath(a, b)) ?? null;
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
    return `$${ce.input_price_per_mtok} in / $${ce.output_price_per_mtok} out${ce.is_exact_match ? '' : `<span class="c-quant">priced as ${holdHyphens(ce.name)}</span>`}`;
  };
  const apiCell = (m: Model, view: View | undefined) => {
    const c = view?.calc;
    if (!c) return '<span class="dim">unknown</span>';
    const ce = m.cloud_equivalent;
    return `${fmtUsd(c.cloudCostPerMonth)}${ce.is_exact_match ? '' : `<span class="c-quant">priced as ${holdHyphens(ce.name)}</span>`}`;
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
  .map((c) => `<tr><th>${fmtTokens(c.level.usage)}<span class="c-quant">${holdHyphens(c.level.label)}</span></th><td>${payCell(c.a)}</td><td>${payCell(c.b)}</td></tr>`)
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
${generation ? modelGenerationSection(generation[0], generation[1], data) : ''}${sideBySide}
${usageSection}
${machinesSection}
${modelSiblingNote(a, b)}
<h2>The assumptions behind both columns</h2>
<p class="note">Both columns use the same usage: ${fmtTokens(st.usage)} tokens a day at ${st.ratio}:1 input to output, ${ctxK}k of context, $${st.kwh} per kWh, and today's API prices held flat.${race?.shortened ? ` The two sections that need one machine to hold both models are at ${raceK}k of context instead, which is the longest on the calculator's list where one does.` : ''} Speeds marked <i>estimated</i> are worked out from memory bandwidth rather than measured, and pay-back scales with them. Where nobody rents an open model by the token, its API prices are the nearest hosted model's, named beside them. Machines are the ${considered} here with a published price that are still sold. Change any of it in the calculator.</p>
<p class="note">More head to head: ${modelLink(a, ra)} · ${modelLink(b, rb)} · <a href="${SECTIONS.modelMatchUps}">every other match-up</a> · <a href="/leaderboard/">both against the frontier</a> · <a href="/best/">the quickest pay-back at each level of use</a></p>
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
 * What cuts the two lists on `/compare/`, one entry per rule, in the order
 * `hardwarePairs()` and `modelPairs()` apply them.
 *
 * The sentence above each table is written from this list rather than by hand, because
 * written by hand it drifted: seven rules cut the machine match-ups while the page said
 * five, and three cut the model match-ups while it said two, so 50 of the 189 rows sat
 * under an explanation that did not reach them. A reader who found *Mac mini M6, 32GB vs
 * Radeon AI PRO R9700, 32GB* on a page naming five kinds none of them was had no way to
 * tell why the two were on a page together.
 *
 * `checkMatchUpKinds()` holds the list to the rules: a rule added to `versus-card.ts`
 * without a clause here fails the build naming the match-up nothing explains.
 */
interface MatchUpKind<T> {
  /** every pair this rule cuts, whether or not an earlier rule reached it first */
  pairs: [T, T][];
  /** the clause the page gives it, mid-sentence and without its punctuation */
  clause: string;
}

const gridOf = <T,>(xs: T[]): [T, T][] => {
  const out: [T, T][] = [];
  for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) out.push([xs[i], xs[j]]);
  return out;
};

const machineMatchUpKinds = (): MatchUpKind<Hardware>[] => [
  {
    pairs: gridOf(flagshipMachines(data)),
    clause: 'One machine per family, the middle of its range by price, against every other',
  },
  {
    pairs: gridOf(graphicsCards(data)),
    clause: 'Every graphics card against every other card, since a card is bought as a part and a part is what people put against another part',
  },
  {
    pairs: memoryTierPairs(data),
    clause: 'Every memory tier of one machine against the others, which is the question left once you have picked the box',
  },
  {
    pairs: sameSiliconPairs(data),
    clause: 'Each box against the cheapest box built on the same GPU with the same memory, where the whole question is what the dearer one charges on top',
  },
  {
    pairs: generationPairs(data),
    clause: 'Every discontinued machine against the one that replaced it, which is the upgrade question',
  },
  {
    pairs: chipStepPairs(data),
    clause: 'The cheapest configuration of a box against the cheapest one with the better chip in it, since what a maker cuts to reach a headline price is the chip and the memory at once',
  },
  {
    pairs: priceNeighbourPairs(data),
    clause: `Each machine against the one from another family nearest it in price, within ${Math.round(PRICE_NEIGHBOUR_GAP * 100)}%, which holds the price still and asks what the same money buys twice`,
  },
];

const modelMatchUpKinds = (): MatchUpKind<Model>[] => {
  const ranked = rankedModels(data);
  const ladder: [Model, Model][] = [];
  for (let i = 0; i + 1 < ranked.length; i++) ladder.push([ranked[i], ranked[i + 1]]);
  return [
    {
      pairs: ladder,
      clause: 'Each model against the next one down the leaderboard, which is the choice you face once you know what your machine holds',
    },
    {
      pairs: modelGenerationPairs(data),
      clause: 'Each last-generation model against the current one of its own family nearest it in size, which is the upgrade question, and one the leaderboard never puts side by side because a year of work separates the two on it',
    },
    {
      pairs: memoryNeighbourPairs(data),
      clause: `Each model against the one from another family nearest it in the memory it needs, within ${Math.round(MODEL_MEMORY_GAP * 100)}%, which is where a reader with a machine already on the desk starts`,
    },
  ];
};

/**
 * The kinds, as a line saying how many and one line each.
 *
 * They were a single sentence of clauses while there were two of them and five, and at
 * seven that sentence ran to 170 words and six semicolons — a wall in front of the table
 * it explains, on a page a reader comes to for one row. A list is what it always was.
 */
function matchUpKindsList(kinds: { clause: string }[]): string {
  const items = kinds.map((k) => `<li>${k.clause}.</li>`).join('');
  return `<p>${sentenceCase(numberWord(kinds.length))} kinds of match-up cut this list.</p>
<ul class="rules">${items}</ul>`;
}


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
<p class="lede">Every comparison on this site in one place: ${machines.length} machine match-ups and ${modelPairs(data).length} model match-ups, each row carrying the prices, the memory and the speeds the comparison itself opens with. For one machine on its own, start at <a href="/best/">best buys by usage</a>, the <a href="/leaderboard/">leaderboard</a> or <a href="/hardware/">every machine in one table</a>.</p>
${most && cheapest ? `<h2>Does any machine here hold every model?</h2>
<p>The short version: none of the ${ranked.length} machines compared here holds more than ${most.fits} of the ${modelCount} open models${atMost.length > 1 ? `, and ${atMost.length} of them hold that many` : ''}. The cheapest that does is the ${esc(shortHardwareLabel(most.hw))} at ${priceWithScopeText(most.hw)}. The cheapest machine here at all is the ${esc(shortHardwareLabel(cheapest.hw))} at ${priceWithScopeText(cheapest.hw)}, which holds ${cheapest.fits}.${launchNote([most.hw, cheapest.hw])}</p>` : ''}

<h2>Machine against machine</h2>
${matchUpKindsList(machineMatchUpKinds())}
<p>The two speeds in a row are on the strongest model both machines in it can hold at ${ctxK}k of context, so they are running the same work.</p>
${stack(`<table class="board">
<thead><tr><th>Match-up</th><th>Price</th><th>Memory</th><th>Models that fit, of ${modelCount}</th><th>Speed on a model both hold</th></tr></thead>
<tbody>${machineRows}</tbody>
</table>`, { fig: 3, labels: { 4: 'Both speeds' } })}

<h2>Model against model</h2>
${matchUpKindsList(modelMatchUpKinds())}
<p>The machine named in a row is the cheapest here that runs both, so the two can be weighed on one computer.</p>
${stack(`<table class="board">
<thead><tr><th>Match-up</th><th>Score</th><th>Weights</th><th>Cheapest machine that runs both</th><th></th></tr></thead>
<tbody>${modelRows}</tbody>
</table>`, { fig: 1, labels: { 3: 'Cheapest' } })}

<h2>The assumptions behind both tables</h2>
<p class="note">Every figure here is the one the page behind it prints, at the same defaults: ${fmtTokens(st.usage)} tokens a day at ${st.ratio}:1 input to output, ${ctxK}k of context, $${st.kwh} per kWh, and today's API prices held flat. A speed that says <i>estimated</i> is worked out from memory bandwidth rather than measured. Graphics cards are priced as the card alone, so add the PC around one before comparing it with a complete computer. ${cardRankingLine(data)} Scores are the ${esc(data.defaults.frontier_basis?.name ?? 'intelligence index')}. Each calculator link opens the machine in its row running the first model named; change any of it once you are there.</p>
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
<p class="lede">All ${data.hardware.length} configurations this site lists, in one table: what each costs, how much of its memory the GPU can use, how many of the ${total} open models it holds at ${ctxLabel(st.ctx)} of context, the strongest of those, and how long that pair takes to pay for itself rather than renting the same model. ${publishedPriceLine(data)} Families are in order of what the cheapest of them costs. For the quickest pay-back at a given amount of use, see <a href="/best/">best buys by usage</a>; for two machines side by side, <a href="/compare/">every head-to-head</a>; for what each model needs before you pick a box, <a href="/how-much-memory/">how much memory you need</a>.</p>
${plateau && quickest && slowest ? `<h2>Does a dearer machine run a better model?</h2>
<p>The short version: more money buys memory, and memory buys a stronger model in only ${numberWord(steps.length)} steps. Of the ${entries.length} machines here, ${plateau.on.length} top out at the same model, ${esc(plateau.model.display_name)}${plateau.cheapest && plateau.dearest ? `: everything from the ${esc(shortHardwareLabel(plateau.cheapest.hw))} at ${priceWithScopeText(plateau.cheapest.hw)} to the ${esc(shortHardwareLabel(plateau.dearest.hw))} at ${priceWithScopeText(plateau.dearest.hw)}` : ''}. ${aboveCount ? `${sentenceCase(numberWord(aboveCount))} hold something stronger${cheapestAbove ? `, and the cheapest of those is the ${esc(shortHardwareLabel(cheapestAbove.hw))} at ${priceWithScopeText(cheapestAbove.hw)}` : ''}, while ${holdAll.length === 1 ? 'one machine holds' : `${numberWord(holdAll.length)} hold`} all ${total} models on the list.` : ''} Between those steps the money buys speed, spare memory and a longer window rather than a better model.${launchLine([plateau.cheapest, plateau.dearest, cheapestAbove])}</p>
<h2>How long each machine takes to pay for itself</h2>
<p>Pay-back runs the other way, because the strongest model a machine holds is also the slowest thing it can run. At ${esc(fmtTokens(st.usage))} tokens a day on that model, the quickest figure in the table is <b>${esc(fmtDuration(quickest.days as number))}</b>, on the ${esc(shortHardwareLabel(quickest.hw))}, and the slowest is ${esc(fmtDuration(slowest.days as number))}. Nothing here pays for itself inside a decade at that usage. What changes the answer is using the machine much harder, or running a smaller model on it, and <a href="/best/">best buys by usage</a> ranks both.${launchLine([quickest])}</p>` : ''}
<h2>Every machine here, side by side</h2>
${stack(`<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Usable memory</th><th>Models it holds, of ${total}</th><th>Strongest model it holds, and its speed</th><th>Pays back in</th></tr></thead>
<tbody>${rows}</tbody>
</table>`, { fig: 5, labels: { 2: 'Usable', 3: 'Models', 4: 'Strongest model' } })}
<h2>The assumptions behind the table</h2>
<p class="note">Usable memory is what the GPU can address, which is less than the memory fitted: on a Mac it follows the macOS wired limit, and on a graphics card it is the VRAM less the gigabyte llama.cpp leaves free. The count is of the ${total} current open models at ${ctxLabel(st.ctx)}; ask for a longer window and the cache grows, so fewer fit, and each machine's own page gives the length it takes every model to. Pay-back is that machine running the strongest model it holds, at ${esc(fmtTokens(st.usage))} tokens a day, ${st.ratio}:1 input to output, $${st.kwh} per kWh, and today's API prices held flat; a smaller model on the same machine pays back sooner, which is what <a href="/best/">best buys</a> ranks. Graphics cards are priced as the card alone, so add the PC around one before comparing it with a complete computer. ${cardRankingLine(data)} A discontinued machine is priced at what it launched at, which is not a price you can pay today. Each price opens the calculator on that machine running the model beside it.</p>
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

/* --------------------- what a token costs either way --------------------- */

/**
 * The page the rest of the site is an instance of: what a token costs to rent
 * against what it costs to generate, and how many of them it takes before the
 * machine has paid for itself.
 *
 * Break-even here is counted in tokens rather than in months, because at today's
 * prices held flat the saving on each million is a constant: the count that covers
 * a machine is the same whether it arrives in a year or in a lifetime. That is the
 * one claim the page is built on, and `checkTokenCost()` recomputes it at the five
 * levels of use the calculator names.
 */
function tokenCostPage(): string {
  const st = defaultState(data);
  const hw = costMachine(data);
  const view = computeView({ ...st, hw: hw.id }, data);
  const dm = view.model!;
  const drow = rowFor(view, dm)!;
  const tps = drow.throughput.tokensPerSec!;
  const base = tokenCost(dm, hw, tps, data)!;
  const ce = dm.cloud_equivalent;
  const label = hardwareLabel(hw);
  const kctx = Math.round(st.ctx / 1024);
  const costs = tokenCosts(hw, data);
  const priced = costs.filter((c) => c.cost.breakevenTokens != null);
  const n = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 0 });

  // the working behind the two figures in the answer box, in the page's own numbers
  const outTokens = MTOK / (st.ratio + 1);
  const inTokens = MTOK - outTokens;
  const inBill = (inTokens / MTOK) * ce.input_price_per_mtok!;
  const outBill = (outTokens / MTOK) * ce.output_price_per_mtok!;
  const seconds = outTokens / tps;
  const kwh = (seconds / 3600) * (hw.load_watts! / 1000);
  const times = base.generated > 0 ? base.rented / base.generated : null;
  const standInPower = hw.load_watts_status === 'stand_in';

  const costRow = (c: ModelCost) => {
    const m = c.row.model;
    const e = m.cloud_equivalent;
    const x = c.cost.generated > 0 ? c.cost.rented / c.cost.generated : null;
    return `<tr>
  <td class="c-model"><a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a><span class="c-quant">${holdHyphens(m.quantisation)}</span>${e.stand_in ? `<br><span class="dim">nobody rents it; priced as ${esc(e.name)}</span>` : ''}</td>
  <td>${esc(fmtPerMtok(c.cost.rented))}</td>
  <td>${esc(fmtPerMtok(c.cost.generated))}</td>
  <td>${x == null || x < 1 ? '<span class="dim">renting is cheaper</span>' : `${fmtNum(x, x < 10 ? 1 : 0)}×`}</td>
  <td>${c.cost.breakevenTokens == null ? '<span class="dim">never</span>' : `${esc(fmtTokens(c.cost.breakevenTokens))} tokens`}</td>
</tr>`;
  };

  // the same count of tokens, arriving on very different dates
  const levels = bestUsageLevels(data).map((l) => {
    const v = computeView({ ...st, hw: hw.id, model: dm.id, usage: l.usage }, data);
    return { ...l, view: v, days: v.calc!.breakevenDays, tokens: v.calc!.breakevenTokens };
  });
  const levelRows = levels
    .map(
      (l) => `<tr>
  <th>${esc(fmtTokens(l.usage))}<span class="c-quant">${holdHyphens(l.label)}</span></th>
  <td>${esc(fmtTokens(l.tokens))} tokens</td>
  <td>${esc(fmtDuration(l.days))}${l.view.capacity.capped ? '<span class="c-quant">its ceiling</span>' : ''}</td>
</tr>`,
    )
    .join('\n');

  // the mix of input to output moves the answer further than the machine does
  const mixes = data.defaults.use_cases
    .map((u) => ({ use: u, cost: tokenCost(dm, hw, tps, data, u.ratio)! }))
    .sort((a, b) => (a.cost.breakevenTokens ?? Infinity) - (b.cost.breakevenTokens ?? Infinity));
  const mixRows = mixes
    .map(
      (x) => `<tr>
  <td class="c-model">${esc(x.use.label)}${x.use.note ? `<br><span class="dim">${esc(x.use.note)}</span>` : ''}</td>
  <td>${esc(String(x.use.ratio))}:1${x.use.ratio === st.ratio ? '<span class="c-quant">default</span>' : ''}</td>
  <td>${esc(fmtPerMtok(x.cost.rented))}</td>
  <td>${esc(fmtPerMtok(x.cost.generated))}</td>
  <td>${x.cost.breakevenTokens == null ? '<span class="dim">never</span>' : `${esc(fmtTokens(x.cost.breakevenTokens))} tokens`}</td>
</tr>`,
    )
    .join('\n');
  const cheapestMix = mixes[0];
  const dearestMix = mixes[mixes.length - 1];

  // every current machine that runs the same model, so the spread in the electricity
  // can be set against the spread in the price
  const runners = data.hardware
    .filter((h) => h.price_usd != null && (h.generation ?? 'current') === 'current')
    .map((h) => {
      const v = computeView({ ...st, hw: h.id, model: dm.id }, data);
      const r = rowFor(v, dm);
      return v.model?.id === dm.id && r?.throughput.tokensPerSec != null
        ? { hw: h, cost: tokenCost(dm, h, r.throughput.tokensPerSec, data) }
        : null;
    })
    .filter((x): x is { hw: Hardware; cost: TokenCost } => !!x && !!x.cost)
    .sort((a, b) => a.cost.generated - b.cost.generated);
  const cheapestGen = runners[0];
  const dearestGen = runners[runners.length - 1];
  const prices = runners.map((r) => r.hw.price_usd!);

  // where renting wins outright, counted over every machine and model that can be priced
  let beaten = 0;
  let free = 0;
  let wins = 0;
  const lostOn = new Map<string, Model>();
  for (const h of data.hardware) {
    if (h.price_usd == null || (h.generation ?? 'current') === 'previous') continue;
    for (const m of data.models) {
      if ((m.generation ?? 'current') === 'legacy') continue;
      const v = computeView({ ...st, hw: h.id, model: m.id }, data);
      if (v.model?.id !== m.id || !v.calc) continue;
      const c = tokenCost(m, h, rowFor(v, m)!.throughput.tokensPerSec!, data);
      if (!c) continue;
      if (c.rented === 0) free++;
      else if (c.rented > c.generated) wins++;
      else {
        beaten++;
        lostOn.set(m.id, m);
      }
    }
  }
  const pairs = wins + beaten + free;
  // where the API wins on price it is worth saying which models, because so far it
  // has been one: a dense model priced as the much lighter one nobody rents it beside
  const losers = [...lostOn.values()];
  const loser = losers.length === 1 ? losers[0] : null;
  const loserCe = loser?.cloud_equivalent;
  const loserStandIn = loser && loserCe?.stand_in ? data.models.find((m) => m.display_name === loserCe.name) ?? null : null;
  const freeModels = [...new Set(costs.filter((c) => c.cost.rented === 0).map((c) => c.row.model))];

  const body = `<article class="prose">
<h1>Is a local LLM cheaper than an API?</h1>
<p class="lede">Per token, easily. Renting a million tokens of ${esc(dm.display_name)} costs ${esc(fmtPerMtok(base.rented))}. Generating the same million on a ${esc(label)} costs ${esc(fmtPerMtok(base.generated))} of electricity${times ? `, ${fmtNum(times, 0)} times less` : ''}. The machine costs ${fmtUsd(hw.price_usd)}, which is ${esc(fmtTokens(base.breakevenTokens))} tokens of that gap, and that number is the whole argument.</p>

<div class="answer">
  <div class="answer-row"><span class="answer-k">Rent a million tokens</span><span class="answer-v">${esc(fmtPerMtok(base.rented))}, at ${esc(String(st.ratio))} input tokens for every one generated${ce.stand_in ? `, priced as ${esc(ce.name)} because nobody rents ${esc(dm.display_name)}` : ''}${ce.source_url ? ` (<a href="${esc(ce.source_url)}" rel="noopener">${esc(ce.source)}</a>, checked ${esc(ce.checked ?? '')})` : ''}</span></div>
  <div class="answer-row"><span class="answer-k">Generate the same million</span><span class="answer-v">${esc(fmtPerMtok(base.generated))} of electricity, on a <a href="/hardware/${esc(hw.id)}/">${esc(label)}</a> running it at ${fmtNum(tps, 1)} tok/s and ${hw.load_watts} W${standInPower ? `<span class="c-quant">${holdHyphens('stand-in')}</span>` : ''}</span></div>
  <div class="answer-row"><span class="answer-k">What you pay up front</span><span class="answer-v">${fmtUsd(hw.price_usd)} for the machine. Renting starts at nothing.</span></div>
  <div class="answer-row"><span class="answer-k">Where they cross</span><span class="answer-v"><b>${esc(fmtTokens(base.breakevenTokens))} tokens</b> through the machine. The same count whether that takes you a year or a lifetime.</span></div>
</div>

<p><a class="cta" href="${esc(calcLink({ hw: hw.id, model: dm.id }, data))}">Run the numbers on that pairing</a></p>

<h2>Where those two figures come from</h2>
<p>A million tokens at ${esc(String(st.ratio))}:1 is ${n(inTokens)} you send and ${n(outTokens)} the model writes back. The API bills both. At ${fmtUsd(ce.input_price_per_mtok, { cents: true })} per million in and ${fmtUsd(ce.output_price_per_mtok, { cents: true })} per million out, that is ${esc(fmtPerMtok(inBill))} for the input and ${esc(fmtPerMtok(outBill))} for the output: ${esc(fmtPerMtok(base.rented))} the million.${inBill > outBill ? ` Most of the bill is the context you send, not the answer you get.` : ''}</p>
<p>At home you pay for the electricity the machine draws while it writes those ${n(outTokens)} tokens. At ${fmtNum(tps, 1)} tok/s that is ${n(seconds)} seconds, about ${n(seconds / 60)} minutes of generation; at ${hw.load_watts} W it draws ${fmtNum(kwh, 3)} kWh; at ${fmtUsd(st.kwh, { cents: true })} per kWh that is ${esc(fmtPerMtok(base.generated))}.</p>
<p class="note">The input is counted in the million but costs no generation time here, because prompt processing runs far faster than generation. It is not free, so read the electricity figure as a floor rather than a final number.${standInPower ? ` The ${hw.load_watts} W is a stand-in: nobody has put a meter on this machine, and <a href="/hardware/${esc(hw.id)}/">its own page</a> says what the figure borrows. Double it and a million tokens still costs ${esc(fmtPerMtok(base.generated * 2))} to generate against ${esc(fmtPerMtok(base.rented))} to rent.` : ''} Electricity is at ${esc(data.defaults.electricity.country)} prices${data.defaults.electricity.source_url ? ` (<a href="${esc(data.defaults.electricity.source_url)}" rel="noopener">${esc(sourceName(data.defaults.electricity.source_url))}</a>)` : ''}.</p>

<h2>A million tokens, model by model</h2>
<p>Every model a ${esc(label)} holds at ${kctx}k context, priced both ways. The last column is what matters: how many tokens have to go through the machine before the gap has covered the ${fmtUsd(hw.price_usd)}.</p>
${stack(`<table class="board">
<thead><tr><th>Model</th><th>Rented</th><th>Generated</th><th>Cheaper by</th><th>Pays the machine back at</th></tr></thead>
<tbody>${costs.map(costRow).join('\n')}</tbody>
</table>`, { fig: 4 })}
<p class="note">${priced.length} of the ${costs.length} models here pay the machine back at some point${freeModels.length ? `. ${freeModels.map((m) => esc(m.display_name)).join(' and ')} ${freeModels.length === 1 ? 'does not, because it is' : 'do not, because they are'} listed free by the cheapest host on the date checked, and a free endpoint cannot be beaten on price` : ''}. A model nobody rents is priced as its closest hosted match and the row says so.</p>

<h2>The token count holds still. The date moves.</h2>
<p>Break-even on this site is usually a number of months, and months depend on how hard you work the machine. Counted in tokens it does not: the saving on each million is the same at any level of use, so the count that covers ${fmtUsd(hw.price_usd)} is the same too. Here is ${esc(dm.display_name)} on a ${esc(label)} at the five levels the calculator names.</p>
<table class="board compare">
<thead><tr><th>A day's use</th><th>Tokens to break even</th><th>How long that takes</th></tr></thead>
<tbody>${levelRows}</tbody>
</table>
<p>That is the case for buying, and the case against it, in one table. The machine is cheap per token and expensive to own, so the only thing that makes it pay is volume you actually have.</p>

<h2>What you use it for moves the line further than what you buy</h2>
<p>The mix matters because the two sides bill it differently. The API charges for every token you send; the machine spends its time and its watts on the tokens it writes. So work that sends a lot and writes a little is the cheapest to rent, and the slowest to justify a machine.</p>
${stack(`<table class="board">
<thead><tr><th>What you do with it</th><th>Mix</th><th>Rented</th><th>Generated</th><th>Pays the machine back at</th></tr></thead>
<tbody>${mixRows}</tbody>
</table>`, { fig: 4 })}
<p>${esc(sentenceCase(cheapestMix.use.label))} pays the machine back in ${esc(fmtTokens(cheapestMix.cost.breakevenTokens))} tokens; ${esc(lowerFirst(dearestMix.use.label))} needs ${esc(fmtTokens(dearestMix.cost.breakevenTokens))}. Buying the hardware changes less than that. Across the ${runners.length} current machines that run ${esc(dm.display_name)} at ${kctx}k, a million tokens costs between ${esc(fmtPerMtok(cheapestGen.cost.generated))} and ${esc(fmtPerMtok(dearestGen.cost.generated))} to generate. Their prices run from ${fmtUsd(Math.min(...prices))} to ${fmtUsd(Math.max(...prices))}.</p>
<p class="note">Each row is a mix the calculator offers, and the one marked default is what every other figure on this site is priced at: ${esc(data.defaults.use_cases.find((u) => u.ratio === st.ratio)?.note ?? '')}, which is why it sends the most.</p>

<h2>Where renting still wins</h2>
<p>Of the ${n(pairs)} machine-and-model pairings this site can price, electricity beats the API on ${n(wins)}. On ${n(free)} the model is listed free by the cheapest host, so there is nothing to beat. ${
    loser
      ? `The remaining ${n(beaten)} are all one model, ${esc(loser.display_name)}${
          loserCe?.stand_in
            ? `. Nobody rents it, so it is priced as ${esc(loserCe.name)}${loserStandIn?.active_params_b ? `, which moves ${fmtNum(loserStandIn.active_params_b, 1)}B parameters for every token against this one's ${fmtNum(loser.active_params_b ?? loser.params_b, 1)}B` : ''}`
            : ''
        }. It is dense, so it is slow on every machine that holds it, and the price it borrows is one a far lighter model sets.`
      : `It loses on ${n(beaten)}, across ${losers.length} models: a model that is slow on the machine holding it burns watts for longer per token, and a cheap hosted price is not far to fall.`
  }</p>
<p>Renting also wins any time you would not have used the machine. A pay-back counted in billions of tokens is not a prediction that you will reach them: at ${esc(fmtTokens(levels[1].usage))} tokens a day, ${esc(lowerFirst(levels[1].label))}, the count arrives in ${esc(fmtDuration(levels[1].days!))}, which is a long way of saying never. The reasons to buy that survive that table are the ones this arithmetic does not price: your data staying on your desk, no rate limit, no outage, and a model that still runs when the endpoint is retired.</p>

<p class="note">Every figure is ${esc(dm.display_name)} at ${esc(dm.quantisation)} unless the row names another model, at ${kctx}k context, ${esc(String(st.ratio))}:1 input to output, ${fmtUsd(st.kwh, { cents: true })} per kWh, and today's API prices held flat. Rental prices have not held flat: they have fallen steeply and repeatedly for a given level of capability${data.defaults.api_decline.source_url ? ` (<a href="${esc(data.defaults.api_decline.source_url)}" rel="noopener">Epoch AI</a>)` : ''}. The calculator can decay them ${Math.round(data.defaults.api_decline.default_rate_per_year * 100)}% a year, and switching that on pushes every count on this page out. The speed above is ${esc(drow.throughput.measurement === 'measured' ? 'measured' : 'worked out from memory bandwidth rather than measured')}, and each machine page says which of the two it has. To change any of this, <a href="${esc(calcLink({ hw: hw.id, model: dm.id }, data))}">open the calculator</a>, or see <a href="/best/">what pays back soonest at each level of use</a>.</p>
</article>`;

  return pageShell(
    {
      title: titleOf([
        'Local LLM vs API cost: what a million tokens costs',
        'Local LLM vs API cost, per million tokens',
        'Local LLM vs API cost',
      ]),
      description: descOf([
        `Renting a million tokens of ${dm.display_name} costs ${fmtPerMtok(base.rented)}; generating them costs ${fmtPerMtok(base.generated)} of electricity. The machine is ${fmtTokens(base.breakevenTokens)} tokens of that gap.`,
        `What a million tokens costs to rent against what it costs to generate at home, on ${costs.length} open models, and how many it takes to pay a machine back.`,
      ]),
      canonical: '/local-llm-vs-api-cost/',
      ogImage: TOKEN_COST_CARD,
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/local-llm-vs-api-cost/', label: 'Local vs API cost' }],
    },
    body,
    data,
  );
}

/* --------------------------------- build --------------------------------- */

write('/leaderboard/', leaderboard());
write('/best/', bestBuys());
write('/how-much-memory/', memoryPage());
write('/best-gpu/', gpuPage());
write('/local-llm-vs-api-cost/', tokenCostPage());
for (const m of data.models) write(`/models/${m.id}/`, modelPage(m));
write('/hardware/', hardwareIndex());
for (const hw of data.hardware) write(`/hardware/${hw.id}/`, hardwarePage(hw));

// comparisons: the flagship current config of each family against every other,
// the pairs `headToHeads` above already worked out and linked from both sides,
// and one index in front of them so a match-up can be found without knowing
// which two things to start from
write('/compare/', compareIndex());
for (const [a, b] of hardwarePairs(data)) write(hardwareComparePath(a, b), comparePage(a, b));

// model head-to-heads: each model against the next one down the leaderboard, which is
// the comparison someone choosing has to make, and each last-generation model against
// the current one of its family nearest it in size, which is the one someone already
// running it asks
for (const [a, b] of modelPairs(data)) write(modelComparePath(a, b), modelComparePage(a, b));

// A page's lastmod is the day its own words last changed, read out of
// seo/page-dates.json — see src/page-dates.ts for why it is not the day the
// prices were checked, and why a page whose fingerprint has moved goes into the
// sitemap without a date rather than with a guess at one.
const datesFile = new URL('../seo/page-dates.json', import.meta.url);
const recordedDates: PageDates | null = existsSync(datesFile)
  ? (JSON.parse(readFileSync(datesFile, 'utf8')) as PageDates)
  : null;
const fingerprints = [
  // the home page has no body of its own; the calculator draws it
  { path: '/', hash: fingerprint({ title: '', description: '', body: readFileSync(new URL('../index.html', import.meta.url), 'utf8') }) },
  ...meta.map((p) => ({ path: p.path, hash: fingerprint({ title: p.title, description: p.description, body: mainOf(p.html) }) })),
];
const today = new Date().toISOString().slice(0, 10);
const urls = fingerprints
  .map(({ path, hash }) => {
    const changed = publishedDate(recordedDates, path, hash);
    return `  <url><loc>${site}${path}</loc>${changed ? `<lastmod>${changed}</lastmod>` : ''}</url>`;
  })
  .join('\n');

// Built here, published at the foot of this file once every guard below has
// passed. Nothing reads these back off disk: a guard that re-opened a file the
// same script had just written would be checking the disk rather than the build,
// and it is the string about to be published that has to be right.
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`;
const nextLedger = nextDates(recordedDates, fingerprints, today);

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
 * The four head-to-heads between two configurations of one box with different chips in
 * them. The reader arrives at these from a configurator, where the two machines are one
 * line apart and the only visible difference is the memory, so the page's whole job is
 * to say what else changed — and that makes it the page with the most ways to overclaim.
 * The cores are the thing a buyer expects to pay for and the thing that moves the speeds
 * least: a token is written by reading the model out of memory, and on three of these
 * four pairs both chips read it at the same rate.
 *
 * So this holds four claims. The pair really is one box, sold on two chips, both still
 * on sale and both priced, with the cheaper side first and each side the cheapest of its
 * own chip. The page names both chips in the data's own words, and where the data counts
 * the graphics part on both sides it prints both counts and the step between them. It
 * says the dearer chip reads memory faster only where the data says it does, and where
 * both read it at the same rate it says that instead. And it hands the reader a way to
 * price the cheaper box on its own, which is the choice the page is about.
 */
function checkChipStepPairs() {
  const problems: string[] = [];
  let pages = 0;
  let equalBandwidth = 0;
  for (const [lo, hi] of chipStepPairs(data)) {
    pages++;
    const path = hardwareComparePath(lo, hi);
    const html = unesc(meta.find((m) => m.path === path)?.html ?? '');
    if (!html) {
      problems.push(`${path} is a chip-step pair with no page`);
      continue;
    }
    const cheapestOn = (h: Hardware) =>
      data.hardware
        .filter((x) => x.family === h.family && x.chip === h.chip && x.chip_variant === h.chip_variant
          && x.price_usd != null && (x.generation ?? 'current') === 'current')
        .sort((x, y) => x.price_usd! - y.price_usd! || x.id.localeCompare(y.id))[0];
    if (lo.family !== hi.family || lo.chip !== hi.chip || lo.chip_variant === hi.chip_variant)
      problems.push(`${path} is not one box sold on two chips`);
    if (lo.price_usd == null || hi.price_usd == null || lo.price_usd >= hi.price_usd)
      problems.push(`${path} does not put the cheaper configuration first, or prices one of them at nothing`);
    if ((lo.generation ?? 'current') !== 'current' || (hi.generation ?? 'current') !== 'current')
      problems.push(`${path} compares a machine that is no longer sold`);
    if (cheapestOn(lo)?.id !== lo.id || cheapestOn(hi)?.id !== hi.id)
      problems.push(`${path} is not the cheapest machine on each of the two chips`);
    for (const h of [lo, hi])
      if (!html.includes(h.chip_variant ?? ''))
        problems.push(`${path} does not name the ${shortHardwareLabel(h)}'s chip as the data writes it`);
    const cl = gpuCores(lo);
    const ch = gpuCores(hi);
    if (cl != null && ch != null && ch > cl) {
      const unit = /\bCU\b/.test(`${lo.chip_variant ?? ''}${hi.chip_variant ?? ''}`) ? 'compute units' : 'GPU cores';
      if (!html.includes(`The step adds ${ch - cl} ${unit} to the graphics part, ${ch} against ${cl}.`))
        problems.push(`${path} does not print the ${unit} the data counts on both sides`);
    }
    const bl = lo.memory_bandwidth_gbs;
    const bh = hi.memory_bandwidth_gbs;
    const wider = `The dearer chip has the wider path to memory as well, ${bh} GB/s against ${bl}.`;
    const equal = `both chips read it at ${bl} GB/s`;
    if (bl != null && bh != null && bh > bl && !html.includes(wider))
      problems.push(`${path} does not say the dearer chip reads memory faster where the data says it does`);
    if (bl != null && bh != null && bh === bl) {
      equalBandwidth++;
      if (!html.includes(equal))
        problems.push(`${path} does not say both chips read memory at the same rate`);
      if (html.includes('wider path to memory'))
        problems.push(`${path} claims a wider path to memory that the data does not give either side`);
    }
    // the page's own top has a link to the same address, so this asks for the one in
    // this section: the sentence that tells a reader to price the cheaper box first
    if (!html.includes(`<a href="${calcLink({ hw: lo.id }, data)}">Price the ${shortHardwareLabel(lo)} on its own</a>`))
      problems.push(`${path} does not offer the ${shortHardwareLabel(lo)} on its own where it asks the reader to weigh the step`);
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} chip-step head-to-head${problems.length === 1 ? '' : 's'} do not hold to the data`);
  }
  console.log(`  ${pages} head-to-heads between the two chips one box is sold on, each naming both chips as the data writes them; ${equalBandwidth} say the bigger chip reads memory no faster`);
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
  // "stand-in" carries its own hyphen, so holdHyphens() holds it to one line inside the marker
  const marker = /<span class="c-quant"><span class="nobreak">stand-in<\/span><\/span>/g;
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
 * The local-vs-API page prices a million tokens both ways and then rests everything
 * on one claim: that break-even counted in tokens is a constant, the same number at
 * every level of use. That is only true while the API price is held flat, which is
 * the calculator's default and could stop being it, and the figures either side of
 * it move whenever a rental price, a wattage or a measured speed changes.
 *
 * So this recomputes the lot: every model the machine holds, both of its prices, the
 * multiple between them, the constant itself, and the spread across the machines that
 * run the same model. A figure that has drifted out of the page stops the build.
 */
function checkTokenCost() {
  const path = '/local-llm-vs-api-cost/';
  const page = meta.find((p) => p.path === path);
  if (!page) throw new Error('no local-vs-API page was written');
  const html = unesc(page.html);
  const problems: string[] = [];
  const st = defaultState(data);
  const hw = costMachine(data);
  const costs = tokenCosts(hw, data);
  if (!costs.length) throw new Error(`${path}: the ${hardwareLabel(hw)} holds no model that can be priced`);

  // every model the machine holds, with both of the prices the page quotes for it
  for (const c of costs) {
    if (!html.includes(`/models/${c.row.model.id}/`))
      problems.push(`${path} leaves out ${c.row.model.id}, which the ${hardwareLabel(hw)} holds`);
    for (const [side, v] of [['rented', c.cost.rented], ['generated', c.cost.generated]] as const)
      if (!html.includes(`>${fmtPerMtok(v)}<`))
        problems.push(`${path} does not print ${fmtPerMtok(v)}, what a million tokens of ${c.row.model.display_name} costs ${side}`);
  }

  // the claim the page is built on: the same count of tokens at every level of use
  const view = computeView({ ...st, hw: hw.id }, data);
  const dm = view.model!;
  const levels = bestUsageLevels(data);
  const counts = levels.map((l) => computeView({ ...st, hw: hw.id, model: dm.id, usage: l.usage }, data).calc?.breakevenTokens ?? null);
  const distinct = new Set(counts.map((c) => (c == null ? 'never' : Math.round(c))));
  if (distinct.size !== 1)
    problems.push(`${path} says the break-even token count is the same at every level of use, and it is not: ${[...distinct].join(', ')}`);
  const constant = fmtTokens(counts[0]);
  const printed = (html.match(new RegExp(`${constant.replace(/\./g, '\\.')} tokens`, 'g')) ?? []).length;
  if (printed < levels.length + 1)
    problems.push(`${path} prints ${constant} tokens ${printed} times; it is the answer and every one of the ${levels.length} levels of use`);
  for (const l of levels) {
    const v = computeView({ ...st, hw: hw.id, model: dm.id, usage: l.usage }, data);
    if (!html.includes(fmtDuration(v.calc!.breakevenDays)))
      problems.push(`${path} does not print ${fmtDuration(v.calc!.breakevenDays)}, how long ${constant} tokens takes at ${fmtTokens(l.usage)} a day`);
  }

  // the headline pairing, its multiple, and the wattage the electricity rests on
  const base = tokenCost(dm, hw, rowFor(view, dm)!.throughput.tokensPerSec!, data)!;
  if (base.generated > 0 && !html.includes(`${fmtNum(base.rented / base.generated, 0)} times less`))
    problems.push(`${path} does not say renting ${dm.display_name} costs ${fmtNum(base.rented / base.generated, 0)} times what generating it does`);
  if (hw.load_watts_status === 'stand_in' && !page.html.includes(`${hw.load_watts} W<span class="c-quant">${holdHyphens('stand-in')}</span>`))
    problems.push(`${path} prices the electricity on ${hw.load_watts} W without saying that figure is a stand-in`);

  // every mix the calculator offers, priced on the same pairing
  for (const u of data.defaults.use_cases) {
    const c = tokenCost(dm, hw, rowFor(view, dm)!.throughput.tokensPerSec!, data, u.ratio)!;
    if (!html.includes(u.label)) problems.push(`${path} leaves out the ${u.label} mix`);
    if (c.breakevenTokens != null && !html.includes(`${fmtTokens(c.breakevenTokens)} tokens`))
      problems.push(`${path} does not print ${fmtTokens(c.breakevenTokens)} tokens, what ${u.label} takes to pay the machine back`);
  }

  // the spread across the machines that run the same model, which the page sets
  // against the spread in their prices
  const runners = data.hardware
    .filter((h) => h.price_usd != null && (h.generation ?? 'current') === 'current')
    .map((h) => {
      const v = computeView({ ...st, hw: h.id, model: dm.id }, data);
      const r = rowFor(v, dm);
      return v.model?.id === dm.id && r?.throughput.tokensPerSec != null ? tokenCost(dm, h, r.throughput.tokensPerSec, data) : null;
    })
    .filter((c): c is TokenCost => !!c);
  const gen = runners.map((c) => c.generated);
  for (const v of [Math.min(...gen), Math.max(...gen)])
    if (!html.includes(fmtPerMtok(v)))
      problems.push(`${path} does not print ${fmtPerMtok(v)}, an end of what a million tokens costs to generate across the ${runners.length} machines that run ${dm.display_name}`);

  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 6).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} figure${problems.length === 1 ? '' : 's'} on ${path} no longer match the data`);
  }
  console.log(
    `  ${path} prices ${costs.length} models both ways on the ${hardwareLabel(hw)}, and ${constant} tokens pays it back at all ${levels.length} levels of use`,
  );
}

/**
/**
 * Two ways a page can print a note out of the data and have it stop reading as
 * the page's own sentence, both of which shipped for weeks.
 *
 * The first: capability_note opens with a line about this site's own ratings on
 * 36 of the 55 models, and the lede printed the whole field. So 36 model pages
 * opened "Not yet rated: released after our last ratings pass" — the site's
 * process, in the paragraph a search result shows — and on 31 of them the next
 * section printed a score from the intelligence index. Qwen3.8 27B, the best
 * model on this site that a graphics card runs, said it was unrated and then
 * scored 34. splitCapabilityNote() puts the description in the lede and the
 * ratings line under the five ratings it is about.
 *
 * The second: the architecture notes end in a full stop, and the KV cache line
 * added another, so 41 model pages printed "on all 80 layers..". endStop()
 * settles that one, and the doubled stop is checked across every page rather
 * than that line, because any note pasted in front of a template's punctuation
 * can do it.
 */
function checkNotes() {
  const problems: string[] = [];
  let moved = 0;
  for (const m of data.models) {
    const html = meta.find((x) => x.path === `/models/${m.id}/`)?.html;
    if (html == null) continue;
    const { ratings, about } = splitCapabilityNote(m.capability_note);
    const unrated = CAPABILITY_KEYS.every((k) => m.capabilities[k] === 'unknown');
    // A model with nothing rated has to say so in words the split knows, or the
    // sentence lands back in the lede without anyone seeing it happen.
    if (unrated && !ratings) problems.push(`${m.id} has no capability rated and no line the split recognises: "${m.capability_note}"`);
    if (!unrated && ratings) problems.push(`${m.id} carries a line about missing ratings and has ${CAPABILITY_KEYS.filter((k) => m.capabilities[k] !== 'unknown').length} of them`);
    const lede = unesc(html.match(/<p class="lede">([\s\S]*?)<\/p>/)?.[1] ?? '');
    if (!lede) problems.push(`/models/${m.id}/ has no lede`);
    if (ratings && lede.includes(ratings)) problems.push(`/models/${m.id}/ opens with the line about its ratings`);
    if (about && !lede.includes(about)) problems.push(`/models/${m.id}/ drops what its note says about the model`);
    if (!ratings) continue;
    moved++;
    // under the five ratings, which is the blank it explains, and nowhere else
    const under = unesc(html.match(/<ul class="caps">[\s\S]*?<\/ul>\s*<p class="note">([\s\S]*?)<\/p>/)?.[1] ?? '');
    if (under !== ratings) problems.push(`/models/${m.id}/ does not print the line about its ratings under them`);
    if (unesc(html).split(ratings).length !== 2) problems.push(`/models/${m.id}/ prints the line about its ratings ${unesc(html).split(ratings).length - 1} times`);
  }
  const doubled = meta.filter((p) => /\.\.(?!\.)/.test(unesc((p.html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '').replace(/<[^>]+>/g, ' '))));
  for (const p of doubled.slice(0, 3)) problems.push(`${p.path} prints a doubled full stop`);
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} page${problems.length === 1 ? '' : 's'} print a note from the data where it does not belong`);
  }
  console.log(`  ${moved} model pages open with what their note says about the model and put the line about the five ratings under them; no page of the ${meta.length} prints a doubled full stop`);
}

/**
 * The machine pages' half of the same fault. hw.notes is the field a machine
 * records everything in, and all of it printed under "Usable by the GPU": the
 * seven graphics cards opened their memory note with the working behind the
 * bandwidth figure in the row above, which printed bare, and ten laptops
 * explained there that sustained speed falls once the fans cap out.
 *
 * splitHardwareNote() sends each sentence to the figure it is about. This holds
 * the result to four things, because a router that drops a sentence, prints it
 * twice, or parks it under a row the page does not print is the kind of fault
 * that reads as finished on every page but the one it ruins.
 */
function checkHardwareNotes() {
  const problems: string[] = [];
  const moved = { bandwidth: 0, speed: 0, availability: 0 };
  for (const hw of data.hardware) {
    const html = meta.find((x) => x.path === `/hardware/${hw.id}/`)?.html;
    if (html == null || !hw.notes) continue;
    const page = unesc(html);
    const sentences = noteSentences(hw.notes);
    // Splitting is a seam, not an edit: the sentences joined back up are the note.
    if (sentences.join(' ') !== hw.notes.trim()) problems.push(`${hw.id}'s note does not come back whole when its sentences are joined`);
    const note = splitHardwareNote(hw.notes);
    const rows: [keyof typeof note, string, string | null][] = [
      ['memory', 'Usable by the GPU', dd(page, 'Usable by the GPU')],
      ['bandwidth', 'Memory bandwidth', dd(page, 'Memory bandwidth')],
      ['availability', 'Availability', dd(page, 'Availability')],
      ['speed', 'the note under the speed column', speedNotes(page)],
    ];
    for (const [key, where, holder] of rows) {
      const text = note[key];
      if (!text) continue;
      if (key !== 'memory') moved[key as 'bandwidth' | 'speed' | 'availability']++;
      // Somewhere on the page, exactly once.
      const seen = page.split(text).length - 1;
      if (seen !== 1) problems.push(`/hardware/${hw.id}/ prints "${text.slice(0, 40)}…" ${seen} times`);
      // And that somewhere is the figure it is about.
      if (holder == null) problems.push(`/hardware/${hw.id}/ has a note about ${where} and no ${where} to print it under`);
      else if (!holder.includes(text)) problems.push(`/hardware/${hw.id}/ does not print its ${key} note under ${where}`);
    }
    // Read from the other end, with markers the router does not use: whatever is
    // left under the memory figure is about memory.
    const under = dd(page, 'Usable by the GPU') ?? '';
    for (const [subject, marker] of [['bandwidth', /\bGbps\b|\bbus ÷\b/], ['speed', /\btokens\/sec\b|\bfans cap out\b/]] as const)
      if (marker.test(under)) problems.push(`/hardware/${hw.id}/ still explains ${subject} under the memory figure`);
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} machine note${problems.length === 1 ? '' : 's'} print under the wrong figure`);
  }
  console.log(`  ${moved.bandwidth} machine pages explain their bandwidth figure under it, ${moved.speed} put the caveat about speed beside the speed column and ${moved.availability} say under Availability which machine this is`);
}

/** The text of one row of a machine page's specifics list. */
function dd(page: string, label: string): string | null {
  return page.match(new RegExp(`<dt>${label}</dt><dd>([\\s\\S]*?)</dd>`))?.[1] ?? null;
}

/** The notes under the machine's own "What it runs" table, where the speed column is. */
function speedNotes(page: string): string | null {
  const after = page.split(/<h2\b[^>]*>What the [^<]+ runs<\/h2>/)[1]?.split('<h2')[0];
  return after == null ? null : [...after.matchAll(/<p class="note">([\s\S]*?)<\/p>/g)].map((m) => m[1]).join(' ');
}

/**
 * The small label beside a name inside a table — the tier a model sits in, the
 * word that says a machine is discontinued — is a phrase as often as a word, and
 * the two want opposite things on a phone. A phrase held to one line runs past
 * the name it belongs to and under the figure in the track beside it: "Below
 * every hosted tier" is 145px of it, against a name track with a 115px floor.
 * A single word broken mid-way reads as a typo, because the tier names carry
 * their own hyphen — "Haiku-class" split across two lines looks like a mistake
 * in the data rather than in the layout.
 *
 * tierLabel() settles both: a phrase goes in bare and wraps between its words,
 * a word goes in wrapped in .nobreak and holds its line. A table that prints
 * the bare tier name instead gets the wrapping right and the hyphen wrong, and
 * that is a slip nothing else would catch, because the page still reads
 * correctly on every screen wide enough to hold the label.
 */
function checkTierLabels() {
  const tiers = data.defaults.frontier_tiers.map((t) => t.label);
  const oneWord = new Set(tiers.filter((t) => !t.includes(' ')));
  const phrases = new Set(tiers.filter((t) => t.includes(' ')));
  const bare: string[] = [];
  let held = 0;
  let wrapping = 0;
  for (const p of meta) {
    for (const m of p.html.matchAll(/<span class="c-quant">([\s\S]*?)<\/span>/g)) {
      const text = unesc(m[1].replace(/<[^>]*>/g, '')).trim();
      if (oneWord.has(text)) {
        if (/class="nobreak"/.test(m[1])) held++;
        else bare.push(`${p.path} prints ${text} beside a name where a narrow column can break it at its own hyphen`);
      } else if (phrases.has(text)) {
        if (/class="nobreak"/.test(m[1])) bare.push(`${p.path} holds ${text} to one line, which on a phone runs it under the figure beside it`);
        else wrapping++;
      }
    }
  }
  if (bare.length) {
    console.error([...new Set(bare)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${bare.length} tier label${bare.length === 1 ? '' : 's'} beside a name would break the wrong way on a phone`);
  }
  console.log(`  ${held + wrapping} tier labels sit beside a name in a table: ${held} hold their line, ${wrapping} wrap between their words`);
}

/**
 * The same rule, for every other marker beside a figure. A marker is prose and
 * wraps between its words wherever a column is narrow: a phone stacks the row
 * and a tablet-width window wraps every cell, and both have been squeezing these
 * since the table stopped scrolling sideways. A word carrying its own hyphen is
 * the exception — "UD-Q4_K_M" broken after the UD, or a price standing in for
 * "GLM-4.7-Flash" broken after the 4.7, reads as a mistake in the data rather
 * than one in the layout, and five of them were doing exactly that on a phone
 * before holdHyphens() existed.
 *
 * So: no marker may print a hyphenated word bare. The name a figure is qualified
 * by comes out of data/*.json, so a new model or a new engine can bring one in at
 * any time, which is why this is a build guard rather than a one-off sweep.
 *
 * The hold is markup; page.css decides where it applies. It gives way in one
 * layout, the three columns a head-to-head splits a phone screen into, because a
 * cell there is about 95px and a name held whole would push the table and the page
 * past the right edge. A name broken in the wrong place is the lesser fault.
 */
/** The contents of every marker beside a figure, nested spans and all. */
function markerBodies(html: string): string[] {
  const out: string[] = [];
  const open = '<span class="c-quant">';
  for (let i = html.indexOf(open); i !== -1; i = html.indexOf(open, i + 1)) {
    let depth = 1;
    let j = i + open.length;
    const start = j;
    while (depth > 0 && j < html.length) {
      const next = html.indexOf('<span', j);
      const close = html.indexOf('</span>', j);
      if (close === -1) break;
      if (next !== -1 && next < close) {
        depth++;
        j = next + 5;
      } else {
        depth--;
        if (depth === 0) out.push(html.slice(start, close));
        j = close + 7;
      }
    }
  }
  return out;
}

function checkMarkerWords() {
  const hyphenated = /[^\s-]-[^\s-]/;
  const loose: string[] = [];
  let held = 0;
  for (const p of meta) {
    for (const inner of markerBodies(p.html)) {
      const free = unesc(inner.replace(/<span class="nobreak">[\s\S]*?<\/span>/g, ' ').replace(/<[^>]*>/g, ''));
      const bad = free.split(/\s+/).filter((w) => hyphenated.test(w));
      if (bad.length) loose.push(`${p.path} prints ${bad[0]} beside a figure where a narrow column can break it at its own hyphen`);
      else if (/class="nobreak"/.test(inner)) held++;
    }
  }
  if (loose.length) {
    console.error([...new Set(loose)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${loose.length} marker${loose.length === 1 ? '' : 's'} beside a figure would break a word at its own hyphen`);
  }
  console.log(`  ${held} markers beside a figure keep a hyphenated word whole wherever the layout allows it; the phrase around it wraps`);
}

/**
 * The graphics-card page answers a buying question with three claims that the data
 * can move underneath it: which cards there are, how many models each one holds,
 * and which card is the cheapest that reaches the best model any of them reach.
 * The last is the page's own answer, and it is the one a new card or a new model
 * would quietly falsify — the sentence would still read well and would be wrong.
 *
 * So this recomputes all three from the data and holds the page to them. It also
 * holds the page to the rule every table on the site follows: a machine that is not
 * a graphics card does not belong in a list of graphics cards, however close its
 * price, and a count printed here has to be the count that machine's own page prints.
 */
function checkBestGpu() {
  const page = meta.find((p) => p.path === '/best-gpu/');
  if (!page) throw new Error('/best-gpu/ was not written');
  const html = unesc(page.html);
  const cards = graphicsCards(data);
  const problems: string[] = [];

  // the side-by-side table is the page's list of cards: every card in it, nothing else
  const table = html.split(anchoredHeading('Every card here, side by side'))[1]?.split('<h2')[0] ?? '';
  const listed = new Set([...table.matchAll(/\/hardware\/([a-z0-9.-]+)\//g)].map((m) => m[1]));
  for (const c of cards) if (!listed.has(c.id)) problems.push(`the table of cards leaves out the ${shortHardwareLabel(c)}`);
  for (const id of listed)
    if (!cards.some((c) => c.id === id))
      problems.push(`the table of cards lists ${id}, which is not priced as a card`);

  // every count of what a card holds is the count its own page gives
  for (const c of cards) {
    const mine = fitsOn(c).length;
    const row = table.split(`/hardware/${c.id}/`)[1]?.split('</tr>')[0] ?? '';
    if (!row.includes(`<b>${mine}</b>`))
      problems.push(`the row for the ${shortHardwareLabel(c)} does not print the ${mine} models its own page counts`);
  }

  // the answer in the lede: the best model any card holds, and the cheapest card that holds it
  const held = new Set(cards.flatMap((c) => fitsOn(c).map((r) => r.model.id)));
  const ceiling = currentModels
    .filter((m) => m.frontier_equivalent?.score != null)
    .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!)
    .find((m) => held.has(m.id));
  if (ceiling) {
    const cheapest = cards
      .filter((c) => fitsOn(c).some((r) => r.model.id === ceiling.id))
      .sort((a, b) => a.price_usd! - b.price_usd!)[0];
    const lede = html.split('<p class="lede">')[1]?.split('</p>')[0] ?? '';
    if (!lede.includes(ceiling.display_name))
      problems.push(`the lede does not name ${ceiling.display_name}, the best model any card holds`);
    if (cheapest && !lede.includes(shortHardwareLabel(cheapest)))
      problems.push(`the lede does not name the ${shortHardwareLabel(cheapest)}, the cheapest card that holds it`);
    // and it must not be read as the best card: a dearer one holds more
    const dearer = cards.filter((c) => c.price_usd! > (cheapest?.price_usd ?? 0) && fitsOn(c).length > fitsOn(cheapest!).length);
    if (dearer.length && !/does not run a better one/.test(lede))
      problems.push('the lede names the cheapest card without saying what the dearer ones buy');
  }

  // pay-back is priced at every level the calculator names, or not at all
  const pay = html.split(anchoredHeading('How much use it takes for a card to pay for itself'))[1]?.split('<h2')[0] ?? '';
  const levels = bestUsageLevels(data);
  const payRows = (pay.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr>/g) ?? []).length;
  if (payRows !== cards.length) problems.push(`pay-back is priced for ${payRows} cards, not ${cards.length}`);
  for (const l of levels)
    if (!pay.includes(`${fmtTokens(l.usage)} a day`)) problems.push(`pay-back skips ${fmtTokens(l.usage)} tokens a day`);
  if (/its ceiling/.test(pay) && !/at most/.test(pay))
    problems.push('pay-back marks a figure as a ceiling without saying what the ceiling is');

  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} claim${problems.length === 1 ? '' : 's'} on /best-gpu/ do not match the data`);
  }
  console.log(
    `  /best-gpu/ ranks ${cards.length} graphics cards on what each holds, prices pay-back at ${levels.length} levels, and names ${
      ceiling ? ceiling.display_name : 'no model'
    } as the best model any of them runs`,
  );
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

/**
 * Where the machine index is linked from, and where it is not. `/hardware/`
 * prices all 56 machines in one table and is the page a reader wants after
 * being told how many of them hold their model — and until this guard existed
 * it was reachable from none of the 261 pages inside their own body. Only the
 * footer carried it, which every page carries and no page earns.
 *
 * Three claims. A model page whose reach line counts the machines links the
 * index exactly once and in that sentence, so the count and the place it leads
 * cannot come apart. A model page with no reach line has counted nothing and
 * links it not at all. And the two indexes that offer the reader somewhere else
 * to start each name it once, while no other page on the site does — so the
 * rule stays the rule rather than spreading into every table with a price in it.
 */
function checkMachineIndex() {
  const problems: string[] = [];
  const want = machineIndexLine();
  const ctx = data.defaults.context.default_tokens;
  const ledes = ['/leaderboard/', '/compare/'];
  const links = (path: string) => {
    const html = meta.find((m) => m.path === path)?.html;
    if (html == null) return null;
    const body = mainOf(html);
    return { n: (body.match(/href="\/hardware\/"/g) ?? []).length, body };
  };

  let said = 0;
  const expected = new Set<string>(ledes);
  for (const m of data.models) {
    const path = `/models/${m.id}/`;
    // the page says this only where it has a table to say it under, and the
    // table counts the machines you can buy where the reach line counts all of
    // them — so a model held by an unpriced machine alone gets neither
    const counts = cheapestPerFamily(runnersFor(m, data, { ctx })).length > 0 && familyReach(m, data, ctx).length > 0;
    const got = links(path);
    if (got == null) {
      problems.push(`${path} was not written`);
      continue;
    }
    if (!counts) {
      if (got.n) problems.push(`${path} counts no machines and sends the reader to the machine index anyway`);
      continue;
    }
    expected.add(path);
    if (got.n !== 1) problems.push(`${path} counts the machines that hold it and links the index ${got.n} times rather than once`);
    if (!got.body.includes(want)) problems.push(`${path} counts the machines that hold it and does not say where they are all priced`);
    else said++;
  }
  for (const path of ledes) {
    const got = links(path);
    if (got == null || got.n !== 1) problems.push(`${path} offers the reader somewhere else to start and links the machine index ${got?.n ?? 0} times rather than once`);
    else said++;
  }
  for (const m of meta) {
    if (expected.has(m.path)) continue;
    const n = (mainOf(m.html).match(/href="\/hardware\/"/g) ?? []).length;
    if (n) problems.push(`${m.path} links the machine index ${n} times and is not one of the pages the rule covers`);
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} page${problems.length === 1 ? ' has' : 's have'} the link to the machine index wrong`);
  }
  console.log(`  ${said} pages send the reader to all ${data.hardware.length} machines priced in one table, and only those link it`);
}

/**
 * `/best-gpu/` ranks the graphics cards, and it answers the most commercial
 * question this site takes: which card to buy. It was also the least linked
 * page on the site. Measured on 2026-09-19 across the 259 generated pages, the
 * body of `/leaderboard/` had 200 pages pointing at it, `/compare/` 199,
 * `/best/` 146 and `/how-much-memory/` 113 — and `/best-gpu/` had eight: one
 * index and the seven cards' own pages. It is in the footer of every page, so
 * nothing was orphaned; what was missing is the link a reader would follow
 * where the question comes up.
 *
 * The rule is the caveat the site already says. Wherever a page prices a card
 * in a table of machines it says the price leaves out the PC around it, and
 * that sentence now ends with where the cards are ranked, so a page cannot say
 * the one without the other. A card's own page is the exception and says so in
 * its opening paragraph instead, which is why nothing links the ranking twice.
 *
 * This holds three things: every page that prices a card links the ranking once,
 * no page that prices none links it at all, and each of the three indexes whose
 * assumptions raise a card price carries it too.
 */
function checkCardRanking() {
  const problems: string[] = [];
  const want = cardRankingLine(data);
  const links = (path: string) => {
    const html = meta.find((m) => m.path === path)?.html;
    if (html == null) return null;
    const body = mainOf(html);
    // the ranking is one page whether the link lands on it or on its table
    return { n: (body.match(/href="\/best-gpu\/(?:#[^"]*)?"/g) ?? []).length, body };
  };
  const check = (path: string, prices: boolean, inNote: boolean) => {
    const got = links(path);
    if (got == null) {
      problems.push(`${path} was not written`);
      return 0;
    }
    if (!prices) {
      if (got.n) problems.push(`${path} sends the reader to the card ranking where it prices no card`);
      return 0;
    }
    if (got.n !== 1) problems.push(`${path} prices a graphics card and links the ranking ${got.n} times rather than once`);
    if (inNote && !got.body.includes(want)) problems.push(`${path} prices a graphics card and does not say where the cards are ranked`);
    if (!inNote && got.body.includes(want)) problems.push(`${path} is a card's own page and repeats in its notes what its first paragraph says`);
    return 1;
  };

  let said = 0;
  for (const [a, b] of hardwarePairs(data)) said += check(hardwareComparePath(a, b), !!cardScopeNote([a, b]), true);
  for (const h of data.hardware) {
    const rows = [...familyRange(h, data), ...priceRivals(h, data)];
    if (!rows.length) continue;
    said += check(`/hardware/${h.id}/`, !!cardScopeNote(rows), h.price_scope !== 'card_only');
  }
  for (const path of ['/best/', '/compare/', '/how-much-memory/', '/hardware/']) {
    const got = links(path);
    if (got == null || got.n !== 1) problems.push(`${path} raises what a card price leaves out and links the ranking ${got?.n ?? 0} times rather than once`);
    else said++;
  }
  const own = links('/best-gpu/');
  if (own && own.n) problems.push(`/best-gpu/ links itself ${own.n} times in its own body`);
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} page${problems.length === 1 ? ' has' : 's have'} the link to the card ranking wrong`);
  }
  console.log(`  ${said} pages that price a graphics card say where all ${graphicsCards(data).length} of them are ranked, and only those link it`);
}

/**
 * A link's text is one of the few things on a page that says what is on the other
 * end, to a reader deciding whether to click and to a crawler deciding what the
 * link is worth. "source 1" says neither, and 56 machine pages and 55 model pages
 * ended in a row of them.
 *
 * Two claims. No link anywhere on the site is named after nothing — a number, the
 * word source, here, this. And every link in a Sources line is named after whoever
 * publishes it, worked out from the URL here rather than read off the page, so a
 * machine added tomorrow with a host nobody has seen still gets its own domain
 * rather than a number.
 *
 * What it cannot hold is whether a name is the right one: it reads the page with
 * the same function that wrote it, so a wrong entry in the publisher list would
 * pass here and be wrong on 56 pages. That claim is one the build cannot make
 * about itself, so tests/pagekit.test.ts names hosts and expects names.
 */
function checkSourceLinks() {
  const saysNothing = /^(sources?|sources? \d+|here|this|link|read more|click here)\.?$/i;
  const bad: string[] = [];
  let named = 0;
  let disambiguated = 0;
  for (const p of meta) {
    const body = p.html.split('<body')[1] ?? '';
    for (const m of body.matchAll(/<a [^>]*>([\s\S]*?)<\/a>/g)) {
      const text = unesc(m[1].replace(/<[^>]*>/g, '')).trim();
      if (saysNothing.test(text)) bad.push(`${p.path} has a link named "${text}"`);
    }
    for (const list of body.matchAll(/<dt>Sources<\/dt><dd>([\s\S]*?)<\/dd>/g)) {
      for (const m of list[1].matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
        const url = unesc(m[1]);
        const text = unesc(m[2]);
        const publisher = sourceName(url);
        if (text === publisher) named++;
        else if (text.startsWith(`${publisher} (`) && text.endsWith(')')) disambiguated++;
        else bad.push(`${p.path} names ${url} "${text}" where ${publisher} publishes it`);
      }
    }
  }
  if (bad.length) {
    console.error([...new Set(bad)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${bad.length} link${bad.length === 1 ? '' : 's'} do not say what is on the other end`);
  }
  console.log(
    `  ${named + disambiguated} source links name who publishes them, ${disambiguated} of them saying which page of that publisher's it is`,
  );
}

/**
 * The sitemap's dates are a claim to a crawler, and a claim it stops reading once it
 * catches one out. So: every date is a real day, none of them is in the future, no URL
 * carries two, and a page only carries a date where seo/page-dates.json still recognises
 * its content. The last is the one worth a build failing over — a date left behind by a
 * page that has since changed is exactly the wrong signal, and it is the fault that
 * cannot be seen by reading the sitemap.
 */
function checkPageDates() {
  const problems: string[] = [];
  const entries = [...sitemapXml.matchAll(/<url><loc>([^<]+)<\/loc>(.*?)<\/url>/g)];
  const byPath = new Map(fingerprints.map((f) => [site + f.path, f.hash]));
  let dated = 0;
  for (const [, url, rest] of entries) {
    const stamps = [...rest.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].map((m) => m[1]);
    if (stamps.length > 1) problems.push(`${url} carries ${stamps.length} dates`);
    if (!stamps.length) continue;
    dated++;
    const at = stamps[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(at)) problems.push(`${url} is dated "${at}", which is not a day`);
    else if (at > today) problems.push(`${url} is dated ${at}, which has not happened yet`);
    const hash = byPath.get(url);
    const was = recordedDates?.pages?.[url.slice(site.length)];
    if (!hash || !was || was.hash !== hash) problems.push(`${url} is dated ${at} but its content is not the content that date was recorded for`);
    else if (was.changed !== at) problems.push(`${url} is dated ${at} where the record says ${was.changed}`);
  }
  // a record that cannot be read is dropped silently by publishedDate, and something
  // dropped silently is something nobody fixes, so say it here instead
  for (const [path, was] of Object.entries(recordedDates?.pages ?? {})) {
    if (was.changed !== null && !/^\d{4}-\d{2}-\d{2}$/.test(was.changed)) problems.push(`${path} is recorded as changing "${was.changed}", which is not a day`);
  }
  if (problems.length) {
    console.error(problems.slice(0, 20).map((p) => `  ${p}`).join('\n'));
    throw new Error(`${problems.length} sitemap dates are wrong or cannot be read`);
  }
  // two different reasons a page has no date, and only one of them is a fault to fix
  const waiting = fingerprints.filter((f) => recordedDates?.pages?.[f.path]?.hash === f.hash && !recordedDates.pages[f.path].changed).length;
  const stale = entries.length - dated - waiting;
  const why = [
    waiting ? `${waiting} have not changed since the record began and take a date when they do` : '',
    stale ? `${stale} changed since the record was last written and go out without one` : '',
  ].filter(Boolean);
  console.log(
    `  ${dated} of ${entries.length} sitemap entries carry the day that page's own words last changed` +
      (why.length ? `; ${why.join(', ')}` : ''),
  );
}

/**
 * A machine page's first paragraph is the sentence a search engine quotes and
 * the first thing a reader gets, and it used to answer one question only: how
 * much memory this machine has and what fits in it. Memory is the one figure
 * two machines thousands of dollars apart can share, so the paragraph was
 * character-identical to another page's on 50 of the 56, ten of them opening
 * with the same words. What separates them is price and pay-back, and both
 * were already on the page, in the answer block and in the description a
 * search engine prints, but not in the paragraph above either.
 *
 * Three claims: every machine page opens with a paragraph, a machine whose
 * pay-back can be computed names that pay-back and its own price in it, and no
 * two machines open with the same words.
 */
function checkMachineLedes() {
  const problems: string[] = [];
  const seen = new Map<string, string>();
  let priced = 0;
  for (const hw of data.hardware) {
    const path = `/hardware/${hw.id}/`;
    if (!paths.includes(path)) continue;
    const lede = (meta.find((m) => m.path === path)?.html ?? '').match(/<p class="lede">([\s\S]*?)<\/p>/)?.[1];
    if (lede == null) {
      problems.push(`the ${shortHardwareLabel(hw)} page opens with no paragraph`);
      continue;
    }
    const view = hwViews.get(hw.id)!;
    if (view.calc && hw.price_usd != null) {
      priced += 1;
      const verdict = lowerFirst(verdictLine(view));
      if (!lede.includes(verdict))
        problems.push(`the ${shortHardwareLabel(hw)} opens without the pay-back its own answer block prints, "${verdict}"`);
      if (!lede.includes(fmtUsd(hw.price_usd)))
        problems.push(`the ${shortHardwareLabel(hw)} opens without its own price, ${fmtUsd(hw.price_usd)}`);
    }
    const twin = seen.get(lede);
    if (twin) problems.push(`the ${shortHardwareLabel(hw)} opens with the same paragraph as the ${twin}`);
    else seen.set(lede, shortHardwareLabel(hw));
  }
  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} machine page${problems.length === 1 ? '' : 's'} do not open with an answer of their own`);
  }
  console.log(`  ${seen.size} machine pages open with a paragraph no other machine repeats, ${priced} of them naming that machine's own price and pay-back`);
}

/**
 * No speed on this site prints bare. Of the 1,425 pairs where a machine here
 * holds a model and has a speed for it, 1,397 are worked out from memory
 * bandwidth rather than timed, so a figure with no word beside it reads as a
 * measurement almost every time it is not one. The machine pages printed 661 of
 * them that way until this guard was written, and a machine page is where a
 * reader lands: /hardware/ marked all 56 of its own, the head-to-heads marked
 * theirs, and the pages in between said nothing.
 */
function checkSpeedBasis() {
  const problems: string[] = [];
  let cells = 0;
  let answers = 0;
  let notes = 0;
  for (const p of meta) {
    for (const m of p.html.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)) {
      if (!m[1].includes('tok/s')) continue;
      cells += 1;
      if (!/\b(measured|estimated)\b/.test(m[1]))
        problems.push(`${p.path} prints a speed in a table without saying whether anybody measured it`);
    }
    // The answer block is the machine's own headline figure and the model page's
    // fastest machine. Everywhere else a speed sits in prose that says its basis
    // in its own words, which no pattern should try to police.
    if (!p.path.startsWith('/hardware/') && !p.path.startsWith('/models/')) continue;
    for (const m of p.html.matchAll(/<div class="answer-row">([\s\S]*?)<\/div>/g)) {
      if (!m[1].includes('tok/s')) continue;
      answers += 1;
      if (!/\b(measured|estimated)\b/.test(m[1]))
        problems.push(`${p.path} answers with a speed without saying whether anybody measured it`);
    }
  }
  // A mark only means something where the page says what it means.
  for (const hw of data.hardware) {
    const path = `/hardware/${hw.id}/`;
    const html = meta.find((m) => m.path === path)?.html;
    if (html == null || !html.includes(anchoredHeading(runsHeading(hw)))) continue;
    if (!(speedNotes(html) ?? '').includes('Each speed says how it was arrived at')) {
      problems.push(`the ${shortHardwareLabel(hw)} page marks its speeds and never says what the mark means`);
      continue;
    }
    notes += 1;
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} speed${problems.length === 1 ? '' : 's'} print without saying how they were arrived at`);
  }
  console.log(`  ${cells} speeds in tables and ${answers} in answer blocks say whether they were measured or estimated; ${notes} machine pages say what the mark means`);
}

/**
 * The pairs cut by price rather than by hardware. Recut from the rule rather than read
 * off the list the pages were built from: a pair that is no longer anybody's nearest
 * price, or that has drifted past a tenth as a price in data/*.json changes, should fail
 * the build rather than keep a page that says two machines cost the same money.
 *
 * It also holds the other side of it, which is the one a template gets wrong: no page
 * that is not such a pair may carry the section, and where one side is a graphics card
 * the section has to say that its price is the card alone, because the whole claim the
 * heading makes is that the two prices are the same money.
 */
function checkPriceNeighbours() {
  const problems: string[] = [];
  const heading = anchoredHeading('The same money, two different machines');
  const sold = data.hardware.filter((h) => h.price_usd != null && (h.generation ?? 'current') === 'current');
  const nearest = (h: Hardware) =>
    sold
      .filter((o) => o.family !== h.family)
      .sort(
        (x, y) =>
          Math.abs(x.price_usd! - h.price_usd!) - Math.abs(y.price_usd! - h.price_usd!) ||
          x.id.localeCompare(y.id),
      )[0];

  let pages = 0;
  let cards = 0;
  const wanted = new Set<string>();
  for (const [lo, hi] of priceNeighbourPairs(data)) {
    pages++;
    const path = hardwareComparePath(lo, hi);
    wanted.add(path);
    const html = unesc(meta.find((m) => m.path === path)?.html ?? '');
    if (!html) {
      problems.push(`${path} is a price-neighbour pair with no page`);
      continue;
    }
    if (lo.family === hi.family) problems.push(`${path} sets two machines of one family against each other`);
    if ((lo.generation ?? 'current') !== 'current' || (hi.generation ?? 'current') !== 'current')
      problems.push(`${path} compares a machine that is no longer sold`);
    if (lo.price_usd == null || hi.price_usd == null || lo.price_usd > hi.price_usd)
      problems.push(`${path} does not put the cheaper machine first, or prices one of them at nothing`);
    const spread = Math.abs(hi.price_usd! - lo.price_usd!) / Math.min(hi.price_usd!, lo.price_usd!);
    if (spread > PRICE_NEIGHBOUR_GAP)
      problems.push(`${path} is ${Math.round(spread * 100)}% apart in price, past the ${Math.round(PRICE_NEIGHBOUR_GAP * 100)}% this rule allows`);
    if (nearest(lo)?.id !== hi.id && nearest(hi)?.id !== lo.id)
      problems.push(`${path} is neither machine's nearest price outside its own family`);
    if (!html.includes(heading)) {
      problems.push(`${path} costs the same money either way and does not say so`);
      continue;
    }
    const section = html.slice(html.indexOf(heading), html.indexOf('</p>', html.indexOf(heading)));
    for (const h of [lo, hi])
      if (!section.includes(fmtUsd(h.price_usd!, { cents: false })))
        problems.push(`${path} does not print the ${shortHardwareLabel(h)}'s price where it says the two are the same money`);
    const card = [lo, hi].filter((h) => h.price_scope === 'card_only');
    if (card.length) {
      cards++;
      if (!/card only|card alone/.test(section))
        problems.push(`${path} calls a card's price the same money as a whole computer without saying what it buys`);
    }
  }
  for (const m of meta)
    if (m.html.includes(heading) && !wanted.has(m.path))
      problems.push(`${m.path} says two machines cost the same money and is not a pair the rule cut`);

  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} price-neighbour head-to-head${problems.length === 1 ? '' : 's'} do not hold to the rule that cut them`);
  }
  console.log(`  ${pages} head-to-heads between machines of different families within ${Math.round(PRICE_NEIGHBOUR_GAP * 100)}% of each other in price, ${cards} of them pricing a card against a whole computer`);
}

/**
 * The model side of the same thing, and it is cut from the memory a model needs rather
 * than from the money a machine costs. A pair that is no longer two models of different
 * families, or that has drifted past a tenth as a figure in data/*.json changes, should
 * fail the build rather than keep a page whose whole reason is that the two ask a machine
 * for the same thing.
 *
 * It holds the other direction too: no page may say two models need much the same memory
 * unless it links a pair this rule cut, and every one of these pages has to print what
 * each model needs, because that figure is the claim.
 */
function checkMemoryNeighbours() {
  const problems: string[] = [];
  const ctx = data.defaults.context.default_tokens;
  const kvScale = kvScaleFor(data.defaults.kv_cache?.default, data.defaults);
  const ranked = rankedModels(data).filter((m) => footprintGb(m, ctx, kvScale) != null);
  const need = (m: Model) => footprintGb(m, ctx, kvScale)!;
  const nearest = (m: Model) =>
    ranked
      .filter((o) => o.family !== m.family)
      .sort((x, y) => Math.abs(need(x) - need(m)) - Math.abs(need(y) - need(m)) || x.id.localeCompare(y.id))[0];

  let pages = 0;
  const cut = new Set<string>();
  for (const [a, b] of memoryNeighbourPairs(data)) {
    pages++;
    const path = modelComparePath(a, b);
    cut.add(path);
    const html = unesc(meta.find((p) => p.path === path)?.html ?? '');
    if (!html) {
      problems.push(`${path} is a memory-neighbour pair with no page`);
      continue;
    }
    if (a.family === b.family) problems.push(`${path} sets two models of one family against each other`);
    const spread = Math.abs(need(a) - need(b)) / Math.min(need(a), need(b));
    if (spread > MODEL_MEMORY_GAP)
      problems.push(`${path} is ${Math.round(spread * 100)}% apart in what it needs at ${Math.round(ctx / 1024)}k, past the ${Math.round(MODEL_MEMORY_GAP * 100)}% this rule allows`);
    if (nearest(a)?.id !== b.id && nearest(b)?.id !== a.id)
      problems.push(`${path} is neither model's nearest in memory outside its own family`);
    const [sa, sb] = [a.frontier_equivalent?.score ?? 0, b.frontier_equivalent?.score ?? 0];
    if (sa < sb || (sa === sb && need(a) > need(b)))
      problems.push(`${path} does not put the stronger model first, or the smaller where the two score the same`);
    for (const m of [a, b])
      if (!html.includes(fmtGb(need(m))))
        problems.push(`${path} does not print what ${m.display_name} needs at ${Math.round(ctx / 1024)}k, which is the whole reason the two are on a page together`);
  }

  // and the only pages that may say it: a model in one of these pairs, or a head-to-head
  // one of whose two sides is in one, which is where the sentence names the others
  const inAPair = new Set(memoryNeighbourPairs(data).flatMap(([a, b]) => [a.id, b.id]));
  const maySay = new Set<string>();
  for (const m of data.models) if (inAPair.has(m.id)) maySay.add(`/models/${m.id}/`);
  for (const [a, b] of modelPairs(data)) if (inAPair.has(a.id) || inAPair.has(b.id)) maySay.add(modelComparePath(a, b));
  for (const p of meta)
    if (p.html.includes('much the same memory') && !maySay.has(p.path))
      problems.push(`${p.path} says two models need much the same memory and is not a page the rule reaches`);

  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} memory-neighbour head-to-head${problems.length === 1 ? ' does' : 's do'} not hold to the rule that cut them`);
  }
  console.log(`  ${pages} head-to-heads between models of different families within ${Math.round(MODEL_MEMORY_GAP * 100)}% of each other in the memory they need at ${Math.round(ctx / 1024)}k`);
}

/**
 * A pay-back sentence that hands one machine the win and then prints the same figure on
 * both sides argues with the table under it. Two machines at the same price can come out
 * days apart over decades, and days do not survive the rounding the pages print at, so
 * the lede says both or it says which.
 */
function checkPayBackReads() {
  const problems: string[] = [];
  for (const p of meta) {
    const m = unesc(p.html).match(/pays for itself sooner, in ([^<]{1,24}?) against ([^<]{1,24}?) at /);
    if (m && m[1] === m[2]) problems.push(`${p.path} says one machine pays back sooner and prints ${m[1]} on both sides`);
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} head-to-head${problems.length === 1 ? '' : 's'} call a pay-back sooner than a figure equal to it`);
  }
}

/**
 * A search result shows about 60 characters of a title. On the longest
 * head-to-heads here the two full machine names filled them before the second
 * machine's memory size arrived, so the one figure the page turns on was the
 * part a searcher never saw. The fix is narrow and it has to cut both ways: a
 * title may leave the screen size out of a laptop's name only where no other
 * machine here answers to the name without it, and a head-to-head still over
 * the 60 characters has to be one where neither name had a bracket to lose.
 */
function checkTitleLabels() {
  const problems: string[] = [];
  // cut here rather than taken from the builder, so that a rule that stopped shortening
  // anything at all fails this instead of quietly passing it
  const bare = (h: Hardware) => shortHardwareLabel(h).replace(/ \([^()]*\)/g, '');
  const answerTo = (name: string) => data.hardware.filter((o) => bare(o) === name);
  const bracketed = data.hardware.filter((h) => bare(h) !== shortHardwareLabel(h));
  // nothing anywhere on the site may name a machine by a name a second machine answers to
  for (const h of bracketed.filter((h) => answerTo(bare(h)).length > 1))
    for (const m of meta.filter((m) => m.title.includes(bare(h))))
      problems.push(`${m.path} calls the ${shortHardwareLabel(h)} "${bare(h)}", and ${answerTo(bare(h)).length} machines here answer to that`);
  // and a title still over the limit has to be one this rule could not shorten
  let shortened = 0;
  let over = 0;
  for (const [a, b] of hardwarePairs(data)) {
    const path = hardwareComparePath(a, b);
    const title = meta.find((m) => m.path === path)?.title;
    if (title == null) {
      problems.push(`${path} is a head-to-head with no title`);
      continue;
    }
    const loseable = [a, b].filter((h) => bare(h) !== shortHardwareLabel(h) && answerTo(bare(h)).length === 1);
    const lost = loseable.filter((h) => title.includes(bare(h)));
    if (lost.length) shortened++;
    // and a screen size is only ever dropped where keeping it would not have fit
    const full = lost.reduce((t, h) => t.replace(bare(h), shortHardwareLabel(h)), title);
    if (lost.length && full.length <= TITLE_MAX)
      problems.push(`${path} drops a screen size to reach ${title.length} characters where the full names fit in ${full.length}`);
    if (title.length <= TITLE_MAX) continue;
    over++;
    if (loseable.length)
      problems.push(`${path} is ${title.length} characters and still carries the screen size of the ${loseable.map((h) => shortHardwareLabel(h)).join(' and the ')}`);
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} page titles name a machine by a name that is not its own or are longer than a search result shows`);
  }
  console.log(
    `  ${meta.filter((m) => m.title.length <= TITLE_MAX).length} of ${meta.length} titles fit the ${TITLE_MAX} characters a search result shows; ` +
      `${shortened} head-to-heads drop a screen size only this site's own range makes redundant`,
  );
}

/**
 * The table that answers "what can I run with 32 GB" is keyed on the number the
 * reader knows before they look anything up, which is the one printed on the box.
 * It used to be keyed on usable memory, and that split the sizes apart: the three
 * rungs a 32 GB machine can land on sat at 21, 24 and 31 GB of usable memory with
 * a 36 GB machine in between them, so a reader with 32 GB met their own size
 * three times, never together, and had no way to tell which row was theirs.
 *
 * Four things hold, and the first is the one the paragraph above the table
 * claims: every size a machine on sale here comes in has a row, so the sentence
 * cannot quietly become false when a machine is added. Then that the rows read in
 * order of that size and keep each size in one unbroken run; that every level of
 * usable memory among those machines is there exactly once, which is what stops a
 * machine being dropped rather than merely re-sorted; and that each row ends in a
 * link opening the calculator on that row's own machine and the strongest model it
 * holds.
 */
function checkMemoryLadder() {
  const html = meta.find((m) => m.path === '/how-much-memory/')?.html ?? '';
  const section = html.split(anchoredHeading('What can you run with the memory you already have?'))[1];
  if (!section) throw new Error('/how-much-memory/ no longer asks what the memory you have runs');
  const body = section.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1];
  if (!body) throw new Error('/how-much-memory/ asks what your memory runs and answers with no table');

  const problems: string[] = [];
  const rows = [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((r) => {
    const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1]);
    return {
      installed: Number(cells[0]?.replace(/<[^>]*>/g, '').replace(/[^\d.]/g, '')),
      usable: Number(cells[1]?.replace(/<[^>]*>/g, '').replace(/[^\d.]/g, '')),
      hw: cells[2]?.match(/href="\/hardware\/([^/"]+)\//)?.[1] ?? '',
      model: cells[4]?.match(/href="\/models\/([^/"]+)\//)?.[1] ?? '',
      // the href is written through esc(), so its separators arrive as &amp;
      link: (cells[5]?.match(/href="([^"]+)"/)?.[1] ?? '').replace(/&amp;/g, '&'),
    };
  });

  const sizes = [...new Set(buyable.map((h) => h.unified_memory_gb))].sort((a, b) => a - b);
  for (const gb of sizes)
    if (!rows.some((r) => r.installed === gb))
      problems.push(`${gb} GB is a size you can buy a machine in here and the table skips it`);

  const runs: number[] = [];
  for (const r of rows) if (runs[runs.length - 1] !== r.installed) runs.push(r.installed);
  for (let i = 1; i < runs.length; i++)
    if (runs[i] <= runs[i - 1])
      problems.push(`the table reads ${runs[i - 1]} GB and then ${runs[i]} GB, so a reader looking for one size meets it in two places`);

  const levels = [...new Set(buyable.map((h) => h.usable_memory_gb!))].sort((a, b) => a - b);
  for (const gb of levels) {
    const at = rows.filter((r) => r.usable === Number(gb.toFixed(1)));
    if (at.length !== 1) problems.push(`${gb} GB of usable memory has ${at.length} rows where it should have one`);
  }

  for (const r of rows) {
    const hw = data.hardware.find((h) => h.id === r.hw);
    if (!hw) {
      problems.push(`a row at ${r.installed} GB names no machine of this site's`);
      continue;
    }
    const top = strongestThatFits(hw, CTX);
    if (!top) {
      if (r.link) problems.push(`the ${shortHardwareLabel(hw)} row holds no model and offers the calculator anyway`);
      continue;
    }
    const want = calcLink({ hw: hw.id, model: top.id, ctx: CTX }, data);
    if (r.model !== top.id)
      problems.push(`the ${shortHardwareLabel(hw)} row names ${r.model || 'nothing'} where ${top.id} is the strongest it holds`);
    if (r.link !== want)
      problems.push(`the ${shortHardwareLabel(hw)} row opens the calculator on something other than its own machine and model`);
  }

  if (problems.length) {
    console.error(problems.slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} fault${problems.length === 1 ? '' : 's'} in what /how-much-memory/ says your own memory runs`);
  }
  console.log(
    `  /how-much-memory/ answers ${sizes.length} memory sizes over ${rows.length} rows, each opening the calculator on the strongest model that size holds`,
  );
}

/**
 * The headings on the 111 pages that are about one thing: a machine or a model.
 *
 * Two claims, and the first is the rule the headings were rewritten to. **No
 * heading on these pages refers to the page's subject as "it."** A heading is
 * where a reader from a search result lands, and it has to say what it is the
 * answer about without the h1 above it. The subject's own name is stripped out
 * before the pronoun is looked for, because two models here are called *Gemma 3
 * 12B it* and one machine could be named the same way tomorrow.
 *
 * The second is that a heading of the shape that names a subject names **this**
 * page's subject. Every one of these headings is built from the page's own
 * machine or model, so the fault it catches is a builder handed the wrong one —
 * the neighbour's name under this page's table, which reads as a fact and is
 * the one mistake a reader could not spot.
 */
function checkSubjectHeadings() {
  const problems: string[] = [];
  // each shape, and the name it holds: the heading a searcher's question lands on
  const shapes: RegExp[] = [
    /^What the (.+) runs$/,
    /^Other machines to weigh against the (.+)$/,
    /^How good is (.+), really\?$/,
    /^What (.+) costs either way$/,
    /^Machines that run (.+)$/,
    /^The machines that miss (.+), and what they run$/,
    /^(.+) fits at \d+k of context$/,
  ];
  const subjects = [
    ...data.hardware.map((hw) => ({ path: `/hardware/${hw.id}/`, name: esc(shortHardwareLabel(hw)) })),
    ...data.models.map((m) => ({ path: `/models/${m.id}/`, name: esc(m.display_name) })),
  ];
  let named = 0;
  for (const { path, name } of subjects) {
    const html = meta.find((p) => p.path === path)?.html ?? '';
    const headings = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map((h) => h[1]);
    if (!headings.length) problems.push(`${path} has no headings at all`);
    for (const heading of headings) {
      if (/\bits?\b/i.test(heading.split(name).join(' ')))
        problems.push(`${path} heads a section "${heading}", which calls ${name} "it"`);
      const shape = shapes.find((r) => r.test(heading));
      if (!shape) continue;
      const found = heading.match(shape)![1];
      if (found === name) named++;
      else problems.push(`${path} heads a section "${heading}", which names ${found} where the page is about ${name}`);
    }
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} heading${problems.length === 1 ? '' : 's'} on a machine or model page do not name what the page is about`);
  }
  console.log(
    `  ${subjects.length} machine and model pages name their subject in ${named} headings; none of the headings on them calls it "it"`,
  );
}

/**
 * Every page on this site is cut into sections, and no section is the page over
 * again.
 *
 * A page with no `<h2>` on it is a page nothing can link into, a page no search
 * result can offer a jump into, and a page a reader has to read from the top to
 * find the part they came for. It is also the state `/hardware/` and
 * `/leaderboard/` were in for weeks without anyone noticing: 56 machines and 55
 * models under one heading each, while every other index on the site headed five
 * sections or more. The floor is one section, and the print says what the
 * thinnest page actually heads, so the next index written as one slab is caught
 * by the build rather than by the next person to measure it.
 *
 * The second claim is what stops the floor being met with a heading that says
 * nothing: a section headed in the page's own title is the page labelling itself
 * inside itself, which buys the reader nothing and a jump line a repeated line.
 */
function checkPageSections() {
  const problems: string[] = [];
  const words = (h: string) => unesc(h.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
  let fewest = { path: '', sections: Infinity };
  for (const { path, html } of meta) {
    const body = mainOf(html);
    const h1 = words(body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '');
    const sections = [...body.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => words(m[1]));
    if (!sections.length) {
      problems.push(`${path} heads no sections at all, so nothing can link into it and a reader has to start at the top`);
      continue;
    }
    if (sections.length < fewest.sections) fewest = { path, sections: sections.length };
    for (const heading of sections)
      if (heading.toLowerCase() === h1.toLowerCase())
        problems.push(`${path} heads a section "${heading}", which is the page's own title said twice`);
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(
      problems.length === 1
        ? '1 page does not cut itself into sections a reader can land on'
        : `${problems.length} pages do not cut themselves into sections a reader can land on`,
    );
  }
  console.log(
    `  ${meta.length} pages head at least one section, the fewest being ${fewest.sections} on ${fewest.path}; none of them heads a section in the page's own title`,
  );
}

/**
 * Every section on this site can be linked to, and no two sections on one page
 * answer to the same link.
 *
 * A heading with no id is a section another site has to send a reader to the top
 * of, and a section a search engine cannot offer a jump link into. Two headings
 * sharing one id is worse than neither having one: the browser honours the first
 * and silently ignores the second, so a link that looks right lands wrong.
 *
 * It also holds the one thing the guards above depend on, which is that a slug is
 * a function of the heading's own words. They ask for a heading through
 * `anchoredHeading`, which slugs the text the same way the build did; if an id
 * anywhere were set by hand instead, those guards would start missing sections
 * that are really there and this one says so first.
 *
 * Answering to one link is not the same as reading differently, and until now
 * this guard only held the first. `anchorHeadings` numbers a slug it has already
 * used, so a page headed "The specifics" twice builds clean on ids
 * `the-specifics` and `the-specifics-2`, and the jump line above those sections
 * then offers the reader the same words twice pointing at two different places.
 * Every id is unique and the line is useless. So the last claim is about the
 * words rather than the addresses: no page heads two sections that read the same.
 * Nothing on the site does it today, which is the point of saying so now rather
 * than the day a template repeats a heading.
 */
function checkHeadingAnchors() {
  const problems: string[] = [];
  const words = (h: string) => unesc(h.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
  let headings = 0;
  for (const { path, html } of meta) {
    const body = mainOf(html);
    const seen = new Set<string>();
    const read = new Set<string>();
    for (const [, id, text] of body.matchAll(/<h2(?:\s+id="([^"]*)")?[^>]*>([\s\S]*?)<\/h2>/g)) {
      headings++;
      if (!id) {
        problems.push(`${path} heads a section "${text.slice(0, 60)}" with no id, so nothing can link to it`);
        continue;
      }
      if (seen.has(id)) problems.push(`${path} gives two sections the same id, "${id}", so a link to it lands on the first`);
      seen.add(id);
      if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) problems.push(`${path} gives a section the id "${id}", which is not a slug`);
      const expected = headingSlug(text);
      if (read.has(expected))
        problems.push(`${path} heads two sections "${words(text)}", so a jump into them offers the reader the same words twice`);
      read.add(expected);
      if (id !== expected && id !== `${expected}-2` && id !== `${expected}-3`)
        problems.push(`${path} gives "${text.slice(0, 40)}" the id "${id}" where its own words slug to "${expected}"`);
    }
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} section heading${problems.length === 1 ? '' : 's'} cannot be linked to`);
  }
  console.log(
    `  ${headings} section headings across ${meta.length} pages, each with the id a link lands on, no id repeated on its page and no two of them reading the same`,
  );
}

/**
 * A page with more sections than fit on a screen says at the top what is in
 * them, and every jump it offers lands on one of its own.
 *
 * Three claims, and the first is the one that keeps the line honest. A page
 * carries the line where it heads four sections or more and at most one of those
 * headings repeats a name its own h1 already carries — so the head-to-heads and
 * the long indexes have one and the machine and model pages, whose every heading
 * names the machine or the model, do not. Write a fourth section onto a machine
 * page, or take the model's name out of a model page's headings, and the rule
 * changes its mind about that page; this says so rather than leaving it to
 * whoever next reads the page.
 *
 * The second is that the line covers the page: one jump per section, in the
 * order the page puts them in, each landing on an id the page really heads. A
 * line that names three of four sections is a contents page with a section
 * missing, which is worse than none. The third is that it sits above the first
 * section it points into, because a jump link below what it jumps to is a link
 * the reader has already scrolled past.
 *
 * `/best/` writes its own line, shortening five headings that each carry a
 * second clause, and this holds that one to the same three claims.
 */
function checkJumpLines() {
  const problems: string[] = [];
  let lines = 0;
  let jumps = 0;
  let quiet = 0;
  for (const { path, html } of meta) {
    const body = mainOf(html);
    const h1 = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '';
    const sections = [...body.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => ({ id: m[1], heading: m[2] }));
    const named = sections.filter((x) => subjectNames.some((n) => n && h1.includes(n) && x.heading.includes(n)));
    const wanted = sections.length >= JUMP_MIN_SECTIONS && named.length <= 1;
    const line = body.match(/<p class="note">Jump to: ([\s\S]*?)<\/p>/);
    if (!line) {
      if (wanted) problems.push(`${path} heads ${sections.length} sections and offers no way into them`);
      else quiet++;
      continue;
    }
    if (!wanted) {
      problems.push(
        sections.length < JUMP_MIN_SECTIONS
          ? `${path} offers jump links into ${sections.length} sections, which is a contents line for what is already on the screen`
          : `${path} offers jump links whose words name ${named[0]?.heading.slice(0, 40)} and ${named.length - 1} more heading${named.length === 2 ? '' : 's'} carrying the same name`,
      );
      continue;
    }
    lines++;
    const hrefs = [...line[1].matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    jumps += hrefs.length;
    if (hrefs.length !== sections.length)
      problems.push(`${path} jumps into ${hrefs.length} of the ${sections.length} sections it heads`);
    const at = hrefs.map((h) => body.indexOf(`id="${h}"`));
    for (const [i, x] of at.entries()) {
      if (x < 0) problems.push(`${path} jumps to #${hrefs[i]}, which is not an id on the page`);
      else if (i && at[i - 1] >= 0 && x <= at[i - 1])
        problems.push(`${path} lists #${hrefs[i]} after #${hrefs[i - 1]}, where the page itself has them the other way round`);
    }
    if (body.indexOf(line[0]) > body.indexOf('<h2 id="'))
      problems.push(`${path} puts its jump links below the first section they point into`);
  }
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(`${problems.length} page${problems.length === 1 ? '' : 's'} offer the wrong way into their own sections`);
  }
  console.log(
    `  ${lines} pages offer ${jumps} jumps into their own sections, one a section; ${quiet} pages carry none, each under ${JUMP_MIN_SECTIONS} sections or naming its own subject in more than one`,
  );
}

/**
 * A link that names a section has to land on it. The id it aims at is a
 * function of that section's own heading, so the two ends of the link are
 * written from the same words and a reworded heading moves both — but only on
 * the pages this build writes. A section moved to another page, or a heading
 * reworded in one place and linked from another, leaves a link that scrolls
 * nowhere: the reader arrives at the top of the page and has to find the answer
 * the link promised, which is the thing the link was there to save them.
 *
 * Three claims. Every fragment a page links to exists on the page it points at.
 * Every one of them is the id of a section rather than of something the page
 * happens to carry, so a link cannot quietly start landing on a table. And the
 * five sections named in SECTIONS are each linked from somewhere, so a heading
 * that stops being linked shows up here rather than sitting in the list.
 */
function checkSectionLinks() {
  const problems: string[] = [];
  const sectionsOn = new Map<string, Set<string>>();
  for (const { path, html } of meta) {
    const body = mainOf(html);
    sectionsOn.set(
      path,
      new Set([...body.matchAll(/<(?:h2|section) id="([^"]+)"/g)].map((m) => m[1])),
    );
  }
  const landed = new Set<string>();
  let links = 0;
  for (const { path, html } of meta) {
    for (const [, href, hash] of mainOf(html).matchAll(/<a href="(\/[^"#]*\/|)#([^"]+)"/g)) {
      links++;
      const target = href || path;
      landed.add(`${href}#${hash}`);
      const ids = sectionsOn.get(target);
      if (!ids) {
        problems.push(`${path} links to ${target}#${hash}, and no page here is written at ${target}`);
        continue;
      }
      if (!ids.has(hash)) problems.push(`${path} links to ${target}#${hash}, where ${target} heads no section with that id`);
    }
  }
  for (const [name, href] of Object.entries(SECTIONS))
    if (!landed.has(href)) problems.push(`${href} is the section SECTIONS calls ${name}, and no page on this site links to it`);
  if (problems.length) {
    console.error([...new Set(problems)].slice(0, 5).map((x) => `  ${x}`).join('\n'));
    throw new Error(problems.length === 1 ? '1 link into a section lands nowhere' : `${problems.length} links into a section land nowhere`);
  }
  const pages = new Set([...landed].map((h) => h.split('#')[0]).filter(Boolean));
  console.log(`  ${links} links name a section and land on it, across ${landed.size} sections of ${pages.size} other pages`);
}

checkMeta();
checkLinks();
checkSectionLinks();
checkFooter();
checkHeadToHeads();
checkMatchUpSiblings();
checkCanonicals();
checkOgCards();
checkFonts();
checkCounts();
checkCardPrices();
checkCardScope();
checkCardRanking();
checkMachineIndex();
checkMachineLedes();
checkSubjectHeadings();
checkPageSections();
checkHeadingAnchors();
checkJumpLines();
checkSpeedBasis();
checkTables();
checkPairedColumns();
checkArticles();
checkCompareIndex();
checkMatchUpKinds();
checkHardwareIndex();
checkPricedRows();
checkPayback();
checkMeetingPoint();
checkHeadroom();
checkSharedHeadroom();
checkSameSilicon();
checkGenerationPairs();
checkChipStepPairs();
checkPriceNeighbours();
checkMemoryNeighbours();
checkPayBackReads();
checkStandInPower();
checkModelContexts();
checkMachineContexts();
checkShorterFits();
checkShorterMachines();
checkMissedMachines();
checkHiddenModels();
checkFamilyReach();
checkModelGenerations();
checkLeaderboardLinks();
checkLeaderboardBuilds();
checkBestGpu();
checkBestCuts();
checkNotes();
checkHardwareNotes();
checkTierLabels();
checkTokenCost();
checkMarkerWords();
checkSourceLinks();
checkPageDates();
checkTitleLabels();
checkMemoryLadder();
// Every guard has passed, so the three files the build publishes rather than
// generates go out now. A build that stops at a guard leaves the last sitemap
// that earned its place, and leaves the ledger alone — it records the day a
// page's words changed, and a page a guard refused is not a page that changed.
// Writing it anyway cost the next build a lastmod on every page touched, and
// the build after that stamped those pages with the day the fault was fixed.
writeFileSync(new URL('sitemap.xml', outRoot), sitemapXml);
writeFileSync(new URL('robots.txt', outRoot), robotsTxt);
writeFileSync(datesFile, `${JSON.stringify(nextLedger, null, 2)}\n`);
// /hardware/ is the index of the machines, not one of them, so it is not counted as one
console.log(`wrote ${paths.length} static pages + sitemap.xml (${paths.filter((p) => p.startsWith('/models')).length} models, ${paths.filter((p) => p.startsWith('/hardware/') && p !== '/hardware/').length} machines, ${paths.filter((p) => p.startsWith('/compare')).length} comparisons)`);
