import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
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

    // Update URL when component changes
    const handleComponentSelect = (item: ComponentItem) => {
        setActiveComponent(item);
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
        <div className="pt-20 bg-brand-black min-h-screen text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 p-6 overflow-y-auto hidden md:block shrink-0">
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
            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
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
