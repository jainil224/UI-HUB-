/**
 * Durable memory retrieval — precedence, freshness, supersession, and evidence-based
 * ranking for `.uihub-agent/memory/`.
 *
 * The problem this module exists to solve is not "store text". It is that nine
 * phases of records in this repository now contradict each other, and a future
 * session reading them in the wrong order would confidently act on a belief that
 * was already superseded. `CONFLICTS.md` still opens with "Nothing here has been
 * fixed". That sentence was true on 2026-09-30 and is false now.
 *
 * So memory is not treated as a store of facts. It is treated as a store of
 * *dated, sourced, individually-stamped claims about the past*, ranked by how
 * recently they were verified and how authoritative their source is.
 *
 * Three rules do the real work:
 *
 *   1. PRECEDENCE. The repository beats memory, always. A memory record never
 *      overrides current source. `SOURCE_PRECEDENCE` makes the ladder explicit
 *      and testable instead of leaving it as prose someone can reinterpret.
 *   2. FRESHNESS. "Someone believed this" and "this is true" are different
 *      statements. `UNKNOWN` and `HISTORICAL` exist so that collapsing them is a
 *      deliberate choice rather than a default, because collapsing them is how a
 *      wrong belief becomes infrastructure.
 *   3. SUPERSESSION, NOT DELETION. A superseded record is kept and marked. The
 *      record that a question was once answered differently is itself evidence,
 *      and deleting it destroys the reason the current answer is trustworthy.
 *
 * Retrieval is evidence-cited and bounded. Every result states which tier matched
 * and why, because an unexplained rank is indistinguishable from a guess — and
 * this repository has a documented history of exactly that failure (see
 * `memory/LESSONS_LEARNED.md` LL-007).
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Where memory lives, relative to the repository root. */
export const MEMORY_DIR = join('.uihub-agent', 'memory');

/**
 * The precedence ladder, strongest first.
 *
 * This is the machine-readable form of `MEMORY_OVERVIEW.md` §4. The ladder answers
 * one question: when two sources disagree, which one wins?
 *
 * `HISTORICAL_ASSUMPTION` is deliberately last and deliberately still present. It
 * is what a belief becomes when it was never verified. Dropping it would make an
 * unverified claim indistinguishable from no claim at all, which is the opposite
 * of safe.
 */
export const SOURCE_PRECEDENCE = Object.freeze({
  RUNTIME_EVIDENCE: 'runtime_evidence',
  SOURCE: 'source',
  GENERATED_INTELLIGENCE: 'generated_intelligence',
  KNOWLEDGE_DOC: 'knowledge_doc',
  MEMORY: 'memory',
  HISTORICAL_ASSUMPTION: 'historical_assumption',
});

/**
 * Ordered strongest-first. Index 0 wins.
 *
 * Exported separately from `SOURCE_PRECEDENCE` because the map answers "what is
 * this source called" and the order answers "which wins". Those are different
 * questions and one of them can change without the other being wrong.
 */
export const PRECEDENCE_ORDER = Object.freeze([
  SOURCE_PRECEDENCE.RUNTIME_EVIDENCE,
  SOURCE_PRECEDENCE.SOURCE,
  SOURCE_PRECEDENCE.GENERATED_INTELLIGENCE,
  SOURCE_PRECEDENCE.KNOWLEDGE_DOC,
  SOURCE_PRECEDENCE.MEMORY,
  SOURCE_PRECEDENCE.HISTORICAL_ASSUMPTION,
]);

/**
 * Freshness classification. Every record carries one.
 *
 * `UNKNOWN` is the load-bearing member of this set. It exists because "recorded
 * without verification" is a real and common state — nine of Phase 2's questions
 * could not be settled — and a memory system with no slot for it will either
 * discard those records or quietly promote them to fact. Both are wrong.
 */
export const FRESHNESS = Object.freeze({
  CURRENT: 'CURRENT',
  RESOLVED: 'RESOLVED',
  HISTORICAL: 'HISTORICAL',
  SUPERSEDED: 'SUPERSEDED',
  UNKNOWN: 'UNKNOWN',
});

