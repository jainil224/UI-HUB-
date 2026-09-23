#!/usr/bin/env node
/**
 * validate-spec.mjs
 *
 * UI-HUB Component Forge — Phase 2 spec validator.
 *
 * Validates a generated component spec (§4 self-check in SKILL.md) with zero
 * dependencies on plain Node (>=18) ESM. It is READ-ONLY: it never writes a file.
 *
 * Usage:
 *   node .agents/skills/uihub-component-forge/scripts/validate-spec.mjs <path-to-spec.md>
 *
 * Exit codes: 0 = all checks passed, 1 = one or more checks failed,
 *             2 = usage/IO error.
 */

import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(SKILL_ROOT, '..', '..', '..');
const INDEX_PATH = path.join(SKILL_ROOT, 'data', 'component-index.json');
const COMPONENT_DATA_PATH = path.join(REPO_ROOT, 'frontend', 'src', 'data', 'componentData.tsx');

const VALID_CATEGORIES = ['interactive-background', 'image-interaction'];
const EXPECTED_SECTIONS = [
  { num: 1, title: 'Header' },
  { num: 2, title: 'Visual Intent' },
  { num: 2.5, title: 'Inspiration Sources' },
  { num: 3, title: 'Tech Stack Analysis' },
  { num: 4, title: 'Reference Components Used' },
  { num: 5, title: 'Research Findings' },
  { num: 6, title: 'Technical Approach' },
  { num: 7, title: 'Props Contract' },
  { num: 8, title: 'Full Implementation' },
  { num: 9, title: 'Performance Plan' },
  { num: 10, title: 'Accessibility' },
  { num: 11, title: 'Naming Contract' },
  { num: 12, title: 'Integration Preview' },
  { num: 13, title: 'Test Checklist' },
  { num: 14, title: 'Risks & Open Questions' },
];

/** Capitalized type identifiers the standalone §8a block may use without declaring them in-block. */
const SAFE_GLOBALS = new Set([
  'React',
  'Array', 'ReadonlyArray', 'Record', 'Promise', 'Partial', 'Required', 'Pick', 'Omit',
  'Readonly', 'Exclude', 'Extract', 'NonNullable', 'ReturnType', 'Parameters', 'InstanceType',
  'Map', 'Set', 'WeakMap', 'WeakSet', 'Date', 'RegExp', 'Error', 'URL', 'Blob', 'File',
  'TextDecoder', 'TextEncoder', 'Image', 'Audio', 'Performance',
  'HTMLElement', 'HTMLCanvasElement', 'HTMLDivElement', 'HTMLImageElement', 'HTMLVideoElement',
  'HTMLInputElement', 'HTMLButtonElement', 'HTMLSpanElement', 'HTMLAnchorElement',
  'HTMLAudioElement', 'HTMLMediaElement', 'HTMLBodyElement', 'HTMLFormElement',
  'HTMLTableCellElement', 'HTMLHeadingElement', 'HTMLParagraphElement', 'HTMLSelectElement',
  'CanvasRenderingContext2D', 'WebGLRenderingContext', 'WebGL2RenderingContext',
  'WebGLProgram', 'WebGLShader', 'WebGLBuffer', 'WebGLTexture', 'WebGLUniformLocation',
  'WebGLFramebuffer', 'WebGLContextAttributes',
  'Element', 'Node', 'Document', 'DocumentFragment', 'Window', 'Event', 'PointerEvent',
  'MouseEvent', 'TouchEvent', 'UIEvent', 'WheelEvent', 'KeyboardEvent', 'FocusEvent',
  'MediaQueryList', 'MediaQueryListEvent', 'ResizeObserver', 'IntersectionObserver',
  'MutationObserver', 'ResizeObserverEntry', 'IntersectionObserverEntry', 'DOMRect',
  'DOMRectReadOnly', 'CSSStyleDeclaration', 'CSSRule', 'CSSMediaRule', 'SVGElement', 'SVGSVGElement',
]);

const failures = [];
const warnings = [];

const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);

