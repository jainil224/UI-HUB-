import React from 'react';
import { motion } from 'motion/react';
import SectionHeader from '../../../components/ui/SectionHeader';

const HoverEffectShowcase = () => {
    return (
        <section className="py-24 px-6 max-w-7xl mx-auto">
            <SectionHeader id="hover" title="Hover Effects" subtitle="Interactive Feedback" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Reveal Effect */}
                <div className="relative h-64 rounded-3xl overflow-hidden group cursor-pointer">
                    <img
                        src="https://picsum.photos/seed/minimal/1200/800"
                        alt="Minimal"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        <h3 className="text-3xl font-display uppercase tracking-tight mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Reveal Content</h3>
                        <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-sm max-w-xs">
                            Hover to reveal the full beauty and details of the underlying component.
                        </p>
                    </div>
                </div>

                {/* Magnetic Button Simulation */}
                <div className="glass rounded-3xl flex items-center justify-center p-12 relative overflow-hidden">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-32 h-32 rounded-full bg-brand-green flex items-center justify-center text-black font-bold cursor-pointer relative z-10"
                    >
                        DRAG ME
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-5">
                        <div className="w-64 h-64 border border-white rounded-full animate-ping" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HoverEffectShowcase;
