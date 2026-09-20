# SEO log

Read this before doing anything. One entry per run, newest first. Pick up the top open item in
the backlog, or the open item the previous run said to continue. Never redo a done item.

**One thing comes before the backlog, once a day.** Run `npm run model-watch`. If it prints a last
checked date that is not today, do the model watch in `seo/MODEL-WATCH.md` before anything else —
new models are what this site is about, and a site that lists last month's is worth less than one
that is a day late on a page. It is ten minutes on a quiet day. If the date is today, another run
has done it and the backlog is the job. Ryan asked for this on 2026-09-18.

## Ryan's side (needs the site owner)

- [ ] **Merge (or close) [PR #17](https://github.com/rlindsey2/sunkcost/pull/17), the home page's
      missing heading.** Opened 2026-09-19. The root URL is the only page on this site with no `h1`:
      all 261 generated pages have exactly one, `index.html` has five `h2`s under nothing, and the
      only static prose inside its `<main>` is 142 words of form labels. The sentence already in the
      top bar becomes the heading, and below 900px, where the bar has no room to paint it, it is
      clipped rather than removed, so a phone and a crawler both still get it. It is a pull request
      rather than a push only because it is the calculator's own head, which is the standing rule.
      No data figure is touched and neither are `src/calc.ts`, `src/compute.ts` or `src/fit.ts`.
      Verified on `main` at `b659506`: 372 tests, typecheck clean, the full `npm run build` with
      `build:functions`, 261 pages with every guard passing, the four breaks that proved the two new
      tests, and the page read rendered at 390, 900 and 1,280px. Measured at thirteen widths from 320
      to 1440px, nothing on the page moves by a pixel. It also takes the duplicated `--ok-text` line
      the backlog had parked for the next pull request touching `src/styles.css`.
      **It collides with PR #16, in one file and one line, and the resolution is a rebuild rather
      than a choice.** Both branches edit `index.html`, so both rewrite the `"/"` hash in
      `seo/page-dates.json`, and neither value is right for the merged tree: it hashes to
      `d47470180e0b4932` where this branch says `c4dbfa4065262b1f` and PR #16 says `eb2f546c5e896018`.
      Take either side of that one line, run `npm run build:pages`, commit what it writes. Committing
      either hash as it stands costs the home page its sitemap `lastmod` in silence. Really merged
      here rather than assumed: 382 tests, typecheck clean, 262 pages with every guard passing. The
      note is on both pull requests too, so whichever you merge second says what to do.
      **It still merges clean with `main` at `479b982`**, checked 2026-09-19 by merging it for real
      in a throwaway worktree and building there: 405 tests, typecheck clean, 307 pages with every
      guard passing. It gains no jump line from that push, because the line is written by the page
      builder and `index.html` is not one of its pages.
      **It still merges clean with `main` at `1d7a98b`**, checked 2026-09-20 with `git merge-tree`
      against a deepened history. This push goes nowhere near `index.html` or `src/styles.css`.

- [ ] **Merge (or close) [PR #16](https://github.com/rlindsey2/sunkcost/pull/16), a new page at
      `/cost-per-month/`.** Opened 2026-09-19, and the only pull request open. It answers *how much
      does it cost to run a local LLM per month*, which is the shape every bill it would replace is
      written in and the one question this site could not answer. It is a pull request rather than a
      push for two reasons that are the standing rules here: it is a new page type, and a page at the
      top level of this site has to be in `FOOTER_LINKS`, which means one `<a>` in `index.html`.
      No data figure is touched and neither are `src/calc.ts`, `src/compute.ts` or `src/fit.ts`.
      Verified before opening, on `main` at `c17c916`: 377 tests, typecheck clean, 262 pages with
      every guard passing, the full `npm run build` with `build:functions`, and the page and its
      share card both read rendered. **It collides with nothing**, because nothing else is open.
      The run entry below has the figures and what reading it rendered changed.
      **It conflicted with `main` at 06:50 on 2026-09-19 and is merged clean again**, as `2c7e5e2`
      on its own branch. The 07:0x run's push added `machineIndexLine` to the same import line this
      branch had already extended with the monthly-cost helpers, so git offered one line where two
      additions belong — the shape the log has warned about twice. Both were kept by hand, which is
      the whole of the merge commit, and nothing else on either side moved. Verified on the merged
      tree rather than assumed: 380 tests, typecheck clean, the full `npm run build` with
      `build:functions`, and 262 pages with every guard passing, including this branch's
      `/cost-per-month/` and main's new machine-index link on 56 pages. `git merge-tree` against
      `main` at `76246da` now reports no conflict. Nothing about the page changed; it is the same
      pull request, still waiting on you.
      **It conflicted again at 15:47 on 2026-09-19 and is merged clean again**, as `f1d02ce`. Same
      file, same line, same shape: `main`'s heading anchors and this branch's monthly-cost helpers
      both extended the import list at the head of `scripts/build-pages.ts`. Both kept by hand, and
      `seo/page-dates.json` rebuilt rather than chosen, which is the rule that already stood on this
      pull request. Verified on the merged tree: 406 tests, typecheck clean, 308 pages with every
      guard passing. GitHub reports it `clean`. Nothing about the page changed.
      **It conflicted a fourth time at 00:47 on 2026-09-20 and is merged clean again**, as `ca9db20`.
      Same file, same import line, and this time `tests/pagekit.test.ts`'s import list as well:
      `main`'s new leaderboard helpers and this branch's monthly-cost helpers, with `MTOK` on a
      different line on each side in both files. Both kept by hand, `MTOK` kept once, and
      `seo/page-dates.json` rebuilt rather than chosen. Verified on the merged tree: 427 tests,
      typecheck clean, 308 pages with every guard passing. Nothing about the page changed. One
      thing to know before you merge: four hashes moved on `main` rather than one, so the rebuild
      of `seo/page-dates.json` matters more than it did — `/leaderboard/`, `/best/`, `/compare/`
      and `/hardware/`.
      **It conflicted a fifth time at 03:49 on 2026-09-20 and is merged clean again**, as `9328a19`.
      Same file and the same import line as the four before it: `main`'s new `hostedSpeedLine` and
      this branch's monthly-cost helpers, with `MTOK` on a different line on each side. Both kept by
      hand, `MTOK` kept once, and `seo/page-dates.json` rebuilt rather than chosen, which moved 222
      lines because the push it is merging re-dated 110 pages. Verified on the merged tree: **437
      tests**, typecheck clean, 308 pages with every guard passing, including this branch's
      `/cost-per-month/` and main's new speed note on 110 pages. GitHub reports it `clean`. Nothing
      about the page changed.
      **It still merges clean with `main` at `1d7a98b`**, checked 2026-09-20 by merging it for real
      in a throwaway worktree and building there: 427 tests, typecheck clean, 308 pages with every
      guard passing. This time the ledger needed nothing — `npm run build:pages` on the merged tree
      wrote no change at all, so there is no line to rebuild and nothing to pick a side of. Run it
      anyway after merging; it is one command and it is the thing that goes wrong in silence.
      **It conflicted a third time at 17:51 on 2026-09-19 and is merged clean again**, as `a81e913`.
      Same file, same import line: `main`'s jump-line rule and this branch's monthly-cost helpers,
      with `MTOK` sitting on a different line on each side. Both kept by hand, `MTOK` kept once, and
      `seo/page-dates.json` rebuilt rather than chosen. Verified on the merged tree: 413 tests,
      typecheck clean, 308 pages with every guard passing. GitHub reports it `clean`. Nothing about
      the page changed, but one thing about it is new and worth knowing before you merge:
      `/cost-per-month/` heads four sections and names no machine or model twice, so `main`'s new
      rule gives it a jump line of its own in the merged tree, without a line of this branch moving.

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

- [x] **Three pull requests became one and it is merged: [PR #15](https://github.com/rlindsey2/sunkcost/pull/15).**
      Ryan asked for this at 02:00 on 2026-09-19, because #8, #10 and #13 all conflicted with `main`
      and with each other; **he merged it at 05:19 and deploy run 202 went green at 05:22 on
      `a5caf81`**, so the `/local-llm-vs-api-cost/` page, the `/hardware/` index and the
      calculator's assumptions panel are all live. Verified on merged `main` rather than assumed:
      367 tests, typecheck clean, the full `npm run build` with `build:functions`, **261 pages**,
      every guard passing, and both new pages read out of `dist/` — 1,708 words at `/hardware/` and
      1,497 at `/local-llm-vs-api-cost/`, both in the sitemap.
      **What to keep from it, because it will happen again.** Where two branches each append to the
      same place in a file — a page builder, a share card, a `describe` block at the end of a test
      file — git does not offer two blocks to choose between. **It interleaves them into one broken
      function**: one side's opening, the other's body, a single shared `return`, with the first
      side's tail swallowed as common context. A union of the marked hunks compiles to nothing
      sensible and silently drops that tail; `tsc` caught it at 21 errors the first time, and
      `git apply -3` gave cleaner blocks and the same fault one level down, because the closing
      lines are common text too. **Take each side's block whole from its own branch and splice both
      in**, then hand-merge the import lists. Four later repairs by sibling sessions hit the same
      shape twice more, in `tests/pagekit.test.ts` and at the end of `src/pagekit.ts`.
      **The one thing that repair flagged is now fixed.** `/hardware/` priced seven cards, said the
      card-alone caveat and did not link the ranking, which made it the only page on the site
      outside the rule the 04:31 run had just written — and the guard could not catch it, because
      `/hardware/` did not exist on `main` when the rule was made. Pushed as `87a6a6d`: one
      `${cardRankingLine(data)}` in that note, and `/hardware/` added to `checkCardRanking()`'s list
      of indexes, so it cannot come back. 90 pages become 91, and with the sentence removed the
      build fails naming the page, exit 1.
      **#8, #10 and #13 are left open rather than closed**, in case you would rather look at them
      separately; closing them is a click and nobody should do it but you.
      **Ryan was notified about the queue at 01:55 on 2026-09-19**, before he asked for this; that
      was the first ping about it and it should not be repeated unless something changes.

- [ ] **The leaderboard tells visitors 26 models carry an estimated score, and 15 do.** Found
      2026-09-20 while holding the rest of that page to its data. `frontier_basis.estimated_note`
      in `data/defaults.json` ends *26 of the models here carry that mark*, and the sentence is
      printed whole under *How to read the scores* on `/leaderboard/` and again, in bold, in the
      calculator's own panel whenever the selected model's score is estimated. Counted from
      `data/models.json`: **16 models carry `estimated`**, and 15 of them have a row on the
      leaderboard, where the page prints 15 asterisks. So the figure a reader can count on the page
      and the figure the page states about itself differ by eleven.
      Nothing about a score changes either way, and no model is marked wrongly — only the count of
      them is stale, which is what happens to a figure written by hand into a data file. It is two
      edits for you and neither is the agent's: end the sentence at *running the full v4.3 suite.*
      and let the pages count the marks, or correct the number to 16. If you would rather the page
      wrote the count itself, say so and the leaderboard can print it the way it now prints its own
      row counts; the calculator's copy of the sentence is `src/render.ts` and would be a pull
      request.

- [ ] **Two one-line data faults, both surfaced on 2026-09-18 by naming the source links, and both
      in files the agent must not edit.**

      **The calculator prints a `TODO:` to visitors.** `electricity.source` in `data/defaults.json`
      reads "US EIA average residential retail price, ~17 cents/kWh in 2025. TODO: confirm the latest
      monthly figure at eia.gov/electricity/monthly and update", and `src/render.ts:547` prints the
      field whole in the assumptions panel. Confirmed rendered in Chromium on the built site: open
      Assumptions on sunkcost.ai and the note is there, maintainer sentence and all. It is the one
      rule this repository holds everywhere else — no process language in anything a visitor reads —
      and it is live. The fix is to end the sentence at "in 2025." and keep the reminder wherever
      reminders live; the figure itself is sourced and right, so nothing about the maths changes.

      **Gemma 4 31B cites the same Hugging Face repository twice.**
      `google/gemma-4-31b-it/raw/main/config.json` and `google/gemma-4-31B-it/raw/main/config.json`
      are both in that model's `sources` in `data/models.json`, differing only in the case of one
      letter. It was invisible while the page said "source 2, source 3"; now the page prints the two
      repository names side by side and they read almost identically. One of them is the typo —
      Hugging Face's own repository is `google/gemma-4-31b-it` — and dropping it leaves the page with
      two sources instead of three. No figure changes either way.

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

- [x] Merge (or close) **[PR #14](https://github.com/rlindsey2/sunkcost/pull/14)**, the waterline's
      time axis. Opened 2026-09-18. It is the one open pull request that fixes something a visitor
      can hit today: the axis labelled every hundredth year past a 600-year horizon, so three share
      cards are 6 to 10 MB of stacked text and the calculator puts up to 68,747 SVG text nodes into
      the page when a reader picks one of those machines. It is a pull request rather than a push
      only because it changes what the calculator draws — 520 of the 2,970 charts it can draw, all
      at horizons over 600 years. `src/waterline.ts` alone, 310 tests, three guards each proved by
      a break. **Really merged into `main` at `ca87234` in a worktree and built there**, rather than
      trusted to a clean `git merge-tree`: 310 tests, typecheck clean, 253 pages, validate clean but
      for the two null prices that are already on your side of this file. It collides with nothing —
      `src/waterline.ts` is in no other open branch. Note that no workflow runs on `pull_request`
      here, so GitHub shows no checks on it at all; the figures above are from this environment.
      **Merged 2026-09-19 at 02:19**, half an hour after it was opened, on the same deploy as PR #12:
      run 190 on `3ccf04b` went green at 02:22 and published, so both are live. PR #12's own run 189
      was cancelled by that push a minute later, as usual. Merged `main` was checked here rather than
      assumed: **326 tests**, typecheck clean, the full build with `build:functions`, 253 pages, and
      the 1,894 cards re-measured off merged `main` — **worst axis 5 ticks, biggest card 6 KB, and no
      label outside the card's text column**, where it was 68,747 ticks, 10,488 KB and every card.
      Nothing is left here.

- [x] Merge (or close) **[PR #13](https://github.com/rlindsey2/sunkcost/pull/13)**, the calculator's
      assumptions panel. **Merged 05:19 on 2026-09-19**, inside PR #15 with PR #8 and PR #10; deploy
      run 202 finished green at 05:22 on `a5caf81`, so all three are live. Verified on merged `main`
      rather than assumed: 367 tests, typecheck clean, 261 pages with every guard passing, and the
      panel read out of the built bundle in Chromium — a card's four sources named after their
      publishers, its bandwidth sum under the new Memory bandwidth row, its availability sentence
      under the price and `stand-in` spelled as a word. One thing seen while checking it, which is
      the same note PR #7 left and is not a fault: `build:pages` alone fails `checkOgCards()` on a
      stale local `public/og/`, naming the eight cards the combined branch added; `build:og` first
      clears it, and the deploy draws them every time, so it cannot reach CI. Opened 2026-09-18. It fixes three things the generated pages fixed weeks
      ago and the panel kept: a power figure printed as the data's own key (*140 W, stand in*), the
      whole of `hw.notes` under Usable memory so a graphics card explained its bandwidth arithmetic
      under its memory, and source links named *source 1, source 2, source 3* — the last place on
      the site naming a link after a number. It is a pull request because it is `src/render.ts`.
      **It collides with nothing**: really merged into PR #8, PR #10 and PR #12 in worktrees, all
      three green, and the 253 generated pages come out byte-for-byte identical to `main`'s.

- [x] Merge (or close) **[PR #12](https://github.com/rlindsey2/sunkcost/pull/12)**, three lines of
      `src/styles.css` that fix the calculator's top bar. **It collides with nothing**: PR #8 and
      PR #10 touch nine files between them and neither goes near `src/styles.css`, and no test spans
      that file and anything they do touch, which is the clause PR #9 got wrong. Opened 2026-09-18.
      It is a pull request rather than a push because it is the calculator's own head, which is the
      standing rule here. What it fixes: the page scrolled sideways at every phone width from 320 to
      373px; the "Data checked" stamp sat mid-bar with the right gutter empty at every width from 374
      to 899px; and the theme button drew a sun and a moon at once in the default light state, which
      is what a first visit and a crawler both get. 274 tests, typecheck clean, the full build, and
      0 elements past the window at 26 widths where three were.
      **Merged 2026-09-19 at 02:18**, and deploy run 190 carried it: its own run 189 was cancelled by
      the PR #14 merge a minute later, and 190 went green at 02:22 on `3ccf04b`, which has both. One
      thing this unblocks: the `--ok-text` duplication in `src/styles.css` was left for "the next pull
      request that touches that file", and there is no longer one open, so it now wants a home of its
      own or the next run that opens a branch against the calculator's styles.

- [x] **Merging PR #10 puts 23 KB of build output into `main`, and PR #8 will not clean it up.**
      Done 2026-09-18 at 19:11 and 19:25, on both sides, and the item was one step behind what had
      already happened: **the file was on `main` too**, added by `4c8d826` — a log commit from another
      session that swept it up the same way PR #10's repair merge did. `main` has no builder for it,
      so nothing regenerated it, nothing linked to it and the sitemap never listed it; but vite copies
      `public/` into `dist/`, so **every deploy since 18:14 published a two-day-old copy of an unmerged
      branch's page**. Untracked on `main` with the path ignored beside the other generated
      directories (`885cc38`, deploy run 168 green at 19:16), and untracked on PR #10's branch
      (`e7be231`), which is the `git rm --cached` this item asked for. Merging PR #10 no longer puts it
      back. The page itself is fine and returns, generated fresh, when PR #8 merges.
      What was written when only half of it was known: PR #10's branch tracks `public/local-llm-vs-api-cost/index.html`, a generated
      page, and it is **PR #8's page rather than its own**. It arrived in `f87b28e`, a repair merge
      that swept up an untracked file; it was untracked but not ignored because the `.gitignore` line
      for that directory is part of PR #8's diff and lives on PR #8's branch, not on `main`. An ignore
      rule does not untrack a tracked file, so merging PR #8 afterwards leaves it there, and every
      build will then show it modified. **One `git rm --cached public/local-llm-vs-api-cost/index.html`
      on PR #10's branch settles it.** Same shape as the `public/og/og/` find and three orders of
      magnitude smaller. Left rather than pushed because PR #10 is not that run's branch and this file
      records three hours lost to two sessions repairing one branch a minute apart.

- [x] Merge (or close) [PR #8](https://github.com/rlindsey2/sunkcost/pull/8), a new page at
      `/local-llm-vs-api-cost/` answering "local LLM vs API cost" with the site's own numbers.
      **Merged, and the session that opened it was woken by the merge and checked the result at
      05:20 on 2026-09-19.** It had been open since 02:05 on 2026-09-18 and was repaired several
      times; the repair history is in the run entries rather than here.
      Merged `main` was verified rather than assumed: **367 tests, typecheck clean, 261 pages with
      every guard passing**, and the full `npm run build` including `build:og`, `build:share` and
      `build:functions`. `checkTokenCost()` still recomputes the page's own claim on the merged
      tree and reports what it reported the day it was written — 27 models priced both ways and
      **7.97B tokens paying the machine back at all five levels of use** — so a day of other
      people's changes has not moved a figure on it. The page reads back at 1,498 words, title 50
      characters, description 136, and it is in the sitemap.
      **The build-output fault the item above predicted did not come back.** That item warned that
      merging this PR would leave `public/local-llm-vs-api-cost/index.html` tracked on `main`,
      because an ignore rule does not untrack a tracked file. It was untracked on both sides before
      the merge, and `git ls-files` on merged `main` lists nothing under that directory or under
      `public/best-gpu/`. Nothing is left on this item.
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

- [x] **The site printed 995 speeds and never said whether one of them is quick.** Done
      2026-09-20, pushed as `6df11bd`. A reader meets *19 tok/s* in a column and has nothing to
      hold it against; the thing they are actually choosing between is a hosted API, and the site
      had that yardstick all along and only the calculator used it. `cloud.default_tokens_per_sec`
      in `data/defaults.json` is 80 tok/s, the speed the calculator times a local answer against
      and one the reader can change, and `src/render.ts` has printed it beside a local figure since
      the panel was written. The 56 machine pages and 54 model pages, which is where a reader
      actually lands from a search, printed 661 and 334 bare figures between them.
      One sentence under each of those tables now names the figure and counts the rows above that
      reach it. **128 of the 995 do**, and the shape of the answer is the page's own: on **49 of
      the 110** nothing listed reaches a hosted API at all, on **55** some of it does, on the **6**
      that list one machine that one falls short, and there is no page here where every row
      listed reaches it. `hostedSpeedLine()` counts the speeds as the table draws them rather than
      the precision behind them, so a reader counting the column gets the same answer, and
      `checkHostedSpeed()` recomputes every figure in the sentence out of the rendered table rather
      than out of the helper that wrote it. The run entry below has the six breaks that proved the
      guard and the two that proved the tests.
      **What it deliberately leaves, so the next run does not read it as a gap.** `/hardware/` and
      `/leaderboard/` both print a speed column too, and neither takes the sentence: a speed on
      `/hardware/` is each machine's own best model rather than one model across machines, so a
      count of rows clearing 80 tok/s there would be counting 56 different questions. Worth
      revisiting only if the index ever holds one model still. The head-to-heads say their two
      speeds in prose that already compares them, which is the line `checkSpeedBasis()` drew and
      this keeps.

- [x] **No generated page carried `og:url`. All 307 do now.** Done 2026-09-20, pushed as
      `0f2afd0`. Every page says its own address in the card, the same one its canonical claims,
      and `checkCanonicals()` holds the two to each other so a page cannot ship sharing as
      somewhere it is not. The 307 files differ from the previous build by that one line and by
      nothing else: `sitemap.xml` is byte for byte identical and no page moved the day its words
      last changed, because the tag sits in the head, outside the title, the description and the
      `<main>` the ledger fingerprints. The run entry below has the three breaks that proved the
      guard and the three that proved the tests.
      **The home page is the one line left, and it is on the item below rather than done here.**
      The original item follows. Measured 2026-09-20 over all 308 pages. Every one carries a correct `rel=canonical`, `og:title`,
      `og:description`, `og:image` and `twitter:card`, so a share renders right; what is missing is
      the tag Facebook, LinkedIn and Slack use to decide that `…/?utm_source=x` and the clean URL
      are the same object. Without it a shared link with a tracking parameter counts as its own
      page. It is one line in `head()` in `src/pagekit.ts` and one in `index.html`, so the
      generated pages are a push and the home page is a pull request. Small, and worth a cheap run
      rather than a page of its own.
      Two other absences on the generated pages are not faults and were checked rather than
      assumed: `twitter:image` and `twitter:description` are missing on all 307, and X falls back
      to `og:image` and `og:description`, so adding them would be the same two strings twice. The
      home page carries both, which is where the asymmetry comes from.

- [ ] **The home page is the one page on this site with no `og:url`, and it is the one most
      likely to be shared.** Left 2026-09-20 when the other 307 got theirs. It is a single
      `<meta property="og:url" content="https://sunkcost.ai/" />` beside the canonical already in
      `index.html`'s head, and it is a pull request rather than a push because `index.html` is the
      calculator's own head, which is the standing rule. **It is deliberately not a third branch.**
      Both open pull requests already rewrite the `"/"` hash in `seo/page-dates.json` — the
      collision PR #16 and PR #17 both carry a note about — and `index.html` is fingerprinted
      whole, so a third branch touching it adds a third value for one line nobody can pick between.
      The cheap way is for it to ride PR #17, which is already one line in that file's head, or to
      go up on its own the first run after both are settled. Worth noting that the /s/ share pages
      are built from `index.html` and already set their own `og:url`, so nothing the site shares
      today is wrong; the home page simply says nothing.

- [ ] **1,532 distinct query URLs point at the home page, and that is the right number. Nothing to
      do.** Measured 2026-09-20: the prefilled calculator links are 2,918 `<a>`s across the built
      site, 1,532 of them distinct, every one of them `/?hw=…&m=…&u=…`. The server ignores the
      query string, so all 1,532 serve `index.html` byte for byte, and `index.html` carries
      `rel=canonical` to `https://sunkcost.ai/`: each one tells a crawler exactly what it is, which
      is the textbook handling and better than blocking them in `robots.txt`, which would stop the
      crawler reading the canonical it needs. Written down so a future run reads Search Console's
      *alternate page with proper canonical tag* on this site as working rather than as a fault,
      and does not reach for a `Disallow` line.

- [x] **The sitemap knew when every page last changed and no page said so itself.** Done
      2026-09-20, pushed as `ab123f2`. All 307 generated pages carry `dateModified` on their
      `WebPage` node, the same day and out of the same ledger the sitemap reads. A sitemap is a file
      the reader never sees and the crawler has to take on trust; the page repeating the claim is
      what makes it checkable. The stamp goes on in `write()`, after the body is final, and lands in
      the head, outside the title, the description and the `<main>` the fingerprint is taken over,
      so dating a page cannot move the date it is given: `seo/page-dates.json` is unchanged by the
      push and every page kept its day. `checkPageDates()` holds four more claims, read out of the
      markup rather than out of the string that wrote it. The run entry below has the five breaks
      and the two tests that were proved by breaking them.
      **The home page is left out and it is not a gap.** `index.html` is fingerprinted whole rather
      than by its `<main>`, so a date written into it would be inside its own fingerprint and would
      make itself wrong. That is the difference between the build's two counts, 308 and 307.

- [x] **The index of all 190 head-to-heads named five of the seven rules that cut it, and two of
      the three on its model side.** Done 2026-09-19, pushed as `a868268`. 50 of the 189 rows — the
      4 chip-step pairs, the 21 price neighbours and the 29 memory neighbours — sat under an
      explanation that did not reach them, because the price-neighbour rule landed one day and the
      memory-neighbour rule the next and neither run went back to `/compare/`. Both sentences are
      written from the rules now and `checkMatchUpKinds()` holds the list to them both ways, so a
      rule added without a clause fails the build. Seven clauses also stopped being a sentence: at
      170 words and six semicolons they are a list, one rule to a line. The run entry below has the
      table of rules, the four breaks and the measurement that says the other 306 pages did not move.

- [x] **All three of those pages are done: `/best/`, `/hardware/` and `/leaderboard/`.**
      `/leaderboard/` was the last and the biggest, done 2026-09-20 and pushed as `57722ae`. What
      it was not saying was not a drifted sentence either: the table keeps one row per model, and
      the second build of a model — same weights, heavier quantisation, its own download, its own
      page — was dropped in silence. Llama 3.1 8B Instruct at Q8_0 and Qwen3 32B at Q8_0 were in no
      row, in no count and not in the note that lists the models the index has not scored. Both are
      named in their own rows now, `leaderboardRows()` carries the cut and says why it keeps the
      lightest build, and `checkLeaderboardBuilds()` holds four claims, three of them read back out
      of the rendered page. The page's own print is the accounting: **all 55 models this site
      prices are named on it, 48 ranked rows, 2 of them naming a heavier build, 5 in the unscored
      note.** The run entry below has the five breaks and the three that proved the six new tests.
      **What it leaves, deliberately.** Two sentences on that page are still hand-written claims
      about the data and neither is wrong today: *the hosted models from Anthropic and OpenAI*,
      which is true of all eight rows in `frontier_reference` and would quietly stop being true the
      day a Gemini row is added; and the count of estimated scores, which is wrong today and is in
      a file the agent must not edit, so it is on Ryan's side above.
      The original item follows.

- [ ] **Two of those three pages were left: `/hardware/` and `/leaderboard/`.** `/best/` is done,
      pushed as `5627008` on 2026-09-19, and the item's own guess about it was too kind: the sentence
      was not drifted, it had never been written. The page listed the three quickest models in a
      class and said neither that number nor that 23 other models pay back behind them. It now prints
      the cut from `BEST_PER_CLASS` and counts what each class leaves out, and `checkBestCuts()` holds
      the page to both. The run entry below has the table and the five breaks.
      **`/hardware/` is half-done and `/leaderboard/` is untouched.** The one claim on `/hardware/`
      that was measurably false — 56 configurations priced where 54 are — is held by
      `checkPricedRows()` as of `e0b6b23`. What is still hand-written there is the rest of the same
      lede and the assumptions note: the count of models at 32k, the order the families are in, what
      usable memory means. `/leaderboard/` is where the next run should go, because nothing on it is
      held at all: it says what its table holds, what the ranking is and where the hosted rows come
      from, all in prose beside figures the build recomputes.
      Found 2026-09-19 while fixing `/compare/`,
      which had drifted by two rules on one side and one on the other. `/hardware/` and
      `/leaderboard/` each say in their own words what their table holds and how it is cut — which
      machines are in it, what the ranking is, where the hosted rows come from — and every one of
      those sentences is hand-written next to a figure the build recomputes. The cheap version is the
      shape `checkMatchUpKinds()` and `checkBestCuts()` both took: name the rule in one place, let the
      page print it, and let the build fail when the two disagree. One page a run, and only where the
      sentence really is a claim about the data rather than about the reader.

- [x] **`/hardware/` said the site prices all 56 configurations, and it prices 54.** Done
      2026-09-19, pushed as `e0b6b23`. The lede opened *All 56 configurations this site prices, in
      one table*, and the Mac Studio M5 Ultra, 512GB and the Framework Desktop, 192GB have no
      published price, so their own rows read *not published · price it yourself* under a sentence
      promising a price for every machine in the table. It lists 56 now and prices 54, and it names
      the two, which is the part a reader can act on: those are the two rows the calculator wants a
      number for. `publishedPriceLine()` writes the count from the data and `checkPricedRows()`
      holds four claims about it, one of them read back out of the rendered table rather than taken
      from the array that wrote it. One page's words moved and no figure, row or count changed. The
      run entry below has the four breaks and the two that proved the tests.

- [x] **A class on `/best/` counted the models it left out and named none of them.** Done
      2026-09-20, pushed as `1d7a98b`, and the item's own guess about the cheapest honest version
      was the one that got built: the aside under each class names the next model down — the
      quickest pay-back past the cut, with its machine and its figure — rather than the fourteen.
      All 15 classes across the five levels leave one out, so all 15 name one. The count alone was
      a dead end: it sent a reader who wanted the fourth-best buy to `/leaderboard/`, which is
      ranked by score, a different order from the one they were reading. `checkBestCuts()` holds
      four more claims, read out of the aside itself rather than out of the sentence written from
      it, and the run entry below has the six breaks that proved them.
      **One thing it had to fix to be worth doing.** Held on one line the longer aside took the
      table to 1,263px against the 936px the page is given, and what went off the right edge was
      the pay-back column — the one figure every row there is read for. `.board .c-note` wraps it.
      Measured at four widths before and after: 936px at 1280 and 1440, unchanged at 900 and 390.
      The original item follows.
      Left
      deliberately by the 2026-09-19 run rather than missed, because naming them is a different page:
      14 models under one class, each wanting its machine and its figure to be worth reading, is the
      table again rather than a note under it. The lede points at `/leaderboard/`, where every model
      is ranked with its class beside it, and that may well be the whole answer. Worth weighing once
      rather than drifting into: the cheapest useful version is probably the next model down in each
      class by name, which is one link and one figure, not fourteen.

- [x] **Every heading on the 56 machine pages and the 55 model pages called the page's own subject
      "it".** Done 2026-09-19, pushed as `f2e2d2d`. *What it runs*, *Machines that run it*, *How good
      is it, really?* — 284 headings across 111 pages and not one named a machine or a model. The
      `h1` above them does, so a reader from the top was never lost; a reader from a search result
      lands on the heading that matched what they typed, and a pronoun there answers a question about
      nothing. All 284 name their subject now. The 146 left are the spec list and the shorter-window
      sections, which are about the page's own furniture and carry no pronoun either. No figure,
      table, link or count changed. The run entry below has the rule, the guard and the six breaks
      that proved it.

- [x] **The site held the answer to "what can I run with 32 GB" and asked it under a heading that
      reads as a statement.** Done 2026-09-19. `/how-much-memory/` asks four questions in its own
      headings and every one of them starts from the model — *How much memory for a 70B model?* The
      reader with a machine already on the desk starts from the other end, and the memory ladder has
      answered that since it was built. It was headed *Installed memory is not usable memory* and
      keyed on usable memory, so the three rungs a 32 GB machine can land on sat at 21, 24 and 31 GB
      with a 36 GB machine in between: a reader with 32 GB met their own size three times, never
      together, with nothing to say which row was theirs. Keyed on the number printed on the box now,
      with the heading asking the question and each of the 13 rows opening the calculator. No figure,
      machine or count changed. The run entry below has the six breaks that proved the guard and the
      one thing the re-sort would have broken silently.

- [ ] **The question now has a heading and still has no page of its own.** *What can I run with
      16 GB*, *what LLM fits in 24 GB of VRAM*, *is 32 GB enough for a local model* are three
      different searches, and one table under one heading on `/how-much-memory/` answers all three at
      once. Each is a page's worth of answer on its own: the models that fit at that size, what each
      one leaves for context, the cheapest machine that gets there, and what the next size up buys
      that this one does not. Every figure is already computed — `fitCount()`, `strongestThatFits()`,
      `longestContext()` and the pay-back helpers — so nothing would need inventing.
      **Two things to settle before a line of it is written.** The first is what stops it being nine
      near-copies: a page per size is nine pages whose model tables nest inside one another, and the
      honest cut is probably *what this size adds over the one below*, which is the only part that
      differs. The second is that a size is not a machine — 32 GB hands a model 21 GB on one machine
      here and 31 GB on another — so a page titled by a size has to carry that split in its first
      paragraph or it is a page that misleads at the top.
      It is a new page type and a top-level page, so it is a pull request and one `<a>` in
      `index.html`, which is the standing rule. Worth doing when the two open pull requests are
      settled rather than queued behind them.

- [x] **One page on this site could be linked to by section, and no heading anywhere could.**
      Done 2026-09-19, pushed as `e932be3`. All 1,177 section headings across the 307 pages carry
      the id their own words slug to, and the five anchors on `/best/` are no longer the only ones
      on the site. The sitemap objection that parked this item was void on the day it was taken:
      every one of the 307 pages had already changed today, so 307 hashes moved and **no date
      moved**. `/best-gpu/`, which had never carried a recorded date at all, gained one.
      `checkHeadingAnchors()` holds four claims and the run entry below has the four breaks that
      proved them, plus the measurement that showed no word a visitor reads changed.
      **What it deliberately leaves for the next run, so nobody reads it as a gap.** The anchors
      exist and nothing yet points at them; that is the item below. And `h2` is the whole job, not
      half of it: the 307 pages carry 307 `h1`s, 1,177 `h2`s and **no `h3` at all**, so there is no
      second level of heading waiting for the same treatment.

- [x] **Half of it is done: the links that name a section now land on it.** Done 2026-09-19,
      pushed as `09911ca`. 448 links on 303 pages, ten of them in the source. The cut is the link
      whose own words name one section and where that section is the whole answer, and the measured
      thing that set it is worth keeping: **not one internal link on this site has a heading for its
      text.** All 8,930 of them are written as prose, so a rule matching link text against the
      target's headings would have re-pointed nothing. What the site does have is ten sentences that
      name a section's subject in their own words, and they were carrying 448 of the links.
      `sectionLink()` writes the address out of the section's own heading, the way `anchoredHeading()`
      writes the heading, and `checkSectionLinks()` holds three claims across every page. The run
      entry below has the figures, the four breaks and the three links the cut deliberately leaves
      pointing at the top of a page.

- [x] **The other half: 1,172 sections had nothing pointing at them, and the *Jump to* line was what
      would change that.** Done 2026-09-19, pushed as `479b982`. 148 pages offer 610 jumps into their
      own sections where `/best/` alone offered five, and 565 sections are left with nothing pointing
      at them against 1,167. Both things the item said to settle are settled and written into the
      code: the line goes **above the first `<h2>`**, not under the lede, because on a head-to-head
      the lede, the table and the calculator links are the answer and a contents line in front of
      them pushes it down; and the cut is **a rule the build holds**, four sections or more and at
      most one heading repeating a name the page's own `h1` carries, rather than a list of page types
      somebody has to remember to keep current. The run entry below has the figures, the five breaks
      that proved `checkJumpLines()` and the two that proved the tests.
      **What it turns away, so none of it reads as a gap:** the 55 model pages and 19 machine pages
      by the name count, 37 machine pages and 45 head-to-heads by the four-section floor, `/compare/`
      at two sections, and `/best/`, which keeps the shortened line it wrote for itself because each
      of its headings carries a second clause.

- [x] **`/hardware/` and `/leaderboard/` head no sections at all.** Done 2026-09-19, pushed as
      `c6c4753`. Each heads four sections now, both tables stay whole, and both pages picked up
      anchors and a jump line from the rules already in the build — 1,185 section headings on the
      site where there were 1,177, and 150 pages offering a way into their own sections where there
      were 148. **The item's own guess was the one answer the markup forbids**: an `h2` cannot sit
      inside a `<table>`, so sections over groups of rows means several tables, and a reader
      comparing 56 machines on price wants one table to read down. The sections are the argument
      each page already makes instead, and nothing was written for the occasion. `checkPageSections()`
      now holds that every page heads at least one section and none heads a section in its own
      title; the run entry below has the figures and the two breaks that proved it. What it leaves,
      because it is a smaller version of the same thing: `/compare/` is now the thinnest page on the
      site at two sections, which is the item below. The original follows.
      Measured 2026-09-19 while the
      jump lines were being cut. They are two of the site's four top-level indexes — 56 machines on
      one, 55 models on the other — and each is linked from the footer of all 306 other pages, but
      each is a single table under an `h1` with not one `h2` on it. So nothing can link
      into either by section, a search result cannot offer a jump into one, and neither can carry a
      jump line however many rows it grows to. Every other index on the site heads five sections or
      more.
      **The two things to settle before a line of it is written.** The first is what the sections
      are, and it has to be the reader's own question rather than a heading over an alphabetical cut:
      on `/hardware/` the candidates are the shape of the thing you are buying (a laptop, a small
      desktop, a workstation, a card that needs a PC around it) or what it holds, since memory is
      what the whole site says decides it; on `/leaderboard/` it is the size bands `SIZE_BANDS`
      already names. The second is whether one sorted table becomes several, which changes what the
      page is — a reader comparing 56 machines on price wants one table they can read down, and
      cutting it into four is a worse page with better headings. A table that stays whole with
      section headings above named groups of rows is the likelier answer, and it is `<tbody>` per
      group rather than a new page type, so it stays a push.

- [x] **`/compare/` headed two sections and was the thinnest page on the site.** Done 2026-09-19,
      pushed as `a97e551`. It heads four now and offers a way into all four, and the item's own
      question — whether the page has a third thing to say that is not filler — was answered by
      reading it: **it had two, and both were sitting as unheaded prose at either end.** Its own
      answer about what the 53 machines compared here hold opens the page under the lede, and its
      assumptions close it under the last table, the same two things `/hardware/` and
      `/leaderboard/` had headed the run before. Nothing was written for the occasion, no sentence
      changed, and the rules cutting the match-ups stay where they were, under the two headings
      they already explain. The run entry below has the figures and the three breaks.
      The original follows. Measured
      2026-09-19 after the two indexes above were cut. 111 machine match-ups sit under *Machine
      against machine* and 78 model match-ups under *Model against model*, which is an honest cut
      of what the page holds — but two sections is below the floor a jump line wants, and the page
      says nothing of its own before it starts listing the way `/hardware/`, `/leaderboard/` and
      `/compare/`'s own siblings do. **What to settle before a line is written**: whether the page
      has a third thing to say that is not filler. The candidates are what the rules cutting the
      match-ups actually are — each machine against the family flagships and the cards, each model
      against the next one down, the model it replaced and the model nearest it in memory — which
      is the one question a reader of an index of 189 pairs has that the table does not answer.
      Both section headings are named in `SECTIONS` and linked from other pages by name, so neither
      can be reworded without `checkSectionLinks` saying so, which is the guard doing its job.

- [x] **Two sections on one page could carry the same words and the build said nothing.** Done
      2026-09-19, pushed as `1165130`. The guard holds the words now as well as the addresses, and
      its print says which of the two it is holding. The item's own account of the fault was right
      and understated the proof: the old build was run with a repeated heading on `/compare/` before
      the claim went in, and it did not merely pass — it shipped `id="machine-against-machine-2"`
      and a jump line reading *Machine against machine · Model against model · Machine against
      machine*, which is the reader being offered the same words twice. No page output changed: all
      307 pages and the sitemap are byte-for-byte what they were, compared build against build, and
      no hash moved in `seo/page-dates.json`. The run entry below has the four breaks.
      **What it deliberately leaves in place, so nobody reads it as a leftover.** `anchorHeadings`
      still numbers a repeated slug, and the guard still accepts a `-2` or `-3` id. Neither is dead
      code being tidy: the numbering is what keeps an id unique for a browser if one ever slips
      through, and accepting it is what makes the build fail with the one message that names the
      real fault — the words — rather than with two, the second of which is about a slug.

- [x] **Thirteen titles ran past the 60 characters a search result shows, and ten of them lost the
      second machine's memory size.** Done 2026-09-19, pushed as `a0ec560`. The build has printed
      the count as a warning for days; nobody had read it. Nine of the ten carried a MacBook, and
      every one spent ten characters on a screen size that separates nothing: this site prices one
      MacBook Pro M5 Pro and one M5 Max, both 16-inch. A title may now leave the bracket out where
      no other machine here answers to the name without it, and must keep it where one does — which
      it is, for the two MacBook Air M5s at 16GB. 304 of 307 titles fit now. The page's heading, its
      description and every other label on the site keep the full name, and no page body changed.
      The run entry below has the figures, the four breaks that proved the guard, the hole the first
      version of it had, and the two that proved the tests.

- [ ] **Three titles are still longer than a search result shows, and none of them can be cut
      honestly.** Measured 2026-09-19, after the item above took the other ten.
      `/compare/nemotron-3-5-lightning-30b-q4-vs-qwen3-235b-a22b-2507-q4/` is 63 characters and
      `/compare/deepseek-r1-distill-qwen-32b-q4-vs-deepseek-r1-distill-llama-70b-q4/` is 61: both
      are model pairs, and *Qwen3 235B-A22B Instruct 2507* and *DeepSeek-R1-Distill-Llama-70B* are
      what their publishers call them, so a shorter form would be a name nobody uses. Worth
      revisiting only if `data/models.json` ever carries a short name a publisher itself uses; the
      agent must not invent one. The third,
      `/compare/macbook-air-m5-15-inch-16gb-vs-nvidia-rtx-pro-6000-blackwell-96gb/` at 62, is the
      one pair where the screen size is load-bearing — two Airs at 16GB — against a chip name that
      is already as short as NVIDIA writes it. Nothing to do on any of the three. Written down so
      the next run reads the build's *3 titles over 60 characters* as considered rather than as a
      gap.

- [x] **The two rules cutting the model head-to-heads both asked what a model is, and neither
      asked what to run in the memory you already have.** Done 2026-09-19. Each model against the
      next one down the index, and each last-generation model against what replaced it, are both
      questions about the model. The reader with a machine already on the desk starts from the
      other one: 19.7 GB at 32k of context is Gemma 3 27B or Devstral Small 2 24B, and nothing here
      put those two side by side. Third rule now: each model against the model from another family
      nearest it in the memory it needs, stronger side first, within a tenth. 78 model match-ups
      where there were 53, 307 pages where there were 282. The run entry below has the figures, the
      five breaks that proved the guard and the three that proved the tests.
      **What it deliberately does not add, so the next run does not read it as a gap:** the pages
      carry no new section. The comparison template already prints what each model needs at 32k in
      its own row, and where both models fit the same machines it already says, under *Memory is
      not what separates them*, that the choice is what each is good at rather than what you have
      to buy. A paragraph repeating that is the filler this backlog exists to avoid. What is new is
      the sentence naming the others, on the model pages and under each head-to-head.

- [ ] **The memory cap is a round number too, and on this data it decides nothing.** A tenth, the
      same figure the price-neighbour rule uses, and the same story: the widest pair it keeps is
      8.7% apart and the nearest one it turns away is 12.7%, so anything between those two cuts the
      same 29 pairs. The pair it excludes today is Gemma 4 E4B against Ling 3.0 tiny, 5.8 GB against
      6.4 GB, which is a real question for anyone with 8 GB to spend it in. Worth revisiting when a
      figure in `data/models.json` moves and the gap between 8.7% and 12.7% closes. Written down
      2026-09-19 so the next run does not read the number as considered.

- [ ] **The 25 new head-to-heads are the shortest real pages on the site**, 686 to 852 words against
      a site median of 1,024, and the reason is the rule that cut them. Two models that need the
      same memory run on the same machines, so the *Machines that run one and not the other* table
      is a sentence on 21 of them instead of a table of six. Nothing is missing from them: the
      comparison table, the like-for-like race, pay-back at five levels and the prefilled calculator
      links are all there. Measured 2026-09-19 and left alone, because the thing that would lengthen
      them is words rather than answers. Worth a look only if one of them starts ranking and reads
      thin next to what it is ranking against.

- [ ] **Standing, daily: the model watch.** `seo/MODEL-WATCH.md` holds the procedure, the last
      date it ran and the ledger of candidates. This never gets ticked; it comes round again
      tomorrow. Set up 2026-09-18 at Ryan's request, with `npm run model-watch`, five guards in
      `tests/model-watch.test.ts` and one candidate already in it.
      **The open question it raises is Ryan's**, and it is on his side of this file: the watch can
      record a model and everything it still needs, but it cannot write `data/*.json`, which is the
      rule that keeps every figure on this site sourced. So a found model waits on him.

- [x] **A machine page printed 661 speeds and said of none of them whether anybody measured it.**
      Done 2026-09-19, and the count that settled how much it mattered is the one nobody had taken:
      of those 661 figures **exactly one is a measurement**, 103 tok/s for gpt-oss-20b on the GeForce
      RTX 4080. Every row says *measured* or *estimated* now, the note under each table says what the
      mark means in that machine's own split, and two answer blocks that had the same omission one
      heading higher — the machine page's *Best model it runs* and the model page's *Fastest of the
      ones listed*, 110 rows — say it too. `checkSpeedBasis()` keeps it that way across all 261 pages.
      The run entry below has the figures and the five breaks that proved the guard.
      **Two things it deliberately leaves alone, so the next run does not read them as gaps.** Prose
      is not policed: `/local-llm-vs-api-cost/` and the comparison ledes say their basis in their own
      words, and a pattern matching sentences would be writing for the guard rather than the reader.
      And the calculator was already right — `src/render.ts` tags every row of its model list
      *measured*, *estimated* or *yours*, and the assumptions panel names the basis and its source.
      The original item follows.
      Found
      2026-09-19 while giving those pages an opening paragraph of their own. The "What it runs" table
      on all 56 machine pages prints a `tok/s` figure per row, 661 of them, bare. `/hardware/` prints
      56 speeds through `speedWithBasis()` and marks every one *measured* or *estimated*; the
      leaderboard and the head-to-heads mark theirs too. The machine pages, which are where a reader
      actually lands, mark none. It matters more than the count suggests: across all 1,425
      machine-and-model pairs this site computes, **1,397 are estimated from memory bandwidth and 28
      are measured**, so an unmarked figure is almost always the estimate. `speedWithBasis()` is
      already exported from `src/pagekit.ts` and already used by the index, so the change is that
      helper in place of the bare cell, plus a line in the note under the table saying what the mark
      means, which the index's own note already words. It is `scripts/build-pages.ts`, so it is a
      push rather than a pull request. This is a trust fix rather than a traffic one, and it is the
      same fault the stand-in power figure had on the comparison pages two days ago.

- [ ] **56 pages name in structured data what they are about. The other 251 name nothing.**
      Measured 2026-09-20 while dating the pages. Only the machine pages carry an `about` node,
      `hardwareProduct()`'s `Product`; the 55 model pages, the 190 head-to-heads and the 7 indexes
      carry none. The mirror looks obvious and is not: schema.org has no type for a set of
      open weights, and the nearest ones, `SoftwareApplication` and `CreativeWork`, would be the
      site picking a name for a thing nobody has named. A head-to-head between two machines could
      honestly carry both `Product` nodes, and that is 111 pages of markup for no rich result,
      because `Product` without an offer or a rating draws none and this site sells nothing on
      purpose. Written down so the asymmetry reads as considered. Worth revisiting only if
      schema.org adds a type for a model, or if a `Product` pair starts earning something
      measurable.

- [ ] **`/models/` is a 404 and `/hardware/` is a page.** Measured 2026-09-20. All 55 model pages
      sit under `/models/<id>/` and the directory above them has no index, where `/hardware/` and
      `/compare/` both do. Nothing on the site links it, and the breadcrumb on a model page already
      steps through *Models* to `/leaderboard/`, which is the model index in everything but its
      address. So this costs nothing a crawler follows; it costs the reader who trims the address
      bar. The cheap fix is a redirect to `/leaderboard/` rather than a page, which is one line of
      Cloudflare Pages config and not something the build writes today. Worth doing with the next
      change to `public/_headers` or whatever holds redirects; not worth a run of its own.

- [ ] **The price-neighbour rule has a round number in it, and one day it will bite.** The cap
      is a tenth. On the data as it stands that is not a judgement call at all: the widest pair it
      keeps is 8.8% apart and the nearest one it turns away is 15.5%, so nothing sits on the line
      and moving the cap anywhere between those two changes nothing. The pair it excludes today is
      the Mac mini M6, 24GB against the Framework Desktop, 32GB, $1,099 against $1,269, which is a
      real question a buyer asks and the only one the rule turns away. Worth revisiting when a price
      in `data/hardware.json` moves and the gap between 8.8% and 15.5% closes: at that point the cap
      is deciding something and should be set by what it is deciding, not by being round. Written
      down 2026-09-19 so the next run does not read the number as considered.

- [ ] **21 new pages share 45 words, and it is the rule's own explanation.** The sentence *"Every
      other head-to-head on this site holds a piece of the hardware equal and asks what the price
      gap buys"* is identical on all 21 price-neighbour pages, because it is the same fact on all
      21. At 45 words against 858 to 1,180 it is under 5% of each page, and the two sentences around
      it carry that pair's own prices, its own makers and its own card caveat, which is the split
      the machine-lede item settled on in the morning. Measured and left alone deliberately; written
      down so a future similarity sweep recognises it rather than re-finding it.

- [ ] **The home page carries 142 words, and every one of them is a form label.** Measured
      2026-09-19 over the static markup inside `<main>` on `index.html`: *Tokens a day*, *Context
      window you want*, *Copy link*, *Assumptions you can change*, and the privacy note. The thinnest
      generated page on the site is 603 words and the median machine page is 1,024. The missing `h1`
      is fixed in [PR #17](https://github.com/rlindsey2/sunkcost/pull/17), which gives the page a
      sentence saying what it is for; this item is the bigger half, and it is a design question
      rather than an SEO one, so it is not the agent's to decide alone.
      **What the site has that the home page does not say.** Every one of the four index pages answers
      its question in prose above the interface. The calculator answers the same question better than
      any of them, but only after a reader moves three controls, and only in figures a crawler reads
      as a snapshot of one machine and one model. The candidate the data supports without inventing
      anything: a short static answer under the machine sentence, in the site's own numbers — what the
      cheapest machine here pays back at, what the dearest does not, and the one sentence this site
      exists to say, which is that it is willing to answer never. Every figure in it would come from
      the same helpers the generated pages already use.
      **The question to settle before writing a line of it** is whether prose belongs on the front of
      a tool at all. The design note in the README is explicit that the machine is a sentence and
      everything hangs off it, and a paragraph above the fold is the first thing that would push the
      water down the page. Worth Ryan's opinion before it is built, not after.

- [x] **Fifty of the 56 machine pages opened with a paragraph that belonged to another machine.**
      Done 2026-09-19. The first paragraph answered memory and nothing else, and memory is the one
      figure a $1,299 mini PC and a $4,999 Mac Studio can share, so there were 18 distinct opening
      paragraphs for 56 pages and ten pages opened with the same words. It carries this machine's
      own price and its own pay-back now, both of which the answer block below it and the meta
      description had been printing all along. 56 distinct paragraphs, none repeated. The run entry
      below has the figures, the three breaks that proved the guard and the fourth that an existing
      guard caught on its own.
      **What the same measurement says about the pages as wholes, so nobody measures it again.**
      Pairwise 5-word-shingle similarity inside `<main>`, by page type: comparisons median 0.115 and
      worst 0.745, models median 0.278 and worst 0.701, machines median 0.289 and worst 0.864, the
      seven indexes below 0.02 against each other. The worst pairs are all two memory sizes of one
      machine or two members of one model family, where the pages genuinely differ only in the
      figures, and no page is a copy of another. There is no duplicate-content problem here at the
      level of whole pages, and rewriting a template to push a similarity number down would be
      writing for a measurement rather than for a reader. The paragraph was the part worth fixing
      and it is fixed.

- [ ] **Nobody had measured how deep the site is, and it is two clicks. Nothing to do.** Measured
      2026-09-19, breadth-first from `/` over the built site: **262 of 262 pages are within two
      clicks of the home page**, 7 at depth 1 and 254 at depth 2, none unreached. Counting only links
      inside `<main>`, so the shared footer flatters nothing, gives the same three numbers, which
      means the depth does not depend on the footer at all. There is no deep corner here, no crawl
      budget problem, and no work. Written down so the next run does not take the measurement again,
      and so that a page type that ever lands at depth 3 or more is recognised as new rather than
      normal.

- [x] **The page that answers "which graphics card" was the least linked page on the site.** Done
      2026-09-19. Counting links inside `<main>`, so the shared footer flatters nothing, `/best-gpu/`
      had 8 inbound pages where `/leaderboard/` had 200, `/compare/` 199, `/best/` 146 and
      `/how-much-memory/` 113. It is linked from 90 now, by the rule the site already had: wherever a
      page prices a graphics card in a table of machines it says the price leaves out the PC around
      it, and that sentence now ends with where the cards are ranked. The run entry below has the
      figures, the five breaks that proved the guard and the three that proved the tests.
      **What it deliberately leaves alone, so the next run does not read it as a gap:** the 55 model
      pages, which mark a card price on a row rather than raising the caveat, and 11 model
      head-to-heads, which do raise it in a lede already five sentences deep in figures about two
      models. On both, a sentence about graphics cards answers a question the page does not ask.

- [x] **Nobody has looked at what the internal links are made of.** Done 2026-09-19, and the item's
      own guess was right about the words and wrong about where the fault would be. **The anchor text
      is clean**: 7,540 internal links inside `<main>` across the 261 pages, and not one of them is
      named *here*, *this*, *read more*, a bare number or nothing at all. A machine or model page is
      reached by its own name, which is what a searcher types for it; an index is reached by what it
      answers — `/best/` by "the quickest pay-back at each level of use", `/compare/` by "every other
      match-up", `/best-gpu/` by "ranked by what each one holds". Most destinations carry two to five
      distinct phrases, and the five reached by exactly one are five models whose name is the only
      thing anyone would call them. **Nothing was rewritten, because nothing needed it.**
      What the measurement did turn up is the run's work, and it was not in the words: **`/hardware/`
      had no inbound link inside `<main>` at all**, on any of the 261 pages. See the entry below.
      The original wording follows.
      There are 7,336 of them inside
      `<main>` across the 259 pages, and six runs have spent themselves on where links point without
      once measuring the words they are written in. The questions worth answering: does the anchor
      text say what is at the other end in words a searcher would type, or does it say the name of
      the page; how many distinct phrases does a page get linked by; and is any page reached over and
      over by one phrase that is not the phrase people search. Measure before writing anything — the
      links this site has are in sentences rather than in lists, so the answer may well be that they
      are already fine, and rewriting a sentence to fit a keyword is the thing this backlog exists to
      avoid.

- [ ] **The two Q8 model pages are now the least-linked real pages on the site**, on 2 inbound pages
      each inside `<main>`, where the median page has 13 and `/leaderboard/` has 200. They are
      `/models/llama-3.1-8b-q8/` and `/models/qwen3-32b-q8/`, the only two models this site lists at
      a second precision, and both are reached from their own Q4 page's *also listed here at Q8*
      clause and from one comparison. That is not obviously wrong — a second quantisation of a model
      is a footnote to it, and the Q4 page is the page a searcher wants. The question to settle
      before writing anything is whether anybody searches the precision rather than the model, which
      is a Search Console question this agent cannot answer and Ryan can. Worth one look, and worth
      leaving alone if the answer is no.
      The `/` row in the same measurement reads zero and is not a fault: the home page is linked from
      the wordmark, the breadcrumb and the footer on all 261 pages, none of which is inside `<main>`.
      Measured 2026-09-19; written down so the next run does not chase it.

- [x] **No head-to-head on the site linked another head-to-head.** Done 2026-09-19. The 143
      comparisons were the deepest pages here, median 3 links in and always the same three:
      `/compare/` and the two things compared. Each one now names the other match-ups its two sides
      are in, grouped the way each side's own page groups them, with the pair the reader is on left
      out. 1,090 links where there were none, median 3 inbound to 7, and one comparison names none
      because both its machines are in no other pair. The run entry below has the figures, the five
      breaks that proved the guard and the three that proved the tests.
      **What it deliberately does not do, so the next run does not read it as a gap:** there is no
      cap on how many a page names. The worst carries 22, which is what a machine page already ships
      as two lists, and a cap would have to drop match-ups by a rule the page could not justify. It
      is also what keeps `checkMatchUpSiblings()` exact, since the set of links is the set of pairs.

- [x] **Every model head-to-head on the site was cut by one rule, and it is the rule that cannot
      answer the upgrade question.** Done 2026-09-19. Each model against the next one down the
      leaderboard answers "which of these two", and the two sides of "is the current one worth
      moving to" are never neighbours on an index, because a year of work separates them on it.
      Second rule now: each last-generation model against the current model of its own family
      nearest it in size, same shape and within half again in size. 53 model match-ups where there
      were 47, 259 pages where there were 253. The run entry below has the figures, the six new
      pages, the ten breaks that proved the tests and the five that proved the guard.
      **What it deliberately leaves alone, so the next run does not read it as a gap.** Seven
      last-generation models on the leaderboard get no page of this kind and each for a reason in
      the data: the three Llamas, because no Llama on this site is current, so there is nothing to
      set them against; the two DeepSeek distils and GLM-4.5-Air, because the current model of
      their family is three to eight times their size and swapping one for the other is not a
      choice any machine here offers; and Qwen3 14B, where the nearest current Qwen is 1.53 times
      its size and the cap is 1.5. The first three want a current model in the data rather than a
      rule change. The last is the only one worth a second look, and only if the cap starts
      excluding pairs a reader would want — it is a round number, not a measurement.

- [x] **The mirror of what the machine pages gained on 2026-09-19: does a model page name every
      machine that runs it?** Done 2026-09-19, and the item's own instinct was right on both
      counts: not every machine, and by family rather than by name. What settled the shape was a
      measurement the item did not have — **inside a family, memory alone decides, with no
      exception anywhere in the data**: over all 56 machines and 339 family-and-model groups, the
      set that holds a model is exactly the set at or above one memory size. So the rule fits in a
      phrase where fifty names would not, and it covers the discontinued and unpriced machines the
      table cannot show. 54 model pages carry it. The run entry below has the figures, the nine
      breaks that proved the tests and the four that proved the guard.

- [x] **36 model pages opened with this site's own ratings paperwork, and 31 of them then printed
      the score it said they did not have.** Done 2026-09-18. `capability_note` glues a line about
      the five capability ratings to the description of the model, and the lede printed the field
      whole. Split now: the description opens the page, the ratings line sits under the five blanks
      it explains. The same commit ends the KV cache sentence once instead of twice on 41 pages, and
      a second commit undoes a blank line that had dated 14 unchanged pages in the sitemap. The run
      entry below has the figures and the five breaks that proved the guard.

- [x] **The 7 thinnest pages on the site are all model pages, and all seven are models almost
      nothing runs.** Done 2026-09-18, and the item's own reading of why they are thin was right for
      six of the seven and wrong about the fix. Only Tencent Hy3 has no machine at 32k; the other six
      have a "Machines that run it" table with **one row in it**, the same $10,799 Mac Studio on all
      six. So the memory ladder this item proposed answers nothing: shortening the window does not
      bring a single machine into reach, because on every one of them the weights alone are larger
      than the memory before a token of cache. What the pages were missing is the reader who owns
      something else — how close theirs comes, and what it runs instead. Both are in the data, and
      the second turned out to be the find: **on four of the seven the machines that cannot hold the
      page's model run one that scores higher on the same index.** 769 to 834 words now, from 489 to
      559. The run entry below has the figures and the five breaks that proved the guard.
      The original item, kept for the reasoning: Measured 2026-09-18 across the 253 generated pages: median 787 words, and
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

- [x] **The prose inside `<main>` has never been swept the way the titles and descriptions have.**
      Done 2026-09-18, and the sweep's own result is the part worth keeping: **the punctuation is
      clean.** Fifteen mechanical faults read out of the rendered body of all 253 pages — doubled
      stops, doubled words, a space before a comma, a stop with no space after it, maintainer words,
      an unclosed bracket — and every hit was an artefact of flattening a table into a line. What
      was wrong was not how a sentence was written but where it sat, which is the third time a note
      out of `data/*.json` has been in the wrong template. `hw.notes` is split now, by subject, the
      way `capability_note` was; the run entry below has the figures and the five breaks that
      proved the guard. `/how-much-memory/`'s key-value cache note was read out loud at the same
      time and is sound.

- [x] **The calculator prints `hw.notes` whole, the way the machine pages did until today.** Done
      2026-09-18 as [PR #13](https://github.com/rlindsey2/sunkcost/pull/13), with the two items the
      entry below folded in, and the item was right that it is one paragraph of one file. Where it
      guessed was the bandwidth sentence: the panel had no bandwidth row to send it to, so it has
      one now, which also sources the figure the speed estimate is built on. The run entry below has
      the four homes each sentence goes to, the third fault reading the paragraph turned up, and the
      five breaks that proved the guards. The original wording follows.
      `src/render.ts:543` puts the field under "Usable memory" in the assumptions panel, so the
      laptops explain there that speed falls once the fans cap out and the cards derive their
      bandwidth figure under their memory. `splitHardwareNote()` is exported from `src/pagekit.ts`,
      which `render.ts` does not import and should not — the same seam the *stand in* label hit at
      `src/render.ts:542`, one line above. So both want the same shared home, `src/format.ts`, and
      both should ride the same pull request: it is one paragraph of one file, and two faults.

- [x] **The links under Sources name nothing.** Done 2026-09-18, and the item undercounted it:
      **111 pages and 259 links**, the 55 model pages as well as the 56 machine ones, plus the three
      that printed the word *source* itself. The question it said to settle first is the whole design
      and the data answers it three ways — the repository on Hugging Face and GitHub, the publisher
      everywhere else, and the URL's own word for the page where one publisher is cited twice. The
      run entry below has the figures, the 13 pages where the rule honestly stops, the five breaks
      that proved it, and the guard that was written and thrown away for being unfireable.

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

- [x] **The sitemap and the date ledger are written before any guard runs.** Done 2026-09-18, and
      the item was one thing too kind about it: it does not heal on the build after that. The
      restored pages no longer match the fingerprints the failed build recorded, so the ledger
      writes them down as changing **the day somebody fixed the fault**, which is a date the pages
      did not earn and the exact claim this ledger exists to avoid. Reproduced with a doubled full
      stop in the machine lede: 56 of 254 entries rewritten by a build that then threw, 113 dated
      sitemap entries down to 57 on the next one. The question it said to settle answered itself —
      a guard that re-opens a file the same script just wrote is checking the disk rather than the
      build, so both guards read the string instead and the three writes moved to the foot of the
      file. The run entry below has the figures, the checksum that proves the 253 pages did not
      move, and the three breaks that proved the guard. The original wording follows.
      `scripts/build-pages.ts`
      writes `sitemap.xml` and `seo/page-dates.json` at line 3824; every `check*()` runs after it. So a
      build that fails a guard still leaves both on disk, fingerprinted from pages the guard refused,
      and the next honest build reads them, finds a mismatch and publishes no lastmod for those pages.
      It heals on the build after that, and CI cannot ship it, because a throwing guard fails the
      deploy before anything is published. But a run that breaks a guard on purpose — which is how
      every guard here is proved — silently costs the next build's dates, and the run that noticed
      spent a while deciding whether it had shipped a fault. Found 2026-09-18 while proving
      `checkSourceLinks()`. The fix is to write both after the guards pass, which is a move rather
      than a rewrite; the question to settle first is that `checkCanonicals()` and `checkPageDates()`
      both read `sitemap.xml` back off disk, so the move is not simply to the end of the file.

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

- [x] The calculator's assumptions panel still prints the data's own key as English. Done
      2026-09-18 in the same pull request, [PR #13](https://github.com/rlindsey2/sunkcost/pull/13),
      which is what this item asked for. The original wording follows.
      The generated pages stopped on 2026-09-17: `powerSourceLabel()` turns `third_party_measured` into
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

- [x] Question pages for the searches people actually type. **Done 2026-09-19: all five candidates
      are now written or closed, the last of them as
      [PR #16](https://github.com/rlindsey2/sunkcost/pull/16).** `/cost-per-month/` answers *how much
      does it cost to run a local LLM per month* — the search this item turned up on 2026-09-18 and
      did not write — with the electricity, the machine divided over the months you keep it, and the
      level of use where the rental bill passes it. The run entry below has the figures, the five
      breaks that proved the guard and the three that proved the tests.
      **What it deliberately leaves out, so the next run does not read it as a gap:** no subscription
      price. Nothing in `data/*.json` carries one, so the page names none and prices none; it gives
      the figure a reader sets their own bill against. A page that printed "$20 a month" would be
      inventing the only number on it that is not the site's own.
      The item as it stood, kept for the reasoning. **Three of them were written.** `/how-much-memory/` merged 2026-09-17; **"best GPU for local LLMs" went out
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

- [x] **The waterline's own labels sat outside the share card's text column.** Done 2026-09-18, and
      the fix was the one this item proposed — a margin the card passes in — but its reading of the
      size was the smaller half. The right-hand label it found was 35px out by its anchor rather
      than 19, on 113 cards; and **every one of the 1,894 cards had four kinds of label 35px out on
      the left**, which the item did not see. What reading the fixed card then turned up is the
      bigger find and is [PR #14](https://github.com/rlindsey2/sunkcost/pull/14): the year axis
      labelled every hundredth year past a 600-year horizon, 68,747 of them on one card and 10 MB
      of SVG, in code the calculator draws with. The run entry below has the figures and the six
      breaks that proved the guards.

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

- [x] **`src/styles.css:98` declares `--ok-text`, `--warn-text` and `--bad-text` twice in a row.**
      Done 2026-09-19, exactly as this item asked: it rode with the next pull request to touch that
      file, [PR #17](https://github.com/rlindsey2/sunkcost/pull/17). One line deleted, identical
      values, the second declaration was winning already, so nothing renders differently. The
      original wording follows.
      With
      identical values and the wrong indentation on the first of the pair, inside the
      `prefers-color-scheme: dark` block. It changes nothing — the second wins and says the same thing —
      so it is untidy rather than broken. Found 2026-09-18 while reading the file for PR #12 and
      deliberately left out of it: a reviewer reading a pull request about the top bar should not have
      to review a palette edit. One line to delete, and it should ride with the next pull request that
      touches that file.

- [ ] **Two one-line faults in the calculator's assumptions panel, found by reading it rendered on
      2026-09-19 while checking PR #15's merge.** Neither is PR #15's to fix and both were
      deliberately left out of it, so that branch is the three pull requests and nothing else.
      The first is the `TODO:` in `electricity.source`, which is already on Ryan's side of this file
      and is `data/*.json`. The second is new: the **Memory fit** line ends in a doubled full stop
      wherever a model's `architecture.note` is set — *"only 16 full-attention layers hold a growing
      KV cache.."* — because the note ends in a stop and `src/render.ts` adds another. `endStop()`
      exists for exactly this and the generated pages already use it; the same line on a model page
      is correct. It is `src/render.ts`, so it is a pull request rather than a push, and it is small
      enough to ride with the next one that touches that file rather than justify a branch.

- [ ] The 7 head-to-head titles still over 60 characters are all pairs of long machine or model
      names (worst: MacBook Air M5 (15-inch), 16GB vs MacBook Pro M5 Pro (16-inch), 64GB, at 68).
      Shortening them further means dropping a memory size or a screen size, which are the things
      that tell two Macs apart. Probably leave, but worth a second look with query data.

## Runs

### 2026-09-20 — the address a shared link says it is

**The watch was already done.** `npm run model-watch` printed `today 2026-09-20 · last checked
2026-09-20 · done for today`, so an earlier run had it and the backlog was the job. The candidates
waiting on figures are unchanged and still need Ryan.

**The item.** `og:url`, the top open item on the backlog and the cheapest thing on it. All 307
generated pages carried a correct canonical, `og:title`, `og:description`, `og:image` and
`twitter:card`, so a shared link already rendered a card; none carried the tag that says which page
the card is *of*. A search engine settles duplicates from the canonical. Facebook, LinkedIn and
Slack read `og:url`, and without it `…/best/?utm_source=x` and `…/best/` are two objects: two share
counts, two sets of comments, and none of the second lot pointing at the first.

**What it says now.** One line in `pageShell()` in `src/pagekit.ts`, beside `og:type`:

> `<meta property="og:url" content="https://sunkcost.ai/hardware/mac-mini-m6-16/" />`

the whole address rather than the path, which is the form a parser reads, and always the same
string the page's own canonical carries. **307 pages, one address each in the head and in the
card**, which is what `checkCanonicals()` now prints. That guard already held four things about a
page's address; this is the fifth, and it compares the two tags read back out of the built markup
rather than the value that wrote either.

**Three breaks, each run, each naming the page.** Take the tag out: exit 1, *`/leaderboard/` shares
as (no og:url) and is canonically https://sunkcost.ai/leaderboard/*, and 306 more. Share every page
as the home page: exit 1, *`/best/` shares as https://sunkcost.ai/ and is canonically
https://sunkcost.ai/best/* — the fault that would be invisible in a browser and would quietly
collapse the whole site into one shared object. Write the path where the address belongs: exit 1,
*`/best/` shares as /best/*.

**Three tests in `tests/pagekit.test.ts`, all three proved by breaking them.** The tag gone fails
all three. A path instead of an address fails two, including the one written for exactly that. A
`name=` attribute where `property=` belongs fails all three, which is worth having because it is
the shape that renders fine in every HTML validator and is read by nothing.

**Nothing a visitor reads moved, and it was measured rather than assumed.** The previous tree was
built in a throwaway worktree and every built file compared byte for byte: **all 307 pages differ
by exactly one added line and no other**, none gained or lost, and the five non-page files —
`sitemap.xml` and `robots.txt` among them — are identical. `seo/page-dates.json` is untouched by
the push, because the ledger fingerprints the title, the description and `<main>`, and the tag is
in the head outside all three. So dating stays honest and no page claims a change it did not have.
**430 tests**, typecheck clean, and the full `npm run build` end to end including `build:og`,
`build:share` and `build:functions`, with 307 pages and every guard passing. The `/s/` share pages
were checked too: they set their own `og:url` in `build-share-pages.ts` and still carry exactly one
each, their own address.

**Pushed to `main` as `0f2afd0`.** `src/pagekit.ts`, `scripts/build-pages.ts` and a test, which is
the push side of the standing rule: no data file, no `src/calc.ts`, `src/compute.ts` or `src/fit.ts`,
and nothing a visitor reads. `origin/main` was still at `4bab57d` when this went up, so no sibling
session had run this hour.

**Deploy run 270 went green at 04:42 on `0f2afd0`**, so the tag is live on all 307 pages. This is
the first push in seven not to have its run cancelled by a log commit landing inside three minutes,
because this one waited for the deploy before writing the entry. The built site could not be read
back over HTTP from this environment, which blocks sunkcost.ai at the egress proxy; the pages were
read out of `dist/` instead, which is the tree the deploy publishes.

**Both open pull requests still merge clean with this push, checked rather than assumed.** PR #16
was really merged into a worktree and built there: **440 tests**, typecheck clean, 308 pages with
every guard passing, and its own `/cost-per-month/` comes out with `og:url` of its own without a
line of the branch changing. Nothing was pushed to the branch, because there was nothing to repair.
PR #17 merges clean by `git merge-tree`; it goes nowhere near either file here. One thing worth
writing down for the next run, because it cost ten minutes: **this clone's `main` branch ref is
stale** — the working tree is a detached HEAD, `main` sits 51 commits behind, and a merge test
against it reports *Already up to date* against a tree from days ago. Use `origin/main`. The same
clone is shallow enough that `git merge-tree` said *refusing to merge unrelated histories* until
`git fetch --deepen=200`.

**What to continue.** The home page is the one page left without `og:url` and it is now its own
backlog item, deliberately not a third branch against `index.html`: both open pull requests already
rewrite the `"/"` hash in `seo/page-dates.json` and a third value for that line is the collision
this log has written up five times. It rides PR #17 or goes up alone once Ryan has settled both.
After that the top open item with real traffic in it is still the per-memory-size pages, parked
behind the same two pull requests. Ryan's side is unchanged: two pull requests open, the
leaderboard's estimated-score count still wrong by eleven in `data/defaults.json`, the `TODO:`
still live in the calculator's assumptions panel, and Ternary Bonsai 2 27B still waiting on figures.

### 2026-09-20 — what a local speed is worth, said under the column of them

**The watch was already done.** `npm run model-watch` printed `2026-09-20` as last checked against
today, so an earlier run had it and the backlog was the job. The three candidates waiting on figures
are unchanged and still need Ryan: Agnes 3.0-Flash, Nex-N2.5-mini, Ternary Bonsai 2 27B.

**Why this item, when it was not on the backlog.** Every open item above it is parked or is not the
agent's: the per-memory-size pages are parked by their own text behind Ryan's two pull requests, and
the five notes under them are all written down as considered rather than as work. So this run
measured the site before writing anything, and what the measurements said was that the head is in
good order and the gap is in the body. Every one of the 307 pages has a correct canonical, a unique
title inside 60 characters and a unique description inside 155; none is missing `og:image` or a
breadcrumb; and the 1,532 prefilled calculator links, which looked like a crawl problem, all serve
the home page's own canonical and are handled. Two things were left: `og:url`, which is a line and
is now on the backlog, and the one below, which is not a tag at all.

**What was missing.** This site prints a speed on nearly every page and has never said what one is
worth. The machine pages carry 661 tok/s figures and the model pages another 334, and a reader
meeting *19 tok/s* has nothing to hold it against. The yardstick they want is the hosted API,
because that is the thing they are choosing between, and the site has had it all along:
`cloud.default_tokens_per_sec` in `data/defaults.json` is 80 tok/s, the speed the calculator times a
local answer against, and `src/render.ts` has printed the two side by side since the figures panel
was written. It never reached a generated page, which is where a reader from a search lands.

**What it says now.** One sentence under each speed table, on 56 machine pages and 54 model pages:

> For scale, the calculator starts from **80 tok/s** for a hosted API and times a local machine
> against it. 1 of the 12 above reaches it, and the slowest is 13 tok/s.

and where the column clears nothing, *Nothing above reaches it, and the quickest is 79 tok/s*, which
is the most useful version of it. **128 of the 995 rows reach 80 tok/s.** On **49 of the 110** pages
nothing listed does, on **55** some of it does, and the **6** that list a single machine all fall
short. No page on this site lists a table where every row reaches a hosted API.

**The one thing that had to be got right.** The sentence is read beside the table, so it has to
count the figures the table draws rather than the precision behind them: 79.6 tok/s is printed 80,
and a count taken on the full number would say *2 of the 3* over a column where three rows read 80
or more. `hostedSpeedLine()` rounds through `roundTps()`, the same helper `speedFrom()` prints
with, which is the rule `shownTps()` already set on this site. The test that holds it fails the
moment the rounding is taken out.

**Six breaks, each run, each naming the right page.** Say nothing: exit 1, 110 problems,
*`/models/llama-3.1-8b-q4/` prints 8 speeds and says nothing about what a speed is worth*. Count
strictly above instead of at or above: exit 1, *`/hardware/geforce-rtx-3060-12/` says 2 of 11 reach
80 tok/s where the table has 3 of 11*. Hold them against a figure that is not the data's: exit 1,
*holds its speeds against 85 tok/s where the data says 80 tok/s*. Name the quickest where the
sentence means the slowest: exit 1, *names 134 tok/s where the table's is 12*. Say it twice: exit 1,
*says what a speed is worth 2 times over*. Count every model that fits rather than the twelve the
table shows: exit 1, *says 1 of 27 reach 80 tok/s where the table has 0 of 12*. The guard reads the
speeds out of the first board table on the page, which is the one the note sits under, so none of
its figures comes from the string that wrote the sentence.

**Five tests in `tests/pagekit.test.ts`, two of them proved.** The load-bearing one is the rounding:
taking `roundTps()` out of the count fails it. The other proved is the agreement, *1 of the 12 above
reaches it* against *reach*, which is the fault the first build of this actually shipped into the
`public/` tree and which reading the page rendered caught. The other three hold the figure coming
out of the data rather than out of the helper, the four shapes of the count, and a table with no
speed in it saying nothing rather than printing a nought.

**Nothing a visitor reads moved, measured against a build of the previous tree.** The pre-push tree
was built in a throwaway worktree and every file compared: **197 of the 307 pages are byte for byte
identical**, the 110 differ only by this note and by the day their own words last changed, no page
was gained or lost, `robots.txt` is unchanged and `sitemap.xml` moves only those 110 `lastmod`
dates. **427 tests**, typecheck clean, and the full `npm run build` end to end including
`build:og`, `build:share` and `build:functions`, with 307 pages and every guard passing. The pages
were read rendered out of `dist/` as well as `public/`, in context under their own tables, and every
one of the 67 distinct variants of the sentence was read at once.

**Pushed to `main` as `6df11bd`.** `scripts/build-pages.ts`, `src/pagekit.ts` and a test. No data
file, `src/calc.ts`, `src/compute.ts` or `src/fit.ts` is touched, and no visitor-facing file either,
so this stays on the push side of the standing rule. `origin/main` was still at `59c97eb` when this
went up, so no sibling session had run.

**PR #16 conflicted on this push and is repaired, as `9328a19`.** Fifth time, same file, same import
line, same shape the log has warned about four times: `main`'s `hostedSpeedLine` and the branch's
monthly-cost helpers both extended the list at the head of `scripts/build-pages.ts`, with `MTOK` on
a different line on each side. Both kept by hand, `MTOK` once, `seo/page-dates.json` rebuilt rather
than chosen. Verified on the merged tree rather than assumed: **437 tests**, typecheck clean, 308
pages with every guard passing, and the new note lands on 110 of them there too. GitHub now reports
the pull request `clean`. **PR #17 never conflicted**: `git merge-tree` against this push is clean,
and nothing here goes near `index.html` or `src/styles.css`.

**Deploy run 268 went green at 03:55 on `aa650ea`**, so both commits are live on sunkcost.ai. Run
267 was cancelled rather than failed: the log commit followed the code commit inside three minutes
and the workflow's concurrency group dropped the older of the two. That is the sixth time in a row
and it is not a fault. The built site could not be read back over HTTP from this environment, which
blocks sunkcost.ai at the egress proxy; the pages were read rendered out of `dist/` instead, which
is the tree the deploy publishes.

**What to continue.** The backlog above this entry gains three items and loses none that were work.
`og:url` is the cheapest of them and is a genuine absence on all 308 pages; the other two are
measurements that say there is nothing to do. The per-memory-size pages are still the top open item
with real traffic in them and still parked behind Ryan's two pull requests. Ryan's side is unchanged
but for PR #16's repair: both pull requests open, the leaderboard's estimated-score count still
wrong by eleven in `data/defaults.json`, the `TODO:` still live in the calculator's assumptions
panel, and Ternary Bonsai 2 27B still waiting on figures.

### 2026-09-20 — the sitemap's date, said on the page as well

**The watch was already done.** `npm run model-watch` printed `2026-09-20` as last checked against
today, so an earlier run had it and the backlog was the job. The three candidates waiting on figures
are unchanged and still need Ryan: Agnes 3.0-Flash, Nex-N2.5-mini, Ternary Bonsai 2 27B.

**Why this item, when it was not on the backlog.** Every open item above it is parked or is not the
agent's. The per-memory-size pages are parked by their own text behind Ryan's two pull requests, and
queuing a third behind them is how PR #16 came to need four conflict repairs. The three below that,
the price-neighbour cap, the 45 words 21 pages share and the home page's form labels, are all
written down as considered rather than as work. So this run went looking, and the gap it found is in
push territory: structured data.

**What was missing.** `seo/page-dates.json` has dated every page in the sitemap since it was
written, and the date is honest by construction: a page is dated only while its fingerprint still
matches what the ledger recorded, so a page that changed and cannot prove when goes out with no date
at all. None of that reached the page. A sitemap is a file the reader never sees and the crawler has
to take on trust, and nothing in the markup repeated the claim. On a site whose subject is what a
machine costs this week, freshness is the thing worth saying twice.

**What it says now.** All 307 generated pages carry `dateModified` on their `WebPage` node, out of
the same ledger and to the same day as the sitemap. `/leaderboard/` and `/best/` say 2026-09-20; the
other 305 say 2026-09-19. `withModified()` in `src/pagekit.ts` reads the page's one structured-data
block, puts the day on the node that is the page, and writes the block back through `jsonLd()`, so
the escaping that stops a machine name closing the script tag survives the round trip.

**The ordering problem, and why it is not one.** The date cannot be known until the body is final,
because until then the ledger cannot recognise the page. So the stamp goes on inside `write()`,
after the headings are anchored and the jump line is in. It lands in the head, outside the title,
the description and the `<main>` the fingerprint is taken over, so **dating a page cannot move the
date it is given**. Measured rather than argued: `seo/page-dates.json` is byte for byte unchanged by
this push and all 307 pages kept the day they had. The fingerprint is now taken once, in `write()`,
and carried on `meta`, so the day in the markup and the day in the sitemap cannot be two readings.

**Four more claims in `checkPageDates()`, read back out of the markup rather than out of the string
that wrote it.** A dated page carries the day once. It carries it on the `WebPage` node and not on
the site or the breadcrumb. It carries the day the sitemap gives it. And a page the sitemap will not
date carries nothing.

**Five breaks, each run.** Stamp nothing: exit 1, 307 problems, *`/leaderboard/` is dated 2026-09-20
in the sitemap and says nothing about it itself*. Stamp a day out: exit 1, 307, *dates itself
2026-09-21 where the sitemap says 2026-09-20*. Stamp the `WebSite` node instead: exit 1, 307, *puts
its date on a WebSite rather than on the page*. Corrupt one ledger hash so a page goes out undated,
then stamp it anyway: exit 1, exactly one problem and the right page, *`/best-gpu/` dates itself
2026-09-20 where the sitemap will not date it*. Stamp twice: exit 1, 307, *dates itself 2 times
over*. The first cut of that fourth break used `sed`, which matched the sitemap's own line as well
because the pattern was a substring of it; both guards then fired and the break proved less than it
looked. Worth knowing: the two lines differ only in indentation.

**Five tests in `tests/pagekit.test.ts`, two of them proved.** The load-bearing one takes the
fingerprint of a shell before and after stamping and holds them equal; moving the stamp inside
`</main>` fails it. The escaping one names a `WebPage` `</script><img src=x>` and holds the tag
count at one; re-serialising with a bare `JSON.stringify` fails it. The other three hold the node it
lands on, that every other node comes through untouched, and that a page with no structured data or
no page node is refused rather than dated wrongly.

**Nothing a visitor reads moved, measured against a build of the previous tree.** The pre-push tree
was built in a throwaway worktree and every file compared: **all 307 pages differ only inside their
JSON-LD**, none differs anywhere else, and `sitemap.xml` and `robots.txt` are byte for byte the
same. Every date in the built site is a real day and none is in the future. **422 tests**, typecheck
clean, the full `npm run build` end to end including `build:og`, `build:share` and `build:functions`,
and 307 pages with every guard passing.

**Pushed to `main` as `ab123f2`.** `scripts/build-pages.ts`, `src/pagekit.ts` and a test. No data
file, `src/calc.ts`, `src/compute.ts` or `src/fit.ts` is touched, and no visitor-facing file either,
so this stays on the push side of the standing rule. `origin/main` was still at `d60c5a4` when this
went up, so no sibling session had run.

**The home page is the one page left out, and not by oversight.** `index.html` is a static file the
calculator fills, so the ledger fingerprints it whole rather than by its `<main>`. A date written
into it would be inside its own fingerprint, which would change the hash, which would drop its
sitemap date, which would make the date it carries wrong. It is the difference between the build's
two counts: 308 of 308 in the sitemap, 307 of 307 in the markup. Nothing to fix.

**Both open pull requests were merged for real against this push and built there.** PR #16: 432
tests, typecheck clean, 308 pages with every guard passing, and `/cost-per-month/` is dated in the
ledger already so it takes a stamp like the rest. PR #17: 424 tests, typecheck clean, 307 pages, and
its rebuilt `seo/page-dates.json` already carries the new `/` hash, so the home page keeps its
sitemap date. **Neither needed the ledger rebuilt**, and `npm run build:pages` wrote no change on
either merged tree. Run it after merging anyway; it is one command and it is the thing that goes
wrong in silence. The clone here is shallow, so `git merge-tree` needs `git fetch --deepen=200
origin main` first, and the local `main` branch is 348 commits stale: merge `origin/main`, not
`main`, or the merge reports *Already up to date* and proves nothing.

**Deploy run 265 went green at 02:53 on `f80af03`**, three minutes twenty-three from queue to
published, so both commits are live on sunkcost.ai. Run 264 was cancelled rather than failed: the
log commit followed the code commit inside three minutes and the workflow's concurrency group
dropped the older of the two. That is the fifth time in a row and it is not a fault.

**What to continue.** The backlog above this entry is unchanged in order. The per-memory-size pages
are still the top open item with real traffic in them and still parked behind Ryan's two pull
requests. Two new notes went in below them, both measured and both saying there is nothing to do.
Ryan's side is unchanged: PR #16 and PR #17 both open, the leaderboard's estimated-score count still
wrong by eleven in `data/defaults.json`, the `TODO:` still live in the calculator's assumptions
panel, and Ternary Bonsai 2 27B still waiting on figures.

### 2026-09-20 — the fourth-best buy, named

**The watch was already done.** `npm run model-watch` printed `2026-09-20` as last checked against
today, so an earlier run had it and the backlog was the job. The three candidates waiting on figures
— Agnes 3.0-Flash, Nex-N2.5-mini, Ternary Bonsai 2 27B — still need Ryan and are unchanged.

**Why this item.** The three-page item closed on the last run, and the next open one was the one the
last three entries kept deferring: a class on `/best/` counted the models it left out and named none
of them. Its own text said to weigh it once rather than drift into it, and named the cheapest honest
version. That is what this is. The per-memory-size pages below it are still parked behind Ryan's two
pull requests, which its own text says to leave until they are settled.

**What was wrong.** A class listed the three quickest pay-backs and then said, in a grey line under
them, *14 more models in this class pay back and are not listed.* The count is honest and it is a
dead end. A reader looking at three rows and wanting the fourth was sent by the lede to
`/leaderboard/`, which ranks every model by score — a different order from the one they were reading,
on a page that does not say what anything pays back in. The fourth-best buy was computed, sorted and
thrown away, at every one of the 15 class-and-level blocks on the page.

**What it says now.** The aside names it:

> 14 more models in this class pay back behind these three. The quickest of them is
> **Qwen3.5 9B**, in 685 years on a **Mac mini M6, 16GB**. Of the 530 machine-and-model pairs that
> fit, 57 never pay back.

and where a class leaves exactly one out, it names it without the arithmetic: *One more model in this
class pays back behind these three: DeepSeek V4-Flash, in 10,564 years on a Mac Studio M5 Ultra,
256GB.* Both names link the way the rows above them link — the model to its page, the machine to
its own — so the aside is the row the reader would have asked for next, written as a sentence.
`bestLeftOut()` takes the first pick past the cut, which is what the sort already puts there, so
**no row moved and no figure changed**: the page prints one more line per class out of numbers it
had already computed. The lede says it does this, and says it only because a class really does.

**Four more claims in `checkBestCuts()`, all read out of the aside rather than out of the sentence.**
The helper writes the words the guard then looks for, so a claim checked against the helper's own
string proves nothing — this was measured, not assumed: stripping the name out of the sentence
passed the build clean until the check was moved onto the picks. The model named is now looked up as
`t.picks[BEST_PER_CLASS]` and its page must be linked **inside the aside**, not merely somewhere in
the block, because every row links a machine and three of them link models. It must have no row of
its own in that class. The aside must carry the machine's page and the duration as well as the name.
And `t.picks[BEST_PER_CLASS].days` must be no quicker than the row above it, which is what *the
quickest of them* claims and what an unsorted pick list would make a lie.

**Six breaks, each run.** Count them and name none → exit 1 with 20 problems, *leaves 8 models out
of Haiku-class at 50k tokens a day and does not name Qwen3.6 35B-A3B, the quickest of them*. Name
`picks[0]` instead of the first past the cut → exit 1, 30 problems, the same message plus the
machine-and-duration one. Print the machine without linking it → exit 1, 15 problems, *names
DeepSeek V4-Flash as the next model down in Sonnet-class at 50k tokens a day without the machine
that pays it back and the 10,564 years it takes*. Drop the lede's promise → exit 1, exactly one
problem, *names the next model down in 15 of its classes and does not say so in its first
paragraph*. Reverse the pick order in `bestByTier()` → exit 1, 15 problems, *calls Qwen3.8 27B the
quickest model left out of Sonnet-class at 50k tokens a day, and it pays back sooner than the last
row listed*. And, to prove the row-clash branch is live rather than unreachable, render a fourth row
under an unchanged cut → exit 1, *names deepseek-v4-flash-ud-q4 as the next model down in
Sonnet-class at 50k tokens a day, and it already has a row there*.

**The layout fault the longer sentence exposed, found by reading the page in a browser rather than
in a file.** `.board` holds every cell on one line unless a class says otherwise, and the aside had
no class. At 1,263px against the 936px the page is ever given, the table scrolled sideways and took
*Pays back in* and *Open in the calculator* off the right edge — the exact fault `page.css` already
has a comment about, on the tables it was fixed on. The aside is a sentence, not a column, so
`.board .c-note { white-space: normal; }` and the cells carry the class. Measured in Chromium at
four widths, before and after: 1263 → 936 at 1440 and 1280, and 856 and 358 unchanged at 900 and
390, so nothing below a full-width page moved at all. Read rendered at 1280 and 390 out of `dist/`.

**Nothing else on the site moved, measured rather than assumed.** Exactly one hash changed in
`seo/page-dates.json`, `/best/`, and `c-note` appears on one page and in the stylesheet. The page is
1,850 words. **417 tests**, typecheck clean, the full `npm run build` end to end including
`build:og`, `build:share` and `build:functions`, and 307 pages with every guard passing.

**Pushed to `main` as `1d7a98b`.** `scripts/build-pages.ts`, `src/pagekit.ts`, `public/page.css`, a
test and the date ledger. `public/page.css` is the generated pages' stylesheet and not the
calculator's — `index.html` does not link it, checked rather than assumed — so this stays on the
push side of the standing rule. No data file, `src/calc.ts`, `src/compute.ts` or `src/fit.ts` is
touched. `origin/main` was still at `07e4baf` when this went up, so no sibling session had run.

**Both open pull requests still merge clean, and #16 needs less than it did.** PR #16 was merged for
real in a throwaway worktree and built there: 427 tests, typecheck clean, 308 pages with every guard
passing, and — new this time — `npm run build:pages` on the merged tree wrote **no change to
`seo/page-dates.json` at all**, so the rebuild the standing note asks for has nothing to rebuild.
PR #17 is clean by `git merge-tree`; this push goes nowhere near `index.html` or `src/styles.css`.
One thing worth knowing for the next session: this environment's clone is **shallow**, so
`git merge-tree` against PR #17 failed with *refusing to merge unrelated histories* until
`git fetch --deepen=200 origin main`. That is not a conflict and should not be read as one.

**Deploy run 262 went green at 01:56 on `557aeee`**, two minutes fifty-six from queue to published,
so both commits are live on sunkcost.ai. Run 261 was cancelled rather than failed: the log commit
followed the code commit inside two minutes and the workflow's concurrency group dropped the older
of the two, which is the fourth time in a row that has happened and is not a fault. Reading the
published page back was refused by this environment's outbound proxy with a 403 rather than by the
site, so the deploy's own green is the evidence here, as it was for run 259.

**What to continue.** The next open backlog item is the per-memory-size pages — *what can I run with
16 GB*, *24 GB*, *32 GB* — which its own text parks behind Ryan's two pull requests and gives two
things to settle before a line is written. Below that: the round number in the price-neighbour rule,
the 45 words 21 pages share, and the home page's 142 words of form labels. Ryan's side is unchanged
apart from the notes above: PR #16 and PR #17 both still open, the leaderboard's estimated-score
count still wrong by eleven in `data/defaults.json`, the `TODO:` still live in the calculator's
assumptions panel, and Ternary Bonsai 2 27B still waiting on figures.

### 2026-09-20 — a leaderboard of every open model, with two of them on it nowhere

**The watch first, because it was due.** `npm run model-watch` printed `2026-09-19` as last checked
against today, so the daily check in `seo/MODEL-WATCH.md` came before the backlog. It found nothing:
the searches that file lists — releases this month, releases this week, each family the script
prints, new quantisations — returned no open-weight model that is not already priced here or already
on the candidate list. One new name turned up and is neither new nor runnable, **Inkling**, Thinking
Machines Lab's 975B mixture of experts: released 2026-07-15, and at the four-bit sizes this site
carries it lands far past the 119.5 GB the largest machine here addresses. Inkling Small is a
different model and already has a row. It is written up under *Checked and left alone* so no later
run spends an hour reaching the same answer, and the date at the top of the file is today's. The
three candidates waiting on figures — Agnes 3.0-Flash, Nex-N2.5-mini, Ternary Bonsai 2 27B — are
unchanged and still need Ryan.

**Why this item.** The backlog's top open item is the per-memory-size pages, which its own text says
to leave until Ryan's two pull requests are settled. The next is the one the last three runs have
been working down: `/best/`, `/hardware/` and `/leaderboard/` each explain their own table in prose
that nothing holds to the code. `/best/` and `/hardware/` are done. `/leaderboard/` was the one left
and the one the last run called the bigger half.

**What was wrong, and it was not a drifted sentence.** The table ranks by score and keeps one row
per model, because two builds of one model are two rows carrying the same number in the Score
column. The cut is right. What the page did with the build it cut was drop it: no row, no count, and
not in the note under the table that lists the models the index has not scored. Two of them —

| model | row | also priced here | on the page |
| --- | --- | --- | --- |
| Llama 3.1 8B Instruct | Q4_K_M, 4.9 GB | Q8_0, 8.5 GB | nowhere |
| Qwen3 32B | Q4_K_M, 20 GB | Q8_0, 35 GB | nowhere |

— each with a page of its own, a score, and machines that run it. So the page that ranks Qwen3 32B
did not say the site also prices it at eight bits, which is the question a reader with 48 GB of
memory arrives with. The lede counted 48 models, the note counted 5 unscored, and 48 + 5 is 53 of
the 55 the site prices. Nothing on the page said which two were missing or that any were.

**What it says now.** The lede prints the cut and the count from the rows themselves:

> 48 open-weight models you can download and run at home, ranked on the Artificial Analysis
> Intelligence Index v4.3, with the hosted models from Anthropic and OpenAI dropped into the same
> table for scale. **Each model has one row, at the lightest build this site prices, and two of them
> are also priced at a heavier quantisation, named in the row itself.**

And the row names it, in the words the model pages already use: *Qwen3 32B · Q4_K_M · also at Q8_0,
35 GB*, the quantisation linking to that build's own page. `leaderboardRows()` in `src/pagekit.ts`
carries the cut and says why it keeps the lightest build rather than the first one the sort happens
to hand it: the column that ends the row is the cheapest machine that runs it, and the smaller
download runs on more of them. That is the build the old code kept by luck, so **no row moved** —
the change is that it is now a rule, and that what it cuts is on the page. `leaderboardBuildsLine()`
writes the lede's sentence from the rows, drops it entirely on a site where every model is priced
once, and keeps its singular.

**`checkLeaderboardBuilds()`, four claims, three of them read back out of the rendered page.** Every
model in `data/models.json` is named on the page exactly once — as a row, beside one, or in the
unscored note — and naming one twice is a fault of its own. No build named beside a row is lighter
than the weights that row prints, compared between the two figures the page itself shows rather than
the arrays that wrote them. The lede's count of models is the count of open rows really there. And
the lede says how many rows carry a second build, or says nothing about builds at all where none
does. Its print is the site's own accounting: *`/leaderboard/` names all 55 models this site prices:
48 ranked rows, 2 of them naming a heavier build beside the one they rank, and 5 in the note about
models the index has not scored.*

**Five breaks, each run.** Stop naming the heavier build in the row → exit 1 with 3 problems, *gives
Llama 3.1 8B Instruct at Q8_0 no row and names it beside none*, the same for Qwen3 32B, and *explains
a cut between builds that its table does not make*, which is the lede left claiming what the table
no longer does. Drop the lede's sentence → exit 1, *names a second build on 2 of its rows and does
not say so in its first paragraph*. Multiply the weights column by ten on the doubled rows → exit 1,
*prints 49 GB as the weights of Llama 3.1 8B Instruct and names a build of it beside them at 8.5 GB*.
Drop one model from the unscored note → exit 1, *leaves Spark-X2.5 4B at Q4_K_M out of the note about
models the index has not scored*. Let a row name the build it is already written about → exit 1,
*names llama-3.1-8b-q4 twice, as a row of its own and beside llama-3.1-8b-q4*.

**One break was thrown away rather than counted, and it is worth knowing why.** Inverting the rule so
the table keeps the heaviest build does not reach this guard: `checkCanonicals()` stops the build
long before it, because the head-to-head chain in the last column is built from the rows and a
different row means a different address. So the rule itself is proved by tests rather than by the
build, which is the right place for it, and the guard is left proving what the page says about the
rows it really printed.

**Three breaks proved the six new tests.** Keep the heaviest build → *keeps the lightest build and
names the heavier one beside it* fails, alone. Drop the scored filter so an unscored build can take a
row → *never gives the row to a build the index has not scored* fails, alone. Print the sentence
where no model has a second build → *says nothing about builds where every model is priced once*
fails, alone.

**Nothing else on the site moved, measured rather than assumed.** `seo/page-dates.json` is the
measurement: exactly one hash changed, `/leaderboard/`, and the other 306 pages are byte-for-byte
what they were. The page is 1,493 words. **417 tests** (411 before), typecheck clean, the full
`npm run build` end to end including `build:og`, `build:share` and `build:functions`, 307 pages with
every guard passing, and the page read rendered out of `dist/` — the lede, both doubled rows and the
unscored note.

**Pushed to `main` as `57722ae`.** It is `scripts/build-pages.ts`, `src/pagekit.ts`, a test and the
date ledger, which is the push side of the standing rule; no data file, `src/calc.ts`,
`src/compute.ts` or `src/fit.ts` is touched. The environment starts on a **detached HEAD** as usual,
so `git branch -f main HEAD && git checkout main` came first; nothing was forced, and `origin/main`
was still at `6d97042` when this was pushed, so no sibling session had run.

**One thing found on the same page and left for Ryan, because it is in a data file.** The note under
*How to read the scores* ends *26 of the models here carry that mark*, and 16 models in
`data/models.json` carry `estimated`, 15 of them with a row. A reader can count the asterisks. It is
`frontier_basis.estimated_note` in `data/defaults.json`, printed whole here and again in bold in the
calculator's assumptions panel, so it is one string in a file this agent must not edit and it is on
Ryan's side above. **He was notified**, because a wrong figure a visitor can check is the one thing
this site cannot afford.

**Deploy run 259 went green at 00:54 on `062c736`**, three minutes thirty-three from queue to
published, so both commits are live on sunkcost.ai. Run 258 was cancelled rather than failed: the
log commit followed the code commit inside two minutes and the workflow's concurrency group dropped
the older of the two, which is the same shape as runs 255 and 248.

**And the Actions cache that has now caught three runs in a row has a way round it.** Six reads of
the run and its jobs came back byte-identical, `updated_at` frozen at 00:51:13, while the build step
was really finishing — the same trap the last two entries describe. What broke it was **asking a
different question**: `list_workflow_runs` with `status: completed` is a separate cache key, and it
returned the finished run immediately. Worth trying before another wait.

**PR #16 conflicted with this push and is merged clean again, as `ca9db20`.** The fourth time, and
the same line: `main`'s new leaderboard imports and this branch's monthly-cost helpers both extended
the import list at the head of `scripts/build-pages.ts`, with `MTOK` on a different line on each
side — and this time `tests/pagekit.test.ts`'s import list went the same way, which is new and is
the shape this log has warned about five times now. Both sides kept by hand, `MTOK` kept once, and
`seo/page-dates.json` rebuilt with `npm run build:pages` rather than chosen. Verified on the merged
tree rather than assumed: **427 tests**, typecheck clean, 308 pages with every guard passing,
including this branch's `/cost-per-month/` and this run's accounting of every build on the
leaderboard. Nothing about the page the pull request adds has changed. The standing note on it still
holds, and this push widened it: `/leaderboard/`, `/best/`, `/compare/` and `/hardware/` all moved
in the ledger, so whoever merges it runs `npm run build:pages` and commits what it writes rather
than picking a side of those lines. **PR #17 still merges clean**; it touches `index.html` and
`src/styles.css`, which this change goes nowhere near.

**What to continue.** The three-page item is closed, so the next open item is *a class on `/best/`
counts the models it leaves out and names none of them*, which its own text says to weigh once
rather than drift into — the cheapest honest version is the next model down in each class by name,
one link and one figure. Below it, the per-memory-size pages are still parked behind Ryan's two
pull requests. Ryan's side otherwise: PR #16 and PR #17 both still open, the Ternary Bonsai 2 27B
figures, and now the estimated-score count.

### 2026-09-19 — a table of 56 machines under a sentence that priced all of them

**Why this item.** `npm run model-watch` prints `2026-09-19` as last checked, so the watch was done
and the backlog was the job. The top open item is the per-memory-size pages, which its own text says
to leave until Ryan's two pull requests are settled. The next is the one the last two runs have been
working down — `/hardware/` and `/leaderboard/` explain their own tables in prose and nothing holds
those sentences to the code — and the item under it names the one sentence on `/hardware/` that is
measurably wrong. That is this run.

**What was wrong.** The lede opened *All 56 configurations this site prices, in one table*, written
from `data.hardware.length`. Two of the 56 have no `price_usd`: the **Mac Studio M5 Ultra, 512GB**
and the **Framework Desktop, 192GB**. Their own rows already said so — *not published · price it
yourself* in the price cell, *needs a price* in the pay-back cell — so the page contradicted itself
between its first paragraph and its table, and the reader who scrolled to the row found out the hard
way. Nothing about it was a figure: the table has been right the whole time.

**What it says now.**

> All 56 configurations this site lists, in one table: … **54 of them carry a published price. The
> Mac Studio M5 Ultra, 512GB and the Framework Desktop, 192GB do not, so their rows open the
> calculator for you to put in what you would pay.**

*Prices* became *lists*, which is what the table does, and the count of what it prices is its own
sentence. Naming the two is the part a reader can act on rather than a caveat: those are the two
rows where the price is theirs to enter, and the link in the cell already goes there.
`publishedPriceLine()` in `src/pagekit.ts` writes it from `data.hardware`, singular and plural both,
and says *Every one of them carries a published price* on a fleet where nobody is missing one — so a
price published tomorrow rewrites the sentence rather than dating it.

**`checkPricedRows()`, four claims.** The count in the paragraph is the count of rows the table
really prints a price on, **read back out of the rendered page** rather than taken from the same
array that wrote the sentence. Every machine without a published price is named in the lede. No
machine that has one is named among them. And each of those rows offers the calculator, which is
what the sentence promises.

**Four breaks, each run.** Drop `${publishedPriceLine(data)}` from the lede → exit 1, *the machine
index does not open by saying that 54 of its 56 rows carry a published price*. Invert the filter so
it names two priced machines → exit 1 with 4 problems, naming the Mac Studio M5 Ultra and the
Framework Desktop as unnamed and the two Mac minis as wrongly named, *and it is priced at $899*.
Stop marking the two rows *not published* → exit 1, *prints a price on 56 of its 56 rows, where 54
of the machines here have a published price*. Change the link's words from *price it yourself* → exit
1 on both rows, *is named as a machine you price yourself and its row does not offer the calculator*.
The first version of that fourth break removed the link outright and was caught one guard earlier by
`checkHardwareIndex`, which wants the calculator link on every row; it was re-run keeping the link
and changing only its words, so the claim proved is this guard's own.

**Two breaks proved the four new tests.** Count `data.hardware.length` instead of the priced ones →
three of the four fail. Drop the singular branch → *keeps its singulars where one machine has no
price* fails, because one machine without a price read as several.

**Nothing else on the site moved.** `seo/page-dates.json` is the measurement: exactly one hash
changed, `/hardware/`, and the other 306 pages are byte-for-byte what they were. 411 tests (407
before), typecheck clean, the full `npm run build` including `build:functions`, 307 pages with every
guard passing, and the page read rendered out of `dist/`.

**Pushed to `main` as `e0b6b23`.** It is `scripts/build-pages.ts`, `src/pagekit.ts` and a test, which
is the push side of the standing rule; no data file, `src/calc.ts`, `src/compute.ts` or `src/fit.ts`
is touched.

**Deploy run 256 went green at 23:47 on `bc67561`**, so both commits are live on sunkcost.ai. Run
255 was cancelled rather than failed: the log commit followed the code commit inside a minute and
the workflow's concurrency group dropped the older of the two, which is the same shape as run 248.

**Both open pull requests were re-checked against this push and neither conflicts with it.**
`git merge-tree` against `main` at `bc67561` reports clean for `seo/cost-per-month` (PR #16) and
`seo/home-h1` (PR #17). The import line at the head of `scripts/build-pages.ts` — the line that has
collided three times — took `publishedPriceLine` on a different row from the one PR #16 extends, so
git had nothing to choose between. The standing note on PR #16 still holds: `main`'s `/hardware/`
hash moved in this push, so whoever merges it rebuilds `seo/page-dates.json` rather than picking a
side of that line.

**What to continue.** `/leaderboard/` is the page left in the item above, and it is the bigger half:
nothing it says about its own table is held by anything. Same shape as `checkBestCuts()` and this
run's guard — name the rule once, let the page print it, let the build fail when the two disagree.
Ryan's side is otherwise unchanged: PR #16 and PR #17 are both still open, and the Ternary Bonsai 2
27B figures still need him.

### 2026-09-19 — three rows a class, and the other 23 models were in no row and no count

**Why this item.** `npm run model-watch` prints `2026-09-19` as last checked, so the watch was done
and the backlog was the job. The top open item is the per-memory-size pages, which the item itself
says to leave until Ryan's two pull requests are settled. The one below it is the item the last run
wrote: `/hardware/`, `/leaderboard/` and `/best/` each explain their own list in prose and nothing
holds those sentences to the code. This run took `/best/`, and the sentence it was missing was not a
drifted one. It had never been written.

**What was wrong, measured rather than reasoned about.** `bestByTier()` sorts a class by pay-back,
keeps one row per model and then takes `perTier = 3`. The page printed those three and said nothing
about the cut. Behind them, at every one of the five levels of use:

| class | models that pay back | listed | in no row and no count |
| --- | --- | --- | --- |
| Sonnet-class | 4 | 3 | 1 |
| Haiku-class | 11 | 3 | 8 |
| Below every hosted tier | 17 | 3 | 14 |

**23 of the 32 models that pay back somewhere** were on the page in neither a row nor a figure. A
reader counting three rows under *Haiku-class* had no way to tell whether that was the whole class
or the top of it, and the lede's *Each model appears once, on its quickest machine* reads as though
every model is there. The one line under a table that did count anything counted the wrong thing for
the job: *Also in this class: 57 never pay back, of 530 pairs that fit* — pairs, beside rows that are
models, and silent about the models that do pay back and are not shown.

**What it does now.** The cut is `BEST_PER_CLASS`, the lede prints it from there — *Each class lists
the three that pay back soonest, one row per model, on the machine that pays it back quickest* — and
each class says how many more models pay back behind its rows. `bestLeftOut()` in `src/pagekit.ts`
writes both sentences and keeps each figure in the unit it is counted in: models that pay back and
are not listed, machine-and-model pairs that fit and never do. The lede also points at
`/leaderboard/`, which is where every model on the site is ranked with its class beside it, and it
was the only index lede on the site linking nowhere.

**Four breaks and a negative control, each run.** List a fourth model → exit 1, *lists 4 models in
Sonnet-class at 50k tokens a day, where the cut takes 3 of the 4 that pay back*, 15 of them. Put the
old lede back → exit 1, *does not say that a class lists 3 models*. Drop the not-listed sentence →
exit 1, *lists 3 of the 17 models that pay back in Below every hosted tier at 50k tokens a day and
does not say the other 14 are left out*. Drop the pairs sentence → exit 1, naming the class and the
sentence. Claim a model is left out where the class lists every one → exit 1, *and every model in it
that pays back is listed*. And the control that says the guard is about the cut rather than about
the number three: raise `BEST_PER_CLASS` to 4 → **the build passes**, the lede says *four*, and the
counts fall from 115 to 100 without a word being edited. Two more breaks proved the four new tests:
force the plural, and count the two reasons a pair is not a row as one number.

**Nothing else on the site moved, and this was checked rather than assumed.** The site was built from
`main` in a throwaway worktree and from the change, and all 307 pages compared: `/best/` differs and
**the other 306 are byte-for-byte identical**, `sitemap.xml` included, `lastmod` and all. One hash
line moves in `seo/page-dates.json` and no date moves, because the page had already changed today.
The page is 1,604 words where it was 1,398. Worth knowing for the next run that measures this:
`publishedDate()` reads the ledger as committed, so the first build after a change drops that one
page's `lastmod` and the next build restores it. A sitemap diff taken between those two builds is
reading the ledger, not the page.

**Verified**: 407 tests, typecheck clean, 307 pages with every guard passing, the full `npm run
build` end to end including `build:og`, `build:share` and `build:functions`, and the page read
rendered out of `dist/` — the lede, the three class lines at 50k and the two-clause line at 20M,
where *39 never pay back and 63 can’t produce this much in a day*. **Pushed as `5627008`, and it is
live**: its own run 252 was cancelled by this entry's push a minute later, as usual, so **deploy run
253 on `341b9e2` carries both and went green at 22:56**, three minutes thirteen from queue to
published. The live site was not read back: this environment's egress proxy blocks `sunkcost.ai`.
**And the Actions cache the last run was caught by is still there.** Four reads of
`list_workflow_jobs` came back byte-identical, timestamps included, while the build step was really
finishing; the fifth showed it done at 22:56:28 and the sixth the whole run green. An identical
answer here means nothing was re-fetched, so it is worth neither a conclusion nor a wait.

**Both open pull requests still merge clean.** PR #16 was merged for real in a throwaway worktree and
built there rather than trusted to `git merge-tree`, because it is the one that touches
`scripts/build-pages.ts`: no conflict, **417 tests**, typecheck clean, 308 pages with every guard
passing, and the new guard holds over the merged tree. PR #17 touches `index.html` and
`src/styles.css`, which this change goes nowhere near; `git merge-tree` reports it clean.

**One thing about this environment, the same as the last run's.** The clone starts on a **detached
HEAD**, so a commit goes onto no branch and `git push origin main` would push the stale local `main`.
`git branch -f main HEAD && git checkout main` first; nothing was forced. Unlike the last run, the
full build including `build:functions` ran here: the font was found.

**What to continue.** The same item, two pages down: `/hardware/` and `/leaderboard/` still explain
their own lists in sentences nothing holds. `/hardware/` has the concrete one, new below: its lede
says the site prices all 56 configurations and two of them have no published price.

### 2026-09-19 — the index that named five rules where seven cut its list

**Why this item.** `npm run model-watch` prints `2026-09-19` as last checked, so the watch was done
and the backlog was the job. The top open item is the per-memory-size pages, a new page type and a
top-level page, so it is a third pull request against `index.html` behind two Ryan has not settled,
and the item says to do it once those are settled. The items below it — the three over-long titles,
the memory cap, the price cap, the 45 shared words, the site's depth — are all written up as
considered rather than open. So this run read the pages instead, and the biggest index on the site
was wrong about itself.

**What was wrong, measured rather than reasoned about.** `/compare/` is the index of all 190
head-to-heads, and above each of its two tables it says what cuts the list. It said *Five kinds of
match-up* over the machine table and *Two kinds of match-up* over the model table.
`hardwarePairs()` applies **seven** rules and `modelPairs()` **three**:

| the rule | rows it cuts | named on the page |
| --- | --- | --- |
| one machine per family against every other | 28 | yes |
| every graphics card against every other | 21 | yes |
| every memory tier of a machine against the others | 18 | yes |
| the same silicon in two boxes | 8 | yes |
| every discontinued machine against its successor | 12 | yes |
| the cheapest box against the one with the better chip | 4 | **no** |
| two machines of different families at the same price | 21 | **no** |
| each model against the next one down the leaderboard | 47 | yes |
| each last-generation model against what replaced it | 7 | yes |
| two models of different families that need the same memory | 29 | **no** |

**50 of the 189 rows** — a quarter of the index — sat under an explanation that did not reach them.
A reader who found *Mac mini M6, 32GB vs Radeon AI PRO R9700, 32GB* on a page naming five kinds,
none of them that one, had no way to tell why the two were on a page together. Both sentences were
written by hand and both fell behind the code that cuts the list: the price-neighbour rule landed on
2026-09-18 and the memory-neighbour rule on 2026-09-19, and neither run went back to the index.

**What it does now.** Both sentences are written from a list of the rules themselves, one entry a
rule's own pairs and the clause the page gives it, and `checkMatchUpKinds()` holds the list to the
rules in both directions: every match-up the page lists is cut by a kind the page names, every kind
it names cuts at least one match-up on it, and the page really carries each clause and the count of
them. A rule added to `versus-card.ts` without a clause here now fails the build naming the pairs
nothing explains. The match is on the pair rather than on the address, because four card pairs are
cut by both grids and carry the flagship grid's order.

**And seven clauses are not a sentence.** Strung together the way five were, they ran to 170 words
and six semicolons in front of the table they explain, on a page a reader comes to for one row. They
are a list now, one rule to a line, under a line saying how many there are: three lines of CSS in
`public/page.css`, which is the generated pages' own stylesheet rather than the calculator's.

**Four breaks, each run.** Drop the price-neighbour clause → exit 1, *the head-to-head index lists
Mac mini M6, 32GB vs MacBook Air M5 (13-inch), 16GB and names no kind of match-up that cuts it*, 21
of them. Name a kind that cuts nothing — each model against the one it was distilled from → exit 1,
naming the clause. Print one clause fewer than the list holds, which is what a hand-edit of the page
would do → exit 1, *does not say what puts 21 machine match-ups on it* and 29 model ones. And the
negative control that says the guard is about the rules rather than about the number seven: add an
eighth kind that really does cut three of the listed pairs → **the build passes**, 11 rules named.

**Nothing else on the site moved, and this was checked rather than assumed.** The site was built
from `main` and from the change and all 307 pages compared: `/compare/` differs, `page.css` differs,
the other 306 pages are byte-for-byte identical and `sitemap.xml` is unchanged, `lastmod` included.
One hash line moves in `seo/page-dates.json` and no date moves, because the page had already changed
today. The page is 6,004 words where it was 5,909.

**Verified**: 403 tests, typecheck clean, 307 pages with every guard passing, the full `npm run
build` end to end including `build:og`, `build:share` and `build:functions`, and the page read
rendered out of the built output in Chromium at 1,280 and 390px — the seven lines carry their
markers, the lead line sits above them and the sentence about the two speeds sits below.
**Pushed as `a868268`, and it is live.** Runs 247, 248 and 249 were each cancelled a minute or two
in by the next push — this entry, then a note about the deploy, then a correction to that note — so
**deploy run 250 on `134c2be` is the one that carries all four commits, and it went green at
22:04**. Its whole job took three minutes and eighteen seconds, the `npm run build` step two minutes
forty, which is worth knowing because this container takes about thirteen minutes over the same
build: a deploy here is never the slow part. The live site was not read back: this environment's
egress proxy blocks `sunkcost.ai`, so everything above is from the built output.

**And one thing about reading Actions from this environment, which cost this run half an hour.**
`get_workflow_run` and the run list come back **cached**: run 248 was cancelled at 21:58:30 and both
kept reporting it `in_progress`, with the same `updated_at`, for fifteen minutes afterwards. An
earlier version of this entry said the run was slow on the strength of those polls, and it was not
slow, it was already dead. Repeated identical answers here mean nothing has been re-fetched rather
than nothing has changed. `list_workflow_jobs` on the run id is the call to make when a deploy's
state matters — it returned the live step list, and it is what finally showed run 250 finishing —
but it caches too, so an answer identical to the last one is worth nothing either way. The tell is
that a step's timestamps do not move.

**Both open pull requests still merge clean.** PR #16 was merged for real in a throwaway worktree
and built there rather than trusted to `git merge-tree`: no conflict, **413 tests**, typecheck
clean, 308 pages with every guard passing, and the new guard holds over the merged tree's own list
unchanged. PR #17 touches `index.html` and `src/styles.css`, which this change goes nowhere near;
`git merge-tree` reports it clean.

**One thing about this environment, the same as the last run's.** The clone starts on a **detached
HEAD**, so a commit goes onto no branch and `git push origin main` would push the stale local `main`.
`git branch -f main HEAD && git checkout main` first; nothing was forced.

**What to continue.** The backlog's top open item is still the per-memory-size pages, a pull request
that wants Ryan's two settled first. New below it: the same drift this run fixed is worth looking
for elsewhere — `/hardware/`, `/leaderboard/` and `/best/` all explain in prose what their own lists
hold, and nothing holds those sentences to the code either.

### 2026-09-19 — the guard that checked the addresses and printed a claim about the words

**Why this item.** `npm run model-watch` prints `2026-09-19` as last checked, so the watch was done
and the backlog was the job. The top open item is the per-memory-size pages, which is a new page
type and a top-level page, so it is a third pull request against `index.html` behind two Ryan has
not settled; the item itself says to do it when those are settled rather than queued behind them.
The one below it was this, and the previous run had found it while breaking a different guard.

**What was wrong, measured rather than reasoned about.** `checkHeadingAnchors()` ended its print
with *none repeated on its page*, which reads as a claim about headings and was a claim about ids.
`anchorHeadings` numbers a slug it has already used, so the two are not the same thing. The old
build was run with one repeated heading added to `/compare/` to see what it actually did, and it
did not merely pass the guard:

| | with the heading repeated |
| --- | --- |
| the old build | passes, 1,188 headings, 307 pages written |
| the id it shipped | `id="machine-against-machine-2"` |
| the line above the sections | *Jump to: Does any machine here hold every model? · Machine against machine · Model against model · **Machine against machine** · The assumptions behind both tables* |
| the new build | exit 1, *`/compare/` heads two sections "Machine against machine", so a jump into them offers the reader the same words twice* |

**Four breaks, each run.** Repeat a heading word for word → caught, exit 1. Repeat it with markup in
the middle, `Machine <span class="dim">against</span> machine` → caught, and the message prints the
words a reader sees rather than the markup, which is what the `words()` helper is for. Repeat it
differing only by a question mark → caught, because a mark is not a word and the two slug the same.
And the negative control, the one that says the guard is about repetition rather than about the
count: head a fifth section *Machine against a graphics card* → **the build passes**, 1,188
headings, 307 pages.

**Nothing a visitor reads changed, and this was checked rather than assumed.** The site was built
from `main` and from the change and every file compared: `diff -rq` over `public/` reports no
difference at all, in any of the 307 pages or the sitemap, and `seo/page-dates.json` is untouched,
so no page's `lastmod` moves. A guard is worth what it prevents and this one prevents a jump line
that wastes the reader's click; it is not worth a single changed word today.

**Verified**: 403 tests, typecheck clean, 307 pages with every guard passing, and the full
`npm run build` end to end including `build:og`, `build:share` and `build:functions`.
**Pushed as `1165130`.** Run 244 was cancelled a minute later by the push of this entry, as usual,
and **deploy run 245 went green at 20:45 on 2026-09-19** on `7114721`, carrying both. The live site
was not read back: this environment's egress proxy blocks `sunkcost.ai`, so everything above is
from the built output.

**Both open pull requests still merge clean**, checked against the new `main`. PR #16 was merged for
real in a throwaway worktree and built there rather than trusted to `git merge-tree`: no conflict,
413 tests, typecheck clean, 308 pages with every guard passing, and the new claim holds over
`/cost-per-month/`'s own four headings as well — 1,191 section headings against 1,187. It touches
`scripts/build-pages.ts` in 255 lines and not one of them is in this function, which is why the
import line that has caught it three times did not catch it a fourth. PR #17 touches `index.html`
and `src/styles.css`, which this change goes nowhere near; `git merge-tree` reports it clean.

**One thing about this environment, worth the next run knowing.** The first `git push` was rejected
as non-fast-forward with no sibling session anywhere near it: the clone starts on a **detached
HEAD**, so the commit went onto no branch and `git push origin main` pushed the stale local `main`
at `d8314dc`. The standing rule about a rejected push is to fetch and check for a sibling's work
first, and that was done — `git log HEAD..origin/main` was empty, which is the tell. The fix is
`git branch -f main HEAD && git checkout main`, and nothing was forced.

**What to continue.** The backlog's top open item is still the per-memory-size pages, a pull request
that wants Ryan's two settled first. Below it, the three over-long titles and the memory cap are
both written up as considered rather than open work, so the next real item is whichever of the
smaller ones reads best on the day.

### 2026-09-19 — the index of 189 match-ups says what is on it

**Why this item.** `npm run model-watch` prints `2026-09-19` as last checked, so the watch was done
and the backlog was the job. The top open item is the per-memory-size pages, which is a new page
type and waits on Ryan's two open pull requests; the one below it was `/compare/`, the thinnest page
on the site at two sections and the third of the four top-level indexes to head almost nothing.

**The question the item left, answered by reading the page rather than by writing for it.** It asked
whether `/compare/` has a third thing to say that is not filler, and guessed the answer was the rules
cutting the match-ups. Those rules are already on the page, a paragraph each under the two headings
it had. What is not headed is the page's own answer — *none of the 53 machines compared here holds
more than 38 of the 39 open models* — and its own assumptions, which open and close the page as
unheaded prose. So the same treatment the two big indexes had yesterday: two headings over prose that
was already there, and **not one sentence written, changed or removed.**

| | before | after |
| --- | --- | --- |
| sections on `/compare/` | 2 | 4 |
| jumps into its own sections | 0 | 4 |
| section headings on the site | 1,185 | 1,187 |
| pages offering a way into their own sections | 150 | 151 |
| jumps, one a section | 618 | 622 |
| pages whose words changed | — | 1 of 307 |
| dates moved in `seo/page-dates.json` | — | 0 |

**How it reads.** *Does any machine here hold every model?* · *Machine against machine* · *Model
against model* · *The assumptions behind both tables*. The first is the question the paragraph under
it has been answering since it was written, in the form `/hardware/` and `/leaderboard/` already ask
theirs; the last is what the head-to-heads have called *The assumptions behind both columns* for
weeks, in the plural the two tables here make it. Four sections is exactly the floor
`JUMP_MIN_SECTIONS` sets and no heading names a machine or a model, so the jump line came from the
rule written two days ago without a line of that rule changing.

**Three breaks, each run.** Head the note with the page's own `h1` → *`/compare/` heads a section
"Every head-to-head: machine against machine, model against model", which is the page's own title
said twice*, exit 1. Drop the note's heading and the page falls back to three sections → **the build
passes and the jump line goes silently**, 150 pages and 618 jumps again. That is the rule's floor
doing what it was written to do rather than a fault, and it is worth knowing that the loss is quiet.
The third is worth writing down because it is not what the print claims: give the page two sections
with the same words and **the build passes** — `anchorHeadings` gives the second the `-2` id, and
`checkHeadingAnchors` holds ids apart rather than headings, so *none repeated on its page* is a claim
about addresses, not about words. It is in the backlog below.

**Nothing else on the site moved.** The site was built before and after and all 307 pages compared:
`/compare/` differs, the other 306 are byte-for-byte identical, and `sitemap.xml` changes only in
that one page's `lastmod`, which stays `2026-09-19` because the page had already changed today. One
hash line moves in `seo/page-dates.json`. Note for the next run that touches a page: the first build
after a change writes the new hash and drops that page's `lastmod`, and a second build puts the date
back — so build twice before reading the sitemap, or the guard's own count says *307 of 308*.

**Verified**: 403 tests, typecheck clean, `npm run validate` with the two null prices already on
Ryan's side of this file, 307 pages with every guard passing, the full `npm run build` end to end
including `build:og`, `build:share` and `build:functions`, and the page read rendered out of `dist/`
rather than from the source — 5,909 words, the jump line above the first section, and the four
headings in the order the line names them. **Pushed as `a97e551`**; run 241 was cancelled a minute later by
the push of this entry, as usual, and **deploy run 242 went green at 19:46 on 2026-09-19** on
`da8e03b`, carrying both, so the page is live. The live site was not read back: this
environment's egress proxy blocks `sunkcost.ai`, so everything above is from the built output.

**Both open pull requests still merge clean.** PR #16 was merged for real in a throwaway worktree and
built there rather than trusted to `git merge-tree`: no conflict, 413 tests, typecheck clean, 308
pages with every guard passing, and `/compare/`'s new line survives the merge — 152 pages and 626
jumps, the extra four being `/cost-per-month/`'s own. PR #17 touches `index.html` and
`src/styles.css`, which this change goes nowhere near; `git merge-tree` reports it clean.

**What to continue.** The backlog's top open item is still the per-memory-size pages, a pull request
that wants Ryan's two settled first. Below it the new item about the heading-id gap, and `/compare/`
is no longer the thinnest page on the site: the floor is 3 sections now, on 37 machine pages and 45
model head-to-heads, and none of those is thin in the way an index of 189 pairs was.

### 2026-09-19 — the two indexes that headed nothing

**Why this item.** `npm run model-watch` prints `2026-09-19` as last checked, so the watch was done
and the backlog was the job. The top open item was the two top-level indexes that headed no sections
at all: `/hardware/`, 56 machines, and `/leaderboard/`, 55 models, each a single table under one `h1`
while every other index on the site headed five sections or more. Both are linked from the footer of
all 306 other pages, so they were the two pages on this site nothing could link into and no search
result could offer a jump into.

**The two things the item said to settle, settled the other way round.** The item guessed the
sections would be groups of rows — machine shape on one, `SIZE_BANDS` on the other — and that is the
one answer the markup forbids: an `h2` cannot sit inside a `<table>`, so headings over groups of rows
means several tables, and a reader comparing 56 machines on price wants one table they can read down.
Both tables stay whole and unchanged. **The sections are the argument each page already makes**: the
two paragraphs `/hardware/` opens with are its answer about what a dearer machine buys and how long
one takes to pay back, the leaderboard's is the gap to the frontier, and the notes under each table
are a section in their own right, the way the head-to-heads have headed *The assumptions behind both
columns* for weeks. Nothing was written for the occasion; eight headings were put over prose, tables
and notes that were already there.

| | before | after |
| --- | --- | --- |
| pages heading no sections | 2 | 0 |
| section headings on the site | 1,177 | 1,185 |
| pages offering a way into their own sections | 148 | 150 |
| jumps, one a section | 610 | 618 |
| pages whose words changed | — | 2 of 307 |
| dates moved in `seo/page-dates.json` | — | 0 |

**How they read.** `/hardware/`: *Does a dearer machine run a better model?* · *How long each machine
takes to pay for itself* · *Every machine here, side by side* · *The assumptions behind the table*.
`/leaderboard/`: *How far behind the frontier open models are* · *Every model here, ranked* · *Models
the index has not scored yet* · *How to read the scores*. Four sections each is exactly the floor
`JUMP_MIN_SECTIONS` sets, and neither page names a machine or a model in a heading, so both picked up
a jump line from the rule written yesterday without a line of that rule changing.

**One sentence changed, and one deliberately did not.** The leaderboard's note under its own new
heading read *5 more open models on this site have no index score yet, so they are not in the table*,
which says what the heading above it had just said; it reads *are not in the table above* now. The
one left alone is *The short version:*, which opens the first paragraph of `/compare/`, `/hardware/`
and `/leaderboard/` alike. Under a question heading it is a beat before the answer, but it is the
site's own voice on all three indexes, and stripping it from two of them would have made the third
read as an oversight.

**The guard.** `checkPageSections()` holds two claims: every page heads at least one section, and no
page heads a section in its own title. The first is the state these two pages were in for weeks with
nobody noticing, and it now stops a build; the print names the thinnest page on the site, so the
floor is a number somebody reads rather than one nobody measures — *`307 pages head at least one
section, the fewest being 2 on /compare/`*. The second stops the floor being met with a heading that
labels the page inside itself, which would buy the reader nothing and the jump line a repeated line.

**Two breaks, each run and each caught.** Strip the leaderboard's four headings → *`/leaderboard/`
heads no sections at all, so nothing can link into it and a reader has to start at the top*, exit 1.
Head the machine table *Every machine that runs local models, priced*, which is that page's own `h1` →
*`/hardware/` heads a section "Every machine that runs local models, priced", which is the page's own
title said twice*. The first break also printed *1 page do not cut themselves*, which is fixed: the
message is written both ways round now, the way `checkSectionLinks` writes its own.

**Nothing else on the site moved.** Two page hashes change in `seo/page-dates.json` and no date does,
because both pages already carried today's; `sitemap.xml` is unchanged, and the other 305 pages are
byte-for-byte what they were.

**Verified**: 403 tests, typecheck clean, `npm run validate` with the two null prices already on
Ryan's side of this file, 307 pages with every guard passing, the full `npm run build` end to end
including `build:og`, `build:share` and `build:functions`, and both pages read rendered out of
`dist/` rather than from the source. **Pushed as `c6c4753`, and deploy run 239 went green at 18:51
on 2026-09-19**, so both pages are live. The live site was not read back: this environment's egress
proxy blocks `sunkcost.ai`, so everything above is from the built output.

**Both open pull requests still merge clean.** PR #16 was merged for real in a worktree and built
there rather than trusted to `git merge-tree`: no conflict, 413 tests, typecheck clean, 308 pages
with every guard passing, and `/cost-per-month/` picks up the new guard and its own jump line in the
merged tree — 151 pages, 622 jumps. PR #17 touches `index.html` and `src/styles.css`, which this
change goes nowhere near; `git merge-tree` reports it clean and it was not built again, since
yesterday's entry already built it against the jump lines.

**What to continue.** The backlog's top open item is the per-memory-size pages, which is a pull
request and still wants the two open ones settled first. Below it, `/compare/` is now the thinnest
page on the site at two sections, which is the same shape as this item one size down and is written
up in the backlog.

### 2026-09-19 — a way into the sections of the pages worth one

**Why this item.** `npm run model-watch` prints `2026-09-19` as last checked, so the watch was done
and the backlog was the job. The top open item is the other half of the section links: 1,177 sections
could be linked to, and `/best/` was still the only page on the site that offered its own reader a
way in. The item left two things to settle before a line was written, and both are settled below.

**Where the line goes.** Above the first `<h2>`, and above whatever wraps it. Not under the lede,
which the item guessed at: on a head-to-head the answer is the lede, the comparison table and the two
prefilled calculator links, and a contents line in front of that pushes the answer down the page.
Above the first section is where the reader has finished the answer and started looking for the rest
of it.

**The cut is a rule the build takes for itself, not a flag per page type**, and it is two counts:
**four sections or more, and at most one heading repeating a name the page's own `h1` already
carries.** The second count is the whole of it. Where a page is about one machine or one model every
heading names it, so a line built from those headings prints the reader's own search term back at
them three times in a row, which is what the item meant when it called the model pages keyword
stuffing. Where the headings name different things, the same line is a contents page. The names come
from `data/*.json` as the pages print them, so the rule is keyed on this site's own vocabulary rather
than on a page type somebody remembered to list.

| | before | after |
| --- | --- | --- |
| pages offering a way into their own sections | 1 | 148 |
| jumps, one a section | 5 | 610 |
| distinct lines across those pages | 1 | 28 |
| sections with nothing pointing at them | 1,167 of 1,177 | 565 |
| words a visitor reads that changed elsewhere | — | 0 |

**What the rule turns away, so none of it reads as a gap.** The 55 model pages head four sections
each and name the model in three of them. 19 of the 56 machine pages head four and name the machine
in two; the other 37 head three. 45 head-to-heads head three sections, because no model fits both
machines and the *Side by side on* section is not written — a contents line for what is already on
the screen. `/compare/` heads two. `/hardware/` and `/leaderboard/` head **none at all**, which is
the one thing this measurement turned up that is worth its own backlog item, below. And `/best/`
keeps the line it wrote for itself: its five headings each carry a second clause after a `·`, so the
generic line would read as ten items rather than five, and *50k/day · 200k/day · 1M/day · 4M/day ·
20M/day* is better than anything a rule would build from those words.

**How the lines read.** 46 characters at the shortest, which is `/best/`'s own, and 283 at the
longest, which is `/how-much-memory/`: *Where the cache figure comes from · How much memory for a 7B
or 8B model? · How much memory for a 14B to 32B model? · How much memory for a 70B model? · How much
memory for a 100B model or larger? · Context is the part people miss · What can you run with the
memory you already have?* Four of those seven share their opening words, and it was read rendered
before it was kept: the repetition is the ladder, and the part that differs is the part the reader is
looking for. A head-to-head's is 139 to 174 characters. No link text carries an entity or a stray
separator; all 148 were read out of the built pages.

**The guard.** `checkJumpLines()` holds three claims. The first is the rule itself, both ways round —
a page that should carry a line and does not, and a page that carries one and should not, each stop
the build, so the day a fourth section is written onto a machine page the build says what that does
rather than leaving it to whoever next reads the page. The second is that the line covers the page:
one jump a section, in the order the page puts them in, each landing on an id the page really heads.
The third is that it sits above the first section it points into. The build prints *`148 pages offer
610 jumps into their own sections, one a section; 159 pages carry none, each under 4 sections or
naming its own subject in more than one`*.

**Five breaks, each run and each caught.** Drop the last section from the line → *`/compare/mac-mini-m5-pro-24gb-vs-mac-studio-m5-max-128gb/` jumps into 3 of the 4 sections it
heads*, on 147 pages. Reverse the order → *`/how-much-memory/` lists
`#how-much-memory-for-a-14b-to-32b-model` after `#how-much-memory-for-a-70b-model`, where the page
itself has them the other way round*. Put the line after the first heading → *puts its jump links
below the first section they point into*. Loosen the name count from one to three → *`/models/qwen3-14b-q4/` offers jump links whose words name How good is Qwen3 14B, really? and 2 more
headings carrying the same name*, on 67 pages. Raise the floor from four sections to five → *heads 4
sections and offers no way into them*, on 132. Two of the four new tests were proved the same way:
loosening the name count fails *leaves a page alone where more than one heading names what the h1
already names*, and ignoring the `<section>` wrapper fails *puts the line above the first section,
and outside whatever wraps it*.

**Nothing else on any page moved.** The site was built from `main` at `6b27303` in a worktree and
from this change, and all 307 pages compared: **147 differ by the new line alone, 160 are identical,
and `sitemap.xml` is the same byte for byte.** No page is re-dated, because every page on this site
already carried today's date from this morning's runs; 147 hashes move in `seo/page-dates.json` and
no date does.

**Verified**: 403 tests (399 plus four new), typecheck clean, `npm run validate` with the two null
prices already on Ryan's side of this file, 307 pages with every guard passing, and the full
`npm run build` end to end including `build:og`, `build:share` and `build:functions`.

**Pushed as `479b982`, and deploy run 236 went green at 17:49 on 2026-09-19**, so the jump lines are
live. The live site was not read back: this environment's egress proxy blocks `sunkcost.ai`, so
everything above is from the built output.

**PR #16 conflicted on this push and is merged clean again, as `a81e913`.** Same file, same line, the
third time in a day: `main`'s `JUMP_MIN_SECTIONS` and that branch's monthly-cost helpers both
extended the import list at the head of `scripts/build-pages.ts`, and `MTOK` sat on a different line
on each side. Both kept by hand, `MTOK` kept once, and `seo/page-dates.json` rebuilt rather than
chosen. Verified on the merged tree: 413 tests, typecheck clean, 308 pages with every guard passing.
**One thing worth knowing before merging it**: `/cost-per-month/` heads four sections and names no
machine or model twice, so it picks up a jump line of its own in the merged tree — 149 pages, 614
jumps — without a line of that branch changing. GitHub reports it `clean`. **PR #17 merges clean and
was merged for real rather than assumed**: 405 tests, 307 pages, every guard passing.

**What to continue.** The backlog's top open item is now the two indexes that head no sections at
all, `/hardware/` and `/leaderboard/`, measured here and written up below. The per-memory-size pages
are still the biggest open item and still want the two open pull requests settled first.

### 2026-09-19 — the links that name a section now land on it

**Why this item.** `npm run model-watch` prints `2026-09-19` as last checked, so the watch was done
and the backlog was the job. The top open item is the one the 15:0x run wrote down as it finished
the anchors: 1,177 sections could be linked to and 1,172 had nothing pointing at them. It has two
halves and this run took the one the item itself said to settle first — which internal links are
worth re-pointing at a section.

**What settled it was a count, and it came out at zero.** The obvious rule is to re-point a link
whose text *is* a heading on the page it points at. Measured over all 8,930 internal links inside
`<main>` on the 307 pages: **not one of them.** This site writes links as prose — *the cards are
ranked against each other here*, *What a million tokens costs each way* — so a rule keyed on heading
text would have shipped nothing and looked thorough doing it. What the site does have is ten
sentences whose own words name a section's subject, and between them they were carrying 448 links to
the top of a page the reader had already been told the answer was inside.

| | before | after |
| --- | --- | --- |
| links that land on the section answering them | 5, all on `/best/`, all same-page | 453 |
| pages carrying one | 1 | 303 |
| sections other pages point at | 0 | 5 |
| internal links whose text is a heading on the target | 0 | 0 |
| words a visitor reads that changed | — | 0 |
| pages re-dated | — | 0 |

**The cut, and what it leaves alone.** A link is re-pointed where its own words name one section and
that section is the whole of the answer. Ten sentences qualify: *What a million tokens costs each
way* and *what a million tokens costs to rent against generating it* → `#a-million-tokens-model-by-model`;
*How weights and cache add up* and *How the two add up* → `#where-the-cache-figure-comes-from`;
*ranked by what each one holds*, *set against the others here* and *the cards are ranked against each
other here* → `#every-card-here-side-by-side`; *N machine match-ups on the site* and, on the 111
machine head-to-heads, *every other match-up* → `#machine-against-machine`; and on the 78 model
head-to-heads the same words → `#model-against-model`, which is the one place the same sentence
lands somewhere different depending on which page the reader is on.
**Three sentences that could have been swept in and were not**, because each names two sections
rather than one: the machine pages' *a page on how that sum works, and what each size needs* is the
cache section plus the four size sections, the leaderboard's *how much memory each size really takes*
is the four on their own, and `/hardware/`'s *how much memory you need* is the page. They open the
page at the top, which is where their answer starts. Re-pointing every link because it is now
possible is the keyword-stuffing of internal linking, and the item said so before the work began.

**How the two ends of a link are kept together.** `sectionLink(path, heading)` builds the address out
of the section's own heading, the same way `anchoredHeading()` builds the heading — one function of
one set of words at both ends, so rewording a heading moves the link with it rather than away from
it. `SECTIONS` in `src/pagekit.ts` names the five sections other pages link to, so a reworded heading
is one edit rather than a hunt through the emitters.

**The guard.** `checkSectionLinks()` holds three claims: every fragment a page links to exists on the
page it points at, every one is the id of a section rather than of something the page happens to
carry, and every section `SECTIONS` names is linked from somewhere — so a heading that stops being
linked shows up in the build rather than sitting in the list. It covers `/best/`'s own five same-page
jump links too, which nothing checked before. The build prints *`453 links name a section and land
on it, across 10 sections of 4 other pages`*.

**Four breaks, each run and each caught.** Reword `/compare/`'s *Machine against machine* heading and
leave the link → *`/hardware/mac-mini-m6-16/` links to `/compare/#machine-against-machine`, where
`/compare/` heads no section with that id*, and the build stops on 164 of them. Aim one at a page nothing writes →
*`/best/` links to `/best-gpus/#every-card-here-side-by-side`, and no page here is written at
`/best-gpus/`*. Put one link back to the page it used to point at → *`/compare/#model-against-model`
is the section SECTIONS calls modelMatchUps, and no page on this site links to it*. Mistype the id
alone → *`/best/` links to `/best-gpu/#every-card-here-side-by-sides`, where `/best-gpu/` heads no
section with that id*. Three tests hold the part the build cannot: that `sectionLink` and
`anchoredHeading` agree on the id for the same heading, that every entry in `SECTIONS` is a path in
front of a slug, and that no section is named twice.

**One line that changes nothing today and would have mattered one day.** `write()` harvested inbound
links with a regex that stopped at the first `#`, so a link landing on a section did not count as
reaching the page — and `checkLinks()` fails the build on a page nothing links to. Measured both
ways: `/compare/`, `/best-gpu/`, `/how-much-memory/` and `/local-llm-vs-api-cost/` are each linked
from 306 pages either way, because the footer links all four from every page. So this is a
correctness fix ahead of the case rather than a rescue, and it is worth saying plainly rather than
claiming a save.

**How it was checked that no word changed.** The site was built twice, once from `main` at `883c041`
in a worktree and once from this change, and all 307 pages compared with every tag stripped: **zero
differences**. 303 of the 307 differ as markup and `sitemap.xml` is identical byte for byte, so not
one page is re-dated — 606 lines of `seo/page-dates.json` move and every one of them is a hash.

**Verified**: 399 tests (396 plus three new), typecheck clean, `npm run validate` with the two null
prices that are already on Ryan's side of this file, 307 pages with every guard passing, and the
full `npm run build` end to end including `build:og`, `build:share` and `build:functions`. All ten
re-pointed links read back out of the built pages, each landing on the id its target really heads.

**Pushed as `09911ca`. Deploy run 233 was cancelled by the log push a minute later, as usual, and
run 234 went green at 16:49 on 2026-09-19 on `f993f62`, which carries both commits**, so the section
links are live. The live site
was not read back: this environment's egress proxy blocks `sunkcost.ai`, so everything above is from
the built output.

**Both open pull requests still merge, and really rather than by `git merge-tree`.** #16 and #17 were
each merged into `main` at `09911ca` in a throwaway worktree and built there: #16 gives 409 tests and
308 pages, #17 gives 401 tests and 307. One thing #16 picks up that is worth Ryan knowing: its own
new page carries one of the re-pointed sentences, so `/cost-per-month/`'s hash moves in the merged
tree. The instruction already on that pull request covers it — merge, run `npm run build:pages`,
commit what it writes — and it now matters even if #16 is merged on its own rather than beside #17.
(The local clone was shallow, which makes `git merge-tree` answer *refusing to merge unrelated
histories* on a pull request branch; `git fetch --unshallow` first. Worth knowing before a future
run reads that as a conflict.)

**What to continue.** The other half of the same item: the *Jump to* line. The backlog entry above
now carries what this run measured before leaving it — where it reads clean, where it reads as the
page's own subject three times in a line, and the two things to settle before a line of it is
written.

### 2026-09-19 — every section on the site got a link that lands on it

**Why this item.** `npm run model-watch` prints `2026-09-19` as last checked, so the watch was done
and the backlog was the job. Both open pull requests were checked first and both still merged clean
into `main` at `a6c1051`, so there was no repair to do before the work. The item taken is the one
the run before this one added: **no heading on this site had an `id`**. It had been written down
rather than done for one reason, and that reason was void today.

**The reason it was parked, and why today was the day.** `seo/page-dates.json` fingerprints the
markup between `<main>` and `</main>`, so an attribute added to 307 pages re-dates all 307 as having
changed — which is the exact claim that ledger exists to stop a build from making. The ledger was
read before a line was written: **all 307 pages already carried `2026-09-19`**, put there by the
seven runs before this one. So the hashes had somewhere to move to and the dates had nowhere. That
is what the parked item asked for in as many words: *worth doing on a day those pages have changed
anyway.*

**What it costs to have no anchors.** Another site linking to *what the Framework Desktop, 128GB
runs* had to send a reader to the top of the page and let them find it. And a search engine can only
offer a jump straight into a section of a result where the section has somewhere to jump to — which
is the feature this morning's run fed when it made every heading name its own subject, and which
nothing on this site could take up.

| | before | after |
| --- | --- | --- |
| anchors inside `<main>`, whole site | 5, all on `/best/` | 1,182 |
| section headings that can be linked to | 0 of 1,177 | 1,177 |
| pages with a repeated id anywhere in the document | 0 | 0 |
| words a visitor reads that changed | — | 0 |
| pages re-dated | — | 0 |

**Where the change went, which is one place.** `write()` in `scripts/build-pages.ts` is the single
funnel every page passes through, so `anchorBody()` sits at the top of it and the file on disk, the
fingerprint the sitemap dates and the markup all 40-odd guards read are one and the same page. No
heading emitter was touched: there are 45 of them and each would have been a chance to get one
wrong. The header and footer are left alone, because `mainOf()` draws the same line the ledger does.

**The one idea the whole change rests on.** A slug is a function of the heading's own words, so
`anchoredHeading('The specifics')` reconstructs exactly what the build published. That is how 20
guards that matched `<h2>The specifics</h2>` as a literal string keep matching without learning
anything about ids. The five that knew only a heading's opening words — the rest being a machine
name or a number they were about to read out of the match — go through `headingLike()`, and the
six regexes take `<h2\b[^>]*>`. The slug reads a heading the way a person does: markup dropped,
entities put back, accents folded, everything else that is not a letter or a digit a hyphen. The
longest it produces is 75 characters, on *the machines that miss Qwen3 235B-A22B Instruct 2507, and
what they run*; the shortest real one is 9.

**The guard.** `checkHeadingAnchors()` holds four claims: every section heading has an id, no two
sections on one page share one, each id is a slug, and each id is the slug of *its own* heading.
The fourth is the one that protects the twenty guards above, because an id set by hand instead of
derived would leave them silently missing sections that are really there. The build prints
*`1,177 section headings across 307 pages, each with the id a link lands on, none repeated on its
page`*.

**Four breaks, each run and each caught.** Stop anchoring → *`/best/` heads a section "50k tokens a
day …" with no id, so nothing can link to it*. Truncate the slug to two words so pages really
collide, with `headingSlug` truncated to match so only duplication is left → *`/how-much-memory/`
gives two sections the same id, "how-much", so a link to it lands on the first*, and the same on
three comparison pages. Set an id by hand — `what-` rewritten to `section-` → *`/best-gpu/` gives
"What the same money buys with a computer" the id "section-the-same-money-buys-with-a-computer-
around-it" where its own words slug to "what-the-same-money-buys-…"*. Drop the lower-casing →
*`/best/` gives a section the id "1M-tokens-a-day-…", which is not a slug*. Three tests on the two
new helpers cover the parts the data does not reach, the dedupe among them: no page on this site
has two headings that slug the same, so removing the dedupe changed nothing in the build at all.

**How it was checked that no word changed.** Not by reading one page and trusting the rest. The site
was built twice, once from `main` and once from this change, and all 307 pages compared with every
tag stripped: **zero differences**. The only file that differed at all was `sitemap.xml`, by one
line, and it differed in the right direction — `/best-gpu/` gained the `lastmod` it had never had.
A separate sweep confirmed 1,182 ids across 307 documents with not one repeated, which is more than
the guard checks, since the guard only looks at headings and `/best/` also carries five on sections.

**Verified**: 396 tests (393 plus three new), typecheck clean, the full `npm run build` end to end
including `build:og`, `build:share` and `build:functions`, 307 pages with every guard passing, and a
machine page read rendered out of `dist/`.

**Pushed as `e932be3`. Deploy run 230 went green at 15:50 on 2026-09-19**, so the anchors are live,
with the log as `b80df05` on run 231. The live site was not read back: this environment's egress
proxy blocks `sunkcost.ai`, by `curl` and by fetch alike, so everything above was verified on the
built output in `dist/` and `public/`. Worth knowing before a future run plans a check against the
deployed page.

**The one pull request this broke, and it is repaired.** #16 collided with `main` inside the minute,
in the same one place the log has now warned about three times: both branches extended the same
import line in `scripts/build-pages.ts`, so git offered one line where two additions belong. Both
sides kept by hand, `seo/page-dates.json` rebuilt rather than chosen because neither side's hashes
are right for the merged tree, and pushed to `seo/cost-per-month` as `f1d02ce`. Verified on the
merged tree rather than assumed: 406 tests, typecheck clean, 308 pages with every guard passing, and
this branch's own `/cost-per-month/` taking its four anchors from `main`'s change with nothing to
do. GitHub reports it `clean` again. #17 needed no repair: it was really merged and built here
rather than trusted to `git merge-tree` — 398 tests, 307 pages, every guard passing — and its ledger
came out needing no rebuild at all, because `main` did not touch the one hash that branch owns.

**What to continue.** The anchors exist and almost nothing points at them, which is the item this
run adds to the top of the backlog: a *Jump to* line on the long pages, and internal links that
point at the section that answers rather than at the page that contains it. The judgement to make
first is which links deserve it, because re-pointing every one because it is now possible is
keyword stuffing by another name.


### 2026-09-19 — every heading on 111 pages called the page's subject "it"

**Why this item.** `npm run model-watch` prints `2026-09-19` as last checked, so the watch was done
and the backlog was the job. Every open item on it is waiting on Ryan, or is a measurement written
down so nobody takes it twice, which is where the seven runs before this one found it too. Both open
pull requests were checked first and **both still merge clean into `main`**, #16 and #17, so there
was no repair to do. The work came from the same place as the run before it: a question with real
search volume that this site answers, asked on the page in words nobody types.

**What the headings said.** A machine page and a model page are each about one thing, and every
heading on them referred to it as *it*: **What it runs**, **Other machines to weigh against it**,
**How good is it, really?**, **What it costs either way**, **Machines that run it**, **The machines
that miss it, and what they run**, **It fits at 16k of context**. 284 headings across 111 pages, and
not one of them named a machine or a model.

**Why that is worth an hour.** The `h1` above them does name the subject, so a reader coming down
the page is never lost and the grammar is right. A reader from a search result does not come down
the page. They land on the heading that matched what they typed — *what can a 3090 run*, *is Qwen3
32B any good*, *what hardware do I need for Gemma 4 12B* — and a heading with a pronoun in it is the
answer to a question about nothing. It is the same fault as a title cut before the memory size: the
page holds the answer and the part a searcher sees does not say so.

| | before | after |
| --- | --- | --- |
| headings naming their subject | 0 of 430 | 284 of 430 |
| headings calling it "it" | 284 | 0 |
| figures, tables, links or counts changed | — | 0 |

**What keeps its wording, and why that is not an oversight.** The other 146 are `The specifics`,
which heads the spec list, and 35 shorter-window sections — *Four more machines, at a shorter
window*. Both are about the page's own furniture rather than about the machine or the model, neither
is the answer to anything anybody searches for, and neither carries a pronoun. The rule is one line:
**a heading that answers a question somebody asks in the subject's own name names it.** Nothing on
the comparison pages changed either — their `h1` and their *Side by side on …* headings already name
both sides.

**How a machine is named.** `shortHardwareLabel()`, which is what the tables and every other page
call it: *What the Framework Desktop, 128GB runs*, not the `hardwareLabel()` the `h1` and the
breadcrumb use, which would put *Strix Halo* three times down one page. The longest heading the rule
produces is 69 characters, on the Corsair AI Workstation 300, 128GB; a heading is not a title, so
nothing is cut.

**The guard.** `checkSubjectHeadings()` holds two claims. The first is the rule itself: **no heading
on these 111 pages refers to the page's subject as "it"**, with the subject's own name stripped out
of the heading before the pronoun is looked for — because two models here are called *Gemma 4 31B
it* and *Gemma 3 12B it*, where *it* is what Google calls an instruction-tuned build, and a guard
that did not know that would refuse a page for printing the model's real name. The second is that a
heading of a naming shape names **this** page's subject: the fault it catches is a builder handed
the neighbour's machine, which reads as a fact and is the one mistake a reader could not spot. The
build prints *`111 machine and model pages name their subject in 284 headings; none of the headings
on them calls it "it"`*.

**Six breaks, each run and each caught.** Put `What it runs` back → *`/hardware/mac-mini-m6-32/`
heads a section "What it runs", which calls Mac mini M6, 32GB "it"*, on all 56. Put `How good is it,
really?` back → the same on all 55, and the shape claim as well. Head every machine's table with the
first machine in the data → *`/hardware/mac-mini-m5-pro-24/` heads a section "What the Mac mini M6,
16GB runs", which names Mac mini M6, 16GB where the page is about Mac mini M5 Pro, 24GB*, on 55.
Head every model's machines with the first model → the same, on 52. Add a pronoun after the name,
which is where stripping the name could have hidden one → *"What Qwen3 8B costs either way, and what
it saves", which calls Qwen3 8B "it"*. And `It fits at 16k of context` back on the one page that
carries it → caught by both claims.

**No new test.** The change adds no helper to `src/pagekit.ts` — it is seven heading strings and the
guards that read them back — so the guard is the test, and it runs on every build and every deploy.
393 tests unchanged, typecheck clean, the full `npm run build` including `build:og`, `build:share`
and `build:functions`, 307 pages with every guard passing, and both a machine page and a model page
read rendered out of `dist/`.

**What the sitemap did, because it is the thing to watch here.** 111 hashes move in
`seo/page-dates.json` and **no date moves**: every one of those pages had already changed today, on
the runs before this one. The words a visitor reads did change, so a new date would have been
earned; there was none to take.

**Pushed as `f2e2d2d`, with the log as `9314210` and this line as `b80f109`. Deploy run 228 went
green at 14:49 on 2026-09-19**, so the headings are live. Runs 226 and 227 were each cancelled by
the next push a minute later, which is the usual shape here and is why the green one is three
numbers along from the code commit.
Both open pull requests were **really merged into the new `main` in
worktrees and built there**, rather than trusted to a clean `git merge-tree`, because #16 edits
`scripts/build-pages.ts` too: #16 gives 403 tests, 308 pages and this run's guard passing at 284
headings; #17 gives 395 tests and 307 pages. Both are still waiting on Ryan.

**What to continue.** The backlog is where the last seven runs left it. The item this run adds is
the thing the measurement turned up and deliberately did not take: **no heading on this site has an
`id`**, so no section here can be linked to and no search result can offer a jump link into one. It
is a push rather than a pull request, and the reason it is written down rather than done is the
sitemap: it changes no word a visitor reads and would re-date all 307 pages.

### 2026-09-19 — the memory table answered a question nobody asks in the words it is asked in

**Why this item.** `npm run model-watch` prints `2026-09-19` as last checked, so the watch was done
and the backlog was the job. Every open item on it is waiting on Ryan or is a note written down so
nobody re-finds it, which is where the six runs before this one found it too. Both open pull
requests were checked first and **both still merge clean into `main`**, #16 and #17, so there was no
repair to do. The site's mechanics were swept for anything the guards do not already hold — no
dangling internal link among the 307 pages, no duplicate or missing title or description, no
description over 155 characters — and all of it was clean. The work came from the other side: the
one question with real search volume that this site holds the answer to and does not ask.

**The question.** `/how-much-memory/` asks four of them in its own headings — *How much memory for a
7B or 8B model?* and the same for 14B to 32B, 70B and 100B and over — and every one of them starts
from the model. The reader with a machine already on the desk starts from the other end: *what can I
run with 16 GB*, *what LLM fits in 24 GB of VRAM*, *is 32 GB enough*. The site has had that answer
since the memory ladder was built. It was under a heading that reads as a statement, *Installed
memory is not usable memory*, and it was keyed on the figure the reader cannot know yet.

**What being keyed on usable memory did to it.** The table's first column was usable memory and its
rows ran up that, so the three rungs a 32 GB machine can land on sat at 21 GB, 24 GB and 31 GB —
with a 36 GB machine in between two of them. A reader with 32 GB met their own size three times,
never together, and had nothing in the table to tell them which row was theirs. The same split cut
96 GB and 128 GB in two. Keyed on the number printed on the box, every size reads as one block and
the usable figure sits beside it as the answer to *and how much of that do I actually get*.

| | before | after |
| --- | --- | --- |
| first column | usable memory | the size on the box |
| sizes broken into more than one run | 32 GB, 96 GB, 128 GB | none |
| rows opening the calculator | 0 of 13 | 13 of 13 |
| machines, levels or figures changed | — | 0 |

**Nothing about the data moved.** Same 13 rows, same machines, same counts, same models; the rows
are sorted differently, two columns swap places, and a thirteenth link column is added of the kind
every other table on this site already carries. The heading now asks the question and the paragraph
under it answers it in the first sentence, then keeps the sentence the old heading was making —
the number on the box is not the number a model gets — and says where that bites hardest, which it
reads out of the data rather than asserting: *32 GB appears 3 times below, handing a model anything
from 21 GB on the Mac mini M6, 32GB to 31 GB on the AMD Radeon AI PRO R9700, 32GB.*

**One thing the re-sort would have broken silently.** `strongestPlateau()` reads the ladder in order
and reports its finding as a stretch of *usable* memory — *from 21 GB up to 119.5 GB the strongest
model does not change*. Sorted by the size on the box that stretch is no longer a stretch, so the
plateau keeps the usable-sorted ladder and only the table re-sorts. The paragraph under the table
also pointed at *the last column*, which is now the link, so it names the strongest-model column
instead.

**The guard.** `checkMemoryLadder()` holds four things, and the first is the claim the new paragraph
makes: every size a machine on sale here comes in has a row, so *every size a machine on sale here
comes in is below* cannot quietly go false when a machine is added. Then that the rows read up the
size on the box with each size in one unbroken run; that every level of usable memory among those
machines is there exactly once, which is what catches a machine dropped rather than merely
re-sorted; and that each row's link opens the calculator on that row's own machine and the strongest
model it holds. The build prints *`/how-much-memory/` answers 9 memory sizes over 13 rows, each
opening the calculator on the strongest model that size holds*.

**Six breaks, each run and each caught.** Sort the table by usable memory again → *the table reads
36 GB and then 32 GB, so a reader looking for one size meets it in two places*, which is the fault
this run fixed. Drop the 36 GB rung from the table → *36 GB is a size you can buy a machine in here
and the table skips it*, and *27 GB of usable memory has 0 rows where it should have one*. Drop a
usable level from the ladder itself → the second of those alone, naming 24 GB. Point every row's
link at the first current model → *the Mac mini M6, 16GB row opens the calculator on something other
than its own machine and model*, on all 13. Name that model in the strongest column → *the Mac mini
M6, 16GB row names qwen3-coder-30b-a3b-q4 where gemma-4-12b-q4 is the strongest it holds*. Rename
the heading → *`/how-much-memory/` no longer asks what the memory you have runs*.

**No new test.** The change adds no helper to `src/pagekit.ts` — it is a sort, a column order and a
link inside one page builder — so the guard is the test, and it runs on every build and every
deploy. 393 tests unchanged, typecheck clean, the full `npm run build` with `build:functions`,
307 pages with every guard passing, and the page read rendered out of `dist/`.

**Pushed as `3fff055`, with the log as `22f6413`. Deploy run 224 went green at 13:53 on
2026-09-19**, so the page is live. Both open pull requests were re-checked against the new `main`
afterwards and **both still merge clean**, #16 and #17, although #16 touches `scripts/build-pages.ts`
too.

**What to continue.** The backlog is where the last six runs left it: every open item is Ryan's, or
is a measurement written down so nobody takes it twice. The item this run adds is the other half of
what it found — the inverse question now has a heading on `/how-much-memory/`, and it has no page of
its own, which is a bigger piece of work and a pull request rather than a push.

### 2026-09-19 — ten search results were cut before the second machine's memory size

**Why this item.** `npm run model-watch` prints `2026-09-19` as last checked, so the watch was done
and the backlog was the job. Every open item on it is waiting on Ryan, or is a note written down so
nobody re-finds it, which is where the five runs before this one found it too. Both open pull
requests were checked first and **both still merge clean into `main`**, #16 and #17, so there was no
repair to do. The work came out of the one number this build has printed for days and nobody had
read: `checkMeta()` ends with a warning, and it said **13 titles over 60 characters**.

**What the 13 were.** Ten machine head-to-heads, two model head-to-heads and one that turned out to
be neither — the count is bytes in a shell and UTF-8, so the `·` in the brand suffix reads as two.
The real list is 13 and the guard had it right. On the ten, the title is two machine names joined by
*vs*, and the second name's memory size is the last thing in it: **MacBook Air M5 (15-inch), 16GB vs
MacBook Pro M5 Pro (16-inch), 64GB** is 68 characters, so a search result showed the reader
everything except the figure the page turns on. Nine of the ten carry a MacBook, and every one of
them spends ten characters on a bracket.

**The bracket separates two machines only where this site prices both.** `data/hardware.json` holds
one MacBook Pro M5 Pro, the 16-inch, in three memory sizes, and one MacBook Pro M5 Max, also 16-inch.
It holds **two MacBook Air M5s at 16GB**, a 13-inch and a 15-inch, and there the bracket is the whole
of the difference. So the rule is not *drop the screen size*: it is that a title may leave it out
where no other machine here answers to the name without it, and must keep it where one does.
`titleHardwareLabel()` in `src/pagekit.ts` does exactly that against the whole fleet, and it is used
nowhere but the title. The page's `<h1>`, its meta description, its tables and every other label on
the site keep the full name, which is the same split `shortHardwareLabel` was written for.

| | before | after |
| --- | --- | --- |
| titles inside 60 characters | 294 of 307 | 304 of 307 |
| head-to-heads that drop a redundant screen size | 0 | 10 |
| page bodies changed | — | 0 |

**Nothing a visitor reads on the page moved.** The only bytes that changed on those ten pages are the
`<title>`, the `og:title` and the `twitter:title`, which is why ten hashes move in
`seo/page-dates.json` and no dates do — every one of those pages had already changed today.

**Three are still long, and all three are honest.** `/compare/nemotron-3-5-lightning-30b-q4-vs-qwen3-235b-a22b-2507-q4/`
at 63 and `/compare/deepseek-r1-distill-qwen-32b-q4-vs-deepseek-r1-distill-llama-70b-q4/` at 61 are
model pairs: *Qwen3 235B-A22B Instruct 2507* and *DeepSeek-R1-Distill-Llama-70B* are the names their
publishers use, and cutting a word off either would be naming a model something nobody calls it.
The third is `/compare/macbook-air-m5-15-inch-16gb-vs-nvidia-rtx-pro-6000-blackwell-96gb/` at 62,
where the bracket is the thing that tells the two Airs apart and the other side is a chip name.
Backlog item added rather than forced.

**The guard, and the version of it that had a hole.** `checkTitleLabels()` holds three things: no
title anywhere names a machine by a name a second machine answers to; a bracket is dropped only where
keeping it would have put the title over the limit; and a head-to-head still over the limit is one
where neither name had a bracket left to lose. The first version asked those questions through
`titleHardwareLabel()` and `withoutBracket()`, the same helpers the builder uses, so **a rule that
stopped shortening anything at all would have passed it**: with `withoutBracket()` neutered, nothing
is loseable, so nothing is over length with something to lose. It now cuts the bare name itself with
its own regex over `data/hardware.json`, and that same break fails it at 10 pages, naming them.

**Four breaks, each run and each caught.** Remove the two shortened rungs from the title ladder →
*10 page titles … longer than a search result shows*. Make `titleHardwareLabel()` return the bare
name always → *4 page titles name a machine by a name that is not its own*, naming both Airs on both
their pages. Neuter `withoutBracket()` → the 10 again, each named with the screen size it still
carries. Put the shortened rungs first, so a title shortens where the full names would have fit →
*`/compare/mac-mini-m5-pro-24gb-vs-macbook-pro-m5-pro-16-inch-64gb/` drops a screen size to reach 49
characters where the full names fit in 59*.

**Five tests, and two breaks proved them.** The strongest is that `titleHardwareLabel()` over the
whole fleet still gives 56 distinct names for 56 machines. One test adds a hypothetical 14-inch M5
Pro to the fleet and asserts the 16-inch gets its bracket back, so the rule is held to the fleet it
is given rather than to today's data. Returning the bare name always fails 3 of the 5; never dropping
fails 2.

**Verified on `main` at `7ce0dcd` and pushed as `a0ec560`:** 393 tests where it was 388, typecheck
clean, the full `npm run build` including `build:og`, `build:pages`, `build:share` and
`build:functions`, 307 pages with every guard passing, the four breaks above, and the changed heads
read out of `dist/` — title short, description and `<h1>` full. 305 of 308 titles in `dist/` fit 60
characters, the extra page being `/` which the sitemap counts and `meta` does not.

**What to continue.** Nothing here is half-done. The backlog's top open items are all notes or
Ryan's; the next run that wants work of its own could look at what the site does with
`/hardware/` and `/leaderboard/` naming each other, which is the oldest open question on the list.

### 2026-09-19 — the site compared models by what they are and never by what they ask of a machine

**Why this item.** `npm run model-watch` prints 2026-09-19, so the watch was done and the backlog was
the job. Every open item on it is waiting on Ryan or is a note written down so nobody re-finds it,
which is where the four runs before this one found it too. Both open pull requests were checked
before anything else and **both still merge clean into `main`**, #16 and #17, so there was no repair
to do. The entry below this one said where to look: the machine head-to-heads had six rules and the
model ones had two, and nobody had asked whether models have a question the two rules miss.

**What it found, by reading the two rules rather than the pages.** Both of them ask what a model
**is**. The ladder sets each model against the next one down the intelligence index, which is the
choice you face once you know what your machine holds. The generation rule sets each
last-generation model against what replaced it, which is the choice you face once you are already
running one. Neither asks the question a reader with a machine already on the desk starts from,
which is what to run in the memory they have. **19.7 GB at 32k of context is Gemma 3 27B or Devstral
Small 2 24B**; 20 GB is GLM-4.7-Flash or the same Devstral; 9.8 GB is Ministral 3 8B or Gemma 3 12B.
Not one of those pairs had a page, because two models of the same size are rarely near each other on
the index: GLM-4.7-Flash scores 15 and Devstral Small 2 24B scores 8, and twenty-one models sit between them
on the index.

**The rule.** `memoryNeighbourPairs()`: each model against the model from another family nearest it
in the memory it needs, stronger side first, where the two are within a tenth of each other. The
families have to differ, because two models from one maker at the same size are the quantisations
and generations the rules above already cut. One pair per model, its own nearest, rather than every
pair inside a band, for the reason the price rule gives: a band writes a grid of near-identical
pages around the crowded sizes and leaves the smallest and largest models with none.

**Memory is the footprint, not the weights, and that is the part worth keeping.** The figure is
`footprintGb()` at the context this site assumes, weights and cache together, which is the same
number the fit is worked out from and the same number the page prints in its *Needs at 32k* row.
Weights alone would have missed the pairs where the cache is the difference: **Gemma 4 31B and
Nemotron 3.5 Lightning are 30% apart in weights and within a percent of each other at 32k**: 19.6 GB
of weights and 6.21 GB of cache against 25.48 GB and 0.20 GB. A test holds that, so a future change
to the rule cannot quietly go back to comparing weights.

| | before | after |
| --- | --- | --- |
| model head-to-heads | 53 | 78 |
| head-to-heads of every kind | 165 | 190 |
| pages on the site | 282 | 307 |

**The cap.** A tenth, and on this data it decides nothing: the widest pair it keeps is 8.7% apart
and the nearest one it turns away is 12.7%, so no pair is kept or dropped by a hair. Written into
the backlog as a note, the way the price cap was.

**Four pairs were already pages, and they keep the words they had.** The ladder and this rule both
write the stronger model first, so a pair both reach has one address, not two. The ladder is cut
first and keeps it: DeepSeek-R1-Distill-Llama-70B against Llama 3.3 70B is still *above it on the
leaderboard* rather than *needs much the same memory*, which is what a reader arriving from the
leaderboard is looking at.

**The pages get no new section, and that is deliberate.** The template already prints what each
model needs at 32k in its own row, and where both models fit the same machines it already says,
under *Memory is not what separates them*, that the choice between them is what each is good at,
how fast it runs and what the same work costs on an API. A paragraph saying that again is filler.
What the pages did gain is real and reads on the page: GLM-4.7-Flash against Devstral Small 2 24B
opens *"Both take the same machine to start... GLM-4.7-Flash is about 4.1× quicker: 40 tok/s against
9.7"*, which is the whole answer to a question the site could not be asked before.

**The sentence that is new, and why it is a sentence of its own.** A model can be in three of these
pairs, and they all carry the same reason, so strung through the existing line they would say *which
needs much the same memory* three times. The model pages say *"Three more models need much the same
memory at 32k of context: vs Qwen3.6 27B, vs Devstral Small 2 24B, vs Mistral Small 3.2 24B
Instruct"*, and the note under each head-to-head says the same for each of its two sides. Where a
model page has no rung and no generation pair left to name, the memory neighbours carry the sentence
instead of following one.

**The guard, and the version of it that was not a guard at all.** `checkMemoryNeighbours()` recuts
the rule from `data/models.json` rather than reading the list the pages were built from: every pair
two scored models of different families, stronger first, inside the cap, one of the two the other's
genuine nearest outside its own family, and both footprints printed on the page, because that figure
is the claim. **The first version of the other direction passed a deliberate break**: it asked only
that a page saying *much the same memory* link a pair the rule cut, and `/compare/` links every
comparison on the site, so the index could have said it about anything. It now holds a list of the
pages the rule reaches — a model in one of these pairs, or a head-to-head one of whose sides is in
one — and the same break fails it, naming `/compare/`. It prints `29 head-to-heads between models of
different families within 10% of each other in the memory they need at 32k`.

**Five breaks proved the guard**, exit 1 each time: the family condition dropped (7 problems, two
kinds, naming the Qwen pairs it invented); the pairs written weaker side first (29 pages); the
reason dropped from the sibling sentence, caught by `checkMatchUpSiblings()` rather than by the new
guard; the `much the same memory` phrase put in `/compare/`'s lede; and both places a page prints
what each model needs removed together, which is the one that showed the check is not satisfied by
the table alone. **Three more proved the tests**: the family condition dropped, the rule measured on
weights instead of footprint, and the rule appended before the ladder instead of last.

**Verified.** 388 tests (9 new), typecheck clean, the full `npm run build` end to end with
`build:functions`, 307 pages with every guard passing, and the new share cards drawn and covered by
the existing card tests. All 29 pages swept out of `dist/`: 686 to 852 words, every one in the
sitemap, every one with its card, and none carrying a maintainer word or an em dash. Three read
rendered — two 27B models on one $1,269 machine, a mixture of experts against a dense model at the
same 20 GB, and the pair at the top of the range where no machine holds both at 32k and the page
moves the race to 16k.

**Pushed to `main` as `ef1d700`**, deploy run 220.

**Both open pull requests were re-checked against this push, really merged and built rather than
trusted to a clean `git merge-tree`.** PR #16 (`seo/cost-per-month`) merges clean: 398 tests,
typecheck clean, 308 pages with every guard passing. PR #17 (`seo/home-h1`) merges clean: 390 tests,
typecheck clean, 307 pages. Neither needs an extra commit. The two still do not merge into each
other, and that resolution is unchanged, because nothing in this push touches `index.html`.

**What to continue.** Nothing here is half-finished. The two new backlog items are notes rather than
work: the cap is a round number that decides nothing today, and these are the shortest pages on the
site for a reason the rule explains. The model side now has three rules to the machine side's six,
and the next question of the same kind is probably not another pairing rule but the indexes: the
site has a page ranking machines, a page ranking cards and a page ranking models, and nothing that
answers "what runs in 32 GB", which is the question these 25 pages answer one pair at a time.

### 2026-09-19 — the site compared machines by hardware and never by money

**Why this item.** `npm run model-watch` prints 2026-09-19, so the watch was done and the backlog was
the job. Every open item on it is waiting on Ryan, already written down as "leave it", or a "worth one
look" its own wording expects to end in nothing, which is where the three runs before this one found
it too. Both open pull requests were checked before anything else and **both still merge clean into
`main`**, #17 at `6c81367` and #16 at `2c7e5e2`, so there was no repair to do. So this run went
looking, the way the entry below said the next one would have to.

**What it found, by reading the rules rather than the pages.** Six rules cut the 144 head-to-heads
this site had, and **every one of them holds a piece of the hardware equal and asks what the price
gap buys**: the same chip at two memory sizes, the same silicon in two boxes, the same box a
generation apart, one box's entry chip against the one above it, the grid of family flagships, the
grid of cards. Not one of them asks the question a buyer starts from, which is what a given amount
of money buys. $1,299 is a Mac mini M6 with 32 GB **or** a Radeon AI PRO R9700 with 32 GB, $4,699 is
a DGX Spark and $4,700 a Corsair AI Workstation 300 with the same 128 GB, and nothing on this site
put either pair side by side. A cross-family pair existed only between the eight family flagships,
which is the median-priced machine of each range, so the prices in those 28 pairs are as far apart
as the ranges are.

**The rule.** `priceNeighbourPairs()`: each machine against the machine from another family nearest
it in price, cheaper side first, where the two are within a tenth of each other. Discontinued and
unpriced machines are out, because the price is the whole of the comparison. One pair per machine,
its own nearest, rather than every pair inside a price band — a band writes a grid of near-identical
pages around the crowded prices and leaves the cheap and dear ends with none. The families have to
differ, because two machines from one maker at the same price are the memory tiers and chip steps the
older rules already cut.

| | before | after |
| --- | --- | --- |
| machine head-to-heads | 90 | 111 |
| head-to-heads of every kind | 144 | 165 |
| pages on the site | 261 | 282 |

**The 21 pages, and why none of them is thin.** 858 to 1,180 words each, against a site median of
1,024, every one in the sitemap and linked from `/compare/`, every one carrying the full comparison
table, the like-for-like on the strongest model both hold, pay-back at five levels of use and the
prefilled calculator links that go with them. The template was already proven on cross-family and
card-against-computer pairs, because the flagship grid makes both shapes, so nothing here is a page
type the site has not shipped.

**The section they carry, and what it deliberately does not say.** `sameMoneySection()` is one
paragraph, because the rest of the page already prices what each machine holds, how fast it runs it
and how long it takes to pay back, and a section that repeats a figure is filler. It says the two
prices and the gap, names the two makers from `brandOf()` — eleven of the 21 are two Apple machines,
so a sentence about different makers would be wrong on half of them — and then says the one thing
nothing else on the page says: that the row which usually carries the answer is the row these two
agree on. Where one side is a graphics card it adds that its price is the card alone, which is what
stops the two figures being the same money at all. Three pages are that shape.

**One wording fault came with the new pages and is fixed for the whole site.** Two machines at the
same price on the same model can come out days apart over decades, and days do not survive the
rounding the pages print at, so `machineVerdict()` opened three pages with *"pays for itself sooner,
in 17 years against 17 years at 500k tokens a day"* — a sentence arguing with the table under it,
which prints both as 17 years. It compares the printed durations now, not the raw days, and says
*"Both pay for themselves in 17 years"* where they match. The branch existed for an exact tie; it
just never fired, because two machines are rarely equal to the day.

**Two guards.** `checkPriceNeighbours()` recuts the rule from `data/hardware.json` rather than reading
the list the pages were built from: every pair two current priced machines of different families,
cheaper first, inside the cap, and one of the two's genuine nearest price outside its own family. It
holds the other direction as well — no page that is not such a pair may carry the section — and where
one side is a card it holds the section to saying what that price buys. It prints `21 head-to-heads
between machines of different families within 10% of each other in price, 3 of them pricing a card
against a whole computer`. `checkPayBackReads()` holds the lede across all 165 comparisons.

**Seven breaks proved the guards**, exit 1 each time: the section dropped (named the first of 21);
the section printed on every pair (*says two machines cost the same money and is not a pair the rule
cut*); the cap widened to 25% (*is 15% apart in price*, plus a pair with no page and a page with no
pair); the card caveat removed, with the older `checkCardPrices()` silenced so the new claim had to
be the one that fired (3 pages, *calls a card's price the same money as a whole computer*); the pairs
written dearer side first (21 pages); and the pay-back fix undone (3 pages, naming the figure printed
on both sides). **Four more proved the eight new tests**: the family test dropped, the cap removed,
the rule appended before the others instead of last, and the lede fix undone.

**Verified.** 380 tests (8 new), typecheck clean, the full `npm run build` end to end with
`build:functions`, 282 pages with every guard passing, and the new share cards drawn and checked by
the existing card tests, which cover every pair `hardwarePairs()` returns. Six of the 21 pages read
rendered out of `dist/` — a card against a computer, two machines at the same price to the dollar,
two at $1 apart, two at the far ends of the memory range — and all 21 swept for maintainer words and
em dashes, of which there are none.

**Pushed to `main` as `9d035bb`**, deploy run 218, green at 11:05 and published.

**Both open pull requests were re-checked against this push, really merged and built rather than
trusted to a clean `git merge-tree`.** PR #16 (`seo/cost-per-month`) merges clean: 390 tests,
typecheck clean, 283 pages with every guard passing, and `/cost-per-month/` passes both new guards as
it stands. PR #17 (`seo/home-h1`) merges clean: 382 tests, typecheck clean, 282 pages. Neither merge
leaves `seo/page-dates.json` dirty after a rebuild, so neither needs the extra commit the top of this
file warns about for the other collision. **The two still do not merge cleanly into each other** —
`git merge-tree pr16 pr17` still reports the conflict — and that resolution is unchanged, because
nothing in this push touches `index.html`.

**What to continue.** Nothing here is half-finished. The two new backlog items are both "written down
so nobody re-finds it" rather than work: the cap is a round number that decides nothing today, and
the 45 words the 21 pages share are the rule's own explanation. Every other open item is still
waiting on Ryan, so the next run should expect to go looking with a measurement of its own again.
The model side is the obvious place left: the machine head-to-heads now have six rules and the model
ones have two, and nobody has asked whether models have a question the two rules miss the way the
machines did.

### 2026-09-19 — a machine page printed 661 speeds and named the source of one

**Why this item.** `npm run model-watch` prints 2026-09-19, so the watch was done and the backlog was
the job. The top open item was the one the 09:0x run found while rewriting the machine ledes: the
"What it runs" table on all 56 machine pages prints a `tok/s` figure a row and marks none of them
measured or estimated, where `/hardware/` marks all 56 of its own and the head-to-heads mark theirs.
Both open pull requests were checked before anything else and **both still merge clean into `main`**,
#17 at `6c81367` and #16 at `2c7e5e2`, so there was no repair to do.

**How bad it was, counted rather than assumed.** 661 speeds across the 56 tables, and **exactly one
of them is a measurement** — 103 tok/s for gpt-oss-20b on the GeForce RTX 4080. The other 660 are
worked out from the machine's memory bandwidth. Across every pair the site computes, 1,425 where a
machine here holds a model and has a speed for it, 1,397 are estimates and 28 are measured. So a bare
figure on a machine page read as a measurement 660 times out of 661, on the page a reader lands on.

**The fix.** The speed cell is `speedWithBasis()` now, the helper `/hardware/` has always used, so
every row says *measured* or *estimated* beside the number. Two answer blocks went with it, because
they were the same omission one heading higher: the machine page's *Best model it runs* and the model
page's *Fastest of the ones listed*, 110 rows between them, 4 of them measured. `/best/` marked an
estimate and left a measurement bare, which reads as an oversight rather than a claim; it uses the
same helper now, and since all 45 of its rows are estimates today, nothing on that page changed.
**No figure moves anywhere**: the mark is `throughput.measurement`, the field the data already
carries, and the numbers are the ones the pages already printed.

**The sentence that makes the mark mean something.** A mark nobody explains is decoration, so the
note under each table now says which, in that machine's own split. On the 55 where nothing in the
table is measured: *"Each speed says how it was arrived at, and every one here is estimated from this
machine's 1200 GB/s of memory bandwidth rather than taken from a published benchmark."* On the RTX
4080, the only machine with both: *"one of the 12 here is measured, from a published benchmark run on
this machine, and the rest are estimated from its 716.8 GB/s of memory bandwidth."*

**One wording change that reading it rendered forced.** The model page's answer row first came out as
*"182 tok/s estimated at 32k context"*, where *estimated at 32k* reads as the context the estimate was
taken at rather than as the mark. It is *"at 32k context, 182 tok/s estimated"* now, so the mark ends
the phrase the way it does everywhere else on the site.

**The helper.** `speedWithBasis()` took a `ModelRow`, and an answer block holds a speed without the
row it came from, so the body of it is `speedFrom(throughput)` now and `speedWithBasis()` is one line
on top of that. The rounding the two share moved into one place rather than being written out twice.

**The guard.** `checkSpeedBasis()` holds three claims: no table cell on any of the 261 pages prints a
`tok/s` figure without saying how it was arrived at; no answer row on a machine or model page does
either; and every machine page with a table says what the mark means. It prints `2052 speeds in
tables and 110 in answer blocks say whether they were measured or estimated; 56 machine pages say
what the mark means`. Prose is deliberately left alone — `/local-llm-vs-api-cost/` and the comparison
ledes say their basis in their own words, and a pattern should not try to police a sentence.

**Verified:** 372 tests, typecheck clean, the full `npm run build` including `build:functions`, and
261 pages with every guard passing. **Five breaks proved the guard**, exit 1 each time: the machine
table cell put back bare (661 speeds, naming five machines), the machine answer row (56), the model
answer row (54), `/best/`'s cell (45), and the explaining sentence removed (56, naming the machines).
Two new tests cover `speedFrom`: that it agrees with `speedWithBasis` on a row it can be given both
ways, and that it rounds to a decimal below ten the way the pages print it. Read rendered out of
`dist/` on an all-estimated machine, the one mixed machine, a discontinued card and a machine with no
published price, plus two model pages and `/best/`.

**One thing checked while here, so nobody chases it: the calculator is already right.** `src/render.ts`
tags every row of its model list *measured*, *estimated* or *yours* beside the speed, and the
assumptions panel names the basis and its source. The generated pages were the only place a speed
printed bare.

**Pushed to `main` as `e9c2b15`**, deploy run 216, green at 09:50 and published.

**Both open pull requests were re-checked against this push, really merged rather than trusted to a
clean `git merge-tree`.** PR #16 (`seo/cost-per-month`) merges clean: 382 tests, typecheck clean, 262
pages with every guard passing, and `/cost-per-month/` passes the new guard as it stands. PR #17
(`seo/home-h1`) merges clean: 374 tests, typecheck clean, 261 pages. The import list in
`scripts/build-pages.ts` was the collision to expect — this run extended the line PR #16 has already
extended twice — and this time the two additions landed on different lines of the block, so git had
nothing to resolve. The two still do not merge cleanly into **each other**; that resolution is
unchanged and is written at the top of this file and on both pull requests.

**What to continue.** Nothing here is half-finished. Every remaining open item on the backlog is
waiting on somebody else: the home page's 142 words is a design question for Ryan, the Q8 pages want
Search Console, and the model watch's candidate wants figures only he can sign off. So the next run
should expect to go looking with a measurement of its own, the way the last three did.

### 2026-09-19 — fifty machine pages opened with somebody else's paragraph

**Why this item.** `npm run model-watch` prints 2026-09-19, so the watch was done and the backlog was
the job. Every open item on it is still waiting on Ryan, already written down as "leave it", or a
"worth one look" its own wording expects to end in nothing, which is where the 07:5x run found it
too. Both open pull requests were checked before anything else and **both still merge clean into
`main`**, #17 at `6c81367` and #16 at `2c7e5e2`, so there was no repair to do. So this run took a
measurement nobody here had taken, and it found something on the second look rather than the first.

**The measurement.** Pairwise similarity between every generated page, as the Jaccard overlap of
5-word shingles over the rendered text inside `<main>`, within each page type. Near-duplicate pages
are the classic risk for a site that builds 261 pages from four templates, and nobody had checked.
The numbers: comparisons median 0.115 and worst 0.745, models median 0.278 and worst 0.701, machines
median 0.289 and worst 0.878, and the seven indexes under 0.02 against each other. The worst pairs
are two memory sizes of one machine, or two models of one family. **As whole pages that is fine**,
and the answer to this measurement on its own is to leave it alone: the pages differ in every figure
that matters, and rewriting a template to push a similarity number down is writing for a measurement
rather than for a reader. It is written down in the backlog above so nobody takes it again. For the
record, this run's own change barely moves it: the worst machine pair goes from 0.878 to 0.864,
because the paragraph it rewrites is fifty words of a thousand-word page. The paragraph is not where
that number lives, which is exactly why the number could not see the fault.

**The fault, which was in the one paragraph the number could not see.** Reading the worst pair rather
than trusting its score: `/hardware/mac-mini-m5-pro-48/` and `/hardware/mac-mini-m5-pro-64/` open with
the same sentence, and so do 48 other pages. Counted exactly, over the first paragraph of all 56
machine pages: **18 distinct opening paragraphs, and 50 of the 56 pages opened with one that was
character-identical, figures and all, to another page's.** Ten pages shared a single sentence; nine
shared another; six shared a third. A $1,299 Framework Desktop and a $4,999 Mac Studio both said
*"33 of the 39 open models on this site fit in its 96 GB of usable memory, the strongest being
Qwen3.8 27B. Whether that saves you money is a different question, and the answer is usually no."*

The reason is in what the paragraph answered. It answered memory, and memory is the one figure two
machines thousands of dollars apart can share. Price, speed and pay-back are what separate them, and
all three were on the page already, in the answer block directly below and in the description a
search engine prints, which has carried this machine's own pay-back since it was written. The one
sentence Google is most likely to quote was the one sentence that did not.

**The fix.** The second sentence of the paragraph now gives the machine's own answer instead of a
general one: *"Whether that saves you money is a different question: at $3,449 and 500k tokens a day,
it pays back in 45 years."* Both figures come from the same `hwVerdict` and `hw.price_usd` the page
already prints two lines down, so no figure is new and none was invented. **56 distinct paragraphs
where there were 18, none repeated.** The 2 machines with no published price keep the sentence they
had, because there is no pay-back to name; that is 54 pages changed, and `seo/page-dates.json` moved
on exactly those 54 and on nothing else, no model page, no comparison, no index.

**Two things the wording had to get right.** A discontinued machine says *"at its $1,999 launch
price"* rather than *"at $1,999"*, because it is not a price anyone can pay today, and the answer row
below it already says so. And a graphics card's paragraph now says *"the card alone"* where it said
*"the card on its own"*: that is the phrase the rest of this site uses for it, and it is
what `checkCardPrices()` looks for beside a card price. That guard is how the fault was found, which
is the point of it. The first build after adding a price to the card pages' paragraph stopped at
*"7 card prices are printed as if they bought a whole computer"*, exit 1, before anything was pushed.

**The guard.** `checkMachineLedes()` holds three claims: every machine page opens with a paragraph,
a machine whose pay-back can be computed names that pay-back and its own price in it, and no two
machines open with the same words. It prints `56 machine pages open with a paragraph no other machine
repeats, 54 of them naming that machine's own price and pay-back`.

**Verified:** 370 tests, typecheck clean, the full `npm run build` including `build:functions`, and
261 pages with every guard passing. **Three breaks proved the guard**, exit 1 each time: the general
sentence put back (146 problems, being 54 pages missing a pay-back, 54 missing a price and 38
opening with another machine's words), the price alone dropped from the sentence (55), and the
opening paragraph stripped of its `lede` class (56). Read rendered out of `dist/` on nine machines
covering every branch: priced and current, discontinued, card-only, card-only and discontinued, and
both machines with no price. No doubled stop, no double space, no stray space before a stop on any
of the 56.

**Pushed to `main` as `b5aae1f`**, deploy run 214.

**What to continue.** Nothing here is half-finished. The top of the backlog is the new item this run
found while doing it: the machine pages print 661 speed figures and mark none of them measured or
estimated, where `/hardware/` marks all 56 of its own, and 1,397 of the 1,425 pairs behind those
figures are estimates. It is one helper that already exists, on pages that already import it.
PR #17 and PR #16 are both still waiting on Ryan, both still merge clean into `main` as of this run,
and they still do not merge cleanly into each other; the resolution for that is a rebuild rather
than a choice and it is written on both of them and at the top of this file.

### 2026-09-19 — the page all 261 others link back to had no heading at all

**Why this item.** `npm run model-watch` prints 2026-09-19, so the watch was done and the backlog was
the job. Every open item on it is either waiting on Ryan (the Q8 question wants Search Console, the
three unpaired machines want prices, the submissions page wants an export), already written down as
"leave it" (the home page's date, the 307px floor, the seven long titles), or a "worth one look"
that its own wording expects to end in nothing. So this run went looking with a measurement instead,
and the first one it took found something.

**The measurement that found nothing, written down so nobody takes it again.** Crawl depth from `/`,
breadth-first over the built site, following every internal link: **262 of 262 pages are within two
clicks of the home page**, 7 at depth 1 and 254 at depth 2, with nothing unreached. Counting only
links inside `<main>`, so the shared footer flatters nothing, gives exactly the same three numbers.
There is no deep corner of this site and no crawl-budget problem to fix.

**The fault.** The home page is the only page on this site with no `h1`. Measured in Chromium on the
built site at thirteen widths from 320 to 1440px: `document.querySelectorAll('h1')` comes back empty
at every one of them. All 261 generated pages have exactly one; `index.html` has five `h2`s under
nothing, and the app bundle emits no `h1` either, so it is not a rendering timing question.

It is worse than a missing tag, because of what else the page does not have. **The static prose
inside `<main>` on the home page is 142 words, and every word of it is a form label** — *Tokens a
day*, *Context window you want*, *Copy link*, *Assumptions you can change*. The thinnest generated
page on the site is 603 words and the median machine page is 1,024. So the URL that every one of the
other 261 pages links back to from its wordmark, its breadcrumb and its footer, and the one that
ranks for what this site is and what it does, had no sentence in its markup saying so.

**The fix, as [PR #17](https://github.com/rlindsey2/sunkcost/pull/17), and the one thing in it that
needed deciding.** The sentence was already written and already on the page: `.topbar-line` in the
bar reads *"If you buy a machine to run local models, how long until it pays for itself, and what can
it actually do?"*, which is the product statement and the question every generated page is an
instance of. It is the `h1` now. What needed deciding is the phone: PR #12 hid that line below 900px
because the bar has no room for it, and `display: none` on a phone means Google does not get the
heading, since indexing reads the mobile page. So below 900px it is **clipped** rather than removed,
with the declarations `.sr-only` already uses for this page's other screen-reader headings. The words
are in the document at every width and painted only where they fit.

**Nothing moves, and that was measured rather than asserted.** The same thirteen widths before and
after, reading the box of the top bar, the brand, the tagline, the "Data checked" stamp, the theme
button and the machine sentence below: **44 rows differ out of 572, and all 44 are the change
itself** — the `h1` appearing at thirteen widths, and `.topbar-line` going from `display: none` to a
1×1 clipped box at the nine widths under 900px. Every other box is identical to the pixel and no
width overflows where none did. The painted line keeps 13px, weight 400 and the same muted colour,
which is what the `margin: 0` and `font-weight: 400` on `.topbar-line` are for: without them the UA
stylesheet would make an `h1` bold with a 0.67em margin. Read rendered at 390, 900 and 1280px, not
just as HTML.

**Verified:** 372 tests (2 new), typecheck clean, and the full `npm run build` including
`build:functions`, 261 pages with every guard passing. **Four breaks proved the two tests**, exit 1
each time: the `h1` put back to a `<p>` (*expected [] to have a length of 1*), a second `h1` added to
the page, `display: none` restored in the phone rule, and the clip rule dropped.

**It also takes the one line the backlog parked for it.** `src/styles.css` declared `--ok-text`,
`--warn-text` and `--bad-text` twice in a row in the dark-mode block, identical values with the first
misindented, and the item said it should ride with the next pull request touching that file. It does.
The second declaration won, so nothing renders differently. The other parked one-liner, the doubled
full stop in the Memory fit line, is `src/render.ts` and is untouched here — a reviewer reading a
pull request about a heading should not have to review that too, and it is still open below.

**The collision with PR #16 is the one on this repository that a union resolves wrongly, and it is
worth knowing before either is merged.** They conflict in one file and one line. Both branches edit
`index.html` — PR #16 adds a footer entry, this one changes the tagline's tag — so both rewrite the
`"/"` hash in `seo/page-dates.json`, and **neither value is right for the merged tree**. Measured by
really merging the two in a worktree rather than trusting `git merge-tree`: the merged home page
hashes to `d47470180e0b4932`, where this branch records `c4dbfa4065262b1f` and PR #16 records
`eb2f546c5e896018`. Taking either side and committing it costs the home page its sitemap date in
silence: the build then says *"1 changed since the record was last written and go out without one"*
and writes `<url><loc>https://sunkcost.ai/</loc></url>` with no `<lastmod>` at all, which is the
record doing exactly what it was built to do. **Resolve that line either way, run
`npm run build:pages`, commit what it writes.** Nothing else needs attention: `index.html` and
`tests/pagekit.test.ts` auto-merge, and the merged tree was verified here at 382 tests, typecheck
clean and 262 pages with every guard passing. The note is on the pull request as well as here.

**What it deliberately does not do, so the next run does not read it as a gap.** It does not make the
heading visually prominent. Between 900 and about 1,100px the bar ellipsises the sentence, as it has
since it was a `<p>`; the whole of it is in the DOM either way, so a crawler reads all of it and only
the painting is cut. A heading that reads as a heading — above the machine sentence rather than in
the bar — is a design decision about the calculator's front door, not a markup one, and it belongs to
Ryan. It is a backlog item below, with the 142-word measurement that makes the case.

**One thing about this environment, so the next run does not lose the same five minutes.** A fresh
container checks out `origin/main` as a detached HEAD, and the local branch called `main` is **not**
it: here it sat at `94aa957`, the seed commit, 40 commits of pre-rewrite history that `origin/main`
does not contain. `git checkout main` therefore silently swaps `seo/LOG.md` for a two-day-old copy
with no backlog in it, and `git reset --hard` is refused by the sandbox. Branch from `origin/main`
by name — `git checkout -b <name> origin/main` — and push with `git push origin HEAD:main`.
**And one habit worth keeping:** proving a test by breaking it with `sed` and undoing it with
`git checkout <file>` throws away any uncommitted work in that file. It cost this run its own edits
once, harmlessly, because the tests were already written. Commit first, or keep a copy.

**What to continue.** Nothing here is half-finished. PR #17 and PR #16 are both waiting on Ryan, and
the next run should check that both still merge, remembering that these two do not merge cleanly into
each other and that the resolution above is a rebuild rather than a choice. The top of the backlog is
the standing model watch; after that, the new item on what the home page says when nothing is
selected is the one with the most behind it.

### 2026-09-19 — the page that answers "which machine" was linked from nowhere but the footer

**Why this item.** `npm run model-watch` prints 2026-09-19, so the watch was done and the backlog was
the job. Its top open item is the one nobody had done: measure what the internal links are made of
before touching one. Measured first, wrote second, and the measurement chose the work.

**What the words turned out to be, which is the item's own answer.** 7,540 internal links inside
`<main>` across the 261 pages. No generic anchor anywhere — not one *here*, *this*, *read more*, bare
number or empty link. Machines and models are linked by their names, which is what someone searching
for a Mac mini M6 types; the indexes are linked by what they answer. Most destinations carry two to
five distinct phrases. **So nothing was rewritten**, and rewriting a good sentence to fit a keyword is
the thing that backlog item existed to prevent.

**What the same measurement found instead, and it is the whole run.** Counting inbound links inside
`<main>`, so the shared footer flatters nothing, **`/hardware/` had none**. Not a thin count — zero,
on all 261 pages, where `/leaderboard/` had 200 inbound pages, `/compare/` 200, `/best/` 150,
`/how-much-memory/` 114 and `/best-gpu/` 91. It is the site's machine index: 1,720 words, all 56
machines with price, usable memory, how many models each holds and how long that pair takes to pay
for itself, and the page a search for *local LLM hardware* should land on. It links three of its
siblings in its own lede and none of them named it back. The one link every page carried was the
footer's, which every page carries and no page earns.

**Where the link goes, and why there.** Not a rule about tables with prices in them, which would have
put it on 250 pages. It goes in the one sentence that asks the question: a model page's reach line
already says *the table is the cheapest machine in each family, not the only one that runs it: 44 of
the 56 machines on this site hold it at 32k* — a number, and until now nowhere to take it. That
sentence now ends with where all 56 are priced. 54 model pages carry it. `/leaderboard/` and
`/compare/` each name it in the list of places to start they already had. **56 pages in, from none**,
by three distinct phrases.

| | before | after |
| --- | --- | --- |
| pages linking `/hardware/` inside `<main>` | 0 | 56 |
| model pages that count machines and say where they are priced | 0 | 54 |
| distinct anchor phrases for it | 0 | 3 |
| generic anchors anywhere on the site | 0 | 0 |

**One thing changed by reading it rendered rather than as HTML.** The first wording was *Every machine
here is priced in one table*, which lands directly after *All 56 machines on this site run it at 32k*
— two scopes in two sentences, and `familyReachNote` already carries a comment about not saying
*here* twice running. It claims no scope of its own now: *One table sets every machine against the
others: price, the memory its GPU can use, what it holds and how long it takes to pay for itself.*
The second wording also drops a claim the first one made and the data does not support — two of the
56 machines have no price yet, so *every machine is priced* was not true.

**Five breaks proved the guard.** `checkMachineIndex()` holds three claims. Drop the link from the
sentence and 54 pages fail with *counts the machines that hold it and links the index 0 times rather
than once*. Put one in a note the rule does not cover and it fails naming that page — it caught
`/hardware/` linking itself. Take it off `/leaderboard/` and that page fails by name. Link it twice on
a model page and the count fails. And reword the sentence on the page while keeping the link, which is
the drift a link-only check would miss, and it fails with *does not say where they are all priced*.

**And three breaks proved the tests.** A bare *here* as the anchor, one branch of the note forgetting
the sentence, and the sentence said twice each fail one of the three new tests in
`tests/pagekit.test.ts`. 370 tests where there were 367.

**One existing guard had to be taught to read past it.** `checkFamilyReach()` matched the reach
paragraph with `[^<]*`, which a sentence containing an `<a>` ends. It takes the paragraph whole now and
strips the known sentence off the end before parsing the counting in front of it, so the two guards
hold one claim each rather than one holding half of both.

**Verified on `main`, not assumed.** 370 tests, typecheck clean, the full `npm run build` including
`build:functions`, 261 pages with every guard passing, the paragraphs read rendered out of `public/`,
and the date ledger checked entry by entry: 56 fingerprints moved and they are exactly the 54 model
pages plus `/leaderboard/` and `/compare/`, no entry lost a date, 262 entries in and out. Pushed as
`76246da`; **deploy run 210 went green at 06:54**, so it is live.

**It broke PR #16 and PR #16 is fixed.** The push added `machineIndexLine` to the same import line
that branch had already extended, which is the third time this log has recorded git offering one line
where two additions belong. Both kept by hand, pushed to `seo/cost-per-month` as `2c7e5e2`, verified
on the merged tree — 380 tests, typecheck clean, the full build, 262 pages, every guard passing, both
features working together — and `git merge-tree` against `main` now reports no conflict. Nothing about
the page changed. **Check for this whenever a run pushes code to `main` while a pull request is open;
the import list is where it always lands.**

**What to continue.** The backlog's next open item is the two Q8 model pages, which the same
measurement turned up on 2 inbound pages each and which is a question for Ryan rather than a page to
write. After that the open items are Ryan's or waiting on data. A run with nothing better should
measure something the way this one did — the find was in the measurement, not in the item.

### 2026-09-19 — what a month of it costs, which is the question nobody here had answered

**Why this item.** `npm run model-watch` prints 2026-09-19, so the watch was done and the backlog was
the job. Its top item is the question pages, and the last entry said what to take: the monthly-cost
page, unblocked by PR #8's merge. Opened as **[PR #16](https://github.com/rlindsey2/sunkcost/pull/16)**
rather than pushed, because it is a new page type and because a page at the top level of this site
has to be in `FOOTER_LINKS`, which means `index.html`.

**The question the last entry said to settle first, settled.** A monthly bill is the token page's
arithmetic divided by twelve, so a second page saying that in other words would be the duplicate this
backlog exists to avoid. It is not that, because the two pages answer opposite halves. The token page
counts break-even in tokens and argues that the date does not matter; this one is nothing but the
calendar. And the figure that makes it a page rather than a paragraph is the one the token page has no
room for: **a machine bought once has no monthly cost until you name the months**, so every monthly
figure on it is a division said out loud, at one, two and three years.

**What the data answered, which is the page.** The electricity is $0.26 a month at 500k tokens a day
on the machine the calculator opens on, and across the 30 current machines that hold the model it runs
between $0.25 and $0.65 — a spread of 40 cents. Divide those machines' prices over two years and the
same month runs from $53.45 to $750. So the page's own heading is *the power is not the cost, the
machine is*, and the sentence under the table is the proof rather than the assertion: the RTX PRO 6000
Blackwell draws 600 W and spends $0.35 a month where the Mac mini M6 draws 65 W and spends $0.43,
because a faster machine is finished sooner. The line a reader wants is `monthlyCrossing()`: the rental
bill passes what the machine costs a month at **10.9M tokens a day** over two years, 21.8M over one and
7.27M over three.

**Subscriptions, without inventing a price.** The calculator has taken a monthly bill since `sub` was
added and no generated page had ever used it. The page names no subscription and prices none — nothing
in `data/*.json` carries one — it gives the figure a reader sets their own bill against, and says the
two things the calculator's own small print says: the bill buys the lab's model, and the falling-price
assumption is off in that mode.

| | figure |
| --- | --- |
| electricity, 500k tokens a day | $0.26 a month |
| the same month, rented | $6.94 |
| the machine, over one / two / three years | $292 / $146 / $97.46 a month |
| where the rental bill passes two years of the machine | 10.9M tokens a day |
| electricity across the 30 machines that run the model | $0.25 to $0.65 |
| those machines over two years | $53.45 to $750 |

**Five breaks proved the guard.** `checkMonthlyCost()` recomputes the lot rather than reading the page
back: both sides of the month at every level of use, the price over every span, the crossing, and the
spread across the machines. The crossing sentence dropped fails with *does not print 10.9M tokens a day,
where the rental bill passes what the machine costs a month*; the rented column dropped fails on all
five levels; the dearest machine dropped fails with *leaves out the NVIDIA RTX PRO 6000 Blackwell, 96GB*;
the stand-in power marker dropped fails; and the three-year column dropped fails with *does not print
$36.51, what the Mac mini M6, 32GB costs a month over 36 months*. **That last one is worth keeping.**
The first version of the guard passed it — it held the three spans for the headline machine only, which
the answer box prints, so the table could have lost a whole column silently. It holds all 30 machines
over all three spans now. A guard written from the page's prose misses what the page's tables carry.

**And three breaks proved the tests.** The month read as a day, `monthlyOwned` forgetting the power, and
the crossing bisection run the wrong way each fail one of the six new tests in `tests/pagekit.test.ts`.

**One thing changed by reading it rendered rather than as HTML.** At 390px the machine table stacks, and
`stack({ fig: 4 })` put the two-year figure unlabelled on the first line beside three labelled spans, so
a phone showed `$53.45` with no way to know which span it was. The price takes that place now: it reads
as a price beside a machine name, and every monthly figure keeps its span. Desktop is unchanged.

**Verified.** 377 tests (10 new), typecheck clean, `npm run validate` clean but for the two null prices
already on this file, and the full `npm run build` end to end with `build:functions`: 262 pages, every
guard passing, 257 OG cards drawn, 1,894 share pages. The page reads 1,218 words, title 47 characters,
description 152, and it is in the sitemap. Read rendered in Chromium at 1280px and 390px, and the share
card read as a PNG — the card's note was shortened after the width guard in `tests/list-card.test.ts`
caught it ending in an ellipsis.

**Continue next: the anchor-text audit**, which is the top open item now and has never been done —
7,336 links inside `<main>` across the pages and nobody has measured the words they are written in. The
item says to measure before writing anything, and that stands: this site's links are in sentences, so
the answer may be that they are already fine.


### 2026-09-19 — PR #8 merged, and nothing is open behind it

Not an hourly run: the session that opened PR #8 at 02:05 on 2026-09-18 was woken by the merge
event and checked the result. The whole of it is in the Ryan's-side item above; what follows is
what a later run needs and would otherwise have to re-derive.

**`/local-llm-vs-api-cost/` is live and intact.** Merged `main` was verified here rather than
assumed: 367 tests, typecheck clean, 261 pages with every guard passing, and the full
`npm run build`. `checkTokenCost()` reports the same figures on the merged tree that it reported
the day the page was written, 27 models and 7.97B tokens at all five levels of use, so the day of
other work between the two did not move anything the page claims. The page was written against 249
pages and a five-link footer; it now sits in a site of 261 with seven, and not a line of it needed
changing, because every figure on it is recomputed from the data at build time.

**Two things the log can now stop carrying.** The build-output fault is settled: the earlier item
warned that merging this PR would leave `public/local-llm-vs-api-cost/index.html` tracked on `main`,
since an ignore rule does not untrack a tracked file. Both sides were untracked before the merge, and
`git ls-files` on merged `main` lists nothing under it or under `public/best-gpu/`. And **no pull
request is open** — the first time that has been true since PR #1 was opened on 2026-09-16. Several
entries below say the monthly-cost page waits on PR #8 or on PR #15; both have merged, so it waits
on nothing, and the next run should take it rather than re-check whether it is blocked.

**One caution for whoever picks that up.** A second session was pushing to `main` while this check
ran: deploy 203 was already building `0b58a27`, another session's record of PR #13, before this
entry was written. That commit touches only `seo/LOG.md`, so the tree this run tested is the tree
that is deployed. The standing instruction in the item at the top of this file applies and was
followed here: fetch, verify the other side's work, rebase rather than force.

**Continue next: the monthly-cost page**, *how much does it cost to run a local LLM per month*,
which is the top open backlog item and is now unblocked. `calc.ts` already computes
`cloudCostPerMonth` and `localCostPerMonth`, and `/local-llm-vs-api-cost/` has the helpers a
monthly page would sit on: `tokenCost()`, `tokenCosts()` and `costMachine()` in `src/pagekit.ts`.
The question to settle before writing a line is what it says that the token-cost page does not,
because a monthly bill is the same arithmetic divided by twelve, and a second page saying that in
other words is the duplicate this site should not create. The honest candidate is the thing the
token page deliberately left out: a monthly figure a reader can compare against a subscription,
which the calculator already takes as `state.sub` and no generated page does.


### 2026-09-19 — the page that answers "which graphics card" was the least linked page on the site

**Why this item.** `npm run model-watch` prints 2026-09-19, so the watch is done and the backlog was
the job. Its top item is still the monthly-cost page and still waits on PR #15, so the work had to go
straight to `main`, and the last entry said what to measure: repeat the inbound-link count on the
other page types. The finding was not in the page types it named. Counting links inside `<main>` over
all 259 pages, so the footer every page shares does not flatter anything: `/leaderboard/` has 200
pages pointing at it, `/compare/` 199, `/best/` 146, `/how-much-memory/` 113 — and **`/best-gpu/` had
eight**, `/best/` and the seven cards' own pages. It is in the footer, so nothing was orphaned. What
was missing is the link at the moment the question comes up, on the page that carries the most
commercial search this site takes. Pushed as **`471fc47`**.

**The rule is the caveat the site already says.** Wherever a page prices a graphics card in a table
of machines, it says the price leaves out the PC around it. That sentence now ends with where the
cards are ranked: *All seven cards here are ranked by what each one holds.* It is one sentence in
`cardScopeNote()`, so a page cannot say the caveat without it, and the count comes from
`graphicsCards()` — the same list `/best-gpu/` itself cuts — so the number cannot drift from what
the reader finds at the other end. A card's own page is the exception and says it in its opening
paragraph instead, which is why nothing on the site links the ranking twice.

| | before | after |
| --- | --- | --- |
| pages linking `/best-gpu/` in their body | 8 | 90 |
| machine head-to-heads that price a card | 0 of 33 | 33 |
| machine pages that price a card | 7 of 54 | 54 |
| indexes whose assumptions price a card | 1 of 3 | 3 |

**What it deliberately leaves alone, so the next run does not read it as a gap.** Two page types
print a card price and get no link. **The 55 model pages** put a card in their machines table with
`, card only` beside the figure, which is a marker on a row rather than the caveat, and the page's
subject is the model. **Eleven model head-to-heads** do say the caveat, in their lede, because the
cheapest machine that runs one of the two models is a bare card — but that lede is already five
sentences of figures about two models, and a sentence about seven graphics cards in the middle of it
answers a question that page does not ask. Both would be link plumbing rather than an answer, and
the guard is written from the pairing rules rather than from a search for the words, so neither can
drift into the set by accident.

**Five breaks proved the guard.** `checkCardRanking()` does not read the note builders' output back
as text: it recomputes, for every machine pair and every machine page, whether that page prices a
card, and holds the link to that. The ranking sentence dropped from the caveat fails with *prices a
graphics card and links the ranking 0 times rather than once* and *does not say where the cards are
ranked*; the exception dropped, so a card's own page gets it in both places, fails with *links the
ranking 2 times rather than once* and *repeats in its notes what its first paragraph says*; the
sentence said where no card is priced fails with *sends the reader to the card ranking where it
prices no card*; `/compare/` losing its copy fails with *links the ranking 0
times rather than once*; and `/best-gpu/` pointed at itself fails with *links itself 1 times in its
own body*. Exit code 1 in each case.

**And three breaks proved the tests.** The five new ones in `tests/pagekit.test.ts` hold the sentence
itself: the count printed as a digit rather than a word fails the first, the ranking put before the
caveat rather than after fails the second, and the ranking said where the page prices no card fails
the fourth.

**Verified.** 347 tests (5 new), `tsc --noEmit` clean, and the full `npm run build` end to end with
`build:functions` included: 259 pages, every guard passing, 1,894 share cards. The pages that moved
were counted against the date ledger rather than assumed: **82**, and exactly the 82 the rule names —
47 machine pages, 33 machine head-to-heads, `/compare/` and `/how-much-memory/`. No model page, no
model head-to-head and no card's own page changed a word. All 82 note paragraphs were read out of the
built HTML and swept for doubled stops, stray commas, double spaces, a digit where the word belongs
and maintainer words: none. Five were read rendered, one of each shape the sentence follows. Deploy
run 200 went green at 04:51 on `471fc47`, so all 82 are live.

**The push was rejected, and the standing note about sibling sessions is not the reason.** This log
says a run whose push is refused should assume another session, fetch and verify rather than force.
This one was neither a sibling nor a race. The checkout this job starts from arrives with **`HEAD`
detached** at whatever `origin/main` was, and a local `main` branch left behind at `94aa957`, the
seed commit from 2026-09-16, 122 commits back. So `git push -u origin main` pushes that stale
branch rather than the commit that was just made, and git says *a pushed branch tip is behind its
remote counterpart*, which reads exactly like losing a race to another session. `git branch -vv`
settles it in one line and `git push origin HEAD:main` is the push. Worth the five minutes it costs
the next run that reads the rejection as a collision.

**This push broke PR #15's merge, and repaired it**, since it was this push that broke it. Two
conflicts, both in files this change touches and both the import-list union this log has come to
expect: `scripts/build-pages.ts` wants the branch's `costMachine`, `fmtPerMtok`, `MTOK`,
`tokenCost` and `tokenCosts` and this side's `cardRankingLine`, and `tests/pagekit.test.ts` the same
with `numberWord`. Each side's names were kept. Nothing this time hit the interleave the last two
repairs did, because neither change appends to the end of a file. Verified on the merged tree rather
than on a clean `git merge-tree`: 367 tests, typecheck clean, 261 pages with every guard passing —
this run's among them, saying 90 — and the full `npm run build` with `build:functions`. Pushed to
`seo/combined-pages` at **`f298ef5`**.

**One thing on that branch is not the merge's to fix, and whoever merges it should know.** PR #15's
`/hardware/` index prices all 56 machines and closes with *Graphics cards are priced as the card
alone*, and it does not link the ranking — so merging the branch lands the one page on the site
outside the rule this run wrote. `checkCardRanking()` cannot catch it, because `/hardware/` does not
exist on `main` for the guard to name. One `${cardRankingLine(data)}` in that page's note settles
it. It was left alone deliberately: a merge repair puts a branch back the way its author wrote it,
and adding a sentence to someone else's page is not that.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is the top open item and still waits on PR #15. Of what goes straight to `main`, the measurement
worth taking next is the one nobody here has taken: **the words the internal links are made of**.
There are 7,336 of them inside `<main>` and no run has looked at whether the anchor text says what is
at the other end in the words a searcher would type, or whether a page is reached over and over by
its own name where the question would do better.

### 2026-09-19 — a head-to-head that names the other head-to-heads its two sides are in

**Why this item.** `npm run model-watch` prints 2026-09-19, so the watch is done and the backlog was
the job. Its top item is still the monthly-cost page and still waits on PR #15, so the work had to be
something that goes straight to `main`. What the 259 pages were measured for this time is inbound
internal links, and the answer is one shape: **the 143 head-to-heads are the deepest pages on the
site**, median 3 links in, and those three are always the same three — `/compare/`, and the two pages
of the things being compared. Machine pages and model pages have carried the match-ups they are in
for weeks. The match-up itself named no third machine and no third model, so **no comparison on this
site linked another one**, and the reader who had just finished choosing between two boxes, the
likeliest person here to be weighing a third, was sent back to an index of 90 to find it. Pushed as
**`be3484e`**.

**What each page says now.** At the foot of the content, before the assumptions, each side's other
match-ups, in the words that side's own page uses for the same list. The machine side is grouped by
the question each pair answers, the same grouping `headToHeadGroups()` already cuts: *The Mac Studio
M5 Max, 128GB is also head to head with another computer: … With a graphics card: … With the same
machine at another memory size: 48GB. With the machine it replaced: Mac Studio M4 Max, 128GB.* The
model side is at most three pairs, so all of them fit, and each arrives with the rule that made it:
*Qwen3.8 27B is also head to head with Inkling Small below it on the leaderboard and Qwen3 32B, the
last-generation Qwen nearest it in size.* The pair the reader is already on is left out of both
lists, which is the whole of the exclusion rule.

| | before | after |
| --- | --- | --- |
| inbound links to a head-to-head, median | 3 | 7 |
| head-to-heads with only the three every one has | 143 | 1 |
| links between one head-to-head and another | 0 | 1,090 |
| head-to-heads that name their neighbours | 0 | 142 of 143 |

**The one that names none** is `/compare/macbook-pro-m5-14-inch-16gb-vs-macbook-pro-m5-14-inch-32gb/`,
and it is right: both sides are in that one pair and nothing else, so there is nothing to name. The
build counts it rather than passing over it.

**A paragraph per machine, and that was the find in reading it rendered.** Written as one paragraph
the note is unreadable on exactly the pages that need it most: two graphics cards have been set
against the same five cards and the same six computers, so the two lists are the same eleven names
twice over, against different pages, run together in one block of 766 characters. Split in two, each
list reads as what it is — these are the R9700's, these are the RTX PRO 6000's. The model note stays
one paragraph, because two sentences of one clause each is not a wall.

**No cap, deliberately.** The worst page carries 22 links, which is the two lists a machine page
already ships side by side, and a cap would have to choose which match-ups to drop by a rule nothing
on the page could justify. Keeping every one is also what makes the guard exact: the set of links is
the set of pairs, so any drift fails the build rather than reading as a design choice.

**Five breaks proved the guard.** `checkMatchUpSiblings()` does not call the builders: it reads the
notes back off the shipped pages and cuts both lists again from `hardwarePairs()`, `modelPairs()` and
`modelGenerationPairs()`. The machine note dropped fails with *is beside 18 other match-ups and names
none of them*; the exclusion dropped fails with *links itself in its own other match-ups*; a memory
tier labelled by name rather than by size fails with *calls /compare/mac-mini-m6-16gb-vs-mac-mini-m6-32gb/
"the 32GB one" where that pair is "32GB"*; the generation clause flipped fails with *does not say why
one of its other match-ups exists*; and the model note dropped fails the same way the machine one
does. Exit code 1 in each case.

**And three breaks proved the tests.** The eight new ones in `tests/pagekit.test.ts` hold the two
sentence builders: the closing stop dropped fails two of them, the leaderboard named twice where a
model has a rung either side fails the one written for it, and the ordering dropped fails that one
and the generation-last one together.

**Verified.** 342 tests (8 new), `tsc --noEmit` clean, and the full `npm run build` end to end with
`build:functions` included: 259 pages, every guard passing, 1,894 share cards. All 212 note
paragraphs were read out of the built HTML rather than from the source and swept for doubled stops,
stray commas, double spaces and maintainer words: none. Two pages were read whole, a memory-tier pair
and a model pair. The 143 comparisons take 2026-09-19 in the sitemap; no other page's words changed.

**This push broke PR #15's merge, and repaired it**, since it was this push that broke it. Three
conflicts, in the three files this change touches. Two are import lists and both sides' names are
kept. The third is the interleave this log has been predicting since the pull request was built, one
file further along: both sides append to the end of `src/pagekit.ts`, so git ran the two blocks
together and left the **closing brace of the branch's last function as common context after the
marker** — take either side whole and the file still compiles nowhere near what either wrote. Each
block was taken whole and the brace put back. Verified on the merged tree rather than on a clean
`git merge-tree`: 362 tests, typecheck clean, 261 pages with every guard passing, both sides' new
guards among them, and the full `npm run build`. Pushed to `seo/combined-pages` at `1dcaf6b`.

**One thing about the deploys, so the next run does not read it as a fault of its own.** Run 197
carried both commits of this change and went green at 04:01, so the pages are live. Run 198, on the
log-only commit after it, sat on its build step for half an hour where 197 did the same build in
under three minutes: `npm ci` and `npm test` green, then nothing. The tree it builds differs from
197's by `seo/LOG.md` alone, which no script here reads, so it is the runner rather than the
repository. This entry's own push cancels it and starts a fresh one, which is how the queue here
usually clears.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is the top open item and still waits on PR #15. Of what can go straight to `main`, the measurement
that found this one is worth repeating on the other page types: the leaderboard, `/best/` and
`/best-gpu/` are each linked from every page, but the model and machine pages sit at 43 and 21 inbound
links against the comparisons' 7, and nothing has checked whether the pages linking them are the ones
a reader would come from.

### 2026-09-19 — a model against the current one of its family, which the leaderboard can never pair

**Why this item.** `npm run model-watch` prints 2026-09-19, so the watch is done and the backlog
was the job. Its top item is still the monthly-cost page and still waits on the pages in PR #15.
What was left was to find work that goes straight to `main`, so the 253 pages were measured for a
gap rather than a fault — and the gap is in the pairing, not the prose: **every one of the 47 model
head-to-heads was cut by one rule**, each model against the next one down the leaderboard. That
answers "which of these two should I run". It cannot answer the other question people type, which
is whether the current model of a family is worth moving to from the one they already run, because
**the two sides of that question are never neighbours on the index**: a year of work separates them
on it. Pushed as **`d9d8068`**.

**The rule, and the two conditions that keep a page honest.** Each last-generation model against
the current model of its own family nearest it in size, older side first — the mirror of the
machine side's generation pairs, written in `modelGenerationPairs()` beside them. Both sides have
to be **the same shape**, dense against dense or mixture of experts against mixture of experts,
because a 3B-active MoE and a dense 30B are the same size on disk and nothing else alike. And
neither may be **more than half again the size of the other**. Both conditions do real work rather
than decorate the rule: without the shape test the current Qwen nearest Qwen3 32B in size is a
mixture of experts, so the pages would name the wrong model; without the size cap DeepSeek's two
distils would be set against a current model four times their size, which is not a swap anybody
makes.

| | before | after |
| --- | --- | --- |
| model head-to-heads | 47 | 53 |
| rules that cut them | 1 | 2 |
| generated pages | 253 | 259 |
| last-generation models with a page against the current one | 0 | 7 |

Seven pairs, six of them new pages: Gemma 3 12B against Gemma 4 12B, Gemma 3 27B against Gemma 4
31B, Qwen3 8B against Qwen3.5 9B, Qwen3 32B against Qwen3.8 27B, Qwen3 235B-A22B against Qwen3.8
Flash Next, and Mistral Small 3.2 24B against Devstral Small 2 24B. The seventh, Qwen3 30B-A3B
against Qwen3-Coder 30B-A3B, is already a rung of the ladder and keeps the address it has always
had; the ladder is cut first for exactly that reason.

**What the pages say that the ladder pages do not need to.** On a generation pair the reader
already runs one of the two, so the page owes them what swapping it changes: what it scores, what
it asks of the machine, and whether that changes which machines run it. The memory sentence is the
one worth having, because the answer is not the one the sizes suggest — **on four of the seven the
newer model asks *less* of the machine than the one it follows**, and on three of those four it is
larger on disk. Qwen3.5 9B is 5.7 GB of weights against Qwen3 8B's 5.0 and needs 6.8 GB at 32k
against 9.9, because the cache is 1.1 GB against 4.8. So the section prints the weights and the
cache separately rather than explaining the difference. Gemma 4 31B it is the page that goes the
other way — 26 GB against 20 — and it says so, and says that it costs three machines: 27 of the 37
run it where 30 run Gemma 3 27B it, and the cheapest is a graphics card at $1,299, card only,
rather than a $1,269 box.

**Every claim has a branch for each way the data can fall**, because the opposite claim is as easy
to write: the newer model scoring the same (Qwen3-Coder, 10 against 10), or lower; asking more
memory, less, or exactly the same; running on more machines, fewer, or the same ones. Where two
sides are the same size to a decimal place the sentence says *of the same size, 24B* rather than
*24B against 24B*, which reads as a mistake rather than as the point.

**Ten breaks proved ten claims, one each**, and each fired only the test written for it: the shape
qualifier dropped from the opening sentence, the same-size phrasing dropped, two equal scores
called a gain, the memory direction flipped, one sentence used for all three machine-list cases,
the context paragraph printed where both ceilings match, a space before a full stop, and — on the
rule itself — the shape test dropped, the size cap dropped, and the pair written newer side first.

**And five breaks proved the guard.** `checkModelGenerations()` does not call the function that
wrote the section: it reads the section back off the shipped page and recomputes every figure in it
from the data. The section dropped fails the build naming all seven pages; the section printed on
every model pair fails naming the ones that are not generation pairs; the memory sentence flipped
fails with *says "It asks more of the machine" where the data has 121 GB against 148 GB*; the model
pages' own line dropped fails the older guard, `checkHeadToHeads()`, at 14 missing links; and the
two sides of that line swapped fails with *does not name it as the current Qwen nearest it in size*.
Exit code 1 in each case.

**Verified.** 334 tests (8 new), `tsc --noEmit` clean, and the full `npm run build` end to end with
`build:functions` included: 259 pages, every guard passing, 1,894 share cards and the six new
head-to-head cards drawn. All seven sections read rendered out of the built HTML rather than from
the source, swept for maintainer words and stray punctuation, and the one card checked as a picture.
The six new pages and the 14 pages that gained a line take 2026-09-19 in the sitemap.

**Two sessions ran this hour, and this one found out by having its push rejected.** The other
(`session_01QaYRnLfAA7VQFTW6Bm3kE5`) had combined PRs #8, #10 and #13 into **PR #15** and written
the entry below. Nothing was forced: this run fetched, read both commits, rebased onto them and
re-ran the tests before pushing. **This push then broke PR #15's merge**, in the three files it was
always going to be — `scripts/build-pages.ts`, `tests/pagekit.test.ts` and `seo/page-dates.json` —
so this run repaired it rather than leaving it, since it is the push that broke it. The repair is
the union the entry below describes, and it hit the same interleave that entry warns about: git ran
the two appended `describe` blocks in `tests/pagekit.test.ts` into one, so both were taken whole
from their own side instead of resolving the marked hunk.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is the top open item and now waits on one pull request rather than three. Of what can go straight to
`main`, the model side's pairing now has two rules where the machine side has six, and the run entry
above the backlog notes which legacy models the new rule deliberately leaves alone and why.

### 2026-09-19 — three pull requests become one, merged against today's main

**Why this run.** Ryan asked, at 02:00, after the ping about the queue: PRs #8, #10 and #13 all
conflicted with `main` and with each other, so combine them into one pull request. Opened as
**[PR #15](https://github.com/rlindsey2/sunkcost/pull/15)**, branch `seo/combined-pages`, built
from `main` at `0c970b4`. No new work: the three branches, merged, resolved and verified.

**Ten conflicts across eight files, and eight of them were the union this log has predicted since
PR #7.** Both footer links in `index.html`, both cards in `build-og.ts`, both describe blocks in the
two test files, main's ledger in `page-dates.json` and then rewritten by the build.

**The other two are the find, and they break the union rule.** In `scripts/build-pages.ts` and
`src/list-card.ts` the two page branches add their builder in *the same place*, so git did not give
two blocks to choose between: it **interleaved them into one function** — `hardwareIndexCard()`'s
opening, `tokenCostCard()`'s body, one shared `return`, with the first function's tail swallowed as
common context. A union of the marked hunks compiles to nothing sensible and **silently drops the
tail of the first function**, which is what happened on the first attempt: `tsc` caught it at 21
errors in `src/list-card.ts`. Reapplying the branch's own diff with `git apply -3` gave cleaner
blocks and the same fault one level down, because the closing `});` of each block is common text.
What worked is not a resolution at all: **take each side's function whole from its own branch and
splice both in**, then hand-merge the import lists. `hardwareIndex()`, `tokenCostPage()`,
`hardwareIndexCard()` and `tokenCostCard()` are each byte-for-byte their branch's version.

**`src/pagekit.ts` merged without a conflict**, which was the one to expect trouble from: PR #13
moves eight functions out of it into `src/format.ts`, and both other branches and this morning's
`familyReach()` all add to it. The re-export block at the top of pagekit is why — nothing that
imported those eight had to change, so the three sets of additions never met.

| | |
| --- | --- |
| tests | 346, all passing (315 on main + 31 from the three branches) |
| pages built | 255, every guard passing |
| typecheck | clean |
| full `npm run build` | end to end, `build:functions` included |

**Read rather than assumed.** Both new pages read rendered out of `dist/` — `/hardware/` at 490
words, `/local-llm-vs-api-cost/` at 995. And the calculator itself was rendered in **Chromium
against the built bundle** (`--headless --dump-dom` over a local server on `dist/`, no Playwright in
this environment), because PR #13 is the calculator's own head and nothing in the test suite renders
it: the power label reads *stand-in*, `hw.notes` is split by subject across four rows, the Memory
bandwidth row is there with its source, and both new footer links are present.

**Two faults that reading it turned up, both left out on purpose.** The `TODO:` under Electricity,
which is `data/defaults.json` and already on Ryan's side of this file; and a **doubled full stop at
the end of the Memory fit line**, which is new — `endStop()` exists for it and the generated pages
already use it. Both are one line, both are in files this agent does not push to, and folding either
into #15 would make it something other than the three pull requests combined. The second is a new
backlog item.

**Ryan merged #12 and #14 while this was being built**, at 12:18 and 12:19, and a sibling session
logged that at 02:23. So `main` moved under the branch: `main` was merged into it afterwards —
clean, since #12 is `src/styles.css` and #14 is `src/waterline.ts` and neither goes near what this
branch touches — and re-verified there, 346 tests and the full build. **#15 is now the only open
pull request**, and the three it replaces are open only because closing them is Ryan's click.

**What to continue.** Once #15 merges, the monthly-cost page — *how much does it cost to run a local
LLM per month* — is unblocked and is the top backlog item; it sits on the helpers #8 brings in. That
is the first thing the next run should check for.

### 2026-09-19 — a model page says which machines run it, not just the cheapest in each family

**Why this item.** `npm run model-watch` prints 2026-09-19 as last checked, which is today, so the
watch is done and the backlog was the job. Its top item is still the monthly-cost page and that
still waits on PR #8, which is one of **five pull requests open with nothing merged since PR #11**
— #8, #10, #12, #13 and #14, unchanged since last night. The item under it was the one the last
entry named as the next thing measurable: the mirror, on model pages, of the fault the machine
pages had fixed. Pushed as **`e698ade`**.

**The fault, measured before it was fixed.** A model page's table is `cheapestPerFamily()`: one
machine per family, cheapest first. That answers "what should I buy" and leaves "does mine run it"
to a reader who owns the 64GB one of something.

| | before | after |
| --- | --- | --- |
| model pages naming fewer machines than run the model | 54 of 55 | 0 |
| machine-and-model pairs the page's table has no row for | 1,667 | 0 |
| machines a page's words account for | the 8 in the table | all 56 |
| median words, model pages | 601 | 664 |

**Naming them is not the fix it was on the machine pages, and the backlog item was right to say
so.** A machine runs at most 39 models, so naming them all is a sentence. A small model runs on
**all 56 machines**, and 56 names is a list nobody reads — 13 models are in exactly that case.

**What made it one sentence instead is a measurement, and it is the find here.** Fit on this site
is the weights plus the key-value cache against the memory the GPU can address, so inside a family
nothing but memory decides; what differs between families is the share of memory the GPU gets,
about two-thirds on a Mac against nearly all of it on a card. That is a rule only if the data has
no exception to it, so it was checked rather than assumed: **339 family-and-model groups across all
56 machines, and in every one the set that holds the model is exactly the set at or above one
memory size**, as the machine's own name gives it. Nothing needs a name it does not already have.

So the pages say the rule. *"The table is the cheapest machine in each family, not the only one
that runs it: 44 of the 56 machines on this site hold it at 32k. Within a family only memory
decides, so that is every Mac Studio and Strix Halo box at any size, every NVIDIA card with 24GB or
more, every Mac mini and MacBook Pro with 32GB or more, the Radeon AI PRO R9700, 32GB and the DGX
Spark, 128GB."* Where every machine runs it, the whole thing is one line: *"All 56 machines on this
site run it at 32k, not just the eight in the table."* 17 words to 79, twelve distinct sentences
across the 54 pages.

**Three things the wording had to get right.** A family of one has no range to draw a line through,
so it goes in by its own name rather than as *every DGX Spark*. Two families that draw the line in
the same place share a clause, so five families read as three phrases. And the first draft said
*every Mac Studio here*, one line under a sentence that says *every machine here* of the table's
own rows — two different heres in a row, so it is *at any size* now, which says the thing the other
clauses say in their words.

**It covers the machines the table cannot.** The count is over all 56 machine pages, not the 37
priced current ones a table is drawn from, so the reader who owns a discontinued Mac Studio or is
looking at an unpriced one is answered too. It cannot contradict the two sections below it —
`machinesShorter()` and `missedMachines()` both name machines that *miss* the model at 32k, and
this names the ones that hold it.

**Nine breaks proved nine claims, one each**, and every one fired the test written for it: the
count taken from the table's rows rather than every machine, the floor read off the current
machines only, the short line dropped where all 56 run it, a size printed on a family that needs
none, a clause each where two families draw the same line, a family of one written as a range, a
family that holds it nowhere kept in, families of one dropped from the reach, and a family named as
the data writes it rather than as a sentence would.

**And four breaks proved the guard.** `checkFamilyReach()` does not call the function that wrote
the sentence: it reads the paragraph back off the shipped page, turns each clause into the set of
machines it names, and compares that with the set the data says holds the model. A family dropped
from the sentence fails the build naming `/models/llama-3.1-8b-q8/` and the seven MacBook Pros it
left out; every floor doubled fails naming eleven; every floor halved fails the other way, *claims
4 machines that do not hold it*, naming them; and the sentence not printed at all fails with
*lists 8 machines and does not say which of the other 48 run it*. Exit code 1 in each case, so CI
cannot ship it.

**Verified.** 324 tests (9 new), `tsc --noEmit` clean, and the full `npm run build` end to end with
`build:functions` included — 253 pages, every guard passing, 1,999 machine-and-model pairs covered
by a rule the data agrees with. All 54 sentences read out of `dist/` rather than `public/`, swept
for maintainer words, doubled stops and stray punctuation, and the longest and shortest read in
full. **Deploy run 187 went green at 01:56 and published**, on `0c970b4`, which carries both
commits — run 186, on the code commit alone, was cancelled by the log push a minute later, as
usual. CI ran the same 324 tests and the same full build, so `checkFamilyReach()` passed there
as well as here. The 54 model pages take 2026-09-19 in the published sitemap, because the
ledger went out in the commit that changed them.

**One thing to know about this environment, because it cost a few minutes.** The session started on
a **detached HEAD** at `origin/main`, and the local `main` branch is an old unrelated history
(`94aa957`, the log's seed commit) that `git merge --ff-only` refuses and `git checkout main`
silently reverts the working tree to. The way onto main is `git checkout -B main <your commit>`
after committing, not `git checkout main`. Nothing was lost; worth knowing before the next run
commits.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month*
— is still the biggest open item and still waits on PR #8. Five pull requests are open and nothing
has merged since PR #11 on 2026-09-18: **#8** and **#10** unblock page work, **#12**, **#13** and
**#14** are the calculator's own head. Of what can go straight to main, the honest answer is that
the two link-graph faults are now both fixed and neither side has another. The nearest open
questions are the `/hardware/` and `/leaderboard/` cross-link and the model page's duplicate call
to action, and both are a question to settle before they are a change — the second is now slightly
riper, because the call to action sits two lines under the sentence this run added and the page has
one more thing competing for the same spot.

### 2026-09-19 — a machine page names every model it runs, not the twelve it has room for

**Why this item.** `npm run model-watch` was due, so the watch came first and is written up below.
After it, the backlog: the monthly-cost page is still the top open item and still waits on PR #8,
which is one of **five pull requests open with nothing merged since PR #11**, so page work is
blocked the way the last three entries found it. What was left was to look for a fault rather than
a feature, so the 253 built pages were measured — titles, descriptions, word counts, and the
internal link graph. Titles and descriptions are clean: no duplicate title, no duplicate
description, none over 160 characters, no page under 498 words, no orphan. The link graph is where
the hole was. Pushed as **`7815928`**.

**The fault, measured before it was fixed.** A machine page's table of what it runs stops at twelve,
ordered by index class, and what sat below the cut was a count: *26 more fit; the calculator lists
them all.* So on the largest machines the page that answers "what does this run?" named 18 of the
38 models it runs and sent the reader to the calculator for the rest.

| | before | after |
| --- | --- | --- |
| machine pages naming fewer models than they run | 44 of 56 | 0 |
| machine-and-model pairs with no link between them | 530 | 0 |
| pairs the build guard held to the rule | 235 | 1,425 |
| links in the note under the table | 217 | 764 |

**What the note says now.** Every model below the cut, each one a link to its own page, in the order
the table would have put them, and the models the intelligence index has not scored kept in their
own sentence, because a ranking by class cannot place them. 50 pages carry it, from 30 words on the
RTX 4080, where one model is below the cut, to 104 on the Mac Studio M5 Ultra, 512GB, where 27 are.
The wording was moved out of `scripts/build-pages.ts` into `runsOnNote()` in `src/pagekit.ts` so a
test can hold it rather than only the build.

**The guard was already written to the rule this fixes.** `checkHiddenModels()` says in its own
comment: *if a model fits a machine, that machine's page links it, whether it made the table or
not.* It enforced that for the unscored models only, which was the case the run that wrote it was
fixing. It holds every model that fits now, so the next model added to `data/models.json` cannot
land below a cut and go unnamed.

**Seven breaks proved seven claims, one each.** The unscored tail dropped, the count taken from the
ranked ones alone, a caveat printed where nothing is unscored, a note printed where the table had
room for everything, one model named twice, the reason dropped where nothing can be ranked — one
test fires for each. And the guard itself: a name dropped from the list fails the build, naming the
five pages it would have shipped wrong.

**Verified.** 315 tests (7 new), `tsc --noEmit` clean, and the full `npm run build` end to end with
`build:functions` included. 253 pages, every guard passing, and the section read rendered out of
`dist/` on the widest case and the narrowest. 50 machine pages changed words today and take
2026-09-19 in the sitemap, which is the ledger working. **Deploy run 184 went green at 00:57 and
published**, on `d0f4482`, which carries both commits — run 183, on the code commit alone, was
cancelled by the log push a minute later, as usual.

**Today's model watch, which found two candidates and ruled out three.** Both candidates are in
`seo/MODEL-WATCH.md` with their sources and what each still needs, and neither is urgent enough to
ping about. **Agnes 3.0-Flash** (33B, Apache 2.0, 2026-09-11) is the interesting one: the coverage
describes 72 decoder layers where only 18 carry a key-value cache, which is the sort of thing that
changes which machines hold what at a long window — and this site's schema has no room for the
recurrent state the other 54 layers keep, which the watch file now says. **Nex-N2.5-mini** (35.1B
total, 3B active, Apache 2.0) sits almost exactly where Qwen3.6 35B-A3B sits. Ruled out and written
down so nobody checks them twice: **Tencent Hy4 preview** (770B) and **Atria Dawn Preview** (744B),
both far past the 119.5 GB the largest machine here can address, and **Sakana AI Fugu**, which is an
orchestrator over other models rather than weights anybody can download.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is still the biggest open item and still waits on PR #8. Five pull requests are open: **#8** and
**#10** unblock page work, **#12**, **#13** and **#14** are the calculator's own head. Of what can
go straight to main, the model pages are now the mirror of the fault fixed here and worth measuring
next, and it was measured before this entry was written: **1,190 pairs where the machine's page
links the model and the model's page does not link the machine back**, 16 of 55 model pages naming
every machine that runs them. It is not the same fix, because a small model runs on all 56 machines
and 56 names is a dump; the backlog item says what has to be settled first. Under it, the `/hardware/` and `/leaderboard/` cross-link and the
model page's duplicate call to action are both still a question to settle before they are a change.

### 2026-09-18 — the chart's labels line up with the card, and the axis stops labelling every hundredth year

**Why this item.** `npm run model-watch` says *done for today*, so the backlog was the job, and the
last entry's instruction was conditional: write the monthly-cost page if PR #8 has merged, and the
waterline label margin if it has not. It has not — #8, #10, #12 and #13 are all still open — so the
margin was the job. Pushed as **`60f2388`**. Measuring it turned up something larger in the same
file, which went out as **[PR #14](https://github.com/rlindsey2/sunkcost/pull/14)**, branch
`seo/waterline-ticks`.

**The margin, and the item's own count of it.** The item had one label 19px from the right edge. The
anchors say 35px, on both sides, and the left side is the bigger half:

| | before | after |
| --- | --- | --- |
| cards with a label left of the text column | 1,894 of 1,894 | 0 |
| cards with one right of it | 113 | 0 |
| worst overhang, either side | 35px | 0 |

The left-hand ones are the depth-grid figures (4,957 of them), `BREAK EVEN` (1,894), the year-one
marker (1,648) and `bought` (113); the right-hand one is `never reaches the surface`. The fix is the
one the item proposed — a margin the caller passes — and the calculator passes none, because there
the chart is the whole panel and a label at the edge is where it belongs. **Byte-identical for the
page over 11,881 renders** of its own call, across every machine × model it can plot at four widths,
which is why it went to main rather than a pull request.

**Reading the fixed card is what found the rest.** The year axis climbed a ladder that stopped at
100 years, so past a 600-year horizon it labelled every hundredth year against a wait measured in
millions. **68,747 tick labels on one card**, 66,837 and 42,012 on two more, stacked on top of each
other in the first thirty pixels of the axis; 222 of the 1,894 cards drew more than eight; the worst
card was **10,488 KB of SVG**. Every card now draws two to five and none is over 6 KB. The
calculator draws the same chart from the same code, so choosing one of those machines put all 68,747
text nodes into the live page — which is why that half is a pull request and not a push. 520 of the
2,970 charts the calculator can draw change, all of them at horizons over 600 years.

**Two more faults on the same line, both from reading the card rather than the code.** A tick had a
fixed 18px allowance either side, so `4,000 yr` ran past the column where `4 yr` fitted, on five
cards. And `surfaces at 8278467 yrs` printed ungrouped beside a verdict reading *You're underwater
for 8,278,467 years* — the same figure, set two ways, on the same card.

**Six breaks proved six claims, one each.** On main: the card no longer passing its margin, the
off-chart verdict put back to the plot edge, and the margin taken on the page as well — one test
each. On the branch: the stopping ladder restored (four tests, because stacked ticks break the
column and the grouping too), the labels ungrouped, and the fixed tick allowance back.

**Verified.** Main: 308 tests (2 new), typecheck clean, the full `npm run build` end to end with
`build:functions` included, and a card rendered to PNG and read. Branch: 310 tests (4 new),
typecheck clean, the same full build, 253 pages, and the worst card rendered and read.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is still the biggest open item and still waits on PR #8. **Five pull requests are open now** and
nothing has merged since PR #11: **#8** and **#10** unblock page work, **#12**, **#13** and **#14**
are the calculator's own head. Of the items that can go straight to main, the honest answer is the
same as last night's: there is no obvious one left. The nearest are the `/hardware/` and
`/leaderboard/` cross-link and the model page's duplicate call to action, and both are a question to
settle before they are a change — either would be a reasonable hour's work if the next run wants to
settle one rather than wait.

### 2026-09-18 — nothing the build publishes is written until the guards have passed

**Why this item.** `npm run model-watch` says *done for today*, so the backlog was the job. Its top
open item is the monthly-cost page and that still waits on PR #8, which is open along with #10, #12
and #13; the item under it was the one the last entry named as the next thing that can go straight
to main. Pushed as **`330242e`**.

**The item undersold the fault, and the difference is the whole reason to fix it.** It said a failed
build costs the next build's lastmods and then heals. It does not heal. The pages a guard refused
are regenerated correctly next time, but the ledger has already recorded the *refused* fingerprints,
so the restored pages no longer match what is written down and `nextDates()` books them as changing
**the day somebody fixed the fault**. That is a date the pages did not earn, published to a crawler,
which is precisely what `src/page-dates.ts` was written to prevent.

**Reproduced rather than argued, with a break of the shape that causes it.** A doubled full stop in
the machine lede — `and the answer is usually no..` — which `checkNotes()` catches:

| | before the fix | after |
| --- | --- | --- |
| ledger entries rewritten by the failed build | 56 of 254 | 0 |
| `sitemap.xml` on disk after the failed build | rebuilt from refused pages | untouched |
| dated sitemap entries on the next honest build | 57, from 113 | 113 |

The 56 were the machine pages. It was invisible today only because their recorded date was already
2026-09-18, so the wrong date and the right one were the same day; tomorrow it would have stuck.

**The question the item said to settle answered itself.** `checkCanonicals()` and `checkPageDates()`
both opened `sitemap.xml` back off disk, which is what forced the write to come first. A guard that
re-reads what the same script just wrote is checking the disk rather than the build, and what has to
be right is the string about to be published. So the sitemap, `robots.txt` and the ledger are built
into constants where they were, both guards read `sitemapXml`, and the three `writeFileSync` calls
moved to the foot of the file under the last `check*()`.

**The pages themselves are still written as they are generated, and that is right.** A failed build
leaves broken HTML in `public/`, but every build rewrites all 253 and the directory is gitignored, so
nothing survives to be believed later. The ledger was the only sticky one, because it is a record
rather than an output.

**Three breaks proved three claims, one each.** The ledger write moved back above the guards, which
fires only the ordering claim. A fourth file published at the top level, which fires that claim and
the ordering one, correctly — a new published file is also a file written too early. And
`checkCanonicals()` put back to reading `sitemap.xml` off disk, which fires only the claim that no
guard does. The guard reads the script as text, which is the shape `tests/model-watch.test.ts`
already uses, because the fault it catches is a line moved up a file rather than a wrong answer.

**Verified.** 306 tests (3 new), `tsc --noEmit` clean, and the full `npm run build` end to end with
`build:functions` included. **The 253 generated pages are byte-for-byte identical to `main`'s** —
`main` built in a throwaway worktree at `cb20e78` and both trees checksummed,
`766cc5b52c1889fd461390f374ef7ede` twice — and `sitemap.xml` and `seo/page-dates.json` come out
identical too, so nothing a visitor reads moved. 254 URLs, 113 with a lastmod, before and after.
**Deploy run 178 went green at 22:49 and published**, on `2349415`, which carries both commits —
run 177, on the code commit alone, was cancelled by the log push a minute later, as usual.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is still the biggest open item and still waits on PR #8. Four pull requests are open and nothing has
merged since PR #11 this morning: **#8** and **#10** are the two that unblock page work, **#12** and
**#13** are the calculator's own head. Under that, the open items were read for one that can go
straight to main and the honest answer is that there is not an obvious one left. The `--ok-text`
duplication is `src/styles.css` and its own item says it should ride with PR #12. The model page's
duplicate call to action is a question to settle before it is a change. The `/hardware/` and
`/leaderboard/` cross-link the same. The nearest thing to ready is **the waterline label on a share
card**, which is a margin the card passes in rather than a change to the renderer the calculator
shares, and after that the three-machines-without-a-price item, which is waiting on data. So if PR #8
merges, write the monthly-cost page; if it has not, the waterline margin is the job.

### 2026-09-18 — the calculator's assumptions panel says what every page says

**Why this item.** `npm run model-watch` says *done for today*, so the backlog was the job. Its top
open item is the calculator's assumptions panel, which the run before this one left with three
reasons to exist rather than two, and the page it is on is the one a visitor from a search lands on.
It is a pull request rather than a push because it is `src/render.ts`, the calculator's own head:
**[PR #13](https://github.com/rlindsey2/sunkcost/pull/13)**, branch `seo/assumptions-panel`.

**The item's own count was two faults. Reading the paragraph found a third, and it is the one this
file spent yesterday on.** `links()` in `src/render.ts` printed *source 1, source 2, source 3* under
Hardware price — the same links, on the same machines, that `a48ef96` renamed on all 111 generated
pages the run before. The panel was the last place on the site naming a link after a number.

**Where each sentence of `hw.notes` goes, now that it is split.** The panel has fewer rows than a
machine page, so the question the item left open was where the bandwidth sentence lands. It lands in
a row that was not there: **Memory bandwidth**, which the panel wanted anyway, because the figure is
what an estimated speed is divided from and the panel's whole job is to say where a figure came from.
All 56 machines carry one, so the row shows for every machine on the list and says *entered by you*
on a machine you describe yourself.

| sentence | machines | where it goes |
| --- | --- | --- |
| memory | 56 | Usable memory, where it was |
| bandwidth | 19 | the new Memory bandwidth row |
| speed | 11 | Local speed |
| availability | 2 | Hardware price, which is the row that says which product this is |

**One typographic fault the rendered page turned up and the source did not.** A note is a sentence,
and what it followed did not always end like one: the Local speed line read *"…bandwidth-bound
estimate, not a measurement On a laptop, sustained speed drops…"*. `endStop()` moves to
`src/format.ts` with the other three and ends the line the note follows — after `</a>` where the
source is a link, so the RTX 4080's availability sentence reads *ggml-org/llama.cpp. The 4080 SUPER
has the same 16 GB…* rather than running on.

**`src/format.ts` is the shared home, which is what the item asked for.** It is the one module the
bundle and the build both import, and it imports nothing, so `powerSourceLabel()`,
`splitHardwareNote()` with `noteSentences()`, `endStop()` and the whole source-link namer moved into
it. `src/pagekit.ts` re-exports all of them, so `scripts/build-pages.ts` and the tests keep one
import site and neither file changed.

**The proof that a refactor changed nothing: the 253 generated pages are byte-for-byte identical.**
`build:pages` was run on the branch and on `main` and both trees checksummed — `766cc5b5…` twice.
Not a spot check, and not an argument that it should be the same.

**Seven breaks proved seven guards, one each.** The numbered links back; the data's own key back; the
note whole under the memory figure; the Memory bandwidth row deleted so a sentence has no row to sit
under; `powerSourceLabel()` forked into a second copy in `pagekit.ts`, which is the one a future
run is most likely to do by accident; a link called `Source` back; and the version printed from both
fields. Each failed the test that claims it and nothing else. The
identity check is why the fork break fires: the tests import the four from `src/format.ts` and from
`src/pagekit.ts` and expect the same function object, not the same answer.

**Reading the panel's neighbours found the same fault twice more, and a doubling.** Two more links in
`src/render.ts` were named after nothing — the note under the intelligence scale ended `(source)`, and
the assumptions panel's own falling-prices row ended `Source.` — which is the list `checkSourceLinks()`
refuses on every generated page. They name what is on the other end now: **Qwen3 8B on Artificial
Analysis**, which is that model's own row on the index and is where the URL goes, and **Epoch AI**,
which publishes the price-trend study. And the sentence around the first printed the index version
**twice**, once from `frontier_basis.name` and once from the model's own `index_version`, so it read
*Artificial Analysis Intelligence Index v4.3 v4.3*. `indexVersion()` prints it only where the name
does not already carry it, and every model in the data today is in the case where it does.

**Verified.** 310 tests (7 new), `tsc --noEmit` clean, and the full `npm run build` end to end,
`build:functions` included. Read rendered in Chromium on the built bundle, as text and as a picture,
for a card with four sources and a bandwidth note, the RTX 4080 with its availability sentence, a
MacBook Pro with its thermal one, a Strix Halo box, and both custom-machine paths — with a bandwidth
entered and without. **0 elements past the window and nothing scrolling inside the panel at 320, 360,
390, 430, 641, 768 and 1024px.** The two elements that do overflow at 320 and 360px are
`.topbar-end` and the theme button, which is PR #12's fault and not this one. Bundle 276.88 kB →
276.97 kB.

**All three other open pull requests were really merged into this branch rather than trusted to
`git merge-tree`**, which is this file's standing lesson and called all three clean before the fact.
In throwaway worktrees: **PR #8 merges to 316 tests and 254 pages, PR #10 to 313 and 254, PR #12 to
308 and 253**, every guard passing and typecheck clean on all three. Nothing here needs repairing
and nothing this branch does breaks them — `pagekit.ts` loses 196 lines and every one of them is
re-exported from where it went.

**What is still Ryan's, and this run confirmed it rendered.** The Electricity row prints
`TODO: confirm the latest monthly figure at eia.gov/electricity/monthly and update` to visitors,
because `electricity.source` in `data/defaults.json` carries that sentence and the panel prints the
field whole. It is one line of data and it is the one rule this repository holds everywhere else.
Photographed in the panel this run, four rows under the fix.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is the biggest open item and still waits on PR #8, which is repaired, green and ready. Under it, the
sitemap and the date ledger are still written before any guard runs, which is a move rather than a
rewrite and is the next thing that can go straight to main.

### 2026-09-18 — every source link stops being a number and says whose page it is

**Why this item.** `npm run model-watch` says *done for today*, so the backlog was the job, and its
top open item is the one the run before this one turned up while reading the machine pages: **56
machine pages and 55 model pages ended in "source 1, source 2, source 3, source 4"**, 259 links in
all. Anchor text is one of the few things on a page that says what is on the other end, to a reader
deciding whether to click and to a crawler deciding what the link is worth, and a number says
neither.

**The question the item said to settle first is the whole design, and the data answers it three
different ways.** It asked what to print when two sources share a host. Measured rather than
guessed: **37 of the 56 machines and 35 of the 55 models cite one host twice**, so a rule that
prints the host and stops would have produced "Hugging Face, Hugging Face" on 35 pages, which is
the numbered list again with longer words.

- **On Hugging Face and GitHub the host is not the answer, the repository is.** Every model on this
  site cites Hugging Face and half the machines cite GitHub, and the repository is the name of the
  thing: `bartowski/Qwen_Qwen3-8B-GGUF` says which weights the size was read off,
  `Qwen/Qwen3-8B` says which config the architecture came from, `ggml-org/llama.cpp` says which
  runtime. That alone settles all 91 model links and 16 of the machine ones, with nothing invented
  and nothing repeated.
- **Everywhere else the publisher is the answer**, from an explicit list of 31 hosts — Apple, Apple
  Support, TechPowerUp, NVIDIA Newsroom, Daring Fireball, Low End Mac — and a host with no entry
  keeps its own domain rather than being given a name nobody checked.
- **Where a publisher is still cited twice, each link carries what its own URL says it is.** Apple
  (specs) beside Apple (newsroom); Framework (configurator), Framework (blog) and bare Framework;
  ggml-org/llama.cpp (discussion) beside ggml-org/llama.cpp (common.h), a file in a repository named
  by the file. **41 of the 259 links carry one.** The words come from a closed list the path has to
  match outright — specs, newsroom, news, issue, discussion, blog, config, comparison, review, store,
  configurator — so no link is described by anything that is not in its own address.

**The one place the rule stops, and it stops rather than guessing.** On **13 Mac pages** the two
sources are `support.apple.com/en-us/121555` and `support.apple.com/en-us/103253`, two documents in a
support system whose URLs are numbers. Nothing in either says which is which, and reading them is not
possible from here (every outbound fetch is refused by the policy proxy), so both print **Apple
Support** and the reader is told the truth: Apple Support published both. A repeat is still more than
a number was, and the alternative was to describe a page nobody had read.

**Three links that said the word itself go the same way.** `/how-much-memory/` closed its cache
paragraph with a bare "(source)" and now names the header it reads, `ggml-org/llama.cpp`. On
`/leaderboard/` and on every model page the index's own name carries the link instead — *Scores are
the [Artificial Analysis Intelligence Index v4.3](…)* — which also retires the trailing "Score
source." link at the end of every model page's score paragraph, since the sentence above it now goes
to that model's own row.

**`checkSourceLinks()` holds two claims and says plainly what it cannot hold.** No link anywhere on
the site is named after nothing — a number, *source*, *here*, *this*, *read more* — and every link in
a Sources line is named after its publisher, worked out from the URL in the guard rather than read
off the page. What it cannot check is whether a name is the *right* one: it reads the page with the
same function that wrote it, so a wrong entry in the publisher list would pass. That claim needs a
second opinion rather than a second copy, so **tests/pagekit.test.ts names hosts and expects names**,
and holds one host to one name so two publishers cannot collapse into one.

**Five breaks, three caught by the build and two by the tests, and the split is the point.** The
machine Sources line back to numbers, 336 faults — 168 from the sweep for links named after nothing
and 168 from the publisher claim, which is the same fault counted from both ends. The cache note's
bare "(source)", 1. A link named "here", 55 — one on every model page. Then the two the build genuinely cannot see: the
repository no longer being the name on Hugging Face and GitHub, and every host answering "Apple" —
**both passed the build and both failed the tests**, 2 and 5 of them. A sixth check was written and
thrown away: a guard refusing two links printed under one name, which can never fire, because the
builder appends the distinguishing word before the guard ever sees the page. Dead guard code reads
like a held claim and is worse than none.

**Verified.** 303 tests (9 new), `tsc --noEmit` clean, and the full `npm run build` end to end
including `build:functions`. The 113 changed pages — 56 machines, 55 models, `/leaderboard/` and
`/how-much-memory/`, and no comparison page — read rendered in Chromium at nine widths from 320 to
1440px, served over HTTP: **0 elements past the window and 0 tables scrolling at any of them**, which
was the real risk, because `bartowski/DeepSeek-R1-Distill-Llama-70B-GGUF` is an unbroken 42
characters and a 320px column is 271px. It wraps at its own slashes and hyphens. Three pages read as
pictures before committing — a model page at 320px, the RTX PRO 6000 at 390px and a Mac mini at
900px — and all three read as finished copy. Commit `a48ef96`, pushed to main; **deploy run 173 finished green at 20:59**, so all 111 pages are live.

**PR #8 merges clean and did not work, which is this file's standing lesson arriving on schedule.**
All three open pull requests were really merged into this push in throwaway worktrees rather than
trusted to `git merge-tree`, which called all three clean. PR #12 (303 tests) and PR #10 (308 tests,
254 pages, every guard passing) are green and need nothing. **PR #8 failed the new guard**: its own
page closes with *Electricity is at United States prices (source)*, a link named after nothing that
was fine the moment it was written and became a build failure when this push landed. Repaired on its
branch (`6dec521`): it names **US EIA**, the agency that publishes the figure. 311 tests on the
merged tree, typecheck clean, 254 pages with every guard passing, and the sentence read rendered.

**Two things for Ryan, both in files this agent must not touch, and both surfaced by naming the
links.** `data/models.json` has Gemma 4 31B citing **the same Hugging Face repository twice, differing
only in case** — `google/gemma-4-31b-it` and `google/gemma-4-31B-it` — which was invisible as "source
2, source 3" and is now two links reading almost identically. And the calculator's assumptions panel
prints a **`TODO:` to visitors**: `electricity.source` in `data/defaults.json` ends "TODO: confirm the
latest monthly figure at eia.gov/electricity/monthly and update", and `src/render.ts:547` prints the
field whole. Confirmed rendered in Chromium on the built site, behind the assumptions disclosure.
Both are one line of data each and neither is the agent's to edit.

**One thing the breaks turned up about the ledger, worth knowing before the next run breaks a
guard.** `seo/page-dates.json` and `sitemap.xml` are written at line 3824, *before* any guard runs,
so a build that throws in a guard still leaves both on disk, written from the pages the guard
refused. The "here" break above did exactly that: it stamped the 55 model pages with the
fingerprints of a page carrying a link named *here*, and the next honest build then read those,
found a mismatch and published no lastmod for any of them. It heals on the build after that, and it
was checked here rather than assumed: **113 of 254 entries now carry 2026-09-18** — the 56 machines,
the 55 models, `/leaderboard/` and `/how-much-memory/` — with the ledger clean against the commit.
In CI it cannot ship, because a throwing guard fails the deploy before anything is published.
Locally it costs one build's dates, silently.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is still the biggest item and still waits on PR #8, which is now repaired and ready. The small pull
request has three reasons to exist rather than two: `powerSourceLabel()`, `splitHardwareNote()` and
now the `TODO` above all point at `src/render.ts`'s assumptions panel, and the first two want the
same shared home in `src/format.ts`.

### 2026-09-18 — every machine note moves to the figure it is about

**Why this item.** `npm run model-watch` says *done for today*, so the backlog was the job, and the
run before this one closed its top item. What is under it is the prose sweep: three audits have held
every title and description to unique, short and answering, and **nothing had ever read the
sentences inside `<main>`.**

**The sweep found no punctuation to fix, and that is worth writing down.** Fifteen mechanical faults
were read out of the rendered body of all 253 pages — a doubled full stop, a doubled word, a space
before a comma, a stop with no space after it, `TODO` and its relatives, an unclosed bracket, an
empty pair of them. Every hit was an artefact of flattening a table row into a line of text. Read
properly, with block boundaries kept and inline tags closed up, the body of this site is clean.

**What was wrong was placement, and it is the same fault as the last two runs' one page type
along.** `hw.notes` is the field a machine records everything in, and the machine page printed it
whole under **Usable by the GPU**. So the memory note on all seven graphics cards opened with the
arithmetic behind the bandwidth figure in the row above — *"23 GB — Bandwidth: 19.5 Gbps × 384-bit
bus ÷ 8 = 936 GB/s"* — while the **Memory bandwidth** row printed 936 GB/s and nothing else. Ten
laptops explained under their memory figure that sustained speed drops once the chassis warms up.
The twelve Strix Halo boxes said under their memory that measured bandwidth is ~212-215 GB/s of
the 256 GB/s their bandwidth row prints, which is the most useful caveat on the page and was in the
wrong row. The RTX 4080 said under its memory that the 4080 SUPER is a different card; the DGX
Spark, that partner boxes exist and none was cheaper.

**`splitHardwareNote()` sends each sentence to the figure it is about.** Bandwidth to the bandwidth
row, the caveat about speed to a note under the speed column where the tokens/sec figures are, which
entry this is and where you buy it to **Availability**, and everything else stays where it was.
**19 machine pages explain their bandwidth under it, 11 put the speed caveat beside the speed
column, 2 say under Availability which machine this is**, and 30 of the 56 pages changed. The
markers are the subject a sentence names rather than the sentence itself, so a machine added
tomorrow is read by what its note talks about.

**One sentence is edited and it is a label, not a claim.** *"Bandwidth: 22.4 Gbps × 256-bit bus ÷ 8
= 716.8 GB/s"* carried its own label because it used to sit under the memory figure. Under the
bandwidth row the label is the row's name, so it goes. Nothing else about any note is rewritten,
and the guard holds that literally: the sentences joined back up have to be the note.

**Five breaks, each bringing back its own fault and no other.** The note printed whole under the
memory figure again, 49 faults: the moved sentences print twice, and the sweep from the other end —
markers the router itself does not use — catches the bandwidth working back under the memory figure.
The speed caveat not rendered, 22: 11 pages print it 0 times and 11 have nothing under the speed
column. The splitter cutting at every full stop rather than at the end of a sentence, 58: the notes
stop coming back whole when their sentences are joined, which is the guard that matters, because
that is how a sentence would quietly lose half of itself. Availability sent to the Chip row, 2. The
bandwidth working printed in both rows, 26.

**The blank line that dated 14 pages last night tried it again, at 26.** The new speed note sat on
a line of its own, so the 45 machines with no speed caveat printed an empty line in its place and
hashed differently — and 26 of those had changed nothing else, so **56 pages would have gone out
stamped *changed today* when 30 had changed a word.** Same fault, same fix: the conditional carries
its own newline. It was caught before the commit this time, by diffing a Mac page that should not
have moved against the build from before the change. **30 records are dated today and every one of
those pages says something different than it did an hour ago.**

**Verified.** 294 tests (7 new), `tsc --noEmit` clean, and the full `npm run build` end to end
including `build:functions`. All 30 changed pages read rendered in Chromium at nine widths from 320
to 1440px, served over HTTP rather than `file://`: **0 elements past the window and 0 tables
scrolling at any of them.** The specifics list read as a picture at 900px before committing, and
five pages read as text — a card, a laptop, a Strix Halo box, the Spark and a Mac that should not
have changed and did not. Commit `9d21e1b`, pushed to main. **Its own deploy, run 170, was
cancelled by this entry's push three minutes later; run 171 carried both and finished green at
20:02**, so all 30 pages are live. Worth knowing rather than worrying about: a log push within a
few minutes of a code push cancels the code push's run, and the later run deploys both.

**All three open pull requests were merged, tested and built against this push rather than trusted.**
`git merge-tree` says clean for PR #8, PR #10 and PR #12, and this file's standing lesson is that a
clean merge is not a working merge, so each was really merged into `main` in a throwaway worktree:
302, 299 and 294 tests green, typecheck clean on all three, and the two that add a page built 254
pages with the new guard passing. **No repair was needed on any branch**, which is the first push in
days that has moved `src/pagekit.ts` without costing two.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month* —
is still the biggest item and still waits on PR #8. The small pull request left has grown a second
reason to exist: `src/render.ts` prints `hw.notes` whole in the assumptions panel at line 543, one
line below the `stand in` label, so the same file wants the same shared home in `src/format.ts` for
both. And the new item this run turned up while reading: **56 machine pages end in "source 1,
source 2, source 3, source 4"**, which tells a reader and a crawler nothing about what is on the
other end.

### 2026-09-18 — the seven pages one machine runs stop being dead ends

**Why this item.** `npm run model-watch` says *done for today*, so the backlog was the job, and its
top open item is the seven thinnest pages on the site. They are the seven models a single machine
runs, and they were 489 to 559 words against a median of 706 across the 55 model pages.

**The item said they were thin because the machines table was missing, and that is true of one of
them.** Tencent Hy3 has no machine at 32k. The other six have the table, with **one row in it**, and
it is the same row on all six: the Mac Studio M5 Ultra, 256GB at $10,799. So the page answers the
question for whoever owns that machine and answers nothing for everyone else, which is most people
who search "GLM-5.3-Flash hardware requirements".

**The memory ladder the item proposed cannot work here, and the data says why.** Shortening the
window moves the key-value cache, not the weights, and on every machine in the list the weights
alone are larger than the memory: Qwen3.8 Flash Next is 119.6 GB against the DGX Spark's 119.5 GB
usable. Asking for 4k instead of 32k does not bring one machine into reach on any of the seven.

**So the section is the other three questions a reader actually has.** How close does mine come, is
it a window problem, and what do I run instead. `missedMachines()` takes the machines that hold the
model at no window the calculator offers, keeps the roomiest in each family and measures the gap at
4k, the shortest window on the list, so no machine is judged at a context its owner never asked for.
Eight families a page, nearest first, with price, usable memory, the gap and the strongest model
that machine does hold. The DGX Spark leads every one of the seven, **0.2 GB short** on Qwen3.8
Flash Next and 69.6 GB short on GLM-5.3-Flash.

**The last column is the part worth having written this for.** Seven of the eight machines top out
at the same model, Qwen3.8 27B, which is the finding `/hardware/` turned up read from the other
side. It scores 34, and on **four of the seven pages that is higher than the model the page is
about** — Qwen3 235B-A22B scores 13, MiniMax M2.7 23, Inkling Small and Tencent Hy3 26 apiece. So
every page now prints the comparison off the site's own index, in both directions: 34 against 40 on
Qwen3.8 Flash Next, 34 against 13 on Qwen3 235B.

**The flat conclusion that follows from it is written on one page, not four, and the eighth row is
why.** *So every machine that cannot hold this model runs one that scores higher than it* is only
true where every row clears the model, and the MacBook Air M5, 16GB tops out at Gemma 4 12B, which
scores 14. That clears Qwen3 235B-A22B's 13 and nothing else, so the sentence appears on that page
alone. Three pages where the headline figure would have carried it — MiniMax, Inkling Small and Hy3
— do not print it, which is the guard doing its job on a claim that reads true and is not.

**Read as a picture before committing, and the phone layout changed because of it.** The gap was
the table's headline figure, which on a phone prints unlabelled — "0.2 GB" sitting under a
"Usable memory 119.5 GB" that is labelled, which is two memory figures and one of them anonymous.
The strongest model leads the narrow layout instead, so every number on the phone carries its name
and the answer to "what can I run" is the thing in bold.

**Five breaks, each bringing back its own fault and no other.** Section never rendered: seven pages
say nothing about the families that miss them. Section on every model page: 31 pages list machines
that miss them and are not models one machine runs. Gap column printing what it needs instead of
what it is short by: 142.9 GB where the Spark is 23.4 GB short. Ordered by price rather than by how
close: the rows come back out of order, and the test that holds a family to its roomiest machine
fails with them.
A machine that does hold it kept in the list: the Mac Studio M5 Ultra appears in a table of
machines that miss it, and the way out of the section points at the wrong pair.

**Verified.** 287 tests (5 new), `tsc --noEmit` clean, and the full `npm run build` end to end
including `build:functions`. Read rendered in Chromium at 11 widths from 320 to 1440px on all seven
pages and one control: **0 elements past the window at any of them.** Every one read as text
before committing, and one of the seven out of `dist/` end to end. 769 to 834 words now, above that
median. **Deploy run 167 green at 19:05**, so all seven are live.

**Then the merge check found something live on the site that should not have been.**
`public/local-llm-vs-api-cost/index.html` has been tracked on `main` since `4c8d826`, a log commit
from another session that swept up an untracked file — the same fault the backlog item had already
recorded on PR #10's branch, one step further along. `main` has no builder for it, so nothing
regenerates it, nothing links to it and `checkLinks()` cannot see it; but **vite copies `public/`
into `dist/`, so every deploy since 18:14 has published a two-day-old copy of an unmerged branch's
page.** Untracked and the path ignored (`885cc38`, deploy run 168 green at 19:16), and untracked on
PR #10's branch too (`e7be231`), which is the `git rm --cached` that item asked for. The page is
fine and comes back, generated fresh, when PR #8 merges. **The lesson is `git add` in a repository
whose build writes into a tracked directory**: `public/` is half ignored and half not, and a commit
that means to add one file to `seo/` can carry 353 lines of another branch's output with it.

**Two branch repairs, because this push moved the files both open PRs are built on.** **PR #8**
conflicted in two import lists, `scripts/build-pages.ts` and `tests/pagekit.test.ts`, both unions,
plus one duplicated `.gitignore` line after `main` gained the rule that branch already had: 295
tests, typecheck clean, 254 pages with every guard passing, and the page read out of the build.
**PR #10** merged clean and took the untracking above: 292 tests, typecheck clean, 254 pages. **PR
#12** conflicts with nothing, and rather than trust that — which is this file's standing lesson —
it was merged into a throwaway branch and built: 287 tests and 0 elements past the window at 11
widths on the new pages, so its three lines of CSS and this run's new table do not meet. All three
branches merge clean against `main`.

**What to continue.** The monthly-cost page — *how much does it cost to run a local LLM per month*
— is still the biggest item and still waits on PR #8. The thinnest pages on the site are now
`/models/gpt-oss-120b-mxfp4/` at 594 words and six more between 609 and 644, and every one of the
seven is a model five families run, so the answer there is not this run's: their machines table
already carries five rows, and what is short is what the page has to say about the model. The small pull request left is still the
assumptions panel printing *stand in* at `src/render.ts:542`.

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
