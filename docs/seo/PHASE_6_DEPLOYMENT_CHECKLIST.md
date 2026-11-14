# UI HUB — Phase 6: Pre-Production Deployment Checklist

**Auditor:** Principal SEO Release Engineer  
**Project:** UI HUB  
**Branch:** `seo/claude-seo-integration`  
**Date:** 2026-11-13  
**Status:** **AWAITING OWNER RELEASE APPROVAL**

---

## 1. Pre-Deployment Gating Checklist

The following items must be strictly satisfied before triggering any Git merge or production deployment:

### Step 1: Branch & Working Tree Verification
- [x] On branch `seo/claude-seo-integration`.
- [x] Zero merge conflicts with upstream.
- [x] Clean line endings (CRLF/LF normalized).
- [x] Untracked files audit completed (no secrets or build outputs staged).

### Step 2: Quality & Automated Test Verification
- [x] `npm --prefix frontend test`: 174/174 unit and integration tests passing (Exit code 0).
- [x] `npm --prefix frontend run lint`: TypeScript compiles with 0 errors (Exit code 0).
- [x] `npm --prefix frontend run build:seo`: 214 routes (213 indexable) prerendered (Exit code 0).
- [x] `npm --prefix frontend run check:seo`: 169/169 components verified with 100% metadata parity (Exit code 0).
- [x] `npm --prefix frontend run check:coverage`: 226 URLs audited, 213 indexable, 0 orphans (Exit code 0).
- [x] `npm --prefix frontend run build`: Full production build succeeds in <25s (Exit code 0).

### Step 3: SEO Deliverables Verification
- [x] Canonical apex-to-www redirect defined in `vercel.json`.
- [x] Prerendered HTML generated for all 213 indexable URLs.
- [x] `dist/sitemap.xml` contains exactly 213 indexable URLs.
- [x] `dist/robots.txt` allows search crawlers and blocks `/dashboard`, `/admin/`.
- [x] `dist/llms.txt` verified with all 16 component categories.
- [x] Component counter dynamically displays `"169 components across 16 categories"`.

---

## 2. Production Deployment Execution Protocol (Upon Approval Only)

When the repository owner grants explicit approval to deploy:

1. **Stash / Commit Changes:**
   Commit all verified Phase 1–6 source files, documentation, and metadata on branch `seo/claude-seo-integration`.
2. **Pull Request & Merge:**
   Create PR from `seo/claude-seo-integration` into `main`. Verify preview deployment build logs in Vercel.
3. **Merge to `main`:**
   Trigger automated Vercel production deployment.
4. **Immediate Post-Deployment Sanity Check:**
   Execute Stage 8 HTTP validation commands against live production domain `https://www.uihub.codes/`.

---

## 3. Post-Deployment Search Engine Setup Protocol

1. **Google Search Console:**
   - Log into Google Search Console for property `https://www.uihub.codes/`.
   - Submit sitemap URL: `https://www.uihub.codes/sitemap.xml`.
   - Run URL Inspection on `https://www.uihub.codes/` and representative component `/components/button/venom-button`.
   - Request indexing on the homepage to refresh Googlebot's canonical cache.
2. **Bing Webmaster Tools:**
   - Verify domain `https://www.uihub.codes/`.
   - Submit sitemap URL: `https://www.uihub.codes/sitemap.xml`.
   - Check AI Performance reporting tab for Microsoft Copilot grounding.
3. **IndexNow Setup (Owner Decision):**
   - Place generated API key file `{apiKey}.txt` in `frontend/public/`.
   - Submit updated URL list to `https://api.indexnow.org/indexnow`.

---

## 4. Strict Safety Guardrails

- 🛑 **DO NOT MERGE TO MAIN** without explicit owner approval.
- 🛑 **DO NOT PUSH TO PRODUCTION** without explicit owner approval.
- 🛑 **DO NOT TRIGGER INDEXNOW SUBMISSIONS** against production until deployed.
- 🛑 **DO NOT ALTER TRAINING CRAWLER DIRECTIVES** in robots.txt.

