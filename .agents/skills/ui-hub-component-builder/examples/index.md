# Examples — End-to-End Lifecycle

How a component actually gets into UI-HUB's data layer (verified flow) — so a
future agent knows exactly which files to touch and in which order.

## The pipeline (from the repo itself)

1. Component file → `frontend/src/components/ui/<Slug>.tsx`
2. UI entry + code string → `frontend/src/data/embeddedSourceCode.ts`
   (the exact prompt source fed to AI generators — components are generated
   FROM this string)
3. Registration + metadata → `frontend/src/data/componentData.tsx`
   (union of categories at `:2632`)
4. AI vibe prompts (ADVANCE / ANTIGRAVITY / CLAUDE CODE / CURSOR / LOVABLE) —
   generated from `embeddedSourceCode.ts` via `utils/promptUtils.ts`
5. Library/explorer reads `componentData.tsx` and renders the registry entries
   (category pages, previews)
6. Preview thumbnails — `scripts/announcement/capture-previews.mjs`
   (Playwright, `--enable-unsafe-swiftshader`, 1600×900; panel defaults to
   `interactive-background`)

## Verified example: registering a Background

```ts
// componentData.tsx (excerpt, category union at :2632)
category: 'background' | 'interactive-background'  // ← both qualify
slug: 'wave-background'          // e.g. WaveBackground → wave-background
name: 'Wave Background'
component: <WaveBackground />
```

- Keeps `category` string exactly inside the union (adding a new category string
  would need union edit — currently 14 members).
- The component itself is lazy-loaded per slug (see the `LazyTemplatePreview`
  pattern in previews).

## Verified example: registering an Image

```ts
category: 'image-interaction'   // primary; or hybrid scroll/3d/footer
slug: 'driftwood-gallery'
name: 'Driftwood Gallery'
```

Hybrids stay under their native category string but are documented here as
image interactions (e.g. `SectionScroll` → `scroll`).

## The "3 files + 1 script" rule

For any new component in these two categories, a future agent MUST touch:

| File | Purpose |
|---|---|
| `frontend/src/components/ui/<Slug>.tsx` | the component (source of truth) |
| `frontend/src/data/embeddedSourceCode.ts` | the exact code string for AI prompts |
| `frontend/src/data/componentData.tsx` | registry entry under the category union |
| `scripts/announcement/capture-previews.mjs` | add slug so preview thumbnails generate |

(plus any metadata props the component needs — see `componentMetadata.ts`.)

## Caution: never touch

- `frontend/package.json` deps unless a true new tech is required (there's no
  missing primitive today — see `dependencies.md`).
- Routes/pages/demo layouts unless the task explicitly targets them.
- Any WebGPU or unregistered bundle (`CloudScroll/`) claims.