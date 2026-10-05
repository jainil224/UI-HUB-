import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  resolveApiBaseUrl,
  validateApiUrl,
  isKnownDeadApiHost,
  KNOWN_DEAD_API_HOSTS,
  type ApiLocation,
} from './apiConfig';

const prodOrigin: ApiLocation = {
  origin: 'https://www.uihub.codes',
  hostname: 'ui-hub-design.vercel.app',
  protocol: 'https:',
  port: '',
};

const localhostOrigin: ApiLocation = {
  origin: 'http://localhost:3000',
  hostname: 'localhost',
  protocol: 'http:',
  port: '3000',
};

let warn: ReturnType<typeof vi.spyOn>;
let log: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  log = vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

const warned = () => warn.mock.calls.map((c) => String(c[0])).join('\n');
const warnCount = () => warn.mock.calls.length;

describe('production defaults', () => {
  it('routes known UI-HUB production domains to the Mongo-connected API', () => {
    expect(resolveApiBaseUrl({ PROD: true }, prodOrigin)).toBe('https://ui-hub.onrender.com');
    expect(warnCount()).toBe(0);
  });

  it('uses same-origin for unrelated production deployments', () => {
    expect(resolveApiBaseUrl({ PROD: true }, {
      ...prodOrigin,
      origin: 'https://other.example',
      hostname: 'other.example',
    })).toBe('https://other.example');
  });
});

describe('Task 5.16 CASE 2 - production, approved external host', () => {
  it('honours an explicitly configured external API', () => {
    expect(
      resolveApiBaseUrl({ PROD: true, VITE_API_URL: 'https://api.example.com' }, prodOrigin)
    ).toBe('https://api.example.com');
    expect(warnCount()).toBe(0);
  });

  it('supports VITE_API_BASE_URL as the secondary variable', () => {
    expect(
      resolveApiBaseUrl({ PROD: true, VITE_API_BASE_URL: 'https://api.example.com' }, prodOrigin)
    ).toBe('https://api.example.com');
  });

  it('prefers VITE_API_URL when both are set', () => {
    expect(
      resolveApiBaseUrl(
        { PROD: true, VITE_API_URL: 'https://primary.example.com', VITE_API_BASE_URL: 'https://secondary.example.com' },
        prodOrigin
      )
    ).toBe('https://primary.example.com');
  });

  it('strips a trailing slash so consumers cannot double it', () => {
    expect(
      resolveApiBaseUrl({ PROD: true, VITE_API_URL: 'https://api.example.com/' }, prodOrigin)
    ).toBe('https://api.example.com');
  });
});

describe('Task 5.16 CASE 3 - local development', () => {
  it('uses localhost:5000 when the app runs on another localhost port', () => {
    expect(resolveApiBaseUrl({ PROD: false }, localhostOrigin)).toBe('http://localhost:5000');
  });

  it('uses the local network IP with port 5000', () => {
    const lan: ApiLocation = {
      origin: 'http://192.168.1.50:3000',
      hostname: '192.168.1.50',
      protocol: 'http:',
      port: '3000',
    };
    expect(resolveApiBaseUrl({ PROD: false }, lan)).toBe('http://192.168.1.50:5000');
  });

  it('defaults to localhost:5000 with no location at all', () => {
    expect(resolveApiBaseUrl({ PROD: false })).toBe('http://localhost:5000');
  });
});

describe('Task 5.16 CASE 4 - production with a stale legacy Render URL', () => {
  it.each(KNOWN_DEAD_API_HOSTS.map((h) => [`https://${h}`, h] as const))(
    'warns and falls back to the Mongo-connected API for %s',
    (url, host) => {
      const resolved = resolveApiBaseUrl({ PROD: true, VITE_API_URL: url }, prodOrigin);

      expect(resolved).toBe('https://ui-hub.onrender.com');

      const message = warned();
      expect(message).toContain('WARNING');
      expect(message).toContain(host);
      expect(message).toContain('https://ui-hub.onrender.com');
    }
  );

  it('uses same-origin routing when no browser location is available', () => {
    const resolved = resolveApiBaseUrl(
      { PROD: true, VITE_API_URL: `https://${KNOWN_DEAD_API_HOSTS[0]}` }
    );
    expect(resolved).toBe('');
  });

  it('keeps the currently live Render API as the configured production base', () => {
    expect(
      resolveApiBaseUrl(
        { PROD: true, VITE_API_URL: 'https://ui-hub.onrender.com' },
        prodOrigin
      )
    ).toBe('https://ui-hub.onrender.com');
    expect(warnCount()).toBe(0);
  });

  it('does not warn for a host that is merely similar but live', () => {
    resolveApiBaseUrl({ PROD: true, VITE_API_URL: 'https://ui-hub.onrender.commander.example' }, prodOrigin);
    expect(warnCount()).toBe(0);
  });
});

describe('Task 5.16 CASE 5 - malformed or unsafe configured URL', () => {
  it('falls back to the healthy API for a non-URL string on the production site', () => {
    expect(
      resolveApiBaseUrl({ PROD: true, VITE_API_URL: 'not-a-url' }, prodOrigin)
    ).toBe('https://ui-hub.onrender.com');
    expect(warned()).toMatch(/not a valid absolute URL/);
  });

  it('falls back to the healthy API for a relative path on the production site', () => {
    expect(
      resolveApiBaseUrl({ PROD: true, VITE_API_URL: '/api' }, prodOrigin)
    ).toBe('https://ui-hub.onrender.com');
  });

  it('rejects a non-http protocol rather than emitting an unusable base', () => {
    expect(
      resolveApiBaseUrl({ PROD: true, VITE_API_URL: 'ftp://api.example.com' }, prodOrigin)
    ).toBe('https://ui-hub.onrender.com');
    expect(warned()).toMatch(/unsupported protocol/);
  });

  it('treats an empty or whitespace value as unset', () => {
    expect(resolveApiBaseUrl({ PROD: true, VITE_API_URL: '   ' }, prodOrigin)).toBe(
      'https://ui-hub.onrender.com'
    );
    expect(warnCount()).toBe(0);
  });
});

describe('validateApiUrl', () => {
  it('accepts absolute http and https URLs', () => {
    expect(validateApiUrl('https://api.example.com')).toEqual({ ok: true, url: 'https://api.example.com' });
    expect(validateApiUrl('http://localhost:5000')).toEqual({ ok: true, url: 'http://localhost:5000' });
  });

  it('rejects missing, empty and malformed input', () => {
    expect(validateApiUrl(undefined)).toEqual({ ok: false, reason: 'not set' });
    expect(validateApiUrl('')).toEqual({ ok: false, reason: 'empty' });
    expect(validateApiUrl('   ')).toEqual({ ok: false, reason: 'empty' });
    expect(validateApiUrl('http://')).toMatchObject({ ok: false });
  });

  it('preserves a port and strips only trailing slashes', () => {
    expect(validateApiUrl('https://api.example.com:8443//')).toEqual({
      ok: true,
      url: 'https://api.example.com:8443',
    });
  });
});

describe('isKnownDeadApiHost', () => {
  it('matches only the verified-dead hosts', () => {
    expect(isKnownDeadApiHost('https://ui-hub-backend-mcp.onrender.com')).toBe(true);
    expect(isKnownDeadApiHost('https://ui-hub-backend-mcp.onrender.com/some/path')).toBe(true);
    expect(isKnownDeadApiHost('https://ui-hub.onrender.com')).toBe(false);
    expect(isKnownDeadApiHost('https://api.example.com')).toBe(false);
    expect(isKnownDeadApiHost('not-a-url')).toBe(false);
  });
});
