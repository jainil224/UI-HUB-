# Spec Output Template

> Phase 2 reference for UI-HUB Component Forge. This is the **exact** skeleton of
> every file written to `/component-specs/<slug>.md` in ANALYZE mode. Copy the 15
> section headings verbatim, in this order — `scripts/validate-spec.mjs` checks
> them (section 2.5 is a decimal subsection that slots between sections 2 and 3).
> Section bodies are guidance, not boilerplate; delete the guidance.
>
> This order matches **exactly** the 15-section spec required by the component
> request prompt (`references/10-component-request-prompt.md`, STEP 8). A spec
> written to this template is interchangeable with a spec a fresh AI produces
> from that prompt.

---

## 1. Header

State these fields exactly (the validator parses `Proposed slug` and `Category`):

- **Name:** Human Title
- **Proposed slug:** `kebab-case-slug`
- **Category:** `interactive-background` **or** `image-interaction`
- **One-line pitch:** What it is, in one sentence.
- **Date:** `YYYY-MM-DD`

## 2. Visual Intent

What the user will see, in 3–5 sentences, followed by one sentence on **motion
behaviour** (what moves, what triggers it, what it does at rest). Plain language
a non-engineer could picture. No code.

## 2.5 Inspiration Sources

Where the look came from (`references/09-inspiration-research.md`). Three short
items:

- **Mood / palette / motion:** 2–3 words each, matching the inspiration brief.
- **Image provided?** `yes` (then a one-line description of what the image showed)
  **or** `no`.
- **Reference links found (if any):** 1–2 URLs that best match, and for each what
  specifically was borrowed — **palette, layout or motion style, never code**.

This section is mandatory in every spec even when no image was given — if no
search was needed or nothing matched, say so honestly. It is what tells a human
reviewer which "video is this from" the effect is really pointing at.

## 3. Tech Stack Analysis

One paragraph summarizing the category's **house style** — taken from reading the
matching category doc (`references/02` or `references/03`) and its existing
components: framework, rendering tier, animation loop, styling method, key
libraries (with versions) and how design tokens are used. Close with the
constraint that the component must stay inside that stack: **no new framework or
npm package beyond the household set** (`react`, `react-dom`, `framer-motion`).
`validate-spec.mjs` warns (non-blocking) when §8 imports an npm package outside
that set.

## 4. Reference Components Used

List 2–3 components, each with its **exact `filePath`** (from
`data/component-index.json`) and one line on what is borrowed and what is changed.
Prefer the "best reference" three named in the matching category doc
(`references/02` or `references/03`).

```
- frontend/src/components/ui/Sky.tsx — borrow cloud sprite baking + pointer parallax easing.
- frontend/src/components/ui/GravitationalVortex.tsx — borrow rAF loop + DPR cap + cleanup shape.
```

If nothing is borrowed, say so explicitly.

## 5. Research Findings

- **Technique:** name it and explain how it works in 2–4 sentences (own words).
- **Parameters:** the values that drive the look, with starting values.
- **Source:** full URL per borrowed technique — **or** the exact line
  `No search needed: <Component> already implements <technique>` when the
  playbook's skip path applied (`references/05` §1).
- **Licence:** only if the playbook flagged one; otherwise omit.

## 6. Technical Approach

State the chosen **rendering tier** — one of `WebGL`, `canvas2D + rAF`,
`framer-motion DOM`, `pure CSS` — and justify it against the alternatives in 2–4
sentences. Cite the tier used by the closest reference component. Note the
fallback behaviour if the tier is unavailable (e.g. WebGL context loss).

## 7. Props Contract

A markdown table with exactly these four columns. Types follow the anatomy doc
(`references/04` §4): shallow, typed, no options `any` and no `any` at all.

| Name | Type | Default | Purpose |
|------|------|---------|---------|
| `images` | `Array<string \| { src: string; alt?: string }>` | `DEFAULT_IMAGES` | Source images. |
| `speed` | `number` | `2` | Motion speed 0–100. |

Rules: every prop has a real default (or the literal `required`); no prop of type
`any`; group an options object only when it has 3+ related fields. **Escape every
literal pipe inside a Type cell as `\|`** — unions such as
`Array<string \| { src: string }>`, `"day" \| "night"` or
`React.RefObject<HTMLElement \| null>` — or the 4-column table collapses.
`validate-spec.mjs` rejects any row that does not have exactly 4 columns.

