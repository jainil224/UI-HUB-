import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldOff, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAdminStatus } from '../../services/admin';
import { SkeletonBlock } from '../../components/admin/AdminUi';

type Screen = 'loading' | 'allowed' | 'denied';

const AdminLoading: React.FC = () => (
    <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8 bg-brand-bg">
        <div className="max-w-[1500px] mx-auto">
            <SkeletonBlock className="h-10 mb-8" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
            </div>
            <SkeletonBlock className="h-64" />
        </div>
    </main>
);

const AccessDenied: React.FC<{ reason: 'forbidden' | 'unreachable' }> = ({ reason }) => (
    <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 bg-brand-bg">
        <div className="max-w-lg mx-auto">
            <div className="relative border-2 border-white bg-brand-surface rounded-xl brutal-shadow-red p-8 sm:p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-lg border-2 border-white bg-brand-red flex items-center justify-center text-white">
                    <ShieldOff size={26} />
                </div>
                <h1 className="text-xl font-black uppercase tracking-widest text-white">
                    {reason === 'forbidden' ? 'Admin access required' : 'Server unreachable'}
                </h1>
                <p className="text-sm text-neutral-400 mt-3">
                    {reason === 'forbidden'
                        ? 'This console is restricted to authorized administrators. Your account does not have the required MCP admin permissions.'
                        : 'Could not reach the MCP admin API. The service may be offline or you may not be signed in.'}
                </p>
                <div className="mt-6 inline-flex items-center gap-2">
                    <KeyRound size={15} />
                    <span className="text-xs font-mono text-neutral-500">GET /api/admin/mcp/status</span>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <Link to="/dashboard/mcp" className="brutal-btn-outline px-6 py-3 text-[11px] no-underline cursor-pointer">
                        Back to Dashboard
                    </Link>
                    <Link to="/login" className="brutal-btn-primary px-6 py-3 text-[11px] no-underline cursor-pointer">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    </main>
);

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const [screen, setScreen] = useState<Screen>('loading');
    const [reason, setReason] = useState<'forbidden' | 'unreachable'>('forbidden');

    useEffect(() => {
        let alive = true;
        if (loading) return;
        if (!user) {
            setScreen('denied');
            return;
        }
        setScreen('loading');
        getAdminStatus()
            .then(() => {
                if (alive) setScreen('allowed');
            })
            .catch((e: any) => {
                if (!alive) return;
                setReason(e?.status === 403 ? 'forbidden' : 'unreachable');
                setScreen('denied');
            });
        return () => {
            alive = false;
        };
    }, [user, loading]);

    if (loading || screen === 'loading') return <AdminLoading />;
    if (!user) return <Navigate to="/login" replace />;
    if (screen === 'denied') return <AccessDenied reason={reason} />;
    return <>{children}</>;
};

export default AdminGuard;