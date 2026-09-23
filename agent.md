ADD-ON TASK for uihub-component-forge skill.
Skill root: .agents/skills/uihub-component-forge/
Scope: extend ANALYZE mode only. No changes to ADD mode (Stages A-F stay as is).
Do not touch frontend/src.

GOAL
Right now ANALYZE only researches TECHNIQUE (how to code an effect). Add a second,
earlier research step: INSPIRATION — what the effect should actually look and feel
like — sourced from the internet and, optionally, from an image or file Jainil
provides directly in the prompt (e.g. "make it look like this image" or a moodboard
screenshot).

--- TASK 1: accept multi-input requests ---
Update SKILL.md's ANALYZE trigger rules to recognize three input shapes, not just text:
  a) Text only — "create a sky background, dreamy and pastel"
  b) Text + image(s) — user attaches a reference image/screenshot alongside the request
  c) Text + file — user attaches a doc/inspiration link/moodboard file
State explicitly: if an image or file is attached, the AI must actually look at it
(describe what it shows) before designing anything — never proceed as if it were
text-only when visual input was given.

--- TASK 2: new reference doc — references/09-inspiration-research.md ---
Define the INSPIRATION step (runs BEFORE step 5 research-playbook, which stays
purely technical). It must specify:
  - Trigger: always runs in ANALYZE mode, for every request (technique research
    stays conditional, inspiration research does not — even a plain-text prompt
    benefits from seeing real examples)
  - If an image was provided: describe it in concrete visual terms (palette, motion
    implied, mood, density, light source) and treat that description as the primary
    brief — everything else supports it
  - If no image: search the web for visual references matching the prompt's mood/
    subject (e.g. "sky background animation inspiration", "dreamy pastel gradient
    ui examples", "codepen aurora effect"). Look at 3-5 results.
  - Source tiers for inspiration (different from technique tiers): 1) CodePen/
    CodeSandbox/Dribbble/Awwwards-style galleries showing real working effects,
    2) design inspiration sites, 3) general image search results. Skip generic
    stock photo sites — they don't show motion or implementation.
  - Budget: 2-5 searches/image fetches for inspiration, separate from the 3-8
    budget for technique research in 05. Total research budget across both steps:
    cap at 10 fetches so ANALYZE doesn't run away.
  - Output of this step: a short "Inspiration brief" — palette, mood words, motion
    character, density/complexity level, and (if found) 1-2 links to real examples
    that best match. This feeds directly into Step 6 (Design) in the main workflow.
  - Never copy an implementation from a gallery result verbatim — inspiration
    informs the LOOK, the technique step + house-style analysis still governs the
    CODE.

--- TASK 3: update SKILL.md pipeline ---
Insert the new step into the ANALYZE pipeline (right after "classify category",
before "read category doc"):
  classify category → INSPIRATION RESEARCH (09) → read category doc → pick
  reference components → TECHNIQUE research (05) → design → write spec (06) →
  self-check
Keep SKILL.md under 130 lines — trim elsewhere if this pushes it over.

--- TASK 4: update spec template ---
references/06-spec-output-template.md: add a new section 2.5, "Inspiration sources"
right after "Visual intent":
  - Mood/palette/motion words
  - Image provided? (yes/no) — if yes, one-line description of what it showed
  - Reference links found (if any), with what specifically was borrowed (palette,
    layout, motion style — never code)
This makes the section count 14 → 15. Update validate-spec.mjs's section-order
check to match the new count and order. Update the worked example in 06 to include
this section filled in for the sky.md case.

--- TASK 5: retrofit sky.md ---
Regenerate component-specs/sky.md with the new section included, sourced honestly
(if no image was given for sky, do a real inspiration search now and fill it in for
real, don't fabricate). Re-run validate-spec.mjs, confirm pass.

--- TASK 6: dry run with an image ---
If Jainil has NOT attached a test image, skip this and note it as pending. If he has,
run a full ANALYZE pass using it as the primary inspiration source and report how
the "Image provided" path behaved.

--- CONSTRAINTS ---
- ANALYZE mode still writes to /component-specs/ only — inspiration research never
  triggers a write anywhere else.
- Never scrape/reproduce copyrighted images or code from inspiration sources —
  describe them, don't copy them.
- Total research budget (inspiration + technique) capped at 10 fetches per spec.

--- END OF OUTPUT: print this summary ---
ADD-ON SUMMARY
1. SKILL.md: how the 3 input shapes (text/image/file) are now handled
2. references/09-inspiration-research.md: written — paste the trigger + budget rules
3. Updated ANALYZE pipeline order (paste it)
4. Spec template: new §2.5 confirmed, section count now 15, validator updated
5. sky.md retrofit: inspiration brief content + validator result
6. Image dry run: ran or pending (and why)
7. Files created/modified
8. Anything unresolved