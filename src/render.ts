import { computeView, formatUsageShort, hardwareLabel, modelLabel, ratioLabel, usageLabel, type ModelRow, type View } from './compute';
import { esc, fmtDuration, fmtGb, fmtHours, fmtInt, fmtNum, fmtSeconds, fmtTokens, fmtUsd } from './format';
import { kvCacheGb } from './fit';
import { serializeState, type State } from './state';
import { CAPABILITY_KEYS, CAPABILITY_LABELS, type Dataset, type Hardware, type Model, type Rating } from './types';
import { renderWaterline } from './waterline';

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

export function renderAll(state: State, data: Dataset): View {
  const view = computeView(state, data);
  renderMachine(state, data, view);
  renderControls(state, data, view);
  renderModels(state, data, view);
  renderVerdict(state, data, view);
  renderFigures(state, data, view);
  renderSmarts(state, data, view);
  renderTimeCost(state, data, view);
  renderMath(state, data, view);
  renderSmallPrint(state, data, view);
  document.title = pageTitle(view);
  const corrections = document.querySelector<HTMLAnchorElement>('#corrections');
  if (corrections) {
    const repo = data.defaults.repo_url;
    corrections.href = repo ? `${repo}/issues` : 'mailto:?subject=Sunk%20Cost%20correction';
    corrections.textContent = repo ? 'open an issue' : 'tell us';
  }
  return view;
}

export function pageTitle(view: View): string {
  return `${hardwareLabel(view.hw)} — how long until local AI pays for itself? — Sunk Cost`;
}

function setOptions(sel: HTMLSelectElement, html: string, value: string) {
  if (sel.dataset.rendered !== html) {
    sel.innerHTML = html;
    sel.dataset.rendered = html;
  }
  sel.value = value;
}

/* ---------------- zone 1: machine ---------------- */

function renderMachine(state: State, data: Dataset, view: View) {
  const families = [...new Set(data.hardware.map((h) => h.family))];
  setOptions($<HTMLSelectElement>('#family'), families.map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join(''), view.hw.family);

  const inFamily = data.hardware.filter((h) => h.family === view.hw.family);
  const chipKey = (h: Hardware) => `${h.chip}`;
  const groups: Array<['current' | 'previous', string]> = [['current', 'Current lineup'], ['previous', 'Previous generation (discontinued, launch price)']];
  const hasPrev = inFamily.some((h) => h.generation === 'previous');
  const chipHtml = groups
    .map(([gen, label]) => {
      const chips = [...new Set(inFamily.filter((h) => (h.generation ?? 'current') === gen).map(chipKey))];
      if (!chips.length) return '';
      const opts = chips.map((c) => {
        const bw = [...new Set(inFamily.filter((h) => chipKey(h) === c).map((h) => h.memory_bandwidth_gbs))].filter(Boolean);
        return `<option value="${esc(c)}">${esc(c)}${bw.length ? ` · ${bw.join('–')} GB/s` : ''}</option>`;
      }).join('');
      return hasPrev ? `<optgroup label="${esc(label)}">${opts}</optgroup>` : opts;
    })
    .join('');
  setOptions($<HTMLSelectElement>('#chip'), chipHtml, view.hw.chip);

  const rows = inFamily.filter((h) => h.chip === view.hw.chip);
  $('#configs').innerHTML = rows.map((h) => configButton(h, h.id === view.hw.id)).join('');
  const priceInput = $<HTMLInputElement>('#price');
  const listPrice = view.hw.price_usd;
  priceInput.placeholder = listPrice == null ? 'what you paid' : String(listPrice);
  const wanted = state.price == null ? '' : String(state.price);
  if (priceInput.value !== wanted && document.activeElement !== priceInput) priceInput.value = wanted;
  $('#price-note').innerHTML = view.priceIsCustom
    ? `Using your price.${listPrice == null ? '' : ` List is ${fmtUsd(listPrice)}.`} <button type="button" class="linkish" id="price-reset">Use the list price</button>`
    : listPrice == null
      ? '<span class="todo">No list price for this configuration. Enter what you paid.</span>'
      : `Bought it cheaper, second-hand or on sale? Enter what you paid.`;

  const bits: string[] = [];
  if (view.hw.chip_variant) bits.push(view.hw.chip_variant);
  if (view.hw.memory_bandwidth_gbs) bits.push(`${view.hw.memory_bandwidth_gbs} GB/s`);
  if (view.hw.usable_memory_gb != null) bits.push(`${view.hw.usable_memory_gb} GB usable by the GPU`);
  if (view.hw.status) bits.push(view.hw.status);
  $('#hw-status').innerHTML = `${esc(bits.join(' · '))}${view.hw.TODO ? ` <span class="todo">TODO: ${esc(view.hw.TODO)}</span>` : ''}`;
}

