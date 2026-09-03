import { describe, expect, it } from 'vitest';
import { calculate, positionAfterDays, splitTokens } from '../src/calc';
import { fit, kvCacheGbFromArchitecture, estimateTokensPerSec } from '../src/fit';
import { pickUnit } from '../src/units';
import { parseState, serializeState, sliderToUsage, usageToSlider } from '../src/state';
import { waterlineGeometry, renderWaterline } from '../src/waterline';
import { computeView } from '../src/compute';
import type { Dataset, Hardware, Model } from '../src/types';
import hardware from '../data/hardware.json';
import models from '../data/models.json';
import throughput from '../data/throughput.json';
import defaults from '../data/defaults.json';
import units from '../data/units.json';

const data = { hardware, models, throughput, defaults, units } as unknown as Dataset;

describe('calculate', () => {
  it('splits tokens by ratio', () => {
    expect(splitTokens(500_000, 4)).toEqual({ input: 400_000, output: 100_000 });
  });

  it('matches the spec formula on the worked example', () => {
    // 500k/day at 4:1, $0.08 in / $0.28 out, 20 tok/s, 145 W, $0.17/kWh, $2,699 machine
    const r = calculate({
      devicePriceUsd: 2699, dailyTokens: 500_000, inputRatio: 4,
      inputPricePerMtok: 0.08, outputPricePerMtok: 0.28,
      localTokensPerSec: 20, cloudTokensPerSec: 80, loadWatts: 145, pricePerKwh: 0.17, typicalTaskOutputTokens: 1000,
    });
    expect(r.cloudCostPerDay).toBeCloseTo(0.4 * 0.08 + 0.1 * 0.28, 6); // 0.06
    const hours = 100_000 / 20 / 3600; // 1.389 h
    expect(r.localCostPerDay).toBeCloseTo((hours * 145) / 1000 * 0.17, 6);
    expect(r.dailySaving).toBeCloseTo(r.cloudCostPerDay - r.localCostPerDay, 9);
    expect(r.breakevenDays).toBeCloseTo(2699 / r.dailySaving, 6);
    expect(r.breakevenTokens).toBeCloseTo(r.breakevenDays! * 500_000, 3);
  });

  it('never breaks even when electricity exceeds the API cost', () => {
    const r = calculate({
      devicePriceUsd: 1000, dailyTokens: 100_000, inputRatio: 4,
      inputPricePerMtok: 0.001, outputPricePerMtok: 0.001,
      localTokensPerSec: 2, cloudTokensPerSec: 80, loadWatts: 300, pricePerKwh: 0.5, typicalTaskOutputTokens: 1000,
    });
    expect(r.dailySaving).toBeLessThan(0);
    expect(r.breakevenDays).toBeNull();
    expect(r.breakevenTokens).toBeNull();
  });

  it('position rises linearly from -price', () => {
    expect(positionAfterDays(1000, 10, 0)).toBe(-1000);
    expect(positionAfterDays(1000, 10, 100)).toBe(0);
  });
});

describe('fit', () => {
  const hw: Hardware = { id: 'h', family: 'x', chip: 'c', unified_memory_gb: 64, memory_bandwidth_gbs: 546, usable_memory_gb: 48, price_usd: 1, idle_watts: 1, load_watts: 1 };
  const m = (weights: number, layers = 64): Model => ({
    id: 'm', display_name: 'm', params_b: 32, quantisation: 'Q4', weights_gb: weights, kv_cache_gb_per_8k: null,
    architecture: { n_layers: layers, n_kv_heads: 8, head_dim: 128 },
    capabilities: { summarisation: 'green', translation: 'green', everyday_coding: 'green', complex_reasoning: 'green', agentic: 'green' },
    capability_note: '', cloud_equivalent: { name: '', input_price_per_mtok: 0, output_price_per_mtok: 0, source: '', is_exact_match: true }, license: '',
  });

  it('derives KV cache from architecture', () => {
    // 2 × 8 × 128 × 2 bytes = 4096 B per token per layer; × 64 layers × 8192 tokens = 2.147 GB
    expect(kvCacheGbFromArchitecture(m(1), 8192)!).toBeCloseTo(2.147, 2);
  });

  it('caps sliding-window layers at the window', () => {
    const g: Model = { ...m(1), architecture: { n_layers: 6, n_kv_heads: 8, head_dim: 128, full_attention_layers: 1, sliding_window_layers: 5, sliding_window: 1024 } };
    const at8k = kvCacheGbFromArchitecture(g, 8192)!;
    const at64k = kvCacheGbFromArchitecture(g, 65536)!;
    // only the 1 full layer scales ×8; the 5 windowed layers stay fixed
    expect(at64k / at8k).toBeLessThan(8);
    expect(at64k / at8k).toBeGreaterThan(1);
  });

  it('classifies fits / nearly / no', () => {
    expect(fit(m(20), hw, 32768, 1.4).status).toBe('fits'); // 20 + 8.6 = 28.6 ≤ 48
    expect(fit(m(45), hw, 32768, 1.4).status).toBe('nearly'); // 53.6 ≤ 67.2
    expect(fit(m(80), hw, 32768, 1.4).status).toBe('no');
  });

  it('estimates tok/s from bandwidth, reading only active params for MoE', () => {
    const dense = estimateTokensPerSec(m(20), hw, 0.6)!;
    expect(dense).toBeCloseTo((546 / 20) * 0.6, 6);
    const moe = estimateTokensPerSec({ ...m(20), active_params_b: 3.2 }, hw, 0.6)!;
    expect(moe).toBeCloseTo((546 / (20 * 0.1)) * 0.6, 6);
  });
});

