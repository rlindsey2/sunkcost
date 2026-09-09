/**
 * Generates the static pages: the leaderboard, one page per model, one per
 * machine, and head-to-head comparisons — plus sitemap.xml and robots.txt.
 *
 * These are the pages someone lands on from a search. Everything they need is
 * in the HTML; the calculator is a link away with the configuration pre-filled.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import {
  calcLink, cheapestPerFamily, computeView, dotRow, esc, fmtDuration, fmtGb, fmtNum, fmtTokens, fmtUsd,
  hardwareLabel, modelLabel, pageShell, runnersFor, slug, tierName, tierScale, verdictLine, CAP_SHORT,
} from '../src/pagekit';
import { defaultState } from '../src/state';
import { kvCacheGb } from '../src/fit';
import { CAPABILITY_KEYS, type Dataset, type Hardware, type Model } from '../src/types';

const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const data: Dataset = {
  hardware: read('hardware.json'), models: read('models.json'), throughput: read('throughput.json'), defaults: read('defaults.json'),
};
const outRoot = new URL('../public/', import.meta.url);
const site = data.defaults.site_url.replace(/\/$/, '');
const paths: string[] = [];

function write(path: string, html: string) {
  const dir = new URL(`.${path}`, outRoot);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('index.html', dir), html);
  paths.push(path);
}

const ratingWord: Record<string, string> = { green: 'good', amber: 'usable', red: 'don’t', unknown: 'not rated' };

/* ------------------------------ leaderboard ------------------------------ */

