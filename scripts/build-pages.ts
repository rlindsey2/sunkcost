/**
 * Generates the static pages: the leaderboard, one page per model, one per
 * machine, and head-to-head comparisons — plus sitemap.xml and robots.txt.
 *
 * These are the pages someone lands on from a search. Everything they need is
 * in the HTML; the calculator is a link away with the configuration pre-filled.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import {
  calcLink, cheapestPerFamily, cheapestThatHolds, computeView, descOf, dotRow, esc, familyHeading, familyRange,
  fmtDuration, fmtGb, fmtGb1, fmtNum, fmtTokens, fmtUsd, gbRange, hardwareLabel, hardwareProduct, kvWorking, lowerFirst,
  median, modelLabel, modelsInBand, otherQuantisations, pageShell, priceRivals, runnersFor, shortHardwareLabel, slug,
  tierName, tierScale, titleOf, verdictLine, CAP_SHORT, DESC_MAX, SIZE_BANDS, TITLE_MAX,
} from '../src/pagekit';
import { defaultState } from '../src/state';
import { bestByTier, bestUsageLevels } from '../src/best';
import { sharePath } from '../src/share';
import { fit, footprintGb, kvCacheGb } from '../src/fit';
import { CAPABILITY_KEYS, type Dataset, type Hardware, type Model } from '../src/types';

const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const data: Dataset = {
  hardware: read('hardware.json'), models: read('models.json'), throughput: read('throughput.json'), defaults: read('defaults.json'),
};
const outRoot = new URL('../public/', import.meta.url);
const site = data.defaults.site_url.replace(/\/$/, '');
const paths: string[] = [];

const meta: { path: string; title: string; description: string }[] = [];
/** which pages link to each page, so the build can refuse to ship one nothing links to */
const inbound = new Map<string, Set<string>>();
const unesc = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

