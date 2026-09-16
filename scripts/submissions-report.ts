/**
 * What people have entered, turned into things to act on: custom machines worth adding to the
 * list, speeds that disagree with ours, and the bills people weigh a machine against.
 *
 * Reads the sunkcost-submissions D1 database through wrangler, so it needs CLOUDFLARE_API_TOKEN
 * (with D1 read) and CLOUDFLARE_ACCOUNT_ID in the environment.
 *   npm run submissions
 *   npm run submissions -- --days 30
 *
 * Before comparing anything it:
 * - collapses one person's burst of edits into their final entry,
 * - leaves out placeholder machine names ("test", "asdf", one or two characters),
 * - compares a reported speed with ours at the context and cache type it was measured at, and
 * - sets aside speeds above what the machine's memory bandwidth allows, which are almost always
 *   prompt processing rather than generation.
 * These are unverified reports: leads to measure or source, never data on their own.
 */
import { execFileSync } from 'node:child_process';
import { dataset as data } from '../src/dataset';
import { computeView } from '../src/compute';
import { CUSTOM_HW, defaultState, type State } from '../src/state';
import { bandwidthCeilingTps, kvScaleFor } from '../src/fit';

const flag = process.argv.indexOf('--days');
const days = flag > 0 ? Math.max(1, Math.round(Number(process.argv[flag + 1]) || 30)) : 3650;
const sql = `SELECT * FROM submissions WHERE created_at >= strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '-${days} days') ORDER BY id`;
const out = execFileSync('npx', ['wrangler', 'd1', 'execute', 'sunkcost-submissions', '--remote', '--json', '--command', sql], {
  encoding: 'utf8',
  maxBuffer: 1 << 28,
  stdio: ['ignore', 'pipe', 'inherit'],
});
type Row = Record<string, any>;
const rows: Row[] = JSON.parse(out)[0]?.results ?? [];

/** Most benchmarks (llama-bench tg128 and the like) run at a near-empty context. */
const ASSUMED_CTX = 4096;
/** Speculative decoding can beat the plain bandwidth ceiling a little; far beyond it is not a generation speed. */
const CEILING_SLACK = 1.5;
const PLACEHOLDER = /^(test\w*|asdf\w*|qwe\w*|abc|foo|bar|hello|none|n\/?a|x+|a+|\d+)$/i;

