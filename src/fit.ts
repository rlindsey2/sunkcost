import type { Defaults, Hardware, Measurement, Model, Throughput } from './types';

export const KV_BYTES_PER_VALUE = 2; // f16 K and V caches, the llama.cpp default

/**
 * KV cache in GB at a given context length, from the architecture:
 *   per cached token per layer = 2 (K and V) × n_kv_heads × head_dim × bytes
 *   full-attention layers cache every token in the context;
 *   sliding-window layers cache at most `sliding_window` tokens;
 *   linear-attention layers (Qwen3.5+ hybrids) keep a fixed state and are ignored.
 */
export function kvCacheGbFromArchitecture(m: Model, contextTokens: number): number | null {
  const a = m.architecture;
  if (!a || a.n_layers == null) return null;
  const bytes = a.kv_bytes_per_value ?? KV_BYTES_PER_VALUE;
  let perTokenPerLayer: number;
  if (a.kv_lora_rank != null) {
    // latent attention: one compressed vector plus the RoPE part, and no separate K and V
    perTokenPerLayer = (a.kv_lora_rank + (a.qk_rope_head_dim ?? 0)) * bytes;
  } else if (a.n_kv_heads != null && a.head_dim != null) {
    perTokenPerLayer = 2 * a.n_kv_heads * a.head_dim * bytes;
  } else {
    return null;
  }
  const slidingLayers = a.sliding_window_layers ?? 0;
  const fullLayers = a.full_attention_layers ?? a.n_layers - slidingLayers;
  const window = a.sliding_window ?? contextTokens;
  const cached = fullLayers * contextTokens + slidingLayers * Math.min(contextTokens, window);
  return (perTokenPerLayer * cached) / 1e9;
}

/** Derived at 8k so the validate script can check models.json agrees with the architecture. */
export function kvCacheGbPer8kFromArchitecture(m: Model): number | null {
  return kvCacheGbFromArchitecture(m, 8192);
}

export function kvCacheGb(m: Model, contextTokens: number): number | null {
  const fromArch = kvCacheGbFromArchitecture(m, contextTokens);
  if (fromArch != null) return fromArch;
  if (m.kv_cache_gb_per_8k == null) return null;
  return (m.kv_cache_gb_per_8k * contextTokens) / 8192;
}

export function footprintGb(m: Model, contextTokens: number): number | null {
  const kv = kvCacheGb(m, contextTokens);
  if (m.weights_gb == null || kv == null) return null;
  return m.weights_gb + kv;
}

export type FitStatus = 'fits' | 'nearly' | 'context' | 'no' | 'unknown';

export interface Fit {
  status: FitStatus;
  needGb: number | null;
  haveGb: number | null;
  reason: string;
}

export function fit(m: Model, hw: Hardware, contextTokens: number, nearlyRatio: number): Fit {
  const need = footprintGb(m, contextTokens);
  const have = hw.usable_memory_gb;
  if (need == null || have == null) {
    return { status: 'unknown', needGb: need, haveGb: have, reason: need == null ? 'model size unknown' : 'usable memory unknown' };
  }
  if (m.max_context_tokens != null && contextTokens > m.max_context_tokens) {
    return { status: 'context', needGb: need, haveGb: have, reason: `this model's context limit is ${Math.round(m.max_context_tokens / 1024)}k tokens` };
  }
  if (need <= have) return { status: 'fits', needGb: need, haveGb: have, reason: '' };
  if (need <= have * nearlyRatio) {
    return {
      status: 'nearly',
      needGb: need,
      haveGb: have,
      reason: `needs ${need.toFixed(1)} GB, this config has ${have} GB usable`,
    };
  }
  return { status: 'no', needGb: need, haveGb: have, reason: `needs ${need.toFixed(1)} GB` };
}

