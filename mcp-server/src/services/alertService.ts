import { getCollection, getDb } from './mongo.js';
import { configService } from '../config/configService.js';
import { recordAudit } from './auditService.js';
import { telemetryService, REQUEST_EVENTS_COLLECTION } from './telemetryService.js';
import type { FailureSeverity } from './failureClassifier.js';
import { redactText, sanitizeText } from './redaction.js';

export const ALERT_RULES_COLLECTION = 'mcp_alert_rules';
export const ALERT_EVENTS_COLLECTION = 'mcp_alert_events';
export const DIAGNOSTICS_COLLECTION_NAME = 'mcp_diagnostics';
const ENGINE_STATE_COLLECTION = 'mcp_config';
const ENGINE_STATE_DOC = 'alertEngine';

export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'muted';

export interface AlertThreshold {
  op: '>' | '>=' | '<' | '<=';
  value: number;
  windowMinutes: number;
}

export interface AlertRule {
  ruleId: string;
  title: string;
  description: string;
  severity: FailureSeverity;
  metric: string;
  threshold: AlertThreshold;
  cooldownMinutes: number;
  enabled: boolean;
  updatedAt?: number;
  updatedBy?: string;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  fingerprint: string;
  title: string;
  description: string;
  severity: FailureSeverity;
  metric: string;
  threshold: AlertThreshold;
  observedValue: number;
  occurrences: number;
  firstDetected: number;
  lastDetected: number;
  status: AlertStatus;
  mutedUntil?: number;
  owner?: string;
  notes?: string;
  notified: boolean;
  notifiedChannels: string[];
  link?: { tool?: string; resourceType?: string; diagnosticFingerprint?: string };
  ackAt?: number;
  resolvedAt?: number;
  recoveredAt?: number;
  reopenedAt?: number;
}

export const DEFAULT_RULES: AlertRule[] = [
  {
    ruleId: 'mcp_error_rate',
    title: 'MCP error rate high',
    description: 'Share of failed MCP requests exceeds the threshold.',
    severity: 'critical',
    metric: 'error_rate_pct',
    threshold: { op: '>=', value: 5, windowMinutes: 60 },
    cooldownMinutes: 30,
    enabled: true,
  },
  {
    ruleId: 'tool_repeated_failures',
    title: 'Repeated tool failures',
    description: 'A single MCP tool is failing repeatedly.',
    severity: 'warning',
    metric: 'tool_failures',
    threshold: { op: '>=', value: 10, windowMinutes: 60 },
    cooldownMinutes: 60,
    enabled: true,
  },
  {
    ruleId: 'latency_high',
    title: 'Response latency high',
    description: 'Average MCP response latency exceeds the threshold.',
    severity: 'warning',
    metric: 'avg_latency_ms',
    threshold: { op: '>=', value: 2000, windowMinutes: 60 },
    cooldownMinutes: 60,
    enabled: true,
  },
  {
    ruleId: 'zero_result_spike',
    title: 'Zero-result search spike',
    description: 'An unusual number of searches returned no results.',
    severity: 'warning',
    metric: 'zero_results',
    threshold: { op: '>=', value: 25, windowMinutes: 60 },
    cooldownMinutes: 60,
    enabled: true,
  },
  {
    ruleId: 'auth_failure_repeated',
    title: 'Authentication failures',
    description: 'Repeated authentication failures detected.',
    severity: 'critical',
    metric: 'auth_failures',
    threshold: { op: '>=', value: 20, windowMinutes: 60 },
    cooldownMinutes: 60,
    enabled: true,
  },
  {
    ruleId: 'rate_limit_spike',
    title: 'Rate-limit spike',
    description: 'Rate-limit events spiked above the threshold.',
    severity: 'warning',
    metric: 'rate_limited',
    threshold: { op: '>=', value: 50, windowMinutes: 60 },
    cooldownMinutes: 60,
    enabled: true,
  },
  {
    ruleId: 'server_health',
    title: 'MCP server health check failing',
    description: 'The database connectivity probe failed.',
    severity: 'critical',
    metric: 'health_failed',
    threshold: { op: '>=', value: 1, windowMinutes: 5 },
    cooldownMinutes: 10,
    enabled: true,
  },
  {
    ruleId: 'db_connectivity',
    title: 'Database query failures',
    description: 'Database error diagnostics recorded.',
    severity: 'critical',
    metric: 'db_error_diagnostics',
    threshold: { op: '>=', value: 1, windowMinutes: 60 },
    cooldownMinutes: 30,
    enabled: true,
  },
  {
    ruleId: 'tool_unavailable',
    title: 'All MCP tools disabled',
    description: 'Every registered MCP tool is disabled.',
    severity: 'critical',
    metric: 'all_tools_disabled',
    threshold: { op: '>=', value: 1, windowMinutes: 60 },
    cooldownMinutes: 120,
    enabled: true,
  },
  {
    ruleId: 'traffic_spike',
    title: 'Unusual traffic spike',
    description: 'Request volume surged versus the previous window.',
    severity: 'info',
    metric: 'traffic_ratio',
    threshold: { op: '>=', value: 3, windowMinutes: 60 },
    cooldownMinutes: 120,
    enabled: true,
  },
  {
    ruleId: 'new_critical_diagnostic',
    title: 'New high-severity diagnostic',
    description: 'A new critical-severity diagnostic fingerprint appeared.',
    severity: 'critical',
    metric: 'critical_diagnostics',
    threshold: { op: '>=', value: 1, windowMinutes: 60 },
    cooldownMinutes: 30,
    enabled: true,
  },
  {
    ruleId: 'link_check_failing',
    title: 'Resource link failing repeatedly',
    description: 'Invalid or failing resource links recorded.',
    severity: 'warning',
    metric: 'link_failures',
    threshold: { op: '>=', value: 5, windowMinutes: 1440 },
    cooldownMinutes: 120,
    enabled: true,
  },
];

