import { describe, it, expect } from 'vitest';
import {
  classifyFailure,
  computeFingerprint,
  severityForCategory,
  shortErrorSummary,
} from '../src/services/failureClassifier.js';
import { sanitizeUrl, normalizeQuery, hashValue, redactText } from '../src/services/redaction.js';
import { parseToolResult, extractResourceId, categoryForOutcome } from '../src/services/mcpInstrumentation.js';
import { buildRequestStatus, toolTelemetry } from '../src/services/telemetryService.js';
import { evaluateRules, type AlertMetrics, type AlertRule } from '../src/services/alertService.js';

describe('failureClassifier', () => {
  it('classifies known tool error codes deterministically', () => {
    expect(classifyFailure({ errorCode: 'COMPONENT_NOT_FOUND' })).toBe('not_found');
    expect(classifyFailure({ errorCode: 'PREMIUM_ACCESS_REQUIRED' })).toBe('premium_denied');
    expect(classifyFailure({ errorCode: 'RATE_LIMIT_EXCEEDED' })).toBe('rate_limit');
    expect(classifyFailure({ errorCode: 'METHOD_NOT_FOUND' })).toBe('protocol_error');
    expect(classifyFailure({ errorCode: 'VALIDATION_ERROR' })).toBe('validation_error');
  });

  it('honours an explicit category above heuristics', () => {
    expect(classifyFailure({ errorCode: 'COMPONENT_NOT_FOUND', explicit: 'zero_results' })).toBe('zero_results');
  });

  it('classifies zero-result searches distinctly from errors', () => {
    expect(classifyFailure({ zeroResults: true })).toBe('zero_results');
  });

  it('detects timeout and db errors from messages', () => {
    expect(classifyFailure({ message: 'request timed out after 7000ms' })).toBe('timeout');
    expect(classifyFailure({ message: 'MongoNetworkError: connection closed' })).toBe('db_error');
  });

  it('produces stable, normalized fingerprints', () => {
    const a = computeFingerprint({ category: 'not_found', tool: 'get_component', errorSignature: 'id 12345678 not found' });
    const b = computeFingerprint({ category: 'not_found', tool: 'get_component', errorSignature: 'id 98765432 not found' });
    expect(a).toBe(b);
    expect(a).toHaveLength(24);
  });

  it('maps categories to severities', () => {
    expect(severityForCategory('db_error')).toBe('critical');
    expect(severityForCategory('zero_results')).toBe('info');
    expect(severityForCategory('not_found')).toBe('warning');
  });

  it('summarizes errors', () => {
    expect(shortErrorSummary(undefined, 'COMPONENT_NOT_FOUND')).toContain('COMPONENT_NOT_FOUND');
  });
});

describe('redaction', () => {
  it('redacts secrets before persistence', () => {
    const out = redactText('Authorization: Bearer uh_live_abcd1234 mongodb://user:pass@host/db');
    expect(out).not.toContain('uh_live_abcd1234');
    expect(out).not.toContain('pass@host');
  });

  it('normalizes queries for aggregation', () => {
    expect(normalizeQuery('  Scroll   REVEAL ')).toBe('scroll reveal');
  });

  it('validates and sanitizes URLs (format only)', () => {
    const good = sanitizeUrl('https://example.com/x?token=secret&q=1');
    expect(good.valid).toBe(true);
    expect(good.sanitized).toContain('REDACTED');
    expect(good.sanitized).not.toContain('secret');

    expect(sanitizeUrl('javascript:alert(1)').valid).toBe(false);
    expect(sanitizeUrl('not a url').valid).toBe(false);
    expect(sanitizeUrl('').valid).toBe(false);
  });

  it('hashes values without storing raw input', () => {
    const h = hashValue('203.0.113.9');
    expect(h).not.toContain('203.0.113.9');
    expect(hashValue('203.0.113.9')).toBe(h);
  });
});

