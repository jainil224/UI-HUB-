import { getDb } from './mongoService.js';

export const HEALTHY = 'healthy';
export const DEGRADED = 'degraded';
export const UNHEALTHY = 'unhealthy';

export const MONGO_PROBE_TIMEOUT_MS = 3000;

/**
 * Must stay byte-identical. Asserted by the EADDRINUSE reuse probe in
 * `server.js` and by the Render deploy gate in `render.yaml`.
 */
export const HEALTH_MESSAGE = 'UI-Hub Unified Backend & MCP Server is Live';

/**
 * Performs a real, bounded round-trip against MongoDB.
 *
 * This deliberately does NOT use `isMongoConnected()`. That helper only checks
 * that a MongoClient object exists with a non-closed topology, and
 * `getClient()` assigns `client` synchronously *before* `client.connect()`
 * resolves — so it reports "connected" while a handshake is still pending and
 * would report true for a database that then fails. A health check has to
 * answer "can I actually talk to the database right now", so it sends a ping.
 *
 * Never throws. `withTimeout` bounds the wait, so a cold start or an
 * unreachable cluster cannot hang the endpoint.
 *
 * @returns {Promise<boolean>}
 */
export const probeMongo = async () => {
    try {
        const db = await getDb();
        await db.command({ ping: 1 });
        return true;
    } catch {
        return false;
    }
};

/**
 * Bounds any probe so a cold, hung, or unreachable dependency cannot block the
 * health endpoint. Applied here rather than inside the probes so that every
 * probe — including injected ones — is time-bounded.
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @returns {Promise<T|null>}
 */
export const withTimeout = (promise, ms) =>
    Promise.race([
        promise,
        new Promise((resolve) => setTimeout(() => resolve(null), ms)),
    ]);

/**
 * Only a required dependency being down is fatal. `degraded` means an optional
 * subsystem is impaired while the core service still works, so it stays 200.
 * @param {string} status
 * @returns {number}
 */
export const httpStatusFor = (status) => (status === UNHEALTHY ? 503 : 200);

/**
 * Builds the /health response.
 *
 * MongoDB is a required dependency: without it the backend cannot serve data,
 * so an unreachable database is `unhealthy` (503). MCP is optional — the
 * backend boots and serves the REST API even when the MCP routers fail to
 * mount, so that case is `degraded` (200). Redis is optional because
 * `rateLimiters.js` falls back to an in-memory store, so it is reported but
 * never degrades health.
 *
 * @param {object} deps
 * @param {boolean} deps.mcpMounted
 * @param {{configured?: boolean, connected?: boolean}} [deps.redis]
 * @param {() => Promise<boolean>} [deps.probeDatabase]
 * @returns {Promise<{status: string, httpStatus: number, body: object}>}
 */
export const buildHealthReport = async ({ mcpMounted, redis, probeDatabase = probeMongo }) => {
    // A probe that rejects must degrade the report, never propagate into the
    // Express error handler and turn a health check into a 500.
    let databaseUp = false;
    try {
        databaseUp =
            (await withTimeout(Promise.resolve().then(probeDatabase), MONGO_PROBE_TIMEOUT_MS)) === true;
    } catch {
        databaseUp = false;
    }

    let status = HEALTHY;
    if (!databaseUp) {
        status = UNHEALTHY;
    } else if (!mcpMounted) {
        status = DEGRADED;
    }

    return {
        status,
        httpStatus: httpStatusFor(status),
        body: {
            status,
            services: {
                backend: databaseUp ? 'online' : 'offline',
                mcp: mcpMounted ? 'online' : 'offline',
            },
            dependencies: {
                mongodb: databaseUp ? 'connected' : 'disconnected',
                redis: {
                    configured: Boolean(redis?.configured),
                    connected: Boolean(redis?.connected),
                    required: false,
                },
                mcp: mcpMounted ? 'mounted' : 'not_mounted',
            },
            message: HEALTH_MESSAGE,
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV || 'development',
        },
    };
};
