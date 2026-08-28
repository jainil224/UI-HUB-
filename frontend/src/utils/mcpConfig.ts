const DEV_FALLBACK = 'http://localhost:3001';
const PROD_FALLBACK = 'https://ui-hub-mcp.onrender.com';

/**
 * Base URL for the MCP backend.
 * Source of truth for VITE_MCP_API_URL. In production builds the fallback is the
 * deployed Render backend, so a missing env var never silently targets localhost.
 */
export const MCP_BASE_URL =
    import.meta.env.VITE_MCP_API_URL || (import.meta.env.DEV ? DEV_FALLBACK : PROD_FALLBACK);