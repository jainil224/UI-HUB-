import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_ENDPOINT, keyLabel, resolveConfig } from '../src/config.js';

test('resolveConfig uses defaults when nothing is provided', () => {
  const c = resolveConfig({});
  assert.equal(c.endpoint, DEFAULT_ENDPOINT);
  assert.equal(c.apiKey, undefined);
});

test('endpoint precedence: flag > env > project > user > default', () => {
  const c = resolveConfig({
    flag: { endpoint: 'f' },
    env: { endpoint: 'e' },
    project: { endpoint: 'p' },
    user: { endpoint: 'u' },
  });
  assert.equal(c.endpoint, 'f');
});

test('endpoint falls back to env when flag absent', () => {
  const c = resolveConfig({ env: { endpoint: 'e' }, project: { endpoint: 'p' } });
  assert.equal(c.endpoint, 'e');
});

test('endpoint falls back to project when env absent', () => {
  const c = resolveConfig({ project: { endpoint: 'p' }, user: { endpoint: 'u' } });
  assert.equal(c.endpoint, 'p');
});

test('endpoint falls back to user config', () => {
  const c = resolveConfig({ user: { endpoint: 'u' } });
  assert.equal(c.endpoint, 'u');
});

test('apiKey precedence: flag > env > user (never project)', () => {
  const c = resolveConfig({
    flag: { apiKey: 'flag-key' },
    env: { apiKey: 'env-key' },
    project: { apiKey: 'project-key' },
    user: { apiKey: 'user-key' },
  });
  assert.equal(c.apiKey, 'flag-key');
});

test('apiKey comes from user config when no flag/env', () => {
  const c = resolveConfig({ user: { apiKey: 'user-key' } });
  assert.equal(c.apiKey, 'user-key');
});

test('apiKey is undefined when only project config provides one', () => {
  const c = resolveConfig({ project: { apiKey: 'project-key' } });
  assert.equal(c.apiKey, undefined);
});

test('keyLabel masks uh_live keys', () => {
  assert.equal(keyLabel('uh_live_abc123'), 'uh_live_…');
  assert.equal(keyLabel(undefined), 'not set');
  assert.equal(keyLabel('zzz'), '…zzz');
});