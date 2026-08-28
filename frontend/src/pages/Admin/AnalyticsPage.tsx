import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Users, AlertOctagon, Timer, ShieldAlert, Crown, Boxes, RefreshCw } from 'lucide-react';
import { getAnalytics, AdminAnalytics } from '../../services/admin';
import {
    PageHeader, StatCard, Panel, PanelHeader, StatusBadge, EmptyState, ErrorState,
    Table, Th, Td, useData, formatCompact, formatPct, formatMs, timeAgo,
} from '../../components/admin/AdminUi';
import { RequestsChart, ToolBars, Donut, LegendList } from '../../components/admin/Charts';

const RANGES = [
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
    { id: '90d', label: '90 days' },
];

const AnalyticsPage: React.FC = () => {
    const [range, setRange] = useState('30d');
    const [params] = useSearchParams();
    const toolFilter = params.get('tool') || '';
    const a = useData(() => getAnalytics(range), [range]);

    if (a.loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-lg border-2 border-white bg-brand-surface skeleton-glass skeleton-pulse" />
                ))}
            </div>
        );
    }
    if (a.error) return <ErrorState message={a.error} onRetry={() => void a.reload()} />;

    const d: AdminAnalytics = a.data!;
    const tools = toolFilter ? d.byTool.filter((t) => t.name === toolFilter) : d.byTool;
    const tierData = Object.entries(d.byTier).map(([name, value]) => ({ name: name === 'FREE' ? 'Free' : name, value }));
    const statusData = Object.entries(d.byStatus)
        .map(([name, value]) => ({ name: `HTTP ${name}`, value }))
        .sort((x, y) => y.value - x.value);
    const statusRows = Object.entries(d.byStatus).sort((a, b) => Number(b[0]) - Number(a[0]));

    return (
        <div>
            <PageHeader
                title="MCP Analytics"
                subtitle="Deep-dive metrics across requests, tools, plans and status codes."
                actions={
                    <div className="flex items-center gap-2">
                        {RANGES.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRange(r.id)}
                                className={`px-4 py-2 rounded-md border-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                                    range === r.id ? 'bg-brand-blue text-white border-white' : 'bg-brand-surface text-neutral-400 border-white hover:text-white'
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                        <button onClick={() => void a.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                            <RefreshCw size={13} /> Refresh
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Requests" value={formatCompact(d.summary.requests)} sub={`${formatCompact(d.summary.uniqueUsers)} unique users`} icon={Activity} />
                <StatCard label="Unique Users" value={formatCompact(d.summary.uniqueUsers)} icon={Users} />
                <StatCard label="Error Rate" value={formatPct(d.summary.errorRate)} icon={AlertOctagon} tone={d.summary.errorRate > 0.05 ? 'bad' : 'ok'} />
                <StatCard label="Avg Response" value={formatMs(d.summary.avgResponseTimeMs)} icon={Timer} />
                <StatCard label="Rate Limited" value={formatCompact(d.summary.rateLimitEvents)} icon={ShieldAlert} tone="warn" />
                <StatCard label="Premium Denied" value={formatCompact(d.summary.premiumDenied)} icon={Crown} tone="warn" />
                <StatCard label="Auth Failures" value={formatCompact(d.summary.authFailures)} icon={ShieldAlert} tone="bad" />
                <StatCard label="Premium / Free" value={formatCompact(d.summary.requests)} sub={`${formatCompact(Object.values(d.byTier).reduce((n, x) => n + x, 0))} tiered events`} icon={Boxes} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mt-6">
                <Panel className="lg:col-span-2">
                    <PanelHeader title="Requests over time" subtitle={`Per day · last ${range}`} />
                    <div className="p-5">
                        <RequestsChart data={d.byDay} />
                    </div>
                </Panel>
                <Panel>
                    <PanelHeader title="Free vs Pro" subtitle="Events by plan tier" />
                    <div className="p-5">
                        <Donut data={tierData.filter((t) => t.value > 0)} />
                        <LegendList
                            items={tierData.map((t) => ({
                                label: t.name,
                                value: formatCompact(t.value),
                                color: t.name === 'Free' || t.name === 'FREE' ? '#3D5CFF' : '#FFC700',
                            }))}
                        />
                    </div>
                </Panel>
            </div>

            <Panel className="mt-6">
                <PanelHeader title="Tool Analytics" subtitle={toolFilter ? `Filtered to ${toolFilter}` : 'Ranking of MCP tool usage'} actions={toolFilter ? <StatusBadge value={`${tools.length} tool`} tone="warn" /> : <StatusBadge value={`${tools.length} tools`} tone="ok" />} />
                {tools.length === 0 ? (
                    <EmptyState title="No tool usage" message="No tools were called in this range." />
                ) : (
                    <div className="grid lg:grid-cols-2 gap-6 p-5">
                        <ToolBars data={tools.map((t) => ({ name: t.name, total: t.total }))} />
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Tool</Th>
                                    <Th>Requests</Th>
                                    <Th>Errors</Th>
                                    <Th>Error %</Th>
                                    <Th>Avg</Th>
                                    <Th>Users</Th>
                                    <Th>Last used</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {tools.map((t) => (
                                    <tr key={t.name} className="hover:bg-neutral-900/40 transition-colors">
                                        <Td className="font-mono text-brand-blue">{t.name}</Td>
                                        <Td>{formatCompact(t.total)}</Td>
                                        <Td className={t.failed > 0 ? 'text-brand-red' : ''}>{formatCompact(t.failed)}</Td>
                                        <Td>{t.total ? formatPct(t.failed / t.total) : '—'}</Td>
                                        <Td>{t.avgResponseTimeMs ? formatMs(t.avgResponseTimeMs) : '—'}</Td>
                                        <Td>{formatCompact(t.uniqueUsers)}</Td>
                                        <Td>{timeAgo(t.lastUsed)}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Panel>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
                <Panel>
                    <PanelHeader title="Status codes" subtitle="Distribution of HTTP responses" />
                    {statusData.length === 0 ? (
                        <EmptyState title="No status data" />
                    ) : (
                        <div className="p-5">
                            <Donut data={statusData} height={210} />
                            <LegendList items={statusData.map((s) => ({ label: s.name, value: formatCompact(s.value) }))} />
                        </div>
                    )}
                </Panel>
                <Panel>
                    <PanelHeader title="Top components" subtitle="Most requested components in range" />
                    {d.topComponents.length === 0 ? (
                        <EmptyState title="No component activity" message="No components were requested yet." />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>#</Th>
                                    <Th>Component</Th>
                                    <Th>Category</Th>
                                    <Th>Requests</Th>
                                    <Th>Code</Th>
                                    <Th>Tone</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {d.topComponents.slice(0, 12).map((c, i) => (
                                    <tr key={c.id} className="hover:bg-neutral-900/40 transition-colors">
                                        <Td className="text-neutral-500">#{i + 1}</Td>
                                        <Td>
                                            <div className="font-semibold text-white">{c.title}</div>
                                            <div className="text-[10px] font-mono text-neutral-500">{c.id}</div>
                                        </Td>
                                        <Td className="text-neutral-400">{c.category}</Td>
                                        <Td>{formatCompact(c.count)}</Td>
                                        <Td>{formatCompact(c.codeFetches)}</Td>
                                        <Td>
                                            <StatusBadge value={c.isPremium ? 'Premium' : 'Free'} tone={c.isPremium ? 'warn' : 'ok'} />
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Panel>
            </div>

            {statusRows.length > 0 && (
                <Panel className="mt-6">
                    <PanelHeader title="Status breakdown" subtitle={statusRows.map(([code, count]) => code).join(' · ')} />
                    <div className="p-5 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {statusRows.map(([code, count]) => (
                            <div key={code} className="rounded-md border-2 border-white bg-brand-bg p-4 text-center">
                                <p className="text-lg font-black text-white">{code}</p>
                                <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-1">HTTP</p>
                                <p className="text-xs font-mono text-brand-blue mt-1">{formatCompact(count)}</p>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}
        </div>
    );
};

export default AnalyticsPage;