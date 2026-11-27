import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { StaggerTestimonials } from '../../../components/ui/stagger-testimonials';

const CategoryShowcase = () => {
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
                <div className="flex justify-center mb-6 sm:mb-10 px-4">
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

                <StaggerTestimonials />

                <p className="mt-2 px-4 text-center text-[10px] font-mono font-black uppercase tracking-[0.2em] text-neutral-500">
                    tap a card or use the arrows to meet the community
                </p>
            </div>
        </section>
    );
};

export default CategoryShowcase;
