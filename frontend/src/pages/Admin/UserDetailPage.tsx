import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Ban, Undo2, ShieldCheck, Wrench, Calendar, Activity, ShieldAlert, Crown } from 'lucide-react';
import { getUserDetail, suspendUser, unsuspendUser } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatCard, StatusBadge, EmptyState, ErrorState, SkeletonBlock,
    Table, Th, Td, useData, formatCompact, formatDate, timeAgo, Tone,
} from '../../components/admin/AdminUi';
import { RequestsChart } from '../../components/admin/Charts';

const UserDetailPage: React.FC = () => {
    const { uid = '' } = useParams();
    const [busy, setBusy] = useState(false);
    const d = useData(() => getUserDetail(uid), [uid]);

    if (d.loading) {
        return (
            <div className="space-y-6">
                <SkeletonBlock className="h-40" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SkeletonBlock className="h-28" />
                    <SkeletonBlock className="h-28" />
                    <SkeletonBlock className="h-28" />
                    <SkeletonBlock className="h-28" />
                </div>
                <SkeletonBlock className="h-80" />
            </div>
        );
    }
    if (d.error) return <ErrorState message={d.error} onRetry={() => void d.reload()} />;

    const data = d.data!;
    const user = data.user;

    const toggleSuspend = async () => {
        setBusy(true);
        try {
            if (user.status === 'suspended') await unsuspendUser(user.uid);
            else await suspendUser(user.uid);
            await d.reload();
        } finally {
            setBusy(false);
        }
    };

    const tierTone: Tone = user.isAdmin ? 'blue' : user.plan === 'PRO' ? 'ok' : user.plan === 'ELITE' ? 'violet' : 'muted';

    const byDay = Object.entries(data.stats.byDay || {})
        .map(([date, requests]) => ({ date, requests }))
        .sort((a, b) => a.date.localeCompare(b.date));

    const toolRows = Object.entries(data.stats.byTool || {}).sort((a, b) => b[1].total - a[1].total);

    return (
        <div>
            <Link to="/admin/mcp/users" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-brand-blue hover:text-white no-underline mb-6 cursor-pointer">
                <ArrowLeft size={14} /> Back to Users
            </Link>

            <PageHeader
                title={user.name || 'User'}
                subtitle={`Details for MCP user ${user.email || user.uid}`}
                actions={
                    <button
                        onClick={() => void toggleSuspend()}
                        disabled={busy}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md border-2 text-[11px] font-black uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-40 ${
                            user.status === 'suspended'
                                ? 'bg-brand-blue text-white border-white hover:bg-brand-blue-dark'
                                : 'bg-brand-red text-white border-white hover:bg-red-700'
                        }`}
                    >
                        {busy ? '…' : user.status === 'suspended' ? <><Undo2 size={14} /> Unsuspend</> : <><Ban size={14} /> Suspend</>}
                    </button>
                }
            />

            <Panel>
                <div className="p-6 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 shrink-0 rounded-full border-2 border-white bg-brand-bg flex items-center justify-center text-xl font-black uppercase text-white">
                            {(user.name || user.email || '?').slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-xl font-black text-white">{user.name || 'Unknown'}</h2>
                                {user.isAdmin && <StatusBadge value="Admin" tone="blue" />}
                                <StatusBadge value={user.status} tone={user.status === 'suspended' ? 'bad' : 'ok'} />
                            </div>
                            <p className="font-mono text-xs text-neutral-400 mt-1">{user.email || 'no email on file'}</p>
                            <p className="font-mono text-[11px] text-neutral-600 mt-0.5">{user.uid}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge value={user.plan} tone={tierTone} />
                        {user.plan === 'FREE' && <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500"><Crown size={13} /> free tier</span>}
                    </div>
                </div>
            </Panel>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                <StatCard label="Requests" value={formatCompact(data.stats.requests)} icon={Activity} sub={`${formatCompact(data.stats.failureCount)} failed`} />
                <StatCard label="Last Active" value={timeAgo(data.stats.lastActive)} icon={Calendar} />
                <StatCard label="Rate Limited" value={formatCompact(data.stats.rateLimitEvents)} icon={ShieldAlert} tone="warn" />
                <StatCard label="Premium Denied" value={formatCompact(data.stats.premiumDenied)} icon={ShieldAlert} tone="bad" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
                <Panel>
                    <PanelHeader title="API Keys" subtitle={`${formatCompact(user.keys?.length || 0)} key(s) on file`} actions={<ShieldCheck size={14} className="text-brand-blue" />} />
                    {!user.keys || user.keys.length === 0 ? (
                        <EmptyState title="No API keys" message="This user has no keys in the MCP API key registry." />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Key</Th>
                                    <Th>Name</Th>
                                    <Th>Status</Th>
                                    <Th>Created</Th>
                                    <Th>Last Used</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {user.keys.map((k) => (
                                    <tr key={k.id} className="hover:bg-neutral-900/40 transition-colors">
                                        <Td className="font-mono text-brand-blue">{k.keyPrefix}••••••••••••</Td>
                                        <Td className="text-neutral-300">{k.name || '—'}</Td>
                                        <Td><StatusBadge value={k.status} tone={k.status === 'active' ? 'ok' : 'warn'} /></Td>
                                        <Td>{formatDate(k.created_at)}</Td>
                                        <Td>{timeAgo(k.last_used_at)}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Panel>

                <Panel>
                    <PanelHeader title="Request Activity" subtitle="Per-day MCP usage" />
                    <div className="p-5">
                        <RequestsChart data={byDay} />
                    </div>
                </Panel>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
                <Panel>
                    <PanelHeader title="Tool Usage" subtitle="Which tools this user calls the most" actions={<Wrench size={14} className="text-brand-blue" />} />
                    {toolRows.length === 0 ? (
                        <EmptyState title="No tool usage" message="No analytics events for this user in the selected period." />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Tool</Th>
                                    <Th>Requests</Th>
                                    <Th>Failures</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {toolRows.slice(0, 12).map(([name, u]) => (
                                    <tr key={name} className="hover:bg-neutral-900/40 transition-colors">
                                        <Td className="font-mono">{name}</Td>
                                        <Td className="font-black text-white">{formatCompact(u.total)}</Td>
                                        <Td className={u.failed > 0 ? 'text-brand-red' : ''}>{u.failed}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Panel>

                <Panel>
                    <PanelHeader title="Recent Activity" subtitle="Latest MCP events for this user" />
                    {data.recentEvents.length === 0 ? (
                        <EmptyState title="No recent activity" message="No events recorded for this user." />
                    ) : (
                        <div className="divide-y-2 divide-white/60">
                            {data.recentEvents.slice(0, 10).map((e, i) => {
                                const isError = e.success === false || !!e.errorCode;
                                return (
                                    <div key={i} className="flex items-center justify-between gap-4 px-5 py-3">
                                        <div className="min-w-0">
                                            <p className="font-mono text-xs text-white truncate">{e.event}</p>
                                            <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                                                {e.tool ? `${e.tool} · ` : ''}{e.statusCode ? `HTTP ${e.statusCode} · ` : ''}{timeAgo(e.timestamp)}
                                            </p>
                                        </div>
                                        <StatusBadge value={isError ? e.errorCode || 'error' : 'success'} tone={isError ? 'bad' : 'ok'} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    );
};

export default UserDetailPage;