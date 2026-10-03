# UI HUB — Production SEO Specification

## Document Purpose

This file is the implementation specification for the UI HUB AI coding agent.

The goal is to make UI HUB as discoverable as possible in Google, Bing, and other search engines for searches that are genuinely relevant to the website, including searches for:

- Hero section designs
- Hero section templates
- Hero section examples
- Footer designs
- Footer code
- Interactive website backgrounds
- Animated website backgrounds
- 3D website backgrounds
- Templates
- UI components
- Individual UI HUB component names
- Individual UI HUB template names
- Individual UI HUB background names
- Technology-specific searches such as React, Tailwind CSS, TypeScript, CSS, Framer Motion, etc., where the content actually supports those technologies

Important: Search visibility is not guaranteed by SEO implementation alone. The objective is to maximize technical eligibility, relevance, crawlability, indexability, content clarity, and discoverability for useful UI HUB pages.

---

# 0. Non-Negotiable Rules

Before changing anything, inspect the existing UI HUB codebase and understand the current architecture.

Do NOT:

- redesign the website
- replace the current UI unnecessarily
- remove working functionality
- change branding without a requirement
- create fake content
- create fake reviews or statistics
- hide SEO text from users
- keyword stuff pages
- generate thousands of thin pages only because keywords exist
- create duplicate pages with nearly identical content
- make every page target every keyword
- add irrelevant keywords to unrelated component pages
- add unsupported claims such as “#1”, “best”, “award-winning”, etc.
- create doorway pages
- index private/admin/account pages
- use robots.txt as a substitute for `noindex`
- change existing public URLs without preserving redirects
- add structured data that does not match visible content
- add arbitrary SEO hacks whose behavior is unsupported by search engines

The site must remain useful for humans first.

---

# 1. Current UI HUB Context

Current known production site:

`https://ui-hub-design.vercel.app/`

Current templates area:

`https://ui-hub-design.vercel.app/templates`

The current public site identifies itself as:

`UI Hub — The Home of Vibe Coding`

Do not assume this phrase must remain the final SEO title. Audit the site and choose the most descriptive production title based on the actual content and brand.

The website is a visual UI resource platform and may contain:

- UI components
- Templates
- Hero sections
- Footer designs
- Interactive backgrounds
- Animated backgrounds
- 3D backgrounds
- UI effects
- Buttons
- Cards
- Navigation components
- Cursor effects
- Other reusable web UI

The implementation must discover the actual current categories and content from the codebase/database instead of hard-coding assumptions.

---

# 2. Primary SEO Objective

Build UI HUB as a collection of useful, indexable landing pages rather than trying to rank the entire website for every query from the homepage.

The SEO architecture should follow:

Homepage
→ Main categories
→ Subcategories
→ Individual content pages
→ Related content

Example:

`/`
→ `/templates`
→ `/templates/hero-sections`
→ `/templates/hero-sections/minimal-hero`

Another example:

`/`
→ `/backgrounds`
→ `/backgrounds/3d`
→ `/backgrounds/3d/aurora-3d`

Another example:

`/`
→ `/components`
→ `/components/buttons`
→ `/components/buttons/magnetic-button`

The exact route names should match the existing project architecture.

---

# 3. Keyword Strategy — VERY IMPORTANT

Do not put the entire keyword list on one page.

Create a keyword-to-page map.

Each page should have:

- one primary search intent
- closely related secondary terms
- naturally written content
- page-specific metadata
- page-specific headings
- page-specific internal links

Keyword examples are seed terms, NOT instructions to repeat phrases unnaturally.

---

# 4. Keyword Cluster: Hero Sections

Create or identify a dedicated public landing page for hero sections, if the content exists.

Preferred conceptual route:

`/templates/hero-sections`

or the closest appropriate route in the existing architecture.

Primary keyword:

`hero section design`

Secondary keywords:

- hero section design template
- hero section design free
- modern hero section design
- simple hero section design
- hero section website examples
- modern hero section
- website hero section
- hero section template
- hero section UI
- landing page hero section
- hero section examples
- responsive hero section
- React hero section
- Tailwind hero section

Natural page title example:

`Hero Section Designs & Templates | UI HUB`

Natural H1 example:

`Hero Section Designs & Templates`

The exact final title must be generated from actual page content and kept within practical search-result display limits.

Page content should explain what the category contains before the visual grid.

Example introductory concept:

“Explore modern hero section designs and reusable website templates for landing pages, portfolios, SaaS websites, and other modern web projects.”

Do not copy this exact sentence to every page. Generate original, accurate category content.

---

# 5. Individual Hero Section SEO

Every important hero section/template should have its own stable public page when the content is substantial enough to provide unique value.

Examples:

`/templates/hero-sections/minimal-hero`
`/templates/hero-sections/saas-hero`
`/templates/hero-sections/aurora-hero`

Only create pages for real existing content.

For each individual hero page, use the actual component/template name.

Example:

Title:

`Minimal Hero Section Design | React & Tailwind CSS | UI HUB`

Possible page H1:

`Minimal Hero Section`

Possible description:

`A simple modern hero section for landing pages and portfolio websites, with reusable UI code and responsive layout.`

Only mention React/Tailwind/etc. when the item actually uses those technologies.

---

# 6. Keyword Cluster: Footer Designs

Create or identify a dedicated public page for footer designs.

Conceptual route:

`/components/footer`

or:

`/templates/footer`

depending on the existing UI HUB architecture.

Primary keyword:

`footer design`

Secondary keywords:

- footer design free
- footer design free code
- footer design for website
- footer design ideas
- modern footer design
- website footer design
- footer UI
- footer section design
- responsive footer design
- React footer design
- Tailwind footer
- website footer examples

Example title:

`Footer Designs & Free Code | UI HUB`

Example H1:

`Footer Designs for Websites`

Again, generate page content from actual UI HUB footer assets.

---

# 7. Keyword Cluster: Interactive Backgrounds

Create a dedicated category page when interactive backgrounds exist.

Conceptual route:

`/backgrounds/interactive`

Primary keyword:

`interactive background for website`

Secondary keywords:

- interactive background for website code
- interactive website background
- interactive web background
- interactive background animation
- interactive website effects
- interactive background code
- React interactive background
- JavaScript interactive background
- canvas background effects

Example title:

`Interactive Website Backgrounds | UI HUB`

Example H1:

`Interactive Backgrounds for Websites`

Include text explaining what the category contains and the actual technologies supported.

---

# 8. Keyword Cluster: Animated Backgrounds

Conceptual route:

`/backgrounds/animated`

Primary keyword:

`animated background for website`

Secondary keywords:

- animated background for website free
- web background animation effects
- animated website backgrounds
- animated web backgrounds
- CSS animated background
- React animated background
- animated background effects
- website animation background

Example title:

`Animated Backgrounds for Websites | UI HUB`

Example H1:

`Animated Website Backgrounds`

Do not claim “free” unless the actual item/license permits that description.

---

# 9. Keyword Cluster: 3D Backgrounds

Conceptual route:

`/backgrounds/3d`

Primary keyword:

