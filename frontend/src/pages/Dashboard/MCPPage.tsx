import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Bot, KeyRound, Copy, Check, Plus, X, Trash2, Shield, Zap, Server,
    RefreshCw, AlertTriangle, Link2, Fingerprint, LucideIcon,
    Crown, Activity, BarChart3, Database, Cpu, Search, Sparkles, Wifi, ShieldCheck, ArrowUpRight,
    ChevronDown, Code2, Terminal, Boxes
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMcpKeepAlive } from '../../hooks/useMcpKeepAlive';
import { MCP_BASE_URL } from '../../utils/mcpConfig';
import {
    getMcpOverview, createApiKey, revokeApiKey, getAdminMetrics,
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

function formatNum(n?: number | null): string {
    if (n === undefined || n === null || isNaN(n)) return '0';
    return n.toLocaleString('en-US');
}

const MCP_SERVER_URL = MCP_BASE_URL;

type ToolDef = {
    id: string;
    label: string;
    hint: string;
    color: string;
    icon: LucideIcon;
    logo: string;
    logoClass?: string;
    build: (url: string) => string;
};

const JSON_CONFIG = (url: string) => `{
  "mcpServers": {
    "ui-hub": {
      "url": "${url}",
      "headers": {
        "Authorization": "Bearer YOUR_UI_HUB_API_KEY"
      }
    }
  }
}`;

/* ── Tool-specific MCP configs (exact structures per tool) ── */
const TOOLS: ToolDef[] = [
    {
        id: 'cursor',
        label: 'Cursor',
        hint: 'Place in .cursor/mcp.json',
        color: '#5B5BD6',
        icon: Boxes,
        logo: '/logos/cursor.svg',
        logoClass: 'brightness-0 invert',
        build: JSON_CONFIG,
    },
    {
        id: 'claude',
        label: 'Claude Code',
        hint: 'Run: claude mcp add ui-hub',
        color: '#D97757',
        icon: Terminal,
        logo: '/logos/claude-color.svg',
        build: (url) => `claude mcp add ui-hub --transport http ${url} --header "Authorization: Bearer YOUR_UI_HUB_API_KEY"`,
    },
    {
        id: 'antigravity',
        label: 'Antigravity',
        hint: 'Place in ~/.gemini/config/mcp_config.json',
        color: '#3B82F6',
        icon: Sparkles,
        logo: '/logos/antigravity-color.svg',
        build: JSON_CONFIG,
    },
    {
        id: 'vscode',
        label: 'VS Code / Copilot',
        hint: 'Place in .vscode/mcp.json',
        color: '#0EA5E9',
        icon: Code2,
        logo: '/logos/copilot-color.svg',
        build: JSON_CONFIG,
    },
];

const CopyButton: React.FC<{ text: string; label?: string; red?: boolean }> = ({ text, label = 'Copy', red = false }) => {
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
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md border-2 text-[11px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                red
                    ? 'bg-brand-red border-brand-red text-white hover:brightness-110'
                    : 'bg-black border-white text-white hover:bg-neutral-900'
            }`}
        >
            {copied ? <Check size={14} className="text-brand-green" /> : <Copy size={14} />}
            {copied ? 'Copied' : label}
        </button>
    );
};

const ToolLogo: React.FC<{ tool: ToolDef; size?: number; className?: string }> = ({ tool, size = 16, className = '' }) => (
    <img
        src={tool.logo}
        alt={`${tool.label} logo`}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`shrink-0 object-contain ${tool.logoClass || ''} ${className}`}
    />
);

/* ── Main Page ── */
const MCPPage: React.FC = () => {
    const { user, isPro, loading: authLoading } = useAuth();
    useMcpKeepAlive();
    const [status, setStatus] = useState<McpStatus | null>(null);
    const [keys, setKeys] = useState<McpApiKey[]>([]);
    const [usage, setUsage] = useState<McpUsage | null>(null);
    const [adminMetrics, setAdminMetrics] = useState<McpAdminMetrics | null>(null);
    const [activeTool, setActiveTool] = useState<ToolDef>(TOOLS[0]);
    const [toolOpen, setToolOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryAttempt, setRetryAttempt] = useState(0);
    const hasLoadedRef = React.useRef(false);

    const [showKey, setShowKey] = useState<string | null>(null);
    const [keyName, setKeyName] = useState('');
    const [creating, setCreating] = useState(false);

    const load = useCallback(async (refresh = false) => {
        if (!hasLoadedRef.current) setLoading(true);
        setError(null);
        setRetryAttempt(0);
        const onAttempt = (attempt: number) => setRetryAttempt(attempt);
        try {
            const overview = await getMcpOverview(refresh, onAttempt);
            setStatus({
                endpoint: overview.endpoint,
                headerAuth: overview.headerAuth,
                tier: overview.tier,
                keys: overview.keys,
                rateLimit: overview.rateLimit,
                features: overview.features,
            });
            setKeys(overview.items);
            setUsage(overview.usage);

            if (overview.tier === 'ADMIN' || overview.tier === 'ELITE') {
                const metrics = await getAdminMetrics(refresh, onAttempt);
                if (metrics) setAdminMetrics(metrics);
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to load MCP data');
        } finally {
            setLoading(false);
            setRetryAttempt(0);
            hasLoadedRef.current = true;
        }
    }, []);

    useEffect(() => {
        if (!authLoading && user) {
            void load();
        } else if (!authLoading && !user) {
            setLoading(false);
            hasLoadedRef.current = true;
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
            await load(true);
        } catch (e: any) {
            setError(e?.message || 'Failed to create key');
        } finally {
            setCreating(false);
        }
    };

    const handleRevoke = async (id: string) => {
        await revokeApiKey(id);
        await load(true);
    };

    /* ── Loading ── */
    if (loading && !status) {
        return (
            <div>
                <div className="flex items-start gap-3 border-2 border-brand-yellow bg-brand-yellow/10 rounded-lg p-4 mb-6">
                    <Wifi size={20} className="text-brand-yellow shrink-0 mt-0.5 animate-pulse" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">
                            Waking up MCP server…
                            {retryAttempt > 0 && (
                                <span className="text-brand-yellow ml-2">(attempt {Math.min(retryAttempt + 1, 3)}/3)</span>
                            )}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                            First load can take up to a minute while the on-demand backend boots. Retrying automatically — hang tight.
                        </p>
                    </div>
                </div>
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
    const isAdminEmail = user?.email?.toLowerCase() === 'jainil11199@gmail.com';
    const isAdmin = tier === 'ADMIN' || tier === 'ELITE' || isAdminEmail;

    const featuredTools = status?.features
        ? Object.entries(status.features)
              .filter(([, enabled]) => !!enabled)
              .map(([name]) => name)
        : [];

    return (
        <div className="flex flex-col gap-8">
            {/* ── Error banner ── */}
            {error && (
                <div className="flex items-start gap-3 border-2 border-brand-red bg-brand-red/10 rounded-lg p-4">
                    <AlertTriangle size={20} className="text-brand-red shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">{error}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                            Tried {MCP_SERVER_URL} after multiple retries. If it fails to stay up, enable a keep-alive (see KEEPALIVE.md). Local dev? Set <code className="font-mono bg-black px-1 rounded">VITE_MCP_API_URL=http://localhost:3001</code>.
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

                        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white font-heading mb-3">
                            Connect UI HUB to <span className="text-brand-blue">your AI</span>
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

                        <div className="mt-4 flex items-start gap-2.5 border-2 border-brand-yellow/70 bg-black/60 rounded-md px-4 py-3 text-[12px] font-medium text-neutral-300">
                            <AlertTriangle size={15} className="text-brand-yellow shrink-0 mt-0.5" />
                            <span>
                                <strong className="text-white">The endpoint URL alone won't connect.</strong>{' '}
                                AI tools require the <code className="font-mono text-brand-yellow px-1 bg-neutral-900 rounded">Authorization: Bearer uh_live_...</code>{' '}
                                header. After creating a key, copy the <strong className="text-white">full ready-to-paste config</strong> below — it embeds your key so a bare URL is never pasted.
                            </span>
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
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                to="/admin/mcp"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-brand-yellow bg-brand-yellow text-black text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000] hover:brightness-110 transition-all cursor-pointer"
                            >
                                <ShieldCheck size={14} /> Admin Panel <ArrowUpRight size={13} />
                            </Link>
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-green/40 bg-brand-green/10 text-brand-green text-[10px] font-black uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" /> Live Telemetry
                            </span>
                        </div>
                    </div>

                    {/* Admin KPI Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900/60">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                                <Activity size={13} className="text-brand-blue" /> Total AI Requests
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-white font-heading">
                                {adminMetrics ? formatNum(adminMetrics.totalRequests) : '—'}
                            </div>
                            <span className="text-[10px] text-neutral-500 font-medium">Platform-wide MCP hits</span>
                        </div>

                        <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900/60">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                                <KeyRound size={13} className="text-brand-green" /> Total Active Keys
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-brand-green font-heading">
                                {adminMetrics ? formatNum(adminMetrics.activeKeys) : '—'}
                            </div>
                            <span className="text-[10px] text-neutral-500 font-medium">Across all users</span>
                        </div>

                        <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900/60">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                                <Cpu size={13} className="text-purple-400" /> Server Memory / Load
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-purple-400 font-heading">
                                {adminMetrics?.server?.memoryUsage || '—'}
                            </div>
                            <span className="text-[10px] text-neutral-500 font-medium">Node.js Heap Memory</span>
                        </div>

                        <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900/60">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                                <Shield size={13} className="text-brand-yellow" /> Rate Limit (free / pro)
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-brand-yellow font-heading">
                                {status?.rateLimit ? `${status.rateLimit.free} / ${status.rateLimit.pro}` : adminMetrics ? `${adminMetrics.failedRequests} failed` : '—'}
                            </div>
                            <span className="text-[10px] text-neutral-500 font-medium">requests per period</span>
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
                                    <span>Database:</span>
                                    <span className={`font-mono font-medium ${adminMetrics?.dbConnected ? 'text-brand-green' : 'text-brand-red'}`}>
                                        MongoDB Atlas {adminMetrics ? (adminMetrics.dbConnected ? '(Online)' : '(Offline)') : '(unknown)'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <span>Server Status:</span>
                                    <span className={`font-mono font-medium ${adminMetrics?.server?.status === 'healthy' ? 'text-brand-green' : 'text-brand-yellow'}`}>
                                        {adminMetrics?.server?.status || '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <span>Server Version:</span>
                                    <span className="text-neutral-300 font-mono">{adminMetrics?.server?.version || '—'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-md border border-neutral-800 bg-black">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white mb-3">
                                <Sparkles size={14} className="text-brand-yellow" /> Registered AI Tools ({featuredTools.length} Active)
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {featuredTools.map((tool) => (
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
                    <div className="border-b-2 border-white bg-brand-bg px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setToolOpen((o) => !o)}
                                className="inline-flex items-center gap-2.5 rounded-md border-2 border-white bg-black text-white px-4 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-colors cursor-pointer"
                            >
                                <ToolLogo tool={activeTool} size={18} />
                                <span style={{ color: activeTool.color }}>{activeTool.label}</span>
                                <ChevronDown size={14} className={`transition-transform ${toolOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {toolOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setToolOpen(false)} />
                                    <div className="absolute top-full left-0 mt-2 z-50 w-72 rounded-lg border-2 border-white bg-brand-surface shadow-[4px_4px_0_0_#000] overflow-hidden">
                                        {TOOLS.map((tool) => (
                                            <button
                                                key={tool.id}
                                                onClick={() => { setActiveTool(tool); setToolOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${activeTool.id === tool.id ? 'bg-neutral-900' : 'hover:bg-neutral-900/60'}`}
                                            >
                                                <span className="w-7 h-7 shrink-0 rounded-md border border-white/30 bg-black flex items-center justify-center p-1">
                                                    <ToolLogo tool={tool} size={18} />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-[11px] font-black uppercase tracking-widest text-white">{tool.label}</span>
                                                    <span className="block text-[10px] text-neutral-400 truncate">{tool.hint}</span>
                                                </span>
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tool.color }} />
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <CopyButton red text={activeTool.build(status?.endpoint || `${MCP_SERVER_URL}/mcp`)} label="Copy Config" />
                    </div>

                    <div className="relative">
                        <div className="absolute top-0 inset-x-0 h-1" style={{ backgroundColor: activeTool.color }} />
                        <div className="flex items-center gap-2 px-5 pt-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            <ToolLogo tool={activeTool} size={14} />
                            <span style={{ color: activeTool.color }}>{activeTool.label}</span>
                            <span className="text-neutral-600">· {activeTool.hint}</span>
                        </div>
                    </div>
                    <pre className="p-5 text-xs font-mono text-brand-green bg-black overflow-x-auto whitespace-pre">{activeTool.build(status?.endpoint || `${MCP_SERVER_URL}/mcp`)}</pre>
                </div>

                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                    Replace <code className="font-mono text-brand-yellow bg-neutral-900 px-1 rounded">YOUR_UI_HUB_API_KEY</code> with a key from above. You can copy any single tool config — it pastes the exact structure that tool expects.
                </p>
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
