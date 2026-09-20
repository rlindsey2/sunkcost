import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  addJumpLine, anchoredHeading, anchorHeadings, headingSlug, JUMP_MIN_SECTIONS, sectionLink, SECTIONS, brandOf, calcLink, cardRankingLine, cardScopeNote, cheapestPerFamily, cheapestRunsBoth, cheapestThatHolds, computeView, contextCappedBy,
  bestLeftOut, contextHeadroom, ctxLabel, andList, familyHeading, familyNoun, familyRange, familyReach, familyReachNote, fitsOf, fitsShorter, fmtDuration, fmtGb1, fmtNum,
  machineIndexLine,
  machinesThatHold,
  fmtUsd, FONT_PRELOAD, gbRange, hardwareLabel, hardwareProduct, indefiniteArticle, jsonLd, kvWorking,
  leaderboardBuildsLine, leaderboardRows, longestContext, machinesConsidered, machinesShorter, machineVerdict, median, missedMachines, modelGenerationSection, modelsInBand, modelVerdict, numberWord,
  costMachine, fmtPerMtok, footerHtml, FOOTER_LINKS, graphicsCards, machineMatchUpsLine, modelMatchUpsLine, MTOK, nearestCompleteComputer,
  otherQuantisations, pageGraph, pageShell, powerSourceLabel, powerWithSource, priceRivals, pricePerUsableGb,
  priceWithScope, priceWithScopeText, publishedPriceLine, rowFor, runnersFor, tokenCost, tokenCosts,
  runsOnNote, runsOnlyOn, runsOnlyThere, sharedHeadroom, shortHardwareLabel, shownTps, SIZE_BANDS, speedFrom, speedWithBasis, stack,
  sourceLinks, sourceName, holdHyphens, splitCapabilityNote, splitHardwareNote, noteSentences, endStop, strongestShared, tierLabel, tierName, titleHardwareLabel, verdictLine, widestHeadroom, type LdNode,
} from '../src/pagekit';
import {
  indexVersion, powerSourceLabel as fmtPowerSourceLabel, sourceLinks as fmtSourceLinks,
  sourceName as fmtSourceName, splitHardwareNote as fmtSplitHardwareNote,
} from '../src/format';
import { footprintGb, kvCacheGb } from '../src/fit';
import { hardwarePairs, modelGenerationPairs, modelPairs, sameSiliconPairs } from '../src/versus-card';
import { bestUsageLevels } from '../src/best';
import { defaultState, parseState } from '../src/state';
import { sharePath } from '../src/share';
import type { Dataset, Hardware, Model } from '../src/types';
import hardware from '../data/hardware.json';
import models from '../data/models.json';
import throughput from '../data/throughput.json';
import defaults from '../data/defaults.json';

const data = { hardware, models, throughput, defaults } as unknown as Dataset;
const hw = (id: string) => data.hardware.find((h) => h.id === id)!;

const node = (graph: LdNode[], type: string) => graph.find((n) => n['@type'] === type)!;

describe('structured data', () => {
  const graph = pageGraph(
    {
      title: 'Mac mini M6, 16GB: can it run local LLMs?',
      description: 'Some description.',
      canonical: '/hardware/mac-mini-m6-16/',
      ogImage: '/og/card.png',
      crumbs: [
        { href: '/', label: 'Sunk Cost' },
        { href: '/hardware/mac-mini-m6-16/', label: 'Mac mini M6, 16GB' },
      ],
      about: hardwareProduct(hw('mac-mini-m6-16'), 'https://sunkcost.ai/hardware/mac-mini-m6-16/'),
    },
    data,
  );

  it('numbers breadcrumb steps from one and gives each an absolute URL', () => {
    expect(node(graph, 'BreadcrumbList').itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Sunk Cost', item: 'https://sunkcost.ai/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Mac mini M6, 16GB',
        item: 'https://sunkcost.ai/hardware/mac-mini-m6-16/',
      },
    ]);
  });

  it('leaves out the URL of a step that has no page of its own', () => {
    const [, second] = node(
      pageGraph(
        {
          title: 't',
          description: 'd',
          canonical: '/compare/a-vs-b/',
          crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '#', label: 'A vs B' }],
        },
        data,
      ),
      'BreadcrumbList',
    ).itemListElement as LdNode[];
    expect(second).toEqual({ '@type': 'ListItem', position: 2, name: 'A vs B' });
  });

  it('ties the page to the site, its breadcrumb and what it is about', () => {
    const page = node(graph, 'WebPage');
    expect(page.url).toBe('https://sunkcost.ai/hardware/mac-mini-m6-16/');
    expect(page.isPartOf).toEqual({ '@id': 'https://sunkcost.ai/#website' });
    expect(page.breadcrumb).toEqual({ '@id': 'https://sunkcost.ai/hardware/mac-mini-m6-16/#breadcrumb' });
    expect(page.about).toEqual({ '@id': 'https://sunkcost.ai/hardware/mac-mini-m6-16/#product' });
    expect(node(graph, 'Product')['@id']).toBe('https://sunkcost.ai/hardware/mac-mini-m6-16/#product');
  });

  it('calls a machine what its maker calls it, and keeps the site’s label alongside', () => {
    const mac = hardwareProduct(hw('mac-mini-m6-16'), 'https://sunkcost.ai/x/');
    expect(mac.name).toBe('Mac mini M6, 16GB');
    expect(mac).not.toHaveProperty('alternateName');
    const framework = hardwareProduct(hw('framework-desktop-395-128'), 'https://sunkcost.ai/x/');
    expect(framework.name).toBe('Framework Desktop, 128GB');
    expect(framework.alternateName).toBe('Strix Halo Framework Desktop, 128GB');
  });

  it('omits the about link entirely when the page is not about one thing', () => {
    const page = node(
      pageGraph(
        { title: 't', description: 'd', canonical: '/best/', crumbs: [{ href: '/', label: 'Sunk Cost' }] },
        data,
      ),
      'WebPage',
    );
    expect(page).not.toHaveProperty('about');
    expect(page).not.toHaveProperty('primaryImageOfPage');
  });

  it('never claims to sell anything', () => {
    for (const n of graph) expect(n).not.toHaveProperty('offers');
  });

  it('publishes a power figure only where the maker published one', () => {
    const props = (h: Hardware) =>
      (hardwareProduct(h, 'https://sunkcost.ai/x/').additionalProperty as LdNode[]).map((p) => p.name);
    // the maker's own rating
    expect(props(hw('geforce-rtx-5090-32'))).toContain('Rated power under load');
    // a stand-in taken from the previous chip: it needs the sentence beside it
    expect(hw('mac-mini-m6-16').load_watts).not.toBeNull();
    expect(props(hw('mac-mini-m6-16'))).not.toContain('Rated power under load');
    expect(props(hw('mac-mini-m6-16'))).toEqual(['Memory', 'Memory bandwidth']);
  });

  it('names the maker, not the chip, for every machine on the list', () => {
    expect(brandOf(hw('mac-studio-m5-ultra-96'))).toBe('Apple');
    expect(brandOf(hw('geforce-rtx-5090-32'))).toBe('NVIDIA');
    expect(brandOf(hw('nvidia-dgx-spark-128'))).toBe('NVIDIA');
    expect(brandOf(hw('radeon-ai-pro-r9700-32'))).toBe('AMD');
    expect(brandOf(hw('gmktec-evo-x2-128'))).toBe('GMKtec');
    expect(brandOf(hw('framework-desktop-395-128'))).toBe('Framework');
    for (const h of data.hardware) expect(brandOf(h)).toMatch(/^[A-Za-z]/);
  });

  it('escapes anything that could close the script tag early', () => {
    const html = jsonLd([{ '@type': 'Thing', name: '</script><img src=x>' }]);
    expect(html).not.toContain('</script><img');
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    const parsed = JSON.parse(html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''));
    expect(parsed['@graph'][0].name).toBe('</script><img src=x>');
    expect(parsed['@context']).toBe('https://schema.org');
  });
});

describe('related machines', () => {
  it('lists the rest of a range, current generation first then cheapest first', () => {
    const range = familyRange(hw('mac-mini-m6-16'), data);
    expect(range.map((h) => h.id)).toEqual([
      'mac-mini-m6-24', 'mac-mini-m6-32', 'mac-mini-m5-pro-24', 'mac-mini-m5-pro-48', 'mac-mini-m5-pro-64',
      'mac-mini-m4-16', 'mac-mini-m4-24', 'mac-mini-m4-32', 'mac-mini-m4-pro-24', 'mac-mini-m4-pro-48',
      'mac-mini-m4-pro-64',
    ]);
  });

  it('never puts a machine in its own range', () => {
    for (const h of data.hardware) expect(familyRange(h, data).map((x) => x.id)).not.toContain(h.id);
  });

  it('picks one price rival per other family, and nothing discontinued or unpriced', () => {
    const rivals = priceRivals(hw('nvidia-dgx-spark-128'), data);
    expect(new Set(rivals.map((h) => h.family)).size).toBe(rivals.length);
    for (const r of rivals) {
      expect(r.family).not.toBe('DGX Spark');
      expect(r.generation ?? 'current').toBe('current');
      expect(r.price_usd).not.toBeNull();
    }
  });

  it('shows price rivals cheapest first', () => {
    for (const h of data.hardware) {
      const prices = priceRivals(h, data).map((r) => r.price_usd!);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    }
  });

  it('takes the closest price in each family, not just any member of it', () => {
    // the $18,000 card is the far end of NVIDIA; a $1,299 Mac mini should meet the $1,999 5090
    expect(priceRivals(hw('mac-mini-m6-32'), data).find((h) => h.family === 'NVIDIA')?.id)
      .toBe('geforce-rtx-5090-32');
  });

  it('gives a machine with no published price no rivals to be near', () => {
    expect(priceRivals(hw('framework-desktop-495-192'), data)).toEqual([]);
  });

  it('names a range the way the thing is sold', () => {
    expect(familyHeading(hw('mac-mini-m6-16'))).toBe('The rest of the Mac mini range');
    expect(familyHeading(hw('geforce-rtx-3090-24'))).toBe('Other NVIDIA cards');
    expect(familyHeading(hw('gmktec-evo-x2-128'))).toBe('Other Strix Halo machines');
  });

  it('pairs the two quantisations of a model, both ways and only those', () => {
    const m = (id: string) => data.models.find((x) => x.id === id)!;
    expect(otherQuantisations(m('qwen3-32b-q4'), data).map((x) => x.id)).toEqual(['qwen3-32b-q8']);
    expect(otherQuantisations(m('qwen3-32b-q8'), data).map((x) => x.id)).toEqual(['qwen3-32b-q4']);
    expect(otherQuantisations(m('llama-3.1-8b-q4'), data).map((x) => x.id)).toEqual(['llama-3.1-8b-q8']);
    expect(otherQuantisations(m('spark-x2.5-4b-q4'), data)).toEqual([]);
  });

  it('leaves no machine and no model without a page linking to it', () => {
    // every machine is named on a sibling's page or as somebody's nearest price,
    // and every model is on the leaderboard, a machine page or its own twin
    for (const h of data.hardware)
      expect(
        data.hardware.some((x) => familyRange(x, data).some((r) => r.id === h.id) || priceRivals(x, data).some((r) => r.id === h.id)),
        `${h.id} is linked from no other machine page`,
      ).toBe(true);
  });
});

describe('the memory question', () => {
  const m = (id: string) => data.models.find((x) => x.id === id)!;
  const CTX = 32768;

  it('writes a decimal only where there is one', () => {
    expect(fmtGb1(42.52)).toBe('42.5 GB');
    expect(fmtGb1(24)).toBe('24 GB');
    expect(fmtGb1(10.5)).toBe('10.5 GB');
    expect(fmtGb1(null)).toBe('—');
  });

  it('gives a range only when the two ends differ', () => {
    expect(gbRange([4.9, 42.52])).toBe('4.9 GB to 42.5 GB');
    expect(gbRange([8, 8])).toBe('8 GB');
    expect(gbRange([])).toBe('—');
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([])).toBeNull();
  });

  it('holds a model only in a machine that is current, priced and big enough', () => {
    for (const need of [3, 12.8, 53.3, 96, 500]) {
      const hw = cheapestThatHolds(need, data);
      if (!hw) continue;
      expect(hw.usable_memory_gb).toBeGreaterThanOrEqual(need);
      expect(hw.generation ?? 'current').toBe('current');
      expect(hw.price_usd).not.toBeNull();
      // nothing cheaper on the list would have done
      for (const other of data.hardware)
        if (
          other.price_usd != null &&
          (other.generation ?? 'current') === 'current' &&
          (other.usable_memory_gb ?? 0) >= need
        )
          expect(other.price_usd).toBeGreaterThanOrEqual(hw.price_usd!);
    }
  });

  it('says nothing holds a model no machine can hold', () => {
    const biggest = Math.max(...data.hardware.map((h) => h.usable_memory_gb ?? 0));
    expect(cheapestThatHolds(biggest + 1, data)).toBeNull();
    expect(cheapestThatHolds(null, data)).toBeNull();
  });

  it('puts every model in exactly one size band', () => {
    const counted = SIZE_BANDS.flatMap((b) => modelsInBand(b, data).map((x) => x.id));
    expect(counted.length).toBe(data.models.length);
    expect(new Set(counted).size).toBe(counted.length);
    for (const band of SIZE_BANDS)
      for (const x of modelsInBand(band, data)) {
        expect(x.params_b).toBeGreaterThanOrEqual(band.min);
        expect(x.params_b).toBeLessThan(band.max);
      }
  });

  it('shows the cache working only where that working is the whole story', () => {
    // plain multi-head attention: 2 × 8 heads × 128 × 2 bytes × 80 layers × 32768 tokens
    const working = kvWorking(m('llama-3.3-70b-q4'), CTX);
    expect(working).toContain('327,680 bytes');
    expect(working).toContain('10.7 GB');
    // a hybrid caches the full context in only some layers, so the one-line sum would lie
    expect(kvWorking(m('qwen3-coder-next-q4'), CTX)).toBeNull();
    expect(kvWorking(m('gpt-oss-120b-mxfp4'), CTX)).toBeNull();
  });

  it('never prints working that disagrees with the figure the site uses', () => {
    for (const model of data.models) {
      const working = kvWorking(model, CTX);
      if (working == null) continue;
      expect(working).toContain(`${kvCacheGb(model, CTX)!.toFixed(1)} GB`);
    }
  });
});

describe('links into the calculator', () => {
  const state = { ...defaultState(data), hw: 'mac-mini-m6-32', model: 'qwen3.8-27b-q4', usage: 50_000 };

  it('sends a reader to the calculator itself, not to a share page', () => {
    // /s/ pages carry noindex on purpose. A page written to be found should not
    // spend its links on addresses the site asks search engines to ignore.
    const link = calcLink(state, data);
    expect(link.startsWith('/?')).toBe(true);
    expect(link).not.toContain('/s/');
    expect(sharePath(state, state.model, data)).toContain('/s/');
  });

  it('carries the machine, the model and the usage the page was showing', () => {
    const q = new URLSearchParams(calcLink(state, data).slice(2));
    expect(q.get('hw')).toBe('mac-mini-m6-32');
    expect(q.get('m')).toBe('qwen3.8-27b-q4');
    expect(q.get('u')).toBe('50000');
  });
});

describe('fonts', () => {
  const shell = pageShell(
    {
      title: 'A page',
      description: 'A description.',
      canonical: '/hardware/mac-mini-m6-16/',
      ogImage: null,
      crumbs: [{ href: '/', label: 'Sunk Cost' }],
    },
    '<p>Body.</p>',
    data,
  );
  const css = readFileSync(new URL('../public/page.css', import.meta.url), 'utf8');

  it('makes the browser wait on no other origin before it can paint', () => {
    expect(shell).not.toContain('fonts.googleapis.com');
    expect(shell).not.toContain('fonts.gstatic.com');
    expect([...shell.matchAll(/rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1])).toEqual(['/page.css']);
  });

  it('preloads the two faces that paint first, and only those', () => {
    const preloads = [...shell.matchAll(/<link rel="preload" href="([^"]+)" as="font"[^>]*>/g)].map((m) => m[1]);
    expect(preloads).toEqual([FONT_PRELOAD.sans, FONT_PRELOAD.mono]);
    // a font request goes out anonymously whatever the origin, so without this
    // the preloaded file is fetched a second time when the stylesheet asks
    expect(shell).toContain(`href="${FONT_PRELOAD.sans}" as="font" type="font/woff2" crossorigin`);
  });

  it('serves every face the pages ask for from this origin, latin and latin-ext', () => {
    const faces = [...css.matchAll(/url\((\/fonts\/[^)]+)\)/g)].map((m) => m[1]);
    expect(faces).toHaveLength(10);
    for (const f of faces) expect(existsSync(new URL(`../public${f}`, import.meta.url))).toBe(true);
    // the weights and the one italic the pages actually use
    expect(css).toContain("font-family: 'Instrument Sans'");
    expect(css).toContain('font-weight: 400 700');
    expect(css.match(/font-style: italic/g)).toHaveLength(2);
    for (const w of [400, 500, 600]) expect(css).toContain(`/fonts/ibm-plex-mono-v20-${w}-latin.woff2`);
  });

  it('lets the text show in a fallback face while a font is still coming', () => {
    expect(css.match(/@font-face/g)).toHaveLength(10);
    expect(css.match(/font-display: swap/g)).toHaveLength(10);
  });
});

