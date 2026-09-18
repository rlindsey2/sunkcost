import { describe, expect, it } from 'vitest';
import { calculate, cumulativeSaving, DAYS_PER_YEAR, positionAfterDays, splitTokens } from '../src/calc';
import { fit, kvCacheGbFromArchitecture, estimateTokensPerSec, contextSpeedFactor, resolveThroughput } from '../src/fit';
import { parseState, serializeState, sliderToUsage, usageToSlider, parseSharePath } from '../src/state';
import { sharePath, cardQuery } from '../src/share';
import { cardSvg, cardView } from '../src/card';
import { bestByTier, bestUsageLevels } from '../src/best';
import { submissionPayload, submissionRow } from '../src/submissions';
import { waterlineGeometry, renderWaterline, labelDays } from '../src/waterline';
import { computeView } from '../src/compute';
import type { Dataset, Hardware, Model } from '../src/types';
import hardware from '../data/hardware.json';
import models from '../data/models.json';
import throughput from '../data/throughput.json';
import defaults from '../data/defaults.json';

const data = { hardware, models, throughput, defaults } as unknown as Dataset;

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
  it('frames the whole climb whenever there is one', () => {
    // never pays back: fall back to the fixed span, and the flat line is the point
    const never = waterlineGeometry({ devicePriceUsd: 1000, dailySaving: -1, breakevenDays: null, maxYears: 10 });
    expect(never.never).toBe(true);
    expect(never.surfacesOnChart).toBe(false);
    expect(never.horizonDays).toBeCloseTo(3652.5, 0);
    // a payback centuries out still surfaces on the chart; the axis carries the scale
    const far = waterlineGeometry({ devicePriceUsd: 1000, dailySaving: 0.1, breakevenDays: 10000, maxYears: 10 });
    expect(far.surfacesOnChart).toBe(true);
    expect(far.horizonDays).toBeCloseTo(11600, 0);
    const near = waterlineGeometry({ devicePriceUsd: 1000, dailySaving: 5, breakevenDays: 200, maxYears: 10 });
    expect(near.surfacesOnChart).toBe(true);
    expect(near.horizonDays).toBeCloseTo(232, 0);
  });
  it('renders valid-looking SVG with a surface line', () => {
    const svg = renderWaterline({ devicePriceUsd: 2699, dailySaving: 2, breakevenDays: 1349.5, maxYears: 10, markerDays: 365.25 });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('surfaces at 3.7 yrs');
    expect(svg).toContain('underwater');
    expect(svg).toContain('BREAK EVEN');
    expect(svg.endsWith('</svg>')).toBe(true);
  });

  /** the time labels along the foot of the plot, in the order they are drawn */
  const ticks = (svg: string) =>
    [...svg.matchAll(/<text x="[\d.]+" y="[\d.]+" text-anchor="middle"[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
  const axis = (breakevenDays: number) =>
    ticks(renderWaterline({ devicePriceUsd: 1000, dailySaving: 0.01, breakevenDays, maxYears: 10, width: 460, height: 340 }));

  it('labels the time axis six times at most, however long the wait', () => {
    // a step ladder that stops has to reuse its last rung: at a horizon of
    // millions of years a label every hundred is tens of thousands of them,
    // stacked at the origin
    for (const years of [0.5, 2, 4, 9, 40, 300, 900, 40_000, 8_000_000]) {
      const labels = axis(years * 365.25);
      expect(labels.length).toBeLessThanOrEqual(6);
      expect(labels.length).toBeGreaterThan(0);
    }
  });

  it('groups the digits of a year label, the way every other figure is set', () => {
    expect(axis(8_000_000 * 365.25).every((l) => /^[\d,]+ yr$/.test(l))).toBe(true);
    expect(axis(8_000_000 * 365.25).some((l) => l.includes(','))).toBe(true);
    expect(labelDays(8_278_467 * 365.25)).toBe('8,278,467 yrs');
    // and leaves the short ones as they were
    expect(labelDays(3.7 * 365.25)).toBe('3.7 yrs');
    expect(labelDays(365.25)).toBe('1 yr');
    expect(axis(4 * 365.25)).toContain('1 yr');
  });
});

describe('computeView on real data', () => {
  it('computes a verdict for the default state', () => {
    const s = parseState('', data);
    const v = computeView(s, data);
    expect(v.model).not.toBeNull();
    expect(v.calc).not.toBeNull();
    expect(['surfaces', 'never']).toContain(v.verdict.kind);
    // every model is listed; the ones that don't fit come after the ones that do
    expect(v.rows.some((r) => r.fit.status === 'no')).toBe(true);
    const lastFit = v.rows.map((r) => r.fit.status === 'fits').lastIndexOf(true);
    expect(v.rows.slice(0, lastFit + 1).every((r) => r.fit.status === 'fits')).toBe(true);
  });
  it('falls back to a model that fits when the URL model does not', () => {
    const v = computeView(parseState('?hw=mac-mini-m6-16&m=qwen3-235b-a22b-2507-q4', data), data);
    expect(v.model?.id).not.toBe('qwen3-235b-a22b-2507-q4');
  });
  it('blocks rather than guesses when the price is unknown', () => {
    const v = computeView(parseState('?hw=mac-studio-m5-ultra-512', data), data);
    expect(v.calc).toBeNull();
    expect(v.verdict.kind).toBe('unpriced');
    expect(v.blockers.join()).toMatch(/price/);
  });
});

describe('capacity and context limits', () => {
  it('caps usage at what the machine can generate in 24 hours', () => {
    const s = parseState('?hw=mac-mini-m4-16&m=llama-3.1-8b-q4&u=20000000&r=4&ctx=8192', data);
    const v = computeView(s, data);
    // measured 21.2 tok/s, adjusted for 8k context, × 86,400 s × (4 + 1) < 20M requested
    expect(v.capacity.capped).toBe(true);
    expect(v.capacity.maxTokensPerDay!).toBeCloseTo(v.throughput!.tokensPerSec! * 86400 * 5, 0);
    expect(v.throughput!.baseTokensPerSec).toBe(21.2);
    expect(v.capacity.effective).toBe(v.capacity.maxTokensPerDay);
    expect(v.usageLine).toMatch(/ceiling/);
  });
  it('does not cap modest usage', () => {
    const v = computeView(parseState('?hw=mac-mini-m4-16&m=llama-3.1-8b-q4&u=200000', data), data);
    expect(v.capacity.capped).toBe(false);
    expect(v.capacity.effective).toBe(200000);
  });
  it('greys a model out when the context exceeds its limit', () => {
    const hw = data.hardware.find((h) => h.id === 'mac-studio-m5-max-64')!;
    const m = { ...data.models.find((x) => x.id === 'qwen3-32b-q4')!, max_context_tokens: 32768 };
    expect(fit(m, hw, 65536, 1.4).status).toBe('context');
    expect(fit(m, hw, 32768, 1.4).status).toBe('fits');
  });
  it('filters the list by family without dropping the selection logic', () => {
    const v = computeView(parseState('?hw=mac-studio-m5-max-64&f=Gemma', data), data);
    expect(v.rows.every((r) => r.model.family === 'Gemma')).toBe(true);
    expect(v.model?.family).toBe('Gemma');
  });
});

describe('context slows generation down', () => {
  const m = data.models.find((x) => x.id === 'qwen3-32b-q4')!;

  it('is 1 at the measured context and falls as context grows', () => {
    expect(contextSpeedFactor(m, 0, 0)).toBe(1);
    const at32k = contextSpeedFactor(m, 0, 32768);
    const at128k = contextSpeedFactor(m, 0, 131072);
    expect(at32k).toBeLessThan(1);
    expect(at128k).toBeLessThan(at32k);
    // 19.76 GB weights vs 8.6 GB of cache at 32k
    expect(at32k).toBeCloseTo(19.76 / (19.76 + 8.588), 2);
  });

  it('matches the published gpt-oss-20b figures on DGX Spark within 10%', () => {
    // llama.cpp bench: 83.43 tok/s at empty context, 61.65 at 32k
    const oss = data.models.find((x) => x.id === 'gpt-oss-20b-mxfp4')!;
    const predicted = 83.43 * contextSpeedFactor(oss, 0, 32768);
    expect(Math.abs(predicted - 61.65) / 61.65).toBeLessThan(0.1);
  });

  it('reports the adjustment through resolveThroughput', () => {
    const hw = data.hardware.find((h) => h.id === 'nvidia-dgx-spark-128')!;
    const oss = data.models.find((x) => x.id === 'gpt-oss-20b-mxfp4')!;
    const short = resolveThroughput(oss, hw, data.throughput, data.defaults, 4096);
    const long = resolveThroughput(oss, hw, data.throughput, data.defaults, 131072);
    expect(short.measurement).toBe('measured');
    expect(short.baseTokensPerSec).toBe(83.43);
    expect(long.tokensPerSec!).toBeLessThan(short.tokensPerSec!);
    expect(long.contextFactor).toBeLessThan(short.contextFactor);
  });
});

describe('sorting the model list', () => {
  const base = '?hw=mac-studio-m5-max-64&ctx=8192';
  const scores = (sort: string) =>
    computeView(parseState(`${base}&s=${sort}`, data), data).rows.filter((r) => r.fit.status === 'fits');

  it('sorts by intelligence score, with unscored models last', () => {
    const rows = scores('smartest');
    const seen = rows.map((r) => r.model.frontier_equivalent?.score ?? null);
    const scored = seen.filter((s): s is number => s != null);
    for (let i = 1; i < scored.length; i++) expect(scored[i - 1]).toBeGreaterThanOrEqual(scored[i]);
    // every unscored model sits after every scored one
    const lastScored = seen.map((s) => s != null).lastIndexOf(true);
    expect(seen.slice(0, lastScored + 1).every((s) => s != null)).toBe(true);
  });
  it('sorts by speed', () => {
    const rows = scores('fastest');
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].throughput.tokensPerSec!).toBeGreaterThanOrEqual(rows[i].throughput.tokensPerSec!);
    }
  });
  it('sorts by memory footprint', () => {
    const rows = scores('smallest');
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].fit.needGb!).toBeLessThanOrEqual(rows[i].fit.needGb!);
    }
  });
  it('keeps models that fit ahead of ones that do not, whatever the sort', () => {
    const all = computeView(parseState(`${base}&s=fastest`, data), data).rows;
    const lastFit = all.map((r) => r.fit.status === 'fits').lastIndexOf(true);
    expect(all.slice(0, lastFit + 1).every((r) => r.fit.status === 'fits')).toBe(true);
  });
});