function write(path: string, html: string) {
  const dir = new URL(`.${path}`, outRoot);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('index.html', dir), html);
  paths.push(path);
  // Structured data a search engine cannot parse is worse than none, and a
  // stray character in a machine name is all it takes.
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  if (!ld) throw new Error(`${path} has no JSON-LD`);
  try {
    JSON.parse(ld);
  } catch (e) {
    throw new Error(`${path} has JSON-LD that does not parse: ${(e as Error).message}`);
  }
  for (const m of (html.split('<body')[1] ?? '').matchAll(/href="(\/[^"#?]*\/)"/g))
    if (m[1] !== path) inbound.set(m[1], (inbound.get(m[1]) ?? new Set()).add(path));
  meta.push({
    path,
    title: unesc(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''),
    description: unesc(html.match(/<meta name="description" content="([\s\S]*?)" \/>/)?.[1] ?? ''),
  });
}

/**
 * Two pages sharing a title or a description is a real fault: it tells a search
 * engine they are the same page. Over-length is a softer one, so it is reported
 * rather than fatal, since a longer machine or model name can cause it.
 */
function checkMeta() {
  const dupes = (key: 'title' | 'description') =>
    [...meta.reduce((m, p) => m.set(p[key], [...(m.get(p[key]) ?? []), p.path]), new Map<string, string[]>())]
      .filter(([, ps]) => ps.length > 1);
  const problems: string[] = [];
  for (const key of ['title', 'description'] as const) {
    for (const [text, ps] of dupes(key))
      problems.push(`${ps.length} pages share a ${key}: "${text.slice(0, 60)}" (${ps.slice(0, 3).join(', ')}…)`);
    for (const p of meta.filter((p) => !p[key].trim())) problems.push(`${p.path} has no ${key}`);
  }
  if (problems.length) {
    console.error(problems.map((p) => `  ${p}`).join('\n'));
    throw new Error(`${problems.length} duplicate or missing page titles/descriptions`);
  }
  const longT = meta.filter((p) => p.title.length > TITLE_MAX);
  const longD = meta.filter((p) => p.description.length > DESC_MAX);
  for (const [what, list, max] of [['titles', longT, TITLE_MAX], ['descriptions', longD, DESC_MAX]] as const)
    if (list.length)
      console.warn(
        `  note: ${list.length} ${what} over ${max} characters and will be cut in search results, longest ${Math.max(...list.map((p) => p[what === 'titles' ? 'title' : 'description'].length))} (${list[0].path})`,
      );
}

/**
 * A page in the sitemap that no other page links to is one a crawler is told
 * about and given no reason to want. Adding a machine or a model should not be
 * able to quietly produce one, so this is fatal rather than a warning.
 */
function checkLinks() {
  const orphans = paths.filter((p) => !inbound.get(p)?.size);
  if (orphans.length) {
    console.error(orphans.map((p) => `  nothing links to ${p}`).join('\n'));
    throw new Error(`${orphans.length} generated pages have no inbound link`);
  }
  const counts = paths.map((p) => inbound.get(p)!.size);
  console.log(`  every page is linked from at least ${Math.min(...counts)} other page${Math.min(...counts) === 1 ? '' : 's'}`);
}

const ratingWord: Record<string, string> = { green: 'good', amber: 'usable', red: 'don’t', unknown: 'not rated' };

// Where the same model is listed at two quantisations, the quantisation is the
// thing that tells the two pages apart, so it goes in the title.
const sharedNames = new Set(
  data.models.map((m) => m.display_name).filter((n, i, xs) => xs.indexOf(n) !== i),
);

// One view per machine at the default settings, computed once: the machine pages
// and every table that names another machine all want the same two numbers out of
// it, how much fits and whether it pays back.
const hwViews = new Map(data.hardware.map((hw) => [hw.id, computeView({ ...defaultState(data), hw: hw.id }, data)]));
const fitsOn = (hw: Hardware) => hwViews.get(hw.id)!.rows.filter((r) => r.fit.status === 'fits');

// The machine most people cross-shop in each family: the middle of the range by
// price. These are the pairs that get a head-to-head page, and the machine pages
// link to the ones they appear in.
const flagships = [...new Set(data.hardware.map((h) => h.family))]
  .map((fam) => {
    const inFam = data.hardware.filter((h) => h.family === fam && h.price_usd != null && (h.generation ?? 'current') === 'current');
    return inFam.sort((a, b) => a.price_usd! - b.price_usd!)[Math.floor(inFam.length / 2)];
  })
  .filter(Boolean) as Hardware[];

const headToHeads = new Map<string, { href: string; other: Hardware }[]>();
for (let i = 0; i < flagships.length; i++) {
  for (let j = i + 1; j < flagships.length; j++) {
    const [a, b] = [flagships[i], flagships[j]];
    const href = `/compare/${slug(hardwareLabel(a))}-vs-${slug(hardwareLabel(b))}/`;
    for (const [self, other] of [[a, b], [b, a]] as const)
      headToHeads.set(self.id, [...(headToHeads.get(self.id) ?? []), { href, other }]);
  }
}

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
  <td class="c-score"><span class="bar"><span style="width:${((score / max) * 100).toFixed(1)}%"></span></span><b>${score}</b>${m.frontier_equivalent?.estimated ? '<abbr title="Artificial Analysis estimated this score rather than running the full suite">*</abbr>' : ''}</td>
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

  // models the index has not scored are not in the table; they still have pages,
  // and this is the only route to them
  const unplaced = data.models
    .filter((m) => m.frontier_equivalent?.score == null)
    .sort((a, b) => (a.weights_gb ?? 0) - (b.weights_gb ?? 0));

  const best = unique[0];
  const gap = best && refs[0] ? refs[0].score - best.frontier_equivalent!.score! : null;
  const body = `<article class="prose">
<h1>Every open model, measured against the frontier</h1>
<p class="lede">${unique.length} open-weight models you can download and run at home, ranked on the ${esc(data.defaults.frontier_basis?.name ?? 'intelligence index')}, with the hosted models from Anthropic and OpenAI dropped into the same table for scale. Each row links to what it takes to run it. For which machine pays back soonest at each level, see <a href="/best/">best buys by usage</a>.</p>
${gap != null ? `<p>The short version: the best open model here scores <b>${best.frontier_equivalent!.score}</b> — that is ${esc(best.display_name)}, and it wants ${fmtGb(best.weights_gb)} of memory. The best hosted model scores <b>${refs[0].score}</b>. That gap of ${gap} points is the thing no amount of hardware closes.</p>` : ''}
<table class="board">
<thead><tr><th>Model</th><th>Score</th><th>Class</th><th>Good at</th><th>Weights</th><th>Cheapest machine that runs it</th><th>Next down</th></tr></thead>
<tbody>${frontierRows}${rows}</tbody>
</table>
${unplaced.length ? `<p class="note">${unplaced.length} more open models on this site have no index score yet, so they are not in the table: ${unplaced.map((m) => `<a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a>`).join(', ')}. Their pages show what each one needs and what runs it.</p>` : ''}
<p class="note">${esc(data.defaults.frontier_basis?.estimated_note ?? '')} Scores are the ${esc(data.defaults.frontier_basis?.name ?? '')}${data.defaults.frontier_basis?.url ? ` (<a href="${esc(data.defaults.frontier_basis.url)}" rel="noopener">source</a>)` : ''}, read on ${esc(data.defaults.frontier_basis?.checked ?? '')}. Hybrid models are shown at their reasoning or highest-effort score, with the alternative noted on each model's page. Weights are the download; a running model also needs a cache the size of your context window, so see <a href="/how-much-memory/">how much memory each size really takes</a>. The dots are, in order: ${CAPABILITY_KEYS.map((k) => CAP_SHORT[k].toLowerCase()).join(', ')}.</p>
</article>`;

  return pageShell(
    {
      title: titleOf(['Open LLM leaderboard: every model you can run at home', 'Open LLM leaderboard']),
      description: descOf([
        `${unique.length} open models you can download and run at home, ranked against Claude and GPT on one intelligence index, each with the cheapest machine that runs it.`,
        `${unique.length} open models you can run at home, ranked against Claude and GPT on one intelligence index, each with the cheapest machine that runs it.`,
      ]),
      canonical: '/leaderboard/',
      ogImage: '/og/default.png',
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/leaderboard/', label: 'Leaderboard' }],
    },
    body,
    data,
  );
}

/* ------------------------------ best buys ------------------------------ */

