import { describe, expect, it } from 'vitest';
import {
  clampText, fitLines, flagshipMachines, graphicsCards, hardwareComparePath, hardwarePairs, hardwareVersusCard,
  generationPairs, memoryTierNames, memoryTierPairs, sameSiliconPairs,
  modelComparePath, modelPairs, modelVersusCard, rankedModels, versusCardPath, versusCardSvg, wrapText, VS_HEIGHT,
  VS_WIDTH,
} from '../src/versus-card';
import { computeView } from '../src/compute';
import {
  appleChip, discontinuedOn, generationNames, gpuPart, machineVerdict, runnersFor, sameSilicon,
  shortHardwareLabel,
} from '../src/pagekit';
import { defaultState } from '../src/state';
import { fmtUsd } from '../src/format';
import type { Dataset, Hardware } from '../src/types';
import hardware from '../data/hardware.json';
import models from '../data/models.json';
import throughput from '../data/throughput.json';
import defaults from '../data/defaults.json';

const data = { hardware, models, throughput, defaults } as unknown as Dataset;

const cards = [
  ...hardwarePairs(data).map(([a, b]) => ({ page: hardwareComparePath(a, b), svg: hardwareVersusCard(a, b, data) })),
  ...modelPairs(data).map(([a, b]) => ({ page: modelComparePath(a, b), svg: modelVersusCard(a, b, data) })),
];

const text = (svg: string) => svg.replace(/<[^>]*>/g, ' ');

describe('fitting text a renderer cannot measure', () => {
  it('breaks a hyphenated name rather than cutting it short', () => {
    expect(wrapText('DeepSeek-R1-Distill-Qwen-32B', 28, 300, 2, 0.66)).toEqual(['DeepSeek-R1-', 'Distill-Qwen-32B']);
  });

  it('leaves a string that fits alone', () => {
    expect(wrapText('Mac mini M5 Pro, 24GB', 20, 600)).toEqual(['Mac mini M5 Pro, 24GB']);
  });

  it('clamps only what it cannot break', () => {
    expect(clampText('Supercalifragilistic', 30, 120)).toBe('Super…');
  });

  it('drops a size instead of truncating', () => {
    const fitted = fitLines('DeepSeek-R1-Distill-Llama-70B', [28, 25, 22], 280, 2, 0.66);
    expect(fitted.size).toBeLessThan(28);
    expect(fitted.lines.join('')).not.toContain('…');
  });
});

