#!/usr/bin/env node
/**
 * Codebase Intelligence index generator -- agent.md tasks 7.24"7.27.
 *
 * ONE pipeline produces all 19 JSON artifacts from ONE parse of each
 * source file. Nothing here touches application source; it only reads.
 *
 * Determinism (task 7.27): the index files contain NO timestamp. The only
 * timestamp lives in INTELLIGENCE_MANIFEST.json, outside the files whose bytes
 * are compared. That is what lets `--check` do an exact byte comparison instead
 * of the strip-the-timestamp regex workaround the pre-existing generator needs.
 *
 * Safety (task 7.29): every artifact is serialized, then scanned with the Phase 6
 * detectors IN MEMORY, and only written if it contains no REAL_SECRET. A
 * generated index is not allowed to leak what the scanner just banned.
 *
 * Usage:
 *   node generate-index.mjs            write all artifacts
 *   node generate-index.mjs --check    verify freshness, write nothing, exit 1 if stale
 *   node generate-index.mjs --stats    print counts only
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

import { discover, SOURCE_ROOTS, TEST_ROOTS, ALL_ROOTS, NO_INDEX_DIRS, relFromRoot } from './lib/walk.mjs';
import { parseAll, ts } from './lib/parse.mjs';
import { loadAliases, makeResolver } from './lib/resolve.mjs';
import { classifyFile, inferFeature, isPageLike, isTestPath, symbolKindOf } from './lib/classify.mjs';
import { scanText } from './secret-scan.mjs';
import {
  sourceSnapshot,
  treeFingerprint,
  changedFiles,
  shortHash,
} from './lib/fingerprint.mjs';
import { edgeConfidence, featureConfidence, weakest, tally } from './lib/confidence.mjs';
import { buildRoutingMatrix } from './lib/router-matrix.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const CODEBASE_DIR = join(ROOT, '.uihub-agent', 'codebase');
const GENERATED_DIR = join(ROOT, '.uihub-agent', 'generated');

const SCHEMA_VERSION = 1;
const PIPELINE_ID = 'uihub-codebase-intelligence/1';

/* ------------------------------------------------------------------ *
 * Probes: AST-driven fact extraction
 * ------------------------------------------------------------------ */

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'all'];

/*
 * Endpoint detection.
 *
 * The first implementation accepted ANY identifier as the receiver
 * (`/^(?:[a-zA-Z_$][\w$]*Router|[a-zA-Z_$][\w$]*)$/` - the second alternative
 * matches everything) and only required an HTTP-looking method name. That
 * produced 9 phantom endpoints out of 76, including:
 *
 *   GET id      <- searchParams.get('id')     in LibraryPage.tsx
 *   GET q       <- queryParams.get('q')       in LibraryPage.tsx
 *   GET tool    <- params.get('tool')         in AnalyticsPage.tsx
 *   POST https://api.brevo.com/... <- axios.post() in brevoService.js
 *   GET /       <- Promise.all([...])         in admin.ts
 *
 * Three independent signals now have to agree before a call is called a
 * served route:
 *
 *   1. the receiver looks like a router (ends in `Router`, or is app/server),
 *   2. the method is an HTTP verb,
 *   3. the first argument is a string literal starting with `/`.
 *
 * Rule 3 is Express's own convention for a route path and is what actually
 * separates a served route from a query-parameter read, a header read, a
 * Firestore document `.get()`, and an outbound `axios.post()` to a full URL.
 * Firestore/Map-style `.get(x)` receivers carry a non-literal argument, so
 * rule 3 rejects them as well.
 */
const ROUTER_RECEIVER = /^(?:[a-zA-Z_$][\w$]*Router|app|server|router)$/;

/** Receivers that make outbound requests rather than serving routes. */
const CLIENT_RECEIVER = /^(?:axios|fetch|http|https|superagent|request|got)$/;

/**
 * Classify `receiver.verb(...)` call sites into served routes, outbound client
 * requests, and route calls whose path is computed rather than a literal.
 * The third bucket is reported so a dynamic path is never silently dropped.
 */
