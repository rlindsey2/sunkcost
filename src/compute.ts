import { calculate, DAYS_PER_YEAR, type CalcResult } from './calc';
import { contextSpeedFactor, fit, kvScaleFor, resolveThroughput, type Fit, type ResolvedThroughput } from './fit';
import { fmtVerdictDuration } from './format';
import { CUSTOM_HW, type State } from './state';
import type { Dataset, Hardware, Model } from './types';

export interface ModelRow {
  model: Model;
  fit: Fit;
  throughput: ResolvedThroughput;
}

export type VerdictKind = 'surfaces' | 'never' | 'unhosted' | 'unpriced' | 'nofit' | 'unknown';

export interface Capacity {
  /** most total tokens/day this machine can process at the local speed, generating 24 h a day */
  maxTokensPerDay: number | null;
  maxOutputPerDay: number | null;
  requested: number;
  /** what the calculation actually used */
  effective: number;
  capped: boolean;
}

export interface View {
  hw: Hardware;
  /** superseded models filtered out of the list */
  olderHidden: number;
  /** the price the maths uses: what you paid, or the list price */
  price: number | null;
  priceIsCustom: boolean;
  capacity: Capacity;
  contextTokens: number;
  model: Model | null;
  rows: ModelRow[];
  hiddenCount: number;
  throughput: ResolvedThroughput | null;
  calc: CalcResult | null;
  verdict: { kind: VerdictKind; headline: string; sub: string | null };
  /** why the calculation could not run, if it couldn't */
  blockers: string[];
  configLine: string;
  usageLine: string;
}

export function hardwareLabel(h: Hardware): string {
  if (h.id === CUSTOM_HW) return h.usable_memory_gb == null ? h.chip : `${h.chip}, ${h.usable_memory_gb} GB`;
  return `${h.family} ${h.chip}, ${h.unified_memory_gb}GB`;
}

/** A machine you describe: every figure is yours, and anything left blank stays unknown. */
export function customHardware(s: State): Hardware {
  return {
    id: CUSTOM_HW,
    family: 'Your own machine',
    chip: s.customName.trim() || 'Your own machine',
    unified_memory_gb: s.customMem ?? 0,
    usable_memory_gb: s.customMem,
    memory_bandwidth_gbs: s.customBw,
    price_usd: null,
    idle_watts: null,
    load_watts: s.customWatts,
    load_watts_status: 'entered',
    generation: 'current',
    estimate_note: 'Estimated from the bandwidth you entered, with efficiency calibrated on Apple Silicon and DGX Spark; discrete GPUs usually do better, so a measured speed is more reliable',
  };
}

/**
 * Your measured speed. Taken at a context you name, it is scaled to the context you're asking
 * about, the same way our own measurements are; otherwise it is used as given.
 */
function yourThroughput(m: Model, tps: number, measuredAt: number | null, ctx: number, kvScale: number): ResolvedThroughput {
  const factor = measuredAt == null ? 1 : contextSpeedFactor(m, measuredAt, ctx, kvScale);
  return {
    tokensPerSec: tps * factor,
    baseTokensPerSec: tps,
    baseContext: measuredAt ?? ctx,
    contextFactor: factor,
    measurement: 'yours',
    source: 'your measurement, as entered',
    sourceUrl: null,
    detail: measuredAt == null ? 'taken as measured at this context' : `measured at ${Math.round(measuredAt / 1024)}k context, scaled to ${Math.round(ctx / 1024)}k`,
  };
}

export function modelLabel(m: Model): string {
  return `${m.display_name} ${m.quantisation}`;
}

