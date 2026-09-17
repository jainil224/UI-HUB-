---
name: ui-hub-component-integration
description: >
  Use this skill when the user wants to ADD, REMOVE, or REPLACE a UI component
  in the UI-HUB project. Activates the correct data-layer files, component
  patterns, and the exact 5-step integration workflow so the AI never needs to
  re-read the entire codebase. Also ensures all 5 AI vibe prompts (ADVANCE,
  ANTIGRAVITY, CLAUDE CODE, CURSOR, LOVABLE) are correctly generated from the
  exact component source code.
---

# UI-HUB Component Integration Skill

## 1. Project Snapshot (Read This First — Do NOT Skip)

**Stack:** React 19 + TypeScript + Vite 6 + TailwindCSS v4
**Root:** `c:\Users\Admin\Documents\GitHub\UI-HUB-\`
**Frontend root:** `c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\`
**Dev server:** `npm run dev` (port 3000) inside `frontend/`
**Lint/type check:** `npm run lint` (runs `tsc --noEmit`) inside `frontend/`

### Key Directories

```
frontend/src/
  App.tsx                    <- All routes (React.lazy + React.Suspense)
  index.css                  <- Global CSS, design tokens, animation keyframes
  components/
    ui/                      <- 116+ component files (.tsx / .css / .module.css)
    animations/              <- TextAnimations, SocialTooltipButtons, etc.
    templates/               <- Template-specific components
    admin/                   <- Admin panel components
  pages/
    HomePage/                <- Main marketing page
    LibraryPage/             <- Component library browser
    Components/              <- Per-component full-screen demo pages
    Dashboard/               <- User dashboard
    Admin/                   <- Admin area
    Auth/                    <- Login / Signup / ForgotPassword
    TemplatesPage/           <- Templates browser + detail
    PricingPage/
    legal/
  data/
    componentData.tsx        <- THE MASTER FILE: preview JSX + all metadata per component
    componentMetadata.ts     <- Props + vibeMeta definitions per component slug
    embeddedSourceCode.ts    <- Full source strings keyed by component slug
    componentFullSources.ts  <- Additional full sources
    lovablePrompts.ts        <- Lovable AI prompts keyed by component slug
    antigravityPrompts.ts    <- Antigravity AI prompts keyed by component slug
    claudePrompts.ts         <- Claude AI prompts keyed by component slug
    templatesData.ts         <- All template definitions
    premiumComponents.ts     <- List of premium-gated component slugs
  context/                   <- ThemeContext, AuthContext, CookieConsentContext, SkeletonContext
  hooks/                     <- Custom hooks
  services/                  <- Firebase / API service layer
  utils/                     <- componentSync, helpers
  Assets/                    <- SVG logos, images
public/                      <- Static assets
```

### Installed Dependencies (do NOT duplicate, already in package.json)

- `framer-motion` / `motion`
- `gsap` + `@gsap/react`
- `three` + `@react-three/fiber` + `@react-three/drei`
- `@splinetool/react-spline` + `@splinetool/runtime`
- `@tsparticles/engine` + `@tsparticles/react` + `@tsparticles/slim`
- `lucide-react`
- `react-icons`
- `lenis` (smooth scroll)
- `zustand`
- `recharts`
- `simplex-noise`
- `clsx` + `tailwind-merge` + `class-variance-authority`
- `jszip`
- `firebase`
- `react-router-dom` v7
- `unicornstudio-react`

### Styling System

- **TailwindCSS v4** — utility classes throughout
- **Custom CSS classes** in `index.css`: `.hero-title`, `.serif-italic`, `.font-serif-heading`, `.font-sans-clean`, `.animate-float`, `.animate-hero-float`, etc.
- **Dark/Light theming** via `ThemeContext` — default dark: `bg-brand-black text-white`
- **Design tokens** (from `tailwind.config.ts`): `brand-black`, `brand-green`, custom spacing

---

## 2. The Data Layer — Most Important Concept

**Every component visible in the Library requires entries in up to 5 files.**
The `componentData.tsx` exported array is the master. Each object has this shape:

```typescript
// Simplified schema — verify by reading the last 3 entries above ]; in componentData.tsx
{
  slug: "my-component",           // URL-safe kebab-case identifier (unique)
  name: "My Component",           // Display name shown in Library
  description: "Short description...",
  category: "Cursors",            // See section 3 for valid categories
  tags: ["cursor", "interactive"],
  isPremium: false,               // true if slug is in premiumComponents.ts
  component: <MyComponent />,     // JSX preview element (uses React.lazy import at top)
  // --- optional fields ---
  demoPath: "/demo/my-component", // if a full-screen demo page exists
  lovablePrompt: LOVABLE_PROMPTS["my-component"],
  antigravityPrompt: ANTIGRAVITY_PROMPTS["my-component"],
  sourceCode: EMBEDDED_SOURCE_CODE["my-component"],
  vibeMeta: COMPONENT_CONFIG["my-component"]?.vibeMeta,
  props: COMPONENT_CONFIG["my-component"]?.props,
}
```

> **Critical:** Always read 10 lines around the last entry (before the closing `];`) in the
> current file to confirm the exact field names before adding your entry — they may evolve.

---

## 3. Component Categories

Valid categories currently in use (verify in `componentData.tsx`):

| Category | Examples |
|---|---|
| `Cursors` | AuroraCursor, HeartCursor, MagneticCursor |
| `Backgrounds` | SpaceBackground, HackerBackground, BeamGridBackground |
| `Buttons` | GalaxyButton, CornerBorderButton, RainbowButton |
| `Text Animations` | LetterPullUpText, VaporizeTextCycle, ScrollHighlight |
| `Carousels` | PerspectiveCarousel, DiagonalCarousel |
| `3D` | ParticleSphere, TwinGalaxyRings, GlobeMesh |
| `Loading` | TradingCandles, GeneratingOrb, Hourglass |
| `Cards` | MagicCard, TestimonialsCard, CardCascade |
| `Effects` | BorderBeam, SVGPageTransition, FourierFlow |
| `Footers` | HaulFooter, SoraFooter, OmniflowFooter |
| `Templates` | Full-page template demos |

---

## 4. Core Safety Rule — ADDITIVE BY DEFAULT

> **NEVER remove, rename, or restructure anything unless the user explicitly says "remove" or "replace".**

| Allowed by default | Requires explicit user instruction |
|---|---|
| Add new `.tsx` file in `components/ui/` | Delete any existing component file |
| Add `React.lazy` import in `componentData.tsx` | Rewrite an existing component |
| Append new entry to the data array | Change routes for existing pages |
| Add new key to `EMBEDDED_SOURCE_CODE`, `COMPONENT_CONFIG`, etc. | Remove existing data entries |
| Add new route in `App.tsx` for a demo page | Modify global styles for unrelated components |
| Add npm dependency if genuinely missing | Upgrade existing package versions |

**Minimum-change rule:** Prefer surgical patches over file rewrites.

---

## 5. TARGET LOCATION DISCOVERY — MANDATORY FIRST STEP

> **This section runs BEFORE any file is created or modified.**
> Never skip this step even if the user seems to have given clear instructions.

Before modifying any file, inspect the current UI-HUB application structure and
determine exactly where the new component belongs.

### 5.1 What You Must Identify

The AI must answer all of these before writing a single line of code:

| Question | Where to look |
|---|---|
| 1. **Component category** | Compare to the category table in section 3 |
| 2. **Correct Library section** | Check existing entries in `componentData.tsx` array for same-category components |
| 3. **Correct page or route** | Check `App.tsx` routes; check `pages/` directory |
| 4. **Correct position/order** | Check what the last component of the same category is — append after it |
| 5. **Component type** | Is it a standalone library component, page section, animation, template, or demo? |
| 6. **Explicit user placement** | Did the user say "put it after X" or "add it to the Y section"? |

### 5.2 Placement Priority Order

Use this priority order to determine where the component goes:

```
1. Explicit user placement instruction (highest priority)
        |
        v
