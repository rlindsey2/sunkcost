# SEO log

Read this before doing anything. One entry per run, newest first. Pick up the top open item in
the backlog, or the open item the previous run said to continue. Never redo a done item.

## Ryan's side (needs the site owner)

- [ ] Verify sunkcost.ai in Google Search Console: add a property, choose **Domain** rather than
      URL prefix so it covers the apex and any subdomain at once, and take the auto-DNS
      verification flow, which writes the TXT record into Cloudflare for you. Then submit
      https://sunkcost.ai/sitemap.xml under Sitemaps. Bing Webmaster Tools comes after, not
      before: it can import a verified property straight from Search Console.
      Then commit the CSV exports under seo/exports/. The Indexing → Pages export is worth as
      much as the query one: it says which of the 188 generated pages Google has actually
      indexed, which is the first thing to fix if the answer is "not many". Until either exists
      the agent works from the pages themselves, with no idea what anyone searched.
- [ ] Run Google's Rich Results Test on https://sunkcost.ai/hardware/geforce-rtx-3090-24/ and
      confirm the breadcrumb is detected. Structured data was verified against the local build,
      which is the build the deploy runs, so this is a confirmation rather than a check.
- [ ] Commit `npm run submissions` output under seo/exports/ when there is enough of it. The
      agent has no database access by design, and that file is the only route to a page built
      from what people actually entered.
- [ ] Turn on Cloudflare Web Analytics: Workers & Pages → the project → Metrics → Enable. Free,
      no cookie banner, injected on the next deploy. Search Console says what Google showed
      people; this says what they did on arrival, which nothing here currently measures.

The Search Console API, with a GCP service account, was considered on 2026-09-16 and deferred.
For one property, one person and a fortnightly pull, the CSV export is thirty seconds and the
service account is an hour in IAM plus a live credential in an hourly agent's environment. Do
not propose it again unless the manual export has become a chore, or the question being asked
needs more than 25k rows or per-URL index status across all 188 pages — `urlInspection` is the
one call worth the setup, and only then.

### What the agent can and cannot reach (checked 2026-09-16)

Outbound HTTPS goes through an egress proxy that answers 403 to anything not on the
environment's allow-list. Both `curl` and WebFetch go through it; WebSearch does not, and works.
A policy change does not reach a session already running — the environment sets it at container
start — so a run that finds a host blocked should note it and move on rather than retry.

Hosts worth having on the list, and what each unlocks:

- `sunkcost.ai` — reading the site's own live pages: confirming a deploy actually served the
  markup, checking headers and canonicals as delivered rather than as built. The most useful
  one by far.
- `www.googleapis.com` — the PageSpeed Insights API
  (`/pagespeedonline/v5/runPagespeed?url=…&strategy=mobile`), which returns Core Web Vitals as
  JSON and needs no key at this volume. This is the practical form of the Core Web Vitals
  backlog item; pagespeed.web.dev itself is a JavaScript app and cannot be read by fetching it.
- `validator.schema.org` — structured data validation.

Google's Rich Results Test has no public API and its page is a JavaScript app, so allow-listing
`search.google.com` would not make it usable by the agent. That check stays on Ryan's side.

## Backlog (ordered; the agent keeps this list current)

- [x] Audit every generated page's `<title>` and meta description (scripts/build-pages.ts,
      src/pagekit.ts): each title unique, under 60 characters, leading with the words people
      search; each description a plain answer under 155 characters. Done 2026-09-16.
- [x] Structured data: BreadcrumbList everywhere and Product on hardware pages. Done 2026-09-16.
      No Offer and no FAQPage — reasons in the run entry below.
- [x] Internal linking: no generated page is an orphan any more, and the build fails if one
      appears. Done 2026-09-16; the run entry has what was actually wrong, which was worse than
      this item assumed.
- [ ] Question pages for the searches people actually type: "is a Mac mini good for local LLMs",
      "RTX 3090 for local LLM worth it", "best GPU for local LLMs", "local LLM vs API cost",
      "how much RAM to run a 70B model". Each answers in the first paragraph with the site's own
      numbers, links into the calculator with the configuration prefilled, and cites sources.
- [ ] An index at /compare/. The crawl-path half of this is now done — all 75 comparison pages
      are linked from the machines and models they compare — but "mac studio vs rtx 5090" style
      queries want a page that lists the match-ups, and nothing here does. New page type, so a PR.
- [ ] The home page carries no JSON-LD. Google's site-name feature reads `WebSite` markup on the
      home page specifically, so /leaderboard/'s copy of it does not count. Small change to
      index.html, which means a PR, not a push.
- [ ] A "what people entered" page updated from `npm run submissions` output that Ryan commits
      under seo/exports/ (never from live database access; the agent has none).
