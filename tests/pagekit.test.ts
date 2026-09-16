import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  brandOf, calcLink, familyHeading, familyRange, hardwareProduct, jsonLd, otherQuantisations, pageGraph, pageShell,
  priceRivals, FONT_PRELOAD,
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
