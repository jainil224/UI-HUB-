import React, { useState } from 'react';
import { BellRing, ShieldAlert, AlertOctagon, Check, RotateCcw, RefreshCw, LucideIcon } from 'lucide-react';
import { getAlerts, resolveAlert, unresolveAlert, AdminAlert } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatusBadge, EmptyState, ErrorState, SkeletonTable,
    useData, timeAgo, Tone,
} from '../../components/admin/AdminUi';

const SEVERITY_TONE: Record<AdminAlert['severity'], Tone> = {
    critical: 'bad',
    warning: 'warn',
    info: 'muted',
};

const SEVERITY_ICON: Record<AdminAlert['severity'], LucideIcon> = {
    critical: ShieldAlert,
    warning: AlertOctagon,
    info: BellRing,
};

const AlertsPage: React.FC = () => {
    const [busy, setBusy] = useState<string | null>(null);
    const a = useData(() => getAlerts(), []);

    if (a.loading) return <SkeletonTable rows={5} />;
    if (a.error) return <ErrorState message={a.error} onRetry={() => void a.reload()} />;

    const alerts = a.data!.alerts;

    const toggle = async (alert: AdminAlert) => {
        setBusy(alert.key);
        try {
            if (alert.resolved) await unresolveAlert(alert.key);
            else await resolveAlert(alert.key);
            await a.reload();
        } finally {
            setBusy(null);
        }
    };

    const active = alerts.filter((x) => !x.resolved);
    const resolved = alerts.filter((x) => x.resolved);

    return (
        <div>
            <PageHeader
                title="Alerts"
                subtitle="Threats detected from analytics — elevated error rates, auth failures, rate-limit surges and more."
                actions={
                    <button onClick={() => void a.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                        <RefreshCw size={13} /> Refresh
                    </button>
                }
            />

            {alerts.length === 0 ? (
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