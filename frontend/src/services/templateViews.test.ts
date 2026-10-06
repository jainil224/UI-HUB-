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
    getViewerId,
    setViewAuthTokenProvider,
    recordComponentView,
    loadTemplateViewCounts,
    recordTemplateView,
    resetTemplateViewState,
} from './templateViews';

const storageValues = new Map<string, string>();

const createStorage = () => ({
    getItem: (key: string) => storageValues.get(key) ?? null,
    setItem: (key: string, value: string) => storageValues.set(key, value),
});

describe('template view API client', () => {
    beforeEach(() => {
        resetTemplateViewState();
        setViewAuthTokenProvider(null);
        storageValues.clear();
        vi.stubGlobal('window', {
            sessionStorage: createStorage(),
            localStorage: createStorage(),
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

    it('keeps one viewer ID that outlives the browser session', () => {
        const viewerId = getViewerId();

        expect(getViewerId()).toBe(viewerId);
        expect(storageValues.get('uihub_view_viewer_id')).toBe(viewerId);

        // Only the in-memory cache is cleared, the way a reload behaves: the
        // persisted ID is what makes a later visit the same visitor.
        resetTemplateViewState();
        expect(getViewerId()).toBe(viewerId);
    });

    it('adopts the session ID already in use so existing visitors are not counted twice', () => {
        storageValues.set('uihub_view_session_id', 'b5730d08-99df-4eb1-9d0f-b52509eb9a5b');

        expect(getViewerId()).toBe('b5730d08-99df-4eb1-9d0f-b52509eb9a5b');
        expect(storageValues.get('uihub_view_viewer_id')).toBe('b5730d08-99df-4eb1-9d0f-b52509eb9a5b');
    });

    it('ignores a malformed stored viewer ID', () => {
        storageValues.set('uihub_view_viewer_id', 'tampered');

        expect(getViewerId()).toMatch(/^[0-9a-f-]{36}$/i);
        expect(storageValues.get('uihub_view_viewer_id')).not.toBe('tampered');
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

    it('records a view with a viewer ID and updates from the backend response', async () => {
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
        expect(body.viewerId).toBe(getViewerId());
        expect(request?.headers).not.toHaveProperty('Authorization');
        expect(getTemplateViewCount('mood-hero')).toBe(3913);
    });

    it('sends the ID token when signed in so the view is attributed to the account', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ templateId: 'mood-hero', viewRecorded: false, views: 3913 }),
        } as Response);
        setViewAuthTokenProvider(async () => 'firebase-id-token');

        await recordTemplateView('mood-hero');

        const [, request] = vi.mocked(fetch).mock.calls[0];
        expect(request?.headers).toMatchObject({ Authorization: 'Bearer firebase-id-token' });
    });

    it('still records the view when the token cannot be read', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ templateId: 'mood-hero', viewRecorded: true, views: 3914 }),
        } as Response);
        setViewAuthTokenProvider(async () => {
            throw new Error('token refresh failed');
        });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        await recordTemplateView('mood-hero');

        const [, request] = vi.mocked(fetch).mock.calls[0];
        expect(request?.headers).not.toHaveProperty('Authorization');
        expect(JSON.parse(String(request?.body)).viewerId).toBe(getViewerId());
        expect(getTemplateViewCount('mood-hero')).toBe(3914);
        warn.mockRestore();
    });

    it('coalesces repeat calls for the same viewer and item', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ templateId: 'mood-hero', viewRecorded: true, views: 1 }),
        } as Response);

        await Promise.all([recordTemplateView('mood-hero'), recordTemplateView('mood-hero')]);

        expect(fetch).toHaveBeenCalledTimes(1);
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
        expect(body.viewerId).toBe(getViewerId());
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
