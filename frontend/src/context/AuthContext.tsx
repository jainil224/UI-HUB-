import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getApiBaseUrl } from '../utils/apiConfig';

interface AuthContextType {
    user: User | null;
    isPro: boolean;
    isElite: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isPro: false, isElite: false, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [isElite, setIsElite] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Guard: if Firebase auth isn't initialized yet, stop loading to prevent blank screen
        if (!auth) {
            console.warn('Firebase auth not initialized, rendering app without auth');
            setLoading(false);
            return;
        }
        
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            setUser(user);
            
            if (user) {
                console.log(`[Auth] User detected: ${user.email}. Fetching status...`);
                try {
                    const idToken = await user.getIdToken(true);
                    const apiBaseUrl = getApiBaseUrl();
                    
                    console.log(`[Auth] Fetching Pro status from ${apiBaseUrl}/api/v1/users/status`);
                    
                    const response = await fetch(`${apiBaseUrl}/api/v1/users/status`, {
                        headers: {
                            'Authorization': `Bearer ${idToken}`,
                            'Cache-Control': 'no-cache'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setIsPro(data.isPro);
                        // isElite is a higher tier — check for explicit field or fall back to isPro for legacy
                        setIsElite(data.isElite ?? false);
                        console.log(`[Auth] Pro status: ${data.isPro}, Elite status: ${data.isElite} for ${user.email}`);
                    } else {
                        const errorText = await response.text();
                        console.error(`[Auth] Status check (v1) failed with ${response.status}:`, errorText);
                        setIsPro(false);
                    }
                } catch (error) {
                    console.error('[Auth] Error fetching pro status:', error);
                    setIsPro(false);
                    setIsElite(false);
                }
            } else {
                setIsPro(false);
                setIsElite(false);
            }
            
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, isPro, isElite, loading }}>
            {/* Always render children immediately to unblock app mount */}
            {children}
            
            {/* Minimal overlay to show if auth is still resolving on initial load, only on protected or user-dependent pages if necessary. For now, we prefer speed. */}
        </AuthContext.Provider>
    );
};
