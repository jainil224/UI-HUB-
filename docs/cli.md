# UI HUB CLI

Terminal access to the UI HUB catalog. `ui-hub` searches components, templates, and animations, inspects metadata
and dependencies, pulls copy-paste-ready source code, and saves components straight into your project — without ever
opening a browser.

The CLI is a **thin MCP client**: it speaks JSON-RPC 2.0 directly to the UI HUB MCP server using a normal
`uh_live_…` API key. There is **no separate CLI backend** — search, tiering, and rate limits are all enforced
server-side by the existing MCP server (`mcp-server/`).

---

## Table of Contents

- [Features](#features)
- [Install & Run](#install--run)
- [Authentication](#authentication)
- [Endpoint](#endpoint)
- [Configuration](#configuration)
- [Command Reference](#command-reference)
- [Global Options](#global-options)
- [JSON Mode](#json-mode)
- [Exit Codes](#exit-codes)
- [Free vs Pro (server-enforced)](#free-vs-pro-server-enforced)
- [Examples](#examples)
- [Development](#development)

---

## Features

- 🔎 **Search** components, templates, and animations by keyword, category, framework, styling, tags, and premium status
- 🎯 **Behavior search** — find components by *visual vibe* ("magnetic pull", "accretion disk"), not just keywords
- 📦 **Inspect** full metadata, dependencies, and category counts
- 📋 **Pull source** as copy-paste text or write it directly to a file (`-o`)
- 🧱 **Save components** into your project with `use` (component file + deps)
- 🧪 **Templates & animations** — full-page template source and animation code (Pro)
- 🤖 **AI prompts** — fetch Claude/Antigravity/Lovable prompts for any component (Pro)
- 🔐 **Key management** — `login`, `whoami`, `logout`, and `config set-endpoint`
- 🧪 **Scriptable** — `--json` on every command, machine-readable error envelopes, distinct exit codes
- ⚡ **Zero runtime dependencies** — native `fetch`, Node ≥ 18.18

---

## Install & Run

The CLI is published to npm as **`ui-hub-cli`** and runs with **Node ≥ 18.18** (native `fetch`, zero runtime deps).

### Install from npm (recommended)

```bash
npx ui-hub-cli --help              # run without installing
npm install -g ui-hub-cli          # install globally → the `ui-hub` command
ui-hub --help                      # available after global install
```

After a global install you get two commands (`ui-hub` and `ui-hub-cli`), which behave identically.

### Run from the repository

The CLI also ships in this repo under `cli/`. If you cloned the project instead of installing from npm:

#### Build once

```bash
npm run build:cli
```

Compiles TypeScript → `cli/dist/cli.js`.

#### Run through the root script (recommended)

`npm run ui-hub` runs the compiled binary and passes everything after `--` straight to it:

```bash
npm run ui-hub -- --help
npm run ui-hub -- login
npm run ui-hub -- search "pricing card"
```

#### Run the binary directly

```bash
node cli/dist/cli.js login
node cli/dist/cli.js search "cursor"
```

#### During development (runs from source with `tsx`)

```bash
npm run cli:dev -- --help
```

> The CLI is published on npm as `ui-hub-cli`. New versions ship automatically — `npx ui-hub-cli@latest` always gets the newest build.

---

## Authentication

### 1. Get an API key

Create a key in the **MCP dashboard** (`https://ui-hub-design.vercel.app/dashboard/mcp`). Keys look like
`uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx` and are shown **only once** at creation.

### 2. Log in

```bash
npm run ui-hub -- login
# UI HUB API key: ██████████████
```

`login`:
- verifies the key against the server (`tools/list` handshake),
- stores it in `~/.config/ui-hub/config.json` with `0600` permissions,
- never prints the key to stdout.

### Key resolution order

The key is resolved in this exact order:

1. `--key <key>` flag
2. `UI_HUB_API_KEY` environment variable
3. `~/.config/ui-hub/config.json` (set by `login`)

### Security note

API keys are **intentionally never read from project files** (`.ui-hubrc.json`). A project file may only set an
`endpoint` — so you can point the CLI at a different server per repo without ever risking a key commit.

---

## Endpoint

Default endpoint (production MCP server):

```
https://ui-hub-mcp.onrender.com/mcp
```

Override it three ways (highest wins):

| Method | Example |
|:---|:---|
| Per-run flag | `npm run ui-hub -- search cursor --endpoint http://localhost:3001/mcp` |
| Environment variable | `UI_HUB_ENDPOINT=http://localhost:3001/mcp` |
| Persistent config | `npm run ui-hub -- config set-endpoint http://localhost:3001/mcp` |

---

## Configuration

### `config set-endpoint <url>`

Persists a custom MCP endpoint (e.g. a local `npm run dev:mcp` instance):

```bash
npm run ui-hub -- config set-endpoint http://localhost:3001/mcp
```

### `whoami`

Shows the active key prefix, tier, and configured endpoint:

```bash
npm run ui-hub -- whoami
# Key:      uh_live_abc… (pro)
# Endpoint: https://ui-hub-mcp.onrender.com/mcp
```

### `logout`

Deletes the stored key from `~/.config/ui-hub/config.json`.

### Config file

```
~/.config/ui-hub/config.json   (0600 — created on first login)
{
  "endpoint": "https://ui-hub-mcp.onrender.com/mcp",
  "apiKey": "uh_live_…"
}
```

---

## Command Reference

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

### Per-command detail

| Command | Description | Flags |
|:---|:---|:---|
| `login` | Authenticate with an API key and store it in the config | `--key`, `--endpoint` |
| `logout` | Delete the stored key | — |
| `config` | Manage endpoint/config | `set-endpoint <url>` |
| `whoami` | Show active key + endpoint + tier | — |
| `search [query]` | Search components (default), or `--kind templates` / `--kind animations` | `--kind`, `--category`, `--framework`, `--styling`, `--tags a,b`, `--premium`, `--free`, `--json` |
| `show <id>` | Full component info: description, metadata, code, deps, usage | `--json` |
| `code <id>` | Print component source, or save with `-o` | `-o <file>`, `--framework react`, `--styling …`, `--json` |
| `deps <id>` | List a component's dependencies | `--json` |
| `categories` | Category names + counts | `--json` |
| `prompt <id>` | Fetch AI generation prompts (Pro) | `--system claude\|antigravity\|lovable`, `--json` |
| `behavior "<vibe>"` | Search by visual behavior description | `--category`, `--limit`, `--json` |
| `template <id>` | Show template info | `--json` |
| `template search [q]` | Search templates | `--json` |
| `template source <id>` | Print/save template source (**Pro**) | `-o <file>` |
| `animation <id>` | Show animation info | `--json` |
| `animation search [q]` | Search animations | `--json` |
| `use <id> [dir]` | Save a component file + its deps into `dir` (default `.`) | — |

---

## Global Options

| Option | Description |
|:---|:---|
| `--json` | Print raw JSON instead of formatted output (scriptable) |
| `--endpoint <url>` | Override the MCP endpoint for this invocation |
| `--key <key>` | Override the API key for this invocation |
| `-h, --help` | Show help |
| `-v, --version` | Show version (`0.1.0`) |

These can appear before or after the subcommand (e.g. `ui-hub --json search --premium` works exactly like
`ui-hub search --premium --json`).

---

## JSON Mode

Every command supports `--json` for CI or scripting pipelines. Output is clean, machine-readable JSON and never
interleaves human tables.

```bash
$ npm run ui-hub -- --json search --premium
{
  "count": 43,
  "components": [ … ]
}
```

Errors also produce a machine-readable envelope **and a non-zero exit**:

```bash
$ npm run ui-hub -- --json show not-a-real-id
{
  "error": "COMPONENT_NOT_FOUND",
  "message": "The requested UI HUB component \"not-a-real-id\" was not found."
}
```

---

## Exit Codes

| Code | Meaning |
|:---|:---|
| `0` | Success |
| `1` | Tool/MCP error (missing component, premium denied, network failure…) |
| `2` | Usage error (unknown command/flag) |
| `3` | Auth/config error (no key, invalid key) |

Use exit codes to drive shell pipelines:

```bash
if npm run ui-hub -- --json code not-a-real-id >/dev/null 2>&1; then
  echo "component exists"
fi
```

---

## Free vs Pro (server-enforced)

| Capability | Free key | Pro key |
|:---|:---|:---|
| Search / metadata / categories / deps / behavior search | ✅ | ✅ |
| Premium component source + `show` code | ❌ `PREMIUM_ACCESS_REQUIRED` | ✅ |
| AI prompts (`prompt`) | ❌ | ✅ |
| Template source (`template source`) | ❌ | ✅ |
| Request limit | 100/day | 10,000+/day |

`search` shows an `ACCESS` column (`free` / `premium` / `premium (locked)`) so you know what your current key can
actually pull, before you try.

---

## Examples

### Find everything for a pricing section

```bash
npm run ui-hub -- search "pricing card"
npm run ui-hub -- search --kind templates "landing"
npm run ui-hub -- search --kind animations "scroll reveal" --json
```

### Find components by visual behavior, not keywords

```bash
npm run ui-hub -- behavior "magnetic pull on hover"
npm run ui-hub -- behavior "accretion disk" --category background
npm run ui-hub -- behavior "particle swirl" --limit 5
```

### Filter the catalog

```bash
npm run ui-hub -- search --category cursor --free
npm run ui-hub -- search --category 3d --premium --json
npm run ui-hub -- search --tags "glassmorphism,aurora"
npm run ui-hub -- categories
```

### Deep-dive one component

```bash
npm run ui-hub -- show gravitational-vortex
npm run ui-hub -- deps gravitational-vortex
```

### Grab the source as a file, or pipe it

```bash
npm run ui-hub -- code spotlight-cards -o src/components/
npm run ui-hub -- code spotlight-cards | head -40
```

### Save a component + its deps into a project

```bash
npm run ui-hub -- use spotlight-cards ./my-site
```

`use` writes the component file together with a small `package.json`/deps note so your project has everything the
component imports.

### Pro features

```bash
npm run ui-hub -- prompt gravitational-vortex --system claude
npm run ui-hub -- template source sui-overflow -o ./site.tsx
npm run ui-hub -- template search "overflow"
npm run ui-hub -- animation scroll-reveal
```

### Working locally during development

```bash
npm run dev:mcp                        # start the local MCP server on :3001
npm run ui-hub -- --endpoint http://localhost:3001/mcp search "cursor" --key uh_test_key
```

---

## Development

### Commands

```bash
cd cli
npm install
npm run build        # tsc -> dist/
npm test             # node --test (via tsx loader)
npm run dev -- --help   # run against source with tsx
```

Also available from the repo root:

```bash
npm run build:cli    # build the CLI
npm run test:cli     # run the CLI test suite
npm run cli:dev      # run from source (tsx)
```

### Test coverage

Unit tests cover:
- **config precedence** — flag vs env vs config file resolution,
- **the JSON-RPC client** — stubbed `fetch` for 401s, JSON-RPC errors, tool `isError` results, and network failures,
- **arg parsing** — flags, subcommands, unknown args,
- **table output** — formatting and truncation.

### Project layout

```
cli/
├── package.json          # bin: ui-hub, engines >= 18.18, zero deps
├── tsconfig.json
├── src/
│   ├── cli.ts            # entry point — resolves endpoint/key, dispatches commands
│   ├── args.ts           # argument parsing (global + per-command)
│   ├── ctx.ts            # per-run context (endpoint, key)
│   ├── config.ts         # ~/.config/ui-hub/config.json (0600)
│   ├── mcp.ts            # minimal MCP Streamable HTTP client (JSON-RPC 2.0)
│   ├── output.ts         # table / JSON / dim output helpers
│   ├── errors.ts         # CliError + exit-code constants
│   ├── help.ts           # --help text
│   └── commands/         # login, config, search, show, code, deps, categories,
│                         # prompt, template, animation, behavior, use, whoami
└── tests/                # node --test suites (config, mcp, args, output)
```

### How it talks to the server

`mcp.ts` implements a minimal **MCP Streamable HTTP** client: it sends JSON-RPC 2.0 `tools/call` requests with
`Content-Type: application/json` and `Accept: application/json, text/event-stream`, adds
`Authorization: Bearer <key>` when a key is present, and unwraps the tool result — including `isError` response
payloads and JSON-RPC-level errors. There is no third-party MCP SDK dependency.

---

For the MCP server itself (tools, schemas, tiers, rate limits, security), see
[`MCP.md`](../MCP.md). For architecture and deployment, see the repository [`README.md`](../README.md).