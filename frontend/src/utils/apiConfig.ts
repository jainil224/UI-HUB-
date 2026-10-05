/**
 * API base URL resolution.
 *
 * Canonical production architecture:
 *   - UI-HUB production sites use the Mongo-connected Render REST API.
 *   - other deployments use same-origin by default.
 *   - an explicit, valid VITE_API_URL overrides either default.
 *   - development -> the local backend on port 5000.
 *
 * `VITE_API_URL` is OPTIONAL, not required. It is inlined at build time, so a
 * value baked into a deployment outlives the dashboard setting that created it.
 * Unsetting it is the supported way to return a deployment to same-origin.
 *
 * The resolution logic is a pure function so it can be unit tested without a
 * browser or a real Vite build; `getApiBaseUrl()` is a thin binding to the
 * ambient environment.
 */

/** Hosts verified unreachable in production during Phase 4/5. */
export const KNOWN_DEAD_API_HOSTS = [
  'ui-hub-backend-mcp.onrender.com',
] as const;

const PRODUCTION_API_URL = 'https://ui-hub.onrender.com';
const UI_HUB_PRODUCTION_HOSTS = new Set([
  'uihub.codes',
  'www.uihub.codes',
  'ui-hub-design.vercel.app',
  'ui-hub-design-git-main-jainil224s-projects.vercel.app',
  'ui-hub-design-jainil224s-projects.vercel.app',
]);

export interface ApiEnv {
  PROD?: boolean;
  VITE_API_URL?: string;
  VITE_API_BASE_URL?: string;
}

export interface ApiLocation {
  origin: string;
  hostname: string;
  protocol: string;
  port: string;
}

export type UrlValidation = { ok: true; url: string } | { ok: false; reason: string };

/**
 * Explicit type guard. `tsconfig.json` does not enable `strict`, so plain
 * discriminated-union narrowing on a boolean literal is unreliable here; a
 * user-defined guard works regardless of strictness.
 */
export function isUrlInvalid(value: UrlValidation): value is { ok: false; reason: string } {
  return value.ok === false;
}

/**
 * Validate and normalise a configured API base URL.
 *
 * Rejects anything that is not an absolute http(s) URL, and strips a trailing
 * slash so consumers can safely append `/api/v1/...` without doubling it.
 */
export function validateApiUrl(raw: string | undefined | null): UrlValidation {
  if (raw === undefined || raw === null) return { ok: false, reason: 'not set' };
  const trimmed = String(raw).trim();
  if (!trimmed) return { ok: false, reason: 'empty' };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, reason: 'not a valid absolute URL' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: `unsupported protocol "${parsed.protocol}"` };
  }
  if (!parsed.hostname) return { ok: false, reason: 'missing hostname' };

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
  return { ok: true, url: withoutTrailingSlash };
}

/** True when the host is one proven unreachable in production. */
export function isKnownDeadApiHost(url: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return (KNOWN_DEAD_API_HOSTS as readonly string[]).some((h) => host === h);
}

function warnDeadHost(url: string, host: string, fallback: string): void {
  console.warn(
    `[API Config] WARNING: the configured production API "${url}" points at ` +
      `"${host}", which is verified unreachable (the Render origin is refused ` +
      `at the Cloudflare edge). Falling back to "${fallback}".`
  );
}

function warnInvalid(raw: string, reason: string, fallback: string): void {
  console.warn(
    `[API Config] Ignoring the configured API URL (${reason}): ` +
      `"${raw}". Falling back to: ${fallback}`
  );
}

/**
 * Resolve the API base URL. Pure: no ambient reads, so it is directly testable.
 */
export function resolveApiBaseUrl(env: ApiEnv, loc?: ApiLocation): string {
  const configuredRaw = env.VITE_API_URL || env.VITE_API_BASE_URL;
  const originHost = loc?.hostname.toLowerCase();
  const isUiHubProductionSite = Boolean(
    originHost && UI_HUB_PRODUCTION_HOSTS.has(originHost)
  );
  const fallback = loc
    ? (isUiHubProductionSite ? PRODUCTION_API_URL : loc.origin)
    : '';

  if (env.PROD) {
    if (configuredRaw !== undefined && configuredRaw !== null && String(configuredRaw).trim() !== '') {
      const validated = validateApiUrl(configuredRaw);
      if (isUrlInvalid(validated)) {
        warnInvalid(String(configuredRaw), validated.reason, fallback || 'empty (no origin available)');
        return fallback;
      }
      if (isKnownDeadApiHost(validated.url)) {
        warnDeadHost(validated.url, new URL(validated.url).hostname, fallback || '(same-origin)');
        return fallback;
      } else {
        console.log(`[API Config] Using explicitly configured production API: ${validated.url}`);
      }
      return validated.url;
    }

    if (isUiHubProductionSite) {
      console.log(`[API Config] Production: using the Mongo-connected UI-HUB API at ${PRODUCTION_API_URL}.`);
      return PRODUCTION_API_URL;
    }
    if (loc) {
      console.log(`[API Config] Production: using same-origin API at ${loc.origin} (no VITE_API_URL set).`);
      return loc.origin;
    }
    return '';
  }

  // Local development.
  if (loc) {
    const { protocol, hostname, port, origin } = loc;
    const isLocalNetworkIP = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalNetworkIP || (isLocalhost && port !== '5000')) {
      const url = `${protocol}//${hostname}:5000`;
      console.log(`[API Config] Development: local backend at ${url}`);
      return url;
    }
  }
  return 'http://localhost:5000';
}

/** Bind the pure resolver to the ambient browser/build environment. */
export const getApiBaseUrl = (): string => {
  const loc: ApiLocation | undefined =
    typeof window !== 'undefined'
      ? {
          origin: window.location.origin,
          hostname: window.location.hostname,
          protocol: window.location.protocol,
          port: window.location.port,
        }
      : undefined;

  return resolveApiBaseUrl(
    {
      PROD: import.meta.env.PROD,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    },
    loc
  );
};
