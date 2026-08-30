import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { componentList } from '../../../data/componentData';
import { ArrowUpRight, Zap, Flame } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useSkeleton } from '../../../context/SkeletonContext';
import { ComponentGridSkeleton } from '../../../components/ui/Skeleton';

interface BentoSpec {
    id: string;
    className: string;
    /** Optional per-card framing for previews that need custom alignment */
    frame?: string;
}

type BentoComp = (typeof componentList)[number];

// Default: oversized cover container centered in the tile
const DEFAULT_FRAME =
    'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[170%] flex items-center justify-center';

// Curated live demos — always-on previews, no hover needed
const bentoSpecs: BentoSpec[] = [
    {
        id: '3d-hero',
        // Full 2-row feature tile on phones so the demo (min-h 420px) is never cropped
        className: 'row-span-2 sm:col-span-2 lg:row-span-2',
        // Contain (not cover) on phones — cover-zoom was slicing the "3D SHAPE" headline
        frame: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[170%] max-sm:w-full max-sm:h-full flex items-center justify-center',
    },
    { id: 'pixel-drift', className: 'sm:col-span-2' },
    {
        id: 'twin-galaxy-rings',
        className: 'sm:col-span-2',
        // Galaxy sits in the lower half of its canvas — anchor the preview to the tile bottom.
        // On phones give the frame the demo's natural 1200px width (the host has a hard
        // minWidth:1200, so w-full just clipped it to a dark center slice) and scale the
        // whole demo down to fit the tile width so the full galaxy stays visible.
        frame: 'absolute bottom-0 left-1/2 -translate-x-1/2 w-[175%] h-[520px] max-sm:w-[1200px] max-sm:scale-[0.28] max-sm:origin-bottom flex items-center justify-center',
    },
    {
        id: 'mesh-text-hover',
        className: 'sm:col-span-2',
        // Mobile fit is handled inside MeshTextPreview (smaller canvas font) —
        // scaling this frame would shrink the canvas measurement and clip the text
        frame: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[170%] flex items-center justify-center',
    },
    {
        id: 'lizard-cursor',
        className: '',
        // Mini landing page (~400px tall) — zoom out so the whole demo fits the tile
        frame: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[175%] h-[400px] scale-[0.62] max-sm:scale-[0.55] flex items-center justify-center',
    },
    {
        id: 'point-dna-helix',
        className: 'row-span-2 lg:row-span-2',
        // Zoom into the canvas so the wrapper's edge bands never show
        frame: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[150%] flex items-center justify-center',
    },
    {
        id: 'liquid-glass',
        // Widget stack (~400px tall) needs 2 rows on phones too, or the bottom widgets get cut
        className: 'row-span-2 lg:row-span-2',
        // Widget is width-fluid — contain it fully inside the tile instead of covering
        frame: 'absolute inset-0 flex items-center justify-center p-5',
    },
    {
        id: 'perspective-carousel',
        className: 'sm:col-span-2',
        // Zoom out so the whole 3D carousel fits inside the tile
        frame: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[210%] h-[500px] scale-[0.5] flex items-center justify-center',
    },
    { id: 'wave-background', className: 'sm:col-span-2' },
    { id: 'corner-border-button', className: '' },
    { id: 'corner-button', className: '' },
    { id: 'creepy-button', className: '' },
    { id: 'radial-glow-button', className: '' },
    { id: 'spider-web', className: 'sm:col-span-2' },
];

const BentoCard = ({ spec, comp }: { spec: BentoSpec; comp: BentoComp }) => {
    const navigate = useNavigate();
    const ref = useRef<HTMLDivElement>(null);
    // Mount the live preview only when the card is near the viewport (perf)
    const inView = useInView(ref, { margin: '300px 0px 300px 0px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={() => {
                navigate(`/library?id=${comp.id}`);
                window.scrollTo(0, 0);
            }}
            className={`group relative rounded-xl border-2 border-neutral-800 bg-[#0B0B0D] overflow-hidden cursor-pointer select-none hover:border-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000000] transition-all duration-200 ${spec.className}`}
        >
            {/* Live preview — cover-fitted so it always fills the tile edge-to-edge */}
            <div className="absolute inset-0 overflow-hidden">
                {inView ? (
                    <div className={spec.frame ?? DEFAULT_FRAME}>
                        <React.Suspense
                            fallback={
                                <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                            }
                        >
                            {comp.preview()}
                        </React.Suspense>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-neutral-700 border-t-transparent rounded-full animate-spin opacity-40" />
                    </div>
                )}
            </div>

            {/* Label chip */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-sm border border-white/15 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-white">
                    {comp.title}
                </span>
                {comp.addedAt &&
                    Date.now() - new Date(comp.addedAt).getTime() < 120 * 24 * 60 * 60 * 1000 && (
                        <span className="px-1 py-px bg-[#FFC700] text-black text-[8px] font-black uppercase leading-none rounded-sm border border-black shadow-[1px_1px_0px_0px_#000000]">
                            New
                        </span>
                    )}
            </div>

            {/* Hover arrow */}
            <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-md border border-white/15 bg-black/75 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={12} className="text-white" />
            </div>

            {/* Readability gradient */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </motion.div>
    );
};

const ComponentGrid = () => {
    const { isLoading } = useSkeleton();
    const navigate = useNavigate();

    const bentoComponents = bentoSpecs
        .map(spec => ({ spec, comp: componentList.find(c => c.id === spec.id) }))
        .filter((item): item is { spec: BentoSpec; comp: BentoComp } => Boolean(item.comp));

    return (
        <section id="explore" className="relative py-24 md:py-32 px-4 sm:px-6 max-w-[1400px] mx-auto w-full bg-brand-bg">
            {/* Section Heading */}
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative z-10 text-center text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight mb-6 px-4"
            >
                {/* Badge is inline (not a flex item) so on phones it wraps WITH the
                    text instead of dropping onto its own centered line */}
                <span>
                    <span className="inline-flex items-center justify-center w-[0.85em] h-[0.85em] rounded-[22%] bg-brand-yellow border-2 border-black shadow-[3px_3px_0px_#000000] align-middle mr-3 relative -top-[0.08em]">
                        <Flame className="w-[0.55em] h-[0.55em] text-black" fill="currentColor" strokeWidth={2.5} />
                    </span>
                    Supercharge Your Projects with
                </span>
                <span className="block mt-1 sm:mt-2">
                    Ready-to-Use <span className="text-brand-blue">Components.</span>
                </span>
            </motion.h2>

            {/* Section Header — minimal live-preview ticker */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative z-10 mb-12 flex items-center justify-center gap-2.5"
            >
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-[0.25em] text-neutral-400 text-center">
                    Live previews — move your cursor around
                </span>
                <Zap size={12} className="text-brand-yellow" fill="currentColor" />
            </motion.div>

            {/* Live Bento Grid */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="grid-skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full relative z-10"
                    >
                        <ComponentGridSkeleton />
                    </motion.div>
                ) : (
                    <motion.div
                        key="grid-real"
                        initial={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[240px] gap-4 relative z-10"
                    >
                        {bentoComponents.map(({ spec, comp }) => (
                            <BentoCard key={comp.id} spec={spec} comp={comp} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile / Global CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 flex justify-center z-10 relative"
            >
                <button
                    onClick={() => navigate('/library')}
                    className="brutal-btn-primary px-10 py-4 text-xs font-black tracking-widest flex items-center gap-3"
                >
                    <span>VIEW ALL COMPONENTS</span>
                    <ArrowUpRight size={16} />
                </button>
            </motion.div>
        </section>
    );
};

export default ComponentGrid;
