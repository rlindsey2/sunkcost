# Model watch

Last checked: 2026-09-18

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
   - **Does it fit anything the site prices?** The largest machine here holds 119.5 GB usable.
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

Nothing yet. This is where a model goes once it has been looked at and ruled out, with the reason,
so no later run spends an hour reaching the same answer.
