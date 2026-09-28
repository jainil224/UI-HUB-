/** Components added recently show an auto-expiring "NEW" badge.
 *  Default lifetime: 4 months — overridable per item via newBadgeDays. */
export const NEW_BADGE_DEFAULT_DAYS = 120;

export const isNewComponent = (item: { addedAt?: string; newBadgeDays?: number }): boolean => {
    if (!item.addedAt) return false;
    const added = new Date(item.addedAt).getTime();
    if (Number.isNaN(added)) return false;
    const durationMs = (item.newBadgeDays ?? NEW_BADGE_DEFAULT_DAYS) * 24 * 60 * 60 * 1000;
    return Date.now() - added < durationMs;
};
