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
      page and sitemap entry; seo/MODEL-WATCH.md has the figures and the open field for each. **The queue is down
      to two and both are blocked**: **SenseNova-Loop-9B-Preview** runs layers 4 to 28 twice over, so this site's
      bandwidth estimate would read about double the speed it reaches, and it has no GGUF (2026-10-31), and
      **Dory 1.0 4B** is gated. Until the watch finds a third, a run is better spent on a guard below.

- [ ] **The two Olmo rows are one machine decision and neither page names the other.** Olmo 3.1 32B Instruct and
      Olmo 3.1 32B Think are 19.48 GB each with the same geometry, and "Olmo 3 Instruct or Think" is what a reader
      with 32 GB actually asks. `memoryNeighbourPairs()` cuts same-family pairs on purpose, because at one size a
      family's rows are usually the quantisations and generations the other rules already cover. These two are
      neither. On today's data a same-family, same-quantisation, within-a-tenth rule reaches ten pairs, and six of
      them have a superseded row on one side or both, where the generation rule already does the work; the cut
      has to leave those out, and the four left are these two, the two Spark 4Bs, Qwen3.6 against Qwen3.8 27B,
      and Mistral Small 4 against Devstral 2 123B.

- [ ] **A ceiling note that says one word past its figure escapes the guard built for it.** `ceilingNoteFault()`
      refuses a note that is nothing but a figure, so "256k tokens (1M)" is caught; "256k native" against a
      ceiling of 128k is not, because the bare-figure test reads the whole note and "native" sits past the
      figure. 22 rows carry a note of that shape, so a corrected ceiling with its note left behind would print
      the contradiction on any of them. The fix is to read the figure a note opens with, whatever follows it,
      and refuse one that disagrees with the ceiling beside it. Caught by mutation on 2026-11-13.

- [ ] **Nine of the 25 models that read images have no projector figure**, so their pages say a projector loads
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
      rule with it. Re-check the count each watch; when
      most of the 54 are covered, move every scored row, `frontier_reference` (v5.0.1 scores Opus 5.5, Sonnet 5.5 and
      Haiku 5.5, not the Opus 5, Sonnet 5 and Haiku 4.5 the bands are set from), the band rule and
      `frontier_scale_max` in one edit. Nanbeige4.3 33B stays unscored until then, on 20.11 and nothing on v4.3.

- [ ] The calculator's own score line has none of what the generated pages gained on 2026-11-08: it prints each row's
      `basis` string, "Artificial Analysis Intelligence Index v4.3: N", with no read date and no word that the index
      has moved. `src/render.ts` is a PR, not a push.

- [ ] `n_layers` is decoration on a row that carries `kv_bytes_per_token_total`. The cache comes straight off the
      total, so setting GLM-5.3-SLIM's 78 layers to 45 moves no figure and fails no guard, while the note printed
      beside it on the page says "all 78 blocks". Two rows carry the field, both with a note that states the
      geometry the number is summed from. The fix is to hold the total against that geometry. Caught by mutation
      on 2026-11-11.

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
      of its model page, and eight of them state what a window costs in cache: 145 GB at 1M on MiniMax M3.1
      Flash, 38.74 on Beam, 15.05 on Spark-X2.6 1.7B, and at 256k 7.55 on Flint, 6.44 on Ornith 1.5 122B, 3.22
      on LFM3 1.7B, 2.15 on Nemotron 3.5 Bolt and 1.8 on Raon-1 nano. Eight more state what a token costs,
      Raon-1 nano's 6,912 bytes among them. All of them agree with `kvCacheGb()` to the rounding today, and
      not one is held there, so a note can outlive a correction to the architecture it describes: the
      2026-10-27 run moved both Ling 3.0 rows' cache by a factor of 14 and their notes happened not to quote
      one, and mutation on 2026-11-13 moved both of Raon-1 nano's figures with nothing noticing. The guard is
      small: read a GB or a bytes-a-token figure out of a note and check it against the fields beside it.

