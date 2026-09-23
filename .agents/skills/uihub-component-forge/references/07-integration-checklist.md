# Integration Checklist — ADD mode (Stages A–F)

> **Ownership split:** the Forge owns analysis, the spec and the edit plan;
> `ui-hub-component-integration` is the gate that applies it. If the two ever
> disagree, the integration skill wins.

ADD mode turns **one approved spec** into **one shipped component**. It loads this
file and nothing else it does not need. It never re-designs: if the spec is wrong,
stop and go back to ANALYZE to revise the spec.

Every stage has an explicit **abort condition**. On abort: perform Stage E rollback,
then report why. Never continue past a failed abort condition.

The spec's `§12 Integration Preview` is the machine-checkable edit plan. Each edit is
`{ file, anchor, operation, payload, why }` with `operation` one of `insert-after`,
`insert-before`, `create-file`. No line numbers anywhere; every anchor must match
exactly once. `payload` is either verbatim text or the token `§8` (the §8b
project-integrated code block — the §8a fence when §8b says "Identical to 8a") /
`§8a` (the standalone drop-in block) / `§7` (the props table).

---

## STAGE A — PREFLIGHT (read-only; aborts before ANY write)

Run every check. Writes nothing.

| # | Check | Abort if |
|---|-------|----------|
| A1 | Spec file exists at `component-specs/<spec>.md`. | missing |
| A2 | `node .agents/skills/uihub-component-forge/scripts/validate-spec.mjs component-specs/<spec>.md` exits `0`. | non-zero |
| A3 | The user explicitly approved *this* spec in the conversation (words such as add / ship / integrate / "I like it, add it"). | approval is assumed or vague |
| A4 | Proposed slug is unused in `frontend/src/data/componentData.tsx`, `frontend/src/data/componentMetadata.ts`, and `data/component-index.json`. | any collision |
| A5 | The target component file from §12 (`create-file`) does not already exist. | it exists |
| A6 | Every `insert-after` / `insert-before` anchor in §12 resolves to exactly one match in its file (validate-spec already proves this; re-confirm on the live tree). | zero or 2+ matches |
| A7 | `git status --porcelain` is clean, **or** every dirty path is skill/spec scaffolding under `.agents/skills/` or `component-specs/`, **or** the user explicitly accepts the remaining paths. | unrelated uncommitted app code without acceptance |

**A7 detail.** Scaffolding paths (`.agents/skills/**`, `component-specs/**`) are never part
of a component's registration diff, so they are auto-accepted. Any other dirty path is
"unrelated app state" and requires explicit human acceptance. `scripts/preflight.mjs`
implements exactly this filter (it parses `git status --porcelain`, strips status/rename
noise, and reports the unrelated paths).

**A8 — Rollback manifest (recorded, not written to the repo).** List every file the run
will touch, marking each `new` (will be created) or `modified` (will be edited), plus a
copy of each `modified` file's current bytes. Keep it outside the repo (temp dir).

**Abort:** any of A1–A7 fails, or the manifest cannot be recorded. Stop; no writes.

---

## STAGE B — COMPILE GATE

Write the component file from **§8b** (the project-integrated block) **first, alone**,
before any registry edit.

1. Create `frontend/src/components/ui/<PascalName>.tsx` verbatim from §8b.
2. From `frontend/`, run `npx tsc --noEmit`.
3. On failure: fix in place (≤ 3 attempts). After the 3rd failure, delete the file
   and abort.

**Abort:** `tsc` still failing after 3 attempts. A component that does not compile
never reaches the registry.

---

## STAGE C — REGISTER (apply §12 edits in this FIXED order)

Apply each edit by exact anchor match, in order:

1. **Component file** — already created in Stage B (skip; do not recreate).
2. **`componentData.tsx` — `React.lazy` const.**
3. **`componentData.tsx` — `UI_COMPONENTS` map entry.**
4. **`componentData.tsx` — `componentList` `ComponentItem`.**
5. **`componentMetadata.ts` — `COMPONENT_CONFIG` entry** (props must match §7).
6. **`embeddedSourceCode.ts` — full source** keyed by slug.
7. **`data/component-index.json` — index entry** (scan only refreshes derived fields;
   it never adds entries, so this is authoritative and manual).

**Anti-drift rule (mandatory).** For the lazy + map edits, state all three names in the
edit's `why`: the lazy key **must equal** the slug, the imported export name **must
equal** the file's default export, and the file name must match. `file ≠ export ≠ slug`
is a hard failure.

**Abort:** any anchor matches zero or 2+ times. Stop and roll back. Never apply a
partial set — the registry must never be left half-edited.

---

## STAGE D — VERIFY

1. From `frontend/`, `npx tsc --noEmit` exits `0`.
2. From `frontend/`, `npm run build` succeeds (`build` = `vite build` in
   `frontend/package.json`).
3. Re-run `node .agents/skills/uihub-component-forge/scripts/scan-components.mjs`; the
   index must now contain the new component with the correct `category`, `props`,
   `stylingMethod` and `animationTech`. There is **no `tier` field** — the old "tier"
   concept is expressed as `stylingMethod` + `animationTech`.
4. Grep-assert the slug appears in exactly the expected number of places (component
   file, lazy const, map key, `componentList` id, `COMPONENT_CONFIG` key,
   `EMBEDDED_SOURCE_CODE` key, index `slug`).
5. Confirm `renderComponent('<slug>', '<Title>')` resolves: trace the code path
   (`UI_COMPONENTS` key → lazy import → default export) and say how.

**Abort:** any check fails → Stage E, then report.

MCP mirroring (`mcp-server/scripts/sync-frontend-data.mjs` + `check-source-coverage.mjs`)
belongs to `ui-hub-component-integration`. Run it locally only, never push.

---

## STAGE E — ROLLBACK (usable at ANY failure point)

Reverse the Stage A manifest exactly:

1. **Delete** every file marked `new` (e.g. the component `.tsx`).
2. **Restore** every file marked `modified`: use `git checkout -- <path>` when the tree
   was clean at Stage A; otherwise restore the manifest copy byte-for-byte.
3. Re-run `npx tsc --noEmit` to confirm the tree is back to its pre-run state.

Rollback must not depend on the failed run having finished.

---

## STAGE F — REPORT

Report: files touched (new vs modified), slug, category, "tier" as
`stylingMethod` + `animationTech`, validator/tsc/build results, the grep-assert counts,
and what the user should check in the browser. If Stage E ran, report the rollback
result instead.
