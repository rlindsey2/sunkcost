import { calculate, type CalcResult } from './calc';
import { fit, resolveThroughput, type Fit, type ResolvedThroughput } from './fit';
import { fmtVerdictDuration } from './format';
import type { State } from './state';
import type { Dataset, Hardware, Model } from './types';

export interface ModelRow {
  model: Model;
  fit: Fit;
  throughput: ResolvedThroughput;
}

export type VerdictKind = 'surfaces' | 'never' | 'unknown';

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
  return `${h.family} ${h.chip}, ${h.unified_memory_gb}GB`;
}

export function modelLabel(m: Model): string {
  return `${m.display_name} ${m.quantisation}`;
}

export function computeView(state: State, data: Dataset): View {
  const d = data.defaults;
  const hw = data.hardware.find((h) => h.id === state.hw) ?? data.hardware[0];

  const all = data.models.map<ModelRow>((m) => ({
    model: m,
    fit: fit(m, hw, state.ctx, d.nearly_fits_ratio),
    throughput: resolveThroughput(m, hw, data.throughput, d, state.ctx),
  }));
  const order: Record<string, number> = { fits: 0, nearly: 1, context: 2, unknown: 3, no: 4 };
  const visible = all
    .filter((r) => r.fit.status !== 'no')
    .filter((r) => !state.family || r.model.family === state.family)
    .sort(comparator(state.sort, order));
  const hiddenCount = all.length - visible.length;

  // selected model must fit (or nearly fit) this hardware; otherwise pick the biggest that fits
  let model: Model | null = null;
  const chosen = visible.find((r) => r.model.id === state.model && r.fit.status === 'fits');
  if (chosen) model = chosen.model;
  else {
    // auto-pick: the largest rated model that fits; unrated models only if nothing else does
    const fits = visible.filter((r) => r.fit.status === 'fits');
    const rated = fits.filter((r) => !Object.values(r.model.capabilities).includes('unknown'));
    model = (rated[0] ?? fits[0])?.model ?? null;
  }

  const row = model ? all.find((r) => r.model.id === model!.id)! : null;
  const blockers: string[] = [];
  if (hw.price_usd == null) blockers.push('hardware price is unknown (TODO in hardware.json)');
  if (!model) blockers.push('no model in the list fits this configuration at the chosen context length');
  if (model) {
    const ce = model.cloud_equivalent;
    if (ce.input_price_per_mtok == null || ce.output_price_per_mtok == null) blockers.push('API price for the cloud equivalent is unknown (TODO in models.json)');
  }
  if (row && row.throughput.tokensPerSec == null) blockers.push('local speed is unknown and cannot be estimated');
  if (hw.load_watts == null) blockers.push('power draw under load is unknown (TODO in hardware.json)');

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
      devicePriceUsd: hw.price_usd!,
      dailyTokens: effectiveUsage,
      inputRatio: state.ratio,
      inputPricePerMtok: model.cloud_equivalent.input_price_per_mtok!,
      outputPricePerMtok: model.cloud_equivalent.output_price_per_mtok!,
      localTokensPerSec: row.throughput.tokensPerSec!,
      cloudTokensPerSec: state.cloudTps,
      loadWatts: hw.load_watts!,
      pricePerKwh: state.kwh,
      typicalTaskOutputTokens: d.typical_task_output_tokens,
    });
  }

  let verdict: View['verdict'];
  if (!calc) {
    verdict = { kind: 'unknown', headline: 'Can’t compute this one.', sub: blockers.join('; ') };
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
      sub: `Saving ${perDay >= 0.01 ? `$${perDay.toFixed(2)}` : `${(perDay * 100).toFixed(2)}c`} a day against the API, on ${hw.price_usd ? `$${hw.price_usd.toLocaleString('en-US')}` : ''} of hardware.`,
    };
  }

  const usageLine = `${formatUsageShort(effectiveUsage)} tokens/day${capped ? ' (machine’s ceiling)' : ''}, ${ratioLabel(state.ratio)}`;
  const configLine = model ? `${hardwareLabel(hw)} · ${modelLabel(model)}` : hardwareLabel(hw);

  return {
    hw,
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

function comparator(sort: string, order: Record<string, number>) {
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
        return num(apiCostPerMtok(b.model, 4), -1) - num(apiCostPerMtok(a.model, 4), -1);
      case 'cheapest_api':
        return num(apiCostPerMtok(a.model, 4), Infinity) - num(apiCostPerMtok(b.model, 4), Infinity);
      case 'smallest':
        return num(a.fit.needGb, Infinity) - num(b.fit.needGb, Infinity);
      default:
        // best fit: biggest model that fits, since bigger is usually better at a given quant
        return b.model.params_b - a.model.params_b;
    }
  };
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
