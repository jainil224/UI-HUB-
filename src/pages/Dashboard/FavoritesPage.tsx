import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getUserFavorites, removeFromFavorites } from '../../services/favorites';
import { Heart, Trash2, ExternalLink, Library, Copy, Check, Sparkles, Box, Zap, Code2, Eye, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { componentList, ComponentItem } from '../../data/componentData';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const FavoritesPage = () => {
    const { user } = useAuth();
    const [favoriteMetadata, setFavoriteMetadata] = useState<any[]>([]);
    const [firebaseComponents, setFirebaseComponents] = useState<ComponentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<{ [key: string]: 'preview' | 'code' }>({});

    // Combine local and firebase components for lookup
    const allAvailableComponents = useMemo(() => [...componentList, ...firebaseComponents], [firebaseComponents]);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Listen to favorites metadata
        const unsubFavorites = getUserFavorites(user.uid, (data) => {
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
        });

        return () => {
            unsubFavorites();
            unsubComponents();
        };
    }, [user]);

    const enrichedFavorites = useMemo(() => {
        return favoriteMetadata.map(fav => {
            const fullComponent = allAvailableComponents.find(c => c.id === fav.componentId);
            return {
                ...fav,
                fullComponent
            };
        });
    }, [favoriteMetadata, allAvailableComponents]);

    const handleRemove = async (e: React.MouseEvent, componentId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;
        await removeFromFavorites(user.uid, componentId);
    };

    const handleCopy = (e: React.MouseEvent, code: string, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleTab = (id: string, tab: 'preview' | 'code') => {
        setActiveTab(prev => ({ ...prev, [id]: tab }));
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass p-12 rounded-[3.5rem] text-center max-w-lg border border-white/5 bg-black/40 backdrop-blur-2xl">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                        <Heart size={40} className="text-red-500 fill-red-500/20" />
                    </div>
                    <h2 className="text-4xl font-display font-black mb-4 uppercase tracking-tight text-white">The Vault</h2>
                    <p className="text-white/40 mb-10 font-medium text-lg leading-relaxed">Sign in to access your curated selection of high-performance UI components.</p>
                    <Link to="/login" className="inline-flex items-center gap-3 px-10 py-5 bg-brand-green text-black font-display font-black rounded-2xl hover:shadow-[0_0_50px_rgba(0,255,0,0.4)] transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs">
                        Unlock Now <Zap size={16} fill="currentColor" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-32 pb-20 px-4 relative overflow-hidden">
            {/* Immersive Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[#020202]">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-green/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            </div>

            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 px-4">
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-[10px] font-black uppercase tracking-[0.3em]"
                        >
                            <Sparkles size={14} />
                            <span>Premium Curated Vault</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, type: 'spring', damping: 20 }}
                            className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-[0.9]"
                        >
                            MY <span className="text-brand-green text-stroke-premium">VAULT</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-white/40 text-lg font-medium max-w-xl leading-relaxed"
                        >
                            Your workspace for high-performance UI components. Prototype, copy, and build faster than ever.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Link
                            to="/library"
                            className="group relative flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-white/[0.03] border border-white/10 text-white/70 hover:text-brand-green hover:border-brand-green/30 transition-all overflow-hidden shadow-2xl"
                        >
                            <Library size={20} className="relative z-10 transition-transform group-hover:rotate-12" />
                            <span className="relative z-10 text-xs font-black uppercase tracking-[0.2em]">Explore Library</span>
                            <div className="absolute inset-0 bg-brand-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </motion.div>
                </header>

                <div className="w-full">
                    {enrichedFavorites.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-[4rem] p-32 text-center border border-white/5 relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-brand-green/[0.03] to-transparent pointer-events-none" />
                            <div className="w-28 h-28 bg-white/[0.02] rounded-[2.5rem] border border-white/10 flex items-center justify-center mx-auto mb-10 rotate-[15deg] group-hover:rotate-0 transition-all duration-700 shadow-2xl">
                                <Box size={48} className="text-white/10 group-hover:text-brand-green transition-colors" />
                            </div>
                            <h3 className="text-3xl font-display font-black mb-4 tracking-tight text-white uppercase">Vault Empty</h3>
                            <p className="text-white/30 mb-12 max-w-md mx-auto font-medium text-lg leading-relaxed">Your personal vault has no registered assets yet. Deploy components from the library to populate the vault.</p>
                            <Link
                                to="/library"
                                className="inline-flex items-center gap-4 px-12 py-6 rounded-2xl bg-brand-green text-black font-display font-black uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_60px_rgba(0,255,0,0.4)] transition-all hover:-translate-y-1 active:scale-95"
                            >
                                <Library size={18} /> Catalog Access
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10"
                        >
                            <AnimatePresence mode='popLayout'>
                                {enrichedFavorites.map((fav, index) => (
                                    <motion.div
                                        key={fav.id}
                                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.5, delay: index * 0.1, type: 'spring', damping: 20 }}
                                        className="group relative"
                                    >
                                        {/* Card Wrapper */}
                                        <div className="relative h-full rounded-[3.5rem] p-5 flex flex-col border border-white/[0.08] overflow-hidden bg-[#0a0a0a] shadow-[0_40px_100px_rgba(0,0,0,0.6)] transition-all duration-500 hover:border-white/10">

                                            {/* Header */}
                                            <div className="flex justify-between items-center p-6 pb-2">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                                                        <span className="text-[10px] font-black text-brand-green uppercase tracking-[0.3em] opacity-80">System.Verified</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black leading-tight tracking-tighter text-white group-hover:text-brand-green transition-colors">{fav.componentName}</h3>
                                                </div>
                                                <button
                                                    onClick={(e) => handleRemove(e, fav.componentId)}
                                                    className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-90 flex items-center justify-center group/trash"
                                                    title="Eliminate from vault"
                                                >
                                                    <Trash2 size={20} className="group-hover/trash:rotate-12 transition-transform" />
                                                </button>
                                            </div>

                                            {/* Preview/Code Container */}
                                            <div className="mt-4 relative rounded-[2rem] overflow-hidden border border-white/5 bg-black/20 h-[400px]">
                                                {/* Tabs Toggle */}
                                                <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex p-1.5 bg-black/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl">
                                                    <button
                                                        onClick={() => toggleTab(fav.id, 'preview')}
                                                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab[fav.id] !== 'code' ? 'bg-brand-green text-black shadow-[0_0_20px_rgba(0,255,0,0.3)]' : 'text-white/40 hover:text-white'}`}
                                                    >
                                                        <Eye size={12} strokeWidth={3} /> Preview
                                                    </button>
                                                    <button
                                                        onClick={() => toggleTab(fav.id, 'code')}
                                                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab[fav.id] === 'code' ? 'bg-brand-green text-black shadow-[0_0_20px_rgba(0,255,0,0.3)]' : 'text-white/40 hover:text-white'}`}
                                                    >
                                                        <Code2 size={12} strokeWidth={3} /> Source
                                                    </button>
                                                </div>

                                                <div className="h-full">
                                                    <AnimatePresence mode="wait">
                                                        {activeTab[fav.id] === 'code' ? (
                                                            <motion.div
                                                                key="code"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                className="h-full relative font-mono text-[11px] leading-relaxed p-8 pt-20 overflow-auto scrollbar-hide text-brand-green/70"
                                                            >
                                                                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
                                                                <pre className="relative z-0 select-all">{fav.componentCode}</pre>
                                                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />

                                                                <button
                                                                    onClick={(e) => handleCopy(e, fav.componentCode, fav.id)}
                                                                    className="absolute bottom-6 right-6 z-20 p-4 rounded-2xl bg-brand-green text-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group/copy"
                                                                >
                                                                    {copiedId === fav.id ? (
                                                                        <><Check size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">COPIED</span></>
                                                                    ) : (
                                                                        <><Copy size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">COPY CODE</span></>
                                                                    )}
                                                                </button>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="preview"
                                                                initial={{ opacity: 0, scale: 0.98 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 1.02 }}
                                                                className="h-full p-4 flex items-center justify-center bg-[#050505] p-preview"
                                                            >
                                                                <div className="w-full h-full rounded-2xl overflow-hidden border border-white/5 relative bg-[#0a0a0a]">
                                                                    {fav.fullComponent?.preview ? (
                                                                        <div className="w-full h-full transform scale-[0.8] origin-center">
                                                                            {fav.fullComponent.preview()}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center bg-black/40">
                                                                            <Box size={40} className="text-white/5" />
                                                                            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">Live Preview Unavailable for Custom Imports</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="p-6 pt-10 flex gap-4 mt-auto">
                                                <Link
                                                    to={`/library?id=${fav.componentId}&tab=preview`}
                                                    className="group/btn relative flex-[2.5] py-5 rounded-[1.5rem] bg-brand-green text-black font-black uppercase tracking-[0.25em] text-[10px] shadow-[0_20px_50px_rgba(0,255,0,0.2)] hover:shadow-[0_0_60px_rgba(0,255,0,0.4)] transition-all flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 overflow-hidden"
                                                >
                                                    <span className="relative z-10 flex items-center gap-2">
                                                        Launch Sector <Zap size={14} fill="currentColor" className="group-hover/btn:animate-pulse" />
                                                    </span>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                                                </Link>
                                                <Link
                                                    to={`/library?id=${fav.componentId}`}
                                                    className="flex-1 py-5 rounded-[1.5rem] bg-white/[0.03] border border-white/10 text-white/70 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-3 active:scale-95 group/details"
                                                >
                                                    Details <ExternalLink size={14} className="group-hover/details:translate-x-0.5 group-hover/details:-translate-y-0.5 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .text-stroke-premium {
                    -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.08);
                    color: transparent;
                }
                .group:hover .text-stroke-premium {
                    -webkit-text-stroke: 1.5px rgba(0, 255, 0, 0.2);
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .p-preview {
                    position: relative;
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}} />
        </main>
    );
};

export default FavoritesPage;
