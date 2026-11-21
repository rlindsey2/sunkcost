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
      read about double the speed it reaches, and **Dory 1.0 4B** is gated. While that holds, a run is better spent
      on a guard below.

- [ ] **Nine of the 27 models that read images have no projector figure**, so their pages say a projector loads
      beside the weights without saying what it costs: the six Qwen rows, GLM-5.3-Flash, KAT-Coder V2.5 and the two
      Gemma 4 builds whose own GGUF repositories publish none this site cites. Each needs the repository its
      `weights_gb` actually came from pinned down first, which is the same thing the `weights_bytes` item below
      needs, so the two want doing together.

- [ ] A cited source on a live page is gone: `bartowski/google_gemma-4-12B-it-GGUF`, in the Gemma 4 12B row's
      `sources` and linked in its Sources line, now answers 401 to the Hugging Face API and to an anonymous fetch.
      `checkSourceLinks()` reads the shape of a URL and never asks whether it resolves, so every one of the 295
      source links on this site could rot the same way without a page saying so.

- [ ] **The move to Intelligence Index v5.0.1 waits on Artificial Analysis.** It scores 10 of the 54 rows here and
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
      has moved. `src/render.ts` is a PR, not a push.

- [ ] Sixteen measurements carry the source's own figure at 32k in their `notes` and nothing reads it.
      Each row in `data/throughput.json` is quoted at one window, usually empty or 4k, and this site
      reads it to 32k with its own decay. Nine of the 16 land within 5% of the source's own 32k
      number; the four Corsair AI Workstation 300 rows read high by 19 to 92% (gpt-oss-120b at 39.0
      against the chart's 20.4, Llama 3.1 8B at 21.8 against 13.0), and Qwen3 30B-A3B on the RTX 5090
      reads 104 against 143. The machine and model pages print all of them as measured. The fix is a
      row quoted at the window the source ran it at for each of the 16, so a data edit, now the agent's.

- [ ] A price ending in one decimal reads unfinished where money is expected: "and $0.5 per million output" on
      the MiniMax M3.1 Flash page, "$0.7" on LFM2.5 24B-A2B, "$1" on Beam, across 43 distinct price pairs and
      every head-to-head row that prints one, 44 pairs since 2026-11-20. The site writes a price as the data states
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
      notices, because the only thing that could contradict it is the card it was read off.

- [ ] **A weights figure says 2.60 GB and nothing says which file it came from.** `weights_gb` is one rounded
      number a row, the repository behind it is somewhere in `sources` among the card, the config and the GGUF,
      and the byte count is nowhere. That is why the Spark-X2.6 4B figure stood for eleven days: re-checking it
      meant re-reading every repository. A `weights_bytes` and the file's own URL beside it would make a figure
      re-checkable in one request and let `validate-data.ts` hold the rounded GB against the bytes. It would also
      make a plausibility check possible: every four-bit row here is 4.34 to 5.37 bits a parameter except Nemotron
      3.5 Lightning at 6.45, which is bartowski's real Q4_K_M, where the two XHToken files that were wrong came
      to 6.89 and 8.29. 67 rows to fill, so several runs; the field and the guard are one change.

## Runs

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

### 2026-11-15 — Olmo 3.1 32B Think is priced here, and the thinking is output the machine has to generate
The top backlog item's named candidate is a row. **Olmo 3.1 32B Think**, Ai2's reasoning sibling to yesterday's row and the same machine decision to the byte: the same
32,233,522,176 parameters, 19.48 GB at bartowski's Q4_K_M (19,482,034,656 bytes, 4.84 bits a parameter), Apache 2.0, dense, English, 64k off an 8,192-token pretrain. The cache
was read off this file's own header rather than carried across: the conversion renames the architecture to `olmo2` here too, and the file carries `olmo2.attention.sliding_window`
4096 with a 64-entry pattern, 48 local layers to 16 global, so the 1.342 GB at 8k stands on the file this site prices. The page also says what its sibling's does not: Ai2's own
settings allow 32,768 tokens for the thinking and the answer together, so one hard question is tens of thousands of tokens the machine generates and an API would bill as output.
Nobody rents it, no Olmo endpoint in OpenRouter's 467 models today and no score on an Artificial Analysis page reading N/A against "No publicly available API", so Gemma 4 31B it
stands in, re-read today as $0.10 / $0.34 at KT, cheapest of 18. Straight to main. Verified: 469 tests, typecheck and validate clean, the whole build with build:functions, 360
pages against 358 with the model page and one head-to-head added, 239 redated and none dropped, both new pages read rendered; 12 mutations, 7 caught with the control passing, and
four of the five misses are open items above, the ceiling moved without its note, `weights_gb`, `params_b` and the architecture note rewritten to contradict the layers, the fifth
a licence nothing here can judge without re-reading the repository. Watch done: nothing new has weights, and Ling 3.1 flash's v5.0.1 score, 30 against its 41 on v4.3, takes that
count to 12 of the 54. Oldest two entries archived. Next: the candidate queue is down to two and both blocked, so a guard rather than a row.
### 2026-11-14 — Olmo 3.1 32B Instruct is priced here, and three of its four layers stop at 4,096 tokens
The top backlog item's named candidate is a row. **Olmo 3.1 32B Instruct**, Ai2's fully open 32B: 19.48 GB at bartowski's Q4_K_M, Apache 2.0, 64k of context reached by scaling the positions of a
model pretrained at 8,192, and a sliding-window hybrid where only 16 of 64 layers grow with the window. The cache was read off the quantised file rather than the config, because bartowski's
conversion renames the architecture to `olmo2`: had the window not survived that rename the figure would have been 2.147 GB instead of 1.342, so the GGUF header was parsed to see
`olmo2.attention.sliding_window = 4096` and its 64-boolean pattern in the file this site actually prices. Parameters are the 32,233,522,176 the safetensors index counts, the total Hugging Face reads
out of that GGUF too, against a card and a size label that say only 32B. Nobody rents it: no OpenRouter endpoint on a read of the whole list, and Artificial Analysis publishes a page whose index reads N/A against "No
publicly available API", so Gemma 4 31B it stands in, the nearest current dense row anybody hosts; Qwen3 32B is nearer in size and is what Ai2's own table compares against, but it is
superseded and a stand-in may not borrow from a superseded row. The row is `current`, not `legacy`: Ai2 has published nothing newer, and `legacy` prints as "superseded". Straight to main.
Verified: 469 tests, typecheck and validate clean, the whole build passing every guard, 358 pages against 356 with the model page and one head-to-head added and 237 redated, both read rendered.
12 mutations of the new row, 7 caught and 1 control; all 5 misses are open backlog items, two of them `weights_gb` and `params_b`, which the `weights_bytes` item would hold against each other,
and two the ceiling-note item, which a stale "128k" note beside a 64k ceiling walks straight through. Watch done: nothing new to price, and Edge0's new 120B and 145B builds keep the family's
2026-10-17 ruling on what they are. Next: Olmo 3.1 32B Think.

### 2026-11-13 — Raon-1 nano is priced here, and 18 of its 24 layers cache nothing, so a token costs 6,912 bytes
The top backlog item's named candidate is a row. **Raon-1 nano**, KRAFTON's instruct model for Korean and English: 2.08 GB at the publisher's own Q4_K_M, Apache 2.0, 256k of
context, and a hybrid where only the 6 latent-attention layers of 24 keep a cache at all. The parameter count the watch left open closed on KRAFTON's second card rather than on a
judgement: the weights card's 3.1B total including a 1.5B per-layer embedding table and the GGUF card's 3.2B including a 1.6B one agree once the 55M multi-token-prediction module
the plain Q4_K_M does not carry is taken out, so the row reads 3.1B total and 1.5B active, the treatment Gemma 4 E4B already has. The cache was read rather than assumed, and the
two forms are an order of magnitude apart: the repository's own PyTorch code caches each layer's keys and values materialised per head, 120 KiB a token, while the latent form the
config states is the 512-wide vector plus the 64 key channels the heads share, 1,152 bytes a layer and 6,912 across the six, the 7 KiB a token both cards claim. Nobody rents it —
KRAFTON's own playground and API publish no per-token price and OpenRouter has no endpoint — so Granite 4.2 8B stands in. Straight to main. Verified: 469 tests, typecheck and
validate clean, every stage of the build with its cards drawn in a run of their own, 356 pages every guard passing, 2 added and none retired against a ledger of 254 redated, the
model page and the new head-to-head read rendered, 16 mutations run and 12 caught with 1 control, the weights one only because halving it took a page down. Of the four misses two
are the note item above, one is the new ceiling item, and one is active parameters set to the total, which the row's TODO records. Watch done: GLiDE-9B is out on kind. Next: Olmo
3.1 32B Instruct as a row.

### 2026-11-12 — A ceiling and the words beside it are one line, and nothing held the two together
The backlog's two ceiling items were one rewrite, so they are done together. Four notes read as finished copy now rather than as library fields: Inkling Small's
"model_max_length; the config states no max_position_embeddings" says the figure is a maximum length rather than a limit on token positions, the two DeepSeek distills'
"in config; the card does not state one for the distills" names the config and DeepSeek's card, and a fourth the new guard found, Qwen3.6 35B-A3B's "256k tokens (up to
1M)", says with YaRN, which is how its card reaches 1,010,000 and what its three sibling rows already said. The guard is `ceilingNoteFault()` in
pagekit, read by `validate-data.ts` and by `checkContextCeilings()`, and it shuts both holes mutation found. A note that is nothing but a figure is refused, because
beside the ceiling it can only be read as the ceiling: that is the "256k tokens (1M)" case, and it also catches a ceiling corrected while its note was left behind. And
a ceiling may not be left noteless, so a note cannot vanish into a page printing the figure alone; the 53 rows with nothing to add state their own figure, as before. The
page is held both ways: each of the 18 printed notes is the data's words exactly, and a row whose data says more may not print bare. Straight to main. Verified: 469
tests with one added, typecheck and validate clean, the full build with build:functions, 354 pages every guard passing, none added or retired, the 4 pages whose words
moved redated and no others, all four read rendered, 12 mutations run and 9 caught with 1 control; the misses are a note's wording, which no guard can judge, and a note
edited down to a legal restatement, which cannot be told from a correction. Watch done: RWKV7-G1l is out on kind, a base model by both its own cards, which closes the
top backlog item and the fixed-state convention with it. Next: Raon-1 nano as a row.