describe('the price you actually paid', () => {
  it('overrides the list price everywhere the maths uses it', () => {
    const list = computeView(parseState('?hw=gmktec-evo-x2-128&m=gpt-oss-120b-mxfp4&u=2000000', data), data);
    const paid = computeView(parseState('?hw=gmktec-evo-x2-128&m=gpt-oss-120b-mxfp4&u=2000000&p=1999', data), data);
    expect(list.priceIsCustom).toBe(false);
    expect(paid.priceIsCustom).toBe(true);
    expect(paid.price).toBe(1999);
    // same savings per day, so break-even scales with what you paid
    expect(paid.calc!.dailySaving).toBeCloseTo(list.calc!.dailySaving, 9);
    expect(paid.calc!.breakevenDays!).toBeCloseTo(list.calc!.breakevenDays! * (1999 / list.price!), 6);
    expect(paid.configLine).toContain('$1,999');
  });

  it('unblocks a machine that has no list price', () => {
    const without = computeView(parseState('?hw=mac-studio-m5-ultra-512', data), data);
    expect(without.calc).toBeNull();
    expect(without.verdict.kind).toBe('unpriced');
    expect(without.verdict.headline).toMatch(/No price/);
    const with_ = computeView(parseState('?hw=mac-studio-m5-ultra-512&p=12000', data), data);
    expect(with_.calc).not.toBeNull();
    expect(with_.price).toBe(12000);
  });

  it('ignores a nonsense price and round-trips a real one', () => {
    expect(parseState('?hw=gmktec-evo-x2-128&p=abc', data).price).toBeNull();
    expect(parseState('?hw=gmktec-evo-x2-128&p=-5', data).price).toBeNull();
    expect(parseState('?hw=gmktec-evo-x2-128&p=0', data).price).toBeNull();
    const s = parseState('?hw=gmktec-evo-x2-128&p=1999', data);
    expect(parseState('?' + serializeState(s), data).price).toBe(1999);
    expect(serializeState(parseState('?hw=gmktec-evo-x2-128', data))).not.toContain('p=');
  });
});

