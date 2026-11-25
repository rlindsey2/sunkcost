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
      page and sitemap entry; seo/MODEL-WATCH.md has the figures and the open field for each. **Read the older watch
      entries too.** Mellum2.1 Thinking sat there from 2026-10-13 as short of the fields its entry listed, and both
      were the stand-in price and the index score, which stopped being blockers on 2026-10-20; it went in on
      2026-11-21 with no new research. Kolibri 1, Reka Edge 2603, Apodex 1.1 Mini, MiMo-V2.6-Flash and
      Index-Translate-35B-A3B are entries from those same weeks and want the same read: an entry whose only gap is
      a judgement is addable now. **Of the recent queue, every candidate is blocked today.** **Whittle-Next-27B-A3B** (2026-11-16) is the one to re-read first: its figures
      are there and its cache is two kinds at once. **Maxwell-V1-Flash** and **Tencent Hy4-flash** both ship a
      four-bit file that needs an unmerged llama.cpp patch, and Hy4-flash's compressed indexer is not a geometry
      this site can state yet. **SenseNova-Loop-9B** runs its middle layers twice, so the bandwidth estimate would
      read about double the speed it reaches, and **Dory 1.0 4B** is gated. **The queue is not the only place a
      row comes from**: Mistral Medium 3.5 128B went in on 2026-11-23 having been addable for seven months, because
      this watch looks for what came out yesterday. Models this site should price and never looked at are worth a
      pass of their own, family by family against `data/models.json`, before a run falls back to a guard below.
      **Ternary Bonsai 2.5 27B is the candidate named next**, with Raon-1-mini behind it; both came out 2026-11-24 and
      both are read up in the watch entry of 2026-11-25 with their file sizes and their geometry. Bonsai 2.5 is the bigger
      of the two, because it supersedes a row here: adding it makes `ternary-bonsai-2-27b-q2` `legacy` and wants a 301, and
      the one open question is whether stock llama.cpp loads its `PQ2_0` as well as the `Q2_0` the README names.

- [ ] **Nine of the 27 models that read images have no projector figure**, so their pages say a projector loads
      beside the weights without saying what it costs: the six Qwen rows, GLM-5.3-Flash, KAT-Coder V2.5 and the two
      Gemma 4 builds whose own GGUF repositories publish none this site cites. Each needs the repository its
      `weights_gb` actually came from pinned down first, which is the same thing the `weights_bytes` item below
      needs, so the two want doing together.

- [ ] A cited source on a live page is gone: `bartowski/google_gemma-4-12B-it-GGUF`, in the Gemma 4 12B row's
      `sources` and linked in its Sources line, now answers 401 to the Hugging Face API and to an anonymous fetch.
      `checkSourceLinks()` reads the shape of a URL and never asks whether it resolves, so every one of the 295
      source links on this site could rot the same way without a page saying so.

- [ ] **The version the index has moved to wants re-reading before anything else here.** A model page read 2026-11-24
      states **v5.0.2**, where `frontier_basis.superseded_by` says v5.0.1, and that name is printed under the score on every
      page of a scored row, so the switch starts with the leaderboard's own current version.
      **The move to Intelligence Index v5.0.1 waits on Artificial Analysis.** It scores 10 of the 54 rows here and
      not the other 44 (read 2026-11-08, count in `frontier_basis.superseded_by`; Qwen3.8 Flash Next has one now too,
      found 2026-11-12, so the figure the leaderboard prints is a read that has aged rather than a count that is
      wrong), so switching would null 44 and take the ladder, the "smartest first" sort and the generation pair
      rule with it. **The open endpoint the count was read off is retired** (read 2026-11-20): `/api/v2/data/*`
      answers 410 and ended 2026-11-04, the replacement `/api/v2/language/models/free` answers 401 without a key, and the
      leaderboard page renders only 61 models. The reading left is model by model off each scored row's own
      `frontier_equivalent.url`, 54 fetches, which is a run of its own rather than a line in the watch. When
      most of the 54 are covered, move every scored row, `frontier_reference` (v5.0.1 scores Opus 5.5, Sonnet 5.5 and
      Haiku 5.5, not the Opus 5, Sonnet 5 and Haiku 4.5 the bands are set from), the band rule and
      `frontier_scale_max` in one edit. Nanbeige4.3 33B stays unscored until then, on 20.11 and nothing on v4.3.

