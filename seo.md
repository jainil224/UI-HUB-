# Senior Technical SEO Engineer — Complete SEO Optimization for UI HUB

Act as a senior Technical SEO Engineer, SEO strategist, and full-stack developer with 10+ years of experience optimizing developer tools, component libraries, SaaS websites, and JavaScript-based websites for Google Search.

Your mission is to **audit, implement, test, and document improvements to my existing website's SEO**, with two primary goals:

1. Make my website easy to discover when users search for my brand, **UI HUB** or **uihub.codes**.
2. Increase qualified organic traffic from non-branded searches related to UI components, React components, website templates, animated backgrounds, and web animations.

## 1. Project information

- Brand: UI HUB
- Website: https://www.uihub.codes/
- Industry: Developer tools, UI components, website templates, and animations
- Target audience: Frontend developers, React developers, web designers, freelancers, and developers building modern websites
- Core offering: Reusable UI components, website templates, interactive effects, animated backgrounds, source code, and AI-ready prompts
- Main SEO objectives: Brand discovery, technical SEO, organic rankings, qualified organic traffic, and improved search result click-through rate

Use the actual features and content in my codebase as the source of truth. Do not assume that every feature, category, framework, or template mentioned above currently exists.

## 2. Important execution rules

Do not only give me an SEO report, suggestions, or code snippets. **Inspect the existing project and implement the SEO improvements directly wherever it is safe and appropriate.**

Follow these rules:

- First inspect the framework, routing system, rendering strategy, existing SEO components, metadata, sitemap, robots configuration, structured data, and current page structure.
- Reuse and improve the existing implementation instead of unnecessarily rebuilding it.
- Do not break existing design, functionality, animations, authentication, APIs, or routing.
- Do not remove existing metadata or structured data without understanding its purpose.
- Do not create duplicate metadata, conflicting canonical tags, or duplicate JSON-LD schemas.
- Do not change canonical URLs, redirect rules, or domain configuration without verifying the intended production URL.
- Do not add fake reviews, fake backlinks, fabricated statistics, or unsupported product claims.
- Avoid keyword stuffing, doorway pages, thin programmatic SEO pages, and duplicate content.
- Do not mark every page as indexable automatically. Authentication pages, internal tools, duplicate pages, and private pages must remain appropriately protected from indexing.
- Follow current official Google Search documentation when making technical SEO decisions.
- Make changes in small, logical stages and run relevant tests after each stage.
- If external credentials, Google Search Console access, DNS access, or hosting permissions are unavailable, continue with the repository work and clearly document the remaining manual actions. Never pretend that an external action was completed.

## 3. Phase One — Audit the complete project

Explore the entire repository and identify all important SEO-related files and routes.

Inspect:

- Framework and routing configuration.
- Homepage and reusable layouts.
- Category pages.
- Individual component pages.
- Individual website template pages.
- Documentation and blog pages, if they exist.
- Dynamic and programmatically generated routes.
- Page titles, meta descriptions, headings, and Open Graph metadata.
- Canonical URLs.
- Robots directives and `robots.txt`.
- Sitemap generation and sitemap URLs.
- JavaScript rendering and server-side rendering or static generation capabilities.
- Structured data and JSON-LD.
- Internal links, breadcrumbs, and navigation.
- Image alternative text and image optimization.
- Mobile responsiveness and accessibility.
- Redirects, broken links, duplicate URLs, and error pages.
- Performance bottlenecks affecting Core Web Vitals.
- Existing Google Analytics and Search Console integrations, if any.

Do not assume a problem exists simply because a configuration file is not immediately visible.

Produce a concise list of confirmed issues, potential issues that require further verification, and recommended improvements. Prioritize issues by SEO impact, implementation effort, and risk.

Then continue to implementation. Do not stop after presenting the audit.

## 4. Phase Two — Fix technical SEO

Implement all applicable, verified improvements.

### A. Crawlability and indexability

- Ensure intended public pages return successful HTTP responses.
- Ensure important content pages are crawlable and eligible for indexing.
- Check for accidental `noindex` directives or crawl restrictions.
- Verify that critical page content and component links are accessible to Google.
- Ensure internal links use real, crawlable URLs.
- Fix broken internal links and unintended redirect chains.
- Preserve intentional redirects and restrictions.
- Ensure error pages return appropriate status codes.
- Avoid relying solely on client-side click handlers to expose important links.
- Check whether dynamically rendered routes can be discovered and rendered successfully.

