import { useCallback, useEffect, useState } from 'react';
import type { AISystem } from '../utils/promptBuilders';
import { getApiBaseUrl } from '../utils/apiConfig';
import { useAuth } from '../context/AuthContext';
import {
    FREE_DAILY_PROMPT_COPIES,
    consumeAnonymousPromptCopy,
    consumePromptCredit,
    getAnonymousPromptCopiesRemaining,
    isPremiumPromptTool,
    type PromptCopyResult,
    type PromptSurface,
} from '../utils/promptCopyLimit';

export interface UsePromptCopyAccess {
    /** -1 means unlimited; otherwise copies left after the last known state. */
    remaining: number;
    isPro: boolean;
    canUseTool: (system: AISystem) => boolean;
    /** Must be awaited and must return ok before the prompt is copied. */
    reserveCopy: (system: AISystem, surface: PromptSurface, itemId?: string) => Promise<PromptCopyResult>;
}

/**
 * Shared prompt-copy gate for templates, Build with UI HUB sections and the
 * component library preview. Free users get 5 copies per day (Lovable/Cursor
 * only); signed-in users are governed by the server credit policy.
 */
export const usePromptCopyAccess = (): UsePromptCopyAccess => {
    const { user, isPro } = useAuth();
    const signedIn = Boolean(user && !user.isAnonymous);
    const [remaining, setRemaining] = useState<number>(FREE_DAILY_PROMPT_COPIES);

    // Refresh the authoritative count whenever the account or plan changes.
    useEffect(() => {
        if (isPro) {
            setRemaining(-1);
            return;
        }
        if (!signedIn) {
            setRemaining(getAnonymousPromptCopiesRemaining());
            return;
        }

        let cancelled = false;
        const loadRemaining = async () => {
            try {
                const token = await user!.getIdToken();
                const response = await fetch(`${getApiBaseUrl()}/api/v1/users/status`, {
                    headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
                });
                if (!response.ok) return;
                const data: unknown = await response.json();
                const value = (data as { credits?: { remaining?: unknown } })?.credits?.remaining;
                if (!cancelled && typeof value === 'number') {
                    setRemaining(value);
                }
            } catch {
                // Keep the last known value; the consume call re-checks server side.
            }
        };
        void loadRemaining();
        return () => {
            cancelled = true;
        };
    }, [isPro, signedIn, user]);

    const canUseTool = useCallback(
        (system: AISystem): boolean => isPro || !isPremiumPromptTool(system),
        [isPro],
    );

    const reserveCopy = useCallback(
        async (system: AISystem, surface: PromptSurface, itemId?: string): Promise<PromptCopyResult> => {
            if (!canUseTool(system)) {
                return { ok: false, remaining, reason: 'TOOL_LOCKED' };
            }

            // Pro users have all tools unlocked but still spend their plan credits.
            if (signedIn) {
                try {
                    const token = await user!.getIdToken();
                    const result = await consumePromptCredit(token, system, surface, itemId);
                    setRemaining(result.remaining);
                    return result;
                } catch {
                    return { ok: false, remaining, reason: 'ERROR' };
                }
            }

            // Offline-optimistic Pro flag with no signed-in account: no server to
            // reserve against, so allow the copy without spending a free credit.
            if (isPro) {
                return { ok: true, remaining: -1 };
            }

            if (getAnonymousPromptCopiesRemaining() <= 0) {
                return { ok: false, remaining: 0, reason: 'LIMIT_REACHED' };
            }
            const next = consumeAnonymousPromptCopy();
            setRemaining(next);
            return { ok: true, remaining: next };
        },
        [canUseTool, isPro, remaining, signedIn, user],
    );

    return { remaining, isPro, canUseTool, reserveCopy };
};
