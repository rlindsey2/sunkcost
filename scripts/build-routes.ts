/**
 * Phase 2 scaffolding: emits public/routes.json describing the programmatic
 * landing pages (one per hardware config, one per model, comparisons), each with
 * its title, description, pre-filled query string, OG image and a short verdict.
 * No pages are generated yet; a static-site step can consume this file later.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { computeView, hardwareLabel } from '../src/compute';
import { defaultState, serializeState } from '../src/state';
import type { Dataset } from '../src/types';

const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const data: Dataset = { hardware: read('hardware.json'), models: read('models.json'), throughput: read('throughput.json'), defaults: read('defaults.json') };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

interface Route {
  kind: 'hardware' | 'model' | 'comparison';
  path: string;
  title: string;
  description: string;
  query: string;
  og_image: string | null;
  verdict: string | null;
  ids: string[];
}

const routes: Route[] = [];

for (const hw of data.hardware) {
  const state = { ...defaultState(data), hw: hw.id };
  const v = computeView(state, data);
  const label = hardwareLabel(hw);
  routes.push({
    kind: 'hardware',
    path: `/hardware/${hw.id}/`,
    title: `${label} — how long until local AI pays for itself? — Sunk Cost`,
    description: `Can a ${label} run local LLMs? ${v.rows.filter((r) => r.fit.status === 'fits').length} open models fit. ${v.calc ? v.verdict.headline : 'Break-even cannot be computed yet.'}`,
    query: serializeState(state),
    og_image: v.model ? `/og/${hw.id}--${v.model.id}.png` : null,
    verdict: v.calc ? `${v.verdict.headline}${v.verdict.sub ? ` ${v.verdict.sub}` : ''}` : null,
    ids: [hw.id],
  });
}

for (const m of data.models) {
  // cheapest hardware that fits this model at default context
  const fits = data.hardware
    .filter((h) => h.price_usd != null)
    .map((h) => ({ h, v: computeView({ ...defaultState(data), hw: h.id, model: m.id }, data) }))
    .filter((x) => x.v.model?.id === m.id)
    .sort((a, b) => a.h.price_usd! - b.h.price_usd!);
  const best = fits[0];
  routes.push({
    kind: 'model',
    path: `/models/${m.id}/`,
    title: `What hardware do you need to run ${m.display_name} ${m.quantisation} locally? — Sunk Cost`,
    description: best
      ? `${m.display_name} fits on ${fits.length} of the machines listed; the cheapest is ${hardwareLabel(best.h)}. ${best.v.calc ? best.v.verdict.headline : ''}`
      : `${m.display_name} does not fit any machine on the list at the default context length.`,
    query: best ? serializeState({ ...defaultState(data), hw: best.h.id, model: m.id }) : '',
    og_image: best ? `/og/${best.h.id}--${m.id}.png` : null,
    verdict: best?.v.calc ? best.v.verdict.headline : null,
    ids: [m.id],
  });
}

// comparisons: one per pair of families at the closest memory tier
const families = [...new Set(data.hardware.map((h) => h.family))];
for (let i = 0; i < families.length; i++) {
  for (let j = i + 1; j < families.length; j++) {
    const a = data.hardware.filter((h) => h.family === families[i] && h.price_usd != null && (h.generation ?? 'current') === 'current');
    const b = data.hardware.filter((h) => h.family === families[j] && h.price_usd != null && (h.generation ?? 'current') === 'current');
    if (!a.length || !b.length) continue;
    let bestPair: [typeof a[0], typeof b[0]] | null = null;
    let bestDiff = Infinity;
    for (const x of a) for (const y of b) {
      const diff = Math.abs(x.unified_memory_gb - y.unified_memory_gb);
      if (diff < bestDiff) { bestDiff = diff; bestPair = [x, y]; }
    }
    if (!bestPair) continue;
    routes.push({
      kind: 'comparison',
      path: `/compare/${slug(families[i])}-vs-${slug(families[j])}/`,
      title: `${families[i]} vs ${families[j]} for local inference — Sunk Cost`,
      description: `${hardwareLabel(bestPair[0])} against ${hardwareLabel(bestPair[1])}: what fits, how fast, and how long until each pays for itself.`,
      query: serializeState({ ...defaultState(data), hw: bestPair[0].id }),
      og_image: null,
      verdict: null,
      ids: [bestPair[0].id, bestPair[1].id],
    });
  }
}

writeFileSync(new URL('../public/routes.json', import.meta.url), JSON.stringify({ generated: data.defaults.data_last_checked, routes }, null, 2));
console.log(`wrote ${routes.length} routes to public/routes.json`);
