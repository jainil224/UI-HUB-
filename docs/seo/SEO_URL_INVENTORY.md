# UI HUB — Complete SEO URL Inventory

**Domain:** `https://www.uihub.codes`  
**Total URLs Tracked:** 226  
**Indexable URLs:** 213  
**Noindex / Restricted URLs:** 13  
**Audit Date:** 2026-11-13  
**Status:** All 213 indexable URLs verified 100% crawlable, linked, with valid canonicals and HTTP 200 prerender status.

---

## 1. Inventory Summary by Page Type

| Page Type | Count | Indexability | Prerender Status | Inbound Link Status |
|---|---|---|---|---|
| **Home (`/`)** | 1 | INDEX | Prerendered (HTTP 200) | Root / Entry |
| **Templates Index (`/templates`)** | 1 | INDEX | Prerendered (HTTP 200) | 100% linked |
| **Build Index (`/build-with-ui-hub`)** | 1 | INDEX | Prerendered (HTTP 200) | 100% linked |
| **Static / Informational Pages** | 5 | INDEX | Prerendered (HTTP 200) | 100% linked (Footer/Header) |
| **Component Category Hubs** | 16 | INDEX | Prerendered (HTTP 200) | 100% linked (Hub & Navbar) |
| **Individual Component Pages** | 169 | INDEX | Prerendered (HTTP 200) | 100% linked (Category & Grids) |
| **Template Detail Pages** | 17 | INDEX | Prerendered (HTTP 200) | 100% linked (Templates Hub) |
| **Build Detail Pages** | 4 | INDEX | Prerendered (HTTP 200) | 100% linked (Build Hub) |
| **Error / Utility Page (`/404`)** | 1 | NOINDEX | Prerendered (HTTP 404 target) | Unlinked |
| **Auth & Account Pages** | 4 | NOINDEX | Client SPA (Vercel rewrite) | App navigation |
| **User Collections & Personal Hubs** | 2 | NOINDEX | Client SPA (Vercel rewrite) | App navigation |
| **Admin & Protected Dashboards** | 4 | NOINDEX + ROBOTS DISALLOW | Client SPA (Vercel rewrite) | Gated |
| **Internal Preview Utility** | 1 | NOINDEX | Client SPA | Internal tool |
| **TOTAL** | **226** | **213 INDEX / 13 NOINDEX** | **100% Coverage** | **0 Orphaned Pages** |

---

## 2. Indexable Architecture

### A. Root & Index Hubs (3 URLs)
- `https://www.uihub.codes/` — Homepage (Featured components, categories, interactive hero)
- `https://www.uihub.codes/templates` — Website templates index
- `https://www.uihub.codes/build-with-ui-hub` — Full page sections & layout builders

### B. Static & Informational Pages (5 URLs)
- `https://www.uihub.codes/pricing` — Plans & token credits
- `https://www.uihub.codes/privacy` — Privacy Policy
- `https://www.uihub.codes/terms` — Terms of Service
- `https://www.uihub.codes/cookies` — Cookie Policy & preference center
- `https://www.uihub.codes/contact` — Support and developer contact

### C. Component Category Pages (16 Hubs)
All categories host curated lists of production UI elements with dedicated schema breadcrumbs:
- `/components/interactive-background`
- `/components/buttons`
- `/components/cards`
- `/components/text-animations`
- `/components/loaders`
- `/components/inputs`
- `/components/navigation`
- `/components/cursor-effects`
- `/components/3d-elements`
- `/components/image-effects`
- `/components/menus`
- `/components/dialogs`
- `/components/tables`
- `/components/animations`
- `/components/forms`
- `/components/special-effects`

### D. Individual Component Pages (169 URLs)
- 100 components with rich authored metadata and high-confidence AEO FAQs.
- 68 components with auto-inferred AEO metadata (slated for manual authoring in Phase 3).
- 1 component variant showcase.
- Every component route is prerendered into `frontend/dist/` with self-referential canonical, SoftwareSourceCode JSON-LD, BreadcrumbList, and OG meta.

### E. Template & Build Detail Pages (21 URLs)
- 17 production website templates (`/templates/:slug`).
- 4 full-page marketing section builders (`/build-with-ui-hub/:slug`).

---

## 3. Excluded & Noindex URL Inventory (13 URLs)

These URLs are intentionally excluded from indexing, sitemaps, and search engines:

| URL | Category | Robots Meta | Robots.txt Status | Justification |
|---|---|---|---|---|
| `/404` | Error | `noindex, nofollow` | Allowed (for soft-404 prevention) | Standalone error display |
| `/login` | Auth | `noindex, nofollow` | Allowed (crawlable form) | Private login view |
| `/signup` | Auth | `noindex, nofollow` | Allowed (crawlable form) | Private registration view |
| `/forgot-password` | Auth | `noindex, nofollow` | Allowed (crawlable form) | Password recovery form |
| `/profile` | Account | `noindex, nofollow` | Allowed | Authenticated user profile |
| `/library` | User Space | `noindex, nofollow` | Allowed | User private saved library |
| `/favorites` | User Space | `noindex, nofollow` | Allowed | User personal bookmarked components |
| `/dashboard` | User Space | `noindex, nofollow` | `Disallow: /dashboard` | Authenticated customer dashboard |
| `/dashboard/mcp` | User Space | `noindex, nofollow` | `Disallow: /dashboard/` | Personal MCP keys & endpoints |
| `/dashboard/collections`| User Space | `noindex, nofollow` | `Disallow: /dashboard/` | User custom collections |
| `/admin/mcp` | Admin | `noindex, nofollow` | `Disallow: /admin/` | Platform administrator console |
| `/preview-capture` | Internal | `noindex, nofollow` | Allowed | Headless screenshot capture utility |
| `/components/custom` | Dynamic | `noindex, nofollow` | Allowed | Unpersisted client-side generator sandbox |

---

## 4. Verification & Validation Metrics

- **Canonical Tag Integrity:** 100% (213 / 213 indexable pages point strictly to `https://www.uihub.codes<pathname>`).
- **Orphan Count:** 0. Every non-root indexable URL has at least 1 verified internal inbound link.
- **Sitemap Consistency:** 213 URLs in `frontend/dist/sitemap.xml`, perfectly matching indexable routes.
- **Matrix Source:** See `SEO_INDEXING_MATRIX.csv` at project root for per-URL audit data.

