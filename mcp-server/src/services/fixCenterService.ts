import { aggregateEvents, type McpEvent } from './analyticsService.js';

/**
 * Fix Center — real-data-only signal derivation.
 *
 * Turns live MCP analytics + runtime config into a de-duplicated list of
 * actionable problems, each paired with a deterministic, copyable fix prompt.
 * Returns an empty array when everything is healthy (no fake rows, ever).
 */

export type Severity = 'critical' | 'warning' | 'info';

export interface FixSignal {
  key: string;
  category: string;
  severity: Severity;
  title: string;
  summary: string;
  occurrences: number;
  lastSeen: number | null;
  evidence: Record<string, unknown>;
}

export interface FixConfigInput {
  authEnabled: boolean;
  analyticsEnabled: boolean;
  loggingEnabled: boolean;
  tools?: Record<string, boolean>;
}

function lastSeenOf(events: McpEvent[], eventType: string): number | null {
  let max = 0;
  for (const e of events) {
    if (e.event === eventType && e.timestamp > max) max = e.timestamp;
  }
  return max || null;
}

function topEntries(map: Map<string, number>, limit = 10): Array<{ key: string; count: number }> {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

/** Derive real problems from live analytics events and runtime configuration. */
export function deriveSignals(events: McpEvent[], config: FixConfigInput): FixSignal[] {
  const signals: FixSignal[] = [];
  const stats = aggregateEvents(events);

  if (stats.authFailures > 0) {
    const byErrorCode: Record<string, number> = {};
    const prefixes = new Map<string, number>();
    for (const e of events) {
      if (e.event !== 'auth_failure') continue;
      const code = e.errorCode || 'UNKNOWN';
      byErrorCode[code] = (byErrorCode[code] || 0) + 1;
      if (e.keyPrefix) prefixes.set(e.keyPrefix, (prefixes.get(e.keyPrefix) || 0) + 1);
    }
    signals.push({
      key: 'auth_failures',
      category: 'auth_failure',
      severity: 'warning',
      title: 'Authentication failures',
      summary: `${stats.authFailures} MCP request(s) failed authentication in the selected range.`,
      occurrences: stats.authFailures,
      lastSeen: lastSeenOf(events, 'auth_failure'),
      evidence: { byErrorCode, topKeyPrefixes: topEntries(prefixes) },
    });
  }

  if (stats.rateLimitEvents > 0) {
    const prefixes = new Map<string, number>();
    for (const e of events) {
      if (e.event !== 'rate_limit') continue;
      const k = e.keyPrefix || 'unknown';
      prefixes.set(k, (prefixes.get(k) || 0) + 1);
    }
    signals.push({
      key: 'rate_limit',
      category: 'rate_limit',
      severity: 'warning',
      title: 'Rate-limit events',
      summary: `${stats.rateLimitEvents} request(s) hit the rate limit in the selected range.`,
      occurrences: stats.rateLimitEvents,
      lastSeen: lastSeenOf(events, 'rate_limit'),
      evidence: { topKeyPrefixes: topEntries(prefixes) },
    });
  }

  if (stats.premiumDenied > 0) {
    const resources = new Map<string, number>();
    for (const e of events) {
      if (e.event !== 'premium_denied') continue;
      const k = e.componentId || e.tool || 'unknown';
      resources.set(k, (resources.get(k) || 0) + 1);
    }
    signals.push({
      key: 'premium_denied',
      category: 'premium_denied',
      severity: 'info',
      title: 'Premium access denied',
      summary: `${stats.premiumDenied} request(s) were denied premium resources in the selected range.`,
      occurrences: stats.premiumDenied,
      lastSeen: lastSeenOf(events, 'premium_denied'),
      evidence: { topResources: topEntries(resources) },
    });
  }

  const zeroTotal = stats.zeroResultSearches.reduce((sum, s) => sum + s.count, 0);
  if (zeroTotal > 0) {
    signals.push({
      key: 'zero_results',
      category: 'zero_results',
      severity: 'warning',
      title: 'Searches returning no results',
      summary: `${zeroTotal} search(es) returned zero results in the selected range.`,
      occurrences: zeroTotal,
      lastSeen: null,
      evidence: {
        topQueries: stats.zeroResultSearches.slice(0, 10).map((s) => ({ query: s.query, count: s.count })),
      },
    });
  }

  if (!config.authEnabled) {
    signals.push({
      key: 'config_auth_disabled',
      category: 'auth_failure',
      severity: 'critical',
      title: 'API-key authentication is disabled',
      summary: 'authEnabled=false — MCP requests are accepted without an API key.',
      occurrences: 1,
      lastSeen: null,
      evidence: { authEnabled: false },
    });
  }

  if (!config.analyticsEnabled) {
    signals.push({
      key: 'config_analytics_disabled',
      category: 'db_error',
      severity: 'warning',
      title: 'Analytics collection is disabled',
      summary: 'analyticsEnabled=false — usage events are not persisted, so live traffic is invisible.',
      occurrences: 1,
      lastSeen: null,
      evidence: { analyticsEnabled: false },
    });
  }

  if (!config.loggingEnabled) {
    signals.push({
      key: 'config_logging_disabled',
      category: 'db_error',
      severity: 'info',
      title: 'Request logging is disabled',
      summary: 'loggingEnabled=false — request logs are not being written.',
      occurrences: 1,
      lastSeen: null,
      evidence: { loggingEnabled: false },
    });
  }

  const disabledTools = Object.entries(config.tools || {})
    .filter(([, enabled]) => enabled === false)
    .map(([name]) => name);
  if (disabledTools.length > 0) {
    signals.push({
      key: 'tools_disabled',
      category: 'not_found',
      severity: 'info',
      title: 'Tools disabled by configuration',
      summary: `${disabledTools.length} MCP tool(s) are disabled: ${disabledTools.join(', ')}.`,
      occurrences: disabledTools.length,
      lastSeen: null,
      evidence: { disabled: disabledTools },
    });
  }

  return signals;
}

const ACCEPTANCE: Record<string, string> = {
  auth_failure: 'Valid API keys authenticate successfully and invalid/missing keys are rejected with a clear error.',
  rate_limit: 'Legitimate traffic is served; clients over the limit get a clear 429 with a retry hint, never a silent failure.',
  premium_denied: 'Premium gating is correct and denials return an actionable upgrade message.',
  zero_results: 'The query either returns relevant results or the catalog/tags are updated so the intent matches an existing resource.',
  db_error: 'The affected data operation succeeds and connectivity errors are surfaced safely.',
  not_found: 'The missing resource resolves correctly, or returns a clear, documented not-found result.',
};

/**
 * Deterministic, copyable fix-prompt generator. No external AI API is used; the
 * prompt is built entirely from the live signal, with secrets already redacted
 * before telemetry persistence.
 */
export function buildSignalPrompt(signal: FixSignal): string {
  const firstLineAcceptance = ACCEPTANCE[signal.category] || 'The root cause is fixed and the failure no longer reproduces.';
  return `# Investigate and Fix UI HUB MCP Failure

## Issue
${signal.title}
Category: ${signal.category} · Severity: ${signal.severity}

## Observed behavior
${signal.summary}

## Expected behavior
The affected MCP operation should complete successfully and return the expected result.

## Evidence
- Occurrences: ${signal.occurrences}
- Last seen: ${signal.lastSeen ? new Date(signal.lastSeen).toISOString() : 'n/a'}
${Object.entries(signal.evidence)
  .map(([k, v]) => `- ${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
  .join('\n')}

## Investigation instructions
Inspect the existing repository and identify the root cause before changing code.
Do not assume the cause based on this signal alone. Reproduce or test the failure first.
Note: telemetry persists only redacted data; secrets were removed before storage.

## Requirements
- Preserve all existing MCP admin and website features and API compatibility.
- Do not expose credentials, tokens, or sensitive data.
- Make the smallest safe change; do not patch symptoms.
- Add a regression test that would have caught this failure.
- Do not deploy or mutate production automatically.

## Acceptance criteria
- ${firstLineAcceptance}
- A regression test reproduces the original failure and now passes.
- No existing MCP admin, dashboard, or tool feature regresses.

## Final report
Report the root cause, files changed, tests run and their results, deployment steps, and any remaining risks.
`;
}
