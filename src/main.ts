import { data } from './data';
import { drawWaterline, layoutNumberLine, renderAll, shareUrl } from './render';
import { parseState, serializeState, sliderToUsage, usageToSlider, type State } from './state';
import { renderOgCard, ogFigures, OG_WIDTH, OG_HEIGHT } from './og';
import { fmtDuration, fmtNum } from './format';
import type { View } from './compute';
import './styles.css';

let state: State = parseState(location.search, data);
let view: View;

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const u = data.defaults.usage;

function update(patch: Partial<State> = {}) {
  state = { ...state, ...patch };
  view = renderAll(state, data);
  const mv = document.querySelector('#minibar-verdict');
  const mc = document.querySelector('#minibar-config');
  if (mv) mv.textContent = view.verdict.headline;
  if (mc) mc.textContent = view.configLine;
  for (const el of document.querySelectorAll<HTMLInputElement>("input[type='range']")) {
    const min = Number(el.min || 0);
    const max = Number(el.max || 100);
    el.style.setProperty('--pct', max === min ? '0%' : `${(((Number(el.value) - min) / (max - min)) * 100).toFixed(2)}%`);
  }
  const qs = serializeState(state);
  // some embeds (sandboxed frames) refuse history writes; the page must still work
  try {
    if (location.search !== `?${qs}`) history.replaceState(null, '', `?${qs}`);
  } catch {
    /* ignore */
  }
}

/* ---- controls ---- */

const usage = $<HTMLInputElement>('#usage');
usage.min = '0';
usage.max = '1000';
usage.value = String(usageToSlider(state.usage, u.min_tokens_per_day, u.max_tokens_per_day));
usage.addEventListener('input', () => update({ usage: sliderToUsage(Number(usage.value), u.min_tokens_per_day, u.max_tokens_per_day) }));

$<HTMLSelectElement>('#usecase').addEventListener('change', (e) => {
  const v = (e.target as HTMLSelectElement).value;
  if (v === 'custom') {
    $('#ratio-custom').hidden = false;
    $<HTMLInputElement>('#ratio').focus();
    return;
  }
  update({ ratio: Number(v) });
});
$<HTMLInputElement>('#ratio').addEventListener('input', (e) => update({ ratio: Number((e.target as HTMLInputElement).value) }));
$<HTMLInputElement>('#ctxslider').addEventListener('input', (e) => {
  const idx = Number((e.target as HTMLInputElement).value);
  update({ ctx: data.defaults.context.options[idx] ?? state.ctx });
});
$<HTMLInputElement>('#kwh').addEventListener('input', (e) => {
  const v = Number((e.target as HTMLInputElement).value);
  if (Number.isFinite(v) && v >= 0) update({ kwh: v });
});
$<HTMLInputElement>('#cloud-tps').addEventListener('input', (e) => {
  const v = Number((e.target as HTMLInputElement).value);
  if (Number.isFinite(v) && v > 0) update({ cloudTps: v });
});
$<HTMLSelectElement>('#family').addEventListener('change', (e) => {
  const fam = (e.target as HTMLSelectElement).value;
  const first = data.hardware.find((h) => h.family === fam && h.price_usd != null) ?? data.hardware.find((h) => h.family === fam);
  if (first) update({ hw: first.id, price: null });
});
$<HTMLSelectElement>('#chip').addEventListener('change', (e) => {
  const chip = (e.target as HTMLSelectElement).value;
  const fam = view.hw.family;
  const same = data.hardware.filter((h) => h.family === fam && h.chip === chip);
  const pick = same.find((h) => h.unified_memory_gb === view.hw.unified_memory_gb) ?? same.find((h) => h.price_usd != null) ?? same[0];
  if (pick) update({ hw: pick.id, price: null });
});
$<HTMLSelectElement>('#memory').addEventListener('change', (e) => {
  const wrap = document.querySelector<HTMLElement>('#price-wrap');
  if (wrap) delete wrap.dataset.open;
  update({ hw: (e.target as HTMLSelectElement).value, price: null });
});
$<HTMLInputElement>('#decline-on').addEventListener('change', (e) => {
  const rate = Number($<HTMLSelectElement>('#decline-rate').value) || data.defaults.api_decline.default_rate_per_year;
  update({ decline: (e.target as HTMLInputElement).checked ? rate : 0 });
});
$<HTMLSelectElement>('#decline-rate').addEventListener('change', (e) => update({ decline: Number((e.target as HTMLSelectElement).value) }));
$<HTMLSelectElement>('#model-family').addEventListener('change', (e) => update({ family: (e.target as HTMLSelectElement).value }));
$<HTMLSelectElement>('#model-sort').addEventListener('change', (e) => update({ sort: (e.target as HTMLSelectElement).value }));
$<HTMLInputElement>('#price').addEventListener('input', (e) => {
  const raw = (e.target as HTMLInputElement).value.trim();
  const n = Number(raw);
  update({ price: raw === '' || !Number.isFinite(n) || n <= 0 ? null : Math.round(n) });
});

