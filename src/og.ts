/**
 * The share card (1200×630). Same waterline renderer, composed with the
 * config, the verdict and the plain figures beneath. Used by scripts/build-og.ts
 * at build time and by the in-page "download card" button.
 */
import { renderWaterline } from './waterline';
import { esc, fmtUsd, fmtNum } from './format';

export interface OgCardInput {
  configLine: string; // "Mac Studio M4 Max, 64GB · Qwen3 32B Q4_K_M"
  usageLine: string; // "500k tokens/day, 4:1 input:output"
  verdict: string; // "You're underwater for 8.4 years."
  unitLine: string | null; // "about 312 complete works of Shakespeare"
  devicePriceUsd: number;
  dailySaving: number;
  breakevenDays: number | null;
  maxYears: number;
  figures: { label: string; value: string }[];
  siteName?: string;
  dataChecked?: string;
  fontFamily?: string;
}

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export function renderOgCard(i: OgCardInput): string {
  const font = i.fontFamily ?? '"IBM Plex Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
  const wlH = 260;
  const wl = renderWaterline({
    devicePriceUsd: i.devicePriceUsd,
    dailySaving: i.dailySaving,
    breakevenDays: i.breakevenDays,
    maxYears: i.maxYears,
    width: OG_WIDTH - 120,
    height: wlH,
    scale: 1.35,
    fontFamily: font,
    showLabels: true,
    markerDays: 365.25,
    id: 'og',
  })
    // inline the CSS variables so the card renders identically without a stylesheet
    .replace(/var\(--[a-z-]+, ([^)]+)\)/g, '$1');

  const figs = i.figures
    .map((f, idx) => {
      const x = 60 + idx * ((OG_WIDTH - 120) / i.figures.length);
      return `<text x="${x}" y="${OG_HEIGHT - 62}" font-size="16" fill="#5b6673">${esc(f.label)}</text>
<text x="${x}" y="${OG_HEIGHT - 34}" font-size="24" font-weight="600" fill="#1a1d21" style="font-variant-numeric: tabular-nums">${esc(f.value)}</text>`;
    })
    .join('\n');

  const verdictSize = i.verdict.length > 34 ? 46 : 56;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" font-family='${font}'>
<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="#f6f7f5"/>
<text x="60" y="52" font-size="18" font-weight="600" fill="#1a1d21" letter-spacing="0.5">${esc(i.siteName ?? 'Sunk Cost')}</text>
<text x="${OG_WIDTH - 60}" y="52" font-size="16" text-anchor="end" fill="#5b6673">sunkcost.ai${i.dataChecked ? ` · data checked ${esc(i.dataChecked)}` : ''}</text>
<text x="60" y="92" font-size="21" fill="#3a434d">${esc(i.configLine)} · ${esc(i.usageLine)}</text>
<text x="60" y="${92 + verdictSize + 14}" font-size="${verdictSize}" font-weight="700" fill="#1a1d21" letter-spacing="-1">${esc(i.verdict)}</text>
${i.unitLine ? `<text x="60" y="${92 + verdictSize + 52}" font-size="24" fill="#3a434d">${esc(i.unitLine)}.</text>` : ''}
<g transform="translate(60, ${OG_HEIGHT - 90 - wlH})">${wl}</g>
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
