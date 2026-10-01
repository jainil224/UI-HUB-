# Secret Handling

Phase 6, task 6.28.

## Where secrets live

| Secret | Storage | In git? |
|---|---|---|
| MongoDB URI | `MONGODB_URI` env var; `sync: false` in blueprints | **no** |
| Firebase Admin private key | `FIREBASE_PRIVATE_KEY` env var, or `backend/service-account.json` | **no** — `backend/.gitignore:13` |
| Firebase project / client email | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` | project id yes; email via `sync: false` |
| Razorpay key id / secret | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | **no** (`sync: false`) |
| Brevo API key | `BREVO_API_KEY` | **no** (`sync: false`) |
| Redis URL | `REDIS_URL` | **no** (`sync: false`) |
| MCP admin API keys | `uh_live_...`; stored hashed in MongoDB | **no** |
| MCP API key prefix | `MCP_API_KEY_PREFIX` (`uh_live_`) | yes — a prefix, not a secret |

`.env` files are ignored (`.gitignore:14-18`, negated only for `.env.example`
at lines 19-20). `npm run check:tracking` asserts these stays true.

## The one real incident

Phase 5 found a live-looking **MongoDB password inside placeholder-shaped
knowledge-base documentation**. Two facts made it instructive:

1. The value was in `.uihub-agent/` Markdown, not source. Documentation is
   scanned, not exempt.
2. It was **placeholder-shaped**. Placeholder detection alone would have passed
   it. It was caught by value-shape analysis.

It was redacted from four URIs and **never entered git history**. Rotation is
still an owner action, because a value that was once valid should be assumed
exposed to anyone with repository access.

Consequence for design: `SECRET_SCANNER` classifies placeholders explicitly and
does not treat "looks like a placeholder" as proof of safety.

## Not secrets

| Value | Why it is safe to commit |
|---|---|
| Firebase **web** `apiKey` (`AIza…` in `frontend/src/main.tsx`) | Not a credential. Firebase restricts use via Security Rules and authorized domains, and the value is shipped to every browser by design. |
| `MCP_API_KEY_PREFIX` = `uh_live_` | A prefix, not a key. |
| `FIREBASE_PROJECT_ID`, `MCP_ADMIN_EMAILS` | Identifiers, not credentials. Personal addresses are published by nature of being admin contacts. |
| `.env.example` contents | Placeholders by contract. |

Firebase web config keys are classified `PUBLIC_IDENTIFIER` by the scanner, and
only in `frontend/`. The same prefix under `backend/` or `mcp-server/` is a
REAL_SECRET, because server-side `AIza` keys are not needed by the web SDK.

## Rules for agents

1. **Never** write a real credential into any file, including documentation,
   comments, examples, or test fixtures.
2. **Never** copy an environment value into a `.env.example`.
3. When documenting configuration, record whether a variable is `PRESENT`,
   `ABSENT`, `CONFIGURED` or `NOT CONFIGURED` — **never its value**.
4. When a value must be shown, redact it and state what it is:
   `MONGODB_URI=<redacted; set in Render dashboard>`.
5. If a secret is ever committed, treat it as compromised and tell the owner.
   Removing it from the working tree does not remove it from history.
6. Run `npm run check:secrets` before committing anything that touches config,
   docs, or CI.

## Example policy (6.27)

Examples must have realistic **structure** and fake **values**:

```env
# good
MONGODB_URI=mongodb+srv://uihub:<password>@cluster0.example.mongodb.net/uihub
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
RAZORPAY_KEY_SECRET=<your-key-secret>
SMTP_PASS=<your-smtp-password>
```

The scanner classifies each of these as PLACEHOLDER or MASKED and does not fail
the build. Copying a `.env.example` value into a real deployment is the failure
mode to avoid, not the example itself.

Angle-bracket placeholders are stripped from CORS origin lists for the same
reason: a copied `<your-origin>` must not silently disable enforcement.

## Rotation

| Secret | Rotation path |
|---|---|
| MongoDB password | Atlas → change password → update Render + Vercel dashboards → redeploy |
| Firebase private key | GCP → service account → new key → update env → delete old key |
| Razorpay secret | Razorpay dashboard → rotate → update env |
| Brevo API key | Brevo → regenerate → update env |
| MCP admin keys | Issue new key via the dashboard API, revoke the old one |

Rotation requires dashboard access, which is why it is an owner decision rather
than an agent task. See `../tasks/OWNER_DECISIONS.md`.

## Related

- `SECURITY_VALIDATION.md` — the scanner, its limits and how to read its output
- `../infrastructure/ENVIRONMENT_CONTRACT.md` — every variable and its status
- `../rules/DO_NOT_CHANGE.md` — prohibitions
- `../CONFLICTS.md` — recorded findings