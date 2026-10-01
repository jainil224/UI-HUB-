/**
 * Protected path detection — agent.md tasks 8.21-8.26, 8.52.
 *
 * The tiers come from the generated maps, not from a hand-written list that
 * could drift from PROTECTED_PATHS.md. Each protected file a task's categories
 * touch is classified into a tier, and the matching rule text is surfaced so
 * the agent knows WHAT it is forbidden from doing, not merely that something is
 * sensitive.
 */

import { intel } from './intel.mjs';
import { buildRoutingMatrix } from './router-matrix.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../query-index.mjs';

const HIGH_CAUTION_CATEGORIES = ['SECURITY', 'PAYMENT', 'AUTHENTICATION', 'DEPLOYMENT'];

let rulesCache = null;

/**
 * Parse PROTECTED_PATHS.md into tiers.
 *
 * The document is organised as `## CRITICAL — ...` / `## HIGH RISK — ...`
 * headings each followed by a `| Path | Why |` table. It is parsed rather than
 * hardcoded so a change to the document automatically changes the router's
 * behaviour, and a path that is protected in the document but unknown to the
 * code is caught by `check-index` rather than silently ignored.
 */
export function protectedRules() {
  if (rulesCache) return rulesCache;
  // Resolved from the repository root, not the process CWD: a test runner or a
  // CI step invoked from a subdirectory would otherwise read nothing and
  // silently classify every path as NORMAL.
  const p = join(ROOT, '.uihub-agent', 'rules', 'PROTECTED_PATHS.md');
  if (!existsSync(p)) { rulesCache = []; return rulesCache; }
  const lines = readFileSync(p, 'utf8').split(/\r?\n/);
  const rules = [];
  let tier = null;
  for (const line of lines) {
    const h = line.match(/^##\s+(CRITICAL|HIGH\s+RISK|GENERATED|NORMAL)\b(.*)$/i);
    if (h) {
      tier = h[1].toUpperCase().replace(/\s+/g, '_');
      continue;
    }
    if (!tier) continue;
    if (!/^\s*\|/.test(line)) { if (line.trim() === '') continue; tier = null; continue; }
    const cells = line.split('|').map((c) => c.trim()).filter((c) => c !== '');
    if (cells.length < 2) continue;
    if (/^-+$/.test(cells[0].replace(/:/g, ''))) continue;
    if (cells[0].toLowerCase() === 'path') continue;
    const raw = cells[0];
    // "`render.yaml`, `mcp-server/render.yaml`" -> two entries; a trailing
    // "Any `*.pem`" pattern becomes a glob. Parenthetical counts such as
    // "(83 tracked files)" are annotation, not part of the path.
    const frags = raw
      .replace(/\((?:[^)]*)\)/g, '')
      .replace(/→.*$/, '')
      .split(/,\s*(?=and\s|`)/)
      .map((s) => s.replace(/`/g, '').trim())
      .filter(Boolean);
    for (const frag of frags) {
      const cleaned = frag.replace(/^(any|any\s+)\s+/i, '').trim();
      if (cleaned) rules.push({ tier, path: cleaned, why: cells.slice(1).join(' ') });
    }
  }
  rulesCache = rules;
  return rulesCache;
}

/** Which tier does a path fall into, per PROTECTED_PATHS.md. */
export function tierFor(path) {
  for (const rule of protectedRules()) {
    if (matchFragment(path, rule.path)) return rule.tier;
  }
  return 'NORMAL';
}

function matchFragment(path, frag) {
  if (!frag) return false;
  if (path === frag) return true;
  if (frag.endsWith('/') && path.startsWith(frag)) return true;
  // A directory entry covers everything beneath it.
  if (!frag.includes('*') && path.startsWith(`${frag}/`)) return true;
  if (frag.includes('*')) {
    // "dist/**" and "dist/*.json" both mean "this tree", so `**` is folded into
    // `.*` rather than being treated as a single path segment.
    const re = new RegExp(`^${frag.split('*').map(escapeRe).join('.*')}$`);
    return re.test(path);
  }
  return false;
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/**
 * For a set of categories and the files the task touches, return protected
 * files with their tier and the matching rule description.
 */
export function detectProtected(categories, touchedFiles = []) {
  const matrix = buildRoutingMatrix();
  const out = new Map();

  // Protected files declared by the matched categories.
  for (const c of categories) {
    const def = matrix.categories[c];
    for (const p of def?.protectedAreas ?? []) {
      if (!out.has(p)) out.set(p, { path: p, tier: tierFor(p), rule: ruleTextFor(p), via: c });
    }
  }

  // Any file the task actually references that is itself protected.
  for (const f of touchedFiles) {
    const tier = tierFor(f);
    if (tier !== 'NORMAL' && !out.has(f)) out.set(f, { path: f, tier, rule: ruleTextFor(f), via: 'referenced-by-task' });
  }

  const highCaution = categories.some((c) => HIGH_CAUTION_CATEGORIES.includes(c));
  return {
    areas: [...out.values()],
    highCaution,
    highCautionReason: highCaution
      ? `touches high-risk categories: ${categories.filter((c) => HIGH_CAUTION_CATEGORIES.includes(c)).join(', ')}`
      : null,
  };
}

function ruleTextFor(path) {
  const r = protectedRules().find((rule) => matchFragment(path, rule.path));
  return r ? { tier: r.tier, rule: r.why, source: '.uihub-agent/rules/PROTECTED_PATHS.md' } : null;
}