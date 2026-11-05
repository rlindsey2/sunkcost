# SEO log

Read this file and seo/SEARCH-CONSOLE.md before doing anything. The log before 2026-10-21 is in
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
      page and sitemap entry; seo/MODEL-WATCH.md has the figures and the open field for each. Ripple-65B-Preview is
      next, a dense 65B at 80 layers with 64 of them on a 1,024-token window, 8 KV heads by 128 and a 2M ceiling,
      with 38.80 GB of Q4_K_M that two community quantisers agree on; the publisher ships no GGUF of its own, so the
      judgement left is which four-bit to price, and the card itself still wants reading for the active-parameter
      and context claims. Reka Edge 2603 is behind it on a vision judgement. SenseNova-Loop-9B-Preview and RWKV7-G1l
      each need a judgement first, in the watch entry of 2026-10-31. Dory 1.0 4B is blocked: its repository is gated.

- [ ] Thirteen model pages have no head-to-head, and nothing about those models is the reason. All three pair rules
      — the ladder, the generation swap, the memory neighbour — are cut from `rankedModels()`, which keeps only
      the models the intelligence index has scored, so an unscored model is in no pair however well sourced it
      is. The memory rule needs no score: it pairs two models that ask a machine for the same memory, which is
      a footprint and a family name. Running that one rule over every model with a footprint would give the thirteen
      a page each, and the searches it answers are the ones the Search Console notes name.

- [ ] Artificial Analysis is on **Intelligence Index v5.0** now, read off the leaderboard on 2026-11-03, and all
      68 rows here say v4.3. Every model page says "On the Artificial Analysis Intelligence Index v4.3 it scores
      N", out of `defaults.frontier_basis.name`, and the 50 scores under it were read on 2026-09-11. v5.0 counts
      nine evaluations, among them Terminal-Bench 4.0 and FrontierCode 2.0, so it is a different scale rather than
      a revision of the old one and the scores will move. The fix is to re-read the 54 scores off the leaderboard
      and move the basis and `frontier_reference` with them, a data edit over every scored row.

- [ ] `checkContextCeilings()` lets a ceiling note contradict the ceiling it sits beside. It asks only that the
      bracket on the page be a substring of `max_context_note`, so setting Ling 3.1 flash's note to "1M" against
      its 262,144 ceiling builds clean and the page reads "256k tokens (1M)". Every one of the 16 notes that says
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
      of its model page, and seven of them state what a window costs in cache: 145 GB at 1M on MiniMax M3.1
      Flash, 38.74 on Beam, 15.05 on Spark-X2.6 1.7B, and at 256k 7.55 on Flint, 6.44 on Ornith 1.5 122B, 3.22
      on LFM3 1.7B and 2.15 on Nemotron 3.5 Bolt. All seven agree with `kvCacheGb()` to the rounding today, and
      not one of them is held there, so a note can outlive a correction to the architecture it describes: the
      2026-10-27 run moved both Ling 3.0 rows' cache by a factor of 14 and their notes happened not to quote
      one. The guard is small: read a GB figure out of a note that names a window and check it against the
      fields beside it.

- [ ] **A weights figure says 2.60 GB and nothing says which file it came from.** `weights_gb` is one rounded
      number a row, the repository behind it is somewhere in `sources` among the card, the config and the GGUF,
      and the byte count is nowhere. That is why the Spark-X2.6 4B figure stood for eleven days: re-checking it
      meant re-reading every repository. A `weights_bytes` and the file's own URL beside it would make a figure
      re-checkable in one request and let `validate-data.ts` hold the rounded GB against the bytes. It would also
      make a plausibility check possible: every four-bit row here is 4.34 to 5.37 bits a parameter except Nemotron
      3.5 Lightning at 6.45, which is bartowski's real Q4_K_M, where the two XHToken files that were wrong came
      to 6.89 and 8.29. 67 rows to fill, so several runs; the field and the guard are one change.

## Runs

