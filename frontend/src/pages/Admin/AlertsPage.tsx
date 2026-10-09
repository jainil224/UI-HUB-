import React, { useState } from 'react';
import {
    BellRing, ShieldAlert, AlertOctagon, Check, RotateCcw, RefreshCw, BellOff,
    Eye, Bell, LucideIcon,
} from 'lucide-react';
import {
    getAlerts, resolveAlert, unresolveAlert, AdminAlert,
    getAlertEvents, alertAction, AdminAlertEvent, AdminAlertEventList,
} from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatCard, StatusBadge, EmptyState, ErrorState, SkeletonTable,
    useData, timeAgo, formatNum, Tone,
} from '../../components/admin/AdminUi';

const SEVERITY_TONE: Record<string, Tone> = {
    critical: 'bad',
    warning: 'warn',
    info: 'muted',
    error: 'bad',
};

const SEVERITY_ICON: Record<string, LucideIcon> = {
    critical: ShieldAlert,
    error: ShieldAlert,
    warning: AlertOctagon,
    info: BellRing,
};

const ENGINE_TONE: Record<AdminAlertEvent['status'], Tone> = {
    open: 'bad',
    acknowledged: 'blue',
    resolved: 'ok',
    muted: 'muted',
};

const AlertsPage: React.FC = () => {
    const [busy, setBusy] = useState<string | null>(null);
    const [tab, setTab] = useState<'engine' | 'configured'>('engine');
    const [statusFilter, setStatusFilter] = useState('open');

    const a = useData(() => getAlerts(), []);
    const e = useData<AdminAlertEventList>(
        () => getAlertEvents({ status: statusFilter || undefined, pageSize: 100 }),
        [statusFilter],
        { intervalMs: 30000 },
    );

    if (a.loading && !a.data && e.loading && !e.data) return <SkeletonTable rows={6} />;
    if (a.error && !a.data && e.error && !e.data) return <ErrorState message={a.error || e.error} onRetry={() => { void a.reload(true); void e.reload(true); }} />;

    const alerts = a.data?.alerts || [];
    const active = alerts.filter((x) => !x.resolved);
    const resolved = alerts.filter((x) => x.resolved);
    const events = e.data?.items || [];
    const counts = e.data?.counts || { open: 0, acknowledged: 0, resolved: 0, muted: 0 };

    const toggle = async (alert: AdminAlert) => {
        setBusy(alert.key);
        try {
            if (alert.resolved) await unresolveAlert(alert.key);
            else await resolveAlert(alert.key);
            await a.reload(true);
        } finally {
            setBusy(null);
        }
    };

    const act = async (ev: AdminAlertEvent, action: 'acknowledge' | 'resolve' | 'reopen' | 'mute') => {
        setBusy(ev.id);
        try {
            await alertAction(ev.id, action, action === 'mute' ? { muteMinutes: 60 } : undefined);
            await e.reload(true);
        } finally {
            setBusy(null);
        }
    };

    const refresh = () => { void a.reload(true); void e.reload(true); };

    return (
        <div>
            <PageHeader
                title="Alerts"
                subtitle="The alert engine evaluates rules on a schedule; legacy analytics alerts are preserved below."
                actions={
                    <button onClick={refresh} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                        <RefreshCw size={13} /> Refresh
                    </button>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Open" value={formatNum(counts.open || 0)} icon={ShieldAlert} tone="bad" />
                <StatCard label="Acknowledged" value={formatNum(counts.acknowledged || 0)} icon={Eye} tone="blue" />
                <StatCard label="Resolved" value={formatNum(counts.resolved || 0)} icon={Check} tone="ok" />
                <StatCard label="Muted" value={formatNum(counts.muted || 0)} icon={BellOff} tone="muted" />
            </div>

            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setTab('engine')} className={`px-4 py-2 rounded-md border-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${tab === 'engine' ? 'bg-brand-blue text-white border-white' : 'bg-brand-surface text-white border-white hover:bg-neutral-900'}`}>
                    Engine Events ({formatNum(e.data?.total ?? 0)})
                </button>
                <button onClick={() => setTab('configured')} className={`px-4 py-2 rounded-md border-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${tab === 'configured' ? 'bg-brand-blue text-white border-white' : 'bg-brand-surface text-white border-white hover:bg-neutral-900'}`}>
                    Configured Alerts ({formatNum(alerts.length)})
                </button>
            </div>

            {tab === 'engine' ? (
                <Panel>
                    <PanelHeader
                        title="Alert Engine Events"
                        subtitle={e.data?.engineState ? 'Scheduled evaluation active' : 'Engine idle'}
                        actions={
                            <select value={statusFilter} onChange={(ev) => setStatusFilter(ev.target.value)} className="px-3 py-1.5 rounded-md border-2 border-white bg-brand-bg text-[10px] text-white cursor-pointer">
                                <option value="">All</option>
                                <option value="open">Open</option>
                                <option value="acknowledged">Acknowledged</option>
                                <option value="resolved">Resolved</option>
                                <option value="muted">Muted</option>
                            </select>
                        }
                    />
                    {events.length === 0 ? (
                        <EmptyState icon={Bell} title="No alert events" message="No engine events match this filter. Rules evaluate on a schedule; fired alerts appear here with full actions." />
                    ) : (
                        <div className="divide-y-2 divide-white/60">
                            {events.map((ev) => {
                                const Icon = SEVERITY_ICON[ev.severity] || BellRing;
                                return (
                                    <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
                                        <div className="flex items-start gap-4 min-w-0">
                                            <div className={`w-10 h-10 shrink-0 rounded-md border-2 flex items-center justify-center ${ev.severity === 'critical' || ev.severity === 'error' ? 'bg-brand-red text-white border-white' : ev.severity === 'warning' ? 'bg-brand-yellow text-black border-black' : 'bg-brand-bg text-neutral-400 border-white'}`}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <p className="text-sm font-bold text-white">{ev.title}</p>
                                                    <StatusBadge value={ev.severity} tone={SEVERITY_TONE[ev.severity] || 'muted'} />
                                                    <StatusBadge value={ev.status} tone={ENGINE_TONE[ev.status]} />
                                                </div>
                                                <p className="text-xs text-neutral-400 mt-1">{ev.message}</p>
                                                <p className="text-[10px] text-neutral-600 mt-1.5">
                                                    Last {timeAgo(ev.lastDetected)} · first {timeAgo(ev.firstDetected)} · rule {ev.ruleId}
                                                    {ev.owner ? ` · owner ${ev.owner}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 shrink-0">
                                            {ev.status !== 'acknowledged' && ev.status !== 'resolved' && (
                                                <button onClick={() => void act(ev, 'acknowledge')} disabled={busy === ev.id} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40">
                                                    <Eye size={12} /> Ack
                                                </button>
                                            )}
                                            {ev.status !== 'muted' && ev.status !== 'resolved' && (
                                                <button onClick={() => void act(ev, 'mute')} disabled={busy === ev.id} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40">
                                                    <BellOff size={12} /> Mute 1h
                                                </button>
                                            )}
                                            {ev.status === 'resolved' ? (
                                                <button onClick={() => void act(ev, 'reopen')} disabled={busy === ev.id} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40">
                                                    <RotateCcw size={12} /> Reopen
                                                </button>
                                            ) : (
                                                <button onClick={() => void act(ev, 'resolve')} disabled={busy === ev.id} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border-2 bg-brand-blue text-white border-white hover:bg-brand-blue-dark transition-colors cursor-pointer disabled:opacity-40">
                                                    <Check size={12} /> Resolve
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Panel>
            ) : alerts.length === 0 ? (
                <Panel>
                    <EmptyState icon={BellRing} title="No alerts" message="No configured alert rules are currently firing." />
                </Panel>
            ) : (
                <>
                    <Panel className="mb-6">
                        <PanelHeader title={`Active (${active.length})`} subtitle="Require attention" actions={<ShieldAlert size={14} className="text-brand-red" />} />
                        <div className="divide-y-2 divide-white/60">
                            {active.length === 0 ? (
                                <div className="p-5 text-xs text-neutral-500">No active alerts.</div>
                            ) : (
                                active.map((alert) => {
                                    const Icon = SEVERITY_ICON[alert.severity];
                                    return (
                                        <div key={alert.key} className="flex items-center justify-between gap-4 px-5 py-4">
                                            <div className="flex items-start gap-4 min-w-0">
                                                <div className={`w-10 h-10 shrink-0 rounded-md border-2 flex items-center justify-center ${alert.severity === 'critical' ? 'bg-brand-red text-white border-white' : alert.severity === 'warning' ? 'bg-brand-yellow text-black border-black' : 'bg-brand-bg text-neutral-400 border-white'}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <p className="text-sm font-bold text-white">{alert.title}</p>
                                                        <StatusBadge value={alert.severity} tone={SEVERITY_TONE[alert.severity]} />
                                                    </div>
                                                    <p className="text-xs text-neutral-400 mt-1">{alert.message}</p>
                                                    <p className="text-[10px] text-neutral-600 mt-1.5">Fired {timeAgo(alert.at)} · rule {alert.key}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => void toggle(alert)}
                                                disabled={busy === alert.key}
                                                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-md border-2 bg-brand-blue text-white border-white hover:bg-brand-blue-dark transition-colors cursor-pointer disabled:opacity-40"
                                            >
                                                <Check size={13} /> Resolve
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Panel>

                    {resolved.length > 0 && (
                        <Panel>
                            <PanelHeader title={`Resolved (${resolved.length})`} subtitle="Acknowledged alerts" actions={<BellRing size={14} className="text-brand-blue" />} />
                            <div className="divide-y-2 divide-white/40">
                                {resolved.map((alert) => (
                                    <div key={alert.key} className="flex items-center justify-between gap-4 px-5 py-3 opacity-70">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white">{alert.title}</p>
                                            <p className="text-xs text-neutral-500 mt-0.5">{alert.message}</p>
                                        </div>
                                        <button
                                            onClick={() => void toggle(alert)}
                                            disabled={busy === alert.key}
                                            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-md border-2 border-white/60 text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40"
                                        >
                                            <RotateCcw size={12} /> Reopen
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    )}
                </>
            )}
        </div>
    );
};

export default AlertsPage;