`3d background for website`

Secondary keywords:

- animated 3D backgrounds for your website
- 3D website background
- 3D web background
- 3D background animation
- 3D website effects
- 3D background effects
- interactive 3D background
- WebGL background
- Three.js background

Example title:

`3D Website Backgrounds & Animated Effects | UI HUB`

Example H1:

`3D Backgrounds for Websites`

Only mention WebGL, Three.js, React Three Fiber, etc. if the actual item uses those technologies.

---

# 10. Keyword Cluster: Templates

Main route:

`/templates`

This page should target broad template intent.

Potential primary terms:

- website templates
- web templates
- UI templates
- modern website templates
- free website templates (only if the actual offering is free)
- React templates
- Tailwind CSS templates
- landing page templates
- portfolio templates
- SaaS templates
- dashboard templates

Possible title:

`Website Templates & UI Designs | UI HUB`

Possible H1:

`Website Templates & UI Designs`

The exact terms must reflect what UI HUB actually provides.

Do not stuff all category keywords into this page.

Link to specialized categories such as hero sections, footers, SaaS, portfolio, landing pages, dashboards, etc., when those categories actually exist.

---

# 11. UI HUB Component Names Are Search Topics

This is a core requirement.

Every meaningful, public, reusable UI HUB component name should be treated as its own potential search topic.

Examples of possible component-name searches:

- Magnetic Button
- Aurora Background
- Glass Card
- Cursor Trail
- Bento Grid
- Animated Navbar
- Gradient Text
- 3D Card
- Spectrum Waveform Visualizer

These examples must NOT be assumed to exist. The agent must scan the actual UI HUB content/database and use the real names.

For every substantial component, create a clean public URL.

Example conceptual structure:

`/components/buttons/magnetic-button`
`/backgrounds/aurora`
`/components/cards/glass-card`
`/components/cursor-effects/cursor-trail`

Individual pages should naturally include:

- exact component name
- short factual description
- technologies
- use cases
- features
- installation information
- usage information
- customization information
- related components

The component name should appear naturally in the title, H1, introductory text, URL slug, and internal links when appropriate.

Do NOT force unrelated keywords onto the page.

---

# 12. Automatic SEO for Every Content Item

This must be dynamic.

When a new UI HUB component/template/background is added, the application should automatically provide SEO metadata without requiring a developer to manually edit SEO code for that specific item.

The system should derive or generate, where appropriate:

- slug
- SEO title
- meta description
- canonical URL
- H1
- OG title
- OG description
- OG image
- sitemap inclusion
- breadcrumb data
- indexability state
- last modified date

Use the existing content model/database.

Do not duplicate existing database fields unnecessarily.

If the project already has SEO fields, reuse them.

---

# 13. Slug Rules

Slugs should be:

- lowercase
- readable
- stable
- descriptive
- short enough to understand
- based on the actual content name

Examples:

`magnetic-button`
`aurora-background`
`glass-card`
`minimal-hero`
`saas-dashboard`

Avoid:

`item-12345`
`component?id=abc`
`new-component-final-2`

Handle duplicate names safely.

Never create multiple URLs for the same content unless there is a real content reason.

---

# 14. SEO Metadata System

Every indexable public page must have:

- unique title
- unique meta description
- canonical URL
- correct robots directive
- correct Open Graph metadata
- correct social metadata where appropriate

Use the framework's correct server/client metadata mechanism.

Do not put metadata only inside browser-only components when server-rendered metadata is available.

---

# 15. Title Rules

Titles must:

- accurately describe the page
- contain the core topic naturally
- include UI HUB brand where appropriate
- avoid stuffing multiple keywords
- avoid repetitive boilerplate
- avoid misleading titles

Good examples:

`Hero Section Designs & Templates | UI HUB`
`Interactive Website Backgrounds | UI HUB`
`3D Website Backgrounds | UI HUB`
`Footer Designs & Free Code | UI HUB`
`Magnetic Button | React UI Component | UI HUB`

Bad example:

`Hero Section Design Free Modern Hero Section Template Hero Section Website Examples | UI HUB`

---

# 16. Meta Description Rules

Every important page should have a useful page-specific description.

It should summarize the page, not list keywords.

Example:

`Explore modern hero section designs and reusable website templates for landing pages, portfolios, SaaS websites, and more.`

For an individual component:

`Animated magnetic button component with customizable interaction effects. Preview, copy the code, and use it in your project.`

Only claim what the page actually provides.

---

# 17. Canonical URL System

Every indexable public page must specify its preferred canonical URL.

Example:

`https://YOUR-PRODUCTION-DOMAIN/components/buttons/magnetic-button`

Audit and consolidate URL variants caused by:

- query parameters
- filters
- sorting
- previews
- duplicate routes
- trailing slash variants
- alternate slug formats
- case differences

Use canonicalization for duplicate/variant URLs.

Use permanent redirects when a public URL is permanently moved.

Do not use canonical as a substitute for a real redirect when the old URL has permanently moved.

---

# 18. Robots.txt

Create or verify a production `/robots.txt`.

Minimum conceptual configuration:

```txt
User-agent: *
Allow: /

Sitemap: https://YOUR-PRODUCTION-DOMAIN/sitemap.xml
```

Then add carefully scoped rules only for private/unnecessary crawl areas.

Potential private paths:

- `/admin/`
- `/dashboard/`
- `/account/`
- private/internal tooling

IMPORTANT:

Do not accidentally block public:

- components
- templates
- backgrounds
- docs
- guides
- category pages

robots.txt controls crawling, not indexing. Use appropriate `noindex` directives where a URL should not appear in search.

---

# 19. Dynamic XML Sitemap

Create or improve:

`/sitemap.xml`

The sitemap must be generated automatically from the actual public content.

Include only:

- canonical URLs
- indexable pages
- public content
- stable URLs

Exclude:

- admin
- login
- signup
- dashboard
- account
- temporary previews
- internal search results unless intentionally valuable and indexable
- duplicate URLs
- redirect URLs
- URLs marked noindex

When reliable update timestamps exist, output accurate `lastmod` values.

The sitemap must update automatically when new components/templates/backgrounds are published.

---

# 20. Indexing Rules

Create an explicit indexing policy.

Index:

- homepage
- useful category pages
- useful individual component pages
- useful template pages
- useful background pages
- useful documentation pages
- useful evergreen guides

Normally noindex:

- login
- signup
- dashboard
- account
- admin
- private pages
- temporary internal previews
- low-value duplicate filter pages
- low-value search-result pages

Do not blindly noindex pages without auditing their value.

---

# 21. Page Content Must Exist as Text

UI HUB is visual-heavy. Search engines must not have to infer page meaning from a screenshot or animation alone.

Every important public page should expose useful textual information in the rendered HTML, including:

- page title
- H1
- short description
- category
- technology
- important features
- useful contextual text
- links

Do not place all SEO value inside images, videos, WebM, canvas, or inaccessible client-only interactions.

The visual preview can remain visually rich; the page also needs textual context.

---

# 22. Component Page SEO Template

For an individual component page, use this conceptual information hierarchy:

```text
H1: [Actual Component Name]

Short factual description

Live Preview

Quick facts:
- Category
- Framework
- Language
- Styling
- Dependencies
- License

Features

Installation

Usage

Customization

Accessibility / responsive behavior when relevant

Related components

Breadcrumbs
```

Do not force every section if the content does not apply.

Do not make the page artificially long.

The page must be useful even without search traffic.

---

# 23. Category Page SEO Template

For a category page:

```text
H1: [Category]

1 short useful introduction

Subcategories when applicable

Component/template grid

Useful category explanation

Related categories

Internal links

Breadcrumbs
```

Examples:

`Hero Section Designs & Templates`

`Interactive Website Backgrounds`

`3D Website Backgrounds`

`Footer Designs for Websites`

`React UI Components`

The content must reflect actual inventory.

Do not create a category page with no meaningful content simply to target a keyword.

---

# 24. Homepage SEO

The homepage should clearly tell a first-time visitor and a search engine what UI HUB is.

It should naturally communicate the major resources available on the platform.

Potential concepts, only if accurate:

- UI components
- templates
- backgrounds
- animations
- effects
- developer-focused UI resources

The homepage should link prominently to the most important category pages.

Do not turn the homepage into a huge keyword list.

---

# 25. Internal Linking System

Create a deliberate internal link graph.

Important public pages should be discoverable through standard crawlable links.

Examples:

`Hero Section`
→ `Hero Section category`
→ `Landing page templates`
→ `Related hero sections`

`Magnetic Button`
→ `Button components`
→ `Animated components`
→ `Related buttons`

`3D Background`
→ `3D backgrounds`
→ `Animated backgrounds`
→ `Interactive backgrounds`

Use descriptive anchor text.

Avoid excessive use of generic anchors such as “click here”.

Do not create huge unrelated link lists.

---

# 26. Related Content Engine

For individual pages, automatically show relevant related content.

Match using useful metadata such as:

- category
- subcategory
- tags
- framework
- visual style
- technology
- use case
- component type

Example:

A React hero section should preferably link to:

- other hero sections
- landing page templates
- React components
- related animation/effect components

Do not randomly link unrelated content.

---

# 27. Breadcrumbs

For hierarchical public pages, implement visible breadcrumbs where appropriate.

Example:

`Home → Templates → Hero Sections → Minimal Hero`

Use the same route hierarchy as the actual URL architecture.

Where structured data is added, it must match the visible breadcrumbs.

---

# 28. Structured Data

Implement only schema.org structured data that accurately applies to the page.

Start by evaluating:

- Organization
- WebSite
- BreadcrumbList

Use other types only where there is a clear, supported use case.

Rules:

- data must be accurate
- data must match visible content
- do not fabricate ratings/reviews
- do not fabricate prices
- do not mark content as something it is not
- validate generated JSON-LD

Structured data is supporting context, not a substitute for good page content.

---

# 29. Image SEO

For meaningful images:

- use descriptive asset names where the current asset pipeline allows it
- use accurate alt text
- avoid keyword stuffing in alt text
- provide dimensions when practical
- use modern image formats where appropriate
- lazy-load below-the-fold images where appropriate

Examples:

`neon-button.webp`
`glassmorphism-card.webp`
`aurora-background.webp`
`saas-dashboard-template.webp`

Do not rename assets in a way that breaks existing references.

---

# 30. Video/WebM SEO and Performance

UI HUB may contain heavy animated previews.

Do not make the SEO page dependent on loading large video files.

Preferred approach:

```text
HTML text + lightweight preview image
        ↓
user interaction
        ↓
load heavy WebM/video if needed
```

Keep the main textual page content available without waiting for WebM.

Do not remove the actual visual experience unless necessary for performance.

---

# 31. JavaScript / Rendering Audit

Inspect the app to ensure important public content is present in the rendered page for anonymous users.

Verify at minimum:

- H1 is present
- description is present
- category context is present
- important links are present
- page-specific metadata is present
- structured data is present where used

If the current architecture supports SSR/SSG/prerendering, use it for important public content where practical.

Do not rewrite the application architecture solely for SEO without evidence that the current rendering approach is causing an indexing problem.

---

# 32. Mobile SEO

Test important public pages on mobile.

Check:

- responsive layout
- readable text
- usable navigation
- touch targets
- component previews
- no horizontal overflow
- no critical content hidden on mobile
- reasonable page performance

---

# 33. Core Web Vitals / Performance

Audit:

- LCP
- INP
- CLS
- JavaScript bundle size
- images
- videos/WebM
- fonts
- third-party scripts
- API requests
- animation cost
- 3D rendering cost

Optimize without destroying UI HUB's core visual experience.

Prioritize the resources that affect initial page load.

---

# 34. 404 / Not Found

Implement a correct not-found experience.

Requirements:

- proper 404 HTTP response where the framework supports it
- useful navigation back to UI HUB
- no fake 200 response for missing pages
- do not accidentally add missing pages to sitemap

---

# 35. Redirects

When a public URL changes permanently, create a proper permanent redirect.

Example:

Old:
`/components/neon-btn`

New:
`/components/buttons/neon-button`

Redirect:

`301 old → new`

Avoid redirect chains.

Do not redirect every removed page to the homepage.

If a deleted URL has no replacement, return the appropriate not-found/gone behavior.

---

# 36. Query Parameters and Filters

Audit URLs created by:

- search
- filtering
- sorting
- pagination
- preview parameters
- category parameters
- UI state

Determine which URLs are valuable public landing pages and which are utility states.

Do not allow large numbers of low-value parameter URLs to become indexable by accident.

---

# 37. Search Page Policy

Audit internal search pages such as:

`/search?q=button`

These should not automatically become thousands of indexable SEO pages.

Keep internal search useful for users.

Only index search-result pages when there is a deliberate content strategy and the resulting page provides stable, useful, unique content.

---

# 38. Pagination / Infinite Scroll

If UI HUB uses infinite scrolling or client-side filtering, ensure important individual pages are still discoverable through crawlable links.

Do not rely exclusively on one interactive state to reveal all public content.

Important content must have stable URLs.

---

# 39. Technology-Specific SEO

When a component genuinely uses a technology, allow the page to be discovered for that technology.

Examples:

- React UI components
- Tailwind CSS components
- TypeScript components
- CSS animations
- Framer Motion components
- Three.js backgrounds
- WebGL backgrounds

Do NOT claim a technology unless the actual code/content uses it.

Use technology pages/categories only when the site contains enough genuine content to make them valuable.

---

# 40. License and Free/Download Language

Terms such as:

- free
- free code
- download
- open source
- MIT
- copy code

must reflect the actual product/license behavior.

Do not use “free” as a keyword if the item is paid or restricted.

Do not claim a downloadable asset exists if it does not.

---

# 41. Individual Template SEO

Each substantial template should have a stable public page.

Potential data:

- template name
- type
- framework
- styling
- technology
- features
- pages included
- responsive status
- license
- live preview
- source/download availability

Generate unique metadata from this data.

Example:

`SaaS Dashboard Template | React & Tailwind CSS | UI HUB`

Only use those technologies if the actual template uses them.

---

# 42. Individual Background SEO

For an individual background page:

Include factual information such as:

- background name
- category
- interaction type
- framework
- library
- performance notes when relevant
- usage
- customization
- browser/client requirements when relevant

Example conceptual title:

`Aurora Interactive Background | React & WebGL | UI HUB`

Only if the implementation actually uses those technologies.

---

# 43. Content Quality Rules

Every public SEO page should exist because a user could reasonably benefit from it.

Good:

- unique component page
- useful category page
- real template page
- real background page
- practical guide

Bad:

- 100 pages with the same paragraph and different keywords
- pages created only to capture spelling variants
- pages with no actual content
- pages that redirect immediately elsewhere
- copied descriptions across hundreds of items

Prioritize original, useful UI HUB content.

---

# 44. Avoid Keyword Stuffing

The agent must use keyword clusters as a planning tool, not as a repetition checklist.

Example of bad content:

`Modern hero section design free hero section template simple hero section modern website hero section design.`

Do not generate content like this.

Instead, write natural prose that covers the subject and its useful variations.

---

# 45. SEO Keyword Mapping Data Structure

Create an internal SEO mapping system if appropriate.

Conceptual example:

```ts
{
  pageType: "category",
  route: "/templates/hero-sections",
  primaryTopic: "hero section design",
  secondaryTopics: [
    "hero section template",
    "modern hero section",
    "hero section examples",
    "landing page hero"
  ]
}
```

Individual item example:

```ts
{
  pageType: "component",
  route: "/components/buttons/magnetic-button",
  primaryTopic: "magnetic button",
  technologies: ["React", "Tailwind CSS"],
  category: "buttons"
}
```

The actual schema must match the existing project.

---

# 46. SEO Route Inventory

The AI agent must scan the real application and produce a route inventory.

For each route, classify:

- public/private
- indexable/noindex
- page type
- primary topic
- canonical URL
- sitemap inclusion
- title
- description

Example report:

| Route | Type | Index? | Primary Topic |
|---|---|---|---|
| `/` | Homepage | Yes | UI HUB UI resources |
| `/templates` | Category | Yes | Website templates |
| `/templates/hero-sections` | Category | Yes | Hero section designs |
| `/templates/hero-sections/minimal-hero` | Item | Yes | Minimal hero section |
| `/search?q=button` | Search | Usually No | Internal search |
| `/dashboard` | Private | No | Private dashboard |

This is an example only. Build the real table from the current application.

---

# 47. Automatic SEO Validation

Create development/test utilities that can detect SEO regressions.

For every important public page, validate:

- title exists
- title is not duplicated unexpectedly
- meta description exists
- canonical exists
- canonical uses the correct production domain
- exactly one primary H1 where practical
- robots directive is correct
- page is reachable anonymously
- public page appears in sitemap
- private page does not appear in sitemap
- internal links resolve
- no broken canonical URLs
- no invalid redirect chains
- structured data parses where used

Do not fail builds on purely subjective metrics unless there is a defined rule.

---

# 48. Production Domain Safety

Do not hard-code `vercel.app` into permanent SEO URLs if the project has a custom production domain configured.

The agent must inspect the deployment configuration and identify the correct canonical production origin.

The sitemap, canonical URLs, Open Graph URLs, and structured data URLs must use one consistent preferred production domain.

Avoid generating SEO URLs that point to preview deployments.

---

# 49. Google Search Console Preparation

Make the site ready for Google Search Console.

After deployment, the human owner should:

1. Verify the production domain.
2. Submit `/sitemap.xml`.
3. Inspect important URLs.
4. Monitor Page Indexing.
5. Monitor Search Performance.
6. Fix discovered crawl/indexing problems.

Do not claim that Search Console is connected unless the connection was actually completed.

---

# 50. Bing Webmaster Tools Preparation

Make the site ready for Bing Webmaster Tools.

After deployment, the human owner should:

1. Verify the domain.
2. Submit the sitemap.
3. Run site/SEO diagnostics.
4. Monitor indexed pages.
5. Monitor search performance.

Where appropriate, implement IndexNow for new/updated/deleted public URLs.

---

# 51. IndexNow

Investigate and implement IndexNow if appropriate for the production architecture.

Trigger a URL update when:

- a new public component is published
- a new public template is published
- a public background is published
- an important public page changes
- a public page is deleted

Do not repeatedly submit unchanged URLs.

Make the implementation safe and non-blocking for content publishing.

---

# 52. SEO Content Refresh

When a component/template/background is meaningfully updated, update its:

- `updatedAt`
- sitemap `lastmod` where accurate
- visible technical/content information if changed
- metadata where the topic changed

Do not change dates simply to make a page appear fresh.

---

# 53. Search Intent Matrix

Build and maintain a page strategy similar to this:

### HERO SECTION INTENT

Searches:

- hero section design
- hero section design template free
- modern hero section design
- simple hero section design
- hero section website examples

Landing page:

`/templates/hero-sections`

### FOOTER INTENT

Searches:

- footer design
- footer design free code
- footer design for website
- footer design ideas

Landing page:

`/components/footer` or the actual UI HUB route

### INTERACTIVE BACKGROUND INTENT

Searches:

- interactive background for website
- interactive background for website code
- interactive website background

Landing page:

`/backgrounds/interactive`

### ANIMATED BACKGROUND INTENT

Searches:

- animated background for website
- animated background for website free
- web background animation effects

Landing page:

`/backgrounds/animated`

### 3D BACKGROUND INTENT

Searches:

- 3d background for website
- animated 3D backgrounds for your website
- 3D website background
- 3D web effects

Landing page:

`/backgrounds/3d`

### TEMPLATE INTENT

Searches:

- website templates
- UI templates
- modern website templates
- React templates
- Tailwind templates
- landing page templates
- portfolio templates
- SaaS templates

Landing page:

`/templates`

### INDIVIDUAL COMPONENT INTENT

Searches:

- exact UI HUB component name
- `[component name] React`
- `[component name] Tailwind CSS`
- `[component name] code`
- `[component name] example`
- `[component name] component`

Landing page:

individual component page

---

# 54. Do Not Chase “Anything” Search

The website cannot legitimately rank for every search on Google.

The goal is to build strong relevance for the broadest set of queries that match UI HUB's actual content.

For example, UI HUB should become increasingly relevant to searches about:

- UI components
- website sections
- hero sections
- footer designs
- interactive backgrounds
- animated backgrounds
- 3D backgrounds
- website templates
- React UI
- Tailwind UI
- animation/effect components
- actual UI HUB component names

Do not create irrelevant pages solely to broaden the keyword footprint.

---

# 55. SEO Architecture Summary

The target structure is:

