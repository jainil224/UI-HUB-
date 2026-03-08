import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Github, ArrowRight } from 'lucide-react';
import Logo from '../../../components/ui/Logo';

const Hero = () => {
    return (
        <section
            id="hero"
            className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden scanlines"
        >
            {/* Cinematic Overlays */}
            <div className="absolute inset-0 noise-overlay pointer-events-none z-20" />

            {/* Background Video */}
            <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <video
                    autoPlay
                    muted
                    defaultMuted
                    loop
                    playsInline
                    src={`${import.meta.env.BASE_URL}assets/videos/Obsidian_crystal_orbiting_planet_97d2c01fed.mp4`}
                    className="w-full h-full object-cover object-center scale-110"
                />
                {/* Enhanced Dynamic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90 z-10" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] md:opacity-10 pointer-events-none z-20" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center z-30 w-full max-w-4xl"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 backdrop-blur-md"
                >
                    <span className="w-2 h-2 rounded-full bg-brand-green md:animate-pulse shadow-[0_0_8px_#00FF00]" />
                    <span className="text-brand-green/90">v2.0 is now live</span>
                </motion.div>

                <h1 className="text-4xl sm:text-6xl md:text-[7.5rem] font-display font-black leading-[0.8] uppercase tracking-[0.08em] mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] px-4">
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/40 text-[0.3em] block tracking-[0.3em] mb-4 font-medium"
                    >
                        UI Hub — The Home of
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            textShadow: [
                                "0 0 10px rgba(0, 255, 26, 0.3)",
                                "0 0 25px rgba(0, 255, 26, 0.6)",
                                "0 0 10px rgba(0, 255, 26, 0.3)"
                            ]
                        }}
                        transition={{
                            opacity: { delay: 0.5, duration: 0.8 },
                            scale: { delay: 0.5, duration: 0.8 },
                            textShadow: { repeat: Infinity, duration: 3, ease: "easeInOut", repeatType: "reverse" }
                        }}
                        className="bg-gradient-to-b from-[#00FF1A] via-[#00FF1A] to-[#008A0E] bg-clip-text text-transparent transition-all duration-700"
                    >
                        Vibe
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="block text-[0.8em] tracking-[0.1em] mt-4"
                    >
                        Coding
                    </motion.span>
                </h1>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-2xl mx-auto mb-14 px-6 space-y-4"
                >
                    <p className="text-white/90 text-xl md:text-2xl font-bold tracking-tight">
                        Why spend hours writing UI code?
                    </p>
                    <p className="text-white/60 text-base md:text-lg leading-relaxed">
                        With <span className="text-brand-green font-bold">UI Hub</span>, you can generate beautiful, production-ready UI components instantly using AI-ready prompts and modern design patterns.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-white/40 border-y border-white/5 py-3 mt-6">
                        <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-brand-green" /> Lovable</span>
                        <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-brand-green" /> Claude</span>
                        <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-brand-green" /> Antigravity</span>
                        <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-brand-green" /> Cursor</span>
                    </div>

                    <p className="text-white/80 text-sm md:text-base mt-8 font-medium italic">
                        Stop building UI the old way. Start <span className="text-brand-green text-lg not-italic font-black">vibe coding</span> and ship faster.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 px-4"
                >
                    <Link to="/library" className="w-full sm:w-auto">
                        <button className="w-full bg-brand-green text-black font-black px-12 py-5 rounded-full text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all green-glow group relative overflow-hidden">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Explore Components
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full hover:animate-shimmer" />
                        </button>
                    </Link>
                    <button className="w-full sm:w-auto glass text-white/80 font-bold px-12 py-5 rounded-full text-sm uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3">
                        <Github size={20} />
                        View Source
                    </button>
                </motion.div>
            </motion.div>

        </section>
    );
};

export default Hero;
