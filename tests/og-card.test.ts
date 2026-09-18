import { describe, expect, it } from 'vitest';
import { cardSvg } from '../src/card';
import { OG_HEIGHT, OG_WIDTH, renderOgCard } from '../src/og';
import { renderWaterline } from '../src/waterline';
import { EM } from '../src/text-fit';
import { computeView } from '../src/compute';
import { defaultState } from '../src/state';
import type { Dataset } from '../src/types';
import hardware from '../data/hardware.json';
import models from '../data/models.json';
import throughput from '../data/throughput.json';
import defaults from '../data/defaults.json';

const data = { hardware, models, throughput, defaults } as unknown as Dataset;
const text = (svg: string) => svg.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

/** the strongest model a machine holds, which is the card the pages name for it */
const strongest = (hwId: string) => {
  const view = computeView({ ...defaultState(data), hw: hwId }, data);
  return view.rows.find((r) => r.fit.status === 'fits')!.model.id;
};
const card = (hwId: string, price: number | null = null) =>
  text(cardSvg({ ...defaultState(data), hw: hwId, model: strongest(hwId), price }, data)!);

const gpu = data.hardware.find((h) => h.price_scope === 'card_only' && h.price_usd != null)!;
const box = data.hardware.find((h) => h.price_scope !== 'card_only' && h.price_usd != null && (h.generation ?? 'current') === 'current')!;

describe('the share card’s hardware figure', () => {
  it('says when the price is the graphics card on its own', () => {
    expect(card(gpu.id)).toContain('Hardware (card only)');
  });

  it('leaves a whole computer’s price as it was', () => {
    const t = card(box.id);
    expect(t).toContain('Hardware ');
    expect(t).not.toContain('card only');
  });

  it('does not call a price somebody entered a card price', () => {
    expect(card(gpu.id, 3200)).not.toContain('card only');
  });
});

/** every text line the card draws at the left margin, with the size it is set at */
const lines = (svg: string) =>
  [...svg.matchAll(/<text x="56" y="([\d.]+)" font-size="(\d+)"([^>]*)>([^<]*)<\/text>/g)]
    .map((m) => ({ y: +m[1], size: +m[2], attrs: m[3], text: m[4] }))
    // the figures at the foot of the card sit below the water, and are short by construction
    .filter((l) => l.y < OG_HEIGHT - 158);
const detail = (svg: string) => lines(svg).filter((l) => l.attrs.includes('#cfe0ee'));
const sub = (svg: string) => lines(svg).filter((l) => l.attrs.includes('207,224,238'));
const verdict = (svg: string) => lines(svg).find((l) => l.attrs.includes('font-weight="700"'))!;

const withText = (over: Partial<Parameters<typeof renderOgCard>[0]>) =>
  renderOgCard({
    configLine: 'Mac mini M6, 16GB · Qwen3 8B Q4_K_M',
    usageLine: '500k tokens/day, 15:1 input:output',
    verdict: 'You never surface.',
    subLine: 'Saving $0.04 a day today, on $2,299 of hardware.',
    devicePriceUsd: 2299, dailySaving: 0.04, breakevenDays: null, maxYears: 10,
    figures: [], ...over,
  });

describe('the share card fits its text to the card', () => {
  it('keeps the configuration and the usage on one line while they fit', () => {
    const d = detail(withText({}));
    expect(d).toHaveLength(1);
    expect(d[0].text).toBe('Mac mini M6, 16GB · Qwen3 8B Q4_K_M · 500k tokens/day, 15:1 input:output');
    expect(d[0].size).toBe(22);
  });

  it('breaks between them, rather than off the edge, when they do not', () => {
    const d = detail(withText({ configLine: 'Strix Halo Corsair AI Workstation 300, 128GB · Mistral Small 3.2 24B Instruct Q4_K_M' }));
    expect(d.map((l) => l.text)).toEqual([
      'Strix Halo Corsair AI Workstation 300, 128GB · Mistral Small 3.2 24B Instruct Q4_K_M',
      '500k tokens/day, 15:1 input:output',
    ]);
    // and the second line sits below the first rather than on top of it
    expect(d[1].y).toBeGreaterThan(d[0].y);
  });

  it('sets a long verdict smaller instead of running it past the margin', () => {
    // a short one keeps the full size
    expect(verdict(withText({ verdict: 'You never surface.' })).size).toBe(60);
    // and a long one comes down until it fits, however long it is
    for (const v of ['You’re underwater for 5,287 years.', 'You’re underwater for 8,048,510 years.']) {
      const set = verdict(withText({ verdict: v }));
      expect(set.text).toBe(v);
      expect(set.text.length * set.size * 0.6).toBeLessThanOrEqual(OG_WIDTH - 56 * 2);
    }
  });

  it('wraps a long explanation instead of shrinking it', () => {
    const s = sub(withText({ subLine: 'Electricity alone costs more than the API would at this speed. Usage doesn’t help; every token sinks you further.' }));
    expect(s).toHaveLength(2);
    expect(s.every((l) => l.size === 20)).toBe(true);
    expect(s.map((l) => l.text).join(' ')).toContain('every token sinks you further.');
  });

  it('lifts the whole block when it grows, rather than pushing it into the figures', () => {
    const short = withText({});
    const tall = withText({ configLine: 'Strix Halo Corsair AI Workstation 300, 128GB · Mistral Small 3.2 24B Instruct Q4_K_M' });
    // the block is drawn over the chart, so the extra line takes its height from
    // the plot above rather than from the strip of figures below
    expect(verdict(tall).y).toBeLessThan(verdict(short).y);
    expect(sub(tall)[0].y).toBeGreaterThan(sub(short)[0].y - 1);
    expect(sub(tall).at(-1)!.y).toBeLessThan(OG_HEIGHT - 158);
  });
});

