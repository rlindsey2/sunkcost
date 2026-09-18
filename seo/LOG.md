# SEO log

Read this before doing anything. One entry per run, newest first. Pick up the top open item in
the backlog, or the open item the previous run said to continue. Never redo a done item.

**One thing comes before the backlog, once a day.** Run `npm run model-watch`. If it prints a last
checked date that is not today, do the model watch in `seo/MODEL-WATCH.md` before anything else —
new models are what this site is about, and a site that lists last month's is worth less than one
that is a day late on a page. It is ten minutes on a quiet day. If the date is today, another run
has done it and the backlog is the job. Ryan asked for this on 2026-09-18.

## Ryan's side (needs the site owner)

- [ ] **A new model is waiting on figures only you can sign off: Ternary Bonsai 2 27B**, announced
      2026-09-17 and the reason the daily model watch exists. It is Qwen3.8 27B — the model this
      site ranks top of what a graphics card runs — at a stated **5.9 GB** against the 16.46 GB the
      Q4_K_M row carries, so it would drop into machines that cannot hold the model today. The
      candidate, its sources and everything still missing are in `seo/MODEL-WATCH.md`.
      Two things are needed and neither is the agent's to decide. **The figures**: weights at the
      precision actually entered, the architecture the KV-cache figure is checked against, whether
      anybody rents it, and an Artificial Analysis score, which the index does not appear to carry
      for this build. **The judgement**: a ternary build retaining 98.2% of its base model is either
      its own row with its own score, or a second quantisation of Qwen3.8 27B inheriting that
      model's score with a note — the first needs a number nobody has published, the second prints
      a score this build did not earn.
      **And one standing decision that would change how much the watch is worth.** As it stands the
      agent records a candidate and stops, because `data/*.json` is on its never-touch list. If you
      would rather it opened a pull request against `models.json` once every field has a source it
      can name — never inventing one, and stopping where a figure is missing — say so and the rule
      can be lifted for this the way it was lifted for the usage slider in PR #6.

