import React from 'react';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

const reports = [
    {
        quote: "Before UI HUB, I was spending hours tweaking CSS for simple animations. This library gives me the exact premium structure I need on the first try.",
        author: "SARAH J.",
        role: "CREATIVE DIRECTOR",
        color: "text-brand-green"
    },
    {
        quote: "The component logic here is basically a superpower. It turns basic prototypes into high-end, deterministic interfaces that stakeholders love.",
        author: "MARCUS T.",
        role: "LEAD DEVELOPER",
        color: "text-blue-400"
    },
    {
        quote: "Our landing pages used to feel static. Now, we get consistent premium motion across all our products because the components are airtight.",
        author: "ELENA R.",
        role: "GROWTH MARKETER",
        color: "text-purple-400"
    }
];

const Testimonials = () => {
    return (
        <section className="relative py-32 px-6 overflow-hidden bg-black">
            {/* Scanner Line Effect */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-green/20 to-transparent" />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 mb-6"
                    >
                        <span className="text-[10px] font-black text-brand-green tracking-[0.4em] uppercase">// FIELD REPORTS</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black uppercase tracking-tight text-white leading-none">
                        Engineers who demand <span className="text-white/40">precision</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reports.map((report, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: idx * 0.15 }}
                            className="relative group h-full"
                        >
                            {/* Card Glow */}
                            <div className="absolute inset-0 bg-brand-green/0 group-hover:bg-brand-green/[0.02] transition-colors duration-700 rounded-3xl -z-10" />

                            <div className="h-full p-10 rounded-3xl border border-white/5 group-hover:border-brand-green/20 transition-all duration-500 flex flex-col justify-between bg-white/[0.01] backdrop-blur-sm">
                                <div>
                                    <Quote className={`w-8 h-8 ${report.color} opacity-20 group-hover:opacity-40 mb-8 transition-all duration-500`} />
                                    <p className="text-lg text-white/60 leading-relaxed font-light mb-12 group-hover:text-white/90 transition-colors duration-500">
                                        "{report.quote}"
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-white tracking-widest">{report.author}</h4>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{report.role}</p>
                                </div>
                            </div>

                            {/* Corner Accents */}
                            <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-white/0 group-hover:border-brand-green/40 group-hover:w-16 group-hover:h-16 transition-all duration-700 rounded-tr-3xl" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-white/0 group-hover:border-brand-green/40 group-hover:w-16 group-hover:h-16 transition-all duration-700 rounded-bl-3xl" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
