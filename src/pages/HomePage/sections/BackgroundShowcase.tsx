import React, { useState } from 'react';
import SectionHeader from '../../../components/ui/SectionHeader';
import { BackgroundPaths } from '../../../components/ui/background-paths';
import { SparklesBackground } from '../../../components/ui/sparkles-background';
import WaveBackground from '../../../components/ui/WaveBackground';

const backgrounds = [
    {
        id: 'sparkles',
        title: 'Sparkles',
        component: <SparklesBackground title="Sparkles" />
    },
    {
        id: 'lines',
        title: 'Lines',
        component: <BackgroundPaths title="Lines" />
    },
    {
        id: 'waves',
        title: 'Waves',
        component: <WaveBackground />
    }
];

const BackgroundShowcase = () => {
    const [activeBg, setActiveBg] = useState(backgrounds[0].id);

    return (
        <section className="py-24 px-6 max-w-7xl mx-auto w-full">
            <SectionHeader id="backgrounds" title="Immersive Backgrounds" subtitle="Beautifully Animated WebGL Effects" />

            <div className="flex flex-col gap-8 w-full">
                {/* Tabs / Controls */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                    {backgrounds.map((bg) => (
                        <button
                            key={bg.id}
                            onClick={() => setActiveBg(bg.id)}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeBg === bg.id
                                    ? 'bg-brand-green text-black scale-105 shadow-[0_0_20px_rgba(0,255,0,0.3)]'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {bg.title}
                        </button>
                    ))}
                </div>

                {/* Display Area */}
                <div className="w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden border border-white/10 relative mt-4 shadow-2xl glass transition-all duration-500">
                    {backgrounds.map((bg) => (
                        <div
                            key={bg.id}
                            className={`absolute inset-0 transition-opacity duration-700 ${activeBg === bg.id ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                                }`}
                        >
                            {activeBg === bg.id && bg.component}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BackgroundShowcase;
