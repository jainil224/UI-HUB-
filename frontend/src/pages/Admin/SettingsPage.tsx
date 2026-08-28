import React, { useState } from 'react';
import { Save, Link2, Wrench, Clock3, Check, X } from 'lucide-react';
import { getSettings, updateSettings, AdminSettings } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatusBadge, ErrorState, SkeletonBlock,
    useData, formatNum,
} from '../../components/admin/AdminUi';
import { MCP_BASE_URL } from '../../utils/mcpConfig';

const MCP_ENDPOINT = MCP_BASE_URL;

const SettingsPage: React.FC = () => {
    const s = useData(() => getSettings(), []);
    const [form, setForm] = useState<AdminSettings | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    React.useEffect(() => {
        if (s.data && !form) setForm(s.data);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [s.data]);

    if (s.loading) return <SkeletonBlock className="h-96" />;
    if (s.error) return <ErrorState message={s.error} onRetry={() => void s.reload()} />;
    if (!form) return null;

    const setNum = (key: 'rateLimitFree' | 'rateLimitPro', value: string) => {
        const n = parseInt(value, 10);
        setForm({ ...form, [key]: isNaN(n) ? 0 : n });
        setSaved(false);
        setSaveError(null);
    };

    const setFlag = (key: 'authEnabled' | 'analyticsEnabled' | 'loggingEnabled', value: boolean) => {
        setForm({ ...form, [key]: value });
        setSaved(false);
        setSaveError(null);
    };

    const save = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            const updated = await updateSettings({
                rateLimitFree: form.rateLimitFree,
                rateLimitPro: form.rateLimitPro,
                authEnabled: form.authEnabled,
                analyticsEnabled: form.analyticsEnabled,
                loggingEnabled: form.loggingEnabled,
            });
            setForm(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) {
            setSaveError(e?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const enabledCount = Object.values(form.tools || {}).filter(Boolean).length;
    const totalTools = Object.keys(form.tools || {}).length;

    return (
        <div>
            <PageHeader
                title="Settings"
                subtitle="Runtime configuration stored in mcp_config/app and applied live by the MCP server."
                actions={
                    <button
                        onClick={() => void save()}
                        disabled={saving}
                        className="brutal-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-[11px] cursor-pointer disabled:opacity-40"
                    >
                        {saving ? '…' : <Save size={14} />} Save Changes
                    </button>
                }
            />

            {saved && (
                <div className="mb-6 rounded-md border-2 border-brand-blue bg-brand-blue/10 px-4 py-3 flex items-center gap-3 text-xs text-white">
                    <Check size={15} className="text-brand-blue" /> Settings saved and propagated to the server.
                </div>
            )}
            {saveError && (
                <div className="mb-6 rounded-md border-2 border-brand-red bg-brand-red/10 px-4 py-3 flex items-center gap-3 text-xs text-white">
                    <X size={15} className="text-brand-red" /> {saveError}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                <Panel>
                    <PanelHeader title="Rate Limits" subtitle="Requests per day per API key" actions={<Clock3 size={14} className="text-brand-blue" />} />
                    <div className="p-5 space-y-5">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Free tier limit / day</label>
                            <input
                                type="number"
                                min={1}
                                value={form.rateLimitFree}
                                onChange={(e) => setNum('rateLimitFree', e.target.value)}
                                className="mt-2 w-full rounded-md border-2 border-white bg-brand-bg px-4 py-3 text-sm font-mono text-white outline-none focus:border-brand-blue"
                            />
                            <p className="text-[11px] text-neutral-500 mt-1.5">{formatNum(form.rateLimitPro)} on Pro+ — keep the free limit below it.</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Pro+ tier limit / day</label>
                            <input
                                type="number"
                                min={1}
                                value={form.rateLimitPro}
                                onChange={(e) => setNum('rateLimitPro', e.target.value)}
                                className="mt-2 w-full rounded-md border-2 border-white bg-brand-bg px-4 py-3 text-sm font-mono text-white outline-none focus:border-brand-blue"
                            />
                        </div>
                    </div>
                </Panel>

                <div className="space-y-6">
                    <Panel>
                        <PanelHeader title="Features" subtitle="Server-side toggles" actions={<Wrench size={14} className="text-brand-blue" />} />
                        <div className="divide-y-2 divide-white/60">
                            {([
                                ['authEnabled', 'Authentication', 'Require API keys on every MCP request'],
                                ['analyticsEnabled', 'Analytics capture', 'Record mcp_analytics events for charts'],
                                ['loggingEnabled', 'Request logging', 'Log mcp_request events with status + duration'],
                            ] as Array<['authEnabled' | 'analyticsEnabled' | 'loggingEnabled', string, string]>).map(([key, label, hint]) => (
                                <div key={key} className="flex items-center justify-between gap-4 px-5 py-4">
                                    <div>
                                        <p className="text-sm font-bold text-white">{label}</p>
                                        <p className="text-[11px] text-neutral-500 mt-0.5">{hint}</p>
                                    </div>
                                    <button
                                        onClick={() => setFlag(key, !(form[key] as boolean))}
                                        className={`relative w-14 h-8 rounded-full border-2 transition-colors cursor-pointer ${form[key] ? 'bg-brand-blue border-white' : 'bg-neutral-800 border-white'}`}
                                        aria-pressed={form[key] as boolean}
                                    >
                                        <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${form[key] ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                            <div className="flex items-center justify-between gap-4 px-5 py-4">
                                <div>
                                    <p className="text-sm font-bold text-white">MCP Endpoint</p>
                                    <p className="text-[11px] text-neutral-500 mt-0.5">Base URL the admin console talks to</p>
                                </div>
                                <span className="font-mono text-xs text-brand-blue break-all text-right">{MCP_ENDPOINT}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 px-5 py-4">
                                <div>
                                    <p className="text-sm font-bold text-white">MCP tools</p>
                                    <p className="text-[11px] text-neutral-500 mt-0.5">Manage individually from the Tools page</p>
                                </div>
                                <StatusBadge value={`${enabledCount} / ${totalTools} enabled`} tone={enabledCount === totalTools ? 'ok' : 'blue'} />
                            </div>
                        </div>
                    </Panel>

                    <Panel>
                        <PanelHeader title="Storage" subtitle="Where settings live" />
                        <div className="p-5 flex items-center gap-3 text-xs text-neutral-400">
                            <Link2 size={14} className="text-brand-blue" />
                            <span className="font-mono text-white">{form.settingsDoc}</span>
                            <span>doc</span>
                        </div>
                    </Panel>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;