### 2026-11-05 — Clover 35B-A3B Preview is priced here, and the speed block diffusion is quick at is not the speed this site estimates
The top backlog item wanted the best-sourced candidate as a row, and every field was read today: 40 layers with `layer_types` alternating three
linear-attention to one full-attention for 10 full-attention layers, 2 KV heads by 256 and 131,072 tokens off `config.json`; 34,661,350,848
parameters off the HF API against the card's "approximately 3B active"; Apache 2.0 and the Qwen3.6-35B-A3B base off the repository; and
22,998,009,248 bytes of DiffuSpace's own Q4_K_M, which its GGUF card states as both 21.42 GiB and 23.00 GB. That geometry is the Qwen3.6 35B-A3B
row's to the layer, so the cache is 0.168 GB per 8k and the price is that row's as a finetune, the way KAT-Coder's is: $0.05 / $0.70 at Darkbloom,
cheapest of 11 active endpoints on both prices, re-read today. Nobody rents Clover on either of two reads of OpenRouter's 454 and Artificial
Analysis 404s on it, so the score is null with a TODO and no pair rule reaches it. The judgement left was block diffusion, and the page answers it
rather than the estimate doing so: the launch blog's 680 tok/s on a GB300, 515 on an H200 and 101.8 at INT4 on a 16 GB RTX 5070 Ti are machines
this site does not price, and that card holds neither four-bit of this model, so the page keeps the bandwidth estimate and says in words what it
assumes, one pass over the active weights a token where a diffusion step can settle more than one. Straight to main. Verified: 458 tests,
typecheck and validate clean, the full build with build:functions, 337 pages every guard passing, 1 added and 227 redated with none dropped, the
page read rendered twice, 13 mutations of the row all caught. Watch done: Ripple-65B-Preview is new, well sourced and next.

### 2026-11-04 — Spark-X2.6 4B is re-priced at the four-bit three quantisers agree on, and every byte of the gap is accounted for
The top backlog item said no community four-bit of the 4B existed; three do, and they agree. `Q4_K_M` is 2,600,225,568 bytes at mradermacher, and
2,600,225,152 and 2,600,225,120 at ss-lab and prithivMLmods: within 450 bytes of each other and 1,216 of the 2.5's, which four quantisers publish at
2,600,224,xxx. Every repository's Q8_0 and bf16 of either model agrees to a kilobyte, so the weights themselves were never in question. Reading the two
GGUF headers accounts for the whole 0.94 GB and none of it is model: both say `general.file_type` 15, mradermacher's holds a tied `token_embd` at Q6_K
(0.275 GB), XHToken's one at BF16 (0.671) plus a second `output.weight` at Q8_0 (0.357), its 36 `attn_output` projections at Q8_0 rather than Q4_K (0.401
against 0.212) and its 36 `attn_gate` at BF16, which predicts 943,216,640 bytes against 943,215,744 observed. The row is 2.60 GB on the rule the 1.7B was
priced on, and the 2.5's 2.60 is held rather than moved, so the item's "re-price both" is one row re-priced and one confirmed. 21 pages changed with none
added or dropped, the five 16 GB machines and the twelve memory sizes among them, and the 4B's cheapest machine reads 30 tok/s where it read 24.
`validate-data.ts` gained the guard the figure wanted: weights that are not a positive number, where a zero had made an infinite tok/s. Straight to main.
Verified: 458 tests, typecheck and validate clean, the full build with build:functions, 336 pages every guard passing, both Spark pages read rendered,
seven mutations of the row caught and an eighth not, which is the note-figure item above. Watch done, nothing new. Next: Clover-35B-A3B-Preview.

### 2026-11-03 — Hy-Memory 30B-A3B is priced here, on 48 layers that cache the whole window and a four-bit two quantisers agree on
The top candidate is a row, every field read today: 48 layers at 4 KV heads by 128 with no sliding window and no linear layer in `config.json`, 262,144
tokens, 30,064,725,888 parameters off the HF API against the card's "~3B active", Apache 2.0 off the repository. Tencent's own Q4_K_M is 18,236,702,464
bytes and rapatsky's 18,236,702,240, so the 18.24 GB is two quantisers' figure rather than one publisher's, which is the check the Spark-X2.6 rows still
want. The cache is 0.805 GB per 8k, Qwen3 30B-A3B Instruct 2507's geometry to the layer: 3.2 GB at 32k against 25.8 at 256k, which moves the cheapest
machine that holds it from $1,269 to $1,700. Nobody rents it on either of two reads of OpenRouter's 453 today, and Artificial Analysis lists only Hy3
and Hy3-preview of Tencent's, so the score is null with a TODO and no pair rule reaches it, hence no head-to-head. It stands in at GLM-4.7-Flash, 31.22B
with 3B active against 30.06B and about 3B, re-read today as Cloudflare's $0.0605 / $0.40; the Qwen row is nearer on every field but it is previous
generation, which `tests/calc.test.ts` forbids a stand-in from borrowing. Straight to main. Verified: 458 tests, typecheck and validate clean, the full
build with build:functions, 336 pages every guard passing, 1 added and 231 redated with none dropped, the new page read rendered, 8 mutations all caught.
Watch done: nothing new with its own weights, and Artificial Analysis has moved to index v5.0, which the re-read item above now carries. Next:
Clover-35B-A3B-Preview, which has its publisher's own four-bit at 23.00 GB now and one judgement left, on block diffusion.