/** Parse `## N. Title` headings (N may be a decimal subsection like `2.5`), ignoring anything inside fenced code blocks. */
function parseSections(md) {
  const lines = md.split('\n');
  const sections = new Map();
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) return;
    const m = /^##\s+(\d+(?:\.\d+)?)\.?\s+(.+?)\s*$/.exec(line);
    if (m) {
      const num = Number(m[1]);
      if (!sections.has(num)) sections.set(num, { title: m[2].trim(), line: i + 1 });
    }
  });
  return sections;
}

/** Return the raw text of section `num` (up to the next `## N.` heading or EOF). */
function sectionText(md, num) {
  const lines = md.split('\n');
  let start = -1;
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^##\s+(\d+(?:\.\d+)?)\.?\s+/.exec(line);
    if (m) {
      if (start === -1 && Number(m[1]) === num) { start = i + 1; continue; }
      if (start !== -1) return lines.slice(start, i).join('\n');
    }
  }
  return start === -1 ? '' : lines.slice(start).join('\n');
}

function firstCodeBlock(text) {
  const m = /```[a-zA-Z0-9]*\n([\s\S]*?)```/.exec(text);
  return m ? m[1] : null;
}

/** Split a markdown table row on unescaped `|`; unescape `\|` back to `|`. */
function splitCells(row) {
  return row
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, '|'));
}

function extractField(md, label) {
  const re = new RegExp(label + '\\**[^\\n]*', 'i');
  const m = re.exec(md);
  return m ? m[0] : null;
}

