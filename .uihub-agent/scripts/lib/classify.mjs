/**
 * File-role classification, feature inference, and symbol naming.
 *
 * Roles are derived from PATH CONVENTION first and CONFIRMED by AST content
 * second. The order matters: a file called `useFoo.ts` that exports a hook is
 * unambiguously a HOOK regardless of directory, but a file called
 * `templatesData.ts` that exports only constants is DATA even though it lives
 * next to components. Path alone would mislabel the second; content alone
 * would mislabel a re-export barrel.
 *
 * Every classification that relies on a heuristic rather than a strong signal is
 * tagged LOW_CONFIDENCE (see confidence.mjs) so it can never be mistaken for a
 * fact.
 */

import { basename, extname } from 'node:path';

/** Path patterns → role, evaluated in array order (first match wins). */
// Ordered most-specific first: the first match wins.
//
// `components/` is deliberately placed BELOW the directory names it commonly
// contains. Without that, `components/ui/CloudScroll/constants/footer.ts` matched
// `components?/` and was published as a React component named `FOOTER_LINKS` --
// it is a typed array of link data with no JSX in it. The same inversion
// mislabelled `constants/projects.ts` and `constants/work.ts`.
/**
 * True when a path is a test file by the same evidence classify.mjs uses.
 *
 * The TEST evidence is defined once here so the generator and the classifier can
 * never disagree about what counts as a test. It is deliberately not exported as
 * a role lookup: callers that already have a classified file should read its role.
 */
export function isTestPath(path) {
  const base = basename(path);
  if (/\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/.test(base)) return true;
  return /(^|\/)(tests?|__tests__)\//i.test(path);
}

