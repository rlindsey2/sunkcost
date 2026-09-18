/**
 * When each page last changed, for the sitemap's lastmod.
 *
 * A crawler reads lastmod to decide what to fetch again and how soon, and it only
 * keeps reading it while the dates hold up. One date across every page — the day the
 * prices were last checked — tells it nothing it can act on, and tells it something
 * false about a page that did not exist that day. A comparison added this morning
 * announcing itself as a fortnight old is asking to be crawled last.
 *
 * So the build fingerprints what a searcher actually reads: the title, the description
 * and the body between `<main>` and `</main>`. The header and the footer are left out
 * on purpose, because a site-wide link changing is not 253 pages changing. The home
 * page has no body of its own — the calculator draws it — so it is fingerprinted from
 * the whole of the HTML it serves, which under-reports a change made in the bundle and
 * never over-reports one.
 *
 * The answers live in `seo/page-dates.json`. A page whose fingerprint is the one
 * recorded there has not changed and keeps its date; one that differs, or one the file
 * has not seen before, changed, and the date is the day the build found it.
 *
 * The sitemap publishes a date only where the recorded fingerprint still matches the
 * page. That is the whole of the safety here: a ledger that was not committed alongside
 * the change it belongs to costs a few lastmods on one deploy, rather than stamping
 * today's date on the same page every day until someone notices.
 */
import { createHash } from 'node:crypto';

export type PageDate = {
  /** fingerprint of the page's title, description and main body */
  hash: string;
  /** the day that fingerprint first appeared, or null for a page dated before this file existed */
  changed: string | null;
};

export type PageDates = {
  note: string;
  pages: Record<string, PageDate>;
};

export const DATES_NOTE =
  'When each page last changed, for sitemap lastmod. Written by npm run build:pages; ' +
  'commit it with the change it records. A date is published only while the page still ' +
  'hashes to what is recorded here, so a stale entry costs a lastmod rather than printing ' +
  'a wrong date. Generated — edit the build, not this file.';

/** the body a searcher reads, without the header and footer every page shares */
export function mainOf(html: string): string {
  const open = html.indexOf('<main');
  const close = html.lastIndexOf('</main>');
  if (open === -1 || close === -1 || close < open) return html;
  return html.slice(open, close + '</main>'.length);
}

/** one page's fingerprint: the words that would send someone here, and what they find */
export function fingerprint(parts: { title: string; description: string; body: string }): string {
  return createHash('sha256')
    .update(`${parts.title}\n${parts.description}\n${parts.body}`)
    .digest('hex')
    .slice(0, 16);
}

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

/**
 * The date to publish for a page: the one recorded, and only while the page still
 * matches what was recorded. Anything else is a page we know changed and cannot say
 * when, so it goes into the sitemap without a date rather than with a guess.
 */
export function publishedDate(previous: PageDates | null, path: string, hash: string): string | null {
  const was = previous?.pages?.[path];
  if (!was || was.hash !== hash || !was.changed) return null;
  return isDate(was.changed) ? was.changed : null;
}

/**
 * The ledger to write. Pages that still match keep their date; pages that differ, and
 * pages this file has not seen, changed today. The exception is the first run of all:
 * with nothing to compare against, every page's date is unknown rather than today,
 * because a build is not evidence that 254 pages changed this morning. Each of those
 * gets its real date the first time its content moves.
 */
export function nextDates(
  previous: PageDates | null,
  pages: { path: string; hash: string }[],
  today: string,
): PageDates {
  const seeding = !previous || Object.keys(previous.pages ?? {}).length === 0;
  const next: Record<string, PageDate> = {};
  for (const { path, hash } of [...pages].sort((a, b) => a.path.localeCompare(b.path))) {
    const was = previous?.pages?.[path];
    if (was && was.hash === hash) next[path] = { hash, changed: was.changed };
    else next[path] = { hash, changed: seeding ? null : today };
  }
  return { note: DATES_NOTE, pages: next };
}
