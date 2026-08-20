import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, Zap, Layers, Flame } from 'lucide-react';
import { useSkeleton } from '../../../context/SkeletonContext';
import { HeroSkeleton } from '../../../components/ui/Skeleton';

const Hero = () => {
    const { isLoading } = useSkeleton();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const categories = [
        'Buttons', '3D Design', 'Text Animations', 'Visual Effects',
        'Backgrounds', 'Cursor Effects', 'Scroll Animation'
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/library?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div
                    key="hero-skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full"
                >
                    <HeroSkeleton />
                </motion.div>
            ) : (
                <motion.section
                    key="hero-real"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    id="hero"
                    className="relative min-h-[92vh] bg-[#0A0A0A] flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden border-b-4 border-black"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.10) 1.2px, transparent 1.2px)',
                        backgroundSize: '28px 28px'
                    }}
                >
                    {/* ── Geometric Decorative Accents ── */}
                    {/* Top-Left Crimson Red Bauhaus Circle */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.7, x: -30 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute top-16 left-4 sm:left-10 md:left-16 w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#E52520] border-4 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center pointer-events-none z-0"
                    >
                        <div className="w-5 h-5 rounded-full bg-white/20 border border-white/40" />
                    </motion.div>

                    {/* Top-Right Tilted Yellow Bauhaus Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.7, rotate: 0 }}
                        animate={{ opacity: 1, scale: 1, rotate: 12 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        className="absolute top-20 right-4 sm:right-10 md:right-16 w-24 h-24 md:w-32 md:h-32 bg-[#FFC700] border-4 border-black shadow-[6px_6px_0px_0px_#000000] flex flex-col items-center justify-center p-2 pointer-events-none z-0 rotate-12"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-black">VAULT</span>
                        <span className="text-xl md:text-2xl font-black text-black leading-none">100+</span>
                        <span className="text-[8px] font-bold uppercase text-black/70">COMPONENTS</span>
                    </motion.div>

                    {/* Bottom-Left Electric Blue Floating Pill */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hidden lg:flex absolute bottom-20 left-16 px-4 py-2 rounded-full bg-[#1F4BFF] border-2 border-black shadow-[3px_3px_0px_0px_#000000] items-center gap-2 pointer-events-none z-0"
                    >
                        <Flame size={14} className="text-yellow-300 fill-yellow-300" />
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">60FPS MOTION</span>
                    </motion.div>

                    {/* ── Main Hero Content ── */}
                    <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
                        
                        {/* Top Eyebrow Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border-2 border-black bg-white text-black font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform cursor-default"
                        >
                            <span className="w-2 h-2 rounded-full bg-[#E52520] animate-pulse" />
                            <span>UI HUB 2.0 IS LIVE</span>
                            <span className="px-1.5 py-0.2 rounded bg-black text-white text-[9px] font-mono ml-1">PRO</span>
                        </motion.div>

                        {/* Main Typography Headline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mb-6"
                        >
                            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-[0.92] font-heading">
                                <span className="text-white block drop-shadow-md">CRAFT THE</span>
                                <span className="text-[#1F4BFF] block my-1 relative inline-block">
                                    FUTURE
                                    {/* Subtle decorative underline bar */}
                                    <span className="absolute left-0 bottom-1 w-full h-3 md:h-4 bg-[#FFC700] -z-10 -rotate-1 opacity-90" />
                                </span>
                                <span className="text-white block drop-shadow-md">OF UI</span>
                            </h1>
                        </motion.div>

                        {/* Subtitle Description */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
                        >
                            A curated collection of <strong className="text-white font-black">100+ premium</strong>, production-ready UI components, AI-powered design prompts, and physics-driven animations.
                        </motion.p>

                        {/* Interactive Search Console */}
                        <motion.form
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            onSubmit={handleSearch}
                            className="w-full max-w-2xl mx-auto mb-10 flex items-center rounded-xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_#000000] overflow-hidden transition-all"
                        >
                            <div className="flex-1 flex items-center px-4 py-1.5">
                                <Search className="text-black/60 mr-3 shrink-0" size={20} strokeWidth={3} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SEARCH 100+ COMPONENTS, 3D, ANIMATIONS..."
                                    className="w-full py-3 bg-transparent text-black placeholder-neutral-500 focus:outline-none font-bold text-xs sm:text-sm uppercase tracking-wide"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-4 bg-[#1F4BFF] text-white font-black uppercase tracking-wider text-xs border-l-3 border-black hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
                            >
                                <span>SEARCH</span>
                                <ArrowRight size={15} strokeWidth={3} />
                            </button>
                        </motion.form>

                        {/* Primary CTAs */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 w-full sm:w-auto"
                        >
                            <Link to="/library" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-8 py-4 rounded-xl border-3 border-black bg-[#1F4BFF] text-white font-black text-xs uppercase tracking-widest shadow-[5px_5px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] transition-all flex items-center justify-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-white" />
                                    <span>EXPLORE COMPONENTS</span>
                                    <ArrowRight size={16} strokeWidth={3} />
                                </button>
                            </Link>

                            <Link to="/pricing" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-8 py-4 rounded-xl border-3 border-black bg-white text-black font-black text-xs uppercase tracking-widest shadow-[5px_5px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] transition-all flex items-center justify-center gap-3">
                                    <Sparkles size={16} className="text-[#FFC700] fill-[#FFC700]" />
                                    <span>VIEW PLANS</span>
                                </button>
                            </Link>
                        </motion.div>

                        {/* Popular Category Quick Filter Tags */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="flex flex-wrap justify-center items-center gap-2 pt-6 border-t-2 border-neutral-800/80 w-full max-w-3xl"
                        >
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mr-2 flex items-center gap-1.5">
                                <Layers size={13} /> POPULAR:
                            </span>
                            {categories.map((category, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => navigate(`/library?q=${encodeURIComponent(category)}`)}
                                    className="px-3 py-1.5 rounded-lg border-2 border-black bg-neutral-900 text-neutral-200 text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:bg-white hover:text-black hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                                >
                                    {category}
                                </button>
                            ))}
                        </motion.div>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    );
};

export default Hero;
