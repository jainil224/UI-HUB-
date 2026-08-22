import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ComponentItem } from '../data/componentData';

const GUEST_FAVORITES_KEY = 'ui_hub_guest_favorites';

export interface FavoriteItem {
    id: string;
    userId?: string;
    componentId: string;
    componentName: string;
    componentCode?: string;
    category?: string;
    createdAt?: any;
}

export const getGuestFavorites = (): FavoriteItem[] => {
    try {
        const raw = localStorage.getItem(GUEST_FAVORITES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map(item => {
                if (typeof item === 'string') {
                    return { id: item, componentId: item, componentName: item };
                }
                return item;
            });
        }
        return [];
    } catch {
        return [];
    }
};

const setGuestFavorites = (favorites: FavoriteItem[]) => {
    try {
        localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
        console.error("Failed to save guest favorites to localStorage:", e);
    }
};

export const saveToFavorites = async (userId: string | undefined | null, component: ComponentItem) => {
    const favoriteItem: FavoriteItem = {
        id: component.id,
        componentId: component.id,
        componentName: component.title || 'Untitled',
        componentCode: typeof component.code === 'string' ? component.code : '',
        category: component.category || 'custom'
    };

    // Save locally
    const currentLocal = getGuestFavorites();
    if (!currentLocal.some(f => f.componentId === component.id)) {
        setGuestFavorites([favoriteItem, ...currentLocal]);
    }

    // Save to Firebase if user is logged in
    if (userId && db) {
        try {
            const favoriteRef = doc(db, 'favorites', `${userId}_${component.id}`);
            await setDoc(favoriteRef, {
                userId,
                componentId: component.id,
                componentName: component.title || 'Untitled',
                componentCode: typeof component.code === 'string' ? component.code : '',
                category: component.category || 'custom',
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving favorite to Firebase:", error);
        }
    }
};

export const removeFromFavorites = async (userId: string | undefined | null, componentId: string) => {
    // Remove locally
    const currentLocal = getGuestFavorites();
    setGuestFavorites(currentLocal.filter(f => f.componentId !== componentId));

    // Remove from Firebase if user is logged in
    if (userId && db) {
        try {
            const favoriteRef = doc(db, 'favorites', `${userId}_${componentId}`);
            await deleteDoc(favoriteRef);
        } catch (error) {
            console.error("Error removing favorite from Firebase:", error);
        }
    }
};

export const getUserFavorites = (userId: string | undefined | null, callback: (favorites: FavoriteItem[]) => void) => {
    if (!userId || !db) {
        const localFavs = getGuestFavorites();
        callback(localFavs);
        // Custom event listener so other tabs/components update when guest favorites change
        const handleStorage = () => callback(getGuestFavorites());
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }

    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
        const favorites = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FavoriteItem[];

        // Sync local guest cache
        setGuestFavorites(favorites);
        callback(favorites);
    }, (error) => {
        console.error("Error fetching user favorites from Firebase:", error);
        callback(getGuestFavorites());
    });
};
