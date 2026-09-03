/**
 * Checks the JSON data files for shape and internal consistency. Run before build.
 * Fails on: broken references, negative numbers, KV-cache figures that disagree with
 * the architecture, stand-in power figures without a note. Warns on nulls (TODOs).
 */
import { readFileSync } from 'node:fs';
import { kvCacheGbPer8kFromArchitecture } from '../src/fit';
import { CAPABILITY_KEYS, type Hardware, type Model, type Throughput, type Defaults, type UnitsFile } from '../src/types';

const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const hardware = read('hardware.json') as Hardware[];
const models = read('models.json') as Model[];
const throughput = read('throughput.json') as Throughput[];
const defaults = read('defaults.json') as Defaults;
const units = read('units.json') as UnitsFile;

const errors: string[] = [];
const warnings: string[] = [];
const ids = new Set<string>();

for (const h of hardware) {
  if (ids.has(h.id)) errors.push(`duplicate id ${h.id}`);
  ids.add(h.id);
  for (const k of ['unified_memory_gb'] as const) if (typeof h[k] !== 'number') errors.push(`${h.id}: ${k} must be a number`);
  for (const k of ['memory_bandwidth_gbs', 'usable_memory_gb', 'price_usd', 'load_watts'] as const) {
    const v = h[k];
    if (v == null) warnings.push(`${h.id}: ${k} is null (TODO)`);
    else if (typeof v !== 'number' || v < 0) errors.push(`${h.id}: ${k} must be a non-negative number`);
  }
  if (h.usable_memory_gb != null && h.usable_memory_gb > h.unified_memory_gb) errors.push(`${h.id}: usable > total memory`);
  if (h.load_watts_status === 'stand_in' && !h.load_watts_note) errors.push(`${h.id}: stand-in power figure needs load_watts_note`);
  if (h.price_usd == null && !h.TODO) errors.push(`${h.id}: null price needs a TODO`);
}

const modelIds = new Set<string>();
for (const m of models) {
  if (modelIds.has(m.id)) errors.push(`duplicate model id ${m.id}`);
  modelIds.add(m.id);
  if (m.weights_gb == null) warnings.push(`${m.id}: weights_gb is null (TODO)`);
  for (const k of CAPABILITY_KEYS) {
    const r = m.capabilities?.[k];
    if (!['green', 'amber', 'red', 'unknown'].includes(r)) errors.push(`${m.id}: capability ${k} is ${r}`);
  }
  if (Object.values(m.capabilities).includes('unknown') && !m.TODO) errors.push(`${m.id}: unknown rating needs a TODO`);
  const derived = kvCacheGbPer8kFromArchitecture(m);
  if (derived == null) warnings.push(`${m.id}: no architecture; KV cache falls back to kv_cache_gb_per_8k`);
  else if (m.kv_cache_gb_per_8k == null || Math.abs(derived - m.kv_cache_gb_per_8k) / derived > 0.02) {
    errors.push(`${m.id}: kv_cache_gb_per_8k ${m.kv_cache_gb_per_8k} disagrees with architecture (${derived.toFixed(3)})`);
  }
  const ce = m.cloud_equivalent;
  if (!ce) errors.push(`${m.id}: cloud_equivalent missing`);
  else {
    if (ce.input_price_per_mtok == null || ce.output_price_per_mtok == null) warnings.push(`${m.id}: cloud price null (TODO)`);
    if (typeof ce.is_exact_match !== 'boolean') errors.push(`${m.id}: is_exact_match must be boolean`);
  }
  if (m.active_params_b != null && m.active_params_b > m.params_b) errors.push(`${m.id}: active params exceed total`);
}

for (const t of throughput) {
  if (!ids.has(t.hardware_id)) errors.push(`throughput: unknown hardware ${t.hardware_id}`);
  if (!modelIds.has(t.model_id)) errors.push(`throughput: unknown model ${t.model_id}`);
  if (!['measured', 'estimated'].includes(t.measurement)) errors.push(`throughput ${t.model_id}/${t.hardware_id}: bad measurement`);
  if (!t.source) errors.push(`throughput ${t.model_id}/${t.hardware_id}: source required`);
  if (t.tokens_per_sec != null && (typeof t.tokens_per_sec !== 'number' || t.tokens_per_sec <= 0)) errors.push(`throughput ${t.model_id}/${t.hardware_id}: bad tokens_per_sec`);
  const hw = hardware.find((h) => h.id === t.hardware_id);
  const m = models.find((x) => x.id === t.model_id);
  if (hw?.memory_bandwidth_gbs && m?.weights_gb && t.tokens_per_sec) {
    const active = (m.active_params_b ?? m.params_b) / m.params_b;
    const ceiling = hw.memory_bandwidth_gbs / (m.weights_gb * active);
    if (t.tokens_per_sec > ceiling * 1.05) errors.push(`throughput ${t.model_id}/${t.hardware_id}: ${t.tokens_per_sec} tok/s exceeds the bandwidth ceiling (${ceiling.toFixed(1)})`);
  }
}
const pairs = new Set<string>();
for (const t of throughput) {
  const k = `${t.model_id}|${t.hardware_id}`;
  if (pairs.has(k)) errors.push(`throughput: duplicate pair ${k}`);
  pairs.add(k);
}

if (!/^\d{4}-\d{2}-\d{2}$/.test(defaults.data_last_checked)) errors.push('defaults.data_last_checked must be YYYY-MM-DD');
for (const k of ['efficiency_dense', 'efficiency_moe'] as const) if (!(defaults.estimate[k] > 0 && defaults.estimate[k] <= 1)) errors.push(`defaults.estimate.${k} must be in (0, 1]`);
for (const u of units.units) if (u.words == null && u.tokens == null) errors.push(`unit ${u.id}: needs words or tokens`);

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`${hardware.length} hardware, ${models.length} models, ${throughput.length} throughput rows; ${warnings.length} warnings, ${errors.length} errors`);
if (errors.length) process.exit(1);