describe('assuming API prices keep falling', () => {
  const base = {
    devicePriceUsd: 3499, dailyTokens: 2_000_000, inputRatio: 15,
    inputPricePerMtok: 0.32, outputPricePerMtok: 2.5,
    localTokensPerSec: 25, cloudTokensPerSec: 80, loadWatts: 145, pricePerKwh: 0.17, typicalTaskOutputTokens: 1000,
  };

  it('leaves the maths untouched when it is off', () => {
    const flat = calculate({ ...base, apiDeclinePerYear: 0 });
    expect(flat.apiDeclinePerYear).toBe(0);
    expect(flat.breakevenDays!).toBeCloseTo(3499 / flat.dailySaving, 6);
    expect(flat.bestPosition).toBeUndefined();
  });

  it('pushes break-even out, never pulls it in', () => {
    const cheap = { ...base, devicePriceUsd: 599 };
    const flat = calculate({ ...cheap, apiDeclinePerYear: 0 });
    const decayed = calculate({ ...cheap, apiDeclinePerYear: 0.2 });
    expect(decayed.breakevenDays).not.toBeNull();
    expect(decayed.breakevenDays!).toBeGreaterThan(flat.breakevenDays!);
    // the day-one saving is identical; only the future differs
    expect(decayed.dailySaving).toBeCloseTo(flat.dailySaving, 9);
  });

  it('at a steep decline, a machine that pays back on flat prices never does', () => {
    // $3,499 over 10.9 years on today's prices; at −40%/yr the API undercuts the
    // electricity long before the hardware is repaid
    expect(calculate({ ...base, apiDeclinePerYear: 0 }).breakevenDays!).toBeGreaterThan(3000);
    expect(calculate({ ...base, apiDeclinePerYear: 0.4 }).breakevenDays).toBeNull();
  });

  it('can turn a payback into a never, and says where the peak was', () => {
    const marginal = { ...base, dailyTokens: 260_000 };
    expect(calculate({ ...marginal, apiDeclinePerYear: 0 }).breakevenDays).not.toBeNull();
    const decayed = calculate({ ...marginal, apiDeclinePerYear: 0.6 });
    expect(decayed.breakevenDays).toBeNull();
    expect(decayed.dailySaving).toBeGreaterThan(0);
    expect(decayed.bestPosition!.usd).toBeLessThan(0);
    expect(decayed.bestPosition!.days).toBeGreaterThan(0);
  });

  it('integrates the decaying saving correctly', () => {
    // at 50%/yr the first year yields cloud × 365.25 × (0.5 − 1)/ln(0.5) = cloud × 365.25 × 0.7213
    const cloud = 2;
    const saved = cumulativeSaving(cloud, 0, 0.5, DAYS_PER_YEAR);
    expect(saved).toBeCloseTo(cloud * DAYS_PER_YEAR * 0.72135, 2);
    // the total is bounded: two more centuries add nothing
    const forever = cumulativeSaving(cloud, 0, 0.5, DAYS_PER_YEAR * 200);
    const longer = cumulativeSaving(cloud, 0, 0.5, DAYS_PER_YEAR * 400);
    expect(forever).toBeCloseTo((cloud * DAYS_PER_YEAR) / Math.log(2), 1);
    expect(longer).toBeCloseTo(forever, 6);
  });

  it('round-trips through the URL', () => {
    const s = parseState('?hw=mac-studio-m5-max-64&d=0.4', data);
    expect(s.decline).toBe(0.4);
    expect(parseState('?' + serializeState(s), data).decline).toBe(0.4);
    expect(serializeState(parseState('?hw=mac-studio-m5-max-64', data))).not.toContain('d=');
  });
});