const text = (v: unknown) => (v == null ? '' : String(v));
const median = (xs: (number | null | undefined)[]) => {
  const s = xs.filter((v): v is number => v != null && Number.isFinite(v)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const f = (v: number | null, digits = 0) => (v == null ? '—' : v.toLocaleString('en-US', { maximumFractionDigits: digits }));
const k = (ctx: number) => `${Math.round(ctx / 1024)}k`;
const groupBy = <T>(xs: T[], key: (x: T) => string) => {
  const g = new Map<string, T[]>();
  for (const x of xs) g.set(key(x), [...(g.get(key(x)) ?? []), x]);
  return [...g.entries()].sort((a, b) => b[1].length - a[1].length);
};
const table = (head: string[], body: (string | number)[][]) =>
  body.length
    ? [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...body.map((r) => `| ${r.join(' | ')} |`)].join('\n')
    : '_None._';
const nameOf = (r: Row) => text(r.custom_name).toLowerCase().replace(/\s+/g, ' ').trim();

// 1. one person typing produces a row per pause; keep only the last entry of each burst
const bursts = new Map<string, Row>();
for (const r of rows) {
  const key = [r.country, text(r.created_at).slice(0, 13), r.hw, nameOf(r), r.model, r.kinds].map(text).join('|');
  bursts.set(key, r);
}
const unique = [...bursts.values()];

// 2. speeds, compared with ours where they were measured
const speeds = unique
  .filter((r) => text(r.kinds).includes('measured_speed') && r.model && data.models.some((m) => m.id === r.model))
  .map((r) => {
    const ctx: number = r.tps_ctx ?? ASSUMED_CTX;
    const state: State = {
      ...defaultState(data),
      hw: r.hw,
      model: r.model,
      customName: text(r.custom_name),
      customMem: r.custom_mem_gb,
      customWatts: r.custom_watts,
      customBw: r.custom_bw_gbs,
      price: r.price_usd,
      kv: r.kv ?? 'f16',
      ctx,
    };
    const view = computeView(state, data);
    const model = data.models.find((m) => m.id === r.model)!;
    const ours = view.rows.find((x) => x.model.id === r.model)?.throughput ?? null;
    const ceiling = bandwidthCeilingTps(model, view.hw, ctx, kvScaleFor(state.kv, data.defaults));
    return {
      r,
      machine: r.hw === CUSTOM_HW ? `custom: ${text(r.custom_name) || '(unnamed)'}` : r.hw,
      ctx,
      ctxKnown: r.tps_ctx != null,
      ours: ours?.tokensPerSec ?? null,
      oursKind: ours?.measurement ?? 'unknown',
      ceiling,
      impossible: ceiling != null && r.tps > ceiling * CEILING_SLACK,
    };
  });
const plausible = speeds.filter((s) => !s.impossible);
const setAside = speeds.filter((s) => s.impossible);

const custom = unique.filter((r) => text(r.kinds).includes('custom_machine'));
const placeholders = custom.filter((r) => nameOf(r) && (nameOf(r).length <= 2 || PLACEHOLDER.test(nameOf(r))));
const namedCustom = custom.filter((r) => !placeholders.includes(r));

console.log(`# Submissions in the last ${days} days\n`);
console.log(table(['', 'Count'], [
  ['Rows stored', rows.length],
  ['After collapsing bursts of edits', unique.length],
  ['Placeholder machine names left out', placeholders.length],
  ['Speeds set aside as above the bandwidth ceiling', setAside.length],
]));
console.log('\nUnverified reports: a lead to measure or source, not data.\n');

console.log(`## Custom machines (${namedCustom.length})\n`);
console.log(table(
  ['Name as typed', 'People', 'GB for models', 'Watts', 'GB/s', 'Price'],
  groupBy(namedCustom, (r) => nameOf(r) || '(unnamed)').slice(0, 30)
    .map(([name, rs]) => [name, rs.length, f(median(rs.map((r) => r.custom_mem_gb)), 1), f(median(rs.map((r) => r.custom_watts))), f(median(rs.map((r) => r.custom_bw_gbs))), `$${f(median(rs.map((r) => r.price_usd)))}`]),
));

console.log(`\n## Measured speeds (${plausible.length})\n`);
console.log(`Ours is our figure for the same machine and model at the context and cache type they measured at. Where no context was recorded, both are compared at ${k(ASSUMED_CTX)}. Three or more reports at under 0.67× or over 1.5× ours are flagged.\n`);
console.log(table(
  ['Machine', 'Model', 'People', 'Their tok/s', 'Ours', 'Ratio', 'Context', ''],
  groupBy(plausible, (s) => `${s.machine}|${s.r.model}`).slice(0, 40).map(([key, ss]) => {
    const [machine, model] = key.split('|');
    const ratio = median(ss.map((s) => (s.ours ? s.r.tps / s.ours : null)));
    const known = ss.filter((s) => s.ctxKnown);
    const context = !known.length ? `not recorded (${k(ASSUMED_CTX)})` : known.length === ss.length ? k(median(known.map((s) => s.ctx))!) : 'mixed';
    const flagged = ss.length >= 3 && ratio != null && (ratio > 1.5 || ratio < 0.67);
    return [machine, model, ss.length, f(median(ss.map((s) => s.r.tps)), 1), `${f(median(ss.map((s) => s.ours)), 1)} ${ss[0].oursKind}`, f(ratio, 2), context, flagged ? '**check**' : ''];
  }),
));

console.log(`\n## Set aside: faster than the memory bandwidth allows (${setAside.length})\n`);
console.log(`More than ${CEILING_SLACK}× the ceiling for that machine, model and context. Usually a prompt-processing figure; worth a look only if many agree.\n`);
console.log(table(
  ['Machine', 'Model', 'People', 'Their tok/s', 'Ceiling'],
  groupBy(setAside, (s) => `${s.machine}|${s.r.model}`).slice(0, 20).map(([key, ss]) => {
    const [machine, model] = key.split('|');
    return [machine, model, ss.length, f(median(ss.map((s) => s.r.tps)), 1), f(median(ss.map((s) => s.ceiling)), 1)];
  }),
));

const subs = unique.filter((r) => text(r.kinds).includes('subscription'));
console.log(`\n## Monthly bills (${subs.length})\n`);
console.log(table(
  ['Bill', 'People', 'Median pay-back'],
  groupBy(subs, (r) => String(Math.round(r.sub_usd))).sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([bill, rs]) => {
      const d = median(rs.map((r) => r.breakeven_days));
      return [`$${bill}`, rs.length, d == null ? 'never' : `${f(d / 365.25, 1)} years`];
    }),
));