export interface AlertMetrics {
  errorRatePct: number;
  avgLatencyMs: number;
  totalRequests: number;
  authFailures: number;
  rateLimited: number;
  zeroResults: number;
  searches: number;
  byToolFailures: Record<string, number>;
  criticalDiagnostics: number;
  linkFailures: number;
  dbErrorDiagnostics: number;
  allToolsDisabled: number;
  trafficRatio: number;
  healthFailed: number;
}

export interface AlertCandidate {
  ruleId: string;
  fingerprint: string;
  metric: string;
  observedValue: number;
  threshold: AlertThreshold;
  severity: FailureSeverity;
  title: string;
  description: string;
  link?: { tool?: string; resourceType?: string; diagnosticFingerprint?: string };
}

function meets(op: AlertThreshold['op'], observed: number, value: number): boolean {
  switch (op) {
    case '>':
      return observed > value;
    case '>=':
      return observed >= value;
    case '<':
      return observed < value;
    case '<=':
      return observed <= value;
    default:
      return false;
  }
}

/**
 * Pure rule evaluation — no DB access. Kept side-effect free so it can be unit
 * tested directly and reused by the scheduler.
 */
export function evaluateRules(metrics: AlertMetrics, rules: AlertRule[]): AlertCandidate[] {
  const candidates: AlertCandidate[] = [];

  const push = (rule: AlertRule, observedValue: number, fingerprint: string, link?: AlertCandidate['link']) => {
    if (!meets(rule.threshold.op, observedValue, rule.threshold.value)) return;
    candidates.push({
      ruleId: rule.ruleId,
      fingerprint,
      metric: rule.metric,
      observedValue,
      threshold: rule.threshold,
      severity: rule.severity,
      title: rule.title,
      description: rule.description,
      link,
    });
  };

  for (const rule of rules) {
    if (!rule.enabled) continue;
    switch (rule.metric) {
      case 'error_rate_pct':
        push(rule, round2(metrics.errorRatePct), 'global');
        break;
      case 'avg_latency_ms':
        push(rule, Math.round(metrics.avgLatencyMs), 'global');
        break;
      case 'auth_failures':
        push(rule, metrics.authFailures, 'global');
        break;
      case 'rate_limited':
        push(rule, metrics.rateLimited, 'global');
        break;
      case 'zero_results':
        push(rule, metrics.zeroResults, 'global');
        break;
      case 'health_failed':
        push(rule, metrics.healthFailed, 'global');
        break;
      case 'all_tools_disabled':
        push(rule, metrics.allToolsDisabled, 'global');
        break;
      case 'traffic_ratio':
        push(rule, round2(metrics.trafficRatio), 'global');
        break;
      case 'critical_diagnostics':
        push(rule, metrics.criticalDiagnostics, 'global');
        break;
      case 'db_error_diagnostics':
        push(rule, metrics.dbErrorDiagnostics, 'global');
        break;
      case 'link_failures':
        push(rule, metrics.linkFailures, 'global');
        break;
      case 'tool_failures':
        for (const [tool, count] of Object.entries(metrics.byToolFailures)) {
          push(rule, count, `tool:${tool}`, { tool });
        }
        break;
      default:
        break;
    }
  }

  return candidates;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function probeHealth(): Promise<number> {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return 0;
  } catch {
    return 1;
  }
}