describe('older models', () => {
  it('are hidden by default and revealed on request', () => {
    const hidden = computeView(parseState('?hw=mac-studio-m5-max-64', data), data);
    expect(hidden.rows.every((r) => r.model.generation !== 'legacy')).toBe(true);
    expect(hidden.olderHidden).toBeGreaterThan(0);
    const shown = computeView(parseState('?hw=mac-studio-m5-max-64&old=1', data), data);
    expect(shown.rows.some((r) => r.model.generation === 'legacy')).toBe(true);
    expect(shown.olderHidden).toBe(0);
    expect(shown.rows.length).toBeGreaterThan(hidden.rows.length);
  });

  it('keeps an explicitly chosen older model visible', () => {
    const v = computeView(parseState('?hw=mac-studio-m5-max-64&m=qwen3-32b-q4', data), data);
    expect(v.rows.some((r) => r.model.id === 'qwen3-32b-q4')).toBe(true);
    expect(v.model?.id).toBe('qwen3-32b-q4');
  });
});

describe('a model nobody rents', () => {
  it('is priced as its closest hosted match, and says so', () => {
    const m = data.models.find((x) => x.id === 'kat-coder-v2.5-q4')!;
    expect(m.cloud_equivalent.stand_in).toBe(true);
    expect(m.cloud_equivalent.stand_in_for).toBe('qwen3.6-35b-a3b-q4');
    expect(m.cloud_equivalent.note).toMatch(/Nobody rents/);
    const v = computeView(parseState('?hw=mac-studio-m5-max-64&m=kat-coder-v2.5-q4', data), data);
    expect(v.model?.id).toBe('kat-coder-v2.5-q4');
    expect(v.calc).not.toBeNull();
    expect(['surfaces', 'never']).toContain(v.verdict.kind);
  });

  it('leaves no model without a price, and never borrows from a borrower', () => {
    for (const m of data.models) {
      const ce = m.cloud_equivalent;
      expect(ce.input_price_per_mtok, m.id).not.toBeNull();
      if (ce.stand_in) {
        const src = data.models.find((x) => x.id === ce.stand_in_for);
        expect(src, m.id).toBeDefined();
        expect(src!.cloud_equivalent.stand_in, m.id).toBeFalsy();
        expect(src!.generation, m.id).not.toBe('legacy');
        expect([src!.cloud_equivalent.input_price_per_mtok, src!.cloud_equivalent.output_price_per_mtok], m.id)
          .toEqual([ce.input_price_per_mtok, ce.output_price_per_mtok]);
      }
    }
  });
});

