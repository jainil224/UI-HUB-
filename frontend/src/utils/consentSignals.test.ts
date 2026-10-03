import { describe, it, expect } from 'vitest';
import { buildConsentSignals } from './cookieUtils';

/**
 * Regression guard for the Google AdSense consent wiring.
 *
 * Before AdSense existed, all four Consent Mode v2 signals were driven by the
 * single `analytics` preference, so the `thirdParty` toggle controlled nothing.
 * These tests pin the corrected mapping: the ad signals must follow
 * `thirdParty`, independently of `analytics`.
 */
describe('buildConsentSignals', () => {
    it('grants ad signals only when third-party cookies are allowed', () => {
        expect(buildConsentSignals(false, true)).toEqual({
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'denied',
        });
    });

    it('denies ad signals when third-party cookies are refused, even with analytics on', () => {
        // The exact bug: analytics consent must never imply ad consent.
        expect(buildConsentSignals(true, false)).toEqual({
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted',
        });
    });

    it('grants everything when both preferences are accepted', () => {
        expect(buildConsentSignals(true, true)).toEqual({
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted',
        });
    });

    it('denies everything under essential-only', () => {
        expect(buildConsentSignals(false, false)).toEqual({
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
        });
    });

    it('keeps the three ad signals in agreement with each other', () => {
        for (const analytics of [true, false]) {
            for (const thirdParty of [true, false]) {
                const signals = buildConsentSignals(analytics, thirdParty);
                expect(signals.ad_storage).toBe(signals.ad_user_data);
                expect(signals.ad_user_data).toBe(signals.ad_personalization);
            }
        }
    });
});