function configButton(h: Hardware, selected: boolean): string {
  const price = h.price_usd == null ? '<span class="todo">no price</span>' : fmtUsd(h.price_usd);
  return `<button type="button" role="radio" aria-checked="${selected}" class="seg" data-hw="${esc(h.id)}" title="${esc(h.chip_variant ?? '')}">
    <span class="seg-mem">${h.unified_memory_gb} GB</span>
    <span class="seg-price">${price}</span>
  </button>`;
}

/* ---------------- controls ---------------- */

function renderControls(state: State, data: Dataset, view: View) {
  const d = data.defaults;
  const out = state.usage / (state.ratio + 1);
  const cap = view.capacity;
  let capNote = '';
  if (cap.maxTokensPerDay != null && view.model) {
    capNote = cap.capped
      ? `<span class="flag warn">This machine tops out at ${formatUsageShort(cap.maxTokensPerDay)} a day. The maths uses that.</span>`
      : `<span class="flag dim">Ceiling here: ${formatUsageShort(cap.maxTokensPerDay)} a day, generating non-stop.</span>`;
  }
  $('#usage-readout').innerHTML = `<b class="num">${formatUsageShort(state.usage)}</b> tokens a day <span class="muted">— ${esc(usageLabel(state.usage, data))}</span>${capNote}`;

  // use case
  const uc = d.use_cases;
  const match = uc.find((u) => Math.abs(u.ratio - state.ratio) < 1e-9);
  const ucHtml = uc.map((u) => `<option value="${u.ratio}">${esc(u.label)} · ${esc(ratioLabel(u.ratio))}</option>`).join('') + `<option value="custom">Custom ratio…</option>`;
  setOptions($<HTMLSelectElement>('#usecase'), ucHtml, match ? String(match.ratio) : 'custom');
  $('#ratio-custom').hidden = !!match;
  const ratio = $<HTMLInputElement>('#ratio');
  ratio.min = String(d.usage.min_input_to_output_ratio);
  ratio.max = String(d.usage.max_input_to_output_ratio);
  if (Number(ratio.value) !== state.ratio) ratio.value = String(state.ratio);
  $('#ratio-readout').innerHTML = `<b class="num">${esc(ratioLabel(state.ratio))}</b>${match?.note ? ` <span class="muted">— ${esc(match.note)}</span>` : ''}`;

  // context slider over the option list
  const opts = d.context.options;
  const cs = $<HTMLInputElement>('#ctxslider');
  cs.min = '0';
  cs.max = String(opts.length - 1);
  const idx = Math.max(0, opts.indexOf(state.ctx));
  if (Number(cs.value) !== idx) cs.value = String(idx);
  const sel = view.model;
  const kv = sel ? kvCacheGb(sel, state.ctx) : null;
  const limit = sel?.max_context_tokens;
  $('#ctx-readout').innerHTML = `<b class="num">${fmtCtx(state.ctx)}</b> tokens <span class="muted">— ${sel ? `${fmtGb(kv)} KV cache for ${esc(sel.display_name)}` : 'sets each model’s KV-cache memory'}${limit != null ? `; limit ${fmtCtx(limit)}` : ''}</span>`;

  const kwh = $<HTMLInputElement>('#kwh');
  if (Number(kwh.value) !== state.kwh) kwh.value = String(state.kwh);
  const ctps = $<HTMLInputElement>('#cloud-tps');
  if (Number(ctps.value) !== state.cloudTps) ctps.value = String(state.cloudTps);
  $('#kwh-note').textContent = `Default $${d.electricity.default_price_per_kwh_usd.toFixed(2)}/kWh is the ${d.electricity.country} residential average.`;
}

