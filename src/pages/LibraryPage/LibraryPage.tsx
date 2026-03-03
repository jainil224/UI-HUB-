import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, X, ChevronRight } from 'lucide-react';
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

    // Update URL when component changes
    const handleComponentSelect = (item: ComponentItem) => {
        setActiveComponent(item);
        setIsMobileMenuOpen(false);
        navigate(`/library?id=${item.id}`, { replace: true });
    };

    // Grouping the structured data into categories dynamically
    const categories: Category[] = [
        {
            name: "Text Animations",
            items: componentList.filter(item => item.category === 'text')
        },
        {
            name: "Visual Effects",
            items: componentList.filter(item => item.category === 'effect')
        },
        {
            name: "Backgrounds",
            items: componentList.filter(item => item.category === 'background')
        }
    ];

    return (
        <div className="h-screen bg-brand-black text-white flex flex-col md:flex-row overflow-hidden relative">
            {/* Mobile Nav Trigger */}
            <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5 sticky top-0 z-30 backdrop-blur-md shrink-0">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Currently Viewing</span>
                    <span className="text-sm font-bold text-brand-green">{activeComponent.title}</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-green/10 border border-brand-green/20 rounded-full text-brand-green text-xs font-bold uppercase tracking-widest"
                >
                    <MenuIcon size={14} />
                    Browse
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] md:hidden overflow-y-auto p-8"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-3xl font-display uppercase tracking-tight">Components</h3>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {categories.map((cat, idx) => (
                            <div key={idx} className="mb-12">
                                <h4 className="text-brand-green text-[10px] font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full" />
                                    {cat.name}
                                </h4>
                                <ul className="space-y-2">
                                    {cat.items.map((item) => (
                                        <li
                                            key={item.id}
                                            onClick={() => handleComponentSelect(item)}
                                            className={`p-4 rounded-2xl flex items-center justify-between transition-all group ${activeComponent.id === item.id ? 'bg-brand-green text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            <span className="text-lg">{item.title}</span>
                                            {activeComponent.id === item.id ? <ChevronRight size={18} /> : <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-white/5 p-6 h-full overflow-y-auto hidden md:block shrink-0 scrollbar-hide pt-24">
                {categories.map((cat, idx) => (
                    <div key={idx} className="mb-10">
                        <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">{cat.name}</h4>
                        <ul className="space-y-4">
                            {cat.items.map((item) => (
                                <li
                                    key={item.id}
                                    onClick={() => handleComponentSelect(item)}
                                    className={`cursor-pointer text-sm transition-colors hover:text-brand-green flex items-center justify-between ${activeComponent.id === item.id ? 'text-brand-green font-bold' : 'text-white/60'}`}
                                >
                                    <span>{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 h-full overflow-y-auto scrollbar-hide pt-24">
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
