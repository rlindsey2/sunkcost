import { data } from './data';
import { renderAll, shareUrl, shareText } from './render';
import { parseState, serializeState, sliderToUsage, usageToSlider, type State } from './state';
import { renderOgCard, ogFigures, OG_WIDTH, OG_HEIGHT } from './og';
import { fmtDuration, fmtNum } from './format';
import type { View } from './compute';
import './styles.css';

let state: State = parseState(location.search, data);
let view: View;

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const u = data.defaults.usage;

function update(patch: Partial<State> = {}, opts: { pushUrl?: boolean } = {}) {
  state = { ...state, ...patch };
  view = renderAll(state, data);
  // keep the URL in step with the config so every state is a link
  const qs = serializeState(state);
  if (location.search !== `?${qs}`) history.replaceState(null, '', `?${qs}`);
  void opts;
}

/* ---- wire controls (rendered once in index.html) ---- */

const usage = $<HTMLInputElement>('#usage');
usage.min = '0';
usage.max = '1000';
usage.value = String(usageToSlider(state.usage, u.min_tokens_per_day, u.max_tokens_per_day));
usage.addEventListener('input', () => update({ usage: sliderToUsage(Number(usage.value), u.min_tokens_per_day, u.max_tokens_per_day) }));

$<HTMLInputElement>('#ratio').addEventListener('input', (e) => update({ ratio: Number((e.target as HTMLInputElement).value) }));
$<HTMLSelectElement>('#ctx').addEventListener('change', (e) => update({ ctx: Number((e.target as HTMLSelectElement).value) }));
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
  if (first) update({ hw: first.id });
});

// delegated clicks: hardware configs and model rows
document.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-hw],[data-model]');
  if (!t) return;
  if (t.dataset.hw) update({ hw: t.dataset.hw });
  if (t.dataset.model && t.getAttribute('aria-disabled') !== 'true') {
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
    prompt('Copy this link', shareUrl(state));
    btn.textContent = 'Copy link';
  }
  setTimeout(() => (btn.textContent = 'Copy link'), 1600);
});

$('#download-card').addEventListener('click', async () => {
  if (!view.calc || view.hw.price_usd == null) return;
  const c = view.calc;
  const svg = renderOgCard({
    configLine: view.configLine,
    usageLine: view.usageLine,
    verdict: view.verdict.headline,
    unitLine: view.unit ? `That’s ${view.unit.text}` : null,
    devicePriceUsd: view.hw.price_usd,
    dailySaving: c.dailySaving,
    breakevenDays: c.breakevenDays,
    maxYears: data.defaults.waterline_max_years,
    dataChecked: data.defaults.data_last_checked,
    figures: ogFigures({
      devicePriceUsd: view.hw.price_usd,
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
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('svg load failed'));
      img.src = url;
    });
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

window.addEventListener('popstate', () => {
  state = parseState(location.search, data);
  usage.value = String(usageToSlider(state.usage, u.min_tokens_per_day, u.max_tokens_per_day));
  update();
});

$('#data-checked').textContent = data.defaults.data_last_checked;
$('#efficiency-note').textContent = `${fmtNum(data.defaults.estimate.efficiency_dense * 100, 0)}% for dense models or ${fmtNum(data.defaults.estimate.efficiency_moe * 100, 0)}% for mixture-of-experts (calibrated on the measured pairs in the data)`;
update();
void shareText;
