import React, { useState } from 'react';
import { Search, RefreshCw, TrendingUp, AlertTriangle, Eye, Code2 } from 'lucide-react';
import { getAiSearchAnalytics, AdminSearchAnalytics } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatCard, StatusBadge, EmptyState, ErrorState,
    SkeletonTable, useData, timeAgo, formatPct, formatNum, Table, Th, Td, Pagination,
} from '../../components/admin/AdminUi';

const AiSearchPage: React.FC = () => {
    const [range, setRange] = useState('7d');
    const [page, setPage] = useState(1);

    const a = useData<AdminSearchAnalytics>(
        () => getAiSearchAnalytics({ range, page, pageSize: 50 }),
        [range, page],
    );

    if (a.loading && !a.data) return <SkeletonTable rows={8} />;
    if (a.error && !a.data) return <ErrorState message={a.error} onRetry={() => void a.reload()} />;

    const data = a.data!;
    const s = data.summary;

    return (
        <div>
            <PageHeader
                title="AI Search Analytics"
                subtitle="What AI agents search for, which queries return nothing, and whether results actually get fetched or turned into code."
                actions={
                    <>
                        <select value={range} onChange={(e) => { setRange(e.target.value); setPage(1); }} className="px-3 py-2 rounded-md border-2 border-white bg-brand-bg text-xs text-white cursor-pointer">
                            <option value="1d">Last 24h</option>
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>
                        <button onClick={() => void a.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                            <RefreshCw size={13} /> Refresh
                        </button>
                    </>
                }
            />

            <div className="mb-6 rounded-md border-2 border-white bg-yellow-500/10 p-4 text-xs text-white">
                <div className="font-black uppercase tracking-widest mb-1">Usage</div>
                <div className="text-neutral-200">Search events come from <code>mcp_search_events</code> (behavior_search, component_search etc.). If this is empty, run the AI/behavior search tools from clients to generate telemetry.</div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Searches" value={formatNum(s.totalSearches)} icon={Search} tone="blue" />
                <StatCard label="Zero-Result Rate" value={formatPct(s.zeroResultRate)} sub={`${formatNum(s.zeroResults)} empty results`} icon={AlertTriangle} tone={s.zeroResultRate > 0.3 ? 'bad' : 'warn'} />
                <StatCard label="Fetch-Through" value={formatPct(s.fetchThroughRate)} sub={`${formatNum(s.fetched)} searches led to a fetch`} icon={Eye} tone="violet" />
                <StatCard label="Code Retrieved" value={formatNum(s.codeRetrieved)} sub="searches that ended in source code" icon={Code2} tone="ok" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Panel>
                    <PanelHeader title="Top Queries" subtitle="Most frequent agent search intents" actions={<TrendingUp size={14} className="text-brand-blue" />} />
                    {s.topQueries.length === 0 ? (
                        <EmptyState icon={Search} title="No searches yet" message="Search telemetry is live — results appear as agents search." />
                    ) : (
                        <div className="divide-y-2 divide-white/40">
                            {s.topQueries.map((q) => {
                                const max = s.topQueries[0]?.count || 1;
                                const pct = Math.round((q.count / max) * 100);
                                return (
                                    <div key={q.query} className="px-5 py-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-xs font-mono text-white truncate">{q.query}</span>
                                            <span className="text-[10px] text-neutral-400 shrink-0">{q.count}× · {q.zeroResults} empty</span>
                                        </div>
                                        <div className="mt-2 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                                            <div className="h-full bg-brand-blue" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Panel>

                <Panel>
                    <PanelHeader title="Recent Searches" subtitle={data.note || 'Newest first'} actions={<StatusBadge value={`${formatNum(data.total)} total`} tone="muted" />} />
                    {data.items.length === 0 ? (
                        <EmptyState icon={Search} title="No recent searches" message={data.note || 'Nothing captured in this range.'} />
                    ) : (
                        <div className="divide-y-2 divide-white/40 max-h-[520px] overflow-y-auto">
                            {data.items.map((ev) => (
                                <div key={ev.id} className="flex items-center justify-between gap-3 px-5 py-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-white truncate">{ev.query || '(empty)'}</span>
                                            <StatusBadge value={ev.resourceType} tone="blue" />
                                            {ev.zeroResults && <StatusBadge value="no results" tone="warn" />}
                                        </div>
                                        <div className="text-[10px] text-neutral-500 mt-1">
                                            {timeAgo(ev.timestamp)} · {ev.clientName || 'Unknown MCP client'} · {ev.resultCount} results
                                            {ev.fetched ? ' · fetched' : ''}{ev.codeRetrieved ? ' · code' : ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>

            <Panel>
                <PanelHeader title="Search Events" subtitle="Full search telemetry" />
                {data.items.length === 0 ? (
                    <EmptyState icon={Search} title="No search events" message={data.note} />
                ) : (
                    <>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Time</Th>
                                    <Th>Query</Th>
                                    <Th>Type</Th>
                                    <Th>Results</Th>
                                    <Th>Outcome</Th>
                                    <Th>Client</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((ev) => (
                                    <tr key={ev.id}>
                                        <Td className="text-neutral-400 text-xs">{timeAgo(ev.timestamp)}</Td>
                                        <Td className="font-mono text-xs max-w-[220px] truncate">{ev.query || '(empty)'}</Td>
                                        <Td className="text-xs">{ev.resourceType}</Td>
                                        <Td className="text-xs">{ev.resultCount}</Td>
                                        <Td>
                                            {ev.zeroResults
                                                ? <StatusBadge value="zero results" tone="warn" />
                                                : ev.codeRetrieved
                                                    ? <StatusBadge value="code" tone="ok" />
                                                    : ev.fetched
                                                        ? <StatusBadge value="fetched" tone="blue" />
                                                        : <StatusBadge value="results" tone="muted" />}
                                        </Td>
                                        <Td className="text-xs text-neutral-400">{ev.clientName || 'Unknown'}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
                    </>
                )}
            </Panel>
        </div>
    );
};

export default AiSearchPage;