### B. Canonical URLs

- Establish the actual preferred production domain and URL format.
- Make each indexable page self-canonical where appropriate.
- Ensure canonical links point to valid, indexable URLs.
- Avoid canonical conflicts between metadata, redirects, and sitemap entries.
- Normalize trailing slashes, query parameters, and duplicate URL variants where appropriate.
- Do not canonicalize distinct component pages to the homepage.

### C. XML sitemap

Audit the current sitemap implementation and improve it if needed.

- Include important canonical URLs that should be indexed.
- Include component and template pages where appropriate.
- Exclude redirects, non-canonical URLs, private pages, and unintended error pages.
- Ensure the sitemap uses the correct production domain and HTTPS URLs.
- Generate sitemap entries from the actual route or content source rather than maintaining a fragile manual list.
- Use meaningful `lastmod` values only when supported by genuine content modification dates.
- Ensure sitemap routes do not accidentally expose private or administrative content.
- Verify that the sitemap returns a valid response and valid XML.

### D. Robots configuration

- Review `robots.txt`.
- Ensure it does not accidentally block important public assets or pages.
- Keep private resources protected with appropriate access controls; robots.txt is not an access-control mechanism.
- Reference the correct sitemap location where appropriate.

### E. Redirect and duplicate-page handling

Inspect and fix confirmed cases involving duplicate routes, HTTP/HTTPS variants, www/non-www inconsistencies, tracking parameters, and trailing slash variations.

Do not introduce redirects blindly. Preserve the intended production URL structure and existing route behavior.

## 5. Phase Three — Improve homepage SEO

Review the existing homepage and implement appropriate metadata and content improvements.

Suggested starting point for the homepage title:

"UI HUB — Free React UI Components, Animations & Templates"

Suggested meta description:

"Discover React UI components, interactive effects, animated backgrounds, and website templates. Preview and reuse UI resources with code and AI-ready prompts."

Suggested main heading:

"Free React UI Components, Animations & Website Templates"

Treat these as recommendations, not mandatory text. Adjust them to match the actual product, existing brand voice, and implemented features.

Requirements:

- Keep one clear main H1.
- Ensure the homepage explains exactly what UI HUB offers.
- Introduce relevant keywords naturally in visible content.
- Explain the real benefits of browsing, previewing, copying, or customizing components when those features exist.
- Provide descriptive links to major categories and templates.
- Ensure the HTML title and meta description are unique and appropriately written.
- Do not add repetitive keyword blocks or hidden SEO text.
- Maintain the existing design and visual quality.

## 6. Phase Four — Build a page-specific metadata strategy

Inspect all existing indexable routes and implement metadata based on each page's actual content.

### Homepage

Focus on the UI HUB brand and the overall component-library offering.

### Category pages

Create unique titles, meta descriptions, headings, and introductory copy that reflect each real category.

Potential topics to investigate in the existing project include:

- Interactive backgrounds.
- 3D effects.
- Cursor effects.
- Background components.
- Animated text.
- UI effects and hover animations.

Use only categories and routes that actually exist.

### Individual component pages

Where individual component routes exist, create metadata based on the actual component name and implementation.

For example, a real magnetic cursor component could use:

Title: "Magnetic Cursor Effect for React | UI HUB"

H1: "Magnetic Cursor Effect for React"

Include the actual component's relevant information, not generic text copied from other pages.

### Website template pages

Where template pages exist, create unique metadata reflecting the actual template type, framework, features, and intended use.

### Other pages

Handle documentation, blog, search, authentication, account, and utility pages according to their purpose and indexability.

Implementation requirements:

- Use a centralized and maintainable metadata strategy.
- Use each page's real name and content.
- Prevent blank titles, accidental duplicate titles, and missing descriptions on important pages.
- Avoid hardcoding one page's metadata into every dynamic route.
- Use safe fallbacks when optional metadata is missing.
- Preserve useful existing metadata and social sharing fields.
- Do not promise specific Google rankings or exact search snippets.

## 7. Phase Five — Improve individual component pages

Individual component pages are a major potential source of non-branded organic traffic.

Inspect the existing content model and determine which components deserve dedicated indexable pages.

