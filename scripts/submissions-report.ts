/**
 * What people have entered, turned into things to act on: custom machines worth adding to the
 * list, speeds that disagree with ours, and the bills people weigh a machine against.
 *
 * Reads the sunkcost-submissions D1 database through wrangler, so it needs CLOUDFLARE_API_TOKEN
 * (with D1 read) and CLOUDFLARE_ACCOUNT_ID in the environment.
 *   npm run submissions
 *   npm run submissions -- --days 30
 *
 * These are unverified reports. Use them to decide what to measure or find a source for, never
 * as data on their own.
 */
import { execFileSync } from 'node:child_process';

const flag = process.argv.indexOf('--days');
const days = flag > 0 ? Math.max(1, Math.round(Number(process.argv[flag + 1]) || 30)) : 3650;
const sql = `SELECT * FROM submissions WHERE created_at >= strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '-${days} days')`;
const out = execFileSync('npx', ['wrangler', 'd1', 'execute', 'sunkcost-submissions', '--remote', '--json', '--command', sql], {
  encoding: 'utf8',
  maxBuffer: 1 << 28,
  stdio: ['ignore', 'pipe', 'inherit'],
});
type Row = Record<string, any>;
const rows: Row[] = JSON.parse(out)[0]?.results ?? [];

const median = (xs: (number | null)[]) => {
  const s = xs.filter((v): v is number => v != null && Number.isFinite(v)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const f = (v: number | null, digits = 0) => (v == null ? '—' : v.toLocaleString('en-US', { maximumFractionDigits: digits }));
const groupBy = <T>(xs: T[], key: (x: T) => string) => {
  const g = new Map<string, T[]>();
  for (const x of xs) g.set(key(x), [...(g.get(key(x)) ?? []), x]);
  return [...g.entries()].sort((a, b) => b[1].length - a[1].length);
};
const table = (head: string[], body: (string | number)[][]) =>
  [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...body.map((r) => `| ${r.join(' | ')} |`)].join('\n');

console.log(`# Submissions: ${rows.length} in the last ${days} days\n`);
console.log('Unverified reports: a lead to measure or source, not data.\n');

const custom = rows.filter((r) => String(r.kinds).includes('custom_machine'));
console.log(`## Custom machines (${custom.length})\n`);
console.log(table(
  ['Name as typed', 'Reports', 'GB for models', 'Watts', 'GB/s', 'Price'],
  groupBy(custom, (r) => String(r.custom_name ?? '(unnamed)').toLowerCase().replace(/\s+/g, ' ').trim()).slice(0, 30)
    .map(([name, rs]) => [name, rs.length, f(median(rs.map((r) => r.custom_mem_gb)), 1), f(median(rs.map((r) => r.custom_watts))), f(median(rs.map((r) => r.custom_bw_gbs))), `$${f(median(rs.map((r) => r.price_usd)))}`]),
));

const speeds = rows.filter((r) => String(r.kinds).includes('measured_speed'));
console.log(`\n## Measured speeds (${speeds.length})\n`);
console.log('Ratio is their speed over ours for the same machine, model and context. Three or more reports at under 0.67 or over 1.5 are flagged.\n');
console.log(table(
  ['Machine', 'Model', 'Reports', 'Their tok/s', 'Ours', 'Ratio', ''],
  groupBy(speeds, (r) => `${r.hw === 'custom' ? `custom: ${r.custom_name ?? '?'}` : r.hw}|${r.model}`).slice(0, 40).map(([key, rs]) => {
    const [hw, model] = key.split('|');
    const ratio = median(rs.map((r) => (r.our_tps ? r.tps / r.our_tps : null)));
    const flagged = rs.length >= 3 && ratio != null && (ratio > 1.5 || ratio < 0.67);
    return [hw, model, rs.length, f(median(rs.map((r) => r.tps)), 1), `${f(median(rs.map((r) => r.our_tps)), 1)} ${rs[0].our_measurement ?? ''}`, f(ratio, 2), flagged ? '**check**' : ''];
  }),
));

const subs = rows.filter((r) => String(r.kinds).includes('subscription'));
console.log(`\n## Monthly bills (${subs.length})\n`);
console.log(table(
  ['Bill', 'Reports', 'Median pay-back'],
  groupBy(subs, (r) => String(Math.round(r.sub_usd))).sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([bill, rs]) => [`$${bill}`, rs.length, (() => { const d = median(rs.map((r) => r.breakeven_days)); return d == null ? 'never' : `${f(d / 365.25, 1)} years`; })()]),
));