/**
 * Is this record still active policy?
 *
 * `RESOLVED` is active. A decision whose question has been answered and closed
 * still governs behaviour — DEC-009 is resolved *against* widening, so treating a
 * resolved decision as "no longer current" would file the ruling that expansion
 * must not widen under the heading of things that are no longer in force. What
 * `RESOLVED` records is that the question is settled, not that the answer expired.
 *
 * Without this predicate, every consumer re-derives "is it current?" as
 * `status === 'CURRENT'`, and the day a fifth status arrives they quietly
 * misclassify it everywhere at once.
 */
export function isActivePolicy(status) {
  return status === FRESHNESS.CURRENT || status === FRESHNESS.RESOLVED;
}

/**
 * Ranking weight by freshness. Lower sorts first.
 *
 * `SUPERSEDED` sorts last rather than being filtered out, because a reader asking
 * about a superseded belief usually wants to know both what is true now and what
 * it used to be. Filtering would answer half the question and look complete.
 *
 * `RESOLVED` shares weight 0 with `CURRENT` for the reason given in `isActivePolicy`:
 * a settled question is still in force.
 */
export const FRESHNESS_WEIGHT = Object.freeze({
  [FRESHNESS.CURRENT]: 0,
  [FRESHNESS.RESOLVED]: 0,
  [FRESHNESS.HISTORICAL]: 1,
  [FRESHNESS.UNKNOWN]: 2,
  [FRESHNESS.SUPERSEDED]: 3,
});

/**
 * Retrieval tiers, best first. The tier *is* the evidence for the rank.
 *
 * Each tier names a specific relationship, not a similarity score. A score can be
 * high for no articulable reason; these cannot. When a result is returned, the
 * caller can print why it was returned without inventing a justification.
 */
export const RETRIEVAL_PRIORITY = Object.freeze({
  P0: 'P0',
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
  P4: 'P4',
  P5: 'P5',
});

/** Tiers ordered best-first, used for sorting and for the result cap. */
export const PRIORITY_ORDER = Object.freeze(['P0', 'P1', 'P2', 'P3', 'P4', 'P5']);

/**
 * Human-readable meaning of each tier, carried into output so a result explains
 * itself without the reader consulting this file.
 */
export const PRIORITY_MEANING = Object.freeze({
  P0: 'record cites a file the query names exactly',
  P1: 'record cites the same feature',
  P2: 'record cites the same route or API endpoint',
  P3: 'record is in the same task category',
  P4: 'architectural decision concerning the matched subsystem',
  P5: 'token-level match only',
});

/**
 * Policy caps. Small on purpose.
 *
 * `maxResults` exists because a memory query that returns everything has answered
 * nothing: it costs the future session more context than the answer is worth, and
 * it pressures every later session toward skipping memory entirely. A memory layer
 * that must be read in full is one that will stop being read.
 */
export const MEMORY_POLICY = Object.freeze({
  maxResults: 12,
  maxPerFile: 4,
  maxSnippetChars: 240,
});

/**
 * Memory categories, in the order a reader is most likely to want them.
 *
 * `kind` is the retrieval class. Decisions and lessons are the negative-knowledge
 * carriers: what the system rejected and why, which is the part least recoverable
 * from the current code.
 */
export const MEMORY_CATEGORIES = Object.freeze({
  TASK_HISTORY: Object.freeze({
    file: 'TASK_HISTORY.md',
    kind: 'task',
    title: 'What did an AI task do, and did it work',
  }),
  ARCHITECTURAL_DECISIONS: Object.freeze({
    file: 'ARCHITECTURAL_DECISIONS.md',
    kind: 'decision',
    title: 'Why does the system work this way',
  }),
  LESSONS_LEARNED: Object.freeze({
    file: 'LESSONS_LEARNED.md',
    kind: 'lesson',
    title: 'What should be done differently',
  }),
  KNOWN_FIXES: Object.freeze({
    file: 'KNOWN_FIXES.md',
    kind: 'fix',
    title: 'How was this recurring problem solved',
  }),
  KNOWN_FAILURES: Object.freeze({
    file: 'KNOWN_FAILURES.md',
    kind: 'failure',
    title: 'What broke, how it was detected, what it cost',
  }),
  REGRESSION_HISTORY: Object.freeze({
    file: 'REGRESSION_HISTORY.md',
    kind: 'regression',
    title: 'What regressed, how it was found, what guards it now',
  }),
  LIMITATIONS: Object.freeze({
    file: 'LIMITATIONS.md',
    kind: 'limitation',
    title: 'What is still not solved',
  }),
});

