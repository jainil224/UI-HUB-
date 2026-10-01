# Security Validation

Phase 6, task 6.28. How to verify a security control actually holds, rather than
assuming it does.

---

## 1. The secret scanner

```bash
npm run check:secrets          # fails on REAL_SECRET
npm run check:secrets:all      # shows every classification
```

### Scope

The scanner examines the files git could commit: tracked files plus untracked,
non-ignored files (`git ls-files --cached --others --exclude-standard`).

An earlier draft walked the filesystem and reported `backend/.env` and
`backend/service-account.json` as leaks. Both are correctly gitignored local
files that *should* contain real credentials. A leak is a secret that is
committed or about to be committed — scanning the working tree reports the
developer's own machine at them.

Binary content is skipped (extension list plus a NUL-byte probe), which avoids
false positives from `.glb` models and other assets.

### Classifications

| Class | Meaning | Fails CI |
|---|---|---|
| `REAL_SECRET` | A credential-shaped value with no placeholder signal | **yes** |
| `PLACEHOLDER` | `<password>`, `your-api-key`, `xxxx`, `${VAR}`, `process.env.X`, `example.com` | no |
| `MASKED` | Repetition mask such as `xxxxxxxx` or `********` | no |
| `PUBLIC_IDENTIFIER` | Non-secret by design, e.g. the Firebase web `apiKey` in `frontend/` | no |
| `TEST_FIXTURE` | Inside a `tests/`, `__tests__/`, `fixtures/` path or a `.test.`/`.spec.` file | no |
| `FALSE_POSITIVE` | Line is documented as an example/redaction | no |

### Detectors

`mongodb-uri`, `aws-access-key-id`, `aws-secret-access-key` (context-anchored),
`private-key` (header **and** footer), `private-key-header`, `firebase-service-account`,
`razorpay-key`, `github-token`, `slack-token`, `stripe-webhook-secret`,
`google-api-key`, `sendgrid-key`, `bearer-token`, `smtp-credential`,
`vapid-private-key`.

### Output format

```
VERDICT  path:line  detector  type  fp:<12-hex-fingerprint>  len:<n>
```

The fingerprint is a SHA-256 prefix, so the same secret can be tracked across
occurrences without revealing it. **The matched value is never printed**, in CI
or locally.

### Known limitations

Stated rather than hidden — pattern matching cannot prove every secret is
detectable:

1. **Encoded or split secrets are not detected.** A MongoDB URI broken across
   lines, or a credential base64-encoded inside another string, will not match.
2. **Secrets without a recognisable prefix or format are not detected.**
3. **No entropy analysis.** It produced more false positives than prevented leaks
   on a repository containing `.glb` models, hashed asset filenames and generated
   code.
4. **Working tree only.** A secret committed and later deleted is invisible. This
   scanner does not scan git history.
5. **The AWS-secret rule is context-anchored** and misses a bare 40-character
   secret with no adjacent keyword.
6. **A copied `.env.example` into a real file** will pass, if the value keeps its
   placeholder shape.

The scanner is a guard against accidents, not a substitute for review. A commit
that adds a credential in an unrecognised form will not be caught.

### Verification that it works

Validated in Phase 6 against a synthetic fixture: a realistic MongoDB URI with a
real-looking password, an `AKIA…` key, a full PEM private key and a Stripe
webhook secret were all detected (exit 2), while `<password>`, `your_api_key_here`
and `xxxxxxxx` were classified PLACEHOLDER and did not fail. The real repository
scans clean (exit 0).

---

## 2. CORS

```bash
cd backend     && npm test    # 79 tests, includes tests/cors.test.js
cd mcp-server  && npm test    # 95 tests, includes tests/cors.test.ts
```

Tests exercise the **real `cors` middleware over a real socket** (backend: an
ephemeral Express listener driven by `fetch`; MCP: `supertest`), not the options
object. A configuration-shape test would have passed against the Phase 5 code,
because the defect was a runtime decision inside the callback.

