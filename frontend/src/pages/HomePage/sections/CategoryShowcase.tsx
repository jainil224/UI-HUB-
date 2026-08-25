import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';

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
    {
        title: 'Interactive BGs',
        eyebrow: 'TOUCH REACTIVE',
        desc: 'Backdrops that respond to every move your visitors make.',
        query: 'interactive-background',
    },
];

// Hand-laid collage tilts (degrees)
const TILTS = [-3, 2.5, -1.5, 3, -2.5, 1.5, -3.5, 2];

const CARD_STEP = 284;       // px per arrow nudge
const FRICTION = 0.94;       // velocity kept per frame while coasting
const COAST_TO_SNAP = 60;    // px/s below which the strip snaps to nearest card

type MoveMode = 'idle' | 'drag' | 'coast' | 'ease';

const CategoryShowcase = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef(0);
    const halfWidthRef = useRef(1);
    const centersRef = useRef<number[]>([]);
    const modeRef = useRef<MoveMode>('idle');
    const easeTargetRef = useRef(0);
    const velocityRef = useRef(0);
    const dragStartXRef = useRef(0);
    const dragStartOffsetRef = useRef(0);
    const lastMoveRef = useRef({ x: 0, t: 0 });
    const draggedRef = useRef(false);
    const [activeIdx, setActiveIdx] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const wrap = useCallback((v: number) => {
        const half = halfWidthRef.current;
        return ((v % half) + half) % half;
    }, []);

    // Measure card centres + half track width for seamless wrapping
    useEffect(() => {
        const measure = () => {
            const track = trackRef.current;
            if (!track) return;
            halfWidthRef.current = Math.max(1, track.scrollWidth / 2);
            const els = track.querySelectorAll<HTMLElement>('[data-card]');
            const centers: number[] = [];
            for (let i = 0; i < els.length / 2; i++) {
                centers.push(els[i].offsetLeft + els[i].offsetWidth / 2);
            }
            centersRef.current = centers;
        };
        measure();
        const t = setTimeout(measure, 400);
        window.addEventListener('resize', measure);
        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', measure);
        };
    }, []);

    // Index of the card closest to the centre of the viewport — that one glows
    const computeActive = useCallback(() => {
        const container = containerRef.current;
        const centers = centersRef.current;
        if (!container || !centers.length) return;
        const viewCenter = container.clientWidth / 2;
        const offset = wrap(offsetRef.current);
        const half = halfWidthRef.current;
        let best = -1;
        let bestDist = Infinity;
        for (let i = 0; i < centers.length; i++) {
            for (const pos of [centers[i] - offset, centers[i] + half - offset]) {
                const d = Math.abs(pos - viewCenter);
                if (d < bestDist) {
                    bestDist = d;
                    best = i;
                }
            }
        }
        if (best >= 0) setActiveIdx((prev) => (prev === best ? prev : best));
    }, [wrap]);

    // Offset that would place the nearest card exactly in the centre
    const nearestSnapOffset = useCallback(() => {
        const container = containerRef.current;
        const centers = centersRef.current;
        if (!container || !centers.length) return offsetRef.current;
        const half = halfWidthRef.current;
        const viewCenter = container.clientWidth / 2;
        const offset = offsetRef.current;
        let best = offset;
        let bestDist = Infinity;
        for (const c of centers) {
            for (const raw of [c - viewCenter, c + half - viewCenter]) {
                let delta = (((raw - offset) % half) + half) % half;
                if (delta > half / 2) delta -= half;
                const d = Math.abs(delta);
                if (d < bestDist) {
                    bestDist = d;
                    best = offset + delta;
                }
            }
        }
        return best;
    }, []);

    // Render loop — only moves while coasting/easing, strip is static otherwise
    useEffect(() => {
        // Center the nearest card on first paint so mobile users see a full card
        // with symmetric peeks instead of a card glued to the left edge
        offsetRef.current = wrap(nearestSnapOffset());
        let raf = 0;
        let last = performance.now();
        const tick = (now: number) => {
            const dt = Math.min(64, now - last);
            last = now;
            const mode = modeRef.current;

            if (mode === 'coast') {
                offsetRef.current += (velocityRef.current * dt) / 1000;
                velocityRef.current *= Math.pow(FRICTION, dt / 16.7);
                offsetRef.current = wrap(offsetRef.current);
                if (Math.abs(velocityRef.current) < COAST_TO_SNAP) {
                    modeRef.current = 'ease';
                    easeTargetRef.current = nearestSnapOffset();
                }
            } else if (mode === 'ease') {
                const diff = easeTargetRef.current - offsetRef.current;
                offsetRef.current += diff * Math.min(1, dt / 160);
                if (Math.abs(diff) < 0.5) {
                    offsetRef.current = wrap(easeTargetRef.current);
                    modeRef.current = 'idle';
                }
            }

            if (trackRef.current) {
                trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
            }
            computeActive();
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [computeActive, nearestSnapOffset, wrap]);

    const startDrag = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        modeRef.current = 'drag';
        draggedRef.current = false;
        offsetRef.current = wrap(offsetRef.current);
        dragStartXRef.current = e.clientX;
        dragStartOffsetRef.current = offsetRef.current;
        velocityRef.current = 0;
        lastMoveRef.current = { x: e.clientX, t: performance.now() };
        setIsDragging(true);
    };

    // Global move/up listeners so the drag keeps working outside the strip
    useEffect(() => {
        if (!isDragging) return;
        const move = (e: PointerEvent) => {
            const dx = e.clientX - dragStartXRef.current;
            if (Math.abs(dx) > 5) draggedRef.current = true;
            // Wrap while dragging so the strip loops seamlessly in both directions
            const raw = dragStartOffsetRef.current - dx;
            const wrapped = wrap(raw);
            dragStartOffsetRef.current += wrapped - raw;
            offsetRef.current = wrapped;
            const now = performance.now();
            const dt = now - lastMoveRef.current.t;
            if (dt > 0) {
                const inst = (lastMoveRef.current.x - e.clientX) / (dt / 1000);
                velocityRef.current = Math.max(-4000, Math.min(4000, velocityRef.current * 0.7 + inst * 0.3));
            }
            lastMoveRef.current = { x: e.clientX, t: now };
        };
        const up = () => {
            if (Math.abs(velocityRef.current) > COAST_TO_SNAP) {
                modeRef.current = 'coast';
            } else {
                modeRef.current = 'ease';
                easeTargetRef.current = nearestSnapOffset();
            }
            setIsDragging(false);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
        return () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
        };
    }, [isDragging, nearestSnapOffset, wrap]);

    const nudge = (dir: 1 | -1) => {
        const centers = centersRef.current;
        // Step by the real card pitch so arrows land exactly on the next card
        // (cards are narrower on phones than the desktop CARD_STEP default)
        const step = centers.length > 1 ? Math.abs(centers[1] - centers[0]) : CARD_STEP;
        const from = modeRef.current === 'ease' ? easeTargetRef.current : offsetRef.current;
        easeTargetRef.current = from + step * dir;
        modeRef.current = 'ease';
    };

    return (
        <section className="relative py-16 sm:py-24 overflow-hidden bg-brand-bg border-y-4 border-black">
            {/* Graph-square grid backdrop (matches footer) */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
                }}
            />

            <div className="relative z-10">
                {/* Eyebrow */}
                <div className="flex justify-center mb-10 sm:mb-14 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 bg-white border-2 border-black px-5 py-2.5 text-lg sm:text-xl font-bold tracking-tight shadow-[5px_5px_0px_0px_#3D5CFF]"
                    >
                        <Sparkles size={18} className="text-[#3D5CFF] shrink-0" />
                        <span className="text-[#3D5CFF]">Start here.</span>
                        <span className="text-black">People like these.</span>
                    </motion.div>
                </div>

                {/* Draggable card strip — static until the user grabs it */}
                <div
                    ref={containerRef}
                    className={`relative overflow-hidden py-6 select-none touch-pan-y ${
                        isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                    onPointerDown={startDrag}
                >
                    {/* Edge fade masks */}
                    <div className="absolute inset-y-0 left-0 w-[6vw] bg-gradient-to-r from-brand-bg to-transparent z-20 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-[6vw] bg-gradient-to-l from-brand-bg to-transparent z-20 pointer-events-none" />

                    <div ref={trackRef} className="relative flex items-center w-max pl-6 will-change-transform">
                        {[...cards, ...cards].map((card, idx) => {
                            const i = idx % cards.length;
                            const isActive = activeIdx === i;
                            return (
                                <motion.article
                                    key={`${card.title}-${idx}`}
                                    data-card
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.45, delay: (idx % cards.length) * 0.05 }}
                                    onClick={() => {
                                        if (!draggedRef.current) {
                                            navigate(`/library?q=${encodeURIComponent(card.query)}`);
                                        }
                                    }}
                                    style={{
                                        rotate: isActive ? 0 : TILTS[i % TILTS.length],
                                        clipPath: isActive
                                            ? 'polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 0 100%)'
                                            : undefined,
                                        zIndex: isActive ? 30 : 10 + i,
                                    }}
                                    className={`group relative shrink-0 w-[248px] sm:w-[268px] min-h-[300px] p-5 mr-[-8px] flex flex-col text-left cursor-pointer border-2 border-black transition-all duration-300 ease-out ${
                                        isActive
                                            ? 'bg-[#3D5CFF] text-white scale-[1.07] shadow-[10px_10px_0px_0px_#000,0_0_34px_8px_rgba(61,92,255,0.45)]'
                                            : 'bg-white text-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000]'
                                    }`}
                                >
                                    {/* Ghost index */}
                                    <span
                                        aria-hidden
                                        className={`absolute top-1.5 right-2.5 text-4xl font-black leading-none select-none pointer-events-none ${
                                            isActive ? 'text-white/15' : 'text-black/5'
                                        }`}
                                    >
                                        {String(i + 1).padStart(2, '0')}
                                    </span>

                                    <p
                                        className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-2 ${
                                            isActive ? 'text-white/80' : 'text-[#3D5CFF]'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white' : 'bg-[#3D5CFF]'}`} />
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
                                    <span
                                        className={`mt-auto flex items-center justify-between gap-2 border px-3 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors ${
                                            isActive
                                                ? 'border-white bg-white text-black'
                                                : 'border-neutral-300 bg-neutral-100 text-black group-hover:border-black'
                                        }`}
                                    >
                                        <span className="truncate">View {card.title}</span>
                                        <ArrowUpRight
                                            size={13}
                                            className={`shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                                                isActive ? 'text-black' : 'text-neutral-400'
                                            }`}
                                        />
                                    </span>
                                </motion.article>
                            );
                        })}
                    </div>
                </div>

                {/* Arrows */}
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={() => nudge(-1)}
                        aria-label="Previous category"
                        className="w-12 h-12 flex items-center justify-center bg-brand-surface text-white border-2 border-white rounded-sm brutal-shadow-blue hover:bg-brand-blue hover:border-black hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <span className="hidden sm:block text-[10px] font-mono font-black uppercase tracking-[0.2em] text-neutral-500 px-2">
                        or just drag the cards
                    </span>
                    <button
                        onClick={() => nudge(1)}
                        aria-label="Next category"
                        className="w-12 h-12 flex items-center justify-center bg-brand-surface text-white border-2 border-white rounded-sm brutal-shadow-blue hover:bg-brand-blue hover:border-black hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
                    >
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CategoryShowcase;
