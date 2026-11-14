# UI HUB — Phase 6: Post-Deployment Verification Plan

**Auditor:** Principal Technical SEO Auditor & Search Discoverability Specialist  
**Project:** UI HUB  
**Target Domain:** https://www.uihub.codes/  
**Execution Phase:** STAGE B (Post-Deployment Verification)  
**Status:** **READY FOR EXECUTION UPON DEPLOYMENT**

---

## 1. Automated Post-Deployment Curl / HTTP Verification Script

Run the following automated verification script immediately following production deployment to validate live HTTP responses, header security, and asset serving:

```bash
# 1. Verify Root Domain & Status 200
curl -s -o /dev/null -w "Homepage Status: %{http_code}\n" https://www.uihub.codes/

# 2. Verify Apex Domain 308 Permanent Redirect
curl -s -o /dev/null -w "Apex Redirect Status: %{http_code}\n" https://uihub.codes/

# 3. Verify Robots.txt
curl -s https://www.uihub.codes/robots.txt | grep -E "User-agent|Disallow|Sitemap"

# 4. Verify Sitemap Content Type & Route Count
curl -s -I https://www.uihub.codes/sitemap.xml | grep -i "content-type"
curl -s https://www.uihub.codes/sitemap.xml | grep -c "<loc>"

# 5. Verify Machine-Readable llms.txt (Resolving Previous 404 Warning)
curl -s -o /dev/null -w "llms.txt Status: %{http_code}\n" https://www.uihub.codes/llms.txt
curl -s https://www.uihub.codes/llms.txt | head -n 10

# 6. Verify Static Logo Asset
curl -s -I https://www.uihub.codes/logo.svg | grep -E "HTTP|content-type|cache-control"

# 7. Verify Private Route X-Robots-Tag Injections
curl -s -I https://www.uihub.codes/profile | grep -i "x-robots-tag"
```

---

## 2. Representative Live Component Routes Verification

Execute HTTP inspection on representative routes across various component complexity tiers:

1. **Recently Added Buttons (Reconciling 169 Component Count):**
   - `https://www.uihub.codes/components/button/venom-button` (Target: HTTP 200, contains WebGL meta)
   - `https://www.uihub.codes/components/button/spider-button` (Target: HTTP 200)
   - `https://www.uihub.codes/components/cursor/spider-crawler` (Target: HTTP 200)
2. **Heavy 3D & WebGL Components:**
   - `https://www.uihub.codes/components/3d/rubiks-cube` (Target: HTTP 200)
   - `https://www.uihub.codes/components/space/solar-system` (Target: HTTP 200)
3. **Interactive Backgrounds:**
   - `https://www.uihub.codes/components/interactive-background/black-hole-cursor` (Target: HTTP 200)
4. **Category Showcases:**
   - `https://www.uihub.codes/components/interactive-background` (Target: HTTP 200)
   - `https://www.uihub.codes/components/space` (Target: HTTP 200)

---

## 3. Production HTML & Metadata Inspection Checklist

For each probed live URL, verify:
- [ ] Initial HTML contains server-rendered `<title>` clamped to `<60` characters.
- [ ] `<meta name="description">` matches authored content (not generic fallback).
- [ ] `<link rel="canonical">` points strictly to `https://www.uihub.codes/...` with no apex or port leakage.
- [ ] `<script type="application/ld+json">` contains valid JSON with `@type: "TechArticle"` or `"SoftwareSourceCode"`.
- [ ] Initial SSR HTML includes semantic `<article>` tags containing Quick Answer, Quick Facts, and Prop tables.
- [ ] Client-side React hydration completes cleanly without flashing white screen or erasing rendered DOM (`SEED_WIPE` parity verified).

---

## 4. Live Component Count Verification

On `https://www.uihub.codes/`:
- [ ] Verify that homepage text reads:  
  `"The library currently holds 169 components across 16 categories, plus 17 complete website templates."`  
  (Replacing the outdated 166 component count on previous production deployment).

---

## 5. Security & Private Route Protection Checks

- [ ] `/profile` returns header `X-Robots-Tag: noindex, nofollow`.
- [ ] `/admin/` and `/dashboard/` return 401/403 or redirect to login when unauthenticated.
- [ ] Zero private user profile data or sensitive tokens leak into public static SSR files.

---

## 6. Official Crawler Verification Protocol

When server logs or Vercel edge drains become accessible post-deployment:
- Verify Googlebot IPs using reverse DNS (`host <IP>` → `*.googlebot.com`).
- Verify Bingbot IPs using reverse DNS (`host <IP>` → `*.search.msn.com`).
- Verify OpenAI crawlers against published IP lists at `https://openai.com/searchbot.json`.
- Verify Anthropic crawlers against reverse DNS `*.anthropic.com`.
- **Note:** Do not rely on raw user-agent headers alone. If logs are unavailable, report **NOT VERIFIED**.