function bestBuys(): string {
  const d = data.defaults;
  const levels = bestUsageLevels(data).map((l) => ({ ...l, tiers: bestByTier(data, l.usage) }));
  const anchor = (usage: number) => `u-${fmtTokens(usage).toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  // the headline: at the default usage, the most capable class with anything that pays back
  const headLevel = levels.find((l) => l.usage >= d.usage.default_tokens_per_day) ?? levels[0];
  const headTier = headLevel.tiers.find((t) => t.picks.length);
  const head = headTier?.picks[0];

  const sections = levels
    .map((l) => {
      const rows = l.tiers
        .map((t) => {
          const header = `<tr class="is-frontier"><th colspan="5">${esc(t.label)}${t.hosted.length ? ` <span class="dim">· alongside ${esc(t.hosted.join(', '))}</span>` : ''}</th></tr>`;
          const counts = `${t.never ? `${t.never} never pay back` : ''}${t.never && t.overCapacity ? '; ' : ''}${t.overCapacity ? `${t.overCapacity} can’t produce this much in a day` : ''}`;
          if (!t.picks.length) {
            return `${header}<tr><td colspan="5" class="dim">Nothing in this class pays back on any current machine at this usage${counts ? ` (${counts}, of ${t.considered} pairs that fit)` : ''}.</td></tr>`;
          }
          return header + t.picks
            .map((c) => {
              const v = c.view;
              const tp = v.throughput;
              const ce = c.model.cloud_equivalent;
              const state = { ...defaultState(data), hw: c.hw.id, model: c.model.id, usage: l.usage };
              return `<tr>
  <td class="c-model"><a href="/models/${esc(c.model.id)}/">${esc(c.model.display_name)}</a><span class="c-quant">score ${c.model.frontier_equivalent!.score}${c.model.frontier_equivalent?.estimated ? '*' : ''}</span>${ce.stand_in ? `<br><span class="dim">nobody rents it; priced as ${esc(ce.name)}</span>` : ''}</td>
  <td class="c-hw"><a href="/hardware/${esc(c.hw.id)}/">${esc(hardwareLabel(c.hw))}</a> <span class="dim">${fmtUsd(c.hw.price_usd)}${c.hw.price_scope === 'card_only' ? ', card only' : ''}</span></td>
  <td>${tp?.tokensPerSec != null ? `${fmtNum(tp.tokensPerSec, 0)} tok/s` : '?'}${tp?.measurement && tp.measurement !== 'measured' ? ` <span class="dim">${esc(tp.measurement)}</span>` : ''}</td>
  <td><b>${esc(fmtDuration(c.days))}</b></td>
  <td><a href="${esc(sharePath(state, c.model.id, data))}">Open in the calculator</a></td>
</tr>`;
            })
            .join('') + (counts ? `<tr><td colspan="5" class="dim">Also in this class: ${counts}, of ${t.considered} pairs that fit.</td></tr>` : '');
        })
        .join('');
      return `<section id="${anchor(l.usage)}">
<h2>${esc(fmtTokens(l.usage))} tokens a day <span class="dim">· ${esc(l.label)}</span></h2>
<table class="board">
<thead><tr><th>Model</th><th>Machine</th><th>Speed</th><th>Pays back in</th><th></th></tr></thead>
<tbody>${rows}</tbody>
</table>
</section>`;
    })
    .join('\n');

  const body = `<article class="prose">
<h1>Best buys: the quickest pay-back at each level of capability</h1>
<p class="lede">For each amount of daily use, the machines and models that pay for themselves soonest, grouped by how capable the model is. Each model appears once, on its quickest machine.</p>
${head ? `<p>The short version: at ${esc(fmtTokens(headLevel.usage))} tokens a day (${esc(headLevel.label)}), the quickest ${esc(headTier!.label)} pay-back is ${esc(head.model.display_name)} on a ${esc(hardwareLabel(head.hw))}, in <b>${esc(fmtDuration(head.days))}</b>.</p>` : ''}
<p class="note">Jump to: ${levels.map((l) => `<a href="#${anchor(l.usage)}">${esc(fmtTokens(l.usage))}/day</a>`).join(' · ')}</p>
${sections}
<p class="note">Current machines at list price and current models only. Graphics cards are priced as the card alone, so add the PC around it before comparing them with a complete computer. Every row uses ${esc(String(d.usage.default_input_to_output_ratio))}:1 input to output, $${esc(String(d.electricity.default_price_per_kwh_usd))} per kWh, ${Math.round(d.context.default_tokens / 1024)}k of context, and today's API prices held flat; switch on falling API prices in the calculator and the years stretch. Speeds marked <i>estimated</i> are worked out from memory bandwidth rather than measured, and pay-back scales with them. Models nobody rents are priced as their closest hosted match and say so. Scores are the ${esc(d.frontier_basis?.name ?? 'intelligence index')}; * marks a score the index estimated. Open any row to change the assumptions.</p>
</article>`;

  return pageShell(
    {
      title: titleOf(['Best hardware for local LLMs, by how much you use it', 'Best hardware for local LLMs']),
      description: descOf([
        'For each amount of daily use, the machine and open model that pay back soonest at each level of capability, with the working one click away.',
      ]),
      canonical: '/best/',
      ogImage: '/og/default.png',
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/best/', label: 'Best buys' }],
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
  const alsoAt = otherQuantisations(m, data);
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
<p>${ce.stand_in ? `Nobody rents ${esc(m.display_name)} by the token. The closest hosted match, ${esc(ce.name)},` : `Renting the same model${ce.is_exact_match ? '' : ' (or the nearest hosted equivalent, ' + esc(ce.name) + ')'}`} costs <b>$${ce.input_price_per_mtok}</b> per million input tokens and <b>$${ce.output_price_per_mtok}</b> per million output${ce.source_url ? ` (<a href="${esc(ce.source_url)}" rel="noopener">${esc(ce.source)}</a>, checked ${esc(ce.checked ?? '')})` : ''}. Buying a machine only beats that if you use it hard enough, for long enough, that the hardware price divides down below the rental bill.</p>

${hwRows ? `<h2>Machines that run it</h2>
<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Speed at ${Math.round(ctx / 1024)}k</th><th>Pay-back</th><th></th></tr></thead>
<tbody>${hwRows}</tbody>
</table>
<p class="note">One machine per family, cheapest first. Speeds are measured where a public benchmark exists and estimated from memory bandwidth otherwise; the calculator says which for any configuration.</p>` : ''}

<h2>The specifics</h2>
<dl class="specs">
  <dt>Parameters</dt><dd>${fmtNum(m.params_b, 1)}B${m.active_params_b && m.active_params_b < m.params_b ? `, of which ${fmtNum(m.active_params_b, 1)}B are active per token` : ''}</dd>
  <dt>Quantisation</dt><dd>${esc(m.quantisation)}${alsoAt.map((o) => ` — also listed here at <a href="/models/${esc(o.id)}/">${esc(o.quantisation)}</a>, which is ${fmtGb(o.weights_gb)}`).join('')}</dd>
  <dt>Weights on disk</dt><dd>${fmtGb(m.weights_gb)}</dd>
  <dt>KV cache</dt><dd>${fmtGb(kvCacheGb(m, ctx))} at ${Math.round(ctx / 1024)}k context${m.architecture?.note ? ` — ${esc(m.architecture.note)}` : ''}. <a href="/how-much-memory/">How weights and cache add up</a>.</dd>
  <dt>Maximum context</dt><dd>${m.max_context_tokens ? `${Math.round(m.max_context_tokens / 1024)}k tokens` : 'unknown'}${m.max_context_note ? ` (${esc(m.max_context_note)})` : ''}</dd>
  <dt>Licence</dt><dd>${esc(m.license)}</dd>
  ${m.sources?.length ? `<dt>Sources</dt><dd>${m.sources.map((u, i) => `<a href="${esc(u)}" rel="noopener">source ${i + 1}</a>`).join(', ')}</dd>` : ''}
</dl>
</article>`;

  const usage = fmtTokens(defaultState(data).usage);
  // The pay-back clause is only written where there is a pay-back to state.
  const lead = cheapest
    ? `${m.display_name} needs ${fmtGb(m.weights_gb)} of weights. The cheapest machine that runs it is ${shortHardwareLabel(cheapest.hw)} at ${fmtUsd(cheapest.hw.price_usd)}`
    : '';
  const verdict = cheapest?.view.calc ? lowerFirst(verdictLine(cheapest.view)) : null;
  const desc = cheapest
    ? descOf([
        ...(verdict ? [`${lead}, where it ${verdict} at ${usage} tokens a day.`, `${lead}, where it ${verdict}.`] : []),
        `${lead}.`,
        `${m.display_name} needs ${fmtGb(m.weights_gb)} of weights. Cheapest machine that runs it: ${shortHardwareLabel(cheapest.hw)}.`,
      ])
    : descOf([
        `${m.display_name} needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, ctx) ?? 0))} at ${Math.round(ctx / 1024)}k context, more than any machine on this list offers. What it would take, and what renting it costs instead.`,
        `${m.display_name} needs ${fmtGb((m.weights_gb ?? 0) + (kvCacheGb(m, ctx) ?? 0))} at ${Math.round(ctx / 1024)}k context, more than any machine on this list offers.`,
      ]);
  return pageShell(
    {
      title: titleOf(
        sharedNames.has(m.display_name)
          ? [
              `${m.display_name} ${m.quantisation}: hardware to run it locally`,
              `${m.display_name} ${m.quantisation}: hardware and cost`,
              `${m.display_name} ${m.quantisation}`,
            ]
          : [
              `${m.display_name}: the hardware that runs it, and the cost`,
              `${m.display_name}: hardware to run it locally`,
              `${m.display_name}: hardware and cost`,
            ],
      ),
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

/** A machine named on another machine's page: price, memory, what it runs, what it costs you. */
function relatedRow(h: Hardware): string {
  const discontinued = (h.generation ?? 'current') === 'previous';
  return `<tr>
  <td><a href="/hardware/${esc(h.id)}/">${esc(hardwareLabel(h))}</a>${discontinued ? '<span class="c-quant">discontinued</span>' : ''}</td>
  <td>${h.price_usd == null ? '<span class="dim">not published</span>' : fmtUsd(h.price_usd)}${h.price_scope === 'card_only' ? '<span class="c-quant">card only</span>' : ''}</td>
  <td>${h.unified_memory_gb} GB</td>
  <td>${fitsOn(h).length}</td>
  <td>${esc(verdictLine(hwViews.get(h.id)!))}</td>
</tr>`;
}

function hardwarePage(hw: Hardware): string {
  const state = { ...defaultState(data), hw: hw.id };
  const view = computeView(state, data);
  const fits = view.rows.filter((r) => r.fit.status === 'fits');
  const label = hardwareLabel(hw);
  const short = shortHardwareLabel(hw);
  const hwVerdict = view.calc ? lowerFirst(verdictLine(view)) : null;
  const range = familyRange(hw, data);
  const rivals = priceRivals(hw, data);

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
<p class="note">${fits.length > 12 ? `${fits.length - 12} more fit; the calculator lists them all. ` : ''}The memory column is the weights plus the cache for ${Math.round(state.ctx / 1024)}k of context: <a href="/how-much-memory/">how that sum works, and what each size needs</a>.</p>` : ''}

${range.length || rivals.length ? `<h2>Other machines to weigh against it</h2>
<table class="board">
<thead><tr><th>Machine</th><th>Price</th><th>Memory</th><th>Models that fit</th><th>Pay-back</th></tr></thead>
<tbody>
${range.length ? `<tr class="is-frontier"><th colspan="5">${esc(familyHeading(hw))}</th></tr>${range.map(relatedRow).join('')}` : ''}
${rivals.length ? `<tr class="is-frontier"><th colspan="5">Nearest in price elsewhere on the list</th></tr>${rivals.map(relatedRow).join('')}` : ''}
</tbody>
</table>
<p class="note">Every row uses the same defaults as the figures above: ${fmtTokens(state.usage)} tokens a day at ${state.ratio}:1 input to output, ${Math.round(state.ctx / 1024)}k context, and each machine's strongest model that fits, counted against the same ${view.rows.length} models. Graphics cards are priced as the card alone, so add the PC around one before comparing it with a complete computer.</p>` : ''}
${headToHeads.get(hw.id)?.length ? `<p class="note">Head to head: ${headToHeads.get(hw.id)!.map((h) => `<a href="${esc(h.href)}">vs ${esc(shortHardwareLabel(h.other))}</a>`).join(' · ')}</p>` : ''}

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
      title: titleOf([
        `${short}: can it run local LLMs, and does it pay back?`,
        `${short}: can it run local LLMs?`,
        `${short} for local LLMs`,
      ]),
      description: descOf([
        ...(best && hwVerdict
          ? [
              `${fits.length} of the ${view.rows.length} open models here fit a ${short}. On ${best.model.display_name}, the strongest of them, it ${hwVerdict} at ${fmtTokens(state.usage)} tokens a day.`,
              `${fits.length} of the ${view.rows.length} open models here fit a ${short}. On the strongest of them it ${hwVerdict} at ${fmtTokens(state.usage)} tokens a day.`,
              `${fits.length} of the ${view.rows.length} open models here fit a ${short}, and on the strongest of them it ${hwVerdict}.`,
            ]
          : []),
        `${fits.length} of the ${view.rows.length} open models here fit a ${short}. What it runs, how fast, and whether buying it beats paying an API.`,
        `${fits.length} open models fit a ${short}. What it runs, how fast, and whether it pays back.`,
      ]),
      canonical: `/hardware/${hw.id}/`,
      ogImage: view.model ? `/og/${hw.id}--${view.model.id}.png` : '/og/default.png',
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: `/hardware/${hw.id}/`, label: label }],
      about: hardwareProduct(hw, `${site}/hardware/${hw.id}/`),
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
      title: titleOf([
        `${shortHardwareLabel(a)} vs ${shortHardwareLabel(b)} for local LLMs`,
        `${shortHardwareLabel(a)} vs ${shortHardwareLabel(b)}`,
      ]),
      description: descOf([
        `${fa.length} of the ${va.rows.length} open models here fit the ${shortHardwareLabel(a)}, ${fb.length} the ${shortHardwareLabel(b)}. Memory, speed, price and which pays back sooner.`,
        `${fa.length} models fit the ${shortHardwareLabel(a)}, ${fb.length} the ${shortHardwareLabel(b)}. Memory, speed, price and which pays back sooner.`,
        `${shortHardwareLabel(a)} against ${shortHardwareLabel(b)}: memory, speed, what each runs and which pays back sooner.`,
      ]),
      canonical: `/compare/${slug(hardwareLabel(a))}-vs-${slug(hardwareLabel(b))}/`,
      ogImage: '/og/default.png',
      crumbs: [
        { href: '/', label: 'Sunk Cost' },
        { href: '#', label: `${shortHardwareLabel(a)} vs ${shortHardwareLabel(b)}` },
      ],
    },
    body,
    data,
  );
}

