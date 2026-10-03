import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    ALLOW_ALL,
    CONSENT_PREFS_STORAGE_KEY,
    CONSENT_STATUS_STORAGE_KEY,
    ESSENTIAL_ONLY,
    getConsent,
    getPreferences,
    resetConsent,
    savePreferences,
} from './cookieUtils';

/**
 * Regression guard for "the cookie notice must be visible exactly once".
 *
 * `CookieBanner` shows itself whenever `getConsent()` returns 'unknown', so the
 * whole guarantee rests on that one function. It used to read a single cookie
 * (`ui_hub_cookie_consent`) and nothing else, which meant any environment where
 * the cookie write does not survive - cookies disabled, a third-party iframe,
 * Safari's 7-day cap on script-written cookies, plain eviction - reported "no
 * decision" on the next visit and brought the banner back after the visitor had
 * already answered it.
 *
 * These tests pin the storage contract, not the banner: a decision recorded in
 * either store must read back, losing the cookie must not lose the answer, and
 * an explicit reset must clear both so `/cookies` can still re-open the notice.
 */

interface JarEntry {
    value: string;
    expires: number;
}

let jar: Map<string, JarEntry>;
let storage: Map<string, string>;

const readJar = (): string =>
    [...jar.entries()]
        .map(([name, entry]) => `${name}=${entry.value}`)
        .join('; ');

/**
 * A `document.cookie` stand-in faithful enough for these tests: it honours
 * `expires` in both directions, so `resetConsent()` really does drop the cookie
 * and a cookie written with an expiry in the past is not returned.
 */
const documentStub = {
    get cookie(): string {
        return readJar();
    },
    set cookie(line: string) {
        const [pair, ...attributes] = line.split(';').map((part) => part.trim());
        const separator = pair.indexOf('=');
        const name = pair.slice(0, separator);
        const value = pair.slice(separator + 1);

        const expiresAttribute = attributes.find((a) => a.toLowerCase().startsWith('expires='));
        const expires = expiresAttribute ? Date.parse(expiresAttribute.slice('expires='.length)) : NaN;

        if (Number.isNaN(expires) || expires <= Date.now()) {
            jar.delete(name);
            return;
        }
        jar.set(name, { value, expires });
    },
};

const localStorageStub = {
    getItem: (key: string): string | null => (storage.has(key) ? storage.get(key)! : null),
    setItem: (key: string, value: string): void => {
        storage.set(key, value);
    },
    removeItem: (key: string): void => {
        storage.delete(key);
    },
    clear: (): void => {
        storage.clear();
    },
};

const define = (key: string, value: unknown): void => {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
};

/** Simulates the browser losing the cookie jar while keeping web storage. */
const loseCookies = (): void => {
    jar.clear();
};

beforeEach(() => {
    jar = new Map();
    storage = new Map();
    define('document', documentStub);
    define('localStorage', localStorageStub);
});

afterEach(() => {
    Reflect.deleteProperty(globalThis, 'document');
    Reflect.deleteProperty(globalThis, 'localStorage');
});

describe('consent persistence', () => {
    it('reports no decision before the visitor chooses', () => {
        expect(getConsent()).toBe('unknown');
    });

    it('reads back the choice made in the banner', () => {
        expect(savePreferences({ ...ALLOW_ALL })).toBe('accepted');
        expect(getConsent()).toBe('accepted');
        expect(getPreferences()).toEqual(ALLOW_ALL);
    });

    it('keeps the answer when the cookie is lost but web storage survives', () => {
        savePreferences({ ...ALLOW_ALL });
        loseCookies();

        // The exact defect: the banner is gated on this value, so a lost cookie
        // used to mean the notice came back on the very next page load.
        expect(getConsent()).toBe('accepted');
        expect(getPreferences()).toEqual(ALLOW_ALL);
    });

    it('keeps a granular choice, not just accept-all, when the cookie is lost', () => {
        savePreferences({ analytics: true, functional: false, thirdParty: false });
        loseCookies();

        expect(getConsent()).toBe('custom');
        expect(getPreferences()).toEqual({ analytics: true, functional: false, thirdParty: false });
    });

    it('keeps an essential-only choice when the cookie is lost', () => {
        savePreferences({ ...ESSENTIAL_ONLY });
        loseCookies();

        expect(getConsent()).toBe('essential');
        expect(getPreferences()).toEqual(ESSENTIAL_ONLY);
    });

    it('keeps the answer when web storage is unavailable and only the cookie works', () => {
        Object.defineProperty(globalThis, 'localStorage', {
            value: {
                getItem: () => {
                    throw new Error('storage disabled');
                },
                setItem: () => {
                    throw new Error('storage disabled');
                },
                removeItem: () => {
                    throw new Error('storage disabled');
                },
            },
            configurable: true,
            writable: true,
        });

        // Storage throwing must not break consent; the cookie is still written.
        expect(savePreferences({ ...ALLOW_ALL })).toBe('accepted');
        expect(getConsent()).toBe('accepted');
        expect(getPreferences()).toEqual(ALLOW_ALL);
    });

    it('ignores an unrecognised stored value instead of treating it as consent', () => {
        storage.set(CONSENT_STATUS_STORAGE_KEY, 'maybe');
        expect(getConsent()).toBe('unknown');
    });

    it('prefers the cookie when both stores hold a decision', () => {
        savePreferences({ ...ALLOW_ALL });
        storage.set(CONSENT_STATUS_STORAGE_KEY, 'essential');

        expect(getConsent()).toBe('accepted');
    });

    it('clears both stores on reset, so /cookies can ask again', () => {
        savePreferences({ ...ALLOW_ALL });
        resetConsent();

        expect(getConsent()).toBe('unknown');
        expect(storage.has(CONSENT_STATUS_STORAGE_KEY)).toBe(false);
        expect(storage.has(CONSENT_PREFS_STORAGE_KEY)).toBe(false);
    });

    it('derives allow-all from a legacy consent cookie that predates the mirror', () => {
        documentStub.cookie = 'ui_hub_cookie_consent=accepted; expires=' +
            new Date(Date.now() + 86_400_000).toUTCString() + '; path=/; SameSite=Lax';

        expect(getConsent()).toBe('accepted');
        expect(getPreferences()).toEqual(ALLOW_ALL);
    });
});