Behaviour proven against the reconstructed Phase 5 policy: **7 of 7** hostile
origins were accepted, including `https://attacker.vercel.app`,
`https://localhost.attacker.example`, `https://evil.example/?localhost` and
`not-a-url`. All are now rejected.

Contract and rationale: `../APIs/CORS_CONTRACT.md`.

---

## 3. Tracking and secret hygiene

```bash
npm run check:tracking
```

22 rules covering: knowledge base trackable and fully tracked, `.github/` and its
workflows trackable, agent instruction files tracked, `.env` and service-account
files still ignored, `.env.example` tracked, `frontend/dist` and `backend/dist`
ignored, `mcp-server/dist` and `cli/dist` intentionally tracked, personal tooling
still ignored, and `mcp-server/dist` consistent between disk and the index.

**This validator was verified to fail.** Temporarily re-adding `.github/` to
`.gitignore` produced `[FAIL] ci-trackable`, and the file was then restored
byte-identical.

---

## 4. Deployment and configuration consistency

```bash
npm run check:config
```

Reports `CONSISTENT` / `CONFLICT` / `UNKNOWN` for:

| Claim | Typical result |
|---|---|
| Render blueprint count | CONFLICT (permanent; owner decision) |
| Blueprint header vs start command | CONFLICT (claims unified, runs backend only) |
| Localhost origins in a production blueprint | CONFLICT |
| CORS origins vs CSP `connectSrc` | CONFLICT (localhost dev origins) |
| Vercel `/mcp` routability | CONFLICT (resolves to the SPA shell) |
| MCP generated data freshness | CONSISTENT |
| Environment contract coverage | CONSISTENT |

`UNKNOWN` means the claim could not be evaluated; it never passes silently.
CONFLICT exits 1.

---

## 5. Generated artifact freshness

```bash
npm run check:generated
```

Rebuilds `mcp-server` into a temporary directory and compares the entire tracked
`mcp-server/dist` tree: missing, extra, and byte-different files all fail. It
never writes to the repository, so it is safe in CI before publishing.

Sourcemaps are compared semantically rather than byte-for-byte: `tsc` records
the relative path to the source, so a map built in `dist/` says
`../../src/config/env.ts` while the same map built to a temp directory says
`../../../../<abs>/mcp-server/src/config/env.ts`. Byte comparison would report
every sourcemap as stale on every run. `mappings`, `names` and `sourcesContent`
must still match exactly.

Regenerate with `npm run generate`.

---

## 6. Documentation drift

```bash
npm run check:docs
```

Checks machine-checkable claims only: every Render hostname referenced in
documentation must either match a blueprint service or appear solely in
historical/measurement records; no document may assert that the Vercel `/mcp`
URL serves MCP; no document may claim `.env.example` contains a live secret.

---

## 7. Knowledge base integrity

```bash
npm run check:knowledge
```

Asserts `PROJECT_MAP.json` parses, every required knowledge file exists and is
non-trivial, knowledge-file cross-links resolve, in-document source paths resolve,
and `PROJECT_MAP.json` references exist.

---

## 8. Full gate

```bash
npm run check
```

Runs all six validators in sequence. Note that `check:config` and `check:docs`
currently exit 1 **by design**, documenting unresolved owner decisions and real
drift rather than being silenced.

---

## 9. Manual checks that automation cannot replace

| Check | Why it is manual |
|---|---|
| Whether a Render host resolves | Requires network access; Phase 6 performs no network calls |
| Whether production serves the current build | Requires dashboard and browser access |
| Whether a webhook still verifies | Requires live payment credentials |
| Whether Firebase rules are correct | Requires a deployed project and test users |
| Credential rotation | Requires provider dashboards |
| Cloudflare role membership | Not observable from the repository |

## Related

- `SECRET_HANDLING.md` — where secrets live
- `SECURITY_OVERVIEW.md` — controls and trust boundaries
- `../APIs/CORS_CONTRACT.md` — CORS contract
- `../infrastructure/DEPLOYMENT_CONFLICTS.md` — unresolved conflicts