# Search Console, read 2026-09-23

Exports of 2026-09-23 (coverage as of 2026-09-18; performance for the 28 days to 2026-09-20).
Raw CSVs live in seo/exports/ on Ryan's machine and are not committed. Next export: ask Ryan.

## Indexing: 165 pages indexed, 454 not

| Reason | Pages | What it is | Action |
|---|---|---|---|
| Page with redirect | 333 | The `http://` and `www.` forms of indexed pages. All redirect once with a 301 to the https apex, checked live on deep pages. Roughly two per indexed page. | None. Benign. |
| Excluded by noindex | 45 | The `/s/…` share pages, noindex on purpose. | None. |
| Alternate page with proper canonical | 18 | Prefilled calculator links `/?hw=…`, canonical to `/`. | None. Working as designed. |
| Crawled, currently not indexed | 58 | Google fetched them and chose not to index. URLs unknown until Ryan exports that issue's list. Most likely the head-to-heads, which are the site's most similar pages. | Wait for the URL list; then decide what to cut or merge. |

Google knew 619 URLs on 2026-09-18. The sitemap now lists 321 pages, of which 190 are head-to-heads.

## Search performance, 28 days: 89 clicks, 584 impressions

- Every click and impression is on the home page. No generated page has appeared in a search result yet.
- Every query with a click is the site's own name. Non-brand queries with any impression: a handful of model names (Qwen3.8 Flash Next, GLM-5.3-Flash, Laguna XS 2.1, Ornith 1.5) and machine names (M5 Mac Studio, Mac Studio M5 Ultra), all at 1 or 2 impressions, positions 5 to 130.
- Impressions ran about 160 a day during launch week and were 10 a day by 2026-09-20. Launch traffic came from links, not search.

## What this means for the work

1. The site's search problem is not technical. Redirects, canonicals, sitemap and structured data are in order. Half of the known pages are simply not yet indexed, and none rank for anything but the brand.
2. Adding pages makes that worse, not better. 190 head-to-heads that Google is already declining to index are a crawl-budget and quality signal. No new page types until the existing ones are indexed and at least one non-brand query shows clicks. Fewer, deeper pages beat more.
3. The model-name queries are the first foothold: people search the exact model name plus a machine or "tokens per second". Model pages should answer that search in their title and first paragraph.
4. What moves this site now is links from outside, which no run here can do: the two news articles, the Hacker News thread, Reddit's r/LocalLLaMA, and hardware reviewers who publish tok/s. That is Ryan's side.
