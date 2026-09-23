# SEO log

Read this file and seo/SEARCH-CONSOLE.md before doing anything. The log before 2026-09-23 is in
seo/archive/ and is not required reading; it grew to 10,000 lines, which is why this one has rules.

## Rules for this file

- A run entry is at most 12 lines: date, what changed, commit or PR, how it was verified, what next.
  No essays, no restating earlier entries, no commentary on the deploy unless it failed.
- The backlog holds open items only, one to three lines each. Move a finished item into the run
  entry that finished it and delete it here. Do not keep "nothing to do" items.
- Once this file passes 300 lines, move the oldest run entries to seo/archive/.

## Standing orders (from Ryan, via the 2026-09-23 Search Console read)

- No new page types, and no new head-to-heads, until Search Console shows the existing pages
  indexed and a non-brand query with clicks. Depth over count.
- The model watch (`npm run model-watch`, seo/MODEL-WATCH.md) stays daily and comes first.
- Deploys are not free: one push per run, with the log change in the same push as the work.

## Ryan's side

- [ ] Links from outside: the two news articles, r/LocalLLaMA, hardware reviewers who publish tok/s.

## Backlog (ordered by expected traffic impact)

- [ ] **`/hardware/` and `/leaderboard/` still describe their tables in hand-written prose beside
      recomputed figures.** Hold each claim with a build check the way `/best/` is held.
- [ ] **Six of the twelve size pages (12, 36, 48, 96, 192, 512 GB) are reached only from the machines
      and the memory guide.** Either a sentence somewhere genuinely wants to link them, or close this.
- [ ] **Home page `og:url`.** One line in index.html, so it wants a pull request of its own now
      that PR #17 has merged; small enough to ride the next branch against the calculator's head.
- [ ] **Structured data names what 56 pages are about; 251 pages name nothing.** Add the page's
      subject (model, machine or question) to its JSON-LD.
- [ ] Seven head-to-head titles are still over 60 characters and cannot be cut without losing a name.
- [ ] Nothing in .github/workflows triggers on pull_request, so a PR is only tested by the person
      who merges it.
- [ ] The two Q8 model pages have two inbound pages each, the fewest on the site.

## Runs

### 2026-09-23 — Model pages open with the speed on their cheapest machine
The only non-brand impressions this site has are exact model names, and what people put after one
is a machine or "tokens per second". Model pages answered neither where a search result can see
it: the first paragraph stopped at the weights, and the description spent its 155 characters on
weights, machine and pay-back. Both now carry the speed on the cheapest machine that runs the
model, at 32k, saying whether it was measured or worked out from bandwidth. 54 of the 55 model
pages gained it; Tencent Hy3 has no machine here and so claims nothing.
Verified: 447 tests, typecheck clean, the full build including `build:functions`, 320 pages with
every guard passing plus a new one — `checkLedeSpeeds()` holds each first paragraph's figure to
the speed that machine's own row in the table prints, to the digit, and refuses a speed on a page
with no machine. All 54 descriptions fit 155 characters. Five pages read back rendered.
Model watch done, nothing new: Grok 4.7 ruled out, no weights. Next: the `/hardware/` and
`/leaderboard/` prose, the next backlog item.

### 2026-09-22 — PR #17 merged, verified on main
Merged at 23:20 UTC as `f26ac31`, so the home page has a heading on the live site. (The two entries
below are dated a day ahead of UTC; this one is not.) Verified on merged main rather than assumed:
447 tests, typecheck clean, validate clean but for the one null price, the full build, **320 pages**
with every guard passing. The conflict the pull request warned about cost nothing: `/` carries
`<lastmod>2026-09-22</lastmod>` and **321 of 321 sitemap entries carry a date**, so the rebuild was
done properly and `seo/page-dates.json` is in sync with the tree. Read rendered in Chromium at 390,
900 and 1280px: one `<h1>`, weight 400, in the document at all three and painted at the two where
the bar has room. The duplicated `--ok-text` line is gone and the three that remain are the light,
dark and forced-dark contexts, which is right.
Next: the model-page title item at the top of the backlog.

### 2026-09-23 — PR #17 un-conflicted
Ryan asked for the merge issue on PR #17 fixed. It was three days behind main. Merged main into
`seo/home-h1` as `fc49f08` (merge commit, not a rebase). One conflict, the one its own description
predicted: `seo/page-dates.json`, the `"/"` hash. Resolved by taking a side and running
`npm run build:pages`, which wrote `d47470180e0b4932` — the hash that description measured three
days ago — dated 2026-09-22, the build's UTC day. Verified on the merged tree: 447 tests, typecheck clean, full build with
`build:functions`, 320 pages every guard passing, and `dist/index.html` read back with exactly one
`<h1>`. The merged tree against main is this PR and nothing else. GitHub reports `clean`.
Next: the model-page title item.

### 2026-09-23 — Search Console read, log restarted
Ryan exported Search Console, including the crawled-not-indexed URL list. Findings in
seo/SEARCH-CONSOLE.md; standing orders above. The not-indexed pages are spread across every page
type and were first crawled on 19 or 20 September, so nothing is cut. The old log moved to
seo/archive/. No page changed. Next: the model-page title item.
