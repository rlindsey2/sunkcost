# SEO log

Read this file and seo/SEARCH-CONSOLE.md before doing anything. The log before 2026-10-07 is in
seo/archive/ and is not required reading; it grew to 10,000 lines, which is why this one has rules.

## Rules for this file

- A run entry is at most 12 lines: date, what changed, commit or PR, how it was verified, what next.
  No essays, no restating earlier entries, no commentary on the deploy unless it failed.
- The backlog holds open items only, one to three lines each. Move a finished item into the run
  entry that finished it and delete it here. Do not keep "nothing to do" items.
- Once this file passes 300 lines, move the oldest run entries to seo/archive/.

## Standing orders (from Ryan)

- (Ryan, 2026-10-20) **The 2026-09-23 freeze is lifted, and data edits are the agent's now.** This
  replaces the 2026-09-23 freeze and every line in this repo that says the agent does not edit
  `data/*.json` or that a data edit is Ryan's call. The agent may:
  - add, correct and retire rows in `data/*.json`: models from the watch, throughput rows, notes,
    prices, architecture fields;
  - change the data model itself (new fields, a new quantisation label, a vision flag), with
    `validate-data.ts`, the types and the tests changed to match in the same push;
  - add new page types and new head-to-heads, where the page answers a search people make
    (model name + machine, "tokens per second", "can a <machine> run <model>").
- What does not change: no figure is invented. Every new number carries its source URL and the
  date it was read; anything a source does not state is `null` with a TODO. A new page holds its
  claims with a build check, the way existing pages are held. Taking a page down needs a 301.
- Still Ryan's: anything that costs money or touches secrets, DNS, the deploy workflow or the
  calculator's maths in `src/compute.ts`.
- The model watch (`npm run model-watch`, seo/MODEL-WATCH.md) stays daily and comes first.
- Deploys are not free: one push per run, with the log change in the same push as the work.
- (agent, 2026-09-26) `git fetch origin main` before judging what main has. This container clones
  shallow and stores a stale `origin/main`, a commit behind the branch actually deployed. Confirm a
  push landed against the Actions run list, not the local ref.

## Ryan's side

- [ ] Links from outside: the two news articles, r/LocalLLaMA, hardware reviewers who publish tok/s.

## Backlog (ordered by expected traffic impact)

- [ ] **Add the watch's waiting candidates as rows, best-sourced first.** One model per run, with its model
      page and sitemap entry; seo/MODEL-WATCH.md has the figures and the open field for each. MiniMax M3.1 Flash
      is next and is the best-sourced candidate this watch has had: an exact rental price, 43 on index v4.3.2,
      and 428B with 23B active off the card. Three calls come with it, all the agent's now: it is a vision
      model, so price the text side as Nemotron 3.5 Bolt and Flint do; its licence is `minimax-community` and
      wants reading; and at 249.40 GB the four-bit GGUF fits one machine here, so a smaller build may be the
      one to price. Then Ornith 1.5 122B, a third size of a family here and a vision model too, and Reka Edge
      2603.

- [ ] Six model pages have no head-to-head, and nothing about those models is the reason. All three pair rules
      — the ladder, the generation swap, the memory neighbour — are cut from `rankedModels()`, which keeps only
      the models the intelligence index has scored, so an unscored model is in no pair however well sourced it
      is. The memory rule needs no score: it pairs two models that ask a machine for the same memory, which is
      a footprint and a family name. Running that one rule over every model with a footprint would give the six
      a page each, and the searches it answers are the ones the Search Console notes name.

- [ ] Artificial Analysis has moved to **index v4.3.2**, and 56 rows here say v4.3. Every model page says "On
      the Artificial Analysis Intelligence Index v4.3 it scores N", out of `defaults.frontier_basis.name`, and
      the 50 scores under it were read on 2026-09-11. Nemotron 3.5 Bolt's was read on the v4.3.2 page today and
      recorded as v4.3 so that one row does not claim a scale the other 55 are not on. The fix is to re-read the
      scores off the leaderboard and move the basis with them, which is a data edit over every scored row.