/* --------------------------- the memory question --------------------------- */

const CTX = defaultState(data).ctx;
const NEARLY = data.defaults.nearly_fits_ratio;
/** the context lengths the calculator offers, up to the longest most models will do */
const CTX_STEPS = data.defaults.context.options.filter((c) => c <= 131072);
/** every machine a memory table should consider: on sale, priced, memory published */
const buyable = data.hardware.filter(
  (h) => h.price_usd != null && (h.generation ?? 'current') === 'current' && h.usable_memory_gb != null,
);
const holds = (hw: Hardware, m: Model, ctx: number) => fit(m, hw, ctx, NEARLY).status === 'fits';
const fitCount = (hw: Hardware, ctx: number) => data.models.filter((m) => holds(hw, m, ctx)).length;
const strongestThatFits = (hw: Hardware, ctx: number) =>
  data.models
    .filter((m) => holds(hw, m, ctx) && m.frontier_equivalent?.score != null)
    .sort((a, b) => b.frontier_equivalent!.score! - a.frontier_equivalent!.score!)[0] ?? null;

const machineLink = (hw: Hardware) =>
  `<a href="/hardware/${esc(hw.id)}/">${esc(hardwareLabel(hw))}</a> <span class="dim">${fmtUsd(hw.price_usd)}${hw.price_scope === 'card_only' ? ', card only' : ''}</span>`;