function leaderboard(): string {
  const refs = [...(data.defaults.frontier_reference ?? [])].sort((a, b) => b.score - a.score);
  const scored = data.models
    .filter((m) => m.frontier_equivalent?.score != null)
    .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!);
  const max = data.defaults.frontier_scale_max ?? 70;
  const seen = new Set<string>();
  const unique = scored.filter((m) => {
    const key = m.display_name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const rows = unique
    .map((m, idx) => {
      const next = unique[idx + 1];
      const score = m.frontier_equivalent!.score!;
      const runners = cheapestPerFamily(runnersFor(m, data));
      const cheapest = runners.slice().sort((a, b) => a.hw.price_usd! - b.hw.price_usd!)[0];
      return `<tr>
  <td class="c-model"><a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a><span class="c-quant">${esc(m.quantisation)}</span></td>
  <td class="c-score"><span class="bar"><span style="width:${((score / max) * 100).toFixed(1)}%"></span></span><b>${score}</b></td>
  <td class="c-tier">${tierScale(m, data)} ${esc(tierName(m, data))}</td>
  <td class="c-caps">${dotRow(m)}</td>
  <td class="c-gb">${fmtGb(m.weights_gb)}</td>
  <td class="c-hw">${cheapest ? `<a href="/hardware/${esc(cheapest.hw.id)}/">${esc(hardwareLabel(cheapest.hw))}</a> <span class="dim">${fmtUsd(cheapest.hw.price_usd)}</span>` : '<span class="dim">nothing on the list</span>'}</td>
  <td class="c-vs">${next ? `<a href="/compare/${slug(m.id)}-vs-${slug(next.id)}/">vs ${esc(next.display_name)}</a>` : ''}</td>
</tr>`;
    })
    .join('');

  const frontierRows = refs
    .map(
      (r) => `<tr class="is-frontier">
  <td class="c-model">${esc(r.name)}<span class="c-quant">hosted</span></td>
  <td class="c-score"><span class="bar"><span style="width:${((r.score / max) * 100).toFixed(1)}%"></span></span><b>${r.score}</b></td>
  <td class="c-tier" colspan="3"><span class="dim">Runs in someone else’s data centre. You cannot download it.</span></td>
  <td class="c-hw"><span class="dim">—</span></td>
  <td class="c-vs"></td>
</tr>`,
    )
    .join('');

  const best = unique[0];
  const gap = best && refs[0] ? refs[0].score - best.frontier_equivalent!.score! : null;
  const body = `<article class="prose">
<h1>Every open model, measured against the frontier</h1>
<p class="lede">${unique.length} open-weight models you can download and run at home, ranked on the ${esc(data.defaults.frontier_basis?.name ?? 'intelligence index')}, with the hosted models from Anthropic and OpenAI dropped into the same table for scale. Each row links to what it takes to run it.</p>
${gap != null ? `<p>The short version: the best open model here scores <b>${best.frontier_equivalent!.score}</b>. The best hosted model scores <b>${refs[0].score}</b>. That gap of ${gap} points is the thing no amount of hardware closes.</p>` : ''}
<table class="board">
<thead><tr><th>Model</th><th>Score</th><th>Class</th><th>Good at</th><th>Weights</th><th>Cheapest machine that runs it</th><th>Next down</th></tr></thead>
<tbody>${frontierRows}${rows}</tbody>
</table>
<p class="note">Scores are the ${esc(data.defaults.frontier_basis?.name ?? '')}${data.defaults.frontier_basis?.url ? ` (<a href="${esc(data.defaults.frontier_basis.url)}" rel="noopener">source</a>)` : ''}, read on ${esc(data.defaults.frontier_basis?.checked ?? '')}. Hybrid models are shown at their reasoning score. Older models were scored under an earlier cohort of the index, so cross-era comparisons are approximate. The dots are, in order: ${CAPABILITY_KEYS.map((k) => CAP_SHORT[k].toLowerCase()).join(', ')}.</p>
</article>`;

  return pageShell(
    {
      title: 'Every open model against the frontier — Sunk Cost',
      description: `${unique.length} open models you can run at home, ranked against Claude and GPT on one intelligence index, each with the cheapest machine that runs it.`,
      canonical: '/leaderboard/',
      ogImage: '/og/default.png',
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/leaderboard/', label: 'Leaderboard' }],
    },
    body,
    data,
  );
}

/* ------------------------------ model pages ------------------------------ */

function modelPage(m: Model): string {
  const runners = runnersFor(m, data);
  const perFamily = cheapestPerFamily(runners);
  const cheapest = runners[0];
  // best value: the shortest pay-back among machines that run it
  const withPayback = runners.filter((r) => r.view.calc?.breakevenDays != null);
  const bestValue = withPayback.sort((a, b) => a.view.calc!.breakevenDays! - b.view.calc!.breakevenDays!)[0];
  const fastest = runners
    .filter((r) => r.view.throughput?.tokensPerSec != null)
    .sort((a, b) => b.view.throughput!.tokensPerSec! - a.view.throughput!.tokensPerSec!)[0];

  const caps = CAPABILITY_KEYS.map(
    (k) => `<li><span class="dot dot-${m.capabilities[k]}"></span><b>${esc(CAP_SHORT[k])}</b> — ${esc(ratingWord[m.capabilities[k]])}</li>`,
  ).join('');

  const hwRows = perFamily
    .map((r) => {
      const t = r.view.throughput;
      return `<tr>
  <td><a href="/hardware/${esc(r.hw.id)}/">${esc(hardwareLabel(r.hw))}</a></td>
  <td>${fmtUsd(r.hw.price_usd)}</td>
  <td>${t?.tokensPerSec == null ? '<span class="dim">unknown</span>' : `${fmtNum(t.tokensPerSec, t.tokensPerSec < 10 ? 1 : 0)} tok/s <span class="dim">${esc(t.measurement)}</span>`}</td>
  <td>${esc(verdictLine(r.view))}</td>
  <td><a href="${esc(calcLink({ hw: r.hw.id, model: m.id }, data))}">Run the numbers</a></td>
</tr>`;
    })
    .join('');

  const fe = m.frontier_equivalent;
  const ce = m.cloud_equivalent;
  const ctx = data.defaults.context.default_tokens;
  const body = `<article class="prose">
<h1>What hardware do you need to run ${esc(m.display_name)}?</h1>
<p class="lede">${esc(m.display_name)} at ${esc(m.quantisation)} is ${fmtGb(m.weights_gb)} of weights${m.max_context_tokens ? `, with a context ceiling of ${Math.round(m.max_context_tokens / 1024)}k tokens` : ''}. ${esc(m.capability_note)}</p>

${cheapest
      ? `<div class="answer">
  <div class="answer-row"><span class="answer-k">Cheapest machine that runs it</span><span class="answer-v"><a href="/hardware/${esc(cheapest.hw.id)}/">${esc(hardwareLabel(cheapest.hw))}</a> at ${fmtUsd(cheapest.hw.price_usd)}</span></div>
  ${bestValue && bestValue.hw.id !== cheapest.hw.id ? `<div class="answer-row"><span class="answer-k">Shortest pay-back</span><span class="answer-v"><a href="/hardware/${esc(bestValue.hw.id)}/">${esc(hardwareLabel(bestValue.hw))}</a> — ${esc(verdictLine(bestValue.view))}</span></div>` : ''}
  ${fastest ? `<div class="answer-row"><span class="answer-k">Fastest of the ones listed</span><span class="answer-v"><a href="/hardware/${esc(fastest.hw.id)}/">${esc(hardwareLabel(fastest.hw))}</a> — ${fmtNum(fastest.view.throughput!.tokensPerSec, 0)} tok/s at ${Math.round(ctx / 1024)}k context</span></div>` : ''}
  <div class="answer-row"><span class="answer-k">Honest answer on cost</span><span class="answer-v">${cheapest.view.calc?.breakevenDays == null ? 'Against the API, buying hardware for this model never pays for itself at ordinary usage.' : `${esc(verdictLine(cheapest.view))} at ${fmtTokens(defaultState(data).usage)} tokens a day.`}</span></div>
</div>`
      : `<div class="answer"><div class="answer-row"><span class="answer-k">Nothing on the list runs it</span><span class="answer-v">At ${Math.round(ctx / 1024)}k context it needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, ctx) ?? 0))}, more than any machine here offers.</span></div></div>`}

<h2>How good is it, really?</h2>
<p>${fe?.score != null
      ? `On the ${esc(data.defaults.frontier_basis?.name ?? 'intelligence index')} it scores <b>${fe.score}</b>${fe.score_note ? ` (${esc(fe.score_note)})` : ''}, which puts it in the <b>${esc(tierName(m, data))}</b> band. ${esc(data.defaults.frontier_tiers[fe.tier ?? 0].plain)}`
      : 'It has not been placed on the intelligence index yet.'}
${fe?.url ? ` <a href="${esc(fe.url)}" rel="noopener">Score source</a>.` : ''} <a href="/leaderboard/">See the whole table</a>.</p>
<ul class="caps">${caps}</ul>

<h2>What it costs either way</h2>
<p>Renting the same model${ce.is_exact_match ? '' : ' (or the nearest hosted equivalent, ' + esc(ce.name) + ')'} costs <b>$${ce.input_price_per_mtok}</b> per million input tokens and <b>$${ce.output_price_per_mtok}</b> per million output${ce.source_url ? ` (<a href="${esc(ce.source_url)}" rel="noopener">${esc(ce.source)}</a>, checked ${esc(ce.checked ?? '')})` : ''}. Buying a machine only beats that if you use it hard enough, for long enough, that the hardware price divides down below the rental bill.</p>

${hwRows ? `<h2>Machines that run it</h2>
<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Speed at ${Math.round(ctx / 1024)}k</th><th>Pay-back</th><th></th></tr></thead>
<tbody>${hwRows}</tbody>
</table>
<p class="note">One machine per family, cheapest first. Speeds are measured where a public benchmark exists and estimated from memory bandwidth otherwise; the calculator says which for any configuration.</p>` : ''}

<h2>The specifics</h2>
<dl class="specs">
  <dt>Parameters</dt><dd>${fmtNum(m.params_b, 1)}B${m.active_params_b && m.active_params_b < m.params_b ? `, of which ${fmtNum(m.active_params_b, 1)}B are active per token` : ''}</dd>
  <dt>Quantisation</dt><dd>${esc(m.quantisation)}</dd>
  <dt>Weights on disk</dt><dd>${fmtGb(m.weights_gb)}</dd>
  <dt>KV cache</dt><dd>${fmtGb(kvCacheGb(m, ctx))} at ${Math.round(ctx / 1024)}k context${m.architecture?.note ? ` — ${esc(m.architecture.note)}` : ''}</dd>
  <dt>Maximum context</dt><dd>${m.max_context_tokens ? `${Math.round(m.max_context_tokens / 1024)}k tokens` : 'unknown'}${m.max_context_note ? ` (${esc(m.max_context_note)})` : ''}</dd>
  <dt>Licence</dt><dd>${esc(m.license)}</dd>
  ${m.sources?.length ? `<dt>Sources</dt><dd>${m.sources.map((u, i) => `<a href="${esc(u)}" rel="noopener">source ${i + 1}</a>`).join(', ')}</dd>` : ''}
</dl>
</article>`;

  const desc = cheapest
    ? `${m.display_name} needs ${fmtGb(m.weights_gb)} of weights. The cheapest machine that runs it is ${hardwareLabel(cheapest.hw)} at ${fmtUsd(cheapest.hw.price_usd)}. Here is how fast it goes and whether it ever pays for itself.`
    : `${m.display_name} does not fit any machine on this list at the default context length.`;
  return pageShell(
    {
      title: `What hardware do you need to run ${m.display_name} ${m.quantisation}? — Sunk Cost`,
      description: desc,
      canonical: `/models/${m.id}/`,
      ogImage: cheapest ? `/og/${cheapest.hw.id}--${m.id}.png` : '/og/default.png',
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/leaderboard/', label: 'Models' }, { href: `/models/${m.id}/`, label: m.display_name }],
    },
    body,
    data,
  );
}