describe('the head-to-head card', () => {
  it('is a 1200×630 SVG', () => {
    const svg = cards[0].svg;
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain(`width="${VS_WIDTH}" height="${VS_HEIGHT}"`);
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
  });

  it('escapes anything that could close a tag early', () => {
    const svg = versusCardSvg({
      eyebrow: 'Head to head',
      aTitle: 'A </text><script>',
      bTitle: 'B & C',
      rows: [{ label: 'Price', a: '$1', b: '$2' }],
      note: 'note',
      dataChecked: '2026-01-01',
    });
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&amp;');
  });

  it('names both sides on every card', () => {
    for (const [a, b] of hardwarePairs(data)) {
      const t = text(hardwareVersusCard(a, b, data));
      expect(t).toContain(String(a.unified_memory_gb));
      expect(t).toContain(String(b.unified_memory_gb));
    }
    for (const [a, b] of modelPairs(data)) {
      const t = text(modelVersusCard(a, b, data));
      for (const m of [a, b]) expect(t.replace(/\s+/g, ' ')).toContain(m.display_name.split(' ')[0].split('-')[0]);
    }
  });

  it('shows the price the page shows, from the data', () => {
    const [a, b] = hardwarePairs(data)[0];
    const t = text(hardwareVersusCard(a, b, data));
    expect(t).toContain(fmtUsd(a.price_usd));
    expect(t).toContain(fmtUsd(b.price_usd));
  });

  it('counts the models that fit the way the comparison page counts them', () => {
    const [a, b] = hardwarePairs(data)[0];
    const fits = (id: string) => {
      const v = computeView({ ...defaultState(data), hw: id }, data);
      return `${v.rows.filter((r) => r.fit.status === 'fits').length} of ${v.rows.length}`;
    };
    const t = text(hardwareVersusCard(a, b, data));
    expect(t).toContain(fits(a.id));
    expect(t).toContain(fits(b.id));
  });

  it('says when a price is a graphics card and not a whole computer', () => {
    const isCard = (h: { price_scope?: string }) => h.price_scope === 'card_only';
    const pairs = hardwarePairs(data);
    const withCard = pairs.filter(([a, b]) => isCard(a) || isCard(b));
    expect(withCard.length).toBeGreaterThan(0);
    for (const [a, b] of pairs) {
      const t = text(hardwareVersusCard(a, b, data)).replace(/\s+/g, ' ');
      expect(t.includes('card only'), hardwareComparePath(a, b)).toBe(isCard(a) || isCard(b));
    }
  });

  it('says it on a model card too, where the cheapest machine that runs one is a card', () => {
    const cheapest = (m: Parameters<typeof modelVersusCard>[0]) => runnersFor(m, data)[0]?.hw;
    let seen = 0;
    for (const [a, b] of modelPairs(data)) {
      const onACard = [a, b].some((m) => cheapest(m)?.price_scope === 'card_only');
      const t = text(modelVersusCard(a, b, data)).replace(/\s+/g, ' ');
      expect(t.includes('card only'), modelComparePath(a, b)).toBe(onACard);
      if (onACard) seen++;
    }
    expect(seen).toBeGreaterThan(0);
  });

  it('never ships a truncated name or an empty figure', () => {
    for (const c of cards) {
      expect(c.svg, c.page).not.toContain('…');
      expect(c.svg, c.page).not.toContain('undefined');
      expect(c.svg, c.page).not.toContain('NaN');
    }
  });
});

