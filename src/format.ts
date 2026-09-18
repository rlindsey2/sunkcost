import type { Hardware } from './types';

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

/**
 * A sentence that ends in a note out of the data ends where the note does. The
 * architecture notes all carry their own full stop, so a template adding one
 * printed "on all 80 layers.." on 41 model pages — a typo the data never had
 * and the template could not see.
 */
export function endStop(text: string): string {
  const t = text.trim();
  return !t || /[.!?]$/.test(t) ? t : `${t}.`;
}

/** Where a power figure came from, in words rather than in the data's own key. */
export function powerSourceLabel(hw: Hardware): string {
  switch (hw.load_watts_status) {
    case 'stand_in':
      return 'stand-in';
    case 'third_party_measured':
      return 'measured by a third party';
    case 'entered':
      return 'entered by you';
    default:
      return 'published';
  }
}

/**
 * The same fault as splitCapabilityNote(), one page type along. hw.notes is the
 * one field a machine records everything in, and the machine page printed it
 * whole under "Usable by the GPU". So the memory note on all seven graphics
 * cards opened with the arithmetic behind the bandwidth figure in the row
 * above — which printed bare — and on ten laptops it explained that sustained
 * speed drops once the fans cap out, which is not a fact about memory either.
 *
 * Nothing in the field is wrong. Each sentence is about a different number, and
 * this puts it under the number it is about: bandwidth to the bandwidth row,
 * speed to the note under the speed column, which product this entry is and
 * where you buy it to Availability, memory where it already was.
 *
 * The markers are the subject each sentence names rather than the sentences
 * themselves, so a machine added tomorrow is read by what its note talks about.
 * checkHardwareNotes() holds the result: every sentence lands somewhere, lands
 * once, and lands under a row the page actually prints.
 */
const NOTE_SUBJECTS: { key: 'bandwidth' | 'availability' | 'speed'; marker: RegExp }[] = [
  { key: 'bandwidth', marker: /\bbandwidth\b/i },
  { key: 'availability', marker: /\bnot this entry\b|\bin stock\b/i },
  { key: 'speed', marker: /\btokens\/sec\b|\bon decode\b/i },
];

export type HardwareNote = { memory: string; bandwidth: string; availability: string; speed: string };

