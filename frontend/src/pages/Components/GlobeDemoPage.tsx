import React, { useState } from 'react';
import Globe, { type GlobeProps } from '../../components/ui/Globe';

interface PresetItem {
    label: string;
    props: GlobeProps;
}

const PRESETS: PresetItem[] = [
    {
        label: 'Cyber Cyan',
        props: {
            fill: 'dots',
            dots: { color: '#00f7ff', size: 5, density: 8, allDots: false },
            oceanColor: '#050a14',
            outlineColor: '#00a2ff',
            graticuleColor: 'rgba(0, 162, 255, 0.25)',
            markerConfig: {
                markers: [
                    { lat: 40.7128, lng: -74.006 }, // New York
                    { lat: 51.5074, lng: -0.1278 },  // London
                    { lat: 35.6762, lng: 139.6503 }, // Tokyo
                    { lat: 1.3521, lng: 103.8198 },  // Singapore
                ],
                color: '#ff007f',
                size: 45,
            },
            speed: 2,
        },
    },
    {
        label: 'Pure White',
        props: {
            fill: 'dots',
            dots: { color: '#ffffff', size: 5, density: 8, allDots: false },
            oceanColor: '#000000',
            outlineColor: '#ffffff',
            graticuleColor: '#333333',
            markerConfig: {
                markers: [
                    { lat: 37.7749, lng: -122.4194 },
                    { lat: 48.8566, lng: 2.3522 },
                ],
                color: '#00f7ff',
                size: 40,
            },
            speed: 2,
        },
    },
    {
        label: 'Solid Emerald',
        props: {
            fill: 'solid',
            fillColor: '#00e5a0',
            oceanColor: '#021a12',
            outlineColor: '#00ffb0',
            graticuleColor: 'rgba(0, 229, 160, 0.2)',
            speed: 1.5,
        },
    },
    {
        label: 'Golden Horizon',
        props: {
            fill: 'dots',
            dots: { color: '#ffd700', size: 5, density: 8, allDots: false },
            oceanColor: '#120d02',
            outlineColor: '#ffb700',
            graticuleColor: 'rgba(255, 183, 0, 0.25)',
            markerConfig: {
                markers: [{ lat: 25.2048, lng: 55.2708 }], // Dubai
                color: '#ffffff',
                size: 50,
            },
            speed: 2.5,
        },
    },
];

export const GlobeDemoPage: React.FC = () => {
    const [preset, setPreset] = useState(0);
    const active = PRESETS[preset];

    return (
        <main id="globe-background-section" className="relative w-full h-screen min-h-[380px] overflow-hidden bg-black select-none flex items-center justify-center">
            <Globe
                {...active.props}
            />

            {/* Floating Glassmorphic Preset Selector */}
            <nav
                aria-label="Globe preset selection"
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

export default GlobeDemoPage;
