export type CookieConsentStatus = 'unknown' | 'essential' | 'accepted' | 'custom';

export interface CookiePreferences {
    analytics: boolean;
    functional: boolean;
    thirdParty: boolean;
}

export const COOKIE_CONSENT_NAME = 'ui_hub_cookie_consent';
export const COOKIE_PREFS_NAME = 'ui_hub_cookie_prefs';
export const COOKIE_CONSENT_DAYS = 365;

export const ALLOW_ALL: CookiePreferences = { analytics: true, functional: true, thirdParty: true };
export const ESSENTIAL_ONLY: CookiePreferences = { analytics: false, functional: false, thirdParty: false };

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
    const value = getCookie(COOKIE_CONSENT_NAME);
    if (value === 'accepted') return 'accepted';
    if (value === 'essential') return 'essential';
    if (value === 'custom') return 'custom';
    return 'unknown';
};

export const setConsent = (status: 'accepted' | 'essential' | 'custom'): void => {
    setCookie(COOKIE_CONSENT_NAME, status, COOKIE_CONSENT_DAYS);
};

export const resetConsent = (): void => {
    deleteCookie(COOKIE_CONSENT_NAME);
    deleteCookie(COOKIE_PREFS_NAME);
};

export const getPreferences = (): CookiePreferences => {
    const value = getCookie(COOKIE_PREFS_NAME);
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

    setCookie(COOKIE_PREFS_NAME, JSON.stringify(normalized), COOKIE_CONSENT_DAYS);

    const status: 'accepted' | 'essential' | 'custom' = allOn ? 'accepted' : allOff ? 'essential' : 'custom';
    setConsent(status);
    return status;
};

export const isAnalyticsAllowed = (): boolean => getPreferences().analytics;