describe('share links', () => {
  it('put a pair with a card on its own page, and read it back', () => {
    const s = parseState('?hw=mac-mini-m6-32&m=qwen3.8-27b-q4&u=1000000', data);
    const path = sharePath(s, 'qwen3.8-27b-q4', data);
    expect(path.startsWith('/s/mac-mini-m6-32/qwen3.8-27b-q4/?')).toBe(true);
    expect(path).not.toMatch(/[?&](hw|m)=/);
    const url = new URL(path, 'https://sunkcost.ai');
    const back = parseState(url.search, data, url.pathname);
    expect(back.hw).toBe('mac-mini-m6-32');
    expect(back.model).toBe('qwen3.8-27b-q4');
    expect(back.usage).toBe(1000000);
  });

  it('fall back to the app root for a pair with no card', () => {
    // a 189 GB model does not fit a 16 GB Mac mini, so there is no card and no share page
    const s = parseState('?hw=mac-mini-m6-16', data);
    expect(sharePath(s, 'glm-5.3-flash-ud-q4', data).startsWith('/?')).toBe(true);
  });

  it('only treat /s/<hardware>/<model>/ as a share page', () => {
    expect(parseSharePath('/')).toBeNull();
    expect(parseSharePath('/models/qwen3.8-27b-q4/')).toBeNull();
    expect(parseSharePath('/s/a/b/')).toEqual({ hw: 'a', model: 'b' });
  });
});

describe('intelligence bands', () => {
  // the edges drifted once when the index was re-read; pin them to the rule so it cannot recur silently
  const d = data.defaults;
  const ref = (name: string) => d.frontier_reference!.find((r) => r.name === name)!.score;
  const edge = (tier: number) => d.frontier_tiers.find((t) => t.tier === tier)!.min_score;

  it('start each band at about 80% of its reference model', () => {
    expect(Math.abs(edge(1) - 0.8 * ref('Claude Haiku 4.5'))).toBeLessThanOrEqual(1);
    expect(Math.abs(edge(2) - 0.8 * ref('Claude Sonnet 5'))).toBeLessThanOrEqual(1);
    expect(Math.abs(edge(3) - (ref('Claude Sonnet 5') + ref('Claude Opus 5')) / 2)).toBeLessThanOrEqual(1);
  });

  it('place each hosted reference model in its own band', () => {
    const bandOf = (s: number) => d.frontier_tiers.filter((t) => s >= t.min_score).at(-1)!.tier;
    expect(bandOf(ref('Claude Haiku 4.5'))).toBe(1);
    expect(bandOf(ref('Claude Sonnet 5'))).toBe(2);
    expect(bandOf(ref('Claude Opus 5'))).toBe(3);
  });

  it('put Qwen3.8 27B, just below Sonnet 5, in the Sonnet band', () => {
    const m = data.models.find((x) => x.id === 'qwen3.8-27b-q4')!;
    expect(m.frontier_equivalent!.tier).toBe(2);
  });
});

