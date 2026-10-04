import React, { useEffect, useRef, useState } from 'react';
import { useCookieConsent } from '../../context/CookieConsentContext';
import { useAuth } from '../../context/AuthContext';
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
    /** When true, hides the inner "Advertisement" label (use when the parent card already labels it). */
    hideLabel?: boolean;
}

const DEFAULT_MIN_HEIGHT = 280;

/**
 * A single Google AdSense placement.
 *
 * - Returns null when ads are disabled, Pro user, or consent not given.
 * - Collapses automatically when Google sets data-ad-status="unfilled".
 * - Falls back to collapse after 5 s if Google never responds (new ad unit warmup).
 */
const AdSlot: React.FC<AdSlotProps> = ({
    slot,
    minHeight = DEFAULT_MIN_HEIGHT,
    className = '',
    hideLabel = false,
}) => {
    const { prefs } = useCookieConsent();
    const { isPro } = useAuth();
    const requested = useRef(false);
    const insRef = useRef<HTMLModElement>(null);
    // null = waiting, true = filled, false = unfilled/collapsed
    const [filled, setFilled] = useState<boolean | null>(null);

    const adUnitId = getAdUnitId(slot);
    // Pro subscribers are ad-free — never show ads to paying users.
    const enabled = isAdSenseEnabled() && !isPro && prefs.thirdParty && adUnitId !== '';

    useEffect(() => {
        if (!enabled) {
            requested.current = false;
            setFilled(null);
            return;
        }

        let cancelled = false;
        loadAdSense().then(() => {
            if (cancelled || requested.current) return;
            requested.current = true;
            pushAdRequest();
        });

        return () => {
            cancelled = true;
        };
    }, [enabled]);

    // Watch for Google setting data-ad-status on the <ins> element.
    useEffect(() => {
        if (!enabled) return;
        const ins = insRef.current;
        if (!ins) return;

        const check = () => {
            const status = ins.getAttribute('data-ad-status');
            if (status === 'unfilled') setFilled(false);
            else if (status === 'filled') setFilled(true);
        };

        check();

        const observer = new MutationObserver(check);
        observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });

        // Collapse after 8 s if Google never responds (new unit still warming up).
        const timeout = setTimeout(() => {
            setFilled(prev => (prev === null ? false : prev));
        }, 8000);

        return () => {
            observer.disconnect();
            clearTimeout(timeout);
        };
    }, [enabled]);

    // Collapse when disabled or explicitly unfilled.
    if (!enabled || filled === false) return null;

    return (
        <aside
            className={`w-full ${className}`}
            aria-label="Advertisement"
            style={{ minHeight: `${minHeight}px` }}
        >
            {!hideLabel && (
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    Advertisement
                </p>
            )}
            <ins
                ref={insRef}
                className="adsbygoogle"
                style={{ display: 'block', minHeight: `${minHeight - (hideLabel ? 0 : 20)}px` }}
                data-ad-client={ADSENSE_CLIENT_ID}
                data-ad-slot={adUnitId}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </aside>
    );
};

export default AdSlot;