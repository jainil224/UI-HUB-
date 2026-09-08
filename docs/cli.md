# UI HUB CLI

Terminal access to the UI HUB catalog. `ui-hub` searches components, templates, and
animations, inspects metadata and dependencies, pulls copy-paste-ready source code, and
saves components straight into your project.

The CLI is a **thin MCP client**: it speaks JSON-RPC directly to the UI HUB MCP server
using a normal `uh_live_…` API key. There is no separate CLI backend — search, tiering,
and rate limits are all enforced server-side by the existing MCP server
(`mcp-server/`).

---

## Install

The CLI lives in `cli/` and runs with Node ≥ 18 (native `fetch`, zero runtime deps).

```bash
# from the repo root
npm run build:cli
```

Run it through the root npm script (each invocation rebuilds nothing — it just runs the
compiled `cli/dist/cli.js`):

```bash
npm run ui-hub -- --help
npm run ui-hub -- search "pricing card"
```

Or invoke the compiled binary directly:

```bash
node cli/dist/cli.js login
```

> Publishing to npm (`@ui-hub/cli` → `npx ui-hub@latest`) is planned as a follow-up
> once the command surface is stable.

---

## Authentication

1. Create an API key in the **MCP dashboard** (`ui-hub.onrender.com/dashboard/mcp`).
   Keys look like `uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx` and are shown once.
2. Authenticate:

   ```bash
   npm run ui-hub -- login
   # UI HUB API key: ██████████████
   ```

   `login` verifies the key against the server, stores it in
   `~/.config/ui-hub/config.json` (0600, never chmod'd wider), and never prints it.

The key is resolved in this order:

1. `--key <key>` flag
2. `UI_HUB_API_KEY` environment variable
3. `~/.config/ui-hub/config.json` (set by `login`)

**Security note:** API keys are intentionally never read from project files (`.ui-hubrc.json`).
A project file may only set `endpoint` to avoid accidental key commits to the repo.

---

## Endpoint

Default endpoint: `https://ui-hub-mcp.onrender.com/mcp`

Override per run with `--endpoint <url>`, via `UI_HUB_ENDPOINT`, or persist with:

```bash
npm run ui-hub -- config set-endpoint http://localhost:3001/mcp
```

---

## Commands

```
ui-hub login  [--key <uh_live_…>] [--endpoint <url>]
ui-hub logout
ui-hub config [set-endpoint <url> | logout]
ui-hub whoami

ui-hub search   [query] [--kind components|templates|animations]
                [--category <cat>] [--framework react]
                [--styling tailwind|css|scss] [--tags a,b]
                [--premium|--free] [--json]
ui-hub show     <componentId> [--json]
ui-hub code     <componentId> [-o <file>] [--framework react] [--styling …] [--json]
ui-hub deps     <componentId> [--json]
ui-hub categories            [--json]
ui-hub prompt   <componentId> [--system claude|antigravity|lovable] [--json]

ui-hub behavior "<visual effect description>" [--category <cat>] [--limit <n>] [--json]

ui-hub template <templateId> | template search [query] | template source <templateId> [-o <file>]
ui-hub animation <animationId> | animation search [query]

ui-hub use <componentId> [dir]
```

### Global options

| Option | Description |
|:---|:---|
| `--json` | Print raw JSON instead of formatted output (scriptable) |
| `--endpoint <url>` | Override the MCP endpoint |
| `--key <key>` | Override the API key |
| `-h, --help` / `-v, --version` | Help / version |

---

## Examples

```bash
# find everything for a pricing section
npm run ui-hub -- search "pricing card"
npm run ui-hub -- search --kind templates "landing"
npm run ui-hub -- search --kind animations "scroll reveal" --json

# find components by visual behavior, not keywords
npm run ui-hub -- behavior "magnetic pull on hover"
npm run ui-hub -- behavior "accretion disk" --category background

# deep-dive one component
npm run ui-hub -- show gravitational-vortex
npm run ui-hub -- deps gravitational-vortex

# grab the source as a file, or pipe it
npm run ui-hub -- code spotlight-cards -o src/components/
npm run ui-hub -- code spotlight-cards | head -40
npm run ui-hub -- use spotlight-cards ./my-site

# Pro features
npm run ui-hub -- prompt gravitational-vortex --system claude
npm run ui-hub -- template source sui-overflow -o ./site.tsx
```

---

## JSON mode

Every command supports `--json` for CI or scripting pipelines. Errors also produce a
machine-readable envelope and a non-zero exit:

```bash
$ ui-hub --json search --premium 2> /dev/null
{
  "count": 43,
  "components": [ … ]
}
$ ui-hub --json show not-a-real-id; echo $?
{
  "error": "COMPONENT_NOT_FOUND",
  "message": "The requested UI HUB component \"not-a-real-id\" was not found."
}
1
```

---

## Exit codes

| Code | Meaning |
|:---|:---|
| `0` | Success |
| `1` | Tool/MCP error (missing component, premium denied, network…) |
| `2` | Usage error (unknown command/flag) |
| `3` | Auth/config error (no key, invalid key) |

---

## Free vs Pro (server-enforced)

| Capability | Free key | Pro key |
|:---|:---|:---|
| Search / metadata / categories / deps | ✅ | ✅ |
| Premium component source + `show` code | ❌ `PREMIUM_ACCESS_REQUIRED` | ✅ |
| AI prompts (`prompt`) | ❌ | ✅ |
| Template source (`template source`) | ❌ | ✅ |
| Request limit | 100/day | 10,000+/day |

`search` shows an `ACCESS` column (`free` / `premium` / `premium (locked)`) so you know
what your current key can actually pull.

---

## Development

```bash
cd cli
npm install
npm run build        # tsc -> dist/
npm test             # node --test (via tsx loader)
npm run dev -- --help  # run against source with tsx
```

Unit tests cover config precedence, the JSON-RPC client (stubbed fetch: 401, JSON-RPC
errors, tool `isError` results, network failures), arg parsing, and table output.

Point the CLI at a local MCP server during development:

```bash
npm run dev:mcp                    # optional, from repo root
npm run ui-hub -- --endpoint http://localhost:3001/mcp search "cursor" --key uh_test_key
```