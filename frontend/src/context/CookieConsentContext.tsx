import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getConsent, setConsent, resetConsent, type CookieConsentStatus } from '../utils/cookieUtils';
import { enableAnalytics } from '../lib/firebase';

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

interface CookieConsentContextType {
    status: CookieConsentStatus;
    showBanner: boolean;
    acceptAll: () => void;
    rejectNonEssential: () => void;
    resetPreference: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType>({
    status: 'unknown',
    showBanner: false,
    acceptAll: () => {},
    rejectNonEssential: () => {},
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

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<CookieConsentStatus>('unknown');
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const existing = getConsent();
        setStatus(existing);
        if (existing === 'unknown') {
            const timer = setTimeout(() => setShowBanner(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptAll = useCallback(() => {
        setConsent('accepted');
        setStatus('accepted');
        setShowBanner(false);
        updateGtagConsent('granted');
        enableAnalytics();
    }, []);

    const rejectNonEssential = useCallback(() => {
        setConsent('essential');
        setStatus('essential');
        setShowBanner(false);
        updateGtagConsent('denied');
    }, []);

    const resetPreference = useCallback(() => {
        resetConsent();
        setStatus('unknown');
        setShowBanner(true);
        updateGtagConsent('denied');
    }, []);

    return (
        <CookieConsentContext.Provider value={{ status, showBanner, acceptAll, rejectNonEssential, resetPreference }}>
            {children}
        </CookieConsentContext.Provider>
    );
};