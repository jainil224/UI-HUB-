/**
 * Redaction & sanitization utilities.
 *
 * These are applied BEFORE persistence (not merely before rendering) so secrets
 * and unsafe payloads never reach MongoDB. Callers must pass every user- or
 * system-supplied string (error messages, URLs, queries, tool input summaries)
 * through these helpers.
 */

const MAX_TEXT_LEN = 500;
const MAX_QUERY_LEN = 200;

/** Query-string / body parameter names whose values must never be stored. */
const SENSITIVE_PARAM_NAMES = new Set([
  'key',
  'api_key',
  'apikey',
  'api-key',
  'access_token',
  'accesstoken',
  'token',
  'auth',
  'authorization',
  'password',
  'passwd',
  'pwd',
  'secret',
  'client_secret',
  'signature',
  'sig',
  'code',
  'session',
  'sessionid',
  'jwt',
  'bearer',
]);

function stripControlAndAngles(input: string): string {
  // Remove control chars and angle brackets. Removing angle brackets guarantees
  // no stored value can be interpreted as HTML/markup even if a consumer uses
  // dangerouslySetInnerHTML.
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '');
}

/**
 * Redact secrets from an arbitrary text blob (error messages, log lines).
 * Never returns Authorization headers, raw API keys, or connection strings.
 */
export function redactText(input: unknown): string {
  let text = typeof input === 'string' ? input : String(input ?? '');
  if (!text) return '';

  text = text
    // UI HUB API keys
    .replace(/\buh_live_[A-Za-z0-9._-]+/g, 'uh_live_***REDACTED***')
    // Generic bearer tokens
    .replace(/\bBearer\s+[A-Za-z0-9._-]+/gi, 'Bearer ***REDACTED***')
    // Anything that looks like an Authorization header
    .replace(/\bAuthorization\s*[:=]\s*\S+/gi, 'Authorization: ***REDACTED***')
    // MongoDB connection strings
    .replace(/\bmongodb(\+srv)?:\/\/[^\s"']+/gi, 'mongodb://***REDACTED***')
    // Google / Firebase API keys
    .replace(/\bAIza[0-9A-Za-z_-]{20,}/g, '***REDACTED***')
    // OpenAI-style / generic sk- keys
    .replace(/\bsk-[A-Za-z0-9_-]{16,}/g, '***REDACTED***')
    // PEM private keys
    .replace(/-----BEGIN[^-]+-----[\s\S]*?-----END[^-]+-----/g, '***REDACTED KEY***');
  // password / token / secret style assignments
  text = text.replace(
    /(password|passwd|pwd|secret|token|api[_-]?key|apikey|client_secret)\s*[:=]\s*("[^"]*"|'[^']*'|[^\s,;]+)/gi,
    '$1=***REDACTED***',
  );

  text = stripControlAndAngles(text).trim();
  return text.length > MAX_TEXT_LEN ? `${text.slice(0, MAX_TEXT_LEN)}…` : text;
}

/**
 * Sanitize free text for storage/display (query text, notes, error summaries).
 * Redacts secrets, strips control chars / angle brackets, caps length.
 */
export function sanitizeText(input: unknown, maxLen = MAX_TEXT_LEN): string {
  const redacted = redactText(input);
  return redacted.length > maxLen ? `${redacted.slice(0, maxLen)}…` : redacted;
}

/** Normalize a search query for stable aggregation/fingerprinting. */
export function normalizeQuery(input: unknown): string {
  const text = typeof input === 'string' ? input : String(input ?? '');
  return stripControlAndAngles(text)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LEN);
}

export interface SafeUrl {
  /** Sanitized string safe to persist/display. */
  sanitized: string;
  valid: boolean;
  reason?: string;
  protocol?: string;
  host?: string;
}

/**
 * Validate and sanitize a resource URL. Drops sensitive query parameters and
 * rejects non-http(s) protocols. Never performs a network request — this is
 * pure format validation (no external link probing is performed by default).
 */
export function sanitizeUrl(input: unknown): SafeUrl {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) return { sanitized: '', valid: false, reason: 'empty' };

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { sanitized: sanitizeText(raw, 300), valid: false, reason: 'unparseable' };
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'https:' && protocol !== 'http:') {
    return { sanitized: sanitizeText(raw, 300), valid: false, reason: `unsupported_protocol:${protocol}` };
  }

  for (const name of Array.from(parsed.searchParams.keys())) {
    if (SENSITIVE_PARAM_NAMES.has(name.toLowerCase())) {
      parsed.searchParams.set(name, 'REDACTED');
    }
  }

  // Strip credentials embedded in the URL.
  parsed.username = '';
  parsed.password = '';

  return {
    sanitized: sanitizeText(parsed.toString(), 300),
    valid: true,
    protocol,
    host: parsed.host,
  };
}

/** Build an IP-safe identifier for correlation without storing the raw IP. */
export function hashValue(input: unknown): string {
  const text = typeof input === 'string' ? input : String(input ?? '');
  if (!text) return '';
  // Lightweight, non-cryptographic hash to avoid persisting raw IPs.
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return `h${(h >>> 0).toString(36)}`;
}