const PATH_RULES = [
  [/(^|\/)constants?\//i, 'DATA'],
  [/(^|\/)types?\//i, 'TYPE'],
  [/(^|\/)utils?\//i, 'UTILITY'],
  [/(^|\/)pages?\//i, 'PAGE'],
  [/(^|\/)routes?\//i, 'ROUTE_CONFIG'],
  [/(^|\/)api\/.*routes?\//i, 'API_ROUTE'],
  [/(^|\/)contexts?\//i, 'STATE'],
  [/(^|\/)stores?\//i, 'STATE'],
  [/(^|\/)state\//i, 'STATE'],
  [/(^|\/)layouts?\//i, 'LAYOUT'],
  [/(^|\/)models?\//i, 'MODEL'],
  [/(^|\/)controllers?\//i, 'CONTROLLER'],
  [/(^|\/)services?\//i, 'SERVICE'],
  [/(^|\/)tools?\//i, 'MCP_TOOL'],
  [/(^|\/)hooks?\//i, 'HOOK'],
  // `components/` sits below constants/, types/, utils/, stores/ and contexts/,
  // so a state store or a data module nested inside a component folder is
  // classified by what it is rather than by where it was put.
  [/(^|\/)components?\//i, 'COMPONENT'],
  // `templates/` is matched only OUTSIDE `components/`. `components/templates/`
  // holds 27 real React components, so matching it as TEMPLATE would strip them
  // all; `components/templates/registry.ts` is the one data file there and is
  // handled by the AST corrections below.
  [/(?<!components\/)((^|\/))templates?\//i, 'TEMPLATE'],
  [/(^|\/)data\//i, 'DATA'],
  [/(^|\/)prompts?\//i, 'DATA'],
  [/(^|\/)emailTemplates?\//i, 'TEMPLATE'],
  [/(^|\/)scripts?\//i, 'SCRIPT'],
  [/(^|\/)middleware\//i, 'MIDDLEWARE'],
  [/(^|\/)config\//i, 'CONFIG'],
  [/(^|\/)workers?\//i, 'WORKER'],
  [/(^|\/)tests?\//i, 'TEST'],
  [/(^|\/)__tests__\//i, 'TEST'],
];

/** Filename patterns → role, checked when no path rule matched. */
const NAME_RULES = [
  [/\.d\.ts$/, 'TYPE'],
  [/(^|[-_])use[A-Z]/, 'HOOK'],
  [/^(test|spec)[-_.]/i, 'TEST'],
  [/\.(test|spec)\.[tj]sx?$/, 'TEST'],
  [/^config\./i, 'CONFIG'],
  [/[-_]?service$/i, 'SERVICE'],
  /*
   * `index.*` is NOT a page. An earlier version mapped it to PAGE here, which
   * made the `index` branch of the ENTRY rule below unreachable and reported
   * pure re-export barrels such as
   * `components/ui/CloudScroll/constants/index.ts` as user-facing pages.
   *
   * `BARREL` is the starting guess and the AST pass below either confirms it
   * or promotes the file to PAGE / PAGE_SHELL / ENTRY based on what it
   * actually contains.
   */
  [/^index\.[tj]sx?$/, 'BARREL'],
  [/^(main|server|app)\.[tj]sx?$/, 'ENTRY'],
];

/** Top-level source directory → feature slug. */
const FEATURE_RULES = [
  [/^frontend\/src\/pages\/([^/]+)/i, (m) => kebab(m[1])],
  [/^frontend\/src\/features\/([^/]+)/i, (m) => kebab(m[1])],
  [/^frontend\/src\/sections\/([^/]+)/i, (m) => kebab(m[1])],
  [/^frontend\/src\/hooks\/(?:use)?([^/]+)/i, (m) => kebab(m[1])],
  [/^frontend\/src\/contexts?\/([^/.]+)/i, (m) => kebab(m[1])],
  [/^frontend\/src\/stores\/([^/.]+)/i, (m) => kebab(m[1])],
  [/^backend\/src\/routes\/([^/.]+)/i, (m) => kebab(m[1])],
  [/^backend\/src\/services\/([^/.]+)/i, (m) => kebab(m[1])],
  [/^backend\/src\/models?\//i, () => 'database'],
  [/^mcp-server\/src\//i, () => 'mcp'],
  [/^cli\/src\//i, () => 'cli'],
  [/^api\//i, () => 'api'],
];

function kebab(s) {
  return (
    s
      // A feature rule that captures a filename (`hooks/useMobile.ts`) must not
      // carry the extension into the slug: `useMobile.ts` became the feature
      // `mobile-ts`, which names a file rather than a feature. Interior dots are
      // still separators, so `config.test.ts` correctly yields `config-test`.
      .replace(/\.(tsx?|jsx?|mjs|cjs|json|css|scss)$/i, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[_\s.]+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')        // trim: a leading dash is not a feature name
      .toLowerCase()
  );
}

/**
 * Classify one parsed file.
 *
 * @param {object} rec  a record from parse.mjs
 * @param {object|null} graphEntry resolved edges for this file (post-resolution)
 */
/**
 * A React component is provable from JSX syntax plus a capitalized export.
 * Both signals are required: JSX alone appears in files that render nothing
 * they own, and a capitalized name alone matches ordinary constants.
 */
function isReactComponent(rec, exportedNames) {
  return (
    rec.usesJsx &&
    exportedNames.length > 0 &&
    exportedNames.some((n) => /^[A-Z]/.test(n))
  );
}

export function classifyFile(rec, graphEntry) {
  const path = rec.path;
  const base = basename(path);
  const ext = extname(path);

  let role = null;
  let roleSource = 'path-convention';
  let confidence = 'HIGH';

/*
   * A test file's role comes from its FILENAME, never from the directory that
   * happens to hold it.
   *
   * `PATH_RULES` outrank `NAME_RULES`, so `frontend/src/utils/apiConfig.test.ts`
   * matched `utils/` and was indexed as UTILITY - which silently disabled the
   * TEST_DEPENDENCY expansion trigger for every colocated test in the repo. A
   * test is a test wherever it lives, so this is checked first.
   *
   * The pattern matches the repository's ACTUAL conventions, taken from the
   * runner configs rather than assumed:
   *   frontend/vitest.config.ts   include: src, recursive, .test.ts
   *   mcp-server/vitest.config.ts include: tests, recursive, .test.ts
   *   backend/package.json        node --test over tests, recursive, .test.js
   *   cli/package.json            tests/*.test.ts named explicitly
   *
   * The extension list mirrors CODE_EXT in walk.mjs rather than repeating
   * `[tj]sx?`, so a `.test.mjs` suite is classified the same way a `.test.ts`
   * one is. Anchored at the end of the basename, so it cannot fire on a
   * directory or a prefix.
   *
   * It is deliberately NOT a substring search for "test". `backend/src/
   * scripts/sendAllTestEmails.js`, `testEmailRequest.js` and
   * `frontend/src/components/ui/testimonials-card.tsx` all contain "test" and
   * none of them is a test; they stay SCRIPT and COMPONENT because the rule
   * below only recognises a `.test.`/`.spec.` INFIX between a name and a known
   * code extension.
   */
  if (/\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/.test(base)) {
    role = 'TEST';
    roleSource = 'test-filename';
  } else if (/(^|\/)(tests?|__tests__)\//i.test(path)) {
    role = 'TEST';
    roleSource = 'test-directory';
  }

  if (!role) {
    for (const [re, r] of PATH_RULES) {
      if (re.test(path)) {
        role = r;
        break;
      }
    }
  }
  if (!role) {
    for (const [re, r] of NAME_RULES) {
      if (re.test(base)) {
        role = r;
        break;
      }
    }
  }
  if (!role) {
    role = 'UNKNOWN';
    roleSource = 'no-rule-matched';
    confidence = 'LOW_CONFIDENCE';
  }

  // ---- AST confirmation / correction ----
  const exportedNames = rec.symbols.filter((s) => s.exported).map((s) => s.name);
  const hasDefaultExport = Boolean(rec.defaultExport);
  const allTypeOnly =
    rec.symbols.length > 0 &&
    rec.symbols.every((s) => s.kind === 'interface' || s.kind === 'type') &&
    !hasDefaultExport;

  if (allTypeOnly && role !== 'TYPE') {
    role = 'TYPE';
    roleSource = 'ast:type-only-exports';
    confidence = 'HIGH';
  }

  /*
   * A barrel declares nothing of its own and only forwards other modules.
   * `default export <identifier>` counts as forwarding, which is how
   * `api/index.js` (`import app ...; export default app`) is recognised.
   *
   * This is checked before any path rule is trusted: a file that has no
   * declarations, no JSX, and only re-exports cannot be a component or a page
   * whatever its directory is called. Gating the check on the path rule having
   * already produced BARREL/ENTRY/PAGE would leave
   * `components/ui/CloudScroll/constants/index.ts` reported as a COMPONENT,
   * because `components/` wins the path match first.
   */
  const bareDefault = rec.defaultExport?.expression
    ? /^[A-Za-z_$][\w$]*$/.test(rec.defaultExport.expression.trim())
    : false;
  const isBarrel =
    rec.symbols.length === 0 &&
    !rec.usesJsx &&
    (rec.reExports.length > 0 || (rec.defaultExport && bareDefault));

  const inPagesDir = /(^|\/)pages?\//i.test(path);
  if (isBarrel) {
    // Inside pages/ a barrel is a page directory entry point a router can point
    // `element` at, which is a different thing from a general barrel.
    role = inPagesDir ? 'PAGE_SHELL' : 'BARREL';
    roleSource = 'ast:re-export-only';
    confidence = 'HIGH';
  } else if (role === 'BARREL') {
    /*
     * `index` is a filename, not a role. The NAME_RULES guess of BARREL is
     * resolved from the contents: a real page component stays a page, and
     * anything else (`cli/src/commands/index.ts`, `mcp-server/src/index.ts`)
     * is the module's public surface.
     */
    if (isReactComponent(rec, exportedNames)) {
      role = inPagesDir ? 'PAGE' : 'COMPONENT';
      roleSource = 'ast:jsx+capitalized-export';
      confidence = 'HIGH';
    } else {
      role = 'ENTRY';
      roleSource = 'ast:index-with-declarations';
      confidence = 'MEDIUM';
    }
  }

  // A React component is provable only from JSX syntax + a default/named export.
  if (isReactComponent(rec, exportedNames) &&
      (role === 'UNKNOWN' || (role === 'COMPONENT' && roleSource === 'path-convention'))) {
    role = 'COMPONENT';
    roleSource = 'ast:jsx+capitalized-export';
    confidence = 'HIGH';
  }

  /*
   * The inverse correction, and it matters just as much.
   *
   * A file under `components/` that contains no JSX anywhere and whose only
   * exports are SCREAMING_CASE values is data that happens to sit in a component
   * directory, not a component. `components/ui/CloudScroll/constants/footer.ts`
   * exports `FOOTER_LINKS: FooterLink[]` and nothing else; it was published as
   * a React component.
   *
   * The guard is deliberately narrow. It requires ALL of: no JSX, no default
   * export, no PascalCase export, and at least one SCREAMING_CASE export. A real
   * component that happens to sit beside a constant is untouched, because it
   * fails the PascalCase test.
   */
  const hasJsx = /\.[jt]sx$/.test(ext) && rec.usesJsx === true;
  if (role === 'COMPONENT' && roleSource === 'path-convention' && !hasJsx && !hasDefaultExport) {
    const screaming = exportedNames.filter((n) => /^[A-Z0-9_]+$/.test(n));
    const pascal = exportedNames.filter((n) => /^[A-Z]/.test(n) && !/^[A-Z0-9_]+$/.test(n));
    // A `registry.*` file with no JSX is a lookup table wherever it sits.
    // `components/templates/registry.ts` exports TEMPLATE_PREVIEWS and
    // resolvePreviewSource and renders nothing; its PascalCase export is a type.
    const isRegistry = /^registry[.-]/i.test(base);
    if (isRegistry || (screaming.length > 0 && pascal.length === 0)) {
      role = 'DATA';
      roleSource = isRegistry ? 'ast:registry-without-jsx' : 'ast:no-jsx+constants-only';
      confidence = 'HIGH';
    }
  }

  // Hook: filename says useX AND it exports something. Both, not either.
  if (/^use[A-Z]/.test(base.replace(/\.[^.]+$/, '')) && rec.symbols.length > 0) {
    role = 'HOOK';
    roleSource = 'ast:use-prefix-and-exports';
    confidence = 'HIGH';
  }

  const feature = inferFeature(path, role);

  return {
    path,
    role,
    roleSource,
    confidence,
    feature,
    ext,
    bytes: rec.bytes,
    lines: rec.lines,
    exports: exportedNames,
    defaultExport: hasDefaultExport,
    isBarrel,
    // A CALL, not a reference to the helper. `isReactComponent,` shorthand would
    // store the function object, which is truthy for every file, and every file
    // would then qualify as a component in COMPONENT_MAP.
    isReactComponent: isReactComponent(rec, exportedNames),
    isTypeOnly: allTypeOnly,
    usesJsx: rec.usesJsx,
    inbound: graphEntry ? graphEntry.inbound.length : 0,
    outbound: graphEntry ? graphEntry.internalOut.length : 0,
  };
}

export function inferFeature(path, role) {
  for (const [re, fn] of FEATURE_RULES) {
    const m = path.match(re);
    if (m) return fn(m);
  }

  /*
   * Fall back to the enclosing directory, never to the filename.
   *
   * A file sitting directly in `frontend/src` has no directory segment, so the
   * previous fallback used `path.split('/')[3]` - the FILENAME. That minted one
   * feature per root file (`componentData.tsx` -> `component-data-tsx`,
   * `claudePrompts.ts` -> `claude-prompts-ts`) and inflated FEATURE_MAP to 91
   * entries, most of them a single file. A feature list is a grouping; if it
   * has one member per file it is a renamed FILE_ROLE_MAP.
   */
  for (const [root, prefix] of [
    ['frontend/src/', 'frontend'],
    ['backend/src/', 'backend'],
    ['mcp-server/src/', 'mcp'],
    ['cli/src/', 'cli'],
  ]) {
    if (!path.startsWith(root)) continue;
    const seg = path.slice(root.length).split('/')[0];
    // A segment containing a dot is a file, not a directory.
    if (!seg) return 'shared';
    if (seg.includes('.')) return `${prefix}-root`;
    return kebab(seg);
  }

  return 'shared';
}

/**
 * Distinguish a page component from a plain component.
 *
 * Evidence, in order: the path contains `pages/`, the file is reachable from a
 * router, or it renders router outlets (`Outlet`, `useLocation`, `NavLink`).
 */
export function isPageLike(rec, role) {
  if (role === 'PAGE' || role === 'PAGE_SHELL') return true;
  const src = rec.imports.map((i) => i.specifier).join(' ');
  if (/react-router(-dom)?/.test(src) && /useLocation|useNavigate|NavLink|Outlet|<Routes?|<Route\b/.test(JSON.stringify(rec.symbols))) {
    return true;
  }
  return false;
}

/** Symbol classification for SYMBOL_INDEX: is this a React component? */
export function symbolKindOf(sym, rec) {
  if (rec?.usesJsx && /^[A-Z]/.test(sym.name)) {
    // Functions and classes are components by shape; variables only if their
    // initializer actually produces JSX or is a function.
    if (sym.kind === 'function' || sym.kind === 'class') return 'COMPONENT';
    if (sym.producesJsxOrFn) return 'COMPONENT';
    return 'CONSTANT';
  }
  if (sym.kind === 'variable' && /^use[A-Z]/.test(sym.name) && rec?.ext === '.ts') return 'HOOK';
  if (sym.kind === 'function' && /^use[A-Z]/.test(sym.name) && rec?.ext === '.ts') return 'HOOK';
  return String(sym.kind || 'unknown').toUpperCase();
}