/* ---------------------------- hardware pages ---------------------------- */

function hardwarePage(hw: Hardware): string {
  const state = { ...defaultState(data), hw: hw.id };
  const view = computeView(state, data);
  const fits = view.rows.filter((r) => r.fit.status === 'fits');
  const label = hardwareLabel(hw);

  const rows = fits
    .slice(0, 12)
    .map((r) => `<tr>
  <td><a href="/models/${esc(r.model.id)}/">${esc(r.model.display_name)}</a><span class="c-quant">${esc(r.model.quantisation)}</span></td>
  <td>${r.throughput.tokensPerSec == null ? '<span class="dim">unknown</span>' : `${fmtNum(r.throughput.tokensPerSec, r.throughput.tokensPerSec < 10 ? 1 : 0)} tok/s`}</td>
  <td>${tierScale(r.model, data)} ${esc(tierName(r.model, data))}</td>
  <td>${dotRow(r.model)}</td>
  <td>${fmtGb(r.fit.needGb)}</td>
</tr>`)
    .join('');

  const best = fits[0];
  const body = `<article class="prose">
<h1>Can a ${esc(label)} run local LLMs?</h1>
<p class="lede">Yes — ${fits.length} of the ${view.rows.length} open models on this site fit in its ${hw.usable_memory_gb ?? '?'} GB of usable memory${best ? `, the strongest being ${esc(best.model.display_name)}` : ''}. Whether that saves you money is a different question, and the answer is usually no.</p>

<div class="answer">
  <div class="answer-row"><span class="answer-k">Price</span><span class="answer-v">${hw.price_usd == null ? 'not published yet' : fmtUsd(hw.price_usd)}${hw.generation === 'previous' ? ' at launch — discontinued' : ''}</span></div>
  <div class="answer-row"><span class="answer-k">Memory</span><span class="answer-v">${hw.unified_memory_gb} GB${hw.usable_memory_gb != null ? `, about ${hw.usable_memory_gb} GB of it addressable by the GPU` : ''}${hw.memory_bandwidth_gbs ? ` at ${hw.memory_bandwidth_gbs} GB/s` : ''}</span></div>
  ${best ? `<div class="answer-row"><span class="answer-k">Best model it runs</span><span class="answer-v"><a href="/models/${esc(best.model.id)}/">${esc(best.model.display_name)}</a> — ${esc(tierName(best.model, data))}${best.throughput.tokensPerSec ? `, ${fmtNum(best.throughput.tokensPerSec, 0)} tok/s` : ''}</span></div>` : ''}
  <div class="answer-row"><span class="answer-k">Pay-back against the API</span><span class="answer-v">${view.calc ? esc(verdictLine(view)) : 'cannot be computed yet'}${view.calc?.breakevenDays != null ? ` at ${fmtTokens(state.usage)} tokens a day` : ''}</span></div>
</div>

<p><a class="cta" href="${esc(calcLink({ hw: hw.id }, data))}">Run the numbers on this machine</a></p>

${rows ? `<h2>What it runs</h2>
<table class="board">
<thead><tr><th>Model</th><th>Speed</th><th>Class</th><th>Good at</th><th>Memory</th></tr></thead>
<tbody>${rows}</tbody>
</table>
${fits.length > 12 ? `<p class="note">${fits.length - 12} more fit; the calculator lists them all.</p>` : ''}` : ''}

<h2>The specifics</h2>
<dl class="specs">
  <dt>Chip</dt><dd>${esc(hw.chip)}${hw.chip_variant ? ` — ${esc(hw.chip_variant)}` : ''}</dd>
  <dt>Memory bandwidth</dt><dd>${hw.memory_bandwidth_gbs ? `${hw.memory_bandwidth_gbs} GB/s` : 'unknown'}</dd>
  <dt>Usable by the GPU</dt><dd>${hw.usable_memory_gb ?? 'unknown'} GB${hw.notes ? ` — ${esc(hw.notes)}` : ''}</dd>
  <dt>Power under load</dt><dd>${hw.load_watts ?? 'unknown'} W${hw.load_watts_status ? ` (${esc(hw.load_watts_status.replace(/_/g, ' '))})` : ''}${hw.load_watts_note ? ` — ${esc(hw.load_watts_note)}` : ''}</dd>
  ${hw.status ? `<dt>Availability</dt><dd>${esc(hw.status)}</dd>` : ''}
  ${hw.sources?.length ? `<dt>Sources</dt><dd>${hw.sources.map((u, i) => `<a href="${esc(u)}" rel="noopener">source ${i + 1}</a>`).join(', ')}</dd>` : ''}
</dl>
</article>`;

  return pageShell(
    {
      title: `${label} — how long until local AI pays for itself? — Sunk Cost`,
      description: `${fits.length} open models fit a ${label}. ${view.calc ? verdictLine(view) : ''} — the speeds, the models and the arithmetic.`,
      canonical: `/hardware/${hw.id}/`,
      ogImage: view.model ? `/og/${hw.id}--${view.model.id}.png` : '/og/default.png',
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: `/hardware/${hw.id}/`, label: label }],
    },
    body,
    data,
  );
}

