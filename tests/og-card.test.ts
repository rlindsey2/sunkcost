import { describe, expect, it } from 'vitest';
import { cardSvg } from '../src/card';
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
