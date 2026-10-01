# Phase 6 Changes

Phase 6 — Security, Configuration & Agent-Governance Hardening.
Runtime counterpart: `../agent.md`. Full analysis lives in
`../infrastructure/`, `../security/`, `../rules/` and `../tasks/`.

No production data, dashboard setting, credential or Render/Vercel configuration
was changed.

---

## 1. What was actually wrong

Phase 6 opened with four claims from Phase 5. Each was verified against source
before anything was changed, and **three of the four turned out to be understated**:

| Claim | Finding |
|---|---|
| "CORS is not enforcing" | **Worse than described.** The allowlist was *only* an `Access-Control-Allow-Origin` response header; the origin callback returned `true` unconditionally, so the server answered every request and simply omitted the header. The allowlist never gated anything. |
| "Docs advertise unreachable endpoints" | Confirmed for the Vercel `/mcp` URL. The CLI was *not* broken — only a human-readable prompt string was stale. |
| "Secrets can resemble placeholders" | Confirmed. The Phase 5 finding was placeholder-*shaped* and would have passed naive placeholder detection. |
| "`.uihub-agent/` and `.github/` can become untracked" | Confirmed. `git ls-files .github` returned **nothing** — the workflow existed only on disk. |

---

## 2. CORS — the only behavioural code change

### `backend/src/config/corsPolicy.js` (new)

Single source of truth for the web API. Exact-match origin comparison, environment
values **union** with built-in defaults, angle-bracket placeholders stripped, a
missing/non-sendable `Origin` allowed (CLI and server-to-server callers send
none), and no wildcard subdomain matching — `https://attacker.vercel.app` must not
be admitted by `https://*.vercel.app`.

### `mcp-server/src/config/corsPolicy.ts` (new)

Deliberately a **separate** module with its own defaults. Sharing one policy would
couple two services that are deployed, scaled and rotated independently, and would
mean editing one deployment's allowlist to fix the other's.

### Wiring

- `backend/src/server.js` — CORS resolved from the policy module
- `mcp-server/src/index.ts` — same, for the MCP server

### Tests

| Suite | Count | Approach |
|---|---|---|
| `backend/tests/cors.test.js` | 25 | Real `cors` middleware over a real socket: an ephemeral Express listener driven by `fetch` |
| `mcp-server/tests/cors.test.ts` | 17 | `supertest` against the real app |

A configuration-shape test would have passed against the Phase 5 code, because the
defect was a runtime decision inside the origin callback. Both suites drive real
requests and assert on actual response headers.

**Legacy-behaviour proof.** The Phase 5 policy was reconstructed and run against
the same harness: **7 of 7** hostile origins were accepted —
`https://attacker.vercel.app`, `https://localhost.attacker.example`,
`https://evil.example/?localhost`, `not-a-url` and others. All are now rejected.

---

## 3. Secret scanning

`.uihub-agent/scripts/secret-scan.mjs`

**Scope is git-visible files** (`git ls-files --cached --others --exclude-standard`).
An earlier draft walked the filesystem and reported `backend/.env` and
`backend/service-account.json` as leaks. Both are correctly gitignored local files
that *should* contain real credentials. A leak is a secret that is committed or
about to be committed.

**Detectors:** `mongodb-uri`, `aws-access-key-id`, `aws-secret-access-key`
(context-anchored), `private-key` (header **and** footer), `private-key-header`,
`firebase-service-account`, `razorpay-key`, `github-token`, `slack-token`,
`stripe-webhook-secret`, `google-api-key`, `sendgrid-key`, `bearer-token`,
`smtp-credential`, `vapid-private-key`.

**Classes:** `REAL_SECRET` (fails) · `PLACEHOLDER` · `MASKED` · `PUBLIC_IDENTIFIER`
· `TEST_FIXTURE` · `FALSE_POSITIVE`.

**Output never contains the matched value** — only path, line, detector, type, a
SHA-256 fingerprint prefix and a length.

**Two false-positive classes were found by running it against this repository,
not by reasoning about it:**

1. The Firebase **web** `apiKey` in `frontend/src/main.tsx` is credential-shaped
   and not a secret — it ships to every browser by design. Classified
   `PUBLIC_IDENTIFIER`, and **only** under `frontend/`; the same prefix in
   server-side code is a `REAL_SECRET`.
