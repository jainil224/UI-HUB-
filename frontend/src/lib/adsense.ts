/**
 * Google AdSense integration.
 *
 * The AdSense client ID (`ca-pub-...`) is a PUBLIC publisher identifier, not a
 * secret. It is safe to ship in the browser bundle and is documented as such in
 * `.uihub-agent/security/SECRET_HANDLING.md`. Never put AdSense account
 * credentials here - only the client ID and manual ad-unit slot IDs.
 *
 * The loader is not hardcoded in `index.html`. It is injected on demand from
 * `CookieConsentProvider` so a single place owns the script's lifecycle and dev
 * builds can never request it. It runs for every visitor regardless of cookie
 * consent: the Consent Mode v2 signals in `index.html` are what withhold
 * personalized ads, and Google serves non-personalized (limited) ads while those
 * signals are denied. Gating the script on consent instead meant most traffic
 * saw no ads at all.
 */

const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

declare global {
    interface Window {
        adsbygoogle?: unknown[];
    }
}

/** Public publisher ID. Overridable so deployments can set VITE_ADSENSE_CLIENT_ID. */
export const ADSENSE_CLIENT_ID: string =
    String(import.meta.env.VITE_ADSENSE_CLIENT_ID || '') || 'ca-pub-1145682845044583';

/** Identifies each manual ad placement. Adding a placement means adding a key here. */
export type AdSlotId =
    | 'home-after-stats'
    | 'home-after-categories'
    | 'home-explore'
    | 'templates-top'
    | 'template-detail-bottom'
    | 'library-sidebar'
    | 'component-between-tools-prompt'
    | 'component-before-source'
    | 'component-bottom';

/**
 * Manual ad-unit IDs from the AdSense dashboard (AdSense -> Ads -> Ad units).
 *
 * These are intentionally empty until the real unit IDs are pasted in. An empty
 * ID makes the placement render as inert reserved space instead of requesting an
 * invalid ad, so the layout is stable before and after the IDs land.
 */
export const AD_SLOT_IDS: Record<AdSlotId, string> = {
    'home-after-stats': '1027542522',
    'home-after-categories': '8331317476',
    'home-explore': '7157836600',
    'templates-top': '4531673262',
    'template-detail-bottom': '5705154132',
    'library-sidebar': '3431353743',
    'component-between-tools-prompt': '7932696372',
    'component-before-source': '5140021238',
    'component-bottom': '6428043012',
};

/**
 * True when ads may run at all: production builds only.
 *
 * Local development never requests Google's ad servers, so dev traffic cannot
 * contaminate AdSense reporting or register as invalid traffic.
 */
export const isAdSenseEnabled = (): boolean => import.meta.env.PROD;

/** Resolves the real ad-unit ID for a placement, or '' when it is not configured yet. */
export const getAdUnitId = (slot: AdSlotId): string => AD_SLOT_IDS[slot] || '';

export interface AdSlotRequestableInput {
    adsEnabled: boolean;
    isPro: boolean;
    adUnitId: string;
}

/**
 * Whether a placement is allowed to request an ad.
 *
 * Cookie consent is deliberately NOT an input. Consent gates the ad *signals*
 * (`buildConsentSignals`), and Google serves non-personalized (limited) ads while
 * `ad_storage` / `ad_user_data` / `ad_personalization` are denied. Adding a
 * consent flag back here silently removes every ad for visitors who decline -
 * which is most traffic - so the input list stays this short on purpose.
 */
export const isAdSlotRequestable = ({ adsEnabled, isPro, adUnitId }: AdSlotRequestableInput): boolean =>
    adsEnabled && !isPro && adUnitId !== '';

let loaderPromise: Promise<void> | null = null;

/**
 * Injects `adsbygoogle.js` once and resolves when it has loaded.
 *
 * Idempotent: repeat calls share the first promise. The onerror path clears
 * `loaderPromise` so a later consent change can retry rather than staying
 * permanently broken.
 */
export const loadAdSense = (): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve();
    if (!isAdSenseEnabled()) return Promise.resolve();
    if (loaderPromise) return loaderPromise;

    loaderPromise = new Promise<void>((resolve) => {
        if (document.querySelector(`script[src^="${ADSENSE_SRC}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = `${ADSENSE_SRC}?client=${encodeURIComponent(ADSENSE_CLIENT_ID)}`;
        script.onload = () => resolve();
        script.onerror = () => {
            console.warn('[AdSense] Loader script failed to load.');
            loaderPromise = null;
            resolve();
        };
        document.head.appendChild(script);
    });

    return loaderPromise;
};

/**
 * Signals that an `<ins class="adsbygoogle">` element is in the DOM and ready.
 *
 * Calls made before `adsbygoogle.js` finishes loading are queued by the library,
 * so ordering between this and `loadAdSense()` does not matter.
 */
export const pushAdRequest = (): void => {
    if (typeof window === 'undefined') return;
    try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.warn('[AdSense] Failed to push ad request:', e);
    }
};

/**
 * Test seam: drops the memoized loader so a suite can exercise injection again.
 * Not used by application code.
 */
export const __resetAdSenseLoaderForTests = (): void => {
    loaderPromise = null;
};