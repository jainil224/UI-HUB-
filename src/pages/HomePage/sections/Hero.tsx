import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ExternalLink, Layers, MousePointer2, Layout } from 'lucide-react';
import backgroundVideo from '../../../Assets/Obsidian_crystal_orbiting_planet_97d2c01fed.mp4';

const Hero = () => {
    return (
        <section id="hero" className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
            {/* Background Video */}
            <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover object-center"
                >
                    <source src={backgroundVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                {/* Enhanced Dynamic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/80 z-10" />
                {/* Surgical Watermark Hide */}
                <div className="absolute bottom-0 right-0 w-32 h-16 bg-black z-20 pointer-events-none" />
            </div>

            {/* Grid Pattern - Adjusted for mobile */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] md:opacity-10 pointer-events-none z-20" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center z-30 w-full max-w-4xl"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest mb-8">
                    <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                    v2.0 is now live
                </div>

                <h1 className="text-5xl sm:text-7xl md:text-[10rem] font-display leading-[0.85] uppercase tracking-tighter mb-8 shadow-black/50 drop-shadow-2xl px-4">
                    Craft the <br />
                    <span className="text-brand-green">Future</span> of UI
                </h1>

                <p className="max-w-xl mx-auto text-white/80 text-base md:text-xl mb-12 font-light leading-relaxed drop-shadow-md px-4">
                    A curated collection of minimal, high-performance UI components built for modern web experiences. Simple, bold, and effective.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 px-6">
                    <Link to="/library">
                        <button className="w-full sm:w-auto bg-brand-green text-black font-bold px-10 py-4 rounded-full text-lg hover:scale-105 active:scale-95 transition-all green-glow">
                            Component Library
                        </button>
                    </Link>
                    <button className="w-full sm:w-auto glass text-white font-bold px-10 py-4 rounded-full text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        Documentation <ExternalLink size={18} />
                    </button>
                </div>
            </motion.div>

            <div className="mt-16 md:mt-24 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 opacity-80 md:opacity-60 hover:opacity-100 transition-opacity duration-700 z-30 px-6">
                <div className="glass p-4 md:p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <Layers size={20} className="text-brand-green md:w-6 md:h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] text-white/60 font-bold uppercase tracking-widest leading-none mb-1">Components</div>
                        <div className="text-lg md:text-xl font-bold">500+ Assets</div>
                    </div>
                </div>
                <div className="glass p-4 md:p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <MousePointer2 size={20} className="text-brand-green md:w-6 md:h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] text-white/60 font-bold uppercase tracking-widest leading-none mb-1">Interactions</div>
                        <div className="text-lg md:text-xl font-bold">Smooth Motion</div>
                    </div>
                </div>
                <div className="glass p-4 md:p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <Layout size={20} className="text-brand-green md:w-6 md:h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] text-white/60 font-bold uppercase tracking-widest leading-none mb-1">Layouts</div>
                        <div className="text-lg md:text-xl font-bold">Bento Grids</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
