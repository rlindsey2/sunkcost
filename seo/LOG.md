# SEO log

Read this file and seo/SEARCH-CONSOLE.md before doing anything. The log before 2026-10-15 is in
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

- [ ] **Fifty rental prices were last read on 3, 9 or 15 September, and one of them had moved.** Today's
      re-read of Granite 4.2 8B found CoreWeave at $0.06 / $0.15 where the data said $0.06 / $0.25, a figure
      six rows divide by. Every pay-back on this site is a hardware price over a rental bill, so a stale
      price is a wrong answer on every page that prints one. Re-read the 50 off OpenRouter, in batches.

- [ ] **Add the watch's waiting candidates as rows, best-sourced first.** One model per run, with its model
      page and sitemap entry; seo/MODEL-WATCH.md has the figures and the open field for each. Nanbeige4.3 33B
      is next, then Reka Edge 2603. Dory 1.0 4B is blocked: its weights repository is gated as of 2026-10-28.

- [ ] Nine model pages have no head-to-head, and nothing about those models is the reason. All three pair rules
      — the ladder, the generation swap, the memory neighbour — are cut from `rankedModels()`, which keeps only
      the models the intelligence index has scored, so an unscored model is in no pair however well sourced it
      is. The memory rule needs no score: it pairs two models that ask a machine for the same memory, which is
      a footprint and a family name. Running that one rule over every model with a footprint would give the nine
      a page each, and the searches it answers are the ones the Search Console notes name.

- [ ] Artificial Analysis has moved to **index v4.3.2**, and all 63 rows here say v4.3. Every model page says "On
      the Artificial Analysis Intelligence Index v4.3 it scores N", out of `defaults.frontier_basis.name`, and
      the 50 scores under it were read on 2026-09-11. Nemotron 3.5 Bolt's, MiniMax M3.1 Flash's and Ling 3.1
      flash's were read on v4.3.2 pages and recorded as v4.3 so those rows do not claim a scale the rest are not
      on. The fix is to re-read the 54 scores off the leaderboard and move the basis with them, a data edit over
      every scored row.

- [ ] `checkContextCeilings()` lets a ceiling note contradict the ceiling it sits beside. It asks only that the
      bracket on the page be a substring of `max_context_note`, so setting Ling 3.1 flash's note to "1M" against
      its 262,144 ceiling builds clean and the page reads "256k tokens (1M)". Every one of the 15 notes that says
      more than the figure is a sentence nothing checks against the number in front of it.

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

- [ ] A price ending in one decimal reads unfinished where money is expected: "and $0.5 per million output" on
      the MiniMax M3.1 Flash page, "$0.7" on LFM2.5 24B-A2B, "$1" on Beam, across 43 distinct price pairs and
      every head-to-head row that prints one. The site writes a price as the data states it, with no padding to
      two places. The fix is in `src/format.ts`, which the calculator reads too, so it is a PR, not a push.

