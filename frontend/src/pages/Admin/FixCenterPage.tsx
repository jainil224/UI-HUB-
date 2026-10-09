import React, { useState } from 'react';
import { Wrench, ShieldAlert, Activity, RefreshCw, Copy, Check, Bug, Crown, Gauge } from 'lucide-react';
import { getFixCenter, type AdminFixCenterItem, setDiagnosticStatus, resolveAlert } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatCard, StatusBadge, EmptyState, ErrorState, SkeletonBlock,
    useData, timeAgo, formatCompact, Tone,
} from '../../components/admin/AdminUi';

const severityTone = (s: string): Tone => {
    if (s === 'critical') return 'bad';
    if (s === 'warning') return 'warn';
    return 'muted';
};

const sourceIcon = (source: string) => (source === 'diagnostic' ? Bug : Gauge);

const FixCenterPage: React.FC = () => {
    const [source, setSource] = useState('');
    const [severity, setSeverity] = useState('');
    const [range, setRange] = useState('30d');
    const [selected, setSelected] = useState<AdminFixCenterItem | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);
    const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
    const [marking, setMarking] = useState<string | null>(null);

    const d = useData(() => getFixCenter(range), [range]);

    if (d.loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <SkeletonBlock className="h-28" />
                    <SkeletonBlock className="h-28" />
                    <SkeletonBlock className="h-28" />
                    <SkeletonBlock className="h-28" />
                </div>
                <SkeletonBlock className="h-96" />
            </div>
        );
    }
    if (d.error) return <ErrorState message={d.error} onRetry={() => void d.reload(true)} />;

    const data = d.data!;
    const items = data.items.filter(
        (i) => {
            const base = (!source || i.source === source) && (!severity || i.severity === severity);
            if (!base) return false;
            if (filter === 'all') return true;
            const resolved = (i.resolution === 'resolved') || (i.status === 'resolved');
            if (filter === 'completed') return resolved;
            return !resolved;
        }
    );

    const copy = async (item: AdminFixCenterItem) => {
        try {
            await navigator.clipboard.writeText(item.fixPrompt);
            setCopiedId(item.id);
            setTimeout(() => setCopiedId((id) => (id === item.id ? null : id)), 1500);
        } catch {
            // clipboard unavailable
        }
    };

    const markResolved = async (item: AdminFixCenterItem) => {
        setMarking(item.id);
        try {
            if (item.source === 'diagnostic') {
                const id = item.diagnosticId || item.id.replace(/^diag:/, '');
                await setDiagnosticStatus(id, 'resolved');
            } else if (item.source === 'signal') {
                const key = (item.evidence as any)?.key || item.id.replace(/^signal:/, '');
                if (key && key !== item.id) await resolveAlert(key);
            }
            await d.reload(true);
            if (selected?.id === item.id) setSelected(null);
        } catch (e: any) {
            console.error(e);
        } finally {
            setMarking(null);
        }
    };

    const markPending = async (item: AdminFixCenterItem) => {
        setMarking(item.id);
        try {
            if (item.source === 'diagnostic') {
                const id = item.diagnosticId || item.id.replace(/^diag:/, '');
                await setDiagnosticStatus(id, 'reopened');
            }
            await d.reload(true);
            if (selected?.id === item.id) setSelected(null);
        } catch (e: any) {
            console.error(e);
        } finally {
            setMarking(null);
        }
    };

    const copyAll = async () => {
        const text = items.map((i) => `# ${i.title}\n\n${i.fixPrompt}`).join('\n\n---\n\n');
        try {
            await navigator.clipboard.writeText(text);
            setCopiedAll(true);
            setTimeout(() => setCopiedAll(false), 1500);
        } catch {
            // clipboard unavailable
        }
    };

    const categories = data.totals.byCategory || {};

    return (
        <div>
            <PageHeader
                title="Fix Center"
                subtitle="Every real, unresolved problem across the MCP server, each paired with a copy-paste fix prompt."
                actions={
                    <div className="flex items-center gap-2">
                    <select value={range} onChange={(e) => setRange(e.target.value)} className="rounded-md border-2 border-white/40 bg-brand-bg px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-brand-blue cursor-pointer">
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                    <div className="flex items-center gap-1 border-2 border-white rounded-md overflow-hidden">
                        {(['pending','completed','all'] as const).map(f=>(
                            <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest ${filter===f?'bg-brand-blue text-white':'bg-brand-surface text-neutral-400 hover:text-white'}`}>{f}</button>
                        ))}
                    </div>
                    <button onClick={() => void d.reload(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                            <RefreshCw size={13} /> Refresh
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total problems" value={formatCompact(data.totals.items)} icon={Wrench} />
                <StatCard label="Critical" value={formatCompact(data.totals.bySeverity?.critical || 0)} icon={ShieldAlert} tone="bad" />
                <StatCard label="Warnings" value={formatCompact(data.totals.bySeverity?.warning || 0)} icon={Activity} tone="warn" />
                <StatCard label="Premium gaps" value={formatCompact(data.totals.byCategory?.premium_denied || 0)} icon={Crown} tone="violet" />
            </div>

            <Panel>
                <PanelHeader
                    title="All problems"
                    subtitle="Real data only — generated from live telemetry and unresolved diagnostics"
                    actions={
                        <button
                            onClick={() => void copyAll()}
                            disabled={items.length === 0}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 border-white text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40"
                        >
                            {copiedAll ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy all</>}
                        </button>
                    }
                />

                <div className="px-4 pt-4 flex flex-wrap items-center gap-3">
                    <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded-md border-2 border-white/40 bg-brand-bg px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-brand-blue cursor-pointer">
                        <option value="">All Sources</option>
                        <option value="diagnostic">Diagnostics</option>
                        <option value="signal">Signals</option>
                    </select>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded-md border-2 border-white/40 bg-brand-bg px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-brand-blue cursor-pointer">
                        <option value="">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                    </select>
                    <span className="text-[10px] font-mono text-neutral-500">{items.length} item(s)</span>
                </div>

                {items.length === 0 ? (
                    <div className="p-4">
                        <EmptyState
                            icon={Wrench}
                            title="No active problems"
                            message="Nothing is failing right now. When MCP failures, auth errors, rate limits or zero-result searches occur, they appear here with a ready-to-copy fix prompt."
                        />
                    </div>
                ) : (
                    <div className="p-4 grid gap-3">
                        {items.map((item) => {
                            const Icon = sourceIcon(item.source);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setSelected(item)}
                                    className="w-full text-left rounded-md border-2 border-white/70 bg-brand-bg hover:border-white transition-colors p-4 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <span className="shrink-0 mt-0.5 text-brand-blue"><Icon size={16} /></span>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-sm font-black text-white truncate">{item.title}</h3>
                                                    <StatusBadge value={item.severity} tone={severityTone(item.severity)} />
                                                    <StatusBadge value={item.resolution||item.status||'pending'} tone={(item.resolution==='resolved'||item.status==='resolved')?'ok':'warn'} />
                                                    <StatusBadge value={item.source} tone={item.source === 'diagnostic' ? 'violet' : 'blue'} />
                                                </div>
                                                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{item.summary}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-mono text-neutral-500">{formatCompact(item.occurrences)}x</p>
                                            <p className="text-[10px] font-mono text-neutral-600 mt-0.5">{item.lastSeen ? timeAgo(item.lastSeen) : '—'}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </Panel>

            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/70" onClick={() => setSelected(null)}>
                    <div className="w-full max-w-2xl h-full overflow-y-auto bg-brand-surface border-l-2 border-white" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b-2 border-white bg-brand-surface p-5">
                            <div className="min-w-0">
                                <h2 className="text-lg font-black text-white">{selected.title}</h2>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <StatusBadge value={selected.severity} tone={severityTone(selected.severity)} />
                                    <StatusBadge value={selected.source} tone={selected.source === 'diagnostic' ? 'violet' : 'blue'} />
                                    <StatusBadge value={selected.category} tone="muted" />
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-white text-xl leading-none cursor-pointer">×</button>
                        </div>

                        <div className="p-5 space-y-5">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Summary</p>
                                <p className="text-sm text-white">{selected.summary}</p>
                                <p className="text-[11px] font-mono text-neutral-500 mt-2">
                                    {formatCompact(selected.occurrences)}x · first {selected.firstSeen ? new Date(selected.firstSeen).toLocaleString() : 'n/a'} · last {selected.lastSeen ? new Date(selected.lastSeen).toLocaleString() : 'n/a'}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Evidence</p>
                                <pre className="text-[11px] leading-relaxed text-neutral-200 bg-brand-bg border-2 border-white rounded-md p-4 whitespace-pre-wrap break-words">{JSON.stringify(selected.evidence, null, 2)}</pre>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Fix prompt</p>
                                    <button
                                        onClick={() => void copy(selected)}
                                        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-blue hover:text-white cursor-pointer"
                                    >
                                        {copiedId === selected.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                    </button>
                                </div>
                                <pre className="text-[11px] leading-relaxed text-neutral-200 bg-brand-bg border-2 border-white rounded-md p-4 whitespace-pre-wrap break-words max-h-[420px] overflow-y-auto">{selected.fixPrompt}</pre>
                            </div>
                            <div className="border-t-2 border-white/20 pt-4 flex justify-between">
                                <div className="text-[10px] text-neutral-500">
                                    Status: {selected.resolution||selected.status||'pending'}
                                </div>
                                <div className="flex gap-2">
                                    {((selected.resolution==='resolved'||selected.status==='resolved')) ? (
                                        <button onClick={()=>void markPending(selected)} disabled={marking===selected.id} className="px-3 py-2 border-2 border-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 disabled:opacity-40">{marking===selected.id?'...':'Mark as Pending'}</button>
                                    ) : (
                                        <button onClick={()=>void markResolved(selected)} disabled={marking===selected.id} className="px-3 py-2 border-2 border-brand-blue bg-brand-blue text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/90 disabled:opacity-40">{marking===selected.id?'...':'Mark as Complete'}</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FixCenterPage;