- [ ] The calculator's own score line has none of what the generated pages gained on 2026-11-08: it prints each row's
      `basis` string, "Artificial Analysis Intelligence Index v4.3: N", with no read date and no word that the index
      has moved. One more line in the same file belongs in the same PR: the memory-fit line writes the cache formula
      "over `n_layers` layers", which on Inkling 2 Mini is 24 where the cache is summed over 48 layer evaluations;
      `cachedLayerSlots()` is the figure it wants. `src/render.ts` is a PR, not a push.

- [ ] **A head-to-head still says a row is unplaced where the index has placed it on a later version.** The model
      page prints the row's own basis since 2026-11-23, so Inkling 2 Mini, Nanbeige4.3 33B and Mistral Medium 3.5 all
      say on their own pages that Artificial Analysis scores them on v5.0.1. The head-to-heads do not: the lede reads
      "has not been placed on it" and the table cell "not placed", over 109 pages. The sentence cannot carry the whole
      basis without bloating every one of them, so the fix is a shorter form of it, in `build-pages.ts`. Counted 2026-11-25
      off the built pages: 28 print that lede and 8 of them name a row the index has placed on a later version, 5 of the 8
      Ling 3.2 air's, whose new family neighbour added one more.

- [ ] Sixteen measurements carry the source's own figure at 32k in their `notes` and nothing reads it.
      Each row in `data/throughput.json` is quoted at one window, usually empty or 4k, and this site
      reads it to 32k with its own decay. Nine of the 16 land within 5% of the source's own 32k
      number; the four Corsair AI Workstation 300 rows read high by 19 to 92% (gpt-oss-120b at 39.0
      against the chart's 20.4, Llama 3.1 8B at 21.8 against 13.0), and Qwen3 30B-A3B on the RTX 5090
      reads 104 against 143. The machine and model pages print all of them as measured. The fix is a
      row quoted at the window the source ran it at for each of the 16, so a data edit, now the agent's.

- [ ] A price ending in one decimal reads unfinished where money is expected: "and $0.5 per million output" on
      the MiniMax M3.1 Flash page, "$0.7" on LFM2.5 24B-A2B, "$1" on Beam, across 33 of the 79 rows and
      every head-to-head row that prints one, on 22 distinct pairs, counted 2026-11-23. The site writes a price as the data states
      it, with no padding to two places. The fix is in `src/format.ts`, which the calculator reads too, so it is a PR, not
      a push. One more line in the same file belongs in the same PR: `sourceKind()` tells two links to one repository
      apart only where the path matches a known marker, so a row citing a repository's README or its KNOWN_ISSUES.md
      beside the repository itself prints the same name twice in its Sources line, which is why this row cites neither.

- [ ] A figure in prose that nothing reads back: each `architecture.note` is printed whole in the KV cache row
      of its model page, and eight of them state what a window costs in cache: 145 GB at 1M on MiniMax M3.1
      Flash, 38.74 on Beam, 15.05 on Spark-X2.6 1.7B, and at 256k 7.55 on Flint, 6.44 on Ornith 1.5 122B, 3.22
      on LFM3 1.7B, 2.15 on Nemotron 3.5 Bolt and 1.8 on Raon-1 nano. Eight more state what a token costs,
      Raon-1 nano's 6,912 bytes among them. All of them agree with `kvCacheGb()` to the rounding today, and
      not one is held there, so a note can outlive a correction to the architecture it describes: the
      2026-10-27 run moved both Ling 3.0 rows' cache by a factor of 14 and their notes happened not to quote
      one, and mutation on 2026-11-13 moved both of Raon-1 nano's figures with nothing noticing. The guard is
      small: read a GB or a bytes-a-token figure out of a note and check it against the fields beside it.
      Mutation on 2026-11-21 walked through it again: the new Mellum row's note says a token costs 2,048 bytes, and
      doubling that to 4,096 left validate and all 371 pages passing. Two more misses from that run belong with it.
      `full_attention_layers` plus `sliding_window_layers` is refused above `n_layers` and not below, so raising
      this row's 28 layers to 32 against 7 and 21 passed; a row with linear or recurrent layers truthfully counts
      short, which is why it is one-sided, and the guard wants the shape that has none. And nothing holds
      `active_params_b`: setting this row's 2.5 to its full 12.15 moves every speed figure on its page and no check
      notices, because the only thing that could contradict it is the card it was read off. Mutation on 2026-11-22
      added two of the same shape: Inkling 2 Mini's `loop_layers` and `loop_passes` only widen the ceiling the caching
      counts are held against, so 12 layers at 3 passes reading 13 or 4 passes leaves validate and all 372 pages clean
      while the note printed beside the cache goes on saying twelve layers three times over 48 slots. Both figures are
      in that note, which is what a note-figure guard would read.

- [ ] **A weights figure says 2.60 GB and nothing says which file it came from.** `weights_gb` is one rounded
      number a row, the repository behind it is somewhere in `sources` among the card, the config and the GGUF,
      and the byte count is nowhere. That is why the Spark-X2.6 4B figure stood for eleven days: re-checking it
      meant re-reading every repository. A `weights_bytes` and the file's own URL beside it would make a figure
      re-checkable in one request and let `validate-data.ts` hold the rounded GB against the bytes. It would also
      make a plausibility check possible: every four-bit row here is 4.34 to 5.37 bits a parameter except Nemotron
      3.5 Lightning at 6.45, which is bartowski's real Q4_K_M, where the two XHToken files that were wrong came
      to 6.89 and 8.29. 67 rows to fill, so several runs; the field and the guard are one change.

## Runs

### 2026-11-25 — LingSante-3.1-air-VL is priced here, and the 256k on its card is a flag the file does not carry
`lingsante-3.1-air-vl-q4` is in `data/models.json`: Ant Group's healthcare team's multimodal mixture of experts, built on Ling 3.0 flash VL, MIT, 124B total and 5.5B active, text
and images. The watch left one field open, its layer geometry, and it was read off the first `Q4_K_M` shard's own GGUF metadata rather than inferred: `head_count_kv` is 1 on layers
5, 11, 17, 23, 29, 35 and 41 and 0 on the other 35, `kv_lora_rank` 512 and `rope.dimension_count` 64, so 7 layers cache 1,152 bytes a token and 8,064 across the model, 0.066 GB per
8k, Ling 3.2 air's figure to the byte. The page's point is the window: the card says 256k, and its own launch command reaches that by overriding the config with YaRN at a factor of
two over the 131,072 `config.json` and the GGUF both count, so the ceiling is 128k and the note says why. 79 GB of weights (78,661,520,576 bytes over two shards, 5.04 bits a
parameter, stock llama.cpp b12600) carry 1.1 GB of cache at that full window. Nobody rents it among OpenRouter's 470, so the price stands in on Ling 3.0 Flash VL at $0.06 and
$0.18; two 404s at Artificial Analysis, so the score is null. Straight to main. Verified: 484 tests, typecheck and validate clean, the whole build with build:functions, 381 pages
every guard passing, 4 added and 1 retired with a 301 (Ling 3.0 flash against Ling 3.2 air, which this row now sits between at 78.92 GB), the model page and the family head-to-head
read rendered; 16 mutations, 8 caught and the control clean. All 8 misses are open items or named in earlier entries, among them the ceiling guard's blind spot of 2026-11-17,
reachable here because this is the first row whose note truthfully calls its figure the native window. Watch done; Ternary Bonsai 2.5 27B and Raon-1-mini are both read up and
near-addable. Next: the note-figure guard.

### 2026-11-24 — Ling 3.2 air is priced here, and its cache is Ling 3.0 flash's field for field
`ling-3.2-air-q4` is in `data/models.json`: inclusionAI's hybrid-linear mixture of experts, MIT, 124B total and 5.5B active, 256k of context, text, images and video. It
needed no new cache arithmetic: its geometry is Ling 3.0 flash's exactly, 42 layers in groups of six, 35 linear-attention to 7 gated latent, `kv_lora_rank` 512 and
`qk_rope_head_dim` 64, so a token costs 1,152 bytes in each caching layer and 8,064 across the model, 0.066 GB per 8k. The page's point: 80.39 GB of weights, bartowski's
three `Q4_K_M` shards (80,394,184,320 bytes, 5.03 bits a parameter) off stock llama.cpp b12600, against 2.1 GB of cache at the full 256k window, so the long window costs
nothing in machine where on most models this size it costs more than the download; the projector is 874,635,264 bytes. Nobody rents it, no endpoint among OpenRouter's 469
models, so the price stands in on Ling 3.0 Flash VL at $0.06 and $0.18, the model the card says it shares its architecture with. Artificial Analysis scores it 23 on
**v5.0.2**, not the v5.0.1 of three weeks ago, so the score is null and the basis says which; the test that held that sentence widened off the literal. Straight to main.
Verified: 484 tests with 1 widened, typecheck, validate and the whole build with build:functions clean, 378 pages every guard passing, 5 added and 2 retired with a 301 each
(GLM-4.5-Air's two Mistral neighbours, displaced at 80.65 GB), the model page and the family head-to-head read rendered; 18 mutations, 10 caught and the control clean, six
of the 7 misses backlog lines already (`n_layers` raised, `params_b`, `active_params_b`, two note figures, `vision` nulled) and the last a stand-in's own price, which
nothing here holds. Watch done; LingSante-3.1-air-VL's figures recorded. Two oldest entries archived. Next: the note-figure guard.

### 2026-11-23 — Mistral Medium 3.5 128B is priced here, and it had been addable for seven months
`mistral-medium-3.5-128b-q4` is in `data/models.json`: Mistral's flagship with downloadable weights, dense 128B, 256k of context, text and images, under a Modified
MIT licence whose only restriction is a $20M monthly revenue cap. Not a new model: published 2026-04-28, beside four Mistral rows already here including the Devstral 2
it replaces in Mistral's own coding agent, and this watch had never looked for it. The top backlog item now says to make a pass for that shape. Read today: `safetensors.total` 127,704,210,176, Unsloth's `Q4_K_M` at 74,897,139,136 bytes over three shards, 4.69 bits a parameter, off the quantiser the sibling
Mistral Small 4 row uses, and a 5,356,846,528-byte projector. The cache is the first shard's own GGUF metadata, 88 layers all caching the whole context, eight
key-value heads by 128, no sliding window, **2.953 GB per 8k**, so 256k costs 94.5 GB of cache against 74.90 of weights. The card's warning about a bad config is
real and misses these figures: the fix moved the YaRN term `mscale_all_dim` and nothing the cache reads, and these files went up the day after it. $1.50 and $7.50
at Mistral on OpenRouter, exact, the dearest rental here. Artificial Analysis scores it 5 on v5.0.1 and not v4.3, so the score is null and the basis says which, and
printing that basis was the precondition: `unplacedIndexNote()` puts a null-score row's own basis on its model page, which used to say "It has not been placed on
the intelligence index yet" against data saying the opposite, and Nanbeige4.3 33B's is corrected to the 20 v5.0.1 gives it. Straight to main. Verified: 484 tests, 1 added and 1
widened (the twentieth priced projector made "20 of" read as "0 of"), typecheck, validate and the whole build with build:functions clean, 375 pages every guard
passing, 3 added and none retired, six read rendered; 9 mutations, 7 caught, the misses `weights_gb` and `active_params_b`, both on the backlog.
Watch done: Kolibri 1.1 and sarvam-105b are new names, FP8 only on architectures nothing runs. Next: the note-figure guard.

### 2026-11-22 — Inkling 2 Mini is priced here, and the loop that ruled SenseNova out is a figure its own card states
`inkling-2-mini-iq4` is in `data/models.json`: Thinking Machines' 26.39B open multimodal mixture of experts, Apache 2.0, 1M of context, top of the trending feed.
It is a looped model, the shape that ruled SenseNova-Loop-9B out on 2026-10-31, and what makes it addable is that its own card prices the loop: the middle 12 of
its 24 layers run three times, and the publisher counts 3.4B parameters active in one pass against **5.4B effective a token**, so the speed estimate reads 5.4B of
26.39B rather than the doubled figure a nominal active count gives. Weights are ggml-org's own `IQ4_NL`, 17,627,940,768 bytes, 5.34 bits a parameter, published by
llama.cpp's own organisation and loading with no patch; the cache is the GGUF's own metadata, **eight growing slots and 40 windowed over 48 layer evaluations**,
0.436 GB per 8k, because every pass keeps its own. `loop_layers` and `loop_passes` are new fields, and `cachedLayerFault()` holds the two caching counts against
the slots those layers cache in rather than against the layer count. OpenRouter rents it at $0.075 and $0.30, exact; Artificial Analysis scores it 20 on v5.0.1 and
not on v4.3, so the score is null and the basis says which. Straight to main. Verified: 483 tests with 1 added, typecheck and validate clean, the whole build with
build:functions, 372 pages every guard passing, 3 added and 2 retired with a 301 each, the model page and a head-to-head read rendered; 16 mutations, 11 caught and
the control clean, the misses `weights_gb`, `active_params_b`, `vision` null and the two loop fields, which only widen a ceiling. Watch done: Inkling 2 Small's "no
weights" ruling has aged, its four-bit 354.15 GB of shards inside the 384 GB here. Next: the note-figure guard, now with the loop fields beside it.

### 2026-11-21 — Mellum2.1 Thinking is priced here, and it was blocked on nothing but a rule that had already gone
`mellum2.1-12b-a2.5b-q4` is in `data/models.json`: JetBrains's 12B coding mixture of experts, Apache 2.0, 2.5B active a token, 8.07 GB at the publisher's
own Q4_K_M (8,071,295,264 bytes, 5.31 bits a parameter) and 0.161 GB of cache per 8k off 28 layers where 7 grow and 21 stop at a 1,024-token window. Every
figure was re-read today off JetBrains's two repositories. It had sat in seo/MODEL-WATCH.md since 2026-10-13 as short of the fields its entry listed, and
both of those were the stand-in price and the index score: the two judgements Ryan handed over a week later, so the entry was stale rather than the model,
and the top backlog item now says to read the older watch entries for the same shape. Nobody rents it, no Mellum on OpenRouter's 476 models, and Artificial
Analysis has no page, so the price stands in on Qwen3.5 9B, the model JetBrains's own table compares it against; that row's price was re-read in the same
edit, $0.08 and $0.12 at DeepInfra, cheapest of 8 on both, and the reprice carried to the two rows that borrow from it. Straight to main. Verified: 482
tests, typecheck and validate clean, the whole build with build:functions, 371 pages every guard passing, 2 added (the model page and the Gemma 4 12B
head-to-head the memory rule cut) and none dropped, both read rendered; 19 mutations of the row, 13 caught and the control clean, the 6 misses now backlog
lines above. Watch done: Aion-1.0 has no quantised build, CCORE-Web-Coder is Q8 only, SenseNova-Loop's GGUF does not change its ruling. Two oldest entries
archived. Next: the note-figure guard, now with two more misses beside it.

### 2026-11-20 — A ternary build of Qwen3.8 27B puts a 27B model on a 16 GB machine
`ternary-bonsai-2-27b-q2` is in `data/models.json`, and it came from today's watch rather than the queue: PrismML's ternary conversion of Qwen3.8 27B,
Apache 2.0, 7.63 GB of weights against the 16.46 the four-bit build takes, which is the whole point of the row. The card says the architecture is
unchanged, so the cache is the Qwen3.8 27B row's own geometry and needed no new research; the figures are the Q2_0 file's 7,626,008,928 bytes and a
0.63 GB projector, both read off the repository today. Only that file loads in stock llama.cpp, from build b11556, and the page says so; the two
smaller ones beside it need PrismML's fork. OpenRouter rents the build itself at one endpoint, $0.075 and $0.50, so the price is exact rather than a
stand-in, and Artificial Analysis has not placed it, two 404s, so the score is null and the note carries the publisher's own benchmark pair instead.
Straight to main. Verified: 482 tests, typecheck and validate clean, the whole build with build:functions, 369 pages every guard passing, 3 added (the
model page and two head-to-heads) and none retired, all three read rendered; 9 mutations of the row, 9 caught, control clean. Watch done: four new
names out, and the endpoint the v5.0.1 count used to be read off is retired, which the backlog item now says. Next: the note-figure guard.

### 2026-11-19 — A cache figure for the whole model is held against the layers it is summed over
The backlog's `n_layers` item is done. Two rows state their cache as one figure for the whole model, because their layers do not cache alike, and `kvCacheGb()` reads
that figure and nothing else: GLM-5.3-SLIM's 78 layers could read 45 and no figure on this site would move, while the note printed beside the cache on its model page
still said all 78 blocks cache. `architecture.kv_layer_groups` now carries the geometry the figure was summed over, one group per set of layers that cache alike, and
`kvTotalGeometryFault()` holds three things: the counts have to account for every layer the row claims and no more; the widths have to multiply out to the total
exactly where a source states them; and the note's own whole-model figure has to read back as the total at the rounding it is written at. GLM-5.3-SLIM is 21 layers
at 1,408 bytes a token and 57 at 1,152, which comes to its 95,232 to the byte. DeepSeek V4-Flash is 21, 20 and 2 layers summing to its 43; its source states the
ratio each group compresses by and the 6,880 bytes a token the model comes to, not what a layer in one group costs, so those three widths are null with a TODO each.
Straight to main; nothing outside the guard reads the new field, so no page's text changed. Verified: 482 tests with 2 added, typecheck and validate clean, the whole
build with build:functions, 366 pages every guard passing and none added or dropped; 6 mutations, 5 caught with the control clean, the sixth moving a layer between
two DeepSeek groups whose widths no source states, which is the one shape this cannot judge and why those widths are null. Watch done: Marin-Mochi-535B-A23B is a
base model with BF16 only, Olala-v1.0-mini needs OVHcloud's own llama.cpp fork, Maxwell's port is still unmerged, v5.0.1 holds at 14 of 54. Next: the note-figure guard.

### 2026-11-18 — Sage S2.1 Flash is priced, and its config is GLM-5.3-Flash's field for field
`sage-s2.1-flash-q4` is in `data/models.json`: Shanghai AI Laboratory's 321B scientific multimodal model, MIT, 1M context, weights 193.81 GB as
mradermacher's static Q4_K_M over five parts (193,813,823,936 bytes, 4.83 bits a parameter) with a 0.65 GB `mmproj-Q8_0` projector beside them,
every figure read today off the repository, the GGUF listing or `config.json`. The cache needed no new research: Sage's config is GLM-5.3-Flash's
on every field the arithmetic reads, 45 layers with 11 sparse-attention, `kv_lora_rank` 512, `index_head_dim` 128, 288 experts with 8 running a
token and the same vision tower, so 0.139 GB per 8k and 18B active carry over and the page says so in words. Nobody rents it, on OpenRouter's 478
models and two 404s at Artificial Analysis, so the score is null with a TODO and the price is GLM-5.3-Flash's as a stand-in; that row's own price
was re-read in the same edit, $0.0399 and $0.0784 at Relace, cheapest of 42 active endpoints on both, against a 2026-10-29 pair whose endpoint is
cheapest on neither now. At 193.81 GB nothing still sold holds it, and the page opens on that. Straight to main. Verified: 480 tests, typecheck and
validate clean, the whole build with build:functions, 366 pages every guard passing, 2 added (the page and the Tencent Hy3 head-to-head the memory
rule cut, 192.90 GB against 194.37) and none dropped, both read rendered; five mutations of the row all caught, control passing. Watch done:
Hy4-flash and Maxwell-V1-Flash wait on an unmerged llama.cpp patch, Haru-4B is speech and out, v5.0.1 not advanced. Next: the `n_layers` item.

### 2026-11-17 — A ceiling note is read against the figure in front of it, whatever word follows
The backlog's ceiling-note item is done. `ceilingNoteFault()` now reads the figure a note opens with, whatever comes after it, and holds it against the ceiling printed
beside it: past the ceiling it is refused outright, since "128k tokens (256k native)" says the model reaches two lengths at once; below it, it has to call itself the
native window in so many words, which is the only reading on which a shorter figure beside a longer one is not the ceiling restated wrong. That keeps the four Qwen3 rows,
which say 32k natively under a config counting 40,960 positions, and refuses the shape a corrected ceiling leaves behind. The item's count of 22 was low: 72 of the 74
rows carry a note that opens on a figure, and the test moves every one of their ceilings to prove the note left behind says so. The shape it cannot judge is a ceiling
raised over a native figure, which is what those four rows truthfully have, and the function says so. Straight to main, and no visitor-facing text changed: the guard
refuses data rather than writing words, and every page's ceiling cell renders byte for byte as before.
Verified: 480 tests with 1 added, typecheck and validate clean, the whole build with build:functions, 364 pages every guard passing and none redated; four mutations,
all four caught with the control passing — raon-1-nano's ceiling halved and Olmo 3.1 Instruct's doubled with their notes left, and the guard's own two branches
dropped in turn. Watch done: Maxwell-V1-Flash is the top trending model and has a 20.79 GB four-bit file that only a patched llama.cpp loads, so not a row yet;
Lara-4-Mini-Base, BotPsy-0.8B and WVY-Blender-5m are out; SenseNova-Loop has GGUF now and still runs its middle layers twice; v5.0.1 reads 14 of 54.
Next: the `n_layers` item, the other guard a mutation walked through.

### 2026-11-16 — Two builds of one family at one size are a page, and on two of them nothing in the arithmetic separates them
The backlog's Olmo item is done, and as a rule rather than a pair. `familyMemoryPairs()` is the fourth head-to-head rule: each model against the one of its own family
nearest it in the memory it needs, within the same tenth the cross-family rule allows, where neither side is superseded and both carry one quantisation label. Four pages:
Olmo 3.1 32B Instruct against Think, the two Spark 4Bs, Qwen3.8 27B against Qwen3.6 27B, and Qwen3.6 35B-A3B against Qwen3-Coder 30B-A3B. The item's count of ten was a read
that has aged: the rule reaches seven today, three of them with a superseded side the generation rule says better, and Mistral Small 4 against Devstral 2 123B is 16% apart
once the cache at 32k is counted. Two of the four were the page to get right: the same file size to the byte, the same hosted model standing in on price and the same machine
paying for itself in the same time, which is twelve table rows of one figure printed twice. `modelFamilySection()` writes the sentence those two owe a reader and is written
only where every figure is level. Two sentences that were false on such a pair are fixed: the pay-back paragraph named a winner where the table printed a draw at all five
levels, and the memory section offered a speed and an API bill to weigh that were one figure twice. Reading those two off the printed cells rather than off the data
behind them turned up five existing cross-family pages wrong the other way, each now naming what does differ. `checkFamilyMemoryPairs()` holds the rule and the section both
ways; `checkTwoColumnClaims()` reads all 154 of those sentences back against the cells they are about. Straight to main. Verified: 479 tests with 10 added, typecheck and
validate clean, the whole build with build:functions, 364 pages every guard passing, 4 added and none retired of 48 redated, all four read rendered; 15 mutations, 11 caught
with the control passing, two inert on today's data and the last a repetition no guard can judge. Watch done: Whittle-Next-27B-A3B is a candidate, with a new quantisation
label and a cache that is two kinds at once; Supra2.5-Pro and DFM-Mimir are out; the v5.0.1 count holds at 12 of 54. Next: the ceiling-note guard.
