/**
 * The waterline: your cumulative net position in dollars over time. It starts
 * at −price, fully submerged, rises at daily_saving per day, and surfaces when
 * it crosses zero.
 *
 * This renders the whole card, not a chart inside one: the sky, the surface and
 * the water run edge to edge, and the caller writes the verdict over the deep
 * water at the bottom. Pure SVG string, so the page and the build-time share
 * cards are drawn by the same code.
 */
import { positionAfterDays } from './calc';
import { fmtUsd } from './format';

export interface WaterlineOptions {
  devicePriceUsd: number;
  dailySaving: number;
  /** null = it never pays back */
  breakevenDays: number | null;
  maxYears: number;
  width?: number;
  height?: number;
  /** height of the charting region at the top; the rest is deep water for the caller's text */
  plotHeight?: number;
  /** scale text and strokes up for share cards */
  scale?: number;
  fontFamily?: string;
  showLabels?: boolean;
  /** dashed marker at this many days, with the depth reached by then */
  markerDays?: number | null;
  id?: string;
  /** skip the sky and water fills so a surrounding panel supplies them */
  transparentBg?: boolean;
}

export interface WaterlineGeometry {
  horizonDays: number;
  surfacesOnChart: boolean;
  surfacesOffChart: boolean;
  never: boolean;
}

const YEAR = 365.25;

/**
 * The window always shows the whole climb, however long it takes, so the curve
 * reads as a line rising to meet the surface rather than a flat streak along the
 * bottom. The time axis carries the scale: the same shape over 8 months or over
 * 900 years, with the axis and the verdict saying which. When it never pays back
 * there is nothing to frame, so the window falls back to a fixed span and the
 * flatness is the message.
 */
export function waterlineGeometry(o: WaterlineOptions): WaterlineGeometry {
  const maxDays = o.maxYears * YEAR;
  if (o.breakevenDays === null) return { horizonDays: maxDays, surfacesOnChart: false, surfacesOffChart: false, never: true };
  return { horizonDays: Math.max(o.breakevenDays * 1.16, 60), surfacesOnChart: true, surfacesOffChart: false, never: false };
}

function niceTimeTicks(horizonDays: number): { days: number; label: string }[] {
  const years = horizonDays / YEAR;
  const out: { days: number; label: string }[] = [];
  if (years <= 1.05) {
    const months = horizonDays / (YEAR / 12);
    const step = months <= 4 ? 1 : months <= 8 ? 2 : 3;
    for (let m = step; m * (YEAR / 12) <= horizonDays * 1.001; m += step) out.push({ days: m * (YEAR / 12), label: `${m} mo` });
    return out;
  }
  const steps = [0.5, 1, 2, 5, 10, 20, 50, 100];
  const step = steps.find((s) => years / s <= 6) ?? 100;
  for (let y = step; y <= years * 1.001; y += step) out.push({ days: y * YEAR, label: `${y % 1 === 0 ? y : y.toFixed(1)} yr` });
  return out;
}

function depthGrid(price: number, yMinVal: number): number[] {
  const mag = Math.pow(10, Math.floor(Math.log10(price)));
  const step = [mag / 4, mag / 2, mag, mag * 2, mag * 5].find((c) => price / c <= 4) ?? mag;
  const out: number[] = [];
  for (let v = -step; v >= yMinVal; v -= step) out.push(v);
  return out;
}

