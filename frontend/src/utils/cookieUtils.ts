export type CookieConsentStatus = 'unknown' | 'essential' | 'accepted';

export const COOKIE_CONSENT_NAME = 'ui_hub_cookie_consent';
export const COOKIE_CONSENT_DAYS = 365;

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
    return 'unknown';
};

export const setConsent = (status: 'accepted' | 'essential'): void => {
    setCookie(COOKIE_CONSENT_NAME, status, COOKIE_CONSENT_DAYS);
};

export const resetConsent = (): void => {
    deleteCookie(COOKIE_CONSENT_NAME);
};

export const isAnalyticsAllowed = (): boolean => getConsent() === 'accepted';