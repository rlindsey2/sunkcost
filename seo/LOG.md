# SEO log

Read this file and seo/SEARCH-CONSOLE.md before doing anything. The log before 2026-09-28 is in
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
- [ ] Does this site price a vision model? Reka Edge 2603 is the first candidate whose every size and
      architecture field is citable from the repo (7.13B, Q4_K_M at 4.75 GB), and it is image-text-to-text
      on a revenue-capped licence with no index score. All 55 models here are text. See seo/MODEL-WATCH.md.

## Backlog (ordered by expected traffic impact)

- [ ] /models/gemma-3-12b-q4/ and /models/llama-3.1-8b-q8/ are still the least-linked model pages at 5
      inbound each, unmoved by this run: the new section links outward, from the legacy page to what
      beats it. The reason is now known rather than guessed. A machine page tables the strongest models
      its box holds and the ones measured on it, so a low-scoring legacy model with no benchmark is in
      no machine table and no size page's rows; the only rules that reach one are its own head-to-heads.
      Any fix is a rule on a current page or a machine page pointing back, and the reader's question it
      answers has to come first; a sixth link for its own sake is not worth a sentence. The five that reach
      gemma-3-12b-q4 are three head-to-heads, /leaderboard/ and /how-much-memory/, and the five that reach
      llama-3.1-8b-q8 are its own Q4 page, /leaderboard/ and three size pages. No machine page links either.
- [ ] `/models/gemma-3-12b-q4/` prints, off `architecture.note`, that 5 of every 6 layers use a 1024-token
      sliding window "so the KV cache barely grows with context", and the figures on the same page say it grows
      from 0.9 GB at 8k to 2.5 GB at 32k and 8.9 GB at 128k — 10 times for 16 times the tokens, where a model
      with no windowing at all would be 16. The 8 full-attention layers carry 8 KV heads at 256 wide in the
      data, 8,192 bytes a token, the same as the windowed ones. Gemma 4 12B has the same layer counts and
      records 2,048 bytes for its full layers, and its cache really does crawl: 0.47 GB to 2.5 GB. So either the
      note is wrong or the Gemma 3 architecture fields are, and both are a data edit and Ryan's.