- [ ] A figure in prose that nothing reads back: each `architecture.note` is printed whole in the KV cache row
      of its model page, and three of them state what a full window costs ("the full 1M window costs about 145
      GB" on MiniMax M3.1 Flash, 39 GB on Beam and on Spark-X2.6 4B). Every other figure on these pages is held
      to the fields beside it; these are not, so a note can outlive a correction to the architecture it
      describes. The guard is small: read a GB figure out of a note that names a window and check it.

## Runs

### 2026-10-28 — LFM3 1.7B is priced here, and reading its stand-in's price found one that had moved
The top backlog item wanted the best-sourced candidate as a row, and LFM3 1.7B went ahead of Dory 1.0 4B because Dory's weights repository answers
`Invalid username or password` today, so its architecture cannot be re-read; only its GGUF is still open. Every LFM3 figure was read today: 1.10 GB of
Q4_K_M off Liquid's own GGUF file list, 24 layers split 13 gated short convolutions, 5 sliding attention at a 256-token window and 6 global, at 4 KV
heads by 128, off `config.json` and said again in words on the card, 1,728,801,536 parameters off the safetensors index, 262,144 tokens and LFM Open
License v1.0 off the card. It is the smallest download this site prices, 1.10 GB against LFM2.5 2.6B's 1.67, and only the 6 global layers grow, so its
whole 256k window costs 3.2 GB of cache and all 56 machines hold it there. Artificial Analysis 404s on it, so the score is `null` with a TODO and no
pair rule reaches it, hence no head-to-head. Nobody rents it either, so the row stands in at Granite 4.2 8B as the five other small models here do — and
re-reading that price moved it: CoreWeave serves Granite at $0.06 / $0.15 against DeepInfra's $0.06 / $0.25, cheaper on both sides, so the Granite row
and its five stand-ins went with it. That the price had been stale since 9 September is the new top backlog item above. Straight to main. Verified: 453
tests, typecheck and validate clean, the full build with build:functions, 333 pages every guard passing, 1 added and 252 redated with none dropped, the
new page and LFM2.5 2.6B's read rendered, eight mutations of the row all caught by validate. Next: Nanbeige4.3 33B, above.

### 2026-10-27 — Ling 3.1 flash is priced here, and the Ling family's cache goes on the latent path its data asked for
The top backlog item wanted the best-sourced candidate as a row, and Ling 3.1 flash went ahead of Reka Edge 2603 because the one thing holding it back, a
GGUF, has been out since 15 October. Every figure was read today: 357.97 GB of Q4_K_M over 10 shards off bartowski's file list, 72 layers at
`layer_group_size` 8 with `kv_lora_rank` 512 and `qk_rope_head_dim` 64 off `config.json`, 560B with 25B active and MIT off the card, 41 off Artificial
Analysis, and $0.075 / $0.225 off OpenRouter, an exact match and the cheapest of two endpoints. The card's "63 KDA + 9 Gated MLA" is settled by the
modelling code, where a layer is full attention when `(layer_idx + 1) % layer_group_size == 0`, so nine of the 72 cache the whole context at 1,152 bytes a
layer and the other 63 keep a state of a fixed size: 0.3 GB at 32k against 358 GB of weights. Two calls are made on the page: the ceiling is the config's
262,144 with the note saying the card says 1M, and the build priced is the family's own four-bit, which costs nothing because the memory step below 384 GB
usable is 192, so every build down to IQ2_M at 213.03 GB is held by the same two 512 GB Macs. That architecture is the two Ling 3.0 rows' too, and their
data carried a TODO to read `kv_lora_rank` and switch; both are on it now, so Ling 3.0 flash's cache goes 0.94 to 0.066 GB per 8k and the machines holding
it at 256k go 6 to 17. Five head-to-heads the pair rules re-sorted away are in `RETIRED_PAGES` with 301s. Straight to main. Verified: 453 tests with one
repointed at a model whose cache still separates two machines, typecheck and validate clean, the full build with build:functions, 332 pages every guard
passing, 6 added and 5 retired with 214 redated, four pages read rendered, four mutations of the row caught by validate and a fifth that was not, which is
the new backlog item above. Next: Dory 1.0 4B, above.

### 2026-10-26 — Ornith 1.5 122B is priced here, and the Qwen it is post-trained from settles two of its fields
The top backlog item wanted the best-sourced candidate as a row, and every figure was read today off the sources: 75.84 GB of Q4_K_M off Ornith's own GGUF
file list, 48 layers with 12 of them full attention and the other 36 linear, at 2 KV heads by 256, off `text_config`, 125,086,497,008 parameters off the
safetensors index, MIT and 256k off the card. Two open fields were settled by the base rather than left null: Qwen3.5 122B-A10B's config matches this one on
every architecture field and its index gives the same count to the digit, and its card states "122B in total and 10B activated", so `active_params_b` is 10.0
from the base, not from the name, and the price is a stand-in on the same basis, Qwen3.5 122B-A10B at $0.26 / $2.08, re-read today as the cheapest of four
endpoints. Nobody on OpenRouter serves Ornith at any size. The build priced is Ornith's own four-bit rather than unsloth's UD-Q4_K_XL at 79.71 GB, following
the family's other two rows; the same 17 machines hold either build, so nothing hangs on it. Artificial Analysis 404s on it as on the other two Ornith models,
so the score is `null` with a TODO and no pair rule reaches it, hence no head-to-head. The page reads finished: 17 of the 56 machines hold it at 32k, the
cheapest a Framework Desktop, 128GB at $3,449 and 21 tok/s, 53 years to pay back, its whole 256k window 6.4 GB of cache, 26 pages linking in. Straight to
main. Verified: 453 tests, typecheck and validate clean, the full build with build:functions, 331 pages every guard passing, 1 added and 201 redated with none
dropped, the model page read rendered, six mutations of the row all caught by validate. Next: Reka Edge 2603, above.

### 2026-10-25 — MiniMax M3.1 Flash is priced here, and the sparse-attention cache it keeps is counted
The top backlog item wanted the best-sourced candidate as a row, and every figure was read today off the sources: 249.40 GB of UD-Q4_K_XL over seven shards
off unsloth's GGUF file list, 60 layers with every one of them full attention, at 4 KV heads by 128, off `text_config`, about 428B with 23B active and 1M off
the card, 43 off Artificial Analysis, and $0.09 / $0.50 off OpenRouter, the cheapest of thirteen endpoints and an exact match. The cache was the figure that
needed finding. MiniMax Sparse Attention keeps the whole context and reads 16 blocks of 128 tokens of it, so it buys arithmetic and not memory; on top of the
2,048 B each token costs in the main cache it leaves an index key, which vLLM sizes at one vector per token, one head, 128 wide, bf16, so 256 B more. That is
2,304 B a layer, 4.5 GB at 32k and 145 GB at the full 1M, and the 145 puts the whole window past the 384 GB both 512 GB Macs hand a model, where the main
cache alone would have fitted it. All three calls the watch held are made on the page: the four-bit build is priced, following Beam, since nothing else here
holds it at any window; the licence was read and the row names it, the MiniMax Community License, non-commercial until you send notice; and the vision side
is text-only, with its 1.74 GB encoder named as a download the page does not price. Straight to main. Verified: 453 tests, typecheck and validate clean, the
full build with build:functions, 330 pages every guard passing, 2 added and 187 redated with none dropped, the model page and the new head-to-head read
rendered, five mutations of the row all caught by validate. Two findings are new backlog items above. Next: Ornith 1.5 122B, above.

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