/* ---------------------------- comparison pages ---------------------------- */

function comparePage(a: Hardware, b: Hardware): string {
  const va = computeView({ ...defaultState(data), hw: a.id }, data);
  const vb = computeView({ ...defaultState(data), hw: b.id }, data);
  const fa = va.rows.filter((r) => r.fit.status === 'fits');
  const fb = vb.rows.filter((r) => r.fit.status === 'fits');
  const row = (k: string, x: string, y: string) => `<tr><th>${esc(k)}</th><td>${x}</td><td>${y}</td></tr>`;
  const body = `<article class="prose">
<h1>${esc(hardwareLabel(a))} vs ${esc(hardwareLabel(b))} for local AI</h1>
<p class="lede">Two machines people weigh against each other for running models at home. Same models, same prices, same arithmetic on both sides.</p>
<table class="board compare">
<thead><tr><th></th><th><a href="/hardware/${esc(a.id)}/">${esc(hardwareLabel(a))}</a></th><th><a href="/hardware/${esc(b.id)}/">${esc(hardwareLabel(b))}</a></th></tr></thead>
<tbody>
${row('Price', fmtUsd(a.price_usd), fmtUsd(b.price_usd))}
${row('Memory', `${a.unified_memory_gb} GB`, `${b.unified_memory_gb} GB`)}
${row('Usable by the GPU', `${a.usable_memory_gb ?? '?'} GB`, `${b.usable_memory_gb ?? '?'} GB`)}
${row('Memory bandwidth', a.memory_bandwidth_gbs ? `${a.memory_bandwidth_gbs} GB/s` : 'unknown', b.memory_bandwidth_gbs ? `${b.memory_bandwidth_gbs} GB/s` : 'unknown')}
${row('Power under load', `${a.load_watts ?? '?'} W`, `${b.load_watts ?? '?'} W`)}
${row('Models that fit', String(fa.length), String(fb.length))}
${row('Best model it runs', fa[0] ? `<a href="/models/${esc(fa[0].model.id)}/">${esc(fa[0].model.display_name)}</a>` : '—', fb[0] ? `<a href="/models/${esc(fb[0].model.id)}/">${esc(fb[0].model.display_name)}</a>` : '—')}
${row('Speed on that model', fa[0]?.throughput.tokensPerSec ? `${fmtNum(fa[0].throughput.tokensPerSec, 0)} tok/s` : '—', fb[0]?.throughput.tokensPerSec ? `${fmtNum(fb[0].throughput.tokensPerSec, 0)} tok/s` : '—')}
${row('Pay-back', esc(verdictLine(va)), esc(verdictLine(vb)))}
</tbody>
</table>
<p><a class="cta" href="${esc(calcLink({ hw: a.id }, data))}">Run the numbers on the ${esc(hardwareLabel(a))}</a> · <a href="${esc(calcLink({ hw: b.id }, data))}">or the ${esc(hardwareLabel(b))}</a></p>
<p class="note">Both columns use the same default usage: ${fmtTokens(defaultState(data).usage)} tokens a day at ${defaultState(data).ratio}:1 input to output, ${Math.round(defaultState(data).ctx / 1024)}k context, and each machine's strongest model that fits.</p>
</article>`;
  return pageShell(
    {
      title: `${hardwareLabel(a)} vs ${hardwareLabel(b)} for local AI — Sunk Cost`,
      description: `Side by side: what each runs, how fast, and which pays back sooner against the API.`,
      canonical: `/compare/${slug(hardwareLabel(a))}-vs-${slug(hardwareLabel(b))}/`,
      ogImage: '/og/default.png',
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '#', label: 'Comparison' }],
    },
    body,
    data,
  );
}

