import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Package, Loader2 } from 'lucide-react';
import { downloadExport, getAdminStatus, ExportType } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, ErrorState, StatusBadge, useData,
} from '../../components/admin/AdminUi';

const EXPORT_TYPES: Array<{ id: ExportType; label: string; desc: string; icon: typeof Package }> = [
    { id: 'events', label: 'MCP Logs', desc: 'Every analytics event with timestamps, user, key, tool and status.', icon: Package },
    { id: 'users', label: 'User Analytics', desc: 'Users with plans, key counts, request totals and activity.', icon: Package },
    { id: 'components', label: 'Component Analytics', desc: 'Component usage from MCP — fetches, code fetches and unique users.', icon: Package },
    { id: 'search', label: 'Search Analytics', desc: 'Top search queries plus zero-result gaps.', icon: Package },
    { id: 'keys', label: 'API Keys', desc: 'All keys, owners, statuses and timestamps.', icon: Package },
    { id: 'stats', label: 'Usage Analytics', desc: 'Aggregate summary — requests, unique users, error rate and more.', icon: Package },
];

const RANGES = [
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 90 days' },
];

const ExportPage: React.FC = () => {
    const status = useData(() => getAdminStatus(), []);
    const [type, setType] = useState<ExportType>('events');
    const [format, setFormat] = useState<'csv' | 'json'>('csv');
    const [range, setRange] = useState('30d');
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (status.loading) return null;
    if (status.error) return <ErrorState message={status.error} onRetry={() => void status.reload()} />;

    const run = async () => {
        setError(null);
        setExporting(true);
        try {
            await downloadExport(type, format, range);
        } catch (e: any) {
            setError(e?.message || 'Export failed');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Export Data"
                subtitle="Download real MCP analytics as CSV or JSON. Every export is recorded in the audit log."
                actions={
                    <button
                        onClick={() => void run()}
                        disabled={exporting}
                        className="brutal-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-[11px] cursor-pointer disabled:opacity-40"
                    >
                        {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} {exporting ? 'Preparing…' : 'Download'}
                    </button>
                }
            />

            {error && <ErrorState message={error} onRetry={() => void run()} />}

            <Panel className="mb-6">
                <PanelHeader title="What to export" subtitle="Choose one dataset" />
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
                    {EXPORT_TYPES.map((t) => {
                        const active = type === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setType(t.id)}
                                className={`rounded-lg border-2 p-5 text-left transition-colors cursor-pointer ${active ? 'bg-brand-blue/10 border-brand-blue' : 'bg-brand-bg border-white hover:border-brand-blue'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <t.icon size={18} className={active ? 'text-brand-blue' : 'text-neutral-400'} />
                                    <StatusBadge value={active ? 'Selected' : '—'} tone={active ? 'ok' : 'muted'} />
                                </div>
                                <p className="mt-3 text-sm font-black uppercase tracking-widest text-white">{t.label}</p>
                                <p className="mt-1.5 text-[11px] text-neutral-500 leading-relaxed">{t.desc}</p>
                            </button>
                        );
                    })}
                </div>
            </Panel>

            <div className="grid md:grid-cols-2 gap-6">
                <Panel>
                    <PanelHeader title="Format" actions={<FileJson size={14} className="text-brand-blue" />} />
                    <div className="p-5 grid grid-cols-2 gap-4">
                        <button onClick={() => setFormat('csv')} className={`rounded-lg border-2 p-5 text-left transition-colors cursor-pointer ${format === 'csv' ? 'bg-brand-blue/10 border-brand-blue' : 'bg-brand-bg border-white hover:border-brand-blue'}`}>
                            <FileSpreadsheet size={18} className={format === 'csv' ? 'text-brand-blue' : 'text-neutral-400'} />
                            <p className="mt-3 text-sm font-black uppercase tracking-widest text-white">CSV</p>
                            <p className="mt-1.5 text-[11px] text-neutral-500">Spreadsheet friendly</p>
                        </button>
                        <button onClick={() => setFormat('json')} className={`rounded-lg border-2 p-5 text-left transition-colors cursor-pointer ${format === 'json' ? 'bg-brand-blue/10 border-brand-blue' : 'bg-brand-bg border-white hover:border-brand-blue'}`}>
                            <FileJson size={18} className={format === 'json' ? 'text-brand-blue' : 'text-neutral-400'} />
                            <p className="mt-3 text-sm font-black uppercase tracking-widest text-white">JSON</p>
                            <p className="mt-1.5 text-[11px] text-neutral-500">Full data structure</p>
                        </button>
                    </div>
                </Panel>

                <Panel>
                    <PanelHeader title="Date range" subtitle="Which period to include" />
                    <div className="p-5">
                        <div className="grid grid-cols-3 gap-3">
                            {RANGES.map((r) => (
                                <button key={r.id} onClick={() => setRange(r.id)} className={`px-4 py-3 rounded-md border-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${range === r.id ? 'bg-brand-blue text-white border-white' : 'bg-brand-surface text-neutral-400 border-white hover:text-white'}`}>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-4">Range applies to analytics exports. API Keys exports always include the full key registry.</p>
                    </div>
                </Panel>
            </div>
        </div>
    );
};

export default ExportPage;