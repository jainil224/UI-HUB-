import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Bot, KeyRound, Copy, Check, Plus, X, Trash2, Ban, Shield, Zap, Server,
    RefreshCw, AlertTriangle, Link2, Fingerprint, LucideIcon,
    Crown, Activity, BarChart3, Database, Cpu, Search, Sparkles, Wifi, ShieldCheck, ArrowUpRight,
    ChevronDown, Code2, Terminal, Boxes
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MCP_BASE_URL } from '../../utils/mcpConfig';
import {
    getMcpOverview, createApiKey, revokeApiKey, deleteApiKey, getAdminMetrics,
    McpApiKey, McpStatus, McpUsage, McpAdminMetrics, MCP_AUTH_REQUIRED
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

function formatCountdown(ms: number): string {
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
    isCliCommand?: boolean;
    build: (url: string, apiKey?: string) => string;
};

/* ── Exact, per-tool MCP config builders ── */

// Cursor: .cursor/mcp.json
const CURSOR_CONFIG = (url: string, apiKey?: string) => `{
  "mcpServers": {
    "ui-hub": {
      "url": "${url}",
      "headers": {
        "Authorization": "Bearer ${apiKey || 'YOUR_UI_HUB_API_KEY'}"
      }
    }
  }
}`;

// Antigravity (Google Gemini): ~/.gemini/config/mcp_config.json
const ANTIGRAVITY_CONFIG = (url: string, apiKey?: string) => `{
  "mcpServers": {
    "ui-hub": {
      "url": "${url}",
      "headers": {
        "Authorization": "Bearer ${apiKey || 'YOUR_UI_HUB_API_KEY'}"
      }
    }
  }
}`;

// VS Code / Copilot: .vscode/mcp.json
const VSCODE_CONFIG = (url: string, apiKey?: string) => `{
  "servers": {
    "ui-hub": {
      "type": "http",
      "url": "${url}",
      "headers": {
        "Authorization": "Bearer ${apiKey || 'YOUR_UI_HUB_API_KEY'}"
      }
    }
  }
}`;

// Lovable: Settings → Integrations → MCP
const LOVABLE_CONFIG = (url: string, apiKey?: string) => `{
  "mcpServers": {
    "ui-hub": {
      "url": "${url}",
      "headers": {
        "Authorization": "Bearer ${apiKey || 'YOUR_UI_HUB_API_KEY'}"
      }
    }
  }
}`;

// Claude Code: CLI command
const CLAUDE_CLI = (url: string, apiKey?: string) =>
    `claude mcp add ui-hub --transport http ${url} --header "Authorization: Bearer ${apiKey || 'YOUR_UI_HUB_API_KEY'}"`;

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
        build: CURSOR_CONFIG,
    },
    {
        id: 'antigravity',
        label: 'Antigravity',
        hint: 'Place in ~/.gemini/config/mcp_config.json',
        color: '#3B82F6',
        icon: Sparkles,
        logo: '/logos/antigravity-color.svg',
        build: ANTIGRAVITY_CONFIG,
    },
    {
        id: 'claude',
        label: 'Claude Code',
        hint: 'Run in your terminal',
        color: '#D97757',
        icon: Terminal,
        logo: '/logos/claude-color.svg',
        isCliCommand: true,
        build: CLAUDE_CLI,
    },
    {
        id: 'vscode',
        label: 'VS Code / Copilot',
        hint: 'Place in .vscode/mcp.json',
        color: '#0EA5E9',
        icon: Code2,
        logo: '/logos/copilot-color.svg',
        build: VSCODE_CONFIG,
    },
    {
        id: 'lovable',
        label: 'Lovable',
        hint: 'Settings → Integrations → MCP',
        color: '#FF6B6B',
        icon: Sparkles,
        logo: '/logos/lovable-color.svg',
        build: LOVABLE_CONFIG,
    },
];

