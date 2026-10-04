/**
 * CORS policy for the MCP server (mcp-server/src/index.ts).
 *
 * This is a SEPARATE policy from the web API's (backend/src/config/corsPolicy.js).
 * They are deliberately not shared and must not be assumed identical:
 *
 *   - The web API serves browser traffic from the UI and authenticates with a
 *     Firebase ID token in an Authorization header.
 *   - MCP serves the MCP dashboard in the browser AND non-browser clients (the
 *     `ui-hub` CLI, `curl`, server-to-server) that authenticate with a
 *     `Bearer uh_live_...` API key.
 *
 * The two have different legitimate caller sets, so they have different
 * allowlists. What they share is the bug that was fixed here.
 *
 * Why this file exists
 * --------------------
 * index.ts contained the same defect as the backend:
 *
 *     const allowed = config.allowedOrigins.some((o) => origin === o || origin.includes('localhost'));
 *     if (allowed) return callback(null, true);
 *     callback(null, true);                       // <-- allowed anyway
 *
 * `origin.includes('localhost')` was a substring test, so an attacker-chosen
 * origin containing "localhost" anywhere matched.
 *
 * A subtlety worth stating: `config.allowedOrigins` is parsed from
 * MCP_ALLOWED_ORIGINS and is an EMPTY ARRAY when that variable is unset. So
 * before this fix the "allowed" branch was unreachable in any deployment that
 * had not set the variable, and the code only appeared to work because the
 * rejection branch allowed everything. Fixing the callback without supplying
 * defaults would have started rejecting every browser origin, including the
 * production MCP dashboard. Hence DEFAULT_ALLOWED_ORIGINS below.
 */

import type { CorsOptions } from 'cors';

/**
 * Origins permitted when MCP_ALLOWED_ORIGINS is unset or empty.
 *
 * The MCP dashboard is served by the frontend, so the production frontend
 * origin must be present for the dashboard to work at all.
 */
export const DEFAULT_ALLOWED_ORIGINS: readonly string[] = Object.freeze([
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  // New primary domain
  'https://www.uihub.codes',
  'https://uihub.codes',
  // Legacy Vercel domain kept for backward-compatibility during DNS transition
  'https://ui-hub-design.vercel.app',
  'https://ui-hub-design-git-main-jainil224s-projects.vercel.app',
  'https://ui-hub-design-jainil224s-projects.vercel.app',
]);

/**
 * Trims, de-duplicates and drops documentation placeholders from a list.
 */
export function parseOriginList(value: string | undefined | null): string[] {
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
 * Built-in defaults UNION the configured origins.
 *
 * Union, not replace, so that setting MCP_ALLOWED_ORIGINS in one environment
 * can never silently strip the production dashboard origin from another.
 */
export function resolveAllowedOrigins(configured: readonly string[] = []): string[] {
  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...parseOriginList(configured.join(','))]));
}

/**
 * Exact-match origin decision.
 *
 * A missing Origin header is permitted: MCP clients and the CLI are not
 * browsers and send no Origin, and they carry an explicit API key rather than
 * ambient credentials.
 */
export function isOriginAllowed(
  origin: string | undefined,
  allowedOrigins: readonly string[],
): boolean {
  if (typeof origin !== 'string' || origin.length === 0) return true;
  return allowedOrigins.includes(origin);
}

export interface OriginPolicyOptions {
  allowedOrigins?: readonly string[];
  logger?: { warn?: (message: string) => void };
}

/**
 * Builds the `origin` callback for the cors middleware.
 */
export function createOriginPolicy({
  allowedOrigins,
  logger = console,
}: OriginPolicyOptions = {}) {
  const effective = resolveAllowedOrigins(allowedOrigins);

  return function originPolicy(
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ): void {
    if (!origin) return callback(null, true);
    if (effective.includes(origin)) return callback(null, true);

    logger.warn?.(`[CORS] Blocked origin: ${origin}`);
    // The behavioural fix. This used to pass `true`.
    return callback(null, false);
  };
}

export interface BuildCorsOptions extends OriginPolicyOptions {}

/**
 * Full cors middleware options for the MCP server.
 */
export function buildCorsOptions(options: BuildCorsOptions = {}): CorsOptions {
  return {
    origin: createOriginPolicy(options),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'MCP-Protocol-Version',
      'MCP-Session-Id',
      'Mcp-Session-Id',
    ],
    exposedHeaders: ['Mcp-Session-Id', 'MCP-Session-Id'],
  };
}