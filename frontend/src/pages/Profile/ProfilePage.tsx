import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { AtSign, Check, Loader2, Lock, Mail, Save, ShieldCheck, AlertCircle, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PlanBadge, { PlanTier } from '../../components/ui/PlanBadge';
import AvatarUploader from './AvatarUploader';
import {
    getProfile,
    updateProfile,
    deleteAvatar,
    checkUsername,
    ProfileError,
    type CloudinaryStatus,
} from '../../services/profile';
import { USERNAME_RE, USERNAME_RULE_MESSAGE, usernameKey } from '../../utils/username';

type HandleState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const ProfilePage: React.FC = () => {
    const { user, profile, refreshProfile, isPro, planType, loading: authLoading } = useAuth();

    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [cloudinary, setCloudinary] = useState<CloudinaryStatus>({ configured: false, maxBytes: 5 * 1024 * 1024 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [handleState, setHandleState] = useState<HandleState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const planTier: PlanTier = planType === 'custom' ? 'custom' : isPro ? 'pro' : 'free';

    const savedHandle = (profile?.username || '').toLowerCase();
    const savedName = profile?.displayName || '';

    // Populate from the context profile first, then confirm with a fresh fetch.
    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName || '');
            setUsername(profile.username || '');
            setAvatarUrl(profile.avatarUrl || null);
        }
    }, [profile]);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const { profile: fresh, cloudinary: cloud } = await getProfile();
                if (cancelled) return;
                setDisplayName(fresh.displayName || '');
                setUsername(fresh.username || '');
                setAvatarUrl(fresh.avatarUrl || null);
                setCloudinary(cloud);
            } catch (err) {
                if (!cancelled) setError(err instanceof ProfileError ? err.message : 'Could not load your profile.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    // Debounced username availability check.
    useEffect(() => {
        const handle = username.trim();
        if (!handle || usernameKey(handle) === savedHandle) {
            setHandleState('idle');
            return;
        }
        if (!USERNAME_RE.test(handle)) {
            setHandleState('invalid');
            return;
        }
        setHandleState('checking');
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = await checkUsername(handle, controller.signal);
                setHandleState(res.available ? 'available' : 'taken');
            } catch (err) {
                if ((err as any)?.name !== 'AbortError') setHandleState('idle');
            }
        }, 450);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [username, savedHandle]);

    const dirtyName = displayName.trim() !== savedName;
    const dirtyHandle = usernameKey(username) !== savedHandle && username.trim() !== '';
    const handleValid = handleState === 'idle' || handleState === 'available';
    const canSave = !saving && (dirtyName || dirtyHandle) && handleValid && displayName.trim().length > 0;

    const flash = useCallback((message: string) => {
        setNotice(message);
        setError(null);
        window.setTimeout(() => setNotice(null), 3000);
    }, []);

    const mirrorFirebase = async (data: { displayName?: string | null; photoURL?: string | null }) => {
        if (!auth.currentUser) return;
        try {
            await updateFirebaseProfile(auth.currentUser, {
                ...(data.displayName !== undefined ? { displayName: data.displayName || undefined } : {}),
                ...(data.photoURL !== undefined ? { photoURL: data.photoURL } : {}),
            });
        } catch (err) {
            console.warn('[Profile] Firebase mirror skipped:', err);
        }
    };

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!canSave) return;
        setSaving(true);
        setError(null);
        try {
            const updates: { displayName?: string; username?: string } = {};
            if (dirtyName) updates.displayName = displayName.trim();
            if (dirtyHandle) {
                const handle = username.trim();
                if (!USERNAME_RE.test(handle)) throw new ProfileError(USERNAME_RULE_MESSAGE, 'INVALID_USERNAME');
                updates.username = handle;
            }

            const updated = await updateProfile(updates);
            setDisplayName(updated.displayName || '');
            setUsername(updated.username || '');
            await mirrorFirebase({ displayName: updated.displayName });
            await refreshProfile();
            flash('Profile updated.');
        } catch (err) {
            setError(err instanceof ProfileError ? err.message : 'Could not save your changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUploaded = async (url: string, publicId: string) => {
        const updated = await updateProfile({ avatarUrl: url, avatarPublicId: publicId });
        setAvatarUrl(updated.avatarUrl || url);
        await mirrorFirebase({ photoURL: updated.avatarUrl || url });
        await refreshProfile();
        flash('Photo updated.');
    };

    const handleAvatarRemoved = async () => {
        const updated = await deleteAvatar();
        setAvatarUrl(updated.avatarUrl || null);
        await mirrorFirebase({ photoURL: null });
        await refreshProfile();
        flash('Photo removed.');
    };

    const handleHint = useMemo(() => {
        switch (handleState) {
            case 'checking':
                return { tone: 'muted', text: 'Checking availability…' };
            case 'available':
                return { tone: 'ok', text: 'Username is available.' };
            case 'taken':
                return { tone: 'error', text: 'That username is taken.' };
            case 'invalid':
                return { tone: 'error', text: USERNAME_RULE_MESSAGE };
            default:
                return profile?.username
                    ? { tone: 'muted', text: `Your handle: @${profile.username}` }
                    : { tone: 'muted', text: 'Pick a unique handle.' };
        }
    }, [handleState, profile?.username]);

    if (authLoading || (user && loading)) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-brand-bg pt-24">
                <Loader2 className="h-7 w-7 animate-spin text-white/60" />
            </main>
        );
    }

    if (!user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-brand-bg p-4 pt-28 pb-20">
                <div className="w-full max-w-md rounded-xl border-2 border-white bg-brand-surface p-8 text-center brutal-shadow-blue">
                    <Lock className="mx-auto mb-4 h-10 w-10 text-white/60" />
                    <h1 className="text-xl font-black uppercase tracking-wider text-white">Sign in required</h1>
                    <p className="mt-2 text-sm text-white/50">You need an account to edit your profile.</p>
                    <Link
                        to="/login"
                        className="mt-6 inline-block rounded-md bg-[#1F4BFF] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#2855FF]"
                    >
                        Sign in
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-brand-bg px-4 pb-20 pt-28">
            <div className="mx-auto w-full max-w-2xl">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1F4BFF]">Account</p>
                        <h1 className="text-2xl font-black uppercase tracking-wider text-white">Edit Profile</h1>
                    </div>
                    <PlanBadge tier={planTier} size="sm" showIcon />
                </header>

                <section className="rounded-xl border-2 border-white bg-brand-surface p-6 brutal-shadow-blue sm:p-8">
                    <AvatarUploader
                        avatarUrl={avatarUrl}
                        name={displayName || user.email || 'User'}
                        isPro={isPro}
                        cloudinaryConfigured={cloudinary.configured}
                        maxBytes={cloudinary.maxBytes}
                        disabled={saving}
                        onUploaded={handleAvatarUploaded}
                        onRemoved={handleAvatarRemoved}
                    />

                    <form onSubmit={handleSave} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="displayName" className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white/60">
                                <UserIcon size={13} /> Display name
                            </label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                maxLength={60}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name"
                                className="w-full rounded-md border-2 border-white/15 bg-black/30 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-[#1F4BFF]"
                            />
                        </div>

                        <div>
                            <label htmlFor="username" className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white/60">
                                <AtSign size={13} /> Username
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/30">@</span>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    maxLength={7}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Jainil1"
                                    className={`w-full rounded-md border-2 bg-black/30 py-3 pl-9 pr-10 text-sm font-semibold text-white outline-none transition placeholder:text-white/25 ${
                                        handleState === 'taken' || handleState === 'invalid'
                                            ? 'border-rose-500/60'
                                            : handleState === 'available'
                                              ? 'border-emerald-500/60'
                                              : 'border-white/15 focus:border-[#1F4BFF]'
                                    }`}
                                />
                                {handleState === 'checking' && (
                                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/40" />
                                )}
                                {handleState === 'available' && (
                                    <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                                )}
                            </div>
                            <p
                                className={`mt-1.5 text-xs font-semibold ${
                                    handleHint.tone === 'ok'
                                        ? 'text-emerald-400'
                                        : handleHint.tone === 'error'
                                          ? 'text-rose-300'
                                          : 'text-white/40'
                                }`}
                            >
                                {handleHint.text}
                            </p>
                        </div>

                        <div className="rounded-md border-2 border-white/10 bg-black/20 px-4 py-3">
                            <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white/50">
                                <Mail size={13} /> Email
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white/80">
                                {user.email}
                                <ShieldCheck size={13} className="text-emerald-400" />
                            </p>
                            <p className="mt-1 text-[11px] text-white/30">Email is managed by your sign-in provider.</p>
                        </div>

                        {error && (
                            <p className="flex items-center gap-2 rounded-md border-2 border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200">
                                <AlertCircle size={15} /> {error}
                            </p>
                        )}
                        {notice && (
                            <p className="flex items-center gap-2 rounded-md border-2 border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200">
                                <Check size={15} /> {notice}
                            </p>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-1">
                            <Link
                                to="/"
                                className="rounded-md border-2 border-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/60 transition hover:bg-white/[0.06]"
                            >
                                Back
                            </Link>
                            <button
                                type="submit"
                                disabled={!canSave}
                                className="flex items-center gap-2 rounded-md border-2 border-white bg-[#1F4BFF] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#2855FF] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Save changes
                            </button>
                        </div>
                    </form>
                </section>

                {!cloudinary.configured && (
                    <p className="mt-4 text-center text-xs text-white/35">
                        Image uploads are unavailable until Cloudinary keys are set on the server.
                    </p>
                )}
            </div>
        </main>
    );
};

export default ProfilePage;
