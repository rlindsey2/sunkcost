import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  brandOf, calcLink, computeView, familyHeading, familyRange, fitsOf, fmtUsd, hardwareProduct, jsonLd, machineVerdict,
  otherQuantisations, pageGraph, pageShell, priceRivals, priceWithScope, runsOnlyOn, shownTps, speedWithBasis,
  strongestShared, FONT_PRELOAD,
  type LdNode,
} from '../src/pagekit';
import { defaultState } from '../src/state';
import { sharePath } from '../src/share';
import type { Dataset, Hardware } from '../src/types';
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

  it('says when a price is for the card alone', () => {
    const card = data.hardware.find((h) => h.price_scope === 'card_only')!;
    const box = data.hardware.find((h) => h.price_scope !== 'card_only' && h.price_usd != null)!;
    expect(priceWithScope(card)).toContain('card only');
    expect(priceWithScope(box)).not.toContain('card only');
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

  it('claims a like-for-like pay-back only when both columns run the same model', () => {
    for (const [ida, idb] of [differ, same]) {
      const [va, vb] = [view(ida), view(idb)];
      const verdict = machineVerdict(hw(ida), hw(idb), va, vb, data);
      const sameModel = fitsOf(va)[0].model.id === fitsOf(vb)[0].model.id;
      expect(/own strongest model/.test(verdict)).toBe(!sameModel);
    }
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
