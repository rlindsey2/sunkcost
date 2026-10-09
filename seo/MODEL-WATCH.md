# Model watch

Last checked: 2026-10-09

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

### 2026-10-09 · Nothing new to price, and Kimi K3 is out on size with the figures to say so

**Beam's weights are still not out.** Fifth day of searching by name and for a repository: the
coverage of the 2026-10-05 announcement still puts the weights "later in October", one write-up
saying before the end of the month under Apache 2.0, and access is still the waitlist. No Hugging
Face listing. Unchanged, and it comes off this list the day the files land.
[SCMP](https://scmp.com/tech/tech-trends/article/3369885/nvidia-backed-reflection-ai-challenges-chinese-dominance-open-weight-models),
[Silicon UK](https://www.silicon.co.uk/ai-2/reflection-beam-open-631797),
[The Hill](https://thehill.com/policy/technology/6130496-reflection-ai-releases-beam-model/amp/).

**Kimi K3 is ruled out on size, and now the figures are written down.** A current guide to
open-weight models names it among the leaders, so it was worth closing rather than passing over:
2.8T parameters with 104B active, a checkpoint reported at 1.56 TB over 118 files, about 1.4 TB
resident at its native MXFP4 before any cache. The roomiest machine this site prices holds 384 GB,
so it runs on nothing here at any window. The licence is its own "Kimi K3 License" with revenue
conditions, not MIT, whatever some coverage says — which would have mattered only if the size had
not already settled it.
[OpenRouter on the licence](https://openrouter.ai/blog/insights/kimi-k3-open-source/),
[one report of the checkpoint size](https://rits.shanghai.nyu.edu/ai/kimi-k3-open-weights-ship-2-8t-parameters-1-4-tb-to-run/),
[the guide that listed it](https://codersera.com/blog/open-source-llms-landscape-2026/).

**No release this week to chase.** One tracker's open-weight section reads "no open source releases
this week", and searches for a release this month, for the families the script lists and for a new
quantisation turned up nothing that is not already here or already ruled out.
[llm-stats updates](https://llm-stats.com/llm-updates).

**Apodex 1.1 Mini, Kolibri 1, MiMo-V2.6-Flash and Index-Translate-35B-A3B are unchanged**, each
still short of the fields their own entries list.

### 2026-10-08 · Nothing new to price, and a second source says Apodex 1.1 Mini has no score

**Beam has not shipped its weights.** Searched again by name and for a Hugging Face repo: every
write-up of the 2026-10-05 announcement still puts the weights "later in October", one of them saying
the model is in final red-teaming, and none of them names a repository. Access is still the waitlist.
Unchanged from yesterday, and it goes back on this list the day the files land.
[LetsDataScience](https://letsdatascience.com/news/reflection-introduces-beam-open-weight-reasoning-model-b6a0e32f),
[AI Magazine](https://aimagazine.com/news/what-is-nvidia-backed-reflection-ai-its-open-weight-model),
[ai-tldr](https://ai-tldr.dev/releases/reflection-beam/).

**Apodex 1.1 Mini's missing score is now missing in two places.** BenchLM tracks the Mini and prints
its index score as "not computed", which is the second source to say what Artificial Analysis's own
404 said: there is no number to take. The same site puts the **full** Apodex 1.1 at 30.4 where the
vendor blog quoted on 2026-10-07 puts it at 44 — two secondhand figures for a model that is not the
one this site would add, disagreeing by half, which is its own reason to take neither.
[BenchLM's Mini page](https://benchlm.ai/models/apodex-1-1-mini),
[its Apodex 1.1 page](https://benchlm.ai/md/models/apodex-1-1.md).

**One tracker entry chased down and closed.** A release timeline lists a **"GLM 5.3 Fast"** from Z.ai
on 2026-10-07. Searching that name returns nothing of its own: every result is **GLM-5.3-Flash**, the
320B/18B MIT-licensed model this site already prices at 188.99 GB. It is a mangled name, not a
release. The same timeline dates **Mistral Large 4** to 2026-10-06, which is the preview entry of
2026-10-06 — out on size at about 1.05T, with weights still reported for the end of the month.
[llmgateway's timeline](https://llmgateway.io/timeline),
[one write-up of the GLM pair](https://gigazine.net/gsc_news/en/20260829-glm-5-3-open/).

**Kolibri 1, MiMo-V2.6-Flash and Index-Translate-35B-A3B are unchanged**, each still short of the
fields yesterday's entry lists. Nothing else open-weight that emits tokens turned up this run.

### 2026-10-07 · Beam is 501B announced with Apache 2.0 weights, and the weights are not out

**Beam (Reflection AI), announced 2026-10-05.** A sparse mixture of experts, reported at **501B total
with about 23B active per token**, aimed at coding, reasoning and agentic work, with **Apache 2.0**
weights, a technical report and a model card promised later in October. Early access is a waitlist.
Worth recording because of where it would land: a four-bit build of 501B is the first candidate since
GLM-5.3-Flash that could be the largest row on this site rather than ruled out above it. One write-up
puts a four-bit build at roughly 250 GB, which would sit under the **384 GB** the Mac Studio M3 Ultra,
512GB hands a model and over the 192 GB usable on the roomiest machine Apple still sells.

**It is not a row, and nothing about it can be guessed.** That 250 GB is arithmetic on a parameter
count, which this file does not take as a size; there is no file listing because there are no files.
As of 2026-10-06 no Beam weights were on Hugging Face and the model could not be self-hosted, checked
against Reflection's organisation page, which is verified and empty of them. `architecture`,
`frontier_equivalent` and `cloud_equivalent` are all open. It goes back on this list the day the
weights land, when the size stops being an estimate.

Sources, secondhand, none opened from here:
[TechCrunch](https://techcrunch.com/2026/10/05/reflection-debuts-beam-a-open-weight-ai-model-to-rival-chinese-models-at-lower-compute-cost/),
[MarkTechPost](https://www.marktechpost.com/2026/10/05/reflection-ai-introduces-beam-a-501b-open-weight-moe-model-with-23b-active-parameters-for-coding-and-agentic-workloads/),
[Reflection's own post](https://reflection.ai/blog/introducing-beam) and
[one write-up of what it would take to run](https://aitoolsrecap.com/Blog/reflection-ai-beam-501b-open-weight-coding-model-2026).

**Nothing else released that this site could price.** Mistral Large 4 is where yesterday left it: a
preview, with weights reported for the end of October, and out on size at about 1.05T either way. A
release tracker lists an **EmbeddingGemma 2** on 2026-10-06, and searching Google's own blog and
Hugging Face by that name turns up only the 2025 EmbeddingGemma, so there is nothing here to record;
an embedding model emits no tokens and would be out on kind in any case.

**The four waiting candidates have not moved, and two searches closed the same way as before.**
`artificialanalysis.ai/models/apodex-1-1-mini` answered **404** again this run. One vendor blog quotes
the index at **44** for the full Apodex 1.1, not the Mini, citing Artificial Analysis rather than
showing it; a secondhand citation of a score is not a score, so Apodex 1.1 Mini still waits on the one
field it lacks ([the write-up](https://www.orcarouter.ai/blog/apodex-1-1-explained)). Searching Aleph
Alpha's pricing again turned up Luminous and no **Kolibri 1**, with third-party aggregators
disagreeing by a factor of a thousand on the Luminous prices, which is its own reason not to take one;
Kolibri 1 still needs a price and a score. **MiMo-V2.6-Flash** is unchanged — Q2_K at about 126 GB and
MXFP4 at about 157 to 167 GB, no Q4_K_M — and the **185.40 GB** figure a VRAM calculator shows for it
labels its own row as calculated with no published GGUF file, which is the same trap as the 187.14 GB
one on 2026-10-06. **Index-Translate-35B-A3B** is unchanged.

### 2026-10-06 · Kolibri 1 has a four-bit size now, and lost the one field it had instead

**Kolibri 1's `weights_gb` gap is closed, and it is still not a row.** Three community GGUF repos
quote a Q4_K_M build at about **47.5 GB** — Prompt48 at 47.45 GB decimal, Hob-forge and a third at
47.5 GB — which is the field yesterday's entry said it was waiting on, and it lands where the 64 GB
machines here hold it with room for a window. But searching for the other two fields closed the
question the other way: **Artificial Analysis has no page for it**, confirmed by name again today,
and **Aleph Alpha has published no token price**, with no Kolibri model id in its API docs as of
2026-10-05. So the row now waits on two fields rather than one, and both are the kind this site
cannot supply itself: no index score means no Score column, and no endpoint means `cloud_equivalent`
would be a stand-in for a model nobody sells. `architecture` is still short of the `n_kv_heads` and
`head_dim` that `validate-data.ts` recomputes `kv_cache_gb_per_8k` from.

Sources for the four-bit size, none opened from here — huggingface.co is refused by this
environment's egress proxy: [Prompt48](https://huggingface.co/Prompt48/Kolibri-1-GGUF),
[Hob-forge](https://huggingface.co/Hob-forge/Kolibri-1-GGUF) and
[aparusel](https://huggingface.co/aparusel/kolibri-1-gguf), with one write-up of what a Mac needs to
load them ([modelfit.io](https://modelfit.io/blog/kolibri-1-aleph-alpha-mac-memory-requirements/)).
For the two missing fields, [Kompozy's review](https://kompozy.io/reviews/kolibri) and
[innfactory's listing](https://innfactory.ai/en/ai-models/aleph-alpha-kolibri/).

**Ruled out this run.** Mistral Large 4, announced today as "Le Chonk" at about **1.05T total /
49B active** and multimodal, is out twice over: at that size a four-bit build is far past the 384 GB
the roomiest machine here hands a model, as Kimi K2.6, GLM-5.3 and Qwen3.8 Max already are, and the
weights are not out — reports put them at the end of October, with only a preview served today. It
goes on this list again if the released weights come with a smaller sibling.
[One write-up](https://tech-insider.org/mistral-large-4-le-chonk-1-05t-parameters-2026). And
**Clef-Flash**, a 9B Cloudflare fine-tune of Qwen3.5 9B, is out on kind for the same reason Clef was
on 2026-10-01: a fine-tune aimed at structured output is not a model this site prices.

**Unchanged.** MiMo-V2.6-Flash is still one four-bit file listing short, and today's search turned up
the trap worth writing down: a **187.14 GB Q4_K_M** figure that search results attach to it belongs
to **MiMo-V2-Flash**, a different model. The official repo's own quants remain Q2_K at about 126 GB
and MXFP4 at about 167 GB, which is the same pair as 2026-10-03. Index-Translate-35B-A3B and
Apodex 1.1 Mini are unchanged.

### 2026-10-05 · Kolibri 1 is a 78B MoE that would fit here, and it ships only at FP8

**Kolibri 1 (Aleph Alpha), released 2026-10-03 under Apache 2.0.** An English-German
mixture-of-experts reasoning model, **78.1B total with about 3.46B active per token**, 50 layers
with 384 experts each, routing every token to 6 experts plus 1 shared. A 1,048,576-token window,
with 262,144 named as the practical serving figure. Weights are on Hugging Face as
`Aleph-Alpha/Kolibri-1` in `float8_e4m3fn`, with the sensitive parts left in bfloat16. The write-up
puts it at about 78 GB of memory, which is the shape of an FP8 build of 78.1B parameters and would
fit the roomiest machines here. It is the first candidate this watch has found whose attention is
mostly local: four of every five layers use a 512-token sliding window and the fifth attends to the
whole context, so its KV cache at 262k would be small for its size, and `fit.ts` already caps
sliding-window layers at their window.

Reported benchmarks, from the same write-up and against Qwen3.6: AIME 2026 at 96% English and 90%
German, against 91% and 84.4%; Tau3-Bench banking at 38.1% against 10.6%; MMLU-Pro CoT at 80%
against 84.3%.

**What it still needs, and why it is not a row yet.**

- **`weights_gb`**: nothing cites a file listing. Every size this site prices is a four-bit build,
  and no four-bit Kolibri 1 is quoted anywhere found. The 78 GB figure is a memory requirement in
  prose, not a repo's file sizes, and this file does not take arithmetic on a parameter count as a
  size.
- **`architecture`**: the layer count and the expert layout are stated, the `n_kv_heads` and
  `head_dim` that `kv_cache_gb_per_8k` is computed from are not, and neither is which of the 50
  layers are the full-attention ones. `validate-data.ts` recomputes that field and would fail.
- **`frontier_equivalent`**: Artificial Analysis has no page for it. Searched by name and by shape;
  the index's 35B-A3B pages are Qwen's.
- **`cloud_equivalent`**: no published token price, stated plainly by the write-up. Nobody found
  renting it, so this would need the stand-in treatment.

Sources, secondhand, neither opened from here beyond a fetch of the first:
[DataCamp's write-up](https://www.datacamp.com/blog/aleph-alpha-kolibri-1) and
[Mervin Praison's](https://mer.vin/news/aleph-alpha-kolibri-1-sovereign-open-weight-model-for-engineers/).

Nothing moved on the three candidates that were waiting: Index-Translate-35B-A3B still has no index
score, searched by name again today; MiMo-V2.6-Flash and Apodex 1.1 Mini are unchanged.

### 2026-10-04 · Index-Translate-35B-A3B is a well-sourced four-bit build with nowhere to get a score, and Strands Decider 2B is out on kind

**Index-Translate-35B-A3B-preview (Bilibili Index team), the day's one open-weights release that emits
tokens.** 36B total with about 3B active, MoE, **Apache 2.0**, built on the Qwen3.5 MoE architecture, dated
2026-10-02, with `max_position_embeddings=262144` on the shipped config and the serving examples capped at
32,768 for want of GPU memory. Two independent GGUF uploads agree on the four-bit size, which is better
sourcing than any candidate here has had:
[IndexTeam's own GGUF repo](https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview-GGUF/tree/main)
lists **Q4_K_M at 21.7 GB** (Q8_0 37.8 GB, IQ4_XS 19.4 GB, Q2_K 13.2 GB, plus an `mmproj` at 611 MB Q8_0),
and [mradermacher's](https://huggingface.co/mradermacher/Index-Translate-35B-A3B-preview-GGUF) gives
**21.8 GB** for the same quantisation. At 21.7 GB it lands with the other three 35B-A3B models here — Ornith
1.5 at 21.71 GB, Qwen3.6 at 22.13 GB, KAT-Coder V2.5 Dev at 21.39 GB — so it runs on everything from 32 GB
of usable memory up, and the base card is
[IndexTeam/Index-Translate-35B-A3B-preview](https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview).

**It waits on the same wall as the last two candidates, and on one more of its own.**
`frontier_equivalent` needs an Artificial Analysis index score and a translation-only model is not something
that index scores, so this is not a page that might appear next week the way a general model's might.
`cloud_equivalent` needs an endpoint that rents it by the token, and the release is weights on Hugging Face
and ModelScope rather than a hosted product. Both are missing and neither can be guessed. Worth recording
because the memory fields are the best-sourced of any candidate here; worth saying plainly that the two
fields it lacks are the two that make a row on this site mean anything.

**Strands Decider 2B (Amazon Strands Labs), out on kind.** 2B, Apache 2.0, weights and training scripts
released, dated 2026-10-01. It returns typed answers with probabilities and emits no text, so it is the same
kind of thing as Cloudflare's Clef on 2026-10-01 and is ruled out for the same reason: this site prices
tokens a second against a per-million-token bill and a model with neither has no row. Named in passing by
yesterday's entry as "an Amazon decision model"; this closes it.

**Nothing else, and the standing blockers have not moved.**
[pricepertoken](https://pricepertoken.com/news/model-releases), updated 2026-10-04, shows nothing after Ling
3.1 Flash on 2 October, and [llm-stats](https://llm-stats.com/llm-updates) nothing after GPT-6.1 Sol on 29
September. `artificialanalysis.ai/models/apodex-1-1-mini` answered **404** again this run, so Apodex 1.1
Mini still has every field but its score; MiMo-V2.6-Distill-Qwen-9B is behind the same wall; and the three
choices MiMo-V2.6-Flash needs made — which repository's figure, which name, whether the vision encoder
counts toward `weights_gb` — are still not this watch's to make.

### 2026-10-03 · MiMo-V2.6-Flash has a real four-bit file size at last, and it is not the one that was quoted

**The field this candidate has waited on since 2026-09-28 exists.** Two Hugging Face repositories answered
this run, and both give a listed four-bit file rather than a calculator's multiple of the parameter count:

- [ggml-org/MiMo-V2.6-Flash-RL-GGUF](https://huggingface.co/ggml-org/MiMo-V2.6-Flash-RL-GGUF/tree/main),
  the llama.cpp organisation's own upload, lists **MXFP4 split in two parts, 5.95 MB and 167 GB**, and Q2_K
  the same way at 5.95 MB and 126 GB. Beside them: a vision encoder (`mmproj`) at 2.75 GB BF16 and 1.56 GB
  Q8_0, a drafter (`dflash`) at 2.94 GB and 1.57 GB, and a multi-token-prediction head (`mtp`) at 4.48 GB
  BF16, 2.38 GB Q8_0 and 1.26 GB Q4_0.
- [kernelpool/MiMo-V2.6-Flash-MXFP4-GGUF](https://huggingface.co/kernelpool/MiMo-V2.6-Flash-MXFP4-GGUF)
  lists one file, **MXFP4 at 157.4 GiB**, with a vision encoder at 2.7 GiB F32 and 0.7 GiB Q8_0 and a
  drafter at 1.5 GiB. It states what it was converted from: `XiaomiMiMo/MiMo-V2.6-Flash-RL` at revision
  `3b38d063180c3e4aed9691fdc735f3d10b266ee4`.

**MXFP4 is not a problem.** It is the quantisation this site already prices gpt-oss-20b and gpt-oss-120b at,
so it needs no new field and no new caveat. At 157 to 167 GB the model lands where the 2026-09-28 entry put
it, between Inkling Small at 162.54 GB and Tencent Hy3 at 182.16 GB: inside what the two Mac Studio Ultras
hand a model and outside every Strix Halo box.

**The 185.40 GB figure is now refuted, not just doubted.** Neither repository has a Q4_K_M build at all, and
the 2026-09-30 entry's arithmetic stands: 185.40 GB is 0.6 × 309B, which is what llmrun.dev prints for every
model. Nobody should enter it.

**Which repository, and three choices that are not this watch's to make.** The two listings disagree — 167 GB
against 157.4 GiB, which is about 169 GB — because they are different quantisation recipes, so an entry has
to name the repository it took its figure from rather than average them. Then the name: the first-party
checkpoint is `XiaomiMiMo/MiMo-V2.6-Flash-RL`, the `-RL` is the post-training rather than an adapter over a
base, there are no non-RL weights, and the API id is `mimo-v2.6-flash`, so the repository and the product are
one model under two names. And `weights_gb`: this is the first candidate here that ships its vision encoder
and its drafter as separate files, and no model in this data has ever had a part to leave out, so whether the
2.7 GB encoder counts toward what has to fit in memory is a decision about what the figure means.
Secondhand source for the naming, not opened here:
[orcarouter on MiMo-V2.6-Flash against MiMo-V2.6](https://www.orcarouter.ai/blog/mimo-v2-6-flash-vs-mimo-v2-6).

**Nothing else moved.** No open-weights release is dated 2026-10-02 or 2026-10-03 on either tracker;
[pricepertoken](https://pricepertoken.com/news/model-releases) shows Apodex 1.1 Mini, Pareto 26.10 Preview and
Gemini 4 Argon on 1 October, all three already settled by yesterday's entry, and
[llm-stats](https://llm-stats.com/llm-updates) shows nothing after GPT-6.1 Sol on 29 September.
Apodex 1.1 Mini still has no index score: `artificialanalysis.ai/models/apodex-1-1-mini` answered **404** this
run, so the wall is the same one MiMo-V2.6-Distill-Qwen-9B is behind, and that distill has no page either.

### 2026-10-02 · Apodex 1.1 Mini is the best-sourced candidate this watch has had, and Ling 3.1 Flash has no weights

**Ling 3.1 Flash (inclusionAI), out of scope.** It appeared on the release trackers dated 2026-10-02 and is
the one new name of the day that matters, because this site already prices Ling 3.0 flash. It is 560B total
with about 25B active, MoE, on a free 256k trial now and a paid 1M window to follow, and **nothing is
downloadable**: no Hugging Face repository and no licence, with inclusionAI saying the weights open only
after the trial ends. An announced open model is not an open model, so there is no row here until the files
exist. Sources, none opened from this container:
[orcarouter on the trial](https://www.orcarouter.ai/blog/ling-3-1-flash-free-trial-api) and
[on its not being an open release](https://www.orcarouter.ai/blog/ling-3-1-flash-announced-not-open-weights).
The other two names dated 1 October are Pareto 26.10 Preview, which is a harness over several models rather
than one set of weights, and an Amazon decision model, which is the same kind of thing as Clef below.

**Apodex 1.1 Mini (Apodex), worth adding, needs an index score.** This watch had never recorded Apodex at
all, and the Mini is the first candidate whose every memory field comes from a file this container actually
opened. 35.95B total with about 3B active, MoE, **Apache 2.0**, a fine-tune of Qwen3.5-35B-A3B, released
2026-08-24 and listed free on OpenRouter on 2026-10-01. huggingface.co answered this run, against the
refusals noted above, so there is a real listing rather than a quoted figure:
[abenzerps/Apodex-1.1-mini-GGUF](https://huggingface.co/abenzerps/Apodex-1.1-mini-GGUF) gives **Q4_K_M at
21.7 GB** and Q8_0 at 37.8 GB, a community upload rather than Apodex's own, and
[the base repo's config.json](https://huggingface.co/apodex/Apodex-1.1-mini/blob/main/config.json) gives 40
layers, 2 KV heads, a head dim of 256, 256 experts with 8 per token, and 262,144 positions. At 21.7 GB it
sits between the two 35.95B models already here, Ornith 1.5 35B-A3B at 21.71 GB and Qwen3.6 35B-A3B at
22.13 GB, so it fits everything from 32 GB of usable memory up.

Two fields are missing and neither can be guessed. **`frontier_equivalent`**: Artificial Analysis scores the
proprietary [Apodex 1.1](https://artificialanalysis.ai/models/apodex-1-1) at 44 and carries no page for the
Mini, which is the same wall MiMo-V2.6-Distill-Qwen-9B is behind. **`cloud_equivalent`**: the $0.30 and
$3.00 per million tokens on that page are Apodex's own API for the flagship, not for the Mini, and a free
trial listing is not a price to time a machine against.

One warning carried forward. [llmrun.dev quotes the Mini at 21.57 GB](https://llmrun.dev/model/apodex-apodex-1-1-mini),
which is 35.95B × 0.6 exactly: the same fixed multiple of the parameter count flagged on 2026-09-30, not a
listing. The 21.7 GB above is the listing. Nothing new on MiMo-V2.6-Distill-Qwen-9B or MiMo-V2.6-Flash.

### 2026-10-01 · Cloudflare Clef and Clef-flash are open weights, and not this site's subject

Cloudflare released Clef (27B) and Clef-flash (9B) on 2026-10-01, Apache 2.0, weights on Hugging Face,
and they are the first open-weights release since MiMo-V2.6 on 2026-09-21. They are ruled out on kind
rather than on size. Both are decision models: Cloudflare's own announcement says they "derive schema
choices directly from internal backbone representations" rather than generating intermediate text, so
they return a probability per allowed answer and never emit a token stream. This site prices tokens a
second against a per-million-token API bill, and a model with neither has no row here. Source, opened
from this container: [Cloudflare's announcement](https://blog.cloudflare.com/clef-decision-models/).
The backbones they freeze are Qwen 3.8-27B and Qwen 3.5-9B, both of which this site already prices.

Nothing else is new. MiMo-V2.6-Distill-Qwen-9B still waits on the one field it has always waited on:
Artificial Analysis scores MiMo-V2.6-Pro at 46 and carries no page for the distill. MiMo-V2.6-Flash now
has several community GGUF repos (AesSedai, kernelpool at MXFP4, Baekpica mixed-quant), which is a
change from the calculator-derived figure noted on 2026-09-30, but huggingface.co is refused by this
environment's egress proxy, so no file listing has been read and the candidate still has no citable
four-bit size.

### 2026-09-30 · nothing new, and the one MiMo-V2.6-Flash file size on offer is a calculator's

No open-weights model has come out since MiMo-V2.6-Pro and MiMo-V2.6-Flash on 2026-09-21. The releases
dated 24 to 30 September are hosted: GPT-6.1 Sol, Claude Sonnet 5.5, GLM-5.3 Prime, Qwen3.8 Max Prime,
Ember 1, Aion 3.5 and its Mini, Solar Mini4, and Perceptron MK1.5, which is served on OpenRouter and by
approved partners only and is not a download. Qwen3.8 Flash Next appears again on the release trackers
dated 2026-09-30 and is already priced here at 119.60 GB. Sources, none opened from here:
[llm-stats' update list](https://llm-stats.com/llm-updates),
[pricepertoken's release list](https://pricepertoken.com/news/model-releases) and
[OpenRouter's page for Perceptron MK1.5](https://openrouter.ai/models/perceptron/perceptron-mk1.5).

**The one thing that changed, and it is a warning rather than a figure.** A four-bit file size for
MiMo-V2.6-Flash is now quoted: 185.40 GB at Q4_K_M, on
[llmrun.dev](https://llmrun.dev/model/xiaomimimo-mimo-v2-6-flash-rl), which says the row is "verified
against real community uploads" rather than estimated. It is not a listing. The whole column is a fixed
multiple of the parameter count: 618.00 GB at BF16 is two bytes per parameter of 309B, 309.00 GB at Q8_0
is one, and 185.40 GB is 0.6. Every other size it prints divides out the same way. So the candidate below
still waits on the file listing itself, and this figure is not a substitute for it.

Nothing new on MiMo-V2.6-Distill-Qwen-9B either: Artificial Analysis still carries no page for the
distill, which is the one field that entry waits on.

### 2026-09-29 · MiMo-V2.6-Distill-Qwen-9B (Xiaomi) — worth adding, needs a score

The first candidate whose `weights_gb` is already a citable four-bit figure: bartowski's GGUF
listing gives Q4_K_M at 5.84 GB, the quantisation and the shape this site enters most models at.
9B dense, MIT, 262,144 context, a supervised fine-tune of Qwen3.5-9B on data from the larger
MiMo-V2.6 models, aimed at software engineering, agent work, visual coding and security. At 5.84 GB
it lands beside Qwen3.5 9B (5.68 GB) and Ornith 1.5 9B (5.78 GB), so it runs on everything here down
to the 12 GB card. That is a row rather than a rethink, and no MiMo model is priced here yet.

- **Price**: $0.1078 per million in and $0.28 out on Featherless AI, which serves it. A real
  endpoint, though a flat-rate host rather than a per-token one, so `cloud_equivalent` would want
  a note saying which it is.
- **Architecture, from the model card**: 32 layers, hidden size 4,096, FFN 12,288, 16 query heads
  and 4 key-value heads, head dimension 256, vocabulary 248,320. It inherits Qwen3.5's hybrid
  stack: three gated-delta linear-attention layers to one full-attention layer, so 8 of the 32
  layers cache anything at all. `fit.ts` already ignores linear-attention layers and
  `full_attention_layers` already exists, so this is expressible without a new field.

**Still missing, and it is one field: `frontier_equivalent`.** Artificial Analysis scores
MiMo-V2.6-Pro, at 46 on the index, and carries no page for the 9B distill. This site does not
borrow a parent's score for a distill, so the row waits on the index scoring it. Sources, none
opened from here — huggingface.co is refused by this environment's egress proxy, which is a reason
to record the URL rather than to skip it: the [GGUF
listing](https://huggingface.co/bartowski/MiMo-V2.6-Distill-Qwen-9B-GGUF), the [model
card](https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B), [Featherless's
listing](https://featherless.ai/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B) and two secondhand
spec write-ups, [ApX](https://apxml.com/models/mimo-v2-6-distill-qwen-9b) and
[vast.ai](https://vast.ai/model/mimo-v26-distill-qwen-9b).

**Ruled out this run.** Kimi K2.6 (Moonshot) is about 1T total / 32B active under a modified MIT
licence and ships natively at INT4; at that size a four-bit build is far past the 384 GB the
roomiest machine here hands a model, so it is out on size, as GLM-5.3 and Qwen3.8 Max already are.
Nothing new turned up on the MiMo-V2.6-Flash four-bit file size, which is still what that candidate
waits on.

### 2026-09-28 · MiMo-V2.6-Flash (Xiaomi) — worth adding, needs one file size

The first candidate since dots3-note that this site could price, and the furthest along any has
been: the two fields candidates usually die on, the index score and a rental price, both exist.
309B total / 15B active, MIT, released 2026-09-21, natively omnimodal — text, image, video and
audio in one model — and stated at 1M context. Size is why it matters: the models this data
already carries either side of it are Inkling Small at 162.54 GB and Tencent Hy3 at 182.16 GB, so
a four-bit build lands in the band the two Mac Studio Ultras hold and the Strix Halo boxes do not.
That is a row, not a rethink. No MiMo model is priced here, so the family would be new.

- **Score**: Artificial Analysis carries a page for it and gives 38 on the index, which is the
  index this site's Score column uses.
- **Price**: $0.14 per million in and $0.28 out on Xiaomi's own API, also served on OpenRouter, so
  `cloud_equivalent` would be a real endpoint rather than a stand-in.
- **Architecture, from the technical report**: 39 sliding-window layers and 9 global-attention
  layers; 64 query heads throughout, 8 key-value heads on the sliding-window layers and 4 on the
  global ones; per-head 192 for queries and keys and 128 for values; hidden size 4,096; 256 routed
  experts with 8 active per token; a separate lightweight multi-token-prediction layer for
  speculative decoding.

Sources, none of them opened from here — huggingface.co is refused by this environment's egress
proxy, which is a reason to record the URL rather than to skip it: the [model
card](https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL), the [GGUF repo under the llama.cpp
org](https://huggingface.co/ggml-org/MiMo-V2.6-Flash-RL-GGUF), which ships the multi-token
prediction and DFlash drafter sidecars and a Q8_0 projector for the vision and audio encoders,
[Artificial Analysis](https://artificialanalysis.ai/models/mimo-v2-6-flash), [OpenRouter's
listing](https://openrouter.ai/xiaomi/mimo-v2.6-flash), the [MiMo-V2-Flash technical
report](https://arxiv.org/html/2601.02780v2) and [one write-up of the
release](https://datanorth.ai/news/xiaomi-releases-mimo-v2-6-pro-and-flash).

**Still missing, and it is one field: `weights_gb` at the quantisation actually entered.** The
sizes search returned do not agree and none is a four-bit figure from a listing worth citing:
114 GB at IQ2_S, 108 GB at IQ2_M, 141 GB at IQ3_XXS, 175 GB described as MXFP4, a mixed-quant
package given as 93.09 GB counting the projector and the separate DFlash weights, and two
different BF16 numbers, 88.8 GB and 175 GB, which cannot both be the BF16 of one 309B model. This
site names the quantisation it prices and prints the number, so the row waits on the file listing
itself. Sources for the community four-bit build, neither opened from here: [the MXFP4
one](https://huggingface.co/kernelpool/MiMo-V2.6-Flash-MXFP4-GGUF) and [a mixed-quant
one](https://huggingface.co/Baekpica/MiMo-V2.6-Flash-RL-Mixed-Quant-GGUF).

**Two things worth settling before the row is written.** The cache does not fit `n_kv_heads ×
head_dim` twice over: the key-value head count differs between the two kinds of layer, 8 against
4, and the key and value heads are not the same width, 192 against 128. `types.ts` already carries
a bytes-per-token override for the models whose cache is not that product, and the fit logic caps
sliding-window layers at their window, so this is expressible with a note on `architecture` saying
why the numbers are not the model card's — but it is a judgement, not a transcription. And the
sidecars are memory a machine has to find: the DFlash drafter and the projector are separate files
this site's sum does not count today.

**One hardware signal, and it is not a size.** The recipes published for running it locally are
written for two DGX Sparks rather than one, at FP8 with a quantised cache. That is consistent with
a four-bit build sitting above the 119.5 GB a single Spark hands a model, which is where the
figures above would put it, but a recipe is not a file listing. Source, not opened from here:
[the two-Spark recipe](https://github.com/tonyd2wild/MiMo-V2.6-Flash-2x-DGX-Spark).

### 2026-09-25 · dots3-note Preview (dots studio) — worth adding, needs figures

The first candidate in a week that this site could actually price. A 280B total / 16B active
sparse mixture of experts, Apache 2.0, 512k context, taking text, images and audio. Size is why
it matters: the two models this site already carries either side of 280B are DeepSeek V4-Flash at
284B and 155.10 GB, and Tencent Hy3 at 295B and 182.16 GB, so a four-bit build of this lands in
the band the two Mac Studio Ultras hold and the Strix Halo boxes do not. That is a row, not a
rethink. The architecture is given as one dense layer and 45 mixture-of-experts layers, 256 routed
experts plus one shared, eight active per token, 5,120 hidden size, and a separate 1.13B
multi-token-prediction layer for speculative decoding. The repo ships BF16 and FP8.

Sources, none of them opened from here: the [Hugging Face
repo](https://huggingface.co/dots-studio/dots3-note-prev), the [FP8
build](https://huggingface.co/dots-studio/dots3-note-prev-fp8), [the announcement write-up on
36Kr](https://eu.36kr.com/en/p/3938759517896072) and [AI Weekly's
note](https://aiweekly.co/alerts/xiaohongshu-opens-dots3-note-a-280b-moe-multimodal-model).

**Still missing, and none of it is another search away:** `weights_gb` at the quantisation
actually entered, from a named GGUF or MLX repo — searches turned up no four-bit build at all,
official or community, so there is no file size to cite yet; `n_kv_heads` and `head_dim` from
`config.json`, which the expert counts above do not give; and an Artificial Analysis score, which
the index does not appear to carry for it. BenchLM ranks it 62.81 of 100, and that is a different
index from the one this site's Score column uses, so it is not a substitute. OpenRouter lists a
free endpoint, which is not a price: `cloud_equivalent` needs a paid one, or the closest hosted
match marked as a stand-in.

**Two flagships ruled out on size, so a later run need not look twice.**

- **Qwen3.8 Max**, open-weighted as `Qwen/Qwen3.8-2.4T-A95B` on 2026-08-12 under a custom licence,
  2.4T total and 95B active, 262k native context. Same arithmetic as Kimi K3: at the four-bit
  sizes this data already carries, 2.4T lands well past 1 TB against the 384 GB the roomiest
  machine here addresses, so a row would be a page saying no. Sources, neither opened from here:
  [the repo](https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B) and [Qwen's own
  post](https://qwen.ai/blog?id=qwen3.8).
- **DeepSeek V4.1-Flash** (2026-09-10, MIT), a 552B backbone with a 196B Engram memory beside it,
  748B of weight data in all. **This is now the closest of the rulings-out on size and the one to
  check first**, ahead of Tencent Hy4: the best-compressed package search returned is **426.1 GB
  at 3.0 bits per weight**, against 384 GB, so it misses by a ninth at a precision below anything
  this site prices, and at four bits it is not close. The repo ships FP8 with the expert layers
  already compressed, so the usual four-bit saving is not there to be had, and every GGUF search
  returned is a community conversion. Revisit if a roomier machine is priced. Sources, none of
  them opened from here: [one community
  conversion](https://huggingface.co/ngquocvinh/DeepSeek-V4.1-Flash-GGUF), [a mixed-Q2
  one](https://huggingface.co/apetersson/DeepSeek-V4.1-Flash-MixedQ2-GGUF) and [a hardware
  write-up](https://www.modemguides.com/blogs/ai-infrastructure/run-deepseek-v4-1-flash-locally-hardware-reality-check).

### 2026-09-24

Nothing new that this site can price, and nothing that changes what fits. The week's
searches returned the same names the script already prints — GLM-5.3-Flash, Qwen3.8 27B,
Granite 4.2 8B, Mistral Small 4, Kimi K3, DeepSeek V4 — plus retrospectives rather than
releases. The three candidates below are unchanged and all three still wait on a file size
from a repo worth citing, not on another search.

One name worth ruling out so a later run does not look twice. **Gemma 4 12B Coder** turns up
as a coding build of a model already here, and the builds search returns are community
fine-tunes on Hugging Face, not a Google release: there is no official coder repo behind them
and no `config.json` this site would take an architecture from. Gemma 4 12B is already priced
at Q4_K_M, and a third-party fine-tune of it at the same precision is the same memory sum
under a different name, which is a row that would teach a reader nothing.

Sources, none of them opened from here: [Hugging Face's state-of-open-models
report](https://huggingface.co/blog/state-of-open-models-summer-2026), [Google's own Gemma 4
12B QAT GGUF repo](https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf), and one of the
[community coder builds](https://huggingface.co/yuxinlu1/gemma-4-12B-coder-fable5-composer2.5-v1-GGUF).

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

### 2026-09-28

The searches were the ones this file lists — releases this month, releases this week, each family
the script prints, and new quantisations. One new candidate, above, and one new ruling-out.

- **MiMo-V2.6-Pro** (Xiaomi, 2026-09-21, MIT) is the Flash model's larger sibling at 1.02T total
  and 42B active, and is **ruled out on size**: the same arithmetic as Kimi K3 and Qwen3.8 Max puts
  it past 1 TB at the four-bit sizes this data carries, against the 384 GB the roomiest machine
  here addresses, so a row would be a page saying no. Revisit only if a machine with that much
  usable memory is priced, which is behind Tencent Hy4 and Atria Dawn in the queue. Source, not
  opened from here: [the release
  write-up](https://datanorth.ai/news/xiaomi-releases-mimo-v2-6-pro-and-flash).
- **DeepSeek V4.1-Flash** and **Qwen3.8 Max** came back as the month's headline open releases and
  are each already ruled out above on size. **GLM-5.3-Flash**, **Qwen3.8 27B**, **Granite 4.2**,
  **Mistral Small 4**, **Gemma 4** and **DeepSeek V4-Flash** all turned up and are each already
  priced here, checked against the script's own list rather than guessed.
- **dots3-note Preview** was not searched again: three runs have now returned no four-bit build, so
  it waits on a repo appearing. The GSQ-RCO builds recorded on 2026-09-22 are unchanged, and the
  NVFP4 tooling recorded on 2026-09-27 still has no model published at that precision.

### 2026-09-27

Nothing new that this site can price, and nothing that changes what fits. The searches were the
ones this file lists — releases this month, releases this week, each family the script prints, and
new quantisations — and every open-weight model they returned is already priced here, already on
this page, or already ruled out. The candidates above are unchanged, and dots3-note Preview was
not searched again: two runs have now returned no four-bit build for it, so it waits on a repo
appearing rather than on a third search.

- **Two new Qwen names, neither of them this site's subject.** **Qwen3.8-Omni-Flash** is served
  through the API and the weights are not published, so there is nothing to download and nothing
  to size; Qwen2.5-Omni was Apache 2.0 and this one has no announced release. **Qwen-Image-2.1**
  is an image model under a non-commercial research licence, so there is no token price to hold
  it against and no tok/s to print. Both are ruled out on what they are rather than on what they
  cost, so a later run need not look twice. Sources, none of them opened from here: [one write-up
  on running Omni-Flash locally](https://www.popularai.org/p/qwen3-8-omni-flash-local-gguf),
  [a comparison with Qwen2.5-Omni](https://www.orcarouter.ai/blog/qwen-3-8-omni-flash-vs-qwen2-5-omni)
  and [a release timeline](https://llmgateway.io/timeline).
- **One new precision, and it is tooling rather than a build.** GPTQModel merged a native MLX
  kernel for GGUF **NVFP4** on Apple Silicon, emitting the 64-value, 36-byte GGUF block, with a
  second change for writing MLX GGUF Q6_K directly. The watch counts a new precision as much as a
  new model because it changes what fits, but this is a way of making a file, not a file: no model
  is published at NVFP4 yet, so there is no size to cite and nothing here changes. Worth revisiting
  once a repo ships one, because four bits is what every row in this data is priced at. Sources,
  neither opened from here: [the NVFP4 pull
  request](https://github.com/ModelCloud/GPTQModel/pull/3224) and [the Q6_K
  one](https://github.com/ModelCloud/GPTQModel/pull/3215).
- **DeepSeek V4.1-Flash** came back again as the month's headline open release and is already
  ruled out above on size. **Qwen3.8 Max**, **GLM-5.3**, **Kimi K3**, **MiniMax H3** and **Inkling**
  turned up in the round-ups and are each already ruled out; **Qwen3.8 27B**, **Qwen3.8 Flash Next**,
  **GLM-5.3-Flash**, **Granite 4.2**, **Mistral Small 4**, **Muse Glimmer 30B**, **Gemma 4** and
  **DeepSeek V4-Flash** all turned up and are each already priced here. Checked against the
  script's own list rather than guessed.

### 2026-09-26

Nothing new that this site can price, and nothing that changes what fits. The searches were the
ones this file lists — releases this month, releases this week, each family the script prints, and
new quantisations — and every open-weight model they returned is already priced here, already on
this page, or already ruled out. The candidates above are unchanged.

**The one search worth recording, because it is the thing standing between a candidate and a row.**
dots3-note Preview still has no four-bit build, official or community, that a file size could be
cited from: a search for one returned explainers on what Q4_K_M means and no repo for this model at
any four-bit precision. That is the same answer yesterday's run got, so the candidate waits on a
repo appearing rather than on another search, and a later run can skip straight past it until one
does.

- **DeepSeek V4.1-Flash** came back as the month's headline open release and is already ruled out
  above on size, at 426.1 GB against 384 GB. **Qwen3.6 27B** and **Qwen3.6 35B-A3B** came back as
  this week's GGUF builds and both are already priced here. **gpt-oss**, **Inkling**, **Qwen3.8
  27B**, **Mistral Small 4**, **GLM-5.3** and **Kimi K3** all turned up in the round-ups and are
  each already priced or already ruled out. Checked against the script's own list rather than guessed.
- **GLM-5.3 itself is ruled out on size, and that is this run's one new answer.** This site prices
  GLM-5.3-Flash at 321.3B and 188.99 GB, which is a different model from the GLM-5.3 the round-ups
  name: the base is reported at about 744B total and 40B active, the same count as Atria Dawn above,
  so it lands by the same arithmetic near 450 GB at the four-bit sizes this data carries, against the
  384 GB the roomiest machine here addresses. The official FP8 repo is reported as 755.7 GB over 141
  shards and the BF16 at about 1.5 TB, which is the check on that. It is also not Apache 2.0 but a
  custom "GLM-5.3 License". Nothing here runs it, so a row would be a page saying no, and a later run
  need not look twice. Revisit only if a machine past 384 GB is priced — behind Tencent Hy4 and Atria
  Dawn, which are the same distance away. Sources, none of them opened from here: [a specs
  write-up](https://kingy.ai/blog/glm-5-3-specs-benchmarks-api-how-to-use/), [one on the weights drop
  and the GGUF sizes](https://runaihome.com/blog/glm-5-3-open-weights-live-hardware-guide-2026/) and
  [one on the Flash build this site does carry](https://www.progressiverobot.com/2026/08/28/glm-5-3-flash-open-weight-320b-model/).
- The quantisation search returned format comparisons — GGUF against MLX, AWQ, GPTQ and EXL3 — and
  no new format or build that changes what fits in a machine here. The GSQ-RCO builds recorded on
  2026-09-22 are unchanged and still one citable file size away from being a row.

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