/**
 * Two models of the same size whose caches are furthest apart: the plainest
 * evidence that the cache is an architecture choice rather than a function of
 * parameter count. Grouped on the rounded parameter count so the sentence that
 * says "the same N billion parameters" is true of both.
 */
function widestCacheSpread(ctx: number): [Model, Model] | null {
  const groups = new Map<number, { m: Model; kv: number }[]>();
  for (const m of data.models) {
    const kv = kvCacheGb(m, ctx);
    if (kv == null) continue;
    const key = Math.round(m.params_b);
    groups.set(key, [...(groups.get(key) ?? []), { m, kv }]);
  }
  let widest: [Model, Model] | null = null;
  let gap = 0;
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => b.kv - a.kv);
    const [most, least] = [sorted[0], sorted[sorted.length - 1]];
    if (most.kv - least.kv > gap) {
      gap = most.kv - least.kv;
      widest = [most.m, least.m];
    }
  }
  return widest;
}

/**
 * The model someone means when they type a size. Close enough to the number they
 * typed that calling it a 70B is honest, then the strongest of those, and where
 * that ties the plainer name, which is the base model rather than a distill of it.
 */
function nearestSize(paramsB: number): Model | null {
  const near = data.models
    .filter((m) => m.weights_gb != null && Math.abs(m.params_b - paramsB) <= paramsB * 0.1)
    .sort(
      (a, b) =>
        (b.frontier_equivalent?.score ?? 0) - (a.frontier_equivalent?.score ?? 0) ||
        Math.abs(a.params_b - paramsB) - Math.abs(b.params_b - paramsB) ||
        a.display_name.length - b.display_name.length,
    );
  return near[0] ?? null;
}

