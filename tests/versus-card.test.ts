import { describe, expect, it } from 'vitest';
import {
  clampText, fitLines, flagshipMachines, hardwareComparePath, hardwarePairs, hardwareVersusCard, modelComparePath,
  modelPairs, modelVersusCard, rankedModels, versusCardPath, versusCardSvg, wrapText, VS_HEIGHT, VS_WIDTH,
} from '../src/versus-card';
import { computeView } from '../src/compute';
import { runnersFor } from '../src/pagekit';
import { defaultState } from '../src/state';
import { fmtUsd } from '../src/format';
import type { Dataset } from '../src/types';
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

  it('pairs every flagship with every other, once', () => {
    const n = flagshipMachines(data).length;
    expect(hardwarePairs(data).length).toBe((n * (n - 1)) / 2);
    for (const [a, b] of hardwarePairs(data)) expect(a.id).not.toBe(b.id);
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
