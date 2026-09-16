# SEO log

Read this before doing anything. One entry per run, newest first. Pick up the top open item in
the backlog, or the open item the previous run said to continue. Never redo a done item.

## Ryan's side (needs the site owner)

- [ ] Verify sunkcost.ai in Google Search Console and Bing Webmaster Tools, submit
      https://sunkcost.ai/sitemap.xml, and share the Search Console CSV exports (queries, pages)
      by committing them under seo/exports/. Until then the agent works without query data.

## Backlog (ordered; the agent keeps this list current)

- [ ] Audit every generated page's `<title>` and meta description (scripts/build-pages.ts,
      src/pagekit.ts): each title unique, under 60 characters, leading with the words people
      search; each description a plain answer under 155 characters.
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
- [ ] Open Graph images for generated pages (they use /og/default.png today).

## Runs

_None yet._