- [ ] Core Web Vitals: run the PageSpeed Insights API against the home page and one hardware
      page (see the reachability note above for the endpoint); fix render-blocking font loading
      and image sizing. The generated pages load Instrument Sans and IBM Plex Mono from Google
      Fonts in the head, which is the obvious first suspect.
- [ ] Canonical and duplicate control: /s/ share pages stay noindex; comparison pages A-vs-B and
      B-vs-A must not both exist; www and trailing-slash variants resolve to one URL.
- [ ] Open Graph images for generated pages (they use /og/default.png today). Comparison pages
      and /best/ and /leaderboard/ all point at the same default card; the model and hardware
      pages already get a real one. A comparison card would want the two machines side by side.
- [ ] `/hardware/geforce-rtx-3060-12/` shows as "NVIDIA GeForce RTX 3060 12GB, 12GB" everywhere
      its label is rendered, because `chip` in data/hardware.json ends in the memory size that
      `hardwareLabel()` then appends again. The fix is a data edit, which the agent may not make.
      Cosmetic, but it is on a page people do search for.
- [ ] The 7 head-to-head titles still over 60 characters are all pairs of long machine or model
      names (worst: MacBook Air M5 (15-inch), 16GB vs MacBook Pro M5 Pro (16-inch), 64GB, at 68).
      Shortening them further means dropping a memory size or a screen size, which are the things
      that tell two Macs apart. Probably leave, but worth a second look with query data.

## Runs

### 2026-09-16 — 63 orphan pages, now none

Took the top backlog item, internal linking. Commit `f69cd32`, pushed to main.

The item assumed the gap was the 28 hardware comparison pages. It was more than twice that. Of
the 188 generated pages, **63 had no inbound link from any other page** — they existed only in
sitemap.xml, which tells a crawler a URL exists and gives it no reason to want it:

- **30 of the 56 machine pages.** Every previous-generation machine, and most configurations
  inside a family. `runnersFor()` filters to `generation === 'current'`, so the leaderboard and
  the model pages only ever name current machines, and a family's cheapest current one at that.
  The casualties include `/hardware/geforce-rtx-3090-24/`, `/hardware/geforce-rtx-4090-24/` and
  the whole M3/M4 Mac range. The 3090 and the 4090 are the two machines people search for most
  in this subject, and nothing on the site pointed at either.
- **28 of the 75 comparison pages** — all the hardware head-to-heads, as the item said.
- **5 of the 55 model pages.** Three have no index score, so the leaderboard leaves them out
  and they are too big to reach the top-12 list on any machine page. The other two are the
  second quantisation of Llama 3.1 8B and Qwen3 32B, which the leaderboard drops when it
  de-duplicates by display name.

Fixed in `scripts/build-pages.ts` and `src/pagekit.ts`:

- **"Other machines to weigh against it"** on every machine page: the rest of that range (every
  configuration, discontinued ones marked as such), then the nearest machine in price from each
  other family. Each row carries price, memory, how many models fit and the pay-back, on the
  same defaults as the rest of the page, so it is a table someone shopping can read rather than
  a list of links. One rival per family, not the five nearest overall, because five Mac Studios
  within $300 of each other answer nobody's question.
- **"Head to head"** under it on the eight flagship machines, linking the comparison pages they
  appear in. That is where the 28 orphaned comparisons get their two inbound links each.
- **Model pages** now cross-link the two quantisations from the Quantisation row of the
  specifics, with the other one's size, since that is the difference that matters.
- **The leaderboard** names and links the five models with no index score in a line under the
  table. "Not yet placed" is the site's own existing wording for them.
- **`checkLinks()` fails the build** on any generated page with no inbound link, next to the
  existing JSON-LD and duplicate-meta guards. Adding a machine or a model can no longer quietly
  produce an orphan.

Two things were deliberately cut on the honesty rule. The rival section was first headed
"Similar money, a different machine", which is false on a page like the DGX Spark where the
nearest NVIDIA card is $1,999 against $4,699; it now reads "Nearest in price elsewhere on the
list", which is only what the code actually does. And a sentence claiming more memory moves a
machine up to a better model "which is usually what changes the pay-back, not the speed" went in
and came back out: the site's own numbers do not support it — a 12 GB RTX 3060 pays back in 26
years and a 32 GB RTX 5090 in 25. Nothing replaced it.

Verified: `npm test` (79 passing, 9 of them new), `npm run typecheck`, `npm run build:pages` and
the full `npm run build`. Re-ran the link audit against the rebuilt `public/`: **0 orphans, down
from 63**; every machine page has at least 5 inbound links, every comparison page at least 1,
every model page at least 1. Breadth-first from `/leaderboard/`, which sits in every page's
footer, the whole site is now within 4 clicks — before, 63 pages were at no depth at all. The
orphan guard was checked by breaking it on purpose: a build with the new section removed fails
and names the pages. Read the rendered machine pages for an NVIDIA card, a Mac mini and the
DGX Spark: the table reads as a buying comparison, and no maintainer language reached the copy.

