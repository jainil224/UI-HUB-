import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
    getConsent,
    getPreferences,
    setConsent,
    resetConsent,
    savePreferences,
    type CookieConsentStatus,
    type CookiePreferences,
    ALLOW_ALL,
    ESSENTIAL_ONLY,
    buildConsentSignals,
} from '../utils/cookieUtils';
import { enableAnalytics, disableAnalytics } from '../lib/firebase';
import { loadAdSense } from '../lib/adsense';

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

interface CookieConsentContextType {
    status: CookieConsentStatus;
    prefs: CookiePreferences;
    showBanner: boolean;
    acceptAll: () => void;
    rejectNonEssential: () => void;
    savePreference: (prefs: CookiePreferences) => void;
    resetPreference: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType>({
    status: 'unknown',
    prefs: { ...ESSENTIAL_ONLY },
    showBanner: false,
    acceptAll: () => {},
    rejectNonEssential: () => {},
    savePreference: () => {},
    resetPreference: () => {},
});

export const useCookieConsent = () => useContext(CookieConsentContext);

/**
 * Mirrors the cookie preferences onto Google's Consent Mode v2 signals.
 *
 * `ad_storage`, `ad_user_data` and `ad_personalization` follow the third-party
 * preference, which is what gates Google AdSense. They must NOT follow the
 * analytics preference: tying them to `analytics` would serve personalized ads
 * to a visitor who accepted analytics but refused third-party cookies, and would
 * drop ad_storage to 'denied' for someone who accepted ads but refused analytics.
 *
 * The mapping itself lives in `buildConsentSignals` so it can be unit tested.
 */
const updateGtagConsent = (analyticsAllowed: boolean, thirdPartyAllowed: boolean): void => {
    if (typeof window === 'undefined') return;

    const consent = buildConsentSignals(analyticsAllowed, thirdPartyAllowed);
    window.dataLayer = window.dataLayer || [];

    const gtag = window.gtag;
    if (typeof gtag === 'function') {
        gtag('consent', 'update', consent);
        return;
    }

    window.dataLayer.push({ event: 'consent_update', consent });
};

const applyConsent = (analyticsAllowed: boolean, thirdPartyAllowed: boolean): void => {
    updateGtagConsent(analyticsAllowed, thirdPartyAllowed);

    if (analyticsAllowed) {
        enableAnalytics();
    } else {
        disableAnalytics();
    }
};

/**
 * The visitor's remembered decision, read exactly once per document load.
 *
 * `getPreferences` / `getConsent` touch `document.cookie` and `localStorage`.
 * Reading them during render would run them on every re-render, so the first
 * result is captured in a module-scoped cache and reused as the state seed.
 */
interface StoredConsent {
    status: CookieConsentStatus;
    prefs: CookiePreferences;
    analytics: boolean;
    thirdParty: boolean;
}

let storedConsent: StoredConsent | null = null;

const readStoredConsent = (): StoredConsent => {
    if (storedConsent) return storedConsent;
    const prefs = getPreferences();
    storedConsent = {
        status: getConsent(),
        prefs,
        analytics: prefs.analytics,
        thirdParty: prefs.thirdParty,
    };
    return storedConsent;
};

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initial = readStoredConsent();
    const [status, setStatus] = useState<CookieConsentStatus>(initial.status);
    const [prefs, setPrefs] = useState<CookiePreferences>(initial.prefs);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        /**
         * `index.html` sends Consent Mode v2 defaults with every ad signal denied.
         * Those defaults are only a starting point: without replaying the saved
         * decision here, a returning visitor who already accepted ads would stay
         * at denied and get downgraded to limited ads.
         */
        applyConsent(initial.analytics, initial.thirdParty);

        if (initial.status === 'unknown') {
            const timer = setTimeout(() => setShowBanner(true), 800);
            return () => clearTimeout(timer);
        }
    }, [initial]);

    /**
     * Loads the AdSense script for every visitor, consented or not.
     *
     * Consent gates the ad *signals*, not the ad *request*. `index.html` already
     * defaults `ad_storage`, `ad_user_data` and `ad_personalization` to denied,
     * so a visitor who rejects or never answers gets non-personalized (limited)
     * ads, and one who accepts gets personalized ads. Loading only after
     * "Accept All" meant most traffic saw no ads at all.
     */
    useEffect(() => {
        void loadAdSense();
    }, []);

    const acceptAll = useCallback(() => {
        const next = savePreferences({ ...ALLOW_ALL });
        setConsent(next);
        setStatus(next);
        setPrefs({ ...ALLOW_ALL });
        setShowBanner(false);
        applyConsent(true, true);
    }, []);

    const rejectNonEssential = useCallback(() => {
        const next = savePreferences({ ...ESSENTIAL_ONLY });
        setConsent(next);
        setStatus(next);
        setPrefs({ ...ESSENTIAL_ONLY });
        setShowBanner(false);
        applyConsent(false, false);
    }, []);

    const savePreference = useCallback((nextPrefs: CookiePreferences) => {
        const next = savePreferences(nextPrefs);
        setConsent(next);
        setStatus(next);
        setPrefs({ ...nextPrefs });
        setShowBanner(false);
        applyConsent(nextPrefs.analytics, nextPrefs.thirdParty);
    }, []);

    const resetPreference = useCallback(() => {
        resetConsent();
        setStatus('unknown');
        setPrefs({ ...ESSENTIAL_ONLY });
        setShowBanner(true);
        applyConsent(false, false);
    }, []);

    return (
        <CookieConsentContext.Provider value={{ status, prefs, showBanner, acceptAll, rejectNonEssential, savePreference, resetPreference }}>
            {children}
        </CookieConsentContext.Provider>
    );
};