describe('the calculator’s own head', () => {
  const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
  const home = read('index.html');
  const faces = (css: string) => [...css.matchAll(/@font-face\s*\{[^}]*\}/g)].map((m) => m[1] ?? m[0]);

  it('asks no other origin for anything before it can paint', () => {
    // a canonical names an address rather than fetching one, so it is not a request
    const fetched = [...home.matchAll(/<(?:link|script)\b[^>]*>/g)].map((m) => m[0]).filter((t) => !t.includes('rel="canonical"'));
    expect(fetched.filter((t) => /(?:href|src)="https?:\/\//.test(t))).toEqual([]);
    expect(home).not.toContain('fonts.googleapis.com');
    expect(home).not.toContain('fonts.gstatic.com');
  });

  it('preloads the same two faces the generated pages do, and only those', () => {
    const preloads = [...home.matchAll(/<link rel="preload" href="([^"]+)" as="font"[^>]*>/g)].map((m) => m[1]);
    expect(preloads).toEqual([FONT_PRELOAD.sans, FONT_PRELOAD.mono]);
    for (const f of preloads) {
      expect(home).toContain(`href="${f}" as="font" type="font/woff2" crossorigin`);
      expect(existsSync(new URL(`../public${f}`, import.meta.url))).toBe(true);
    }
  });

  it('sets type in the same faces as a search landing, from one set of rules', () => {
    const app = read('src/fonts.css');
    expect(read('src/styles.css')).toContain("@import './fonts.css';");
    expect(faces(app)).toHaveLength(10);
    expect(faces(app)).toEqual(faces(read('public/page.css')));
    for (const f of [...app.matchAll(/url\((\/fonts\/[^)]+)\)/g)].map((m) => m[1]))
      expect(existsSync(new URL(`../public${f}`, import.meta.url))).toBe(true);
  });

  it('tells a search engine what site this is, in the words the other pages use', () => {
    const raw = home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    const graph = JSON.parse(raw!)['@graph'] as Record<string, unknown>[];
    const site = data.defaults.site_url.replace(/\/$/, '');
    const website = graph.find((n) => n['@type'] === 'WebSite');
    const page = graph.find((n) => n['@type'] === 'WebPage');

    // Google reads the site name from the home page's own markup, so this node
    // has to say exactly what all 188 generated pages say about the same site.
    const fromPages = pageGraph(
      { title: 'A page', description: 'A description.', canonical: '/best/', ogImage: null, crumbs: [{ href: '/', label: 'Sunk Cost' }] },
      data,
    ).find((n) => n['@type'] === 'WebSite');
    expect(website).toEqual(fromPages);

    expect(page!['@id']).toBe(`${site}/#webpage`);
    expect(page!.url).toBe(`${site}/`);
    expect(page!.isPartOf).toEqual({ '@id': website!['@id'] });
    expect(page!.name).toBe(home.match(/<title>([^<]+)<\/title>/)![1]);
    expect(page!.description).toBe(home.match(/<meta name="description" content="([^"]+)"/)![1]);
    expect(home).toContain(`<link rel="canonical" href="${site}/" />`);
  });
});

describe('the name a machine goes by in a title', () => {
  const bare = (h: Hardware) => shortHardwareLabel(h).replace(/ \([^()]*\)/g, '');
  const brackets = data.hardware.filter((h) => bare(h) !== shortHardwareLabel(h));

  it('keeps the screen size where a second machine answers to the name without it', () => {
    const airs = data.hardware.filter((h) => bare(h) === 'MacBook Air M5, 16GB');
    expect(airs.length).toBe(2);
    for (const air of airs) expect(titleHardwareLabel(air, data.hardware)).toBe(shortHardwareLabel(air));
  });

  it('drops it where only one machine here does', () => {
    const only = brackets.filter((h) => data.hardware.filter((o) => bare(o) === bare(h)).length === 1);
    expect(only.length).toBeGreaterThan(0);
    for (const h of only) {
      expect(titleHardwareLabel(h, data.hardware)).toBe(bare(h));
      expect(titleHardwareLabel(h, data.hardware)).not.toContain('(');
    }
  });

  it('leaves a name with no screen size in it alone', () => {
    for (const h of data.hardware.filter((h) => bare(h) === shortHardwareLabel(h)))
      expect(titleHardwareLabel(h, data.hardware)).toBe(shortHardwareLabel(h));
  });

  it('still names one machine, whichever way it goes', () => {
    const names = data.hardware.map((h) => titleHardwareLabel(h, data.hardware));
    expect(new Set(names).size).toBe(data.hardware.length);
  });

  it('keeps the screen size once a second size of the same machine is priced', () => {
    const pro = hw('macbook-pro-16-m5-pro-64');
    expect(titleHardwareLabel(pro, data.hardware)).toBe('MacBook Pro M5 Pro, 64GB');
    const fourteen = { ...pro, id: 'macbook-pro-14-m5-pro-64', chip: 'M5 Pro (14-inch)' } as Hardware;
    expect(titleHardwareLabel(pro, [...data.hardware, fourteen])).toBe(shortHardwareLabel(pro));
  });
});

describe('machine head-to-heads', () => {
  const view = (id: string) => computeView({ ...defaultState(data), hw: id }, data);
  // one pair whose columns hold different models, one whose columns hold the same one,
  // and one where a bare graphics card is set against a complete computer
  const differ = ['mac-mini-m5-pro-24', 'mac-studio-m5-max-128'] as const;
  const same = ['mac-studio-m5-max-128', 'nvidia-dgx-spark-128'] as const;

  it('finds the strongest model both machines hold, not each machine\'s own best', () => {
    const [va, vb] = differ.map(view);
    const shared = strongestShared(va, vb)!;
    expect(shared).not.toBeNull();
    expect(fitsOf(va)[0].model.id).not.toBe(fitsOf(vb)[0].model.id);
    // it fits both, and nothing stronger does
    expect(shared.a.fit.status).toBe('fits');
    expect(shared.b.fit.status).toBe('fits');
    const stronger = fitsOf(va).slice(0, fitsOf(va).findIndex((r) => r.model.id === shared.model.id));
    const heldByB = new Set(fitsOf(vb).map((r) => r.model.id));
    for (const r of stronger) expect(heldByB.has(r.model.id)).toBe(false);
  });

  it('lists only models the roomier machine holds and the tighter one does not', () => {
    const [va, vb] = differ.map(view);
    const extra = runsOnlyOn(va, vb);
    const inA = new Set(fitsOf(va).map((r) => r.model.id));
    const inB = new Set(fitsOf(vb).map((r) => r.model.id));
    for (const m of extra) {
      expect(inA.has(m.id)).toBe(true);
      expect(inB.has(m.id)).toBe(false);
    }
    expect(extra.length).toBe(fitsOf(va).length - fitsOf(vb).length + runsOnlyOn(vb, va).length);
  });

  it('never prints a speed without saying whether it was measured or estimated', () => {
    const [va] = differ.map(view);
    expect(speedWithBasis(fitsOf(va)[0])).toMatch(/tok\/s <span class="dim">(measured|estimated)<\/span>/);
    expect(speedWithBasis(undefined)).toBe('<span class="dim">unknown</span>');
  });

  it('says the same where the speed is held without the row it came from', () => {
    const [va] = differ.map(view);
    const row = fitsOf(va)[0];
    expect(speedFrom(row.throughput)).toBe(speedWithBasis(row));
    expect(speedFrom(null)).toBe('<span class="dim">unknown</span>');
    expect(speedFrom({ tokensPerSec: null, measurement: 'estimated' })).toBe('<span class="dim">unknown</span>');
  });

  it('rounds a speed the way the page prints it, to a decimal below ten', () => {
    expect(speedFrom({ tokensPerSec: 8.44, measurement: 'measured' })).toBe('8.4 tok/s <span class="dim">measured</span>');
    expect(speedFrom({ tokensPerSec: 24.6, measurement: 'estimated' })).toBe('25 tok/s <span class="dim">estimated</span>');
    expect(speedFrom({ tokensPerSec: 9.97, measurement: 'measured' })).toBe('10 tok/s <span class="dim">measured</span>');
  });

  it('says when a price is for the card alone', () => {
    const card = data.hardware.find((h) => h.price_scope === 'card_only')!;
    const box = data.hardware.find((h) => h.price_scope !== 'card_only' && h.price_usd != null)!;
    expect(priceWithScope(card)).toContain('card only');
    expect(priceWithScope(box)).not.toContain('card only');
  });

  it('says it in plain text too, where a description or a card has no markup', () => {
    const card = data.hardware.find((h) => h.price_scope === 'card_only')!;
    const box = data.hardware.find((h) => h.price_scope !== 'card_only' && h.price_usd != null)!;
    expect(priceWithScopeText(card)).toBe(`${fmtUsd(card.price_usd)}, card only`);
    expect(priceWithScopeText(box)).toBe(fmtUsd(box.price_usd));
    expect(priceWithScopeText(card)).not.toContain('<');
  });

  it('says when a power figure is borrowed rather than measured', () => {
    const borrowed = data.hardware.filter((h) => h.load_watts_status === 'stand_in' && h.load_watts != null);
    const own = data.hardware.filter((h) => h.load_watts_status !== 'stand_in' && h.load_watts != null);
    expect(borrowed.length).toBeGreaterThan(0);
    expect(own.length).toBeGreaterThan(0);
    // the marker sits on the figure, where the reader meets it, and carries the watts
    // with it; "stand-in" carries its own hyphen, so it holds its line inside the marker
    for (const h of borrowed)
      expect(powerWithSource(h)).toBe(`${h.load_watts} W<span class="c-quant"><span class="nobreak">stand-in</span></span>`);
    // and a figure the data did get for the machine itself never wears one
    for (const h of own) expect(powerWithSource(h)).toBe(`${h.load_watts} W`);
    expect(powerWithSource({ ...own[0], load_watts: null })).toBe('<span class="dim">not published</span>');
  });

  it('names where a power figure came from in words rather than in the data’s own key', () => {
    for (const h of data.hardware) expect(powerSourceLabel(h)).not.toMatch(/_/);
    expect(powerSourceLabel(data.hardware.find((h) => h.load_watts_status === 'stand_in')!)).toBe('stand-in');
    expect(powerSourceLabel(data.hardware.find((h) => h.load_watts_status === 'third_party_measured')!)).toBe('measured by a third party');
    expect(powerSourceLabel(data.hardware.find((h) => h.load_watts_status === 'published')!)).toBe('published');
  });

  it('works the speed ratio out of the figures it prints, so the page divides out', () => {
    for (const [ida, idb] of [differ, same]) {
      const [va, vb] = [view(ida), view(idb)];
      const shared = strongestShared(va, vb)!;
      const verdict = machineVerdict(hw(ida), hw(idb), va, vb, data);
      const m = verdict.match(/about ([\d.]+)× faster: ([\d.]+) tok\/s against ([\d.]+)/);
      if (!m) continue;
      const printed = Number(m[2]) / Number(m[3]);
      expect(Math.abs(printed - Number(m[1]))).toBeLessThan(0.05);
      expect(Number(m[2])).toBe(Math.max(shownTps(shared.a)!, shownTps(shared.b)!));
      expect(Number(m[3])).toBe(Math.min(shownTps(shared.a)!, shownTps(shared.b)!));
    }
  });

  it('never calls one of two boxes built on the same hardware faster than the other', () => {
    const pairs = sameSiliconPairs(data);
    expect(pairs.length).toBeGreaterThan(0);
    for (const [a, b] of pairs) {
      const [va, vb] = [view(a.id), view(b.id)];
      const verdict = machineVerdict(a, b, va, vb, data);
      // two figures for one GPU are one part benchmarked twice; a page that picks a
      // winner out of them invents a difference its own data denies
      expect(verdict).not.toMatch(/× faster/);
      expect(verdict).toContain('are the same machine inside');
      expect(verdict).toContain(`${a.unified_memory_gb} GB of memory at ${a.memory_bandwidth_gbs} GB/s`);
    }
  });

  it('claims a like-for-like pay-back only when both columns run the same model', () => {
    for (const [ida, idb] of [differ, same]) {
      const [va, vb] = [view(ida), view(idb)];
      const verdict = machineVerdict(hw(ida), hw(idb), va, vb, data);
      const sameModel = fitsOf(va)[0].model.id === fitsOf(vb)[0].model.id;
      expect(/own strongest model/.test(verdict)).toBe(!sameModel);
    }
  });

  it('never calls a pay-back sooner than a figure it prints as equal to it', () => {
    // two machines at the same price can come out days apart over decades, and days do
    // not survive the rounding these pages print at. Where both sides print the same
    // figure the lede has to say both, or it argues with the table under it.
    let both = 0;
    for (const [a, b] of hardwarePairs(data)) {
      const verdict = machineVerdict(a, b, view(a.id), view(b.id), data);
      const m = verdict.match(/pays for itself sooner, in (.+?) against (.+?) at /);
      if (m) expect(m[1]).not.toBe(m[2]);
      if (/Both pay for themselves in/.test(verdict)) both++;
    }
    expect(both).toBeGreaterThan(0);
  });

  it('counts the models each machine holds the way the table does', () => {
    const [va, vb] = differ.map(view);
    const verdict = machineVerdict(hw(differ[0]), hw(differ[1]), va, vb, data);
    expect(verdict).toContain(`holds ${Math.max(fitsOf(va).length, fitsOf(vb).length)} of the ${va.rows.length} open models here`);
    expect(verdict).toContain(`holds ${Math.min(fitsOf(va).length, fitsOf(vb).length)}`);
  });

  it('names the cheaper machine and the real gap, and flags a card-only price', () => {
    const current = (h: Hardware) => h.price_usd != null && (h.generation ?? 'current') === 'current';
    const a = data.hardware.find((h) => current(h) && h.price_scope !== 'card_only')!;
    const b = data.hardware.find((h) => current(h) && h.price_scope === 'card_only')!;
    const verdict = machineVerdict(a, b, view(a.id), view(b.id), data);
    expect(verdict).toContain(`costs ${fmtUsd(Math.abs(a.price_usd! - b.price_usd!))} less`);
    // a bare card beside a whole computer is not a like-for-like price, and has to say so
    expect(verdict).toContain('priced as the card alone');
  });
});