/** Maps a category key to its file, for callers holding a filename. */
const FILE_TO_CATEGORY = Object.freeze(
  Object.fromEntries(
    Object.entries(MEMORY_CATEGORIES).map(([key, meta]) => [meta.file, { key, ...meta }]),
  ),
);

/**
 * Record ids look like `KF-001`, `LL-003`, `DEC-009`, `LIM-001`, `task-001`,
 * `R1`, `KFX-001`. The prefix carries the category, so an id is self-describing.
 */
const RECORD_ID = /\b((?:[A-Z]{2,5}|task)-\d{1,3}|R\d{1,2})\b/;

/** `**Status:** CURRENT` — bold-label metadata form used across memory files. */
const META_STATUS = /\*\*Status:\*\*\s*([A-Z_]+)/i;
/** `**Date:** 2026-10-10 · **Status:** CURRENT` — combined form. */
const META_DATE = /\*\*(?:Timestamp|Date):\*\*\s*(\d{4}-\d{2}-\d{2})/i;
const META_SOURCE = /\*\*Source:\*\*\s*([^\n*]+)/i;

/**
 * Secret-shaped values that must never reach query output.
 *
 * This is a defence in depth, not the primary control. `secret-scan.mjs` already
 * scans every tracked file, and `check:tracking` ensures memory files are tracked.
 * This exists for the specific case where a record *legitimately* describes a
 * credential-shaped thing and quotes a fragment of it — the description is
 * valuable, the value is not, and reprinting the value into a transcript is the
 * one place the other two controls cannot help.
 *
 * Patterns are deliberately narrow. A scanner that matches broadly will redact
 * ordinary prose and quietly destroy the evidence it was meant to protect.
 */
const SECRET_SHAPES = Object.freeze([
  // Bearer / token headers.
  /\b(?:Bearer|Basic|Token)\s+[A-Za-z0-9._\-~+/]{16,}=*/gi,
  // key=value pairs whose name is credential-shaped.
  //
  // The `(?!\[REDACTED\])` guard is what makes redaction idempotent. `[` is not
  // excluded from the value class, so without it a second pass matched the
  // marker this function had just inserted and redacted it again — `apiKey:
  // "[REDACTED]"` came out as `apiKey: "A[REDACTED]`, and each further pass ate
  // one more character. `containsSecretShape()` hides this by stripping the
  // marker before testing, which is why the guard is stated here rather than
  // left to the shape list.
  /\b(?:api[_-]?key|secret|password|passwd|token|private[_-]?key|client[_-]?secret|access[_-]?key)\b\s*[:=]\s*["']?((?!\[REDACTED\])[^\s"',;]{6,})["']?/gi,
  // JWTs.
  /\beyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\b/g,
  // PEM blocks, header and all.
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  // Credentials embedded in a connection string.
  /\b(mongodb(?:\+srv)?:\/\/[^:@\s]+:)[^@\s]+@/g,
  // Generic high-entropy hex blobs of key length.
  /\b[A-Fa-f0-9]{40,}\b/g,
  // Vendor-prefixed keys. These are real credential shapes that no generic
  // entropy rule catches, because they are mostly lowercase words: `sk-…` and
  // `ghp_…` would pass a length check and be printed into a transcript intact.
  // The prefix is the signal, so the pattern is anchored on it and stays narrow.
  /\b(?:sk|pk|rk|ghp|gho|ghu|ghs|github_pat|xox[baprs]|AKIA)[-_][A-Za-z0-9_\-]{8,}\b/g,
  // F5: the two shapes a Phase 10 dry run proved reached emitted output intact.
  //
  // Both are bare tokens: the surrounding words a memory record uses to describe
  // a key ("the key is <X>") are ordinary prose, so the header and key=value
  // patterns above never fired on them. A record could therefore name a live
  // credential in a sentence and have it printed into a transcript verbatim.
  //
  // The Google pattern is the canonical scanner's own expression from
  // `secret-scan.mjs` (`google-api-key`), width and all, rather than a second
  // guess at what a Google key looks like. The scanner stays the detection and
  // refusal system; this is only the output layer.
  //
  // `uh_live_` is this project's own MCP key prefix. 16 characters of trailing
  // token keeps the documented prefix mentions out: `uh_live_` on its own, the
  // `uh_live_...` placeholder used throughout `rules/`, and the `Bearer
  // uh_live_xxx` example the scanner already treats as documentation all stay
  // readable, because none of them carry a real key body.
  /\bAIza[0-9A-Za-z_\-]{35}\b/g,
  /\buh_live_[A-Za-z0-9_\-]{16,}\b/g,
]);

