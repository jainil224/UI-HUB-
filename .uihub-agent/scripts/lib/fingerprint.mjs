/**
 * Freshness fingerprint — agent.md task 7.27.
 *
 * The fingerprint is a SHA-256 over a canonical, sorted manifest of
 * `path\0size\0sha256(content)` for every indexed file. It is deliberately
 * content-based rather than mtime-based: `git checkout` and CI artifact
 * extraction reset mtimes, which would make an mtime fingerprint report
 * "stale" for a tree that is byte-identical.
 *
 * Fingerprint covers CONTENT ONLY. No timestamp enters the hash, so `--check`
 * can do an exact byte comparison of every generated file without the
 * strip-the-timestamp regex the pre-existing generator needs.
 */

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

/** Directories whose tracked content must change whenever sources change. */
export const GENERATED_TREES = ['.uihub-agent/codebase', '.uihub-agent/generated'];

/** Individual generated files outside those trees. */
export const GENERATED_FILES = ['.uihub-agent/PROJECT_MAP.json'];

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

/** Short form used inside indexes for human eyeballing. */
export function shortHash(hex, n = 12) {
  return hex.slice(0, n);
}

function toPosix(p) {
  return p.split(sep).join('/');
}

/**
 * Snapshot of the source tree: path → { size, sha }.
 *
 * Content hash, not mtime, because mtime is not reproducible across checkouts.
 */
export function sourceSnapshot(indexed) {
  const entries = [];
  for (const f of indexed) {
    let buf;
    try {
      buf = readFileSync(f.abs);
    } catch {
      entries.push({ path: f.path, size: -1, sha: 'unreadable' });
      continue;
    }
    entries.push({ path: f.path, size: buf.length, sha: sha256(buf) });
  }
  entries.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return entries;
}

/** Canonical string form hashed into the tree fingerprint. */
export function canonicalize(entries) {
  return entries.map((e) => `${e.path}\0${e.size}\0${e.sha}`).join('\n');
}

export function treeFingerprint(indexed) {
  return sha256(canonicalize(sourceSnapshot(indexed)));
}

/**
 * Fingerprint of generated outputs, used to detect hand-edits.
 *
 * If a developer edits SYMBOL_INDEX.json by hand, `sourceFingerprint` still
 * matches (sources unchanged) but `outputsFingerprint` no longer matches the
 * committed one — so `--check` reports HAND_EDITED rather than silently
 * accepting the drift.
 */
export function outputsFingerprint(root) {
  const entries = [];
  for (const tree of GENERATED_TREES) {
    const dir = resolve(root, tree);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).sort()) {
      if (!name.endsWith('.json')) continue;
      const abs = join(dir, name);
      if (!statSync(abs).isFile()) continue;
      entries.push({ path: `${tree}/${name}`, size: statSync(abs).size, sha: sha256(readFileSync(abs)) });
    }
  }
  for (const f of GENERATED_FILES) {
    const abs = resolve(root, f);
    if (!existsSync(abs)) continue;
    entries.push({ path: f, size: statSync(abs).size, sha: sha256(readFileSync(abs)) });
  }
  entries.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return { fingerprint: sha256(canonicalize(entries)), files: entries.length, entries };
}

/**
 * Cache-hit check.
 *
 * The source snapshot is stored in full in the manifest so `--check` can
 * answer "which files changed" rather than only "did something change" —
 * that turns a CI failure from a mystery into a diff.
 */
export function changedFiles(previousEntries, currentEntries) {
  const prev = new Map(previousEntries.map((e) => [e.path, e.sha]));
  const cur = new Map(currentEntries.map((e) => [e.path, e.sha]));
  const added = [];
  const modified = [];
  const removed = [];
  for (const [p, sha] of cur) {
    if (!prev.has(p)) added.push(p);
    else if (prev.get(p) !== sha) modified.push(p);
  }
  for (const p of prev.keys()) if (!cur.has(p)) removed.push(p);
  return { added: added.sort(), modified: modified.sort(), removed: removed.sort() };
}

export function toPosixPath(p) {
  return toPosix(p);
}

export function relPath(root, abs) {
  return toPosix(relative(root, abs));
}