/** A model's name, with the quantisation where the site lists the same model twice. */
function namePlusQuant(m: Model): string {
  return sharedNames.has(m.display_name) ? `${m.display_name} at ${m.quantisation}` : m.display_name;
}

/**
 * The stretch of the memory ladder over which the strongest model you can run
 * does not change. Buying more memory buys more models and a longer window; it
 * does not always buy a better one, and the ladder says where that stops being
 * true.
 */
function strongestPlateau(ladder: Hardware[], ctx: number): { model: Model; from: Hardware; to: Hardware; next: Model | null; nextHw: Hardware | null } | null {
  const top = ladder.map((hw) => ({ hw, m: strongestThatFits(hw, ctx) }));
  let best: { model: Model; from: Hardware; to: Hardware } | null = null;
  let i = 0;
  while (i < top.length) {
    const m = top[i].m;
    let j = i;
    while (j + 1 < top.length && top[j + 1].m?.id === m?.id) j++;
    if (m && (!best || j - i > ladder.indexOf(best.to) - ladder.indexOf(best.from)))
      best = { model: m, from: top[i].hw, to: top[j].hw };
    i = j + 1;
  }
  if (!best || best.from.id === best.to.id) return null;
  const after = top.slice(ladder.indexOf(best.to) + 1).find((x) => x.m && x.m.id !== best!.model.id);
  return { ...best, next: after?.m ?? null, nextHw: after?.hw ?? null };
}

function memoryRow(m: Model): string {
  const kv = kvCacheGb(m, CTX);
  const need = footprintGb(m, CTX);
  const hw = cheapestThatHolds(need, data);
  return `<tr>
  <td class="c-model"><a href="/models/${esc(m.id)}/">${esc(m.display_name)}</a><span class="c-quant">${esc(m.quantisation)}</span>${m.generation === 'legacy' ? '<span class="c-quant">older</span>' : ''}</td>
  <td>${fmtNum(m.params_b, 1)}B</td>
  <td>${fmtGb1(m.weights_gb)}</td>
  <td>${fmtGb1(kv)}</td>
  <td><b>${fmtGb1(need)}</b></td>
  <td>${hw ? machineLink(hw) : '<span class="dim">nothing on this list</span>'}</td>
  <td>${hw ? `<a href="${esc(calcLink({ hw: hw.id, model: m.id, ctx: CTX }, data))}">Run the numbers</a>` : ''}</td>
</tr>`;
}

