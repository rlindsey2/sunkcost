/**
 * Best buys: for an amount of daily use, the machine-and-model pairs that pay back soonest,
 * grouped by how capable the model is. Current machines and models only, at list price and the
 * default ratio, electricity, context and today's API prices. Pairs that don't fit, can't
 * produce that much in a day, or never pay back are counted, not listed.
 */
import { computeView, type View } from './compute';
import { defaultState } from './state';
import type { Dataset, Hardware, Model } from './types';

export interface Combo {
  hw: Hardware;
  model: Model;
  view: View;
  days: number;
}

export interface TierPicks {
  tier: number;
  label: string;
  plain: string;
  hosted: string[];
  /** quickest pay-backs, one row per model (its quickest machine) */
  picks: Combo[];
  /** pairs in this class that fit a machine at all */
  considered: number;
  never: number;
  overCapacity: number;
}

/** One usage level per band the calculator names: "a few chats a day" up to "agents running most of the day". */
export function bestUsageLevels(data: Dataset): { usage: number; label: string }[] {
  const u = data.defaults.usage;
  return u.labels.map((l) => ({ usage: Math.min(l.up_to, u.max_tokens_per_day), label: l.label }));
}

export function bestByTier(data: Dataset, usage: number, perTier = 3): TierPicks[] {
  const tiers = data.defaults.frontier_tiers;
  const byTier = new Map<number, { combos: Combo[]; considered: number; never: number; overCapacity: number }>();
  for (const hw of data.hardware) {
    if (hw.price_usd == null || (hw.generation ?? 'current') !== 'current') continue;
    for (const m of data.models) {
      const tier = m.frontier_equivalent?.tier;
      if (tier == null || (m.generation ?? 'current') !== 'current') continue;
      const view = computeView({ ...defaultState(data), hw: hw.id, model: m.id, usage }, data);
      if (view.model?.id !== m.id || !view.calc) continue;
      const t = byTier.get(tier) ?? { combos: [], considered: 0, never: 0, overCapacity: 0 };
      byTier.set(tier, t);
      t.considered++;
      if (view.capacity.capped) t.overCapacity++;
      else if (view.calc.breakevenDays == null) t.never++;
      else t.combos.push({ hw, model: m, view, days: view.calc.breakevenDays });
    }
  }
  return [...byTier.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([tier, t]) => {
      const seen = new Set<string>();
      const picks = t.combos
        .sort((a, b) => a.days - b.days || a.hw.price_usd! - b.hw.price_usd!)
        .filter((c) => (seen.has(c.model.display_name) ? false : (seen.add(c.model.display_name), true)))
        .slice(0, perTier);
      const def = tiers.find((x) => x.tier === tier)!;
      return {
        tier,
        label: def.label,
        plain: def.plain,
        hosted: [def.anthropic, def.openai].filter((x): x is string => !!x),
        picks,
        considered: t.considered,
        never: t.never,
        overCapacity: t.overCapacity,
      };
    });
}
