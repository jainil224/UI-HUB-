/** HTTP status code derived from an MCP event, matching the legacy `/logs` logic. */
export function statusOf(e) {
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
}
export function resultOf(e) {
    if (e.statusCode)
        return e.statusCode < 400 ? 'success' : 'error';
    if (e.success === false && !e.errorCode)
        return 'error';
    if (e.errorCode)
        return 'error';
    return 'success';
}
/** Map a raw event into a display row with derived status/result. */
export function mapLogRow(e) {
    return {
        ...e,
        status: statusOf(e),
        result: resultOfEvent(e),
        ts: e.timestamp,
    };
}
/** Result label exactly matching the legacy `/logs` derivation. */
export function resultOfEvent(e) {
    if (e.statusCode)
        return e.statusCode < 400 ? 'success' : 'error';
    if (e.success === false && !e.errorCode)
        return 'error';
    return e.errorCode ? 'error' : 'success';
}
/** True when a row matches the given admin log filters. */
export function matchesLogFilters(row, filters) {
    if (filters.event && row.event !== filters.event)
        return false;
    if (filters.status !== undefined && filters.status !== '' && String(filters.status) !== '') {
        const s = parseInt(String(filters.status), 10);
        if (!isNaN(s) && row.status !== s)
            return false;
    }
    if (filters.result && row.result !== filters.result)
        return false;
    if (filters.search) {
        const q = filters.search.toLowerCase();
        const hay = [
            row.tool,
            row.componentId,
            row.query,
            row.keyPrefix,
            row.errorCode,
        ];
        if (!hay.some((v) => String(v || '').toLowerCase().includes(q)))
            return false;
    }
    return true;
}
/** Map → filter → sort (newest first) a batch of events into display rows. */
export function eventsToLogRows(events, filters = {}) {
    return events
        .map(mapLogRow)
        .filter((row) => matchesLogFilters(row, filters))
        .sort((a, b) => b.ts - a.ts);
}
const CSV_HEADERS = [
    'timestamp',
    'event',
    'userId',
    'keyPrefix',
    'tier',
    'tool',
    'componentId',
    'query',
    'status',
    'result',
    'errorCode',
    'responseTimeMs',
];
/** Serialize log rows to a spreadsheet-friendly CSV string. */
export function logsToCsv(rows, maskUid = (u) => u) {
    const esc = (v) => {
        const s = String(v === undefined || v === null ? '' : v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = rows.map((r) => [
        r.timestamp,
        r.event,
        maskUid(String(r.userId || '')),
        r.keyPrefix || '',
        r.tier || '',
        r.tool || '',
        r.componentId || '',
        r.query || '',
        r.status,
        r.result,
        r.errorCode || '',
        r.responseTimeMs ?? '',
    ]);
    return [CSV_HEADERS, ...body].map((row) => row.map(esc).join(',')).join('\n');
}
//# sourceMappingURL=logService.js.map