/** The sentences of a note, kept whole and in order, so joining them gives the note back. */
export function noteSentences(note: string | null | undefined): string[] {
  const text = (note ?? '').trim();
  return text ? text.split(/(?<=\.)\s+(?=[A-Z0-9(`~])/).map((s) => s.trim()).filter(Boolean) : [];
}

export function splitHardwareNote(note: string | null | undefined): HardwareNote {
  const out: HardwareNote = { memory: '', bandwidth: '', availability: '', speed: '' };
  for (const sentence of noteSentences(note)) {
    const subject = NOTE_SUBJECTS.find((s) => s.marker.test(sentence))?.key ?? 'memory';
    // "Bandwidth: 22.4 Gbps × 256-bit bus ÷ 8 = 716.8 GB/s" carried its own label
    // because it used to sit under the memory figure. Under the bandwidth row the
    // label is the row's name, so it goes.
    const text = subject === 'bandwidth' ? sentence.replace(/^Bandwidth:\s*/, '') : sentence;
    out[subject] = out[subject] ? `${out[subject]} ${text}` : text;
  }
  return out;
}

/**
 * Publishers, by the host that serves them. A source link used to read "source 1",
 * which tells a reader deciding whether to click, and a crawler deciding what the
 * link is worth, nothing at all about what is on the other end. The name of the
 * site does. Nothing here is a claim about the page behind the link: it is the
 * name of whoever publishes it, and a host with no entry keeps its own domain.
 */
const SOURCE_PUBLISHERS: Record<string, string> = {
  'www.apple.com': 'Apple',
  'support.apple.com': 'Apple Support',
  'appleinsider.com': 'AppleInsider',
  'daringfireball.net': 'Daring Fireball',
  'lowendmac.com': 'Low End Mac',
  'frame.work': 'Framework',
  'community.frame.work': 'Framework Community',
  'www.nvidia.com': 'NVIDIA',
  'nvidianews.nvidia.com': 'NVIDIA Newsroom',
  'marketplace.nvidia.com': 'NVIDIA Marketplace',
  'forums.developer.nvidia.com': 'NVIDIA Developer Forums',
  'www.techpowerup.com': 'TechPowerUp',
  'www.amd.com': 'AMD',
  'www.asus.com': 'ASUS',
  'www.xfxforce.com': 'XFX',
  'wccftech.com': 'Wccftech',
  'www.tomshardware.com': "Tom's Hardware",
  'www.servethehome.com': 'ServeTheHome',
  'www.storagereview.com': 'StorageReview',
  'www.pugetsystems.com': 'Puget Systems',
  'www.newegg.com': 'Newegg',
  'www.staples.com': 'Staples',
  'www.corsair.com': 'Corsair',
  'www.gmktec.com': 'GMKtec',
  'www.bee-link.com': 'Beelink',
  'store.minisforum.com': 'Minisforum',
  'blog.kubesimplify.com': 'Kubesimplify',
  'llm-tracker.info': 'llm-tracker',
  'artificialanalysis.ai': 'Artificial Analysis',
  'www.eia.gov': 'US EIA',
  'epoch.ai': 'Epoch AI',
};

/**
 * Two hosts where the publisher is not the answer: every model on this site cites
 * Hugging Face and half the machines cite GitHub, so "Hugging Face" twice in a row
 * is the numbered list again in other words. On both, the repository is the name of
 * the thing — bartowski/Qwen_Qwen3-8B-GGUF says which weights the size came from,
 * and ggml-org/llama.cpp says which runtime.
 */
const REPO_HOSTS = new Set(['huggingface.co', 'github.com']);

/**
 * What kind of page a URL says it is, in its own words. Only used to tell two
 * links to the same publisher apart, and only where the path says so outright:
 * where it does not, the link keeps the bare name rather than being given a
 * description nobody can check.
 */
const SOURCE_KINDS: { marker: RegExp; word: string }[] = [
  { marker: /\/configuration\//i, word: 'configurator' },
  { marker: /\/(specs|techspec)/i, word: 'specs' },
  { marker: /\/newsroom\//i, word: 'newsroom' },
  { marker: /\/news\//i, word: 'news' },
  { marker: /\/issues\//i, word: 'issue' },
  { marker: /\/discussions\//i, word: 'discussion' },
  { marker: /\/blog\//i, word: 'blog' },
  { marker: /\/raw\/[^/]+\/config\.json$/i, word: 'config' },
  { marker: /\/compare\//i, word: 'comparison' },
  { marker: /\/labs\/articles\//i, word: 'review' },
  { marker: /\/review\//i, word: 'review' },
  { marker: /-review\/?$/i, word: 'review' },
  { marker: /\/(shop|p)\//i, word: 'store' },
];

function sourceUrl(url: string): { host: string; path: string } {
  try {
    const u = new URL(url);
    return { host: u.hostname, path: u.pathname };
  } catch {
    return { host: url, path: '' };
  }
}

/** Who is on the other end of a source link, as the link's own words. */
export function sourceName(url: string): string {
  const { host, path } = sourceUrl(url);
  if (REPO_HOSTS.has(host)) {
    const seg = path.split('/').filter(Boolean);
    if (seg.length >= 2) return `${seg[0]}/${seg[1]}`;
  }
  return SOURCE_PUBLISHERS[host] ?? host.replace(/^www\./, '');
}

/** The word that tells two links to the same publisher apart, or nothing. */
export function sourceKind(url: string): string | null {
  const { host, path } = sourceUrl(url);
  // A file in a repository is named by the file: two links into llama.cpp are a
  // discussion and a header, and the header's own name is what says which.
  if (host === 'github.com' && path.includes('/blob/')) return path.split('/').pop() ?? null;
  return SOURCE_KINDS.find((k) => k.marker.test(path))?.word ?? null;
}

/**
 * The Sources line under a machine or a model. Where one publisher is cited twice
 * the links carry what their own URLs say they are; where the URL says nothing,
 * the name stands on its own twice, which is still more than a number was.
 */
export function sourceLinks(urls: string[]): string {
  const names = urls.map(sourceName);
  const seen = new Map<string, number>();
  for (const n of names) seen.set(n, (seen.get(n) ?? 0) + 1);
  return urls
    .map((url, i) => {
      const kind = (seen.get(names[i]) ?? 0) > 1 ? sourceKind(url) : null;
      const text = kind ? `${names[i]} (${kind})` : names[i];
      return `<a href="${esc(url)}" rel="noopener">${esc(text)}</a>`;
    })
    .join(', ');
}
