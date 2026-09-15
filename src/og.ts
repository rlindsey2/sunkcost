/**
 * The share card (1200×630). Same waterline renderer, composed with the
 * config, the verdict and the plain figures beneath. Used by scripts/build-og.ts
 * at build time and by the in-page "download card" button.
 */
import { renderWaterline, type WaterlineOptions } from './waterline';
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
  /** falling API prices bend the curve, as on the page */
  decay?: WaterlineOptions['decay'];
  peakDays?: number | null;
  figures: { label: string; value: string }[];
  siteName?: string;
  dataChecked?: string;
  fontFamily?: string;
}

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** height of the light strip at the foot of the card that carries the figures */
const FIGURES_H = 158;

export function renderOgCard(i: OgCardInput): string {
  const font = i.fontFamily ?? '"IBM Plex Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
  // no header bar: the sky runs to the top edge, and the site and data date sit in the figures strip
  const headerH = 0;
  const waterH = OG_HEIGHT - FIGURES_H - headerH;
  const verdictSize = i.verdict.length > 34 ? 50 : 60;
  const textBlockH = 34 + verdictSize + (i.subLine ? 34 : 0) + 34;

  const wl = renderWaterline({
    devicePriceUsd: i.devicePriceUsd,
    dailySaving: i.dailySaving,
    breakevenDays: i.breakevenDays,
    decay: i.decay,
    peakDays: i.peakDays,
    maxYears: i.maxYears,
    width: OG_WIDTH,
    height: waterH,
    plotHeight: waterH - textBlockH,
    scale: 1.5,
    fontFamily: font,
    showLabels: true,
    markerDays: 365.25,
    id: 'og',
  })
    // the card is a picture, not a themed page, so resolve the tokens to the light palette
    .replace(/var\(--sky, [^)]*\)/g, '#dbe8f1')
    .replace(/var\(--sky-horizon, var\(--sky, [^)]*\)\)/g, '#eef4f8')
    .replace(/var\(--water-top, [^)]*\)/g, '#1f5479')
    .replace(/var\(--water-mid, [^)]*\)/g, '#123f60')
    .replace(/var\(--water-deep, [^)]*\)/g, '#05121e')
    .replace(/var\(--surface-ink, [^)]*\)/g, '#2f6890')
    .replace(/var\(--[a-z-]+, ([^)]+)\)/g, '$1');

  const figs = i.figures
    .map((f, idx) => {
      const x = 56 + idx * ((OG_WIDTH - 112) / i.figures.length);
      return `<text x="${x}" y="${headerH + waterH + 58}" font-size="18" fill="#4f5e68">${esc(f.label)}</text>
<text x="${x}" y="${headerH + waterH + 96}" font-size="30" font-weight="600" fill="#0e1720" letter-spacing="-0.5" style="font-variant-numeric: tabular-nums">${esc(f.value)}</text>`;
    })
    .join('\n');

  const never = /never/i.test(i.verdict);
  const textTop = headerH + waterH - textBlockH + 34;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" font-family='${font}'>
<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="#f2f4f3"/>
<g transform="translate(0, ${headerH})">${wl}</g>
<rect x="0" y="${headerH + waterH - textBlockH - 24}" width="${OG_WIDTH}" height="${textBlockH + 24}" fill="url(#og-scrim)"/>
<defs><linearGradient id="og-scrim" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#05121e" stop-opacity="0"/>
  <stop offset="0.45" stop-color="#05121e" stop-opacity="0.55"/>
  <stop offset="1" stop-color="#05121e" stop-opacity="0.85"/>
</linearGradient></defs>
<text x="${OG_WIDTH - 56}" y="${OG_HEIGHT - 22}" font-size="15" text-anchor="end" fill="#6b7a84">${esc(i.siteName ?? 'Sunk Cost')} · sunkcost.ai${i.dataChecked ? ` · data checked ${esc(i.dataChecked)}` : ''}</text>
<text x="56" y="${textTop + verdictSize * 0.78}" font-size="${verdictSize}" font-weight="700" fill="${never ? '#f0a75a' : '#ffffff'}" letter-spacing="-1.6">${esc(i.verdict)}</text>
<text x="56" y="${textTop + verdictSize * 0.78 + 34}" font-size="22" fill="#cfe0ee">${esc(i.configLine)} · ${esc(i.usageLine)}</text>
${i.subLine ? `<text x="56" y="${textTop + verdictSize * 0.78 + 64}" font-size="20" fill="rgba(207,224,238,0.8)">${esc(i.subLine)}</text>` : ''}
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
