/**
 * Single-pass AST extraction — agent.md tasks 7.2–7.18.
 *
 * Every file is parsed exactly ONCE and the result is shared by all seventeen
 * outputs. Parsing is lazy per file but eager across consumers: generate-index
 * builds the full model up front, then each writer reads the same objects.
 *
 * The AST is the whole point. Measured on this repository, a regex-based reader
 * (the style used by the pre-existing generate-map.mjs) loses 9 `export * from`
 * edges and all 270 dynamic-import edges, and cannot give a symbol's line
 * number — which is the field that makes SYMBOL_INDEX navigable.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
export const ts = require('typescript');

/**
 * Top-level declaration kinds that become SYMBOL_INDEX entries.
 *
 * Keyed NUMERICALLY and compared with `===`, never by name.
 *
 * `ts.SyntaxKind[ts.SyntaxKind.VariableStatement]` returns `'FirstStatement'`,
 * not `'VariableStatement'`: SyntaxKind merges several enums and its alias
 * members (`FirstStatement = SyntaxList`) collide, so the reverse mapping
 * resolves to the alias. A name-keyed lookup therefore classified all 1,795
 * `const` declarations in this repository as kind `null`.
 */
const SYMBOL_KIND_BY_NUM = new Map([
  [ts.SyntaxKind.FunctionDeclaration, 'function'],
  [ts.SyntaxKind.ClassDeclaration, 'class'],
  [ts.SyntaxKind.InterfaceDeclaration, 'interface'],
  [ts.SyntaxKind.TypeAliasDeclaration, 'type'],
  [ts.SyntaxKind.EnumDeclaration, 'enum'],
  [ts.SyntaxKind.ModuleDeclaration, 'namespace'],
  [ts.SyntaxKind.VariableStatement, 'variable'],
]);

function symbolKindOfStatement(st) {
  return SYMBOL_KIND_BY_NUM.get(st.kind) ?? null;
}

/** Binding-pattern flattener: `const {a, b: c} = x` → ['a','b','c']. */
function bindingNames(name, out = []) {
  if (!name) return out;
  if (ts.isIdentifier(name)) {
    out.push(name.text);
  } else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    for (const el of name.elements) {
      if (ts.isOmittedExpression(el)) continue;
      bindingNames(el.name, out);
    }
  } else if (ts.isAssignmentPattern(name)) {
    bindingNames(name.left, out);
  }
  return out;
}

function modifiersOf(node) {
  const mods = [];
  if (!node.modifiers) return mods;
  for (const m of node.modifiers) {
    if (ts.SyntaxKind[m.kind] === 'ExportKeyword') mods.push('export');
    if (ts.SyntaxKind[m.kind] === 'DefaultKeyword') mods.push('default');
    if (ts.SyntaxKind[m.kind] === 'AsyncKeyword') mods.push('async');
    if (ts.SyntaxKind[m.kind] === 'DeclareKeyword') mods.push('declare');
  }
  return mods;
}

