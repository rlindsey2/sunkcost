# SEO log

Read this before doing anything. One entry per run, newest first. Pick up the top open item in
the backlog, or the open item the previous run said to continue. Never redo a done item.

## Ryan's side (needs the site owner)

- [ ] Merge (or close) [PR #1](https://github.com/rlindsey2/sunkcost/pull/1), the
      `/how-much-memory/` page. It has been open since 12:49 on 2026-09-16 and is the reason six
      runs in a row have taken smaller items instead of the top backlog entry, which is question
      pages. **Ryan marked it ready for review at 23:22 on 2026-09-16**, so the draft no longer
      blocks it and only the merge is left. Ryan has been notified twice about this PR, the second
      time about the draft status; **do not notify again**.
      **It has now needed its merge repaired ten times**, most recently at 12:53 on 2026-09-17.
      The tenth was not the import block for once: it was the note under a machine page's
      "What it runs" table, where this branch had folded the hidden-models line and its link to
      `/how-much-memory/` into one paragraph and main had just added a second note for the new
      Longest context column. Both sides kept, in one note rather than two paragraphs of overlap.
      Rebuilt (189 pages, 182 tests, typecheck clean) and re-measured over HTTP
      (**1,701 views, 0 overflows, 0 of 4,041 tables scrolling**) before pushing `c270947`.
      The eighth and the ninth were both the import block at the top of `scripts/build-pages.ts`
      and the same block in `tests/pagekit.test.ts`: this branch adds `/how-much-memory/`'s helpers
      to both, and main keeps adding its own — `contextHeadroom`, `ctxLabel` and `longestContext`
      the eighth time, `contextCappedBy` and `longestContext` the ninth. Every name from both sides
      was kept in both files. Those two blocks are now the only place this branch ever breaks, and
      every run that adds a helper touches them, so assume it and budget for it.
      A future run that finds it still open should re-check that it still merges before doing
      anything else: a waiting branch does not stay mergeable on its own, and this one has the
      worst of it, because it touches `scripts/build-pages.ts` and `src/pagekit.ts`, which nearly
      every run edits. Re-measure `/how-much-memory/`'s tables over HTTP after each repair too —
      the 2026-09-17 repair found three of them behind a sideways scroll on a desktop.

- [ ] Merge (or close) [PR #2](https://github.com/rlindsey2/sunkcost/pull/2), the calculator's own
      head: self-hosted fonts and the home page's `WebSite` markup. **Ryan marked it ready for
      review at 23:21 on 2026-09-16**, so the draft no longer blocks it and only the merge is
      left. It had gone un-mergeable in the meantime, which the same run fixed; see the run entry
      for "the calculator's own head". Ryan has been pinged once about this PR; do not ping again.
      A future run that finds it still open should re-check that it still merges — eight commits
      landed on main in the three hours it sat there, and a waiting branch does not stay mergeable
      on its own.

- [ ] Merge (or close) [PR #3](https://github.com/rlindsey2/sunkcost/pull/3), the `/compare/`
      head-to-head index, opened 2026-09-17. It is ready for review, not a draft. Ryan has been
      told about this one once; do not ping again. It touches `scripts/build-pages.ts` and
      `src/pagekit.ts`'s neighbours, so it will go un-mergeable the same way PR #1 keeps doing:
      a future run should check it still merges before starting its own work.
      **It needed its first merge repair at 06:52 on 2026-09-17**, caused by that run's own push:
      both sides had added a build check in the same place, which is the shape this conflict will
      keep taking. Both checks were kept and both run; the branch was rebuilt and re-measured
      after the repair, not just merged.
      **It needed a second repair at 07:59 on 2026-09-17**, in exactly the same block and for
      exactly the same reason: this branch adds `checkCompareIndex()` where main has now twice
      widened `checkPayback()`. Assume any run that edits those build checks will break this
      branch, and repair it in the same run rather than leaving it for the next one.
      **It needed a third repair at 10:00 on 2026-09-17**, in two places this time and neither of
      them a build check: the import block, and the model comparison's assumptions note, where
      this branch had added the link to `/compare/` and main had added a sentence about a shorter
      context. Both sides were kept in both. The branch was rebuilt (189 pages, 167 tests,
      typecheck clean) and re-measured over HTTP before pushing `4d3b385`.
      **It needed a fifth repair at 12:06 on 2026-09-17**, the import block again and for the third
      time: this branch's `shownTps` against main's `contextCappedBy` and `longestContext`. Both
      kept; rebuilt (189 pages, 76 comparisons, 174 tests, typecheck clean) and re-measured over
      HTTP (**1,710 views, 0 overflows, 0 of 4,023 tables scrolling**) before pushing `6c7f068`.
      **It needed a fourth repair at 10:52 on 2026-09-17**, the import block alone this time:
      this branch's `shownTps` against main's `contextHeadroom` and `ctxLabel`. Both kept; rebuilt
      (189 pages, 76 comparisons, 172 tests, typecheck clean) and re-measured over HTTP
      (**1,520 views, 0 overflows, 0 of 3,576 tables scrolling**) before pushing `31d1b91`.

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
- [x] No orphans was the floor, not the finish. 52 of the 188 pages sat at exactly one inbound
      link, and 47 of those were the model head-to-heads, reachable only from one cell in the last
      column of /leaderboard/. Done 2026-09-17: every model page now names the head-to-heads it is
      in, the way the machine pages always have, and 52 pages on one link became 5. The run entry
      below has the figures; `checkHeadToHeads()` holds both sides to the rule.
- [x] The 28 machine head-to-heads priced pay-back at one usage. Done 2026-09-17: each now
      carries the five levels the calculator names, and the ceiling that caps 22 of those figures.
      The run entry below has what the single figure was hiding.

- [x] The 47 model head-to-heads priced pay-back at one usage the way the machine ones used to.
      Done 2026-09-17: the 45 that share a machine now price it at all five levels, on that
      machine, with its ceiling on each model marked and named. The run entry below has the
      figures, including the three pages where the sentence above the table had to stop claiming
      a win the printed figures do not show. The other two pairs share no machine, and they are
      the new backlog item two below.

- [x] The two model head-to-heads with no machine in common were the thinnest pages on the site,
      409 and 504 words against a median of 753. Done 2026-09-17, and the fix was the one this item
      proposed: the answer was the context length. Both pages now run the like-for-like table and
      pay-back across the five levels of use on the Mac Studio M5 Ultra, 256GB at 16k, which is the
      longest context on the calculator's list where one machine holds both. 735 and 843 words now.
      The run entry below has the figures and the check that holds it.

- [x] The 5 pages on one inbound link. Done 2026-09-17 for the three the item was really about,
      and the fix was the one it proposed: the note under a machine's "What it runs" table now
      names the models the table's own order hides. Kat Coder v2.5, Laguna XS 2.1 and Ornith 1.5
      35B-A3B went from 1 inbound link to 42; Ornith 1.5 9B went from 13 to 57 and Spark-X2.5 4B
      from 7 to 57. The run entry below has the figures and the check that holds it.

- [x] The 55 model pages were the thinnest page type on the site, median 481 words against 757 for
      the machine pages, and every figure on them was priced at one context. Done 2026-09-17: the
      machines table now says how long a window each machine holds the model at, and the sentence
      above it says whether that differs (32 of 54 pages) or does not (22). Median 589 words now.
      The run entry below has the figures, the cap that needed careful wording, and
      `checkModelContexts()`, which holds both claims to the data.

- [x] The machine pages have the mirror image of that gap. Done 2026-09-17, and the item's own
      framing turned out to be the wrong half of the answer: every one of the 56 machines takes its
      models to different lengths, so "do they differ" says nothing here. What splits the machines is
      **whose fault the short window is** — 51 stop at least one model because their own memory ran
      out, 5 stop none — and that is what the pages now say. The run entry below has the figures and
      `checkMachineContexts()`, which holds the figures and the blame apart.

- [ ] A machine page's only prefilled calculator link is the machine on its own. Now that the page
      knows the longest context it holds each model at, a second link could open the calculator on
      that model at that length, the way the model pages have done since 2026-09-17. Small, and it
      would put a deep link on all 56. Worth it only if it can sit somewhere that is not another
      call to action under the table; two in a row would read as selling.

- [ ] The 2 pages left on one inbound link, Llama 3.1 8B Q8 and Qwen3 32B Q8, reached only from
      their own Q4 page because the leaderboard shows one row per model name. Machine pages cannot
      reach them: a second quantisation is not in the 39 the calculator counts, so it is in no
      machine's fits list at all and the note that fixed the other three does not see it.
      **This may already be solved by PR #1**, which is the only thing that should be done about it
      until that PR lands: /how-much-memory/ lists every model by size, both quantisations
      included, and on that branch the fewest inbound links any page has is 2 rather than 1.
      Re-measure once it merges, and only then decide whether anything else is wanted.
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
- [x] The head-to-head OG cards printed a graphics card's price as a whole computer's. Done
      2026-09-16, and the item understated it: the cards were the last place the *comparison*
      pages did it, not the last place the site did. 57 pages were still bare, including five
      model descriptions a search result prints. The run entry below has the whole list, and
      `checkCardPrices()` now stops the build if one comes back.

- [x] The share card's text ran off the right edge. Done 2026-09-17, and the item understated it
      the same way the card-price one did: the config line was the worst of three, not the only
      one. Measured by rendering all 1,894 cards and reading the rightmost inked pixel — 687 clipped
      the config line, 214 the verdict, 59 the sub-line, and the card that previews sunkcost.ai
      itself was one of them. The run entry below has the figures and what the verdict's own width
      estimate had to be.

- [x] The 47 model head-to-heads. Done 2026-09-16: median 157 words to 634, no subheading to
      three, and every one now carries the machine bill the two models differ by. The run entry
      below has what the rewrite turned up, including a price gap that printed in cents.

- [~] An index at /compare/. Written and waiting in PR #3: 28 machine match-ups and 47 model
      match-ups, each row carrying the figures the comparison behind it prints, 45 prefilled
      calculator links, and a build check that refuses to ship a comparison the index does not
      list. The 75 comparison pages also carry it as the step above them in their breadcrumbs.
      Reaches the site when that PR merges.
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

- [x] The two model counts that did not match. Ryan handed the judgement call to the agent on
      2026-09-16 and the rule is: **a count of what a machine holds uses the 39 current models**,
      the set the calculator shows before you ask for the older ones and the set every machine
      page already counted. What a model *needs* is a different question and a superseded model
      needs it just the same, so /how-much-memory/'s tables by size still cover all 55, marked
      where superseded. Fixed on the PR #1 branch, where that page lives, and held by
      `checkCounts()` at build time: every priced machine still sold must come out the same on
      its own page and on that one, or the build stops.
- [x] The RTX 3060's doubled label. Done 2026-09-16 with Ryan's say-so, which is what the data
      edit needed. `chip` is now "GeForce RTX 3060", the way every other card is entered, and the
      label builder supplies the ", 12GB" as it always did. Six pages changed and nothing else;
      the page's title lost 6 characters and now fits the brand suffix as well. The validator
      refuses any chip that ends in its own memory size, so it cannot come back.
- [x] The generated pages on a phone. Measured, and the premise was wrong: no page overflows the
      window at 320, 360, 390 or 430px, then or now. The full-height screenshot that raised it
      renders a scrolling table at its full width, which reads as the page running off the edge.
      What was real was inside the tables, and that is fixed. Done 2026-09-16; the run entry has
      the figures. What is left of it is the two items below.

- [x] 230 of the 362 tables needed a sideways swipe on a phone. Done 2026-09-17, and the item
      undersold what the swipe was hiding: not just `/best/`'s pay-back column but the pay-back
      on 147 of the 230, and the link into the calculator on 59. A row is a block on a phone now.
      The run entry below has the figures and why the first layout was thrown away.

- [x] Above 640px every table went back to swiping. Done 2026-09-17, and the fix was not the
      one this item proposed: stacking at tablet width would have wasted the width a tablet has,
      so the table stays a table between 641 and 1023px and every cell wraps instead. The item
      also missed the worst of it, which was not in the band at all — see the leaderboard note in
      the run entry below. 0 of the 362 tables scroll at any width from 320 to 1440px now.

- [ ] The leaderboard's table is 8,134px tall on a phone, because a 7-column row becomes 6 lines
      and there are 55 of them. "Good at" is four dots and "Weights" is "17 GB"; either pair of
      short columns could share a line and save about a line a row. `stack()` would need to be
      told which columns are short enough to sit together, and the grid rules would place them on
      the same row. Only worth doing if the length reads as a problem — nothing is hidden. The
      same page is now 4,208px on a desktop, up from 3,377, which is the price of showing the two
      columns it used to hide; that one is not worth chasing.

- [ ] The calculator's own page scrolls sideways on a phone. Measured over HTTP at 320, 360 and
      390px: the page is 398px wide at all three, so the whole thing shifts under a sideways swipe.
      It is the top bar — `.topbar-end`, holding the "Data checked" stamp and the icon button, is
      398px wide and does not wrap. At 430px it fits. None of the 188 generated pages does this at
      any width from 320 to 1440px; this is index.html and src/styles.css only, so the fix is a
      pull request rather than a push. Turned up while measuring the model pages on 2026-09-17.

- [ ] The waterline's own marker label reaches within 19px of a share card's edge. On the Mac mini
      M6 32GB card the label "never reaches the surface" is drawn right-anchored by
      `renderWaterline` and ends at x=1181, where every other line on the card now stops at 1144.
      It is not clipped, so it is untidy rather than broken, and it is `src/waterline.ts`, which
      the calculator draws with too — there the chart is full-bleed and the label belongs at the
      edge, so the fix is a margin the card passes in rather than a change to the renderer.
      Turned up while fixing the card's own text on 2026-09-17.

- [x] Every graphics card page opened "Can a NVIDIA GeForce RTX 3090, 24GB run local LLMs?".
      Done 2026-09-17. `indefiniteArticle()` reads a name set in capitals as an initialism and
      answers on the name of its first letter, so "an NVIDIA" and "an AMD" but still "a DGX" and
      "a Radeon". Seven h1s changed and nothing else on the site; `checkArticles()` stops the
      build if a machine page opens with the wrong article.

- [x] The thinnest comparisons on the site were the machine head-to-heads between machines that
      hold the same models. Done 2026-09-17, and the fix was the one this item proposed: what the
      memory each machine has left over buys is context, so the 7 pages now answer that. On 4 of
      them the two machines do take shared models to different lengths and the page names every
      one; on the other 3 they do not at any context the calculator offers, and saying that across
      all 39 models is a stronger answer than the 32k one they gave. Thinnest comparison on the
      site went from 525 words to 570, and all 7 gained. The run entry below has the figures and
      `checkHeadroom()`, which holds both sides to it.

- [ ] The other 21 machine head-to-heads answer the memory difference with the models one holds
      and the other does not, and stop there. The same context question applies to the models they
      *share*: a 128GB machine against a 32GB one runs Qwen3.8 27B on both, and not to the same
      length. `contextHeadroom()` already gives the answer and the section is written. It was left
      alone because those pages are not thin — they run 611 to 795 words, median 720, and already
      have a table about memory — so a second one risks length without an extra answer. Worth a look only
      after the question pages, and only if it can replace something rather than sit beside it.

- [ ] The 7 head-to-head titles still over 60 characters are all pairs of long machine or model
      names (worst: MacBook Air M5 (15-inch), 16GB vs MacBook Pro M5 Pro (16-inch), 64GB, at 68).
      Shortening them further means dropping a memory size or a screen size, which are the things
      that tell two Macs apart. Probably leave, but worth a second look with query data.

## Runs

### 2026-09-17 — how far a machine takes each model, on the machine pages

**All three open PRs were checked first and all three merged clean**, so nothing needed repairing
before the work. PR #1 needed repairing afterwards, from this run's own push; PR #2 and PR #3 were
re-checked after it and still merge clean. Ryan has not been pinged about any of them, per the
standing rule.

**Why this item.** It was the top open item that a push to main can carry, and it is the other half
of the question the last run answered from the model side. A machine page's "What it runs" table
gave every model a speed, a class and a memory figure, all taken at 32k, and never said how long a
window the machine actually holds it at. That is the question behind "can my 32GB card do 128k",
and the machine page is where someone asks it.

**What the item got wrong, and what was there instead.** It assumed the machine side would split
the way the model side did, into pages where the lengths differ and pages where they do not.
Measured, **all 56 machines take their models to different lengths**, so that sentence would have
been the same on every page and would have said nothing. The split that does exist is a better
question anyway: **whose fault a short window is**. On **51 of the 56** machines, at least one model
is stopped by that machine's own memory; on **5** — the M5 and M3 Ultra 96GB and 512GB Macs and the
DGX Spark — memory never runs out first, and every model reaches either 256k or its own ceiling.

**What changed.** The table has a **Longest context** column, and the sentence above it says what
the column adds up to from the machine's side. The RTX 3090's reads: 5 of the 12 are stopped by its
own memory, Qwen3.6 35B-A3B soonest at 32k, and the rest reach 256k or their own limit. A 16GB Mac
mini M6 stops 7 of 10, Ministral 3 8B soonest at 32k. A 12GB RTX 3060 stops 8 of 11.

**The tag is the careful part.** A figure that stops at 32k because the machine is full says
something about the machine. One that stops at 32k because the model's own ceiling is 40k says
nothing at all, and printing the two alike would sell a machine on a limit it did not set. So
`contextCappedBy()` decides, and only the memory-capped figures carry the small `memory` tag; the
note under the table says what the tag means in one line.

**The other quiet lie this nearly shipped.** The first draft ended the sentence "the rest reach
256k, where the calculator's list ends, or the longest setting their own context limit allows" on
every page. On the three 16GB Macs and the RTX 3060 **nothing reaches 256k at all**, so naming it
as somewhere "the rest" get to would have sold a length those machines never hold. The tail clause
is now built from what the machine actually reaches, and the check refuses a page that names 256k
without taking a model there.

**No figure here is new data.** `longestContext()` walks the calculator's own context list and asks
`fit()`, the same function the calculator uses, so every length is the site's own arithmetic.

**What it did to the figures.** Machine pages went from a median of **820 words to 976**, and from
663 at the shortest to 804. A word-level diff of all 56 pages against a build from `origin/main`
found **nothing removed** — the only line that changed rather than appeared is the table's own
header row, which gained a sixth name.

**Width.** The backlog warned that a sixth column pushed the model pages past their right edge until
the machine name was allowed to wrap. Measured before and after over HTTP at 320, 360, 390, 430,
640, 768, 1024, 1280 and 1440px: **1,692 views, 0 page overflows, 0 of 3,987 tables scrolling**,
the same as the baseline. The model-name column was given the leaderboard's `c-model` class so it
wraps rather than overflows; measured without it the table still fit, so the class is insurance for
the next long model name rather than a fix for this one. The phone layout was read as a picture too:
a row becomes a block and the new line reads "Longest context 64k memory".

`checkMachineContexts()` holds it from here, and it holds the blame as well as the figure: every
printed length is recomputed from `fit()` at build time, no machine may be shown taking a model past
its own limit, the tag must fall on exactly the memory-capped rows, a page may not claim memory
never runs out where it does, and a page may not name 256k unless it takes a model there. Proved by
breaking it five ways: doubling the figures failed the build on 661 counts, emptying the column on
817, dropping the tag on 156, putting the tag on every row on 505, and forcing "memory never runs
out first here" onto every page on 153.

**Verified.** `npm ci`, `npm test` (169 tests), `npx tsc --noEmit`, `npm run build` all the way
through `build:functions`, the five deliberate breakages above, the width measurement above, and
the rendered pages read in a browser at 390 and 1280px. Commit `9a44c1c`; deploy run 79 succeeded.

**PR #1 repaired afterwards**, in the note under that same table. Commit `c270947`; details in
Ryan's side above. Re-checked after pushing it: all three branches merge clean.

**What to continue.** The top item is still the question pages, and it is still behind three
unmerged PRs. Below it the main-reachable list is back to cosmetics: the leaderboard's height on a
phone, the seven long head-to-head titles, the waterline label's margin on a share card. The new
entry added to the backlog this run — a second prefilled calculator link on machine pages, at the
longest context they hold a model at — is the only one of those that adds an answer rather than
tidies one, and it is small.

### 2026-09-17 — how far each machine takes the context, on the model pages

**All three open PRs were checked first and all three merged clean**, so nothing needed repairing
before the work. PR #1 and PR #3 both needed repairing afterwards, from this run's own push; see
the end of this entry. Ryan has not been pinged about any of them, per the standing rule.

**Why this item and not the top one.** The top backlog item is still the question pages, and it
stayed where it is for the same reason as the last six runs: a question page is a new page type,
which the rules send to a pull request, and three of those are already open and unmerged. What is
different this run is that the main-reachable list below it had run down to cosmetics — the last
entry said as much — so rather than take one, this run measured the page set again and found a gap
the backlog had not noticed.

**What was missing.** The 55 model pages were **by far the thinnest page type on the site: median
481 words, against 757 for the machine pages and 792 for the comparisons**. They were thin in a
specific way. Everything on a model page is priced at one context, 32k: the speed, the pay-back,
the memory. That leaves out the question someone asks immediately after "what hardware do I need to
run this" — **how long a window will that machine hold it at** — and the only page that answered it
was the one still waiting in PR #1.

**What changed.** The "Machines that run it" table has a **Longest context** column, and a sentence
above the table says what the column adds up to. Measured across all 54 model pages that have
machines: **on 32 of them the machines reach different lengths, on 22 they all stop in the same
place.** Those are opposite claims, so each page makes its own deliberately.

The clearest are the ones that break a rule of thumb people use. **Llama 3.1 8B** is the model
everyone says runs in 16GB, and it does: a Mac mini M6, 16GB holds it, **to 32k and no further**,
where a $1,269 Framework Desktop with 32GB takes it to **128k**, its own ceiling. **Devstral 2 123B**
fits five machines and **only the DGX Spark takes it past 32k**, to 64k, on 119.5 GB of usable
memory against the Framework Desktop's 96. Qwen3-Coder 30B-A3B runs from **32k on a 32GB box to
256k on the DGX Spark**.

**No figure here is new data.** `longestContext()` walks the calculator's own context list and asks
`fit()`, the same function the calculator uses, so a figure is capped by whichever runs out first:
the machine's memory, the model's own limit, or the end of the list.

**Which cap it is, is the part that needed care.** Only memory running out says anything about the
machine, so `contextCappedBy()` is new and names the reason, and the page says it. The case that
would have produced a quiet lie is **Qwen3 32B, whose own limit is 40k**: every machine holds it to
32k, and calling that "its own ceiling" would be a gigabyte of wishful rounding. Those four pages
read "the longest setting below this model's own 40k limit" instead.

**What it did to the figures.** Model pages went from **median 481 words to 589**, and from 557 at
the longest to 664. Nothing was removed: a word-level diff of all 55 pages against a build from
`origin/main` found **no word taken out of any of them**.

`checkModelContexts()` holds it from here. Every printed length is recomputed from `fit()` at build
time rather than read back off the page; no machine may be shown taking a model past its own limit;
and a page may not claim a spread it does not have, or miss one it does. Proved by breaking it four
ways: doubling the figures failed the build on 334 counts with the machine and both lengths named,
dropping the column failed the same way, suppressing the "not to the same length" sentence failed on
exactly the 32 pages that need it, and forcing that sentence onto the level pages failed on the 22
that do not.

**One thing this turned up that had to be fixed before it shipped.** A sixth column pushed the table
past its own right edge: measured over HTTP, **45 of the 54 model pages had it scrolling sideways at
1024px and above**, by 10 to 32px, which is the swipe two earlier runs spent a run each removing.
The machine name now wraps, the way it already does on the leaderboard and on /best/, and the table
fits. That is why the name column carries `c-hw`.

**Verified.** `npm test` 169 passing, up from 167 — two new ones, including one over every
machine-and-model pair asserting that where `contextCappedBy()` says "memory", the next setting up
is one the model itself allows and the machine really cannot hold. Typecheck clean. The full
`npm run build` passed, `build:functions` included, with no workaround needed. Built the whole page
set from a worktree at `origin/main` and compared every file: **136 byte-identical, 54 changed**, and
the 54 are the model pages. **No title, description, canonical, OG tag or JSON-LD line changed
anywhere.** Measured over HTTP in Chromium at 320, 360, 390, 430, 700, 900, 1024, 1280 and 1440px:
**1,692 page views, 0 overflowing the window, 0 of 3,987 tables scrolling sideways**. Read the new
section as a picture at 390 and 1280px.

**Deploy confirmed.** **Run 77, on `233b406`, finished green at 12:02 UTC** with `npm ci`, `npm test`
and the full `npm run build` passing on the runner, and republished.

**PR #1 and PR #3 were both repaired straight afterwards**, both from this run's own push, and both
the import block, which is now the only place either of them ever breaks. PR #1 was its **ninth**
repair and hit `tests/pagekit.test.ts` as well as `scripts/build-pages.ts`; PR #3 was its **fifth**
and hit only the one block. Every name from both sides was kept in every list. Both branches were
rebuilt (189 pages each; 182 tests on PR #1, 174 on PR #3; typecheck clean) and re-measured over
HTTP (**1,701 views, 0 overflows, 0 of 4,041 tables scrolling** on PR #1, /how-much-memory/ included;
**1,710 views, 0 overflows, 0 of 4,023 tables** on PR #3, /compare/ included) before pushing
`13eb66a` and `6c7f068`. All three branches merge clean again.

**Continue next:** check all three PR branches still merge before anything else, and budget for it —
every run that adds a helper breaks two of them in the same block. **The question pages are still
the top item and still the biggest win.** The judgement to revisit is unchanged: if a PR has merged,
the page type is on main and the next question page is much less work; if the pile is still three
deep, weigh a fourth PR against a main-reachable item — and note that this run found a real one by
measuring rather than by reading the backlog, so that is worth doing again. The obvious next
measurement is the **machine pages**, which have the mirror image of the gap this run closed: see
the new backlog item. **The live site has still had no new page since this agent started.**

### 2026-09-17 — what two machines that hold the same models differ by

**All three open PRs were checked first and all three merged clean**, so nothing needed repairing
before the work. PR #1 and PR #3 both needed repairing afterwards, from this run's own push; see
the end of this entry. Ryan has not been pinged about any of them, per the standing rule.

**Why this item and not the top one.** The top backlog item is the question pages, and it stayed
where it is. A question page is a new page type, which the rules send to a pull request, and there
are already three of those open and unmerged — two of which this run had to repair again for the
eighth and fourth time. A fourth PR would have added to that pile and reached no reader. So this
run took the top item that could reach main on its own, which is the thin comparisons. **That
judgement is worth revisiting the moment any of the three PRs merges.**

Then the item: the thinnest comparisons on the site, which are the **7 machine head-to-heads whose
two machines hold exactly the same models**. They ran from 525 to 574 words against a median of
762. They were short because the section every other comparison fills with "what the extra memory
buys" had nothing to list, so it said two sentences instead: *"Every model on this list that fits
one machine fits the other, at 32k of context. So the choice between them is speed, price and
power, not what they can hold."*

**What was actually wrong.** Nothing, and the sentence stopped one question short. Memory does not
stop mattering when two machines hold the same list — it moves into the context. The weights are
fixed but the KV cache grows with every token you keep, so a machine with more memory left over
takes the same model further. **On 4 of the 7 pairs it does**, and none of those pages said so.

**What changed.** Those 4 pages now carry "The same models, not to the same length": every model
the two machines take to different lengths, the longest context each holds it at, and a link that
opens the calculator at that configuration on each side. The clearest is the **MacBook Pro M5 Pro
(16-inch), 64GB against the Radeon AI PRO R9700, 32GB** — the same 27 models at 32k, 48 GB usable
against 31 GB, and **8 models the Mac takes further**: Qwen3-Coder 30B-A3B to 256k where the card
stops at 64k, Gemma 4 31B it to 128k against 32k. On the three 128GB-class pairs it is the **DGX
Spark's 119.5 GB usable** that shows, on **Ling 3.0 flash (256k against 128k) and Devstral 2 123B
(64k against 32k)** — the two models big enough for 23 GB of spare memory to matter.

**On the other 3 pairs the answer is that it buys nothing, and that is now said properly.** Those
pages checked 32k and left the rest open. They now state what was actually measured: across all
**39 models the calculator counts, at every context from 4k to 256k**, there is no model one holds
and the other does not. Mac Studio M5 Max 128GB against the GMKtec EVO-X2 128GB (both 96 GB
usable), against the RTX PRO 6000 Blackwell 96GB (96 against 95 GB), and the EVO-X2 against the
RTX PRO. A checked negative is a better answer than an unchecked one.

**No figure here is new data.** `longestContext()` walks the calculator's own context list and asks
`fit()`, the same function the pages and the calculator use, so a figure is capped by whichever
runs out first — the machine's usable memory or the model's own context limit. That second cap is
why the table says 256k where the list tops out and the model tops out together, and the note under
it says so.

**What it did to the figures.** The 7 pages: **525 → 575, 535 → 570, 543 → 685, 547 → 689, 562 →
612, 570 → 714, 574 → 770 words**. The thinnest comparison on the site is now 570 words, up from
525, and the median across the 75 moved from 762 to 763.

`checkHeadroom()` holds both sides of it from here: **a page whose two machines differ nowhere
claims nothing, and a page where they do differ names every model they differ on and prints both
lengths** — recomputed from the data at build time, not read back off the page. Proved by breaking
it three ways: suppressing the section failed the build on all 4 pages, dropping one row failed
with the model named and both its lengths, and printing a doubled context failed on all 4.

**Verified.** `npm test` 167 passing, up from 162 — 5 new ones covering the two helpers, including
that no machine is ever shown taking a model past its own context limit. Typecheck clean. The full
`npm run build` passed, `build:functions` included, with no workaround needed. Built the whole page
set from a worktree at `origin/main` and compared every file: **198 byte-identical, 7 changed**,
and on those 7 the only things removed were the old heading and its sentence. **No title,
description, canonical, OG tag or JSON-LD line changed anywhere.** Measured over HTTP in Chromium
at 320, 360, 390, 430, 700, 1024, 1280 and 1440px: **616 page views, 0 overflowing the window, 0 of
2,216 tables scrolling sideways**. Read the new section as a picture at 390 and 1280px.

**Deploy confirmed.** **Run 75, on `97477f1`, finished green at 10:54 UTC** with `npm ci`,
`npm test` and the full `npm run build` passing on the runner, and republished.

**PR #1 and PR #3 were both repaired straight afterwards**, both from this run's own push, and both
were the import block — the place the log has been predicting for three runs. PR #1 was its eighth
repair and hit `tests/pagekit.test.ts` as well as `scripts/build-pages.ts`; PR #3 was its fourth
and hit only the one block. Both sides were kept everywhere. Both branches were rebuilt (189 pages
each; 180 tests on PR #1, 172 on PR #3; typecheck clean) and re-measured over HTTP (**1,512 views,
0 overflows, 0 of 3,592 tables scrolling** on PR #1; **1,520 views, 0 overflows, 0 of 3,576
tables** on PR #3) before pushing `ded6b83` and `31d1b91`. All three branches merge clean again.

**Continue next:** check all three PR branches still merge before anything else — a run that
touches the import block at the top of `scripts/build-pages.ts` will break PR #1 and PR #3 again,
so budget for it. **The question pages are still the top item and still the biggest win**, and the
judgement above is the thing to revisit: if a PR has merged, the page type is on main and the next
question page is much less work; if the pile is still three deep, weigh a fourth PR against
another main-reachable item. What is left below the question pages on main is now small — the
leaderboard's height on a phone is cosmetic, the waterline label is a one-line tidy, and the new
item about the other 21 comparisons is a maybe. **The live site has still had no new page since
this agent started.**

### 2026-09-17 — the two comparisons that had no machine in common

**All three open PRs were checked first and all three merged clean**, so nothing needed repairing
before the work. PR #1 and PR #3 both needed repairing afterwards, from this run's own push; see
the end of this entry. Ryan has not been pinged about any of them, per the standing rule.

Then the item the last run said to continue: the two model head-to-heads with no machine in common,
`/compare/inkling-small-ud-q4-vs-hunyuan-hy3-q4/` and `/compare/hunyuan-hy3-q4-vs-ling-3-0-flash-q4/`,
at **409 and 504 words against a median of 753** across the 75 comparisons. They were thin because
they skipped the two sections every other comparison carries, and they skipped those because no
machine on the list holds Tencent Hy3 at the 32k of context the site assumes.

**What was actually wrong.** Nothing on either page, but the pages stopped one question short. Hy3
needs **193 GB at 32k** and the largest machine here, the Mac Studio M5 Ultra, 256GB, has **192 GB
usable**. The miss is about a gigabyte, and it is in the cache, not the weights: the weights are
**182 GB** and do not move, while the cache grows with the context you ask for. Measured every
context the calculator offers, on both pairs: at **16k Hy3 needs 188 GB** and that machine holds
it, and that machine already runs the other model on both pages. So there was a real answer
available, and it is the answer someone choosing between these models wants.

**What changed.** Both pages now carry the two sections at 16k: "Side by side on the Mac Studio M5
Ultra, 256GB at 16k of context", and "How much use it takes to pay for the machine" across the five
levels the calculator names. The context is named in the heading, in the section's own sentence, in
the assumptions note, and in every calculator link those sections carry. The lede says where the
two meet, and it says it last, so the sentence before it keeps its "that machine".

**One thing that was quietly wrong and is now fixed.** The top call to action for a model no machine
holds at 32k read "or Tencent Hy3 in the calculator" and opened on `hw=mac-studio-m5-max-64`, which
is whatever machine the calculator starts on and cannot hold Hy3 either. The reader followed the
link and got the same "does not fit" the page had just explained. Those links now open at the
meeting configuration: the machine that holds both, at 16k.

**What it did to the figures.** The two pages: **409 to 735 words and 504 to 843**. Neither is in
the thinnest five on the site any more. The thinnest comparison is now a machine head-to-head at
517 words, which is a different matter and is not a problem — see the new backlog item below.

`checkMeetingPoint()` holds the rule from here: **a page that runs the race at a shorter context
names that context in its heading, in its assumptions, and in every calculator link those sections
carry** — and a pair that meets at no context runs no race at all. Proved by breaking it three
ways: suppressing the meeting failed the build with 6 problems across the 2 pages, dropping the
context from the heading failed with 2, and letting one calculator link per page keep the default
context failed with 2.

**Verified.** `npm test` 162 passing; typecheck clean; the full `npm run build`, `build:functions`
included, which needed no workaround. Built the whole page set from a worktree at `origin/main` and
compared all 190 files: **188 byte-identical, 2 changed**, and on each of the 2 the only lines
replaced were the lede, the top call to action and the assumptions note. **Nothing was removed from
either page**, and no title, description, canonical or JSON-LD line changed anywhere. Measured over
HTTP in Chromium at 320, 360, 390, 430, 700, 1024, 1280 and 1440px: **1,504 page views, 0
overflowing the window and 0 of 3,512 tables scrolling sideways**. Read both new sections as a
picture at 390 and 1280px.

**Deploy confirmed.** **Run 73, on `5cd7d25`, finished green at 09:54 UTC** with `npm ci`,
`npm test` and the full `npm run build` passing on the runner, and republished.

**PR #1 and PR #3 were both repaired straight afterwards**, both from this run's own push. PR #1
was the import block alone (seventh repair); PR #3 was the import block and the assumptions note,
where this branch had added the `/compare/` link and main a sentence about the shorter context
(third repair). Both sides were kept everywhere. Both branches were rebuilt (189 pages each; 175
tests on PR #1, 167 on PR #3; typecheck clean) and re-measured over HTTP (**1,512 views, 0
overflows, 0 tables scrolling** on each) before pushing `8749a28` and `4d3b385`. All three
branches merge clean again.

**Continue next:** check all three PR branches still merge before anything else. The backlog above
those PRs now has nothing large left that can reach main on its own — the leaderboard's height on a
phone is cosmetic and may not be worth doing, and the waterline label's margin is a one-line tidy in
a file the calculator shares. **The question pages are the top item and the biggest win, and they
are blocked on judgement rather than on a PR**: /how-much-memory/ is the worked example and it is
still waiting in PR #1, but "local LLM vs API cost" needs no new page type and is the site's whole
thesis with only the home page stating it. A run with an hour should look hard at whether that one
can be written as a generated page on main rather than a PR. **The live site has still had no new
page since this agent started.**

### 2026-09-17 — the models a table sorted by class puts out of reach

**All three open PRs were checked first and all three merged clean**, so nothing needed repairing
before the work. PR #1 needed repairing afterwards, from this run's own push; see the end of this
entry. Ryan has not been pinged about any of them, per the standing rule.

Then the top item that could reach main on its own: the 5 pages still on a single inbound link.
Measured on the built page set first, and it was exactly the five the backlog named — three models
the intelligence index has not scored (Kat Coder v2.5, Laguna XS 2.1, Ornith 1.5 35B-A3B), each
reached only from the one note under the leaderboard, and the two second quantisations.

**What was actually wrong.** A machine page lists the twelve strongest models that fit it, ordered
by index class, and a model with no score sorts below every model that has one. So on **50 of the
56 machines** the models with no score are all below the cut, and under the table sat a count and
nothing else: "21 more fit; the calculator lists them all." The three worst-off models fit **41 of
those machines between them** and were named on none of them. The other two unscored models were
better off only by accident — they are small, so on a few machines the whole fits list is twelve
or fewer and they made the table.

**What changed.** That note now names the models below the cut that have no index score, links
each one, and says why they are not in the table: "12 more fit; the calculator lists them all. 5 of
them have no intelligence-index score, so they sit below the twelve above: …. Their pages show what
each one needs and what runs it." The list is per machine, not a fixed set — 5 names on the big
machines, 2 on the 32GB ones, 1 where only one model is below the cut, and the singular case is
written as one sentence rather than two.

**What it did to the figures.** Kat Coder v2.5, Laguna XS 2.1 and Ornith 1.5 35B-A3B: **1 inbound
link each, now 42**. Ornith 1.5 9B: 13, now 57. Spark-X2.5 4B: 7, now 57. Pages on a single inbound
link across the site: **5, now 2**, and the 2 are the second quantisations, which this mechanism
cannot reach (see the backlog item above). The median page is on 5 inbound links; 31 are on two or
fewer.

`checkHiddenModels()` holds the rule from here, and it is a simpler rule than the fix: **if a model
with no index score fits a machine, that machine's page links it, whether it made the table or
not.** That covers both routes, the table and the note, so a model that later crosses into the
first twelve does not trip it. Proved by breaking it — suppressing the note failed the build at 217
of the 235 machine-and-model pairs, the 18 survivors being the ones already in a table.

**Verified.** `npm test` 162 passing; typecheck clean; the full `npm run build`, `build:functions`
included, which needed no workaround. Built the whole page set from a worktree at `origin/main` and
compared all 188: **138 byte-identical, 50 changed, and every one of the 50 a single line** —
the old sentence replaced by a longer one, nothing else on the page touched and no title,
description, canonical or JSON-LD line changed anywhere. Measured over HTTP in Chromium at 320,
360, 390, 430, 700, 1024, 1280 and 1440px: **1,504 page views, 0 overflowing the window and 0 of
the 3,480 tables scrolling sideways**. Read the note as a picture at 390 and 1280px and as text in
all three of its shapes.

**Deploy confirmed.** **Run 71, on `0dd3197`, finished green at 08:49 UTC** with `npm ci`,
`npm test` and the full `npm run build` passing on the runner, and republished.

**PR #1 was repaired straight afterwards**, for the sixth time and from this run's own push: both
sides had rewritten the same note, main to name the hidden models and `seo/how-much-memory` to say
what the memory column counts. Both were kept, in that order. The branch was rebuilt (189 pages,
175 tests, typecheck clean, full build) and re-measured over HTTP (**1,512 views, 0 overflows, 0 of
3,528 tables scrolling**) before pushing `ac12674`. All three branches merge clean again. Worth
noting from that build: on the PR #1 branch the fewest inbound links any page has is **2, not 1**,
because /how-much-memory/ lists both quantisations of every model — so merging it may close the
item this run could not.

**Continue next:** check all three PR branches still merge before anything else. The top item that
can reach main on its own is now the two comparisons with no machine in common, which are the
thinnest pages on the site and have a real answer available in `kvCacheGb()`; then the
leaderboard's height on a phone, which is cosmetic and may not be worth doing at all. Everything
above those — the question pages, the `/compare/` index, the home page's JSON-LD, the calculator's
fonts — is still written and waiting in a PR, and **the live site has had no new page since this
agent started**.

### 2026-09-17 — what a model head-to-head never said: how much use it takes

**All three open PRs were checked first and all three merged clean**, so nothing needed repairing
before the work. PR #3 needed repairing afterwards, from this run's own push; see the end of this
entry. Ryan has not been pinged about any of them, per the standing rule.

Then the item the last run said to continue: the 47 model head-to-heads priced pay-back at exactly
one level of use, 500k tokens a day, in the lede and in one row of the side-by-side table — the
same gap the 28 machine comparisons lost an hour earlier. Someone choosing which model to run is
choosing at their own usage, and on these pages the machine is the same either way, so what moves
with usage is what the same work costs on an API.

**What changed.** Each of the 45 pairs that share a machine now carries "How much use it takes to
pay for the machine": both models on the cheapest machine that runs both, across the five levels
the calculator names, from "a few chats a day" at 50k to "agents running most of the day" at 20M.
The section says in a sentence which model pays the machine back sooner and whether that holds all
the way up, marks every figure the machine is too slow to reach, and ends with the calculator
prefilled at the heaviest level for either model. The two pairs with no machine in common are
exempt, the same way they have no side-by-side table; `checkPayback()` knows the difference.

**What the five levels turned up.** Unlike the machine pages, the order never flips: on all 45
pages one model is ahead at every level, because both run on the same machine. What the levels do
show is the scale, which one figure hid completely — on the Radeon AI PRO R9700, 32GB, Qwen3 32B
pays it back in 1,499 years at 50k tokens a day and 3.7 years at 20M. **30 figures across 22 pages
are at a machine's ceiling**, named underneath; on the 5 pages where both models are capped at the
same level the two sentences are written as one. Three pages needed a different sentence again:
one model never pays the machine back at any level on two of them, and neither does on a third,
where "pays back sooner" would have been a wrong way to say it.

**The sentence has to hold against the printed figures.** On 3 pages the two models are a few days
apart at one level and print the same rounded figure — 21 months and 21 months. Claiming "sooner
at every level" there is unsupported by anything the reader can see, so those pages say instead
that one model "is never the slower of the two to pay for it, at any level of use", which the
table does show. The comparison is now made on the printed figures, not on the days behind them.

**What it did to the figures.** The 45 pages: **517–738 words before, median 653; 665–895 after,
median 803.** Nothing was removed from any page.

`checkPayback()` now holds the model head-to-heads to the same rule as the machine ones: the
section, the five levels, and no figure marked as a ceiling without the ceiling being named. All
three were proved by breaking them — the section suppressed failed at 45 pages, a level dropped
failed at 45, and the ceiling note suppressed failed at the 22 pages that have one.

**Verified.** `npm test` 162 passing; typecheck clean; the full `npm run build`, `build:functions`
included, which needed no workaround. Compared all 188 built pages against a build of `origin/main`
taken before the change: **141 byte-identical, 47 changed, 0 lines removed anywhere**, and no
title, description, canonical or JSON-LD line touched. The 2 changed pages that are not the new
section are one blank line each, on the two pairs that have no machine in common. Measured over
HTTP in Chromium at 320, 360, 390, 430, 700, 1024, 1280 and 1440px: **1,504 page views, 0
overflowing the window and 0 of the 435 tables in them scrolling sideways** at any width. Read the new
section as a picture at 390, 800 and 1280px, and read seven pages as text: a plain one, a both-capped
pair, a differently-capped pair, the two where one model never pays back, the one where neither
does, and one of the three that print the same figure at a level.

**Deploy confirmed.** **Run 69, on `518aa4b`, finished green at 08:00 UTC** with `npm ci`,
`npm test` and the full `npm run build` passing on the runner, and republished.

**PR #3 was repaired straight afterwards**, for the second time and from the same cause: this
run's push widened `checkPayback()` where `seo/compare-index` adds `checkCompareIndex()` in the
same block. Both checks were kept and both run. The branch was rebuilt (189 pages, 167 tests,
typecheck clean) and re-measured over HTTP (1,512 views, 0 overflows, 0 scrolling tables) before
pushing `1889421`. All three branches merge clean again.

**Continue next:** check all three PR branches still merge before anything else. The top item that
can reach main on its own is now the leaderboard's height on a phone, then the 5 pages on one
inbound link, then the two comparisons with no machine in common. Everything above those — the
question pages, the `/compare/` index, the home page's JSON-LD, the calculator's fonts — is still
written and waiting in a PR, and **the live site has had no new page since this agent started**.

### 2026-09-17 — what a machine head-to-head never said: how much use it takes

**All three open PRs were checked first and all three merged clean**, so nothing needed repairing
before the work. (One of them did afterwards; see the end of this entry.) Ryan has not been pinged
about any of them, per the standing rule.

Then the run's own item, found by measuring rather than from the backlog. Counting the visible
words on all 188 built pages, the thin end of the site was not the model pages but the **28 machine
head-to-heads: 356 to 618 words, median 490**, against a median of 634 on the 47 model ones, which
were rewritten on 2026-09-16. The three thinnest were the three 128GB machines against each other,
where the two columns hold the same models and the memory section has nothing to report.

**What was missing was not words.** Every one of those pages priced pay-back at exactly one level
of use — 500k tokens a day, in the lede and in one table row — and pay-back is the figure on the
page that moves most with how much you actually run. Someone choosing between two machines is
choosing at *their* usage, not at the default.

**What changed.** Each machine head-to-head now carries "How much use it takes to pay back": both
machines on the strongest model they both hold, across the five levels the calculator already
names, from "a few chats a day" at 50k to "agents running most of the day" at 20M. The section
says in a sentence whether the answer holds all the way up, and ends with the calculator prefilled
at the heaviest level for either machine.

**What the five levels turned up.** Pay-back does not simply scale, because `computeView` caps
usage at what a machine can generate in 24 hours. **22 figures across the 28 pages are at a
machine's ceiling**, and on **3 pairs that changes which machine pays back sooner**: the DGX
Spark, 128GB is ahead of the Mac Studio M5 Max, 128GB at every level up to 4M tokens a day and
behind it at 20M, because on Qwen3.8 27B it tops out at 15.2M tokens a day and the Mac does not.
That is a real fact about buying either one and the page could not say it before. Every capped
figure is marked and the ceiling is named underneath; on the 3 pages where both machines are
capped at the same level the two sentences are written as one, because a sentence each said the
same thing twice.

**What it did to the figures.** The 28 pages: **356–618 words before, median 490; 544–814 after,
median 693**. The thinnest comparison on the site is no longer a machine one.

`checkPayback()` now stops the build if a machine head-to-head loses the section, prices the wrong
number of levels, or marks a figure as a ceiling without naming it. All three were proved by
breaking them: the section suppressed failed at 28 pages, the row count failed at 28 when the
`<thead>` row was counted by mistake — which is how the first version of the check was found to be
wrong — and the ceiling note suppressed failed at the 19 pages that have one.

**Verified.** `npm test` 162 passing; typecheck clean; the full `npm run build`, `build:functions`
included, which needed no workaround this time. Built the whole page set from a worktree at
`origin/main` and compared all 188: **160 byte-identical, 28 changed, and not one line removed on
any of them** — pure addition, with no title, description or JSON-LD touched. Measured over HTTP
in Chromium at 320, 360, 390, 430, 700, 1024, 1280 and 1440px: **1,504 page views, 0 overflowing
the window and 0 of the tables scrolling sideways** at any width. Read the new section rendered at
390, 800 and 1280px, and read four pages as text: a flip, a both-capped pair, a neither-capped
pair and one where the two machines differ in memory.

**Deploy confirmed.** **Run 67, on `5e73669`, finished green at 06:54 UTC** with `npm ci`,
`npm test` and the full `npm run build` passing on the runner, and republished.

**PR #3 was repaired straight afterwards.** This run's push conflicted with `seo/compare-index`,
which adds `checkCompareIndex()` in the same place: both checks were kept, both run, and the
branch was rebuilt (189 pages, 167 tests, full build) and re-measured over HTTP (1,512 views,
0 overflows, 0 scrolling tables) before pushing `f46337f`. All three branches merge clean again.

**Continue next:** check all three PR branches still merge before anything else. The top item that
can reach main on its own is now the same section for the 47 model head-to-heads, which price
pay-back at one usage the same way these did; then the leaderboard's height on a phone, then the 5
pages on one link. Everything above those — the question pages, the `/compare/` index, the home
page's JSON-LD, the calculator's fonts — is still written and waiting in a PR, and **the live site
has had no new page since this agent started**.

### 2026-09-17 — the 47 model head-to-heads were hanging off one link each

**All three open PRs were checked first and all three still merge clean.** `git merge-tree`
against `origin/main` came back clean on `seo/how-much-memory`, `seo/home-head` and
`seo/compare-index`, so nothing needed repairing — the second run in a row that has been true.
Ryan has not been pinged about any of them, per the standing rule.

Then the run's own item, which was not on the backlog and turned up while reading what the build
already prints. `checkLinks()` says "every page is linked from at least 1 other page" and stops
there, so the next question is how many pages sit on that floor. Counting inbound links across
the 188 built pages: **52 had exactly one, and 47 of those were the model head-to-heads**. Their
single link was one cell in the last column of `/leaderboard/`. The 28 machine head-to-heads had
two each, from the two machine pages they compare, because `hardwarePage` has carried that line
since it was written. The model side never got it, so a quarter of the site was a page a crawler
reaches last and a reader never reaches at all — and the reader on a model's own page is exactly
the one with that comparison in front of them.

**What changed.** Every model page now names the head-to-heads it is in, and says which side each
one is on: "Head to head with its neighbours on the leaderboard: vs GLM-4.7-Flash above it, vs
Qwen3.5 9B below." Pairs are cut as [higher, lower] from leaderboard order, so a model's page
knows whether the model it is set against is the rung above it or the rung below; the top and the
bottom of the table have only one neighbour and get the one-sided wording instead, "the next model
down the leaderboard" and "the next model up". 48 of the 55 model pages carry the line. The other
7 are in no pair: the five models the index has not scored, and the two second quantisations the
leaderboard folds into their Q4 row.

**What it did to the figures.** Pages on a single inbound link: **52 before, 5 after**. Every
model head-to-head went from 1 to 3 — the leaderboard plus both models. The 5 that remain are
model pages rather than comparisons, and they are the new backlog item above.

`checkHeadToHeads()` now stops the build if a comparison is not linked from both of the things it
compares, machine and model alike. It was proved twice: with the new line removed it failed at 94
missing links, two for each of the 47 pairs, and with the line suppressed on one model it failed
at one and named `/compare/glm-4-7-flash-q4-vs-gemma-4-12b-q4/` and the page that had stopped
pointing at it.

**Verified.** `npm test` 162 passing; typecheck clean; the full `npm run build`. Built the whole
page set from a worktree at `origin/main` and compared all 188: **140 byte-identical, 48 changed,
and every change is the one added line** — 46 pages with both neighbours, 2 with one. No title, no
description and no JSON-LD moved. Measured over HTTP in Chromium at 320, 390, 430, 700, 1024, 1280
and 1440px: **0 of 188 pages overflow the window and 0 of 362 tables scroll sideways** at any of
them. Read the section as a picture at 1280px and at 390px, in the two-sided wording and in both
of the one-sided ones.

**Deploy confirmed.** **Run 65, on `e9547c8`, finished green at 05:51 UTC** with `npm ci`,
`npm test` and the full `npm run build` passing on the runner, and republished. All three PR
branches were re-checked immediately after the push and all three still merge clean, which
matters this time: this run edited `scripts/build-pages.ts`, the file PR #1 and PR #3 both touch.

**Continue next:** check all three PR branches still merge before anything else. The top item that
can still reach main on its own is the leaderboard's height on a phone, then the 5 pages on one
link above. Everything above those on the backlog — the question pages, the `/compare/` index, the
home page's JSON-LD, the calculator's fonts — is still written and waiting in a PR, and **the live
site has had no new page since this agent started**.

### 2026-09-17 — an index of every head-to-head

**Both open PRs were checked first and neither needed repairing**, which is the first time in
seven runs that has been true: main had moved only by a log commit since PR #1's sixth repair, so
`git merge-tree` came back clean on both branches. Ryan has not been pinged about either, per the
standing rule.

Then the item the last run said to continue, the `/compare/` index. It is a new page type, so it
is **[PR #3](https://github.com/rlindsey2/sunkcost/pull/3)**, branch `seo/compare-index`, commit
`50d96bb`. Nothing was pushed to main except this log.

**What the page is.** The 75 comparisons could be reached only from the two things each one
compares, so a search for "mac studio vs rtx 5090" had nothing here to land on. `/compare/` lists
them all: 28 machine match-ups, alphabetical so a reader finds their own machine in the first
column, each with both prices, both memory sizes, how many of the 39 open models each side holds
and the two speeds on the strongest model both machines hold; then 47 model match-ups in
leaderboard order with both scores, both weights, the cheapest machine here that runs the pair,
and the calculator prefilled with that machine and the first model named. 45 of the 47 pairs have
a machine that runs both; the other two say so rather than showing a blank.

**It says something of its own before it starts listing.** None of the 8 machines compared here
holds more than 33 of the 39 open models, and 4 of them hold that many, so the interesting figure
is the cheapest that does: the GMKtec EVO-X2, 128GB at $3,500. The first draft of that sentence
said the EVO-X2 "holds the most", which is true of four machines at once and therefore not true
of it. That is the kind of sentence this site cannot print.

**Two counts that had to agree with the rest of the site.** What a machine holds is counted
against the 39 current models, per the rule Ryan settled on 2026-09-16, not the 55 the leaderboard
ranks. The card's first draft counted against 55; it now reads the denominator off the same view
the machine pages use, and a test fails if that ever becomes `data.models.length` again. The
table's heading says "Models that fit, of 39" so the figure cannot be read against the wrong total.

**What else changed.** `checkCompareIndex()` stops the build if a comparison is written and the
index does not list it — adding a machine family adds comparisons, and this is what stops one
being added quietly. The index is linked from the leaderboard, best buys, the 8 machine pages
with head-to-heads and all 75 comparison pages, which also now carry it as the step above them in
their breadcrumbs, so a result for a match-up prints Sunk Cost / Head to head / the pair. One CSS
rule, `.c-pair`, lets a cell holding both sides of a match-up wrap instead of holding one line —
the same defect the 2026-09-17 repair found on `/how-much-memory/`, avoided here by design.

**Verified.** `npm test` 167 passing, 5 new; typecheck clean; the full `npm run build` including
`build:og`, `build:share` and `build:functions`, which found its font. Each new test was proved by
breaking what it holds — the card's ranking reversed, its denominator put back to 55, a price
printed without its "card only", the note stopped counting — and each failed by name and nothing
else did. `checkCompareIndex()` was proved the same way: one row dropped from the machine table
failed the build and named the comparison that went missing.

Built the whole page set from a worktree at `origin/main` and compared all 188 pages: **103
byte-identical, 85 changed, and every change is a link line** — 75 comparison pages by their note,
their nav and their JSON-LD, and 10 pages by one note line each. Measured over HTTP in Chromium at
320, 360, 390, 430, 660, 700, 860, 1024, 1280 and 1440px: **0 of 364 tables scroll sideways and no
page overflows its window**, the two new tables included. Read the page as a picture on a desktop,
a tablet and a phone, and the card as a PNG out of the real build.

**Deploy confirmed.** **Run 63, on `8e19252`, finished green at 04:59 UTC** with `npm ci`,
`npm test` and the full `npm run build` passing on the runner, and republished. The push carried
this log only; the page itself is in PR #3 and reaches the site when that merges. All three
branches merged cleanly against main immediately after that push.

**Continue next:** check all three PR branches still merge before anything else; PR #1 has needed
repair on six of the last eight runs and PR #3 touches the same file. The top item that can still
reach main on its own is the leaderboard's height on a phone. Everything above it on the backlog —
the question pages, the `/compare/` index, the home page's JSON-LD, the calculator's fonts — is
now written and waiting in a PR, which is worth saying plainly: **three PRs are open and the live
site has had no new page since this agent started**.

### 2026-09-17 — seven machine pages stop opening on a typo

**PR #1 was un-mergeable again and was repaired first**, which is what the last entry predicted:
that run touched `public/page.css`, `src/pagekit.ts` and `scripts/build-pages.ts`, and the branch
touches the last two. Both conflicts were import lists, in `scripts/build-pages.ts` and
`tests/pagekit.test.ts`, and both sides were kept in each: the branch's memory helpers and the
`tierLabel` main's leaderboard now uses. PR #2 still merges clean and was not touched. Ryan has
not been pinged about either, per the standing rule. This is the fifth repair PR #1 has needed
while it waits. **A second agent session was repairing the same branch at the same time**; it
verified this run's resolution and threw its own away, and its note in the entry below is worth
reading before assuming a branch is where you left it.

**The merge turned up a real defect on that branch, and it was fixed in the same run.** Main's
leaderboard fix lets a machine name, a model name and a class wrap at any width, and it is keyed
off the `c-hw` and `c-model` classes those cells carry. Three cells on `/how-much-memory/` named a
machine or a model without them, so they were still held to one line: three of that page's tables
wanted 981px, 951px and 939px against the 936px a page is ever given, and at every width from
1024px up "Cheapest machine that runs it" sat behind a sideways scroll — on the page that exists
to answer which machine runs what. Three classes added. Pushed as `832c0fa`; on the repaired
branch all 189 pages come back at 0 of 368 tables scrolling at 320, 390, 430, 700, 860, 1024, 1280
and 1440px. Both PR branches merge cleanly again as of 03:39 UTC.

**A measurement mistake worth not repeating.** The first pass rendered the built pages over
`file://` and reported 27 tables scrolling at 390px on main, which would have been a regression
shipped an hour earlier. It was not: the pages link `/page.css` by absolute path, which `file://`
resolves to the root of the filesystem, so **no stylesheet loaded at all** and the figures were of
an unstyled page. Served over HTTP instead, main comes back at 0 of 362 at every width, exactly as
the last run recorded. Any future run measuring layout must serve `public/` over HTTP —
`python3 -m http.server --directory public` is enough — and should check a known-good build first.
Playwright is not a dependency of this repo; `npm i playwright` into a scratch directory with
`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`, launched at
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, is what worked.

Then the run's own item, the article on the machine pages. Commit `963f9a3`, pushed to main.

**What was wrong.** Seven pages opened on "Can a NVIDIA GeForce RTX 3090, 24GB run local LLMs?" —
six NVIDIA cards and one AMD card — in the h1, at the top of the page, in the largest type on it.
English picks the article from the sound a name opens with, not the letter, and NVIDIA and AMD are
read out letter by letter, so both open on a vowel.

`indefiniteArticle()` in `src/pagekit.ts` reads the first word of a name. A word set in capitals is
taken as an initialism and answered on the name of its first letter — eff, aitch, em, en, ess and
the rest start with a vowel sound — so "an RTX", "an HP", "an M4", but "a DGX" and "a GPU".
Anything else is read as a word, which is what keeps "a Radeon" and "a Mac" right despite the
letters they start with, and the vowels read as consonants are covered too: a unified machine, a
one-off. The one thing the rule cannot get right is a capitalised name read as a word, the way RAM
is; there is none in the data, and the test below is what keeps it that way.

**Swept the whole site first rather than trusting the item's count.** Stripped the markup from all
188 pages and checked every "a"/"an" against the sound of the word after it: 7 wrong, all of them
this h1. Titles and meta descriptions were clean, because a description drops the maker prefix and
says "fit a GeForce RTX 3090, 24GB", which is right.

**Verified.** Built the whole set from a worktree at `origin/main` and compared all 188 pages:
**7 differ, each by exactly one line, the h1**, and the other 181 are byte-identical. Read the
RTX 3090 page as a picture before committing. `npm test` 162 passing (6 new), `npm run typecheck`
clean, and the full `npm run build` including `build:functions`, which found its font.

Each new test was proved by breaking what it holds and watching it fail by name — five mutations:
the capitals rule removed, the consonant-sounding vowels removed, the helper reading a whole label
instead of its first word, a family dropped from the hand-written table, and the h1 put back to a
hardcoded "a", which `checkArticles()` caught by naming all seven pages. The table of expected
articles in the test is written out by hand rather than derived, so the rule cannot pass by
agreeing with itself, and a separate test fails if the data ever grows a family the table does not
cover — a new maker has to be read out loud by a person before it ships.

**Deploy confirmed.** **Run 61, on `2d1d7e1`, finished green at 03:52 UTC** with `npm ci`,
`npm test` and the full `npm run build` passing on the runner, and republished. The site's own
pages still cannot be read from here, so this is the runner's word rather than a fetch of
sunkcost.ai.

**PR #1 went un-mergeable on that push and was repaired a second time in the same run**, the same
two import lists again, resolved the same way and pushed as `0f381fb`. On the repaired branch:
`npm test` 175 passing, typecheck clean, 189 pages built, and 0 of 368 tables scrolling at 390,
700, 1024 and 1440px. That is six repairs. The branch touches the two files nearly every run
edits, so this will keep happening for as long as it waits; it is not a fault in the branch.

**Continue next:** check PR #1 merges again before anything else; it has needed repair on six of
the last seven runs, and the `/how-much-memory/` page is worth re-measuring over HTTP each time
main changes the table rules. While both PRs wait, the top live item on main is the `/compare/` index,
which is a new page type and therefore a PR. After that, the leaderboard's height on a phone.

### 2026-09-17 — a tablet stops swiping, and the leaderboard shows all seven columns

Both PRs were read first, as the notes above ask. **PR #1 and PR #2 are both still open, both
still ready for review**, and both still merged cleanly against main at the start of this run.
Ryan has not been pinged about either, per the standing rule.

Took the item the last run said to continue, the band above 640px. Commit `8a82197`, pushed to
main.

**Measured first, and the item's own figures came back exactly**: rendering all 188 pages in
Chromium and reading every table's geometry gave 223 of the 362 tables scrolling at 700px, 122 at
800px and 34 at 900px, the same numbers the last run recorded. Two things it had not measured:
**250 scroll at 660px**, just above the phone breakpoint, which is the worst point on the whole
range; and **one table scrolls at every width there is**, which is the next paragraph.

**The item proposed the wrong fix, and the run did not take it.** Raising the `.board.stack`
breakpoint to 840px would have given a tablet the phone's block-per-row layout, which spends a
full-width line on every short cell: the leaderboard would have been about 8,000px tall on a
screen with room for a seven-column table. A window between a phone and a full page still reads a
table as a table. So the table stays a table between 641 and 1023px and **every cell wraps**
instead — 1024px being the window at which the page first gets its whole 980px measure. Figures
and quantisation labels keep their line, because half a number is worse than half a name. That
alone took every table in the band to zero, and the comparison split needed no change at all,
because the three-way split it was measured against only ever applied below 640px.

**The leaderboard was hiding two columns on every screen, desktops included.** It names two
machines a row, in "Cheapest machine that runs it" and "Next down", and both names were held to
one line, so the table wanted **1253px against the 936px a page is ever given**. `.doc-main` caps
at 980px, so no window was ever wide enough: at 1440px the last two columns sat behind a sideways
scroll, cut mid-word, on the site's main list page. Machine names, class names and the rival link
wrap at every width now, and the table comes out at exactly 936px. A memory figure like "17 GB"
still never breaks.

Which turned up a smaller thing worth naming: with the class column narrow, **"Haiku-class" broke
at its own hyphen**, "Haiku-" over "class", on about forty rows. `word-break: keep-all` does not
stop a hyphen break in Chromium — measured, not assumed — so `tierLabel()` holds a one-word tier
label in a `nobreak` span while a label that is a phrase still wraps between its words. Keeping
that label whole also redistributed the columns and left the page **shorter** than the first
attempt, 3,543px of table against 4,101.

**Verified.** All 188 pages rendered at 320, 360, 390, 430, 540, 600, 641, 700, 768, 860, 960,
1023, 1024, 1280 and 1440px: **0 of the 362 tables scroll sideways and none has any content past
its own edge**, at any of them, against 250 at 660px and 223 at 700px before. Then built the whole
set from a worktree at `origin/main` and compared every page as a picture:

- **On a phone nothing moves.** A geometry diff at 390px puts every element of every page at the
  same pixel it was at. 45 pages differ in the raster by the new span around the tier label
  alone — 670 differing pixels out of 1.85 million on the worst of them, all inside the label's
  own line.
- **On a desktop the leaderboard is the only page that changes**, at 1100px and at 1440px. It
  grows from 3,377 to 4,208px in exchange for the two columns it was hiding. The 33 hardware
  pages that show in the comparison differ by 46 pixels each, which is the same label span.

Read `/leaderboard/`, `/best/`, a model page, a machine page and a comparison as pictures at 700,
860, 1000 and 1100px, light and dark, before committing.

`npm test` 156 passing (6 new), `npm run typecheck` clean, and the full `npm run build` including
`build:functions`, which found its font. Each new test was proved by breaking what it holds and
watching it fail by name: the band's bounds, its wrapping rule, its exception for figures, the
nowrap on machine names put back, and `tierLabel()` in both directions.

**Deploy confirmed.** One push for the code and the log together. **Run 59, on `6eb28ef`,
finished green at 03:36 UTC** with `npm ci`, `npm test` and the full `npm run build` passing on the
runner, and republished. The site's own pages still cannot be read from here, so this is the
runner's word rather than a fetch of sunkcost.ai.

**Two agent sessions were running at once, and both repaired PR #1.** The push broke that branch's
merge as expected, and while this run was resolving it, session `01LU4YD…` resolved the same two
import lists and pushed first, at 03:38. Its resolution is the same one — both sides kept — and its
fix for the page goes further than this run's did: three cells on `/how-much-memory/` named a
machine or a model without carrying `c-hw` or `c-model`, so main's new wrapping rule did not reach
them and three of that page's tables wanted up to 981px against 936px, hiding "Run the numbers" on
every desktop. It classed all three; this run had classed one. **So this run threw its own commit
away and verified theirs instead**: on `832c0fa`, `npm test` 169 passing, typecheck clean, 189
pages built, and all 189 rendered at 320, 390, 641, 700, 860, 1023, 1100 and 1440px — **0 of the
368 tables scroll sideways and none has content past its own edge**. Both PR branches merge
cleanly against main as of 03:45 UTC.

A note for whoever runs next, because nothing else in this log has had to say it: **another
session may be working at the same time**. Fetch before assuming a branch is where you left it,
and read what landed before redoing it. Neither session lost work here, but only because the
second one checked.

**Continue next:** PR #1 almost certainly needs its merge repaired again — this run touched
`public/page.css`, `src/pagekit.ts` and `scripts/build-pages.ts`, which is exactly what that
branch touches — so check it before anything else and fix it if so. After that, and while both
PRs wait, the top live item on main is the graphics-card pages opening "Can a NVIDIA GeForce RTX
3090, 24GB run local LLMs?", which wants "an" and reads as a typo on the first line of seven
pages. If PR #1 has merged, the next question page, "best GPU for local LLMs", comes first.

### 2026-09-17 — a phone stops swiping to find the pay-back

Both PRs were read first, as the notes above ask. **PR #1 and PR #2 are both still open, both
still ready for review, and both still merge cleanly against main** — `git merge-tree` answers for
each in a second, and neither needed touching this run. Ryan has not been pinged about either, per
the standing rule.

Took the item the last run said to continue, the phone tables, and it was understated in the same
direction as the last two items were. Commit `7f46b3d`, pushed to main.

**Measured before writing anything**, by rendering all 188 generated pages in Chromium at 390px and
reading every table's geometry. 230 of the 362 tables scrolled sideways, which matched the item.
What they hid did not:

- **The pay-back was wholly off-screen on 147 of them** — 56 machine pages, 54 model pages and 37
  comparisons. That is the figure this entire site exists to print.
- **The link into the calculator was off-screen on 59**, all but 5 of them model pages. The
  prefilled `/?hw=…&m=…` link is the one thing every page is supposed to lead to.
- `/leaderboard/` lost its last three columns, including "Cheapest machine that runs it".
- The widest table wanted 852px against 358px of screen.

Each of those tables is marked up now so a narrow screen reads a row as a block: the name, the
figure that answers the page against the right edge, and the rest underneath, each with its
column heading in front of it. `stack()` in `src/pagekit.ts` does the marking at build time from
the table's own `<thead>`, so a heading and its cells cannot drift apart, and the call site says
only which column earns the right-hand side. Nothing is dropped, nothing is duplicated into the
HTML, and the labels ride in `data-label` attributes drawn by a `::before`, so the page has no
second copy of its own text.

**The first layout was thrown away, and the reason is worth keeping.** It used flexbox, and
flexbox decides which items share a line from their *basis*, before any growing or shrinking. So
on a row with a short pay-back there was room left over and the price jumped up onto the first
line, pushing the pay-back down onto the second — a different shape on every row, with the figure
that matters in a different place each time. There is no way to force a line break in flexbox
without an element to break on, and the only element available would have been a sixth `<td>`
the wide screen would have had to hide. Grid has no such problem: the first line is two columns,
everything else spans both. The cost is height, below.

Two things the screenshots caught that the geometry did not. A label set as `attr(data-label) " "`
lost its trailing space against an inline-grid, so the leaderboard read "Class▬▬▬▬"; it is a
margin now. And a column holding nothing but an em dash became a line reading "Cheapest —" on the
eight hosted rows, which reads as broken data rather than as "you cannot download this". Those
cells are left to the wide screen now. The first attempt at that rule turned on the *absence of
text* and hid 48 capability-dot cells, which are drawn on empty spans — so the rule turns on the
dash itself.

**Verified.** All 188 pages rendered again at 320, 360, 390 and 430px: **0 of the 362 tables
scroll sideways, 0 have any content past their own edge, and no page scrolls sideways**, against
230, at any width. Then built the whole set from a worktree at `origin/main` and rendered all 188
pages both ways at 1100px and 700px: **every page is pixel-identical**, so this is the phone
layout and nothing else. Read `/best/`, a model page, a machine page, the leaderboard and a
comparison page as pictures at 390px, light and dark, before committing.

`npm test` 150 passing (8 new), `npm run typecheck` clean, and the full `npm run build` including
`build:functions`, which found its font. Each new test was proved by breaking what it holds and
watching it fail by name — nine mutations in all, including two that only the "keeps the wide
screen exactly as it was" test caught. `checkTables()` now stops the build on any table that says
nothing about how it reads on a phone; proved by unwrapping one, which named 56 pages and stopped
the build. It prints 230, which is the same 230 that used to swipe.

**The cost, stated plainly:** a phone scrolls further down. Measured both builds at 390px, the
leaderboard's table goes 6,103px → 8,134px, `/best/`'s five tables 1,027 → 1,173 at the top and
1,234 → 1,329 at the bottom, a model page's machine table 351 → 1,040 and a machine page's two
tables 429 → 1,133 and 760 → 1,998. The median stacked table is 905px. So the pages that were
already long grow by a third, and the short tables are the ones that multiply, from one screen to
under three. That is the price of putting every column on a 358px screen instead of four of seven,
and vertical scrolling is a thing phones do. If it ever reads as too long, the fix is letting two
short columns share a line, which is a new backlog item below rather than a reason to hide a
column.

**Deploy confirmed.** One push for the code and the log together. **Run 57, on `08197e0`,
finished green at 02:09 UTC** with `npm ci`, `npm test` and the full `npm run build` passing on
the runner, and republished. The site's own pages still cannot be read from here, so this is the
runner's word rather than a fetch of sunkcost.ai.

**PR #1 went un-mergeable on this push, and was fixed in the same run.** This was the risk the note
at the top names: the change touched `scripts/build-pages.ts` and `src/pagekit.ts`, which is exactly
what that branch touches. Merged main into it (never a rebase — it is a branch with a PR open on
it), which conflicted twice: two import lists, and the machine page's "what it runs" table, where
main wrapped the table and the branch added a note under it. Both sides kept in each.

Then the new build guard earned itself on a page it was not written for: **`/how-much-memory/` had
five tables that would swipe**, the widest seven columns, and what a phone was hiding on it was the
total memory each model needs — the column that page exists for. They stack now like every other
table on the site. `npm test` 163 passing on the branch, and all 189 pages at 390px: 0 of the 368
tables scroll. Pushed as `d573b37`. **Both PR branches merge cleanly again as of 02:12 UTC.** This
is the fourth time PR #1 has had to be repaired while it waits; Ryan has not been pinged, per the
standing rule.

**Continue next:** the band above 640px, now measured and the top live item on main — 223 of the
362 tables still swipe at 700px, and the cheap half of it is raising the breakpoint these new
rules sit behind. If either PR has merged by then, the merged one comes first: after PR #1, the
next question page is "best GPU for local LLMs".

### 2026-09-17 — a share card never runs its own words off the edge

Both PRs were read first, as the notes above ask, and both still merge: `git merge-tree` against
main answers for each in a second, and neither needed touching this run. Ryan has not been pinged
about either, per the standing rule.

Took the item the last run said to continue, the share card's config line, and it was understated
in the same direction the card-price item was. Commit `27b4569`, pushed to main.

**Measured before writing anything.** Rendered all 1,894 share cards with the font the build
actually uses and read the rightmost inked pixel of each line against a 56px margin: **687 clipped
the config line, 214 the verdict and 59 the sub-line**. The worst config line reached x=1198 on a
1200px card, cut mid-word. `/og/default.png`, the card that previews sunkcost.ai itself, was one of
the 214.

None of the three lines had any width fitting at all — drawn at x=56 at a fixed size and trusted to
be short, while the head-to-head cards beside them have picked a size and wrapped since they were
written. Nothing on these cards is short by rule: a machine is "Mac mini M6, 16GB" or "Strix Halo
Corsair AI Workstation 300, 128GB", and a pay-back is 4 characters or 12.

Each line is fitted now. The verdict takes the largest of 60, 54, 50 and 46 that fits. The
configuration and the usage are two thoughts joined by a dot, so a line too long for the card breaks
between them rather than setting too small to read in a timeline — **697 cards take the second
line**. The sub-line is a whole sentence, so it wraps instead of shrinking. An extra line takes its
height from the plot above rather than the strip of figures below, which is what the block already
did for the sub-line.

**The verdict needed its own width estimate, and this is the part worth remembering.** `EM_BOLD`
is 0.66 because it is tuned for machine names, which are caps and digits. A verdict is a lowercase
sentence and sets far narrower, so reusing that estimate was 13% pessimistic and cost 1,764
headlines a size they did not need to lose. Rendered every distinct string the site produces and
measured it: the widest verdict comes out at **0.56 em** with the tracking included, the widest
detail line at 0.554 and the widest sub-line at 0.523. So `EM = 0.58` is right for the regular
lines — 5% headroom over the widest real string, and its 697 splits against 687 true overflows —
and the verdict gets `EM_VERDICT = 0.6`. 113 cards keep 60px, 1,550 take one step down, 228 two,
3 three.

**The fitting helpers moved to `src/text-fit.ts`, and that is the only reason this is two files.**
Importing them from `versus-card.ts` would have pulled `pagekit` and the dataset helpers into the
calculator's own JS bundle. They are still re-exported from `versus-card.ts`, so `list-card.ts` and
its tests are untouched. The bundle goes 272.80 kB → 273.77 kB, +0.5 kB gzipped, which is the
helpers themselves; `versusCardSvg` and `hardwarePairs` appear 0 times in the built bundle.

**Verified.** Rendered every card again and measured every line against the card's own geometry,
read out of its markup rather than assumed: **0 lines past the margin, widest now 1082 against a
limit of 1144**. Then built the whole set from a worktree at `origin/main` and compared all 2,177
files: **1,869 share cards and `default.png` differ, and the 188 generated pages, the 75
head-to-head cards and the list cards are byte-identical**. `npm test` 142 passing (6 new), typecheck
clean, and the full `npm run build` including `build:functions`, which did find its font this time.
Each new test was proved by taking the fitting back out and watching all five fail by name — two of
them passed the first time that was tried, because the old size rule happened to satisfy them, so
both were rewritten before they counted.

**Deploy confirmed.** One push this run, both commits together, which is what the last entry asked
for. **Run 55, on `ba6841f`, finished green at 01:31 UTC** with `npm ci`, `npm test` and the full
`npm run build` passing on the runner, and republished — 6 minutes rather than the usual 3.5, which
is the 1,870 changed cards going up. Both PR branches were re-checked after the push and both still
merge, which matters because this one touched `src/versus-card.ts`. The site's own pages still
cannot be read from here, so this is the runner's word rather than a fetch of sunkcost.ai.

**Continue next:** the two table items are the live work on main, the narrower-columns one
(`scripts/build-pages.ts`, not CSS) being the bigger of the two, since `/best/` still hides the
pay-back column on a phone and that is the column the page exists for. The new waterline-label item
above is a twenty-minute job if a smaller one is wanted. If either PR has merged by then, the merged
one comes first: after PR #1, the next question page is "best GPU for local LLMs".

### 2026-09-16 — a graphics card's price stops reading as a whole computer's

The top item said the head-to-head cards were the last place the site printed a graphics card's
price as if it bought a computer. Measured it before writing anything, and the item was wrong in
the direction that mattered: **57 of the 188 pages were still doing it**, the cards as well.
Commit `d36958d`, pushed to main.

$1,299 buys an AMD Radeon AI PRO R9700, and it also buys a Mac mini M6 with 32GB. Both sit in the
same tables here. The pages fixed the head-to-head tables this morning and left the rest:

- **The card's own page**, in the answer box at the top: "Price $1,999", above a pay-back worked
  out from that figure. All 7 graphics card pages.
- **Every model page's "machines that run it" table and its answer box** — 48 pages.
- **The leaderboard's cheapest-machine column**, five rows of it.
- **Five model descriptions**, which is the copy a search result prints: "The cheapest machine
  that runs it is Radeon AI PRO R9700, 32GB at $1,299." That one was the worst of them, because
  it is read by people who have not reached the site yet.
- **The cards**: 13 of the 28 machine head-to-heads, the model cards that name a card as the
  cheapest machine, and the per-page share cards, which labelled the figure "Hardware".

All of it now carries the scope. `priceWithScopeText()` in `src/pagekit.ts` is the plain-text
half of the existing `priceWithScope()`, for a description or a card drawn as one picture, where
there is no markup to hang a span on. The machine page also says it in the lede, in words rather
than a chip, because that is where a reader meets the pay-back: "Its price here is the card on
its own, so every figure below leaves out the PC you need to put it in." The share cards label
it "Hardware (card only)", unless the price is one somebody entered themselves, which is theirs
and not the card's.

**It is held by the build now, not by good intentions.** `checkCardPrices()` reads every finished
page and fails if a card-priced machine's price appears in a row, sentence or description that
does not say what it buys, attributing each figure to the machine named beside it so a MacBook
Pro at the same $1,999 does not trip it. Proved by putting the model page's price column back as
it was: 85 problems, named, build stopped.

**Verified against the previous build.** Built the whole set from a worktree at `origin/main` and
again with the change: **57 pages differ, 131 are byte-identical**, and the only heads that moved
are 10 model descriptions. Five of those gained a pay-back clause they had not had room for, from
a terser second wording added so that stating the scope costs the wording rather than the fact:
"Cheapest that runs it: Framework Desktop, 128GB at $3,449, where it pays back in 27 years."
Titles, canonicals and card addresses are untouched, so nothing needs re-indexing.

**Deploy confirmed.** Three pushes this run, so runs 52 and 53 stacked: 52 was cancelled as 53
started, which is the concurrency rule working, and **run 53, on `6abf709`, finished green at
00:19 UTC** with `npm ci`, `npm test` and the full `npm run build` passing on the runner, and
republished. Everything from all three commits is live. The site's own pages still cannot be read
from here, so this is the runner's word rather than a fetch of sunkcost.ai. Two of those pushes
were avoidable: the code and the log should have gone up together, and the third only existed
because a rebase changed the hash the entry named. Write the entry, then push once.

`npm test` (136 passing, 3 new), `npm run typecheck` and the full `npm run build` including
`build:og`, `build:share` and `build:functions`, all clean here. Each new test was proved by
breaking what it holds and watching it fail by name: the machine card's price, the model card's
cheapest machine, the share card's label, and the plain-text price itself. An independent sweep
of the finished site, written before the build check and not sharing its code, finds **0**
unscoped card prices across the 188 pages and the 1,894 share pages. Read the 3090 page at 390px,
the 5090 page at 1100px, a model page at 390px and three cards as PNGs out of the real build.

**Worth knowing for the next run that verifies by screenshot.** `npx playwright` is not in the
repo's dependencies; install it into the scratchpad and let `PLAYWRIGHT_BROWSERS_PATH` find the
Chromium that is already on the box. Serve `public/` over HTTP first (`python3 -m http.server`):
the pages link `/page.css` absolutely, so `file://` renders them unstyled and every judgement
about layout from such a shot is worthless.

**And a mistake worth not repeating:** four of those proofs were run by patching a file and
restoring it with `git checkout -- <file>`, which threw away that file's uncommitted work. Three
source files had to be rewritten from the session's own record. Copy the file aside and copy it
back; `git checkout` is not an undo when the work is not committed yet.

Both PRs were read at the start of this run and both are now out of draft, waiting only on the
merge button. A second run was working on PR #1's staleness at the same time and its entry is
below; where the two touched `seo/LOG.md` this one rebased onto theirs. Neither PR has been pinged
about again, as the notes above ask.

**This push made PR #1 stale for the third time today, and this run put it back.** `git merge-tree`
against the new main: `seo/home-head` still merges, `seo/how-much-memory` did not. Merged main into
it (`34cfe3c`), and the three conflicts were the same shape the entry below describes — two import
lists and, this time, the two build checks sitting next to each other — so every resolution is the
union and nothing had to be chosen between. The merged tree: 149 tests passing, typecheck clean,
189 pages built with **both** `checkCounts()` and `checkCardPrices()` passing, which is the useful
part: the memory page prints prices too, and it does not print a card's bare. Both branches merge
cleanly as of this run. `git merge-tree --write-tree origin/main origin/<branch>` answers it in a
second and needs no checkout.

**Continue next:** the share card's config line, the new item above, is the biggest unfixed thing
on a picture that every shared link previews as, and the fitting code it needs is already written.
Failing that, the two table items are still the live work on main, the narrower-columns one being
`scripts/build-pages.ts` rather than CSS. If either PR has merged by then, the merged one comes
first: after PR #1, the next question page ("best GPU for local LLMs").
### 2026-09-16 — PR #1 out of draft, and stale again by the time it was

Ryan marked PR #1 ready for review at 23:22, which woke this session on the PR event. The same
fetch showed `mergeable_state: dirty`: **eighteen commits had landed on main in the five and a half
hours since the afternoon merge**, and the branch no longer merged. So the click that was supposed
to unblock it left it blocked on something else. Merged main in again: merge commit `7b785a1` on
`seo/how-much-memory`, pushed, and it merges cleanly now.

This is the second time in one day this branch has gone stale, and the reason is structural rather
than bad luck: it touches `scripts/build-pages.ts` and `src/pagekit.ts`, which is where nearly
every run does its work. The head-to-head rewrites, the phone-width table fix and the RTX 3060
label all landed in those two files while this waited.

All three conflicts were import lists, in `scripts/build-pages.ts`, `src/pagekit.ts` and
`tests/pagekit.test.ts`, and both sides only ever added, so each resolution is the union of the
two. Nothing in either side's logic had to be chosen between, which is worth recording: an import
list is what a conflict looks like when two runs add different things to the same file, and it is
not the dangerous kind.

**Verified the same way as the afternoon merge, plus the guard that matters here.** `npm test` 143
passing, which is main's 130 and the branch's 13 with none lost from either side; typecheck clean;
the full card and page build, 1,894 share cards, 75 head-to-heads, 3 list cards and `default.png`,
189 pages, no orphans, one address each, 184 OG cards named and all drawn. The important one is
`checkCounts()`, the guard the counting-rule run added: **37 machines, each counted the same on its
own page and on /how-much-memory/**. The counting rule lives on this branch and the head-to-head
rewrite lives on main, and both move numbers, so that guard passing on the merged tree is the real
evidence the two agree.

Then the page-set comparison: built main's 188 pages in a separate worktree and compared all 190
files against the merge. One file is new, none lost, and across the 189 that differ there are
**zero changed regions not explained by a `/how-much-memory/` link**. `git diff origin/main HEAD`
is 644 insertions and 27 deletions across 7 files, and every removed line is either an import
replaced by its union or one of the four lines this branch extends with its link.

Also read the new `/og/how-much-memory.png` as an image rather than trusting the build: no
truncation, no overlap, and the four bands climb 12.8 GB, 43.4 GB, 53.3 GB, 189.5 GB, matching the
page's own sections.

**Two runs were in the air again, and neither trod on the other.** The 23:21 run took PR #2, which
Ryan marked ready one minute before this one, and found it in exactly the same state: out of draft
and un-mergeable. Same diagnosis, same fix, different branch. Checked the branch tip had not moved
before pushing, and main had (a log-only commit), which the merge already merges cleanly against.

Ryan was not pinged. He was acting on the PRs at the time, the standing rule says no third ping on
this one, and the useful detail belongs where he was already looking, so it went in a comment on
the PR instead.

**Continue next:** both PRs are green, mergeable and out of draft, so both are one click from
Ryan and nothing about them is the agent's to advance. The live work is the two table items the
counting-rule entry left, which are the other run's to continue. If either PR is still open next
run, **check it still merges before anything else** — that is now twice in a day, and it takes
one `git merge-tree` to find out.

### 2026-09-16 — the RTX 3060 label, and one rule for counting what a machine holds

Ryan replied for the first time in days, asked what needed him, took two items and handed one back:
**"model count: don't care - you pick"** and **"yeah fix the geforce issue"**. Both are done. He also
asked for something the site cannot give him yet, which is the most useful thing in this entry.

**He asked for preview URLs of the two open PRs, and there are none.** `deploy.yml` runs on push to
`main` and on `workflow_dispatch` only, and publishes with `--branch=main`, which Cloudflare treats
as production, so a PR gets no build, no checks and nothing to look at. The agent built both
branches here and sent screenshots instead. **This makes the `pull_request` workflow item above
worth more than it looked**: the same file that would run `npm ci`, `npm test` and `npm run build`
on a PR can publish the result with `pages deploy dist --branch=$HEAD_REF`, which Cloudflare serves
at a preview URL of its own. Same secrets, same job, one extra step, and Ryan gets to look at a page
before merging rather than after. Still his call, because it is CI and it spends his Cloudflare
token, but he has now asked for what it provides, which is a different answer to "is it worth it".

**The RTX 3060.** `chip` was "GeForce RTX 3060 12GB" while every other card is entered without its
memory, so the label builder's ", 12GB" landed on top of it: "NVIDIA GeForce RTX 3060 12GB, 12GB",
in the h1, the title, the description, the breadcrumb, the Product node and every link to the page.
`chip` is now "GeForce RTX 3060". Built before and after: **6 pages differ and nothing else** — the
card's own page and the five other NVIDIA cards that link to it — and the title, 6 characters
shorter, now fits the brand suffix it had been losing. The validator refuses any chip ending in its
own memory size, proved by putting the old name back and watching it fail by name. NVIDIA does sell
an 8GB 3060 and the 12GB was part of the retail name, which is presumably why it was entered that
way; the label carries the memory either way, so nothing is lost.

**The counting rule, which was the judgement call.** A count of what a machine holds now uses the
39 current models everywhere — the set the calculator shows before you ask for the older ones, and
the set every machine page already counted. What a model *needs* is a different question, and a
superseded model needs the same memory, so /how-much-memory/'s tables by size still cover all 55
and mark the superseded ones. One denominator everywhere was the wrong goal: it would have taken
Llama 3.3 70B out of the 70B section of the page that exists to answer "how much RAM for a 70B".
The two tables there that count what a machine holds now read 10, 13, 19, 24, 27 where they read
13, 18, 26, 32, 35, which is exactly what the Mac mini M6 16GB, 24GB and 32GB, the Framework Desktop
32GB and the Mac Studio M5 Max say on their own pages. That page lives on the PR #1 branch, so the
fix went there: commit `7a1af80` on `seo/how-much-memory`.

`checkCounts()` holds it at build time rather than by good intentions: every priced machine still
sold has to come out the same on its own page and on the memory page, or the build stops. Proved by
reverting the rule and watching it name the Mac mini M6 and both numbers.

**Two runs were in the air at once, and the other one was right.** The 22:48 run measured the
phone-width item this session had raised and found the premise wrong: no page overflows the window,
and the full-height screenshot that raised it renders a scrolling table at its full width. This
session had then read the same artefact a second time, at 1100px on the memory page, and was about
to log "wide tables are cut off on desktop too" — which is the same misreading. It is not in the
backlog, because what is real is in that run's two follow-up items above. **Worth keeping: a
full-height headless screenshot cannot be used to judge whether anything overflows.** Where the two
runs touched the same file, this one rebased onto theirs.

Also seen while reading a card page and worth an item: every graphics card page opens "Can a NVIDIA
…", which wants "an".

Commit `93fcbb6` on main: the data edit, the validator check and this log. `npm test` (130 passing),
`npm run validate`, `npm run typecheck` and `npm run build:pages` clean here, and the memory page
branch's own suite (126 passing) before pushing to it.

**Continue next:** the two table items above are the live work and they are the other run's to
continue — the narrower-columns one is `scripts/build-pages.ts` rather than CSS. If Ryan has merged
either PR by then, the merged one comes first: after PR #1, the next question page ("best GPU for
local LLMs"); after PR #2, nothing, it is done when it lands. If he says yes to previews, that
workflow is the highest-value hour on the list, because it unblocks his review of everything else.

### 2026-09-16 — the head-to-head tables now fit a phone

The last entry offered `/compare/` as an index, which is a new page type and would have made a
third PR waiting on Ryan, or the phone-width item, which goes straight to main. Took the phone
one. Commit `f86bbd4`, pushed to main.

**Measured first, and the backlog item was wrong.** Every one of the 188 pages was loaded in
Chromium at 390px and checked for anything sticking out past the window: `documentElement.scrollWidth`
equals the viewport on all 188, and no element outside a scroll container reaches past the right
edge. Same at 320, 360 and 430px. The earlier reading came from a full-height screenshot, which
renders a horizontally scrolling table at its full width rather than at the window's, so the page
looks like it runs off the edge when it does not.

**What was real was one level down.** All 362 tables across the page set were cut off at the right
edge, and on the 132 comparison tables the cut fell inside the second column: at 390px the
head-to-head table wanted up to 918px, so a phone reader saw the first machine, the row labels and
a sliver of the second — on pages whose whole purpose is two machines side by side. 40% of the
site's pages are comparisons.

What changed, all in `public/page.css`, all inside the existing 640px breakpoint bar one rule:

- Comparison tables drop the sideways scroll on a phone, split the width three ways (34% for the
  row label) and wrap the names. All 132 now fit whole, from 320px up. Long unbroken names
  (`DeepSeek-R1-Distill-Qwen-32B`) and the "priced as …" note needed `overflow-wrap: anywhere`
  and a wrapping `.c-quant`, or the fixed layout pushed them past the edge again.
- List tables let long machine and model names wrap, which is right on a phone and wrong on a
  desktop, so it is scoped to the breakpoint. The leaderboard goes 1,225px → 761, `/best/`
  874 → 576, a machine page's model table 663 → 633, against 358px of screen.
- A table still wider than the window fades at the edge nobody has reached yet. It rides a scroll
  timeline (`animation-timeline: scroll(self inline)`), so the fade is there while there is more
  to see, gone at the end of the scroll, and absent on a table that fits — checked by reading the
  computed `mask-image` at the start, the middle and the end of a scroll. It is wrapped in
  `@supports`, so a browser without scroll timelines gets nothing rather than something wrong.

**Verified by measurement, not by eye alone.** All 188 pages swept again at 320, 360, 390 and
430px: no page overflows, and 0 of the 132 comparison tables are clipped, down from 132. Tables
needing a sideways swipe: 362 → 230. Desktop was checked for collateral damage by screenshotting
six representative pages at 1200px against `page.css` as it was: five are byte-identical and the
sixth is the leaderboard, which is the one table wide enough to scroll at 1200px and now says so.
Read the rendered pages at 390px: a machine head-to-head, a model head-to-head with the longest
names on the site, `/best/` and a machine page. The head-to-heads now read as two columns of a
comparison rather than one column and a hint.

`npm test` (130 passing, none new — this is CSS, and the suite has no browser), `npm run typecheck`
and the full `npm run build` including `build:og`, `build:share` and `build:functions`, all clean
here. No test was added: a layout claim needs a real viewport, and nothing in the suite has one.
That is why every figure above comes with the width it was measured at.

A sticky first column was tried for the 230 tables that still scroll, and dropped rather than
shipped: the name column is 290px of the 358 available, so sticking it leaves almost nothing to
scroll in, and the full-width section heading rows stick as empty bands. Both new backlog items
above came out of this run.

**Deploy confirmed.** Two pushes again, the change and then this log, so run 46 was cancelled by
the concurrency rule as it queued and run 47, on `0f0f3c4`, finished green at 22:55 UTC with
`npm ci`, `npm test` and the full build passing on the runner. Everything from both commits is
live. The site's own pages still cannot be read from here, so this is the runner's word, not a
fetch of sunkcost.ai.

**Continue next:** `/compare/` as an index is still the best of what is left, and it is still a new
page type, so it is still a PR. If three PRs waiting is one too many, the `pull_request` CI
workflow is unwritten and protects every one of them, and the head-to-head OG cards still print a
graphics card's price as if it were a whole computer's, which is the last place on the site that
does.

### 2026-09-16 — the 47 model head-to-heads say what each model costs to run

The last entry asked for two things and both are done. **The deploy question first: runs 41 and 42
were cancelled, not stuck.** Both were superseded by the next push while they queued, which is the
concurrency rule working as intended and exactly what the doubled push that run risked. Run 43, on
`fde77db`, finished green at 21:04 UTC and republished, so everything from the head-to-head rewrite
and both log commits is live. Nothing was lost and nothing needed re-running. The habit stands: one
push, not two.

Then the item that entry named to continue, the 47 model head-to-heads, which were the thin half of
the site once the machine ones were fixed. Median 157 words, no `<h2>` on any of them, 5 internal
links, and **not one link into the calculator on any of the 47**. Commit `e2ff694`, pushed to main.

A model head-to-head was a specification table with a sentence about the intelligence index on top.
It said which model was cleverer and nothing about what running either one costs, which is the only
question this site exists to answer. The numbers for it were already there: `runnersFor` knows every
machine that holds a model, and the gap between the cheapest machine that runs each is the buying
decision nothing on the site stated.

What the pages do now. The lede answers in four sentences: which model is ahead on the index, what
the cheapest machine that runs each one costs and what the difference between them is, which model
is quicker **on the cheapest machine that runs both** and by how much, and whether that machine ever
pays for itself running either. Then a side-by-side section on the machine they share — speed,
pay-back and the API bill for the same month's work — because the main table gives each model the
cheapest machine that runs *it*, and on most pairs those are two different machines, so nothing in
it is a race. Then the machines that run one model and not the other, which is what the difference
in footprint costs at the till: on gpt-oss-120b against Ling 3.0 tiny, that is 24 of the 37 machines
priced here, starting $2,550 lower down the range.

**Two things were wrong rather than thin, and both are fixed.** A price gap under $100 printed in
cents beside whole-dollar prices — "$1,299 and $1,269, $30.00 less" — because `fmtUsd` switches to
cents below $100. No machine pair is that close today, so it never showed on the live pages, but
`machineVerdict` had the same line and now takes the same fix. And the table printed API prices for
models nobody rents by the token without saying whose prices they were; where the price stands in
for another model, the hosted model is now named beside it, in the table and under the monthly
figure.

**Verified against the previous build, page by page.** Built the whole set twice, once from a
worktree at `origin/main` and once with the change: **47 pages differ and 143 are byte-identical**,
the 47 being exactly the model head-to-heads. The `<head>` is **byte-identical on all 47**, so every
title, description, canonical and card address is what it was and nothing needs re-indexing. Median
words in `<main>` 157 → 634, minimum 135 → 390, `<h2>` 0 → 3, internal links 5 → 20, and every page
now has at least two links into the calculator with the machine and the model prefilled.

Then checked the claims against the tables they sit with, by parsing the built pages: **276 prose
claims cross-checked on 47 pages, and every one matches the row beside it** — the index figures and
which model is named as ahead, both prices and the gap between them, the two speeds and the ratio,
the pay-back durations, the count of machines one model runs on and the other does not against the
difference in the counts, the "starting at" price against the first row of the table under it, and
the memory each needs against its own row. No speed anywhere without its basis, no `undefined`, no
`NaN`, no maintainer language, no link out of canonical form, every table balanced.

`npm test` (130 passing, 9 new), `npm run typecheck`, and the full `npm run build` including
`build:og`, `build:share` and `build:functions`, all clean here. The guarantees are held by tests
rather than by good intentions, and each was proved by breaking it on purpose and watching its own
test fail by name: a ratio worked out from precision the page does not show, a price gap printed in
cents, a machine named as running both when it runs only one, and two speeds called the same when
they are not. Three of those tests run over **all 47 pairs**, not a chosen few — the first draft
tested three hand-picked pairs, and when the ratio rule was broken on purpose all three still
passed, which is how that got caught.

**Deploy confirmed from here this time.** One push, one run: run 44, on `b7fbdcc`, finished green
at 21:58 UTC with `npm ci`, `npm test` and the full `npm run build` all passing on the runner, and
republished. The 47 pages are live. Worth knowing for the next run that waits on a deploy: the
GitHub API's `updated_at` looks frozen because the run really is still going, and `api.github.com`
answers an unauthenticated `curl` from this environment, so an `until` loop on the run's `status` is
a better way to wait than repeated calls that return the same in-progress snapshot.

Read the finished page in Chromium, full height, at 900px and at 390px. It reads as a buying
decision rather than a spec sheet. The 390px shot turned up something older and larger, which is now
a backlog item: these pages do not fit a phone, and pages untouched for weeks do the same.

**Continue next:** `/compare/` as an index is the best of what is left, and it is a new page type so
it goes to a PR, which would make three waiting on Ryan. If that is one too many, the phone-width
item above is the biggest thing on main's own list — most search traffic is mobile and every
generated page is affected — and it is measurement first, CSS second. Failing both, the `pull_request`
CI workflow is still unwritten and still protects every PR in the queue.

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

**Deploy, and this needs checking next run.** The code commit and the log went up in one push as
run 41, which is the right way round; the card note below then went up separately as run 42, so
that habit was broken this time and run 41 may have been superseded. Neither could be confirmed
from here. On run 41 `npm ci` and `npm test` passed on the runner and `npm run build` was still
reported in progress thirteen minutes later; run 42 sat `pending` for twelve minutes without
starting, with both runs' `updated_at` frozen at the minute they were created. The canonical run
recorded the same thing (`in_progress` for a quarter of an hour after the job had finished), so
this is most likely the API going stale rather than anything wrong, but it is not evidence of
green. **The first thing the next run should do is confirm runs 41 and 42 and record the result**,
and if neither published, re-run the workflow by hand. Everything in the commit passed locally,
including the same full `npm run build` with `build:og`, `build:share` and `build:functions`, and
`npm test` passed on the runner itself, so the risk is in the publish rather than in the code.

A habit worth keeping, which this run broke: put the code commit and the log commit in **one**
push. A second push a minute later makes a second run that supersedes the first.

Also found while checking the cards, not fixed this run because it is a second change: the
head-to-head OG cards print the same bare price these pages did. It is a backlog item above with
the line numbers.

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
Deploy run 39, on this log commit, finished green at 19:51 UTC and republished. PR #2 has no
checks, because nothing triggers on `pull_request`; that backlog item is now protecting two PRs
rather than one.

**Later the same evening, on the PR event:** Ryan marked PR #2 ready for review at 23:21 UTC, and
the same fetch showed it had become un-mergeable. Eight commits had landed on main in the three
hours it sat there, and the only conflict was `tests/pagekit.test.ts`, where the model head-to-head
run and this branch had each appended a `describe` block at the end of the file. Resolved as the
union of the two, merge commit `67b1a25` on `seo/home-head`. `npm test` 134 passing, which is
main's 130 and this branch's 4 with none lost from either side, plus typecheck and the full build
including `build:og`, `build:share` and `build:functions`. `git diff` against main is still the
180 insertions and 4 deletions across 5 files it was before the merge, so the merge added nothing
and dropped nothing. The font guard is worth a line of its own here: the phone-width run added 30
lines to `public/page.css`, and the test that compares that file's `@font-face` block with
`src/fonts.css` rule by rule stayed green, which is exactly how it should read when those two files
diverge somewhere that is not type.

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
