export const getApiBaseUrl = () => {
    // Check if an production API URL is explicitly provided (e.g. for Render)
    const configuredUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    
    // In production, prioritize the configured Render URL
    if (import.meta.env.PROD) {
        if (configuredUrl) {
            console.log(`[API Config] Using configured Production API: ${configuredUrl}`);
            return configuredUrl;
        }
        // Fallback to same-origin for unified deployment
        console.log(`[API Config] Production detected, using same-origin for API`);
        return ''; 
    }

    // Local development handling
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Handle local network IPs (e.g. 192.168.x.x) for mobile testing
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
