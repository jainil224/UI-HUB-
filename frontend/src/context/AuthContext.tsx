import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
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
    const [isPro, setIsPro] = useState(() => localStorage.getItem('ui-hub-pro') === 'true');
    const [isElite, setIsElite] = useState(() => localStorage.getItem('ui-hub-elite') === 'true');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 2. Handle Google/GitHub redirect results (crucial for mobile)
        const checkRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    console.log(`[Auth] Redirect result found: ${result.user.email}`);
                    setUser(result.user);
                    try {
                        const apiBaseUrl = getApiBaseUrl();
                        await fetch(`${apiBaseUrl}/api/v1/users/sync`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: result.user.email,
                                name: result.user.displayName || 'UI Challenger'
                            })
                        });
                        sessionStorage.setItem('ui-hub-show-welcome', 'true');
                    } catch (emailErr) {
                        console.error('[Auth] Failed to sync user on redirect:', emailErr);
                    }
                }
            } catch (error: any) {
                console.error('[Auth] Error getting redirect result:', error);
            }
        };

        checkRedirect();

        // 3. Main auth state observer
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            setUser(user);
            
            if (user) {
                console.log(`[Auth] User detected: ${user.email}. Fetching status...`);
                
                // 4. Synchronize user with backend
                // Previously gated by sessionStorage, now always attempted to ensure Firestore document exists
                try {
                    const apiBaseUrl = getApiBaseUrl();
                    console.log(`[Auth] Attempting sync for ${user.email} to ${apiBaseUrl}/api/v1/users/sync...`);
                    
                    const syncResponse = await fetch(`${apiBaseUrl}/api/v1/users/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.displayName || 'UI Challenger'
                        })
                    });
                    
                    if (syncResponse.ok) {
                        console.log(`[Auth] Sync successful for ${user.email}`);
                        sessionStorage.setItem(`ui-hub-synced-${user.uid}`, 'true');
                    } else {
                        const errorMsg = await syncResponse.text();
                        console.warn(`[Auth] Sync API returned error: ${syncResponse.status} - ${errorMsg}`);
                    }
                    
                    // First-time registration flags
                    const creationTime = new Date(user.metadata.creationTime || 0).getTime();
                    const lastSignInTime = new Date(user.metadata.lastSignInTime || 0).getTime();
                    const isNewUser = Math.abs(creationTime - lastSignInTime) < 5000; // 5s window
                    
                    if (isNewUser && !sessionStorage.getItem('ui-hub-show-welcome')) {
                        sessionStorage.setItem('ui-hub-is-new-user', 'true');
                        sessionStorage.setItem('ui-hub-show-welcome', 'true');
                    }
                } catch (syncErr) {
                    console.error('[Auth] Failed to reach sync endpoint:', syncErr);
                }

                try {
                    // Do not force refresh to keep execution snappy (use cached token)
                    const idToken = await user.getIdToken();
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
                        setIsElite(data.isElite ?? false);
                        localStorage.setItem('ui-hub-pro', String(data.isPro || false));
                        localStorage.setItem('ui-hub-elite', String(data.isElite || false));
                        console.log(`[Auth] Status Match: Pro=${data.isPro || false}, Elite=${data.isElite || false}`);
                    } else {
                        const errorText = await response.text();
                        console.error(`[Auth] Failed: ${response.status} - Status endpoint returned error:`, errorText);
                        setIsPro(false);
                        setIsElite(false);
                        localStorage.setItem('ui-hub-pro', 'false');
                        localStorage.setItem('ui-hub-elite', 'false');
                    }
                } catch (error) {
                    console.error('[Auth] Connection Failure: Could not reach status endpoint. Check VITE_API_URL and CORS.', error);
                    // Don't wipe storage on network failure, preserve offline optimism
                    setIsPro(localStorage.getItem('ui-hub-pro') === 'true');
                    setIsElite(localStorage.getItem('ui-hub-elite') === 'true');
                } finally {
                    setLoading(false);
                }
            } else {
                setIsPro(false);
                setIsElite(false);
                setLoading(false);
            }
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
