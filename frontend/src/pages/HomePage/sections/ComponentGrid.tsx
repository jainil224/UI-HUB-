import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { componentList } from '../../../data/componentData';
import { ArrowUpRight, Zap } from 'lucide-react';
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
    { id: '3d-hero', className: 'sm:col-span-2 lg:row-span-2' },
    { id: 'pixel-drift', className: 'sm:col-span-2' },
    {
        id: 'twin-galaxy-rings',
        className: 'sm:col-span-2',
        // Galaxy sits in the lower half of its canvas — anchor the preview to the tile bottom
        frame: 'absolute bottom-0 left-1/2 -translate-x-1/2 w-[175%] h-[520px] flex items-center justify-center',
    },
    { id: 'mesh-text-hover', className: 'sm:col-span-2' },
    { id: 'lizard-cursor', className: '' },
    { id: 'point-dna-helix', className: 'lg:row-span-2' },
    { id: 'liquid-glass', className: 'lg:row-span-2' },
    {
        id: 'perspective-carousel',
        className: 'sm:col-span-2',
        // Zoom out so the whole 3D carousel fits inside the tile
        frame: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[210%] h-[500px] scale-[0.5] flex items-center justify-center',
    },
    { id: 'wave-background', className: 'sm:col-span-2' },
    { id: 'corner-border-button', className: '' },
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
            <div className="absolute top-3 left-3 z-20">
                <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-sm border border-white/15 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-white">
                    {comp.title}
                </span>
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
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[220px] sm:auto-rows-[240px] gap-4 relative z-10"
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