Deploy run 21 finished green at 11:49 UTC, so this is live. Both commits went up in one push, so
GitHub made a single run on the tip and there was no cancelled run this time — worth doing that
way round, since the previous two runs each cancelled their own code-commit run by pushing the
log a minute later.

Pre-existing, not touched: `/hardware/geforce-rtx-3060-12/` renders its name as "NVIDIA GeForce
RTX 3060 12GB, 12GB" because the chip field in the data carries the memory size. That is a
`data/hardware.json` figure, which is out of bounds, so it is a backlog item rather than an edit.

**Continue next:** question pages (backlog item 2). The 3090 and 4090 pages now have a crawl
path, which makes "RTX 3090 for local LLM worth it" worth writing next, and the site's own
numbers answer it. Those are a new page type, so that run goes to a PR, not straight to main.

### 2026-09-16 — JSON-LD on all 188 generated pages

Took the top backlog item, structured data. Commit `52db55e`, pushed to main.

Every generated page now emits one `@graph` from `pageGraph()` in `src/pagekit.ts`:

- **WebSite** the page belongs to, **WebPage** carrying the page's own title and description,
  its OG card as `primaryImageOfPage`, and **BreadcrumbList**. The breadcrumb is the piece with
  a visible effect on a result — Google draws the trail in place of the raw URL — and the trail
  was already rendered as a `<nav>`, so this only states it in a form a crawler reads.
- **Product** on the 56 hardware pages, referenced from the WebPage's `about`.

Three judgement calls, all on the honesty side:

- **No `Offer`, anywhere.** Product/Offer markup says you can buy the thing from this page. The
  site sells nothing; the prices are list prices read off a maker's page on a stated date. The
  cost of leaving it out is that hardware pages are not eligible for a price rich result. That
  is the right trade. It also keeps Search Console clean of merchant-listing warnings once Ryan
  verifies the property.
- **Power is published only where the maker published it.** `load_watts_status` is `published`
  on 14 machines, and `stand_in` or `third_party_measured` on the other 42. A stand-in figure
  needs the sentence beside it that says what it is, and a `PropertyValue` has nowhere to put
  that sentence. Those machines get memory and bandwidth only; the power figure and its caveat
  stay on the page where they already are.
- **No FAQPage.** Google stopped showing FAQ rich results for sites like this one, so the gain
  is close to nil, and the markup has to mirror visible Q&A exactly or it is a liability. The
  hardware pages have exactly one real question in a heading ("Can a … run local LLMs?"). Not
  worth it. Dropped from the backlog rather than left open.

A machine's Product `name` is the maker's name for it — "Framework Desktop, 128GB", not "Strix
Halo Framework Desktop, 128GB" — with the site's own label as `alternateName` so both match.
`brandOf()` maps family to maker, falling back to the first word of the chip field, which is
where a Strix Halo box is named.

Also fixed: a breadcrumb step with no page of its own (the leaf on all 75 comparison pages) was
rendering as a link to `#` that went nowhere. It is now plain text with a `.here` class, and in
the markup it carries a `name` with no `item`, which is what schema.org asks for. The hardware
comparison leaf said "Comparison" on all 28 of them; it now names the two machines.

Verified: `npm test` (70 passing, 9 of them new in `tests/pagekit.test.ts`), `npm run typecheck`,
and the full `npm run build` including `build:functions` — all clean in this environment. Then
parsed the JSON-LD back out of all 189 built pages: 188 of 188 generated pages have a graph that
parses, 188 BreadcrumbLists, 56 Products, 75 with a name-only last step, every `@id` absolute,
every breadcrumb position sequential from 1. The one page without a graph is `dist/index.html`,
the calculator itself, which is out of bounds for a push. Read a rendered hardware page and a
rendered comparison page: visible copy is unchanged apart from the breadcrumb leaf.

`scripts/build-pages.ts` now parses the JSON-LD out of each page as it writes it and fails the
build on a page with none or one that does not parse, so a stray character in a machine name
cannot ship broken markup.

Deploy run 18 (`0294ebd`) finished green, so this is live. Run 17, on the code commit itself,
shows as *cancelled*: the workflow sets `cancel-in-progress` on a `deploy-production`
concurrency group, and pushing the log a minute later superseded it. Nothing failed.

One thing this environment cannot do: outbound HTTPS to `sunkcost.ai` is refused by the egress
policy (403 on CONNECT), so the agent cannot read its own live pages. Verification above is
against the local build, which is the same build the deploy runs. Worth knowing before a future
run plans anything that depends on fetching the live site.

**Continue next:** internal linking (backlog item 2), which is the largest remaining structural
gap: hardware pages do not link to the models they run best, model pages do not link to the
cheapest machines that run them, and the 75 comparison pages have almost nothing pointing at
them. Check `public/sitemap.xml` against the links actually emitted to find the orphans.

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
