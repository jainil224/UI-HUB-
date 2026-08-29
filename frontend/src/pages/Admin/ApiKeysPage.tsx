import React, { useState } from 'react';
import { KeyRound, Search, Ban, Play, Undo2, Trash2, RefreshCw } from 'lucide-react';
import { listAdminKeys, patchApiKey, AdminKey } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatusBadge, EmptyState, ErrorState, SkeletonTable,
    Table, Th, Td, Pagination, useData, formatCompact, formatDate, timeAgo, Tone,
} from '../../components/admin/AdminUi';

const STATUSES = ['', 'active', 'revoked', 'disabled'];

const ApiKeysPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [busy, setBusy] = useState<string | null>(null);

    const k = useData(() => listAdminKeys({ status, search, page, pageSize: 25 }), [search, status, page]);

    const apply = (patch: Partial<{ search: string; status: string; page: number }>) => {
        if (patch.search !== undefined) setSearch(patch.search);
        if (patch.status !== undefined) setStatus(patch.status);
        if (patch.page !== undefined) setPage(patch.page);
        else setPage(1);
    };

    const act = async (key: AdminKey, action: 'revoke' | 'disable' | 'enable' | 'restore') => {
        setBusy(key.id);
        try {
            await patchApiKey(key.id, action);
            await k.reload();
        } finally {
            setBusy(null);
        }
    };

    if (k.loading) return <SkeletonTable rows={8} />;
    if (k.error) return <ErrorState message={k.error} onRetry={() => void k.reload()} />;

    const data = k.data!;

    return (
        <div>
            <PageHeader
                title="API Keys"
                subtitle="All keys issued to MCP clients. Revoke immediately to cut off access."
                actions={
                    <button onClick={() => void k.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                        <RefreshCw size={13} /> Refresh
                    </button>
                }
            />

            <Panel className="mb-6">
                <PanelHeader title="Filters" subtitle={`${formatCompact(data.total)} keys`} />
                <div className="p-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[220px] max-w-xs relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                            value={search}
                            onChange={(e) => apply({ search: e.target.value })}
                            placeholder="Search key prefix, name or email…"
                            className="w-full rounded-md border-2 border-white/40 bg-brand-bg pl-9 pr-3 py-2.5 text-xs font-mono text-white outline-none focus:border-brand-blue"
                        />
                    </div>
                    <select value={status} onChange={(e) => apply({ status: e.target.value })} className="rounded-md border-2 border-white/40 bg-brand-bg px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-brand-blue cursor-pointer">
                        {STATUSES.map((s) => <option key={s} value={s}>{s === '' ? 'All Statuses' : s}</option>)}
                    </select>
                </div>
            </Panel>

            {data.keys.length === 0 ? (
                <Panel>
                    <EmptyState icon={KeyRound} title="No keys found" message="No API keys match the current filters." />
                </Panel>
            ) : (
                <Panel>
                    <Table>
                        <thead>
                            <tr>
                                <Th>Key</Th>
                                <Th>Owner</Th>
                                <Th>Plan</Th>
                                <Th>Status</Th>
                                <Th>Usage (30d)</Th>
                                <Th>Created</Th>
                                <Th>Last Used</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.keys.map((key) => {
                                const statusTone: Tone = key.status === 'active' ? 'ok' : key.status === 'revoked' ? 'bad' : 'warn';
                                const planTone: Tone = key.plan === 'PRO' ? 'ok' : key.plan === 'ELITE' ? 'violet' : key.plan === 'ADMIN' ? 'blue' : 'muted';
                                return (
                                    <tr key={key.id} className="hover:bg-neutral-900/40 transition-colors">
                                        <Td>
                                            <span className="font-mono text-brand-blue">{key.keyPrefix}••••••••••••</span>
                                            {key.name && <div className="text-[10px] text-neutral-500 font-semibold">{key.name}</div>}
                                        </Td>
                                        <Td>
                                            <div className="font-semibold text-white">{key.email || '—'}</div>
                                            <div className="text-[10px] font-mono text-neutral-500">{key.uid}</div>
                                        </Td>
                                        <Td><StatusBadge value={key.plan} tone={planTone} /></Td>
                                        <Td><StatusBadge value={key.status} tone={statusTone} /></Td>
                                        <Td className="font-black text-white">{formatCompact(key.keyUsage30d)}</Td>
                                        <Td>{formatDate(key.created_at)}</Td>
                                        <Td>{timeAgo(key.last_used_at)}</Td>
                                        <Td>
                                            <div className="flex items-center justify-end gap-2">
                                                {key.status === 'active' && (
                                                    <>
                                                        <button
                                                            onClick={() => void act(key, 'disable')}
                                                            disabled={busy === key.id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 border-white text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40"
                                                        >
                                                            <Play size={12} /> Disable
                                                        </button>
                                                        <button
                                                            onClick={() => void act(key, 'revoke')}
                                                            disabled={busy === key.id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 bg-brand-red text-white border-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-40"
                                                        >
                                                            <Ban size={12} /> Revoke
                                                        </button>
                                                    </>
                                                )}
                                                {key.status === 'disabled' && (
                                                    <button
                                                        onClick={() => void act(key, 'enable')}
                                                        disabled={busy === key.id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 bg-brand-blue text-white border-white hover:bg-brand-blue-dark transition-colors cursor-pointer disabled:opacity-40"
                                                    >
                                                        <Play size={12} /> Enable
                                                    </button>
                                                )}
                                                {key.status === 'revoked' && (
                                                    <button
                                                        onClick={() => void act(key, 'restore')}
                                                        disabled={busy === key.id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 border-white text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40"
                                                    >
                                                        <Undo2 size={12} /> Restore
                                                    </button>
                                                )}
                                            </div>
                                        </Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                    <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => apply({ page: p })} />
                </Panel>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <Panel>
                    <PanelHeader title="What each action does" />
                    <div className="p-5 text-xs text-neutral-400 space-y-2.5">
                        <p className="flex items-center gap-2"><Ban size={13} className="text-brand-red" /> <span><b className="text-white">Revoke</b> permanently blocks a key, stamps <span className="font-mono">revoked_at</span>, and is irreversible except by restore.</span></p>
                        <p className="flex items-center gap-2"><Play size={13} className="text-brand-blue" /> <span><b className="text-white">Disable</b> temporarily pauses a key — can be enabled again anytime.</span></p>
                        <p className="flex items-center gap-2"><Undo2 size={13} className="text-brand-blue" /> <span><b className="text-white">Enable / Restore</b> set the key back to <span className="font-mono">active</span>.</span></p>
                    </div>
                </Panel>
                <Panel>
                    <PanelHeader title="Security note" />
                    <div className="p-5 text-xs text-neutral-400 space-y-2.5">
                        <p className="flex items-start gap-2"><Trash2 size={13} className="text-brand-red mt-0.5" /> <span>Revoked keys return <span className="font-mono">401 AUTH_FAILURE</span> from the MCP server immediately. Deleting is a MongoDB delete — prefer revoke so audits keep the full key history.</span></p>
                        <p className="flex items-start gap-2"><KeyRound size={13} className="text-brand-blue mt-0.5" /> <span>Full key IDs are never shown here — only the masked prefix.</span></p>
                    </div>
                </Panel>
            </div>
        </div>
    );
};

export default ApiKeysPage;