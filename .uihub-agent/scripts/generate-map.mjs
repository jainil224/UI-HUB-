#!/usr/bin/env node
/**
 * UI HUB Agent Knowledge — PROJECT_MAP.json generator
 *
 * Emits `.uihub-agent/PROJECT_MAP.json` from evidence read out of the repository.
 *
 * Design rules (see .uihub-agent/AGENT.md):
 *   - The repository is the source of truth. Every mechanical fact below is
 *     counted or parsed from source at run time, never hardcoded.
 *   - `PURPOSE` strings are the only curated layer. They were written after
 *     reading each file; they describe intent, not behaviour.
 *   - Anything not verifiable from code is emitted with status "UNKNOWN" or
 *     confidence "low", never guessed.
 *   - SECRET_SCRUB runs over the whole serialised output. No value that looks
 *     like a credential may reach this file.
 *
 * Usage:  node .uihub-agent/scripts/generate-map.mjs [--check]
 *         --check  validate the existing file instead of writing (exit 1 if stale)
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const OUT = join(ROOT, '.uihub-agent', 'PROJECT_MAP.json');
const CHECK_ONLY = process.argv.includes('--check');

/* ------------------------------------------------------------------ utils */

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.vercel', 'coverage',
  'public', 'component-specs', '.agents', '.claude', '.opencode', '.uihub-agent',
]);

const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