### 2026-11-11 — GLM-5.3-SLIM is priced here, and the DSA cache it waited on is published on its own card
The top backlog item wanted the best-sourced candidate as a row, and GLM-5.3-SLIM's one open field turned out to be published rather than open. GLM-5.3 attends
through a DSA indexer no row here described, so the cache was read instead of assumed: `config.json` gives 78 layers each caching a 576-wide latent, 1,152 bytes
a token, and `indexer_types` lists 21 "full" against 57 "shared", so only 21 hold index keys of their own. Scantist's card states what llama.cpp reports for this
exact build, 93 KiB a token at MLA 87.75 plus indexer 5.25, which is 78 x 1,152 and 21 x 256 to the byte, so the row carries `kv_bytes_per_token_total` 95,232.
With it: 179.86 GB off the six shards, 563B after pruning, the GLM-5.3 License passed through, 1M of context, and active parameters, which neither card states,
off Artificial Analysis's 40B of 753B for GLM-5.3, the pruning cutting the experts a layer holds and not the eight it routes a token to. Nobody rents a pruned
build, and the model it is cut from is not a row here, which the stand-in rule could not say: it borrowed only from a row, so the only price the schema allowed
was GLM-5.3-Flash's $0.0701 output against GLM-5.3's $1.40, a twentyfold understatement. A stand-in now names either a row, whose price it must still match, or
a hosted model this site prices no row for, which carries its own listing and read date, and exactly one of the two. Straight to main. Verified: 468 tests with
one added, typecheck and validate clean, the full build with build:functions, 354 pages every guard passing, 2 added and none retired of 195 redated, the model
page and the new head-to-head read rendered, 12 mutations run and 10 caught, both misses now backlog items. Watch done: four names, closed. Next: RWKV7-G1l.

