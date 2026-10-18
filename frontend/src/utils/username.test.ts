import { describe, it, expect } from 'vitest';
import { USERNAME_RE, USERNAME_RULE_MESSAGE, validateUsername, usernameKey } from './username';

describe('USERNAME_RE', () => {
  it('accepts handles with a capital letter and allowed symbols', () => {
    for (const handle of ['Ada_dev', 'Abc', 'John.Doe', 'John-Doe', 'JOHN', 'A'.repeat(30)]) {
      expect(USERNAME_RE.test(handle), handle).toBe(true);
    }
  });

  it('rejects handles missing a capital letter or using disallowed characters', () => {
    for (const handle of ['ada_dev', 'ab', 'a'.repeat(31), 'has space', 'Ada@dev', 'bad!dash']) {
      expect(USERNAME_RE.test(handle), handle).toBe(false);
    }
  });
});

describe('validateUsername', () => {
  it('accepts a valid handle after trimming', () => {
    expect(validateUsername('  Ada_dev ')).toEqual({ valid: true });
  });

  it('reports the rule message when invalid', () => {
    expect(validateUsername('ada_dev')).toEqual({ valid: false, reason: USERNAME_RULE_MESSAGE });
  });
});

describe('usernameKey', () => {
  it('lowercases and trims for case-insensitive uniqueness', () => {
    expect(usernameKey('  Ada_Dev ')).toBe('ada_dev');
    expect(usernameKey('')).toBe('');
  });
});
