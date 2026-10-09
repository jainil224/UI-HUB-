import { createHash } from 'node:crypto';
import { sanitizeText } from './redaction.js';

/**
 * Canonical failure categories. A zero-result search is deliberately NOT a
 * server error — it is its own category so diagnostics never conflate the two.
 */
export type FailureCategory =
  | 'zero_results'
  | 'not_found'
  | 'backend_error'
  | 'code_retrieval_failed'
  | 'invalid_url'
  | 'external_http_failed'
  | 'tool_execution_error'
  | 'protocol_error'
  | 'validation_error'
  | 'auth_failure'
  | 'premium_denied'
  | 'rate_limit'
  | 'db_error'
  | 'timeout'
  | 'internal_error';

export type FailureSeverity = 'info' | 'warning' | 'critical';

export const FAILURE_CATEGORIES: FailureCategory[] = [
  'zero_results',
  'not_found',
  'backend_error',
  'code_retrieval_failed',
  'invalid_url',
  'external_http_failed',
  'tool_execution_error',
  'protocol_error',
  'validation_error',
  'auth_failure',
  'premium_denied',
  'rate_limit',
  'db_error',
  'timeout',
  'internal_error',
];

const SEVERITY_BY_CATEGORY: Record<FailureCategory, FailureSeverity> = {
  zero_results: 'info',
  not_found: 'warning',
  backend_error: 'critical',
  code_retrieval_failed: 'warning',
  invalid_url: 'info',
  external_http_failed: 'warning',
  tool_execution_error: 'warning',
  protocol_error: 'warning',
  validation_error: 'info',
  auth_failure: 'warning',
  premium_denied: 'info',
  rate_limit: 'info',
  db_error: 'critical',
  timeout: 'warning',
  internal_error: 'critical',
};

export function severityForCategory(category: FailureCategory): FailureSeverity {
  return SEVERITY_BY_CATEGORY[category] || 'warning';
}

export function humanCategory(category: FailureCategory): string {
  return category
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const TIMEOUT_PATTERN = /timed?\s*out|timeout|ETIMEDOUT|ESOCKETTIMEDOUT/i;
const DB_PATTERN = /MongoNetworkError|MongoServerError|MongoError|ECONNREFUSED.*27017|topology|connection.*(closed|refused)|database/i;
const LINK_PATTERN = /\b(invalid|malformed)\s+url\b|unsupported_protocol|unparseable/i;
const HTTP_PATTERN = /\bHTTP\s+[45]\d\d\b|ENOTFOUND|EAI_AGAIN|socket hang up|fetch failed|getaddrinfo/i;

export interface FailureInput {
  /** Known error code from a tool result (e.g. COMPONENT_NOT_FOUND). */
  errorCode?: string;
  /** Free-text error/exception message. */
  message?: string;
  /** Optional threshold classification hint from the caller. */
  explicit?: FailureCategory;
  /** For searches: whether the result set was empty. */
  zeroResults?: boolean;
}

/**
 * Deterministically classify a failure. Order matters: explicit caller hints and
 * well-known tool error codes win over heuristic message matching.
 */
export function classifyFailure(input: FailureInput): FailureCategory {
  if (input.explicit) return input.explicit;

  const code = String(input.errorCode || '').toUpperCase();
  const msg = String(input.message || '');

  if (code === 'VALIDATION_ERROR' || code === 'BAD_REQUEST') return 'validation_error';
  if (code === 'PREMIUM_ACCESS_REQUIRED' || code === 'FORBIDDEN' || code === 'AUTHORIZATION_DENIED') return 'premium_denied';
  if (code === 'UNAUTHORIZED' || code === 'AUTH_FAILURE' || code === 'MISSING_API_KEY' || code === 'INVALID_API_KEY') return 'auth_failure';
  if (code === 'RATE_LIMIT_EXCEEDED' || code === 'RATE_LIMIT') return 'rate_limit';
  if (/^-.?\d{4}$/.test(code) || code === 'PROTOCOL_ERROR' || code === 'METHOD_NOT_FOUND') return 'protocol_error';
  if (code === 'PROMPTS_NOT_FOUND' || code.endsWith('_NOT_FOUND') || code === 'NOT_FOUND') return 'not_found';
  if (code.startsWith('CODE_') || code === 'CODE_NOT_AVAILABLE') return 'code_retrieval_failed';
  if (code === 'TOOL_ERROR' || code === 'INTERNAL_ERROR') return 'tool_execution_error';

  if (msg) {
    if (TIMEOUT_PATTERN.test(msg)) return 'timeout';
    if (DB_PATTERN.test(msg)) return 'db_error';
    if (LINK_PATTERN.test(msg)) return 'invalid_url';
    if (HTTP_PATTERN.test(msg)) return 'external_http_failed';
  }

  if (input.zeroResults) return 'zero_results';
  return 'tool_execution_error';
}

/**
 * Stable fingerprint for grouping repeated failures. Normalizes the error
 * signature so that high-cardinality ids/timestamps do not fragment groups.
 */
export function computeFingerprint(parts: {
  category: FailureCategory;
  tool?: string;
  resourceType?: string;
  errorSignature?: string;
  resourceId?: string;
}): string {
  const signature = (parts.errorSignature || '')
    .toLowerCase()
    .replace(/\b[0-9a-f]{8,}\b/g, '<hex>')
    .replace(/\b\d{4,}\b/g, '<num>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  const stable = [
    parts.category,
    parts.tool || '',
    parts.resourceType || '',
    parts.resourceId ? 'rid' : '',
    signature,
  ].join('|');

  return createHash('sha1').update(stable).digest('hex').slice(0, 24);
}

export function shortErrorSummary(message?: string, errorCode?: string): string {
  const base = sanitizeText(message || errorCode || 'Unknown failure', 240);
  return base;
}