/* ------------------------- model head-to-heads ------------------------- */

function modelComparePage(a: Model, b: Model): string {
  const ra = runnersFor(a, data);
  const rb = runnersFor(b, data);
  const ctx = data.defaults.context.default_tokens;
  const sa = a.frontier_equivalent?.score ?? null;
  const sb = b.frontier_equivalent?.score ?? null;
  const row = (k: string, x: string, y: string) => `<tr><th>${esc(k)}</th><td>${x}</td><td>${y}</td></tr>`;
  const capRows = CAPABILITY_KEYS.map(
    (k) => `<tr><th>${esc(CAP_SHORT[k])}</th><td><span class="dot dot-${a.capabilities[k]}"></span> ${esc(ratingWord[a.capabilities[k]])}</td><td><span class="dot dot-${b.capabilities[k]}"></span> ${esc(ratingWord[b.capabilities[k]])}</td></tr>`,
  ).join('');

  const verdict =
    sa != null && sb != null && sa !== sb
      ? `${esc(sa > sb ? a.display_name : b.display_name)} scores higher on the intelligence index — ${Math.max(sa, sb)} against ${Math.min(sa, sb)}.`
      : 'Neither has a clear lead on the index.';
  const sizeNote =
    a.weights_gb != null && b.weights_gb != null && Math.abs(a.weights_gb - b.weights_gb) > 1
      ? ` ${esc(a.weights_gb < b.weights_gb ? a.display_name : b.display_name)} is the smaller download at ${fmtGb(Math.min(a.weights_gb, b.weights_gb))}, so it runs on cheaper hardware.`
      : '';

  const body = `<article class="prose">
<h1>${esc(a.display_name)} vs ${esc(b.display_name)}</h1>
<p class="lede">${verdict}${sizeNote}</p>
<table class="board compare">
<thead><tr><th></th><th><a href="/models/${esc(a.id)}/">${esc(a.display_name)}</a></th><th><a href="/models/${esc(b.id)}/">${esc(b.display_name)}</a></th></tr></thead>
<tbody>
${row('Intelligence index', sa != null ? `<b>${sa}</b>` : 'not placed', sb != null ? `<b>${sb}</b>` : 'not placed')}
${row('Class', esc(tierName(a, data)), esc(tierName(b, data)))}
${row('Weights', fmtGb(a.weights_gb), fmtGb(b.weights_gb))}
${row('Quantisation', esc(a.quantisation), esc(b.quantisation))}
${row('Parameters', `${fmtNum(a.params_b, 1)}B${a.active_params_b && a.active_params_b < a.params_b ? ` (${fmtNum(a.active_params_b, 1)}B active)` : ''}`, `${fmtNum(b.params_b, 1)}B${b.active_params_b && b.active_params_b < b.params_b ? ` (${fmtNum(b.active_params_b, 1)}B active)` : ''}`)}
${row('Max context', a.max_context_tokens ? `${Math.round(a.max_context_tokens / 1024)}k` : 'unknown', b.max_context_tokens ? `${Math.round(b.max_context_tokens / 1024)}k` : 'unknown')}
${row('API price per 1M', `$${a.cloud_equivalent.input_price_per_mtok} in / $${a.cloud_equivalent.output_price_per_mtok} out`, `$${b.cloud_equivalent.input_price_per_mtok} in / $${b.cloud_equivalent.output_price_per_mtok} out`)}
${row('Licence', esc(a.license), esc(b.license))}
${row('Cheapest machine that runs it', ra[0] ? `<a href="/hardware/${esc(ra[0].hw.id)}/">${esc(hardwareLabel(ra[0].hw))}</a> ${fmtUsd(ra[0].hw.price_usd)}` : 'none listed', rb[0] ? `<a href="/hardware/${esc(rb[0].hw.id)}/">${esc(hardwareLabel(rb[0].hw))}</a> ${fmtUsd(rb[0].hw.price_usd)}` : 'none listed')}
${capRows}
</tbody>
</table>
<p class="note">Ratings are coarse on purpose. Speeds and pay-back depend on the machine — open either model's page for the full list, or <a href="/leaderboard/">see both against the frontier</a>. Context is ${Math.round(ctx / 1024)}k throughout.</p>
</article>`;
  return pageShell(
    {
      title: `${a.display_name} vs ${b.display_name} — which should you run? — Sunk Cost`,
      description: `Side by side: intelligence score, size, context, licence, API price and the cheapest machine that runs each.`,
      canonical: `/compare/${slug(a.id)}-vs-${slug(b.id)}/`,
      ogImage: '/og/default.png',
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/leaderboard/', label: 'Models' }, { href: '#', label: `${a.display_name} vs ${b.display_name}` }],
    },
    body,
    data,
  );
}

