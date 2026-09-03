import { computeView, formatUsageShort, hardwareLabel, modelLabel, usageLabel, type View } from './compute';
import { esc, fmtDuration, fmtGb, fmtHours, fmtInt, fmtNum, fmtSeconds, fmtTokens, fmtUsd } from './format';
import { kvCacheGb } from './fit';
import { serializeState, type State } from './state';
import { CAPABILITY_KEYS, CAPABILITY_LABELS, type Dataset, type Hardware, type Rating } from './types';
import { renderWaterline } from './waterline';

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

export function renderAll(state: State, data: Dataset): View {
  const view = computeView(state, data);
  renderMachine(state, data, view);
  renderControls(state, data, view);
  renderModels(state, data, view);
  renderVerdict(state, data, view);
  renderFigures(state, data, view);
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

/* ---------------- zone 1: machine ---------------- */

function renderMachine(state: State, data: Dataset, view: View) {
  const families = [...new Set(data.hardware.map((h) => h.family))];
  const famSel = $<HTMLSelectElement>('#family');
  if (famSel.options.length !== families.length) {
    famSel.innerHTML = families.map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join('');
  }
  famSel.value = view.hw.family;

  const configs = data.hardware.filter((h) => h.family === view.hw.family);
  const gens: Array<'current' | 'previous'> = ['current', 'previous'];
  $('#configs').innerHTML = gens
    .map((gen) => {
      const inGen = configs.filter((h) => (h.generation ?? 'current') === gen);
      if (!inGen.length) return '';
      const chips = [...new Set(inGen.map((h) => h.chip))];
      const label = gen === 'previous'
        ? `<div class="gen-label">Previous generation — discontinued; launch prices, for refurbished or used comparison</div>`
        : configs.some((h) => h.generation === 'previous') ? `<div class="gen-label" style="border-top:0;padding-top:0">Current lineup</div>` : '';
      return label + chips
        .map((chip) => {
          const rows = inGen.filter((h) => h.chip === chip);
          const bw = [...new Set(rows.map((h) => h.memory_bandwidth_gbs))].filter(Boolean);
          return `<div class="chip-group">
        <div class="chip-name">${esc(chip)}${bw.length ? ` <span class="muted">· ${bw.join('–')} GB/s</span>` : ''}</div>
        <div class="configs" role="radiogroup" aria-label="${esc(chip)} memory configurations">
          ${rows.map((h) => configButton(h, h.id === view.hw.id)).join('')}
        </div>
      </div>`;
        })
        .join('');
    })
    .join('');
  const status = view.hw.status ? `<p class="muted small" style="margin-top:8px">${esc(hardwareLabel(view.hw))}: ${esc(view.hw.status)}${view.hw.TODO ? ` <span class="todo">TODO: ${esc(view.hw.TODO)}</span>` : ''}</p>` : '';
  $('#hw-status').innerHTML = status;
}

function configButton(h: Hardware, selected: boolean): string {
  const price = h.price_usd == null ? '<span class="todo">price unknown</span>' : fmtUsd(h.price_usd);
  const variant = h.chip_variant ? `<span class="muted small">${esc(h.chip_variant)}</span>` : '';
  return `<button type="button" role="radio" aria-checked="${selected}" class="config${selected ? ' is-selected' : ''}" data-hw="${esc(h.id)}">
    <span class="config-mem num">${h.unified_memory_gb} GB</span>
    <span class="config-price num">${price}</span>
    ${variant}
  </button>`;
}

/* ---------------- controls ---------------- */

function renderControls(state: State, data: Dataset, view: View) {
  const u = data.defaults.usage;
  const out = state.usage / (state.ratio + 1);
  $('#usage-readout').innerHTML = `<b class="num">${formatUsageShort(state.usage)}</b> tokens a day <span class="muted">— ${esc(usageLabel(state.usage, data))}</span>`;
  $('#ratio-readout').innerHTML = `<b class="num">${state.ratio}:1</b> input to output <span class="muted">— ${fmtTokens(state.usage - out)} in, ${fmtTokens(out)} out</span>`;
  const ratio = $<HTMLInputElement>('#ratio');
  ratio.min = String(u.min_input_to_output_ratio);
  ratio.max = String(u.max_input_to_output_ratio);
  if (Number(ratio.value) !== state.ratio) ratio.value = String(state.ratio);

  const ctx = $<HTMLSelectElement>('#ctx');
  if (!ctx.options.length) {
    ctx.innerHTML = data.defaults.context.options.map((c) => `<option value="${c}">${c >= 1024 ? `${c / 1024}k` : c} tokens</option>`).join('');
  }
  ctx.value = String(state.ctx);
  const kwh = $<HTMLInputElement>('#kwh');
  if (Number(kwh.value) !== state.kwh) kwh.value = String(state.kwh);
  const cs = $<HTMLInputElement>('#cloud-tps');
  if (Number(cs.value) !== state.cloudTps) cs.value = String(state.cloudTps);
  $('#kwh-note').textContent = `Default ${data.defaults.electricity.default_price_per_kwh_usd.toFixed(2)}/kWh is the ${data.defaults.electricity.country} residential average.`;
  void view;
}

/* ---------------- zone 2: models ---------------- */

function dot(r: Rating, key: string): string {
  const label = CAPABILITY_LABELS[key as keyof typeof CAPABILITY_LABELS];
  return `<span class="dot dot-${r}" title="${esc(label.long)}: ${r}" aria-label="${esc(label.short)}: ${r}"></span>`;
}

function renderModels(state: State, data: Dataset, view: View) {
  const hw = view.hw;
  const rows = view.rows;
  const list = rows
    .map(({ model: m, fit, throughput: t }) => {
      const selected = view.model?.id === m.id;
      const kv = kvCacheGb(m, state.ctx);
      const disabled = fit.status !== 'fits';
      const tps = t.tokensPerSec == null ? '<span class="todo">unknown</span>' : `<span class="num">${fmtNum(t.tokensPerSec, 0)}</span> tok/s`;
      const meas = t.measurement === 'measured' ? '<span class="tag tag-measured">measured</span>' : t.measurement === 'estimated' ? '<span class="tag tag-estimated">estimated</span>' : '';
      const ce = m.cloud_equivalent;
      const cloud = ce.input_price_per_mtok == null
        ? `<span class="todo">API price unknown</span>`
        : `<span class="num">$${ce.input_price_per_mtok}</span> in / <span class="num">$${ce.output_price_per_mtok}</span> out per 1M`;
      const cloudName = ce.is_exact_match ? esc(ce.name) : `nearest: ${esc(ce.name)}`;
      const reason = fit.status === 'nearly' ? `<div class="fit-reason">Nearly: ${esc(fit.reason)}.</div>` : fit.status === 'unknown' ? `<div class="fit-reason">Fit unknown: ${esc(fit.reason)}.</div>` : '';
      return `<div class="model${selected ? ' is-selected' : ''}${disabled ? ' is-disabled' : ''}" role="radio" aria-checked="${selected}" tabindex="${disabled ? -1 : 0}" data-model="${esc(m.id)}" ${disabled ? 'aria-disabled="true"' : ''}>
        <div class="model-head">
          <span class="model-name">${esc(m.display_name)} <span class="quant">${esc(m.quantisation)}</span></span>
          <span class="model-tps">${tps} ${meas}</span>
        </div>
        <div class="model-meta">
          <span class="num">${fmtGb(fit.needGb)}</span> at ${state.ctx / 1024}k context <span class="muted">(${fmtGb(m.weights_gb)} weights + ${fmtGb(kv)} KV cache)</span>
        </div>
        <div class="model-caps" aria-label="capability ratings">
          ${CAPABILITY_KEYS.map((k) => dot(m.capabilities[k], k)).join('')}
          <span class="cap-note">${esc(m.capability_note)}</span>
        </div>
        <div class="model-cloud"><span class="muted">Cloud equivalent:</span> ${cloudName} · ${cloud}</div>
        ${reason}
      </div>`;
    })
    .join('');
  const hidden = view.hiddenCount
    ? `<p class="muted small">${view.hiddenCount} more model${view.hiddenCount === 1 ? '' : 's'} in the data won’t fit ${esc(hardwareLabel(hw))} at ${state.ctx / 1024}k context.</p>`
    : '';
  const fitsCount = rows.filter((r) => r.fit.status === 'fits').length;
  $('#models').innerHTML = `<p class="muted small">${fitsCount} model${fitsCount === 1 ? '' : 's'} fit in ${hw.usable_memory_gb ?? '?'} GB usable memory${hw.notes ? ` <span class="hint" title="${esc(hw.notes)}">?</span>` : ''}. Greyed rows nearly fit; the reason is shown.</p>${list}${hidden}`;
}

/* ---------------- zone 3: verdict ---------------- */

function renderVerdict(state: State, data: Dataset, view: View) {
  const c = view.calc;
  const wl = $('#waterline');
  if (c && view.hw.price_usd != null) {
    wl.innerHTML = renderWaterline({
      devicePriceUsd: view.hw.price_usd,
      dailySaving: c.dailySaving,
      breakevenDays: c.breakevenDays,
      maxYears: data.defaults.waterline_max_years,
      width: 800,
      height: 340,
      markerDays: 365.25,
    });
    wl.classList.remove('is-empty');
  } else {
    wl.innerHTML = '';
    wl.classList.add('is-empty');
  }
  $('#verdict').innerHTML = `<h2 class="verdict-headline verdict-${view.verdict.kind}">${esc(view.verdict.headline)}</h2>
    ${view.verdict.sub ? `<p class="verdict-sub">${esc(view.verdict.sub)}</p>` : ''}
    <p class="verdict-config muted">${esc(view.configLine)} · ${esc(view.usageLine)}</p>`;
  const url = shareUrl(state);
  const x = `https://twitter.com/intent/tweet?${new URLSearchParams({ text: shareText(view), url }).toString()}`;
  $<HTMLAnchorElement>('#share-x').href = x;
}

export function shareUrl(state: State): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}?${serializeState(state)}`;
}

export function shareText(view: View): string {
  const bits = [view.configLine + '.', view.verdict.headline];
  if (view.unit) bits.push(`That’s ${view.unit.text}.`);
  return bits.join(' ');
}

function renderFigures(state: State, data: Dataset, view: View) {
  const c = view.calc;
  const t = view.throughput;
  const figs: [string, string, string?][] = [
    ['Hardware', view.hw.price_usd == null ? 'unknown' : fmtUsd(view.hw.price_usd)],
    ['API cost per month', c ? fmtUsd(c.cloudCostPerMonth) : '—', view.model ? `${view.model.cloud_equivalent.name} on OpenRouter` : undefined],
    ['Electricity per month', c ? fmtUsd(c.localCostPerMonth) : '—', view.hw.load_watts ? `${view.hw.load_watts} W under load${view.hw.load_watts_status === 'stand_in' ? ' (stand-in figure)' : ''}` : undefined],
    ['Local speed', t?.tokensPerSec == null ? 'unknown' : `${fmtNum(t.tokensPerSec, 0)} tok/s`, t ? t.measurement : undefined],
    ['Break-even', c ? (c.breakevenDays === null ? 'never' : fmtDuration(c.breakevenDays)) : '—', c?.breakevenTokens != null ? `${fmtTokens(c.breakevenTokens)} tokens` : undefined],
    ['After 12 months', c ? netAfter(view.hw.price_usd!, c.dailySaving, 365.25) : '—'],
  ];
  $('#figures').innerHTML = figs
    .map(([k, v, sub]) => `<div class="fig"><div class="fig-k">${esc(k)}</div><div class="fig-v num">${esc(v)}</div>${sub ? `<div class="fig-s">${esc(sub)}</div>` : ''}</div>`)
    .join('');
  void state; void data;
}

function netAfter(price: number, dailySaving: number, days: number): string {
  const v = -price + dailySaving * days;
  return v < 0 ? `${fmtUsd(v)} underwater` : `${fmtUsd(v)} ahead`;
}

function renderTimeCost(state: State, data: Dataset, view: View) {
  const c = view.calc;
  const el = $('#time-cost');
  if (!c || !view.throughput?.tokensPerSec) {
    el.innerHTML = '';
    return;
  }
  const tm = c.timing;
  const faster = tm.speedRatio > 1;
  const n = data.defaults.typical_task_output_tokens;
  el.innerHTML = `
    <h3>Your time is not free</h3>
    <p>A ${fmtInt(n)}-token answer takes <b class="num">${fmtSeconds(tm.localSecondsPerTask)}</b> locally at ${fmtNum(view.throughput.tokensPerSec, 0)} tok/s, against <b class="num">${fmtSeconds(tm.cloudSecondsPerTask)}</b> from an API at ${state.cloudTps} tok/s.
    ${faster
      ? `At your usage that is <b class="num">${fmtHours(tm.extraHoursPerDay)}</b> a day spent waiting that you wouldn’t otherwise. A cheaper answer you wait ${fmtNum(tm.speedRatio, 1)}× longer for is not obviously a win.`
      : `At these speeds local is not slower than the API, so there is no waiting penalty to weigh.`}
    </p>`;
}

/* ---------------- how this is calculated ---------------- */

function renderMath(state: State, data: Dataset, view: View) {
  const c = view.calc;
  const el = $('#math');
  if (!c || !view.model || !view.throughput) {
    el.innerHTML = `<p class="muted">Nothing to show until the inputs are complete.${view.blockers.length ? ` Missing: ${esc(view.blockers.join('; '))}.` : ''}</p>`;
    return;
  }
  const m = view.model;
  const hw = view.hw;
  const t = view.throughput;
  const ce = m.cloud_equivalent;
  const tps = t.tokensPerSec!;
  const be = c.breakevenDays;
  el.innerHTML = `
