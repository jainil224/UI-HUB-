import React, { useState } from 'react';
import MatrixRain from '../../components/ui/MatrixRain';

const PRESETS = [
    { label: 'Classic', color: '#3D5CFF', highlightColor: '#FFFFFF', speed: 55, density: 65 },
    { label: 'Amber', color: '#FFC700', highlightColor: '#FFFFFF', speed: 70, density: 55 },
    { label: 'Acid', color: '#00E5A0', highlightColor: '#E8FFFB', speed: 40, density: 80 },
    { label: 'Storm', color: '#3D5CFF', highlightColor: '#9DB4FF', speed: 90, density: 100 },
] as const;

export const MatrixRainDemoPage: React.FC = () => {
    const [preset, setPreset] = useState(0);
    const active = PRESETS[preset];

    return (
        <main id="matrix-rain-background-section" className="relative w-full h-screen min-h-[380px] overflow-hidden">
            <MatrixRain
                background="#0A0A0A"
                color={active.color}
                highlightColor={active.highlightColor}
                speed={active.speed}
                density={active.density}
            />

            {/* Floating Glassmorphic Preset Selector */}
            <nav
                aria-label="Matrix Rain preset selection"
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/15 shadow-xl"
            >
                {PRESETS.map((p, idx) => {
                    const isActive = idx === preset;
                    return (
                        <button
                            key={p.label}
                            id={`preset-btn-${p.label.toLowerCase()}`}
                            type="button"
                            onClick={() => setPreset(idx)}
                            className={`px-3.5 py-1 text-xs font-medium tracking-wide uppercase rounded-full transition-all duration-200 cursor-pointer ${
                                isActive
                                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                                    : 'text-white/75 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {p.label}
                        </button>
                    );
                })}
            </nav>
        </main>
    );
};

export default MatrixRainDemoPage;