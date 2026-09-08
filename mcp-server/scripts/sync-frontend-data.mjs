/**
 * Syncs UI HUB frontend data into the MCP server's src/data directory.
 *
 * Extracts from the UI HUB frontend (frontend/src/data):
 *   - componentData.tsx          -> COMPONENT_METADATA + CATEGORY_LIST (src/data/components.ts)
 *   - antigravity|claude|lovable -> aiPrompts.json
 *   - componentMetadata.ts       -> componentMetadata.json
 *   - templatesData.ts           -> templates.json
 *   - embeddedSourceCode.ts + dedicated source files -> sourceCode.json
 *
 * Usage: node scripts/sync-frontend-data.mjs
 */

import ts from 'typescript';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const FRONT = path.join(ROOT, 'frontend', 'src', 'data');
const OUT = path.join(ROOT, 'mcp-server', 'src', 'data');
const BACKEND = path.join(ROOT, 'backend', 'src', 'data');

/** Transpile a TS data module to CJS and evaluate it, returning its exports. */
function evalTs(relPath) {
  const src = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: relPath,
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(js, { module, exports: module.exports, require: (id) => {
    throw new Error(`Unexpected require in ${relPath}: ${id}`);
  }, console, process, setTimeout, clearTimeout, setInterval, clearInterval });
  return module.exports;
}

