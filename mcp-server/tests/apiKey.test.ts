import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiKeyService } from '../src/services/apiKeyService.js';
import { apiKeyService } from '../src/services/apiKeyService.js';
import config from '../src/config/env.js';

// Mock the firebaseService that apiKeyService depends on
const mockCollection = vi.hoisted(() => {
  const docs = new Map<string, any>();
  return {
    add: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    get: vi.fn(),
    doc: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    collection: vi.fn(),
    _docs: docs,
  };
});

vi.mock('../src/services/firebase.js', () => ({
  firebaseService: {
    getDb: () => ({
      collection: (name: string) => ({
        add: mockCollection.add,
        where: (...args: any[]) => mockCollection.where(...args),
        orderBy: (...args: any[]) => mockCollection.orderBy(...args),
        get: mockCollection.get,
        doc: (id: string) => ({
          get: vi.fn().mockResolvedValue({ exists: true, data: () => mockCollection._docs.get(id), ref: { update: vi.fn(), delete: vi.fn() } }),
          update: vi.fn(),
          delete: vi.fn(),
        }),
      }),
    }),
  },
}));

describe('ApiKeyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCollection._docs.clear();
  });

  it('generates API keys with the correct prefix', () => {
    const key = apiKeyService.generateApiKey();
    expect(key.startsWith(config.apiKeyPrefix)).toBe(true);
    expect(key.length).toBeGreaterThan(config.apiKeyPrefix.length + 40);
  });

  it('hashes API keys deterministically with SHA-256', () => {
    const key = 'uh_live_testKey123';
    const hash1 = apiKeyService.hashApiKey(key);
    const hash2 = apiKeyService.hashApiKey(key);
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    expect(hash1).not.toContain(key); // never stores plaintext
  });

  it('does not store the plaintext key, only the hash', () => {
    const key = 'uh_live_mysecretkey1234567890';
    const hash = apiKeyService.hashApiKey(key);
    expect(hash).not.toContain('mysecretkey');
  });

  it('creates an API key and returns the plaintext only once', async () => {
    mockCollection.add.mockResolvedValue({ id: 'key-doc-123' });
    const { plaintextKey, record } = await apiKeyService.createApiKey('user-1', 'Test Key');
    expect(plaintextKey.startsWith(config.apiKeyPrefix)).toBe(true);
    expect(record.status).toBe('active');
    expect(record.key_hash).not.toContain(plaintextKey);
    expect(record.key_hash).toHaveLength(64);
    expect(record.key_prefix).toBe(apiKeyService.getKeyPrefix(plaintextKey));
  });

  it('getKeyPrefix returns truncated, safe-to-display value', () => {
    const key = apiKeyService.generateApiKey();
    const prefix = apiKeyService.getKeyPrefix(key);
    expect(prefix.length).toBe(14);
    // Never contain the full key
    expect(key).not.toBe(prefix);
  });
});
