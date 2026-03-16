import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ComponentItem } from '../data/componentData';

export const saveToFavorites = async (userId: string, component: ComponentItem) => {
    try {
        const favoriteRef = doc(db, 'favorites', `${userId}_${component.id}`);
        await setDoc(favoriteRef, {
            userId,
            componentId: component.id,
            componentName: component.title || 'Untitled',
            componentCode: component.code,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving favorite:", error);
    }
};

export const removeFromFavorites = async (userId: string, componentId: string) => {
    try {
        const favoriteRef = doc(db, 'favorites', `${userId}_${componentId}`);
        await deleteDoc(favoriteRef);
    } catch (error) {
        console.error("Error removing favorite:", error);
    }
};

export const getUserFavorites = (userId: string, callback: (favorites: any[]) => void) => {
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
        const favorites = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(favorites);
    });
};
