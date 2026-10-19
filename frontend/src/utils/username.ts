/**
 * Username rules, shared between the profile form and the backend contract.
 *
 * A handle is 3-15 characters, must start with a capital letter, must include at
 * least one number, and may contain letters, numbers, hyphen and underscore
 * (only those two symbols). Case is preserved for display; uniqueness is
 * enforced case-insensitively on the server.
 */

export const USERNAME_RE = /^(?=.*\d)[A-Z][A-Za-z0-9_-]{2,14}$/;

export const USERNAME_RULE_MESSAGE =
  'Use 3-15 characters, start with a capital letter, include a number, and use only letters, numbers, - or _.';

export type UsernameCheck = { valid: boolean; reason?: string };

/**
 * Validates a raw handle (trimmed) against the shared rules.
 * @param value
 */
export const validateUsername = (value: string): UsernameCheck => {
  const handle = String(value ?? '').trim();
  if (USERNAME_RE.test(handle)) return { valid: true };
  return { valid: false, reason: USERNAME_RULE_MESSAGE };
};

/** Lowercased key used for case-insensitive uniqueness comparisons. */
export const usernameKey = (value: string): string => String(value ?? '').trim().toLowerCase();
