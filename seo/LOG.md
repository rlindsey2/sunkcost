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

- [ ] Export the URL list for "Crawled, currently not indexed" (Search Console → Pages → click the
      row → Export) and drop it in seo/exports/. Until then the 58 pages are unknown.
- [ ] Merge or close PR #17 (home page heading and og:url).
- [ ] Links from outside: the two news articles, r/LocalLLaMA, hardware reviewers who publish tok/s.

## Backlog (ordered by expected traffic impact)

- [ ] **Model pages answer the search people actually type: model name + machine, or model name +
      "tokens per second".** The only non-brand impressions so far are exact model names. Check that
      each model page's title and first paragraph carry the model's name as people write it and the
      tok/s on its cheapest machine. scripts/build-pages.ts, a push.
- [ ] **Head-to-heads: when the crawled-not-indexed list arrives, decide which of the 190 earn a
      page.** Candidates to keep are pairs people compare by name (Mac mini vs Mac Studio, RTX 3090
      vs 4090, DGX Spark vs Strix Halo). The rest are better as rows on the /compare/ index than as
      pages. Do not act before the list arrives.
- [ ] **`/hardware/` and `/leaderboard/` still describe their tables in hand-written prose beside
      recomputed figures.** Hold each claim with a build check the way `/best/` is held.
- [ ] **Six of the twelve size pages (12, 36, 48, 96, 192, 512 GB) are reached only from the machines
      and the memory guide.** Either a sentence somewhere genuinely wants to link them, or close this.
- [ ] **Home page `og:url`.** One line in index.html; rides PR #17.
- [ ] **Structured data names what 56 pages are about; 251 pages name nothing.** Add the page's
      subject (model, machine or question) to its JSON-LD.
- [ ] Seven head-to-head titles are still over 60 characters and cannot be cut without losing a name.
- [ ] Nothing in .github/workflows triggers on pull_request, so a PR is only tested by the person
      who merges it.
- [ ] The two Q8 model pages have two inbound pages each, the fewest on the site.

## Runs

### 2026-09-23 — Search Console read, log restarted
Ryan exported Search Console. Findings in seo/SEARCH-CONSOLE.md; standing orders above.
The old log moved to seo/archive/. No page changed. Next: the model-page title item.
