export type CookieConsentStatus = 'unknown' | 'essential' | 'accepted' | 'custom';

export interface CookiePreferences {
    analytics: boolean;
    functional: boolean;
    thirdParty: boolean;
}

export const COOKIE_CONSENT_NAME = 'ui_hub_cookie_consent';
export const COOKIE_PREFS_NAME = 'ui_hub_cookie_prefs';
export const COOKIE_CONSENT_DAYS = 365;

/**
 * The consent decision is mirrored into `localStorage`.
 *
 * A cookie on its own is not a reliable "remember my choice": the write is
 * dropped when cookies are disabled, when the page runs in a third-party iframe,
 * and Safari expires script-written cookies after 7 days. Every one of those
 * cases reads back as "no decision" and brought the banner back on the next
 * visit. The cookie stays the primary record - it is what a cookie-based
 * reviewer sees - and this mirror is the durable fallback.
 */
export const CONSENT_STATUS_STORAGE_KEY = 'ui_hub_consent_status';
export const CONSENT_PREFS_STORAGE_KEY = 'ui_hub_consent_prefs';

export const ALLOW_ALL: CookiePreferences = { analytics: true, functional: true, thirdParty: true };
export const ESSENTIAL_ONLY: CookiePreferences = { analytics: false, functional: false, thirdParty: false };

const CONSENT_STATUSES: CookieConsentStatus[] = ['accepted', 'essential', 'custom'];

/**
 * `localStorage` throws rather than returning null when storage is unavailable:
 * Safari private mode, a blocked third-party context, or a full quota. None of
 * those may break consent, so every access is guarded and degrades to "nothing
 * remembered" instead of propagating.
 */
const readStorage = (key: string): string | null => {
    try {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const writeStorage = (key: string, value: string): void => {
    try {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(key, value);
    } catch {
        // The cookie write above is still the primary record.
    }
};

const deleteStorage = (key: string): void => {
    try {
        if (typeof localStorage === 'undefined') return;
        localStorage.removeItem(key);
    } catch {
        // Nothing to clean up if storage is unavailable.
    }
};

export const setCookie = (name: string, value: string, days: number, path = '/'): void => {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=Lax`;
};

export const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
};

export const deleteCookie = (name: string, path = '/'): void => {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
};

export const getConsent = (): CookieConsentStatus => {
    const fromCookie = getCookie(COOKIE_CONSENT_NAME);
    if (fromCookie === 'accepted' || fromCookie === 'essential' || fromCookie === 'custom') {
        return fromCookie;
    }
    const fromStorage = readStorage(CONSENT_STATUS_STORAGE_KEY);
    if (fromStorage && CONSENT_STATUSES.includes(fromStorage as CookieConsentStatus)) {
        return fromStorage as CookieConsentStatus;
    }
    return 'unknown';
};

export const setConsent = (status: 'accepted' | 'essential' | 'custom'): void => {
    setCookie(COOKIE_CONSENT_NAME, status, COOKIE_CONSENT_DAYS);
    writeStorage(CONSENT_STATUS_STORAGE_KEY, status);
};

export const resetConsent = (): void => {
    deleteCookie(COOKIE_CONSENT_NAME);
    deleteCookie(COOKIE_PREFS_NAME);
    deleteStorage(CONSENT_STATUS_STORAGE_KEY);
    deleteStorage(CONSENT_PREFS_STORAGE_KEY);
};

export const getPreferences = (): CookiePreferences => {
    const value = getCookie(COOKIE_PREFS_NAME) ?? readStorage(CONSENT_PREFS_STORAGE_KEY);
    if (value) {
        try {
            const parsed = JSON.parse(value) as Partial<CookiePreferences>;
            return {
                analytics: parsed.analytics === true,
                functional: parsed.functional === true,
                thirdParty: parsed.thirdParty === true,
            };
        } catch {
            // Fall through to defaults below.
        }
    }
    // Backward compatibility: derive from the legacy consent cookie.
    const legacy = getConsent();
    if (legacy === 'accepted') return { ...ALLOW_ALL };
    return { ...ESSENTIAL_ONLY };
};

export const savePreferences = (prefs: CookiePreferences): 'accepted' | 'essential' | 'custom' => {
    const normalized: CookiePreferences = {
        analytics: prefs.analytics === true,
        functional: prefs.functional === true,
        thirdParty: prefs.thirdParty === true,
    };
    const allOn = normalized.analytics && normalized.functional && normalized.thirdParty;
    const allOff = !normalized.analytics && !normalized.functional && !normalized.thirdParty;

    const serialized = JSON.stringify(normalized);
    setCookie(COOKIE_PREFS_NAME, serialized, COOKIE_CONSENT_DAYS);
    writeStorage(CONSENT_PREFS_STORAGE_KEY, serialized);

    const status: 'accepted' | 'essential' | 'custom' = allOn ? 'accepted' : allOff ? 'essential' : 'custom';
    setConsent(status);
    return status;
};

export const isAnalyticsAllowed = (): boolean => getPreferences().analytics;

export type ConsentSignal = 'granted' | 'denied';

export interface ConsentSignals {
    ad_storage: ConsentSignal;
    ad_user_data: ConsentSignal;
    ad_personalization: ConsentSignal;
    analytics_storage: ConsentSignal;
}

/**
 * Builds the Google Consent Mode v2 payload from the cookie preferences.
 *
 * The three ad signals follow `thirdParty`, which is what gates Google AdSense.
 * They must NOT follow `analytics`: tying them to analytics would serve
 * personalized ads to a visitor who accepted analytics but refused third-party
 * cookies, and would withhold ads from someone who accepted ads but refused
 * analytics.
 */
export const buildConsentSignals = (
    analytics: boolean,
    thirdParty: boolean,
): ConsentSignals => {
    const ad: ConsentSignal = thirdParty ? 'granted' : 'denied';

    return {
        ad_storage: ad,
        ad_user_data: ad,
        ad_personalization: ad,
        analytics_storage: analytics ? 'granted' : 'denied',
    };
};