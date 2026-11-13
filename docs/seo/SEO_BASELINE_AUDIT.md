# UI HUB — SEO Baseline Audit

**Site:** https://www.uihub.codes/  
**Audited:** 2026-11-13  
**Branch:** `seo/claude-seo-integration`  
**Auditor:** SEO Implementation Engineer (Phase 1)

---

## 1. Architecture Overview

UI HUB is a Vite/React SPA with a **hybrid static-prerender** architecture:

| File | Role |
|---|---|
| `frontend/scripts/build-seo.mjs` | Generates static HTML for all 213 indexable routes into `frontend/dist/` |
| `frontend/src/seo/routes.ts` | Master route registry — metadata, robots rules, noindex paths |
| `frontend/src/seo/site.ts` | Site-wide constants (`SITE_URL`, `SITE_NAME`, etc.) |
| `frontend/src/seo/jsonld.ts` | JSON-LD schema builders (Organization, WebSite, BreadcrumbList, etc.) |
| `frontend/src/components/Seo.tsx` | `useSeo()` hook for client-side navigation metadata |
| `frontend/scripts/check-seo.mjs` | Validation script — runtime/prerender parity, AEO checks |
| `frontend/scripts/generate-indexing-matrix.mjs` | Produces `SEO_INDEXING_MATRIX.csv` |
| `vercel.json` | Vercel routing config — rewrites for SPA-only routes, 404 handling |

**Deployment:** Vercel. `frontend/dist/` is the output directory.  
**Prerendering:** 213 static HTML files generated at build time for all indexable routes.  
**Routing:** No blanket SPA catch-all — unknown URLs return a real HTTP 404.

---

## 2. Baseline Metrics (Pre-Phase-1)

| Metric | Value |
|---|---|
| Total URLs inventoried | 226 |
| Indexable URLs | 213 |
| Noindex URLs | 13 (auth-gated, utility pages) |
| Orphaned indexable pages | 0 |
| Non-root pages with inbound links | 212 / 212 (100%) |
| Valid canonical tags | 213 / 213 (100%) |
| HTTP 200 on indexable pages (prerender) | 213 / 213 (100%) |
| Sitemap coverage | 213 / 213 (100%) |
| JSON-LD schemas present | ✅ All indexable pages |
| OG / Twitter metadata | ✅ All indexable pages |
| AEO: high-confidence components | 100 / 169 (59%) |
| AEO: low-confidence components | 68 / 169 (40%) — no authored description |

**Google Search Console context (prior audit log, ~2026-11-01):**
- Indexed: 38 pages  
- Discovered not indexed: ~170 pages  
- Root cause at that time: internal link graph incomplete (orphaned pages)  
- Fix applied on 2026-11-01: internal link graph rebuilt → 100% inbound link coverage

---

## 3. Existing Strengths

The site already had a solid SEO foundation before Phase 1:

- ✅ **Hybrid prerendering** — every indexable URL gets a fully rendered static HTML file with real metadata
- ✅ **Complete internal link graph** — 0 orphans; all 212 non-root indexable pages are linked from at least one indexable page
- ✅ **100% canonical coverage** — every prerendered page has a self-referential `<link rel="canonical">`
- ✅ **Sitemap** — 213 URLs, all production domain, all valid ISO lastmod dates
- ✅ **robots.txt** — served correctly, includes sitemap reference
- ✅ **JSON-LD schemas** — Organization, WebSite, BreadcrumbList, SoftwareSourceCode, CollectionPage on all relevant pages
- ✅ **OG / Twitter cards** — present on all prerendered pages
- ✅ **404 handling** — HTTP 404 returned for unknown URLs (no catch-all SPA rewrite)
- ✅ **TypeScript + test coverage** — 11 test files, 161 tests covering SEO routes, vercel routing, AEO, schema

---

## 4. Issues Found During Audit

### Critical Issues
_None identified._

### High Issues

| ID | Issue | Location | Impact |
|---|---|---|---|
| P1-01 | `/profile` SPA route missing from `vercel.json` rewrites | `vercel.json` | Direct navigation to `/profile` returns 404 instead of loading the SPA |
| P1-02 | Broken internal link `/library` in `dist/404.html` | `frontend/scripts/build-seo.mjs` | 404 page linked to a non-existent static route `/library` |

### Medium Issues

| ID | Issue | Location | Impact |
|---|---|---|---|
| P1-03 | `/profile` missing from `NOINDEX_PATHS` | `frontend/src/seo/routes.ts` | Auth-gated page could theoretically be indexed |
| P1-04 | Redundant sub-paths in `ROBOTS_BLOCKED_PATHS` | `frontend/src/seo/routes.ts` | `/dashboard/mcp`, `/dashboard/collections`, `/admin/mcp` were listed individually but already covered by prefix rules |
| P1-05 | Tests asserting redundant paths in `ROBOTS_BLOCKED_PATHS` | `frontend/src/seo/seo.test.ts` | 3 test failures after P1-04 cleanup |

### Low / Info Issues

| ID | Issue | Location | Impact |
|---|---|---|---|
| P1-06 | No `docs/seo/` directory | Repo root | No SEO documentation |
| P1-07 | 68 components with low-confidence AEO content | Component data | Thin content on 40% of component pages — Phase 3 item |

### Items Investigated But Confirmed Non-Issues

| Item | Finding |
|---|---|
| UTF-8 encoding in `frontend/index.html`, `site.webmanifest`, `sw.js` | Windows console rendering issue — files are correctly UTF-8 encoded |
| `favicon.svg` large file (533KB) in public | Valid SVG, not a Phase 1 concern |
| `frontend/index.html` having its own conflicting title/meta | Intentional — Vite dev shell, overridden by `build-seo.mjs` for production |
| `/profile` links in `Navbar.tsx` flagged by link checker | Valid SPA route — script false positives |

---

## 5. Tools & Scripts Used

| Script | Purpose |
|---|---|
| `npm run check:seo` | Runtime/prerender metadata parity, AEO checks |
| `npm run check:coverage` | URL inventory, orphan detection, canonical validation |
| `npm test` | Full unit test suite (Vitest, 11 files, 161 tests) |
| `npm run lint` | TypeScript type checking (`tsc --noEmit`) |
| `npm run build:seo` | Regenerates `dist/sitemap.xml`, `dist/robots.txt`, all static HTML |
| `scripts/test-dist-links.mjs` | Custom: scanned all dist HTML for broken internal links |

---

## 6. Phase 1 Status

**All Phase 1 issues resolved.** See `SEO_FIX_ROADMAP.md` for full status.