describe('model head-to-heads', () => {
  const model = (id: string) => data.models.find((m) => m.id === id)!;
  const runners = (id: string) => runnersFor(model(id), data);
  // one pair whose two models start on different machines, one pair that starts on the
  // same machine, one where the cheaper start is a bare graphics card, and one where
  // nothing on the list runs one of the two
  const apart = ['gpt-oss-120b-mxfp4', 'ling-3.0-tiny-q4'] as const;
  const together = ['qwen3-30b-a3b-2507-q4', 'qwen3-coder-30b-a3b-q4'] as const;
  const card = ['granite-4.2-30b-q4', 'glm-4.7-flash-q4'] as const;
  const unrunnable = ['hunyuan-hy3-q4', 'ling-3.0-flash-q4'] as const;
  const verdictFor = ([ida, idb]: readonly [string, string]) => {
    const [a, b] = [model(ida), model(idb)];
    const [ra, rb] = [runners(ida), runners(idb)];
    return modelVerdict(a, b, ra, rb, cheapestRunsBoth(a, b, ra, rb), data);
  };
  // the guarantees below hold for every pair the site builds a page for, not for a
  // chosen few: a rule kept on three pages is not a rule
  const every = modelPairs(data).map(([a, b]) => {
    const [ra, rb] = [runnersFor(a, data), runnersFor(b, data)];
    const shared = cheapestRunsBoth(a, b, ra, rb);
    return { a, b, ra, rb, shared, verdict: modelVerdict(a, b, ra, rb, shared, data) };
  });

  it('considers only machines that are still sold and have a price', () => {
    for (const hw of machinesConsidered(data)) {
      expect(hw.price_usd).not.toBeNull();
      expect(hw.generation ?? 'current').toBe('current');
    }
    expect(machinesConsidered(data).length).toBeLessThan(data.hardware.length);
  });

  it('finds the cheapest machine that runs both, not the cheapest that runs either', () => {
    const [a, b] = apart.map(model);
    const [ra, rb] = apart.map(runners);
    const shared = cheapestRunsBoth(a, b, ra, rb)!;
    expect(shared).not.toBeNull();
    // it runs both, and every machine cheaper than it fails one of them
    expect(shared.rowA.fit.status).toBe('fits');
    expect(shared.rowB.fit.status).toBe('fits');
    const runsBoth = new Set(rb.map((r) => r.hw.id));
    for (const r of ra) {
      if (r.hw.id === shared.hw.id) break;
      expect(runsBoth.has(r.hw.id)).toBe(false);
    }
    expect(shared.hw.price_usd).toBeGreaterThanOrEqual(ra[0].hw.price_usd!);
  });

  it('lists only machines that run the one model and not the other', () => {
    const [ra, rb] = apart.map(runners);
    const inA = new Set(ra.map((r) => r.hw.id));
    const only = runsOnlyThere(rb, ra);
    for (const r of only) expect(inA.has(r.hw.id)).toBe(false);
    expect(only.length).toBe(rb.length - ra.filter((r) => rb.some((x) => x.hw.id === r.hw.id)).length);
  });

  it('works every speed ratio out of the figures it prints, so each page divides out', () => {
    let checked = 0;
    for (const { shared, verdict } of every) {
      const m = verdict.match(/about ([\d.]+)× quicker: ([\d.]+) tok\/s against ([\d.]+)/);
      if (!m) continue;
      checked++;
      const [hi, lo] = [Number(m[2]), Number(m[3])];
      // the ratio is the two printed figures divided, rounded the way the site rounds,
      // and nothing else: a reader dividing one figure on the page by the other gets it
      expect(m[1]).toBe(fmtNum(hi / lo, 1));
      expect(hi).toBe(Math.max(shownTps(shared!.rowA)!, shownTps(shared!.rowB)!));
      expect(lo).toBe(Math.min(shownTps(shared!.rowA)!, shownTps(shared!.rowB)!));
    }
    expect(checked).toBeGreaterThan(30);
  });

  it('calls two speeds the same only where the printed figures are within a twentieth', () => {
    for (const { shared, verdict } of every) {
      if (!shared) continue;
      const [ta, tb] = [shownTps(shared.rowA)!, shownTps(shared.rowB)!];
      expect(verdict.includes('much the same speed')).toBe(Math.max(ta, tb) / Math.min(ta, tb) < 1.05);
    }
  });

  it('never names a machine that does not run both, and never leaves a figure blank', () => {
    for (const { a, b, ra, rb, shared, verdict } of every) {
      if (shared) {
        expect(ra.some((r) => r.hw.id === shared.hw.id)).toBe(true);
        expect(rb.some((r) => r.hw.id === shared.hw.id)).toBe(true);
        expect(verdict).toContain(shortHardwareLabel(shared.hw));
      } else {
        expect(verdict).toContain('No machine on this list runs');
      }
      expect(verdict).not.toMatch(/undefined|NaN|—|\$[\d,]+\.\d\d less/);
      expect(verdict).toContain(a.display_name);
      expect(verdict).toContain(b.display_name);
    }
  });

  it('names the cheaper start, the real gap in whole dollars, and a card-only price', () => {
    const verdict = verdictFor(card);
    const [pa, pb] = card.map((id) => runners(id)[0].hw.price_usd!);
    expect(verdict).toContain(`${fmtUsd(Math.abs(pa - pb), { cents: false })} less`);
    expect(verdict).not.toMatch(/\$[\d,]+\.\d\d less/);
    // a bare graphics card is not a machine you can switch on, and the price says so
    expect(verdict).toContain('priced as the card alone');
  });

  it('pays back on the machine both models share, not on each one\'s own', () => {
    const [a, b] = apart.map(model);
    const [ra, rb] = apart.map(runners);
    const shared = cheapestRunsBoth(a, b, ra, rb)!;
    const verdict = modelVerdict(a, b, ra, rb, shared, data);
    expect(verdict).toContain(`the ${shortHardwareLabel(shared.hw)} pays for itself in`);
    for (const side of [shared.a, shared.b]) {
      const days = side.view.calc!.breakevenDays;
      if (days !== null) expect(verdict).toContain(fmtDuration(days));
    }
    // the machine each model starts on is cheaper than the one they share, and that
    // figure is a different one, so it must not be the one the pay-back sentence uses
    expect(ra[0].hw.id === rb[0].hw.id).toBe(false);
  });

  it('claims no machine where none runs one of the models', () => {
    const verdict = verdictFor(unrunnable);
    expect(runners(unrunnable[0]).length).toBe(0);
    expect(verdict).toContain(`No machine on this list runs ${model(unrunnable[0]).display_name}`);
    expect(verdict).toContain(`${model(unrunnable[1]).display_name} runs on the`);
  });
});

