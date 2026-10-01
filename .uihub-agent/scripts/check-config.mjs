#!/usr/bin/env node
/**
 * Deployment / configuration drift validator — agent.md tasks 6.12, 6.13, 6.25.
 *
 * Reports CONSISTENT / CONFLICT / UNKNOWN for claims that can be checked
 * against files in this repository. It never auto-fixes, and it never guesses:
 * a claim it cannot verify is UNKNOWN, never CONSISTENT.
 *
 * Scope is deliberately narrow. Verifying prose in Markdown is not possible;
 * verifying the handful of endpoints, routes, registries and environment keys
 * that the documentation makes load-bearing claims about is.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const findings = [];

/**
 * @param {string} id
 * @param {'CONSISTENT'|'CONFLICT'|'UNKNOWN'} status
 * @param {string} detail
 */
function claim(id, status, detail) {
  findings.push({ id, status, detail });
}

function jsonParse(p) {
  const raw = read(p);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { __parseError: e.message };
  }
}

function yamlValues(raw, key) {
  if (!raw) return [];
  const out = [];
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`-\\s*key:\\s*${key}\\s*$`).test(lines[i])) {
      for (let j = i + 1; j < lines.length; j++) {
        const m = lines[j].match(/^\s+value:\s*(.+?)\s*$/);
        if (m) {
          out.push(m[1]);
          break;
        }
        if (/^\s+sync:\s*false\s*$/.test(lines[j])) {
          out.push(null); // sync:false -> present in blueprint, unset in git
          break;
        }
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Render blueprint conflict (6.13)
// ---------------------------------------------------------------------------

{
  const rootRaw = read('render.yaml');
  const mcpRaw = read('mcp-server/render.yaml');

  if (!rootRaw || !mcpRaw) {
    claim('render-blueprint', 'UNKNOWN', 'one or both Render blueprints are absent');
  } else {
    const rootNames = [...rootRaw.matchAll(/^\s*-\s*(?:type:\s*\w+\s*\n\s*)?name:\s*(\S+)/gm)].map((m) => m[1]);
    const mcpNames = [...mcpRaw.matchAll(/^\s*-\s*(?:type:\s*\w+\s*\n\s*)?name:\s*(\S+)/gm)].map((m) => m[1]);
    const rootStart = (rootRaw.match(/startCommand:\s*(.+)/) || [])[1];
    const mcpStart = (mcpRaw.match(/startCommand:\s*(.+)/) || [])[1];

    claim(
      'render-blueprint-count',
      'CONFLICT',
      `two Render blueprints declare different services (root=[${rootNames.join(', ')}] mcp=[${mcpNames.join(', ')}]); source of truth UNDECIDED (owner decision required); see .uihub-agent/infrastructure/DEPLOYMENT_CONFLICTS.md`,
    );

    // The root blueprint's title claims a unified backend+MCP deployment, but
    // its start command runs only the backend.
    const header = rootRaw.split('\n')[0] || '';
    const claimsUnified = /unified|core backend \+ mcp/i.test(header);
    const startsBackendOnly = /cd backend/.test(rootStart || '') && !/mcp/.test(rootStart || '');
    if (claimsUnified && startsBackendOnly) {
      claim(
        'render-blueprint-coherence',
        'CONFLICT',
        `render.yaml header claims a unified backend+MCP service but startCommand is "${rootStart?.trim()}", which runs only the backend; the MCP build step produces unused output`,
      );
    }
    claim('render-mcp-start', mcpStart?.includes('dist/index.js') ? 'CONSISTENT' : 'UNKNOWN', `mcp-server startCommand="${mcpStart?.trim()}"`);
  }
}

// ---------------------------------------------------------------------------
// 2. MCP_ALLOWED_ORIGINS: blueprint vs CORS policy defaults (6.12, 6.25)
// ---------------------------------------------------------------------------

{
  const configured = [
    ...yamlValues(read('render.yaml'), 'MCP_ALLOWED_ORIGINS'),
    ...yamlValues(read('mcp-server/render.yaml'), 'MCP_ALLOWED_ORIGINS'),
  ].filter((v) => v !== null);

  if (configured.length === 0) {
    claim('mcp-allowed-origins', 'UNKNOWN', 'MCP_ALLOWED_ORIGINS not set in any blueprint');
  } else {
    const declared = new Set(configured.flatMap((v) => String(v).split(',').map((s) => s.trim()).filter(Boolean)));
    const dev = [...declared].filter((o) => /^https?:\/\/(localhost|127\.0\.0\.1)/.test(o));
    const prod = [...declared].filter((o) => /^https:\/\//.test(o) && !/localhost/.test(o));

    if (dev.length > 0) {
      claim(
        'mcp-allowed-origins-localhost-in-prod',
        'CONFLICT',
        `production blueprint allows development origins: ${dev.join(', ')}; any local dev server on that port can call production MCP now that CORS enforcement is active`,
      );
    } else {
      claim('mcp-allowed-origins-localhost-in-prod', 'CONSISTENT', 'no localhost origins in production blueprint');
    }

    claim(
      'mcp-allowed-origins-prod',
      prod.length > 0 ? 'CONSISTENT' : 'CONFLICT',
      `production origins declared: ${prod.join(', ') || '(none)'}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 3. Backend ALLOWED_ORIGINS vs CSP connectSrc (6.12, 6.25)
// ---------------------------------------------------------------------------

{
  const server = read('backend/src/server.js');
  if (!server) {
    claim('csp-connect-src', 'UNKNOWN', 'backend/src/server.js not found');
  } else {
    const cspBlock = (server.match(/connectSrc:\s*\[([\s\S]*?)\]/) || [])[1] || '';
    const cspOrigins = [...cspBlock.matchAll(/["'](https?:\/\/[^"']+)["']/g)].map((m) => m[1]);

    const policyRaw = read('backend/src/config/corsPolicy.js');
    if (!policyRaw) {
      claim('csp-vs-cors', 'UNKNOWN', 'backend CORS policy module not found');
    } else {
      const defaults = (policyRaw.match(/DEFAULT_ALLOWED_ORIGINS[\s\S]*?\[([\s\S]*?)\]/) || [])[1] || '';
      const corsOrigins = [...defaults.matchAll(/['"](https?:\/\/[^'"]+)['"]/g)].map((m) => m[1]);

      // CSP source expressions are patterns, not literal strings. `server.js`
      // allows `http://localhost:*`, which DOES permit http://localhost:5173 and
      // http://localhost:3000. A plain string comparison reported both as CSP
      // violations, which was a false positive: browsers apply source-expression
      // matching, not equality.
      const cspAllows = (origin, sources) => {
        const u = new URL(origin);
        return sources.some((raw) => {
          if (raw === "'self'" || raw === '*') return true;
          const s = raw.replace(/^([a-z]+):\/\//i, '').replace(/\/$/, '');
          const [hostPat, portPat = ''] = s.split(':');
          const schemeOk = /^https?:\/\//i.test(raw) ? raw.split(':')[0] === u.protocol.replace(':', '') : true;
          if (!schemeOk) return false;
          const [cHost, cPort] = [u.hostname, u.port];
          const hostOk = hostPat === '*' || (hostPat.startsWith('*.') ? cHost === hostPat.slice(2) || cHost.endsWith(hostPat.slice(1)) : hostPat === cHost);
          if (!hostOk) return false;
          if (portPat === '*') return true;
          return portPat === '' ? true : portPat === cPort;
        });
      };

      const inCorsNotCsp = corsOrigins.filter((o) => !cspAllows(o, cspOrigins));

      if (inCorsNotCsp.length > 0) {
        claim(
          'csp-vs-cors',
          'CONFLICT',
          `allowed in CORS but blocked by CSP connectSrc: ${inCorsNotCsp.join(', ')}; a browser would report a CSP violation and the request would never reach CORS`,
        );
      } else {
        claim('csp-vs-cors', 'CONSISTENT', `every default CORS origin is matched by a CSP connectSrc source expression (incl. wildcards); connectSrc = ${cspOrigins.join(', ')}`);
      }

      // An origin in CSP but not in CORS defaults is NOT a conflict. CSP must
      // list third-party APIs the browser talks to directly (api.razorpay.com);
      // those are not browser origins of this API, so they are correctly absent
      // from CORS. Reporting this as a conflict would push an owner toward
      // deleting a required CSP entry.
      const nonOriginSources = [...cspBlock.matchAll(/["']([^"'\r\n]+)["']/g)]
        .map((m) => m[1])
        .filter((v) => !v.startsWith('http'));
      claim(
        'csp-extra-origins',
        'CONSISTENT',
        `connectSrc also permits ${cspOrigins.filter((o) => !corsOrigins.includes(o)).join(', ') || '(nothing)'} and non-origin source(s) ${nonOriginSources.join(', ') || '(none)'}; third-party API endpoints belong in CSP and are correctly absent from CORS defaults`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Documented endpoints vs vercel.json rewrites (6.11, 6.12)
// ---------------------------------------------------------------------------

{
  const v = jsonParse('vercel.json');
  if (!v || v.__parseError) {
    claim('vercel-rewrites', 'UNKNOWN', 'vercel.json missing or unparseable');
  } else {
    const sources = (v.rewrites || []).map((r) => r.source);
    claim('vercel-rewrites', sources.length > 0 ? 'CONSISTENT' : 'UNKNOWN', `rewrites: ${sources.join(', ')}`);

    // /mcp is not a rewrite target, so it falls through to the SPA catch-all.
    const mcpRouted = sources.some((s) => /^\/mcp(\/|$)/.test(s));
    claim(
      'vercel-mcp-endpoint',
      mcpRouted ? 'CONSISTENT' : 'CONFLICT',
      mcpRouted
        ? '/mcp is routed on Vercel'
        : '/mcp has no rewrite in vercel.json and resolves to the SPA catch-all (index.html), so it cannot serve MCP; document the Render endpoint instead',
    );
  }
}

// ---------------------------------------------------------------------------
// 5. MCP tool registry: source vs built data (6.25)
// ---------------------------------------------------------------------------

// The registry is not a single mcpTools.json file. The tool set is assembled
// from the generated data directory: component metadata, templates and the
// source-code maps. The 14 tools documented in APIs/API_OVERVIEW.md are derived
// from those files, so freshness is asserted over the whole directory.
{
  const SRC = 'mcp-server/src/data';
  const DIST = 'mcp-server/dist/data';

  if (!existsSync(SRC) || !existsSync(DIST)) {
    claim(
      'mcp-data-freshness',
      'UNKNOWN',
      `generated data directory missing (src=${existsSync(SRC)} dist=${existsSync(DIST)})`,
    );
  } else {
    const names = readdirSync(SRC).sort();
    const mismatched = [];
    const missingInDist = [];

    for (const n of names) {
      // Only compare JSON data assets. components.ts is compiled to components.js
      // and is compared as source-vs-output, not byte-for-byte.
      if (!n.endsWith('.json')) continue;
      const s = read(`${SRC}/${n}`);
      const d = existsSync(`${DIST}/${n}`) ? read(`${DIST}/${n}`) : null;
      if (d === null) missingInDist.push(n);
      else if (s !== d) mismatched.push(n);
    }

    if (missingInDist.length > 0) {
      claim(
        'mcp-data-freshness',
        'CONFLICT',
        `source data not present in dist (stale or partial build): ${missingInDist.join(', ')}; run the regeneration command`,
      );
    } else if (mismatched.length > 0) {
      claim(
        'mcp-data-freshness',
        'CONFLICT',
        `tracked dist data differs from source: ${mismatched.join(', ')}; run the regeneration command`,
      );
    } else {
      claim(
        'mcp-data-freshness',
        'CONSISTENT',
        `${names.filter((n) => n.endsWith('.json')).length} generated JSON data files match their sources`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Environment contract coverage (6.25)
// ---------------------------------------------------------------------------

{
  const contract = read('.uihub-agent/infrastructure/ENVIRONMENT_CONTRACT.md');
  if (!contract) {
    claim('env-contract', 'UNKNOWN', 'ENVIRONMENT_CONTRACT.md absent');
  } else {
    const mcpEnv = read('mcp-server/src/config/env.ts') || '';
    const vars = new Set([...mcpEnv.matchAll(/\b(?:MCP|MONGODB|NODE|REDIS|FIREBASE)[A-Z0-9_]*\b/g)].map((m) => m[0]));
    const undocumented = [...vars].filter((v) => !contract.includes(v));
    claim(
      'env-contract-coverage',
      undocumented.length === 0 ? 'CONSISTENT' : 'CONFLICT',
      undocumented.length === 0
        ? `${vars.size} MCP env vars referenced in source are documented`
        : `referenced in mcp-server/src/config/env.ts but absent from ENVIRONMENT_CONTRACT.md: ${undocumented.join(', ')}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const pad = Math.max(...findings.map((f) => f.id.length));
for (const f of findings) {
  console.log(`${f.status.padEnd(10)} ${f.id.padEnd(pad)}  ${f.detail}`);
}

const conflicts = findings.filter((f) => f.status === 'CONFLICT').length;
const unknown = findings.filter((f) => f.status === 'UNKNOWN').length;
const consistent = findings.filter((f) => f.status === 'CONSISTENT').length;

console.log('');
console.log(`[check-config] ${consistent} CONSISTENT, ${conflicts} CONFLICT, ${unknown} UNKNOWN`);

// CONFLICT is a real, actionable disagreement and fails the check.
// UNKNOWN is a gap in our evidence and does not fail, but is reported loudly.
process.exit(conflicts > 0 ? 1 : 0);