2. Existing UI-HUB architectural pattern for this component type
        |
        v
3. Existing category/component pattern in componentData.tsx
        |
        v
4. Best-fit location based on the component's purpose (lowest priority)
```

### 5.3 Component Type Decision Table

| If the user provides... | It goes in... |
|---|---|
| A cursor or pointer effect | `components/ui/` + category `Cursors` |
| A background / scene | `components/ui/` + category `Backgrounds` |
| A button / click element | `components/ui/` + category `Buttons` |
| Text animation | `components/animations/` + category `Text Animations` |
| A 3D / WebGL / Three.js scene | `components/ui/` + category `3D` |
| A loading spinner / state | `components/ui/` + category `Loading` |
| A card component | `components/ui/` + category `Cards` |
| A scroll / carousel | `components/ui/` + category `Carousels` |
| A full-page layout | `pages/Components/` + a new demo route in `App.tsx` |
| A footer variant | `components/ui/` + category `Footers` |
| A full-page template | `data/templatesData.ts` + `pages/TemplatesPage/` |
| An effect (border, glow, etc.) | `components/ui/` + category `Effects` |

### 5.4 What You Must NOT Do

- Do NOT randomly insert the component into an existing JSX section without
  determining the correct location first.
- Do NOT create a new page when a suitable existing Library category already exists.
- Do NOT move, reorder, or rename existing components simply to make room.
- Do NOT place a UI library component inside `pages/` instead of `components/ui/`.
- Do NOT place a full-page demo component inside `components/ui/` instead of `pages/Components/`.

### 5.5 Discovery Procedure

Run this checklist before writing code:

```
[ ] 1. Read the component name and source code (or description)
[ ] 2. Identify its visual/functional category (cursor, background, button, etc.)
[ ] 3. Confirm the category exists in section 3's table
[ ] 4. Open componentData.tsx — find the last component in the same category
[ ] 5. Determine: does this need a full-screen /demo/slug route?
[ ] 6. Determine: did the user specify an exact placement? If YES, honor it.
[ ] 7. State your placement decision explicitly before making any changes:
        "I will place MyComponent in the [Category] section of the library,
         appended after [LastSameCategory], with slug 'my-component'.
         [It will / will not] have a full-screen demo page."
```

---

## 6. Step-by-Step Integration Procedure

### Step 1 — Understand the new component

Before writing any code, answer:
- What does this component render?
- What props does it accept?
- What dependencies does it require? (Check section 1 — most are already installed)
- Does it need canvas/WebGL/Three.js/GSAP or just React + CSS?
- Does it need a full-screen demo page (`/demo/slug`)?

### Step 2 — Create the component file

**Location:** `frontend/src/components/ui/MyComponent.tsx`

Follow these conventions:

```typescript
// PascalCase file, named export + default export
export const MyComponent: React.FC<MyComponentProps> = ({ ...props }) => {
  // implementation
};
export default MyComponent;
```

If the component needs its own CSS: create `MyComponent.module.css` or `MyComponent.css` alongside it.

**Responsiveness checklist:**
- Use `clamp()` for fluid font-sizes
- Use CSS grid/flex with wrapping for multi-column layouts
- Never use fixed `px` widths that overflow mobile (320px minimum)
- Canvas components: listen to `ResizeObserver` and redraw on resize

### Step 3 — Register the lazy import in componentData.tsx

At the **top section** of `componentData.tsx` (after existing lazy imports, before line ~95):

```typescript
// Default export:
const MyComponent = React.lazy(() => import('../components/ui/MyComponent'));

