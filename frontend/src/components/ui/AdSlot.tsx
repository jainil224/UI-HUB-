import React, { useEffect, useRef } from 'react';
import { useCookieConsent } from '../../context/CookieConsentContext';
import {
    ADSENSE_CLIENT_ID,
    getAdUnitId,
    isAdSenseEnabled,
    loadAdSense,
    pushAdRequest,
    type AdSlotId,
} from '../../lib/adsense';

interface AdSlotProps {
    /** Which placement this is; its ad-unit ID comes from `AD_SLOT_IDS`. */
    slot: AdSlotId;
    /**
     * Height reserved before the creative arrives. Keeps the page from shifting
     * when the ad fills in, which would otherwise move whatever the visitor is
     * reading.
     */
    minHeight?: number;
    className?: string;
}

const DEFAULT_MIN_HEIGHT = 280;

/**
 * A single Google AdSense placement.
 *
 * Renders nothing at all unless ads can actually run, so visitors who decline
 * third-party cookies - and every local dev session - get no empty gaps. Once
 * enabled the space is reserved up front, which is what prevents layout shift.
 *
 * Ad-unit IDs default to empty in `AD_SLOT_IDS`; until the real IDs from the
 * AdSense dashboard are pasted in, every placement stays inert and this returns
 * null. That is deliberate: an empty unit ID must never issue a live ad request.
 */
const AdSlot: React.FC<AdSlotProps> = ({
    slot,
    minHeight = DEFAULT_MIN_HEIGHT,
    className = '',
}) => {
    const { prefs } = useCookieConsent();
    const requested = useRef(false);

    const adUnitId = getAdUnitId(slot);
    const enabled = isAdSenseEnabled() && prefs.thirdParty && adUnitId !== '';

    useEffect(() => {
        if (!enabled) {
            // Allows a fresh push if consent is granted again later: that mounts a
            // brand new <ins> element, which needs its own request.
            requested.current = false;
            return;
        }

        let cancelled = false;
        loadAdSense().then(() => {
            // React 19 StrictMode invokes effects twice in development. Without
            // this guard the same placement would request two ads.
            if (cancelled || requested.current) return;
            requested.current = true;
            pushAdRequest();
        });

        return () => {
            cancelled = true;
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <aside
            className={`w-full ${className}`}
            aria-label="Advertisement"
            style={{ minHeight: `${minHeight}px` }}
        >
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Advertisement
            </p>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={ADSENSE_CLIENT_ID}
                data-ad-slot={adUnitId}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </aside>
    );
};

export default AdSlot;