function extractBackticked(line) {
  if (!line) return null;
  const m = /`([^`]+)`/.exec(line);
  return m ? m[1] : null;
}

async function main() {
  const specPath = process.argv[2];
  if (!specPath) {
    console.error('Usage: node validate-spec.mjs <path-to-spec.md>');
    process.exit(2);
  }

  let md;
  try {
    md = await readFile(path.resolve(specPath), 'utf8');
  } catch (err) {
    console.error(`Cannot read spec at ${specPath}: ${err.message}`);
    process.exit(2);
  }

  // --- Check 1: 15 sections present, in order -----------------------------
  const sections = parseSections(md);
  const present = [...sections.keys()].sort((a, b) => a - b);
  for (const expected of EXPECTED_SECTIONS) {
    if (!sections.has(expected.num)) {
      fail(`Check 1 Sections: missing section ${expected.num}. ${expected.title}`);
    }
  }
  if (present.length !== EXPECTED_SECTIONS.length) {
    fail(`Check 1 Sections: expected ${EXPECTED_SECTIONS.length} sections, found ${present.length} (${present.join(', ')}).`);
  }
  const unexpected = present.filter((n) => !EXPECTED_SECTIONS.some((e) => e.num === n));
  if (unexpected.length) {
    fail(`Check 1 Sections: unexpected section number(s) ${unexpected.join(', ')} — every heading must be one of the ${EXPECTED_SECTIONS.length} expected sections.`);
  }
  let lastSeen = -1;
  const orderedNums = [...sections.entries()].sort((a, b) => a[1].line - b[1].line).map(([n]) => n);
  for (const n of orderedNums) {
    if (n <= lastSeen) fail(`Check 1 Sections: section ${n} appears out of order (line ${sections.get(n).line}).`);
    lastSeen = Math.max(lastSeen, n);
  }
  if (orderedNums.length && orderedNums[0] !== 1) {
    fail(`Check 1 Sections: expected section 1 first, found section ${orderedNums[0]}.`);
  }

  // --- Check 2: category slug -------------------------------------------------
  const catLine = extractField(md, 'Category');
  const category = extractBackticked(catLine) ?? (catLine ? catLine.replace(/.*Category\**\s*:?\s*/i, '').trim() : null);
  if (!category) {
    fail('Check 2 Category: no `Category:` field found in the header.');
  } else if (!VALID_CATEGORIES.includes(category)) {
    fail(`Check 2 Category: "${category}" is not one of ${VALID_CATEGORIES.join(' | ')}.`);
  }

  // --- Check 2b: tech stack analysis (§3) + no invented stack ----------------
  const techstack = sectionText(md, 3);
  if (!techstack.trim()) {
    fail('Check 2b Tech Stack: section 3 (Tech Stack Analysis) is empty — summarize the house style found in the category doc.');
  } else {
    const HOUSE_PKGS = new Set(['react', 'react-dom', 'framer-motion']);
    const imports = (sectionText(md, 8).match(/(?:from\s+|import\s*\()\s*["']([^"']+)["']/g) || [])
      .map((s) => (s.match(/["']([^"']+)["']/) || [])[1]);
    const foreign = [...new Set(imports.filter((p) => !p.startsWith('.') && !p.startsWith('@') && !HOUSE_PKGS.has(p)))];
    if (foreign.length) {
      warn(`Check 2b Tech Stack: section 8 imports npm package(s) ${foreign.join(', ')} not in the house stack (${[...HOUSE_PKGS].join(', ')}).`);
    }
  }

  // --- Check 3: proposed slug (kebab-case + uniqueness) -----------------------
  const slugLine = extractField(md, 'Proposed slug');
  const slug = extractBackticked(slugLine);
  if (!slug) {
    fail('Check 3 Slug: no `Proposed slug:` backticked value found.');
  } else {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      fail(`Check 3 Slug: "${slug}" is not kebab-case (expected /^[a-z0-9]+(-[a-z0-9]+)*$/).`);
    }
    try {
      const index = JSON.parse(await readFile(INDEX_PATH, 'utf8'));
      if (Array.isArray(index) && index.some((e) => e.slug === slug)) {
        fail(`Check 3 Slug: "${slug}" already exists in data/component-index.json.`);
      }
    } catch (err) {
      warn(`Check 3 Slug: could not read component-index.json (${err.message}); uniqueness only checked against componentData.tsx.`);
    }
    try {
      const data = await readFile(COMPONENT_DATA_PATH, 'utf8');
      if (data.includes(`id: "${slug}"`) || data.includes(`"${slug}":`)) {
        fail(`Check 3 Slug: "${slug}" already exists in frontend/src/data/componentData.tsx.`);
      }
    } catch (err) {
      warn(`Check 3 Slug: could not read componentData.tsx (${err.message}).`);
    }
  }

  // --- Check 4: naming contract (file / export / slug agreement) --------------
  const naming = sectionText(md, 11);
  if (!naming.trim()) {
    fail('Check 4 Naming: section 11 is empty.');
  } else {
    const hasSlug = slug ? naming.includes(slug) : false;
    const hasFile = /\.tsx/.test(naming);
    const hasExport = /\bexport\b/.test(naming);
    if (!hasSlug) fail('Check 4 Naming: section 11 does not state the proposed slug.');
    if (!hasFile) fail('Check 4 Naming: section 11 does not state the .tsx file name.');
    if (!hasExport) fail('Check 4 Naming: section 11 does not state the export name.');
  }

  // --- Check 5: props table shape + no `any` ----------------------------------
  const props = sectionText(md, 7);
  if (!props.trim()) {
    fail('Check 5 Props: section 7 is empty.');
  } else {
    const rows = props.split('\n').filter((l) => /^\s*\|.*\|\s*$/.test(l));
    const dataRows = rows.filter((l) => !/^\s*\|[\s:|-]+\|\s*$/.test(l));
    if (dataRows.length === 0) {
      fail('Check 5 Props: no props table found in section 7.');
    } else {
      const header = splitCells(dataRows[0]);
      if (header.length !== 4) {
        fail(`Check 5 Props: table header must have 4 columns (Name | Type | Default | Purpose), found ${header.length}.`);
      }
      const bodyRows = dataRows.slice(1);
      if (bodyRows.length === 0) {
        fail('Check 5 Props: no props table rows found in section 7.');
      }
      bodyRows.forEach((row) => {
        const cells = splitCells(row);
        if (cells.length !== 4) {
          fail(`Check 5 Props: row "${cells[0] || row.trim()}" has ${cells.length} columns (expected 4). Escape literal pipes inside a type as \\| (e.g. Array<string \\| { src; alt? }>).`);
          return;
        }
        const typeCell = cells[1];
        if (/\bany\b/i.test(typeCell)) {
          fail(`Check 5 Props: \`any\` used in a prop type ("${cells[0]}" -> ${typeCell}).`);
        }
      });
    }
  }

  // --- Check 6: §8 split + portability of the standalone block -----------------
  const impl = sectionText(md, 8);
  if (!/###\s*8a\.?\s/i.test(impl)) {
    fail('Check 6 Cleanup: section 8 is missing the "### 8a. Standalone drop-in version" sub-heading.');
  }
  if (!/###\s*8b\.?\s/i.test(impl)) {
    fail('Check 6 Cleanup: section 8 is missing the "### 8b. Project-integrated version" sub-heading.');
  }
  const code = firstCodeBlock(impl);
  if (!code) {
    fail('Check 6 Cleanup: no fenced code block found in section 8 (Full Implementation).');
  } else {
    // 6a: cleanup return in the standalone block
    if (!/return\s*\(\s*\)\s*=>|return\s+function/.test(code) && !/no cleanup needed/i.test(code)) {
      fail('Check 6 Cleanup: no cleanup return (`return () => …`) found in the standalone implementation block (or explicit "no cleanup needed" note).');
    }
    // 6b: import paths must resolve outside this repo (no @/ or relative paths)
    const relImports = (code.match(/(?:from\s+["']|import\(\s*["'])(@\/|\.\.?\/)[^"']*["']/g) || []).map((s) => s.replace(/\s+/g, ' ').trim());
    if (relImports.length) {
      fail(`Check 6 Portability: standalone block has project-relative imports (${relImports.join(', ')}) — use bare npm packages or React only.`);
    }
    // 6c: no bare CSS var() without a fallback value
    const bareVar = code.match(/var\(--[a-zA-Z0-9_-]+\s*\)/g);
    if (bareVar) {
      fail(`Check 6 Portability: standalone block uses bare CSS var() without a fallback (${bareVar.join(', ')}) — use a literal or var(--x, fallback).`);
    }
    // 6d: strict type scan — every capitalized type identifier must be declared in-block or be a known global.
    // Ternary `:` colons are NOT type annotations (`x ? A : B`), so a `?` at the same paren depth as the colon
    // (that is not `?.`, `??`, `??=` or an optional-type `?:`) marks the colon as ternary and skips it.
    const declared = new Set();
    const dRe = /(?:type|interface)\s+([A-Z][\w$]*)/g;
    let dm;
    while ((dm = dRe.exec(code))) declared.add(dm[1]);
    const used = new Set();
    const parenDepthAt = (line, idx) => {
      let depth = 0;
      for (let i = 0; i < idx; i++) {
        if (line[i] === '(' || line[i] === '[') depth++;
        else if (line[i] === ')' || line[i] === ']') depth--;
      }
      return depth;
    };
    const isTernaryColon = (line, colonCol) => {
      const targetDepth = parenDepthAt(line, colonCol);
      let depth = 0;
      for (let i = 0; i < colonCol; i++) {
        const ch = line[i];
        if (ch === '(' || ch === '[') { depth++; continue; }
        if (ch === ')' || ch === ']') { depth--; continue; }
        if (depth === targetDepth && ch === '?') {
          const next = line[i + 1];
          if (next === ':') continue;
          if (next !== '.' && next !== '?') return true;
        }
      }
      return false;
    };
    const tRe = /(?:^|[^.\w])(:|\bas\b|new)\s+([A-Z][\w$]*(?:\.[A-Z][\w$]*)*)/g;
    let tm;
    while ((tm = tRe.exec(code))) {
      if (tm[1] === ':') {
        const at = tm.index + tm[1].length;
        const lineStart = code.lastIndexOf('\n', at) + 1;
        const lineEnd = code.indexOf('\n', at);
        const line = code.slice(lineStart, lineEnd === -1 ? code.length : lineEnd);
        if (isTernaryColon(line, at - lineStart)) continue;
      }
      used.add(tm[2].split('.')[0]);
    }
    const gRe = /<\s*([A-Z][\w$]*(?:\.[A-Z][\w$]*)?)(?=\??[,\s]>|>)/g;
    let gm;
    while ((gm = gRe.exec(code))) used.add(gm[1].split('.')[0]);
    const bad = [...used].filter((t) => !declared.has(t) && !SAFE_GLOBALS.has(t));
    if (bad.length) {
      fail(`Check 6 Portability: type identifier(s) used in the standalone block are not declared there and not known React/DOM/WebGL globals (${bad.join(', ')}).`);
    }
  }

  // --- Check 7: prefers-reduced-motion ----------------------------------------
  if (!/prefers-reduced-motion/i.test(md)) {
    fail('Check 7 Motion: `prefers-reduced-motion` does not appear anywhere in the spec.');
  }

  // --- Check 8: §12 machine-checkable integration edit plan ------------------
  const integration = sectionText(md, 12);
  if (!integration.trim()) {
    fail('Check 8 Integration: section 12 is empty.');
  } else {
    const jsonBlock = /```json\s*\n([\s\S]*?)```/.exec(integration);
    if (!jsonBlock) {
      fail('Check 8 Integration: no fenced ```json edit plan found in section 12.');
    } else {
      let edits;
      try {
        edits = JSON.parse(jsonBlock[1]);
      } catch (err) {
        fail(`Check 8 Integration: edit plan is not valid JSON (${err.message}).`);
      }
      if (edits !== undefined) {
        if (!Array.isArray(edits)) {
          fail('Check 8 Integration: edit plan must be a JSON array.');
        } else if (edits.length === 0) {
          fail('Check 8 Integration: edit plan contains no edits.');
        } else {
          const OPS = ['insert-after', 'insert-before', 'create-file'];
          edits.forEach((edit, i) => {
            const at = `edit[${i}]`;
            if (edit === null || typeof edit !== 'object' || Array.isArray(edit)) {
              fail(`Check 8 Integration: ${at} is not an object.`);
              return;
            }
            for (const f of ['file', 'anchor', 'operation', 'payload', 'why']) {
              if (!(f in edit)) fail(`Check 8 Integration: ${at} missing field "${f}".`);
              else if (typeof edit[f] !== 'string') fail(`Check 8 Integration: ${at}.${f} must be a string.`);
            }
            if (typeof edit.file !== 'string' || !edit.file.trim()) {
              fail(`Check 8 Integration: ${at}.file is empty.`);
              return;
            }
            if (/:\d+/.test(edit.file)) {
              fail(`Check 8 Integration: ${at}.file contains a line number — line numbers are not allowed.`);
            }
            if (!OPS.includes(edit.operation)) {
              fail(`Check 8 Integration: ${at}.operation "${edit.operation}" is not one of ${OPS.join(' | ')}.`);
              return;
            }
            if (typeof edit.payload !== 'string' || !edit.payload.trim()) {
              fail(`Check 8 Integration: ${at}.payload is empty.`);
            }
            if (typeof edit.why !== 'string' || !edit.why.trim()) {
              fail(`Check 8 Integration: ${at}.why is empty.`);
            }
            const abs = path.resolve(REPO_ROOT, edit.file);
            const targetExists = existsSync(abs);
            if (edit.operation === 'create-file') {
              if (targetExists) {
                fail(`Check 8 Integration: ${at} create-file target already exists: ${edit.file}`);
              }
              return;
            }
            if (!targetExists) {
              fail(`Check 8 Integration: ${at} target file does not exist: ${edit.file}`);
              return;
            }
            if (typeof edit.anchor !== 'string' || !edit.anchor) {
              fail(`Check 8 Integration: ${at} ${edit.operation} needs a non-empty anchor.`);
              return;
            }
            let text;
            try {
              text = readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
            } catch (err) {
              fail(`Check 8 Integration: ${at} cannot read ${edit.file} (${err.message}).`);
              return;
            }
            const needle = edit.anchor.replace(/\r\n/g, '\n');
            let count = 0;
            let idx = 0;
            while ((idx = text.indexOf(needle, idx)) !== -1) {
              count++;
              idx += needle.length;
            }
            if (count !== 1) {
              fail(`Check 8 Integration: ${at} anchor matches ${count} times in ${edit.file} (must be exactly 1).`);
            }
          });
        }
      }
    }
  }

  // --- Report -----------------------------------------------------------------
  if (warnings.length) {
    console.log('Warnings:');
    warnings.forEach((w) => console.log(`  - ${w}`));
  }
  if (failures.length) {
    console.error(`\nFAIL: ${failures.length} check(s) failed for ${specPath}`);
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log(`\nOK: ${specPath} passed all checks (15 sections, category, slug, tech stack, naming, props, cleanup + standalone portability, reduced-motion, §12 edit plan).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`Unexpected error: ${err.stack || err.message}`);
  process.exit(1);
});