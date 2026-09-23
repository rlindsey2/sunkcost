# Model watch

Last checked: 2026-09-23

New open models come out faster than this site notices them. This file is the daily check for
that: what was searched, what turned up, and what each candidate still needs before it can be a
row in `data/models.json`. It is the agent's memory of the watch, the way `LOG.md` is its memory
of everything else.

Run `npm run model-watch` first. It prints today's date against the one above, every model the
site already prices with its size and quantisation, and the fields a new entry carries. Nothing
in it writes anything.

## The rule that does not bend here

**No figure is ever invented, and this agent does not edit `data/*.json`.** A candidate below
carries the numbers a source states and the URL that states them; everything else is marked as
missing. Sunk Cost's whole claim is that its figures come from somewhere, and a model added from
a press release's rounding would cost more trust than a late model costs traffic.

Direct fetches are refused by this environment's egress proxy, so every source below was found
through search and is **secondhand until someone opens it**. That is a reason to record the URL,
not a reason to skip it.

## How to do the check

1. `npm run model-watch`. If the date it prints as last checked is today, the watch is done;
   spend the run on the backlog instead.
2. Search, roughly these, with the current month in mind:
   - `new open weights model release <month> <year>`
   - `open source LLM released this week`
   - `<family> new model` for the families the script lists — Qwen, Llama, Gemma, Mistral,
     DeepSeek, gpt-oss, GLM, Kimi and whatever else it prints
   - `quantisation release GGUF MLX <month> <year>`, because a familiar model at a new precision
     changes what fits in a machine and is worth as much here as a new model
   - the model pages on `artificialanalysis.ai` for anything newly scored
3. For each hit, ask the three questions that decide whether this site cares:
   - **Are the weights downloadable?** A hosted-only model is not this site's subject.
   - **Does it fit anything the site prices?** The roomiest machine here holds **384 GB usable**,
     and it is priced: the Mac Studio M3 Ultra, 512GB, at $9,499 as a discontinued launch price.
     The roomiest one Apple still sells is the Mac Studio M5 Ultra, 256GB, at 192 GB usable.
     Weights alone are not the test — the KV cache has to fit above them — but a model whose
     four-bit weights pass 384 GB runs on nothing here at any window. The largest this site
     already prices is GLM-5.3-Flash at 188.99 GB, which is the check on that number.
   - **Is it already here?** The script prints all 55, including the quantisation, so this is a
     look rather than a guess.
4. Write what you found under Candidates, with sources. Update the date at the top of this file
   every run that does the check, **including the runs that find nothing** — a check that found
   nothing is the useful half of a watch, and an undated file cannot tell the two apart.
5. Tell Ryan only when something matters: a model that beats what the site ranks first, or one
   that changes which machines can run something. Not every release.

## What a new model needs before it can be a row

From `data/models.json`, and the script prints this list from the data rather than from here:

| Field | Where it comes from |
| --- | --- |
| `weights_gb` | the actual file sizes on the model's Hugging Face repo, at the quantisation being entered |
| `kv_cache_gb_per_8k` | computed from `architecture`; `validate-data.ts` recomputes it and fails if the two disagree |
| `architecture` | `n_layers`, `n_kv_heads`, `head_dim` from the repo's `config.json` |
| `params_b`, `active_params_b` | the model card; the two differ only on a mixture-of-experts model |
| `max_context_tokens` | the model card, with `max_context_note` for anything conditional |
| `license` | the repo |
| `cloud_equivalent` | the cheapest active endpoint that serves it, both prices, the URL and the date checked. Where nobody rents it, the closest hosted match, marked as a stand-in |
| `frontier_equivalent` | Artificial Analysis's index score, its URL, the date and the index version. Marked `estimated` where the index estimated it |
| `capabilities`, `capability_note` | a judgement, made once the figures are in, in the site's own words |

**A new model does not need a measured speed.** Most models here have no throughput row on any
machine — the script prints how many — and the site prints their speed as worked out from memory
bandwidth and says so. A measured row from a real benchmark is better, and `data/throughput.json` takes one with its source,
but its absence is not what blocks a model from being added.

## Candidates

### 2026-09-22

Nothing new that this site can price, and the three candidates below are unchanged: all three
still wait on figures rather than on another search. Two things are worth recording anyway — one
correction to this file, and one new name ruled out on what it is.

