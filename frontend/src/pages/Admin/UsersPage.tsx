import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Ban, Undo2, Eye, RefreshCw } from 'lucide-react';
import { getUsers, suspendUser, unsuspendUser, AdminUser } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatusBadge, EmptyState, ErrorState, SkeletonTable,
    Table, Th, Td, Pagination, useData, formatCompact, timeAgo, formatDate, Tone,
} from '../../components/admin/AdminUi';

const PLANS = ['', 'FREE', 'PRO', 'ELITE', 'ADMIN'];
const STATUSES = ['', 'active', 'suspended'];

const UsersPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [plan, setPlan] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [busy, setBusy] = useState<string | null>(null);

    const u = useData(() => getUsers({ search, plan, status, page, pageSize: 25 }), [search, plan, status, page]);

    const apply = (patch: Partial<{ search: string; plan: string; status: string; page: number }>) => {
        if (patch.search !== undefined) setSearch(patch.search);
        if (patch.plan !== undefined) setPlan(patch.plan);
        if (patch.status !== undefined) setStatus(patch.status);
        if (patch.page !== undefined) setPage(patch.page);
        else setPage(1);
    };

    const toggleSuspend = async (user: AdminUser) => {
        setBusy(user.uid);
        try {
            if (user.status === 'suspended') await unsuspendUser(user.uid);
            else await suspendUser(user.uid);
            await u.reload();
        } finally {
            setBusy(null);
        }
    };

    if (u.loading) return <SkeletonTable rows={8} />;
    if (u.error) return <ErrorState message={u.error} onRetry={() => void u.reload()} />;

    const data = u.data!;

    return (
        <div>
            <PageHeader
                title="MCP Users"
                subtitle="Everyone with access to the MCP service — plans, keys, requests and activity."
                actions={
                    <button onClick={() => void u.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                        <RefreshCw size={13} /> Refresh
                    </button>
                }
            />

            <Panel className="mb-6">
                <PanelHeader title="Filters" subtitle={`${formatCompact(data.total)} users`} />
                <div className="p-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[220px] max-w-xs relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                            value={search}
                            onChange={(e) => apply({ search: e.target.value })}
                            placeholder="Search name, email or user ID…"
                            className="w-full rounded-md border-2 border-white/40 bg-brand-bg pl-9 pr-3 py-2.5 text-xs font-mono text-white outline-none focus:border-brand-blue"
                        />
                    </div>
                    <select value={plan} onChange={(e) => apply({ plan: e.target.value })} className="rounded-md border-2 border-white/40 bg-brand-bg px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-brand-blue cursor-pointer">
                        {PLANS.map((p) => <option key={p} value={p}>{p === '' ? 'All Plans' : p}</option>)}
                    </select>
                    <select value={status} onChange={(e) => apply({ status: e.target.value })} className="rounded-md border-2 border-white/40 bg-brand-bg px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-brand-blue cursor-pointer">
                        {STATUSES.map((s) => <option key={s} value={s}>{s === '' ? 'All Statuses' : s}</option>)}
                    </select>
                </div>
            </Panel>

            {data.users.length === 0 ? (
                <Panel>
                    <EmptyState icon={Users} title="No users found" message="No MCP users match the current filters." />
                </Panel>
            ) : (
                <Panel>
                    <Table>
                        <thead>
                            <tr>
                                <Th>User</Th>
                                <Th>Plan</Th>
                                <Th>Requests</Th>
                                <Th>API Keys</Th>
                                <Th>Last Activity</Th>
                                <Th>Status</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.users.map((user) => {
                                const tierTone: Tone = user.isAdmin ? 'blue' : user.plan === 'PRO' ? 'ok' : user.plan === 'ELITE' ? 'violet' : 'muted';
                                return (
                                    <tr key={user.uid} className="hover:bg-neutral-900/40 transition-colors">
                                        <Td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 shrink-0 rounded-full border-2 border-white bg-brand-bg flex items-center justify-center text-[10px] font-black uppercase text-white">
                                                    {(user.name || user.email || '?').slice(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{user.name || 'Unknown'}</p>
                                                    <p className="text-[10px] font-mono text-neutral-500">{user.email || user.uid}</p>
                                                </div>
                                            </div>
                                        </Td>
                                        <Td><StatusBadge value={user.plan} tone={tierTone} /></Td>
                                        <Td className="font-black text-white">{formatCompact(user.requests)}</Td>
                                        <Td>
                                            <span className="font-mono">{formatCompact(user.activeKeyCount)}</span>
                                            <span className="text-neutral-500"> / </span>
                                            <span className="font-mono text-neutral-400">{formatCompact(user.keyCount)}</span>
                                        </Td>
                                        <Td>{user.lastActive ? timeAgo(user.lastActive) : 'Never'}</Td>
                                        <Td><StatusBadge value={user.status} tone={user.status === 'suspended' ? 'bad' : 'ok'} /></Td>
                                        <Td>
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/admin/mcp/users/${encodeURIComponent(user.uid)}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 border-white text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors no-underline cursor-pointer">
                                                    <Eye size={12} /> View
                                                </Link>
                                                <button
                                                    onClick={() => void toggleSuspend(user)}
                                                    disabled={busy === user.uid}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-40 ${
                                                        user.status === 'suspended'
                                                            ? 'bg-brand-blue text-white border-white hover:bg-brand-blue-dark'
                                                            : 'bg-brand-red text-white border-white hover:bg-red-700'
                                                    }`}
                                                >
                                                    {busy === user.uid ? '…' : user.status === 'suspended' ? <><Undo2 size={12} /> Unsuspend</> : <><Ban size={12} /> Suspend</>}
                                                </button>
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
            <p className="text-[10px] text-neutral-500 mt-3">Suspending a user marks their account suspended in Firestore. Revoke the user's API keys from the API Keys page to fully block MCP access.</p>
        </div>
    );
};

export default UsersPage;