import React, { useState } from 'react';
import { ScrollText, Search, RefreshCw } from 'lucide-react';
import { getLogs } from '../../services/admin';
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

const LogsPage: React.FC = () => {
    const [event, setEvent] = useState('');
    const [status, setStatus] = useState('');
    const [result, setResult] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [debounced, setDebounced] = useState('');

    const l = useData(
        () => getLogs({ event, status, result, search: debounced, page, pageSize: 25 }),
        [event, status, result, debounced, page]
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

    if (l.loading) return <SkeletonTable rows={10} />;
    if (l.error) return <ErrorState message={l.error} onRetry={() => void l.reload()} />;

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
                    <button onClick={() => void l.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                        <RefreshCw size={13} /> Refresh
                    </button>
                }
            />

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
                            </tr>
                        </thead>
                        <tbody>
                            {data.events.map((e, i) => (
                                <tr key={i} className="hover:bg-neutral-900/40 transition-colors">
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
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => apply({ page: p })} />
                </Panel>
            )}
        </div>
    );
};

export default LogsPage;