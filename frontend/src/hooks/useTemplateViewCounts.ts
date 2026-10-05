import { useEffect, useSyncExternalStore } from 'react';
import {
    getComponentViewCountsSnapshot,
    getTemplateViewCountsSnapshot,
    loadComponentViewCounts,
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

export const useComponentViewCounts = (componentIds: readonly string[]) => {
    const idsKey = componentIds.join(',');
    const counts = useSyncExternalStore(
        subscribeTemplateViewCounts,
        getComponentViewCountsSnapshot,
        getComponentViewCountsSnapshot,
    );

    useEffect(() => {
        void loadComponentViewCounts(idsKey ? idsKey.split(',') : []);
    }, [idsKey]);

    return counts;
};