/**
 * Redacts secret-shaped values while preserving the surrounding description.
 *
 * Returns `[REDACTED]` in place of the value rather than dropping the whole
 * record: "the Mongo URI credential in `CONFLICTS.md` #1 was rotated" is a
 * durable, useful fact, and it stays useful with the value removed.
 */
export function redactSecrets(text) {
  if (typeof text !== 'string' || text.length === 0) return '';
  let out = text;
  for (const shape of SECRET_SHAPES) {
    shape.lastIndex = 0;
    out = out.replace(shape, (match, capture) => {
      // Already-redacted text must survive another pass unchanged. `[` is a
      // legal character inside the key=value value class, so a second pass
      // would otherwise match the marker this function inserted and eat one more
      // character each time: `apiKey: "[REDACTED]"` became `apiKey: "A[REDACTED]`
      // and then `apiKey: "[REDACTED]`. Checking the matched text is deliberate
      // rather than tightening the value class, because excluding brackets would
      // stop `password=ab[cd]efghij` from being redacted at all.
      if (match.includes('[REDACTED]')) return match;
      // For patterns with a capture group the value is the captured tail;
      // otherwise redact the matched run itself.
      if (capture) return `${match.slice(0, match.length - capture.length)}[REDACTED]`;
      if (shape.source.includes('(mongodb')) {
        const at = match.lastIndexOf('@');
        return `${match.slice(0, match.indexOf(':') + 3)}[REDACTED]${match.slice(at)}`;
      }
      return '[REDACTED]';
    });
  }
  return out;
}

/**
 * True when the text contains something secret-shaped. Used by tests and guards.
 *
 * The redaction marker is removed before testing. Without that, `password=[REDACTED]`
 * still matches the credential pattern — the marker is ten characters with no
 * spaces — and correctly-redacted output reported itself as still secret, which
 * would train anyone reading the guard to ignore it.
 */
export function containsSecretShape(text) {
  if (typeof text !== 'string') return false;
  const withoutMarkers = text.split('[REDACTED]').join(' ');
  return SECRET_SHAPES.some((shape) => {
    shape.lastIndex = 0;
    return shape.test(withoutMarkers);
  });
}

/** Numeric rank of a precedence source. Lower wins. Unknown sources sort last. */
export function precedenceRank(source) {
  const idx = PRECEDENCE_ORDER.indexOf(source);
  return idx === -1 ? PRECEDENCE_ORDER.length : idx;
}

/** True when `challenger` outranks `incumbent` on the precedence ladder. */
export function outranks(challenger, incumbent) {
  return precedenceRank(challenger) < precedenceRank(incumbent);
}

/** Normalises a raw status string to a known freshness value. */
export function resolveFreshness(raw) {
  if (typeof raw !== 'string') return FRESHNESS.UNKNOWN;
  const upper = raw.trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(FRESHNESS_WEIGHT, upper)
    ? upper
    : FRESHNESS.UNKNOWN;
}