/* --------------------------------- build --------------------------------- */

write('/leaderboard/', leaderboard());
for (const m of data.models) write(`/models/${m.id}/`, modelPage(m));
for (const hw of data.hardware) write(`/hardware/${hw.id}/`, hardwarePage(hw));

// comparisons: the flagship current config of each family against every other
const flagships = [...new Set(data.hardware.map((h) => h.family))]
  .map((fam) => {
    const inFam = data.hardware.filter((h) => h.family === fam && h.price_usd != null && (h.generation ?? 'current') === 'current');
    // the one most people cross-shop: the middle of the range by price
    return inFam.sort((a, b) => a.price_usd! - b.price_usd!)[Math.floor(inFam.length / 2)];
  })
  .filter(Boolean) as Hardware[];
for (let i = 0; i < flagships.length; i++) {
  for (let j = i + 1; j < flagships.length; j++) {
    write(`/compare/${slug(hardwareLabel(flagships[i]))}-vs-${slug(hardwareLabel(flagships[j]))}/`, comparePage(flagships[i], flagships[j]));
  }
}

// model head-to-heads: each model against the next one down the leaderboard,
// which is the comparison someone actually has to make
const ranked = data.models
  .filter((m) => m.frontier_equivalent?.score != null)
  .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!)
  .filter((m, i, xs) => xs.findIndex((x) => x.display_name === m.display_name) === i);
for (let i = 0; i + 1 < ranked.length; i++) {
  write(`/compare/${slug(ranked[i].id)}-vs-${slug(ranked[i + 1].id)}/`, modelComparePage(ranked[i], ranked[i + 1]));
}

const urls = ['/', ...paths]
  .map((p) => `  <url><loc>${site}${p}</loc><lastmod>${data.defaults.data_last_checked}</lastmod></url>`)
  .join('\n');
writeFileSync(new URL('sitemap.xml', outRoot), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(new URL('robots.txt', outRoot), `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
console.log(`wrote ${paths.length} static pages + sitemap.xml (${paths.filter((p) => p.startsWith('/models')).length} models, ${paths.filter((p) => p.startsWith('/hardware')).length} machines, ${paths.filter((p) => p.startsWith('/compare')).length} comparisons)`);
