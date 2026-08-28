import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, RefreshCw, LifeBuoy } from 'lucide-react';
import { getTools, setTool, AdminTool } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatusBadge, EmptyState, ErrorState, SkeletonTable,
    useData, formatCompact, formatPct, formatMs, timeAgo, Tone,
} from '../../components/admin/AdminUi';

const TOOL_DESCRIPTIONS: Record<string, string> = {
    search_components: 'Search UI HUB components',
    get_component: 'Fetch a component by ID',
    get_component_code: 'Retrieve source code for a component',
    search_templates: 'Search UI HUB templates',
    get_template: 'Fetch a template by ID',
    search_animations: 'Search UI HUB animations',
    get_animation_code: 'Retrieve animation source code',
    list_categories: 'List all component categories',
    get_dependencies: 'Get npm dependencies for a component',
};

const ToolsPage: React.FC = () => {
    const t = useData(() => getTools(), []);
    const [busy, setBusy] = React.useState<string | null>(null);

    if (t.loading) return <SkeletonTable rows={9} />;
    if (t.error) return <ErrorState message={t.error} onRetry={() => void t.reload()} />;

    const tools = t.data!.tools;

    const toggle = async (tool: AdminTool) => {
        setBusy(tool.name);
        try {
            await setTool(tool.name, !tool.enabled);
            await t.reload();
        } finally {
            setBusy(null);
        }
    };

    return (
        <div>
            <PageHeader
                title="MCP Tools"
                subtitle="Control which MCP tools are available. Disabling a tool is enforced server-side — it is immediately removed from tools/list and calls return a tool-disabled error."
                actions={
                    <button onClick={() => void t.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                        <RefreshCw size={13} /> Refresh
                    </button>
                }
            />

            {tools.length === 0 ? (
                <Panel>
                    <EmptyState icon={Wrench} title="No tools" message="No MCP tools are registered." />
                </Panel>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {tools.map((tool) => {
                        const tone: Tone = tool.enabled ? 'ok' : 'warn';
                        return (
                            <Panel key={tool.name} className={`${tool.enabled ? '' : 'opacity-80'}`}>
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-mono text-sm font-bold text-brand-blue break-all">{tool.name}</p>
                                            <p className="text-xs text-neutral-400 mt-1">{TOOL_DESCRIPTIONS[tool.name] || tool.category}</p>
                                        </div>
                                        <StatusBadge value={tool.enabled ? 'Enabled' : 'Disabled'} tone={tone} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-5">
                                        <div className="rounded-md border-2 border-white/40 bg-brand-bg p-3">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Requests</p>
                                            <p className="text-lg font-black text-white mt-1">{formatCompact(tool.total)}</p>
                                        </div>
                                        <div className="rounded-md border-2 border-white/40 bg-brand-bg p-3">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Error rate</p>
                                            <p className={`text-lg font-black mt-1 ${tool.failed > 0 ? 'text-brand-red' : 'text-white'}`}>{tool.total ? formatPct(tool.failed / tool.total) : '—'}</p>
                                        </div>
                                        <div className="rounded-md border-2 border-white/40 bg-brand-bg p-3">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Avg response</p>
                                            <p className="text-lg font-black text-white mt-1">{tool.avgResponseTimeMs ? formatMs(tool.avgResponseTimeMs) : '—'}</p>
                                        </div>
                                        <div className="rounded-md border-2 border-white/40 bg-brand-bg p-3">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Users</p>
                                            <p className="text-lg font-black text-white mt-1">{formatCompact(tool.uniqueUsers)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-5 pt-4 border-t-2 border-white/40">
                                        <span className="text-[10px] text-neutral-500">Last used {timeAgo(tool.lastUsed)}</span>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to={`/admin/mcp/analytics?tool=${encodeURIComponent(tool.name)}`}
                                                className="text-[10px] font-black uppercase tracking-widest text-brand-blue hover:text-white no-underline cursor-pointer"
                                            >
                                                Analytics
                                            </Link>
                                            <button
                                                onClick={() => void toggle(tool)}
                                                disabled={busy === tool.name}
                                                className={`px-4 py-2 rounded-md border-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-40 ${
                                                    tool.enabled
                                                        ? 'bg-brand-red text-white border-white hover:bg-red-700'
                                                        : 'bg-brand-blue text-white border-white hover:bg-brand-blue-dark'
                                                }`}
                                            >
                                                {busy === tool.name ? '…' : tool.enabled ? 'Disable' : 'Enable'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        );
                    })}
                </div>
            )}

            <Panel className="mt-8">
                <PanelHeader title="How enabling works" subtitle="Server-side enforcement" />
                <div className="p-5 text-xs text-neutral-400 leading-relaxed">
                    <p className="flex items-center gap-2"><LifeBuoy size={14} className="text-brand-blue" /> The mcp-server reads the enabled/disabled state from <span className="font-mono text-white">mcp_config/app</span> and filters <span className="font-mono text-white">tools/list</span> accordingly.</p>
                    <p className="flex items-center gap-2 mt-2"><LifeBuoy size={14} className="text-brand-blue" /> Calling a disabled tool returns <span className="font-mono text-white">-32601 "Tool disabled: &lt;name&gt;"</span>.</p>
                    <p className="flex items-center gap-2 mt-2"><LifeBuoy size={14} className="text-brand-blue" /> Playground requests also check the same state before execution.</p>
                </div>
            </Panel>
        </div>
    );
};

export default ToolsPage;