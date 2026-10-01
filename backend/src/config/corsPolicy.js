/**
 * CORS policy for the web API (backend/src/server.js).
 *
 * Why this file exists
 * --------------------
 * The policy used to be inline in server.js, where it was:
 *
 *     if (isAllowed) return callback(null, true);
 *     console.warn(`[CORS] Blocked origin: ${origin}`);
 *     return callback(null, true);            // <-- allowed anyway
 *
 * plus two bypasses that made the allowlist decorative:
 *
 *     origin.endsWith('.vercel.app')   // any Vercel deployment on the internet
 *     origin.includes('localhost')     // substring, so https://evil.com/?localhost
 *
 * The result was that EVERY origin was accepted. Both Render blueprints declare
 * MCP_ALLOWED_ORIGINS / an allowlist as though it were a control; it was not.
 *
 * Invariant (agent.md 6.2)
 * -----------------------
 *   Allowed origin      -> permitted
 *   Disallowed origin   -> rejected
 *   Missing Origin      -> permitted (CLI, curl, server-to-server)
 *   Malformed origin    -> rejected (a malformed string cannot exact-match)
 *   Dev localhost       -> permitted, explicit entries only
 *
 * Credentials are enabled because the API is designed for credentialed use, so
 * `Access-Control-Allow-Origin: *` is never correct here and is never used.
 */

/**
 * Origins permitted with no configuration at all.
 *
 * These are the origins the application is actually deployed behind. They are
 * NOT secrets and are NOT a convenience list to grow silently: adding an origin
 * here is a production change and must be justified.
 */
export const DEFAULT_ALLOWED_ORIGINS = Object.freeze([
  // Local development servers
  'http://localhost:5173',
  'http://localhost:3000',
  // Production
  'https://ui-hub-design.vercel.app',
  // Known Vercel preview deployments
  'https://ui-hub-design-git-main-jainil224s-projects.vercel.app',
  'https://ui-hub-design-jainil224s-projects.vercel.app',
]);

/**
 * Splits a comma-separated origin list into trimmed, de-duplicated entries.
 *
 * Blank entries are dropped, and entries wrapped in angle brackets are treated
 * as documentation placeholders (`<your-origin>`) rather than real origins, so
 * a copied .env.example cannot silently disable enforcement.
 *
 * @param {string|undefined} value
 * @returns {string[]}
 */
export function parseOriginList(value) {
  return Array.from(
    new Set(
      String(value ?? '')
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
        .filter((entry) => !/^<.*>$/.test(entry)),
    ),
  );
}

/**
 * Resolves the effective allowlist: the built-in defaults UNION any additional
 * origins from the environment.
 *
 * Union rather than replace, deliberately. A replacement list lets an operator
 * set one variable in staging and silently remove the production origin from
 * production, which fails as a confusing runtime breakage rather than a config
 * error. Union means the only way to widen the policy is to be explicit about
 * adding to it, and the only way to narrow it is a code change.
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string[]}
 */
export function resolveAllowedOrigins(env = process.env) {
  return Array.from(
    new Set([...DEFAULT_ALLOWED_ORIGINS, ...parseOriginList(env.ALLOWED_ORIGINS)]),
  );
}

/**
 * The entire origin decision, as a pure function so it is testable without
 * booting Express.
 *
 * Exact string comparison only. No suffix matching, no substring matching, no
 * wildcards. An origin that is not literally in the allowlist is rejected.
 *
 * @param {string|undefined} origin  the raw `Origin` header
 * @param {string[]} allowedOrigins
 * @returns {boolean}
 */
export function isOriginAllowed(origin, allowedOrigins) {
  if (typeof origin !== 'string' || origin.length === 0) return true; // no Origin header
  return allowedOrigins.includes(origin);
}

/**
 * Builds the `origin` callback handed to the `cors` middleware.
 *
 * @param {object} [options]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {string[]} [options.allowedOrigins] overrides the resolved list
 * @param {{ warn: Function }} [options.logger]
 * @returns {(origin: string|undefined, callback: Function) => void}
 */
export function createOriginPolicy({ env, allowedOrigins, logger = console } = {}) {
  const effective = allowedOrigins ?? resolveAllowedOrigins(env);

  return function originPolicy(origin, callback) {
    // No Origin header: a CLI, curl, or server-to-server caller. These carry no
    // ambient browser credentials, so CORS is not the control that protects
    // them - authentication is. Permitted deliberately.
    if (!origin) return callback(null, true);

    if (effective.includes(origin)) return callback(null, true);

    logger.warn?.(`[CORS] Blocked origin: ${origin}`);
    // Reject. Previously this returned `true`, which is why the allowlist was
    // never enforced. This is the behavioural fix.
    return callback(null, false);
  };
}

/**
 * Full cors middleware options.
 *
 * @param {object} [options] see {@link createOriginPolicy}
 * @returns {import('cors').CorsOptions}
 */
export function buildCorsOptions({ env, allowedOrigins, logger = console } = {}) {
  return {
    origin: createOriginPolicy({ env, allowedOrigins, logger }),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cache-Control',
      'Pragma',
      'X-Requested-With',
      'Accept',
      'MCP-Protocol-Version',
      'MCP-Session-Id',
    ],
  };
}