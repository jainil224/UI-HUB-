import React, { useState } from 'react';
import { FlaskConical, Play, Copy, Check, RotateCcw, Timer, Cpu } from 'lucide-react';
import { getTools, runPlayground, PlaygroundResult } from '../../services/admin';
import {
    PageHeader, Panel, PanelHeader, StatusBadge, EmptyState, ErrorState, SkeletonTable,
    useData, formatMs, Tone,
} from '../../components/admin/AdminUi';

const SAMPLE_ARGS: Record<string, Record<string, unknown>> = {
    search_components: { query: 'pricing card' },
    get_component: { componentId: 'pricing-cards' },
    get_component_code: { componentId: 'pricing-cards' },
    search_templates: { query: 'hero' },
    get_template: { templateId: 'template-input-fields' },
    search_animations: { query: 'text' },
    get_animation_code: { animationId: 'anim-gradient-orbs' },
    list_categories: {},
    get_dependencies: { componentId: 'pricing-cards' },
};

function pretty(json: unknown): string {
    try {
        return JSON.stringify(json, null, 2);
    } catch {
        return String(json);
    }
}

const exampleFor = (tool: string): string => {
    const args = SAMPLE_ARGS[tool] ?? {};
    return pretty(args);
};

const PlaygroundPage: React.FC = () => {
    const tools = useData(() => getTools(), []);
    const [selected, setSelected] = useState('search_components');
    const [argsText, setArgsText] = useState(() => exampleFor('search_components'));
    const [result, setResult] = useState<PlaygroundResult | null>(null);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    if (tools.loading) return <SkeletonTable rows={3} />;
    if (tools.error) return <ErrorState message={tools.error} onRetry={() => void tools.reload()} />;

    const available = tools.data!.tools.filter((t) => t.enabled);
    const currentTool = available.find((t) => t.name === selected) || available[0];

    const selectTool = (name: string) => {
        setSelected(name);
        if (!argsText || argsText === exampleFor(selected) || argsText === exampleFor(name.split('|')[0] || '')) {
            setArgsText(exampleFor(name));
        }
    };

    const run = async () => {
        setError(null);
        setResult(null);
        setRunning(true);
        try {
            let args: Record<string, unknown> = {};
            const clean = argsText.trim();
            if (clean) {
                const parsed = JSON.parse(clean);
                if (parsed && typeof parsed === 'object') args = parsed;
            }
            const res = await runPlayground({ tool: selected, arguments: args });
            setResult(res);
        } catch (e: any) {
            setError(e?.message || 'Playground execution failed');
        } finally {
            setRunning(false);
        }
    };

    const copy = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(pretty(result.ok ? result.result : result.error));
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // clipboard unavailable
        }
    };

    const resultTone: Tone = result ? (result.ok || result.statusCode < 400 ? 'ok' : 'bad') : 'muted';

    return (
        <div>
            <PageHeader
                title="MCP Playground"
                subtitle="Execute real MCP tools against the live server with admin context. Responses are not simulated."
                actions={
                    <button onClick={() => void tools.reload()} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                        <RotateCcw size={13} /> Reload Tools
                    </button>
                }
            />

            <div className="grid lg:grid-cols-2 gap-6">
                <Panel>
                    <PanelHeader title="Run Tool" subtitle="Pick a tool and provide JSON arguments" />
                    <div className="p-5 space-y-5">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tool</label>
                            <select
                                value={currentTool?.name || ''}
                                onChange={(e) => selectTool(e.target.value)}
                                className="mt-2 w-full rounded-md border-2 border-white bg-brand-bg px-3 py-3 text-sm font-mono text-white outline-none focus:border-brand-blue"
                            >
                                {available.length === 0 ? (
                                    <option value="">No enabled tools</option>
                                ) : (
                                    available.map((t) => (
                                        <option key={t.name} value={t.name}>{t.name}</option>
                                    ))
                                )}
                            </select>
                            <p className="text-[11px] text-neutral-500 mt-1.5">
                                {currentTool ? `${currentTool.name} — enabled` : 'Enable a tool in the Tools page first.'}
                            </p>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Input (JSON)</label>
                            <textarea
                                value={argsText}
                                onChange={(e) => setArgsText(e.target.value)}
                                spellCheck={false}
                                rows={9}
                                className="mt-2 w-full rounded-md border-2 border-white bg-black px-4 py-3 text-xs font-mono text-brand-green outline-none focus:border-brand-blue resize-y"
                                placeholder='{ "query": "pricing card" }'
                            />
                        </div>

                        {error && (
                            <div className="rounded-md border-2 border-brand-red bg-brand-red/10 p-3 text-xs text-white/90">
                                <p className="font-black uppercase tracking-widest text-brand-red text-[10px]">Error</p>
                                <p className="mt-1 font-mono break-all">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={() => void run()}
                            disabled={running || available.length === 0}
                            className="brutal-btn-primary w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[11px] cursor-pointer disabled:opacity-40"
                        >
                            <Play size={14} /> {running ? 'Running…' : 'Run Tool'}
                        </button>
                    </div>
                </Panel>

                <Panel>
                    <PanelHeader
                        title="Response"
                        subtitle={result ? `HTTP ${result.statusCode} · ${formatMs(result.responseTimeMs)}` : 'Run a tool to see the response'}
                        actions={
                            result ? (
                                <div className="flex items-center gap-2">
                                    <StatusBadge value={result.ok || result.statusCode < 400 ? 'Success' : 'Error'} tone={resultTone} />
                                    <button onClick={() => void copy()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 border-white text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer">
                                        {copied ? <Check size={12} className="text-brand-blue" /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            ) : undefined
                        }
                    />
                    <div className="p-5">
                        {!result ? (
                            <EmptyState icon={FlaskConical} title="No response yet" message="Select a tool, enter arguments and run it against the live MCP server." />
                        ) : result.ok || result.statusCode < 400 ? (
                            <pre className="rounded-md border-2 border-white bg-black p-4 text-xs font-mono text-brand-green overflow-auto max-h-[560px] whitespace-pre-wrap break-all">
                                {pretty(result.result)}
                            </pre>
                        ) : (
                            <pre className="rounded-md border-2 border-brand-red bg-black p-4 text-xs font-mono text-brand-red overflow-auto max-h-[560px] whitespace-pre-wrap break-all">
                                {result.error}
                            </pre>
                        )}
                        {result && (
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 rounded-md border-2 border-white/40 bg-brand-bg px-4 py-3">
                                    <Timer size={14} className="text-brand-blue" />
                                    <span className="text-[10px] uppercase tracking-widest text-neutral-400">{formatMs(result.responseTimeMs)}</span>
                                </div>
                                <div className="flex items-center gap-2 rounded-md border-2 border-white/40 bg-brand-bg px-4 py-3">
                                    <Cpu size={14} className="text-brand-blue" />
                                    <span className="text-[10px] uppercase tracking-widest text-neutral-400">HTTP {result.statusCode}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </Panel>
            </div>
        </div>
    );
};

export default PlaygroundPage;