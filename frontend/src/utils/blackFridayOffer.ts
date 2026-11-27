/**
 * Black Friday offer timing helpers.
 *
 * Black Friday is the Friday after U.S. Thanksgiving — i.e. the Friday
 * following the 4th Thursday of November. The promotional offer is active
 * for the full UTC day: from 00:00:00.000 UTC on Black Friday until
 * 00:00:00.000 UTC on the following day (the next UTC midnight).
 */

const MIN_YEAR = 1000;
const MAX_YEAR = 9999;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const NOVEMBER = 10; // Date#getUTCMonth / Date.UTC month index is zero-based (November = 10).
const THURSDAY = 4; // Date#getUTCDay(): 0 = Sunday, 4 = Thursday.
const DAYS_PER_WEEK = 7;
const FOURTH_OCCURRENCE_OFFSET = 3 * DAYS_PER_WEEK; // 3 full weeks after the 1st occurrence.
const BLACK_FRIDAY_OFFSET = 1; // Black Friday is the day after the 4th Thursday.

/**
 * Returns Black Friday (the Friday following the 4th Thursday of November)
 * at 00:00:00.000 UTC for the given year.
 *
 * @param year Four-digit integer year between 1000 and 9999 (inclusive).
 * @throws {RangeError} If `year` is not an integer or is outside 1000-9999.
 */
export function getBlackFridayUtc(year: number): Date {
  if (typeof year !== 'number' || !Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    throw new RangeError(
      `Invalid year: ${String(year)}. Expected an integer between ${MIN_YEAR} and ${MAX_YEAR}.`,
    );
  }

  // Day-of-month (1-based) of November 1st.
  const novemberFirst = new Date(Date.UTC(year, NOVEMBER, 1, 0, 0, 0, 0));
  const novemberFirstWeekday = novemberFirst.getUTCDay();

  // Days from November 1st to the first Thursday in November.
  const daysUntilFirstThursday = (THURSDAY - novemberFirstWeekday + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  const firstThursdayDate = 1 + daysUntilFirstThursday;

  // 4th Thursday (Thanksgiving) then Black Friday on the following day.
  const fourthThursdayDate = firstThursdayDate + FOURTH_OCCURRENCE_OFFSET;
  const blackFridayDate = fourthThursdayDate + BLACK_FRIDAY_OFFSET;

  return new Date(Date.UTC(year, NOVEMBER, blackFridayDate, 0, 0, 0, 0));
}

/**
 * Returns the UTC epoch milliseconds at which the current year's Black Friday
 * offer ends: 00:00:00.000 UTC on the day after Black Friday.
 *
 * Returns `NaN` for invalid dates (non-Date values, `Invalid Date`, or years
 * outside the supported range), matching `Date#getTime` failure semantics.
 *
 * @param date Reference date; its UTC year selects the offer window.
 */
export function getBlackFridayOfferEndMs(date: Date = new Date()): number {
  const timeMs = date instanceof Date ? date.getTime() : Number.NaN;
  if (Number.isNaN(timeMs)) return Number.NaN;

  const year = date.getUTCFullYear();
  if (year < MIN_YEAR || year > MAX_YEAR) return Number.NaN;

  return getBlackFridayUtc(year).getTime() + MILLISECONDS_PER_DAY;
}

/**
 * Returns `true` while the Black Friday offer is active: from Black Friday
 * 00:00:00.000 UTC inclusive until the next UTC midnight exclusive.
 *
 * Returns `false` before the offer starts, at/after it ends, and for invalid
 * dates (e.g. `new Date(NaN)`).
 */
export function isBlackFridayOfferActive(date: Date = new Date()): boolean {
  if (!(date instanceof Date)) {
    return false;
  }

  const timeMs = date.getTime();
  if (Number.isNaN(timeMs)) {
    return false;
  }

  const year = date.getUTCFullYear();
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return false;
  }

  const startMs = getBlackFridayUtc(year).getTime();
  const endMs = startMs + MILLISECONDS_PER_DAY;

  return timeMs >= startMs && timeMs < endMs;
}
