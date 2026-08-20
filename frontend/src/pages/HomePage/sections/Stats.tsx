import React from 'react';
import { motion } from 'framer-motion';

const statsData = [
    {
        value: "100+",
        label: "PREMIUM COMPONENTS"
    },
    {
        value: "98%",
        label: "AI ACCURACY RATE"
    },
    {
        value: "5K+",
        label: "PROJECTS SHIPPED"
    },
    {
        value: "10x",
        label: "FASTER DEVELOPMENT"
    },
];

const Stats = () => {
    return (
        <section className="w-full bg-[#3D5CFF] border-b-4 border-black relative select-none overflow-hidden">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {statsData.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.08 }}
                        className={`group relative flex flex-col items-center justify-center py-10 sm:py-12 md:py-14 px-6 text-center border-b-4 lg:border-b-0 border-black ${
                            idx !== 3 ? 'lg:border-r-4 border-black' : ''
                        } ${
                            idx % 2 === 0 ? 'sm:border-r-4 lg:border-r-4' : 'sm:border-r-0'
                        } ${
                            idx === 1 ? 'lg:border-r-4' : ''
                        } ${
                            idx === 2 ? 'sm:border-r-4 lg:border-r-4' : ''
                        } ${
                            idx === 3 ? 'sm:border-r-0 lg:border-r-0' : ''
                        } hover:bg-[#3452ED] transition-colors cursor-default`}
                    >
                        {/* Huge Neo-Brutalist Number */}
                        <div className="mb-2.5">
                            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight text-white leading-none uppercase select-none drop-shadow-[2px_2px_0px_#000000]">
                                {stat.value}
                            </span>
                        </div>

                        {/* Subtitle Caption */}
                        <p className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-white/90 max-w-[220px] leading-tight select-none font-mono">
                            {stat.label}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Stats;