describe('tables between a phone and a full page', () => {
  const css = readFileSync(new URL('../public/page.css', import.meta.url), 'utf8');
  const band = css.match(/@media \(min-width: 641px\) and \(max-width: 1023px\) \{([\s\S]*?)\n\}/)?.[1] ?? '';

  it('covers every window between the phone layout and the full 980px measure', () => {
    // the phone stacks below 641px; above 1023px the page has all the width it
    // is ever given, so nothing in between may be left to swipe sideways
    expect(band).not.toBe('');
    expect(css).toContain('@media (max-width: 640px)');
  });

  it('lets every cell wrap there, so no column is pushed off the right edge', () => {
    expect(band).toContain('.board thead th, .board td, .board tbody th { white-space: normal;');
  });

  it('keeps a figure on one line, because half a number is worse than half a name', () => {
    expect(band).toMatch(/\.board \.c-score, \.board \.c-gb \{ white-space: nowrap; \}/);
  });

  it('lets a marker beside a figure wrap, so it cannot claim a column of its own', () => {
    // "card only, at launch" held to one line made Price 203px wide on the card
    // ranking, crushed every card name into four lines and pushed Speed on it
    // 60px past the table's own width at 641px. A marker is a phrase, not a figure.
    expect(band).toContain('.board .c-quant { white-space: normal; }');
    expect(band).not.toMatch(/\.c-quant[^{]*\{[^}]*nowrap/);
  });

  it('gives the score bar the width it has on a phone, so seven columns fit', () => {
    // the leaderboard's seven columns wanted 600px in the 597px a page gives them
    // at 641px, and the bar is the only thing in the row that carries no number
    expect(band).toContain('.board .c-score .bar { width: 46px; margin-right: 6px; }');
  });

  it('never holds a machine name, a class or a rival to one line at any width', () => {
    // the leaderboard names two machines a row; holding those to one line made
    // its table want 1253px against the 936px a page is ever given
    expect(css).toContain('.board .c-model, .board .answer-v, .board .c-hw, .board .c-tier, .board .c-vs { white-space: normal; }');
    expect(css).not.toMatch(/\.c-tier, \.c-gb, \.c-hw \{[^}]*nowrap/);
    expect(css).toContain('.c-gb { white-space: nowrap; }');
  });

  it('holds a one-word tier label together, so it never breaks at its own hyphen', () => {
    const haiku = data.models.find((m) => tierName(m, data) === 'Haiku-class')!;
    expect(tierLabel(haiku, data)).toBe('<span class="nobreak">Haiku-class</span>');
    expect(css).toContain('.nobreak { white-space: nowrap; }');
  });

  it('lets a tier label that is a phrase wrap between its words', () => {
    const bottom = data.models.find((m) => tierName(m, data).includes(' '))!;
    expect(tierLabel(bottom, data)).toBe(tierName(bottom, data));
    expect(tierLabel(bottom, data)).not.toContain('<span');
  });
});

describe('tables on a phone', () => {
  const table = `<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Speed at 32k</th><th>Pay-back</th><th></th></tr></thead>
<tbody><tr class="is-frontier"><th colspan="5">Same machine, more memory</th></tr><tr>
  <td><a href="/hardware/mac-mini-m6-16/">Mac mini M6, 16GB</a></td>
  <td>$899</td>
  <td>12 tok/s <span class="dim">estimated</span></td>
  <td>Pays back in 842 years</td>
  <td><a href="/?hw=mac-mini-m6-16">Run the numbers</a></td>
</tr></tbody>
</table>`;
  const marked = stack(table, { fig: 3 });
  const cell = (cls: string) => marked.match(new RegExp(`<td class="${cls}"[^>]*>([\\s\\S]*?)</td>`))?.[1] ?? '';

  it('leads the row with the column that answers the page', () => {
    expect(cell('k-fig')).toBe('Pays back in 842 years');
  });

  it('gives every other column its heading, so a figure is never bare', () => {
    expect(marked).toContain('<td class="k-sub" data-label="Price">$899</td>');
    expect(marked).toContain('data-label="Speed at 32k"');
    // the last column has no heading to borrow, so it gets none
    expect(marked).toContain('<td class="k-sub"><a href="/?hw=mac-mini-m6-16">Run the numbers</a></td>');
  });

  it('shortens a heading too long to sit in a row when asked', () => {
    const short = stack(table, { fig: 3, labels: { 2: 'Speed' } });
    expect(short).toContain('data-label="Speed"');
    expect(short).not.toContain('data-label="Speed at 32k"');
  });

  it('reads a cell that spans the row as a heading, not as a column', () => {
    expect(marked).toContain('<th colspan="5" class="k-wide">Same machine, more memory</th>');
  });

  it('keeps the wide screen exactly as it was, down to the words in every cell', () => {
    const text = (html: string) => html.replace(/<[^>]*>/g, '|').replace(/\|+/g, '|');
    expect(text(marked)).toBe(text(table));
    expect(marked).toContain('<table class="board stack">');
  });

  it('keeps a class the table already gave a cell', () => {
    const classed = stack(table.replace('<td>$899</td>', '<td class="c-gb">$899</td>'), { fig: 3 });
    expect(classed).toContain('<td class="k-sub c-gb" data-label="Price">$899</td>');
  });

  it('drops a column holding nothing but a dash, and keeps one drawn without words', () => {
    const dashed = stack(table.replace('<td>$899</td>', '<td>—</td>').replace('<td>12 tok/s <span class="dim">estimated</span></td>', '<td><span class="dot dot-green"></span></td>'), { fig: 3 });
    expect(dashed).toContain('<td class="k-sub k-none">—</td>');
    expect(dashed).toContain('<td class="k-sub" data-label="Speed at 32k"><span class="dot dot-green"></span></td>');
  });

  it('puts two narrow columns on one line, and says which of them closes it', () => {
    // Price and Speed each took a line of their own; together they take one
    const two = stack(table, { fig: 3, pair: [1, 2] });
    expect(two).toContain('<td class="k-sub k-pair" data-label="Price">$899</td>');
    expect(two).toContain('<td class="k-sub k-pair k-pair-end" data-label="Speed at 32k">12 tok/s');
    // everything else reads exactly as it did
    expect(two).toContain('<td class="k-sub"><a href="/?hw=mac-mini-m6-16">Run the numbers</a></td>');
    expect(two).toContain('<td class="k-fig">Pays back in 842 years</td>');
  });

  it('counts the figure out of the way, so a pair can skip over it', () => {
    // the figure is column 3, so columns 2 and 4 are neighbours on the line
    const over = stack(table, { fig: 3, pair: [2, 4] });
    expect(over).toContain('<td class="k-sub k-pair" data-label="Speed at 32k">12 tok/s');
    expect(over).toContain('<td class="k-sub k-pair k-pair-end"><a href="/?hw=mac-mini-m6-16">Run the numbers</a></td>');
  });

  it('keeps the wide screen exactly as it was when a table pairs', () => {
    const text = (html: string) => html.replace(/<[^>]*>/g, '|').replace(/\|+/g, '|');
    expect(text(stack(table, { fig: 3, pair: [1, 2] }))).toBe(text(table));
  });

  it('refuses a pair the grid cannot put on one line', () => {
    // columns 1 and 4 have column 2 between them, so the grid would break the line
    expect(() => stack(table, { fig: 3, pair: [1, 4] })).toThrow(/not next to each other/);
    expect(() => stack(table, { fig: 3, pair: [2, 1] })).toThrow(/left to right/);
    expect(() => stack(table, { fig: 3, pair: [0, 1] })).toThrow(/the name or the figure/);
    expect(() => stack(table, { fig: 3, pair: [2, 3] })).toThrow(/the name or the figure/);
  });

  it('refuses a pair where one column goes quiet in a row, rather than leaving the other half alone', () => {
    const quiet = table.replace('<td>$899</td>', '<td>—</td>');
    expect(() => stack(quiet, { fig: 3, pair: [1, 2] })).toThrow(/says nothing in one row/);
    const blank = table.replace('<td>$899</td>', '<td></td>');
    expect(() => stack(blank, { fig: 3, pair: [1, 2] })).toThrow(/says nothing in one row/);
  });

  it('gives a paired cell its own half of the row, and sets the closing half against the right edge', () => {
    const phone = readFileSync(new URL('../public/page.css', import.meta.url), 'utf8').match(
      /@media \(max-width: 640px\) \{([\s\S]*)\n\}/,
    )?.[1] ?? '';
    expect(phone).toContain('.board.stack .k-sub { grid-column: 1 / -1;');
    expect(phone).toContain('.board.stack .k-pair { grid-column: auto; }');
    expect(phone).toContain('.board.stack .k-pair-end { text-align: right; }');
    // the pair rule has to come after the one it overrides, or it never takes
    expect(phone.indexOf('.k-pair {')).toBeGreaterThan(phone.indexOf('.k-sub { grid-column'));
  });

  it('keeps a floor under the name, so a figure that is a sentence cannot crush it', () => {
    // Two machines on the site have no published price, so their row answers a
    // sentence where every other row answers a number. The right-hand track is
    // sized to what its cell wants and the left one gives up everything, so
    // without a floor the name beside that sentence was a character wide.
    const unpriced = data.hardware.filter((h) => h.price_usd == null);
    expect(unpriced.length).toBeGreaterThan(0);
    for (const h of unpriced)
      expect(verdictLine(computeView({ ...defaultState(data), hw: h.id }, data))).toBe('Not enough data to compute a pay-back.');
    const phone = readFileSync(new URL('../public/page.css', import.meta.url), 'utf8').match(
      /@media \(max-width: 640px\) \{([\s\S]*)\n\}/,
    )?.[1] ?? '';
    expect(phone).toContain('.board.stack tbody tr { display: grid; grid-template-columns: minmax(115px, 1fr) auto;');
  });

  it('lets the label beside a name wrap, so a phrase cannot run under the figure', () => {
    // A label holds one line everywhere else on the site, which is right for a
    // figure and wrong for a phrase: the longest tier label is four words, and
    // held to one line it ran past the name it sits beside and into the track
    // the figure is drawn in — 97 labels on 42 pages at 320px, up to 51px over.
    const phrases = data.defaults.frontier_tiers.map((t) => t.label).filter((l) => l.includes(' '));
    expect(phrases.length).toBeGreaterThan(0);
    const css = readFileSync(new URL('../public/page.css', import.meta.url), 'utf8');
    const phone = css.match(/@media \(max-width: 640px\) \{([\s\S]*)\n\}/)?.[1] ?? '';
    expect(phone).toContain('.board.stack .c-quant { display: inline; white-space: normal; }');
    // and a one-word label still holds its line, because the rule for that one
    // sits on the span tierLabel() puts around it rather than on the label
    expect(css).toContain('.nobreak { white-space: nowrap; }');
    expect(phone).not.toMatch(/\.board\.stack \.c-quant \{[^}]*nowrap/);
  });

  it('holds a hyphenated word inside a marker together, except where that would push the page out', () => {
    // "UD-Q4_K_M" broken after the UD, or a price standing in for "GLM-4.7-Flash"
    // broken after the 4.7, reads as a mistake in the data rather than one in the
    // layout. Five markers were doing exactly that on a phone.
    expect(holdHyphens('UD-Q4_K_M')).toBe('<span class="nobreak">UD-Q4_K_M</span>');
    expect(holdHyphens('priced as GLM-4.7-Flash')).toBe('priced as <span class="nobreak">GLM-4.7-Flash</span>');
    expect(holdHyphens('a moderate coding-assistant day')).toBe('a moderate <span class="nobreak">coding-assistant</span> day');
    expect(holdHyphens('card only, at launch')).toBe('card only, at launch');
    const css = readFileSync(new URL('../public/page.css', import.meta.url), 'utf8');
    const phone = css.match(/@media \(max-width: 640px\) \{([\s\S]*)\n\}/)?.[1] ?? '';
    // three columns on a phone give a cell about 95px, and "GLM-5.3-Flash" alone
    // is 96px of it, so in that one layout the hold gives way rather than push
    // the table and the page past the right edge
    expect(phone).toContain('.board.compare .nobreak { white-space: normal; }');
  });

  it('refuses a table it cannot mark up rather than shipping one that swipes', () => {
    expect(() => stack('<table class="board compare">x</table>', { fig: 1 })).toThrow(/board/);
    expect(() => stack('<table class="board">\n<tbody><tr><td>x</td></tr></tbody>\n</table>', { fig: 1 })).toThrow(/name its columns/);
    expect(() => stack(table, { fig: 5 })).toThrow(/no column 5/);
    expect(() => stack(table, { fig: 0 })).toThrow(/no column 0/);
  });
});

describe('the article in front of a machine name', () => {
  // Written out by hand, not derived, so a family whose name the rule reads
  // wrongly cannot pass by agreeing with itself. Every family the data holds
  // has to appear here, which is the next test.
  const BY_FAMILY: Record<string, 'a' | 'an'> = {
    'Mac mini': 'a',
    'Mac Studio': 'a',
    'MacBook Air': 'a',
    'MacBook Pro': 'a',
    'DGX Spark': 'a',
    'Strix Halo': 'a',
    NVIDIA: 'an',
    AMD: 'an',
  };

  it('covers every family on the site, so a new one has to be read out loud first', () => {
    const families = [...new Set(data.hardware.map((h) => h.family))].sort();
    expect(families).toEqual(Object.keys(BY_FAMILY).sort());
  });

  it('gives every machine the article a person would say', () => {
    for (const h of data.hardware) {
      expect([hardwareLabel(h), indefiniteArticle(hardwareLabel(h))]).toEqual([
        hardwareLabel(h),
        BY_FAMILY[h.family],
      ]);
    }
  });

  it('spells out a name set in capitals and answers on its first letter', () => {
    // en-VID-ia, ay-em-dee, are-tee-ex, aitch-pee, em-four: all open on a vowel
    for (const n of ['NVIDIA', 'AMD', 'RTX', 'HP', 'M4', 'IBM', 'SSD']) expect(indefiniteArticle(n)).toBe('an');
    // dee-gee-ex, gee-pee-you, bee-em-double-you
    for (const n of ['DGX', 'GPU', 'BMW', 'TPU']) expect(indefiniteArticle(n)).toBe('a');
  });

  it('reads a name that is a word as a word, whatever letter it starts with', () => {
    for (const n of ['Radeon', 'Mac', 'Strix Halo', 'Framework Desktop', 'MacBook Pro']) {
      expect(indefiniteArticle(n)).toBe('a');
    }
    for (const n of ['Apple', 'Intel', 'Arc A770', 'EVO-X2']) expect(indefiniteArticle(n)).toBe('an');
  });

  it('says "a" in front of a vowel that is read as a consonant', () => {
    for (const n of ['unified memory box', 'one-off build', 'usable machine']) {
      expect(indefiniteArticle(n)).toBe('a');
    }
  });

  it('reads only the first word, because the rest is not what you hear next', () => {
    expect(indefiniteArticle('Mac mini M6, 16GB')).toBe('a');
    expect(indefiniteArticle('NVIDIA GeForce RTX 3090, 24GB')).toBe('an');
  });
});

describe('what memory buys once two machines hold the same models', () => {
  const st = defaultState(data);
  it('stops at the longest context setting the machine still holds the model at', () => {
    const m = data.models.find((x) => x.id === 'ling-3.0-flash-q4')!;
    const spark = hw('nvidia-dgx-spark-128');
    const studio = hw('mac-studio-m5-max-128');
    // 78 GB of weights, and the cache it leaves room for is what the two differ by
    expect(longestContext(m, spark, data)).toBe(262144);
    expect(longestContext(m, studio, data)).toBe(131072);
    for (const [machine, ctx] of [[spark, 262144], [studio, 131072]] as const) {
      expect(footprintGb(m, ctx)!).toBeLessThanOrEqual(machine.usable_memory_gb!);
    }
    // and one setting further is past what it has
    expect(footprintGb(m, 262144)!).toBeGreaterThan(studio.usable_memory_gb!);
  });

  it('never takes a model past its own context limit', () => {
    for (const m of data.models) {
      for (const h of data.hardware) {
        const ctx = longestContext(m, h, data);
        if (ctx !== null && m.max_context_tokens != null) expect(ctx).toBeLessThanOrEqual(m.max_context_tokens);
      }
    }
  });

  it('names only the models the two machines take to different lengths', () => {
    const a = hw('macbook-pro-16-m5-pro-64');
    const b = hw('radeon-ai-pro-r9700-32');
    const counted = computeView({ ...st, hw: a.id }, data).rows.map((r) => r.model);
    const rows = contextHeadroom(counted, a, b, data);
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) expect(r.a).not.toBe(r.b);
    // 48 GB against 31 GB, so it is always the roomier machine that goes further
    for (const r of rows) expect(r.a ?? 0).toBeGreaterThan(r.b ?? 0);
    // and every model left out reaches the same length on both
    const named = new Set(rows.map((r) => r.model.id));
    for (const m of counted.filter((x) => !named.has(x.id))) {
      expect(longestContext(m, a, data)).toBe(longestContext(m, b, data));
    }
  });

  it('counts the shared models as the ones the tighter machine holds, in the page\'s own order', () => {
    const roomier = hw('rtx-pro-6000-blackwell-96');
    const tighter = hw('radeon-ai-pro-r9700-32');
    const tighterView = computeView({ ...st, hw: tighter.id }, data);
    const rows = sharedHeadroom(roomier, tighter, tighterView, data);
    const shared = fitsOf(tighterView).map((r) => r.model.id);
    expect(rows.length).toBeGreaterThan(0);
    // nothing the tighter machine cannot hold at the context the page prices
    for (const r of rows) expect(shared).toContain(r.model.id);
    // the roomier machine is the one that goes further, on every row
    for (const r of rows) expect(r.a ?? 0).toBeGreaterThan(r.b ?? 0);
    // and the order is the view's, strongest model first
    expect(rows.map((r) => shared.indexOf(r.model.id))).toEqual([...rows.map((r) => shared.indexOf(r.model.id))].sort((x, y) => x - y));
  });

  it('leaves out every shared model the two machines take to the same length', () => {
    const roomier = hw('rtx-pro-6000-blackwell-96');
    const tighter = hw('radeon-ai-pro-r9700-32');
    const tighterView = computeView({ ...st, hw: tighter.id }, data);
    const named = new Set(sharedHeadroom(roomier, tighter, tighterView, data).map((r) => r.model.id));
    for (const r of fitsOf(tighterView)) {
      if (named.has(r.model.id)) continue;
      expect(longestContext(r.model, roomier, data)).toBe(longestContext(r.model, tighter, data));
    }
  });

  it('names the model whose two windows are furthest apart, as a ratio rather than a gap', () => {
    const roomier = hw('rtx-pro-6000-blackwell-96');
    const tighter = hw('radeon-ai-pro-r9700-32');
    const tighterView = computeView({ ...st, hw: tighter.id }, data);
    const rows = sharedHeadroom(roomier, tighter, tighterView, data);
    const widest = widestHeadroom(rows)!;
    expect(widest).not.toBeNull();
    const ratio = (r: { a: number | null; b: number | null }) => (r.a ?? 0) / (r.b ?? 1);
    for (const r of rows) expect(ratio(r)).toBeLessThanOrEqual(ratio(widest));
    // 32k to 256k beats 128k to 256k, though the second is the larger number of tokens
    expect(ratio(widest)).toBe(8);
    expect(widest.a).toBe(262144);
    expect(widest.b).toBe(32768);
  });

  it('keeps the page\'s order on a tie, and has nothing to name when nothing differs', () => {
    expect(widestHeadroom([])).toBeNull();
    const m = (id: string) => data.models.find((x) => x.id === id)!;
    const first = { model: m('gemma-4-12b-q4'), a: 262144, b: 32768 };
    const second = { model: m('gemma-4-31b-q4'), a: 131072, b: 16384 };
    expect(widestHeadroom([first, second])).toBe(first);
    expect(widestHeadroom([second, first])).toBe(second);
    // a row the tighter machine cannot hold at any length is not a gap that can be measured
    expect(widestHeadroom([{ model: m('gemma-4-12b-q4'), a: 262144, b: null }])).toBeNull();
  });

  it('finds nothing to say where the two machines are the same size', () => {
    const a = hw('mac-studio-m5-max-128');
    const b = hw('gmktec-evo-x2-128');
    const counted = computeView({ ...st, hw: a.id }, data).rows.map((r) => r.model);
    expect(contextHeadroom(counted, a, b, data)).toEqual([]);
  });

  it('says what stopped a longest-context figure, so a page can only claim what is true', () => {
    const options = [...data.defaults.context.options].sort((a, b) => a - b);
    const top = options[options.length - 1];
    // a model whose own limit falls between two settings: Qwen3 32B stops at 40k,
    // so 32k is the last setting under it and no machine here is the reason
    const qwen = data.models.find((x) => x.id === 'qwen3-32b-q4')!;
    expect(qwen.max_context_tokens).toBe(40960);
    expect(contextCappedBy(qwen, 32768, data)).toBe('model');
    // a model whose limit is above everything the calculator offers
    const inkling = data.models.find((x) => x.id === 'inkling-small-ud-q4')!;
    expect(inkling.max_context_tokens!).toBeGreaterThan(top);
    expect(contextCappedBy(inkling, top, data)).toBe('list');
    // and one where the two run out together
    const coder = data.models.find((x) => x.id === 'qwen3-coder-next-q4')!;
    expect(coder.max_context_tokens).toBe(top);
    expect(contextCappedBy(coder, top, data)).toBe('both');
    // anything short of both is the machine's memory
    const llama = data.models.find((x) => x.id === 'llama-3.3-70b-q4')!;
    expect(contextCappedBy(llama, 32768, data)).toBe('memory');
  });

  it('only calls memory the cap where another setting was really available', () => {
    // the rule the pages lean on: where this says 'memory', the next setting up is
    // one the model itself allows, so more memory would have bought it
    const options = [...data.defaults.context.options].sort((a, b) => a - b);
    for (const m of data.models) {
      for (const h of data.hardware) {
        const ctx = longestContext(m, h, data);
        if (ctx === null || contextCappedBy(m, ctx, data) !== 'memory') continue;
        const next = options.find((o) => o > ctx)!;
        expect(next).toBeDefined();
        if (m.max_context_tokens != null) expect(next).toBeLessThanOrEqual(m.max_context_tokens);
        expect(footprintGb(m, next)!).toBeGreaterThan(h.usable_memory_gb!);
      }
    }
  });

  it('only offers a shorter window where one really changes the answer', () => {
    // what the machine pages print: every pair here misses at the context the site
    // prices everything at, holds at the window named, and holds at nothing longer
    const ctx = data.defaults.context.default_tokens;
    const options = [...data.defaults.context.options].sort((a, b) => a - b);
    let pairs = 0;
    for (const h of data.hardware) {
      for (const r of fitsShorter(h, data.models, data)) {
        pairs++;
        expect(r.ctx).toBeLessThan(ctx);
        expect(footprintGb(r.model, r.ctx)!).toBeLessThanOrEqual(h.usable_memory_gb!);
        expect(footprintGb(r.model, ctx)!).toBeGreaterThan(h.usable_memory_gb!);
        const next = options.find((o) => o > r.ctx)!;
        expect(footprintGb(r.model, next)!).toBeGreaterThan(h.usable_memory_gb!);
        expect(r.ctx).toBe(longestContext(r.model, h, data));
        expect(r.needGb).toBeCloseTo(footprintGb(r.model, r.ctx)!, 6);
        expect(r.needAtDefaultGb).toBeCloseTo(footprintGb(r.model, ctx)!, 6);
        expect(r.needGb).toBeLessThan(r.needAtDefaultGb);
      }
    }
    expect(pairs).toBeGreaterThan(0);
  });

  it('never offers a window the model itself does not allow, and stays quiet where nothing is gained', () => {
    // the page reads a shorter window as this machine's doing, so the window it
    // names has to be one the model would have run at anyway
    for (const h of data.hardware) {
      for (const r of fitsShorter(h, data.models, data)) {
        if (r.model.max_context_tokens != null) expect(r.ctx).toBeLessThanOrEqual(r.model.max_context_tokens);
      }
    }
    // a machine that holds every model at the default context has nothing to add
    const ctx = data.defaults.context.default_tokens;
    const roomy = data.hardware.filter((h) => data.models.every((m) => (footprintGb(m, ctx) ?? Infinity) <= (h.usable_memory_gb ?? 0)));
    for (const h of roomy) expect(fitsShorter(h, data.models, data)).toEqual([]);
  });

  it('names the same rows from the model\'s side as from the machine\'s', () => {
    // a model page's section is the machine pages' one read the other way round, so
    // every machine it names has to be one that page's own model appears on, and at
    // the same window. The two differ only in what they leave out: the model side
    // keeps one machine per family and only weighs machines worth buying.
    const ctx = data.defaults.context.default_tokens;
    const considered = new Set(machinesConsidered(data).map((h) => h.id));
    const fromMachines = new Map<string, number>();
    for (const h of data.hardware) {
      if (!considered.has(h.id)) continue;
      for (const r of fitsShorter(h, data.models, data)) fromMachines.set(`${r.model.id}|${h.id}`, r.ctx);
    }
    let rows = 0;
    for (const m of data.models) {
      const seen = new Set<string>();
      let last = -Infinity;
      for (const r of machinesShorter(m, data)) {
        rows++;
        expect(fromMachines.get(`${m.id}|${r.hw.id}`)).toBe(r.ctx);
        expect(considered.has(r.hw.id)).toBe(true);
        // one machine per family, cheapest first
        expect(seen.has(r.hw.family)).toBe(false);
        seen.add(r.hw.family);
        expect(r.hw.price_usd!).toBeGreaterThanOrEqual(last);
        last = r.hw.price_usd!;
      }
    }
    expect(rows).toBeGreaterThan(0);
  });

  it('never names a machine the model already runs on at the default context', () => {
    // the two tables on a model page answer different questions, and a machine in
    // both would read as a contradiction: it runs it, and it does not
    const ctx = data.defaults.context.default_tokens;
    const options = [...data.defaults.context.options].sort((a, b) => a - b);
    for (const m of data.models) {
      const runs = new Set(runnersFor(m, data).map((r) => r.hw.id));
      for (const r of machinesShorter(m, data)) {
        expect(runs.has(r.hw.id)).toBe(false);
        expect(r.ctx).toBeLessThan(ctx);
        expect(r.ctx).toBe(longestContext(m, r.hw, data));
        if (m.max_context_tokens != null) expect(r.ctx).toBeLessThanOrEqual(m.max_context_tokens);
        expect(r.needGb).toBeCloseTo(footprintGb(m, r.ctx)!, 6);
        expect(r.needGb).toBeLessThanOrEqual(r.hw.usable_memory_gb!);
        // and the next setting up really is out of reach, or the row is claiming a
        // limit the machine does not have
        const next = options.find((o) => o > r.ctx)!;
        expect(footprintGb(m, next)!).toBeGreaterThan(r.hw.usable_memory_gb!);
      }
      // a model every considered machine holds at the default context has nothing here
      if (machinesConsidered(data).every((h) => (footprintGb(m, ctx) ?? Infinity) <= (h.usable_memory_gb ?? 0)))
        expect(machinesShorter(m, data)).toEqual([]);
    }
  });

  it('writes a context the way the calculator does', () => {
    expect(ctxLabel(32768)).toBe('32k');
    expect(ctxLabel(4096)).toBe('4k');
    expect(ctxLabel(262144)).toBe('256k');
  });

  it('opens the calculator on the configuration the length was measured at', () => {
    // Machine pages and model pages both print the longest context a machine holds
    // a model at and make that figure the way in. The link is only honest if the calculator reads
    // back the same machine, the same model and the same length — and if that
    // configuration still fits once it gets there. The cache type is the quiet
    // one: longestContext() measures at the dataset's default, and the query
    // string leaves that out when it is the default, so the two have to agree.
    expect(defaultState(data).kv).toBe(data.defaults.kv_cache?.default ?? 'f16');
    let checked = 0;
    for (const h of data.hardware) {
      for (const m of data.models) {
        const ctx = longestContext(m, h, data);
        if (ctx === null) continue;
        const href = calcLink({ hw: h.id, model: m.id, ctx }, data);
        const back = parseState(href.slice(href.indexOf('?')), data);
        expect(back.hw).toBe(h.id);
        expect(back.model).toBe(m.id);
        expect(back.ctx).toBe(ctx);
        expect(back.kv).toBe(defaultState(data).kv);
        expect(footprintGb(m, ctx)!).toBeLessThanOrEqual(h.usable_memory_gb!);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(600);
  });

  it("opens the leaderboard's cheapest machine on the model in that row", () => {
    // The leaderboard's "Cheapest machine that runs it" column names a machine and a
    // price, and the price is the way into the calculator. That link carries no context,
    // so it lands on the calculator's default — which has to be the same context the
    // column was worked out at, or the reader arrives at a configuration the row does
    // not describe.
    const ctx = data.defaults.context.default_tokens;
    let checked = 0;
    for (const m of data.models) {
      const cheapest = cheapestPerFamily(runnersFor(m, data)).slice().sort((a, b) => a.hw.price_usd! - b.hw.price_usd!)[0];
      if (!cheapest) continue;
      const href = calcLink({ hw: cheapest.hw.id, model: m.id }, data);
      const back = parseState(href.slice(href.indexOf('?')), data);
      expect(back.hw).toBe(cheapest.hw.id);
      expect(back.model).toBe(m.id);
      expect(back.ctx).toBe(ctx);
      expect(computeView(back, data).model?.id).toBe(m.id);
      checked++;
    }
    expect(checked).toBeGreaterThan(40);
  });

  it('names the cheapest machine that runs a model nothing holds at the default context', () => {
    // The leaderboard's machine column is measured at the context the site prices
    // everything at. Where nothing holds a model there, the cell falls back to the
    // machine that holds it at a shorter window — and the column calls that machine
    // the cheapest, so the claim has to be true of the whole list rather than of the
    // one machine per family the helper keeps: no cheaper machine may hold the model
    // at any window the calculator offers. The link carries that window, so it also
    // has to read back as the pair the row prints, still fitting when it arrives.
    const ctx = data.defaults.context.default_tokens;
    let checked = 0;
    for (const m of data.models) {
      if (cheapestPerFamily(runnersFor(m, data)).length) continue;
      const shorter = machinesShorter(m, data)[0];
      if (!shorter) {
        // a model no machine holds at any window may promise nothing
        for (const h of machinesConsidered(data)) expect(longestContext(m, h, data)).toBeNull();
        continue;
      }
      for (const h of machinesConsidered(data)) {
        if (h.price_usd! >= shorter.hw.price_usd!) continue;
        expect(longestContext(m, h, data)).toBeNull();
      }
      const href = calcLink({ hw: shorter.hw.id, model: m.id, ctx: shorter.ctx }, data);
      const back = parseState(href.slice(href.indexOf('?')), data);
      expect(back.hw).toBe(shorter.hw.id);
      expect(back.model).toBe(m.id);
      expect(back.ctx).toBe(shorter.ctx);
      expect(back.ctx).toBeLessThan(ctx);
      expect(computeView(back, data).model?.id).toBe(m.id);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('never sends a model page reader to a shorter window than the row is priced at', () => {
    // Every other figure in a model page's row — the speed, the pay-back — is
    // quoted at the context the page assumes, and the machines listed are the ones
    // that hold the model there. So the length beside them can only ever be that
    // context or longer, and the way in cannot quietly downgrade the reader.
    const ctx = data.defaults.context.default_tokens;
    let checked = 0;
    for (const m of data.models) {
      for (const r of cheapestPerFamily(runnersFor(m, data))) {
        const holds = longestContext(m, r.hw, data);
        expect(holds).not.toBeNull();
        expect(holds!).toBeGreaterThanOrEqual(ctx);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(300);
  });
});

describe('the machines that miss a model altogether', () => {
  const ctx = data.defaults.context.default_tokens;
  const shortest = Math.min(...data.defaults.context.options);

  it('names only machines that hold the model at no window at all', () => {
    let rows = 0;
    for (const m of data.models) {
      const runs = new Set(runnersFor(m, data).map((r) => r.hw.id));
      const shorter = new Set(machinesShorter(m, data).map((r) => r.hw.id));
      for (const r of missedMachines(m, data)) {
        rows++;
        // the three tables on a model page answer different questions, and a
        // machine in two of them would read as a contradiction
        expect(runs.has(r.hw.id)).toBe(false);
        expect(shorter.has(r.hw.id)).toBe(false);
        expect(longestContext(m, r.hw, data)).toBeNull();
        for (const option of data.defaults.context.options) {
          if (m.max_context_tokens != null && option > m.max_context_tokens) continue;
          expect(footprintGb(m, option)!).toBeGreaterThan(r.hw.usable_memory_gb!);
        }
      }
    }
    expect(rows).toBeGreaterThan(0);
  });

  it('measures the gap at the shortest window the calculator offers', () => {
    // the kindest reading a machine can get: anything longer would overstate how
    // far short it falls, and the page prints the figure as the whole answer
    for (const m of data.models) {
      for (const r of missedMachines(m, data)) {
        expect(r.needGb).toBeCloseTo(footprintGb(m, shortest)!, 6);
        expect(r.shortGb).toBeCloseTo(r.needGb - r.hw.usable_memory_gb!, 6);
        expect(r.shortGb).toBeGreaterThan(0);
      }
    }
  });

  it('keeps one machine per family, the one that comes closest, nearest first', () => {
    for (const m of data.models) {
      const out = missedMachines(m, data);
      const seen = new Set<string>();
      let last = -Infinity;
      for (const r of out) {
        expect(seen.has(r.hw.family)).toBe(false);
        seen.add(r.hw.family);
        expect(r.shortGb).toBeGreaterThanOrEqual(last);
        last = r.shortGb;
        // the row a family gets is its roomiest machine, not any other
        const roomiest = Math.max(
          ...machinesConsidered(data).filter((h) => h.family === r.hw.family && longestContext(m, h, data) == null).map((h) => h.usable_memory_gb ?? 0),
        );
        expect(r.hw.usable_memory_gb).toBe(roomiest);
      }
    }
  });

  it('leaves out no family that misses the model, and adds none that does not', () => {
    for (const m of data.models) {
      const misses = machinesConsidered(data).filter((h) => longestContext(m, h, data) == null);
      expect(new Set(missedMachines(m, data).map((r) => r.hw.family))).toEqual(new Set(misses.map((h) => h.family)));
    }
  });

  it('is empty for a model every machine here holds', () => {
    for (const m of data.models) {
      if (machinesConsidered(data).every((h) => (footprintGb(m, ctx) ?? Infinity) <= (h.usable_memory_gb ?? 0))) {
        expect(missedMachines(m, data)).toEqual([]);
      }
    }
  });
});

describe('the graphics cards, as a list of their own', () => {
  const cards = graphicsCards(data);

  it('holds every card priced as a card, and nothing with a computer around it', () => {
    const priced = data.hardware.filter((h) => h.price_scope === 'card_only' && h.price_usd != null);
    expect(cards.map((c) => c.id).sort()).toEqual(priced.map((c) => c.id).sort());
    for (const c of cards) expect(c.price_scope).toBe('card_only');
  });

  it('orders them by the thing that decides what runs, then by price', () => {
    for (let i = 1; i < cards.length; i++) {
      const [before, after] = [cards[i - 1], cards[i]];
      expect(before.usable_memory_gb!).toBeGreaterThanOrEqual(after.usable_memory_gb!);
      if (before.usable_memory_gb === after.usable_memory_gb)
        expect(before.price_usd!).toBeLessThanOrEqual(after.price_usd!);
    }
  });

  it('sets each card against a complete computer, never against another card', () => {
    for (const c of cards) {
      const rival = nearestCompleteComputer(c, data);
      expect(rival).not.toBeNull();
      expect(rival!.price_scope).not.toBe('card_only');
      expect(rival!.generation ?? 'current').toBe('current');
      // nothing on sale is nearer that card's price than the one chosen
      const nearest = Math.min(
        ...data.hardware
          .filter((h) => h.price_scope !== 'card_only' && h.price_usd != null && (h.generation ?? 'current') === 'current' && h.usable_memory_gb != null)
          .map((h) => Math.abs(h.price_usd! - c.price_usd!)),
      );
      expect(Math.abs(rival!.price_usd! - c.price_usd!)).toBe(nearest);
    }
  });

  it('prices each gigabyte from the figures the page prints beside it', () => {
    for (const c of cards) expect(pricePerUsableGb(c)).toBeCloseTo(c.price_usd! / c.usable_memory_gb!, 6);
    expect(pricePerUsableGb({ ...cards[0], price_usd: null })).toBeNull();
  });
});

describe('what a million tokens costs', () => {
  const st = defaultState(data);
  const machine = costMachine(data);
  const view = computeView({ ...st, hw: machine.id }, data);
  const model = view.model!;
  const tps = rowFor(view, model)!.throughput.tokensPerSec!;

  it('prices both sides from the figures the page prints beside them', () => {
    const cost = tokenCost(model, machine, tps, data)!;
    const ce = model.cloud_equivalent;
    const out = MTOK / (st.ratio + 1);
    const input = MTOK - out;
    // the API bills the context you send as well as the answer you get
    expect(cost.rented).toBeCloseTo((input / MTOK) * ce.input_price_per_mtok! + (out / MTOK) * ce.output_price_per_mtok!, 9);
    // at home you pay for the watts the machine draws while it writes the answer
    expect(cost.generated).toBeCloseTo((out / tps / 3600) * (machine.load_watts! / 1000) * st.kwh, 9);
    expect(cost.gap).toBeCloseTo(cost.rented - cost.generated, 9);
    // the gap is what one million saves, so the count is the price divided by it, in millions
    expect(cost.breakevenTokens).toBeCloseTo((machine.price_usd! / cost.gap) * MTOK, -1);
  });

  it('counts break-even in tokens, which does not move with how much you use it', () => {
    // The page rests on this: the saving on each million is a constant at today's
    // prices held flat, so the count that covers the machine is the same at every
    // level of use and only the date changes. Switch the API decline on and it is
    // no longer true, which is why the build checks it as well.
    let checked = 0;
    for (const { row, cost } of tokenCosts(machine, data)) {
      const counts = bestUsageLevels(data).map(
        (l) => computeView({ ...st, hw: machine.id, model: row.model.id, usage: l.usage }, data).calc?.breakevenTokens ?? null,
      );
      for (const c of counts) {
        if (cost.breakevenTokens == null) expect(c).toBeNull();
        else expect(c!).toBeCloseTo(cost.breakevenTokens, 0);
      }
      checked++;
    }
    expect(checked).toBeGreaterThan(20);
  });

  it('prices every model the machine holds, cheapest to pay it back first', () => {
    const costs = tokenCosts(machine, data);
    const held = fitsOf(computeView({ ...st, hw: machine.id }, data)).filter((r) => r.model.generation !== 'legacy');
    expect(costs.length).toBe(held.length);
    for (const c of costs) {
      expect(c.row.fit.status).toBe('fits');
      expect(c.cost.rented).toBeGreaterThanOrEqual(0);
      expect(c.cost.generated).toBeGreaterThan(0);
    }
    const order = costs.map((c) => c.cost.breakevenTokens ?? Infinity);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('writes a sub-dollar price in cents rather than rounding it to nothing', () => {
    expect(fmtPerMtok(1.773)).toBe('$1.77');
    expect(fmtPerMtok(0.456)).toBe('45.6c');
    expect(fmtPerMtok(0.0173)).toBe('1.7c');
    expect(fmtPerMtok(0.0021)).toBe('0.21c');
    expect(fmtPerMtok(0)).toBe('nothing');
    for (const { cost } of tokenCosts(machine, data)) {
      expect(fmtPerMtok(cost.generated)).not.toBe('$0.00');
      expect(fmtPerMtok(cost.generated)).not.toBe('0.00c');
    }
  });
});

describe('what a price on the page buys', () => {
  const cards = data.hardware.filter((h) => h.price_scope === 'card_only');
  const computers = data.hardware.filter((h) => h.price_scope !== 'card_only');

  it('says nothing about graphics cards where none of the machines is one', () => {
    expect(cardScopeNote([computers[0], computers[1]])).toBe('');
    expect(cardScopeNote(computers)).toBe('');
    expect(cardScopeNote([])).toBe('');
  });

  it('names the card where exactly one of them is a card', () => {
    const note = cardScopeNote([computers[0], cards[0]]);
    expect(note).toContain(shortHardwareLabel(cards[0]));
    expect(note).toContain('priced as the card alone');
    expect(note).not.toContain(shortHardwareLabel(computers[0]));
  });

  it('names it in a list of machines too, not only in a pair', () => {
    expect(cardScopeNote([...computers.slice(0, 5), cards[0]])).toContain(shortHardwareLabel(cards[0]));
  });

  it('does not send the reader looking for which one it means where both are cards', () => {
    const note = cardScopeNote([cards[0], cards[1]]);
    expect(note).toBe('Both are priced as the card alone, so neither figure includes the PC to put it in.');
    expect(note).not.toContain(shortHardwareLabel(cards[0]));
  });

  it('falls back to the general sentence where a list holds several cards', () => {
    const note = cardScopeNote([computers[0], cards[0], cards[1]]);
    expect(note).toBe('Graphics cards are priced as the card alone, so add the PC around one before comparing it with a complete computer.');
  });

  it('counts a machine listed twice once', () => {
    expect(cardScopeNote([cards[0], cards[0], computers[0]])).toContain(shortHardwareLabel(cards[0]));
    expect(cardScopeNote([cards[0], cards[0]])).toBe(cardScopeNote([cards[0]]));
  });

  it('escapes the name it prints, because the note goes into the page as markup', () => {
    const odd = { ...cards[0], chip: 'Card <b>&</b>', price_scope: 'card_only' } as Hardware;
    const note = cardScopeNote([odd, computers[0]]);
    expect(note).not.toContain('<b>');
    expect(note).toContain('&amp;');
  });
});

describe('where a page that prices a card says the cards are ranked', () => {
  const cards = data.hardware.filter((h) => h.price_scope === 'card_only');
  const computers = data.hardware.filter((h) => h.price_scope !== 'card_only');
  const line = cardRankingLine(data);

  it('counts the cards the ranking itself counts, in words', () => {
    expect(line).toBe(`All ${numberWord(graphicsCards(data).length)} cards here are <a href="/best-gpu/#every-card-here-side-by-side">ranked by what each one holds</a>.`);
    expect(line).not.toMatch(/\d/);
    expect(line.endsWith('.')).toBe(true);
  });

  it('follows the caveat rather than replacing it', () => {
    const note = cardScopeNote([computers[0], cards[0]], data);
    expect(note).toBe(`${cardScopeNote([computers[0], cards[0]])} ${line}`);
    expect(note).toContain(shortHardwareLabel(cards[0]));
  });

  it('is said once however many cards the page prices', () => {
    for (const machines of [[computers[0], cards[0]], [cards[0], cards[1]], [computers[0], cards[0], cards[1]]])
      expect(cardScopeNote(machines, data).match(/href="\/best-gpu\/(?:#[^"]*)?"/g)).toHaveLength(1);
  });

  it('is never said on its own, where the page prices no card at all', () => {
    expect(cardScopeNote([computers[0], computers[1]], data)).toBe('');
    expect(cardScopeNote([], data)).toBe('');
  });

  it('is left out where the page is asked for the caveat alone', () => {
    const note = cardScopeNote([computers[0], cards[0]]);
    expect(note).not.toContain('/best-gpu/');
    expect(note).toContain('priced as the card alone');
  });
});

describe('what the machine index says about its own prices', () => {
  const unpriced = data.hardware.filter((h) => h.price_usd == null);
  const priced = data.hardware.filter((h) => h.price_usd != null);
  const fleet = (kit: Hardware[]) => ({ ...data, hardware: kit }) as Dataset;

  it('counts the machines with a published price and names the ones without', () => {
    const line = publishedPriceLine(data);
    expect(line).toContain(`${priced.length} of them carry a published price.`);
    for (const h of unpriced) expect(line).toContain(shortHardwareLabel(h));
    for (const h of priced) expect(line).not.toContain(shortHardwareLabel(h));
    expect(line.endsWith('.')).toBe(true);
  });

  it('says every one of them where every one of them is priced', () => {
    expect(publishedPriceLine(fleet(priced))).toBe('Every one of them carries a published price.');
  });

  it('keeps its singulars where one machine has no price', () => {
    const line = publishedPriceLine(fleet([priced[0], unpriced[0]]));
    expect(line).toBe(
      `One of them carries a published price. The ${shortHardwareLabel(unpriced[0])} does not, so its row opens the calculator for you to put in what you would pay.`,
    );
  });

  it('counts the priced ones rather than listing them', () => {
    const line = publishedPriceLine(fleet([...priced.slice(0, 3), ...unpriced]));
    expect(line).toBe(
      `3 of them carry a published price. The ${shortHardwareLabel(unpriced[0])} and the ${shortHardwareLabel(unpriced[1])} do not, so their rows open the calculator for you to put in what you would pay.`,
    );
  });
});

describe('one row a model on the leaderboard', () => {
  const scored = data.models
    .filter((m) => m.frontier_equivalent?.score != null)
    .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!);
  const rows = leaderboardRows(scored, data);

  it('gives every model one row and leaves no build unnamed', () => {
    const names = rows.map((r) => r.model.display_name);
    expect(new Set(names).size).toBe(names.length);
    const named = rows.flatMap((r) => [r.model.id, ...r.alsoAt.map((o) => o.id)]);
    expect(new Set(named).size).toBe(named.length);
    for (const m of scored) expect(named).toContain(m.id);
  });

  it('keeps the lightest build and names the heavier one beside it', () => {
    for (const r of rows) {
      for (const o of r.alsoAt) expect(o.weights_gb ?? 0).toBeGreaterThanOrEqual(r.model.weights_gb ?? 0);
      expect(r.alsoAt.every((o) => o.display_name === r.model.display_name)).toBe(true);
    }
    const doubled = rows.filter((r) => r.alsoAt.length);
    expect(doubled.length).toBeGreaterThan(0);
  });

  it('keeps the score order it is handed', () => {
    const scores = rows.map((r) => r.model.frontier_equivalent!.score!);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it('never gives the row to a build the index has not scored', () => {
    const q8 = data.models.find((m) => m.id === 'qwen3-32b-q8');
    const q4 = data.models.find((m) => m.id === 'qwen3-32b-q4');
    expect(q8 && q4).toBeTruthy();
    const unscored = { ...q4!, frontier_equivalent: { ...q4!.frontier_equivalent!, score: null } } as typeof q4;
    const set = { ...data, models: [unscored!, q8!] } as Dataset;
    const [row] = leaderboardRows([q8!], set);
    expect(row.model.id).toBe('qwen3-32b-q8');
    expect(row.alsoAt.map((o) => o.id)).toEqual(['qwen3-32b-q4']);
  });

  it('counts the models with a second build, in words', () => {
    expect(leaderboardBuildsLine(rows)).toContain('two of them are also priced at a heavier quantisation');
    expect(leaderboardBuildsLine([{ alsoAt: [data.models[0]] }])).toContain('one of them is also priced');
  });

  it('says nothing about builds where every model is priced once', () => {
    expect(leaderboardBuildsLine([{ alsoAt: [] }, { alsoAt: [] }])).toBe('');
  });
});

describe('the way back to the indexes', () => {
  it('names every index once, and the calculator', () => {
    const foot = footerHtml();
    for (const { href } of FOOTER_LINKS) expect(foot.match(new RegExp(`href="${href}"`, 'g'))).toHaveLength(1);
    expect(foot.match(/<a /g)).toHaveLength(FOOTER_LINKS.length);
    expect(FOOTER_LINKS.map((l) => l.href)).toContain('/compare/');
    expect(FOOTER_LINKS.map((l) => l.href)).toContain('/hardware/');
  });

  it('sends the reader to a page rather than to a redirect', () => {
    for (const { href } of FOOTER_LINKS) expect(href.endsWith('/')).toBe(true);
  });

  it('says what each one answers rather than naming the address', () => {
    for (const { label } of FOOTER_LINKS) {
      expect(label.length).toBeGreaterThan(12);
      expect(label).not.toMatch(/^\//);
    }
    expect(new Set(FOOTER_LINKS.map((l) => l.label)).size).toBe(FOOTER_LINKS.length);
  });

  it('is the footer every generated page ends with', () => {
    const html = pageShell(
      { title: 'T', description: 'D', canonical: '/models/x/', crumbs: [{ href: '/', label: 'Sunk Cost' }] },
      '<article class="prose"><h1>T</h1></article>',
      data,
    );
    expect(html).toContain(footerHtml());
    expect(html.match(/<footer/g)).toHaveLength(1);
  });
});

describe('the calculator\'s own foot', () => {
  const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const foot = home.match(/<footer class="site-foot">[\s\S]*?<\/footer>/)?.[0] ?? '';

  it('is there at all', () => {
    expect(foot).not.toBe('');
  });

  it('offers the same indexes, in the same words and the same order, as a generated page', () => {
    const want = FOOTER_LINKS.filter((l) => l.href !== '/');
    const said = [...foot.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)].map((m) => ({ href: m[1], label: m[2] }));
    expect(said).toEqual(want);
  });

  it('does not spend a link on the page it is already on', () => {
    expect(foot).not.toContain('href="/"');
  });
});

describe('a note out of the data, printed as the page\u2019s own sentence', () => {
  const RATINGS = 'Not yet rated: released after our last ratings pass.';

  it('takes the line about this site\u2019s ratings off the front of the note', () => {
    const { ratings, about } = splitCapabilityNote(`${RATINGS} Tencent\u2019s Apache-licensed flagship.`);
    expect(ratings).toBe(RATINGS);
    expect(about).toBe('Tencent\u2019s Apache-licensed flagship.');
  });

  it('takes the sentence that goes with it too, and leaves the lede nothing rather than half a thought', () => {
    const { ratings, about } = splitCapabilityNote(`${RATINGS} Sizes and prices are current.`);
    expect(ratings).toBe(`${RATINGS} Sizes and prices are current.`);
    expect(about).toBe('');
  });

  it('leaves a note that is all about the model alone', () => {
    const note = 'The sweet spot for a 24 GB machine. Good writer, decent coder.';
    expect(splitCapabilityNote(note)).toEqual({ ratings: '', about: note });
  });

  it('only reads the front, so the same words later in a note stay in the lede', () => {
    const note = `Mistral\u2019s current small model. ${RATINGS}`;
    expect(splitCapabilityNote(note)).toEqual({ ratings: '', about: note });
  });

  it('says nothing twice: every model\u2019s two halves put the note back together', () => {
    for (const m of data.models) {
      const { ratings, about } = splitCapabilityNote(m.capability_note);
      expect([m.id, [ratings, about].filter(Boolean).join(' ')]).toEqual([m.id, m.capability_note.trim()]);
    }
  });

  it('holds the data to one shape: nothing rated means a line the split knows', () => {
    for (const m of data.models) {
      const unrated = Object.values(m.capabilities).every((v) => v === 'unknown');
      expect([m.id, unrated]).toEqual([m.id, splitCapabilityNote(m.capability_note).ratings !== '']);
    }
  });

  it('ends a sentence once, whatever the note it ends in did', () => {
    expect(endStop('11 GB at 32k context \u2014 Plain grouped-query attention on all 80 layers.')).toBe(
      '11 GB at 32k context \u2014 Plain grouped-query attention on all 80 layers.',
    );
    expect(endStop('11 GB at 32k context')).toBe('11 GB at 32k context.');
    expect(endStop('Is it worth it?')).toBe('Is it worth it?');
    expect(endStop('  ')).toBe('');
  });

  it('sends each sentence of a machine\u2019s note to the figure it is about', () => {
    const note = 'Bandwidth: 22.4 Gbps \u00d7 256-bit bus \u00f7 8 = 716.8 GB/s (TechPowerUp). '
      + 'Usable memory is the VRAM less 1 GB. '
      + 'The 4080 SUPER has a different price, so it is not this entry.';
    expect(splitHardwareNote(note)).toEqual({
      bandwidth: '22.4 Gbps \u00d7 256-bit bus \u00f7 8 = 716.8 GB/s (TechPowerUp).',
      memory: 'Usable memory is the VRAM less 1 GB.',
      availability: 'The 4080 SUPER has a different price, so it is not this entry.',
      speed: '',
    });
  });

  it('drops the label the sentence carried, because the row it lands in is the label', () => {
    expect(splitHardwareNote('Bandwidth: 15 Gbps \u00d7 192-bit bus \u00f7 8 = 360 GB/s.').bandwidth)
      .toBe('15 Gbps \u00d7 192-bit bus \u00f7 8 = 360 GB/s.');
  });

  it('keeps a caveat about speed out of the memory figure', () => {
    const laptop = 'macOS lets the GPU wire roughly 75% of unified memory by default. '
      + 'On a laptop, sustained speed drops once the fans cap out, so a desktop holds a higher tokens/sec.';
    const split = splitHardwareNote(laptop);
    expect(split.memory).toBe('macOS lets the GPU wire roughly 75% of unified memory by default.');
    expect(split.speed).toContain('tokens/sec');
  });

  it('leaves a note that is all about memory where it was', () => {
    const note = 'Memory is treated as GB throughout, which is slightly conservative.';
    expect(splitHardwareNote(note)).toEqual({ memory: note, bandwidth: '', availability: '', speed: '' });
  });

  it('says nothing twice: every machine\u2019s sentences put its note back together', () => {
    for (const h of data.hardware) {
      expect([h.id, noteSentences(h.notes).join(' ')]).toEqual([h.id, (h.notes ?? '').trim()]);
    }
  });

  it('holds the data to one shape: a note about bandwidth needs a bandwidth figure to sit under', () => {
    let explained = 0;
    for (const h of data.hardware) {
      if (!splitHardwareNote(h.notes).bandwidth) continue;
      explained++;
      expect([h.id, h.memory_bandwidth_gbs != null]).toEqual([h.id, true]);
    }
    expect(explained).toBeGreaterThan(0);
  });

  it('leaves no machine explaining its bandwidth under its memory', () => {
    for (const h of data.hardware) {
      expect([h.id, /\bGbps\b|\btokens\/sec\b/.test(splitHardwareNote(h.notes).memory)]).toEqual([h.id, false]);
    }
  });

  it('is the shape every architecture note in the data comes in', () => {
    const notes = data.models.map((m) => m.architecture?.note).filter((n): n is string => !!n);
    expect(notes.length).toBeGreaterThan(0);
    for (const n of notes) expect([n, endStop(n)]).toEqual([n, n]);
  });
});

describe('a source link says who is on the other end', () => {
  it('names the publisher behind the host', () => {
    expect(sourceName('https://www.apple.com/mac-mini/specs/')).toBe('Apple');
    expect(sourceName('https://support.apple.com/en-us/121555')).toBe('Apple Support');
    expect(sourceName('https://www.techpowerup.com/gpu-specs/geforce-rtx-5090.c4216')).toBe('TechPowerUp');
  });

  it('names the repository where the repository is the thing, not the host', () => {
    expect(sourceName('https://huggingface.co/bartowski/Qwen_Qwen3-8B-GGUF')).toBe('bartowski/Qwen_Qwen3-8B-GGUF');
    expect(sourceName('https://huggingface.co/Qwen/Qwen3-8B/raw/main/config.json')).toBe('Qwen/Qwen3-8B');
    expect(sourceName('https://github.com/ggml-org/llama.cpp/blob/master/common/common.h')).toBe('ggml-org/llama.cpp');
  });

  it('falls back to the domain rather than inventing a name for a host nobody has entered yet', () => {
    expect(sourceName('https://www.example-labs.com/review/thing')).toBe('example-labs.com');
  });

  it('tells two links to one publisher apart in that publisher’s own words', () => {
    const html = sourceLinks([
      'https://www.apple.com/mac-mini/specs/',
      'https://www.apple.com/newsroom/2026/08/apple-unveils-a-more-powerful-mac-mini',
      'https://daringfireball.net/2026/08/configurations_and_pricing',
    ]);
    expect(html).toContain('>Apple (specs)<');
    expect(html).toContain('>Apple (newsroom)<');
    expect(html).toContain('>Daring Fireball<');
  });

  it('leaves a lone link bare, however much its URL would have to say', () => {
    expect(sourceLinks(['https://www.apple.com/mac-mini/specs/'])).toContain('>Apple<');
  });

  it('names a file in a repository by the file, where a second link goes to the same one', () => {
    const html = sourceLinks([
      'https://github.com/ggml-org/llama.cpp/discussions/15396',
      'https://github.com/ggml-org/llama.cpp/blob/master/common/common.h',
    ]);
    expect(html).toContain('>ggml-org/llama.cpp (discussion)<');
    expect(html).toContain('>ggml-org/llama.cpp (common.h)<');
  });

  it('escapes what it prints and leaves the link openable', () => {
    const html = sourceLinks(['https://www.tomshardware.com/pc-components/gpus/corsair-ai-workstation-300-review']);
    expect(html).toContain('Tom&#39;s Hardware');
    expect(html).toContain('rel="noopener"');
  });

  it('gives each host a name of its own, so no two publishers read as one', () => {
    const urls = [...data.hardware.flatMap((h) => h.sources ?? []), ...data.models.flatMap((m) => m.sources ?? [])];
    const byName = new Map<string, Set<string>>();
    for (const u of urls) {
      const host = new URL(u).hostname;
      if (host === 'huggingface.co' || host === 'github.com') continue;
      const name = sourceName(u);
      byName.set(name, (byName.get(name) ?? new Set()).add(host));
    }
    expect(byName.size).toBeGreaterThan(20);
    for (const [name, hosts] of byName) expect([name, [...hosts]]).toEqual([name, [...hosts].slice(0, 1)]);
  });

  it('names every source in the data, and never with a number', () => {
    const urls = [...data.hardware.flatMap((h) => h.sources ?? []), ...data.models.flatMap((m) => m.sources ?? [])];
    expect(urls.length).toBeGreaterThan(200);
    for (const u of urls) {
      const name = sourceName(u);
      expect([u, name]).toEqual([u, name.trim()]);
      expect([u, /^source( \d+)?$/i.test(name)]).toEqual([u, false]);
      expect([u, name.length > 0 && !name.includes('/'.repeat(2))]).toEqual([u, true]);
    }
  });
});


describe('the models a machine runs that its table has no room for', () => {
  const link = (m: Model) => `<a href="/models/${m.id}/">${m.display_name}</a>`;
  const scored = data.models.filter((m) => m.frontier_equivalent?.score != null);
  const unscored = data.models.filter((m) => m.frontier_equivalent?.score == null);
  const linksIn = (note: string) => [...note.matchAll(/<a href="([^"]+)">/g)].map((m) => m[1]);

  it('names every model it is given, once each, as a link to that model\u2019s page', () => {
    const given = [...scored.slice(0, 4), ...unscored.slice(0, 2)];
    const hrefs = linksIn(runsOnNote(given, link));
    expect(hrefs).toHaveLength(given.length);
    expect(new Set(hrefs).size).toBe(given.length);
    for (const m of given) expect(hrefs).toContain(`/models/${m.id}/`);
  });

  it('opens on the count of what it names', () => {
    expect(runsOnNote(scored.slice(0, 5), link).startsWith('5 more fit')).toBe(true);
    expect(runsOnNote(scored.slice(0, 1), link).startsWith('One more fits')).toBe(true);
    // the count is everything below the table, not just the part the index can rank
    expect(runsOnNote([...scored.slice(0, 4), ...unscored.slice(0, 2)], link).startsWith('6 more fit')).toBe(true);
    expect(runsOnNote(unscored.slice(0, 3), link).startsWith('3 more fit')).toBe(true);
  });

  it('sets the unscored ones apart, counted, with the reason they are not in the ranking', () => {
    const note = runsOnNote([...scored.slice(0, 3), ...unscored.slice(0, 2)], link);
    expect(note).toContain('5 more fit.');
    expect(note).toContain('Ranked below the twelve above:');
    expect(note).toContain('The other 2 have no intelligence-index score');
    // the two lists are disjoint: an unscored model is named in the tail, not the ranking
    const [ranked, rest] = note.split('The other 2');
    for (const m of unscored.slice(0, 2)) expect(ranked).not.toContain(`/models/${m.id}/`);
    for (const m of scored.slice(0, 3)) expect(rest).not.toContain(`/models/${m.id}/`);
  });

  it('drops the caveat when the index has scored every one of them', () => {
    const note = runsOnNote(scored.slice(0, 3), link);
    expect(note).toContain('3 more fit, ranked below the twelve above:');
    expect(note).not.toContain('intelligence-index score');
  });

  it('says why there is no ranking at all when none of them is scored', () => {
    expect(runsOnNote(unscored.slice(0, 2), link)).toContain('the intelligence index has scored none of them');
    expect(runsOnNote(unscored.slice(0, 1), link)).toContain('the intelligence index has not scored it');
    expect(runsOnNote(unscored.slice(0, 1), link)).toContain('Its page shows what it needs');
  });

  it('says nothing when the table had room for everything', () => {
    expect(runsOnNote([], link)).toBe('');
  });

  it('is handed every model the machine runs that the table of twelve left out', () => {
    let machines = 0;
    let pairs = 0;
    for (const machine of machinesConsidered(data)) {
      const view = computeView({ ...defaultState(data), hw: machine.id }, data);
      const fits = view.rows.filter((r) => r.fit.status === 'fits').map((r) => r.model);
      const hidden = fits.slice(12);
      const note = runsOnNote(hidden, link);
      if (!hidden.length) {
        expect(note).toBe('');
        continue;
      }
      machines++;
      pairs += hidden.length;
      const hrefs = linksIn(note);
      expect([machine.id, hrefs.length]).toEqual([machine.id, hidden.length]);
      for (const m of hidden) expect([machine.id, hrefs.includes(`/models/${m.id}/`)]).toEqual([machine.id, true]);
      for (const m of fits.slice(0, 12)) expect([machine.id, hrefs.includes(`/models/${m.id}/`)]).toEqual([machine.id, false]);
    }
    expect(machines).toBeGreaterThan(30);
    expect(pairs).toBeGreaterThan(300);
  });
});

describe('the machines a model page’s table has no row for', () => {
  const ctx = data.defaults.context.default_tokens;
  const listed = data.hardware.length;
  const model = (id: string) => data.models.find((m) => m.id === id)!;
  const note = (m: Model, rows = 8) => familyReachNote(familyReach(m, data, ctx), listed, rows, ctx);
  const families = new Map<string, Hardware[]>();
  for (const h of data.hardware) families.set(h.family, [...(families.get(h.family) ?? []), h]);

  it('counts every machine that holds it, not the rows in the table', () => {
    for (const m of data.models) {
      const held = machinesThatHold(m, data, ctx);
      if (!held.length || held.length === listed) continue;
      expect([m.id, note(m)]).toEqual([m.id, expect.stringContaining(`${held.length} of the ${listed} machines on this site hold it at ${ctxLabel(ctx)}`)]);
    }
  });

  it('draws the line at a memory size the machine’s own name gives, and the data agrees with every one', () => {
    for (const m of data.models) {
      const held = new Set(machinesThatHold(m, data, ctx).map((h) => h.id));
      for (const r of familyReach(m, data, ctx)) {
        const above = (families.get(r.family) ?? []).filter((h) => h.unified_memory_gb >= r.floorGb);
        // the floor is the whole rule: every machine in the family at or above it
        // holds the model, and every one below it does not
        expect([m.id, r.family, above.map((h) => h.id).sort()]).toEqual([m.id, r.family, (families.get(r.family) ?? []).filter((h) => held.has(h.id)).map((h) => h.id).sort()]);
      }
    }
  });

  it('says so in a line where every machine on the site runs it', () => {
    const m = model('llama-3.1-8b-q4');
    expect(machinesThatHold(m, data, ctx)).toHaveLength(listed);
    expect(note(m)).toBe(`All ${listed} machines on this site run it at 32k, not just the eight in the table. ${machineIndexLine()}`);
    expect(note(m, 1)).toContain('not just the one in the table');
  });

  it('leaves the size off a family that holds it whatever the size', () => {
    const line = note(model('gemma-3-27b-q4'));
    // every Mac Studio holds it; the smallest Mac mini does not
    expect(line).toContain('every Mac Studio and Strix Halo box at any size');
    expect(line).toContain('every Mac mini and MacBook Pro with 32GB or more');
  });

  it('puts two families that draw the line in the same place in one clause', () => {
    const line = note(model('glm-4.5-air-q4'));
    expect(line).toContain('every Mac Studio, Strix Halo box and MacBook Pro with 128GB or more');
    expect(line).not.toContain('MacBook Pro with 128GB or more and every');
  });

  it('names a family of one machine rather than describing its range', () => {
    const line = note(model('glm-4.5-air-q4'));
    expect(line).toContain('the DGX Spark, 128GB');
    expect(line).not.toContain('every DGX Spark');
  });

  it('leaves out a family that holds it nowhere, and says nothing at all where nothing holds it', () => {
    const m = model('inkling-small-ud-q4');
    const reached = familyReach(m, data, ctx).map((r) => r.family);
    expect(reached).toContain('Mac Studio');
    expect(reached).not.toContain('MacBook Air');
    expect(note(m)).not.toContain('MacBook Air');
    // a model page with no table of machines gets no sentence about them; the
    // build guard holds that end, this holds the wording's
    expect(familyReachNote([], listed, 8, ctx)).toBe('');
  });

  it('ends on where every machine is priced, whichever way it counted them', () => {
    // both branches: one model every machine holds, one held by some of them
    const all = model('llama-3.1-8b-q4');
    const some = model('gemma-3-27b-q4');
    expect(machinesThatHold(all, data, ctx)).toHaveLength(listed);
    expect(machinesThatHold(some, data, ctx).length).toBeLessThan(listed);
    for (const m of [all, some]) {
      const line = note(m);
      expect([m.id, line.endsWith(machineIndexLine())]).toEqual([m.id, true]);
      expect([m.id, line.split('href="/hardware/"').length - 1]).toEqual([m.id, 1]);
    }
  });

  it('says it on every model page that counts machines, and on none that counts none', () => {
    let said = 0;
    for (const m of data.models) {
      const line = note(m);
      if (!line) continue;
      expect([m.id, line.includes(machineIndexLine())]).toEqual([m.id, true]);
      said++;
    }
    expect(said).toBeGreaterThan(50);
    // a model nothing here holds counts nothing, so it sends the reader nowhere
    expect(familyReachNote([], listed, 8, ctx)).not.toContain('/hardware/');
  });

  it('names the machine index in words that say what is on the other end', () => {
    const line = machineIndexLine();
    expect(line).toContain('href="/hardware/"');
    const anchor = line.match(/<a href="\/hardware\/">([^<]+)<\/a>/)![1];
    expect(anchor.split(' ').length).toBeGreaterThan(2);
    expect(anchor.toLowerCase()).toContain('machine');
    // no maintainer words and no bare pointer
    expect(anchor.toLowerCase()).not.toMatch(/^(here|this|link|see|more)$/);
    expect(line.endsWith('.')).toBe(true);
  });

  it('accounts for every machine that holds it, family by family', () => {
    let pages = 0;
    let pairs = 0;
    for (const m of data.models) {
      const held = machinesThatHold(m, data, ctx);
      if (!held.length) continue;
      pages++;
      const reach = familyReach(m, data, ctx);
      expect([m.id, reach.reduce((n, r) => n + r.runs, 0)]).toEqual([m.id, held.length]);
      pairs += held.length;
      for (const r of reach) expect([m.id, r.total]).toEqual([m.id, (families.get(r.family) ?? []).length]);
    }
    expect(pages).toBe(55);
    expect(pairs).toBeGreaterThan(1900);
  });

  it('writes a family the way a sentence about one of its machines would', () => {
    expect(familyNoun('Strix Halo')).toBe('Strix Halo box');
    expect(familyNoun('NVIDIA')).toBe('NVIDIA card');
    expect(familyNoun('Mac mini')).toBe('Mac mini');
    expect(andList(['a'])).toBe('a');
    expect(andList(['a', 'b'])).toBe('a and b');
    expect(andList(['a', 'b', 'c'])).toBe('a, b and c');
  });
});

describe('the calculator’s assumptions panel, which prints the same fields the pages do', () => {
  const panel = readFileSync(new URL('../src/render.ts', import.meta.url), 'utf8');

  it('shares one implementation with the generated pages rather than keeping a second copy', () => {
    // pagekit is the build’s module and the bundle cannot import it, so the four
    // helpers both need live in format.ts. These are the same functions, not copies.
    expect(powerSourceLabel).toBe(fmtPowerSourceLabel);
    expect(splitHardwareNote).toBe(fmtSplitHardwareNote);
    expect(sourceLinks).toBe(fmtSourceLinks);
    expect(sourceName).toBe(fmtSourceName);
  });

  it('names a source link after whoever publishes it, the way every page does', () => {
    expect(panel).toContain('sourceLinks(hw.sources)');
    expect(panel).not.toMatch(/>source\$\{/);
  });

  it('says where a power figure came from in words, not in the data’s own key', () => {
    expect(panel).toContain('powerSourceLabel(hw)');
    expect(panel).not.toMatch(/load_watts_status[^\n]*replace\(\/_\/g/);
  });

  it('sends each sentence of a machine’s note to the figure it is about', () => {
    expect(panel).toContain('splitHardwareNote(hw.notes)');
    expect(panel).not.toMatch(/esc\(hw\.notes/);
  });

  it('has a row for every figure those sentences are sent to', () => {
    for (const row of ['Usable memory', 'Memory bandwidth', 'Local speed', 'Hardware price']) {
      expect([row, panel.includes(`<dt>${row}</dt>`) || panel.includes(`>${row}</dt>`)]).toEqual([row, true]);
    }
  });
  it('names no link after nothing, which is the rule every generated page is held to', () => {
    // the same list checkSourceLinks() refuses: a link called "source" says nothing
    // about what is on the other end, to a reader or to a crawler.
    const named = [...panel.matchAll(/>([^<>]{0,40})<\/a>/g)].map((m) => m[1].trim().toLowerCase());
    expect(named.length).toBeGreaterThan(5);
    for (const n of named) {
      expect([n, /^(source|sources|here|this|link|read more|click here)$/.test(n)]).toEqual([n, false]);
    }
  });

  it('prints the index version once, not once from each field that carries it', () => {
    expect(indexVersion('Artificial Analysis Intelligence Index v4.3', 'v4.3')).toBe('');
    expect(indexVersion('Artificial Analysis Intelligence Index', 'v4.3')).toBe('v4.3');
    expect(indexVersion('Artificial Analysis Intelligence Index v4.3', null)).toBe('');
    // the shape the data is in today, on every model that carries a version
    for (const m of data.models) {
      const v = m.frontier_equivalent?.index_version;
      if (!v) continue;
      expect([m.id, indexVersion(data.defaults.frontier_basis?.name, v)]).toEqual([m.id, '']);
    }
  });
});

describe('what a reader gets for swapping the model they run for the current one', () => {
  const model = (id: string) => data.models.find((m) => m.id === id)!;
  const section = (a: string, b: string) => modelGenerationSection(model(a), model(b), data);
  const words = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const pairs = modelGenerationPairs(data);

  it('opens on which of the two is current, in the words the rule cut them with', () => {
    // a mixture of experts and a dense model of the same size are not the same swap, and
    // the sentence has to say which it means: the current Qwen nearest Qwen3 32B in size
    // is a mixture of experts, so "the current Qwen nearest it in size" would be a
    // different model from the one on the page
    expect(words(section('qwen3-32b-q4', 'qwen3.8-27b-q4'))).toContain(
      'Qwen3 32B is last generation. Qwen3.8 27B is the current dense Qwen model nearest it in size, 27.8B against 32.8B.',
    );
    expect(words(section('qwen3-235b-a22b-2507-q4', 'qwen3.8-flash-next-q4'))).toContain(
      'Qwen3.8 Flash Next is the current Qwen mixture of experts nearest it in size, 180B against 235.1B.',
    );
  });

  it('says the size once where both sides are the same size', () => {
    expect(words(section('mistral-small-3.2-24b-q4', 'devstral-small-2-24b-q4'))).toContain(
      'the current dense Mistral model of the same size, 24B.',
    );
    expect(words(section('mistral-small-3.2-24b-q4', 'devstral-small-2-24b-q4'))).not.toContain('24B against 24B');
  });

  it('places the two on the index the way the data falls, including where neither side moved', () => {
    expect(words(section('gemma-3-12b-q4', 'gemma-4-12b-q4'))).toContain(
      'On the intelligence index it scores 14 where Gemma 3 12B it scores 4.',
    );
    // the one pair where the newer model is no smarter: saying it scores higher would be
    // the easiest sentence to write and the only one the data does not support
    expect(words(section('qwen3-30b-a3b-2507-q4', 'qwen3-coder-30b-a3b-q4'))).toContain('The intelligence index puts both at 10.');
  });

  it('says what the swap asks of the machine, in the direction the figures fall', () => {
    // bigger on disk and lighter in the machine, because the cache is the part that moved
    const lighter = words(section('qwen3-8b-q4', 'qwen3.5-9b-q4'));
    expect(lighter).toContain('It asks less of the machine: 6.8 GB at 32k of context against 9.9 GB.');
    expect(lighter).toContain('The weights are 5.7 GB against 5.0 GB, and the cache at that window is 1.1 GB against 4.8 GB.');
    // and the pair where the newer model costs memory says so rather than the other way
    const heavier = words(section('gemma-3-27b-q4', 'gemma-4-31b-q4'));
    expect(heavier).toContain('It asks more of the machine: 26 GB at 32k of context against 20 GB.');
    expect(heavier).not.toContain('asks less');
    // and where nothing moves, neither claim is made
    const same = words(section('mistral-small-3.2-24b-q4', 'devstral-small-2-24b-q4'));
    expect(same).toContain('Both ask the same of the machine: 20 GB at 32k of context, the same weights and the same key-value cache.');
    expect(same).not.toContain('asks more');
  });

  it('counts the machines each way, and names one to run the newer model on', () => {
    // the swap that costs machines names both cheapest, since the reader is choosing
    const costly = words(section('gemma-3-27b-q4', 'gemma-4-31b-q4'));
    expect(costly).toContain('27 of the 37 machines priced here run it, against 30 for Gemma 3 27B it.');
    expect(costly).toContain('The cheapest that runs it is the Radeon AI PRO R9700, 32GB at $1,299, card only, where Gemma 3 27B it starts at the Framework Desktop, 32GB at $1,269.');
    expect(section('gemma-3-27b-q4', 'gemma-4-31b-q4')).toContain('href="/hardware/radeon-ai-pro-r9700-32/"');
    // and the three ways nothing changes are three sentences, not one with a number in it
    expect(words(section('qwen3-8b-q4', 'qwen3.5-9b-q4'))).toContain('Every one of the 37 machines priced here runs both, from the Mac mini M6, 16GB at $899.');
    expect(words(section('qwen3-235b-a22b-2507-q4', 'qwen3.8-flash-next-q4'))).toContain('One of the 37 machines priced here runs either of them, and it is the same one: the Mac Studio M5 Ultra, 256GB at $10,799.');
    expect(words(section('qwen3-30b-a3b-2507-q4', 'qwen3-coder-30b-a3b-q4'))).toContain('The same 28 of the 37 machines priced here run both, from the Framework Desktop, 32GB at $1,269.');
  });

  it('gives the two context ceilings their own paragraph, and none where they match', () => {
    const longer = section('qwen3-32b-q4', 'qwen3.8-27b-q4');
    expect(words(longer)).toContain('Qwen3.8 27B takes 256k of context where Qwen3 32B stops at 40k');
    expect(longer.match(/<p>/g)).toHaveLength(2);
    // both ceilings are 256k here, so there is nothing to say and the page says nothing
    expect(section('qwen3-235b-a22b-2507-q4', 'qwen3.8-flash-next-q4').match(/<p>/g)).toHaveLength(1);
  });

  it('reads as finished copy on every pair the rule cuts', () => {
    expect(pairs.length).toBeGreaterThan(0);
    for (const [old, now] of pairs) {
      const w = words(modelGenerationSection(old, now, data));
      expect([old.id, w]).toEqual([old.id, expect.stringContaining(now.display_name)]);
      for (const bad of ['undefined', 'NaN', 'null', 'TODO', ' .', '..', ' ,'])
        expect([old.id, bad, w.includes(bad)]).toEqual([old.id, bad, false]);
      expect(w.endsWith('.')).toBe(true);
    }
  });
});

describe('the other match-ups the two on a head-to-head are in', () => {
  const groups = [
    { lead: 'another card', links: [{ href: '/compare/a-vs-c/', label: 'GeForce RTX 5090, 32GB' }] },
    { lead: 'a complete computer', links: [{ href: '/compare/a-vs-d/', label: 'DGX Spark, 128GB' }] },
  ];
  const words = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

  it('names the machine the list belongs to, then the question each pair answers', () => {
    expect(words(machineMatchUpsLine('RTX PRO 6000 Blackwell, 96GB', groups))).toBe(
      'The RTX PRO 6000 Blackwell, 96GB is also head to head with another card: GeForce RTX 5090, 32GB. With a complete computer: DGX Spark, 128GB.',
    );
    expect(machineMatchUpsLine('RTX PRO 6000 Blackwell, 96GB', groups)).toContain('<a href="/compare/a-vs-d/">DGX Spark, 128GB</a>');
  });

  it('says nothing where a machine is in no other match-up', () => {
    expect(machineMatchUpsLine('Mac mini M6, 16GB', [])).toBe('');
    expect(modelMatchUpsLine('Gemma 4 12B', [])).toBe('');
  });

  it('escapes a name that could close the link it sits in', () => {
    const line = machineMatchUpsLine('Mac & mini', [{ lead: 'another computer', links: [{ href: '/compare/x/?a=1&b=2', label: '<b>' }] }]);
    expect(line).toContain('Mac &amp; mini');
    expect(line).toContain('href="/compare/x/?a=1&amp;b=2"');
    expect(line).not.toContain('<b>');
  });

  it('gives a model match-up the rule that made it, not just the other name', () => {
    expect(
      words(modelMatchUpsLine('Qwen3.8 27B', [{ href: '/compare/q-vs-r/', name: 'Qwen3 32B', side: 'is-current', family: 'Qwen' }])),
    ).toBe('Qwen3.8 27B is also head to head with Qwen3 32B, the last-generation Qwen nearest it in size.');
    expect(
      words(modelMatchUpsLine('Qwen3 32B', [{ href: '/compare/q-vs-r/', name: 'Qwen3.8 27B', side: 'is-older', family: 'Qwen' }])),
    ).toBe('Qwen3 32B is also head to head with Qwen3.8 27B, the current Qwen nearest it in size.');
  });

  it('says the long way round where the data carries no family to name', () => {
    expect(
      words(modelMatchUpsLine('Muse Glimmer 30B', [{ href: '/compare/m-vs-n/', name: 'Muse Glimmer 2 30B', side: 'is-older' }])),
    ).toBe('Muse Glimmer 30B is also head to head with Muse Glimmer 2 30B, the current model of its family nearest it in size.');
  });

  it('names the leaderboard once where a model has a rung either side of it', () => {
    const both = words(
      modelMatchUpsLine('Gemma 4 31B it', [
        { href: '/compare/g-vs-h/', name: 'Granite 4.2 30B', side: 'below', family: 'Gemma' },
        { href: '/compare/f-vs-g/', name: 'Qwen3.5 122B-A10B', side: 'above', family: 'Gemma' },
      ]),
    );
    expect(both).toBe(
      'Gemma 4 31B it is also head to head with Qwen3.5 122B-A10B above it on the leaderboard and Granite 4.2 30B below it.',
    );
    // on its own the rung below has to say which list it is below, since nothing else does
    expect(words(modelMatchUpsLine('Gemma 4 31B it', [{ href: '/compare/g-vs-h/', name: 'Granite 4.2 30B', side: 'below', family: 'Gemma' }]))).toBe(
      'Gemma 4 31B it is also head to head with Granite 4.2 30B below it on the leaderboard.',
    );
  });

  it('puts the rung of the leaderboard before the model a generation away, whichever order they arrive in', () => {
    const line = words(
      modelMatchUpsLine('Qwen3.8 27B', [
        { href: '/compare/q-vs-r/', name: 'Qwen3 32B', side: 'is-current', family: 'Qwen' },
        { href: '/compare/s-vs-q/', name: 'Inkling Small', side: 'below', family: 'Qwen' },
      ]),
    );
    expect(line).toBe(
      'Qwen3.8 27B is also head to head with Inkling Small below it on the leaderboard and Qwen3 32B, the last-generation Qwen nearest it in size.',
    );
  });

  it('gives the models that need the same memory a sentence of their own, and says the reason once', () => {
    const three = words(
      modelMatchUpsLine('Gemma 3 27B it', [
        { href: '/compare/a-vs-g/', name: 'Qwen3 8B', side: 'above', family: 'Gemma' },
        { href: '/compare/g-vs-b/', name: 'Ministral 3 8B', side: 'below', family: 'Gemma' },
        { href: '/compare/c-vs-g/', name: 'Qwen3.6 27B', side: 'same-memory' },
        { href: '/compare/d-vs-g/', name: 'Devstral Small 2 24B', side: 'same-memory' },
      ]),
    );
    expect(three).toBe(
      'Gemma 3 27B it is also head to head with Qwen3 8B above it on the leaderboard and Ministral 3 8B below it. Two more models need much the same memory: Qwen3.6 27B and Devstral Small 2 24B.',
    );
    // one of them is one model, not two
    expect(
      words(
        modelMatchUpsLine('gpt-oss-20b', [
          { href: '/compare/a-vs-g/', name: 'Qwen3-Coder Next', side: 'above' },
          { href: '/compare/g-vs-m/', name: 'Ministral 3 14B', side: 'same-memory' },
        ]),
      ),
    ).toBe(
      'gpt-oss-20b is also head to head with Qwen3-Coder Next above it on the leaderboard. One more model needs much the same memory: Ministral 3 14B.',
    );
    // and where the page itself is the rung of the leaderboard, the memory neighbours are
    // all that is left to say, so they carry the sentence rather than follow one
    expect(
      words(modelMatchUpsLine('GLM-4.7-Flash', [{ href: '/compare/g-vs-q/', name: 'Qwen3-Coder 30B-A3B', side: 'same-memory' }])),
    ).toBe('GLM-4.7-Flash is also head to head with Qwen3-Coder 30B-A3B, which needs much the same memory.');
  });

  it('reads as finished copy: no doubled stop, no stray comma, nothing left blank', () => {
    const lines = [
      machineMatchUpsLine('Mac Studio M5 Max, 128GB', groups),
      modelMatchUpsLine('Qwen3.8 27B', [
        { href: '/compare/q-vs-r/', name: 'Qwen3 32B', side: 'is-current', family: 'Qwen' },
        { href: '/compare/s-vs-q/', name: 'Inkling Small', side: 'below', family: 'Qwen' },
      ]),
      modelMatchUpsLine('Gemma 3 27B it', [
        { href: '/compare/a-vs-g/', name: 'Qwen3 8B', side: 'above' },
        { href: '/compare/c-vs-g/', name: 'Qwen3.6 27B', side: 'same-memory' },
      ]),
      modelMatchUpsLine('Gemma 3 27B it', [{ href: '/compare/c-vs-g/', name: 'Qwen3.6 27B', side: 'same-memory' }]),
    ];
    for (const line of lines) {
      const w = words(line);
      for (const bad of ['undefined', 'NaN', 'null', 'TODO', ' .', '..', ' ,', ',,'])
        expect([bad, w.includes(bad)]).toEqual([bad, false]);
      expect(w.endsWith('.')).toBe(true);
    }
  });
});

describe('the id a section heading answers to', () => {
  it('slugs a heading the way a reader reads it: markup out, entities back, one hyphen between words', () => {
    expect(headingSlug('What the Framework Desktop, 128GB runs')).toBe('what-the-framework-desktop-128gb-runs');
    expect(headingSlug('How good is Qwen3 8B, really?')).toBe('how-good-is-qwen3-8b-really');
    // the heading on /best/ carries a span and a middle dot, and neither is a word
    expect(headingSlug('50,000 tokens a day <span class="dim">· heavy use</span>')).toBe('50-000-tokens-a-day-heavy-use');
    // the build escapes before this sees it, so an ampersand arrives as an entity
    expect(headingSlug('Weights &amp; cache')).toBe('weights-cache');
    expect(headingSlug('The M5 Max&#39;s memory')).toBe('the-m5-max-s-memory');
    // no leading or trailing hyphen, whatever the punctuation around the words
    expect(headingSlug('  "The specifics" — at last!  ')).toBe('the-specifics-at-last');
    // a heading with no letters or digits has no slug, and the caller leaves it alone
    expect(headingSlug('· — ·')).toBe('');
  });

  it('gives every bare heading an id, and never the same id twice on one page', () => {
    expect(anchorHeadings('<h2>The specifics</h2>')).toBe('<h2 id="the-specifics">The specifics</h2>');
    // the same words twice on one page: the second takes a number, because a browser
    // honours the first id and ignores the rest
    expect(anchorHeadings('<h2>The specifics</h2><p>a</p><h2>The specifics</h2>')).toBe(
      '<h2 id="the-specifics">The specifics</h2><p>a</p><h2 id="the-specifics-2">The specifics</h2>',
    );
    // a heading that already carries an id keeps it
    expect(anchorHeadings('<h2 id="u-50k">50,000 a day</h2>')).toBe('<h2 id="u-50k">50,000 a day</h2>');
    // and one with no word in it is left as it was found
    expect(anchorHeadings('<h2>· ·</h2>')).toBe('<h2>· ·</h2>');
    // nothing but an h2 is touched
    expect(anchorHeadings('<h1>Top</h1><h3>Under</h3>')).toBe('<h1>Top</h1><h3>Under</h3>');
  });

  it('writes the heading a guard asks for in the form the page publishes it', () => {
    // this is the whole of the contract the build's guards rest on: ask for a heading
    // by its words and get back the markup anchorHeadings produced from those words
    for (const heading of ['The specifics', 'What the Mac mini M6, 16GB runs', 'How good is Gemma 4 31B it, really?'])
      expect(anchorHeadings(`<h2>${heading}</h2>`)).toBe(anchoredHeading(heading));
    // and a heading with no slug in it still round-trips
    expect(anchorHeadings('<h2>···</h2>')).toBe(anchoredHeading('···'));
  });
});

describe('a link that names a section, and the address it lands on', () => {
  it('builds the address out of the heading the page publishes', () => {
    // the one claim the whole thing rests on: both ends of the link come from the
    // same words, so a reworded heading moves the link with it
    for (const heading of ['Machine against machine', 'A million tokens, model by model', 'Every card here, side by side'])
      expect(anchoredHeading(heading)).toContain(`id="${sectionLink('/x/', heading).split('#')[1]}"`);
  });

  it('keeps the page in front of the fragment, so the link still reaches the page', () => {
    expect(sectionLink('/compare/', 'Model against model')).toBe('/compare/#model-against-model');
    for (const href of Object.values(SECTIONS)) {
      expect(href).toMatch(/^\/[a-z0-9-]+\/#[a-z0-9][a-z0-9-]*$/);
      expect(href.split('#')[1]).toBe(headingSlug(href.split('#')[1]));
    }
  });

  it('names each section once, because two names for one section is one of them going stale', () => {
    const named = Object.values(SECTIONS);
    expect(new Set(named).size).toBe(named.length);
  });
});

describe('the line of jumps into a page\u2019s own sections', () => {
  // a page of the shape the rule is written for: an h1 that names a pair, and four
  // headings that name the pair once between them
  const pair = (headings: string[]) =>
    `<h1>Mac mini M6, 16GB vs Mac Studio M5 Max, 64GB for local AI</h1>\n<p class="lede">Which one.</p>\n` +
    headings.map((h) => `${anchoredHeading(h)}\n<p>Words.</p>`).join('\n');
  const four = ['Side by side on Gemma 4 12B', 'How much use it takes to pay back', 'What the extra memory buys', 'The assumptions behind both columns'];

  it('offers one jump a section, landing on the id that section heads', () => {
    const out = addJumpLine(pair(four), ['Mac mini M6, 16GB', 'Mac Studio M5 Max, 64GB', 'Gemma 4 12B']);
    const line = out.match(/<p class="note">Jump to: ([\s\S]*?)<\/p>/)![1];
    const jumps = [...line.matchAll(/<a href="#([^"]+)">([^<]+)<\/a>/g)];
    expect(jumps.map((m) => m[2])).toEqual(four);
    // both ends of every jump are the heading's own words, so a reworded heading moves both
    for (const [, id, text] of jumps) expect(anchoredHeading(text)).toContain(`id="${id}"`);
  });

  it('puts the line above the first section, and outside whatever wraps it', () => {
    const out = addJumpLine(pair(four), []);
    expect(out.indexOf('Jump to:')).toBeLessThan(out.indexOf('<h2'));
    const wrapped = addJumpLine(`<h1>Best buys</h1>${four.map((h) => `<section id="${headingSlug(h)}-s">${anchoredHeading(h)}</section>`).join('')}`, []);
    expect(wrapped.indexOf('Jump to:')).toBeLessThan(wrapped.indexOf('<section'));
  });

  it('leaves a page alone where more than one heading names what the h1 already names', () => {
    // the model pages: every heading carries the model, so a line built from them
    // would print its name three times in a row
    const model = `<h1>What hardware do you need to run Gemma 4 31B it?</h1>` +
      ['How good is Gemma 4 31B it, really?', 'What Gemma 4 31B it costs either way', 'Machines that run Gemma 4 31B it', 'The specifics']
        .map((h) => anchoredHeading(h)).join('');
    expect(addJumpLine(model, ['Gemma 4 31B it'])).toBe(model);
    // one heading naming the subject is a page about several things, and keeps its line
    expect(addJumpLine(pair(four), ['Gemma 4 12B'])).toContain('Jump to:');
  });

  it('leaves a page alone with fewer sections than the line is worth, and never writes a second', () => {
    const three = pair(four.slice(0, JUMP_MIN_SECTIONS - 1));
    expect(addJumpLine(three, [])).toBe(three);
    const once = addJumpLine(pair(four), []);
    expect(addJumpLine(once, [])).toBe(once);
    // and a page with no h1 is not a page this rule knows the subject of
    const headless = four.map((h) => anchoredHeading(h)).join('');
    expect(addJumpLine(headless, [])).toBe(headless);
  });
});

describe('what a class on /best/ leaves out', () => {
  const pick = (days: number) => ({ hw: data.hardware[0], model: data.models[0], days });
  const klass = (picks: number, never = 0, overCapacity = 0, considered = 100) =>
    ({ picks: Array.from({ length: picks }, (_, i) => pick(i)), never, overCapacity, considered });
  // the fourth-quickest pay-back in a class, which is the one the note names
  const fourth = { hw: hw('mac-mini-m6-32'), model: data.models.find((m) => m.id === 'qwen3.8-27b-q4')!, days: 640 };
  const named = '<a href="/models/qwen3.8-27b-q4/">Qwen3.8 27B</a>, in 21 months on a <a href="/hardware/mac-mini-m6-32/">Mac mini M6, 32GB</a>';
  const cutAt3 = (picks: number) => ({ ...klass(picks), picks: [...klass(3).picks, fourth, ...klass(picks - 4).picks] });

  it('counts the models a class pays back but does not list, and names the next one down', () => {
    expect(bestLeftOut(cutAt3(17), 3).more).toBe(14);
    expect(bestLeftOut(cutAt3(17), 3).moreSaid).toBe(
      `14 more models in this class pay back behind these three. The quickest of them is ${named}.`,
    );
    // one is the case the plural would read wrong in, and it is a real class on the page
    expect(bestLeftOut(cutAt3(4), 3).moreSaid).toBe(
      `One more model in this class pays back behind these three: ${named}.`,
    );
    // the model named is the first past the cut, not the first of the picks
    expect(bestLeftOut(cutAt3(17), 3).nextSaid).toBe(named);
  });

  it('says nothing about models where the class lists every one that pays back', () => {
    expect(bestLeftOut(klass(3), 3).more).toBe(0);
    expect(bestLeftOut(klass(3), 3).moreSaid).toBe('');
    expect(bestLeftOut(klass(3), 3).nextSaid).toBe('');
    expect(bestLeftOut(klass(1), 3).moreSaid).toBe('');
  });

  it('counts pairs as pairs, and keeps the two reasons a pair is not a row apart', () => {
    expect(bestLeftOut(klass(3, 57, 0, 530), 3).pairsSaid).toBe('of the 530 machine-and-model pairs that fit, 57 never pay back.');
    expect(bestLeftOut(klass(3, 0, 18, 33), 3).pairsSaid).toBe('of the 33 machine-and-model pairs that fit, 18 can’t produce this much in a day.');
    expect(bestLeftOut(klass(3, 39, 63, 530), 3).pairsSaid).toBe(
      'of the 530 machine-and-model pairs that fit, 39 never pay back and 63 can’t produce this much in a day.',
    );
    // a class that leaves no pair out counts none, rather than printing a nought
    expect(bestLeftOut(klass(3, 0, 0, 33), 3).pairsSaid).toBe('');
  });

  it('moves with the cut rather than with the number three', () => {
    expect(bestLeftOut(klass(17), 5).more).toBe(12);
    expect(bestLeftOut(klass(17), 17).moreSaid).toBe('');
    expect(bestLeftOut(klass(17), Infinity).more).toBe(0);
    // the cut is what the sentence counts back from, in words as well as in number
    const wider = { ...klass(17), picks: [...klass(5).picks, fourth, ...klass(11).picks] };
    expect(bestLeftOut(wider, 5).moreSaid).toBe(
      `12 more models in this class pay back behind these five. The quickest of them is ${named}.`,
    );
  });
});