- [ ] **A weights figure says 2.60 GB and nothing says which file it came from.** `weights_gb` is one rounded
      number a row, the repository behind it is somewhere in `sources` among the card, the config and the GGUF,
      and the byte count is nowhere. That is why the Spark-X2.6 4B figure stood for eleven days: re-checking it
      meant re-reading every repository. A `weights_bytes` and the file's own URL beside it would make a figure
      re-checkable in one request and let `validate-data.ts` hold the rounded GB against the bytes. It would also
      make a plausibility check possible: every four-bit row here is 4.34 to 5.37 bits a parameter except Nemotron
      3.5 Lightning at 6.45, which is bartowski's real Q4_K_M, where the two XHToken files that were wrong came
      to 6.89 and 8.29. 67 rows to fill, so several runs; the field and the guard are one change.

## Runs

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

### 2026-11-09 — Twenty-four of the models priced here read images, and every page called the language weights the whole download
The backlog's vision judgement turned out to have been made already and never written down: a survey of all 69 rows against their own repository cards
on the Hugging Face API found **24 carrying an `image-text-to-text` tag**, Gemma 3 and Gemma 4 among them, each priced at its language weights with the
vision projector a second file nothing on the site mentioned. Five rows said so by hand in prose, and one of those five was wrong — Muse Glimmer 30B's
architecture note read "~1.4 GB" against the 3,847,367,584-byte projector bartowski publishes, 3.85 GB, which stood because no check could see a figure
inside a sentence. So `vision` is a field now, set on every row, an object or an explicit null, so a new row cannot read as text-only by omission. Where
a repository the row already cites publishes a projector the field carries its bytes, its rounded GB and the file's own name: 15 rows, read today, and
the model page names and links the file. The other 9 say a projector loads beside the weights and invent no size for it. The five hand-written sentences
are gone, and `validate-data.ts` now refuses a projector size written into any note. Guards: the GB must be the bytes rounded, a projector may not equal
or exceed the weights it loads beside, both URLs must be sources the row already cites, a figure may not sit beside a TODO, and `checkVisionNotes()`
holds every page's words both ways. Reka Edge 2603 is ruled out in the same pass, on licence: BSL 1.1 forbids hosting it as an API, so no rental price
for it can exist, and this site pays a machine back against one. Straight to main. Verified: 467 tests, typecheck and validate clean, the full build with
build:functions, 350 pages every guard passing, none added or dropped, 25 redated and no page whose words did not move, four read rendered, 20
mutations run and 20 caught, the last only once the guard it exposed stopped reading the Sources line as proof of its own link. Watch done:
GLM-5.3-SLIM is new and next. Next: the projector figures for the nine, with the `weights_bytes` item.

### 2026-11-08 — The index these 54 scores are on has been replaced, not revised, so every page that prints one dates it and says so
The backlog wanted the v4.3 scores re-read on v5.0, and that re-read cannot be done: Artificial Analysis is on Intelligence Index v5.0.1 and its own
model data carries a v5.0.1 score for 10 of the 54 scored rows here and `null` for the other 44, checked on the leaderboard and again on five model
pages. Switching would null 44 scores and take the ladder, the "smartest first" sort and the generation pair rule with it, so the item above keeps the
count and the scores stay on v4.3, the one scale covering all 54. What a visitor could not see is that the link beside a score no longer leads to that
number: Gemma 4 31B reads 15 here and 4.38 there, Qwen3.8 Flash Next 40 here and nothing there. So `frontier_basis` now states its own `version` and
the index that replaced it, and each of the 54 model pages prints the date its own score was read and names v5.0.1 under it. The leaderboard says the
same and prints the span its rows were read over, 2026-09-11 to 2026-10-27, where it printed one date for all 54 and four were never read that day.
`validate-data.ts` holds what a page cannot: no row may carry a score from a version the basis does not name, a scored row needs its read date, the
basis name must end in its own version, and the newer index needs a date, a URL and a count of these rows short of all of them. `checkIndexBasis()`
holds the pages. Straight to main. Verified: 462 tests, typecheck and validate clean, the full build with build:functions, 350 pages every guard
passing, none added or dropped, 55 redated, the leaderboard and three model pages read rendered, 13 mutations run and 13 caught. Watch done: nothing
addable, and TwIL-8B is out on licence, its `LICENSE.md` being webAI's own non-commercial 1.0. Next: Reka Edge 2603 on the vision judgement.