export interface ResolvedThroughput {
  /** speed at the context length you asked for */
  tokensPerSec: number | null;
  /** speed before the context adjustment, as measured or estimated */
  baseTokensPerSec: number | null;
  /** context depth the base figure applies to */
  baseContext: number;
  /** tokensPerSec / baseTokensPerSec; < 1 means context slowed it down */
  contextFactor: number;
  measurement: Measurement | 'unknown';
  source: string;
  sourceUrl: string | null;
  detail: string;
}

/**
 * Decoding is memory-bandwidth bound at batch size 1: every generated token
 * reads the active weights and the whole KV cache. Growing the context grows
 * the cache, so speed falls roughly in proportion to the extra bytes read.
 * See defaults.context_decay for the calibration against public benchmarks.
 */
export function contextSpeedFactor(m: Model, fromContext: number, toContext: number): number {
  const weights = bytesReadPerTokenGb(m);
  if (weights == null) return 1;
  const kvFrom = kvCacheGb(m, fromContext) ?? 0;
  const kvTo = kvCacheGb(m, toContext) ?? 0;
  const denom = weights + kvTo;
  if (denom <= 0) return 1;
  return (weights + kvFrom) / denom;
}

/** Bytes the GPU must read per generated token, in GB. MoE models only read active experts. */
export function bytesReadPerTokenGb(m: Model): number | null {
  if (m.weights_gb == null) return null;
  const active = m.active_params_b ?? m.params_b;
  return m.weights_gb * (active / m.params_b);
}

export function isMoe(m: Model): boolean {
  return m.active_params_b != null && m.active_params_b < m.params_b;
}

export function estimateEfficiency(m: Model, hw: Hardware, defaults: Defaults): number {
  if (isMoe(m)) return hw.estimate_efficiency_moe ?? defaults.estimate.efficiency_moe;
  return defaults.estimate.efficiency_dense;
}

export function estimateTokensPerSec(m: Model, hw: Hardware, efficiency: number): number | null {
  const gb = bytesReadPerTokenGb(m);
  if (gb == null || hw.memory_bandwidth_gbs == null) return null;
  return (hw.memory_bandwidth_gbs / gb) * efficiency;
}

export function resolveThroughput(
  m: Model,
  hw: Hardware,
  throughput: Throughput[],
  defaults: Defaults,
  contextTokens: number,
): ResolvedThroughput {
  const row = throughput.find((t) => t.model_id === m.id && t.hardware_id === hw.id && t.tokens_per_sec != null);
  if (row && row.tokens_per_sec != null) {
    const from = row.measured_at_context ?? 0;
    const factor = contextSpeedFactor(m, from, contextTokens);
    return {
      tokensPerSec: row.tokens_per_sec * factor,
      baseTokensPerSec: row.tokens_per_sec,
      baseContext: from,
      contextFactor: factor,
      measurement: row.measurement,
      source: row.source,
      sourceUrl: row.source_url ?? null,
      detail: [row.runtime, row.quant, row.notes].filter(Boolean).join(' · '),
    };
  }
  const eff = estimateEfficiency(m, hw, defaults);
  const est = estimateTokensPerSec(m, hw, eff);
  if (est == null) {
    return { tokensPerSec: null, baseTokensPerSec: null, baseContext: 0, contextFactor: 1, measurement: 'unknown', source: 'no measurement and not enough data to estimate', sourceUrl: null, detail: '' };
  }
  const factor = contextSpeedFactor(m, 0, contextTokens);
  const gb = bytesReadPerTokenGb(m)!;
  const moe = isMoe(m);
  return {
    tokensPerSec: est * factor,
    baseTokensPerSec: est,
    baseContext: 0,
    contextFactor: factor,
    measurement: 'estimated',
    source: `estimated: ${hw.memory_bandwidth_gbs} GB/s ÷ ${gb.toFixed(1)} GB read per token${moe ? ' (active experts only)' : ''} × ${eff} ${moe ? 'MoE' : 'dense'} efficiency`,
    sourceUrl: null,
    detail: `bandwidth-bound estimate, not a measurement${moe && hw.estimate_note ? `. ${hw.estimate_note}` : ''}`,
  };
}