async function countDiagnostics(filter: Record<string, any>): Promise<number> {
  try {
    const col = await getCollection(DIAGNOSTICS_COLLECTION_NAME);
    return await col.countDocuments(filter);
  } catch {
    return 0;
  }
}

export async function collectMetrics(now = Date.now()): Promise<AlertMetrics> {
  const window = await telemetryService.aggregateWindow(now - 60 * 60 * 1000);
  let trafficRatio = 0;
  try {
    const col = await getCollection(REQUEST_EVENTS_COLLECTION);
    const last60 = await col.countDocuments({ timestamp: { $gte: now - 60 * 60 * 1000 } });
    const prev60 = await col.countDocuments({
      timestamp: { $gte: now - 2 * 60 * 60 * 1000, $lt: now - 60 * 60 * 1000 },
    });
    trafficRatio = prev60 > 10 ? last60 / prev60 : 0;
  } catch {
    trafficRatio = 0;
  }

  let allToolsDisabled = 0;
  try {
    const states = await configService.getToolStates();
    const names = Object.keys(states);
    if (names.length > 0 && names.every((n) => states[n] === false)) allToolsDisabled = 1;
  } catch {
    allToolsDisabled = 0;
  }

  const [criticalDiagnostics, linkFailures, dbErrorDiagnostics, healthFailed] = await Promise.all([
    countDiagnostics({ severity: 'critical', firstSeen: { $gte: now - 60 * 60 * 1000 } }),
    countDiagnostics({ category: { $in: ['invalid_url', 'external_http_failed'] }, lastSeen: { $gte: now - 24 * 60 * 60 * 1000 } }),
    countDiagnostics({ category: 'db_error', lastSeen: { $gte: now - 60 * 60 * 1000 } }),
    probeHealth(),
  ]);

  return {
    errorRatePct: window.errorRate * 100,
    avgLatencyMs: window.avgLatencyMs,
    totalRequests: window.total,
    authFailures: window.authFailures,
    rateLimited: window.rateLimited,
    zeroResults: window.zeroResults,
    searches: window.searches,
    byToolFailures: window.byToolFailures,
    criticalDiagnostics,
    linkFailures,
    dbErrorDiagnostics,
    allToolsDisabled,
    trafficRatio,
    healthFailed,
  };
}

/* ── Rule persistence ── */

export async function ensureRules(): Promise<AlertRule[]> {
  try {
    const col = await getCollection(ALERT_RULES_COLLECTION);
    for (const rule of DEFAULT_RULES) {
      await col.updateOne(
        { ruleId: rule.ruleId },
        { $setOnInsert: { ...rule, createdAt: Date.now() } },
        { upsert: true },
      );
    }
    const docs = await col.find({}).toArray();
    return docs.map((d: any) => ({ ...d, ruleId: d.ruleId })) as AlertRule[];
  } catch (error: any) {
    console.error('[Alerts] ensureRules failed:', redactText(error?.message || error));
    return DEFAULT_RULES;
  }
}

export async function getRules(): Promise<AlertRule[]> {
  const rules = await ensureRules();
  const order = new Map(DEFAULT_RULES.map((r, i) => [r.ruleId, i]));
  return rules.sort((a, b) => (order.get(a.ruleId) ?? 999) - (order.get(b.ruleId) ?? 999));
}

export async function createRule(input: Partial<AlertRule>, adminEmail: string): Promise<AlertRule | null> {
  if (!input.ruleId || !input.metric || !input.threshold) return null;
  const rule: AlertRule = {
    ruleId: sanitizeText(input.ruleId, 60),
    title: sanitizeText(input.title || input.ruleId, 120),
    description: sanitizeText(input.description || '', 240),
    severity: (input.severity || 'warning') as FailureSeverity,
    metric: sanitizeText(input.metric, 60),
    threshold: {
      op: input.threshold.op || '>=',
      value: Number(input.threshold.value) || 0,
      windowMinutes: Number(input.threshold.windowMinutes) || 60,
    },
    cooldownMinutes: Number(input.cooldownMinutes) || 30,
    enabled: input.enabled !== false,
    updatedAt: Date.now(),
    updatedBy: adminEmail,
  };
  try {
    const col = await getCollection(ALERT_RULES_COLLECTION);
    await col.updateOne({ ruleId: rule.ruleId }, { $set: rule, $setOnInsert: { createdAt: Date.now() } }, { upsert: true });
    await recordAudit({ adminEmail, action: 'alert.rule.create', targetType: 'alert_rule', targetId: rule.ruleId });
    return rule;
  } catch (error: any) {
    console.error('[Alerts] createRule failed:', redactText(error?.message || error));
    return null;
  }
}

