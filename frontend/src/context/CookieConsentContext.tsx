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
} from '../utils/cookieUtils';
import { enableAnalytics, disableAnalytics } from '../lib/firebase';

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

const updateGtagConsent = (analyticsStorage: 'granted' | 'denied') => {
    if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        const gtag = window.gtag;
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': analyticsStorage,
                'ad_user_data': analyticsStorage,
                'ad_personalization': analyticsStorage,
                'analytics_storage': analyticsStorage,
            });
        } else {
            window.dataLayer.push({
                event: 'consent_update',
                consent: { ...(analyticsStorage === 'granted' ? { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' } : { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }) },
            });
        }
    }
};

const applyAnalytics = (analyticsAllowed: boolean) => {
    if (analyticsAllowed) {
        updateGtagConsent('granted');
        enableAnalytics();
    } else {
        updateGtagConsent('denied');
        disableAnalytics();
    }
};

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<CookieConsentStatus>('unknown');
    const [prefs, setPrefs] = useState<CookiePreferences>({ ...ESSENTIAL_ONLY });
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const existing = getConsent();
        setStatus(existing);
        setPrefs(getPreferences());
        if (existing === 'unknown') {
            const timer = setTimeout(() => setShowBanner(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptAll = useCallback(() => {
        const next = savePreferences({ ...ALLOW_ALL });
        setConsent(next);
        setStatus(next);
        setPrefs({ ...ALLOW_ALL });
        setShowBanner(false);
        applyAnalytics(true);
    }, []);

    const rejectNonEssential = useCallback(() => {
        const next = savePreferences({ ...ESSENTIAL_ONLY });
        setConsent(next);
        setStatus(next);
        setPrefs({ ...ESSENTIAL_ONLY });
        setShowBanner(false);
        applyAnalytics(false);
    }, []);

    const savePreference = useCallback((nextPrefs: CookiePreferences) => {
        const next = savePreferences(nextPrefs);
        setConsent(next);
        setStatus(next);
        setPrefs({ ...nextPrefs });
        setShowBanner(false);
        applyAnalytics(nextPrefs.analytics);
    }, []);

    const resetPreference = useCallback(() => {
        resetConsent();
        setStatus('unknown');
        setPrefs({ ...ESSENTIAL_ONLY });
        setShowBanner(true);
        applyAnalytics(false);
    }, []);

    return (
        <CookieConsentContext.Provider value={{ status, prefs, showBanner, acceptAll, rejectNonEssential, savePreference, resetPreference }}>
            {children}
        </CookieConsentContext.Provider>
    );
};