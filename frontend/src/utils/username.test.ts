import { describe, it, expect } from 'vitest';
import { USERNAME_RE, USERNAME_RULE_MESSAGE, validateUsername, usernameKey } from './username';

describe('USERNAME_RE', () => {
  it('accepts handles that start with a capital, include a number and stay 3-7 chars', () => {
    for (const handle of ['Ja1', 'J_1', 'J-1', 'Jainil1', 'JaNiL01', 'JAINIL1', 'Jain_1']) {
      expect(USERNAME_RE.test(handle), handle).toBe(true);
    }
  });

  it('rejects handles that break any rule', () => {
    for (const handle of [
      'J1', // too short
      'Jainil01', // too long
      'jainil1', // no leading capital
      '1ainil', // starts with a number
      'Jainil', // no number
      'J.1', // dot not allowed
      'J 1', // space not allowed
    ]) {
      expect(USERNAME_RE.test(handle), handle).toBe(false);
    }
  });
});

describe('validateUsername', () => {
  it('accepts a valid handle after trimming', () => {
    expect(validateUsername('  Jainil1 ')).toEqual({ valid: true });
  });

  it('reports the rule message when invalid', () => {
    expect(validateUsername('jainil1')).toEqual({ valid: false, reason: USERNAME_RULE_MESSAGE });
  });
});

describe('usernameKey', () => {
  it('lowercases and trims for case-insensitive uniqueness', () => {
    expect(usernameKey('  Ada_Dev ')).toBe('ada_dev');
    expect(usernameKey('')).toBe('');
  });
});