/**
 * Parses the record blocks out of one memory markdown file.
 *
 * Records are `##`-delimited sections whose id encodes their category. Metadata is
 * read from bold labels (`**Status:**`) rather than a machine block, so the files
 * stay readable as prose — a memory format that only a parser can read is a memory
 * format no human will maintain.
 *
 * A section with no id is documentation prose (an index table, a heading for a
 * group) and is skipped rather than guessed at.
 */
export function parseRecords(text, { file = '', category = null } = {}) {
  if (typeof text !== 'string') return [];
  const meta = category ?? FILE_TO_CATEGORY[file] ?? null;
  const kind = meta?.kind ?? 'unknown';

  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = null;

  for (const line of lines) {
    const heading = /^##\s+(?!#)(.+)$/.exec(line);
    if (heading) {
      if (current) sections.push(current);
      current = { heading: heading[1].trim(), lines: [] };
      continue;
    }
    if (current) current.lines.push(line);
  }
  if (current) sections.push(current);

  const records = [];
  for (const section of sections) {
    const body = section.lines.join('\n');
    const idMatch = RECORD_ID.exec(section.heading);
    if (!idMatch) continue;

    const statusMatch = META_STATUS.exec(body);
    const dateMatch = META_DATE.exec(body);
    const sourceMatch = META_SOURCE.exec(body);

    const status = resolveFreshness(statusMatch?.[1]);
    const date = dateMatch?.[1] ?? null;

    // The metadata block is a header, not prose. Snippets are built from `prose`
    // so a result opens with the finding rather than with `**Date:** …`, which
    // would spend the snippet budget on fields the caller already has in the
    // structured fields beside it.
    //
    // Both blank lines and metadata labels are skipped, in any order: every
    // record in this layer puts a blank line between its heading and its
    // metadata, so skipping only labels stops on the blank and keeps the header.
    const lines = body.split(/\r?\n/);
    const isMetadata = (line) => /^\*\*[A-Za-z][A-Za-z ]*:\*\*/.test(line.trim());
    let first = 0;
    while (first < lines.length && (lines[first].trim() === '' || isMetadata(lines[first]))) {
      first += 1;
    }
    const prose = lines.slice(first).join('\n').trim();

    records.push({
      id: idMatch[1],
      title: section.heading.replace(RECORD_ID, '').replace(/^[\s—–-]+/, '').trim(),
      file,
      category: meta?.key ?? null,
      kind,
      status,
      date,
      source: sourceMatch?.[1]?.trim() ?? null,
      // A record with no date cannot be reasoned about for freshness. It is kept
      // and marked UNKNOWN rather than assumed recent — absence of evidence is
      // not evidence of recency.
      dateKnown: Boolean(date),
      body: body.trim(),
      prose,
      precedence: status === FRESHNESS.SUPERSEDED
        ? SOURCE_PRECEDENCE.HISTORICAL_ASSUMPTION
        : SOURCE_PRECEDENCE.MEMORY,
    });
  }
  return records;
}

/**
 * Loads every memory record from disk.
 *
 * `MEMORY_OVERVIEW.md` is excluded: it describes the layer rather than recording
 * anything, so its sections would otherwise be parsed as records with no ids.
 * Missing files are skipped rather than fatal — a partially populated memory
 * directory must still answer queries, because an absent record is honest.
 */
export function loadMemory({ dir = MEMORY_DIR } = {}) {
  if (!existsSync(dir)) return [];
  const records = [];
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    return [];
  }
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    if (file === 'MEMORY_OVERVIEW.md') continue;
    let text;
    try {
      text = readFileSync(join(dir, file), 'utf8');
    } catch {
      continue;
    }
    records.push(...parseRecords(text, { file }));
  }
  return records;
}

/**
 * Total ordering over records: freshness, then precedence, then recency.
 *
 * Freshness dominates precedence deliberately. A memory record that has been
 * superseded should not outrank a live one just because it is drawn from a strong
 * source — that is the exact inversion that would let a corrected belief return.
 */