function memoryPage(): string {
  const kctx = `${Math.round(CTX / 1024)}k`;
  const anchor = nearestSize(70);
  const anchorNeed = anchor ? footprintGb(anchor, CTX) : null;
  const anchorHolder = cheapestThatHolds(anchorNeed, data);

  // weights per billion parameters, over the four-bit models, which is nearly all of them
  const fourBit = data.models.filter((m) => /q4|mxfp4/i.test(m.quantisation) && m.weights_gb != null);
  const perB = fourBit.map((m) => m.weights_gb! / m.params_b);
  const midPerB = median(perB);
  const caches = data.models.map((m) => kvCacheGb(m, CTX)).filter((v): v is number => v != null);

  // the three columns of the context table: the cheapest machine at each of the
  // memory sizes these boxes are actually sold in
  const columns = [32, 64, 128]
    .map((installed) =>
      buyable.filter((h) => h.unified_memory_gb === installed).sort((a, b) => a.price_usd! - b.price_usd!)[0],
    )
    .filter(Boolean) as Hardware[];

  const ctxRows = CTX_STEPS.map(
    (c) => `<tr>
  <th>${Math.round(c / 1024)}k${c === CTX ? ' <span class="dim">default</span>' : ''}</th>
  ${columns.map((hw) => `<td>${fitCount(hw, c)}</td>`).join('')}
</tr>`,
  ).join('');

  // one machine per level of usable memory, cheapest at that level
  const ladder = [...new Set(buyable.map((h) => h.usable_memory_gb!))]
    .sort((a, b) => a - b)
    .map((gb) => buyable.filter((h) => h.usable_memory_gb === gb).sort((a, b) => a.price_usd! - b.price_usd!)[0]);

  const plateau = strongestPlateau(ladder, CTX);
  const ladderRows = ladder
    .map((hw) => {
      const top = strongestThatFits(hw, CTX);
      return `<tr>
  <td><b>${fmtGb1(hw.usable_memory_gb)}</b></td>
  <td>${hw.unified_memory_gb} GB</td>
  <td>${machineLink(hw)}</td>
  <td>${fitCount(hw, CTX)}</td>
  <td>${top ? `<a href="/models/${esc(top.id)}/">${esc(top.display_name)}</a> <span class="dim">${esc(tierName(top, data))}</span>` : '<span class="dim">none</span>'}</td>
</tr>`;
    })
    .join('');

  const bands = SIZE_BANDS.map((band) => {
    // ordered by what they ask of a machine, which is what the page is about
    const sized = modelsInBand(band, data)
      .map((m) => ({ m, need: footprintGb(m, CTX) }))
      .filter((x): x is { m: Model; need: number } => x.need != null)
      .sort((a, b) => a.need - b.need);
    if (!sized.length) return '';
    const ms = sized.map((x) => x.m);
    const needs = sized.map((x) => x.need);
    const biggest = sized[sized.length - 1];
    const holder = cheapestThatHolds(biggest.need, data);
    // where nothing holds the biggest, the biggest one that something does hold
    const held = [...sized].reverse().find((x) => cheapestThatHolds(x.need, data) != null);
    const heldBy = held ? cheapestThatHolds(held.need, data) : null;
    const size =
      band.max === Infinity
        ? `over ${band.min} billion parameters`
        : band.min === 0
          ? `under ${band.max} billion parameters`
          : `between ${band.min} and ${band.max} billion parameters`;
    return `<section>
<h2>${esc(band.question)}</h2>
<p>${ms.length} model${ms.length === 1 ? '' : 's'} on this site ${ms.length === 1 ? 'is' : 'are'} ${esc(size)}. The weights come to ${gbRange(ms.map((m) => m.weights_gb ?? NaN))}, and at ${kctx} context the cache adds ${gbRange(ms.map((m) => kvCacheGb(m, CTX) ?? NaN))} on top. That puts the whole job at ${gbRange(needs)} of memory at once. ${
      holder
        ? `The cheapest machine here that runs the hungriest of them, ${esc(namePlusQuant(biggest.m))}, is the ${esc(hardwareLabel(holder))} at ${fmtUsd(holder.price_usd)}.`
        : `No machine on this list holds the hungriest of them, ${esc(namePlusQuant(biggest.m))}, which wants ${fmtGb1(biggest.need)} at ${kctx} context.${
            held && heldBy
              ? ` The largest that does fit is ${esc(namePlusQuant(held.m))}, on the ${esc(hardwareLabel(heldBy))} at ${fmtUsd(heldBy.price_usd)}.`
              : ''
          }`
    }</p>
<table class="board">
<thead><tr><th>Model</th><th>Parameters</th><th>Weights</th><th>Cache at ${kctx}</th><th>Needs</th><th>Cheapest machine that runs it</th><th></th></tr></thead>
<tbody>${ms.map(memoryRow).join('')}</tbody>
</table>
</section>`;
  }).join('\n');

  const working = anchor ? kvWorking(anchor, CTX) : null;
  const spread = widestCacheSpread(131072);
  const short8k = anchor ? footprintGb(anchor, 8192) : null;
  const holder8k = cheapestThatHolds(short8k, data);
  const kv = data.defaults.kv_cache;

  const body = `<article class="prose">
<h1>How much memory do you need to run a local LLM?</h1>
<p class="lede">Two numbers, added together, held at the same time. The weights are a fixed download. The key-value cache grows with the context window you ask for, and on some models it ends up larger than the weights.${
    anchor && anchorNeed
      ? ` ${esc(anchor.display_name)} at ${esc(anchor.quantisation)} is ${fmtGb1(anchor.weights_gb)} of weights plus ${fmtGb1(kvCacheGb(anchor, CTX))} of cache at ${kctx} context: ${fmtGb1(anchorNeed)} in one machine.`
      : ''
  }</p>

<div class="answer">
  <div class="answer-row"><span class="answer-k">What has to fit</span><span class="answer-v">The weights, plus a cache the size of your context window. Both at once, in memory the GPU can reach.</span></div>
  ${midPerB != null ? `<div class="answer-row"><span class="answer-k">Weights at four bits</span><span class="answer-v">About ${midPerB.toFixed(2)} GB per billion parameters. Across the ${fourBit.length} four-bit models here it runs ${Math.min(...perB).toFixed(2)} GB to ${Math.max(...perB).toFixed(2)} GB.</span></div>` : ''}
  ${caches.length ? `<div class="answer-row"><span class="answer-k">Cache at ${kctx} context</span><span class="answer-v">${gbRange(caches)}, depending on the model. Architecture decides this, not parameter count.</span></div>` : ''}
  ${anchor && anchorHolder ? `<div class="answer-row"><span class="answer-k">${esc(anchor.display_name)} at ${kctx}</span><span class="answer-v">${fmtGb1(anchorNeed)}. The cheapest machine here that holds it is the <a href="/hardware/${esc(anchorHolder.id)}/">${esc(hardwareLabel(anchorHolder))}</a> at ${fmtUsd(anchorHolder.price_usd)}.</span></div>` : ''}
</div>

${anchor && anchorHolder ? `<p><a class="cta" href="${esc(calcLink({ hw: anchorHolder.id, model: anchor.id, ctx: CTX }, data))}">Run the numbers on that pairing</a></p>` : ''}

<h2>Where the cache figure comes from</h2>
<p>The weights are whatever the file weighs on disk. The cache is arithmetic. Every token in the context window leaves a key and a value behind in every layer, and all of it stays resident while the model is loaded.</p>
${working && anchor ? `<p>For ${esc(anchor.display_name)}: ${working}</p>` : ''}
<p>Two things follow. The window you ask for is a hardware decision, not a setting: on most models the cache grows in step with it, and only the ones with sliding-window layers stop growing partway. And two models of the same size can want very different amounts, because the number of key-value heads and the width of each one are architecture choices.</p>

${bands}

<h2>Context is the part people miss</h2>
<p>A longer window costs memory before it costs anything else. Here is how many of the ${data.models.length} models on this site fit three machines as the window grows, counting a model only where its own context ceiling allows it.</p>
<table class="board compare">
<thead><tr><th>Context</th>${columns.map((hw) => `<th><a href="/hardware/${esc(hw.id)}/">${esc(shortHardwareLabel(hw))}</a><span class="c-quant">${fmtGb1(hw.usable_memory_gb)} usable</span></th>`).join('')}</tr></thead>
<tbody>${ctxRows}</tbody>
</table>
${
    anchor && short8k != null && anchorNeed != null && holder8k && anchorHolder && holder8k.id !== anchorHolder.id
      ? `<p>That is a shopping list, not a setting. ${esc(anchor.display_name)} needs ${fmtGb1(short8k)} at 8k context, which the ${esc(hardwareLabel(holder8k))} at ${fmtUsd(holder8k.price_usd)} holds. At ${kctx} it needs ${fmtGb1(anchorNeed)}, and the cheapest machine that holds it becomes the ${esc(hardwareLabel(anchorHolder))} at ${fmtUsd(anchorHolder.price_usd)}.</p>`
      : ''
  }
${
    spread
      ? `<p>Size is a poor guide to the cache. Two models here have the same ${Math.round(spread[0].params_b)} billion parameters: at 128k context <a href="/models/${esc(spread[0].id)}/">${esc(spread[0].display_name)}</a> wants ${fmtGb1(kvCacheGb(spread[0], 131072))} of cache and <a href="/models/${esc(spread[1].id)}/">${esc(spread[1].display_name)}</a> wants ${fmtGb1(kvCacheGb(spread[1], 131072))}. Each model's page carries its own figure.</p>`
      : ''
  }
