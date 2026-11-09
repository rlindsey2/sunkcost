/**
 * Checks the JSON data files for shape and internal consistency. Run before build.
 * Fails on: broken references, negative numbers, weights that are not a positive figure,
 * KV-cache figures that disagree with the architecture, stand-in power figures without a
 * note, rental prices of zero.
 * Warns on nulls (TODOs).
 */
import { readFileSync } from 'node:fs';
import { kvCacheGbPer8kFromArchitecture } from '../src/fit';
import { CAPABILITY_KEYS, type Hardware, type Model, type Throughput, type Defaults } from '../src/types';

const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const hardware = read('hardware.json') as Hardware[];
const models = read('models.json') as Model[];
const throughput = read('throughput.json') as Throughput[];
const defaults = read('defaults.json') as Defaults;

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
  // every label is built as "<family> <chip>, <memory>GB", so a chip that already ends in
  // its memory size prints it twice: "NVIDIA GeForce RTX 3060 12GB, 12GB"
  if (new RegExp(`\\b${h.unified_memory_gb}\\s?GB$`, 'i').test(h.chip)) {
    errors.push(`${h.id}: chip "${h.chip}" ends in its memory size, which the label adds again`);
  }
}

const basis = defaults.frontier_basis;
const basisVersion = basis?.version?.trim() ?? '';
const scoredRows = models.filter((m) => m.frontier_equivalent?.score != null).length;