Where appropriate, improve component pages with:

1. A descriptive component name and H1.
2. A unique explanation of the effect and its use cases.
3. A working live preview, if the product supports one.
4. Accurate implementation instructions.
5. Real dependencies and installation steps, where applicable.
6. Relevant customization information.
7. Accessible and responsive implementation details.
8. Real source code or copy instructions, if the feature exists.
9. Links to related components and categories.
10. A clear next action for developers.

Generate page content from real component data, not made-up features or arbitrary keyword variations.

If many existing pages have thin or duplicated content, identify them and recommend a specific content improvement for each rather than automatically publishing hundreds of nearly identical pages.

## 8. Phase Six — Improve internal linking and information architecture

Build a logical internal linking structure.

- Homepage → major categories and template collections.
- Category pages → their individual components.
- Component pages → parent category and relevant related components.
- Template pages → relevant template collection and related resources.
- Documentation or guides → the components and templates they discuss.

Requirements:

- Use descriptive, natural anchor text.
- Avoid excessive exact-match anchor repetition.
- Make important pages reachable through normal navigation.
- Add breadcrumbs where helpful.
- Ensure breadcrumbs reflect the actual route hierarchy.
- Check for orphan pages.
- Identify valuable pages that are too many clicks away from the homepage.
- Avoid generating large numbers of irrelevant links.

Implement the simplest structure that fits the current project.

## 9. Phase Seven — Add structured data correctly

Inspect the existing JSON-LD before changing it.

Where appropriate, implement or improve:

### Website structured data

Use `WebSite` structured data on the homepage to communicate the preferred website name "UI HUB" and the correct canonical homepage URL.

### Organization structured data

Use `Organization` structured data when it accurately describes the organization behind the site. Use only genuine details and actual official profile URLs.

### Breadcrumb structured data

Implement `BreadcrumbList` only where the displayed page hierarchy supports it.

### Other schema types

Only add structured data that accurately represents real page content and complies with Google's current eligibility requirements.

Requirements:

- Use valid JSON-LD.
- Avoid duplicate or contradictory schemas.
- Ensure values match visible page content.
- Do not invent ratings, reviews, prices, authors, dates, or organizational details.
- Validate the output with available tests and Google's Rich Results Test where applicable.
- Do not assume valid structured data guarantees a rich result.

## 10. Phase Eight — Improve social previews, images, and page experience

Where applicable:

- Add accurate Open Graph titles, descriptions, and images.
- Add appropriate Twitter/X card metadata.
- Use the real brand logo and favicon.
- Improve image alternative text for informative images.
- Use empty alt text for purely decorative images where appropriate.
- Ensure images have appropriate dimensions and modern formats when practical.
- Prevent large images from causing layout shifts.
- Preserve functionality while improving page performance.
- Investigate LCP, INP, and CLS issues.
- Avoid removing useful animations or interactions just to chase a performance score.
- Respect reduced-motion preferences and keyboard accessibility.

Use Lighthouse, PageSpeed Insights, existing project tests, or other available tools to identify actual bottlenecks. Do not claim that Core Web Vitals passed without measurement.

## 11. Phase Nine — Improve performance and rendering

Inspect the website's rendering and loading strategy.

- Use the existing framework's appropriate SSR, SSG, or prerendering capabilities where useful.
- Ensure important page metadata is available to search engines.
- Reduce unnecessary JavaScript where feasible.
- Optimize code splitting, assets, fonts, and images.
- Prevent hydration errors and broken page content.
- Avoid regressions in component previews, animations, or interactive features.
- Ensure important content appears in rendered HTML or can be reliably rendered by Google.
- Check mobile usability and responsive layouts.
- Preserve the existing architecture unless a change is necessary and justified.

Do not undertake a framework migration merely for SEO.

## 12. Phase Ten — Keyword and content strategy

Create a practical keyword-to-page mapping using existing pages first.

Consider these groups, validating their relevance to the real site:

**Brand terms**
- UI HUB
- UIHub
- uihub.codes

**Core product terms**
- Free React UI components
- React component library
- UI components for developers
- Website UI templates
- React website templates

**Specialized terms**
- React animated text components
- Interactive backgrounds for websites
- React cursor effects
- 3D website effects
- Website hover animations