<pre class="formula">cloud_cost_per_day  = (${fmtInt(c.dailyInputTokens)} / 1,000,000 × $${ce.input_price_per_mtok})
                    + (${fmtInt(c.dailyOutputTokens)} / 1,000,000 × $${ce.output_price_per_mtok})
                    = ${fmtUsd(c.cloudCostPerDay, { cents: true })}

local_cost_per_day  = (${fmtInt(c.dailyOutputTokens)} / ${fmtNum(tps, 1)} tok/s / 3600) h
                      × ${hw.load_watts} W / 1000 × $${state.kwh}/kWh
                    = ${fmtNum(c.localGenerationHoursPerDay, 2)} h × ${fmtNum(c.localKwhPerDay, 3)} kWh… = ${fmtUsd(c.localCostPerDay, { cents: true })}

daily_saving        = ${fmtUsd(c.cloudCostPerDay, { cents: true })} − ${fmtUsd(c.localCostPerDay, { cents: true })} = ${fmtUsd(c.dailySaving, { cents: true })}

breakeven_days      = ${fmtUsd(hw.price_usd)} / ${fmtUsd(c.dailySaving, { cents: true })} = ${be === null ? 'never (saving ≤ 0)' : `${fmtInt(be)} days (${fmtDuration(be)})`}
breakeven_tokens    = ${be === null ? '—' : `${fmtInt(be)} × ${fmtInt(state.usage)} = ${fmtTokens(c.breakevenTokens)} tokens`}</pre>
<dl class="sources">
  <dt>Hardware price</dt><dd>${fmtUsd(hw.price_usd)} — hardware.json, <code>${esc(hw.id)}</code>${hw.sources?.length ? ` · ${links(hw.sources)}` : ''}</dd>
  <dt>Power under load</dt><dd>${hw.load_watts} W, <b>${esc((hw.load_watts_status ?? 'published').replace(/_/g, ' '))}</b> — hardware.json. ${esc(hw.load_watts_note ?? '')}</dd>
  <dt>Usable memory</dt><dd>${hw.usable_memory_gb} GB of ${hw.unified_memory_gb} GB. ${esc(hw.notes ?? '')}</dd>
  <dt>Local speed</dt><dd>${fmtNum(tps, 1)} tok/s, <b>${t.measurement}</b>. ${t.sourceUrl ? `<a href="${esc(t.sourceUrl)}" rel="noopener">${esc(t.source)}</a>` : esc(t.source)}${t.detail ? ` · ${esc(t.detail)}` : ''}</dd>
  <dt>API price</dt><dd>${esc(ce.name)}${ce.is_exact_match ? '' : ' (nearest hosted equivalent, not the same model)'}: $${ce.input_price_per_mtok} in / $${ce.output_price_per_mtok} out per million tokens — ${ce.source_url ? `<a href="${esc(ce.source_url)}" rel="noopener">${esc(ce.source)}</a>` : esc(ce.source)}${ce.checked ? `, checked ${esc(ce.checked)}` : ''}.</dd>
  <dt>Electricity</dt><dd>$${state.kwh}/kWh. ${esc(data.defaults.electricity.source)}</dd>
  <dt>Token split</dt><dd>${fmtInt(state.usage)} tokens a day at ${state.ratio}:1 → ${fmtInt(c.dailyInputTokens)} input, ${fmtInt(c.dailyOutputTokens)} output.</dd>
  <dt>Memory fit</dt><dd>${fmtGb(m.weights_gb)} weights + ${fmtGb(kvCacheGb(m, state.ctx))} KV cache at ${state.ctx / 1024}k context ≤ ${hw.usable_memory_gb} GB usable. KV cache = 2 × ${m.architecture?.n_kv_heads} KV heads × ${m.architecture?.head_dim} head dim × 2 bytes × cached tokens per layer, over ${m.architecture?.n_layers} layers${m.architecture?.note ? `. ${esc(m.architecture.note)}` : ''}.</dd>
  ${view.unit ? `<dt>Human unit</dt><dd>${fmtTokens(c.breakevenTokens)} tokens ÷ ${fmtTokens(view.unit.unitTokens)} tokens per ${esc(view.unit.unit.singular)} (${fmtInt(view.unit.unit.words ?? 0)} words × ${data.units.tokens_per_word} tokens/word) ≈ ${view.unit.count}.</dd>` : ''}
