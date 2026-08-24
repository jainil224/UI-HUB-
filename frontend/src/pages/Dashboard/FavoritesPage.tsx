import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getUserFavorites, removeFromFavorites } from '../../services/favorites';
import { Heart, Trash2, Library, ArrowUpRight, Component as ComponentIcon } from 'lucide-react';
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
                .favorites-preview a[href*="/demo/"] { display: none !important; }
            `}</style>

            {/* ── Ambient Page Texture ── */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="absolute -top-48 -left-48 w-[560px] h-[560px] bg-brand-blue/[0.07] blur-[130px] rounded-full" />
                <div className="absolute -bottom-48 -right-48 w-[560px] h-[560px] bg-brand-red/[0.04] blur-[130px] rounded-full" />
            </div>

            <div className="max-w-[1400px] mx-auto">
                {/* ── Section Header: single full-width hero card ── */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 mb-10"
                >
                    <div className="relative border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue overflow-hidden">
                        {/* Brand accent strip */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-brand-blue" />
                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                        <div className="relative p-6 md:p-8 lg:p-10">
                            {/* Top meta row */}
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-white bg-black rounded-md font-black text-[10px] uppercase tracking-widest text-white">
                                    <Heart size={12} className="text-brand-red fill-brand-red" />
                                    <span>Saved Components</span>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-white bg-black rounded-md">
                                    <span className="w-2 h-2 rounded-full bg-brand-blue border border-black animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total Saved</span>
                                    <span className="text-sm font-black text-brand-blue font-mono">{enrichedFavorites.length}</span>
                                </div>
                            </div>

                            {/* Title + CTA row */}
                            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                                <div className="min-w-0">
                                    <h1 className="text-5xl sm:text-7xl xl:text-8xl font-black uppercase tracking-tight mb-3 md:mb-4 text-white leading-[0.95] font-heading">
                                        MY <span className="text-brand-blue">FAVORITES</span>
                                    </h1>
                                    <p className="text-neutral-400 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                                        Your personal collection of saved components — ready to preview, copy and ship.
                                    </p>
                                </div>

                                <Link
                                    to="/library"
                                    className="group shrink-0 brutal-btn-primary inline-flex px-8 py-4 text-xs tracking-widest items-center justify-center gap-2.5 no-underline cursor-pointer"
                                >
                                    <span>Open Catalog</span>
                                    <ArrowUpRight size={15} className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* ── Grid ── */}
                <div className="w-full relative z-10">
                    {loading ? (
                        /* Loading Skeletons */
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="skeleton-glass skeleton-pulse h-[360px] rounded-lg" />
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
                                                className={`block relative h-[360px] bg-brand-surface border-2 border-white rounded-lg overflow-hidden flex flex-col justify-between cursor-pointer select-none transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:brightness-110 ${shadowClass} no-underline`}
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
                                                        className="-mr-1 p-2.5 rounded-md border-2 border-transparent bg-transparent text-neutral-500 hover:text-brand-red hover:border-brand-red active:scale-90 transition-all cursor-pointer select-none"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>

                                                {/* Preview Area */}
                                                <div className="w-full flex-1 flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-transparent to-black/40">
                                                    {/* Subtle Grid texture */}
                                                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                                                    {comp?.preview ? (
                                                        <div className="absolute inset-0 w-full h-full favorites-preview">
                                                            <div className="w-full h-full flex items-center justify-center transform scale-[0.65] origin-center relative pointer-events-none transition-transform duration-300 group-hover:scale-[0.7]">
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
                                                </div>

                                                {/* Bottom bar: title + arrow */}
                                                <div className="relative z-30 flex items-center justify-between gap-2 px-4 py-3 bg-[#0A0A0E] border-t-2 border-white">
                                                    <span className="flex items-center gap-2 min-w-0">
                                                        <Heart size={12} className="text-brand-red fill-brand-red shrink-0" />
                                                        <span className="text-xs uppercase font-black tracking-wider text-white truncate">
                                                            {fav.componentName}
                                                        </span>
                                                    </span>
                                                    {/* Open */}
                                                    <div className="w-7 h-7 rounded-md border-2 border-white bg-brand-surface flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000] transition-all duration-150 group-hover:bg-brand-blue group-hover:border-black group-hover:shadow-none">
                                                        <ArrowUpRight size={14} className="text-white transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
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
