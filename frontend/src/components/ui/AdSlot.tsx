import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    ADSENSE_CLIENT_ID,
    getAdUnitId,
    isAdSenseEnabled,
    isAdSlotRequestable,
    loadAdSense,
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
 * - Renders regardless of cookie consent. Consent is handled by Consent Mode v2
 *   signals, so a visitor who rejects or ignores the banner still gets
 *   non-personalized (limited) ads.
 * - Returns null when ads are disabled, the visitor is Pro, or the slot is
 *   unconfigured.
 * - Collapses automatically when Google sets data-ad-status="unfilled".
 * - Falls back to collapse after 8 s if Google never responds (new ad unit warmup).
 *
 * FIX: pushAdRequest is now called AFTER the <ins> element is mounted in the DOM,
 * not immediately when loadAdSense resolves. Each slot independently manages
 * its own push so multiple slots per page all work correctly.
 */
const AdSlot: React.FC<AdSlotProps> = ({
    slot,
    minHeight = DEFAULT_MIN_HEIGHT,
    className = '',
    hideLabel = false,
}) => {
    const { isPro } = useAuth();
    const insRef = useRef<HTMLModElement>(null);
    const pushed = useRef(false);
    // null = waiting, true = filled, false = unfilled/collapsed
    const [filled, setFilled] = useState<boolean | null>(null);
    const [scriptReady, setScriptReady] = useState(false);

    const adUnitId = getAdUnitId(slot);
    // Pro subscribers are ad-free — never show ads to paying users.
    const enabled = isAdSlotRequestable({ adsEnabled: isAdSenseEnabled(), isPro, adUnitId });

    // Step 1: load the AdSense script. AdSense itself is consent-agnostic here.
    useEffect(() => {
        if (!enabled) {
            pushed.current = false;
            setFilled(null);
            setScriptReady(false);
            return;
        }

        let cancelled = false;
        loadAdSense().then(() => {
            if (!cancelled) setScriptReady(true);
        });

        return () => {
            cancelled = true;
        };
    }, [enabled]);

    // Step 2: once the script is ready AND the <ins> is in the DOM, push the ad request.
    // This is the critical fix: push() must happen AFTER the <ins> element exists in DOM.
    useEffect(() => {
        if (!scriptReady || !enabled || pushed.current) return;
        const ins = insRef.current;
        if (!ins) return;

        pushed.current = true;
        try {
            (window.adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (e) {
            console.warn('[AdSense] Failed to push ad request:', e);
        }
    }, [scriptReady, enabled]);

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
    }, [enabled, scriptReady]);

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