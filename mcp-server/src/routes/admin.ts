import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { configService } from '../config/configService.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { analyticsService, AnalyticsService, aggregateEvents, McpEvent, McpStats, ToolUsage } from '../services/analyticsService.js';
import { recordAudit, listAudit } from '../services/auditService.js';
import { getCollection as mongoCollection } from '../services/mongo.js';
import { componentService } from '../services/componentService.js';
import { TOOLS } from '../tools/index.js';
import type { McpUser } from '../types/index.js';
import { telemetryService, SEARCH_EVENTS_COLLECTION } from '../services/telemetryService.js';
import {
  queryDiagnostics,
  getDiagnostic,
  updateDiagnosticStatus,
  buildFixPrompt,
} from '../services/diagnosticsService.js';
import {
  ensureRules,
  createRule,
  updateRule,
  getEngineState,
  listAlertEvents,
  getAlertEvent,
  applyAlertAction,
} from '../services/alertService.js';
import {
  eventsToLogRows,
  logsToCsv,
  mapLogRow,
  matchesLogFilters,
  type LogFilters,
} from '../services/logService.js';
import { deriveSignals, buildSignalPrompt } from '../services/fixCenterService.js';

const adminRouter = Router();

const ADMIN_BASE = '/api/admin/mcp';

function dateKeyFor(ts: number): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function daysAgoKey(days: number): string {
  return dateKeyFor(Date.now() - days * 86400000);
}

interface Range {
  fromKey: string;
  toKey: string;
  fromTs: number;
  toTs: number;
}

function parseRange(query: Record<string, any>): Range {
  const now = Date.now();
  const toTs = query.to ? new Date(query.to as string).getTime() || now : now;
  let fromTs: number;
  if (query.from) {
    const parsed = new Date(query.from as string).getTime();
    fromTs = parsed || now - 30 * 86400000;
  } else if (query.range && typeof query.range === 'string') {
    const days = parseInt(query.range.replace(/[^0-9]/g, ''), 10) || 30;
    fromTs = now - days * 86400000;
  } else {
    fromTs = now - 30 * 86400000;
  }
  return {
    fromKey: dateKeyFor(fromTs),
    toKey: dateKeyFor(toTs),
    fromTs,
    toTs,
  };
}

