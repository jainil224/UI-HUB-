import { useEffect, useSyncExternalStore } from 'react';
import {
    getTemplateViewCountsSnapshot,
    loadTemplateViewCounts,
    subscribeTemplateViewCounts,
} from '../services/templateViews';

export const useTemplateViewCounts = (templateIds: readonly string[]) => {
    const idsKey = templateIds.join(',');
    const counts = useSyncExternalStore(
        subscribeTemplateViewCounts,
        getTemplateViewCountsSnapshot,
        getTemplateViewCountsSnapshot,
    );

    useEffect(() => {
        void loadTemplateViewCounts(idsKey ? idsKey.split(',') : []);
    }, [idsKey]);

    return counts;
};
