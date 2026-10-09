import { describe, it, expect } from 'vitest';
import type { McpEvent } from '../src/services/analyticsService.js';
import { deriveSignals, buildSignalPrompt, type FixConfigInput } from '../src/services/fixCenterService.js';

const ev = (over: Partial<McpEvent>): McpEvent => ({ event: 'mcp_request', timestamp: 1000, ...over });

const healthyConfig: FixConfigInput = {
  authEnabled: true,
  analyticsEnabled: true,
  loggingEnabled: true,
  tools: { search_components: true, get_component: true },
};

const keyOf = (events: McpEvent[], config = healthyConfig) => deriveSignals(events, config).map((s) => s.key);

describe('fixCenterService.deriveSignals', () => {
  it('returns no signals when everything is healthy', () => {
    expect(deriveSignals([ev({ success: true }), ev({ event: 'component_fetch', success: true })], healthyConfig)).toEqual([]);
  });

  it('reports auth failures with error-code and prefix breakdowns', () => {
    const signals = deriveSignals(
      [
        ev({ event: 'auth_failure', success: false, errorCode: 'INVALID_API_KEY', keyPrefix: 'uh_live_x', timestamp: 2000 }),
        ev({ event: 'auth_failure', success: false, errorCode: 'INVALID_API_KEY', keyPrefix: 'uh_live_x', timestamp: 3000 }),
        ev({ event: 'auth_failure', success: false, errorCode: 'MISSING_API_KEY', timestamp: 1000 }),
      ],
      healthyConfig
    );
    const auth = signals.find((s) => s.key === 'auth_failures')!;
    expect(auth.occurrences).toBe(3);
    expect(auth.severity).toBe('warning');
    expect(auth.lastSeen).toBe(3000);
    expect(auth.evidence.byErrorCode).toEqual({ INVALID_API_KEY: 2, MISSING_API_KEY: 1 });
  });

  it('reports rate-limit and premium-denied signals', () => {
    expect(keyOf([ev({ event: 'rate_limit', success: false })])).toContain('rate_limit');
    const premium = deriveSignals(
      [ev({ event: 'premium_denied', success: false, componentId: 'pro-cursor' })],
      healthyConfig
    ).find((s) => s.key === 'premium_denied')!;
    expect(premium.severity).toBe('info');
    expect(premium.evidence.topResources).toEqual([{ key: 'pro-cursor', count: 1 }]);
  });

  it('reports zero-result searches', () => {
    const signals = deriveSignals(
      [ev({ event: 'component_search', query: 'Nonexistent Thing', success: false })],
      healthyConfig
    );
    const zero = signals.find((s) => s.key === 'zero_results')!;
    expect(zero).toBeTruthy();
    expect(zero.occurrences).toBe(1);
  });

  it('flags disabled runtime configuration', () => {
    const keys = keyOf([], { authEnabled: false, analyticsEnabled: false, loggingEnabled: false });
    expect(keys).toContain('config_auth_disabled');
    expect(keys).toContain('config_analytics_disabled');
    expect(keys).toContain('config_logging_disabled');
    const critical = deriveSignals([], { authEnabled: false, analyticsEnabled: true, loggingEnabled: true });
    expect(critical[0].severity).toBe('critical');
  });

  it('lists disabled tools', () => {
    const signals = deriveSignals([], {
      authEnabled: true,
      analyticsEnabled: true,
      loggingEnabled: true,
      tools: { search_components: true, get_component: false },
    });
    const tools = signals.find((s) => s.key === 'tools_disabled')!;
    expect(tools.evidence.disabled).toEqual(['get_component']);
  });
});

describe('fixCenterService.buildSignalPrompt', () => {
  it('builds a deterministic prompt from real signal data', () => {
    const signal = deriveSignals(
      [ev({ event: 'auth_failure', success: false, errorCode: 'INVALID_API_KEY', timestamp: 5000 })],
      healthyConfig
    )[0];
    const prompt = buildSignalPrompt(signal);
    expect(prompt).toContain('# Investigate and Fix UI HUB MCP Failure');
    expect(prompt).toContain(signal.title);
    expect(prompt).toContain(`Category: ${signal.category}`);
    expect(prompt).toContain('regression test that would have caught this failure');
    expect(prompt).toContain(new Date(5000).toISOString());

    const again = buildSignalPrompt(signal);
    expect(again).toBe(prompt);
  });

  it('uses a category-specific acceptance line', () => {
    const rateSignal = deriveSignals([ev({ event: 'rate_limit', success: false })], healthyConfig)[0];
    expect(buildSignalPrompt(rateSignal)).toContain('clear 429 with a retry hint');
  });
});