export async function updateRule(ruleId: string, patch: Partial<AlertRule>, adminEmail: string): Promise<AlertRule | null> {
  const set: Record<string, unknown> = { updatedAt: Date.now(), updatedBy: adminEmail };
  if (patch.title !== undefined) set.title = sanitizeText(patch.title, 120);
  if (patch.description !== undefined) set.description = sanitizeText(patch.description, 240);
  if (patch.severity !== undefined) set.severity = patch.severity;
  if (patch.metric !== undefined) set.metric = sanitizeText(patch.metric, 60);
  if (patch.cooldownMinutes !== undefined) set.cooldownMinutes = Number(patch.cooldownMinutes) || 30;
  if (patch.enabled !== undefined) set.enabled = Boolean(patch.enabled);
  if (patch.threshold !== undefined) {
    set.threshold = {
      op: patch.threshold.op || '>=',
      value: Number(patch.threshold.value) || 0,
      windowMinutes: Number(patch.threshold.windowMinutes) || 60,
    };
  }
  try {
    const col = await getCollection(ALERT_RULES_COLLECTION);
    const res = await col.updateOne({ ruleId }, { $set: set });
    if (res.matchedCount === 0) return null;
    await recordAudit({ adminEmail, action: 'alert.rule.update', targetType: 'alert_rule', targetId: ruleId, meta: { fields: Object.keys(set) } });
    const doc = await col.findOne({ ruleId });
    return doc as unknown as AlertRule;
  } catch (error: any) {
    console.error('[Alerts] updateRule failed:', redactText(error?.message || error));
    return null;
  }
}

/* ── Evaluation + persistence ── */

function eventKey(ruleId: string, fingerprint: string): string {
  return `${ruleId}::${fingerprint}`;
}

function toAlertEvent(doc: any): AlertEvent {
  const { _id, ...rest } = doc || {};
  return { id: String(_id), ...rest } as AlertEvent;
}

export async function evaluateAndPersist(now = Date.now()): Promise<{ fired: number; resolved: number; rules: number }> {
  const rules = await getRules();
  const metrics = await collectMetrics(now);
  const candidates = evaluateRules(metrics, rules);
  const firedKeys = new Set(candidates.map((c) => eventKey(c.ruleId, c.fingerprint)));

  const col = await getCollection(ALERT_EVENTS_COLLECTION);
  let fired = 0;
  let resolved = 0;

  for (const c of candidates) {
    const existing = await col.findOne({ ruleId: c.ruleId, fingerprint: c.fingerprint, status: { $ne: 'resolved' } });
    if (existing) {
      const mutedActive = existing.status === 'muted' && Number(existing.mutedUntil || 0) > now;
      await col.updateOne(
        { _id: existing._id },
        {
          $set: {
            observedValue: c.observedValue,
            threshold: c.threshold,
            severity: c.severity,
            lastDetected: now,
            status: mutedActive ? 'muted' : 'open',
          },
          $inc: { occurrences: 1 },
        },
      );
      fired++;
      continue;
    }

    const resolvedExisting = await col.findOne({ ruleId: c.ruleId, fingerprint: c.fingerprint, status: 'resolved' });
    if (resolvedExisting) {
      const rule = rules.find((r) => r.ruleId === c.ruleId);
      const cooldownMs = (rule?.cooldownMinutes || 30) * 60 * 1000;
      if (now - Number(resolvedExisting.resolvedAt || 0) < cooldownMs) {
        continue;
      }
      await col.updateOne(
        { _id: resolvedExisting._id },
        { $set: { status: 'open', reopenedAt: now, observedValue: c.observedValue, lastDetected: now, severity: c.severity }, $inc: { occurrences: 1 } },
      );
      fired++;
      continue;
    }

    await col.updateOne(
      { ruleId: c.ruleId, fingerprint: c.fingerprint },
      {
        $setOnInsert: {
          ruleId: c.ruleId,
          fingerprint: c.fingerprint,
          title: c.title,
          description: c.description,
          severity: c.severity,
          metric: c.metric,
          threshold: c.threshold,
          observedValue: c.observedValue,
          occurrences: 0,
          firstDetected: now,
          lastDetected: now,
          status: 'open' as AlertStatus,
          notified: false,
          notifiedChannels: [],
          link: c.link,
          createdAt: now,
        },
        $set: { lastDetected: now, observedValue: c.observedValue, severity: c.severity },
        $inc: { occurrences: 1 },
      },
      { upsert: true },
    );
    fired++;
  }

  // Recovery: events that are no longer firing and are not actively muted.
  const active = await col.find({ status: { $in: ['open', 'acknowledged', 'muted'] } }).toArray();
  for (const ev of active) {
    if (firedKeys.has(eventKey(ev.ruleId, ev.fingerprint))) continue;
    const mutedActive = ev.status === 'muted' && Number(ev.mutedUntil || 0) > now;
    if (mutedActive) continue;
    await col.updateOne({ _id: ev._id }, { $set: { status: 'resolved', recoveredAt: now, resolvedAt: now } });
    resolved++;
  }

  await setEngineState({ at: now, ok: true, error: '', metrics, fired, resolved });
  return { fired, resolved, rules: rules.length };
}

