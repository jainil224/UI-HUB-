import { useEffect } from 'react';

const MCP_BASE = import.meta.env.VITE_MCP_API_URL || 'https://api.ui-hub-design.com';
const KEEP_ALIVE_INTERVAL = 2 * 60 * 1000;

export function useMcpKeepAlive() {
    useEffect(() => {
        let stopped = false;

        const ping = async () => {
            if (stopped) return;
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
            if (typeof navigator !== 'undefined' && !navigator.onLine) return;
            try {
                await fetch(`${MCP_BASE}/health`, { method: 'GET', cache: 'no-store' });
            } catch {
                // Keep-alive failures are expected while the server is cold — ignore silently.
            }
        };

        const id = window.setInterval(() => void ping(), KEEP_ALIVE_INTERVAL);

        return () => {
            stopped = true;
            window.clearInterval(id);
        };
    }, []);
}