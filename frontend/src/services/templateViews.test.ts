import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    formatViewCount,
    getComponentViewAccessibleLabel,
    getComponentViewDisplay,
    getComponentViewCount,
    getTemplateViewAccessibleLabel,
    getTemplateViewCount,
    getTemplateViewDisplay,
    getViewSessionId,
    recordComponentView,
    loadTemplateViewCounts,
    recordTemplateView,
    resetTemplateViewState,
} from './templateViews';

const storageValues = new Map<string, string>();

describe('template view API client', () => {
    beforeEach(() => {
        resetTemplateViewState();
        storageValues.clear();
        vi.stubGlobal('window', {
            sessionStorage: {
                getItem: (key: string) => storageValues.get(key) ?? null,
                setItem: (key: string, value: string) => storageValues.set(key, value),
            },
        });
        vi.stubGlobal('fetch', vi.fn());
    });

    it('creates a session ID once and reuses it', () => {
        const firstId = getViewSessionId();
        const secondId = getViewSessionId();

        expect(firstId).toMatch(/^[0-9a-f-]{36}$/i);
        expect(secondId).toBe(firstId);
        expect(storageValues.get('uihub_view_session_id')).toBe(firstId);
    });

    it('formats real counts using compact notation', () => {
        expect(formatViewCount(0)).toBe('0');
        expect(formatViewCount(12)).toBe('12');
        expect(formatViewCount(999)).toBe('999');
        expect(formatViewCount(1000)).toBe('1k');
        expect(formatViewCount(1200)).toBe('1.2k');
        expect(formatViewCount(3912)).toBe('3.9k');
        expect(formatViewCount(4829)).toBe('4.8k');
        expect(formatViewCount(10000)).toBe('10k');
        expect(formatViewCount(125000)).toBe('125k');
        expect(formatViewCount(1000000)).toBe('1M');
    });

    it('loads counts in one batch and exposes them to the UI', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ counts: { 'mood-hero': 3912, 'portfolio-closing': 0 } }),
        } as Response);

        expect(getTemplateViewDisplay('portfolio-closing')).toBe('—');
        expect(getTemplateViewAccessibleLabel('portfolio-closing')).toBe('View count unavailable');

        await loadTemplateViewCounts(['mood-hero', 'portfolio-closing']);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(getTemplateViewCount('mood-hero')).toBe(3912);
        expect(getTemplateViewCount('portfolio-closing')).toBe(0);
        expect(getTemplateViewDisplay('portfolio-closing')).toBe('0');
        expect(getTemplateViewAccessibleLabel('portfolio-closing')).toBe('0 views');
    });

    it('does not present a failed count request as a real zero', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('network unavailable'));

        await loadTemplateViewCounts(['mood-hero']);

        expect(getTemplateViewDisplay('mood-hero')).toBe('—');
        expect(getTemplateViewAccessibleLabel('mood-hero')).toBe('View count unavailable');
        expect(getComponentViewDisplay('target-cursor')).toBe('—');
        expect(getComponentViewAccessibleLabel('target-cursor')).toBe('View count unavailable');
    });

    it('records a view with a session ID and updates from the backend response', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                templateId: 'mood-hero',
                viewRecorded: true,
                views: 3913,
            }),
        } as Response);

        const result = await recordTemplateView('mood-hero');
        const [, request] = vi.mocked(fetch).mock.calls[0];
        const body = JSON.parse(String(request?.body));

        expect(result.viewRecorded).toBe(true);
        expect(body.templateId).toBe('mood-hero');
        expect(body.sessionId).toBe(getViewSessionId());
        expect(request?.headers).not.toHaveProperty('Authorization');
        expect(getTemplateViewCount('mood-hero')).toBe(3913);
    });

    it('records component views in the component namespace', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                componentId: 'target-cursor',
                viewRecorded: true,
                views: 7,
            }),
        } as Response);

        const result = await recordComponentView('target-cursor');
        const [, request] = vi.mocked(fetch).mock.calls[0];
        const body = JSON.parse(String(request?.body));

        expect(result.componentId).toBe('target-cursor');
        expect(body).toMatchObject({ type: 'component', componentId: 'target-cursor' });
        expect(request?.headers).not.toHaveProperty('Authorization');
        expect(getComponentViewCount('target-cursor')).toBe(7);
        expect(getComponentViewAccessibleLabel('target-cursor')).toBe('7 views');
        expect(getTemplateViewCount('target-cursor')).toBe(0);
    });

    it('surfaces tracking failures to callers without changing counts', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 503 } as Response);
        const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        await expect(recordTemplateView('mood-hero')).rejects.toThrow('Template view request failed (503)');
        expect(getTemplateViewCount('mood-hero')).toBe(0);
        errorLog.mockRestore();
    });
});