**The correction, and it matters more than any candidate here.** The triage rule above has said
since this file was written that *the largest machine here holds 119.5 GB usable*. That is the
DGX Spark. The roomiest machine on this site is the Mac Studio M3 Ultra, 512GB, at **384 GB
usable** and a published $9,499. The figure was wrong by a factor of three, and this file
contradicted it in its own words further down: the Inkling entry notes that **Inkling Small is
already on the leaderboard at 162.54 GB**, larger than the ceiling the rule two sections above it
claimed, and the script prints GLM-5.3-Flash at 188.99 GB every time it runs. **Every ruling-out
on this page was re-checked against 384 GB and all four survive it**, so nothing has to be added
back. But two of them are much closer than they read: Tencent Hy4 near 450 GB and Atria Dawn just
behind it are a fifth too big, not four times too big, and both are now the first things to
revisit if a roomier machine is ever priced. Checked against `data/hardware.json` rather than
remembered.

**A new precision, shipping for three models already here.** ISTA-DASLab is publishing GSQ-RCO
GGUF builds — GSQ quantises each tensor, RCO picks the per-tensor types under a size budget — and
the files are standard GGUF that llama.cpp, Ollama and LM Studio run unmodified. Builds exist for
Qwen3.8 27B, Qwen3.8 Flash Next and GLM-5.3-Flash, which are three of this site's own rows. The
watch counts a new precision as much as a new model because it changes what fits, and here it
plainly would: **Qwen3.8 Flash Next is entered at 119.60 GB at Q4_K_M, and the DGX Spark hands a
model 119.5 GB.** A tenth of a gigabyte is why the $4,699 machine does not run it, and the
cheapest machine its own page names is the Mac Studio M5 Ultra, 256GB at $10,799. A smaller build
of the same model would put it on the Spark, which is $6,100 less.