export function renderWaterline(o: WaterlineOptions): string {
  const W = Math.max(220, o.width ?? 800);
  const H = Math.max(140, o.height ?? 320);
  const s = o.scale ?? 1;
  const font = o.fontFamily ?? 'inherit';
  const showLabels = o.showLabels ?? true;
  const id = o.id ?? 'wl';
  const g = waterlineGeometry(o);

  /* The plot lives in the top band. Everything below it is deep water the
     caller can write on, which is why the verdict reads as being down there. */
  const plotH = Math.min(H, o.plotHeight ?? H);
  const padT = 16 * s;
  const padB = showLabels ? 21 * s : 6 * s;
  const padX = 14 * s;
  const innerH = Math.max(40, plotH - padT - padB);
  const innerW = W - padX * 2;

  const price = o.devicePriceUsd;
  const T = g.horizonDays;
  const endValue = positionAfterDays(price, o.dailySaving, T);

  const yMinVal = Math.min(-price * 1.04, endValue * 1.04);
  const yMaxVal = g.surfacesOnChart ? Math.max(endValue * 1.18, price * 0.22) : price * 0.24;

  const x = (days: number) => padX + (days / T) * innerW;
  const y = (v: number) => padT + ((yMaxVal - v) / (yMaxVal - yMinVal)) * innerH;
  const surfaceY = y(0);
  const plotBottom = padT + innerH;

  const x0 = x(0), y0 = y(-price);
  const x1 = x(T), y1 = y(endValue);
  const beX = g.surfacesOnChart ? x(o.breakevenDays!) : null;

  const p: string[] = [];
  p.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${ariaLabel(o, g)}" font-family="${font}" class="waterline">`);
  p.push(`<defs>
    <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--sky, #dbe8f1)"/>
      <stop offset="1" stop-color="var(--sky-horizon, var(--sky, #eef4f8))"/>
    </linearGradient>
    <linearGradient id="${id}-water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--water-top, #1f5479)"/>
      <stop offset="0.55" stop-color="var(--water-mid, #103a58)"/>
      <stop offset="1" stop-color="var(--water-deep, #05121e)"/>
    </linearGradient>
    <linearGradient id="${id}-mass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--curve-under, #a9d3f2)" stop-opacity="0.34"/>
      <stop offset="1" stop-color="var(--curve-under, #a9d3f2)" stop-opacity="0.03"/>
    </linearGradient>
    <clipPath id="${id}-clip"><rect x="${padX}" y="${padT}" width="${innerW}" height="${innerH}"/></clipPath>
  </defs>`);

  if (!o.transparentBg) {
    p.push(`<rect x="0" y="0" width="${W}" height="${Math.max(0, surfaceY)}" fill="url(#${id}-sky)"/>`);
    p.push(`<rect x="0" y="${surfaceY.toFixed(1)}" width="${W}" height="${Math.max(0, H - surfaceY).toFixed(1)}" fill="url(#${id}-water)"/>`);
  }

  // depth grid, labelled inside the water where the light text reads
  if (showLabels) {
    for (const v of depthGrid(price, yMinVal)) {
      const yy = y(v);
      if (yy <= surfaceY + 10 * s || yy > plotBottom) continue;
      p.push(`<line x1="0" x2="${W}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}" stroke="var(--chart-ink, #b6cfe2)" stroke-opacity="0.13" stroke-width="${s}"/>`);
      p.push(`<text x="${padX}" y="${(yy - 5 * s).toFixed(1)}" font-size="${10.5 * s}" fill="var(--chart-ink, #b6cfe2)" opacity="0.6" style="font-variant-numeric: tabular-nums">${fmtUsd(v)}</text>`);
    }
  }

  // the mass of water you have climbed through: area under the curve
  const clip = `clip-path="url(#${id}-clip)"`;
  p.push(`<path ${clip} d="M ${x0} ${plotBottom.toFixed(1)} L ${x0} ${y0.toFixed(1)} L ${x1} ${y1.toFixed(1)} L ${x1} ${plotBottom.toFixed(1)} Z" fill="url(#${id}-mass)"/>`);

  // the surface: a bright line edge to edge, with light scattering just above it
  p.push(`<rect x="0" y="${(surfaceY - 7 * s).toFixed(1)}" width="${W}" height="${7 * s}" fill="var(--surface, #9cc7ee)" opacity="0.16"/>`);
  p.push(`<line x1="0" x2="${W}" y1="${surfaceY.toFixed(1)}" y2="${surfaceY.toFixed(1)}" stroke="var(--surface, #9cc7ee)" stroke-width="${1.75 * s}"/>`);
  if (showLabels) {
    p.push(`<text x="${padX}" y="${(surfaceY - 8 * s).toFixed(1)}" font-size="${10 * s}" font-weight="600" letter-spacing="${0.8 * s}" fill="var(--surface-ink, #4d7ea6)" opacity="0.95">BREAK EVEN</text>`);
  }

  // the curve, with a soft halo so it survives on a busy ground
  const curveUnder = 'var(--curve-under, #a9d3f2)';
  const curveAbove = 'var(--curve-above, #f0a75a)';
  const seg = (ax: number, ay: number, bx: number, by: number, color: string) =>
    `<line ${clip} x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${color}" stroke-opacity="0.28" stroke-width="${9 * s}" stroke-linecap="round"/>` +
    `<line ${clip} x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${color}" stroke-width="${3.25 * s}" stroke-linecap="round"/>`;

  if (beX !== null) {
    p.push(seg(x0, y0, beX, surfaceY, curveUnder));
    p.push(seg(beX, surfaceY, x1, y1, curveAbove));
    p.push(`<circle cx="${beX.toFixed(1)}" cy="${surfaceY.toFixed(1)}" r="${6 * s}" fill="var(--curve-above, #f0a75a)" stroke="#fff" stroke-width="${2 * s}"/>`);
    if (showLabels) {
      const anchor = beX > padX + innerW * 0.6 ? 'end' : 'start';
      const lx = anchor === 'end' ? beX - 13 * s : beX + 13 * s;
      p.push(`<text x="${lx.toFixed(1)}" y="${(surfaceY - 12 * s).toFixed(1)}" text-anchor="${anchor}" font-size="${12 * s}" font-weight="600" fill="var(--surface-ink, #4d7ea6)">surfaces at ${labelDays(o.breakevenDays!)}</text>`);
    }
  } else {
    p.push(seg(x0, y0, x1, y1, curveUnder));
    if (showLabels) {
      const msg = g.never ? 'never reaches the surface' : `surfaces at ${labelDays(o.breakevenDays!)} — far off this chart`;
      const my = Math.max(y1 - 14 * s, padT + 14 * s);
      p.push(`<text x="${(padX + innerW).toFixed(1)}" y="${my.toFixed(1)}" text-anchor="end" font-size="${12 * s}" font-weight="600" fill="var(--chart-ink, #b6cfe2)" opacity="0.92">${msg}</text>`);
    }
  }

  p.push(`<circle cx="${x0}" cy="${y0.toFixed(1)}" r="${3.5 * s}" fill="var(--curve-under, #a9d3f2)"/>`);

  // where you stand after a year
  if (o.markerDays != null && o.markerDays > 0 && o.markerDays < T) {
    const mx = x(o.markerDays);
    const mv = positionAfterDays(price, o.dailySaving, o.markerDays);
    const my = y(mv);
    p.push(`<line x1="${mx.toFixed(1)}" x2="${mx.toFixed(1)}" y1="${padT}" y2="${plotBottom.toFixed(1)}" stroke="var(--chart-ink, #b6cfe2)" stroke-opacity="0.3" stroke-width="${s}" stroke-dasharray="${3 * s} ${4 * s}"/>`);
    p.push(`<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${4 * s}" fill="var(--water-deep, #05121e)" stroke="var(--chart-ink, #b6cfe2)" stroke-width="${1.5 * s}"/>`);
    if (showLabels) {
      const anchor = mx > padX + innerW * 0.6 ? 'end' : 'start';
      const lx = anchor === 'end' ? mx - 9 * s : mx + 9 * s;
      p.push(`<text x="${lx.toFixed(1)}" y="${(my + 15 * s).toFixed(1)}" text-anchor="${anchor}" font-size="${11 * s}" fill="var(--chart-ink, #b6cfe2)" opacity="0.9" style="font-variant-numeric: tabular-nums">${labelDays(o.markerDays)}: ${mv < 0 ? `${fmtUsd(mv)} underwater` : `${fmtUsd(mv)} clear`}</text>`);
    }
  }

  // time axis along the foot of the plot
  if (showLabels) {
    const ty = plotBottom + 14 * s;
    const markerX = o.markerDays != null && o.markerDays > 0 && o.markerDays < T ? x(o.markerDays) : null;
    // the "bought" label gives way to the year-one marker when they would collide
    if (markerX == null || markerX - padX > 76 * s) {
      p.push(`<text x="${padX}" y="${ty.toFixed(1)}" font-size="${10.5 * s}" fill="var(--chart-ink, #b6cfe2)" opacity="0.55">bought</text>`);
    }
    for (const t of niceTimeTicks(T)) {
      const tx = x(t.days);
      if (tx > padX + innerW - 12 * s) continue;
      p.push(`<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" font-size="${10.5 * s}" fill="var(--chart-ink, #b6cfe2)" opacity="0.55" style="font-variant-numeric: tabular-nums">${t.label}</text>`);
    }
  }

  p.push('</svg>');
  return p.join('\n');
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
  if (g.never) return 'Waterline chart: at these inputs the hardware never pays back; the curve stays below the surface.';
  if (g.surfacesOffChart) return `Waterline chart: the hardware pays back after ${labelDays(o.breakevenDays!)}, beyond the ${o.maxYears}-year chart.`;
  return `Waterline chart: the hardware pays back after ${labelDays(o.breakevenDays!)}.`;
}
