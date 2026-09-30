import React, { useState } from 'react';
import LightCables from '../../components/ui/LightCables';

const PRESETS = [
    { label: 'Cyberpunk', accentColor: '#EA53CD', highlight: '#D62EEB' },
    { label: 'Neon Sun', accentColor: '#FF7500', highlight: '#FFD900' },
    { label: 'Electric Cyan', accentColor: '#00F0FF', highlight: '#7000FF' },
    { label: 'Emerald Glow', accentColor: '#00E5A0', highlight: '#3DFFDC' },
    { label: 'Deep Blue', accentColor: '#3D5CFF', highlight: '#00E5FF' },
] as const;

export const LightCablesDemoPage: React.FC = () => {
    const [preset, setPreset] = useState(0);
    const active = PRESETS[preset];

    return (
        <main id="light-cables-background-section" className="relative w-full h-screen min-h-[380px] overflow-hidden bg-black select-none">
            <LightCables
                background="#000000"
                accentColor={active.accentColor}
                highlight={active.highlight}
            />

            {/* Floating Glassmorphic Preset Selector */}
            <nav
                aria-label="Light Cables preset selection"
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 shadow-2xl"
            >
                {PRESETS.map((p, idx) => {
                    const isActive = idx === preset;
                    return (
                        <button
                            key={p.label}
                            id={`preset-btn-${p.label.toLowerCase().replace(/\s+/g, '-')}`}
                            type="button"
                            onClick={() => setPreset(idx)}
                            className={`px-3.5 py-1 text-xs font-medium tracking-wide uppercase rounded-full transition-all duration-200 cursor-pointer ${
                                isActive
                                    ? 'bg-white text-black shadow-md font-semibold'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
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

export default LightCablesDemoPage;