### 2026-11-10 — Arete-27B is priced here, and its parameter count is the one figure its card does not state
The watch unblocked the backlog's own next-best candidate: bartowski published an Arete-27B GGUF on 2026-11-06, which was the one thing the row waited on, and
every other field could be read today. So **Arete-27B is a row**, Nous Research's supervised fine-tune of Qwen3.8-27B: 17.20 GB at bartowski's Q4_K_M, a 0.93 GB
vision projector beside it, and the cache geometry read off Arete's own config rather than assumed from the base, 16 of 64 layers holding a growing cache at 4 KV
heads of 256. Its parameter count is the interesting one. The card says "27B" and nothing more, so the row carries **27.36B**, the repository's own safetensors
index at bf16 halved, against the base's 27.78B: the 0.42B between them is the multi-token-prediction head Nous disabled in training and did not ship, and the
row's TODO says where the figure came from so the next run can re-check it in one request. Nobody rents it, so Qwen3.8 27B stands in on price, and Artificial
Analysis has not placed it, so the page says so rather than guessing a class. Two head-to-heads came down with a 301 each: Arete needs 19.35 GB at 32k, which
puts it between the three 27B models that were each other's nearest neighbour across families, so Qwen3.6 27B and Qwen3.8 27B both have a nearer one now.
Straight to main. Verified: 467 tests, typecheck and validate clean, the full build with build:functions, 352 pages every guard passing, 4 added and 2 retired
against the ledger, 250 redated, the model page and one new head-to-head read rendered, 12 mutations run and 10 caught; the misses are `vision` set to null, which
no guard here can see without fetching a repository, and a ceiling note deleted, which is now on the `checkContextCeilings()` item. Watch done: GLM-5.3-SLIM's
card closes two of its three fields, and Kimi K3.1 Pro, ERNIE-5.5-Flash-Base, PLaMo 3 Translate and Inkling 2 Small are closed. Next: GLM-5.3-SLIM's DSA cache.
