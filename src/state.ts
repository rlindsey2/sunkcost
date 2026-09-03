import type { Dataset } from './types';

export interface State {
  hw: string;
  model: string;
  /** total tokens per day */
  usage: number;
  /** input:output ratio */
  ratio: number;
  /** electricity price, USD per kWh */
  kwh: number;
  /** context length in tokens used for the fit check */
  ctx: number;
  /** cloud API decode speed, tokens per second (time comparison only) */
  cloudTps: number;
  /** model-family filter for the list; '' = all */
  family: string;
  /** list sort key, see defaults.sorts */
  sort: string;
}

const KEYS: Record<keyof State, string> = {
  hw: 'hw',
  model: 'm',
  usage: 'u',
  ratio: 'r',
  kwh: 'kwh',
  ctx: 'ctx',
  cloudTps: 'cs',
  family: 'f',
  sort: 's',
};

function num(v: string | null, fallback: number, min?: number, max?: number): number {
  if (v == null || v === '') return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  if (min != null && n < min) return min;
  if (max != null && n > max) return max;
  return n;
}

export function defaultState(data: Dataset): State {
  const d = data.defaults;
  const hw = data.hardware.find((h) => h.id === d.default_hardware_id && h.price_usd != null) ?? data.hardware.find((h) => h.price_usd != null) ?? data.hardware[0];
  return {
    hw: hw.id,
    model: '',
    usage: d.usage.default_tokens_per_day,
    ratio: d.usage.default_input_to_output_ratio,
    kwh: d.electricity.default_price_per_kwh_usd,
    ctx: d.context.default_tokens,
    cloudTps: d.cloud.default_tokens_per_sec,
    family: '',
    sort: 'fit',
  };
}

export function parseState(search: string, data: Dataset): State {
  const p = new URLSearchParams(search);
  const d = defaultState(data);
  const u = data.defaults.usage;
  const hw = p.get(KEYS.hw);
  const model = p.get(KEYS.model);
  return {
    hw: hw && data.hardware.some((h) => h.id === hw) ? hw : d.hw,
    model: model && data.models.some((m) => m.id === model) ? model : d.model,
    usage: num(p.get(KEYS.usage), d.usage, u.min_tokens_per_day, u.max_tokens_per_day),
    ratio: num(p.get(KEYS.ratio), d.ratio, u.min_input_to_output_ratio, u.max_input_to_output_ratio),
    family: p.get('f') ?? '',
    sort: data.defaults.sorts.some((x) => x.id === p.get('s')) ? p.get('s')! : d.sort,
    kwh: num(p.get(KEYS.kwh), d.kwh, 0, 5),
    ctx: num(p.get(KEYS.ctx), d.ctx, 1024, 1_000_000),
    cloudTps: num(p.get(KEYS.cloudTps), d.cloudTps, 1, 10000),
  };
}

export function serializeState(s: State): string {
  const p = new URLSearchParams();
  p.set(KEYS.hw, s.hw);
  if (s.model) p.set(KEYS.model, s.model);
  p.set(KEYS.usage, String(Math.round(s.usage)));
  p.set(KEYS.ratio, String(s.ratio));
  p.set(KEYS.kwh, String(s.kwh));
  p.set(KEYS.ctx, String(s.ctx));
  p.set(KEYS.cloudTps, String(s.cloudTps));
  if (s.family) p.set(KEYS.family, s.family);
  if (s.sort && s.sort !== 'fit') p.set(KEYS.sort, s.sort);
  return p.toString();
}

/** Log-scale slider helpers: slider 0..1000 ↔ tokens/day */
export function sliderToUsage(v: number, min: number, max: number): number {
  const t = v / 1000;
  const raw = Math.exp(Math.log(min) + t * (Math.log(max) - Math.log(min)));
  // snap to 2 significant figures so the number reads cleanly
  const mag = Math.pow(10, Math.floor(Math.log10(raw)) - 1);
  return Math.round(raw / mag) * mag;
}

export function usageToSlider(usage: number, min: number, max: number): number {
  const t = (Math.log(usage) - Math.log(min)) / (Math.log(max) - Math.log(min));
  return Math.round(Math.min(1, Math.max(0, t)) * 1000);
}
