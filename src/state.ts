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
  /** what you actually paid, overriding the list price; null = use the list price */
  price: number | null;
  /** annual fall in API prices to assume; 0 = hold today's prices */
  decline: number;
  /** show superseded models in the list */
  showOlder: boolean;
  /** your measured tokens/sec for the selected model on this machine; null = ours */
  tps: number | null;
  /** a monthly bill (a subscription) to weigh the machine against instead of per-token prices */
  sub: number | null;
  /** your own machine, when hw is CUSTOM_HW */
  customName: string;
  customMem: number | null;
  customWatts: number | null;
  customBw: number | null;
}

/** The hardware id for a machine you describe yourself: a used GPU box, a rig, anything not on the list. */
export const CUSTOM_HW = 'custom';

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
  price: 'p',
  decline: 'd',
  showOlder: 'old',
  tps: 'tps',
  sub: 'sub',
  customName: 'cn',
  customMem: 'cm',
  customWatts: 'cw',
  customBw: 'cb',
};

function num(v: string | null, fallback: number, min?: number, max?: number): number {
  if (v == null || v === '') return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  if (min != null && n < min) return min;
  if (max != null && n > max) return max;
  return n;
}

/** An optional number you typed: missing, unparseable or out of range means "not given". */
function opt(v: string | null, min: number, max: number): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

/** A hand-entered price. Anything unparseable or out of range falls back to the list price. */
function priceParam(v: string | null): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > 1e7) return null;
  return Math.round(n);
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
    sort: data.defaults.default_sort ?? 'fit',
    price: null,
    decline: data.defaults.api_decline.default_on ? data.defaults.api_decline.default_rate_per_year : 0,
    showOlder: false,
    tps: null,
    sub: null,
    customName: '',
    customMem: null,
    customWatts: null,
    customBw: null,
  };
}

/** A share page lives at /s/<hardware>/<model>/: the path names the pair, the query carries the rest. */
export function parseSharePath(pathname: string): { hw: string; model: string } | null {
  const m = pathname.match(/^\/s\/([^/]+)\/([^/]+)\/?$/);
  return m ? { hw: decodeURIComponent(m[1]), model: decodeURIComponent(m[2]) } : null;
}

export function parseState(search: string, data: Dataset, pathname = '/'): State {
  const p = new URLSearchParams(search);
  const fromPath = parseSharePath(pathname);
  if (fromPath) {
    p.set(KEYS.hw, fromPath.hw);
    p.set(KEYS.model, fromPath.model);
  }
  const d = defaultState(data);
  const u = data.defaults.usage;
  const hw = p.get(KEYS.hw);
  const model = p.get(KEYS.model);
  return {
    hw: hw && (hw === CUSTOM_HW || data.hardware.some((h) => h.id === hw)) ? hw : d.hw,
    model: model && data.models.some((m) => m.id === model) ? model : d.model,
    usage: num(p.get(KEYS.usage), d.usage, u.min_tokens_per_day, u.max_tokens_per_day),
    ratio: num(p.get(KEYS.ratio), d.ratio, u.min_input_to_output_ratio, u.max_input_to_output_ratio),
    family: p.get('f') ?? '',
    sort: data.defaults.sorts.some((x) => x.id === p.get('s')) ? p.get('s')! : d.sort,
    price: priceParam(p.get(KEYS.price)),
    decline: num(p.get(KEYS.decline), d.decline, 0, 0.95),
    showOlder: p.get(KEYS.showOlder) === '1',
    kwh: num(p.get(KEYS.kwh), d.kwh, 0, 5),
    ctx: num(p.get(KEYS.ctx), d.ctx, 1024, 1_000_000),
    cloudTps: num(p.get(KEYS.cloudTps), d.cloudTps, 1, 10000),
    tps: opt(p.get(KEYS.tps), 0.1, 100_000),
    sub: opt(p.get(KEYS.sub), 1, 1_000_000),
    customName: (p.get(KEYS.customName) ?? '').slice(0, 40),
    customMem: opt(p.get(KEYS.customMem), 1, 4000),
    customWatts: opt(p.get(KEYS.customWatts), 1, 20_000),
    customBw: opt(p.get(KEYS.customBw), 1, 5000),
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
  if (s.sort) p.set(KEYS.sort, s.sort);
  if (s.price != null) p.set(KEYS.price, String(Math.round(s.price)));
  if (s.decline > 0) p.set(KEYS.decline, String(s.decline));
  if (s.showOlder) p.set(KEYS.showOlder, '1');
  if (s.tps != null) p.set(KEYS.tps, String(s.tps));
  if (s.sub != null) p.set(KEYS.sub, String(s.sub));
  if (s.hw === CUSTOM_HW) {
    if (s.customName) p.set(KEYS.customName, s.customName);
    if (s.customMem != null) p.set(KEYS.customMem, String(s.customMem));
    if (s.customWatts != null) p.set(KEYS.customWatts, String(s.customWatts));
    if (s.customBw != null) p.set(KEYS.customBw, String(s.customBw));
  }
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
