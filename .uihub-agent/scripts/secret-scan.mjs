#!/usr/bin/env node
/**
 * Repository secret scanner — Phase 6, tasks 6.6 / 6.7 / 6.8.
 *
 * WHAT THIS SCANS
 * ---------------
 * The set of files git could commit: tracked files plus untracked files that
 * are not ignored (`git ls-files --cached --others --exclude-standard`).
 *
 * That scope matters. An earlier draft walked the filesystem and reported
 * `backend/.env` and `backend/service-account.json` as leaks. Both are
 * correctly gitignored local files containing real local credentials — the
 * working tree is expected to contain them. A leak is a secret that is
 * *committed or about to be committed*, not a secret sitting on a developer
 * machine. Scanning the filesystem reports the developer's own machine at them.
 *
 * WHAT THIS CANNOT DO (known limitations, per task 6.6)
 * ---------------------------------------------------
 * Pattern matching cannot prove every arbitrary secret is detectable. These are
 * known gaps, stated rather than hidden:
 *
 *   1. Encoded or split secrets (`mongodb+srv://` split across lines, base64
 *      inside another string) are not detected.
 *   2. Secrets with no recognisable prefix or format are not detected.
 *   3. Entropy analysis is deliberately absent. It produces more false
 *      positives than it prevents leaks on a repo containing .glb models,
 *      hashed asset filenames and generated code.
 *   4. Only the working tree is scanned, not full history. A secret that was
 *      committed and later deleted is invisible here.
 *   5. The 40-char AWS-secret rule is context-anchored and therefore misses a
 *      bare secret with no adjacent keyword.
 *
 * FALSE POSITIVES (task 6.7)
 * -------------------------
 * `backend/.env.example` is full of placeholder-shaped values that are not
 * secrets, and Phase 5 established that "looks like a placeholder" is not a
 * reliable signal — the real MongoDB password that was found was itself
 * placeholder-shaped. So placeholders are classified by explicit rules, not by
 * pattern shape alone, and a documented allowlist is used for known-safe
 * values.
 *
 * OUTPUT (task 6.8)
 * -----------------
 * file | line | detector | type | redacted fingerprint. Never the value.
 */

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const SELF = '.uihub-agent/scripts/secret-scan.mjs';

/**
 * Files whose contents are known-safe and would otherwise dominate output.
 * Each entry states why. Keep this list short and justified.
 */
const ALLOWLIST = new Map([
  ['backend/src/config/secrets.js', 'JWT_SECRET defaults and env var names, not credentials'],
  ['frontend/src/routing/vercelRouting.test.ts', 'route fixtures'],
]);

const CONFIG_EXT = /\.(ya?ml|json|env|txt|ini|toml|cfg)$/i;
const ENV_FILE = /(^|[/\\])\.env(\..+)?$/i;

/**
 * placeholder-only values, matched against the SECRET VALUE alone.
 */
const PLACEHOLDER_VALUE =
  /^(?:x{3,}|\*{3,}|\.{3,}|-{3,}|_{3,}|your[-_]?\w*|my[-_]?\w*|change[-_]?me|changeme|replace[-_]?me|todo|tbd|placeholder|example|sample|dummy|test|fake|some[-_]?\w+|foo|bar|baz|none|null|undefined|true|false|1234567890|12345678|abcdefghij|secret|password|passwd)$/i;