describe('the pairs the cards and the pages cut', () => {
  it('draws one card per comparison page, each at its own address', () => {
    const files = cards.map((c) => versusCardPath(c.page));
    expect(files.length).toBe(hardwarePairs(data).length + modelPairs(data).length);
    expect(new Set(files).size).toBe(files.length);
    for (const f of files) expect(f).toMatch(/^\/og\/[a-z0-9-]+\.png$/);
  });

  it('pairs every flagship with every other, every card with every other card, every memory tier of one machine with every other, every box with the cheapest box of the same hardware, every discontinued machine with its successor, once each', () => {
    const pairs = hardwarePairs(data);
    const key = (a: Hardware, b: Hardware) => [a.id, b.id].sort().join('|');
    const keys = pairs.map(([a, b]) => key(a, b));
    for (const [a, b] of pairs) expect(a.id).not.toBe(b.id);
    expect(new Set(keys).size).toBe(keys.length);

    const flagships = flagshipMachines(data);
    const cards = graphicsCards(data);
    const tiers = memoryTierPairs(data);
    const twins = sameSiliconPairs(data);
    const gens = generationPairs(data);
    const want = new Set<string>();
    for (const xs of [flagships, cards])
      for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) want.add(key(xs[i], xs[j]));
    for (const [a, b] of [...tiers, ...twins, ...gens]) want.add(key(a, b));
    expect(new Set(keys)).toEqual(want);

    // a card is priced as the part, not as a computer, and the flagship grid on its own
    // left five of the seven cards out of every head-to-head on the site
    expect(cards.length).toBeGreaterThan(2);
    for (const c of cards) expect(c.price_scope).toBe('card_only');

    // the flagship grid is written first, so a pair both rules reach keeps its address
    for (const [a, b] of pairs.slice(0, (flagships.length * (flagships.length - 1)) / 2)) {
      expect(flagships.map((h) => h.id)).toContain(a.id);
      expect(flagships.map((h) => h.id)).toContain(b.id);
    }
    // two of the flagships are themselves cards, so one pair is in both grids and is
    // written once: the union is the page set, not the sum
    expect(pairs.length).toBe(want.size);
    // and the three later rules are appended after both grids, in the order they run, for
    // the same reason: a pair keeps the address it has always had
    const later = [...tiers, ...twins, ...gens];
    const tail = pairs.slice(-later.length).map(([a, b]) => key(a, b));
    expect(tail).toEqual(later.map(([a, b]) => key(a, b)));
  });

  it('puts each discontinued machine against the one that replaced it, and reads the successor out of the chip names', () => {
    const gens = generationPairs(data);
    expect(gens.length).toBeGreaterThan(0);

    for (const [old, now] of gens) {
      // the older side first, because that is the machine the reader already has
      expect(old.generation).toBe('previous');
      expect(now.generation ?? 'current').toBe('current');
      // the same case, the same class of chip and the same memory: the page's whole
      // answer is that the newer chip buys no room, so the rule has to hold the room equal
      expect(old.family).toBe(now.family);
      expect(old.unified_memory_gb).toBe(now.unified_memory_gb);
      expect(old.usable_memory_gb).toBe(now.usable_memory_gb);
      expect(appleChip(old)!.tier).toBe(appleChip(now)!.tier);
      expect(appleChip(old)!.gen).toBeLessThan(appleChip(now)!.gen);
      // pay-back is what the page is for, and pay-back needs two prices
      for (const h of [old, now]) expect(h.price_usd).not.toBeNull();
    }

    // one machine to a pair on each side, so no page says the same thing twice
    const olds = gens.map(([old]) => old.id);
    expect(new Set(olds).size).toBe(olds.length);

    // every discontinued machine whose successor this data prices gets a page, and the
    // one whose successor has no price does not: there is no pay-back to compare
    const unpriced = data.hardware.filter(
      (h) => h.generation === 'previous' && h.price_usd != null && appleChip(h)
        && data.hardware.some((x) => (x.generation ?? 'current') === 'current' && x.family === h.family
          && x.unified_memory_gb === h.unified_memory_gb && appleChip(x)?.tier === appleChip(h)!.tier
          && (appleChip(x)?.gen ?? 0) > appleChip(h)!.gen && x.price_usd == null),
    );
    for (const h of unpriced) expect(olds).not.toContain(h.id);
  });

  it('takes the chip names Apple writes and nothing else', () => {
    const chip = (name: string) => appleChip({ chip: name } as Hardware);
    expect(chip('M4')).toEqual({ gen: 4, tier: '' });
    expect(chip('M4 Pro')).toEqual({ gen: 4, tier: 'Pro' });
    expect(chip('M5 Max (16-inch)')).toEqual({ gen: 5, tier: 'Max' });
    expect(chip('M3 Ultra')).toEqual({ gen: 3, tier: 'Ultra' });
    // a GeForce RTX 4090 does not say in its name what replaced it, and the card that
    // did carries a different amount of memory, so no rule here can guess the successor
    expect(chip('GeForce RTX 4090')).toBeNull();
    expect(chip('Ryzen AI Max+ 395 \u00b7 Radeon 8060S, 40 CU')).toBeNull();
    expect(chip('GB10 Grace Blackwell')).toBeNull();
  });

  it('names a generation pair by its two chips and its size once, and names nothing else', () => {
    const by = (id: string) => data.hardware.find((h) => h.id === id)!;
    expect(generationNames(by('mac-mini-m4-32'), by('mac-mini-m6-32'))).toEqual({
      machine: 'Mac mini', a: 'M4', b: 'M6', size: '32GB',
    });
    // the newer side is not the older side: the pair is only ever written one way round
    expect(generationNames(by('mac-mini-m6-32'), by('mac-mini-m4-32'))).toBeNull();
    // two memory tiers of one machine are the same chip, and two boxes on the same
    // silicon are both on sale; neither is a generation apart
    for (const [a, b] of [...memoryTierPairs(data), ...sameSiliconPairs(data)])
      expect(generationNames(a, b)).toBeNull();
    // a different tier of the same generation is a different machine, not a successor
    expect(generationNames(by('mac-mini-m4-pro-24'), by('mac-mini-m6-24'))).toBeNull();
  });

  it('reads the day a machine stopped being sold out of the availability note', () => {
    const by = (id: string) => data.hardware.find((h) => h.id === id)!;
    expect(discontinuedOn(by('mac-mini-m4-32'))).toBe('25 August 2026');
    // a card that is superseded rather than withdrawn has no date in the data, and the
    // page must not invent one
    expect(discontinuedOn(by('geforce-rtx-4090-24'))).toBeNull();
    expect(discontinuedOn(by('mac-mini-m6-32'))).toBeNull();
  });

  it('says in the first paragraph that a previous generation\'s price is the one it launched at', () => {
    const st = defaultState(data);
    const view = (id: string) => computeView({ ...st, hw: id }, data);
    const by = (id: string) => data.hardware.find((h) => h.id === id)!;
    const verdict = (x: string, y: string) => machineVerdict(by(x), by(y), view(x), view(y), data);

    // on these pages the discontinued machine is the cheaper one, so it is the one the
    // lede hands the win to, and a lede that stops there sells a machine nobody sells
    const one = verdict('mac-mini-m4-32', 'mac-mini-m6-32');
    expect(one).toContain('The Mac mini M4, 32GB costs $300 less.');
    expect(one).toContain('The Mac mini M4, 32GB is the previous generation, so every figure here for it is priced at what it launched at rather than at a price you can pay today.');
    expect(one.trimEnd().endsWith('you can pay today.')).toBe(true);

    // both sides previous generation, which is every head-to-head between two of the
    // four older cards: one sentence, not the same one twice
    const two = verdict('geforce-rtx-4090-24', 'geforce-rtx-3090-24');
    expect(two).toContain('Both are previous-generation parts, so every figure here is priced at what they launched at rather than at prices you can pay today.');
    expect(two).not.toContain('is the previous generation, so every figure');

    // and a pair of current machines says nothing about launch prices at all
    expect(verdict('mac-mini-m6-32', 'mac-studio-m5-max-36')).not.toContain('launched at');
  });

  it('puts two memory tiers of one machine against each other, and nothing else', () => {
    const tiers = memoryTierPairs(data);
    expect(tiers.length).toBeGreaterThan(0);

    for (const [a, b] of tiers) {
      // the page names one machine and two sizes, so the two sides must be that machine
      expect(a.family).toBe(b.family);
      expect(a.chip).toBe(b.chip);
      expect(a.chip_variant ?? '').toBe(b.chip_variant ?? '');
      expect(a.unified_memory_gb).toBeLessThan(b.unified_memory_gb);
      // pay-back needs a price, and the question only arises while you can still choose
      for (const h of [a, b]) {
        expect(h.price_usd).not.toBeNull();
        expect(h.generation ?? 'current').toBe('current');
      }
    }

    // every tier of every machine a buyer can still configure, not just the adjacent ones
    const groups = new Map<string, Hardware[]>();
    for (const h of data.hardware) {
      if (h.price_usd == null || (h.generation ?? 'current') !== 'current') continue;
      const k = `${h.family}|${h.chip}|${h.chip_variant ?? ''}`;
      groups.set(k, [...(groups.get(k) ?? []), h]);
    }
    const want = [...groups.values()].filter((g) => g.length > 1).reduce((n, g) => n + (g.length * (g.length - 1)) / 2, 0);
    expect(tiers.length).toBe(want);
  });

  it('puts each box against the cheapest box of the same hardware, and nothing else', () => {
    const twins = sameSiliconPairs(data);
    expect(twins.length).toBeGreaterThan(0);

    for (const [a, b] of twins) {
      // the page says these are the same machine inside, so every figure that decides
      // what it holds and how fast it runs has to be equal on both sides
      expect(sameSilicon(a, b)).toBe(true);
      expect(gpuPart(a)).toBe(gpuPart(b));
      expect(gpuPart(a)).not.toBe('');
      expect(a.unified_memory_gb).toBe(b.unified_memory_gb);
      expect(a.memory_bandwidth_gbs).toBe(b.memory_bandwidth_gbs);
      expect(a.usable_memory_gb).toBe(b.usable_memory_gb);
      // and a different manufacturer, or it is the same machine twice
      expect(a.chip).not.toBe(b.chip);
      // the whole page is the price, so both sides need one, and the question only
      // arises while you can still buy either
      for (const h of [a, b]) {
        expect(h.price_usd).not.toBeNull();
        expect(h.generation ?? 'current').toBe('current');
      }
      // cheapest side first: the page asks what the dearer box charges on top
      expect(a.price_usd!).toBeLessThanOrEqual(b.price_usd!);
    }

    // not a grid. Every box in a group runs the same models at the same speed, so a grid
    // would write the same answer many times over; each dearer box goes against the one
    // cheapest box, and that is the only pairing this rule makes
    const groups = new Map<string, Hardware[]>();
    for (const h of data.hardware) {
      if (h.price_usd == null || (h.generation ?? 'current') !== 'current' || gpuPart(h) === '') continue;
      const k = `${h.family}|${gpuPart(h)}|${h.unified_memory_gb}|${h.memory_bandwidth_gbs}|${h.usable_memory_gb}`;
      groups.set(k, [...(groups.get(k) ?? []), h]);
    }
    const want = [...groups.values()].filter((g) => g.length > 1).reduce((n, g) => n + g.length - 1, 0);
    expect(twins.length).toBe(want);
    const cheapest = new Set(twins.map(([a]) => a.id));
    expect(cheapest.size).toBe([...groups.values()].filter((g) => g.length > 1).length);
  });

  it('names the machine once on a memory-tier pair, and not at all on any other', () => {
    for (const [a, b] of memoryTierPairs(data)) {
      const n = memoryTierNames(a, b)!;
      expect(n).not.toBeNull();
      // the name carries no size, and each side is the size it belongs to
      expect(n.machine).not.toMatch(/GB/);
      expect(n.a).toBe(`${a.unified_memory_gb}GB`);
      expect(n.b).toBe(`${b.unified_memory_gb}GB`);
      expect(shortHardwareLabel(a)).toBe(`${n.machine}, ${n.a}`);
      expect(shortHardwareLabel(b)).toBe(`${n.machine}, ${n.b}`);
      // and the title it builds still fits a search result
      expect(`${n.machine}: ${n.a} vs ${n.b} for local LLMs`.length).toBeLessThanOrEqual(60);
    }

    // two different machines are never one machine with more memory, whatever their sizes
    const tierKeys = new Set(memoryTierPairs(data).map(([a, b]) => [a.id, b.id].sort().join('|')));
    for (const [a, b] of hardwarePairs(data)) {
      if (tierKeys.has([a.id, b.id].sort().join('|'))) continue;
      expect(memoryTierNames(a, b)).toBeNull();
    }
  });

  it('pairs each scored model with the next one down the leaderboard', () => {
    const ranked = rankedModels(data);
    expect(modelPairs(data).length).toBe(ranked.length - 1);
    for (const [a, b] of modelPairs(data)) {
      expect(a.frontier_equivalent!.score!).toBeGreaterThanOrEqual(b.frontier_equivalent!.score!);
      expect(a.display_name).not.toBe(b.display_name);
    }
  });

  it('addresses a card from the page it belongs to', () => {
    const [a, b] = hardwarePairs(data)[0];
    expect(hardwareComparePath(a, b)).toMatch(/^\/compare\/.+-vs-.+\/$/);
    expect(versusCardPath(hardwareComparePath(a, b))).toBe(`/og/${hardwareComparePath(a, b).replace(/^\/|\/$/g, '').replace(/\//g, '-')}.png`);
  });
});