export function fmtCtx(tokens: number): string {
  return tokens >= 1024 ? `${Math.round(tokens / 1024)}k` : String(tokens);
}

/* ---------------- zone 3: models ---------------- */

function dot(r: Rating, key: string): string {
  const label = CAPABILITY_LABELS[key as keyof typeof CAPABILITY_LABELS];
  return `<span class="dot dot-${r}" title="${esc(label.long)}: ${r}" aria-label="${esc(label.short)}: ${r}"></span>`;
}

function frontierScale(m: Model, data: Dataset, big = false): string {
  const tier = m.frontier_equivalent?.tier ?? null;
  const tiers = data.defaults.frontier_tiers;
  const bars = tiers.map((t) => `<i class="${tier != null && t.tier <= tier ? 'on' : ''}"></i>`).join('');
  const scale = `<span class="scale${tier == null ? ' unplaced' : ''}" aria-hidden="true">${bars}</span>`;
  if (tier == null) return `${scale}<span>not yet placed against hosted models</span>`;
  const t = tiers[tier];
  const names = [t.anthropic, t.openai].filter(Boolean).join(' / ');
  if (big) return `${scale}<span class="smarts-tier"><b>${esc(t.label)}</b>${names ? ` — about ${esc(names)}` : ''}</span>`;
  return `${scale}<b>${esc(t.label)}</b>${names ? `<span>${esc(names)}</span>` : ''}`;
}

function sourcesLine(m: Model, view: View, data: Dataset): string {
  const row = view.rows.find((r) => r.model.id === m.id);
  const t = row?.throughput;
  const parts: string[] = [];
  const hf = m.sources?.find((s) => s.includes('huggingface.co'));
  parts.push(hf ? `<a href="${esc(hf)}" rel="noopener">weights</a>` : 'weights: models.json');
  const ce = m.cloud_equivalent;
  parts.push(ce.source_url ? `<a href="${esc(ce.source_url)}" rel="noopener">price</a>${ce.checked ? ` (${esc(ce.checked)})` : ''}` : 'price: models.json');
  if (t) {
    const adj = t.contextFactor < 0.95 ? `, adjusted for ${fmtCtx(view.contextTokens)} context` : '';
    parts.push(t.measurement === 'measured' && t.sourceUrl ? `<a href="${esc(t.sourceUrl)}" rel="noopener">speed</a> (${esc(t.source)}${adj})` : t.measurement === 'estimated' ? `speed: estimate from ${view.hw.memory_bandwidth_gbs} GB/s bandwidth${adj}` : 'speed: unknown');
  }
  const basis = data.defaults.frontier_basis;
  parts.push(m.frontier_equivalent?.basis ? `comparison: ${esc(m.frontier_equivalent.basis)}` : basis?.url ? `<a href="${esc(basis.url)}" rel="noopener">comparison basis</a>` : 'ratings: our judgement');
  return parts.join(' · ');
}

function renderModels(state: State, data: Dataset, view: View) {
  const hw = view.hw;
  const families = [...new Set(data.models.map((m) => m.family).filter(Boolean))] as string[];
  setOptions($<HTMLSelectElement>('#model-family'), `<option value="">All families</option>` + families.map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join(''), state.family);
  setOptions($<HTMLSelectElement>('#model-sort'), data.defaults.sorts.map((x) => `<option value="${esc(x.id)}">${esc(x.label)}</option>`).join(''), state.sort);

  const list = view.rows.map((row) => modelCard(row, state, data, view)).join('');
  const fits = view.rows.filter((r) => r.fit.status === 'fits').length;
  const legend = ['green:good', 'amber:usable', 'red:don’t', 'unknown:not rated']
    .map((x) => {
      const [k, label] = x.split(':');
      return `<span class="chip"><i class="dot dot-${k}"></i>${esc(label)}</span>`;
    })
    .join('');
  $('#fit-summary').innerHTML = `<span class="chips"><span class="chip"><b>${fits}</b> of ${data.models.length} fit in ${hw.usable_memory_gb ?? '?'} GB</span>${legend}</span>`;
  $('#models').innerHTML = list || `<p class="m-empty">Nothing in this family fits ${esc(hardwareLabel(hw))} at ${fmtCtx(state.ctx)} context.</p>`;
}

