export const getApiBaseUrl = () => {
    const configuredUrl = import.meta.env.VITE_API_BASE_URL;
    
    // If it's explicitly set to a production URL (not localhost), use it
    if (configuredUrl && !configuredUrl.includes('localhost')) {
        return configuredUrl;
    }

    // In local development, infer the IP from the current window location.
    // This allows mobile devices to connect to backend on the same Wi-Fi network IP.
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return `${window.location.protocol}//${hostname}:5000`;
        }
    }
    
    return 'http://localhost:5000';
};