2. A redacted historical URI in `rules/DO_NOT_CHANGE.md` (`uihub_backend:<ellipsis>@…`)
   was reported as `REAL_SECRET` with `len:1`. Correcting the scanner was right;
   deleting accurate documentation to satisfy a scanner is how a gate starts being
   bypassed. The fix accepts a true ellipsis character or `...` — deliberately
   **not** a single `.`, because JWTs contain dots and would have been suppressed.

**Verification.** A synthetic fixture with a realistic MongoDB password, an
`AKIA…` key, a 40-char AWS secret, a full PEM key and a Stripe webhook secret
produced **5/5 `REAL_SECRET`, exit 2**, while `<password>`, `xxxxxxxx` and the
redaction notation classified as `PLACEHOLDER`/`MASKED`. A JWT-style bearer token
was re-tested after the ellipsis fix and is still detected. The real repository
scans clean (exit 0).

---

## 4. Tracking hygiene

`.github/` was removed from `.gitignore`, with an inline comment so it is not
silently re-added by someone tidying the file.

`.uihub-agent/scripts/check-tracking.mjs` encodes 22 rules: knowledge base and
`.github/` trackable, `.env`/`service-account.json` still ignored,
`.env.example` tracked, `backend/dist`/`frontend/dist` ignored,
`mcp-server/dist`/`cli/dist` intentionally tracked, personal tooling still
ignored, and `mcp-server/dist` consistent between disk and index.

**The validator was verified to fail.** Re-adding `.github/` to `.gitignore`
produced `[FAIL] ci-trackable`; the file was then restored byte-identical.

---

## 5. Generated-artifact freshness

`.uihub-agent/scripts/check-generated.mjs` rebuilds `mcp-server` into a temporary
directory and compares the entire tracked `dist` tree. It never writes to the
repository, so it is safe to run before any publish step.

**Sourcemaps are compared semantically.** `tsc` records the relative path to the
source, so a map built in `dist/` reads `../../src/config/env.ts` while the same
map built to a temp directory reads `../../../../<abs>/…`. Byte comparison would
report every sourcemap as stale on every run. `mappings`, `names` and
`sourcesContent` must still match exactly.

**Real finding:** `mcp-server/dist/data/` in `HEAD` did **not** match
`mcp-server/src/data/`. The committed copy was stale and a rebuild corrected it.
The cause: CI ran `npm run build` and then restored the committed dist, so nothing
ever compared the two. Current state: `tracked=83 fresh=83` → `FRESH`.

---

## 6. Validator defects found and fixed during Phase 6

These were found by running the validators, and each fix is a change in what the
validator *asserts*, not a suppression:

| Validator | Defect | Fix |
|---|---|---|
| `check-config` | CSP `connectSrc` compared by string equality, so `http://localhost:*` was reported as blocking `http://localhost:5173` and `:3000` — a **false positive**; browsers apply source-expression matching | Implemented `cspAllows()` with scheme/host/port-pattern matching, including `*` and `*.host` |
| `check-config` | `csp-extra-origins` used `cond ? 'CONSISTENT' : 'CONSISTENT'` — a hard-coded status | Reclassified: `https://api.razorpay.com` in CSP but not in CORS defaults is **correct**, not a conflict. Third-party API endpoints must be in CSP and are correctly absent from an origin allowlist |
| `check-config` | `nonOriginSources` regex matched across newlines, emitting garbage | Restricted to single-line tokens |
| `check-docs` | Traversed `.uihub-agent/` twice (`mdFiles('.')` already recurses into it), reporting every finding twice | De-duplicated |
| `check-docs` | Flagged `ui-hub.onrender.com` as a live assertion in `PRODUCTION_DEPLOYMENT_GATE.md:55` and `UNKNOWN_REGISTER.md:371` | Added block-level evidence detection. Both lines sit inside blocks that report an **observation** ("Its value is …", "Status: ANSWERED - YES", "the value baked into the live bundle"). Rewriting them would have falsified evidence *and* made the owner instruction wrong — telling an owner to delete a variable that does not hold that value. Now **0 drift** |
| `check-docs` | Flagged its own rule text ("no document may claim `.env.example` contains a live secret") as the error | Added negation handling |
| `secret-scan` | Redaction notation reported as a real secret | Narrow ellipsis/bracket-redaction rule |

`check-config` still exits 1. That is deliberate: the remaining four findings are
real and awaiting owner decisions.

---

## 7. Documentation corrections

