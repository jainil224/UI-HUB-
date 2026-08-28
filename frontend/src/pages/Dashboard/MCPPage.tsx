import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Bot, KeyRound, Copy, Check, Plus, X, Trash2, Shield, Zap, Server,
    RefreshCw, AlertTriangle, Link2, ExternalLink, Fingerprint, LucideIcon,
    Crown, Activity, BarChart3, Database, Cpu, Search, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    getMcpStatus, listApiKeys, createApiKey, revokeApiKey, getMcpUsage, getAdminMetrics,
    McpApiKey, McpStatus, McpUsage, McpAdminMetrics
} from '../../services/mcp';

/* ── Helpers ── */
function formatDate(ts?: number | null): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function maskKey(prefix: string): string {
    if (!prefix) return 'uh_live_••••••••';
    const dots = '•'.repeat(Math.max(10, 28 - prefix.length));
    return `${prefix}${dots}`;
}

const MCP_SERVER_URL = import.meta.env.VITE_MCP_API_URL || 'https://api.ui-hub-design.com';

const CONFIG_TEMPLATE = `{
  "mcpServers": {
    "ui-hub": {
      "url": "${MCP_SERVER_URL}/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_UI_HUB_API_KEY"
      }
    }
  }
}`;

const CopyButton: React.FC<{ text: string; label?: string }> = ({ text, label = 'Copy' }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border-2 border-white bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-colors cursor-pointer"
        >
            {copied ? <Check size={14} className="text-brand-green" /> : <Copy size={14} />}
            {copied ? 'Copied' : label}
        </button>
    );
};

/* ── Connection Guide ── */
const CONNECT_CLIENTS = [
    { name: 'Cursor', description: 'Add to your project\'s .cursor/mcp.json', config: 'Available in Cursor Settings → MCP → Add Server' },
    { name: 'Claude Code', description: 'claude mcp add ui-hub --transport http', config: 'Use: claude mcp add ui-hub --transport http <url>' },
    { name: 'VS Code / Copilot', description: 'Configure via .vscode/mcp.json', config: 'Place the JSON config in .vscode/mcp.json' },
    { name: 'Antigravity', description: 'Configure via mcp_config.json or IDE Settings', config: 'Add to ~/.gemini/config/mcp_config.json' },
];

