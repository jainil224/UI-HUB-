import { getCollection } from './mongo.js';
import {
  classifyFailure,
  computeFingerprint,
  humanCategory,
  severityForCategory,
  shortErrorSummary,
  type FailureCategory,
  type FailureSeverity,
} from './failureClassifier.js';
import { normalizeQuery, redactText, sanitizeText, sanitizeUrl } from './redaction.js';

export const DIAGNOSTICS_COLLECTION = 'mcp_diagnostics';

export type ResolutionStatus = 'open' | 'investigating' | 'resolved';

export interface DiagnosticSample {
  at: number;
  correlationId?: string;
  method?: string;
  tool?: string;
  status?: number;
  errorCode?: string;
  latencyMs?: number;
  query?: string;
  url?: string;
}

export interface DiagnosticRecord {
  id: string;
  fingerprint: string;
  category: FailureCategory;
  severity: FailureSeverity;
  title: string;
  tool?: string;
  method?: string;
  resourceType?: string;
  resourceId?: string;
  query?: string;
  url?: string;
  statusCode?: number;
  errorCode?: string;
  errorSummary: string;
  clientName?: string;
  userId?: string;
  apiKeyId?: string;
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
  resolution: ResolutionStatus;
  notes?: string;
  sampleEvents: DiagnosticSample[];
}

export interface FailureInput {
  errorCode?: string;
  message?: string;
  explicitCategory?: FailureCategory;
  zeroResults?: boolean;
  tool?: string;
  method?: string;
  resourceType?: string;
  resourceId?: string;
  query?: string;
  url?: string;
  statusCode?: number;
  clientName?: string;
  userId?: string;
  apiKeyId?: string;
  correlationId?: string;
  latencyMs?: number;
}

function titleFor(category: FailureCategory, tool?: string, resourceType?: string): string {
  const label = humanCategory(category);
  if (tool) return `${label} — ${tool}`;
  if (resourceType) return `${label} — ${resourceType}`;
  return label;
}

/**
 * Aggregate a single failure occurrence into its stable diagnostic group.
 * Occurs-upsert by fingerprint; keeps the last 20 compact sample events.
 */
export async function recordFailure(input: FailureInput): Promise<{ fingerprint: string; id: string } | null> {
  let category = classifyFailure({
    errorCode: input.errorCode,
    message: input.message,
    explicit: input.explicitCategory,
    zeroResults: input.zeroResults,
  });

  // A URL is only a URL diagnostic if it failed format validation.
  let sanitizedUrl: string | undefined;
  if (input.url) {
    const safe = sanitizeUrl(input.url);
    sanitizedUrl = safe.sanitized;
    if (!safe.valid && (category === 'invalid_url' || !input.errorCode)) {
      category = 'invalid_url';
    }
  }

  const errorSignature = shortErrorSummary(input.message, input.errorCode);
  const fingerprint = computeFingerprint({
    category,
    tool: input.tool,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    errorSignature,
  });

  const now = Date.now();
  const sample: DiagnosticSample = {
    at: now,
    correlationId: input.correlationId,
    method: input.method,
    tool: input.tool,
    status: input.statusCode,
    errorCode: input.errorCode,
    latencyMs: input.latencyMs,
    query: input.query ? normalizeQuery(input.query) : undefined,
    url: sanitizedUrl,
  };

  const severity = severityForCategory(category);

  try {
    const col = await getCollection(DIAGNOSTICS_COLLECTION);
    const result = await col.findOneAndUpdate(
      { fingerprint },
      {
        $set: {
          category,
          severity,
          title: titleFor(category, input.tool, input.resourceType),
          tool: input.tool,
          method: input.method,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          query: input.query ? normalizeQuery(input.query) : undefined,
          url: sanitizedUrl,
          statusCode: input.statusCode,
          errorCode: input.errorCode,
          errorSummary: errorSignature,
          clientName: input.clientName,
          userId: input.userId,
          apiKeyId: input.apiKeyId,
          lastSeen: now,
        },
        $setOnInsert: {
          firstSeen: now,
          resolution: 'open' as ResolutionStatus,
          notes: '',
        },
        $inc: { occurrences: 1 },
        $push: { sampleEvents: { $each: [sample], $slice: -20 } },
      } as any,
      { upsert: true, returnDocument: 'after' },
    );
    const doc: any = (result as any)?.value ?? result;
    return { fingerprint, id: doc?._id ? String(doc._id) : fingerprint };
  } catch (error: any) {
    console.error('[Diagnostics] recordFailure failed:', redactText(error?.message || error));
    return null;
  }
}