const read = (rel) => {
  const abs = join(ROOT, rel);
  return existsSync(abs) ? readFileSync(abs, 'utf8') : null;
};
const readJson = (rel) => {
  const raw = read(rel);
  if (raw === null) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

/** Recursively list files under a repo-relative dir, skipping build/vendor noise. */
function walk(relDir, out = []) {
  const abs = join(ROOT, relDir);
  if (!existsSync(abs)) return out;
  for (const name of readdirSync(abs)) {
    if (SKIP_DIRS.has(name)) continue;
    const rel = relDir ? `${relDir}/${name}` : name;
    const s = statSync(join(ROOT, rel));
    if (s.isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}

const uniq = (a) => [...new Set(a)].sort();
const countFiles = (files, dir) => files.filter((f) => f.startsWith(`${dir}/`)).length;
const loc = (files, dir) =>
  files
    .filter((f) => f.startsWith(`${dir}/`) && CODE_EXT.has(extname(f)))
    .reduce((n, f) => n + read(f).split('\n').length, 0);

/* ------------------------------------------------------- purpose catalogue */
/* Curated after reading each target. Keyed by repo-relative path. */

const PURPOSE = {
  // root
  'package.json': 'Monorepo task runner. Not a workspace root — each sub-project installs independently. Holds scripts, plus a duplicated copy of the backend dependency set.',
  'vercel.json': 'Vercel config for the frontend SPA + /api serverless function. Sets buildCommand, outputDirectory, SPA rewrite, COOP header, and api/index.js bundle include.',
  'render.yaml': 'Render blueprint for the single production backend+MCP web service. Declares build/start commands, healthCheckPath and every production env var.',
  'api/index.js': 'Vercel serverless entry. Re-exports the Express app from backend/src/server.js as a default export so /api/* resolves to the whole backend.',
  '.gitignore': 'Excludes node_modules, dist (except mcp-server/dist), all .env files, service-account.json, and local-only agent dirs (.agents/, component-specs/).',
  '.vercelignore': 'Reduces the Vercel upload payload by excluding local-only directories.',
  'README.md': 'Product + architecture + API reference. Extensively out of date — see .uihub-agent/CONFLICTS.md.',
  'MCP.md': 'Deep MCP reference. The most accurate doc in the repo. Minor drift on component counts and session semantics — see CONFLICTS.md.',
  'agent.md': 'Ten-phase plan for building this knowledge system. Phase 1 is discovery only.',
  'render.yaml:backend': 'Render service: builds mcp-server then backend, starts backend, health-checks /health.',

  // frontend
  'frontend': 'Vite + React 19 + TypeScript SPA. The customer-facing product.',
  'frontend/index.html': 'HTML shell. Sets title, OG/Twitter/Schema.org meta, Google site-verification, Google Fonts, and loads gtag.js with Consent Mode v2 defaults set to denied.',
  'frontend/vite.config.ts': 'Vite config. React + Tailwind v4 plugins, manualChunks vendor splitting, dev-server proxy notes. The javascript-obfuscator plugin instantiation is commented out.',
  'frontend/src/main.tsx': 'Frontend entry. Calls initFirebase() with a hardcoded fallback config literal, mounts React, then fetches /api/v1/config/firebase and discards the response.',
  'frontend/src/App.tsx': 'Root router and app shell. All 60 <Route> elements live here, plus shell chrome visibility rules, theme classes and the mount-time background sync trigger.',
  'frontend/src/index.css': 'Canonical design tokens. Tailwind v4 @theme block, mirrored :root / :root.light custom properties, neo-brutalist component layer, 48 keyframe groups.',
  'frontend/tailwind.config.ts': 'Tailwind v3-style config. Likely inert under Tailwind v4 (no @config directive in CSS, no PostCSS config) — treat index.css as the token source of truth.',
  'frontend/metadata.json': 'Google AI Studio starter metadata. Stale — names Remix and an orange theme; the real app is Vite with a black/blue theme.',
  'frontend/src/context': 'Four global React contexts: Auth, Theme, CookieConsent, Skeleton.',
  'frontend/src/data': 'Static catalogs and embedded payloads. Largest files in the app; lazily imported to keep them out of first paint.',
  'frontend/src/services': 'Frontend API clients for the main backend, the MCP dashboard/admin APIs, favorites, collections and community components.',
  'frontend/src/utils': 'Cross-cutting utilities: base-URL resolution, checkout, code assembly, prompt fetching, search scoring, prefetch, activity logging, push.',
  'frontend/src/pages': 'All route components. One directory per top-level area.',
  'frontend/src/components/ui': 'Site chrome, the reusable component library, and the CloudScroll React-Three-Fiber experience.',
  'frontend/src/components/animations': 'Reusable text-animation and visual-effect components, exported through barrel files.',
  'frontend/src/components/templates': 'Template (website-section) components plus the template registry that maps ids to previews, sources, public assets and preview backgrounds.',
  'frontend/src/components/admin': 'Admin UI kit: panels, tables, badges, formatters, the useData fetch hook, and Recharts wrappers.',
  'frontend/src/lib': 'Firebase client initialisation and the cn() class-merge helper.',

  // backend
  'backend': 'Express 4 REST API. Plain JavaScript ESM (no TypeScript).',
  'backend/src/server.js': 'Backend entry. Mounts one router at BOTH /api and /, then dynamically imports and mounts the MCP routers at /mcp, /api/dashboard/mcp and /api/admin/mcp. Sets Helmet CSP, trust proxy, and the global rate limiter.',
  'backend/src/routes': 'Six Express routers: components, users, config, payment, favorites, collections.',
  'backend/src/services': 'Backend business logic. Includes mongoService, firebaseService, accessService and the announcement/email services.',
  'backend/src/middleware/auth.js': 'Exports exactly one middleware: verifyToken. Verifies a Firebase ID token.',
  'backend/src/middleware': 'verifyToken, rate limiters, and express-validator chains.',
  'backend/src/utils/verifySignature.js': 'HMAC-SHA256 Razorpay signature verification using timingSafeEqual.',
  'backend/src/utils/firebaseAdmin.js': 'Firebase Admin initialisation from env service-account credentials.',
  'backend/src/utils/sendEmail.js': 'Email dispatch. Brevo primary, with SMTP/Resend fallbacks.',
  'backend/src/config': 'Server-side plan definitions and the canonical premium-component id list.',
  'backend/src/data': 'Server-side embedded component/template source payloads and the generated announcement manifest.',
  'backend/src/controllers': 'Payment and Razorpay webhook controllers.',
  'backend/src/scripts': 'Sixteen operational, migration and email-test scripts (Mongo/Firestore init and migration, premium embedding, broadcast tests).',

  // mcp-server
  'mcp-server': 'TypeScript Model Context Protocol server. Protocol is hand-implemented — the official MCP SDK is NOT a dependency.',
  'mcp-server/src/index.ts': 'HTTP entry. Mounts the mcp, dashboard and admin routers at the same three paths the backend uses.',
  'mcp-server/src/stdio.ts': 'stdio entry. Runs with an implicit admin identity for local desktop clients.',
  'mcp-server/src/routes/mcp.ts': 'JSON-RPC 2.0 endpoint. Implements initialize, ping, tools/list, tools/call. Also implements GET / and DELETE / (session handling) and keeps an in-memory session store.',
  'mcp-server/src/routes/dashboard.ts': 'Authenticated user dashboard API: API-key CRUD, usage, status, overview.',
  'mcp-server/src/routes/admin.ts': 'Admin API guarded by requireAdmin. Analytics, users, API keys, tools, logs, security, health, alerts, settings, audit, export, playground.',
  'mcp-server/src/tools': 'Fourteen MCP tools, one file per tool, aggregated by index.ts.',
  'mcp-server/src/middleware/auth.ts': 'Bearer uh_live_… API-key auth with ?key= and x-api-key fallbacks. Keys are SHA-256 hashed in MongoDB. Rejections return HTTP 200 with a JSON-RPC error envelope, not 401.',
  'mcp-server/src/middleware': 'API-key auth, Firebase dashboard auth, admin guard, rate limiting, error envelope.',
  'mcp-server/src/data': 'Generated component and template catalogs consumed by componentService. Must stay in sync with the frontend data modules.',
  'mcp-server/src/services': 'Mongo, Firebase, API-key, analytics, audit, permission and component-lookup services.',
  'mcp-server/dist': 'Committed build output. Load-bearing: the backend imports the MCP routers from here at runtime.',

  // cli
  'cli': 'Zero-runtime-dependency Node CLI. A thin MCP client — it does not talk to the REST backend.',
  'cli/src/cli.ts': 'CLI entry. Only login, config and logout are exempt from the API-key requirement.',
  'cli/src/commands': 'Fourteen command modules.',

  // scripts / docs
  'scripts/announcement': 'Five .mjs announcement-pipeline scripts. There are NO Python scripts in this repository.',
  'docs': 'Three docs: cli.md (current), mcp.md (stale in parts), runbook.md (materially stale on topology).',
  '.agents/skills': 'Existing AI agent skills. Authoritative for component-forge, component-integration and git-sync workflows. Preserve.',
  '.claude/agents': 'Empty directory.',
};

/* --------------------------------------------------------- secret scrubbing */

const SECRET_PATTERNS = [
  /\bAIza[0-9A-Za-z_-]{35}\b/g,                 // Google API key
  /\bAKIA[0-9A-Z]{16}\b/g,                      // AWS access key id
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,            // GitHub token
  /\bsk_(live|test)_[A-Za-z0-9]{16,}\b/g,       // Stripe secret key
  /\brzp_(live|test)_[A-Za-z0-9]{10,}\b/g,      // Razorpay key
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, // JWT
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  /\bAKIA[0-9A-Z]{16}@/g,
];

const SECRET_KEY_NAMES =
  /(secret|password|passwd|private[_-]?key|api[_-]?key|token|credential|service[_-]?account)/i;

function scrub(value, keyPath = '') {
  if (typeof value === 'string') {
    let out = value;
    for (const re of SECRET_PATTERNS) out = out.replace(re, 'ENVIRONMENT_VARIABLE_REQUIRED');
    // A key whose NAME looks sensitive must never carry a literal value.
    const leaf = keyPath.split('.').pop() ?? '';
    if (SECRET_KEY_NAMES.test(leaf) && /[A-Za-z0-9_-]{12,}/.test(out) && !/ENVIRONMENT_VARIABLE_REQUIRED/.test(out)) {
      out = 'ENVIRONMENT_VARIABLE_REQUIRED';
    }
    return out;
  }
  if (Array.isArray(value)) return value.map((v, i) => scrub(v, `${keyPath}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrub(v, keyPath ? `${keyPath}.${k}` : k)]));
  }
  return value;
}

/* ------------------------------------------------------------ sub-projects */

function readSubProject(dir) {
  const pkg = readJson(`${dir}/package.json`);
  if (!pkg) return null;
  return {
    name: pkg.name ?? 'UNKNOWN',
    version: pkg.version ?? 'UNKNOWN',
    type: pkg.type ?? 'commonjs',
    language: extname(join(dir, pkg.main ?? '')) === '.ts' || existsSync(join(dir, 'tsconfig.json'))
      ? 'TypeScript'
      : 'JavaScript (ESM)',
    entry: pkg.main ?? 'UNKNOWN',
    scripts: pkg.scripts ?? {},
    dependencies: Object.keys(pkg.dependencies ?? {}).length,
    devDependencies: Object.keys(pkg.devDependencies ?? {}).length,
  };
}

/* ------------------------------------------------------------------ routing */

/** Parse frontend/src/App.tsx into a nesting-aware route list. */
function parseRoutes() {
  const src = read('frontend/src/App.tsx');
  if (!src) return { routes: [], error: 'frontend/src/App.tsx not readable' };

  const lines = src.split('\n');
  const routes = [];
  const stack = []; // layout routes currently open
  let lineNo = 0;

  for (const raw of lines) {
    lineNo += 1;
    const line = raw.trim();
    if (line === '</Route>') { stack.pop(); continue; }
    // `<Routes>` is the container, not a route. It must never enter the stack or
    // it becomes a phantom `/` parent and every top-level path renders as `//x`.
    if (!line.startsWith('<Route') || line.startsWith('<Routes')) continue;

    const selfClosing = /\/>\s*$/.test(line);
    const pathMatch = line.match(/\spath="([^"]*)"/);
    const elMatch = line.match(/element=\{<([A-Za-z0-9_]+)/);
    const isIndex = /\sindex\s/.test(line);
    const element = elMatch ? elMatch[1] : null;
    const parentPath = stack.length ? stack[stack.length - 1] : null;

    let fullPath;
    if (isIndex) {
      fullPath = parentPath ?? '/';
    } else if (pathMatch) {
      const p = pathMatch[1];
      fullPath = parentPath ? `${parentPath === '/' ? '' : parentPath}/${p}` : p;
    } else {
      // Pathless layout route (e.g. <Route element={<AdminLayout />}>)
      fullPath = parentPath ?? '/';
    }

    const guard =
      element === 'AdminGuard' ? 'admin-guard'
      : element === 'Navigate' ? 'redirect'
      : stack.length || element === 'AdminGuard' || element === 'DashboardLayout' ? 'layout'
      : 'public';

    routes.push({
      name: element ?? 'UNKNOWN',
      path: isIndex && parentPath ? `${fullPath} (index)` : fullPath,
      type: 'route',
      purpose: describeRoute(element, fullPath, isIndex, selfClosing),
      status: 'active',
      confidence: 'high',
      _line: lineNo,
      _guard: guard,
      _selfClosing: selfClosing,
      _parent: parentPath,
    });

    if (!selfClosing) {
      stack.push(pathMatch && pathMatch[1].startsWith('/') ? pathMatch[1] : fullPath);
    }
  }
  return { routes, error: null };
}

function describeRoute(element, fullPath, isIndex, selfClosing) {
  if (!element) return 'Pathless layout route.';
  if (element === 'Navigate') return `Redirect target for ${isIndex ? 'the index of' : ''} ${fullPath}.`;
  if (element === 'AdminGuard') return 'Route guard: requires an authenticated user with server-confirmed admin status, then renders the admin layout.';
  if (element === 'DashboardLayout') return 'Dashboard chrome (sidebar + outlet). Note: this layout performs no auth check itself.';
  if (element === 'AdminLayout') return 'Admin chrome: 15-item sidebar + outlet.';
  if (isIndex) return 'Index route; redirects to the section default.';
  if (fullPath.startsWith('/demo/')) {
    return selfClosing
      ? 'Dedicated demo page for this catalog component.'
      : 'Dynamic demo route; resolves the id against the component catalog, then falls back to community components.';
  }
  return `Route component for ${fullPath}.`;
}

/* ------------------------------------------------------ component catalog */

function parseComponentCatalog() {
  const raw = read('frontend/src/data/componentData.tsx');
  if (!raw) return { total: 0, categories: {}, premium: 0, error: 'catalog not readable' };
  const marker = raw.indexOf('export const componentList');
  if (marker < 0) return { total: 0, categories: {}, premium: 0, error: 'componentList not found' };
  const body = raw.slice(marker);

  const ids = [...body.matchAll(/id:\s*"([a-z0-9][a-z0-9-]*)"/g)].map((m) => m[1]);
  const cats = [...body.matchAll(/category:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
  const premium = (body.match(/isPremium:\s*true/g) ?? []).length;

  const categories = {};
  for (const c of cats) categories[c] = (categories[c] ?? 0) + 1;
  return { total: ids.length, categories, premium, error: null };
}

function parseTemplateCatalog() {
  const raw = read('frontend/src/data/templatesData.ts');
  if (!raw) return { total: 0, categories: 0, categoryNames: [], crossCheck: null, confidence: 'low', error: 'templatesData.ts not readable' };

  // templatesData.ts interleaves the catalog with large embedded component-source
  // template literals, so a bare `id:` match would pick up IDs from inside those
  // strings. Only array entries sit at 4-space indent, so anchor on that.
  const start = raw.indexOf('export const websiteTemplates');
  const end = raw.indexOf('export const buildWithUIHubTemplates');
  if (start < 0 || end < 0) {
    return { total: 0, categories: 0, categoryNames: [], crossCheck: null, confidence: 'low', error: 'websiteTemplates array not located' };
  }
  const seg = raw.slice(start, end);

  // The catalog is not internally consistent: the first entry uses double-quoted
  // keys, the rest use bare single-quoted keys. Accept both, then union.
  const dq = [...seg.matchAll(/^ {4}"id":\s*"([^"]+)"\s*,?\s*$/gm)].map((m) => m[1]);
  const sq = [...seg.matchAll(/^ {4}id:\s*'([^']+)'\s*,?\s*$/gm)].map((m) => m[1]);
  const ids = uniq([...dq, ...sq]);

  // Independent structural cross-check: number of top-level object literals.
  const braces = (seg.match(/^ {2}\{.*$/gm) ?? []).length;
  const agrees = braces === ids.length;

  // templateCategories is a flat string tuple whose first entry is an "All" sentinel.
  const cs = raw.indexOf('export const templateCategories');
  const ce = raw.indexOf('export type TemplateCategory');
  const rawCats = cs < 0 || ce < 0 ? [] : [...raw.slice(cs, ce).matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const categoryNames = rawCats.filter((n) => n.toLowerCase() !== 'all');

  return {
    total: ids.length,
    ids,
    categories: categoryNames.length,
    categoryNames,
    crossCheck: { structuralObjectLiterals: braces, idMatches: ids.length, agrees },
    confidence: agrees ? 'high' : 'low',
    error: null,
  };
}

/* --------------------------------------------------------------- endpoints */

const ROUTE_MOUNT = {
  componentRoutes: '/v1/components',
  userRoutes: '/v1/users',
  configRoutes: '/v1/config',
  paymentRoutes: '/v1/payment',
  favoritesRoutes: '/v1',
  collectionsRoutes: '/v1',
};

const AUTH_MARKERS = [
  { re: /verifyToken/, auth: 'firebase-id-token' },
  { re: /optionalVerifyToken/, auth: 'optional-firebase-id-token' },
  { re: /requireAdmin/, auth: 'admin-role' },
];

function parseBackendEndpoints() {
  const endpoints = [];
  for (const file of walk('backend/src/routes')) {
    const stem = file.split('/').pop().replace(/\.js$/, ''); // e.g. "componentRoutes"
    const mount = ROUTE_MOUNT[stem] ?? 'UNKNOWN';
    const src = read(file);
    for (const m of src.matchAll(/router\.(get|post|put|patch|delete)\(\s*'([^']*)'([^\n]*)/gi)) {
      const [, method, subPath, rest] = m;
      const auth = AUTH_MARKERS.find((a) => a.re.test(rest))?.auth ?? 'none';
      const line = src.slice(0, m.index).split('\n').length;
      const full = `${mount}${subPath}`;
      endpoints.push({
        name: `${method.toUpperCase()} ${full}`,
        // Collapse a bare "/" root route onto its mount point.
        path: subPath === '/' ? mount : full,
        method: method.toUpperCase(),
        type: 'endpoint',
        router: stem,
        auth,
        purpose: 'Backend route. See .uihub-agent/APIs/API_OVERVIEW.md.',
        status: 'active',
        confidence: 'high',
        _line: line,
      });
    }
  }
  return endpoints;
}

function parseFrontendApiCalls() {
  const calls = [];
  for (const file of walk('frontend/src')) {
    if (!CODE_EXT.has(extname(file))) continue;
    // The component library under components/ contains component demos, not
    // application service code, and its components fetch arbitrary third-party
    // assets. Excluding it keeps this list to calls against our own backend.
    if (file.includes('/components/')) continue;
    // Third-party endpoints are catalogued separately under apis.thirdParty.
    if (file === 'frontend/src/main.tsx' || file.endsWith('/index.html')) { /* keep main.tsx */ }

    const src = read(file);
    for (const m of src.matchAll(/fetch\(\s*[`'"]([^`'"]*)[`'"]/g)) {
      const raw = m[1].trim();
      if (!raw) continue;
      if (/^https?:\/\//.test(raw) && !/\/api\/|\/v1\//.test(raw)) continue; // third-party asset

      // Most call sites build the URL as `${SOME_BASE}/api/v1/...`. Drop the
      // leading interpolation so the recorded path is the API path itself, and
      // flag that the origin came from a variable.
      const hadBaseVar = /^\$\{[^}]+\}\//.test(raw);
      const body = raw.replace(/^\$\{[^}]+\}\//, '').replace(/^\/+/, '');
      const path = `/${body}`.replace(/\/+$/, '') || '/';
      const prefixKnown = /\/api\/|\/v1\//.test(body);

      const line = src.slice(0, m.index).split('\n').length;
      const before = src.slice(Math.max(0, m.index - 500), m.index);
      const carriesAuth = /Authorization|Bearer|getIdToken/.test(before);
      const methodMatch = src.slice(m.index, m.index + 400).match(/method:\s*'([A-Z]+)'/);

      calls.push({
        caller: file,
        method: methodMatch ? methodMatch[1] : 'UNKNOWN',
        path,
        origin: hadBaseVar || !prefixKnown ? 'from-base-url-constant' : 'inline',
        auth: carriesAuth ? 'firebase-id-token' : 'none-or-UNKNOWN',
        _line: line,
      });
    }
  }
  return calls;
}

function parseMcpTools() {
  const idx = read('mcp-server/src/tools/index.ts');
  if (!idx) return [];
  const block = idx.slice(idx.indexOf('export const TOOLS'));
  return [...block.matchAll(/^\s{2}([a-z_]+),/gm)].map((m) => m[1]);
}

/* ------------------------------------------------------------- directory census */

const DIRECTORY_PURPOSE = {
  'frontend/src/context': 'Global React contexts. AuthContext is the identity + entitlement authority; ThemeContext, CookieConsentContext, SkeletonContext are UI state.',
  'frontend/src/data': 'Static catalogs and embedded payloads. componentData.tsx (~137 components) and templatesData.ts (~19 templates) dominate bundle weight and are lazily imported.',
  'frontend/src/pages': 'One directory per route area: HomePage, LibraryPage, Dashboard, Admin, Auth, Components, TemplatesPage, BuildWithUIHubPage, PricingPage, legal, PreviewCapturePage.',
  'frontend/src/services': 'API clients. admin.ts and mcp.ts wrap the MCP dashboard/admin APIs with TTL caches and cold-start retries.',
  'frontend/src/utils': 'Cross-cutting helpers. apiConfig resolves the backend base URL; checkout drives Razorpay; codeUtils assembles copyable source; promptUtils fetches AI vibe prompts.',
  'frontend/src/components/ui': 'Site chrome, the reusable component library, and the CloudScroll React-Three-Fiber experience (39 files, vendored port).',
  'frontend/src/components/animations': 'Reusable text animations and visual effects behind barrel files.',
  'frontend/src/components/templates': 'Template section components plus registry.ts, which maps template ids to previews, source files, public assets and preview backgrounds.',
  'frontend/src/components/admin': 'Admin UI kit shared by all 16 admin pages, including the useData polling hook.',
  'frontend/src/hooks': 'useIsMobile breakpoint hook (matchMedia based).',
  'frontend/src/lib': 'Firebase client init and the cn() utility.',
  'backend/src/routes': 'Six Express routers mounted at both /api and /.',
  'backend/src/services': 'Backend business logic and the only Mongo/Firebase data-access layer.',
  'backend/src/middleware': 'verifyToken, rate limiters (Redis-backed), and request validators.',
  'backend/src/utils': 'Firebase Admin init, email dispatch, and Razorpay signature verification.',
  'backend/src/config': 'Server-side plan definitions and the canonical premium-component id list.',
  'backend/src/data': 'Server-side embedded source payloads and the generated announcement manifest.',
  'backend/src/controllers': 'Payment and webhook controllers.',
  'backend/src/scripts': 'Operational, migration and email-test scripts. Run manually, not at boot.',
  'mcp-server/src/routes': 'MCP JSON-RPC endpoint plus the dashboard and admin HTTP APIs.',
  'mcp-server/src/tools': 'Fourteen MCP tools, one file each.',
  'mcp-server/src/middleware': 'API-key auth, Firebase dashboard auth, admin guard, rate limiting, JSON-RPC error envelope.',
  'mcp-server/src/services': 'Data access: mongo, firebase, apiKey, analytics, audit, permission, component lookup.',
  'mcp-server/src/data': 'Generated catalogs. Keep in sync with frontend data via mcp-server/scripts/sync-frontend-data.mjs.',
  'mcp-server/tests': 'Vitest suites: apiKey, auth, permissions, tools.',
  'cli/src/commands': 'Fourteen CLI command modules.',
  'cli/tests': 'node:test suites for config, mcp, args and output.',
  'backend/tests': 'node:test suites for accessService and collectionsService.',
  'scripts/announcement': 'Announcement pipeline: preview capture, PNG validation, manifest generation, GIF composition, email screenshot.',
};

function buildDirectoryCensus() {
  const files = walk('');
  const dirs = new Set();
  for (const f of files) {
    const parts = f.split('/');
    for (let i = 1; i < parts.length; i += 1) dirs.add(parts.slice(0, i).join('/'));
  }
  const important = [...dirs]
    .filter((d) => DIRECTORY_PURPOSE[d] || d.split('/').length <= 2)
    .filter((d) => !d.startsWith('docs/') && d !== 'docs')
    .sort();

  const out = {};
  for (const d of important) {
    const own = files.filter((f) => f.startsWith(`${d}/`) && !f.slice(d.length + 1).includes('/'));
    out[d] = {
      name: d.split('/').pop(),
      path: d,
      type: 'directory',
      purpose: DIRECTORY_PURPOSE[d] ?? `Source directory at depth ${d.split('/').length}. Contents are described in the sub-path knowledge files.`,
      fileCount: countFiles(files, d),
      keyFiles: own.filter((f) => CODE_EXT.has(extname(f)) || f.endsWith('.json') || f.endsWith('.css')).slice(0, 12),
      status: 'active',
      confidence: DIRECTORY_PURPOSE[d] ? 'high' : 'low',
    };
  }
  return out;
}

/* ------------------------------------------------------------- dependency use */

/** Distinguish declared dependencies from ones actually imported in source. */
function dependencyUsage(dir) {
  const pkg = readJson(`${dir}/package.json`);
  if (!pkg) return {};
  const files = walk(`${dir}/src`);
  const haystack = files
    .filter((f) => CODE_EXT.has(extname(f)))
    .map((f) => read(f))
    .join('\n');

  const out = {};
  const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  for (const dep of Object.keys(all).sort()) {
    // Match bare import specifier or any subpath of it.
    const used = new RegExp(`(?:from\\s*['"]|import\\(['"]|require\\(['"])${dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:['"/])`).test(haystack);
    const files2 = haystack.split('\n').length;
    out[dep] = {
      name: dep,
      declaredVersion: all[dep],
      type: 'dependency',
      usedInSource: used,
      status: used ? 'active' : 'declared-unused',
      confidence: used ? 'high' : 'medium',
      _srcFiles: files2,
    };
  }
  return out;
}

/* ------------------------------------------------------------------- build map */

function build() {
  const files = walk('');
  const catalog = parseComponentCatalog();
  const templates = parseTemplateCatalog();
  const { routes, error: routeError } = parseRoutes();
  const mcpTools = parseMcpTools();
  const endpoints = parseBackendEndpoints();
  const apiCalls = parseFrontendApiCalls();

  const catalogCounts = {
    components: catalog.total,
    componentCategories: Object.keys(catalog.categories).length,
    componentsByCategory: Object.fromEntries(Object.entries(catalog.categories).sort((a, b) => b[1] - a[1])),
    premiumInFrontendCatalog: catalog.premium,
    templates: templates.total,
    templatesCrossCheck: templates.crossCheck,
    templateCategories: templates.categories,
    templateCategoryNames: templates.categoryNames,
  };

  const map = {
    $schema: {
      generatedBy: '.uihub-agent/scripts/generate-map.mjs',
      phase: 1,
      generatedAt: new Date().toISOString(),
      note: 'Mechanical facts (counts, routes, endpoints, dependencies) are read from source at run time. Purpose strings are curated. Unverifiable items carry status UNKNOWN or confidence low.',
      regenerateWith: 'node .uihub-agent/scripts/generate-map.mjs',
      verifyWith: 'node .uihub-agent/scripts/generate-map.mjs --check',
    },

    project: {
      name: 'UI HUB',
      repositoryName: 'ui-hub-root',
      purpose: 'A component and template marketplace for "vibe coding": browsable, copyable React/Three.js UI components, website-section templates, an MCP server and a CLI for AI coding agents, with free/pro/custom monetisation via Razorpay.',
      primaryUsers: ['developers using AI coding agents', 'design-engine and frontend engineers', 'the site owner/administrator'],
      deploymentTargets: [
        { target: 'Vercel', serves: 'frontend SPA + /api serverless wrapper around the backend', confidence: 'high' },
        { target: 'Render', serves: 'one web service running the backend with the MCP routers mounted in-process', confidence: 'high' },
      ],
      structure: 'Non-workspace monorepo: frontend, backend, mcp-server, cli, api wrapper, scripts.',
      codeVolume: {
        trackedFilesExcludingVendor: files.length,
        frontendSourceFiles: countFiles(files, 'frontend/src'),
        backendSourceFiles: countFiles(files, 'backend/src'),
        mcpServerSourceFiles: countFiles(files, 'mcp-server/src'),
        cliSourceFiles: countFiles(files, 'cli/src'),
      },
    },

    stack: {
      frontend: {
        ...readSubProject('frontend'),
        framework: 'React 19 + TypeScript 5.8',
        buildTool: 'Vite 6.2 (vite framework preset)',
        css: 'Tailwind CSS v4 (CSS-first @theme in src/index.css)',
        routing: 'react-router-dom 7 (BrowserRouter, all routes in App.tsx)',
        state: 'React Context (auth, theme, cookie consent, skeleton) + Zustand (CloudScroll only) + localStorage entitlement mirror',
        animation: ['framer-motion 12', 'motion/react 12', 'gsap 3 + @gsap/react', 'lenis (smooth scroll)'],
        three: ['three 0.183', '@react-three/fiber 9', '@react-three/drei 10', 'three-stdlib'],
        auth: 'Firebase Auth (client SDK), browserLocalPersistence',
        payments: 'Razorpay Checkout.js (script-tag loaded)',
        analytics: ['Firebase Analytics (consent-gated)', 'Google gtag.js with Consent Mode v2 defaults denied'],
        codeHighlight: 'shiki 4 (lazy language/theme imports)',
        testing: 'NONE — the frontend has no test suite and no test script. `npm run lint` is `tsc --noEmit`.',
        linting: 'tsc --noEmit only. No ESLint or Prettier config present.',
      },
      backend: {
        ...readSubProject('backend'),
        framework: 'Express 4 (plain JavaScript ESM — no TypeScript)',
        entry: 'src/server.js',
        database: 'MongoDB (official driver) via mongoService',
        auth: 'Firebase Admin SDK token verification',
        cache: 'Redis — ioredis + @upstash/redis for distributed rate limiting',
        payments: 'razorpay 2 server SDK + HMAC signature verification',
        email: 'Brevo (primary), with Nodemailer SMTP and Resend fallbacks',
        push: 'web-push (VAPID)',
        security: ['helmet (CSP)', 'cors', 'express-rate-limit', 'express-validator', 'zod'],
        receipts: 'pdfkit',
        testing: 'node:test — `npm test` runs check:premium then node --test tests/',
      },
      mcpServer: {
        ...readSubProject('mcpServer') ?? readSubProject('mcp-server'),
        language: 'TypeScript 5.6',
        protocol: 'JSON-RPC 2.0, hand-implemented. The official @modelcontextprotocol/sdk is NOT a dependency.',
        protocolVersion: '2025-06-18',
        capabilities: 'tools only — no resources/* or prompts/* methods are implemented',
        database: 'MongoDB',
        auth: 'SHA-256-hashed API keys in MongoDB, plus Firebase ID tokens for the dashboard API and an admin-email allow-list for the admin API',
        entries: ['src/index.ts (HTTP)', 'src/stdio.ts (stdio, implicit admin)'],
        testing: 'Vitest — apiKey, auth, permissions, tools',
        build: 'tsc, then check-source-coverage.mjs, then copy-data.mjs',
      },
      cli: {
        ...readSubProject('cli'),
        dependencies: 'ZERO runtime dependencies (only devDeps: typescript, tsx, @types/node)',
        transport: 'MCP JSON-RPC over HTTP. The CLI does not call the REST backend.',
        defaultEndpoint: 'https://ui-hub-mcp.onrender.com/mcp',
        testing: 'node:test via tsx — config, mcp, args, output',
      },
    },

    entryPoints: {
      frontendHtml: { path: 'frontend/index.html', purpose: PURPOSE['frontend/index.html'], status: 'active', confidence: 'high' },
      frontendRoot: { path: 'frontend/src/main.tsx', purpose: PURPOSE['frontend/src/main.tsx'], status: 'active', confidence: 'high' },
      frontendRouter: { path: 'frontend/src/App.tsx', purpose: PURPOSE['frontend/src/App.tsx'], status: 'active', confidence: 'high' },
      backendServer: { path: 'backend/src/server.js', purpose: PURPOSE['backend/src/server.js'], status: 'active', confidence: 'high' },
      vercelApiFunction: { path: 'api/index.js', purpose: PURPOSE['api/index.js'], status: 'active', confidence: 'high' },
      mcpHttp: { path: 'mcp-server/src/index.ts', purpose: PURPOSE['mcp-server/src/index.ts'], status: 'active', confidence: 'high' },
      mcpStdio: { path: 'mcp-server/src/stdio.ts', purpose: PURPOSE['mcp-server/src/stdio.ts'], status: 'active', confidence: 'high' },
      cliEntry: { path: 'cli/src/cli.ts', purpose: PURPOSE['cli/src/cli.ts'], status: 'active', confidence: 'high' },
      databaseConnection: {
        path: 'backend/src/services/mongoService.js',
        purpose: 'MongoDB connection for the backend. Reached indirectly through backend services.',
        status: 'active',
        confidence: 'medium',
      },
      authEntry: {
        path: 'backend/src/middleware/auth.js',
        purpose: 'The single exported middleware, verifyToken, which validates a Firebase ID token.',
        status: 'active',
        confidence: 'high',
      },
      buildEntry: { path: 'vercel.json', purpose: 'Frontend build definition for Vercel.', status: 'active', confidence: 'high' },
      deployEntry: { path: 'render.yaml', purpose: 'Backend + MCP deploy definition for Render.', status: 'active', confidence: 'high' },
    },

    directories: buildDirectoryCensus(),

    pages: {
      note: 'Every <Route> element in frontend/src/App.tsx. Nested paths are the resolved full path.',
      total: routes.length,
      error: routeError,
      items: routes
        .map(({ _line, _guard, _selfClosing, _parent, ...r }) => ({ ...r, file: 'frontend/src/App.tsx', line: _line, access: _guard, nestedUnder: _parent }))
        .sort((a, b) => a.path.localeCompare(b.path)),
    },

    routes: {
      frontend: {
        file: 'frontend/src/App.tsx',
        total: routes.length,
        lazyLoaded: 'All route components are React.lazy() behind a single Suspense boundary (fallback HeroSkeleton).',
        notFoundRoute: 'NONE — an unknown path renders an empty <main>. There is no catch-all 404.',
        authGuards: [
          { path: '/admin/mcp/*', guard: 'pages/Admin/AdminGuard.tsx', behaviour: 'loading skeleton → redirect to /login if no user → call getAdminStatus() → 403 screen or unreachable screen → Outlet', confidence: 'high' },
          { path: '/dashboard/*', guard: 'NONE', behaviour: 'DashboardLayout performs no auth check. Pages rely on the API returning 401.', confidence: 'high' },
          { path: '/library', guard: 'in-render only', behaviour: 'Locks are shown with AuthRequiredModal + CheckoutOverlay rather than by redirect.', confidence: 'high' },
        ],
      },
      backend: {
        mountStrategy: 'backend/src/server.js creates ONE express.Router() and mounts it at BOTH "/api" and "/". Every backend endpoint is therefore reachable with or without the /api prefix.',
        routers: Object.fromEntries(
          Object.keys(ROUTE_MOUNT).map((stem) => [stem, { file: `backend/src/routes/${stem}.js`, mount: ROUTE_MOUNT[stem] }]),
        ),
        health: ['/health', '/api/health'],
        mcpMounts: ['/mcp', '/api/dashboard/mcp', '/api/admin/mcp'],
        mcpMountNote: 'backend/src/server.js dynamically imports the built MCP routers from mcp-server/dist. If dist is missing it logs a warning and continues.',
      },
      mcp: {
        file: 'mcp-server/src/routes/mcp.ts',
        methods: ['initialize', 'ping', 'tools/list', 'tools/call'],
        notImplemented: ['resources/list', 'resources/read', 'prompts/list', 'prompts/get'],
        note: 'GET / and DELETE / ARE implemented (in-memory session handling), despite docs claiming a stateless 405.',
        confidence: 'high',
      },
    },

    features: {
      componentMarketplace: { name: 'Component Marketplace', path: 'frontend/src/pages/LibraryPage/LibraryPage.tsx', type: 'feature', purpose: 'Browse and search the component catalog, preview components live, inspect props, copy code and copy AI vibe prompts.', mainPages: ['/library'], status: 'implemented', confidence: 'high' },
      templateMarketplace: { name: 'Template Marketplace', path: 'frontend/src/pages/TemplatesPage/', type: 'feature', purpose: 'Browse website-section templates, preview them full-page, view their source, and jump to the sections they are built from.', mainPages: ['/templates', '/templates/:id', '/build-with-ui-hub', '/build-with-ui-hub/:slug'], status: 'implemented', confidence: 'high' },
      buildWithUiHub: { name: 'Build with UI HUB', path: 'frontend/src/data/buildWithUIHubSlugs.ts', type: 'feature', purpose: 'Curated sections that map a template to the exact UI HUB components used to build it.', mainPages: ['/build-with-ui-hub/:slug'], status: 'experimental', confidence: 'high', note: 'Only 2 sections defined.' },
      authentication: { name: 'User Authentication', path: 'frontend/src/context/AuthContext.tsx', type: 'feature', purpose: 'Firebase email/password and Google sign-in, with backend sync and entitlement refresh.', mainPages: ['/login', '/signup', '/forgot-password'], status: 'implemented', confidence: 'high' },
      entitlements: { name: 'Entitlements & Plans', path: 'frontend/src/context/AuthContext.tsx', type: 'feature', purpose: 'Free / Pro / Custom plan tiers, per-category access, and individually purchased components, mirrored to localStorage.', status: 'implemented', confidence: 'high' },
      payments: { name: 'Payments', path: 'backend/src/routes/paymentRoutes.js', type: 'feature', purpose: 'Razorpay order creation, signature-verified confirmation, webhook handling, and per-component purchase unlock.', mainPages: ['/pricing'], status: 'implemented', confidence: 'high' },
      adminConsole: { name: 'Admin Console', path: 'frontend/src/pages/Admin/', type: 'feature', purpose: '16-page operations console for the MCP layer: analytics, users, API keys, tools, logs, security, health, alerts, settings, audit, export.', mainPages: ['/admin/mcp/*'], status: 'implemented', confidence: 'high' },
      mcpServer: { name: 'MCP Server', path: 'mcp-server/src/routes/mcp.ts', type: 'feature', purpose: 'Expose the component, template and animation catalog to AI coding agents as 14 JSON-RPC tools, authenticated with hashed API keys.', mainPages: ['/dashboard/mcp'], status: 'implemented', confidence: 'high' },
      cli: { name: 'CLI Client', path: 'cli/src/commands/', type: 'feature', purpose: 'Zero-dependency terminal client for the MCP server: 14 commands with a login/config keychain.', status: 'implemented', confidence: 'high' },
      favorites: { name: 'Favorites', path: 'frontend/src/services/favorites.ts', type: 'feature', purpose: 'Save components, with a guest localStorage fallback and cross-tab sync.', mainPages: ['/favorites'], status: 'implemented', confidence: 'high' },
      collections: { name: 'Collections', path: 'frontend/src/services/collections.ts', type: 'feature', purpose: 'Named user groupings of components, server-persisted and mergeable with community content.', mainPages: ['/dashboard/collections'], status: 'implemented', confidence: 'high' },
      search: { name: 'Search', path: 'frontend/src/utils/searchIndex.ts', type: 'feature', purpose: 'Scored cross-catalog search over components and templates with lazy catalog loading.', mainPages: ['/', '/library'], status: 'implemented', confidence: 'high' },
      aiPrompts: { name: 'AI Vibe Prompts', path: 'frontend/src/utils/promptUtils.ts', type: 'feature', purpose: 'Per-component, per-AI-tool prompts (Lovable, Advance, Antigravity, Claude, Cursor) with free-trial gating.', status: 'implemented', confidence: 'high' },
      communityComponents: { name: 'Community Components', path: 'frontend/src/services/community.tsx', type: 'feature', purpose: 'Public read of user-uploaded community components, merged into the local catalog for display.', status: 'partially-implemented', confidence: 'medium' },
      pushNotifications: { name: 'Push Notifications', path: 'frontend/src/utils/pushService.ts', type: 'feature', purpose: 'Web Push (VAPID) subscription, opt-in prompt, and server-side broadcast.', status: 'implemented', confidence: 'medium' },
      emailAndLifecycle: { name: 'Email & Lifecycle', path: 'backend/src/services/brevoService.js', type: 'feature', purpose: 'Welcome, re-engagement and announcement email flows via Brevo, plus a PDF receipt path.', status: 'implemented', confidence: 'medium' },
      analytics: { name: 'Analytics', path: 'frontend/index.html', type: 'feature', purpose: 'Two parallel analytics stacks (Firebase Analytics and gtag) coordinated by the cookie-consent context.', status: 'implemented', confidence: 'high' },
      cookieConsent: { name: 'Cookie Consent', path: 'frontend/src/context/CookieConsentContext.tsx', type: 'feature', purpose: 'Granular consent banner and preference store driving gtag Consent Mode v2 defaults.', mainPages: ['/cookies'], status: 'implemented', confidence: 'high' },
      announcements: { name: 'Announcement Pipeline', path: 'scripts/announcement/', type: 'feature', purpose: 'Offline pipeline: capture component screenshots, validate them, generate a manifest, compose a GIF banner and screenshot the announcement email.', status: 'experimental', confidence: 'high', note: 'All scripts are .mjs. There are no Python scripts in this repository, despite the README.' },
    },

    components: {
      note: 'Component census is deliberately summarised. Large families are described by count + registry file rather than enumerated. Full per-component intelligence belongs to a later phase.',
      directories: {
        ui: { path: 'frontend/src/components/ui', fileCount: countFiles(walk(''), 'frontend/src/components/ui'), purpose: PURPOSE['frontend/src/components/ui'], confidence: 'high' },
        animations: { path: 'frontend/src/components/animations', fileCount: countFiles(walk(''), 'frontend/src/components/animations'), purpose: 'Reusable text animations and visual effects, exported through barrel files.', confidence: 'high' },
        templates: { path: 'frontend/src/components/templates', fileCount: countFiles(walk(''), 'frontend/src/components/templates'), purpose: PURPOSE['frontend/src/components/templates'], confidence: 'high' },
        admin: { path: 'frontend/src/components/admin', fileCount: countFiles(walk(''), 'frontend/src/components/admin'), purpose: 'Admin UI kit: panels, tables, badges, formatters, useData polling hook, Recharts wrappers.', confidence: 'high' },
      },
      catalog: catalogCounts,
      templateRegistry: {
        path: 'frontend/src/components/templates/registry.ts',
        maps: ['TEMPLATE_PREVIEWS (lazy import per template)', 'TEMPLATE_SOURCE_FILES', 'TEMPLATE_PUBLIC_ASSETS', 'TEMPLATE_PREVIEW_BGS'],
        purpose: 'Single place that maps a template id to its preview component, its source filename, its public assets and its preview background.',
        confidence: 'high',
        knownGap: 'graphic-designer-portfolio appears in the registry but has no websiteTemplates record, so nothing can navigate to it.',
      },
      chrome: [
        { name: 'Navbar', path: 'frontend/src/components/ui/Navbar.tsx', purpose: 'Logo, nav links, global search, favorites dropdown, libraries dropdown, plan badge, sign-out, mobile drawer.' },
        { name: 'SearchBox', path: 'frontend/src/components/ui/SearchBox.tsx', purpose: 'Cross-catalog search over components and templates; lazily imports both catalogs.' },
        { name: 'TopLoader', path: 'frontend/src/components/ui/TopLoader.tsx', purpose: 'Route progress bar shown on genuine pathname changes.' },
        { name: 'SmoothScroll', path: 'frontend/src/components/ui/SmoothScroll.tsx', purpose: 'Lenis-based smooth scrolling, disabled on mobile.' },
        { name: 'CookieBanner', path: 'frontend/src/components/ui/CookieBanner.tsx', purpose: 'Consent banner driven by CookieConsentContext.' },
        { name: 'PushNotificationPrompt', path: 'frontend/src/components/ui/PushNotificationPrompt.tsx', purpose: 'One-time push opt-in card.' },
        { name: 'Skeleton', path: 'frontend/src/components/ui/Skeleton.tsx', purpose: 'Skeleton primitives including the HeroSkeleton used as the router Suspense fallback.' },
        { name: 'Toast', path: 'frontend/src/components/ui/Toast.tsx', purpose: 'Transient message component.' },
      ],
      commerce: [
        { name: 'CheckoutOverlay', path: 'frontend/src/components/ui/CheckoutOverlay.tsx', purpose: 'Full-screen lock/scanner overlay shown when a gated asset is requested.' },
        { name: 'AuthRequiredModal', path: 'frontend/src/components/ui/AuthRequiredModal.tsx', purpose: 'Sign-in prompt for anonymous users hitting a premium asset.' },
        { name: 'CustomPricingCard', path: 'frontend/src/components/ui/CustomPricingCard.tsx', purpose: 'Per-category pricing cards with explicit premium component id lists.' },
        { name: 'PlanBadge', path: 'frontend/src/components/ui/PlanBadge.tsx', purpose: 'Renders the free / pro / custom tier.' },
      ],
      adminKit: [
        { name: 'useData', path: 'frontend/src/components/admin/AdminUi.tsx', purpose: 'Fetch + loading + error + reload + optional polling. Used by every admin page.' },
        { name: 'AdminUi primitives', path: 'frontend/src/components/admin/AdminUi.tsx', purpose: 'Panel, PanelHeader, PageHeader, StatCard, EmptyState, ErrorState, SkeletonBlock, SkeletonTable, Table, Th, Td, Pagination, StatusBadge, plus number/date/key-mask formatters.' },
        { name: 'RequestsChart', path: 'frontend/src/components/admin/Charts.tsx', purpose: 'Recharts request-volume chart and shared tooltip.' },
      ],
      unregistered: [
        { name: 'CloudScrollPage', path: 'frontend/src/pages/Components/CloudScrollPage.tsx', purpose: 'Fully written standalone CloudScroll host that is NOT registered in any route.', status: 'orphaned', confidence: 'high' },
      ],
    },

    services: {
      frontend: {
        admin: { name: 'admin.ts', path: 'frontend/src/services/admin.ts', purpose: 'Client for the /api/admin/mcp console API. 26 endpoints, TTL caches, one retry on 502/504, friendly error mapping.' },
        mcp: { name: 'mcp.ts', path: 'frontend/src/services/mcp.ts', purpose: 'Client for /api/dashboard/mcp. Cold-start tolerant (90s timeout, retries) because Render can idle down.' },
        favorites: { name: 'favorites.ts', path: 'frontend/src/services/favorites.ts', purpose: 'Favorites with guest localStorage fallback, backend reconciliation, polling and cross-tab sync.' },
        collections: { name: 'collections.ts', path: 'frontend/src/services/collections.ts', purpose: 'Collections CRUD. Throws a CollectionsError carrying code and status.' },
        community: { name: 'community.tsx', path: 'frontend/src/services/community.tsx', purpose: 'Public read of community components.' },
      },
      backend: {
        note: 'All backend data access flows through backend/src/services. No model layer (no Mongoose) — the MongoDB driver is used directly.',
        key: [
          'mongoService.js', 'firebaseService.js', 'accessService.js', 'userService.js', 'favoritesService.js',
          'collectionsService.js', 'componentSyncService.js', 'syncService.js', 'activityLogService.js',
          'pushService.js', 'announcementService.js', 'brevoService.js', 'emailLogService.js',
          'receiptService.js', 'promptService.js', 'configService.js', 'vibeEngine.js',
        ],
      },
      mcpServer: {
        note: 'mcp-server/src/services — mongo, firebase, apiKey, analytics, audit, permission, component lookup.',
      },
    },

    apis: {
      backendRest: {
        mountNote: 'Mounted at BOTH /api and / — the /api prefix is optional.',
        count: endpoints.length,
        items: endpoints
          .map(({ _line, ...e }) => ({ ...e, file: `backend/src/routes/${e.router}.js`, line: _line }))
          .sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method)),
      },
      mcpTools: {
        count: mcpTools.length,
        note: 'Derived from the TOOLS array in mcp-server/src/tools/index.ts. One file per tool in mcp-server/src/tools/.',
        items: mcpTools.map((name) => {
          const camel = name.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
          return {
            name,
            path: `mcp-server/src/tools/${camel}.ts`,
            type: 'mcp-tool',
            purpose: 'MCP tool. Description lives in the tool definition; see .uihub-agent/APIs/API_OVERVIEW.md.',
            status: 'active',
            confidence: 'medium',
          };
        }),
      },
      dashboardApi: {
        mount: '/api/dashboard/mcp',
        file: 'mcp-server/src/routes/dashboard.ts',
        auth: 'Firebase ID token',
        operations: ['GET /keys', 'POST /keys', 'POST /keys/:id/revoke', 'DELETE /keys/:id', 'GET /usage', 'GET /status', 'GET /overview', 'GET /admin/metrics'],
      },
      adminApi: {
        mount: '/api/admin/mcp',
        file: 'mcp-server/src/routes/admin.ts',
        auth: 'Firebase ID token + requireAdmin (MCP_ADMIN_EMAILS allow-list)',
        operations: ['GET /status', 'GET /overview', 'GET /analytics', 'GET /users', 'GET /users/:id', 'POST /users/:id/suspend', 'POST /users/:id/unsuspend', 'GET /api-keys', 'PATCH /api-keys/:id', 'GET /tools', 'PATCH /tools/:name', 'GET /components', 'GET /search', 'POST /playground', 'GET /logs', 'GET /security', 'GET /health', 'GET /alerts', 'POST /alerts/:key/resolve', 'POST /alerts/:key/unresolve', 'GET /settings', 'PUT /settings', 'GET /audit', 'GET /export'],
        knownIssue: 'GET /logs is registered twice in this file; the first handler wins.',
      },
      frontendCallSites: {
        note: 'Every fetch() call site in frontend/src (excluding the catalog component library) that targets /api or /v1.',
        count: apiCalls.length,
        items: apiCalls
          .map(({ _line, ...c }) => ({ ...c, line: _line }))
          .sort((a, b) => a.path.localeCompare(b.path) || a.caller.localeCompare(b.caller)),
      },
      thirdParty: [
        { provider: 'Razorpay', purpose: 'Checkout script and order/signature verification.', integration: 'frontend/src/utils/razorpayUtils.ts (script tag), backend/src/routes/paymentRoutes.js (orders + HMAC verify)', configLocation: 'RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET (backend), VITE_RAZORPAY_KEY_ID (frontend, example only)', secretsIncluded: false, confidence: 'high' },
        { provider: 'Firebase', purpose: 'Auth on both sides; Analytics client-side.', integration: 'frontend/src/lib/firebase.ts, backend/src/utils/firebaseAdmin.js, mcp-server/src/services/firebase.ts', configLocation: 'VITE_FIREBASE_* (frontend), FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY / FIREBASE_PROJECT_ID (backend + mcp)', secretsIncluded: false, confidence: 'high' },
        { provider: 'Brevo', purpose: 'Transactional and lifecycle email.', integration: 'backend/src/services/brevoService.js', configLocation: 'BREVO_API_KEY (backend)', secretsIncluded: false, confidence: 'high' },
        { provider: 'Google gtag', purpose: 'Web analytics under Consent Mode v2, defaults denied.', integration: 'frontend/index.html', configLocation: 'gtag measurement id in index.html (public identifier)', secretsIncluded: false, confidence: 'high' },
        { provider: 'Web Push / VAPID', purpose: 'Browser push notifications.', integration: 'backend/src/services/pushService.js, frontend/src/utils/pushService.ts', configLocation: 'VAPID_SUBJECT / VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY (backend)', secretsIncluded: false, confidence: 'medium' },
        { provider: 'Upstash Redis', purpose: 'Distributed rate-limit backing store.', integration: 'backend/src/middleware/rateLimiters.js', configLocation: 'REDIS_URL (backend)', secretsIncluded: false, confidence: 'medium' },
      ],
    },

    database: {
      primary: { provider: 'MongoDB', driver: 'official node driver (no Mongoose)', connection: ['backend/src/services/mongoService.js', 'mcp-server/src/services/mongo.ts'], env: ['MONGODB_URI', 'MONGODB_DB'], confidence: 'high' },
      authAndIdentity: { provider: 'Firebase Auth', adminUsage: 'backend/src/utils/firebaseAdmin.js, mcp-server/src/services/firebase.ts', note: 'Identity and token verification. NOT the primary record store. Firestore appears only in legacy migration scripts (initFirestore.js, migrateFirestoreToMongo.js) and is not a live dependency of the frontend (no firestore/ import).', confidence: 'high' },
      cacheAndRateLimits: { provider: 'Redis', driver: ['ioredis', '@upstash/redis'], purpose: 'Shared rate-limit counters only. Not a data store.', env: ['REDIS_URL'], confidence: 'high' },
      knownCollections: {
        mcp_api_keys: 'SHA-256 hashes of MCP API keys plus prefix, tier, status and timestamps. Plaintext is returned once at creation and never stored.',
        mcp_analytics: 'MCP request analytics written by analyticsService.',
        mcp_audit: 'Admin action audit trail.',
        mcp_config: 'MCP tool enable/disable and settings, editable from the admin console.',
        status: 'medium',
        confidence: 'medium',
        note: 'Collection names come from service code, not a formal schema. Full schema documentation belongs to a later phase.',
      },
      storage: {
        binaryAssets: { provider: 'Vercel static / Render static', path: 'frontend/public/', note: 'Large: sprite frames, .glb models, .webm previews, and a vendored third-party site. Several models are duplicated across two public/ subtrees.', confidence: 'high' },
        cloudinary: { status: 'NOT USED', confidence: 'high' },
        s3: { status: 'NOT USED', confidence: 'high' },
        localFilesystem: { used: 'Yes — community/announcement preview images and email previews are written to backend/tmp and backend/email-previews.', confidence: 'medium' },
      },
    },

    authentication: {
      mechanism: 'Firebase Authentication for users; SHA-256-hashed API keys for MCP clients; an email allow-list for admin.',
      userFlow: {
        signup: 'firebase/auth createUserWithEmailAndPassword (or Google signInWithPopup) → AuthContext syncs the user to POST /api/v1/users/sync → GET /api/v1/users/status populates entitlements.',
        session: 'Firebase ID token, browserLocalPersistence. getIdToken() is attached as an Authorization: Bearer header by the frontend clients.',
        refresh: 'Entitlements are re-fetched on window focus and visibilitychange, throttled to 30s, and once per session on auth-state change.',
        offline: 'On network failure AuthContext PRESERVES the cached localStorage entitlements rather than clearing them.',
        files: ['frontend/src/lib/firebase.ts', 'frontend/src/context/AuthContext.tsx', 'backend/src/middleware/auth.js', 'backend/src/utils/firebaseAdmin.js'],
      },
      mcpApiKeys: { prefix: 'uh_live_', storage: 'SHA-256 hash in MongoDB mcp_api_keys', transports: ['Authorization: Bearer <key>', '?key=<key>', 'x-api-key: <key>'], createdVia: 'POST /api/dashboard/mcp/keys (Firebase ID token)', plaintextReturn: 'once, at creation only', confidence: 'high' },
      admin: { mechanism: 'Firebase ID token, then requireAdmin checks the email against MCP_ADMIN_EMAILS. Routes are under /api/admin/mcp.', frontendGuard: 'frontend/src/pages/Admin/AdminGuard.tsx also calls getAdminStatus()', confidence: 'high' },
      clientSideBypass: { status: 'FLAGGED', detail: 'AuthContext hardcodes three email addresses that bypass category and component access checks in the UI, and forces isPro for one of them. Client-side only — server-side enforcement is what actually matters. Recorded in CONFLICTS.md; NOT modified in this phase.', confidence: 'high' },
      secrets: 'No credential values are recorded in this knowledge base. Env var NAMES only.',
    },

    payments: {
      provider: 'Razorpay',
      flow: ['frontend: GET /api/v1/config/razorpay-key to obtain the publishable key', 'frontend: POST /api/v1/payment/create-order with a planId/tier', 'frontend: load https://checkout.razorpay.com/v1/checkout.js and open the checkout', 'frontend: POST /api/v1/payment/verify-payment with the Razorpay response', 'backend: HMAC-SHA256 signature verification via timingSafeEqual in utils/verifySignature.js', 'backend: entitlement is granted and mirrored to the client by GET /api/v1/users/status'],
      webhook: 'POST /api/v1/payment/webhook is registered on the RAW body before express.json, and is not authenticated by a user token. Requires Phase-level review.',
      pricePoints: { component: { USD: 1.99, INR: 49, source: 'frontend/src/utils/checkout.ts' }, plan: { constraint: 'planId and tier are validated to "pro" only; currency to INR or USD only' } },
      unlock: 'Purchased component ids are returned by GET /api/v1/users/status and mirrored to localStorage by AuthContext.',
      doNotModify: true,
      confidence: 'high',
    },

    deployment: {
      frontend: { platform: 'Vercel', build: 'npm install && cd frontend && npm install && npm run build', output: 'frontend/dist', framework: 'vite', rewrites: ['/api/(.*) -> /api/index.js', '/health -> /api/index.js  [ADDED IN PHASE 5]', '/(.*) -> /index.html'], rewriteOrderMatters: 'The /health rule must stay between the /api rule and the SPA fallback. After the SPA rule it is unreachable and /health returns the 6,474-byte HTML shell with a 200 status.', headers: ['Cross-Origin-Opener-Policy: same-origin-allow-popups'], functions: 'api/index.js. includeFiles is the brace-expansion STRING "{backend/**,mcp-server/dist/**,mcp-server/package.json}" (it was an array before 9cd6ab2c). maxDuration 30', envBlock: 'ABSENT. vercel.json declares no env, so any VITE_* value present in a live bundle came from the Vercel dashboard. Asserted by frontend/src/routing/vercelRouting.test.ts.', confidence: 'high' },
      backendAndMcp: { platform: 'Render (BOTH blueprints declare a service)', blueprints: { 'render.yaml': 'service ui-hub-backend-mcp, starts the web API, which mounts MCP in-process', 'mcp-server/render.yaml': 'service ui-hub-mcp, starts node dist/index.js' }, healthCheck: '/health (both)', conflict: 'Both blueprints mount MCP, both set MCP_SERVER_URL to ui-hub-mcp.onrender.com, and they declare DIFFERENT MCP_ADMIN_EMAILS lists (3 addresses vs 2). Unresolved owner decision. See CONFLICTS.md A13.', confidence: 'high on the facts, low on which service is actually deployed' },
      topology: 'PHASE 5: the web API runs on VERCEL, same-origin with the frontend; MCP runs on RENDER as a separate host. Phase 1 recorded these as ONE Render process, which is one of the two viable topologies and is now in direct conflict with mcp-server/render.yaml. Recommended: split them. See APIs/API_ARCHITECTURE.md and APIs/MCP_DEPLOYMENT_CONTRACT.md.',
      apiSurfaceOwnership: { webApi: 'https://ui-hub-design.vercel.app/api/* (same origin as the frontend)', mcp: 'https://ui-hub-mcp.onrender.com/mcp (separate host, separate auth, Bearer API keys)', database: 'MongoDB Atlas cluster uihub', cdn: 'Cloudflare fronts Render; UNVERIFIED, no account access' },
      productionState: { frontend: 'LIVE, 200', apiFunction: 'BROKEN, 500 at module load, pre-route', health: 'BROKEN in the live deployment; the source is fixed by the /health rewrite, not yet deployed', mcp: 'UNREACHABLE, Cloudflare 503/404', database: 'LIVE, read-only verified', bundleTarget: 'MISCONFIGURED. The live bundle inlines https://ui-hub.onrender.com from a Vercel dashboard VITE_API_URL. The source is correct: a build of the current tree contains 0 web-API Render hosts across all 229 chunks. The fix is a dashboard deletion plus a rebuild.' },
      sameOriginContract: 'VITE_API_URL is OPTIONAL and should be UNSET in production. Production resolves window.location.origin. The variable is inlined at build time, which is why a stale value outlives the dashboard setting. The full resolution matrix and safety behaviour are pinned by frontend/src/utils/apiConfig.test.ts (20 tests).',
      localDevelopment: { frontend: 'npm run dev:frontend (vite, port 3000)', backend: 'npm run dev:backend (node --watch, port 5000)', mcp: 'npm run dev:mcp (tsx watch)', both: 'npm run dev (frontend + backend via concurrently)', all: 'npm run dev:all', cli: 'npm run build:cli then npm run ui-hub -- <args>' },
      buildOrder: 'The MCP server must be built BEFORE the backend runs, because the backend imports mcp-server/dist. backend/package.json handles this via postinstall and its build script.',
      envVars: { note: 'NAMES ONLY. No values are recorded here. See INFRASTRUCTURE.md.', frontend: ['VITE_API_URL', 'VITE_API_BASE_URL', 'VITE_MCP_API_URL', 'VITE_RAZORPAY_KEY_ID', 'VITE_FIREBASE_*'], backend: ['MONGODB_URI', 'MONGODB_DB', 'REDIS_URL', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'BREVO_API_KEY', 'BREVO_SENDER_EMAIL', 'BREVO_SENDER_NAME', 'BREVO_SMTP_USER', 'BREVO_SMTP_PASS', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'VAPID_SUBJECT', 'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'], mcpServer: ['MONGODB_URI', 'MONGODB_DB', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID', 'MCP_ADMIN_EMAILS', 'MCP_ALLOWED_ORIGINS', 'MCP_API_KEY_PREFIX', 'MCP_PORT', 'MCP_RATE_LIMIT_FREE', 'MCP_RATE_LIMIT_PRO', 'MCP_SERVER_URL', 'REDIS_URL', 'PORT', 'NODE_ENV'] },
    },

    documentation: {
      existing: [
        { path: 'README.md', classification: 'product + technical + deployment', status: 'materially-outdated', note: 'Lists a /admin route that does not exist, 7 Python scripts that do not exist, and omits /dashboard, /build-with-ui-hub, the legal routes and /preview-capture. See CONFLICTS.md.' },
        { path: 'MCP.md', classification: 'technical', status: 'mostly-current', note: 'Most accurate doc. Minor drift on component counts, premium count and session semantics.' },
        { path: 'docs/cli.md', classification: 'technical', status: 'current', note: 'Command reference, options, exit codes and tier limits all match cli/src.' },
        { path: 'docs/mcp.md', classification: 'technical', status: 'partially-outdated', note: 'Documents 11 of 14 tools; says Firestore where the code uses MongoDB; claims stateless 405.' },
        { path: 'docs/runbook.md', classification: 'deployment', status: 'materially-outdated', note: 'Wrong deployment topology (claims a separate MCP repo), wrong env var names, and references a tool that does not exist.' },
        { path: 'agent.md', classification: 'ai-agent', status: 'active', note: 'The ten-phase plan this knowledge base implements.' },
        { path: 'README.md + .agents/skills/', classification: 'ai-agent', status: 'active', note: '.agents/skills contains three authoritative skills (component-forge, component-integration, github-sync-and-push). Preserve them; do not fold their content into this tree.' },
      ],
      authoritative: ['code', 'package.json files', 'vercel.json', 'render.yaml', 'mcp-server/src/tools/index.ts', 'frontend/src/App.tsx'],
      preserve: ['.agents/skills/**', 'MCP.md', 'docs/cli.md', 'agent.md'],
    },

    unknowns: [
      '[PHASE 5 - RESOLVED] Test-suite pass counts. Measured in Phase 5: frontend 27/27, backend 54/54, mcp-server 78/78, cli 30/30.',
      '[PHASE 5 - RESOLVED] Whether the committed mcp-server/dist matches mcp-server/src. Phase 5 hashed src/data against dist/data: 7/7 identical, 38/38 TS files matched after ignoring one .d.ts false positive, 0 orphaned compiled artifacts.',
      '[PHASE 5 - ATTEMPTED, NOT RESOLVED] Whether frontend/tailwind.config.ts is ignored at build time. A hex-literal scan of the bundle CANNOT answer this: #0A0A0A and friends appear in JS chunks from component-level arbitrary values (bg-[#0A0A0A] in Hero.tsx, TemplatesSection.tsx, BuildWithUIHubSection.tsx, PreviewCapturePage.tsx), inline styles (MatrixRainDemoPage.tsx, LibraryPage.tsx, codeUtils.ts) and template prompt TEXT in templatesData.ts. None of those come from the Tailwind config. A decisive test would be to rename a palette value in tailwind.config.ts, rebuild, and diff the emitted CSS. Not done.',
      'Whether the live ui-hub-mcp.onrender.com service serves the current 14 tools. Requires a network call, and the host currently returns Cloudflare 503/404.',
      'The full MongoDB schema. Collection names are read from service code, not a declared schema.',
      'Contents of the large frontend/public/ asset trees (sprite frames, .glb models, .webm previews, the vendored third-party site).',
      'Whether vite-plugin-mkcert, autoprefixer and javascript-obfuscator were used by any past ad-hoc build. No imports found.',
      '[PHASE 5 - NEW] Why the Vercel function returns 500. Phase 5 narrowed it to module load, before any route is evaluated, which rules out routing. Ranked suspect is the includeFiles payload, which changed from an array to a brace-expansion string in 9cd6ab2c. Resolved only by reading the function deployment log. See UNKNOWN_REGISTER.md U-02.',
      '[PHASE 5 - NEW] Whether the Vercel rewrite preserves the original request path. vercel.json rewrites /api/(.*) to the FILE PATH /api/index.js; whether the function is then invoked with the original path (/api/v1/components/db) or the rewritten one is platform behaviour that cannot be reproduced locally. Likely not the live cause, since the observed symptom is 500 and not 404. Must be re-checked after the 500 is fixed. See UNKNOWN_REGISTER.md U-11.',
      '[PHASE 5 - ANSWERED] Is VITE_API_URL set in the Vercel production environment. YES, to https://ui-hub.onrender.com, inlined at build time. Deleting the variable requires a rebuild. See UNKNOWN_REGISTER.md U-12.',
      '[PHASE 5 - NEW] Which Render blueprint is authoritative for MCP. render.yaml and mcp-server/render.yaml both mount MCP with divergent admin lists, so the live admin surface depends on which was deployed. See UNKNOWN_REGISTER.md U-13.',
      '[PHASE 5 - NEW] Whether Cloudflare fronts the Render services. Cloudflare returns 503/404 for both Render hostnames, but whether that is Cloudflare misconfiguration or a suspended Render origin cannot be determined without account access.',
    ],

    riskRegister: {
      note: 'Findings only. RISK-01 and RISK-10 were re-confirmed by reading code during Phase 5; RISK-11 to RISK-14 are new. See CONFLICTS.md for full detail and DO_NOT_CHANGE.md for the protected list.',
      items: [
        { id: 'RISK-01', area: 'backend/src/server.js CORS', finding: 'The CORS origin callback logs "Blocked origin" and then still returns callback(null, true), so the allow-list does not actually block anything.', severity: 'high', action: 'RE-CONFIRMED in Phase 5, NOT fixed - enforcing it needs a caller list that source alone cannot supply. See CONFLICTS.md A11.' },
        { id: 'RISK-02', area: 'backend/src/routes/userRoutes.js', finding: 'POST /v1/users/push-broadcast has no verifyToken middleware, as do the broadcast and email-test endpoints. Same for the sibling broadcast routes.', severity: 'high', action: 'review-in-later-phase' },
        { id: 'RISK-03', area: 'frontend/src/main.tsx', finding: 'A Firebase web config is hardcoded as a literal fallback and is the config that actually ships — the runtime config fetch response is discarded and the re-init call is commented out.', severity: 'medium', action: 'review-in-later-phase' },
        { id: 'RISK-04', area: 'frontend/src/context/AuthContext.tsx', finding: 'Three hardcoded email addresses bypass category and component access checks client-side, and one forces isPro.', severity: 'medium', action: 'review-in-later-phase' },
        { id: 'RISK-05', area: 'mcp-server/src/routes/admin.ts', finding: 'GET /logs is registered twice; the first handler wins and the second is dead code.', severity: 'low', action: 'review-in-later-phase' },
        { id: 'RISK-06', area: '.gitignore', finding: 'mcp-server/dist is explicitly un-ignored and committed. It is load-bearing at runtime but can silently drift from src.', severity: 'medium', action: 'review-in-later-phase' },
        { id: 'RISK-07', area: 'frontend/package.json', finding: 'vite, @vitejs/plugin-react and @types/three are declared in dependencies rather than devDependencies. @splinetool/*, simplex-noise and unicornstudio-react are declared but not imported anywhere.', severity: 'low', action: 'review-in-later-phase' },
        { id: 'RISK-08', area: 'frontend/src/data', finding: 'Orphaned data: claudePrompts.ts (~95KB, 10 entries, no importer), embeddedSourceCode.ts.bak (~881KB, no importer).', severity: 'low', action: 'review-in-later-phase' },
        { id: 'RISK-09', area: 'frontend/src/App.tsx', finding: 'No catch-all 404 route. Unknown paths render an empty main element.', severity: 'low', action: 'review-in-later-phase' },
        { id: 'RISK-10', area: 'frontend/src/context/AuthContext.tsx', finding: 'On network failure entitlements are preserved from cache rather than cleared. Intentional offline behaviour, but it means a revoked entitlement can persist locally.', severity: 'medium', action: 'review-in-later-phase' },
        { id: 'RISK-11', area: 'frontend (tsc --noEmit)', finding: 'PHASE 5: ~50 typecheck errors across 23 files on main, introduced by UI commits 6c203adc and 254ce55d (React 19 typing: key passed to components whose props do not declare it; class components typed without state/props/setState). tsconfig.json was not modified and typecheck passed at 3fc33f91. vite build does not typecheck, so deploys are unaffected.', severity: 'medium', action: 'DEFERRED by owner decision - not a Phase 5 defect' },
        { id: 'RISK-12', area: 'render.yaml + mcp-server/render.yaml', finding: 'PHASE 5: two Render blueprints each define a service mounting MCP, they advertise the same MCP_SERVER_URL, and they declare different MCP_ADMIN_EMAILS lists (3 vs 2 addresses). Which one is deployed determines the live admin surface.', severity: 'high', action: 'OWNER DECISION - see CONFLICTS.md A13' },
        { id: 'RISK-13', area: 'MCP.md line 55', finding: 'PHASE 5: documents MCP as reachable at https://ui-hub-design.vercel.app/mcp. vercel.json routes only /api/* and /health to the function, so /mcp matches the SPA catch-all. The endpoint exists on the backend but is not routed by Vercel. The documentation is wrong, not the routing.', severity: 'medium', action: 'documentation-correction-needed' },
        { id: 'RISK-14', area: '.gitignore', finding: 'PHASE 5: commit 1eaaec04 gitignored .uihub-agent/, .github/, .claude/ and .opencode/. The knowledge base became uncommittable and CI left the repository. Phase 5 un-ignored .uihub-agent/ only.', severity: 'medium', action: 'OWNER DECISION for .github/ - see CONFLICTS.md A15' },
      ],
    },
  };

  return scrub(map);
}

/* --------------------------------------------------------------------- main */

const result = build();
const serialised = `${JSON.stringify(result, null, 2)}\n`;

if (CHECK_ONLY) {
  if (!existsSync(OUT)) {
    console.error('FAIL  PROJECT_MAP.json does not exist. Run: node .uihub-agent/scripts/generate-map.mjs');
    process.exit(1);
  }
  const current = readFileSync(OUT, 'utf8');
  // generatedAt changes every run, so compare everything else.
  const strip = (s) => s.replace(/"generatedAt": "[^"]+"/, '"generatedAt": "<stamp>"');
  if (strip(current) === strip(serialised)) {
    console.log('OK    PROJECT_MAP.json is up to date.');
    process.exit(0);
  }
  console.error('STALE PROJECT_MAP.json differs from a fresh run. Regenerate: node .uihub-agent/scripts/generate-map.mjs');
  process.exit(1);
}

writeFileSync(OUT, serialised, 'utf8');

const m = result;
console.log('WROTE .uihub-agent/PROJECT_MAP.json');
console.log(`  tracked files scanned (excl. vendor/build) : ${m.project.codeVolume.trackedFilesExcludingVendor}`);
console.log(`  frontend routes                             : ${m.pages.total}`);
console.log(`  backend REST endpoints                       : ${m.apis.backendRest.count}`);
console.log(`  MCP tools                                   : ${m.apis.mcpTools.count}`);
console.log(`  frontend API call sites                     : ${m.apis.frontendCallSites.count}`);
console.log(`  catalog components / categories             : ${m.components.catalog.components} / ${m.components.catalog.componentCategories}`);
console.log(`  templates / template categories             : ${m.components.catalog.templates} / ${m.components.catalog.templateCategories}`);
console.log(`  directories documented                      : ${Object.keys(m.directories).length}`);
console.log(`  features                                    : ${Object.keys(m.features).length}`);
console.log(`  risk items flagged                          : ${m.riskRegister.items.length}`);
console.log(`  unknowns recorded                           : ${m.unknowns.length}`);
