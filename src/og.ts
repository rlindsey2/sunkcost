/**
 * The share card (1200×630). Same waterline renderer, composed with the
 * config, the verdict and the plain figures beneath. Used by scripts/build-og.ts
 * at build time and by the in-page "download card" button.
 */
import { renderWaterline, waterlineGeometry } from './waterline';
import { esc, fmtUsd, fmtNum } from './format';

export interface OgCardInput {
  configLine: string; // "Mac Studio M4 Max, 64GB · Qwen3 32B Q4_K_M"
  usageLine: string; // "500k tokens/day, 4:1 input:output"
  verdict: string; // "You're underwater for 8.4 years."
  subLine: string | null;
  devicePriceUsd: number;
  dailySaving: number;
  breakevenDays: number | null;
  maxYears: number;
  figures: { label: string; value: string }[];
  siteName?: string;
  dataChecked?: string;
  fontFamily?: string;
}

/** where the surface line lands inside the chart, so the card's gradient can match it */
function surfaceOffsetInChart(i: OgCardInput, height: number, scale: number): number {
  const padT = 18 * scale;
  const padB = 30 * scale;
  const plotH = height - padT - padB;
  const price = i.devicePriceUsd;
  const g = waterlineGeometry({ devicePriceUsd: price, dailySaving: i.dailySaving, breakevenDays: i.breakevenDays, maxYears: i.maxYears });
  const endValue = -price + i.dailySaving * g.horizonDays;
  const yMinVal = Math.min(-price * 1.06, endValue * 1.06);
  const yMaxVal = g.surfacesOnChart ? Math.max(endValue * 1.15, price * 0.25) : price * 0.28;
  return padT + ((yMaxVal - 0) / (yMaxVal - yMinVal)) * plotH;
}

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export function renderOgCard(i: OgCardInput): string {
  const font = i.fontFamily ?? '"IBM Plex Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
  const waterH = 430;
  const wl = renderWaterline({
    devicePriceUsd: i.devicePriceUsd,
    dailySaving: i.dailySaving,
    breakevenDays: i.breakevenDays,
    maxYears: i.maxYears,
    width: OG_WIDTH - 120,
    height: 214,
    scale: 1.3,
    fontFamily: font,
    showLabels: true,
    markerDays: 365.25,
    transparentBg: true,
    id: 'og',
  }).replace(/var\(--[a-z-]+, ([^)]+)\)/g, '$1');

  const figs = i.figures
    .map((f, idx) => {
      const x = 60 + idx * ((OG_WIDTH - 120) / i.figures.length);
      return `<text x="${x}" y="${waterH + 62}" font-size="17" fill="#5b6673">${esc(f.label)}</text>
<text x="${x}" y="${waterH + 94}" font-size="26" font-weight="600" fill="#1a1d21" style="font-variant-numeric: tabular-nums">${esc(f.value)}</text>`;
    })
    .join('\n');

  // the chart's surface line sits 18 * scale from its top plus the sky share of the plot;
  // the panel gradient breaks at the same y so water reads as one body
  const chartTop = 62;
  const surfaceY = chartTop + surfaceOffsetInChart(i, 214, 1.3);
  const surfaceFrac = surfaceY / waterH;
  const verdictSize = i.verdict.length > 34 ? 44 : 54;
  const never = /never/i.test(i.verdict);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" font-family='${font}'>
<defs>
  <linearGradient id="og-panel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#eef3f8"/>
    <stop offset="${(surfaceFrac - 0.002).toFixed(4)}" stop-color="#e2ebf3"/>
    <stop offset="${surfaceFrac.toFixed(4)}" stop-color="#2a6296"/>
    <stop offset="1" stop-color="#071a2e"/>
  </linearGradient>
</defs>
<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="#f6f7f5"/>
<rect width="${OG_WIDTH}" height="${waterH}" fill="url(#og-panel)"/>
<text x="60" y="46" font-size="18" font-weight="700" fill="#1a1d21" letter-spacing="0.4">${esc(i.siteName ?? 'Sunk Cost')}</text>
<text x="${OG_WIDTH - 60}" y="46" font-size="15" text-anchor="end" fill="#5b6673">sunkcost.ai${i.dataChecked ? ` · data checked ${esc(i.dataChecked)}` : ''}</text>
<g transform="translate(60, 62)">${wl}</g>
<text x="60" y="${waterH - 62}" font-size="${verdictSize}" font-weight="700" fill="${never ? '#ffd9a8' : '#ffffff'}" letter-spacing="-1">${esc(i.verdict)}</text>
<text x="60" y="${waterH - 32}" font-size="21" fill="#d5e4f2">${esc(i.configLine)} · ${esc(i.usageLine)}</text>
${i.subLine ? `<text x="60" y="${waterH - 6}" font-size="19" fill="rgba(213,228,242,0.78)">${esc(i.subLine)}</text>` : ''}
${figs}
</svg>`;
}

export function ogFigures(x: {
  devicePriceUsd: number;
  cloudCostPerMonth: number;
  localTokensPerSec: number | null;
  measurement: string;
  breakevenLabel: string;
}): { label: string; value: string }[] {
  return [
    { label: 'Hardware', value: fmtUsd(x.devicePriceUsd) },
    { label: 'API cost / month', value: fmtUsd(x.cloudCostPerMonth) },
    { label: `Local speed (${x.measurement})`, value: x.localTokensPerSec == null ? 'unknown' : `${fmtNum(x.localTokensPerSec, 0)} tok/s` },
    { label: 'Break-even', value: x.breakevenLabel },
  ];
}
