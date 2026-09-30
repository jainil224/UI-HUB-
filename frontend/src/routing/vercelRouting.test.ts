import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const vercel = JSON.parse(readFileSync(resolve(repoRoot, 'vercel.json'), 'utf8'));

const rewrites: { source: string; destination: string }[] = vercel.rewrites;

/**
 * Mirrors the Vercel rewrite algorithm closely enough for the routing contract:
 * rewrites are evaluated in declaration order and the first match wins.
 */
function firstMatch(pathname: string): string {
  for (const { source, destination } of rewrites) {
    const pattern = new RegExp(
      '^' +
        source
          .split('/')
          .map((seg) => {
            if (seg === '(.*)') return '(.*)';
            if (seg === '') return '';
            return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          })
          .join('/') +
        '$'
    );
    if (pattern.test(pathname)) return destination.replace('(.*)', '');
  }
  return '(static file or 404)';
}

describe('Task 5.15 - Vercel rewrite ordering', () => {
  it('routes every /api path to the serverless function, never the SPA', () => {
    expect(firstMatch('/api/health')).toBe('/api/index.js');
    expect(firstMatch('/api/v1/components')).toBe('/api/index.js');
    expect(firstMatch('/api/v1/components/db')).toBe('/api/index.js');
    expect(firstMatch('/api/admin/mcp/health')).toBe('/api/index.js');
  });

  it('routes /health to the function so it cannot return the HTML shell', () => {
    expect(firstMatch('/health')).toBe('/api/index.js');
  });

  it('places the /health rule AFTER the /api catch-all and BEFORE the SPA fallback', () => {
    const apiIdx = rewrites.findIndex((r) => r.source === '/api/(.*)');
    const healthIdx = rewrites.findIndex((r) => r.source === '/health');
    const spaIdx = rewrites.findIndex((r) => r.source === '/(.*)');

    expect(apiIdx).toBeGreaterThanOrEqual(0);
    expect(healthIdx).toBeGreaterThan(apiIdx);
    expect(spaIdx).toBeGreaterThan(healthIdx);
  });

  it('still serves the SPA for real frontend routes', () => {
    for (const route of ['/', '/library', '/favorites', '/login', '/admin/mcp/health', '/demo/3d-scroll-animation']) {
      expect(firstMatch(route)).toBe('/index.html');
    }
  });
});

describe('Task 5.6/5.7 - function and SPA fallback contract', () => {
  it('points the build at the frontend output directory', () => {
    expect(vercel.outputDirectory).toBe('frontend/dist');
  });

  it('ships the backend and built MCP data into the function', () => {
    const include = vercel.functions['api/index.js'].includeFiles;
    expect(include).toContain('backend/**');
    expect(include).toContain('mcp-server/dist/**');
    expect(include).toContain('mcp-server/package.json');
  });

  it('declares no env block, so VITE_API_URL can only come from the dashboard', () => {
    // This is the root cause of the live production bundle targeting Render:
    // the repository never sets it, so any value in a live bundle is a
    // dashboard value baked in at build time.
    expect(vercel.env).toBeUndefined();
  });
});
