import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu as MenuIcon, X, ChevronRight, Home, Lock } from 'lucide-react';
import ComponentDetail from './sections/ComponentDetail/index';
import { componentList, ComponentItem } from '../../data/componentData';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface Category {
    name: string;
    items: ComponentItem[];
}

const LibraryPage = () => {
    const { user } = useAuth();
    const isPro = user && !user.isAnonymous;
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const idFromUrl = queryParams.get('id');

    const [firebaseComponents, setFirebaseComponents] = useState<ComponentItem[]>([]);

    const allComponents = [...componentList, ...firebaseComponents];

    const defaultComponent = allComponents.find(c => c.id === idFromUrl) || allComponents.find(c => c.id === 'corner-border-button') || allComponents[0];
    const [activeComponent, setActiveComponent] = useState<ComponentItem>(defaultComponent);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'components'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.componentName,
                    description: data.description,
                    category: 'custom',
                    code: data.code,
                    vibePrompt: "Community generated layout",
                    preview: () => (
                        <div className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight opacity-20 px-8 text-center animate-pulse">
                            {data.componentName}
                        </div>
                    ),
                    uploader: data.uploaderName || 'Anonymous'
                } as ComponentItem;
            });
            setFirebaseComponents(fetched);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const found = allComponents.find(c => c.id === idFromUrl);
        if (found) {
            setActiveComponent(found);
        }
    }, [idFromUrl, firebaseComponents]);

    useEffect(() => {
        if (!idFromUrl && allComponents.length > 0) {
            navigate(`/library?id=${defaultComponent.id}`, { replace: true });
        }
    }, [idFromUrl, navigate, defaultComponent.id, allComponents.length]);

    const handleComponentSelect = (item: ComponentItem) => {
        setActiveComponent(item);
        setIsMobileMenuOpen(false);
        navigate(`/library?id=${item.id}`, { replace: true });
    };

    const categories: Category[] = [
        { name: "Buttons/hover effects", items: allComponents.filter(item => item.category === 'button') },
        { name: "Text Animations", items: allComponents.filter(item => item.category === 'text') },
        { name: "Visual Effects", items: allComponents.filter(item => item.category === 'effect') },
        { name: "3D Design", items: allComponents.filter(item => item.category === '3d') },
        { name: "Backgrounds", items: allComponents.filter(item => item.category === 'background') },
        { name: "Cursor Effects", items: allComponents.filter(item => item.category === 'cursor') },
        { name: "Community Uploads", items: allComponents.filter(item => item.category === 'custom') },
    ].filter(cat => cat.items.length > 0);

    return (
        <div className="h-dvh bg-brand-black text-white flex flex-col md:flex-row overflow-hidden relative pt-[73px]">

            {/* ── Mobile top nav bar ── */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5 shrink-0 z-30">
                <div className="flex items-center gap-3 min-w-0">
                    <Link to="/" className="shrink-0 p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white transition-colors">
                        <Home size={14} />
                    </Link>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Viewing</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-brand-green truncate">{activeComponent.title}</span>
                            {activeComponent.isPremium && !isPro && <Lock size={9} className="text-amber-400 shrink-0" />}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-brand-green/10 border border-brand-green/20 rounded-full text-brand-green text-xs font-bold uppercase tracking-widest shrink-0 ml-2"
                >
                    <MenuIcon size={13} />
                    Browse
                </button>
            </div>

            {/* ── Mobile full-screen menu overlay ── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        data-lenis-prevent
                        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[999] md:hidden overflow-y-auto p-6"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/"
                                    className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Home size={16} />
                                </Link>
                                <h3 className="text-2xl font-display uppercase tracking-tight">Components</h3>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-3 bg-white/5 rounded-full text-white/40"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {categories.map((cat, idx) => (
                            <div key={idx} className="mb-8">
                                <h4 className="text-brand-green text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full" />
                                    {cat.name}
                                </h4>
                                <ul className="space-y-1.5">
                                    {cat.items.map((item) => (
                                        <li
                                            key={item.id}
                                            onClick={() => handleComponentSelect(item)}
                                            className={`p-3 rounded-xl flex items-center justify-between transition-all ${activeComponent.id === item.id
                                                ? 'bg-brand-green text-black font-bold'
                                                : 'bg-white/5 text-white/60 active:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-sm truncate">{item.title}</span>
                                                {item.isPremium && !isPro && activeComponent.id !== item.id && (
                                                    <Lock size={9} className="text-amber-400 shrink-0" />
                                                )}
                                            </div>
                                            <ChevronRight size={14} className={activeComponent.id === item.id ? '' : 'opacity-20'} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Desktop sidebar ── */}
            <aside data-lenis-prevent className="hidden md:block w-64 shrink-0 border-r border-white/5 h-full overflow-y-auto p-6 pt-8">
                <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-brand-green text-xs font-bold uppercase tracking-widest mb-8 transition-colors">
                    <Home size={14} />
                    Home
                </Link>
                {categories.map((cat, idx) => (
                    <div key={idx} className="mb-10">
                        <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">{cat.name}</h4>
                        <ul className="space-y-4">
                            {cat.items.map((item) => (
                                <li
                                    key={item.id}
                                    onClick={() => handleComponentSelect(item)}
                                    className={`cursor-pointer text-sm transition-colors hover:text-brand-green flex items-center gap-2 ${activeComponent.id === item.id ? 'text-brand-green font-bold' : 'text-white/60'
                                        }`}
                                >
                                    <span className="truncate flex-1">{item.title}</span>
                                    {item.isPremium && !isPro && (
                                        <Lock
                                            size={9}
                                            className={`shrink-0 ${activeComponent.id === item.id ? 'text-amber-400' : 'text-amber-500/40'}`}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </aside>

            <main data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto p-4 pt-5 md:p-12 md:pt-12">
                <div className="max-w-6xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeComponent.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            <ComponentDetail
                                item={activeComponent}
                                onBack={() => { }}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default LibraryPage;
