# UI HUB — Design System

How the interface is actually styled, and where the styling system contradicts
itself.

**This is not a component gallery.** It documents the token system, the styling
mechanism, and the defects that are verifiable from source.

---

## 1. The headline: Tailwind v4, with a v3 config that does nothing

`frontend/package.json` declares **`tailwindcss: ^4.1.14`**, loaded two ways
that agree with each other:

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
plugins: [ tailwindcss(), ... ]
```
```css
/* src/index.css, line 1 */
@import "tailwindcss";
```

That is the **Tailwind v4 CSS-first** pipeline. But the repo also contains
`frontend/tailwind.config.ts` — a **Tailwind v3** config: a JS object with
`content`, `theme.extend`, and `plugins`, in the shape v4 removed.

**There is no `@config` directive anywhere in the project.**

In v4, a legacy JS config is loaded *only* if CSS explicitly points at it with
`@config "../../tailwind.config.ts"`. Without that directive:

> ### `frontend/tailwind.config.ts` is entirely dead code.

Everything in it is inert: all 17 color tokens, all 12 `boxShadow` tokens, and
the `font-display` / `font-heading` / `font-serif` families. Nothing generates
those utilities. `../CONFLICTS.md` §15.

**This is the single most important fact in this document.** It means:

- To change the theme, edit **`src/index.css`**. Editing `tailwind.config.ts`
  changes nothing and produces no error, no warning, no diff in the build.
- Anyone reading `tailwind.config.ts` to learn the palette is reading a lie.
- A v3→v4 migration was started (CSS-first `@theme` exists) and abandoned
  partway, leaving the old config behind as a decoy.

**Verified absent:** `--color-background`, `--color-primary`, `--color-ring`,
`--color-ring-offset` — see §6.

---

## 2. Where the real tokens live

`frontend/src/index.css`, in three blocks.

### 2.1 `:root` — the dark theme (the default)

```css
--color-bg:           #0A0A0A
--color-surface:      #141414
--color-surface-alt:  #1C1C1C
--color-black:        #000000
--color-white:        #FFFFFF
--color-blue:         #3D5CFF   /* the single accent */
--color-blue-dark:    #2540D6
--color-red:          #FF3B30
--color-yellow:       #FFC700
--color-text-primary:   #FFFFFF
--color-text-secondary: #A3A3A3
--color-text-muted:     #6B6B6B
```

Plus a compatibility alias layer, where four generic names redirect to the
brutalist palette:

```css
--bg-primary:   var(--color-bg);
--bg-secondary: var(--color-surface);
--text-primary: var(--color-text-primary);
--text-secondary: var(--color-text-secondary);
--border-primary: #262626;
--brand-color: var(--color-blue);
```

> **Two naming systems coexist.** Components use both `--color-*` and the older
> `--bg-*` / `--text-*` names interchangeably. They agree today because the
> aliases are assignments, not copies — but they are two doors into the same
> room, and only the assignment path is safe to change.

### 2.2 `:root.light` — a light theme that is **unreachable**

```css
:root.light { --color-bg: #F5F5F7; --color-surface: #FFFFFF; ... }
```

A complete light palette, 14 tokens. **Nothing can activate it.** I searched
the whole frontend for any writer:

| Mechanism | Occurrences |
|---|---|
| `classList.add/remove/toggle('light')` | 0 |
| `data-theme` / `dataset.theme` | 0 |
| `prefers-color-scheme` in CSS | 0 |
| A theme toggle in any component | 0 |

`:root.light` is **dead CSS**. It looks implemented, is fully specified, and is
unreachable from the running app. `../CONFLICTS.md` §16.

> **The trap:** a future agent asked to "add a light-mode toggle" will find
> `:root.light` fully populated, wire up a `classList.toggle('light')`, and ship
> a toggle that half-works — because 24 `dark:`-variant elements (§3) will not
> respond to the class, only to the OS setting.

### 2.3 `@theme` — the Tailwind v4 token bridge

```css
@theme {
  --font-sans:    "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Orbitron", sans-serif;
  --font-heading: "Space+Grotesk", sans-serif;   /* ← broken, §4 */
  --font-seekuw:  "Seekuw", sans-serif;           /* ← never loaded, §4 */
  --color-brand-bg: #0A0A0A;  --color-brand-surface: #141414;
  --color-brand-surface-alt: #1C1C1C;  --color-brand-blue: #3D5CFF;
  --color-brand-blue-dark: #2540D6;  --color-brand-red: #FF3B30;
  --color-brand-yellow: #FFC700;  --color-brand-black: #000000;
}
```

`@theme` is what makes `bg-brand-blue`, `font-heading`, and friends exist as
utilities. This block — **not** `tailwind.config.ts` — is the live token source.

Note `--color-brand-*` duplicates `:root`'s `--color-*` values as literals, so
the palette is now written out **three times**: `:root`, `@theme`, and the dead
`tailwind.config.ts`.

---

## 3. Light/dark strategy is undefined

24 usages of the `dark:` variant exist in the frontend.

Tailwind v4's default `dark` strategy is `prefers-color-scheme` — the **operating
system** setting. And since v4 reads its config from CSS, and the CSS declares
no `darkMode`/custom variant, that default stands.

So the app has **two unrelated theme mechanisms fighting each other**:

| | Selector | Driven by |
|---|---|---|
| Token layer (most of the UI) | `:root` hardcoded dark | nothing — always dark |
| 24 `dark:`-variant elements | `prefers-color-scheme` | the **visitor's OS** |

**A visitor whose OS is in light mode gets 24 elements rendered in dark-variant
styling on top of an otherwise hardcoded dark page.** The app is not
light-mode-capable, but 24 elements are light-mode-*sensitive*.

The v3 config that would have set `darkMode: 'class'` is the dead file from §1.
The migration removed the strategy and never replaced it. `../CONFLICTS.md` §16.

---

## 4. Typography

### 4.1 22 font families are loaded

`frontend/index.html:93` requests **22 families in a single stylesheet**:

> Barlow Condensed · Bebas Neue · DM Serif Display · Source Serif 4 · Audiowide ·
> Bodoni Moda · DM Serif Text · Lilita One · Lobster Two · Montenegrin Gothic One ·
> Orbitron · Oswald · Pixelify Sans · **Inter** · Anton · Space Grotesk · Syne ·
> Cormorant Garamond · Playfair Display · Plus Jakarta Sans · Outfit · Space Mono

This is almost entirely because the **product is a component gallery** — the
demo components need to display many typefaces. The **site chrome** needs
essentially one: Inter, which is the `body` font (`index.html:102`) and
`--font-sans`.

**Only 3 of the 22 are wired into the app's own tokens** (`--font-sans` Inter,
`--font-display` Orbitron, `--font-heading`). The other 19 exist for rendered
component previews. That is a legitimate reason to load them — but it means
**font loading cannot be trimmed without checking every component preview**,
and the distinction between "site font" and "demo font" is not documented
anywhere.

`font-display: swap` and `preconnect` are set, so this degrades gracefully.

### 4.2 `--font-heading` is broken — 44 usages silently fall back

```css
--font-heading: "Space+Grotesk", sans-serif;
```

The `+` is a **URL-encoding artifact from the Google Fonts request**, pasted
into a CSS family name. The loaded family is `Space Grotesk` (with a space).
No font family is literally named `Space+Grotesk`, so **every `font-heading`
element falls back to `sans-serif`.**

The identical bug exists in both the CSS (`@theme`) and the dead
`tailwind.config.ts`, so it was copied, not a one-off typo. `font-serif` in
`tailwind.config.ts` does it correctly — `'"Source Serif 4"'` — which is how the
error survived: the author knew the rule once and missed it once.

**44 `font-heading` usages currently render in a generic sans-serif.** The fix
is one character (`+` → space), but it will visibly change 44 elements at once,
so it needs a deliberate decision, not a drive-by edit. `../CONFLICTS.md` §4.

### 4.3 `--font-seekuw` is never loaded

```css
--font-seekuw: "Seekuw", sans-serif;
```

`Seekuw` does not appear in the Google Fonts request, and no `@font-face` for it
exists. It is presumably a licensed font intended for local hosting that was
never added. Every usage resolves to `sans-serif`.

**No `--font-serif` is defined in `@theme` at all**, so the 63 `font-serif`
usages resolve to **Tailwind v4's built-in default serif stack** (ui-serif,
Georgia, …) — *not* the intended "Source Serif 4". The `'"Source Serif 4"'`
declaration exists only in the dead v3 config, where it has no effect.

Two custom classes, `.font-serif-heading` and `.font-serif-display`
(`index.css:21,25`), do apply serif faces — but they are hand-written CSS, not
`font-serif`. `../CONFLICTS.md` §4.

### 4.4 Font usage summary

| Token | Usages | Family | Status |
|---|---|---|---|
| `font-sans` | default `body` | Inter | Working |
| `font-display` | 31 | Orbitron | Working |
| `font-heading` | 44 | ~~Space+Grotesk~~ | **Broken → sans-serif** |
| `font-serif` | 63 | Tailwind default | **Wrong family** |
| `--font-seekuw` | — | Seekuw | **Never loaded** |
| `.font-serif-*` | — | serif CSS classes | Working |

---

## 5. The visual language: neo-brutalism

The design is **neo-brutalist**: near-black surfaces, one electric blue accent,
hard offset shadows with **zero blur**, and a squared-off feel.

### 5.1 Hard shadows, not glows

```css
.brutal-shadow-blue   { box-shadow: 4px 4px 0 0 #3D5CFF; }
.brutal-shadow-white  { box-shadow: 4px 4px 0 0 #FFFFFF; }
/* …red, yellow, black */
```

Small and large variants exist, and `.brutal-btn-primary` carries
`translate` + shadow changes across `hover`/`active` — **the shadow becomes the
press animation.** A button appears to sink into the page. That is the
signature interaction of the whole design.

**The `boxShadow` tokens named `glow-green`, `glow-green-md`, `glow-green-lg`,
and `neon` in `tailwind.config.ts` are already remapped to hard blue shadows**,
with the comment *"Re-route legacy brand-green to primary primary blue"*, and
`brand-green` is itself defined as `#3D5CFF`. The palette migrated green → blue
and the legacy names were kept as aliases.

**These aliases are all in the dead v3 config (§1), so none of them resolve.**
`shadow-glow-green` and friends are unused and unusable.

### 5.2 Implemented as hand-written CSS, not Tailwind

The brutalist layer is plain CSS classes in `index.css` (from line 237):
`.brutal-shadow-*`, `.brutal-btn-primary`, `.brutal-btn-outline`, and more.
`shadow-brutal-*` Tailwind utilities are used **0 times**.

**Practical consequence:** the brutalist design system is **not** themeable
through Tailwind tokens. It is a fixed CSS layer. Restyling it means editing
`index.css` directly, and Tailwind utilities cannot override it cleanly.

---

## 6. shadcn/ui: present, partially wired, silently inert

The project has the shadcn/ui **scaffolding but not its token set**.

Present: `@radix-ui/react-slot`, `clsx`, `tailwind-merge`,
`class-variance-authority`, and a correct `cn()` helper
(`src/lib/utils.ts` → `twMerge(clsx(...))`).
**Absent: `components.json`** — the shadcn CLI config, which is what records
where components live and which style to use. The install was done by copying
files, not by the CLI.

`src/components/ui/button.tsx` is a faithful shadcn button: `cva` variants
(`default`, and others; `size: default`), `Slot` for `asChild`, and
`cn()` merging.

### 6.1 But it references tokens this theme does not define

The shadcn `Button` ships with these classes:

```
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
ring-offset-background
```

This project defines **no** `--color-ring` and **no** `--color-background`.
Same story for the semantic classes used elsewhere:

| Class | Usages | Required token | Defined? |
|---|---|---|---|
| `bg-background` | 10 | `--color-background` | **No** |
| `text-foreground` | 6 | `--color-foreground` | **No** |
| `focus-visible:ring-ring` | 5 | `--color-ring` | **No** |
| `ring-offset-background` | 1 | `--color-background` | **No** |
| `border-input` | 1 | `--color-input` | **No** |

**23 usages of shadcn's default semantic tokens, none of which exist in this
theme.** In Tailwind v4 each resolves to `var(--color-background)` and similar —
an undefined custom property, which is invalid at computed-value time and falls
back to the property's initial value.

So, in practice:

- **10 `bg-background` elements render transparent.**
- **6 `text-foreground` elements inherit colour** instead of the intended one.
- **The Button's keyboard focus ring does not render at all** — 5 usages, and
  this is the accessible focus indicator for the primary button component.

> **Accessibility consequence, stated plainly:** the default `Button`'s focus
> ring silently does not exist. `:focus-visible` still matches and the browser
> may draw its own outline depending on `outline` resets elsewhere, but the
> designed indicator is absent. This is invisible in code review because the
> class names look correct — they are the shadcn defaults, faithfully copied
> into a theme that never defined them. `../CONFLICTS.md` §5.

**Nothing errors.** Tailwind v4 emits no warning for an unknown token, so this
class of bug is undetectable without comparing tokens to utilities.

---

## 7. `src/components/ui/` is not a design system

**~140 files live in `src/components/ui/`.** By filename, they are:

| Group | Examples | Count feel |
|---|---|---|
| Animated backgrounds | `MatrixRain`, `GalaxyButton`→no, `Tornado`, `BlackHole`, `Sky`, `OceanSwell`, `Lightfall`, `QuantumLattice`, `ParticleSphere` | the majority |
| Custom cursors | `MagicCursor`, `AuraCursor`, `HeartCursor`, `LizardCursor`, `VenomCursor`, `StarCursor`, `ParticleCursor`, `TargetCursor` | ~10 |
| Buttons | `GalaxyButton`, `GlowButton`, `LiquidFillButton`, `OrbitButton`, `creepy-button`, `rainbow-button`, `radial-glow-button`, `corner-button` | ~8 |
| Footers | `Footer`, `OmniflowFooter`, `SoraFooter`, `HaulFooter` | 4 |
| Loaders | `AuroraBpmLoader`, `ParticleLoader`, `GeneratingOrb` | 3 |
| **Genuine primitives** | `button.tsx`, `Toast.tsx`, `Skeleton.tsx`, `SearchBox.tsx`, `SectionHeader.tsx`, `NavBar.tsx`, `Footer.tsx`, `OtpCodeInput.tsx`, `Logo.tsx`, `ViewSourceButton.tsx` | ~10 |

**The folder is a mixed dumping ground.** A canvas-rendered particle background
sits beside the app's `Button`. There is no barrel file, no index, no
convention, and **no boundary between a reusable primitive and a one-off
diorama.**

Four near-duplicate footers exist. `Footer.tsx` and `HaulFooter.tsx` are both
`Haul`-branded. Which one renders is a page-level import decision, not a
documented rule.

**Consequence for future work:** "follow the existing component pattern" is not
answerable from this directory. The pattern *is* the catalogue in
`../features/FEATURES.md` — individual components are the product, and the
gallery, not the primitives, is what this repo is.

---

## 8. Animation and motion

- **`framer-motion` `^12.34.4`** and **`motion` `^12.34.5`** are both
  installed — the latter is framer-motion's successor name. Two packages, one
  capability, and **no evidence of a rule for which to use.** Both are in
  `package.json`, so neither is a stray transitive dep.
- **`lucide-react`** is the icon set.
- Interaction vocabulary: hard-shadow press, `translate` on hover, magnetic
  cursors, scroll-triggered reveals.

**Because the components are the product, "the animation library" is a
per-component decision, not an architectural one.** Standardising it is a
product decision with a large blast radius, not a cleanup.

---

## 9. Global CSS

`src/index.css`, 863 lines, and it is doing several jobs at once:

1. `@import "tailwindcss"` (v4 entry)
2. `:root` / `:root.light` token blocks
3. `@theme` bridge
4. `@layer base` — body and heading resets
5. Neo-brutalist utility classes (~line 237+)
6. Component-specific CSS (`.Logo.css`, `.CardsBeam.css`, `.ScrollExpand.css`,
   `.SolarSystem.css`, `.RubiksCube.module.css`)

Some files are co-located as separate CSS files; some are `*.module.css`
(`RubiksCube.module.css` — **the only CSS Module in the repo**). The convention
is not consistent, and `index.css` is imported once in `main.tsx`.

**`index.css` is the highest-risk file in the frontend for a "small" change**:
it holds the live theme, the `@theme` bridge, and the entire brutalist layer, and
a single edit can silently invalidate every utility in the app. See
`../rules/DO_NOT_CHANGE.md`.

---

## 10. Not documented here

| Area | Why | Phase |
|---|---|---|
| Per-component visual design | 137 components; the catalogue is the product | Never |
| Spacing/typography scales | Not systematised beyond Tailwind defaults | 5 |
| Breakpoint usage | No custom breakpoints found; defaults only | 5 |
| Contrast ratios | Needs computed analysis of rendered pairs | 5 |
| Icon usage consistency | `lucide-react` + inline SVG both used | 5 |
| Whether `dark:` elements are intentional | 24 usages, no design rationale found | Ask the owner |

---

# Phase 5 additions (2026-10-01)

## Phase 5 made no design-system changes

Zero CSS, HTML or theme files were touched. Token audit state from Phase 4
stands unchanged: **33/33** used colour classes resolve after `border-brand-dark`
was remapped to `border-brand-black`.

## DEFERRED - light mode is broken in production

Recorded so no future agent rediscovers it and so it is not mistaken for a Phase
5 regression.

**Symptom:** in light mode, **20** text nodes render black-on-black.

**Root causes** (both outside the token system):

1. `frontend/index.html` sets the body background via an inline `style` attribute
   applied late, overriding the stylesheet.
2. `frontend/src/index.css` hardcodes `html { background: #0A0A0A }`.

The theme context toggles a class, but the inline style and the hardcoded `html`
background win. Fixing it requires changing the background application order and
the hardcoded `html` rule.

**Why it was not fixed:** Task 5.23 explicitly excludes light-mode work from
Phase 5. Fixing it here would have meant editing exactly the two files Phase 5
was told not to touch, with no ability to verify the result in a real browser
session in this environment.

**Status: `DEFERRED`.** Owner should schedule it as its own task. The fix is
small but is a visual change that needs visual verification.

## Phase 5: the token system is not the source of the defect

Worth stating explicitly, because the failure looks like a token problem and is
not. Every colour utility class used in the codebase resolves to a declared token.
The light-mode failure is a CSS cascade and specificity problem, not a missing
token. Anyone fixing it should not start by editing `index.css` token blocks.