describe('units', () => {
  it('is deterministic per seed and varies across seeds', () => {
    const a = pickUnit(1.2e9, 'seed-a', data.units)!;
    const b = pickUnit(1.2e9, 'seed-a', data.units)!;
    expect(a.text).toBe(b.text);
    const texts = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map((s) => pickUnit(1.2e9, s, data.units)!.unit.id));
    expect(texts.size).toBeGreaterThan(1);
  });
  it('prefers counts a human can picture', () => {
    const p = pickUnit(5e8, 'x', data.units)!;
    expect(p.count).toBeGreaterThanOrEqual(1.5);
    expect(p.count).toBeLessThan(10000);
    expect(p.text).toMatch(/^about /);
  });
});

describe('state', () => {
  it('round-trips through the query string', () => {
    const s = parseState('?hw=mac-studio-m5-max-64&m=qwen3-32b-q4&u=750000&r=6&kwh=0.3&ctx=65536&cs=120', data);
    expect(s).toMatchObject({ hw: 'mac-studio-m5-max-64', model: 'qwen3-32b-q4', usage: 750000, ratio: 6, kwh: 0.3, ctx: 65536, cloudTps: 120 });
    expect(parseState('?' + serializeState(s), data)).toEqual(s);
  });
  it('falls back on bad input', () => {
    const s = parseState('?hw=nope&u=abc&r=999', data);
    expect(data.hardware.some((h) => h.id === s.hw)).toBe(true);
    expect(s.usage).toBe(data.defaults.usage.default_tokens_per_day);
    expect(s.ratio).toBe(data.defaults.usage.max_input_to_output_ratio);
  });
  it('log slider is monotonic and round-trips near the default', () => {
    const { min_tokens_per_day: min, max_tokens_per_day: max } = data.defaults.usage;
    expect(sliderToUsage(0, min, max)).toBe(min);
    expect(sliderToUsage(1000, min, max)).toBe(max);
    const v = usageToSlider(500_000, min, max);
    expect(sliderToUsage(v, min, max)).toBeGreaterThan(450_000);
    expect(sliderToUsage(v, min, max)).toBeLessThan(550_000);
  });
});

describe('waterline', () => {
  it('marks never / off-chart / on-chart', () => {
    expect(waterlineGeometry({ devicePriceUsd: 1000, dailySaving: -1, breakevenDays: null, maxYears: 10 }).never).toBe(true);
    expect(waterlineGeometry({ devicePriceUsd: 1000, dailySaving: 0.1, breakevenDays: 10000, maxYears: 10 }).surfacesOffChart).toBe(true);
    const g = waterlineGeometry({ devicePriceUsd: 1000, dailySaving: 5, breakevenDays: 200, maxYears: 10 });
    expect(g.surfacesOnChart).toBe(true);
    expect(g.horizonDays).toBeCloseTo(290, 0);
  });
  it('renders valid-looking SVG with a surface line', () => {
    const svg = renderWaterline({ devicePriceUsd: 2699, dailySaving: 2, breakevenDays: 1349.5, maxYears: 10, markerDays: 365.25 });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('surfaces at 3.7 yrs');
    expect(svg).toContain('underwater');
    expect(svg.endsWith('</svg>')).toBe(true);
  });
});

describe('computeView on real data', () => {
  it('computes a verdict for the default state', () => {
    const s = parseState('', data);
    const v = computeView(s, data);
    expect(v.model).not.toBeNull();
    expect(v.calc).not.toBeNull();
    expect(['surfaces', 'never']).toContain(v.verdict.kind);
    expect(v.rows.every((r) => r.fit.status !== 'no')).toBe(true);
  });
  it('falls back to a model that fits when the URL model does not', () => {
    const v = computeView(parseState('?hw=mac-mini-m6-16&m=qwen3-235b-a22b-2507-q4', data), data);
    expect(v.model?.id).not.toBe('qwen3-235b-a22b-2507-q4');
  });
  it('blocks rather than guesses when the price is unknown', () => {
    const v = computeView(parseState('?hw=mac-studio-m5-ultra-512', data), data);
    expect(v.calc).toBeNull();
    expect(v.verdict.kind).toBe('unknown');
    expect(v.blockers.join()).toMatch(/price/);
  });
});