function modelCard({ model: m, fit, throughput: t }: ModelRow, state: State, data: Dataset, view: View): string {
  const selected = view.model?.id === m.id;
  const disabled = fit.status !== 'fits';
  const kv = kvCacheGb(m, state.ctx);
  const slower = t.contextFactor < 0.95 && t.baseTokensPerSec != null;
  const speed = t.tokensPerSec == null
    ? '<span class="todo">speed unknown</span>'
    : `<span class="m-tps"><b>${fmtNum(t.tokensPerSec, t.tokensPerSec < 10 ? 1 : 0)}</b><i>tok/s</i></span>`;
  const tag = t.measurement === 'measured'
    ? '<span class="tag tag-measured">measured</span>'
    : t.measurement === 'estimated' ? '<span class="tag tag-estimated">estimated</span>' : '';

  const ce = m.cloud_equivalent;
  const price = ce.input_price_per_mtok == null
    ? '<span class="chip todo">API price unknown</span>'
    : `<span class="chip" title="${esc(ce.is_exact_match ? ce.name : `nearest hosted equivalent: ${ce.name}`)} on OpenRouter"><b>$${ce.input_price_per_mtok}</b>/<b>$${ce.output_price_per_mtok}</b> per 1M${ce.is_exact_match ? '' : '*'}</span>`;

  const chips = [
    `<span class="chip" title="${fmtGb(m.weights_gb)} of weights plus ${fmtGb(kv)} of KV cache"><b>${fmtGb(fit.needGb)}</b> at ${fmtCtx(state.ctx)}</span>`,
    m.max_context_tokens != null ? `<span class="chip">max <b>${fmtCtx(m.max_context_tokens)}</b></span>` : '<span class="chip todo">max context unknown</span>',
    slower ? `<span class="chip chip-warn">${Math.round((1 - t.contextFactor) * 100)}% slower at this context</span>` : '',
    price,
  ].filter(Boolean).join('');

  const reason = fit.status === 'fits' ? '' : `<p class="m-reason">${fit.status === 'nearly' ? 'Nearly fits' : fit.status === 'context' ? 'Past its context limit' : 'Unknown'} — ${esc(fit.reason)}.</p>`;
  const sources = selected ? `<p class="m-src">Sources: ${sourcesLine(m, view, data)}</p>` : '';

  return `<div class="model${selected ? ' is-selected' : ''}${disabled ? ' is-disabled' : ''}" role="radio" aria-checked="${selected}" tabindex="${disabled ? -1 : 0}" data-model="${esc(m.id)}"${disabled ? ' aria-disabled="true"' : ''}>
    <div class="m-top">
      <span class="m-id"><span class="m-name">${esc(m.display_name)}</span><span class="m-quant">${esc(m.quantisation)}</span></span>
      <span class="m-speed">${speed}${tag}</span>
    </div>
    <div class="chips">${chips}</div>
    <div class="m-smarts">${frontierScale(m, data)}</div>
    <div class="m-caps"><span class="dots" aria-label="capability ratings">${CAPABILITY_KEYS.map((k) => dot(m.capabilities[k], k)).join('')}</span><span class="m-note">${esc(m.capability_note)}</span></div>
    ${reason}${sources}
  </div>`;
}

/* ---------------- zone 4: verdict ---------------- */