```text
UI HUB
│
├── Homepage
│
├── Templates
│   ├── Hero Sections
│   │   ├── Hero A
│   │   ├── Hero B
│   │   └── Hero C
│   ├── Landing Pages
│   ├── SaaS
│   └── Portfolio
│
├── Components
│   ├── Buttons
│   │   ├── Magnetic Button
│   │   ├── Neon Button
│   │   └── Other real components
│   ├── Cards
│   ├── Navigation
│   ├── Forms
│   └── Other real categories
│
├── Backgrounds
│   ├── Interactive
│   ├── Animated
│   ├── 3D
│   └── Other real categories
│
├── Docs / Guides
│
└── Blog / Resources
```

Only create categories that reflect actual UI HUB content.

---

# 56. Implementation Phases

## Phase 1 — Audit

Inspect the complete codebase and output:

- framework
- router
- data sources
- public routes
- current SEO
- current sitemap
- current robots.txt
- current structured data
- indexability issues
- duplicate URL risks
- rendering issues
- performance issues affecting SEO

Do not modify anything until the audit is understood.

## Phase 2 — Technical SEO

Implement/fix:

- canonical production domain
- robots.txt
- sitemap.xml
- indexing directives
- redirects
- 404
- canonical URLs
- crawlable links

## Phase 3 — Metadata

Implement:

- dynamic titles
- dynamic descriptions
- H1 system
- Open Graph
- social metadata

## Phase 4 — Information Architecture

Implement/fix:

- category routes
- subcategory routes
- individual item routes
- breadcrumbs
- internal linking
- related content

Do not break existing URLs.

## Phase 5 — Content SEO

Implement:

- category descriptions
- component descriptions
- template descriptions
- background descriptions
- useful technical information
- natural keyword mapping

## Phase 6 — Structured Data

Implement and validate applicable JSON-LD.

## Phase 7 — Performance

Audit and optimize:

- WebM
- images
- JavaScript
- fonts
- animation loading
- third-party scripts

## Phase 8 — Automated SEO System

Ensure new content automatically receives:

- SEO metadata
- canonical
- sitemap entry
- indexability configuration
- internal links where appropriate

## Phase 9 — Testing

Test:

- homepage
- templates category
- hero category
- footer category
- background categories
- representative individual components
- representative templates
- representative backgrounds
- search pages
- private pages
- deleted pages
- renamed pages

---

# 57. Final Verification Checklist

Before declaring completion, confirm all of the following:

### Technical

- [ ] production HTTPS works
- [ ] preferred production domain is consistent
- [ ] robots.txt works
- [ ] sitemap.xml works
- [ ] sitemap contains only canonical public indexable URLs
- [ ] private pages are excluded/noindexed appropriately
- [ ] canonical tags are correct
- [ ] redirects are correct
- [ ] 404 works correctly
- [ ] no accidental crawl blocks exist

### On-page

- [ ] important pages have unique titles
- [ ] important pages have unique descriptions
- [ ] important pages have correct H1
- [ ] important page content exists as text
- [ ] internal links exist
- [ ] breadcrumb structure is correct
- [ ] image alt text is sensible
- [ ] metadata is dynamic

### Content

- [ ] hero SEO page exists if hero content exists
- [ ] footer SEO page exists if footer content exists
- [ ] interactive background page exists if interactive background content exists
- [ ] animated background page exists if animated background content exists
- [ ] 3D background page exists if 3D background content exists
- [ ] templates page is optimized
- [ ] real component names are used naturally
- [ ] real template names are used naturally
- [ ] no irrelevant keyword stuffing exists

### Dynamic Content

- [ ] new component automatically gets SEO metadata
- [ ] new template automatically gets SEO metadata
- [ ] new background automatically gets SEO metadata
- [ ] new public pages can appear in sitemap automatically
- [ ] updated pages update reliable freshness fields

### Performance

- [ ] WebM does not unnecessarily block initial rendering
- [ ] images are optimized
- [ ] large JS is controlled
- [ ] important content renders without unnecessary interaction
- [ ] mobile experience works

### Validation

- [ ] representative URLs manually inspected
- [ ] generated HTML checked
- [ ] sitemap checked
- [ ] robots checked
- [ ] canonical URLs checked
- [ ] structured data checked
- [ ] broken links checked
- [ ] redirect behavior checked
- [ ] no unexpected noindex checked

---

# 58. Required Agent Output

After implementation, return a concise but factual report with:

1. Current SEO architecture found
2. Problems discovered
3. Files changed
4. Routes changed
5. New SEO system/components created
6. Metadata implementation
7. Sitemap implementation
8. robots.txt implementation
9. Canonical implementation
10. Structured data implementation
11. Internal-linking implementation
12. Keyword/page map created
13. Performance changes
14. Indexing rules
15. Redirects created
16. Tests executed
17. URLs manually verified
18. Remaining issues

Do not report an item as “completed” unless it was actually implemented and tested.

---

# 59. Important Search Engine Reality

SEO is an eligibility and relevance system, not a ranking guarantee.

Search engines decide which indexed pages to show for a query. The implementation should therefore focus on:

- crawlability
- indexability
- clear URLs
- useful content
- accurate metadata
- internal linking
- good page experience
- strong content relevance
- consistent site architecture
- trustworthy, original content

Do not promise that UI HUB will appear for every search.

The practical target is:

> Make the most relevant UI HUB page the clearest, most useful, and technically accessible result for searches that genuinely match that page.

---

# 60. Official Guidance to Keep in Mind

The implementation should follow current official search-engine guidance, not outdated “SEO hacks”.

Google Search Central:

- SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Technical SEO / developer guidance: https://developers.google.com/search/docs/fundamentals/get-started-developers
- Sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- AI features guidance: https://developers.google.com/search/docs/appearance/ai-features

Bing Webmaster:

- Webmaster Guidelines: https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a
- URL Submission / IndexNow: https://www.bing.com/webmasters/help/URL-Submission-62f2860b

Key principle:

SEO fundamentals remain the foundation for visibility across traditional search and current AI-powered search experiences. There is no legitimate single file, meta tag, or keyword trick that guarantees ranking.

---

# FINAL AGENT INSTRUCTION

First inspect the complete UI HUB codebase.

Then implement this specification using the existing architecture.

Do not rewrite the application unnecessarily.

Do not ask for permission for each small implementation step.

Make reasonable decisions based on the existing codebase.

Prioritize real, useful, indexable UI HUB pages over keyword stuffing.

The end result should be a scalable SEO system where:

`New UI HUB content`

automatically becomes:

`SEO-friendly URL + unique metadata + canonical + crawlable page + internal links + sitemap entry + correct indexing state`

while preserving the existing UI HUB design and functionality.










# SEO.md — UI Hub (Master SEO Brief for AI Coding Agents)

> **Who this file is for:** any AI coding agent (Claude, Cursor, Lovable, Antigravity) working on UI Hub.
> **Read this fully before changing any code.** Follow the rules, do the tasks in order, and report back using the checklist in Section 16.
> **Honest note:** nobody can guarantee a #1 Google ranking. This file does everything that is within our control: make the site crawlable, make every page match a real search query, and make it fast. Rankings then depend on time, backlinks and competition.

---

## 1. What UI Hub is (so you understand the site)

