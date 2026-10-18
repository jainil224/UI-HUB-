/**
 * Username rules, shared between the profile form and the backend contract.
 *
 * A handle is 3-30 characters, may contain letters, numbers, dot, underscore
 * and hyphen, and must include at least one capital letter. Case is preserved
 * for display; uniqueness is enforced case-insensitively on the server.
 */

export const USERNAME_RE = /^(?=.*[A-Z])[A-Za-z0-9._-]{3,30}$/;

export const USERNAME_RULE_MESSAGE =
  'Use 3-30 characters: letters, numbers, dot, underscore or hyphen, with at least one capital letter.';

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
