import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getApiBaseUrl } from '../utils/apiConfig';
import { syncUserWithBackend } from '../utils/syncUser';
import WelcomeNotifications from '../components/ui/WelcomeNotifications';

let syncedThisSession = false;

const WELCOME_STORAGE_PREFIX = 'ui-hub-welcomed-';

const welcomeStorageKey = (uid: string) => `${WELCOME_STORAGE_PREFIX}${uid}`;

interface WelcomeEvent {
    name?: string;
    email?: string;
    seq: number;
}

interface AuthContextType {
    user: User | null;
    isPro: boolean;
    loading: boolean;
    refreshProStatus: () => Promise<boolean | null>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isPro: false,
    loading: true,
    refreshProStatus: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isPro, setIsPro] = useState(() => (localStorage.getItem('ui-hub-pro') === 'true' || localStorage.getItem('ui-hub-elite') === 'true'));
    const [loading, setLoading] = useState(true);
    const [welcome, setWelcome] = useState<WelcomeEvent | null>(null);
    const welcomeFiredForRef = useRef<string | null>(null);

    const fireWelcome = (u: User, alreadyShown: boolean | null) => {
        if (welcomeFiredForRef.current === u.uid) return;
        welcomeFiredForRef.current = u.uid;

        const storageKey = welcomeStorageKey(u.uid);

        // Fast path: this user already saw the welcome on this browser.
        if (localStorage.getItem(storageKey) === '1') return;

        let shouldShow = false;

        if (alreadyShown !== null) {
            // Backend is authoritative: only brand-new accounts get the welcome.
            if (alreadyShown === true) {
                localStorage.setItem(storageKey, '1');
                return;
            }
            shouldShow = true;
        } else {
            // Fallback when the sync call failed (offline/CORS): detect a
            // genuinely brand-new account so new users still get welcomed once.
            try {
                const creationTime = new Date(u.metadata.creationTime || 0).getTime();
                const lastSignInTime = new Date(u.metadata.lastSignInTime || 0).getTime();
                shouldShow = Math.abs(creationTime - lastSignInTime) < 5000;
            } catch (err) {
                console.error('[Auth] New user detection failed:', err);
                shouldShow = false;
            }
        }

        if (!shouldShow) return;

        localStorage.setItem(storageKey, '1');
        setWelcome({
            name: u.displayName || undefined,
            email: u.email || undefined,
            seq: Date.now(),
        });

        if (alreadyShown === false) {
            markWelcomeShown(u);
        }
    };

    const markWelcomeShown = async (u: User) => {
        try {
            const idToken = await u.getIdToken();
            const apiBaseUrl = getApiBaseUrl();
            await fetch(`${apiBaseUrl}/api/v1/users/welcome-shown`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });
            console.log('[Auth] Welcome notification marked as shown on backend.');
        } catch (err) {
            console.error('[Auth] Failed to mark welcome notification as shown:', err);
        }
    };

    const refreshProStatus = useCallback(async (): Promise<boolean | null> => {
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
                // Elite users are folded into Pro so there is only Free/Pro.
                const proStatus = !!(data.isPro || data.isElite);
                setIsPro(proStatus);
                const flag = String(proStatus);
                localStorage.setItem('ui-hub-pro', flag);
                localStorage.setItem('ui-hub-elite', flag);
                console.log(`[Auth] Status Match: Pro=${proStatus}`);
                return proStatus;
            } else {
                const errorText = await response.text();
                console.error(`[Auth] Failed: ${response.status} - Status endpoint returned error:`, errorText);
                setIsPro(false);
                localStorage.setItem('ui-hub-pro', 'false');
                localStorage.setItem('ui-hub-elite', 'false');
                return false;
            }
        } catch (error) {
            console.error('[Auth] Connection Failure: Could not reach status endpoint. Check VITE_API_URL and CORS.', error);
            // Don't wipe storage on network failure, preserve offline optimism
            const pro = (localStorage.getItem('ui-hub-pro') === 'true' || localStorage.getItem('ui-hub-elite') === 'true');
            setIsPro(pro);
            return pro;
        }
    }, []);

    useEffect(() => {
        const checkRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    console.log(`[Auth] Redirect result found: ${result.user.email}`);
                    setUser(result.user);
                    let welcomeAlreadyShown: boolean | null = null;
                    if (!syncedThisSession) {
                        syncedThisSession = true;
                        const syncResult = await syncUserWithBackend(result.user);
                        welcomeAlreadyShown = syncResult?.welcomeNotificationShown ?? null;
                    }
                    fireWelcome(result.user, welcomeAlreadyShown);
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

                // Synchronize user with backend exactly once per session and
                // learn whether this user has already seen the welcome bar.
                let welcomeAlreadyShown: boolean | null = null;
                if (!syncedThisSession) {
                    syncedThisSession = true;
                    const syncResult = await syncUserWithBackend(user);
                    welcomeAlreadyShown = syncResult?.welcomeNotificationShown ?? null;
                }

                // First-time registration welcome (only for brand-new accounts,
                // shown at most once ever per user).
                fireWelcome(user, welcomeAlreadyShown);

                try {
                    await refreshProStatus();
                } finally {
                    setLoading(false);
                }
            } else {
                syncedThisSession = false; // reset when user signs out
                setIsPro(false);
                setLoading(false);
            }
        });

        return unsubscribe;
    }, [refreshProStatus]);

    const isSpecialUser = user?.email === 'jainil11199@gmail.com';

    // Auto-refresh Pro status when the tab regains focus (covers upgrades
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
        <AuthContext.Provider value={{ user, isPro: isPro || isSpecialUser, loading, refreshProStatus }}>
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