## 8. Full Implementation

Two explicit sub-blocks. The **8a** block is what must stay portable
(`validate-spec.mjs` checks it); the **8b** block is what ADD actually registers.

### 8a. Drop-in standalone version

The complete component in one fenced `tsx` block, written to compile in a **fresh
project** that has never seen this repo:

- **Imports** resolve to bare `react` plus the exact external libraries already
  named in §3 (npm-installable). **No `@/`, `../` or `./` import paths.**
- **No design tokens by reference:** every colour/value is a literal, or
  `var(--x, fallback)` with a real fallback value. Never a bare `var(--x)`.
- **All types are declared in the block** — no `ComponentItem` or any name owned by
  this repo. React + DOM/WebGL globals are fine.
- Injection order matches `references/04` anatomy: header comment → imports →
  interface → defaults → refs/state → effects → **cleanup return** → render.
- Cleanup `return () => …` is required (or `// no cleanup needed` + one-line reason).
- Styling uses inline styles or Tailwind utility classes resolvable from a bare
  Tailwind CDN — no site-specific tokens.

```tsx
"use client";
import * as React from "react";

interface Props { /* … */ }

export default function Example(props: Props) {
  React.useEffect(() => {
    // set up loop / listeners / observers
    return () => {
      // cancel rAF, remove listeners, disconnect observers, delete GL resources
    };
  }, []);
  return <div style={{ width: "100%", height: "100%" }} />;
}
```

### 8b. Project-integrated version

The **exact** code Stage B writes and Stage C registers — it *may* use project
aliases/tokens. When byte-identical to 8a (the common case for self-contained
components), write:

```
Identical to 8a.
```

Stage C resolves the `§8` payload token to this block (falling back to the 8a fence
when 8b reads "Identical to 8a").

## 9. Performance Plan

Bullet the guarantees, matching the corpus rules (`references/01`/`04`):

- DPR cap **≤ 2** (state the exact cap).
- **ResizeObserver** (not `window.resize`), disconnected on unmount.
- **Single** rAF loop, id stored in a ref, `cancelAnimationFrame` on unmount.
- Every listener/timer/interval removed or cleared on unmount.
- `prefers-reduced-motion` path (state what it does).
- Mobile density/size clamp (state the cap and how it is chosen).
- GPU/resource cleanup if WebGL (`deleteBuffer`/`deleteProgram`).

## 10. Accessibility

- Canvas/decorative layers: `aria-hidden` or `pointer-events: none` as
  appropriate; state which.
- Any real control (buttons, carousel) keeps DOM focus + labels.
- Contrast over the background: name the token used (see `data/design-tokens.json`).
- Reduced-motion behaviour restated in one line.

## 11. Naming Contract

Explicitly state all three. `validate-spec.mjs` checks this section.

- **File:** `frontend/src/components/ui/PascalName.tsx`
- **Export:** `export default function PascalName(props: PascalNameProps)`
- **Slug:** `pascal-name`

All three derive from the same name; there are no aliases (this is the fix for
the `Tornado.tsx → Vortex` anti-pattern, `references/04` §10).

## 12. Integration Preview

Plain language first, then the machine-checkable plan. Open with a short
human-readable paragraph describing, without performing them, the changes needed
to add this component live (new file, registry/metadata/embedded-source entries).
Then, under a **Machine-readable edit plan** note, provide the exact edits ADD
mode will apply. This section MUST contain one fenced `json` block;
`scripts/validate-spec.mjs` parses it and checks every edit.

Each edit is an object with **all five** fields:

| Field | Type | Rule |
|------|------|------|
| `file` | string | repo-relative path (e.g. `frontend/src/data/componentData.tsx`). No line numbers. |
| `anchor` | string | exact existing text to locate. For `create-file` use `""`. Otherwise it MUST occur exactly once in `file`. |
| `operation` | string | `insert-after` \| `insert-before` \| `create-file`. |
| `payload` | string | literal text to insert, or a token: `§8` = "the §8b project-integrated code block" (or the §8a fence when §8b says "Identical to 8a"); `§8a` = "the standalone §8a block"; `§7` = "the §7 props table". Non-empty. |
| `why` | string | one line: why the edit is needed and how drift is prevented. |

`create-file` targets must not exist; insert operations need exactly one anchor match.
Payloads are inserted verbatim. The seven registry-shape edits run in fixed order
(Stage C of `references/07`): component file → `componentData.tsx` lazy const →
`UI_COMPONENTS` → `componentList` → `componentMetadata.ts` → `embeddedSourceCode.ts` →
`data/component-index.json`.

