const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function fmtUsd(v: number | null | undefined, opts: { cents?: boolean } = {}): string {
  if (v == null || !Number.isFinite(v)) return '—';
  const abs = Math.abs(v);
  const useCents = opts.cents ?? abs < 100;
  const s = useCents ? usd2.format(abs) : usd0.format(abs);
  return v < 0 ? `−${s}` : s;
}

export function fmtInt(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  return num0.format(v);
}

export function fmtNum(v: number | null | undefined, digits = 1): string {
  if (v == null || !Number.isFinite(v)) return '—';
  return v.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

/** 500k, 1.2M, 3.4B, 12T */
export function fmtTokens(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  const abs = Math.abs(v);
  const units: [number, string][] = [
    [1e12, 'T'],
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'k'],
  ];
  for (const [n, suffix] of units) {
    if (abs >= n) {
      const x = v / n;
      const digits = x >= 100 ? 0 : x >= 10 ? 1 : 2;
      return `${x.toLocaleString('en-US', { maximumFractionDigits: digits })}${suffix}`;
    }
  }
  return num0.format(v);
}

/** Human duration from days: "23 days", "7.5 months", "8.4 years" */
export function fmtDuration(days: number | null | undefined): string {
  if (days == null || !Number.isFinite(days)) return '—';
  if (days < 1) return 'under a day';
  if (days < 45) return `${Math.round(days)} day${Math.round(days) === 1 ? '' : 's'}`;
  const months = days / (365.25 / 12);
  if (months < 24) {
    const m = months < 10 ? months.toFixed(1) : Math.round(months).toString();
    return `${m} months`;
  }
  const years = days / 365.25;
  if (years >= 1000) return `${fmtInt(years)} years`;
  return `${years < 10 ? years.toFixed(1) : Math.round(years)} years`;
}

/** Duration for the verdict line: prefers years once > 18 months */
export function fmtVerdictDuration(days: number): string {
  const years = days / 365.25;
  if (years >= 1.5) return years >= 100 ? `${fmtInt(years)} years` : `${years.toFixed(1)} years`;
  const months = days / (365.25 / 12);
  if (months >= 1.5) return `${months.toFixed(1)} months`;
  return `${Math.round(days)} days`;
}

export function fmtSeconds(s: number | null | undefined): string {
  if (s == null || !Number.isFinite(s)) return '—';
  if (s < 60) return `${s < 10 ? s.toFixed(1) : Math.round(s)} s`;
  const m = s / 60;
  if (m < 60) return `${m < 10 ? m.toFixed(1) : Math.round(m)} min`;
  return `${(m / 60).toFixed(1)} h`;
}

export function fmtHours(h: number | null | undefined): string {
  if (h == null || !Number.isFinite(h)) return '—';
  if (Math.abs(h) < 1 / 60) return 'under a minute';
  if (Math.abs(h) < 1) return `${Math.round(h * 60)} min`;
  return `${h.toFixed(1)} h`;
}

export function fmtGb(gb: number | null | undefined): string {
  if (gb == null || !Number.isFinite(gb)) return '—';
  return `${gb < 10 ? gb.toFixed(1) : Math.round(gb)} GB`;
}

export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
