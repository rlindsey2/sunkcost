/**
 * The waterline: your cumulative net position in dollars over time. Starts at
 * −price (fully submerged), rises at daily_saving per day, and surfaces when it
 * crosses zero. Pure SVG string so the same renderer draws the page hero and
 * the build-time OG cards.
 */
import { positionAfterDays } from './calc';
import { fmtUsd } from './format';

export interface WaterlineOptions {
  devicePriceUsd: number;
  dailySaving: number;
  /** null = never */
  breakevenDays: number | null;
  maxYears: number;
  width?: number;
  height?: number;
  /** larger text for OG cards */
  scale?: number;
  fontFamily?: string;
  showLabels?: boolean;
  /** dashed marker at this many days, with the depth at that point */
  markerDays?: number | null;
  id?: string;
  /** skip the sky/water fills so the surrounding panel supplies them */
  transparentBg?: boolean;
}

export interface WaterlineGeometry {
  horizonDays: number;
  surfacesOnChart: boolean;
  surfacesOffChart: boolean;
  never: boolean;
}

const YEAR = 365.25;

export function waterlineGeometry(o: WaterlineOptions): WaterlineGeometry {
  const maxDays = o.maxYears * YEAR;
  const never = o.breakevenDays === null;
  if (never) return { horizonDays: maxDays, surfacesOnChart: false, surfacesOffChart: false, never: true };
  const be = o.breakevenDays!;
  if (be > maxDays) return { horizonDays: maxDays, surfacesOnChart: false, surfacesOffChart: true, never: false };
  // show a bit of clear water after surfacing; keep at least ~3 months of x-axis
  const horizon = Math.max(be * 1.45, 90);
  return { horizonDays: horizon, surfacesOnChart: true, surfacesOffChart: false, never: false };
}

function niceTimeTicks(horizonDays: number): { days: number; label: string }[] {
  const years = horizonDays / YEAR;
  const out: { days: number; label: string }[] = [];
  if (years <= 1.05) {
    const months = horizonDays / (YEAR / 12);
    const step = months <= 4 ? 1 : months <= 8 ? 2 : 3;
    for (let m = step; m * (YEAR / 12) <= horizonDays * 1.001; m += step) {
      out.push({ days: m * (YEAR / 12), label: `${m} mo` });
    }
    return out;
  }
  const steps = [0.5, 1, 2, 5, 10, 20, 50, 100];
  const step = steps.find((s) => years / s <= 8) ?? 100;
  for (let y = step; y <= years * 1.001; y += step) {
    out.push({ days: y * YEAR, label: `${y % 1 === 0 ? y : y.toFixed(1)} yr` });
  }
  return out;
}