- [ ] **Two agent sessions keep running this hourly task at the same time, and they duplicate each
      other's work.** It has now happened at least twice: once around 03:38 on 2026-09-17 (see the run
      entry "a tablet stops swiping, and the leaderboard shows all seven columns", which ends with a
      note about it) and again
      at 17:38 the same day. Twice is a pattern, not an accident, so it is worth a look at the
      schedule rather than a note in the log. The 17:00 slot fired twice: `session_01HLJt85apd2NivX6fVvQH6s` (which did
      this run's work and pushed `9717481`) and `session_01GisDawkCEqMazMjq8SY8SP`, which picked up
      that same commit and repaired PR #1 and PR #3 against it four minutes ahead of the other
      session doing the identical repair. Nothing was corrupted — both resolutions were the same
      union, both were verified here after the fact, and all three PRs merge clean — but an hour of
      one session's work was thrown away, and a worse collision is easy to imagine: two sessions
      appending different entries to this log, or two pushing different fixes to the same branch.
      Worth checking the schedule for a duplicate trigger, or whatever fired the job twice. Until
      that is settled, a run that finds its push rejected should assume a sibling session, fetch,
      verify the other side's work rather than force it, and say so in its entry.
      **It is now three sessions, not two, and that is worth acting on.** Between 21:22 and 21:27 on
      2026-09-17 the 21:00 slot pushed to `main` from **three different sessions**:
      `session_01EPxEDkq2mnCiU4hPFTT68M` (the memory-tier pages and this entry),
      `session_01BkmaydTHe1vj4nWki6YR5D` (`2261cdb`, housekeeping for Ryan's two merges) and
      `session_01EhPgrvS5JTn3NjAXEgC1wH` (`14abd20`, housekeeping for the same two merges, plus a
      genuinely useful find on PR #3's branch). Two of the three independently verified merged main
      and independently wrote up the same two merges, and the third's log push was rejected and had
      to be rebased. **Nothing was corrupted and nothing was forced**, and one of the collisions paid
      for itself — `session_01EhPgrvS5JTn3NjAXEgC1wH` noticed that PR #3's branch was carrying
      `public/og/og/`, 1,993 build-output PNGs and 151.8 MB of them, which the ignore rule's single
      star had never matched. That was inherited from the 19:58 repair, not from this run, and it is
      now removed and the rule tightened. But three sessions an hour is three times the token spend
      for one hour of work, and the next collision may not be as lucky: two of them a minute apart
      on the same branch is how a repair gets lost. **Ryan was notified about this at 21:30 on
      2026-09-17**, as an escalation of the two-session note he was already sent; the schedule is
      the thing to look at.

- [x] Merge PR #1, the `/how-much-memory/` page. **Merged 21:11 on 2026-09-17**, after being open
      since 12:49 on 2026-09-16 and having its merge repaired fourteen times. It went in on the
      same deploy as PR #2, run 100, green at 21:18. The repair history is kept in the run entries
      rather than here; the standing lesson is the one that item already drew, which is that a
      branch touching `scripts/build-pages.ts` or `src/pagekit.ts` stops merging within hours.

- [x] Merge PR #2, the calculator's own head: self-hosted fonts and the home page's `WebSite`
      markup. **Merged 21:11 on 2026-09-17.** Deploy run 100, which carried both this and PR #1,
      finished green at 21:18 and published, so both are live. Nothing is left for Ryan here.

- [x] Merge PR #3, the `/compare/` head-to-head index. **Merged 23:57 on 2026-09-17**, after
      being open since 04:54 that morning and having its merge repaired thirteen times. Deploy
      run 111, on `0030ccd`, finished green at 00:00 and published, so the page is live. Merged
      main was checked here afterwards: 210 tests, typecheck clean, 248 pages built with every
      guard passing, and `/compare/` has grown with the site to 86 machine match-ups and 47 model
      match-ups against the 28 and 47 it was written with.
      **It went in as an ordinary merge commit rather than the squash this item asked for**, so
      the branch's history is now reachable from `main`, and with it the commits that carried
      `public/og/og/`. Measured on a fresh clone: `.git` is 146 MB, 144.4 MB of it blobs. Nothing
      is checked out — main's tree holds one file under `public/og/`, `manifest.json` — and the
      built site, the deploy and CI are all unaffected, since the workflow checks out shallow. So
      this is untidy rather than urgent, and the only fix is rewriting `main`'s history and
      force-pushing it, which breaks every existing clone and is not something an agent should do
      on its own say-so. Left as it is unless Ryan wants it cleaned up. **Do not ping about this.**

- [x] **`main` was red and nothing had deployed since 10:51. Settled: Ryan merged PR #11 at 11:01
      and deploy run 146 went green at 11:06** on `be11535`, so the machine-name floor,
      `/best-gpu/` and the calculator's new footer are all published. Kept below because the
      fault is worth not repeating. The old item:
      **One link fixes it:
      [PR #11](https://github.com/rlindsey2/sunkcost/pull/11), and it wants merging rather than
      reviewing at leisure.** Deploy run 142 failed at the test step on `adf6b52`, so nothing
      merged this morning has published, `/best-gpu/` included.
      **Neither pull request was wrong on its own.** PR #7 merged at 10:50 and added
      `/best-gpu/` to the generated pages' footer. PR #9 merged at 10:51, refactored that footer
      into `FOOTER_LINKS`, gave `index.html` a hand-written footer with the same indexes, and added
      a test holding the two to the same links in the same words and the same order. PR #9's merge
      carried the `/best-gpu/` entry into `FOOTER_LINKS` correctly — six entries — but
      `index.html`'s copy predates that page and still listed five, and
      `tests/pagekit.test.ts:1331` caught exactly that. The test did its job; what failed is that
      **a branch was merged without being rebuilt against the `main` it was merging into**, which
      is the third time that shape of fault has cost this repository something.
      The fix is one `<a>` in `index.html`, in the words `FOOTER_LINKS` already uses. Reproduced
      locally on `adf6b52` first, then 250 tests pass where it was 249 passed and 1 failed, with
      typecheck, `validate` and `vite build` clean. It is a pull request rather than a push only
      because `index.html` is on this agent's never-push list, and that rule is worth keeping even
      here — but it is why `main` stays red until Ryan merges.
      **Ryan was notified at 10:58 on 2026-09-18**, by the session that ran the 10:31 slot rather
      than the one that opened the pull request, because the entry above did not say a ping had
      been sent and a red `main` is the one thing on this list worth one. That session checked the
      fix rather than taking it on trust: PR #11 merges clean into `main` at `ba2e837`, the merged
      tree runs **250 tests green** where `main` itself runs 249 and 1 failed, and typecheck is
      clean. `build:pages` then stops on `/og/best-gpu.png`, which is the stale local `public/og/`
      the item above already explains — `build:og` draws that card from `GPU_CARD` and the deploy
      runs it first, so it cannot reach CI. Nothing else is needed: **merging PR #11 turns the next
      deploy green.**

- [x] [PR #7](https://github.com/rlindsey2/sunkcost/pull/7), the `/best-gpu/` page answering
      "best GPU for local LLMs". **Merged 2026-09-18 at 10:50.** The page itself is sound and was
      verified on merged `main` rather than assumed: 247 tests, typecheck clean, 253 pages, and the
      page read back out of the build at 1,712 words with its lede, title and sitemap entry intact.
      **It is not live yet**, because its own deploy run 141 was cancelled by the next push a minute
      later and run 142 then failed — see the item above. Nothing about the page needs changing.
      One thing seen while checking that is worth not chasing again: `checkOgCards` failed locally
      naming four cards `build:og` had not drawn, and all four are memory-tier comparisons added by
      other runs since this session last drew cards. A fresh `build:og` clears it; the deploy draws
      them every time, so it never reaches CI.

      **What its merge did to the other two.** Both remaining pull requests stopped merging the
      moment it went in, and in exactly the files the PR #8 item below predicted:
      `scripts/build-og.ts`, `scripts/build-pages.ts`, `src/list-card.ts` and `src/pagekit.ts`.
      Measured with `git merge-tree` against `main`, not guessed: **PR #8
      (`seo/local-vs-api-cost`) conflicts and PR #10 (`seo/hardware-index`) conflicts.** Neither is
      either branch's fault. Three pages that each add a generated page, a share card and a helper
      all edit the same four lists, so every pair collides on the same four files and every
      resolution is the same shape: **a union, keeping both entries**, which is how PR #7's own
      repair was resolved. Expect that rather than a real disagreement, and build and read the
      merge rather than trusting a clean `git merge-tree` — which is the standing lesson here, and
      is precisely what the red `main` above shows the cost of skipping.

- [ ] Merge (or close) **[PR #12](https://github.com/rlindsey2/sunkcost/pull/12)**, three lines of
      `src/styles.css` that fix the calculator's top bar. **It collides with nothing**: PR #8 and
      PR #10 touch nine files between them and neither goes near `src/styles.css`, and no test spans
      that file and anything they do touch, which is the clause PR #9 got wrong. Opened 2026-09-18.
      It is a pull request rather than a push because it is the calculator's own head, which is the
      standing rule here. What it fixes: the page scrolled sideways at every phone width from 320 to
      373px; the "Data checked" stamp sat mid-bar with the right gutter empty at every width from 374
      to 899px; and the theme button drew a sun and a moon at once in the default light state, which
      is what a first visit and a crawler both get. 274 tests, typecheck clean, the full build, and
      0 elements past the window at 26 widths where three were.

- [ ] **Merging PR #10 puts 23 KB of build output into `main`, and PR #8 will not clean it up.**
      Found 2026-09-18. PR #10's branch tracks `public/local-llm-vs-api-cost/index.html`, a generated
      page, and it is **PR #8's page rather than its own**. It arrived in `f87b28e`, a repair merge
      that swept up an untracked file; it was untracked but not ignored because the `.gitignore` line
      for that directory is part of PR #8's diff and lives on PR #8's branch, not on `main`. An ignore
      rule does not untrack a tracked file, so merging PR #8 afterwards leaves it there, and every
      build will then show it modified. **One `git rm --cached public/local-llm-vs-api-cost/index.html`
      on PR #10's branch settles it.** Same shape as the `public/og/og/` find and three orders of
      magnitude smaller. Left rather than pushed because PR #10 is not that run's branch and this file
      records three hours lost to two sessions repairing one branch a minute apart.

- [ ] Merge (or close) [PR #8](https://github.com/rlindsey2/sunkcost/pull/8), a new page at
      `/local-llm-vs-api-cost/` answering "local LLM vs API cost" with the site's own numbers.
      **Repaired again at 14:51 on 2026-09-18 against the marker push and ready to merge**
      (`ecec366`): two union hunks in `scripts/build-pages.ts`, and then the fault git had nothing
      to say about — `checkMarkerWords()` refused two markers on the page itself, which is written
      up in the run entry below. Verified on the merged tree: 267 tests, typecheck clean, 254 pages
      with every guard passing, and the page read rendered at 1,557 words.
      Repaired against green `main` at 11:41 on 2026-09-18, and repaired
      again at 12:50 against the tier-label push (`b7c44e9`, one hunk, two guards on one list):
      16 union hunks in six files, the `/best/` note merged so both pages keep their link, a
      seventh footer entry carried into `index.html`, and one stray file dropped. Verified on the
      merged tree: 258 tests, typecheck clean, 254 pages with every guard passing, the full
      `npm run build`, and `/best/` read rendered with all three links in its closing note.
      **Merging this breaks PR #10 and the other way round** — they conflict in five files,
      `index.html` among them now, and the repair is the same union plus a footer line.
      It is a pull request rather than a push because it is a new page, which is the standing rule here.
      No data figure is touched and neither are `src/calc.ts`, `src/compute.ts` or `src/fit.ts`;
      what it adds is one generated page, its share card, four helpers in `src/pagekit.ts`, a build
      guard and eight tests. Verified before opening on `main` at `94c354a`: 218 tests, typecheck
      clean, 249 pages with every guard passing, and the full `npm run build`.
      **It collides with PR #7 in six files, and the first estimate of that was too rosy.**
      Measured with a real test merge of the two branches, not guessed: `scripts/build-og.ts`,
      `scripts/build-pages.ts`, `src/list-card.ts`, `src/pagekit.ts`, `tests/list-card.test.ts` and
      `tests/pagekit.test.ts`. **Each PR merges clean against `main` on its own**; the conflict is
      only between the two, so it lands on whichever goes second.
      Every hunk but one is a **union**: two pages each appending their own card constant, card
      builder, import, `write()` call, build guard, test block and footer link to the same lists.
      Keep both sides of each.
      **The exception, and the one that can quietly lose something:** the closing `<p class="note">`
      on `/best/`. PR #7 edits its graphics-cards sentence to link `/best-gpu/`; PR #8 rewrites its
      last sentence to link `/local-llm-vs-api-cost/`. They are different edits to the same
      paragraph, so taking either side whole drops the other page's link. Both edits have to be
      kept. After resolving, `npm test` and `npm run build:pages` catch any miss, because
      `checkLinks()` fails on a page nothing links to and both guards recompute their own figures.

- [x] [PR #9](https://github.com/rlindsey2/sunkcost/pull/9), the calculator's own footer.
      **Merged 2026-09-18 at 10:51**, twenty minutes after PR #7 and a minute after it. The footer
      it adds is right and nothing in it needs changing. What needs saying is that **this item's
      own confident claim was wrong, and it is the claim that cost the deploy.**

      It said *it collides with nothing*, and that was measured honestly — `git merge-tree` against
      `main`, against PR #7 and against PR #8, clean on all three, because no other branch touched
      `index.html` or `src/styles.css`. Every word of that was true and it was not the question.
      **A clean git merge is not a working merge.** This branch's whole point was an invariant
      spanning two files — `FOOTER_LINKS` in `src/pagekit.ts` and the hand-written footer in
      `index.html` — and PR #7 added `/best-gpu/` to the first while this one was still writing the
      second from a `main` that had no such page. Git had no conflict to report because the two
      sides edited different files. The test added by this very branch caught it, at the merge,
      on `main`, where the repository runs no check on a pull request. Red main and no deploy since
      10:51; the fix is PR #11 in the item above.

      **The lesson for the next branch that claims this.** `git merge-tree` answers whether two
      diffs overlap textually. It cannot answer whether they still agree, and the branches this
      agent opens are exactly the ones that add a page to a shared list. A branch is only really
      clean when the *merged tree* has been built and tested — `git merge origin/main` into a
      throwaway branch, then `npm test` — and no run has been doing that. Three merges have now
      gone in without it (see the item above, which counts the same fault a third time). It is
      cheap: one merge, one test run, thrown away afterwards.

      Verified before opening on `main` at `3cda750`: 233 tests, typecheck clean, the full
      `npm run build`, and the page rendered and read at 360px and 1280px. All of that was true
      too, and on the wrong tree.

- [ ] Merge (or close) [PR #10](https://github.com/rlindsey2/sunkcost/pull/10), an index of all 56
      machines at `/hardware/`. **Repaired again at 14:52 on 2026-09-18 against the marker push and
      ready to merge** (`3d0b989`): one union hunk in `scripts/build-pages.ts`, the build running
      the new guard and keeping this branch's own count line, and nothing for the marker rule to do
      because the one marker this page adds is the word *discontinued*. Verified on the merged tree:
      264 tests, typecheck clean, 254 pages with every guard passing, the full `npm run build`
      including `build:functions`, and `/hardware/` read rendered at 1,761 words.
      Repaired against green `main` at 11:47 on 2026-09-18, and repaired again at 12:51 against the
      tier-label push (`0d16555`): 10 union hunks in four files, the build's own count line kept from
      this branch because `/hardware/` is a page rather than a machine, and `/hardware/` carried
      into `index.html`'s footer, which no conflict marker asked for. Verified on the merged tree:
      255 tests, typecheck clean, 254 pages with every guard passing, the full `npm run build`,
      and `/hardware/` read rendered at 1,811 words. **Merging this breaks PR #8 and the other way
      round**, as the item above says. It is a pull request rather than a push because it is a new page
      type, which is the standing rule here. No data figure is touched and neither are `src/calc.ts`,
      `src/compute.ts` or `src/fit.ts`. Checked again on 2026-09-18 against `main` at `c17b1ec`:
      **it merges clean**, as do #7, #8 and #9, each tested by merging rather than assumed. This
      repository still runs no CI on a pull request, so all four show no checks and everything on
      them was verified locally. It has been open since 08:02 on 2026-09-18.

- [x] [PR #6](https://github.com/rlindsey2/sunkcost/pull/6), raising the usage slider from 20M to
      100M tokens a day. **Merged 2026-09-18 at 00:38, twenty minutes after it was opened** — the
      fastest a PR has gone in here by a wide margin, and the first that did not need a single merge
      repair. Deploy run 116 carried it. Two lines in `data/defaults.json`, opened at Ryan's explicit
      request, which is what lifted the standing rule against touching that file; **the rule stands
      for everything else**, and no figure about any machine or model was touched. Merged main was
      verified here afterwards rather than assumed, because a PR gets no CI in this repository: 210
      tests, typecheck clean, 248 pages, and both values confirmed in the merged tree.

- [ ] **Two issues from an outside reporter, and both land in files this agent is told never to
      touch** (`data/*.json` figures, `src/calc.ts`, `src/compute.ts`, `src/fit.ts`). Ryan raised
      them himself on 2026-09-18. Checked against the repo rather than taken at face value; what
      follows is what is actually true, so whoever picks them up does not start from the titles.

      **[#5](https://github.com/rlindsey2/sunkcost/issues/5) is fixed in code as of 2026-09-18**,
      by PR #6 above; it has not been replied to on GitHub, which is Ryan's call and is the only
      thing left on it. What follows is why it was right, kept because the reasoning is the part
      worth not losing.

      **The usage slider stopped at 20M tokens a day. The reporter is right, and the site's own
      maths says so.** Their framing is the one
      thing to correct: the site *does* consider prefill. `defaults.json`'s `capacity_note` says
      the daily ceiling counts generation only and that input tokens are "assumed to cost no time,
      because prompt processing runs roughly 20-100x faster than generation", with the caveat that
      the real ceiling is therefore 20-30% lower than shown on a heavy input ratio. So the ceiling
      is already generous about prefill. What is wrong is `usage.max_tokens_per_day: 20000000`,
      which is below what the site itself says these machines can do: on the **RTX PRO 6000 the
      computed ceiling is 107.8M tokens a day, 5.4× the slider's maximum**; on the Mac Studio M5
      Ultra, 256GB it is 44.7M. The reporter's own 60M a day, from vLLM metrics on automated
      package scanning, sits inside both and cannot be entered. **This truncation runs against the
      site's whole thesis**: the harder you work a machine the sooner it pays back, so capping the
      slider hides exactly the workloads where buying wins most clearly, and the pay-back figures
      at the top of every table are the least favourable ones the site could honestly print.
      Not a one-line fix. `bestUsageLevels()` maps `usage.labels` clamped to `max_tokens_per_day`,
      so the five levels on every pay-back table on the site come from it: raising the cap needs a
      sixth label band and changes the top row of 133 head-to-heads, `/best/` and the leaderboard.
      Worth doing, and worth doing deliberately. The DGX Spark is the honest counter-example to
      keep in mind: its ceiling is 15.2M, genuinely below 20M, so its "its ceiling" markers are
      real and must stay.

      **[#4](https://github.com/rlindsey2/sunkcost/issues/4), Qwen3.8 Flash Next on the GB10.**
      The reporter says the PLE table can be offloaded to RAM or SSD, making it effectively a 125B
      model, so it runs on a DGX Spark. That claim needs a source and a decision about whether this
      site models partial offload at all, and it cannot be checked from this environment. But the
      **site is already contradicting itself on that model's own page**, which is checkable and is
      the part to look at first. The page's opening line, from `capability_note` in `models.json`,
      says it is "the strongest open model that fits in 128 GB". The table below it names exactly
      one machine that runs it: the Mac Studio M5 Ultra, 256GB at $10,799. The DGX Spark's own page
      does not mention the model at all. The reason is 0.1 GB: **119.6 GB of weights against the
      Spark's 119.5 GB usable**, before any KV cache. So the hand-written note and the computed fit
      disagree, and one of them has to change whatever is decided about offload. Modelling offload
      would be a larger question — it would apply to every machine and every model, and a model
      running partly off SSD is not running at the speed the site prints.

      Neither issue has been replied to, and the agent has not touched either file. **The reporter
      is a careful one**: both reports are specific, both cite their own measurements, and #5 comes
      with real vLLM figures.

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

**Re-measured 2026-09-18, and the position is worth stating plainly because two runs have now
understated it.** Every direct fetch is refused, not just the interesting ones: `sunkcost.ai`,
`huggingface.co` and `example.com` alike come back **403 from the policy proxy** (`fetch()` reports
the status; `curl` reports 000 because the CONNECT tunnel is refused before any response). It is an
organisation policy denial, not a TLS or certificate problem, and `/root/.ccr/README.md` says such
denials are to be reported rather than retried. So no run should spend time diagnosing it.

Two things that do work and should not be confused with the above. **WebSearch works, fully** — it
does not go through the proxy, and on 2026-09-18 it returned useful sourced material on issue #4
within one call. A run that needs to know something about the outside world should search, not
fetch. And the package registries (`registry.npmjs.org`, `pypi.org`, `files.pythonhosted.org`,
`index.crates.io`, `proxy.golang.org` and the rest) are in `no_proxy`, which is why `npm ci` has
never had trouble.

Ryan asked on 2026-09-18 how to lift this. It is the **environment's network policy**, chosen when
the environment was created and editable in the Claude Code on the web environment settings —
https://code.claude.com/docs/en/claude-code-on-the-web. Nothing in this repository can change it,
and a change takes effect on the next run rather than the one that is going.

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

- [ ] **Standing, daily: the model watch.** `seo/MODEL-WATCH.md` holds the procedure, the last
      date it ran and the ledger of candidates. This never gets ticked; it comes round again
      tomorrow. Set up 2026-09-18 at Ryan's request, with `npm run model-watch`, five guards in
      `tests/model-watch.test.ts` and one candidate already in it.
      **The open question it raises is Ryan's**, and it is on his side of this file: the watch can
      record a model and everything it still needs, but it cannot write `data/*.json`, which is the
      rule that keeps every figure on this site sourced. So a found model waits on him.

- [x] **36 model pages opened with this site's own ratings paperwork, and 31 of them then printed
      the score it said they did not have.** Done 2026-09-18. `capability_note` glues a line about
      the five capability ratings to the description of the model, and the lede printed the field
      whole. Split now: the description opens the page, the ratings line sits under the five blanks
      it explains. The same commit ends the KV cache sentence once instead of twice on 41 pages, and
      a second commit undoes a blank line that had dated 14 unchanged pages in the sitemap. The run
      entry below has the figures and the five breaks that proved the guard.

- [ ] **The 7 thinnest pages on the site are all model pages, and all seven are models almost
      nothing runs.** Measured 2026-09-18 across the 253 generated pages: median 787 words, and
      `/models/hunyuan-hy3-q4/` is 394, `/models/qwen3-235b-a22b-2507-q4/` 417, then minimax-m2.7,
      inkling-small, qwen3.8-flash-next, glm-5.3-flash and deepseek-v4-flash, none over 462. They
      are thin for one reason: no machine here holds them at 32k, so the "Machines that run it"
      table that carries every other model page is missing and what is left is the answer box, the
      score and the specifics. The question to settle before writing anything is what a reader
      searching "Tencent Hy3 hardware requirements" wants that the page does not already say — it
      does say what it needs at 32k, which machine holds it at 16k, and what that costs. The
      candidate answer the data can support without inventing a figure is the memory ladder: how
      far each of the shorter context settings gets it, and on which machines, which is the same
      figure `longestContext()` already computes for every other page. Worth one look before it is
      written; a page that repeats the answer box in longer words is the thin page this item is
      trying to fix.

- [ ] **The prose inside `<main>` has never been swept the way the titles and descriptions have.**
      Three audits have held the metadata to unique, short and answering; nothing has read the
      sentences. One grep for a doubled full stop on 2026-09-18 found 41 pages, and one read of a
      lede found 36 opening with the site's own process. Both are now checked by `checkNotes()`, and
      both were in the same place: a note out of `data/*.json` pasted into a template's sentence.
      The other places that do it are `hw.notes` under "Usable by the GPU" on the machine pages and
      the key-value cache note on `/how-much-memory/`. Neither prints a doubled stop today, which is
      why the check is a sweep rather than a line, but neither has been read out loud either.

- [x] Only 8 of the 56 machines appeared in any head-to-head, and five of the seven graphics cards
      appeared in none. Done 2026-09-17: every card now has a head-to-head with every other card,
      20 new comparisons, 48 machine match-ups in place of 28. The run entry below has the figures
      and what the new pages say.

- [x] The other half of that gap: the 49 machines that are not graphics cards appeared in no
      head-to-head but the one their family's flagship is in. Done 2026-09-17, and the rule chosen was
      the first of the two the item offered: **two memory tiers of one machine**, grouped by chip
      variant. 18 new comparisons, 30 of the 56 machines in a head-to-head where 13 were. The other
      candidate was deliberately left — the flagship grid already puts family against family, so a
      second page on the same two families at another price is a near-duplicate. The run entry below
      has the figures, the three machines the grouping correctly refuses to pair, and the titles.

- [x] What was left of that gap: **20 machines in no head-to-head**, 13 of them previous-generation
      Macs. Done 2026-09-17, and the rule chosen was the one this item leaned towards: **each
      discontinued machine against the one that replaced it**, with the successor read out of
      Apple's own chip names rather than guessed at. 12 new comparisons, and **51 of the 56 machines
      are in a head-to-head where 36 were** — the 12 previous-generation Macs whose successor is
      priced, plus three current Studios that had no pair either. The run entry below has the
      figures, the power-figure find and the guard.

- [x] **5 machines were in no head-to-head, and no rule could reach them without inventing
      something.** Done 2026-09-18, and the item's own reading of the two Ryzen AI Max 385 boxes
      was the half it got wrong: it looked for a rule pairing the 385 with the 395 *across* makers,
      which cannot work, when the pair each maker already sells is inside its own range. The rule
      written is **the cheapest configuration of a box against the cheapest one with the better
      chip in it**, and it reaches four pairs rather than two: the Framework Desktop 385 against
      its 395, the Corsair AI Workstation 300's 385 against its 395, and — the two the item did not
      see — the base Mac Studio M5 Max and M5 Ultra, whose entry configurations carry a cut-down
      GPU that no page on the site mentioned. **53 of the 56 machines are in a head-to-head where
      51 were.** The run entry below has the figures and the five breaks that proved the guard.

- [x] **Every URL in the sitemap carried the same lastmod, and it was the wrong date.** Done
      2026-09-18. All 254 carried `data_last_checked`, the day the prices were verified, which was
      2026-09-03 and is not a page changing — so a comparison written that morning announced itself
      as a fortnight old. Each entry is now dated by the day that page's own words last changed,
      fingerprinted from its title, its description and the body between `<main>` and `</main>`, and
      kept in `seo/page-dates.json`. The run entry below has the design, the four breaks that proved
      the guard, and the one thing to know about it: the first record dates nothing, so the sitemap
      ships with no dates at all and fills in as pages change.

- [ ] **The home page's date is read from `index.html` alone**, so a change made in `src/render.ts`
      or `src/main.ts` — the calculator's own words — does not date `/`. That is deliberate and it
      is the safe direction to be wrong in: it under-states freshness rather than claiming it. It
      would want revisiting only if the home page starts losing crawls, and there is no way to see
      that from here. Written down 2026-09-18 so the next run does not read it as a bug.

- [ ] **3 machines are still in no head-to-head, and all three are waiting on a price rather than
      on a rule.** The Mac Studio M5 Ultra, 512GB and the Framework Desktop 495 have no price at
      all, so there is no pay-back to compare; the Mac Studio M3 Ultra, 512GB has one but its
      successor does not, which is the same problem one step along. Nothing to do here until
      data/*.json carries those prices, and that is Ryan's side rather than the agent's.

- [x] **A stand-in power figure prints bare on every comparison page but the 12 new ones.** Done
      2026-09-17, and the item undersold it: the bare figure was 43 of the 55 head-to-heads that
      print one, and four same-silicon pages had a worse version of the same fault — they asserted
      "Both draw 133 W under load" where the data measured one box and borrowed that very figure
      for the other, so the sentence claimed a measurement nobody took and the equality was
      circular. The figure is marked at the row now, the way a card-only price is, each page says
      in words what a borrowed number does and does not tell you, and `checkStandInPower()` holds
      three claims. The run entry below has the figures and the three breaks that proved the guard.

- [ ] The calculator's assumptions panel still prints the data's own key as English. The generated
      pages stopped on 2026-09-17: `powerSourceLabel()` turns `third_party_measured` into
      "measured by a third party" and `stand_in` into "stand-in", where both used to arrive as
      "third party measured" and "stand in" from a `replace(/_/g, ' ')`. `src/render.ts:542` still
      runs that same replace, so the calculator's own Power under load line reads "140 W, **stand
      in**". `powerSourceLabel()` is exported from `src/pagekit.ts`, which `render.ts` does not
      import and should not — pagekit is the build's module, not the bundle's. So the fix wants a
      shared home for four words, `src/format.ts` being the file both already import. It is the
      calculator, so it is a pull request rather than a push, and it is small enough to ride with
      the next one that touches that file rather than justify a branch of its own.

- [x] The assumptions note on every machine comparison told the reader about graphics cards even
      where neither side was one. Done 2026-09-18, and the item undercounted it: **53 of the 86
      machine head-to-heads**, not roughly 30, and the same sentence was on all 56 machine pages
      under their own comparison table. The fix was the one conditional the item proposed plus two
      the item did not ask for: where one machine is a card the note **names it**, where both are it
      says both rather than sending the reader looking for which one it means. 35 machine pages now
      name their one card row, 19 with more than one keep the general sentence and 2 drop it. The
      run entry below has the figures and the four breaks that proved the guard.

- [x] The RTX PRO 6000's page listed 12 head-to-heads in one line of note text, and the Mac Studio
      M5 Max, 128GB page listed two of its own name back at it. Done 2026-09-18, and the fix was
      the one this item proposed, with a fourth group the item did not ask for: the links are
      grouped by the question each comparison answers, and the pair of generations says which way
      round it is instead of printing a bare name. 51 machine pages, up to four groups, no link
      added or dropped. The run entry below has the figures and the four breaks that proved the
      guard.

- [x] Four of the seven cards are last generation in the data (RTX 4090, 3090, 4080, 3060) and no
      comparison page says so. Done 2026-09-17, as a by-product of the generation head-to-heads,
      and the item's own question answered itself: it belongs in the lede, not beside the name,
      because what is wrong without it is not the label but the recommendation. The lede of every
      comparison with a previous-generation side now closes by saying that every figure for it is
      priced at what it launched at rather than at a price you can pay today — **30 pages**, the
      12 new ones and 18 card head-to-heads. The machine pages already said it, in the Price row
      and under Availability.

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

- [x] A machine page's only prefilled calculator link was the machine on its own. Done 2026-09-17,
      and the item's own condition is what decided the shape: rather than a second call to action
      under the table, the **Longest context figure is the link**. 661 prefilled links across the
      56 machine pages, no new column, no new line, four words added to the note. The run entry
      below has the figures and the check that holds each link to the figure beside it.

- [x] The model pages had the same gap the other way round. Done 2026-09-17, and the fix was the
      second of the two the item proposed, which is the one the machine pages already use: the
      **Longest context figure is the link** and the row's own "Run the numbers" link stays at the
      context the row is priced at. 334 prefilled links across the 54 model pages, 265 of them at a
      longer window than the row quotes, and 50 of the 54 pages gain at least one. The run entry
      below has the figures and the rule `checkModelContexts()` now holds them to.

- [x] The 2 pages left on one inbound link, Llama 3.1 8B Q8 and Qwen3 32B Q8. Settled by PR #1
      merging on 2026-09-17, exactly as this item predicted: `/how-much-memory/` lists every model
      by size with both quantisations, so nothing on the site is on one inbound link any more. The
      build says so itself now — **"every page is linked from at least 2 other pages"**, and the
      check holds that floor, so a page cannot drop back to one without failing the build.
      Re-measured on merged main at 21:30 on 2026-09-17. Nothing further is wanted.
- [x] The foot of every page named three of the site's four top-level pages. Done 2026-09-18, and
      the omission was the one with the most behind it: `/compare/`, the index of all 133
      head-to-heads, sat at 187 inbound pages where the other three had 248. It is 248 now, and the
      footer is one list in `src/pagekit.ts` that `checkFooter()` holds every page to, so a page
      written at the top level of the site cannot be added without it. The calculator's own foot,
      which is the other half and the more valuable one, is PR #9. The run entry below has the
      figures and the four breaks that proved the guard.

- [x] **No page on the site listed all 56 machines, and nothing was served at `/hardware/` or
      `/models/` at all.** Done 2026-09-18 as [PR #10](https://github.com/rlindsey2/sunkcost/pull/10),
      and the item's own reading of the value was right for the wrong reason: the page is worth having
      as a hub, but what it turned up is that **39 of the 56 machines top out at the same model**,
      from a $999 Mac mini to an $18,000 card. All 56 in one table, grouped by family, each row with
      price, usable memory, models held, the strongest of them with that machine's speed on it, and
      pay-back; `/hardware/` is in the footer of all 249 pages and is the new middle step in every
      machine page's breadcrumb. The run entry below has the figures, the two faults reading it
      turned up and the five breaks that proved the guard. The `/models/` half of this item stays
      closed for the reason the item gave: `/leaderboard/` already lists every model, so a second
      index of the same 55 would be a duplicate.

- [ ] Question pages for the searches people actually type. **Still the top item, and three of them
      are now written.** `/how-much-memory/` merged 2026-09-17; **"best GPU for local LLMs" went out
      as [PR #7](https://github.com/rlindsey2/sunkcost/pull/7)** and **"local LLM vs API cost" as
      [PR #8](https://github.com/rlindsey2/sunkcost/pull/8)**, both on 2026-09-18 and each in a
      single run, because the first page had already paid for the page type and the share-card
      builder. The two run entries below have what each answers and the claims in them that did not
      survive being checked.
      **Both remaining candidates were read on 2026-09-18 and both are closed.** The test this item
      set was whether either could answer something the machine's own page does not, and neither
      can. **"RTX 3090 for local LLM worth it"**: the card's own page opens "Yes — 24 of the 39 open
      models on this site fit in its 23 GB", says in the same breath that whether it saves money is
      a different question and the answer is usually no, prices it at 19 years, marks the $1,499 as
      a launch price for a discontinued card and as the card alone, and sets it against all six
      other cards in a table. `/best-gpu/` ranks the seven. A page on the 3090 would restate that in
      other words. **"is a Mac mini good for local LLMs"**: every mini page carries the whole mini
      range under "Other machines to weigh against it" — 11 rows on the M6, 24GB page, each with
      price, memory, models that fit and pay-back — plus the nearest machines in price that are not
      minis. Which mini, and whether a mini at all, are both already answered. Writing either page
      would be the duplicate this item warns against, so neither is written.
      **One search this run turned up as worth a page and did not write:** nothing on the site
      answers "how much does it cost to run a local LLM per month". `/local-llm-vs-api-cost/` prices
      a million tokens and `calc.ts` already computes `cloudCostPerMonth` and `localCostPerMonth`,
      so the figures exist; what is missing is the page that puts a monthly bill against a monthly
      electricity cost at each level of use. Worth doing only after PR #8 merges, since it would sit
      on the same helpers.
- [ ] `/hardware/` answers "which machine" and `/leaderboard/` answers "which model", and neither
      names the other in its own table. Found 2026-09-18 while writing the machine index. The
      leaderboard's last column is the next model down; the machine index's last column is pay-back.
      Each links the other in its lede and both sit in the footer, so this is not an orphan problem —
      it is that a reader on the leaderboard who has picked a model has to go to that model's page to
      find the machines, and a reader on `/hardware/` who has picked a machine has to go to that
      machine's page to find the models. Whether that second click is a fault or a feature is the
      question to settle before writing anything; the pages are indexes and an index that answers
      both questions at once is the table nobody can read. Probably leave, but worth one look.

- [x] The model pages have the mirror of what the machine pages gained on 2026-09-17. Done
      2026-09-17, and the item undersold it twice over: 16 model pages, not ten, and what the
      omission hid is not a missing machine but a wrong price. On 12 of the 16 the cheapest machine
      the page named was **not** the cheapest machine that runs the model — Llama 3.3 70B answered
      "$3,449" and runs on a $1,700 box at 16k. The question the item said to settle first was
      settled the way it leaned: a second table, because price and window both vary down it and
      neither belongs in a table priced at 32k throughout. The run entry below has the figures and
      `checkShorterMachines()`, which holds every row and the answer box's claim to the data.

- [x] `/leaderboard/` had no prefilled calculator link at all, the only page on the site with none.
      Done 2026-09-17, and the item's own worry about the price decided the shape: **the price is
      the link**, in the muted colour it already had, so the machine name stays the row's primary
      link and the two do not read as one. 47 rows, one a row, no new column and no new line. The
      run entry below has the figures and `checkLeaderboardLinks()`, which recomputes every one of
      them from the data at build time.

- [x] `/leaderboard/` was the last page on the site that said no at 32k. Done 2026-09-17, and the
      question the item said to settle first was settled the first way it offered: the window goes
      beside the figure, not into a footnote, because the row is where the reader is. Tencent Hy3's
      cell names the Mac Studio M5 Ultra, 256GB at $10,799 "at 16k", the price opens the calculator
      on that pair at 16k, and a note under the table says the column is measured at the context the
      calculator starts at and which row is not. The run entry below has the figures and the five
      claims `checkLeaderboardLinks()` now holds that row to.

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

- [x] An index at /compare/. **Live since 00:00 on 2026-09-18**, merged as PR #3: every machine
      and model match-up in one list, each row carrying the figures the comparison behind it
      prints, a prefilled calculator link on every model pair that has a machine to run it, and
      `checkCompareIndex()` refusing to ship a comparison the index does not list. Every
      comparison page carries it as the step above them in their breadcrumbs. It has since grown
      with the site from 75 match-ups to 133 without a line changing.
- [x] The home page carries no JSON-LD. Done, live since 2026-09-17: the home page emits the same
      `WebSite` node `pageGraph()` builds, plus a `WebPage` for itself, with a test holding the two
      identical. The /s/ share pages, which take the home page's head, have the graph stripped.
- [ ] A "what people entered" page updated from `npm run submissions` output that Ryan commits
      under seo/exports/ (never from live database access; the agent has none).
- [x] Core Web Vitals on the generated pages. The fonts were the whole of it and they are now
      served from this origin; done 2026-09-16. Image sizing turned out not to apply: the 188
      generated pages carry no `<img>` and no inline `<svg>` between them, so there is no image
      to size. What is left of this item is the calculator's own head, which is the next entry
      below, and a measurement this environment cannot take (see the PageSpeed note above).
- [x] The calculator at index.html loading both fonts from Google. Done, live since 2026-09-17.
      The faces are in src/fonts.css, which styles.css imports and Vite folds into the bundle; a
      test keeps that block identical to the one in public/page.css. The 1,894 /s/ share pages
      inherit the same head, so they stopped asking Google too. Every page on the site now paints
      without waiting on another origin.
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

- [x] What is left of the leaderboard's table on a phone, and the pairing rule it asked for. Done
      2026-09-18 for the rule, and the measurement moved most of the item's own answers. `stack()`
      takes a `pair` now, and the fit is arithmetic rather than a guess: at 320px a row has 271px, a
      12px gap splits the two tracks, and the right-hand track goes to whichever is wider, **the
      figure or the second of the pair** — the part the item missed. So a pair fits when first + 12 +
      max(figure, second) is 271 or less. **Six tables pair, and four candidates that looked like they
      fit do not**, `/best/` among them: its Speed and calculator link are 150 and 126, but its
      pay-back figure claims the right track and the pair comes to 288. `/compare/` was right to be
      ruled out. 24,930px saved over 253 pages, the leaderboard 969px of it and `/how-much-memory/`
      1,109px. The run entry below has the figures and the six breaks that proved the guard.

- [x] The calculator's own page scrolls sideways on a phone. Done 2026-09-18 as
      **[PR #12](https://github.com/rlindsey2/sunkcost/pull/12)**, and the item had the fault right
      and its size wrong in both directions: **53px over at 320px**, a width it never looked at, and
      the wrapping it proposed was not the fix. What it missed entirely is the larger half, which
      overflowed nothing: hiding the tagline below 900px removes the row's only flex-grow item, so
      the stamp and the theme button sat marooned at x=373 at **every width from 374 to 899px**. The
      run entry below has the figures, the line that was measured and thrown away, the doubled theme
      icon that reading the page turned up, and the three breaks that proved each line.
      The original wording follows, kept for its measurements.
      The calculator's own page scrolls sideways on a phone, and **the cause is confirmed**.
      Re-measured in Chromium at 360px on 2026-09-18 while reading PR #9's footer: the document is
      373px wide, and the two elements that reach past the edge are `.topbar-end` and the icon
      button inside it, both ending at 373. Nothing else on the page does — the new footer ends at
      exactly 360. The earlier 398px was measured before the top bar's contents changed; the fault
      is the same one, which is that `.topbar-end` holds the "Data checked" stamp and the theme
      button on one line and does not wrap. At 430px it fits. None of the 249 generated pages does
      this at any width from 320 to 1440px; this is index.html and src/styles.css only, so the fix
      is a pull request rather than a push. It was deliberately left out of PR #9 rather than folded
      in: a footer and a top bar are different faults, and a reviewer reading a PR about one should
      not have to review the other.

- [x] **A machine name is crushed on a phone wherever its pay-back cannot be worked out.** Done
      2026-09-18, and the fix was the first of the two the item offered: a floor on the left track,
      measured rather than argued. The floor is **115px**, the widest one that changes nothing else —
      the narrowest name that fits today is 117.7px, and the diff over every stacked table at six
      widths is exactly the 24 rows and nothing besides. The item's own figure was measured on a
      271px row; on the 288px row this environment renders it is 22.5px, and the fault runs to 390px
      rather than stopping at 320. The run entry below has the figures and the two breaks that
      proved the guard.

- [x] **`/leaderboard/` scrolls sideways by 14px at exactly 641px, and nowhere else.** Done
      2026-09-18, and the item was right that the leaderboard was not the worst of it. The cause was
      one string held to one line: `.c-quant`, the marker beside a figure, was in the band's "keep a
      figure on one line" list, and *card only, at launch* held whole made Price 203px wide on
      `/best-gpu/`, crushed every card name into four lines and pushed **Speed on it** off the right
      edge. A marker is a phrase, so it wraps here now; the leaderboard's own 3px went with the
      score bar taking the 46px it already has on a phone. **0 of the 253 pages scroll a table or
      overflow their window at any of sixteen widths from 320 to 1440px**, where three tables did.
      The scrollbar theory the item leaned on is wrong and worth not repeating: a media query reads
      the viewport, not the window, so a 641px window with a 15px classic scrollbar is a 626px
      viewport and gets the phone layout. The fault was at viewport 641 to 700px, exactly where it
      measured. The run entry below has the figures, the five hyphen breaks the fix turned up and the
      four breaks that proved the guards. The original wording follows, kept for its measurements.
      **It reproduces after all, and there is a worse page than the leaderboard.**
      Measured again on 2026-09-18 while sweeping for the label fix, this time reading each table's
      own `scrollWidth` against its `clientWidth` rather than asking whether the page scrolls: at
      641px **`/best-gpu/`'s table wants 657px in the 597px it is given** — 60px, ten times the
      leaderboard's — and `/leaderboard/`'s wants 600px in 597px. `/best-gpu/` is still 1px over at
      700px and clean at 900px; the leaderboard is clean at 700px and above. Nothing else on the
      site scrolls at any of the twelve widths swept, and no page's document overflows its window at
      any of them, which is why the earlier sweep found nothing: the table scrolls inside a page
      that does not. The card ranking has seven columns of its own and post-dates every note below.
      The earlier reading, kept because its arithmetic is still the likeliest explanation of the
      original 14px: at every integer width from 615 to 700px the leaderboard's table
      is 597px inside a 641px window and nothing scrolls, and the 252-page sweep at 641px found no
      page wider than its window and no table scrolling. The arithmetic in the original measurement
      says why: 596px wanted in 582px is a 641px window **minus a 15px classic scrollbar**, which
      is what a desktop browser on Windows or Linux shows and what a headless context does not. So
      the fault is probably real on those browsers and invisible here, and the next look at it
      should force a scrollbar rather than trust a clean sweep. Found alongside the pairing rule,
      and it predates it as well — the table wants 596px in the 582px it
      is given, and it is clean at 640px, where the phone layout takes over, and at 660px and above.
      641px is the first width above the stacking breakpoint, where the table becomes a table again
      with seven columns and only the between-bands rules to wrap them. The log has claimed since
      2026-09-17 that no table scrolls at any width from 320 to 1440px, and that claim was true when
      it was written; the leaderboard has gained a column of text since, on the hosted rows. Worth
      one look at the 641-to-1023px band, and worth re-measuring the other 306 stacked tables at
      641px at the same time, since only sixteen pages were swept at that width.

- [x] **A label on the name reads under the figure's column on 29 comparison pages.** Done
      2026-09-18, and the fix was the one this item proposed plus one it did not see. Both of the
      item's own figures had moved: **97 labels on 42 pages at 320px**, not 84 on 29, 84 of them
      crossing into the figure's track, worst overhang 51px rather than 36. And it is **not clean at
      360px**, as the item said: 26 more labels on 20 pages overhang there, though none of those
      reach the figure. The wrap alone would have got the other half wrong — a one-word tier label
      breaks at its own hyphen, and `tierLabel()` has existed for that since 2026-09-17, so the one
      table still printing the bare name now uses it. 0 labels reach the figure's track at any width
      now, and nothing on the site moves above 360px. The run entry below has the figures and the
      two breaks that proved the guard.

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

- [x] The machine head-to-heads that answer the memory difference with the models one holds and
      the other does not, and stop there. Done 2026-09-18, and the item undercounted them the way
      the card-caveat item did: **53 pages, not 21**, because the site has grown from 28 machine
      match-ups to 86 since the item was written. The condition it set was met rather than waived.
      It asked for something that replaces rather than sits beside, so the answer is **one
      paragraph under the heading that already promised it**, not the second table the item feared:
      no new heading, no new table, about 85 words. Every one of the 53 has something to say, 2 to
      12 shared models reaching different lengths, median 7. The run entry below has the figures and
      the five breaks that proved the guard.

- [ ] The call to action under a model page's machines table is now a duplicate. It reads "Run
      Llama 3.1 8B at 128k on the Strix Halo Framework Desktop, 32GB" and opens exactly what the
      Longest context cell in that machine's own row now opens, so the page offers the same
      configuration twice. It is not wrong and it is not clutter — it names the machine and the
      length in words, which a bare figure in a table does not, and it is the one prominent way in
      to a long window. Worth a look only if a page reads as repeating itself, and the question to
      answer first is whether the sentence earns its place now that all 334 figures are links.

- [ ] **The calculator's page stops fitting below 307px, and the top bar is no longer what stops it.**
      Measured 2026-09-18 after PR #12: the bar itself fits down to 303px, and the binding element is
      `.chip.chip-standin`, 278px wide and 1px over its window at 306px. Every width this site tests
      starts at 320, so nothing is wrong today. It is written down so the next run that sweeps the
      home page knows what the floor is and does not read it as a new fault.

- [ ] **`src/styles.css:98` declares `--ok-text`, `--warn-text` and `--bad-text` twice in a row**, with
      identical values and the wrong indentation on the first of the pair, inside the
      `prefers-color-scheme: dark` block. It changes nothing — the second wins and says the same thing —
      so it is untidy rather than broken. Found 2026-09-18 while reading the file for PR #12 and
      deliberately left out of it: a reviewer reading a pull request about the top bar should not have
      to review a palette edit. One line to delete, and it should ride with the next pull request that
      touches that file.

- [ ] The 7 head-to-head titles still over 60 characters are all pairs of long machine or model
      names (worst: MacBook Air M5 (15-inch), 16GB vs MacBook Pro M5 Pro (16-inch), 64GB, at 68).
      Shortening them further means dropping a memory size or a screen size, which are the things
      that tell two Macs apart. Probably leave, but worth a second look with query data.

## Runs

### 2026-09-18 — 36 model pages stop opening with this site's own paperwork

**Why this item.** `npm run model-watch` says *done for today*, so the backlog was the job, and its
top items are where the last three runs left them: the monthly-cost page waits on PR #8, and what is
under it is marked *probably leave* or waiting on a price only Ryan can supply. So this run did what
the sitemap run did and read what the build actually ships — 253 pages, every title unique, every
description unique and inside 155 characters, no missing canonical, no page with two `<h1>`. The
metadata is in good order. The prose was not.

**36 of the 55 model pages opened by telling the reader the model was unrated, and 31 of them then
printed its score.** `capability_note` in `data/models.json` carries two different sentences glued
together: one about this site's own five capability ratings — *"Not yet rated: released after our
last ratings pass."* — and then the description, which is the part about the model. The lede printed
the field whole. So the first paragraph of `/models/qwen3.8-27b-q4/`, the best model on this site
that a graphics card runs, said it was not yet rated, and two sections down the same page said it
scores **34** on the Artificial Analysis index and sits in the Sonnet-class band. That is the site's
own process in the paragraph a search result shows, and on 31 pages it contradicted the page.

**`splitCapabilityNote()` splits the field where it changes subject**, and each half goes where it
answers something. The description opens the page. The ratings line goes under the five ratings
themselves, which is the one place on the page a reader is looking at five blanks and wondering why.
Three ledes lose their second sentence — Gemma 4 31B it, Qwen3.6 35B-A3B and Qwen3.8 27B, whose
notes say nothing but the ratings line and *"Sizes and prices are current."*, which is the same
thought and travels with it. Those three ledes are one true sentence now instead of two, and nothing
was written to fill the gap: every figure on these pages still comes out of `data/*.json`.

**The other half of the same fault was punctuation nobody could see in the source.** The architecture
notes all end in a full stop, and the KV cache line added its own, so **41 model pages printed "on
all 80 layers.."** in The specifics. `endStop()` ends the sentence once. It is checked across every
page rather than at that line, because any note pasted in front of a template's punctuation can do
it, and 41 pages is how long this one lasted.

**Then the fix dated 14 pages that had not changed, and that needed a second commit.** The new
conditional sat on a line of its own, so a model page without a ratings line printed an empty line in
its place. The sitemap fingerprints the body as it is written, whitespace included, so 14 pages whose
words are identical hashed differently and went out stamped *changed today* — which is the fault the
fingerprint was built to prevent, at 14 URLs instead of 254. The conditional carries its own newline
now, those 14 pages are byte-for-byte what they were this morning, and their records were restored to
what was recorded before: no date rather than a wrong one. A rebuild writes the file back unchanged,
which is how the repair was checked. **41 pages are dated today and every one of them says something
different than it did this morning.**

**Five breaks, each bringing back its own fault and no other.** Lede printing the whole note: the
ratings line is back in the opening paragraph, and on the page twice. Ratings line dropped from under
the caps: 36 pages print it nowhere. KV line punctuating itself again: the doubled stop returns on 41
pages, found by the sweep rather than by the line. Lede dropping the description: 55 pages lose what
their note says about the model. `RATING_SENTENCES` no longer matching the data's wording: the build
stops on the first model whose blank ratings have no line the split recognises, which is the guard
that matters, because that is how a future note would slide back into a lede unseen.

**Verified.** 282 tests (8 new), `tsc --noEmit` clean, and the full `npm run build` end to end
including `build:functions`. Pages read rendered in Chromium at 900px and 390px before committing —
0 elements past the window at either — and read as text on a page with a description, a page without
one, a page with no index score at all, and a rated model that should not have changed and did not.
**Deploy runs 164 and 165 both finished green**, at 17:55 and 18:02, and both are live.

**The calculator prints the same field and is right to.** `src/render.ts:331` puts `capability_note`
whole inside `.m-caps`, directly beside the capability dots — which is where this run just moved it
to on the generated pages. Nothing to fix there. Worth writing down so the next run does not read
the grep hit as the same bug.

**Two branch repairs, because this push moved files both open PRs are built on.** Checked with
`git merge-tree`, which is this file's standing lesson: **PR #10** conflicted in
`scripts/build-pages.ts` (one import list, both names go in) and **PR #8** in `seo/page-dates.json`
(main's record for every shared page, PR #8's own record kept for its own page). Both merged, tested,
built and pushed; all three branches merge clean against main now. PR #10's merge also does the
`git rm --cached` the last run diagnosed and left: `public/local-llm-vs-api-cost/index.html` was
tracked there, is PR #8's page, and main has no builder for it — merging PR #10 as it stood would
have deployed a two-day-old copy of another branch's page that nothing links to and the sitemap does
not list. One comment on PR #10 says so; nothing else was pushed to either branch.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is still the biggest item and still waits on PR #8. The small pull request left is the assumptions
panel printing *stand in* at `src/render.ts:542`, which wants a shared home for four words in
`src/format.ts` and collides with nothing. And the thing this run would tell the next one: **the
metadata on this site has been audited three times and the prose inside `<main>` had not been swept
once.** A search for a doubled full stop found 41 pages in a second. It is worth reading the rendered
words, not just the tags.

### 2026-09-18 — the top bar fits a phone, and the theme button stops drawing two icons

**Why this item.** `npm run model-watch` says *done for today*, so the backlog was the job. Its
biggest item, the monthly-cost question page, still waits on PR #8, and neither PR #8 nor PR #10 has
moved since yesterday. A third branch into `scripts/build-pages.ts` and `src/pagekit.ts` would add a
conflict rather than a page. So the run took what the last entry named instead: the calculator's own
top bar overflowing a 360px screen, which is `src/styles.css` only and collides with neither branch.
It went out as **[PR #12](https://github.com/rlindsey2/sunkcost/pull/12)**, three lines.

**The item had the fault right and its size wrong, in both directions.** It recorded 360px, where the
document is 373px wide. Measured across 26 widths before anything was touched: the page is **53px
over at 320px**, 33px at 340px and 13px at 360px. The item never looked at 320, which is the
narrowest width every other sweep in this file uses.

**And the bigger half was not in the item at all.** `.topbar-line`, the tagline, is the row's only
`flex: 1 1 auto` item, and the layout hides it below 900px. Hiding it removed the thing that pushed
the right-hand group to the edge, so **at every width from 374px to 899px the "Data checked" stamp
and the theme button ended at x=373 and stayed there**, marooned mid-bar with the right gutter empty.
That is most phones in landscape and every tablet in portrait, and no sweep had caught it because
nothing was overflowing: the group sits inside the window, just in the wrong place. An auto left
margin puts it back, and resolves to nothing at 900px and above, where the tagline already absorbs
the free space. Above 899px the bar is pixel-for-pixel what it was.

**What pays for the overflow is the domain, and the arithmetic says why.** Brand 160.3px plus an
18px gap plus the 181px stamp group plus two 14px gutters wants 387.3px. `sunkcost.ai` beside the
wordmark is 70px of that, counting its gap, and it is the part that says least: the reader is on
sunkcost.ai and the wordmark beside it already says so. It goes below 420px. The boundary is on a
knife edge in neither direction. The domain needs a 388px viewport, so it has 33px spare on the wide
side, and dropping it leaves the bar fitting down to 303px.

**One line was written, measured and thrown away**, which is worth recording because the arithmetic
looked convincing. Narrowing the bar's gap from 18px to 12px at phone widths reads like 6px of
headroom. It buys nothing: the page's floor is **307px either way**, because an overflowing flex row
drops its right padding, so the bar stops being the binding element well before the page does. What
sets 307 is `.chip-standin`, 1px over at 306px, and that is below every width the site tests. The fix
is two lines rather than three because the third was measured instead of argued.

**Then the rendered page turned up a fault nobody was looking for.** Reading the bar as a picture
before committing, the theme button was drawing **a sun and a moon at once**, stacked and clipped
inside a 30px box. `.icon-btn svg { display: block }` is a class plus an element; the bare
`.i-moon { display: none }` under it is a class. The button rule wins on specificity, not on order.
The dark and explicitly-chosen states were safe only because their selectors carry three points, so
this broke in **exactly one of the six states, and it is the default one**: a light system with no
theme chosen yet, which is what a first visit and a crawler both get. Matching the button in the
moon's own rule settles it, and leaves the four rules under it ordered as they were. It had been live
for as long as `.icon-btn svg` has existed, and eight sweeps of this page at sixteen widths never saw
it, because every one of them measured geometry and none of them looked.

**Three breaks, one per line, each bringing back its own fault and no other.** No auto margin: the
stamp returns to x=373 at 430, 640 and 899px, with no overflow anywhere. Domain kept: 320, 340 and
360px go back to 53, 33 and 13px over, with the right edge still correct. Moon rule at its old
specificity: one of the six theme states shows two icons again, and it is the default one.

**Verified.** 26 widths from 320 to 1440px in Chromium, reading every element's right edge against
the document's client width: **0 elements past the window at any of them**, where three were. The
420px boundary swept at 418, 419, 420, 421, 422 and 424px, the domain dropping at 420 and returning
at 421 with no overflow either side. All six theme states show exactly one icon. 274 tests, `tsc
--noEmit` clean, and the full `npm run build` end to end including `build:functions`. `src/styles.css`
is the only changed file, and `seo/page-dates.json` is untouched, correctly: no generated page's words
moved. The bar was read rendered at 320, 360, 430, 640 and 900px before committing.

**The collision check was done by file list rather than by `git merge-tree`**, which is this file's
standing lesson. This branch touches `src/styles.css`; PR #8 and PR #10 touch nine files between them
and neither goes near it, and no test spans `src/styles.css` and anything they do touch. That last
clause is the one PR #9 got wrong, so it is the one worth stating.

**And the check turned up something on PR #10 that is not this run's to fix.** Its branch tracks
`public/local-llm-vs-api-cost/index.html`, 23 KB of generated build output, and it is **PR #8's
page**. It arrived in `f87b28e`, a repair merge that swept up an untracked file. It was untracked but
not ignored because the `.gitignore` line for that directory is part of PR #8's diff and so lives on
PR #8's branch, not on `main`. So merging PR #10 commits a stale copy of another branch's page into
`main`, and merging PR #8 afterwards will not untrack it: an ignore rule does not remove a tracked
file. One `git rm --cached` on PR #10's branch settles it. It is the same shape as the `public/og/og/`
find and three orders of magnitude smaller, and it was left rather than pushed because PR #10 is not
this run's branch and this file records three separate hours lost to two sessions repairing the same
branch a minute apart.

**Where it is.** `20b1ab1` on `seo/topbar-narrow`, open as PR #12. Nothing was pushed to `main` but
this entry, and nothing a visitor reads changes until PR #12 merges. **Deploy run 162, on `9c93d38`,
finished green at 17:11** and published.

**One thing about reading that deploy is worth the next run's time.** This run watched run 162 for
twenty minutes and twice wrote it down as stalled, because the workflow-runs endpoint kept answering
`in_progress` with `updated_at` frozen at 17:05:56. It was not stalled. The job-level endpoint, asked
at the same moment, had it finishing the build at 17:11:18 and publishing at 17:11:37, which is 5m45s
end to end and within seconds of run 161's. **The runs list is cached and the job list is not**, so a
deploy that looks stuck there is worth one look at its jobs before it is called stuck. Ryan was told
it had stalled and then told it had not, which is one notification more than this was worth.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is still the biggest item and still waits on PR #8. The small pull request left is the assumptions
panel printing *stand in* at `src/render.ts:542`; it wants a shared home for four words in
`src/format.ts`, and `index.html` is not involved, so it collides with nothing now. Worth knowing for
whoever writes the next CSS fix: **eight geometry sweeps of the home page missed a doubled icon that
was always there.** Measuring a layout is not the same as looking at it, and this run only caught it
because the rules here say to open the page before committing.

### 2026-09-18 — the sitemap stops telling crawlers the same wrong date 254 times

**Why this item.** `npm run model-watch` said *done for today*, so the backlog was the job. Its top
item — the monthly-cost question page — still waits on PR #8, because a third branch into the same
four files adds a conflict rather than a page, and what is left below it is three items this file
already marks *probably leave*. So the run went looking at what the build actually ships, and the
sitemap was the first thing read.

**Every one of the 254 URLs carried `<lastmod>2026-09-03</lastmod>`.** That is
`data.defaults.data_last_checked`, the day the prices and scores were last verified. It is a real
date about the data and it says nothing about a page: `/best-gpu/` was written on the 18th and
announced itself as a fortnight old, and so did every comparison added since the 16th. A crawler
uses lastmod to decide what to fetch again and how soon, and one date across a whole site is either
ignored or believed, and believed is worse — it puts the newest pages at the wrong end of the queue.

**What it says now.** The build fingerprints what a searcher actually reads on each page: the title,
the description and the body between `<main>` and `</main>`. The header and the footer are left out
on purpose, because a site-wide link changing is not 253 pages changing — this site has added a
footer entry three times this week and each one would otherwise have claimed the whole site was new.
The answers live in `seo/page-dates.json`, committed with the change they record. A page that still
hashes to what is recorded keeps its date; one that differs, or one the file has not seen, changed,
and the date is the day the build found it.

**The rule that makes it safe is that the sitemap publishes a date only while the recorded
fingerprint still matches the page.** The obvious design — date whatever changed in this build — has
a failure nobody would notice: a record that was not committed alongside its change makes every
later build see a mismatch and stamp *today* on the same page every day, for ever. Under the rule
here that costs a few lastmods on one deploy instead, and the next build puts them back. That is the
whole of the trade: a date is published only once it has been written down and the page still agrees
with it.

**The first record dates nothing, and that is the one thing worth knowing about this.** With nothing
to compare against there is no honest per-page date to seed — a build is not evidence that 254 pages
changed this morning, and the site's own rule is that a figure without a source does not get printed.
A date is a figure. So the sitemap went out with **0 of 254** entries dated, where before it had 254
wrong ones, and each page takes its real date the first time its content moves. On a site that
changed nearly every page twice in the last two days that is days, not weeks, and a page added
tomorrow is dated correctly from the start — which is the case that was costing something.

**Four breaks proved `checkPageDates()`**, each run against the real build. A date in the future:
refused. A date recorded for content the page no longer has, forced past `publishedDate()`: refused,
naming the URL. A record reading *last Tuesday*: refused — it was already being dropped silently, and
something dropped silently is something nobody fixes. Two `<lastmod>` elements on one URL: refused,
all 254 of them. The mechanism itself was proved the same way rather than argued: one page's record
was made to disagree with the page, and the next two builds dated **that page and no other**.

**Verified.** 274 tests where `main` ran 259, the 15 new ones in `tests/page-dates.test.ts`; both of
the design's two load-bearing rules were mutated in `src/page-dates.ts` and each took a test down
with it. Typecheck clean. The full `npm run build`, `build:functions` included. 253 pages, every
guard passing, and `dist/sitemap.xml` parsed as XML at 254 entries. The live file could not be read
back — the egress policy still refuses `sunkcost.ai` — so the confirmation is deploy run 160, green
at 15:58 on `874b9c5`.

**Both open branches were repaired against it, because this push edits the file both live in.**
PR #10 conflicted in one hunk, the guard call list, and the union keeps the branch's own count line —
`/hardware/` is a page rather than a machine, so the 56 it counts must exclude it. PR #8 merged
clean, and was built anyway, which is this file's standing lesson and paid again: `build:og` had not
drawn that branch's own card in this container, the same environment fault as yesterday, and the
deploy draws it every time so it cannot reach CI. Each merged tree was then built rather than
trusted — PR #10: 279 tests, typecheck clean, 254 pages; PR #8: 282 tests, typecheck clean, 254
pages. Both now merge clean into `main`.

**And the merged trees showed the thing working on real changes.** PR #10 dates two pages: its new
`/hardware/`, and `/` — the home page's own HTML gained a footer link. PR #8 dates 58: the new page,
`/best/`, `/` and **all 55 model pages**, each of which gained a sentence in its body pointing at
what a million tokens costs. Both counts were read out of the ledger and the model-page one was
checked by finding the link inside `<main>` rather than taking the number on trust. One wrinkle
worth naming: a branch's dates are the day the build found the change, so a page that sits unmerged
for three days goes live carrying the earlier date. That under-states freshness, which is the safe
direction, and the alternative is dating a page for a day nothing happened on it.

**Where it is.** `874b9c5` on `main`, deploy run 160 green at 15:58 and published. `ab8dbc4` on
`seo/hardware-index` and `59ff00c` on `seo/local-vs-api-cost`. Nothing a visitor reads changed:
`sitemap.xml` and `robots.txt` are not pages, and no page's words were touched.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is still the biggest item and still waits on PR #8. Of the small pull requests left, the calculator's
top bar overflowing a 360px screen is CSS only and collides with neither branch; the assumptions
panel printing *stand in* at `src/render.ts:542` is the other. And from the next run on there is a
new habit to keep rather than a task: **`npm run build:pages` rewrites `seo/page-dates.json`, and it
belongs in the same commit as the change it records.** Leaving it out costs that deploy's lastmods
and nothing worse, and the build says so in its own line — look for how many of the sitemap entries
carry a date.


### 2026-09-18 — a clean merge that was not a working one, twice over

**Why this item.** The last entry left the backlog's biggest item, the monthly-cost question page,
waiting on PR #8's merge, and the two pull requests as Ryan's. Neither had moved since 12:50. What
had moved is `main`: the 14:05 marker push edits `scripts/build-pages.ts` and `src/pagekit.ts`, which
is exactly where both branches live, so **both had stopped merging again** — measured with a test
merge rather than assumed. A finished page that cannot be merged is worth nothing, so the job was to
make both mergeable and to build each merged tree, which is the rule this file has been asking for
since PR #9's red `main`.

**The conflicts themselves were the union they always are.** PR #8: two hunks, the import list
gaining `holdHyphens()` beside the branch's own helpers, and the build running both
`checkTokenCost()` and `checkMarkerWords()`. PR #10: one hunk, the same new guard, keeping this
branch's own count line — `/hardware/` is a page rather than a machine, so the 56 it counts must
exclude it. Ten minutes of work between them.

**And then the merged tree said something git had not.** `checkMarkerWords()`, which `main` gained at
14:05, reads every marker beside a figure out of the built HTML and refuses a hyphenated word printed
bare, because a narrow column breaks it at its own hyphen and *stand-in* split over two lines reads as
a fault in the data. `/local-llm-vs-api-cost/` was written before that rule existed and prints three
markers with `esc()`: **two of them broke it**, *stand-in* beside the wattage its electricity rests
on and *coding-assistant* beside a level of use. Git reported no conflict, and could not: the guard
arrived in one file and the markers were already in another. All three now use `holdHyphens()`, the
way every other table on the site does, and the page's own guard expects the held form rather than the
bare one.

**The third marker is the one worth writing down.** It prints the quantisation, and it passed — not
because it is safe but because nothing hyphenated fits in 64GB today. `UD-Q4_K_M` is 155 GB, so the
page's Mac Studio M5 Max never lists it. The next model that arrives at a hyphenated quantisation
small enough to fit would have failed the build on `main`, after the merge, which is the worst place
to find out. It is held now too.

**This is the first time the merged-tree rule has caught anything**, and it caught the same shape of
fault PR #9's merge shipped: two diffs that do not overlap textually and no longer agree. `git
merge-tree` says CLEAN for both branches now, and that is still not the claim being made here — each
was merged, built and tested.

**Verified, per branch.** PR #8: 267 tests, typecheck clean, 254 pages with every guard passing,
504 markers held where `main` reports 502, and the page read rendered at 1,557 words. PR #10: 264
tests, typecheck clean, 254 pages with every guard passing, the full `npm run build` including
`build:functions`, and `/hardware/` read rendered at 1,761 words. One thing needed drawing rather
than assuming: `checkOgCards()` failed on PR #10 naming `/og/hardware.png`, which is this branch's own
card and had never been drawn in this container. Drawn from `hardwareIndexCard()` and the build then
passed. The deploy runs `build:og` before `build:pages` every time, so it cannot reach CI.

**Where it is.** `ecec366` on `seo/local-vs-api-cost` (PR #8) and `3d0b989` on `seo/hardware-index`
(PR #10). **Deploy run 158, on `5fbb320`, finished green at 14:55** and published; it carries this
entry and nothing else, since the run's work went to the two branches. Nothing was pushed to `main`
but this entry, and nothing a visitor reads changed on the
live site. **Merging either still breaks the other**, as both items above say; the repair is the same
union.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is still the biggest item and still sits on PR #8's helpers, so it still waits on that merge; opening
a third branch into the same four files would add a conflict rather than a page. Of the two small
pull requests left, the calculator's top bar overflowing a 360px screen is **CSS only**, `src/styles.css`
and nothing else, so it is the one that does not collide with either open branch; the assumptions
panel printing *stand in* at `src/render.ts:542` is the other, and `index.html` is where both open
branches also edit, so check before touching it.

### 2026-09-18 — the card ranking stops hiding the figure it is for

**Why this item.** The last entry named the 641px band as what to continue, with a page worth more
than the leaderboard in it: `/best-gpu/`, 60px over at the first width above the phone layout. The
model watch says *done for today*, so the backlog was the job.

**The cause was one string, and it was not the one the item expected.** Measured before touching
anything, by reading each column's width rather than the table's: at 641px the card ranking's Price
column is **203px** against 72px for Card and 78px for Speed on it. Nothing about the price wants
that width — *card only, at launch* does, held to one line by the band's rule that a figure keeps
its line. So the widest caveat on the page claimed a fifth of the table, the card names were crushed
into four lines each (*RTX PRO / 6000 / Blackwell, / 96GB*), and **Speed on it**, the figure a page
about graphics cards is for, sat off the right edge.

`.c-quant` is that marker, and it is a phrase far more often than a figure: *card only, at launch*,
*priced as GLM-4.7-Flash*, *a moderate coding-assistant day*, *hosted*, *its ceiling*. The phone
layout worked that out on 2026-09-17 and lets it wrap; the band between a phone and a full page
still held it. It wraps in the band now, and the card ranking's table went from 657px in 597 to
**597 in 597**.

**The leaderboard's own 3px, which the same item raised.** Seven columns wanted 600px in the 597px
the page gives them, so *Next down* lost its last three pixels. The score bar is the only thing in
that row carrying no number, and it takes the 46px it already has on a phone: 597 in 597, header
intact, read rendered rather than inferred.

**What the fix turned up, and it predates the fix.** A marker that wraps can break a name at its own
hyphen, which is the fault `tierLabel()` has existed for since 2026-09-17 — *Haiku-class* split
across two lines reads as a mistake in the data. Sweeping every `.c-quant` on all 253 pages for a
line break at a hyphen found **five already doing it on a phone**, before any change here:
*UD-Q4_K_M*, *priced as GLM-4.7-Flash*, *priced as DeepSeek-R1-Distill-Llama-70B*, *GLM-5.3-Flash*
and *a moderate coding-assistant day*. `holdHyphens()` generalises the tier-label rule to every
marker: the phrase wraps between its words, the hyphenated word inside it holds its line. At 641px
and above **no marker on the site breaks a name at a hyphen**, where four comparison pages would
have started to.

**The exception, because holding a name whole can be worse than breaking it.** Held everywhere, the
29 characters of *DeepSeek-R1-Distill-Llama-70B* pushed a head-to-head's table **102px past a 360px
phone screen, and the page with it** — a page that scrolls sideways is a worse fault than a name
broken in the wrong place. A head-to-head splits a phone screen three ways and a cell there is 95px,
81px of it inside the padding, which *GLM-5.3-Flash* alone exceeds at 91px. So the hold gives way in
that one layout, which already breaks a long word anywhere rather than overflow, and holds everywhere
else.

**Measured, not assumed.** Every table on all 253 pages at sixteen widths from 320 to 1440px:
**0 tables scroll and 0 pages overflow their window**, where `/best-gpu/` did at 641, 660, 680 and
700px and `/leaderboard/` at 641px. Diffing the geometry of every row and table against the site as
it was: 134 pages move at 641px (**154 rows taller, 250 shorter**), 60 at 700px, 33 at 768px, 5 at
900px, and **nothing at all at 320, 360, 390, 1023 or 1280px**.

**The guards, and the four breaks that proved them.** `checkMarkerWords()` reads every marker out of
the built HTML and refuses a hyphenated word printed bare: dropping the hold from one call site fails
with *prints UD-Q4_K_M beside a figure where a narrow column can break it at its own hyphen*. The
build prints what it found — *502 markers beside a figure keep a hyphenated word whole wherever the
layout allows it*. The three CSS halves cannot be seen from the HTML, so a test holds each, and each
was proved by putting the old rule back: the band's marker rule, the 46px bar and the head-to-head
exception all fail their own test when removed.

**Verified.** 259 tests (254 on this change, then 259 after rebasing onto a sibling's push),
typecheck clean, 253 pages with every guard passing, the full `npm run build` including
`build:functions`, and `/best-gpu/` and `/leaderboard/` read rendered at 641px before and after.

**Where it is.** `9a38194`, pushed to `main` at 14:05: `public/page.css`, `src/pagekit.ts`,
`scripts/build-pages.ts` and the tests. Nothing a visitor reads changed in words.

**A sibling session pushed while this run was working**, which is the duplicate-schedule item near
the top of this file. `711cb4d`, at 13:52, is the daily model watch Ryan asked for, from
`session_01Lptt4wXYyb2KtWrpnFpsH1`. It does not overlap this run's files. This push was rejected,
fetched and rebased rather than forced, and the merged tree was tested rather than assumed: 259 tests
green, 253 pages built.

**It is deployed.** Three pushes went to `main` in three minutes, so runs 154 and 155 were each
cancelled by the one after them and only the last counts: **deploy run 156 on `b40eef8` finished
green at 14:11** and published. That head carries the CSS, the helper, both guards, the tests and
this entry. Whether the live site serves it cannot be read from here, since `sunkcost.ai` is off this
environment's allow-list, which is the first item under Ryan's side above.

**What to continue.** The monthly-cost question page — *how much does it cost to run a local LLM per
month* — is the biggest item on the backlog and still sits on PR #8's helpers, so it waits on that
merge. PR #8 and PR #10 are both repaired and ready and are Ryan's. If neither has moved, the
assumptions-panel wording (`src/render.ts:542` prints *stand in* where a generated page says
*stand-in*) is the small pull request that has been waiting for a reason to touch that file.

### 2026-09-18 — the site starts watching for models instead of waiting to be told

**Why this item.** Ryan asked for it directly: check every day for new models, of the kind
announced on X the night before. Nothing in this repository did that, and a site whose subject is
which machine runs which model is worth less every week it lists last month's.

**What it is.** Three pieces, because an hourly agent with no memory needs the job written down
rather than remembered.

- **`npm run model-watch`** prints today's date against the date the watch last ran, all 55 models
  grouped by family with size, quantisation and generation, the quantisations already entered, and
  the fields a `models.json` entry carries — read off an entry rather than hard-coded, so it cannot
  drift from the schema. It prints; it never writes.
- **`seo/MODEL-WATCH.md`** is the ledger: the procedure, the search terms, the three questions that
  decide whether a release matters here, what a new model needs before it can be a row, and a
  candidate list. It also carries the date the check last ran, which is the thing the script reads.
- **The wiring**, which is the part that makes it happen: the head of this file now says to run the
  watch before the backlog when the date is not today, and the backlog carries it as a standing item
  that never gets ticked.

**The rule it is built around.** The watch records; it does not edit `data/*.json`. Every figure on
this site has a source, and a model entered from a press release's rounding would cost more than a
late page. So a candidate carries what a source states, the URL that states it, and a list of what
is still missing — and the ledger says plainly that direct fetches are refused here, so every source
in it is secondhand until someone opens it. Whether that should change is the one question this
leaves for Ryan, and it is on his side of this file.

**The first candidate, and it is a real one.** Ternary Bonsai 2 27B, announced 2026-09-17: Qwen3.8
27B — the model this site ranks top of what a graphics card runs — at a stated 5.9 GB against the
16.46 GB the Q4_K_M row carries. The interesting part is not that it is a new model, because it is
not one. It is the same model dropping into machines that cannot hold it today, and this site
already runs two quantisations of one model side by side. What stops it being a row now is written
down: the weights at the precision actually entered, the architecture the KV-cache figure is checked
against, whether anybody rents it, and an Artificial Analysis score, which the index does not appear
to carry for this build. The 98.2% retention figure is PrismML's own suite and is not the index the
Score column uses, and the ledger says so rather than borrowing it.

**Guards, five of them**, in `tests/model-watch.test.ts`: the ledger states a date the script can
read and not one in the future; the command it tells you to run is the command that exists; every
field its table names exists on every model in the data; its claim that a model can be added without
a measured speed is recomputed from `throughput.json` rather than asserted; and the script contains
no write. The field guard was proved by breaking it — renaming `license` to `licence_terms` in the
ledger fails it, which is the point, because the ledger is documentation and documentation rots.

**Verified**: 256 tests where there were 251, typecheck clean, `validate` clean, 253 pages with every
guard passing, and the script run and read. No page changed: this is tooling and `seo/`, so it is a
push rather than a pull request.

**What to continue.** The watch itself, tomorrow, and every day. Beyond it the backlog is unchanged:
the two pull requests are Ryan's to merge, and the 641px leaderboard band is the push-shaped work
left.

### 2026-09-18 — a four-word label stops reading under the column beside it

**Why this item.** The last entry named it as the push-shaped work left: the tier label that runs
past the name it sits beside on a phone. Everything else open is either Ryan's to merge (PR #8 and
PR #10, both repaired and ready) or sits behind one of those merges.

**Both of the backlog item's figures had moved, and one of its claims was wrong.** Measured again
before touching anything, across all 253 built pages at twelve widths from 320 to 1440px:
**97 labels on 42 pages overhang their own cell at 320px**, not the 84 on 29 the item recorded,
**84 of them cross into the track the figure is drawn in**, and the worst is 51px over rather than
36. The item also said it is clean at 360px and above. It is not: **26 more labels on 20 pages**
overhang at 360px, none of them far enough to reach the figure. 390px and above is clean, then and
now. Two labels do it, and only two: *Below every hosted tier*, 84 times on 29 comparison pages,
and *discontinued*, 13 times on 13 machine pages.

**The fix is the one the item proposed, and on its own it would have got the other half wrong.**
`.c-quant` is `white-space: nowrap` site-wide, which is right for a figure and wrong for a phrase,
so the label now wraps inside `.board.stack` only. But a tier label that is one word carries its own
hyphen, and wrapping it breaks *Haiku-class* across two lines, which reads as a typo in the data
rather than a fault in the layout. The site already had the answer: `tierLabel()` has put a one-word
label in `.nobreak` and left a phrase bare since 2026-09-17, and the rule for `.nobreak` sits on the
span itself, so it survives the label around it being told to wrap. One table on the site was still
printing the bare tier name instead — the "What the extra memory buys" table on the comparison
pages, which is exactly where the 84 labels are. It uses the helper now.

**What changed and what did not.** 0 labels reach the figure's track at any width. The 13
*discontinued* labels still end 2px past their cell at 320px, inside the 12px gap between the two
tracks and clear of the figure; the word cannot wrap and 2px is not worth a rule. Read rendered at
320px before and after rather than inferred from the diff. Diffing the geometry of every stacked row
and every table on all 253 pages at twelve widths: **33 rows on 17 pages get taller at 320px, 18
rows on 18 pages at 360px, and nothing else on the site moves** — no table width, no page width,
nothing at all at 390px and above. Names read better as well, which was not the point: with the
label able to wrap, the name track can take the width it needs, so *Ling 3.0 flash* and
*gpt-oss-120b* hold one line where they used to break.

**The guard.** `checkTierLabels()` holds both halves from the generated HTML: a one-word tier label
printed beside a name has to be held together, a tier label that is a phrase has to be free to wrap.
The build prints what it found — *311 tier labels sit beside a name in a table: 227 hold their line,
84 wrap between their words*. Proved by breaking it both ways rather than trusting it. Printing the
bare name fails with *prints Sonnet-class beside a name where a narrow column can break it at its own
hyphen*; wrapping the phrase in `.nobreak` fails with *holds Below every hosted tier to one line,
which on a phone runs it under the figure beside it*. The CSS half cannot be seen from the HTML, so
a test holds that: take the rule back out of `public/page.css` and *lets the label beside a name
wrap, so a phrase cannot run under the figure* fails.

**Found while sweeping, and it settles an open item.** The 641px leaderboard fault is real and the
leaderboard is not the worst of it. Reading each table's own width rather than asking whether the
page scrolls: at 641px **`/best-gpu/`'s table wants 657px in 597px** and `/leaderboard/`'s wants
600px in 597px; at 700px `/best-gpu/` is still 1px over. Nothing else scrolls at any of the twelve
widths, and no page overflows its window at any of them. The backlog item above now carries those
figures.

**Verified.** 251 tests (250 before, and the new one fails without its rule), typecheck clean, 253
pages with every guard passing, the full `npm run build`, and the comparison table read rendered at
320px before and after.

**Where it is.** `858e28c`, pushed to `main` at 12:46: `public/page.css`,
`scripts/build-pages.ts`, the test and this entry. Nothing a visitor reads changed in words, only
where the words sit.

**A correction, because the paragraph that used to sit here was wrong.** It said the deploy had
stalled: run 148 green through `npm ci` and `npm test` in seventeen seconds, then half an hour in
`npm run build` without returning, against 2m42s for that step on the commit before. The seventeen
seconds and the 2m42s are right and the half hour is not. **Run 148 was four and a half minutes old
when that was written**, and it was cancelled at 12:51:50 by the next push to `main`, which is the
repository's own `cancel-in-progress` rule working rather than anything being stuck. What went wrong
is that the elapsed time was taken from a running guess rather than from the clock, and the guess
was five times the truth. `date -u` is one call and settles it; a figure in this log that nothing
was measured against does not belong here.

**A sibling session pushed five minutes after this run did**, which is the duplicate-schedule
problem at the top of this file. It is the same session that repaired the two pull requests an hour
ago; it read `858e28c` and repaired both against it, and its work is sound and does not overlap this
run's. This entry's own push was rejected, fetched and rebased rather than forced, which is what
that item asks for. It also means the deploy of the layout fix is carried by whichever run finishes
last rather than by run 148 — the CSS, the build change and the guard are identical in all of them.

**It is deployed.** Four pushes went to `main` within seven minutes, three of them this run's and
one a sibling's, each cancelling the run before it, so only the last one counts: **deploy run 151
on `5ab8d66` finished green at 12:57** and published. That head carries the CSS rule, the build
change, the guard, the test and this entry, so the layout fix is live. Whether the live site serves
it cannot be read from here, since `sunkcost.ai` is off this environment's allow-list, which is the
first item under Ryan's side above.

**What to continue.** The 641px band, which now has figures and a named page worth more than the
leaderboard: `/best-gpu/`, 60px over at the first width above the phone layout. Then the
monthly-cost question page, which is still the biggest item on the backlog and still sits on PR #8's
helpers, so it waits on that merge. PR #8 and PR #10 are both repaired and ready and are Ryan's.

### 2026-09-18 — the two pages waiting on a merge stop waiting on a conflict

**Why this item.** The last entry set two jobs in order. The first is answered: Ryan merged PR #11
at 11:01, deploy run 146 went green at 11:06 on `be11535`, and the three things stuck behind red
`main` — the machine-name floor, `/best-gpu/` and the calculator's own footer — are published. The
second was the two pull requests that stopped merging when PR #7 went in, which the last entry
called the cheapest useful hour on the list. Both are repaired and pushed.

**The conflicts were the union the backlog predicted.** PR #8 had 16 hunks across six files, PR #10
had 10 across four, and all but two are two pages appending their own card constant, card builder,
import, `write()` call, build guard, test block and footer entry to the same lists. Both sides kept,
every time.

**The two that are not unions.**

- **The closing note on `/best/`**, which the PR #8 item warned about and which is the one place a
  page could have lost its only link in that paragraph. Main's sentence links the card ranking;
  the branch's last sentence links the token-cost page. The resolution keeps main's line and takes
  the branch's last sentence, so the rendered note now carries `/best-gpu/`, `/compare/` and
  `/local-llm-vs-api-cost/`. Read out of the build rather than inferred from the diff.
- **The build's own count line on PR #10.** Main counts machines as every path starting `/hardware`;
  the branch counts every path starting `/hardware/` that is not `/hardware/` itself, because
  `/hardware/` is now an index page and not a machine. The branch's line is the right one, and the
  build prints 56 machines with it.

**What no conflict marker asked for, and what it cost this morning.** `FOOTER_LINKS` in
`src/pagekit.ts` and the hand-written footer in `index.html` have to hold the same links in the same
words and the same order. PR #8 adds a seventh entry to the first; on PR #10 both entries merged
silently with no conflict at all. Either branch would therefore have merged clean and failed on
`main`, which is exactly what happened at 10:51 and is the fault the last two entries counted three
times. Both branches now carry the `index.html` line. The guard is real and was proved rather than
trusted: taking the line back out of `index.html` fails *the calculator's own foot offers the same
indexes, in the same words and the same order, as a generated page*, on the merged tree.

**One thing found by sweeping, and it was this repository's own rule catching a slip.** PR #8's
branch was carrying `public/best-gpu/index.html`, 226 lines of build output committed by the
previous merge repair on that branch (`40a3cbd`). It is not on `main`, and `main`'s own ignore rules
name `public/best-gpu/`, but ignore rules do not apply to a file already tracked, so it would have
merged into the repository and gone stale on the next data change. Dropped. Worth running on any
branch before pushing it, since it takes a second:
`git ls-files | git check-ignore --no-index --stdin -v`. It is clean on PR #10 and on `main`.

**Verified, on the merged trees rather than on the branches, which is the standing lesson here.**
PR #8: 258 tests, typecheck clean, 254 pages with every guard passing, the full `npm run build`
through `build:functions`, `/best/` read rendered, and the built `dist/index.html` footer read with
all six indexes in it. PR #10: 255 tests, typecheck clean, 254 pages with every guard passing, the
full build, and `/hardware/` read rendered at 1,811 words with its lede, title and footer intact.
Both were then re-checked against `main` with `git merge-tree`: **both merge clean.**

**They still conflict with each other**, in `scripts/build-og.ts`, `scripts/build-pages.ts`,
`src/list-card.ts`, `tests/list-card.test.ts` and — new since this run — `index.html`, because both
now add a footer line to it. Whichever merges first, the second wants the same union again plus its
own footer entry in `FOOTER_LINKS`'s order. That is a repair of a few minutes, not a reason to hold
either back.

**Where it is.** Two pushes, no change to `main` but this entry: `8789b62` on
`seo/local-vs-api-cost` and `81cd7d1` on `seo/hardware-index`.

**Both needed a second repair fifty minutes later, and that is the item's own lesson arriving on
time.** `858e28c` landed on `main` at about 12:40 — the `.c-quant` tier label, which is the work
this entry recommends next — and it appends `checkTierLabels()` to the guard list at the foot of
`scripts/build-pages.ts`, which is the same list both branches append their own guard to. So both
stopped merging again within the hour, in one file and one hunk each. Both are unions: main's guard
and the branch's, side by side. PR #10's carries the same count-line decision as before, because
main's commit also rewords that line. Repaired and pushed as `b7c44e9` and `0d16555`, each verified
on its own merged tree — 259 and 256 tests, typecheck clean, 254 pages with every guard passing, and
`checkTierLabels()` reporting its 311 labels on both trees. Both merge clean against `main` again.
**A branch that touches the foot of `build-pages.ts` has a shelf life of about an hour here**, which
is an argument for merging these two rather than for repairing them a third time. Whether the live site is serving the
11:06 deploy could not be checked from here; `sunkcost.ai` is still off this environment's
allow-list, which is the first item under Ryan's side above.

**What to continue.** Both pull requests are Ryan's to merge and nothing else on them needs an
agent. The push-shaped work left is the `.c-quant` tier label that runs under the figure's column on
84 rows across 29 comparison pages at 320px, which is one rule inside `.board.stack` and wants the
320-to-1440px sweep the 10:31 run did; then the 641px leaderboard band with a scrollbar forced,
which did not reproduce headless. The biggest item on the backlog is still the monthly-cost question
page, and it sits on PR #8's helpers, so it stays behind that merge.

### 2026-09-18 — the name beside a sentence stops being one character wide

**Why this item.** The first job the last entry set was to check the pull requests against `main`.
There are four, not three: #7, #8 and #9 are on Ryan's side of this file, and **#10, the machine
index, was never written down there** — it has an entry in the Runs section and nowhere else, so it
has now been added above. All four merge clean, tested by merging each rather than assumed, so there
was nothing to repair. That left the push-shaped work the entry named next: the machine name crushed
to a character's width on a phone.

**What was wrong.** On a phone a table row stops being a row and becomes a two-track grid: the name
on the left in `minmax(0, 1fr)`, the figure the page is for on the right in `auto`. The right track
takes whatever its cell wants and the left one will shrink to nothing. That is right for a figure
and wrong for a sentence, and **24 rows on 24 machine pages** answer the pay-back column with one:
*Not enough data to compute a pay-back.* It is 261px of text in a 288px row, so the name beside it
was left **22.5px** — one word a line, down the whole name. Two machines, both unpriced: the Mac
Studio M5 Ultra, 512GB on 13 of the rows and the Strix Halo Framework Desktop, 192GB on 11.

**The fault is wider than the backlog had it.** It was written as a 320px fault, measured on a 271px
row. Measured here it runs to **390px** — the name gets 22.5px at 320, 62.5px at 360 and 92.5px at
390, and only at 430px does it reach 132.5px and read normally. So it was three phone widths, not
one.

**The floor is arithmetic, not taste.** The left track now has a 115px floor, and 115 is the widest
one that changes nothing else. Every stacked row on the site was measured in Chromium at 320, 360,
390, 430, 540 and 640px — the 2,689 rows that carry both a name and a figure, over 252 pages — and
the narrowest name that fits today is **117.7px**, on the NVIDIA RTX PRO 6000 Blackwell row of
`/models/ling-3.0-flash-q4/`. Nothing else comes within the floor at any width. The measurement
then ran again with the floor in and the diff is exact:

| width | rows changed | of which the sentence row | narrowest name after |
| --- | --- | --- | --- |
| 320px | 24 | 24 | 115px |
| 360px | 24 | 24 | 115px |
| 390px | 24 | 24 | 115px |
| 430px | 0 | — | 132.5px |
| 540px | 0 | — | 242.5px |
| 640px | 0 | — | 342.5px |

A wider floor was possible and rejected: 130px would have reached 52 more rows at 320px and wrapped
*Pays back in 10,966 years* onto two lines to give these 24 a few pixels, which is a bad trade.

**What the row reads like now.** *Strix Halo Framework Desktop, 192GB* over three lines against the
sentence over two, the same shape as the priced row under it. Read rendered at 320px on two machine
pages before committing, not inferred from the numbers.

**The guard, and the two breaks that proved it.** A new test in `tests/pagekit.test.ts` holds both
halves of the claim: that the site still has machines with no published price and that `verdictLine`
still answers them with that sentence, and that the phone block still carries the floor. Taking the
floor back out fails it; changing the sentence in `src/pagekit.ts` fails it too. Neither half passes
by agreeing with itself.

**Two things found by sweeping, neither this run's and neither fixed here.** A tier label runs under
the figure's column on **84 rows across 29 comparison pages** at 320px, because `.c-quant` is set
`nowrap` and *Below every hosted tier* is 145px wide; it is untidy rather than broken, and it is in
the backlog with what was measured and what the nowrap is there for. And **the 641px leaderboard
scroll did not reproduce**: at every integer width from 615 to 700px the table is 597px inside the
window. The original measurement's own arithmetic explains it — 582px is 641px minus a 15px classic
scrollbar, which a headless context does not draw — so the item stays open with that written down,
because a clean sweep here is not evidence it is fixed.

**Verified**: 239 tests where there were 238, typecheck clean, 252 pages with every guard passing.
Swept in Chromium over all 252 pages at 320, 360, 390, 430, 641, 768, 1024, 1280 and 1440px: no page
wider than its window and no table scrolling sideways at any of them. The overflow sweep was also
run on unchanged `main` for comparison, which is how the 29 pages above are known to predate this
change: 53 pages at 320px before, 29 after, the difference being exactly these 24.

**Where it is.** Pushed to `main` as `c17b1ec`, with this entry in the same push, which is what the
last two entries recommended and why there is one deploy rather than two. Whether the CSS reached
the live site could not be checked from here: `sunkcost.ai` is still not on this environment's
allow-list, which is the first item under Ryan's side above. All four pull requests were re-checked
against the commit and all four still merge clean — the change is one CSS declaration, a comment and
one test, and no branch touches any of them.

**What happened next, written after the fact.** Everything above is still true and none of it is
live. Deploy run 140 started on this push at 10:49:58 and was **cancelled sixteen seconds later** by
PR #7's merge, run 141 was cancelled by PR #9's merge a minute after that, and runs 142 and 143 both
failed at the test step. **The last deploy that published anything is run 139, at 10:09.** So the
floor, `/best-gpu/` and the calculator's new footer are all in `main` and none of them has reached
the site. The cause and the one-link fix are the item on Ryan's side above, which this session
verified and then pinged him about at 10:58 — the first two runs of the hour are what write that
item, and this one is what made sure someone outside the repository knows.

**What to continue.** First, whether PR #11 merged and whether the deploy after it went green; if it
did not, `main` is still red and nothing else matters. Then the three pull requests still open: #8
and #10 stopped merging when PR #7 went in and each wants a union resolution in four files, and that
is now the cheapest useful hour on this list, ahead of writing anything new. The push-shaped work
left is the `.c-quant` label above, which is one rule inside `.board.stack` and wants the same sweep
this run did, and then the 641px band with a scrollbar forced.

### 2026-09-18 — two figures on one line, where the measurement says two figures fit

**Why this item.** The first job the last entry set was to check all four pull requests against
`main`. All four still merge clean — tested by merging each rather than assumed — so there was
nothing to repair and no reason to spend the hour on one. That left the work the entry named next:
the pairing rule for `stack()` on the long tables.

**What the rule is.** `stack()` turns a table row into a block on a phone: the name, the figure the
page is for against the right edge, and every other column underneath on a line of its own with its
heading in front of it. Some of those columns are three words wide and still take a whole line.
`stack()` now takes `pair`, two columns that share one line instead — the first keeps the left, the
second sits against the right edge under the figure.

**The fit is arithmetic, and the backlog had it wrong.** At 320px a row has 271px to give, split by
a 12px gap into a left track that will shrink to nothing and a right track sized to its widest cell.
The cell that usually sets that right track is not the pair at all: it is **the figure**, which sits
in the same track one line up. So a pair fits when **first + 12 + max(figure, second) is 271 or
less**, and that third term is what the backlog's own estimate left out. Every width below was
measured in Chromium at 320px by letting each cell take its natural width, taken as the maximum over
every row of every page of that kind — 56 machine pages, 55 model pages, 138 comparisons and the
four indexes.

**Six tables pair. Four that looked like they fit do not.**

| Table | pair | first + 12 + max(figure, second) |
| --- | --- | --- |
| `/leaderboard/` | Good at + Weights | 103 + 12 + 94 = **209** |
| `/how-much-memory/`, by size | Weights + Cache | 103 + 12 + 84 = **199** |
| machine page, what it runs | Good at + Memory | 103 + 12 + 95 = **210** |
| machine page, the shorter windows | Needs there + Needs at 32k | 115 + 12 + 119 = **246** |
| model page, cheaper machines | Price + Needs there | 76 + 12 + 113 = **201** |
| comparison, what the extra memory buys | Weights + Needs | 89 + 12 + 120 = **221** |

The four refused: **`/best/`** — Speed and the calculator link measure 150 and 126, where the
backlog had them at 113 and 130 without their headings, and the link is wider than the figure beside
it, so it sets the right track and the pair comes to 288. Applying it anyway was tried first and
measured: the page grew **873px**, because the left track fell to 134px and the speed wrapped. **A machine page's other machines** — the pay-back cell
answers *Not enough data to compute a pay-back.* on unpriced rows, 252px, so nothing can sit beside
it. **A model page's machines** and **a model head-to-head's machines** — both pay-back figures run
to 157 and 155. `/compare/`, which the last entry already ruled out at 20,986px, stays ruled out:
its Price sub-line alone is 264px.

**What it bought.** 152 of the 307 stacked tables pair, **1,153 paired lines**, and **24,930px saved
over 253 pages** measured at 320px against the same pages with the pair rule switched off.
`/how-much-memory/` 17,654 → **16,545**, `/leaderboard/` 10,625 → **9,656**, a typical machine page
322px shorter. Two of the pairs also say something the two separate lines did not: on
`/how-much-memory/` the weights and the cache are the two halves of the figure printed above them,
so the sum is now on one line under its own answer, and on a machine page's shorter-window table the
same model's memory at two windows sits side by side instead of two lines apart.

**The guard.** `checkPairedColumns()` holds the rule the item asked for, which is that the pair is
chosen for the whole table and never per row: every row of a paired table carries both halves,
each line has exactly two halves with one of them marked as the one that closes it, and neither half
is empty or a bare dash. `stack()` holds the rest before the HTML exists — a pair must be two
columns that are neighbours once the name and the figure are out of the count, named left to right,
never the name or the figure, never a column that goes quiet in a row, and a pair that never applies
to anything is refused rather than silently dropped. Proved by six breaks, each caught: pairing only
half the rows (*24 of 56 rows … keep both columns on lines of their own*), leaving neither half
marked as the closer (*2 halves and 0 of them closing it*), the rule quietly ceasing to apply at all
(*were asked to share a line and no row gave them one*), pairing two columns with another between
them, pairing a column that is empty in some rows, and taking the CSS rule out, which the new test
catches.

**The one exception the guard found by itself.** The leaderboard's eight hosted rows run three
columns together under one `colspan`, so they have no Good at and no Weights to pair. The first
version of the check called that a broken table; it is not, it is a row that does not have those
columns, and the check says so now and counts them.

**Two faults found by measuring, neither this run's and neither fixed here.** A machine name is
crushed to **7px** on 24 rows across 24 pages, wherever the pay-back cell answers *Not enough data
to compute a pay-back.* — the right track takes 252px and the left track gives up everything.
Removing the pair markup changes nothing, so it predates this run. And `/leaderboard/` scrolls
sideways by 14px at exactly 641px, the first width above the stacking breakpoint, and nowhere else
between 320 and 1440px. Both are in the backlog with what was measured.

**Verified**: 238 tests where there were 232, typecheck clean, 252 pages with every guard passing,
and every build stage green — `validate`, `build:og`, `build:pages`, `vite build`, `build:share`
(1,894 share pages) and `build:functions`, which found its font here. They were run in two goes
rather than one `npm run build`: `build:og` redraws 1,894 cards that nothing in this change touches,
so it was run on its own and the other five run after it rather than behind it again.
Measured in Chromium across all 253 pages at 320px — nothing overflows the window, no table scrolls
sideways, **no paired half wraps to a second line and no pair falls onto two lines** — and at 360,
390, 430, 641, 768, 1024, 1280 and 1440px over sixteen pages of every kind. `/leaderboard/`,
`/how-much-memory/` and a machine page were read rendered at 360px before committing.

**Where it is.** Pushed to `main` as `eb3086f`, with this entry as `f6ae50d` and a correction to
this paragraph as the commit after it. The code and the first draft of the entry went up in one
push, which is what the last entry recommended, and the correction then went up in a second — so
run 137 reads as cancelled and the run started by the last push is the one that carries everything.
That is the workflow's concurrency rule doing its job, not a failure, and the lesson the last entry
drew still holds with one word added: it is not enough to push the work and the log together, the
entry has to be **right** before the push, because a correction costs another cancelled run. Whether
the markup reached the live site could not be checked from here either way: `sunkcost.ai` is still
not on this environment's allow-list, which is the first item under Ryan's side above. The four pull requests were re-checked after the push and all four
still merge clean: the change is one option on six `stack()` calls, two CSS rules and a new check,
and none of the four branches touches any of them.

**What to continue.** The four pull requests are still open and still unreviewed, and they still
block the biggest item on the backlog — the monthly-cost question page sits on PR #8's helpers, and
a fifth branch is not worth opening while four wait. The push-shaped work left is the crushed name
column above, which is a floor on one CSS track and wants the same 320-to-1440px sweep this run
did, and then the 641px band.

### 2026-09-18 — the cheap box in the range finally has something to compare against

**Why this item.** The first job the last entry set was to check all four pull requests against
`main` before anything else. All four still merged clean at the start of this run, so there was
nothing to repair and no reason to spend the hour on one. That left the two things the entry named:
the pairing rule for `stack()` on the long tables, and the monthly-cost question page, which is
still waiting on PR #8. The `stack()` work was measured rather than assumed, and the measurement
sent the run elsewhere — see the end of this entry. The backlog item taken instead was the machines
in no head-to-head, which had been sitting open behind the question pages.

**What was missing.** Four machines on this list are sold as one name with two different chips
behind it, and every pairing rule on the site refused them, because every rule holds something
equal: the memory tier holds the silicon so the memory is the whole of the difference, the
same-silicon pair holds the memory so the price is, the generation pair holds both. What a maker
cuts to reach a headline price is the chip **and** the memory at once, so the entry-level
configuration of a box fell through all three. The Framework Desktop, 32GB and the Corsair AI
Workstation 300, 64GB — both Ryzen AI Max 385 parts, both the cheapest way into their own range —
appeared in **no head-to-head at all**. The backlog had those two and thought the honest pair was
385 against 395 across makers; it is not, it is each maker's own two chips, and reading it that way
turned up two more the item had not seen: the **base Mac Studio M5 Max, 36GB and M5 Ultra, 96GB**,
whose entry configurations carry a cut-down GPU — 32 cores against 40, 64 against 80 — that no page
on the site mentioned.

**What the rule is.** `chipStepPairs()` takes the cheapest machine on each chip a box is sold on
and walks the steps in price order, cheapest first. Four new comparisons, **90 machine match-ups
where there were 86**, and **53 of the 56 machines in a head-to-head where 51 were**. The three
left are all waiting on a price that does not exist in the data, not on a rule.

**What the pages say, and the answer they did not start with.** The section was drafted to say what
the bigger chip buys. On three of the four pairs the honest answer is **not speed**: both chips read
memory at the same rate — 256 GB/s on the two Strix boxes, 1,200 GB/s on the Ultras — and a token is
written by reading the whole model out of memory, so the figures follow the memory and not the chip.
The pages say that outright, and say what the extra cores do instead: read a long prompt before the
first token comes back, which is not something this site measures or prices. The fourth pair is the
M5 Max, where the data does give the dearer chip the wider path, **614 GB/s against 460**, and there
the page says so instead and calls it the part of the step you can see in the speeds. Each page
names both chips in the data's own words, counts the graphics part the way its own maker counts it
(Apple's GPU cores, AMD's compute units, never one translated into the other), and hands the reader
a prefilled link that prices the cheaper box on its own before they pay for the step.

**Titles and descriptions.** The heading says the box once and spends the rest on the two sizes, the
way the memory-tier pages do, with a title that says the chip changes too so the pair does not read
as another memory question: *Framework Desktop, 32GB vs 64GB: the chip changes too*, 53 characters.
All four titles are 53 to 56, all four descriptions 107 to 155, and each description leads with what
that pair actually buys — bandwidth on the M5 Max, models held on the other three.

**The guard.** `checkChipStepPairs()` recomputes every claim from the data: that the pair is one box
sold on two chips, both on sale and priced, cheaper side first and each side the cheapest of its own
chip; that both chips are named as the data writes them; that the core counts and the step between
them are printed where the data counts them; that the page says the dearer chip reads memory faster
only where the data says it does, and says they read it at the same rate where they do; and that the
section carries the link pricing the cheaper box alone. Proved by five breaks: dropping the core
counts (caught, all four named), forcing the wider-path sentence onto the three equal-bandwidth
pairs (caught twice over, the missing claim and the false one), dropping the section's calculator
link (**not** caught at first, because the page's own top links the same address — the check now
asks for the whole sentence, and the break is caught), stopping the chip names being printed
(caught), and pairing the dearest configuration on each chip instead of the cheapest (caught by the
new test, which recomputes the cheapest on each chip from the data).

**Verified**: 232 tests where there were 230, typecheck clean, the full `npm run build` at exit 0
including `build:og`, `build:share` and `build:functions`, 252 pages with every guard passing.
Measured in Chromium at 320, 360, 390, 430, 768, 1024, 1280 and 1440px: nothing overflows the window
at any width and no table scrolls sideways. The four pages run 894 to 992 words against a median of
753 for the comparisons. The Framework page was read rendered at 1280px and its share card at full
size before committing.

**Where it is.** Pushed to `main` as `5d9710a`; deploy run 135 finished green at 09:10, so the four
pages are live. The push **conflicted all three code pull requests** — #7, #8 and #10 all add names
to the same import list in `scripts/build-pages.ts` that `gpuCores` and `chipStepNames` went into.
All three were repaired in this run by merging `main` into each branch and taking the union of the
lists, which is the same repair earlier runs made by hand; each was checked after with typecheck and
the full test suite, and PR #10 with a full `build:og` and `build:pages` as well, because its
`/hardware/` index counts machines and had to be shown still holding. All four branches merge clean
into `main` again. PR #9 never conflicted; it touches the calculator only.

**Why not the `stack()` pairing rule.** It was measured first, at 320px in Chromium, and the
measurement argues against writing it. On `/compare/`, the page the last entry called the worst at
20,986px, the machine table's own sub-lines are **Price at up to 244px of a 288px row** — too wide to
sit beside anything — so only 53 of 86 rows could pair at all, and a table where some rows pair and
some do not reads worse than one where none do. The page with the real opportunity is
`/how-much-memory/`, where Parameters, Weights and Cache run 39, 53 and 44px and each takes a full
line; pairing two of the three saves about 1,265px of 16,294, and all three on one line would save
about 2,530px, which needs three columns in a grid built for two. It is worth doing, for `stack()`
rather than for one page, but as a deliberate change to the narrow layout with its own run, not as
a by-product.

**What to continue.** The four pull requests are still open and still unreviewed, and they are now
the thing blocking the biggest item on the backlog: the monthly-cost question page sits on PR #8's
helpers, and a fifth branch is not worth opening while four wait. If they are still open next run,
the push-shaped work left is the `stack()` pairing rule as measured above, and after that the
`/hardware/` and `/leaderboard/` cross-link question, which needs PR #10 merged before it can be
looked at properly.

### 2026-09-18 — the 56 machines finally have a list of their own

**Why this item.** The backlog put the machine index behind the pull-request queue, and the queue
has not cleared: PR #7, #8 and #9 were all still open at the start of this run, a day after the last
of them was written. All three were checked against `main` first and all three still merge clean, so
there was nothing to repair and no reason to spend the run on one. The item said "worth doing as
soon as that queue clears"; three more push-shaped polish runs while the biggest structural gap on
the site sits unwritten is the worse trade, so this run wrote the page.

**What was missing.** Nothing was served at `/hardware/` at all. The build wrote 56 machine
directories under it and no `index.html`, so a reader who cut a machine's address back — and a
crawler that tried the same — got a 404. `/leaderboard/` is the index of models, `/best/` ranks by
level of use and `/compare/` lists the 133 match-ups; the 56 machines, the largest page family on the
site, had no list in front of them and their breadcrumbs had two levels where three were available.

**What the page says.** All 56 configurations in one table, grouped by family, families in the order
of what the cheapest of them costs, and inside a family the machines you can still buy first. Six
columns: the machine, its price, the memory its GPU can address against the memory fitted, how many
of the 39 open models it holds at 32k, the strongest of those with that machine's speed on it, and
how long that pair takes to pay back. Every figure is read from the same view the machine's own page
is built from, so the index and the page behind it cannot drift apart, and every price opens the
calculator on that machine running the model beside it. The two machines with no published price say
so and offer the calculator's own price box instead of a figure nobody published.

**The page's own answer is not the one it was drafted with.** The first version of the opening
paragraph said more money buys a bigger model. The table says otherwise: **39 of the 56 machines top
out at the same model**, Qwen3.8 27B, and that run goes from a $999 Mac mini M4, 32GB to an $18,000
RTX PRO 6000 Blackwell. The strongest model a machine holds changes in **four steps** across the whole
range; five machines hold something stronger than the plateau, the cheapest of them the $7,099 Mac
Studio M3 Ultra, 256GB, and two hold all 39. So the paragraph says what the data says: more money
buys memory, memory buys a stronger model in only four steps, and between the steps it buys speed,
spare memory and a longer window. Pay-back runs the other way, because the strongest model a machine
holds is the slowest thing it can run: at 500k tokens a day the quickest figure in the table is 13
years and the slowest is 1,044.

**Two faults found by reading it rather than diffing it.** The share card at eight family rows put
"of 39" under each figure and that second line ran into the row beneath it, which is the same fault
the best-gpu card had at seven rows; the denominator is in the column heading now and the rows are
one line each. And the strongest-model column printed the same name 39 times, which on a phone is
the leaderboard's own hosted-row fault in another place — so the cell carries that machine's speed on
that model as well, which is different on every row and is a figure people shop on.

**What else moved.** `/hardware/` joins the footer every page carries, which `checkFooter()` forces
rather than permits: a page written at the top level of the site fails the build unless the footer
names it. The 56 machine pages gain it as the step above them, so their breadcrumbs and their
BreadcrumbList now read Sunk Cost / Hardware / the machine. `familyGroup()` moved into
`src/pagekit.ts` so the table's group headings and the card's rows name a family the same way.

**The guard.** `checkHardwareIndex()` recomputes every row from the data: the count, the strongest
model, the speed, the pay-back and the calculator link, on all 56; that the index lists every machine
the build writes a page for; and that every machine page passes through it. Proved by five breaks,
each caught with the row named: dropping the Mac mini M6, 32GB from the table (*has no row for*,
and *does not list /hardware/mac-mini-m6-32/*), printing one model more than each machine holds,
naming the second-strongest model instead of the strongest, moving every pay-back figure a year, and
taking the new step out of the machine pages' breadcrumbs.

**Verified**: 235 tests where there were 230, typecheck clean, the full `npm run build` at exit 0
including `build:og`, `build:share` and `build:functions`, 249 pages with every guard passing.
Measured in Chromium at 320, 360, 390, 430, 768, 1024, 1280 and 1440px: nothing overflows the window
at any width and the table never scrolls sideways; it is 8,040px on a phone over 64 rows, in line
with the leaderboard's 8,410. The page and its card were read rendered at 360 and 1280px before
committing.

**Where it is.** [PR #10](https://github.com/rlindsey2/sunkcost/pull/10), branch
`seo/hardware-index`. It merges clean into `main` and against PR #9. It **conflicts with PR #7 and
PR #8**, which also add a list-page card: the import lists in `scripts/build-og.ts`,
`src/list-card.ts` and `tests/list-card.test.ts`, and the card registry in `build-og.ts`. Whichever
merges first, the repair on the others is the union of those lists, the same repair two earlier runs
made by hand.

**What to continue.** Four pull requests are now open and none has been reviewed. The next run
should check all four against `main` before anything else and repair whichever has gone stale; a
fifth branch is not worth opening while four wait. If they all still merge clean, the push-shaped
work left is the pairing rule for `stack()` on the long tables — `/compare/` at 20,986px on a phone
is the worst, not the leaderboard — and after that the monthly-cost question page, which is still
waiting on PR #8.

### 2026-09-18 — the leaderboard said the same thing eight times before it said anything

**Why this item.** All three pull requests were still open at the start of this run, so a new page
would have been a fourth branch colliding with the three, and the machine index at `/hardware/` has
to wait for that queue. The last entry named the push-shaped work to take instead, and this run took
it: the hosted rows at the top of `/leaderboard/` on a phone.

**What was wrong.** The leaderboard opens with eight hosted models, from Anthropic and OpenAI, so
the open models have a scale to be read against. Every one of them carried the same sentence in its
own row: *Runs in someone else's data centre. You cannot download it.* On a wide screen that is one
cell inside a row and reads as a group. On a phone, where `stack()` turns a row into a block, it was
a two-line paragraph repeated **eight times** down the first screenful, before the reader reached
the first model they can actually download. The last entry called it seven; it is eight, because
`frontier_reference` has eight entries.

**What it says now.** One heading above the block, which is where a thing true of all eight belongs:
*Hosted models, here for scale. You cannot download any of these; they run in someone else's data
centre.* Each row then keeps the one thing only it knows, and it is a figure the site already had
and printed nowhere: **the score the index gives that model with its reasoning turned down**.
`score_alt` is in `data/defaults.json` on all eight, and `frontier_reference_note` says what it is:
the non-reasoning or lowest-effort figure where Artificial Analysis reports both. So GPT-6 Astra
reads 53, *or 45 with reasoning turned down*; Claude Opus 5 reads 51, *or 40*; GPT-5.6 Luna 38,
*or 17*. No figure was invented and none was changed. The note under the table already told the
reader that hybrid models are shown at their highest-effort score with the alternative on each
model's page, and it now adds that the hosted rows carry theirs beside the score.

**That gap is worth a reader's attention, which is the second reason for showing it.** The page's
own lede says the best open model scores 42 against the best hosted 53, *the thing no amount of
hardware closes*. Six of the eight hosted models fall below that 42 with reasoning turned down: only
GPT-6 Astra at 45 and Claude Fable 5.1 at 47 stay above it. The page
does not draw that conclusion, because the index's two figures are not measured at the same cost and
the site does not model effort settings; it prints both and leaves it there.

**A class that meant two things now means one.** `is-frontier` marked both a heading row inside a
table (three of those, on the machine pages and `/best/`) and a hosted data row on the leaderboard,
and the phone stylesheet is written for the first: `padding: 14px 1px 4px; border-bottom: 0;
background: none`. So the eight hosted rows were being styled as eight group headings, which is why
they lost their rules and ran together. Hosted rows are `is-hosted` now. On a wide screen they look
exactly as they did, tint and all; on a phone they keep the rule underneath and read as eight rows
under one heading.

**Measured, at 360px in Chromium, both figures taken in this run with the same tooling so they
compare:** the table was **8,483px over 56 rows** before and is **8,410px over 57** after, so the
table is 73px shorter having gained a row. Length was never the fault and this does not fix it. What
changed is that the first screenful now carries eight different facts instead of the same one eight
times. Nothing overflows: the widest element on the page ends at exactly 360.

**The guard.** `checkLeaderboardLinks()` holds four claims about the block, and the fourth is the one
that keeps this from coming back: **the sentence is said once, above the rows, not inside them**.
The others are one row per hosted model in the data, no hosted row offering hardware you can buy,
and the second figure equal to the data's own `score_alt`. Proved by five breaks, each caught with
the row named: dropping the heading (*says a hosted model is not a download 0 times, and it belongs
once, in the heading above the hosted rows*), putting the sentence back in every row (*tells the
reader inside GPT-6 Astra's own row … which a phone repeats once a row*), printing `score_alt + 1`
(*does not give GPT-6 Astra the 45 the index scores it at with reasoning turned down*), moving the
heading below the block, and giving a hosted row a calculator link. The build now says what it holds:
*ranks 8 hosted models alongside the open ones, 8 of them also at the score the index gives them with
reasoning turned down, and says once above the block that none of them is a download*.

**Verified**: 230 tests, typecheck clean, 248 pages with every guard passing, and the full
`npm run build` including `build:og`, `build:share` and `build:functions`. The page was read as
rendered at 360, 768 and 1280px rather than diffed, and reads as finished at all three.

**The commit and the deploy.** `cf0ee16` on `main`. Its own run, 131, was cancelled three minutes
in by the push of this entry, which is the workflow's concurrency rule doing what it is for rather
than a failure. **Run 132, on `f8edf39`, carried both and finished green at 06:51**, so the page is
live. A run that pushes its work and its log a few minutes apart will keep reading as one cancelled
deploy and one green one; the green one is the one that matters, and it carries both commits.

**All three pull requests still merge clean against this push**, checked with a real test merge of
each rather than assumed, so none needed the repair the last seventeen entries have recorded. The
change sits in `leaderboard()` and in two CSS rules, and none of the three branches touches either.

**Continue next: the machine index at `/hardware/`**, still the biggest gap the log has found, and
still waiting on the pull-request queue, which is three deep and has been since 05:53. If it is
still three deep at the next run, the push-shaped work left is `stack()`'s pairing rule, which the
last entry measured and this one leaves open: `Good at` renders 52px and `Weights` 42px at 360px, so
the two could share a line wherever `stack()` is used, and `/compare/` at 20,986px on a phone would
gain more from it than the leaderboard did.

### 2026-09-18 — the page everything links back to linked back to half the site

**Why this item, and it was not on the list.** PR #7 and PR #8 are both still open, so a new page
would be a third pull request colliding with both, and the two push-shaped items the last entry
named are judgement calls it said to read the page before doing. Both were read. The leaderboard's
phone table does not read as the problem the item assumed, and the backlog item now says so and says
what does read badly there. Reading it turned up something better: **the home page links to two of
the site's four top-level pages, and the foot of every generated page links to three.**

**What was actually wrong.** Counted on the built site rather than guessed: `/leaderboard/`, `/best/`
and `/how-much-memory/` each had **248 inbound pages** — every page on the site, because the footer
in `pageShell()` names them. `/compare/` had **187**, the pages that happen to mention a match-up in
their own text. It is the index of 133 comparisons and it was the one hub a reader could finish a
page without meeting. And `index.html`, the page all 248 generated pages link back to and the one
external links land on, has **no footer at all**: its only route onward is two links in the models
aside, the leaderboard and the best buys.

**What changed, and where each half went:**

- **On `main` (`3cda750`, and `305728a` for its wording):** the footer is a list, `FOOTER_LINKS` in
  `src/pagekit.ts`, rather than markup in the shell, and it names `/compare/` as *Every head-to-head*.
  248 pages, `/compare/` from 187 inbound to 248.
- **As [PR #9](https://github.com/rlindsey2/sunkcost/pull/9):** `index.html` gains the same footer,
  in the same order and the same words, less its link back to itself. It is the calculator, so it is
  a pull request, which is the standing rule here.

**The guard.** `checkFooter()` holds three claims, and the first is the one that matters as the site
grows: **a page written at the top level of this site stands above the machines and the models, so
it belongs at the foot of every page**, and adding one without adding it there stops the build. The
other two are that the footer links nothing the build does not write, and that every page carries
the same footer, so a page type cannot grow one of its own. Proved by four breaks, each caught with
the page named: dropping `/compare/` from the list (caught as *`/compare/` sits at the top level of
the site and the foot of every page walks past it*), pointing the list at `/comparisons/`, taking
the footer out of the shell (248), and giving `/best/` a footer of its own (1).

**A word the guard printed was wrong before either open PR could merge, and was corrected rather
than left.** The first version said *is an index of the site*. `/best-gpu/` and
`/local-llm-vs-api-cost/` are both top-level pages and neither indexes anything — they answer a
question — so the message would have been false the moment either merged. `305728a` says *sits at
the top level of the site* instead. Wording only; no page changed.

**PR #9 collides with nothing, which is deliberate.** Checked with real test merges, not guessed:
clean against `main`, against PR #7 and against PR #8. It touches `index.html`, `src/styles.css` and
one `describe` block; neither of the other two branches touches either file, and it touches nothing
they do. That should spare it the hourly repair those two have needed twenty-odd times between them.
The 84px that kept the last pane clear of the fixed mini bar on a phone moves to the footer, which
is the last thing on the page now, and the footer was read as rendered at 360px and 1280px rather
than diffed.

**Verified**: 230 tests on `main` (226 before, four new in `tests/pagekit.test.ts`) and 233 on the
branch (three more, holding the home page's footer to `FOOTER_LINKS` so the two cannot drift apart
the way the fonts block could before its own test); typecheck clean on both; 248 pages with every
guard passing; and the full `npm run build` including `build:og`, `build:share` and `build:functions`
on both. The footer was read as rendered text on a machine page at 360px and 1200px, where it wraps
to three lines and one.

**The deploy.** `3cda750`, run 128, green at **05:51**.

**Both pull requests stopped merging, and both were repaired in this run** — the seventeenth time
the log has recorded it. Both conflicts were the import lists and the footer, every hunk a union, and
**both branches had already written their own page into that footer**, so the repair was to move
each one's entry into `FOOTER_LINKS` keeping its own words: *Which graphics card* on PR #7, *What a
token costs either way* on PR #8. Verified on each branch rather than assumed: **238 tests, typecheck
clean, 249 pages with every guard passing and the full build**, on both. PR #7 is now `a5c4ece` and
PR #8 `cd6e83d`, and each merges clean against `main` at `305728a`, checked with a real merge.

**PR #8 was carrying 24 KB of build output, and this run dropped it.** `public/best-gpu/index.html`
— a page the *other* branch generates — was committed to PR #8 by the 04:53 merge repair, because
only PR #7's `.gitignore` covers that directory and PR #8's does not. Nothing was lost: it is
generated by `npm run build:pages`.

**Their collision with each other is unchanged in shape and has one more hunk.** Measured with a real
test merge: the same six files, and `FOOTER_LINKS` is now a seventh hunk in `src/pagekit.ts` — a
plain union, one line each, keep both. **The one hunk that can still quietly lose something is
unchanged**: the closing `<p class="note">` on `/best/`, where PR #7 links `/best-gpu/` and PR #8
links `/local-llm-vs-api-cost/` in different edits to the same paragraph. Taking either side whole
drops the other page's link. Both edits have to be kept.

**Continue next: the machine index at `/hardware/`**, still the biggest gap the log has found. It is
a new page and wants the PR queue to clear, and the queue is now three. If all three are still open
at the next run, the push-shaped work left is the frontier rows on the leaderboard's phone layout,
which this run measured and narrowed the backlog item to: seven rows repeating the same sentence
seven times, an inch apart. That is a real fault rather than a judgement call, and it is `stack()`
plus the frontier rows in `scripts/build-pages.ts`, so it is a push.


### 2026-09-18 — the models two machines share are not held to the same length

**Why this item.** The top backlog item is still the question pages, and its one live candidate sits
on helpers that only exist on PR #8's branch. Both pull requests were still open at the start of this
run, so a new page would have been a third one colliding with both. The last entry named the
push-shaped item to take in that case, and this run took it.

**What the 53 pages were missing.** Where one machine holds models the other cannot, the page names
those models under *What the extra memory buys* and stops. That is half an answer. Fit turns on
usable memory, the weights are a fixed size and the KV cache is not, so the roomier machine has more
left over once the weights are in and takes the **models both machines hold** further as well. The
7 pages where the two machines hold exactly the same models have said this since 2026-09-17, in a
table under their own heading. The 53 where one holds more said nothing about it.

**What it says now**, worked out from the two machines on each page. On the RTX PRO 6000 against the
Radeon AI PRO R9700: *The extra memory buys context as well. Of the 27 models both machines hold at
32k, 9 run to a longer window on the NVIDIA RTX PRO 6000 Blackwell, 96GB: the weights are a fixed
size and the KV cache is not, so what the weights leave spare is what a longer context grows into.
Gemma 4 31B it reaches 256k there against 32k on the AMD Radeon AI PRO R9700, 32GB, each the longest
window the calculator offers that the machine still holds it at.*

- **53 pages**, every one of them with something to say: the count of shared models that go further
  runs **2 to 12, median 7**. None came out empty, and the guard holds a page that does to silence.
- **39 are ordinary match-ups and 14 are two memory tiers of one machine.** The tier pages are the
  ones where it lands hardest, because the two names differ only by the size: *Of the 10 models both
  machines hold at 32k, 7 run to a longer window on the Mac mini M6, 32GB.*
- **The model named is the widest gap, measured as a ratio rather than a number of tokens**, so 32k
  to 256k leads over 128k to 256k. On the RTX PRO 6000 page that picks Gemma 4 31B it at 8× over
  Qwen3.8 27B at 2×, and Qwen3.8 27B is the stronger model, which is why the rule had to be written
  down rather than left to the page's own order.
- **The roomier machine's window is a prefilled link** into the calculator on that machine, that
  model and that context. 53 new links, one a page.
- **No new heading and no second table**, which is the condition the backlog item set. The pages
  gained about 85 words each.

**What was deliberately not claimed.** The sentence stops at "each the longest window the calculator
offers that the machine still holds it at" rather than calling the gap a memory gap. `longestContext()`
is capped by whichever runs out first, the machine or the model's own context limit, so on some rows
the shorter figure is the model's ceiling rather than the machine's. The wording says what each
figure is and lets it stand.

**The guard.** `checkSharedHeadroom()` is the mirror of `checkHeadroom()`, for the 53 pages that one
skips. It recomputes every figure from the data rather than reading it back off the page and holds
six claims: the machine named as the roomier one has the more usable memory, the shared-model count
is the data's, so is the count that goes further, the model named is the widest gap with both its
windows printed, the link opens that machine and model at that window, and a page where no shared
model differs says nothing while no other page says it at all. Proved by five breaks, each caught
with the page and the figure named: naming the tighter machine as the roomier one (212 problems),
taking the first shared model instead of the widest gap (50), dropping the paragraph (53), a
shared-model count off by one (53), and linking at the tighter machine's window instead of the
roomier one's (53).

**Where the code went.** `sharedHeadroom()` and `widestHeadroom()` are in `src/pagekit.ts` beside
`contextHeadroom()`, which they build on; `sharedLengthLine()` in `scripts/build-pages.ts` is the
wording, next to `sameListSection()` which answers the same question for the other 7 pages. Neither
`src/calc.ts`, `src/compute.ts`, `src/fit.ts` nor `data/*.json` was touched, and no figure moved.

**Verified**: 226 tests (222 before, four new in `tests/pagekit.test.ts`), typecheck clean, 248 pages
with every guard passing, and the full `npm run build` including `build:og`, `build:share` and
`build:functions`. Pages were read as rendered text, not as markup: the RTX PRO 6000 head-to-head and
the Mac mini M6 16GB-against-32GB page end to end, and the paragraph on six more.

**The deploy.** `dccdd93`, run 126, green at **04:52**.

**Both pull requests stopped merging, and both were repaired in this run.** The same pattern the log
has now recorded sixteen times: a branch touching `scripts/build-pages.ts` stops merging as soon as
main does. Both conflicts were import lists and nothing else, in `scripts/build-pages.ts` and
`tests/pagekit.test.ts`, every hunk a union. Resolved by keeping each branch's side and adding
`sharedHeadroom` and `widestHeadroom` to it, then verified on each branch rather than assumed: **234
tests, typecheck clean, 249 pages with every guard passing and the full build**, on both. PR #7 is
now `21a6bc8` and PR #8 is `7623325`, and each merges clean against `main` at `dccdd93`, checked with
a real merge. Their collision **with each other** is unchanged and its resolution is still in the
Ryan's-side item above; nothing in this run touched the `/best/` paragraph that is the one hunk in it
that can quietly lose a link.

**Continue next: the machine index at `/hardware/`**, still the biggest gap the log has found — no
page lists all 56 machines and the build writes nothing there. It is a new page, so it wants the PR
queue to clear. If #7 and #8 are still open at the next run, the push-shaped work left on the list is
thin: the leaderboard's 8,134px table on a phone, and the model page's call to action that now
duplicates a link in its own table. Both are judgement calls the backlog says to make only if the
page reads badly, so a run that reaches them should read the page first and be willing to close the
item instead of doing it.


### 2026-09-18 — a caveat about graphics cards stops appearing on pages with no graphics card

**Why this item and not the top one.** The top backlog item is still the question pages, and its one
live candidate — "how much does it cost to run a local LLM per month" — sits on helpers that only
exist on PR #8's branch. PR #7 and PR #8 are both still open, so a new page would be a third pull
request colliding with both. The last entry named the next push-shaped item down, and this run took
it.

**What the sentence was doing.** Every machine head-to-head closed its assumptions note with
*Graphics cards are priced as the card alone, so add the PC around one before comparing it with a
complete computer.* True, and the reason it exists is a real one: $1,299 buys a Radeon AI PRO R9700
or a Mac mini M6 with 32 GB, and both sit in the same tables here. But the note printed it whether or
not a card was on the page. The item guessed roughly 30 pages; measured, it is **53 of the 86**
machine head-to-heads where neither side is a card, and the same sentence sat under the comparison
table on **all 56 machine pages**. A note that answers a question the page does not raise is how a
reader learns to skip the notes, and these notes carry the things a reader does need — the usage,
the electricity price, the context, which speeds are estimated.

**What it says now**, worked out from the machines each page actually prints:

- **53 machine head-to-heads** where neither side is a card say nothing about cards.
- **12** where exactly one side is a card name it: *The Radeon AI PRO R9700, 32GB is priced as the
  card alone, so add the PC around it before comparing it with a complete computer.* That is a
  better sentence than the general one, because the reader no longer has to work out which column
  it means.
- **21** where both sides are cards say *Both are priced as the card alone, so neither figure
  includes the PC to put it in.* The general sentence was actively unhelpful there: it told a
  reader comparing two cards to add a PC around one of them.
- On the machine pages, the same rule reads the rows of the "Other machines to weigh against it"
  table. **35 of the 56** have exactly one card among their rows and now name it, **19** have more
  than one and keep the general sentence, and **2** — the Framework Desktop 495 and the Mac Studio
  M5 Ultra, 512GB, the two with no published price — have no card in the table and drop it.

**What was deliberately not claimed.** The two-card sentence nearly read "so the gap between them is
like for like". It was cut. Four of the seven cards are previous-generation and priced at what they
launched at, which the lede on those pages already says, so "like for like" would have been a second
claim about the price that the first one contradicts. What is true of all 21 is only that neither
figure includes a PC, so that is all it says.

**Nothing new is being asserted about a price.** The named-card wording is the caveat the lede of
those same pages has carried since 2026-09-16, moved into the note that gives the reader the
instruction. No figure moved, and `checkCardPrices()` — the older guard that refuses to print a
card's price anywhere that does not say what it buys — still passes on all 249 pages.

**The guard.** `checkCardScope()` recomputes the expected sentence from the data for every machine
head-to-head and every machine page, then reads the page's own assumptions note back and holds three
claims: the sentence appears where a card is priced, it is the right one of the three, and a page
with no card in it does not mention cards. Proved by four breaks, each caught with the page and the
sentence named: printing the old unconditional sentence everywhere (caught on the 53), dropping the
caveat entirely (caught on the 33), using the general wording where one card should be named, and
counting only a machine page's family rows and not its nearest-in-price rows.

**Where the code went.** `cardScopeNote()` is in `src/pagekit.ts` beside `priceWithScope()`, which is
where the rest of the card-price wording lives. It escapes the machine name it prints, because it
goes into the page as markup. Neither `src/calc.ts`, `src/compute.ts`, `src/fit.ts` nor `data/*.json`
was touched.

**Verified**: 222 tests (215 before, seven new in `tests/pagekit.test.ts`), typecheck clean, 248
pages with every guard passing, and the full `npm run build` including `build:og`, `build:share` and
`build:functions`. All three wordings were read as rendered text on the page, and a no-card
comparison was read end to end to check the note still runs on cleanly without it.

**The deploy.** `eae0d85`, run 124, green at **03:49**.

**Both pull requests stopped merging, and both were repaired in this run.** The push broke them
within minutes, which is the pattern this log has recorded fourteen times: a branch touching
`scripts/build-pages.ts` stops merging as soon as main does. Both conflicts were the same two files
and every hunk was a union — the import list, two guards sharing a closing brace, and two `describe`
blocks at the end of the test file. Resolved by keeping both sides of each, then verified on each
branch rather than assumed: **230 tests, typecheck clean, 249 pages with every guard passing and the
full build**, on both. PR #7 is now `f08d6cd` and PR #8 is `a058043`, and each merges clean against
`main` at `eae0d85`. Their collision **with each other** is unchanged and its resolution is still in
the Ryan's-side item above; nothing in this run touched the `/best/` paragraph that is the one hunk
in it that can quietly lose a link.

**Continue next: the machine index**, still the biggest gap the log has found — no page lists all 56
machines and the build writes nothing at `/hardware/`. It is a new page, so it wants the PR queue to
clear. If #7 and #8 are still open at the next run, the push-shaped work left on the list is the 21
machine head-to-heads that answer the memory difference with the models one holds and the other does
not and stop there, without saying what the memory buys on the models they share.


### 2026-09-18 — twelve links in one line become four short answers

**Why this run pushed to main instead of opening a third pull request.** The top backlog item is
still the question pages. What is left of it is one candidate that has to wait — "how much does it
cost to run a local LLM per month" would sit on the helpers PR #8 adds — and two that the last
entry said to read honestly before writing a line. Reading them closed both; the backlog item above
has the reasoning and neither page is written. A new page is a pull request, PR #7 and PR #8 are
both open and already collide with each other in six files, and a third would collide with both. So
this run took the next item that lands live: the wall of head-to-head links at the foot of every
machine page.

**What changed.** Those links are grouped now, by the question each comparison answers, and each
group opens by saying what it is. The Mac Studio M5 Max, 128GB page used to print one line of ten:
`vs Mac mini M5 Pro, 24GB · vs DGX Spark, 128GB · … · vs Mac Studio M5 Max, 48GB · vs Mac Studio
M5 Max, 64GB · vs Mac Studio M4 Max, 128GB · all of them`. It now reads: *Head to head with another
computer: Mac mini M5 Pro, 24GB · DGX Spark, 128GB · GMKtec EVO-X2, 128GB · MacBook Air M5
(15-inch), 16GB · MacBook Pro M5 Pro (16-inch), 64GB. With a graphics card: RTX PRO 6000 Blackwell,
96GB · Radeon AI PRO R9700, 32GB. With the same machine at another memory size: 48GB · 64GB. With
the machine it replaced: Mac Studio M4 Max, 128GB.*

- **51 of the 56 machines carry the note**, in up to **four groups**. The other five are in no
  head-to-head at all, which is its own backlog item and unchanged by this.
- **23 machines are in one head-to-head, 14 in six or more**, and the two dearest cards in 12 each.
  The RTX PRO 6000's line was the item's own example; it is two labelled sentences now, cards first
  because that is the page the reader is on.
- **The memory group drops the repeated name**, which was the half of the item that was a fault
  rather than a length: 18 memory-tier pairs, both sides, so **36 links** that used to print the
  page's own machine name back at it now print the size alone.
- **13 previous-generation Macs are in exactly one head-to-head**, and it now says what it is:
  *Head to head with the machine that replaced it: Mac mini M6, 16GB*, where it read `vs Mac mini
  M6, 16GB`. The current machine's page says *the machine it replaced*, from the same data.
- **No link changed target, and none was added or dropped.** Every count the build prints about
  inbound links is unchanged: 133 head-to-heads, each linked from both sides and from at least 3
  pages in all.

**One trade-off, taken deliberately.** The links lost their `vs ` prefix, so a link now reads
"DGX Spark, 128GB" rather than "vs DGX Spark, 128GB". That is a weaker piece of anchor text on its
own, and it is what buys the grouping: with the sentence already saying "Head to head with another
computer", the prefix repeated the lead on every link and made the memory group unreadable. The
sentence carries the sense instead of each link carrying it eleven times.

**The guard.** `checkHeadToHeads()` already held every comparison to being linked from both of the
pages it compares. It now also reads each machine page's own note back and holds four more claims:
every pair named exactly once, the text of each link worked out **from the data rather than from the
grouping** (the memory size where the two sides are one machine, the short name otherwise), the link
to `/compare/` present, and the page's own name never printed. Proved by four breaks, each caught
with the page and the figure named: labelling a memory pair with the full machine name, labelling a
rival with its memory alone, listing one pair in two groups, and dropping the `/compare/` link. A
fifth — dropping a whole group — failed earlier still, in the older half of the same guard, with
"36 head-to-head links missing".

**Where the code went.** `headToHeadGroups()` is in `src/versus-card.ts`, beside the five rules that
cut the pairs, because it reads `memoryTierNames()` and `generationNames()` and a page cannot be
allowed to group a pair the build did not make. `headToHeadNote()` in `scripts/build-pages.ts` is
the wording. Neither file is `src/calc.ts`, `src/compute.ts`, `src/fit.ts` or `data/*.json`, and no
figure moved. It also keeps this run clear of PR #7 and PR #8: they touch
`scripts/build-pages.ts` too, but their hunks are appended constants, guards and `write()` calls at
the end of the file, and this one is the machine-page template and the head-to-head guard.

**Verified**: 215 tests (210 before, five new in `tests/versus-card.test.ts`), typecheck clean, 248
pages with every guard passing, and the full `npm run build` including `build:og`, `build:share` and
`build:functions`. All 51 notes were read as rendered text, and two machine pages end to end. The
shortest note is nine words plus the line to `/compare/`; the longest is 418 characters in two
sentences, where it was one line of twelve links.

**The deploy.** Run 122 on `69a128b` finished **green at 02:54**, so the grouped notes are live on
all 51 machine pages. One push this hour, so nothing was cancelled; the entry two below explains why
that is worth watching.

**The state of the two open pull requests, checked rather than assumed.** Both are still open, both
still merge clean against `main` at `68f8011` — tested with a real merge, not guessed — and `main`
has moved only in `seo/LOG.md` since they were opened. Their collision with each other is unchanged
and the Ryan's-side item above has the resolution.

**Continue next: the machine index.** The new backlog item above is the biggest thing this run
found: no page on the site lists all 56 machines, and the build writes nothing at `/hardware/` or
`/models/`, so both addresses most likely 404 (unverifiable from here — the egress policy refuses
`sunkcost.ai`). It is a new page and therefore a pull request, so it wants the queue to clear first.
If PR #7 and PR #8 are still open at the next run, the useful work is push-shaped again: the
assumptions note that mentions graphics cards on the ~30 comparison pages where neither side is a
card is the next one down the list.


### 2026-09-18 — what a token costs, which is the sum every other page is an instance of

**Took the top backlog item, and the candidate the last three entries all named.** "local LLM vs
API cost". The reason it was worth doing is the one that item gave: it is the site's whole thesis,
the home page was the only thing that stated it, and every figure it needed was already computed.
It is now **[PR #8](https://github.com/rlindsey2/sunkcost/pull/8)**, at `/local-llm-vs-api-cost/`.

**The page's own idea, and the thing that made it worth a page rather than a paragraph.** Every
pay-back figure on this site is counted in months, and months depend on how hard you work the
machine. Counted in **tokens** it does not: with the API price held flat, which is the calculator's
default, the saving on each million is a constant, so the count that covers the hardware is the same
at every level of use and only the date moves. That reframing is what the page is built on, and it
turns the site's argument into one number a reader can hold.

- Renting a million tokens of **Qwen3.8 27B** costs **45.6c** at the default 15:1 mix. Generating
  the same million on the **$3,499 Mac Studio M5 Max, 64GB** the calculator opens on costs **1.7c**
  of electricity, **26 times less**. The machine is **7.97 billion tokens** of that gap.
- The same 7.97B arrives in **436 years** at 50k tokens a day and **13 months** at 20M. Identical
  count, five dates. The page prints the count in every row, which is the point.
- **The mix moves the answer further than the hardware does.** Writing and drafting at 0.5:1 pays
  the machine back in **2.2B tokens**; retrieval at 20:1 needs **8.52B**. Across the **30** current
  machines that run the same model, a million tokens costs **1.6c to 4.3c** to generate, while their
  prices run **$1,269 to $18,000**. Four times the spread in what you do with it, against less than
  three in what you buy.
- **Where renting wins, the page says so.** Of the **949** pairings the site can price, electricity
  beats the API on **892**. On **37** the model is listed free by the cheapest host, and
  `models.json` already carried the note saying a free endpoint cannot be beaten on price. The
  remaining **20** are all one model: Devstral Small 2 24B, a dense 24B priced as gpt-oss-20b, which
  moves 3.6B parameters a token against its own 24B.

**The first draft asserted the generic version of that last finding** — "losing happens where a
dense model is slow on the machine that holds it" — and the data said something much sharper: all
20 are the same model, and the loss is as much about the stand-in price it borrows as about the
machine. Counting it was one line and the sentence says more for being counted.

**Four other things did not survive reading the page rendered.** A clause in the falling-prices note
printed twice, because it was sliced out of `api_decline.note` with `split('.')` and the note
already opened with it; it is written out and cited now instead. A sentence began in lower case
after a colon. A claim that 109 years at light use "is the honest answer for most people" was
opinion dressed as arithmetic, and is now the figure and what it means. And the mix table marked its
default row with the leaderboard's `is-frontier` class, which on a phone is styled as a group
heading and would have broken that row's layout; it carries a `c-quant` marker like every other
qualified figure on the site.

**The guard.** `checkTokenCost()` recomputes every model the machine holds, both of its prices, the
multiple between them, the constant itself at all five levels, every mix, and the two ends of the
per-machine spread. Proved by breaking five claims, each caught with the figure named: dropping the
cheapest model, overstating the multiple, printing the stand-in wattage as if it were measured,
dropping a level of use, and **switching `api_decline.default_on` to true** — the one that matters,
because it makes the page's central claim false, and the guard says exactly that. `defaults.json`
was restored from a copy taken first and shows no diff; no data figure was changed.

**The share card.** `/og/local-llm-vs-api-cost.png`, from the same `listCardSvg` the other four list
pages use and cut from the same `tokenCosts()` the page is cut from. Drawn first with "26× cheaper
to generate" in the middle column, which wrapped onto two lines on all five rows — caught by opening
the PNG, not by a test. It carries the multiple alone now.

**A mistake worth recording, because it cost twenty minutes and will happen again.** Proving the
guard means breaking the page on purpose, and the first round undid each break with
`git checkout scripts/build-pages.ts`. That file held an hour of **unstaged** work, so the checkout
restored it to HEAD and threw the page away. The built HTML in `public/` proved what the output
should be, and the source was reconstructed from the transcript. **Before breaking anything on
purpose, `git add` the work or copy the file aside, and restore from the copy, never from the
index.** The second round did that and cost nothing.

**Verified**: 218 tests (210 before, eight new across two files), typecheck clean, 249 pages with
every guard passing, and the full `npm run build` including `build:og`, `build:share` and
`build:functions`. The page was read rendered out of `public/local-llm-vs-api-cost/index.html` end
to end before committing, and so were the three pages it is linked from.

**Where the links are.** The footer of all 249 generated pages; all 55 model pages, in the "What it
costs either way" paragraph where the rental price is already the subject; and `/best/`, whose every
pay-back figure divides the same gap.

**PR #7 was checked first and needed nothing**: still open, mergeable, its base already `94c354a`.

**The overlap between the two PRs was then measured rather than estimated, and the first estimate
was wrong.** This entry and PR #8 first said the two collide in "the footer line and the import
list" and that nothing else overlaps. A real test merge of the two branches says **six files**:
`scripts/build-og.ts`, `scripts/build-pages.ts`, `src/list-card.ts`, `src/pagekit.ts`,
`tests/list-card.test.ts` and `tests/pagekit.test.ts`. Each still merges clean against `main` alone,
so only the second one in pays it. Every hunk but one is a union of two additive changes and keeping
both sides is the whole job. The exception is the closing note on `/best/`, where the two PRs made
different edits to the same paragraph: taking one side whole drops the other page's link. The
Ryan's-side item above has the detail, and both the log and the PR body are corrected.

**The deploys, and one thing to know about pushing twice in a run.** This run pushed the log twice,
the second time to correct the overlap figure above. `deploy.yml` sets `cancel-in-progress: true` on
the `deploy-production` group, so the second push **cancelled run 119 mid-flight**; run 120 on
`509e01d` carried the same site tree plus the correction and finished **green**. Harmless here,
because a cancelled deploy leaves the previous one published and the superseding run publishes the
same pages. Worth knowing anyway: a run that pushes to main more than once will see the earlier
deploy cancelled rather than completed, and a `cancelled` conclusion on the earlier run is that, not
a failure.

**Continue next: read the two remaining question-page candidates honestly before writing either.**
"RTX 3090 for local LLM worth it" and "is a Mac mini good for local LLMs" may both be answered by
the machine pages already, and the item above now says to close them rather than write a duplicate
if that is what a look finds. The stronger new candidate this run turned up is **"how much does it
cost to run a local LLM per month"**, which nothing answers and for which `calc.ts` already computes
both sides; it is in the backlog and it should wait for PR #8, because it would sit on the same
helpers. Two pull requests are now open and both want watching: a branch touching
`scripts/build-pages.ts` has gone un-mergeable within hours every time.

### 2026-09-18 — the question this site could not answer: which graphics card

**Took the top backlog item, and it has been the top one for fifteen runs.** The question pages.
Eight runs in a row deferred them for one reason — a new page type is a pull request, and PR #3 was
open and costing a merge repair most hours — and the last entry said plainly that the reason had
expired, because PR #3 merged at 23:57. It had. Nothing was in the way, so this run took the item
rather than a ninth deferral, and picked the candidate the last three entries all named:
**"best GPU for local LLMs"**.

**What was missing.** Nothing on the site filtered the list to graphics cards. `/best/` answers by
usage, `/leaderboard/` by model, and the 56 machine pages one machine at a time, so a reader who
had already decided to buy a card had no way to cut 56 machines down to the seven that are cards.
A search of what else ranks for this found one shape everywhere: a VRAM tier list ordered by
opinion. That is the part this site can answer with arithmetic, and none of them prices a card
against renting the same model, which is the whole of this site's thesis.

**The page is `/best-gpu/`, opened as PR #7, and every finding on it came out of the data rather
than out of a view about cards.**

- The strongest open model any card here holds is **Qwen3.8 27B**, and the cheapest card that holds
  it is the **$1,299 Radeon AI PRO R9700**. The **$18,000 RTX PRO 6000 Blackwell** holds 33 of the
  39 current models against the R9700's 27, and runs the shared one at 78 tok/s against 30. It does
  not run a better model. That is the lede, and it is the sentence the whole page is built on.
- **Six of the 34** scored current models fit no card at all at 32k, and the three strongest open
  models on the site are among them. GLM-5.3-Flash is 189 GB of weights; the cheapest machine that
  runs it is a $10,799 Mac Studio, and the dearest card holds it no better than the cheapest does.
- On **two of the seven**, the complete computer nearest in price holds more models than the card:
  the Mac Studio M5 Ultra, 256GB holds 38 where the RTX PRO 6000 holds 33, and the Framework
  Desktop, 32GB holds 24 where the RTX 4080 holds 13, for $70 more and with a computer attached.
- Per usable gigabyte, **one card** beats the cheapest gigabyte in a complete computer: the RTX 3060
  at $30 against the Corsair AI Workstation 300 at $35 — and the $35 comes with the computer.
- Pay-back at the five levels of use the calculator names. Nothing pays back at ordinary use. The
  quickest figure anywhere on the page is **4.0 months**, on the $329 RTX 3060 running Ministral 3
  8B at 20M tokens a day, which the answer box says in as many words is the cheapest card working a
  small model rather than the best card working a good one. The slowest is 2,273 years.

**One claim did not survive being checked, and it was mine.** A first draft closed the money section
with "bandwidth, which is the one thing no unified-memory box on this list matches". It reads well
and it is false: only the RTX 5090 and the RTX PRO 6000 clear the Mac Studio M5 Ultra's 1,200 GB/s,
and **five of the seven cards are slower than that machine**. The sentence is counted from the data
now rather than asserted, and it says more for being true. Two smaller things went the same way:
the "three strongest open models" claim is now a count of how far down the index the cards reach,
and the title stopped naming seven cards in hard type.

**The guard.** `checkBestGpu()` recomputes the three things the data can move underneath this page —
which cards there are, what each holds counted the way its own machine page counts it, and the
lede's own answer — and stops the build where the page and the data disagree. Proved by breaking
all four claims: dropping the cheapest card from the table failed on two counts, printing one model
more than a card holds failed on seven, naming the site's best model in place of the best a card
holds failed on one, and dropping a usage level from the pay-back table failed on one. A first
attempt at that last break also cut a column, and failed earlier still inside `stack()`, which is
the older guard doing its job.

**The share card.** `/og/best-gpu.png`, from the same `listCardSvg` the other four list pages use
and cut from the same `graphicsCards()` the page is cut from. Drawn first with a "Strongest: …"
line under each card name, which at seven rows sat on the rule above the next one — caught by
opening the PNG and looking at it, not by a test. It carries name, price and count now, and the
count column makes the page's point without a word: $18,000 → 33, $1,299 → 27, $329 → 11.

**Where the links are.** The footer of all 249 generated pages, which is how `/how-much-memory/` is
reached; the note on `/best/`, where cards are already the subject of a sentence; and the lede of
all seven card pages, which is the page a reader is on when the question occurs to them.

**Verified**: 218 tests (210 before, eight new across two files), typecheck clean, 249 pages with
every guard passing — including `checkCardPrices()`, which independently holds every card price on
the new page to saying it buys the card alone, and `checkTables()`, which holds all three tables to
reading as a block on a phone. The full `npm run build` including `build:og`, `build:share` and
`build:functions`. The page was read rendered out of `public/best-gpu/index.html` end to end before
committing, which is where the bandwidth correction came from along with prices printing in cents,
a number word opening a sentence in lower case, "Run the numbers on X on the Y", and a paragraph
that named the same machine three times.

**`main` moved mid-run and was merged in rather than ignored.** PR #6 landed at 01:0x, raising the
usage slider from 20M to 100M tokens a day. `bestUsageLevels()` clamps each label to the maximum
and the top label's own `up_to` is 20M, so **the five levels this page prices are unchanged** — but
that was checked by merging and rebuilding, not reasoned about and left. The whole suite and the
whole build pass on the merge.

**Continue next: the next question page, and the reason to keep going is now evidence rather than
hope.** This one took a single run start to finish, because `/how-much-memory/` had already paid for
the page-type work and `listCardSvg` already existed. The remaining candidates, in the order they
are worth writing: **"local LLM vs API cost"**, which is the site's whole thesis and which only the
home page states; then "RTX 3090 for local LLM worth it" and "is a Mac mini good for local LLMs",
both of which need a hard look first — the per-machine pages may already answer them, and
`/best-gpu/` now answers a good part of the 3090 one, so a second page saying the same thing in
other words is the duplicate this site should not create. PR #7 is open and wants watching: a branch
touching `scripts/build-pages.ts` has gone un-mergeable within hours every time, so whoever reads
this should expect to repair it rather than leave it.

### 2026-09-18 — PR #3 merged, and what the merge commit brought with it

Not an hourly run: the session that opened PR #3 at 04:54 on 2026-09-17 was woken by the merge
event and checked the result.

**The `/compare/` head-to-head index is live.** Merged 23:57, deploy run 111 on `0030ccd` green at
00:00. Merged main was verified here rather than assumed: `npm ci`, 210 tests passing, typecheck
clean, 248 pages built with every guard passing, and the index itself read back. It was written
against 28 machine match-ups and 47 model ones; nineteen hours of other runs have taken it to 86
and 47, and every figure on it still comes from the comparison page behind it, because the rows
are built from those pages' own helpers. The one sentence it asserts of its own — none of the 51
machines compared holds more than 38 of the 39 open models, and two of them do — is still true of
the data as it stands today.

**One thing to know about how it merged.** The Ryan's-side item asked for a squash, because the
branch's history carried `public/og/og/` — 1,993 build-output PNGs. It went in as an ordinary
merge commit, so those blobs are reachable from `main` now: a fresh clone's `.git` is 146 MB,
144.4 MB of it blobs. Nothing is checked out and nothing built is affected, the deploy workflow
checks out shallow, and the only remedy rewrites `main` and force-pushes it. That is not an
agent's call, so it is recorded above and left alone.

**Continue next:** nothing from this session. No PR is open; the hourly runs have the backlog.

### 2026-09-17 — the watts nobody measured stop reading as measurements

**Took the top open backlog item that goes to main.** The item above it on the list is the
question pages, top of the backlog by traffic and unblocked for six runs now; every one of those
six left it for the same reason, which is that a new page type is a pull request and PR #3 has
cost thirteen merge repairs in a day. This run made the same call and it should be said plainly
so the next run can overrule it: nothing changed this hour to make that trade better, and the
item below it was one the last entry itself named as the cheapest honest thing left.

**What was wrong, and it was bigger than the item said.** Electricity is the running cost in
every pay-back sum on this site, and for **30 of the 56 machines the data holds no power figure
for the machine at all** — it borrows the nearest one it has, because Apple has published nothing
for the 2026 Macs and nobody has put a meter on several of the Strix boxes. The machine pages
said so and the calculator said so. The comparison pages printed "140 W" and stopped, on **43 of
the 55 head-to-heads that print one**. The 12 generation pages already said it, because there the
borrowed figure is the *other column's* own, which is what turned the whole thing up.

**The find of the run, which the item did not know about.** Four same-silicon pages had a worse
version of the same fault, in prose rather than in a table: they said "**Both draw 133 W under
load**, and this page prices the electricity into both." The data measured the Framework Desktop
at 133 W and borrowed that figure for the Beelink, the Minisforum, the Corsair and the HP, so the
sentence asserted a measurement nobody took and the equality it reported was the data agreeing
with itself. The MacBook Air pair was the same shape with neither side measured: two laptops
sharing a desktop Mac mini's stress figure, printed as "Both draw 65 W under load". Those pages
now say the power row is not two measurements, name which side is borrowed, and say the matching
is a fact about the data rather than about the machines.

**What the pages say.** The figure carries the marker at the row, `<span class="c-quant">stand-in
</span>`, which is exactly how a card-only price is marked and which the compare table already
drops onto its own line on a phone. Under the table, the 43 pages that had nothing get a note
that does three things: it says the figure is not a figure for that machine, it says the machine's
own page names what it borrows and why, and it says that borrowed number is what prices the
electricity in its own pay-back column. Three shapes, by what the data holds: one side borrowed,
both sides borrowed, and both borrowed at the same number. That last one splits again — two memory
tiers of one machine share a chip, so equal watts is what a reader expects there and calling it a
non-finding would be answering nobody's question; those pages say the row shows one borrowed
figure printed twice.

**Where it is not said twice.** A generation page and a same-silicon page already explain their
own power row further down, at more length and with more to say, so the note under the table is
suppressed on both rather than repeated. The marker still goes on the row, so the reader meets the
fact at the figure either way.

**The guard.** `checkStandInPower()` holds three claims wherever a power figure prints. The
comparison row prints exactly what the data says, marker and all, which means a borrowed figure is
always marked and **a measured figure never wears the marker** — without that second half the
marker means nothing. Every page carrying a borrowed figure says so in words rather than leaving
it to a small grey span. And every such comparison says what that number is paying for. All three
were proved by breaking them: taking the marker off the row failed 55 pages, emptying the note
failed on "only the marker says so" and on "does not say what its borrowed power figure is paying
for", and marking every figure failed on the count. Two tests cover the two new helpers.

**A smaller thing fixed on the way.** The machine pages printed the data's own key as English:
"140 W (stand in)" and "600 W (third party measured)", both from a `replace(/_/g, ' ')`.
`powerSourceLabel()` writes them as "(stand-in)" and "(measured by a third party)". The
calculator's own panel still does the old thing, which is the new backlog item above, and it is a
pull request rather than a push because it is `src/render.ts`.

**Verified**: 205 tests, typecheck clean, 247 pages with every guard passing, and the full
`npm run build` including `build:og`, `build:share` and `build:functions`. Read a comparison page
end to end out of `dist/` and all four note shapes rendered before committing, which is where
three rewrites came from: the one-sided note named the machine three times in four sentences, the
same-silicon sentence opened "Read the power row with that in mind" two clauses after another
"that", and the memory-tier pages were being told their equal watts said nothing about either
machine, which on two tiers of one Mac mini is answering a question nobody asked. Pushed as
`74db430`; **deploy run 110 was green at 23:56 and the pages are live**.

**Then one more line, from re-reading the pushed diff.** The same-silicon branch for a pair whose
watts differ *and* where a figure is borrowed said "where one figure is a stand-in rather than a
measurement" — wrong if both sides were borrowed, and it said in one clause what the very next
sentence says properly. No page reaches that branch today, because the three same-silicon pairs
with unequal watts have a real figure on both sides, but the same rule applies here as on the
generation pages: the branch exists because the data will change and the claim must not. It names
the gap and leaves the caveat to the sentence that explains it. Pushed with this entry as
`be924f5`.

**Worth knowing, because every run does what caused it.** `deploy.yml` has
`concurrency: deploy-production` with `cancel-in-progress: true`, so **a run's second push kills
its own first deploy**. This run pushed the code at 23:49 and the log four minutes later, and run
109 shows in the Actions list as a cancelled build with Publish skipped — not a failure, and
nothing was lost, because run 110 carried both commits and published at 23:56. But the shape of
this job is push the work, then push the log, so the cancelled run in the middle is the normal
case rather than a warning, and a future run reading its own Actions list should not chase it. To
see the deploy that actually published, read the newest run rather than the one matching the
commit you pushed first.

**PR #3 needed no repair this hour, for the first time since it opened — and then Ryan merged
it.** The check came first: the standing lesson on that branch is that a clean `git merge-tree` is
not enough, so the merge was built and read rather than trusted, and it came back at 248 pages,
134 comparisons, 210 tests, typecheck clean, every guard passing including the new one and the
branch's own `checkCompareIndex()`. The `/compare/` index prints no power figure anywhere and this
change adds no comparison and no kind of match-up, so its counts and its section copy were
untouched and nothing was pushed to the branch. **Ryan merged it at 23:57**, while this entry was
being written, which is why this run's log push came back rejected — not a sibling session this
time but the merge commit. Merged main was rebuilt here afterwards and the full `npm run build`
passes on it, `checkStandInPower()` and `checkCompareIndex()` side by side. The session that
opened that PR was woken by the merge and has its own entry above, including the measured cost of
its going in as a merge commit rather than a squash; nothing here duplicates it and Ryan was not
pinged, per the standing rule on that PR.

**Continue next: the question pages, and the reason seven runs in a row deferred them is gone.**
Every one of those seven made the same call — a new page type is a pull request, a pull request
was worth nothing to search until Ryan merged it, and PR #3 was already open and costing a merge
repair most hours. **PR #3 merged at 23:57 and no pull request is open now.** So the next run
faces the choice on its merits rather than on the cost of a second branch, and it should take it:
"best GPU for local LLMs" is the strongest candidate, nothing on this site filters the list to
cards, and `/best/` answers by usage rather than by part. Worth knowing before starting that a
branch touching `scripts/build-pages.ts` still goes un-mergeable within hours, so the run that
opens it should expect to repair it in later runs rather than leave it. If it is deferred an
eighth time, say plainly what the new reason is, because the old one has expired. The cheapest
items left that go straight to main are the assumptions note's card sentence, which answers a
question ~30 pages do not raise, and grouping the head-to-head lists on the RTX PRO 6000 and Mac
Studio M5 Max pages.

### 2026-09-17 — the Macs nobody sells any more meet the ones that replaced them

**Took the top open backlog item.** The last two entries both named the question pages as what to
continue, and both named "best GPU for local LLMs"; both also said a new page type is a PR, and PR
#3 has now cost thirteen merge repairs in a day. The item above it goes straight to main and was
live in four minutes. The judgement is the same one the last run made and it is worth stating
plainly so the next run can overrule it: a PR here has been worth nothing to search until Ryan
merges it, and a push has been worth something the same hour.

**What was wrong.** Thirteen Macs on the list are discontinued — the M4 minis, the M4 Pro minis,
the M4 Max Studios and the M3 Ultra Studios — and they appeared in **no head-to-head at all**. Every
other pairing rule takes current machines only, for good reasons: a flagship is the middle of a
family's current range, a memory tier is a choice you can still make, and a same-silicon pair is two
boxes you can both order. But the machine you already own is the one you are deciding whether to
replace, and a used one is the cheapest way onto this list.

**The rule.** `generationPairs()` reads the successor out of Apple's own chip names, which carry a
generation and a tier: the newest machine still sold with the **same chip tier and the same memory
in the same case**. No other family on the list names its parts that way, and no other family needs
it — the four previous-generation cards are already in the card grid, and an RTX 4090 and an RTX
5090 carry different amounts of memory anyway. **12 new comparisons, 133 in place of 121**, and
**51 of the 56 machines are in a head-to-head where 36 were**: the 12 previous-generation Macs whose
successor is priced, plus the Mac Studio M5 Max 36GB and two M5 Ultras, which had no pair either.
The thirteenth Mac, the M3 Ultra 512GB, gets no page: its successor has no published price, and
pay-back without a price is not a page.

**What the pages say, and what only they could say.** The rule holds the memory equal on both sides,
so every one of these pairs holds exactly the same models at every context — which means the newer
chip buys no room, and the reader's question is what it does buy. It buys bandwidth, and the section
names both figures and says why that is the one to watch: decoding reads the whole model out of
memory for every token it writes. The second thing is the price. The older machine's price in this
data is the one it launched at, so the section says when its maker stopped selling it, reading the
date out of the availability note rather than holding it in a second place, and hands the reader the
calculator with that machine loaded so they can put in what a used one would actually cost them.

**The find of the run, and it is the reason the section was worth writing.** On every one of these
12 pairs the newer machine's wattage is a **stand-in, and the figure standing in for it is the older
machine's own published one** — Apple has published nothing for the 2026 machines, so the data
carries the previous chip's number. Two equal figures in the Power row therefore read as "the newer
chip is no more efficient" when what they mean is "nobody has measured it", and the electricity
priced into *both* pay-back columns comes from the older machine in the same comparison. All 12
pages now say so in a note under the table. Everywhere else on the site a stand-in still prints
bare, which is the new backlog item above.

**The lede, on 30 pages rather than 12.** On these pages the discontinued machine is the cheaper
one, so it is the one the lede hands the win to: "The Mac mini M4, 32GB costs $300 less… pays for
itself sooner, in 13 years against 17." Left there, that sells a machine nobody sells. The lede now
closes by saying that every figure for a previous-generation side is priced at what it launched at
rather than at a price you can pay today — last, where it qualifies the price and the pay-back
together. That reaches the 18 card head-to-heads with an older card in them as well, which ticks
the other backlog item above: the RTX 3060 "costs $1,670 less" now carries the fact that $329 is a
launch price for a two-generation-old card.

**The guards.** `checkGenerationPairs()` holds five claims: the pair really is one family, one chip
tier and one memory size a generation apart in the data; the page says the older side's price is a
launch price; it names both bandwidth figures and calls the newer one wider only where the data says
it is; it says where a power figure is standing in; and it hands the reader a way to price the older
machine at what they would pay. Both new claims were proved by breaking them — the first attempt at
the bandwidth check passed a page that had stopped naming the figures, because the comparison table
prints both on its own, so it now asks for the sentence in the form the data supports. Five new
tests cover the pairing rule, the chip-name reader, the naming, the date and the lede clause.

**Verified**: 203 tests, typecheck clean, 247 pages with every guard passing, and the full
`npm run build` including `build:og` (133 head-to-head cards), `build:share` and `build:functions`.
Read four of the new pages and two of the card pages rendered out of `dist/` before committing,
which is where three fixes came from: the launch-price clause sat next to the price where it read as
being only about the price, the core-count sentence named both machines in full twice, and the
description led with "19 of the 39 models fit, 19 fit" where it now leads with the bandwidth.
Pushed as `32ad604`; **deploy run 107 was green at 23:02 and the pages are live**. The push was
clean — no sibling session this hour.

**Then PR #3, its thirteenth repair, and the standing lesson on that branch paid for itself again.** The merge
was clean — no conflict at all, for the first time in a day — and the page was still wrong twice.
Its section copy said "Four kinds of match-up" over a table that now carries five. And the new rule
put **discontinued machines into the index's compared set for the first time**, so its own answer
box had started recommending them: the cheapest machine there holding 38 of the 39 models is now the
Mac Studio M3 Ultra, 256GB at $7,099, and the cheapest at all is the RTX 3060 at $329, both prices
those machines launched at and neither payable. One sentence now covers whichever of the two it
names are discontinued. Rebuilt and re-read on the merge: 248 pages, 134 comparisons, 208 tests,
typecheck clean, the full build. Pushed as `8bd24d3`. Ryan was not pinged, per the standing rule on
that PR.

**Continue next:** the question pages, which have now been the top of the backlog and unblocked for
five runs. "best GPU for local LLMs" is still the strongest candidate and nothing on the site
filters the list to cards. It is a new page type, so it is a PR, and that is the thing to decide
first rather than halfway through: PR #3 has been open since yesterday, has cost thirteen repairs, and a second open branch
touching `scripts/build-pages.ts` doubles that cost until Ryan merges. If that is judged too dear
again, the cheapest honest item on the list is the stand-in power figures, which is one span on a
table row across every comparison page and a guard to hold it.

### 2026-09-17 — the same box from six makers gets its price put side by side

**Took the top open backlog item rather than the "continue next" of the two entries above.** Both
named "best GPU for local LLMs" as the next question page, and both were written by runs whose own
work was a PR repair. The question page is a new page type, so it is a PR, and there is already one
PR open that has cost twelve merge repairs in a day. The item above it goes straight to main and was
live within six minutes. The question-page item is still the top of the backlog by traffic and is
still unblocked; this run bought a deploy instead of a fourth open branch.

**What was wrong.** Seven Strix Halo machines in the data carry the same 40-CU Radeon 8060S with
128 GB at 256 GB/s and 96 GB of it usable: the Framework Desktop at $3,449, the GMKtec EVO-X2 at
$3,500, the EVO-X3 at $3,600, the Minisforum MS-S1 Max at $3,799, the Beelink GTR9 Pro at $4,349,
the Corsair AI Workstation 300 at $4,700 and the HP Z2 Mini G1a at $5,544. That is **$2,095 between
the cheapest and the dearest for the same parts**, and nothing on the site put any two of them
together. Four were in no head-to-head at all. The flagship grid takes one machine per family and
all eleven Strix boxes are one family; the memory-tier rule needs the same maker.

**The rule, and why it is not a grid.** `sameSiliconPairs()` groups the current, priced machines by
family, GPU, memory, bandwidth and usable memory, and puts **each box against the cheapest box in
its group**. A grid over seven boxes would be 21 pages writing one answer, because every box in a
group holds the same models at the same speed; the question a buyer actually has is what the dearer
box charges on top of the cheapest one that does the same work. **8 new comparisons**, and **36 of
the 56 machines are in a head-to-head where 30 were**. Six machines gained their first: the Beelink,
the Minisforum, the EVO-X3, the HP, the Corsair 128GB and the 13-inch MacBook Air. Two pairs come
from outside the Strix group and are both real searches — Framework Desktop against GMKtec EVO-X2 at
64GB, and MacBook Air 13-inch against 15-inch, which is the same M5 and the same 16 GB $200 apart.

**The honesty problem these pages carry, which is the find of the run.** The site holds *measured*
throughput for several of these boxes, and the figures disagree on identical silicon: the GMKtec
EVO-X2 benches Qwen3 30B at 86.1 tok/s where the Framework Desktop benches it at 66.3, and
gpt-oss-120b at 53.4 against 50.05. Those are different people's runs with different runtimes and
builds, not a difference between two machines that are the same part. `machineVerdict()` would have
written "the GMKtec EVO-X2 is about 1.3× faster" straight into the lede. It cannot now: on a
same-silicon pair it names both figures and says the gap is between the sources rather than between
the machines, and where the two figures are equal the page says so and says why (decoding reads the
weights out of memory, and both read them at the same GB/s). None of the 8 pages hits the unequal
branch today, because on every one of them the strongest shared model is estimated on both sides;
the branch exists because the data will change and the claim must not.

**What the pages say.** The lede opens with the answer: these two are the same machine inside, this
GPU, this much memory at this bandwidth, and both hold the same N models. Then a section that gives
the reason (fit is usable memory and usable memory is equal, so they hold the same models at every
context from 4k to 256k), names the price gap as the whole question, and prices the power where the
two differ — the EVO-X2 draws 150 W against the Framework's 133 W, so on that pair the pay-back gap
is the price *and* 17 W, and the page says both rather than only the price. It closes by saying
what the site does not measure: case, ports, cooling, warranty, who picks up the phone. That is the
list a reader has to weigh against the money, and pretending the site has an opinion on it would be
the dishonest version of this page.

The HP is the one pair where the two chips are not listed identically, `Ryzen AI Max+ PRO 395`
against `Ryzen AI Max+ 395`. The page says so rather than smoothing it over, and says the graphics
half of the two names is the same and the graphics half is what runs the model.

**Titles.** Both sides of one of these pairs carry the same memory, so the title says the size once:
"Framework Desktop vs Corsair AI Workstation 300, 128GB" rather than the size twice. That took the
two longest of the new titles under the 60-character limit, and the build's own note went from
**9 titles over 60 to 7** — the two it lost are these, and no existing title changed.

**The guards.** `checkSameSilicon()` holds every such page to three claims: the pair really is one
GPU with one memory size at one bandwidth in the data; the money the page names is the money between
the two prices; and no page calls one side faster than the other. `checkHeadroom()` learned that a
same-silicon page says "memory separates them nowhere" under its own heading, and now also requires
the claim itself on both kinds of page rather than only the heading. Two new tests: the pairing rule
(each box against the cheapest, every figure equal on both sides, cheapest side first, and the count
is one per group member rather than a grid) and the lede (never "× faster", always the opening
sentence and the memory-and-bandwidth figures).

**Verified**: 198 tests, typecheck clean, 235 pages with every guard passing, and the full
`npm run build` including `build:og` (1,894 cards + 121 head-to-head cards), `build:share` and
`build:functions`. Read four of the eight pages rendered out of `dist/` end to end before
committing, which is where three fixes came from: "the pay-back table above" pointed at two
different tables, "Both boxes carry" did not fit a pair of laptops, and the closing list of what the
site does not measure had been a list of desktop parts. Pushed as `db8ea11`; **deploy run 105 was
green at 22:03 and the pages are live**.

**A sibling session had pushed to main while this ran**, so the push came back rejected for the
third time in a day. Per the standing rule it was fetched and read rather than forced: the other
side was `45bc394`, a LOG entry recording that the 21:00 slot fired three sessions. Nothing of this
run's work touched it, so this commit was rebased on top and nothing was lost.

**Then PR #3, which this push broke, repaired in the same run.** One conflict, the import block for
the seventh time: this branch's `shownTps` against main's `sameSilicon`. Union asserted by name,
71 names in and 71 out. And the branch's standing lesson paid again — the merge built clean and the
page was still wrong: `/compare/`'s section copy said **"Three kinds of match-up"** and named three,
over a table that now carries a fourth. It names all four now. Rebuilt and re-read on the merged
branch: 236 pages, 122 comparisons, 203 tests, typecheck clean, the full build. Pushed as `2b37c7c`;
GitHub reports the PR `mergeable_state: clean`. Ryan was not pinged, per the standing rule on that PR.

**Continue next:** the question pages. `/how-much-memory/` is on main with its page type, its
helpers and its card, and "best GPU for local LLMs" is the strongest candidate: nothing on the site
filters the list to cards, and `/best/` answers by usage rather than by part. It is a new page type,
so it is a PR. Worth knowing before starting: PR #3 has been open a day and has cost twelve repairs,
so a second open branch touching `scripts/build-pages.ts` doubles that cost until Ryan merges. If
that is judged too dear this hour, the next item down is the assumptions note that tells ~30
machine-against-machine pages to add a PC around a graphics card neither of them is.

### 2026-09-17 — PR #1 landed, and PR #3 was carrying 151.8 MB of build output

Woke on the merge event: Ryan merged PR #1 at 21:11, thirty-two hours after it was opened, in the
same minute as PR #2. `/how-much-memory/` is live. The first question page has shipped.

**Checked the merge rather than assuming it, because this repository gives a PR no CI at all.** The
first time any check ran on that code was the deploy on main, so a green deploy is the only
evidence there is, and if it had been red the page would simply never have appeared. Pulled the
merged main and ran the lot here: 196 tests, typecheck, validate, and 227 pages built with every
guard passing. Deploy run 100 carried both PRs and finished green at 21:18. Run 99, on PR #1's own
merge commit, shows as cancelled: run 100 superseded it through the `deploy-production`
concurrency group, which is the workflow working as configured, not a failure.

One false alarm worth recording so the next run does not chase it: `build:pages` failed here with
"38 pages name an OG card that does not exist". That was a stale `public/og` left in this container
from an earlier build, not a fault on main. `checkOgCards()` skips when no cards are drawn at all
and checks when some are, so a *partly* stale directory is the one state that trips it. Clearing it
was the fix.

**Then PR #3, which two merges had just broken.** Its own log item predicted this, so it was worth a
`git merge-tree` before anything else: conflicted, eleven of them across four files. Every one was
the same shape — main had gained the memory card with PR #1, this branch adds the head-to-head
index card, and neither touched the other's behaviour — so each resolution is the union.

**A sibling session had pushed the same merge four minutes earlier, and its work was kept.** The
push came back rejected, which the duplicate-runs item says to treat as a sibling rather than force
past. Fetched, read their resolution instead of assuming it: both card functions declared, all four
list cards drawn, 201 tests passing on their tip. It was equivalent to mine, so mine was dropped
and theirs kept, and only the part they did not have was re-applied on top.

**That part is the find of the run. PR #3 was carrying `public/og/og/`: 1,993 PNG share cards,
151.8 MB, committed into the repository.** Main has none. They are build output — `build-og.ts`
draws every one on each deploy — and `.gitignore` has always meant to exclude them. The rule was
`public/og/*.png`, and a single star does not cross a directory boundary, so a stray nested copy
was never ignored and a `git add` took it in. Nothing writes to that path today and nothing reads
it: the pages and the manifest name `/og/<card>.png`, which is where `build-og` writes. Removed,
with both rules widened to `public/og/**/*.png` and `**/*.svg`; commit `d73ce66`. The tracked tree
goes from about 153 MB to **1.7 MB**.

The tip being clean is not the whole fix, which is why this one needed Ryan rather than just a
commit. The blobs are still in that branch's history, so an ordinary merge commit would make them
reachable from main permanently, in every clone from then on, while a squash merge collapses the
branch to one commit with the files already gone. That is on his list above and in a comment on the
PR, and it is the one thing about PR #3 that cannot be fixed after the fact.

It also says something about the missing `pull_request` workflow that is worth more than the
general argument for CI: **151.8 MB sat on a branch for a day and nothing looked at it**, because
nothing here looks at a branch. `git status` was clean throughout, since the files were committed
rather than stray. That backlog item now protects three PRs and, on this evidence, catches things
that are not test failures.

Verified after the removal, on the sibling's merge plus this commit: 201 tests, typecheck clean,
228 pages built with every guard passing, working tree clean.

**Continue next:** PR #3 is green and mergeable and waits only on Ryan, with the squash caveat
above. Nothing else about it is the agent's. The live work is whatever the other sessions' entries
name; with the memory page merged, the question-pages item is open again and "best GPU for local
LLMs" is the next one, which is the first time in eight runs that item has not been blocked behind
a PR.

### 2026-09-17 — the memory question gets its own 18 pages

**Ryan merged PR #1 and PR #2 during this run, at 21:11.** All three PRs were checked first and all
three merged clean; PR #1 and PR #2 were also built as merges rather than just tested for conflicts,
the way the last run said to check them (227 pages, 192 tests and 226 pages, 183 tests, both through
the full build), and both went in twenty minutes later. **So `/how-much-memory/` is live, and the
question pages are no longer blocked** — the housekeeping for those two merges was written by a
concurrent session as `2261cdb`, which is the third collision of the day and is recorded at the top
of Ryan's side. PR #3 needed two repairs from this run, one from its own push and a much larger one
from the two merges; both are at the end of this entry. Ryan has not been pinged about any PR, per
the standing rule.

**Why this item.** It was the top of the backlog: the 49 machines that are not graphics cards
appeared in no head-to-head but the one their family's flagship is in. The item said the rule mattered
more than the code and named two candidates, one to be written and not both.

**The rule, and why this one.** **Two memory tiers of one machine.** "How much memory should I buy"
is the question a buyer asks once they have picked the box, it is the one line on a spec sheet that
changes what a machine can hold, and the site answered it nowhere. The other candidate — the cheapest
machine of each family against the cheapest of each other — was left, because the flagship grid
already puts family against family and a second page on the same two families at a different price
is the near-duplicate this site should not write. The item's own test is met: a tier page says what
neither machine page does, which is what the difference in memory buys.

**What changed.** `hardwarePairs()` writes a third grid after the flagships and the cards: every pair
of memory tiers on one configuration, grouped by **chip variant**, priced, and still on sale. **18
new comparisons, 226 pages in place of 208**, and **30 of the 56 machines are now in a head-to-head,
up from 13**. The grid is appended last, so every pair that already had an address keeps it.

**The grouping is the honest part of the rule and it rejects three machines it might have taken.**
The Corsair AI Workstation 300 at $1,700 and at $4,700 look like one machine at two sizes and are
not: the cheaper one is a Ryzen AI Max 385 with 32 compute units against the Max+ 395's 40, so the
money buys an APU as well as memory. The Framework Desktop 385 at 32GB and the Mac Studio M5 Max at
36GB are the same case. None of them is paired. The Mac mini M6 pair *is* written, and it is the one
place the two sides are not identical silicon — 153 GB/s against 170 — which the bandwidth row prints
and the lede reads as "about 1.1× faster". Nothing on any of these pages claims only the memory
differs.

**The titles were the second half of the work.** "Mac mini M6, 16GB vs Mac mini M6, 32GB for local
LLMs" is 53 characters of a 60-character budget spent saying the machine twice, and on the longer
names it broke the limit: the first build of these pages **added seven titles over 60, worst 73**.
A tier pair now names its machine once — **"Mac mini M6: 16GB vs 32GB"** — in the title, the h1, the
breadcrumb and the description, which is also the shape of the query. **All 18 fit inside 60, and the
site is back to the 7 over-length titles it had before**, all of them the known cross-family pairs.

**Where both tiers hold the same models, the description stops counting them.** Four pages would have
read "holds 27 of the 39 open models here, with 48GB 27" and then promised what the extra memory
buys. On those pages what it buys is context, and that is what the page itself prints: the
description now says so and quotes the same `contextHeadroom()` row count the table below it lists.
The build's own duplicate-description check caught the first attempt at this, which had dropped the
machine name and made four descriptions identical.

**No figure is new data and no template changed.** The 18 pages run the same helpers and the same
build checks as the other 95 comparisons; `checkPayback()`, `checkHeadroom()`, `checkCardPrices()`,
the OG-card check and the reachable-from-both-sides check all applied without a line of new checking
code. Word counts run 570 to 748.

**What a tier page actually says**, because 18 pages nobody reads is not a win. Mac mini M6 16GB
against 32GB: the 32GB holds 19 of 39 models against 10, and the nine it adds are named with what
each needs at 32k — Qwen3.8 27B wants 19 GB against 10.5 GB usable. Mac Studio M5 Max 48GB against
64GB: **both hold the same 27 models, so the page answers in context instead** — Gemma 4 31B it runs
to 64k on the 48GB and 128k on the 64GB, and the figures are links that open the calculator there.
Followed that one in a browser: at 128k the 48GB machine says "Nearly fits — needs 41.9 GB, this
config has 36 GB usable" and the 64GB one runs it, which is the table's claim, from the calculator
itself.

**Verified.** `npm ci`, `npm test` (**179 tests**, up from 177: one holding the tier rule to the data
— same family, chip and chip variant, priced, current, every tier of every such machine and not just
the adjacent ones — and one holding the name-it-once title to `shortHardwareLabel` and to the 60
characters), `npx tsc --noEmit`, `npm run build` all the way through `build:functions` with no
workaround, and **four deliberate breakages**: letting discontinued machines in failed **1** test,
ignoring the chip variant **2**, never writing the tier grid **1**, pairing only adjacent tiers **1**.
Measured over HTTP in Chromium at 320, 360, 390, 430, 640, 768, 1024, 1280 and 1440px: **1,548 views,
0 page overflows on any generated page, 0 of 4,833 tables scrolling**. The only three overflows in
the whole sweep are `/` itself at 320, 360 and 390px, which is the calculator's top bar and already
on the backlog. Read two of the new pages rendered end to end and one new OG card as a picture.

**Nothing else on the site moved.** Built the whole page set from `origin/main` with `public/` wiped
either side — `build:pages` does not clear it, and a first attempt at this comparison was
contaminated by stale files from the previous build. Clean: **18 new, 22 changed, 203
byte-identical, 0 removed**. The 22 are the 21 machine pages now in a tier pair, each diff a single
line listing the head-to-heads it is in, and the sitemap, which gains exactly 18 URLs, **227** now.
**No title, description, canonical, OG tag or JSON-LD line changed on any existing page**, checked by
parsing every head element out of all 56 machine pages before and after.

**Pushed as `568de38`, and the deploy is confirmed: run 98, green at 20:58 UTC**, with `npm ci`,
`npm test` and the full build passing on the runner. The live URLs cannot be read from here — the
egress policy still refuses `sunkcost.ai` — so the confirmation is the runner's, not a fetch.

**PR #3's tenth repair, caused by this push, and for once not the import block.** The conflict was in
the breadcrumbs: this branch adds `/compare/` as the step above a comparison, main now writes the
leaf label from the page's own heading. Both kept, so a tier pair reads "Mac mini M6: 16GB vs 32GB"
there too. Then the lesson from the last run paid for itself again — **the merge built clean and the
page was still wrong**. The index's summary recounted itself correctly (66 machine match-ups, 30
machines compared, cheapest the RTX 3060 at $329), but the section's own copy still read "one machine
per family, the middle of its range by price" over a table that now holds card-against-card and
tier-against-tier rows as well. It names all three rules now. Rebuilt on the branch (227 pages, 114
comparisons, 184 tests, typecheck clean, the full build) and re-measured over HTTP (**1,530 views,
0 overflows, 0 of 4,797 tables scrolling**) before pushing `ccfe26b`.

**And then its eleventh, when Ryan's two merges landed twenty minutes later**: four conflicted files
rather than one, the details in Ryan's side above. The one worth repeating is `src/list-card.ts`,
where this branch's `compareIndexCard` and main's `memoryCard` end in the same three lines, so the
conflict markers fell either side of a seam that belonged to both functions and neither was closed.
Both cards are drawn now — four list cards in all — and the branch builds 228 pages with 201 tests.
Pushed as `3cda5bd`.

**Merged main was checked here too, since two merge commits a minute apart had not seen each other's
code**: 196 tests, typecheck clean, the full build at 227 pages, and one figure that answers an open
backlog item — the build's own link check now reports **"every page is linked from at least 2 other
pages"** where it used to say 1, which is `/how-much-memory/` doing exactly what that item predicted
it would.

**What to continue.** **The question pages are the top item again and nothing is in the way of them
any more**, which has not been true for fourteen runs: `/how-much-memory/` is on main with its page
type, its helpers and its card, so the next one — "best GPU for local LLMs" is the strongest
candidate — is far less work than the first was. After that, the coverage gap is down to **26
machines in no head-to-head**, 13 previous-generation Macs and 13 current machines that are the only
tier of their exact silicon; the four Strix Halo boxes among them are the best-defined piece of it
and the backlog item below says why. Only PR #3 is still open, and it now carries eleven repairs.

### 2026-09-17 — every graphics card gets a head-to-head, and 20 new pages go live

**All three open PRs were checked first. PR #1 and PR #2 merged clean and still do; PR #3 needed a
repair caused by this run's own push, which is at the end of this entry.** Ryan has not been pinged
about any of them, per the standing rule.

**Why this item.** The question pages are still the top item overall and still blocked behind three
unmerged PRs, for the thirteenth run running. So the last run's advice was taken rather than the
backlog read down: the page set was measured again from scratch — every title, description, word
count, inbound link and prefilled link on all 188 pages. On-page work came back clean (no title over
60 characters that was not already known, no description outside 70–155, no duplicate title or
description, no orphan, no page without a way into the calculator). What came back instead was a
**coverage** gap, and it was large.

**What was wrong.** The machine head-to-heads were cut from one machine per family — the middle of
each range by price — so **five of the seven graphics cards on the list appeared in no comparison on
the site at all**: the RTX 5090, 4090, 3090, 4080 and 3060. The NVIDIA slot in that grid went to the
$18,000 RTX PRO 6000, because it is the median of the two current NVIDIA entries. A card is the one
class of machine on this list bought as a part rather than as a computer, and a part is what people
put against another part: "3090 vs 4090 for local LLM" is the shape of the question, and the site
had no page for it or for any of its 19 siblings.

**What changed.** `hardwarePairs()` now writes two grids: the family flagships first, then every
graphics card against every other, deduped so a pair both rules reach is written once. A card is
`price_scope: 'card_only'` in the data, which is the site's own definition, not a new judgement.
**The flagship grid goes first so that every pair that already had an address keeps it** — no
redirect, no lost page. 20 new comparisons, 48 machine head-to-heads in place of 28, 208 pages in
place of 188, and the seven card pages each gained the links to the ones they are in (the RTX 3060
went from no head-to-head to six).

**No figure is new data and no template changed.** Every number on the 20 pages comes from the same
helpers the other 75 comparisons use, the card-only price note the build already enforces prints on
every card price, and `checkCardPrices()`, `checkPayback()`, `checkHeadroom()` and the
reachable-from-both-sides check all applied to the new pairs without a line of new checking code.
The page type, the template and the assumptions note are untouched.

**What the new pages actually say**, because 20 pages nobody reads is not a win. RTX 4090 against
RTX 3090: both hold the same 24 of 39 models at every context from 4k to 256k, the 3090 costs $100
less and draws 100 W less, the 4090 is about 1.2× faster on Qwen3.8 27B (44 tok/s against 38, both
estimated), and the **3090 pays back sooner at every one of the five levels of use** — so the page
says the choice is speed, price and power, not what they can hold. RTX 5090 against the Radeon AI
PRO R9700, both 32GB: the 5090 is 2.2× faster, the R9700 is $700 cheaper and pays back sooner at
every level. RTX PRO 6000 against the RTX 3060: 33 models against 11, 4.8× faster on the strongest
model both hold, and $17,671 apart.

**Nothing else on the site moved.** Built the whole page set from a worktree at `origin/main` and
compared every file: **20 new, 7 changed, 1 sitemap, 181 byte-identical**. The 7 are the card
machine pages, and each one's diff is a single line, the note listing its head-to-heads. **No title,
description, canonical, OG tag or JSON-LD line changed on any existing page.** The sitemap gains
exactly 20 URLs, 209 now.

**Verified.** `npm ci`, `npm test` (**177 tests**; the pair test was rewritten from "every flagship
against every other" to hold both grids, the dedup and the flagship-first order that keeps the old
addresses), `npx tsc --noEmit`, `npm run build` all the way through `build:functions` with no
workaround, and every build check green (48 machine head-to-heads priced at 5 levels of use, 9
head-to-heads between machines holding the same models, 203 OG cards named and all drawn, 7
card-priced machines all saying so). Measured the 27 new and changed pages over HTTP in Chromium at
320, 360, 390, 430, 640, 768, 1024, 1280 and 1440px: **243 views, 0 page overflows, 0 of 765 tables
scrolling**. Read three of the new pages rendered and one new OG card as a picture; checked a new
page's JSON-LD, canonical and OG tag by parsing them back out.

**Pushed as `110fa81`, and the deploy is confirmed: run 95, green at 19:57 UTC**, with `npm ci`,
`npm test` and the full build passing on the runner. **These are the first new pages the live site
has had since this agent started.** The live URLs cannot be read from here — the egress policy still
refuses `sunkcost.ai` — so the confirmation is the runner's, not a fetch. This entry and the comment fix went
up as `0caee95`, and **run 96 on it is green too**, so nothing is waiting behind either push.

**PR #3's ninth repair, caused by this push, and it was not a conflict.** All three branches still
merged clean textually, but merging main into `seo/compare-index` and building it showed the
`/compare/` index summary had gone **wrong**: it said "none of the 8 machines compared here" and
named the Radeon AI PRO R9700 at $1,299 as the cheapest machine on the page, because it counted
`flagships` rather than the machines in the pairs it lists. With the card grid there are 13 of them
and the cheapest is the RTX 3060 at $329. It now counts the machines it actually compares. Rebuilt
on the branch (209 pages, 96 comparisons, 182 tests, typecheck clean) and pushed as `c45c31c`.
**The lesson for the next run is that a clean `git merge-tree` is not enough on these branches:
build the merge and read the page.** PR #1 and PR #2 were both checked the same way and need
nothing — merged with main they typecheck, build (209 and 208 pages) and pass 190 and 181 tests.

**One housekeeping note, and it is a trap worth knowing.** `git merge-base origin/main
origin/seo/home-head` came back empty and `git merge` refused "unrelated histories", which looked
like PR #2 having been orphaned by a rewrite of main. It was not: **the container's clone is shallow**
(grafted at `16e0d8e`), and the branch's base sits behind the graft. `git fetch --unshallow origin`
restored it and the merge base is `124fe2c`, exactly as it should be. A run that sees "unrelated
histories" should check `git rev-parse --is-shallow-repository` before believing it.

**What to continue.** The coverage gap this run found in the machine comparisons has a second half,
and it is the new top backlog item below: the other 49 machines still appear in no head-to-head but
their family's one flagship pair. It needs a rule about which pairs a reader would actually search
before it is worth writing, because "every pair" is 1,540 pages and most of them nobody wants. After
that, the question pages remain the top item overall and remain blocked: three PRs, and the memory
page among them.

### 2026-09-17 — the biggest page stops contradicting the rest of the site

**All three open PRs were checked first and all three merged clean**, so nothing needed repairing
before the work, and all three still merge clean after this run's push — it touched neither the
import block nor the leaderboard's lede, which are the two places PR #1 and PR #3 break. Ryan has
not been pinged about any of them, per the standing rule.

**Why this item.** The question pages are still the top item overall and still blocked behind three
unmerged PRs, for the twelfth run running. Of the two main-reachable items the last run left, this
was the one with something wrong on the page rather than something long on a phone.

**What was wrong.** `/leaderboard/` is the site's biggest page, and one of its 47 rows said the
opposite of what the rest of the site says. The "Cheapest machine that runs it" column read
"nothing on the list" for Tencent Hy3, while `/models/hunyuan-hy3-q4/` names the Mac Studio M5
Ultra, 256GB, prices the pay-back on it at 16k, and two comparisons run their race on that machine.
The miss at 32k is about a gigabyte and all of it cache: Hy3 needs 193 GB there and 187.5 GB at 16k,
against 192 GB usable.

**What changed, and how the item's own question was settled.** The item asked whether a 16k answer
belongs beside the figure or in the cell's own note. It goes beside the figure, because that is
where the reader is and a note under a 55-row table is not: the cell now reads **Mac Studio M5
Ultra, 256GB $10,799 at 16k**, with the machine name blue, the price grey and underlined as every
other price in that column already is, and "at 16k" in the same muted grey but not a link. **The
price opens the calculator on that pair at 16k**, not at the default — the 48th prefilled link on a
page that had none before 18:08 today. A note under the table carries the convention the column
never stated: each machine named is the cheapest that holds that model at the 32k context the
calculator starts at, and Tencent Hy3 fits nowhere at that length.

**No figure here is new data.** `machinesShorter()` asks `fit()` at every context the calculator
offers, the same function the calculator uses, and returns the cheapest machine that holds the model
at any of them — so the column's word "cheapest" stays true on that row rather than quietly meaning
"cheapest of the ones that fit at 32k". Checked across the whole dataset that Hy3 is the only row
this applies to, and that no cheaper machine holds it at any window at all.

`checkLeaderboardLinks()` holds the row from here, recomputing it at build time rather than reading
it back off the page: the machine, the price, the window, the link at that window, a note under the
table that names the model and the window, and **that the model's own page names the same machine**,
which is the contradiction this item was about. A row with nothing at any window may still say
nothing on the list, and may not offer a link. Proved by breaking it six ways: falling back to
"nothing on the list" failed the build on **2** counts, linking at the default window on **1**,
printing the window one step long on **1**, naming a machine that does not hold it on **1**,
dropping the note on **1**, and pointing the model-page check at a machine that page does not name
on **1**.

**Nothing else on the site moved.** Built the whole page set before and after and compared every
file: **189 byte-identical, 1 changed**, and the one is `/leaderboard/`. Its diff is two lines, the
cell and the new note. **No title, description, canonical, OG tag or JSON-LD line changed**, and the
sitemap is byte-identical.

**Verified.** `npm ci`, `npm test` (**177 tests**, up from 176 — a new one holding the column's
"cheapest" claim to the whole machine list rather than to the one-per-family list the helper keeps,
and round-tripping the link through `parseState()` to the same machine, model and window with the
model still fitting), `npx tsc --noEmit`, `npm run build` all the way through `build:functions` with
no workaround, and the six deliberate breakages above. Measured over HTTP in Chromium at 320, 360,
390, 430, 640, 768, 1024, 1280 and 1440px: **1,692 views over the generated pages, 0 page overflows,
0 of 4,302 tables scrolling**, the same as the baseline. Read the row as a picture at 390 and 1280px
— on a phone it reads "Cheapest  Mac Studio M5 Ultra, 256GB  $10,799 at 16k" — and **followed the
new link in a browser**: it lands on the Mac Studio M5 Ultra, 256GB with Tencent Hy3 selected at 16k,
where the calculator prints a 5.4 GB cache and 20 tok/s and prices a pay-back, which is the model
page's own figure.

**One housekeeping note, and it is not what the standing rule assumes.** `git push` was rejected on
the first try, and the cause was **not** a sibling session: the container's local `main` was still
the seed commit `94aa957` with HEAD detached, so `git push -u origin main` pushed the stale branch
rather than the work. `origin/main` was untouched at `d2854ea`. A run that sees a rejected push
should read `git status -sb` before assuming a collision — this is the second run to meet the
detached HEAD, and the first to be bitten by it.

**Pushed as `e2fb32f`, and the deploy is confirmed.** Run 92 on that commit was cancelled by run 93
when this log entry was pushed four minutes later — the workflow cancels a superseded run, the same
thing that happened at 18:09 today — so the deploy that matters is **run 93, on `bcae5e7`, green at
19:10 UTC** with `npm ci`, `npm test` and the full `npm run build` passing on the runner, and
republished. That commit carries the change and this entry, so nothing is waiting behind it.

**What to continue.** The site now answers at a shorter window everywhere it can: machine pages,
model pages, the two thin comparisons and, as of this run, the leaderboard. **The question pages are
still the top item overall, still the biggest win, and still blocked behind three unmerged PRs** —
twelve runs now, and **the live site has still had no new page since this agent started**. What is
left on the backlog that a push to main can carry is thin and each piece says so itself: the
leaderboard's height on a phone (only worth doing if the length reads as a problem), the 21 machine
head-to-heads that could answer the context question (only if it can replace something rather than
sit beside it), and whether a model page's call to action still earns its place now that every
figure in the table is a link. A run that wants a real item should do what the last four did and
measure the page set again rather than read down this backlog.

### 2026-09-17 — the leaderboard's prices open the calculator

**The branches were checked first, and two of the three needed repairing before any work started.**
PR #1 and PR #3 had both gone un-mergeable on `9717481`, main's `machinesShorter` against their own
import lists, and both were repaired here and pushed as `3f84214` and `7adcb3b` before anything
else. The run entry above records those two from the other session's side, which verified them
rather than redoing them; they are the same two repairs. PR #3 then needed a further repair from
this run's own push, which is at the end of this entry. All three branches merge clean again. Ryan
has not been pinged about any of the three, per the standing rule.

**On the two sessions.** The item at the top of Ryan's side is right and this run is the other half
of it: the 17:00 slot fired twice, and the two sessions spent the hour on different work only by
luck. This session took the PR repairs at 17:38 and the leaderboard item; the other took the model
pages. Nothing collided this hour, but nothing stopped it from doing so either. Ryan has now been
told once; do not send it again.

**Why this item.** The question pages are still the top item overall and still blocked behind three
unmerged PRs, for the eleventh run running. Of the two main-reachable items the last two runs left,
the model-page mirror was taken by the other session at 16:58, so this was the remaining one — and
it was the biggest hub on the site.

**What was wrong.** `/leaderboard/` was **the only page on the site with no way into the calculator
at all**. 48 models, 113 outbound links, and every one of them went to another page here. `/best/`
carries 45 prefilled links, a model page 15, a machine page 13. Meanwhile the leaderboard's
"Cheapest machine that runs it" column already prints the exact pair the calculator wants — a
machine and the model in that row — and stopped at a link to the machine page.

**What changed, and why the backlog item's own doubt decided it.** The item said the price beside
the machine name was "a poor thing to make into a link", so the answer needed a shape rather than
just a href. The shape is the one the rest of the site already uses: **the figure that describes a
configuration is the link**, the way a Longest context cell is on the machine and model pages.
**The price is now the link: 47 rows, one a row.** No new column — the table is 7 wide already —
no new line, and one clause added to the lede.

**The part that needed looking at rather than reasoning about.** Made a plain link, the price
rendered in the same blue as the machine name beside it, and on a narrow column the two wrapped
together and read as one link to one place. The price keeps `dim`, so it is grey and underlined
against the machine name's blue: measured in the browser, the price computes to `rgb(94, 109, 119)`
and the machine name to `rgb(31, 84, 121)`, both underlined. That is the row's existing hierarchy
kept, with an underline added to say the figure is clickable.

**What the column says about the one model nothing runs.** Tencent Hy3 still reads "nothing on the
list" and offers no link, which the check enforces rather than allows. That is honest at 32k and it
is now the only place on the site that answers at 32k alone — see the new backlog item above.

**No figure here is new data.** The link carries no context, so it lands on the calculator's
default, which is the same context `runnersFor()` picks the cheapest machine at. The new test holds
those two together over every model: the link round-trips through `parseState()` to the same
machine, the same model and the default context, and the model still fits when it gets there.

`checkLeaderboardLinks()` holds the page to the data from here, recomputing each link at build time
rather than reading it back off the page: every scored model with a machine must open that machine
and that model at that price, the cheapest machine must be the cheapest, a model nothing runs may
offer nothing, and a hosted model may not offer to run on hardware you can buy. Proved by breaking
it four ways: dropping the link failed the build on **47** rows, opening every row on the top
model on **46**, opening the dearest machine that runs it rather than the cheapest on **41**, and
giving the eight hosted rows a link on **8**, each one naming the model it got wrong.

**Nothing else on the site moved.** Built the whole page set from a worktree at `origin/main` and
compared every file: **189 byte-identical, 1 changed**, and the one is `/leaderboard/`. Its diff is
96 lines: the 47 price cells and the lede. **No title, description, canonical, OG tag or JSON-LD
line changed**, and the sitemap is byte-identical.

**Verified.** `npm ci`, `npm test` (**176 tests**, up from 175), `npx tsc --noEmit`, `npm run build`
all the way through `build:functions` with no workaround, and the four deliberate breakages above.
Measured over HTTP in Chromium at 320, 360, 390, 430, 640, 768, 1024, 1280 and 1440px: **1,692
views over the generated pages, 0 page overflows, 0 of 4,302 tables scrolling**, the same as the
baseline. Read the table as a picture at 390 and 1280px — on a phone the row reads "Cheapest  Mac
Studio M5 Ultra, 256GB  $10,799" with the price underlined — and read one row's links back out of
the rendered page in the browser: the model page, the machine page, the calculator on that pair, and
the head-to-head, in that order.

**Deploy confirmed.** **Run 89, on `11d3708`, finished green at 18:08 UTC** with `npm ci`,
`npm test` and the full `npm run build` passing on the runner, and republished. Run 90 carries this
log entry.

**PR #3 repaired afterwards** from this run's own push, its eighth, and not the import block this
time: both sides had written the leaderboard's lede. Details in Ryan's side above; rebuilt and
re-measured before pushing `69ade05`.

**What to continue.** The main-reachable list is short again and the two items on it are both small:
the leaderboard's "nothing on the list" for Tencent Hy3 (new above, and the last place the site
answers at 32k alone) and the leaderboard's height on a phone. **The question pages are still the
top item overall, still the biggest win, and still blocked behind three unmerged PRs** — eleven runs
now. **The live site has still had no new page since this agent started.** A run that wants a real
main-reachable item should do what the last three did and measure the page set again rather than
read down this backlog.

### 2026-09-17 — a model page stops naming the wrong machine as the cheapest that runs it

**All three open PRs were checked first: PR #1 and PR #2 merged clean, PR #3 did not.** PR #3 was
repaired after the work rather than before, because a second session got to it first; see the end of
this entry, and the new item at the top of Ryan's side. Ryan has not been pinged about the PRs
themselves, per the standing rule.

**Why this item.** The question pages are still the top item overall and still blocked behind three
unmerged PRs, for the tenth run running. The last entry named two main-reachable items and called
this one the cheaper half, because `fitsShorter()` was already written. It was cheap. It was also
the more useful of the two.

**What was wrong, and it is worse than the backlog item said.** The machine pages had stopped
saying "it cannot run this" about a model they run at 16k. The same 45 rows read from the model's
side say something different and worse: **the cheapest machine a model page named was often not the
cheapest machine that runs the model**. `/models/llama-3.3-70b-q4/` answered "Cheapest machine that
runs it: Framework Desktop, 128GB at $3,449" — and a $1,700 Corsair AI Workstation 300 runs it at
16k. That is not a missing row, it is the page's headline figure being wrong by $1,749 for anyone
who would have kept a shorter window. **On 12 of the 16 affected pages the page's own cheapest was
beaten**: four models at $1,099 that run on an $899 Mac mini, two 70B models at $3,449 that run on
the $1,700 Corsair, and the rest by $30 to $200.

**What changed.** **16 of the 55 model pages** now carry a section under "Machines that run it" —
"Four more machines, at a shorter window" — naming each machine, its price, the longest window it
holds that model at and what the model needs there. **The window is the link**, the way it already
is in the table above and on the machine pages, so each one opens the calculator on that machine at
that length: **45 new prefilled links**. On the 12 pages where the shorter window buys a cheaper
machine, the answer box says so in a row of its own, directly under the "Cheapest machine that runs
it" row it qualifies.

**Two drafts were thrown away, both for the same kind of fault.** The first table had a fifth
column, the machine's usable memory, so a reader could check the fit. On the Llama 70B page it
printed "48 GB" beside "Needs there 48 GB" — true to a tenth of a gigabyte and unreadable as
anything but a rounding artefact, so the column went and the note points at the machine's own page
instead. The first draft of the paragraph opened "Every figure in the table above is taken at 32k",
which is **false**: the Longest context column in that table is the one figure on the page that is
not. It now says the table lists the machines that run it at 32k, which is what is actually true.

**No figure here is new data.** `machinesShorter()` asks `fit()` at every context the calculator
offers, the same function the calculator uses, and keeps one machine per family, cheapest first —
the same rule the table above it already states. A family already in that table can appear here on a
cheaper machine, which is the whole point. Checked that the rule loses nothing: across all 55 models
there is **no family where two machines hold the model at different shorter windows**, so the
cheapest per family is not hiding a longer window behind a dearer box.

`checkShorterMachines()` holds it from here, recomputing every row from `fit()` at build time rather
than reading it back off the page: a page with machines to name must name them all, in order, with
the right price, window and footprint; a page with none may claim none; **no machine may appear in
both tables**; the paragraph must carry the model's own 32k footprint and the price its own table
starts at; and the answer box may only promise a cheaper machine where there is one. Proved by
breaking it eleven ways — dropping the section (**16** faults), printing the window one step long
(**45**), linking at the default window (**45**), dropping the answer-box row (**12**), forcing that
row onto every page with a section (**4**), printing the 32k footprint as the figure at the shorter
window (**45**), listing machines the model already runs on at 32k (**297**), ordering the rows
dearest first (**126**), taking the paragraph's 32k figure at the shorter window (**16**), taking
the "starts at" price from the wrong machine (**16**), and printing a wrong price in the table
(**45**).

**One breakage produced nothing, and that was worth knowing.** Printing the price without its
"card only" scope failed to fail — because the check compared the cells as text, and the text
comparison strips the very tag it was meant to hold. There is also no card-only machine among the 45
today, so nothing would have caught it either way. The price cell is now compared as markup, not as
text, which is the only column on the page where that matters.

**Nothing else on the site moved.** Built the whole page set from a worktree at `origin/main` and
compared every file: **173 byte-identical, 16 changed**, and the 16 are exactly the 16 model pages.
The sitemap is byte-identical and **no title, description, canonical, OG image or JSON-LD line
changed on any page**. A first draft left a blank line inside the answer box on all 54 model pages
with a machine list; the row carries its own line now, which is what took the diff from 54 to 16.

**Verified.** `npm ci`, `npm test` (**175 tests**, up from 173 — two new ones over every model,
holding the model side to the machine side row for row and keeping any machine that runs it at 32k
out), `npx tsc --noEmit`, and `npm run build` all the way through `build:functions` with no
workaround, exit 0. Measured over HTTP in Chromium at 320, 360, 390, 430, 640, 768, 1024, 1280 and
1440px: **1,692 views over the generated pages, 0 page overflows, 0 of 4,302 tables scrolling**,
against 0 of 4,158 on the baseline — the 144 new table views are the 16 pages at 9 widths. Read the
new section as a picture at 390 and 1280px, and **followed five of the new links in a browser**:
Llama 3.3 70B on the $1,700 Corsair at 16k, Granite 4.2 8B on the $899 Mac mini at 16k, Qwen3 32B on
the Mac mini M6 32GB at 4k, Gemma 4 31B on the Framework Desktop at 16k and Ministral 3 14B on the
$899 Mac mini at 8k. All five land on the right machine, model and window, with the model fitting
and a pay-back priced, and the cache figures the calculator prints (5.4, 2.7, 1.1, 3.5 and 1.3 GB)
add up to the footprints the pages print. One note on that last figure: the calculator rounds its
cache to one decimal, so 8.24 + 1.34 prints as 8.2 + 1.3 there and 9.6 GB here. The page's figure is
the exact one; the 0.1 is the calculator's display, and it is site-wide rather than new.

**Deploy confirmed.** **Run 87, on `9717481`, finished green at 17:03 UTC** with `npm ci`,
`npm test` and the full `npm run build` passing on the runner, and republished.

**A second session was running this same hourly task, and repaired both PRs first.** The push broke
PR #1 and PR #3 exactly where this log has predicted for six runs — the import block — and while
this run was resolving them, `session_01GisDawkCEqMazMjq8SY8SP` resolved the same blocks and pushed
at 17:38 and 17:41. Both its resolutions were checked here rather than taken on trust, by unioning
each pair of import lists and comparing against the merged file: **64 and 49 names on PR #1's two
files, 58 on PR #3's, nothing lost and nothing invented on any of them**. So this run threw its own
two merge commits away and kept theirs. **All three branches merge clean against main as of 17:50
UTC.** This is the second time two sessions have collided in a day; it is now an item at the top of
Ryan's side rather than a footnote, because an hour of work was duplicated and the next collision
could land on this log instead of on an import block.

**What to continue.** The best main-reachable item left is **`/leaderboard/` having no prefilled
calculator link at all** — the biggest hub on the site and the only page with none. It needs a shape
rather than a href: the table is already 7 columns and 8,134px tall on a phone, so it cannot take a
new column, and the machine name in "Cheapest machine that runs it" is a link worth keeping. **The
question pages are still the top item overall and still the biggest win**, and the judgement is
unchanged: if a PR merges, the page type is on main and the next question page is much less work.
**The live site has still had no new page since this agent started.**

### 2026-09-17 — the pages stop saying no at 32k when the answer is yes at 16k

**All three open PRs were checked first and all three merged clean**, so nothing needed repairing
before the work. PR #1 and PR #3 both needed repairing afterwards, from this run's own push; see the
end of this entry. Ryan has not been pinged about any of them, per the standing rule.

**Why this item, and where it came from.** The question pages are still the top item overall and
still blocked behind three unmerged PRs, for the ninth run running. The last entry said the
main-reachable list below them had run down to cosmetics and that a run wanting a real item would
have to find it by measuring the page set again. So that is what this run did, and it found one.

**What was wrong.** Everything on this site is priced at one context, 32k, and that setting had
quietly become a property of the hardware. A machine page counts what fits at 32k, prints those
models and stops. **33 machine-and-model pairs miss at 32k and fit at 16k or 8k**, because the
weights are the same size either way and the KV cache is not, and every one of them was left off the
page. A Mac mini M6, 32GB was shown running 19 of 39 models when it runs 22 at a window someone might
well accept; a 16GB Mac mini reads "10 of 39" and holds Granite 4.2 8B at 16k and Ministral 3 14B at
8k; an RTX 3090 holds Granite 4.2 30B at 16k. Those are the machines people search for, and the page
answered "it cannot run this" about a model it can.

**What changed.** **19 of the 56 machine pages** now carry a short section under "What it runs" —
"Two more, at a shorter window" — naming each model, the longest window this machine holds it at,
what it needs there and what it would need at 32k. **The window is the link**, the way the Longest
context column already is, so each one opens the calculator on that model at that length: 33 new
prefilled links. The opening line counts them too, so "Yes, 10 of the 39 open models fit" became
"Yes, 10 of the 39 open models fit in its 10.5 GB of usable memory, the strongest being Gemma 4 12B,
and two more if you keep the window shorter than 32k".

**The model side had one page with the same fault and a worse version of it.**
`/models/hunyuan-hy3-q4/` was **the thinnest page on the site at 288 words and the only one with no
way into the calculator at all**. It said "Nothing on the list runs it" and stopped. Tencent Hy3
needs 193 GB at 32k and the Mac Studio M5 Ultra, 256GB has 192 GB usable — **the miss is about a
gigabyte, and it is all cache**. At 16k the cache falls from 11 GB to 5.4 GB, the model needs 188 GB
and that machine holds it. The site already knew this: the two thin model comparisons were rewritten
around exactly this fact on 2026-09-17, so one page was saying "nothing runs it" while two others
priced it on a machine that does. That page now names the machine, the window, the price, the speed
and the pay-back, and its description leads with the answer rather than the refusal. 288 to 427
words, and its first prefilled link.

**No figure here is new data.** `fitsShorter()` asks `fit()` at every context the calculator offers,
the same function the calculator uses, so a window is capped by whichever runs out first. Every
memory figure is the weights plus the cache at that window, and the note under each table says so
and names the usable memory it is measured against, so a reader can add up the two columns.

`checkShorterFits()` holds both sides from here, recomputing every figure from `fit()` at build time
rather than reading it back off the page: a machine with models to name must name them all, in order,
with the right window and both memory figures; a machine with none may claim none, in its opening
line as well as its table; no page may open the calculator at a window the machine does not hold; and
a model page may not say nothing runs it where something does, or say a shorter window saves it where
none does. Proved by breaking it eight ways: dropping the section failed the build on **19** counts,
printing the window one step long on **33**, linking at the default window on **33**, dropping the
count from the opening line on **19**, forcing the section onto every machine on **37**, printing the
32k memory figure as the one at the shorter window on **33**, dropping the model page's section on
**1**, and doubling the window it names on **1**.

**Nothing else on the site moved.** Built the whole page set from a worktree at `origin/main` and
compared every file: **170 byte-identical, 20 changed**, and the 20 are the 19 machine pages and
`/models/hunyuan-hy3-q4/`. The first draft put a blank line on 91 pages that gained nothing, which is
why the section carries its own trailing line now. **The only head lines that changed anywhere are
Hy3's description, its `og:description` and the copy of it in the JSON-LD** — no title, no canonical,
no OG image, and the sitemap is byte-identical.

**Verified.** `npm ci`, `npm test` (173 tests, up from 171 — two new ones over every machine and
model, asserting that a window offered is one the model itself allows, that the next setting up
really does not fit, and that a machine which holds everything at 32k offers nothing), `npx tsc
--noEmit`, `npm run build` all the way through `build:functions` with no workaround, and the eight
deliberate breakages above. Measured over HTTP in Chromium at 320, 360, 390, 430, 640, 768, 1024,
1280 and 1440px: **1,692 views over the generated pages, 0 page overflows, 0 of 4,158 tables
scrolling**, against 0 of 3,987 on the baseline — the 171 new table views are the 19 pages at 9
widths. Read the new section as a picture at 390 and 1280px, and **followed four of the new links in
a browser**: the Mac mini M6, 32GB on Qwen3-Coder 30B-A3B at 16k, the RTX 3090 on Granite 4.2 30B at
16k, the Mac Studio on Tencent Hy3 at 16k and the 16GB Mac mini on Ministral 3 14B at 8k. All four
land on the right machine, model and window, with the model fitting and a pay-back priced, and the
cache figures the calculator prints (1.6, 4.3, 5.4 and 1.3 GB) add up to the memory figures the pages
print.

**One measurement note for whoever runs the widths next.** Measuring `dist` rather than `public`
turns up 3 page overflows and 1 scrolling table, all four on `/` — the calculator's own top bar,
already on the backlog, and a `.card-body` at 1024px. Neither is a generated page and this run
touched no calculator file, so both are pre-existing; the `.card-body` one shows up because this
run's script measures `.stack` and `figure` as well as `table`, which earlier runs' scripts did not.

**Deploy confirmed.** **Run 85, on `a195991`, finished green at 16:05 UTC** with `npm ci`, `npm test`
and the full `npm run build` passing on the runner, and republished.

**PR #1 and PR #3 were both repaired straight afterwards**, both from this run's own push and both
the import block, which is now the only place either of them ever breaks. Details in Ryan's side
above. Both were rebuilt (189 pages each; 186 tests on PR #1, 178 on PR #3; typecheck clean) and
re-measured over HTTP before pushing `398d115` and `2221657`. All three branches merge clean again.

**What to continue.** The backlog has two new items and they are the two best main-reachable ones.
The first is the mirror of this run's work on the model pages, which is the cheaper half now that
the helper exists. The second is bigger and has been hiding in plain sight: **`/leaderboard/` is the
only page on the site with no prefilled calculator link at all**, and it is the biggest hub on the
site. **The question pages are still the top item overall and still the biggest win**, and the
judgement to revisit is unchanged: if a PR merges, the page type is on main and the next question
page is much less work. **The live site has still had no new page since this agent started.**

### 2026-09-17 — the model pages send the reader to the length they print

**All three open PRs were checked first and all three merged clean**, so nothing needed repairing
before the work. PR #1 needed repairing afterwards, from this run's own push; PR #2 and PR #3 were
re-checked after it and still merge clean. Ryan has not been pinged about any of them, per the
standing rule.

**One housekeeping note for the next run.** The container's local `main` came up at `94aa957`, the
seed commit, with HEAD detached, and `git fetch` reported a forced update to `647a751`: the seed is
not in origin's history. Nothing is wrong with the remote — `git reset --hard origin/main` was the
whole fix — but a run that trusts the local branch rather than `origin/main` would build the wrong
tree and diff against the wrong baseline.

**Why this item.** It was the top open item a push to main can carry, and the mirror of what the
last run shipped. The question pages are still the top item overall, unchanged for the eighth run
running and for the same reason: a question page is a new page type, the rules send that to a pull
request, and three of those are already open and unmerged.

**What was wrong.** Each row of a model page's "Machines that run it" table printed the longest
context that machine holds the model at, and the only way in from the row was the last column's
"Run the numbers" link, which opened the calculator at the default 32k. The machine pages send a
reader to the length they print; the model pages printed one length and sent them to another.
**265 of the 334 rows printed a window longer than the one the row's only link opened.**

**What changed, and why the last column was left alone.** The backlog item named two ways to close
it and this is the second, which is what the machine pages already do: **the length itself is the
link.** 334 prefilled links across the 54 model pages, and 50 of those pages gain at least one way
in to a window longer than 32k. The row's "Run the numbers" link stays at the assumed context on
purpose — the speed and the pay-back beside it are quoted there, so that link is what makes the row
reproducible, and the length cell is the other question. No new column, no new row, one sentence
added to the note under the table.

**Nothing else on the site moved.** Built the whole page set before and after and compared every
file: **134 byte-identical, 54 changed**, and the 54 are the model pages. A line-level diff across
all 54 found exactly two kinds of change — the 334 context cells becoming links, and the note
gaining "Each one opens the calculator on that machine at that length." **No title, description,
canonical, OG tag or JSON-LD line changed anywhere**, and the sitemap is byte-identical.

`checkModelContexts()` now holds each link to the figure beside it: a page may not print one length
and send the reader to another, name the wrong machine or the wrong model, or offer a way in to a
length it holds the model at nowhere. Proved by breaking it four ways: dropping the link failed the
build on **334** counts, linking at the default context on **265**, at the wrong machine on **280**,
and at the wrong model on **326**.

**What the 265 also measures.** The existing call to action under the table only ever offered the
single furthest machine, so on a page like Llama 3.1 8B, where five of the eight machines hold it
to 128k, four of those five had no way in to 128k at all. That is the part of the gap the figure
in the cell was hiding.

**Verified.** `npm ci`, `npm test` (171 tests, up from 170), `npx tsc --noEmit`, `npm run build` all
the way through `build:functions` with no workaround, and the four deliberate breakages above.
Measured over HTTP in Chromium at 320, 360, 390, 430, 640, 768, 1024, 1280 and 1440px: **1,701
views, 0 of 3,987 tables scrolling**, unchanged from the baseline. The 3 page overflows are `/` at
320, 360 and 390px, which is the calculator's own top bar and already on the backlog above; no
generated page overflows at any width. Read the rendered table as text and **followed three of the
new links in a browser** — a 128k row, a 256k one and a 64k one — each landing on the right machine,
the right model and the right length, with the model fitting and a pay-back priced rather than a
misfit reported.

**One thing the browser check settled, for whoever measures these next.** The calculator rewrites
`/?hw=…&m=…` to its own `/s/…` share path on arrival, so a link's query parameters are gone from the
address bar by the time the page has loaded and `location.search` reads back no machine and no
model. That is the app canonicalising its own state, not a broken link, and those /s/ pages are
`noindex` by design. Read the calculator's rendered state instead: the chosen model's row and the
verdict line name the machine, the model and the context.

**No new number reached the page.** The links carry `longestContext()`, which the cell already
printed, and the round-trip test the last run added over every machine-and-model pair already covers
every link a model page now emits. The one test added is the property the row layout depends on: a
machine listed in that table holds the model at the context the page assumes, so the length beside
it can only ever be that context or longer, and the way in cannot quietly downgrade the reader.

**Deploy confirmed.** **Run 83, on `82ffc4f`, finished green at 14:54 UTC** with `npm ci`,
`npm test` and the full `npm run build` passing on the runner, and republished.

**PR #1 repaired afterwards**, for the twelfth time and from this run's own push: the import block
in `tests/pagekit.test.ts` alone. Details in Ryan's side above; rebuilt (189 pages, 184 tests,
typecheck clean) and re-measured over HTTP (**1,710 views, 0 overflows, 0 of 4,041 tables
scrolling**) before pushing `5108b80`. All three branches merge clean again.

**What to continue.** **The question pages are the top item, the biggest win, and still blocked
behind three unmerged PRs** — eight runs now. What is left below them on main is cosmetics: the
leaderboard's height on a phone, the seven long head-to-head titles, the waterline label's margin on
a share card, and the small new item this run added about the now-duplicated call to action under
the model table. Both mirror items the last two runs shipped are done, so a run that wants a real
main-reachable item will have to find it by measuring the page set again, the way the model-pages
run earlier today did, rather than by reading down this backlog. **The live site has still had no
new page since this agent started.**

### 2026-09-17 — the length a machine holds a model at is now the way in

**All three open PRs were checked first and all three merged clean**, so nothing needed repairing
before the work. PR #1 needed repairing afterwards, from this run's own push; PR #2 and PR #3 were
re-checked after it and still merge clean. Ryan has not been pinged about any of them, per the
standing rule.

**Why this item.** It was the top open item on the backlog that a push to main can carry, and the
one the last run picked out as the only one left that adds an answer rather than tidies one. The
top item overall is still the question pages, and it stayed where it is for the seventh run running:
a question page is a new page type, the rules send that to a pull request, and three of those are
already open and unmerged.

**What was wrong.** The last run gave every machine page a **Longest context** column, so the page
finally said how long a window this machine holds each model at. The figure was then read and left.
The only way from a machine page into the calculator was the "Run the numbers on this machine"
button at the top, which opens on that machine at the default model and the default 32k — so a
reader who had just read off that this machine takes one of its models to 128k had to set both the
model and the length again by hand to see it.

**What changed, and why it is not another button.** The backlog item set its own condition: worth
doing only if it can sit somewhere that is not a second call to action under the table, because two
in a row would read as selling. So there is no new link. **The length itself is the link.** Each
figure in the Longest context column opens the calculator on that machine, that model and that
length. **661 prefilled links across the 56 machine pages**, no new column, no new row, and four
words added to the note under the table.

**Nothing else on the page moved.** Built the whole page set from a worktree at `origin/main` and
compared every file: **133 byte-identical, 56 changed**, and the 56 are the machine pages. A
line-level diff across all 56 found exactly two kinds of change — the Longest context cells, and
the one note. **No title, description, canonical, OG tag or JSON-LD line changed anywhere.**

**The quiet part was the cache type.** `longestContext()` measures at the dataset's default KV cache
type, and `serializeState()` leaves that parameter out of the query string when it is the default.
If those two ever disagreed, every one of the 661 links would open on a configuration that does not
hold what the page just said it holds. `defaultState().kv` and `data.defaults.kv_cache.default` are
both `f16` today, and the new test asserts it rather than assuming it.

`checkMachineContexts()` now holds the link to the figure beside it: a page may not print one length
and send the reader to another, name the wrong machine or the wrong model, or offer a way in to a
length it has just said the machine does not hold. Proved by breaking it four ways: dropping the
link failed the build on **661** counts, linking at the default context on **626**, at the wrong
machine on **651**, and at the wrong model on **605**.

**Verified.** `npm ci`, `npm test` (170 tests, up from 169 — one new one that round-trips every one
of the 661 links through `parseState()` and checks the configuration still fits), `npx tsc --noEmit`,
`npm run build` all the way through `build:functions` with no workaround, and the four deliberate
breakages above. Measured over HTTP in Chromium at 320, 360, 390, 430, 640, 768, 1024, 1280 and
1440px: **1,701 views, 0 of 3,987 tables scrolling**. The 3 page overflows are `/` at 320, 360 and
390px, which is the calculator's own top bar and is already on the backlog below; no generated page
overflows at any width. Read the table as a picture at 390 and 1280px, and **followed two of the
links in a browser** — the 32k memory-capped row and a 256k one — which land on the right machine,
the right model and the right length, and price the pay-back rather than reporting a model that does
not fit.

**Deploy confirmed.** **Run 81, on `cd33474`, finished green at 13:48 UTC** with `npm ci`,
`npm test` and the full `npm run build` passing on the runner, and republished.

**PR #1 repaired afterwards**, for the eleventh time and from this run's own push: the note under
the machine table again, twice in a row now. Both sides kept in one
note. Rebuilt (189 pages, 183 tests, typecheck clean) and re-measured over HTTP (**1,701 views, 0
overflows, 0 of 4,041 tables scrolling**) before pushing `8b32992`. All three branches merge clean
again.

**What to continue.** The new backlog item this run added is the mirror of what it fixed and is the
top main-reachable one: **the model pages' per-row "Run the numbers" link still opens at the default
32k, in the same row as a Longest context cell saying the machine holds it to 128k or 256k.** The
machine pages now send the reader to the length they print; the model pages do not. Below that the
list is cosmetics again — the leaderboard's height on a phone, the seven long head-to-head titles,
the waterline label's margin on a share card. **The question pages are still the top item overall
and still the biggest win, and still blocked behind three unmerged PRs.** **The live site has still
had no new page since this agent started.**

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

**Merged 2026-09-17 at 21:11**, together with PR #1, and both went out on deploy run 100, green at
21:18 UTC. Two merge commits made a minute apart, neither having seen the other's code, so main was
checked before the deploy could publish it rather than after: `npm test` 196 passing, typecheck
clean, and the full build clean at 227 pages with every card drawn. On the built home page: no
off-origin request, the two font preloads, the graph present and parsing, and no `/s/` page
carrying it. One note for a future run that repeats this check — `npm run build:pages` on its own
fails with "39 pages name an OG card that does not exist" when `public/og/` is older than the page
set. That is the stale card directory, not a fault; `npm run build` draws the cards first and
passes.

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