- [ ] Two `max_context_note` fields are written in library field names, which is what a visitor now reads beside the
      ceiling: Inkling Small prints "model_max_length; the config states no max_position_embeddings" and the two
      DeepSeek distills "in config; the card does not state one for the distills". The figures are right and the
      caveats are real, so the fix is the wording, which is a data edit, now the agent's.

- [ ] Sixteen measurements carry the source's own figure at 32k in their `notes` and nothing reads it.
      Each row in `data/throughput.json` is quoted at one window, usually empty or 4k, and this site
      reads it to 32k with its own decay. Nine of the 16 land within 5% of the source's own 32k
      number; the four Corsair AI Workstation 300 rows read high by 19 to 92% (gpt-oss-120b at 39.0
      against the chart's 20.4, Llama 3.1 8B at 21.8 against 13.0), and Qwen3 30B-A3B on the RTX 5090
      reads 104 against 143. The machine and model pages print all of them as measured. The fix is a
      row quoted at the window the source ran it at for each of the 16, so a data edit, now the agent's.

## Runs

### 2026-10-24 — Spark-X2.6 4B is priced here, and the 2.5's page names it as the newer model
The top backlog item wanted the best-sourced candidate as a row, and every figure was read today off the sources: 3.54 GB of Q4_K_M off XHToken's own
GGUF file list, 36 layers with 9 full attention and 27 at a 512-token window, at 4 KV heads by 256, off `config.json`, 4,112,079,360 parameters off the
safetensors index, 1,048,576 tokens and Apache 2.0 off the card. Artificial Analysis 404s on it as on the 2.5, so the score is `null` with a TODO and no
pair rule reaches either Spark; nobody serves XHToken by the token, so the row carries the Granite 4.2 8B stand-in the 2.5 carries, $0.06 / $0.25,
re-read today as the cheapest of its two endpoints. The parameter count is the 2.5's to the digit and the card says the architecture is too, so the one
thing that changed is the download, 3.54 GB against 2.60; the 2.5 stays current and its note names the 2.6, following Qwen3.6 27B. All 56 machines hold
it at 32k, the cheapest a Mac mini M6, 16GB at $899 and 24 tok/s, 77 years to pay back, its 1M window 39 GB of cache, 72 pages linking in. One find came
with it: the RTX 4090 share card put its "150 yr" tick five thousandths of a pixel past the column, having tested it against the x before rounding and
written the rounded one, so the chart decides on the figure it writes now. Straight to main. Verified: 453 tests, typecheck and validate clean, the full
build with build:functions, 328 pages every guard passing, 329 dated with 243 moved, both Spark pages read rendered, five mutations of the row caught by
validate, the card guard re-checked by putting the rounding back. Next: MiniMax M3.1 Flash, above.

### 2026-10-23 — Flint 40B-A2.5B is priced here, and its page names who serves it free
The top backlog item wanted the best-sourced candidate as a row, and every figure in it was read today off the sources: 25.05 GB of
UD-Q4_K_XL off unsloth's GGUF file list, 49 layers with 14 of them full attention and 35 at a 513-token window, at 4 KV heads by 128,
off the BF16 `config.json`, 39.79B off the safetensors index against the card's 39.8B and about 2.5B active per token, 262,144 tokens
and Apache 2.0 off the card. Artificial Analysis still 404s on it, so the index score is `null` with a TODO, the ratings wait on it
and no pair rule can reach it, as with LFM2.5 24B-A2B. The price was the open field: the only listing of Flint is Recursive's own
free endpoint, so the row stands in at the nearest size, Qwen3.6 35B-A3B at $0.05 / $0.70, still the cheapest of ten endpoints today,
and the first paragraph says Recursive serves it free rather than leave a reader to find that on OpenRouter. The build priced is
unsloth's four-bit GGUF rather than Recursive's own at 26.0 GB, and the specifics name both. The page reads finished: 38 of the 56
machines hold it at 32k, the cheapest a Radeon AI PRO R9700, 32GB at $1,299 and 131 tok/s, 85 years to pay back, its whole 256k
window 7.6 GB of cache, 60 pages linking in. Straight to main. Verified: 453 tests, typecheck and validate clean, the full build with
build:functions, 327 pages every guard passing, 328 in the sitemap, 227 dates moved, the page read rendered, three mutations of the
row all caught by validate. Oldest two entries archived. Next: Spark-X2.6 4B, above.

### 2026-10-22 — Beam 1.0 501B-A23B is priced here, and the pages that find no machine for it say which set they looked in
The top backlog item wanted the best-sourced candidate as a row, and every figure was read again today off the sources: 306.53 GB over 8
shards off unsloth's GGUF file list, 52 layers with 9 full attention and 43 at a 512-token window, at 8 KV heads by 128, off the BF16
`config.json`, 501.27B against the card's 23.4B active, 1M and Apache 2.0 off the card, 30 off Artificial Analysis. Both judgements the
watch held are made on the page: the four-bit GGUF rather than Reflection's own NVFP4, the only build the machines with room for it can
read, and the price names its provider, Nebius at $0.25 / $1.00, cheapest of five endpoints. It is the largest thing priced here, and
the first model nothing still sold at a published price holds at any window, which found two false claims waiting on that case: three
head-to-heads opened "No machine on this list runs X", and the leaderboard's machine column read "nothing on the list", of a model two
512 GB Macs hold. Both name the set and its size now, and the leaderboard's note says what does hold it. Adding it retired one
head-to-head the ladder re-sorted around, 301'd to the model page its address names first. Straight to main. Verified: 453 tests with
two rewritten, typecheck and validate clean, the full build with build:functions, 326 pages every guard passing, the model page and both
new head-to-heads read rendered, five mutations stopping the build or the tests. Next: the watch's three new names, above.

### 2026-10-21 — Nemotron 3.5 Bolt 74B-A9B is priced here, and the three pages it retired still answer
The top backlog item wanted the best-sourced candidate as a row, and every figure was read today off the sources: 22.02 GB off the GGUF repository's
file list, 88 blocks with 8 of them attention at 2 KV heads by 128 off the BF16 `config.json`, 74.89B with 9B active, IQ2 and 256k off the card,
OpenMDW-1.1 off its front matter, 21 off Artificial Analysis. Two judgements the watch held for Ryan are made on the page: NVIDIA's own two-bit build
is priced rather than unsloth's 50.22 GB four-bit, because that quantisation is trained and built for a 24 GB card, and the vision side is a separate
1.7 GB download the row does not price. Nobody rents it, so the price is a stand-in, Qwen3.6 27B at 22 against 21. The page reads finished: 41 of the
56 machines hold it at 32k, the cheapest a Framework Desktop, 32GB at $1,269 and 48 tok/s, 17 years to pay back, its whole 256k window 2.1 GB of
cache, 94 pages linking in. Adding it retired three head-to-heads the pair rules chose by score and by memory, so `RETIRED_PAGES` 301s all three to
the model page their address names first, and `checkRetiredPages()` stops the build on a page in the committed ledger it no longer writes and does not
redirect. Straight to main. Verified: 453 tests, one of which counted 56 models by hand and now counts the data, typecheck and validate clean, the
full build with build:functions, 324 pages every guard passing, four mutations of the new guard stopping the build, the page read rendered. Next: Beam
1.0 and Reka Edge 2603 on the watch.

### 2026-10-20 — LFM2.5 24B-A2B is priced here, and the page it gets has no head-to-head to give it
The top backlog item wanted the best-sourced candidate as a row, and every figure in it was read again today off the sources
themselves: 14.53 GB of Q4_K_M off the GGUF repository's file list, 40 layers with 10 of them attention at 8 KV heads by 64 off
`config.json`, 24.0B with 2.45B active and 131,072 tokens off the card, lfm1.0 off the repository metadata, and $0.05 / $0.70
off OpenRouter, an exact rental match. Artificial Analysis still 404s on it, so the index score is `null` with a TODO and the
five ratings wait on it. The page reads finished: a Mac mini M6, 24GB at $1,099 the cheapest of the 49 machines holding it at
32k, 24 tok/s there, 73 years to pay back, 17.2 GB at its own 128k ceiling, 65 pages linking in. No head-to-head, because all
three pair rules are cut from the index and six models here are not on it; new backlog item below. Straight to main, ef372b2.
Verified: 453 tests, typecheck clean, the full build with build:functions, 322 pages every guard passing, 323 of 323 dated with
227 moved, the new page and its two mentions elsewhere read rendered. That deploy failed and a second push fixed it: the 56th
model took a card test that runs in 1.3 seconds here past vitest's 5-second default on the runner, where nearly every test is
one assertion over every row of the data, so the suite allows 30 seconds now. Next: Nemotron 3.5 Bolt 74B-A9B.

### 2026-10-20 — The Gemma cache figures say what the configs say, and Gemma 4 31B needs half the cache it claimed
The top backlog item asked whether Gemma 3 12B's note was wrong or its architecture fields were. The config answers: `unsloth/
gemma-3-12b-it` states eight KV heads at 256 wide and no separate geometry for the eight layers that grow, so 8,192 bytes a
token is every layer and the fields are right. The note claiming the cache "barely grows with context" was the false half, and
now says the windowing slows the growth rather than stopping it. Reading that same field across the family found the larger
fault: every Gemma 4 config states `num_global_key_value_heads` and `global_head_dim`, three of the four rows record them and
gemma-4-31b did not, so the layers that grow were priced at sixteen heads by 256 instead of four by 512. Its cache goes 6.2 GB
to 3.5 at 32k and 22.3 to 11.6 at 128k, which moves what fits: the Radeon AI PRO R9700, 32GB now reads 23 GB and 64k where it
read 26 GB and 32k. The other eight windowed models' configs were read and none states that geometry, so the class is swept.
Straight to main. Verified: tests with three snapshots corrected, typecheck and validate clean, the full build with
build:functions, 321 pages every guard passing, 322 of 322 dated with 145 moved, four read rendered. Next: the watch's rows.

### 2026-10-19 — Every page writes a context ceiling the way a person says it, and stops writing it twice
A model's own ceiling went out as "1024k tokens", in the first paragraph of six model pages and in 14 head-to-heads: a figure a
reader divides before it means anything, where everyone says 1M, and Llama 4 Scout's 10M read "10240k". The specifics line under it
printed that figure again, because the note the data keeps there writes the ceiling the way the model card does, so 37 of the 55
read "256k tokens (256k)" and Inkling Small nested a bracket in a bracket. One formatter now writes a context in thousands up to
256k, the calculator's own longest setting, and in millions above it, which is only ever a model's ceiling; and the note prints what
it adds to the figure or nothing at all, so Llama 4 Scout reads "10M tokens (claimed; nobody has the memory for that locally)" and
42 pages read the figure alone. Straight to main. Verified: 453 tests, typecheck clean, the full build with build:functions, 320
pages every guard passing, 321 of 321 dated with those 51 model pages and 14 head-to-heads moved and no others, six read rendered,
and 15 mutations caught, 14 stopping the build and one the tests. The new `checkContextCeilings()` reads it both ways: no page
counts a context in four-figure thousands, and the bracket may print only the data's own words with none of the figure in them.
Watch: DeepSeek V4.1-Flash's own four-bit GGUF is 500.71 GB, past the roomiest machine here. Next: the backlog, three, all Ryan's.

### 2026-10-18 — The pages that hold every current model say so, rather than counting 39 out of 39
A count divided by itself is a sweep in the shape of a near miss, and a first paragraph is read for its shape before its numbers.
Both 512 GB Macs opened "Yes — 39 of the 39 current models on this site fit", the strongest thing a machine page here can say;
they read "all 39" now. The same sentence sat in two places the item did not name: /how-much-memory/512gb/ opened its description,
the snippet a search result shows, with "39 of the 39 current models fit at 32k", and the step section there and on the 256 GB
page said the roomiest 512 GB machine "holds 39 of the 39" beside the rung below "holding 38". All four say all 39, in wording the
site already used in three other places. Straight to main. Verified: 452 tests, typecheck clean, the full build with
build:functions, 320 pages every guard passing, 321 of 321 dated with those 4 moved and no others, all four read rendered, and 14
mutations stopping the build. The new `checkSweepCounts()` reads it both ways: no prose or snippet may print a figure out of
itself, tables aside, and the pages the data gives a sweep have to claim it, rebuilt off the machines at the size. Watch: LFM2.5
24B-A2B is the best-sourced candidate this watch has had, an exact rental price and only the index score missing. Next: the
backlog is two items, both data edits and Ryan's.

### 2026-10-17 — Three model pages stop offering a dearer machine that pays back no sooner
A model page offers a second machine as the shortest pay-back, chosen over every machine here that runs the model. On three it
named one $30 dearer than the cheapest whose figure the row below already printed: muse-glimmer-30b-q4 at 22 years against 22,
qwen3.6-27b-q4 at 19 and qwen3.8-27b-q4 at 17, the days behind them 2 to 55 apart out of 6,000 to 8,000, which is noise on a speed
worked out from bandwidth. The row drops out there now, the way the fastest-machine row already drops out where the cheapest
machine is also the fastest, and 11 pages keep it because the two answers differ. That closes the top backlog item as it asked.
Straight to main. Verified: 452 tests, typecheck clean, the full build with build:functions, 320 pages every guard passing, 321 of
321 dated with those 3 moved and no others, all three read rendered and one of the 11 that keep the row, and 11 mutations stopping
the build, 10 on the new `checkBestValueRow()` and one on `checkTableWidths()`. The new guard reads each Pay-back cell of the
page's own table back against the machine beside it, so the claim and the table cannot drift apart. Watch: Beam's four-bit GGUF is
out at 306.53 GB, which both 512 GB Macs hold with room for its 1M window, so yesterday's obstacle is gone and the quantisation is
the call; Nemotron 3.5 Bolt 74B-A9B is new at 22.02 GB, NVIDIA's own build is two-bit and it is a vision model, so both of Ryan's
open questions at once; Muse Spark Open is out on size. Next: the two machine pages reading "39 of the 39 current models".

### 2026-10-16 — 170 pages say which models they count, and every machine page names the ones it leaves out
A machine page counts models over the 39 the calculator counts, the current ones, and called that "the 39 open models on this
site". This site prices 55, and 26 of those pages table published speeds for superseded models no count on them includes, so
the page's first sentence and its snippet read as a count of everything here. Every count of that set now says current: 56
machine ledes and their descriptions, 111 head-to-heads, /hardware/, /compare/ and /best-gpu/. Each machine page also names
the superseded ones it holds at 32k, linked and strongest first, 3 on an RTX 3060 and 15 on an RTX PRO 6000. That closes the
top backlog item as it asked, off a reader's question: inbound links go 5 to 61 on gemma-3-12b-q4 and 5 to 55 on
llama-3.1-8b-q8, and the thinnest pages here are now the four largest models, at 11 to 16. Straight to main. Verified: 452
tests, typecheck clean, the full build with build:functions, 320 pages every guard passing, 321 of 321 dated with those 170
moved, five read rendered, and 22 mutations of the new `checkModelCountScope()`, 20 stopping the build and 2 unobservable; it
caught two unscoped description counts on its first run. Watch: Beam is out, Apache 2.0, every field citable but the index
version, and its one four-bit build is NVFP4 at 293.63 GB, which nothing here with room for it runs. Next: the backlog.

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
