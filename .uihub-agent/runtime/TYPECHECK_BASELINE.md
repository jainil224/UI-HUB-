# Frontend Typecheck Baseline

Phase 6, task 6.21. Records the known-failing frontend typecheck so it is visible
and attributable, not silently removed.

## Measured state (Phase 6, 2026-10-01)

| Command | Result |
|---|---|
| `cd frontend && npm run build` | **PASS** |
| `cd frontend && npm test` | **PASS** — 27/27 |
| `cd frontend && npm run lint` (`tsc --noEmit`) | **FAIL** — 61 errors across 23 files |

The Vite build succeeds because Vite transpiles without type-checking. The
production bundle therefore builds correctly despite the type errors.

## Attribution

**These errors predate Phase 6. Phase 6 introduced none of them.**

Phase 6 changed no frontend source file. The only frontend-adjacent work was
adding `src/routing/vercelRouting.test.ts` assertions already present, and no
frontend `.ts`/`.tsx` file was edited. The errors originate from earlier UI
commits.

## Dominant pattern

The majority are `TS2339` on an error-boundary component:

```
src/pages/LibraryPage/sections/ComponentDetail/index.tsx(894,18):
  error TS2339: Property 'state' does not exist on type 'PreviewErrorBoundary'.
```

`PreviewErrorBoundary` is a class component, and `state`, `setState` and `props`
are not resolvable on its type. This is a typing gap in that one component's
usage, not a widespread architectural problem — the build output is unaffected.

## CI treatment

The `typecheck-frontend` job is kept and marked `continue-on-error: true`, with a
`needs: [security-scan]` dependency so it cannot be silently skipped.

**Why not delete the job (task 6.20 forbids removing it):**

- Removing it loses the ability to observe whether the error count is growing.
- Adding `// @ts-nocheck` or loosening `tsconfig` would convert a visible
  failure into invisible type safety loss.
- Blocking on it would block all unrelated work on a pre-existing defect.

The job name states the expectation: `Typecheck — frontend (known-failing,
non-blocking)`.

## How to retire it

When someone fixes the errors:

1. Remove `continue-on-error: true` from `typecheck-frontend` in
   `.github/workflows/ci.yml`.
2. Rename the job to `Typecheck — frontend`.
3. Delete this file, or record the new baseline here.
4. Note the change in `.uihub-agent/CONFLICTS.md`.

Phase 6 deliberately did **not** fix these errors: task 6.21 states they should
not be fixed in Phase 6 unless they directly block the CI architecture, and they
do not.

## Related

- `../../.github/workflows/ci.yml` — job definitions
- `../SECURITY_VALIDATION.md` — how each job maps to a concern
- `PRODUCTION_BASELINE.md` — measured production state
- `UNKNOWN_REGISTER.md` — open questions