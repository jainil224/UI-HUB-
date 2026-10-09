import React, { useState } from 'react';
import { Activity, RefreshCw, Radio, X, Search } from 'lucide-react';
import {
    getActivity, getActivityEvent, AdminActivity, AdminRequestEvent,
} from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatCard, StatusBadge, EmptyState, ErrorState,
    SkeletonTable, useData, timeAgo, formatMs, formatNum, Table, Th, Td, Pagination, Tone,
} from '../../components/admin/AdminUi';

const STATUS_TONE: Record<string, Tone> = {
    success: 'ok',
    no_results: 'warn',
    validation_error: 'warn',
    authorization_denied: 'bad',
    rate_limited: 'bad',
    server_error: 'bad',
};

const LiveActivityPage: React.FC = () => {
    const [status, setStatus] = useState('');
    const [tool, setTool] = useState('');
    const [client, setClient] = useState('');
    const [range, setRange] = useState('1d');
    const [page, setPage] = useState(1);
    const [auto, setAuto] = useState(true);
    const [selected, setSelected] = useState<AdminRequestEvent | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const a = useData<AdminActivity>(
        () => getActivity({ status: status || undefined, toolName: tool || undefined, client: client || undefined, range, page, pageSize: 50 }),
        [status, tool, client, range, page],
        { intervalMs: auto ? 15000 : 0 },
    );

    const openDetail = async (ev: AdminRequestEvent) => {
        setSelected(ev);
        setDetailLoading(true);
        try {
            const { item } = await getActivityEvent(ev.id);
            setSelected(item);
        } catch {
            // keep the row we already have
        } finally {
            setDetailLoading(false);
        }
    };

    if (a.loading && !a.data) return <SkeletonTable rows={8} />;
    if (a.error && !a.data) return <ErrorState message={a.error} onRetry={() => void a.reload()} />;

    const data = a.data!;
    const byStatus = data.summary?.byStatus || {};

    return (
        <div>
            <PageHeader
                title="Live Activity"
                subtitle="Every MCP request captured at the transport layer — correlation id, client, tool, latency and outcome."
                actions={
                    <>
                        <button
                            onClick={() => setAuto((v) => !v)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${auto ? 'bg-brand-blue text-white border-white' : 'bg-brand-surface text-white border-white hover:bg-neutral-900'}`}
                        >
                            <Radio size={13} className={auto ? 'animate-pulse' : ''} /> {auto ? 'Live' : 'Paused'}
                        </button>
                        <button onClick={() => void a.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                            <RefreshCw size={13} /> Refresh
                        </button>
                    </>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total (range)" value={formatNum(data.total)} icon={Activity} tone="blue" />
                <StatCard label="Succeeded" value={formatNum(byStatus.success || 0)} icon={Activity} tone="ok" />
                <StatCard label="Errors" value={formatNum((byStatus.server_error || 0) + (byStatus.validation_error || 0))} icon={Activity} tone="bad" />
                <StatCard label="Avg Latency" value={formatMs(data.summary?.avgLatencyMs)} icon={Activity} tone="violet" />
            </div>

            <Panel className="mb-6">
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 rounded-md border-2 border-white bg-brand-bg text-xs text-white">
                        <option value="">All statuses</option>
                        {['success', 'no_results', 'validation_error', 'authorization_denied', 'rate_limited', 'server_error'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md border-2 border-white bg-brand-bg">
                        <Search size={13} className="text-neutral-500" />
                        <input value={tool} onChange={(e) => { setTool(e.target.value); setPage(1); }} placeholder="tool name" className="bg-transparent text-xs text-white outline-none w-36" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md border-2 border-white bg-brand-bg">
                        <input value={client} onChange={(e) => { setClient(e.target.value); setPage(1); }} placeholder="client name" className="bg-transparent text-xs text-white outline-none w-36" />
                    </div>
                    <select value={range} onChange={(e) => { setRange(e.target.value); setPage(1); }} className="px-3 py-2 rounded-md border-2 border-white bg-brand-bg text-xs text-white">
                        <option value="1h">Last 1h</option>
                        <option value="24h">Last 24h</option>
                        <option value="1d">Last 24h</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                    </select>
                </div>
            </Panel>

            <Panel>
                <PanelHeader
                    title={`Requests (${formatNum(data.total)})`}
                    subtitle={data.note || 'Newest first'}
                    actions={<StatusBadge value={`page ${data.page}`} tone="muted" />}
                />
                {data.items.length === 0 ? (
                    <EmptyState icon={Activity} title="No requests" message={data.note || 'Telemetry is live — activity will appear here as MCP clients connect.'} />
                ) : (
                    <>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Time</Th>
                                    <Th>Status</Th>
                                    <Th>Method / Tool</Th>
                                    <Th>User</Th>
                                    <Th>Key</Th>
                                    <Th>Client</Th>
                                    <Th>Resource</Th>
                                    <Th>Latency</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((ev) => (
                                    <tr key={ev.id} onClick={() => void openDetail(ev)} className="hover:bg-white/5 cursor-pointer">
                                        <Td className="text-neutral-400 text-xs">{timeAgo(ev.timestamp)}</Td>
                                        <Td><StatusBadge value={ev.status} tone={STATUS_TONE[ev.status] || 'muted'} /></Td>
                                        <Td>
                                            <div className="text-xs font-mono">{ev.toolName || ev.method}</div>
                                            {ev.query && <div className="text-[10px] text-neutral-500 truncate max-w-[220px]">{ev.query}</div>}
                                        </Td>
                                        <Td className="text-xs">
                                            <div className="text-white truncate max-w-[160px]">{ev.userName || (ev.userId ? ev.userId.slice(0, 8) + '…' : '—')}</div>
                                            {ev.userName && ev.userId && <div className="text-[10px] font-mono text-neutral-500 truncate max-w-[160px]">{ev.userId.slice(0, 8)}…</div>}
                                        </Td>
                                        <Td className="text-[11px] font-mono text-neutral-300">{ev.keyPrefix || '—'}</Td>
                                        <Td className="text-xs">{ev.clientName || 'Unknown MCP client'}</Td>
                                        <Td className="text-xs">{ev.resourceType ? `${ev.resourceType}${ev.resourceId ? ':' + ev.resourceId : ''}` : '—'}</Td>
                                        <Td className="text-xs">{formatMs(ev.latencyMs)}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
                    </>
                )}
            </Panel>

            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setSelected(null)}>
                    <div className="w-full max-w-lg h-full bg-brand-surface border-l-2 border-white overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b-2 border-white px-5 py-4 sticky top-0 bg-brand-surface">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">Request Detail</h3>
                            <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-white cursor-pointer"><X size={16} /></button>
                        </div>
                        <div className="p-5 space-y-3 text-xs">
                            {detailLoading && <p className="text-neutral-400">Loading full event…</p>}
                            {[
                                ['Correlation ID', selected.correlationId],
                                ['Method', selected.method],
                                ['Tool', selected.toolName || '—'],
                                ['Status', selected.status],
                                ['HTTP status', selected.statusCode ?? '—'],
                                ['Error code', selected.errorCode || '—'],
                                ['Error category', selected.errorCategory || '—'],
                                ['Client', selected.clientName ? `${selected.clientName} ${selected.clientVersion || ''}` : 'Unknown MCP client'],
                                ['Session', selected.sessionId || '—'],
                                ['User', selected.userName ? `${selected.userName} (${selected.userId || '—'})` : (selected.userId || '—')],
                                ['Key prefix', selected.keyPrefix || '—'],
                                ['Tier', selected.tier || '—'],
                                ['Resource', selected.resourceType ? `${selected.resourceType}${selected.resourceId ? ':' + selected.resourceId : ''}` : '—'],
                                ['Result count', selected.resultCount ?? '—'],
                                ['Latency', formatMs(selected.latencyMs)],
                                ['Query', selected.query || '—'],
                                ['Timestamp', new Date(selected.timestamp).toLocaleString()],
                            ].map(([label, value]) => (
                                <div key={String(label)} className="flex items-start justify-between gap-4 border-b-2 border-white/20 pb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{label}</span>
                                    <span className="text-white text-right break-all">{String(value ?? '—')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveActivityPage;
