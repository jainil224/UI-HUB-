import { describe, it, expect } from 'vitest';
import { AD_SLOT_IDS, getAdUnitId, isAdSlotRequestable, type AdSlotId } from './adsense';

/**
 * Regression guard for the "no ads unless Accept All" bug.
 *
 * `AdSlot` used to render only when the visitor allowed third-party cookies, so
 * anyone who declined - or simply never answered the banner - saw an empty
 * library. The fix moved consent out of the render decision entirely: Consent
 * Mode v2 signals decide whether an ad is personalised, not whether it exists.
 */
describe('isAdSlotRequestable', () => {
    const allowed = { adsEnabled: true, isPro: false, adUnitId: '6428043012' };

    it('allows a placement for a free visitor in production', () => {
        expect(isAdSlotRequestable(allowed)).toBe(true);
    });

    it('never shows ads to Pro subscribers', () => {
        expect(isAdSlotRequestable({ ...allowed, isPro: true })).toBe(false);
    });

    it('never requests ads outside production', () => {
        // Local dev must not hit Google and contaminate AdSense reporting.
        expect(isAdSlotRequestable({ ...allowed, adsEnabled: false })).toBe(false);
    });

    it('does not request an ad for an unconfigured slot', () => {
        expect(isAdSlotRequestable({ ...allowed, adUnitId: '' })).toBe(false);
    });

    it('takes no consent argument, so consent cannot gate rendering again', () => {
        // One destructured parameter: adding a `consented` flag would make this 2
        // and fail, which is the point of the assertion.
        expect(isAdSlotRequestable.length).toBe(1);
    });
});

describe('ad slot configuration', () => {
    it('maps every declared slot to a configured unit ID', () => {
        for (const slot of Object.keys(AD_SLOT_IDS) as AdSlotId[]) {
            expect(getAdUnitId(slot), `${slot} must have an ad unit ID`).not.toBe('');
        }
    });

    it('covers the three component-detail placements', () => {
        expect(getAdUnitId('component-between-tools-prompt')).toBe('7932696372');
        expect(getAdUnitId('component-before-source')).toBe('5140021238');
        expect(getAdUnitId('component-bottom')).toBe('6428043012');
    });

    it('returns an empty ID for an unknown slot', () => {
        expect(getAdUnitId('not-a-slot' as AdSlotId)).toBe('');
    });
});
