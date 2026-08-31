import { Router } from 'express';
import { configService } from '../config/configService.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { analyticsService, aggregateEvents } from '../services/analyticsService.js';
import { recordAudit, listAudit } from '../services/auditService.js';
import { getCollection as mongoCollection } from '../services/mongo.js';
import { componentService } from '../services/componentService.js';
import { TOOLS } from '../tools/index.js';
const adminRouter = Router();
const ADMIN_BASE = '/api/admin/mcp';
function dateKeyFor(ts) {
    const d = new Date(ts);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
function daysAgoKey(days) {
    return dateKeyFor(Date.now() - days * 86400000);
}
function parseRange(query) {
    const now = Date.now();
    const toTs = query.to ? new Date(query.to).getTime() || now : now;
    let fromTs;
    if (query.from) {
        const parsed = new Date(query.from).getTime();
        fromTs = parsed || now - 30 * 86400000;
    }
    else if (query.range && typeof query.range === 'string') {
        const days = parseInt(query.range.replace(/[^0-9]/g, ''), 10) || 30;
        fromTs = now - days * 86400000;
    }
    else {
        fromTs = now - 30 * 86400000;
    }
    return {
        fromKey: dateKeyFor(fromTs),
        toKey: dateKeyFor(toTs),
        fromTs,
        toTs,
    };
}
function clampInt(value, fallback, min, max) {
    const n = parseInt(value, 10);
    if (isNaN(n))
        return fallback;
    return Math.min(max, Math.max(min, n));
}
function maskUid(uid) {
    if (!uid)
        return '-';
    if (uid.length <= 8)
        return uid;
    return `${uid.slice(0, 6)}…${uid.slice(-4)}`;
}
function normTier(t) {
    const s = String(t || '').toUpperCase();
    if (s.startsWith('ADMIN'))
        return 'ADMIN';
    if (s.startsWith('ELITE'))
        return 'ELITE';
    if (s === 'PRO')
        return 'PRO';
    return 'FREE';
}
async function buildUsers(events) {
    const usersByUid = new Map();
    const usersByEmail = new Map();
    try {
        const col = await mongoCollection('users');
        const docs = await col.find({}).toArray();
        docs.forEach((doc) => {
            const data = doc;
            if (data.uid)
                usersByUid.set(String(data.uid), data);
            usersByEmail.set(String(doc._id).toLowerCase(), data);
        });
    }
    catch {
        // dev mode
    }
    let keys = [];
    try {
        const col = await mongoCollection('mcp_api_keys');
        const docs = await col.find({}).toArray();
        keys = docs.map((doc) => ({ id: String(doc._id), ...doc }));
    }
    catch {
        // dev mode
    }
    const requestsByUser = new Map();
    const lastActiveByUser = new Map();
    events.forEach((e) => {
        if (!e.userId)
            return;
        requestsByUser.set(e.userId, (requestsByUser.get(e.userId) || 0) + 1);
        if (e.timestamp > (lastActiveByUser.get(e.userId) || 0)) {
            lastActiveByUser.set(e.userId, e.timestamp);
        }
    });
    const byUid = new Map();
    keys.forEach((key) => {
        const uid = String(key.user_id || '');
        if (!uid)
            return;
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
        if (st === 'active')
            agg.activeKeyCount++;
        if (st === 'revoked')
            agg.revokedKeyCount++;
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
        if (byUid.has(uid))
            return;
        const email = String(doc.email || '').toLowerCase();
        const agg = {
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
    return Array.from(byUid.values()).sort((a, b) => (b.requests - a.requests) || (b.lastActive || 0) - (a.lastActive || 0));
}
async function getAllKeys() {
    try {
        const col = await mongoCollection('mcp_api_keys');
        const docs = await col.find({}).toArray();
        return docs.map((doc) => ({ id: String(doc._id), ...doc }));
    }
    catch {
        return [];
    }
}
async function computeAlerts(eventsArg, keysArg) {
    const alerts = [];
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
    const staleKeys = keys.filter((k) => String(k.status || 'active') === 'active' && k.last_used_at && now - Number(k.last_used_at) > 30 * 86400000);
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
const SEVERITY_RANK = { critical: 0, warning: 1, info: 2 };
async function getResolvedAlerts() {
    try {
        const col = await mongoCollection('mcp_config');
        const doc = await col.findOne({ _id: 'app' });
        const data = (doc || {});
        return Array.isArray(data.resolvedAlerts) ? data.resolvedAlerts.map(String) : [];
    }
    catch {
        return [];
    }
}
async function setResolvedAlerts(resolved) {
    try {
        const col = await mongoCollection('mcp_config');
        await col.updateOne({ _id: 'app' }, { $set: { resolvedAlerts: resolved } }, { upsert: true });
    }
    catch {
        // dev mode
    }
}
adminRouter.get('/status', requireAdmin, (req, res) => {
    const { uid, email } = req;
    res.json({
        admin: true,
        tier: req.tier || 'ADMIN',
        email,
        uid,
        service: 'ui-hub-mcp',
        version: '1.0.0',
    });
});
adminRouter.get('/overview', requireAdmin, async (req, res) => {
    const range = parseRange(req.query);
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
    const activeUsers24h = new Set(last24.filter((e) => e.userId).map((e) => e.userId)).size;
    let dbConnected = false;
    try {
        const col = await mongoCollection('mcp_analytics');
        await col.findOne({});
        dbConnected = true;
    }
    catch {
        dbConnected = false;
    }
    const uptimeSeconds = Math.round(process.uptime());
    const reqPerSec = stats.requests > 0 ? stats.requests / Math.max(1, Math.round((range.toTs - range.fromTs) / 1000)) : 0;
    const days = [];
    const today = new Date();
    const errorsByDay = {};
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
adminRouter.get('/analytics', requireAdmin, async (req, res) => {
    const range = parseRange(req.query);
    const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
    const stats = aggregateEvents(events);
    const tools = Object.entries(stats.byTool)
        .map(([name, usage]) => ({ ...usage, name }))
        .sort((a, b) => b.total - a.total);
    const series = Object.entries(stats.byDay)
        .map(([date, requests]) => ({ date, requests }))
        .sort((a, b) => a.date.localeCompare(b.date));
    res.json({
        range,
        summary: {
            requests: stats.requests,
            uniqueUsers: stats.uniqueUsers,
            errorRate: stats.errorRate,
            avgResponseTimeMs: stats.avgResponseTimeMs,
            rateLimitEvents: stats.rateLimitEvents,
            premiumDenied: stats.premiumDenied,
            authFailures: stats.authFailures,
        },
        byDay: series,
        byTool: tools,
        byTier: stats.byTier,
        byStatus: stats.byStatus,
        topComponents: stats.topComponents.map((c) => {
            const meta = componentService.getComponentMeta(c.id);
            return {
                ...c,
                title: meta?.title || c.id,
                category: meta?.category || 'unknown',
                isPremium: meta?.isPremium ?? false,
            };
        }),
    });
});
adminRouter.get('/users', requireAdmin, async (req, res) => {
    const range = parseRange(req.query);
    const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
    let users = await buildUsers(events);
    const q = String(req.query.search || '').toLowerCase().trim();
    if (q) {
        users = users.filter((u) => u.email.toLowerCase().includes(q) || u.uid.toLowerCase().includes(q) || u.name.toLowerCase().includes(q));
    }
    const plan = String(req.query.plan || '').toUpperCase();
    if (plan)
        users = users.filter((u) => u.plan === plan);
    const statusFilter = String(req.query.status || '');
    if (statusFilter)
        users = users.filter((u) => u.status === statusFilter);
    const page = clampInt(req.query.page, 1, 1, 100000);
    const pageSize = clampInt(req.query.pageSize, 25, 1, 100);
    const total = users.length;
    const start = (page - 1) * pageSize;
    const rows = users.slice(start, start + pageSize).map((u) => ({ ...u, uid: maskUid(u.uid), keys: undefined }));
    res.json({
        total,
        page,
        pageSize,
        range: { fromKey: range.fromKey, toKey: range.toKey },
        users: rows,
    });
});
adminRouter.get('/users/:id', requireAdmin, async (req, res) => {
    const uid = req.params.id;
    const range = parseRange(req.query);
    const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
    const userEvents = events.filter((e) => e.userId === uid).sort((a, b) => b.timestamp - a.timestamp);
    const all = await buildUsers(events);
    const user = all.find((u) => u.uid === uid);
    if (!user) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    }
    const stats = aggregateEvents(userEvents);
    res.json({
        user: { ...user, uid: maskUid(uid) },
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
adminRouter.post('/users/:id/suspend', requireAdmin, async (req, res) => {
    const uid = req.params.id;
    try {
        const col = await mongoCollection('users');
        const result = await col.updateOne({ $or: [{ _id: uid }, { uid }] }, { $set: { status: 'suspended' } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'User document not found' });
        }
    }
    catch {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'User document not found' });
    }
    await recordAudit({
        adminEmail: req.email,
        action: 'user.suspend',
        targetType: 'user',
        targetId: uid,
    });
    res.json({ ok: true, uid, status: 'suspended' });
});
adminRouter.post('/users/:id/unsuspend', requireAdmin, async (req, res) => {
    const uid = req.params.id;
    try {
        const col = await mongoCollection('users');
        const result = await col.updateOne({ $or: [{ _id: uid }, { uid }] }, { $set: { status: 'active' } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'User document not found' });
        }
    }
    catch {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'User document not found' });
    }
    await recordAudit({
        adminEmail: req.email,
        action: 'user.unsuspend',
        targetType: 'user',
        targetId: uid,
    });
    res.json({ ok: true, uid, status: 'active' });
});
adminRouter.get('/api-keys', requireAdmin, async (req, res) => {
    const keys = await getAllKeys();
    const events = await analyticsService.queryEvents(daysAgoKey(30));
    const usageByKey = new Map();
    events.forEach((e) => {
        if (e.apiKeyId)
            usageByKey.set(e.apiKeyId, (usageByKey.get(e.apiKeyId) || 0) + 1);
    });
    const usersByUid = new Map();
    try {
        const col = await mongoCollection('users');
        const docs = await col.find({}).toArray();
        docs.forEach((doc) => {
            const data = doc;
            if (data.uid)
                usersByUid.set(String(data.uid), data);
        });
    }
    catch {
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
    if (statusFilter)
        rows = rows.filter((k) => k.status === statusFilter);
    if (q) {
        rows = rows.filter((k) => String(k.keyPrefix || '').toLowerCase().includes(q) ||
            String(k.name || '').toLowerCase().includes(q) ||
            String(k.email || '').toLowerCase().includes(q));
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
adminRouter.patch('/api-keys/:id', requireAdmin, async (req, res) => {
    const id = req.params.id;
    const action = String(req.body?.action || '');
    const col = await mongoCollection('mcp_api_keys');
    const doc = await col.findOne({ _id: id }).catch(() => null);
    if (!doc) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'API key not found' });
    }
    const docData = doc;
    let patch = {};
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
    await col.updateOne({ _id: id }, { $set: patch });
    await recordAudit({
        adminEmail: req.email,
        action: `api_key.${action}`,
        targetType: 'api_key',
        targetId: id,
        meta: { keyPrefix: docData.key_prefix || '' },
    });
    res.json({ ok: true, id, status: patch.status });
});
adminRouter.get('/tools', requireAdmin, async (req, res) => {
    const states = await configService.getToolStates();
    const events = await analyticsService.queryEvents(daysAgoKey(30));
    const stats = aggregateEvents(events);
    const usageMap = stats.byTool;
    const tools = Object.keys(states).map((name) => {
        const usage = usageMap[name] || {
            total: 0,
            success: 0,
            failed: 0,
            uniqueUsers: 0,
            avgResponseTimeMs: 0,
            lastUsed: 0,
        };
        return {
            ...usage,
            name,
            enabled: states[name],
            category: classifyTool(name),
        };
    });
    res.json({ tools });
});
function classifyTool(name) {
    if (name.includes('search'))
        return 'search';
    if (name.includes('component'))
        return 'component';
    if (name.includes('template'))
        return 'template';
    if (name.includes('animation'))
        return 'animation';
    if (name.includes('dependencies'))
        return 'dependencies';
    if (name.includes('category'))
        return 'catalog';
    return 'utility';
}
adminRouter.patch('/tools/:name', requireAdmin, async (req, res) => {
    const name = req.params.name;
    const enabled = Boolean(req.body?.enabled);
    const states = await configService.getToolStates();
    if (!(name in states)) {
        return res.status(404).json({ error: 'NOT_FOUND', message: `Unknown tool: ${name}` });
    }
    await configService.setTool(name, enabled);
    await recordAudit({
        adminEmail: req.email,
        action: enabled ? 'tool.enable' : 'tool.disable',
        targetType: 'tool',
        targetId: name,
    });
    res.json({ ok: true, name, enabled });
});
adminRouter.get('/components', requireAdmin, async (req, res) => {
    const range = parseRange(req.query);
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
    });
});
adminRouter.get('/search', requireAdmin, async (req, res) => {
    const range = parseRange(req.query);
    const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
    const stats = aggregateEvents(events);
    const searchEvents = events.filter((e) => e.event === 'component_search');
    const byDay = {};
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
adminRouter.post('/playground', requireAdmin, async (req, res) => {
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
    const user = {
        userId: req.uid,
        email: req.email || '',
        name: '',
        tier: req.tier || 'ADMIN',
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
    }
    catch (err) {
        await recordAudit({
            adminEmail: req.email,
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
adminRouter.get('/logs', requireAdmin, async (req, res) => {
    const range = parseRange(req.query);
    const events = await analyticsService.queryEvents(range.fromKey, range.toKey);
    const page = clampInt(req.query.page, 1, 1, 100000);
    const pageSize = clampInt(req.query.pageSize, 25, 1, 200);
    const eventFilter = String(req.query.event || '').trim();
    const search = String(req.query.search || '').toLowerCase().trim();
    const statusFilter = req.query.status !== undefined ? parseInt(String(req.query.status), 10) : NaN;
    const resultFilter = String(req.query.result || '').trim();
    const statusOf = (e) => {
        if (e.statusCode)
            return e.statusCode;
        if (e.success === false || e.errorCode) {
            const code = String(e.errorCode || '').toUpperCase();
            if (code === 'RATE_LIMIT' || code === 'RATE_LIMITED')
                return 429;
            if (code === 'INSUFFICIENT_TIER' || code === 'PREMIUM_REQUIRED' || code === 'PREMIUM_ACCESS_DENIED')
                return 403;
            if (code === 'AUTH_FAILURE' || code === 'INVALID_API_KEY')
                return 401;
            if (e.event === 'auth_failure')
                return 401;
            if (e.event === 'rate_limit')
                return 429;
            if (e.event === 'premium_denied')
                return 403;
            return 500;
        }
        return 200;
    };
    let rows = events
        .map((e) => ({
        ...e,
        status: statusOf(e),
        result: e.statusCode ? (e.statusCode < 400 ? 'success' : 'error') : e.success === false && !e.errorCode ? 'error' : e.errorCode ? 'error' : 'success',
        ts: e.timestamp,
    }))
        .sort((a, b) => b.ts - a.ts);
    if (eventFilter)
        rows = rows.filter((e) => e.event === eventFilter);
    if (!isNaN(statusFilter))
        rows = rows.filter((e) => e.status === statusFilter);
    if (resultFilter)
        rows = rows.filter((e) => e.result === resultFilter);
    if (search) {
        rows = rows.filter((e) => String(e.tool || '').toLowerCase().includes(search) ||
            String(e.componentId || '').toLowerCase().includes(search) ||
            String(e.query || '').toLowerCase().includes(search) ||
            String(e.keyPrefix || '').toLowerCase().includes(search) ||
            String(e.errorCode || '').toLowerCase().includes(search));
    }
    const total = rows.length;
    const start = (page - 1) * pageSize;
    const pageRows = rows.slice(start, start + pageSize).map((e) => ({
        ...e,
        userId: maskUid(String(e.userId || '')),
    }));
    res.json({
        total,
        page,
        pageSize,
        range,
        events: pageRows,
    });
});
adminRouter.get('/security', requireAdmin, async (req, res) => {
    const cfg = await configService.get();
    const events = await analyticsService.queryEvents(daysAgoKey(2));
    const recent = events.sort((a, b) => b.timestamp - a.timestamp);
    const failures = recent.filter((e) => e.event === 'auth_failure');
    const rateLimited = recent.filter((e) => e.event === 'rate_limit');
    const denied = recent.filter((e) => e.event === 'premium_denied');
    const byKey = new Map();
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
adminRouter.get('/health', requireAdmin, async (req, res) => {
    let dbConnected = false;
    try {
        const col = await mongoCollection('mcp_analytics');
        await col.findOne({});
        dbConnected = true;
    }
    catch {
        dbConnected = false;
    }
    const cfg = await configService.get();
    const collections = await (async () => {
        const names = ['mcp_analytics', 'mcp_api_keys', 'mcp_audit', 'mcp_config', 'users', 'activity_logs'];
        const out = [];
        for (const name of names) {
            let count = 0;
            let lastEventAt = null;
            if (dbConnected) {
                try {
                    const col = await mongoCollection(name);
                    count = await col.countDocuments({});
                    const last = await col.find({}).sort({ createdAt: -1 }).limit(1).toArray();
                    if (last[0] && typeof last[0].createdAt === 'number') {
                        lastEventAt = last[0].createdAt;
                    }
                }
                catch {
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
            toolsEnabled: Object.values(cfg.tools).filter(Boolean).length,
            toolsTotal: Object.keys(cfg.tools).length,
        },
    });
});
adminRouter.get('/alerts', requireAdmin, async (req, res) => {
    const alerts = await computeAlerts();
    const resolved = await getResolvedAlerts();
    res.json({
        alerts: alerts.map((a) => ({ ...a, resolved: resolved.includes(a.key) })),
    });
});
adminRouter.post('/alerts/:key/resolve', requireAdmin, async (req, res) => {
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
        adminEmail: req.email,
        action: 'alert.resolve',
        targetType: 'alert',
        targetId: key,
    });
    res.json({ ok: true, key, resolved: true });
});
adminRouter.post('/alerts/:key/unresolve', requireAdmin, async (req, res) => {
    const key = req.params.key;
    const resolved = await getResolvedAlerts();
    const next = resolved.filter((k) => k !== key);
    await setResolvedAlerts(next);
    await recordAudit({
        adminEmail: req.email,
        action: 'alert.unresolve',
        targetType: 'alert',
        targetId: key,
    });
    res.json({ ok: true, key, resolved: false });
});
adminRouter.get('/settings', requireAdmin, async (req, res) => {
    const cfg = await configService.get();
    res.json({
        rateLimitFree: cfg.rateLimitFree,
        rateLimitPro: cfg.rateLimitPro,
        authEnabled: cfg.authEnabled,
        analyticsEnabled: cfg.analyticsEnabled,
        loggingEnabled: cfg.loggingEnabled,
        tools: cfg.tools,
        settingsDoc: 'mcp_config/app',
    });
});
adminRouter.put('/settings', requireAdmin, async (req, res) => {
    const body = req.body || {};
    const partial = {};
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
    if (body.authEnabled !== undefined)
        partial.authEnabled = Boolean(body.authEnabled);
    if (body.analyticsEnabled !== undefined)
        partial.analyticsEnabled = Boolean(body.analyticsEnabled);
    if (body.loggingEnabled !== undefined)
        partial.loggingEnabled = Boolean(body.loggingEnabled);
    if (partial.rateLimitFree && partial.rateLimitPro && partial.rateLimitFree > partial.rateLimitPro) {
        return res.status(400).json({ error: 'BAD_REQUEST', message: 'rateLimitFree cannot exceed rateLimitPro' });
    }
    const cfg = await configService.update(partial);
    await recordAudit({
        adminEmail: req.email,
        action: 'settings.update',
        targetType: 'settings',
        meta: { fields: Object.keys(partial) },
    });
    res.json(cfg);
});
adminRouter.get('/audit', requireAdmin, async (req, res) => {
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
function toCsv(headers, rows) {
    const esc = (v) => {
        const s = String(v === undefined || v === null ? '' : v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [headers, ...rows].map((row) => row.map(esc).join(',')).join('\n');
}
adminRouter.get('/export', requireAdmin, async (req, res) => {
    const type = String(req.query.type || 'events');
    const format = String(req.query.format || 'json').toLowerCase();
    const range = parseRange(req.query);
    await recordAudit({
        adminEmail: req.email,
        action: 'export',
        targetType: 'export',
        meta: { type, format, fromKey: range.fromKey, toKey: range.toKey },
    });
    const mime = format === 'csv' ? 'text/csv' : 'application/json';
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="ui-hub-mcp-${type}-${stamp}.${format === 'csv' ? 'csv' : 'json'}"`);
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
/**
 * GET /api/admin/mcp/logs
 * Unified log viewer querying MongoDB activity_logs and mcp_analytics.
 */
adminRouter.get('/logs', requireAdmin, async (req, res) => {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(String(req.query.pageSize || '25'), 10)));
    const eventFilter = String(req.query.event || '').trim();
    const search = String(req.query.search || '').trim();
    const statusFilter = String(req.query.status || '').trim();
    const resultFilter = String(req.query.result || '').trim();
    try {
        const actCol = await mongoCollection('activity_logs');
        const filter = {};
        if (eventFilter) {
            filter.type = eventFilter;
        }
        if (resultFilter === 'error') {
            filter.level = { $in: ['error', 'warn'] };
        }
        else if (resultFilter === 'success') {
            filter.level = { $nin: ['error', 'warn'] };
        }
        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { type: { $regex: search, $options: 'i' } },
                { userId: { $regex: search, $options: 'i' } },
                { 'metadata.componentId': { $regex: search, $options: 'i' } },
                { 'metadata.displayName': { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * pageSize;
        const [total, rawLogs] = await Promise.all([
            actCol.countDocuments(filter),
            actCol.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).toArray(),
        ]);
        const events = rawLogs.map((doc) => {
            const isErr = doc.level === 'error' || doc.level === 'warn';
            const statusCode = isErr ? 500 : 200;
            const ts = doc.createdAt instanceof Date ? doc.createdAt.getTime() : (typeof doc.createdAt === 'number' ? doc.createdAt : Date.now());
            return {
                event: doc.type || 'unknown',
                timestamp: ts,
                userId: doc.email || doc.userId || 'anonymous',
                keyPrefix: doc.metadata?.provider || 'web',
                tier: doc.metadata?.tier || 'free',
                componentId: doc.metadata?.componentId,
                tool: doc.metadata?.system || doc.metadata?.tool || doc.type,
                query: doc.metadata?.query || doc.metadata?.displayName || doc.email,
                success: !isErr,
                errorCode: isErr ? doc.metadata?.error || 'ERROR' : undefined,
                statusCode,
                status: statusCode,
                result: isErr ? 'error' : 'success',
            };
        });
        const now = Date.now();
        return res.json({
            total,
            page,
            pageSize,
            range: {
                from: now - 30 * 86400000,
                to: now,
                fromKey: new Date(now - 30 * 86400000).toISOString().slice(0, 10),
                toKey: new Date(now).toISOString().slice(0, 10),
            },
            events,
        });
    }
    catch (err) {
        console.error('[AdminLogs] Failed to fetch logs:', err?.message);
        return res.status(500).json({ error: 'Failed to retrieve logs' });
    }
});
export { adminRouter, ADMIN_BASE };
//# sourceMappingURL=admin.js.map