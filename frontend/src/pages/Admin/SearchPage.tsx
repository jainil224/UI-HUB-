import React, { useState } from 'react';
import { Search, RefreshCw, PackageX, Compass } from 'lucide-react';
import { getSearchAnalytics } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatusBadge, EmptyState, ErrorState,
    Table, Th, Td, useData, formatCompact, formatDate,
} from '../../components/admin/AdminUi';
import { RequestsChart } from '../../components/admin/Charts';

const RANGES = [
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
    { id: '90d', label: '90 days' },
];

const SearchPage: React.FC = () => {
    const [range, setRange] = useState('30d');
    const d = useData(() => getSearchAnalytics(range), [range]);

    if (d.loading) {
        return (
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="h-96 rounded-lg border-2 border-white bg-brand-surface skeleton-glass skeleton-pulse" />
                <div className="h-96 rounded-lg border-2 border-white bg-brand-surface skeleton-glass skeleton-pulse" />
            </div>
        );
    }
    if (d.error) return <ErrorState message={d.error} onRetry={() => void d.reload()} />;

    const data = d.data!;
    const maxCount = Math.max(1, ...data.topSearches.map((s) => s.count));

    return (
        <div>
            <PageHeader
                title="Search Analytics"
                subtitle="What developers search for through MCP — real component_search events."
                actions={
                    <div className="flex items-center gap-2">
                        {RANGES.map((r) => (
                            <button key={r.id} onClick={() => setRange(r.id)} className={`px-4 py-2 rounded-md border-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${range === r.id ? 'bg-brand-blue text-white border-white' : 'bg-brand-surface text-neutral-400 border-white hover:text-white'}`}>
                                {r.label}
                            </button>
                        ))}
                        <button onClick={() => void d.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                            <RefreshCw size={13} /> Refresh
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue p-5"><p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Total Searches</p><p className="text-2xl font-black text-white mt-1.5">{formatCompact(data.totalSearches)}</p><p className="text-[11px] text-neutral-400 mt-2">{formatCompact(data.searchRate24h)} in last 24h</p></div>
                <div className="relative border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue p-5"><p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Unique Queries</p><p className="text-2xl font-black text-white mt-1.5">{formatCompact(data.uniqueSearches)}</p><p className="text-[11px] text-neutral-400 mt-2">distinct search terms</p></div>
                <div className="relative border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue p-5"><p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Zero-Result</p><p className="text-2xl font-black text-white mt-1.5">{formatCompact(data.zeroResultSearches.length)}</p><p className="text-[11px] text-neutral-400 mt-2">queries found nothing</p></div>
                <div className="relative border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue p-5"><p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Avg per Day</p><p className="text-2xl font-black text-white mt-1.5">{data.byDay.length ? formatCompact(Math.round(data.totalSearches / data.byDay.length)) : '0'}</p><p className="text-[11px] text-neutral-400 mt-2">searches / day</p></div>
            </div>

            <Panel className="mt-6">
                <PanelHeader title="Search trend" subtitle="Searches per day" />
                <div className="p-5">
                    <RequestsChart data={data.byDay} />
                </div>
            </Panel>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
                <Panel>
                    <PanelHeader title="Top searches" subtitle="Most frequent queries" actions={<Search size={14} className="text-brand-blue" />} />
                    {data.topSearches.length === 0 ? (
                        <EmptyState icon={Search} title="No search data" message="No component searches recorded in this range." />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Query</Th>
                                    <Th>Searches</Th>
                                    <Th>Share</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topSearches.slice(0, 15).map((s) => (
                                    <tr key={s.query} className="hover:bg-neutral-900/40 transition-colors">
                                        <Td>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-brand-blue">"{s.query}"</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-neutral-800 mt-2 overflow-hidden w-40">
                                                <div className="h-full bg-brand-blue" style={{ width: `${(s.count / maxCount) * 100}%` }} />
                                            </div>
                                        </Td>
                                        <Td className="font-black text-white">{formatCompact(s.count)}</Td>
                                        <Td>{data.totalSearches ? formatPct2(s.count / data.totalSearches) : '—'}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Panel>

                <Panel>
                    <PanelHeader title="What developers can't find" subtitle="Zero-result searches — component gaps to build next" actions={<PackageX size={14} className="text-brand-red" />} />
                    {data.zeroResultSearches.length === 0 ? (
                        <EmptyState icon={Compass} title="No zero-result searches" message="Every recorded search found results. Nice." />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Search query</Th>
                                    <Th>Searches</Th>
                                    <Th>Zero results</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.zeroResultSearches.slice(0, 15).map((s, i) => (
                                    <tr key={s.query} className="hover:bg-neutral-900/40 transition-colors">
                                        <Td>
                                            <span className="font-mono text-neutral-300">"{s.query}"</span>
                                            <span className="ml-2 text-[10px] text-neutral-500">#{i + 1} gap</span>
                                        </Td>
                                        <Td className="font-black text-white">{formatCompact(s.count)}</Td>
                                        <Td><StatusBadge value="Missing" tone="warn" /></Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Panel>
            </div>
        </div>
    );
};

function formatPct2(n: number): string {
    return `${(n * 100).toFixed(1)}%`;
}

export default SearchPage;