# Inspiration Research

> Phase 5 reference for UI-HUB Component Forge. Defines the **INSPIRATION** step
> that runs **before** the technical research playbook (`references/05`) in ANALYZE
> mode (`SKILL.md` §3 step 1). It answers "what should the effect *look and feel*
> like?", sourced from a user-provided image/file or from the web. The technique
> research step answers "how do we *code* it?". Load this doc whenever a new piece
> is classified into a category; skip it only in ADD mode.

---

## 1. Trigger

**Always runs in ANALYZE mode, for every request.** Technique research
(`references/05`) stays conditional; inspiration research does not — even a
plain-text prompt benefits from seeing real examples. The step is cheap (2–5
fetches max) and feeds spec section 2.5 (Inspiration Sources) and Step 6 (Design).

## 2. Input shapes

The ANALYZE trigger now accepts three shapes (`SKILL.md` §1):

| Shape | Example | What the AI must do |
|-------|---------|---------------------|
| a) Text only | "create a sky background, dreamy and pastel" | Run the no-image web path (§4). |
| b) Text + image(s) | user attaches a reference/screenshot alongside the request | **Look at the image** and describe it (§3) — this becomes the primary brief. |
| c) Text + file | user attaches a doc/inspiration link/moodboard file | Read the file, extract the mood/links it points to, describe them. |

**Hard rule:** if an image or file was attached, the AI must actually read/describe
it before designing anything. Never proceed as if the request were text-only when
visual input was given. A one-file "moodboard" screenshot is the same thing as an
image — describe its contents, do not silently ignore it.

## 3. Image provided

Describe the image in concrete visual terms and treat that description as the
**primary brief** — everything else (house style, technique) supports it:

- **Palette:** dominant and accent colours (name them or note "muted/neon/pastel").
- **Motion implied:** static still, or does it suggest drift, pulses, streaks,
  parallax, turbulent flow? Note speed (slow/languid vs energetic/choppy).
- **Mood:** calm, ethereal, dramatic, playful, ominous, futuristic — 2–3 words.
- **Density/complexity:** sparse and minimal vs busy/layered; element scale.
- **Light source:** where light comes from (top gradient, rim glow, hard shadows).

Set these into `Mood / palette / motion` in spec section 2.5. The rest of the
spec (§3 house style, §4 references, §5 technique) is chosen to realise this brief.

## 4. No image — web search

Search for visual references matching the prompt's mood/subject. Look at **3–5
results** (search snippets, then fetch the 2–3 best). Example queries:

- "sky background animation inspiration"
- "dreamy pastel gradient ui examples"
- "codepen aurora effect"
- "rain on glass background motion"

Search the **look**, not the technique — technique queries belong to
`references/05`.

### Source tiers (inspiration — different from technique tiers)

1. **CodePen / CodeSandbox / Dribbble / Awwwards-style galleries** — real working
   effects and motion, most useful.
2. **Design-inspiration sites** (curated screenshots/moodboards).
3. **General image search** — fine for collecting a mood, weakest for motion.

Skip generic stock-photo sites — they show stills, not motion or implementation.

## 5. Budget

- **2–5 searches / image fetches** for inspiration, *separate* from the 3–8 budget
  for technique research in `references/05` §4.
- **Total research budget across both steps: cap at 10 fetches** per spec. If the
  inspiration step is near its limit and the technique step still needs budget,
  spend where the uncertainty is higher and say so.
- Stop as soon as the brief (palette, mood, motion character, one link) is formed.

## 6. Output of this step

A short **Inspiration brief** that feeds Step 6 (Design) and is written into
section 2.5 of the spec:

- **Mood / palette / motion:** 2–3 words each.
- **Density / complexity level:** sparse · moderate · layered.
- **Image provided:** `yes` (one-line description of what it showed) or `no`.
- **Reference links found (if any):** 1–2 URLs that best match, and for each,
  *what specifically was borrowed* — palette, layout, motion style. **Never code.**

## 7. Copyright guard

- **Describe, don't copy.** Never scrape or reproduce copyrighted images or code
  from inspiration sources. An inspiration link informs the *look*; the technique
  step (`references/05`) and the house-style analysis still govern the *code*.
- Do **not** paste third-party code from a gallery result into the spec — the
  standalone block must be original code (`references/05` §5).
- If a link leads to a technique you end up borrowing, still cite it as a `Source:`
  line in §5 of the spec, not just here.