These are candidate phrases, not verified keyword-volume data.

For each important page, record:

- Page URL.
- Primary search intent.
- Primary topic.
- Supporting terms.
- Existing title and H1.
- Proposed title and H1.
- Main content improvements.
- Internal links to add.
- Indexability status.
- Priority and implementation status.

Avoid assigning the exact same primary topic to multiple pages unless the search intent is genuinely different.

Use Google Search Console data or a legitimate keyword research source if available. Do not fabricate search volumes, difficulty scores, ranking positions, or competitor results.

## 13. Phase Eleven — Integrate with Google Search Console where possible

Check whether an authenticated Search Console integration or authorized API access is already available.

If access exists and is authorized:

- Review the performance data for the last three months and compare it with the previous three months.
- Identify branded and non-branded queries.
- Identify high-impression queries with low click-through rates.
- Identify relevant pages with promising average positions.
- Check which pages receive impressions and clicks.
- Review indexing reports and relevant exclusion patterns if the integration supports them.
- Use the findings to prioritize actual pages rather than relying entirely on generic keyword assumptions.

Do not assume that a repository contains access to Search Console.

If access is unavailable:

- Complete all repository-level SEO tasks.
- Create a report identifying exactly which Search Console data is needed.
- Provide a clear manual checklist for obtaining the relevant reports.
- Never claim that indexing requests, sitemap submissions, URL inspections, or Google API operations succeeded without confirmation.

## 14. Phase Twelve — Testing and validation

After implementation, run all relevant checks available in this environment.

Test the following:

1. The project builds successfully.
2. Existing tests pass, or any pre-existing failures are clearly reported.
3. Homepage metadata renders correctly.
4. Category and individual component metadata are unique where intended.
5. Canonical URLs are correct.
6. Sitemap output is valid and includes the correct eligible routes.
7. Robots configuration is available and appropriate.
8. JSON-LD is valid and consistent.
9. Internal links resolve to the intended pages.
10. No important routes accidentally return 404 or 500 responses.
11. The production build preserves the expected rendering behavior.
12. No essential component functionality has regressed.

Generate automated SEO checks for the most important routes where practical. Examples include missing titles, missing H1s, duplicate metadata, broken internal links, canonical inconsistencies, and missing sitemap coverage.

Do not mark a test as passed unless you actually ran it and observed its result.

## 15. Phase Thirteen — Deliverables

When finished, provide:

### A. Summary of changes

Explain what you changed and why.

### B. Files modified

List all changed files with a brief explanation of each change.

### C. SEO issue report

For every identified issue, label it as:

- Fixed and tested.
- Fixed but not externally verified.
- Requires my access or action.
- Investigate further.

### D. Page optimization table

List important URLs with their proposed primary keyword, title, H1, and implementation status.

### E. Test report

Include the actual build and test results, errors, warnings, and any remaining risks.

### F. Google Search Console checklist

Tell me exactly how to:

- Verify indexing.
- Inspect the homepage and priority URLs.
- Submit the sitemap.
- Request indexing where appropriate.
- Review the Page indexing report.
- Monitor branded versus non-branded queries.

Mark these as pending until confirmed.

### G. Remaining priorities

Give me the five highest-priority next actions with their expected benefit, effort, and dependencies.

### H. Monitoring plan

Recommend a 30-day process for tracking indexing status, impressions, clicks, brand discovery, and relevant non-branded search terms.

## Final execution instruction

Start by exploring the codebase and identifying the current framework and production architecture. Then complete the audit, implement the safest high-impact fixes, add suitable automated checks, run the available tests, and deliver the report.

**Do not stop after providing recommendations. Implement the changes directly in the existing project. Do not claim external actions or results that you cannot verify. Preserve the current product experience and prioritize accurate, useful SEO over keyword manipulation.**

---

# Implementation Report

Scope executed: **close the confirmed gaps only** — the existing SEO/AEO system (SSG `build-seo.mjs` + runtime `useSeo`/`RouteSeoGuard`, `src/seo/*`, `check-seo.mjs`) was audited and retained; fixes target the 8 confirmed gaps plus the homepage H1 decision and a follow-up pass (prompt-encoding repair, Apple PWA-meta guard, `/library` breadcrumb correction, root check validation). All commands below were actually run and observed.

## A. Summary of changes

