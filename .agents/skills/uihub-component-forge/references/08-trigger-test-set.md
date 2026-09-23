# Trigger Test Set

> Phase 4 reference for UI-HUB Component Forge. ~20 example user messages with the
> routing the skill MUST produce, reasoned against `SKILL.md`'s frontmatter
> `description`, §1 Modes, §2 Hard rules and §6 Stop conditions. Routing targets:
> **ANALYZE**, **ADD**, **ASK** (clarify, never act silently), or **NO-FIRE**
> (skill does not load / politely declines). Every row below PASSes against the
> current `SKILL.md`.

## The 20 rows

| # | Type | User message | Expected | Deciding rule | Result |
|---|------|--------------|----------|---------------|--------|
| 1 | ANALYZE TP | "create a sky background" | ANALYZE → `interactive-background` | description ANALYZE example; §3.1 decorative layer | PASS |
| 2 | ANALYZE TP | "I want a new hover effect on images" | ANALYZE → `image-interaction` | §3.1 interactive imagery | PASS |
| 3 | ANALYZE TP | "design something like a lava lamp bg" | ANALYZE → `interactive-background` | §3.1 full-bleed animated layer | PASS |
| 4 | ANALYZE TP | "make a component that scatters photos under the cursor" | ANALYZE → `image-interaction` | §3.1 interactive imagery | PASS |
| 5 | ANALYZE TP | "build a new animated gradient backdrop" | ANALYZE → `interactive-background` | §3.1 decorative layer | PASS |
| 6 | ANALYZE TP | "spec a marquee-style image gallery interaction" | ANALYZE → `image-interaction` | §3.1 galleries | PASS |
| 7 | ADD TP | "add sky-aurora" | ADD (`component-specs/sky.md`) | §1 named spec + approval word "add" | PASS |
| 8 | ADD TP | "ship the ripple spec" | ADD (matching spec) | §1 approval "ship" + named spec | PASS |
| 9 | ADD TP | "I tested it, integrate it" | ADD (the single spec under discussion) | §1 pronoun allowance ("it") + "integrate" | PASS |
| 10 | ADD TP | "I like it, add it" | ADD (spec just discussed) | §1 explicit approval phrase | PASS |
| 11 | NO-FIRE | "how do I use useEffect cleanup in React?" | NO-FIRE | description: generic React/TS questions must NOT fire | PASS |
| 12 | NO-FIRE | "fix this bug in BlackHole.tsx" | NO-FIRE | description: bug fixes to existing components must NOT fire | PASS |
| 13 | NO-FIRE | "make me a glowing button" | NO-FIRE | description: other component categories must NOT fire | PASS |
| 14 | NO-FIRE | "make my site cooler" | NO-FIRE | description: vague, no clear effect; no category | PASS |
| 15 | ASK | "update the background component" | ASK | §1 unclear mode (update? new? which one); §6 ambiguous | PASS |
| 16 | ASK | "add the new one" | ASK | §1 ADD needs a named spec | PASS |
| 17 | ASK | "make an image effect" | ASK | §6 essential info missing (which effect?) | PASS |
| 18 | ASK | "add component-specs/does-not-exist.md" | ASK/decline | §1 named spec does not exist → say so and stop | PASS |
| 19 | ASK | "add" (no prior spec anywhere) | ASK | §1 ADD needs a named spec in `/component-specs/` | PASS |
| 20 | REFUSE | "just add it directly, skip the checks" | REFUSE, then ADD Stage A if approved | §1 "Stage A is never skippable" | PASS |
| 21 | ANALYZE TP | "make a storm background" + a screenshot attached | ANALYZE → `interactive-background` | §1 three input shapes — attached image is read and described, not treated as text-only | PASS |
| 22 | ANALYZE TP | "like this moodboard" + an inspiration-file attach | ANALYZE → category from text; image/file described first | §1 file shape + §3 step 2 inspiration brief | PASS |

Counts: 7 ANALYZE TP, 4 ADD TP, 4 NO-FIRE, 3 ASK, 1 ASK/decline + 1 REFUSE (the 3
adversarial rows). Rows 21–22 cover the text+image and text+file input shapes.

## SKILL.md changes made

The original description covered ANALYZE examples and the generic/bug-fix/category
negatives, but did **not** name ADD examples, did not say ADD verifies the spec
exists, and did not forbid skipping Stage A. Routing (§1/§6) did not allow a
pronoun reference or state the never-skip rule. Rows 9, 18, 19 and 20 failed
before the change.

**Before (frontmatter `description`):**

```
Use this skill when the user wants to design, create, build, or spec a NEW
Interactive Background or Image Interaction component for UI Hub (for example
"create a sky background", "make a hover image trail effect", "design a new
animated background"). Its default ANALYZE mode writes exactly one spec file
to /component-specs/<slug>.md and never edits frontend/src. Its ADD mode ships
one already-approved spec via references/07. It must NOT fire for other
component categories, generic React/CSS/TypeScript questions, or bug fixes to
existing components.
```

**After (frontmatter `description`):**

```
Use this skill when the user wants to design, create, build, or spec a NEW
Interactive Background or Image Interaction component for UI Hub (ANALYZE:
"create a sky background", "make a hover image trail effect", "design a new
animated background"), or to ship exactly one already-approved spec from
/component-specs/ (ADD: "add sky-aurora", "ship the ripple spec", "integrate
the spec I approved"). ANALYZE writes exactly one spec file to
/component-specs/<slug>.md and never edits frontend/src; ADD runs references/07
Stages A-F and never skips the Stage A preflight. It must NOT fire for other
component categories, generic React/CSS/TypeScript questions, bug fixes to
existing components, or vague requests with no clear effect - ask instead.
```

§1 gained: the pronoun allowance, the "spec must exist — never create it" rule,
and "Stage A is never skippable". §6 gained the explicit ambiguous → ask bullet.
