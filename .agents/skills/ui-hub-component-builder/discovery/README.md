# Discovery — UI HUB Unique Idea & Category Discovery

Phase 2 of the Ui-Hub Component Builder skill. This is a **research-only**
artifact: it maps the 2025–2026 web UI ecosystem against UI HUB's existing
registry and proposes ideas, potential new categories, whitespace, and a
shortlist. **No component is built, no dependency is installed, no registry
entry is created. No final selection is made. Research ends here — see `discovery-report.md` (§24 stop condition).**

## How this folder works

| File | What it answers |
|---|---|
| `research-sources.md` | What did I look at? Every source (URL + date + confidence; fact vs interpretation). |
| `ecosystem-analysis.md` | What are the two layers (reusable registries vs one-off showcase) and what drives them? |
| `existing-vs-missing.md` | What UI HUB already covers vs what the ecosystem shows is missing here. |
| `candidate-ideas.md` | 30 candidate ideas (31 rows; L1 = recorded non-candidate) with saturation class + UI HUB novelty + research dimensions. |
| `emerging-techniques.md` | 9 techniques that will define the next component wave (maturity, browser support). |
| `new-categories.md` | Category proposals **derived from evidence**, not pushed top-down. |
| `whitespace-analysis.md` | Quadrant analysis: saturated vs open, by UI HUB category. |
| `feasibility-analysis.md` | Stack fit, dependency decisions (incl. flagged borrowings), perf/a11y burden. |
| `shortlist.md` | 5–8 concepts, **unranked**, grouped by characteristic. |
| `discovery-report.md` | Executive summary + Phase 2 Completion Report A–K. Read this first. |

## Grounding (read before judging any claim)

- Registry ground truth: `frontend/src/data/componentData.tsx` (category union
  at `:2632`). Phase 1 verified the interactive-background / interactive-image
  legs. This discovery run additionally census'ed the **`text`, `cursor`,
  `effect`, `3d`, `scroll`** legs from the same file — several assumptions made
  earlier in the session were corrected against that census.
- Phase 1 knowledge base tommes (this discovery compares against it, never
  duplicates it): `../SKILL.md`, `../agent-memory.md`, `../taxonomy.md`,
  `../source-map.md`, `../capability-matrix.md`,
  `../interactive-background/{SKILL,implementations,patterns,techniques}.md`,
  `../interactive-image/{SKILL,implementations,patterns,techniques}.md`.
- Stack constraints (do not violate): React 19 / TS / Vite 6 / Tailwind v4 /
  `framer-motion|motion` ^12 / `gsap` ^3 (+ScrollTrigger) / `three` ^0.183 /
  Canvas2D / raw WebGL / SVG. No WebGPU, no `simplex-noise`, no R3F
  (unregistered `CloudScroll/` is the only R3F demo), no new installs without
  justification (`../feasibility-analysis.md`).

## Classification vocabulary (used consistently)

- **Saturation class**: `Existing/Saturated`, `Emerging`, `Underrepresented`,
  `Novel Combination`, `Experimental`.
- **UI HUB novelty**: `Existing` / `Variation` / `New interaction` / `New category`.
- **Language discipline**: hedged ("appears underrepresented", "few first-party
  reusable components observed in the surveyed registries") — never "nobody
  has built this".
- All claims carry a source (`research-sources.md` id, e.g. `[S7]`).

## Files authored 2026-09-19

`README.md` · `research-sources.md` · `ecosystem-analysis.md` ·
`existing-vs-missing.md` · `candidate-ideas.md` · `emerging-techniques.md` ·
`new-categories.md` · `whitespace-analysis.md` · `feasibility-analysis.md` ·
`shortlist.md` · `discovery-report.md`.