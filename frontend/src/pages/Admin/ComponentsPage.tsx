import React, { useState } from 'react';
import { Boxes, RefreshCw, Trophy, Code2, Search } from 'lucide-react';
import { getComponents, getSearchAnalytics, TopComponentUsage } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatusBadge, EmptyState, ErrorState, Table, Th, Td,
    useData, formatCompact, formatDate,
} from '../../components/admin/AdminUi';

type Sort = 'popular' | 'code' | 'least';

const ComponentsPage: React.FC = () => {
    const [sort, setSort] = useState<Sort>('popular');
    const [search, setSearch] = useState('');
    const c = useData(() => getComponents('30d'), []);
    const s = useData(() => getSearchAnalytics('30d'), []);
    const data = c.data;

    if (c.loading || s.loading) {
        return (
            <div className="grid md:grid-cols-2 gap-6">
                <div className="h-96 rounded-lg border-2 border-white bg-brand-surface skeleton-glass skeleton-pulse" />
                <div className="h-96 rounded-lg border-2 border-white bg-brand-surface skeleton-glass skeleton-pulse" />
            </div>
        );
    }
    if (c.error) return <ErrorState message={c.error} onRetry={() => void c.reload()} />;

    let leaderboard: TopComponentUsage[] = [...(data?.topComponents || [])];
    if (sort === 'code') leaderboard.sort((a, b) => b.codeFetches - a.codeFetches);
    if (sort === 'least') leaderboard.sort((a, b) => a.count - b.count);

    const q = search.toLowerCase().trim();
    const catalog = (data?.catalog || []).filter((row) => !q || row.name.toLowerCase().includes(q) || row.id.toLowerCase().includes(q));

    const maxCount = Math.max(1, ...leaderboard.map((x) => x.count));

    const catAcc = new Map<string, { total: number; used: number; premium: number }>();
    (data?.catalog || []).forEach((row) => {
        const c = catAcc.get(row.category) || { total: 0, used: 0, premium: 0 };
        c.total += 1;
        if (row.usageCount > 0) c.used += 1;
        if (row.isPremium) c.premium += 1;
        catAcc.set(row.category, c);
    });
    const categories = Array.from(catAcc.entries())
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.total - a.total);

    return (
        <div>
            <PageHeader
                title="Component Analytics"
                subtitle="Which UI HUB components developers actually request through MCP."
                actions={
                    <button onClick={() => void Promise.all([c.reload(), s.reload()])} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                        <RefreshCw size={13} /> Refresh
                    </button>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue p-5"><p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Catalog</p><p className="text-2xl font-black text-white mt-1.5">{formatCompact(data?.total)}</p><p className="text-[11px] text-neutral-400 mt-2">{categories.length} real categories · {formatCompact(data?.premiumCount)} premium</p></div>
                <div className="relative border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue p-5"><p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Used Components</p><p className="text-2xl font-black text-white mt-1.5">{formatCompact(data?.usedComponents)}</p><p className="text-[11px] text-neutral-400 mt-2">of {formatCompact(data?.total)} catalog</p></div>
                <div className="relative border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue p-5"><p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Component Calls</p><p className="text-2xl font-black text-white mt-1.5">{formatCompact(data?.requestedComponentCalls)}</p><p className="text-[11px] text-neutral-400 mt-2">fetch + code events</p></div>
                <div className="relative border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue p-5"><p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Searches</p><p className="text-2xl font-black text-white mt-1.5">{formatCompact(s.data?.totalSearches)}</p><p className="text-[11px] text-neutral-400 mt-2">{formatCompact(s.data?.zeroResultSearches?.length)} zero-result queries</p></div>
            </div>

            <Panel className="mt-6">
                <PanelHeader
                    title="Category Breakdown"
                    subtitle={`${categories.length} real component categories · ${formatCompact(data?.total)} components`}
                />
                {categories.length === 0 ? (
                    <EmptyState icon={Boxes} title="No categories" message="No component catalog data available." />
                ) : (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
                        {categories.map((cat) => {
                            const pct = Math.max(1, Math.round((cat.total / (data?.total || 1)) * 100));
                            return (
                                <div key={cat.name} className="rounded-md border-2 border-white/60 bg-brand-bg p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-white capitalize">{cat.name}</p>
                                        <span className="text-xs font-black text-white">{cat.total}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-neutral-800 mt-3 overflow-hidden">
                                        <div className="h-full bg-brand-blue rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex items-center gap-3 mt-3 text-[10px] text-neutral-400">
                                        <span>{formatCompact(cat.used)} used</span>
                                        <span className="inline-flex items-center gap-1"><Code2 size={10} /> {formatCompact(cat.premium)} premium</span>
                                        <span className="ml-auto font-mono text-neutral-500">{pct}% of catalog</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Panel>

            <Panel className="mt-6">
                <PanelHeader
                    title="Component Leaderboard"
                    subtitle="Real request counts from MCP analytics"
                    actions={
                        <div className="flex items-center gap-2">
                            {([['popular', 'Most Popular'], ['code', 'Most Code Retrieved'], ['least', 'Least Used']] as Array<[Sort, string]>).map(([key, label]) => (
                                <button key={key} onClick={() => setSort(key)} className={`px-3 py-1.5 rounded-md border-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${sort === key ? 'bg-brand-blue text-white border-white' : 'bg-transparent text-neutral-400 border-white hover:text-white'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    }
                />
                {leaderboard.length === 0 ? (
                    <EmptyState icon={Boxes} title="No component activity" message="No components requested in the last 30 days." />
                ) : (
                    <div className="divide-y-2 divide-white/60">
                        {leaderboard.slice(0, 10).map((comp, i) => (
                            <div key={comp.id} className="flex items-center gap-4 px-5 py-4">
                                <div className={`w-9 h-9 shrink-0 rounded-md border-2 flex items-center justify-center text-xs font-black ${
                                    i === 0 ? 'bg-brand-yellow text-black border-black' : i === 1 ? 'bg-neutral-300 text-black border-black' : i === 2 ? 'bg-[#CD7F32] text-black border-black' : 'bg-brand-bg text-neutral-400 border-white'
                                }`}>
                                    {i < 3 ? <Trophy size={15} /> : `#${i + 1}`}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-white truncate">{comp.title}</p>
                                        <StatusBadge value={comp.isPremium ? 'Premium' : 'Free'} tone={comp.isPremium ? 'warn' : 'ok'} />
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-[11px] text-neutral-400">
                                        <span className="font-mono text-neutral-500 hidden sm:inline">{comp.id}</span>
                                        <span>{formatCompact(comp.uniqueUsers)} users</span>
                                        <span className="inline-flex items-center gap-1"><Code2 size={11} /> {formatCompact(comp.codeFetches)} code</span>
                                        <span>{comp.category}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-neutral-800 mt-2 overflow-hidden">
                                        <div className="h-full bg-brand-blue rounded-full" style={{ width: `${(comp.count / maxCount) * 100}%` }} />
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-lg font-black text-white leading-none">{formatCompact(comp.count)}</p>
                                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 mt-1">requests</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>

            <Panel className="mt-6">
                <PanelHeader
                    title="Catalog Usage"
                    subtitle="Every component with its MCP usage in the last 30 days"
                    actions={
                        <div className="flex items-center gap-2">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search catalog…"
                                className="rounded-md border-2 border-white/40 bg-brand-bg px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-brand-blue w-48"
                            />
                            <Search size={14} className="text-neutral-500" />
                        </div>
                    }
                />
                {catalog.length === 0 ? (
                    <EmptyState icon={Search} title="No matches" message="Try a different search term." />
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <Th>Component</Th>
                                <Th>Category</Th>
                                <Th>Tier</Th>
                                <Th>Requests</Th>
                                <Th>Code Fetches</Th>
                                <Th>Users</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {catalog.slice(0, 60).map((row) => (
                                <tr key={row.id} className="hover:bg-neutral-900/40 transition-colors">
                                    <Td>
                                        <div className="font-semibold text-white">{row.name}</div>
                                        <div className="text-[10px] font-mono text-neutral-500">{row.id}</div>
                                    </Td>
                                    <Td className="text-neutral-400">{row.category}</Td>
                                    <Td><StatusBadge value={row.isPremium ? 'Premium' : 'Free'} tone={row.isPremium ? 'warn' : 'ok'} /></Td>
                                    <Td>{formatCompact(row.usageCount)}</Td>
                                    <Td>{formatCompact(row.codeFetches)}</Td>
                                    <Td>{formatCompact(row.uniqueUsers)}</Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Panel>
        </div>
    );
};

export default ComponentsPage;