/**
 * The daily model watch: what the site already prices, and what a new entry needs.
 *
 * This prints; it never writes. Finding a new model is a search job and the searching
 * is done by whoever runs this — the point of the script is that the comparison against
 * the data is mechanical rather than remembered, and that the list of fields a new
 * model needs comes from the data rather than from someone's memory of it.
 *
 * Run it as `npm run model-watch`. The ledger it reports against is seo/MODEL-WATCH.md.
 */
import { readFileSync } from 'node:fs';
import type { Model, Throughput } from '../src/types';

const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const models = read('models.json') as Model[];
const throughput = read('throughput.json') as Throughput[];

const ledger = readFileSync(new URL('../seo/MODEL-WATCH.md', import.meta.url), 'utf8');
const lastChecked = ledger.match(/^Last checked:\s*(\d{4}-\d{2}-\d{2})/m)?.[1] ?? null;
const today = new Date().toISOString().slice(0, 10);

console.log(`today ${today} · last checked ${lastChecked ?? 'never'}${lastChecked === today ? ' · done for today' : ' · due'}`);
console.log('');

// family is optional in the type, though every model carries one today
const families = new Map<string, Model[]>();
for (const m of models) {
  const family = m.family ?? 'no family';
  families.set(family, [...(families.get(family) ?? []), m]);
}
const measured = new Set(throughput.map((t) => t.model_id));

console.log(`${models.length} models, ${families.size} families, ${models.filter((m) => m.generation !== 'legacy').length} current`);
for (const [family, kit] of [...families].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`\n${family}`);
  for (const m of kit.sort((a, b) => a.params_b - b.params_b)) {
    const size = m.weights_gb == null ? 'no weights figure' : `${m.weights_gb.toFixed(2)} GB`;
    const speed = measured.has(m.id) ? 'measured speed' : 'speed estimated from bandwidth';
    console.log(`  ${m.display_name} · ${m.params_b}B ${m.quantisation} · ${size} · ${m.generation} · ${speed}`);
  }
}

// Every quantisation already entered, because a new release is often a familiar model
// at a new precision rather than a new model, and that is still a row worth having.
console.log(`\nquantisations already entered: ${[...new Set(models.map((m) => m.quantisation))].sort().join(', ')}`);
console.log(`weights range: ${Math.min(...models.map((m) => m.weights_gb ?? Infinity)).toFixed(2)} GB to ${Math.max(...models.map((m) => m.weights_gb ?? 0)).toFixed(2)} GB`);
console.log(`${models.length - measured.size} of ${models.length} models have no measured speed on any machine, so a new model does not need one to be added`);

// Read off one entry rather than hard-coded, so this cannot drift from the schema.
const sample = models[0] as unknown as Record<string, unknown>;
console.log(`\nfields a models.json entry carries: ${Object.keys(sample).join(', ')}`);
console.log('of those, the ones that need a source and cannot be guessed:');
console.log('  weights_gb, kv_cache_gb_per_8k, architecture, max_context_tokens, license');
console.log('  cloud_equivalent (name, both prices, source_url, checked)');
console.log('  frontier_equivalent (score, basis, url, checked, index_version)');
console.log('\nNothing here writes to data/*.json. A candidate goes in seo/MODEL-WATCH.md with its');
console.log('sources, and the data edit is the site owner’s.');
