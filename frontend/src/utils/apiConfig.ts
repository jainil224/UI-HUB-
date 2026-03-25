export const getApiBaseUrl = () => {
    // If we're on a deployed Vercel/Production site, try to use relative paths
    // or the configured production API URL.
    const isProduction = import.meta.env.PROD;
    const configuredUrl = (import.meta as any).env?.VITE_API_BASE_URL;
    
    // Use configured URL if provided and not localhost
    if (configuredUrl && !configuredUrl.includes('localhost')) {
        return configuredUrl;
    }

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // If on production domain, and no URL configured, use same origin
        // This assumes backend is served at /api on the same domain
        if (isProduction && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
            // Check if we are on the network IP but still want the specific port
            const isLocalNetworkIP = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
            if (!isLocalNetworkIP) {
                console.log(`[API Config] Production detected, using same-origin for API (/api)`);
                return ''; // Relative path
            }
        }
        
        // On local network IPs or localhost, use hostname:5000
        const isLocalNetworkIP = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        
        if (isLocalNetworkIP || (isLocalhost && window.location.port !== '5000')) {
            const url = `${protocol}//${hostname}:5000`;
            console.log(`[API Config] Local/Network detected, using: ${url}`);
            return url;
        }
    }
    
    return 'http://localhost:5000';
};
