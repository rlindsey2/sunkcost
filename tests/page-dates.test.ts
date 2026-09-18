import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { DATES_NOTE, fingerprint, mainOf, nextDates, publishedDate, type PageDates } from '../src/page-dates';

const recorded = JSON.parse(readFileSync(new URL('../seo/page-dates.json', import.meta.url), 'utf8')) as PageDates;
const page = (body: string, title = 'Best GPU for local LLMs', description = 'Seven cards ranked.') =>
  fingerprint({ title, description, body });

describe('the fingerprint a page is dated by', () => {
  it('is the same answer for the same page twice', () => {
    expect(page('<main>one</main>')).toBe(page('<main>one</main>'));
  });

  it('moves when a word a searcher reads moves', () => {
    expect(page('<main>19 years</main>')).not.toBe(page('<main>18 years</main>'));
    expect(page('<main>one</main>', 'Another title')).not.toBe(page('<main>one</main>'));
    expect(page('<main>one</main>', undefined, 'Another description')).not.toBe(page('<main>one</main>'));
  });

  it('does not move when the header or the footer does', () => {
    const before = '<header>old nav</header><main class="doc-main">the body</main><footer>five links</footer>';
    const after = '<header>new nav</header><main class="doc-main">the body</main><footer>six links</footer>';
    expect(page(mainOf(before))).toBe(page(mainOf(after)));
    // and it does move when the body inside them does
    expect(page(mainOf(before))).not.toBe(page(mainOf(after.replace('the body', 'another body'))));
  });

  it('reads to the last closing tag, so a nested main does not cut the body short', () => {
    const html = '<header>h</header><main><main>inner</main>the rest</main><footer>f</footer>';
    expect(mainOf(html)).toContain('the rest');
    expect(mainOf(html)).not.toContain('<footer>');
  });

  it('falls back to the whole document where there is no main to find', () => {
    expect(mainOf('<body>no main here</body>')).toBe('<body>no main here</body>');
  });
});

describe('the date the sitemap publishes', () => {
  const ledger: PageDates = {
    note: DATES_NOTE,
    pages: {
      '/best-gpu/': { hash: 'aaaa', changed: '2026-09-12' },
      '/leaderboard/': { hash: 'bbbb', changed: null },
      '/best/': { hash: 'cccc', changed: 'last Tuesday' },
    },
  };

  it('is the recorded one while the page still says what was recorded', () => {
    expect(publishedDate(ledger, '/best-gpu/', 'aaaa')).toBe('2026-09-12');
  });

  it('is nothing at all once the page has moved on from it', () => {
    // the point of the whole design: a date left behind by a changed page is the
    // one wrong answer a crawler cannot see, so it is not published
    expect(publishedDate(ledger, '/best-gpu/', 'dddd')).toBeNull();
  });

  it('is nothing for a page nothing has recorded, and nothing for a date not yet known', () => {
    expect(publishedDate(ledger, '/hardware/', 'aaaa')).toBeNull();
    expect(publishedDate(null, '/best-gpu/', 'aaaa')).toBeNull();
    expect(publishedDate(ledger, '/leaderboard/', 'bbbb')).toBeNull();
  });

  it('is nothing where the record cannot be read as a day', () => {
    expect(publishedDate(ledger, '/best/', 'cccc')).toBeNull();
  });
});

describe('the record the build writes', () => {
  const pages = [
    { path: '/best-gpu/', hash: 'aaaa' },
    { path: '/leaderboard/', hash: 'bbbb' },
  ];

  it('dates nothing on the first run of all, because a build is not a change', () => {
    const seeded = nextDates(null, pages, '2026-09-18');
    expect(Object.values(seeded.pages).map((p) => p.changed)).toEqual([null, null]);
    expect(seeded.pages['/best-gpu/'].hash).toBe('aaaa');
  });

  it('leaves a page that has not changed exactly as it found it', () => {
    const was: PageDates = { note: '', pages: { '/best-gpu/': { hash: 'aaaa', changed: '2026-09-12' }, '/leaderboard/': { hash: 'bbbb', changed: null } } };
    const now = nextDates(was, pages, '2026-09-18');
    expect(now.pages['/best-gpu/'].changed).toBe('2026-09-12');
    expect(now.pages['/leaderboard/'].changed).toBeNull();
  });

  it('dates a page that changed, and a page it has never seen, today', () => {
    const was: PageDates = { note: '', pages: { '/best-gpu/': { hash: 'zzzz', changed: '2026-09-12' } } };
    const now = nextDates(was, pages, '2026-09-18');
    expect(now.pages['/best-gpu/']).toEqual({ hash: 'aaaa', changed: '2026-09-18' });
    expect(now.pages['/leaderboard/']).toEqual({ hash: 'bbbb', changed: '2026-09-18' });
  });

  it('forgets a page the site no longer writes, and keeps the file in one order', () => {
    const was: PageDates = { note: '', pages: { '/gone/': { hash: 'xxxx', changed: '2026-09-12' } } };
    const now = nextDates(was, [...pages].reverse(), '2026-09-18');
    expect(now.pages['/gone/']).toBeUndefined();
    expect(Object.keys(now.pages)).toEqual(['/best-gpu/', '/leaderboard/']);
  });
});

describe('the record in the repository', () => {
  it('is a fingerprint and a day, or a fingerprint and nothing', () => {
    const entries = Object.entries(recorded.pages);
    expect(entries.length).toBeGreaterThan(200);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    for (const [path, at] of entries) {
      expect(path, `${path} is not a page address`).toMatch(/^\/([\w.\-/]*\/)?$/);
      expect(at.hash, `${path} has no fingerprint`).toMatch(/^[0-9a-f]{16}$/);
      if (at.changed === null) continue;
      expect(at.changed, `${path} is dated ${at.changed}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(at.changed <= tomorrow, `${path} is dated ${at.changed}, which has not happened yet`).toBe(true);
    }
  });

  it('covers the home page and says what it is for', () => {
    expect(recorded.pages['/']).toBeDefined();
    expect(recorded.note).toBe(DATES_NOTE);
  });
});
