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

    it('places the /health rule AFTER the /api catch-all', () => {
        const apiIdx = rewrites.findIndex((r) => r.source === '/api/(.*)');
        const healthIdx = rewrites.findIndex((r) => r.source === '/health');

        expect(apiIdx).toBeGreaterThanOrEqual(0);
        expect(healthIdx).toBeGreaterThan(apiIdx);
    });

    it('still serves the SPA for real frontend routes', () => {
        for (const route of ['/library', '/favorites', '/login', '/admin/mcp/health', '/demo/3d-scroll-animation']) {
            expect(firstMatch(route)).toBe('/index.html');
        }
    });
});

describe('SEO routing contract', () => {
    it('has no blanket SPA catch-all, so unknown URLs can return a real 404', () => {
        // Vercel checks the filesystem before rewrites. Prerendered SEO routes are
        // real static files, so they are served without any rewrite. Removing the
        // catch-all lets genuinely unknown paths fall through to dist/404.html
        // with a 404 status instead of a 200 soft-404.
        expect(rewrites.some((r) => r.source === '/(.*)')).toBe(false);
        expect(firstMatch('/this-page-does-not-exist')).toBe('(static file or 404)');
        expect(firstMatch('/components/nope/nope')).toBe('(static file or 404)');
    });

    it('does not rewrite prerendered SEO paths, letting the static file win', () => {
        for (const route of [
            '/',
            '/templates',
            '/templates/mood-hero',
            '/build-with-ui-hub',
            '/components/3d',
            '/components/3d/3d-hero',
            '/pricing',
            '/privacy',
            '/terms',
            '/payment-policy',
            '/cookies',
        ]) {
            expect(firstMatch(route)).toBe('(static file or 404)');
        }
    });

    it('covers every SPA-only route the router declares', () => {
        for (const route of [
            '/library',
            '/favorites',
            '/preview-capture',
            '/login',
            '/signup',
            '/forgot-password',
            '/mcp',
            '/dashboard',
            '/dashboard/mcp',
            '/dashboard/collections',
            '/admin',
            '/admin/mcp',
            '/demo',
            '/demo/globe',
        ]) {
            expect(firstMatch(route)).toBe('/index.html');
        }
    });
});

describe('Task 5.6/5.7 - function and SPA fallback contract', () => {
  it('points the build at the frontend output directory', () => {
    expect(vercel.outputDirectory).toBe('frontend/dist');
  });

  it('ships the backend and built MCP data into the function', () => {
    // vercel.json declares includeFiles as a brace-expansion string
    // ("{backend/**,mcp-server/dist/**,mcp-server/package.json}"), not an array.
    // Assert on the members as tokens so this test actually fails if a member
    // is dropped, rather than silently substring-matching.
    const raw = vercel.functions['api/index.js'].includeFiles;
    const include = String(raw).replace(/^\{|\}$/g, '').split(',');
    expect(include).toEqual(
      expect.arrayContaining(['backend/**', 'mcp-server/dist/**', 'mcp-server/package.json'])
    );
  });

  it('declares no env block, so VITE_API_URL can only come from the dashboard', () => {
    // This is the root cause of the live production bundle targeting Render:
    // the repository never sets it, so any value in a live bundle is a
    // dashboard value baked in at build time.
    expect(vercel.env).toBeUndefined();
  });
});
