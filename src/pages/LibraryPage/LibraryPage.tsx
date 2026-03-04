import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu as MenuIcon, X, ChevronRight, Home } from 'lucide-react';
import ComponentDetail from './sections/ComponentDetail';
import { componentList, ComponentItem } from '../../data/componentData';

interface Category {
    name: string;
    items: ComponentItem[];
}

const LibraryPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const idFromUrl = queryParams.get('id');

    const defaultComponent = componentList.find(c => c.id === idFromUrl) || componentList.find(c => c.id === 'blur-text') || componentList[0];
    const [activeComponent, setActiveComponent] = useState<ComponentItem>(defaultComponent);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleComponentSelect = (item: ComponentItem) => {
        setActiveComponent(item);
        setIsMobileMenuOpen(false);
        navigate(`/library?id=${item.id}`, { replace: true });
    };

    const categories: Category[] = [
        { name: "Text Animations", items: componentList.filter(item => item.category === 'text') },
        { name: "Visual Effects", items: componentList.filter(item => item.category === 'effect') },
        { name: "Backgrounds", items: componentList.filter(item => item.category === 'background') },
    ];

    return (
        // h-dvh handles mobile browser chrome correctly; flex-col on mobile, flex-row on desktop
        <div className="h-dvh bg-brand-black text-white flex flex-col md:flex-row overflow-hidden relative">

            {/* ── Mobile top nav bar ── */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5 shrink-0 z-30">
                {/* Left: Home link + current component */}
                <div className="flex items-center gap-3 min-w-0">
                    <Link to="/" className="shrink-0 p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white transition-colors">
                        <Home size={14} />
                    </Link>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Viewing</span>
                        <span className="text-sm font-bold text-brand-green truncate">{activeComponent.title}</span>
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
                                            <span className="text-sm">{item.title}</span>
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
            <aside className="hidden md:block w-64 shrink-0 border-r border-white/5 h-full overflow-y-auto scrollbar-hide p-6 pt-24">
                {/* Home link in desktop sidebar */}
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
                                    className={`cursor-pointer text-sm transition-colors hover:text-brand-green ${activeComponent.id === item.id ? 'text-brand-green font-bold' : 'text-white/60'
                                        }`}
                                >
                                    {item.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </aside>

            {/* ── Main scrollable content ──
                min-h-0 is critical: without it, flex-1 in a flex-col doesn't shrink
                and overflow-y-auto won't scroll — the content just overflows the screen. */}
            <main className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-4 pt-5 md:p-12 md:pt-24">
                <div className="max-w-6xl mx-auto">
                    <AnimatePresence mode="wait">
                        <div key={activeComponent.id}>
                            <ComponentDetail
                                item={activeComponent}
                                onBack={() => { }}
                            />
                        </div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default LibraryPage;
