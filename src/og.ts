/**
 * The share card (1200×630). Same waterline renderer, composed with the
 * config, the verdict and the plain figures beneath. Used by scripts/build-og.ts
 * at build time and by the in-page "download card" button.
 */
import { renderWaterline, type WaterlineOptions } from './waterline';
import { clampText, EM, fitOneLine, wrapText } from './text-fit';
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
/** the card's side margin; no text sits outside it */
const MARGIN = 56;
const TEXT_MAX = OG_WIDTH - MARGIN * 2;
/** what a line of each kind costs in height when there is more than one of it */
const DETAIL_LEAD = 28;
const SUB_LEAD = 26;
const SUB_SIZE = 20;
/** the verdict is tracked in, which buys back a little of every character's width */
const LETTER_SPACING = 1.6;
/**
 * How wide the verdict sets, per character per point, with the tracking above
 * included. The bold estimate the other cards use is tuned for machine names,
 * which are caps and digits; a verdict is a lowercase sentence and sets much
 * narrower, so using that estimate here shrinks headlines that would have fit.
 * Measured against the faces these cards are drawn in, the widest verdict the
 * site produces comes out at 0.56; this leaves room without giving up a size.
 */
const EM_VERDICT = 0.6;

const fitsOn = (s: string, size: number) => s.length * size * EM <= TEXT_MAX;

export function renderOgCard(i: OgCardInput): string {
  const font = i.fontFamily ?? '"IBM Plex Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
  // no header bar: the sky runs to the top edge, and the site and data date sit in the figures strip
  const headerH = 0;
  const waterH = OG_HEIGHT - FIGURES_H - headerH;
  // Every line here is set from data, so its length is not known until it is
  // drawn: machine and model names run from "Mac mini M6, 16GB" to "Strix Halo
  // Corsair AI Workstation 300, 128GB", and a pay-back can be 4 characters or
  // 12. Each line is fitted to the card rather than trusted to be short.
  const verdictSize = fitOneLine(i.verdict, [60, 54, 50, 46], TEXT_MAX, EM_VERDICT);
  const verdict = clampText(i.verdict, verdictSize, TEXT_MAX, EM_VERDICT);

  // The configuration and the usage are two thoughts joined by a dot, so a line
  // too long for the card breaks between them rather than setting small enough
  // to be unreadable at the size a timeline or a chat app previews it.
  const joined = `${i.configLine} · ${i.usageLine}`;
  const joinedSize = [22, 20].find((s) => fitsOn(joined, s));
  const detailSize = joinedSize ?? [22, 20, 18].find((s) => fitsOn(i.configLine, s) && fitsOn(i.usageLine, s)) ?? 18;
  const detailLines = (joinedSize ? [joined] : [i.configLine, i.usageLine])
    .map((l) => clampText(l, detailSize, TEXT_MAX, EM));

  // The sub-line is a whole sentence, and the one a reader actually reads, so it
  // wraps instead of shrinking.
  const subLines = i.subLine ? wrapText(i.subLine, SUB_SIZE, TEXT_MAX, 2, EM) : [];

  const extraLines = (detailLines.length - 1) * DETAIL_LEAD + Math.max(0, subLines.length - 1) * SUB_LEAD;
  const textBlockH = 34 + verdictSize + (subLines.length ? 34 : 0) + 34 + extraLines;

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
  // one baseline after another down the block, so an extra line pushes the rest
  // down and the block as a whole sits higher against the figures strip
  const verdictY = textTop + verdictSize * 0.78;
  const line = (text: string, y: number, attrs: string) =>
    `<text x="${MARGIN}" y="${y}" ${attrs}>${esc(text)}</text>`;
  const detailY = (n: number) => verdictY + 34 + n * DETAIL_LEAD;
  const subY = (n: number) => detailY(detailLines.length - 1) + 30 + n * SUB_LEAD;
  const detail = detailLines.map((l, n) => line(l, detailY(n), `font-size="${detailSize}" fill="#cfe0ee"`)).join('\n');
  const sub = subLines.map((l, n) => line(l, subY(n), `font-size="${SUB_SIZE}" fill="rgba(207,224,238,0.8)"`)).join('\n');

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
${line(verdict, verdictY, `font-size="${verdictSize}" font-weight="700" fill="${never ? '#f0a75a' : '#ffffff'}" letter-spacing="-${LETTER_SPACING}"`)}
${detail}
${sub}
${figs}
</svg>`;
}

export function ogFigures(x: {
  devicePriceUsd: number;
  cloudCostPerMonth: number;
  localTokensPerSec: number | null;
  measurement: string;
  breakevenLabel: string;
  /** what the cloud figure is: per-token API cost by default, or a bill you entered */
  cloudLabel?: string;
  /** 'card_only' where the price is a graphics card without the PC around it */
  priceScope?: 'system' | 'card_only';
}): { label: string; value: string }[] {
  return [
    { label: x.priceScope === 'card_only' ? 'Hardware (card only)' : 'Hardware', value: fmtUsd(x.devicePriceUsd) },
    { label: x.cloudLabel ?? 'API cost / month', value: fmtUsd(x.cloudCostPerMonth) },
    { label: `Local speed (${x.measurement})`, value: x.localTokensPerSec == null ? 'unknown' : `${fmtNum(x.localTokensPerSec, 0)} tok/s` },
    { label: 'Break-even', value: x.breakevenLabel },
  ];
}