const ANGLE_PLACEHOLDER = /^<[^>]*>$/;
const INTERPOLATION = /\$\{|\{\{|\$[A-Z_]+|process\.env|%[A-Z_]+%|<%|%\}/;

/**
 * Detectors. `valueGroup` is the capture index holding the secret itself;
 * the rest of the match is context. This lets placeholder rules run against the
 * credential alone rather than against surrounding prose.
 */
const DETECTORS = [
  {
    id: 'mongodb-uri',
    type: 'MongoDB connection string',
    re: /mongodb(?:\+srv)?:\/\/([^\s:/@"']+):([^\s@"'/]+)@[^\s"'<>]+/gi,
    groups: [2],
    lineLevel: false,
  },
  {
    id: 'aws-access-key-id',
    type: 'AWS Access Key ID',
    re: /\bAKIA[0-9A-Z]{16}\b/g,
    groups: [0],
    lineLevel: false,
  },
  {
    id: 'aws-secret-access-key',
    type: 'AWS Secret Access Key',
    // Context-anchored: only fires on a line that mentions the AWS keyword,
    // otherwise every base64-ish token in the repo matches.
    lineContext: /aws.{0,24}secret|secret.{0,12}aws|AWS_SECRET/i,
    re: /["'=\s:]([A-Za-z0-9/+=]{40})(?=["'\s,}]|$)/g,
    groups: [1],
    lineLevel: true,
  },
  {
    id: 'private-key',
    type: 'PEM private key',
    // A real key: header AND footer, with the base64 body between them.
    re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/g,
    groups: [0],
    lineLevel: false,
  },
  {
    id: 'private-key-header',
    type: 'PEM private key header',
    // A header with no key body is a truncated documentation example, e.g.
    //   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
    // which appears in README.md and MCP.md. Treating the bare header as a
    // secret would be a false positive; treating it as "not a key at all"
    // would hide a truncated paste. It is classified as an explicit
    // PLACEHOLDER so it is visible but never fails CI.
    re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/g,
    groups: [0],
    lineLevel: false,
    refine: () => 'PLACEHOLDER',
  },
  {
    id: 'firebase-service-account',
    type: 'Firebase service account private key',
    re: /"private_key(_id)?"\s*:\s*"(-----BEGIN[^"]+)"/g,
    groups: [2],
    lineLevel: false,
  },
  {
    id: 'razorpay-key',
    type: 'Razorpay API secret',
    re: /\brzp_(live|test)_([A-Za-z0-9]{16,})\b/g,
    groups: [0],
    lineLevel: false,
  },
  {
    id: 'github-token',
    type: 'GitHub token',
    re: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g,
    groups: [0],
    lineLevel: false,
  },
  {
    id: 'slack-token',
    type: 'Slack token',
    re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
    groups: [0],
    lineLevel: false,
  },
  {
    id: 'stripe-webhook-secret',
    type: 'Stripe webhook secret',
    re: /\bwhsec_[A-Za-z0-9]{16,}\b/g,
    groups: [0],
    lineLevel: false,
  },
  {
    id: 'google-api-key',
    type: 'Google API key',
    re: /\bAIza[0-9A-Za-z_\-]{35}\b/g,
    groups: [0],
    lineLevel: false,
    // Firebase *web client* config (`apiKey` in a frontend firebaseConfig
    // object) is not a secret. It is a project identifier; Firebase restricts
    // use via Security Rules and authorized domains, and the value is
    // deliberately shipped to every browser. `frontend/src/main.tsx` holds one
    // as a fallback config and it must stay visible, so flagging it as a leak
    // would train everyone to ignore this detector.
    //
    // The same prefix under backend/ or mcp-server/ is NOT excused and stays a
    // REAL_SECRET, because server-side `AIza` keys are not required for the web
    // SDK and would be an actual exposure.
    refine: (verdict, { path }) =>
      verdict === 'REAL_SECRET' && /^(?:frontend|apps?|web)\//.test(path.replace(/\\/g, '/'))
        ? 'PUBLIC_IDENTIFIER'
        : verdict,
  },
  {
    id: 'sendgrid-key',
    type: 'SendGrid API key',
    re: /\bSG\.[A-Za-z0-9_\-]{16,}\.[A-Za-z0-9_\-]{16,}\b/g,
    groups: [0],
    lineLevel: false,
  },
  {
    id: 'bearer-token',
    type: 'Bearer token',
    // Requires an actual token shape. `Bearer <token>`, `Bearer $VAR` and
    // `Bearer uh_live_xxx` are documentation, not credentials.
    re: /\bBearer\s+([A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{8,}(?:\.[A-Za-z0-9_-]{8,})?)\b/g,
    groups: [1],
    lineLevel: false,
  },
  {
    id: 'smtp-credential',
    type: 'SMTP credential',
    // Configuration files only. The first draft matched `smtpTransport({ ... })`
    // in application code and reported six nonsense findings.
    files: (p) => CONFIG_EXT.test(p) || ENV_FILE.test(p),
    re: /^\s*(?:export\s+)?[A-Z0-9_]*(?:SMTP|MAIL|EMAIL)[A-Z0-9_]*?(?:PASS|PASSWORD|SECRET)[A-Z0-9_]*\s*[:=]\s*["']?([^"'\s#]+)/gim,
    groups: [1],
    lineLevel: true,
  },
  {
    id: 'vapid-private-key',
    type: 'VAPID private key',
    files: (p) => CONFIG_EXT.test(p) || ENV_FILE.test(p),
    re: /^\s*(?:export\s+)?(?:VAPID_PRIVATE_KEY|PUBLIC_VAPID_KEY)\s*[:=]\s*["']?([A-Za-z0-9_-]{40,})/gim,
    groups: [1],
    lineLevel: true,
  },
];

/**
 * Classification for task 6.7. Returns one of:
 * REAL_SECRET | PLACEHOLDER | MASKED | PUBLIC_IDENTIFIER | TEST_FIXTURE | FALSE_POSITIVE
 */
function classify(value, { path, line, fullLine }) {
  const v = value.trim();

  if (!v) return 'FALSE_POSITIVE';
  // <password>, <your-token-here>
  if (ANGLE_PLACEHOLDER.test(v)) return 'PLACEHOLDER';
  // process.env.X, ${VAR}, $VAR, {{ var }}
  if (INTERPOLATION.test(v)) return 'PLACEHOLDER';
  // xxxxx, ***, ..., your-api-key
  if (PLACEHOLDER_VALUE.test(v)) return 'PLACEHOLDER';
  // A value that is mostly one repeated character is a mask, not a key.
  if (/^(.)\1{7,}$/.test(v)) return 'MASKED';
  // Truncation and redaction markers inside a credential — the ellipsis in
  // `uihub_backend:<ellipsis>@cluster0.rynecsh.mongodb.net`, or `[REDACTED]`.
  // These are *disclosures about* a secret, not the secret. Phase 6 hit this:
  // documenting a redacted historical URI in DO_NOT_CHANGE.md was reported as
  // REAL_SECRET with len:1, which is both wrong and a reason to delete correct
  // documentation.
  //
  // Kept as narrow as possible, because a false negative here is a missed leak.
  // A single ASCII dot is NOT enough — JWTs contain dots and would be suppressed.
  // Only a true ellipsis character (…, …, ⋯) or a run of three or more
  // consecutive dots qualifies.
  if (/[\u2025\u2026\u22ef\u2800]/.test(v) || /\.{3,}/.test(v)) return 'MASKED';
  if (/^\[[^\]]*(?:REDACT|REMOVED|WITHHELD|SEE OD-\d+)[^\]]*\]$/i.test(v)) return 'MASKED';
  // example.com / example.test reserved domains (RFC 2606)
  if (/@(?:example\.(?:com|org|net)|example|test|localhost|invalid)\b/i.test(v)) return 'PLACEHOLDER';
  // Known documentation hosts are never credentials.
  if (/(?:^|\/\/)(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::|\/|$)/.test(fullLine)) return 'TEST_FIXTURE';

  // Only *test* files may hold fixture credentials; the same value in
  // application code is a real finding.
  if (/(?:^|[/\\])(?:tests?|__tests__|fixtures?)[/\\]/.test(path)) return 'TEST_FIXTURE';
  if (/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path)) return 'TEST_FIXTURE';

  // A line that says so is documentation.
  if (/\b(?:example|sample|placeholder|redacted|masked|not\s+a\s+(?:real\s+)?secret)\b/i.test(fullLine)) {
    return 'FALSE_POSITIVE';
  }

  return 'REAL_SECRET';
}

function fingerprint(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 12);
}

/** Files git would actually commit. */
function gitVisibleFiles() {
  try {
    const out = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    return out.split('\n').filter(Boolean);
  } catch {
    return null;
  }
}

const BINARY_EXT =
  /\.(png|jpe?g|gif|webp|ico|bmp|avif|glb|gltf|fbx|obj|blend|pdf|zip|tar|gz|bz2|xz|7z|rar|mp3|mp4|wav|ogg|webm|woff2?|ttf|otf|eot|so|dll|exe|class|jar|pyc|node|wasm)$/i;

/**
 * Scan in-memory text with the same detectors used for files.
 *
 * Exported (task 7.29) so the Phase 7 indexer can prove a generated artifact is
 * credential-free BEFORE it is written to disk, rather than scanning it
 * afterwards and deleting it. Behaviour of the CLI is unchanged: scanFile is
 * now a thin wrapper around this.
 */
export function scanText(text, relPath) {
  if (relPath === SELF) return [];
  if (BINARY_EXT.test(relPath)) return [];
  if (ALLOWLIST.has(relPath)) return [];

  const lines = text.split(/\r?\n/);
  const results = [];

  for (const det of DETECTORS) {
    if (det.files && !det.files(relPath)) continue;
    det.re.lastIndex = 0;
    let m;
    while ((m = det.re.exec(text)) !== null) {
      const value = det.groups.map((g) => m[g] ?? '').join('');
      if (!value) continue;

      // line number from match offset
      let line = 1;
      for (let i = 0; i < m.index; i++) if (text.charCodeAt(i) === 10) line++;
      const fullLine = lines[line - 1] ?? '';

      if (det.lineContext && !det.lineContext.test(fullLine)) continue;

      let verdict = classify(value, { path: relPath, line, fullLine });
      if (det.refine) verdict = det.refine(verdict, { path: relPath, line, fullLine, value });
      results.push({
        verdict,
        detector: det.id,
        type: det.type,
        path: relPath,
        line,
        fingerprint: fingerprint(value),
        length: value.length,
      });
    }
  }
  return results;
}

async function scanFile(relPath) {
  if (relPath === SELF) return []; // a scanner necessarily contains its own patterns
  if (BINARY_EXT.test(relPath)) return [];
  if (ALLOWLIST.has(relPath)) return [];

  let buf;
  try {
    buf = await readFile(`${ROOT}/${relPath}`);
  } catch {
    return [];
  }
  // Binary content: NUL byte in the first 8 KiB.
  const probe = buf.subarray(0, 8192);
  if (probe.includes(0)) return [];

  const text = buf.toString('utf8');
  if (text.includes('\uFFFD') && buf.length > 0) {
    // high ratio of replacement chars => not really text
    const bad = (text.match(/\uFFFD/g) || []).length;
    if (bad / Math.max(text.length, 1) > 0.05) return [];
  }

  return scanText(text, relPath);
}

const ORDER = {
  REAL_SECRET: 0,
  PLACEHOLDER: 1,
  MASKED: 2,
  PUBLIC_IDENTIFIER: 3,
  TEST_FIXTURE: 4,
  FALSE_POSITIVE: 5,
};

async function main() {
  const args = process.argv.slice(2);
  const showAll = args.includes('--all');
  const json = args.includes('--json');

  const files = gitVisibleFiles();
  const scope =
    files === null
      ? { label: 'filesystem walk (git unavailable)', list: null }
      : { label: 'git-visible files', list: files };

  let findings = [];
  if (files === null) {
    process.stderr.write('secret-scan: git unavailable, refusing to guess scope\n');
    process.exit(3);
  }
  for (const f of files) findings.push(...(await scanFile(f)));

  findings.sort(
    (a, b) =>
      ORDER[a.verdict] - ORDER[b.verdict] ||
      a.path.localeCompare(b.path) ||
      a.line - b.line,
  );

  const real = findings.filter((f) => f.verdict === 'REAL_SECRET');
  const byVerdict = findings.reduce((acc, f) => {
    acc[f.verdict] = (acc[f.verdict] || 0) + 1;
    return acc;
  }, {});

  if (json) {
    console.log(JSON.stringify({ scope: scope.label, files: files.length, byVerdict, findings }, null, 2));
  } else {
    for (const f of findings) {
      if (!showAll && f.verdict !== 'REAL_SECRET') continue;
      console.log(
        `${f.verdict}\t${f.path}:${f.line}\t${f.detector}\t${f.type}\tfp:${f.fingerprint}\tlen:${f.length}`,
      );
    }
    const summary = Object.entries(byVerdict)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ');
    console.log(
      `[secret-scan] scope=${scope.label} scanned=${files.length} ${summary || 'no findings'}`,
    );
  }

  process.exit(real.length > 0 ? 2 : 0);
}

// Only run the CLI when executed directly. When imported for `scanText` (the
// Phase 7 indexer), importing must not trigger a full-repo scan and a
// `process.exit` that would kill the importer.
const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (invokedDirectly) {
  main().catch((e) => {
    console.error('secret-scan failed:', e.message);
    process.exit(1);
  });
}