- [ ] Sixteen measurements carry the source's own figure at 32k in their `notes` and nothing reads it.
      Each row in `data/throughput.json` is quoted at one window, usually empty or 4k, and this site
      reads it to 32k with its own decay. Nine of the 16 land within 5% of the source's own 32k
      number; the four Corsair AI Workstation 300 rows read high by 19 to 92% (gpt-oss-120b at 39.0
      against the chart's 20.4, Llama 3.1 8B at 21.8 against 13.0), and Qwen3 30B-A3B on the RTX 5090
      reads 104 against 143. The machine and model pages print all of them as measured. The fix is a
      row quoted at the window the source ran it at for each of the 16, so a data edit and Ryan's.

## Runs

### 2026-10-15 — 50 model pages say which set of machines they are counting
A model page counts machines twice. The sentence under its table counts all 56 the site lists, which answers whether the box
somebody already owns runs the model: a discontinued card and an unpriced Mac still run one. The section pricing a longer window
counts the 37 still sold at a published price, which answers what to buy. Neither said so, so 44 pages read "All 56 machines on
this site run it at 32k" and, two sections later, "37 machines here hold Gemma 3 12B it at 32k": two counts of one claim at one
window, differing, both right. Every count in that section now carries its set and the size of it, in the words the section's own
other branch already used. Straight to main. Verified: 452 tests, typecheck clean, the full build with build:functions, 320 pages
every guard passing, 321 of 321 dated with those 50 moved and no others, one page read rendered in full and the new paragraph on
ten more, covering all three of its branches, and 13 mutations all stopping the build. The new `checkMachineCountScope()` holds
alone, which is how the bug lived: with `checkContextCost()`'s expectation mutated to agree with the page, the old guard saw
nothing and the new one named all 44 pages, and separately every wrong denominator. Watch: Underdog Saluki 27B is Qwen3.8 27B at
two bits, 7.90 GB against 16.46, Apache 2.0 and 344,177 downloads in a week, and nobody but its publisher has measured what it
keeps. Next: the backlog, unchanged.

### 2026-10-14 — 50 model pages price the window a reader is buying for, not only the 32k the page is quoted at
A model page prices everything at 32k and says so. The window somebody wants is usually the model's own ceiling, and
between the two the answer can change completely; the only way to read it was one machine at a time, out of the
"Longest context" column. The 50 pages with a longer window to price now give the footprint at both, the cache at
both, the machines here that hold it at each, the cheapest still sold at each, and both speeds on one machine, so the
window is the only thing that changes between them. Ministral 3 8B goes 9.8 GB to 41.7 GB, 37 machines to 20, $899 to
$1,700 and 20 tok/s to 4.6. On 13 the window costs no more machine; on 2 nothing still sold holds it, and the two
512 GB Macs that do are named with why neither is a purchase. Straight to main. Verified: 452 tests, typecheck clean,
the full build with build:functions, 320 pages every guard passing, 321 of 321 dated with those 50 moved and no
others, four read rendered, and 20 mutations of the new `checkContextCost()` all stopping the build. It caught a
false claim before it shipped: MiniMax M2.7 stops at 200k and GLM-4.7-Flash at 198k, so the 128k each page can price
is neither its ceiling nor the longest on offer. Watch done. Next: the new item below, Ryan's. Top item unmoved.

### 2026-10-13 — 16 model pages print the speeds somebody measured running that model
A model page's table is one machine per family, the cheapest of each, over the machines still sold at a published
price. A benchmark gets run on the box somebody already owns, which is usually last year's, so the two sets barely
meet: 78 of the 98 measured figures in data/throughput.json sat on no model page at all. Llama 3.1 8B Instruct has
nine and its page printed eight speeds, every one worked out from bandwidth, under a note saying speeds are measured
where a public benchmark exists. The 16 pages with a measurement their table misses now table every one: the machine,
its price, the figure read at 32k, and the figure as published, linking the source that took it at the window it was
run at. checkFastestRow() wanted narrowing too: its "nothing here is quicker" read every cell on the page, and a
figure published at an empty window is not a figure at 32k. Straight to main. Verified: 452 tests, typecheck clean,
the full build with build:functions, 320 pages every guard passing, 321 of 321 dated with those 16 moved and no
others, five read rendered, and 24 mutations stopping the build, 23 on the new checkMeasuredMachines() and one on the
guard already holding a card's price to the card. Watch: Mellum2.1 Thinking, Apache 2.0, 12.15B at 8.07 GB, every
field but the index score and a rental price, and both of those are judgements. Next: the new backlog item, a data edit.

### 2026-10-12 — 54 model pages name the fastest machine here, not "the fastest of the ones listed"
Reading the two least-linked model pages for the backlog item turned up a false row in the answer block of all
54. The row is chosen over every machine here that runs the model; the table under it is one machine per family,
the cheapest of each. On 25 pages it named a machine in no table on the page, listing something the page did
not; on 6 it named the box the row above had, one machine being both where only one runs the model. It reads
"Fastest machine that runs it" now, carries that machine's price, and is left out where the cheapest is also
the fastest. The price is the half that matters: both machines it ever names are graphics cards, the RTX PRO
6000 Blackwell, 96GB on 36 pages and the RTX 5090, 32GB on 12, and $18,000 card only reads differently from a
whole computer. Straight to main. Verified: 452 tests, typecheck clean, the full build with build:functions,
320 pages every guard passing, 321 of 321 dated with those 54 moved and no others, four read rendered, and 12
mutations stopping the build: 11 on the new checkFastestRow(), one on the guard already holding every speed to
its basis. Watch: Kolibri 1 has every field but the index score, off its own repo. Next: the backlog, unchanged.

### 2026-10-11 — The 16 last-generation model pages say whether the model is still worth running
A model page answered what runs it, how fast and whether it pays back. On a last-generation model that is not
the question: the non-brand searches here are exact model names, and a name still typed is one somebody is
already running. Seven offered a head-to-head with a same-family successor, a link rather than an answer, and
nine had none. The test is two figures and no judgement: a current model scoring higher on the index and
needing no more memory at 32k. Each of the 16 has 7 to 22, so it is a count and the strongest one, not a list.
Nine name a cheaper machine: Llama 3.3 70B wants $3,449 of
computer, Qwen3.8 27B at four times the score wants $1,269. Two say the older model is the quicker, both an
MoE against a dense replacement. Straight to main. Verified: 452 tests, typecheck clean, the full build with
build:functions, 320 pages every guard passing, 321 of 321 dated with those 16 moved and no others, six read
rendered, 15 mutations of `checkSupersededModels()` all stopping the build. Watch: Reka Edge 2603 is open
weights with every figure citable off the repo and is a vision model, so Ryan's call, above. Next: the backlog.

### 2026-10-10 — The four pages that are one model at two precisions weigh the two
Two models here are listed twice at two precisions, and those four pages are the only ones whose subject is a
download rather than a machine. None weighed the two. The Q8 pages were also the least-linked model pages here
and the only ones in no head-to-head, so what a reader lands on them asking was a clause of the lede and a file
size at the foot. Llama 3.1 8B now goes 4.9 to 8.5 GB of weights, 9.2 to 12.8 GB to hold at 32k, all 56 machines
here to 50, $899 to $1,099 and 14 tok/s to 9.9 on the cheapest box holding both. Qwen3 32B goes 19.8 to 34.8,
28.3 to 43.4, 36 machines to 28, $1,299 to $1,700 and 24 to 16 tok/s, both measured on the Mac Studio M3 Ultra,
96GB, the only machine here with both builds measured. The other half has no figure: one index score both builds
carry, the same five ratings. Straight to main. Verified: 452 tests, typecheck clean, the full build with
build:functions, 320 pages every guard passing, 321 of 321 dated with those 4 moved and no others, four read
rendered, and 21 mutations of `checkModelPrecision()` all stopping the build. Watch done, nothing new to price.
Next: neither thin page gained an inbound link, and gemma-3-12b-q4 is untouched.

### 2026-10-09 — 26 machine pages print the benchmarks somebody actually ran on them
A machine page said every speed in its table was worked out from memory bandwidth, which reads as though
nobody has run a model on the box. data/throughput.json holds 98 published figures across 27 of the 56
machines, 70 of them on superseded models, which the calculator hides until asked and the table leaves out,
so the page answering how fast a machine is showed no figure anyone had measured on it. The 26 pages with
one now table the 97 their machine still holds at some window: the speed as published, at the window it was
run at, and that measurement read at 32k. Every row links its model, closing the backlog item: the 16 legacy
pages go from 4-10 inbound to 5-21, median 6 to 10, no longer the thinnest here. Straight to main. Verified:
452 tests, typecheck clean, the full build with build:functions, 320 pages every guard passing, 321 of 321
dated with those 26 moved and no others, five read rendered at 320, 390 and 1100px, and 17 mutations of
`checkMeasuredRows()`, which recomputes each 32k figure from the published one, all stopping the build.
Watch done: Kimi K3 is out on size at 2.8T. Next: the two legacy pages no measurement reaches.

### 2026-10-08 — The "Good at" column is gone from the 57 tables with nothing to put in it
Five capability dots sat in every row of the 56 machine tables and the leaderboard's. Of those 3,545
dots, 3,415 were the grey that means unrated: 652 of the 661 machine rows, 47 of those pages with not one rated
row, and 31 of the leaderboard's 48. Wordless, so last run's sweep for "not rated" never saw them, and in a
ranked table a grey row beside a coloured one is a verdict the data never made. The column is dropped rather
than dashed. On a phone the machine tables keep a pair — memory and longest context, 254px against the 271px
a 320px row gives, measured in Chromium — and the leaderboard loses its, because class and weights, the only
neighbours left, want 318px. Straight to main. Verified: 452 tests, typecheck clean, the full build with
build:functions, 320 pages every guard passing, 321 of 321 dated with those 57 moved and no others, four read
rendered at 390 and 1100px, no `dot-unknown` left on any page, and twelve mutations all stopping the build:
`checkCapabilityDots()` counts the site's 215 dots off the data, `checkTableWidths()` holds all 886 tables'
rows to the columns their head names. Model watch done, nothing new to price. Next: the legacy model pages,
the least-linked on the site; see the backlog.

### 2026-10-07 — 102 pages stop printing a rating nobody has made
The five capability dots are the one judgement on a model page rather than a figure, and 36 of the 55 models
here have none: every dot read "not rated", 665 times over 102 pages. On 36 model pages that was five blanks
under "How good is it, really?" and a line about this site's last ratings pass, process language on the page a
model-name search lands on. On 35 head-to-heads it was worse than blank, because a rated column beside an
unrated one reads as a verdict: gemma-3-12b vs gemma-4-12b rated the older model at five jobs and the newer at
none, where the score row has it 14 against 4. A block is printed where there are ratings now; the 19 rated
models still print all five. Straight to main. Verified: 452 tests, typecheck clean, the full build with
build:functions, 320 pages every guard passing, 321 of 321 dated with those 102 moved and no others, four read
rendered, the phrase gone from all 320, and ten mutations of `checkRatingBlocks()` all stopping the build.
Closed, not done: the three over-length titles, 1 to 3 characters past 60 with no cut that keeps every name a
searcher types. Watch: Beam, 501B-A23B, Apache 2.0, waits on its weights. Next: the same dots, wordless.

### 2026-10-06 — 56 machine pages say how fast the machine is, not only what fits in it
A machine page answered what runs on it and whether it pays back, never how fast. The tok/s for the
strongest model it holds sat in the answer block and the table's first row, neither of them where a
search result reads: the first paragraph named that model and went to the money, the description
spent its 155 characters on the count and the pay-back. Both carry it now, each saying whether the
figure was measured or worked out from bandwidth, and none of the 56 is a measurement. The Mac
Studio M5 Max, 128GB opens on Qwen3.8 27B at 25 tok/s at a 32k window, the RTX 3060, 12GB at 38 on
Gemma 4 12B. Straight to main. Verified: 452 tests, typecheck clean, the full build with
build:functions, 320 pages every guard passing, 321 of 321 dated with those 56 moved and no others,
six read rendered, and eight mutations of `checkMachineLedeSpeeds()`, which reads each speed back off
that machine's own first row. Watch: Kolibri 1 has a 47.5 GB four-bit build and wants two fields now,
not one. Next: the over-length titles, read this run and left; see the backlog.

### 2026-10-05 — A pull request is tested before it is merged, not by the push that deploys it
`deploy.yml` was the only workflow and runs on a push to main, so a PR's first test was the push that
published it: a broken guard would have been found by deploying. PR #20 adds `checks.yml` on
`pull_request`: `npm ci`, the typecheck the deploy skips, 452 tests, the full build with every page
guard, and one check it never had. `seo/page-dates.json` is the only committed file the build
rewrites, and a page changed without its ledger entry deploys and crawls but takes no `lastmod` into
the sitemap, so the diff the build leaves is the only sign. A PR because only one can prove a
`pull_request` trigger fires, and #20's run did. Verified in that order locally, clean, then both ways
of the mistake, reverted: a stale hash re-dated its page, and a page edited with the ledger as
committed wrote a new hash and today's date. The step fails on either, and a matching hash keeps its
date, so a later build cannot trip it. Watch: Kolibri 1, 78.1B/3.46B, Apache 2.0, fits here but ships
FP8 only, with no four-bit listing. Next: the three over-length head-to-head titles.

### 2026-10-04 — Two unpriced machines and one size page say what they would have to cost
Every pay-back here divides a price by a daily saving, so the two unpriced machines got the same non-answer,
"cannot be computed yet", and /how-much-memory/192gb/, whose only machine is one, gave up on the question
this site exists to answer. A saving needs no price, so the sum runs backwards. At 500k tokens a day the
Framework Desktop, 192GB would have to cost $154 to come back inside two years, on Qwen3.8 27B at $0.21 a
day; at 20M, agents most of the day, $5,191 on Qwen3.5 122B-A10B. The Mac Studio M5 Ultra, 512GB needs $175.
Both mark the borrowed power behind the electricity. The item's link half is shut: no pair rule reaches an
unpriced machine, and the 11 pages naming the Framework 192GB in a price table would be stuffing to link.
Straight to main. Verified: 452 tests, typecheck clean, the full build, 320 pages every guard passing, 321
of 321 dated with those 3 moved, three read rendered, and ten mutations of `checkPriceToBeat()`, which
prices each machine at its own printed ceiling and asks the forward sum when it breaks even, all stopping
the build. Watch done: Index-Translate-35B-A3B has 21.7 GB from two uploads and no index score. Next: no
workflow in .github runs on pull_request.

### 2026-10-03 — The four chip-step head-to-heads offer the two size pages they are about
A memory-tier pair holds the silicon equal and offers both its size pages. The four pairs where the maker cut
the chip as well as the memory fall outside that rule and offered neither rung, so the one page here whose
whole subject is 36 GB against 48 sent a reader to no size page at all. All four now offer both, and each
says what else is sold at the size the step buys: 4 machines at 48 GB from the Mac mini M5 Pro at $2,299,
$800 under the Mac Studio at 307 GB/s against 614; 7 at 64 GB and 10 at 128 GB, from $259 and $1,251 under
their own box at 256 GB/s both ways; at 256 GB only the column itself. /how-much-memory/36gb/ goes from 5
inbound to 6, closing the item; it stays the thinnest because one machine on sale sits at 36 GB. Straight to
main. Verified: 452 tests, typecheck clean, the full build with build:functions, 320 pages every guard
passing, 321 of 321 dated with those 4 moved, all four read rendered, and seven mutations of
`checkStepSizeOffers()`, which rebuilds a size's machines from `data.hardware` and reads every figure back
off the rendered paragraph. Watch done: MiMo-V2.6-Flash has its first real four-bit listing, MXFP4 at 157 to
167 GB from two repos, and the 185.40 GB Q4_K_M once quoted for it does not exist. Next: the 192 GB page.

### 2026-10-02 — Twelve size pages said what a step up the ladder buys and never that it can cost speed
"What 48 GB adds over 36 GB" weighed room and price and stopped. On five of the eleven steps the roomiest
machine at the larger size reads memory more slowly than the one a rung below, so the step costs speed, and
the section read as a verdict with that half missing. The 36 GB page said the 48 GB Mac mini M5 Pro is $200
cheaper and nothing new fits, not that Qwen3.8 27B runs 19 tok/s on the Mac Studio it had just named and 12
on the cheaper box. Worst from 96 to 128 GB: 1792 GB/s down to 273, 78 tok/s to 11. All 12 pages now say
which way the step goes, in both bandwidths and both speeds; four buy speed, three leave it alone. Straight
to main. Verified: 452 tests, typecheck clean, the full build with build:functions, 320 pages every guard
passing, 321 of 321 sitemap entries dated with the 12 size pages moved and no others, all 12 read rendered,
and six mutations of `checkStepSpeeds()`, which rebuilds the shared model from the scores and reads each
speed off the table on the page it belongs to. Watch done: Ling 3.1 Flash is announced, not open; Apodex 1.1
Mini, Apache 2.0 at 21.7 GB from a real listing, is the best-sourced candidate yet and wants a score.

### 2026-10-01 — Seven model pages said nothing here holds a model that two machines do
"Every machine here but the Mac Studio M5 Ultra, 256GB misses this model" was false on all seven pages
that said it: between two and four machines on this site hold each of those models at 32k. They are left
out of "cheapest machine that runs it" rightly, a discontinued box being no purchase and an unpriced one
no match for an API bill, and that reason was stretched into a claim about all 56. Worst on Tencent Hy3,
whose snippet read "more than any machine here offers" while two 512 GB Macs hold it to its 256k
ceiling. Each page now scopes the claim and names what does hold it, with the size, the price and
whether it is still sold. /how-much-memory/512gb/ goes from 4 inbound to 11, closing that half of the
backlog item. Straight to main. Verified: 452 tests, typecheck clean, the full build with
build:functions, 320 pages every guard passing, 321 of 321 dated with 7 moved, three read rendered, and
eight mutations of `checkOffMarketHolders()`, which works its machine set out from the data rather than
from the helper that writes the sentence. Watch done: Clef is out on kind. Next: /how-much-memory/36gb/.

### 2026-09-30 — 46 model pages name the least memory anything here holds them in
A model page named the cheapest machine that runs it, one still sold: that answers what to buy, not what
a reader who already owns a card is asking. The roomiest machine at a size is often a discontinued card
with more to give than a cheap new computer, so on 46 pages the smallest size here that holds the model
is below the size its cheapest machine is sold in. Each now names that size, the machine there, what it
hands a model, its price and whether it is still sold, every figure read off the size page it links.
/how-much-memory/12gb/ goes from 3 inbound to 17, closing the backlog item. Straight to main. Verified:
452 tests, typecheck clean, the full build with build:functions, 320 pages every guard passing, 321 of
321 dated with 46 moved, five read rendered, and nine mutations of the new `checkSmallestSizeLine()`,
which binds each figure to that machine's own row, all stopping the build. Watch done: nothing
open-weight since MiMo-V2.6, and the four-bit size now quoted for MiMo-V2.6-Flash is arithmetic on its
parameter count, not a listing. Next: the 512 and 36 GB pages.

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