export function renderWaterline(o: WaterlineOptions): string {
  const W = o.width ?? 800;
  const H = o.height ?? 340;
  const s = o.scale ?? 1;
  const font = o.fontFamily ?? 'inherit';
  const showLabels = o.showLabels ?? true;
  const id = o.id ?? 'wl';
  const g = waterlineGeometry(o);

  const padL = showLabels ? 64 * s : 12 * s;
  const padR = 18 * s;
  const padT = 18 * s;
  const padB = showLabels ? 30 * s : 12 * s;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const price = o.devicePriceUsd;
  const T = g.horizonDays;
  const endValue = positionAfterDays(price, o.dailySaving, T);

  // dollar scale: 0 is the surface. Bottom is a little below −price (or lower if the curve sinks).
  const yMinVal = Math.min(-price * 1.06, endValue * 1.06);
  const yMaxVal = g.surfacesOnChart ? Math.max(endValue * 1.15, price * 0.25) : price * 0.28;

  const x = (days: number) => padL + (days / T) * plotW;
  const y = (v: number) => padT + ((yMaxVal - v) / (yMaxVal - yMinVal)) * plotH;
  const surfaceY = y(0);
  const bottomY = padT + plotH;

  // curve: straight line; split at break-even for colour
  const x0 = x(0), y0 = y(-price);
  const x1 = x(T), y1 = y(endValue);
  const beX = g.surfacesOnChart ? x(o.breakevenDays!) : null;

  const parts: string[] = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${ariaLabel(o, g)}" font-family="${font}" class="waterline">`);
  parts.push(`<defs>
    <linearGradient id="${id}-water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--water-top, #1b4b7a)"/>
      <stop offset="1" stop-color="var(--water-deep, #071a2e)"/>
    </linearGradient>
    <clipPath id="${id}-plot"><rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}"/></clipPath>
  </defs>`);

  // sky and water
  if (!o.transparentBg) {
    parts.push(`<rect x="${padL}" y="${padT}" width="${plotW}" height="${Math.max(0, surfaceY - padT)}" fill="var(--sky, #e8eef4)"/>`);
    parts.push(`<rect x="${padL}" y="${surfaceY}" width="${plotW}" height="${Math.max(0, bottomY - surfaceY)}" fill="url(#${id}-water)"/>`);
  }

  // depth grid
  if (showLabels) {
    const gridVals = depthGrid(price, yMinVal);
    for (const v of gridVals) {
      const yy = y(v);
      if (yy <= surfaceY + 2 || yy > bottomY) continue;
      parts.push(`<line x1="${padL}" x2="${padL + plotW}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}" stroke="var(--grid, rgba(255,255,255,0.10))" stroke-width="${s}"/>`);
      parts.push(`<text x="${padL - 8 * s}" y="${(yy + 4 * s).toFixed(1)}" text-anchor="end" font-size="${11 * s}" fill="var(--axis-text, #5b6673)" style="font-variant-numeric: tabular-nums">${fmtUsd(v)}</text>`);
    }
  }

  // area between curve and surface while underwater (how far under you are)
  const clip = `clip-path="url(#${id}-plot)"`;
  const underEndX = beX ?? x1;
  const underEndY = beX ? surfaceY : y1;
  parts.push(`<path ${clip} d="M ${x0} ${surfaceY} L ${x0} ${y0} L ${underEndX.toFixed(1)} ${underEndY.toFixed(1)} L ${underEndX.toFixed(1)} ${surfaceY} Z" fill="var(--submerged, rgba(120,170,220,0.10))"/>`);

  // surface line
  parts.push(`<line x1="${padL}" x2="${padL + plotW}" y1="${surfaceY.toFixed(1)}" y2="${surfaceY.toFixed(1)}" stroke="var(--surface, #9cc7ee)" stroke-width="${1.5 * s}"/>`);

  // the curve
  if (beX !== null) {
    parts.push(`<line ${clip} x1="${x0}" y1="${y0}" x2="${beX.toFixed(1)}" y2="${surfaceY.toFixed(1)}" stroke="var(--curve-under, #8fc1ea)" stroke-width="${2.5 * s}" stroke-linecap="round"/>`);
    parts.push(`<line ${clip} x1="${beX.toFixed(1)}" y1="${surfaceY.toFixed(1)}" x2="${x1}" y2="${y1.toFixed(1)}" stroke="var(--curve-above, #d97a1f)" stroke-width="${2.5 * s}" stroke-linecap="round"/>`);
    parts.push(`<circle cx="${beX.toFixed(1)}" cy="${surfaceY.toFixed(1)}" r="${5 * s}" fill="var(--curve-above, #d97a1f)" stroke="var(--sky, #e8eef4)" stroke-width="${2 * s}"/>`);
    if (showLabels) {
      const label = `surfaces at ${labelDays(o.breakevenDays!)}`;
      const anchor = beX > padL + plotW * 0.7 ? 'end' : 'start';
      const lx = anchor === 'end' ? beX - 10 * s : beX + 10 * s;
      parts.push(`<text x="${lx.toFixed(1)}" y="${(surfaceY - 10 * s).toFixed(1)}" text-anchor="${anchor}" font-size="${12 * s}" font-weight="600" fill="var(--ink, #1a1d21)">${label}</text>`);
    }
  } else {
    parts.push(`<line ${clip} x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1.toFixed(1)}" stroke="var(--curve-under, #8fc1ea)" stroke-width="${2.5 * s}" stroke-linecap="round"/>`);
    if (showLabels) {
      const msg = g.never ? 'never reaches the surface' : `surfaces at ${labelDays(o.breakevenDays!)} — off this chart`;
      parts.push(`<text x="${(padL + plotW - 10 * s).toFixed(1)}" y="${(Math.min(y1, bottomY - 8 * s) - 12 * s).toFixed(1)}" text-anchor="end" font-size="${12 * s}" font-weight="600" fill="var(--curve-under, #8fc1ea)">${msg}</text>`);
    }
  }

  // start marker (purchase day)
  parts.push(`<circle cx="${x0}" cy="${y0.toFixed(1)}" r="${3.5 * s}" fill="var(--curve-under, #8fc1ea)"/>`);

  // "today"-style marker at markerDays: how deep you are at that point
  if (o.markerDays != null && o.markerDays > 0 && o.markerDays < T) {
    const mx = x(o.markerDays);
    const mv = positionAfterDays(price, o.dailySaving, o.markerDays);
    const my = y(mv);
    parts.push(`<line x1="${mx.toFixed(1)}" x2="${mx.toFixed(1)}" y1="${padT}" y2="${bottomY}" stroke="var(--marker, rgba(255,255,255,0.35))" stroke-width="${s}" stroke-dasharray="${3 * s} ${4 * s}"/>`);
    parts.push(`<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${4 * s}" fill="var(--sky, #e8eef4)" stroke="var(--ink, #1a1d21)" stroke-width="${1.5 * s}"/>`);
    if (showLabels) {
      const txt = `${labelDays(o.markerDays)}: ${mv < 0 ? fmtUsd(mv) + ' underwater' : fmtUsd(mv) + ' clear'}`;
      const anchor = mx > padL + plotW * 0.6 ? 'end' : 'start';
      const lx = anchor === 'end' ? mx - 8 * s : mx + 8 * s;
      const nearBottom = my > bottomY - 26 * s;
      const ly = mv < 0 && !nearBottom ? my + 18 * s : my - 10 * s;
      parts.push(`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-size="${11.5 * s}" fill="${mv < 0 ? 'var(--water-text, #d5e4f2)' : 'var(--ink, #1a1d21)'}" style="font-variant-numeric: tabular-nums">${txt}</text>`);
    }
  }

  // time axis
  if (showLabels) {
    for (const t of niceTimeTicks(T)) {
      const tx = x(t.days);
      parts.push(`<line x1="${tx.toFixed(1)}" x2="${tx.toFixed(1)}" y1="${bottomY}" y2="${bottomY + 5 * s}" stroke="var(--axis, #9aa4ae)" stroke-width="${s}"/>`);
      parts.push(`<text x="${tx.toFixed(1)}" y="${(bottomY + 18 * s).toFixed(1)}" text-anchor="middle" font-size="${11 * s}" fill="var(--axis-text, #5b6673)" style="font-variant-numeric: tabular-nums">${t.label}</text>`);
    }
    parts.push(`<text x="${padL}" y="${(bottomY + 18 * s).toFixed(1)}" text-anchor="start" font-size="${11 * s}" fill="var(--axis-text, #5b6673)">bought</text>`);
    parts.push(`<text x="${padL - 8 * s}" y="${(surfaceY + (o.transparentBg ? -5 * s : 4 * s)).toFixed(1)}" text-anchor="end" font-size="${11 * s}" font-weight="600" fill="var(--axis-text, #5b6673)">surface</text>`);
  }

  parts.push('</svg>');
  return parts.join('\n');
}