describe('no share card the build draws runs its text off the edge', () => {
  // The widest line the site produces measures 0.554 em per character in the faces
  // these cards are drawn in; EM is the estimate the fitting works from, and every
  // line has to come in under the card's own text width by it.
  const MAX = OG_WIDTH - 56 * 2;
  it('holds for every hardware × model pair with a card', () => {
    const offenders: string[] = [];
    for (const hw of data.hardware) {
      for (const m of data.models) {
        const svg = cardSvg({ ...defaultState(data), hw: hw.id, model: m.id }, data);
        if (!svg) continue;
        for (const l of lines(svg)) {
          const em = l.attrs.includes('font-weight="700"') ? 0.6 : EM;
          if (l.text.length * l.size * em > MAX) offenders.push(`${hw.id}|${m.id}: ${l.text}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('the chart on a share card keeps its labels in the card’s column', () => {
  // Every line the card writes starts at 56 and ends by 1144. The waterline is
  // drawn edge to edge under them, so without a margin of its own its labels sit
  // out in the bleed, 35px clear of the words they belong with.
  const COL_L = 56;
  const COL_R = OG_WIDTH - 56;
  /** the chart's own labels: everything above the figures strip, with its anchor */
  const chartLabels = (svg: string) =>
    [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"([^>]*)>([^<]*)<\/text>/g)]
      .map((m) => ({ x: +m[1], y: +m[2], attrs: m[3], text: m[4] }))
      .filter((l) => l.y < OG_HEIGHT - 158)
      .map((l) => ({ ...l, anchor: /text-anchor="end"/.test(l.attrs) ? 'end' : /text-anchor="middle"/.test(l.attrs) ? 'middle' : 'start' }));

  it('starts no label left of the column, and ends none right of it', () => {
    const offenders: string[] = [];
    for (const hw of data.hardware) {
      for (const m of data.models) {
        const svg = cardSvg({ ...defaultState(data), hw: hw.id, model: m.id }, data);
        if (!svg) continue;
        for (const l of chartLabels(svg)) {
          if (l.anchor === 'start' && l.x < COL_L) offenders.push(`${hw.id}|${m.id}: “${l.text}” starts at ${l.x}`);
          if (l.anchor === 'end' && l.x > COL_R) offenders.push(`${hw.id}|${m.id}: “${l.text}” ends at ${l.x}`);
          if (l.anchor === 'middle') {
            // a time tick is centred on its own year, so what has to be inside
            // the column is the label either side of it
            const half = (l.text.length * +(/font-size="([\d.]+)"/.exec(l.attrs)?.[1] ?? 0) * EM) / 2;
            if (l.x - half < COL_L || l.x + half > COL_R) offenders.push(`${hw.id}|${m.id}: “${l.text}” centred at ${l.x}`);
          }
        }
      }
    }
    expect(offenders.slice(0, 5)).toEqual([]);
  });

  it('leaves the chart on the page running to its own edges', () => {
    // the page is all chart, so nothing is inset there: no margin passed, no margin taken
    const page = renderWaterline({ devicePriceUsd: 2299, dailySaving: 0.04, breakevenDays: null, maxYears: 10, width: 460, height: 340, plotHeight: 216, markerDays: 365.25 });
    expect(page).toContain('<text x="14" ');
    const inset = renderWaterline({ devicePriceUsd: 2299, dailySaving: 0.04, breakevenDays: null, maxYears: 10, width: 460, height: 340, plotHeight: 216, markerDays: 365.25, labelPadX: 56 });
    expect(inset).not.toContain('<text x="14" ');
    expect(inset).toContain('<text x="56" ');
  });
});