export async function setEngineState(state: Record<string, unknown>): Promise<void> {
  try {
    const col = await getCollection(ENGINE_STATE_COLLECTION);
    await col.updateOne({ _id: ENGINE_STATE_DOC }, { $set: { ...state, updatedAt: Date.now() } }, { upsert: true });
  } catch (error: any) {
    console.error('[Alerts] setEngineState failed:', redactText(error?.message || error));
  }
}

export async function getEngineState(): Promise<Record<string, unknown> | null> {
  try {
    const col = await getCollection(ENGINE_STATE_COLLECTION);
    const doc = await col.findOne({ _id: ENGINE_STATE_DOC });
    if (!doc) return null;
    const { _id, ...rest } = doc as any;
    return rest as Record<string, unknown>;
  } catch {
    return null;
  }
}

export interface AlertEventQuery {
  status?: AlertStatus;
  severity?: FailureSeverity;
  ruleId?: string;
  page?: number;
  pageSize?: number;
}

export async function listAlertEvents(q: AlertEventQuery): Promise<{
  total: number;
  page: number;
  pageSize: number;
  items: AlertEvent[];
  counts: Record<string, number>;
}> {
  const page = Math.max(1, q.page || 1);
  const pageSize = Math.min(200, Math.max(1, q.pageSize || 50));
  const counts: Record<string, number> = { open: 0, acknowledged: 0, resolved: 0, muted: 0 };
  try {
    const col = await getCollection(ALERT_EVENTS_COLLECTION);
    for (const status of Object.keys(counts)) {
      counts[status] = await col.countDocuments({ status });
    }
    const filter: Record<string, any> = {};
    if (q.status) filter.status = q.status;
    if (q.severity) filter.severity = q.severity;
    if (q.ruleId) filter.ruleId = q.ruleId;
    const total = await col.countDocuments(filter);
    const docs = await col.find(filter).sort({ lastDetected: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray();
    return { total, page, pageSize, items: docs.map(toAlertEvent), counts };
  } catch (error: any) {
    console.error('[Alerts] listAlertEvents failed:', redactText(error?.message || error));
    return { total: 0, page, pageSize, items: [], counts };
  }
}

export async function getAlertEvent(id: string): Promise<AlertEvent | null> {
  try {
    const col = await getCollection(ALERT_EVENTS_COLLECTION);
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(id)) return null;
    const doc = await col.findOne({ _id: new ObjectId(id) as any });
    return doc ? toAlertEvent(doc) : null;
  } catch {
    return null;
  }
}

export async function applyAlertAction(
  id: string,
  action: 'acknowledge' | 'resolve' | 'reopen' | 'mute',
  meta: { adminEmail: string; notes?: string; muteMinutes?: number },
): Promise<AlertEvent | null> {
  const existing = await getAlertEvent(id);
  if (!existing) return null;
  const now = Date.now();
  const set: Record<string, unknown> = {};
  if (meta.notes !== undefined) set.notes = sanitizeText(meta.notes, 1000);
  switch (action) {
    case 'acknowledge':
      set.status = 'acknowledged';
      set.owner = meta.adminEmail;
      set.ackAt = now;
      break;
    case 'resolve':
      set.status = 'resolved';
      set.resolvedAt = now;
      break;
    case 'reopen':
      set.status = 'open';
      set.reopenedAt = now;
      break;
    case 'mute':
      set.status = 'muted';
      set.mutedUntil = now + Math.min(7 * 24 * 60, Math.max(1, meta.muteMinutes || 60)) * 60 * 1000;
      break;
  }
  const col = await getCollection(ALERT_EVENTS_COLLECTION);
  const { ObjectId } = await import('mongodb');
  await col.updateOne({ _id: new ObjectId(id) as any }, { $set: set });
  await recordAudit({ adminEmail: meta.adminEmail, action: `alert.${action}`, targetType: 'alert_event', targetId: id });
  return getAlertEvent(id);
}