- **Name:** UI Hub
- **Live URL:** https://ui-hub-design.vercel.app
- **Tagline:** The Home of Vibe Coding
- **What it does:** A component-library platform where developers browse, preview and copy production-ready animated UI components (React + Tailwind CSS + Framer Motion). Every component also ships with AI-ready prompts for Lovable, Claude, Cursor and Google Antigravity, so a user can paste a prompt and get the component generated in their own project.
- **Audience:** frontend developers, students, indie hackers, freelancers, and "vibe coders" who build with AI tools.
- **Main content types:**
  1. **Components** (hero sections, footers, interactive backgrounds, 3D backgrounds, image interactions, buttons, cards, navbars, etc.)
  2. **Templates** (full website templates, route `/templates` and `/templates/:slug`)
  3. **AI prompts** (vibe prompts per component)
- **Stack (detect and confirm before editing):** React + TypeScript frontend (`frontend/src`), Node/Express backend, Firebase (auth/storage/analytics), Razorpay payments, Brevo email, hosted on **Vercel**.
- **Component registry (source of truth for pages):** `frontend/src/data/componentData.tsx`
  - Interface `ComponentItem` has at least: `id, title, category, preview, code, vibePrompt`.
  - Each component has a **slug**. Category is a slug union that includes (at least) `interactive-background` and `image-interaction`. **Read the file to get the real, full list of categories — never guess.**
  - Community components appear under category `custom` via REST API (MongoDB).

## 2. The core problem to solve first: it is a Single Page App

Today, when Googlebot requests `https://ui-hub-design.vercel.app/templates`, the HTML it gets back is a shell with **one global `<title>`, one description and no real content** (all routes share the same head). JavaScript rendering is slow and unreliable for indexing. That is the #1 reason pages would not show in Google.

**Goal:** every public URL must return HTML that already contains its own `<title>`, meta description, canonical URL, `<h1>`, visible text and JSON-LD — *before* JavaScript runs.

### Required approach (pick the first that is feasible, and tell the owner which you chose)

| Option | When | How |
|---|---|---|
| **A. Pre-render at build time** (recommended, least disruptive) | Vite or CRA SPA | Use `vite-plugin-prerender`/`vite-prerender-plugin` (Vite) or `react-snap` (CRA) to output static HTML for every route in the route list generated from `componentData.tsx`. |
| **B. Migrate to Next.js / Remix** | Only if owner explicitly approves | SSR/SSG gives the best SEO but is a big change. **Do not do this without approval.** |
| **C. Vercel prerender fallback** | If A fails | Use a serverless function that serves bot-friendly HTML with the right meta for crawler user-agents. Last resort. |

**Constraints:** do not break the existing app, auth, payments, or the in-progress Neo-Brutalist redesign. Do not touch backend payment/security code for SEO work.

## 3. Search intent we want to win (keyword map)

These are the actual Google searches we want UI Hub to appear for. Each cluster maps to **one primary page**. One page = one main intent (avoid two pages fighting for the same keyword).

### Cluster 1 — Hero sections
- hero section design
- hero section design template free
- modern hero section design
- simple hero section design
- hero section website examples
- animated hero section react
- hero section tailwind css

**Primary page:** `/components/hero-sections` (category landing page)

### Cluster 2 — Footers
- footer design
- footer design free code
- footer design for website
- footer design ideas
- modern footer design react
- footer tailwind css

**Primary page:** `/components/footers`

### Cluster 3 — Interactive backgrounds
- interactive background for website
- interactive background for website code
- interactive background for website download
- animated background for website free
- web background animation effects
- mouse interactive background react
- particle background for website

**Primary page:** `/components/interactive-backgrounds` (maps to existing slug `interactive-background`)

### Cluster 4 — 3D / animated backgrounds
- 3d background for website
- animated 3D backgrounds for your website
- 3D effect website
- three.js background website
- 3D animated background css

**Primary page:** `/components/3d-backgrounds`

### Cluster 5 — Templates
- website templates free
- react website templates
- tailwind website templates
- landing page template free
- portfolio website template react

**Primary page:** `/templates`

### Cluster 6 — Brand + AI / vibe coding
- UI Hub, UI Hub components
- vibe coding UI components
- AI prompts for UI components
- Lovable prompts UI components, Cursor prompts UI components, Claude UI prompts
- React Tailwind Framer Motion components
- copy paste UI components

**Primary page:** `/` (home)

> **Agent task:** after reading `componentData.tsx`, extend this map with the real component names (for example the actual title of each hero, footer and background). Add each component's own name as the long-tail keyword for its own page, e.g. "Aurora Background React", "Glass Footer Tailwind".

## 4. Target URL structure

Clean, readable, keyword-based URLs. Lowercase, hyphens, no IDs, no query-string pages.

```
/                                   Home
/components                         All components hub
/components/:categorySlug           Category landing (hero-sections, footers, interactive-backgrounds, 3d-backgrounds, image-interactions, ...)
/components/:categorySlug/:slug     Single component page (one URL per component)
/templates                          Templates listing
/templates/:slug                    Single template page
/prompts                            AI prompts hub (optional, if it exists)
/blog                               Blog index (new, see Section 12)
/blog/:slug                         Blog posts
/about, /contact, /pricing          Support pages
```

**Rules**
- If the existing routes differ, **do not break them**. Add the new clean URLs and 301-redirect the old ones (use `vercel.json` redirects).
- Every component and every template must be reachable on its **own indexable URL**. Modal-only or hash-only (`#`) views are not indexable.
- Slugs must equal the registry slug in `componentData.tsx` (anti-drift rule already used by the component forge skill: lazy-key === slug === export name).

## 5. Per-page meta templates

Build one reusable `<SEO />` component (use `react-helmet-async`). Every route must pass its own props. **Never leave the default global title on an inner page.**

### Title formulas (50–60 characters, primary keyword first, brand last)

| Page type | Formula | Example |
|---|---|---|
| Home | `UI Hub – Free React UI Components, Hero Sections & Animated Backgrounds` | (as is) |
| Category | `{Primary Keyword} – Free Code & Examples \| UI Hub` | `Modern Hero Section Design – Free Code & Examples \| UI Hub` |
| Component | `{Component Title} – {Category Keyword} (React + Tailwind) \| UI Hub` | `Aurora Background – Animated Background for Website \| UI Hub` |
| Template | `{Template Title} – Free {Type} Website Template \| UI Hub` | |
| Blog | `{Post title} \| UI Hub` | |

### Description formulas (140–160 characters, include keyword + benefit + call to action)

- Category: `Browse {N}+ free {category keyword} built with React, Tailwind CSS and Framer Motion. Live preview, copy code or use AI prompts for Lovable, Claude and Cursor.`
- Component: `{Component Title}: a {one-line description of the effect}. Free React + Tailwind code, live preview and AI prompt for Lovable, Cursor and Claude.`

### Required `<head>` for every page

