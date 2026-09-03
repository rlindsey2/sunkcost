import type { Unit, UnitsFile } from './types';
import { fmtInt } from './format';

export interface UnitPick {
  unit: Unit;
  unitTokens: number;
  count: number;
  text: string; // "about 312 complete works of Shakespeare"
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function unitTokens(u: Unit, tokensPerWord: number): number {
  if (u.tokens != null) return u.tokens;
  return (u.words ?? 0) * tokensPerWord;
}

/**
 * Convert a token count into a concrete, slightly ridiculous unit. Deterministic
 * per seed (the config) so a given URL always produces the same punchline, but
 * different configs land on different units.
 */
export function pickUnit(tokens: number, seed: string, units: UnitsFile): UnitPick | null {
  if (!Number.isFinite(tokens) || tokens <= 0) return null;
  const scored = units.units
    .map((u) => {
      const ut = unitTokens(u, units.tokens_per_word);
      return { unit: u, unitTokens: ut, count: tokens / ut };
    })
    .filter((x) => x.unitTokens > 0);

  // Prefer counts a human can picture: 1.5 .. 9,999. Fall back to 1 .. 99,999, then anything.
  const tiers: Array<(c: number) => boolean> = [
    (c) => c >= 1.5 && c < 10000,
    (c) => c >= 1 && c < 100000,
    () => true,
  ];
  let candidates: typeof scored = [];
  for (const ok of tiers) {
    candidates = scored.filter((x) => ok(x.count));
    if (candidates.length) break;
  }
  if (!candidates.length) return null;
  const pick = candidates[hash(seed) % candidates.length];
  const rounded = pick.count >= 10 ? Math.round(pick.count) : Math.round(pick.count * 10) / 10;
  const noun = rounded === 1 ? pick.unit.singular : pick.unit.plural;
  const n = rounded >= 10 ? fmtInt(rounded) : String(rounded);
  return { ...pick, count: rounded, text: `about ${n} ${noun}` };
}
