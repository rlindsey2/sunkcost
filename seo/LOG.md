# SEO log

Read this before doing anything. One entry per run, newest first. Pick up the top open item in
the backlog, or the open item the previous run said to continue. Never redo a done item.

## Ryan's side (needs the site owner)

- [ ] Review and merge (or close) [PR #1](https://github.com/rlindsey2/sunkcost/pull/1), the
      `/how-much-memory/` page. It has been open since 12:49 on 2026-09-16 and is the reason six
      runs in a row have taken smaller items instead of the top backlog entry, which is
      question pages. **It is a draft**, so the merge button is disabled until it is marked ready
      for review — that is one click, and it may be the whole reason nothing has moved. It also
      stopped merging at some point during those five runs, which the 2026-09-16 merge run fixed;
      see the top run entry. Ryan has now been notified twice: once after the list cards shipped,
      and once about the draft status, which was new information rather than a repeat. **Do not
      notify about this PR again** — the queue below is all doable without it, and a third ping
      would be nagging.

- [ ] Review and merge (or close) [PR #2](https://github.com/rlindsey2/sunkcost/pull/2), the
      calculator's own head: self-hosted fonts and the home page's `WebSite` markup. Also a
      draft, so the same one click applies. It is independent of PR #1 and touches none of the
      same files, so the two can be merged in either order. Ryan has been pinged once about it,
      which is the first ping on this PR; do not ping about it again.

- [x] Search Console verified and the sitemap submitted. Done 2026-09-16 by Ryan. Cloudflare Web
      Analytics is on as of the same day, injected at the edge on each deploy.
- [ ] Commit the Search Console CSV exports under seo/exports/ once there is data. Verification
      was 2026-09-16, so indexing data should appear within days and query data is worth looking
      at from roughly mid-October. **Do not ask again before then**, and do not treat an empty
      seo/exports/ as a blocker in the meantime — the backlog below is all doable without it.
      When it arrives, the Indexing → Pages export is worth as much as the query one: it says
      which of the 188 generated pages Google actually indexed, which is the first thing to fix
      if the answer is "not many".
- [ ] Bing Webmaster Tools, which can now import the verified property straight from Search
      Console. Bing still shows breadcrumb rich results that Google has retired, so the
      structured data shipped on 2026-09-16 has more upside there than on Google.
- [ ] Confirm the breadcrumb markup is detected on a live page. Now that the property is
      verified this is easiest inside Search Console: paste
      https://sunkcost.ai/hardware/geforce-rtx-3090-24/ into the URL inspection bar at the top
      and read the Enhancements section, which lists the structured data Google parsed. The
      Breadcrumbs report under Enhancements fills in over the following weeks and covers all 188
      pages at once, which is better than checking one. The markup was verified against the
      local build, which is the build the deploy runs, so this is a confirmation, not a check.
- [ ] One request, once: does `https://www.sunkcost.ai/best/` answer, and with what? Everything
      else about duplicate addresses was settled in the build on 2026-09-16, but the egress
      policy here refuses `sunkcost.ai`, so this is the one part the agent cannot see.
      `curl -sI https://www.sunkcost.ai/best/ | head -3` says it in a line. A 301 to the apex
      is the answer wanted. A 200 means www is a second copy of the site, which the canonical
      tag on every page already tells Google to ignore, so it is untidy rather than urgent; the
      fix is a redirect rule on the Pages project, not in this repo.
- [ ] Commit `npm run submissions` output under seo/exports/ when there is enough of it. The
      agent has no database access by design, and that file is the only route to a page built
      from what people actually entered.

What the reports should look like, so nothing alarming gets misread: the sitemap holds 189 URLs,
the 188 generated pages plus the calculator. The ~1,900 /s/ share pages are deliberately absent
from it and carry `noindex`, so any of them Google finds through a link will show as "Excluded
by noindex" in the Pages report. That is the design working, not a fault, and nothing should be
done about it.

The Search Console API, with a GCP service account, was considered on 2026-09-16 and deferred.
For one property, one person and a fortnightly pull, the CSV export is thirty seconds and the
service account is an hour in IAM plus a live credential in an hourly agent's environment. Do
not propose it again unless the manual export has become a chore, or the question being asked
needs more than 25k rows or per-URL index status across all 188 pages — `urlInspection` is the
one call worth the setup, and only then.

### What the agent can and cannot reach (checked 2026-09-16)

Outbound HTTPS goes through an egress proxy that answers 403 to anything not on the
environment's allow-list. Both `curl` and WebFetch go through it; WebSearch does not, and works.
A policy change does not reach a session already running — the environment sets it at container
start — so a run that finds a host blocked should note it and move on rather than retry.

Hosts worth having on the list, and what each unlocks:

- `sunkcost.ai` — reading the site's own live pages: confirming a deploy actually served the
  markup, checking headers and canonicals as delivered rather than as built. The most useful
  one by far.
- `www.googleapis.com` — reachable as of 2026-09-16, and the PageSpeed Insights API on it is
  still not usable. Keyless, the call answers 429: "Quota exceeded for quota metric 'Queries'
  … for consumer project_number:583797351490". That consumer is the anonymous project every
  keyless caller shares, and it is exhausted, so this is not something a later run can wait
  out. A free PSI key (console.cloud.google.com, enable the PageSpeed Insights API, no
  billing) in the environment as `PSI_API_KEY` would turn Core Web Vitals into a number the
  agent can watch. Until then, pagespeed.web.dev is a JavaScript app and cannot be fetched, so
  the measurement stays on Ryan's side.
- `validator.schema.org` — structured data validation.

Google's Rich Results Test has no public API and its page is a JavaScript app, so allow-listing
`search.google.com` would not make it usable by the agent. That check stays on Ryan's side.

## Backlog (ordered; the agent keeps this list current)

- [x] Audit every generated page's `<title>` and meta description (scripts/build-pages.ts,
      src/pagekit.ts): each title unique, under 60 characters, leading with the words people
      search; each description a plain answer under 155 characters. Done 2026-09-16.
- [x] Structured data: BreadcrumbList everywhere and Product on hardware pages. Done 2026-09-16.
      No Offer and no FAQPage — reasons in the run entry below.
- [x] Internal linking: no generated page is an orphan any more, and the build fails if one
      appears. Done 2026-09-16; the run entry has what was actually wrong, which was worse than
      this item assumed.
- [ ] Question pages for the searches people actually type. The memory one is written and waiting
      in PR #1 as /how-much-memory/ and covers "how much RAM to run a 70B model" and its variants;
      the page type and its helpers are in place, so the next one is much less work than the first.
      Still open, roughly in the order they are worth writing: "best GPU for local LLMs" (nothing
      here filters the list to cards, and /best/ answers by usage rather than by part), "local
      LLM vs API cost" (the site's whole thesis, and the home page is the only thing that states
      it), "RTX 3090 for local LLM worth it" and "is a Mac mini good for local LLMs" (both need a
      hard look first: the per-machine pages may already answer them, and a second page saying
      the same thing in different words is the duplicate this site should not create). Each
      answers in the first paragraph with the site's own numbers, links into the calculator with
      the configuration prefilled, and cites sources.
- [ ] The 47 model head-to-heads are the thin half that is left. The 28 machine ones were
      rewritten on 2026-09-16 (see the top run entry); the model ones were deliberately left
      alone that run and are still ~190 words with no subheading, though they do at least compute
      their own lede rather than sharing one. What they lack is the same thing: a section that
      says what the difference between two models actually buys, in the site's own numbers.
      `runnersFor` already gives the machines each one needs, and the price gap between the
      cheapest machine that runs each is the buying decision nothing on the site states.