1. **Non-SEO `<meta>` tags were being dropped from prerendered pages.** `readAppShellTags()` in `frontend/scripts/build-seo.mjs` now preserves `<meta>` tags not owned by the SEO output: `google-site-verification`, `google-adsense-account`, `application-name`, and `viewport` survive into every prerendered page.
2. **Runtime head was missing/unmanaged on public pages.** `useSeo` is now wired on HomePage, TemplatesPage, TemplateDetailPage, BuildWithUIHubPage, BuildWithUIHubDetailPage, LegalPage, and PricingPage via new `frontend/src/seo/runtime.ts` factories (parity with the SSG route builders). `RouteSeoGuard` now uses the exported `isSeoNoIndexPath()` and resets robots + removes canonical for private routes, so navigating from a public page into `/login`, `/admin`, etc. can no longer leak a public page's title/robots/canonical.
3. **Runtime homepage H1 mismatched the SSG homepage H1.** The H1 is set once and consumed by both sides: `homeSeoRoute().h1` in `src/seo/routes.ts` is the source of truth, `Hero.tsx` renders the same string, and `seo.test.ts` locks it. Final H1 (per your explicit product request): **"Craft the Future, of UI"** — verified identical in `Hero.tsx`, `dist/index.html`, and the unit test.
4. **Sitemap `lastmod` claimed every static page updated on every deploy.** Static routes (home, `/templates`, `/build-with-ui-hub`, `/pricing`, legal pages) no longer emit `<lastmod>`; component routes keep their real `addedAt` date.
5. **No CI / no gated root script.** Root `npm run check` now chains `check:frontend` (frontend `lint` → `npm test` → `build` → `check:seo`); new `.github/workflows/seo-checks.yml` runs the same gate on push/PR.
6. **`webSiteJsonLd` lacked brand aliases.** Added `alternateName` (`UI HUB`, `UIHub`, `uihub.codes`) from a single source `SITE_ALTERNATE_NAMES` in `site.ts`; canonical `name` stays `UI Hub`.
7. **`frontend/metadata.json` was a stale Remix-template artifact** ("Remix: UI Hub", "bold black and orange theme"). Refreshed to accurate brand + description (nothing in the repo consumes this file).
8. **AEO low-confidence** — no change needed: `check-seo.mjs` already surfaces count + names and `aeo.test.ts` locks the `'low'` path. Verified 67 low-confidence (pre-existing).

Follow-up pass (verified after the main work):

9. **5 pre-existing `promptEncoding.test.ts` failures (mojibake in generated AI prompts).** Root cause was literal CP1252-corrupted characters in `frontend/src/utils/promptUtils.ts` (ANSI "UI HUB" banner lines 102-107 and em dashes at 109/188/216, plus a comment at 420). Repaired at the byte level (no test assertions changed). Same corruption also fixed in `frontend/src/utils/checkout.ts` (em dash + `→` arrows) and one UI arrow in `PricingPage.tsx` plus decorative `─` banner dividers. **Before: 134 pass / 5 fail. After: 141/141 pass.**
10. **`apple-mobile-web-app-title` was not regression-guarded.** It was already preserved by `build-seo.mjs` (verified present once in `dist/index.html`); `check-seo.mjs` now asserts it alongside GSC/AdSense/application-name/viewport so a future shell rebuild cannot silently drop it.
11. **Category breadcrumbs pointed at `/library`, a deliberately NOINDEX route.** Decision: keep `/library` NOINDEX (SPA browse/search view; the component/category pages carry the indexed content) and **drop the `/library` middle crumb** so JSON-LD breadcrumbs never reference a non-indexable URL. Category breadcrumbs are now `Home › {category}`; a regression test asserts no breadcrumb on any route references a NOINDEX path. The stale `reason` label on the `/library` `NOINDEX_PATHS` entry was corrected to match this decision.
12. **Root `npm run check` was never validated end-to-end.** Run for real (details in §E): still fails on pre-existing infra/tooling steps that are **not related to this SEO work**; the frontend SEO gate itself passes.

## B. Files modified