```tsx
// src/components/SEO.tsx
import { Helmet } from "react-helmet-async";

type SEOProps = {
  title: string;
  description: string;
  path: string;                 // e.g. "/components/hero-sections"
  image?: string;               // absolute URL, 1200x630
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: object | object[];
};

const SITE = "https://ui-hub-design.vercel.app";
const DEFAULT_IMG = `${SITE}/ui-hub-banner.png`;

export default function SEO({
  title, description, path, image = DEFAULT_IMG,
  type = "website", noindex = false, jsonLd,
}: SEOProps) {
  const url = `${SITE}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />

      <meta property="og:site_name" content="UI Hub" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
```

- Wrap the app in `<HelmetProvider>`.
- Keep the global `index.html` defaults (site name, verification tag `google-site-verification`, favicon, theme-color). Do **not** remove the existing Google verification meta tag.
- `meta keywords` is ignored by Google. Keep it in `index.html` only as a harmless fallback; do not spend effort on it.

## 6. On-page content rules (this is what actually ranks)

For **every** indexable page:

1. **Exactly one `<h1>`** containing the primary keyword (natural wording, not stuffing).
2. **`<h2>`/`<h3>`** for sub-sections using secondary keywords (e.g. "Hero section examples", "How to use this hero section", "Props", "Install").
3. **At least 150–300 words of real visible text** on category pages and component pages (intro paragraph, what it is, when to use it, how to install, customization tips). A page that is only a preview + code block is "thin content".
4. **First 100 words** must mention the primary keyword once.
5. **Component page structure:**
   - H1: component title + type (e.g. "Aurora Background – Animated Website Background")
   - Live preview (lazy loaded)
   - Short description (2–3 sentences)
   - Install / usage steps and the code block
   - Props table
   - AI prompt tabs (Lovable, Claude, Cursor, Antigravity)
   - FAQ block (2–4 questions, see JSON-LD below)
   - "Related components" (internal links, 4–8 items)
6. **Alt text** on every image/preview: describe it with the keyword, e.g. `alt="Modern hero section design with gradient background and animated headline"`. Never `alt=""` on content images, never "image1".
7. **No duplicate content:** each component/category has unique intro text. Do not copy-paste the same paragraph with a name swap.
8. **Internal linking:** home → categories → components → related components; breadcrumbs on all inner pages. Use real `<a href>` (React Router `<Link>` renders this correctly). Never use `onClick`-only navigation for content links.

## 7. Structured data (JSON-LD)

Add these schemas. Validate in Google's Rich Results Test.

**Home page — Organization + WebSite**
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "UI Hub",
      "url": "https://ui-hub-design.vercel.app",
      "logo": "https://ui-hub-design.vercel.app/ui-hub-banner.png"
    },
    {
      "@type": "WebSite",
      "name": "UI Hub",
      "url": "https://ui-hub-design.vercel.app",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://ui-hub-design.vercel.app/components?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
```
(Only include `SearchAction` if the site really supports `?q=` search; otherwise omit it.)

**Every inner page — BreadcrumbList**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ui-hub-design.vercel.app/" },
    { "@type": "ListItem", "position": 2, "name": "Hero Sections", "item": "https://ui-hub-design.vercel.app/components/hero-sections" },
    { "@type": "ListItem", "position": 3, "name": "Aurora Hero" }
  ]
}
```

**Category pages — CollectionPage + ItemList** (list the components in that category with their URLs).

**Component pages — SoftwareSourceCode (or TechArticle) + FAQPage**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "{Component Title}",
  "description": "{meta description}",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "React",
  "codeRepository": "https://ui-hub-design.vercel.app/components/{category}/{slug}",
  "url": "https://ui-hub-design.vercel.app/components/{category}/{slug}"
}
```
Add an `FAQPage` only with questions that are **visibly on the page**. Do not add hidden or fake FAQs (against Google policy).

## 8. Sitemap and robots

### `public/robots.txt`
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /login
Disallow: /checkout
Disallow: /api/

Sitemap: https://ui-hub-design.vercel.app/sitemap.xml
```
(Adjust disallowed paths to the real private routes. Never block `/assets`, JS or CSS files — Google needs them.)

### `sitemap.xml` — generate it automatically
Create `scripts/generate-sitemap.ts` (or `.mjs`) that runs on every build (`"prebuild"` script):
- Read the component list and categories from `frontend/src/data/componentData.tsx` (import or parse it) and templates from their data source.
- Output one `<url>` per public page: home, category pages, **every component page**, every template, blog posts, static pages.
- Include `<loc>` (absolute URL) and `<lastmod>` (ISO date). Skip `noindex` pages.
- Write to `public/sitemap.xml`. If there are more than 50,000 URLs, split into a sitemap index (not expected).
- A new component added through the forge / `ui-hub-component-integration` flow must appear in the sitemap automatically on next build. **Add a line to that skill's checklist: "run sitemap generation and confirm the new slug is listed."**

## 9. Performance (Core Web Vitals = ranking factor)

UI Hub is animation heavy, so this section matters a lot.

- **LCP < 2.5s, CLS < 0.1, INP < 200ms** on mobile for home, category, template and component pages.
- **Previews:** never autoplay many videos/WebMs at once. Use `poster` images (WebP/AVIF), `preload="none"`, and load/play a preview only when it enters the viewport (`IntersectionObserver`) or on hover. This also fixes the slow WebM loading in the Templates section. (A separate prompt covers the templates fix; follow the same principle here.)
- **Lazy-load** every below-the-fold preview and heavy component (`React.lazy` is already used in the `UI_COMPONENTS` map; keep it).
- **Images:** serve WebP/AVIF, set explicit `width`/`height` to prevent layout shift, `loading="lazy"` except the LCP image (`fetchpriority="high"`).
- **Fonts:** Inter + Source Serif 4 — self-host or use `display=swap` and `preconnect` to `fonts.gstatic.com`; subset to Latin.
- **Code splitting:** route-level splitting; keep three.js / heavy libs out of the main bundle (load only on pages that use them).
- **Caching on Vercel** (`vercel.json`): long immutable cache for hashed assets, short cache for HTML.
- Respect `prefers-reduced-motion` for animated backgrounds.

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ],
  "redirects": [
    { "source": "/index.html", "destination": "/", "permanent": true }
  ]
}
```

## 10. Technical SEO checklist

- **HTTPS only** (Vercel already does this). One canonical host; no duplicate `www`/non-`www` or trailing-slash duplicates. Pick no trailing slash and redirect the other.
- **Canonical tag** on every page (the `<SEO />` component does this).
- **Real 404 page** for unknown URLs that sets `noindex`, and the server should return status 404 (configure in the prerender/Vercel setup, not a soft 404 that returns 200).
- **Mobile friendly:** responsive layout, tap targets ≥ 44px, no horizontal scroll.
- **Pagination / filters:** filtered or sorted list URLs (`?sort=`, `?filter=`) get `noindex` or a canonical to the clean category URL.
- **Login, dashboard, checkout, admin, invoices:** `noindex`.
- **Hreflang:** not needed (English only).
- **Favicon + manifest:** present, 48×48 minimum favicon for Google results.
- **Open Graph image:** 1200×630 per category and per component if possible (auto-generated screenshot of the preview is ideal).

## 11. Making each component discoverable (do this for every item in `componentData.tsx`)