document.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-hw],[data-model],#price-reset,#price-toggle');
  if (t?.id === 'price-toggle') {
    const wrap = document.querySelector<HTMLElement>('#price-wrap')!;
    wrap.dataset.open = '1';
    wrap.hidden = false;
    document.querySelector<HTMLInputElement>('#price')?.focus();
    return;
  }
  if (!t) return;
  if (t.id === 'price-reset') {
    const wrap = document.querySelector<HTMLElement>('#price-wrap');
    if (wrap) delete wrap.dataset.open;
    update({ price: null });
    return;
  }
  // a price you paid for one machine says nothing about another, so it clears on switch
  if (t.dataset.hw) update({ hw: t.dataset.hw, price: null });
  if (t.dataset.model && t.getAttribute('aria-disabled') !== 'true' && !(e.target as HTMLElement).closest('a')) {
    update({ model: t.dataset.model });
    document.querySelector<HTMLElement>(`[data-model="${t.dataset.model}"]`)?.focus();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-model]');
  if (t && t.getAttribute('aria-disabled') !== 'true') {
    e.preventDefault();
    update({ model: t.dataset.model! });
    document.querySelector<HTMLElement>(`[data-model="${t.dataset.model}"]`)?.focus();
  }
});

/* ---- share ---- */

$('#copy-link').addEventListener('click', async () => {
  const btn = $('#copy-link');
  try {
    await navigator.clipboard.writeText(shareUrl(state));
    btn.textContent = 'Copied';
  } catch {
    window.prompt('Copy this link', shareUrl(state));
  }
  setTimeout(() => (btn.textContent = 'Copy link'), 1600);
});

// absent in the single-file build: sandboxed hosts cannot save a file the page makes
document.querySelector('#download-card')?.addEventListener('click', async () => {
  if (!view.calc || view.price == null) return;
  const c = view.calc;
  const svg = renderOgCard({
    configLine: view.configLine,
    usageLine: view.usageLine,
    verdict: view.verdict.headline,
    subLine: view.verdict.sub,
    devicePriceUsd: view.price,
    dailySaving: c.dailySaving,
    breakevenDays: c.breakevenDays,
    maxYears: data.defaults.waterline_max_years,
    dataChecked: data.defaults.data_last_checked,
    figures: ogFigures({
      devicePriceUsd: view.price,
      cloudCostPerMonth: c.cloudCostPerMonth,
      localTokensPerSec: view.throughput?.tokensPerSec ?? null,
      measurement: view.throughput?.measurement ?? 'unknown',
      breakevenLabel: c.breakevenDays === null ? 'never' : fmtDuration(c.breakevenDays),
    }),
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
  });
  const png = await svgToPng(svg, OG_WIDTH, OG_HEIGHT);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(png);
  a.download = `sunkcost-${state.hw}-${state.model}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
});

async function svgToPng(svg: string, w: number, h: number): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('svg load failed')); img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = w * 2;
    canvas.height = h * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0);
    return await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

// the chart is drawn at the panel's real pixel size, so it must follow it
const heroWater = document.querySelector('#hero-water');
if (heroWater) {
  let frame = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawWaterline(data, view));
  }).observe(heroWater);
}
window.addEventListener('resize', () => layoutNumberLine());

window.addEventListener('popstate', () => {
  state = parseState(location.search, data);
  usage.value = String(usageToSlider(state.usage, u.min_tokens_per_day, u.max_tokens_per_day));
  update();
});

/* ---- theme ---- */

const THEME_KEY = 'sunkcost.theme';
function applyTheme(t: 'light' | 'dark' | null) {
  if (t) document.documentElement.setAttribute('data-theme', t);
  else document.documentElement.removeAttribute('data-theme');
}
try {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') applyTheme(saved);
} catch {
  /* private mode; the OS setting still applies */
}
$('#theme-toggle').addEventListener('click', () => {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = document.documentElement.getAttribute('data-theme') ?? (systemDark ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* ignore */
  }
});

/* ---- slider fill: WebKit cannot style the filled part of a track on its own ---- */

const sliders = [...document.querySelectorAll<HTMLInputElement>("input[type='range']")];
function paintSlider(el: HTMLInputElement) {
  const min = Number(el.min || 0);
  const max = Number(el.max || 100);
  const pct = max === min ? 0 : ((Number(el.value) - min) / (max - min)) * 100;
  el.style.setProperty('--pct', `${pct.toFixed(2)}%`);
}
for (const el of sliders) {
  paintSlider(el);
  el.addEventListener('input', () => paintSlider(el));
}

/* ---- the verdict follows you up the page on a phone ---- */

const minibar = $('#minibar');
const verdictPane = document.querySelector('#zone-breakeven')!;
new IntersectionObserver(
  ([entry]) => {
    minibar.hidden = entry.isIntersecting || window.innerWidth >= 900;
  },
  { rootMargin: '-40% 0px 0px 0px' },
).observe(verdictPane);

$('#data-checked').textContent = data.defaults.data_last_checked;
$('#efficiency-note').textContent = `${fmtNum(data.defaults.estimate.efficiency_dense * 100, 0)}% for dense models or ${fmtNum(data.defaults.estimate.efficiency_moe * 100, 0)}% for mixture-of-experts (calibrated on the measured pairs in the data)`;
update();