describe('cards for a link\'s own settings', () => {
  const base = { ...defaultStateFor(), hw: 'mac-mini-m6-32', model: 'qwen3.8-27b-q4' };
  function defaultStateFor() { return parseState('', data); }

  it('uses the pre-built card when the link is on default settings', () => {
    expect(cardQuery(base, data)).toBeNull();
    // sort, filters and cloud speed never reach the card
    expect(cardQuery({ ...base, sort: 'smartest', cloudTps: 200, family: 'qwen' }, data)).toBeNull();
  });

  it('asks for its own card when usage differs, and draws that usage', () => {
    const s = { ...base, usage: 1_000_000 };
    const q = cardQuery(s, data)!;
    expect(new URLSearchParams(q).get('u')).toBe('1000000');
    // the query round-trips to the same card settings
    const back = parseState(q, data, '/s/mac-mini-m6-32/qwen3.8-27b-q4/');
    expect(cardQuery(back, data)).toBe(q);
    expect(cardSvg(s, data)).toContain('1M tokens/day');
    expect(cardSvg(s, data)).not.toBe(cardSvg(base, data));
  });

  it('has nothing to draw when the model no longer fits', () => {
    expect(cardView({ ...base, ctx: 1_000_000 }, data)).toBeNull();
  });
});

describe('best buys', () => {
  it('lists quickest pay-backs per class: current, within capacity, one row per model, fastest first', () => {
    for (const { usage } of bestUsageLevels(data)) {
      const tiers = bestByTier(data, usage);
      expect(tiers.map((t) => t.tier)).toEqual([...tiers.map((t) => t.tier)].sort((a, b) => b - a));
      for (const t of tiers) {
        const names = t.picks.map((c) => c.model.display_name);
        expect(new Set(names).size).toBe(names.length);
        expect(t.picks.length).toBeLessThanOrEqual(3);
        t.picks.forEach((c, i) => {
          expect(c.model.frontier_equivalent?.tier).toBe(t.tier);
          expect(c.model.generation ?? 'current').toBe('current');
          expect(c.hw.generation ?? 'current').toBe('current');
          expect(c.view.capacity.capped).toBe(false);
          expect(c.days).toBe(c.view.calc!.breakevenDays);
          if (i) expect(c.days).toBeGreaterThanOrEqual(t.picks[i - 1].days);
        });
      }
    }
  });
});

describe('your own numbers', () => {
  const base = parseState('', data);

  it('round-trips a custom machine, a measured speed and a monthly bill through the link', () => {
    const s = { ...base, hw: 'custom', model: 'qwen3.8-27b-q4', price: 1000, customName: '2× RTX 3090', customMem: 48, customWatts: 700, customBw: 936, tps: 50, sub: 100 };
    expect(parseState(serializeState(s), data)).toMatchObject({ hw: 'custom', model: 'qwen3.8-27b-q4', price: 1000, customName: '2× RTX 3090', customMem: 48, customWatts: 700, customBw: 936, tps: 50, sub: 100 });
  });

  it('works a custom machine out from what you enter, using your measured speed', () => {
    const v = computeView({ ...base, hw: 'custom', model: 'qwen3.8-27b-q4', price: 1000, customName: 'Used 3090 box', customMem: 24, customWatts: 450, tps: 50 }, data);
    expect(v.model?.id).toBe('qwen3.8-27b-q4');
    expect(v.throughput).toMatchObject({ tokensPerSec: 50, measurement: 'yours' });
    expect(v.calc?.breakevenDays).not.toBeNull();
    expect(v.configLine).toContain('Used 3090 box');
  });

  it('asks for what is still missing on a custom machine instead of guessing', () => {
    const v = computeView({ ...base, hw: 'custom', customMem: 24 }, data);
    expect(v.calc).toBeNull();
    expect(v.verdict.sub).toContain('what it cost');
    expect(v.verdict.sub).toContain('power draw');
  });

  it('uses a measured speed only for the model it was measured on', () => {
    const v = computeView({ ...base, hw: 'mac-mini-m6-32', model: 'qwen3.8-27b-q4', tps: 40 }, data);
    expect(v.throughput?.measurement).toBe('yours');
    expect(v.rows.filter((r) => r.throughput.measurement === 'yours').map((r) => r.model.id)).toEqual(['qwen3.8-27b-q4']);
  });

  it('weighs the machine against a monthly bill, with falling prices off, and the card follows', () => {
    const s = { ...base, hw: 'mac-mini-m6-32', model: 'qwen3.8-27b-q4', sub: 100, decline: 0.4 };
    const v = computeView(s, data);
    expect(v.calc!.cloudCostPerDay).toBeCloseTo((100 * 12) / 365.25, 6);
    expect(v.calc!.apiDeclinePerYear).toBe(0);
    expect(cardQuery(s, data)).toContain('sub=100');
    expect(cardSvg(s, data)).toContain('Your bill / month');
  });
});