function loadJsExport(filePath, exportName) {
  const src = fs.readFileSync(filePath, 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filePath,
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(js, { module, exports: module.exports, require: (id) => {
    throw new Error(`Unexpected require in ${filePath}: ${id}`);
  }, console, process, setTimeout, clearTimeout, setInterval, clearInterval });
  return module.exports[exportName];
}

/** Read an embedded source-code map (object literal of strings) from a TS/JS file. */
function parseStringMap(obj) {
  const map = {};
  for (const k of Object.keys(obj)) map[k] = String(obj[k]);
  return map;
}

/** Collect component records from componentData.tsx via the AST. */
function collectComponents() {
  const file = path.join(FRONT, 'componentData.tsx');
  const source = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let listNode = null;
  const visit = (node) => {
    if (listNode) return;
    if (ts.isVariableDeclaration(node) && node.name.getText(sf) === 'componentList' && node.initializer) {
      listNode = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sf, visit);
  if (!listNode || !ts.isArrayLiteralExpression(listNode)) throw new Error('componentList array not found');
  const out = [];
  for (const el of listNode.elements) {
    if (!ts.isObjectLiteralExpression(el)) continue;
    const rec = {};
    for (const prop of el.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const name = prop.name.getText(sf);
      const val = prop.initializer;
      if (ts.isStringLiteral(val)) rec[name] = val.text;
      else if (ts.isNoSubstitutionTemplateLiteral(val)) rec[name] = val.text;
      else if (ts.isTemplateExpression(val)) {
        const parts = [val.head.text];
        for (const span of val.templateSpans) {
          parts.push('${' + span.expression.getText(sf) + '}');
          parts.push(span.literal.text);
        }
        rec[name] = parts.join('');
      }
      else if (val.kind === ts.SyntaxKind.TrueKeyword) rec[name] = true;
      else if (val.kind === ts.SyntaxKind.FalseKeyword) rec[name] = false;
    }
    out.push(rec);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Components (src/data/components.ts)
// ---------------------------------------------------------------------------
const components = collectComponents().filter((c) => c.id);

const CATEGORY_DESCRIPTIONS = {
  '3d': '3D and WebGL components',
  background: 'Animated background components',
  button: 'Interactive button components',
  cursor: 'Custom cursor and pointer effects',
  effect: 'Visual effects and transitions',
  footer: 'Website footer layouts',
  'image-interaction': 'Image interactions and galleries',
  'interactive-background': 'Interactive canvas/WebGL backgrounds',
  loader: 'Loading and preloader animations',
  navbar: 'Navigation bar layouts',
  scroll: 'Scroll-triggered animations',
  text: 'Text and typography animations',
};

const DEPENDENCY_HINTS = {
  '3d': ['react', 'three', '@react-three/fiber', '@react-three/drei'],
  'interactive-background': ['react', 'three', '@react-three/fiber', '@react-three/drei'],
};

function humanizeId(id) {
  return id.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const premiumIds = components.filter((c) => c.isPremium).map((c) => c.id);

// components.ts content
const compHeader = `/**
 * UI HUB component metadata for the MCP server.
 * AUTO-GENERATED by scripts/sync-frontend-data.mjs from frontend componentData.tsx.
 * Do not edit by hand — rerun the sync script instead.
 */

export interface ComponentMeta {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  isPremium: boolean;
  dependencies: string[];
  framework: 'react' | 'vue' | 'html' | 'vanilla';
  styling: 'tailwind' | 'css' | 'scss';
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = ${JSON.stringify(CATEGORY_DESCRIPTIONS, null, 2)};

const PREMIUM_IDS = new Set(${JSON.stringify(premiumIds, null, 2)});

// id -> category (from frontend componentData.tsx)
const CATEGORY_MAP: Record<string, string> = ${JSON.stringify(
  Object.fromEntries(components.map((c) => [c.id, c.category])), null, 2
)};

// id -> common dependencies
const DEPENDENCIES_MAP: Record<string, string[]> = {
${components.map((c) => {
  const deps = DEPENDENCY_HINTS[c.category] || ['react'];
  const hasFramer = ['text', 'effect', 'scroll', 'image-interaction'].includes(c.category);
  const framed = hasFramer && !deps.includes('framer-motion') ? [...deps, 'framer-motion'] : deps;
  return `  '${c.id}': ${JSON.stringify(framed)},`;
}).join('\n')}
};

function humanizeId(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Define the component catalog programmatically from the category map
export const COMPONENT_METADATA: ComponentMeta[] = Object.keys(CATEGORY_MAP).map((id) => {
  const category = CATEGORY_MAP[id];
  return {
    id,
    title: humanizeId(id),
    category,
    description: \`\${humanizeId(id)} — \${CATEGORY_DESCRIPTIONS[category] || 'UI HUB component'}\`,
    tags: [category, ...id.split('-'), ...(id.includes('cursor') ? ['cursor', 'interactive'] : []), ...(id.includes('background') ? ['background', 'animated'] : [])],
    isPremium: PREMIUM_IDS.has(id),
    dependencies: DEPENDENCIES_MAP[id] || ['react'],
    framework: 'react',
    styling: 'tailwind',
  };
});

export const CATEGORY_LIST = Object.keys(CATEGORY_DESCRIPTIONS).map((slug) => ({
  slug,
  label: slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' '),
  description: CATEGORY_DESCRIPTIONS[slug],
}));
`;

fs.writeFileSync(path.join(OUT, 'components.ts'), compHeader, 'utf8');
console.log('components.ts written with', components.length, 'components;', premiumIds.length, 'premium');

// ---------------------------------------------------------------------------
// 2. AI prompts (src/data/aiPrompts.json)
// ---------------------------------------------------------------------------
const claude = evalTs('frontend/src/data/claudePrompts.ts').CLAUDE_PROMPTS || {};
const antigravity = evalTs('frontend/src/data/antigravityPrompts.ts').ANTIGRAVITY_PROMPTS || {};
const lovable = evalTs('frontend/src/data/lovablePrompts.ts').LOVABLE_PROMPTS || {};

const aiPrompts = {
  claude,
  antigravity,
  lovable,
  _meta: {
    generatedAt: new Date().toISOString(),
    sources: ['claudePrompts.ts', 'antigravityPrompts.ts', 'lovablePrompts.ts'],
  },
};
fs.writeFileSync(path.join(OUT, 'aiPrompts.json'), JSON.stringify(aiPrompts, null, 2), 'utf8');
console.log('aiPrompts.json written: claude', Object.keys(claude).length, ', antigravity', Object.keys(antigravity).length, ', lovable', Object.keys(lovable).length);

// ---------------------------------------------------------------------------
// 3. Component metadata (src/data/componentMetadata.json)
// ---------------------------------------------------------------------------
const metadata = evalTs('frontend/src/data/componentMetadata.ts').COMPONENT_CONFIG || {};
fs.writeFileSync(path.join(OUT, 'componentMetadata.json'), JSON.stringify(metadata, null, 2), 'utf8');
console.log('componentMetadata.json written with', Object.keys(metadata).length, 'configs');

// 3b. Component vibe prompts (src/data/componentVibePrompts.json) — id -> vibePrompt
const vibePrompts = {};
for (const c of components) {
  if (c.vibePrompt && typeof c.vibePrompt === 'string' && c.vibePrompt.trim()) {
    vibePrompts[c.id] = c.vibePrompt;
  }
}
fs.writeFileSync(path.join(OUT, 'componentVibePrompts.json'), JSON.stringify(vibePrompts, null, 2), 'utf8');
console.log('componentVibePrompts.json written with', Object.keys(vibePrompts).length, 'entries');

// ---------------------------------------------------------------------------
// 4. Templates (src/data/templates.json)
// ---------------------------------------------------------------------------
const templates = evalTs('frontend/src/data/templatesData.ts').websiteTemplates || [];
fs.writeFileSync(path.join(OUT, 'templates.json'), JSON.stringify(templates, null, 2), 'utf8');
console.log('templates.json written with', templates.length, 'templates');

// ---------------------------------------------------------------------------
// 5. Source code (src/data/sourceCode.json)
// ---------------------------------------------------------------------------
const sourceCode = {};

// Primary: frontend embeddedSourceCode.ts (largest single source)
try {
  const fe = evalTs('frontend/src/data/embeddedSourceCode.ts').EMBEDDED_SOURCE_CODE || {};
  Object.assign(sourceCode, parseStringMap(fe));
} catch (e) { console.error('  (skip frontend embeddedSourceCode.ts:', e.message + ')'); }

// Backend sources add anything extra (EMBEDDED_SOURCE_CODE + COMPONENT_FULL_SOURCES)
try {
  const backendMain = loadJsExport(path.join(BACKEND, 'sourceCodeData.js'), 'EMBEDDED_SOURCE_CODE');
  if (backendMain) Object.assign(sourceCode, parseStringMap(backendMain));
} catch (e) { console.error('  (skip backend sourceCodeData.js:', e.message + ')'); }
try {
  const backendFull = loadJsExport(path.join(BACKEND, 'componentFullSources.js'), 'COMPONENT_FULL_SOURCES');
  if (backendFull) Object.assign(sourceCode, parseStringMap(backendFull));
} catch (e) { console.error('  (skip backend componentFullSources.js:', e.message + ')'); }

// Dedicated single-component source files (id -> key)
const dedicatedFiles = {
  'cinematic-navbar': ['cinematicNavbarSource.ts', 'CINEMATIC_NAVBAR_SOURCE'],
  'omniflow-footer': ['omniflowFooterSource.ts', 'OMNIFLOW_FOOTER_SOURCE'],
  'sora-footer': ['soraFooterSource.ts', 'SORA_FOOTER_SOURCE'],
  'haul-footer': ['haulFooterSource.ts', 'HAUL_FOOTER_SOURCE'],
  'sui-foundation': ['suiFoundationSource.ts', 'SUI_FOUNDATION_SOURCE'],
};
for (const [id, [file, key]] of Object.entries(dedicatedFiles)) {
  const fp = path.join(FRONT, file);
  if (!fs.existsSync(fp)) continue;
  try {
    const v = evalTs(`frontend/src/data/${file}`)[key];
    if (typeof v === 'string' && v.trim()) sourceCode[id] = v;
  } catch (e) { console.error(`  (skip ${file}:`, e.message + ')'); }
}

// Read remaining component source files directly from disk (frontend/src/components)
const DISK_COMPONENT_DIR = path.join(ROOT, 'frontend', 'src', 'components');
const DISK_UI_DIR = path.join(DISK_COMPONENT_DIR, 'ui');

// Explicit overrides for ids whose PascalCase filename doesn't match a naive conversion
const DISK_OVERRIDES = {
  'ascii-cursor': 'AsciiCursor.tsx',
  'aura-cursor': 'AuraCursor.tsx',
  'kinetic-grid': 'KineticGrid.tsx',
  'user-cursor': 'UserCursor.tsx',
  'block-drift': 'BlockDrift.tsx',
  'lightfall': 'Lightfall.tsx',
  'morphing-rings': 'MorphingRings.tsx',
  'particle-sphere': 'ParticleSphere.tsx',
  'point-dna-helix': 'PointDNAHelix.tsx',
  'tornado': 'Tornado.tsx',
  'twin-galaxy-rings': 'TwinGalaxyRings.tsx',
};

function kebabToPascal(id) {
  return id.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

for (const [id, file] of Object.entries(DISK_OVERRIDES)) {
  if (sourceCode[id]) continue;
  const fp = path.join(DISK_UI_DIR, file);
  if (fs.existsSync(fp)) sourceCode[id] = fs.readFileSync(fp, 'utf8');
}

// General resolver: any catalog id still missing gets a PascalCase scan of frontend/src/components/ui
for (const comp of components) {
  if (sourceCode[comp.id]) continue;
  const pascal = kebabToPascal(comp.id);
  const fp = path.join(DISK_UI_DIR, pascal + '.tsx');
  if (fs.existsSync(fp)) sourceCode[comp.id] = fs.readFileSync(fp, 'utf8');
}

// Canonical premium IDs not in the catalog (premium-only components served by backend/MCP)
let canonicalPremiumIds = [];
try {
  canonicalPremiumIds = [...(evalTs('frontend/src/data/premiumComponents.ts').PREMIUM_COMPONENT_IDS || [])];
} catch (e) { console.error('  (skip premiumComponents.ts:', e.message + ')'); }
for (const id of canonicalPremiumIds) {
  if (sourceCode[id]) continue;
  const pascal = kebabToPascal(id);
  const fp = path.join(DISK_UI_DIR, pascal + '.tsx');
  if (fs.existsSync(fp)) sourceCode[id] = fs.readFileSync(fp, 'utf8');
}

// Templates source: read ?raw template files from disk
const templateIds = templates.map((t) => t.id);
const templateFileMap = {
  'tars-protocol': ['templates', 'TarsHeroArena.tsx'],
  'tars-hero-arena': ['templates', 'TarsHeroArena.tsx'],
  'split-fuzzy-orb': ['templates', 'SplitFuzzyOrbHero.tsx'],
  'segmint-2026': ['templates', 'SegmintFooter.tsx'],
  'haos-tech-solutions': ['templates', 'HaosShowcase.tsx'],
  'mentality': ['templates', 'MentalityHero.tsx'],
  'lakera-ai-security': ['templates', 'LakeraHero.tsx'],
  'interior-design': ['templates', 'InteriorDesignShowcase.tsx'],
  'lumos': ['templates', 'LumosHero.tsx'],
  'loveapp-hero': ['templates', 'LoveAppHero.tsx'],
  'heyo-agency-cta': ['templates', 'HeyoAgencyCta.tsx'],
  'me-019-au-cabaret': ['templates', 'AuCabaretPoster.tsx'],
  'dont-be-greedy': ['templates', 'DontBeGreedyFooter.tsx'],
  'paipai-kuaishou': ['templates', 'PaipaiKuaishou.tsx'],
  'logo-here': ['templates', 'LogoHere.tsx'],
  'partify': ['templates', 'Partify.tsx'],
  'sui-overflow': ['templates', 'SuiOverflow.tsx'],
};
const templateSource = {};
for (const id of new Set(templateIds)) {
  const [sub, file] = templateFileMap[id] || [];
  if (!file) continue;
  const fp = path.join(DISK_COMPONENT_DIR, sub, file);
  if (fs.existsSync(fp)) templateSource[id] = fs.readFileSync(fp, 'utf8');
}

fs.writeFileSync(path.join(OUT, 'sourceCode.json'), JSON.stringify(sourceCode, null, 2), 'utf8');
fs.writeFileSync(path.join(OUT, 'templateSourceCode.json'), JSON.stringify(templateSource, null, 2), 'utf8');
console.log('sourceCode.json written with', Object.keys(sourceCode).length, 'entries');
console.log('templateSourceCode.json written with', Object.keys(templateSource).length, 'entries');

// Canonical premium ID list (MCP-local copy so the standalone repo build has no
// dependency on the frontend source tree). read by scripts/check-source-coverage.mjs
fs.writeFileSync(path.join(OUT, 'premiumComponents.json'), JSON.stringify(canonicalPremiumIds, null, 2), 'utf8');
console.log('premiumComponents.json written with', canonicalPremiumIds.length, 'canonical premium ids');

// ---------------------------------------------------------------------------
// Summary report
// ---------------------------------------------------------------------------
const coverage = components.reduce((acc, c) => {
  acc[c.category] = acc[c.category] || 0;
  if (sourceCode[c.id]) acc[c.category]++;
  return acc;
}, {});
const totalWithSource = components.filter((c) => sourceCode[c.id]).length;
console.log('\n=== Coverage report ===');
console.log('components total:', components.length);
console.log('components with source:', totalWithSource, `(${Math.round((totalWithSource / components.length) * 100)}%)`);
for (const [cat, withSrc] of Object.entries(coverage)) {
  const totalCat = components.filter((c) => c.category === cat).length;
  console.log(`  ${cat.padEnd(24)} ${String(withSrc).padStart(3)}/${totalCat}`);
}
