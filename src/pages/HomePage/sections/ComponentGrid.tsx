import React from 'react';
import { useNavigate } from 'react-router-dom';
import { componentList } from '../../../data/componentData';

// We'll pick a curated subset of components that look good in a small grid
const showcaseIds = [
    'sparkles-background',
    'lines-background',
    'wave-background',
    'particles-background',
    'interactive-grid-background',
    'hell-background',
    'liquid-glass',
    'spotlight-cards',
    'beam-grid-background',
    'wavy-text',
    'isometric-grid-background',
    'blocks'
];

const ComponentGrid = () => {
    const navigate = useNavigate();
    const [activeHover, setActiveHover] = React.useState<string | null>(null);

    // Filter down to the curated list, keeping the original order specified above if possible,
    // or just checking if the array includes the ID.
    const featuredComponents = showcaseIds.map(id => componentList.find(c => c.id === id)).filter(Boolean);

    return (
        <section className="py-24 px-6 max-w-[1400px] mx-auto w-full">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-4">
                    Explore Elements
                </h2>
                <p className="text-white/60 text-lg max-w-2xl mx-auto">
                    A collection of beautifully crafted, highly interactive components built to elevate your next project.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredComponents.map((comp) => (
                    <div
                        key={comp!.id}
                        onClick={() => navigate(`/library?id=${comp!.id}`)}
                        onMouseEnter={() => setActiveHover(comp!.id)}
                        onMouseLeave={() => setActiveHover(null)}
                        className="group relative h-[320px] bg-[#0A0A0A] rounded-3xl border border-white/[0.05] overflow-hidden flex items-center justify-center hover:bg-[#111111] hover:border-white/[0.1] transition-all duration-300 cursor-pointer"
                    >
                        {/* Interactive Preview Container */}
                        <div className="w-full h-full flex items-center justify-center p-8 absolute inset-0 z-10 transition-transform duration-500 group-hover:scale-105">
                            <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-xl">
                                {activeHover === comp!.id ? (
                                    comp!.preview
                                ) : (
                                    <div className="flex flex-col items-center gap-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                        <div className="w-12 h-12 rounded-xl border border-white/20 flex items-center justify-center">
                                            <span className="text-sm font-bold">{comp!.id.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest font-medium">Click to preview</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title at the bottom */}
                        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center text-center pointer-events-none">
                            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 group-hover:text-white/80 transition-colors duration-300">
                                {comp!.title}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ComponentGrid;