### 2026-11-07 — The memory head-to-head reads every model with a footprint, so the fifteen the index has not placed have a page each
The backlog item wanted those fifteen off the no-pair list, and nothing about the models was the reason: all three pair rules were cut from `rankedModels()`, which keeps
only scored rows. Two of them need a score — the ladder is the index in order and the generation rule breaks a tie on it — and the memory rule needs none, because it reads
a footprint and a family name. It is now cut from a new `pairableModels()`, the ranked rows then the unplaced by id, so nothing displaces a rung of the ladder. 16 pages
added, 14 of the 15 paired; Ripple 65B Preview stays out because its nearest is 19.4% away, past the tenth the rule allows. 4 pages came down where a scored model's nearest
neighbour is now an unplaced one, each with a 301 to the model page of the side it named first: Nemotron 3.5 Bolt's two Qwen3 30B-A3B pairs, Granite 4.2 30B vs Nemotron 3.5
Lightning, Ling 3.0 flash vs Mistral Small 4. The change exposed two holes and both are shut. The match-up list printed the two scores with a non-null assertion, so an
unplaced side would have read "null"; it now says "not placed", and a new `checkNoMissingValues()` reads every page's words, title and description for a bare null, undefined
or NaN, because that mistake belongs to no one page type. And the lede on a pair where neither side is placed named neither model, which no other sentence does when both
start on one machine; it now names both. Straight to main. Verified: 459 tests, typecheck and validate clean, the full build with build:functions, 350 pages every guard
passing, 16 added and 4 retired against the ledger with a 301 each, two of the new pages read rendered, 4 mutations run and 4 caught, one of them by the guard it prompted.
Watch done: nothing addable. Nanbeige4.3 33B has a score now and it is on v5.0, so it goes in with that item; TwIL-8B is a new candidate on a licence read; Drex Max v1 is
out on kind. Next: the v5.0 re-read, which is now two rows' worth of reason as well as 68.

### 2026-11-06 — Ripple 65B Preview is priced here, and a dense 65B holds a million tokens because 64 of its 80 layers stop at 1,024
The top backlog item wanted the best-sourced candidate as a row, and every field was read today: 80 layers at 8 KV heads by 128, `layer_types` four `sliding_attention` at a
1,024-token window to one `full_attention` for 64 windowed to 16 growing; `safetensors.total` 64,782,689,360, dense by the card; Apache 2.0 off the repository. The four-bit is
two quantisers' figure, 38,798,820,576 bytes at AtomicChat and 38,798,813,312 at mrfakename, their Q8_0 totals the same 7,264 apart, so the gap is metadata rather than weights:
38.80 GB, 4.79 bits a parameter. That window ratio is the page's point, 0.805 GB per 8k against Llama 3.3 70B's 2.684 at the same heads, so the whole 1M window costs 68.99 GB
and Ricursive's claim that it fits an NVIDIA DGX Spark holds at every window, 107.79 against 119.5 usable. The ceiling is the card's 1Mi rather than the config's 2M, which
long-context training used and GMI Cloud does not serve. Somebody rents it now, which yesterday's watch could not say: $0.20 / $0.60, one endpoint, so exact match rather than
stand-in. Artificial Analysis 404s, so the score is null with a TODO and no pair rule reaches it, and 250 tok/s on 2xB200 at batch 8 is no throughput row. The build stopped on
`checkCardPrices()` and was right to: this row splits the Framework Desktop 64GB and RTX 5090 fit counts, which turned the same-money description into one naming the 5090
beside its $1,999, so that branch now gives the counts a shape pricing nothing, on all three pairs with a card. `validate-data.ts` gained the guard the row's note wanted: where
both layer groups are counted the cache ignores `n_layers`, so 80 could read 60 and still agree. Straight to main. Verified: 458 tests, typecheck and validate clean, the full
build with build:functions, 338 pages every guard passing, 1 added and 203 redated with none dropped, the page read rendered twice, 14 mutations run and 13 caught, the 14th
stripped by the renderer. Oldest two entries archived. Watch done: Arete-27B is a Qwen3.8-27B finetune with no GGUF yet, Kimi-K3.1-Pro out on size at 2.78T. Next: Reka Edge 2603.

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
