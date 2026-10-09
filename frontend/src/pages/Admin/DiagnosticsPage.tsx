import React, { useState } from 'react';
import { Stethoscope, RefreshCw, Copy, Check, Wand2, X, AlertTriangle, Bug } from 'lucide-react';
import {
    getDiagnostics, getDiagnostic, generateFixPrompt, setDiagnosticStatus,
    AdminDiagnostics, AdminDiagnostic,
} from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatCard, StatusBadge, EmptyState, ErrorState,
    SkeletonTable, useData, timeAgo, formatNum, Table, Th, Td, Pagination, Tone,
} from '../../components/admin/AdminUi';

const SEVERITY_TONE: Record<string, Tone> = { critical: 'bad', error: 'bad', warning: 'warn', info: 'muted' };

const DiagnosticsPage: React.FC = () => {
    const [severity, setSeverity] = useState('');
    const [category, setCategory] = useState('');
    const [state, setState] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<AdminDiagnostic | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [busy, setBusy] = useState(false);

    const d = useData<AdminDiagnostics>(
        () => getDiagnostics({ severity: severity || undefined, category: category || undefined, state: state || undefined, page, pageSize: 25 }),
        [severity, category, state, page],
    );

    const open = async (item: AdminDiagnostic) => {
        setSelected(item);
        setPrompt('');
        setCopied(false);
        try {
            const { item: full } = await getDiagnostic(item.id);
            setSelected(full);
        } catch {
            // keep summary
        }
    };

    const makePrompt = async () => {
        if (!selected) return;
        setBusy(true);
        try {
            const res = await generateFixPrompt(selected.id);
            setPrompt(res.prompt);
            setCopied(false);
        } finally {
            setBusy(false);
        }
    };

    const copyPrompt = async () => {
        if (!prompt) return;
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard unavailable
        }
    };

    const changeStatus = async (status: string) => {
        if (!selected) return;
        setBusy(true);
        try {
            const { item } = await setDiagnosticStatus(selected.id, status);
            setSelected(item);
            await d.reload(true);
        } finally {
            setBusy(false);
        }
    };

    if (d.loading && !d.data) return <SkeletonTable rows={8} />;
    if (d.error && !d.data) return <ErrorState message={d.error} onRetry={() => void d.reload(true)} />;

    const data = d.data!;
    const categories = Object.keys(data.byCategory || {});

    return (
        <div>
            <PageHeader
                title="Failed Searches & Diagnostics"
                subtitle="Grouped failure fingerprints with the evidence needed to reproduce, plus a ready-to-paste AI repair prompt."
                actions={
                    <button onClick={() => void d.reload(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                        <RefreshCw size={13} /> Refresh
                    </button>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Open Diagnostics" value={formatNum(data.total)} icon={Stethoscope} tone="blue" />
                <StatCard label="Critical" value={formatNum(data.bySeverity.critical || 0)} icon={AlertTriangle} tone="bad" />
                <StatCard label="Warnings" value={formatNum(data.bySeverity.warning || 0)} icon={Bug} tone="warn" />
                <StatCard label="Categories" value={formatNum(categories.length)} icon={Stethoscope} tone="violet" />
            </div>

            <Panel className="mb-6">
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }} className="px-3 py-2 rounded-md border-2 border-white bg-brand-bg text-xs text-white">
                        <option value="">All severities</option>
                        {['critical', 'error', 'warning', 'info'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="px-3 py-2 rounded-md border-2 border-white bg-brand-bg text-xs text-white">
                        <option value="">All categories</option>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={state} onChange={(e) => { setState(e.target.value); setPage(1); }} className="px-3 py-2 rounded-md border-2 border-white bg-brand-bg text-xs text-white">
                        <option value="">All states</option>
                        <option value="unresolved">Unresolved</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </Panel>

            <Panel>
                <PanelHeader title={`Diagnostics (${formatNum(data.total)})`} subtitle="Aggregated by fingerprint — newest occurrence first" />
                {data.items.length === 0 ? (
                    <EmptyState icon={Stethoscope} title="No failures detected" message="Failures are recorded as they occur. Zero-result searches and tool errors will appear here." />
                ) : (
                    <>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Last Seen</Th>
                                    <Th>Severity</Th>
                                    <Th>Category</Th>
                                    <Th>Title</Th>
                                    <Th>Occurrences</Th>
                                    <Th>State</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((item) => (
                                    <tr key={item.id} onClick={() => void open(item)} className="hover:bg-white/5 cursor-pointer">
                                        <Td className="text-neutral-400 text-xs">{timeAgo(item.lastSeen)}</Td>
                                        <Td><StatusBadge value={item.severity} tone={SEVERITY_TONE[item.severity] || 'muted'} /></Td>
                                        <Td className="text-xs font-mono">{item.category}</Td>
                                        <Td className="text-xs max-w-[260px] truncate">{item.title}</Td>
                                        <Td className="text-xs">{item.occurrences}</Td>
                                        <Td><StatusBadge value={item.resolution} tone={item.resolution === 'resolved' ? 'ok' : item.resolution === 'investigating' ? 'blue' : 'warn'} /></Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
                    </>
                )}
            </Panel>

            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setSelected(null)}>
                    <div className="w-full max-w-2xl h-full bg-brand-surface border-l-2 border-white overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b-2 border-white px-5 py-4 sticky top-0 bg-brand-surface z-10">
                            <div className="min-w-0">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white truncate">{selected.title}</h3>
                                <p className="text-[10px] font-mono text-neutral-500 truncate">{selected.fingerprint}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-white cursor-pointer"><X size={16} /></button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <StatusBadge value={selected.severity} tone={SEVERITY_TONE[selected.severity] || 'muted'} />
                                <StatusBadge value={selected.category} tone="violet" />
                                <StatusBadge value={selected.resolution} tone={selected.resolution === 'resolved' ? 'ok' : 'warn'} />
                                <StatusBadge value={`${selected.occurrences}×`} tone="muted" />
                            </div>

                            <div className="space-y-2 text-xs">
                                {[
                                    ['Error summary', selected.errorSummary],
                                    ['Tool', selected.tool || '—'],
                                    ['Method', selected.method || '—'],
                                    ['Resource', selected.resourceType ? `${selected.resourceType}${selected.resourceId ? ':' + selected.resourceId : ''}` : '—'],
                                    ['Query', selected.query || '—'],
                                    ['URL', selected.url || '—'],
                                    ['Status / error code', `${selected.statusCode ?? '—'} / ${selected.errorCode || '—'}`],
                                    ['Client', selected.clientName || 'Unknown MCP client'],
                                    ['First seen', new Date(selected.firstSeen).toLocaleString()],
                                    ['Last seen', new Date(selected.lastSeen).toLocaleString()],
                                ].map(([label, value]) => (
                                    <div key={String(label)} className="flex items-start justify-between gap-4 border-b-2 border-white/20 pb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{label}</span>
                                        <span className="text-white text-right break-all">{String(value ?? '—')}</span>
                                    </div>
                                ))}
                            </div>

                            {selected.sampleEvents && selected.sampleEvents.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Recent Samples</p>
                                    <div className="space-y-1">
                                        {selected.sampleEvents.slice(-5).reverse().map((s, i) => (
                                            <div key={i} className="text-[11px] font-mono text-neutral-400 border-2 border-white/20 rounded-md px-3 py-2">
                                                {new Date(s.at).toLocaleTimeString()} · {s.method || '-'} · {s.tool || '-'} · {s.errorCode || s.status || '-'}
                                                {typeof s.latencyMs === 'number' ? ` · ${s.latencyMs}ms` : ''}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-2">
                                <button onClick={() => void makePrompt()} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue-dark transition-colors cursor-pointer disabled:opacity-40">
                                    <Wand2 size={13} /> Generate AI Fix Prompt
                                </button>
                                <button onClick={() => void changeStatus('investigating')} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40">Investigating</button>
                                <button onClick={() => void changeStatus('resolved')} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40">
                                    <Check size={13} /> Resolve
                                </button>
                                <button onClick={() => void changeStatus('reopened')} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40">Reopen</button>
                            </div>

                            {prompt && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">AI Repair Prompt</p>
                                        <button onClick={() => void copyPrompt()} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-blue hover:text-white cursor-pointer">
                                            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                        </button>
                                    </div>
                                    <pre className="text-[11px] leading-relaxed text-neutral-200 bg-brand-bg border-2 border-white rounded-md p-4 whitespace-pre-wrap break-words max-h-[420px] overflow-y-auto">{prompt}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiagnosticsPage;
