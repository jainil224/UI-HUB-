import React from 'react';
import { motion } from 'motion/react';

const stats = [
    { label: "Total Components", value: "85+", suffix: "" },
    { label: "Weekly Downloads", value: "24", suffix: "K" },
    { label: "Projects Built", value: "500", suffix: "+" },
    { label: "Rendering Performance", value: "10", suffix: "X" },
];

const Stats = () => {
    return (
        <section className="relative py-20 bg-black/40 border-y border-white/5 isolate overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-green/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tighter text-white group-hover:text-brand-green transition-colors duration-500">
                                    {stat.value}
                                </span>
                                {stat.suffix && (
                                    <span className="text-xl sm:text-2xl font-display font-bold text-white/30 lowercase tracking-widest translate-y-[-2px]">
                                        {stat.suffix}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-[1px] bg-white/10 group-hover:w-12 group-hover:bg-brand-green/30 transition-all duration-500" />
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/40 group-hover:text-white/60 transition-colors">
                                    {stat.label}
                                </span>
                                <div className="w-8 h-[1px] bg-white/10 group-hover:w-12 group-hover:bg-brand-green/30 transition-all duration-500" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
