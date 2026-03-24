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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            
            if (user) {
                try {
                    const idToken = await user.getIdToken();
                    const response = await fetch(`${getApiBaseUrl()}/api/v1/users/status`, {
                        headers: {
                            'Authorization': `Bearer ${idToken}`
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setIsPro(data.isPro);
                    } else {
                        setIsPro(false);
                    }
                } catch (error) {
                    console.error('Error fetching pro status:', error);
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