const modelIds = new Set<string>();
for (const m of models) {
  if (modelIds.has(m.id)) errors.push(`duplicate model id ${m.id}`);
  modelIds.add(m.id);
  if (m.weights_gb == null) warnings.push(`${m.id}: weights_gb is null (TODO)`);
  // Every speed on the site is a machine's bandwidth divided by this figure, and every fit
  // is the figure plus a cache against the memory a machine hands a model. A zero makes an
  // infinite tok/s; a negative makes a model that leaves a machine roomier for holding it.
  else if (typeof m.weights_gb !== 'number' || m.weights_gb <= 0) errors.push(`${m.id}: weights_gb must be a positive number`);
  for (const k of CAPABILITY_KEYS) {
    const r = m.capabilities?.[k];
    if (!['green', 'amber', 'red', 'unknown'].includes(r)) errors.push(`${m.id}: capability ${k} is ${r}`);
  }
  if (Object.values(m.capabilities).includes('unknown') && !m.TODO) errors.push(`${m.id}: unknown rating needs a TODO`);
  // Where both groups are counted, the cache is worked out from the two counts and
  // never from n_layers, so n_layers can drift without the figure moving: Ripple 65B's
  // 80 could read 60 against 16 growing and 64 windowed and still agree to the
  // gigabyte. The layer count is what the model pages say in prose beside the cache,
  // so the two counts have to fit inside it. They need not fill it — 13 of LFM3
  // 1.7B's 24 layers are convolutions that cache nothing and are in neither group.
  const arch = m.architecture;
  if (arch?.n_layers != null && (arch.full_attention_layers != null || arch.sliding_window_layers != null)) {
    const counted = (arch.full_attention_layers ?? 0) + (arch.sliding_window_layers ?? 0);
    if (counted > arch.n_layers) {
      errors.push(`${m.id}: ${counted} layers are counted as caching (${arch.full_attention_layers ?? 0} full, ${arch.sliding_window_layers ?? 0} windowed) and the model has ${arch.n_layers}`);
    }
  }
  const derived = kvCacheGbPer8kFromArchitecture(m);
  if (derived == null) warnings.push(`${m.id}: no architecture; KV cache falls back to kv_cache_gb_per_8k`);
  else if (m.kv_cache_gb_per_8k == null || Math.abs(derived - m.kv_cache_gb_per_8k) / derived > 0.02) {
    errors.push(`${m.id}: kv_cache_gb_per_8k ${m.kv_cache_gb_per_8k} disagrees with architecture (${derived.toFixed(3)})`);
  }
  const ce = m.cloud_equivalent;
  if (!ce) errors.push(`${m.id}: cloud_equivalent missing`);
  else {
    if (ce.input_price_per_mtok == null || ce.output_price_per_mtok == null) errors.push(`${m.id}: no rental price — add the OpenRouter price, or a stand-in from the closest hosted model`);
    else if (ce.input_price_per_mtok < 0 || ce.output_price_per_mtok < 0) errors.push(`${m.id}: rental price of $${ce.input_price_per_mtok} / $${ce.output_price_per_mtok} — a price cannot be negative`);
    // A free endpoint is a real listing and not a price. Every page here divides a machine's
    // price by the rental bill it saves, and a bill of zero is a sum with no answer: the page
    // would read "renting the same model costs $0" and then "buying only beats that if you use
    // it hard enough", which nothing can. Where a provider lists a model free, the price is its
    // own paid endpoint if it has one, else a stand-in from the closest hosted model.
    else if (ce.input_price_per_mtok === 0 || ce.output_price_per_mtok === 0) errors.push(`${m.id}: rental price of $${ce.input_price_per_mtok} / $${ce.output_price_per_mtok} — a free listing is not a price to pay back against; use the paid endpoint for this model, or a stand-in from the closest hosted model`);
    if (ce.stand_in) {
      const target = models.find((x) => x.id === ce.stand_in_for);
      if (!target) errors.push(`${m.id}: stand-in points at unknown model ${ce.stand_in_for}`);
      else if (target.cloud_equivalent.stand_in) errors.push(`${m.id}: stand-in ${target.id} is itself a stand-in`);
      else if (target.cloud_equivalent.input_price_per_mtok !== ce.input_price_per_mtok || target.cloud_equivalent.output_price_per_mtok !== ce.output_price_per_mtok) errors.push(`${m.id}: stand-in price no longer matches ${target.id}`);
      if (!ce.stand_in_basis || !ce.note) errors.push(`${m.id}: stand-in needs a basis and a note saying nobody rents it`);
    }
    if (typeof ce.is_exact_match !== 'boolean') errors.push(`${m.id}: is_exact_match must be boolean`);
  }
  // Every page reads weights_gb as the whole download, and on a model that takes images it
  // is the language model alone: the vision projector is a second file. The field is set on
  // every row, an object or an explicit null, so a new row cannot leave the question open
  // and read as text only by omission.
  if (!('vision' in m)) errors.push(`${m.id}: vision is required — an object where the model reads images, null where it is text only`);
  const vis = m.vision;
  if (vis) {
    if (vis.reads_images !== true) errors.push(`${m.id}: vision.reads_images must be true; a text-only row has vision null`);
    if (!vis.source_url) errors.push(`${m.id}: vision needs the source_url of the repository whose card states it reads images`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(vis.checked ?? '')) errors.push(`${m.id}: vision.checked must be YYYY-MM-DD`);
    // Both URLs are repositories the row already cites, so a reader following the
    // Sources line lands on the card and the file the two figures were read off.
    const repoOf = (u: string) => u.match(/^https:\/\/huggingface\.co\/([^/]+\/[^/]+)/)?.[1] ?? null;
    const cited = new Set((m.sources ?? []).map(repoOf).filter(Boolean));
    for (const k of ['source_url', 'projector_source_url'] as const) {
      const u = vis[k];
      if (!u) continue;
      const repo = repoOf(u);
      if (!repo) errors.push(`${m.id}: vision.${k} "${u}" is not a Hugging Face repository`);
      else if (!cited.has(repo)) errors.push(`${m.id}: vision.${k} cites ${repo}, which is not in this row's sources`);
    }
    const parts = [vis.projector_gb, vis.projector_bytes, vis.projector_file, vis.projector_source_url];
    if (parts.some((v) => v != null) && parts.some((v) => v == null)) {
      errors.push(`${m.id}: a projector figure needs its bytes, its file name and the repository that publishes it, or all four null`);
    }
    if (vis.projector_gb == null) {
      if (!vis.projector_TODO) errors.push(`${m.id}: no projector figure needs a projector_TODO saying why`);
    } else {
      if (vis.projector_TODO) errors.push(`${m.id}: projector_TODO sits beside a projector figure of ${vis.projector_gb} GB`);
      if (typeof vis.projector_gb !== 'number' || vis.projector_gb <= 0) errors.push(`${m.id}: vision.projector_gb must be a positive number`);
      // The GB on the page is the byte count rounded, so the two cannot drift apart: a
      // corrected file size that leaves the old GB behind is the mistake this catches.
      const rounded = Math.round((vis.projector_bytes ?? 0) / 1e7) / 100;
      if (Math.abs(rounded - vis.projector_gb) > 0.005) {
        errors.push(`${m.id}: vision.projector_gb ${vis.projector_gb} is not ${vis.projector_bytes} bytes rounded (${rounded})`);
      }
      // A projector is a vision tower, not a language model. One larger than the weights it
      // sits beside means the two figures were read off the wrong files.
      if (m.weights_gb != null && vis.projector_gb >= m.weights_gb) {
        errors.push(`${m.id}: vision projector ${vis.projector_gb} GB is not smaller than the ${m.weights_gb} GB of weights it loads beside`);
      }
      if (!/\.gguf$/i.test(vis.projector_file ?? '')) errors.push(`${m.id}: vision.projector_file should be the GGUF the figure was read off, not "${vis.projector_file}"`);
    }
  }
  // A projector size written into prose is a figure nothing reads back: Muse Glimmer's
  // note said "~1.4 GB" against the 3.85 GB file bartowski publishes, and stood because
  // no check could see it. The vision field states the size now, so the notes do not.
  for (const [where, text] of [['architecture.note', m.architecture?.note], ['capability_note', m.capability_note]] as const) {
    if (!text) continue;
    const said = text.match(/(?:vision |multimodal |mm)?(?:projector|vision encoder)[^.]*?(~?\d+(?:\.\d+)?)\s?GB/i);
    if (said) errors.push(`${m.id}: ${where} states a projector of ${said[1]} GB, which belongs in vision.projector_gb where it is held against the file`);
  }
  if (m.active_params_b != null && m.active_params_b > m.params_b) errors.push(`${m.id}: active params exceed total`);
  if (m.max_context_tokens == null) warnings.push(`${m.id}: max_context_tokens is null (TODO)`);
  const fe = m.frontier_equivalent;
  if (!fe) warnings.push(`${m.id}: no frontier_equivalent`);
  else if (fe.score != null) {
    const expected = defaults.frontier_tiers.filter((t) => fe.score! >= t.min_score).at(-1)?.tier ?? 0;
    if (fe.tier !== expected) errors.push(`${m.id}: frontier tier ${fe.tier} disagrees with score ${fe.score} (expected ${expected})`);
    if (!fe.url && !fe.basis) errors.push(`${m.id}: frontier score needs a basis or url`);
    // A ranking is only a ranking if every score on it is on one scale. The
    // version each row carries was a label nothing read, so a score off a newer
    // index could sit in the ladder beside the old ones and sort against them.
    if (basisVersion && fe.index_version !== basisVersion) {
      errors.push(`${m.id}: score is on index ${fe.index_version ?? 'nothing stated'} and the ranking is on ${basisVersion}, which cannot be sorted together`);
    }
    if (!fe.checked) errors.push(`${m.id}: frontier score needs the date it was read`);
  } else if (fe.tier != null) errors.push(`${m.id}: frontier tier without a score`);
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

// The basis names its version in prose and states it as a field. Both are printed,
// so they have to be the same string, and the field is what every row is held against.
if (basis) {
  if (!basisVersion) errors.push('defaults.frontier_basis.version is required; it is the scale every score is held to');
  else if (basis.name && !basis.name.trim().endsWith(basisVersion)) {
    errors.push(`defaults.frontier_basis: name "${basis.name}" does not end in its own version ${basisVersion}`);
  }
  const sup = basis.superseded_by;
  if (sup) {
    for (const k of ['name', 'url', 'checked'] as const) if (!sup[k]) errors.push(`defaults.frontier_basis.superseded_by.${k} is required`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sup.checked ?? '')) errors.push('defaults.frontier_basis.superseded_by.checked must be YYYY-MM-DD');
    if (sup.name === basis.name) errors.push('defaults.frontier_basis.superseded_by names the same index the scores are on');
    // the count is a figure on the page, so it has to be a count of these rows
    if (!Number.isInteger(sup.scored_here) || sup.scored_here < 0 || sup.scored_here > scoredRows) {
      errors.push(`defaults.frontier_basis.superseded_by.scored_here must be a whole number of the ${scoredRows} scored rows, not ${sup.scored_here}`);
    }
    if (sup.scored_here === scoredRows) errors.push('defaults.frontier_basis.superseded_by scores every row here, so the ranking should move to it rather than note it');
  }
}
for (const k of ['efficiency_dense', 'efficiency_moe'] as const) if (!(defaults.estimate[k] > 0 && defaults.estimate[k] <= 1)) errors.push(`defaults.estimate.${k} must be in (0, 1]`);

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
const visionRows = models.filter((m) => m.vision).length;
console.log(`${hardware.length} hardware, ${models.length} models (${visionRows} read images), ${throughput.length} throughput rows; ${warnings.length} warnings, ${errors.length} errors`);
if (errors.length) process.exit(1);
