import React from 'react';
import { RefreshCw, LucideIcon } from 'lucide-react';

export type Tone = 'ok' | 'warn' | 'bad' | 'muted' | 'blue' | 'violet';

const TONE_CLASSES: Record<Tone, string> = {
    ok: 'bg-brand-blue text-white border-white',
    warn: 'bg-brand-yellow text-black border-black',
    bad: 'bg-brand-red text-white border-white',
    muted: 'bg-neutral-700 text-white border-white',
    blue: 'bg-brand-blue text-white border-white',
    violet: 'bg-[#7C3AED] text-white border-white',
};

export const toneFor = (value?: string | null): Tone => {
    const v = String(value || '').toLowerCase();
    if (['active', 'enabled', 'ok', 'operational', 'success', 'accepted', 'online', 'pro', 'elite', 'admin', 'true'].includes(v)) return 'ok';
    if (['error', 'failed', 'failure', 'offline', 'denied', 'revoked', 'suspended', 'critical', 'bad', 'stale', 'false'].includes(v)) return 'bad';
    if (['warning', 'disabled', 'paused', 'expired', 'limited', 'degraded', 'warn'].includes(v)) return 'warn';
    if (['inactive', 'free', 'pending', 'unused', 'none'].includes(v)) return 'muted';
    return 'muted';
};

export function StatusBadge({ value, tone }: { value: string | React.ReactNode; tone?: Tone }) {
    const t = tone || (typeof value === 'string' ? toneFor(value) : 'muted');
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest ${TONE_CLASSES[t]}`}>
            {typeof value === 'string' && t !== 'muted' && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            {value}
        </span>
    );
}

export const Panel: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
    <div className={`relative border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue overflow-hidden ${className}`}>
        {children}
    </div>
);

export const PanelHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
    <div className="flex items-center justify-between gap-4 border-b-2 border-white px-5 py-4">
        <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">{title}</h3>
            {subtitle && <p className="text-[11px] text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions}
    </div>
);

export const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">{title}</h1>
            {subtitle && <p className="text-sm text-neutral-400 mt-1 max-w-2xl">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
);

export const StatCard: React.FC<{
    label: string;
    value: React.ReactNode;
    sub?: React.ReactNode;
    icon?: LucideIcon;
    tone?: Tone;
    bodyClassName?: string;
}> = ({ label, value, sub, icon: Icon, tone = 'blue', bodyClassName = '' }) => (
    <Panel>
        <div className={`p-5 ${bodyClassName}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400 truncate">{label}</p>
                    <p className="text-2xl font-black text-white mt-1.5 leading-none truncate">{value}</p>
                    {sub && <div className="text-[11px] text-neutral-400 mt-2">{sub}</div>}
                </div>
                {Icon && (
                    <div className={`w-10 h-10 rounded-md border-2 flex items-center justify-center shrink-0 ${TONE_CLASSES[tone]}`}>
                        <Icon size={18} />
                    </div>
                )}
            </div>
        </div>
    </Panel>
);

export const EmptyState: React.FC<{ icon?: LucideIcon; title: string; message?: string; className?: string }> = ({
    icon: Icon,
    title,
    message,
    className = '',
}) => (
    <div className={`flex flex-col items-center justify-center text-center px-6 py-16 ${className}`}>
        {Icon && (
            <div className="w-14 h-14 rounded-lg border-2 border-white bg-black flex items-center justify-center text-neutral-400 mb-5">
                <Icon size={24} />
            </div>
        )}
        <p className="text-sm font-black uppercase tracking-widest text-white">{title}</p>
        {message && <p className="text-xs text-neutral-400 mt-2 max-w-sm">{message}</p>}
    </div>
);

