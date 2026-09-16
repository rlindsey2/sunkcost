/**
 * Capturing what people enter (their own machines, measured speeds and monthly bills) so the
 * options and estimates can improve. Anonymous by construction: no cookies, no IP address, no
 * identifier. The browser sends only the calculator settings it was given; the server checks
 * every field and recomputes what the site showed (our speed, the pay-back), so a stored
 * comparison can't be spoofed.
 */
import { computeView } from './compute';
import { bandwidthCeilingTps, kvScaleFor } from './fit';
import { CUSTOM_HW, defaultState, type State } from './state';
import type { Dataset } from './types';

export interface SubmissionPayload {
  hw: string;
  model: string;
  customName: string;
  customMem: number | null;
  customWatts: number | null;
  customBw: number | null;
  price: number | null;
  tps: number | null;
  sub: number | null;
  usage: number;
  ratio: number;
  ctx: number;
  kwh: number;
  tpsCtx: number | null;
  kv: string;
}

/** Which of your own numbers are in play: only these are worth recording. */
export function submissionKinds(s: State): string[] {
  const kinds: string[] = [];
  if (s.hw === CUSTOM_HW && s.customMem != null && s.customWatts != null && s.price != null) kinds.push('custom_machine');
  if (s.tps != null && s.model) kinds.push('measured_speed');
  if (s.sub != null) kinds.push('subscription');
  return kinds;
}

/** What the browser sends, or null when you are only using our figures. */
export function submissionPayload(s: State): SubmissionPayload | null {
  if (!submissionKinds(s).length) return null;
  const custom = s.hw === CUSTOM_HW;
  return {
    hw: s.hw,
    model: s.model,
    customName: custom ? s.customName : '',
    customMem: custom ? s.customMem : null,
    customWatts: custom ? s.customWatts : null,
    customBw: custom ? s.customBw : null,
    price: s.price,
    tps: s.tps,
    sub: s.sub,
    usage: Math.round(s.usage),
    ratio: s.ratio,
    ctx: s.ctx,
    kwh: s.kwh,
    tpsCtx: s.tpsCtx,
    kv: s.kv,
  };
}

export const SUBMISSION_COLUMNS = [
  'kinds', 'hw', 'model', 'custom_name', 'custom_mem_gb', 'custom_watts', 'custom_bw_gbs', 'price_usd',
  'tps', 'our_tps', 'our_measurement', 'sub_usd', 'usage', 'ratio', 'ctx', 'kwh', 'breakeven_days', 'data_checked',
  'tps_ctx', 'kv', 'ceiling_tps',
] as const;

export type SubmissionRow = Record<(typeof SUBMISSION_COLUMNS)[number], string | number | null>;

/** The table, created on first write. `country` is filled by the server from Cloudflare's request data. */
export const SUBMISSIONS_SCHEMA = `CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  kinds TEXT NOT NULL,
  hw TEXT NOT NULL,
  model TEXT,
  custom_name TEXT,
  custom_mem_gb REAL,
  custom_watts REAL,
  custom_bw_gbs REAL,
  price_usd REAL,
  tps REAL,
  our_tps REAL,
  our_measurement TEXT,
  sub_usd REAL,
  usage INTEGER,
  ratio REAL,
  ctx INTEGER,
  kwh REAL,
  breakeven_days REAL,
  data_checked TEXT,
  country TEXT,
  tps_ctx INTEGER,
  kv TEXT,
  ceiling_tps REAL
)`;

const numIn = (v: unknown, min: number, max: number): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null;

/** Control characters and angle brackets never belong in a machine name. */
const UNSAFE_NAME_CHARS = /[\x00-\x1f\x7f<>]/g;

/** Server side: check a payload field by field and turn it into a row, or null if there is nothing valid to keep. */
export function submissionRow(input: unknown, data: Dataset): SubmissionRow | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const x = input as Record<string, unknown>;
  const d = defaultState(data);
  const u = data.defaults.usage;
  const hw = typeof x.hw === 'string' && (x.hw === CUSTOM_HW || data.hardware.some((h) => h.id === x.hw)) ? x.hw : null;
  if (!hw) return null;
  const custom = hw === CUSTOM_HW;
  const model = typeof x.model === 'string' && data.models.some((m) => m.id === x.model) ? x.model : '';
  const state: State = {
    ...d,
    hw,
    model,
    customName: custom && typeof x.customName === 'string' ? x.customName.replace(UNSAFE_NAME_CHARS, '').trim().slice(0, 40) : '',
    customMem: custom ? numIn(x.customMem, 1, 4000) : null,
    customWatts: custom ? numIn(x.customWatts, 1, 20_000) : null,
    customBw: custom ? numIn(x.customBw, 1, 5000) : null,
    price: numIn(x.price, 1, 1e7),
    tps: model ? numIn(x.tps, 0.1, 100_000) : null,
    sub: numIn(x.sub, 1, 1e6),
    usage: numIn(x.usage, u.min_tokens_per_day, u.max_tokens_per_day) ?? d.usage,
    ratio: numIn(x.ratio, u.min_input_to_output_ratio, u.max_input_to_output_ratio) ?? d.ratio,
    ctx: numIn(x.ctx, 1024, 1_000_000) ?? d.ctx,
    kwh: numIn(x.kwh, 0, 5) ?? d.kwh,
    decline: 0,
    tpsCtx: typeof x.tpsCtx === 'number' && data.defaults.context.options.includes(x.tpsCtx) ? x.tpsCtx : null,
    kv: typeof x.kv === 'string' && (data.defaults.kv_cache?.types ?? []).some((t) => t.id === x.kv) ? x.kv : d.kv,
  };
  const kinds = submissionKinds(state);
  if (!kinds.length) return null;
  const view = computeView(state, data);
  // what we would have shown without their speed, to see how far off our figure is
  // compared where they measured: at their context and cache type, with their speed taken out
  const measuredCtx = state.tpsCtx ?? state.ctx;
  const oursView = state.tps != null ? computeView({ ...state, tps: null, ctx: measuredCtx }, data) : null;
  const ours = oursView?.rows.find((r) => r.model.id === model)?.throughput ?? null;
  const modelObj = data.models.find((m) => m.id === model);
  const ceiling = oursView && modelObj ? bandwidthCeilingTps(modelObj, oursView.hw, measuredCtx, kvScaleFor(state.kv, data.defaults)) : null;
  return {
    kinds: kinds.join(','),
    hw,
    model: model || null,
    custom_name: state.customName || null,
    custom_mem_gb: state.customMem,
    custom_watts: state.customWatts,
    custom_bw_gbs: state.customBw,
    price_usd: state.price,
    tps: state.tps,
    our_tps: ours?.tokensPerSec ?? null,
    our_measurement: ours ? ours.measurement : null,
    sub_usd: state.sub,
    usage: Math.round(state.usage),
    ratio: state.ratio,
    ctx: state.ctx,
    kwh: state.kwh,
    breakeven_days: view.calc?.breakevenDays ?? null,
    data_checked: data.defaults.data_last_checked,
    tps_ctx: state.tps != null ? state.tpsCtx : null,
    kv: state.kv,
    ceiling_tps: ceiling,
  };
}