function renderVerdict(state: State, data: Dataset, view: View) {
  const c = view.calc;
  const wl = $('#waterline');
  if (c && view.price != null) {
    wl.innerHTML = renderWaterline({ devicePriceUsd: view.price, dailySaving: c.dailySaving, breakevenDays: c.breakevenDays, maxYears: data.defaults.waterline_max_years, width: 800, height: 250, markerDays: 365.25 });
    wl.classList.remove('is-empty');
  } else {
    wl.innerHTML = '';
    wl.classList.add('is-empty');
  }
  // how deep the panel reads: the longer you are under, the darker the water
  const depth = c?.breakevenDays == null ? 1 : Math.min(1, Math.log10(Math.max(1, c.breakevenDays / 30)) / 2.4);
  $('#hero').style.setProperty('--depth', depth.toFixed(3));
  $('#hero').classList.toggle('is-never', view.verdict.kind === 'never');
  const cap = view.capacity;
  const caution = cap.capped && view.model
    ? `<div class="caution">You asked for ${formatUsageShort(cap.requested)} tokens a day. ${esc(view.model.display_name)} on this machine can only get through <b class="num">${formatUsageShort(cap.maxTokensPerDay!)}</b> a day at ${fmtNum(view.throughput?.tokensPerSec, 0)} tok/s, generating 24 hours non-stop, so that is what the break-even uses. The rest would still be going to an API.</div>`
    : '';
  $('#verdict').innerHTML = `<h2 class="verdict-headline verdict-${view.verdict.kind}">${esc(view.verdict.headline)}</h2>
    ${view.verdict.sub ? `<p class="verdict-sub">${esc(view.verdict.sub)}</p>` : ''}
    <p class="verdict-config muted">${esc(view.configLine)} · ${esc(view.usageLine)}</p>${caution}`;
  const url = shareUrl(state);
  $<HTMLAnchorElement>('#share-x').href = `https://twitter.com/intent/tweet?${new URLSearchParams({ text: shareText(view), url }).toString()}`;
}

export function shareUrl(state: State): string {
  return `${location.origin}${location.pathname}?${serializeState(state)}`;
}

export function shareText(view: View): string {
  const bits = [view.configLine + '.', view.verdict.headline];
  return bits.join(' ');
}

function renderFigures(state: State, data: Dataset, view: View) {
  const c = view.calc;
  const t = view.throughput;
  const figs: [string, string, string?][] = [
    ['Hardware', view.price == null ? 'unknown' : fmtUsd(view.price), view.priceIsCustom ? 'the price you paid' : view.hw.generation === 'previous' ? 'launch price' : undefined],
    ['API cost per month', c ? fmtUsd(c.cloudCostPerMonth) : '—', view.model ? `${view.model.cloud_equivalent.name} on OpenRouter` : undefined],
    ['Electricity per month', c ? fmtUsd(c.localCostPerMonth) : '—', view.hw.load_watts ? `${view.hw.load_watts} W under load${view.hw.load_watts_status === 'stand_in' ? ' (stand-in figure)' : ''}` : undefined],
    ['Local speed', t?.tokensPerSec == null ? 'unknown' : `${fmtNum(t.tokensPerSec, 0)} tok/s`, t ? t.measurement : undefined],
    ['Break-even', c ? (c.breakevenDays === null ? 'never' : fmtDuration(c.breakevenDays)) : '—', c?.breakevenTokens != null ? `${fmtTokens(c.breakevenTokens)} tokens` : undefined],
    ['After 12 months', c ? fmtUsd(-view.price! + c.dailySaving * 365.25) : '—', c ? (-view.price! + c.dailySaving * 365.25 < 0 ? 'still underwater' : 'clear of the surface') : undefined],
  ];
  $('#figures').innerHTML = figs.map(([k, v, sub]) => `<div class="fig"><div class="fig-k">${esc(k)}</div><div class="fig-v num">${esc(v)}</div>${sub ? `<div class="fig-s">${esc(sub)}</div>` : ''}</div>`).join('');
  void state; void data;
}


