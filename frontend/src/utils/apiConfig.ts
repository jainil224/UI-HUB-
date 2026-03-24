export const getApiBaseUrl = () => {
    const configuredUrl = import.meta.env.VITE_API_BASE_URL;
    
    // If it's explicitly set to a production URL (not localhost), use it
    if (configuredUrl && !configuredUrl.includes('localhost')) {
        return configuredUrl;
    }

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        // On production deployments (Vercel, custom domains), don't try port 5000
        // Only use the hostname:5000 trick for actual local network IPs
        const isLocalNetworkIP = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
        
        if (isLocalNetworkIP) {
            return `${window.location.protocol}//${hostname}:5000`;
        }
    }
    
    return 'http://localhost:5000';
};
