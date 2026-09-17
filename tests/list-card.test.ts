import { describe, expect, it } from 'vitest';
import {
  BEST_CARD, bestBuysCard, COMPARE_CARD, compareIndexCard, LEADERBOARD_CARD, leaderboardCard, listCardSvg,
  MEMORY_CARD, memoryCard, quickestAt,
} from '../src/list-card';
import { bestUsageLevels } from '../src/best';
import {
  bandFit, cheapestThatHolds, computeView, fitsOf, fmtGb1, priceWithScopeText, shortHardwareLabel, SIZE_BANDS,
} from '../src/pagekit';
import { footprintGb } from '../src/fit';
import { defaultState } from '../src/state';
import { fmtDuration, fmtGb, fmtTokens, fmtUsd } from '../src/format';
import { flagshipMachines, hardwarePairs, modelPairs, VS_HEIGHT, VS_WIDTH } from '../src/versus-card';
import type { Dataset } from '../src/types';
import hardware from '../data/hardware.json';
import models from '../data/models.json';
import throughput from '../data/throughput.json';
import defaults from '../data/defaults.json';

const data = { hardware, models, throughput, defaults } as unknown as Dataset;

const leaderboard = leaderboardCard(data);
const best = bestBuysCard(data);
const compare = compareIndexCard(data);
const memory = memoryCard(data);
const cards = [leaderboard, best, compare, memory];

const text = (svg: string) => svg.replace(/<[^>]*>/g, ' ');
/** The same text with the spaces taken out, so a name that wrapped onto two lines still matches. */
const flat = (svg: string) => text(svg).replace(/\s+/g, '');
const noSpace = (s: string) => s.replace(/\s+/g, '');

describe('the list card', () => {
  it('is a 1200×630 SVG', () => {
    for (const svg of cards) {
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain(`width="${VS_WIDTH}" height="${VS_HEIGHT}"`);
      expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
    }
  });

  it('escapes anything that could close a tag early', () => {
    const svg = listCardSvg({
      eyebrow: 'List',
      headline: 'A </text><script>',
      columns: { name: 'Model & more', meta: 'Weights', value: 'Score' },
      rows: [{ name: 'B & C', meta: '<b>', value: '1', valueSub: '"x"' }],
      metaX: 520,
      metaW: 260,
      valueW: 72,
      note: 'note & more',
      dataChecked: '2026-01-01',
    });
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;/text&gt;');
    expect(svg).toContain('B &amp; C');
  });

  it('keeps every line of text inside the canvas', () => {
    for (const svg of cards) {
      for (const m of svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"/g)) {
        expect(Number(m[1])).toBeGreaterThanOrEqual(0);
        expect(Number(m[1])).toBeLessThanOrEqual(VS_WIDTH);
        expect(Number(m[2])).toBeGreaterThan(0);
        expect(Number(m[2])).toBeLessThan(VS_HEIGHT);
      }
    }
  });

  it('keeps every bar inside the panel', () => {
    for (const m of leaderboard.matchAll(/<rect x="(\d+)" y="([\d.]+)" width="([\d.]+)" height="18"/g)) {
      expect(Number(m[1]) + Number(m[3])).toBeLessThanOrEqual(VS_WIDTH - 72);
      expect(Number(m[2])).toBeGreaterThan(190);
      expect(Number(m[2]) + 18).toBeLessThan(568);
    }
  });

  it('says nothing a reader should not see', () => {
    for (const svg of cards) {
      expect(text(svg)).not.toMatch(/undefined|NaN|TODO|…/);
    }
  });
});

