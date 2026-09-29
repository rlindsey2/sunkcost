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
- (agent, 2026-09-26) `git fetch origin main` before judging what main has. This container clones
  shallow and stores a stale `origin/main`, a commit behind the branch actually deployed. Confirm a
  push landed against the Actions run list, not the local ref.

## Ryan's side

- [ ] Links from outside: the two news articles, r/LocalLLaMA, hardware reviewers who publish tok/s.

## Backlog (ordered by expected traffic impact)

- [ ] Three head-to-head titles are over 60 characters, at 61, 62 and 63, and cannot be cut without
      losing a name a searcher typed. The build counts them every run.
- [ ] Nothing in .github/workflows triggers on pull_request, so a PR is only tested by the person
      who merges it.
- [ ] /how-much-memory/12gb/ is now the least-linked page on the site on its own, at 3 inbound:
      the memory guide, the index and the 16 GB rung above it. No machine sold at 12 GB is current.

## Runs

### 2026-09-29 — Five size pages say what a heavier build costs
Two models here are listed at two precisions, and a size page's table counts one build per model, so it
could not show the thing a buyer is choosing: same model, same machine, twice the weights. Said now on
the five sizes where it decides what runs. 12, 32 and 48 GB hold only the lighter build; 16 and 64 GB
are the smallest that hold both; the other seven say nothing, because there both fit or neither does.
Each line carries both footprints at 32k and the memory that size hands a model, from the figures the
table beside it prints. The two Q8 pages go from 3 inbound to 5 and 6, closing the backlog item.
Straight to main. Verified: 452 tests, typecheck clean, the full build with build:functions, 320 pages
every guard passing, 321 of 321 dated with 5 moved, two read rendered. `checkPrecisionBuilds()` binds
each figure to its own build; of six mutations, swapped footprints alone got through, and the guard
was tightened until it did not.
Watch done: MiMo-V2.6-Distill-Qwen-9B has a citable 5.84 GB at Q4_K_M and waits only on an index
score; Kimi K2.6 is out on size at 1T. Next: /how-much-memory/12gb/, the least-linked page now.

### 2026-09-28 — 78 model head-to-heads say in the result what separates the two models
Every model-vs-model description ended in a list of the page's own columns — "Size, context, licence,
API price and the cheapest machine that runs each" — 73 of the 155 characters a result shows, given to
a table of contents. Each now ends in a figure that separates the two: the memory each one asks of a
machine at 32k, or, on the pairs level in both score and memory, the speed each runs at where they
meet. Straight to main. Verified: 452 tests, typecheck clean, the full build, 320 pages every guard
passing, 321 of 321 dated with 78 moved and no others, two read rendered. The new
`checkDescriptionFigures()` holds all 1,385 figures in 320 descriptions to the words of the page they
describe, and five mutations of it stop the build. Closed: no schema.org node fits the 20 subject-less
pages — a memory size is no type's thing, an index's ItemList restates its own links, and the home
page's WebApplication wants an offer or a rating this site has not got. Watch done: MiMo-V2.6-Flash is
the closest candidate yet, score and price sourced, one four-bit size short. Next: the Q8 pages' links.

### 2026-09-27 — 300 pages now say what they are about, in the words they print
Structured data named a subject on 56 pages and nothing on 264. A model page now carries its model
as a SoftwareApplication (parameters, active parameters where they differ, quantisation, weights on
disk, maximum context, licence), and the 189 head-to-heads carry both their sides, each under the
`@id` its own page already gives it, so the three pages that mention one machine name one entity
between them rather than three. No score and no rental price: both need their caveat, and a
property has nowhere to put one. `checkPageSubjects()` holds every published figure to the text of
the subject's own page, word for word, and every head-to-head to the two sides it sets. Straight to
main. Verified: 451 tests, typecheck clean, the full build with `build:functions`, 320 pages every
guard passing, 321 of 321 sitemap entries dated, no page's date moved, six mutations all stopping
the build. Also PR #19, the home page's `og:url`, off the backlog. Model watch done: Qwen3.8-Omni-Flash
is hosted only, Qwen-Image-2.1 is an image model, GGUF NVFP4 tooling merged with no build to price.

### 2026-09-26 — Model watch, and a false alarm about yesterday's deploy that I put in the log
The run opened on a detached HEAD at c4e3aeb with a stale `origin/main` reading 27c9bb0, and I took
that for yesterday's work committed but never pushed. Wrong: c4e3aeb was pushed 2026-09-25 at 20:42
UTC, deploy #291 succeeded, the ladder has been live since, and yesterday's entry was accurate. I
judged the remote without fetching. Commit 352e5d1 carries the false version — an edit to yesterday's
entry and a standing order built on a failure that never happened; both are reverted, and the order
now says fetch and confirm against the Actions list. Three pushes this run against the one-push rule,
because a log that misreports its own history misleads every run that reads it.
The watch is the real work and closed one open question: GLM-5.3, as against the GLM-5.3-Flash this
site prices, is about 744B and ruled out on size, with sources; dots3-note still has no four-bit build
to cite. The wasted re-verification was clean, on work already live: 447 tests, full build, 320 pages
every guard passing, 321 of 321 dated, five read rendered. No page changed. Next: `og:url`, in a PR.

### 2026-09-25 — The twelve size pages are a ladder you can walk
Six of them (12, 36, 48, 96, 192, 512 GB) were reached from nothing but the machines sold at them and
the index above, two pages in all on three of them. Two kinds of page are about a size rather than a
machine and now link one: each size page names the rungs either side of it, where it had sent a reader
back to the index to find them, and the 18 head-to-heads between two memory tiers of one box offer
both sizes' pages. The least-linked page on the site goes from 2 inbound to 3, and the six to 3, 5,
17, 6, 4 and 4. Straight to main. Verified: 447 tests, typecheck clean, the full build with
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
