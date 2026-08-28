import { useEffect } from 'react';
import { MCP_BASE_URL } from '../utils/mcpConfig';

const KEEP_ALIVE_INTERVAL = 2 * 60 * 1000;

/**
 * Fire-and-forget warm-up ping to the MCP backend's /health endpoint.
 * Best-effort: failures (e.g. server cold-starting) are ignored silently.
 */
export function warmUpMcp(): void {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    fetch(`${MCP_BASE_URL}/health`, { method: 'GET', cache: 'no-store' }).catch(() => {
        // Ignore — warm-up pings are best-effort.
    });
}

export function useMcpKeepAlive() {
    useEffect(() => {
        let stopped = false;

        const ping = () => {
            if (stopped) return;
            warmUpMcp();
        };

        // Ping immediately on mount so a cold backend starts booting right away,
        // not only after the first interval tick.
        warmUpMcp();
        const id = window.setInterval(ping, KEEP_ALIVE_INTERVAL);

        return () => {
            stopped = true;
            window.clearInterval(id);
        };
    }, []);
}