describe('the leaderboard card', () => {
  const scored = data.models
    .filter((m) => m.frontier_equivalent?.score != null)
    .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!);
  const seen = new Set<string>();
  const unique = scored.filter((m) => (seen.has(m.display_name) ? false : (seen.add(m.display_name), true)));

  it('leads with the best hosted model, which is the gap the page is about', () => {
    const top = [...data.defaults.frontier_reference!].sort((a, b) => b.score - a.score)[0];
    expect(flat(leaderboard)).toContain(noSpace(top.name));
    expect(text(leaderboard)).toContain('not downloadable');
    // the hosted bar is the longest on the card, because no open model has caught it
    const widths = [...leaderboard.matchAll(/height="18" rx="9" fill="#(?:1f5479|9fb3c2)"/g)];
    expect(widths.length).toBe(6);
  });

  it('lists the top five open models with the page’s own scores and weights', () => {
    for (const m of unique.slice(0, 5)) {
      expect(flat(leaderboard)).toContain(noSpace(m.display_name));
      expect(flat(leaderboard)).toContain(noSpace(fmtGb(m.weights_gb)));
      expect(text(leaderboard)).toContain(String(m.frontier_equivalent!.score!));
    }
  });

  it('counts the models the page counts', () => {
    expect(text(leaderboard)).toContain(`${unique.length} open models`);
    expect(text(leaderboard)).toContain(data.defaults.frontier_basis!.name);
  });

  it('draws each bar in proportion to the score it stands for', () => {
    const max = data.defaults.frontier_scale_max!;
    const fills = [...leaderboard.matchAll(/width="([\d.]+)" height="18" rx="9" fill="#(1f5479|9fb3c2)"/g)];
    const track = Number(leaderboard.match(/width="([\d.]+)" height="18" rx="9" fill="#eef1f2"/)![1]);
    const top = [...data.defaults.frontier_reference!].sort((a, b) => b.score - a.score)[0];
    const scores = [top.score, ...unique.slice(0, 5).map((m) => m.frontier_equivalent!.score!)];
    fills.forEach((m, n) => expect(Number(m[1])).toBeCloseTo((scores[n] / max) * track, 0));
  });

  it('is drawn where the page asks for it', () => {
    expect(LEADERBOARD_CARD).toBe('/og/leaderboard.png');
  });
});

describe('the best buys card', () => {
  it('gives one row to every usage level the page has a section for', () => {
    for (const l of bestUsageLevels(data)) {
      expect(text(best)).toContain(`${fmtTokens(l.usage)} tokens a day`);
      expect(text(best)).toContain(l.label);
    }
  });

  it('shows the quickest pay-back at each level, on the machine that gets it', () => {
    for (const l of bestUsageLevels(data)) {
      const q = quickestAt(data, l.usage);
      expect(q).not.toBeNull();
      expect(text(best)).toContain(fmtDuration(q!.days));
      expect(flat(best)).toContain(noSpace(shortHardwareLabel(q!.hw)));
      expect(flat(best)).toContain(noSpace(q!.model.display_name));
      // the class is on the card because the quickest pay-back need not be the most capable model
      expect(text(best)).toContain(q!.tier);
    }
  });

  it('states the assumptions the figures were computed on', () => {
    const d = data.defaults;
    expect(text(best)).toContain(`${d.usage.default_input_to_output_ratio}:1 input:output`);
    expect(text(best)).toContain(`${Math.round(d.context.default_tokens / 1024)}k context`);
    expect(text(best)).toContain(`Data checked ${d.data_last_checked}`);
  });

  it('is drawn where the page asks for it', () => {
    expect(BEST_CARD).toBe('/og/best.png');
  });
});

