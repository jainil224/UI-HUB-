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
        <main className="min-h-screen pt-32 pb-20 px-4 relative overflow-hidden bg-brand-black">
            {/* Immersive Premium Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-green/[0.07] blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/[0.05] blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.25] mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-black to-brand-black opacity-80" />
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
                            <span>System.Secure_Vault</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, type: 'spring', damping: 20 }}
                            className="text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-[0.85]"
                        >
                            MY <span className="text-brand-green text-stroke-premium">VAULT</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-white/40 text-lg md:text-xl font-medium max-w-xl leading-relaxed"
                        >
                            Deterministic high-performance components. Optimized for <span className="text-white/80">60fps</span> production environments.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Link
                            to="/library"
                            className="group relative flex items-center gap-4 px-10 py-5 rounded-[2.5rem] bg-white/[0.03] border border-white/10 text-white/70 hover:text-brand-green hover:border-brand-green/40 transition-all overflow-hidden shadow-2xl backdrop-blur-xl"
                        >
                            <Library size={20} className="relative z-10 transition-transform group-hover:rotate-12" />
                            <span className="relative z-10 text-xs font-black uppercase tracking-[0.2em]">Open Catalog</span>
                            <div className="absolute inset-0 bg-brand-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </motion.div>
                </header>

                <div className="w-full">
                    {enrichedFavorites.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-[4rem] p-32 text-center border border-white/5 relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.5)] bg-white/[0.01] backdrop-blur-3xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-brand-green/[0.03] to-transparent pointer-events-none" />
                            <div className="w-28 h-28 bg-white/[0.02] rounded-[2.5rem] border border-white/10 flex items-center justify-center mx-auto mb-10 rotate-[15deg] group-hover:rotate-0 transition-all duration-700 shadow-2xl">
                                <Box size={48} className="text-white/10 group-hover:text-brand-green transition-colors" />
                            </div>
                            <h3 className="text-3xl font-display font-black mb-4 tracking-tight text-white uppercase">Vault Offline</h3>
                            <p className="text-white/30 mb-12 max-w-md mx-auto font-medium text-lg leading-relaxed">Your personal asset repository is currently empty. Synchronize components from the library.</p>
                            <Link
                                to="/library"
                                className="inline-flex items-center gap-4 px-12 py-6 rounded-2xl bg-brand-green text-black font-display font-black uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_60px_rgba(0,255,0,0.4)] transition-all hover:-translate-y-1 active:scale-95"
                            >
                                <Library size={18} /> Enter Library
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            <AnimatePresence mode='wait'>
                                {enrichedFavorites.map((fav, index) => (
                                    <motion.div
                                        key={fav.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ 
                                            duration: 0.5, 
                                            delay: index * 0.05,
                                            ease: [0.23, 1, 0.32, 1]
                                        }}
                                        className="group relative h-full"
                                    >
                                        {/* Card Outer Glow */}
                                        <div className="absolute inset-0 bg-brand-green/0 group-hover:bg-brand-green/[0.03] blur-3xl transition-all duration-700 rounded-[3.5rem] -z-10" />
                                        
                                        <div className="gpu-accelerated relative h-full rounded-[3.5rem] p-6 flex flex-col border border-white/[0.08] group-hover:border-brand-green/30 overflow-hidden bg-[#050505] shadow-2xl transition-all duration-500">
                                            {/* Top Utility Bar */}
                                            <div className="flex justify-between items-center px-4 pb-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-terminal-green-blink" />
                                                        <span className="text-[9px] font-black text-brand-green uppercase tracking-[0.4em] opacity-60">Verified Asset</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black leading-none tracking-tighter text-white group-hover:text-brand-green transition-colors duration-300">{fav.componentName}</h3>
                                                </div>
                                                <button
                                                    onClick={(e) => handleRemove(e, fav.componentId)}
                                                    className="w-11 h-11 rounded-full bg-white/[0.03] border border-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-90 flex items-center justify-center group/trash"
                                                >
                                                    <Trash2 size={18} className="group-hover/trash:rotate-12 transition-transform" />
                                                </button>
                                            </div>

                                            {/* Preview/Source Container */}
                                            <div className="mt-4 relative rounded-[2.5rem] overflow-hidden border border-white/[0.05] bg-black/40 h-[380px] group/container">
                                                {/* Tab Switcher Overlay */}
                                                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex p-1 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
                                                    <button
                                                        onClick={() => toggleTab(fav.id, 'preview')}
                                                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab[fav.id] !== 'code' ? 'bg-brand-green text-black' : 'text-white/40 hover:text-white'}`}
                                                    >
                                                        Preview
                                                    </button>
                                                    <button
                                                        onClick={() => toggleTab(fav.id, 'code')}
                                                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab[fav.id] === 'code' ? 'bg-brand-green text-black' : 'text-white/40 hover:text-white'}`}
                                                    >
                                                        Source
                                                    </button>
                                                </div>

                                                <div className="h-full relative">
                                                    <AnimatePresence mode="wait">
                                                        {activeTab[fav.id] === 'code' ? (
                                                            <motion.div
                                                                key="code"
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                className="h-full font-mono text-[10px] leading-relaxed p-8 pt-16 overflow-auto custom-scrollbar text-brand-green/60"
                                                            >
                                                                <pre className="select-all">{fav.componentCode}</pre>
                                                                <button
                                                                    onClick={(e) => handleCopy(e, fav.componentCode, fav.id)}
                                                                    className="absolute bottom-6 right-6 z-40 px-5 py-3 rounded-xl bg-brand-green text-black font-black text-[9px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-2"
                                                                >
                                                                    {copiedId === fav.id ? <Check size={14} /> : <Copy size={14} />}
                                                                    {copiedId === fav.id ? 'Copied' : 'Copy Code'}
                                                                </button>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="preview"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                className="h-full p-4 flex items-center justify-center bg-[#030303] sharp-rendering"
                                                            >
                                                                <div className="w-full h-full flex items-center justify-center transform scale-[0.8] origin-center">
                                                                    {fav.fullComponent?.preview ? (
                                                                        fav.fullComponent.preview()
                                                                    ) : (
                                                                        <div className="flex flex-col items-center gap-4 text-white/10 uppercase tracking-[0.3em] font-black text-[8px]">
                                                                            <Box size={32} />
                                                                            No Preview Available
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* Bottom Action Footer */}
                                            <div className="p-4 pt-8 flex gap-3 mt-auto">
                                                <Link
                                                    to={`/library?id=${fav.componentId}&tab=preview`}
                                                    className="group/btn relative flex-[3] py-5 rounded-[1.5rem] bg-brand-green text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_15px_35px_rgba(0,255,0,0.15)] hover:shadow-[0_0_50px_rgba(0,255,0,0.3)] transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5 active:scale-95 overflow-hidden"
                                                >
                                                    <span className="relative z-10 flex items-center gap-2">
                                                        Launch <Zap size={14} fill="currentColor" />
                                                    </span>
                                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                                </Link>
                                                <Link
                                                    to={`/library?id=${fav.componentId}`}
                                                    className="flex-1 py-5 rounded-[1.5rem] bg-white/[0.03] border border-white/10 text-white/50 font-black uppercase tracking-[0.15em] text-[10px] hover:bg-white/10 hover:text-white hover:border-white/20 transition-all flex items-center justify-center group/det hover:-translate-y-0.5"
                                                >
                                                    <Eye size={14} className="group-hover/det:scale-110 transition-transform" />
                                                </Link>
                                            </div>

                                            {/* Edge Accents (Testimonials style) */}
                                            <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-white/0 group-hover:border-brand-green/30 transition-all duration-700 rounded-tr-[3.5rem]" />
                                            <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-white/0 group-hover:border-brand-green/30 transition-all duration-700 rounded-bl-[3.5rem]" />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
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
                    -webkit-text-stroke: 1.5px rgba(0, 255, 0, 0.15);
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 255, 0, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 0, 0.3); }
            `}} />
        </main>
    );
};

export default FavoritesPage;