| File | Change |
|---|---|
| `frontend/scripts/build-seo.mjs` | Preserve non-SEO `<meta>`; `renderSitemap` only emits `lastmod` when genuine (component `addedAt`); drop build-date default |
| `frontend/scripts/check-seo.mjs` | Assert `google-site-verification`, `google-adsense-account`, `application-name`, `apple-mobile-web-app-title`, `viewport` are present in `dist/index.html` |
| `frontend/src/seo/routes.ts` | Extracted/exported builders: `homeSeoRoute`, `staticSeoRoute`, `templateSeoRoute`, `buildDetailSeoRoute`, `TemplateSeoEntry`; `buildSeoManifest` consumes them (behavior unchanged). Follow-up: category breadcrumbs drop the `/library` crumb (`Home › category`), `/library` stays NOINDEX with an accurate reason label |
| `frontend/src/seo/runtime.ts` (new) | `routeToSeoConfig`, `homeSeoConfig`, `staticPageSeoConfig`, `templatesIndexSeoConfig`, `buildIndexSeoConfig`, `templateSeoConfig`, `buildDetailSeoConfig` — runtime parity factories over the route builders |
| `frontend/src/components/Seo.tsx` | `isPrivatePath` → exported `isSeoNoIndexPath`; guard resets robots + removes canonical on private paths |
| `frontend/src/seo/site.ts` | Added `SITE_ALTERNATE_NAMES` |
| `frontend/src/seo/jsonld.ts` | `webSiteJsonLd` gains `alternateName` |
| `frontend/src/seo/seo.test.ts` (new) | Regression tests: noindex paths/prefixes, indexable public routes (private→public transition), trailing slash normalization, static/template/build-detail builder canonicals, home H1 string. Follow-up: breadcrumbs never reference a NOINDEX path; category breadcrumbs are `Home › category` |
| `frontend/src/pages/HomePage/HomePage.tsx` | `homeSeoConfig()` |
| `frontend/src/pages/HomePage/sections/Hero.tsx` | H1 = **"Craft the Future, of UI"** (matches `homeSeoRoute().h1`; original styling/`sm:whitespace-nowrap` restored per product request) |
| `frontend/src/pages/TemplatesPage/{TemplatesPage,TemplateDetailPage}.tsx` | SEO via `templatesIndexSeoConfig` / `templateSeoConfig` (with fallback) |
| `frontend/src/pages/BuildWithUIHubPage/{BuildWithUIHubPage,BuildWithUIHubDetailPage}.tsx` | SEO via `buildIndexSeoConfig` / `buildDetailSeoConfig` (with fallback) |
| `frontend/src/pages/PricingPage/PricingPage.tsx`, `frontend/src/pages/legal/LegalPage.tsx` | SEO via `staticPageSeoConfig(...)` |
| `frontend/src/pages/Components/CategoryPage.tsx` | Robots parity: indexable only when category passes `minItemsForIndex` |
| `frontend/src/utils/promptUtils.ts`, `frontend/src/utils/checkout.ts`, `frontend/src/pages/PricingPage/PricingPage.tsx` | Byte-level repair of pre-existing CP1252 mojibake (`â€”`→`—`, `â–ˆ`→`█`, box-drawing glyphs, `→` arrows, `─` dividers). No test assertions weakened |
| `frontend/metadata.json` | Accurate name/description |
| `package.json` | `check` now includes `check:frontend` |
| `.github/workflows/seo-checks.yml` (new) | lint + test + build + check:seo on push/PR |

## C. SEO issue report

1. Meta tags dropped by SSG — **Fixed and tested** (counts verified in `dist/index.html`: each preserved meta exactly 1; description/canonical/robots exactly 1; og 6, twitter 4, json-ld 2).
2. Missing/unmanaged runtime head — **Fixed and tested** (`seo.test.ts` regression incl. private→public; `check:seo` parity OK on 149 component routes).
3. Homepage H1 mismatch — **Fixed and tested** (`dist/index.html` H1 vs `Hero.tsx` identical).
4. Misleading sitemap `lastmod` — **Fixed and tested** (static URLs have no `<lastmod>`; component URLs show true `addedAt`).
5. Root script + CI gate — **Fixed, not externally verified** (workflow added; GitHub Actions run requires pushing to the repo).
6. `webSiteJsonLd alternateName` — **Fixed and tested** (lint + unit tests).
7. Stale `metadata.json` — **Fixed and tested** (file updated; no consumer).
8. AEO low-confidence — **Fixed earlier / surfaced**; 67 components remain low-confidence (no authored description or behaviour). `check:seo` only warns; **investigate further** per-component authored metadata.
9. `promptEncoding.test.ts` 5 pre-existing failures — **Fixed and tested** (repaired at source: `promptUtils.ts` banner + em dashes, `checkout.ts`, `PricingPage.tsx`; suite 141/141).
10. `apple-mobile-web-app-title` not regression-guarded — **Fixed and tested** (preserved by `build-seo.mjs`; `check-seo.mjs` now asserts it in `dist/index.html`).
11. Category breadcrumbs referencing NOINDEX `/library` — **Fixed and tested** (`Home › category`; no crumb points at a NOINDEX path; `/library` remains NOINDEX by decision).
12. Root `npm run check` — **Investigated / reported** (see §E): fails on pre-existing infra steps unrelated to this work; the frontend SEO gate passes.