// Named export:
const MyComponent = React.lazy(() =>
  import('../components/ui/MyComponent').then(m => ({ default: m.MyComponent }))
);
```

### Step 4 — Add the data entry

In `componentData.tsx`, append to the exported array (before the closing `];`):

```typescript
{
  slug: "my-component",
  name: "My Component",
  description: "One-line description visible in the library card.",
  category: "Backgrounds",
  tags: ["tag1", "tag2"],
  isPremium: false,
  component: (
    <Suspense fallback={<div className="w-full h-full bg-neutral-950" />}>
      <MyComponent />
    </Suspense>
  ),
  // Include only if applicable:
  demoPath: "/demo/my-component",
  sourceCode: EMBEDDED_SOURCE_CODE["my-component"],
  lovablePrompt: LOVABLE_PROMPTS["my-component"],
  antigravityPrompt: ANTIGRAVITY_PROMPTS["my-component"],
  vibeMeta: COMPONENT_CONFIG["my-component"]?.vibeMeta,
  props: COMPONENT_CONFIG["my-component"]?.props,
},
```

### Step 5 — Populate all data files

> **Most critical step.** The `embeddedSourceCode.ts` entry is the source of truth
> for BOTH the "View Source" code panel AND all 5 AI vibe prompts. If this is missing
> or wrong, every prompt will generate broken/incomplete code for users.

**a) `embeddedSourceCode.ts`** — THE most important file. Add the 100% complete,
exact source code of `MyComponent.tsx` as a string:

```typescript
// In the EMBEDDED_SOURCE_CODE object in embeddedSourceCode.ts:
"my-component": `[PASTE THE ENTIRE EXACT SOURCE CODE of MyComponent.tsx here.
  This must be 100% complete — no truncation, no summarization.
  This feeds ALL 5 vibe prompts automatically.]`,
