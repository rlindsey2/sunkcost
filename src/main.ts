import { data } from './data';
import { drawWaterline, layoutNumberLine, renderAll, shareUrl } from './render';
import { onSiteHost, sharePath } from './share';
import { submissionPayload } from './submissions';
import { CUSTOM_HW, parseState, serializeState, sliderToUsage, usageToSlider, type State } from './state';
import { OG_WIDTH, OG_HEIGHT } from './og';
import { fmtNum } from './format';
import { cardSvg } from './card';
import type { View } from './compute';
import './styles.css';

let state: State = parseState(location.search, data, location.pathname);
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
  // keep the address bar a shareable link: on the site, the pre-built page for this machine and model
  const onSite = onSiteHost(data);
  const target = onSite ? sharePath(state, view.model?.id, data) : `?${serializeState(state)}`;
  // some embeds (sandboxed frames) refuse history writes; the page must still work
  try {
    const current = onSite ? location.pathname + location.search : location.search;
    if (current !== target) history.replaceState(null, '', target);
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
  if (fam === CUSTOM_HW) {
    useCustomMachine();
    return;
  }
  const first = data.hardware.find((h) => h.family === fam && h.price_usd != null) ?? data.hardware.find((h) => h.family === fam);
  if (first) update({ hw: first.id, price: null, tps: null, tpsCtx: null });
});

/** Switch to a machine you describe; a speed measured on another machine doesn't carry over. */
function useCustomMachine() {
  update({ hw: CUSTOM_HW, price: null, tps: null, tpsCtx: null });
  document.querySelector<HTMLInputElement>('#custom-name')?.focus();
}
$<HTMLSelectElement>('#chip').addEventListener('change', (e) => {
  const chip = (e.target as HTMLSelectElement).value;
  const fam = view.hw.family;
  const same = data.hardware.filter((h) => h.family === fam && h.chip === chip);
  const pick = same.find((h) => h.unified_memory_gb === view.hw.unified_memory_gb) ?? same.find((h) => h.price_usd != null) ?? same[0];
  if (pick) update({ hw: pick.id, price: null, tps: null, tpsCtx: null });
});
$<HTMLSelectElement>('#memory').addEventListener('change', (e) => {
  const wrap = document.querySelector<HTMLElement>('#price-wrap');
  if (wrap) delete wrap.dataset.open;
  update({ hw: (e.target as HTMLSelectElement).value, price: null, tps: null, tpsCtx: null });
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
  queueSubmission();
});

/** A number you may leave blank: blank or nonsense means "not given". */
function numberOrNull(el: HTMLInputElement, round: boolean): number | null {
  const raw = el.value.trim();
  const n = Number(raw);
  if (raw === '' || !Number.isFinite(n) || n <= 0) return null;
  return round ? Math.round(n) : n;
}
const onNumber = (sel: string, key: 'customMem' | 'customWatts' | 'customBw' | 'tps' | 'sub', round: boolean) =>
  $<HTMLInputElement>(sel).addEventListener('input', (e) => {
    update({ [key]: numberOrNull(e.target as HTMLInputElement, round) } as Partial<State>);
    queueSubmission();
  });
onNumber('#custom-mem', 'customMem', false);
onNumber('#custom-watts', 'customWatts', true);
onNumber('#custom-bw', 'customBw', true);
onNumber('#your-tps', 'tps', false);
onNumber('#sub', 'sub', true);
$<HTMLSelectElement>('#tps-ctx').addEventListener('change', (e) => {
  const v = (e.target as HTMLSelectElement).value;
  update({ tpsCtx: v === '' ? null : Number(v) });
  queueSubmission();
});
$<HTMLSelectElement>('#kv').addEventListener('change', (e) => update({ kv: (e.target as HTMLSelectElement).value }));
$<HTMLInputElement>('#custom-name').addEventListener('input', (e) => {
  update({ customName: (e.target as HTMLInputElement).value.slice(0, 40) });
  queueSubmission();
});

document.addEventListener('click', (e) => {
  // shortcuts to an input: open the assumptions it lives in and put the cursor there
  const focusBtn = (e.target as HTMLElement).closest<HTMLElement>('[data-focus]');
  if (focusBtn) {
    const input = document.getElementById(focusBtn.dataset.focus!) as HTMLInputElement | null;
    const details = input?.closest('details');
    if (details) details.open = true;
    input?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    input?.focus({ preventScroll: true });
    return;
  }
  if ((e.target as HTMLElement).closest('[data-custom]')) {
    useCustomMachine();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-hw],[data-model],#price-reset,#price-toggle,#show-older,#hide-older');
  if (t?.id === 'show-older' || t?.id === 'hide-older') {
    update({ showOlder: t.id === 'show-older' });
    return;
  }
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
  if (t.dataset.hw) update({ hw: t.dataset.hw, price: null, tps: null, tpsCtx: null });
  if (t.dataset.model && t.getAttribute('aria-disabled') !== 'true' && !(e.target as HTMLElement).closest('a')) {
    // a speed you measured belongs to the model you measured it on
    update({ model: t.dataset.model, ...(t.dataset.model !== state.model ? { tps: null, tpsCtx: null } : {}) });
    document.querySelector<HTMLElement>(`[data-model="${t.dataset.model}"]`)?.focus();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-model]');
  if (t && t.getAttribute('aria-disabled') !== 'true') {
    e.preventDefault();
    update({ model: t.dataset.model!, ...(t.dataset.model !== state.model ? { tps: null, tpsCtx: null } : {}) });
    document.querySelector<HTMLElement>(`[data-model="${t.dataset.model}"]`)?.focus();
  }
});

/* ---- what people enter ---- */

// Numbers you type in (not ones arriving in a shared link) are sent once you stop typing, without
// cookies or an identifier, so the options and estimates can improve. Browsers set not to be
// tracked send nothing.
let pendingSubmission: number | undefined;
let lastSubmission = '';
function queueSubmission() {
  clearTimeout(pendingSubmission);
  pendingSubmission = window.setTimeout(sendSubmission, 4000);
}
function sendSubmission() {
  pendingSubmission = undefined;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (!onSiteHost(data) || nav.globalPrivacyControl || navigator.doNotTrack === '1') return;
  const payload = submissionPayload(state);
  if (!payload) return;
  const body = JSON.stringify(payload);
  if (body === lastSubmission) return;
  lastSubmission = body;
  try {
    fetch('/api/submit', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch {
    /* recording is best effort; the calculator never depends on it */
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && pendingSubmission !== undefined) {
    clearTimeout(pendingSubmission);
    sendSubmission();
  }
});

/* ---- share ---- */

$('#copy-link').addEventListener('click', async () => {
  const btn = $('#copy-link');
  try {
    await navigator.clipboard.writeText(shareUrl(state, data, view.model?.id));
    btn.textContent = 'Copied';
  } catch {
    window.prompt('Copy this link', shareUrl(state, data, view.model?.id));
  }
  setTimeout(() => (btn.textContent = 'Copy link'), 1600);
});

// absent in the single-file build: sandboxed hosts cannot save a file the page makes
document.querySelector('#download-card')?.addEventListener('click', async () => {
  if (!view.calc || view.price == null) return;
  // the same card the share links preview, drawn for exactly what is on screen
  const svg = cardSvg({ ...state, model: view.model!.id }, data);
  if (!svg) return;
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
  state = parseState(location.search, data, location.pathname);
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
