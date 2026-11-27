import type { AISystem } from './promptBuilders';
import { getApiBaseUrl } from './apiConfig';

/** Free accounts get five prompt copies per UTC day, shared by every surface. */
export const FREE_DAILY_PROMPT_COPIES = 5;

const STORAGE_KEY = 'ui-hub-free-prompt-copies';

/** Tools that require Pro or above. Free users are limited to Lovable + Cursor. */
export const PREMIUM_PROMPT_TOOLS: readonly AISystem[] = ['advance', 'antigravity', 'claude'];

export type PromptSurface = 'component' | 'template' | 'build';

export type PromptCopyBlockReason =
    | 'TOOL_LOCKED'
    | 'LIMIT_REACHED'
    | 'AUTH_REQUIRED'
    | 'ERROR';

export interface PromptCopyResult {
    ok: boolean;
    /** -1 means unlimited; otherwise copies left after this one. */
    remaining: number;
    reason?: PromptCopyBlockReason;
}

export const isPremiumPromptTool = (system: AISystem): boolean =>
    PREMIUM_PROMPT_TOOLS.includes(system);

const utcDayKey = (): string => {
    const now = new Date();
    return `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;
};

interface LocalUsage {
    day: string;
    used: number;
}

const readLocalUsage = (): LocalUsage => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { day: utcDayKey(), used: 0 };
        const parsed: unknown = JSON.parse(raw);
        if (
            typeof parsed !== 'object' ||
            parsed === null ||
            typeof (parsed as LocalUsage).day !== 'string' ||
            typeof (parsed as LocalUsage).used !== 'number'
        ) {
            return { day: utcDayKey(), used: 0 };
        }
        const usage = parsed as LocalUsage;
        if (usage.day !== utcDayKey() || !Number.isFinite(usage.used)) {
            return { day: utcDayKey(), used: 0 };
        }
        return { day: usage.day, used: Math.max(0, Math.floor(usage.used)) };
    } catch {
        return { day: utcDayKey(), used: 0 };
    }
};

/** Copies left today for visitors who are not signed in. */
export const getAnonymousPromptCopiesRemaining = (): number =>
    Math.max(0, FREE_DAILY_PROMPT_COPIES - readLocalUsage().used);

/**
 * Reserves one anonymous copy. Called only after the tool allowlist check, so
 * a locked Pro tool never spends a free copy.
 */
export const consumeAnonymousPromptCopy = (): number => {
    const usage = readLocalUsage();
    const next = { day: utcDayKey(), used: usage.used + 1 };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        /* storage disabled — keep the in-memory result for this session */
    }
    return Math.max(0, FREE_DAILY_PROMPT_COPIES - next.used);
};

/**
 * Server-authoritative gate for signed-in users. The backend validates the
 * tool allowlist and consumes one AI credit (purchased → daily → monthly).
 */
export const consumePromptCredit = async (
    token: string,
    system: AISystem,
    surface: PromptSurface,
    itemId?: string,
): Promise<PromptCopyResult> => {
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/v1/prompts/consume`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ system, surface, itemId }),
        });

        if (response.ok) {
            const data: unknown = await response.json();
            const remaining = typeof (data as { remaining?: unknown })?.remaining === 'number'
                ? (data as { remaining: number }).remaining
                : 0;
            return { ok: true, remaining };
        }

        if (response.status === 403 || response.status === 401) {
            const data: unknown = await response.json().catch(() => ({}));
            const code = (data as { code?: unknown })?.code;
            const remaining = typeof (data as { remaining?: unknown })?.remaining === 'number'
                ? (data as { remaining: number }).remaining
                : 0;
            if (code === 'PROMPT_TOOL_LOCKED') {
                return { ok: false, remaining, reason: 'TOOL_LOCKED' };
            }
            if (code === 'AUTH_REQUIRED') {
                return { ok: false, remaining, reason: 'AUTH_REQUIRED' };
            }
            return { ok: false, remaining, reason: 'LIMIT_REACHED' };
        }

        return { ok: false, remaining: 0, reason: 'ERROR' };
    } catch {
        return { ok: false, remaining: 0, reason: 'ERROR' };
    }
};

export const promptCopyBlockMessage = (reason?: PromptCopyBlockReason): string => {
    switch (reason) {
        case 'TOOL_LOCKED':
            return 'PRO TOOL — UPGRADE TO UNLOCK ADVANCE / ANTIGRAVITY / CLAUDE';
        case 'LIMIT_REACHED':
            return 'DAILY LIMIT REACHED — 5 PROMPTS / DAY. UPGRADE OR BUY CREDITS';
        case 'AUTH_REQUIRED':
            return 'SIGN IN TO COPY PROMPTS';
        case 'ERROR':
            return 'COULD NOT RESERVE A CREDIT — PLEASE RETRY';
        default:
            return 'PROMPT UNAVAILABLE';
    }
};
