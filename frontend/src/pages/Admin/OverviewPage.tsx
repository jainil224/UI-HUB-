import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity, Zap, Users, KeyRound, AlertOctagon, Timer, ServerCog, ArrowRight, RefreshCw,
    Search, Download, ShieldAlert, Crown, LucideIcon
} from 'lucide-react';
import { getOverview, getLogs, McpLogEntry } from '../../services/admin';
import {
    PageHeader, StatCard, Panel, PanelHeader, StatusBadge, EmptyState, ErrorState,
    SkeletonTable, useData, formatCompact, formatPct, formatMs, timeAgo, Tone,
} from '../../components/admin/AdminUi';
import { RequestsChart, ToolBars } from '../../components/admin/Charts';

const RANGES: Array<{ id: string; label: string }> = [
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
    { id: '90d', label: '90 days' },
];

const OverviewPage: React.FC = () => {
    const [range, setRange] = useState('30d');
    const overview = useData(() => getOverview(range), [range], { intervalMs: 20000 });
    const activity = useData(() => getLogs({ pageSize: 8 }), [], { intervalMs: 20000 });

    if (overview.loading || activity.loading) {
        return (
            <div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 rounded-lg border-2 border-white bg-brand-surface skeleton-glass skeleton-pulse" />
                    ))}
                </div>
                <SkeletonTable rows={5} />
            </div>
        );
    }

    if (overview.error) {
        return <ErrorState message={overview.error} onRetry={() => void overview.reload()} />;
    }

    const d = overview.data!;
    const serverTone: Tone = d.dbConnected ? 'ok' : 'bad';
    const serverLabel = d.dbConnected ? 'Operational' : 'Offline';

    const tierDonut =
        d.stats.freeUsage > 0 || d.stats.proUsage > 0
            ? [
                  { name: 'Free', value: d.stats.freeUsage },
                  { name: 'Pro', value: d.stats.proUsage },
              ]
            : [];

    const recentActivity: Array<{ icon: LucideIcon; text: React.ReactNode; ts: number; tone: Tone }> = (activity.data?.events || []).map((e: McpLogEntry) => {
        const icon = e.event === 'auth_failure' || e.event === 'rate_limit' || e.event === 'premium_denied' ? ShieldAlert : e.event === 'component_search' ? Search : Download;
        const tone: Tone = e.status === 200 ? 'ok' : e.status === 429 ? 'warn' : e.status === 403 ? 'bad' : 'warn';
        let text: React.ReactNode = (
            <>
                <span className="font-mono text-brand-blue">{e.tool || e.event}</span>
                <span className="text-neutral-400"> · {e.event}</span>
            </>
        );
        if (e.event === 'component_search' && e.query) {
            text = (
                <>
                    search <span className="text-brand-yellow">"{e.query}"</span>
                    <span className="text-neutral-400"> · {e.tier || 'user'}</span>
                </>
            );
        }
        return { icon, text, ts: e.timestamp, tone };
    });

    return (
        <div>
            <PageHeader
                title="MCP Overview"
                subtitle="Live snapshot of the MCP service — real data from the mcp-server and MongoDB."
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
                        <button
                            onClick={() => void Promise.all([overview.reload(), activity.reload()])}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                        >
                            <RefreshCw size={13} /> Refresh
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Requests" value={formatCompact(d.stats.totalRequests)} sub={`${formatCompact(d.stats.last7Requests)} in last 7 days`} icon={Activity} />
                <StatCard label="Requests Today" value={formatCompact(d.stats.last24Requests)} sub={`${formatCompact(d.stats.last24Requests)} in last 24h`} icon={Zap} />
                <StatCard label="Active Users" value={formatCompact(d.stats.activeUsers24h)} sub={`${formatCompact(d.stats.uniqueUsers)} unique in range`} icon={Users} />
                <StatCard label="Active API Keys" value={formatCompact(d.stats.activeKeys)} sub={`${formatCompact(d.stats.totalKeys)} total keys`} icon={KeyRound} />
                <StatCard label="Error Rate" value={formatPct(d.stats.errorRate)} sub={`${formatCompact(d.stats.failedRequests)} failed requests`} icon={AlertOctagon} tone={d.stats.errorRate > 0.05 ? 'bad' : 'ok'} />
                <StatCard label="Avg Response" value={formatMs(d.stats.avgResponseTimeMs)} sub={`${formatCompact(d.stats.rateLimitEvents)} rate limited`} icon={Timer} />
                <StatCard label="Server Status" value={serverLabel} sub={`${formatCompact(d.uptimeSeconds)}s uptime`} icon={ServerCog} tone={serverTone} />
                <StatCard label="Auth Failures" value={formatCompact(d.stats.authFailures)} sub={`${formatCompact(d.stats.premiumDenied)} premium denied`} icon={ShieldAlert} tone="warn" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mt-6">
                <Panel className="lg:col-span-2">
                    <PanelHeader
                        title={`MCP Requests · last ${range}`}
                        subtitle="Requests per day from real analytics events"
                        actions={<StatusBadge value={`${formatCompact(d.alerts.length)} alerts`} tone={d.alerts.length ? (d.alerts.some((a) => a.severity === 'critical') ? 'bad' : 'warn') : 'ok'} />}
                    />
                    <div className="p-5">
                        <RequestsChart data={d.timeseries} />
                    </div>
                </Panel>

                <div>
                    <Panel>
                        <PanelHeader title="Free vs Pro" subtitle="Request share in range" />
                        <div className="p-5">
                            {tierDonut.length === 0 ? (
                                <EmptyState title="No tier data" message="No requests recorded in this range." />
                            ) : (
                                <div className="flex flex-col items-center justify-center min-h-[240px]">
                                    <div className="w-32 h-32 rounded-full border-8 border-brand-blue flex items-center justify-center relative">
                                        <div className="text-center">
                                            <p className="text-xl font-black text-white">{formatCompact(tierDonut[0].value + (tierDonut[1]?.value || 0))}</p>
                                            <p className="text-[9px] uppercase tracking-widest text-neutral-400">requests</p>
                                        </div>
                                    </div>
                                    <div className="w-full space-y-2 mt-5">
                                        {tierDonut.map((t) => (
                                            <div key={t.name} className="flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-2">
                                                    <span className={`w-2.5 h-2.5 rounded-sm ${t.name === 'Free' ? 'bg-neon-mid' : 'bg-brand-yellow'}`} />
                                                    <span className="text-neutral-300">{t.name}</span>
                                                </span>
                                                <span className="font-mono text-white">{formatCompact(t.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Panel>

                    <Panel className="mt-6">
                        <PanelHeader title="Recent Activity" subtitle="Latest MCP events" actions={<Link to="/admin/mcp/logs" className="text-[10px] font-black uppercase tracking-widest text-brand-blue hover:text-white no-underline cursor-pointer">View All Logs →</Link>} />
                        <div className="divide-y-2 divide-white/60">
                            {recentActivity.length === 0 ? (
                                <EmptyState title="No activity yet" message="No MCP events recorded." />
                            ) : (
                                recentActivity.map((a, i) => {
                                    const Icon = a.icon;
                                    return (
                                        <div key={i} className="flex items-center gap-3 px-5 py-3">
                                            <div className={`w-8 h-8 shrink-0 rounded-md border-2 flex items-center justify-center ${
                                                a.tone === 'ok' ? 'bg-brand-blue text-white border-white' : a.tone === 'warn' ? 'bg-brand-yellow text-black border-black' : 'bg-brand-red text-white border-white'
                                            }`}>
                                                <Icon size={14} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs text-white/90 truncate">{a.text}</div>
                                                <div className="text-[10px] text-neutral-500">{timeAgo(a.ts)}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Panel>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
                <Panel>
                    <PanelHeader title="Top Tools" subtitle="Most used MCP tools in range" actions={<Link to="/admin/mcp/tools" className="text-[10px] font-black uppercase tracking-widest text-brand-blue hover:text-white no-underline cursor-pointer">Manage Tools →</Link>} />
                    <div className="p-5">
                        <ToolBars data={d.topTools.map((t) => ({ name: t.name, total: t.total }))} />
                    </div>
                </Panel>

                <Panel>
                    <PanelHeader title="Error Rate" subtitle="Failed MCP requests per day" />
                    <div className="p-5">
                        <RequestsChart data={d.days} height={240} />
                    </div>
                </Panel>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link to="/admin/mcp/analytics" className="brutal-btn-primary inline-flex px-6 py-3 text-[11px] items-center gap-2 no-underline cursor-pointer">
                    Full Analytics <ArrowRight size={14} />
                </Link>
                <Link to="/admin/mcp/playground" className="brutal-btn-primary inline-flex px-6 py-3 text-[11px] items-center gap-2 no-underline cursor-pointer">
                    <Crown size={14} /> Open Playground
                </Link>
            </div>
        </div>
    );
};

export default OverviewPage;