<p>You can also make the cache smaller. ${esc(kv?.note ?? '')}${kv?.source_url ? ` (<a href="${esc(kv.source_url)}" rel="noopener">source</a>)` : ''} The calculator has that switch, and every figure on this page is at the 16-bit default.</p>

<h2>Installed memory is not usable memory</h2>
<p>The number on the box is not the number a model gets. The system takes a share, and on a machine with unified memory the GPU is only allowed to address part of the rest. This is what each machine can actually hand a model, cheapest machine shown at each level.</p>
<table class="board">
<thead><tr><th>Usable</th><th>Installed</th><th>Cheapest machine at that level</th><th>Models that fit at ${kctx}</th><th>Strongest of them</th></tr></thead>
<tbody>${ladderRows}</tbody>
</table>
${
    plateau
      ? `<p>Read the last column before you spend anything. From ${fmtGb1(plateau.from.usable_memory_gb)} of usable memory up to ${fmtGb1(plateau.to.usable_memory_gb)}, the strongest model on this list does not change: it is <a href="/models/${esc(plateau.model.id)}/">${esc(plateau.model.display_name)}</a> the whole way. More memory across that stretch buys more models, more context and more room to work, not a cleverer one.${
          plateau.next && plateau.nextHw
            ? ` The next step up is <a href="/models/${esc(plateau.next.id)}/">${esc(plateau.next.display_name)}</a>, and the cheapest machine that holds it is the <a href="/hardware/${esc(plateau.nextHw.id)}/">${esc(hardwareLabel(plateau.nextHw))}</a> at ${fmtUsd(plateau.nextHw.price_usd)}.`
            : ''
        }</p>`
      : ''
  }

<p class="note">Every figure is at ${kctx} context unless the row says otherwise, with the cache at 16 bits, at the quantisation named against each model. Weights are the published file sizes on each model's page; the cache is worked out from the architecture recorded there. Machines are the current ones at list price, with the memory their maker publishes and the usable share on each machine's page; graphics cards are priced as the card alone, so add the PC around one before comparing one with a complete computer. Counts cover all ${data.models.length} models listed here, superseded ones included, because people still run them. To change the context, the quantisation or the cache type, <a href="${esc(calcLink({}, data))}">open the calculator</a>.</p>
</article>`;

  return pageShell(
    {
      title: titleOf(['How much memory do you need to run a local LLM?', 'How much memory to run a local LLM']),
      description: descOf([
        `Weights plus a key-value cache that grows with context. What 8B, 32B, 70B and 100B models need at ${kctx}, and the cheapest machine that holds each.`,
        `Weights plus a cache that grows with context. What 8B, 32B, 70B and 100B models need at ${kctx}, and the cheapest machine that holds each.`,
      ]),
      canonical: '/how-much-memory/',
      ogImage: '/og/default.png',
      crumbs: [{ href: '/', label: 'Sunk Cost' }, { href: '/how-much-memory/', label: 'How much memory' }],
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
      title: titleOf([
        `${a.display_name} vs ${b.display_name}: which should you run?`,
        `${a.display_name} vs ${b.display_name}`,
      ]),
      description: descOf([
        ...(sa != null && sa === sb
          ? [`${a.display_name} and ${b.display_name} both score ${sa} on the intelligence index. Size, context, licence, API price and the cheapest machine that runs each.`]
          : []),
        `${a.display_name} scores ${sa ?? '?'} on the intelligence index, ${b.display_name} scores ${sb ?? '?'}. Size, context, licence, API price and the cheapest machine that runs each.`,
        `${a.display_name} scores ${sa ?? '?'}, ${b.display_name} scores ${sb ?? '?'}. Size, context, licence, API price and the cheapest machine that runs each.`,
        `${a.display_name} scores ${sa ?? '?'}, ${b.display_name} scores ${sb ?? '?'}. Size, context, licence and the cheapest machine for each.`,
      ]),
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
write('/best/', bestBuys());
write('/how-much-memory/', memoryPage());
for (const m of data.models) write(`/models/${m.id}/`, modelPage(m));
for (const hw of data.hardware) write(`/hardware/${hw.id}/`, hardwarePage(hw));

// comparisons: the flagship current config of each family against every other,
// the pairs `headToHeads` above already worked out and linked from both sides
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
checkMeta();
checkLinks();
console.log(`wrote ${paths.length} static pages + sitemap.xml (${paths.filter((p) => p.startsWith('/models')).length} models, ${paths.filter((p) => p.startsWith('/hardware')).length} machines, ${paths.filter((p) => p.startsWith('/compare')).length} comparisons)`);