function scriptKindOf(path, ext) {
  if (ext === '.tsx') return ts.ScriptKind.TSX;
  if (ext === '.jsx') return ts.ScriptKind.JSX;
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

/**
 * Flatten the module statement list.
 *
 * TypeScript interleaves `SyntaxList` pseudo-nodes into `sourceFile.statements`
 * (they surface under the `FirstStatement` kind name via the enum's reverse
 * mapping). A plain `for...of sf.statements` therefore sees a mixture of real
 * statements and lists, and any statement nested inside a list is missed.
 */
function topLevelStatements(sf) {
  const out = [];
  const walk = (nodes) => {
    for (const st of nodes) {
      if (ts.isSyntaxList(st)) walk(st.getChildren(sf));
      else out.push(st);
    }
  };
  walk(sf.statements);
  return out;
}

/**
 * Parse one file into a plain record.
 *
 * Named/default exports are collected from the module's own declarations
 * (function `export function foo`, `export default X`, `export const a`) so the
 * SYMBOL_INDEX can answer "who exports what" without re-reading the file.
 */
export function parseFile(file) {
  const text = readFileSync(file.abs, 'utf8');
  const sf = ts.createSourceFile(
    file.abs,
    text,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    scriptKindOf(file.path, file.ext),
  );

  const record = {
    path: file.path,
    abs: file.abs,
    ext: file.ext,
    bytes: file.size,
    lines: text.split('\n').length,
    imports: [],
    dynamicImports: [],
    reExports: [],
    symbols: [],
    exports: [],
    defaultExport: null,
    /** JSX usage only applies to .tsx, so no regex is involved. */
    usesJsx: false,
    /** Detected literal string occurrences of interesting tokens, line-anchored. */
    literals: [],
    hasJsxImport: false,
    hasReactImport: false,
  };

  const addLiteral = (line, text2) => record.literals.push({ line, text: text2 });

  const visitImportLike = (specText, kind, node, isDynamic) => {
    const lc = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    const entry = {
      specifier: specText,
      line: lc.line + 1,
      kind,
    };
    if (isDynamic) {
      entry.dynamic = true;
      record.dynamicImports.push(entry);
    } else if (kind === 'import') {
      record.imports.push(entry);
    } else {
      // re-export
      record.reExports.push(entry);
      // `export * from` and `export { x } from` are both module-level edges.
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        entry.named = node.exportClause.elements.map((e) => e.name.text);
      } else if (node.exportClause && ts.isNamespaceExport(node.exportClause)) {
        entry.namespace = node.exportClause.name.text;
      } else {
        entry.star = true;
      }
      record.imports.push({ ...entry, kind: 'reExport' });
    }
  };

  // ---- module-level statements ----
  for (const st of topLevelStatements(sf)) {
    const lc = sf.getLineAndCharacterOfPosition(st.getStart(sf));
    const line = lc.line + 1;

    if (ts.isImportDeclaration(st)) {
      if (st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier)) {
        visitImportLike(st.moduleSpecifier.text, 'import', st, false);
      }
      // `import type { X } from` still creates a module edge but not a value dep.
      if (st.importClause?.isTypeOnly) {
        record.imports[record.imports.length - 1].typeOnly = true;
      }
      if (st.importClause) {
        const nc = st.importClause;
        if (nc.name) record.imports[record.imports.length - 1].defaultImport = nc.name.text;
        if (nc.namedBindings && ts.isNamedImports(nc.namedBindings)) {
          record.imports[record.imports.length - 1].named = nc.namedBindings.elements.map((e) => e.name.text);
        }
        if (nc.namedBindings && ts.isNamespaceImport(nc.namedBindings)) {
          record.imports[record.imports.length - 1].namespaceImport = nc.namedBindings.name.text;
        }
      }
      continue;
    }

    if (ts.isExportDeclaration(st)) {
      if (st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier)) {
        visitImportLike(st.moduleSpecifier.text, 'reExport', st, false);
      }
      continue;
    }

    if (ts.isExportAssignment(st)) {
      record.defaultExport = { line, expression: st.expression.getText(sf).slice(0, 120) };
      addLiteral(line, 'export-assignment');
      continue;
    }

    // A VariableStatement owns a declarationList; every other declaration kind
    // (function/class/interface/type/enum) owns a plain `name`. Testing
    // declarationList first — not the symbol kind — is what keeps functions and
    // classes in the index: an earlier version branched on the kind and asked a
    // FunctionDeclaration for a declarationList it does not have, which silently
    // produced a zero-symbol index.
    const declared = st.declarationList
      ? st.declarationList.declarations.flatMap((d) => bindingNames(d.name))
      : st.name
        ? bindingNames(st.name)
        : [];

    const kind = symbolKindOfStatement(st);

    if (declared.length) {
      const mods = modifiersOf(st);
      // A capitalized `const` is only a component if its initializer actually
      // produces JSX or is a function. componentData.tsx alone declares ~900
      // capitalized constants that are data entries; classifying them as
      // components inflated SYMBOL_INDEX from 1238 "components" to a number an
      // agent cannot use.
      let producesJsxOrFn = false;
      if (st.declarationList) {
        for (const d of st.declarationList.declarations) {
          const init = d.initializer;
          if (!init) continue;
          if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) producesJsxOrFn = true;
          else if (ts.isObjectLiteralExpression(init) || ts.isArrayLiteralExpression(init) ||
                   ts.isCallExpression(init) || ts.isJsxElement(init) || ts.isJsxSelfClosingElement(init) ||
                   ts.isJsxFragment(init)) {
            (function hasJsx(n) {
              if (producesJsxOrFn) return;
              if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) {
                producesJsxOrFn = true;
                return;
              }
              ts.forEachChild(n, hasJsx);
            })(init);
          }
        }
      }
      for (const name of declared) {
        record.symbols.push({
          name,
          kind,
          line,
          exported: mods.includes('export') || mods.includes('default'),
          isDefault: mods.includes('default'),
          async: mods.includes('async'),
          producesJsxOrFn,
        });
      }
    }
  }

  // ---- whole-tree: dynamic imports, JSX, react detection ----
  const visit = (node) => {
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      if (node.arguments.length && ts.isStringLiteral(node.arguments[0])) {
        visitImportLike(node.arguments[0].text, 'dynamic', node, true);
      }
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
      record.usesJsx = true;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  // ---- react / jsx detection from imports (not from name heuristics) ----
  for (const imp of record.imports) {
    if (imp.specifier === 'react') record.hasReactImport = true;
    if (imp.specifier === 'react-dom') record.hasReactImport = true;
    if (imp.specifier.startsWith('@react-spring/')) record.hasSpringImport = true;
  }

  return record;
}

/** Parse a batch, returning a Map keyed by repo-relative path. */
export function parseAll(indexed) {
  const out = new Map();
  for (const f of indexed) out.set(f.path, parseFile(f));
  return out;
}