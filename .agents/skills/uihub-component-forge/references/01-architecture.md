# Architecture Reference: UI-HUB Component Render Pipeline

> Phase 1 research output for UI-HUB Component Forge. Drafted so Phase 3+ can
> hook the forge's generated component-specs into the existing system without
> guessing where things live. All paths relative to repo root; `frontend/` is the
> Vite React 19 + TS app.

---

## 1. The one-file contract

A UI-HUB component is a **single default-exported React component file** under
`frontend/src/components/ui/`. It is self-contained (its own canvas, state, styles —
often inline styles or Tailwind) and requires at most `react`, `three`, and
`motion/`(framer-motion) as external deps. See
`data/component-index.json` (dependencies field) — verified for all 29 forge
components.

## 2. The render/display pipeline (source → user)

```
frontend/src/components/ui/<File>.tsx
        │  (1) code file (what the user copies + what the preview renders)
        ▼
frontend/src/data/componentData.tsx
        │  (2) registry: ComponentItem[] = componentList (title, description,
        │      category, preview() factory, id/slug, facilities)
        │      UI_COMPONENTS lazy map + renderComponent() resolver
        ▼
frontend/src/pages/LibraryPage/LibraryPage.tsx
        │  (3) category page: filters componentList by category, mounts Detail
        ▼
frontend/src/pages/LibraryPage/sections/ComponentDetail/index.tsx
        │  (4) single-component page:
        │        item.preview({ showDemoButton: true })      <- live preview
        │        getComponentCode / downloadComponentZip     <- copy/download
        ▼
UI HUB detail screen (+ /demo/:id fullscreen via DemoPage.tsx)
```

### Step details with citations

1. **Registry data — `frontend/src/data/componentData.tsx`**
   - `ComponentItem` interface ends with `preview: (props?: any) => React.ReactNode`
     (`:2634`); the type block starts `:2630` (category union incl.
     `'interactive-background' | 'image-interaction'`).
   - `componentList` is the big array starting `:5008` — **approximately 129
     items**, the source of truth for what appears in the UI.
   - `preview` is either an inline scoped-preview function/component (e.g.
     `<CardCascade preview />` at `:1535`; RippleSignatureLedger `:4928`;
     DriftwoodGallery `:4980`) or a `renderComponent("slug", "Title", { props })`
     call (e.g. `renderComponent("gravitational-vortex", "Gravitational Vortex")`
     `:5990`, `renderComponent("spider-web", "Spider Web")` `:6190`).
   - **Lazy resolver** — `UI_COMPONENTS: Record<string, LazyExoticComponent>` maps
     slug → lazy component (`:2681-2785`; e.g. `'black-hole-3d': BlackHole3d`
     `:2688`, `'card-cascade': CardCascade` `:2706`).
   - `renderComponent(id, _name, props)` (`:2788-2814`): looks up `UI_COMPONENTS[id]`
     first; falls back to `<LazyRenderer type=... name={titleCased} ... />` with a
     `Text`-suffix heuristic for text ids (`:2796-2803`).
2. **Category page — `frontend/src/pages/LibraryPage/LibraryPage.tsx`**
   - `CATEGORY_META` (icon/color/bg/border per category) `:18-31`.
   - `baseCategories` (`:108-122`) hard-codes display names — note the labels
     **"Image Interaction"** (`:112`, slug `image-interaction`) and
     **"Interactive Background"** (`:115`, slug `interactive-background`), plus a
     broader `background` slug (`:114`).
   - Search filtering `:124-135`, drawer categories `:167-172`.
3. **Single component — `.../sections/ComponentDetail/index.tsx`**
   - Live preview is `item.preview({ showDemoButton: true })` inside a
     `React.Suspense` + `motion.div` (`:1762-1773`).
   - Code export: `getComponentCode(item.id, { lang: 'ts', styling: 'tailwind' })`
     and html variant (`:1213-1214`), zip via `downloadComponentZip` (`:1252`),
     Pro-fallback string (`:1277`), vanilla-code memo (`:1352`).
4. **Utilities**
   - `frontend/src/utils/codeUtils.ts` — `getComponentCode(id, { lang, styling })`
     (`:45`) merges a **UI HUB banner** (`withUiHubBranding` `:37`, banner
     builder `:13-32`) over code sourced from `componentFullSources`,
     `embeddedSourceCode`, `cinematicNavbarSource`, etc. (`:1-8`).
   - `frontend/src/utils/zipUtils.ts` — `downloadComponentZip` (`:11`).
   - `frontend/src/utils/componentSync.ts` — `triggerBackgroundComponentSync()`
     posts to `${getApiBaseUrl()}/api/v1/components/sync`, throttled to once/hour
     per browser via `localStorage['ui-hub-components-synced-ts']`. Fired at app
     boot from `frontend/src/App.tsx` — near the `triggerBackgroundComponentSync`
   call. This is how the site keeps the backend
     component store in sync; it is **not** a component store — Firebase is used
     for auth/storage/analytics only, and community components served via REST are
     registered under category `custom`.
5. **Fullscreen demo — `frontend/src/pages/Components/DemoPage.tsx`**
   - Route renders the component fullscreen with a floating back button
     `z-[9999]` (`:120`); SectionScrollPage uses the same chrome (`:14`).

## 3. Lifecycle of a NEW component (forge target)

To publish a component today, phase 3 must touch exactly these places:

1. **Write** `frontend/src/components/ui/<Component>.tsx` (default export).
2. **Register** the import (top of `componentData.tsx` — already imported so the
   lazy map can reference it), add `UI_COMPONENTS[slug]` (`:2681` block), and add a
   `componentList` entry (after `:5008`) with
   `preview: renderComponent(slug, Title, {...defaultProps})` and category
   `'interactive-background' | 'image-interaction'`.
3. **(Optional but used by the code tab)** add source to
   `codeUtils.ts`' backing data so `getComponentCode` returns real code (otherwise
   the Pro-fallback string at `ComponentDetail/index.tsx` — near the
   `Upgrade to Pro` fallback literal — shows).
4. **Metadata** `frontend/src/data/componentMetadata.ts` — add a
   `COMPONENT_CONFIG[slug]` entry (`:22` Record) if props metadata is wanted.
   **Current gap:** 6 of 10 `image-interaction` components have no entry
   (see `references/03` section 10).
5. **Prompts**: the `data/` + `references/` produced by this forge are the basis
   for the 5 vibe prompts (ADVANCE / ANTIGRAVITY / CLAUDE CODE / CURSOR / LOVABLE)
   generated per component — mirroring `.agents/skills/ui-hub-component-integration`.

## 4. Rules the forge must respect

- **Do not auto-register.** The integration skill's 5-step workflow
  (`.agents/skills/ui-hub-component-integration/SKILL.md`) is the release gate for
  anything deployed; this forge documents + generates specs, it does not publish.
- **`componentData.tsx` grab-bag order.** The list is appended, not sorted; the
  forge's emitter must insert at the correct category block (cited ranges in
  `references/02`/`03` §2).
- **Slug is stable.** id/slug = registry key. Changing a slug breaks the lazy map,
  routes (`/demo/:id`), metadata, and user-saved previews. Never rename in a spec.
- **Default props should match `renderComponent(...)` args** so preview and
  `COMPONENT_CONFIG` agree.