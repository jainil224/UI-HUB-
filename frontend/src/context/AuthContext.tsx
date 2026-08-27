import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getApiBaseUrl } from '../utils/apiConfig';
import { syncUserWithBackend } from '../utils/syncUser';
import WelcomeNotifications from '../components/ui/WelcomeNotifications';

let syncedThisSession = false;

interface WelcomeEvent {
    name?: string;
    email?: string;
    seq: number;
}

interface AuthContextType {
    user: User | null;
    isPro: boolean;
    isElite: boolean;
    loading: boolean;
    refreshProStatus: () => Promise<{ isPro: boolean; isElite: boolean } | null>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isPro: false,
    isElite: false,
    loading: true,
    refreshProStatus: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isPro, setIsPro] = useState(() => localStorage.getItem('ui-hub-pro') === 'true');
    const [isElite, setIsElite] = useState(() => localStorage.getItem('ui-hub-elite') === 'true');
    const [loading, setLoading] = useState(true);
    const [welcome, setWelcome] = useState<WelcomeEvent | null>(null);
    const welcomeFiredForRef = useRef<string | null>(null);

    const fireWelcome = (u: User) => {
        if (welcomeFiredForRef.current === u.uid) return;
        welcomeFiredForRef.current = u.uid;
        try {
            const creationTime = new Date(u.metadata.creationTime || 0).getTime();
            const lastSignInTime = new Date(u.metadata.lastSignInTime || 0).getTime();
            const isNewUser = Math.abs(creationTime - lastSignInTime) < 5000;
            if (isNewUser) {
                setWelcome({
                    name: u.displayName || undefined,
                    email: u.email || undefined,
                    seq: Date.now(),
                });
            }
        } catch (err) {
            console.error('[Auth] New user detection failed:', err);
        }
    };

    const refreshProStatus = useCallback(async (): Promise<{ isPro: boolean; isElite: boolean } | null> => {
        const currentUser = auth.currentUser;
        if (!currentUser) return null;

        try {
            // Do not force refresh to keep execution snappy (use cached token)
            const idToken = await currentUser.getIdToken();
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
                console.log('[Auth] API Status Response:', data);
                setIsPro(data.isPro);
                setIsElite(data.isElite ?? false);
                localStorage.setItem('ui-hub-pro', String(data.isPro || false));
                localStorage.setItem('ui-hub-elite', String(data.isElite || false));
                console.log(`[Auth] Status Match: Pro=${data.isPro || false}, Elite=${data.isElite || false}`);
                return { isPro: !!data.isPro, isElite: !!data.isElite };
            } else {
                const errorText = await response.text();
                console.error(`[Auth] Failed: ${response.status} - Status endpoint returned error:`, errorText);
                setIsPro(false);
                setIsElite(false);
                localStorage.setItem('ui-hub-pro', 'false');
                localStorage.setItem('ui-hub-elite', 'false');
                return { isPro: false, isElite: false };
            }
        } catch (error) {
            console.error('[Auth] Connection Failure: Could not reach status endpoint. Check VITE_API_URL and CORS.', error);
            // Don't wipe storage on network failure, preserve offline optimism
            setIsPro(localStorage.getItem('ui-hub-pro') === 'true');
            setIsElite(localStorage.getItem('ui-hub-elite') === 'true');
            return {
                isPro: localStorage.getItem('ui-hub-pro') === 'true',
                isElite: localStorage.getItem('ui-hub-elite') === 'true',
            };
        }
    }, []);

    useEffect(() => {
        const checkRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    console.log(`[Auth] Redirect result found: ${result.user.email}`);
                    setUser(result.user);
                    fireWelcome(result.user);
                    if (!syncedThisSession) {
                        syncedThisSession = true;
                        await syncUserWithBackend(result.user);
                    }
                    sessionStorage.setItem('ui-hub-show-welcome', 'true');
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

                // First-time registration welcome (fired immediately, before any network sync)
                fireWelcome(user);

                // 4. Synchronize user with backend exactly once per session
                if (!syncedThisSession) {
                    syncedThisSession = true;
                    await syncUserWithBackend(user);
                }

                try {
                    await refreshProStatus();
                } finally {
                    setLoading(false);
                }
            } else {
                syncedThisSession = false; // reset when user signs out
                setIsPro(false);
                setIsElite(false);
                setLoading(false);
            }
        });

        return unsubscribe;
    }, [refreshProStatus]);

    const isSpecialUser = user?.email === 'jainil11199@gmail.com';

    // Auto-refresh Pro/Elite status when the tab regains focus (covers upgrades
    // completed in another tab or via external payment flows) without polling.
    useEffect(() => {
        let lastRefreshed = 0;
        const refreshBudgetMs = 30000;
        const refreshIfStale = () => {
            if (!auth.currentUser) return;
            const now = Date.now();
            if (now - lastRefreshed < refreshBudgetMs) return;
            lastRefreshed = now;
            refreshProStatus();
        };
        window.addEventListener('focus', refreshIfStale);
        document.addEventListener('visibilitychange', refreshIfStale);
        return () => {
            window.removeEventListener('focus', refreshIfStale);
            document.removeEventListener('visibilitychange', refreshIfStale);
        };
    }, [refreshProStatus]);

    return (
        <AuthContext.Provider value={{ user, isPro: isPro || isElite || isSpecialUser, isElite: isElite || isSpecialUser, loading, refreshProStatus }}>
            {/* Always render children immediately to unblock app mount */}
            {children}

            {welcome && (
                <WelcomeNotifications
                    key={welcome.seq}
                    isVisible={true}
                    name={welcome.name}
                    email={welcome.email}
                />
            )}
        </AuthContext.Provider>
    );
};
