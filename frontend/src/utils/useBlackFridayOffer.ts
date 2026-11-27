import { useEffect, useState } from 'react';
import { isBlackFridayOfferActive } from './blackFridayOffer';

/** Re-evaluate the offer once per minute so it can appear/disappear live. */
const REFRESH_INTERVAL_MS = 60_000;

/**
 * React hook returning whether the Black Friday offer is currently active.
 *
 * Initializes from `isBlackFridayOfferActive(new Date())`, refreshes every
 * 60 seconds via `window.setInterval`, and clears the interval on unmount.
 */
export function useBlackFridayOffer(): boolean {
  const [isActive, setIsActive] = useState<boolean>(() => isBlackFridayOfferActive(new Date()));

  useEffect(() => {
    const update = () => setIsActive(isBlackFridayOfferActive(new Date()));
    const intervalId = window.setInterval(update, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  return isActive;
}
