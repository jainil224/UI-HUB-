import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu as MenuIcon, X, ChevronRight, ChevronDown, Home, Lock, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ComponentDetail from './sections/ComponentDetail/index';
import { componentList, ComponentItem } from '../../data/componentData';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface Category {
    name: string;
    items: ComponentItem[];
}

const CATEGORY_ICONS: Record<string, string> = {
    "Buttons/hover effects": "⚡",
    "Text Animations": "✦",
    "Visual Effects": "◈",
    "3D Design": "⬡",
    "Backgrounds": "◉",
    "Cursor Effects": "⊕",
    "Portfolios": "▣",
    "Community Uploads": "✿",
};

const LibraryPage = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, isPro } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const idFromUrl = queryParams.get('id');

    const [firebaseComponents, setFirebaseComponents] = useState<ComponentItem[]>([]);

    const allComponents = [...componentList, ...firebaseComponents];

    const defaultComponent = allComponents.find(c => c.id === idFromUrl) || allComponents.find(c => c.id === 'corner-border-button') || allComponents[0];
    const [activeComponent, setActiveComponent] = useState<ComponentItem>(defaultComponent);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

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

    const categories: Category[] = [
        { name: "Buttons/hover effects", items: allComponents.filter(item => item.category === 'button') },
        { name: "Text Animations", items: allComponents.filter(item => item.category === 'text') },
        { name: "Visual Effects", items: allComponents.filter(item => item.category === 'effect') },
        { name: "3D Design", items: allComponents.filter(item => item.category === '3d') },
        { name: "Backgrounds", items: allComponents.filter(item => item.category === 'background') },
        { name: "Cursor Effects", items: allComponents.filter(item => item.category === 'cursor') },
        { name: "Portfolios", items: allComponents.filter(item => item.category === 'portfolios') },
        { name: "Community Uploads", items: allComponents.filter(item => item.category === 'custom') },
    ].filter(cat => cat.items.length > 0);

    // Initial expansion: expand the active component's category
    useEffect(() => {
        if (activeComponent) {
            const activeCat = categories.find(cat => cat.items.some(item => item.id === activeComponent.id));
            if (activeCat) {
                setExpandedCategories(prev => {
                    if (!prev.includes(activeCat.name)) {
                        return [...prev, activeCat.name];
                    }
                    return prev;
                });
            }
        }
    }, [activeComponent.id]);

    const toggleCategory = (name: string) => {
        setExpandedCategories(prev =>
            prev.includes(name)
                ? prev.filter(c => c !== name)
                : [...prev, name]
        );
    };

    const handleComponentSelect = (item: ComponentItem) => {
        setActiveComponent(item);
        setIsMobileMenuOpen(false);
        navigate(`/library?id=${item.id}`, { replace: true });
    };

    const totalComponents = allComponents.length;

    const ThemeToggle = () => (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center ${
                theme === 'dark' 
                ? 'bg-white/[0.04] border-white/[0.06] text-white/40 hover:text-brand-green hover:border-brand-green/30' 
                : 'bg-black/[0.04] border-black/[0.06] text-black/40 hover:text-[#5FA3D6] hover:border-[#5FA3D6]/30'
            }`}
        >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
    );

    return (
        <>
            <style>{`
                .sidebar-scroll::-webkit-scrollbar {
                    width: 3px;
                }
                .sidebar-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar-scroll::-webkit-scrollbar-thumb {
                    background: ${theme === 'dark' ? 'linear-gradient(to bottom, #00ff9f, #00cc7a, #00ff9f)' : 'linear-gradient(to bottom, #5FA3D6, #2C5C85, #5FA3D6)'};
                    border-radius: 99px;
                    box-shadow: 0 0 8px ${theme === 'dark' ? 'rgba(0, 255, 159, 0.6)' : 'rgba(95, 163, 214, 0.4)'};
                }
                .sidebar-scroll::-webkit-scrollbar-thumb:hover {
                    background: ${theme === 'dark' ? 'linear-gradient(to bottom, #00ff9f, #00e68a)' : 'linear-gradient(to bottom, #5FA3D6, #4A8CBF)'};
                    box-shadow: 0 0 12px ${theme === 'dark' ? 'rgba(0, 255, 159, 0.9)' : 'rgba(95, 163, 214, 0.6)'};
                }
                .sidebar-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: ${theme === 'dark' ? '#00ff9f' : '#5FA3D6'} transparent;
                }
                .main-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .main-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .main-scroll::-webkit-scrollbar-thumb {
                    background: ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
                    border-radius: 99px;
                }
                .main-scroll::-webkit-scrollbar-thumb:hover {
                    background: ${theme === 'dark' ? 'rgba(0, 255, 159, 0.3)' : 'rgba(95, 163, 214, 0.3)'};
                }
                .main-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} transparent;
                }
                .nav-item-glow {
                    box-shadow: 0 0 20px ${theme === 'dark' ? 'rgba(0, 255, 159, 0.15)' : 'rgba(95, 163, 214, 0.15)'}, inset 0 1px 0 ${theme === 'dark' ? 'rgba(0, 255, 159, 0.1)' : 'rgba(95, 163, 214, 0.1)'};
                }
            `}</style>

            <div className={`h-dvh flex flex-col md:flex-row overflow-hidden relative pt-[73px] transition-colors duration-300 ${theme === 'dark' ? 'bg-brand-black text-white' : 'bg-[#CFE6F7] text-[#0A0F14]'}`}>

                {/* ── Mobile top nav bar ── */}
                <div className={`md:hidden flex items-center justify-between px-4 py-3 border-b shrink-0 z-30 backdrop-blur-xl ${theme === 'dark' ? 'bg-[#050505]/90 border-white/[0.06]' : 'bg-white/70 border-black/[0.06]'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <Link to="/" className={`shrink-0 p-2 rounded-xl border transition-all ${
                            theme === 'dark' 
                            ? 'bg-white/[0.04] border-white/[0.06] text-white/40 hover:text-brand-green hover:border-brand-green/30' 
                            : 'bg-black/[0.04] border-black/[0.06] text-black/40 hover:text-[#5FA3D6] hover:border-[#5FA3D6]/30'
                        }`}>
                            <Home size={14} />
                        </Link>
                        <ThemeToggle />
                        <div className="flex flex-col min-w-0">
                            <span className={`text-[8px] uppercase tracking-[0.2em] font-black ${theme === 'dark' ? 'text-white/30' : 'text-black/30'}`}>Now Viewing</span>
                            <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-brand-green' : 'text-[#2C5C85]'}`}>{activeComponent.title}</span>
                                {activeComponent.isPremium && !isPro && <Lock size={9} className="text-amber-400 shrink-0" />}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-brand-green/10 border border-brand-green/20 rounded-full text-brand-green text-[10px] font-black uppercase tracking-widest shrink-0 ml-2"
                    >
                        <MenuIcon size={12} />
                        Browse
                    </button>
                </div>

                {/* ── Mobile full-screen menu overlay ── */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            data-lenis-prevent
                            className="fixed inset-0 bg-[#030303]/98 backdrop-blur-2xl z-[999] md:hidden overflow-y-auto sidebar-scroll p-6 pt-8"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/"
                                        className="p-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white/40 hover:text-brand-green hover:border-brand-green/30 transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Home size={16} />
                                    </Link>
                                    <div>
                                        <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black">UI HUB</p>
                                        <h3 className="text-xl font-display uppercase tracking-tight text-white">Component Library</h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white/40 hover:text-white hover:border-white/10 transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-xl bg-brand-green/5 border border-brand-green/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shadow-[0_0_6px_rgba(0,255,159,0.8)]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-green/60">{totalComponents} Components Available</span>
                            </div>

                            {categories.map((cat, idx) => {
                                const isExpanded = expandedCategories.includes(cat.name);
                                const icon = CATEGORY_ICONS[cat.name] || '◆';
                                return (
                                    <div key={idx} className="mb-3">
                                        <button
                                            onClick={() => toggleCategory(cat.name)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${isExpanded ? 'bg-brand-green/8 border-brand-green/20' : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`text-base transition-colors ${isExpanded ? 'text-brand-green' : 'text-white/20'}`}>{icon}</span>
                                                <h4 className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isExpanded ? 'text-brand-green' : 'text-white/50'}`}>
                                                    {cat.name}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-bold tabular-nums px-1.5 py-0.5 rounded-md transition-all ${isExpanded ? 'bg-brand-green/20 text-brand-green' : 'bg-white/5 text-white/20'}`}>{cat.items.length}</span>
                                                <motion.div animate={{ rotate: isExpanded ? 0 : -90 }} transition={{ duration: 0.2 }} className={`transition-colors ${isExpanded ? 'text-brand-green' : 'text-white/20'}`}>
                                                    <ChevronDown size={14} />
                                                </motion.div>
                                            </div>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.ul
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                    className="space-y-1 overflow-hidden mt-1 pl-2"
                                                >
                                                    {cat.items.map((item) => (
                                                        <li
                                                            key={item.id}
                                                            onClick={() => handleComponentSelect(item)}
                                                            className={`p-3 pl-4 rounded-xl flex items-center justify-between transition-all border cursor-pointer ${activeComponent.id === item.id
                                                                ? 'bg-brand-green/10 border-brand-green/30 nav-item-glow'
                                                                : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/[0.05]'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className={`w-1 h-1 rounded-full shrink-0 transition-all ${activeComponent.id === item.id ? 'bg-brand-green shadow-[0_0_6px_rgba(0,255,159,0.8)]' : 'bg-white/10'}`} />
                                                                <span className={`text-sm truncate transition-colors ${activeComponent.id === item.id ? 'text-brand-green font-bold' : 'text-white/60'}`}>{item.title}</span>
                                                                {item.isPremium && !isPro && activeComponent.id !== item.id && (
                                                                    <Lock size={9} className="text-amber-400/60 shrink-0" />
                                                                )}
                                                            </div>
                                                            {activeComponent.id === item.id && (
                                                                <ChevronRight size={12} className="text-brand-green shrink-0" />
                                                            )}
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Desktop sidebar ── */}
                <aside
                    data-lenis-prevent
                    className={`hidden md:flex flex-col w-64 shrink-0 h-full border-r backdrop-blur-sm relative transition-colors duration-300 ${
                        theme === 'dark' ? 'bg-[#030303]/60 border-white/[0.05]' : 'bg-white/40 border-black/[0.05]'
                    }`}
                >
                    {/* Sidebar top gradient accent */}
                    <div className={`absolute inset-x-0 top-0 h-px ${theme === 'dark' ? 'bg-gradient-to-r from-transparent via-brand-green/30 to-transparent' : 'bg-gradient-to-r from-transparent via-[#5FA3D6]/30 to-transparent'}`} />
                    <div className={`absolute top-0 left-0 right-0 h-32 pointer-events-none ${theme === 'dark' ? 'bg-gradient-to-b from-brand-green/[0.03] via-transparent to-transparent' : 'bg-gradient-to-b from-[#5FA3D6]/05 via-transparent to-transparent'}`} />

                    {/* Sidebar Header */}
                    <div className={`shrink-0 px-5 pt-6 pb-4 border-b ${theme === 'dark' ? 'border-white/[0.04]' : 'border-black/[0.04]'}`}>
                        <div className="flex items-center justify-between mb-5">
                            <Link
                                to="/"
                                className={`group flex items-center gap-2.5 transition-all duration-300 ${
                                    theme === 'dark' ? 'text-white/30 hover:text-brand-green' : 'text-black/30 hover:text-[#2C5C85]'
                                }`}
                            >
                                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                                    theme === 'dark' 
                                    ? 'bg-white/[0.03] border-white/[0.06] group-hover:border-brand-green/30 group-hover:bg-brand-green/5' 
                                    : 'bg-black/[0.03] border-black/[0.06] group-hover:border-[#5FA3D6]/30 group-hover:bg-[#5FA3D6]/5'
                                }`}>
                                    <Home size={12} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Home</span>
                            </Link>
                            <ThemeToggle />
                        </div>

                        {/* Stats bar */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                            theme === 'dark' 
                            ? 'bg-brand-green/[0.04] border-brand-green/[0.08]' 
                            : 'bg-[#5FA3D6]/[0.1] border-[#5FA3D6]/[0.2]'
                        }`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${
                                theme === 'dark' 
                                ? 'bg-brand-green shadow-[0_0_6px_rgba(0,255,159,0.8)]' 
                                : 'bg-[#2C5C85] shadow-[0_0_6px_rgba(44,92,133,0.4)]'
                            }`} />
                            <span className={`text-[8px] font-black uppercase tracking-[0.15em] ${theme === 'dark' ? 'text-brand-green/50' : 'text-[#2C5C85]/70'}`}>{totalComponents} Components Live</span>
                        </div>
                    </div>

                    {/* Sidebar scrollable nav */}
                    <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-1">
                        {categories.map((cat, idx) => {
                            const isExpanded = expandedCategories.includes(cat.name);
                            const icon = CATEGORY_ICONS[cat.name] || '◆';
                            const hasActiveItem = cat.items.some(item => item.id === activeComponent.id);

                            return (
                                <div key={idx}>
                                    <button
                                        onClick={() => toggleCategory(cat.name)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-left ${
                                            hasActiveItem && isExpanded
                                                ? theme === 'dark' ? 'text-brand-green' : 'text-[#2C5C85]'
                                                : isExpanded
                                                ? theme === 'dark' ? 'text-brand-green' : 'text-[#2C5C85]'
                                                : theme === 'dark' ? 'text-white/35 hover:text-white/70' : 'text-black/35 hover:text-black/70'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className={`text-sm transition-colors ${
                                                isExpanded 
                                                ? theme === 'dark' ? 'text-brand-green' : 'text-[#5FA3D6]' 
                                                : theme === 'dark' ? 'text-white/20 group-hover:text-white/40' : 'text-black/20 group-hover:text-black/40'
                                            }`}>{icon}</span>
                                            <h4 className="text-[9px] font-black uppercase tracking-[0.18em]">
                                                {cat.name}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {isExpanded && (
                                                <span className={`text-[8px] font-bold tabular-nums ${theme === 'dark' ? 'text-brand-green/40' : 'text-[#5FA3D6]/40'}`}>{cat.items.length}</span>
                                            )}
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 0 : -90 }}
                                                transition={{ duration: 0.2 }}
                                                className={`transition-colors ${
                                                    isExpanded 
                                                    ? theme === 'dark' ? 'text-brand-green/60' : 'text-[#2C5C85]/60' 
                                                    : theme === 'dark' ? 'text-white/20' : 'text-black/20'
                                                }`}
                                            >
                                                <ChevronDown size={11} />
                                            </motion.div>
                                        </div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.ul
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                                className="overflow-hidden pb-2"
                                            >
                                                <div className={`ml-3 pl-3 border-l space-y-0.5 mt-0.5 ${theme === 'dark' ? 'border-white/[0.05]' : 'border-black/[0.05]'}`}>
                                                    {cat.items.map((item) => {
                                                        const isActive = activeComponent.id === item.id;
                                                        return (
                                                            <li
                                                                key={item.id}
                                                                onClick={() => handleComponentSelect(item)}
                                                                className={`group/item cursor-pointer flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg transition-all duration-150 ${
                                                                    isActive
                                                                        ? theme === 'dark' ? 'bg-brand-green/[0.08] text-brand-green' : 'bg-[#5FA3D6]/[0.15] text-[#2C5C85]'
                                                                        : theme === 'dark' ? 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]' : 'text-black/40 hover:text-black/80 hover:bg-black/[0.03]'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <div className={`w-1 h-1 rounded-full shrink-0 transition-all ${isActive ? 'bg-brand-green shadow-[0_0_5px_rgba(0,255,159,0.7)]' : 'bg-white/10 group-hover/item:bg-white/25'}`} />
                                                                    <span className={`text-[11px] truncate transition-colors ${isActive ? 'font-bold' : 'font-medium'}`}>{item.title}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    {item.isPremium && !isPro && (
                                                                        <Lock size={8} className={`${isActive ? 'text-amber-400' : 'text-amber-400/50'}`} />
                                                                    )}
                                                                    {isActive && (
                                                                        <div className={`w-1 h-3 rounded-full ${
                                                                            theme === 'dark' 
                                                                            ? 'bg-brand-green shadow-[0_0_4px_rgba(0,255,159,0.7)]' 
                                                                            : 'bg-[#2C5C85] shadow-[0_0_4px_rgba(44,92,133,0.4)]'
                                                                        }`} />
                                                                    )}
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </div>
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}

                        {/* Bottom padding */}
                        <div className="h-6" />
                    </nav>

                    {/* Sidebar bottom accent */}
                    <div className={`absolute inset-x-0 bottom-0 h-px ${theme === 'dark' ? 'bg-gradient-to-r from-transparent via-brand-green/20 to-transparent' : 'bg-gradient-to-r from-transparent via-[#5FA3D6]/20 to-transparent'}`} />
                </aside>

                {/* ── Main content ── */}
                <main data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto main-scroll p-4 pt-5 md:p-12 md:pt-12">
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
        </>
    );
};

export default LibraryPage;
