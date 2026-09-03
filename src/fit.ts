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
  if (!a || a.n_layers == null || a.n_kv_heads == null || a.head_dim == null) return null;
  const perTokenPerLayer = 2 * a.n_kv_heads * a.head_dim * (a.kv_bytes_per_value ?? KV_BYTES_PER_VALUE);
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

export type FitStatus = 'fits' | 'nearly' | 'no' | 'unknown';

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
  tokensPerSec: number | null;
  measurement: Measurement | 'unknown';
  source: string;
  sourceUrl: string | null;
  detail: string;
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
): ResolvedThroughput {
  const row = throughput.find((t) => t.model_id === m.id && t.hardware_id === hw.id && t.tokens_per_sec != null);
  if (row && row.tokens_per_sec != null) {
    return {
      tokensPerSec: row.tokens_per_sec,
      measurement: row.measurement,
      source: row.source,
      sourceUrl: row.source_url ?? null,
      detail: [row.runtime, row.quant, row.notes].filter(Boolean).join(' · '),
    };
  }
  const eff = estimateEfficiency(m, hw, defaults);
  const est = estimateTokensPerSec(m, hw, eff);
  if (est == null) {
    return { tokensPerSec: null, measurement: 'unknown', source: 'no measurement and not enough data to estimate', sourceUrl: null, detail: '' };
  }
  const gb = bytesReadPerTokenGb(m)!;
  const moe = isMoe(m);
  return {
    tokensPerSec: est,
    measurement: 'estimated',
    source: `estimated: ${hw.memory_bandwidth_gbs} GB/s ÷ ${gb.toFixed(1)} GB read per token${moe ? ' (active experts only)' : ''} × ${eff} ${moe ? 'MoE' : 'dense'} efficiency`,
    sourceUrl: null,
    detail: `bandwidth-bound estimate, not a measurement${moe && hw.estimate_note ? `. ${hw.estimate_note}` : ''}`,
  };
}
