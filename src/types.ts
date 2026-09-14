export type Rating = 'green' | 'amber' | 'red' | 'unknown';

export const CAPABILITY_KEYS = [
  'summarisation',
  'translation',
  'everyday_coding',
  'complex_reasoning',
  'agentic',
] as const;
export type CapabilityKey = (typeof CAPABILITY_KEYS)[number];

export const CAPABILITY_LABELS: Record<CapabilityKey, { short: string; long: string }> = {
  summarisation: { short: 'Summarise', long: 'Summarising & extraction: condensing documents, pulling structured data out of text' },
  translation: { short: 'Translate', long: 'Translation between common language pairs' },
  everyday_coding: { short: 'Coding', long: 'Everyday coding: autocomplete, small functions, explaining code' },
  complex_reasoning: { short: 'Reasoning', long: 'Complex reasoning & maths: multi-step problems where being wrong is expensive' },
  agentic: { short: 'Agentic', long: 'Long-context agentic work: tool use, long chains, staying coherent over many steps' },
};

export interface Hardware {
  id: string;
  family: string;
  chip: string;
  chip_variant?: string | null;
  unified_memory_gb: number;
  memory_bandwidth_gbs: number | null;
  usable_memory_gb: number | null;
  price_usd: number | null;
  idle_watts: number | null;
  load_watts: number | null;
  /** published = manufacturer figure; third_party_measured = a review's meter; stand_in = a flagged proxy from a previous chip */
  load_watts_status?: 'published' | 'third_party_measured' | 'stand_in';
  load_watts_note?: string;
  /** overrides defaults.estimate.efficiency_moe for this machine */
  estimate_efficiency_moe?: number | null;
  estimate_note?: string;
  generation?: 'current' | 'previous';
  status?: string;
  notes?: string;
  sources?: string[];
  TODO?: string | null;
}

export interface CloudEquivalent {
  name: string;
  input_price_per_mtok: number | null;
  output_price_per_mtok: number | null;
  source: string;
  source_url?: string | null;
  is_exact_match: boolean;
  checked?: string;
  note?: string;
  /** nobody rents this model; the price is borrowed from the closest hosted match */
  stand_in?: boolean;
  stand_in_for?: string;
  stand_in_basis?: 'finetune' | 'nearest_score' | 'nearest_size';
}

export interface ModelArchitecture {
  n_layers: number | null;
  n_kv_heads: number | null;
  head_dim: number | null;
  /**
   * Multi-head latent attention (DeepSeek V4, GLM, some Mistral). The cache holds one
   * compressed latent per token per layer plus the RoPE part, not n_kv_heads × head_dim,
   * which is why these models take so much less memory at long context than their head
   * counts suggest. When set, this supersedes n_kv_heads × head_dim.
   */
  kv_lora_rank?: number | null;
  qk_rope_head_dim?: number | null;
  /**
   * Escape hatches for architectures a single head-count cannot express. Where a
   * research pass has read the real per-layer widths out of config.json and the
   * modelling code, it records the bytes directly and `note` carries the arithmetic.
   * `kv_bytes_per_token_total` wins outright; otherwise the full and sliding groups
   * can each carry their own width.
   */
  kv_bytes_per_token_total?: number | null;
  bytes_per_token_full?: number | null;
  bytes_per_token_sliding?: number | null;
  /** layers whose KV cache grows with the full context; defaults to n_layers */
  full_attention_layers?: number | null;
  /** layers with a fixed attention window (Gemma 3, gpt-oss, Llama 4 chunked) */
  sliding_window_layers?: number | null;
  sliding_window?: number | null;
  /** bytes per cached K or V value; 2 = f16, the llama.cpp default */
  kv_bytes_per_value?: number;
  note?: string | null;
}

export interface FrontierEquivalent {
  /** index into defaults.frontier_tiers; null = not placed */
  tier: number | null;
  score?: number | null;
  score_note?: string | null;
  basis?: string | null;
  basis_TODO?: string;
  url?: string | null;
  checked?: string;
  index_version?: string;
  /** the index imputed this score rather than running the full suite */
  estimated?: boolean | null;
}

export interface Model {
  id: string;
  display_name: string;
  /** Qwen, Llama, Gemma… used by the list filter */
  family?: string;
  /** other names the same weights are published under (finetunes with identical memory profiles) */
  aliases?: string[];
  alias_note?: string;
  /** current = what people run today; legacy = superseded, kept because people still ask */
  generation?: 'current' | 'legacy';
  max_context_tokens?: number | null;
  max_context_note?: string | null;
  frontier_equivalent?: FrontierEquivalent;
  params_b: number;
  active_params_b?: number | null;
  quantisation: string;
  weights_gb: number | null;
  kv_cache_gb_per_8k: number | null;
  architecture?: ModelArchitecture;
  capabilities: Record<CapabilityKey, Rating>;
  capability_note: string;
  cloud_equivalent: CloudEquivalent;
  license: string;
  sources?: string[];
  TODO?: string | null;
}

export type Measurement = 'measured' | 'estimated';

export interface Throughput {
  model_id: string;
  hardware_id: string;
  tokens_per_sec: number | null;
  measurement: Measurement;
  source: string;
  source_url?: string | null;
  quant?: string;
  runtime?: string;
  notes?: string;
  /** context depth the figure was measured at; speed is scaled from here */
  measured_at_context?: number;
}

export interface UsageLabel {
  up_to: number;
  label: string;
}

export interface Defaults {
  data_last_checked: string;
  site_url: string;
  repo_url: string | null;
  default_hardware_id?: string | null;
  usage: {
    default_tokens_per_day: number;
    min_tokens_per_day: number;
    max_tokens_per_day: number;
    default_input_to_output_ratio: number;
    min_input_to_output_ratio: number;
    max_input_to_output_ratio: number;
    labels: UsageLabel[];
  };
  electricity: {
    default_price_per_kwh_usd: number;
    country: string;
    source: string;
    source_url?: string;
  };
  cloud: { default_tokens_per_sec: number; note: string };
  estimate: { efficiency_dense: number; efficiency_moe: number; note: string };
  context: { default_tokens: number; options: number[]; note?: string };
  context_decay?: { model: string; why: string; accuracy_note: string; calibration?: unknown[] };
  sorts: { id: string; label: string }[];
  default_sort?: string;
  capacity_note?: string;
  api_decline: {
    default_on: boolean;
    default_rate_per_year: number;
    options: number[];
    label: string;
    note: string;
    source: string;
    source_url?: string;
  };
  use_cases: { id: string; label: string; ratio: number; note?: string }[];
  frontier_tiers: { tier: number; min_score: number; label: string; anthropic: string | null; openai: string | null; plain: string }[];
  frontier_reference_note?: string;
  frontier_basis?: { name: string | null; url: string | null; checked: string | null; note?: string; estimated_note?: string };
  frontier_reference?: { name: string; short?: string; score: number; score_alt?: number; url?: string }[];
  frontier_scale_max?: number;
  nearly_fits_ratio: number;
  waterline_max_years: number;
  typical_task_output_tokens: number;
}

export interface Dataset {
  hardware: Hardware[];
  models: Model[];
  throughput: Throughput[];
  defaults: Defaults;
}