function renderSmarts(state: State, data: Dataset, view: View) {
  const m = view.model;
  const el = $('#smarts');
  if (!m) { el.innerHTML = ''; return; }
  const d = data.defaults;
  const fe = m.frontier_equivalent;
  const tier = fe?.tier ?? null;
  const t = tier == null ? null : d.frontier_tiers[tier];
  const max = d.frontier_scale_max ?? 70;
  const pct = (v: number) => `${Math.min(100, Math.max(0, (v / max) * 100)).toFixed(1)}%`;
  const refs = d.frontier_reference ?? [];
  // tier bands so the scale reads as "how smart", not just a number
  const bands = d.frontier_tiers
    .map((tt, i) => {
      const from = tt.min_score;
      const to = d.frontier_tiers[i + 1]?.min_score ?? max;
      return `<span class="band${tier === tt.tier ? ' is-here' : ''}" style="left:${pct(from)};width:${(((to - from) / max) * 100).toFixed(1)}%"><em>${esc(tt.label)}</em></span>`;
    })
    .join('');
  const ticks = refs.map((r) => `<span class="tick" style="left:${pct(r.score)}" title="${esc(r.name)}: ${r.score}"><i></i><em>${esc(r.short ?? r.name)} ${r.score}</em></span>`).join('');
  const marker = fe?.score != null ? `<span class="marker" style="left:${pct(fe.score)}"><b>${esc(m.display_name)} ${fe.score}</b><i></i></span>` : '';
  const line = `<div class="numberline" role="img" aria-label="${esc(m.display_name)} scores ${fe?.score ?? 'unknown'} on the ${esc(d.frontier_basis?.name ?? 'index')}, which is ${esc(t?.label ?? 'unplaced')}. Hosted models: ${esc(refs.map((r) => `${r.name} ${r.score}`).join(', '))}.">
      <div class="bands">${bands}</div>${ticks}${marker}</div>`;
  el.innerHTML = `<div class="smarts-head"><h3>How smart is ${esc(m.display_name)}, really?</h3>${frontierScale(m, data, true)}</div>
    ${line}
    <p class="note dim numberline-key">Scale: Anthropic's Claude models (Haiku, Sonnet, Opus, Fable) and OpenAI's GPT-5.6 models (Luna, Terra, Sol).</p>
    <p class="note">${t ? esc(t.plain) + ' ' : ''}${fe?.basis ? `${esc(fe.basis)}${fe.url ? ` (<a href="${esc(fe.url)}" rel="noopener">source</a>)` : ''}. ` : ''}${d.frontier_basis?.url ? `Hosted models on the same index: <a href="${esc(d.frontier_basis.url)}" rel="noopener">${esc(d.frontier_basis.name ?? 'leaderboard')}</a>, checked ${esc(d.frontier_basis.checked ?? '')}. ` : ''}Cloud equivalent for pricing: ${esc(m.cloud_equivalent.name)}${m.cloud_equivalent.is_exact_match ? '' : ' (nearest hosted model, not the same one)'}.</p>`;
  layoutNumberLine();
  void state;
}

/**
 * Stagger the reference labels into as many rows as it takes for none to
 * overlap, measuring the real boxes so it survives any viewport width.
 */
export function layoutNumberLine() {
  const line = document.querySelector<HTMLElement>('.numberline');
  if (!line) return;
  const labels = [...line.querySelectorAll<HTMLElement>('.tick em')];
  labels.forEach((l) => (l.style.removeProperty('--row'), l.style.removeProperty('transform')));
  const rowEnds: number[] = [];
  const lineLeft = line.getBoundingClientRect().left;
  const lineWidth = line.getBoundingClientRect().width || 1;
  for (const label of labels) {
    const tick = label.parentElement!;
    const box = label.getBoundingClientRect();
    const tickX = tick.getBoundingClientRect().left + tick.getBoundingClientRect().width / 2 - lineLeft;
    let left = box.left - lineLeft;
    let right = box.right - lineLeft;
    // keep labels inside the track
    let shift = 0;
    if (left < 0) shift = -left;
    else if (right > lineWidth) shift = lineWidth - right;
    if (shift) {
      label.style.transform = `translateX(${shift.toFixed(1)}px)`;
      left += shift;
      right += shift;
    }
    let row = 0;
    while (row < rowEnds.length && left < rowEnds[row] + 10) row++;
    rowEnds[row] = right;
    label.style.setProperty('--row', String(row));
    // leader line from the tick down to a label that had to move
    const labelX = (left + right) / 2;
    label.style.setProperty('--lean', `${(tickX - labelX).toFixed(1)}px`);
  }
  line.style.setProperty('--rows', String(Math.max(1, rowEnds.length)));
}

