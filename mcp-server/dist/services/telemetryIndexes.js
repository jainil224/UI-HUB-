import { getCollection } from './mongo.js';
import { REQUEST_EVENTS_COLLECTION, SEARCH_EVENTS_COLLECTION, } from './telemetryService.js';
import { DIAGNOSTICS_COLLECTION } from './diagnosticsService.js';
import { ALERT_RULES_COLLECTION, ALERT_EVENTS_COLLECTION } from './alertService.js';
import { redactText } from './redaction.js';
function retentionSeconds(envName, defaultDays) {
    const raw = process.env[envName];
    const days = raw === undefined ? defaultDays : parseInt(raw, 10);
    if (!days || days <= 0)
        return 0;
    return days * 86400;
}
async function safeCreateIndexes(collectionName, indexes) {
    try {
        const col = await getCollection(collectionName);
        const existing = await col.indexes().catch(() => []);
        const existingNames = new Set(existing.map((i) => i.name));
        for (const { keys, options } of indexes) {
            const name = options?.name;
            if (name && existingNames.has(name))
                continue;
            await col.createIndex(keys, { background: true, ...(options || {}) });
        }
        console.log(`[Indexes] ✓ ${collectionName} indexed`);
    }
    catch (error) {
        console.warn(`[Indexes] ${collectionName} index creation warning: ${redactText(error?.message || error)}`);
    }
}
/**
 * Additive index/retention creation for the telemetry, diagnostics and alert
 * collections. Idempotent — safe to call on every boot and from migrations.
 * Never touches existing collections.
 */
export async function ensureTelemetryIndexes() {
    const reqRetention = retentionSeconds('MCP_REQUEST_RETENTION_DAYS', 30);
    const searchRetention = retentionSeconds('MCP_SEARCH_RETENTION_DAYS', 30);
    const diagRetention = retentionSeconds('MCP_DIAGNOSTICS_RETENTION_DAYS', 90);
    const alertRetention = retentionSeconds('MCP_ALERT_RETENTION_DAYS', 180);
    const requestIndexes = [
        { keys: { timestamp: -1 }, options: { name: 'req_ts' } },
        { keys: { userId: 1, timestamp: -1 }, options: { name: 'req_user_ts' } },
        { keys: { method: 1, timestamp: -1 }, options: { name: 'req_method_ts' } },
        { keys: { toolName: 1, timestamp: -1 }, options: { name: 'req_tool_ts' } },
        { keys: { status: 1, timestamp: -1 }, options: { name: 'req_status_ts' } },
        { keys: { correlationId: 1 }, options: { name: 'req_corr' } },
        { keys: { clientName: 1 }, options: { name: 'req_client' } },
        { keys: { sessionId: 1 }, options: { name: 'req_session' } },
    ];
    if (reqRetention > 0) {
        requestIndexes.push({ keys: { timestamp: 1 }, options: { name: 'req_ttl', expireAfterSeconds: reqRetention } });
    }
    await safeCreateIndexes(REQUEST_EVENTS_COLLECTION, requestIndexes);
    const searchIndexes = [
        { keys: { timestamp: -1 }, options: { name: 'search_ts' } },
        { keys: { queryNormalized: 1 }, options: { name: 'search_query' } },
        { keys: { resourceType: 1, timestamp: -1 }, options: { name: 'search_type_ts' } },
        { keys: { zeroResults: 1, timestamp: -1 }, options: { name: 'search_zero_ts' } },
        { keys: { userId: 1, timestamp: -1 }, options: { name: 'search_user_ts' } },
        { keys: { correlationId: 1 }, options: { name: 'search_corr' } },
        { keys: { returnedIds: 1 }, options: { name: 'search_returned' } },
    ];
    if (searchRetention > 0) {
        searchIndexes.push({ keys: { timestamp: 1 }, options: { name: 'search_ttl', expireAfterSeconds: searchRetention } });
    }
    await safeCreateIndexes(SEARCH_EVENTS_COLLECTION, searchIndexes);
    const diagIndexes = [
        { keys: { fingerprint: 1 }, options: { name: 'diag_fp', unique: true } },
        { keys: { category: 1, lastSeen: -1 }, options: { name: 'diag_cat_ts' } },
        { keys: { severity: 1, lastSeen: -1 }, options: { name: 'diag_sev_ts' } },
        { keys: { resolution: 1 }, options: { name: 'diag_resolution' } },
        { keys: { lastSeen: -1 }, options: { name: 'diag_ts' } },
    ];
    if (diagRetention > 0) {
        diagIndexes.push({ keys: { lastSeen: 1 }, options: { name: 'diag_ttl', expireAfterSeconds: diagRetention } });
    }
    await safeCreateIndexes(DIAGNOSTICS_COLLECTION, diagIndexes);
    await safeCreateIndexes(ALERT_RULES_COLLECTION, [
        { keys: { ruleId: 1 }, options: { name: 'rule_id', unique: true } },
    ]);
    const alertIndexes = [
        { keys: { ruleId: 1, fingerprint: 1, status: 1 }, options: { name: 'alert_rule_fp_status' } },
        { keys: { status: 1, lastDetected: -1 }, options: { name: 'alert_status_ts' } },
        { keys: { severity: 1 }, options: { name: 'alert_severity' } },
    ];
    if (alertRetention > 0) {
        alertIndexes.push({ keys: { lastDetected: 1 }, options: { name: 'alert_ttl', expireAfterSeconds: alertRetention } });
    }
    await safeCreateIndexes(ALERT_EVENTS_COLLECTION, alertIndexes);
}
//# sourceMappingURL=telemetryIndexes.js.map