- [ ] An index at /compare/. The crawl-path half of this is now done — all 75 comparison pages
      are linked from the machines and models they compare — but "mac studio vs rtx 5090" style
      queries want a page that lists the match-ups, and nothing here does. New page type, so a PR.
- [~] The home page carries no JSON-LD. Google's site-name feature reads `WebSite` markup on the
      home page specifically, so /leaderboard/'s copy of it does not count. Written and waiting in
      PR #2, with a test holding it identical to the node `pageGraph()` builds. Reaches the site
      when that PR merges.
- [ ] A "what people entered" page updated from `npm run submissions` output that Ryan commits
      under seo/exports/ (never from live database access; the agent has none).
- [x] Core Web Vitals on the generated pages. The fonts were the whole of it and they are now
      served from this origin; done 2026-09-16. Image sizing turned out not to apply: the 188
      generated pages carry no `<img>` and no inline `<svg>` between them, so there is no image
      to size. What is left of this item is the calculator's own head, which is the next entry
      below, and a measurement this environment cannot take (see the PageSpeed note above).
- [~] The calculator at index.html loading both fonts from Google. Done on the branch and waiting
      in PR #2, paired with the JSON-LD item above as planned. The faces are now in src/fonts.css,
      which styles.css imports and Vite folds into the bundle; a test keeps that block identical to
      the one in public/page.css. The 1,894 /s/ share pages inherit the same head, so they stop
      asking Google too. Reaches the site when that PR merges.
- [x] Canonical and duplicate control. Audited and now enforced by the build. Done 2026-09-16;
      the run entry has what was actually wrong, which was the 45 links out of /best/ rather
      than anything in the page set. One part is not checkable from here and is on Ryan's side
      below: whether the apex and www serve one URL at the edge.