Sources, none of them opened from here: the [Qwen3.8-27B
build](https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF), the [Flash-Next
build](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF), and MindStudio's
[explainer on the GLM-5.3-Flash one](https://www.mindstudio.ai/blog/glm-5-3-flash-gguf-gsq-rco-local).

**Still missing, and it is the whole of what stops this being a row today:** one file size that
two sources agree on. Search returned 47.9 GB for the Flash-Next 3.5-bit file and 77.42 GB for the
weights plus the quantised embedding shards, and those are two different claims about the same
download; the 27B repo is described as four sizes with an IQ3_S at *just over one fifth of the
BF16 size*, which is a ratio rather than a figure. This site names the quantisation it prices and
prints the number, so it needs the file listing itself. Also missing: whether the quality claim
holds, and what `kv_cache_gb_per_8k` does under a non-uniform scheme — the cache is computed from
`architecture` and is unchanged by how the weights are quantised, so the existing rows' figures
carry over, but that should be said out loud before a row is written.

- **Edge0-35B-A3B preview** (Edge0), Apache 2.0, 35B total / 3B active, built on Qwen3.5-MoE and
  reported at 15 to 18 tok/s on a Mac mini M4 Pro. **Not this site's subject, and not on size.**
  It works by keeping most of its weights on disk and streaming the experts it needs, so the
  memory it occupies is not weights plus a cache that grows with the window, which is the whole of
  this site's sum. Its 4-bit format is a custom affine quantisation for the MLX-only edge0
  framework and does not convert to GGUF at all. A row for it would print a memory figure that
  means something different from every other row's. Ruled out on what it is, so a later run need
  not reach the same answer twice.
- **MiniCPM5-2B** (2026-09-07), **Mistral Small 4**, **Qwen3.8 27B**, **GLM-5.3-Flash** and
  **Granite 4.2** all turned up in this week's searches and all five are already priced here,
  checked against the script's own list rather than guessed. **MiniMax H3** and **Kimi K3** turned
  up again and are already ruled out below.

### 2026-09-19 · Agnes 3.0-Flash (Agnes AI) — worth adding, needs figures

A 33B open-weight multimodal model, Apache 2.0, released 2026-09-11, with weights on Hugging Face
at `Agnes-AI/Agnes-3.0-Flash`. It matters here for its attention rather than its size: the
coverage describes 72 decoder layers where three in every four run a gated delta rule with a
fixed-size state and only the fourth carries a key-value cache, so **18 layers of 72 pay for the
context window**. This site's whole memory sum is weights plus a cache that grows with the window,
and a model that stops the cache growing on three layers in four is the kind that changes which
machines hold what at 128k and beyond. Context is stated as 262,144 tokens. Artificial Analysis
carries a page for it, which is the field the Bonsai candidate below is stuck on.

Sources, none of them opened from here: the [Hugging Face
repo](https://huggingface.co/Agnes-AI/Agnes-3.0-Flash), [Artificial
Analysis](https://artificialanalysis.ai/models/agnes-3-0-flash), and MindStudio's
[explainer](https://www.mindstudio.ai/blog/agnes-3-0-flash-preview-open-weights) and [hardware
notes](https://www.mindstudio.ai/blog/agnes-3-0-flash-hardware-requirements), which is where the
66 GB disk figure and the layer counts come from.

**Still missing:** `weights_gb` at the quantisation actually entered, from a named GGUF or MLX
repo — 66 GB is the released precision, not a four-bit build; the `architecture` figures from
`config.json`; the index score itself; and whether anybody rents it, which decides whether
`cloud_equivalent` is real or a stand-in.

**One thing worth knowing before the row is written.** `architecture` here is `n_layers`,
`n_kv_heads` and `head_dim`, and `validate-data.ts` recomputes `kv_cache_gb_per_8k` from the three
and fails if they disagree. A model where only 18 of 72 layers hold a cache is expressible — enter
the layers that do, and `architecture.note` says why the number is not the model card's — and
`types.ts` already carries a bytes-per-token override for the models whose cache is not
`n_kv_heads × head_dim`. What the schema has no room for is the recurrent state the other 54
layers keep, which is memory a machine has to find and this site would not be counting.

### 2026-09-19 · Nex-N2.5-mini — worth adding, needs figures

A 35.1B total / 3B active sparse mixture of experts on the Qwen3.5-MoE architecture, Apache 2.0,
released 2026-09-08, 262,144 context, multimodal. It sits almost exactly where Qwen3.6 35B-A3B
sits on this site — 22.13 GB at Q4_K_M — so it is a row rather than a rethink, and community GGUF
builds exist: an IQ4_XS at about 21.3 GB, 3-bit builds near 15.6 GB, and a 13.56 GiB custom quant.
The architecture is given as 256 experts with 8 active per token and 40 text layers.

Sources, none of them opened from here: [one community GGUF
repo](https://huggingface.co/ngquocvinh/Nex-N2.5-mini-GGUF), [another with the quantisation
sizes](https://huggingface.co/IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-GGUF) and
[LocalClaw's notes on running it](https://localclaw.io/models/nex-n2-5-mini).

**Still missing:** a Q4_K_M figure from a repo worth citing — every size above is a community
build at a different precision, and this site names the quantisation it prices; `n_kv_heads` and
`head_dim` from `config.json`; an index score; and a rental price.

### 2026-09-17 · Ternary Bonsai 2 27B (PrismML) — worth adding, needs figures

**Why it matters here, which is not the reason the coverage gives.** It is Qwen3.8 27B — the model
this site already ranks at the top of what a graphics card can run — at **5.9 GB** instead of the
16.46 GB the Q4_K_M row carries. That is not a new model at the top of the leaderboard; it is the
same model dropping into machines that could not hold it. The site already runs two quantisations
of one model side by side, so this is a row rather than a rethink.

What the sources state:

- 27B parameters, ternary weights (−1, 0, +1) with FP16 group-wise scaling, 1.76 effective bits
  per weight, **5.9 GB** total footprint
- derived from Qwen3.8 27B, **262k** context, text and image input
- **98.2%** of the FP16 baseline on a 20-benchmark thinking-mode suite (83.9 against 85.4)
- Apache 2.0, downloadable from 2026-09-17
- 143 tok/s on an RTX 5090, per the coverage

Sources, none of them opened from here: [PrismML's own
announcement](https://prismml.com/news/bonsai-2-27b), the [press
release](https://www.prnewswire.com/news-releases/prismml-launches-bonsai-2-27b-its-most-capable-model-yet-302882228.html),
[TechCrunch](https://techcrunch.com/2026/09/17/prismml-hopes-its-tiny-llm-could-change-how-we-all-use-ai/),
[AlphaSignal](https://alphasignal.ai/news/prismml-squeezes-qwen3-8-27b-into-5-9-gb-with-98-performance-retained)
and a [Hugging Face repo](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit).

**Still missing, and every one of them needs the repo rather than an article:** the weights figure
per file at the precision actually entered (5.9 GB is the announcement's round number, and the MLX
repo above is a 2-bit build, which may not be the same artefact); `kv_cache_gb_per_8k` and the
`architecture` it is checked against; whether anybody rents it, which decides whether
`cloud_equivalent` is real or a stand-in on Qwen3.8 27B's price; and an Artificial Analysis score,
which at the time of writing the index does not appear to carry for this build — the 83.9 above is
PrismML's own suite and is not the index the site's Score column uses.

**The judgement that is not the agent's to make:** a ternary build retaining 98.2% of a base model
is either its own row with its own score, or the same row at a second quantisation inheriting the
base model's score with a note. The first needs a number nobody has published yet. The second
prints a score the build did not earn. Worth deciding before the row is written.

## Checked and left alone

### 2026-09-23

Nothing new that this site can price. The searches were the ones this file lists — releases this
month, releases this week, each family the script prints, and new quantisations — and every
open-weight model they returned is already here, already on this page, or not a model in this
site's sense. No candidate is added and none of the three above changed: all three still wait on
figures rather than on another search.

- **Grok 4.7** (SpaceXAI, released 2026-09-21) is the week's one genuinely new flagship and is
  **not this site's subject**. The weights are not published and neither is a parameter count, so
  there is nothing to download, nothing to size and nothing to fit. Grok-1 was opened in 2024 and
  nothing since has been. Ruled out on what it is rather than on what it costs, so a later run
  need not reach the same answer twice. Sources, neither opened from here: the [model
  card](https://media.x.ai/v1/website/4p7card-5eccc980.pdf) and [Unite.AI's
  write-up](https://www.unite.ai/spacexai-releases-grok-4-7-for-coding-and-knowledge-work/).
- **Gemma 4**, **DeepSeek V4-Flash**, **GLM-5.3-Flash**, **Granite 4.2** and **Qwen3.8 27B** turned
  up again in this week's round-ups and all five are already priced here, checked against the
  script's own list rather than guessed. **Kimi K3** and **MiniMax H3** turned up again and are
  already ruled out below.
- The GSQ-RCO builds recorded on 2026-09-22 are unchanged: still one file size two sources agree
  on away from being a row, and still the thing that would put Qwen3.8 Flash Next on a DGX Spark.

### 2026-09-21

Nothing new that this site can price. The searches were the ones this file lists — releases this
month, releases this week, each family the script prints, and new quantisations — and every
open-weight model they returned is already here, already on the list above, too big for anything
priced, or not a model in this site's sense. No candidate is added and none of the three above
changed: all three still wait on figures rather than on another search.

- **MiniMax H3** (2026-08-03), open weights, Apache-licensed, and with community GGUF builds
  within a day, down to a pruned 7.8 GB. It is not this site's subject: H3 is the video model
  behind the Hailuo line, generating up to 2K video with audio, so there is no token price to hold
  it against and no tok/s to print. A machine's memory is not what decides whether it is worth
  buying for one. Ruled out on what it is rather than on what it costs, so a later run need not
  reach the same answer twice.
- **Kimi K3** (2026-07-16), open weights, and at 2.8T parameters the largest of them. Same
  arithmetic as Tencent Hy4 and Atria Dawn below: at the four-bit sizes this data already carries
  it lands past 1 TB, against the 384 GB the roomiest machine here addresses, so a row would be a
  page saying no. The site prices no Kimi model, and this is why. Revisit only if a machine with
  that much usable memory is priced, which is not a near thing at this size.
- **Granite 4.2** (2026-08-25), **Muse Glimmer 30B** (2026-08-10) and **Nemotron 3.5 Lightning
  30B-A3B** all turned up as new names and all three are already priced here, at Q4_K_M. Checked
  against the script's own list rather than guessed.
- **Mistral** and **Llama** returned nothing released since the models already here. Mistral's
  larger sparse family is in early access with no public parameter count or ship date, so there is
  nothing to enter.

### 2026-09-20

Nothing new. The searches were the ones this file lists — releases this month, releases this
week, each family the script prints, and new quantisations — and every open-weight model they
returned is either already priced here or already on this list. The three candidates below still
stand where they were, waiting on figures rather than on another search.

- **Inkling** (Thinking Machines Lab), 975B total / 41B active, Apache 2.0, 1M context, released
  2026-07-15. Turned up as a new name and is neither new nor runnable here: at the four-bit sizes
  this site already carries, 975B lands well beyond the 384 GB the roomiest machine on the list can
  address. **Inkling Small is a different model and is already on the leaderboard**, at 162.54 GB,
  which the two Mac Studio Ultras hold comfortably, so the family is not missing from the site.
  Revisit only if a machine with that much usable memory is priced.

### 2026-09-19

- **Tencent Hy4 preview** (2026-08-28), 770B total / 49B active, Apache 2.0, 1M context. Genuinely
  open and the cheapest of the flagship-tier open models to rent, but it does not fit: at the
  four-bit sizes the data already carries, 770B lands near 450 GB against the 384 GB the roomiest
  machine here addresses. Nothing on the list runs it, so a row would be a page saying no. **This
  is the closest of the four rulings-out on size and the one to check first**: 450 against 384 is
  a fifth too big rather than a different order of magnitude, so a 768 GB machine, or a build of
  this model under four bits, puts it back in play.
- **Atria Dawn Preview**, 744B mixture of experts built on GLM-5.2, MIT, 256k context. Same reason
  and the same arithmetic as Hy4, and at 744B it is the same distance from fitting.
- **Sakana AI Fugu Max and Fugu Ultra v2** (2026-09-11). Not a model in this site's sense: Fugu is
  an orchestrator that routes a request to other models behind one API. There are no weights to
  download and nothing to fit in a machine.

This is where a model goes once it has been looked at and ruled out, with the reason, so no later
run spends an hour reaching the same answer.