function renderTimeCost(state: State, data: Dataset, view: View) {
  const c = view.calc;
  const el = $('#time-cost');
  if (!c || !view.throughput?.tokensPerSec) { el.innerHTML = ''; return; }
  const tm = c.timing;
  const n = data.defaults.typical_task_output_tokens;
  el.innerHTML = `<h3>Your time is not free</h3>
    <p>A ${fmtInt(n)}-token answer takes <b class="num">${fmtSeconds(tm.localSecondsPerTask)}</b> locally at ${fmtNum(view.throughput.tokensPerSec, 0)} tok/s, against <b class="num">${fmtSeconds(tm.cloudSecondsPerTask)}</b> from an API at ${state.cloudTps} tok/s.
    ${tm.speedRatio > 1
      ? `At your usage that is <b class="num">${fmtHours(tm.extraHoursPerDay)}</b> a day spent waiting that you wouldn’t otherwise. A cheaper answer you wait ${fmtNum(tm.speedRatio, 1)}× longer for is not obviously a win.`
      : `At these speeds local is not slower than the API, so there is no waiting penalty to weigh.`}</p>`;
}

/* ---------------- how this is calculated ---------------- */

function renderMath(state: State, data: Dataset, view: View) {
  const c = view.calc;
  const el = $('#math');
  if (!c || !view.model || !view.throughput) {
    el.innerHTML = `<p class="muted">Nothing to show until the inputs are complete.${view.blockers.length ? ` Missing: ${esc(view.blockers.join('; '))}.` : ''}</p>`;
    return;
  }
  const m = view.model, hw = view.hw, t = view.throughput, ce = m.cloud_equivalent;
  const tps = t.tokensPerSec!;
  const be = c.breakevenDays;
  const usage = view.capacity.effective;
  el.innerHTML = `
<pre class="formula">cloud_cost_per_day  = (${fmtInt(c.dailyInputTokens)} / 1,000,000 × $${ce.input_price_per_mtok})
                    + (${fmtInt(c.dailyOutputTokens)} / 1,000,000 × $${ce.output_price_per_mtok})
                    = ${fmtUsd(c.cloudCostPerDay, { cents: true })}

local_cost_per_day  = (${fmtInt(c.dailyOutputTokens)} / ${fmtNum(tps, 1)} tok/s / 3600) h
                      × ${hw.load_watts} W / 1000 × $${state.kwh}/kWh
                    = ${fmtNum(c.localGenerationHoursPerDay, 2)} h → ${fmtNum(c.localKwhPerDay, 3)} kWh → ${fmtUsd(c.localCostPerDay, { cents: true })}

daily_saving        = ${fmtUsd(c.cloudCostPerDay, { cents: true })} − ${fmtUsd(c.localCostPerDay, { cents: true })} = ${fmtUsd(c.dailySaving, { cents: true })}

breakeven_days      = ${fmtUsd(view.price)} / ${fmtUsd(c.dailySaving, { cents: true })} = ${be === null ? 'never (saving ≤ 0)' : `${fmtInt(be)} days (${fmtDuration(be)})`}
breakeven_tokens    = ${be === null ? '—' : `${fmtInt(be)} × ${fmtInt(usage)} = ${fmtTokens(c.breakevenTokens)} tokens`}</pre>
<dl class="sources">
  <dt>Hardware price</dt><dd>${view.priceIsCustom
    ? `${fmtUsd(view.price)} — <b>the price you entered</b>. ${hw.price_usd == null ? 'No list price is recorded for this configuration.' : `The list price in hardware.json is ${fmtUsd(hw.price_usd)}${hw.sources?.length ? ` (${links(hw.sources)})` : ''}.`}`
    : `${fmtUsd(view.price)} — hardware.json, <code>${esc(hw.id)}</code>${hw.sources?.length ? ` · ${links(hw.sources)}` : ''}`}</dd>
  <dt>Power under load</dt><dd>${hw.load_watts} W, <b>${esc((hw.load_watts_status ?? 'published').replace(/_/g, ' '))}</b> — hardware.json. ${esc(hw.load_watts_note ?? '')}</dd>
  <dt>Usable memory</dt><dd>${hw.usable_memory_gb} GB of ${hw.unified_memory_gb} GB. ${esc(hw.notes ?? '')}</dd>
  <dt>Local speed</dt><dd>${fmtNum(tps, 1)} tok/s, <b>${t.measurement}</b>. ${t.sourceUrl ? `<a href="${esc(t.sourceUrl)}" rel="noopener">${esc(t.source)}</a>` : esc(t.source)}${t.detail ? ` · ${esc(t.detail)}` : ''}</dd>
  <dt>Daily ceiling</dt><dd>${fmtNum(tps, 1)} tok/s × 86,400 s = ${fmtTokens(view.capacity.maxOutputPerDay)} output tokens a day; × (${state.ratio} + 1) = ${fmtTokens(view.capacity.maxTokensPerDay)} total.${view.capacity.capped ? ` Your ${fmtTokens(view.capacity.requested)} exceeds this, so ${fmtTokens(usage)} is used.` : ''} Prompt processing time is not counted, so the real ceiling is lower.</dd>
  <dt>API price</dt><dd>${esc(ce.name)}${ce.is_exact_match ? '' : ' (nearest hosted equivalent, not the same model)'}: $${ce.input_price_per_mtok} in / $${ce.output_price_per_mtok} out per million tokens — ${ce.source_url ? `<a href="${esc(ce.source_url)}" rel="noopener">${esc(ce.source)}</a>` : esc(ce.source)}${ce.checked ? `, checked ${esc(ce.checked)}` : ''}.</dd>
  <dt>Electricity</dt><dd>$${state.kwh}/kWh. ${esc(data.defaults.electricity.source)}</dd>
  <dt>Token split</dt><dd>${fmtInt(usage)} tokens a day at ${esc(ratioLabel(state.ratio))} → ${fmtInt(c.dailyInputTokens)} input, ${fmtInt(c.dailyOutputTokens)} output.</dd>
  <dt>Memory fit</dt><dd>${fmtGb(m.weights_gb)} weights + ${fmtGb(kvCacheGb(m, state.ctx))} KV cache at ${fmtCtx(state.ctx)} context ≤ ${hw.usable_memory_gb} GB usable. KV cache = 2 × ${m.architecture?.n_kv_heads} KV heads × ${m.architecture?.head_dim} head dim × 2 bytes × cached tokens per layer, over ${m.architecture?.n_layers} layers${m.architecture?.note ? `. ${esc(m.architecture.note)}` : ''}.</dd>
</dl>
<p class="note">Left out, all of which favour local slightly less than shown: prompt-processing time and its electricity, idle power when the machine is on but not generating, and API prompt caching, which cuts the input price on repeated context. Left out in local’s favour: resale value, and the other jobs the machine does.</p>`;
}