export const ErrorState: React.FC<{ message?: string; onRetry: () => void; className?: string }> = ({ message, onRetry, className = '' }) => (
    <Panel className={className}>
        <div className="flex flex-col items-center justify-center text-center px-6 py-14">
            <div className="w-14 h-14 rounded-lg border-2 border-white bg-brand-red flex items-center justify-center text-white mb-5">
                <span className="text-lg font-black">!</span>
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-white">Failed to load</p>
            {message && <p className="text-xs text-neutral-400 mt-2 max-w-sm break-words">{message}</p>}
            <button onClick={onRetry} className="brutal-btn-outline mt-6 px-6 py-2.5 text-[11px] flex items-center gap-2 cursor-pointer">
                <RefreshCw size={13} /> Retry
            </button>
        </div>
    </Panel>
);

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = 'h-28' }) => (
    <div className={`rounded-lg border-2 border-white bg-brand-surface skeleton-glass skeleton-pulse ${className}`} />
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
    <div className="space-y-3">
        <div className="h-11 rounded-lg border-2 border-white bg-brand-surface skeleton-glass skeleton-pulse" />
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg border-2 border-white bg-brand-surface skeleton-glass skeleton-pulse" />
        ))}
    </div>
);

export interface DataState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export function useData<T>(loader: () => Promise<T>, deps: React.DependencyList = [], options?: { intervalMs?: number }): DataState<T> {
    const [data, setData] = React.useState<T | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const loaderRef = React.useRef(loader);
    loaderRef.current = loader;
    const dataRef = React.useRef<T | null>(null);
    const optionsRef = React.useRef(options);
    optionsRef.current = options;

    const reload = React.useCallback(async () => {
        if (dataRef.current === null) setLoading(true);
        setError(null);
        try {
            const result = await loaderRef.current();
            dataRef.current = result;
            setData(result);
        } catch (e: any) {
            if (dataRef.current === null) setError(e?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        let cancelled = false;
        const run = () => {
            if (cancelled) return;
            void reload();
        };
        run();
        const interval = optionsRef.current?.intervalMs && optionsRef.current.intervalMs > 0
            ? setInterval(run, optionsRef.current.intervalMs)
            : undefined;
        return () => {
            cancelled = true;
            if (interval) clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error, reload };
}

export const Pagination: React.FC<{
    page: number;
    pageSize: number;
    total: number;
    onPage: (page: number) => void;
}> = ({ page, pageSize, total, onPage }) => {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    return (
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-t-2 border-white">
            <span className="text-[11px] font-mono text-neutral-400">
                {total === 0 ? '0 results' : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 rounded-md border-2 border-white text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                    Prev
                </button>
                <span className="text-[11px] font-mono text-neutral-300 px-1">{page} / {pages}</span>
                <button
                    onClick={() => onPage(Math.min(pages, page + 1))}
                    disabled={page >= pages}
                    className="px-3 py-1.5 rounded-md border-2 border-white text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[720px]">{children}</table>
    </div>
);

export const Th: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <th className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 whitespace-nowrap ${className}`}>{children}</th>
);

export const Td: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <td className={`px-5 py-3 border-t-2 border-white/60 whitespace-nowrap text-white/90 ${className}`}>{children}</td>
);

/* ── Formatting helpers ── */
export function formatCompact(n?: number | null): string {
    if (n === undefined || n === null || isNaN(n)) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

export function formatNum(n?: number | null): string {
    if (n === undefined || n === null || isNaN(n)) return '0';
    return n.toLocaleString('en-US');
}

export function formatMs(ms?: number | null): string {
    if (ms === undefined || ms === null || ms === 0) return '—';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

export function formatPct(n?: number | null): string {
    if (n === undefined || n === null || isNaN(n)) return '0%';
    return `${(n * 100).toFixed(n >= 1 ? 0 : 1)}%`;
}

export function formatDate(ts?: number | null): string {
    if (!ts) return '—';
    const d = new Date(ts);
    const today = new Date();
    const sameDay = d.toDateString() === today.toDateString();
    if (sameDay) return `Today ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(ts?: number | null): string {
    if (!ts) return '—';
    const diff = Date.now() - ts;
    const s = Math.floor(diff / 1000);
    if (s < 5) return 'just now';
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return formatDate(ts);
}

export function keyPrefixMask(prefix?: string | null): string {
    if (!prefix) return 'uh_live_••••';
    return prefix + '••••••••••••';
}