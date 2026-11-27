import { describe, expect, it } from 'vitest';
import { getBlackFridayOfferEndMs, getBlackFridayUtc, isBlackFridayOfferActive } from './blackFridayOffer';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

describe('getBlackFridayUtc', () => {
  it.each([
    [2024, '2024-11-29T00:00:00.000Z'],
    [2025, '2025-11-28T00:00:00.000Z'],
    [2026, '2026-11-27T00:00:00.000Z'],
  ])('returns Black Friday at 00:00:00 UTC for %i -> %s', (year, expectedIso) => {
    const result = getBlackFridayUtc(year);
    expect(result.toISOString()).toBe(expectedIso);
    // Black Friday must land on a Friday at UTC midnight.
    expect(result.getUTCDay()).toBe(5);
    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
    expect(result.getUTCMilliseconds()).toBe(0);
  });

  it('throws a RangeError for non-integer years', () => {
    for (const year of [2024.5, 2024.0001, NaN, Infinity, -Infinity, 0.5]) {
      expect(() => getBlackFridayUtc(year)).toThrow(RangeError);
    }
  });

  it('throws a RangeError for years outside 1000-9999', () => {
    for (const year of [0, 1, 999, -1, -1000, 10000, 99999, -99999]) {
      expect(() => getBlackFridayUtc(year)).toThrow(RangeError);
    }
  });

  it('accepts the boundary years 1000 and 9999', () => {
    expect(() => getBlackFridayUtc(1000)).not.toThrow();
    expect(() => getBlackFridayUtc(9999)).not.toThrow();
  });

  it('throws a clear RangeError message', () => {
    expect(() => getBlackFridayUtc(12345)).toThrow(/Invalid year.*1000.*9999/);
    expect(() => getBlackFridayUtc(2024.5)).toThrow(RangeError);
  });
});

describe('isBlackFridayOfferActive', () => {
  const blackFriday2024 = getBlackFridayUtc(2024); // 2024-11-29T00:00:00.000Z
  const startMs = blackFriday2024.getTime();
  const endMs = startMs + MILLISECONDS_PER_DAY; // next UTC midnight

  it('is active at Black Friday UTC start (inclusive)', () => {
    expect(isBlackFridayOfferActive(new Date(startMs))).toBe(true);
  });

  it('is active at end-minus-1ms', () => {
    expect(isBlackFridayOfferActive(new Date(endMs - 1))).toBe(true);
  });

  it('is inactive 1ms before start', () => {
    expect(isBlackFridayOfferActive(new Date(startMs - 1))).toBe(false);
  });

  it('is inactive exactly at next UTC midnight', () => {
    expect(isBlackFridayOfferActive(new Date(endMs))).toBe(false);
  });

  it('is inactive before Black Friday', () => {
    expect(isBlackFridayOfferActive(new Date(startMs - MILLISECONDS_PER_DAY))).toBe(false);
  });

  it('is inactive after Black Friday', () => {
    expect(isBlackFridayOfferActive(new Date(endMs + 1))).toBe(false);
  });

  it('returns false for an invalid date', () => {
    expect(isBlackFridayOfferActive(new Date(NaN))).toBe(false);
    expect(isBlackFridayOfferActive(new Date('not a real date'))).toBe(false);
  });

  it('defaults to the current time when no argument is provided', () => {
    // Just assert it returns a boolean without throwing.
    expect(typeof isBlackFridayOfferActive()).toBe('boolean');
  });
});

describe('getBlackFridayOfferEndMs', () => {
  it.each([
    [2024, '2024-11-30T00:00:00.000Z'],
    [2025, '2025-11-29T00:00:00.000Z'],
    [2026, '2026-11-28T00:00:00.000Z'],
  ])('returns the next UTC midnight after Black Friday %i', (year, expectedIso) => {
    const result = getBlackFridayOfferEndMs(new Date(Date.UTC(year, 10, 1)));
    expect(new Date(result).toISOString()).toBe(expectedIso);
  });

  it('matches the end boundary used by isBlackFridayOfferActive', () => {
    const endMs = getBlackFridayOfferEndMs(new Date('2024-11-29T12:00:00.000Z'));
    expect(isBlackFridayOfferActive(new Date(endMs - 1))).toBe(true);
    expect(isBlackFridayOfferActive(new Date(endMs))).toBe(false);
  });

  it('returns NaN for invalid dates', () => {
    expect(Number.isNaN(getBlackFridayOfferEndMs(new Date(NaN)))).toBe(true);
    expect(Number.isNaN(getBlackFridayOfferEndMs(new Date('not a real date')))).toBe(true);
  });
});
