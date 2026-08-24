import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react';

const cards = [
    {
        title: 'Buttons',
        eyebrow: 'CLICK IT IN STYLE',
        desc: 'A branded button is a great way to make your website memorable.',
        query: 'button',
    },
    {
        title: 'Text Animations',
        eyebrow: 'WORDS THAT MOVE',
        desc: 'Letters, words and headlines that come alive as people read.',
        query: 'text',
    },
    {
        title: 'Visual Effects',
        eyebrow: "SHOW, DON'T TELL",
        desc: 'Exploring your product should be as engaging as actually using it.',
        query: 'effect',
    },
    {
        title: 'Backgrounds',
        eyebrow: 'SET THE SCENE',
        desc: 'Animated backdrops that give every section instant depth.',
        query: 'background',
    },
    {
        title: 'Cursor Effects',
        eyebrow: 'FOLLOW THE LEADER',
        desc: 'Custom cursors that turn pointing into part of the experience.',
        query: 'cursor',
    },
    {
        title: '3D Design',
        eyebrow: 'ADD SOME DEPTH',
        desc: 'Real-time 3D scenes that make your site feel alive.',
        query: '3d',
    },
    {
        title: 'Scroll Animation',
        eyebrow: 'STORYTELL ON SCROLL',
        desc: 'Guide users through your story one scroll at a time.',
        query: 'scroll',
    },
];

// Slight alternating tilts like a hand-laid collage
const TILTS = [-3.5, 2.5, -2, 3, -3, 2, -2.5, 3.5];

const CategoryShowcase = () => {
    const navigate = useNavigate();
    const trackRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const scrollByCard = (dir: 1 | -1) => {
        const track = trackRef.current;
        if (!track) return;
        const card = track.querySelector<HTMLElement>('[data-card]');
        const step = card ? card.offsetWidth + 20 : 300;
        track.scrollBy({ left: dir * step, behavior: 'smooth' });
        setActiveIndex((prev) => Math.min(cards.length - 1, Math.max(0, prev + dir)));
    };

    return (
        <section className="relative py-16 sm:py-24 overflow-hidden bg-[#E9E9E7] border-y-4 border-black">
            {/* Graph-paper grid backdrop */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <div className="relative z-10">
                {/* Eyebrow */}
                <div className="flex justify-center mb-12 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-1 bg-white border-2 border-black px-5 py-2.5 text-lg sm:text-xl font-bold tracking-tight shadow-[3px_3px_0px_0px_#000]"
                    >
                        <span className="text-[#3D5CFF]">Start here.</span>
                        <span className="text-black">People like these.</span>
                    </motion.div>
                </div>

                {/* Card track */}
                <div
                    ref={trackRef}
                    className="flex items-center gap-5 overflow-x-auto snap-x snap-mandatory px-[8vw] pb-10 pt-6 no-scrollbar"
                >
                    {cards.map((card, idx) => {
                        const isActive = idx === activeIndex;
                        return (
                            <motion.article
                                key={card.title}
                                data-card
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: idx * 0.05 }}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => navigate(`/library?q=${encodeURIComponent(card.query)}`)}
                                style={{
                                    rotate: isActive ? 0 : TILTS[idx % TILTS.length],
                                    clipPath: isActive
                                        ? 'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%)'
                                        : undefined,
                                }}
                                className={`relative shrink-0 w-[240px] sm:w-[264px] min-h-[290px] p-5 flex flex-col text-left snap-center cursor-pointer border-2 border-black transition-all duration-200 ${
                                    isActive
                                        ? 'bg-[#3D5CFF] text-white scale-[1.08] z-20 shadow-[8px_8px_0px_0px_#000]'
                                        : 'bg-white text-black hover:-translate-y-1 z-0'
                                }`}
                            >
                                <p
                                    className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
                                        isActive ? 'text-white/80' : 'text-[#3D5CFF]'
                                    }`}
                                >
                                    {card.eyebrow}
                                </p>
                                <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug mb-2">
                                    {card.title}
                                </h3>
                                <p
                                    className={`text-sm leading-relaxed font-medium ${
                                        isActive ? 'text-white/90' : 'text-neutral-500'
                                    }`}
                                >
                                    {card.desc}
                                </p>

                                {/* View footer */}
                                <div
                                    className={`mt-auto pt-4 flex items-center justify-between gap-2 ${
                                        isActive ? 'text-white' : 'text-black'
                                    }`}
                                >
                                    <span
                                        className={`flex-1 flex items-center justify-between gap-2 border px-3 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors truncate ${
                                            isActive
                                                ? 'border-white/70 bg-white text-black'
                                                : 'border-neutral-300 bg-neutral-100 group-hover:border-black'
                                        }`}
                                    >
                                        <span className="truncate">View {card.title}</span>
                                        {isActive && (
                                            <MousePointerClick size={14} className="shrink-0" />
                                        )}
                                    </span>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>

                {/* Arrows */}
                <div className="flex justify-center items-center gap-4 mt-2">
                    <button
                        onClick={() => scrollByCard(-1)}
                        aria-label="Previous category"
                        className="w-11 h-11 flex items-center justify-center bg-black text-white border-2 border-black active:translate-y-0.5 hover:bg-[#3D5CFF] transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <button
                        onClick={() => scrollByCard(1)}
                        aria-label="Next category"
                        className="w-11 h-11 flex items-center justify-center bg-black text-white border-2 border-black active:translate-y-0.5 hover:bg-[#3D5CFF] transition-colors"
                    >
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
};

export default CategoryShowcase;