function clampInt(value: any, fallback: number, min: number, max: number): number {
  const n = parseInt(value, 10);
  if (isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function maskUid(uid: string): string {
  if (!uid) return '-';
  if (uid.length <= 8) return uid;
  return `${uid.slice(0, 6)}…${uid.slice(-4)}`;
}

function normTier(t: any): string {
  const s = String(t || '').toUpperCase();
  if (s.startsWith('ADMIN')) return 'ADMIN';
  if (s.startsWith('ELITE')) return 'ELITE';
  if (s === 'PRO') return 'PRO';
  return 'FREE';
}

interface UserAgg {
  uid: string;
  email: string;
  name: string;
  plan: string;
  status: string;
  isAdmin: boolean;
  keyCount: number;
  activeKeyCount: number;
  revokedKeyCount: number;
  requests: number;
  lastActive: number | null;
  createdAt: number | null;
  keys: Array<Record<string, any>>;
}

async function buildUsers(events: McpEvent[]): Promise<UserAgg[]> {
  const usersByUid = new Map<string, Record<string, any>>();
  const usersByEmail = new Map<string, Record<string, any>>();
  try {
    const col = await mongoCollection('users');
    const docs = await col.find({}).toArray();
    docs.forEach((doc) => {
      const data = doc;
      if (data.uid) usersByUid.set(String(data.uid), data);
      usersByEmail.set(String(doc._id).toLowerCase(), data);
    });
  } catch {
    // dev mode
  }

  let keys: Array<Record<string, any>> = [];
  try {
    const col = await mongoCollection('mcp_api_keys');
    const docs = await col.find({}).toArray();
    keys = docs.map((doc) => ({ id: String(doc._id), ...doc }));
  } catch {
    // dev mode
  }

  const requestsByUser = new Map<string, number>();
  const lastActiveByUser = new Map<string, number>();
  events.forEach((e) => {
    if (!e.userId) return;
    requestsByUser.set(e.userId, (requestsByUser.get(e.userId) || 0) + 1);
    if (e.timestamp > (lastActiveByUser.get(e.userId) || 0)) {
      lastActiveByUser.set(e.userId, e.timestamp);
    }
  });

  const byUid = new Map<string, UserAgg>();
  keys.forEach((key) => {
    const uid = String(key.user_id || '');
    if (!uid) return;
    let agg = byUid.get(uid);
    if (!agg) {
      const doc = usersByUid.get(uid);
      const email = String(doc?.email || key.email || key.user_email || '').toLowerCase();
      const emailDoc = email ? usersByEmail.get(email) : undefined;
      const mergedDoc = doc || emailDoc;
      agg = {
        uid,
        email,
        name: String(mergedDoc?.displayName || mergedDoc?.name || mergedDoc?.fullName || email || 'Unknown'),
        plan: normTier(mergedDoc?.planTier || mergedDoc?.tier || 'FREE'),
        status: String(mergedDoc?.status || 'active'),
        isAdmin: Boolean(mergedDoc?.isAdmin || mergedDoc?.role === 'admin'),
        keyCount: 0,
        activeKeyCount: 0,
        revokedKeyCount: 0,
        requests: requestsByUser.get(uid) || 0,
        lastActive: lastActiveByUser.get(uid) || null,
        createdAt: key.created_at ? Number(key.created_at) : null,
        keys: [],
      };
      byUid.set(uid, agg);
    }
    agg.keyCount++;
    const st = String(key.status || 'active');
    if (st === 'active') agg.activeKeyCount++;
    if (st === 'revoked') agg.revokedKeyCount++;
    agg.keys.push({
      id: key.id,
      keyPrefix: key.key_prefix,
      name: key.name,
      status: st,
      created_at: key.created_at,
      last_used_at: key.last_used_at,
      expires_at: key.expires_at,
      revoked_at: key.revoked_at,
    });
  });

  const keysOnlyUsers = new Set(keys.map((k) => String(k.user_id || '')));
  usersByUid.forEach((doc, uid) => {
    if (byUid.has(uid)) return;
    const email = String(doc.email || '').toLowerCase();
    const agg: UserAgg = {
      uid,
      email,
      name: String(doc.displayName || doc.name || email || 'Unknown'),
      plan: normTier(doc.planTier || doc.tier || 'FREE'),
      status: String(doc.status || 'active'),
      isAdmin: Boolean(doc.isAdmin || doc.role === 'admin'),
      keyCount: 0,
      activeKeyCount: 0,
      revokedKeyCount: 0,
      requests: requestsByUser.get(uid) || 0,
      lastActive: lastActiveByUser.get(uid) || null,
      createdAt: doc.createdAt ? Number(doc.createdAt) : null,
      keys: [],
    };
    byUid.set(uid, agg);
  });

  if (keysOnlyUsers.size === 0 && byUid.size === 0) {
    // fall back to any user stored under an email-like doc id
    usersByEmail.forEach((doc) => {
      const uid = String(doc.uid || '');
      if (uid && !byUid.has(uid)) {
        byUid.set(uid, {
          uid,
          email: String(doc.email || ''),
          name: String(doc.displayName || doc.name || ''),
          plan: normTier(doc.planTier || 'FREE'),
          status: String(doc.status || 'active'),
          isAdmin: Boolean(doc.isAdmin),
          keyCount: 0,
          activeKeyCount: 0,
          revokedKeyCount: 0,
          requests: 0,
          lastActive: null,
          createdAt: null,
          keys: [],
        });
      }
    });
  }

  return Array.from(byUid.values()).sort(
    (a, b) => (b.requests - a.requests) || (b.lastActive || 0) - (a.lastActive || 0)
  );
}

async function getAllKeys(): Promise<Array<Record<string, any>>> {
  try {
    const col = await mongoCollection('mcp_api_keys');
    const docs = await col.find({}).toArray();
    return docs.map((doc) => ({ id: String(doc._id), ...doc }));
  } catch {
    return [];
  }
}

interface Alert {
  key: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  at: number;
}

async function computeAlerts(eventsArg?: McpEvent[], keysArg?: Array<Record<string, any>>): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = Date.now();
  const events = eventsArg
    ? eventsArg.filter((e) => now - e.timestamp < 2 * 86400000)
    : await analyticsService.queryEvents(daysAgoKey(2));
  const recentEvents = events.filter((e) => now - e.timestamp < 86400000);
  const stats = aggregateEvents(recentEvents);
  const keys = keysArg ?? (await getAllKeys());
  const activeKeys = keys.filter((k) => String(k.status || 'active') === 'active');

  if (activeKeys.length === 0) {
    alerts.push({
      key: 'no_active_keys',
      severity: 'warning',
      title: 'No active API keys',
      message: 'There are no active API keys. The MCP service is effectively unreachable.',
      at: now,
    });
  }

  if (recentEvents.length > 0 && stats.errorRate > 0.05) {
    alerts.push({
      key: 'high_error_rate',
      severity: 'critical',
      title: 'Elevated error rate',
      message: `${(stats.errorRate * 100).toFixed(1)}% of MCP requests failed in the last 24h.`,
      at: now,
    });
  }

  if (stats.avgResponseTimeMs > 1000) {
    alerts.push({
      key: 'slow_responses',
      severity: 'warning',
      title: 'Slow responses',
      message: `Average response time ${stats.avgResponseTimeMs}ms in the last 24h.`,
      at: now,
    });
  }

  if (stats.rateLimitEvents > 50) {
    alerts.push({
      key: 'rate_limit_surge',
      severity: 'warning',
      title: 'Rate limit surges',
      message: `${stats.rateLimitEvents} requests were rate-limited in the last 24h.`,
      at: now,
    });
  }

  if (stats.authFailures > 20) {
    alerts.push({
      key: 'auth_failure_surge',
      severity: 'critical',
      title: 'Authentication failures',
      message: `${stats.authFailures} auth failures in the last 24h. Possible brute-force or invalid-key traffic.`,
      at: now,
    });
  }

  const yesterday = events.filter((e) => now - e.timestamp >= 86400000 && now - e.timestamp < 2 * 86400000).length;
  const today = events.filter((e) => now - e.timestamp < 86400000).length;
  if (yesterday > 100 && today > yesterday * 3) {
    alerts.push({
      key: 'traffic_spike',
      severity: 'info',
      title: 'Traffic spike',
      message: `Requests jumped from ${yesterday} to ${today} in the last 24h.`,
      at: now,
    });
  }

  const staleKeys = keys.filter(
    (k) => String(k.status || 'active') === 'active' && k.last_used_at && now - Number(k.last_used_at) > 30 * 86400000
  );
  if (staleKeys.length > 0) {
    alerts.push({
      key: 'stale_keys',
      severity: 'info',
      title: 'Inactive API keys',
      message: `${staleKeys.length} active key(s) have not been used in over 30 days.`,
      at: now,
    });
  }

  return alerts.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

const SEVERITY_RANK: Record<string, number> = { critical: 0, warning: 1, info: 2 };

async function getResolvedAlerts(): Promise<string[]> {
  try {
    const col = await mongoCollection('mcp_config');
    const doc = await col.findOne({ _id: 'app' });
    const data = (doc || {}) as Record<string, any>;
    return Array.isArray(data.resolvedAlerts) ? data.resolvedAlerts.map(String) : [];
  } catch {
    return [];
  }
}

async function setResolvedAlerts(resolved: string[]) {
  try {
    const col = await mongoCollection('mcp_config');
    await col.updateOne({ _id: 'app' }, { $set: { resolvedAlerts: resolved } }, { upsert: true });
  } catch {
    // dev mode
  }
}

adminRouter.get('/status', requireAdmin, (req: Request, res: Response) => {
  const { uid, email } = req as any;
  res.json({
    admin: true,
    tier: (req as any).tier || 'ADMIN',
    email,
    uid,
    service: 'ui-hub-mcp',
    version: '1.0.0',
  });
});

adminRouter.get('/overview', requireAdmin, async (req: Request, res: Response) => {
  const range = parseRange(req.query as Record<string, any>);
  const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
  const stats = aggregateEvents(events);
  const keys = await getAllKeys();
  const activeKeys = keys.filter((k) => String(k.status || 'active') === 'active').length;
  const totalKeys = keys.length;
  const userUids = new Set(keys.map((k) => String(k.user_id || ''))).size;

  const last24 = events.filter((e) => Date.now() - e.timestamp < 86400000);
  const last7 = events.filter((e) => Date.now() - e.timestamp < 7 * 86400000);
  const alerts = await computeAlerts(events, keys);
  const resolved = await getResolvedAlerts();
  const activeAlerts = alerts.filter((a) => !resolved.includes(a.key));

  const activeUsers24h = new Set(
    last24.filter((e) => e.userId).map((e) => e.userId)
  ).size;

  let dbConnected = false;
  try {
    const col = await mongoCollection('mcp_analytics');
    await col.findOne({});
    dbConnected = true;
  } catch {
    dbConnected = false;
  }
  const uptimeSeconds = Math.round(process.uptime());

  const reqPerSec = stats.requests > 0 ? stats.requests / Math.max(1, Math.round((range.toTs - range.fromTs) / 1000)) : 0;

  const days: Array<{ date: string; requests: number; errors: number }> = [];
  const today = new Date();
  const errorsByDay: Record<string, number> = {};
  events.forEach((e) => {
    if (e.event === 'mcp_request' && e.success === false) {
      const key = dateKeyFor(e.timestamp);
      errorsByDay[key] = (errorsByDay[key] || 0) + 1;
    }
  });
  for (let i = 0; i < 30; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    days.push({ date: key, requests: stats.byDay[key] || 0, errors: errorsByDay[key] || 0 });
  }
  days.reverse();

  const toolStats = Object.values(stats.byTool).sort((a, b) => b.total - a.total);
  const timeseries = Object.entries(stats.byDay)
    .map(([date, requests]) => ({ date, requests }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    range: { fromKey: range.fromKey, toKey: range.toKey },
    dbConnected,
    uptimeSeconds,
    reqPerSec,
    activeUsers24h,
    stats: {
      totalRequests: stats.requests,
      last24Requests: last24.length,
      last7Requests: last7.length,
      uniqueUsers: stats.uniqueUsers,
      activeUsers24h,
      usersWithKeys: userUids,
      activeKeys,
      totalKeys,
      errorRate: stats.errorRate,
      failedRequests: stats.failedRequests,
      avgResponseTimeMs: stats.avgResponseTimeMs,
      rateLimitEvents: stats.rateLimitEvents,
      premiumDenied: stats.premiumDenied,
      authFailures: stats.authFailures,
      freeUsage: Object.entries(stats.byTier)
        .filter(([t]) => t === 'FREE')
        .reduce((n, [, c]) => n + c, 0),
      proUsage: Object.entries(stats.byTier)
        .filter(([t]) => t !== 'FREE')
        .reduce((n, [, c]) => n + c, 0),
    },
    topTools: toolStats.slice(0, 8),
    timeseries,
    days,
    alerts: activeAlerts,
    alertsTotal: alerts.length,
  });
});

adminRouter.get('/analytics', requireAdmin, async (req: Request, res: Response) => {
  const range = parseRange(req.query as Record<string, any>);
  const requests = await telemetryService.queryRequests({ fromTs: range.fromTs, toTs: range.toTs, page: 1, pageSize: 50000 });
  const items = requests.items;

  const total = items.length;
  const success = items.filter((e: any) => e.success).length;
  const errors = total - success;
  const errorRate = total ? (errors / total) * 100 : 0;
  const latencies = items.map((e: any) => typeof e.latencyMs === 'number' ? e.latencyMs : 0).filter((n) => n > 0);
  const avgResponseTimeMs = latencies.length ? Math.round(latencies.reduce((s,n)=>s+n,0)/latencies.length) : 0;
  const rateLimitEvents = items.filter((e:any)=>e.errorCode==='RATE_LIMIT_EXCEEDED'||e.status==='rate_limited').length;
  const premiumDenied = items.filter((e:any)=>e.errorCode==='PREMIUM_ACCESS_REQUIRED'||e.errorCategory==='premium_denied').length;
  const authFailures = items.filter((e:any)=>e.errorCategory==='auth_failure'||e.status==='authorization_denied').length;

  const byTool: Record<string, { name:string; total:number; success:number; errors:number; avgLatency:number; }>= {};
  for (const e of items) {
    const name = e.toolName || e.method || 'unknown';
    if (!byTool[name]) byTool[name]={name,total:0,success:0,errors:0,avgLatency:0};
    byTool[name].total++;
    if (e.success) byTool[name].success++; else byTool[name].errors++;
  }
  const toolList = Object.values(byTool).map(t=>{
    const tt = items.filter((e:any)=>(e.toolName||e.method||'unknown')===t.name && typeof e.latencyMs==='number'&&e.latencyMs>0);
    const avg = tt.length? Math.round(tt.reduce((s,n:any)=>s+n.latencyMs,0)/tt.length):0;
    return {...t, avgLatency:avg, errorRate:t.total? (t.errors/t.total)*100:0};
  }).sort((a,b)=>b.total-a.total);

  const byDayMap: Record<string,number>={};
  for (const e of items) {
    const d=new Date(e.timestamp);
    const k=`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
    byDayMap[k]=(byDayMap[k]||0)+1;
  }
  const byDay=Object.entries(byDayMap).map(([date,requests])=>({date,requests})).sort((a,b)=>a.date.localeCompare(b.date));

  const byTier: Record<string,number>={};
  const byStatus: Record<string,number>={};
  for (const e of items) {
    const t=e.tier||'unknown';
    byTier[t]=(byTier[t]||0)+1;
    const s=e.status||'unknown';
    byStatus[s]=(byStatus[s]||0)+1;
  }

  const topComponents = [] as any[];
  res.json({
    range,
    summary: {
      requests: total,
      uniqueUsers: new Set(items.map((e: any) => e.userId || e.apiKeyId).filter(Boolean)).size,
      errorRate: Math.round(errorRate * 100) / 100,
      avgResponseTimeMs,
      rateLimitEvents,
      premiumDenied,
      authFailures,
    },
    byDay,
    byTool: toolList,
    byTier,
    byStatus,
    topComponents,
  });
});


adminRouter.get('/users', requireAdmin, async (req: Request, res: Response) => {
  const range = parseRange(req.query as Record<string, any>);
  const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
  let users = await buildUsers(events);

  const q = String(req.query.search || '').toLowerCase().trim();
  if (q) {
    users = users.filter(
      (u) => u.email.toLowerCase().includes(q) || u.uid.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
    );
  }
  const plan = String(req.query.plan || '').toUpperCase();
  if (plan) users = users.filter((u) => u.plan === plan);
  const statusFilter = String(req.query.status || '');
  if (statusFilter) users = users.filter((u) => u.status === statusFilter);

  const page = clampInt(req.query.page, 1, 1, 100000);
  const pageSize = clampInt(req.query.pageSize, 25, 1, 100);
  const total = users.length;
  const start = (page - 1) * pageSize;
  const rows = users.slice(start, start + pageSize).map((u) => ({ ...u, uidMasked: maskUid(u.uid), keys: undefined }));

  res.json({
    total,
    page,
    pageSize,
    range: { fromKey: range.fromKey, toKey: range.toKey },
    users: rows,
  });
});

adminRouter.get('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  const uid = req.params.id;
  const range = parseRange(req.query as Record<string, any>);
  const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
  const userEvents = events.filter((e) => e.userId === uid).sort((a, b) => b.timestamp - a.timestamp);
  const all = await buildUsers(events);
  const user = all.find((u) => u.uid === uid);
  if (!user) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
  }

  const stats = aggregateEvents(userEvents);
  res.json({
    user: { ...user, uid, uidMasked: maskUid(uid) },
    range,
    stats: {
      requests: userEvents.length,
      failureCount: stats.failedRequests,
      rateLimitEvents: stats.rateLimitEvents,
      premiumDenied: stats.premiumDenied,
      lastActive: user.lastActive,
      byTool: stats.byTool,
      byDay: stats.byDay,
    },
    recentEvents: userEvents.slice(0, 25),
  });
});

adminRouter.post('/users/:id/suspend', requireAdmin, async (req: Request, res: Response) => {
  const uid = req.params.id;
  try {
    const col = await mongoCollection('users');
    const result = await col.updateOne({ $or: [{ _id: uid }, { uid }] }, { $set: { status: 'suspended' } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User document not found' });
    }
  } catch {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'User document not found' });
  }
  await recordAudit({
    adminEmail: (req as any).email,
    action: 'user.suspend',
    targetType: 'user',
    targetId: uid,
  });
  res.json({ ok: true, uid, status: 'suspended' });
});

adminRouter.post('/users/:id/unsuspend', requireAdmin, async (req: Request, res: Response) => {
  const uid = req.params.id;
  try {
    const col = await mongoCollection('users');
    const result = await col.updateOne({ $or: [{ _id: uid }, { uid }] }, { $set: { status: 'active' } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User document not found' });
    }
  } catch {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'User document not found' });
  }
  await recordAudit({
    adminEmail: (req as any).email,
    action: 'user.unsuspend',
    targetType: 'user',
    targetId: uid,
  });
  res.json({ ok: true, uid, status: 'active' });
});

adminRouter.get('/api-keys', requireAdmin, async (req: Request, res: Response) => {
  const keys = await getAllKeys();
  const events = await analyticsService.queryEvents(daysAgoKey(30));
  const usageByKey = new Map<string, number>();
  events.forEach((e) => {
    if (e.apiKeyId) usageByKey.set(e.apiKeyId, (usageByKey.get(e.apiKeyId) || 0) + 1);
  });

  const usersByUid = new Map<string, Record<string, any>>();
  try {
    const col = await mongoCollection('users');
    const docs = await col.find({}).toArray();
    docs.forEach((doc) => {
      const data = doc;
      if (data.uid) usersByUid.set(String(data.uid), data);
    });
  } catch {
    // dev mode
  }

  const page = clampInt(req.query.page, 1, 1, 100000);
  const pageSize = clampInt(req.query.pageSize, 25, 1, 100);
  const statusFilter = String(req.query.status || '');
  const q = String(req.query.search || '').toLowerCase();

  let rows = keys
    .map((k) => {
      const userDoc = usersByUid.get(String(k.user_id || ''));
      return {
        id: k.id,
        keyPrefix: k.key_prefix,
        name: k.name,
        userId: k.user_id,
        uid: maskUid(String(k.user_id || '')),
        email: userDoc?.email || '',
        plan: normTier(userDoc?.planTier || 'FREE'),
        status: String(k.status || 'active'),
        created_at: k.created_at,
        last_used_at: k.last_used_at,
        expires_at: k.expires_at,
        revoked_at: k.revoked_at,
        keyUsage30d: usageByKey.get(k.id) || 0,
      };
    })
    .sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0));

  if (statusFilter) rows = rows.filter((k) => k.status === statusFilter);
  if (q) {
    rows = rows.filter(
      (k) =>
        String(k.keyPrefix || '').toLowerCase().includes(q) ||
        String(k.name || '').toLowerCase().includes(q) ||
        String(k.email || '').toLowerCase().includes(q)
    );
  }

  const total = rows.length;
  const start = (page - 1) * pageSize;
  res.json({
    total,
    page,
    pageSize,
    keys: rows.slice(start, start + pageSize),
  });
});

adminRouter.patch('/api-keys/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = req.params.id;
  const action = String(req.body?.action || '');
  const col = await mongoCollection('mcp_api_keys');
  const keyId: any = (() => {
    try {
      return new ObjectId(id);
    } catch {
      return id;
    }
  })();
  const doc = await col.findOne({ _id: keyId }).catch(() => null);
  if (!doc) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'API key not found' });
  }
  const docData = doc;

  let patch: Record<string, any> = {};
  switch (action) {
    case 'revoke':
      patch = { status: 'revoked', revoked_at: Date.now() };
      break;
    case 'disable':
      patch = { status: 'disabled' };
      break;
    case 'enable':
      patch = { status: 'active', revoked_at: null };
      break;
    case 'restore':
      patch = { status: 'active', revoked_at: null };
      break;
    default:
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'action must be revoke|disable|enable|restore' });
  }

  await col.updateOne({ _id: keyId }, { $set: patch });
  await recordAudit({
    adminEmail: (req as any).email,
    action: `api_key.${action}`,
    targetType: 'api_key',
    targetId: id,
    meta: { keyPrefix: docData.key_prefix || '' },
  });
  res.json({ ok: true, id, status: patch.status });
});

adminRouter.delete('/api-keys/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = req.params.id;
  const col = await mongoCollection('mcp_api_keys');
  const keyId: any = (() => {
    try {
      return new ObjectId(id);
    } catch {
      return id;
    }
  })();
  const doc = await col.findOne({ _id: keyId }).catch(() => null);
  if (!doc) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'API key not found' });
  }
  await col.deleteOne({ _id: keyId });
  await recordAudit({
    adminEmail: (req as any).email,
    action: 'api_key.delete_permanent',
    targetType: 'api_key',
    targetId: id,
    meta: { keyPrefix: doc.key_prefix || '', owner: doc.user_id || '' },
  });
  res.json({ ok: true, id, deleted: true });
});

adminRouter.get('/tools', requireAdmin, async (req: Request, res: Response) => {
  const states = await configService.getToolStates();
  const range = parseRange(req.query as Record<string, any>);
  const requests = await telemetryService.queryRequests({ fromTs: range.fromTs, toTs: range.toTs, page: 1, pageSize: 50000 });
  const items = requests.items;
  const usageMap: Record<string, { total:number; success:number; failed:number; errors:number; errorRate:number; avgResponseTimeMs:number; lastUsed:number; uniqueUsers:number }> = {};

  for (const e of items) {
    const name = e.toolName || e.method || 'unknown';
    if (!usageMap[name]) usageMap[name]={total:0,success:0,failed:0,errors:0,errorRate:0,avgResponseTimeMs:0,lastUsed:0,uniqueUsers:0};
    usageMap[name].total++;
    if (e.success) usageMap[name].success++; else { usageMap[name].failed++; usageMap[name].errors++; }
    if (e.timestamp > usageMap[name].lastUsed) usageMap[name].lastUsed = e.timestamp;
  }

  for (const k of Object.keys(usageMap)) {
    const u=usageMap[k];
    u.errorRate = u.total? (u.errors/u.total)*100:0;
    const tt = items.filter((e:any)=>(e.toolName||e.method||'unknown')===k && typeof e.latencyMs==='number'&&e.latencyMs>0);
    u.avgResponseTimeMs = tt.length? Math.round(tt.reduce((s,n:any)=>s+n.latencyMs,0)/tt.length):0;
    const users = new Set(items.filter((e:any)=>(e.toolName||e.method||'unknown')===k).map((e:any)=>e.userId||e.apiKeyId).filter(Boolean));
    u.uniqueUsers = users.size;
  }

  const tools = Object.keys(states).map((name) => {
    const usage = usageMap[name] || {
      total: 0,
      success: 0,
      failed: 0,
      errors: 0,
      errorRate: 0,
      uniqueUsers: 0,
      avgResponseTimeMs: 0,
      lastUsed: 0,
    } as any;
    return {
      ...usage,
      name,
      enabled: states[name],
      category: classifyTool(name),
      errorRate: Math.round(((usage as any).errorRate || 0) * 100) / 100,
    };
  });

  res.json({ tools });
});

function classifyTool(name: string): string {
  if (name.includes('search')) return 'search';
  if (name.includes('component')) return 'component';
  if (name.includes('template')) return 'template';
  if (name.includes('animation')) return 'animation';
  if (name.includes('dependencies')) return 'dependencies';
  if (name.includes('category')) return 'catalog';
  return 'utility';
}

adminRouter.patch('/tools/:name', requireAdmin, async (req: Request, res: Response) => {
  const name = req.params.name;
  const enabled = Boolean(req.body?.enabled);
  const states = await configService.getToolStates();
  if (!(name in states)) {
    return res.status(404).json({ error: 'NOT_FOUND', message: `Unknown tool: ${name}` });
  }
  await configService.setTool(name, enabled);
  await recordAudit({
    adminEmail: (req as any).email,
    action: enabled ? 'tool.enable' : 'tool.disable',
    targetType: 'tool',
    targetId: name,
  });
  res.json({ ok: true, name, enabled });
});

adminRouter.get('/components', requireAdmin, async (req: Request, res: Response) => {
  const range = parseRange(req.query as Record<string, any>);
  const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
  const stats = aggregateEvents(events);
  const all = componentService.getAllComponents();
  const premium = all.filter((c) => c.isPremium).length;

  const q = String(req.query.search || '').toLowerCase();
  const catalog = all
    .filter((c) => !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
    .slice(0, 100)
    .map((c) => {
      const usage = stats.topComponents.find((t) => t.id === c.id);
      return {
        id: c.id,
        name: c.name,
        category: c.category,
        isPremium: c.isPremium,
        usageCount: usage?.count || 0,
        uniqueUsers: usage?.uniqueUsers || 0,
        codeFetches: usage?.codeFetches || 0,
      };
    })
    .sort((a, b) => b.usageCount - a.usageCount);

  res.json({
    range,
    total: all.length,
    premiumCount: premium,
    usedComponents: stats.topComponents.length,
    requestedComponentCalls: stats.topComponents.reduce((n, c) => n + c.count, 0),
    topComponents: stats.topComponents.map((c) => {
      const meta = componentService.getComponentMeta(c.id);
      return { ...c, title: meta?.title || c.id, category: meta?.category || 'unknown', isPremium: meta?.isPremium ?? false };
    }),
    catalog,
    templates: componentService.getTemplateCatalog(),
  });
});

adminRouter.get('/search', requireAdmin, async (req: Request, res: Response) => {
  const range = parseRange(req.query as Record<string, any>);
  const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
  const stats = aggregateEvents(events);
  const searchEvents = events.filter((e) => e.event === 'component_search');

  const byDay: Record<string, number> = {};
  searchEvents.forEach((e) => {
    const day = dateKeyFor(e.timestamp);
    byDay[day] = (byDay[day] || 0) + 1;
  });

  res.json({
    range,
    totalSearches: searchEvents.length,
    uniqueSearches: stats.topSearches.length,
    zeroResultSearches: stats.zeroResultSearches,
    searchRate24h: events.filter((e) => e.event === 'component_search' && Date.now() - e.timestamp < 86400000).length,
    topSearches: stats.topSearches,
    byDay: Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  });
});

adminRouter.post('/playground', requireAdmin, async (req: Request, res: Response) => {
  const body = req.body || {};
  const toolName = String(body.tool || '');
  if (!toolName) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'tool is required' });
  }
  const states = await configService.getToolStates();
  if (!(toolName in states)) {
    return res.status(404).json({ error: 'NOT_FOUND', message: `Unknown tool: ${toolName}` });
  }
  if (!states[toolName]) {
    return res.status(403).json({ error: 'TOOL_DISABLED', message: `Tool disabled: ${toolName}` });
  }
  const instance = TOOLS.find((t) => t.name === toolName);
  if (!instance) {
    return res.status(404).json({ error: 'NOT_FOUND', message: `Unknown tool: ${toolName}` });
  }

  const args = body.arguments && typeof body.arguments === 'object' ? body.arguments : {};
  const startedAt = Date.now();
  const user: McpUser = {
    userId: (req as any).uid,
    email: (req as any).email || '',
    name: '',
    tier: (req as any).tier || 'ADMIN',
    keyId: 'admin-playground',
    keyPrefix: 'admin-playground',
    keyStatus: 'active',
  };

  try {
    const result = await instance.handler(args, { user });
    return res.json({
      ok: true,
      tool: toolName,
      arguments: args,
      result,
      statusCode: 200,
      responseTimeMs: Date.now() - startedAt,
    });
  } catch (err: any) {
    await recordAudit({
      adminEmail: (req as any).email,
      action: 'playground.run_failed',
      targetType: 'tool',
      targetId: toolName,
      meta: { error: String(err?.message || err) },
    });
    return res.json({
      ok: false,
      tool: toolName,
      error: String(err?.message || err),
      statusCode: 500,
      responseTimeMs: Date.now() - startedAt,
    });
  }
});

adminRouter.get('/logs', requireAdmin, async (req: Request, res: Response) => {
  const range = parseRange(req.query as Record<string, any>);
  const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
  const page = clampInt(req.query.page, 1, 1, 100000);
  const pageSize = clampInt(req.query.pageSize, 25, 1, 200);

  const filters: LogFilters = {
    event: str(req.query.event),
    status: req.query.status !== undefined ? String(req.query.status) : undefined,
    result: str(req.query.result),
    search: str(req.query.search),
  };

  const rows = eventsToLogRows(events, filters);

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize).map((e, i) => ({
    ...e,
    id: String((e as any)._id || `${e.timestamp}-${e.event}-${i}-${Math.random().toString(36).slice(2,6)}`),
    userId: maskUid(String(e.userId || '')),
  }));

  res.json({
    total,
    page,
    pageSize,
    range,
    events: pageRows,
    items: pageRows,
  });
});

/**
 * DELETE /api/admin/mcp/logs
 * Purge MCP analytics log events from MongoDB by filter and/or range.
 * When no filters are supplied, `confirm=ALL` is required as a safety guard.
 */
adminRouter.delete('/logs', requireAdmin, async (req: Request, res: Response) => {
  const range = parseRange(req.query as Record<string, any>);
  const filters: LogFilters = {
    event: str(req.query.event),
    status: req.query.status !== undefined ? String(req.query.status) : undefined,
    result: str(req.query.result),
    search: str(req.query.search),
  };
  const hasFilter = Boolean(filters.event || filters.result || filters.search || (filters.status !== undefined && filters.status !== ''));
  const confirm = String(req.query.confirm || '').toUpperCase();

  if (!hasFilter && req.query.from === undefined && req.query.range === undefined && req.query.to === undefined && confirm !== 'ALL') {
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: 'Refusing to delete all logs. Provide a date range/filter, or pass confirm=ALL to purge everything.',
    });
  }

  const col = await mongoCollection('mcp_analytics');
  const docs = await col.find({ date: { $gte: range.fromKey, $lte: range.toKey } }).toArray();

  let deleted = 0;
  let remaining = 0;
  let docsTouched = 0;

  for (const doc of docs) {
    const all: McpEvent[] = Array.isArray(doc.events) ? doc.events : [];
    if (all.length === 0) continue;
    // Keep events that do NOT match; the matched set is purged.
    const survivors = all.filter((e) => !matchesLogFilters(mapLogRow(e), filters));
    const removed = all.length - survivors.length;
    if (removed === 0) {
      remaining += all.length;
      continue;
    }
    docsTouched++;
    deleted += removed;
    remaining += survivors.length;
    if (survivors.length === 0) {
      await col.deleteOne({ _id: doc._id });
    } else {
      await col.updateOne({ _id: doc._id }, { $set: { events: survivors } });
    }
  }

  AnalyticsService.invalidateQueryCache();

  await recordAudit({
    adminEmail: (req as any).email,
    action: 'logs.delete',
    targetType: 'logs',
    meta: {
      event: filters.event || null,
      status: filters.status ?? null,
      result: filters.result || null,
      search: filters.search || null,
      fromKey: range.fromKey,
      toKey: range.toKey,
      deleted,
      docsTouched,
    },
  });

  res.json({ ok: true, deleted, remaining, docsTouched, range, filters });
});

/**
 * DELETE /api/admin/mcp/logs/item?eventId=...&docId=...
 * Per-row delete for log entries. Finds the specific event in the daily bucket.
 */
adminRouter.delete('/logs/item', requireAdmin, async (req: Request, res: Response) => {
  const eventId = str(req.query.eventId);
  const docId = str(req.query.docId);
  if (!eventId && !docId) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'eventId or docId required' });
  }
  const col = await mongoCollection('mcp_analytics');
  const docs = docId ? await col.find({ _id: (()=>{try{return new ObjectId(docId)}catch{return docId}})() as any }).toArray() : await col.find().toArray();
  let deleted = 0;
  for (const d of docs) {
    const all: McpEvent[] = Array.isArray(d.events) ? d.events : [];
    const survivors = all.filter((e:any)=> String((e as any)._id||e.timestamp||'') !== eventId);
    if (survivors.length !== all.length) {
      deleted = all.length - survivors.length;
      if (survivors.length===0) await col.deleteOne({_id:d._id});
      else await col.updateOne({_id:d._id}, {$set:{events:survivors}});
      break;
    }
  }
  AnalyticsService.invalidateQueryCache();
  res.json({ ok:true, deleted });
});

adminRouter.get('/security', requireAdmin, async (req: Request, res: Response) => {
  const cfg = await configService.get();
  const events = await analyticsService.queryEvents(daysAgoKey(2));
  const recent = events.sort((a, b) => b.timestamp - a.timestamp);

  const failures = recent.filter((e) => e.event === 'auth_failure');
  const rateLimited = recent.filter((e) => e.event === 'rate_limit');
  const denied = recent.filter((e) => e.event === 'premium_denied');

  const byKey = new Map<string, number>();
  rateLimited.forEach((e) => {
    const k = e.keyPrefix || 'unknown';
    byKey.set(k, (byKey.get(k) || 0) + 1);
  });

  const securityEvents = [...failures, ...rateLimited, ...denied].slice(0, 50).map((e) => ({
    event: e.event,
    timestamp: e.timestamp,
    keyPrefix: e.keyPrefix || '-',
    tier: e.tier || '-',
    tool: e.tool || '-',
    errorCode: e.errorCode || '-',
  }));

  res.json({
    authEnabled: cfg.authEnabled,
    rateLimitFree: cfg.rateLimitFree,
    rateLimitPro: cfg.rateLimitPro,
    summary: {
      authFailures24h: failures.filter((e) => Date.now() - e.timestamp < 86400000).length,
      rateLimitEvents24h: rateLimited.filter((e) => Date.now() - e.timestamp < 86400000).length,
      premiumDenied24h: denied.filter((e) => Date.now() - e.timestamp < 86400000).length,
      totalSecurityEvents: failures.length + rateLimited.length + denied.length,
    },
    rateLimitTopKeys: Array.from(byKey.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyPrefix, count]) => ({ keyPrefix, count })),
    recentEvents: securityEvents,
  });
});

adminRouter.get('/health', requireAdmin, async (req: Request, res: Response) => {
  let dbConnected = false;
  try {
    const col = await mongoCollection('mcp_analytics');
    await col.findOne({});
    dbConnected = true;
  } catch {
    dbConnected = false;
  }
  const cfg = await configService.get();
  const toolDrift = await configService.getToolDrift();

  const collections = await (async () => {
    const names = ['mcp_analytics', 'mcp_api_keys', 'mcp_audit', 'mcp_config', 'users', 'activity_logs'];
    const out: Array<{ name: string; count: number; lastEventAt: number | null }> = [];
    for (const name of names) {
      let count = 0;
      let lastEventAt: number | null = null;
      if (dbConnected) {
        try {
          const col = await mongoCollection(name);
          count = await col.countDocuments({});
          const last = await col.find({}).sort({ createdAt: -1 }).limit(1).toArray();
          if (last[0] && typeof (last[0] as any).createdAt === 'number') {
            lastEventAt = (last[0] as any).createdAt;
          }
        } catch {
          // collection may not exist yet — count stays 0
        }
      }
      out.push({ name, count, lastEventAt });
    }
    return out;
  })();

  res.json({
    status: dbConnected ? 'ok' : 'degraded',
    dbConnected,
    uptime: Math.round(process.uptime()),
    timestamp: Date.now(),
    service: 'ui-hub-mcp',
    version: '1.0.0',
    memory: {
      rss: process.memoryUsage().rss,
      heapUsed: process.memoryUsage().heapUsed,
    },
    collections,
    config: {
      authEnabled: cfg.authEnabled,
      analyticsEnabled: cfg.analyticsEnabled,
      loggingEnabled: cfg.loggingEnabled,
      rateLimitFree: cfg.rateLimitFree,
      rateLimitPro: cfg.rateLimitPro,
      // Reconciled against the code registry rather than raw config counts.
      // Raw counts conflated "tools stored in Mongo" with "tools that exist",
      // so a stale key and a missing entry were indistinguishable from healthy.
      tools: toolDrift,
    },
  });
});

adminRouter.get('/alerts', requireAdmin, async (req: Request, res: Response) => {
  const alerts = await computeAlerts();
  const resolved = await getResolvedAlerts();
  res.json({
    alerts: alerts.map((a) => ({ ...a, resolved: resolved.includes(a.key) })),
  });
});

adminRouter.post('/alerts/:key/resolve', requireAdmin, async (req: Request, res: Response) => {
  const key = req.params.key;
  const alerts = await computeAlerts();
  if (!alerts.some((a) => a.key === key)) {
    return res.status(404).json({ error: 'NOT_FOUND', message: `Alert rule not found: ${key}` });
  }
  const resolved = await getResolvedAlerts();
  if (!resolved.includes(key)) {
    resolved.push(key);
    await setResolvedAlerts(resolved);
  }
  await recordAudit({
    adminEmail: (req as any).email,
    action: 'alert.resolve',
    targetType: 'alert',
    targetId: key,
  });
  res.json({ ok: true, key, resolved: true });
});

adminRouter.post('/alerts/:key/unresolve', requireAdmin, async (req: Request, res: Response) => {
  const key = req.params.key;
  const resolved = await getResolvedAlerts();
  const next = resolved.filter((k) => k !== key);
  await setResolvedAlerts(next);
  await recordAudit({
    adminEmail: (req as any).email,
    action: 'alert.unresolve',
    targetType: 'alert',
    targetId: key,
  });
  res.json({ ok: true, key, resolved: false });
});

adminRouter.get('/settings', requireAdmin, async (req: Request, res: Response) => {
  const cfg = await configService.get();
  const drift = await configService.getToolDrift();
  res.json({
    rateLimitFree: cfg.rateLimitFree,
    rateLimitPro: cfg.rateLimitPro,
    authEnabled: cfg.authEnabled,
    analyticsEnabled: cfg.analyticsEnabled,
    loggingEnabled: cfg.loggingEnabled,
    tools: cfg.tools,
    // Effective on/off state for every registered tool, plus what the stored
    // config is missing or referencing. Callers previously had to re-derive
    // fail-open semantics themselves and had no way to see stale keys.
    toolStates: await configService.getToolStates(),
    toolDrift: drift,
    settingsDoc: 'mcp_config/app',
  });
});

adminRouter.put('/settings', requireAdmin, async (req: Request, res: Response) => {
  const body = req.body || {};
  const partial: Partial<any> = {};

  if (body.rateLimitFree !== undefined) {
    const n = parseInt(body.rateLimitFree, 10);
    if (isNaN(n) || n < 1 || n > 1000000) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'rateLimitFree must be an integer between 1 and 1000000' });
    }
    partial.rateLimitFree = n;
  }
  if (body.rateLimitPro !== undefined) {
    const n = parseInt(body.rateLimitPro, 10);
    if (isNaN(n) || n < 1 || n > 1000000) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'rateLimitPro must be an integer between 1 and 1000000' });
    }
    partial.rateLimitPro = n;
  }
  if (body.authEnabled !== undefined) partial.authEnabled = Boolean(body.authEnabled);
  if (body.analyticsEnabled !== undefined) partial.analyticsEnabled = Boolean(body.analyticsEnabled);
  if (body.loggingEnabled !== undefined) partial.loggingEnabled = Boolean(body.loggingEnabled);

  if (partial.rateLimitFree && partial.rateLimitPro && partial.rateLimitFree > partial.rateLimitPro) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'rateLimitFree cannot exceed rateLimitPro' });
  }

  const cfg = await configService.update(partial);
  await recordAudit({
    adminEmail: (req as any).email,
    action: 'settings.update',
    targetType: 'settings',
    meta: { fields: Object.keys(partial) },
  });
  res.json(cfg);
});

adminRouter.get('/audit', requireAdmin, async (req: Request, res: Response) => {
  const page = clampInt(req.query.page, 1, 1, 100000);
  const pageSize = clampInt(req.query.pageSize, 25, 1, 100);
  const all = await listAudit(1000);
  const total = all.length;
  const start = (page - 1) * pageSize;
  res.json({
    total,
    page,
    pageSize,
    entries: all.slice(start, start + pageSize),
  });
});

function toCsv(headers: string[], rows: Array<Array<string | number | boolean>>): string {
  const esc = (v: any) => {
    const s = String(v === undefined || v === null ? '' : v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((row) => row.map(esc).join(',')).join('\n');
}

adminRouter.get('/export', requireAdmin, async (req: Request, res: Response) => {
  const type = String(req.query.type || 'events');
  const format = String(req.query.format || 'json').toLowerCase();
  const range = parseRange(req.query as Record<string, any>);

  await recordAudit({
    adminEmail: (req as any).email,
    action: 'export',
    targetType: 'export',
    meta: { type, format, fromKey: range.fromKey, toKey: range.toKey },
  });

  const mime = format === 'csv' ? 'text/csv' : 'application/json';
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `attachment; filename="ui-hub-mcp-${type}-${stamp}.${format === 'csv' ? 'csv' : 'json'}"`);

  if (type === 'logs') {
    const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
    const filters: LogFilters = {
      event: str(req.query.event),
      status: req.query.status !== undefined ? String(req.query.status) : undefined,
      result: str(req.query.result),
      search: str(req.query.search),
    };
    const rows = eventsToLogRows(events, filters);
    if (format === 'csv') {
      return res.send(logsToCsv(rows, maskUid));
    }
    return res.json({ type, range, total: rows.length, events: rows });
  }

  if (type === 'events') {
    const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
    const sorted = events.sort((a, b) => a.timestamp - b.timestamp);
    if (format === 'csv') {
      const headers = ['timestamp', 'event', 'userId', 'apiKeyId', 'keyPrefix', 'tier', 'tool', 'componentId', 'query', 'statusCode', 'responseTimeMs', 'success', 'errorCode'];
      const rows = sorted.map((e) => [
        e.timestamp,
        e.event,
        maskUid(String(e.userId || '')),
        e.apiKeyId || '',
        e.keyPrefix || '',
        e.tier || '',
        e.tool || '',
        e.componentId || '',
        e.query || '',
        e.statusCode ?? '',
        e.responseTimeMs ?? '',
        e.success === undefined ? '' : e.success,
        e.errorCode || '',
      ]);
      return res.send(toCsv(headers, rows));
    }
    return res.json({ type, range, total: sorted.length, events: sorted });
  }

  if (type === 'keys') {
    const keys = (await getAllKeys()).slice(0, 2000);
    if (format === 'csv') {
      const headers = ['id', 'name', 'keyPrefix', 'userId', 'status', 'created_at', 'last_used_at', 'expires_at', 'revoked_at'];
      const rows = keys.map((k) => [
        k.id,
        k.name || '',
        k.key_prefix || '',
        maskUid(String(k.user_id || '')),
        String(k.status || 'active'),
        k.created_at ?? '',
        k.last_used_at ?? '',
        k.expires_at ?? '',
        k.revoked_at ?? '',
      ]);
      return res.send(toCsv(headers, rows));
    }
    return res.json({
      type,
      range,
      total: keys.length,
      keys: keys.map((k) => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.key_prefix,
        userId: maskUid(String(k.user_id || '')),
        status: String(k.status || 'active'),
        created_at: k.created_at,
        last_used_at: k.last_used_at,
        expires_at: k.expires_at,
        revoked_at: k.revoked_at,
      })),
    });
  }

  const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
  const stats = aggregateEvents(events);

  if (type === 'components') {
    const rows = stats.topComponents.map((c) => {
      const meta = componentService.getComponentMeta(c.id);
      return {
        id: c.id,
        title: meta?.title || c.id,
        category: meta?.category || 'unknown',
        isPremium: meta?.isPremium ?? false,
        count: c.count,
        searches: c.searches,
        codeFetches: c.codeFetches,
        uniqueUsers: c.uniqueUsers,
        freeCount: c.freeCount,
        proCount: c.proCount,
      };
    });
    if (format === 'csv') {
      const headers = ['id', 'title', 'category', 'isPremium', 'count', 'codeFetches', 'uniqueUsers', 'freeCount', 'proCount'];
      const data = rows.map((r) => [r.id, r.title, r.category, r.isPremium, r.count, r.codeFetches, r.uniqueUsers, r.freeCount, r.proCount]);
      return res.send(toCsv(headers, data));
    }
    return res.json({ type, range, total: rows.length, components: rows });
  }

  if (type === 'search') {
    if (format === 'csv') {
      const headers = ['query', 'count', 'zeroResults'];
      const data = stats.topSearches.map((s) => [s.query, s.count, s.zeroResults]);
      return res.send(toCsv(headers, data));
    }
    return res.json({
      type,
      range,
      totalSearches: stats.topSearches.length,
      topSearches: stats.topSearches,
      zeroResultSearches: stats.zeroResultSearches,
      byTool: stats.byTool,
    });
  }

  if (type === 'diagnostics') {
    const resolutionState = str(req.query.resolutionState);
    const diag = await queryDiagnostics({
      resolutionState: resolutionState === 'resolved' || resolutionState === 'unresolved' ? resolutionState : undefined,
      fromTs: range.fromTs,
      toTs: range.toTs,
      pageSize: 5000,
    });
    const rows = diag.items.map((d) => ({
      id: d.id,
      fingerprint: d.fingerprint,
      category: d.category,
      severity: d.severity,
      resolution: d.resolution,
      title: d.title,
      errorSummary: d.errorSummary,
      tool: d.tool || '',
      method: d.method || '',
      resourceType: d.resourceType || '',
      resourceId: d.resourceId || '',
      query: d.query || '',
      statusCode: d.statusCode ?? '',
      errorCode: d.errorCode || '',
      clientName: d.clientName || '',
      occurrences: d.occurrences,
      firstSeen: d.firstSeen,
      lastSeen: d.lastSeen,
      notes: d.notes || '',
    }));
    if (format === 'csv') {
      const headers = ['id', 'fingerprint', 'category', 'severity', 'resolution', 'title', 'errorSummary', 'tool', 'method', 'resourceType', 'resourceId', 'query', 'statusCode', 'errorCode', 'clientName', 'occurrences', 'firstSeen', 'lastSeen', 'notes'];
      return res.send(toCsv(headers, rows as any[]));
    }
    return res.json({ type, range, total: rows.length, diagnostics: rows });
  }

  if (type === 'activity') {
    const reqs = await telemetryService.queryRequests({
      fromTs: range.fromTs,
      toTs: range.toTs,
      status: str(req.query.status),
      errorCategory: str(req.query.errorCategory),
      toolName: str(req.query.toolName),
      client: str(req.query.client),
      page: 1,
      pageSize: 50000,
    });
    const rows = (reqs.items as any[]).map((e) => ({
      id: e._id || e.id || '',
      timestamp: e.timestamp,
      status: e.status,
      success: e.success,
      method: e.method,
      toolName: e.toolName || '',
      clientName: e.clientName || '',
      clientVersion: e.clientVersion || '',
      userId: maskUid(String(e.userId || '')),
      keyPrefix: e.keyPrefix || '',
      tier: e.tier || '',
      resourceType: e.resourceType || '',
      resourceId: e.resourceId || '',
      query: e.query || '',
      statusCode: e.statusCode ?? '',
      errorCode: e.errorCode || '',
      errorCategory: e.errorCategory || '',
      latencyMs: e.latencyMs ?? '',
      resultCount: e.resultCount ?? '',
      correlationId: e.correlationId || '',
    }));
    if (format === 'csv') {
      const headers = ['id', 'timestamp', 'status', 'success', 'method', 'toolName', 'clientName', 'userId', 'keyPrefix', 'tier', 'resourceType', 'resourceId', 'query', 'statusCode', 'errorCode', 'errorCategory', 'latencyMs', 'resultCount', 'correlationId'];
      return res.send(toCsv(headers, rows as any[]));
    }
    return res.json({ type, range, total: rows.length, activity: rows });
  }

  if (type === 'audit') {
    const audit = (await listAudit(5000)) as any[];
    const rows = audit.map((e: any) => ({
      id: e.id,
      at: e.at,
      adminEmail: e.adminEmail,
      action: e.action,
      targetType: e.targetType,
      targetId: e.targetId || '',
      meta: e.meta ? JSON.stringify(e.meta) : '',
    }));
    if (format === 'csv') {
      const headers = ['id', 'at', 'adminEmail', 'action', 'targetType', 'targetId', 'meta'];
      return res.send(toCsv(headers, rows as any[]));
    }
    return res.json({ type, total: rows.length, audit: rows });
  }

  if (type === 'users') {
    const users = await buildUsers(events);
    if (format === 'csv') {
      const headers = ['email', 'uid', 'plan', 'status', 'keyCount', 'activeKeyCount', 'requests', 'lastActive'];
      const rows = users.map((u) => [u.email, maskUid(u.uid), u.plan, u.status, u.keyCount, u.activeKeyCount, u.requests, u.lastActive ?? '']);
      return res.send(toCsv(headers, rows));
    }
    return res.json({ type, range, total: users.length, users });
  }

  if (format === 'csv') {
    const headers = ['date', 'requests', 'uniqueUsers', 'errorRate', 'avgResponseTimeMs', 'rateLimitEvents', 'premiumDenied', 'authFailures'];
    const rows = [[range.fromKey, stats.requests, stats.uniqueUsers, stats.errorRate.toFixed(4), stats.avgResponseTimeMs, stats.rateLimitEvents, stats.premiumDenied, stats.authFailures]];
    return res.send(toCsv(headers, rows));
  }
  return res.json({ type, range, stats });
});

// ─────────────────────────────────────────────────────────────────────────────
// Observability (additive): Live Activity, AI Search Analytics, Diagnostics,
// and the actionable Alerts engine. All endpoints are additive; the legacy
// `/alerts` resolve/unresolve workflow above is untouched.
// ─────────────────────────────────────────────────────────────────────────────

const throttleMap = new Map<string, number>();
function underThrottle(key: string, minMs: number): boolean {
  const now = Date.now();
  const last = throttleMap.get(key) || 0;
  if (now - last < minMs) return false;
  throttleMap.set(key, now);
  if (throttleMap.size > 1000) {
    for (const [k, v] of throttleMap) {
      if (now - v > 60000) throttleMap.delete(k);
    }
  }
  return true;
}

function str(v: any): string | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  return String(v);
}

function summarizeRequests(items: Array<Record<string, any>>): Record<string, any> {
  const byStatus: Record<string, number> = {};
  const byClient: Record<string, number> = {};
  let latencySum = 0;
  let latencyCount = 0;
  for (const e of items) {
    const s = e.status || 'unknown';
    byStatus[s] = (byStatus[s] || 0) + 1;
    const c = e.clientName || 'Unknown MCP client';
    byClient[c] = (byClient[c] || 0) + 1;
    if (typeof e.latencyMs === 'number') {
      latencySum += e.latencyMs;
      latencyCount++;
    }
  }
  return { byStatus, byClient, avgLatencyMs: latencyCount ? Math.round(latencySum / latencyCount) : 0 };
}

/**
 * Resolve the human-friendly owner name and API-key prefix for activity rows.
 * Telemetry stores only opaque ids; admins need to see WHO made the request and
 * WHICH key. Best-effort: a dev/no-DB environment simply leaves fields blank.
 */
async function enrichActivityItems(items: Array<Record<string, any>>): Promise<void> {
  if (!Array.isArray(items) || items.length === 0) return;

  const uids = new Set<string>();
  const keyIds = new Set<string>();
  for (const e of items) {
    if (e.userId) uids.add(String(e.userId));
    if (e.apiKeyId) keyIds.add(String(e.apiKeyId));
  }

  const keyById = new Map<string, { keyPrefix: string; userId: string }>();
  if (keyIds.size > 0) {
    try {
      const col = await mongoCollection('mcp_api_keys');
      const objectIds = Array.from(keyIds)
        .filter((id) => ObjectId.isValid(id) && id.length === 24)
        .map((id) => new ObjectId(id));
      const or: Array<Record<string, any>> = [{ _id: { $in: objectIds as any } }];
      const docs = await col.find({ $or: or }).toArray();
      for (const d of docs as any[]) {
        const id = String(d?._id ?? '');
        if (!keyIds.has(id)) continue;
        keyById.set(id, {
          keyPrefix: String(d.key_prefix || ''),
          userId: String(d.user_id || ''),
        });
        if (d.user_id) uids.add(String(d.user_id));
      }
    } catch {
      // no DB (dev / unconfigured)
    }
  }

  const nameByUid = new Map<string, string>();
  if (uids.size > 0) {
    try {
      const col = await mongoCollection('users');
      const docs = await col.find({ uid: { $in: Array.from(uids) } as any }).toArray();
      for (const d of docs as any[]) {
        const uid = String(d?.uid || '');
        if (!uid) continue;
        nameByUid.set(uid, String(d.displayName || d.name || d.fullName || d.email || ''));
      }
    } catch {
      // no DB (dev / unconfigured)
    }
  }

  for (const e of items) {
    const key = e.apiKeyId ? keyById.get(String(e.apiKeyId)) : undefined;
    if (key) {
      e.keyPrefix = key.keyPrefix;
      if (!e.userId && key.userId) e.userId = key.userId;
    }
    const uid = e.userId ? String(e.userId) : '';
    const name = uid ? nameByUid.get(uid) : '';
    if (name) e.userName = name;
  }
}

adminRouter.get('/activity', requireAdmin, async (req: Request, res: Response) => {
  const range = parseRange(req.query as Record<string, any>);
  const page = clampInt(req.query.page, 1, 1, 100000);
  const pageSize = clampInt(req.query.pageSize, 50, 1, 200);
  const result = await telemetryService.queryRequests({
    fromTs: range.fromTs,
    toTs: range.toTs,
    userId: str(req.query.userId),
    client: str(req.query.client),
    method: str(req.query.method),
    toolName: str(req.query.toolName),
    status: str(req.query.status),
    resourceType: str(req.query.resourceType),
    errorCategory: str(req.query.errorCategory),
    page,
    pageSize,
  });
  const items = result.items as unknown as Array<Record<string, any>>;
  await enrichActivityItems(items);
  res.json({
    ...result,
    items,
    range,
    summary: summarizeRequests(items),
    note: result.total === 0 ? 'No telemetry captured yet for this range (instrumentation is live).' : undefined,
  });
});

adminRouter.get('/activity/:eventId', requireAdmin, async (req: Request, res: Response) => {
  const item = await telemetryService.getRequest(req.params.eventId);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Request event not found' });
  res.json({ item });
});

adminRouter.get('/search-analytics', requireAdmin, async (req: Request, res: Response) => {
  const range = parseRange(req.query as Record<string, any>);
  const page = clampInt(req.query.page, 1, 1, 100000);
  const pageSize = clampInt(req.query.pageSize, 50, 1, 200);
  const zeroResultsParam = str(req.query.zeroResults);

  const result = await telemetryService.querySearches({
    fromTs: range.fromTs,
    toTs: range.toTs,
    userId: str(req.query.userId),
    resourceType: str(req.query.resourceType),
    zeroResults: zeroResultsParam === undefined ? undefined : zeroResultsParam === 'true',
    query: str(req.query.q),
    page,
    pageSize,
  });

  const summary: Record<string, any> = {
    totalSearches: 0,
    zeroResults: 0,
    zeroResultRate: 0,
    fetched: 0,
    codeRetrieved: 0,
    fetchThroughRate: 0,
    topQueries: [] as Array<{ query: string; count: number; zeroResults: number }>,
  };
  try {
    const col = await mongoCollection(SEARCH_EVENTS_COLLECTION);
    const match = { timestamp: { $gte: range.fromTs, $lte: range.toTs } };
    const [totalSearches, zeroResults, fetched, codeRetrieved] = await Promise.all([
      col.countDocuments(match),
      col.countDocuments({ ...match, zeroResults: true }),
      col.countDocuments({ ...match, fetched: true }),
      col.countDocuments({ ...match, codeRetrieved: true }),
    ]);
    const agg = await col
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: '$queryNormalized',
            count: { $sum: 1 },
            zeroResults: { $sum: { $cond: ['$zeroResults', 1, 0] } },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 25 },
      ])
      .toArray();
    summary.totalSearches = totalSearches;
    summary.zeroResults = zeroResults;
    summary.zeroResultRate = totalSearches ? Number((zeroResults / totalSearches).toFixed(4)) : 0;
    summary.fetched = fetched;
    summary.codeRetrieved = codeRetrieved;
    summary.fetchThroughRate = totalSearches ? Number((fetched / totalSearches).toFixed(4)) : 0;
    summary.topQueries = agg.map((a: any) => ({
      query: a._id || '(empty)',
      count: a.count,
      zeroResults: a.zeroResults,
    }));
  } catch (err: any) {
    console.error('[AdminSearchAnalytics] aggregation failed:', err?.message);
  }

  res.json({
    ...result,
    range,
    summary,
    note: result.total === 0 ? 'No search telemetry captured yet for this range (instrumentation is live).' : undefined,
  });
});

adminRouter.get('/fix-center', requireAdmin, async (req: Request, res: Response) => {
  const range = parseRange(req.query as Record<string, any>);
  const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
  const cfg = await configService.get();
  const toolStates = await configService.getToolStates();

  const signals = deriveSignals(events, {
    authEnabled: cfg.authEnabled,
    analyticsEnabled: cfg.analyticsEnabled,
    loggingEnabled: cfg.loggingEnabled,
    tools: toolStates,
  });

  const diagResult = await queryDiagnostics({ resolutionState: 'unresolved', pageSize: 200 });

  const diagItems = diagResult.items.map((d) => ({
    id: `diag:${d.id}`,
    source: 'diagnostic' as const,
    category: String(d.category),
    severity: String(d.severity),
    title: d.title,
    summary: d.errorSummary || 'A failure was recorded for this fingerprint.',
    occurrences: d.occurrences,
    lastSeen: d.lastSeen,
    firstSeen: d.firstSeen,
    evidence: {
      fingerprint: d.fingerprint,
      method: d.method,
      tool: d.tool,
      resourceType: d.resourceType,
      resourceId: d.resourceId,
      query: d.query,
      url: d.url,
      statusCode: d.statusCode,
      errorCode: d.errorCode,
      clientName: d.clientName,
      sampleEvents: d.sampleEvents,
    },
    fixPrompt: buildFixPrompt(d),
    href: `/admin/mcp/diagnostics/${d.id}`,
    status: d.resolution || 'open',
    resolution: d.resolution || 'open',
    diagnosticId: d.id,
    fingerprint: d.fingerprint,
  }));

  const signalItems = signals.map((s) => ({
    id: `signal:${s.key}`,
    source: 'signal' as const,
    category: s.category,
    severity: s.severity,
    title: s.title,
    summary: s.summary,
    occurrences: s.occurrences,
    lastSeen: s.lastSeen,
    firstSeen: null as number | null,
    evidence: s.evidence,
    fixPrompt: buildSignalPrompt(s),
    href: null as string | null,
  }));

  const severityRank: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  const items = [...diagItems, ...signalItems].sort(
    (a, b) =>
      (severityRank[a.severity] ?? 3) - (severityRank[b.severity] ?? 3) ||
      (b.lastSeen || 0) - (a.lastSeen || 0)
  );

  const countBy = (key: 'source' | 'severity' | 'category') => {
    const out: Record<string, number> = {};
    for (const item of items) out[item[key]] = (out[item[key]] || 0) + 1;
    return out;
  };

  res.json({
    range,
    generatedAt: Date.now(),
    totals: {
      unresolvedDiagnostics: diagItems.length,
      activeSignals: signalItems.length,
      items: items.length,
      bySource: countBy('source'),
      bySeverity: countBy('severity'),
      byCategory: countBy('category'),
    },
    items,
    engineState: await getEngineState(),
  });
});

adminRouter.get('/diagnostics', requireAdmin, async (req: Request, res: Response) => {
  const stateParam = str(req.query.state);
  const result = await queryDiagnostics({
    category: str(req.query.category),
    severity: str(req.query.severity),
    resolutionState: stateParam === 'resolved' ? 'resolved' : stateParam === 'unresolved' ? 'unresolved' : undefined,
    tool: str(req.query.tool),
    resourceType: str(req.query.resourceType),
    fromTs: req.query.from ? new Date(String(req.query.from)).getTime() || undefined : undefined,
    toTs: req.query.to ? new Date(String(req.query.to)).getTime() || undefined : undefined,
    page: clampInt(req.query.page, 1, 1, 100000),
    pageSize: clampInt(req.query.pageSize, 25, 1, 200),
  });
  res.json({ ...result, engineState: await getEngineState() });
});

adminRouter.get('/diagnostics/:id', requireAdmin, async (req: Request, res: Response) => {
  const item = await getDiagnostic(req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Diagnostic not found' });
  res.json({ item });
});

adminRouter.post('/diagnostics/:id/generate-fix-prompt', requireAdmin, async (req: Request, res: Response) => {
  if (!underThrottle(`prompt:${(req as any).email || req.ip}`, 3000)) {
    return res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED', message: 'Please wait a moment before generating another prompt.' });
  }
  const item = await getDiagnostic(req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Diagnostic not found' });
  const prompt = buildFixPrompt(item);
  await recordAudit({
    adminEmail: (req as any).email,
    action: 'diagnostic.generate_fix_prompt',
    targetType: 'diagnostic',
    targetId: item.fingerprint,
  });
  res.json({ id: item.id, fingerprint: item.fingerprint, category: item.category, prompt });
});

adminRouter.post('/diagnostics/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const status = String(req.body?.status || '');
  try {
    const item = await updateDiagnosticStatus(req.params.id, status, { notes: req.body?.notes });
    if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Diagnostic not found' });
    await recordAudit({
      adminEmail: (req as any).email,
      action: 'diagnostic.status',
      targetType: 'diagnostic',
      targetId: item.fingerprint,
      meta: { status },
    });
    res.json({ item });
  } catch (err: any) {
    const message =
      err?.message === 'invalid_status'
        ? 'status must be one of: open, investigating, resolved, reopened'
        : err?.message || 'Failed to update status';
    return res.status(400).json({ error: 'BAD_REQUEST', message });
  }
});

adminRouter.get('/alerts/rules', requireAdmin, async (_req: Request, res: Response) => {
  const rules = await ensureRules();
  res.json({ rules, engineState: await getEngineState() });
});

adminRouter.post('/alerts/rules', requireAdmin, async (req: Request, res: Response) => {
  const rule = await createRule(req.body || {}, (req as any).email || 'admin');
  if (!rule) return res.status(400).json({ error: 'BAD_REQUEST', message: 'Unable to create rule' });
  res.json({ rule });
});

adminRouter.patch('/alerts/rules/:ruleId', requireAdmin, async (req: Request, res: Response) => {
  const rule = await updateRule(req.params.ruleId, req.body || {}, (req as any).email || 'admin');
  if (!rule) return res.status(404).json({ error: 'NOT_FOUND', message: 'Alert rule not found' });
  res.json({ rule });
});

adminRouter.get('/alerts/events', requireAdmin, async (req: Request, res: Response) => {
  const result = await listAlertEvents({
    status: str(req.query.status) as any,
    severity: str(req.query.severity) as any,
    ruleId: str(req.query.ruleId),
    page: clampInt(req.query.page, 1, 1, 100000),
    pageSize: clampInt(req.query.pageSize, 50, 1, 200),
  });
  res.json({ ...result, engineState: await getEngineState() });
});

adminRouter.get('/alerts/events/:id', requireAdmin, async (req: Request, res: Response) => {
  const item = await getAlertEvent(req.params.id);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Alert event not found' });
  res.json({ item });
});

adminRouter.post('/alerts/events/:id/:action', requireAdmin, async (req: Request, res: Response) => {
  const action = req.params.action;
  const valid = ['acknowledge', 'resolve', 'reopen', 'mute'];
  if (!valid.includes(action)) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: `action must be one of: ${valid.join(', ')}` });
  }
  const muteMinutes = req.body?.muteMinutes !== undefined ? clampInt(req.body.muteMinutes, 60, 1, 10080) : undefined;
  const item = await applyAlertAction(req.params.id, action as any, {
    adminEmail: (req as any).email || 'admin',
    notes: req.body?.notes,
    muteMinutes,
  });
  if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Alert event not found' });
  res.json({ item });
});

export { adminRouter, ADMIN_BASE };