import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    FREE_DAILY_PROMPT_COPIES,
    consumeAnonymousPromptCopy,
    getAnonymousPromptCopiesRemaining,
    isPremiumPromptTool,
    promptCopyBlockMessage,
} from './promptCopyLimit';

class MemoryStorage {
    private values = new Map<string, string>();

    getItem(key: string): string | null {
        return this.values.get(key) ?? null;
    }

    setItem(key: string, value: string): void {
        this.values.set(key, value);
    }

    removeItem(key: string): void {
        this.values.delete(key);
    }

    clear(): void {
        this.values.clear();
    }
}

beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
});

describe('prompt copy tool allowlist', () => {
    it('locks advance, antigravity and claude for free users', () => {
        expect(isPremiumPromptTool('advance')).toBe(true);
        expect(isPremiumPromptTool('antigravity')).toBe(true);
        expect(isPremiumPromptTool('claude')).toBe(true);
    });

    it('allows lovable and cursor for free users', () => {
        expect(isPremiumPromptTool('lovable')).toBe(false);
        expect(isPremiumPromptTool('cursor')).toBe(false);
    });
});

describe('anonymous prompt copy limit', () => {
    it('allows exactly five copies per UTC day', () => {
        expect(getAnonymousPromptCopiesRemaining()).toBe(FREE_DAILY_PROMPT_COPIES);
        for (let expected = FREE_DAILY_PROMPT_COPIES - 1; expected >= 0; expected -= 1) {
            expect(consumeAnonymousPromptCopy()).toBe(expected);
        }
        expect(getAnonymousPromptCopiesRemaining()).toBe(0);
        expect(consumeAnonymousPromptCopy()).toBe(0);
    });

    it('resets on a new UTC day', () => {
        consumeAnonymousPromptCopy();
        consumeAnonymousPromptCopy();
        expect(getAnonymousPromptCopiesRemaining()).toBe(3);

        const today = new Date();
        const yesterday = new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate() - 1,
        ));
        const key = `${yesterday.getUTCFullYear()}-${yesterday.getUTCMonth() + 1}-${yesterday.getUTCDate()}`;
        localStorage.setItem('ui-hub-free-prompt-copies', JSON.stringify({ day: key, used: 5 }));

        expect(getAnonymousPromptCopiesRemaining()).toBe(FREE_DAILY_PROMPT_COPIES);
    });
});

describe('prompt copy block messages', () => {
    it('names the Pro-only tools and the daily limit', () => {
        expect(promptCopyBlockMessage('TOOL_LOCKED')).toContain('PRO');
        expect(promptCopyBlockMessage('LIMIT_REACHED')).toContain('5 PROMPTS / DAY');
    });
});