function toRecord(doc: any): DiagnosticRecord {
  const { _id, ...rest } = doc || {};
  return { id: String(_id), ...rest } as DiagnosticRecord;
}

export interface DiagnosticsQuery {
  category?: string;
  severity?: string;
  resolution?: string;
  resolutionState?: 'resolved' | 'unresolved';
  tool?: string;
  resourceType?: string;
  fingerprint?: string;
  fromTs?: number;
  toTs?: number;
  page?: number;
  pageSize?: number;
}

export async function queryDiagnostics(q: DiagnosticsQuery): Promise<{
  total: number;
  page: number;
  pageSize: number;
  items: DiagnosticRecord[];
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
}> {
  const page = Math.max(1, q.page || 1);
  const pageSize = Math.min(200, Math.max(1, q.pageSize || 25));
  const emptyAgg = { byCategory: {} as Record<string, number>, bySeverity: {} as Record<string, number> };
  try {
    const col = await getCollection(DIAGNOSTICS_COLLECTION);
    const filter: Record<string, any> = {};
    if (q.category) filter.category = q.category;
    if (q.severity) filter.severity = q.severity;
    if (q.resolution) filter.resolution = q.resolution;
    if (q.resolutionState === 'resolved') filter.resolution = 'resolved';
    if (q.resolutionState === 'unresolved') filter.resolution = { $ne: 'resolved' };
    if (q.tool) filter.tool = q.tool;
    if (q.resourceType) filter.resourceType = q.resourceType;
    if (q.fingerprint) filter.fingerprint = q.fingerprint;
    if (q.fromTs || q.toTs) {
      filter.lastSeen = {};
      if (q.fromTs) filter.lastSeen.$gte = q.fromTs;
      if (q.toTs) filter.lastSeen.$lte = q.toTs;
    }

    const total = await col.countDocuments(filter);
    const docs = await col
      .find(filter)
      .sort({ lastSeen: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const categoryDocs = await col.find(filter).project({ category: 1, severity: 1 }).limit(5000).toArray();
    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    for (const d of categoryDocs) {
      const c = (d as any).category || 'unknown';
      byCategory[c] = (byCategory[c] || 0) + 1;
      const s = (d as any).severity || 'warning';
      bySeverity[s] = (bySeverity[s] || 0) + 1;
    }

    return { total, page, pageSize, items: docs.map(toRecord), byCategory, bySeverity };
  } catch (error: any) {
    console.error('[Diagnostics] queryDiagnostics failed:', redactText(error?.message || error));
    return { total: 0, page, pageSize, items: [], ...emptyAgg };
  }
}

export async function getDiagnostic(idOrFingerprint: string): Promise<DiagnosticRecord | null> {
  try {
    const col = await getCollection(DIAGNOSTICS_COLLECTION);
    const { ObjectId } = await import('mongodb');
    if (ObjectId.isValid(idOrFingerprint) && idOrFingerprint.length === 24) {
      const doc = await col.findOne({ _id: new ObjectId(idOrFingerprint) as any });
      if (doc) return toRecord(doc);
    }
    const byFp = await col.findOne({ fingerprint: idOrFingerprint });
    return byFp ? toRecord(byFp) : null;
  } catch (error: any) {
    console.error('[Diagnostics] getDiagnostic failed:', redactText(error?.message || error));
    return null;
  }
}

export async function updateDiagnosticStatus(
  idOrFingerprint: string,
  status: string,
  meta: { notes?: string } = {},
): Promise<DiagnosticRecord | null> {
  const valid = ['open', 'investigating', 'resolved', 'reopened'];
  if (!valid.includes(status)) throw new Error('invalid_status');
  const resolution: ResolutionStatus = status === 'reopened' ? 'open' : (status as ResolutionStatus);

  const col = await getCollection(DIAGNOSTICS_COLLECTION);
  const existing = await getDiagnostic(idOrFingerprint);
  if (!existing) return null;

  const set: Record<string, unknown> = { resolution, updatedAt: Date.now() };
  if (meta.notes !== undefined) set.notes = sanitizeText(meta.notes, 1000);
  if (status === 'resolved') set.resolvedAt = Date.now();
  if (status === 'reopened') set.reopenedAt = Date.now();
  if (status === 'investigating') set.investigatingAt = Date.now();

  await col.updateOne({ fingerprint: existing.fingerprint }, { $set: set });
  return getDiagnostic(existing.fingerprint);
}

/**
 * Deterministic, copyable fix-prompt generator. No external AI API is used; the
 * prompt is built entirely from the stored diagnostic record, with secrets
 * already redacted at persistence time.
 */
export function buildFixPrompt(diag: DiagnosticRecord): string {
  const first = new Date(diag.firstSeen).toISOString();
  const last = new Date(diag.lastSeen).toISOString();
  const samples = (diag.sampleEvents || [])
    .slice(-5)
    .map((s) => `  - ${new Date(s.at).toISOString()} | method=${s.method || '-'} | tool=${s.tool || '-'} | status=${s.status ?? '-'} | error=${s.errorCode || '-'}${s.latencyMs != null ? ` | ${s.latencyMs}ms` : ''}`)
    .join('\n');

  const acceptance: string[] = [];
  switch (diag.category) {
    case 'not_found':
      acceptance.push('- The missing resource resolves correctly, or returns a clear, documented not-found result.');
      break;
    case 'code_retrieval_failed':
      acceptance.push('- Source code retrieval succeeds for the affected resource, or returns an explicit unavailable status.');
      break;
    case 'zero_results':
      acceptance.push('- The query either returns relevant results or the catalog/tags are updated so the intent matches an existing resource.');
      break;
    case 'invalid_url':
    case 'external_http_failed':
      acceptance.push('- The resource link is valid, absolute, and reachable (or removed/flagged if obsolete).');
      break;
    case 'validation_error':
      acceptance.push('- Invalid inputs are rejected with an actionable message and never reach the backend.');
      break;
    case 'db_error':
      acceptance.push('- The database operation succeeds and connectivity errors are surfaced safely.');
      break;
    case 'timeout':
      acceptance.push('- The operation completes within the latency budget or fails fast with a clear timeout.');
      break;
    default:
      acceptance.push('- The root cause is fixed and the failure no longer reproduces.');
  }
  acceptance.push('- A regression test reproduces the original failure and now passes.');
  acceptance.push('- No existing MCP admin, dashboard, or tool feature regresses.');

  return `# Investigate and Fix UI HUB MCP Failure

## Issue
${diag.title}
Fingerprint: \`${diag.fingerprint}\`
Category: ${diag.category} · Severity: ${diag.severity}

## Observed behavior
${diag.errorSummary || 'A failure was recorded for this fingerprint.'}

## Expected behavior
The affected MCP operation should complete successfully and return the expected result.

## Evidence
- MCP method: ${diag.method || 'unknown'}
- Tool: ${diag.tool || 'unknown'}
- Resource type: ${diag.resourceType || 'n/a'}
- Resource id: ${diag.resourceId || 'n/a'}
- Sanitized query: ${diag.query || 'n/a'}
- URL: ${diag.url || 'n/a'}
- Status/error code: ${diag.statusCode ?? 'n/a'} / ${diag.errorCode || 'n/a'}
- Occurrences: ${diag.occurrences}
- First seen: ${first}
- Last seen: ${last}
- Client: ${diag.clientName || 'Unknown MCP client'}
${samples ? `- Recent samples:\n${samples}` : ''}

## Investigation instructions
Inspect the existing repository and identify the root cause before changing code.
Do not assume the cause based on this diagnostic alone. Reproduce or test the failure first.
Note: the diagnostic store persists only redacted data; secrets were removed before storage.

## Requirements
- Preserve all existing MCP admin and website features and API compatibility.
- Do not expose credentials, tokens, or sensitive data.
- Make the smallest safe change; do not patch symptoms.
- Add a regression test that would have caught this failure.
- Do not deploy or mutate production automatically.

## Acceptance criteria
${acceptance.join('\n')}

## Final report
Report the root cause, files changed, tests run and their results, deployment steps, and any remaining risks.
`;
}

/** URL-only diagnostics helper used by link validation (format check, no fetch). */
export function validateResourceUrl(url: unknown): { valid: boolean; reason?: string; sanitized: string } {
  const safe = sanitizeUrl(url);
  return { valid: safe.valid, reason: safe.reason, sanitized: safe.sanitized };
}