export function computeView(state: State, data: Dataset): View {
  const d = data.defaults;
  const hw = state.hw === CUSTOM_HW ? customHardware(state) : data.hardware.find((h) => h.id === state.hw) ?? data.hardware[0];

  const kvScale = kvScaleFor(state.kv, d);
  const all = data.models.map<ModelRow>((m) => ({
    model: m,
    fit: fit(m, hw, state.ctx, d.nearly_fits_ratio, kvScale),
    // your own measurement wins for the model it was taken on
    throughput: m.id === state.model && state.tps != null ? yourThroughput(m, state.tps, state.tpsCtx, state.ctx, kvScale) : resolveThroughput(m, hw, data.throughput, d, state.ctx, kvScale),
  }));
  const order: Record<string, number> = { fits: 0, nearly: 1, context: 2, unknown: 3, no: 4 };
  // every model stays in the list — the ones that don't fit are greyed with the reason, so a
  // buyer can see what a bigger memory tier would unlock without changing anything
  const visible = all
    .filter((r) => !state.family || r.model.family === state.family)
    .filter((r) => state.showOlder || r.model.generation !== 'legacy' || r.model.id === state.model)
    .sort(comparator(state.sort, order, state.ratio));
  const olderHidden = all.filter((r) => (!state.family || r.model.family === state.family) && r.model.generation === 'legacy').length -
    visible.filter((r) => r.model.generation === 'legacy').length;
  const hiddenCount = all.length - visible.length;

  // selected model must fit (or nearly fit) this hardware; otherwise pick the biggest that fits
  let model: Model | null = null;
  const chosen = visible.find((r) => r.model.id === state.model && r.fit.status === 'fits');
  if (chosen) model = chosen.model;
  else {
    // auto-pick: the first model that fits in the current sort order, so "smartest first"
    // really does put the smartest one in the water
    const fits = visible.filter((r) => r.fit.status === 'fits');
    model = fits[0]?.model ?? null;
  }

  const row = model ? all.find((r) => r.model.id === model!.id)! : null;
  const price = state.price ?? hw.price_usd;
  const priceIsCustom = state.price != null && state.price !== hw.price_usd;

  const blockers: string[] = [];
  if (price == null) blockers.push('no price for this machine yet — enter what you paid to see the break-even');
  if (!model) blockers.push('no model in the list fits this configuration at the chosen context length');
  if (model && state.sub == null) {
    const ce = model.cloud_equivalent;
    if (ce.input_price_per_mtok == null || ce.output_price_per_mtok == null) {
      blockers.push(`nobody hosts ${model.display_name}, so there is no rental price to weigh the hardware against`);
    }
  }
  if (row && row.throughput.tokensPerSec == null) blockers.push(hw.id === CUSTOM_HW ? 'enter your measured speed, or the memory bandwidth to estimate it' : 'local speed is unknown and cannot be estimated');
  if (hw.load_watts == null) blockers.push(hw.id === CUSTOM_HW ? 'enter its power draw under load' : 'power draw under load is unknown (TODO in hardware.json)');

  // capacity: the machine can only generate so many tokens in 24 hours
  const tps = row?.throughput.tokensPerSec ?? null;
  const maxOutputPerDay = tps == null ? null : tps * 86400;
  const maxTokensPerDay = maxOutputPerDay == null ? null : maxOutputPerDay * (state.ratio + 1);
  const capped = maxTokensPerDay != null && state.usage > maxTokensPerDay;
  const effectiveUsage = capped ? maxTokensPerDay! : state.usage;
  const capacity: Capacity = { maxTokensPerDay, maxOutputPerDay, requested: state.usage, effective: effectiveUsage, capped };

  let calc: CalcResult | null = null;
  if (!blockers.length && model && row) {
    calc = calculate({
      devicePriceUsd: price!,
      dailyTokens: effectiveUsage,
      inputRatio: state.ratio,
      inputPricePerMtok: model.cloud_equivalent.input_price_per_mtok ?? 0,
      outputPricePerMtok: model.cloud_equivalent.output_price_per_mtok ?? 0,
      localTokensPerSec: row.throughput.tokensPerSec!,
      cloudTokensPerSec: state.cloudTps,
      loadWatts: hw.load_watts!,
      pricePerKwh: state.kwh,
      typicalTaskOutputTokens: d.typical_task_output_tokens,
      // a bill you pay is not a token price that keeps falling
      apiDeclinePerYear: state.sub != null ? 0 : state.decline,
      cloudCostPerDayOverride: state.sub != null ? (state.sub * 12) / DAYS_PER_YEAR : undefined,
    });
  }

  let verdict: View['verdict'];
  const isCustom = hw.id === CUSTOM_HW;
  const missing = isCustom
    ? [price == null ? 'what it cost' : '', state.customMem == null ? 'how much memory models can use' : '', state.customWatts == null ? 'its power draw under load' : ''].filter(Boolean)
    : [];
  if (!calc && missing.length) {
    verdict = { kind: 'unpriced', headline: 'Describe your machine.', sub: `Still needed: ${missing.join(', ')}.` };
  } else if (!calc && isCustom && model && row && row.throughput.tokensPerSec == null) {
    verdict = { kind: 'unknown', headline: `How fast does ${model.display_name} run on it?`, sub: 'Enter your measured speed under the assumptions, or the machine’s memory bandwidth to estimate it.' };
  } else if (!calc && model && (model.cloud_equivalent.input_price_per_mtok == null || model.cloud_equivalent.output_price_per_mtok == null)) {
    // no one rents this model, so there is no bill to beat: local is the only way to run it at all
    const speed = row?.throughput.tokensPerSec;
    verdict = {
      kind: 'unhosted',
      headline: `Nobody rents ${model.display_name}.`,
      sub: `There is no API price to beat, so break-even does not apply — if you want it, you run it yourself.${speed ? ` On this machine that means about ${Math.round(speed)} tok/s in ${(row!.fit.needGb ?? 0).toFixed(0)} GB.` : ''}`,
    };
  } else if (!calc && price == null) {
    verdict = {
      kind: 'unpriced',
      headline: 'No price for this machine yet.',
      sub: `${hw.status ?? 'It has not been priced.'} Enter what you expect to pay and the water fills in.`,
    };
  } else if (!calc && !model) {
    verdict = {
      kind: 'nofit',
      headline: `Nothing here fits in ${hw.usable_memory_gb ?? '?'} GB.`,
      sub: 'Try a bigger memory tier, a shorter context window, or show the older models.',
    };
  } else if (!calc) {
    verdict = { kind: 'unknown', headline: 'Missing a number.', sub: blockers.join('; ') };
  } else if (calc.breakevenDays === null && calc.apiDeclinePerYear > 0 && calc.dailySaving > 0) {
    const best = calc.bestPosition;
    verdict = {
      kind: 'never',
      headline: 'You never surface.',
      sub: best
        ? `You get within ${fmtMoney(Math.abs(best.usd))} of the surface, about ${fmtYears(best.days)} in, then sink again: by then the API costs less than your electricity.`
        : 'The API falls faster than the machine can pay for itself.',
    };
  } else if (calc.breakevenDays === null) {
    verdict = {
      kind: 'never',
      headline: 'You never surface.',
      sub: calc.dailySaving <= 0 && calc.cloudCostPerDay > 0
        ? 'Electricity alone costs more than the API would at this speed. Usage doesn’t help; every token sinks you further.'
        : 'Nothing to save against at this usage.',
    };
  } else {
    const perDay = calc.dailySaving;
    verdict = {
      kind: 'surfaces',
      headline: `You’re underwater for ${fmtVerdictDuration(calc.breakevenDays)}.`,
      sub: `${calc.apiDeclinePerYear > 0 ? `With the API getting ${Math.round(calc.apiDeclinePerYear * 100)}% cheaper a year, s` : 'S'}aving ${perDay >= 0.01 ? `$${perDay.toFixed(2)}` : `${(perDay * 100).toFixed(2)}c`} a day today${state.sub != null ? ` against your $${state.sub.toLocaleString('en-US')}-a-month bill` : ''}, on ${price ? `$${price.toLocaleString('en-US')}` : ''} of hardware${priceIsCustom ? ' at the price you paid' : ''}.`,
    };
  }

  const usageLine = `${formatUsageShort(effectiveUsage)} tokens/day${capped ? ' (machine’s ceiling)' : ''}, ${ratioLabel(state.ratio)}`;
  const configLine = `${hardwareLabel(hw)}${priceIsCustom ? ` at $${price!.toLocaleString('en-US')}` : ''}${model ? ` · ${modelLabel(model)}` : ''}`;

  return {
    hw,
    olderHidden,
    price,
    priceIsCustom,
    capacity,
    contextTokens: state.ctx,
    model,
    rows: visible,
    hiddenCount,
    throughput: row?.throughput ?? null,
    calc,
    verdict,
    blockers,
    configLine,
    usageLine,
  };
}