export function compareRecords(a, b) {
  const freshness = FRESHNESS_WEIGHT[a.status] - FRESHNESS_WEIGHT[b.status];
  if (freshness !== 0) return freshness;

  const precedence = precedenceRank(a.precedence) - precedenceRank(b.precedence);
  if (precedence !== 0) return precedence;

  const aDate = a.date ?? '';
  const bDate = b.date ?? '';
  if (aDate !== bDate) return aDate < bDate ? 1 : -1;

  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * Assigns a retrieval tier to a record against a query's evidence.
 *
 * Returns `null` when nothing matches. This is the module's most important
 * behaviour: a query with no supporting evidence returns **nothing**, because a
 * memory system that always produces an answer is worse than one that sometimes
 * declines — the fabricated answer will be trusted by the next session and never
 * re-derived (`memory/LIMITATIONS.md` LIM-006).
 *
 * Tiers are checked strongest-first and the first match wins, so a record that
 * matches both a named file and a bare token is reported at P0, not P5.
 */
export function retrievalPriority(record, evidence = {}) {
  // Matching runs against prose, not the raw body. The raw body starts with a
  // metadata block in which every record shares the same date and status
  // strings, so matching on it would let `2026-10-10` or `CURRENT` pull in every
  // record in the layer.
  const text = `${record.title} ${record.prose ?? record.body}`;
  const has = (values) =>
    Array.isArray(values) && values.some((v) => v && text.includes(v));

  if (has(evidence.files)) return { tier: RETRIEVAL_PRIORITY.P0, matched: evidence.files.filter((f) => text.includes(f)) };
  if (has(evidence.features)) return { tier: RETRIEVAL_PRIORITY.P1, matched: evidence.features.filter((f) => text.includes(f)) };
  if (has(evidence.routes)) return { tier: RETRIEVAL_PRIORITY.P2, matched: evidence.routes.filter((r) => text.includes(r)) };
  if (evidence.category && record.kind === evidence.category) {
    return { tier: RETRIEVAL_PRIORITY.P3, matched: [evidence.category] };
  }
  if (record.kind === 'decision' && has(evidence.subsystems)) {
    return { tier: RETRIEVAL_PRIORITY.P4, matched: evidence.subsystems.filter((s) => text.includes(s)) };
  }
  // P5 applies to every kind, not only lessons and limitations.
  //
  // Restricting the floor tier to two categories was a real defect found by
  // running the tool: a query naming no path, feature or route — "CORS origin
  // callback allows every origin" — could not reach the record that documents
  // the CORS fix, because the fix kind was unreachable below P4. A memory layer
  // that cannot answer "has this problem happened here before?" from the problem's
  // own vocabulary is not answering the question it exists for.
  const tokens = (evidence.tokens ?? []).filter((t) => t.length > 3);
  const lowerText = text.toLowerCase();
  const title = record.title.toLowerCase();
  const matchedTokens = tokens.filter((t) => lowerText.includes(t.toLowerCase()));
  if (matchedTokens.length > 0) {
    // Among matched tokens, prefer one that appears in the record's *title*.
    //
    // A body match on a generic term is weak: in the query "CORS origin
    // callback allows every origin", three records contain the word "origin" and
    // only one is about CORS. The record titled "CORS allowlist was decorative"
    // is the answer, and the title is what says so.
    const best =
      matchedTokens.find((t) => title.includes(t.toLowerCase())) ??
      [...matchedTokens].sort((a, b) => b.length - a.length)[0];
    return {
      tier: RETRIEVAL_PRIORITY.P5,
      matched: [best],
      matchedTokens,
      // Surfaced so the sorter can prefer a title match over a body match.
      // Freshness must not decide this: a brand-new record about configuration
      // conflicts outranks the older, correct CORS fix purely by date.
      titleMatch: title.includes(best.toLowerCase()),
    };
  }
  return null;
}

/**
 * Ranks records for a query and returns a bounded, redacted result set.
 *
 * `evidence` is supplied by the caller (the query CLI derives it from the index)
 * so this module stays pure and unit-testable without loading the whole codebase
 * map. Callers that pass no evidence get an empty result — not every record.
 */
export function retrieve({ records = [], evidence = {}, maxResults = MEMORY_POLICY.maxResults } = {}) {
  const scored = [];
  // A record id is unique by construction, but "by construction" is a comment, not
  // a constraint. Two category files that both claim `KF-001` would otherwise be
  // rendered twice — and a duplicated memory record is worse than a missing one,
  // because it makes one past event look like two and inflates every count a
  // reader takes from the report. The first occurrence wins; later ones are
  // dropped rather than merged, because silently blending two records into one
  // would invent a record that was never written.
  const seenIds = new Set();
  for (const record of records) {
    if (record?.id) {
      if (seenIds.has(record.id)) continue;
      seenIds.add(record.id);
    }
    const hit = retrievalPriority(record, evidence);
    if (!hit) continue;
    scored.push({
      id: record.id,
      title: redactSecrets(record.title),
      file: record.file,
      category: record.category,
      kind: record.kind,
      status: record.status,
      date: record.date,
      tier: hit.tier,
      tierMeaning: PRIORITY_MEANING[hit.tier],
      // The evidence is carried through so a caller can justify the rank rather
      // than assert it. `matchedTokens` is the full token-level overlap, which is
      // what makes a P5 rank auditable: a reader can see that "cors" matched the
      // title and "origin" only matched the body.
      matched: hit.matched,
      matchedTokens: hit.matchedTokens ?? null,
      snippet: snippet(redactSecrets(record.prose ?? record.body), MEMORY_POLICY.maxSnippetChars),
      _statusWeight: FRESHNESS_WEIGHT[record.status],
      _order: PRIORITY_ORDER.indexOf(hit.tier),
      // A title match is stronger evidence than a body match at the same tier,
      // so it sorts first. This is deliberately ranked *above* freshness within a
      // tier: at equal tier the question is "which record is actually about
      // this", and a freshly-written record about a different subject is not.
      _strength: hit.titleMatch ? 1 : 0,
    });
  }

  scored.sort((a, b) => {
    const tier = a._order - b._order;
    if (tier !== 0) return tier;
    const strength = b._strength - a._strength;
    if (strength !== 0) return strength;
    const freshness = a._statusWeight - b._statusWeight;
    if (freshness !== 0) return freshness;
    return compareRecords(a, b);
  });

  // Per-file cap, so one verbose history file cannot crowd out the decision and
  // lesson records that are the reason the layer exists.
  const perFile = new Map();
  const limited = [];
  for (const item of scored) {
    const count = perFile.get(item.file) ?? 0;
    if (count >= MEMORY_POLICY.maxPerFile) continue;
    perFile.set(item.file, count + 1);
    limited.push(item);
  }

  return limited
    .slice(0, maxResults)
    .map(({ _statusWeight, _order, _strength, ...rest }) => rest);
}

/** First `max` characters of a body, collapsed to single lines. */
export function snippet(text, max = MEMORY_POLICY.maxSnippetChars) {
  if (typeof text !== 'string') return '';
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

/**
 * Classifies a claim against the current repository, producing a supersession
 * decision rather than a verdict.
 *
 * The reason this exists: Phase 1 recorded 30 findings whose summary line claims
 * nothing has been fixed, and several are now fixed. The correct output is not
 * "rewrite the file". It is "mark these superseded, keep the originals, and record
 * what superseded them".
 */
export function supersede(records, { supersededIds = [], supersededBy = '', reason = '' } = {}) {
  const ids = new Set(supersededIds);
  if (ids.size === 0) return { records, changed: [] };

  const changed = [];
  const next = records.map((record) => {
    if (!ids.has(record.id)) return record;
    changed.push(record.id);
    return {
      ...record,
      status: FRESHNESS.SUPERSEDED,
      supersededBy,
      supersedeReason: reason,
      precedence: SOURCE_PRECEDENCE.HISTORICAL_ASSUMPTION,
    };
  });
  return { records: next, changed };
}

/**
 * True when any record is `SUPERSEDED`, so a caller can surface that a belief
 * changed rather than letting the corrected answer appear without provenance.
 */
export function hasSuperseded(records) {
  return records.some((r) => r.status === FRESHNESS.SUPERSEDED);
}