function links(urls: string[]): string {
  return urls.map((u, i) => `<a href="${esc(u)}" rel="noopener">source${urls.length > 1 ? ` ${i + 1}` : ''}</a>`).join(', ');
}

function renderSmallPrint(state: State, data: Dataset, view: View) {
  const c = view.calc;
  const items = [
    `<b>Electricity is not free.</b> Counted above at $${state.kwh}/kWh (${esc(data.defaults.electricity.country)} average; edit it). ${c ? `Here it is ${fmtUsd(c.localCostPerMonth)} a month.` : ''}`,
    `<b>Your time is not free.</b> ${c && view.throughput?.tokensPerSec ? `Local runs at ${fmtNum(view.throughput.tokensPerSec, 0)} tok/s against ${state.cloudTps} tok/s from an API. Details above.` : 'See the timing comparison once the inputs are complete.'}`,
    `<b>Resale value exists.</b> The hardware holds value and does other jobs. Break-even here treats the whole price as sunk, so it overstates the real loss.`,
    `<b>API prices fall.</b> This is calculated at today’s prices (checked ${esc(data.defaults.data_last_checked)}). They have historically dropped fast, so the real payback period is likely longer than shown.`,
    `<b>Frontier models aren’t on the list.</b> The best cloud models can’t be run locally at any of these price points. This compares like with like on open models; it is not an apples-to-apples swap for a frontier API.`,
  ];
  $('#small-print').innerHTML = items.map((i) => `<li>${i}</li>`).join('');
}

export { modelLabel };
