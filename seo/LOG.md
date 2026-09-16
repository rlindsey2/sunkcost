# SEO log

Read this before doing anything. One entry per run, newest first. Pick up the top open item in
the backlog, or the open item the previous run said to continue. Never redo a done item.

## Ryan's side (needs the site owner)

- [ ] Verify sunkcost.ai in Google Search Console and Bing Webmaster Tools, submit
      https://sunkcost.ai/sitemap.xml, and share the Search Console CSV exports (queries, pages)
      by committing them under seo/exports/. Until then the agent works without query data.

## Backlog (ordered; the agent keeps this list current)

- [x] Audit every generated page's `<title>` and meta description (scripts/build-pages.ts,
      src/pagekit.ts): each title unique, under 60 characters, leading with the words people
      search; each description a plain answer under 155 characters. Done 2026-09-16.
- [ ] Structured data: Product/Offer or FAQPage JSON-LD on hardware and model pages, and
      BreadcrumbList everywhere. Validate the output with Google's Rich Results test via WebFetch.
- [ ] Internal linking: every hardware page links to the 3 models it runs best and the best-buys
      page; every model page links to the 3 cheapest machines that run it; the leaderboard links
      to hardware pages. Check for orphan pages in dist/sitemap.xml.
- [ ] Question pages for the searches people actually type: "is a Mac mini good for local LLMs",
      "RTX 3090 for local LLM worth it", "best GPU for local LLMs", "local LLM vs API cost",
      "how much RAM to run a 70B model". Each answers in the first paragraph with the site's own
      numbers, links into the calculator with the configuration prefilled, and cites sources.
- [ ] A "what people entered" page updated from `npm run submissions` output that Ryan commits
      under seo/exports/ (never from live database access; the agent has none).
- [ ] Core Web Vitals: check https://pagespeed.web.dev results for the home page and one
      hardware page via WebFetch; fix render-blocking font loading and image sizing.
- [ ] Canonical and duplicate control: /s/ share pages stay noindex; comparison pages A-vs-B and
      B-vs-A must not both exist; www and trailing-slash variants resolve to one URL.
- [ ] Open Graph images for generated pages (they use /og/default.png today). Comparison pages
      and /best/ and /leaderboard/ all point at the same default card; the model and hardware
      pages already get a real one. A comparison card would want the two machines side by side.
- [ ] The 7 head-to-head titles still over 60 characters are all pairs of long machine or model
      names (worst: MacBook Air M5 (15-inch), 16GB vs MacBook Pro M5 Pro (16-inch), 64GB, at 68).
      Shortening them further means dropping a memory size or a screen size, which are the things
      that tell two Macs apart. Probably leave, but worth a second look with query data.

## Runs

### 2026-09-16 — titles and descriptions for all 188 generated pages

Took the top backlog item. Audited every page under `public/` after `npm run build:pages`:

- 185 of 188 titles were over 60 characters (longest 101), so search listings cut them before
  the reader reached the point. On a head-to-head title the cut landed inside the *second*
  machine's name, which is the whole page.
- 54 descriptions were over 155 characters, all model pages.
- Worst of all: the 75 comparison pages shared **two** descriptions between them ("Side by side:
  what each runs…" on all 28 machine pages, one more on all 47 model pages). Boilerplate across
  40% of the site is how a set of pages gets read as duplicates.

Fixed in `src/pagekit.ts` and `scripts/build-pages.ts`, commit `5b08163`, pushed to main:

- `titleOf` / `descOf` take several complete variants, richest first, and use the fullest one
  that fits. Nothing is truncated mid-sentence. The " · Sunk Cost" suffix is added only when
  there is room left after the content.
- `shortHardwareLabel` drops a vendor prefix the chip already carries (NVIDIA, AMD, Strix Halo)
  and the chip where the family is the product (DGX Spark). "Strix Halo GMKtec EVO-X2, 128GB"
  becomes "GMKtec EVO-X2, 128GB". Full names still appear in the h1 and body, and **no URL or
  canonical changed**, so nothing needs redirecting.
- Comparison pages now describe themselves with their own numbers: how many of the 39 models fit
  each machine, or the two intelligence-index scores. Every description is unique.
- Model and hardware descriptions carry the real verdict ("where it pays back in 1,274 years"),
  which is the honest hook this site has and the old copy buried.
- Speeds were deliberately kept out of meta descriptions: most are estimated from bandwidth, and
  there is no room in 155 characters to label them as such.
- `checkMeta()` in the build now throws on a duplicate or missing title/description and notes
  any that run long. It caught a real one on the first run: Llama 3.1 8B and Qwen3 32B are each
  listed at two quantisations, and dropping the quantisation from the title made those pairs
  identical. The quantisation is back in the title for exactly those cases.

Verified: `npm test` (61 passing), `npm run typecheck`, `npm run build` all clean — the full
build including `build:functions` worked in this environment. Re-ran the audit against the
rebuilt `public/`: 188 pages, 0 duplicate titles, 0 duplicate descriptions, 0 descriptions over
155, 7 titles over 60 (down from 185). Read several pages' rendered `<head>` and body: visible
copy is unchanged, since this run only touched metadata.

**Continue next:** structured data (backlog item 2). BreadcrumbList is the easy win — the
breadcrumb markup already exists in `pageShell`, so it only needs the JSON-LD beside it. Then
FAQPage on hardware pages, where "can it run local LLMs" and "does it pay back" are already the
questions the page answers.