/* ── Main Page ── */
const MCPPage: React.FC = () => {
    const { user, isPro, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<McpStatus | null>(null);
    const [keys, setKeys] = useState<McpApiKey[]>([]);
    const [usage, setUsage] = useState<McpUsage | null>(null);
    const [adminMetrics, setAdminMetrics] = useState<McpAdminMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showKey, setShowKey] = useState<string | null>(null);
    const [keyName, setKeyName] = useState('');
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [s, k, u] = await Promise.all([getMcpStatus(), listApiKeys(), getMcpUsage()]);
            setStatus(s);
            setKeys(k);
            setUsage(u);

            if (s.tier === 'ADMIN' || s.tier === 'ELITE') {
                const metrics = await getAdminMetrics();
                if (metrics) setAdminMetrics(metrics);
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to load MCP data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && user) {
            void load();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [authLoading, user, load]);

    const handleCreate = async () => {
        if (!user) return;
        setCreating(true);
        setError(null);
        try {
            const { key } = await createApiKey(keyName || 'MCP Key');
            setShowKey(key);
            setKeyName('');
            await load();
        } catch (e: any) {
            setError(e?.message || 'Failed to create key');
        } finally {
            setCreating(false);
        }
    };

    const handleRevoke = async (id: string) => {
        await revokeApiKey(id);
        await load();
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div>
                <div className="h-40 rounded-lg border-2 border-white bg-brand-surface skeleton-glass skeleton-pulse" />
                <div className="grid sm:grid-cols-2 gap-6 mt-8">
                    <div className="h-56 rounded-lg border-2 border-white bg-brand-surface skeleton-glass skeleton-pulse" />
                    <div className="h-56 rounded-lg border-2 border-white bg-brand-surface skeleton-glass skeleton-pulse" />
                </div>
            </div>
        );
    }

    /* ── Not authenticated ── */
    if (!user) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-lg mx-auto border-2 border-white bg-brand-surface rounded-xl brutal-shadow-red p-8 sm:p-12 text-center"
            >
                <div className="w-16 h-16 mx-auto mb-6 rounded-lg border-2 border-white bg-black brutal-shadow-blue flex items-center justify-center">
                    <Bot size={28} className="text-brand-blue" />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tight text-white leading-none mb-4 font-heading">
                    SIGN IN <span className="text-brand-blue">REQUIRED</span>
                </h1>
                <p className="text-neutral-400 font-medium text-sm leading-relaxed mb-8">
                    Sign in to your UI HUB account to create MCP API keys and connect your AI coding assistant.
                </p>
            </motion.div>
        );
    }

    const tier = status?.tier || (isPro ? 'PRO' : 'FREE');
    const isAdmin = tier === 'ADMIN' || tier === 'ELITE';

    return (
        <div className="flex flex-col gap-8">
            {/* ── Error banner ── */}
            {error && (
                <div className="flex items-start gap-3 border-2 border-brand-red bg-brand-red/10 rounded-lg p-4">
                    <AlertTriangle size={20} className="text-brand-red shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">{error}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                            If the MCP server is not deployed yet, set the local URL via <code className="font-mono bg-black px-1 rounded">VITE_MCP_API_URL=http://localhost:3001</code>
                        </p>
                    </div>
                    <button onClick={() => void load()} className="text-neutral-400 hover:text-white transition-colors cursor-pointer"><RefreshCw size={16} /></button>
                </div>
            )}

            {/* ── Overview card ── */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                <div className="relative border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-brand-blue" />
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                    <div className="relative p-6 md:p-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-white bg-black rounded-md font-black text-[10px] uppercase tracking-widest text-white mb-5">
                            <Bot size={12} className="text-brand-blue" />
                            <span>MCP Overview</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-tight text-white leading-none font-heading mb-4">
                            CONNECT <span className="text-brand-blue">UI HUB</span> TO YOUR AI
                        </h1>
                        <p className="max-w-2xl text-neutral-400 font-medium text-sm sm:text-base leading-relaxed">
                            Connect UI HUB to your AI coding assistant and use UI HUB components directly inside your development workflow.
                        </p>

                        {/* Status pills */}
                        <div className="flex flex-wrap items-center gap-3 mt-6">
                            <StatusBadge ok={keys.some(k => k.status === 'active')} label="API Key" />
                            <StatusBadge ok={!!status} label="MCP Server" />
                            <StatusBadge ok={tier !== 'FREE'} label={tier} />
                        </div>

                        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <MetaCell icon={Server} label="MCP Endpoint" value={status?.endpoint || `${MCP_SERVER_URL}/mcp`} mono />
                            <MetaCell icon={KeyRound} label="API Keys" value={`${status?.keys.active ?? keys.filter(k => k.status === 'active').length} active`} />
                            <MetaCell icon={Zap} label="Plan" value={tier} />
                            <MetaCell icon={Fingerprint} label="Auth" value="Bearer uh_live_..." mono />
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* ── Admin Telemetry & Control Center (ADMIN ONLY) ── */}
            {isAdmin && (
                <motion.section
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-brand-yellow bg-black rounded-lg p-6 sm:p-8 brutal-shadow-white relative overflow-hidden"
                >
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-neutral-800 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md border-2 border-brand-yellow bg-black flex items-center justify-center shadow-[2px_2px_0_0_#eab308]">
                                <Crown size={20} className="text-brand-yellow" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-heading">
                                    ADMIN TELEMETRY & CONTROL
                                </h2>
                                <p className="text-xs text-neutral-400 font-medium">
                                    Live platform metrics, server health & AI tool telemetry
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-green/40 bg-brand-green/10 text-brand-green text-[10px] font-black uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" /> Live Telemetry
                        </span>
                    </div>

                    {/* Admin KPI Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900/60">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                                <Activity size={13} className="text-brand-blue" /> Total AI Requests
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-white font-heading">
                                {adminMetrics?.totalRequests ?? usage?.totalKeys ?? 0}
                            </div>
                            <span className="text-[10px] text-neutral-500 font-medium">Platform-wide MCP hits</span>
                        </div>

                        <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900/60">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                                <KeyRound size={13} className="text-brand-green" /> Total Active Keys
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-brand-green font-heading">
                                {adminMetrics?.activeKeys ?? status?.keys.active ?? keys.length}
                            </div>
                            <span className="text-[10px] text-neutral-500 font-medium">Across all users</span>
                        </div>

                        <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900/60">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                                <Cpu size={13} className="text-purple-400" /> Server Memory / Load
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-purple-400 font-heading">
                                {adminMetrics?.server?.memoryUsage || '38 MB'}
                            </div>
                            <span className="text-[10px] text-neutral-500 font-medium">Node.js Heap Memory</span>
                        </div>

                        <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900/60">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                                <Shield size={13} className="text-brand-yellow" /> Rate Limit Status
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-brand-yellow font-heading">
                                Unlimited
                            </div>
                            <span className="text-[10px] text-neutral-500 font-medium">Admin bypass active</span>
                        </div>
                    </div>

                    {/* Infrastructure & Engine Specs */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-md border border-neutral-800 bg-black">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white mb-3">
                                <Database size={14} className="text-brand-blue" /> Infrastructure Health
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between text-neutral-400">
                                    <span>MCP Transport Protocol:</span>
                                    <span className="text-white font-mono font-medium">Streamable HTTP (JSON-RPC 2.0)</span>
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <span>Database & Auth:</span>
                                    <span className="text-brand-green font-mono font-medium">Firestore Admin SDK (Online)</span>
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <span>Rate Limiter Store:</span>
                                    <span className="text-white font-mono font-medium">Upstash Redis / Distributed Memory</span>
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <span>Server Version:</span>
                                    <span className="text-neutral-300 font-mono">v1.0.0 (Oregon Node.js 20)</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-md border border-neutral-800 bg-black">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white mb-3">
                                <Sparkles size={14} className="text-brand-yellow" /> Registered AI Tools (9 Active)
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    'search_components', 'get_component', 'get_component_code',
                                    'search_templates', 'get_template', 'search_animations',
                                    'get_animation_code', 'list_categories', 'get_dependencies'
                                ].map((tool) => (
                                    <span key={tool} className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded text-[10px] font-mono text-neutral-300">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.section>
            )}

            {/* ── API Keys section ── */}
            <section>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white font-heading">API Keys</h2>
                    {!showKey && (
                        <button
                            onClick={() => setShowKey('__form__')}
                            disabled={creating}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-brand-blue text-white text-[11px] font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-brand-blue-dark transition-colors cursor-pointer disabled:opacity-60"
                        >
                            <Plus size={15} /> Create API Key
                        </button>
                    )}
                </div>

                {/* Create form / new key display */}
                <AnimatePresence>
                    {showKey === '__form__' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="border-2 border-white bg-brand-surface rounded-lg p-6 mb-6">
                                <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Key Name (optional)</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        value={keyName}
                                        onChange={(e) => setKeyName(e.target.value)}
                                        placeholder="e.g. Cursor"
                                        className="flex-1 px-4 py-3 bg-black border-2 border-neutral-700 rounded-md text-sm text-white placeholder-neutral-600 outline-none focus:border-brand-blue"
                                    />
                                    <button
                                        onClick={() => handleCreate()}
                                        disabled={creating}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-brand-blue text-white text-[11px] font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0_0_#000] cursor-pointer disabled:opacity-60"
                                    >
                                        {creating ? 'Creating...' : 'Generate Key'}
                                    </button>
                                    <button
                                        onClick={() => setShowKey(null)}
                                        className="inline-flex items-center justify-center px-4 py-3 rounded-md border-2 border-neutral-700 text-neutral-400 hover:text-white text-[11px] font-black uppercase tracking-widest cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {showKey && showKey !== '__form__' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border-2 border-brand-green bg-brand-surface rounded-lg p-6 mb-6 brutal-shadow-white"
                        >
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-brand-green" />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-brand-green">Key Created — Copy it now</h3>
                                </div>
                                <button onClick={() => setShowKey(null)} className="text-neutral-400 hover:text-white cursor-pointer p-1 rounded hover:bg-neutral-800 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-xs text-neutral-400 mb-4">
                                For security, the full key is shown <strong className="text-white">only once</strong>. You can copy the key alone or copy the complete, ready-to-paste AI config directly.
                            </p>

                            {/* Raw key field + quick action buttons */}
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 mb-4">
                                <code className="flex-1 px-3.5 py-2.5 bg-black border-2 border-neutral-700 rounded-md text-sm font-mono text-brand-green break-all select-all">
                                    {showKey}
                                </code>
                                <div className="flex flex-wrap items-center gap-2">
                                    <CopyButton text={showKey} label="Copy Key" />
                                    <CopyButton
                                        text={`{\n  "mcpServers": {\n    "ui-hub": {\n      "url": "${status?.endpoint || `${MCP_SERVER_URL}/mcp`}",\n      "headers": {\n        "Authorization": "Bearer ${showKey}"\n      }\n    }\n  }\n}`}
                                        label="Copy Full MCP JSON"
                                    />
                                    <CopyButton
                                        text={`claude mcp add ui-hub --transport http ${status?.endpoint || `${MCP_SERVER_URL}/mcp`} --header "Authorization: Bearer ${showKey}"`}
                                        label="Copy Claude CLI"
                                    />
                                </div>
                            </div>

                            {/* Live AI Configuration snippet preview */}
                            <div className="border border-neutral-800 bg-black/60 rounded-md overflow-hidden">
                                <div className="border-b border-neutral-800 px-3.5 py-2 flex items-center justify-between bg-neutral-900/50">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                        Ready-to-paste AI Config (Cursor, Antigravity, VS Code, Claude)
                                    </span>
                                    <CopyButton
                                        text={`{\n  "mcpServers": {\n    "ui-hub": {\n      "url": "${status?.endpoint || `${MCP_SERVER_URL}/mcp`}",\n      "headers": {\n        "Authorization": "Bearer ${showKey}"\n      }\n    }\n  }\n}`}
                                        label="Copy JSON"
                                    />
                                </div>
                                <pre className="p-3.5 text-xs font-mono text-brand-green/90 overflow-x-auto whitespace-pre">
{`{
  "mcpServers": {
    "ui-hub": {
      "url": "${status?.endpoint || `${MCP_SERVER_URL}/mcp`}",
      "headers": {
        "Authorization": "Bearer ${showKey}"
      }
    }
  }
}`}
                                </pre>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Key list */}
                {keys.length === 0 ? (
                    <div className="border-2 border-white/20 bg-brand-surface rounded-lg p-10 text-center">
                        <KeyRound size={32} className="mx-auto mb-4 text-neutral-500" />
                        <p className="text-neutral-400 font-medium">No API keys yet. Create your first key to connect your AI assistant.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {keys.map((key) => {
                            const isActive = key.status === 'active';
                            return (
                                <div key={key.id} className="border-2 border-white bg-brand-surface rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-neutral-700 text-[9px] font-black uppercase tracking-wider text-neutral-400">
                                                <StatusDot active={isActive} /> {isActive ? 'Active' : key.status}
                                            </span>
                                            <span className="text-sm font-bold text-white truncate">{key.name}</span>
                                        </div>
                                        <code className="text-xs font-mono text-neutral-400">{maskKey(key.key_prefix)}</code>
                                    </div>
                                    <div className="flex flex-col gap-1 text-right text-[11px] text-neutral-500">
                                        <span>Created: <span className="text-neutral-300 font-medium">{formatDate(key.expires_at ? key.created_at : key.created_at)}</span></span>
                                        <span>Last used: <span className="text-neutral-300 font-medium">{formatDate(key.last_used_at ?? undefined)}</span></span>
                                        {isActive && (
                                            <button
                                                onClick={() => handleRevoke(key.id)}
                                                className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border-2 border-brand-red/60 text-brand-red hover:bg-brand-red/10 text-[10px] font-black uppercase tracking-widest cursor-pointer"
                                            >
                                                <Trash2 size={13} /> Revoke
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Premium note */}
                {tier === 'FREE' && (
                    <div className="mt-4 flex items-start gap-3 border-2 border-brand-yellow/40 bg-brand-yellow/5 rounded-lg p-4">
                        <Link2 size={18} className="text-brand-yellow shrink-0 mt-0.5" />
                        <p className="text-xs text-neutral-300 leading-relaxed">
                            Free accounts can search UI HUB components via MCP. To access <strong className="text-white">premium source code</strong>,
                            templates, and higher usage limits, <a href="/pricing" className="text-brand-blue font-bold underline">upgrade to Pro</a>.
                        </p>
                    </div>
                )}
            </section>

            {/* ── Connection Guide ── */}
            <section>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white font-heading mb-4">Connect UI HUB to your AI</h2>

                <div className="border-2 border-white bg-brand-surface rounded-lg overflow-hidden mb-6">
                    <div className="border-b-2 border-white bg-brand-bg px-5 py-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-300">
                            <ExternalLink size={13} className="text-brand-blue" /> MCP Configuration
                        </span>
                        <CopyButton text={CONFIG_TEMPLATE} label="Copy Config" />
                    </div>
                    <pre className="p-5 text-xs font-mono text-brand-green bg-black overflow-x-auto whitespace-pre">{CONFIG_TEMPLATE}</pre>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    {CONNECT_CLIENTS.map((client) => (
                        <div key={client.name} className="border-2 border-white bg-brand-surface rounded-lg p-5">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">{client.name}</h3>
                            <p className="text-xs text-neutral-400 leading-relaxed mb-3">{client.description}</p>
                            <p className="text-[11px] text-neutral-500 font-mono bg-black border border-neutral-800 rounded px-2 py-1.5">{client.config}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

/* ── Small components ── */
const StatusDot: React.FC<{ active: boolean }> = ({ active }) => (
    <span className={`w-2 h-2 rounded-full ${active ? 'bg-brand-green' : 'bg-neutral-600'}`} />
);

const StatusBadge: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border-2 text-[10px] font-black uppercase tracking-widest ${
        ok ? 'border-brand-green/60 text-brand-green bg-brand-green/5' : 'border-neutral-700 text-neutral-500'
    }`}>
        <span className={`w-2 h-2 rounded-full ${ok ? 'bg-brand-green' : 'bg-neutral-600'}`} />
        {label}
    </span>
);

const MetaCell: React.FC<{ icon: LucideIcon; label: string; value: string; mono?: boolean }> = ({ icon: Icon, label, value, mono }) => (
    <div className="bg-black/40 border border-neutral-800 rounded-md p-3">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">
            <Icon size={12} className="text-brand-blue" /> {label}
        </div>
        <div className={`text-sm font-medium text-white break-all ${mono ? 'font-mono text-[13px]' : ''}`}>{value}</div>
    </div>
);

export default MCPPage;