For each component the agent must make sure there is a **component page** with:

1. Unique title and description using the formulas in Section 5.
2. Primary keyword = the component's type (hero section / footer / interactive background / 3D background / image interaction...) + its name.
3. Secondary keywords: "React", "Tailwind CSS", "Framer Motion", "free code", "copy paste", "animated".
4. A 100–200 word unique description written for humans.
5. A static preview image (WebP) used as `og:image` and as `poster`.
6. Links to 4–8 related components in the same category.

**Suggested automation:** add optional fields to `ComponentItem`:

```ts
seo?: {
  title?: string;
  description?: string;
  keywords?: string[];   // internal use, for the sitemap/blog/related logic
  intro?: string;        // unique 100–200 word text shown on the page
  faq?: { q: string; a: string }[];
};
```
Fallback to the formulas if `seo` is missing, so old components still get good defaults. **Do not change the required fields** of `ComponentItem` (id, title, category, preview, code, vibePrompt) and keep the anti-drift rule intact.

## 12. Content plan (blog + landing content that brings search traffic)

Create `/blog` and publish these first. Each post: 800–1500 words, one primary keyword, live examples that link to UI Hub component pages, a clear H1/H2 structure.

1. "15 Modern Hero Section Design Examples (Free React + Tailwind Code)" → hero section design / hero section website examples
2. "Simple Hero Section Design: Free Templates You Can Copy" → simple hero section design / hero section template free
3. "Footer Design Ideas for Websites (With Free Code)" → footer design ideas / footer design free code
4. "10 Interactive Backgrounds for Websites You Can Copy" → interactive background for website code
5. "Animated 3D Backgrounds for Your Website: Free Options" → animated 3D backgrounds for your website
6. "How to Add an Animated Background to a React Website" → animated background for website free
7. "What Is Vibe Coding? How to Build UI With Lovable, Cursor and Claude" → vibe coding (brand + AI audience)
8. "Best Free Website Templates for React Developers" → website templates free

Each post must internally link to the relevant category page and to at least 3 component pages, and each of those pages should link back.

## 13. Authority and off-site SEO (the owner does this; the agent can prepare the text)

Rankings need backlinks and brand mentions. Prepare copy and assets for:

- **Google Search Console:** verify domain (verification tag already present), submit `sitemap.xml`, use URL Inspection → "Request indexing" for the home page, category pages and top components.
- **Bing Webmaster Tools:** import from Search Console (also feeds DuckDuckGo/Yahoo).
- **Launches:** Product Hunt, Hacker News (Show HN), Reddit (r/webdev, r/reactjs, r/Frontend, r/SideProject), Dev.to, Hashnode, Medium, LinkedIn, X/Twitter, Indie Hackers.
- **Directories:** "awesome-react-components" style GitHub lists, UI library directories, and Tailwind resource lists.
- **GitHub:** a public repo or README that links to the live site.
- **YouTube / Shorts / Instagram Reels:** short demo clips of animated components with the site URL in the description.
- **Own domain (recommended):** `*.vercel.app` subdomains rank less well and look less trustworthy than a custom domain such as `uihub.dev`. Buying a domain and 301-redirecting the Vercel URL to it is one of the biggest long-term SEO wins.

## 14. Tracking and measurement

- Google Search Console (queries, impressions, CTR, indexing status) — check weekly.
- Google Analytics 4 / Firebase Analytics events: `component_view`, `code_copy`, `prompt_copy`, `template_preview`.
- Lighthouse and PageSpeed Insights on 5 key URLs after each release.
- Track target keywords from Section 3 in a simple sheet: keyword, target URL, position, date.

## 15. Do / Don't for the AI agent

**Do**
- Read `componentData.tsx` and the router file first; list the real categories, slugs and routes in your report.
- Make small, reviewable changes; keep the app working at every step.
- Write unique human-readable text; keep it accurate to what the component really does.
- Test each change with `view-source:` (not DevTools) to confirm the meta tags and content exist in the raw HTML.

**Don't**
- Don't keyword-stuff, hide text, add fake reviews/FAQs, or buy/spam links.
- Don't set the same title/description on multiple pages.
- Don't block CSS/JS in robots.txt.
- Don't make inner pages depend on a click or modal to load content.
- Don't touch payments, auth, Firebase Admin, Razorpay or Helmet.js/rate-limit security code for SEO tasks.
- Don't use `localStorage`-only state for anything that should be a URL.

## 16. Execution order and acceptance checklist

Do the work in this order and mark each item done in your final report.

**Phase 1 — Foundation (highest impact)**
- [ ] Detect build tool and router; list all current routes and the full category/slug list.
- [ ] Add `react-helmet-async` and the reusable `<SEO />` component.
- [ ] Implement pre-rendering (Section 2, option A) for all public routes.
- [ ] Create category landing pages and a unique URL for every component and template (Section 4), with redirects from old URLs.
- [ ] Add `robots.txt` and the auto-generated `sitemap.xml` (Section 8).
- [ ] Add canonical tags and `noindex` for private/duplicate pages.

**Phase 2 — On-page**
- [ ] Unique title + description on every route (Section 5).
- [ ] One H1 per page, proper H2/H3 structure, unique intro text, breadcrumbs, related links (Section 6).
- [ ] Alt text on all content images.
- [ ] JSON-LD for Organization, WebSite, BreadcrumbList, CollectionPage/ItemList and SoftwareSourceCode (Section 7); validate with Rich Results Test.

**Phase 3 — Performance**
- [ ] Posters + lazy/hover-play previews, no mass autoplay; WebP/AVIF images with dimensions (Section 9).
- [ ] Code splitting, font loading, cache headers in `vercel.json`.
- [ ] Lighthouse mobile: Performance ≥ 85, SEO = 100, Accessibility ≥ 90 on home, one category, one component, `/templates`.

**Phase 4 — Content and launch**
- [ ] Blog with the first posts from Section 12.
- [ ] Add "SEO fields + sitemap check" to the component-integration checklist (Section 8, Section 11).
- [ ] Owner submits sitemap in Search Console and Bing, requests indexing, and starts the launch plan (Section 13).

### Definition of done
1. `view-source:` of `/templates`, one category page and one component page each shows a unique `<title>`, description, canonical, H1 and visible body text.
2. `sitemap.xml` lists every public page, including newly added components.
3. Google Search Console shows pages as "Indexed" with no major coverage errors.
4. Rich Results Test passes for breadcrumbs/structured data.
5. Lighthouse targets in Phase 3 are met.

### Final report format (agent must output this)
```
Build tool / router detected:
Routes added or changed:
Categories + slugs found (from componentData.tsx):
Pre-render method used:
Files created/edited:
Pages verified via view-source:
Lighthouse scores (home / category / component / templates):
Open issues or things needing the owner's decision (e.g. custom domain, Next.js migration):
```

---
*Primary goal: when someone searches Google for "hero section design", "footer design free code", "interactive background for website", "animated 3D backgrounds for your website" or "free website templates", a matching UI Hub page exists, loads fast, answers that exact search, and is easy for Google to crawl and understand.*