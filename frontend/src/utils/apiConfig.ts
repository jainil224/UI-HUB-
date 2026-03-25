export const getApiBaseUrl = () => {
    const configuredUrl = (import.meta as any).env?.VITE_API_BASE_URL;
    
    // If it's explicitly set to a production URL (not localhost), use it
    if (configuredUrl && !configuredUrl.includes('localhost')) {
        return configuredUrl;
    }

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // On production deployments (Vercel, custom domains), don't try port 5000
        // Only use the hostname:5000 trick for actual local network IPs or localhost
        const isLocalNetworkIP = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        
        if (isLocalNetworkIP || (isLocalhost && window.location.port !== '5000')) {
            const url = `${protocol}//${hostname}:5000`;
            console.log(`[API Config] Resolving API base URL to: ${url}`);
            return url;
        }
    }
    
    return 'http://localhost:5000';
};
