import React, { useState } from 'react';
import { ScrollText, Search, RefreshCw, Download, Trash2, AlertTriangle } from 'lucide-react';
import { getLogs, deleteLogs, deleteLogItem, downloadExport } from '../../services/admin';
import type { McpLogEntry } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatusBadge, EmptyState, ErrorState, SkeletonTable,
    Table, Th, Td, Pagination, useData, formatCompact, formatDate, timeAgo, Tone,
} from '../../components/admin/AdminUi';

const EVENT_TYPES = [
    '',
    'mcp_request',
    'component_search',
    'component_fetch',
    'code_fetch',
    'template_fetch',
    'animation_fetch',
    'auth_failure',
    'rate_limit',
    'premium_denied',
];

const STATUSES = [
    { value: '', label: 'All HTTP Codes' },
    { value: '200', label: '200 OK' },
    { value: '400', label: '400 Bad Request' },
    { value: '401', label: '401 Unauthorized' },
    { value: '403', label: '403 Forbidden' },
    { value: '404', label: '404 Not Found' },
    { value: '429', label: '429 Rate Limited' },
    { value: '500', label: '500 Server Error' },
];

const RESULTS = [
    { value: '', label: 'All Results' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' },
];

const RANGES = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
];

const LogsPage: React.FC = () => {
    const [event, setEvent] = useState('');
    const [status, setStatus] = useState('');
    const [result, setResult] = useState('');
    const [search, setSearch] = useState('');
    const [range, setRange] = useState('30d');
    const [page, setPage] = useState(1);
    const [debounced, setDebounced] = useState('');
    const [exporting, setExporting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmRow, setConfirmRow] = useState<string | null>(null);
    const [deletingRow, setDeletingRow] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const l = useData(
        (refresh) => getLogs({ event, status, result, search: debounced, range, page, pageSize: 25, refresh }),
        [event, status, result, debounced, range, page]
    );

    React.useEffect(() => {
        const t = setTimeout(() => setDebounced(search.trim()), 400);
        return () => clearTimeout(t);
    }, [search]);

    const apply = (patch: Partial<{ event: string; status: string; result: string; page: number }>) => {
        if (patch.event !== undefined) setEvent(patch.event);
        if (patch.status !== undefined) setStatus(patch.status);
        if (patch.result !== undefined) setResult(patch.result);
        if (patch.page !== undefined) setPage(patch.page);
        else setPage(1);
    };

    const filterCount = [event, status, result, debounced].filter(Boolean).length;

    const handleExport = async () => {
        setExporting(true);
        setActionError(null);
        try {
            const stamp = new Date().toISOString().slice(0, 10);
            await downloadExport('logs', 'csv', range, `ui-hub-mcp-logs-${stamp}.csv`, {
                event,
                status,
                result,
                search: debounced,
            });
            setNotice('Logs exported to CSV.');
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Export failed');
        } finally {
            setExporting(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setActionError(null);
        try {
            const res = await deleteLogs({
                event,
                status,
                result,
                search: debounced,
                range,
                confirm: filterCount === 0 ? 'ALL' : undefined,
            });
            setNotice(`Deleted ${formatCompact(res.deleted)} log event(s) from the database.`);
            setConfirmOpen(false);
            await l.reload(true);
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    const rowKey = (entry: McpLogEntry, i: number): string =>
        entry.id || (entry.docId && entry.eventId !== undefined ? `${entry.docId}:${entry.eventId}` : String(i));

    const handleDeleteRow = async (entry: McpLogEntry) => {
        const key = entry.id || `${entry.docId}:${entry.eventId}`;
        setDeletingRow(key);
        setActionError(null);
        try {
            const res = await deleteLogItem({ docId: entry.docId, eventId: entry.eventId });
            setNotice(res.deleted > 0 ? 'Log entry deleted from the database.' : 'That log entry was already gone.');
            setConfirmRow(null);
            await l.reload(true);
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Delete failed');
        } finally {
            setDeletingRow(null);
        }
    };

    if (l.loading) return <SkeletonTable rows={10} />;
    if (l.error) return <ErrorState message={l.error} onRetry={() => void l.reload(true)} />;

    const data = l.data!;

    const statusTone = (e: (typeof data.events)[number]): Tone => {
        const s = e.status ?? (e.success === false || e.errorCode ? 500 : 200);
        if (s < 400) return 'ok';
        if (s === 429) return 'warn';
        if (s < 500) return 'bad';
        return 'bad';
    };

    return (
        <div>
            <PageHeader
                title="Request Logs"
                subtitle={`${formatCompact(data.total)} events in range`}
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => void handleExport()}
                            disabled={exporting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40"
                        >
                            <Download size={13} /> {exporting ? 'Exporting…' : 'Export CSV'}
                        </button>
                        <button
                            onClick={() => { setConfirmOpen(true); setNotice(null); setActionError(null); }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-red text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700 transition-colors cursor-pointer"
                        >
                            Delete logs
                        </button>
                        <button onClick={() => void l.reload(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                            <RefreshCw size={13} /> Refresh
                        </button>
                    </div>
                }
            />

            {notice && (
                <div className="mb-4 rounded-md border-2 border-white bg-brand-blue/10 px-4 py-3 text-xs font-mono text-white">{notice}</div>
            )}
            {actionError && (
                <div className="mb-6"><ErrorState message={actionError} onRetry={() => setActionError(null)} /></div>
            )}

            <Panel className="mb-6">
                <PanelHeader title="Filters" actions={<ScrollText size={14} className="text-brand-blue" />} />
                <div className="p-4 flex flex-wrap items-center gap-3">
                    <select value={event} onChange={(e) => apply({ event: e.target.value })} className="rounded-md border-2 border-white/40 bg-brand-bg px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-brand-blue cursor-pointer">
                        {EVENT_TYPES.map((ev) => <option key={ev} value={ev}>{ev === '' ? 'All Event Types' : ev}</option>)}
                    </select>
                    <select value={status} onChange={(e) => apply({ status: e.target.value })} className="rounded-md border-2 border-white/40 bg-brand-bg px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-brand-blue cursor-pointer">
                        {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <select value={result} onChange={(e) => apply({ result: e.target.value })} className="rounded-md border-2 border-white/40 bg-brand-bg px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-brand-blue cursor-pointer">
                        {RESULTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <select value={range} onChange={(e) => setRange(e.target.value)} className="rounded-md border-2 border-white/40 bg-brand-bg px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-brand-blue cursor-pointer" title="Export / delete range">
                        {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <div className="flex-1 min-w-[220px] max-w-xs relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tool, component, query, key prefix…"
                            className="w-full rounded-md border-2 border-white/40 bg-brand-bg pl-9 pr-3 py-2.5 text-xs font-mono text-white outline-none focus:border-brand-blue"
                        />
                    </div>
                </div>
            </Panel>

            {data.events.length === 0 ? (
                <Panel>
                    <EmptyState icon={ScrollText} title="No logs match" message="Try widening the filters or picking a different HTTP code." />
                </Panel>
            ) : (
                <Panel>
                    <Table>
                        <thead>
                            <tr>
                                <Th>When</Th>
                                <Th>Event</Th>
                                <Th>Detail</Th>
                                <Th>User</Th>
                                <Th>Key</Th>
                                <Th>Tier</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.events.map((e, i) => (
                                <tr key={rowKey(e, i)} className="hover:bg-neutral-900/40 transition-colors">
                                    <Td className="text-neutral-400">{formatDate(e.timestamp)}</Td>
                                    <Td className="font-mono text-brand-blue">{e.event}</Td>
                                    <Td>
                                        <div className="font-mono text-xs text-white max-w-[260px] truncate">{e.tool || e.componentId || e.query || '—'}</div>
                                        {e.responseTimeMs ? <div className="text-[10px] text-neutral-500">{e.responseTimeMs}ms</div> : null}
                                    </Td>
                                    <Td><span className="font-mono text-xs">{e.userId || '—'}</span></Td>
                                    <Td><span className="font-mono text-xs">{e.keyPrefix || '—'}</span></Td>
                                    <Td><span className="font-mono text-xs uppercase">{e.tier || '—'}</span></Td>
                                    <Td>
                                        <StatusBadge value={e.result === 'error' ? e.errorCode || `HTTP ${e.status}` : `HTTP ${e.status}`} tone={statusTone(e)} />
                                    </Td>
                                    <Td>
                                        {confirmRow === rowKey(e, i) ? (
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => void handleDeleteRow(e)}
                                                    disabled={deletingRow === rowKey(e, i)}
                                                    className="inline-flex items-center gap-1 rounded-md border-2 border-white bg-brand-red px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-40"
                                                >
                                                    {deletingRow === rowKey(e, i) ? 'Deleting…' : 'Confirm'}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmRow(null)}
                                                    disabled={deletingRow === rowKey(e, i)}
                                                    className="rounded-md border-2 border-white bg-brand-bg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setConfirmRow(rowKey(e, i)); setNotice(null); setActionError(null); }}
                                                title="Delete this log entry"
                                                className="inline-flex items-center justify-center w-7 h-7 rounded-md border-2 border-white/60 bg-brand-surface text-neutral-300 hover:text-white hover:border-white hover:bg-red-700 transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => apply({ page: p })} />
                </Panel>
            )}

            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => !deleting && setConfirmOpen(false)}>
                    <div className="w-full max-w-md rounded-md border-2 border-white bg-brand-surface p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start gap-3">
                            <span className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-md border-2 border-white bg-brand-red text-white">
                                <AlertTriangle size={18} />
                            </span>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white">Delete logs from database</h3>
                                <p className="mt-2 text-xs text-neutral-300">
                                    {filterCount === 0
                                        ? `No filters are active — this will permanently delete ALL MCP logs in the last ${range.replace('d', ' days')}.`
                                        : `This permanently deletes logs matching the current filters in the ${range} range. This cannot be undone.`}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setConfirmOpen(false)}
                                disabled={deleting}
                                className="px-4 py-2 rounded-md border-2 border-white bg-brand-bg text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => void handleDelete()}
                                disabled={deleting}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-red text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-40"
                            >
                                <Trash2 size={13} /> {deleting ? 'Deleting…' : 'Delete from DB'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogsPage;
