# Sunk Cost — sunkcost.ai

A single page that answers one question honestly: *if I buy this hardware to run local models, how much would I have to use it before it pays for itself, and what can it actually do?*

It is willing to say "this doesn't pay off". That is the product.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # validates data, renders OG cards, writes routes.json, builds dist/
npm test           # maths, fit logic, context decay, sorting, URL state, waterline
npm run typecheck
npm run build:single  # one self-contained HTML file: dist/sunkcost-standalone.html
```

Static output lands in `dist/`. There is no backend: every number on the page comes from a field in `data/*.json` or from the formula shown under the result.

## Data files (edit these)

| File | What it holds |
|---|---|
| `data/hardware.json` | Each machine config: memory, bandwidth, usable memory, price, power draw. Current 2026 Apple lineup, the discontinued M4 / M3 Ultra machines (marked `generation: previous`, launch prices), the NVIDIA DGX Spark, and AMD Strix Halo boxes (Framework Desktop, GMKtec EVO-X2, Beelink GTR9 Pro, Minisforum MS-S1 Max, HP Z2 Mini G1a). |
| `data/models.json` | Each model × quant: GGUF size, architecture (for KV-cache), max context, capability ratings, cloud equivalent and OpenRouter price, frontier score and tier. |
| `data/throughput.json` | Measured tokens/sec per model × hardware pair, with the source. Anything not listed is *estimated* from bandwidth and labelled as such. |
| `data/defaults.json` | Usage default, use-case ratios, electricity price, estimate efficiency factors, context options and the decay model, sort options, frontier tiers and reference scores, the "data last checked" date. |
| `data/units.json` | The absurd human units for the verdict line. |

Rules the validator enforces (`npm run validate`):

- Unknown values are `null` with a `TODO`, never a plausible guess.
- `kv_cache_gb_per_8k` must agree with the architecture fields.
- A measured tokens/sec figure may not exceed the bandwidth ceiling for that model size.
- Stand-in power figures (Apple has not published 2026 numbers) must carry a note; the UI flags them.

## The maths

```
cloud_cost_per_day  = (daily_input_tokens  / 1e6 × input_price) + (daily_output_tokens / 1e6 × output_price)
local_cost_per_day  = (daily_output_tokens / local_tokens_per_sec / 3600) × device_watts / 1000 × electricity_price_per_kwh
daily_saving        = cloud_cost_per_day − local_cost_per_day
breakeven_days      = device_price / daily_saving        (never, if daily_saving ≤ 0)
breakeven_tokens    = breakeven_days × daily_tokens
```

Memory fit: `weights_gb + kv_cache(context) ≤ usable_memory_gb`. KV cache is derived per layer from `n_kv_heads × head_dim × 2 bytes × 2`, with sliding-window layers capped at their window and linear-attention layers ignored. Usable memory on Macs follows the macOS default GPU wired limit (two-thirds at ≤32 GiB, 75% above).

Context cost: every generated token reads the weights *and* the whole KV cache, so speed scales by `(weights + kv_at_measured_context) / (weights + kv_at_your_context)`. That matches the published short-vs-long-context benchmarks within about 20-30%; see `defaults.context_decay` for the three calibration cases and `npm test` for the assertions.

Estimated speed: `bandwidth ÷ bytes read per token × efficiency` (active parameters only for MoE). Efficiency is 0.75 for dense models and 0.3 for MoE on Apple Silicon (0.65 on DGX Spark), calibrated against the measured pairs in `throughput.json` and explained in `defaults.json`.

## What the page shows

- **Machine picker**: device family, chip (current lineup and discontinued previous generation), memory tier with price.
- **Use case dropdown** sets the input:output ratio in plain terms (chat, writing, summarising, coding, agentic coding, document search), with a custom ratio slider.
- **Tokens-a-day slider** with a plain-English label, plus the machine's daily ceiling: tokens/sec × 86,400 × (ratio + 1). If you ask for more than the machine can generate in 24 hours, the verdict uses the ceiling and says so.
- **Context slider** changes the KV-cache memory each model needs, slows the quoted speed accordingly, shows each model's own maximum context, and greys out models whose limit is below the setting.
- **Sorting**: best fit, smartest, fastest, biggest saving, smallest memory, cheapest to just use an API. Models that fit always sort ahead of ones that don't.
- **Model list** with a family filter, capability dots, the cloud equivalent and its OpenRouter price, a frontier-comparison bar, and a sources line (weights, price, speed, comparison) on every card.
- **How smart is it, really?** A number line placing the selected model's Artificial Analysis Intelligence Index score against the current Anthropic and OpenAI models, with tier labels defined in `defaults.json` (`frontier_tiers`, `frontier_reference`).

## Share mechanic

- Every configuration is a URL (`?hw=…&m=…&u=…&r=…&kwh=…&ctx=…&cs=…`). Changing anything updates the URL.
- `npm run build:og` renders a 1200×630 card for every computable hardware × model pair at the default usage into `public/og/`, plus `default.png`. The in-page "Download card" button renders the exact current config with the same code.
- **Limitation of static hosting:** social scrapers read `og:image` from HTML, not from JavaScript, so a bare query-string URL gets the default card. The per-config cards are wired up for the Phase 2 pages (`public/routes.json` lists every page, its title, query string and card). To get per-URL cards without those pages you would need an edge function, which is out of scope for v1.

## Sharing a preview

Live preview: **https://sunkcost-preview.netlify.app**

To redeploy after a change:

```bash
SITE_URL=https://sunkcost-preview.netlify.app npm run build:preview
netlify deploy --prod --dir=dist --site sunkcost-preview
```

The site was created through the Netlify API rather than the build hooks, so there is no git integration; deploys are manual uploads of `dist`. Note that this Netlify account defaults new sites to team-login protection (`sso_login`), which had to be turned off on this site for the link to be publicly viewable.

`npm run build:single` inlines the CSS and JS into `dist/sunkcost-standalone.html` — one file, no build step, no server. Open it from disk, email it, or publish it anywhere that takes a single HTML file. The site itself is plain static files in `dist/`, so any static host works: drag the folder onto Netlify Drop, `wrangler pages deploy dist`, or push and enable GitHub Pages.

## Phase 2 (structure only)

`scripts/build-routes.ts` emits `public/routes.json`: one entry per hardware config, per model, and per family comparison, each with the SEO title format, description, pre-filled query string, OG image and a written verdict. Generating the HTML for them is a routing exercise on top of that file.

## Known gaps (all marked in the data)

- Apple has not published power figures for the 2026 Macs; the previous chip's Apple figure is used as a labelled stand-in.
- Mac Studio M5 Ultra 512GB has no price yet.
- No measured tokens/sec exists for any 2026 Mac (they ship 22 September 2026); everything on them is estimated and labelled.
- Gemma 4, Qwen3.6/3.8, Mistral Small 4 have no capability ratings yet (`unknown`), though their frontier scores are in.
- Strix Halo power draw is measured only on the Framework Desktop; other boxes use it as a labelled stand-in. Usable memory uses the Windows 75% split; Linux users can get ~110 GB.
