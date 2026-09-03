import { calculate, type CalcResult } from './calc';
import { fit, resolveThroughput, type Fit, type ResolvedThroughput } from './fit';
import { fmtVerdictDuration } from './format';
import type { State } from './state';
import type { Dataset, Hardware, Model } from './types';
import { pickUnit, type UnitPick } from './units';

export interface ModelRow {
  model: Model;
  fit: Fit;
  throughput: ResolvedThroughput;
}

export type VerdictKind = 'surfaces' | 'never' | 'unknown';

export interface View {
  hw: Hardware;
  model: Model | null;
  rows: ModelRow[];
  hiddenCount: number;
  throughput: ResolvedThroughput | null;
  calc: CalcResult | null;
  verdict: { kind: VerdictKind; headline: string; sub: string | null };
  unit: UnitPick | null;
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
    throughput: resolveThroughput(m, hw, data.throughput, d),
  }));
  const order: Record<string, number> = { fits: 0, nearly: 1, unknown: 2, no: 3 };
  const visible = all
    .filter((r) => r.fit.status !== 'no')
    .sort((a, b) => order[a.fit.status] - order[b.fit.status] || (b.model.params_b - a.model.params_b));
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

  let calc: CalcResult | null = null;
  if (!blockers.length && model && row) {
    calc = calculate({
      devicePriceUsd: hw.price_usd!,
      dailyTokens: state.usage,
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

  const seed = `${hw.id}|${model?.id ?? ''}|${state.usage}|${state.ratio}`;
  const unit = calc?.breakevenTokens != null ? pickUnit(calc.breakevenTokens, seed, data.units) : null;

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
    verdict = {
      kind: 'surfaces',
      headline: `You’re underwater for ${fmtVerdictDuration(calc.breakevenDays)}.`,
      sub: unit ? `That’s ${unit.text}.` : null,
    };
  }

  const usageLine = `${formatUsageShort(state.usage)} tokens/day, ${state.ratio}:1 input:output`;
  const configLine = model ? `${hardwareLabel(hw)} · ${modelLabel(model)}` : hardwareLabel(hw);

  return {
    hw,
    model,
    rows: visible,
    hiddenCount,
    throughput: row?.throughput ?? null,
    calc,
    verdict,
    unit,
    blockers,
    configLine,
    usageLine,
  };
}

export function formatUsageShort(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return String(n);
}

export function usageLabel(n: number, data: Dataset): string {
  return data.defaults.usage.labels.find((l) => n < l.up_to)?.label ?? data.defaults.usage.labels.at(-1)!.label;
}
