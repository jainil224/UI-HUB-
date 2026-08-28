import React, { useState } from 'react';
import { ScrollText, RefreshCw } from 'lucide-react';
import { getAudit } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, EmptyState, ErrorState, SkeletonTable,
    Table, Th, Td, Pagination, useData, formatDate,
} from '../../components/admin/AdminUi';

const ACTION_LABELS: Record<string, { label: string; tone: string }> = {
    'tool.enable': { label: 'Tool Enabled', tone: 'ok' },
    'tool.disable': { label: 'Tool Disabled', tone: 'warn' },
    'user.suspend': { label: 'User Suspended', tone: 'bad' },
    'user.unsuspend': { label: 'User Unsuspended', tone: 'ok' },
    'api_key.revoke': { label: 'API Key Revoked', tone: 'bad' },
    'api_key.disable': { label: 'API Key Disabled', tone: 'warn' },
    'api_key.enable': { label: 'API Key Enabled', tone: 'ok' },
    'api_key.restore': { label: 'API Key Restored', tone: 'ok' },
    'alert.resolve': { label: 'Alert Resolved', tone: 'ok' },
    'alert.unresolve': { label: 'Alert Reopened', tone: 'warn' },
    'settings.update': { label: 'Settings Updated', tone: 'blue' },
    'playground.run': { label: 'Playground Run', tone: 'muted' },
    'playground.run_failed': { label: 'Playground Failed', tone: 'bad' },
    'export': { label: 'Data Exported', tone: 'muted' },
};

const toneClass = (tone: string): string => {
    switch (tone) {
        case 'ok': return 'bg-brand-blue text-white border-white';
        case 'bad': return 'bg-brand-red text-white border-white';
        case 'warn': return 'bg-brand-yellow text-black border-black';
        case 'blue': return 'bg-brand-blue text-white border-white';
        default: return 'bg-neutral-700 text-white border-white';
    }
};

const AuditPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const a = useData(() => getAudit(page, 25), [page]);

    if (a.loading) return <SkeletonTable rows={8} />;
    if (a.error) return <ErrorState message={a.error} onRetry={() => void a.reload()} />;

    const data = a.data!;

    return (
        <div>
            <PageHeader
                title="Audit Log"
                subtitle="Every privileged action taken in the admin console — who, what, when."
                actions={
                    <button onClick={() => void a.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                        <RefreshCw size={13} /> Refresh
                    </button>
                }
            />

            {data.entries.length === 0 ? (
                <Panel>
                    <EmptyState icon={ScrollText} title="No audit entries" message="No admin actions have been recorded yet." />
                </Panel>
            ) : (
                <Panel>
                    <Table>
                        <thead>
                            <tr>
                                <Th>When</Th>
                                <Th>Action</Th>
                                <Th>Admin</Th>
                                <Th>Target</Th>
                                <Th>Details</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.entries.map((entry) => {
                                const meta = ACTION_LABELS[entry.action] || { label: entry.action, tone: 'muted' };
                                return (
                                    <tr key={entry.id} className="hover:bg-neutral-900/40 transition-colors">
                                        <Td className="text-neutral-400">{formatDate(entry.at)}</Td>
                                        <Td>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest ${toneClass(meta.tone)}`}>
                                                {meta.label}
                                            </span>
                                        </Td>
                                        <Td className="text-white">{entry.adminEmail}</Td>
                                        <Td>
                                            <span className="font-mono text-xs">{entry.targetType}</span>
                                            {entry.targetId && <div className="text-[10px] font-mono text-neutral-500">{entry.targetId}</div>}
                                        </Td>
                                        <Td className="text-neutral-400 text-xs max-w-[240px]">
                                            {entry.meta ? (
                                                <span className="font-mono break-all">{Object.entries(entry.meta).map(([k, v]) => `${k}:${String(v)}`).join(' · ')}</span>
                                            ) : '—'}
                                        </Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                    <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
                </Panel>
            )}
        </div>
    );
};

export default AuditPage;