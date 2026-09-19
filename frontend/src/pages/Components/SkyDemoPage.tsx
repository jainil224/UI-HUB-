import React, { useState } from 'react';
import { Sky, PaletteId } from '../../components/ui/Sky';

export const SkyDemoPage: React.FC = () => {
    const [palette, setPalette] = useState<PaletteId>('dusk');

    return (
        <main id="sky-background-section" className="relative w-full h-screen min-h-[380px] overflow-hidden">
            <Sky palette={palette} />

            {/* Floating Glassmorphic Palette Selector */}
            <nav
                aria-label="Palette selection"
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/15 shadow-xl"
            >
                {(['day', 'dusk', 'night'] as const).map((p) => {
                    const isActive = palette === p;
                    return (
                        <button
                            key={p}
                            id={`palette-btn-${p}`}
                            type="button"
                            onClick={() => setPalette(p)}
                            className={`px-3.5 py-1 text-xs font-medium tracking-wide uppercase rounded-full transition-all duration-200 cursor-pointer ${
                                isActive
                                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                                    : 'text-white/75 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {p}
                        </button>
                    );
                })}
            </nav>
        </main>
    );
};

export default SkyDemoPage;