```

**b) `componentMetadata.ts`** — Props + vibeMeta entry (feeds the ADVANCE prompt's
"Props" and "Animation Engine" sections):

```typescript
// In the COMPONENT_CONFIG object in componentMetadata.ts:
"my-component": {
  props: [
    {
      name: "propName",
      type: "string",
      default: '"default"',
      description: "What this prop does.",
    },
  ],
  vibeMeta: {
    behavior: "Short behavior description.",
    states: { from: "initial state", to: "animated state" },
    cssProperties: ["canvas", "requestAnimationFrame"],
    description: "Longer description for AI context.",
    libraries: ["react"],
    requirements: ["WebGL", "ResizeObserver"],
  },
},
```

**c) `antigravityPrompts.ts`** — Add only if you want a manually curated
Antigravity-specific prompt. If absent, the system auto-generates one from
the source code in `embeddedSourceCode.ts`:

```typescript
// In ANTIGRAVITY_PROMPTS object:
"my-component": `
# UI HUB - ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)
You are a senior frontend engineer.
Return ONLY code. Return ONE complete file. Do NOT explain anything.

## TASK
Build the ${componentName} component.

## REFERENCE IMPLEMENTATION
[exact source code here]
`,
```

**d) `lovablePrompts.ts`** — Add only if you want a manually curated Lovable prompt.
If absent, auto-generated from source code:

```typescript
// In LOVABLE_PROMPTS object:
"my-component": `
# UI HUB - LOVABLE PROMPT
[Detailed prompt describing how to rebuild this component]
`,
```

> **Note:** `claude`, `cursor`, and `advance` prompts are ALWAYS auto-generated
> by `promptUtils.ts` from the source code — no manual entry needed for those.
> Only `antigravity` and `lovable` have optional manual overrides.

### Step 6 — Sync the MCP server data (run after Step 5)

> **Do not skip this step.** The MCP server (`UI-HUB-MCP-`) serves components from
> `mcp-server/src/data/`, which is REGENERATED from the frontend data files. Skipping it leaves
> new components invisible to the MCP (missing from searches, metadata, prompts, and source delivery).

From the repo root, run:

```bash
node mcp-server/scripts/sync-frontend-data.mjs
```

This rewrites these files in `mcp-server/src/data/` from the frontend sources:

| Regenerated file | Source in `frontend/src/data/` |
|---|---|
| `components.ts` | `componentData.tsx` |
| `componentMetadata.json` | `componentMetadata.ts` |
| `aiPrompts.json` | `claudePrompts.ts` + `antigravityPrompts.ts` + `lovablePrompts.ts` |
| `componentVibePrompts.json` | `componentData.tsx` (vibePrompt fields) |
| `templates.json` | `templatesData.ts` |
| `sourceCode.json` | `embeddedSourceCode.ts` + backend sources + `frontend/src/components/ui/` disk scan |
| `premiumComponents.json` | `premiumComponents.ts` (canonical premium list) |

Coverage check (must end `OK`):

```bash
node mcp-server/scripts/check-source-coverage.mjs
```

**Template caveat:** the sync script only pulls template source for ids listed in its hardcoded
`templateFileMap`. If you add a NEW template, first add `'<template-id>': ['templates', 'File.tsx']`
to that map inside `mcp-server/scripts/sync-frontend-data.mjs`, or its source will be missing from
`sourceCode.json`.

> **DO NOT PUSH HERE.** The regenerated `mcp-server/**` files belong to the `UI-HUB-MCP-`
> repository. They are published ONLY when the user invokes the `ui-hub-github-sync-and-push`
> skill to push. This skill never runs `git push`.

---

## 7. The Vibe Prompt System — Full Architecture

This section explains exactly how the **CODE tab** and the **COPY PROMPT** dropdown
work in the library UI (as seen in the screenshots with "EXACT CODE", "ADVANCE",
"ANTIGRAVITY", "CLAUDE CODE", "CURSOR", "LOVABLE").

### 7.1 How the Prompt Pipeline Works

```
MyComponent.tsx (the real file)
        |
        v
embeddedSourceCode.ts["my-component"]   <-- YOU MUST ADD THIS
        |
        v
promptUtils.ts → getFallbackVibePrompt(id, system)
        |
        +---> buildAdvancePrompt()    --> ADVANCE tab
        +---> buildAntigravityPrompt() -> ANTIGRAVITY tab (or manual override)
        +---> buildClaudePrompt()    --> CLAUDE CODE tab
        +---> buildCursorPrompt()    --> CURSOR tab
        +---> buildLovablePrompt()   --> LOVABLE tab (or manual override)
        |
        v
ComponentDetail/index.tsx "COPY PROMPT" dropdown
```

**The single most important rule:** Every prompt type embeds the exact source code
from `embeddedSourceCode.ts`. If that entry is missing, empty, or wrong, all 5
AI prompts will produce incorrect or placeholder code.

### 7.2 What Each Prompt Generates

| Prompt | Style | Auto-generated? | Has exact code? |
|---|---|---|---|
| **ADVANCE** | Universal blueprint with ASCII header, animation breakdown, full code block | Always auto | YES |
| **ANTIGRAVITY** | Strict rules format, explicit DO/DON'T, full code block | Auto or manual override | YES |
| **CLAUDE CODE** | Structured recreation request, numbered steps, full code block | Always auto | YES |
| **CURSOR** | Concise IDE-style command with typed props, full code block | Always auto | YES |
| **LOVABLE** | Plain-language visual description, full code block | Auto or manual override | YES |

### 7.3 EXACT SOURCE CONSISTENCY RULE

> **This rule is absolute. There are no exceptions.**

For every AI prompt system — ADVANCE, ANTIGRAVITY, CLAUDE CODE, CURSOR, LOVABLE —
the implementation code embedded in the prompt MUST originate from the **single
canonical source**: `embeddedSourceCode.ts[slug]`.

#### What this means in practice:

| Action | Allowed? |
|---|---|
| Manual prompt changes instructions, explanation, or setup notes | YES |
| Manual prompt changes formatting or section headers | YES |
| Manual prompt adds extra context about the AI tool's conventions | YES |
| Manual prompt replaces the code block with a different version | **NO** |
| Manual prompt truncates the code block to save space | **NO** |
| Manual prompt summarizes the code instead of including it verbatim | **NO** |
| Manual prompt includes a slightly edited/fixed version of the code | **NO** |

#### The canonical code path:

```
embeddedSourceCode.ts["slug"]  <-- SINGLE SOURCE OF TRUTH
        |
        v
  ALL prompts read from here
        |
        +-- ADVANCE    : embedded verbatim in ## Reference Implementation block
        +-- ANTIGRAVITY: embedded verbatim in ## REFERENCE IMPLEMENTATION block
        +-- CLAUDE CODE: embedded verbatim in code block after "Here is the exact reference"
        +-- CURSOR     : embedded verbatim in Reference implementation block
        +-- LOVABLE    : embedded verbatim in "Use this reference implementation" block
        +-- CODE tab   : shown directly as the "EXACT CODE" panel
        +-- Download   : delivered as the downloadable file
```

#### If you write a manual prompt override in antigravityPrompts.ts or lovablePrompts.ts:

```typescript
// CORRECT — instructions change, code comes from embeddedSourceCode.ts automatically
"my-component": `
# UI HUB - ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)
You are a senior frontend engineer. Build this EXACTLY.
Return ONLY code. ONE file. NO explanations.

## TASK
Rebuild the MyComponent component for a Vite + React project.
Port all imports and class names to match the host project conventions.

## REFERENCE IMPLEMENTATION
// NOTE: The actual code is injected here automatically from embeddedSourceCode.ts
// DO NOT paste code directly into this string — it will drift from the canonical source.
`,

// WRONG — code pasted directly into the override string (will drift from canonical source)
"my-component": `...Build MyComponent...
\`\`\`tsx
const MyComponent = () => <div>...</div>  // <-- NEVER DO THIS
\`\`\`
`,
```

> **Key enforcement point:** The `getFallbackVibePrompt()` function in `promptUtils.ts`
> reads `EMBEDDED_SOURCE_CODE[componentId]` and passes it as `manifest.sourceCode`
> to every builder function. The builder functions embed this code verbatim. Manual
> overrides stored in `antigravityPrompts.ts`/`lovablePrompts.ts` are used as the
> `description`/`rawSpec` fallback — NOT as the code source. The code always comes
> from `embeddedSourceCode.ts`. This is why a manual override MUST NOT contain code.

### 7.4 PROMPT RENDERING GUARANTEE

> **MANDATORY VERIFICATION REQUIREMENT**
> The final text displayed to the user for ALL five prompts MUST contain the exact canonical implementation from `embeddedSourceCode.ts[componentSlug]`.
> A manual override may contain instructions only.
> The runtime prompt builder is responsible for injecting the canonical source code into the final rendered prompt.
>
> **Before considering the integration complete, verify the ACTUAL FINAL GENERATED prompt output for:**
> - **ADVANCE**
> - **ANTIGRAVITY**
> - **CLAUDE CODE**
> - **CURSOR**
> - **LOVABLE**
>
> **Do not verify only the source files or configuration. Verify the final generated strings.**

#### Verification Methods:

1. **Direct UI Verification (Interactive):**
   - Run `npm run dev` in `frontend/`.
   - Navigate to `http://localhost:3000/library` and open the component detail drawer/modal.
   - Click the "COPY PROMPT" dropdown and inspect or copy each of the 5 prompts:
     - Select **ADVANCE** → confirm the copied string contains the complete source code.
     - Select **ANTIGRAVITY** → confirm the copied string contains the complete source code.
     - Select **CLAUDE CODE** → confirm the copied string contains the complete source code.
     - Select **CURSOR** → confirm the copied string contains the complete source code.
     - Select **LOVABLE** → confirm the copied string contains the complete source code.

2. **Automated / Script Verification:**
   - Execute a quick Node script importing `getFallbackVibePrompt`:
   ```bash
   node -e "const { getFallbackVibePrompt } = require('./src/utils/promptUtils'); ['advance','antigravity','claude','cursor','lovable'].forEach(sys => { const p = getFallbackVibePrompt('my-slug', sys); if (!p || !p.includes('export default')) throw new Error('Missing code in ' + sys); console.log(sys + ': verified'); });"
   ```

3. **Checklist Before Approval:**
   - [ ] Prompt string is not empty or `undefined`.
   - [ ] Prompt string contains all import statements and component body from `embeddedSourceCode.ts`.
   - [ ] No placeholder tokens (e.g. `[CODE_HERE]`) remain unresolved.
   - [ ] Manual override instructions (if any) precede the canonical code without overriding it.

### 7.5 The CODE Tab ("EXACT CODE")

The CODE tab shows the raw content of `embeddedSourceCode.ts["my-component"]`.
This is also the "Download" button content. It must be the exact, compilable
source code — not a summary, not a fragment.

### 7.6 The Type System for Prompts

In `promptUtils.ts`:
```typescript
export type AISystem = 'antigravity' | 'lovable' | 'cursor' | 'claude' | 'advance';
```

Premium tools (require auth/trial): `advance`, `antigravity`, `claude`
Free tools: `cursor`, `lovable`

### 7.7 ComponentManifest — What Feeds the Prompts

The `promptUtils.ts` builds a `ComponentManifest` object from your component data:

```typescript
interface ComponentManifest {
  componentId: string;       // the slug
  displayName: string;       // the display name
  category: string;
  description: string;       // from componentData.tsx entry
  sourceCode: string;        // FROM embeddedSourceCode.ts — MOST CRITICAL
  animationEngine: string;   // auto-detected from source (gsap / three.js / framer-motion)
  interactionTriggers: string[]; // e.g. ['mount', 'hover', 'click']
  dependencies: { npm: Record<string, string> };
  props: Array<{ name: string; type: string; required?: boolean }>;
  knownGotchas?: string[];
}
```

The `animationEngine` is auto-detected by scanning `sourceCode` for:
- `gsap` or `ScrollTrigger` → `'gsap'`
- `three` or `WebGL` or `@react-three` → `'three.js'`
- everything else → `'framer-motion'`

### 7.8 Manual Prompt Override Strategy

Only add to `antigravityPrompts.ts` or `lovablePrompts.ts` when:
- The auto-generated prompt lacks domain-specific instructions (e.g. for a
  complex Spline/WebGL component that needs extra setup notes)
- You want to provide curated step-by-step build instructions for that AI tool

For all other prompts (`advance`, `claude`, `cursor`), the auto-generation from
source code is sufficient — do not create manual override files for these.

**Reminder:** Any manual override must NOT include code (see §7.3).

### 7.9 LOCAL_ONLY_COMPONENTS List

Components in this array always use the local prompt generator (bypass the
backend API), so they MUST have a complete `embeddedSourceCode.ts` entry:

```typescript
// In promptUtils.ts:
const LOCAL_ONLY_COMPONENTS = [
  'cinematic-navbar', 'floating-dark-capsule', 'minimal-ai-capsule',
  'pill-navbar', 'modern-dark', 'split-navigation-nav', 'awwwards-nav',
  'haul-footer', 'omniflow-footer', 'sora-footer', 'alpine-footer',
  'leeuwarder-golfclub', 'community-newsletter', 'faizur-portfolio', 'sui-foundation'
];
```

When you add a new locally-defined component, add its slug to this array if it
should always use the local fallback instead of the backend prompt vault.

---

## 8. Adding a Full-Screen Demo Page (Optional)

For components that benefit from immersive full-screen experience (like `/demo/cloud-scroll`).

### a) Create the demo page file

Path: `frontend/src/pages/Components/MyComponentDemoPage.tsx`

```tsx
import React from 'react';
import MyComponent from '../../components/ui/MyComponent';

const MyComponentDemoPage: React.FC = () => {
  return (
    <div className="w-full h-screen bg-neutral-950 overflow-hidden">
      <MyComponent />
    </div>
  );
};

export default MyComponentDemoPage;
```

### b) Register in App.tsx (two surgical patches)

At the **top import section** with other lazy imports:

```typescript
const MyComponentDemoPage = React.lazy(() =>
  import('./pages/Components/MyComponentDemoPage')
);
```

In the **Routes section** after the existing `/demo/...` routes:

```tsx
<Route path="/demo/my-component" element={<MyComponentDemoPage />} />
```

---

## 9. Removing a Component (Explicit User Request Only)

When the user explicitly says "remove" or "delete":

1. Remove the `React.lazy` import from `componentData.tsx`
2. Remove the data entry from the array in `componentData.tsx`
3. Remove the key from `EMBEDDED_SOURCE_CODE` in `embeddedSourceCode.ts`
4. Remove the key from `COMPONENT_CONFIG` in `componentMetadata.ts`
5. Remove the key from `LOVABLE_PROMPTS` and `ANTIGRAVITY_PROMPTS` if present
6. Remove the demo route from `App.tsx` if one exists
7. Remove the demo page file from `pages/Components/` if one exists
8. Delete the component file from `components/ui/` only if it is not used by any other component
9. Re-run the MCP data sync (Step 6, §6) so the removed component also leaves `mcp-server/src/data/`

**Stop condition:** Do NOT delete any shared utility, hook, context, or layout file.

---

## 10. Replacing a Component (Explicit User Request Only)

When the user says "replace X with Y":

1. Identify the existing component's slug (e.g., `"old-hero"`)
2. Follow section 6 to create and register the NEW component under its new slug
3. Follow section 9 to remove only the OLD component entries
4. If the old component was rendered on a specific page (not just in the library), update that page's import and JSX too
5. Re-run the MCP data sync (Step 6, §6) so `mcp-server/src/data/` reflects the replacement

---

## 11. Dependency Safety

> **Check before you install. Prefer what already exists.**

Before adding any `import` that requires a new package, run through this checklist.

### 11.1 Pre-Installation Checklist

```
[ ] 1. Open frontend/package.json and read ALL dependencies and devDependencies
[ ] 2. Search for an equivalent already-installed package
[ ] 3. If equivalent exists — use it; do NOT install a second one
[ ] 4. If genuinely missing — install only the specific new package
[ ] 5. Do NOT upgrade the version of any existing package
[ ] 6. Do NOT swap one library for another (e.g. axios ≠ fetch wrapping)
[ ] 7. Record the new package in the Final Report
```

### 11.2 Already-Installed Package Reference

These are pre-installed in `frontend/package.json`. Do NOT reinstall or duplicate:

| Need | Use this (already installed) |
|---|---|
| Animation (physics/spring) | `framer-motion` / `motion` |
| Timeline animation | `gsap` + `@gsap/react` |
| 3D / WebGL | `three` + `@react-three/fiber` + `@react-three/drei` |
| 3D scenes (Spline) | `@splinetool/react-spline` + `@splinetool/runtime` |
| Particle systems | `@tsparticles/engine` + `@tsparticles/react` + `@tsparticles/slim` |
| Icons | `lucide-react`, `react-icons` |
| Smooth scroll | `lenis` |
| State management | `zustand` |
| Charts | `recharts` |
| Noise / randomness | `simplex-noise` |
| Class merging | `clsx`, `tailwind-merge`, `class-variance-authority` |
| Zip files | `jszip` |
| Auth / DB | `firebase` |
| Routing | `react-router-dom` v7 |
| 3D Spline embed | `unicornstudio-react` |

### 11.3 Decision Flow

```
Component needs package X?
        |
        v
Is X already in frontend/package.json?
  YES — import it directly. Do NOT run npm install.
  NO
  |
  v
Is there an equivalent already-installed package?
  YES — use the equivalent. Document why in your report.
  NO
  |
  v
Does the component genuinely require X and no substitute exists?
  YES — install: npm install X (exact version, no ^ upgrades to existing packages)
        Record in Final Report under "New Dependencies"
  NO  — redesign the component to avoid the new dependency
```

### 11.4 Rules

1. Never install a package that is already installed under a different name
2. Never upgrade an existing package's version to satisfy a new component's needs
3. Never replace one installed library with another (e.g. do not add `axios` when `fetch` works)
4. Record every newly installed dependency in the Final Report, including:
   - Package name and version installed
   - Why it was necessary
   - Which installed alternative was considered and why it was insufficient

---

## 12. Visual Consistency Rules

All new components MUST match UI-HUB's aesthetic:

| Property | UI-HUB convention |
|---|---|
| Dark background | `#0a0a0a` / `bg-neutral-950` / `bg-brand-black` |
| Accent green | `brand-green` (Tailwind token) |
| Selection accent | `#3D5CFF` |
| Font families | Inter, Plus Jakarta Sans, DM Serif Display (via existing CSS classes) |
| Border radius — cards | `rounded-2xl` (16px) |
| Border radius — large containers | `rounded-3xl` (24px) |
| Glass effect | `backdrop-blur-xl bg-white/5 border border-white/10` |
| Motion style | Spring physics or ease-in-out; never harsh linear snaps |
| Canvas sizing | Always use `ResizeObserver` to match parent |
| Preview min-height | `min-h-[380px]` for library card previews |

---

## 13. Responsive Requirements — All Breakpoints

> **Every new component MUST be evaluated against all 6 breakpoints.**
> Do NOT solve responsiveness by hiding the component on mobile unless the user
> explicitly requests that behavior.

### 13.1 Required Breakpoints

| Breakpoint | Width | Class in Tailwind |
|---|---|---|
| Mobile S | 320px | (base) |
| Mobile M | 375px | (base) |
| Tablet | 768px | `md:` |
| Laptop | 1024px | `lg:` |
| Desktop | 1280px | `xl:` |
| Large Desktop | 1440px+ | `2xl:` |

### 13.2 Verification Checklist

For each breakpoint, verify all of these:

```
[ ] No horizontal overflow (body scrollbar does NOT appear)
[ ] No clipped text (no truncation that hides meaning)
[ ] No overlapping elements (z-index / stacking correct)
[ ] Buttons remain usable (min-width / padding adequate)
[ ] Interactive elements remain clickable (not occluded by other layers)
[ ] Images / canvas scale correctly (no stretching or cropping of key content)
[ ] Animations do not overflow the viewport (no runaway particles/canvas)
[ ] Typography remains readable (min font-size ~14px, contrast passes)
[ ] Component height remains reasonable (no infinite or 0-height containers)
[ ] Touch targets usable on mobile (min 44x44px per WCAG 2.5.5)
```

### 13.3 Responsive Implementation Patterns

Use these patterns in all new components:

**Fluid typography:**
```css
font-size: clamp(1rem, 2.5vw, 1.5rem);
```

**Canvas / WebGL responsiveness (required for all canvas-based components):**
```typescript
useEffect(() => {
  const ro = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    canvas.width = width;
    canvas.height = height;
    // re-trigger draw / scene resize
  });
  ro.observe(containerRef.current!);
  return () => ro.disconnect();
}, []);
```

**Grid / flex wrapping (prefer over fixed columns):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Avoid fixed pixel widths that overflow:**
```tsx
// BAD
<div style={{ width: '800px' }}>
// GOOD
<div className="w-full max-w-4xl mx-auto">
```

**Touch target sizing:**
```tsx
// Ensure all interactive elements have at least 44px tap area
<button className="min-h-[44px] min-w-[44px] px-4 py-2">
```

### 13.4 What You Must NOT Do

- Do NOT add `overflow: hidden` to the root component to mask horizontal overflow
  problems — fix the underlying layout issue instead.
- Do NOT use `hidden md:block` to hide the component entirely on mobile unless
  the user explicitly requests mobile-exclusion behavior.
- Do NOT use fixed pixel widths (`width: 800px`) for containers that need to
  shrink below that width on smaller screens.
- Do NOT assume a minimum screen width of anything above 320px.
- Do NOT skip canvas resize handling — a canvas that doesn't resize will overflow
  or appear blank on window resize.

---

## 14. Naming Conflict Resolution

If the new component name clashes with an existing one:

1. Read both component files
2. Rename only the **new** component (e.g., `Card` becomes `FeatureCard`, `HeroV2`)
3. Update all references to the new name consistently
4. Never silently overwrite an existing component

---

## 15. Validation Workflow

After integration, run from `frontend/`:

```powershell
npm run lint     # TypeScript type-check (tsc --noEmit)
npm run build    # Vite production build — catches bundling errors
```

MCP data sync (Step 6, §6) — run from the repo root and confirm coverage passes:

```powershell
node mcp-server/scripts/sync-frontend-data.mjs
node mcp-server/scripts/check-source-coverage.mjs   # must print "OK"
```

Visual check at `localhost:3000`:
- [ ] Library page shows the new component card
- [ ] Component preview renders without errors
- [ ] "View Source" shows the correct code (if sourceCode was added)
- [ ] Demo page renders at its route (if added)
- [ ] Surrounding components in the library still work
- [ ] Responsive: pass all 10 checks from §13.2 at all 6 breakpoints (320px → 1440px+)

Prompt Rendering Guarantee verification (§7.4):
- [ ] **ADVANCE**: final rendered string contains canonical code from `embeddedSourceCode.ts`
- [ ] **ANTIGRAVITY**: final rendered string contains canonical code from `embeddedSourceCode.ts`
- [ ] **CLAUDE CODE**: final rendered string contains canonical code from `embeddedSourceCode.ts`
- [ ] **CURSOR**: final rendered string contains canonical code from `embeddedSourceCode.ts`
- [ ] **LOVABLE**: final rendered string contains canonical code from `embeddedSourceCode.ts`

*(Do not verify only the config/source files. Verify the final generated strings.)*

---

## 16. Final Report Format

```
## Integration Complete

### Added
- Component: [Name] (slug: `my-component`)
- File: `frontend/src/components/ui/MyComponent.tsx`
- Demo page: `frontend/src/pages/Components/MyComponentDemoPage.tsx` (if applicable)

### Updated (surgical patches only)
- `componentData.tsx` — added lazy import + data entry
- `embeddedSourceCode.ts` — added 100% exact full source string (drives all 5 AI prompts)
- `componentMetadata.ts` — added props + vibeMeta
- `antigravityPrompts.ts` — added manual prompt override (if applicable)
- `lovablePrompts.ts` — added manual prompt override (if applicable)
- `App.tsx` — added lazy import + route (if demo page added)

### Prompts Generated Automatically
- ADVANCE prompt: auto-generated from source code
- ANTIGRAVITY prompt: auto-generated (or manual override if added)
- CLAUDE CODE prompt: auto-generated from source code
- CURSOR prompt: auto-generated from source code
- LOVABLE prompt: auto-generated (or manual override if added)

### MCP Data Sync (Step 6, §6)
- MCP data regenerated (`mcp-server/src/data`): YES / NO
- Coverage check (`check-source-coverage.mjs`): PASS / FAIL
- Pushed: NO — the `mcp-server/**` files are published to `UI-HUB-MCP-` only via the
  `ui-hub-github-sync-and-push` skill when the user asks to push

### Preserved
All existing components, routes, styles, and data entries are untouched.

### Validation
- `npm run lint` -> pass / fail [describe issues]
- `npm run build` -> pass / fail [describe issues]
- Visual check -> renders in library at localhost:3000/library
- CODE tab -> shows correct exact source code
- Prompt output verified -> all 5 generated prompts (ADVANCE, ANTIGRAVITY, CLAUDE CODE, CURSOR, LOVABLE) verified to contain exact canonical code from embeddedSourceCode.ts
- Responsive -> verified at 320px, 375px, 768px, 1024px, 1280px, 1440px
  All 10 §13.2 checks pass at every breakpoint
```

---

## 17. Decision Tree

```
START
  |
  v
Read section 1 — confirm working directory is frontend/
  |
  v
[MANDATORY] Section 5 — TARGET LOCATION DISCOVERY
  Run the §5.5 checklist: identify category, position, type
  State your placement decision BEFORE writing any code
  |
  v
[MANDATORY] Section 11 — DEPENDENCY SAFETY
  Check package.json before any import that needs a new package
  |
  v
Does user say "remove" or "delete"?
  YES -> Follow section 9, then STOP
  NO
  |
  v
Does user say "replace X with Y"?
  YES -> Follow section 10, then STOP
  NO
  |
  v
ADD MODE (default)
  |
  v
Does the new component need a full-screen /demo/slug route?
  YES -> Also follow section 8 (create DemoPage + add route to App.tsx)
  |
  v
Section 6 — Step-by-Step Integration:
  Step 1  Understand the component
  Step 2  Create component file (apply §13 responsive patterns from the start)
  Step 3  Add React.lazy import to componentData.tsx
  Step 4  Append data entry to componentData.tsx array
  Step 5  Populate embeddedSourceCode.ts (MOST CRITICAL — feeds all 5 prompts)
           + componentMetadata.ts
           + antigravityPrompts.ts (manual override, optional, NO code — see §7.3)
           + lovablePrompts.ts (manual override, optional, NO code — see §7.3)
  Step 6  Sync MCP data: node mcp-server/scripts/sync-frontend-data.mjs
           + coverage: node mcp-server/scripts/check-source-coverage.mjs
           (publish to UI-HUB-MCP- happens later via ui-hub-github-sync-and-push — NEVER here)
  |
  v
Validate: npm run lint + npm run build (section 15)
  + prompt rendering check for all 5 prompts (section 7.4 & 15)
  + responsive check at all 6 breakpoints (section 13)
  |
  v
Report using section 16 format (location decision + prompt verification + responsive + new deps)
  |
  v
STOP — do not "clean up" or refactor unrelated code
```

---

## 18. Non-Negotiable Rules

1. ADD by default — never remove without explicit user instruction
2. **TARGET LOCATION DISCOVERY is mandatory (section 5)** — always identify category, position, and type before writing code; state the placement decision explicitly
3. **DEPENDENCY SAFETY is mandatory (section 11)** — check package.json before every install; prefer existing packages; never upgrade existing versions; record new deps in report
4. Surgical patches — never rewrite entire large files; find the target section and patch it
5. Preserve the array — the `componentData.tsx` array is the source of truth; never truncate it
6. Match the schema — always read the last 3 entries in the array before adding a new one to confirm field names
7. **embeddedSourceCode.ts is mandatory** — 100% exact source code must be present; it drives ALL 5 AI vibe prompts (ADVANCE, ANTIGRAVITY, CLAUDE CODE, CURSOR, LOVABLE)
8. **EXACT SOURCE CONSISTENCY (§7.3)** — manual prompt overrides MUST NOT contain, replace, truncate, or alter the component's implementation code. Code ONLY comes from embeddedSourceCode.ts.
9. **PROMPT RENDERING GUARANTEE (§7.4)** — Before considering integration complete, verify the ACTUAL FINAL GENERATED prompt strings for all 5 prompts (ADVANCE, ANTIGRAVITY, CLAUDE CODE, CURSOR, LOVABLE). Do not verify only source files/config. Verify the final generated text strings.
10. **Responsive (§13)** — every new component MUST pass all 10 checks at all 6 breakpoints (320px, 375px, 768px, 1024px, 1280px, 1440px+). Never hide the component on mobile to "solve" responsiveness.
11. Validate — always run `npm run lint` and verify prompt output after every integration
12. Report exactly — list placement decision, every file changed, new dependencies installed, confirm all 5 prompt strings verified, confirm responsive results at all breakpoints
13. **MCP DATA SYNC (Step 6)** — after every add/remove/replace, regenerate `mcp-server/src/data/` with `node mcp-server/scripts/sync-frontend-data.mjs` and confirm `check-source-coverage.mjs` passes. **Never push `mcp-server/**` inside this skill** — publishing to `UI-HUB-MCP-` is exclusive to the `ui-hub-github-sync-and-push` skill.

---

*End of UI-HUB Component Integration Skill*