describe('mcpInstrumentation', () => {
  it('parses search tool results', () => {
    const result = { content: [{ text: JSON.stringify({ count: 2, components: [{ id: 'a' }, { id: 'b' }] }) }] };
    const parsed = parseToolResult(result);
    expect(parsed.resultCount).toBe(2);
    expect(parsed.returnedIds).toEqual(['a', 'b']);
    expect(parsed.zeroResults).toBe(false);
  });

  it('flags zero-result searches', () => {
    const result = { content: [{ text: JSON.stringify({ count: 0, components: [] }) }] };
    const parsed = parseToolResult(result);
    expect(parsed.zeroResults).toBe(true);
    expect(categoryForOutcome(parsed)).toBe('zero_results');
  });

  it('parses error tool results', () => {
    const result = { isError: true, content: [{ text: JSON.stringify({ error: 'COMPONENT_NOT_FOUND', message: 'missing' }) }] };
    const parsed = parseToolResult(result);
    expect(parsed.isError).toBe(true);
    expect(parsed.errorCode).toBe('COMPONENT_NOT_FOUND');
    expect(categoryForOutcome(parsed)).toBe('not_found');
  });

  it('extracts resource ids from args', () => {
    expect(extractResourceId('get_component', { componentId: 'target-cursor' })).toBe('target-cursor');
    expect(extractResourceId('get_template', { templateId: 'template-hero' })).toBe('template-hero');
    expect(extractResourceId('list_categories', {})).toBeUndefined();
  });

  it('maps tools to telemetry semantics', () => {
    expect(toolTelemetry('search_components')?.kind).toBe('search');
    expect(toolTelemetry('get_component_code')?.kind).toBe('code');
    expect(toolTelemetry('get_component')?.kind).toBe('fetch');
    expect(toolTelemetry('unknown_tool')).toBeUndefined();
  });
});

describe('buildRequestStatus', () => {
  it('maps outcomes to request statuses', () => {
    expect(buildRequestStatus({ isError: false })).toBe('success');
    expect(buildRequestStatus({ isError: false, zeroResults: true })).toBe('no_results');
    expect(buildRequestStatus({ isError: true, errorCategory: 'auth_failure' })).toBe('authorization_denied');
    expect(buildRequestStatus({ isError: true, errorCategory: 'rate_limit' })).toBe('rate_limited');
    expect(buildRequestStatus({ isError: true, errorCategory: 'validation_error' })).toBe('validation_error');
    expect(buildRequestStatus({ isError: true, errorCategory: 'db_error' })).toBe('server_error');
  });
});

describe('alert rule evaluation (pure)', () => {
  const baseMetrics: AlertMetrics = {
    errorRatePct: 10,
    avgLatencyMs: 500,
    totalRequests: 100,
    authFailures: 2,
    rateLimited: 0,
    zeroResults: 1,
    searches: 20,
    byToolFailures: { get_component: 6 },
    criticalDiagnostics: 0,
    linkFailures: 0,
    dbErrorDiagnostics: 0,
    allToolsDisabled: 0,
    trafficRatio: 1.2,
    healthFailed: 0,
  };

  const rule = (over: Partial<AlertRule>): AlertRule => ({
    ruleId: 'r1',
    title: 'Error rate',
    description: 'desc',
    severity: 'critical',
    metric: 'error_rate_pct',
    threshold: { op: '>=', value: 5, windowMinutes: 60 },
    cooldownMinutes: 30,
    enabled: true,
    ...over,
  });

  it('fires when threshold is met', () => {
    const candidates = evaluateRules(baseMetrics, [rule({})]);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].ruleId).toBe('r1');
    expect(candidates[0].observedValue).toBe(10);
  });

  it('does not fire below threshold or when disabled', () => {
    expect(evaluateRules(baseMetrics, [rule({ threshold: { op: '>=', value: 50, windowMinutes: 60 } })])).toHaveLength(0);
    expect(evaluateRules(baseMetrics, [rule({ enabled: false })])).toHaveLength(0);
  });

  it('evaluates per-tool failure rules', () => {
    const candidates = evaluateRules(baseMetrics, [
      rule({ ruleId: 'tool_fail', metric: 'tool_failures', threshold: { op: '>=', value: 5, windowMinutes: 60 } }),
    ]);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].fingerprint).toBe('tool:get_component');
  });
});
