import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getUserFavorites, removeFromFavorites } from '../../services/favorites';
import { Heart, Trash2, Library, Copy, Check, ArrowUpRight, Component as ComponentIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { componentList, ComponentItem } from '../../data/componentData';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const shadowVariants = [
    'brutal-shadow-blue',
    'brutal-shadow-red',
    'brutal-shadow-yellow',
    'brutal-shadow-white',
];

const FavoritesPage = () => {
    const { user } = useAuth();
    const [favoriteMetadata, setFavoriteMetadata] = useState<any[]>([]);
    const [firebaseComponents, setFirebaseComponents] = useState<ComponentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Combine local and firebase components for lookup
    const allAvailableComponents = useMemo(() => [...componentList, ...firebaseComponents], [firebaseComponents]);

    useEffect(() => {
        // Listen to favorites metadata (works for logged in users and guests)
        const unsubFavorites = getUserFavorites(user?.uid, (data) => {
            setFavoriteMetadata(data);
            setLoading(false);
        });

        // Listen to all custom components to enrich favorites
        const q = query(collection(db, 'components'), orderBy('createdAt', 'desc'));
        const unsubComponents = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.componentName,
                    description: data.description,
                    category: 'custom',
                    code: data.code,
                    uploader: data.uploaderName || 'Anonymous',
                    preview: () => null,
                    vibePrompt: ''
                } as unknown as ComponentItem;
            });
            setFirebaseComponents(fetched);
        }, (err) => {
            console.error("Error loading components:", err);
        });

        return () => {
            if (typeof unsubFavorites === 'function') unsubFavorites();
            if (typeof unsubComponents === 'function') unsubComponents();
        };
    }, [user?.uid]);

    const enrichedFavorites = useMemo(() => {
        return favoriteMetadata.map(fav => {
            const fullComponent = allAvailableComponents.find(c => c.id === fav.componentId);
            return {
                ...fav,
                fullComponent
            };
        });
    }, [favoriteMetadata, allAvailableComponents]);

    const handleRemove = (e: React.MouseEvent, componentId: string) => {
        e.preventDefault();
        e.stopPropagation();

        // Optimistic UI update: remove item from local state immediately
        setFavoriteMetadata(prev => prev.filter(fav => fav.componentId !== componentId));

        // Trigger delete
        removeFromFavorites(user?.uid, componentId).catch(error => {
            console.error("Error removing from favorites:", error);
        });
    };

    const handleCopy = (e: React.MouseEvent, code: string, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    /* ── Guest Empty State ── */
    if (!user && favoriteMetadata.length === 0 && !loading) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 pt-28 pb-20 bg-brand-bg">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative w-full max-w-lg border-2 border-white bg-brand-surface rounded-xl brutal-shadow-blue p-8 sm:p-12 text-center overflow-hidden"
                >
                    <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-brand-blue/15 blur-2xl pointer-events-none" />

                    <div className="w-16 h-16 mx-auto mb-6 rounded-lg border-2 border-white bg-black brutal-shadow-red flex items-center justify-center">
                        <Heart size={28} className="text-brand-red fill-brand-red/20" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 border-2 border-white bg-black rounded-md text-[10px] font-black uppercase tracking-widest text-neutral-300">
                        <span className="w-2 h-2 rounded-full bg-brand-yellow border border-black" />
                        SAVED COMPONENTS
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none mb-4 font-heading">
                        NO <span className="text-brand-blue">FAVORITES</span> YET
                    </h1>
                    <p className="text-neutral-400 font-medium text-sm sm:text-base leading-relaxed mb-8">
                        Explore the component library and hit the heart icon to save your favorite components here.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/library" className="brutal-btn-primary w-full sm:w-auto px-8 py-3.5 text-xs tracking-widest flex items-center justify-center gap-2 no-underline cursor-pointer">
                            Explore Library <Library size={15} />
                        </Link>
                        <Link to="/login" className="brutal-btn-outline w-full sm:w-auto px-8 py-3.5 text-xs tracking-widest flex items-center justify-center gap-2 no-underline cursor-pointer">
                            Sign In <Heart size={14} />
                        </Link>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative bg-brand-bg">
            <style>{`
                .favorites-preview::-webkit-scrollbar { width: 4px; height: 4px; }
                .favorites-preview::-webkit-scrollbar-track { background: transparent; }
                .favorites-preview::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
            `}</style>

            <div className="max-w-[1400px] mx-auto">
                {/* ── Section Header (matches homepage style) ── */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 mb-12"
                >
                    {/* Eyebrow Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 border-2 border-white bg-brand-surface text-white rounded-md font-black text-xs uppercase tracking-widest brutal-shadow-black">
                        <Heart size={13} className="text-brand-red fill-brand-red" />
                        <span>SAVED COMPONENTS</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="border-2 border-white p-6 md:p-8 rounded-lg bg-brand-surface brutal-shadow-blue flex-1">
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight mb-4 text-white leading-none font-heading">
                                MY <span className="text-brand-blue">FAVORITES</span>
                            </h1>
                            <p className="text-neutral-400 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
                                Your personal collection of saved components — ready to preview, copy and ship.
                            </p>
                        </div>

                        {/* Count Stat Box */}
                        <Link to="/library" className="group shrink-0 flex items-stretch gap-4 no-underline cursor-pointer">
                            <div className="border-2 border-white bg-brand-surface rounded-lg brutal-shadow-white p-4 md:px-6 min-w-[120px] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5">
                                <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-black mb-1">TOTAL SAVED</p>
                                <span className="text-3xl font-black text-brand-blue">{enrichedFavorites.length}</span>
                            </div>
                            <div className="hidden sm:flex items-center justify-center border-2 border-white bg-brand-blue rounded-lg brutal-shadow-black px-5 text-white text-[10px] font-black uppercase tracking-widest transition-all duration-150 group-hover:bg-[#324FE0] group-hover:-translate-y-0.5">
                                Open Catalog →
                            </div>
                        </Link>
                    </div>
                </motion.header>

                {/* ── Grid ── */}
                <div className="w-full relative z-10">
                    {loading ? (
                        /* Loading Skeletons */
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="skeleton-glass skeleton-pulse h-[320px] rounded-lg" />
                            ))}
                        </div>
                    ) : enrichedFavorites.length === 0 ? (
                        /* Logged-in Empty Vault */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border-2 border-white bg-brand-surface rounded-lg brutal-shadow-yellow p-12 sm:p-20 text-center relative overflow-hidden"
                        >
                            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-brand-yellow/10 blur-3xl pointer-events-none" />

                            <div className="w-20 h-20 mx-auto mb-8 rounded-lg border-2 border-white bg-black brutal-shadow-white flex items-center justify-center rotate-[-6deg] hover:rotate-0 transition-transform duration-300">
                                <ComponentIcon size={36} className="text-brand-blue" />
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-3 text-white font-heading">
                                VAULT IS <span className="text-brand-blue">EMPTY</span>
                            </h3>
                            <p className="text-neutral-400 mb-10 max-w-md mx-auto font-medium text-sm sm:text-base leading-relaxed">
                                Your personal asset repository is currently empty. Synchronize components from the library.
                            </p>
                            <Link to="/library" className="brutal-btn-primary inline-flex px-10 py-4 text-xs tracking-widest items-center gap-3 no-underline cursor-pointer">
                                <Library size={16} /> Enter Library
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {enrichedFavorites.map((fav, index) => {
                                    const shadowClass = shadowVariants[index % shadowVariants.length];
                                    const comp = fav.fullComponent;
                                    const categoryLabel = comp?.category === 'custom'
                                        ? 'COMMUNITY'
                                        : (comp?.category || 'UI').toUpperCase();

                                    return (
                                        <motion.div
                                            key={fav.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{
                                                opacity: 0,
                                                scale: 0.9,
                                                transition: { duration: 0.25, ease: 'easeIn' }
                                            }}
                                            transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
                                            className="group relative"
                                        >
                                            <Link
                                                to={`/library?id=${fav.componentId}&tab=preview`}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`block relative h-[320px] bg-brand-surface border-2 border-white rounded-lg overflow-hidden flex flex-col justify-between cursor-pointer select-none transition-transform duration-150 hover:translate-x-0.5 hover:translate-y-0.5 ${shadowClass} no-underline`}
                                            >
                                                {/* Card Top Traffic Bar */}
                                                <div className="relative z-30 flex items-center justify-between px-3.5 py-2.5 border-b-2 border-neutral-800 bg-[#0A0A0E]">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-brand-red border border-black" />
                                                        <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow border border-black" />
                                                        <span className="w-2.5 h-2.5 rounded-full bg-brand-blue border border-black" />
                                                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 ml-1 truncate max-w-[140px]">
                                                            {categoryLabel}
                                                        </span>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        type="button"
                                                        title="Remove from Favorites"
                                                        aria-label="Remove from Favorites"
                                                        onClick={(e) => handleRemove(e, fav.componentId)}
                                                        className="p-1.5 rounded-md border-2 border-transparent bg-transparent text-neutral-500 hover:text-brand-red hover:border-brand-red active:scale-90 transition-all cursor-pointer select-none"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                {/* Preview Area */}
                                                <div className="w-full flex-1 flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-transparent to-black/40">
                                                    {/* Subtle Grid texture */}
                                                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                                                    {comp?.preview ? (
                                                        <div className="absolute inset-0 w-full h-full favorites-preview">
                                                            <div className="w-full h-full flex items-center justify-center transform scale-[0.75] origin-center relative pointer-events-none">
                                                                {comp.preview()}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-3 z-10">
                                                            <div className="w-12 h-12 rounded-lg border-2 border-white bg-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                                                                <ComponentIcon size={22} className="text-neutral-400" />
                                                            </div>
                                                            <span className="text-[10px] uppercase tracking-widest font-black text-neutral-500 bg-black/60 px-2.5 py-1 rounded border border-neutral-800">
                                                                NO LIVE PREVIEW
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Heart Badge Overlay */}
                                                    <div className="absolute top-3 right-3 z-30 pointer-events-none">
                                                        <div className="p-1.5 rounded-md border-2 border-white bg-brand-red brutal-shadow-black">
                                                            <Heart size={13} className="text-white fill-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom bar: title + arrow */}
                                                <div className="relative z-30 flex items-center justify-between gap-2 px-4 py-3 bg-[#0A0A0E] border-t-2 border-white">
                                                    <span className="text-xs uppercase font-black tracking-wider text-white truncate">
                                                        {fav.componentName}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {/* Copy Code */}
                                                        {comp?.code && (
                                                            <button
                                                                type="button"
                                                                title={copiedId === fav.componentId ? 'Copied!' : 'Copy Code'}
                                                                aria-label="Copy Code"
                                                                onClick={(e) => handleCopy(e, typeof comp.code === 'string' ? comp.code : '', fav.componentId)}
                                                                className={`w-6 h-6 rounded border flex items-center justify-center transition-colors shadow-[1px_1px_0px_0px_#000] cursor-pointer ${
                                                                    copiedId === fav.componentId
                                                                        ? 'bg-brand-blue border-black text-white'
                                                                        : 'border-white bg-brand-surface text-neutral-400 hover:bg-brand-blue hover:border-black hover:text-white'
                                                                }`}
                                                            >
                                                                {copiedId === fav.componentId ? <Check size={12} /> : <Copy size={12} />}
                                                            </button>
                                                        )}
                                                        {/* Open */}
                                                        <div className="w-6 h-6 rounded border border-white bg-brand-surface flex items-center justify-center group-hover:bg-brand-blue group-hover:border-black transition-colors shadow-[1px_1px_0px_0px_#000]">
                                                            <ArrowUpRight size={14} className="text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default FavoritesPage;