### 2026-11-02 — The sweep wording has its empty half, and the guard that read a count out of itself reads one out of nothing
The top backlog item wanted the mirror of the sweep sentence. `/hardware/` reads "on 54 of the 54 machines" today; the same prices the other way would
have read "on 0 of the 54" with "on the other 54" after it, and no guard stopped either half. Three writers turn a count into prose here and each had
words for the full end and a fraction for everything else, so all three have three shapes now: `swapSentence()` and `paybackSentence()` moved out of
`build-pages.ts` into `src/pagekit.ts`, where a test holds them at every count rather than at the one today's data reaches, and `countOfSet()` says
"none of the 50" where it said "0 of the 50". `checkSweepCounts()` is the guard the item named: it read every page's prose for a count divided by itself
and let one divided into nothing pass, so it now flags `0 of the N` and the clause that goes empty beside a sweep, "the other 0". Nothing a visitor
reads moved, 335 pages with no date changed, which is what a guard should cost. Straight to main. Verified: 458 tests, five new and pinning both
sentences at every count from 0 to 54, typecheck and validate clean, the full build with build:functions, 335 pages every guard passing, both paragraphs
read rendered, four mutations caught: each sentence's empty branch dropped at the count that reaches it, the sweep branch dropped so the fraction wrote
"54 of the 54" and "the other 0", and `countOfSet()`'s, which `checkModelCountScope()` caught first. Watch done: Tencent's Hy-Memory 30B-A3B is the new
front of the queue, citable on 48 layers at 4 KV heads by 128 and 18.24 GB of its publisher's own four-bit. Next: add it.

### 2026-11-01 — Spark-X2.6 1.7B is priced here, at the four-bit two quantisers agree on rather than its publisher's
The top backlog item wanted the best-sourced candidate as a row, and every figure was read today: 28 layers at 2 KV heads by 256 with a 512-token window
off `config.json`, the GGUF's own 28-boolean `sliding_window_pattern` settling the split at 21 windowed to 7 full, 1,707,657,216 parameters off the
safetensors index, 1,048,576 tokens and Apache 2.0 off the card. The open call was which four-bit to price, and the files answer it. Three publishers'
bf16 (3.42 GB) and Q8_0 (1.82 GB) of these weights agree to within a kilobyte; bartowski's Q4_K_M is 1.09 GB and mradermacher's 1.11, while XHToken's own
file at the same label is 1.77 GB, 97% of its own eight-bit. Its GGUF header says why: `general.file_type` 15, the Q4_K_M label, with `token_embd` left at
BF16 and a second `output.weight` at Q8_0, so 0.82 GB of that download is the vocabulary. The row is 1.09 GB, which edges LFM3 1.7B's 1.10 as the smallest
download here, and the page prints all three figures. Nobody rents any XHToken model, on either of two reads of OpenRouter's 452 today, so the row stands
in at Granite 4.2 8B, re-read as CoreWeave's $0.06 / $0.15; Artificial Analysis 404s on it as on both other Spark rows, so the score is null with a TODO
and no pair rule reaches it, hence no head-to-head. The same check found the 4B pair's 0.94 GB gap is mostly the quantiser, so the two sentences calling
it the model are reworded and re-pricing it is the new top backlog item. Straight to main. Verified: 453 tests, typecheck and validate clean, the full
build with build:functions, 335 pages every guard passing, 1 added and 246 redated with none dropped, the new page and the 4B's read rendered, 12 mutations all caught.