| File | Claim | Correction |
|---|---|---|
| `MCP.md` | Vercel `/mcp` serves MCP | Removed. `vercel.json` has no `/mcp` rewrite; it resolves to the SPA shell |
| `.uihub-agent/rules/DO_NOT_CHANGE.md:48` | "`.env.example` **is tracked and contains** a live credential" | **False in the present tense.** The file is placeholder-only. The real URI **is** in git *history*, confirmed with `git log --all -p -- backend/.env.example`. Rewritten to separate the two, which are different facts with different consequences |
| Two documents | Wrong CSP line citations | Corrected against `backend/src/server.js` |
| `cli/src/commands/login.ts` | Implies the CLI endpoint is broken | It is not. `cli/src/config.ts:5` correctly defaults to `https://ui-hub-mcp.onrender.com/mcp`; only the prompt hint names the stale host. Logged as OD-05 rather than "fixed" by guessing |

---

## 8. CI architecture

`.github/workflows/ci.yml` rewritten from 4 combined jobs to **9 jobs across 4
dependency tiers**. Every tier-2 job declares `needs: [security-scan]`, so a commit
containing a secret cannot be built, tested or published on the strength of a
passing test run.

```
security-scan (secrets → tracking)
   ├── knowledge
   ├── config-drift        (continue-on-error)
   ├── generated
   ├── build-{frontend,mcp,cli}
   ├── test-{backend,mcp,cli,frontend}
   └── typecheck-frontend  (continue-on-error)
```

`needs:` is used rather than steps inside one job because a sequential job cannot
express "the secret scan gates the build".

**Two non-blocking jobs, neither a way of hiding a failure:**

- `config-drift` — reports **4 real CONFLICTs**. Blocking would mean silencing
  true findings until an owner acts.
- `typecheck-frontend` — **61 errors across 23 files**, all pre-existing. Phase 6
  changed no frontend source. Kept visible so the count can be tracked rather than
  deleted. Baseline in `runtime/TYPECHECK_BASELINE.md`.

---

## 9. Knowledge-base updates

| File | Change |
|---|---|
| `AGENT.md` | New §2.1 **State and source precedence** and §2.2 **Recording a conflict** |
| `rules/DO_NOT_CHANGE.md` | §1 corrected; §7 gained the **freshness classification** table (Generated / Semi-automatic / Manual) |
| `rules/PROTECTED_PATHS.md` | New — path risk classes with pre/post-change checklists |
| `infrastructure/TRACKING_MODEL.md` | New — the tracking decision and why |
| `infrastructure/GENERATED_ARTIFACTS.md` | New |
| `infrastructure/CONFIGURATION_OWNERSHIP.md` | New |
| `infrastructure/DEPLOYMENT_CONFLICTS.md` | New |
| `APIs/CORS_CONTRACT.md` | New |
| `security/SECURITY_OVERVIEW.md` | New |
| `security/SECRET_HANDLING.md` | New |
| `security/SECURITY_VALIDATION.md` | New |
| `tasks/OWNER_DECISIONS.md` | New — OD-01 … OD-12 |
| `runtime/DOCUMENTATION_ENDPOINT_AUDIT.md` | New |
| `runtime/TYPECHECK_BASELINE.md` | New |
| `runtime/PHASE_5_CHANGES.md` | Phase 5 report, committed |
| `PROJECT_MAP.json` | Regenerated — 572 tracked files scanned |

The precedence rule exists because Phase 6 nearly repeated a Phase 5 error. "The
repository is the source of truth" is about **code**; it does not settle what is
true about **deployed** systems. Code behaviour, committed artifacts and deployed
state are three separate sources, and a past observation outranks present
inference while being un-correctable in place.

---

## 10. Final measurements

| Gate | Result |
|---|---|
| Backend tests | **79/79** |
| MCP tests | **95/95** |
| CLI tests | **30/30** |
| Frontend tests | **27/27** |
| **Total** | **231/231** |
| MCP build | PASS |
| CLI build | PASS |
| Frontend build | PASS |
| Frontend typecheck | **FAIL — 61 errors / 23 files**, pre-existing |
| `check:secrets` | PASS (0 REAL_SECRET) |
| `check:tracking` | PASS (22/22) |
| `check:knowledge` | PASS (4/4) |
| `check:generated` | PASS (FRESH, 83/83) |
| `check:docs` | PASS (0 drift) |
| `check:config` | **4 CONFLICT** — owner decisions OD-01/02/03/05 |

`npm run check` exits 1 solely because of the four genuine conflicts. No gate was
weakened to obtain a green result.