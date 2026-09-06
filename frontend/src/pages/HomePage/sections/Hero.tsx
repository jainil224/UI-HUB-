import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, Flame, Bot } from 'lucide-react';
import { useSkeleton } from '../../../context/SkeletonContext';
import { HeroSkeleton } from '../../../components/ui/Skeleton';
import SearchBox from '../../../components/ui/SearchBox';

// ─── Inline icon badge embedded inside headline text (scales with font via em) ──
const InlineIcon: React.FC<{ children: React.ReactNode; bg: string }> = ({ children, bg }) => (
    <motion.span
        animate={{ y: [0, -0.06, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`inline-flex items-center justify-center align-middle w-[0.82em] h-[0.82em] mx-[0.14em] -translate-y-[0.1em] rounded-[22%] border-[3px] md:border-4 border-black shadow-[0.05em_0.07em_0px_#000000] ${bg}`}
    >
        {children}
    </motion.span>
);

const Hero = () => {
    const { isLoading } = useSkeleton();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
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
                    className="relative bg-[#0A0A0A] flex flex-col items-center justify-center px-6 pt-28 pb-24 overflow-hidden border-b-4 border-black"
                >
                    {/* Graph-square grid backdrop (matches footer) */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                            backgroundSize: '32px 32px',
                            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                        }}
                    />
                    {/* ── Geometric Decorative Accents ── */}
                    {/* Top-Left Crimson Red Bauhaus Circle */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7, x: -30 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="hidden md:block absolute top-28 sm:top-32 left-4 sm:left-10 md:left-16 w-28 h-28 md:w-40 md:h-40 rounded-full bg-[#E52520] border-4 border-black shadow-[6px_6px_0px_0px_#000000] pointer-events-none z-0"
                    />

                    {/* Bottom-Right Tilted Yellow Bauhaus Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7, rotate: 0 }}
                        animate={{ opacity: 1, scale: 1, rotate: 12 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        className="hidden md:block absolute top-1/2 right-4 sm:right-10 md:right-16 w-28 h-28 md:w-40 md:h-40 bg-[#FFC700] border-4 border-black shadow-[8px_8px_0px_0px_#000000] pointer-events-none z-0 rotate-12"
                    />

                    {/* Bottom-Left Electric Blue Floating Pill */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hidden lg:flex absolute top-[46%] left-16 px-4 py-2 rounded-full bg-[#1F4BFF] border-2 border-black shadow-[3px_3px_0px_0px_#000000] items-center gap-2 pointer-events-none z-0"
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
                            <span className="px-1.5 py-0.5 rounded bg-black text-white text-[10px] font-mono ml-1">PRO</span>
                        </motion.div>

                        {/* Main Typography Headline (Exact Image Font Arrangement) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mb-6 w-full max-w-[1000px] mx-auto text-center"
                        >
                            <h1 className="hero-title text-[clamp(34px,11.5vw,90px)] text-center text-white leading-[1.04] mb-6 max-w-[1000px] mx-auto">
                                <span className="block drop-shadow-md sm:whitespace-nowrap">
                                    <span className="text-white font-semibold">
                                        Craft the
                                    </span>
                                    <InlineIcon bg="bg-[#A78BFA]">
                                        <Bot className="w-[0.5em] h-[0.5em] text-black" strokeWidth={2.5} />
                                    </InlineIcon>
                                    <span className="serif-italic text-[#3D5CFF] drop-shadow-[0_0_30px_rgba(61,92,255,0.45)]">
                                        Future,
                                    </span>
                                </span>
                                <span className="block mt-2 sm:mt-4 drop-shadow-md sm:whitespace-nowrap">
                                    <InlineIcon bg="bg-[#FFC700]">
                                        <Flame className="w-[0.48em] h-[0.48em] text-black" fill="currentColor" strokeWidth={2.5} />
                                    </InlineIcon>
                                    <span className="text-white font-semibold">
                                        of{' '}
                                    </span>
                                    <span className="serif-italic text-[#3D5CFF] drop-shadow-[0_0_30px_rgba(61,92,255,0.45)]">
                                        UI
                                    </span>
                                </span>
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
                            className="w-full max-w-2xl mx-auto mb-10 relative"
                        >
                            <SearchBox
                                value={searchQuery}
                                onChange={setSearchQuery}
                                onSubmit={() => handleSearch()}
                                placeholder="SEARCH 100+ COMPONENTS, 3D, ANIMATIONS..."
                                containerClassName="relative"
                                inputWrapperClassName="group flex items-center rounded-xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_#000000] overflow-hidden transition-all"
                                iconClassName="pl-4 pr-3 flex items-center"
                                icon={<Search size={20} strokeWidth={3} className="text-black/60" />}
                                inputClassName="flex-1 w-full py-3 bg-transparent text-black placeholder-neutral-500 focus:outline-none font-bold text-xs sm:text-sm uppercase tracking-wide"
                                action={
                                    <button
                                        type="submit"
                                        className="px-6 py-4 bg-[#1F4BFF] text-white font-black uppercase tracking-wider text-xs border-l-3 border-black hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
                                    >
                                        <span>SEARCH</span>
                                        <ArrowRight size={15} strokeWidth={3} />
                                    </button>
                                }
                            />
                        </motion.form>

                        {/* Primary CTAs */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-10 w-full sm:w-auto"
                        >
                            <Link to="/library" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border-3 border-black bg-[#1F4BFF] text-white font-black text-xs uppercase tracking-widest shadow-[5px_5px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] transition-all flex items-center justify-center gap-2.5 cursor-pointer">
                                    <span className="w-2 h-2 rounded-full bg-white" />
                                    <span>COMPONENTS</span>
                                    <ArrowRight size={15} strokeWidth={3} />
                                </button>
                            </Link>

                            <Link to="/templates" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border-3 border-black bg-[#FFC700] text-black font-black text-xs uppercase tracking-widest shadow-[5px_5px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] transition-all flex items-center justify-center gap-2 cursor-pointer">
                                    <Sparkles size={15} className="text-black fill-black" />
                                    <span>TEMPLATES</span>
                                    <span className="px-1.5 py-0.5 bg-black text-white text-[8px] font-mono rounded font-bold">NEW</span>
                                </button>
                            </Link>

                            <Link to="/pricing" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border-3 border-black bg-white text-black font-black text-xs uppercase tracking-widest shadow-[5px_5px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] transition-all flex items-center justify-center gap-2 cursor-pointer">
                                    <span>VIEW PLANS</span>
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    );
};

export default Hero;
