import React from 'react';
import { Activity, Database, Cloud, MemoryStick, Wrench, RefreshCw, Timer } from 'lucide-react';
import { getHealth } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatCard, StatusBadge, ErrorState, SkeletonBlock,
    useData, formatCompact, timeAgo, Table, Th, Td,
} from '../../components/admin/AdminUi';

function humanBytes(n?: number): string {
    if (n === undefined || n === null || isNaN(n)) return '—';
    if (n >= 1073741824) return `${(n / 1073741824).toFixed(2)} GB`;
    if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
    if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${n} B`;
}

function humanUptime(s?: number): string {
    if (s === undefined || s === null) return '—';
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

const HealthPage: React.FC = () => {
    const h = useData(() => getHealth(), [], { intervalMs: 15000 });

    if (h.loading) {
        return (
            <div className="space-y-6">
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <SkeletonBlock className="h-28" />
                    <SkeletonBlock className="h-28" />
                    <SkeletonBlock className="h-28" />
                    <SkeletonBlock className="h-28" />
                </div>
                <SkeletonBlock className="h-80" />
            </div>
        );
    }
    if (h.error) return <ErrorState message={h.error} onRetry={() => void h.reload()} />;

    const data = h.data!;

    return (
        <div>
            <PageHeader
                title="Server Health"
                subtitle="Live status of the MCP server process and its MongoDB connection."
                actions={
                    <button onClick={() => void h.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                        <RefreshCw size={13} /> Refresh
                    </button>
                }
            />

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Panel className={data.status === 'ok' ? '' : ''}>
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Status</p>
                            <div className={`w-3 h-3 rounded-full ${data.dbConnected ? 'bg-brand-blue' : 'bg-brand-yellow'} animate-pulse`} />
                        </div>
                        <div className="mt-3"><StatusBadge value={data.status} tone={data.dbConnected ? 'ok' : 'warn'} /></div>
                        <p className="text-[11px] text-neutral-500 mt-2">Checked {timeAgo(data.timestamp)}</p>
                    </div>
                </Panel>
                <StatCard label="Uptime" value={humanUptime(data.uptime)} icon={Timer} sub={`${data.service} v${data.version}`} />
                <StatCard label="Memory (RSS)" value={humanBytes(data.memory?.rss)} icon={MemoryStick} sub={`heap ${humanBytes(data.memory?.heapUsed)}`} />
                <StatCard label="Database" value={data.dbConnected ? 'Online' : 'Offline'} icon={Database} tone={data.dbConnected ? 'ok' : 'bad'} sub="MongoDB · uihub" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
                <Panel>
                    <PanelHeader title="Service" subtitle="Process information" actions={<Cloud size={14} className="text-brand-blue" />} />
                    <div className="divide-y-2 divide-white/60">
                        <div className="flex items-center justify-between px-5 py-4">
                            <span className="text-xs text-neutral-400">Service</span>
                            <span className="font-mono text-sm text-white">{data.service}</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-4">
                            <span className="text-xs text-neutral-400">Version</span>
                            <span className="font-mono text-sm text-white">{data.version}</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-4">
                            <span className="text-xs text-neutral-400">Server time</span>
                            <span className="font-mono text-sm text-white">{new Date(data.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-4">
                            <span className="text-xs text-neutral-400">MongoDB</span>
                            <StatusBadge value={data.dbConnected ? 'Connected' : 'Disconnected'} tone={data.dbConnected ? 'ok' : 'bad'} />
                        </div>
                    </div>
                </Panel>

                <Panel>
                    <PanelHeader title="Configuration snapshot" subtitle="Applied MCP settings" actions={<Wrench size={14} className="text-brand-blue" />} />
                    <div className="divide-y-2 divide-white/60">
                        <div className="flex items-center justify-between px-5 py-4">
                            <span className="text-xs text-neutral-400">Authentication</span>
                            <StatusBadge value={data.config.authEnabled ? 'Enabled' : 'Off'} tone={data.config.authEnabled ? 'ok' : 'warn'} />
                        </div>
                        <div className="flex items-center justify-between px-5 py-4">
                            <span className="text-xs text-neutral-400">Analytics</span>
                            <StatusBadge value={data.config.analyticsEnabled ? 'Enabled' : 'Off'} tone={data.config.analyticsEnabled ? 'ok' : 'warn'} />
                        </div>
                        <div className="flex items-center justify-between px-5 py-4">
                            <span className="text-xs text-neutral-400">Logging</span>
                            <StatusBadge value={data.config.loggingEnabled ? 'Enabled' : 'Off'} tone={data.config.loggingEnabled ? 'ok' : 'warn'} />
                        </div>
                        <div className="flex items-center justify-between px-5 py-4">
                            <span className="text-xs text-neutral-400">Tools enabled</span>
                            <span className="font-mono text-sm font-bold text-white">{data.config.toolsEnabled} / {data.config.toolsTotal}</span>
                        </div>
                    </div>
                </Panel>
            </div>

            <Panel className="mt-6">
                <PanelHeader
                    title="MongoDB Collections"
                    subtitle="Real document counts in the uihub database (updates on each poll)"
                    actions={<StatusBadge value={data.dbConnected ? 'DB Connected' : 'DB Offline'} tone={data.dbConnected ? 'ok' : 'bad'} />}
                />
                {!(data.collections && data.collections.length > 0) ? (
                    <div className="p-5 text-xs text-neutral-400">No collection data available.</div>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <Th>Collection</Th>
                                <Th>Documents</Th>
                                <Th>Last activity</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.collections.map((c) => (
                                <tr key={c.name} className="hover:bg-neutral-900/40 transition-colors">
                                    <Td className="font-mono text-brand-blue">{c.name}</Td>
                                    <Td className="text-white font-semibold">{formatCompact(c.count)}</Td>
                                    <Td className="text-neutral-400">{c.lastEventAt ? timeAgo(c.lastEventAt) : '—'}</Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Panel>
        </div>
    );
};

export default HealthPage;