**Requires user access or action:** Google Search Console verification, sitemap submission, URL inspection, page-indexing report, branded vs non-branded query review; confirming the AdSense verification (the `google-adsense-account` meta is preserved, but domain verification is Google-side); re-deploy to Vercel so the new prerendered output goes live; **commit `.github/workflows/seo-checks.yml`** (root `check:tracking` currently fails because the workflow file is untracked) and separately decide whether to fix the pre-existing root-check failures (§E).

## D. Page optimization table (key URLs)

| URL | Primary intent | Title source | H1 | Status |
|---|---|---|---|---|
| `/` | Brand + library overview | `homeSeoRoute` | Craft the Future, of UI | deployed-verified in build |
| `/components/*` | Component lookup | `componentSeo` (rich metadata where authored) | component.title | verified 149 routes |
| `/templates` | Template collection | `staticSeoRoute` | Website Templates | verified |
| `/templates/:id` | Template lookup | `templateSeoRoute` | template.title | verified |
| `/build-with-ui-hub` + detail | Product sections | `staticSeoRoute` / `buildDetailSeoRoute` | section title | verified |
| `/library` category pages | Category lookup | `categorySeo` | category.label | verified; `/library` stays NOINDEX — breadcrumbs are now `Home › category` (no reference to `/library`) |
| `/pricing`, `/privacy`, `/terms`, etc. | Utility/legal | `staticPageSeoConfig` | page h1 | verified |

## E. Test report (actually run)

- `frontend` `npm run lint` (`tsc --noEmit`) → **passed**.
- `frontend` `npm test` (vitest) → **141 passed / 0 failed** (10 files). The 5 pre-existing `promptEncoding.test.ts` mojibake failures are fixed at the source; none of the existing assertions were changed and no test was weakened.
- `frontend` `npm run build` (`vite build && node scripts/build-seo.mjs`) → **passed**; 192 routes (191 indexable) from 149 components, 20 templates, 3 build sections.
- `frontend` `npm run check:seo` → **OK**, exit 0 (metadata parity 149/149, AEO parity 149/149, sitemap+robots valid; 67 low-confidence AEO warn, pre-existing; asserts GSC/AdSense/application-name/apple-mobile-web-app-title/viewport in `dist/index.html`).
- Root `npm run check:frontend` (the exact composite the CI workflow runs) → **EXIT 0**.
- Spot checks on `dist/`: preserved app-owned metas each exactly once; `robots.txt` still `Disallow: /library`; `sitemap.xml` has no `/library` and no `<lastmod>` on static URLs (96 component `<lastmod>` entries from real `addedAt`); `404.html` is noindex with an `<h1>` and app script; category pages emit `Home › category` breadcrumbs.