const CopyButton: React.FC<{ text: string; label?: string; red?: boolean; warnsIfPlaceholder?: boolean; emerald?: boolean }> = ({ text, label = 'Copy', red = false, warnsIfPlaceholder = false, emerald = false }) => {
    const [copied, setCopied] = useState(false);
    const [warned, setWarned] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setWarned(warnsIfPlaceholder && text.includes('YOUR_UI_HUB_API_KEY'));
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div className="inline-flex flex-col gap-1.5">
            <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md border-2 text-[11px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                    emerald
                        ? copied ? 'bg-emerald-300 border-emerald-300 text-black' : 'bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-400'
                        : red
                        ? 'bg-brand-red border-brand-red text-white hover:brightness-110'
                        : 'bg-black border-white text-white hover:bg-neutral-900'
                }`}
            >
                {copied ? <Check size={14} className={emerald ? 'text-black' : 'text-brand-green'} /> : <Copy size={14} />}
                {copied ? 'Copied!' : label}
            </button>
            {warned && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-brand-yellow/60 bg-brand-yellow/10 text-[10px] font-bold uppercase tracking-wider text-brand-yellow">
                    <AlertTriangle size={11} /> Replace YOUR_UI_HUB_API_KEY with your real key
                </span>
            )}
        </div>
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

/* ── Multicolor JSON Syntax Highlighter ── */
type JsonToken = { text: string; color: string };

function tokenizeJson(json: string): JsonToken[] {
    const tokens: JsonToken[] = [];
    // Regex order: string values, keys, numbers, booleans/null, braces/brackets/colons/commas
    const re = /(\/\/[^\n]*|"(?:[^"\\]|\\.)*"|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}[\],:])/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    // Track whether the last non-whitespace token was a colon so we know if next string is a value.
    let prevSignificant = '';

    while ((match = re.exec(json)) !== null) {
        if (match.index > lastIdx) {
            tokens.push({ text: json.slice(lastIdx, match.index), color: '#9ca3af' });
        }
        const tok = match[0];
        let color = '#9ca3af';
        if (tok.startsWith('//')) {
            color = '#6b7280'; // comment — grey
        } else if (tok.startsWith('"')) {
            // Determine key vs value by checking if prevSignificant was '{' or ',' or start
            const isKey = prevSignificant !== ':';
            color = isKey ? '#60a5fa' : '#4ade80'; // blue for keys, green for string values
        } else if (tok === 'true' || tok === 'false') {
            color = '#f472b6'; // pink
        } else if (tok === 'null') {
            color = '#a78bfa'; // purple
        } else if (/^-?[\d.]+/.test(tok)) {
            color = '#fb923c'; // orange
        } else if (tok === '{' || tok === '}' || tok === '[' || tok === ']') {
            color = '#fbbf24'; // yellow for braces
        } else if (tok === ':') {
            color = '#e5e7eb';
        } else if (tok === ',') {
            color = '#6b7280';
        }
        if (tok.trim()) prevSignificant = tok.trim();
        tokens.push({ text: tok, color });
        lastIdx = match.index + tok.length;
    }
    if (lastIdx < json.length) {
        tokens.push({ text: json.slice(lastIdx), color: '#9ca3af' });
    }
    return tokens;
}

const JsonHighlight: React.FC<{ code: string; isCli?: boolean }> = ({ code, isCli }) => {
    if (isCli) {
        // CLI command coloring: command in green, flags in cyan, values in yellow
        const parts = code.split(/(?=\s--)/g);
        return (
            <pre className="p-3.5 text-xs font-mono overflow-x-auto whitespace-pre bg-black">
                <span style={{ color: '#4ade80' }}>{parts[0]}</span>
                {parts.slice(1).map((part, i) => {
                    const spaceIdx = part.indexOf(' ', 1);
                    const flag = spaceIdx === -1 ? part : part.slice(0, spaceIdx);
                    const val = spaceIdx === -1 ? '' : part.slice(spaceIdx);
                    return (
                        <span key={i}>
                            <span style={{ color: '#60a5fa' }}>{flag}</span>
                            {val && (
                                <span style={{ color: '#fbbf24' }}>{val}</span>
                            )}
                        </span>
                    );
                })}
            </pre>
        );
    }
    const tokens = tokenizeJson(code);
    return (
        <pre className="p-3.5 text-xs font-mono overflow-x-auto whitespace-pre bg-black">
            {tokens.map((t, i) => (
                <span key={i} style={{ color: t.color }}>{t.text}</span>
            ))}
        </pre>
    );
};

/* ── Main Page ── */
const MCPPage: React.FC = () => {
    const { user, isPro, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<McpStatus | null>(null);
    const [keys, setKeys] = useState<McpApiKey[]>([]);
    const [usage, setUsage] = useState<McpUsage | null>(null);
    const [adminMetrics, setAdminMetrics] = useState<McpAdminMetrics | null>(null);
    const [activeTool, setActiveTool] = useState<ToolDef>(TOOLS[0]);
    const [toolOpen, setToolOpen] = useState(false);
    const [modalToolOpen, setModalToolOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryAttempt, setRetryAttempt] = useState(0);
    const hasLoadedRef = React.useRef(false);

    const [showKey, setShowKey] = useState<string | null>(null);
    const [keyName, setKeyName] = useState('');
    const [creating, setCreating] = useState(false);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [authExpired, setAuthExpired] = useState(false);

    const load = useCallback(async (refresh = false) => {
        if (!hasLoadedRef.current) setLoading(true);
        setError(null);
        setAuthExpired(false);
        setRetryAttempt(0);
        const onAttempt = (attempt: number) => setRetryAttempt(attempt);
        try {
            const idToken = user ? await user.getIdToken() : undefined;
            const overview = await getMcpOverview(refresh, onAttempt, idToken);
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
                const metrics = await getAdminMetrics(refresh, onAttempt, idToken);
                if (metrics) setAdminMetrics(metrics);
            }
        } catch (e: any) {
            if (e?.message === MCP_AUTH_REQUIRED) {
                setAuthExpired(true);
            } else {
                setError(e?.message || 'Failed to load MCP data');
            }
        } finally {
            setLoading(false);
            setRetryAttempt(0);
            hasLoadedRef.current = true;
        }
    }, [user]);

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
        setAuthExpired(false);
        setRetryAttempt(0);
        try {
            const onAttempt = (attempt: number) => setRetryAttempt(attempt);
            const idToken = await user.getIdToken();
            const { key } = await createApiKey(keyName || 'MCP Key', onAttempt, idToken);
            setShowKey(key);
            setKeyName('');
            setRetryAttempt(0);
            // Refresh the key list in the background — never let a refresh
            // failure hide the just-created key banner.
            void load(true).catch(() => undefined);
        } catch (e: any) {
            if (e?.code === 'DAILY_KEY_LIMIT') {
                setError(`Daily limit reached: You can create only 1 API key per 24 hours. Next key available in ${formatCountdown(e.retryAfterMs || msUntilNextKey)}.`);
            } else if (e?.message === MCP_AUTH_REQUIRED) {
                setAuthExpired(true);
            } else {
                setError(e?.message || 'Failed to create key');
            }
        } finally {
            setCreating(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (revokingId) return;
        setRevokingId(id);
        setError(null);
        setAuthExpired(false);
        try {
            const idToken = await user!.getIdToken();
            await revokeApiKey(id, idToken);
            await load(true);
        } catch (e: any) {
            if (e?.message === MCP_AUTH_REQUIRED) {
                setAuthExpired(true);
            } else {
                setError(e?.message || 'Failed to revoke key');
            }
        } finally {
            setRevokingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (deletingId) return;
        setDeletingId(id);
        setDeleteConfirmId(null);
        setError(null);
        setAuthExpired(false);
        try {
            const idToken = await user!.getIdToken();
            await deleteApiKey(id, idToken);
            // After deleting, keep showKey banner so user can still copy if open
            await load(true);
        } catch (e: any) {
            if (e?.message === MCP_AUTH_REQUIRED) {
                setAuthExpired(true);
            } else {
                setError(e?.message || 'Failed to delete key');
            }
        } finally {
            setDeletingId(null);
        }
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

    // ── Daily key creation limit (1 per 24 hours; admins bypass) ────────────────
    // Computed from created_at of ALL keys (including deleted/revoked) loaded at
    // startup. Deleting a key does NOT reset the clock — matches backend logic.
    const lastKeyCreatedAt = keys.reduce((max, k) => Math.max(max, k.created_at || 0), 0);
    const msSinceLastKey = lastKeyCreatedAt > 0 ? Date.now() - lastKeyCreatedAt : Infinity;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const canCreateKey = isAdmin || msSinceLastKey >= ONE_DAY_MS;
    const msUntilNextKey = canCreateKey ? 0 : ONE_DAY_MS - msSinceLastKey;

    // The plaintext key is only known right after creation (never stored), so the
    // Connection Guide can only embed the real key while the "Key Created" banner
    // is showing. Otherwise it falls back to the placeholder to replace.
    const embeddedKey = showKey && showKey !== '__form__' ? showKey : undefined;
    const guideConfigText = activeTool.build(status?.endpoint || `${MCP_SERVER_URL}/mcp`, embeddedKey);
    const guideNeedsReplacement = !embeddedKey;

    // Config for inside the modal — always has real key embedded
    const modalConfigText = embeddedKey
        ? activeTool.build(status?.endpoint || `${MCP_SERVER_URL}/mcp`, embeddedKey)
        : '';
    const genericJsonText = embeddedKey
        ? `{\n  "mcpServers": {\n    "ui-hub": {\n      "url": "${status?.endpoint || `${MCP_SERVER_URL}/mcp`}",\n      "headers": {\n        "Authorization": "Bearer ${embeddedKey}"\n      }\n    }\n  }\n}`
        : '';

    return (
        <div className="flex flex-col gap-8">
            {/* ── Refresh toolbar ── */}
            <div className="-mb-4 flex justify-end">
                <button
                    onClick={() => void load(true)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border-2 border-white bg-brand-surface text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-40"
                >
                    <RefreshCw size={13} /> Refresh
                </button>
            </div>

            {/* ── Session expired banner ── */}
            {authExpired && (
                <div className="flex items-start gap-3 border-2 border-brand-yellow bg-brand-yellow/10 rounded-lg p-4">
                    <AlertTriangle size={20} className="text-brand-yellow shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">Your session has expired.</p>
                        <p className="text-xs text-neutral-400 mt-1">
                            Sign in again to manage your MCP keys, then come back here.
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-brand-yellow bg-brand-yellow text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer"
                    >
                        Sign in again
                    </Link>
                </div>
            )}

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
                    <button onClick={() => void load(true)} className="text-neutral-400 hover:text-white transition-colors cursor-pointer"><RefreshCw size={16} /></button>
                </div>
            )}

            {/* ── API Keys section (Moved to Top) ── */}
            <section>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-white font-heading">API Keys</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">Manage keys for MCP authentication (Limit: 1 key per 24 hours)</p>
                    </div>
                    {!showKey && (
                        canCreateKey ? (
                            <button
                                onClick={() => setShowKey('__form__')}
                                disabled={creating}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-brand-blue text-white text-[11px] font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-brand-blue-dark transition-colors cursor-pointer disabled:opacity-60"
                            >
                                <Plus size={15} /> Create API Key
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-neutral-400 border border-neutral-700 bg-neutral-900/80 px-3 py-2 rounded-md">
                                    ⏳ Next key in {formatCountdown(msUntilNextKey)}
                                </span>
                                <button
                                    disabled
                                    title="Limit: 1 API key per 24 hours"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-neutral-800 text-neutral-500 text-[11px] font-black uppercase tracking-widest border border-neutral-700 cursor-not-allowed opacity-60"
                                >
                                    <Plus size={14} /> 1 Key / Day
                                </button>
                            </div>
                        )
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
                                {!canCreateKey && (
                                    <div className="mb-4 p-3 rounded-md border border-brand-yellow/50 bg-brand-yellow/10 text-xs text-brand-yellow font-medium">
                                        ⏳ Daily limit reached: You can create only 1 API key every 24 hours. Next key available in <b>{formatCountdown(msUntilNextKey)}</b>.
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        value={keyName}
                                        onChange={(e) => setKeyName(e.target.value)}
                                        placeholder="e.g. Cursor"
                                        disabled={!canCreateKey}
                                        className="flex-1 px-4 py-3 bg-black border-2 border-neutral-700 rounded-md text-sm text-white placeholder-neutral-600 outline-none focus:border-brand-blue disabled:opacity-50"
                                    />
                                    <button
                                        onClick={() => handleCreate()}
                                        disabled={creating || !canCreateKey}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-brand-blue text-white text-[11px] font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0_0_#000] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="border-2 border-emerald-500/80 bg-neutral-950 rounded-xl p-6 mb-6 shadow-[0_0_35px_rgba(16,185,129,0.18)]"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-emerald-500/20">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 font-heading">
                                            Key Created — Copy it now
                                        </h3>
                                        <p className="text-[11px] text-neutral-400 font-medium">
                                            Shown once only • copy before dismissing
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {canCreateKey ? (
                                        <button
                                            onClick={() => setShowKey('__form__')}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors"
                                        >
                                            <Plus size={12} /> Create Another
                                        </button>
                                    ) : (
                                        <span className="text-[10px] font-mono text-neutral-400 border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 rounded">
                                            ⏳ Next key in {formatCountdown(msUntilNextKey)}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setShowKey(null)}
                                        className="text-neutral-400 hover:text-white cursor-pointer p-1.5 rounded-md hover:bg-neutral-800 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
                                For security, the full key is shown <strong className="text-white underline decoration-emerald-500 underline-offset-2">only once</strong>. You can copy the key alone or pick your AI coding tool below to get the exact, ready-to-paste config.
                            </p>

                            {/* Raw key field with single Copy Key button */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-6">
                                <code className="flex-1 px-4 py-3 bg-black border-2 border-emerald-500/40 rounded-lg text-sm font-mono text-emerald-300 font-semibold break-all select-all shadow-inner">
                                    {showKey}
                                </code>
                                <CopyButton emerald text={showKey} label="Copy Key" />
                            </div>

                            {/* Connect UI HUB to your AI (in modal) */}
                            <div className="border border-neutral-800 bg-black/70 rounded-lg p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <Bot size={16} className="text-emerald-400" />
                                        <span className="text-xs font-black uppercase tracking-wider text-white">
                                            Connect UI HUB to your AI
                                        </span>
                                    </div>

                                    {/* AI tool selector dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setModalToolOpen((o) => !o)}
                                            className="inline-flex items-center gap-2.5 rounded-md border-2 border-white/60 bg-black text-white px-3.5 py-2 text-[11px] font-black uppercase tracking-widest hover:border-white transition-colors cursor-pointer"
                                        >
                                            <ToolLogo tool={activeTool} size={16} />
                                            <span style={{ color: activeTool.color }}>{activeTool.label}</span>
                                            <ChevronDown size={14} className={`transition-transform ${modalToolOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {modalToolOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setModalToolOpen(false)} />
                                                <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-lg border-2 border-white bg-brand-surface shadow-[4px_4px_0_0_#000] overflow-hidden">
                                                    {TOOLS.map((tool) => (
                                                        <button
                                                            key={tool.id}
                                                            onClick={() => { setActiveTool(tool); setModalToolOpen(false); }}
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
                                </div>

                                {/* Live config preview */}
                                <div className="border border-neutral-800 rounded-md overflow-hidden mb-3">
                                    <div className="px-3 py-1.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                                        <span>{activeTool.label} format • key embedded</span>
                                        <span className="text-emerald-400 font-semibold">● Ready to paste</span>
                                    </div>
                                    <JsonHighlight code={modalConfigText} isCli={activeTool.isCliCommand} />
                                </div>

                                {/* Smart copy buttons */}
                                <div className="flex flex-wrap items-center justify-end gap-2.5">
                                    <CopyButton emerald text={modalConfigText} label={`Copy ${activeTool.label} Config`} />
                                    <CopyButton text={genericJsonText} label="Copy Full JSON" />
                                </div>
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
                                        <div className="mt-2 flex items-center justify-end gap-2">
                                            {isActive && (
                                                <button
                                                    onClick={() => handleRevoke(key.id)}
                                                    disabled={revokingId === key.id}
                                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border-2 border-brand-yellow/60 text-brand-yellow hover:bg-brand-yellow/10 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest cursor-pointer"
                                                >
                                                    {revokingId === key.id ? (
                                                        <>
                                                            <RefreshCw size={12} className="animate-spin" /> Revoking…
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ban size={12} /> Revoke
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {deleteConfirmId === key.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDelete(key.id)}
                                                        disabled={deletingId === key.id}
                                                        className="inline-flex items-center px-2.5 py-1.5 rounded-md border border-brand-red bg-brand-red text-white text-[9px] font-black uppercase tracking-widest hover:brightness-110 cursor-pointer"
                                                    >
                                                        {deletingId === key.id ? 'Deleting…' : 'Confirm'}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(null)}
                                                        className="inline-flex items-center px-2 py-1.5 rounded-md border border-neutral-700 text-neutral-400 hover:text-white text-[9px] font-black uppercase tracking-widest cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirmId(key.id)}
                                                    disabled={deletingId === key.id}
                                                    title="Permanently delete this key"
                                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-red/60 text-brand-red hover:bg-brand-red/10 text-[10px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-50"
                                                >
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>Note: Deleting a key does not reset the 24-hour daily key creation limit.</span>
                </div>

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
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-white font-heading">Connect UI HUB to your AI</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">Select your AI coding tool to get the instant configuration</p>
                    </div>
                </div>

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

                        <CopyButton red text={guideConfigText} label="Copy Config" warnsIfPlaceholder={guideNeedsReplacement} />
                    </div>

                    <div className="relative">
                        <div className="absolute top-0 inset-x-0 h-1" style={{ backgroundColor: activeTool.color }} />
                        <div className="flex items-center gap-2 px-5 pt-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            <ToolLogo tool={activeTool} size={14} />
                            <span style={{ color: activeTool.color }}>{activeTool.label}</span>
                            <span className="text-neutral-600">· {activeTool.hint}</span>
                        </div>
                    </div>
                    <JsonHighlight code={guideConfigText} isCli={activeTool.isCliCommand} />
                </div>

                {guideNeedsReplacement ? (
                    <div className="flex items-start gap-2.5 border-2 border-brand-red/60 bg-brand-red/10 rounded-md px-4 py-3 text-[12px] font-medium text-neutral-300 mb-3">
                        <AlertTriangle size={15} className="text-brand-red shrink-0 mt-0.5" />
                        <span>
                            <strong className="text-white">This config contains a placeholder — it will NOT connect as-is.</strong>{' '}
                            Replace <code className="font-mono text-brand-yellow bg-neutral-900 px-1 rounded">YOUR_UI_HUB_API_KEY</code> with a key from the list above, or{' '}
                            <strong className="text-white">create a key</strong> and click <em>Copy Full MCP JSON</em> for a ready-to-paste config with your real key already embedded.
                        </span>
                    </div>
                ) : (
                    <div className="flex items-start gap-2.5 border-2 border-brand-green/70 bg-brand-green/10 rounded-md px-4 py-3 text-[12px] font-medium text-neutral-300 mb-3">
                        <ShieldCheck size={15} className="text-brand-green shrink-0 mt-0.5" />
                        <span>
                            <strong className="text-white">Your key is embedded.</strong>{' '}
                            This config is ready to paste into {activeTool.label} — it already contains your real <code className="font-mono text-brand-green bg-neutral-900 px-1 rounded">uh_live_...</code> key.
                        </span>
                    </div>
                )}
            </section>

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
                            <span className="text-[10px] text-neutral-500 font-medium">Recorded calls</span>
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
