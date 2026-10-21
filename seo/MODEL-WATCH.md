# Model watch

Last checked: 2026-10-21

New open models come out faster than this site notices them. This file is the daily check for
that: what was searched, what turned up, and what each candidate still needs before it can be a
row in `data/models.json`. It is the agent's memory of the watch, the way `LOG.md` is its memory
of everything else.

Run `npm run model-watch` first. It prints today's date against the one above, every model the
site already prices with its size and quantisation, and the fields a new entry carries. Nothing
in it writes anything.

## The rule that does not bend here

**No figure is ever invented.** A candidate below carries the numbers a source states and the URL
that states them; everything else is marked as missing. Sunk Cost's whole claim is that its figures
come from somewhere, and a model added from a press release's rounding would cost more trust than a
late model costs traffic.

**Since 2026-10-20 the agent adds the rows itself** (Ryan, standing order in seo/LOG.md). A candidate
whose fields are citable goes into `data/models.json`, and a judgement this file used to leave to Ryan
(a new quantisation label, a vision model, a two-bit publisher build) is now the agent's to make and to
say on the page. A field no source states is `null` with a TODO, never a blocker on its own.

Sources are recorded as URLs whether or not they can be opened from here. Direct fetches were
refused by this environment's egress proxy on the runs before 2026-10-11 and every source from
those runs is **secondhand**; fetches worked on 2026-10-11, so an entry from that run says when a
figure was read off the repo itself rather than off a write-up of it. Try a fetch before assuming
it will fail.

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
| `architecture` | `n_layers`, `n_kv_heads`, `head_dim` from the repo's `config.json`. Read `layer_types` or `sliding_window_pattern` for the split between the layers that grow and the ones a window caps, and read `num_global_key_value_heads` and `global_head_dim` before assuming the two share a geometry: where a config states them, the growing layers want `bytes_per_token_full` and the capped ones `bytes_per_token_sliding`, and leaving them out overstated Gemma 4 31B's cache twofold until 2026-10-20 |
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

### 2026-10-21 · Nemotron 3.5 Bolt 74B-A9B is a row now, and nothing else new is worth a figure

**`nemotron-3.5-bolt-74b-a9b-iq2` is in `data/models.json`**, and every figure in it was read again
today off the sources themselves. The GGUF repository's own file list gives one 22,018,326,528-byte
file, so **22.02 GB**, beside a separate 1.73 GB `mmproj` for the vision encoder, which the row does
not price and the page says so. The BF16 repository's `config.json` gives **88 blocks, 8 of them
attention** at `num_key_value_heads` 2 by `head_dim` 128, with 40 Mamba-2 and 40 MoE blocks and no
`sliding_window`, so `kv_cache_gb_per_8k` is 0.067 and the model's whole 262,144-token window costs
2.1 GB. The safetensors index gives 74,885,081,096 parameters against the card's "74B total, 9B
active"; the card gives **IQ2**, 256K of context and OpenMDW-1.1, and names the two-bit build as
quantisation-aware trained to fit 24 GB. Artificial Analysis gives **21**, verbose at 230M output
tokens over the index against a median of 100M.