### 2026-10-31 — LFM2.5 2.6B is priced at Liquid's paid endpoint, and a free listing can no longer be a price
The top backlog item wanted the `$0 / $0` row off this page. Both slugs were read twice today, minutes apart: Liquid lists the model as
`liquid/lfm-2.5-2.6b` at **$0.35 / $0.50** with the full 128k context, and as `liquid/lfm-2.5-2.6b:free` at $0 capped at 64k. The paid one is the row,
exact-match, with the source line on the page saying which of the two it is and the capability note naming the free listing and its half window.
`validate-data.ts` now rejects a rental price of zero outright, and a negative with its own message: a bill of zero is a sum with no answer, and the
page had read "renting costs $0" and then "buying only beats that if you use it hard enough".
That guard made three sentences unreachable, every one written for this row. `/local-llm-vs-api-cost/` came to read "33 of the 33 models here pay the
machine back", which the sweep guard stopped the build over, and "On 0 the model is listed free, so there is nothing to beat", which it did not. Both
free clauses are gone and the count has sweep wording in a `paybackSentence()` the page and `checkTokenCost()` share, the shape `swapSentence()` set on
29 October. 15 pages changed, the best of them the ones that had said never: `/best/` lists it at 16 GB and the Llama 3.3 70B head-to-head goes from
"never pays for itself" to 53 years. Straight to main. Verified: 453 tests, typecheck and validate clean, the full build
with build:functions, 334 pages every guard passing, 15 changed with none added or dropped, four read rendered, five mutations caught: zero in each
price, a negative, the sweep wording dropped, the sweep claimed on the wrong count. Watch done, nothing new. Next: Spark-X2.6 1.7B, above.

### 2026-10-30 — Nanbeige4.3 33B is priced here, and its plain dense cache is what sets two cards furthest apart
The top backlog item wanted the best-sourced candidate as a row, and Nanbeige4.3 33B went first because its four-bit GGUF has been out since 25 October.
Every figure was read today: 20.79 GB of Q4_K_M off bartowski's file list, the most-downloaded GGUF of it; 52 layers at 8 KV heads by 128 off
`config.json`, with no `layer_types`, sliding window or expert fields, the plainest architecture this site prices; 33,118,977,024 parameters off the
safetensors index, all of them active; 524,288 tokens and Apache 2.0 off the card. The plainness is the page's point: every layer caches the whole
context, so the cache is 1.745 GB per 8k, three times Qwen3.8 27B's at a similar size and second only to Granite 4.2 30B's among the models a 32 GB card
holds. That makes it the widest headroom row on the R9700 against RTX PRO 6000 head-to-head, 32k against 256k, a ratio of 8 where nothing else beat 4.
Artificial Analysis 404s on it, so the score is `null` with a TODO and no pair rule reaches it, hence no head-to-head. Nobody rents it either, OpenRouter
listing no Nanbeige model on either of two reads, so the row stands in at Gemma 4 31B it, the closest hosted model dense the same way, 31.27B all-active
against 33.12B, re-read today as CoreWeave's $0.10 / $0.34; Laguna XS 2.1 is nearer in size but 3B of it runs per token, a cheaper thing to serve.
Straight to main. Verified: 453 tests with two repointed off facts this row changes, typecheck and validate clean, the full build with build:functions,
334 pages every guard passing, 1 added and 224 redated with none dropped, the page read rendered, eight mutations of the row caught. Next: Reka Edge 2603.

### 2026-10-29 — Every rental price on the site re-read, and three rows nobody rents any more
The top backlog item wanted the 50 stale prices read again off OpenRouter in batches; its endpoints API gives every provider's two prices for a model in
one request, so all 64 rows were read today instead, twice, an hour apart. The rule, written down because it picks the figure: of a model's endpoints, the
standard service tier only (a `flex` or `priority` tier is a different product at a different price) and active only, take the one cheapest on both prices;
failing that, the one cheapest at this site's own 15:1 mix, which happened once, on DeepSeek V4-Flash, whose source line says so. Twenty-two rows moved. The largest is Qwen3.8 27B, the model the calculator opens on, from $0.32 / $2.50 to $0.039 / $1.25 off Chutes, of 18
active endpoints; then GLM-5.3-Flash to $0.0513 / $0.0701, Nemotron 3.5 Lightning to $0.025 / $0.12, gpt-oss-20b to $0.018 / $0.09 and its two stand-ins
with it. Reading twice was the day's lesson: DeepInfra's Gemma 3 27B endpoint read deranked at 20:18 and active at 20:35, a third off that row's price.
Nobody rents **Qwen3 8B** or the **Llama-70B distill** at any price now, on either read, so they and the Qwen-32B distill are stand-ins, at Ministral 3 8B
and at gpt-oss-20b, the nearest current hosted model on the index each way. `/hardware/` had come to read "54 of the 54 machines that pay back at all", a
count out of itself, so the swap sentence has sweep wording and is written once for the page and its guard to share. Straight to main. Verified: 453 tests
with one widened off a single model, typecheck and validate clean, the full build with build:functions, 333 pages every guard passing, 292 redated with
none added or dropped, four re-priced pages read rendered, seven mutations of the new rows all caught. Next: Nanbeige4.3 33B, GGUF out since 25 October.

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
