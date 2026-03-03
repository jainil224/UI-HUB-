import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ComponentDetail from './sections/ComponentDetail';

interface LibraryItem {
    id: string;
    name: string;
    prompt?: string;
    status?: string;
}

interface Category {
    name: string;
    items: LibraryItem[];
}

const LibraryPage = () => {
    const [activeComponentId, setActiveComponentId] = React.useState<string>("font-weight");

    const categories: Category[] = [
        {
            name: "Buttons",
            items: [
                { id: "shiny-button", name: "Animated Shiny Button", prompt: "Generate an animated shiny button with hover effects and glassmorphism." },
                { id: "live-button", name: "Live Button", prompt: "Generate a live button with pulse animation and glowing border." }
            ]
        },
        {
            name: "Text Animations",
            items: [
                { id: "blur-text", name: "Blur In Text", prompt: "Generate a text animation that blurs in from 10px to 0px with opacity fade." },
                { id: "dock-text", name: "Dock Text", prompt: "Generate a text animation with scale and opacity entry effect." },
                { id: "fade-text", name: "Fade Text", prompt: "Generate a simple opacity fade animation for text." },
                { id: "font-weight", name: "Font Weight Text", prompt: "Generate a text animation that cycles between font weights." },
                { id: "gradual-spacing", name: "Gradual Spacing Text", prompt: "Generate a text animation where letters spread out gradually." },
                { id: "letter-pull-up", name: "Letter Pull Up Text", prompt: "Generate a text animation where letters pull up from the bottom." },
                { id: "multi-direction-slide", name: "Multi Direction Slide Text", prompt: "Generate a text animation where letters slide in from different directions." },
                { id: "scale-letter", name: "Scale Letter Text", prompt: "Generate a text animation where letters scale up from zero." },
                { id: "separate-away", name: "Seperate Away Text", prompt: "Generate a text animation where letters separate away from the center." },
                { id: "wavy-text", name: "Wavy Text", prompt: "Generate a continuous wavy animation for text letters." },
                { id: "word-pull-up", name: "Word Pull Up Text", prompt: "Generate a text animation where whole words pull up from the bottom." }
            ]
        },
        {
            name: "Visual Effects",
            items: [
                { id: "liquid-glass", name: "Liquid-Glass", status: "New", prompt: "Generate a liquid glass effect for cards." },
                { id: "noise", name: "Noise", prompt: "Generate a noise background effect." },
                { id: "blur-vignette", name: "Blur Vignette", prompt: "Generate a blur vignette effect." },
                { id: "liquid-gradient", name: "liquid-gradient", prompt: "Generate a liquid gradient animation." },
                { id: "spotlight-cards", name: "Spotlight cards", prompt: "Generate cards with a spotlight hover effect." },
                { id: "image-reveal", name: "Image Reveal", prompt: "Generate an image reveal on hover animation." },
                { id: "blocks", name: "Blocks", prompt: "Generate a block-based grid animation." },
                { id: "animated-beam", name: "Animated Beam", prompt: "Generate an animated beam connecting components." }
            ]
        },
        {
            name: "Background",
            items: [
                { id: "grid-background", name: "Grid Background", prompt: "Generate an animated grid background effect." }
            ]
        }
    ];

    const allItems = React.useMemo(() => categories.flatMap(c => c.items), [categories]);
    const activeItem = allItems.find(i => i.id === activeComponentId) || allItems[3];

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
                                    onClick={() => setActiveComponentId(item.id)}
                                    className={`cursor-pointer text-sm transition-colors hover:text-brand-green flex items-center justify-between ${activeComponentId === item.id ? 'text-brand-green font-bold' : 'text-white/60'}`}
                                >
                                    <span>{item.name}</span>
                                    {item.status && (
                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ml-2 uppercase tracking-tighter ${item.status === 'New' ? 'bg-brand-green text-black' : item.status === 'Updated' ? 'text-brand-green italic' : 'border border-white/20 text-white/40'}`}>
                                            {item.status === 'Updated' ? `(${item.status})` : item.status}
                                        </span>
                                    )}
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
                        <div key={activeComponentId}>
                            <ComponentDetail
                                item={activeItem}
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