/** Saving per million tokens against the model's cloud equivalent, ignoring electricity. */
export function apiCostPerMtok(m: Model, ratio: number): number | null {
  const ce = m.cloud_equivalent;
  if (ce.input_price_per_mtok == null || ce.output_price_per_mtok == null) return null;
  const outShare = 1 / (ratio + 1);
  return ce.input_price_per_mtok * (1 - outShare) + ce.output_price_per_mtok * outShare;
}

function comparator(sort: string, order: Record<string, number>, ratio: number) {
  const byFit = (a: ModelRow, b: ModelRow) => order[a.fit.status] - order[b.fit.status];
  const num = (v: number | null | undefined, fallback: number) => (v == null || !Number.isFinite(v) ? fallback : v);
  return (a: ModelRow, b: ModelRow): number => {
    const fitDiff = byFit(a, b);
    if (fitDiff) return fitDiff;
    switch (sort) {
      case 'smartest':
        return num(b.model.frontier_equivalent?.score, -1) - num(a.model.frontier_equivalent?.score, -1);
      case 'fastest':
        return num(b.throughput.tokensPerSec, -1) - num(a.throughput.tokensPerSec, -1);
      case 'savings':
        return num(apiCostPerMtok(b.model, ratio), -1) - num(apiCostPerMtok(a.model, ratio), -1);
      case 'cheapest_api':
        return num(apiCostPerMtok(a.model, ratio), Infinity) - num(apiCostPerMtok(b.model, ratio), Infinity);
      case 'smallest':
        return num(a.fit.needGb, Infinity) - num(b.fit.needGb, Infinity);
      default:
        // best fit: biggest model that fits, since bigger is usually better at a given quant
        return b.model.params_b - a.model.params_b;
    }
  };
}

function fmtMoney(v: number): string {
  return v < 100 ? `$${v.toFixed(2)}` : `$${Math.round(v).toLocaleString('en-US')}`;
}

function fmtYears(days: number): string {
  const y = days / DAYS_PER_YEAR;
  return y >= 1.5 ? `${y.toFixed(1)} years` : `${Math.round(days / 30.4)} months`;
}

export function ratioLabel(r: number): string {
  if (r >= 1) return `${Number.isInteger(r) ? r : r.toFixed(1)}:1 input:output`;
  return `1:${Number.isInteger(1 / r) ? 1 / r : (1 / r).toFixed(1)} input:output`;
}

export function formatUsageShort(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return String(n);
}

export function usageLabel(n: number, data: Dataset): string {
  return data.defaults.usage.labels.find((l) => n < l.up_to)?.label ?? data.defaults.usage.labels.at(-1)!.label;
}