function depthGrid(price: number, yMinVal: number): number[] {
  const mag = Math.pow(10, Math.floor(Math.log10(price)));
  const candidates = [mag / 4, mag / 2, mag, mag * 2, mag * 5];
  const step = candidates.find((c) => price / c <= 5) ?? mag;
  const out: number[] = [];
  for (let v = -step; v >= yMinVal; v -= step) out.push(v);
  return out;
}

export function labelDays(days: number): string {
  const years = days / YEAR;
  if (years >= 0.98 && Math.abs(years - Math.round(years)) < 0.03) return `${Math.round(years)} yr${Math.round(years) === 1 ? '' : 's'}`;
  if (years >= 1.5) return years >= 100 ? `${Math.round(years)} yrs` : `${years.toFixed(1)} yrs`;
  const months = days / (YEAR / 12);
  if (months >= 1.5) return `${months.toFixed(1)} mo`;
  return `${Math.round(days)} days`;
}

function ariaLabel(o: WaterlineOptions, g: WaterlineGeometry): string {
  if (g.never) return `Waterline chart: at these inputs the hardware never pays back; the curve stays below the surface.`;
  if (g.surfacesOffChart) return `Waterline chart: the hardware pays back after ${labelDays(o.breakevenDays!)}, beyond the ${o.maxYears}-year chart.`;
  return `Waterline chart: the hardware pays back after ${labelDays(o.breakevenDays!)}.`;
}