describe('capturing what people enter', () => {
  const base = parseState('', data);

  it('sends nothing while only our own figures are in use', () => {
    expect(submissionPayload(base)).toBeNull();
  });

  it('records a custom machine with a measured speed, recomputing what the site showed', () => {
    const s = { ...base, hw: 'custom', model: 'qwen3.8-27b-q4', price: 1600, customName: '2× RTX 3090', customMem: 48, customWatts: 700, customBw: 936, tps: 50 };
    const row = submissionRow(JSON.parse(JSON.stringify(submissionPayload(s))), data)!;
    expect(row.kinds).toBe('custom_machine,measured_speed');
    expect(row).toMatchObject({ hw: 'custom', model: 'qwen3.8-27b-q4', custom_name: '2× RTX 3090', custom_mem_gb: 48, tps: 50, our_measurement: 'estimated' });
    expect(row.our_tps as number).toBeGreaterThan(0);
    expect(row.breakeven_days as number).toBeGreaterThan(0);
  });

  it('rejects junk and strips markup from names', () => {
    expect(submissionRow('hello', data)).toBeNull();
    expect(submissionRow({ hw: 'nope', sub: 100 }, data)).toBeNull();
    expect(submissionRow({ hw: 'mac-mini-m6-32', model: 'qwen3.8-27b-q4', tps: -5 }, data)).toBeNull();
    const row = submissionRow({ hw: 'custom', customName: '<b>box</b>', customMem: 24, customWatts: 400, price: 900 }, data)!;
    expect(row.custom_name).toBe('bbox/b');
  });
});

describe('key-value cache type and measured context', () => {
  const base = parseState('', data);
  const s = { ...base, hw: 'mac-studio-m5-max-64', model: 'qwen3.8-27b-q4', ctx: 131072 };
  const row = (v: ReturnType<typeof computeView>) => v.rows.find((r) => r.model.id === 'qwen3.8-27b-q4')!;

  it('an 8-bit cache needs less memory and reads faster at long context', () => {
    const f16 = computeView(s, data);
    const q8 = computeView({ ...s, kv: 'q8_0' }, data);
    expect(row(q8).fit.needGb!).toBeLessThan(row(f16).fit.needGb!);
    expect(row(q8).throughput.tokensPerSec!).toBeGreaterThan(row(f16).throughput.tokensPerSec!);
    expect(parseState(serializeState({ ...s, kv: 'q8_0', tpsCtx: 4096 }), data)).toMatchObject({ kv: 'q8_0', tpsCtx: 4096 });
  });

  it('scales a speed measured at a short context to the context asked about', () => {
    const v = computeView({ ...s, tps: 40, tpsCtx: 4096 }, data);
    expect(v.throughput!.measurement).toBe('yours');
    expect(v.throughput!.tokensPerSec!).toBeLessThan(40);
    expect(computeView({ ...s, tps: 40 }, data).throughput!.tokensPerSec).toBe(40);
    const q = cardQuery({ ...s, tps: 40, tpsCtx: 4096, kv: 'q8_0' }, data)!;
    expect(q).toContain('tctx=4096');
    expect(q).toContain('kv=q8_0');
  });

  it('records the measured context and the bandwidth ceiling alongside a speed', () => {
    const r = submissionRow({ hw: 'mac-mini-m4-32', model: 'qwen3.8-27b-q4', tps: 18, tpsCtx: 4096, kv: 'f16', usage: 500000, ratio: 15, ctx: 32768, kwh: 0.17 }, data)!;
    expect(r).toMatchObject({ tps_ctx: 4096, kv: 'f16', our_measurement: 'estimated' });
    // 120 GB/s over roughly 17 GB read per token: 18 tok/s cannot be a generation speed
    expect(r.ceiling_tps as number).toBeLessThan(8);
  });
});
