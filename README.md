# Sunk Cost

Live at **https://sunkcost.ai** · Source: https://github.com/rlindsey2/sunkcost

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
                      device_price is what you paid, if you entered it, else the list price
breakeven_tokens    = breakeven_days × daily_tokens
```

Memory fit: `weights_gb + kv_cache(context) ≤ usable_memory_gb`. KV cache is derived per layer from `n_kv_heads × head_dim × 2 bytes × 2`, with sliding-window layers capped at their window and linear-attention layers ignored. Usable memory on Macs follows the macOS default GPU wired limit (two-thirds at ≤32 GiB, 75% above).

Context cost: every generated token reads the weights *and* the whole KV cache, so speed scales by `(weights + kv_at_measured_context) / (weights + kv_at_your_context)`. That matches the published short-vs-long-context benchmarks within about 20-30%; see `defaults.context_decay` for the three calibration cases and `npm test` for the assertions.

Estimated speed: `bandwidth ÷ bytes read per token × efficiency` (active parameters only for MoE). Efficiency is 0.75 for dense models and 0.3 for MoE on Apple Silicon (0.65 on DGX Spark), calibrated against the measured pairs in `throughput.json` and explained in `defaults.json`.

## Design

The palette comes from bathymetric charts: paper at the surface, graduated blues descending to the abyss, and one warm accent held back for the moment the curve breaks through. Instrument Sans carries the interface and the verdict; IBM Plex Mono carries every figure, so numbers do not jitter as sliders move.

The break-even card is one body of water rather than a chart in a box. The sky, the surface and the deep run edge to edge, and the verdict is written on the water itself, so the picture and the number are a single object you can screenshot. The window always frames the whole climb: the curve rises from the purchase to the moment it breaks the surface, however far away that is, and the time axis carries the scale. Only when it never pays back does the window fall back to a fixed span, and the flat line is the message.

Layout: the machine is a sentence, everything else hangs off it. "I'm looking at a [Mac Studio], the [M5 Max] with [64 GB] of memory" — three inline selects — with the list price and an "I paid something else" toggle as a clause beneath. Under that, two columns: on the left the water with the verdict, then the usage card (use case, tokens a day, context window) so you can drag a slider and watch the curve move, then the figures and the working; on the right every model, the ones that fit first and the ones that don't greyed with the reason, scrolling on its own. On a phone the columns stack in that order.

## What the page shows

- **Machine picker**: device family, chip or system (current lineup and discontinued previous generation), memory tier with price, and a **What you paid** box that overrides the list price. Useful for a machine bought at launch, second-hand or on sale, and it is the only way to price the configurations with no published list price. It clears when you switch machines, since a price you paid for one box says nothing about another.
- **Use case dropdown** sets the input:output ratio in plain terms (chat, writing, summarising, coding, agentic coding, document search), with a custom ratio slider.
- **Tokens-a-day slider** with a plain-English label, plus the machine's daily ceiling: tokens/sec × 86,400 × (ratio + 1). If you ask for more than the machine can generate in 24 hours, the verdict uses the ceiling and says so.
- **Context slider** changes the KV-cache memory each model needs, slows the quoted speed accordingly, shows each model's own maximum context, and greys out models whose limit is below the setting.
- **Sorting**: best fit, smartest, fastest, biggest saving, smallest memory, cheapest to just use an API. Models that fit always sort ahead of ones that don't.
- **Model list** with a family filter, capability dots, the cloud equivalent and its OpenRouter price, a frontier-comparison bar, and a sources line (weights, price, speed, comparison) on every card.
- **How smart is it, really?** A number line placing the selected model's Artificial Analysis Intelligence Index score against the current Anthropic and OpenAI models, with tier labels defined in `defaults.json` (`frontier_tiers`, `frontier_reference`).

## Share mechanic

- Every configuration is a URL. The address bar always holds a shareable link: `/s/<machine>/<model>/?…` when that pair has a card (the query carries usage, context, the price you paid and the rest), otherwise `/?…`.
- `scripts/build-og.ts` renders a 1200×630 card for every machine-and-model pair that has a verdict at the default usage, into `public/og/`, and writes `.generated/share-manifest.json`.
- `scripts/build-share-pages.ts` runs after `vite build` and writes one page per pair under `dist/s/`: the built app, unchanged, with its share tags set for that pair. Social scrapers don't run JavaScript, so this is what makes a link preview properly on X, Slack or iMessage. It is a plain file, so it costs nothing to serve and can't fall over under load.
- **Cards for a link's own settings.** When the switch is on, a link whose usage, ratio, electricity, context, price paid or API decline differs from the defaults previews with a card drawn for exactly those settings. `functions/s/[hw]/[model].ts` rewrites the share tags on the static page (no rendering, just the calculation), pointing at `functions/card/[hw]/[model].png`, which draws the card with the same code as the build (`src/card.ts`, resvg compiled to WebAssembly, the same font) and caches it. Settings with nothing honest to draw fall back to the pair's card. `cardQuery` in `src/share.ts` decides which settings count.
- Share pages carry `noindex`, since they are near-duplicates of the app. Older `/?hw=…&m=…` links still open the right configuration, with the generic card.

## The daily ceiling

`tokens_per_sec × 86,400` is the **output** a machine can generate running flat out for 24 hours. The total shown grosses that up by the input:output ratio, because input tokens count towards your usage but are read far faster than they are written, so they are treated as costing no time.

That last assumption is the weak one: prompt processing is fast, not free. On a heavy input ratio the real ceiling is plausibly 20-30% lower than shown. The fix is to record measured prompt-processing rates per model × hardware pair and subtract prefill time; see `capacity_note_TODO` in `defaults.json`.

## Generated pages

`npm run build:pages` writes real HTML into `public/` for everything a search might land on, then `vite build` copies it into `dist/`:

| Path | What it answers |
|---|---|
| `/leaderboard/` | Every open model ranked on one intelligence index, with the hosted Anthropic and OpenAI models in the same table for scale |
| `/models/<id>/` | What hardware you need to run it, cheapest and fastest and shortest pay-back, how good it is, what it costs either way |
| `/hardware/<id>/` | Can this machine run local LLMs, what it runs, how fast, and whether it pays back |
| `/compare/<a>-vs-<b>/` | Machine against machine, and each model against the next one down the leaderboard |

Plus `sitemap.xml` and `robots.txt`. Nothing on these pages needs JavaScript.

## Hosting

Live at **https://sunkcost.ai** on Cloudflare Pages (project `sunkcost`). Every push to `main` runs `.github/workflows/deploy.yml`: install, test, build, then `wrangler pages deploy dist`. The workflow needs the repository secret `CLOUDFLARE_API_TOKEN` (a token with Cloudflare Pages: Edit and nothing else) and the repository variable `CLOUDFLARE_ACCOUNT_ID`.

Everything served is a static file, so traffic is free and unmetered on Cloudflare's free plan. The one exception is the card functions above. Drawing a card takes roughly 100 ms of CPU, past the free plan's 10 ms per request, so they need Workers Paid ($5 a month). They are off unless the GitHub repository variable `DYNAMIC_CARDS` is `on`: `scripts/prepare-functions.ts` then routes `/s/*` and `/card/*` to functions in `dist/_routes.json`; off, only `/card/*` is routed, nothing links there, and share pages stay plain files. The limits that matter are 20,000 files per deployment (the build writes about 3,400) and 25 MiB per file. `public/_headers` sets cache lifetimes. DNS is on Cloudflare, where the domain is registered, and a redirect rule sends `www` to the apex.

`npm run build:single` inlines the CSS and JS into `dist/sunkcost-standalone.html` for hosts that take a single file.

The site first ran on Netlify (`sunkcost-preview.netlify.app`, builds now stopped). Its free plan takes every site offline once 300 monthly credits are spent, and each deploy costs 15, which is why it moved.

## Known gaps (all marked in the data)

- Eleven models nobody rents by the token are priced as their closest hosted match: a finetune's base model where there is one, otherwise the nearest model on the intelligence index, otherwise the nearest in size. Model cards, the figures and the working all say so, and `npm run validate` checks every stand-in still matches its source's price.
- Apple has not published power figures for the 2026 Macs; the previous chip's Apple figure is used as a labelled stand-in.
- Mac Studio M5 Ultra 512GB has no price yet.
- No measured tokens/sec exists for any 2026 Mac (they ship 22 September 2026); everything on them is estimated and labelled.
- Gemma 4, Qwen3.6/3.8, Mistral Small 4 have no capability ratings yet (`unknown`), though their frontier scores are in.
- Strix Halo power draw is measured only on the Framework Desktop; other boxes use it as a labelled stand-in. Usable memory uses the Windows 75% split; Linux users can get ~110 GB.