describe('the head-to-head card', () => {
  const st = defaultState(data);
  const held = (id: string) => {
    const view = computeView({ ...st, hw: id }, data);
    return { fits: fitsOf(view).length, of: view.rows.length };
  };
  // cheapest first among however many hold the same number, which is the order
  // the index's own first table is ranked in
  const ranked = flagshipMachines(data)
    .map((hw) => ({ hw, ...held(hw.id) }))
    .sort((a, b) => b.fits - a.fits || a.hw.price_usd! - b.hw.price_usd!);
  // the three columns, read back off the card: names, prices, and the figure
  // each row is ranked on
  const names = [...compare.matchAll(/letter-spacing="-0\.3">([^<]+)</g)].map((m) => m[1]);
  const prices = [...compare.matchAll(/font-weight="500"[^>]*>([^<]+)</g)].map((m) => m[1]);
  const values = [...compare.matchAll(/letter-spacing="-0\.4"[^>]*>([^<]+)</g)].map((m) => m[1]);
  const shown = ranked.slice(0, values.length);

  it('lists the machines the comparison pages are cut from, the fullest first', () => {
    expect(values.length).toBeGreaterThan(3);
    expect(values.length).toBeLessThanOrEqual(ranked.length);
    expect(noSpace(names.join(''))).toBe(noSpace(shown.map((r) => shortHardwareLabel(r.hw)).join('')));
  });

  it('counts what a machine holds against the total the machine pages count against', () => {
    expect(values).toEqual(shown.map((r) => String(r.fits)));
    // every machine is counted against the same set of models, and it is the
    // current ones rather than every model the leaderboard ranks
    expect(new Set(ranked.map((r) => r.of)).size).toBe(1);
    expect(ranked[0].of).toBeLessThan(data.models.length);
    expect(text(compare)).toContain(`of ${ranked[0].of}`);
  });

  it('says which prices buy a card rather than a computer', () => {
    expect(prices).toEqual(shown.map((r) => priceWithScopeText(r.hw)));
    for (const r of shown.filter((x) => x.hw.price_scope === 'card_only'))
      expect(text(compare)).toContain(`${priceWithScopeText(r.hw)}`);
  });

  it('counts the match-ups the index lists', () => {
    expect(text(compare)).toContain(`${ranked.length} machines`);
    expect(text(compare)).toContain(`${hardwarePairs(data).length} machine pairs`);
    expect(text(compare)).toContain(`${modelPairs(data).length} model pairs`);
  });

  it('is drawn where the page asks for it', () => {
    expect(COMPARE_CARD).toBe('/og/compare.png');
  });
});

describe('the memory card', () => {
  const ctx = data.defaults.context.default_tokens;
  const bands = SIZE_BANDS.map((b) => bandFit(b, data, ctx)).filter((b) => b != null);

  it('gives one row to every size band the page has a section for', () => {
    expect(bands.length).toBe(SIZE_BANDS.length);
    for (const b of bands) expect(flat(memory)).toContain(noSpace(b!.band.label));
  });

  it('names the hungriest model in the band that a machine on this list holds', () => {
    for (const b of bands) {
      const pick = b!.held ?? b!.biggest;
      expect(flat(memory)).toContain(noSpace(pick.m.display_name));
      expect(flat(memory)).toContain(noSpace(pick.m.quantisation));
      // nothing hungrier in the band fits, or the card would be naming the wrong model
      for (const x of b!.sized) {
        if (x.need > pick.need) expect(cheapestThatHolds(x.need, data)).toBeNull();
      }
    }
  });

  it('prints the figure the page prints, weights and cache added together', () => {
    for (const b of bands) {
      const pick = b!.held ?? b!.biggest;
      expect(fmtGb1(pick.need)).toBe(fmtGb1(footprintGb(pick.m, ctx)));
      expect(flat(memory)).toContain(noSpace(fmtGb1(pick.need)));
    }
  });

  it('never names a machine that cannot hold the figure beside it', () => {
    for (const b of bands) {
      const pick = b!.held ?? b!.biggest;
      const hw = b!.heldBy;
      if (!hw) continue;
      expect(hw.usable_memory_gb!).toBeGreaterThanOrEqual(pick.need);
      expect(flat(memory)).toContain(noSpace(shortHardwareLabel(hw)));
      expect(flat(memory)).toContain(noSpace(fmtUsd(hw.price_usd)));
      // cheapest, not merely one that fits
      for (const other of data.hardware) {
        if ((other.generation ?? 'current') !== 'current' || other.price_usd == null) continue;
        if ((other.usable_memory_gb ?? 0) >= pick.need) expect(other.price_usd).toBeGreaterThanOrEqual(hw.price_usd!);
      }
    }
  });

  it('states the assumptions the figures were computed on', () => {
    expect(text(memory)).toContain(`${Math.round(ctx / 1024)}k context`);
    expect(text(memory)).toContain('list price');
    expect(text(memory)).toContain(`Data checked ${data.defaults.data_last_checked}`);
  });

  it('is drawn where the page asks for it', () => {
    expect(MEMORY_CARD).toBe('/og/how-much-memory.png');
  });
});