</dl>
<p class="muted small">Left out, all of which favour local slightly less than shown: prompt-processing time and its electricity, idle power when the machine is on but not generating, and API prompt caching, which cuts the input price on repeated context. Left out in local’s favour: resale value, and the other jobs the machine does.</p>`;
}

function links(urls: string[]): string {
  return urls.map((u, i) => `<a href="${esc(u)}" rel="noopener">source${urls.length > 1 ? ` ${i + 1}` : ''}</a>`).join(', ');
}

/* ---------------- honesty ---------------- */

function renderSmallPrint(state: State, data: Dataset, view: View) {
  const c = view.calc;
  const items = [
    `<b>Electricity is not free.</b> Counted above at $${state.kwh}/kWh (${esc(data.defaults.electricity.country)} average; edit it). ${c ? `Here it is ${fmtUsd(c.localCostPerMonth)} a month.` : ''}`,
    `<b>Your time is not free.</b> ${c && view.throughput?.tokensPerSec ? `Local runs at ${fmtNum(view.throughput.tokensPerSec, 0)} tok/s against ${state.cloudTps} tok/s from an API. Details above.` : 'See the timing comparison once the inputs are complete.'}`,
    `<b>Resale value exists.</b> A Mac holds value and does other jobs. Break-even here treats the whole price as sunk, so it overstates the real loss.`,
    `<b>API prices fall.</b> This is calculated at today’s prices (checked ${esc(data.defaults.data_last_checked)}). They have historically dropped fast, so the real payback period is likely longer than shown.`,
    `<b>Frontier models aren’t on the list.</b> The best cloud models can’t be run locally at any of these price points. This compares like with like on open models; it is not an apples-to-apples swap for a frontier API.`,
  ];
  $('#small-print').innerHTML = items.map((i) => `<li>${i}</li>`).join('');
}