**Root `npm run check` (root, all steps) → EXIT 1**, stops at `check:tracking`. Per-step results (each actually run):
- `check:secrets` → **pass** (0 issues).
- `check:tracking` → **fail**: `ci-workflows-tracked` (`.github/workflows/seo-checks.yml` is untracked — created by this work; resolves on commit), `agent-file:agent.md` (root `agent.md` absent — pre-existing), `local-ignored:.claude` (not in `.gitignore` — pre-existing).
- `check:knowledge` → **pass**.
- `check:generated` → **fail**: `mcp-server/dist` stale vs a fresh build (pre-existing, MCP-server tooling, unrelated to frontend/SEO).
- `check:docs` → **fail**: `docs/runbook.md:61` asserts `ui-hub` as a live Render service not in the blueprint (pre-existing doc drift).
- `check:config` → **fail**: 4 pre-existing Render config/CORS-CSP conflicts (`render-blueprint-count`, `render-blueprint-coherence`, `mcp-allowed-origins-localhost-in-prod`, `csp-vs-cors`).
- `check:index` → **fail**: 4 generated agent maps stale (`FILE_ROLE_MAP.json`, `COMPONENT_MAP.json`, `PAGE_MAP.json`, `ROUTE_MAP.json`) — agent `generate-index.mjs` indexes tracked sources; the working tree (incl. the new SEO files) changed since the last generation. Regeneration (`npm run agent:index`) is the documented remedy but writes a large tracked diff, so it was **not** applied here.
- `check:frontend` → **pass** (see above).

None of the non-frontend failures are caused by this SEO work (verified: they were reproducible on the baseline; they concern workflow-file tracking/comitting, agent tooling, deploy config, and docs drift). The CI workflow `seo-checks.yml` only gates the frontend steps, which all pass locally; **no GitHub Actions run, deploy, or production verification has occurred**.

**Risks / notes:** not validated against Google (Rich Results Test, Search Console, live domain) — external verification pending. The vendor `index.html` chunk-size warnings and the `TextAnimations`/`DemoPage` dual-import warnings are pre-existing and unrelated.

## F. Google Search Console checklist (pending until you confirm)

1. Verify `uihub.codes` and `www.uihub.codes` in GSC (DNS or HTML-tag method — the verification meta is preserved in output).
2. **URL inspection** on `/`, one `/components/*` page, `/templates`, `/build-with-ui-hub` → "Request indexing" after deploy.
3. **Sitemaps** → submit `https://www.uihub.codes/sitemap.xml`; confirm "Success" and check not-found reasons.
4. **Page indexing report** → watch for "Crawled – currently not indexed" (often thin/no authored metadata on low-confidence components).
5. **Performance reports** → split branded (`UI HUB`, `uihub.codes`) vs non-branded queries; act on high-impression/low-CTR pages (title/description tuning).
6. **AdSense**: confirm the domain verification on the AdSense side once deployed — the meta itself is intact.

## G. Remaining priorities (highest impact first)

1. **Commit the SEO work and push so GitHub Actions + Vercel deploy run** — also resolves root `check:tracking` (`.github/workflows/seo-checks.yml` is currently untracked). Expected benefit: the verified gates go live; effort: minutes; dependency: your push decision.
2. **Deploy to Vercel + GSC verification + sitemap submission** — expected benefit: search engines reflect all fixes; effort: minutes; dependency: repo push/deploy.
3. **Author descriptions/behaviour for the 67 low-confidence components** — expected benefit: non-branded traffic on the largest page set; effort: medium; dependency: content authoring (product data, not code).
4. **Reconcile the 6 metadata entries with no `componentList` entry** (`3d-galaxy-animation`, `odyssey-spline`, `3d-orbital-experience`, `3d-tubes-cursor`, `grid-background`, `novatrix-background`) — benefit: accuracy; effort: low.
5. **Repair the pre-existing root `npm run check` failures** (see §E): commit the workflow, then decide whether to regenerate the agent index (`npm run agent:index` — large tracked diff), fix `.claude` gitignore and missing root `agent.md`, stale `mcp-server/dist`, the `docs/runbook.md:61` drift, and the 4 Render/CSP-CORS `check:config` conflicts. None block the frontend SEO gate.
6. **Confirm the 6 no-`componentList` entries are intentional** if you'd rather keep them out of the component metadata table.

## H. Monitoring plan (30 days)

- Day 0: deploy, verify GSC, submit sitemap, request indexing on priority URLs.
- Day 7: check Page indexing report (surfaced/valid reasons) and sitemap stats; confirm no "Discovered but not indexed" trend.
- Day 14: review Performance for branded queries (brand discovery) and top component impressions.
- Day 30: compare branded vs non-branded clicks + average position vs. prior 4 weeks; prioritize page-level metadata/content work for pages with impressions ≥ 1k but CTR near 0.

**External-verification disclaimer:** No Google Search Console, AdSense, DNS, or deployment actions were performed or claimed by this work — the seams above are identified for your manual completion.