function probeEndpoints(rec) {
  const routes = [];
  const outbound = [];
  const dynamic = [];

  /*
   * A route declared inside a TEST file is a test fixture, not a deployed
   * endpoint.
   *
   * `backend/tests/cors.test.js` and `mcp-server/tests/cors.test.ts` each build a
   * throwaway express app to assert CORS headers against:
   *
   *   app.get('/probe', (_req, res) => res.json({ ok: true }));
   *   app.post('/probe', (_req, res) => res.json({ ok: true }));
   *
   * `app` matches ROUTER_RECEIVER, so indexing the tests published `GET /probe`
   * and `POST /probe` as real API_MAP endpoints owned by files classified TEST -
   * which is exactly the contradiction check-index then reports as a CONFLICT.
   *
   * The fix is to not harvest routes from tests at all. A fixture route is not
   * reachable by any client, and recording it would let a task asking about
   * `/probe` expand into a CORS test instead of real API surface. Outbound
   * client-call harvesting is unaffected: a test asserting against a real service
   * is a genuine caller, and API_DEPENDENCY wants exactly that.
   */
  if (isTestPath(rec.path)) return { routes, outbound, dynamic };

  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
        const base = callee.expression.text;
        const method = callee.name.text;
        if (HTTP_METHODS.includes(method)) {
          const [first, ...rest] = node.arguments;
          const line = rec.sourceFile.getLineAndCharacterOfPosition(node.getStart(rec.sourceFile)).line + 1;
          const verb = method === 'all' ? 'ALL' : method.toUpperCase();

          if (ROUTER_RECEIVER.test(base)) {
            if (first && ts.isStringLiteral(first) && first.text.startsWith('/')) {
              routes.push({
                method: verb, path: first.text, router: base, line,
                handlerCount: rest.length,
              });
            } else if (first) {
              // e.g. `router.get(`${base}/x`)` - a real route with a computed path.
              dynamic.push({ method: verb, router: base, line, shape: first.getText().slice(0, 80) });
            }
          } else if (CLIENT_RECEIVER.test(base)) {
            const target = first && ts.isStringLiteral(first) ? first.text
              : first ? first.getText().slice(0, 80) : '<none>';
            outbound.push({ method: verb, target, client: base, line });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(rec.sourceFile);
  return { routes, outbound, dynamic };
}

/** Pull the component name out of `element={<Foo />}` or `element={<LazyFoo/>}`. */
function jsxComponentName(expr) {
  if (!expr) return null;
  if (ts.isJsxElement(expr) || ts.isJsxSelfClosingElement(expr)) {
    const tag = expr.tagName ?? expr.openingElement?.tagName;
    if (tag && ts.isIdentifier(tag)) return tag.text;
  }
  return null;
}

/** Route declarations: JSX `<Route path element/>` and `createBrowserRouter([])`. */
/**
 * `const HomePage = React.lazy(() => import('./pages/HomePage/HomePage'))`
 *   '  { HomePage: 'frontend/src/pages/HomePage/HomePage.tsx' }
 *
 * Every route in this application is wired through React.lazy, so without this
 * map no route can be associated with a file and ROUTE_MAP degrades to a list of
 * paths with `confidence: LOW_CONFIDENCE` on all 58 of them.
 */
function probeLazyTargets(sf, rec, resolver, relFromAbs) {
  const targets = {};
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name) && node.initializer) {
      let spec = null;
      (function find(n) {
        if (spec) return;
        if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword &&
            n.arguments.length && ts.isStringLiteral(n.arguments[0])) {
          spec = n.arguments[0].text;
          return;
        }
        ts.forEachChild(n, find);
      })(node.initializer);
      if (spec) {
        const r = resolver.resolveSpecifier(spec, rec.abs);
        if (r.kind === 'internal') targets[node.name.text] = relFromAbs.get(r.target);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return targets;
}

/**
 * MCP tool definitions.
 *
 * The server does not call `server.tool(...)`. Each tool is built by a factory 
 * `export const search_components = createTool('search_components', '', zodSchema, )`
 * (see mcp-server/src/tools/searchComponents.ts)  and collected in
 * `export const TOOLS: McpTool[] = [...]`.
 *
 * The AST signal is therefore a call to a `createTool`-shaped factory whose first
 * argument is a string literal. Matching a bare `name:` property instead produced
 * two false positives from `stdio.ts` server config objects.
 */
const TOOL_FACTORY_RE = /^create[A-Z]\w*$/;

function probeMcpTools(sf, rec) {
  const tools = [];
  const lineOf = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const isToolsDir = /(^|\/)mcp-server\/src\/tools\//.test(rec.path);

  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isCallExpression(node.initializer)) {
      const callee = node.initializer.expression;
      const calleeName = ts.isIdentifier(callee) ? callee.text
        : ts.isPropertyAccessExpression(callee) ? callee.name.text : null;
      const [a0, a1] = node.initializer.arguments;
      if (calleeName && TOOL_FACTORY_RE.test(calleeName) &&
          a0 && ts.isStringLiteral(a0)) {
        tools.push({
          tool: a0.text,
          symbol: node.name && ts.isIdentifier(node.name) ? node.name.text : null,
          file: rec.path,
          line: lineOf(node),
          factory: calleeName,
          description: a1 && ts.isStringLiteral(a1) ? a1.text.slice(0, 200) : null,
        });
      }
    }
    // Fallback shape: an exported object literal with a name + description,
    // but only inside the tools directory  elsewhere it matches server config.
    if (isToolsDir && ts.isVariableDeclaration(node) && node.initializer &&
        ts.isObjectLiteralExpression(node.initializer)) {
      const props = node.initializer.properties;
      const nameProp = props.find((p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'name');
      const descProp = props.find((p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'description');
      if (nameProp && ts.isPropertyAssignment(nameProp) && ts.isStringLiteral(nameProp.initializer) && descProp) {
        tools.push({
          tool: nameProp.initializer.text,
          symbol: node.name && ts.isIdentifier(node.name) ? node.name.text : null,
          file: rec.path,
          line: lineOf(node),
          factory: 'object-literal',
          description: ts.isPropertyAssignment(descProp) && ts.isStringLiteral(descProp.initializer)
            ? descProp.initializer.text.slice(0, 200) : null,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return tools;
}

function probeRoutes(rec) {
  const routes = [];
  const sf = rec.sourceFile;

  const visit = (node) => {
    // <Route path="/x" element={<Y/>} />
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tag = node.tagName;
      if (tag && ts.isIdentifier(tag) && tag.text === 'Route') {
        let path = null;
        let element = null;
        let index = false;
        let hasChildren = false;
        for (const attr of node.attributes?.properties ?? []) {
          if (!ts.isJsxAttribute(attr)) continue;
          const name = attr.name.text;
          const init = attr.initializer;
          if (name === 'path' && init && ts.isStringLiteral(init)) path = init.text;
          if (name === 'index' && init && init.kind === ts.SyntaxKind.JsxExpression) {
            index = !init.expression || init.expression.kind === ts.SyntaxKind.TrueKeyword;
          }
          if (name === 'element' && init && ts.isJsxExpression(init) && init.expression) {
            element =
              jsxComponentName(init.expression) ||
              (ts.isCallExpression(init.expression) ? 'lazy()' : null) ||
              (ts.isIdentifier(init.expression) ? init.expression.text : null);
          }
        }
        for (const child of node.children ?? []) {
          if (ts.isJsxElement(child) && ts.isIdentifier(child.openingElement.tagName) &&
              child.openingElement.tagName.text === 'Route') {
            hasChildren = true;
          }
        }
        if (path !== null || element) {
          // A Route with no path but with children is a layout route  it has no
          // URL of its own. Recording it as a pathless layout is honest; showing
          // it as "(none)" implied a broken entry.
          routes.push({ path, element, index, hasChildren, layout: path === null && hasChildren, source: 'router-element', file: rec.path });
        }
      }
    }
    // createBrowserRouter([{ path: '/x', element: <Y/> }])
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
        /^(createBrowserRouter|createHashRouter|createMemoryRouter)$/.test(node.expression.text)) {
      for (const arr of node.arguments) {
        if (!ts.isArrayLiteralExpression(arr)) continue;
        for (const el of arr.elements) {
          if (!ts.isObjectLiteralExpression(el)) continue;
          let path = null;
          let element = null;
          let index = false;
          for (const p of el.properties) {
            if (!ts.isPropertyAssignment(p)) continue;
            const key = p.name.getText(sf);
            const v = p.initializer;
            if (key === 'path' && ts.isStringLiteral(v)) path = v.text;
            if (key === 'index' && v.kind === ts.SyntaxKind.TrueKeyword) index = true;
            if (key === 'element') {
              element = ts.isJsxElement(v) || ts.isJsxSelfClosingElement(v) ? jsxComponentName(v)
                : ts.isCallExpression(v) ? 'lazy()'
                : ts.isIdentifier(v) ? v.text : null;
            }
          }
          if (path !== null || element) routes.push({ path, element, index, source: 'router-element', file: rec.path });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return routes;
}

/** Database usage: Mongo collections, mongoose models/schemas, raw SQL. */
function probeDatabase(rec, text) {
  const models = [];
  const collections = new Set();
  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const owner = node.expression.expression.getText?.() ?? '';
      const prop = node.expression.name.text;
      const [a0] = node.arguments;
      if (prop === 'collection' && ts.isStringLiteral(a0)) collections.add(a0.text);
      if ((prop === 'model' || prop === 'Schema') && /mongoose/i.test(owner) && ts.isStringLiteral(a0)) {
        models.push({ name: a0.text, kind: prop, line: 0 });
      }
      if (prop === 'findOneAndUpdate' || prop === 'insertOne' || prop === 'createIndex') {
        if (/collection|db|store/i.test(owner)) collections.add(`(op:${prop} on ${owner})`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(rec.sourceFile);
  // Postgres/Prisma markers need a text probe; they are not AST-shaped.
  const prisma = /prisma\.(?:client|schema)/i.test(text) || /@prisma\/client/.test(text);
  const rawSql = /\b(?:SELECT|INSERT INTO|UPDATE|CREATE TABLE)\b[\s\S]{0,80}\b(?:FROM|SET|VALUES|WHERE)\b/i.exec(text);
  return {
    collections: [...collections].sort(),
    models: models.sort((a, b) => a.name.localeCompare(b.name)),
    prisma,
    rawSql: Boolean(rawSql),
  };
}

/** Storage usage: browser storage, Upstash Redis, Firebase Storage. */
function probeStorage(rec, text) {
  const stores = new Set();
  const calls = [];
  const visit = (node) => {
    if (ts.isPropertyAccessExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const owner = node.expression.expression.getText?.() ?? '';
      const mid = node.expression.name.text;
      const prop = node.name.text;
      if (/^(localStorage|sessionStorage)$/.test(owner)) {
        stores.add(owner);
        calls.push({ store: owner, op: mid });
      }
      if (/^(redis|Redis)$/.test(owner) && /^(get|set|del|incr|expire|hset|hgetall|zadd|zrange|setex|publish)$/.test(mid)) {
        stores.add('redis');
        calls.push({ store: 'redis', op: mid });
      }
      if (prop === 'ref' && /storage/i.test(mid)) stores.add('firebase-storage');
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const owner = node.expression.expression.getText?.() ?? '';
      const prop = node.expression.name.text;
      if (/^(localStorage|sessionStorage)$/.test(owner)) {
        const key = node.arguments[0];
        calls.push({ store: owner, op: prop, key: key && ts.isStringLiteral(key) ? key.text : null });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(rec.sourceFile);
  const upstash = /@upstash\/redis|Redis\.fromEnv/.test(text);
  if (upstash) stores.add('upstash-redis');
  return { stores: [...stores].sort(), calls };
}

/**
 * External integration surface.
 *
 * Driven by package names actually imported, plus env vars actually read -- not
 * by a hand-maintained list of "integrations we have".
 */
const INTEGRATION_PACKAGES = {
  'mongoose': 'mongodb', 'mongodb': 'mongodb',
  'firebase/app': 'firebase', 'firebase/auth': 'firebase', 'firebase/firestore': 'firebase',
  'firebase-admin': 'firebase', 'firebase/storage': 'firebase',
  '@upstash/redis': 'upstash-redis',
  'razorpay': 'razorpay',
  '@modelcontextprotocol/sdk': 'model-context-protocol',
  'stripe': 'stripe', 'sendgrid': 'sendgrid', '@sendgrid/mail': 'sendgrid',
  'jsonwebtoken': 'jwt', 'bcryptjs': 'password-hashing', 'bcrypt': 'password-hashing',
  'express-rate-limit': 'rate-limiting', 'helmet': 'security-headers', 'cors': 'security-headers',
  'node-cron': 'scheduling', 'winston': 'logging',
};

/**
 * The npm package a specifier refers to, or null when it refers to no package.
 *
 * `"."`, `".."` and `"./x"` are relative specifiers; `split('/')[0]` turns them
 * into the strings "." and "..", which then look like package names to anything
 * downstream. Returning null keeps them out of package inventories.
 */
function packageNameOf(specifier) {
  if (specifier.startsWith('.')) return null;
  if (specifier.startsWith('/')) return null;
  const bare = specifier.replace(/[?#].*$/, '');
  if (bare.startsWith('@')) {
    const [scope, name] = bare.split('/');
    return name ? `${scope}/${name}` : null;
  }
  const [name] = bare.split('/');
  return name || null;
}

function probeIntegrations(rec, text, imports) {
  const found = new Set();
  for (const imp of imports) {
    const pkg = packageNameOf(imp.specifier);
    if (pkg && INTEGRATION_PACKAGES[pkg]) found.add(INTEGRATION_PACKAGES[pkg]);
  }
  const envVars = [...new Set([...text.matchAll(/process\.env\.([A-Z0-9_]+)/g)].map((m) => m[1]))].sort();
  return { integrations: [...found].sort(), envVars };
}

/* ------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------ */

function build() {
  const t0 = performance.now();

  // 1. discover ---------------------------------------------------------
  const disc = discover(ROOT);
  const tDisc = performance.now();

  // 2. parse ------------------------------------------------------------
  const records = parseAll(disc.indexed);
  const tParse = performance.now();

  // 3. resolve ----------------------------------------------------------
  const aliases = loadAliases(ROOT);
  const resolver = makeResolver(ROOT, disc.indexed, aliases);

  const relFromAbs = new Map();
  for (const f of disc.indexed) relFromAbs.set(f.abs, f.path);

  const rawEdges = [];
  const unresolved = [];
  const assetEdges = [];
  const externalEdges = new Map(); // package -> Set<importer>

  for (const rec of records.values()) {
    rec.sourceFile = null; // dropped after probes below; keeps memory flat
    // Static imports, re-exports AND dynamic imports are all graph edges.
    // `import()` lives in a separate array, so iterating only `imports` left
    // the 60 React.lazy route edges  and every other code-split boundary 
    // invisible in the graph.
    const allSpecifiers = [...rec.imports, ...rec.dynamicImports];
    for (const imp of allSpecifiers) {
      const r = resolver.resolveSpecifier(imp.specifier, rec.abs);
      const edge = {
        from: rec.path,
        specifier: imp.specifier,
        line: imp.line,
        // `kind` is the STATEMENT kind (import / reExport / dynamic).
        // `resolution` is how the specifier RESOLVED (internal / external).
        // Conflating the two made every internal edge look like kind:'import'
        // and silently zeroed the graph's own counts.
        kind: imp.kind,
        resolution: r.kind,
        dynamic: Boolean(imp.dynamic),
        typeOnly: Boolean(imp.typeOnly),
        named: imp.named ?? null,
        defaultImport: imp.defaultImport ?? null,
        namespaceImport: imp.namespaceImport ?? null,
        via: r.via ?? null,
        confidence: edgeConfidence(r),
      };
      if (r.kind === 'internal') {
        edge.to = relFromAbs.get(r.target);
        rawEdges.push(edge);
      } else if (r.kind === 'external') {
        rawEdges.push(edge);
        const pkg = imp.specifier.startsWith('@')
          ? imp.specifier.split('/').slice(0, 2).join('/')
          : imp.specifier.split('/')[0];
        if (!externalEdges.has(pkg)) externalEdges.set(pkg, new Set());
        externalEdges.get(pkg).add(rec.path);
      } else if (r.kind === 'asset') {
        assetEdges.push({ ...edge, detail: r.detail, resolvedKind: 'asset' });
      } else {
        unresolved.push({ ...edge, resolvedKind: 'unresolved', detail: r.detail });
      }
    }
  }
  const tResolve = performance.now();

  // 4. inbound/outbound adjacency -------------------------------------
  const adjacency = new Map();
  const ensure = (p) => {
    if (!adjacency.has(p)) adjacency.set(p, { inbound: [], internalOut: [], dynamicOut: [] });
    return adjacency.get(p);
  };
  for (const f of disc.indexed) ensure(f.path);
  for (const e of rawEdges) {
    if (e.resolution !== 'internal') continue;
    ensure(e.from).internalOut.push(e.to);
    ensure(e.to).inbound.push({ from: e.from, line: e.line, dynamic: e.dynamic, kind: e.kind });
  }
  for (const e of rawEdges) {
    if (e.resolution === 'internal' && e.dynamic) ensure(e.from).dynamicOut.push(e.to);
  }

  // 5. classify ---------------------------------------------------------
  const files = [];
  for (const rec of records.values()) {
    const a = adjacency.get(rec.path);
    files.push(classifyFile(rec, a));
  }
  files.sort((a, b) => (a.path < b.path ? -1 : 1));
  const fileByPath = new Map(files.map((f) => [f.path, f]));

  // 6. probes that need source text + AST -------------------------------
  const endpoints = [];
  const outbound = [];
  const dynamicRoutes = [];
  const routes = [];
  const db = [];
  const storage = [];
  const integrations = [];

  for (const rec of records.values()) {
    const text = readFileSync(rec.abs, 'utf8');

    rec.sourceFile = ts.createSourceFile(
      rec.abs, text, ts.ScriptTarget.Latest, true,
      rec.ext === '.tsx' ? ts.ScriptKind.TSX
        : ['.js', '.mjs', '.cjs'].includes(rec.ext) ? ts.ScriptKind.JS
        : ts.ScriptKind.TS,
    );
    const lineOf = (node) => rec.sourceFile.getLineAndCharacterOfPosition(node.getStart(rec.sourceFile)).line + 1;

    rec.lazyTargets = probeLazyTargets(rec.sourceFile, rec, resolver, relFromAbs);

    const ep = probeEndpoints({ ...rec, sourceFile: rec.sourceFile });
    for (const e of ep.routes) {
      endpoints.push({
        method: e.method, path: e.path, router: e.router, line: e.line,
        file: rec.path, feature: fileByPath.get(rec.path)?.feature ?? 'shared',
        confidence: 'HIGH',
      });
    }
    for (const o of ep.outbound) {
      outbound.push({
        method: o.method, target: o.target, client: o.client, line: o.line,
        file: rec.path, feature: fileByPath.get(rec.path)?.feature ?? 'shared',
      });
    }
    for (const d of ep.dynamic) {
      dynamicRoutes.push({ ...d, file: rec.path, feature: fileByPath.get(rec.path)?.feature ?? 'shared' });
    }
    routes.push(...probeRoutes({ ...rec, sourceFile: rec.sourceFile }));

    const d = probeDatabase({ ...rec, sourceFile: rec.sourceFile }, text);
    const s = probeStorage({ ...rec, sourceFile: rec.sourceFile }, text);
    const i = probeIntegrations(rec, text, rec.imports);
    if (d.collections.length || d.models.length || d.prisma || d.rawSql) {
      db.push({ file: rec.path, feature: fileByPath.get(rec.path)?.feature ?? 'shared', ...d });
    }
    if (s.stores.length) storage.push({ file: rec.path, feature: fileByPath.get(rec.path)?.feature ?? 'shared', ...s });
    if (i.integrations.length || i.envVars.length) {
      integrations.push({ file: rec.path, feature: fileByPath.get(rec.path)?.feature ?? 'shared', ...i });
    }
  }

  // 7. page  route association ----------------------------------------
  const routeEntries = [];
  const knownPaths = new Set(routes.map((r) => r.path).filter(Boolean));

  // Resolve a route element to a real file via import edges of the router file.
  for (const r of routes) {
    let target = null;
    let how = null;
    if (r.element && r.element !== 'lazy()') {
      const routerRec = records.get(r.file);
      if (routerRec && routerRec.lazyTargets && routerRec.lazyTargets[r.element]) {
        // Authoritative: `const HomePage = React.lazy(() => import('./pages/HomePage/HomePage'))`
        // names both the binding and its module. This is the pattern the whole
        // frontend router uses  60 dynamic imports in App.tsx  so resolving
        // the binding name is the only way to get a real path here.
        target = routerRec.lazyTargets[r.element];
        how = 'lazy-import';
      }
      if (!target) {
        // Fall back to matching the element name against a statically imported
        // file stem in the same router file.
        const routerRec2 = records.get(r.file);
        if (routerRec2) {
          for (const imp of routerRec2.imports) {
            if (imp.dynamic) continue;
            const rr = resolver.resolveSpecifier(imp.specifier, routerRec2.abs);
            if (rr.kind !== 'internal') continue;
            const to = relFromAbs.get(rr.target);
            const stem = to.split('/').pop().replace(/\.[^.]+$/, '');
            if (stem === r.element) {
              target = to;
              how = 'router-element';
              break;
            }
          }
        }
      }
    }
    if (!target && r.path) {
      // fall back to a directory-name correlation
      const seg = String(r.path).replace(/^\//, '').split('/')[0];
      if (seg) {
        const cand = files.find(
          (f) => f.feature === seg.toLowerCase() && (f.role === 'PAGE' || f.role === 'PAGE_SHELL'),
        );
        if (cand) {
          target = cand.path;
          how = 'directory-name';
        }
      }
    }
    routeEntries.push({
      path: r.path ?? '(none)',
      index: r.index,
      element: r.element,
      componentFile: target,
      declaredIn: r.file,
      routerSource: r.source,
      association: how ?? 'none',
      confidence: how === 'lazy-import' ? 'HIGH' : how === 'router-element' ? 'HIGH' : how === 'directory-name' ? 'MEDIUM' : 'LOW_CONFIDENCE',
    });
  }
  routeEntries.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  const tBuild = performance.now();

  return {
    disc, records, aliases, rawEdges, unresolved, assetEdges, externalEdges,
    adjacency, files, fileByPath, endpoints, outbound, dynamicRoutes,
    routes: routeEntries, db, storage,
    integrations, knownPaths,
    timings: {
      discover: Math.round(tDisc - t0),
      parse: Math.round(tParse - tDisc),
      resolve: Math.round(tResolve - tParse),
      build: Math.round(tBuild - tResolve),
      total: Math.round(tBuild - t0),
    },
  };
}

/* ------------------------------------------------------------------ *
 * Writers -- one JSON object per artifact
 * ------------------------------------------------------------------ */

const stable = (v) => JSON.stringify(v, null, 2) + '\n';

/**
 * Remove the single timestamp field from a serialized manifest.
 *
 * Deliberately a structured key removal rather than a regex like
 * `"generatedAt": "",\n`: a regex cannot survive the value containing a quote or
 * a comma, and it silently matches only the FIRST occurrence. This is the same
 * fragility the pre-existing generate-map.mjs check has.
 */
/**
 * Remove wall-clock fields from a serialized manifest.
 *
 * Structured key removal, not a regex like `"generatedAt": "",\n`: a regex
 * cannot survive the value containing a quote or a comma, and it matches only the
 * FIRST occurrence. That fragility exists in the pre-existing generate-map.mjs
 * check and is not worth reproducing.
 *
 * `timingsMs` is dropped too. Two identical runs differ by a few hundred ms, so
 * including it would make `--check` report "stale" while every file is correct.
 */
function stripVolatile(serialized) {
  const obj = JSON.parse(serialized);
  delete obj.generatedAt;
  delete obj.timingsMs;
  return stable(obj);
}

function meta(extra) {
  // `sourceRoots` and `testRoots` are reported separately rather than merged.
  // Every artifact that carries this metadata is a record of what was READ, and
  // a reader needs to be able to tell application source from the tests that
  // verify it without inferring it from a path.
  return {
    schemaVersion: SCHEMA_VERSION,
    generatedBy: PIPELINE_ID,
    sourceRoots: SOURCE_ROOTS,
    testRoots: TEST_ROOTS,
    allRoots: ALL_ROOTS,
    ...extra,
  };
}

function compose(m) {
  const { files, fileByPath, rawEdges, unresolved, assetEdges, externalEdges, adjacency, records } = m;
  const internal = rawEdges.filter((e) => e.resolution === 'internal');
  const external = rawEdges.filter((e) => e.resolution === 'external');
  const out = {};

  // ---- FILE_ROLE_MAP --------------------------------------------------
  const roleCounts = {};
  for (const f of files) roleCounts[f.role] = (roleCounts[f.role] || 0) + 1;
  out['codebase/FILE_ROLE_MAP.json'] = meta({
    description: 'Every indexed source file with its role, the evidence for that role, and its edge counts.',
    counts: { files: files.length, byRole: Object.fromEntries(Object.entries(roleCounts).sort()) },
    files: files.map((f) => ({
      path: f.path, role: f.role, roleSource: f.roleSource, confidence: f.confidence,
      feature: f.feature, featureConfidence: featureConfidence(f.path),
      ext: f.ext, lines: f.lines, bytes: f.bytes,
      exports: f.exports, isBarrel: f.isBarrel, isTypeOnly: f.isTypeOnly,
      usesJsx: f.usesJsx, inbound: f.inbound, outbound: f.outbound,
      orphaned: f.inbound === 0 && f.outbound === 0,
    })),
  });

  // ---- COMPONENT_MAP --------------------------------------------------
  /**
   * The display name for a component row.
   *
   * Picking the first capitalised export in source order labelled six real
   * components after an unrelated SCREAMING_CASE constant that happened to be
   * declared first: `TemplateSimilarRail.tsx` was published as
   * `SIMILAR_COLLAPSED_COUNT`, and `AdminLayout.tsx` as `ADMIN_NAV`. Searching
   * the index for the component's actual name then found nothing.
   *
   * Preference order, most trustworthy first:
   *   1. an export whose name matches the file's own basename
   *      (`TemplateSimilarRail.tsx` -> `TemplateSimilarRail`)
   *   2. a PascalCase export that is not SCREAMING_CASE
   *   3. any PascalCase export
   *   4. the file basename, which is all that is known
   */
  function componentNameFor(f) {
    const base = f.path.split('/').pop().replace(/\.[^.]+$/, '');
    // Symbols the classifier actually typed as COMPONENT, not just exported
    // names. `f.exports` misses a file whose only component is a local
    // `const X = () => <div/>` that is never exported, which is exactly the
    // case in TemplateSimilarRail.tsx and AdminLayout.tsx.
    const declared = (componentSymbols.get(f.path) ?? []).map((s) => s.name);
    const caps = [...new Set([...declared, ...f.exports])].filter((n) => /^[A-Z]/.test(n));
    return (
      caps.find((n) => n === base)
      ?? caps.find((n) => !/^[A-Z0-9_]+$/.test(n))
      ?? caps[0]
      ?? base
    );
  }

  const componentSymbols = new Map();
  for (const rec of records.values()) {
    const comps = rec.symbols.filter((s) => symbolKindOf(s, rec) === 'COMPONENT');
    if (comps.length) componentSymbols.set(rec.path, comps);
  }

  const componentFiles = files.filter((f) => f.role === 'COMPONENT' || f.isReactComponent);
  const components = componentFiles.map((f) => {
    // "Used by pages" means pages that IMPORT this component, so it has to come
    // from inbound edges. Reading the component's outbound edges and filtering
    // for PAGE targets asks the opposite question - which pages this component
    // imports - which is always empty for a well-formed page->component edge and
    // made every component report zero page usage while `impact` found the pages.
    const inboundFrom = adjacency.get(f.path)?.inbound ?? [];
    const outNames = inboundFrom
      .filter((e) => {
        const tf = fileByPath.get(e.from);
        return tf && (tf.role === 'PAGE' || tf.role === 'PAGE_SHELL');
      })
      .map((e) => e.from);
    return {
      name: componentNameFor(f),
      path: f.path,
      feature: f.feature,
      lazy: inboundFrom.some((i) => i.kind === 'dynamic'),
      isBarrel: f.isBarrel,
      lines: f.lines,
      exportedSymbols: f.exports,
      importsInternal: [...new Set(adjacency.get(f.path)?.internalOut ?? [])].sort(),
      usedByPages: [...new Set(outNames)].sort(),
      usedBy: [...new Set(inboundFrom.map((i) => i.from))].sort(),
      orphaned: inboundFrom.length === 0,
      confidence: f.roleSource.startsWith('ast:') ? 'HIGH' : f.roleSource === 'path-convention' ? 'MEDIUM' : 'LOW_CONFIDENCE',
    };
  }).sort((a, b) => a.path.localeCompare(b.path));

  out['codebase/COMPONENT_MAP.json'] = meta({
    description: 'React components discovered from JSX syntax and capitalized exports, with page usage and orphan status.',
    counts: {
      components: components.length,
      orphaned: components.filter((c) => c.orphaned).length,
      lazy: components.filter((c) => c.lazy).length,
      confidence: tally(components.map((c) => c.confidence)),
    },
    components,
  });

  // ---- PAGE_MAP -------------------------------------------------------
  // Only role PAGE. A PAGE_SHELL is a `pages/<Name>/index.tsx` barrel a router
  // points at, so it is still reachable as a route target - but it is not a page
  // a user lands on and including it double-counts the page it fronts.
  const pages = files.filter((f) => f.role === 'PAGE').map((f) => {
    const route = m.routes.find((r) => r.componentFile === f.path);
    return {
      path: f.path,
      name: f.path.split('/').pop().replace(/\.[^.]+$/, ''),
      feature: f.feature,
      route: route?.path ?? null,
      role: f.role,
      isBarrel: f.isBarrel,
      lines: f.lines,
      components: [...new Set((adjacency.get(f.path)?.internalOut ?? []).filter((t) => {
        const tf = fileByPath.get(t);
        return tf && (tf.role === 'COMPONENT' || tf.role === 'LAYOUT');
      }))].sort(),
      hooks: [...new Set((adjacency.get(f.path)?.internalOut ?? []).filter((t) => fileByPath.get(t)?.role === 'HOOK'))].sort(),
      confidence: f.confidence,
    };
  }).sort((a, b) => a.path.localeCompare(b.path));

  out['codebase/PAGE_MAP.json'] = meta({
    description: 'Page entry points with their route, direct component dependencies, and hooks.',
    counts: { pages: pages.length, withRoute: pages.filter((p) => p.route).length },
    pages,
  });

  // ---- ROUTE_MAP ------------------------------------------------------
  out['codebase/ROUTE_MAP.json'] = meta({
    description: 'Router declarations. `association` records HOW a route was matched to a component file.',
    counts: {
      routes: m.routes.length,
      association: tally(m.routes.map((r) => r.confidence)),
    },
    routerFiles: [...new Set(m.routes.map((r) => r.declaredIn))].sort(),
    routes: m.routes,
  });

  // ---- FEATURE_MAP ----------------------------------------------------
  const featureMap = {};
  for (const f of files) {
    (featureMap[f.feature] ??= []).push(f);
  }
  const features = Object.entries(featureMap).map(([name, fs]) => ({
    feature: name,
    files: fs.length,
    roles: Object.fromEntries(
      Object.entries(
        fs.reduce((a, f) => ((a[f.role] = (a[f.role] || 0) + 1), a), {}),
      ).sort(),
    ),
    entryPoints: fs.filter((f) => f.role === 'PAGE' || f.role === 'ENTRY' || f.role === 'PAGE_SHELL')
      .map((f) => f.path).sort(),
    components: fs.filter((f) => f.role === 'COMPONENT').map((f) => f.path).sort(),
    services: fs.filter((f) => f.role === 'SERVICE').map((f) => f.path).sort(),
    hooks: fs.filter((f) => f.role === 'HOOK').map((f) => f.path).sort(),
    endpoints: m.endpoints.filter((e) => e.feature === name)
      .map((e) => `${e.method} ${e.path}`).sort(),
    externalPackages: [...new Set(
      m.rawEdges.filter((e) => e.resolution === 'external' && fileByPath.get(e.from)?.feature === name)
        .map((e) => e.specifier.split('/').slice(0, e.specifier.startsWith('@') ? 2 : 1).join('/')),
    )].sort(),
    lines: fs.reduce((n, f) => n + f.lines, 0),
  })).sort((a, b) => a.feature.localeCompare(b.feature));

  out['codebase/FEATURE_MAP.json'] = meta({
    description: 'Feature clusters inferred from directory structure, cross-checked against role assignment.',
    counts: { features: features.length },
    features,
  });

  // ---- HOOKS_MAP ------------------------------------------------------
  const hooks = files.filter((f) => f.role === 'HOOK').map((f) => ({
    name: (f.exports.find((n) => /^use[A-Z]/.test(n)) ?? f.path.split('/').pop().replace(/\.[^.]+$/, '')),
    path: f.path,
    feature: f.feature,
    lines: f.lines,
    exportedSymbols: f.exports,
    usedBy: [...new Set((adjacency.get(f.path)?.inbound ?? []).map((i) => i.from))].sort(),
    confidence: f.confidence,
  })).sort((a, b) => a.path.localeCompare(b.path));

  out['codebase/HOOKS_MAP.json'] = meta({
    description: 'Custom hooks. A file qualifies only if it is named use* AND exports something -- not either alone.',
    counts: { hooks: hooks.length, unused: hooks.filter((h) => h.usedBy.length === 0).length },
    hooks,
  });

  // ---- SERVICE_MAP ----------------------------------------------------
  const services = files.filter((f) => f.role === 'SERVICE').map((f) => ({
    name: f.path.split('/').pop().replace(/\.[^.]+$/, ''),
    path: f.path,
    layer: f.path.startsWith('backend/') ? 'backend' : f.path.startsWith('frontend/') ? 'frontend' : 'shared',
    feature: f.feature,
    lines: f.lines,
    exportedSymbols: f.exports,
    usedBy: [...new Set((adjacency.get(f.path)?.inbound ?? []).map((i) => i.from))].sort(),
    touchesDatabase: m.db.some((d) => d.file === f.path),
    touchesStorage: m.storage.some((s) => s.file === f.path),
    externalPackages: [...new Set(
      m.rawEdges.filter((e) => e.resolution === 'external' && e.from === f.path)
        .map((e) => e.specifier.split('/').slice(0, e.specifier.startsWith('@') ? 2 : 1).join('/')),
    )].sort(),
    confidence: f.confidence,
  })).sort((a, b) => a.path.localeCompare(b.path));

  out['codebase/SERVICE_MAP.json'] = meta({
    description: 'Service-layer modules in backend, frontend, and MCP, with their data-layer reach and consumers.',
    counts: {
      services: services.length,
      backend: services.filter((s) => s.layer === 'backend').length,
      frontend: services.filter((s) => s.layer === 'frontend').length,
      withDatabase: services.filter((s) => s.touchesDatabase).length,
    },
    services,
  });

  // ---- API_MAP --------------------------------------------------------
  const byEndpoint = {};
  for (const e of m.endpoints) {
    const key = `${e.method} ${e.path}`;
    (byEndpoint[key] ??= { method: e.method, path: e.path, feature: e.feature, handlers: [] });
    if (!byEndpoint[key].handlers.includes(e.file)) byEndpoint[key].handlers.push(e.file);
  }
  const endpointList = Object.values(byEndpoint)
    .map((e) => ({ ...e, handlers: e.handlers.sort() }))
    .sort((a, b) => (a.path === b.path ? a.method.localeCompare(b.method) : a.path.localeCompare(b.path)));
  const mcpTools = [];
  const outboundList = [...m.outbound].sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  const dynamicList = [...m.dynamicRoutes].sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  for (const rec of records.values()) {
    if (!rec.path.includes('mcp-server/src')) continue;
    if (!rec.sourceFile) continue;
    mcpTools.push(...probeMcpTools(rec.sourceFile, rec));
  }

  out['codebase/API_MAP.json'] = meta({
    description:
      'Served HTTP routes derived from router call syntax (receiver is a router, ' +
      'verb is an HTTP method, first argument is a string literal starting with "/"), ' +
      'plus MCP tool registrations. Outbound client calls and dynamically ' +
      'computed route paths are listed separately so neither is mistaken for a ' +
      'served endpoint nor silently dropped.',
    counts: {
      endpoints: endpointList.length,
      byMethod: Object.fromEntries(
        Object.entries(endpointList.reduce((a, e) => ((a[e.method] = (a[e.method] || 0) + 1), a), {}))
          .sort(),
      ),
      mcpRegistrations: mcpTools.length,
      outboundClientCalls: outboundList.length,
      dynamicRoutePaths: dynamicList.length,
    },
    endpoints: endpointList,
    outboundClientCalls: outboundList,
    dynamicRoutePaths: dynamicList,
    mcpTools: mcpTools.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line),
  });

  // ---- DATABASE_USAGE_MAP --------------------------------------------
  const dbFiles = [...m.db].sort((a, b) => a.file.localeCompare(b.file));
  out['codebase/DATABASE_USAGE_MAP.json'] = meta({
    description: 'Data-layer reach per file: Mongo collections, mongoose models, Prisma, raw SQL.',
    counts: {
      files: dbFiles.length,
      distinctCollections: new Set(dbFiles.flatMap((d) => d.collections)).size,
      models: dbFiles.flatMap((d) => d.models).length,
      prisma: dbFiles.filter((d) => d.prisma).length,
    },
    usage: dbFiles,
  });

  // ---- STORAGE_USAGE_MAP ---------------------------------------------
  const storageFiles = [...m.storage].sort((a, b) => a.file.localeCompare(b.file));
  const keys = [...new Set(storageFiles.flatMap((s) => s.calls.map((c) => c.key).filter(Boolean)))].sort();
  out['codebase/STORAGE_USAGE_MAP.json'] = meta({
    description: 'localStorage / sessionStorage / Redis / Firebase Storage usage and the keys in play.',
    counts: {
      files: storageFiles.length,
      stores: [...new Set(storageFiles.flatMap((s) => s.stores))].sort(),
      literalKeys: keys.length,
    },
    usage: storageFiles,
    literalKeys: keys,
  });

  // ---- INTEGRATION_MAP ------------------------------------------------
  const integ = [...m.integrations].sort((a, b) => a.file.localeCompare(b.file));
  const allInteg = [...new Set(integ.flatMap((i) => i.integrations))].sort();
  const allEnv = [...new Set(integ.flatMap((i) => i.envVars))].sort();
  out['codebase/INTEGRATION_MAP.json'] = meta({
    description: 'External service surface, derived from imported package names and env vars actually read.',
    counts: {
      files: integ.length,
      integrations: allInteg.length,
      envVarsReferenced: allEnv.length,
      envVarsDeclared: allEnv.length,
    },
    integrations: allInteg.map((name) => ({
      name,
      usedIn: integ.filter((i) => i.integrations.includes(name)).map((i) => i.file).sort(),
      // Only the packages that actually supplied the integration are listed.
      // Reducing every import of the file turned relative specifiers "." and
      // ".." into "packageNames", which is meaningless and made the cross-check
      // against IMPORT_GRAPH report packages that no import edge mentions.
      packageNames: [...new Set(
        integ.filter((i) => i.integrations.includes(name))
          .flatMap((i) => records.get(i.file)?.imports ?? [])
          .map((im) => packageNameOf(im.specifier))
          .filter((pkg) => pkg && INTEGRATION_PACKAGES[pkg] === name),
      )].sort(),
    })),
    envVars: allEnv.map((v) => ({
      name: v,
      readIn: integ.filter((i) => i.envVars.includes(v)).map((i) => i.file).sort(),
    })),
  });

  // ---- IMPORT_GRAPH ---------------------------------------------------
  out['generated/IMPORT_GRAPH.json'] = meta({
    description: 'Directed import graph. Includes external packages and asset edges; unresolvable specifiers are recorded, never dropped.',
    counts: {
      nodes: files.length,
      internalEdges: internal.length,
      externalEdges: external.length,
      dynamicEdges: internal.filter((e) => e.dynamic).length,
      reExportEdges: internal.filter((e) => e.kind === 'reExport').length,
      assetEdges: assetEdges.length,
      unresolvedEdges: unresolved.length,
      isolatedNodes: files.filter((f) => f.inbound === 0 && f.outbound === 0).length,
    },
    edges: [...internal, ...external]
      .map((e) => e.to ? { from: e.from, to: e.to, line: e.line, kind: e.kind, resolution: 'internal', dynamic: e.dynamic, typeOnly: e.typeOnly, via: e.via, confidence: e.confidence }
        : { from: e.from, to: e.specifier, line: e.line, kind: e.kind, resolution: 'external', dynamic: e.dynamic, typeOnly: e.typeOnly, via: 'package', confidence: e.confidence })
      .sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || a.line - b.line),
    assetEdges: assetEdges.sort((a, b) => a.from.localeCompare(b.from) || a.line - b.line),
    unresolvedEdges: unresolved.sort((a, b) => a.from.localeCompare(b.from) || a.line - b.line),
  });

  // ---- REVERSE_DEPENDENCY_MAP ----------------------------------------
  const reverse = {};
  for (const f of files) {
    reverse[f.path] = {
      importers: [...new Set((adjacency.get(f.path)?.inbound ?? []).map((i) => i.from))].sort(),
      importedBy: (adjacency.get(f.path)?.inbound ?? []).length,
      dynamicImporters: [...new Set((adjacency.get(f.path)?.inbound ?? []).filter((i) => i.dynamic).map((i) => i.from))].sort(),
      role: f.role,
      feature: f.feature,
    };
  }
  // Incoming edges for external packages too: which files import a package.
  for (const [pkg, importers] of [...externalEdges.entries()].sort()) {
    reverse[`external:${pkg}`] = {
      importers: [...importers].sort(),
      importedBy: importers.size,
      dynamicImporters: [],
      role: 'EXTERNAL_PACKAGE',
      feature: 'shared',
    };
  }

  const topFanIn = Object.entries(reverse)
    .filter(([k]) => !k.startsWith('external:'))
    .sort((a, b) => b[1].importedBy - a[1].importedBy || a[0].localeCompare(b[0]))
    .slice(0, 25)
    .map(([path, v]) => ({ path, importedBy: v.importedBy, role: v.role, feature: v.feature }));

  out['generated/REVERSE_DEPENDENCY_MAP.json'] = meta({
    description: 'For every file: who imports it. The first tool to check before editing anything.',
    counts: {
      tracked: Object.keys(reverse).length,
      externalPackages: externalEdges.size,
      orphans: files.filter((f) => f.inbound === 0 && f.outbound > 0).length,
      deadEnds: files.filter((f) => f.inbound > 0 && f.outbound === 0).length,
    },
    topFanIn,
    reverse,
  });

  // ---- SYMBOL_INDEX ---------------------------------------------------
  const symbols = [];
  for (const rec of records.values()) {
    const meta2 = fileByPath.get(rec.path);
    for (const s of rec.symbols) {
      symbols.push({
        name: s.name,
        kind: symbolKindOf(s, rec),
        path: rec.path,
        line: s.line,
        feature: meta2?.feature ?? 'shared',
        exported: s.exported,
        isDefault: s.isDefault,
        async: s.async,
        inbound: meta2?.inbound ?? 0,
      });
    }
  }
  symbols.sort((a, b) => a.name.localeCompare(b.name) || a.path.localeCompare(b.path) || a.line - b.line);
  const byName = {};
  for (const s of symbols) (byName[s.name] ??= []).push(`${s.path}:${s.line}`);
  const ambiguous = Object.entries(byName).filter(([, v]) => v.length > 1);
  const symbolsByName = Object.fromEntries(
    Object.entries(byName).sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, { locations: v.sort(), ambiguous: v.length > 1 }]),
  );

  out['generated/SYMBOL_INDEX.json'] = meta({
    description: 'Every top-level symbol with file, line, kind, and fan-in. Names that appear more than once are flagged ambiguous.',
    counts: {
      symbols: symbols.length,
      distinctNames: Object.keys(byName).length,
      ambiguousNames: ambiguous.length,
      byKind: Object.fromEntries(
        Object.entries(symbols.reduce((a, s) => ((a[s.kind] = (a[s.kind] || 0) + 1), a), {}))
          .sort(([a], [b]) => String(a).localeCompare(String(b))),
      ),
    },
    symbolsByName,
    symbols,
  });

  // ---- FEATURE_FILE_INDEX --------------------------------------------
  out['generated/FEATURE_FILE_INDEX.json'] = meta({
    description: 'Feature  file list, the inverse of FEATURE_MAP, shaped for a single lookup.',
    counts: { features: Object.keys(featureMap).length },
    index: Object.fromEntries(
      Object.entries(featureMap).sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, v.map((f) => f.path).sort()]),
    ),
  });

  // ---- PAGE_COMPONENT_INDEX ------------------------------------------
  const pageComponentIndex = {};
  for (const p of pages) {
    const seen = new Map();
    const visit = (filePath, depth) => {
      if (depth > 6) return;
      for (const next of adjacency.get(filePath)?.internalOut ?? []) {
        const nf = fileByPath.get(next);
        if (!nf) continue;
        if (nf.role === 'COMPONENT' || nf.role === 'LAYOUT' || nf.role === 'PAGE_SHELL') {
          if (!seen.has(next)) seen.set(next, depth);
        }
        visit(next, depth + 1);
      }
    };
    visit(p.path, 0);
    pageComponentIndex[p.path] = {
      feature: p.feature,
      route: p.route,
      direct: p.components,
      transitive: [...seen.entries()]
        .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
        .map(([f, d]) => ({ path: f, depth: d })),
    };
  }
  out['generated/PAGE_COMPONENT_INDEX.json'] = meta({
    description: 'Per page, the component tree reachable from it (transitive, depth  6) -- the blast radius of a visual change.',
    counts: { pages: Object.keys(pageComponentIndex).length },
    index: pageComponentIndex,
  });

  /* --- Phase 8: router contract + knowledge routing graph ----------- */

  // These two are derived from the router matrix and the counts already
  // computed above, so they add no parse cost and cannot drift from the maps
  // they describe. They are what makes `agent:route` explainable without
  // reading the router source.
  out['generated/CONTEXT_BUNDLE_SCHEMA.json'] = meta({
    description: 'Shape of an `agent:context` bundle, so any consumer can validate a bundle without the router source.',
    version: '8.0.0',
    properties: [
      { path: 'task', type: 'string', required: true, note: 'The task text exactly as given.' },
      { path: 'generatedAt', type: 'string', required: true, note: 'ISO-8601. The only wall-clock value in the bundle.' },
      { path: 'intent', type: 'object', required: true, note: '{ intent, confidence, matched }' },
      { path: 'categories', type: 'string[]', required: true, note: 'Ordered strongest-first. UNKNOWN when nothing resolved.' },
      { path: 'surface', type: 'string[]', required: true, note: 'FRONTEND | BACKEND | MCP | DATABASE | CLI | DEPLOYMENT | DOCUMENTATION | INFRASTRUCTURE | UNKNOWN' },
      { path: 'confidence', type: 'string', required: true, note: 'HIGH | MEDIUM | LOW' },
      { path: 'confidenceWhy', type: 'string', required: true, note: 'Human-readable justification for the level chosen.' },
      { path: 'featureCandidates', type: 'string[]', required: true, note: 'FEATURE_MAP slugs the task resolved.' },
      { path: 'indexes', type: 'string[]', required: true, note: 'Indexes the router decided were worth querying, in order. Empty only for UNKNOWN.' },
      { path: 'dependencies', type: 'object[]', required: true, note: 'Relationships behind the selected files: { from, to, trigger, how[] }. Derived from expansionLog.' },
      { path: 'entities', type: 'object', required: true, note: 'components, symbols, services, hooks, routes, explicitFiles -- each with its own evidence string.' },
      { path: 'files', type: 'object[]', required: true, note: 'Ranked context files. See `fileShape`.' },
      { path: 'knowledge', type: 'string[]', required: true, note: 'Markdown file paths to read first, in priority order.' },
      { path: 'protectedAreas', type: 'object[]', required: true, note: 'Protected files the task touches, with tier and rule.' },
      { path: 'validation', type: 'string[]', required: true, note: 'Commands that must pass before the work is considered done.' },
      { path: 'expansionLog', type: 'object[]', required: true, note: 'One entry per added file: { step, path, trigger, how[] }. Empty when nothing expanded.' },
      { path: 'stopReason', type: 'string', required: true, note: 'Why expansion stopped: budget | converged | no-permitted-evidence | disabled.' },
      { path: 'efficiency', type: 'object', required: true, note: '{ filesSelected, totalIndexedFiles, selectionRatio, expandedCount, expansionSteps }.' },
      { path: 'emptyReason', type: 'object|null', required: true, note: 'Set instead of an empty `files` list: { why, searchedTerms[] }. Null when files were found.' },
      { path: 'unknown', type: 'object|null', required: true, note: 'Present only when categories is [UNKNOWN]. Carries why, askedForNarrowing and suggestion[].' },
    ],
    fileShape: {
      path: 'string', score: 'number', priority: 'P0|P1|P2|P3|P4|P5',
      tier: 'string', role: 'string|null', feature: 'string|null',
      why: 'string[]', matched: 'string|null', lines: 'number|null',
      addedByExpansion: 'boolean', expansionTrigger: 'string|null',
    },
    tiers: ['CRITICAL', 'HIGH_RISK', 'GENERATED', 'NORMAL'],
    confidences: ['HIGH', 'MEDIUM', 'LOW'],
    counts: {
      features: features.length,
      components: components.length,
    },
  });

  out['generated/KNOWLEDGE_ROUTING_GRAPH.json'] = meta({
    description: 'Category -> knowledge document graph. Lets a caller know which .md file answers a category without invoking the router.',
    edges: buildKnowledgeEdges(),
    counts: (() => {
      const edges = buildKnowledgeEdges();
      return {
        edges: edges.length,
        documents: new Set(edges.map((e) => e.file)).size,
        categories: new Set(edges.map((e) => e.category)).size,
      };
    })(),
  });

  return out;
}

/**
 * Category -> knowledge document edges, derived from the routing matrix.
 *
 * This is the machine-readable counterpart of ROUTING_MATRIX.json: given a
 * category, it answers "which .md do I read?" without the caller having to
 * import the router or know the routing table. Built from the matrix rather
 * than hand-listed so the two cannot disagree.
 */
function buildKnowledgeEdges() {
  const matrix = buildRoutingMatrix();
  const edges = [];
  for (const [category, def] of Object.entries(matrix.categories)) {
    for (const file of def.knowledge ?? []) {
      edges.push({
        category,
        file,
        reason: def.summary,
        primaryIndexes: def.primaryIndexes ?? [],
        ownerActionRequired: !!def.ownerActionRequired,
      });
    }
  }
  return edges.sort((a, b) =>
    a.category.localeCompare(b.category) || a.file.localeCompare(b.file));
}

/* ------------------------------------------------------------------ *
 * Write / check
 * ------------------------------------------------------------------ */

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const statsOnly = args.includes('--stats');

  const m = build();
  const artifacts = compose(m);

  const snap = sourceSnapshot(m.disc.indexed);
  const srcFp = treeFingerprint(m.disc.indexed);

  const manifest = meta({
    description: 'Freshness record for every intelligence artifact. The ONLY file carrying a timestamp.',
    generatedAt: new Date().toISOString(),
    sourceFingerprint: srcFp,
    sourceFileCount: m.disc.indexed.length,
    sourceBytes: m.disc.totals.parseableBytes,
    // Full per-file snapshot so `--check` can report WHICH files drifted rather
    // than only that the fingerprint moved.
    sourceSnapshot: snap,
    // NOTE: no fingerprint of the generated outputs is recorded here.
  //
  // A manifest that stores a hash of the previous outputs is self-referential:
  // run N embeds the state written by run N-1, so the value necessarily differs
  // on every run and `--check` can never reach "fresh". Byte comparison in
  // `--check` is already the freshness authority, so the field was redundant as
  // well as unstable.
  exclusions: {
      directories: [...NO_INDEX_DIRS].sort(),
      totals: m.disc.totals,
      ledger: m.disc.excluded.map((e) => ({ path: e.path, kind: e.kind, reason: e.reason, filesBeneath: e.filesBeneath })),
    },
    timingsMs: m.timings,
    artifacts: Object.keys(artifacts).map((rel) => ({
      path: `.uihub-agent/${rel}`,
      bytes: Buffer.byteLength(stable(artifacts[rel])),
    })).sort((a, b) => a.path.localeCompare(b.path)),
  });
  artifacts['generated/INTELLIGENCE_MANIFEST.json'] = manifest;

  // ---- compare EVERY artifact, so "fresh" is proven rather than assumed ----
  //
  // The report covers all artifacts and `fresh`/`STALE` is decided per file. The
  // earlier version only pushed entries on failure, so the summary line read
  // "0/1 fresh" whenever anything drifted  the denominator was the failure
  // count, not the artifact count, and a missing artifact was indistinguishable
  // from a stale one.
  const report = [];
  const stale = [];
  const leaks = [];

  for (const [rel, obj] of Object.entries(artifacts)) {
    const target = join(ROOT, '.uihub-agent', rel);
    const content = stable(obj);
    const existed = existsSync(target);
    const prior = existed ? readFileSync(target, 'utf8') : null;

    // Secret gate on the exact bytes, before they can reach disk (task 7.29).
    const findings = scanText(content, `.uihub-agent/${rel}`)
      .filter((f) => f.verdict === 'REAL_SECRET');
    if (findings.length) leaks.push({ target: `.uihub-agent/${rel}`, findings });

    // The manifest is the only artifact carrying wall-clock values, so it is
    // compared with those stripped; a literal comparison makes `--check` fail
    // immediately after a successful write.
    const isManifest = rel === 'generated/INTELLIGENCE_MANIFEST.json';
    const comparable = isManifest ? stripVolatile(content) : content;
    const same = prior !== null && (isManifest ? stripVolatile(prior) : prior) === comparable;

    const entry = {
      file: `.uihub-agent/${rel}`,
      status: !existed ? 'MISSING' : same ? 'fresh' : 'STALE',
    };
    report.push(entry);
    if (entry.status !== 'fresh') stale.push(entry);

    // `--check` and `--stats` are both read-only. `--stats` is documented as
    // "counts and timings, no write", so it must take the same branch as
    // `--check`; treating it as a write is how a read-only flag silently
    // rewrote artifacts.
    if (!check && !statsOnly) {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content, 'utf8');
    }
  }

  if (leaks.length) {
    console.error('[generate-index] BLOCKED: generated output would contain a real secret.');
    for (const l of leaks) {
      console.error(`  ${l.target}: ${l.findings.map((f) => `${f.detector}@L${f.line}`).join(', ')}`);
    }
    process.exit(2);
  }

  if (!statsOnly) {
    for (const r of check ? stale : report) {
      console.log(`[generate-index] ${r.status.padEnd(9)} ${r.file}`);
    }
  }

  const fresh = report.length - stale.length;

  if (statsOnly) {
    // Read-only summary: what the index would contain, and how far it currently
    // is from the source tree. Nothing on disk is touched on this path.
    console.log(
      `[generate-index] stats: ${m.disc.indexed.length} files - ` +
        `${(m.disc.totals.parseableBytes / 1024 / 1024).toFixed(1)} MB - ` +
        `${report.length} artifacts - fp=${shortHash(srcFp)}`,
    );
    console.log(
      `[generate-index] stats: ${fresh}/${report.length} fresh, ` +
        `drift=${stale.length}, wrote nothing`,
    );
    return;
  }

  if (check) {
    console.log(
      `[generate-index] check: ${fresh}/${report.length} fresh, ` +
      `drift=${stale.length}, fingerprint=${shortHash(srcFp)}`,
    );
    if (stale.length) {
      const prev = safeManifest();
      if (prev && Array.isArray(prev.sourceSnapshot)) {
        const ch = changedFiles(prev.sourceSnapshot, snap);
        for (const p of ch.modified.slice(0, 20)) console.log(`  source changed: ${p}`);
        for (const p of ch.added.slice(0, 20)) console.log(`  source added:   ${p}`);
        for (const p of ch.removed.slice(0, 20)) console.log(`  source removed: ${p}`);
        if (!ch.modified.length && !ch.added.length && !ch.removed.length) {
          console.log('  no indexed source file changed  an index was hand-edited; regenerate it');
        }
      }
      console.log('[generate-index] run `npm run agent:index` to refresh');
      process.exit(1);
    }
    console.log('[generate-index] all intelligence artifacts are fresh');
  } else {
    console.log(
      `[generate-index] wrote ${report.length} artifacts - ${m.disc.indexed.length} files - ` +
      `${(m.disc.totals.parseableBytes / 1024 / 1024).toFixed(1)} MB - ${m.timings.total} ms - fp=${shortHash(srcFp)}`,
    );
  }
}

function safeManifest() {
  try {
    return JSON.parse(readFileSync(join(GENERATED_DIR, 'INTELLIGENCE_MANIFEST.json'), 'utf8'));
  } catch {
    return null;
  }
}

main();