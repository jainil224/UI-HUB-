import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getApiBaseUrl } from '../utils/apiConfig';

interface AuthContextType {
    user: User | null;
    isPro: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isPro: false, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isPro, setIsPro] = useState(false);
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
                        console.log(`[Auth] Fetched Pro status: ${data.isPro}`);
                    } else {
                        const errorText = await response.text();
                        console.error(`[Auth] Status fetch failed with ${response.status}:`, errorText);
                        setIsPro(false);
                    }
                } catch (error) {
                    console.error('[Auth] Error fetching pro status:', error);
                    setIsPro(false);
                }
            } else {
                setIsPro(false);
            }
            
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, isPro, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
