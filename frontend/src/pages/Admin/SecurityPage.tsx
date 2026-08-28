import React from 'react';
import { ShieldAlert, KeyRound, Fingerprint, AlertOctagon, Ban, Crown, RefreshCw } from 'lucide-react';
import { getSecurity } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatCard, StatusBadge, EmptyState, ErrorState, SkeletonTable,
    Table, Th, Td, useData, formatCompact, formatDate, timeAgo,
} from '../../components/admin/AdminUi';

const SecurityPage: React.FC = () => {
    const s = useData(() => getSecurity(), []);

    if (s.loading) return <SkeletonTable rows={6} />;
    if (s.error) return <ErrorState message={s.error} onRetry={() => void s.reload()} />;

    const data = s.data!;
    const maxRate = Math.max(1, ...data.rateLimitTopKeys.map((r) => r.count));

    return (
        <div>
            <PageHeader
                title="Security"
                subtitle="Authentication failures, rate limiting and premium-access denials across the MCP service."
                actions={
                    <button onClick={() => void s.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                        <RefreshCw size={13} /> Refresh
                    </button>
                }
            />

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Auth Failures" value={formatCompact(data.summary.authFailures24h)} icon={Fingerprint} tone="bad" sub="last 24h" />
                <StatCard label="Rate Limited" value={formatCompact(data.summary.rateLimitEvents24h)} icon={Ban} tone="warn" sub="last 24h" />
                <StatCard label="Premium Denied" value={formatCompact(data.summary.premiumDenied24h)} icon={Crown} tone="warn" sub="last 24h" />
                <StatCard label="Security Events" value={formatCompact(data.summary.totalSecurityEvents)} icon={ShieldAlert} sub="last 2 days" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
                <Panel>
                    <PanelHeader title="Rate limit offenders" subtitle="Keys hitting the rate limit the most (48h)" actions={<Ban size={14} className="text-brand-yellow" />} />
                    {data.rateLimitTopKeys.length === 0 ? (
                        <EmptyState title="No rate limiting" message="No requests have been rate-limited recently." />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Key Prefix</Th>
                                    <Th>Rate Limit Hits</Th>
                                    <Th>Share</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.rateLimitTopKeys.map((r) => (
                                    <tr key={r.keyPrefix} className="hover:bg-neutral-900/40 transition-colors">
                                        <Td>
                                            <span className="font-mono text-brand-blue">{r.keyPrefix}</span>
                                            <div className="h-1.5 rounded-full bg-neutral-800 mt-2 overflow-hidden w-36">
                                                <div className="h-full bg-brand-yellow" style={{ width: `${(r.count / maxRate) * 100}%` }} />
                                            </div>
                                        </Td>
                                        <Td className="font-black text-white">{formatCompact(r.count)}</Td>
                                        <Td className="text-neutral-400">{data.summary.rateLimitEvents24h ? `${Math.round((r.count / Math.max(1, data.summary.totalSecurityEvents)) * 100)}%` : '—'}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Panel>

                <Panel>
                    <PanelHeader title="Current policy" subtitle="As configured in mcp_config/app" actions={<KeyRound size={14} className="text-brand-blue" />} />
                    <div className="divide-y-2 divide-white/60">
                        <div className="flex items-center justify-between px-5 py-4">
                            <span className="text-xs text-neutral-400">Authentication required</span>
                            <StatusBadge value={data.authEnabled ? 'Enabled' : 'Off'} tone={data.authEnabled ? 'ok' : 'warn'} />
                        </div>
                        <div className="flex items-center justify-between px-5 py-4">
                            <span className="text-xs text-neutral-400">Free tier rate limit</span>
                            <span className="font-mono text-sm font-bold text-white">{formatCompact(data.rateLimitFree)} / day</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-4">
                            <span className="text-xs text-neutral-400">Pro+ tier rate limit</span>
                            <span className="font-mono text-sm font-bold text-white">{formatCompact(data.rateLimitPro)} / day</span>
                        </div>
                    </div>
                </Panel>
            </div>

            <Panel className="mt-6">
                <PanelHeader title="Recent security events" subtitle="Auth failures, rate limits and premium denials (48h, newest first)" actions={<AlertOctagon size={14} className="text-brand-red" />} />
                {data.recentEvents.length === 0 ? (
                    <EmptyState icon={ShieldAlert} title="All quiet" message="No security events in the last 48 hours." />
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <Th>When</Th>
                                <Th>Event</Th>
                                <Th>Key</Th>
                                <Th>Tier</Th>
                                <Th>Tool</Th>
                                <Th>Code</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentEvents.map((e, i) => {
                                const bad = e.event !== 'premium_denied';
                                return (
                                    <tr key={i} className="hover:bg-neutral-900/40 transition-colors">
                                        <Td className="text-neutral-400">{timeAgo(e.timestamp)}</Td>
                                        <Td><StatusBadge value={e.event} tone={bad ? 'bad' : 'warn'} /></Td>
                                        <Td><span className="font-mono text-xs">{e.keyPrefix}</span></Td>
                                        <Td><span className="font-mono text-xs uppercase">{e.tier}</span></Td>
                                        <Td className="font-mono text-xs">{e.tool}</Td>
                                        <Td className="font-mono text-xs">{e.errorCode}</Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                )}
            </Panel>
        </div>
    );
};

export default SecurityPage;