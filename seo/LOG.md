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
- A run is not over until `git log --oneline -1 origin/main` shows the run's own commit. The
  2026-09-25 work sat unpushed for a day while the log said it had shipped; committing is not
  deploying, and an entry that claims a push nobody made is worse than no entry.

## Ryan's side

- [ ] Links from outside: the two news articles, r/LocalLLaMA, hardware reviewers who publish tok/s.

## Backlog (ordered by expected traffic impact)

- [ ] **Home page `og:url`.** One line in index.html, so it wants a pull request of its own now
      that PR #17 has merged; small enough to ride the next branch against the calculator's head.
- [ ] **Structured data names what 56 pages are about; 251 pages name nothing.** Add the page's
      subject (model, machine or question) to its JSON-LD.
- [ ] Seven head-to-head titles are still over 60 characters and cannot be cut without losing a name.
- [ ] Nothing in .github/workflows triggers on pull_request, so a PR is only tested by the person
      who merges it.
- [ ] The two Q8 model pages have three inbound pages each, counted in the build: their Q4 sibling,
      the memory guide and the leaderboard. Joint fewest on the site with /how-much-memory/12gb/.

## Runs

### 2026-09-26 — Yesterday's work was committed but never pushed, so the site did not have it
`origin/main` was a commit behind the log: c4e3aeb, the twelve-size ladder, existed only in this
repo while the 2026-09-25 entry said "Straight to main". Nothing was wrong with the work, only with
its delivery, so this run checked it rather than take its word, and got it out.
Re-verified on the fast-forwarded tree: 447 tests, typecheck clean, the full build with
`build:functions`, 320 pages every guard passing, 321 of 321 sitemap entries dated, and
`seo/page-dates.json` already in sync, so the 60 pages whose words changed go out dated. Read
rendered: all three rung forms (12 GB has no rung below, 512 GB none above, 48 and 96 GB both) and a
tier match-up, which offers both its sizes in one sentence, no maintainer language in any of them.
`checkSizeLadder()` re-tested by hand — every rung pointed one size too far up fails the build on 11
pages. That entry's claim is corrected and a standing order added: a run ends when `origin/main`
shows its commit. Model watch done, nothing new. Next: the home page `og:url`, in its own PR.

### 2026-09-25 — The twelve size pages are a ladder you can walk
Six of them (12, 36, 48, 96, 192, 512 GB) were reached from nothing but the machines sold at them and
the index above, two pages in all on three of them. Two kinds of page are about a size rather than a
machine and now link one: each size page names the rungs either side of it, where it had sent a reader
back to the index to find them, and the 18 head-to-heads between two memory tiers of one box offer
both sizes' pages. The least-linked page on the site goes from 2 inbound to 3, and the six to 3, 5,
17, 6, 4 and 4. Committed 2026-09-25, pushed 2026-09-26. Verified: 447 tests, typecheck clean, the full build with
`build:functions`, 320 pages every guard passing, 321 of 321 sitemap entries dated, three read back
rendered. `checkSizeLadder()` holds every size link on a page to the set it is allowed, and six
mutations of it all stop the build. Model watch done: dots3-note Preview, 280B/16B and Apache 2.0,
could be priced here and waits on a four-bit file size; Qwen3.8 Max and DeepSeek V4.1-Flash are out
on size. Next: the home page `og:url`, which wants its own pull request.

### 2026-09-24 — Two false sentences on /hardware/, and a guard so there can be no more
The machine index read its own table for you in prose nobody checked, and two claims in it were
false: the strongest model a machine holds is *the slowest thing it can run* (true of none of
the 56), and a smaller model on the same machine *pays back sooner* (false on 39 of the 54 that
pay back at all, because the model the table prices usually saves the most a day). Both are
figures now — 15 machines another model pays back sooner on, 39 where nothing does — and the
decade line is drawn from the data, so it changes the day a machine pays back in nine years.
`checkBoardLedes()` holds every claim in those three paragraphs to the rows parsed back out of
the rendered table, and /leaderboard/'s opening to the top row of each half of its own.
Straight to main. Verified: 447 tests, typecheck clean, full build with `build:functions`, 320
pages every guard passing, 321 of 321 sitemap entries dated, eight mutations of the new figures
all stopping the build. Model watch done, nothing new. Next: the six under-linked size pages.

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
