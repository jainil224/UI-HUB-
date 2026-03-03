import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import backgroundVideo from '../../../Assets/Obsidian_crystal_orbiting_planet_97d2c01fed.mp4';

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
                    loop
                    playsInline
                    className="w-full h-full object-cover object-center scale-110"
                >
                    <source src={backgroundVideo} type="video/mp4" />
                </video>
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

                <h1 className="text-4xl sm:text-6xl md:text-[8.5rem] font-display font-black leading-[0.8] uppercase tracking-[0.08em] mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] px-4">
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/40 text-[0.6em] block tracking-[0.2em] mb-2 font-medium"
                    >
                        Craft the
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            textShadow: [
                                "0 0 10px rgba(0, 255, 26, 0.3)",
                                "0 0 18px rgba(0, 255, 26, 0.5)",
                                "0 0 10px rgba(0, 255, 26, 0.3)"
                            ]
                        }}
                        transition={{
                            opacity: { delay: 0.5, duration: 0.8 },
                            scale: { delay: 0.5, duration: 0.8 },
                            textShadow: { repeat: Infinity, duration: 4, ease: "easeInOut", repeatType: "reverse", repeatDelay: 0 }
                        }}
                        style={{
                            textShadow: "0 0 10px rgba(0, 255, 26, 0.3)" // Default for static
                        }}
                        className="bg-gradient-to-b from-[#00FF1A] via-[#00FF1A] to-[#008A0E] bg-clip-text text-transparent transition-all duration-700"
                    >
                        Future
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="block text-[0.8em] tracking-[0.15em] mt-2"
                    >
                        of UI
                    </motion.span>
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-xl mx-auto text-white/50 text-base md:text-lg mb-14 font-light leading-relaxed tracking-wide px-6"
                >
                    A curated collection of minimal, high-performance UI components built for modern web experiences. Simple, bold, and effective.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 px-4"
                >
                    <Link to="/library" className="w-full sm:w-auto">
                        <button className="w-full bg-brand-green text-black font-black px-12 py-5 rounded-full text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all green-glow group relative overflow-hidden">
                            <span className="relative z-10">Explore Library</span>
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                        </button>
                    </Link>
                    <button className="w-full sm:w-auto glass text-white/80 font-bold px-12 py-5 rounded-full text-sm uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3">
                        Github Repo <ExternalLink size={16} />
                    </button>
                </motion.div>
            </motion.div>

        </section>
    );
};

export default Hero;