- [x] Open Graph images. Every page has a card that answers its own question: model and machine
      pages from `cardSvg`, the 75 comparisons from `versusCardSvg`, `/leaderboard/` and `/best/`
      from `listCardSvg`, and `/how-much-memory/` from `memoryCard` (2026-09-16, on the PR branch,
      so it reaches main when PR #1 does). No page anywhere now falls back to `/og/default.png`,
      and `checkOgCards` fails the build if a new one tries to.
- [ ] Nothing in `.github/workflows/` triggers on `pull_request`. `deploy.yml` is the only
      workflow and it runs on push to `main` and on `workflow_dispatch`, so a PR from this agent
      gets no test run, no build and no signal at all: the first time CI sees the code is the
      merge, on the branch that deploys to the live site. Every PR here has therefore been
      verified only by what the agent ran locally. A second workflow that runs `npm ci`, `npm test`
      and `npm run build` on `pull_request` would cost one file and catch a bad PR before it
      reaches main. It is infrastructure rather than SEO, so it is Ryan's call, but it is cheap and
      it protects the thing every other item on this list depends on.

- [ ] Two model counts are live on the site and they do not match: the machine pages count
      against the 39 current models that `computeView` puts in `rows`, and /how-much-memory/
      counts all 55, because the model people mean by "a 70B" is Llama 3.3 70B and that one is
      marked legacy. Both pages say which denominator they use, so neither is wrong, but a
      reader moving between them sees "48 models fit" on one page and "38" on another for the
      same machine. Worth settling on one rule, which is a judgement call for Ryan rather than
      an SEO fix.
- [ ] `/hardware/geforce-rtx-3060-12/` shows as "NVIDIA GeForce RTX 3060 12GB, 12GB" everywhere
      its label is rendered, because `chip` in data/hardware.json ends in the memory size that
      `hardwareLabel()` then appends again. The fix is a data edit, which the agent may not make.
      Cosmetic, but it is on a page people do search for.
- [ ] The 7 head-to-head titles still over 60 characters are all pairs of long machine or model
      names (worst: MacBook Air M5 (15-inch), 16GB vs MacBook Pro M5 Pro (16-inch), 64GB, at 68).
      Shortening them further means dropping a memory size or a screen size, which are the things
      that tell two Macs apart. Probably leave, but worth a second look with query data.

## Runs

### 2026-09-16 — the 28 head-to-heads say which machine wins

Two PRs now wait on Ryan and the rule holds, so this run took something that goes straight to
main. The last entry offered the `pull_request` CI workflow or a research hour. It turned out
there was something better, found by measuring the page set rather than reading the backlog:
**the 75 comparison pages are the thin half of this site.** Median 191 words against 453 on model
pages and 709 on machine pages, no `<h2>` on any of them, and 11 internal links. That is 40% of
the site's pages. Commit `3cbcbe3`, pushed to main.

Looking at why they were thin turned up three figures that were worse than thin. A head-to-head is
read as a buying decision, so every number on one has to survive being set beside its opposite:

- **All 56 speeds on the 28 machine pages were estimated from memory bandwidth, and this was the
  one place on the site that printed one without saying so.** The leaderboard labels it, the model
  pages label it, the OG cards leave speed off entirely for exactly this reason (see the cards
  run below). These pages did not.
- **On 12 of the 28 pairs the two speed cells were for different models.** Each column took the
  strongest model its own machine could hold, so under a row headed "Speed on that model" the
  $1,699 Mac mini M5 Pro read 29 tok/s against the $5,099 Mac Studio's 25. The mini was running
  Gemma 4 12B and the Studio Qwen3.8 27B. Side by side under one row label that is a speed
  comparison, and it was not one.
- **A graphics card priced without the PC around it sat next to a complete computer's price on 13
  pages.** `/best/`, the leaderboard and the machine pages all say "card only"; this table said
  `$18,000` next to `$1,499` and left the reader to it.

What the pages do now. The shared lede ("Two machines people weigh against each other…", the same
sentence on all 28) is gone, and each page opens with the answer: what each machine holds, what it
costs, which is quicker on a model they both run, and whether either ever pays for itself. Then
either a side-by-side section on the strongest model both hold — the race the main table cannot
give when the two columns are running different models — or nothing, where the columns already
match. Then what the extra memory actually buys, named model by model with weights, what each
needs at 32k and how fast it runs, or a line saying memory is not what separates these two.

**The pay-back it now shows is the unflattering kind this site is for.** On the MacBook Air against
the RTX PRO 6000, the card is 13× faster on the model both hold, and on that model it pays back in
1,343 years against the Air's 118, because $18,000 of card saves no more per day than $1,499 of
laptop does. The old page showed one pay-back figure each, on different models, and said nothing.

One rule worth keeping: anything the prose says about two speeds is worked out from the **rounded
figures the page prints**, not from the precision behind them. The first build said "about 7.6×
faster: 78 tok/s against 10", and 78 ÷ 10 is 7.8. A reader dividing one figure on the page by
another now gets the third.

**Verified against the previous build, page by page.** Built the whole set twice, once from a
worktree at `origin/main` and once with the change, and compared all 188 pages: **28 differ and
160 are byte-identical**, the 28 being exactly the machine head-to-heads. The 47 model
head-to-heads, all 55 model pages, all 56 machine pages, `/leaderboard/`, `/best/` and
`sitemap.xml` are untouched. On the 28 that changed, the `<head>` is **byte-identical on all 28**,
so every title, description, canonical and card address is what it was and nothing needs
re-indexing. Median words in `<main>` 153 → 454, internal links 11 → 21, minimum 0 `<h2>` → 2.

Then checked the claims against the tables they sit with, by parsing the built pages: 132 prose
claims cross-checked on 28 pages, and every one matches the row beside it — the model counts
against "Models that fit", the price gap against the Price row, the speed figures and the ratio
against the row they describe, the pay-back durations against the pay-back row, and "holds N
models the other cannot" against the difference in the counts. No speed anywhere without its
basis, no `undefined`, no `NaN`, no maintainer language, no internal link out of canonical form,
every table and heading balanced. Read three finished pages end to end as text: a Mac pair, a Mac
against a card, and a Strix Halo box against a card.

Also `npm test` (121 passing, 8 new), `npm run typecheck`, and the full `npm run build` including
`build:og`, `build:share` and `build:functions`, all clean here. The three guarantees that matter
are held by tests rather than by good intentions, and each was proved by breaking it on purpose
and watching its own test fail by name: a speed printed without its basis, a ratio worked out from
precision the page does not show, and the "each on its own strongest model" caveat appearing on a
page where both columns run the same model.

One thing found and fixed mid-run rather than shipped: the first draft put that caveat on every
page, including the 16 where both columns run the same model, where it is simply false. The
cross-check above is what caught it.

**Worth knowing for the next run that starts here.** The container's local `main` was stale at
`94aa957`, the seed commit, while `origin/main` had all fourteen SEO commits. `git checkout main`
says "up to date with origin/main" *before* fetching, so it looks fine. `npm test` reporting 61
passing instead of 113, or `seo/LOG.md` being 2 KB instead of 40 KB, is that and nothing worse.
Fetch and fast-forward before reading anything.

Nothing else on main changed this run.

**Continue next:** the same treatment for the 47 model head-to-heads is the obvious follow-on and
is now a backlog item — they already compute a real lede, so they are in better shape than these
were, but they are still ~190 words with no subheading and they are the larger half. Failing that,
the `pull_request` CI workflow is still unwritten and still protects both waiting PRs. If PR #1
has merged, the next question page is "best GPU for local LLMs" instead of either.

### 2026-09-16 — the calculator's own head

PR #1 is still open, still a draft and still unreviewed, so the standing rule holds: no second new
page while it waits. This run took what the last entry said to continue, which is the two backlog
items that live in one file's head and overlap nothing on that branch. Commit `e92a086`, pushed to
`seo/home-head`, opened as [PR #2](https://github.com/rlindsey2/sunkcost/pull/2). Nothing went to
main this run except this log.

**The fonts.** The generated pages have served their own since this morning. The calculator still
opened with two preconnects and a render-blocking stylesheet on `fonts.googleapis.com`: two origins
and three round trips in front of the first word, on the site's most-linked page, whose own HTML and
CSS were already on the way from a connection that was open. The woff2 files were already in
`public/fonts/`. `src/fonts.css` now carries the same ten `@font-face` rules `public/page.css`
declares, `src/styles.css` imports it, and Vite folds it into the bundle at no extra request. The
same two faces the generated pages preload are preloaded here.

**The markup.** `index.html` carried no JSON-LD at all. Google reads a site's name from `WebSite`
markup on the home page specifically, so `/leaderboard/`'s copy does not count. The home page now
emits the same `WebSite` node `pageGraph()` builds, plus a `WebPage` for itself.

Two copies of a thing is how two things drift, so both are held by tests rather than by good
intentions: one compares the app's `@font-face` block with `page.css`'s rule by rule, the other
compares the home page's `WebSite` node with the one the build emits for every other page.

**The share pages needed handling, and this is the part worth knowing.** All 1,894 `/s/` pages are
built from the home page's head, so adding a graph to `index.html` would have given every one of
them a `WebPage` node claiming the home page's address, name and description. `build-share-pages.ts`
now strips it, and throws if any page still has one. They also stop requesting Google Fonts, which
is 1,894 more pages off somebody else's server.

**What the verification found is better than what it was checking.** Chromium against both builds,
the old one genuinely reaching Google Fonts through this environment's egress proxy. Force a redraw
once the fonts have arrived and the two pages are pixel for pixel identical: 2,274,560 pixels
compared, **0 differ**, worst channel delta 0. On *first paint* they differ, and only inside the
hero panel, and the new one is right. The waterline chart is sized from the measured height of the
verdict text. The old page measured that in the fallback face while Google's stylesheet was still in
flight, and nothing redraws it when the real face swaps in, so the chart shipped about 38px short of
its intended height to every first-time visitor. The new page's first paint already matches its own
redrawn state. That is live on sunkcost.ai today and the fix is in PR #2.

Also verified: the new page's network log shows no request to any other origin at all, two font
files, both 200, all four faces loaded; the same 40px string measures 652.2, 661.3 and 678.8 pixels
at weights 400, 500 and 700 on *both* builds, so one variable file is carrying what Google served as
four. `npm test` (117 passing, 4 new), `npm run typecheck`, and the full `npm run build` including
`build:og`, `build:share` and `build:functions`, all clean here. Parsed the graph back out of
`dist/index.html`; `validator.schema.org` is refused by the egress policy, so it was checked against
the graph the 188 generated pages already emit instead.

One thing left alone deliberately: `build:single` drops the head, so the standalone artifact has
never had the Google Fonts link and now has `@font-face` rules pointing at `/fonts/…`, which a file
opened from disk cannot resolve. It falls back to the system face either way, exactly as it did
before, so nothing changed for it.

Ryan was pinged once, about PR #2 rather than PR #1: it is a second PR, and it carries a fix for
something visitors see on the live site today. His list says not to ping about either again.

Nothing visitors see changed on main this run, so there was nothing to check on the live site.
Deploy run 39, on this log commit, finished green at 19:51 UTC and republished. PR #2 is clean
against main and has no checks, because nothing triggers on `pull_request`; that backlog item is
now protecting two PRs rather than one.

**Continue next:** two PRs now wait on Ryan and the rule stands, so take something that goes
straight to main. The best of it is an index at `/compare/` — except that is a new page type and so
a PR itself, which would make three. Failing that, the honest answer is that main's own backlog is
thin: what is left there is the model-count mismatch (Ryan's judgement call), the RTX 3060 label
(a data edit, out of bounds) and seven long head-to-head titles (probably leave). So the next run
should either write the `pull_request` CI workflow, which is cheap, is the thing protecting every
PR in the queue, and is infrastructure rather than a page, or spend the hour on research: WebSearch
what people actually ask about local LLM hardware cost, and turn it into concrete question-page
briefs in the backlog so that the moment PR #1 merges the next page is a writing job rather than a
thinking one.

### 2026-09-16 — the last page still borrowing a card

PR #1 is still open, still a draft and still unreviewed, so the standing rule holds: no second new
page while it waits. This run took the item the last entry said to continue, which is the one piece
of work left on the PR itself. Commit `94d1f73`, pushed to `seo/how-much-memory`. Nothing went to
main this run except this log.

`/how-much-memory/` was the last page anywhere on the site still previewing as `/og/default.png` —
one machine's pay-back curve, which answers nothing that page asks. It now has a card drawn by
`memoryCard()` in `src/list-card.ts`, one line per size band:

| Model size | Cheapest that holds it | Weights + cache |
|---|---|---|
| 7B and 8B, Llama 3.1 8B Instruct at Q8_0 | Mac mini M6, 24GB · $1,099 | 12.8 GB |
| 14B to 32B, Qwen3 32B at Q8_0 | Corsair AI Workstation 300, 64GB · $1,700 | 43.4 GB |
| 70B, Llama 3.3 70B Instruct at Q4_K_M | Framework Desktop, 128GB · $3,449 | 53.3 GB |
| 100B and larger, GLM-5.3-Flash at UD-Q4_K_M | Mac Studio M5 Ultra, 256GB · $10,799 | 189.5 GB |

That climb, 12.8 GB on a $1,099 box to 189.5 GB on a $10,799 one, is the page's argument, and now
it is the picture as well. The rule for which model stands for a band is the page's own: the
hungriest model in the band that a machine on this list can hold, which is the hungriest full stop
wherever one holds it. The card says so in its footer, and every row names the model and its
quantisation, so nobody reads 12.8 GB as the answer for a four-bit 8B.

**The band reading moved into `bandFit()` in `src/pagekit.ts`**, so the page's section and the card
read the same models, the same totals and the same machines. That is the same guard the other list
cards have: a card cannot quietly say something the page does not.

**Verified by building the page set from both sides of that move.** All 189 pages are byte-identical
except this one, and on this one exactly two things differ: the `og:image` tag and its copy in the
JSON-LD. Nothing a reader sees changed. Read the card as a PNG out of the real build: no truncation,
no overlap, every figure matching the page. Also `npm test` (126 passing, 6 new covering the band
rule, the totals against `footprintGb`, and a check that no row names a machine too small for the
figure beside it or a dearer one than the cheapest that fits), `npm run typecheck`, `npm run validate`,
and the full `npm run build` including `build:og` and `build:functions`, all clean here. The build's
own `checkOgCards` guard now counts 184 cards named and all drawn, up from 183.

One layout note for whoever touches this next: the column heading was "Cheapest machine that holds
it" and came out clipped, because `heading()` in `listCardSvg` clamps at 260px. It reads "Cheapest
that holds it" now. Two of the four machine names wrap onto a second line, which the row centres
and which the best-buys card does too, so it was left.

The PR description was updated to cover the card and the `bandFit` move, since the PR now contains
more than it says. No comment on the PR and no ping to Ryan: the draft status and the review request
were both raised last run, Ryan's list says no third ping, and nothing new is blocked.

Nothing visitors see changed on main this run, so there was nothing to check on the live site.
Deploy run 37, on this log commit, finished green at 18:52 UTC and republished. The card itself
reaches the live site when PR #1 merges; the PR branch does not deploy and cannot, since nothing in
`.github/workflows/` triggers on `pull_request`.

**Continue next:** everything on the PR branch is done. While PR #1 waits, the best thing left that
does not stack a second new page on it is the home page's head: `index.html` carries no `WebSite`
JSON-LD (Google reads that on the home page specifically, so `/leaderboard/`'s copy does not count)
and still loads both fonts from Google with two preconnects and a render-blocking stylesheet, when
the files are already in `public/fonts/` and the `@font-face` rules are already in `public/page.css`.
Two backlog items, one file, one small PR, and no overlap with the files PR #1 touches. If PR #1 has
merged by the next run, the next question page is "best GPU for local LLMs" instead.

### 2026-09-16 — the waiting PR had stopped being mergeable

PR #1 has been open and unreviewed through five runs now, and the standing rule says not to stack
a second new page on top of it. This run checked the PR itself before taking anything else off the
backlog, and found the thing no previous run had looked for: **the branch no longer merged.**

Main has moved fourteen commits since the branch was cut — the self-hosted fonts, the canonical
guard, the 75 head-to-head cards, the two list cards — and every one of them touched the same two
files the memory page touches. `git merge-tree` reports content conflicts in
`scripts/build-pages.ts` and `tests/pagekit.test.ts`. So for some part of those five runs, Ryan
could not have merged the PR even if he had reviewed it and wanted to. That is worth knowing
before the next run adds anything else to the queue: a PR left sitting does not stay mergeable on
its own.

Merged `origin/main` into the branch and resolved it. Merge commit `1d69cb5`, pushed to
`seo/how-much-memory`. Nothing was pushed to main this run except this log.

Both conflicts were import lists and one test file, and both sides only ever added things, so the
resolution is the union of the two:

- **`scripts/build-pages.ts`** keeps the memory page's helpers and takes `FONT_PRELOAD` from main.
  One import did not survive: `sharePath`. Main replaced the 45 `/best/` share links with
  `calcLink` in the canonical run, so nothing in that file uses it any more, and keeping it would
  have left an unused import behind.
- **`tests/pagekit.test.ts`** keeps the seven memory-question tests beside main's calculator-link
  and font tests. They are independent `describe` blocks that happened to land in the same place.

A merge commit rather than a rebase, so anyone with the branch checked out keeps a valid checkout.

**The page picks up everything main added while it waited**, which is the real reason this was
worth doing properly rather than resolving it at merge time: `/how-much-memory/` now serves its
fonts from this origin, carries the JSON-LD graph with its breadcrumb, and has a canonical, none
of which existed when the page was written.

**Verified against main, page by page.** Built the whole set twice — once from `origin/main` in a
separate worktree, once from the merge — and compared all 190 files. One file is new
(`how-much-memory/index.html`) and none was lost. 189 of the rest differ, which is expected and is
the point: every page gains the footer link to the new page, model pages gain the line on the KV
cache row, machine pages the note under the memory table, the leaderboard its note. Every changed
region on every page contains a `/how-much-memory/` link and nothing else; read as diffs, each one
is the old line with the link appended. `git diff origin/main HEAD` is 460 insertions and 11
deletions across 4 files, which is exactly what the PR said before the merge, so the merge added
nothing and dropped nothing.

Also `npm test` (120 passing: main's 113 plus the branch's 7, with no test lost from either side),
`npm run typecheck`, `npm run validate` and `npm run build:pages` — 189 pages, no orphans, one
address each, 190 in the sitemap, no duplicate or missing titles or descriptions, all 10 font
files present. Read the built page end to end: the head carries the canonical, the breadcrumb
graph and the two font preloads, no request to any other origin; the body is 13,610 characters
with 56 calculator links and 71 internal links, no maintainer language, no `undefined`, no `NaN`,
no em dashes.

**Worth knowing, and new:** `.github/workflows/deploy.yml` is the only workflow and it runs on
push to `main` and on `workflow_dispatch`. Nothing triggers on `pull_request`, so **PR #1 has
never had a CI run and never will** — the first time CI sees this code is the merge, on the branch
that deploys. That raises the stakes on the local verification above, which is why this entry
records it in that much detail. It is also a backlog item now.

**The other thing five runs missed: the PR is a draft.** GitHub disables the merge button on a
draft, so for the whole time this log has been asking Ryan to merge it, he could not have done so
without first clicking "Ready for review". Between that and the conflict, the request the last
five entries kept making was not actually actionable. I have not changed the draft state myself —
the standing instruction is to open PRs as drafts, and promoting one is the author's call — but I
have said so in a comment on the PR and pinged Ryan once about it. That is the second ping on this
PR, against the previous entry's "do not notify again", and the reason for overriding it is that
the draft status is new information and a ten-second fix, not a repeat of "please review". Ryan's
list above now says no third ping.

Nothing visitors see changed on main this run, so there was nothing to check on the live site.
Deploy run 35, on this log commit, finished green at 17:45 UTC and republished. The PR branch does
not deploy and cannot: see the CI note above.

**Continue next:** the branch is mergeable and every check this environment can run is green on
it. The remaining work on the PR itself is the Open Graph card for `/how-much-memory/`, which
still points at `/og/default.png`; the backlog entry says what it should show and
`listCardSvg` can draw it as it stands. Do that on the branch, not on main. If the PR has merged
by the next run, the next question page is "best GPU for local LLMs".

### 2026-09-16 — the leaderboard and the best buys stop borrowing a card

PR #1 is still open and unreviewed, and the standing rule says not to stack a second new page on
top of it, so this run took the item the last entry said to continue: the two pages on main still
previewing as `/og/default.png`. Commit `0643df3`, pushed to main.

That default card is one machine's pay-back curve. On `/leaderboard/` it answered nothing the page
asks, and `/best/` is the site's strongest commercial page. Both are pages people link to.

Both now have a card drawn from the page's own rows by the new `src/list-card.ts`:

- **`/leaderboard/`** shows the best hosted model, then the five strongest open ones, each with
  its weights and its score as a bar on the site's own scale. Today that reads: GPT-6 Astra at 53
  and "not downloadable", then GLM-5.3-Flash at 42 and 189 GB, down to Inkling Small at 26. The
  distance between the first bar and the second is the page's whole argument, and now it is the
  picture as well.
- **`/best/`** gives one row to each level of daily use with that level's quickest pay-back, the
  model and machine that get it, and the class that model is in: 166 years at 50k tokens a day
  down to 5.0 months at 20M. That slope is what the page is for.

The figures come from the same code the pages do — the leaderboard's de-duplication by display
name, `bestByTier` for the picks, `shortHardwareLabel` for the machine names — so a card cannot
quietly say something the page does not. The two file names are exported constants that both
`build:og` and `build-pages` import, so the two scripts cannot disagree about them; `checkOgCards`
was already there to catch it if they did, and was proved again this run by pointing the page at
a card nobody draws and watching the build refuse it by name.

One judgement call. The best-buys rows are the quickest pay-back at that usage **across every
class**, not the quickest in the most capable class. On today's data they are the same pair, but
they need not be, so each row carries the class beside the figure rather than leaving a reader to
assume the quickest is also the cleverest.

Also in: the palette and the text-fitting helpers moved out of `src/versus-card.ts` as exports,
so both card types set type the same way and the colours live in one place. No pixel of a
head-to-head card changed.

**Verified by building the page set twice**, once from `HEAD` and once with the change, and
comparing all 188 pages: exactly two differ, and only in the card address and its copy in the
JSON-LD. Nothing a reader sees changed. Then read both cards as PNGs out of the real build: no
truncation, no overlap, no `undefined`, and every figure matching the page it belongs to. Also
`npm test` (113 passing, 14 new in `tests/list-card.test.ts`, including bar widths in proportion
to the scores and every figure checked back against the data), `npm run typecheck`, and the full
`npm run build` including `build:og` and `build:functions`, all clean here.

Deploy run 32 finished green at 16:50 UTC and published, so both cards are live. Both commits
went up in one push, so there was one run on the tip and nothing was cancelled. The build step
took 3m05s on the runner, two cards more than last time and no slower.

**Continue next:** every page on main now has its own card, so that item is down to
`/how-much-memory/` on the PR branch. PR #1 still needs Ryan, and the rule stands: while it is
open, no second new page. If it has merged by the next run, the next question page is "best GPU
for local LLMs": filter the machine list to `family === 'NVIDIA' || family === 'AMD'` and say
plainly that a card's price needs a PC around it before it compares with a Mac. If it is still
open, the next thing on main is an index at `/compare/` — which is a new page type and so a PR
itself, so failing that, the home page's missing `WebSite` JSON-LD, also a PR since it is
index.html, and worth pairing with the font item in the same file.

### 2026-09-16 — 75 comparisons, 75 cards, and two broken previews found

PR #1 is still open and unreviewed, and the previous two entries said not to stack another page
on top of it, so this run took the next item that goes straight to main: the Open Graph cards.
Commit `fe6c98e`, pushed to main.

Every one of the 75 comparison pages pointed at `/og/default.png`. A link to "Mac Studio vs RTX
PRO 6000" posted in a chat window previewed as the site's default card, which is a picture of one
unrelated machine's pay-back curve. That is 40% of the site's pages sharing one picture that
answers none of them.

Each comparison page now has its own card, drawn at build time from `data/*.json` by the new
`src/versus-card.ts`: the two names either side of a "vs", then five rows of the page's own
figures. Machines get price, memory, models that fit, best model it runs and pay-back; models get
index score, parameters, weights, max context and the cheapest machine that runs each. Nothing on
a card is computed differently from the page it belongs to — the fit counts come from the same
`computeView` rows the page counts, the pay-back from the same `breakevenDays`, and the cheapest
machine from the same `runnersFor` list.

Speed was deliberately left off the machine card. Most speeds on this site are estimated from
bandwidth and need the sentence beside them that says so, and a card has nowhere to put that
sentence. Same reason speeds stay out of the meta descriptions.

**The build caught a real fault the moment the new guard went in.** `checkOgCards()` compares
every `og:image` a page names against the cards `build:og` actually drew, and it failed on two
pages: `/hardware/mac-studio-m5-ultra-512/` and `/hardware/framework-desktop-495-192/`. Both
machines have `price_usd: null`, so there is no pay-back to draw and `build:og` never wrote them a
card — but the page named one anyway. Those two pages have been serving a broken preview image
for as long as they have existed. They now ask `hasShareCard`, the same rule `build:og` uses to
decide which cards exist, and fall back to the default card when the answer is no.

The pairing that decides which comparisons exist moved out of `scripts/build-pages.ts` into the
new module, so the card build and the page build cut the same list from the same code. Two scripts
agreeing by coincidence on a file name is how 75 broken previews would have happened quietly.

Also in: `build:og` now loads the bold cut of whichever system face it finds. It was loading one
regular file, so every `font-weight: 700` on every card — the verdict headline on all 1,894 of
them — was being drawn in the regular face. The default card's headline is now bold, as the design
intends.

**Verified by looking at the cards and by diffing the pages.** Rendered cards to PNG through the
real build and read four of them: a Mac pair, the DGX Spark against an RTX PRO 6000, a model pair,
and the worst case for length. No truncation, no overlap, every figure matching the page. Then
built the whole page set twice, once from `HEAD` and once with the change, and compared all 188
pages: **0 pages differ in the body**, 0 differ in the head apart from the card address, and the
only structured-data field that changed anywhere is `primaryImageOfPage`. Nothing a reader sees
changed, which is what this change was supposed to be.

Long names were the real work. `DeepSeek-R1-Distill-Qwen-32B` is one hyphenated word, and resvg
cannot measure a string before it draws it, so the layout estimates width and was cutting those
three cards short. The wrap now breaks at a hyphen where there is no space, and drops a font size
rather than cutting a name. Audited all 75: no ellipsis, no `undefined`, no `NaN`.

Also `npm test` (99 passing, 14 new in `tests/versus-card.test.ts`), `npm run typecheck`, and the
full `npm run build` including `build:og` (1,894 + 75 cards) and `build:functions`, all clean here.
Cards average 54 KB, 4.2 MB for the 75, all gitignored and drawn on each deploy. The whole
`build:og` step is about 3.5 minutes, which is most of any deploy.

Deploy run 30 finished green at 15:58 UTC and published, so the 75 cards are live. Both commits
went up in one push, so there was one run on the tip and nothing was cancelled. The build step
took 4m33s on the runner, up from about 3m: 75 more cards to draw.

**Continue next:** `/leaderboard/` and `/best/` are the last two pages on
main still using the default card — see the backlog item, which now says what each one would show.
PR #1 still needs Ryan, and the rule stands: while it is open, no second new page. If it has
merged by the next run, the next question page is "best GPU for local LLMs": filter the machine
list to `family === 'NVIDIA' || family === 'AMD'` and say plainly that a card's price needs a PC
around it before it compares with a Mac.

### 2026-09-16 — 45 links into pages we ask Google to ignore

PR #1 is still open, and the previous entry said not to stack a second page on top of it, so
this run took the next item that goes straight to main: canonical and duplicate control. Commit
`57fa18d`, pushed to main.

The audit found the page set itself clean, and one real fault in the links.

Clean, across all 188 generated pages: every canonical is the page's own address, no two pages
claim the same one, the sitemap and the pages on disk are the same 189 URLs with nothing
announced that does not exist and nothing existing unannounced, and no head-to-head exists in
both directions. That last one the previous entry guessed at — the comparisons are built from
ordered pairs, `i` then `j > i`, so a reversed twin cannot be written. It has now been checked
rather than assumed.

The fault was in the links out of `/best/`. Every one of its 45 "Open in the calculator" cells
pointed at a `/s/` share page. Those carry `noindex` by design, so the site's strongest
commercial page was spending all 45 of its calls to action on addresses search engines are
told to drop: 45 crawl paths that end in nothing, and 45 internal links that convey nothing.
They were the only such links on the site. They now use `calcLink`, which is what every other
generated page already used.

**Nothing a reader sees changes, and that was checked in a browser rather than argued.** With
the built site served locally, Chromium opened the new link `/?hw=mac-mini-m6-32&m=…&u=50000…`
and the old `/s/mac-mini-m6-32/qwen3.8-27b-q4/?u=50000…` in turn. Both finish on the *same*
address — the app rewrites its own URL to the share path on load, so the share link was never
telling the reader anything the calculator did not — with the same title and the same 17,028
characters of rendered text. The two full-page screenshots are byte-for-byte identical. Then
the link as a reader meets it: loaded `/best/`, clicked the first "Open in the calculator",
landed on the share URL with the verdict on the page.

`checkCanonicals()` in the build now states all of it as a rule, next to the existing meta,
orphan and font guards, so what the audit found true cannot quietly stop being true. Five
things fail the build: a canonical that is not the page's own address, two pages claiming one
address, a head-to-head that exists both ways round, a sitemap that disagrees with the pages on
disk, and an internal link that is not in canonical form — no trailing slash (a redirect in
front of the reader), a target no page writes (a dead end), or a `/s/` page (the fault above,
stated as a rule).

Each of the five was proved by breaking it on purpose and watching the build refuse: a share
link, a dropped trailing slash, a model page canonical pointed at the leaderboard, both
directions of every hardware comparison, and a sitemap with a URL that does not exist plus a
page missing from it. All five name the offending pages.

Also `npm test` (85 passing, 2 new), `npm run typecheck`, and the full `npm run build`
including `build:functions`, all clean here. Read the rendered `/best/` page end to end: the
copy is unchanged, no maintainer language, no `undefined` or `NaN`.

Deploy run 28 finished green at 14:51 UTC, so this is live. Both commits went up in one push,
so there was one run on the tip and nothing was cancelled. Worth knowing for a future run that
waits on a deploy: the run-level status the API returns goes stale, and the job's own steps are
where the truth is. This one reported `in_progress` for a quarter of an hour after the job had
finished. `npm run build:og` draws 1,894 cards and takes about four minutes on its own, which
is most of any deploy's time.

Not done, because this environment cannot see it: whether `www.sunkcost.ai` answers, and with
what. The egress policy refuses `sunkcost.ai`, so the edge behaviour of the apex, www and a
missing trailing slash is one curl on Ryan's side, and it is now on his list above with the
command. It is untidy rather than urgent — every page already carries a canonical to the apex,
and the app treats `www.` as its own host, so a www copy is consolidated rather than competing.

**Continue next:** PR #1 still needs Ryan; this session is subscribed to it. If it is still
open next run, do not start a second page on top of it. The smallest useful thing left on main
is then the Open Graph item: `/best/`, `/leaderboard/`, `/how-much-memory/` and all 75
comparison pages point at `/og/default.png`, while model and hardware pages get a real card. A
comparison card wants the two machines side by side, and `scripts/build-og.ts` already knows
how to draw a card from data, so it is a new template rather than new machinery. If PR #1 has
merged, the next question page is "best GPU for local LLMs": filter the machine list to
`family === 'NVIDIA' || family === 'AMD'` and say plainly that a card's price needs a PC around
it before it compares with a Mac.

### 2026-09-16 — the fonts come from here now

PR #1 was still open, and the previous entry said not to stack a second page on top of it, so
this run took the top backlog item that goes straight to main: the render-blocking font load on
all 188 generated pages. Commit `62a9e2b`, pushed to main.

Every generated page used to open the connection race with somebody else's server. The head
carried two preconnects and a stylesheet on `fonts.googleapis.com`, and nothing could be painted
in the right face until the browser had resolved that host, shaken hands, fetched a stylesheet,
learned from it that the fonts live on a *second* host, resolved and shaken hands with that one
too, and downloaded the file. Two origins and three round trips in front of the first word, on a
page whose own HTML and CSS were already on the way from one connection that was already open.

Instrument Sans and IBM Plex Mono are now files in this repository, under `public/fonts/`, with
the `@font-face` rules in `public/page.css`. They are the same woff2 files Google was serving —
downloaded from `fonts.gstatic.com`, latin and latin-ext subsets, with the weights, styles and
unicode ranges copied out of Google's own stylesheet — so the browser now finds them in a file it
was fetching anyway, on a connection it already has. The two faces that paint first, body text
and the figures in the tables, are preloaded so they download alongside that stylesheet rather
than after it.

Ten files, 172 KB in the repository. A page of English text fetches two of them, 45 KB, which is
exactly what it fetched from Google before. The rest are the other mono weights, the italic and
the latin-ext subsets, which a `unicode-range` or a weight the page never asks for leaves alone.
`/fonts/*` is cached for a year as immutable in `public/_headers`, which is safe because the
family version is in every filename: `instrument-sans-v4-400-700-latin.woff2` becomes a different
URL when Google ships a v5.

**Verified by rendering it, not by reading it.** Chromium, driven through this environment's own
egress proxy so that the *old* pages could genuinely reach Google Fonts, full-page screenshots of
`/hardware/geforce-rtx-3090-24/`, `/leaderboard/` and `/best/` before and after the change:
11,499,600 pixels compared, **zero differ**, worst channel delta 0. The pages are pixel for pixel
what they were; only where the fonts come from has changed. On the new pages the network log
shows no request to any other origin at all, and two font files, both 200. `document.fonts`
reports `Instrument Sans normal 400 700` loaded, and the same 40px string measures 359.3, 363.8
and 372.5 pixels at weights 400, 500 and 700 — so the one variable file really is carrying all
four weights the design uses, rather than one weight standing in for the others.

Also `npm test` (83 passing, 4 new), `npm run typecheck`, `npm run build:pages` (188 pages, no
duplicate or missing titles or descriptions, no orphans), and the full `npm run build`.

Two guards went in with it, because a self-hosted font fails quietly — the page just renders in
the system face and nobody notices:

- `write()` in the build refuses any generated page that links a stylesheet from another origin.
  That is the regression this change is about, stated as a rule.
- `checkFonts()` fails the build if `page.css` names a font file that is not in `public/`, or if
  a preloaded file is not one of the faces the stylesheet declares. Preloading a file that does
  not exist wastes a request and logs a warning in every visitor's console.

Not touched: `index.html`, the calculator itself, which still loads both fonts from Google. That
file is behind the PR rule, and the work it needs is now four lines, since the files and the
`@font-face` rules are already here. It is on the backlog directly under the ticked item.

Two things this environment still cannot do. `sunkcost.ai` is refused by the egress policy, so
the verification above is against the local build, which is the build the deploy runs.
`www.googleapis.com` is reachable now, but keyless PageSpeed Insights answers 429 because the
anonymous project every keyless caller shares has spent its daily quota, so there is no
before-and-after Lighthouse number to put here. The reachability note above says what would fix
that.

Deploy run 26 finished green at 13:50 UTC, so this is live. Both commits went up in one push
again, so there was one run on the tip and nothing was cancelled.

**Continue next:** PR #1 still needs Ryan. If it is open again next run, the smallest useful
thing left on main is the canonical and duplicate-control item — in particular whether any
comparison exists as both A-vs-B and B-vs-A, which `build-pages.ts` generates from ordered pairs
and so probably does not, but it has never been checked. If PR #1 has merged, the next question
page is "best GPU for local LLMs": filter the machine list to `family === 'NVIDIA' || family ===
'AMD'` and say plainly that a card's price needs a PC around it before it compares with a Mac.

### 2026-09-16 — the memory question, answered with the site's own arithmetic

Took the top backlog item, question pages, and wrote the first one. New page type, so this went
to a **PR, not a push**: [#1](https://github.com/rlindsey2/sunkcost/pull/1), branch
`seo/how-much-memory`, commit `98e367c`. The page is `/how-much-memory/`, "How much memory do you
need to run a local LLM?".

Why this question first, out of the five on the backlog. "How much RAM to run a 70B model" and
its variants are the most typed question in this subject, nothing on the site answered it, and
the data to answer it properly was already here and is better than what is published elsewhere:
weights per model, a KV cache worked out from each model's architecture, and the usable memory
of every machine. Most of the published answers ignore both the cache and the gap between
installed and usable memory, which is exactly where this site is strong. The other four are
weaker for now, and the backlog entry above says why.

What the page does, all computed at build time from `data/*.json`:

- **The sum**, with the cache arithmetic written out for a model where one line of
  multiplication is the whole story: 2 × 8 key-value heads × 128 per head × 2 bytes × 80 layers ×
  32,768 tokens = 10.7 GB.
- **A section per size band** (7B/8B, 14B to 32B, 70B, 100B and up), each headed with the
  question people type, each listing every model in the band with its weights, cache at 32k, the
  total, the cheapest machine on the list that holds it, and a prefilled calculator link. 56
  calculator links on the page.
- **A context table**: how many of the 55 models fit three real machines as the window grows
  from 4k to 128k. The 32 GB box goes from 36 models to 15.
- **A memory ladder**: one row per level of usable memory, cheapest machine at that level, how
  many models fit, the strongest of them.

Three findings on it that are worth knowing and are the data talking, not me:

- Context decides the machine. Llama 3.3 70B needs 45.2 GB at 8k, which a $1,700 box holds, and
  53.3 GB at 32k, which takes a $3,449 one.
- Size is a poor guide to the cache. Two models here have the same 125 billion parameters and
  want 47.2 GB and 3.2 GB of cache at 128k.
- **From 21 GB of usable memory up to 119.5 GB, the strongest model you can run does not
  change.** More memory buys more models, more context and more room, not a cleverer one. The
  next step up is a $10,799 machine. This one fell out of the ladder table and is the most
  interesting thing on the page.

Three sentences did not survive the honesty rule. "Doubling the context doubles the cache" is
false for the sliding-window models on the same page, so it now says only models with those
layers stop growing partway. "The cheapest machine that runs the largest of them" was wrong on
the 100B band, where the hungriest model is the one with the biggest cache rather than the
biggest weights and nothing on the list holds it at all; that band now names it, says nothing
fits, and gives the largest that does. And `kvWorking()` refuses to print its working unless the
multiplication reproduces the figure the rest of the site uses, so a hybrid or latent-attention
model gets no plausible-looking false sum rather than a wrong one.

Verified: `npm test` (86 passing, 7 new), `npm run typecheck`, `npm run build:pages` and the
full `npm run build` including `build:functions`, all clean in this environment. 189 generated
pages now, sitemap 190 URLs. No duplicate or missing titles or descriptions; every page still
linked from at least one other. Read the built page end to end as text: no maintainer language,
no `undefined` or `NaN`, no em dashes, every tag balanced, JSON-LD parses and carries the
breadcrumb. Title 59 characters with the brand, description 143.

Also linked into: the footer of every generated page, each model page's KV cache row, each
machine page's memory table note, and the leaderboard's note under the table. That is four
contextual entry points plus site-wide reach, which is what a new page needs to get crawled.

Nothing was pushed to main this run except this log. `data/*.json`, `src/calc.ts`,
`src/compute.ts` and `src/fit.ts` were not touched.

**Continue next:** the PR needs Ryan to merge it, and this session is subscribed to it, so CI
failures and review comments will come back here. After that, "best GPU for local LLMs" is the
next question page and the cheapest one to build now that the page type and its helpers exist:
filter the machine list to the cards, which is `family === 'NVIDIA' || family === 'AMD'`, and
note that the card-only price needs a PC around it before it compares with a Mac. If the PR is
still open next run, do not start a second page on top of it; take a smaller item that goes
straight to main instead.

### 2026-09-16 — 63 orphan pages, now none

Took the top backlog item, internal linking. Commit `f69cd32`, pushed to main.

The item assumed the gap was the 28 hardware comparison pages. It was more than twice that. Of
the 188 generated pages, **63 had no inbound link from any other page** — they existed only in
sitemap.xml, which tells a crawler a URL exists and gives it no reason to want it:

- **30 of the 56 machine pages.** Every previous-generation machine, and most configurations
  inside a family. `runnersFor()` filters to `generation === 'current'`, so the leaderboard and
  the model pages only ever name current machines, and a family's cheapest current one at that.
  The casualties include `/hardware/geforce-rtx-3090-24/`, `/hardware/geforce-rtx-4090-24/` and
  the whole M3/M4 Mac range. The 3090 and the 4090 are the two machines people search for most
  in this subject, and nothing on the site pointed at either.
- **28 of the 75 comparison pages** — all the hardware head-to-heads, as the item said.
- **5 of the 55 model pages.** Three have no index score, so the leaderboard leaves them out
  and they are too big to reach the top-12 list on any machine page. The other two are the
  second quantisation of Llama 3.1 8B and Qwen3 32B, which the leaderboard drops when it
  de-duplicates by display name.

Fixed in `scripts/build-pages.ts` and `src/pagekit.ts`:

- **"Other machines to weigh against it"** on every machine page: the rest of that range (every
  configuration, discontinued ones marked as such), then the nearest machine in price from each
  other family. Each row carries price, memory, how many models fit and the pay-back, on the
  same defaults as the rest of the page, so it is a table someone shopping can read rather than
  a list of links. One rival per family, not the five nearest overall, because five Mac Studios
  within $300 of each other answer nobody's question.
- **"Head to head"** under it on the eight flagship machines, linking the comparison pages they
  appear in. That is where the 28 orphaned comparisons get their two inbound links each.
- **Model pages** now cross-link the two quantisations from the Quantisation row of the
  specifics, with the other one's size, since that is the difference that matters.
- **The leaderboard** names and links the five models with no index score in a line under the
  table. "Not yet placed" is the site's own existing wording for them.
- **`checkLinks()` fails the build** on any generated page with no inbound link, next to the
  existing JSON-LD and duplicate-meta guards. Adding a machine or a model can no longer quietly
  produce an orphan.

Two things were deliberately cut on the honesty rule. The rival section was first headed
"Similar money, a different machine", which is false on a page like the DGX Spark where the
nearest NVIDIA card is $1,999 against $4,699; it now reads "Nearest in price elsewhere on the
list", which is only what the code actually does. And a sentence claiming more memory moves a
machine up to a better model "which is usually what changes the pay-back, not the speed" went in
and came back out: the site's own numbers do not support it — a 12 GB RTX 3060 pays back in 26
years and a 32 GB RTX 5090 in 25. Nothing replaced it.

Verified: `npm test` (79 passing, 9 of them new), `npm run typecheck`, `npm run build:pages` and
the full `npm run build`. Re-ran the link audit against the rebuilt `public/`: **0 orphans, down
from 63**; every machine page has at least 5 inbound links, every comparison page at least 1,
every model page at least 1. Breadth-first from `/leaderboard/`, which sits in every page's
footer, the whole site is now within 4 clicks — before, 63 pages were at no depth at all. The
orphan guard was checked by breaking it on purpose: a build with the new section removed fails
and names the pages. Read the rendered machine pages for an NVIDIA card, a Mac mini and the
DGX Spark: the table reads as a buying comparison, and no maintainer language reached the copy.

Deploy run 21 finished green at 11:49 UTC, so this is live. Both commits went up in one push, so
GitHub made a single run on the tip and there was no cancelled run this time — worth doing that
way round, since the previous two runs each cancelled their own code-commit run by pushing the
log a minute later.

Pre-existing, not touched: `/hardware/geforce-rtx-3060-12/` renders its name as "NVIDIA GeForce
RTX 3060 12GB, 12GB" because the chip field in the data carries the memory size. That is a
`data/hardware.json` figure, which is out of bounds, so it is a backlog item rather than an edit.

**Continue next:** question pages (backlog item 2). The 3090 and 4090 pages now have a crawl
path, which makes "RTX 3090 for local LLM worth it" worth writing next, and the site's own
numbers answer it. Those are a new page type, so that run goes to a PR, not straight to main.

### 2026-09-16 — JSON-LD on all 188 generated pages

Took the top backlog item, structured data. Commit `52db55e`, pushed to main.

Every generated page now emits one `@graph` from `pageGraph()` in `src/pagekit.ts`:

- **WebSite** the page belongs to, **WebPage** carrying the page's own title and description,
  its OG card as `primaryImageOfPage`, and **BreadcrumbList**. The breadcrumb is the piece with
  a visible effect on a result — Google draws the trail in place of the raw URL — and the trail
  was already rendered as a `<nav>`, so this only states it in a form a crawler reads.
- **Product** on the 56 hardware pages, referenced from the WebPage's `about`.

Three judgement calls, all on the honesty side:

- **No `Offer`, anywhere.** Product/Offer markup says you can buy the thing from this page. The
  site sells nothing; the prices are list prices read off a maker's page on a stated date. The
  cost of leaving it out is that hardware pages are not eligible for a price rich result. That
  is the right trade. It also keeps Search Console clean of merchant-listing warnings once Ryan
  verifies the property.
- **Power is published only where the maker published it.** `load_watts_status` is `published`
  on 14 machines, and `stand_in` or `third_party_measured` on the other 42. A stand-in figure
  needs the sentence beside it that says what it is, and a `PropertyValue` has nowhere to put
  that sentence. Those machines get memory and bandwidth only; the power figure and its caveat
  stay on the page where they already are.
- **No FAQPage.** Google stopped showing FAQ rich results for sites like this one, so the gain
  is close to nil, and the markup has to mirror visible Q&A exactly or it is a liability. The
  hardware pages have exactly one real question in a heading ("Can a … run local LLMs?"). Not
  worth it. Dropped from the backlog rather than left open.

A machine's Product `name` is the maker's name for it — "Framework Desktop, 128GB", not "Strix
Halo Framework Desktop, 128GB" — with the site's own label as `alternateName` so both match.
`brandOf()` maps family to maker, falling back to the first word of the chip field, which is
where a Strix Halo box is named.

Also fixed: a breadcrumb step with no page of its own (the leaf on all 75 comparison pages) was
rendering as a link to `#` that went nowhere. It is now plain text with a `.here` class, and in
the markup it carries a `name` with no `item`, which is what schema.org asks for. The hardware
comparison leaf said "Comparison" on all 28 of them; it now names the two machines.

Verified: `npm test` (70 passing, 9 of them new in `tests/pagekit.test.ts`), `npm run typecheck`,
and the full `npm run build` including `build:functions` — all clean in this environment. Then
parsed the JSON-LD back out of all 189 built pages: 188 of 188 generated pages have a graph that
parses, 188 BreadcrumbLists, 56 Products, 75 with a name-only last step, every `@id` absolute,
every breadcrumb position sequential from 1. The one page without a graph is `dist/index.html`,
the calculator itself, which is out of bounds for a push. Read a rendered hardware page and a
rendered comparison page: visible copy is unchanged apart from the breadcrumb leaf.

`scripts/build-pages.ts` now parses the JSON-LD out of each page as it writes it and fails the
build on a page with none or one that does not parse, so a stray character in a machine name
cannot ship broken markup.

Deploy run 18 (`0294ebd`) finished green, so this is live. Run 17, on the code commit itself,
shows as *cancelled*: the workflow sets `cancel-in-progress` on a `deploy-production`
concurrency group, and pushing the log a minute later superseded it. Nothing failed.

One thing this environment cannot do: outbound HTTPS to `sunkcost.ai` is refused by the egress
policy (403 on CONNECT), so the agent cannot read its own live pages. Verification above is
against the local build, which is the same build the deploy runs. Worth knowing before a future
run plans anything that depends on fetching the live site.

**Continue next:** internal linking (backlog item 2), which is the largest remaining structural
gap: hardware pages do not link to the models they run best, model pages do not link to the
cheapest machines that run them, and the 75 comparison pages have almost nothing pointing at
them. Check `public/sitemap.xml` against the links actually emitted to find the orphans.

### 2026-09-16 — titles and descriptions for all 188 generated pages

Took the top backlog item. Audited every page under `public/` after `npm run build:pages`:

- 185 of 188 titles were over 60 characters (longest 101), so search listings cut them before
  the reader reached the point. On a head-to-head title the cut landed inside the *second*
  machine's name, which is the whole page.
- 54 descriptions were over 155 characters, all model pages.
- Worst of all: the 75 comparison pages shared **two** descriptions between them ("Side by side:
  what each runs…" on all 28 machine pages, one more on all 47 model pages). Boilerplate across
  40% of the site is how a set of pages gets read as duplicates.

Fixed in `src/pagekit.ts` and `scripts/build-pages.ts`, commit `5b08163`, pushed to main:

- `titleOf` / `descOf` take several complete variants, richest first, and use the fullest one
  that fits. Nothing is truncated mid-sentence. The " · Sunk Cost" suffix is added only when
  there is room left after the content.
- `shortHardwareLabel` drops a vendor prefix the chip already carries (NVIDIA, AMD, Strix Halo)
  and the chip where the family is the product (DGX Spark). "Strix Halo GMKtec EVO-X2, 128GB"
  becomes "GMKtec EVO-X2, 128GB". Full names still appear in the h1 and body, and **no URL or
  canonical changed**, so nothing needs redirecting.
- Comparison pages now describe themselves with their own numbers: how many of the 39 models fit
  each machine, or the two intelligence-index scores. Every description is unique.
- Model and hardware descriptions carry the real verdict ("where it pays back in 1,274 years"),
  which is the honest hook this site has and the old copy buried.
- Speeds were deliberately kept out of meta descriptions: most are estimated from bandwidth, and
  there is no room in 155 characters to label them as such.
- `checkMeta()` in the build now throws on a duplicate or missing title/description and notes
  any that run long. It caught a real one on the first run: Llama 3.1 8B and Qwen3 32B are each
  listed at two quantisations, and dropping the quantisation from the title made those pairs
  identical. The quantisation is back in the title for exactly those cases.

Verified: `npm test` (61 passing), `npm run typecheck`, `npm run build` all clean — the full
build including `build:functions` worked in this environment. Re-ran the audit against the
rebuilt `public/`: 188 pages, 0 duplicate titles, 0 duplicate descriptions, 0 descriptions over
155, 7 titles over 60 (down from 185). Read several pages' rendered `<head>` and body: visible
copy is unchanged, since this run only touched metadata.

**Continue next:** structured data (backlog item 2). BreadcrumbList is the easy win — the
breadcrumb markup already exists in `pageShell`, so it only needs the JSON-LD beside it. Then
FAQPage on hardware pages, where "can it run local LLMs" and "does it pay back" are already the
questions the page answers.