The block below is an example; a real spec uses real anchors from the current files.

```json
[
  {
    "file": "frontend/src/components/ui/AuroraSky.tsx",
    "anchor": "",
    "operation": "create-file",
    "payload": "§8",
    "why": "New component; the source is the section 8 block."
  },
  {
    "file": "frontend/src/data/componentData.tsx",
    "anchor": "const DriftwoodGallery = React.lazy(() => import('../components/ui/DriftwoodGallery').then(m => ({ default: m.DriftwoodGallery })));",
    "operation": "insert-after",
    "payload": "\nconst AuroraSky = React.lazy(() => import('../components/ui/AuroraSky'));",
    "why": "Anti-drift: file AuroraSky.tsx = default export AuroraSky = slug sky-aurora."
  }
]
```

## 13. Test Checklist

Concrete actions for Jainil, phrased as click/resize/toggle checks, e.g.:
"Resize the window from 320px to 1440px and confirm the canvas re-bakes and stays
sharp." One line per check; cover interaction, resize, reduced-motion and mobile.

## 14. Risks & Open Questions

Bullet honest risks: licence flags from `references/05` §6, WebGL fallback,
mobile battery cost, unresolved design choices, anything you would want a human
to confirm before Phase 3. If none, write `None known.`

---

## Appendix — Condensed worked example

Shape only; a real spec fills every section.

```md
## 1. Header
- Name: Ripple Grid
- Proposed slug: `ripple-grid`
- Category: `interactive-background`
- One-line pitch: A neon grid that ripples outward from each click.
- Date: 2026-09-19

## 2. Visual Intent
A dark canvas holds a perspective grid of thin neon lines. Clicking sends a
circular wave through the grid that decays over ~2s. Motion: waves expand from
the pointer, grid stays still at rest.

## 2.5 Inspiration Sources
Mood: neon / retro / rhythmic. Palette: dark base + neon cyan. Motion: shockwave
ripple (slow-expanding rings). Image provided? no. Reference links: none matched
storage well enough to cite.

## 3. Tech Stack Analysis
House style (from references/02): canvas2D + rAF, inline styling, pointer
listeners cleaned on unmount, DPR capped at 2, no external animation library.
This component stays inside that stack — react only, no new packages.

## 4. Reference Components Used
- frontend/src/components/ui/spider-web.tsx — borrow elastic line rendering.
- frontend/src/components/ui/GravitationalVortex.tsx — borrow rAF + cleanup shape.

## 5. Research Findings
Technique: radial wave function `sin(r - t) * exp(-k·r)` on grid vertices.
Source: https://example.org/wave-equation-notes
No search needed for the rAF loop: GravitationalVortex already implements it.

## 6. Technical Approach
canvas2D + rAF. The grid is a few hundred line segments — cheap on CPU and no
shader compilation step, so WebGL is overkill.

## 7. Props Contract
| Name | Type | Default | Purpose |
|---|---|---|---|
| `color` | `string` | `"#3D5CFF"` | Grid + ripple colour. |
| `spacing` | `number` | `40` | Cell size in px. |
| `decay` | `number` | `4` | Ripple falloff rate. |

## 8. Full Implementation
### 8a. Drop-in standalone version
(complete standalone tsx: bare React imports, inlined tokens, self-contained types)
### 8b. Project-integrated version
Identical to 8a.

## 9. Performance Plan
DPR cap 2; ResizeObserver; single rAF cancelled on unmount; pointerdown removed;
prefers-reduced-motion draws a static grid; spacing clamped up on mobile.

## 10. Accessibility
aria-hidden canvas + pointer-events none; ripple is decorative; contrast uses
text-primary token.

## 11. Naming Contract
File: frontend/src/components/ui/RippleGrid.tsx
Export: export default function RippleGrid(props: RippleGridProps)
Slug: ripple-grid

## 12. Integration Preview
Add RippleGrid to the live site: new component file, then the standard
registry/metadata/embedded-source entries. See the machine edit plan below.
(registry edits as §12 above)

## 13. Test Checklist
- Click the canvas; confirm one wave per click.
- Resize 320→1440px; grid stays sharp.
- Enable OS reduced-motion; confirm static grid.

## 14. Risks & Open Questions
None known.
```