**Two judgements this file used to leave to Ryan, both made on the page.** The build priced is the
publisher's own two-bit one rather than
[unsloth's UD-Q4_K_XL](https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF) at 50.22
GB, read today, because NVIDIA trained the quantisation and built it for a 24 GB card, which is the
machine the search asks about; `IQ2` is a quantisation label this data had not carried. And it is a
vision model, so the text side is priced and the lede says the vision encoder is a separate download.

**Nobody rents it.** It is on no OpenRouter listing today: the four Nemotron 3.5 endpoints there are
Super VL, Lightning, Content Safety and the Nemotron 3 models. So the price is a stand-in, Qwen3.6 27B
at $0.30 / $2.00, the hosted model nearest it on the index at 22 against 21, by the same rule the
other 11 stand-ins here follow.

**One thing to log rather than to fix.** The model page at
`artificialanalysis.ai/models/nemotron-3-5-bolt-74b-a9b` names the index **v4.3.2** where this site's
basis is v4.3, read across every model on 2026-09-11. A point release is not a figure to copy into one
row while 55 others say v4.3, so the row records v4.3 and seo/LOG.md now carries the backlog item.

**Nothing else is new.** The searches, Hugging Face's trending list and its newest text-generation
repositories return the names the entries below already cover. Every repository created since
yesterday's check is a finetune, an adapter or a third-party requantisation of something here.
Artificial Analysis still 404s on `/models/lfm2-5-24b-a2b`, so LFM2.5 24B-A2B still wants only its
index score, and Tencent's Hy-Memory 30B-A3B is on no OpenRouter listing today, so it still has no
token price for a pay-back to beat.

### 2026-10-20 · Nothing new to price, and the one new name is out on three counts

The searches and Hugging Face's trending and most-downloaded lists return the names yesterday's entry already
covers. The one repository created since that check is
[orcarouter/OrcaCyber-Nano-1.0](https://huggingface.co/orcarouter/OrcaCyber-Nano-1.0), 2026-10-16, with 18,606
downloads: a cybersecurity and reverse-engineering tune of a Qwen base, published as GGUF by its own author. It
is out on three counts rather than one. The licence is Qwen's own custom one, named in the repository as
`license: other` with `license_name: qwen`. Its two usable builds are called `Mix-13G` at 12.99 GB and
`Mix-15.7G` at 15.70 GB, mixed precisions this data carries no label for, with nothing else but a 2.06 GB Q8_0
of a distilled variant and a 0.93 GB vision projector. And it is image-text-to-text and single-domain, so it
answers neither the general question every row here is priced for nor the vision question the backlog now
hands this agent.
Artificial Analysis has no page for it and it is on no OpenRouter listing today.

**Both open fields on yesterday's candidates are still open.** Artificial Analysis still 404s on
`/models/lfm2-5-24b-a2b`, so LFM2.5 24B-A2B still wants only its index score, and OpenRouter still lists
`liquid/lfm-2.5-24b-a2b` at $0.05 in / $0.70 out. Hy-Memory 30B-A3B is on no OpenRouter listing today, so it
still has no token price for a pay-back to beat.

**LFM2.5 24B-A2B is a row now rather than a candidate.** `lfm2.5-24b-a2b-q4` is in `data/models.json`, and every
figure in it was read again today off the sources themselves: the GGUF repository's own file list for Q4_K_M at
14.53 GB, the base repository's `config.json` for 40 layers with `full_attention` at every fourth from index 2, so
10 of them, at 8 KV heads by a `head_dim` of 64 the config omits and 2048 / 32 gives, the card for 24.0B total,
2.45B active and 131,072 tokens, the repository metadata for `license_name: lfm1.0`, and the OpenRouter model list
for $0.05 in / $0.70 out at 128,000 tokens. Two fields are still open and are `null` with a TODO in the row:
`artificialanalysis.ai/models/lfm2-5-24b-a2b` is a 404 again today where the 2.6B's page answers, so there is no
index score, and the five capability ratings wait on one.

**One figure the card states that no row here can hold.** It claims 184 tok/s "on an Apple M5 Max". This site
prices seven M5 Max machines across two memory bandwidths, 460 GB/s at 36 GB and 614 GB/s above it, and the claim
names no memory size, no quantisation and no context, so there is no model-and-machine pair to put it on.
`data/throughput.json` is unchanged and the page quotes the speed worked out from bandwidth, as it does for every
model nobody has published a placeable measurement for.

**One field this file never asked for, and it cost a figure.** Settling the Gemma 3 question in seo/LOG.md today
turned up that a model's full-attention layers can carry a different geometry from its windowed ones, declared as
`num_global_key_value_heads` and `global_head_dim`. Every Gemma 4 config states them; `gemma-4-31b` was entered
without them and overstated its cache twofold at a long window. The field table above now names them, and no
other model here whose layers are windowed declares them: the eight configs were read today.

### 2026-10-19 · DeepSeek V4.1-Flash is ruled out on size at a figure of its own now, and Tencent published a GGUF for Hy-Memory 30B-A3B

**The 2026-09-25 ruling-out of DeepSeek V4.1-Flash was secondhand, and the firsthand figure is worse, not
better.** The 1017 checkpoint went up on 2026-10-17 under **MIT**
([the repo](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)) and is the top of Hugging Face's
trending list today, and unsloth published
[the GGUF](https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF) the same day. The sizes are that
repository's own file list, read off the Hugging Face API today, summing each build's shards:

| Build | Files | Weights |
|---|---|---|
| UD-IQ1_S | 5 | 232.98 GB |
| UD-IQ1_M | 5 | 250.40 GB |
| UD-IQ2_XXS | 6 | 300.48 GB |
| UD-Q2_K_XL | 7 | 334.79 GB |
| UD-IQ3_XXS | 7 | 394.74 GB |
| UD-IQ3_S | 8 | 423.63 GB |
| UD-Q3_K_XL | 8 | 485.07 GB |
| UD-Q4_K_XL | 9 | 500.71 GB |
| UD-Q8_K_XL | 9 | 508.38 GB |

Four bits is **500.71 GB** against the 384 GB the roomiest machine here hands a model, so it misses by a
third rather than by the ninth the "426.1 GB at 3.0 bits per weight" figure suggested. Even UD-IQ3_XXS at
394.74 GB misses. UD-Q2_K_XL at 334.79 GB would fit, and this data carries no two-bit build. The ruling-out
stands and is no longer the closest one on size.

**Hy-Memory-30B-A3B now has its publisher's own GGUF, and it is not a general model.** Tencent put
[the GGUF](https://huggingface.co/tencent/Hy-Memory-30B-A3B-GGUF) up today beside
[the weights](https://huggingface.co/tencent/Hy-Memory-30B-A3B) of 2026-10-15, under **Apache 2.0**.

- **Size.** `hy3a3b-memrl1009-step250-Q4_K_M-imat.gguf` is 18,236,702,464 bytes, so **18.24 GB**, with Q6_K
  at 24.71 GB and Q8_0 at 31.99 GB. A community conversion published three days earlier
  ([rapatsky](https://huggingface.co/rapatsky/Hy-Memory-30B-A3B-GGUF)) gives the same Q4_K_M to within 224
  bytes. The BF16 safetensors index totals 60,129,463,808 bytes, so **30.06B** parameters; the card states
  **about 3B active** and no total.
- **Architecture**, off the repository's own `config.json`: **48 layers**, `num_key_value_heads` **4** at
  `head_dim` **128**, `hidden_size` 2048, 128 experts with 8 routed per token, the first layer dense and the
  other 47 sparse, `max_position_embeddings` **262,144**. `kv_cache_gb_per_8k` works out at **0.805 GB**: 4
  KV heads at 128 wide, 2 bytes, keys and values, is 2,048 B a token a layer, 98,304 B over the 48.
- **Two things stop it being a row, and neither is a search away.** It is a **memory writer**, trained to
  replace the general-purpose model inside Mem0, MemOS and EverMemOS on the write path, which is not the
  job every other model here is priced for; and nobody rents it, so there is no token price for a pay-back
  to beat. It is on no OpenRouter listing today, and Artificial Analysis has no page for it. The GGUF
  filename also names a training checkpoint, `memrl1009-step250`, rather than a release.

**Dory 1.0 4B ships no four-bit build from NVIDIA.**
[nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-GGUF](https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-GGUF)
holds one file, Q5_K_M at 3,673,288,864 bytes, so **3.67 GB**, and the BF16 repository is 7.95 GB under
**OpenMDW-1.1**. Its `config.json` is the interesting part and the obstacle: **72 layer entries, 36 of them
MLP, 27 sliding attention at a 1024-token window and 9 full attention**, `num_key_value_heads` **4** at
`head_dim` **256**, `max_position_embeddings` **262,144** — and 40 of those layers are recurrent, run
**twice** (`n_recurrent_loops`), which is a cache this data has no convention for. Q5_K_M is also a
precision no row here carries.

**LFM2.5 24B-A2B is unchanged from yesterday**: OpenRouter still lists `liquid/lfm-2.5-24b-a2b` at $0.05 in
/ $0.70 out per million at 128,000 tokens, and Artificial Analysis still 404s on `/models/lfm2-5-24b-a2b`,
so the index score is still the one open field on the best-sourced candidate here.

### 2026-10-18 · LFM2.5 24B-A2B is the best-sourced candidate on this list: every field but the index score, and somebody rents it

**[LiquidAI/LFM2.5-24B-A2B](https://huggingface.co/LiquidAI/LFM2.5-24B-A2B) is a new size of a family
this site already prices**, and Liquid published
[the GGUF](https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF) itself, last changed 2026-10-13.
Sizes are the repository's own file list, read off the Hugging Face API today:

| Build | Bytes | Weights |
|---|---|---|
| Q4_K_M | 14,526,258,464 | 14.53 GB |
| QAD-Q4_0 | 13,578,190,880 | 13.58 GB |
| Q5_K_M | 17,029,602,592 | 17.03 GB |
| Q6_K | 19,689,405,728 | 19.69 GB |
| Q8_0 | 25,493,732,640 | 25.49 GB |
| BF16 | 47,962,094,880 | 47.96 GB |

- **Size.** The card states **24.0B total** and **2.45B active**, and Q4_K_M at 14.53 GB puts it
  between Mistral Small 3.2 24B (14.33 GB) and Qwen3.8 27B (16.46 GB), so most of this list holds it.
- **Architecture**, off the base repository's own `config.json`: **40 layers**, `hidden_size` 2048, 32
  attention heads, `num_key_value_heads` **8**, and the layers alternate convolution with full
  attention, which appears every fourth layer from index 2, so **10 attention layers**. 64 experts
  with 4 routed per token, the first 2 layers dense. `max_position_embeddings` **131,072**. The config
  omits `head_dim`, so it is 2048 ÷ 32 = **64**, the same derivation the LFM2.5 2.6B row records.
  `kv_cache_gb_per_8k` works out at **0.168 GB**: 10 attention layers at 8 x 64 x 2 bytes x 2 is
  2,048 B a token each, 20,480 B in all. A convolution layer keeps a fixed state, so it is ignored,
  which is the convention this data already uses for the 2.6B.
- **Licence lfm1.0**, named in the repository metadata with a `LICENSE` file beside the weights, the
  same licence string the 2.6B row carries as "LFM 1.0 (see repo)".
- **The rental price is an exact match, not a stand-in.** OpenRouter lists `liquid/lfm-2.5-24b-a2b`
  today at **$0.05 in / $0.70 out** per million tokens, at 128,000 tokens of context. That is the
  field a model this size usually lacks here, and the 2.6B row above it has to say its endpoint is
  free, which makes its break-even meaningless.
- **Missing: the index score.** Artificial Analysis has no page for it — `/models/lfm2-5-24b-a2b` is a
  404 today, and the `lfm2-24b-a2b` page that search returns is the older LFM2, whose figures differ
  between index versions. So `frontier_equivalent` and the capability ratings are the open fields.

**Two other new names, neither ready.** [inclusionAI/Ling-3.1-flash](https://huggingface.co/inclusionAI/Ling-3.1-flash)
has weights now, which closes the 2026-10-02 note that it was announced and not open: **MIT, 560B
total and 25B active, 1M context**, and OpenRouter rents it at $0.075 / $0.225. The repository links a
quantisation listing rather than a file, so there is no four-bit size to cite, and at that parameter
count whether anything here holds it is exactly what the missing figure decides. Tencent published
**Hy-Memory-30B-A3B**, and NVIDIA **Nemotron-Labs-Dory1.0-4B** with its own GGUF; neither has been
read here yet.


### 2026-10-17 · Beam's four-bit GGUF is out at 306.53 GB, and Nemotron 3.5 Bolt is a two-bit vision model NVIDIA quantised itself

**The one thing standing in the way of yesterday's Beam entry is gone.**
[unsloth/Beam-1.0-501B-A23B-GGUF](https://huggingface.co/unsloth/Beam-1.0-501B-A23B-GGUF) went up
2026-10-16 under **Apache 2.0**, and NVFP4 is no longer the only four-bit build. The sizes are the
repository's own file list, read off the Hugging Face API today, summing each build's shards:

| Build | Files | Weights |
|---|---|---|
| UD-Q4_K_XL | 8 | 306.53 GB |
| UD-Q3_K_XL | 6 | 242.31 GB |
| UD-Q2_K_XL | 5 | 186.88 GB |
| UD-IQ2_M | 5 | 164.81 GB |
| UD-IQ1_M | 4 | 123.61 GB |
| Q8_0 | 13 | 532.79 GB |
| BF16 | 23 | 1,002.67 GB |

GGUF is what llama.cpp reads on Apple Silicon, so the four-bit build at **306.53 GB** runs on both
machines here with room for it, where NVFP4 at 293.63 GB runs on neither: the Mac Studio M5 Ultra,
512GB, which has no published price, and the discontinued Mac Studio M3 Ultra, 512GB at its $9,499
launch price, both 384 GB usable. It would be the largest thing priced here by a long way, against
188.99 GB for GLM-5.3-Flash. Arithmetic on the architecture fields recorded yesterday, not a new
figure: 384 GB less 306.53 leaves 77 GB, and the cache works out at 0.392 GB per 8k, so Beam's own
1,048,576-token ceiling wants about 39 GB of it. **UD-Q4_K_XL is a quantisation label this data does
not carry** — the nearest is UD-Q4_K_M — and the choice between it and NVFP4 is part of the same
judgement.

**The rental price is a spread, and yesterday's figure is the cheapest end of it.** OpenRouter's
endpoints API lists four providers for `reflection/beam-1.0-501b-a23b` today, all at 1,048,576
tokens of context: **$0.25 in / $1.00 out** per million at Nebius, $0.40 / $1.20 at Together,
$1.00 / $3.00 at CoreWeave and $1.30 / $4.30 at BaseTen. The models list prints CoreWeave's. So a
row needs the provider named as well as the quantisation, and `index_version` is still the one field
Artificial Analysis does not print.
[the endpoints API](https://openrouter.ai/models/reflection/beam-1.0-501b-a23b).

**Nemotron 3.5 Bolt 74B-A9B is genuinely new, small enough for most of this list, and both of its
awkward fields are ones already on Ryan's side.** NVIDIA published
[the GGUF](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF) itself, created
2026-10-07 and last changed 2026-10-15, beside
[the BF16 weights](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16), and
Artificial Analysis wrote it up on 2026-10-15.

- **Size.** The BF16 repository's safetensors index gives 74,885,081,096 parameters, so **74.89B**,
  and the card states 74B total with **9B active**. NVIDIA's GGUF is one file,
  `NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB.gguf`, at 22,018,326,528 bytes, so **22.02 GB**, with a
  separate 1.73 GB `mmproj` for the vision encoder. The card calls the precision **IQ2, two-bit with
  quantisation-aware training**, built to fit 24 GB and run beside other applications. The one
  four-bit build is a third party's:
  [unsloth](https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF) publishes
  UD-Q4_K_XL over three shards at **50.22 GB**.
- **Architecture**, off the BF16 repository's own `config.json`: **88 blocks, 40 Mamba-2, 40 LatentMoE
  and 8 attention**, `num_key_value_heads` **2** at `head_dim` **128**, `hidden_size` 4096, 512
  experts with 9 routed per token and one shared, `max_position_embeddings` **262,144**. A Mamba
  block's state does not grow with the window, so in the convention this site already uses for linear
  attention it is ignored, and `kv_cache_gb_per_8k` works out at **0.067 GB**: 8 attention blocks at
  2 x 128 x 2 bytes x 2 is 1,024 B a token each, 8,192 B in all. That is the smallest cache of
  anything this size here.
- **Licence OpenMDW-1.1**, named in the card's front matter with
  [its text](https://openmdw.ai/license/1-1/), for commercial or non-commercial use.
- **Score.** Artificial Analysis gives **21** on its Intelligence Index, 21.4 in the article, fourth
  among models under 100B, and notes it is verbose: 230M tokens over the index against a median of
  100M. No index version on either page.
  [the model page](https://artificialanalysis.ai/models/nemotron-3-5-bolt-74b-a9b),
  [the article](https://artificialanalysis.ai/articles/nemotron-3-5-super-and-bolt).
- **Nobody rents it.** It is on no OpenRouter listing today, so `cloud_equivalent` has no exact
  match, and a pay-back needs a token price to beat. That is the field it is short of.
- **The two judgements are both on the list above already.** It is image-text-to-text, like Reka Edge
  2603, so it is the vision question again; and the build its publisher ships is two-bit, like
  Underdog Saluki 27B on 2026-10-15. What is different is that both come from NVIDIA rather than from
  a third party, with quantisation-aware training behind the two bits rather than a conversion after
  the fact.

**Muse Spark Open 816B-A42B is ruled out on size.** The GGUF repository
[unsloth/Muse-Spark-Open-816B-A42B-GGUF](https://huggingface.co/unsloth/Muse-Spark-Open-816B-A42B-GGUF),
last changed 2026-10-15, names `meta-models/Muse-Spark-Open-816B-A42B` as its base model, and its
four-bit build is **UD-Q4_K_XL at 505.50 GB**, with UD-Q3_K_XL at 401.48 GB. Both are past the
384 GB the roomiest machine here hands a model, so nothing on this site runs it at any window.
UD-Q2_K_XL at 311.23 GB would fit, and this data carries no two-bit build. It is also
image-text-to-text, with a licence the repository records only as "other". OpenRouter lists
`meta/muse-spark-open` at $1.25 in / $4.25 out per million at 1,048,576 tokens of context, so the
price half is there if a smaller build appears. Revisit if a four-bit build lands under 384 GB or a
roomier machine is priced, which puts it behind Tencent Hy4 and Atria Dawn.

**Nothing else new to price.** The searches were the ones this file lists — a release this month, a
release this week, each family the script prints, and a new quantisation — and everything else they
returned is already here or already ruled out below. **Reka Edge 2603, Underdog Saluki 27B, LFM2.5-24B-A2B,
Mellum2.1 Thinking, Kolibri 1, Apodex 1.1 Mini, MiMo-V2.6-Flash and Index-Translate-35B-A3B are
unchanged**, each still short of the fields its own entry lists.

### 2026-10-16 · Beam's weights are out, every field but one is citable, and the four-bit build is NVFP4

**Eleven days on this list as an announcement, and today the files landed.** Reflection published
Beam 1.0 on 2026-10-16 under **Apache 2.0**, in three precisions, with no GGUF or MLX build from
anybody yet. The sizes are the repositories' own file lists, read off the Hugging Face API today,
summing the safetensors:

| Repository | Numerics | Files | Weights |
|---|---|---|---|
| [reflection/Beam-1.0-501B-A23B](https://huggingface.co/reflection/Beam-1.0-501B-A23B) | BF16 | 198 | 1,002.67 GB |
| [reflection/Beam-1.0-501B-A23B-FP8](https://huggingface.co/reflection/Beam-1.0-501B-A23B-FP8) | FP8 | 197 | 503.29 GB |
| [reflection/Beam-1.0-501B-A23B-NVFP4](https://huggingface.co/reflection/Beam-1.0-501B-A23B-NVFP4) | NVFP4 | 63 | 293.63 GB |

**Every architecture field comes off the NVFP4 repo's own `config.json`.** 52 layers, the first 3
dense and the other 49 mixture-of-experts with 256 experts and 8 routed per token;
`hidden_size` 5,120; 48 query heads to **8 KV heads at `head_dim` 128**; `sliding_window` 512 on 43
of the 52 layers, the other 9 full attention; `max_position_embeddings` **1,048,576**;
`quant_algo: NVFP4` from modelopt, 4-bit weights and activations at group size 16. The parameter
count is 501.27B total and 23.4B active per token, and the Hub reads the NVFP4 checkpoint as 254.6B
parameters because most of it is packed into U8 (246.63B U8, 7.95B BF16, 64.2M F32). So
`kv_cache_gb_per_8k` works out at **0.392 GB** in the convention this site already uses for
gpt-oss: 9 full layers at 8 x 128 x 2 bytes x 2 is 4,096 B a token, which is 0.302 GB over 8k, plus
43 windowed layers that stop growing at 512 tokens, 0.090 GB.

**The price and the score are sourced too.** OpenRouter lists `reflection/beam-1.0-501b-a23b` at
**$0.25 per million input and $1.00 per million output** with a 1,048,576-token context, read from
its models API today. Artificial Analysis says Beam **scores 30** on its Intelligence Index, second
among US open-weights models, in an article dated today; that page gives no index version, so
`index_version` is the one field in a `models.json` entry with nothing behind it.
[OpenRouter](https://openrouter.ai/models/reflection/beam-1.0-501b-a23b),
[Artificial Analysis](https://artificialanalysis.ai/articles/recent-open-weights-model-launches),
[Reflection's own post](https://reflection.ai/blog/beam-is-available),
[the Hugging Face write-up](https://huggingface.co/blog/reflection-beam).

**The judgement is the quantisation, and it is Ryan's.** At 293.63 GB the NVFP4 build would be the
largest thing priced here by a long way, against 188.99 GB for GLM-5.3-Flash today, and two
machines on this site hand a model that much: the Mac Studio M5 Ultra, 512GB, which has no
published price, and the discontinued Mac Studio M3 Ultra, 512GB at its $9,499 launch price, both
384 GB usable. Both are Apple Silicon, and NVFP4 is a Blackwell format that neither llama.cpp nor
MLX reads, so the only four-bit build published cannot run on either machine with room for it. FP8
at 503.29 GB and BF16 at 1,002.67 GB fit nothing here at all. So the three ways to take it are:
price it at NVFP4 on two machines that cannot run it, wait for a four-bit GGUF or MLX build and
price it then, or leave it out. Nothing else on the watch is this close.

**Nothing else new to price.** One tracker's open-weight section still reads "no open source
releases this week", and searches for a release this month, for the families the script prints and
for a new quantisation turned up nothing that is not already here or already ruled out.
[llm-stats updates](https://llm-stats.com/llm-updates).

**Mistral Large 4 is ruled out on size, and the figures are worth recording.** Mistral opened a
hosted preview on 2026-10-06 and says the open weights come at the end of this month; a Hugging
Face listing for `Mistral-Large-4-1T-A52B` is dated 2026-10-31. The documentation puts it at
**1.05T total with 52B active**, a separate vision encoder and a context up to 1M, and no licence
text is published yet. The roomiest machine here hands a model 384 GB, so a four-bit build of a
trillion-parameter model runs on nothing on this site at any window, the same reason Kimi K3 was
closed on 2026-10-09. [the launch write-up](https://www.vktr.com/ai-platforms/mistral-large-4-debuts-as-1t-parameter-open-weight-model/),
[a second report of the date](https://aiweekly.co/alerts/mistrals-1t-parameter-large-4-slated-for-october-31-drop).

**Shieldstral 1.0 is ruled out on kind.** Mistral is one of the families the script lists, so it is
closed rather than passed over: a 3B policy-adaptive safety classifier published 2026-08-04 under
Apache 2.0, which checks text and images against a policy written in plain language. It answers a
moderation question rather than generating anything, so there is no hosted chat price to set it
against and no index score, which are two of the fields an entry here cannot do without.
[the release write-up](https://rits.shanghai.nyu.edu/ai/mistral-releases-shieldstral-a-3b-policy-adaptive-safety-classifier).

**Underdog Saluki 27B, Mellum2.1 Thinking, Kolibri 1, Apodex 1.1 Mini, MiMo-V2.6-Flash and
Index-Translate-35B-A3B are unchanged**, each still short of the fields its own entry lists.

### 2026-10-15 · Underdog Saluki 27B is Qwen3.8 27B at two bits, 7.90 GB against 16.46, and nobody scores it

**A model already priced here, at a precision this site does not carry, from a publisher that is
not Qwen.** [ConwayResearch/Underdog-Saluki-27B-1.0](https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0)
went up 2026-10-08 under **Apache 2.0** and has **344,177 downloads** and 496 likes in a week. Its
card names `Qwen/Qwen3.8-27B` and a GSQ-RCO GGUF of it as its base models, with
`base_model_relation: quantized`, so this is the entry already in `data/models.json` as
`qwen3.8-27b-q4` at a different precision, not a new model. Hugging Face's API gives the one file,
`Underdog-Saluki-27B-1.0-IQ2-mix.gguf`, at **7,898,369,152 bytes, so 7.90 GB**, against the
**16.46 GB** recorded here for that model at Q4_K_M. The architecture fields and
`kv_cache_gb_per_8k` would carry over from the existing entry unchanged, a quantisation changing
neither, and `max_context_tokens` stays 262,144; the card runs its own quickstart at a 32k window.

**It is the quality half that has no source, and a two-bit build is where that matters most.** The
only figures on offer are the publisher's own: 88 against 84 on a tool-calling bench of its own
making, 42 parallel calls against 35, and "96% average retention across 9 benchmarks". None of
those is an Artificial Analysis index score, and **Artificial Analysis has no page for it** — what
it scores is Qwen3.8 27B, at 34, which is this build's base model and not this build. Nobody rents
a two-bit quant either, so `cloud_equivalent` has no exact match. So the gap is not one field: it is
whether a third-party IQ2 quant, whose only evidence of what it keeps is the publisher's own
benchmark, belongs beside 55 entries whose scores all come from one index. That is Ryan's call, and
the pattern is the same one the 2026-10-11 Reka Edge entry raised from the other side.

**LFM2.5-24B-A2B is unchanged: `artificialanalysis.ai/models/lfm2-5-24b-a2b` is still a 404 today.**
Every other field for it is read off Liquid's own repositories; see the 2026-10-14 entry below.

### 2026-10-14 · LFM2.5-24B-A2B wants only the score, and Ling 3.1 flash has its weights at last

**Every field but the index score is read off Liquid's own repositories, and the family is
already here.** [LiquidAI/LFM2.5-24B-A2B](https://huggingface.co/LiquidAI/LFM2.5-24B-A2B) went up
2026-10-12 under the **LFM 1.0** licence, the same licence `data/models.json` already records for
LFM2.5 2.6B, and the
[GGUF build](https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF) is Liquid's own repository
rather than a third-party conversion. Hugging Face's API gives
`LFM2.5-24B-A2B-Q4_K_M.gguf` at **14,526,258,464 bytes, so 14.53 GB**, one unsharded file, beside
QAD-Q4_0 at 13.58 GB, Q5_K_M at 17.03 GB, Q6_K at 19.69 GB, Q8_0 at 25.49 GB and BF16 at 47.96 GB.
The safetensors index gives the total as **23,971,585,280, so 23.97B**, and the model card states
**24.0B total and 2.45B active** per token.

Its `config.json` has what `kv_cache_gb_per_8k` is computed from, and it is the same shape as the
2.6B entry already here: **40 layers**, of which the card counts **30 double-gated short
convolution blocks and 10 GQA**, `num_key_value_heads` **8**, and `hidden_size` 2048 over 32
attention heads, so **head_dim 64** derived the way the existing entry derives it, the config
naming no `head_dim`. `max_position_embeddings` is **131,072**. 64 experts, top-4 routing.

The rental price is sourced too: OpenRouter's API lists **liquid/lfm-2.5-24b-a2b** at **$0.05 per
million input tokens and $0.70 per million output**, 128k context, an exact match for the model,
read 2026-10-14. That leaves the two that are judgements or somebody else's measurement:
**Artificial Analysis has no page for it** — `/models/lfm2-5-24b-a2b` is a 404 today, and the
`lfm2-24b-a2b` page is the older model, not this one — and the five capability ratings.

**Ling 3.1 flash is open now, and it would be the largest model this site prices.** The 2026-10-02
and 2026-10-10 entries had it announced with no weights.
[inclusionAI/Ling-3.1-flash](https://huggingface.co/inclusionAI/Ling-3.1-flash) went up 2026-10-13
under **MIT**, shipping FP8 safetensors; the API's index puts the total at **572,120,680,768, so
572.12B**. Its `config.json` gives **72 layers**, `head_dim` 128, `num_key_value_heads` 64, latent
attention with `kv_lora_rank` **512** and `qk_rope_head_dim` **64** — the fields `src/fit.ts`
already reads for a latent-attention model — and `max_position_embeddings` **262,144**.
Artificial Analysis scores it **41**, on index **v4.3.2** rather than the v4.3 every score here was
read at, which is the one figure that is not a clean fit. OpenRouter lists **inclusionai/ling-3.1-flash**
at **$0.075 and $0.225** per million.

It is not out on size, which is the surprise: the only four-bit build on offer,
[AtomicChat/Ling-3.1-flash-GGUF](https://huggingface.co/AtomicChat/Ling-3.1-flash-GGUF), sums to
**354.39 GB at Q4_K_M** across its shards, against the **384 GB** the roomiest machine here hands a
model. So it fits, on one machine, and that machine is the discontinued Mac Studio M3 Ultra, 512GB
at its $9,499 launch price, plus the unpriced M5 Ultra, 512GB. Two things are Ryan's call before it
could be a row. The build is third party, it is sharded rather than one
file, and every file carries an `AD-` prefix this watch cannot account for; and a model whose only
holder is off the market would be the first here that no machine still sold can run at any window.

### 2026-10-13 · Mellum2.1 Thinking is the first candidate whose only gaps are the two judgements

**Everything a row needs but the score and the price is read off JetBrains's own repositories.**
[JetBrains/Mellum2.1-12B-A2.5B-Thinking](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking)
is **Apache 2.0** on the licence tag of both the weights and the GGUF repo, and the official
[GGUF build](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF) is a JetBrains
repository rather than a third-party conversion. Hugging Face's own API gives
`Mellum2.1-12B-A2.5B-Thinking-Q4_K_M.gguf` at **8,071,295,264 bytes, so 8.07 GB**, one unsharded
file, beside MXFP4_MOE at 7.03 GB, Q6_K at 10.88 GB, Q8_0 at 12.93 GB and BF16 at 24.31 GB. The
API's safetensors index gives the total outright, **12,149,923,072, so 12.15B**. The **2.5B active
per token** is the repo's own name and the write-ups rather than a field, so that one wants the
card; Hugging Face answered 429 to every attempt at it today.

**The architecture is the shape this site already carries.** `config.json` reads 28 layers, 32
attention heads, **4 key-value heads, head dim 128**, hidden size 2304, 64 experts with 8 active,
and `use_sliding_window` with a **1024-token window**; `layer_types` runs three
`sliding_attention` to one `full_attention` through all 28, so **7 layers hold full attention**
(4, 8, 12 … 28). That is `full_attention_layers` 7, `sliding_window_layers` 21,
`sliding_window` 1024 beside `n_layers` 28, and the site's own formula then gives
`kv_cache_gb_per_8k` **0.161**: 0.51 GB of cache at 32k, 1.92 GB at 128k, so **8.58 GB to hold at
32k** and 9.99 GB at its ceiling. `max_position_embeddings` is **131072**, with separate rope
settings per attention type (yarn, factor 16, on the full-attention layers).

**The two missing fields are the two that are judgements, not measurements.** Artificial Analysis
lists no Mellum model, checked by name today, so `frontier_equivalent` has nothing to take, and
that page now heads its index **v4.3.2** where `data/models.json` records v4.3. Nobody rents it
either: OpenRouter's model list answered 461 models today and holds no Mellum and nothing from
JetBrains, so `cloud_equivalent` needs a stand-in and a basis. It is a coding model, which makes
the nearest hosted match a choice rather than an arithmetic, so both are Ryan's call. The repo's
own `model-index` carries 17 benchmark figures, SWE-bench Verified at 47.0 and LiveCodeBench v6 at
82.0 among them, every one marked unverified; none of them is an index score.

**Meta's two releases this week are hosted only.** Muse Wonder and Muse Wonder Full (12 October)
have no downloadable weights: Artificial Analysis lists Wonder as proprietary with no disclosed
parameter count, and Meta's Hugging Face organisation still publishes only Muse Glimmer 30B, which
this site already prices. Mistral Large 4's API preview opened 6 October with weights said to be
due by the end of the month, so it is a watch rather than a candidate. Kolibri 1, from 2026-10-12,
is unchanged: still no Artificial Analysis page.

### 2026-10-12 · Kolibri 1 now has every field but one, read off the repository itself

**The `architecture` gap from 2026-10-06 is closed, first-hand.** `Aleph-Alpha/Kolibri-1`'s own
`config.json` answered this run: **50 layers, 4 key-value heads, head dim 128**, hidden size 2560,
and `use_sliding_window` with a **513-token window on 40 of the 50 layers**, full attention on the
other 10 (layers 5, 10, 15 … 50). That is the same shape `data/models.json` already carries for
Gemma 3 12B it and gpt-oss-120b — `full_attention_layers`, `sliding_window_layers`, `sliding_window`
beside `n_layers` — so `kv_cache_gb_per_8k` is computable here rather than blocked, and the cache
will barely grow with context for the same reason theirs does not.

**The four-bit size is now exact rather than about.** Hugging Face's own API gives
`Kolibri-1-Q4_K_M.gguf` at **47,454,113,472 bytes, so 47.45 GB**, a single unsharded file in
[Hob-forge/Kolibri-1-GGUF](https://huggingface.co/Hob-forge/Kolibri-1-GGUF), tagged `apache-2.0` and
`base_model:quantized:Aleph-Alpha/Kolibri-1`, last modified 2026-10-08. That repo's GGUF metadata
also states the parameter count outright, **78,103,074,560**, and the model card gives **3.46B active
per token** (3,457,573,120). The repo ships a `kolibri1-llama.cpp.patch` beside the files, which is
worth knowing before anybody quotes a speed: the build needs patching to load it.

**The context is 262,144, not the 1M the write-ups lead with.** The card reads "1,048,576 tokens; we
recommend ≤262,144 tokens for serving efficiency and complex tasks", `max_position_embeddings` is
262144, and so is the GGUF's `context_length`; the million needs `--max-model-len 1048576` and an
`--hf-overrides` of `max_position_embeddings`. So `max_context_tokens` is **262144** with a
`max_context_note` saying the million is an override, which is the kind of conditional that field
exists for. Licence is **Apache 2.0**, and the card limits it to the weights and configuration files
rather than the architecture or the training method.
[the repo](https://huggingface.co/Aleph-Alpha/Kolibri-1).

**One field is still missing, and it is the one nobody here can supply.** Artificial Analysis still
has no Kolibri page, confirmed by name again today, so `frontier_equivalent` has nothing to take.
The only number on offer is a reviewer's **15 to 20** inferred from the models Aleph Alpha chose to
compare against, which is a guess about a score and not a score
([trendingtopics](https://www.trendingtopics.eu/aleph-alpha-kolibri-open-weight/)). A hosted price
did turn up where 2026-10-06 found none — **$0.10 in and $0.40 out per million tokens** from
Inference.net, listed through a gateway rather than by Aleph Alpha, which still publishes no token
price ([the listing](https://www.respan.ai/models/inference_net/aleph-alpha/kolibri-1)). That is a
`cloud_equivalent` marked as a stand-in at best, and secondhand.

**Nothing new open-weight this week, and the two announced ones are still announcements.** Beam
(501B-A23B, Apache 2.0) has no weights and Reflection's Hugging Face org no models; Ling 3.1 Flash
(about 560B / 25B) has no `inclusionAI` repo — its model list, read directly this run, goes from
Ling-3.0-flash to this week's probe uploads with no 3.1. Mistral Large 4 is unchanged and out on
size. Hugging Face's newest text-generation uploads are fine-tunes, quantisations and probes of
models already priced here.

### 2026-10-11 · Reka Edge 2603 is open weights with every size and architecture field citable, and it is a vision model

**One candidate found, and this is the first entry whose figures were read off the repository
rather than off coverage of it.** Hugging Face answered directly this run, so the numbers below are
first-hand: file sizes from the repo's own file list, architecture from its `config.json`.

**Reka Edge 2603 (`RekaAI/reka-edge-2603`).** 7,128,509,568 parameters in BF16 across three
safetensors shards. The one GGUF repo linked from it carries a full ladder, **Q4_K_M at 4.75 GB**
(4,748,651,936 bytes), with a separate multimodal projector at 0.45 GB on top if images are used.
`config.json` gives the architecture fields outright: 32 layers, 8 key-value heads, head dim 128,
hidden size 4096, and `max_position_embeddings` of 16384 over a YaRN scaling of 2.0 on an 8192
base. It would be the smallest-context model on this site by a wide margin.

**Three things stop it being a row, and none of them is a missing file size.** It is an
**image-text-to-text vision-language model** — a 660M ConvNeXT V2 encoder on a 6B language
backbone — and every one of the 55 models here is a text model, so whether this site prices a VLM
at all is a scope question for Ryan rather than a figure to look up. Its licence is **Business
Source License 1.1** under the repo's own `reka-edge-2603-license`, free for commercial use only
below $1M of annual revenue, which is not the kind of open licence any current row carries.
And there is **no Artificial Analysis index score**: the index lists Reka Flash 3 and not Edge, so
`frontier_equivalent` has nothing to take. No `cloud_equivalent` price was found either; the model
page links an API and a playground and publishes no rates.

**It is not this week's release.** A release timeline dated it 9 October, which is what put it on
this run's list, but the repo was **created 2026-03-11 and last modified 2026-04-24**, and the
linked GGUF repo was last touched 2026-04-22 — the "2603" is a March 2026 date code. A
seven-month-old model this site never picked up, not a new one.
[the repo](https://huggingface.co/RekaAI/reka-edge-2603),
[the GGUF ladder](https://huggingface.co/Vastined/reka-edge-2603-GGUF),
[Reka's own page on the licence](https://reka.ai/reka-edge),
[the timeline that listed it](https://llmgateway.io/blog/new-ai-models-this-week-2026-10-11).

**Shieldstral 1.0 is ruled out on kind.** It turned up as a Mistral listing and is worth closing
because Mistral is a family the script prints: a 3B multimodal **safety classifier**, Apache 2.0,
released 2026-08-04, which judges text and images against a policy rather than answering a user.
Sources disagree on its size — coverage says about 3B on a Ministral-3B base, one aggregator citing
Mistral's own page says 3.8B — which would have mattered had the kind not already settled it.
[one write-up](https://dev.to/alifar/mistral-releases-shieldstral-a-3b-open-weight-model-for-on-device-content-safety-280p),
[the aggregator with the larger figure](https://www.datalearner.com/ai-models/pretrained-models/shieldstral-1-0).

**Nothing else open-weight this week.** The tracker's open-source section still reads "no open
source releases this week". Mistral Large 4 is unchanged and still out on size at about 1.05T, now
with independent coverage calling it the best model from outside the US and China and still putting
its weights at the end of October. Of the other names in this week's roundup, Reka Edge is above,
GLM 5.3 Fast was closed on 2026-10-08 as a mangled spelling of GLM-5.3-Flash, and the rest are
image, video or proprietary.
[llm-stats updates](https://llm-stats.com/llm-updates),
[Tom's Hardware on Mistral Large 4](https://tomshardware.com/tech-industry/artificial-intelligence/independent-tests-rank-mistrals-new-trillion-parameter-large-4-the-best-ai-model-outside-the-u-s-and-china-but-chinese-open-weights-still-overcome-europes-best-efforts).

**Beam's weights are still not out**, seventh day of searching. Coverage through 8 October still
puts them "later in October" under Apache 2.0, one comparison noting Reflection's Hugging Face
organisation holds no models, and access is still the waitlist. 501B total, 23B active. It comes off
this list the day the files land.
[eesel](https://www.eesel.ai/blog/reflection-ai-beam),
[devx](https://www.devx.com/artificial-intelligence-ai/reflection-ai-beam-model-explained/).

**Kolibri 1, Apodex 1.1 Mini, MiMo-V2.6-Flash, Index-Translate-35B-A3B and Ling 3.1 Flash are
unchanged**, each still short of the fields its own entry lists.

### 2026-10-10 · Nothing new to price, and Ling 3.1 Flash is closed with the figures to say so

**No open-weight release this week.** The tracker's open-source section still reads "no open source
releases this week", and the two releases it does date to this week are both proprietary: Mistral
Large 4 on 6 October and Claude Haiku 5.5 on 7 October. Mistral is one of the families the script
lists, so that one is checked and ruled out on kind rather than passed over. Searches for a release
this month, for the families the script prints and for a new quantisation turned up nothing that is
not already here or already ruled out. [llm-stats updates](https://llm-stats.com/llm-updates).

**Ling 3.1 Flash is ruled out on kind, and now the figures are written down.** The 2026-10-02 entry
had it announced and not open; it is still not open, and the numbers are worth recording because this
site already prices a Ling. It is a hybrid reasoning mixture-of-experts model of about **560B total
with about 25B active**, dated 30 September by one source and 2 October by another, and one
aggregator lists it as proprietary with the weights unreleased and open-sourcing described as a plan
for after a trial period. The trap to note: a second aggregator's page for **Ling 3 Flash** carries
124B and about 5.1B active, which is the model this site already prices at Q4_K_M, not this one.
[OpenRouter's page](https://openrouter.ai/models/inclusionai/ling-3.1-flash),
[llmreference on the licence](https://www.llmreference.com/model/ling-3.1-flash),
[the 124B page not to confuse it with](https://cloudprice.net/models/inclusionai-ling-3-flash).

**Beam's weights are still not out**, sixth day of searching by name and for a repository. Every
write-up of the 5 October announcement still puts them "later in October" under Apache 2.0, one
saying before the end of the month, and access is still the waitlist. 501B total with 23B active. No
Hugging Face listing, and it comes off this list the day the files land.
[SCMP](https://scmp.com/tech/tech-trends/article/3369885/nvidia-backed-reflection-ai-challenges-chinese-dominance-open-weight-models),
[vktr](https://www.vktr.com/ai-platforms/reflection-ai-unveils-beam-a-501b-open-weight-model/),
[Silicon UK](https://www.silicon.co.uk/ai-2/reflection-beam-open-631797).

**The quantisation search turned up no new precision to price.** One quantiser's collection lists
GGUF and MLX ladders for Laguna XS 2.1 and dynamic-imatrix GGUF of Qwen3.6 27B and 35B-A3B — all
three already entered here at Q4_K_M — plus GGUF builds of Gemma 4 draft models, which are not a
model this site would rank. Nothing on the page is dated, so none of it is citable as new even where
it is. [the collection](https://huggingface.co/AtomicChat/collections).

**Kolibri 1, Apodex 1.1 Mini, MiMo-V2.6-Flash and Index-Translate-35B-A3B are unchanged.** Kolibri 1
was searched again for a Q4_K_M file size and there is still no listing for the model itself; the
only 78B four-bit sizes search returns belong to other models and are not its.

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
